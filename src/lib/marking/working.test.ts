import { describe, expect, test } from "vitest";
import type { MarkPoint } from "@/lib/content/schema";
import { markWorking, methodSteps } from "./working";

const point = (p: Partial<MarkPoint> & Pick<MarkPoint, "id" | "code" | "marks" | "for">): MarkPoint => p as MarkPoint;

/** q.maths.m4.frustums-and-compound-solids.0001, as authored. */
const cone = {
  scheme: [
    point({ id: "ma1", code: "MA", marks: 1, for: "(1/3)π(6)²(15) seen" }),
    point({ id: "a1", code: "A", marks: 1, for: "565 cm³ (accept 180π)" }),
  ],
  workedSolution: "$V = \\tfrac{1}{3}\\pi (6)^2 (15) = 565.5$ cm³, which is $565$ cm³ to 3 significant figures (exactly $180\\pi$).",
};

/** q.maths.m7.changing-the-subject-harder-formulae.0001, as authored. */
const rearrangement = {
  scheme: [
    point({ id: "ma1", code: "MA", marks: 1, for: "$y + 8 = 5x$, or $5x = y + 8$" }),
    point({ id: "a1", code: "A", marks: 1, for: "$x = \\dfrac{y+8}{5}$" }),
  ],
  workedSolution:
    "The chain on $x$ is: multiply by 5, then subtract 8. Undo it backwards. Add 8 to both sides: $y + 8 = 5x$. Divide both sides by 5: $x = \\dfrac{y+8}{5}$.",
};

describe("methodSteps", () => {
  test("keeps method and process codes and drops accuracy ones", () => {
    const steps = methodSteps(
      [
        point({ id: "m1", code: "M", marks: 1, for: "a method" }),
        point({ id: "ma1", code: "MA", marks: 1, for: "a method and accuracy" }),
        point({ id: "mw1", code: "MW", marks: 1, for: "a method with working" }),
        point({ id: "w1", code: "W", marks: 1, for: "working" }),
        point({ id: "p1", code: "P", marks: 1, for: "a process" }),
        point({ id: "a1", code: "A", marks: 1, for: "an accuracy mark" }),
        point({ id: "b1", code: "B", marks: 1, for: "a b mark" }),
        point({ id: "qwc", code: "QWC", marks: 2, for: "written communication" }),
      ],
      "",
    );
    expect(steps.map((s) => s.code)).toEqual(["M1", "MA1", "MW1", "W1", "P1"]);
  });

  test("trims the scheme's boilerplate and splits its alternatives", () => {
    const [step] = methodSteps([point({ id: "ma1", code: "MA", marks: 1, for: "(1/2) × (4/3)π(9)³ or (2/3)π(9)³ seen" })], "");
    expect(step!.for).toBe("(1/2) × (4/3)π(9)³ or (2/3)π(9)³");
    expect(step!.evidence).toContain("(1/2) × (4/3)π(9)³");
    expect(step!.evidence).toContain("(2/3)π(9)³");
  });

  test("the maths inside a mark point written as a sentence is evidence of its own", () => {
    // q.maths.m3.difference-of-two-squares, exam-style 1(a): she types a line of it, not the sentence.
    const scheme = [point({ id: "ma1", code: "MA", marks: 1, for: "64 = 8² and 9k² = (3k)² identified" }), point({ id: "a1", code: "A", marks: 1, for: "(8 + 3k)(8 − 3k)" })];
    const [step] = methodSteps(scheme, "");
    expect(step!.for).toBe("64 = 8² and 9k² = (3k)²");
    expect(markWorking(["9k² = (3k)²"], scheme, "").marks).toBe(1);
    expect(markWorking(["64 = 8²"], scheme, "").marks).toBe(1);
    expect(markWorking(["9k² = 3k"], scheme, "").marks).toBe(0);
  });

  test("an aside naming another acceptable spelling becomes evidence", () => {
    const [step] = methodSteps([point({ id: "p1", code: "P", marks: 1, for: "π(7)(25) (accept 175π)" })], "");
    expect(step!.for).toBe("π(7)(25)");
    expect(step!.evidence).toContain("175π");
  });
});

describe("markWorking: a numeric part marked all or nothing", () => {
  test("the substitution line earns the method mark although the answer is missed", () => {
    const r = markWorking(["1/3 × π × 6² × 15"], cone.scheme, cone.workedSolution);
    expect(r.marks).toBe(1);
    expect(r.available).toBe(1);
    expect(r.earned).toHaveLength(1);
    expect(r.earned[0]!.code).toBe("MA1");
    expect(r.earned[0]!.for).toBe("(1/3)π(6)²(15)");
    expect(r.earned[0]!.matchedLine).toBe("1/3 × π × 6² × 15");
  });

  test("the scheme's own spelling, a labelled line and the exact value all count", () => {
    for (const line of ["(1/3)π(6)²(15)", "V = 1/3 × π × 36 × 15", "180π"]) {
      expect(markWorking([line], cone.scheme, cone.workedSolution).marks).toBe(1);
    }
  });

  test("the accuracy mark is never on the ladder, whatever she writes", () => {
    const r = markWorking(["565 cm³", "565", "180π"], cone.scheme, cone.workedSolution);
    expect(r.available).toBe(1);
    expect(r.marks).toBeLessThanOrEqual(1);
    expect(r.earned.every((e) => e.code !== "A1")).toBe(true);
  });

  test("working that misses the method earns nothing", () => {
    for (const line of ["π × 6² × 15", "6 × 15", "I used the cone formula", ""]) {
      expect(markWorking([line], cone.scheme, cone.workedSolution).marks).toBe(0);
    }
  });
});

describe("markWorking: an algebraic rearrangement", () => {
  test("either side of the authored alternative earns the method mark", () => {
    expect(markWorking(["y + 8 = 5x"], rearrangement.scheme, rearrangement.workedSolution).marks).toBe(1);
    expect(markWorking(["5x = y + 8"], rearrangement.scheme, rearrangement.workedSolution).marks).toBe(1);
  });

  test("a line that agrees only on its last coefficient earns nothing", () => {
    // "x = (y+8)/5" and "y + 8 = 5x" both end on a 5; a coefficient is not a result.
    expect(markWorking(["x = (y + 8)/5"], rearrangement.scheme, rearrangement.workedSolution).marks).toBe(0);
    expect(markWorking(["5t = 3"], rearrangement.scheme, rearrangement.workedSolution).marks).toBe(0);
  });
});

describe("markWorking: a scheme with no method marks", () => {
  const scheme = [point({ id: "a1", code: "A", marks: 1, for: "$12$" }), point({ id: "b1", code: "B", marks: 1, for: "$x = 4$" })];

  test("nothing is available and nothing is awarded", () => {
    const r = markWorking(["12", "x = 4", "anything at all"], scheme, "$x = 4$, so the answer is $12$.");
    expect(r).toEqual({ earned: [], marks: 0, available: 0 });
  });
});

describe("markWorking: one line, two mark points", () => {
  const scheme = [
    point({ id: "m1", code: "M", marks: 1, for: "$3x + 5 = 20$" }),
    point({ id: "m2", code: "M", marks: 1, for: "$3x = 15$" }),
    point({ id: "a1", code: "A", marks: 1, for: "$x = 5$" }),
  ];

  test("a line that evidences two points pays for the first of them only", () => {
    // "3x + 5 = 20" rearranges to "3x = 15", so the algebra engine agrees with both mark points.
    const r = markWorking(["3x + 5 = 20"], scheme, "");
    expect(r.available).toBe(2);
    expect(r.marks).toBe(1);
    expect(r.earned.map((e) => e.id)).toEqual(["m1"]);
  });

  test("both lines written out earn both marks, and never more than the scheme carries", () => {
    const r = markWorking(["3x + 5 = 20", "3x = 15", "x = 5", "x = 5", "x = 5"], scheme, "");
    expect(r.marks).toBe(2);
    expect(r.available).toBe(2);
    expect(r.earned.map((e) => e.id)).toEqual(["m1", "m2"]);
  });
});

describe("markWorking: a line of working read for what it says (engine item 1, 23 Sep 2026)", () => {
  test("a line is not paid for ending on the same number as the mark point", () => {
    // The old comparer read the last number of each line as its value, so "y = 8" paid for the derivative.
    const scheme = [point({ id: "m1", code: "M", marks: 1, for: "$\\frac{dy}{dx} = -4x + 8$" }), point({ id: "a1", code: "A", marks: 1, for: "$x = 2$" })];
    expect(markWorking(["y = 8"], scheme, "").marks).toBe(0);
    expect(markWorking(["dy/dx = -4x + 8"], scheme, "").marks).toBe(1);
  });

  test("the expansion before a trailing 'or' is the maths a colon introduces", () => {
    // quadratic-formula-and-harder-quadratic-equations .0004: the fragment kept ", or" and was never found.
    const scheme = [point({ id: "m1", code: "M", marks: 1, for: "ac = −60 used: 10x² − 15x + 4x − 6, or one correct bracket seen" }), point({ id: "a1", code: "A", marks: 1, for: "(2x − 3)(5x + 2)" })];
    expect(markWorking(["10x^2 - 15x + 4x - 6 = 5x(2x-3) + 2(2x-3) = (2x-3)(5x+2)"], scheme, "").marks).toBe(1);
    expect(markWorking(["10x^2 - 11x - 6"], scheme, "").marks).toBe(0);
  });

  test("a list of one letter's values is found inside a sentence; one value alone is not", () => {
    // graphical-solution-of-quadratic-equations .0015 (c).
    const scheme = [point({ id: "m1", code: "M", marks: 1, for: "x = -1 and x = 5" })];
    expect(markWorking(["y = 0 on the x-axis, and the curve crosses it at x = -1 and x = 5."], scheme, "").marks).toBe(1);
    expect(markWorking(["the curve crosses at x = 5 only"], scheme, "").marks).toBe(0);
  });

  test("a fraction not in its lowest terms is working and may stand as a side of her chain; a value may not", () => {
    // inverse-proportion .0011 (b): "5/100" is the substitution worked, on the way to 1/20.
    const scheme = [point({ id: "m1", code: "M", marks: 1, for: "$y = \\dfrac{5}{4 \\times 25}$ or $\\dfrac{5}{100}$" }), point({ id: "a1", code: "A", marks: 1, for: "$\\dfrac{1}{20}$" })];
    expect(markWorking(["y = \\dfrac{5}{4 \\times 5^2} = \\dfrac{5}{100} = \\dfrac{1}{20}"], scheme, "").marks).toBe(1);
    const lowest = [point({ id: "m1", code: "M", marks: 1, for: "$\\dfrac{5}{14}$" })];
    expect(markWorking(["P = 1 - 9/14 = 5/14"], lowest, "").marks).toBe(0);
  });
});
