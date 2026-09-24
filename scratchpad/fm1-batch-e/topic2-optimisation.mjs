/**
 * FM1 batch E, topic 2: fm.u1.optimisation (difficulty 5, full H treatment).
 * Contexts are two-dimensional throughout: the Teacher Guidance for FM1-DIF-02 excludes
 * three-dimensional optimisation and anything involving pi.
 */
import {
  fr, frLatex, frText, num, add, sub, mul, div, neg, isInt,
  polyFrom, polyDeriv, polyEval, polyLatex, polyText, terms,
  quadRoots, dp, graphSvg, cardSvg, diagramSvg,
} from "./lib.mjs";

const assert = (ok, msg) => {
  if (!ok) throw new Error(`optimisation generator: ${msg}`);
};

/** Positive stationary x of a derivative whose terms are {1,0}, {2,1,0} or {0,-2}. */
export function stationaryXPositive(d1) {
  const keys = [...d1.keys()].sort((a, b) => b - a);
  const k = keys.join(",");
  if (k === "1,0") return div(neg(d1.get(0)), d1.get(1));
  if (k === "1") return fr(0);
  if (k === "2,1,0" || k === "2,1" || k === "2,0") {
    const rs = quadRoots(d1.get(2) ?? fr(0), d1.get(1) ?? fr(0), d1.get(0) ?? fr(0));
    assert(rs, "quadratic derivative has irrational roots");
    const pos = rs.filter((r) => num(r) > 0);
    assert(pos.length === 1, "expected exactly one positive root");
    return pos[0];
  }
  if (k === "0,-2") {
    // a + b x^-2 = 0  ->  x^2 = -b/a
    const sq = div(neg(d1.get(-2)), d1.get(0));
    const n = Math.round(Math.sqrt(sq.n));
    const den = Math.round(Math.sqrt(sq.d));
    assert(n * n === sq.n && den * den === sq.d && num(sq) > 0, `x squared = ${frText(sq)} is not a rational square`);
    return fr(n, den);
  }
  throw new Error(`stationaryXPositive: unsupported derivative shape ${k}`);
}

/** One optimisation context, fully computed. */
function context(spec) {
  const p = polyFrom(spec.expr);
  const d1 = polyDeriv(p);
  const d2 = polyDeriv(d1);
  const x = stationaryXPositive(d1);
  const value = polyEval(p, x);
  const second = polyEval(d2, x);
  const nature = num(second) > 0 ? "minimum" : "maximum";
  assert(polyEval(d1, x).n === 0, `${spec.name}: the derivative is not zero at x = ${frText(x)}`);
  assert(nature === spec.nature, `${spec.name}: expected a ${spec.nature} but the second derivative says ${nature}`);
  // the derivative is confirmed numerically at three sample points
  for (const t of [0.7, 2.3, 5.9]) {
    const h = 1e-5;
    const q = (num(polyEval(p, fr(Math.round((t + h) * 1e7), 1e7))) - num(polyEval(p, fr(Math.round((t - h) * 1e7), 1e7)))) / (2 * h);
    assert(Math.abs(q - num(polyEval(d1, fr(Math.round(t * 1e6), 1e6)))) < 1e-2, `${spec.name}: derivative mismatch at ${t}`);
  }
  return {
    ...spec, p, d1, d2, x, value, second, nature,
    latex: polyLatex(p, spec.v ?? "x"),
    d1Latex: polyLatex(d1, spec.v ?? "x"),
    d2Latex: polyLatex(d2, spec.v ?? "x"),
    text: polyText(p, spec.v ?? "x"),
    d1Text: polyText(d1, spec.v ?? "x"),
    d2Text: polyText(d2, spec.v ?? "x"),
    f: (t) => num(polyEval(p, fr(Math.round(t * 1e6), 1e6))),
  };
}

/* ------------------------------------------------------------------ the contexts */

/** A: a garden bed against a wall. 48 m of edging on three sides. */
export const A = (() => {
  const edging = fr(48);
  const c = context({ name: "garden bed", v: "x", expr: { 2: -2, 1: 48 }, nature: "maximum" });
  const y = sub(edging, mul(fr(2), c.x));
  assert(polyEval(c.p, c.x).n === mul(c.x, y).n * 1, "garden bed area does not match x times y");
  return { ...c, edging, y, unit: "m", areaUnit: "m²" };
})();

/** B: a vegetable plot of fixed area with one internal fence. */
export const B = (() => {
  const area = fr(54);
  const c = context({ name: "vegetable plot", v: "x", expr: { 1: 2, [-1]: 162 }, nature: "minimum" });
  const y = div(area, c.x);
  assert(num(add(mul(fr(2), c.x), mul(fr(3), y))) === num(c.value), "plot fencing does not match 2x + 3y");
  return { ...c, area, y, unit: "m" };
})();

/** C: a notice with printed area fixed and margins round it. */
export const C = (() => {
  const printed = fr(300);
  const sideMargin = fr(3);
  const endMargin = fr(4);
  const c = context({ name: "notice", v: "w", expr: { 1: 8, 0: 348, [-1]: 1800 }, nature: "minimum" });
  const h = div(printed, c.x);
  const outerW = add(c.x, mul(fr(2), sideMargin));
  const outerH = add(h, mul(fr(2), endMargin));
  assert(num(mul(outerW, outerH)) === num(c.value), "notice area does not match the outer rectangle");
  return { ...c, printed, sideMargin, endMargin, h, outerW, outerH, unit: "cm", areaUnit: "cm²" };
})();

/** D: two pens against a barn wall, 36 m of fencing. */
export const D = (() => {
  const fencing = fr(36);
  const c = context({ name: "pens", v: "x", expr: { 2: -3, 1: 36 }, nature: "maximum" });
  const y = sub(fencing, mul(fr(3), c.x));
  assert(num(mul(c.x, y)) === num(c.value), "pen area does not match x times y");
  return { ...c, fencing, y, unit: "m", areaUnit: "m²" };
})();

/** E: the cost of making each tray. */
export const E = (() => {
  const c = context({ name: "trays", v: "x", expr: { 1: 2, 0: 15, [-1]: 800 }, nature: "minimum" });
  return { ...c, unit: "pounds" };
})();

/** F: a plot beside a river, fenced on three sides, area fixed. */
export const F = (() => {
  const area = fr(288);
  const c = context({ name: "river plot", v: "x", expr: { 1: 1, [-1]: 576 }, nature: "minimum" });
  const y = div(area, c.x);
  assert(num(add(c.x, mul(fr(2), y))) === num(c.value), "river fencing does not match x + 2y");
  return { ...c, area, y, unit: "m" };
})();

/** G: a short practice context, A = x(20 - x). */
export const G = context({ name: "short area", v: "x", expr: { 2: -1, 1: 20 }, nature: "maximum" });
/** H: a short practice context, C = 3x + 300/x. */
export const Hc = context({ name: "short cost", v: "x", expr: { 1: 3, [-1]: 300 }, nature: "minimum" });

/* ------------------------------------------------------------------ error routes */

export const routes = {
  /** Stopping at the value of x where the optimised quantity was asked for. */
  finalQuantityNotEvaluated: (c) => c.x,
  /** Reading the sign of the second derivative the other way round. */
  natureReversed: (c) => (c.nature === "maximum" ? "minimum" : "maximum"),
  /** Differentiating and dropping the term in x, whose derivative is 1 (or the coefficient). */
  linearTermDropped: (c) => polyFrom(Object.fromEntries(terms(c.d1).filter(([e]) => e !== 0))),
  /** A negative power differentiated with the sign of the coefficient left as it was. */
  negativePowerSignKept: (c) =>
    polyFrom(Object.fromEntries(terms(c.d1).map(([e, k]) => [e, e < 0 ? neg(k) : k]))),
  /** Solving x squared = k and forgetting to take the square root. */
  squareRootNotTaken: (c) => {
    const k = [...c.d1.keys()].sort((a, b) => b - a).join(",");
    assert(k === "0,-2", "squareRootNotTaken needs a derivative of the form a + b/x^2");
    return div(neg(c.d1.get(-2)), c.d1.get(0));
  },
  /** Forgetting that the wall replaces one side, so both pairs of sides are fenced. */
  wallSideCounted: (c, sidesInstead) => {
    const p = polyFrom(sidesInstead);
    const d = polyDeriv(p);
    let x = null;
    try {
      x = stationaryXPositive(d);
    } catch {
      x = null; // this wrong route has no rational stationary value; only its expression is quoted
    }
    return { p, x, value: x ? polyEval(p, x) : null, latex: polyLatex(p) };
  },
  /** Substituting the optimal x into the derivative rather than into the quantity itself. */
  valueFromDerivative: (c) => polyEval(c.d1, c.x),
};

/* ------------------------------------------------------------------ figures */

export const stepCard = cardSvg({
  title: "every optimisation question runs on the same five steps",
  rows: [
    ["1  read the constraint", "the sentence that ties the two letters together"],
    ["2  one letter only", "substitute the constraint into the quantity"],
    ["3  differentiate and solve", "set the derivative to zero"],
    ["4  confirm which it is", "the sign of the second derivative"],
    ["5  answer the question", "substitute back, with units"],
  ],
  footer: "step 5 is the one candidates leave out most often",
});

const wallDiagram = (() => {
  const x = 120, y = 250;
  const left = 140, top = 70;
  return diagramSvg({
    width: 520,
    height: 250,
    shapes: [
      { kind: "line", x1: left - 16, y1: top, x2: left + y + 16, y2: top, width: 4 },
      { kind: "poly", pts: [[left, top], [left, top + x], [left + y, top + x], [left + y, top]], close: false, fill: 0.08, width: 2 },
    ],
    labels: [
      { x: left + y / 2, y: top - 12, text: "the wall costs nothing to fence" },
      { x: left + y / 2, y: top + x + 22, text: `${frText(A.y)} m, the side facing the wall` },
      { x: left - 10, y: top + x / 2, text: `${frText(A.x)} m`, anchor: "end" },
      { x: left + y + 10, y: top + x / 2, text: `${frText(A.x)} m`, anchor: "start" },
      { x: left + y / 2, y: top + x / 2 + 5, text: `area ${frText(A.value)} ${A.areaUnit}` },
    ],
    aria: `A rectangular garden bed against a wall: two sides of ${frText(A.x)} metres and one of ${frText(A.y)} metres, enclosing ${frText(A.value)} square metres`,
    footer: `${frText(A.edging)} m of edging covers three sides only`,
  });
})();
export { wallDiagram };

/**
 * The same bed, labelled with the letters the stem uses rather than the values it asks for.
 * Question and worked-example figures use this one; the note keeps the solved copy above.
 */
export const wallDiagramVars = (() => {
  const x = 120, y = 250;
  const left = 140, top = 70;
  return diagramSvg({
    width: 520,
    height: 250,
    shapes: [
      { kind: "line", x1: left - 16, y1: top, x2: left + y + 16, y2: top, width: 4 },
      { kind: "poly", pts: [[left, top], [left, top + x], [left + y, top + x], [left + y, top]], close: false, fill: 0.08, width: 2 },
    ],
    labels: [
      { x: left + y / 2, y: top - 12, text: "the wall costs nothing to fence" },
      { x: left + y / 2, y: top + x + 22, text: "y m, the side facing the wall" },
      { x: left - 10, y: top + x / 2, text: "x m", anchor: "end" },
      { x: left + y + 10, y: top + x / 2, text: "x m", anchor: "start" },
    ],
    aria: `A rectangular garden bed against a wall: the two sides at right angles to the wall are each x metres and the side facing the wall is y metres`,
    footer: `${frText(A.edging)} m of timber covers those three sides only`,
  });
})();

/** Two pens side by side against a barn wall: two ends, a divider and the far side. */
export const pensDiagram = (() => {
  const w = 300, h = 140;
  const left = 110, top = 76;
  // the box is tall enough for the "y m, the far side" label and the footer to clear each other:
  // the label sits at top + h + 22 = 238 and the footer at height - 10 = 266
  return diagramSvg({
    width: 520,
    height: 276,
    shapes: [
      { kind: "line", x1: left - 16, y1: top, x2: left + w + 16, y2: top, width: 4 },
      { kind: "poly", pts: [[left, top], [left, top + h], [left + w, top + h], [left + w, top]], close: false, fill: 0.07, width: 2 },
      { kind: "line", x1: left + w / 2, y1: top, x2: left + w / 2, y2: top + h, width: 2 },
    ],
    labels: [
      { x: left + w / 2, y: top - 12, text: "the barn wall costs nothing to fence" },
      { x: left + w / 2, y: top + h + 22, text: "y m, the far side" },
      { x: left - 10, y: top + h / 2, text: "x m", anchor: "end" },
      { x: left + w + 10, y: top + h / 2, text: "x m", anchor: "start" },
      { x: left + w / 2 + 8, y: top + h / 2, text: "x m, the divider", anchor: "start" },
    ],
    aria: "Two rectangular pens side by side against a barn wall, the two ends and the divider each x metres and the far side y metres",
    footer: `${frText(D.fencing)} m of fencing; the barn wall is free`,
  });
})();

export const plotDiagram = (() => {
  const w = 300, h = 150;
  const left = 110, top = 60;
  return diagramSvg({
    width: 520,
    height: 260,
    shapes: [
      { kind: "rect", x: left, y: top, w, h, fill: 0.07, width: 2 },
      { kind: "line", x1: left + w / 2, y1: top, x2: left + w / 2, y2: top + h, dashed: true, width: 2 },
    ],
    labels: [
      { x: left + w / 2, y: top - 14, text: `${frText(B.x)} m across` },
      { x: left - 10, y: top + h / 2, text: `${frText(B.y)} m`, anchor: "end" },
      { x: left + w / 2 + 8, y: top + h / 2, text: "the extra fence", anchor: "start" },
      { x: left + w / 2, y: top + h + 24, text: `area ${frText(B.area)} ${"m²"}, fencing ${frText(B.value)} m` },
    ],
    aria: `A rectangular vegetable plot ${frText(B.x)} metres by ${frText(B.y)} metres with one extra fence across the middle, using ${frText(B.value)} metres of fencing`,
  });
})();

/** The divided plot with the letters the stem uses, for the question and worked-example copies. */
export const plotDiagramVars = (() => {
  const w = 300, h = 150;
  const left = 110, top = 60;
  return diagramSvg({
    width: 520,
    height: 260,
    shapes: [
      { kind: "rect", x: left, y: top, w, h, fill: 0.07, width: 2 },
      { kind: "line", x1: left + w / 2, y1: top, x2: left + w / 2, y2: top + h, dashed: true, width: 2 },
    ],
    labels: [
      { x: left + w / 2, y: top - 14, text: "x m across" },
      { x: left - 10, y: top + h / 2, text: "y m", anchor: "end" },
      { x: left + w / 2 + 8, y: top + h / 2, text: "the extra fence, y m", anchor: "start" },
      { x: left + w / 2, y: top + h + 24, text: `area ${frText(B.area)} m²` },
    ],
    aria: `A rectangular vegetable plot x metres across and y metres deep, of area ${frText(B.area)} square metres, with one extra fence of length y across the middle`,
  });
})();

export const noticeDiagram = (() => {
  const inner = { w: 210, h: 140 };
  const m = { x: 34, y: 42 };
  const left = 150, top = 40;
  return diagramSvg({
    width: 520,
    height: 300,
    shapes: [
      { kind: "rect", x: left - m.x, y: top - m.y + 20, w: inner.w + 2 * m.x, h: inner.h + 2 * m.y, width: 2 },
      { kind: "rect", x: left, y: top + 20, w: inner.w, h: inner.h, fill: 0.09, width: 1.6 },
    ],
    labels: [
      { x: left + inner.w / 2, y: top + 20 + inner.h / 2, text: `printed area ${frText(C.printed)} ${C.areaUnit}` },
      { x: left + inner.w / 2, y: top + 14, text: `${frText(C.endMargin)} cm margin` },
      { x: left + inner.w / 2, y: top + 20 + inner.h + 30, text: `${frText(C.endMargin)} cm margin` },
      { x: left - m.x - 8, y: top + 20 + inner.h / 2, text: `${frText(C.sideMargin)} cm`, anchor: "end" },
      { x: left + inner.w + m.x + 8, y: top + 20 + inner.h / 2, text: `${frText(C.sideMargin)} cm`, anchor: "start" },
      { x: left + inner.w / 2, y: top + 20 + inner.h + 62, text: "w is the width of the printed part only" },
    ],
    aria: `A notice: a printed rectangle of area ${frText(C.printed)} square centimetres with margins of ${frText(C.sideMargin)} centimetres at each side and ${frText(C.endMargin)} centimetres at the top and bottom`,
  });
})();

/** The riverside field, labelled with the letters the stem uses. */
export const riverDiagram = (() => {
  const w = 300, h = 150;
  const left = 110, top = 70;
  return diagramSvg({
    width: 520,
    height: 260,
    shapes: [
      { kind: "line", x1: left - 20, y1: top + h, x2: left + w + 20, y2: top + h, width: 4 },
      { kind: "poly", pts: [[left, top + h], [left, top], [left + w, top], [left + w, top + h]], close: false, fill: 0.07, width: 2 },
    ],
    labels: [
      { x: left + w / 2, y: top + h + 24, text: "the river side is free" },
      { x: left + w / 2, y: top - 12, text: "x m, the side opposite the river" },
      { x: left - 10, y: top + h / 2, text: "y m", anchor: "end" },
      { x: left + w + 10, y: top + h / 2, text: "y m", anchor: "start" },
      { x: left + w / 2, y: top + h / 2 + 5, text: `area ${frText(F.area)} m²` },
    ],
    aria: `A rectangular field of area ${frText(F.area)} square metres beside a river, fenced on three sides: the side opposite the river is x metres and the two ends are each y metres`,
  });
})();

export const areaGraph = graphSvg({
  xMin: 0, xMax: 26, yMin: 0, yMax: 320, xStep: 2, yStep: 40, width: 560, height: 330,
  curves: [{ f: A.f, from: 0.01, to: 24 }],
  verticals: [{ x: num(A.x), from: 0, to: num(A.value) }],
  points: [{ x: num(A.x), y: num(A.value), label: `(${frText(A.x)}, ${frText(A.value)})`, anchor: "start", dy: -10 }],
  xLabel: "x (m)",
  yLabel: "A (m²)",
  aria: `The area of the garden bed plotted against x: it rises to ${frText(A.value)} square metres at x = ${frText(A.x)} and falls away on both sides`,
  footer: "the peak is where the gradient is zero",
});

export const lengthGraph = graphSvg({
  xMin: 0, xMax: 26, yMin: 0, yMax: 80, xStep: 2, yStep: 10, width: 560, height: 330,
  curves: [{ f: B.f, from: 2.5, to: 26 }],
  verticals: [{ x: num(B.x), from: 0, to: num(B.value) }],
  points: [{ x: num(B.x), y: num(B.value), label: `(${frText(B.x)}, ${frText(B.value)})`, anchor: "start", dy: -10 }],
  xLabel: "x (m)",
  yLabel: "L (m)",
  aria: `The total fencing plotted against x: it falls to a least value of ${frText(B.value)} metres at x = ${frText(B.x)} and rises again`,
  footer: "a dip, so the second derivative is positive here",
});

export const natureCard = cardSvg({
  title: "which way does the second derivative point",
  rows: [
    ["d²y/dx² is positive", "the gradient is climbing through zero: a minimum"],
    ["d²y/dx² is negative", "the gradient is falling through zero: a maximum"],
    ["you must show the number", "a bare word earns nothing"],
  ],
  footer: "substitute your value of x and write the sign down",
});

/* ------------------------------------------------------------------ note blocks */

export const note = [
  {
    type: "hero",
    lede: "A fence of fixed length can enclose many different rectangles, and one of them is the biggest. Optimisation is how you find it: turn the situation into one equation in one letter, differentiate, and read off where the gradient is zero.",
    can: [
      "Turn a constraint from a diagram or a sentence into an expression in a single letter",
      "Differentiate that expression, solve dy/dx = 0 and confirm a maximum or a minimum",
      "Finish with the quantity the question actually asked for, in its own units",
    ],
    minutes: 22,
  },
  { type: "h", text: "The biggest rectangle a fence can hold" },
  {
    type: "p",
    md: "Give someone forty-eight metres of edging and ask them to enclose the largest bed they can against a wall. Long and thin wastes the depth; short and deep wastes the width. Somewhere between the two is the best answer, and calculus finds it exactly.",
  },
  { type: "figure", alt: `A rectangular garden bed against a wall, with two sides of ${frText(A.x)} metres and one side of ${frText(A.y)} metres`, svg: wallDiagram, caption: `Three sides fenced, one side free. The wall is the whole reason $x$ and $y$ are not equal.` },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "One tap to begin. In the picture, how many sides are made of edging?",
    options: ["Three", "Four", "Two"],
    answer: "Three",
    explain: "The wall takes the fourth side, so the edging has to cover the two ends and the front only. That single fact is the constraint.",
  },
  { type: "h", text: "1. The same five steps every time" },
  {
    type: "p",
    md: "These questions look different from each other and are not. Every one of them gives you two letters and a sentence that ties them together, and asks for the largest or smallest value of something.\nThe sentence is the **constraint**. Use it to replace one letter, differentiate what is left, and the rest follows.",
  },
  { type: "figure", alt: "A five-row card listing the steps of an optimisation question", svg: stepCard, caption: "Write these five down the margin before you start, and tick them off." },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: "Which step do the examiners report as the one most often missing?",
    options: [
      "Substituting back to find the quantity the question asked for",
      "Differentiating the expression",
      "Reading the constraint",
    ],
    answer: "Substituting back to find the quantity the question asked for",
    explain: "Candidates solve for $x$ and stop there. In Summer 2022 a question wanted a length of $60$ mm and a great many answers gave the value of $x$ instead.",
  },
  { type: "h", text: "2. Reading the constraint" },
  {
    type: "p",
    md: `The edging runs along two ends and the front, so $2x + y = ${frText(A.edging)}$, which rearranges to $y = ${frText(A.edging)} - 2x$.\nThe quantity to make large is the area, $A = xy$. Replacing $y$ gives $A = x(${frText(A.edging)} - 2x) = ${A.latex}$, which is now a function of one letter and can be differentiated.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why one letter and not two",
    md: "Differentiation asks how one quantity changes as another changes. With $x$ and $y$ both free there is no single thing to change. The constraint removes that freedom: choose $x$ and $y$ is decided, so the area depends on $x$ alone and the gradient means something.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "blank",
    prompt: `A rectangle of area $${frText(B.area)}$ m² has width $x$ and height $y$. Write $y$ in terms of $x$: $y = $ ___`,
    answer: `${frText(B.area)}/x | ${frText(B.area)}x^-1 | ${frText(B.area)}x^{-1}`,
    explain: `From $xy = ${frText(B.area)}$, dividing both sides by $x$ gives $y = \\frac{${frText(B.area)}}{x}$. That fraction is what turns the problem into one letter.`,
  },
  { type: "h", text: "3. The garden bed, worked in full" },
  {
    type: "p",
    md: `**Constraint.** $2x + y = ${frText(A.edging)}$, so $y = ${frText(A.edging)} - 2x$.\n**One letter.** $A = x(${frText(A.edging)} - 2x) = ${A.latex}$.\n**Differentiate.** $\\frac{dA}{dx} = ${A.d1Latex}$.\n**Solve.** $${A.d1Latex} = 0$ gives $x = ${frText(A.x)}$.\n**Confirm.** $\\frac{d^{2}A}{dx^{2}} = ${A.d2Latex}$, which is negative, so this is a maximum.\n**Answer.** $y = ${frText(A.y)}$ m and the greatest area is $${frText(A.value)}$ m².`,
  },
  { type: "figure", alt: `A graph of the bed's area against x, peaking at ${frText(A.value)} square metres when x is ${frText(A.x)}`, svg: areaGraph, caption: `Every width is possible. The area peaks at $x = ${frText(A.x)}$ and falls away on both sides.` },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: `For that bed, $\\frac{dA}{dx} = ${A.d1Latex}$. At what value of $x$ is the area greatest?`,
    answer: frText(A.x),
    explain: `Set the derivative to zero: $${frText(A.edging)} = 4x$, so $x = ${frText(A.x)}$. The gradient of the area is zero exactly at the peak.`,
  },
  { type: "h", text: "4. Confirming which kind of turning point it is" },
  {
    type: "p",
    md: "The question is never satisfied by finding a stationary value. It has to be shown to be the maximum or the minimum, and the second derivative is the evidence the scheme wants.\nSubstitute your value of $x$, write the number down, and say what its sign means. A sentence with no number attached earns nothing.",
  },
  { type: "figure", alt: "A three-row card: a positive second derivative is a minimum, a negative one is a maximum, and the number itself must be shown", svg: natureCard, caption: "The sign is the argument, and the number is the evidence." },
  {
    type: "gate",
    id: "g5",
    kind: "choice",
    prompt: `The bed has $\\frac{d^{2}A}{dx^{2}} = ${A.d2Latex}$. What does that show?`,
    options: [
      `That $x = ${frText(A.x)}$ gives the greatest area`,
      `That $x = ${frText(A.x)}$ gives the smallest area`,
      "Nothing, because the second derivative has no $x$ in it",
    ],
    answer: `That $x = ${frText(A.x)}$ gives the greatest area`,
    explain: "A negative second derivative means the gradient is falling through zero, which is a peak. A constant second derivative is perfectly usable evidence; its sign is all that is being asked for.",
  },
  { type: "h", text: "5. Finish with what was asked" },
  {
    type: "p",
    md: `Read the last line of the question again before you write anything down. It may want the area, the perimeter, the cost, or the length of one side, and the value of $x$ you solved for is often none of those.\nHere the question asked for the greatest area, so $x = ${frText(A.x)}$ goes back into $A$ to give $${frText(A.value)}$ m². Carry the unit with it.`,
  },
  {
    type: "video",
    videoId: "0LNa9xqi-Mo",
    title: "Maximising Using Differentiation - GCSE Further Maths/AS-Level Maths Solution",
    channel: "N.I. Maths Tutor",
    why: "A Northern Ireland teacher taking a maximising problem through the same five steps.",
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: `The bed's greatest area comes from $A = ${A.latex}$ at $x = ${frText(A.x)}$. What is that area, in m²?`,
    answer: frText(A.value),
    explain: `$${frText(A.edging)} \\times ${frText(A.x)} - 2 \\times ${frText(A.x)}^{2} = ${frText(A.value)}$. Writing $${frText(A.x)}$ as the answer would be the value of $x$, which is a width, not an area.`,
  },
  { type: "h", text: "6. When the expression has a negative power" },
  {
    type: "p",
    md: `A fixed **area** with a length to minimise produces a fraction. For a plot of $${frText(B.area)}$ m² fenced round the outside and once across the middle, the fencing is $L = 2x + 3y$ with $y = \\frac{${frText(B.area)}}{x}$, so $L = ${B.latex}$.\nWrite the fraction as $${frText(162)}x^{-1}$ before differentiating: $\\frac{dL}{dx} = ${B.d1Latex}$.`,
  },
  { type: "figure", alt: `A rectangular plot ${frText(B.x)} metres by ${frText(B.y)} metres with one fence across the middle`, svg: plotDiagram, caption: `Two sides of $x$, two sides of $y$, and one more fence of $y$ across the middle.` },
  {
    type: "p",
    md: `Setting $${B.d1Latex} = 0$ gives $x^{2} = ${frText(div(fr(162), fr(2)))}$, so $x = ${frText(B.x)}$ and $y = ${frText(B.y)}$.\nThe second derivative is $\\frac{d^{2}L}{dx^{2}} = ${B.d2Latex}$, which at $x = ${frText(B.x)}$ is $${frLatex(B.second)}$: positive, so this is the least fencing, $${frText(B.value)}$ m.`,
  },
  { type: "figure", alt: `A graph of the fencing against x, dipping to ${frText(B.value)} metres at x = ${frText(B.x)}`, svg: lengthGraph, caption: `A fixed area gives a dip rather than a peak: the fencing is least at $x = ${frText(B.x)}$.` },
  {
    type: "gate",
    id: "g7",
    kind: "number",
    prompt: `Solve $${B.d1Latex} = 0$ for the positive value of $x$.`,
    answer: frText(B.x),
    explain: `Rearranged, $\\frac{162}{x^{2}} = 2$, so $x^{2} = ${frText(div(fr(162), fr(2)))}$ and $x = ${frText(B.x)}$. Stopping at $x^{2} = ${frText(div(fr(162), fr(2)))}$ leaves the square root untaken.`,
  },
  { type: "h", text: "7. A show-that, then the answer" },
  {
    type: "p",
    md: `Many of these questions build the expression for you across two or three short parts, each worth one or two marks and each beginning with *show that*. Those parts pay for the lines of working, not for the printed result, so write every one.\nA notice has a printed area of $${frText(C.printed)}$ cm², a margin of $${frText(C.sideMargin)}$ cm at each side and $${frText(C.endMargin)}$ cm at the top and bottom. With $w$ the printed width, $h = \\frac{${frText(C.printed)}}{w}$ and the whole notice measures $(w + ${frText(mul(fr(2), C.sideMargin))})$ by $\\left(h + ${frText(mul(fr(2), C.endMargin))}\\right)$.`,
  },
  { type: "figure", alt: `A notice with a printed rectangle of area ${frText(C.printed)} square centimetres and margins of ${frText(C.sideMargin)} and ${frText(C.endMargin)} centimetres round it`, svg: noticeDiagram, caption: `The outer rectangle is wider by $${frText(mul(fr(2), C.sideMargin))}$ and taller by $${frText(mul(fr(2), C.endMargin))}$.` },
  {
    type: "gate",
    id: "g7a",
    kind: "choice",
    prompt: `The printed part is $w$ cm wide. How wide is the whole notice?`,
    options: [`$w + ${frText(mul(fr(2), C.sideMargin))}$`, `$w + ${frText(C.sideMargin)}$`, `$w$`],
    answer: `$w + ${frText(mul(fr(2), C.sideMargin))}$`,
    explain: `There is a margin of $${frText(C.sideMargin)}$ cm at each side, so two of them are added to the printed width. Adding only one is the slip that makes the whole answer plausible.`,
  },
  {
    type: "p",
    md: `Multiplying out gives $A = ${C.latex}$, and $\\frac{dA}{dw} = ${C.d1Latex}$.\nThat is zero when $w^{2} = ${frText(div(fr(1800), fr(8)))}$, so $w = ${frText(C.x)}$ cm, $h = ${frText(C.h)}$ cm, and the least total area is $${frText(C.value)}$ cm².`,
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Only flat contexts",
    md: "The Teacher Guidance is explicit that three-dimensional optimisation problems and problems involving $\\pi$ will not be asked, so every context you meet is a flat one: no boxes, no tanks, no circles.",
    source: "CCEA GCSE Further Mathematics specification, statement FM1-DIF-02 and its Teacher Guidance",
  },
  {
    type: "gate",
    id: "g8",
    kind: "number",
    prompt: `The notice is smallest when $w = ${frText(C.x)}$ cm. What is its least total area, in cm²?`,
    answer: frText(C.value),
    explain: `$A = ${frText(348)} + 8 \\times ${frText(C.x)} + \\frac{1800}{${frText(C.x)}} = ${frText(C.value)}$ cm², which is the $${frText(C.outerW)}$ cm by $${frText(C.outerH)}$ cm rectangle. The width alone is not an area.`,
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: "Read a constraint off a diagram or a sentence and write one letter in terms of the other.\nBuild the quantity to optimise as a function of a single letter and simplify it.\nDifferentiate, including a term with a negative power, and solve the derivative equal to zero.\nShow with the second derivative, and its number, which kind of turning point you have.\nSubstitute back and answer with the quantity asked for and its unit.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The wording is *using calculus, find the value of $x$ which gives the maximum, showing that it is a maximum*, usually after one or two show-that parts. The first mark is for a correct derivative, so write it down even when the setting-up has defeated you. The last mark is for the quantity the question named, with its unit.",
  },
  { type: "prompt", promptId: "rp.fm.u1.optimisation.01" },
  { type: "prompt", promptId: "rp.fm.u1.optimisation.03" },
  { type: "prompt", promptId: "rp.fm.u1.optimisation.05" },
  { type: "prompt", promptId: "rp.fm.u1.optimisation.07" },
  { type: "prompt", promptId: "rp.fm.u1.optimisation.08" },
];
