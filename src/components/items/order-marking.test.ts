import { describe, expect, test } from "vitest";
import { markOrder, parseArrangement, type OrderSpec } from "./order-marking";

const spec: OrderSpec = { kind: "order", items: ["tissue", "organ", "organ system"], correctOrder: [0, 1, 2] };

describe("parseArrangement", () => {
  test("accepts a full permutation with commas or spaces", () => {
    expect(parseArrangement("2,0,1", 3)).toEqual([2, 0, 1]);
    expect(parseArrangement("2 0 1", 3)).toEqual([2, 0, 1]);
  });
  test("rejects a short, repeated or out-of-range list", () => {
    expect(parseArrangement("0,1", 3)).toBeNull();
    expect(parseArrangement("0,0,1", 3)).toBeNull();
    expect(parseArrangement("0,1,3", 3)).toBeNull();
    expect(parseArrangement("a,b,c", 3)).toBeNull();
    expect(parseArrangement("", 3)).toBeNull();
  });
});

describe("markOrder", () => {
  test("exact match is correct", () => {
    expect(markOrder("0,1,2", spec)).toMatchObject({ correct: true, inPlace: 3, total: 3 });
  });
  test("a swap is wrong and the feedback says how many are placed", () => {
    const r = markOrder("0,2,1", spec);
    expect(r).toMatchObject({ correct: false, inPlace: 1, total: 3, arrangement: [0, 2, 1] });
    expect(r.feedback).toMatch(/1 of 3/);
  });
  test("nothing in place gets a process hint, not a score", () => {
    const r = markOrder("1,2,0", spec);
    expect(r).toMatchObject({ correct: false, inPlace: 0 });
    expect(r.feedback).toMatch(/come first/);
  });
  test("an incomplete arrangement asks for every item", () => {
    expect(markOrder("0,1", spec)).toMatchObject({ correct: false, arrangement: null });
  });
  test("duplicate item texts are interchangeable (gap-fill lists)", () => {
    const s: OrderSpec = { kind: "order", items: ["less", "the same", "less"], correctOrder: [0, 1, 2] };
    expect(markOrder("2,1,0", s).correct).toBe(true);
    expect(markOrder("0,1,2", s).correct).toBe(true);
    expect(markOrder("1,0,2", s)).toMatchObject({ correct: false, inPlace: 1 });
  });
  test("a non-identity correct order is respected", () => {
    const s: OrderSpec = { kind: "order", items: ["b", "c", "a"], correctOrder: [2, 0, 1] };
    expect(markOrder("2,0,1", s).correct).toBe(true);
    expect(markOrder("0,1,2", s).correct).toBe(false);
  });
});
