/** Scans every note.blocks.json for the two renderer pitfalls found while authoring m7 index laws. */
import fs from "node:fs";
import path from "node:path";

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "note.blocks.json") out.push(p);
  }
  return out;
}

const MATH = /\$[^$]+\$/;
const files = new Map();
for (const f of walk("packs")) {
  const rel = f.replace(/\\/g, "/");
  for (const b of JSON.parse(fs.readFileSync(f, "utf8"))) {
    let issue = null;
    if (b.type === "h" && MATH.test(b.text)) issue = "katex in heading";
    else if (b.type === "figure" && MATH.test(b.caption ?? "")) issue = "katex in caption";
    else if ((b.type === "p" || b.type === "callout") && b.md.split(MATH).some((r) => ((r.match(/\*\*/g) ?? []).length) % 2 !== 0)) {
      issue = "bold marker spans maths";
    }
    if (issue) {
      if (!files.has(rel)) files.set(rel, new Map());
      files.get(rel).set(issue, (files.get(rel).get(issue) ?? 0) + 1);
    }
  }
}
for (const [f, issues] of files) console.log(`${f}\n    ${[...issues].map(([k, n]) => `${k} x${n}`).join(", ")}`);
console.log(`\n${files.size} file(s) affected of ${walk("packs").length} scanned`);
