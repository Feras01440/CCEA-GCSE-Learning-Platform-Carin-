/* Probe the app's own marker for the answer encodings FM1 batch E plans to use. */
import { markAnswer } from "../../src/components/items/mark.ts";
import type { AnswerSpec } from "../../src/lib/content/schema.ts";

function show(label: string, raw: string, spec: AnswerSpec) {
  const r = markAnswer(raw, spec, { marks: 2 });
  console.log(`${label} | "${raw}" -> correct=${r.correct} marks=${r.marksAwarded}/${r.marksAvailable} :: ${String(r.explanation).slice(0, 110)}`);
}

const twoPoints: AnswerSpec = { kind: "algebraic", latex: "(1, 0), (5, 0)", equivalence: "equivalent", variables: ["x", "y"] };
console.log("--- two coordinate pairs ---");
for (const a of ["(1, 0), (5, 0)", "(5, 0), (1, 0)", "(1,0) and (5,0)", "x = 1, y = 0 or x = 5, y = 0", "(1, 0)", "1, 5", "(0, 1), (0, 5)"]) show("2pts", a, twoPoints);

const threePoints: AnswerSpec = { kind: "algebraic", latex: "(-4, 0), (-1, 0), (4, 0)", equivalence: "equivalent", variables: ["x", "y"] };
console.log("--- three coordinate pairs ---");
for (const a of ["(-4, 0), (-1, 0), (4, 0)", "(4,0),(-1,0),(-4,0)", "(-4, 0), (-1, 0), (0, 0), (4, 0)", "(-4,0), (-1,0)"]) show("3pts", a, threePoints);

const onePoint: AnswerSpec = { kind: "algebraic", latex: "(3, -4)", equivalence: "equivalent", variables: ["x", "y"] };
console.log("--- one coordinate pair ---");
for (const a of ["(3, -4)", "3, -4", "x = 3, y = -4", "(3,-4)", "(-4, 3)", "(3, 4)"]) show("1pt", a, onePoint);

const fracPoint: AnswerSpec = { kind: "algebraic", latex: "\\left(\\frac{20}{3}, -\\frac{400}{27}\\right)", equivalence: "equivalent", variables: ["x", "y"] };
console.log("--- fractional coordinate pair ---");
for (const a of ["(20/3, -400/27)", "(6.67, -14.81)", "(6.666666, -14.814814)"]) show("frac", a, fracPoint);

const fracPoint2: AnswerSpec = { kind: "algebraic", latex: "(\\frac{20}{3}, -\\frac{400}{27})", equivalence: "equivalent", variables: ["x", "y"] };
console.log("--- fractional pair, plain brackets ---");
for (const a of ["(20/3, -400/27)", "(6.67, -14.81)"]) show("frac2", a, fracPoint2);

console.log("--- indefinite integral with + c ---");
const withC: AnswerSpec = { kind: "algebraic", latex: "2x^{3} - 2x^{2} + 5x + c", equivalence: "equivalent", variables: ["x", "c"] };
for (const a of ["2x^3 - 2x^2 + 5x + c", "2x^3-2x^2+5x+c", "2x^3 - 2x^2 + 5x", "2x^3 - 2x^2 + 5x + k", "c + 5x - 2x^2 + 2x^3"]) show("intc", a, withC);

console.log("--- curve equation from a point ---");
const curveEq: AnswerSpec = { kind: "algebraic", latex: "y = x^{4} + \\frac{6}{x} + 5x - 17", equivalence: "equivalent", variables: ["x", "y"] };
for (const a of ["y = x^4 + 6/x + 5x - 17", "y=x^4+6x^{-1}+5x-17", "x^4 + 6/x + 5x - 17"]) show("curve", a, curveEq);

console.log("--- algebraic in k ---");
const inK: AnswerSpec = { kind: "algebraic", latex: "2k + 12", equivalence: "equivalent", variables: ["k"] };
for (const a of ["2k + 12", "12 + 2k", "2k+12", "k^2 + 12"]) show("k", a, inK);

console.log("--- numeric exact fraction ---");
const frac: AnswerSpec = { kind: "numeric", value: 14 / 3, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: ["fraction", "decimal"] };
for (const a of ["14/3", "4.67", "4.666", "4.7", "4 2/3"]) show("num", a, frac);

console.log("--- numeric with unit ---");
const withUnit: AnswerSpec = { kind: "numeric", value: 288, tolerance: { type: "absolute", value: 0.005 }, unit: "m²", unitRequired: true, acceptForms: ["decimal"] };
for (const a of ["288 m²", "288", "288 m^2", "288m2"]) show("unit", a, withUnit);

console.log("--- graph curve plot ---");
const plot: AnswerSpec = {
  kind: "graph",
  expect: { plot: "curve", samples: [[-1, 0], [0, 5], [2, 9], [5, 0]], tolerance: { type: "absolute", value: 0.1 }, smooth: true, noStraightSegments: true },
};
for (const a of [JSON.stringify({ points: [[-1, 0], [0, 5], [2, 9], [5, 0]] }), JSON.stringify({ points: [[-1, 0], [0, 5], [2, 8], [5, 0]] })]) show("plot", a, plot);
