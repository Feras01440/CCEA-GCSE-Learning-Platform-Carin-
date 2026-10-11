import { describe, expect, test } from "vitest";
import type { MarkPoint } from "@/lib/content/schema";
import { ladderTotal, markWorking, methodSteps } from "./working";

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
    // The scheme's final accuracy point is on the ladder after the method point (the build-9 gate, class 3), so the
    // ladder carries both marks and the substitution alone reaches one of them.
    expect(r.available).toBe(2);
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

  test("the final accuracy point is reached only after the method point, and a wrong answer keeps marks − 1", () => {
    // The answer restated pairs with nothing before the final point: alone it earns nothing (the build-9 gate, class 3).
    const alone = markWorking(["565 cm³", "565"], cone.scheme, cone.workedSolution);
    expect(alone.marks).toBe(0);
    expect(alone.earned.every((e) => e.code !== "A1")).toBe(true);
    // After the method line the answer line is the final line reached: both marks on the ladder.
    const both = markWorking(["1/3 × π × 6² × 15", "565 cm³"], cone.scheme, cone.workedSolution);
    expect(both).toMatchObject({ marks: 2, available: 2 });
    // A wrong answer in the box still keeps at most marks − 1 of it (ladderTotal); a show-that pays every mark.
    expect(ladderTotal({ correct: false, marksAwarded: 0 }, both.marks, 2)).toBe(1);
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
    // "3x + 5 = 20" rearranges to "3x = 15", so the algebra engine agrees with both mark points. The final accuracy
    // point "x = 5" is on the ladder too (the build-9 gate, class 3), so the scheme carries three.
    const r = markWorking(["3x + 5 = 20"], scheme, "");
    expect(r.available).toBe(3);
    expect(r.marks).toBe(1);
    expect(r.earned.map((e) => e.id)).toEqual(["m1"]);
  });

  test("every line written out earns every mark, the final line last and never more than the scheme carries", () => {
    const r = markWorking(["3x + 5 = 20", "3x = 15", "x = 5", "x = 5", "x = 5"], scheme, "");
    expect(r.marks).toBe(3);
    expect(r.available).toBe(3);
    expect(r.earned.map((e) => e.id)).toEqual(["m1", "m2", "a1"]);
    // The final line alone, or with one method line missing, does not reach the final point.
    expect(markWorking(["x = 5"], scheme, "").marks).toBe(0);
    expect(markWorking(["3x = 15", "x = 5"], scheme, "").marks).toBe(1);
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
    // The chain shows the split and arrives at the factorised answer: the method point and, after it, the final point
    // (the build-9 gate, class 3); a wrong answer in the box still keeps marks − 1 of it through ladderTotal.
    const chain = markWorking(["10x^2 - 15x + 4x - 6 = 5x(2x-3) + 2(2x-3) = (2x-3)(5x+2)"], scheme, "");
    expect(chain.earned.map((e) => e.id)).toEqual(["m1", "a1"]);
    expect(ladderTotal({ correct: false, marksAwarded: 0 }, chain.marks, 2)).toBe(1);
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
    // The substitution is a side of her chain (M1), and the chain arrives at 1/20 after it (the final point; the
    // build-9 gate, class 3).
    expect(markWorking(["y = \\dfrac{5}{4 \\times 5^2} = \\dfrac{5}{100} = \\dfrac{1}{20}"], scheme, "").earned.map((e) => e.id)).toEqual(["m1", "a1"]);
    // A value in lowest terms is a result: it is no side of a chain for a method point that is not the scheme's last
    // (here the answer line is A1), and a link of her chain never pays a point by the value it ends on.
    const lowest = [point({ id: "m1", code: "M", marks: 1, for: "$\\dfrac{5}{14}$" }), point({ id: "a1", code: "A", marks: 1, for: "0.36" })];
    expect(markWorking(["P = 1 - 9/14 = 5/14"], lowest, "").marks).toBe(0);
    // Where the value is the scheme's final point, the chain that arrives at it reaches it (the build-9 gate, class 3).
    expect(markWorking(["P = 1 - 9/14 = 5/14"], [lowest[0]!], "").marks).toBe(1);
  });
});

// Trial audit MK-04 (24 Sep 2026, reproduced 25 Sep on fm1/algebraic-fractions-simplify): the ladder paid the whole
// tariff for a wrong answer from bare fragments. "(x+3)" alone paid "(x + 3) cancelled", "2(x-2)" alone paid "answer
// fully simplified to 2(x - 2) over (x + 3)", "5(x+4)" alone paid "both lines factorised: 5(x + 4) over (x + 4)(x - 4)",
// while the line a candidate writes for that mark, "5(x+4)/((x+4)(x-4))", paid nothing. Now: "A over B" in a point is
// one piece of working that needs both A and B; a lone bracket such as "(x + 3)" is never evidence on its own; and a
// wrong answer never collects every mark (ladderTotal).
describe("markWorking: fractions, lone brackets and dependent points (MK-04)", () => {
  const q9 = [
    point({ id: "MW1", code: "MW", marks: 1, for: "numerator factorised: 2(x + 3)(x - 2)" }),
    point({ id: "MW2", code: "MW", marks: 1, for: "denominator factorised: (x + 3)²" }),
    point({ id: "MW3", code: "MW", marks: 1, for: "(x + 3) cancelled", ft: true, dependsOn: ["MW1", "MW2"] }),
    point({ id: "W1", code: "W", marks: 1, for: "answer fully simplified to 2(x - 2) over (x + 3), with no common factor left", dependsOn: ["MW3"] }),
  ];
  const q1 = [
    point({ id: "MW1", code: "MW", marks: 1, for: "both lines factorised: 5(x + 4) over (x + 4)(x - 4)" }),
    point({ id: "MW2", code: "MW", marks: 1, for: "(x + 4) cancelled and the answer left as 5 over (x - 4)", ft: true, dependsOn: ["MW1"] }),
  ];
  test("the audit's four fragments earn the two factorisations and nothing more", () => {
    const w = markWorking(["2(x+3)(x-2)", "(x+3)^2", "(x+3)", "2(x-2)"], q9);
    expect(w.earned.map((e) => e.id)).toEqual(["MW1", "MW2"]);
    expect(w.marks).toBe(2);
  });
  test("a lone bracket or a lone numerator is no evidence", () => {
    expect(markWorking(["(x+3)"], q9).marks).toBe(0);
    expect(markWorking(["2(x-2)"], q9).marks).toBe(0);
    expect(markWorking(["5(x+4)"], q1).marks).toBe(0);
  });
  test("the factorised fraction a candidate writes earns the factorising mark, as a line or as a chain", () => {
    expect(markWorking(["5(x+4)/((x+4)(x-4))"], q1).earned.map((e) => e.id)).toEqual(["MW1"]);
    expect(markWorking(["(5x+20)/(x^2-16) = 5(x+4)/((x+4)(x-4))"], q1).earned.map((e) => e.id)).toEqual(["MW1"]);
    expect(markWorking(["(5x+20)/(x^2-16)"], q1).marks).toBe(0);
    // The top and the bottom on lines of their own show both lines factorised too.
    expect(markWorking(["5(x+4)", "(x+4)(x-4)", "5/(x-4)"], q1).earned.map((e) => e.id)).toEqual(["MW1", "MW2"]);
  });
  test("the simplified fraction, as one line, is the answer point's evidence; its top alone is not", () => {
    // dependsOn is not applied on the ladder (a prerequisite written in words it cannot find would take away marks
    // right working earned), so the fraction line earns its own point; the cap keeps a wrong answer below full marks.
    expect(markWorking(["2(x-2)/(x+3)"], q9).earned.map((e) => e.id)).toEqual(["W1"]);
    expect(markWorking(["2(x-2)", "(x+3)"], q9).earned.map((e) => e.id)).toEqual([]);
    const all = markWorking(["2(x+3)(x-2)/(x+3)^2", "(x+3)^2", "2(x-2)/(x+3)"], q9);
    expect(all.earned.map((e) => e.id)).toEqual(["MW1", "MW2", "W1"]);
  });
  test("ladderTotal: a wrong answer never collects every mark; a right one keeps its own", () => {
    expect(ladderTotal({ correct: false, marksAwarded: 0 }, 4, 4)).toBe(3);
    expect(ladderTotal({ correct: false, marksAwarded: 0 }, 2, 4)).toBe(2);
    expect(ladderTotal({ correct: false, marksAwarded: 3 }, 1, 4)).toBe(3);
    expect(ladderTotal({ correct: true, marksAwarded: 4 }, 0, 4)).toBe(4);
    expect(ladderTotal({ correct: false, marksAwarded: 0 }, null, 4)).toBe(0);
  });
});

// The QA fixer (25 Sep 2026): a method point that gives an example, "a difference over a difference formed, e.g.
// (73 − 37)/(4 − 1)", was never paid: the example was read with its "e.g." attached, and working with other points read
// off the same line ("(85 − 25)/(5 − 0)") could never match it. An example stands for any working of the same shape
// that comes to the same value; and a fraction whose bottom a point names ("… over (x + 1)(x − 2)") is found only as a
// fraction, so the bracket inside a numerator is not it.
describe("markWorking: an example in a point, and a named denominator", () => {
  const gradient = [
    point({ id: "M1", code: "M", marks: 1, for: "two points read with the scales and a difference over a difference formed, e.g. (73 − 37)/(4 − 1)" }),
    point({ id: "A1", code: "A", marks: 1, for: "12", dependsOn: ["M1"] }),
  ];
  test.each([["(73 - 37)/(4 - 1)"], ["(85 - 25)/(5 - 0)"], ["m = (85 - 25)/(5 - 0) = 60/5 = 12"], ["(61 - 25)/(3 - 0)"]])("%s shows the method", (line) => {
    // The chain that goes on to 12 reaches the final point as well (the build-9 gate, class 3); the method is in each.
    expect(markWorking([line], gradient).earned.map((e) => e.id)).toContain("M1");
  });
  test.each([["(85 - 25)/(5 - 1)"], ["85 - 25 = 60"], ["(85 + 25)/(5 + 0)"], ["12"]])("%s does not", (line) => {
    expect(markWorking([line], gradient).marks).toBe(0);
  });
  const common = [
    point({ id: "MA1", code: "MA", marks: 2, for: "all three terms over (x + 1)(x − 2), the 2 written as 2(x + 1)(x − 2): [2(x + 1)(x − 2) + 3(x − 2) − (x + 1)] over (x + 1)(x − 2)" }),
  ];
  test("m4 algebraic fractions .0006: the fraction over the common denominator earns it; the numerator alone does not", () => {
    expect(markWorking(["(2(x+1)(x-2) + 3(x-2) - (x+1))/((x+1)(x-2))"], common).marks).toBe(2);
    expect(markWorking(["2(x+1)(x-2) + 3(x-2) - (x+1)"], common).marks).toBe(0);
  });
});

// Build-9 gate, class 3 (the verifier, 29 Sep 2026): the printed target typed into the working box earned full marks,
// because the ladder paired the restated target with the worked solution's last line and the runner then paid every
// mark. The final line of a scheme is reached only when the method points before it are reached; a restated target
// pairs with nothing.
describe("the answer restated is not the method (build-9 gate, class 3)", () => {
  /** m8 pythagoras-and-trigonometry-in-3d .0014(a): "Show that AC = 13 cm." */
  const cuboid = {
    scheme: [
      point({ id: "ma1", code: "MA", marks: 1, for: "$AC^2 = 5^2 + 12^2$ (or $= 169$)" }),
      point({ id: "a1", code: "A", marks: 1, for: String.raw`$AC = \sqrt{169} = 13$ seen`, dependsOn: ["ma1"] }),
    ],
    workedSolution: String.raw`$AC^2 = 5^2 + 12^2 = 25 + 144 = 169$, so $AC = \sqrt{169} = 13$ cm.`,
  };
  test("'A1 AC = √169 = 13 seen dep MA1': 'AC = 13' alone earns nothing; the first line earns MA1 of two; both lines earn both", () => {
    expect(markWorking(["AC = 13"], cuboid.scheme, cuboid.workedSolution)).toMatchObject({ marks: 0, available: 2 });
    expect(markWorking(["AC = 13", "so AC is 13 cm"], cuboid.scheme, cuboid.workedSolution).marks).toBe(0);
    expect(markWorking(["AC^2 = 5^2 + 12^2"], cuboid.scheme, cuboid.workedSolution)).toMatchObject({ marks: 1, available: 2 });
    expect(markWorking(["AC^2 = 5^2 + 12^2 = 169", "AC = √169 = 13"], cuboid.scheme, cuboid.workedSolution)).toMatchObject({ marks: 2, available: 2 });
    // The root implied after the substitution: the final line follows the method line.
    expect(markWorking(["AC^2 = 5^2 + 12^2 = 169", "AC = 13"], cuboid.scheme, cuboid.workedSolution).marks).toBe(2);
  });
  test("QuestionRunner's show-that rule then pays every mark only when every point is reached", () => {
    const marked = { correct: false, marksAwarded: 0, workingOnly: true };
    const total = (lines: string[]) => {
      const ev = markWorking(lines, cuboid.scheme, cuboid.workedSolution);
      return marked.workingOnly && ev.available > 0 && ev.marks >= ev.available ? 2 : ladderTotal(marked, ev.marks, 2);
    };
    expect(total(["AC = 13"])).toBe(0);
    expect(total(["AC^2 = 5^2 + 12^2"])).toBe(1);
    expect(total(["AC^2 = 5^2 + 12^2 = 169", "AC = √169 = 13"])).toBe(2);
  });
  test("m8 sine-rule .0018(a) 'MA2 242 − 155 = 87 with the conclusion stated': '87' alone earns nothing; the two lines earn both", () => {
    const bearing = {
      scheme: [
        point({ id: "ma1", code: "MA", marks: 1, for: "bearing of A from B = 062 + 180 = 242 (or the co-interior angle 180 − 62 = 118 used at B)" }),
        point({ id: "ma2", code: "MA", marks: 1, for: "242 − 155 = 87 with the conclusion stated" }),
      ],
      workedSolution: String.raw`The bearing of $A$ from $B$ is the back bearing $062^\circ + 180^\circ = 242^\circ$. The bearing of $C$ from $B$ is $155^\circ$, so angle $ABC = 242^\circ - 155^\circ = 87^\circ$ as required.`,
    };
    expect(markWorking(["87"], bearing.scheme, bearing.workedSolution).marks).toBe(0);
    expect(markWorking(["angle ABC = 87"], bearing.scheme, bearing.workedSolution).marks).toBe(0);
    expect(markWorking(["bearing of A from B = 062 + 180 = 242", "242 - 155 = 87 so angle ABC = 87"], bearing.scheme, bearing.workedSolution)).toMatchObject({ marks: 2, available: 2 });
  });
  test("m8 simultaneous .0005(a) 'A1 x² − 8x + 16 = 0 reached with the collecting shown dep M1': the printed equation alone earns nothing", () => {
    const meet = {
      scheme: [point({ id: "m1", code: "M", marks: 1, for: "x^2 - 6x + 10 = 2x - 6 seen" }), point({ id: "a1", code: "A", marks: 1, for: "x^2 - 8x + 16 = 0 reached with the collecting shown", dependsOn: ["m1"] })],
      workedSolution: "At a common point the two $y$ values agree, so $x^2 - 6x + 10 = 2x - 6$. Subtracting $2x$ and adding 6 gives $x^2 - 8x + 16 = 0$.",
    };
    // The target has the same root as the M1 equation: it is the final line, and pairs with nothing before it.
    expect(markWorking(["x^2 - 8x + 16 = 0"], meet.scheme, meet.workedSolution)).toMatchObject({ marks: 0, available: 2 });
    expect(markWorking(["x^2 - 6x + 10 = 2x - 6"], meet.scheme, meet.workedSolution).marks).toBe(1);
    expect(markWorking(["x^2 - 6x + 10 = 2x - 6", "x^2 - 8x + 16 = 0"], meet.scheme, meet.workedSolution).marks).toBe(2);
  });
  test("m3 difference-of-two-squares .0015(a) 'A1 (2n)² expanded to 4n² and the printed result reached dep MA1': the printed expression alone earns nothing", () => {
    const card = {
      scheme: [point({ id: "ma1", code: "MA", marks: 1, for: "(2n)² and 6² written, or (2n)² − 6²" }), point({ id: "a1", code: "A", marks: 1, for: "(2n)² expanded to 4n² and the printed result reached", dependsOn: ["ma1"] })],
      workedSolution: "Area of card $= (2n)^2 - 6^2 = 4n^2 - 36$ square centimetres, as required.",
    };
    expect(markWorking(["4n^2 - 36"], card.scheme, card.workedSolution).marks).toBe(0);
    expect(markWorking(["(2n)^2 - 6^2", "= 4n^2 - 36"], card.scheme, card.workedSolution).marks).toBe(2);
  });
  test("methodSteps still lists the method points only (the runner's ladder chips never print the answer line)", () => {
    expect(methodSteps(cuboid.scheme, cuboid.workedSolution).map((s) => s.id)).toEqual(["ma1"]);
  });
});

// From the verifier's probes re-run on the gate's engine (29 Sep 2026): the final line is reached by a chain that
// arrives at the result; a lead-in ("so the answer is …") does not hide a restated target; a one-point scheme that
// names the equating line and the result is not met by the result alone.
describe("the final line reached by a chain, and the target behind a lead-in (build-9 gate, class 3)", () => {
  test("m8 surds .0019(a) 'A1 √18 simplified to 3√2, with the working shown dep M1': the chain r = √18 = √9 × √2 = 3√2 reaches it", () => {
    const radius = {
      scheme: [point({ id: "m1", code: "M", marks: 1, for: "πr² = 18π leading to r² = 18, or r = √18" }), point({ id: "a1", code: "A", marks: 1, for: "√18 simplified to 3√2, with the working shown", dependsOn: ["m1"] })],
      workedSolution: String.raw`$\pi r^2 = 18\pi$, so $r^2 = 18$ and $r = \sqrt{18} = \sqrt{9}\sqrt{2} = 3\sqrt{2}$ cm, as printed.`,
    };
    expect(markWorking(["πr² = 18π so r² = 18", "r = √18 = √9 × √2 = 3√2"], radius.scheme, radius.workedSolution)).toMatchObject({ marks: 2, available: 2 });
    expect(markWorking(["3√2"], radius.scheme, radius.workedSolution).marks).toBe(0);
  });
  test("m3 identities .0008 'A1 subtraction of 4x² completed to reach 28x + 49 dep MA2': the line that arrives at 28x + 49 reaches it", () => {
    const identity = {
      scheme: [
        point({ id: "ma1", code: "MA", marks: 1, for: "(2x + 7)(2x + 7) written out or 4x² + 14x + 14x + 49" }),
        point({ id: "ma2", code: "MA", marks: 1, for: "4x² + 28x + 49 obtained" }),
        point({ id: "a1", code: "A", marks: 1, for: "subtraction of 4x² completed to reach 28x + 49", dependsOn: ["ma2"] }),
      ],
      workedSolution: "$(2x+7)^2 = (2x+7)(2x+7) = 4x^2 + 14x + 14x + 49 = 4x^2 + 28x + 49$.\nThen $4x^2 + 28x + 49 - 4x^2 = 28x + 49$, as required.",
    };
    const lines = ["(2x+7)^2 = 4x^2 + 14x + 14x + 49 = 4x^2 + 28x + 49", "4x^2 + 28x + 49 - 4x^2 = 28x + 49"];
    expect(markWorking(lines, identity.scheme, identity.workedSolution)).toMatchObject({ marks: 3, available: 3 });
    expect(markWorking(["28x + 49"], identity.scheme, identity.workedSolution).marks).toBe(0);
  });
  test("m3 solving-quadratic .0011(a) 'MA2 divided by 2 to reach x² − 31x + 168 = 0': 'so the answer is x² − 31x + 168 = 0' is the target restated", () => {
    const rect = {
      scheme: [
        point({ id: "m1", code: "M", marks: 1, for: "Pythagoras used: x² + (31 − x)² = 25²" }),
        point({ id: "a1", code: "A", marks: 1, for: "(31 − x)² expanded correctly as 961 − 62x + x²", dependsOn: ["m1"] }),
        point({ id: "ma1", code: "MA", marks: 1, for: "2x² − 62x + 336 = 0 or equivalent" }),
        point({ id: "ma2", code: "MA", marks: 1, for: "divided by 2 to reach x² − 31x + 168 = 0" }),
      ],
      workedSolution: "By Pythagoras, $x^2 + (31 - x)^2 = 25^2$.\n$(31 - x)^2 = 961 - 62x + x^2$, so $x^2 + 961 - 62x + x^2 = 625$.\nCollecting: $2x^2 - 62x + 961 - 625 = 0$, that is $2x^2 - 62x + 336 = 0$.\nDividing by 2: $x^2 - 31x + 168 = 0$, as required.",
    };
    for (const line of ["so the answer is x^2 - 31x + 168 = 0", "x^2 - 31x + 168 = 0", "answer: x^2 - 31x + 168 = 0"]) expect(markWorking([line], rect.scheme, rect.workedSolution).marks, line).toBe(0);
    expect(markWorking(["x^2 + (31 - x)^2 = 25^2", "2x^2 - 62x + 336 = 0", "x^2 - 31x + 168 = 0"], rect.scheme, rect.workedSolution).marks).toBe(3);
  });
  test("m8 simultaneous .0001 'MA1 x² − 5 = x − 3 leading to x² − x − 2 = 0': the result alone is not the point, the equating line is", () => {
    const one = {
      scheme: [point({ id: "ma1", code: "MA", marks: 1, for: "x^2 - 5 = x - 3 leading to x^2 - x - 2 = 0" })],
      workedSolution: "Both right-hand sides equal $y$, so $x^2 - 5 = x - 3$. Subtracting $x$ and adding 3 to both sides gives $x^2 - x - 2 = 0$.",
    };
    expect(markWorking(["x^2-x-2=0"], one.scheme, one.workedSolution).marks).toBe(0);
    expect(markWorking(["so the answer is x^2-x-2=0"], one.scheme, one.workedSolution).marks).toBe(0);
    expect(markWorking(["x^2 - 5 = x - 3"], one.scheme, one.workedSolution).marks).toBe(1);
    expect(markWorking(["x^2 - 5 = x - 3", "x^2 - x - 2 = 0"], one.scheme, one.workedSolution).marks).toBe(1);
  });
});

// Two lines, two points: each line pays one point, and the assignment that earns both is the one taken (the build-9
// gate, class 3): the fraction shows the numerator factorised and the fraction formed; the bare factorised numerator
// shows only the first, so it takes the first and the fraction the second.
describe("lines are assigned to points so that the most is earned", () => {
  test("a line that shows two points and a line that shows one earn both", () => {
    const scheme = [point({ id: "mw1", code: "MW", marks: 1, for: "numerator factorised: (x + 2)(x + 4)" }), point({ id: "mw2", code: "MW", marks: 1, for: "(x + 2)(x + 4) over (x + 1)(x − 1)" })];
    const r = markWorking(["(x+2)(x+4)/((x+1)(x-1))", "(x+2)(x+4)"], scheme, "");
    expect(r.marks).toBe(2);
    expect(r.earned.map((e) => `${e.id}<${e.matchedLine}`)).toEqual(["mw1<(x+2)(x+4)", "mw2<(x+2)(x+4)/((x+1)(x-1))"]);
  });
});

// The verifier's floor sweep (29 Sep 2026): the answer point "A over B" was met by a fraction that merely held A and B
// ("2(5x + 2) over 2x(x + 1)"), so a no-step equivalent kept a mark after the floor went. The final point is the
// answer itself; an earlier "A over B" point is still found inside her line.
describe("the answer point 'A over B' is her fraction itself (build-9 gate, class 5)", () => {
  const scheme = [
    point({ id: "mw1", code: "MW", marks: 1, for: "both lines factorised: (x + 5)(x + 2) over (x + 5)(x − 2)" }),
    point({ id: "mw2", code: "MW", marks: 1, for: "(x + 5) cancelled and the answer left as (x + 2) over (x − 2)" }),
  ];
  test("fm1 algebraic-fractions-simplify .0003 'MW2 (x + 5) cancelled and the answer left as (x + 2) over (x − 2)'", () => {
    expect(markWorking(["2(x+2)/(2(x-2))"], scheme, "").marks).toBe(0);
    expect(markWorking(["(x+1)(x+2)/((x+1)(x-2))"], scheme, "").marks).toBe(0);
    expect(markWorking(["(x+5)(x+2)/((x+5)(x-2))"], scheme, "").earned.map((e) => e.id)).toEqual(["mw1"]);
    expect(markWorking(["(x+5)(x+2)/((x+5)(x-2))", "(x+2)/(x-2)"], scheme, "").marks).toBe(2);
  });
});

// The corpus guard (29 Sep 2026), three refinements of class 3 and class 5.
describe("a restated final line, the answer point, and a factorisation written in prose", () => {
  test("fm1 completing-square-minimum-point .0009(a) 'M1 the bracket (x − 5/2)²': the final line holds the bracket, and pays it by containment", () => {
    const scheme = [point({ id: "m1", code: "M", marks: 1, for: String.raw`the bracket $\left(x - \frac{5}{2}\right)^{2}$` }), point({ id: "w1", code: "W", marks: 1, for: String.raw`$f(x) = \left(x - \frac{5}{2}\right)^{2} + \frac{19}{4}$` })];
    const line = String.raw`f(x) = (x - \frac{5}{2})^{2} + \frac{19}{4}.`;
    // Alone: the bracket is there, and one line pays one point, the earlier first (M1); the final line written after
    // the bracket on its own line earns both.
    expect(markWorking([line], scheme, "").earned.map((e) => e.id)).toEqual(["m1"]);
    expect(markWorking([String.raw`(x - \frac{5}{2})^{2}`, line], scheme, "").earned.map((e) => e.id)).toEqual(["m1", "w1"]);
    // The restated target of a two-piece final point pays nothing but the containment.
    const meet = [point({ id: "m1", code: "M", marks: 1, for: "x^2 - 6x + 10 = 2x - 6 seen" }), point({ id: "a1", code: "A", marks: 1, for: "x^2 - 8x + 16 = 0 reached with the collecting shown", dependsOn: ["m1"] })];
    expect(markWorking(["x^2 - 8x + 16 = 0"], meet, "").marks).toBe(0);
  });
  test("m3 difference-of-two-squares .0011(a) 'A2 2(2x + 1)(2x − 1)': the answer point is the answer as written, not an equal form", () => {
    const scheme = [
      point({ id: "ma1", code: "MA", marks: 1, for: "2(4x² − 1)" }),
      point({ id: "a1", code: "A", marks: 1, for: "4x² recognised as (2x)² and 1 as 1²", dependsOn: ["ma1"] }),
      point({ id: "a2", code: "A", marks: 1, for: "2(2x + 1)(2x − 1)", dependsOn: ["a1"] }),
    ];
    const ws = String.raw`$8x^2 - 2 = 2(4x^2 - 1) = 2\big((2x)^2 - 1^2\big) = 2(2x + 1)(2x - 1)$.`;
    expect(markWorking(["2(4x^2-1)"], scheme, ws)).toMatchObject({ marks: 1, available: 2 });
    expect(markWorking(["2(4x^2-1)", "2(2x+1)(2x-1)"], scheme, ws).marks).toBe(2);
  });
  test("fm1 algebraic-fractions-simplify .0004 'MW1 numerator factorised: 2(x − 2)(x + 2)': the worked solution's prose line holds it", () => {
    const scheme = [point({ id: "mw1", code: "MW", marks: 1, for: "numerator factorised: 2(x − 2)(x + 2)" }), point({ id: "mw2", code: "MW", marks: 1, for: "denominator factorised: (x + 2)²" }), point({ id: "w1", code: "W", marks: 1, for: "answer 2(x − 2) over (x + 2)" })];
    // One line pays one point: the prose line holds both factorisations and takes the first; a line whose numerator is
    // not factorised still holds the denominator's.
    expect(markWorking(["Factorising the numerator gives 2(x-2)(x+2) and the denominator gives (x+2)^{2}."], scheme, "").earned.map((e) => e.id)).toEqual(["mw1"]);
    expect(markWorking(["Factorising the numerator gives 2(x^2-4) and the denominator gives (x+2)^{2}."], scheme, "").earned.map((e) => e.id)).toEqual(["mw2"]);
    expect(markWorking(["Factorising the numerator gives 2(x-2)(x+2)", "and the denominator gives (x+2)^{2}."], scheme, "").marks).toBe(2);
  });
});

// The corpus guard (29 Sep 2026): the worked solution's whole last line had been read as "the final result", so a
// one-line solution equal to it could pay only by containment; and a method-coded final point offered the result
// restated needs one earlier point, not every one, so a solution with a prose line the ladder cannot read keeps it.
describe("a one-line solution is working, and the final W mark after one readable step", () => {
  test("fm2 inclined-plane .0007 'MW1 50 sin 40°, W1 32.14 dep MW1': the worked solution's own line earns both", () => {
    const scheme = [point({ id: "mw1", code: "MW", marks: 1, for: "$50\\sin 40°$" }), point({ id: "w1", code: "W", marks: 1, for: "$32.14$", dependsOn: ["mw1"] })];
    const ws = "$50\\sin 40° = 32.14$ N.";
    expect(markWorking(["50\\sin 40° = 32.14 N."], scheme, ws)).toMatchObject({ marks: 2, available: 2 });
    expect(markWorking(["32.14 N"], scheme, ws).marks).toBe(0);
  });
  test("m7 product-rule .0003 'M1 3 x 5 x 4 seen, A1 60 dep M1': the worked solution's own line earns both", () => {
    const scheme = [point({ id: "m1", code: "M", marks: 1, for: "3 x 5 x 4 seen" }), point({ id: "a1", code: "A", marks: 1, for: "60", dependsOn: ["m1"] })];
    expect(markWorking(["3 \\times 5 \\times 4 = 60 wristbands."], scheme, "3 $\\times$ 5 $\\times$ 4 $=$ 60 wristbands.")).toMatchObject({ marks: 2, available: 2 });
    expect(markWorking(["60 wristbands"], scheme, "3 $\\times$ 5 $\\times$ 4 $=$ 60 wristbands.").marks).toBe(0);
  });
  test("fm1 integration-as-inverse .0002 'W1 2x⁵ + 3x + c complete': the final line after one readable term line keeps W1", () => {
    const scheme = [
      point({ id: "mw1", code: "MW", marks: 1, for: "$2x^{5}$ from the term $10x^{4}$" }),
      point({ id: "mw2", code: "MW", marks: 1, for: "$3x$ from the term $3$" }),
      point({ id: "w1", code: "W", marks: 1, for: "$2x^{5} + 3x + c$ complete, with the constant of integration" }),
    ];
    const ws = "$10x^{4}$ raises to $x^{5}$ and $10 \\div 5 = 2$, giving $2x^{5}$.\n$3$ raises to $x^{1}$ and $3 \\div 1 = 3$, giving $3x$.\nSo the integral is $2x^{5} + 3x + c$.";
    const lines = ["10x^{4} raises to x^{5} and 10 \\div 5 = 2, giving 2x^{5}.", "3 raises to x^{1} and 3 \\div 1 = 3, giving 3x.", "So the integral is 2x^{5} + 3x + c."];
    expect(markWorking(lines, scheme, ws).earned.map((e) => e.id)).toEqual(["mw1", "w1"]);
    // The final line alone shows 2x⁵ (MW1, as an examiner sees the term in the answer), and being spent on it reuses
    // nothing for W1: the result restated pays the final point only on its own; "3x" is too short a fragment to find.
    expect(markWorking([lines[2]!], scheme, ws).earned.map((e) => e.id)).toEqual(["mw1"]);
  });
});

// The corpus guard's third round (29 Sep 2026): the answer point's fraction is read from the maths at the end of her
// clause; a point that uses a factorisation in a quotient is not a factorisation to find; a reaction equation is never
// the result restated; the worked solution's tail loses its lead-in so a restated "So the single logarithm is …" is seen.
describe("the answer point in prose, a quotient in a factorising point, equations and lead-ins", () => {
  test("fm1 add-subtract .0016(b) 'W1 answer 120(x + 2) over x(x + 4) dep MW2': the answer at the end of a prose line is the answer", () => {
    const scheme = [point({ id: "mw2", code: "MW", marks: 1, for: "numerator collected: 120x + 240" }), point({ id: "w1", code: "W", marks: 1, for: "answer 120(x + 2) over (x(x + 4))", dependsOn: ["mw2"] })];
    const lines = ["Over x(x+4) the numerator is 60(x+4) + 60x = 120x+240.", "Taking the common factor out gives 120(x+2), and nothing cancels with the denominator, so the answer is \\frac{120(x+2)}{x(x+4)}."];
    expect(markWorking(lines, scheme, "").earned.map((e) => e.id)).toEqual(["mw2", "w1"]);
    // Scaled top and bottom is not the answer.
    expect(markWorking([lines[0]!, "so the answer is \\frac{2(120(x+2))}{2(x(x+4))}"], scheme, "").earned.map((e) => e.id)).toEqual(["mw2"]);
  });
  test("m3 difference-of-two-squares .0010(b) 'MA1 their factorisation used: (x + 4)(x − 4) ÷ (x + 4)': a quotient is found as written", () => {
    const scheme = [point({ id: "ma1", code: "MA", marks: 1, for: "their factorisation used: (x + 4)(x − 4) ÷ (x + 4)" }), point({ id: "a1", code: "A", marks: 1, for: "x − 4", dependsOn: ["ma1"] })];
    const ws = "$\\dfrac{x^2 - 16}{x + 4} = \\dfrac{(x + 4)(x - 4)}{x + 4} = x - 4$.";
    // The worked solution's own line: the factorisation used (MA1, paired from the solution) and the chain arriving at x − 4 (A1).
    expect(markWorking(["\\dfrac{x^2 - 16}{x + 4} = \\dfrac{(x + 4)(x - 4)}{x + 4} = x - 4."], scheme, ws)).toMatchObject({ marks: 2, available: 2 });
  });
  test("c2 alkenes .0011(b) 'P2 balanced: C2H4 + 3O2 -> 2CO2 + 2H2O dep P1': the equation written out is the working, not the result restated", () => {
    const scheme = [point({ id: "p1", code: "P", marks: 1, for: "correct formulae on both sides" }), point({ id: "p2", code: "P", marks: 1, for: "balanced: C2H4 + 3O2 -> 2CO2 + 2H2O", dependsOn: ["p1"] })];
    expect(markWorking(["C2H4 + 3O2 → 2CO2 + 2H2O"], scheme, "C2H4 + 3O2 → 2CO2 + 2H2O.").earned.map((e) => e.id)).toEqual(["p2"]);
  });
  test("fm1 laws-of-logarithms .0004 'W1 log 8x³': 'So the single logarithm is log 8x³' alone is the result restated", () => {
    const scheme = [point({ id: "mw1", code: "MW", marks: 1, for: "the power law: $3\log 2x = \log (2x)^{3}$" }), point({ id: "w1", code: "W", marks: 1, for: "$\log 8x^{3}$" })];
    const ws = "The power law takes the coefficient inside: $3\log 2x = \log (2x)^{3}$.\nSo the single logarithm is $\log 8x^{3}$.";
    expect(markWorking(["So the single logarithm is \log 8x^{3}."], scheme, ws).marks).toBe(0);
    expect(markWorking(["3\log 2x = \log (2x)^{3}", "So the single logarithm is \log 8x^{3}."], scheme, ws).marks).toBe(2);
  });
});

describe("a fraction is found in its clause and as a factor of a product (the corpus guard, 29 Sep 2026)", () => {
  // FM1 algebraic-fractions-add-subtract .0001: the worked solution's own lines earned nothing on their own once the
  // answer point had to be her fraction itself, because the side held two fractions and prose between them.
  const addSubtract: MarkPoint[] = [
    { id: "MW1", code: "MW", marks: 1, for: "lowest common denominator x(x + 1)" },
    { id: "M1", code: "M", marks: 1, for: "each numerator multiplied up: 2x + 2 and 3x", dependsOn: ["MW1"] },
    { id: "MW2", code: "MW", marks: 1, for: "numerator collected: 5x + 2; answer (5x + 2) over (x(x + 1))", dependsOn: ["M1"] },
  ];
  const ws =
    "The lowest common denominator is $x(x+1)$.\nMultiplying each numerator up gives $\\frac{2(x+1) + 3x}{x(x+1)}$, which collects to $\\frac{5x+2}{x(x+1)}$.\nNothing cancels, so the answer is $\\frac{5x+2}{x(x+1)}$.";
  test("'numerator collected: 5x + 2; answer (5x + 2) over (x(x + 1))': the fraction after ', which collects to' is her fraction", () => {
    const line = "Multiplying each numerator up gives \\frac{2(x+1) + 3x}{x(x+1)}, which collects to \\frac{5x+2}{x(x+1)}.";
    expect(markWorking([line], [addSubtract[2]!], ws).earned.map((e) => e.id)).toEqual(["MW2"]);
    // One line pays one point: with the whole scheme it pays the denominator point or this one, never both.
    expect(markWorking([line], addSubtract, ws).marks).toBe(1);
    expect(markWorking(["LCD = x(x+1)", line], addSubtract, ws).earned.map((e) => e.id).sort()).toEqual(["MW1", "MW2"]);
  });
  test("the collected numerator alone is the numerator collected, never the result restated: the result is the fraction", () => {
    expect(markWorking(["5x+2"], addSubtract, ws).earned.map((e) => e.id)).toEqual(["MW2"]);
    // The result itself, alone, is restated: it pays only a point whose maths stands whole inside it (the denominator).
    expect(markWorking(["\\frac{5x+2}{x(x+1)}"], addSubtract, ws).earned.map((e) => e.id)).not.toContain("MW2");
  });
  // FM1 algebraic-fractions-multiply-divide .0015(b): the first factor of a product of fractions shows its top.
  const multiplyDivide: MarkPoint[] = [
    { id: "MW1", code: "MW", marks: 1, for: "the numerator of the first fraction taken from part (a): (2x - 1)(x + 3)" },
    { id: "M1", code: "M", marks: 1, for: "the remaining lines factorised, including 4x² - 1 = (2x - 1)(2x + 1)" },
    { id: "MW2", code: "MW", marks: 1, for: "(2x - 1) and (x + 3) cancelled", dependsOn: ["M1"] },
    { id: "W1", code: "W", marks: 1, for: "answer 2(x + 3) over (2x + 1)", dependsOn: ["MW2"] },
  ];
  test("'the numerator of the first fraction taken from part (a): (2x - 1)(x + 3)' is the top of the first factor of a product", () => {
    const line = "Using part (a), \\dfrac{2x^{2}+5x-3}{x+3} \\times \\dfrac{2x+6}{4x^{2}-1} = \\dfrac{(2x-1)(x+3)}{x+3} \\times \\dfrac{2(x+3)}{(2x-1)(2x+1)}.";
    expect(markWorking([line], multiplyDivide, "").earned.map((e) => e.id)).toContain("MW1");
  });
  test("'answer 2(x + 3) over (2x + 1)' is not met by that fraction as one factor of a product", () => {
    expect(markWorking(["\\dfrac{2(x+3)}{2x+1} \\times \\dfrac{1}{1}"], [multiplyDivide[3]!], "").earned).toEqual([]);
  });
  // FM1 algebraic-fractions-add-subtract .0004: the top of the fraction she collects to, its power in braces.
  const nested: MarkPoint[] = [
    { id: "MW1", code: "MW", marks: 1, for: "lowest common denominator (x + 3)(x - 1)" },
    { id: "M1", code: "M", marks: 1, for: "each numerator multiplied up: x² - x and 2x + 6", dependsOn: ["MW1"] },
    { id: "MW2", code: "MW", marks: 1, for: "numerator collected: x² + x + 6", dependsOn: ["M1"] },
    { id: "W1", code: "W", marks: 1, for: "answer (x² + x + 6) over (x + 3)(x - 1)", dependsOn: ["MW2"] },
  ];
  test("'numerator collected: x² + x + 6' is the top of the fraction she collects to, written x^{2}", () => {
    const line = "Multiplying each numerator up gives \\frac{x(x-1) + 2(x+3)}{(x+3)(x-1)}, which collects to \\frac{x^{2}+x+6}{(x+3)(x-1)}.";
    expect(markWorking([line], [nested[2]!], "").earned.map((e) => e.id)).toEqual(["MW2"]);
    expect(markWorking([line], nested, "").marks).toBe(1);
  });
  // FM1 algebraic-fractions-multiply-divide .0013: every line factorised, as a product of two fractions, meets the
  // example "(2x − 5)(2x + 5) over (x + 3)" through its first factor.
  test("'every numerator and denominator factorised, e.g. (2x - 5)(2x + 5) over (x + 3)' is met by the first factor of the product", () => {
    const point: MarkPoint = { id: "MW2", code: "MW", marks: 1, for: "every numerator and denominator factorised, e.g. (2x - 5)(2x + 5) over (x + 3)" };
    expect(markWorking(["Factorising every line: \\dfrac{(2x-5)(2x+5)}{x+3} \\times \\dfrac{3(x+3)}{(2x-5)(x+3)}."], [point], "").earned.map((e) => e.id)).toEqual(["MW2"]);
  });
});

describe("a multiplication sign inside a fraction's top is inside one factor, not between two", () => {
  const scheme: MarkPoint[] = [
    { id: "M1", code: "M", marks: 1, for: "the product over the count: 3 × 5 over 2" },
    { id: "A1", code: "A", marks: 1, for: "7.5", dependsOn: ["M1"] },
  ];
  test("'3 × 5 over 2' is met by \\frac{3 \\times 5}{2}, and by (3 × 5)/2 as a factor: the sign inside the brackets does not split the fraction", () => {
    expect(markWorking(["\\frac{3 \\times 5}{2}"], scheme, "").earned.map((e) => e.id)).toEqual(["M1"]);
    expect(markWorking(["(3 × 5)/2 × 1/1"], scheme, "").earned.map((e) => e.id)).toEqual(["M1"]);
  });
});

describe("the maths a point transforms is its input, not its working (the corpus guard, 29 Sep 2026)", () => {
  const scheme: MarkPoint[] = [
    { id: "M1", code: "M", marks: 1, for: "(x + 2)² - 25 multiplied out to x² + 4x - 21, or written as (x + 2 - 5)(x + 2 + 5)" },
    { id: "MW1", code: "MW", marks: 1, for: "x² + 4x - 21 = (x + 7)(x - 3)", dependsOn: ["M1"] },
  ];
  test("fm1 multiply-divide .0018 'M1 (x + 2)² − 25 multiplied out to x² + 4x − 21': the numerator typed back, reordered, is not the multiplying out", () => {
    expect(markWorking(["-25 + (x+2)^2"], scheme, "").marks).toBe(0);
    expect(markWorking(["\\frac{-25 +(x+2)^{2}}{2x-6} \\times \\dfrac{6}{x^{2}+10x+21}"], scheme, "").marks).toBe(0);
    expect(markWorking(["x^2 + 4x - 21"], scheme, "").earned.map((e) => e.id)).toEqual(["M1"]);
    expect(markWorking(["(x + 2 - 5)(x + 2 + 5)"], scheme, "").earned.map((e) => e.id)).toEqual(["M1"]);
  });
  test("'numerator x(x − 1) + 2(x + 3) collected to x² + x + 6': the uncollected numerator is the step before, not this one", () => {
    const point: MarkPoint = { id: "MW2", code: "MW", marks: 1, for: "numerator x(x - 1) + 2(x + 3) collected to x² + x + 6" };
    expect(markWorking(["x(x-1) + 2(x+3)"], [point], "").marks).toBe(0);
    expect(markWorking(["x^2 + x + 6"], [point], "").earned.map((e) => e.id)).toEqual(["MW2"]);
  });
  test("an equation before 'leading to' is the working, and stays: 'πr² = 18π leading to r² = 18'", () => {
    const point: MarkPoint = { id: "M1", code: "M", marks: 1, for: "πr² = 18π leading to r² = 18" };
    expect(markWorking(["πr^2 = 18π"], [point], "").earned.map((e) => e.id)).toEqual(["M1"]);
  });
});

describe("the rules the mutation check found unpinned (29 Sep 2026, 20:20)", () => {
  // C24: the worked solution's last line, with a lead-in and no "=", is the result once its lead-in is off; the final
  // point's wording here names no maths, so that line is the only source of the result.
  test("fm1 integration .0005: the answer as the worked solution spells it, '-\\frac{3}{x^{3}} + c', typed alone is the result restated", () => {
    const scheme: MarkPoint[] = [
      { id: "M1", code: "M", marks: 1, for: "the power raised by one and divided: 9x^{-3}/(-3)" },
      { id: "W1", code: "W", marks: 1, for: "answer -3/x³ + c", dependsOn: ["M1"] },
    ];
    // The point spells the answer with a slash and the solution with \frac: only the solution's last line, its
    // lead-in off, is the result in her spelling.
    const ws = "Raising the power by one and dividing gives $\\frac{9x^{-3}}{-3}$.\nSo the integral is $-\\frac{3}{x^{3}} + c$.";
    expect(markWorking(["-\\frac{3}{x^{3}} + c"], scheme, ws).marks).toBe(0);
    expect(markWorking(["\\frac{9x^{-3}}{-3}", "-\\frac{3}{x^{3}} + c"], scheme, ws).earned.map((e) => e.id)).toEqual(["M1", "W1"]);
  });
  // M5a: a restated result meets the final point when it holds each piece of maths the point names before the result.
  test("the answer after the denominator line meets 'numerator collected: 5x + 2; answer (5x + 2) over (x(x + 1))': it holds the 5x + 2 the point names", () => {
    const addSubtract: MarkPoint[] = [
      { id: "MW1", code: "MW", marks: 1, for: "lowest common denominator x(x + 1)" },
      { id: "M1", code: "M", marks: 1, for: "each numerator multiplied up: 2x + 2 and 3x", dependsOn: ["MW1"] },
      { id: "MW2", code: "MW", marks: 1, for: "numerator collected: 5x + 2; answer (5x + 2) over (x(x + 1))", dependsOn: ["M1"] },
    ];
    const ws = "The lowest common denominator is $x(x+1)$.\nNothing cancels, so the answer is $\\frac{5x+2}{x(x+1)}$.";
    expect(markWorking(["LCD = x(x+1)", "\\frac{5x+2}{x(x+1)}"], addSubtract, ws).earned.map((e) => e.id).sort()).toEqual(["MW1", "MW2"]);
    // A point naming maths the answer does not hold is not met by the answer.
    const other: MarkPoint[] = [addSubtract[0]!, addSubtract[1]!, { ...addSubtract[2]!, for: "numerator collected: 5x + 3; answer (5x + 2) over (x(x + 1))" }];
    expect(markWorking(["LCD = x(x+1)", "\\frac{5x+2}{x(x+1)}"], other, ws).earned.map((e) => e.id)).toEqual(["MW1"]);
  });
});

describe("a point's wording read for its pieces (the corpus guard, 29 Sep 2026, v11)", () => {
  test("m3 difference-of-two-squares .0007(a) 'MA1 x²/4 written as (x/2)², or 9 as 3²': (x/2)² in her chain is the point, x²/4 alone is not", () => {
    const scheme: MarkPoint[] = [
      { id: "MA1", code: "MA", marks: 1, for: "x²/4 written as (x/2)², or 9 as 3²" },
      { id: "A1", code: "A", marks: 1, for: "(x/2 + 3)(x/2 − 3), or equivalent such as ¼(x + 6)(x − 6)", dependsOn: ["MA1"] },
    ];
    expect(markWorking(["\\dfrac{x^2}{4} = \\left(\\dfrac{x}{2}\\right)^2"], scheme, "").earned.map((e) => e.id)).toEqual(["MA1"]);
    expect(markWorking(["\\dfrac{x^2}{4}"], scheme, "").marks).toBe(0);
    const whole = "\\dfrac{x^2}{4} = \\left(\\dfrac{x}{2}\\right)^2 and 9 = 3^2, so \\dfrac{x^2}{4} - 9 = \\left(\\dfrac{x}{2} + 3\\right)\\left(\\dfrac{x}{2} - 3\\right).";
    expect(markWorking([whole], scheme, "").marks).toBe(2);
  });
  test("m3 factorising-quadratics .0010(a) 'MA1 (x + 4)(x + 9) written down and three of the four products correct': written down is the point, not a transformation", () => {
    const scheme: MarkPoint[] = [
      { id: "MA1", code: "MA", marks: 1, for: "(x + 4)(x + 9) written down and three of the four products correct" },
      { id: "A1", code: "A", marks: 1, for: "x² + 9x + 4x + 36 collected to reach the printed result", dependsOn: ["MA1"] },
    ];
    const ws = "Area = $(x+4)(x+9) = x^2 + 9x + 4x + 36 = x^2 + 13x + 36$ square metres, as required.";
    expect(markWorking(["Area = (x+4)(x+9)"], scheme, ws).earned.map((e) => e.id)).toEqual(["MA1"]);
    expect(markWorking(["Area = (x+4)(x+9) = x^2 + 9x + 4x + 36 = x^2 + 13x + 36 square metres, as required."], scheme, ws).marks).toBe(2);
  });
});

describe("a piece of a point's wording that opens with a joining sign is not working on its own (guard v12, 29 Sep 2026)", () => {
  // m4 circle-theorems .0013(a): "or + 90 = 180" is the author's shorthand for "(4y − 12) + (y + 7) + 90 = 180".
  const scheme: MarkPoint[] = [
    { id: "MA1", code: "MA", marks: 1, for: "angle ACB = 90 used (the angle in a semicircle is 90°)" },
    { id: "MA2", code: "MA", marks: 1, for: "(4y − 12) + (y + 7) = 90, or + 90 = 180, leading to 5y − 5 = 90" },
    { id: "A1", code: "A", marks: 1, for: "y = 19", dependsOn: ["MA2"] },
  ];
  const ws = "AB is a diameter, so angle ACB = 90° (the angle in a semicircle is 90°). The angles of triangle ABC add up to 180°, so $(4y - 12) + (y + 7) + 90 = 180$, giving $5y - 5 = 90$, $5y = 95$ and $y = 19$.";
  test("another part's '115 + 65 = 180' earns nothing; the equation itself and 5y − 5 = 90 earn MA2", () => {
    expect(markWorking(["Angle ADC = 2(35) - 5 = 65°. Check: angle ABC = 3(35) + 10 = 115° and 115 + 65 = 180."], scheme, ws).marks).toBe(0);
    expect(markWorking(["5y - 5 = 90"], scheme, ws).earned.map((e) => e.id)).toEqual(["MA2"]);
    expect(markWorking(["(4y - 12) + (y + 7) = 90"], scheme, ws).earned.map((e) => e.id)).toEqual(["MA2"]);
  });
});

describe("an expression opening with a joining sign is the piece the point names (guard v13, 29 Sep 2026)", () => {
  // m3 simplifying-multiplying-and-dividing-algebraic-fractions .0010: "inverted: × (x − 1)/(x + 4)".
  const scheme: MarkPoint[] = [
    { id: "M1", code: "M", marks: 1, for: "inverted: × (x − 1)/(x + 4)" },
    { id: "A1", code: "A", marks: 1, for: "x² + 6x + 8 = (x + 2)(x + 4)" },
    { id: "A2", code: "A", marks: 1, for: "x² − 1 = (x + 1)(x − 1)" },
    { id: "MA1", code: "MA", marks: 1, for: "(x + 4) and (x − 1) cancelled to give (x + 2)/(x + 1)" },
  ];
  test("the model's line, the second fraction inverted and the answer reached, earns M1 and MA1", () => {
    const line = "\\dfrac{(x + 2)(x + 4)}{(x + 1)(x - 1)} \\times \\dfrac{x - 1}{x + 4} = \\dfrac{x + 2}{x + 1}.";
    expect(markWorking([line], scheme, "").earned.map((e) => e.id).sort()).toEqual(["M1", "MA1"]);
  });
});

// Mutation survivors pinned (7 Oct 2026): two rules of the ladder whose tests had not reached them.
describe("the ladder: a chain's links, and the answer point as written", () => {
  test("C4 a one-line chain pays one point per link", () => {
    const scheme: MarkPoint[] = [
      { id: "M1", code: "M", marks: 1, for: "(2x + 7)^2 = 4x^2 + 14x + 14x + 49" },
      { id: "MW1", code: "MW", marks: 1, for: "4x^2 + 14x + 14x + 49 = 4x^2 + 28x + 49" },
    ];
    expect(markWorking(["(2x + 7)^2 = 4x^2 + 14x + 14x + 49 = 4x^2 + 28x + 49"], scheme, "").earned.map((e) => e.id)).toEqual(["M1", "MW1"]);
  });
  test("C6 the answer point is met as written, never by an equal form: 3(x+2) is not the expansion 3x + 6", () => {
    const scheme: MarkPoint[] = [
      { id: "M1", code: "M", marks: 1, for: "3 × x + 3 × 2" },
      { id: "A1", code: "A", marks: 1, for: "3x + 6", dependsOn: ["M1"] },
    ];
    expect(markWorking(["3 × x + 3 × 2", "3(x+2)"], scheme, "").earned.map((e) => e.id)).toEqual(["M1"]);
    expect(markWorking(["3 × x + 3 × 2", "3x + 6"], scheme, "").earned.map((e) => e.id)).toEqual(["M1", "A1"]);
  });
});

// Mutation survivor pinned (8 Oct 2026): the answer point is met as written, never by an equal form of the same number
// of terms (the corpus guard's case of 29 Sep: "2(4x² − 1)" paid the answer point "2(2x + 1)(2x − 1)" by equivalence).
describe("C6 the answer point is met as written, never by an equal form of the same shape", () => {
  const scheme: MarkPoint[] = [
    { id: "M1", code: "M", marks: 1, for: "8x^2 - 2 = 2(4x^2 - 1)" },
    { id: "A1", code: "A", marks: 1, for: "2(2x + 1)(2x - 1)", dependsOn: ["M1"] },
  ];
  test("2(4x^2 - 1) after the common factor line does not meet the answer point; the factorised answer does", () => {
    expect(markWorking(["8x^2 - 2 = 2(4x^2 - 1)", "2(4x^2 - 1)"], scheme, "").earned.map((e) => e.id)).toEqual(["M1"]);
    expect(markWorking(["8x^2 - 2 = 2(4x^2 - 1)", "2(2x + 1)(2x - 1)"], scheme, "").earned.map((e) => e.id)).toEqual(["M1", "A1"]);
  });
});
