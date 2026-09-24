/**
 * Does an algebraic commonError match by equivalence or by the written form?
 * It decides whether the pre-read's finding 9 (pay the first scheme mark for a half-done
 * expression) can be done safely: if the pattern matches every equivalent expression, then a
 * learner who wrote nothing down would collect the mark too, and the fix would be a generosity bug.
 */
import { markAnswer, matchesCommonError } from "../../src/components/items/mark.ts";
import type { AnswerSpec, CommonError } from "../../src/lib/content/schema.ts";

const spec: AnswerSpec = {
  kind: "algebraic",
  latex: "\\log\\frac{ab^{2}}{c}",
  equivalence: "equivalent",
  variables: ["a", "b", "c"],
  form: "single-log",
};

const halfDone: CommonError = {
  misconception: "fm.logs.cannot-remove-logs",
  pattern: { kind: "algebraic", latex: "\\log(ab^{2}) - \\log c" },
  feedback: "One step short: the two logarithms still have to become one.",
  marksTypicallyEarned: 1,
};

const probes = [
  ["the half-done expression itself", "\\log(ab^{2}) - \\log c"],
  ["the same, spelled differently", "log(ab^2) - log c"],
  ["nothing done at all", "\\log a + 2\\log b - \\log c"],
  ["a different half-done route", "\\log a + \\log\\frac{b^{2}}{c}"],
  ["the correct answer", "\\log\\frac{ab^{2}}{c}"],
  ["a genuinely wrong answer", "\\log\\frac{ac}{b^{2}}"],
];

for (const [label, raw] of probes) {
  const fires = matchesCommonError(raw, halfDone);
  const r = markAnswer(raw, spec, { marks: 3, commonErrors: [halfDone] });
  console.log(`${label.padEnd(32)} fires=${String(fires).padEnd(5)} marks=${r.marksAwarded}/3 tags=${JSON.stringify(r.tags ?? [])}`);
}
