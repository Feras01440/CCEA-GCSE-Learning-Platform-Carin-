import { describe, expect, test } from "vitest";
import {
  formatExaminerSource,
  formatMs,
  formatSeries,
  formatValue,
  humaniseKebab,
  humaniseMisconception,
  optionLetter,
  relativeTime,
  shortExaminerSource,
  rationalOf,
  spellInForm,
} from "./format";

describe("examiner sources", () => {
  test("full and short citations", () => {
    expect(formatExaminerSource("ccea-cer:maths:2025-summer:M4:Q22")).toBe("CCEA examiners' report · Summer 2025 · M4 Q22");
    expect(shortExaminerSource("ccea-cer:maths:2024-november:M4:Q21")).toBe("November 2024, M4 Q21");
  });
  test("unknown strings pass through", () => {
    expect(formatExaminerSource("research 03 §7.1")).toBe("research 03 §7.1");
    expect(formatSeries("Summer 2025")).toBe("Summer 2025");
  });
});

describe("small formatters", () => {
  test("misconception ids read as labels", () => {
    expect(humaniseMisconception("median.class-midpoint")).toBe("Median: class midpoint");
    expect(humaniseMisconception("hist.freq-as-height")).toBe("Hist: freq as height");
    expect(humaniseKebab("maths-numeric")).toBe("Maths numeric");
  });
  test("durations", () => {
    expect(formatMs(7000)).toBe("0:07");
    expect(formatMs(102_345)).toBe("1:42");
    expect(formatMs(3_909_000)).toBe("1:05:09");
  });
  test("relative time", () => {
    const now = new Date("2026-09-05T12:00:00Z");
    expect(relativeTime(new Date("2026-09-05T09:00:00Z"), now)).toBe("today");
    expect(relativeTime(new Date("2026-09-04T09:00:00Z"), now)).toBe("yesterday");
    expect(relativeTime(new Date("2026-09-01T09:00:00Z"), now)).toBe("4 days ago");
    expect(relativeTime(new Date("2026-08-01T09:00:00Z"), now)).toBe("5 weeks ago");
    expect(relativeTime(new Date("2026-03-01T09:00:00Z"), now)).toBe("6 months ago");
    expect(relativeTime(new Date("2025-01-01T09:00:00Z"), now)).toBe("a year ago");
  });
  test("letters and values", () => {
    expect(optionLetter(0)).toBe("A");
    expect(optionLetter(3)).toBe("D");
    expect(formatValue(0.1 + 0.2)).toBe("0.3");
    expect(formatValue(36.15)).toBe("36.15");
    expect(formatValue(25)).toBe("25");
  });
});

describe("a value in the form the question demands (the expected answer on the feedback card)", () => {
  test("rationals: the simplest p/q, signs in front, whole numbers bare", () => {
    expect(rationalOf(7 / 11)).toEqual([7, 11]);
    expect(rationalOf(-0.375)).toEqual([-3, 8]);
    expect(rationalOf(4)).toEqual([4, 1]);
    expect(rationalOf(Math.PI)).toBeNull();
    expect(spellInForm(0.636363636363636, "fraction")).toEqual({ plain: "7/11", tex: "\\frac{7}{11}" });
    expect(spellInForm(-0.375, "fraction")).toEqual({ plain: "-3/8", tex: "-\\frac{3}{8}" });
    expect(spellInForm(Math.sqrt(2), "fraction")).toBeNull();
  });
  test("mixed numbers keep a proper fraction as it is", () => {
    expect(spellInForm(32 / 3, "mixed")).toEqual({ plain: "10 2/3", tex: "10\\frac{2}{3}" });
    expect(spellInForm(2 / 3, "mixed")).toEqual({ plain: "2/3", tex: "\\frac{2}{3}" });
  });
  test("surds: the coefficient in front, the smallest square-free root, a rationalised denominator", () => {
    expect(spellInForm(3 * Math.sqrt(5), "surd")).toEqual({ plain: "3√5", tex: "3\\sqrt{5}" });
    expect(spellInForm(Math.sqrt(72), "surd")).toEqual({ plain: "6√2", tex: "6\\sqrt{2}" });
    expect(spellInForm(2 / Math.sqrt(3), "surd")).toEqual({ plain: "2√3/3", tex: "\\frac{2\\sqrt{3}}{3}" });
    expect(spellInForm(Math.sqrt(2) / 4, "surd")).toEqual({ plain: "√2/4", tex: "\\frac{\\sqrt{2}}{4}" });
    expect(spellInForm(9, "surd")).toEqual({ plain: "9", tex: "9" });
  });
  test("π: a rational multiple, with π on the top line", () => {
    expect(spellInForm(49 * Math.PI, "pi")).toEqual({ plain: "49π", tex: "49\\pi" });
    expect(spellInForm((2 * Math.PI) / 3, "pi")).toEqual({ plain: "2π/3", tex: "\\frac{2\\pi}{3}" });
    expect(spellInForm(Math.PI, "pi")).toEqual({ plain: "π", tex: "\\pi" });
    expect(spellInForm(Math.E, "pi")).toBeNull();
  });
  test("standard form: 1 ≤ a < 10, no float noise", () => {
    expect(spellInForm(2700, "standardForm")).toEqual({ plain: "2.7 × 10^3", tex: "2.7 \\times 10^{3}" });
    expect(spellInForm(0.0075, "standardForm")).toEqual({ plain: "7.5 × 10^-3", tex: "7.5 \\times 10^{-3}" });
    expect(spellInForm(1.04e9, "standardForm")).toEqual({ plain: "1.04 × 10^9", tex: "1.04 \\times 10^{9}" });
    expect(spellInForm(0.000405, "standardForm")?.plain).toBe("4.05 × 10^-4");
  });
});
