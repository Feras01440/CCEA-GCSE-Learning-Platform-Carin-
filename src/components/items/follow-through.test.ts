import { describe, expect, test } from "vitest";
import type { AnswerSpec } from "@/lib/content/schema";
import { followThroughValue, markAnswer } from "./mark";

// The P2 D author (25 Sep 2026): a part flagged `followThrough` ("use-candidate-value") was marked against the key only,
// so a fuse chosen consistently with a wrong current scored 0, where CCEA's "ft" pays it. Now the later part is also
// marked against the value her own earlier answer leads to: through the authored `relation` (an expression in x, her
// earlier value), else through the later part's worked solution (the chain that turns the earlier value into the
// answer, with her value put in), else, for a choice among numbered options such as fuses, the next option above
// her value. A right earlier answer needs none of this; a wrong later answer is still wrong.
const current: AnswerSpec = { kind: "numeric", value: 2.5, tolerance: { type: "absolute", value: 0.01 }, unit: "A", unitRequired: false, acceptForms: ["decimal"] };
const fuse: AnswerSpec = {
  kind: "mcq",
  shuffle: false,
  options: [
    { id: "a", text: "3 A", correct: true, feedback: "The next rating above 2.5 A." },
    { id: "b", text: "5 A", correct: false, feedback: "Higher than it needs to be." },
    { id: "c", text: "13 A", correct: false, feedback: "Far too high." },
  ],
};

describe("follow-through on a fuse (p2 electricity in the home .0007)", () => {
  test("her current 4.5 A (wrong): the 5 A fuse is right for it", () => {
    const r = markAnswer("b", fuse, { marks: 1, followThrough: { earlierRaw: "4.5", earlierSpec: current } });
    expect(r).toMatchObject({ correct: true, marksAwarded: 1 });
    expect(r.explanation).toMatch(/your answer/i);
  });
  test("a fuse that does not follow from her current is still wrong (the key's own answer is always right)", () => {
    expect(markAnswer("c", fuse, { marks: 1, followThrough: { earlierRaw: "4.5", earlierSpec: current } }).correct).toBe(false);
  });
  test("with the right current the key alone decides", () => {
    expect(markAnswer("a", fuse, { marks: 1, followThrough: { earlierRaw: "2.5 A", earlierSpec: current } }).correct).toBe(true);
    expect(markAnswer("b", fuse, { marks: 1, followThrough: { earlierRaw: "2.5 A", earlierSpec: current } }).correct).toBe(false);
  });
});

describe("follow-through through the worked solution (p2 resistance-length .0003)", () => {
  const perMetre: AnswerSpec = { kind: "numeric", value: 3.2, tolerance: { type: "absolute", value: 0.05 }, unit: "Ω/m", unitRequired: false, acceptForms: ["decimal"] };
  const fourMetres: AnswerSpec = { kind: "numeric", value: 12.8, tolerance: { type: "absolute", value: 0.05 }, unit: "Ω", unitRequired: false, acceptForms: ["decimal"] };
  const ws = "Each metre has 3.2 Ω, so 4.0 m has 3.2 × 4.0 = 12.8 Ω.";
  test("her 3.0 Ω/m leads to 12.0 Ω", () => {
    expect(followThroughValue({ earlierRaw: "3.0", earlierSpec: perMetre, workedSolution: ws }, fourMetres)).toBeCloseTo(12, 9);
    expect(markAnswer("12 Ω", fourMetres, { marks: 2, followThrough: { earlierRaw: "3.0", earlierSpec: perMetre, workedSolution: ws } })).toMatchObject({ correct: true, marksAwarded: 2 });
    expect(markAnswer("12.8 Ω", fourMetres, { marks: 2, followThrough: { earlierRaw: "3.0", earlierSpec: perMetre, workedSolution: ws } }).correct).toBe(true);
    expect(markAnswer("13 Ω", fourMetres, { marks: 2, followThrough: { earlierRaw: "3.0", earlierSpec: perMetre, workedSolution: ws } }).correct).toBe(false);
  });
});

describe("follow-through through an authored relation (fm1 form-three-simultaneous-equations .0012)", () => {
  const aoife: AnswerSpec = { kind: "numeric", value: 17, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] };
  const brona: AnswerSpec = { kind: "numeric", value: 12, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] };
  test("x − y = 5: her 19 for Aoife makes Bróna 14", () => {
    const ft = { earlierRaw: "19", earlierSpec: aoife, relation: "x - 5", workedSolution: "From $(2)$, $17 - y = 5$, so $y = 12$." };
    expect(markAnswer("14", brona, { marks: 1, followThrough: ft })).toMatchObject({ correct: true, marksAwarded: 1 });
    expect(markAnswer("12", brona, { marks: 1, followThrough: ft }).correct).toBe(true);
    expect(markAnswer("13", brona, { marks: 1, followThrough: ft }).correct).toBe(false);
  });
  test("without a relation, and with a worked solution that is no chain to the answer, there is no follow-through", () => {
    expect(followThroughValue({ earlierRaw: "19", earlierSpec: aoife, workedSolution: "From $(2)$, $17 - y = 5$, so $y = 12$." }, brona)).toBeNull();
  });
});

// The verifier, round 2 (25 Sep 2026). Her own earlier value carries even when it is within the earlier part's
// tolerance but not the key's value: 3.24 Ω/m (accepted for 3.2) leads to 12.96 Ω for 4.0 m, which the key's 12.8 ± 0.05
// alone would refuse. And a chain of angles with degree signs ("90° − 62° = 28°") carries her value too.
describe("follow-through: her own value, and angles", () => {
  const perMetre: AnswerSpec = { kind: "numeric", value: 3.2, tolerance: { type: "absolute", value: 0.05 }, unitRequired: false, acceptForms: ["decimal"] };
  const fourMetres: AnswerSpec = { kind: "numeric", value: 12.8, tolerance: { type: "absolute", value: 0.05 }, unitRequired: false, acceptForms: ["decimal"] };
  test("3.24 carried: 12.96 is right for it", () => {
    const ft = { earlierRaw: "3.24", earlierSpec: perMetre, workedSolution: "Each metre has 3.2 Ω, so 4.0 m has 3.2 × 4.0 = 12.8 Ω." };
    expect(markAnswer("12.96", fourMetres, { marks: 2, followThrough: ft }).correct).toBe(true);
  });
  test("p2 reflection .0007(b): 90° − 62° with her 60° gives 30°", () => {
    const first: AnswerSpec = { kind: "numeric", value: 62, tolerance: { type: "exact" }, unit: "°", unitRequired: false, acceptForms: ["decimal"] };
    const second: AnswerSpec = { kind: "numeric", value: 28, tolerance: { type: "exact" }, unit: "°", unitRequired: false, acceptForms: ["decimal"] };
    const ws = "The ray makes 62° with the first normal, so it makes 90° − 62° = 28° with the second.";
    expect(followThroughValue({ earlierRaw: "60", earlierSpec: first, workedSolution: ws }, second)).toBe(30);
    expect(markAnswer("30°", second, { marks: 1, followThrough: { earlierRaw: "60", earlierSpec: first, workedSolution: ws } }).correct).toBe(true);
  });
});
