/**
 * FM1 batch E, topic 1: fm.u1.curve-sketching-quadratic-cubic (difficulty 3, S).
 * Every printed number is computed here; every commonError value is produced by executing the route.
 */
import fs from "node:fs";
import path from "node:path";
import {
  fr, frLatex, frText, num, add, sub, mul, div, neg,
  polyFrom, polyDeriv, polyEval, polyLatex, polyText, terms,
  stationaryPoints, quadRoots, pointLatex, pointsLatex, dp,
  graphSvg, cardSvg, svgFigure, lintTree, verLog, PAPER, AT, TOOL,
} from "./lib.mjs";

const OUT = path.resolve("packs/further-maths/content/fm1/curve-sketching-quadratic-cubic");
const TOPIC = "fm.u1.curve-sketching-quadratic-cubic";
const SPEC = ["FM1-DIF-02"];

/* ------------------------------------------------------------------ curves */

/** Everything the topic needs about one polynomial curve, computed. */
function study(coeffs, { factors = null } = {}) {
  const p = polyFrom(coeffs);
  const d1 = polyDeriv(p);
  const d2 = polyDeriv(d1);
  const f = (x) => num(polyEval(p, fr(Math.round(x * 1e6), 1e6)));
  let sps;
  try {
    sps = stationaryPoints(p);
  } catch {
    sps = null; // this curve's stationary points are irrational, so the topic never asks for them
  }
  return {
    p, d1, d2, f, sps, factors,
    latex: polyLatex(p),
    d1Latex: polyLatex(d1),
    d2Latex: polyLatex(d2),
    yIntercept: polyEval(p, fr(0)),
    at: (x) => polyEval(p, fr(x)),
  };
}

// Lesson quadratic: y = x^2 - 6x + 5
const Q1 = study({ 2: 1, 1: -6, 0: 5 });
const Q1roots = quadRoots(fr(1), fr(-6), fr(5));
// Exam-style quadratic with a negative leading coefficient: y = -x^2 + 4x + 5
const Q2 = study({ 2: -1, 1: 4, 0: 5 });
const Q2roots = quadRoots(fr(-1), fr(4), fr(5));
// Lesson cubic: y = x(x - 5)(x - 8)
const C1 = study({ 3: 1, 2: -13, 1: 40 });
const C1roots = [fr(0), fr(5), fr(8)];
// Exam-style cubic: y = (x - 2)^2 (x - 8)
const C2 = study({ 3: 1, 2: -12, 1: 36, 0: -32 });
const C2roots = [fr(2), fr(8)];
// Practice curves
const P1 = study({ 2: 1, 1: -8, 0: 12 });
const P1roots = quadRoots(fr(1), fr(-8), fr(12));
const P2 = study({ 2: 1, 1: 2, 0: -15 });
const P3 = study({ 2: 3, 1: -12, 0: 7 });
const P4 = study({ 3: 1, 2: -8, 1: 9, 0: 18 }); // (x + 1)(x - 3)(x - 6)
const P4roots = [fr(-1), fr(3), fr(6)];
const P5 = study({ 3: 1, 2: -6, 1: 9 }); // x(x - 3)^2
const P6 = study({ 2: -2, 1: 8, 0: 0 });
const P7 = study({ 2: 1, 1: 0, 0: -4 });

/* -------- assertions: nothing is printed that has not been recomputed -------- */
const assert = (ok, msg) => {
  if (!ok) throw new Error(`generator assertion failed: ${msg}`);
};
function checkDeriv(s, label) {
  // the derivative is checked numerically at three sample points against a difference quotient
  for (const x of [-1.7, 0.9, 3.3]) {
    const h = 1e-5;
    const numeric = (num(polyEval(s.p, fr(Math.round((x + h) * 1e7), 1e7))) - num(polyEval(s.p, fr(Math.round((x - h) * 1e7), 1e7)))) / (2 * h);
    const exact = num(polyEval(s.d1, fr(Math.round(x * 1e6), 1e6)));
    assert(Math.abs(numeric - exact) < 1e-3, `${label}: derivative mismatch at x = ${x} (${numeric} vs ${exact})`);
  }
}
for (const [label, s] of Object.entries({ Q1, Q2, C1, C2, P1, P2, P3, P4, P5, P6, P7 })) checkDeriv(s, label);
for (const [label, s, roots] of [["Q1", Q1, Q1roots], ["Q2", Q2, Q2roots], ["C1", C1, C1roots], ["C2", C2, C2roots], ["P1", P1, P1roots], ["P4", P4, P4roots]]) {
  for (const r of roots) assert(polyEval(s.p, r).n === 0, `${label}: ${frText(r)} is not a root`);
}
for (const [label, s] of Object.entries({ Q1, Q2, C1, C2, P2, P3, P5, P6, P7 })) {
  assert(Array.isArray(s.sps), `${label}: stationary points are needed but are not rational`);
  for (const sp of s.sps) assert(polyEval(s.d1, sp.x).n === 0, `${label}: dy/dx is not zero at x = ${frText(sp.x)}`);
}
assert(C1.sps.length === 2 && frText(C1.sps[0].x) === "2" && frText(C1.sps[0].y) === "36", "C1 maximum");
assert(frText(C1.sps[1].x) === "20/3" && frText(C1.sps[1].y) === "-400/27", "C1 minimum");
assert(frText(C2.sps[0].y) === "0" && frText(C2.sps[1].y) === "-32", "C2 stationary values");
assert(frText(P5.sps[0].y) === "4" && frText(P5.sps[1].y) === "0", "P5 stationary values");

/* ------------------------------------------------------------------ error routes */

/** Each route is executed here; nothing below is a typed literal. */
export const routes = {
  /** Differentiating and solving dy/dx = 0 when the intercepts were asked for. */
  derivativeRootsForIntercepts(s) {
    return s.sps.map((sp) => [sp.x, fr(0)]);
  },
  /** Reading the roots of a factorised form with the signs unchanged: (x - 1)(x - 5) read as x = 1 - no, as x = -1, -5. */
  rootSignsFlipped(roots) {
    return roots.map((r) => [neg(r), fr(0)]);
  },
  /** Substituting the stationary x into dy/dx instead of into y, so the height comes out as zero. */
  turningYFromDerivative(s, i = 0) {
    const x = s.sps[i].x;
    return [x, polyEval(s.d1, x)];
  },
  /** Writing the turning point as (y, x). */
  coordsSwapped(s, i = 0) {
    return [s.sps[i].y, s.sps[i].x];
  },
  /** Adding (0, 0) to a cubic's list of axis crossings out of habit. */
  originAdded(points) {
    const withOrigin = [...points.map(([x, y]) => [x, y]), [fr(0), fr(0)]];
    const seen = new Set();
    return withOrigin
      .filter(([x, y]) => {
        const k = `${frText(x)},${frText(y)}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort((a, b) => num(sub(a[0], b[0])));
  },
  /** Giving the y-intercept as the constant with the sign taken from the x-axis working. */
  yInterceptSignFlipped(s) {
    return [fr(0), neg(s.yIntercept)];
  },
  /** Solving dy/dx = 0 but dividing by the coefficient of x only, forgetting the coefficient of x squared. */
  stationaryXFromLinearTermOnly(s) {
    const b = s.d1.get(1) ?? fr(0);
    const c = s.d1.get(0) ?? fr(0);
    return div(neg(c), b);
  },
};

/* ------------------------------------------------------------------ figures */

const heroSvg = graphSvg({
  xMin: -1.6, xMax: 7.2, yMin: -6, yMax: 7.5, xStep: 1, yStep: 1, width: 560, height: 350,
  curves: [{ f: Q1.f }],
  verticals: [{ x: num(Q1.sps[0].x), from: 0, to: num(Q1.sps[0].y) }],
  points: [
    [Q1roots[0], fr(0), "end", -10],
    [Q1roots[1], fr(0), "start", -10],
    [fr(0), Q1.yIntercept, "start", -8],
    [Q1.sps[0].x, Q1.sps[0].y, "start", 16],
  ].map(([x, y, anchor, dy]) => ({ x: num(x), y: num(y), label: `(${frText(x)}, ${frText(y)})`, anchor, dy })),
  aria: `The curve y = ${polyText(Q1.p)} with the two x-axis crossings, the y-axis crossing and the turning point all marked and labelled with their coordinates`,
  footer: "four labelled points, and the curve follows",
});

/**
 * The same two curves with nothing marked on them: the worked examples ask for the crossings and
 * the turning point, so their figure shows the shape only. The labelled copies stay in the note,
 * where the values have already been worked out.
 */
const heroPlainSvg = graphSvg({
  xMin: -1.6, xMax: 7.2, yMin: -6, yMax: 7.5, xStep: 1, yStep: 1, width: 560, height: 350,
  curves: [{ f: Q1.f }],
  aria: `The curve y = ${polyText(Q1.p)} drawn on labelled axes, with no points marked on it`,
  footer: "the shape only: the crossings and the turning point are yours to find",
});

const cubicPlainSvg = graphSvg({
  xMin: -1.2, xMax: 9.2, yMin: -22, yMax: 42, xStep: 1, yStep: 5, width: 560, height: 360,
  curves: [{ f: C1.f }],
  aria: `The cubic y = x(x - 5)(x - 8) drawn on labelled axes, with no points marked on it`,
  footer: "the shape only: the crossings and both turning points are yours to find",
});

const shapeCardSvg = (() => {
  const W = 560, H = 230;
  const boxes = [
    { title: "positive x²", f: (x) => x * x - 2, yMin: -3, yMax: 4 },
    { title: "negative x²", f: (x) => 2 - x * x, yMin: -4, yMax: 3 },
    { title: "positive x³", f: (x) => 0.55 * x * x * x - 1.4 * x, yMin: -3.4, yMax: 3.4 },
    { title: "negative x³", f: (x) => -0.55 * x * x * x + 1.4 * x, yMin: -3.4, yMax: 3.4 },
  ];
  const parts = [];
  boxes.forEach((b, i) => {
    const bx = 14 + i * 136;
    const by = 44;
    const bw = 122, bh = 130;
    const xMin = -2.2, xMax = 2.2;
    const sx = (x) => bx + ((x - xMin) / (xMax - xMin)) * bw;
    const sy = (y) => by + bh - ((y - b.yMin) / (b.yMax - b.yMin)) * bh;
    parts.push(`<rect x='${bx}' y='${by}' width='${bw}' height='${bh}' rx='6' fill='currentColor' fill-opacity='0.05' stroke='currentColor' stroke-width='1'/>`);
    parts.push(`<path d='M ${bx} ${sy(0).toFixed(1)} L ${bx + bw} ${sy(0).toFixed(1)} M ${sx(0).toFixed(1)} ${by} L ${sx(0).toFixed(1)} ${by + bh}' stroke='currentColor' stroke-width='0.9' stroke-opacity='0.5' fill='none'/>`);
    const pts = [];
    for (let k = 0; k <= 80; k++) {
      const x = xMin + ((xMax - xMin) * k) / 80;
      const y = b.f(x);
      if (y < b.yMin || y > b.yMax) { pts.push(null); continue; }
      pts.push(`${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
    }
    let d = "";
    let pen = false;
    for (const q of pts) {
      if (q === null) { pen = false; continue; }
      d += `${pen ? " L " : " M "}${q}`;
      pen = true;
    }
    parts.push(`<path d='${d.trim()}' stroke='currentColor' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>`);
    parts.push(`<text x='${bx + bw / 2}' y='${by - 10}' font-family='inherit' font-size='12' fill='currentColor' text-anchor='middle'>${b.title}</text>`);
  });
  parts.push(`<text x='${W / 2}' y='22' font-family='inherit' font-size='13' fill='currentColor' fill-opacity='0.8' text-anchor='middle'>the sign of the highest power decides the shape</text>`);
  parts.push(`<text x='${W / 2}' y='${H - 10}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='middle'>a cubic ends up where its highest power sends it</text>`);
  const aria = "Four small sketches: a U-shaped quadratic, an upside-down quadratic, a cubic rising to the right and a cubic falling to the right";
  const svg = `<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${aria}'><title>${aria}</title>${parts.join("")}</svg>`;
  if (/NaN|undefined/.test(svg)) throw new Error("shape card carries a generator slip");
  return svg;
})();

const cubicSvg = graphSvg({
  xMin: -1.2, xMax: 9.2, yMin: -22, yMax: 42, xStep: 1, yStep: 5, width: 560, height: 360,
  curves: [{ f: C1.f }],
  verticals: [
    { x: num(C1.sps[0].x), from: 0, to: num(C1.sps[0].y) },
    { x: num(C1.sps[1].x), from: 0, to: num(C1.sps[1].y) },
  ],
  points: [
    { x: 0, y: 0, label: "(0, 0)", anchor: "end", dy: 14 },
    { x: 5, y: 0, label: "(5, 0)", anchor: "end", dy: 14 },
    { x: 8, y: 0, label: "(8, 0)", anchor: "start", dy: 14 },
    { x: num(C1.sps[0].x), y: num(C1.sps[0].y), label: `(${frText(C1.sps[0].x)}, ${frText(C1.sps[0].y)})`, anchor: "start", dy: -9 },
    { x: num(C1.sps[1].x), y: num(C1.sps[1].y), label: `(${dp(C1.sps[1].x, 2)}, ${dp(C1.sps[1].y, 2)})`, anchor: "start", dy: 16 },
  ],
  aria: `The cubic y = ${polyText(C1.p)} crossing the x-axis at 0, 5 and 8, with a maximum at (2, 36) and a minimum near (${dp(C1.sps[1].x, 2)}, ${dp(C1.sps[1].y, 2)})`,
  footer: "three crossings, one maximum, one minimum",
});

const derivativeSvg = (() => {
  const W = 560, H = 300;
  const PAD = { l: 44, r: 22, t: 20, b: 40 };
  const xMin = -1.4, xMax = 7.4, yMin = -8, yMax = 8;
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const sx = (x) => PAD.l + ((x - xMin) / (xMax - xMin)) * iw;
  const sy = (y) => PAD.t + ih - ((y - yMin) / (yMax - yMin)) * ih;
  const parts = [];
  const grid = [];
  for (let x = -1; x <= 7; x++) grid.push(`M ${sx(x).toFixed(1)} ${PAD.t} L ${sx(x).toFixed(1)} ${PAD.t + ih}`);
  for (let y = -8; y <= 8; y += 2) grid.push(`M ${PAD.l} ${sy(y).toFixed(1)} L ${PAD.l + iw} ${sy(y).toFixed(1)}`);
  parts.push(`<path d='${grid.join(" ")}' stroke='currentColor' stroke-width='0.5' stroke-opacity='0.16' fill='none'/>`);
  parts.push(`<path d='M ${PAD.l} ${sy(0).toFixed(1)} L ${PAD.l + iw} ${sy(0).toFixed(1)} M ${sx(0).toFixed(1)} ${PAD.t} L ${sx(0).toFixed(1)} ${PAD.t + ih}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  const line = [];
  for (let k = 0; k <= 120; k++) {
    const x = xMin + ((xMax - xMin) * k) / 120;
    const y = num(polyEval(Q1.d1, fr(Math.round(x * 1e5), 1e5)));
    if (y < yMin || y > yMax) continue;
    line.push(`${line.length ? "L" : "M"} ${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`);
  }
  parts.push(`<path d='${line.join(" ")}' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round'/>`);
  const xr = num(Q1.sps[0].x);
  parts.push(`<circle cx='${sx(xr).toFixed(1)}' cy='${sy(0).toFixed(1)}' r='3.6' fill='currentColor'/>`);
  parts.push(`<text x='${(sx(xr) + 8).toFixed(1)}' y='${(sy(0) - 9).toFixed(1)}' font-family='inherit' font-size='11.5' fill='currentColor'>gradient zero at x = ${frText(Q1.sps[0].x)}</text>`);
  parts.push(`<text x='${(sx(1)).toFixed(1)}' y='${(sy(-5)).toFixed(1)}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='middle'>gradient negative</text>`);
  parts.push(`<text x='${(sx(5.6)).toFixed(1)}' y='${(sy(5.4)).toFixed(1)}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='middle'>gradient positive</text>`);
  parts.push(`<text x='${PAD.l + iw}' y='${(sy(0) - 8).toFixed(1)}' font-family='inherit' font-size='12' fill='currentColor' text-anchor='end'>x</text>`);
  parts.push(`<text x='${(sx(0) + 8).toFixed(1)}' y='${PAD.t + 10}' font-family='inherit' font-size='12' fill='currentColor'>dy/dx</text>`);
  const aria = `The gradient function dy/dx = ${polyText(Q1.d1)} drawn as a straight line, negative before x = 3, zero at x = 3 and positive after it`;
  const svg = `<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${aria}'><title>${aria}</title>${parts.join("")}</svg>`;
  if (/NaN|undefined/.test(svg)) throw new Error("derivative figure carries a generator slip");
  return svg;
})();

const routeCard = cardSvg({
  title: "the five things a sketch has to show",
  rows: [
    ["1  where it meets the x-axis", "set y = 0 and factorise"],
    ["2  where it meets the y-axis", "set x = 0"],
    ["3  the turning points", "solve dy/dx = 0, then find y"],
    ["4  maximum or minimum", "the sign of the second derivative"],
    ["5  the overall shape", "the sign of the highest power"],
  ],
  footer: "no calculus in rows 1 and 2, all calculus in rows 3 and 4",
});

const examQ1Svg = graphSvg({
  xMin: -2.4, xMax: 6.4, yMin: -6, yMax: 11, xStep: 1, yStep: 1, width: 560, height: 340,
  curves: [],
  aria: "Empty labelled axes for the sketch, x from -2 to 6 and y from -6 to 11",
  footer: "your sketch goes here on paper; on screen, tap the four key points",
  notes: [{ x: 3.4, y: -4, text: "tap each key point", anchor: "middle" }],
});

const c2Svg = graphSvg({
  xMin: -0.8, xMax: 9.2, yMin: -40, yMax: 14, xStep: 1, yStep: 5, width: 560, height: 350,
  curves: [{ f: C2.f }],
  points: [
    { x: 0, y: num(C2.yIntercept), label: `(0, ${frText(C2.yIntercept)})`, anchor: "start", dy: 14 },
    { x: 2, y: 0, label: "(2, 0)", anchor: "middle", dy: -10 },
    { x: 8, y: 0, label: "(8, 0)", anchor: "start", dy: -10 },
    { x: num(C2.sps[1].x), y: num(C2.sps[1].y), label: `(${frText(C2.sps[1].x)}, ${frText(C2.sps[1].y)})`, anchor: "start", dy: 16 },
  ],
  aria: `The cubic y = (x - 2) squared times (x - 8): it touches the x-axis at 2, crosses at 8, meets the y-axis at ${frText(C2.yIntercept)} and has a minimum at (6, -32)`,
  footer: "a repeated factor makes the curve touch the axis and turn there",
});

/* ------------------------------------------------------------------ note blocks */

const note = [
  {
    type: "hero",
    lede: "A sketch is not a drawing done by eye. It is five facts about one curve: where it crosses each axis, where it turns, whether each turn is a peak or a dip, and which way the ends go. Find those and the picture draws itself.",
    can: [
      "Find where a quadratic or cubic meets both axes without touching calculus",
      "Locate every turning point from dy/dx = 0 and name it a maximum or a minimum",
      "Draw a sketch whose labelled points agree with the values you calculated",
    ],
    minutes: 16,
  },
  { type: "h", text: "Five facts, then a picture" },
  {
    type: "p",
    md: "Anyone can join dots. A sketch is different: you work out a handful of exact points first, mark them, and let the curve pass through them.\nThat is why a sketch can be marked. The examiner is not looking at your artistry, only at whether the picture agrees with the numbers you found."
  },
  { type: "figure", alt: `The curve y equals x squared minus 6x plus 5 with the crossings at (1, 0) and (5, 0), the y-axis crossing at (0, 5) and the turning point at (3, -4) all labelled`, svg: heroSvg, caption: `Four points fix this curve: $(1, 0)$, $(5, 0)$, $(0, 5)$ and $(3, -4)$.` },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "One tap to begin. In the picture, which point is where the curve meets the $y$-axis?",
    options: ["$(0, 5)$", "$(5, 0)$", "$(3, -4)$"],
    answer: "$(0, 5)$",
    explain: "The $y$-axis is the line $x = 0$, so its crossing always has $0$ as the first coordinate."
  },
  { type: "h", text: "1. The two crossings need no calculus" },
  {
    type: "p",
    md: `Every point on the $x$-axis has $y = 0$, so put $0$ in place of $y$ and solve.\nFor $y = ${Q1.latex}$ that gives $${polyText(Q1.p)} = 0$, which factorises to $(x - ${frText(Q1roots[0])})(x - ${frText(Q1roots[1])}) = 0$, so $x = ${frText(Q1roots[0])}$ or $x = ${frText(Q1roots[1])}$.\nEvery point on the $y$-axis has $x = 0$, so put $0$ in place of $x$: $y = ${frText(Q1.yIntercept)}$.`
  },
  { type: "figure", alt: "A five-row card listing what a sketch must show and how each item is found", svg: routeCard, caption: "Rows 1 and 2 are algebra. Rows 3 and 4 are where calculus starts." },
  {
    type: "gate",
    id: "g1a",
    kind: "choice",
    prompt: "In the card, which rows are done without any calculus?",
    options: ["Rows 1 and 2, the two crossings", "Rows 3 and 4, the turning points", "Row 5, the overall shape"],
    answer: "Rows 1 and 2, the two crossings",
    explain: "Setting $y = 0$ and setting $x = 0$ are both algebra. The derivative is not needed until row 3.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the answers are coordinates, not numbers",
    md: "Solving gives you the $x$ values only. A crossing is a place on the page, so it needs both numbers: the $x$ you solved for, and the $y$ that goes with it, which on the $x$-axis is always $0$. Writing the bare values loses the accuracy mark even when the algebra was perfect."
  },
  {
    type: "gate",
    id: "g2",
    kind: "blank",
    prompt: `The curve $y = (x - 2)(x + 7)$ meets the $x$-axis where $x = 2$ and where $x$ = ___`,
    answer: "-7",
    explain: "A product is zero when a bracket is zero, and $x + 7 = 0$ gives $x = -7$. The sign always flips as the bracket is solved."
  },
  { type: "h", text: "2. Turning points come from dy/dx = 0" },
  {
    type: "p",
    md: `At a peak or a dip the curve is momentarily level, so its gradient is zero there. That is the whole idea, and it is why differentiation belongs here and nowhere earlier in the question.\nFor $y = ${Q1.latex}$, $\\frac{dy}{dx} = ${Q1.d1Latex}$. Setting that to zero gives $x = ${frText(Q1.sps[0].x)}$.`
  },
  { type: "figure", alt: "The gradient function drawn as a straight line, negative before x = 3, zero at x = 3 and positive after it", svg: derivativeSvg, caption: `The gradient itself is a graph. It crosses zero once, at $x = ${frText(Q1.sps[0].x)}$.` },
  {
    type: "p",
    md: `Now the height. Put that $x$ back into the **curve**, not into the derivative: $y = ${polyText(Q1.p).replace(/x/g, `(${frText(Q1.sps[0].x)})`)}$, which is $${frText(Q1.sps[0].y)}$.\nSo the turning point is $${pointLatex(Q1.sps[0].x, Q1.sps[0].y)}$. Substituting into $\\frac{dy}{dx}$ instead would give $0$ every time, which is the commonest way this coordinate goes wrong.`
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: `The curve $y = x^{2} - 10x + 3$ has $\\frac{dy}{dx} = 2x - 10$. At what value of $x$ is the turning point?`,
    answer: "5",
    explain: "Set $2x - 10 = 0$, so $2x = 10$ and $x = 5$. The height is then found by putting $5$ into the curve."
  },
  { type: "h", text: "3. Peak or dip, decided by the second derivative" },
  {
    type: "p",
    md: `Differentiate a second time. If $\\frac{d^{2}y}{dx^{2}}$ is **positive** at the point, the gradient is on its way up through zero, so the curve is a dip: a **minimum**. If it is **negative**, the gradient is falling through zero and the curve is a peak: a **maximum**.\nHere $\\frac{d^{2}y}{dx^{2}} = ${Q1.d2Latex}$, which is positive, so $${pointLatex(Q1.sps[0].x, Q1.sps[0].y)}$ is a minimum.`
  },
  { type: "figure", alt: "Four small sketches showing the shape of a positive quadratic, a negative quadratic, a positive cubic and a negative cubic", svg: shapeCardSvg, caption: "The sign of the highest power decides which way the ends of the curve go." },
  {
    type: "gate",
    id: "g4",
    kind: "choice",
    prompt: "A curve has $\\frac{d^{2}y}{dx^{2}} = -6$ at its turning point. What kind of point is it?",
    options: ["A maximum", "A minimum", "Neither, because the value is negative"],
    answer: "A maximum",
    explain: "A negative second derivative means the gradient is falling as it passes through zero, so the curve rises to the point and then drops away."
  },
  { type: "h", text: "4. The whole route on one quadratic" },
  {
    type: "p",
    md: `Take $y = ${Q2.latex}$.\n**Crossings.** $y = 0$ gives $-(x - ${frText(Q2roots[1])})(x + ${frText(neg(Q2roots[0]))}) = 0$, so the curve meets the $x$-axis at $${pointLatex(Q2roots[0], fr(0))}$ and $${pointLatex(Q2roots[1], fr(0))}$, and $x = 0$ gives $${pointLatex(fr(0), Q2.yIntercept)}$.\n**Turning point.** $\\frac{dy}{dx} = ${Q2.d1Latex}$, which is zero at $x = ${frText(Q2.sps[0].x)}$, and then $y = ${frText(Q2.sps[0].y)}$.\n**Nature.** $\\frac{d^{2}y}{dx^{2}} = ${Q2.d2Latex}$, negative, so $${pointLatex(Q2.sps[0].x, Q2.sps[0].y)}$ is a maximum.`
  },
  {
    type: "video",
    videoId: "hs-HC9gpZu4",
    title: "Differentiation - Curve Sketching CCEA GCSE Further Mathematics",
    channel: "P McAleavey",
    why: "A Northern Ireland teacher working the same route against this specification, at a slower pace."
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `For $y = ${Q2.latex}$ the turning point is at $x = ${frText(Q2.sps[0].x)}$. What is the $y$ coordinate there?`,
    answer: "9",
    explain: `Put $${frText(Q2.sps[0].x)}$ into the curve: $-(${frText(Q2.sps[0].x)})^{2} + 4(${frText(Q2.sps[0].x)}) + 5 = ${frText(Q2.sps[0].y)}$. Putting it into $\\frac{dy}{dx}$ would give $0$, which is the height of nothing.`
  },
  { type: "h", text: "5. Cubics: three crossings and two turns" },
  {
    type: "p",
    md: `A cubic given in factorised form hands you its crossings. For $y = x(x - 5)(x - 8)$ the product is zero when any bracket is, so the curve meets the $x$-axis at $${pointsLatex([[fr(0), fr(0)], [fr(5), fr(0)], [fr(8), fr(0)]])}$.\nExpanded it is $y = ${C1.latex}$, so $\\frac{dy}{dx} = ${C1.d1Latex}$, and $(3x - 20)(x - 2) = 0$ gives $x = ${frText(C1.sps[0].x)}$ and $x = ${frLatex(C1.sps[1].x)}$.`
  },
  { type: "figure", alt: `The cubic y = x(x - 5)(x - 8) with its three x-axis crossings and its two turning points marked`, svg: cubicSvg, caption: `A cubic turns twice: a maximum at $${pointLatex(C1.sps[0].x, C1.sps[0].y)}$ and a minimum at $\\left(${frLatex(C1.sps[1].x)}, ${frLatex(C1.sps[1].y)}\\right)$.` },
  {
    type: "gate",
    id: "g5a",
    kind: "number",
    prompt: "How many times does the curve $y = x(x - 5)(x - 8)$ meet the $x$-axis?",
    answer: "3",
    explain: "Three brackets, each zero at a different value of $x$, so three separate crossings: $0$, $5$ and $8$.",
  },
  {
    type: "p",
    md: `The heights are $y = ${frText(C1.sps[0].y)}$ and $y = ${frLatex(C1.sps[1].y)}$, or about $${dp(C1.sps[1].y, 2)}$ as a decimal.\nTurning points are often fractions. Keep them exact in your answer and use the decimal only when you place the point on the sketch.`
  },
  {
    type: "callout",
    kind: "why",
    title: "Why one maximum and one minimum",
    md: "$\\frac{dy}{dx}$ of a cubic is a quadratic, so it can be zero at most twice. When it is zero twice the curve turns twice, and between the two turns it must travel the other way. So a cubic with two turning points always has exactly one of each, in the order the shape demands."
  },
  {
    type: "gate",
    id: "g6",
    kind: "choice",
    prompt: "You find a cubic has a maximum at $(1, 2)$ and a minimum at $(4, 9)$. What does that tell you?",
    options: [
      "There is an error, because the minimum cannot sit above the maximum",
      "Nothing, because a cubic may turn either way round",
      "That the cubic has a negative coefficient of $x^{3}$"
    ],
    answer: "There is an error, because the minimum cannot sit above the maximum",
    explain: "Between a maximum and the minimum that follows it, the curve only falls. A minimum higher than the maximum before it is impossible, so a value has gone astray."
  },
  { type: "h", text: "6. Drawing it, and labelling it" },
  {
    type: "p",
    md: `Mark every point you calculated, write its coordinates beside it, then draw one smooth curve through them with the right end behaviour.\nA quadratic is a single U, the right way up when the $x^{2}$ coefficient is positive. A cubic with a positive $x^{3}$ coefficient comes up from the bottom left and leaves at the top right, and a negative one does the opposite.`
  },
  { type: "figure", alt: `The cubic y = (x - 2) squared times (x - 8), touching the x-axis at 2 and crossing at 8, with the y-intercept and the minimum labelled`, svg: c2Svg, caption: `A repeated factor makes the curve touch the axis at $(2, 0)$ and turn there.` },
  {
    type: "callout",
    kind: "notonspec",
    title: "What you are never asked to sketch",
    md: "Quartics and higher powers, asymptotes and points of inflection are all outside this statement. Neither is any transformation of a graph: you sketch the curve the question prints, never a shifted or stretched copy of it.",
    source: "CCEA GCSE Further Mathematics specification, statement FM1-DIF-02 and its Teacher Guidance",
  },
  {
    type: "gate",
    id: "g7",
    kind: "choice",
    prompt: "Your sketch is drawn. What has to be written on it for the marks?",
    options: [
      "The coordinates of every crossing and every turning point",
      "A scale on both axes",
      "The equation of the curve"
    ],
    answer: "The coordinates of every crossing and every turning point",
    explain: "The examiners ask for the key points to be labelled as coordinates. A sketch needs no scale, and the equation is already printed in the question."
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: "Find where a curve meets the axes by setting $y = 0$ and $x = 0$, with no calculus.\nSolve $\\frac{dy}{dx} = 0$ and substitute back into the curve for the height.\nName a turning point a maximum or a minimum from the sign of $\\frac{d^{2}y}{dx^{2}}$.\nRead the end behaviour from the sign of the highest power.\nDraw and label a sketch that agrees with every value you found.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The question runs in the order of the five rows: crossings, turning points, their nature, then the sketch. The first mark is for one correct factorisation or one correct derivative, so write one down even if the rest is not clear yet. The last mark on the sketch is for the labels. Stuck on a height? Substitute your value of $x$ into the curve and carry on."
  },
  { type: "prompt", promptId: "rp.fm.u1.curve-sketching-quadratic-cubic.01" },
  { type: "prompt", promptId: "rp.fm.u1.curve-sketching-quadratic-cubic.02" },
  { type: "prompt", promptId: "rp.fm.u1.curve-sketching-quadratic-cubic.04" },
  { type: "prompt", promptId: "rp.fm.u1.curve-sketching-quadratic-cubic.05" },
  { type: "prompt", promptId: "rp.fm.u1.curve-sketching-quadratic-cubic.07" },
];

export { note, heroPlainSvg, cubicPlainSvg, Q1, Q2, C1, C2, P1, P2, P3, P4, P5, P6, P7, Q1roots, Q2roots, C1roots, C2roots, P1roots, P4roots, heroSvg, cubicSvg, c2Svg, routeCard, shapeCardSvg, derivativeSvg, examQ1Svg, OUT, TOPIC, SPEC };
