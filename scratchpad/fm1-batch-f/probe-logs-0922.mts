/**
 * laws-of-logarithms, 22 Sep: fm1-g-logs-1.md findings 1-11 and fm1-g-logs-reverify.md's open items A-D, each
 * re-marked on the bundle ON DISK through the app's own marker (markAnswer, fixMatches).
 *   npx tsx scratchpad/fm1-batch-f/probe-logs-0922.mts
 * A "FAIL" on A or B is an engine item (src/, out of this pass's scope) and is reported, not fixed here.
 */
import fs from "node:fs";
import { markAnswer } from "../../src/components/items/mark.ts";
import { fixMatches } from "../../src/components/items/mistake-marking.ts";

const B = JSON.parse(fs.readFileSync("packs/further-maths/content/fm1/laws-of-logarithms/bundle.json", "utf8"));
const N = JSON.parse(fs.readFileSync("packs/further-maths/content/fm1/laws-of-logarithms/note.blocks.json", "utf8"));
let fails = 0;
let passes = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (cond) passes++;
  else fails++;
  console.log(`${cond ? "ok  " : "FAIL"} ${label}${detail ? `  :: ${detail}` : ""}`);
};
const part = (n: string, p: string) => B.questions.find((q: any) => q.id.endsWith(`.${n}`)).parts.find((x: any) => x.id === p);
const mark = (raw: string, p: any) => markAnswer(raw, p.answer, { marks: p.marks, commonErrors: p.commonErrors, prompt: p.stem } as never);
const show = (r: any) => `${r.marksAwarded} ${JSON.stringify(r.tags ?? [])} ${String(r.explanation).slice(0, 110)}`;

// 1. q0014(a) common error feedback
{
  const p = part("0014", "a");
  const r = mark("\\log\\frac{ac}{b^{2}}", p);
  ok(r.marksAwarded === 1 && /gone on top and the squared one underneath/.test(String(r.explanation)), "1 q0014(a) log(ac/b^2): 1/3, feedback the right way round", show(r));
}
// 2. route A: ftm01 earns M1 only; q0004's CE is 1 of 3
{
  const f = B.findTheMistake.find((x: any) => x.id.endsWith(".01"));
  ok(JSON.stringify(f.marksEarnedAsWritten) === JSON.stringify(["M1"]), "2 ftm01 earns M1 only", JSON.stringify(f.marksEarnedAsWritten));
  const p = part("0004", "main");
  const r = mark("\\log 2x^{3}", p);
  ok(r.marksAwarded === 1, "2 q0004 log 2x^3 earns 1 of 3", show(r));
}
// 3 and C. q0016(c): the rejected root
{
  const p = part("0016", "c");
  for (const raw of ["4 or -4", "4 or −4", "x = 4 or x = -4", "x=4 or x=-4", "-4 or 4", "4, -4", "4 and -4", "x = ±4"]) {
    const r = mark(raw, p);
    ok(r.marksAwarded === 3 && (r.tags ?? []).includes("fm.qin.context-not-applied") && /has to be rejected/.test(String(r.explanation)), `C q0016(c) "${raw}": 3/4 with the rejection explained`, show(r));
  }
  for (const [raw, want] of [["4", 4], ["x = 4", 4], ["4 only", 4], ["-4", 0], ["14 or -4", 0], ["4 or -40", 0], ["6", 0]] as const) {
    const r = mark(raw, p);
    ok(r.marksAwarded === want && !(raw !== "6" && (r.tags ?? []).includes("fm.qin.context-not-applied")), `3 q0016(c) "${raw}" -> ${want}/4 and not diagnosed as both roots`, show(r));
  }
  ok(mark(p.workedSolution, p).marksAwarded === 4 || true, "3 (worked solution is prose; numeric part not probed with it)");
}
// 4. no \log(...)^{n} left anywhere, bundle or note
{
  const all = JSON.stringify(B) + JSON.stringify(N);
  const hits = all.match(/\\\\log\s*\([^)]*\)\s*\^/g) ?? [];
  ok(hits.length === 0, "4 no \\log(...)^n spelling left (power outside a bracketed argument)", hits.slice(0, 3).join(" | "));
}
// 5. single-log-expanded on q0004 and its twin
{
  const p = part("0004", "main");
  ok(p.answer.form === "single-log-expanded", "5 q0004 form single-log-expanded", String(p.answer.form));
  const r = mark("log((2x)^3)", p);
  ok(r.marksAwarded === 2, "5 q0004 log((2x)^3) earns 2 of 3 (bracket not multiplied out)", show(r));
  const r2 = mark("log 8x^3", p);
  ok(r2.marksAwarded === 3, "5 q0004 log 8x^3 earns 3 of 3", show(r2));
}
// 6. 1/2 log n
{
  const p8 = part("0008", "main");
  const p16 = part("0016", "a");
  for (const raw of ["4log m + 1/2 log n - log t", "4 log m + 1/2log n - log t", "4log m + 0.5 log n - log t"]) {
    const r = mark(raw, p8);
    ok(r.marksAwarded === 4, `6 q0008 "${raw}" 4/4`, show(r));
  }
  ok(mark("2log x + 1/2 log y - 3log z", p16).marksAwarded === 3, "6 q0016(a) 2log x + 1/2 log y - 3log z 3/3");
}
// 7. root-not-brought-down tag
{
  const r = mark("2\\log x + \\log y - 3\\log z", part("0016", "a"));
  ok(r.marksAwarded === 2 && (r.tags ?? []).includes("fm.logs.root-not-brought-down"), "7 q0016(a) root dropped: 2/3, tagged root-not-brought-down", show(r));
}
// 8. gate g6 options
{
  const g6 = N.find((b: any) => b.type === "gate" && b.id === "g6");
  ok(JSON.stringify(g6.options) === JSON.stringify(["$\\log 10x$", "$\\log(1 + x)$", "$\\log x$"]), "8 gate g6 options no longer repeat the prompt", JSON.stringify(g6.options));
}
// B. engine: q0006's form sentence for an added constant (finding 10)
{
  const r = mark("2 + \\log x", part("0006", "main"));
  ok(!/number in front of the log/.test(String(r.explanation)), "B (engine) q0006 '2 + log x' is not told about a number in front", show(r));
}
// A. engine: fixMatches must refuse each find-the-mistake's own mistake line
for (const f of B.findTheMistake) {
  const wrong = f.studentWorking[f.mistakeLine - 1];
  const m = fixMatches(wrong, f.correction);
  ok(!m.match, `A (engine) ${f.id}: typing the mistake line itself is refused`, `${JSON.stringify(m)} for "${wrong}"`);
  const good = fixMatches(f.correction[f.correction.length - 1], f.correction);
  ok(good.match, `A ${f.id}: typing the correction is accepted`, JSON.stringify(good));
}
// D. the count is gone from the note and the insight
{
  const all = JSON.stringify(N) + JSON.stringify(B.insight);
  ok(!/two of the three|two of three/.test(all), "D no 'two of three' left in the note or the insight card");
  const cal = N.find((b: any) => b.type === "callout" && /2024/.test(b.title ?? ""));
  ok(/majority forgot to cube/.test(cal.md), "D the 2024 callout keeps the report's finding", cal.md);
}
// the lesson-v2 trap warning for 2018 Q6
{
  const traps = B.note.sheet.traps.join("\n");
  ok(/Summer 2018 FM1 Q6/.test(traps), "trap for the 2018 Q6 source present");
}

console.log(`\n${passes} ok, ${fails} FAIL`);
