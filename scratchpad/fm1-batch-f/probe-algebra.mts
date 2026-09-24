/** Probe how the app's algebra marker treats logarithm expressions, before any answer spec is designed. */
import { markAnswer } from "../../src/components/items/mark.ts";
import type { AnswerSpec } from "../../src/lib/content/schema.ts";

const alg = (latex: string, variables: string[]): AnswerSpec => ({
  kind: "algebraic",
  latex,
  equivalence: "equivalent",
  variables,
});

const cases: Array<[string, AnswerSpec, string[]]> = [
  [
    "single log quotient",
    alg("\\log\\frac{ac}{b^{4}}", ["a", "b", "c"]),
    ["\\log\\frac{ac}{b^4}", "log(ac/b^4)", "log(a*c/b^4)", "\\log(ac) - \\log(b^4)", "log(ca/b^4)"],
  ],
  [
    "single log product",
    alg("\\log 8x^{3}", ["x"]),
    ["\\log 8x^3", "log(8x^3)", "log(8*x^3)", "3\\log 2x"],
  ],
  [
    "log in terms of p and q",
    alg("1 + 2p + q", ["p", "q"]),
    ["1+2p+q", "2p + q + 1", "q + 2p + 1"],
  ],
  [
    "y in terms of x",
    alg("y = x^{\\frac{3}{2}}", ["x", "y"]),
    ["y = x^{3/2}", "y=x^1.5", "y = \\sqrt{x^3}"],
  ],
  [
    "exponent form",
    alg("3^{4} = 81", []),
    ["3^4 = 81", "81 = 3^4"],
  ],
];

for (const [label, spec, answers] of cases) {
  console.log("==", label, "spec:", (spec as { latex: string }).latex);
  for (const a of answers) {
    const r = markAnswer(a, spec, { marks: 2 });
    console.log("   ", JSON.stringify(a), "->", r.correct, r.marksAwarded, "|", String(r.explanation).slice(0, 90));
  }
}
