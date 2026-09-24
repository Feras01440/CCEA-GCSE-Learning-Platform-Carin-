/**
 * Exact polynomial arithmetic and the shaded-region figure builder for FM1 batch F.
 * A polynomial is an array of { c: frac, p: integer power }, highest power first.
 * Every integral, limit substitution and area printed in area-under-curve comes from here.
 */
import { frac, fAdd, fSub, fMul, fNeg, fVal, fTex, fPlain, num, svgWrap, svgText, svgPath, svgLine } from "./lib.mjs";

export const term = (n, d, p) => ({ c: frac(n, d), p });
export const poly = (...terms) => terms.filter((t) => t.c.n !== 0).sort((a, b) => b.p - a.p);

/** The integral of a polynomial, term by term: a x^n -> a x^(n+1) / (n + 1). */
export const integrate = (P) => P.map((t) => ({ c: frac(t.c.n, t.c.d * (t.p + 1)), p: t.p + 1 }));

/** Exact value of a polynomial at an integer x. */
export function at(P, x) {
  if (!Number.isInteger(x)) throw new Error(`at() needs an integer x, got ${x}`);
  let s = frac(0);
  for (const t of P) s = fAdd(s, fMul(t.c, frac(x ** t.p)));
  return s;
}

/** The definite integral from a to b, exactly. */
export function definite(P, a, b) {
  const F = integrate(P);
  return fSub(at(F, b), at(F, a));
}

/** LaTeX for a polynomial, with the signs written the way a paper prints them. */
export function tex(P, { variable = "x" } = {}) {
  if (P.length === 0) return "0";
  let out = "";
  for (const [i, t] of P.entries()) {
    const neg = fVal(t.c) < 0;
    const mag = neg ? fNeg(t.c) : t.c;
    const one = mag.n === 1 && mag.d === 1;
    const body =
      t.p === 0 ? fTex(mag) : `${one ? "" : fTex(mag)}${variable}${t.p === 1 ? "" : `^{${t.p}}`}`;
    out += i === 0 ? `${neg ? "-" : ""}${body}` : ` ${neg ? "-" : "+"} ${body}`;
  }
  return out;
}

/** The integrated polynomial printed inside square brackets with its limits, as the schemes print it. */
export const bracketTex = (P, a, b) => `\\left[${tex(integrate(P))}\\right]_{${a}}^{${b}}`;

const SUPERSCRIPT = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
/**
 * The polynomial as plain text with real superscript digits ("3x² - 12"), for an SVG <text>
 * node and for a figure's title: an SVG text node renders its characters literally, so LaTeX braces
 * and carets would be shown to the learner and read out by a screen reader.
 */
export function texPlain(P, { variable = "x" } = {}) {
  if (P.length === 0) return "0";
  let out = "";
  for (const [i, t] of P.entries()) {
    const neg = fVal(t.c) < 0;
    const mag = neg ? fNeg(t.c) : t.c;
    const one = mag.n === 1 && mag.d === 1;
    const sup = t.p >= 2 ? String(t.p).split("").map((d) => SUPERSCRIPT[d]).join("") : "";
    const body = t.p === 0 ? fPlain(mag) : `${one ? "" : fPlain(mag)}${variable}${sup}`;
    out += i === 0 ? `${neg ? "−" : ""}${body}` : ` ${neg ? "−" : "+"} ${body}`;
  }
  return out;
}
/** The same, as words, for an aria-label read aloud. */
export const texSpoken = (P, { variable = "x" } = {}) =>
  texPlain(P, { variable })
    .replace(/²/g, " squared")
    .replace(/³/g, " cubed")
    .replace(/−/g, "minus ")
    .replace(/\s+/g, " ")
    .trim();

/** Real roots of a polynomial in [lo, hi], found by bisection on sign changes and snapped to exact values. */
export function rootsIn(P, lo, hi) {
  const f = (x) => P.reduce((s, t) => s + fVal(t.c) * x ** t.p, 0);
  const out = [];
  const steps = 4000;
  for (let i = 0; i < steps; i++) {
    let x0 = lo + ((hi - lo) * i) / steps;
    let x1 = lo + ((hi - lo) * (i + 1)) / steps;
    if (Math.abs(f(x0)) < 1e-12) {
      const r = Math.round(x0 * 1e6) / 1e6;
      if (!out.some((v) => Math.abs(v - r) < 1e-6)) out.push(r);
      continue;
    }
    if (f(x0) * f(x1) > 0) continue;
    for (let k = 0; k < 80; k++) {
      const m = (x0 + x1) / 2;
      if (f(x0) * f(m) <= 0) x1 = m;
      else x0 = m;
    }
    const r = Math.round(((x0 + x1) / 2) * 1e6) / 1e6;
    if (!out.some((v) => Math.abs(v - r) < 1e-6)) out.push(r);
  }
  return out;
}

/* ---- the shaded-region figure --------------------------------------------------------------- */

const W = 560;
const H = 300;
const M = { l: 52, r: 24, t: 20, b: 46 };

/**
 * A curve on axes with the region between it and the x-axis shaded between two ordinates.
 * `shade` is one or more { a, b } windows; every coordinate is computed from the polynomial.
 * Nothing that a question asks for is printed on the figure.
 */
export function regionSvg(P, { xLo, xHi, shade = [], label, marks = [], caption, splitAt = null, yLoForce, yHiForce }) {
  const f = (x) => P.reduce((s, t) => s + fVal(t.c) * x ** t.p, 0);
  const N = 240;
  const xs = Array.from({ length: N + 1 }, (_, i) => xLo + ((xHi - xLo) * i) / N);
  const ysAll = xs.map(f);
  let yLo = Math.min(0, ...ysAll);
  let yHi = Math.max(0, ...ysAll);
  if (yLoForce !== undefined) yLo = yLoForce;
  if (yHiForce !== undefined) yHi = yHiForce;
  const padY = (yHi - yLo) * 0.08 || 1;
  yLo -= padY;
  yHi += padY;
  const sx = (x) => M.l + ((x - xLo) / (xHi - xLo)) * (W - M.l - M.r);
  const sy = (y) => M.t + (1 - (y - yLo) / (yHi - yLo)) * (H - M.t - M.b);
  const p = (x, y) => `${num(Math.round(sx(x) * 10) / 10)} ${num(Math.round(sy(y) * 10) / 10)}`;

  const parts = [];

  // gridlines at integer x and at a sensible y step
  const yStep = Math.max(1, Math.round((yHi - yLo) / 8));
  const grid = [];
  for (let x = Math.ceil(xLo); x <= Math.floor(xHi); x++) grid.push(`M ${p(x, yLo)} L ${p(x, yHi)}`);
  for (let y = Math.ceil(yLo / yStep) * yStep; y <= yHi; y += yStep) grid.push(`M ${p(xLo, y)} L ${p(xHi, y)}`);
  parts.push(`<path d='${grid.join(" ")}' stroke='currentColor' stroke-width='0.5' stroke-opacity='0.15' fill='none'/>`);

  // the shaded region(s), drawn from the curve itself
  for (const win of shade) {
    const inner = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const x = win.a + ((win.b - win.a) * i) / steps;
      inner.push(`${i === 0 ? "M" : "L"} ${p(x, f(x))}`);
    }
    inner.push(`L ${p(win.b, 0)}`, `L ${p(win.a, 0)}`, "Z");
    parts.push(`<path d='${inner.join(" ")}' fill='currentColor' fill-opacity='0.16' stroke='none'/>`);
    parts.push(`<path d='M ${p(win.b, 0)} L ${p(win.b, f(win.b))}' stroke='currentColor' stroke-width='1' stroke-dasharray='4 3' fill='none'/>`);
    parts.push(`<path d='M ${p(win.a, 0)} L ${p(win.a, f(win.a))}' stroke='currentColor' stroke-width='1' stroke-dasharray='4 3' fill='none'/>`);
  }

  // axes
  if (yLo < 0 && yHi > 0) parts.push(`<path d='M ${p(xLo, 0)} L ${p(xHi, 0)}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  if (xLo < 0 && xHi > 0) parts.push(`<path d='M ${p(0, yLo)} L ${p(0, yHi)}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  else parts.push(`<path d='M ${p(xLo, yLo)} L ${p(xLo, yHi)}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);

  // x ticks
  for (let x = Math.ceil(xLo); x <= Math.floor(xHi); x++) {
    if (x === 0 && xLo < 0 && xHi > 0) continue;
    const yAxis = yLo < 0 && yHi > 0 ? 0 : yLo;
    parts.push(`<path d='M ${p(x, yAxis)} L ${num(Math.round(sx(x) * 10) / 10)} ${num(Math.round((sy(yAxis) + 6) * 10) / 10)}' stroke='currentColor' stroke-width='1' fill='none'/>`);
    parts.push(svgText(Math.round(sx(x) * 10) / 10, Math.round((sy(yAxis) + 19) * 10) / 10, String(x), { size: 11 }));
  }
  // y ticks
  for (let y = Math.ceil(yLo / yStep) * yStep; y <= yHi; y += yStep) {
    if (y === 0) continue;
    const xAxis = xLo < 0 && xHi > 0 ? 0 : xLo;
    parts.push(`<path d='M ${num(Math.round((sx(xAxis) - 5) * 10) / 10)} ${num(Math.round(sy(y) * 10) / 10)} L ${p(xAxis, y)}' stroke='currentColor' stroke-width='1' fill='none'/>`);
    parts.push(svgText(Math.round((sx(xAxis) - 9) * 10) / 10, Math.round((sy(y) + 4) * 10) / 10, String(y), { size: 11, anchor: "end" }));
  }

  // the curve
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${p(x, f(x))}`).join(" ");
  parts.push(`<path d='${d}' stroke='currentColor' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>`);

  if (splitAt !== null) {
    parts.push(`<path d='M ${p(splitAt, yLo)} L ${p(splitAt, yHi)}' stroke='currentColor' stroke-width='1.2' stroke-dasharray='5 4' fill='none'/>`);
  }
  for (const m of marks) parts.push(`<circle cx='${num(Math.round(sx(m.x) * 10) / 10)}' cy='${num(Math.round(sy(m.y) * 10) / 10)}' r='3.4' fill='currentColor'/>`);
  for (const m of marks) if (m.text) parts.push(svgText(Math.round((sx(m.x) + (m.dx ?? 0)) * 10) / 10, Math.round((sy(m.y) + (m.dy ?? -10)) * 10) / 10, m.text, { size: 11 }));

  parts.push(svgText(W - M.r, Math.round((sy(yLo < 0 && yHi > 0 ? 0 : yLo) - 8) * 10) / 10, "x", { size: 12, anchor: "end" }));
  parts.push(svgText(Math.round((sx(xLo < 0 && xHi > 0 ? 0 : xLo) + 10) * 10) / 10, M.t + 4, "y", { size: 12, anchor: "start" }));
  if (label) parts.push(svgText(W / 2, H - 8, label, { size: 11.5 }));

  return svgWrap(`0 0 ${W} ${H}`, caption, parts.join(""));
}

export { frac, fAdd, fSub, fMul, fNeg, fVal, fTex, fPlain };
