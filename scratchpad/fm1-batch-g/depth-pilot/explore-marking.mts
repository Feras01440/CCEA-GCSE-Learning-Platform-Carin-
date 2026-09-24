/**
 * 23 Sep depth pilot, laws-of-logarithms: how the app's own marker treats the answer specs, common errors,
 * find-the-mistake corrections and gates I intend to add, BEFORE they are written into the generator.
 *   npx tsx scratchpad/fm1-batch-g/depth-pilot/explore-marking.mts
 */
import { markAnswer } from "../../../src/components/items/mark.ts";
import { fixMatches } from "../../../src/components/items/mistake-marking.ts";
import { markGate } from "../../../src/components/items/gates.ts";

const alg = (latex: string, variables: string[], form?: string) => ({ kind: "algebraic", latex, equivalence: "equivalent", variables, ...(form ? { form } : {}) });
const numA = (value: number) => ({ kind: "numeric", value, tolerance: { type: "absolute", value: 0.0005 }, unitRequired: false, acceptForms: ["decimal", "fraction"] });
const ceA = (misconception: string, latex: string, marks: number) => ({ misconception, pattern: { kind: "algebraic", latex }, feedback: `CE ${misconception}`, marksTypicallyEarned: marks });
const ceN = (misconception: string, value: number, marks: number) => ({ misconception, pattern: { kind: "numeric", value, tolerance: { type: "absolute", value: 0.0005 } }, feedback: `CE ${misconception}`, marksTypicallyEarned: marks });

function probe(label: string, spec: any, marks: number, commonErrors: any[], raws: string[]) {
  console.log(`\n== ${label}  (${marks} marks, form ${spec.form ?? "-"})`);
  for (const raw of raws) {
    const r: any = markAnswer(raw, spec as never, { marks, commonErrors } as never);
    console.log(`  ${JSON.stringify(raw).padEnd(34)} -> ${r.correct ? "RIGHT" : "wrong"} ${r.marksAwarded}/${marks} ${JSON.stringify(r.tags ?? [])} ${String(r.explanation ?? "").slice(0, 70)}`);
  }
}

// q0017(a): 2 log 6x - log 4x = log 9x
const aCE = [ceA("fm.logs.coefficient-not-raised", "\\log\\frac{3x}{2}", 1), ceA("fm.logs.power-as-multiplier-inside", "\\log 3", 0), ceA("fm.logs.subtraction-rule-misapplied", "\\log\\frac{1}{9x}", 2)];
for (const form of ["single-log", "single-log-expanded"]) {
  probe(`q0017(a) log 9x`, alg("\\log 9x", ["x"], form), 3, aCE, [
    "\\log 9x", "log 9x", "log(9x)", "\\log(9x)", "log 9 + log x", "\\log\\frac{36x^{2}}{4x}", "log(36x^2/(4x))", "\\log 36x^{2} - \\log 4x",
    "\\log\\frac{3x}{2}", "log 1.5x", "\\log 3", "\\log\\frac{1}{9x}", "log(1/(9x))", "\\log 9x^{2}", "9x",
  ]);
}
// q0017(b) and q0018: in terms of a letter
probe("q0017(b) 4 + t", alg("4 + t", ["t"]), 2, [ceA("fm.logs.unknown-base-divided", "8 + t", 1), ceA("fm.logs.product-to-sum", "4t", 0)], ["4 + t", "t+4", "4+t", "8 + t", "4t", "16 + t", "log_2 16 + t"]);
probe("q0018 3 + 2k", alg("3 + 2k", ["k"]), 2, [ceA("fm.logs.power-as-multiplier-inside", "3 + k^{2}", 1), ceA("fm.logs.unknown-base-divided", "4 + 2k", 1), ceA("fm.logs.product-to-sum", "6k", 0)], ["3 + 2k", "2k + 3", "2k+3", "3 + k^2", "3+k^{2}", "4 + 2k", "6k", "3 + 2 k", "3 + k2"]);
// q0019: y in terms of z
probe("q0019 y = -3z/2", alg("y = -\\frac{3}{2}z", ["y", "z"]), 3, [ceA("fm.logs.negative-index-sign-dropped", "y = \\frac{3}{2}z", 1)], [
  "y = -\\frac{3}{2}z", "y = -3z/2", "y=-1.5z", "y = -1.5z", "2y = -3z", "y = -(3/2)z", "-3z/2", "y = \\frac{3}{2}z", "y = 3z/2", "y = -\\frac{2}{3}z", "3y = -2z", "y = 1.5z",
]);
// q0017(c), (d)
probe("q0017(c) a = 3", numA(3), 1, [], ["3", "a = 3", "8", "2^(x+3)"]);
probe("q0017(d) x = 1.46", numA(1.46), 4, [ceN("fm.logs.brackets-omitted", 1.6, 1), ceN("fm.logs.terms-not-collected", 0.94, 2)], ["1.46", "x = 1.46", "1.4605", "1.461", "1.5", "1.60", "1.6", "0.94", "0.943", "3.61"]);
// q0020: wind turbine
probe("q0020(a) log k + n log v", alg("\\log k + n\\log v", ["k", "n", "v"], "expanded-logs"), 2, [ceA("fm.logs.product-to-sum", "\\log k \\times n\\log v", 0)], [
  "\\log k + n\\log v", "log k + n log v", "n log v + log k", "log k + log v^n", "\\log k \\times n\\log v", "n\\log kv", "log(kv^n)",
]);
probe("q0020(b) n = 3", numA(3), 3, [ceN("fm.logs.gradient-inverted", 1 / 3, 0)], ["3", "n = 3", "1/3", "0.333", "0.3333"]);
probe("q0020(c) k = 2", numA(2), 2, [ceN("fm.logs.log-a-given-as-a", Math.log10(2), 1)], ["2", "k = 2", "0.301", "0.30103"]);
// WE04 twin: y = 2x^(2/3)
probe("WE04 twin y = 2x^(2/3)", alg("y = 2x^{\\frac{2}{3}}", ["x", "y"]), 3, [], ["y = 2x^{\\frac{2}{3}}", "y = 2x^(2/3)", "y=2x^(2/3)", "y = 2 x^{2/3}", "y^3 = 8x^2", "y = (8x^2)^(1/3)", "y = 2x^(3/2)", "y = 8x^2"]);
probe("WE04 main y = 3 sqrt x", alg("y = 3\\sqrt{x}", ["x", "y"]), 3, [], ["y = 3\\sqrt{x}", "y = 3sqrt(x)", "y = 3x^(1/2)", "y^2 = 9x", "y = 9x", "y = \\sqrt{9x}"]);
// WE05 twin: 2 + p/2 - 2q
probe("WE05 twin 2 + p/2 - 2q", alg("2 + \\frac{1}{2}p - 2q", ["p", "q"]), 3, [], ["2 + \\frac{1}{2}p - 2q", "2 + p/2 - 2q", "2 + 0.5p - 2q", "0.5p - 2q + 2", "1 + p/2 - 2q", "2 + 2p - 2q", "25 + p/2 - 2q"]);

// ftm.04 candidates
console.log("\n== ftm.04 fixMatches");
const corrections: Record<string, string[]> = {
  A: ["log y^4 = log x^3", "y^4 = x^3", "y = x^(3/4)"],
  B: ["log y^4 = log x^3", "y^4 = x^3", "y = x^0.75"],
  C: ["log y^2 = log x^5", "y^2 = x^5", "y = x^(5/2)"],
  D: ["log y^2 = log x^5", "y^2 = x^5"],
  E: ["log y^2 = log x^5", "y^2 = x^5", "y = x^2.5"],
};
const typedFor: Record<string, string[]> = {
  A: ["y = 3 log x / 4 log", "y = (3 log x)/(4 log)", "y = 0.75x", "log y^4 = log x^3", "y^4 = x^3", "y = x^(3/4)", "y = x^0.75", "y = x^{3/4}"],
  B: ["y = 3 log x / 4 log", "y = 0.75x", "y = x^(3/4)", "y = x^0.75", "y^4 = x^3"],
  C: ["y = 5 log x / 2 log", "y = (5 log x)/(2 log)", "y = 2.5x", "y = x^(5/2)", "y = x^2.5", "y^2 = x^5", "log y^2 = log x^5"],
  D: ["y = 5 log x / 2 log", "y = 2.5x", "y = x^(5/2)", "y = x^2.5", "y^2 = x^5"],
  E: ["y = 5 log x / 2 log", "y = 2.5x", "y = x^(5/2)", "y = x^2.5", "y^2 = x^5"],
};
for (const [k, lines] of Object.entries(corrections)) {
  console.log(`  correction ${k}: ${JSON.stringify(lines)}`);
  for (const t of typedFor[k]) console.log(`    ${JSON.stringify(t).padEnd(28)} -> ${JSON.stringify(fixMatches(t, lines))}`);
}

// gates
console.log("\n== gates");
const gates: any[] = [
  { id: "g9", kind: "number", prompt: "", answer: "2.301", explain: "", tries: ["2.301", "2.30103", "2.3", "2.30", "2.302", "1.301"] },
  { id: "g10", kind: "choice", options: ["$\\log y^{4}$", "$\\log 8\\sqrt{y}$", "$\\log y^{16}$"], answer: "$\\log y^{4}$" },
  { id: "g11", kind: "choice", options: ["$2a + b$", "$a^{2} + b$", "$2ab$"], answer: "$2a + b$" },
  { id: "g12", kind: "choice", options: ["$t + 2$", "$t + 9$", "$t + 3$"], answer: "$t + 2$" },
  { id: "g13", kind: "choice", options: ["Take logarithms of both sides", "Divide both sides by one of the bases", "Set the two indices equal"], answer: "Take logarithms of both sides" },
  { id: "g14", kind: "choice", options: ["$\\log 5 + 3\\log x$", "$3\\log 5x$", "$5 + 3\\log x$"], answer: "$\\log 5 + 3\\log x$" },
  { id: "g15", kind: "choice", options: ["$3p$", "$p^{3}$", "$p + 3$"], answer: "$3p$" },
];
for (const g of gates) {
  const tries = g.tries ?? g.options;
  console.log(`  ${g.id}: ${tries.map((t: string) => `${JSON.stringify(t)}=${markGate(g, t) ? "RIGHT" : "wrong"}`).join("  ")}`);
}
