// Markdown for a GitHub job summary ($GITHUB_STEP_SUMMARY), from the JSON the tools already write. No dependencies,
// so a job can run it without npm ci.
//
//   node .github/scripts/summary.mjs e2e <playwright results.json>
//       one row per spec file (passed, failed, flaky, skipped), then the failing tests with their first error line
//   node .github/scripts/summary.mjs lighthouse <.lighthouseci/reports dir> [<.lighthouseci dir>]
//       one row per page (performance, accessibility, total transfer) and every assertion that did not pass
//   node .github/scripts/summary.mjs nightly <unit-health.json> [<playwright results.json>]
//       one line per unit: topics · v3.1 · structure-pass · reviewed · lint warnings · specs green
//
// A missing or unreadable input is said in the output, never filled in.
import fs from "node:fs";
import path from "node:path";

const [mode, ...files] = process.argv.slice(2);

function readJson(file) {
  if (!file || !fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const seconds = (ms) => (ms >= 60_000 ? `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s` : `${(ms / 1000).toFixed(1)}s`);

/** Every test in a Playwright JSON report, with its file, title path, project, status and first error line. */
function playwrightTests(report) {
  const out = [];
  const walk = (suite, file, titles) => {
    const f = suite.file || file;
    const t = suite.title && suite.title !== f && suite.title !== path.basename(f || "") ? [...titles, suite.title] : titles;
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const results = test.results ?? [];
        const err = results.map((r) => r.error?.message ?? r.errors?.[0]?.message).find(Boolean) ?? "";
        out.push({
          file: spec.file || f,
          title: [...t, spec.title].join(" › "),
          project: test.projectName ?? "",
          status: test.status ?? (spec.ok ? "expected" : "unexpected"),
          duration: results.reduce((a, r) => a + (r.duration ?? 0), 0),
          error: String(err).replace(/\u001b\[[0-9;]*m/g, "").split("\n").find((l) => l.trim()) ?? "",
        });
      }
    }
    for (const s of suite.suites ?? []) walk(s, f, t);
  };
  for (const s of report?.suites ?? []) walk(s, s.file, []);
  return out;
}

function byFile(tests) {
  const files = new Map();
  for (const t of tests) {
    const f = files.get(t.file) ?? { file: t.file, passed: 0, failed: 0, flaky: 0, skipped: 0, duration: 0 };
    if (t.status === "expected") f.passed += 1;
    else if (t.status === "unexpected") f.failed += 1;
    else if (t.status === "flaky") f.flaky += 1;
    else f.skipped += 1;
    f.duration += t.duration;
    files.set(t.file, f);
  }
  return [...files.values()].sort((a, b) => a.file.localeCompare(b.file));
}

function e2e(file) {
  const report = readJson(file);
  if (!report) return `### Playwright\n\nNo report at \`${file}\` (the shards did not finish, or the merge failed).\n`;
  const tests = playwrightTests(report);
  const files = byFile(tests);
  const green = files.filter((f) => f.failed === 0).length;
  const lines = [`### Playwright: ${green} of ${files.length} spec files green`, ""];
  lines.push(`${tests.filter((t) => t.status === "expected").length} passed, ${tests.filter((t) => t.status === "unexpected").length} failed, ${tests.filter((t) => t.status === "flaky").length} flaky (passed on retry), ${tests.filter((t) => t.status === "skipped").length} skipped. Times are test time summed over the shards.`, "");
  lines.push("| spec file | passed | failed | flaky | skipped | time |", "|---|---:|---:|---:|---:|---:|");
  for (const f of files) lines.push(`| ${cell(f.file)}${f.failed ? " **(red)**" : ""} | ${f.passed} | ${f.failed} | ${f.flaky} | ${f.skipped} | ${seconds(f.duration)} |`);
  const failing = tests.filter((t) => t.status === "unexpected");
  if (failing.length) {
    lines.push("", `#### Failing (${failing.length}); traces are in the playwright-report artifact (open index.html, or npx playwright show-trace <trace.zip>)`, "");
    for (const t of failing.slice(0, 40)) lines.push(`- \`${cell(t.file)}\` ${cell(t.title)} [${cell(t.project)}]: ${cell(t.error.slice(0, 200))}`);
    if (failing.length > 40) lines.push(`- … and ${failing.length - 40} more in the report`);
  }
  return `${lines.join("\n")}\n`;
}

function lighthouse(reportsDir, lhciDir) {
  const dir = lhciDir ?? path.dirname(reportsDir ?? ".");
  const pct = (v) => (typeof v === "number" ? Math.round(v * 100) : "?");
  const kb = (lhr) => {
    const bytes = lhr?.audits?.["total-byte-weight"]?.numericValue;
    return typeof bytes === "number" ? `${Math.round(bytes / 1024)} KB` : "?";
  };
  const manifest = readJson(path.join(reportsDir ?? "", "manifest.json"));
  const lines = [];
  if (Array.isArray(manifest)) {
    lines.push("### Lighthouse (phone profile, the median of 3 runs)", "", "| page | performance | accessibility | total transfer |", "|---|---:|---:|---:|");
    for (const run of manifest.filter((r) => r.isRepresentativeRun)) {
      const lhr = readJson(run.jsonPath && fs.existsSync(run.jsonPath) ? run.jsonPath : path.join(reportsDir, path.basename(run.jsonPath ?? "")));
      lines.push(`| ${cell(new URL(run.url).pathname)} | ${pct(run.summary?.performance)} | ${pct(run.summary?.accessibility)} | ${kb(lhr)} |`);
    }
  } else {
    // No upload manifest (the upload step did not run): every collected run, as Lighthouse wrote it.
    const lhrs = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f)).map((f) => readJson(path.join(dir, f))).filter(Boolean) : [];
    if (!lhrs.length) return `### Lighthouse\n\nNo Lighthouse results in \`${dir}\` (the collect step did not finish).\n`;
    lines.push("### Lighthouse (phone profile, every run)", "", "| page | performance | accessibility | total transfer |", "|---|---:|---:|---:|");
    for (const lhr of lhrs) lines.push(`| ${cell(new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl ?? lhr.requestedUrl).pathname)} | ${pct(lhr.categories?.performance?.score)} | ${pct(lhr.categories?.accessibility?.score)} | ${kb(lhr)} |`);
  }
  const assertions = readJson(path.join(dir, "assertion-results.json"));
  if (Array.isArray(assertions)) {
    const failed = assertions.filter((a) => !a.passed);
    lines.push("", failed.length ? `#### ${failed.length} budget(s) not met` : "All budgets met (.github/lighthouse/lighthouserc.yml).");
    for (const a of failed) lines.push(`- ${a.level === "error" ? "error" : "warning"}: ${cell(a.url ? new URL(a.url).pathname : "?")}: ${cell(a.auditId ?? a.name)} ${cell(a.name)} expected ${a.operator ?? ""} ${a.expected}, measured ${typeof a.actual === "number" ? Math.round(a.actual * 1000) / 1000 : a.actual}`);
  }
  return `${lines.join("\n")}\n`;
}

/** Tests credited to a unit: a test whose file or title names the unit's code, or one of its topics' slugs. */
function unitSpecs(unit, tests) {
  const code = unit.unit;
  const codeRe = new RegExp(`(^|[^A-Za-z0-9])${code}([^A-Za-z0-9]|$)${code === "U7" ? "|unit ?7" : ""}`, "i");
  const slugs = unit.slugs ?? [];
  return tests.filter((t) => codeRe.test(`${t.file} ${t.title}`) || slugs.some((s) => t.title.includes(s)));
}

function nightly(healthFile, e2eFile) {
  const health = readJson(healthFile);
  const report = readJson(e2eFile);
  const tests = report ? playwrightTests(report) : null;
  const lines = ["### Units", ""];
  if (!health) return `${lines.join("\n")}No unit health at \`${healthFile}\` (the lints job did not finish).\n`;
  if (tests) {
    const files = byFile(tests);
    lines.push(`Specs: ${files.filter((f) => f.failed === 0).length} of ${files.length} spec files green; ${tests.filter((t) => t.status === "expected").length} passed, ${tests.filter((t) => t.status === "unexpected").length} failed, ${tests.filter((t) => t.status === "flaky").length} flaky, ${tests.filter((t) => t.status === "skipped").length} skipped.`, "");
  } else lines.push("Specs: no Playwright report (the suite did not finish).", "");
  lines.push(`Readiness policy: ${health.readinessPolicy ?? "?"}. Lints read: lesson-v2 ${health.sources?.lessonV2 ? "yes" : "NO"}, figure-leaks ${health.sources?.figureLeaks ? "yes" : "NO"}.`, "");
  lines.push("| unit | topics | v3.1 | structure-pass | reviewed | ready | lint warnings | specs green |", "|---|---:|---:|---:|---:|---|---|---|");
  for (const u of health.units) {
    const lints = Object.entries(u.lints ?? {}).map(([k, n]) => `${k} ${n}`).join(", ");
    let specs = "no report";
    if (tests) {
      const mine = unitSpecs(u, tests);
      const failed = mine.filter((t) => t.status === "unexpected").length;
      specs = mine.length ? `${mine.length - failed} of ${mine.length} naming the unit${failed ? " **(red)**" : ""}` : "none name the unit";
    }
    const via = Object.entries(u.readyVia ?? {}).map(([k, n]) => `${k} ${n}`).join(", ");
    lines.push(`| ${u.unit} | ${u.topics} | ${u.v31} | ${u.structurePass} | ${u.reviewed} | ${u.ready}${via ? ` (${via})` : ""} | ${u.lintTotal}${lints ? ` (${lints})` : ""} | ${specs} |`);
  }
  lines.push(
    "",
    "v3.1: notes with a See it whose inline See its all name their kind and whose choice gates note every wrong option. structure-pass: lesson structure v3 (readiness.ts noteStructure). reviewed: the latest teach-show-check review says pass. ready: the manifest's verdict under the readiness policy, and by which way. lint warnings: lesson-v2 in report mode (see, teach, prompts, withdrawn problems, examiner sources, breaches) and figure-leaks (LEAK, worked-example lines). specs green: the tests whose file or title names the unit or one of its topics; the suite line above covers the rest.",
  );
  return `${lines.join("\n")}\n`;
}

const out =
  mode === "e2e" ? e2e(files[0]) : mode === "lighthouse" ? lighthouse(files[0], files[1]) : mode === "nightly" ? nightly(files[0], files[1]) : null;
if (out === null) {
  console.error("usage: node .github/scripts/summary.mjs e2e <results.json> | lighthouse <reports dir> [<lhci dir>] | nightly <unit-health.json> [<results.json>]");
  process.exit(2);
}
process.stdout.write(out);
