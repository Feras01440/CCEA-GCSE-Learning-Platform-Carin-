/**
 * FM1 batch G — the new `matrix` answer kind, probed before any part is converted to it.
 * Every accepted input form the announcement lists is tried, plus the wrong-shaped and
 * transposed answers, plus a matrix commonError pattern.
 */
import { markAnswer, matchesCommonError } from "../../src/components/items/mark.ts";
import type { AnswerSpec, CommonError } from "../../src/lib/content/schema.ts";

const spec = {
  kind: "matrix",
  rows: 2,
  cols: 2,
  entries: [["16", "6"], ["6", "4"]],
  tolerance: { type: "absolute", value: 0.0005 },
} as unknown as AnswerSpec;

const ACCEPTED = [
  "\\begin{pmatrix}16 & 6 \\\\ 6 & 4\\end{pmatrix}",
  "$\\begin{pmatrix}16 & 6 \\\\ 6 & 4\\end{pmatrix}$",
  "\\begin{bmatrix}16 & 6 \\\\ 6 & 4\\end{bmatrix}",
  "\\begin{Bmatrix}16 & 6 \\\\ 6 & 4\\end{Bmatrix}",
  "\\begin{vmatrix}16 & 6 \\\\ 6 & 4\\end{vmatrix}",
  "\\begin{Vmatrix}16 & 6 \\\\ 6 & 4\\end{Vmatrix}",
  "\\begin{matrix}16 & 6 \\\\ 6 & 4\\end{matrix}",
  "\\begin{smallmatrix}16 & 6 \\\\ 6 & 4\\end{smallmatrix}",
  "[[16,6],[6,4]]",
  "16 6; 6 4",
  "AB = \\begin{pmatrix}16 & 6 \\\\ 6 & 4\\end{pmatrix}",
  "A^{-1} = \\begin{pmatrix}16 & 6 \\\\ 6 & 4\\end{pmatrix}",
];
const WRONG = [
  ["a transpose", "\\begin{pmatrix}16 & 6 \\\\ 6 & 4\\end{pmatrix}".replace("16 & 6 \\\\ 6 & 4", "16 & 6 \\\\ 6 & 4")],
  ["one entry out", "\\begin{pmatrix}16 & 6 \\\\ 6 & 5\\end{pmatrix}"],
  ["a real transpose", "\\begin{pmatrix}0 & 12 \\\\ -11 & 14\\end{pmatrix}"],
  ["wrong size", "\\begin{pmatrix}16 & 6 & 0 \\\\ 6 & 4 & 0\\end{pmatrix}"],
  ["minus glyphs", "\\begin{pmatrix}16 & 6 \\\\ 6 & 4\\end{pmatrix}".replace("4", "4")],
];

console.log("== accepted input forms");
for (const raw of ACCEPTED) {
  const r = markAnswer(raw, spec, { marks: 3 });
  console.log(`   ${JSON.stringify(raw).slice(0, 56).padEnd(58)} -> ${String(r.correct).padEnd(5)} ${r.marksAwarded}/3 | ${String(r.explanation).slice(0, 60)}`);
}

console.log("== wrong answers");
for (const [label, raw] of WRONG) {
  const r = markAnswer(raw, spec, { marks: 3 });
  console.log(`   ${label.padEnd(18)} -> ${String(r.correct).padEnd(5)} ${r.marksAwarded}/3 | ${String(r.explanation).slice(0, 80)}`);
}

console.log("== a transposed answer against a non-symmetric spec");
const nonSym = {
  kind: "matrix", rows: 2, cols: 2,
  entries: [["7", "-7"], ["14", "14"]],
  tolerance: { type: "absolute", value: 0.0005 },
} as unknown as AnswerSpec;
for (const raw of ["\\begin{pmatrix}7 & -7 \\\\ 14 & 14\\end{pmatrix}", "\\begin{pmatrix}7 & 14 \\\\ -7 & 14\\end{pmatrix}", "\\begin{pmatrix}7 & \u22127 \\\\ 14 & 14\\end{pmatrix}"]) {
  const r = markAnswer(raw, nonSym, { marks: 2 });
  console.log(`   ${JSON.stringify(raw).slice(0, 52).padEnd(54)} -> ${String(r.correct).padEnd(5)} ${r.marksAwarded}/2 | ${String(r.explanation).slice(0, 80)}`);
}

console.log("== a matrix commonError");
const err: CommonError = {
  misconception: "fm.matrix.elementwise-product",
  pattern: { kind: "matrix", entries: [["15", "-2"], ["-2", "0"]] } as unknown as CommonError["pattern"],
  feedback: "The entries in matching positions were multiplied.",
  marksTypicallyEarned: 0,
};
for (const raw of ["\\begin{pmatrix}15 & -2 \\\\ -2 & 0\\end{pmatrix}", "15 -2; -2 0", "\\begin{pmatrix}16 & 6 \\\\ 6 & 4\\end{pmatrix}"]) {
  const fires = matchesCommonError(raw, err);
  const r = markAnswer(raw, spec, { marks: 3, commonErrors: [err] });
  console.log(`   ${JSON.stringify(raw).slice(0, 46).padEnd(48)} fires=${String(fires).padEnd(5)} marks=${r.marksAwarded} tags=${JSON.stringify(r.tags ?? [])}`);
}

console.log("== fractional entries, written with the scalar multiplied in");
const fracSpec = {
  kind: "matrix", rows: 2, cols: 2,
  entries: [["0.4", "-0.2"], ["-0.6", "0.8"]],
  tolerance: { type: "absolute", value: 0.0005 },
} as unknown as AnswerSpec;
for (const raw of [
  "\\begin{pmatrix}0.4 & -0.2 \\\\ -0.6 & 0.8\\end{pmatrix}",
  "\\begin{pmatrix}2/5 & -1/5 \\\\ -3/5 & 4/5\\end{pmatrix}",
  "\\begin{pmatrix}\\frac{2}{5} & -\\frac{1}{5} \\\\ -\\frac{3}{5} & \\frac{4}{5}\\end{pmatrix}",
  "\\frac{1}{5}\\begin{pmatrix}2 & -1 \\\\ -3 & 4\\end{pmatrix}",
  "0.2\\begin{pmatrix}2 & -1 \\\\ -3 & 4\\end{pmatrix}",
  "\\frac{1}{5} \\times \\begin{pmatrix}2 & -1 \\\\ -3 & 4\\end{pmatrix}",
  "-\\frac{1}{5}\\begin{pmatrix}-2 & 1 \\\\ 3 & -4\\end{pmatrix}",
  "\\frac{1}{5}[[2,-1],[-3,4]]",
]) {
  const r = markAnswer(raw, fracSpec, { marks: 3 });
  console.log(`   ${JSON.stringify(raw).slice(0, 56).padEnd(58)} -> ${String(r.correct).padEnd(5)} ${r.marksAwarded}/3 | ${String(r.explanation).slice(0, 60)}`);
}
