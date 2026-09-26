import { describe, expect, it } from "vitest";
import { EMPTY_TAP, RESULT, SHARED, checkTap, pillReading, substituteFor, tapPair, type PillId, type TapState } from "./afs-model";

const pair = (state: TapState, a: PillId, b: PillId) => tapPair(state, a, b);

describe("the figure she acts on: 3x(x + 7) over 6(x + 7)(x − 7), the note's own figure", () => {
  it("strikes the bracket on both lines whole", () => {
    const r = pair(EMPTY_TAP, "t-b", "b-b");
    expect(r.state.struck).toEqual(["t-b", "b-b"]);
    expect(pillReading("t-b", r.state)).toEqual({ kind: "struck" });
    expect(r.note).toContain("One more: what divides both 3x and 6?");
  });

  it("pairs 3x with 6 by striking the factor 3 out of each, leaving x and 2, never the whole pills (audit MK-05)", () => {
    const r = pair(EMPTY_TAP, "t-3x", "b-6");
    expect(pillReading("t-3x", r.state)).toEqual({ kind: "split", factor: "3", left: "x" });
    expect(pillReading("b-6", r.state)).toEqual({ kind: "split", factor: "3", left: "2" });
    expect(r.note).toBe("3x is 3 × x and 6 is 3 × 2: the 3 divides out of both, leaving x and 2. Now the bracket both lines share.");
    // Either order.
    expect(pair(EMPTY_TAP, "b-6", "t-3x").state.struck.sort()).toEqual(["b-6", "t-3x"]);
  });

  it("leaves unstruck exactly the answer: x on top, 2 and (x − 7) underneath", () => {
    let s = pair(EMPTY_TAP, "t-b", "b-b").state;
    s = pair(s, "t-3x", "b-6").state;
    const left = {
      top: ["t-3x", "t-b"].map((id) => pillReading(id as PillId, s)).flatMap((r) => (r.kind === "split" ? [r.left] : r.kind === "whole" ? ["?"] : [])),
      bottom: ["b-6", "b-b", "b-m"].map((id) => pillReading(id as PillId, s)).flatMap((r) => (r.kind === "split" ? [r.left] : r.kind === "whole" ? ["(x − 7)"] : [])),
    };
    expect(left).toEqual({ top: ["x"], bottom: ["2", "(x − 7)"] });
    expect(`${left.top.join("")} / ${left.bottom[0]}${left.bottom[1]}`).toBe(`${RESULT.top} / ${RESULT.bottom}`);
    expect(checkTap(s)).toEqual({ correct: true, lit: [], diagnosis: null });
  });

  it("names a mismatch and strikes nothing: a term, or a different bracket, does not divide out", () => {
    const r = pair(EMPTY_TAP, "t-3x", "b-m");
    expect(r.state).toEqual(EMPTY_TAP);
    expect(r.note).toBe("3x and (x − 7) are not the same factor, so nothing divides out.");
    expect(pair(EMPTY_TAP, "t-b", "b-m").state.struck).toEqual([]);
    expect(pair(EMPTY_TAP, "t-b", "b-6").state.struck).toEqual([]);
  });

  it("moves the pending pill when the second tap is on the same line", () => {
    expect(pair(EMPTY_TAP, "t-3x", "t-b")).toMatchObject({ pending: "t-b", note: "Now its match on the other line." });
  });

  it("on a Check with something still shared, says what, and lights it so she can finish it now", () => {
    const s = pair(EMPTY_TAP, "t-b", "b-b").state;
    expect(checkTap(s)).toEqual({ correct: false, lit: ["t-3x", "b-6"], diagnosis: "A factor of 3 still divides both 3x and 6." });
    expect(checkTap(EMPTY_TAP)).toEqual({ correct: false, lit: [...SHARED], diagnosis: "(x + 7) and a factor of 3 still divide both lines." });
    // Finishing the lit pair after the miss clears it from the lit set.
    const lit: TapState = { struck: s.struck, lit: ["t-3x", "b-6"] };
    expect(pair(lit, "t-3x", "b-6").state).toEqual({ struck: ["t-b", "b-b", "t-3x", "b-6"], lit: [] });
  });
});

describe("the g2 consequence: x = 1 in the fraction and in her cancelled version (audit CT-19, CQ-03)", () => {
  it.each([
    ["The $x$, leaving $4$", false, { value: "4", label: "your cancelled version" }],
    ["The $x$ and the $4$", false, { value: "1", label: "your cancelled version" }],
    ["Nothing", true, { value: "4", label: "the cancelled version" }],
    ["Something reworded later", false, { value: "4", label: "the cancelled version" }],
  ] as const)("%s → %o", (hers, correct, shown) => {
    expect(substituteFor(hers, correct)).toEqual(shown);
  });
});
