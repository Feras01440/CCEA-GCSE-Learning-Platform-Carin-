#!/usr/bin/env node
/**
 * QA crawl of the static export.
 *
 * Renders every published topic page (src/generated/manifest.json) in headless Chromium against a served
 * copy of out/, clicks "Skip to practice" when the page has a "Check yourself" section (nothing is gated behind
 * it, and a page without one is normal), and records per page:
 *   - console errors and page errors (message text, with the source URL for resource failures)
 *   - failed requests and HTTP >= 400 responses
 *   - .katex-error elements (count + first 3 texts) — a KaTeX render that fell back to red source
 *   - visible text nodes inside <main> containing "$" (first 3, 60 chars of context) — leaked delimiters,
 *     flagged separately when the "$" was rendered by KaTeX itself (a deliberate currency sign)
 *   - <img> elements whose naturalWidth is 0 (src, and the HTTP status we saw for it)
 *   - the number of <article> elements (the note is one article; every question is one) against the
 *     manifest's question count
 *   - elements whose text is exactly "This answer type is not marked automatically yet."
 *
 * Usage:
 *   npx serve out -l 3200            # in another terminal
 *   node scripts/qa/crawl-export.mjs [--base=http://localhost:3200] [--concurrency=3] [--sw=block|allow]
 *                                    [--only=<substring of id/url>] [--out=docs/dev/qa/crawl-export.md]
 *                                    [--json=<path>] [--timeout=45000]
 *
 * The service worker is blocked by default: its install precaches hundreds of files, which would swamp the
 * network-idle wait and hide the behaviour of a plain first visit. Pass --sw=allow to crawl with it on.
 *
 * Nothing under src/, app/, packs/, public/ or e2e/ is touched; the only output is the report file(s).
 */
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? "true"] : [a, "true"];
  }),
);
const BASE = (args.base ?? "http://localhost:3200").replace(/\/$/, "");
const CONCURRENCY = Math.max(1, Number(args.concurrency ?? 3) || 3);
const SW = args.sw === "allow" ? "allow" : "block";
const ONLY = args.only ?? null;
const OUT = path.resolve(ROOT, args.out ?? "docs/dev/qa/crawl-export.md");
const JSON_OUT = args.json ? path.resolve(ROOT, args.json) : null;
const NAV_TIMEOUT = Number(args.timeout ?? 45000) || 45000;

const NOT_MARKED = "This answer type is not marked automatically yet.";
const SKIP_LABEL = "Skip to practice";

// ---------------------------------------------------------------------------------------------------------
// Manifest + server sanity checks
// ---------------------------------------------------------------------------------------------------------

const manifestPath = path.join(ROOT, "src", "generated", "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!Array.isArray(manifest.topics) || manifest.topics.length === 0) {
  console.error(`manifest has no topics array: ${manifestPath}`);
  process.exit(2);
}
let topics = manifest.topics.filter((t) => t.subject && t.unit && t.slug);
if (topics.length !== manifest.topics.length) {
  console.error(`warning: ${manifest.topics.length - topics.length} manifest entries lack subject/unit/slug and were skipped`);
}
// What the served site publishes is the manifest compiled into its JS: `next build` inlines
// src/generated/manifest.json as JSON.parse('…') in a chunk. The manifest on disk is rewritten by every content
// build and can run ahead of or behind the export, so the crawl set is pinned to the baked manifest and the two are
// compared in the report. If no baked manifest can be found, the disk manifest filtered to topics that have a
// bundle in out/content is used instead.
const OUT_DIR = path.join(ROOT, "out");
const CHUNKS_DIR = path.join(OUT_DIR, "_next", "static", "chunks");

function readBakedManifest() {
  let files;
  try {
    files = readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".js"));
  } catch {
    return null;
  }
  for (const f of files) {
    const s = readFileSync(path.join(CHUNKS_DIR, f), "utf8");
    const at = s.indexOf('"generatedAt":"');
    if (at < 0) continue;
    const open = s.lastIndexOf("JSON.parse('", at);
    if (open < 0 || at - open > 40) continue;
    // Copy the single-quoted JS string literal verbatim (escapes included), then let the engine decode it.
    let literal = "";
    for (let i = open + "JSON.parse('".length; i < s.length; i++) {
      const ch = s[i];
      if (ch === "\\") {
        literal += ch + s[i + 1];
        i++;
        continue;
      }
      if (ch === "'") break;
      literal += ch;
    }
    try {
      const parsed = JSON.parse(new Function(`return '${literal}'`)());
      if (Array.isArray(parsed.topics)) return { generatedAt: parsed.generatedAt ?? null, topics: parsed.topics, chunk: f };
    } catch {
      // not the manifest; keep looking
    }
  }
  return null;
}

const baked = readBakedManifest();
const bundleOf = (t) => path.join(OUT_DIR, "content", t.subject, `${t.id}.json`);
const exportBundles = [];
try {
  for (const subject of readdirSync(path.join(OUT_DIR, "content"))) {
    for (const f of readdirSync(path.join(OUT_DIR, "content", subject))) {
      if (f.endsWith(".json")) exportBundles.push({ subject, id: f.slice(0, -5) });
    }
  }
} catch {
  // no out/content at all: every crawled page will show the error copy, which the report records
}
const diskIds = new Set(manifest.topics.map((t) => t.id));
let crawlSource;
if (baked) {
  topics = baked.topics.filter((t) => t.subject && t.unit && t.slug);
  crawlSource = `manifest baked into out/_next/static/chunks/${baked.chunk}`;
} else {
  topics = topics.filter((t) => existsSync(bundleOf(t)));
  crawlSource = "src/generated/manifest.json filtered to topics with a bundle in out/content (no baked manifest found)";
}
const crawlIds = new Set(topics.map((t) => t.id));
const bundleIds = new Set(exportBundles.map((b) => b.id));
const exportFacts = {
  crawlSource,
  bakedGeneratedAt: baked?.generatedAt ?? null,
  bakedCount: baked?.topics.length ?? null,
  // on disk but not published in the served export
  diskOnly: manifest.topics.filter((t) => !crawlIds.has(t.id)).map((t) => t.id),
  // published in the served export but no longer in the manifest on disk
  bakedOnly: topics.filter((t) => !diskIds.has(t.id)).map((t) => t.id),
  // shipped bundle that no published page uses
  bundleOnly: exportBundles.filter((b) => !crawlIds.has(b.id)).map((b) => `${b.subject}/${b.id}`),
  // published page whose bundle is missing (the page shows the error copy)
  missingBundle: topics.filter((t) => !bundleIds.has(t.id)).map((t) => t.id),
};
const swVersion = () => {
  try {
    return readFileSync(path.join(OUT_DIR, "sw.js"), "utf8").match(/const VERSION = "([^"]+)"/)?.[1] ?? null;
  } catch {
    return null;
  }
};
const swVersionAtStart = swVersion();

if (ONLY) topics = topics.filter((t) => `${t.id} /learn/${t.subject}/${t.unit}/${t.slug}/`.includes(ONLY));
if (topics.length === 0) {
  console.error(ONLY ? `no topics match --only=${ONLY}` : "no manifest topic has a bundle in out/content — is out/ a finished export?");
  process.exit(2);
}

try {
  const r = await fetch(`${BASE}/`, { method: "GET" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.error(`Nothing is serving the export at ${BASE} (${e?.message ?? e}). Start it with: npx serve out -l 3200`);
  process.exit(2);
}

// ---------------------------------------------------------------------------------------------------------
// In-page collector (runs inside the browser; keep it self-contained)
// ---------------------------------------------------------------------------------------------------------

function collectInPage({ NOT_MARKED }) {
  const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
  const main = document.querySelector("main") ?? document.body;

  const isVisible = (el) => {
    if (!el) return false;
    // KaTeX's MathML branch is clipped off-screen for screen readers only; it carries the raw TeX source.
    if (el.closest(".katex-mathml, script, style, noscript, template, .sr-only")) return false;
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true });
    }
    const cs = getComputedStyle(el);
    return cs.display !== "none" && cs.visibility !== "hidden" && el.getClientRects().length > 0;
  };

  // KaTeX failures
  const katexErrorEls = [...document.querySelectorAll(".katex-error")];
  const katexErrors = katexErrorEls.slice(0, 3).map((el) => {
    const title = el.getAttribute("title");
    return norm((title ? `${title} · ` : "") + el.textContent).slice(0, 200);
  });
  const katexCount = document.querySelectorAll(".katex").length;
  let katexStyled = null;
  if (katexCount > 0) {
    const ff = getComputedStyle(document.querySelector(".katex")).fontFamily;
    katexStyled = /katex/i.test(ff);
  }

  // Visible "$" text nodes inside <main>
  const dollarTexts = [];
  let dollarCount = 0;
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue;
    if (!text || !text.includes("$")) continue;
    const parent = n.parentElement;
    if (!isVisible(parent)) continue;
    dollarCount++;
    if (dollarTexts.length < 3) {
      const whole = norm(parent.textContent);
      const i = Math.max(0, whole.indexOf("$"));
      const context = whole.slice(Math.max(0, i - 30), i + 30);
      dollarTexts.push({
        context,
        inKatex: !!parent.closest(".katex"),
        tag: parent.tagName.toLowerCase(),
      });
    }
  }

  // Images
  const imgs = [...document.images];
  const brokenImages = imgs
    .filter((i) => i.complete && i.naturalWidth === 0)
    .map((i) => ({ src: i.currentSrc || i.src, alt: i.alt ?? "", inMain: main.contains(i) }));
  const pendingImages = imgs.filter((i) => !i.complete).length;

  // Articles
  const articles = document.querySelectorAll("article").length;
  const noteArticles = document.querySelectorAll('article[aria-label="Note"]').length;

  // Exact-text notice
  const notMarkedCount = [...main.querySelectorAll("*")].filter((el) => el.children.length === 0 && norm(el.textContent) === NOT_MARKED).length;

  const mainText = norm(main.innerText);
  return {
    h1: norm(document.querySelector("h1")?.textContent ?? ""),
    mainChars: mainText.length,
    contentError: /Could not load this topic/.test(mainText),
    checkDone: /Check done\./.test(mainText),
    katexCount,
    katexStyled,
    katexErrorCount: katexErrorEls.length,
    katexErrors,
    dollarCount,
    dollarTexts,
    imageCount: imgs.length,
    svgCount: main.querySelectorAll("svg").length,
    brokenImages,
    pendingImages,
    articles,
    noteArticles,
    questionArticles: articles - noteArticles,
    notMarkedCount,
  };
}

// ---------------------------------------------------------------------------------------------------------
// Crawl one topic page in its own browser context
// ---------------------------------------------------------------------------------------------------------

async function crawl(browser, t) {
  const pagePath = `/learn/${t.subject}/${t.unit}/${t.slug}/`;
  const url = `${BASE}${pagePath}`;
  const rec = {
    id: t.id,
    subject: t.subject,
    unit: t.unit,
    slug: t.slug,
    title: t.title,
    path: pagePath,
    url,
    expectedQuestions: t.counts?.q ?? null,
    status: null,
    loadError: null,
    hasCheck: false,
    skipped: false,
    consoleErrors: [],
    pageErrors: [],
    requestFailures: [],
    abortedPrefetches: [],
    httpErrors: [],
    ms: 0,
  };
  const responses = new Map(); // url -> status, so a broken <img> can be paired with what the server said
  const started = Date.now();
  const context = await browser.newContext({ serviceWorkers: SW, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT);

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const loc = msg.location();
    const where = loc?.url ? `  [${loc.url}${loc.lineNumber != null ? `:${loc.lineNumber}` : ""}]` : "";
    rec.consoleErrors.push(msg.text() + where);
  });
  page.on("pageerror", (err) => rec.pageErrors.push(String(err?.message ?? err)));
  page.on("requestfailed", (req) => {
    const errorText = req.failure()?.errorText ?? "failed";
    const line = `${req.method()} ${req.url()} — ${errorText}`;
    // Next's router probes a link target with HEAD before prefetching its RSC payload, and aborts the probe when
    // the link leaves the viewport or the page closes. Those aborts are router housekeeping, not page faults.
    if (req.method() === "HEAD" && /ERR_ABORTED/.test(errorText)) rec.abortedPrefetches.push(line);
    else rec.requestFailures.push(line);
  });
  page.on("response", (res) => {
    responses.set(res.url(), res.status());
    if (res.status() >= 400) rec.httpErrors.push(`${res.status()} ${res.url()}`);
  });

  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: NAV_TIMEOUT });
    rec.status = res?.status() ?? null;

    // The bundle is fetched client-side; wait until it has rendered (an article) or failed (error copy).
    await page
      .waitForFunction(
        () => document.querySelector("main article") || /Could not load this topic/.test(document.querySelector("main")?.textContent ?? ""),
        null,
        { timeout: 20000 },
      )
      .catch(() => {
        rec.renderTimeout = true;
      });

    // "Check yourself" comes after the lesson and the examples and gates nothing, so a page without it is normal.
    // Skipping it swaps the check item for its "Check done." line; the rest of the page is inspected as a learner
    // who went straight to practice would see it.
    const skip = page.locator("button", { hasText: SKIP_LABEL });
    if ((await skip.count()) > 0) {
      rec.hasCheck = true;
      await skip.first().click();
      await page
        .getByText("Check done.")
        .first()
        .waitFor({ state: "visible", timeout: 5000 })
        .catch(() => {});
      rec.skipped = true;
      await page.waitForLoadState("networkidle");
    }

    // Scroll through the page so lazy images and any in-view work run, then let images settle.
    await page.evaluate(async () => {
      const step = Math.max(400, window.innerHeight);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});

    Object.assign(rec, await page.evaluate(collectInPage, { NOT_MARKED }));
    for (const img of rec.brokenImages) {
      img.httpStatus = responses.get(img.src) ?? null;
    }
  } catch (e) {
    rec.loadError = String(e?.message ?? e).split("\n")[0];
  } finally {
    rec.ms = Date.now() - started;
    await context.close();
  }
  return rec;
}

// ---------------------------------------------------------------------------------------------------------
// Problem classification + report
// ---------------------------------------------------------------------------------------------------------

function problemsOf(r) {
  const p = [];
  if (r.loadError) p.push(`load error: ${r.loadError}`);
  if (r.status != null && r.status >= 400) p.push(`page responded ${r.status}`);
  if (r.contentError) p.push("page shows “Could not load this topic’s content.”");
  if (r.renderTimeout && !r.contentError) p.push("content did not render within 20 s");
  if (r.hasCheck && !r.skipped) p.push("check present but could not be skipped");
  if (r.hasCheck && r.skipped && r.checkDone === false) p.push("skip clicked but “Check done.” never appeared");
  if (r.consoleErrors.length) p.push(`${r.consoleErrors.length} console error(s)`);
  if (r.pageErrors.length) p.push(`${r.pageErrors.length} page error(s)`);
  if (r.requestFailures.length) p.push(`${r.requestFailures.length} failed request(s)`);
  if (r.httpErrors.length) p.push(`${r.httpErrors.length} HTTP >= 400 response(s)`);
  if (r.katexErrorCount) p.push(`${r.katexErrorCount} .katex-error`);
  if (r.katexStyled === false) p.push("KaTeX CSS not applied (.katex has no KaTeX font)");
  if (r.dollarCount) p.push(`${r.dollarCount} visible “$” text node(s)`);
  if (r.brokenImages?.length) p.push(`${r.brokenImages.length} broken <img>`);
  if (r.pendingImages) p.push(`${r.pendingImages} <img> still loading`);
  if (!r.loadError && r.articles === 0) p.push("no <article> elements");
  if (!r.loadError && r.expectedQuestions != null && r.questionArticles !== r.expectedQuestions) {
    p.push(`question articles ${r.questionArticles} ≠ manifest q ${r.expectedQuestions}`);
  }
  if (r.notMarkedCount) p.push(`${r.notMarkedCount} × “${NOT_MARKED}”`);
  return p;
}

const cell = (s) =>
  String(s ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .replace(/`/g, "'");
const code = (s) => `\`${cell(s)}\``;
const clip = (s, n = 600) => (s.length > n ? `${s.slice(0, n)}… (+${s.length - n} chars)` : s);

function buildReport(results, meta) {
  const withProblems = results.map((r) => ({ r, problems: problemsOf(r) })).filter((x) => x.problems.length > 0);
  const lines = [];
  lines.push(`# Export crawl — ${meta.date}`);
  lines.push("");
  lines.push(
    `Base ${meta.base} · manifest \`src/generated/manifest.json\` (${meta.manifestCount} topics, generated ${meta.generatedAt}) · ` +
      `${results.length} page(s) crawled · concurrency ${meta.concurrency} · service worker ${meta.sw}ed · ${meta.browser} · ${meta.seconds} s`,
  );
  lines.push("");
  lines.push("Rerun: `npx serve out -l 3200` then `node scripts/qa/crawl-export.mjs` (see the header of the script for flags).");
  lines.push("");
  lines.push("## Manifest vs export");
  lines.push("");
  const x = meta.exportFacts;
  const ids = (a) => a.map((id) => `\`${id}\``).join(", ");
  lines.push(`- Crawl set: ${x.crawlSource}${x.bakedCount != null ? ` — ${x.bakedCount} topics, generated ${x.bakedGeneratedAt}` : ""}.`);
  lines.push(`- \`src/generated/manifest.json\` on disk: ${meta.manifestCount} topics, generated ${meta.generatedAt}.`);
  if (x.diskOnly.length) lines.push(`- On disk but not published in the served export (not crawled): ${ids(x.diskOnly)}.`);
  if (x.bakedOnly.length) lines.push(`- Published in the served export but no longer in the manifest on disk (crawled): ${ids(x.bakedOnly)}.`);
  if (x.bundleOnly.length) lines.push(`- Bundles in \`out/content\` that no published page uses: ${ids(x.bundleOnly)}.`);
  if (x.missingBundle.length) lines.push(`- **Published pages whose bundle is missing from \`out/content\`** (they show the error copy): ${ids(x.missingBundle)}.`);
  if (!x.diskOnly.length && !x.bakedOnly.length && !x.bundleOnly.length && !x.missingBundle.length) {
    lines.push("- The manifest on disk, the baked manifest and the shipped bundles agree.");
  }
  if (meta.swVersionAtStart !== meta.swVersionAtEnd) {
    lines.push(`- **The export was rebuilt during the crawl** (sw.js version ${meta.swVersionAtStart} → ${meta.swVersionAtEnd}); results may mix two builds — rerun.`);
  } else {
    lines.push(`- Export build stamp (sw.js version): ${meta.swVersionAtStart ?? "unknown"}, unchanged during the crawl.`);
  }
  lines.push("");
  lines.push(`## Pages with problems (${withProblems.length} of ${results.length})`);
  lines.push("");
  if (withProblems.length === 0) {
    lines.push("None — every page rendered with no console or page errors, no KaTeX errors, no visible “$”, no broken images, and the expected number of articles.");
  } else {
    lines.push("| Page | Console / page errors | KaTeX errors | “$” in visible text | Broken images | Articles (note + questions; manifest q) | Not marked | Notes |");
    lines.push("|---|---|---|---|---|---|---|---|");
    for (const { r, problems } of withProblems) {
      const errs = [
        ...r.consoleErrors.map((e) => `console: ${code(clip(e))}`),
        ...r.pageErrors.map((e) => `pageerror: ${code(clip(e))}`),
        ...r.requestFailures.map((e) => `requestfailed: ${code(clip(e))}`),
        ...r.httpErrors.map((e) => `http: ${code(clip(e))}`),
      ];
      const katex = r.katexErrorCount ? `${r.katexErrorCount}: ${r.katexErrors.map(code).join("; ")}` : "0";
      const dollars = r.dollarCount
        ? `${r.dollarCount}: ${r.dollarTexts.map((d) => `${code(d.context)}${d.inKatex ? " (rendered by KaTeX)" : ` (<${d.tag}>)`}`).join("; ")}`
        : "0";
      const imgs = r.brokenImages?.length
        ? r.brokenImages.map((i) => `${code(i.src)}${i.httpStatus != null ? ` HTTP ${i.httpStatus}` : ""}`).join("; ")
        : "0";
      const arts = r.loadError ? "—" : `${r.articles} (${r.noteArticles} + ${r.questionArticles}; q ${r.expectedQuestions ?? "?"})`;
      const notes = problems.filter((p) => !/console error|page error|failed request|HTTP >= 400|katex-error|“\$”|broken <img>|×/.test(p));
      lines.push(
        `| [${r.path}](${r.url}) | ${errs.length ? errs.join("<br>") : "0"} | ${katex} | ${dollars} | ${imgs} | ${arts} | ${r.notMarkedCount ?? "—"} | ${cell(notes.join("; ")) || ""} |`,
      );
    }
  }
  lines.push("");

  // Totals
  const sum = (f) => results.reduce((a, r) => a + (f(r) || 0), 0);
  const pagesWith = (f) => results.filter((r) => f(r)).length;
  const loadFailures = results.filter((r) => r.loadError);
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Pages crawled: ${results.length} (${results.length - loadFailures.length} loaded, ${loadFailures.length} failed to load)`);
  lines.push(`- Pages with problems: ${withProblems.length}; clean: ${results.length - withProblems.length}`);
  lines.push(`- Console errors: ${sum((r) => r.consoleErrors.length)} on ${pagesWith((r) => r.consoleErrors.length)} page(s)`);
  lines.push(`- Page errors: ${sum((r) => r.pageErrors.length)} on ${pagesWith((r) => r.pageErrors.length)} page(s)`);
  lines.push(`- Failed requests: ${sum((r) => r.requestFailures.length)}; HTTP >= 400 responses: ${sum((r) => r.httpErrors.length)}`);
  lines.push(
    `- Aborted Next prefetch probes (HEAD + net::ERR_ABORTED, router housekeeping, not counted as problems): ` +
      `${sum((r) => r.abortedPrefetches.length)} on ${pagesWith((r) => r.abortedPrefetches.length)} page(s)`,
  );
  lines.push(`- KaTeX errors (.katex-error): ${sum((r) => r.katexErrorCount)} on ${pagesWith((r) => r.katexErrorCount)} page(s); .katex renders seen: ${sum((r) => r.katexCount)}`);
  lines.push(
    `- Visible “$” text nodes in main: ${sum((r) => r.dollarCount)} on ${pagesWith((r) => r.dollarCount)} page(s)` +
      ` (${results.reduce((a, r) => a + (r.dollarTexts ?? []).filter((d) => d.inKatex).length, 0)} of the sampled ones rendered by KaTeX)`,
  );
  lines.push(`- Broken <img> (naturalWidth 0): ${sum((r) => r.brokenImages?.length)} on ${pagesWith((r) => r.brokenImages?.length)} page(s); <img> total ${sum((r) => r.imageCount)}, inline <svg> in main ${sum((r) => r.svgCount)}`);
  const loaded = results.filter((r) => !r.loadError);
  const artCounts = loaded.map((r) => r.articles);
  lines.push(
    `- <article> elements: ${sum((r) => r.articles)} total (${sum((r) => r.noteArticles)} note + ${sum((r) => r.questionArticles)} question)` +
      (artCounts.length ? `, per page min ${Math.min(...artCounts)} / max ${Math.max(...artCounts)}` : "") +
      `; pages where question articles ≠ manifest q: ${pagesWith((r) => !r.loadError && r.expectedQuestions != null && r.questionArticles !== r.expectedQuestions)}`,
  );
  lines.push(`- “${NOT_MARKED}”: ${sum((r) => r.notMarkedCount)} on ${pagesWith((r) => r.notMarkedCount)} page(s)`);
  lines.push(`- Check: present and skipped on ${pagesWith((r) => r.hasCheck && r.skipped)} page(s); absent on ${pagesWith((r) => !r.hasCheck && !r.loadError)}; present but not skipped on ${pagesWith((r) => r.hasCheck && !r.skipped)}`);
  const times = results.map((r) => r.ms);
  lines.push(`- Time per page: median ${median(times)} ms, max ${Math.max(...times)} ms`);
  lines.push("");

  // Distinct console/page error messages across the crawl
  const distinct = new Map();
  for (const r of results) {
    for (const [kind, list] of [
      ["console", r.consoleErrors],
      ["pageerror", r.pageErrors],
      ["requestfailed", r.requestFailures],
    ]) {
      for (const m of list) {
        const key = `${kind}: ${m}`;
        const cur = distinct.get(key) ?? { count: 0, pages: new Set() };
        cur.count++;
        cur.pages.add(r.path);
        distinct.set(key, cur);
      }
    }
  }
  if (distinct.size) {
    lines.push("### Distinct error messages");
    lines.push("");
    lines.push("| Count | Pages | Message |");
    lines.push("|---|---|---|");
    for (const [msg, { count, pages }] of [...distinct.entries()].sort((a, b) => b[1].count - a[1].count)) {
      lines.push(`| ${count} | ${pages.size} | ${code(clip(msg))} |`);
    }
    lines.push("");
  }

  lines.push("## Method");
  lines.push("");
  lines.push(
    "Each page opens in a fresh Chromium context (no stored learner data). After `networkidle`, the crawler waits up to 20 s for the " +
      "client-fetched bundle to render an `<article>` (or the error copy), clicks the “Skip to practice” button when present, scrolls the " +
      "full page so lazy images load, waits for `networkidle` again and for every `<img>` to report `complete`, then inspects the DOM. " +
      "A visible “$” rendered inside a `.katex` element is a deliberate currency sign; one in plain text is a likely leaked delimiter. " +
      "The KaTeX MathML branch (clipped off-screen, carries raw TeX) is excluded from the “$” scan.",
  );
  lines.push("");
  return lines.join("\n");
}

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

// ---------------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------------

const t0 = Date.now();
const browser = await chromium.launch();
const browserLabel = `Chromium ${browser.version()}`;
console.log(
  `Crawling ${topics.length} topic page(s) at ${BASE} with concurrency ${CONCURRENCY}, service worker ${SW}ed, ${browserLabel}` +
    `\n  crawl set: ${exportFacts.crawlSource}${exportFacts.bakedCount != null ? ` (${exportFacts.bakedCount} topics, generated ${exportFacts.bakedGeneratedAt})` : ""}` +
    `\n  manifest on disk: ${manifest.topics.length} topics, generated ${manifest.generatedAt}` +
    (exportFacts.diskOnly.length ? `\n  on disk but not published in the export (not crawled): ${exportFacts.diskOnly.join(", ")}` : "") +
    (exportFacts.bakedOnly.length ? `\n  published in the export but not on disk: ${exportFacts.bakedOnly.join(", ")}` : "") +
    (exportFacts.bundleOnly.length ? `\n  bundles no published page uses: ${exportFacts.bundleOnly.join(", ")}` : "") +
    (exportFacts.missingBundle.length ? `\n  published pages with no bundle: ${exportFacts.missingBundle.join(", ")}` : ""),
);

const queue = topics.map((t, i) => ({ t, i }));
const results = new Array(topics.length);
let done = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const { t, i } = queue.shift();
      const r = await crawl(browser, t);
      results[i] = r;
      done++;
      const probs = problemsOf(r);
      console.log(`${String(done).padStart(3)}/${topics.length} ${probs.length ? "PROBLEM" : "ok     "} ${r.path} (${r.ms} ms)${probs.length ? " — " + probs.join("; ") : ""}`);
    }
  }),
);
await browser.close();

const seconds = Math.round((Date.now() - t0) / 1000);
const report = buildReport(results, {
  date: new Date().toISOString(),
  base: BASE,
  manifestCount: manifest.topics.length,
  generatedAt: manifest.generatedAt ?? "?",
  concurrency: CONCURRENCY,
  sw: SW,
  browser: browserLabel,
  seconds,
  exportFacts,
  swVersionAtStart,
  swVersionAtEnd: swVersion(),
});
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, report, "utf8");
if (JSON_OUT) {
  mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  writeFileSync(JSON_OUT, JSON.stringify({ meta: { base: BASE, date: new Date().toISOString(), sw: SW }, results }, null, 2), "utf8");
}

const problemPages = results.filter((r) => problemsOf(r).length > 0).length;
console.log(`\nDone in ${seconds} s: ${results.length} pages, ${problemPages} with problems. Report: ${path.relative(ROOT, OUT)}${JSON_OUT ? `, JSON: ${path.relative(ROOT, JSON_OUT)}` : ""}`);
process.exit(problemPages ? 1 : 0);
