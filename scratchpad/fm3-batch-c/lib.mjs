/**
 * FM3 batch C shared generator library (Pascal's triangle, binomial probabilities, the normal
 * distribution). Adapted from scratchpad/fm1-batch-g/lib.mjs: the paper context, the output folder
 * and the tool string are Unit 3's, and a compact <g>-wrapped text builder was added so a table of
 * sixty computed values still fits inside the 12 KB SVG limit.
 *
 * Everything printed in the bundles is computed here or by the topic generators that import this
 * module; nothing is typed as a literal into learner-facing text.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const ROOT = path.resolve(process.cwd());
export const OUT = (slug, file) => path.join(ROOT, "packs/further-maths/content/fm3", slug, file);

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
/** Rounded to six decimal places: the form the content lint accepts in a numeric value. */
export const r6 = (n) => Math.round(n * 1e6) / 1e6;
/** Refuses any value that does not terminate inside 9 decimal places. */
export const terminating = (n) => {
  const r = Math.round(n * 1e9) / 1e9;
  if (Math.abs(n - r) > 1e-12) throw new Error(`value ${n} does not terminate`);
  return r;
};

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Exact rational over small integers: { n, d } always in lowest terms with d > 0. */
export const frac = (n, d = 1) => {
  if (d === 0) throw new Error("zero denominator");
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`frac needs integers, got ${n}/${d}`);
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d) || 1;
  return { n: (s * n) / g, d: (s * d) / g };
};
export const fVal = (a) => a.n / a.d;
/** LaTeX for a rational: an integer bare, otherwise \frac (with the sign outside). */
export const fTex = (a) => {
  if (a.d === 1) return String(a.n);
  const sign = a.n < 0 ? "-" : "";
  return `${sign}\\frac{${Math.abs(a.n)}}{${a.d}}`;
};
export const fPlain = (a) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/* ---- exact rationals over BigInt (binomial probabilities) --------------------------------- */

const bgcd = (a, b) => (b === 0n ? (a < 0n ? -a : a) : bgcd(b, a % b));
/** Exact rational over BigInt, always in lowest terms with d > 0. */
export const big = (n, d = 1n) => {
  const N = typeof n === "bigint" ? n : BigInt(n);
  const D = typeof d === "bigint" ? d : BigInt(d);
  if (D === 0n) throw new Error("zero denominator");
  const s = D < 0n ? -1n : 1n;
  const g = bgcd(N, D) || 1n;
  return { n: (s * N) / g, d: (s * D) / g };
};
export const bAdd = (a, b) => big(a.n * b.d + b.n * a.d, a.d * b.d);
export const bSub = (a, b) => big(a.n * b.d - b.n * a.d, a.d * b.d);
export const bMul = (a, b) => big(a.n * b.n, a.d * b.d);
export const bPow = (a, k) => {
  let out = big(1n);
  for (let i = 0; i < k; i += 1) out = bMul(out, a);
  return out;
};
/** A decimal string such as "0.15" as an exact rational. */
export const bDec = (s) => {
  const t = String(s).trim();
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`bDec cannot read ${t}`);
  const places = (m[3] ?? "").length;
  const digits = BigInt(`${m[2]}${m[3] ?? ""}`);
  return big((m[1] === "-" ? -1n : 1n) * digits, 10n ** BigInt(places));
};
/** The exact rational rounded to `places` decimals, as a string (half away from zero). */
export const bFixed = (a, places) => {
  const scale = 10n ** BigInt(places);
  const neg = a.n < 0n;
  const n = neg ? -a.n : a.n;
  const scaled = (n * scale * 2n + a.d) / (a.d * 2n);
  const s = scaled.toString().padStart(places + 1, "0");
  const whole = s.slice(0, s.length - places);
  const frac_ = places > 0 ? `.${s.slice(s.length - places)}` : "";
  return `${neg && scaled !== 0n ? "-" : ""}${whole}${frac_}`;
};
/** The exact rational as a double, via a 12-decimal rounding (safe for BigInt of any size). */
export const bNum = (a) => Number(bFixed(a, 12));
/**
 * The value to write into a numeric AnswerSpec: six decimal places (so the content lint sees no
 * floating-point artefact), asserted to round to the same `places` decimals as the exact value.
 */
export const bValue = (a, places) => {
  const six = Number(bFixed(a, 6));
  if (bFixed(a, places) !== six.toFixed(places)) {
    throw new Error(`rounding to 6 dp moved the ${places} dp answer: ${bFixed(a, 12)}`);
  }
  return six;
};

/* ---- SVG -------------------------------------------------------------------------------- */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");

/** A pixel coordinate: two decimal places is finer than any screen, and it keeps the file small. */
export const px = (n) => {
  if (!Number.isFinite(n)) throw new Error(`px() got ${n}`);
  return num(Math.round(n * 100) / 100);
};

export const svgText = (x, y, text, { size = 12, anchor = "middle", weight } = {}) =>
  `<text x='${px(x)}' y='${px(y)}' font-family='inherit' font-size='${size}' fill='currentColor' text-anchor='${anchor}'${weight ? ` font-weight='${weight}'` : ""}>${esc(text)}</text>`;
/** A text node inside a <g> that already carries the family, fill, size and anchor. */
export const svgTextIn = (x, y, text) => `<text x='${px(x)}' y='${px(y)}'>${esc(text)}</text>`;
/** A group carrying the shared text attributes, so a large table of values stays small. */
export const svgGroup = (body, { size = 12, anchor = "middle", weight } = {}) =>
  `<g font-family='inherit' font-size='${size}' fill='currentColor' text-anchor='${anchor}'${weight ? ` font-weight='${weight}'` : ""}>${body}</g>`;
export const svgPath = (d, { width = 1.5, dash, fill = "none", opacity } = {}) =>
  `<path d='${d}' stroke='currentColor' stroke-width='${width}' fill='${fill}'${fill !== "none" && opacity !== undefined ? ` fill-opacity='${opacity}'` : ""}${dash ? ` stroke-dasharray='${dash}'` : ""} stroke-linejoin='round' stroke-linecap='round'/>`;
export const svgRect = (x, y, w, h, { width = 1.2, fill = "none", opacity, dash } = {}) =>
  `<rect x='${px(x)}' y='${px(y)}' width='${px(w)}' height='${px(h)}' stroke='currentColor' stroke-width='${width}' fill='${fill}'${opacity !== undefined ? ` fill-opacity='${opacity}'` : ""}${dash ? ` stroke-dasharray='${dash}'` : ""}/>`;
export const svgCircle = (x, y, r, { fill = "currentColor", opacity, width = 1.2 } = {}) =>
  `<circle cx='${px(x)}' cy='${px(y)}' r='${px(r)}' fill='${fill}'${opacity !== undefined ? ` fill-opacity='${opacity}'` : ""}${fill === "none" ? ` stroke='currentColor' stroke-width='${width}'` : ""}/>`;
export const svgLine = (x1, y1, x2, y2, o = {}) => svgPath(`M ${px(x1)} ${px(y1)} L ${px(x2)} ${px(y2)}`, o);

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
const LOST_BACKSLASH = /(?<![\\a-zA-Z])(mathbf|mathrm|boldsymbol|frac|tfrac|dfrac|sqrt|vec|hat|underline|overline|text|textbf|left|right|begin|end|ce)\{|\^\{?(circ)\b/;
const AMERICAN = /\b(color|meter|center|analyze|practicing|organization)/i;

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
    if (AMERICAN.test(o.replace(/\bmeters?\b/gi, (m) => m))) {
      if (/\b(color|center|analyze|practicing|organization)/i.test(o)) bad.push(`${keyPath}: American spelling in ${JSON.stringify(o.slice(0, 70))}`);
    }
    if (o.includes("$")) {
      for (const line of o.split("\n")) {
        const parts = line.split("$");
        if (parts.length % 2 === 0) bad.push(`${keyPath}: unpaired "$" on a line: ${JSON.stringify(line.slice(0, 70))}`);
        for (let i = 1; i < parts.length; i += 2) {
          const seg = parts[i].replace(TEX_TEXT, "").replace(TEX_CMD, " ");
          if (PROSE_IN_MATHS.test(seg)) bad.push(`${keyPath}: prose inside a maths segment "$${parts[i].slice(0, 50)}$"`);
        }
      }
      for (const seg of o.match(/\$[^$]+\$/g) ?? []) {
        if (/\\\\(?=[a-zA-Z])/.test(seg)) bad.push(`${keyPath}: doubled backslash before a command in ${JSON.stringify(seg.slice(0, 60))}`);
        const m = LOST_BACKSLASH.exec(seg);
        if (m) bad.push(`${keyPath}: "${m[1] ?? m[2]}" without its backslash in ${JSON.stringify(seg.slice(0, 60))}`);
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

export const AT = "2026-09-20T21:30:00Z";
export const TOOL =
  "claude (FM3 batch-C generators in scratchpad/fm3-batch-c: stat.mjs computes every binomial coefficient from Pascal's triangle, every probability as an exact rational and every normal probability from an error-function series checked against the table entries the Summer 2023 and Summer 2025 schemes print; routes are executed in the topic generator and re-executed against the published JSON by verify-published.mjs; check-marking.mts feeds every part to the app's own marker)";

export const check = (type, detail, result = "pass") => ({ type, tool: TOOL, result, detail, at: AT, by: "claude" });
export const log = (id, itemId, checks) => ({ id, itemId, version: 1, checks, status: "verified", reports: [] });

/* ---- writing ---------------------------------------------------------------------------- */

export function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`, "utf8");
  const buf = fs.readFileSync(file);
  return { file, bytes: buf.length, sha: crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16) };
}

export const PAPER = {
  unit: "FM3",
  calculator: true,
  resources: [
    "Scientific calculator",
    "Formula sheet printed on page 2 of the question-and-answer booklet",
    "Normal Probability Table on page 3 of the booklet",
  ],
};
