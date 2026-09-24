import { describe, expect, test } from "vitest";
import { hashSeed, seededShuffle } from "./shuffle";

describe("seededShuffle", () => {
  test("is deterministic for a seed and keeps every item", () => {
    const a = seededShuffle(["a", "b", "c", "d"], "dx.01");
    const b = seededShuffle(["a", "b", "c", "d"], "dx.01");
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(["a", "b", "c", "d"]);
  });
  test("different seeds usually give different orders", () => {
    const orders = new Set(["s1", "s2", "s3", "s4", "s5", "s6"].map((s) => seededShuffle([1, 2, 3, 4, 5], s).join("")));
    expect(orders.size).toBeGreaterThan(2);
  });
  test("never returns the authored order for two or more items", () => {
    for (let i = 0; i < 200; i += 1) {
      const out = seededShuffle(["correct", "b", "c"], `seed-${i}`);
      expect(out.join()).not.toBe("correct,b,c");
    }
    expect(seededShuffle(["only"], "x")).toEqual(["only"]);
  });
  test("hashSeed is stable", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });
});
