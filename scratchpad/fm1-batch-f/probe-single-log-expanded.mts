/**
 * FM1 batch F — the third log form, probed before it is put on any part.
 * form: "single-log-expanded" is meant to want one logarithm whose argument is multiplied out,
 * so log 8x^3 passes and log (2x)^3 scores equivalent-wrong-form. Checked against every spelling
 * a learner could produce for the Summer 2024 item, and against the specs that must NOT get it.
 */
import { markAnswer } from "../../src/components/items/mark.ts";
import type { AnswerSpec } from "../../src/lib/content/schema.ts";

const spec = (latex: string, variables: string[], form?: string): AnswerSpec =>
  ({ kind: "algebraic", latex, equivalence: "equivalent", variables, ...(form ? { form } : {}) }) as AnswerSpec;

const cases: Array<[string, AnswerSpec, string[]]> = [
  [
    'single-log-expanded on log 8x^3 (the 2024 item)',
    spec("\\log 8x^{3}", ["x"], "single-log-expanded"),
    [
      "\\log 8x^3",
      "log(8x^3)",
      "\\log 8x^{3}",
      "log 8x³",
      "\\log\\left((2x)^{3}\\right)",
      "log((2x)^3)",
      "\\log(2^{3}x^{3})",
      "3\\log 2x",
      "\\log 2x^{3}",
      "\\log a + \\log b",
    ],
  ],
  [
    'single-log-expanded on log 25x^2 (the twin)',
    spec("\\log 25x^{2}", ["x"], "single-log-expanded"),
    ["\\log 25x^2", "\\log\\left((5x)^{2}\\right)", "2\\log 5x", "\\log 25x^{2}"],
  ],
  [
    'single-log (unchanged) on a quotient that needs no expanding',
    spec("\\log\\frac{ab^{2}}{c}", ["a", "b", "c"], "single-log"),
    ["\\log\\frac{ab^{2}}{c}", "log(ab^2/c)", "\\log a + 2\\log b - \\log c"],
  ],
  [
    'single-log-expanded on that same quotient, to see whether it would break it',
    spec("\\log\\frac{ab^{2}}{c}", ["a", "b", "c"], "single-log-expanded"),
    ["\\log\\frac{ab^{2}}{c}", "log(ab^2/c)", "\\log\\frac{a b \\cdot b}{c}"],
  ],
  [
    'single-log-expanded on log 100x',
    spec("\\log 100x", ["x"], "single-log-expanded"),
    ["\\log 100x", "log(100x)", "\\log\\left(10^{2}x\\right)"],
  ],
];

for (const [label, s, answers] of cases) {
  console.log("==", label);
  for (const a of answers) {
    const r = markAnswer(a, s, { marks: 3 });
    console.log(`   ${JSON.stringify(a).padEnd(34)} -> ${String(r.correct).padEnd(5)} ${r.marksAwarded}/3 | ${String(r.explanation).slice(0, 88)}`);
  }
}
