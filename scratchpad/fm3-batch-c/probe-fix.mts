// Probes the fix box (markFix, 23 Sep engine) on every published find-the-mistake item of the batch,
// with the natural fixes a learner would type.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";
const { markFix, resultValue, lastNumber } = await import(pathToFileURL(path.join(ROOT, "src/components/items/mistake-marking.ts")).href);

for (const slug of ["binomial-probabilities", "normal-distribution-z-probabilities", "pascals-triangle-binomial-expansion", "normal-distribution-bell-curve"]) {
  const p = path.join(ROOT, "packs/further-maths/content/fm3", slug, "bundle.json");
  if (!fs.existsSync(p)) continue;
  const b = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const f of b.findTheMistake) {
    const item = { correction: f.correction, studentWorking: f.studentWorking, mistakeLine: f.mistakeLine };
    const last = f.correction[f.correction.length - 1];
    const fixLine = f.correction[f.mistakeLine - 1];
    const target = resultValue(last, "authored");
    const tries = [fixLine, last, String(target ?? lastNumber(last)), f.studentWorking[f.mistakeLine - 1]];
    // the fix line with its label dropped, and the value after the last "=" alone
    const afterEq = fixLine.split("=").pop()?.trim();
    if (afterEq) tries.push(afterEq);
    console.log(`\n${f.id}  (target ${target})`);
    for (const t of tries) console.log(`  ${JSON.stringify(markFix(t, item))}  <- ${t}`);
  }
}
