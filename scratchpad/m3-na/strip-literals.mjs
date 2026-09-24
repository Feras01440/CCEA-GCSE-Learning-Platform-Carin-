/**
 * Remove every hand-typed numeric distractor value from the generators.
 * After this, `pattern: { kind: "numeric" }` carries no number at all and
 * applyErrorRoutes() is the only thing that can put one there — so a stored
 * value can never again disagree with the error its feedback describes.
 */
import fs from "node:fs";

const FILES = [
  "t1-hcf-lcm.mjs", "t2-bounds.mjs", "t3-identities.mjs", "t4-factorising.mjs",
  "t5-dots.mjs", "t6-numeric-denoms.mjs", "t7-simplify-multiply-divide.mjs",
  "t8-solving-quadratics.mjs", "t9-straight-lines.mjs",
];
const RE = /pattern:\s*\{\s*kind:\s*"numeric",\s*value:\s*-?[\d.]+\s*\}/g;

let total = 0;
for (const f of FILES) {
  const p = `scratchpad/m3-na/${f}`;
  const src = fs.readFileSync(p, "utf8");
  const hits = src.match(RE) ?? [];
  if (!hits.length) { console.log(`${f}: 0`); continue; }
  fs.writeFileSync(p, src.replace(RE, 'pattern: { kind: "numeric" }'));
  total += hits.length;
  console.log(`${f}: ${hits.length} literal(s) removed`);
}
console.log(`\n${total} hand-typed distractor values removed; all now come from error-routes.mjs`);
