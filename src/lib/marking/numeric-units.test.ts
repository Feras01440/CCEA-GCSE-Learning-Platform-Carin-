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

// The FM2 D author (25 Sep 2026): the moment of a force, in newton metres. "48 N m" and "48 N·m" scored 0 and "48 Nm"
// 1 of 2 against 48 N m; every spelling of the unit is the one unit. A newton metre is not a nanometre: "nm" in lower
// case stays the nanometre.
describe("the newton metre", () => {
  const moment: NumericSpec = { value: 48, unit: "N m", requireUnit: true };
  test.each(["48 N m", "48 N·m", "48 N⋅m", "48 Nm", "48 N m", "48 N m", "48 newton metres", "48 newton-metres", "48 newton meters"])("%s is right", (typed) => {
    expect(checkNumeric(typed, moment).correct).toBe(true);
  });
  test.each([
    ["48", "missing-unit"],
    ["48 N", "wrong-unit"],
    ["48 J", "wrong-unit"],
  ])("%s is not (%s)", (typed, reason) => {
    const v = checkNumeric(typed, moment);
    expect(v.correct).toBe(false);
    expect(v.reason).toBe(reason);
  });
  test("the spec may spell the unit any of those ways", () => {
    expect(checkNumeric("48 N m", { value: 48, unit: "Nm", requireUnit: true }).correct).toBe(true);
    expect(checkNumeric("48 Nm", { value: 48, unit: "N·m", requireUnit: true }).correct).toBe(true);
  });
  test("nm in lower case is still the nanometre", () => {
    expect(normaliseUnit("nm")).not.toBe(normaliseUnit("N m"));
  });
});

// The P2 D author (25 Sep 2026): "only the rounded value" fired on a coincidence. Expected 22.5, "20" was told it was the
// rounded value (it is 1 significant figure of 22.5 by chance); a graph read-off "3" against 2.7 the same. The advice
// fires only when the value she wrote carries at least 2 significant figures, or a decimal place, and is within 10 %.
describe("the rounded-value advice is not given on a one-figure coincidence", () => {
  test.each([
    ["20", 22.5],
    ["3", 2.7],
    ["300", 250],
  ])("%s against %d is a wrong value, not a rounding", (typed, value) => {
    const v = checkNumeric(typed, { value, tolerance: { type: "absolute", value: 0.05 } });
    expect(v.correct).toBe(false);
    expect(v.feedback).not.toMatch(/only the rounded value/);
  });
  test.each([
    ["23", 22.5],
    ["2.8", 2.75],
    ["0.29", 0.2941],
  ])("%s against %d is still the rounded value", (typed, value) => {
    expect(checkNumeric(typed, { value, tolerance: { type: "absolute", value: 0.001 } }).feedback).toMatch(/only the rounded value/);
  });
});

// The P2 C, P2 D, C2 E and C2 D reviews (25–27 Sep 2026): answers typed as the worked solutions and the mark schemes
// write them, which the box could not read or read as the wrong unit.
describe("numbers with their working, reasons, brackets and units, read as written", () => {
  test.each([
    ["300 mA = 0.3 A, V = 0.3 × 45 = 13.5 V", { value: 13.5, unit: "V" }],
    ["1/R = 1/40 + 1/60, R = 24 Ω", { value: 24, unit: "Ω" }],
    ["R = 24 Ω, because 1/R = 1/40 + 1/60", { value: 24, unit: "Ω" }],
    ["P = I × V = 36 W", { value: 36, unit: "W" }],
    ["5 A because the current is the same everywhere in series", { value: 5, unit: "A" }],
    ["36 (C)", { value: 36, unit: "C" }],
    ["4800 seconds (80 minutes)", { value: 4800, unit: "s" }],
    ["1 hour 20 minutes", { value: 4800, unit: "s" }],
    ["2 minutes 30 seconds", { value: 150, unit: "s" }],
    ["a 13 A fuse", { value: 13, unit: "A" }],
    ["9 mmol/L", { value: 9, unit: "mmol/dm³" }],
    ["9mmol/dm3", { value: 9, unit: "mmol/dm³" }],
    ["0.35 litres", { value: 0.35, unit: "dm³" }],
    ["350 cm³", { value: 0.35, unit: "dm³" }],
    ["5.7 GJ", { value: 5700, unit: "MJ" }],
    ["1.32 kC", { value: 1320, unit: "C" }],
    ["5 × 10⁻³ mol", { value: 0.005, unit: "mol" }],
    ["5 mmol", { value: 0.005, unit: "mol" }],
  ])("%s", (typed, key) => {
    expect(checkNumeric(typed, { ...key, tolerance: { type: "absolute", value: 1e-6 } }).correct).toBe(true);
  });
  test("a pair of values, a wrong unit and a wrong size stay wrong", () => {
    expect(checkNumeric("x = 5, y = 3", { value: 5 }).correct).toBe(false);
    expect(checkNumeric("13.5 A", { value: 13.5, unit: "V" }).correct).toBe(false);
    expect(checkNumeric("5.7 MJ", { value: 5700, unit: "MJ" }).correct).toBe(false);
    expect(checkNumeric("0.35 cm³", { value: 0.35, unit: "dm³" }).correct).toBe(false);
    expect(checkNumeric("because it is 24", { value: 24 }).correct).toBe(false);
  });
});

// The parts' own worked solutions typed into the box (the guard, 27 Sep 2026): the answer is the last clause's value,
// a check after it is not the answer, and a sentence starting "Since" is working, not a reason.
describe("the answer at the end of a line of working", () => {
  test.each([
    [String.raw`V = \pi(12)^2(30) = 13571.68 cm³. Since 1 litre = 1000 cm³, that is 13571.68 \div 1000 = 13.5717 litres, so 13.6 litres.`, 13.6, "l"],
    [String.raw`1.5 km = 1500 m and 5 minutes = 300 s, so the average speed is \dfrac{1500}{300} = 5 m/s.`, 5, "m/s"],
    ["Resolving vertically: R + 50 sin 30° = 80, so R = 80 - 25 = 55 N.", 55, "N"],
    ["Speed = 5 m/s; time = 20 s, so distance = 100 m", 100, "m"],
    ["20 × 3 = 60. So 60 cm", 60, "cm"],
    ["x = 4. Check: 2(4) + 1 = 9", 4, undefined],
    ["The answer is 7", 7, undefined],
    ["It is 5 m", 5, "m"],
    ["60 cm (to the nearest cm)", 60, "cm"],
    ["0.25 A, since I = V ÷ R", 0.25, "A"],
  ])("%s", (typed, value, unit) => {
    expect(checkNumeric(typed, { value, ...(unit ? { unit } : {}), tolerance: { type: "absolute", value: 1e-6 } }).correct).toBe(true);
  });
  test("two answers, or a pair, are still not one value", () => {
    expect(checkNumeric("4 or -4", { value: 4 }).correct).toBe(false);
    expect(checkNumeric("x = 5, y = 3", { value: 3 }).correct).toBe(false);
  });
});

// The guard's review of the worked solutions typed into the box (27 Sep 2026): one regression and five misreadings.
describe("worked-solution lines the box misread", () => {
  test.each([
    [String.raw`Weight = 15 \times 10 = 150 N. Resolving along the slope: T = 150\sin 32° = 79.49 N.`, { value: 79.49, unit: "N" }],
    ["T = 150 sin 32 = 79.49 N", { value: 79.49, unit: "N" }],
    [String.raw`Late shift: \sum x = 870 over 15 hours, so the mean is 58 loaves an hour.`, { value: 58, unit: "loaves" }],
    ["58 loaves", { value: 58, unit: "loaves an hour" }],
    [String.raw`V = \pi(30)^2(90) = 254469.0049 cm³, so 254469 cm³ to the nearest cubic centimetre.`, { value: 254469, unit: "cm³" }],
    [String.raw`When x = 10: (10 + 3)(10 - 3) = 13 \times 7 = 91 \text{ m}^2, which agrees with 100 - 9 = 91.`, { value: 91, unit: "m²" }],
    [String.raw`Frustum = 2638.9 cm³. Dividing, 2638.9 \div 250 = 10.56, so 10 containers can be filled completely.`, { value: 10, unit: "containers" }],
    [String.raw`320 \div 5 = 64, and this is k^3. So k = \sqrt[3]{64} = 4, because 4^3 = 64.`, { value: 4 }],
    ["4.24 to 3 s.f.", { value: 4.24 }],
    ["13.6 (1 d.p.)", { value: 13.6 }],
  ])("%s", (typed, key) => {
    expect(checkNumeric(typed, { ...key, tolerance: { type: "absolute", value: 0.005 } }).correct).toBe(true);
  });
  test("a rate is not the count it counts", () => {
    expect(checkNumeric("12 breaths per minute", { value: 12, unit: "breaths", tolerance: { type: "absolute", value: 0.005 } }).correct).toBe(false);
  });
});

// The FM2 and P2 reviews (27 Sep 2026): natural forms of an answer the box could not read.
describe("labels, solved equations, directions and units as written", () => {
  test.each([
    ["θ = 31.89", 31.89, "°"],
    ["θ = 31.89°", 31.89, "°"],
    ["λ = 0.03 m", 0.03, "m"],
    ["3R = 112.5", 112.5, "N"],
    ["20 = 5a, a = 4", 4, undefined],
    ["5R = 1050, R = 210", 210, "N"],
    ["25 + F = 40, F = 15", 15, "N"],
    ["0.9 m beyond D", 0.9, "m"],
    ["1.2 m to the left of A", 1.2, "m"],
    ["67.88 N at 45°", 67.88, "N"],
    ["5 m/s/s", 5, "m/s²"],
  ])("%s", (typed, value, unit) => {
    expect(checkNumeric(typed, { value, ...(unit ? { unit } : {}), tolerance: { type: "absolute", value: 0.005 } }).correct).toBe(true);
  });
  test("two symbols' values stay a pair", () => {
    expect(checkNumeric("a = 6, b = 6", { value: 6 }).correct).toBe(false);
  });
});
