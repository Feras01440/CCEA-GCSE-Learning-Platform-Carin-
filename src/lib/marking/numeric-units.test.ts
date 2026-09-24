import { describe, expect, test } from "vitest";
import { checkNumeric, normaliseUnit, type NumericSpec } from "./numeric";

// P2D-R1 (24 Sep 2026): the coulomb. CCEA P2 2.3.6 (Q = I × t) awards the unit as "C"; before this the
// engine could not read "36 C" at all, so a right charge answer written as the schemes write it scored 0.
describe("charge in coulombs", () => {
  const live: NumericSpec = { value: 36, unit: "coulombs" };
  const required: NumericSpec = { value: 1800, unit: "C", requireUnit: true };

  test.each(["36 C", "36C", "36 c", "36 coulombs", "36 coulomb", "Q = 36 C", "36 C."])("%s is right against a key in coulombs", (typed) => {
    expect(checkNumeric(typed, live).correct).toBe(true);
  });
  test("the bare number is right, with the unit reminder written as the symbol", () => {
    const v = checkNumeric("36", live);
    expect(v.correct).toBe(true);
    expect(v.feedback).toContain("(C)");
  });
  test.each(["1800 C", "1800C", "1800 coulombs"])("%s is right when the unit is required", (typed) => {
    expect(checkNumeric(typed, required).correct).toBe(true);
  });
  test.each([
    ["1800", "missing-unit"],
    ["1800 °C", "wrong-unit"],
    ["1800 A", "wrong-unit"],
    ["30 C", "wrong-value"],
  ])("%s is not right when the unit is required (%s)", (typed, reason) => {
    const v = checkNumeric(typed, required);
    expect(v.correct).toBe(false);
    if (reason !== "wrong-value") expect(v.reason).toBe(reason);
  });
  test("coulomb spellings normalise to C; Celsius spellings stay °C", () => {
    expect(normaliseUnit("coulombs")).toBe("C");
    expect(normaliseUnit("C")).toBe("C");
    expect(normaliseUnit("°C")).toBe("°C");
    expect(normaliseUnit("degrees C")).toBe("°C");
    expect(normaliseUnit("deg C")).toBe("°C");
  });
});

describe("a bare C against a temperature", () => {
  const temp: NumericSpec = { value: 25, unit: "°C", requireUnit: true };
  test.each(["25 °C", "25°C", "25 degrees C", "25 C", "25C", "25 c"])("%s is right for 25 °C", (typed) => {
    expect(checkNumeric(typed, temp).correct).toBe(true);
  });
  test.each(["25 coulombs", "25 coulomb"])("%s is the wrong unit for a temperature", (typed) => {
    const v = checkNumeric(typed, temp);
    expect(v.correct).toBe(false);
    expect(v.reason).toBe("wrong-unit");
  });
});

// P2D-R2 (24 Sep 2026): a composite unit with the ohm in it. CCEA Unit 7 Booklet B awards the gradient of a
// resistance–length graph its unit as "ohm/metre or Ω/m"; before this no spelling of it could be marked right.
describe("ohms per metre", () => {
  const grad: NumericSpec = { value: 6, unit: "Ω/m", requireUnit: true };
  const unitFree: NumericSpec = { value: 6, tolerance: { type: "absolute", value: 0.1 } };
  test.each([
    "6 Ω/m",
    "6Ω/m",
    "6 Ω per m",
    "6 Ω per metre",
    "6 Ω/metre",
    "6 ohms per metre",
    "6 ohm per metre",
    "6 ohms/m",
    "6 ohm/m",
    "6 ohms per meter",
    "6 Ω m⁻¹",
    "6 Ω m^-1",
    "6 Ω m-1",
    "6 Ω/m",
  ])("%s is right against Ω/m", (typed) => {
    expect(checkNumeric(typed, grad).correct).toBe(true);
  });
  test.each([
    ["6", "missing-unit"],
    ["6 Ω", "wrong-unit"],
    ["6 m/Ω", "wrong-unit"],
    ["6 metres per ohm", "wrong-unit"],
  ])("%s is not right against Ω/m (%s)", (typed, reason) => {
    const v = checkNumeric(typed, grad);
    expect(v.correct).toBe(false);
    expect(v.reason).toBe(reason);
  });
  test.each(["6", "6.0", "6 Ω/m", "6Ω/m", "6 Ω per m", "6 ohms per metre", "5.95 Ω/m"])("%s is right on a unit-free gradient part", (typed) => {
    expect(checkNumeric(typed, unitFree).correct).toBe(true);
  });
  test("another composite with the ohm reads through the loose unit key", () => {
    const perCm: NumericSpec = { value: 0.4, unit: "Ω/cm", requireUnit: true };
    expect(checkNumeric("0.4 Ω/cm", perCm).correct).toBe(true);
    expect(checkNumeric("0.4 ohms per centimetre", perCm).correct).toBe(true);
    expect(checkNumeric("0.4 Ω/m", perCm).correct).toBe(false);
  });
  test("the ohm sign U+2126 reads as the Greek capital omega", () => {
    expect(checkNumeric("6 Ω", { value: 6, unit: "Ω", requireUnit: true }).correct).toBe(true);
  });
});

// B2E-02 (24 Sep 2026): a temperature typed without the degree sign. "25 degrees" was read as the ANGLE unit and
// refused against 25 °C on a part that does not even mark the unit; "25 C" and "25oC" could not be read at all.
describe("a temperature typed the way a keyboard allows", () => {
  const free: NumericSpec = { value: 25, unit: "°C" };
  const required: NumericSpec = { value: 25, unit: "°C", requireUnit: true };
  test.each(["25", "25 °C", "25°C", "25 degrees C", "25 degrees Celsius", "25 deg C", "25 C", "25oC", "25 oC", "25 celsius", "25 Celsius", "25 ºC"])(
    "%s is right when the unit is not marked",
    (typed) => {
      expect(checkNumeric(typed, free).correct).toBe(true);
    },
  );
  test.each(["25 degrees", "25 deg", "25°"])("%s is right when the unit is not marked, with a reminder to write °C", (typed) => {
    const v = checkNumeric(typed, free);
    expect(v.correct).toBe(true);
    expect(v.feedback).toContain("°C");
  });
  test.each(["25 degrees", "25 deg", "25°"])("%s is not the unit when the unit is marked: degrees alone could be an angle", (typed) => {
    const v = checkNumeric(typed, required);
    expect(v.correct).toBe(false);
    expect(v.reason).toBe("wrong-unit");
  });
  test.each(["25 °C", "25 degrees C", "25 C", "25oC", "25 celsius"])("%s is right when the unit is marked", (typed) => {
    expect(checkNumeric(typed, required).correct).toBe(true);
  });
  test("an angle stays an angle: degrees are its unit and °C is not", () => {
    const angle: NumericSpec = { value: 25, unit: "°", requireUnit: true };
    expect(checkNumeric("25 degrees", angle).correct).toBe(true);
    expect(checkNumeric("25°", angle).correct).toBe(true);
    expect(checkNumeric("25 °C", angle).correct).toBe(false);
    expect(checkNumeric("25 C", angle).correct).toBe(false);
  });
  test("a wrong temperature stays wrong", () => {
    expect(checkNumeric("35 degrees", free).correct).toBe(false);
    expect(checkNumeric("35 C", free).correct).toBe(false);
  });
});

// C2 E (24 Sep 2026): a concentration written with a negative power. "mol dm⁻³" is how CCEA's chemistry papers print
// the unit and "mol/dm³" how the specification does; only a -1 power used to fold into a slash, so the two were
// different units and a right answer typed as the paper prints it was refused.
describe("a negative power is a denominator, whatever the power", () => {
  const conc: NumericSpec = { value: 0.5, unit: "mol/dm³", requireUnit: true };
  test.each(["0.5 mol/dm³", "0.5 mol/dm3", "0.5 mol dm⁻³", "0.5 mol dm-3", "0.5 mol dm^-3", "0.5 mol per dm³", "0.5 mol per dm3"])("%s is right against mol/dm³", (typed) => {
    expect(checkNumeric(typed, conc).correct).toBe(true);
  });
  test("and the other way round: a key written with the power reads the slash", () => {
    const paper: NumericSpec = { value: 0.5, unit: "mol dm⁻³", requireUnit: true };
    expect(checkNumeric("0.5 mol/dm³", paper).correct).toBe(true);
    expect(checkNumeric("0.5 mol dm-3", paper).correct).toBe(true);
  });
  test.each(["0.5 mol dm³", "0.5 mol dm3", "0.5 g/dm³", "0.5 mol/cm³", "0.5 dm³/mol"])("%s is a different unit", (typed) => {
    const v = checkNumeric(typed, conc);
    expect(v.correct).toBe(false);
    expect(v.reason).toBe("wrong-unit");
  });
  test("a -1 power still folds the way it did", () => {
    const rate: NumericSpec = { value: 0.031, unit: "s⁻¹", requireUnit: true };
    expect(checkNumeric("0.031 s-1", rate).correct).toBe(true);
    expect(checkNumeric("0.031 /s", rate).correct).toBe(true);
    expect(checkNumeric("0.031 per second", rate).correct).toBe(true);
    const gs: NumericSpec = { value: 0.5, unit: "g/s", requireUnit: true };
    expect(checkNumeric("0.5 g s-1", gs).correct).toBe(true);
    expect(checkNumeric("0.5 g s⁻¹", gs).correct).toBe(true);
  });
  test("a -2 power on its own is a squared denominator", () => {
    const acc: NumericSpec = { value: 2, unit: "cm/s²", requireUnit: true };
    expect(checkNumeric("2 cm s⁻²", acc).correct).toBe(true);
    expect(checkNumeric("2 cm s-2", acc).correct).toBe(true);
    expect(checkNumeric("2 cm/s", acc).correct).toBe(false);
  });
});
