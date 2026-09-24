/**
 * Probe: how the app's algebra marker treats a two-variable binomial expansion, before any bundle
 * is written. Every line prints the verdict so the encoding can be chosen from evidence.
 */
import { markAnswer, matchesCommonError } from "../../src/components/items/mark.ts";
import type { AnswerSpec, CommonError } from "../../src/lib/content/schema.ts";

const spec = (latex: string, variables: string[]): AnswerSpec => ({
  kind: "algebraic",
  latex,
  equivalence: "equivalent",
  variables,
});

const show = (label: string, raw: string, s: AnswerSpec) => {
  const r = markAnswer(raw, s, { marks: 2 } as never);
  console.log(`${label.padEnd(26)} ${raw.slice(0, 58).padEnd(60)} ${r.correct ? "CORRECT" : "no     "} ${String(r.explanation).slice(0, 70)}`);
};

const five = spec("p^{5} + 5p^{4}q + 10p^{3}q^{2} + 10p^{2}q^{3} + 5pq^{4} + q^{5}", ["p", "q"]);
console.log("--- (p + q)^5 ---");
show("latex as written", "p^{5} + 5p^{4}q + 10p^{3}q^{2} + 10p^{2}q^{3} + 5pq^{4} + q^{5}", five);
show("plain carets", "p^5 + 5p^4q + 10p^3q^2 + 10p^2q^3 + 5pq^4 + q^5", five);
show("no spaces", "p^5+5p^4q+10p^3q^2+10p^2q^3+5pq^4+q^5", five);
show("times signs", "p^5 + 5*p^4*q + 10*p^3*q^2 + 10*p^2*q^3 + 5*p*q^4 + q^5", five);
show("terms reordered", "q^5 + 5pq^4 + 10p^2q^3 + 10p^3q^2 + 5p^4q + p^5", five);
show("wrong row (n = 4)", "p^4 + 4p^3q + 6p^2q^2 + 4pq^3 + q^4", five);
show("coefficients dropped", "p^5 + p^4q + p^3q^2 + p^2q^3 + pq^4 + q^5", five);
show("powers not summing", "p^5 + 5p^4q^2 + 10p^3q^2 + 10p^2q^3 + 5pq^4 + q^5", five);

const minus = spec("p^{5} - 5p^{4}q + 10p^{3}q^{2} - 10p^{2}q^{3} + 5pq^{4} - q^{5}", ["p", "q"]);
console.log("--- (p - q)^5 ---");
show("latex as written", "p^{5} - 5p^{4}q + 10p^{3}q^{2} - 10p^{2}q^{3} + 5pq^{4} - q^{5}", minus);
show("all plus signs", "p^5 + 5p^4q + 10p^3q^2 + 10p^2q^3 + 5pq^4 + q^5", minus);

const numeric = spec("8 + 36x + 54x^{2} + 27x^{3}", ["x"]);
console.log("--- (2 + 3x)^3 ---");
show("latex as written", "8 + 36x + 54x^{2} + 27x^{3}", numeric);
show("plain", "8+36x+54x^2+27x^3", numeric);
show("numbers not raised", "8 + 12x + 6x^2 + x^3", numeric);

const term = spec("35p^{3}q^{4}", ["p", "q"]);
console.log("--- the term in p^3 q^4 of (p + q)^7 ---");
show("latex", "35p^{3}q^{4}", term);
show("plain", "35p^3q^4", term);
show("powers swapped", "35p^4q^3", term);
show("wrong coefficient", "21p^3q^4", term);

console.log("--- common errors fire? ---");
const ce = (latex: string): CommonError => ({
  misconception: "fm.binomial.wrong-power",
  pattern: { kind: "algebraic", latex },
  feedback: "probe",
  marksTypicallyEarned: 0,
});
for (const [label, patternLatex, raw] of [
  ["wrong row", "p^{4} + 4p^{3}q + 6p^{2}q^{2} + 4pq^{3} + q^{4}", "p^4 + 4p^3q + 6p^2q^2 + 4pq^3 + q^4"],
  ["all plus signs", "p^{5} + 5p^{4}q + 10p^{3}q^{2} + 10p^{2}q^{3} + 5pq^{4} + q^{5}", "p^5+5p^4q+10p^3q^2+10p^2q^3+5pq^4+q^5"],
  ["numbers not raised", "8 + 12x + 6x^{2} + x^{3}", "8 + 12x + 6x^2 + x^3"],
] as const) {
  console.log(`${label.padEnd(20)} fires: ${matchesCommonError(raw, ce(patternLatex))}`);
}

console.log("--- marks awarded for a fired error on a 2-mark part ---");
const r = markAnswer("p^4 + 4p^3q + 6p^2q^2 + 4pq^3 + q^4", five, {
  marks: 2,
  commonErrors: [{ ...ce("p^{4} + 4p^{3}q + 6p^{2}q^{2} + 4pq^{3} + q^{4}"), marksTypicallyEarned: 1 }],
} as never);
console.log(JSON.stringify({ marks: r.marksAwarded, tags: r.tags, explanation: String(r.explanation).slice(0, 120) }));
