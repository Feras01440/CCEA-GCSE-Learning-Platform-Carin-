/**
 * Author's gates for the pythagoras-and-trigonometry-in-3d bundle:
 *   katex-compile, style-lint, svg rules, figure sizes, scheme arithmetic,
 *   and an 8-word shingle comparison against the private M8 corpus.
 *
 * Run: node scratchpad/trig-3d/check.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import katex from "katex";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "packs/maths/content/m8/pythagoras-and-trigonometry-in-3d");
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));
const blocks = JSON.parse(fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8"));

const problems = [];
const fail = (m) => problems.push(m);

/** Every string in the two files, with a path. */
function* strings(node, where = "") {
  if (typeof node === "string") {
    yield [where, node];
    return;
  }
  if (Array.isArray(node)) {
    for (const [i, v] of node.entries()) yield* strings(v, `${where}[${i}]`);
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) yield* strings(v, where ? `${where}.${k}` : k);
  }
}

const all = [...strings(bundle, "bundle"), ...strings(blocks, "note")];

// --- 1. katex -------------------------------------------------------------
let segments = 0;
const mathRe = /\$\$([^$]+)\$\$|\$([^$\n]+)\$/g;
for (const [where, s] of all) {
  if (where.includes(".svg") || where.includes(".src")) continue;
  for (const m of s.matchAll(mathRe)) {
    const tex = m[1] ?? m[2];
    segments += 1;
    try {
      katex.renderToString(tex, { throwOnError: true, displayMode: !!m[1] });
    } catch (e) {
      fail(`katex: ${where}: ${tex} -> ${e.message.split("\n")[0]}`);
    }
  }
  const dollars = (s.match(/\$/g) ?? []).length;
  if (dollars % 2 !== 0) fail(`unbalanced $ in ${where}: ${s.slice(0, 120)}`);
}

// --- 2. style lint --------------------------------------------------------
const banned = [
  [/!/, "exclamation mark"],
  [/\bWrong\b/, "the word Wrong"],
  [/\bgrade 9\b/i, "grade 9"],
  [/\borganiz|\bcolor\b|\bmeter\b|\bpracticing\b/i, "American spelling"],
];
for (const [where, s] of all) {
  if (where.includes(".svg") || where.includes(".src") || where.includes("$schema") || where.includes(".url")) continue;
  // CSS identifiers quoted in the verification log are not prose spellings
  const prose = s.replace(/prefers-color-scheme|currentColor/g, "");
  for (const [re, label] of banned) if (re.test(prose)) fail(`style-lint: ${label} in ${where}: ${s.slice(0, 120)}`);
}

// --- 3. svg rules ---------------------------------------------------------
let svgCount = 0;
let biggest = 0;
const checkSvg = (where, svg) => {
  svgCount += 1;
  biggest = Math.max(biggest, svg.length);
  if (!/viewBox=/.test(svg)) fail(`svg: no viewBox in ${where}`);
  if (/<style|<script|\son[a-z]+=|xlink:href|href=["'](?!#)/i.test(svg)) fail(`svg: forbidden construct in ${where}`);
  if (/prefers-color-scheme/.test(svg)) fail(`svg: prefers-color-scheme in ${where}`);
  if (!/currentColor/.test(svg)) fail(`svg: no currentColor in ${where}`);
  if (/font-family='(?!inherit)/.test(svg)) fail(`svg: font-family is not inherit in ${where}`);
  if (svg.length > 12 * 1024) fail(`svg: ${Math.round(svg.length / 1024)} KB in ${where} (limit 12)`);
};
for (const [where, s] of all) {
  if (s.startsWith("data:image/svg+xml")) {
    const m = /^data:image\/svg\+xml(;charset=[^;,]+)?(;utf8)?(;base64)?,(.*)$/is.exec(s.trim());
    if (!m) {
      fail(`figure: ${where} is not a decodable data URI`);
      continue;
    }
    let body;
    try {
      body = decodeURIComponent(m[4]);
    } catch (e) {
      fail(`figure: ${where} fails decodeURIComponent (${e.message})`);
      continue;
    }
    if (!/^\s*<svg[\s>]/i.test(body)) fail(`figure: ${where} does not decode to an <svg>`);
    else checkSvg(where, body);
  } else if (where.endsWith(".svg") && s.startsWith("<svg")) {
    checkSvg(where, s);
  }
}

// --- 4. marks and ids -----------------------------------------------------
for (const q of bundle.questions) {
  const total = q.parts.reduce((t, p) => t + p.marks, 0);
  if (total !== q.totalMarks) fail(`marks: ${q.id} parts sum to ${total}, totalMarks ${q.totalMarks}`);
  for (const p of q.parts) {
    const s = p.scheme.reduce((t, m) => t + m.marks, 0);
    if (s !== p.marks) fail(`marks: ${q.id} part ${p.id} scheme ${s} vs ${p.marks}`);
    if (p.answer.kind === "numeric" && p.answer.unitRequired && !p.answer.unit) fail(`answer: ${q.id} ${p.id} unitRequired without a unit`);
  }
  if (!q.figures.length) fail(`figures: ${q.id} has none`);
}
for (const we of bundle.workedExamples) {
  if (!we.figure) fail(`figures: ${we.id} has no figure`);
  if (!we.twin.figure) fail(`figures: ${we.id} twin has no figure`);
}

// --- 5. shingles against the private corpus -------------------------------
const norm = (s) =>
  s
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const N = 8;
const shingles = (text) => {
  const w = norm(text).split(" ").filter(Boolean);
  const out = [];
  for (let i = 0; i + N <= w.length; i++) out.push(w.slice(i, i + N).join(" "));
  return out;
};

const corpusDir = path.join(ROOT, "docs/sources/papers/maths");
const corpus = new Set();
let files = 0;
for (const session of fs.readdirSync(corpusDir)) {
  const d = path.join(corpusDir, session);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".txt") || !/^M[34678]/.test(f)) continue;
    files += 1;
    for (const s of shingles(fs.readFileSync(path.join(d, f), "utf8"))) corpus.add(s);
  }
}
// the Chief Examiner report blocks too
const cerDir = path.join(ROOT, "pipeline/mine/cer-blocks/maths");
for (const f of fs.readdirSync(cerDir)) {
  const j = JSON.parse(fs.readFileSync(path.join(cerDir, f), "utf8"));
  files += 1;
  for (const b of j.blocks) for (const s of shingles(b.text)) corpus.add(s);
  for (const s of shingles(j.overview ?? "")) corpus.add(s);
}

let checked = 0;
const hits = [];
for (const [where, s] of all) {
  if (where.includes(".svg") || where.includes(".src") || where.includes(".url") || where.includes("$schema")) continue;
  if (s.length < 40) continue;
  checked += 1;
  for (const sh of shingles(s)) if (corpus.has(sh)) hits.push(`${where}: "${sh}"`);
}

console.log(`katex: ${segments} segments compiled`);
console.log(`svg: ${svgCount} figures, largest ${Math.round((biggest / 1024) * 10) / 10} KB`);
console.log(`shingles: ${checked} strings checked against ${corpus.size} ${N}-word shingles from ${files} corpus files`);
if (hits.length) {
  console.log(`\nSHINGLE MATCHES (${hits.length}):`);
  for (const h of hits.slice(0, 20)) console.log("  " + h);
}
if (problems.length) {
  console.log(`\nPROBLEMS (${problems.length}):`);
  for (const p of problems.slice(0, 40)) console.log("  " + p);
  process.exitCode = 1;
} else if (!hits.length) {
  console.log("\nall author gates pass");
}
