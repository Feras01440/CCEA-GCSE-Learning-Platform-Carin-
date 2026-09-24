/**
 * Matrix-pair fix pass (fm1-g-matrices-1.md), 22 Sep: every finding re-verified against the bundle ON DISK
 * with the app's own marker. Prints one line per check; a line starting "FAIL" means the finding is still open
 * (or a fix broke something). Run before and after the generator edits.
 *
 *   npx tsx scratchpad/fm1-batch-g/probe-fixpass-0922.mts
 */
import fs from "node:fs";
import { markAnswer } from "../../src/components/items/mark.ts";

const load = (slug: string) => JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${slug}/bundle.json`, "utf8"));
const MA = load("matrix-arithmetic");
const MI = load("matrix-inverse-2x2");

let fails = 0;
let passes = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (cond) passes++;
  else fails++;
  console.log(`${cond ? "ok  " : "FAIL"} ${label}${detail ? `  :: ${detail}` : ""}`);
};
const q = (b: any, n: string) => b.questions.find((x: any) => x.id.endsWith(`.${n}`));
const part = (b: any, n: string, p: string) => q(b, n).parts.find((x: any) => x.id === p);
const post = (b: any) => b.diagnostics.find((d: any) => d.id.endsWith(".post"));
const mark = (raw: string, p: any) =>
  markAnswer(raw, p.answer, { marks: p.marks, commonErrors: p.commonErrors, prompt: p.stem } as never);
const earns = (we: any) => we.steps.flatMap((s: any) => s.earns ?? []);
const twinTariff = (we: any) => we.steps.reduce((a: number, s: any) => a + (s.earns?.length ?? 0), 0) || 1;

/* ------------------------------------------------------------------ matrix-arithmetic */
console.log("== matrix-arithmetic");
{
  const d3 = post(MA).items.find((i: any) => i.id === "d3");
  ok(/P\$ is \$2 \\times 2\$/.test(d3.stem) && /Q\$ is \$2 \\times 3\$/.test(d3.stem), "MA-1 d3 stem is the 2x2 / 2x3 pair", d3.stem);
  const right = d3.options.filter((o: any) => o.correct);
  ok(right.length === 1 && right[0].text === "$PQ$ only", "MA-1 d3 correct option is 'PQ only'", right.map((o: any) => o.text).join(" | "));
  ok(!JSON.stringify(d3).includes("3 \\\\times 3"), "MA-1 d3 mentions no 3 x 3 product");
  // inner numbers recomputed: P 2x2, Q 2x3 -> PQ inner 2,2 exists (2x3); QP inner 3,2 does not
  const P = [2, 2], Qs = [2, 3];
  ok(P[1] === Qs[0] && Qs[1] !== P[0], "MA-1 shape rule recomputed: PQ exists, QP does not");

  const b = part(MA, "0008", "b");
  ok(b.commonErrors.length === 0, "MA-2 q0008(b) carries no common error", JSON.stringify(b.commonErrors));
  const r2 = mark("7 -7; 14 14", b);
  ok(r2.marksAwarded === 0 && /2 by 3/.test(String(r2.explanation)), "MA-2 a 2x2 answer gets the engine's wrong-size line", `${r2.marksAwarded}/${b.marks} ${r2.explanation}`);
  const r2b = mark("0 12 -11; 14 8 16", b);
  ok(r2b.marksAwarded === b.marks, "MA-2 q0008(b) right answer full", `${r2b.marksAwarded}/${b.marks}`);

  const c = part(MA, "0008", "c");
  const probes: [string, number][] = [
    ["C has 3 columns and A has 2 rows, and they are not equal, so the product does not exist", 1],
    ["the number of columns of C is 3 and the number of rows of A is 2, so they do not match", 1],
    ["C has 3 columns but A has 2 rows, so they do not match", 1],
    ["3 and 2 are not equal", 1],
    ["the inner numbers differ", 1],
    ["C and A have the same number of columns, so the product works", 0],
    ["the columns of A match the columns of C", 0],
    ["A has 3 columns and C has 2 rows", 0],
    ["columns", 0],
    ["C has 3 columns and A has 2 rows, so they match", 0],
    ["the rows are the same", 0],
  ];
  for (const [raw, want] of probes) {
    const r = mark(raw, c);
    ok(r.marksAwarded === want, `MA-3 q0008(c) "${raw}" -> ${want}/1`, `${r.marksAwarded}/1 ${String(r.explanation).slice(0, 80)}`);
  }
  ok(c.answer.keyWords.length === 3, "MA-3 three key-word groups", String(c.answer.keyWords.length));

  const we = MA.workedExamples[0];
  const q4 = part(MA, "0004", "main");
  ok(JSON.stringify(earns(we)) === JSON.stringify(q4.scheme.map((s: any) => s.id)), "MA-4 we01 earns match q0004's scheme", `${earns(we)} vs ${q4.scheme.map((s: any) => s.id)}`);
  ok(twinTariff(we) === q4.marks, "MA-4 we01 twin marked out of q0004's tariff", `${twinTariff(we)} vs ${q4.marks}`);

  const f = MA.findTheMistake[0];
  ok(Array.isArray(f.marksEarnedAsWritten) && f.marksEarnedAsWritten.length === 0, "MA-5 ftm01 earns nothing as written", JSON.stringify(f.marksEarnedAsWritten));
  ok(!/earns its mark/.test(f.feedback), "MA-5 ftm01 feedback claims no mark", f.feedback.slice(0, 90));

  // 22 Sep, own finds in the same classes: subtracting where a sum was asked is not "a subtraction the wrong way round"
  const q1 = part(MA, "0001", "main");
  ok(q1.commonErrors.every((e: any) => e.misconception !== "fm.matrix.subtract-wrong-way"), "MA-x q0001 carries no subtract-wrong-way common error");
  const rq1 = mark("-2 -3; 3 4", q1);
  ok(rq1.marksAwarded === 0 && !(rq1.tags ?? []).length, "MA-x q0001 'A - B' still earns 0 of 2, untagged", `${rq1.marksAwarded} ${rq1.explanation}`);
  const d1 = post(MA).items.find((i: any) => i.id === "d1");
  ok(d1.options.find((o: any) => o.id === "c").misconception === undefined, "MA-x d1(c) B - A for a sum carries no tag");
  const q8a = part(MA, "0008", "a");
  const r8a = mark("-1 4; -5 -8", q8a);
  ok(r8a.marksAwarded === 1 && (r8a.tags ?? []).includes("fm.matrix.subtract-wrong-way"), "MA-x q0008(a) B - 2A keeps its subtract-wrong-way diagnosis (1 of 2)", `${r8a.marksAwarded} ${JSON.stringify(r8a.tags)}`);
  const noteMA = JSON.parse(fs.readFileSync("packs/further-maths/content/fm1/matrix-arithmetic/note.blocks.json", "utf8"));
  const allNote = JSON.stringify(noteMA);
  ok(!/Matrices open the paper/.test(allNote) && !/ignores positions entirely/.test(allNote) && !/bottom-right entry of \$A\$/.test(allNote), "MA-x note: the three false sentences are gone");
}

/* ------------------------------------------------------------------ matrix-inverse-2x2 */
console.log("== matrix-inverse-2x2");
{
  const m = part(MI, "0008", "main");
  // M = (k 4; 3 6): det = 6k - 12. Routes executed: products added 6k + 12 = 0; subtraction reversed 12 - 6k = 0.
  const added = -12 / 6;
  const reversed = 12 / 6;
  ok(added === -2 && reversed === m.answer.value, "MI-1 routes recomputed: products added gives -2, reversed subtraction gives the answer 2");
  const r1 = mark("-2", m);
  ok(r1.marksAwarded === 1, "MI-1 q0008 '-2' earns 1 of 2", `${r1.marksAwarded}/${m.marks}`);
  ok((r1.tags ?? []).includes("fm.matrix.determinant-products-added"), "MI-1 '-2' tagged products-added", JSON.stringify(r1.tags));
  ok(/adds the two diagonal products/.test(String(r1.explanation)) && !/other way round/.test(String(r1.explanation)), "MI-1 feedback names the products added", String(r1.explanation));
  ok(mark("2", m).marksAwarded === 2, "MI-1 q0008 '2' full");

  const d1 = post(MI).items.find((i: any) => i.id === "d1");
  const eleven = d1.options.find((o: any) => o.text === "$11$");
  ok(4 * 2 + 1 * 3 === 11, "MI-2 route recomputed: ad + bc = 11");
  ok(eleven?.misconception === "fm.matrix.determinant-products-added", "MI-2 d1 '11' tagged products-added", String(eleven?.misconception));
  const minus5 = d1.options.find((o: any) => o.text === "$-5$");
  ok(minus5?.misconception === "fm.matrix.determinant-sign-reversed", "MI-2 d1 '-5' keeps sign-reversed", String(minus5?.misconception));

  const d5 = post(MI).items.find((i: any) => i.id === "d5");
  const add = d5.options.find((o: any) => /zero matrix/.test(o.text));
  const recip = d5.options.find((o: any) => /reciprocal/.test(o.text));
  ok(add && add.misconception === undefined, "MI-3 d5 additive-inverse option carries no tag", String(add?.misconception));
  ok(recip?.misconception === "fm.matrix.elementwise-product", "MI-3 d5 reciprocal option keeps elementwise-product", String(recip?.misconception));

  const c = part(MI, "0009", "c");
  const probes: [string, number][] = [
    ["det H = 0, so H has no inverse because the formula divides by the determinant", 2],
    ["the determinant of H is zero, so H is singular and has no inverse", 2],
    ["det H = 18 - 18 = 0 so H has no inverse", 2],
    ["H has determinant 0 so it has no inverse", 2],
    ["the determinant is not zero, so the inverse exists", 0],
    ["det H is not 0", 0],
    ["the determinant is zero", 1],
    ["the determinant of F is zero", 1],
    ["H is singular", 1],
    ["zero", 0],
    ["H", 0],
  ];
  for (const [raw, want] of probes) {
    const r = mark(raw, c);
    ok(r.marksAwarded === want, `MI-5 q0009(c) "${raw}" -> ${want}/2`, `${r.marksAwarded}/2 ${String(r.explanation).slice(0, 80)}`);
  }
  const ws = mark(c.workedSolution, c);
  ok(ws.marksAwarded === 2, "MI-5 q0009(c) own worked solution earns 2/2", `${ws.marksAwarded}/2`);

  const q5 = part(MI, "0005", "main");
  const q9a = part(MI, "0009", "a");
  for (const [we, target] of [[MI.workedExamples[0], q5], [MI.workedExamples[1], q9a]] as const) {
    ok(JSON.stringify(earns(we)) === JSON.stringify(target.scheme.map((s: any) => s.id)), `MI-6 ${we.id} earns match the question's scheme`, `${earns(we)} vs ${target.scheme.map((s: any) => s.id)}`);
    ok(twinTariff(we) === target.marks, `MI-6 ${we.id} twin marked out of ${target.marks}`, String(twinTariff(we)));
    ok(we.steps.length === 4, `MI-6 ${we.id} keeps its check step`);
  }

  // q0003 option c: the determinant with the products added (3*4 + 6*2 = 24) must say so and carry that tag.
  const q3 = part(MI, "0003", "main");
  const c3 = q3.answer.options.find((o: any) => o.id === "c");
  ok(3 * 4 + 6 * 2 === 24 && /12 \+ 12 = 24/.test(c3.text), "MI-x q0003(c) prints the products-added determinant 12 + 12 = 24", c3.text);
  ok(c3.misconception === "fm.matrix.determinant-products-added", "MI-x q0003(c) tagged products-added", String(c3.misconception));

  // Lead's decision (22 Sep): "find the inverse" is CCEA's 2 marks, the determinant and the finished inverse.
  for (const [n, p] of [["0005", "main"], ["0009", "a"]] as const) {
    const pp = part(MI, n, p);
    ok(pp.marks === 2 && JSON.stringify(pp.scheme.map((s: any) => s.id)) === JSON.stringify(["MW1", "W1"]), `T q${n}(${p}) is 2 marks: MW1 determinant, W1 inverse`, `${pp.marks} ${pp.scheme.map((s: any) => s.id)}`);
    for (const e of pp.commonErrors) {
      const raw = `\\begin{pmatrix}${e.pattern.entries.map((r: string[]) => r.join(" & ")).join(" \\\\ ")}\\end{pmatrix}`;
      const r = mark(raw, pp);
      ok(e.marksTypicallyEarned === 1 && r.marksAwarded === 1, `T q${n}(${p}) ${e.misconception}: 1 of 2 (determinant kept)`, `${e.marksTypicallyEarned} ${r.marksAwarded}`);
    }
    const right = pp.answer.entries.map((r: string[]) => r.join(" ")).join("; ");
    ok(mark(right, pp).marksAwarded === 2, `T q${n}(${p}) right answer 2/2`);
  }
  for (const we of MI.workedExamples) {
    const r = markAnswer(we.twin.answer.entries.map((x: string[]) => x.join(" ")).join("; "), we.twin.answer, { marks: twinTariff(we), prompt: we.twin.stem } as never);
    ok(twinTariff(we) === 2 && r.marksAwarded === 2, `T ${we.id} twin marked out of 2, right answer 2/2`, `${twinTariff(we)} ${r.marksAwarded}`);
  }
  const ftmMI = MI.findTheMistake[0];
  ok(JSON.stringify(ftmMI.marksEarnedAsWritten) === JSON.stringify(["MW1"]) && !/most of the marks|method marks stand/.test(ftmMI.whatWentWrong + ftmMI.feedback), "T ftm01 earns MW1 only and says so", JSON.stringify(ftmMI.marksEarnedAsWritten));

  // MI-4 is waived by the lead (the scalar box has landed in MatrixField): the stem's promise must hold for the
  // string the field now submits, "<scalar> [<grid>]".
  const r4 = mark("1/5 [2 -1; -3 4]", q5);
  ok(r4.marksAwarded === q5.marks, "MI-4 (waived) q0005 scalar-box submission '1/5 [2 -1; -3 4]' earns full", `${r4.marksAwarded}/${q5.marks}`);
}

/* ------------------------------------------------------------------ matrix-equations (same defect classes) */
console.log("== matrix-equations");
{
  const ME = load("matrix-equations");
  const c = part(ME, "0009", "c");
  const probes: [string, number][] = [
    ["det S = 0, so S has no inverse and the equation cannot be solved", 2],
    ["the determinant of S is zero, so S is singular and there is no inverse to multiply by", 2],
    ["det S = 6 - 6 = 0 so S has no inverse", 2],
    ["the determinant is not zero, so it can be solved", 0],
    ["det S isn't 0", 0],
    ["S is not singular", 0],
    ["the determinant is zero", 1],
    ["S is singular", 1],
    ["the matrix has no inverse", 0],
    ["zero", 0],
  ];
  for (const [raw, want] of probes) {
    const r = mark(raw, c);
    ok(r.marksAwarded === want, `ME-1 q0009(c) "${raw}" -> ${want}/2`, `${r.marksAwarded}/2 ${String(r.explanation).slice(0, 80)}`);
  }
  ok(mark(c.workedSolution, c).marksAwarded === 2, "ME-1 q0009(c) own worked solution earns 2/2");

  const q4 = part(ME, "0004", "main");
  const q8 = part(ME, "0008", "main");
  const [we1, we2] = ME.workedExamples;
  ok(JSON.stringify(earns(we1)) === JSON.stringify(q4.scheme.map((s: any) => s.id)) && twinTariff(we1) === 4, "ME-2 we01 earns = q0004's scheme, twin out of 4", `${earns(we1)} / ${twinTariff(we1)}`);
  ok(we1.steps[0].earns === undefined, "ME-2 we01 shape check earns nothing");
  ok(JSON.stringify(earns(we2)) === JSON.stringify(q8.scheme.map((s: any) => s.id)) && twinTariff(we2) === 4, "ME-3 we02 earns = q0008's scheme, twin out of 4", `${earns(we2)} / ${twinTariff(we2)}`);
  // the new twin, re-solved by hand: A = (5 2; 2 1), C = (2; 1), B = (15; 6); B - C = (13; 5); A^-1 = (1 -2; -2 5)
  const tw = we2.twin.answer.entries.map((r: string[]) => r.map(Number));
  ok(/AX \+ C = B/.test(we2.twin.stem) && tw[0][0] === 1 * 13 - 2 * 5 && tw[1][0] === -2 * 13 + 5 * 5, "ME-3 we02 twin is AX + C = B and solves to (3; -1)", JSON.stringify(tw));
  ok(5 * 3 + 2 * -1 + 2 === 15 && 2 * 3 + 1 * -1 + 1 === 6, "ME-3 we02 twin substituted back: AX + C = (15; 6)");
  const r3 = markAnswer("3; -1", we2.twin.answer, { marks: twinTariff(we2), prompt: we2.twin.stem } as never);
  ok(r3.marksAwarded === 4, "ME-3 we02 twin right answer earns 4/4", `${r3.marksAwarded}`);

  const q5 = part(ME, "0005", "main");
  const f = ME.findTheMistake[0];
  ok(JSON.stringify(f.marksEarnedAsWritten) === JSON.stringify(q5.scheme.slice(0, 2).map((s: any) => s.id)), "ME-4 ftm earned = q0005's determinant and inverse marks", `${f.marksEarnedAsWritten} vs ${q5.scheme.map((s: any) => s.id + ":" + s.for.slice(0, 20))}`);
  ok(/det/.test(q5.scheme[0].for) && /A\^\{-1\} =/.test(q5.scheme[1].for) && /in front/.test(q5.scheme[2].for), "ME-4 q0005 scheme reads determinant, inverse, order, answer");
  const rq5 = mark("-1 3; 3 -4", q5);
  ok(rq5.marksAwarded === f.marksEarnedAsWritten.length, "ME-4 q0005 BA^-1 earns what the ftm says the same working earns", `${rq5.marksAwarded}/4`);
  ok(!/marked on his own value/.test(f.feedback), "ME-4 ftm feedback no longer promises follow-through on a wrong order");

  const q9b = part(ME, "0009", "b");
  const r9 = mark("-1 3; 3 -4", q9b);
  ok(r9.marksAwarded === 0 && (r9.tags ?? []).includes("fm.matrix.inverse-order"), "ME-5 q0009(b) BA^-1 earns 0 of 3 under its scheme, diagnosed", `${r9.marksAwarded}/3 ${JSON.stringify(r9.tags)}`);

  const wantTags: Record<string, string> = {
    "d1.b": "fm.matrix.subtract-wrong-way", "d1.c": "fm.matrix.equation-undone-wrongly",
    "d2.b": "fm.matrix.inverse-order", "d2.c": "fm.matrix.equation-undone-wrongly",
    "d3.b": "fm.matrix.inverse-order", "d3.c": "fm.matrix.equation-undone-wrongly",
    "d4.b": "fm.matrix.equation-undone-wrongly", "d4.c": "fm.matrix.equation-undone-wrongly",
    "d5.b": "fm.matrix.singular-not-recognised", "d5.c": "fm.matrix.singular-not-recognised",
  };
  for (const it of post(ME).items) for (const o of it.options.filter((x: any) => !x.correct)) {
    ok(o.misconception === wantTags[`${it.id}.${o.id}`], `ME-6 post ${it.id}/${o.id} tag`, `${o.misconception}`);
  }
  for (const n of ["0008", "0010"]) {
    const p = part(ME, n, n === "0008" ? "main" : "b");
    const r = mark("-6; 5", p);
    ok(r.marksAwarded === 1 && (r.tags ?? []).includes("fm.matrix.equation-undone-wrongly"), `ME-6 q${n} A^-1 B with C never cleared: 1 of 4, retagged`, `${r.marksAwarded} ${JSON.stringify(r.tags)}`);
  }
  // the route executed: A = (4 7; 1 2), A^-1 = (2 -7; -1 4), A^-1 B for B = (11; 4)
  ok(2 * 11 - 7 * 4 === -6 && -1 * 11 + 4 * 4 === 5, "ME-6 route recomputed: A^-1 B = (-6; 5)");
  const traps = ME.note.sheet.traps.join("\n");
  ok(/Summer 2019 FM1 Q5/.test(traps) && !/added matrix is still in the equation \(Summer 2024/.test(traps), "ME-7 traps cite 2019 Q5; no 2024 attribution on the added-matrix trap");
}

/* ------------------------------------------------------------------ matrix-simultaneous-equations (same classes) */
console.log("== matrix-simultaneous-equations");
{
  const MS = load("matrix-simultaneous-equations");
  const c = part(MS, "0008", "main");
  const probes: [string, number][] = [
    ["the determinant of the coefficient matrix is 0, so it has no inverse and there is no unique solution", 2],
    ["det A = 0, so the coefficient matrix is singular and cannot be inverted", 2],
    ["det A = 12 - 12 = 0 so there is no unique solution", 2],
    ["the determinant is 0 so the matrix has no inverse", 2],
    ["the determinant is zero", 1],
    ["the coefficient matrix is singular", 1],
    ["the lines are parallel", 1],
    ["the determinant is not zero so it can be solved", 0],
    ["det A is not 0, so there is an inverse", 0],
    ["the matrix is not singular", 0],
    ["zero", 0],
    ["det", 0],
  ];
  for (const [raw, want] of probes) {
    const r = mark(raw, c);
    ok(r.marksAwarded === want, `MS-1 q0008 "${raw}" -> ${want}/2`, `${r.marksAwarded}/2 ${String(r.explanation).slice(0, 80)}`);
  }
  ok(mark(c.workedSolution, c).marksAwarded === 2, "MS-1 q0008 own worked solution earns 2/2");
  // 2x + 3y = 7, 4x + 6y = 11: det = 12 - 12 = 0, and 2(2x + 3y) = 14, not 11, so the lines are parallel and distinct
  ok(2 * 6 - 3 * 4 === 0 && 2 * 7 !== 11, "MS-1 maths: det 0 and the second equation is not a multiple of the first, so no solution at all");

  const MISF = "fm.matrix.coefficient-matrix-misformed";
  const d1 = post(MS).items.find((i: any) => i.id === "d1");
  const d2 = post(MS).items.find((i: any) => i.id === "d2");
  for (const o of [...d1.options, ...d2.options].filter((x: any) => !x.correct)) ok(o.misconception === MISF, `MS-2 post ${o.id} (${o.text.slice(0, 30)}) tagged misformed`, String(o.misconception));
  const q1 = part(MS, "0001", "main");
  for (const [raw, lbl] of [["4 2; 3 5", "read down the columns"], ["4 18; 2 16", "constants inside"]] as const) {
    const r = mark(raw, q1);
    ok(r.marksAwarded === 0 && (r.tags ?? []).includes(MISF), `MS-2 q0001 ${lbl}: 0/1, tagged misformed`, `${r.marksAwarded} ${JSON.stringify(r.tags)}`);
  }
  const q2 = part(MS, "0002", "main");
  const r2 = mark("5 -2; 3 4", q2);
  ok(r2.marksAwarded === 1 && (r2.tags ?? []).includes(MISF), "MS-2 q0002 sign kept across the equals: 1/2, tagged misformed", `${r2.marksAwarded} ${JSON.stringify(r2.tags)}`);

  const q5 = part(MS, "0005", "main");
  ok(/\\begin\{pmatrix\}x \\\\ y\\end\{pmatrix\}/.test(q5.scheme[0].for) && !/pmatrix\}0 \\\\ 0/.test(q5.scheme[0].for), "MS-3 q0005 MW1 prints the unknowns column, not a zero column", q5.scheme[0].for);

  const q10a = part(MS, "0010", "a");
  for (const [raw, want] of [
    ["3n + 2p = 19 and 5n + 4p = 33", 2], ["2p + 3n = 19 and 4p + 5n = 33", 2], ["19 = 3n + 2p, 33 = 5n + 4p", 2],
    ["3n+2p=19, 5n+4p=33", 2], ["3n + 2p = 19", 1], ["3n + 2p = 33 and 5n + 4p = 19", 0],
  ] as const) {
    const r = mark(raw, q10a);
    ok(r.marksAwarded === want, `MS-4 q0010(a) "${raw}" -> ${want}/2`, `${r.marksAwarded}/2`);
  }
  ok(mark(q10a.workedSolution, q10a).marksAwarded === 2, "MS-4 q0010(a) own worked solution earns 2/2");
  const traps = MS.note.sheet.traps.join("\n");
  ok(!/Not recognising that a zero determinant/.test(traps), "MS-5 the 2023 Q6 trap says what the report says (naming the matrix)");
}

console.log(`\n${passes} ok, ${fails} FAIL`);
