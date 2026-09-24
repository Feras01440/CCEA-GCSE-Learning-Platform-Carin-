import { DRIFT } from "./lib.mjs";
import t1 from "./t1-hcf-lcm.mjs";
import t2 from "./t2-bounds.mjs";
import t3 from "./t3-identities.mjs";
import t4 from "./t4-factorising.mjs";
import t5 from "./t5-dots.mjs";
import t6 from "./t6-numeric-denoms.mjs";
import t7 from "./t7-simplify-multiply-divide.mjs";
import t8 from "./t8-solving-quadratics.mjs";
import t9 from "./t9-straight-lines.mjs";

for (const m of [t1, t2, t3, t4, t5, t6, t7, t8, t9]) m();

console.log(`\n=== distractor values that did not follow from their own feedback: ${DRIFT.length}`);
const byBundle = {};
for (const d of DRIFT) (byBundle[d.slug] ??= []).push(d);
for (const [slug, ds] of Object.entries(byBundle)) {
  console.log(`\n  ${slug}  (${ds.length})`);
  for (const d of ds) console.log(`    ${d.key.split("|").slice(1).join("/")}  was ${d.was}  ->  ${d.now}   [${d.desc}]`);
}
if (!DRIFT.length) console.log("  none — every stored value equals the result of executing its described error");
