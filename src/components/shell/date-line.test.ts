/**
 * The date line on Today (the lead's fix of 24 September 2026 for a date baked into the static export): the eyebrow is
 * her device's own date, formatted the British way with the long weekday, read when the page runs and again whenever
 * the day can have changed under an open page. What is pure is tested here; the rendered eyebrow, the hydration and
 * the locator style are e2e/today.spec.ts's.
 */
import { describe, expect, it } from "vitest";
import { formatToday, msUntilNextDay, NBSP } from "./DateLine";

describe("the date line", () => {
  it("formats her device's date the British way, with the long weekday, and no year", () => {
    expect(formatToday(new Date("2026-09-24T18:50:00"))).toBe("Thursday 24 September");
    expect(formatToday(new Date("2027-05-14T09:15:00"))).toBe("Friday 14 May");
    expect(formatToday(new Date("2026-10-01T00:00:30"))).toBe("Thursday 1 October");
  });

  it("holds a blank of one line's height until the page runs, so nothing shifts when the date arrives", () => {
    expect(NBSP).toBe(" ");
    expect(NBSP.trim()).toBe("");
  });

  it("counts the time to the next local day, and re-arms just past midnight rather than exactly on it", () => {
    const t = msUntilNextDay(new Date("2026-09-24T23:59:00"));
    expect(t).toBeGreaterThan(60_000);
    expect(t).toBeLessThanOrEqual(60_000 + 2_000);
    const early = msUntilNextDay(new Date("2026-09-24T00:00:00.500"));
    expect(early).toBeGreaterThan(23 * 3_600_000);
    expect(early).toBeLessThanOrEqual(24 * 3_600_000 + 2_000);
  });
});
