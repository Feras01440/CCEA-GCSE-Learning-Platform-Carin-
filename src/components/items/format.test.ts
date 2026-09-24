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
