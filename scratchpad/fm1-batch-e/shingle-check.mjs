/**
 * FM1 batch E copy-shingle check.
 *
 * Builds every 8-word sequence of the learner-facing text in my four bundles and notes, and
 * looks for any of them in the private corpus: the Further Mathematics question papers and mark
 * schemes under docs/sources/papers/further-maths, and the Chief Examiner reports under
 * docs/sources/further-maths. Nothing from the corpus is printed except a matched sequence,
 * which would be a finding to fix.
 */
import fs from "node:fs";
import path from "node:path";

const N = 8;
const SLUGS = process.argv.slice(2).length ? process.argv.slice(2) : ["curve-sketching-quadratic-cubic", "optimisation", "integration-as-inverse", "definite-integrals"];

/** Keys whose strings are not prose a learner reads. */
const SKIP = new Set([
  "svg", "src", "regex", "id", "url", "videoId", "misconception", "verification", "itemId", "source",
  "solutionProgram", "kind", "type", "status", "tool", "at", "by", "licence", "attribution", "credit",
  "$schema", "slug", "subject", "unit", "tier", "code", "promptId", "generatedAt", "version",
]);

const normalise = (s) =>
  s
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

function mineStrings(node, out, key) {
  if (typeof node === "string") {
    if (!SKIP.has(key)) out.push(node);
    return;
  }
  if (Array.isArray(node)) return node.forEach((v) => mineStrings(v, out, key));
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) mineStrings(v, out, k);
}

function shingles(words) {
  const out = new Map();
  for (let i = 0; i + N <= words.length; i++) out.set(words.slice(i, i + N).join(" "), i);
  return out;
}

// what we wrote
const mine = new Map(); // shingle -> "slug file"
for (const slug of SLUGS) {
  for (const f of ["bundle.json", "note.blocks.json"]) {
    const file = path.join("packs/further-maths/content/fm1", slug, f);
    const strings = [];
    mineStrings(JSON.parse(fs.readFileSync(file, "utf8")), strings, "");
    for (const s of strings) for (const [sh] of shingles(normalise(s))) if (!mine.has(sh)) mine.set(sh, `${slug}/${f}`);
  }
}

// the corpus
const corpusDirs = ["docs/sources/papers/further-maths", "docs/sources/further-maths"];
const corpusFiles = [];
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".txt")) corpusFiles.push(p);
  }
};
corpusDirs.forEach(walk);

const hits = [];
let corpusShingles = 0;
for (const file of corpusFiles) {
  const words = normalise(fs.readFileSync(file, "latin1"));
  for (let i = 0; i + N <= words.length; i++) {
    corpusShingles++;
    const sh = words.slice(i, i + N).join(" ");
    if (mine.has(sh)) hits.push({ sh, file: path.relative(process.cwd(), file), where: mine.get(sh) });
  }
}

console.log(
  `copy-shingle: ${mine.size} distinct ${N}-word sequences across my four bundles and notes, against ${corpusShingles.toLocaleString()} from ${corpusFiles.length} corpus files`,
);
if (hits.length === 0) console.log("no shared sequence");
else {
  const seen = new Set();
  for (const h of hits) {
    if (seen.has(h.sh)) continue;
    seen.add(h.sh);
    console.log(`FINDING ${h.where} shares "${h.sh}" with ${h.file}`);
  }
  process.exitCode = 1;
}
