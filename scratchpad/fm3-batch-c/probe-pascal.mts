/**
 * Probe: the encodings pascals-triangle-binomial-expansion needs, before the bundle is written.
 * Run from the repository root with node_modules/.bin/tsx.
 */
import { markAnswer, matchesCommonError } from "../../src/components/items/mark.ts";
import type { AnswerSpec, CommonError } from "../../src/lib/content/schema.ts";

const line = (label: string, r: { correct: boolean; marksAwarded: number; explanation?: unknown; tags?: string[] }, marks: number) =>
  console.log(`${label.padEnd(34)} ${r.marksAwarded}/${marks} ${r.correct ? "CORRECT" : "no     "} ${JSON.stringify(r.tags ?? [])} ${String(r.explanation).slice(0, 90)}`);

const spec = (latex: string, variables: string[], form?: string): AnswerSpec =>
  ({ kind: "algebraic", latex, equivalence: "equivalent", variables, ...(form ? { form } : {}) }) as AnswerSpec;

const five = "p^{5} + 5p^{4}q + 10p^{3}q^{2} + 10p^{2}q^{3} + 5pq^{4} + q^{5}";
for (const form of [undefined, "expanded"]) {
  console.log(`--- (p + q)^5, form ${form ?? "none"} ---`);
  const s = spec(five, ["p", "q"], form);
  for (const [label, t] of [
    ["the expansion", "p^5 + 5p^4q + 10p^3q^2 + 10p^2q^3 + 5pq^4 + q^5"],
    ["reversed order", "q^5 + 5pq^4 + 10p^2q^3 + 10p^3q^2 + 5p^4q + p^5"],
    ["qp order in terms", "p^5 + 5qp^4 + 10q^2p^3 + 10q^3p^2 + 5q^4p + q^5"],
    ["the bracket itself", "(p + q)^5"],
    ["commas, no plus signs", "p^5, 5p^4q, 10p^3q^2, 10p^2q^3, 5pq^4, q^5"],
    ["spaces, no plus signs", "p^5 5p^4q 10p^3q^2 10p^2q^3 5pq^4 q^5"],
    ["row 4 (wrong row)", "p^4 + 4p^3q + 6p^2q^2 + 4pq^3 + q^4"],
    ["coefficients dropped", "p^5 + p^4q + p^3q^2 + p^2q^3 + pq^4 + q^5"],
  ] as const) line(label, markAnswer(t, s, { marks: 2 }), 2);
}

console.log("--- (p - q)^4 with form expanded ---");
const minus4 = spec("p^{4} - 4p^{3}q + 6p^{2}q^{2} - 4pq^{3} + q^{4}", ["p", "q"], "expanded");
const signsLost: CommonError = { misconception: "fm.binomial.wrong-power", pattern: { kind: "algebraic", latex: "p^{4} + 4p^{3}q + 6p^{2}q^{2} + 4pq^{3} + q^{4}" }, feedback: "signs lost", marksTypicallyEarned: 1 };
for (const [label, t] of [
  ["right", "p^4 - 4p^3q + 6p^2q^2 - 4pq^3 + q^4"],
  ["all plus", "p^4 + 4p^3q + 6p^2q^2 + 4pq^3 + q^4"],
  ["every term minus", "p^4 - 4p^3q - 6p^2q^2 - 4pq^3 - q^4"],
] as const) line(label, markAnswer(t, minus4, { marks: 2, commonErrors: [signsLost] }), 2);

console.log("--- (1 + 2x)^4 with form expanded ---");
const num = spec("1 + 8x + 24x^{2} + 32x^{3} + 16x^{4}", ["x"], "expanded");
const notRaised: CommonError = { misconception: "fm.binomial.wrong-power", pattern: { kind: "algebraic", latex: "1 + 8x + 12x^{2} + 8x^{3} + 2x^{4}" }, feedback: "2 not raised", marksTypicallyEarned: 1 };
for (const [label, t] of [
  ["right", "1 + 8x + 24x^2 + 32x^3 + 16x^4"],
  ["descending", "16x^4 + 32x^3 + 24x^2 + 8x + 1"],
  ["2 not raised", "1 + 8x + 12x^2 + 8x^3 + 2x^4"],
  ["unexpanded", "(1 + 2x)^4"],
  ["half expanded", "1 + 4(2x) + 6(2x)^2 + 4(2x)^3 + (2x)^4"],
] as const) line(label, markAnswer(t, num, { marks: 3, commonErrors: [notRaised] }), 3);

console.log("--- the single term in p^3 q^4 of (p + q)^7 ---");
const term = spec("35p^{3}q^{4}", ["p", "q"]);
for (const [label, t] of [["right", "35p^3q^4"], ["with times", "35 × p^3 × q^4"], ["q first", "35q^4p^3"], ["wrong position 21", "21p^3q^4"]] as const) line(label, markAnswer(t, term, { marks: 1 }), 1);

console.log("--- a text common error for a list without plus signs ---");
const listCe: CommonError = { misconception: "fm.binomial.wrong-power", pattern: { kind: "text", regex: "^[^+]*,[^+]*$" }, feedback: "list", marksTypicallyEarned: 1 };
console.log("fires on comma list:", matchesCommonError("p^5, 5p^4q, 10p^3q^2, 10p^2q^3, 5pq^4, q^5", listCe));
console.log("fires on the answer:", matchesCommonError("p^5 + 5p^4q + 10p^3q^2 + 10p^2q^3 + 5pq^4 + q^5", listCe));
line("comma list with the text CE", markAnswer("p^5, 5p^4q, 10p^3q^2, 10p^2q^3, 5pq^4, q^5", spec(five, ["p", "q"], "expanded"), { marks: 2, commonErrors: [listCe] }), 2);
