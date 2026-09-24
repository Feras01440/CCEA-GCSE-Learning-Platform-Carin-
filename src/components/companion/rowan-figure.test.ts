/**
 * The hare, as drawn: its palette, its states, its sizes and its constancy.
 *
 * - The palette is the canvas's: every hex is recomputed from its LCH triple with the canvas's own conversion
 *   (scratchpad/platform/design-v2/lch.mjs, reproduced below), and every triple matches the token of the same name in
 *   app/globals.css, so the drawing, the canvas and the design tokens cannot drift apart.
 * - Every state and expression renders, decorative and textless, and the states differ where the sheet says they do.
 * - The slot boxes carry FIGURE_SLOTS' numbers, which the integration contract states.
 * - The identity test (companion spec §8, benchmarks page 14): the same state draws the same hare at 7 am and at
 *   11 pm, on day one and on day thirty; and the state a moment calls for never depends on the clock.
 * The port itself was checked element for element against the canvas generator's output (35 drawings identical,
 * scratchpad/platform/trial-character/verify-port.mts, 23 September 2026).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FIGURE_SLOTS,
  FIGURE_STATES,
  MOMENT_FIGURE,
  buildCompanionContext,
  figureExpressionFor,
  figureStateFor,
  type FigureExpression,
  type Moment,
} from "@/lib/companion";
import { FIXTURES } from "@/lib/companion/fixtures";
import { FIGURE_BOX } from "./CompanionFigure";
import { RowanFigure } from "./RowanFigure";
import { RowanMark } from "./RowanMark";
import { ROWAN_PALETTE } from "./rowan-palette";

const ROOT = resolve(__dirname, "../../..");

// ---- the canvas's LCH (D50) to sRGB conversion, as lch.mjs computes it -------------------------------------------
const EPS = 216 / 24389;
const KAPPA = 24389 / 27;
function lchToHex(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180;
  const [l, a, b] = [L, C * Math.cos(h), C * Math.sin(h)];
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const xr = fx ** 3 > EPS ? fx ** 3 : (116 * fx - 16) / KAPPA;
  const yr = l > KAPPA * EPS ? ((l + 16) / 116) ** 3 : l / KAPPA;
  const zr = fz ** 3 > EPS ? fz ** 3 : (116 * fz - 16) / KAPPA;
  const [x50, y50, z50] = [xr * 0.96422, yr * 1.0, zr * 0.82521];
  const x = 0.9554734527042182 * x50 + -0.023098536874261423 * y50 + 0.0632593086610217 * z50;
  const y = -0.028369706963208136 * x50 + 1.0099954580058226 * y50 + 0.021041398966943008 * z50;
  const z = 0.012314001688319899 * x50 + -0.020507696433477912 * y50 + 1.3303659366080753 * z50;
  const lin = [
    3.2409699419045226 * x + -1.537383177570094 * y + -0.4986107602930034 * z,
    -0.9692436362808796 * x + 1.8759675015077202 * y + 0.04155505740717559 * z,
    0.05563007969699366 * x + -0.20397695888897652 * y + 1.0569715142428786 * z,
  ].map((v) => Math.min(1, Math.max(0, v)));
  const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  return "#" + lin.map((v) => Math.round(gam(v) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

describe("the palette is the canvas's", () => {
  it("draws every colour with the hex the canvas computed from its LCH value", () => {
    for (const [name, entry] of Object.entries(ROWAN_PALETTE)) {
      const [L, C, H] = entry.lch;
      expect(entry.hex, name).toBe(lchToHex(L, C, H));
    }
  });

  it("agrees with the design tokens in app/globals.css, value for value", () => {
    const css = readFileSync(resolve(ROOT, "app/globals.css"), "utf8");
    let checked = 0;
    for (const [name, entry] of Object.entries(ROWAN_PALETTE) as Array<[string, { lch: readonly number[]; token?: string }]>) {
      if (!entry.token) continue;
      const m = css.match(new RegExp(`${entry.token}:\\s*lch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)\\)`));
      expect(m, `${name}: ${entry.token} is declared`).not.toBeNull();
      expect(m!.slice(1, 4).map(Number), `${name} = ${entry.token}`).toEqual([...entry.lch]);
      checked++;
    }
    expect(checked).toBeGreaterThanOrEqual(20);
  });
});

const hare = (state: (typeof FIGURE_STATES)[number], expression: FigureExpression = "attentive") =>
  renderToStaticMarkup(createElement(RowanFigure, { state, expression, size: 160 }));

describe("the hare", () => {
  it("draws every state and expression, decorative, with no text of its own", () => {
    for (const state of FIGURE_STATES) {
      for (const expression of ["attentive", "dry", "pleased"] as const) {
        const html = hare(state, expression);
        expect(html, `${state} ${expression}`).toMatch(/^<svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true" focusable="false"/);
        expect(html).not.toMatch(/<text|<title|<desc/);
        // The one warm accent, the gorse scarf, is on every pose.
        expect(html).toContain('fill="#E1C42F"');
      }
    }
  });

  it("tells the five states apart by the drawing: the wave, the tilt, the stone, the moon, the Letter", () => {
    expect(hare("arrival")).toContain('transform="rotate(-38 104 104)"'); // the near arm raised
    expect(hare("listening")).toContain('transform="rotate(-8 70 70)"'); // the head tilted
    expect(hare("stone-placed")).toContain('fill="#BD71B3"'); // the heather stone
    expect(hare("evening")).toContain('fill="#EDDCA3"'); // the moon
    expect(hare("letter")).toContain('fill="#FFFDF7"'); // the Letter's paper
    const drawn = new Set(FIGURE_STATES.map((s) => hare(s)));
    expect(drawn.size).toBe(FIGURE_STATES.length);
  });

  it("keeps its clip paths apart when two hares share a page", () => {
    const page = renderToStaticMarkup(
      createElement("div", null, createElement(RowanFigure, { state: "arrival" }), createElement(RowanFigure, { state: "letter" })),
    );
    const ids = [...page.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(4);
    expect(new Set(ids).size).toBe(4);
    for (const id of ids) expect(page).toContain(`url(#${id})`);
  });

  it("the silhouette test: in mono every form is currentColor", () => {
    const html = renderToStaticMarkup(createElement(RowanFigure, { state: "resting", mono: true }));
    const fills = [...html.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]).filter((f) => f !== "none");
    expect(new Set(fills)).toEqual(new Set(["currentColor"]));
  });

  it("Rowan's mark is the head and the ears in the ink of its line", () => {
    const html = renderToStaticMarkup(createElement(RowanMark, {}));
    expect(html).toMatch(/^<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"/);
    expect(html.match(/fill="currentColor"/g)).toHaveLength(5);
  });
});

describe("the slots are the contract's sizes", () => {
  it("draws each slot's box at FIGURE_SLOTS' phone and desktop sizes", () => {
    for (const [slot, { phone, desktop }] of Object.entries(FIGURE_SLOTS)) {
      const box = FIGURE_BOX[slot as keyof typeof FIGURE_SLOTS];
      expect(box, slot).toContain(`size-[${phone}px]`);
      expect(box, slot).toContain(`:size-[${desktop}px]`);
    }
  });

  it("asks each slot only for the states the contract gives it", () => {
    const ctx = buildCompanionContext(FIXTURES["normal-evening"]);
    const stone = buildCompanionContext(FIXTURES["close-with-stone"]);
    for (const [moment, slot] of Object.entries(MOMENT_FIGURE) as Array<[Moment, keyof typeof FIGURE_SLOTS]>) {
      for (const c of [ctx, stone]) {
        expect(FIGURE_SLOTS[slot].states as readonly string[], `${moment} in ${slot}`).toContain(figureStateFor(moment, c));
      }
    }
  });

  it("takes the face from the line's register: the five dry lines are dry, a stone placed is pleased", () => {
    expect(figureExpressionFor("dry.arrangement", "arrival")).toBe("dry");
    expect(figureExpressionFor("today.back-tonight", "arrival")).toBe("attentive");
    expect(figureExpressionFor("close.stone", "stone-placed")).toBe("pleased");
  });
});

describe("the identity test: the same hare at 7 am and 11 pm, on day one and day thirty", () => {
  afterEach(() => vi.useRealTimers());

  it("draws every state identically whatever the clock says", () => {
    const at = (iso: string) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(iso));
      const out = FIGURE_STATES.map((s) => hare(s));
      vi.useRealTimers();
      return out;
    };
    const morning = at("2026-09-24T07:00:00");
    expect(at("2026-09-24T23:00:00")).toEqual(morning);
    expect(at("2026-10-24T07:00:00")).toEqual(morning);
    expect(at("2026-10-24T23:00:00")).toEqual(morning);
  });

  it("asks for the same state from the same facts at any hour and after any gap", () => {
    const base = FIXTURES["close-with-stone"];
    const times = ["2026-09-24T07:00:00", "2026-09-24T23:00:00", "2026-10-24T07:00:00", "2026-10-24T23:00:00"];
    for (const moment of ["session-close", "topic-open", "first-letter", "today-open"] as Moment[]) {
      const states = times.map((t) => figureStateFor(moment, buildCompanionContext({ ...base, now: new Date(t) })));
      expect(new Set(states).size, moment).toBe(1);
    }
  });
});
