import { describe, expect, it } from "vitest";
import { chipStates, returnPhrase } from "./FeedbackCard";
import type { MarkResult } from "./mark";

const result = (over: Partial<MarkResult>): MarkResult => ({ correct: false, marksAwarded: 0, marksAvailable: 2, expected: "565", explanation: "x", ...over });
const MA_A = [
  { id: "m1", code: "MA", marks: 1 },
  { id: "a1", code: "A", marks: 1 },
];

describe("the scheme's codes on a marked card", () => {
  it("are all earned on a right answer and all struck on nothing", () => {
    expect(chipStates(MA_A, result({ correct: true, marksAwarded: 2 }), [])).toEqual(["earned", "earned"]);
    expect(chipStates(MA_A, result({}), [])).toEqual(["struck", "struck"]);
  });

  it("give a part-way award to the method first, as CCEA's schemes are written", () => {
    expect(chipStates(MA_A, result({ marksAwarded: 1 }), [], "numeric")).toEqual(["earned", "struck"]);
  });

  it("name the points her working was seen to earn, and give the rest in order", () => {
    const scheme = [
      { id: "m1", code: "M", marks: 1 },
      { id: "m2", code: "M", marks: 1 },
      { id: "a1", code: "A", marks: 1 },
    ];
    expect(chipStates(scheme, result({ marksAwarded: 1, marksAvailable: 3 }), ["m2"], "numeric")).toEqual(["struck", "earned", "struck"]);
    expect(chipStates(scheme, result({ marksAwarded: 2, marksAvailable: 3 }), ["m2"], "numeric")).toEqual(["earned", "earned", "struck"]);
  });

  it("stay unmarked on a piecewise kind with different codes, rather than name the wrong one", () => {
    const scheme = [
      { id: "k1", code: "M", marks: 1 },
      { id: "k2", code: "W", marks: 1 },
    ];
    expect(chipStates(scheme, result({ marksAwarded: 1 }), [], "text")).toEqual(["open", "open"]);
    // The same codes throughout: any assignment reads the same, so it is shown.
    const labels = [1, 2, 3, 4].map((n) => ({ id: `p${n}`, code: "P", marks: 1 }));
    expect(chipStates(labels, result({ marksAwarded: 3, marksAvailable: 4 }), [], "label")).toEqual(["earned", "earned", "earned", "struck"]);
  });
});

describe("the day a missed card comes back", () => {
  const now = new Date(2026, 8, 23, 19, 0); // Wednesday 23 September 2026, 7 pm
  it("is said as tonight, tomorrow, a weekday or a date, from the card's own due", () => {
    expect(returnPhrase(new Date(2026, 8, 23, 19, 1), now)).toBe("It comes back in tonight's reviews.");
    expect(returnPhrase(new Date(2026, 8, 22, 9, 0), now)).toBe("It comes back in tonight's reviews.");
    expect(returnPhrase(new Date(2026, 8, 24, 9, 0), now)).toBe("It comes back tomorrow.");
    expect(returnPhrase(new Date(2026, 8, 26, 9, 0), now)).toBe("It comes back on Saturday.");
    expect(returnPhrase(new Date(2026, 9, 14, 9, 0), now)).toBe("It comes back on 14 October.");
  });
});
