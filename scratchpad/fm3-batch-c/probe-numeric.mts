/**
 * Probe: how the marker treats the probability encodings binomial-probabilities will use, before
 * any bundle is written. Run from the repository root with node_modules/.bin/tsx.
 */
import { markAnswer, matchesCommonError } from "../../src/components/items/mark.ts";
import { markGate } from "../../src/components/items/gates.ts";
import type { AnswerSpec, CommonError } from "../../src/lib/content/schema.ts";

const line = (label: string, r: { correct: boolean; marksAwarded: number; explanation?: unknown; tags?: string[] }, marks: number) =>
  console.log(`${label.padEnd(40)} ${r.marksAwarded}/${marks} ${r.correct ? "CORRECT" : "no     "} ${JSON.stringify(r.tags ?? [])} ${String(r.explanation).slice(0, 80)}`);

console.log("--- exact 0.064, no instruction ---");
const exact: AnswerSpec = { kind: "numeric", value: 0.064, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal", "fraction"] };
for (const t of ["0.064", "0.0640", ".064", "8/125", "0.06", "0.0641", "6.4%"]) line(`typed ${t}`, markAnswer(t, exact, { marks: 1 }), 1);

console.log("--- 4 d.p. instruction, 1/6 context (3125/7776) ---");
const stem = "Calculate the probability that exactly one six is rolled.\nGive your answer to 4 decimal places.";
const dice: AnswerSpec = { kind: "numeric", value: 0.401878, tolerance: { type: "dp", places: 4 }, unitRequired: false, acceptForms: ["decimal"] };
for (const t of ["0.4019", "3125/7776", "0.40188", "0.402", "0.4018"]) line(`typed ${t}`, markAnswer(t, dice, { marks: 3, prompt: stem }), 3);

console.log("--- truncation common error ---");
const mugs: AnswerSpec = { kind: "numeric", value: 0.186895, tolerance: { type: "dp", places: 4 }, unitRequired: false, acceptForms: ["decimal"] };
const trunc: CommonError = { misconception: "fm.binomial.early-rounding", pattern: { kind: "numeric", value: 0.1868, tolerance: { type: "dp", places: 4 } }, feedback: "probe trunc", marksTypicallyEarned: 2 };
const bracket: CommonError = { misconception: "fm.binomial.brackets-in-complement", pattern: { kind: "numeric", value: 0.95217, tolerance: { type: "dp", places: 4 } }, feedback: "probe bracket", marksTypicallyEarned: 1 };
const s2 = "Calculate the probability that at least 2 mugs are faulty.\nGive your answer to 4 decimal places.";
for (const t of ["0.1869", "0.1868", "0.187", "0.9522", "0.95217", "0.19"]) line(`typed ${t}`, markAnswer(t, mugs, { marks: 3, prompt: s2, commonErrors: [trunc, bracket] }), 3);
console.log("bracket CE matches 0.9522:", matchesCommonError("0.9522", bracket));

console.log("--- over 1 ---");
const over: CommonError = { misconception: "fm.binomial.brackets-in-complement", pattern: { kind: "numeric", value: 1.108218, tolerance: { type: "dp", places: 4 } }, feedback: "probe over", marksTypicallyEarned: 1 };
const cafe: AnswerSpec = { kind: "numeric", value: 0.836433, tolerance: { type: "dp", places: 4 }, unitRequired: false, acceptForms: ["decimal"] };
for (const t of ["1.1082", "0.8364"]) line(`typed ${t}`, markAnswer(t, cafe, { marks: 3, prompt: s2, commonErrors: [over] }), 3);

console.log("--- gates ---");
const g = (answer: string, typed: string, kind: "number" | "blank" = "number") =>
  console.log(`gate ${kind} [${answer}] typed ${typed}: ${markGate({ type: "gate", id: "g", kind, prompt: "p", answer, explain: "e" }, typed)}`);
g("0.1382 | 0.138178125", "0.1382");
g("0.1382 | 0.138178125", "0.138178125");
g("0.1382 | 0.138178125", "0.138");
g("0.1382 | 0.138178125", "0.14");
g("0.04", "0.04");
g("0.04", "4%");
g("0.04", "1/25");
g("10", "10");
g("0.4718 | 0.47178", "0.4718");
