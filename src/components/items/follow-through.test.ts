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
