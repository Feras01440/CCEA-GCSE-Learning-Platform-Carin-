import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HistogramSvg, LABEL_PX, frameFor, labelEvery, labelUnits } from "./generated";

/** What a label of `units` draws at in a 640-unit figure drawn `width` px wide. */
const drawnPx = (units: number, width: number) => (units * Math.min(width, 640)) / 640;

describe("generated figure labels (the figure floor, depth standard 3.5% rule)", () => {
  it("draws every label at 13 px or more at any width from a small phone to the desktop", () => {
    for (let width = 260; width <= 1200; width += 7) {
      expect(drawnPx(labelUnits(width), width), `label at ${width} px`).toBeGreaterThanOrEqual(LABEL_PX);
    }
  });

  it("meets the standard's rule on a phone: the label is at least 3.5% of the viewBox", () => {
    expect(labelUnits(358)).toBeGreaterThanOrEqual(0.035 * 640);
    // Before it is measured, the figure is sized for a phone, never for the desktop.
    expect(labelUnits(null)).toBe(labelUnits(358));
  });

  it("keeps 13-unit labels at the full 640 px, where they already draw at 13 px", () => {
    expect(labelUnits(640)).toBe(13);
    expect(labelUnits(1280)).toBe(13);
  });

  it("grows the frame for bigger labels but keeps the plot the larger part of the figure", () => {
    const desk = frameFor(13, 4);
    const phone = frameFor(labelUnits(300), 4);
    expect(phone.l).toBeGreaterThan(desk.l);
    expect(phone.b).toBeGreaterThan(desk.b);
    expect(phone.iw).toBeGreaterThan(640 * 0.6);
    expect(phone.ih).toBeGreaterThan(400 * 0.6);
  });

  it("thins tick labels only when neighbours would touch", () => {
    expect(labelEvery(9, 60, 40)).toBe(1);
    expect(labelEvery(9, 30, 40)).toBe(2);
    expect(labelEvery(1, 0, 40)).toBe(1);
  });

  it("draws bars with the figure fill token, not a fixed opacity", () => {
    const html = renderToStaticMarkup(
      createElement(HistogramSvg, {
        data: { xLabel: "Distance (km)", yLabel: "Frequency density", xMax: 80, yMax: 2, bars: [{ from: 0, to: 10, frequencyDensity: 0.8 }, { from: 10, to: 25, frequencyDensity: 1.6 }] },
      }),
    );
    expect(html).not.toContain('fill-opacity="0.18"');
    expect(html).toContain("fill-opacity:var(--fig-fill)");
    const sizes = [...html.matchAll(/font-size="([0-9.]+)"/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    for (const s of sizes) expect(s).toBeGreaterThanOrEqual(0.035 * 640);
  });
});
