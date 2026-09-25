import { describe, expect, test } from "vitest";
import { accuracyOf, fadeHeading, nextFade, planFade } from "./fade";

const steps = [1, 2, 3, 4].map((n) => ({ n, working: `w${n}`, decision: `d${n}` }));

describe("planFade", () => {
  test("full shows every step", () => {
    const p = planFade({ steps, faded: [] }, "full");
    expect(p.mode).toBe("steps");
    expect(p.showSteps).toBe(4);
    expect(p.supplied).toEqual([]);
  });
  test("authored faded plans are used", () => {
    const we = { steps, faded: [{ showSteps: 3, studentSupplies: [4] }, { showSteps: 2, studentSupplies: [3, 4] }] };
    expect(planFade(we, "faded1")).toMatchObject({ showSteps: 3, supplied: [4] });
    const p2 = planFade(we, "faded2");
    expect(p2.supplied).toEqual([3, 4]);
    expect(p2.sequence.map((s) => s.role)).toEqual(["shown", "shown", "input", "input"]);
  });
  test("without an authored plan, backward fading hides the last one then two steps", () => {
    expect(planFade({ steps, faded: [] }, "faded1")).toMatchObject({ showSteps: 3, supplied: [4] });
    expect(planFade({ steps, faded: [] }, "faded2")).toMatchObject({ showSteps: 2, supplied: [3, 4] });
    expect(planFade({ steps: steps.slice(0, 1), faded: [] }, "faded2")).toMatchObject({ showSteps: 0, supplied: [1] });
  });
  test("twin and problem carry no step sequence", () => {
    expect(planFade({ steps, faded: [] }, "twin").mode).toBe("twin");
    expect(planFade({ steps, faded: [] }, "problem").sequence).toEqual([]);
  });
});

describe("accuracy and the governor", () => {
  test("accuracyOf", () => {
    expect(accuracyOf([])).toBe(1);
    expect(accuracyOf([true, false, true, true])).toBe(0.75);
  });
  test("nextFade steps up at 80%, back to the example under 50%", () => {
    expect(nextFade("faded1", 0.9)).toBe("faded2");
    expect(nextFade("problem", 1)).toBe("problem");
    expect(nextFade("twin", 0.4)).toBe("full");
    expect(nextFade("faded2", 0.6)).toBe("faded2");
  });
  test("the thresholds are the lead's: 80% or more advances, 50% to under 80% repeats, under 50% drops to the example (engine item 10.6)", () => {
    expect(nextFade("faded1", 0.8)).toBe("faded2");
    expect(nextFade("faded1", 0.79)).toBe("faded1");
    expect(nextFade("faded1", 0.5)).toBe("faded1");
    expect(nextFade("faded1", 0.49)).toBe("full");
    // The full example asks nothing, so reading it to the end (accuracy 1) opens the first faded version.
    expect(nextFade("full", 1)).toBe("faded1");
  });
});

// Trial audit MK-09 (24 Sep 2026): fm1 algebraic-fractions-simplify WE01's first rung was headed "the last step is yours"
// but asked for steps 2 and 3, because its authored plans are in the other order (faded[0] hands over two steps,
// faded[1] one). Backward fading gives the lighter rung first, whatever order the plans are written in, and the heading
// says what the rung really asks for (fadeHeading).
describe("the rungs in order of what they ask, and a heading that says so", () => {
  const three = [1, 2, 3].map((n) => ({ n, working: `w${n}`, decision: `d${n}` }));
  const reversed = { steps: three, faded: [{ showSteps: 1, studentSupplies: [2, 3] }, { showSteps: 2, studentSupplies: [3] }] };
  test("faded1 is the rung that hands over fewer steps", () => {
    expect(planFade(reversed, "faded1")).toMatchObject({ showSteps: 2, supplied: [3] });
    expect(planFade(reversed, "faded2")).toMatchObject({ showSteps: 1, supplied: [2, 3] });
  });
  test("the heading names the steps she supplies", () => {
    expect(fadeHeading(planFade(reversed, "faded1"), 3)).toBe("Your turn · the last step is yours");
    expect(fadeHeading(planFade(reversed, "faded2"), 3)).toBe("Your turn · the last 2 steps are yours");
    const middle = { steps: [1, 2, 3, 4].map((n) => ({ n, working: `w${n}`, decision: `d${n}` })), faded: [{ showSteps: 1, studentSupplies: [2, 4] }] };
    expect(fadeHeading(planFade(middle, "faded1"), 4)).toBe("Your turn · steps 2 and 4 are yours");
  });
});
