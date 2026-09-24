/** Enumerate every numeric commonError across the nine M3 NA bundles. */
import fs from "node:fs";
import path from "node:path";
import { SLUGS } from "./slugs.mjs";

let n = 0;
for (const slug of SLUGS) {
  const b = JSON.parse(fs.readFileSync(path.join("packs/maths/content/m3", slug, "bundle.json"), "utf8"));
  const rows = [];
  for (const q of b.questions) {
    for (const p of q.parts) {
      p.commonErrors.forEach((e, i) => {
        if (e.pattern.kind !== "numeric") return;
        n++;
        const qn = q.id.split(".").pop();
        rows.push(`  ${qn}/${p.id}#${i}  value=${e.pattern.value}  mis=${e.misconception}\n      stem: ${p.stem.replace(/\n+/g, " ").slice(0, 110)}\n      fb:   ${e.feedback.replace(/\n+/g, " ").slice(0, 150)}`);
      });
    }
  }
  if (rows.length) {
    console.log(`\n=== ${slug}  (${rows.length} numeric commonErrors)`);
    console.log(rows.join("\n"));
  }
}
console.log(`\nTOTAL numeric commonErrors: ${n}`);
