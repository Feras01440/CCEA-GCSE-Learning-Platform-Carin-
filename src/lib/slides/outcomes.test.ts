import { describe, expect, it } from "vitest";
import { firstOutcomes } from "./outcomes";

const T = "fm.u1.algebraic-fractions-simplify";
const row = (gate: string, minute: number, correct: boolean | null, answerRaw: string | null = null) => ({ at: new Date(Date.UTC(2026, 8, 27, 18, minute)), itemId: `${T}#gate:${gate}`, correct, answerRaw });

describe("each gate's first answer is the one the page draws (audit READ-7)", () => {
  it("keeps the first attempt of each gate, whatever came after", () => {
    const rows = [row("g2", 5, true, "Nothing"), row("g2", 1, false, "The $x$, leaving $4$"), row("g12", 2, true), row("g9", 3, null)];
    expect(firstOutcomes(rows, T)).toEqual({
      g2: { correct: false, answer: "The $x$, leaving $4$" },
      g12: { correct: true, answer: null },
      g9: { correct: false, answer: null },
    });
  });

  it("reads only this topic's gates, and an empty answer as none kept", () => {
    const rows = [row("g2", 1, true, "  "), { at: new Date(), itemId: "fm.u1.other#gate:g2", correct: false, answerRaw: "x" }, { at: new Date(), itemId: `${T}#fade:1`, correct: false, answerRaw: "x" }];
    expect(firstOutcomes(rows, T)).toEqual({ g2: { correct: true, answer: null } });
  });
});
