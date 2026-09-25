import { describe, expect, test } from "vitest";
import { finalValue, firstSentence, fixMatches, lastNumber, markFix, sameAsMistakeLine, stepLineMatches, workingLines } from "./mistake-marking";

const correction = ["Values still needed: 30 − 22 = 8 of the 26 in the class.", "Median ≈ 30 + (8 ÷ 26) × 20 = 36.2 cm"];

describe("firstSentence", () => {
  test("cuts at the first full stop", () => {
    expect(firstSentence("She took the midpoint of the median class instead of interpolating. Eight of the 26 values are still needed.")).toBe(
      "She took the midpoint of the median class instead of interpolating.",
    );
    expect(firstSentence("No full stop here")).toBe("No full stop here");
  });
});

describe("lastNumber", () => {
  test("finds the final number, including decimals and negatives", () => {
    expect(lastNumber(correction[1])).toBe(36.2);
    expect(lastNumber("x = −4")).toBe(-4);
    expect(lastNumber("no digits")).toBeNull();
  });
});

describe("fixMatches", () => {
  test("a whole-line match, with or without the label and unit", () => {
    expect(fixMatches("Median = 30 + (8 ÷ 26) × 20 = 36.2 cm", correction)).toEqual({ match: true, how: "line" });
    expect(fixMatches("Median = 30 + (8 / 26) × 20 = 36.2", correction)).toEqual({ match: true, how: "line" });
    // Different bracketing is not the same line, but the value carries it.
    expect(fixMatches("30 + 8/26 × 20 = 36.2", correction).match).toBe(true);
  });
  test("the right final value in different working still counts", () => {
    expect(fixMatches("30 + 20 × 8/26 = 36.15", correction)).toEqual({ match: true, how: "value" });
  });
  test("the midpoint again does not", () => {
    expect(fixMatches("Median = (30 + 50) ÷ 2 = 40", correction)).toEqual({ match: false, how: "none" });
    expect(fixMatches("", correction)).toEqual({ match: false, how: "none" });
  });
});

describe("finalValue", () => {
  test("reads the last correction line", () => {
    expect(finalValue(correction)).toBe(36.2);
    expect(finalValue([])).toBeNull();
  });
});

describe("workingLines", () => {
  test("reads authored maths as she would type it, one line per line of working", () => {
    expect(workingLines("small cone $= \\tfrac{1}{3}\\pi (5)^2 (10) = 261.8$ cm³")).toEqual(["small cone = 1/3\\pi (5)^2 (10) = 261.8 cm³"]);
    expect(workingLines("$x + 2 = \\pm\\sqrt{7}$")).toEqual(["x + 2 = ±√{7}"]);
    expect(workingLines("**Rotation**, $180^\\circ$, about the origin $(0, 0)$.")).toEqual(["Rotation  180°  about the origin (0  0)"]);
    expect(workingLines("mean = (148 + 152) ÷ 2\n= 150 s")).toEqual(["mean = (148 + 152) ÷ 2", "= 150 s"]);
  });
});

describe("stepLineMatches", () => {
  const working = "x = 3 × 4 = 12";
  test("the value alone carries a line that states a result", () => {
    expect(stepLineMatches("x=12", working)).toEqual({ match: true, how: "value" });
  });
  test("a typed x for times is the same line", () => {
    expect(stepLineMatches("3 x 4 = 12", working)).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("x = 3 × 4 = 12", working)).toEqual({ match: true, how: "line" });
  });
  test("a different line is not", () => {
    expect(stepLineMatches("x = 3 + 4 = 7", working)).toEqual({ match: false, how: "none" });
    expect(stepLineMatches("", working)).toEqual({ match: false, how: "none" });
  });
  test("authored TeX compares with what the key strip produces", () => {
    expect(stepLineMatches("x + 2 = ±√7", "$x + 2 = \\pm\\sqrt{7}$")).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("T ∝ 1/n, so T = k/n", "$T \\propto \\dfrac{1}{n}$, so $T = \\dfrac{k}{n}$")).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("small cone = 1/3 π 5² × 10 = 261.8", "small cone $= \\tfrac{1}{3}\\pi (5)^2 (10) = 261.8$ cm³").match).toBe(true);
    expect(stepLineMatches("261.8", "small cone $= \\tfrac{1}{3}\\pi (5)^2 (10) = 261.8$ cm³")).toEqual({ match: true, how: "value" });
    expect(stepLineMatches("40", "optimum = 40 °C")).toEqual({ match: true, how: "value" });
  });
  test("a prose line matches only as a line, and a number inside a sentence is not its value", () => {
    const prose = "Above the optimum the enzyme is denatured.";
    expect(stepLineMatches("above the optimum, the enzyme is denatured", prose)).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("the enzyme denatures above the optimum", prose)).toEqual({ match: false, how: "none" });
    expect(stepLineMatches("60", "because 60 s is the shortest time, so the reaction was fastest at that temperature")).toEqual({ match: false, how: "none" });
    expect(stepLineMatches("rotation 90° about (0, 0)", "Rotation, $180^\\circ$, about the origin $(0, 0)$.")).toEqual({ match: false, how: "none" });
  });
  test("any line of a multi-line step counts, and the value is read from the last", () => {
    const two = "mean = (148 + 152) ÷ 2\n= 150 s";
    expect(stepLineMatches("(148+152)/2", two)).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("150", two)).toEqual({ match: true, how: "value" });
    expect(stepLineMatches("2", two)).toEqual({ match: false, how: "none" });
  });
});

describe("a hyphen inside a word is not a minus", () => {
  test("nitrogen fixing bacteria matches nitrogen-fixing bacteria either way round", () => {
    expect(fixMatches("nitrogen fixing bacteria", ["nitrogen-fixing bacteria"])).toEqual({ match: true, how: "line" });
    expect(fixMatches("nitrogen-fixing bacteria", ["nitrogen fixing bacteria"])).toEqual({ match: true, how: "line" });
    expect(fixMatches("x = 5 - 3", ["x = 5 − 3"])).toEqual({ match: true, how: "line" });
  });
});

describe("the value fallback needs a stated value", () => {
  test("a stray number in prose does not pass as the fix", () => {
    const correction = ["Median = 30 + (8 ÷ 26) × 20", "= 36.2"];
    expect(fixMatches("banana 36.2", correction).match).toBe(false);
    expect(fixMatches("= 36.2", correction).match).toBe(true);
    expect(fixMatches("36.2", correction).match).toBe(true);
    expect(fixMatches("36.2 cm", correction).match).toBe(true);
  });
});

describe("a fraction at the end of a line is its value", () => {
  test("lastNumber reads a/b, not the denominator", () => {
    expect(lastNumber("P(same colour) = 27/55")).toBeCloseTo(27 / 55, 12);
    expect(lastNumber("x = 5/2")).toBe(2.5);
    expect(lastNumber("= 3/4 cm")).toBe(0.75);
    expect(lastNumber("F = 20 N, so a = 20/5 = 4 m/s^2")).toBe(4);
  });
  test("the fix box takes the right fraction and refuses its neighbours", () => {
    const correction = ["P(same colour) = 21/55 + 6/55", "= 27/55"];
    expect(fixMatches("27/55", correction).match).toBe(true);
    expect(fixMatches("P(same colour) = 27/55", correction).match).toBe(true);
    expect(fixMatches("54/110", correction).match).toBe(true);
    expect(fixMatches("0.49", correction).match).toBe(true);
    expect(fixMatches("1/55", correction).match).toBe(false);
    expect(fixMatches("21/40", correction).match).toBe(false);
    expect(fixMatches("P(same colour) = 1/55", correction).match).toBe(false);
  });
  test("a probability is matched to 0.005, not 0.05", () => {
    const correction = ["P(packed or bus) = 22/40 + 15/40 - 8/40 = 0.725"];
    expect(fixMatches("0.725", correction).match).toBe(true);
    expect(fixMatches("0.73", correction).match).toBe(true);
    expect(fixMatches("0.7", correction).match).toBe(false);
    expect(fixMatches("0.75", correction).match).toBe(false);
  });
  test("a bracketed label comes off like a plain one", () => {
    expect(fixMatches("21/40", ["P(bus given under 25) = 21/40"])).toEqual({ match: true, how: "line" });
    expect(fixMatches("x = 2.5", ["x = 5/2"]).match).toBe(true);
  });
  test("an authored TeX correction is read as she would type it", () => {
    const correction = ["P(A or B) = $\\dfrac{22}{40} + \\dfrac{15}{40} - \\dfrac{8}{40}$", "= $\\dfrac{29}{40}$"];
    expect(fixMatches("29/40", correction).match).toBe(true);
    expect(fixMatches("22/40 + 15/40 - 8/40", correction).match).toBe(true);
    expect(fixMatches("0.725", correction).match).toBe(true);
    expect(fixMatches("1/40", correction).match).toBe(false);
    expect(finalValue(correction)).toBeCloseTo(0.725, 12);
  });
});

describe("a unit exponent is not the line's value", () => {
  test("lastNumber ignores ASCII exponents on units", () => {
    expect(lastNumber("a = 4 m/s^2")).toBe(4);
    expect(lastNumber("a = 4 ms^-2")).toBe(4);
    expect(lastNumber("a = 4 m s^{-2}")).toBe(4);
    expect(lastNumber("F = 20 N, so a = 20/5 = 4 m/s^2")).toBe(4);
    expect(lastNumber("Weight = 7 × 10 = 70 N")).toBe(70);
  });
  test("the fix box accepts the right value in an ASCII unit", () => {
    expect(fixMatches("a = 4 m/s^2", ["a = 20 ÷ 5 = 4 m/s²"]).match).toBe(true);
    expect(fixMatches("a = 4 N", ["F = 20 N, so a = 20 ÷ 5 = 4 m/s²"]).match).toBe(true);
    expect(fixMatches("a = 2 m/s^2", ["a = 20 ÷ 5 = 4 m/s²"]).match).toBe(false);
  });
});

// Item 1 of the engine brief (23 Sep 2026): the fix box accepted the flagged wrong line itself, a line she
// already had, and any line whose last digit agreed with the correction's (an exponent, a bracket's constant).
// The fixtures are published find-the-mistake items, verbatim (docs/dev/qa/pre-read/fm1-g-logs-reverify.md "A").
describe("the flagged wrong line is not its own fix", () => {
  const conditional02 = {
    studentWorking: ["P(wet and late) = 0.4 x 0.25 = 0.10", "P(dry and late) = 0.6 x 0.1 = 0.06", "P(wet given late) = 0.10"],
    mistakeLine: 3,
    correction: ["P(wet and late) = 0.10", "P(late) = 0.10 + 0.06 = 0.16", "P(wet given late) = 0.10 / 0.16 = 5/8 = 0.625"],
  };
  const logs02 = {
    studentWorking: ["log(x + 5) - log(x - 1) = log 3", "log(x + 5) / log(x - 1) = log 3", "(x + 5) / (x - 1) = 3", "x + 5 = 3x - 3", "8 = 2x, so x = 4"],
    mistakeLine: 2,
    correction: ["log((x + 5) / (x - 1)) = log 3", "(x + 5) / (x - 1) = 3"],
  };
  const fractions01 = {
    studentWorking: [
      "Common denominator (x + 3)(x + 4)",
      "= [x² + 4x - (x - 3)(x + 3)] over (x + 3)(x + 4)",
      "= [x² + 4x - x² - 9] over (x + 3)(x + 4)",
      "= (4x - 9) over (x + 3)(x + 4)",
    ],
    mistakeLine: 3,
    correction: ["(x - 3)(x + 3) = x² - 9", "x² + 4x - (x² - 9) = x² + 4x - x² + 9", "= (4x + 9) over (x + 3)(x + 4)"],
  };
  const optimisation02 = {
    studentWorking: ["dA/dx = -6x + 36", "-6x + 36 = 0 so x = 6", "d2A/dx2 = -6", "-6 is negative so this is a minimum", "The area is least when x = 6"],
    mistakeLine: 4,
    correction: ["-6 is negative so this is a maximum", "The area is greatest when x = 6"],
  };
  const quadratic01 = {
    studentWorking: ["(x + 7)(x − 4) = 0", "x + 7 = 0 or x − 4 = 0", "x = 7 or x = 4"],
    mistakeLine: 3,
    correction: ["(x + 7)(x − 4) = 0", "x + 7 = 0 gives x = −7; x − 4 = 0 gives x = 4", "x = −7 or x = 4"],
  };

  test("sameAsMistakeLine: the line as written, respaced, or without its label", () => {
    expect(sameAsMistakeLine("P(wet given late) = 0.10", "P(wet given late) = 0.10")).toBe(true);
    expect(sameAsMistakeLine("p(wet given late)=0.10", "P(wet given late) = 0.10")).toBe(true);
    expect(sameAsMistakeLine("0.10", "P(wet given late) = 0.10")).toBe(true);
    expect(sameAsMistakeLine("log(x+5)/log(x-1) = log 3", "log(x + 5) / log(x - 1) = log 3")).toBe(true);
    expect(sameAsMistakeLine("P(wet given late) = 5/8", "P(wet given late) = 0.10")).toBe(false);
    expect(sameAsMistakeLine("", "P(wet given late) = 0.10")).toBe(false);
  });
  test("the wrong line is refused however it is spelled, and the fix still passes", () => {
    expect(markFix("P(wet given late) = 0.10", conditional02).match).toBe(false);
    expect(markFix("0.10", conditional02).match).toBe(false);
    expect(markFix("5/8", conditional02)).toEqual({ match: true, how: "value" });
    expect(markFix("P(wet given late) = 0.10 / 0.16 = 5/8 = 0.625", conditional02)).toEqual({ match: true, how: "line" });
  });
  test("a line she already has is not the fix of the line that went wrong", () => {
    expect(markFix("log(x + 5) / log(x - 1) = log 3", logs02).match).toBe(false);
    expect(markFix("(x + 5) / (x - 1) = 3", logs02).match).toBe(false);
    expect(markFix("x + 5 = 3x - 3", logs02).match).toBe(false);
    expect(markFix("log((x + 5) / (x - 1)) = log 3", logs02)).toEqual({ match: true, how: "line" });
    expect(markFix("The area is least when x = 6", optimisation02).match).toBe(false);
    expect(markFix("-6 is negative so this is a maximum", optimisation02)).toEqual({ match: true, how: "line" });
  });
  test("an expression's last number is not its value", () => {
    expect(markFix("= [x² + 4x - x² - 9] over (x + 3)(x + 4)", fractions01).match).toBe(false);
    expect(markFix("= (4x - 9) over (x + 3)(x + 4)", fractions01).match).toBe(false);
    expect(markFix("= (4x + 9) over (x + 3)(x + 4)", fractions01)).toEqual({ match: true, how: "line" });
    expect(fixMatches("dy/dx = 12x^2 - 12/x^3", ["dy/dx = 12x^2 + 12/x^3"]).match).toBe(false);
  });
  test("a value her working already reaches proves nothing, and one root is not the pair", () => {
    expect(markFix("x = 6", optimisation02).match).toBe(false);
    expect(markFix("x = 7 or x = 4", quadratic01).match).toBe(false);
    expect(markFix("x = 4", quadratic01).match).toBe(false);
    expect(markFix("x = −7 or x = 4", quadratic01)).toEqual({ match: true, how: "line" });
    // The roots in either order, joined any way.
    expect(markFix("x = 4 or x = −7", quadratic01)).toEqual({ match: true, how: "line" });
    expect(markFix("x = -7, x = 4", quadratic01)).toEqual({ match: true, how: "line" });
  });
});

// The lead's item 12 and the FM2 C fix pass's regression report (23 Sep 2026, 14:50): published items, verbatim.
describe("the fix box reads every line of the correction, and both sides the same way", () => {
  const conditional03 = {
    studentWorking: ["P(all three blue and at least two blue) = 7/33 x 119/165 = 833/5445", "P(all three given at least two) = 833/5445 / 119/165", "= 7/33"],
    mistakeLine: 1,
    correction: ["P(all three blue and at least two blue) = 7/33", "P(all three given at least two) = 7/33 / 119/165", "= 5/17 = 0.29"],
  };
  const venn01 = {
    studentWorking: ["piano only = 18 - x, guitar only = 15 - x", "(18 - x) + x + (15 - x) = 32", "33 - x = 32, so x = 1"],
    mistakeLine: 2,
    correction: ["piano only = 18 - x, guitar only = 15 - x, neither = 4", "(18 - x) + x + (15 - x) + 4 = 32", "37 - x = 32, so x = 5"],
  };
  const resultant01 = {
    studentWorking: ["the resultant is the sum of the forces", "$\\mathbf{i}$: $6 - 5 = 1$", "$\\mathbf{j}$: $-2 - 9 = -11$", "resultant $= \\mathbf{i} - 11\\mathbf{j}$ N"],
    mistakeLine: 3,
    correction: ["$\\mathbf{j}$: $-2 + 9 = 7$", "resultant $= \\mathbf{i} + 7\\mathbf{j}$ N"],
  };
  const forces01 = {
    studentWorking: ["the weight, $70$ N, down the slope", "the normal reaction $R$, at right angles to the slope", "the force due to friction $F$, up the slope"],
    mistakeLine: 1,
    correction: ["the weight, 70 N, vertically downwards"],
  };

  test("a corrected value is taken whichever correction line states it, and a bare '=' comes off", () => {
    expect(markFix("= 7/33", conditional03)).toEqual({ match: true, how: "value" });
    expect(markFix("0.21", conditional03)).toEqual({ match: true, how: "value" });
    expect(markFix("P(all three and at least two) = 7/33", conditional03).match).toBe(true);
    expect(markFix("833/5445", conditional03).match).toBe(false);
    expect(markFix("= 28/55", conditional03).match).toBe(false);
  });
  test("a correct line re-bracketed, simplified or split at its 'so' is the same line", () => {
    expect(markFix("37 - x = 32", venn01)).toEqual({ match: true, how: "line" });
    expect(markFix("18 - x + x + 15 - x + 4 = 32", venn01)).toEqual({ match: true, how: "line" });
    expect(markFix("33 - x + 4 = 32", venn01)).toEqual({ match: true, how: "line" });
    expect(markFix("x = 5", venn01).match).toBe(true);
    expect(markFix("(18 - x) + x + (15 - x) = 32", venn01).match).toBe(false);
  });
  test("a bold vector name is the letter she types", () => {
    expect(markFix("j: -2 + 9 = 7", resultant01)).toEqual({ match: true, how: "line" });
    expect(markFix("-2 + 9 = 7", resultant01)).toEqual({ match: true, how: "line" });
    expect(markFix("7", resultant01).match).toBe(true);
    expect(markFix("-2 - 9 = -11", resultant01).match).toBe(false);
  });
  test("a prose correction is matched by its value with the same direction words", () => {
    expect(markFix("W = 70 N, vertically downwards", forces01)).toEqual({ match: true, how: "line" });
    expect(markFix("the weight, 70 N, vertically down", forces01)).toEqual({ match: true, how: "line" });
    expect(markFix("70 N", forces01).match).toBe(false);
    expect(markFix("the weight, 70 N, down the slope", forces01).match).toBe(false);
    expect(markFix("35 N down the slope", forces01).match).toBe(false);
  });
});

// The FM1 fix pass (lead's items 16–19, 23 Sep 2026 19:55): published items, verbatim.
describe("matrices, powers and units in the fix box", () => {
  const matrixEquations01 = {
    studentWorking: ["det A = 1", "A inverse = (3 -5 ; -1 2)", "X = B x A inverse", "X = (-1 3 ; 3 -4)"],
    mistakeLine: 3,
    correction: ["X = A inverse x B", "X = (-7 -3 ; 3 2)"],
  };
  const inverse01 = {
    studentWorking: ["det N = (-3)(-1) - (2)(4) = -5", "swap and negate: (-1 -2 ; -4 -3)", "N inverse = 1/5 x (-1 -2 ; -4 -3)", "N inverse = (-1/5 -2/5 ; -4/5 -3/5)"],
    mistakeLine: 3,
    correction: ["N inverse = 1/(-5) x (-1 -2 ; -4 -3)", "N inverse = (1/5 2/5 ; 4/5 3/5)"],
  };
  const logLog01 = {
    studentWorking: ["log F = n log h + log k", "comparing with y = mx + c", "gradient = n, so n = 1.5", "intercept = k, so k = 0.602", "F = 0.602 h^1.5"],
    mistakeLine: 4,
    correction: ["intercept = log k, so k = 10^0.602 = 4.0", "F = 4.0 h^1.5"],
  };
  const area01 = {
    studentWorking: ["Area = $\\int_{0}^{2} \\left(3x^{2} - 12\\right) dx$", "= $\\left[x^{3} - 12x\\right]_{0}^{2}$", "at x = 2: -16", "at x = 0: 0", "-16 - (0) = -16", "Area = -16"],
    mistakeLine: 6,
    correction: ["The region lies below the x-axis, so the integral is negative", "Area = 16"],
  };
  test("an inverse however it is written, and matrices that do not commute (16)", () => {
    for (const t of ["X = A^-1 B", "X = A^{-1}B", "X = A^-1 x B", "X = A⁻¹B", "X = A inverse x B"]) expect(markFix(t, matrixEquations01).match).toBe(true);
    for (const t of ["X = B A^-1", "X = BA^-1", "X = B x A inverse"]) expect(markFix(t, matrixEquations01).match).toBe(false);
  });
  test("a power she has not worked out is still its value (17)", () => {
    expect(markFix("k = 10^0.602", logLog01)).toEqual({ match: true, how: "line" });
    expect(markFix("log k = 0.602, so k = 4", logLog01).match).toBe(true);
    expect(markFix("k = 4", logLog01).match).toBe(true);
    expect(markFix("k = 0.602", logLog01).match).toBe(false);
  });
  test("a matrix in decimals is the same matrix in fractions (18)", () => {
    expect(markFix("N inverse = (0.2 0.4 ; 0.8 0.6)", inverse01)).toEqual({ match: true, how: "line" });
    expect(markFix("N^-1 = (1/5 2/5 ; 4/5 3/5)", inverse01)).toEqual({ match: true, how: "line" });
    expect(markFix("N^-1 = -1/5 (-1 -2 ; -4 -3)", inverse01).match).toBe(true);
    expect(markFix("N inverse = (-0.2 -0.4 ; -0.8 -0.6)", inverse01).match).toBe(false);
  });
  test("units² and square units are units (19)", () => {
    for (const t of ["Area = 16 units²", "Area = 16 square units", "16 units", "Area = 16"]) expect(markFix(t, area01).match).toBe(true);
    expect(markFix("Area = -16", area01).match).toBe(false);
  });
  test("her unfinished division is its value; the flagged line is still refused", () => {
    const conditional02 = {
      studentWorking: ["P(wet and late) = 0.4 x 0.25 = 0.10", "P(dry and late) = 0.6 x 0.1 = 0.06", "P(wet given late) = 0.10"],
      mistakeLine: 3,
      correction: ["P(wet and late) = 0.10", "P(late) = 0.10 + 0.06 = 0.16", "P(wet given late) = 0.10 / 0.16 = 5/8 = 0.625"],
    };
    expect(markFix("P(wet given late) = 0.10 / 0.16", conditional02).match).toBe(true);
    expect(markFix("0.10/0.16", conditional02).match).toBe(true);
    expect(markFix("P(wet and late) = 0.10", conditional02).match).toBe(false);
  });
});

describe("a worked-example step: its result, its pieces, and nothing it only restates", () => {
  test("the result an identity chain arrives at is the step's line (audit must-fix 6)", () => {
    const step3 = "$\\frac{2x(x+5)}{4(x+5)(x-5)} = \\frac{x}{2(x-5)}$";
    expect(stepLineMatches("x/(2(x-5))", step3, { pieces: true })).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("x/(2(x+5))", step3, { pieces: true }).match).toBe(false);
    expect(stepLineMatches("2x.", "$(x + 4)$ cancels, and $\\dfrac{6x^2}{3x} = 2x$.", { pieces: true })).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("2y", "$(x + 4)$ cancels, and $\\dfrac{6x^2}{3x} = 2x$.", { pieces: true }).match).toBe(false);
    // An equation's right-hand side alone is not the step: "5a" is not "50 − T = 5a".
    expect(stepLineMatches("5a", "For the hanging block, down positive: $50 - T = 5a$", { pieces: true }).match).toBe(false);
  });
  test("a ratio is read as a ratio", () => {
    const areas = "Ratio of areas $= 45 : 125 = 9 : 25$";
    expect(stepLineMatches("9 : 25", areas, { pieces: true })).toEqual({ match: true, how: "line" });
    expect(stepLineMatches("9:25", areas, { pieces: true }).match).toBe(true);
    expect(stepLineMatches("1 : 25", areas, { pieces: true }).match).toBe(false);
    expect(stepLineMatches("3 : 5", "Ratio of lengths $= \\sqrt{9} : \\sqrt{25} = 3 : 5$", { pieces: true }).match).toBe(true);
    expect(stepLineMatches("8 : 125", "Volumes $= 2^3 : 5^3 = 8 : 125$", { pieces: true }).match).toBe(true);
  });
  test("both roots, in either order; one root is half the step", () => {
    const roots = "$(x + 8)(x - 5) = 0$, so $x = -8$ or $x = 5$";
    expect(stepLineMatches("x = -8 or x = 5", roots, { pieces: true }).match).toBe(true);
    expect(stepLineMatches("x = 5 or x = -8", roots, { pieces: true }).match).toBe(true);
    expect(stepLineMatches("5", roots, { pieces: true }).match).toBe(false);
    expect(stepLineMatches("x = 5", roots, { pieces: true }).match).toBe(false);
  });
  test("a substitution still to be worked out states no value", () => {
    expect(stepLineMatches("= 5 m/s", "average speed = 3600 ÷ 720", { pieces: true }).match).toBe(false);
    expect(stepLineMatches("average speed = 3600 ÷ 720", "average speed = 3600 ÷ 720", { pieces: true }).match).toBe(true);
    expect(stepLineMatches("3600/720", "average speed = 3600 ÷ 720", { pieces: true }).match).toBe(true);
  });
  test("a piece the earlier steps already state is not this step's line", () => {
    const step6 = "$P = 13$ is rational; $Q = 19 + 8\\sqrt{3}$ is irrational.";
    const step5 = "$Q = (4 + \\sqrt{3})^2 = 16 + 8\\sqrt{3} + 3 = 19 + 8\\sqrt{3}$";
    expect(stepLineMatches("Q = 19 + 8√3", step6, { pieces: true, before: [step5] }).match).toBe(false);
    expect(stepLineMatches("Q = 19 + 8√3 is irrational", step6, { pieces: true, before: [step5] }).match).toBe(true);
    expect(stepLineMatches("R = 12i + 5j", "So the resultant is $12\\mathbf{i} + 5\\mathbf{j}$ N, since the $\\mathbf{j}$ parts give $-4 + 7 + 2 = 5$.", { pieces: true })).toEqual({ match: true, how: "line" });
  });
  test("the value route reads a value with an accuracy note, and refuses another quantity's label", () => {
    expect(stepLineMatches("arc = 22.0 cm (1 d.p.)", "arc $= \\dfrac{140}{360} \\times 56.5487 = 21.9911$ cm").match).toBe(true);
    expect(stepLineMatches("The area is least when x = 6", "The area is greatest when $x = 6$").match).toBe(false);
  });
});

// B2E-01 and C2 D F01 (24 Sep 2026, confirmed by the verifiers): the fix box refused the natural corrections.
// (1) An authored correction whose value is followed by its reason ("= 25 °C at most, to avoid growing pathogens.")
// stated no value, so even the bare "25" was refused. (2) A label with a formula in it ("O2 molecules needed") was read
// as an equation in an unknown, so the line stated no value and "3" was refused.
describe("the fix box reads a value followed by its reason, and a label with a formula in it", () => {
  const aseptic = {
    studentWorking: [
      "Sterilise: wipe the bench with disinfectant; heat the loop until red hot, then let it cool.",
      "Transfer: lift the lid of the dish only a little and streak the bacteria across the agar.",
      "Seal: tape the lid on the dish and label it.",
      "Incubation temperature = 37 °C, so the bacteria grow as quickly as possible.",
    ],
    mistakeLine: 4,
    correction: [
      "Sterilise: wipe the bench with disinfectant; heat the loop until red hot, then let it cool.",
      "Transfer: lift the lid of the dish only a little and streak the bacteria across the agar.",
      "Seal: tape the lid on the dish and label it.",
      "Incubation temperature = 25 °C at most, to avoid growing pathogens.",
    ],
  };
  test.each([
    "25",
    "25 °C",
    "25°C",
    "25 degrees C",
    "Incubation temperature = 25 °C",
    "Incubation temperature = 25 °C, to avoid growing pathogens",
    "25 °C, to avoid growing pathogens",
    "Incubation temperature = 25°C so pathogens do not grow",
    "Incubation temperature = 25 °C at most, to avoid growing pathogens.",
  ])("b2 aseptic ftm.01: %s is the fix", (typed) => {
    expect(markFix(typed, aseptic).match).toBe(true);
  });
  test.each(["37 °C", "30 °C", "Incubation temperature = 37 °C", "Incubation temperature = 37 °C, so the bacteria grow as quickly as possible.", "25 is not right"])(
    "b2 aseptic ftm.01: %s is not the fix",
    (typed) => {
      expect(markFix(typed, aseptic).match).toBe(false);
    },
  );

  const ethanol = {
    studentWorking: ["Products = CO2 and H2O", "Two carbons give 2CO2; six hydrogens give 3H2O", "Oxygen atoms on the right = 2 × 2 + 3 = 7", "O2 molecules needed = 7 ÷ 2 = 3.5"],
    mistakeLine: 4,
    correction: ["O2 molecules needed = (7 − 1) ÷ 2 = 3"],
  };
  test.each(["3", "= 3", "3O2", "3 O2 molecules", "O2 = 6 ÷ 2 = 3", "O2 molecules needed = 6 ÷ 2 = 3", "6 ÷ 2 = 3", "O2 molecules needed = 3", "(7 - 1) / 2 = 3"])(
    "c2 alcohols ftm.01: %s is the fix",
    (typed) => {
      expect(markFix(typed, ethanol).match).toBe(true);
    },
  );
  test.each(["3.5", "7 ÷ 2 = 3.5", "O2 molecules needed = 7 ÷ 2 = 3.5", "4", "7", "Oxygen atoms on the right = 2 × 2 + 3 = 7", "2 × 2 + 3 = 7"])(
    "c2 alcohols ftm.01: %s is not the fix",
    (typed) => {
      expect(markFix(typed, ethanol).match).toBe(false);
    },
  );
});

// The corpus guard's catches (25 Sep 2026) while the value-then-words reading was being written: each line below was
// read right before it and must stay so.
describe("a value then words: a vector, a check and a reason are not new results", () => {
  test("fm2 ij-vector-calculations ftm.02: \"8 i\" on the flagged line is a vector, not the value 8", () => {
    const ij = {
      studentWorking: ["Two vectors are equal, so their components match", "x i + 5 j - 8 i - y j = 0", "x i - 8 i = 0 and 5 j - y j = 0, so x i = 8 i and 5 j = y j", "x i = 8 i, so x = 8 i and y = 5 j"],
      mistakeLine: 4,
      correction: ["Two vectors are equal, so their components match", "Equating the i coefficients: x = 8", "Equating the j coefficients: 5 = y", "x = 8 and y = 5"],
    };
    expect(markFix("Equating the i coefficients: x = 8", ij).match).toBe(true);
    expect(markFix("x = 8 and y = 5", ij).match).toBe(true);
    expect(markFix("x = 8", ij).match).toBe(true);
    expect(markFix("x = 8 i", ij).match).toBe(false);
  });
  test("fm1 trig-equations ftm.01: the check line, typed as printed, is still the fix", () => {
    const trig = {
      studentWorking: ["sin x = 3 / 5 = 0.6", "x = sin inverse of 0.6 = 36.87", "Second solution: 360 - 36.87 = 323.13", "x = 36.87 or x = 323.13"],
      mistakeLine: 3,
      correction: ["sin x = 0.6", "x = 36.87", "Second solution: 180 - 36.87 = 143.13", "Check: sin 143.13 = 0.6, and both angles are inside the range"],
    };
    expect(markFix("Check: sin 143.13 = 0.6, and both angles are inside the range", trig).match).toBe(true);
    expect(markFix("143.13", trig).match).toBe(true);
    expect(markFix("0.6", trig).match).toBe(false);
  });
});

describe("a later step's line is not this step's value because the numbers agree (guard catch, 25 Sep 2026)", () => {
  test("c2 collision-theory we.03: step 4's ratio line is not step 1's surface area", () => {
    const step1 = "Each small cube has side 1 cm, so its surface area is 6 × 1² = 6 cm².";
    expect(stepLineMatches("Ratios: 24 ÷ 8 = 3 cm⁻¹ before, and 48 ÷ 8 = 6 cm⁻¹ after.", step1).match).toBe(false);
    expect(stepLineMatches("6 × 1² = 6 cm²", step1).match).toBe(true);
  });
});

// Engine brief item 4 (fm2-c-1.md D4 residual): "perpendicular to the slope" did not match a correction written
// "at right angles to the slope"; the two say the same thing.
describe("at right angles to is perpendicular to", () => {
  const item = {
    studentWorking: ["the weight acts vertically downwards", "the normal reaction acts vertically upwards", "the rope's tension acts up the slope", "the slope is smooth, so no friction acts"],
    mistakeLine: 2,
    correction: ["the normal reaction acts at right angles to the slope"],
  };
  test("either wording is the fix; the flagged line is not", () => {
    expect(markFix("the normal reaction acts perpendicular to the slope", item).match).toBe(true);
    expect(markFix("the normal reaction acts at right angles to the slope", item).match).toBe(true);
    expect(markFix("the normal reaction acts vertically upwards", item).match).toBe(false);
    expect(markFix("the normal reaction acts parallel to the slope", item).match).toBe(false);
  });
});

// The FM2 D author (25 Sep 2026, probe-0925.mts). (2) A symbol against a word label disagreed although it names that
// quantity: "R = 35√2 = 49.5" was refused against the correction "Force = … = 49.50 N" (R is a reaction force). A symbol
// agrees with a word label when it is that quantity's usual symbol (R, F, T, W for a force; a for an acceleration; v, u
// for a velocity or speed; s for a displacement or distance; t for a time; m for a mass); another letter does not.
// (3) A line whose clauses are joined by "so" was not read clause by clause: "48 = 10a so a = 4.8" was refused while
// "48 = 10a, a = 4.8" was accepted; "so", "therefore", "hence", "giving", "=>" and "⇒" join clauses as a comma does.
describe("fm2 connected particles: a quantity's symbol, and clauses joined by so", () => {
  const pulley = {
    studentWorking: ["The force on the pulley is the resultant of the two tensions", "Each section pulls with 35 N", "Force = 2 × 35 = 70 N"],
    mistakeLine: 3,
    correction: ["The force on the pulley is the resultant of the two tensions", "Each section pulls with 35 N, one horizontally and one vertically", "Force = √(35² + 35²) = 49.50 N"],
  };
  test.each(["R = 35√2 = 49.5", "F = 49.5 N", "R = 49.50", "Force = 49.5", "49.5 N"])("%s is the fix", (typed) => {
    expect(markFix(typed, pulley).match).toBe(true);
  });
  test.each(["x = 49.5", "a = 49.5", "t = 49.5", "R = 70 N"])("%s is not", (typed) => {
    expect(markFix(typed, pulley).match).toBe(false);
  });
  const system = {
    studentWorking: ["For the whole system:", "Driving weight = 60 N", "60 - 12 - 40 = 10a", "a = 0.80 m/s²"],
    mistakeLine: 3,
    correction: ["For the whole system:", "Driving weight = 60 N", "60 - 12 = 10a", "a = 4.8 m/s²"],
  };
  test.each(["48 = 10a so a = 4.8", "48 = 10a, a = 4.8", "48 = 10a therefore a = 4.8", "48 = 10a hence a = 4.8", "48 = 10a => a = 4.8", "48 = 10a ⇒ a = 4.8", "60 - 12 = 10a so a = 4.8"])(
    "%s is the fix",
    (typed) => {
      expect(markFix(typed, system).match).toBe(true);
    },
  );
  test.each(["8 = 10a so a = 0.8", "60 - 12 - 40 = 10a so a = 0.8"])("%s is not", (typed) => {
    expect(markFix(typed, system).match).toBe(false);
  });
});
