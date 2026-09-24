import fs from "node:fs";
import path from "node:path";
const reg = new Set(JSON.parse(fs.readFileSync("packs/maths/insights/misconceptions.json", "utf8")).map((m) => m.id));
const SLUGS = fs.readdirSync("packs/maths/content/m3");
const mine = ["hcf-and-lcm-from-prime-factor-form","upper-and-lower-bounds-addition-and-multiplication","identities-and-expanding-double-brackets","factorising-quadratics-x2-plus-bx-plus-c","difference-of-two-squares","algebraic-fractions-with-numerical-denominators","simplifying-multiplying-and-dividing-algebraic-fractions","solving-quadratic-equations-by-factorising","straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines"];
const used = new Map();
for (const slug of mine) {
  const b = JSON.parse(fs.readFileSync(path.join("packs/maths/content/m3", slug, "bundle.json"), "utf8"));
  const add = (id) => { if (!id) return; if (!used.has(id)) used.set(id, new Set()); used.get(id).add(slug); };
  b.diagnostics.forEach((d) => d.items.forEach((i) => i.options.forEach((o) => add(o.misconception))));
  b.questions.forEach((q) => q.parts.forEach((p) => p.commonErrors.forEach((e) => add(e.misconception))));
  b.findTheMistake.forEach((f) => add(f.misconception));
  (b.insight?.findings ?? []).forEach((f) => f.misconceptions.forEach(add));
}
const missing = [...used.keys()].filter((id) => !reg.has(id)).sort();
console.log(`${used.size} distinct misconception ids used across the 9 bundles`);
console.log(`${missing.length} NOT in packs/maths/insights/misconceptions.json:`);
for (const id of missing) console.log(`  ${id}  — used in: ${[...used.get(id)].join(", ")}`);
