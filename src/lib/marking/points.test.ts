import { describe, expect, test } from "vitest";
import { checkPoints, looksLikePointList, parsePointList } from "./points";

describe("parsePointList", () => {
  test("reads tuples in any spelling", () => {
    expect(parsePointList("(1, 2), (-3, -6)")).toEqual([{ x: 1, y: 2 }, { x: -3, y: -6 }]);
    expect(parsePointList("(1,2) and (−3,−6)")).toEqual([{ x: 1, y: 2 }, { x: -3, y: -6 }]);
    expect(parsePointList("(1/2, 2√3)")).toEqual([{ x: 0.5, y: 2 * Math.sqrt(3) }]);
  });
  test("reads x = …, y = … assignments and groups them into pairs", () => {
    expect(parsePointList("x = 1, y = 2")).toEqual([{ x: 1, y: 2 }]);
    expect(parsePointList("x=1, y=2, x=-3, y=-6")).toEqual([{ x: 1, y: 2 }, { x: -3, y: -6 }]);
    expect(parsePointList("x = 1 and y = 2 or x = -3 and y = -6")).toEqual([{ x: 1, y: 2 }, { x: -3, y: -6 }]);
    expect(parsePointList("y = 2, x = 1; y = -6, x = -3")).toEqual([{ x: 1, y: 2 }, { x: -3, y: -6 }]);
    expect(parsePointList("a = 4, b = -1", ["a", "b"])).toEqual([{ x: 4, y: -1 }]);
  });
  test("rejects half pairs and non-numbers", () => {
    expect(parsePointList("x = 1")).toBeNull();
    expect(parsePointList("x = 1, y = 2, x = 3")).toBeNull();
    expect(parsePointList("(1, banana)")).toBeNull();
    expect(parsePointList("")).toBeNull();
    expect(parsePointList("just words")).toBeNull();
  });
  test("looksLikePointList spots a numeric tuple only", () => {
    expect(looksLikePointList("(2, 3)")).toBe(true);
    expect(looksLikePointList("(1, 2), (-3, -6)")).toBe(true);
    expect(looksLikePointList("(x+2)(x-3)")).toBe(false);
    expect(looksLikePointList("x=3, x=7")).toBe(false);
  });
});

describe("checkPoints", () => {
  const two = "(1, 2), (-3, -6)";
  test("all pairs in any order or spelling is correct", () => {
    expect(checkPoints("(-3,-6), (1,2)", two)).toMatchObject({ correct: true, reason: "correct" });
    expect(checkPoints("x = 1, y = 2 or x = -3, y = -6", two)).toMatchObject({ correct: true });
    expect(checkPoints("x = 2, y = 3", "(2, 3)")).toMatchObject({ correct: true });
    expect(checkPoints("(0.5, 1.5)", "(1/2, 3/2)")).toMatchObject({ correct: true });
  });
  test("a crossed pairing is named as such", () => {
    const v = checkPoints("(1, -6), (-3, 2)", two);
    expect(v).toMatchObject({ correct: false, reason: "crossed" });
    expect(v.feedback).toMatch(/paired wrongly/);
    expect(v.feedback).toMatch(/x = 1 goes with y = 2/);
  });
  test("one pair of two is missing", () => {
    const v = checkPoints("(1, 2)", two);
    expect(v).toMatchObject({ correct: false, reason: "missing" });
    expect(v.feedback).toMatch(/1 of the 2 pairs/);
  });
  test("an extra wrong pair or a wrong pair is reported with a substitution nudge", () => {
    expect(checkPoints("(1, 2), (-3, -6), (0, 0)", two)).toMatchObject({ correct: false, reason: "extra" });
    expect(checkPoints("(4, 5)", "(2, 3)")).toMatchObject({ correct: false, reason: "wrong" });
  });
  test("unparseable input asks for the pair format", () => {
    const v = checkPoints("2 and 3", "(2, 3)");
    expect(v).toMatchObject({ correct: false, reason: "unparseable" });
    expect(v.feedback).toMatch(/\(x, y\)/);
  });
});

describe("LaTeX in a pair spec", () => {
  const expected = "(2 + \\sqrt{2}, 9 + 4\\sqrt{2}), (2 - \\sqrt{2}, 9 - 4\\sqrt{2})";
  test("the spec's sqrt and frac commands are read as the plain spellings the learner types", () => {
    expect(looksLikePointList(expected)).toBe(true);
    expect(checkPoints("(2 + √2, 9 + 4√2), (2 − √2, 9 − 4√2)", expected).correct).toBe(true);
    expect(checkPoints("x = 2 + √2, y = 9 + 4√2 or x = 2 − √2, y = 9 − 4√2", expected).correct).toBe(true);
    expect(checkPoints("(2 + √2, 9 + 4√2)", expected)).toMatchObject({ correct: false, reason: "missing" });
    expect(checkPoints("(1/2, 3)", "(\\frac{1}{2}, 3)").correct).toBe(true);
  });
});

describe("a tolerance on a coordinate pair", () => {
  test("a rounded pair earns the exact one inside the tolerance, and the miss names the coordinates", () => {
    expect(checkPoints("(0.83, -3.08)", "(5/6, -37/12)", { tolerance: 0.01 }).correct).toBe(true);
    expect(checkPoints("x = 0.833, y = -3.083", "(5/6, -37/12)", { tolerance: 0.01 }).correct).toBe(true);
    const off = checkPoints("(0.9, -3.08)", "(5/6, -37/12)", { tolerance: 0.01 });
    expect(off.correct).toBe(false);
    expect(off.feedback).toMatch(/check each coordinate/);
    expect(checkPoints("(0.83, -3.08)", "(5/6, -37/12)").correct).toBe(false);
  });
});
