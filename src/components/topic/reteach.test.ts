import { describe, expect, it } from "vitest";
import type { CommonError, MarkPoint } from "@/lib/content/schema";
import { anotherWayFor, isRecognised, reteachFor, solutionLineFor, solutionLines, supportHintFor, supportOffer, unreachedStep, type ReteachPart } from "./reteach";
import { markAnswer } from "@/components/items/mark";

const point = (code: string, marks: number, forText: string): MarkPoint => ({ id: `${code}${marks}`, code, marks, for: forText });

/** A two-mark all-or-nothing numeric part, in the shape the frustums bundle authors one. */
const frustum: ReteachPart = {
  scheme: [point("MA", 1, "(1/3)π(6)²(15) seen"), point("A", 1, "565 cm³ (accept 180π)")],
  hints: ["The cone formula is on the Higher formula sheet.", "Square the radius before multiplying by the height."],
  workedSolution: "$V = \\tfrac{1}{3}\\pi (6)^2 (15) = 565.5$ cm³, which is $565$ cm³ to 3 significant figures (exactly $180\\pi$).",
  commonErrors: [],
};

/** A two-mark written part whose scheme is one mark a point, so a half answer earns one of them. */
const respiration: ReteachPart = {
  scheme: [point("P", 1, "energy"), point("P", 1, "lactic acid")],
  hints: ["Every respiration equation has energy among the products."],
  workedSolution: "glucose → energy + lactic acid.",
  commonErrors: [],
};

/** Multi-line working, the shape the equation-solving bundles author. */
const solving: ReteachPart = {
  scheme: [point("M", 1, "multiply every term by 6"), point("A", 1, "5x + 10 = 30"), point("A", 1, "x = 4")],
  hints: [],
  workedSolution: [
    "Multiply every term by 6: $3(x + 4) + 2(x - 1) = 30$.",
    "Expand: $3x + 12 + 2x - 2 = 30$.",
    "Collect: $5x + 10 = 30$, so $5x = 20$ and $x = 4$.",
  ].join("\n"),
  commonErrors: [],
};

describe("unreachedStep", () => {
  it("names the method mark on an all-or-nothing part, where the award is nothing at all", () => {
    expect(unreachedStep(frustum.scheme, { correct: false, marksAwarded: 0 })?.id).toBe("MA1");
  });

  it("names the mark after the ones she did earn when the part was marked in pieces", () => {
    expect(unreachedStep(respiration.scheme, { correct: false, marksAwarded: 1 })?.for).toBe("lactic acid");
  });

  it("walks the running total rather than the mark count, so a two-mark point is one step", () => {
    const scheme = [point("M", 2, "both substitutions seen"), point("A", 1, "7.9 cm")];
    expect(unreachedStep(scheme, { correct: false, marksAwarded: 0 })?.for).toBe("both substitutions seen");
    expect(unreachedStep(scheme, { correct: false, marksAwarded: 2 })?.for).toBe("7.9 cm");
  });

  it("has nothing to name when the part carries no scheme", () => {
    expect(unreachedStep([], { correct: false, marksAwarded: 0 })).toBeNull();
  });

  it("has nothing to name when the award already covers the whole scheme", () => {
    expect(unreachedStep(respiration.scheme, { correct: false, marksAwarded: 2 })).toBeNull();
  });
});

describe("solutionLines", () => {
  it("keeps the lines in the mini-markdown they were written in, so a caller can render the maths", () => {
    const lines = solutionLines(solving.workedSolution);
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe("Expand: $3x + 12 + 2x - 2 = 30$.");
  });

  it("is empty for an empty solution", () => {
    expect(solutionLines("")).toEqual([]);
  });
});

describe("solutionLineFor", () => {
  it("finds the line of working that states the mark point", () => {
    const found = solutionLineFor(point("MA", 1, "45 − 26 = 19"), "The box runs from $26$ to $45$, so the interquartile range is $45 - 26 = 19$ minutes.");
    expect(found).toContain("interquartile range");
  });

  it("never picks a line for sharing the mark point's value", () => {
    // Both "Multiply every term by 6: … = 30" and "Expand: … = 30" end on 30; neither is the A mark. Until 23 Sep this
    // returned no line at all; the line that holds the point's maths ("Collect: 5x + 10 = 30, …") is the one.
    expect(solutionLineFor(point("A", 1, "$5x + 10 = 30$"), solving.workedSolution)).toContain("Collect");
    expect(solutionLineFor(point("A", 1, "5x + 10 = 30"), solving.workedSolution)).toBeNull();
  });

  it("finds the line that holds the point's maths, and never one that only shares a last number", () => {
    const tangent = "$-12 = -\\frac{1}{2}(5) + c$ gives $c = -\\frac{19}{2}$, so $y = -\\frac{1}{2}x - \\frac{19}{2}$.";
    expect(solutionLineFor(point("W", 2, "$y = -\\frac{1}{2}x - \\frac{19}{2}$"), `The gradient of the normal is $-\\frac{1}{2}$.\n${tangent}`)).toBe(tangent);
    const inequality = "Factorise: $(x + 3)(x - 5) > 0$, so the critical values are $x = -3$ and $x = 5$.";
    expect(solutionLineFor(point("MW", 1, "factorising: $(x + 3)(x - 5) > 0$, giving critical values $x = -3$ and $x = 5$"), `Rearrange: $x^{2} - 2x - 15 > 0$.\n${inequality}`)).toBe(inequality);
    // "y = 8" ends on the 8 that closes "dy/dx = −4x + 8"; it is not that line.
    expect(solutionLineFor(point("MW", 1, "$\\frac{dy}{dx} = -4x + 8$"), "Differentiate first.\nSubstitute into the curve: $y = 8$.")).toBeNull();
    // A list of roots reads the same with a comma or an "and".
    expect(solutionLineFor(point("W", 1, "$x=-2, x=4$"), "Divide by 3: $x^{2} - 2x - 8 = 0$.\nIt factorises to $(x - 4)(x + 2) = 0$, so $x = -2$ and $x = 4$.")).toContain("factorises");
    // The maths must stand whole in the line: "x = 30" is not "x = 3", nor is "2x = 3" or "x = 3.5".
    expect(solutionLineFor(point("W", 1, "$x = 3$ only"), "So $x = 30$.\nThen $2x = 3$ and $x = 3.5$.")).toBeNull();
  });

  it("drops a line that is the mark point word for word, which would only repeat the step", () => {
    expect(solutionLineFor(point("MW", 1, "$\\frac{dy}{dx} = 2x + 3$"), "$\\frac{dy}{dx} = 2x + 3$.")).toBeNull();
  });

  it("returns null when the mark point is an instruction with no value to match", () => {
    expect(solutionLineFor(point("MA", 1, "34, read from the line inside the box"), "The line inside the box is at $34$, so the median waiting time is $34$ minutes.")).toBeNull();
  });

  it("returns null when nothing in the solution states the mark point", () => {
    expect(solutionLineFor(point("MA", 1, "(1/3)π(6)²(15) seen"), "The answer is $565$ cm³.")).toBeNull();
  });
});

describe("anotherWayFor", () => {
  it("re-presents the idea as the part's first hint when it has one", () => {
    expect(anotherWayFor(frustum)).toBe("The cone formula is on the Higher formula sheet.");
  });

  it("falls back to a sentence of the worked solution, never the line already shown", () => {
    const shown = solutionLines(solving.workedSolution)[0]!;
    expect(anotherWayFor(solving, shown)).toContain("Expand");
  });

  it("has nothing to say when the only line is the one already shown", () => {
    const part: ReteachPart = { scheme: [], hints: [], workedSolution: "One line only." };
    expect(anotherWayFor(part, "One line only.")).toBeNull();
  });
});

describe("isRecognised", () => {
  const error = { misconception: "maths.m4.cone-third-omitted", feedback: "The one third has been left out.", marksTypicallyEarned: 0 } as CommonError;

  it("is true when the result carries the tag of one of the part's own common errors", () => {
    expect(isRecognised([error], ["maths.m4.cone-third-omitted"])).toBe(true);
  });

  it("is false for a tag the part did not author", () => {
    expect(isRecognised([error], ["self-awarded"])).toBe(false);
  });

  it("is false when there are no common errors or no tags", () => {
    expect(isRecognised([], ["maths.m4.cone-third-omitted"])).toBe(false);
    expect(isRecognised([error], undefined)).toBe(false);
  });
});

describe("reteachFor", () => {
  it("gives the method mark and a hint on an unrecognised all-or-nothing miss", () => {
    const r = reteachFor(frustum, { correct: false, marksAwarded: 0, tags: [] });
    expect(r?.step?.label).toBe("MA1");
    expect(r?.step?.text).toBe("(1/3)π(6)²(15) seen");
    expect(r?.anotherWay).toBe("The cone formula is on the Higher formula sheet.");
  });

  it("gives the next mark point on a partial award", () => {
    const r = reteachFor(respiration, { correct: false, marksAwarded: 1, tags: [] });
    expect(r?.step?.label).toBe("P1");
    expect(r?.step?.text).toBe("lactic acid");
  });

  it("still re-presents the idea when the part carries no scheme", () => {
    const part: ReteachPart = { scheme: [], hints: ["Two products, and one of them is a gas."], workedSolution: "Carbon dioxide." };
    const r = reteachFor(part, { correct: false, marksAwarded: 0, tags: [] });
    expect(r?.step).toBeNull();
    expect(r?.anotherWay).toBe("Two products, and one of them is a gas.");
  });

  it("says nothing when the part has neither a scheme nor anything to re-present", () => {
    expect(reteachFor({ scheme: [], hints: [], workedSolution: "" }, { correct: false, marksAwarded: 0 })).toBeNull();
  });

  it("stands aside for an answer the author already diagnosed", () => {
    const part: ReteachPart = {
      ...frustum,
      commonErrors: [{ misconception: "maths.m4.cone-third-omitted", feedback: "The one third has been left out." } as CommonError],
    };
    expect(reteachFor(part, { correct: false, marksAwarded: 0, tags: ["maths.m4.cone-third-omitted"] })).toBeNull();
  });

  it("says nothing at all about a correct answer", () => {
    expect(reteachFor(frustum, { correct: true, marksAwarded: 2, tags: [] })).toBeNull();
  });
});

describe("a part marked target by target names the target she missed (engine item 7)", () => {
  /** p2-conductors-circuits-symbols .0005: one mark a target, in the targets' order; (iv) "resistor" is also inside (i)'s name. */
  const circuit: ReteachPart = {
    scheme: [
      { id: "P1", code: "P", marks: 1, for: "(i) variable resistor" },
      { id: "P2", code: "P", marks: 1, for: "(ii) fuse" },
      { id: "P3", code: "P", marks: 1, for: "(iii) diode" },
      { id: "P4", code: "P", marks: 1, for: "(iv) resistor" },
    ],
    hints: ["Three of them are rectangles. Look for an arrow across one and a line through another."],
    workedSolution: "(i) variable resistor: a rectangle with a slanted arrow across it. (ii) fuse: a rectangle with a line running through it. (iii) diode: a triangle pointing at a bar. (iv) resistor: a plain rectangle.",
    commonErrors: [],
    answer: {
      kind: "label",
      targets: [
        { id: "i", accepted: ["variable resistor"] },
        { id: "ii", accepted: ["fuse"] },
        { id: "iii", accepted: ["diode"] },
        { id: "iv", accepted: ["resistor"] },
      ],
      bank: ["resistor", "variable resistor", "fuse", "diode", "lamp", "switch", "cell", "battery"],
    },
  };

  it("wrong on (i), right on (ii) to (iv): the point named is (i)'s, not (iv)'s, which she earned", () => {
    const result = markAnswer(JSON.stringify({ labels: { i: "resistor", ii: "fuse", iii: "diode", iv: "resistor" } }), circuit.answer!, { marks: 4 });
    expect(result).toMatchObject({ correct: false, marksAwarded: 3, unmet: ["i"] });
    expect(reteachFor(circuit, result)?.step).toMatchObject({ label: "P1", text: "(i) variable resistor" });
  });

  it("wrong on (iii) only names (iii)'s point", () => {
    const result = markAnswer(JSON.stringify({ labels: { i: "variable resistor", ii: "fuse", iii: "lamp", iv: "resistor" } }), circuit.answer!, { marks: 4 });
    expect(reteachFor(circuit, result)?.step?.text).toBe("(iii) diode");
  });

  it("a scheme that groups targets names the point that holds the first target she missed", () => {
    // conditional-probability .0014 (a): "(i) 0.6" and "(ii) 0.75 and (iii) 0.9".
    const tree: ReteachPart = {
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: "(i) 0.6" },
        { id: "MW2", code: "MW", marks: 1, for: "(ii) 0.75 and (iii) 0.9" },
      ],
      hints: [],
      workedSolution: "",
      commonErrors: [],
      answer: {
        kind: "label",
        targets: [
          { id: "i", accepted: ["0.6"] },
          { id: "ii", accepted: ["0.75"] },
          { id: "iii", accepted: ["0.9"] },
        ],
        bank: ["0.25", "0.4", "0.6", "0.75", "0.9"],
      },
    };
    expect(reteachFor(tree, { correct: false, marksAwarded: 1, unmet: ["i"] })?.step?.text).toBe("(i) 0.6");
    expect(reteachFor(tree, { correct: false, marksAwarded: 1, unmet: ["iii"] })?.step?.text).toBe("(ii) 0.75 and (iii) 0.9");
  });
});

describe("two misses: the ways on, one of them accented (engine item 10.2, 24 Sep 2026)", () => {
  // After a second miss a third guess teaches nothing (programme 0.1): she is offered a hint or the worked solution,
  // the field stays closed, and the next attempt is a twin. The card carries exactly one accent-filled control, so the
  // offer is a primary rung and at most one secondary; "Next part" is never the accented way out while one is open.
  it("before she has chosen: the hint, with the worked solution beside it", () => {
    expect(supportOffer({ hint: true, hintShown: false, workedOpen: false, twin: true })).toEqual({ primary: "hint", secondary: "worked" });
    expect(supportOffer({ hint: true, hintShown: false, workedOpen: false, twin: false })).toEqual({ primary: "hint", secondary: "worked" });
  });
  it("with no hint to give, the worked solution leads and the twin sits beside it", () => {
    expect(supportOffer({ hint: false, hintShown: false, workedOpen: false, twin: true })).toEqual({ primary: "worked", secondary: "twin" });
    expect(supportOffer({ hint: false, hintShown: false, workedOpen: false, twin: false })).toEqual({ primary: "worked", secondary: null });
  });
  it("after the hint, the twin is the next attempt and the worked solution is still there", () => {
    expect(supportOffer({ hint: true, hintShown: true, workedOpen: false, twin: true })).toEqual({ primary: "twin", secondary: "worked" });
    expect(supportOffer({ hint: true, hintShown: true, workedOpen: false, twin: false })).toEqual({ primary: "worked", secondary: null });
  });
  it("after the worked solution, only the twin is left to offer", () => {
    expect(supportOffer({ hint: true, hintShown: false, workedOpen: true, twin: true })).toEqual({ primary: "twin", secondary: null });
    expect(supportOffer({ hint: true, hintShown: true, workedOpen: true, twin: false })).toEqual({ primary: null, secondary: null });
  });
});

describe("the hint offered after two misses is one she has not already been shown", () => {
  it("is the first hint that is not the one 'Another way to see it' already shows", () => {
    const reteach = reteachFor(frustum, { correct: false, marksAwarded: 0 });
    expect(reteach?.anotherWay).toBe("The cone formula is on the Higher formula sheet.");
    expect(supportHintFor(frustum, reteach)).toBe("Square the radius before multiplying by the height.");
  });
  it("without a second hint, a line of the worked solution the screen is not already showing", () => {
    const one: ReteachPart = { ...solving, hints: ["Clear the fractions first."] };
    const reteach = reteachFor(one, { correct: false, marksAwarded: 0 });
    const hint = supportHintFor(one, reteach);
    expect(hint).not.toBeNull();
    expect(hint).not.toBe(reteach?.anotherWay);
    expect(hint).not.toBe(reteach?.step?.line);
    expect(solutionLines(one.workedSolution)).toContain(hint);
  });
  it("a recognised error (no panel on screen) is offered the first hint", () => {
    expect(supportHintFor(frustum, null)).toBe("The cone formula is on the Higher formula sheet.");
  });
  it("nothing when there is nothing new to say", () => {
    expect(supportHintFor({ hints: ["Only this."], workedSolution: "" },{ step: null, anotherWay: "Only this." })).toBeNull();
  });
});
