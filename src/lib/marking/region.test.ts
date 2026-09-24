import { describe, expect, test } from "vitest";
import { boundaryEquation, checkRegion, describeRegionExpect, formatRegionResponse, parseInequality, satisfies } from "./region";

describe("parseInequality", () => {
  test("reads the spellings authors use", () => {
    expect(parseInequality("x + 2y ≤ 6")).toMatchObject({ a: 1, b: 2, c: 6, op: "<=" });
    expect(parseInequality("y ≤ x")).toMatchObject({ a: -1, b: 1, c: 0, op: "<=" });
    expect(parseInequality("x ≥ 1")).toMatchObject({ a: 1, b: 0, c: 1, op: ">=" });
    expect(parseInequality("y > 2x − 1")).toMatchObject({ a: -2, b: 1, c: -1, op: ">" });
    expect(parseInequality("$x + y \\le 5$")).toMatchObject({ a: 1, b: 1, c: 5, op: "<=" });
    expect(parseInequality("3 - y >= x/2")).toMatchObject({ a: -0.5, b: -1, c: -3, op: ">=" });
    expect(parseInequality("x^2 + y ≤ 3")).toBeNull();
    expect(parseInequality("x = 3")).toBeNull();
  });
  test("boundary equations read naturally", () => {
    expect(boundaryEquation(parseInequality("x + 2y ≤ 6")!)).toBe("x + 2y = 6");
    expect(boundaryEquation(parseInequality("y ≤ x")!)).toBe("−x + y = 0");
    expect(boundaryEquation(parseInequality("y ≥ 2")!)).toBe("y = 2");
  });
});

describe("checkRegion", () => {
  const closed = { plot: "region" as const, inequalities: ["x ≥ 1", "y ≥ 1", "x + y ≤ 5"], shadeInside: true };
  test("a point inside the region satisfies every inequality", () => {
    const v = checkRegion(formatRegionResponse([2, 2]), closed);
    expect(v).toMatchObject({ correct: true, earned: 3, total: 3 });
    expect(v.feedback).toBe("That is the region: the right side of all 3 boundary lines.");
  });
  test("a point on the wrong side of one line names that line with a test point", () => {
    const v = checkRegion(formatRegionResponse([4, 3]), closed);
    expect(v).toMatchObject({ correct: false, earned: 2, total: 3 });
    expect(v.feedback).toBe("Your region is on the wrong side of x + y = 5: it needs x + y ≤ 5, and (0, 0) shows which side that is.");
  });
  test("a point on a boundary is not a decision", () => {
    const v = checkRegion(formatRegionResponse([1, 3]), closed);
    expect(v.correct).toBe(false);
    expect(v.feedback).toContain("sits on the line x = 1");
  });
  test("a strict inequality excludes its line and a single inequality reads as a side", () => {
    expect(satisfies(parseInequality("y > 2")!, [0, 2])).toBe(false);
    expect(satisfies(parseInequality("y ≥ 2")!, [0, 2])).toBe(true);
    const one = { plot: "region" as const, inequalities: ["x + 2y ≤ 6"], shadeInside: true };
    expect(checkRegion(formatRegionResponse([0, 0]), one).feedback).toBe("That is the right side of the line.");
    expect(checkRegion("", one)).toMatchObject({ correct: false, earned: 0, total: 1, feedback: "Nothing was shaded yet." });
    expect(describeRegionExpect(one)).toBe("the region where x + 2y ≤ 6");
  });
});
