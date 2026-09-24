/**
 * Eight-word shingle overlap between everything this bundle prints and the private
 * Higher-tier paper corpus. Any match is a copy failure.
 *
 * Run: node scratchpad/similar/shingle.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "packs", "maths", "content", "m7", "similar-shapes-length-area-and-volume-scale-factors");
const CORPUS = path.join(ROOT, "docs", "sources", "papers", "maths");
const K = 8;

/** Lower-case, drop maths and punctuation, collapse whitespace. */
function normalise(s) {
  return s
    .replace(/\$[^$]*\$/g, " ")           // KaTeX
    .replace(/\\[a-zA-Z]+/g, " ")          // stray commands
    .replace(/[*_`#]/g, " ")               // markdown
    .toLowerCase()
    .replace(/[^a-z ]+/g, " ")             // digits and punctuation out: wording only
    .replace(/\s+/g, " ")
    .trim();
}

function shingles(text) {
  const w = normalise(text).split(" ").filter(Boolean);
  const out = new Set();
  for (let i = 0; i + K <= w.length; i++) out.add(w.slice(i, i + K).join(" "));
  return out;
}

function collectStrings(v, key, out = []) {
  if (typeof v === "string") {
    if (key !== "src" && key !== "regex" && key !== "id" && key !== "topic" && key !== "verification") out.push(v);
  } else if (Array.isArray(v)) v.forEach((x) => collectStrings(x, key, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) collectStrings(x, k, out);
  return out;
}

const mine = new Set();
for (const f of ["bundle.json", "note.blocks.json"]) {
  const json = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  for (const s of collectStrings(json)) for (const sh of shingles(s)) mine.add(sh);
}

const files = [];
for (const session of fs.readdirSync(CORPUS)) {
  const dir = path.join(CORPUS, session);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".txt")) continue;
    if (!/^M[3478]-H-/.test(name)) continue; // Higher tier M3, M4, M7, M8 — papers and mark schemes
    files.push(path.join(dir, name));
  }
}

const corpus = new Set();
for (const f of files) {
  for (const sh of shingles(fs.readFileSync(f, "latin1"))) corpus.add(sh);
}

const hits = [...mine].filter((s) => corpus.has(s));
console.log(`bundle shingles: ${mine.size}`);
console.log(`corpus files: ${files.length}, corpus shingles: ${corpus.size}`);
console.log(`overlapping 8-word shingles: ${hits.length}`);
for (const h of hits.slice(0, 20)) console.log("  ! " + h);
process.exitCode = hits.length ? 1 : 0;
