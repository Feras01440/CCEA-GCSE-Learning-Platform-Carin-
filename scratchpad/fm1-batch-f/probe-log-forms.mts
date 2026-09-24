/**
 * FM1 batch F — the two new algebra forms, probed before laws-of-logarithms is encoded.
 * form: "single-log"    -> exactly one logarithm, and it is the whole answer
 * form: "expanded-logs" -> no product, quotient or power inside any logarithm, order-free
 * Every line prints correct / marks / the engine's own sentence, so the encoding is chosen from
 * behaviour rather than from the note that announced the feature.
 */
import { markAnswer } from "../../src/components/items/mark.ts";
import type { AnswerSpec } from "../../src/lib/content/schema.ts";

const single = (latex: string, variables: string[]): AnswerSpec => ({
  kind: "algebraic",
  latex,
  equivalence: "equivalent",
  variables,
  form: "single-log",
});
const expanded = (latex: string, variables: string[]): AnswerSpec => ({
  kind: "algebraic",
  latex,
  equivalence: "equivalent",
  variables,
  form: "expanded-logs",
});

const cases: Array<[string, AnswerSpec, string[]]> = [
  [
    "single-log: log(ac/b^4)",
    single("\\log\\frac{ac}{b^{4}}", ["a", "b", "c"]),
    [
      "\\log\\frac{ac}{b^4}",
      "log(ac/b^4)",
      "log(ca/b^4)",
      "\\log a - 4\\log b + \\log c",
      "\\log(ac) - \\log(b^4)",
      "\\log\\frac{ca}{b^{4}}",
      "\\log\\frac{ac}{b^{3}}",
    ],
  ],
  [
    "single-log: log 8x^3 (the 2024 shape)",
    single("\\log 8x^{3}", ["x"]),
    ["\\log 8x^3", "log(8x^3)", "3\\log 2x", "\\log 2x^3", "\\log 8x^{3} + 0", "2\\log 8x^{3} - \\log 8x^{3}"],
  ],
  [
    "single-log with a y = wrapper",
    single("y = x^{\\frac{3}{2}}", ["x", "y"]),
    ["y = x^{3/2}"],
  ],
  [
    "expanded-logs: 2 log a + 3 log b",
    expanded("2\\log a + 3\\log b", ["a", "b"]),
    [
      "2\\log a + 3\\log b",
      "3\\log b + 2\\log a",
      "\\log(a^2 b^3)",
      "\\log a^2 + \\log b^3",
      "2\\log a + 3\\log c",
    ],
  ],
  [
    "expanded-logs: 1 + 2p + q in terms of given logs",
    expanded("1 + 2p + q", ["p", "q"]),
    ["1 + 2p + q", "q + 2p + 1", "2p + q + 1"],
  ],
  [
    "expanded-logs with a leading minus",
    expanded("-\\log a + \\log b", ["a", "b"]),
    ["-\\log a + \\log b", "\\log b - \\log a", "\\log\\frac{b}{a}"],
  ],
  [
    "single-log, base 2",
    single("\\log_{2} 12", []),
    ["\\log_2 12", "\\log_{2} 4 + \\log_{2} 3", "2 + \\log_{2} 3"],
  ],
];

for (const [label, spec, answers] of cases) {
  console.log("==", label, "| spec:", (spec as { latex: string }).latex, "| form:", (spec as { form?: string }).form);
  for (const a of answers) {
    const r = markAnswer(a, spec, { marks: 3 });
    console.log(`   ${JSON.stringify(a).padEnd(38)} -> correct=${String(r.correct).padEnd(5)} ${r.marksAwarded}/3 | ${String(r.explanation).slice(0, 96)}`);
  }
}
