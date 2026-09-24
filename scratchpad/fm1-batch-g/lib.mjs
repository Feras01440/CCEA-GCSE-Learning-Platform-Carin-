/**
 * FM1 batch F shared generator library.
 * Everything printed in the bundles is computed here or by the topic generators that import this
 * module; nothing is typed as a literal into learner-facing text.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const ROOT = path.resolve(process.cwd());
export const OUT = (slug, file) => path.join(ROOT, "packs/further-maths/content/fm1", slug, file);

/* ---- numbers ---------------------------------------------------------------------------- */

/** A number printed to a fixed number of places, with -0 removed. */
export const fx = (n, dp) => {
  const s = (Math.abs(n) < 5e-12 ? 0 : n).toFixed(dp);
  return s === "-0" ? "0" : s;
};
/** A number printed as short as it can be written exactly (integers bare, decimals trimmed). */
export const num = (n) => {
  if (!Number.isFinite(n)) throw new Error(`num() got ${n}`);
  const r = Math.round(n * 1e9) / 1e9;
  if (Number.isInteger(r)) return String(r);
  const s = String(r);
  if (s.length > 12) throw new Error(`num() would print a non-terminating decimal: ${n}`);
  return s;
};
/** Refuses any value that does not terminate inside 9 decimal places (the marker rejects rounded pairs). */
export const terminating = (n) => {
  const r = Math.round(n * 1e9) / 1e9;
  if (Math.abs(n - r) > 1e-12) throw new Error(`value ${n} does not terminate`);
  return r;
};

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Exact rational: { n, d } always in lowest terms with d > 0. */
export const frac = (n, d = 1) => {
  if (d === 0) throw new Error("zero denominator");
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`frac needs integers, got ${n}/${d}`);
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d) || 1;
  return { n: (s * n) / g, d: (s * d) / g };
};
export const fAdd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const fSub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const fMul = (a, b) => frac(a.n * b.n, a.d * b.d);
export const fDiv = (a, b) => frac(a.n * b.d, a.d * b.n);
export const fNeg = (a) => frac(-a.n, a.d);
export const fVal = (a) => a.n / a.d;
/** LaTeX for a rational: an integer bare, otherwise \frac (with the sign outside). */
export const fTex = (a) => {
  if (a.d === 1) return String(a.n);
  const sign = a.n < 0 ? "-" : "";
  return `${sign}\\frac{${Math.abs(a.n)}}{${a.d}}`;
};
/** Plain-text spelling of a rational, for answer specs the learner types. */
export const fPlain = (a) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/* ---- SVG -------------------------------------------------------------------------------- */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");

export const svgText = (x, y, text, { size = 12, anchor = "middle", weight } = {}) =>
  `<text x='${num(x)}' y='${num(y)}' font-family='inherit' font-size='${size}' fill='currentColor' text-anchor='${anchor}'${weight ? ` font-weight='${weight}'` : ""}>${esc(text)}</text>`;
export const svgPath = (d, { width = 1.5, dash, fill = "none", opacity } = {}) =>
  `<path d='${d}' stroke='currentColor' stroke-width='${width}' fill='${fill}'${fill !== "none" && opacity !== undefined ? ` fill-opacity='${opacity}'` : ""}${dash ? ` stroke-dasharray='${dash}'` : ""} stroke-linejoin='round' stroke-linecap='round'/>`;
export const svgRect = (x, y, w, h, { width = 1.2, fill = "none", opacity } = {}) =>
  `<rect x='${num(x)}' y='${num(y)}' width='${num(w)}' height='${num(h)}' stroke='currentColor' stroke-width='${width}' fill='${fill}'${opacity !== undefined ? ` fill-opacity='${opacity}'` : ""}/>`;
export const svgCircle = (x, y, r) => `<circle cx='${num(x)}' cy='${num(y)}' r='${r}' fill='currentColor'/>`;
export const svgLine = (x1, y1, x2, y2, o = {}) => svgPath(`M ${num(x1)} ${num(y1)} L ${num(x2)} ${num(y2)}`, o);

export function svgWrap(viewBox, label, body) {
  const s = `<svg viewBox='${viewBox}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${esc(label)}'><title>${esc(label)}</title>${body}</svg>`;
  assertSvg(s, label);
  return s;
}

/** Every rule the SVG lint and the brief impose, asserted at generation time. */
export function assertSvg(s, label) {
  const bad = [];
  if (/NaN|undefined|null/.test(s)) bad.push("contains NaN, undefined or null");
  if (/<style|<script|on[a-z]+\s*=|xlink:href|href\s*=/i.test(s)) bad.push("contains style, script, a handler or an href");
  if (!/viewBox=/.test(s)) bad.push("has no viewBox");
  for (const p of s.match(/<path\b[^>]*>/g) ?? []) if (!/\sd\s*=\s*'/.test(p)) bad.push("a <path> has no d");
  for (const t of s.match(/<text\b[^>]*>([^<]*)<\/text>/g) ?? []) {
    const inner = t.replace(/<text\b[^>]*>/, "").replace(/<\/text>$/, "");
    if (/^\s*[Mm]\s*-?\d/.test(inner) && /[LlCcQqAaHhVv]\s*-?\d/.test(inner)) bad.push("a <text> holds path data");
  }
  if ((s.match(/<(path|line|polyline|polygon|rect|circle|ellipse)\b/g) ?? []).length === 0) bad.push("no drawn shape");
  if (Buffer.byteLength(s, "utf8") >= 12000) bad.push(`is ${Buffer.byteLength(s, "utf8")} bytes (limit 12000)`);
  if (bad.length) throw new Error(`SVG "${label}": ${bad.join("; ")}`);
}

export const dataUri = (svg) => `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`;
export const figure = (svg, alt) => ({ kind: "svg", src: dataUri(svg), alt });

/* ---- string lints ----------------------------------------------------------------------- */

const NOT_PROSE_KEYS = new Set([
  "regex", "pattern", "test", "svg", "id", "url", "href", "src", "kind", "status", "unit", "slug", "code",
  "misconception", "verification", "itemId", "topicId", "ref", "latex", "accepted", "any", "reject", "version",
  "generatedAt", "source", "solutionProgram",
]);
const TEX_TEXT = /\\(?:text|mathrm|textbf|mbox|operatorname)\{[^}]*\}/g;
const TEX_CMD = /\\[a-zA-Z]+/g;
const PROSE_IN_MATHS = /\b(with|centre|center|and|the|then|onto|about|from|which|label|image|scale|factor|would|gives|when|because|answer|question)\b/i;
const LEAKED = /\bNaN\b|\bnull\b|\[object Object\]|[{}=\\\d]\s*undefined\b|\bundefined\s*[{}=\\\d]/;
const BANNED = /\bWrong\b|!/;

/** Walks an emitted object and throws on every defect build-content.mts or the brief would reject. */
export function lintTree(obj, label) {
  const bad = [];
  const walk = (o, keyPath, key) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${keyPath}[${i}]`, key));
    if (o && typeof o === "object") {
      for (const [k, v] of Object.entries(o)) walk(v, `${keyPath}.${k}`, k);
      return;
    }
    if (typeof o !== "string") return;
    if (o.includes("${")) bad.push(`${keyPath}: unexpanded placeholder "\${"`);
    if (NOT_PROSE_KEYS.has(key)) return;
    if (LEAKED.test(o)) bad.push(`${keyPath}: leaked value in ${JSON.stringify(o.slice(0, 70))}`);
    if (BANNED.test(o)) bad.push(`${keyPath}: banned word or exclamation mark in ${JSON.stringify(o.slice(0, 70))}`);
    if (o.includes("$")) {
      for (const line of o.split("\n")) {
        const parts = line.split("$");
        if (parts.length % 2 === 0) bad.push(`${keyPath}: unpaired "$" on a line: ${JSON.stringify(line.slice(0, 70))}`);
        for (let i = 1; i < parts.length; i += 2) {
          const seg = parts[i].replace(TEX_TEXT, "").replace(TEX_CMD, " ");
          if (PROSE_IN_MATHS.test(seg)) bad.push(`${keyPath}: prose inside a maths segment "$${parts[i].slice(0, 50)}$"`);
        }
      }
    }
  };
  walk(obj, label, undefined);
  if (bad.length) throw new Error(`${label} lint:\n  ${bad.join("\n  ")}`);
}

/* ---- shingles --------------------------------------------------------------------------- */

const words = (s) =>
  s
    .toLowerCase()
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export function shingleSet(text, n = 8) {
  const w = words(text);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

/** Every 8-word run our text shares with any file in `files`. Empty means original. */
export function shingleClash(ourText, files, n = 8) {
  const ours = shingleSet(ourText, n);
  const hits = [];
  for (const f of files) {
    const corpus = shingleSet(fs.readFileSync(f, "utf8"), n);
    for (const s of ours) if (corpus.has(s)) hits.push(`${path.basename(f)}: "${s}"`);
  }
  return hits;
}

export function corpusFiles() {
  const base = path.join(ROOT, "docs/sources/papers/further-maths");
  const out = [];
  for (const dir of fs.readdirSync(base)) {
    const d = path.join(base, dir);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith(".txt")) out.push(path.join(d, f));
  }
  const reports = path.join(ROOT, "docs/sources/further-maths");
  if (fs.existsSync(reports)) for (const f of fs.readdirSync(reports)) if (f.endsWith(".txt")) out.push(path.join(reports, f));
  return out;
}

/* ---- verification ----------------------------------------------------------------------- */

export const AT = "2026-09-19T23:30:00Z";
// 23 Sep (job 3): this line was copied from batch F and named batch F's directory and library; it now names batch G's.
export const TOOL =
  "claude (FM1 batch-G generators in scratchpad/fm1-batch-g: matlib.mjs computes every sum, product, determinant and inverse in exact rational arithmetic; routes are executed in the topic generator and re-executed against the published JSON by verify-published.mjs; check-marking.mts feeds every part to the app's own marker)";

export const check = (type, detail, result = "pass") => ({ type, tool: TOOL, result, detail, at: AT, by: "claude" });
export const log = (id, itemId, checks) => ({ id, itemId, version: 1, checks, status: "verified", reports: [] });

/**
 * 23 Sep (FM1 finisher, job 3): verification logs for the diagnostics, find-the-mistake items and prompts. These
 * generators never logged them, so the build kept every one as a draft and none reached the learner. Each check below
 * names what was run on them before they shipped: scratchpad/fm1-batch-g/probe-drafts-0923.mts (the fix box's markFix
 * on every find-the-mistake line; one correct option, unique ids and texts and registered tags on every diagnostic
 * item, the matrix items re-derived from their own stems; prompts present), this batch's verify-published.mjs, and a
 * read-through as the student. `verifier` says which verifier re-derived the topic's numeric distractors.
 * (The same helper stands in scratchpad/fm1-batch-f/lib.mjs.)
 */
export const SHIP_AT = "2026-09-23T18:20:00Z"; // when the job 3 checks ran (first set to 20:00Z, a time still to come)
const shipCheck = (type, detail) => ({ ...check(type, detail), at: SHIP_AT });
/** Right fixes the fix box does not yet read (an engine gap, shared with probe-drafts-0923.mts), named in the item's log. */
const ENGINE_FIX_GAPS = JSON.parse(fs.readFileSync(path.join(ROOT, "scratchpad/fm1-batch-g/engine-fix-gaps-0923.json"), "utf8"));
function fixCheckDetail(id) {
  const gaps = ENGINE_FIX_GAPS[id] ?? [];
  const except = gaps.length
    ? `, except ${gaps.map((g) => `"${g}"`).join(", ")}: right, but not yet read by the fix box (an engine gap reported on 23 Sep, not a fault in this item)`
    : "";
  return `The app's own fix box was run on it (markFix, in scratchpad/fm1-batch-g/probe-drafts-0923.mts): every line of the student's working typed back fixes nothing, nor do the values her working already had; the correction's own lines and the usual ways of writing the fix are accepted${except}.`;
}
export function draftLogs({ diagnostics, findTheMistake = [], prompts, verifier }) {
  const plainText = (s) => String(s).replace(/\$/g, "").replace(/\s+/g, " ").trim();
  return [
    ...diagnostics.map((d) =>
      log(`ver.${d.id}`, d.id, [
        shipCheck("schema", "Validated by pipeline/build-content.mts against the Zod DiagnosticSet schema: unique option ids, one correct option per item, distinct option texts; the correct option's id marks correct through the app's own marker."),
        shipCheck("maths-symbolic", `Every correct option re-derived (${d.items.map((it) => `${it.id} ${plainText(it.options.find((o) => o.correct).text)}`).join("; ")}); every distractor is the value or expression its misuse produces. ${verifier}`),
        shipCheck("examiner-alignment", d.when === "pre" ? "The pre-check tests the prerequisites the lesson is built from, untagged by design." : "Every tagged post-check distractor names a misconception in packs/further-maths/insights/misconceptions.json, each evidenced by a Chief Examiner report block."),
        shipCheck("style-lint", "Read through as the student before shipping; British English; no exclamation marks and no verdict word; maths segments paired and prose-free (lintTree)."),
      ]),
    ),
    ...findTheMistake.map((f) =>
      log(`ver.${f.id}`, f.id, [
        shipCheck("schema", "Validated by pipeline/build-content.mts against the Zod FindTheMistake schema; mistakeLine points inside studentWorking; the misconception is registered."),
        shipCheck("maths-symbolic", `Line ${f.mistakeLine} is the first wrong line, the lines before it are right, and the correction is right; each value printed was computed in the generator.`),
        shipCheck("independent-solve", fixCheckDetail(f.id)),
        shipCheck("examiner-alignment", `Seeded from the ${String(f.source).replace(/^ccea-cer:further-maths:(\d{4})-summer:FM1:Q(\d+)$/, "Summer $1 Q$2")} report and tagged to ${f.misconception}.`),
        shipCheck("style-lint", "Read through as the student; calm feedback that names the mark that stands before the one that went; no exclamation marks."),
      ]),
    ),
    ...prompts.map((p) =>
      log(`ver.${p.id}`, p.id, [
        shipCheck("schema", "Validated by pipeline/build-content.mts against the Zod RetrievalPrompt schema."),
        shipCheck("maths-symbolic", "The answer re-derived from the lesson's rules; each key word is something the answer says, in words or in its maths."),
        shipCheck("style-lint", "Read through as the student; British English; maths segments paired and prose-free (lintTree)."),
      ]),
    ),
  ];
}

/* ---- writing ---------------------------------------------------------------------------- */

export function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`, "utf8");
  const buf = fs.readFileSync(file);
  return { file, bytes: buf.length, sha: crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16) };
}

export const PAPER = {
  unit: "FM1",
  calculator: true,
  resources: ["Scientific calculator", "Formula sheet printed on page 2 of the question-and-answer booklet"],
};
