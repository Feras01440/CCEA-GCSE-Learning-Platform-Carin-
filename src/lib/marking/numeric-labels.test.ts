import { describe, expect, test } from "vitest";
import { checkNumeric, parseNumeric, type NumericSpec } from "./numeric";

// C2 D F06 (24 Sep 2026): a numeric answer written the way the bundle's own worked solutions write it, with its
// quantity's name in front ("Mr = 62.5"), could not be read; only a one-letter label ("x = 62.5") came off.
describe("a quantity's name before the value", () => {
  const mr: NumericSpec = { value: 62.5, tolerance: { type: "absolute", value: 0.05 } };
  test.each(["Mr = 62.5", "Mr=62.5", "M_r = 62.5", "M_{r} = 62.5", "Mr ≈ 62.5", "RFM = 62.5", "relative formula mass = 62.5", "Mean = 62.5", "Total mass = 62.5 g"])(
    "%s reads as 62.5",
    (typed) => {
      expect(checkNumeric(typed, mr).correct).toBe(true);
    },
  );
  test("a formula in the name is part of the name", () => {
    expect(checkNumeric("Mr of C2H3Cl = 62.5", mr).correct).toBe(true);
    expect(checkNumeric("O2 molecules needed = 3", { value: 3 }).correct).toBe(true);
  });
  test.each([
    ["P(A) = 0.3", 0.3],
    ["P(A ∩ B) = 0.12", 0.12],
    ["P(A | B) = 0.4", 0.4],
    ["P(A') = 0.7", 0.7],
    ["P(red) = 0.25", 0.25],
    ["P(not red) = 0.75", 0.75],
  ])("a probability's name comes off: %s", (typed, value) => {
    expect(parseNumeric(typed)?.value).toBeCloseTo(value, 12);
  });
  test("working in TeX after a name is working: the answer is what follows the last equals sign", () => {
    // The corpus guard's catch (25 Sep 2026): once the name came off, "800 \times \dfrac{21}{40} = 420" had no operator
    // the working rule knew, so worked solutions' last lines stopped reading.
    expect(parseNumeric(String.raw`Expected number = 800 \times \dfrac{21}{40} = 420 members.`)?.value).toBe(420);
    expect(parseNumeric(String.raw`P(\text{wins both}) = 0.7 \times 0.6 = 0.42.`)?.value).toBeCloseTo(0.42, 12);
    expect(parseNumeric(String.raw`P(\text{both in}) = 0.7 \cdot 0.7 = 0.49`)?.value).toBeCloseTo(0.49, 12);
    expect(parseNumeric(String.raw`Mr = \frac{125}{2} = 62.5`)?.value).toBe(62.5);
  });
  test("the value under the name is still marked", () => {
    expect(checkNumeric("Mr = 64.5", mr).correct).toBe(false);
    expect(checkNumeric("Mr = 62.5", { value: 62.5, unit: "g", requireUnit: true }).correct).toBe(false);
  });
  test("a function of a letter is working, not a name: it is not taken off", () => {
    // "cos x = 0.5" is a step towards x, not the answer 0.5.
    expect(parseNumeric("cos x = 0.5")).toBeNull();
    expect(parseNumeric("sin θ = 0.5")).toBeNull();
    expect(parseNumeric("log x = 2")).toBeNull();
    expect(parseNumeric("tan x = 1")).toBeNull();
    expect(parseNumeric("sqrt x = 3")).toBeNull();
    expect(parseNumeric("x = 5, y = 3")).toBeNull();
    expect(parseNumeric("x or y = 5")).toBeNull();
  });
});

// C2 D F06: a coefficient written against the formula it counts, as a balanced equation writes it ("3O2"), and a
// small whole number in words, where the stem shows "C₂H₅OH + ___ O₂ →" and asks for the number.
describe("a coefficient against its formula, and a number in words", () => {
  const three: NumericSpec = { value: 3 };
  test.each(["3O2", "3 O2", "3O₂", "3H2O", "2CO2"])("%s reads as its coefficient", (typed) => {
    expect(parseNumeric(typed)?.value).toBe(Number(typed[0]));
  });
  test("the coefficient is marked", () => {
    expect(checkNumeric("3O2", three).correct).toBe(true);
    expect(checkNumeric("2O2", three).correct).toBe(false);
  });
  test.each([
    ["three", 3],
    ["Three.", 3],
    ["four", 4],
    ["zero", 0],
    ["twelve", 12],
    ["twenty", 20],
  ])("%s reads as %d", (typed, value) => {
    expect(parseNumeric(typed)?.value).toBe(value);
  });
  test("words that are not a whole small number stay unread", () => {
    expect(parseNumeric("one half")).toBeNull();
    expect(parseNumeric("three quarters")).toBeNull();
    expect(parseNumeric("threefold")).toBeNull();
  });
  test("a unit's letter joined to a number is still the unit, not a formula", () => {
    expect(checkNumeric("36C", { value: 36, unit: "C", requireUnit: true }).correct).toBe(true);
    expect(checkNumeric("5N", { value: 5, unit: "N", requireUnit: true }).correct).toBe(true);
    expect(checkNumeric("2A", { value: 2, unit: "A", requireUnit: true }).correct).toBe(true);
  });
});
