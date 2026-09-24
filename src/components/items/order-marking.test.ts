import { describe, expect, test } from "vitest";
import { markOrder, orderMarks, parseArrangement, type OrderSpec } from "./order-marking";

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
  test("inOrder counts the longest run of items already in the right order relative to each other", () => {
    const six: OrderSpec = { kind: "order", items: ["a", "b", "c", "d", "e", "f"], correctOrder: [0, 1, 2, 3, 4, 5] };
    expect(markOrder("0,1,2,3,5,4", six)).toMatchObject({ inPlace: 4, inOrder: 5 });
    // One item carried from the front to the back: nothing is in its place, yet five are still in order.
    expect(markOrder("1,2,3,4,5,0", six)).toMatchObject({ inPlace: 0, inOrder: 5 });
    expect(markOrder("5,4,3,2,1,0", six)).toMatchObject({ inPlace: 0, inOrder: 1 });
    // Interchangeable duplicates are matched so as to keep the most in order.
    const gap: OrderSpec = { kind: "order", items: ["less", "the same", "less", "more"], correctOrder: [0, 1, 2, 3] };
    expect(markOrder("0,1,3,2", gap)).toMatchObject({ inOrder: 3 });
  });
});

// B2E-14 (24 Sep 2026): an order or steps part was all or nothing, so a 2-mark part whose scheme pays two separate
// points scored 0 for one swap. Schemes are written two ways: one point per slot ("P1 tissue, P2 organ, P3 organ
// system") and one point per link of the chain ("heating comes first … drawing the fraction off last"). The award
// is the smaller of the two readings, so it never pays more than either scheme would.
describe("orderMarks: partial credit on an order", () => {
  const six: OrderSpec = { kind: "order", items: ["a", "b", "c", "d", "e", "f"], correctOrder: [0, 1, 2, 3, 4, 5] };
  const three: OrderSpec = { kind: "order", items: ["tissue", "organ", "organ system"], correctOrder: [0, 1, 2] };
  test("all in order earns every mark; an incomplete arrangement earns none", () => {
    expect(orderMarks(markOrder("0,1,2,3,4,5", six), 2)).toBe(2);
    expect(orderMarks(markOrder("0,1", six), 2)).toBe(0);
  });
  test("b2 aseptic transfer .0008 (2 marks, 6 steps): one swap keeps one mark", () => {
    expect(orderMarks(markOrder("0,1,2,3,5,4", six), 2)).toBe(1);
    expect(orderMarks(markOrder("0,2,1,3,4,5", six), 2)).toBe(1);
  });
  test("two things wrong on a 2-mark part earn nothing", () => {
    expect(orderMarks(markOrder("1,0,2,3,5,4", six), 2)).toBe(0);
    expect(orderMarks(markOrder("5,4,3,2,1,0", six), 2)).toBe(0);
  });
  test("a slot scheme is never overpaid: organ and organ system swapped keeps only tissue's mark", () => {
    expect(orderMarks(markOrder("0,2,1", three), 3)).toBe(1);
    expect(orderMarks(markOrder("2,1,0", three), 3)).toBe(1);
    expect(orderMarks(markOrder("1,2,0", three), 3)).toBe(0);
  });
  test("a link scheme is never overpaid: one item carried to the back of a 2-mark chain earns nothing in place", () => {
    expect(orderMarks(markOrder("1,2,3,4,5,0", six), 2)).toBe(0);
  });
  test("a miss never earns every mark, even on a long chain", () => {
    const nine: OrderSpec = { kind: "order", items: "abcdefghi".split(""), correctOrder: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
    expect(orderMarks(markOrder("0,1,2,3,4,5,6,8,7", nine), 3)).toBe(2);
    expect(orderMarks(markOrder("0,1,2,3,4,5,6,8,7", nine), 9)).toBe(7);
  });
});
