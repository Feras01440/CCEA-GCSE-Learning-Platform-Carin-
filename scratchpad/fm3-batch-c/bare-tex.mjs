/**
 * A TeX command written without its backslash inside a maths segment ("log 8" for "\log 8",
 * "frac{1}{2}" for "\frac{1}{2}") renders as italic letters and is now a fatal lint.
 * This scans the published JSON of the topics named on the command line for that defect.
 */
import fs from "node:fs";

const CMDS = [
  "log", "ln", "Phi", "mu", "sigma", "frac", "dfrac", "tfrac", "sqrt", "times", "div", "cdot", "begin", "end",
  "pmatrix", "bmatrix", "int", "pm", "le", "ge", "ne", "circ", "left", "right", "sin", "cos", "tan",
];
const BARE = new RegExp(`(^|[^A-Za-z\\\\])(${CMDS.join("|")})(?![A-Za-z])`);

const NOT_PROSE = new Set([
  "regex", "pattern", "test", "svg", "id", "url", "href", "src", "kind", "status", "unit", "slug",
  "code", "misconception", "verification", "itemId", "ref", "version", "generatedAt", "source",
  "solutionProgram", "tool", "detail",
]);

const slugs = process.argv.slice(2);
let found = 0;
let strings = 0;

function walk(node, key, path) {
  if (Array.isArray(node)) return node.forEach((x, i) => walk(x, key, `${path}[${i}]`));
  if (node && typeof node === "object") return Object.entries(node).forEach(([k, v]) => walk(v, k, `${path}.${k}`));
  if (typeof node !== "string" || NOT_PROSE.has(key)) return;
  const parts = node.split("$");
  if (parts.length < 3) return;
  for (let i = 1; i < parts.length; i += 2) {
    strings++;
    // Strip the real commands first, and the environment name that belongs to \begin{…} / \end{…}
    // (in "\begin{pmatrix}" the word pmatrix is the environment, not a command missing its slash);
    // whatever command word is left really has lost its backslash.
    const seg = parts[i]
      .replace(/\\(?:begin|end)\s*\{[A-Za-z*]+\}/g, " ")
      .replace(/\\[A-Za-z]+/g, " ");
    const m = BARE.exec(seg);
    if (m) {
      found++;
      console.log(`BARE "${m[2]}" in ${path}: $${parts[i].slice(0, 70)}$`);
    }
  }
}

for (const slug of slugs) {
  for (const f of ["bundle.json", "note.blocks.json"]) {
    const p = `packs/further-maths/content/fm3/${slug}/${f}`;
    if (!fs.existsSync(p)) continue;
    walk(JSON.parse(fs.readFileSync(p, "utf8")), undefined, `${slug}/${f}`);
  }
}
console.log(`bare-tex: ${strings} maths segments scanned, ${found} defect(s)`);
process.exitCode = found ? 1 : 0;
