/**
 * 23 Sep evening (fix pass): fm1/algebraic-fractions-simplify ftm.01 after its line 3 and the correction's second
 * line were changed from "Cancel (x)" to "Cancel (x - 4)". Marked ON DISK through the fix box's own verdict (markFix).
 *   npx tsx scratchpad/fm1-batch-g/probe-afs-ftm01.mts
 */
import fs from "node:fs";
import { markFix } from "../../src/components/items/mistake-marking.ts";

const B = JSON.parse(fs.readFileSync("packs/further-maths/content/fm1/algebraic-fractions-simplify/bundle.json", "utf8"));
const f = B.findTheMistake.find((x: any) => x.id === "ftm.fm.u1.algebraic-fractions-simplify.01");
let passes = 0;
let fails = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (cond) passes++;
  else fails++;
  if (!cond || process.argv.includes("--all")) console.log(`${cond ? "ok  " : "FAIL"} ${label}${detail ? `  :: ${detail}` : ""}`);
};

ok(f.studentWorking[2] === "Cancel (x - 4)", "line 3 names the bracket", JSON.stringify(f.studentWorking[2]));
ok(String(f.correction[1]).startsWith("Cancel (x - 4), "), "the correction's line 2 names the bracket", JSON.stringify(f.correction[1]));
ok(!f.studentWorking.some((l: string) => /\(x\)/.test(l)) && !f.correction.some((l: string) => /\(x\)/.test(l)), "no line says (x) any more");
ok(f.mistakeLine === 4, "the flagged line is still line 4");
for (const line of f.studentWorking) ok(!markFix(line, f).match, `refuses her line ${JSON.stringify(line)}`, JSON.stringify(markFix(line, f)));
for (const t of ["3x²/x", "3x^2/x", "(3x²) over x", "3x^2 / x", "x(x - 4)"]) ok(!markFix(t, f).match, `refuses the non-fix ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
for (const t of [...f.correction, "3x", "Answer 3x", "= 3x", "answer 3x"]) ok(markFix(t, f).match, `accepts ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
const log = B.verification.find((v: any) => v.itemId === f.id);
ok(log.status === "verified" && log.checks.filter((c: any) => c.at === "2026-09-23T18:55:00Z").length === 1 && log.checks.some((c: any) => c.at === "2026-09-23T18:55:00Z" && /Cancel \(x - 4\)/.test(c.detail)), "the log records the fix pass, once");
ok(f.correction[f.correction.length - 1] === "Answer: 3x", "the correction ends Answer: 3x", JSON.stringify(f.correction));

console.log(`probe-afs-ftm01: ${passes} ok, ${fails} FAIL`);
process.exitCode = fails ? 1 : 0;
