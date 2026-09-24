import { describe, expect, it } from "vitest";
import { SESSION_SIZE, sittingFrom } from "./sitting";

const cards = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `c${i + 1}` }));

describe("a flashcard sitting", () => {
  it("is fifteen cards, not the whole deck", () => {
    expect(SESSION_SIZE).toBe(15);
    expect(sittingFrom(cards(198), new Set(), new Set(), 7)).toHaveLength(15);
    expect(sittingFrom(cards(9), new Set(), new Set(), 7)).toHaveLength(9);
  });

  it("puts the due cards first", () => {
    const due = new Set(["c40", "c41", "c42"]);
    const s = sittingFrom(cards(198), due, new Set(), 3);
    expect(new Set(s.slice(0, 3).map((c) => c.id))).toEqual(due);
  });

  it("moves on past what was studied in this visit, and never deals a card twice", () => {
    const studied = new Set(cards(190).map((c) => c.id));
    const s = sittingFrom(cards(198), new Set(), studied, 11);
    expect(s.map((c) => c.id).sort()).toEqual(["c191", "c192", "c193", "c194", "c195", "c196", "c197", "c198"]);
    const twice = sittingFrom([...cards(3), ...cards(3)], new Set(), new Set(), 5);
    expect(twice).toHaveLength(3);
  });
});
