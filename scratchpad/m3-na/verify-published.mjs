/**
 * Independent check: read the PUBLISHED bundle.json files and re-execute every
 * declared error route against the value actually stored on disk.
 */
import fs from "node:fs";
import path from "node:path";
import { SLUGS } from "./slugs.mjs";
import { ROUTES } from "./error-routes.mjs";

let checked = 0, bad = 0, unrouted = 0;
for (const slug of SLUGS) {
  const b = JSON.parse(fs.readFileSync(path.join("packs/maths/content/m3", slug, "bundle.json"), "utf8"));
  for (const q of b.questions) {
    const qn = q.id.split(".").pop();
    for (const p of q.parts) {
      p.commonErrors.forEach((e, i) => {
        if (e.pattern.kind !== "numeric") return;
        checked++;
        const key = `${slug}|${qn}|${p.id}|${i}`;
        const route = ROUTES[key];
        if (!route || route.value === null) { unrouted++; console.log(`UNROUTED ${key}`); return; }
        if (Math.abs(e.pattern.value - route.value) > 1e-9) {
          bad++;
          console.log(`MISMATCH ${key}: stored ${e.pattern.value}, route gives ${route.value}  [${route.desc}]`);
        }
      });
    }
  }
}
console.log(`\n${checked} numeric distractor(s) on disk re-executed: ${bad} mismatch(es), ${unrouted} without a route.`);

// answer-encoding sweep: no multi-value answer may be stored as a single number
const MULTI = /\band\b.*\bvalue of\b|two possible|both|coordinates of the point|coordinates of the points|midpoint|minutes and seconds|Find \$p\$ and \$q\$|the HCF and the LCM|upper bound and the lower bound/i;
let enc = 0;
for (const slug of SLUGS) {
  const b = JSON.parse(fs.readFileSync(path.join("packs/maths/content/m3", slug, "bundle.json"), "utf8"));
  const look = (stem, ans, where) => {
    if (ans.kind === "numeric" && MULTI.test(stem)) { enc++; console.log(`SINGLE-NUMBER answer for a multi-value demand: ${where}\n    ${stem.replace(/\n+/g, " ").slice(0, 120)}`); }
  };
  b.questions.forEach((q) => q.parts.forEach((p) => look(p.stem, p.answer, `${q.id} part ${p.id}`)));
  b.workedExamples.forEach((w) => look(w.twin.stem, w.twin.answer, `${w.id} twin`));
}
console.log(`${enc} multi-value answer(s) still encoded as a single number.`);
if (bad || unrouted || enc) process.exitCode = 1;
