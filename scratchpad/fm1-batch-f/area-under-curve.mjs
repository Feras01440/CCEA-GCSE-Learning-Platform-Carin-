/**
 * FM1 batch F — topic 1: area-under-curve (difficulty 3 -> S).
 * Every integral, limit substitution, area and distractor value is computed in exact rational
 * arithmetic by polylib.mjs; every shaded region is drawn from the same polynomial.
 */
import fs from "node:fs";
import {
  OUT, PAPER, check, draftLogs, log, writeJson, lintTree, figure, svgWrap, svgText, svgPath, num,
  shingleClash, corpusFiles, frac, fAdd, fSub, fMul, fNeg, fVal, fTex, fPlain,
} from "./lib.mjs";
import { term, poly, integrate, at, definite, tex, texPlain, texSpoken, bracketTex, rootsIn, regionSvg } from "./polylib.mjs";

const SLUG = "area-under-curve";
const TOPIC = "fm.u1.area-under-curve";
const REFS = ["FM1-INT-04"];
const CER22 = "ccea-cer:further-maths:2022-summer:FM1:Q10";
const CER25 = "ccea-cer:further-maths:2025-summer:FM1:Q11";
const CER19 = "ccea-cer:further-maths:2019-summer:FM1:Q13";

/* ---- every curve and every area, computed --------------------------------------------------- */

/** One area job: the polynomial, the two ordinates, the exact integral and the exact area. */
function job(P, a, b, { splitAt = null } = {}) {
  const I = definite(P, a, b);
  const out = { P, a, b, F: integrate(P), I, splitAt, pieces: null };
  if (splitAt !== null) {
    const left = definite(P, a, splitAt);
    const right = definite(P, splitAt, b);
    out.pieces = { left, right, splitAt };
    out.area = fAdd(fVal(left) < 0 ? fNeg(left) : left, fVal(right) < 0 ? fNeg(right) : right);
  } else {
    out.area = fVal(I) < 0 ? fNeg(I) : I;
  }
  return out;
}

const P_WE1 = poly(term(1, 1, 2), term(1, 1, 0)); // x^2 + 1
const WE1 = job(P_WE1, 0, 3);

const P_WE2 = poly(term(1, 1, 2), term(-4, 1, 1)); // x^2 - 4x
const WE2 = job(P_WE2, 0, 4);

const P1 = poly(term(2, 1, 1), term(1, 1, 0)); // 2x + 1
const J1 = job(P1, 1, 4);
const P2 = poly(term(3, 1, 2)); // 3x^2
const J2 = job(P2, 1, 2);
const P3 = poly(term(1, 1, 2), term(2, 1, 1)); // x^2 + 2x
const J3 = job(P3, 0, 3);
const P4 = poly(term(-1, 1, 2), term(4, 1, 0)); // 4 - x^2
const J4 = job(P4, -2, 2);
const P5 = poly(term(1, 1, 2), term(-9, 1, 0)); // x^2 - 9
const J5 = job(P5, 0, 3);
const P6 = poly(term(3, 1, 2), term(-12, 1, 0)); // 3x^2 - 12
const J6 = job(P6, 0, 2);
const P7 = poly(term(1, 1, 2), term(-4, 1, 0)); // x^2 - 4, crosses at x = 2
const J7 = job(P7, 0, 4, { splitAt: 2 });
const P8 = poly(term(-1, 1, 2), term(6, 1, 1)); // 6x - x^2, roots 0 and 6
const J8 = job(P8, 0, 6);
const P9 = poly(term(1, 1, 2)); // x^2
const J9 = job(P9, 1, 2);
const P10 = poly(term(2, 1, 1), term(-8, 1, 0)); // 2x - 8
const J10 = job(P10, 1, 4);

const PA = poly(term(1, 1, 2), term(-5, 1, 1), term(4, 1, 0)); // x^2 - 5x + 4, roots 1 and 4
const JA = job(PA, 1, 4);
const ROOTS_A = rootsIn(PA, -10, 10);

/** Twins use curves no bank question uses, so the same method meets new numbers. */
const TWIN1 = job(poly(term(2, 1, 2), term(1, 1, 0)), 0, 3);      // 2x^2 + 1 from 0 to 3, area 21
const TWIN2 = job(poly(term(1, 1, 2), term(-16, 1, 0)), 0, 3);    // x^2 - 16 from 0 to 3, below the axis, area 39

const P11 = poly(term(-1, 1, 2), term(9, 1, 0)); // 9 - x^2, roots at -3 and 3, above the axis between them
const J11 = job(P11, -3, 3);

const PB = poly(term(-2, 1, 2), term(8, 1, 0)); // 8 - 2x^2, positive root 2
const JB1 = job(PB, 0, 2);
const JB2 = job(PB, 2, 3);
const ROOTS_B = rootsIn(PB, 0, 10);

/* ---- identity check at three sample points ---------------------------------------------------- */

/** The integral is checked against a fine Riemann sum, at three different curves. */
function riemann(P, a, b, n = 200000) {
  const f = (x) => P.reduce((s, t) => s + fVal(t.c) * x ** t.p, 0);
  let s = 0;
  const h = (b - a) / n;
  for (let i = 0; i < n; i++) s += f(a + h * (i + 0.5)) * h;
  return s;
}
const SAMPLES = [
  { name: `${tex(P_WE1)} from ${WE1.a} to ${WE1.b}`, exact: fVal(WE1.I), numeric: riemann(P_WE1, 0, 3) },
  { name: `${tex(P7)} from ${J7.a} to ${J7.b}`, exact: fVal(J7.I), numeric: riemann(P7, 0, 4) },
  { name: `${tex(PA)} from ${JA.a} to ${JA.b}`, exact: fVal(JA.I), numeric: riemann(PA, 1, 4) },
];
for (const s of SAMPLES) {
  if (Math.abs(s.exact - s.numeric) > 1e-5) throw new Error(`integral check failed for ${s.name}: ${s.exact} vs ${s.numeric}`);
}

/* ---- error routes, executed ------------------------------------------------------------------- */

const routes = {
  /** The negative integral of a region below the axis is left on the answer line. */
  negativeLeft: (J) => fVal(J.I),
  /** Bottom limit taken from the top the wrong way round. */
  limitsReversed: (J) => fVal(fNeg(J.I)),
  /** The crossing region is integrated straight across, so the two halves cancel. */
  notSplit: (J) => Math.abs(fVal(J.I)),
  /** The index is left where it was, so a x^n integrates to a x^n / (n + 1). */
  powerNotRaised: (P, a, b) => {
    const G = P.map((t) => ({ c: frac(t.c.n, t.c.d * (t.p + 1)), p: t.p }));
    return fVal(fSub(at(G, b), at(G, a)));
  },
  /** The index goes up but the coefficient is never divided by the new index. */
  coefficientNotDivided: (P, a, b) => {
    const G = P.map((t) => ({ c: t.c, p: t.p + 1 }));
    return fVal(fSub(at(G, b), at(G, a)));
  },
  /** The curve is differentiated instead of integrated, then the limits are put into that. */
  differentiated: (P, a, b) => {
    const D = P.filter((t) => t.p > 0).map((t) => ({ c: fMul(t.c, frac(t.p)), p: t.p - 1 }));
    return fVal(fSub(at(D, b), at(D, a)));
  },
  /** Only the top limit is substituted. */
  lowerLimitIgnored: (P, a, b) => Math.abs(fVal(at(integrate(P), b))),
  /** The two limits are put straight into the curve instead of into the integral. */
  limitsIntoCurve: (P, a, b) => Math.abs(fVal(fSub(at(P, b), at(P, a)))),
};

const E = {
  j5Neg: routes.negativeLeft(J5),
  j6Neg: routes.negativeLeft(J6),
  j10Neg: routes.negativeLeft(J10),
  j7NotSplit: routes.notSplit(J7),
  j1Rev: routes.limitsReversed(J1),
  j2Power: routes.powerNotRaised(P2, J2.a, J2.b),
  j3Coef: routes.coefficientNotDivided(P3, J3.a, J3.b),
  j3Diff: routes.differentiated(P3, J3.a, J3.b),
  j4Low: routes.lowerLimitIgnored(P4, J4.a, J4.b),
  j8Curve: routes.limitsIntoCurve(P8, J8.a, J8.b),
  j9Power: routes.powerNotRaised(P9, J9.a, J9.b),
  jaNeg: routes.negativeLeft(JA),
  jaRev: routes.limitsReversed(JA),
  jb2Neg: routes.negativeLeft(JB2),
  jb1Coef: routes.coefficientNotDivided(PB, JB1.a, JB1.b),
  weTwinArea: null,
};

/* ---- figures ------------------------------------------------------------------------------------ */

const fig = (J, opts) => regionSvg(J.P, { xLo: opts.xLo, xHi: opts.xHi, shade: opts.shade ?? [{ a: J.a, b: J.b }], label: opts.label, caption: opts.caption, marks: opts.marks ?? [], splitAt: opts.splitAt ?? null });

const HERO_SVG = fig(WE1, {
  xLo: -0.6,
  xHi: 3.8,
  label: `the region between the curve, the x-axis and the two ordinates`,
  caption: `The curve y equals ${texSpoken(P_WE1)} with the region between it, the x-axis and the ordinates x equals ${WE1.a} and x equals ${WE1.b} shaded`,
});

const STRIPS_SVG = (() => {
  const P = P_WE1;
  const f = (x) => fVal(at(P, 0)) * 0 + P.reduce((s, t) => s + fVal(t.c) * x ** t.p, 0);
  const W = 560;
  const H = 260;
  const m = { l: 52, r: 24, t: 18, b: 44 };
  const xLo = -0.4;
  const xHi = 3.4;
  const yLo = 0;
  const yHi = f(3) * 1.12;
  const sx = (x) => m.l + ((x - xLo) / (xHi - xLo)) * (W - m.l - m.r);
  const sy = (y) => m.t + (1 - (y - yLo) / (yHi - yLo)) * (H - m.t - m.b);
  const r1 = (v) => num(Math.round(v * 10) / 10);
  const parts = [];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = (3 * i) / n;
    const b = (3 * (i + 1)) / n;
    const h = f((a + b) / 2);
    parts.push(
      `<rect x='${r1(sx(a))}' y='${r1(sy(h))}' width='${r1(sx(b) - sx(a))}' height='${r1(sy(0) - sy(h))}' stroke='currentColor' stroke-width='0.9' fill='currentColor' fill-opacity='0.12'/>`,
    );
  }
  parts.push(`<path d='M ${r1(sx(xLo))} ${r1(sy(0))} L ${r1(sx(xHi))} ${r1(sy(0))}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  parts.push(`<path d='M ${r1(sx(0))} ${r1(sy(yHi))} L ${r1(sx(0))} ${r1(sy(0))}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  const d = [];
  for (let i = 0; i <= 200; i++) {
    const x = xLo + ((xHi - xLo) * i) / 200;
    d.push(`${i === 0 ? "M" : "L"} ${r1(sx(x))} ${r1(sy(f(x)))}`);
  }
  parts.push(`<path d='${d.join(" ")}' stroke='currentColor' stroke-width='2' fill='none'/>`);
  for (const x of [0, 1, 2, 3]) {
    parts.push(`<path d='M ${r1(sx(x))} ${r1(sy(0))} L ${r1(sx(x))} ${r1(sy(0) + 6)}' stroke='currentColor' stroke-width='1' fill='none'/>`);
    parts.push(svgText(Math.round(sx(x) * 10) / 10, Math.round((sy(0) + 19) * 10) / 10, String(x), { size: 11 }));
  }
  parts.push(svgText(W / 2, H - 8, "thinner strips, and the staircase becomes the curve", { size: 11.5 }));
  return svgWrap(
    `0 0 ${W} ${H}`,
    `The same region filled with eight vertical strips whose tops touch the curve, showing how the strips add up to the area`,
    parts.join(""),
  );
})();

const BELOW_SVG = fig(WE2, {
  xLo: -0.6,
  xHi: 4.6,
  label: `every strip here has a negative height, so the integral comes out negative`,
  caption: `The curve y equals ${texSpoken(P_WE2)} between x equals ${WE2.a} and x equals ${WE2.b}, entirely below the x-axis, with the region shaded`,
});

const CROSS_SVG = regionSvg(P7, {
  xLo: -0.5,
  xHi: 4.5,
  shade: [{ a: 0, b: 2 }, { a: 2, b: 4 }],
  splitAt: 2,
  marks: [{ x: 2, y: 0, text: "split here", dy: 18, dx: 0 }],
  label: `below the axis on the left, above it on the right`,
  caption: `The curve y equals ${texSpoken(P7)} from x equals 0 to x equals 4, shaded on both sides of the root at x equals 2, with a dashed line marking the split`,
});

const WE1_SVG = fig(WE1, {
  xLo: -0.6,
  xHi: 3.8,
  label: `the shaded region is what the integral measures`,
  caption: `The curve y equals ${texSpoken(P_WE1)} with the region from x equals ${WE1.a} to x equals ${WE1.b} shaded`,
});

const WE2_SVG = fig(WE2, {
  xLo: -0.6,
  xHi: 4.6,
  label: `a region under the axis, so the integral is negative`,
  caption: `The curve y equals ${texSpoken(P_WE2)} with the region from x equals ${WE2.a} to x equals ${WE2.b} shaded below the x-axis`,
});

/* ---- note -------------------------------------------------------------------------------------- */

const blocks = [
  {
    type: "hero",
    lede: "Integration measures the space a curve encloses. Ask for the area between a curve, the x-axis and two vertical lines, and integration hands it to you exactly, with no counting of squares and no estimate. It is the same integral you already know, with two numbers attached.",
    can: [
      "Set up an integral for the area between a curve, the x-axis and two ordinates",
      "Report a region below the axis as a positive area, having noticed the negative integral",
      "Find the limits yourself from the curve when the question prints no ordinates",
    ],
    minutes: 12,
  },
  { type: "h", text: "The space a curve encloses" },
  {
    type: "p",
    md: `Draw the curve $y = ${tex(P_WE1)}$, mark the vertical lines $x = ${WE1.a}$ and $x = ${WE1.b}$, and look at the patch caught between them and the $x$-axis. That patch has an area. Counting squares would give an estimate; integration gives the exact value.\nThe two vertical lines are called the **ordinates**. They are the limits of the integral, and picking them correctly is the first thing an examiner looks for.`,
  },
  {
    type: "figure",
    alt: `The curve y equals x squared plus 1 drawn on axes, with the region between it, the x-axis and the vertical lines x equals 0 and x equals 3 shaded.`,
    svg: HERO_SVG,
    caption: `The shaded patch between $y = ${tex(P_WE1)}$, the $x$-axis and the ordinates $x = ${WE1.a}$ and $x = ${WE1.b}$.`,
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: `One tap to begin. In the picture above, the shaded region is bounded on the left and right by two vertical lines. What are those two lines called?`,
    options: ["The ordinates", "The tangents", "The asymptotes"],
    answer: "The ordinates",
    explain: `They are the ordinates, and they become the limits of the integral: the bottom limit is the left one and the top limit is the right one.`,
  },
  { type: "h", text: "1. Why an integral is an area" },
  {
    type: "p",
    md: `Fill the region with narrow vertical strips. A strip at $x$ is about $y$ tall and $dx$ wide, so it holds about $y \\, dx$ of area. Adding every strip from one ordinate to the other is what $\\int_{a}^{b} y \\, dx$ means.\nThe strips are an approximation; the integral is what they approach as they thin, which is why the answer is exact rather than an estimate.`,
  },
  {
    type: "figure",
    alt: `The same region filled with eight vertical strips whose tops meet the curve, illustrating how the strips add up to the area.`,
    svg: STRIPS_SVG,
    caption: `Each strip holds about $y \\, dx$. The integral is the limit of the sum.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the height comes from the curve",
    md: `A strip's height is the $y$ of the curve at that $x$, so what you integrate is the curve's equation, untouched. If a question hands you $\\frac{dy}{dx}$ instead, integrate once to reach $y$ before the limits go anywhere near it.`,
  },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: `Strips of height $y$ and width $dx$ are added from one ordinate to the other. Which integral gives the area between the curve $y = ${tex(P_WE1)}$, the $x$-axis and the ordinates $x = ${WE1.a}$ and $x = ${WE1.b}$?`,
    options: [
      `$\\int_{${WE1.a}}^{${WE1.b}} \\left(${tex(P_WE1)}\\right) dx$`,
      `$\\int_{${WE1.b}}^{${WE1.a}} \\left(${tex(P_WE1)}\\right) dx$`,
      `$\\int_{${WE1.a}}^{${WE1.b}} \\left(${tex(integrate(P_WE1))}\\right) dx$`,
    ],
    answer: `$\\int_{${WE1.a}}^{${WE1.b}} \\left(${tex(P_WE1)}\\right) dx$`,
    explain: `The curve's own equation goes inside, the left ordinate is the bottom limit and the right ordinate is the top limit.`,
  },
  { type: "h", text: "2. A worked area, start to finish" },
  {
    type: "p",
    md: `Find the area between $y = ${tex(P_WE1)}$, the $x$-axis and the ordinates $x = ${WE1.a}$ and $x = ${WE1.b}$.\n**Step 1.** Write the integral: $\\int_{${WE1.a}}^{${WE1.b}} \\left(${tex(P_WE1)}\\right) dx$.\n**Step 2.** Integrate, simplifying each term as you write it: $${bracketTex(P_WE1, WE1.a, WE1.b)}$.\n**Step 3.** Top limit: at $x = ${WE1.b}$ the bracket is $${fTex(at(WE1.F, WE1.b))}$. Bottom limit: at $x = ${WE1.a}$ it is $${fTex(at(WE1.F, WE1.a))}$.\n**Step 4.** Subtract, top minus bottom: $${fTex(at(WE1.F, WE1.b))} - \\left(${fTex(at(WE1.F, WE1.a))}\\right) = ${fTex(WE1.I)}$.`,
  },
  {
    type: "figure",
    alt: `The curve y equals x squared plus 1 with the region from x equals 0 to x equals 3 shaded, the region the worked example measures.`,
    svg: WE1_SVG,
    caption: `The region the four steps measure, between $x = ${WE1.a}$ and $x = ${WE1.b}$.`,
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: `Same method, new curve. For $y = ${tex(P2)}$ between the ordinates $x = ${J2.a}$ and $x = ${J2.b}$, the integral is $${bracketTex(P2, J2.a, J2.b)}$. What is the area?`,
    answer: fPlain(J2.area),
    explain: `At $x = ${J2.b}$ the bracket is $${fTex(at(J2.F, J2.b))}$ and at $x = ${J2.a}$ it is $${fTex(at(J2.F, J2.a))}$, so the area is $${fTex(J2.I)}$.`,
  },
  { type: "h", text: "3. Below the axis, the integral turns negative" },
  {
    type: "p",
    md: `Between $x = ${WE2.a}$ and $x = ${WE2.b}$ the curve $y = ${tex(P_WE2)}$ sits under the $x$-axis, so every strip has a negative height. The integral comes out as $${fTex(WE2.I)}$.\nAn area cannot be negative. The integral is telling you where the region is, not how big it is. Report the size: $${fTex(WE2.area)}$. Write one sentence saying the region lies below the axis, so the examiner can see the minus sign was noticed rather than lost.`,
  },
  {
    type: "figure",
    alt: `The curve y equals x squared minus 4x between x equals 0 and x equals 4, lying entirely below the x-axis, with the region shaded.`,
    svg: BELOW_SVG,
    caption: `Every strip hangs below the axis, so the integral is $${fTex(WE2.I)}$ and the area is $${fTex(WE2.area)}$.`,
  },
  {
    type: "video",
    videoId: "ggJANe9VEXs",
    title: "Integration - Area under a curve CCEA GCSE Further Mathematics",
    channel: "P McAleavey",
    why: "A Northern Ireland teacher working the same method against this specification, including the negative case.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: `A region lies below the $x$-axis and its integral works out as $${fTex(WE2.I)}$. What area should you write on the answer line?`,
    answer: fPlain(WE2.area),
    explain: `The minus sign records that the region is below the axis. The area is its size, $${fTex(WE2.area)}$.`,
  },
  { type: "h", text: "4. When the curve crosses between the ordinates" },
  {
    type: "p",
    md: `The curve $y = ${tex(P7)}$ crosses the $x$-axis at $x = ${J7.splitAt}$. Between $x = ${J7.a}$ and $x = ${J7.b}$ part of the region is below the axis and part is above.\nIntegrating straight across gives $${fTex(J7.I)}$, because the negative part cancels some of the positive part. Split at the root instead: $${fTex(J7.pieces.left)}$ on the left, $${fTex(J7.pieces.right)}$ on the right, so the total area is $${fTex(fNeg(J7.pieces.left))} + ${fTex(J7.pieces.right)} = ${fTex(J7.area)}$.`,
  },
  {
    type: "figure",
    alt: `The curve y equals x squared minus 4 from x equals 0 to x equals 4, shaded on both sides of the root at x equals 2, with a dashed vertical line at the root.`,
    svg: CROSS_SVG,
    caption: `Two regions, two integrals, two sizes added. The dashed line sits at the root, $x = ${J7.splitAt}$.`,
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Beyond what CCEA asks",
    md: `CCEA's guidance for this statement excludes combinations of positive and negative areas, so an exam region stays on one side of the axis. The split is insurance: one extra line, and a crossing region can never catch you out.`,
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `For the curve $y = ${tex(P7)}$ between $x = ${J7.a}$ and $x = ${J7.b}$, the piece to the left of the root integrates to $${fTex(J7.pieces.left)}$ and the piece to the right to $${fTex(J7.pieces.right)}$. What is the total area?`,
    answer: fPlain(J7.area),
    explain: `Take the size of each piece and add: $${fTex(fNeg(J7.pieces.left))} + ${fTex(J7.pieces.right)} = ${fTex(J7.area)}$. Adding the signed values instead would give $${fTex(J7.I)}$, which is the difference of the two sizes rather than their total.`,
  },
  { type: "h", text: "5. When the limits are not handed to you" },
  {
    type: "p",
    md: `Often a question names no ordinates, and asks only for the region a curve **traps against the $x$-axis**. The limits are then the curve's own $x$-intercepts, and finding them is the first mark.\nFor $y = ${tex(PA)}$, setting $y = 0$ gives $x = ${ROOTS_A[0]}$ and $x = ${ROOTS_A[1]}$. Those are the limits, and the region between them lies below the axis.`,
  },
  {
    type: "figure",
    alt: `The curve y equals x squared minus 5x plus 4 with the region between its two x-intercepts shaded below the axis.`,
    svg: fig(JA, {
      xLo: -0.4,
      xHi: 5,
      label: `the intercepts are the limits`,
      marks: [
        { x: ROOTS_A[0], y: 0, text: `x = ${ROOTS_A[0]}`, dy: -12 },
        { x: ROOTS_A[1], y: 0, text: `x = ${ROOTS_A[1]}`, dy: -12 },
      ],
      caption: `The curve y equals ${texSpoken(PA)} with the region between its two x-intercepts shaded`,
    }),
    caption: `No ordinates are given, so the intercepts $x = ${ROOTS_A[0]}$ and $x = ${ROOTS_A[1]}$ become the limits.`,
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025, Unit 1, Question 11",
    md: "Three things cost candidates the last mark here: the wrong limits, forgetting to integrate at all, and leaving the answer negative. The integral itself was usually right. Read the question once more before you write the answer line.",
    source: CER25,
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: `The curve $y = ${tex(P8)}$ meets the $x$-axis at $x = 0$ and $x = ${J8.b}$, and the region between those two points lies above the axis. Its integral is $${bracketTex(P8, J8.a, J8.b)}$. What is the area?`,
    answer: fPlain(J8.area),
    explain: `At $x = ${J8.b}$ the bracket is $${fTex(at(J8.F, J8.b))}$ and at $x = 0$ it is $${fTex(at(J8.F, 0))}$, so the area is $${fTex(J8.area)}$.`,
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: `Write $\\int_{a}^{b} y \\, dx$ for the area between a curve, the $x$-axis and two ordinates.\nIntegrate, substitute the top limit and then the bottom, and subtract in that order.\nRead a negative integral as a region below the axis and give the area as its size.\nFind the limits from the $x$-intercepts when the question prints none.\nSay in one line why a negative integral is not itself the area.`,
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: `The wording asks for the area a curve traps against the $x$-axis between two ordinates, for $3$ or $4$ marks, often as the last part of a long curve question. The first mark is the integral written with the right limits; the last is the positive area on the answer line. If you are stuck, write the integral sign with its two limits and the curve's equation inside: that line alone earns the first mark.`,
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.02` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
  { type: "prompt", promptId: `rp.${TOPIC}.06` },
];

/* ---- items ---------------------------------------------------------------------------------------- */

const numAns = (value, { forms = ["decimal", "fraction"] } = {}) => ({
  kind: "numeric",
  value,
  tolerance: { type: "absolute", value: 0.0005 },
  unitRequired: false,
  acceptForms: forms,
});

const ce = (misconception, value, feedback, marks, source) => ({
  misconception,
  // A numeric commonError with no tolerance is an exact match only, so a learner who writes the
  // rounded form of the wrong route (5.33 for 16/3) gets the generic near-miss instead of the
  // authored diagnosis. Every pattern carries the tolerance its part accepts.
  pattern: { kind: "numeric", value, tolerance: { type: "absolute", value: 0.005 } },
  feedback,
  marksTypicallyEarned: marks,
  source,
});

/** The three lines a scheme prints for a 3-mark area, in FM mark language. */
const areaScheme = (J, marks) => {
  const s = [
    { id: "MW1", code: "MW", marks: 1, for: `$\\int_{${J.a}}^{${J.b}} \\left(${tex(J.P)}\\right) dx$, with both limits` },
    { id: "M2", code: "M", marks: 1, for: `$${bracketTex(J.P, J.a, J.b)}$, each term simplified` },
  ];
  if (marks === 4) s.push({ id: "M3", code: "M", marks: 1, for: "substituting both limits, each inside its own bracket", dependsOn: ["M2"] });
  s.push({ id: "W1", code: "W", marks: 1, for: `$${fTex(J.area)}$`, ft: true, dependsOn: ["M2"] });
  return s;
};

const areaSolution = (J) =>
  `Area $= \\int_{${J.a}}^{${J.b}} \\left(${tex(J.P)}\\right) dx = ${bracketTex(J.P, J.a, J.b)}$.\nAt $x = ${J.b}$ the bracket is $${fTex(at(J.F, J.b))}$; at $x = ${J.a}$ it is $${fTex(at(J.F, J.a))}$.\nSubtracting: $${fTex(at(J.F, J.b))} - \\left(${fTex(at(J.F, J.a))}\\right) = ${fTex(J.I)}$.${
    fVal(J.I) < 0 ? `\nThe region lies below the $x$-axis, so the area is $${fTex(J.area)}$.` : ""
  }`;

const regionFigure = (J, opts) => [figure(fig(J, opts), opts.alt)];

const questions = [
  {
    id: `q.${TOPIC}.0001`,
    difficulty: 1,
    style: "practice",
    commandWords: ["Find"],
    setting: "A straight line above the axis, the simplest region of all",
    figures: regionFigure(J1, {
      xLo: 0,
      xHi: 5,
      label: `y = ${texPlain(P1)}`,
      caption: `The line y equals ${texSpoken(P1)} with the region between it, the x-axis and the ordinates x equals ${J1.a} and x equals ${J1.b} shaded`,
      alt: `The line y equals 2x plus 1 with the region between it, the x-axis and the vertical lines x equals 1 and x equals 4 shaded.`,
    }),
    parts: [
      {
        id: "main",
        stem: `The diagram shows the line $y = ${tex(P1)}$.\nFind the area of the shaded region, bounded by the line, the $x$-axis and the ordinates $x = ${J1.a}$ and $x = ${J1.b}$.`,
        marks: 3,
        answer: numAns(fVal(J1.area)),
        scheme: areaScheme(J1, 3),
        hints: [`Write the integral with $${J1.a}$ at the bottom and $${J1.b}$ at the top.`, "Integrate, then substitute the top limit and the bottom one."],
        workedSolution: areaSolution(J1),
        commonErrors: [
          ce("fm.int.limits-reversed", E.j1Rev, `The integrating and both substitutions are right, so the method marks stand. The subtraction is the wrong way round: it is the top limit take away the bottom, giving $${fTex(J1.area)}$.`, 2, CER19),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0002`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Find"],
    setting: "A single power term between two ordinates",
    figures: regionFigure(J2, {
      xLo: 0,
      xHi: 2.6,
      label: `y = ${texPlain(P2)}`,
      caption: `The curve y equals ${texSpoken(P2)} with the region between x equals ${J2.a} and x equals ${J2.b} shaded`,
      alt: `The curve y equals 3x squared with the region between it, the x-axis and the vertical lines x equals 1 and x equals 2 shaded.`,
    }),
    parts: [
      {
        id: "main",
        stem: `Find the area of the region bounded by the curve $y = ${tex(P2)}$, the $x$-axis and the ordinates $x = ${J2.a}$ and $x = ${J2.b}$.`,
        marks: 3,
        answer: numAns(fVal(J2.area)),
        scheme: areaScheme(J2, 3),
        hints: ["Raise the index by one, then divide by the new index."],
        workedSolution: areaSolution(J2),
        commonErrors: [
          ce("fm.int.power-not-raised", E.j2Power, `The coefficient was divided by the new index but the index itself never went up, so $${tex(P2)}$ became $${tex(P2.map((t) => ({ c: frac(t.c.n, t.c.d * (t.p + 1)), p: t.p })))}$ instead of $${tex(J2.F)}$. Both halves of the rule are needed.`, 0, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0003`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Find"],
    setting: "Two terms, with the lower ordinate at the origin",
    figures: regionFigure(J3, {
      xLo: -0.4,
      xHi: 3.6,
      label: `y = ${texPlain(P3)}`,
      caption: `The curve y equals ${texSpoken(P3)} with the region between x equals ${J3.a} and x equals ${J3.b} shaded`,
      alt: `The curve y equals x squared plus 2x with the region between it, the x-axis and the vertical line x equals 3 shaded.`,
    }),
    parts: [
      {
        id: "main",
        stem: `Find the area trapped between the curve $y = ${tex(P3)}$ and the $x$-axis, from the ordinate $x = ${J3.a}$ and $x = ${J3.b}$.`,
        marks: 3,
        answer: numAns(fVal(J3.area)),
        scheme: areaScheme(J3, 3),
        hints: ["Integrate both terms.", "Substituting the bottom limit gives zero here, but write the line down anyway."],
        workedSolution: areaSolution(J3),
        commonErrors: [
          ce("fm.int.coefficient-not-divided", E.j3Coef, `Each index went up by one but no coefficient was divided, so the integral was read as $${tex(P3.map((t) => ({ c: t.c, p: t.p + 1 })))}$ rather than $${tex(J3.F)}$. Dividing by the new index is the other half of the rule.`, 0, CER25),
          ce("fm.int.differentiated-instead", E.j3Diff, `That value comes from differentiating $${tex(P3)}$ and putting the limits into the derivative. An area needs the integral, so raise each index instead of lowering it.`, 0, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0004`,
    difficulty: 3,
    style: "practice",
    commandWords: ["Find"],
    setting: "A symmetric region straddling the y-axis, with a negative lower limit",
    figures: regionFigure(J4, {
      xLo: -2.8,
      xHi: 2.8,
      label: `y = ${texPlain(P4)}`,
      caption: `The curve y equals ${texSpoken(P4)} with the region between x equals ${J4.a} and x equals ${J4.b} shaded above the x-axis`,
      alt: `The curve y equals 4 minus x squared with the region between it and the x-axis, from x equals minus 2 to x equals 2, shaded.`,
    }),
    parts: [
      {
        id: "main",
        stem: `Find the area of the region this curve traps against the $x$-axis.\nGive your answer as an exact fraction.`,
        marks: 4,
        answer: numAns(fVal(J4.area), { forms: ["fraction", "mixed"] }),
        scheme: areaScheme(J4, 4),
        hints: [`The curve meets the $x$-axis where $${tex(P4)} = 0$.`, "Take care with the signs when the bottom limit is negative."],
        workedSolution: `The curve meets the $x$-axis where $${tex(P4)} = 0$, so $x = ${J4.a}$ and $x = ${J4.b}$.\n${areaSolution(J4)}`,
        commonErrors: [
          ce("fm.int.lower-limit-ignored", E.j4Low, `The top limit was substituted correctly. The bottom limit at $x = ${J4.a}$ still has to be substituted and taken away, which gives $${fTex(J4.area)}$.`, 2, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0005`,
    difficulty: 3,
    style: "practice",
    commandWords: ["Find"],
    setting: "A region entirely below the axis, where the integral is negative",
    figures: regionFigure(J5, {
      xLo: -0.5,
      xHi: 3.8,
      label: `y = ${texPlain(P5)}`,
      caption: `The curve y equals ${texSpoken(P5)} with the region between x equals ${J5.a} and x equals ${J5.b} shaded below the x-axis`,
      alt: `The curve y equals x squared minus 9 with the region between it, the x-axis and the vertical lines x equals 0 and x equals 3 shaded below the axis.`,
    }),
    parts: [
      {
        id: "main",
        stem: `The diagram shows the curve $y = ${tex(P5)}$.\nFind the area of the shaded region between this curve and the $x$-axis, from the ordinate $x = ${J5.a}$ and $x = ${J5.b}$.`,
        marks: 4,
        answer: numAns(fVal(J5.area)),
        scheme: areaScheme(J5, 4),
        hints: ["Integrate and substitute as usual.", "The region is below the axis, so say what the sign of your integral means."],
        workedSolution: areaSolution(J5),
        commonErrors: [
          ce("fm.int.negative-area-left", E.j5Neg, `Every step is right and the last line is not. A negative integral says the region lies below the $x$-axis; the area is its size, $${fTex(J5.area)}$.`, 3, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0006`,
    difficulty: 3,
    style: "practice",
    commandWords: ["Find"],
    setting: "A second below-axis region, with a coefficient in the squared term",
    figures: regionFigure(J6, {
      xLo: -0.4,
      xHi: 2.6,
      label: `y = ${texPlain(P6)}`,
      caption: `The curve y equals ${texSpoken(P6)} with the region between x equals ${J6.a} and x equals ${J6.b} shaded below the x-axis`,
      alt: `The curve y equals 3x squared minus 12 with the region between it, the x-axis and the vertical lines x equals 0 and x equals 2 shaded below the axis.`,
    }),
    parts: [
      {
        id: "main",
        stem: `Find the area of the region bounded by the curve $y = ${tex(P6)}$, the $x$-axis and the ordinates $x = ${J6.a}$ and $x = ${J6.b}$.`,
        marks: 4,
        answer: numAns(fVal(J6.area)),
        scheme: areaScheme(J6, 4),
        hints: ["Integrate both terms.", `A negative integral is telling you where the region is, not how big it is.`],
        workedSolution: areaSolution(J6),
        commonErrors: [
          ce("fm.int.negative-area-left", E.j6Neg, `The integral is right. It is negative because the region hangs below the axis, so write the area as $${fTex(J6.area)}$.`, 3, CER22),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0008`,
    difficulty: 3,
    style: "practice",
    commandWords: ["Find"],
    setting: "No ordinates printed, so the intercepts have to be found first",
    figures: regionFigure(J8, {
      xLo: -0.6,
      xHi: 6.6,
      label: `y = ${texPlain(P8)}`,
      caption: `The curve y equals ${texSpoken(P8)} with the region between its two x-intercepts shaded above the x-axis`,
      alt: `The curve y equals 6x minus x squared with the region between it and the x-axis, from x equals 0 to x equals 6, shaded.`,
    }),
    parts: [
      {
        id: "main",
        stem: `Find the area of the region the curve $y = ${tex(P8)}$ traps against the $x$-axis.`,
        marks: 4,
        answer: numAns(fVal(J8.area)),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$x = 0$ and $x = ${J8.b}$ from $${tex(P8)} = 0$` },
          { id: "M2", code: "M", marks: 1, for: `$\\int_{0}^{${J8.b}} \\left(${tex(P8)}\\right) dx$` },
          { id: "M3", code: "M", marks: 1, for: `$${bracketTex(P8, J8.a, J8.b)}$, each term simplified` },
          { id: "W1", code: "W", marks: 1, for: `$${fTex(J8.area)}$`, ft: true, dependsOn: ["M3"] },
        ],
        hints: [`Set $${tex(P8)} = 0$ and factorise to find where the curve meets the axis.`, "Those two values are the limits."],
        workedSolution: `$${tex(P8)} = 0$ factorises to $x\\left(6 - x\\right) = 0$, so $x = 0$ and $x = ${J8.b}$.\n${areaSolution(J8)}`,
        commonErrors: [
          ce("fm.int.limits-into-integrand", E.j8Curve, `The two limits were put straight into $${tex(P8)}$ and subtracted. They belong in the integrated expression $${tex(J8.F)}$, which gives $${fTex(J8.area)}$.`, 1, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0009`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Find"],
    setting: "A small region whose area is an exact fraction",
    figures: regionFigure(J9, {
      xLo: 0,
      xHi: 2.6,
      label: `y = ${texPlain(P9)}`,
      caption: `The curve y equals ${texSpoken(P9)} with the region between x equals ${J9.a} and x equals ${J9.b} shaded`,
      alt: `The curve y equals x squared with the region between it, the x-axis and the vertical lines x equals 1 and x equals 2 shaded.`,
    }),
    parts: [
      {
        id: "main",
        stem: `Find the area trapped between the curve $y = ${tex(P9)}$ and the $x$-axis, from the ordinate $x = ${J9.a}$ and $x = ${J9.b}$.\nGive your answer as an exact fraction.`,
        marks: 3,
        answer: numAns(fVal(J9.area), { forms: ["fraction", "mixed"] }),
        scheme: areaScheme(J9, 3),
        hints: ["Keep the thirds as fractions instead of turning them into decimals."],
        workedSolution: areaSolution(J9),
        commonErrors: [
          ce("fm.int.power-not-raised", E.j9Power, `The coefficient was divided by $3$ but the index stayed at $2$, so the integral was read as $${tex(P9.map((t) => ({ c: frac(t.c.n, t.c.d * (t.p + 1)), p: t.p })))}$ rather than $${tex(J9.F)}$.`, 0, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0010`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Find"],
    setting: "A straight line below the axis, so the negative integral appears at the simplest possible tariff",
    figures: regionFigure(J10, {
      xLo: 0.4,
      xHi: 4.6,
      label: `y = ${texPlain(P10)}`,
      caption: `The line y equals ${texSpoken(P10)} with the region between x equals ${J10.a} and x equals ${J10.b} shaded below the x-axis`,
      alt: `The line y equals 2x minus 8 with the region between it, the x-axis and the vertical lines x equals 1 and x equals 4 shaded below the axis.`,
    }),
    parts: [
      {
        id: "main",
        stem: `Find the area of the region bounded by the line $y = ${tex(P10)}$, the $x$-axis and the ordinates $x = ${J10.a}$ and $x = ${J10.b}$.`,
        marks: 3,
        answer: numAns(fVal(J10.area)),
        scheme: areaScheme(J10, 3),
        hints: ["The line sits below the axis across the whole interval."],
        workedSolution: areaSolution(J10),
        commonErrors: [
          ce("fm.int.negative-area-left", E.j10Neg, `That is the integral, and it is negative because the region hangs below the axis. The area is its size, $${fTex(J10.area)}$.`, 2, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0011`,
    difficulty: 4,
    style: "exam-style",
    commandWords: ["Find"],
    setting: "Intercepts then area, the shape a Unit 1 curve question takes in its closing parts",
    figures: regionFigure(JA, {
      xLo: -0.5,
      xHi: 5.2,
      label: `y = ${texPlain(PA)}`,
      caption: `The curve y equals ${texSpoken(PA)} with the region between its two x-intercepts shaded below the x-axis`,
      alt: `The curve y equals x squared minus 5x plus 4 with the region between its two x-intercepts shaded below the x-axis.`,
    }),
    parts: [
      {
        id: "a",
        stem: `The diagram shows the curve $y = ${tex(PA)}$.\nFind the coordinates of the two points at which this curve meets the $x$-axis.`,
        marks: 2,
        answer: {
          kind: "text",
          accepted: [`(${ROOTS_A[0]}, 0) and (${ROOTS_A[1]}, 0)`, `(${ROOTS_A[0]}, 0), (${ROOTS_A[1]}, 0)`, `x = ${ROOTS_A[0]} gives (${ROOTS_A[0]}, 0) and x = ${ROOTS_A[1]} gives (${ROOTS_A[1]}, 0)`],
          keyWords: [
            { any: [`(${ROOTS_A[0]}, 0)`, `${ROOTS_A[0]}, 0`], marks: 1 },
            { any: [`(${ROOTS_A[1]}, 0)`, `${ROOTS_A[1]}, 0`], marks: 1 },
          ],
          listingRule: false,
        },
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$\\left(x - ${ROOTS_A[0]}\\right)\\left(x - ${ROOTS_A[1]}\\right) = 0$` },
          { id: "W1", code: "W", marks: 1, for: `$\\left(${ROOTS_A[0]}, 0\\right)$ and $\\left(${ROOTS_A[1]}, 0\\right)$` },
        ],
        hints: [`Set $y = 0$ and factorise.`, "The question asks for coordinates, so give a pair for each point."],
        workedSolution: `Setting $y = 0$: $${tex(PA)} = 0$ factorises to $(x - ${ROOTS_A[0]})(x - ${ROOTS_A[1]}) = 0$.\nSo $x = ${ROOTS_A[0]}$ and $x = ${ROOTS_A[1]}$, and the points are $(${ROOTS_A[0]}, 0)$ and $(${ROOTS_A[1]}, 0)$.`,
        commonErrors: [],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: `Find the area of the shaded region, which the curve traps against the $x$-axis.`,
        marks: 4,
        answer: numAns(fVal(JA.area)),
        scheme: areaScheme(JA, 4),
        hints: ["The limits are the two intercepts you have just found.", "The region lies below the axis, so expect a negative integral."],
        workedSolution: areaSolution(JA),
        commonErrors: [
          ce("fm.int.negative-area-left", E.jaNeg, `The integral is right and the answer line is not. A negative value records a region below the $x$-axis; its area is $${fTex(JA.area)}$.`, 3, CER25),
          // A reversed subtraction here produces the same magnitude as the correct area, so it is
          // invisible on the answer line and no pattern is authored for it: the feedback would
          // describe an error the marker could never see.
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  },
  {
    id: `q.${TOPIC}.0012`,
    difficulty: 4,
    style: "exam-style",
    commandWords: ["Write down", "Find"],
    setting: "One curve, one region above the axis and one below, as a late-paper three-part question",
    figures: [
      figure(
        regionSvg(PB, {
          xLo: -0.4,
          xHi: 3.4,
          shade: [{ a: 0, b: 2 }, { a: 2, b: 3 }],
          splitAt: 2,
          label: `y = ${texPlain(PB)}`,
          caption: `The curve y equals ${texSpoken(PB)} with the region from x equals 0 to x equals 2 shaded above the x-axis and the region from x equals 2 to x equals 3 shaded below it`,
        }),
        `The curve y equals 8 minus 2x squared, with the region from x equals 0 to x equals 2 shaded above the x-axis and the region from x equals 2 to x equals 3 shaded below it.`,
      ),
    ],
    parts: [
      {
        id: "a",
        stem: `The diagram shows the curve $y = ${tex(PB)}$.\nWrite down the coordinates at which this curve meets the positive $x$-axis.`,
        marks: 1,
        answer: {
          kind: "text",
          accepted: [`(${ROOTS_B[0]}, 0)`, `${ROOTS_B[0]}, 0`, `the curve crosses at (${ROOTS_B[0]}, 0)`],
          keyWords: [{ any: [`(${ROOTS_B[0]}, 0)`, `${ROOTS_B[0]}, 0`], marks: 1 }],
          listingRule: false,
        },
        scheme: [{ id: "W1", code: "W", marks: 1, for: `$\\left(${ROOTS_B[0]}, 0\\right)$` }],
        hints: [`Solve $${tex(PB)} = 0$ and take the positive root.`],
        workedSolution: `$${tex(PB)} = 0$ gives $x^{2} = 4$, so $x = ${ROOTS_B[0]}$ on the positive side.\nThe point is $(${ROOTS_B[0]}, 0)$.`,
        commonErrors: [],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: `Find the area of the region this curve traps between the $x$-axis and the $y$-axis.\nGive your answer as an exact fraction.`,
        marks: 4,
        answer: numAns(fVal(JB1.area), { forms: ["fraction", "mixed"] }),
        scheme: areaScheme(JB1, 4),
        hints: [`The $y$-axis is the ordinate $x = 0$.`, "The other limit is the intercept from part (a)."],
        workedSolution: areaSolution(JB1),
        commonErrors: [
          ce("fm.int.coefficient-not-divided", E.jb1Coef, `Each index went up correctly but the coefficient was never divided by the new index, so the integral was read as $${tex(PB.map((t) => ({ c: t.c, p: t.p + 1 })))}$ instead of $${tex(JB1.F)}$.`, 1, CER25),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
      {
        id: "c",
        stem: `Find the area of the region between this curve and the $x$-axis, up to the ordinate $x = ${JB2.b}$.\nGive your answer as an exact fraction.`,
        marks: 4,
        answer: numAns(fVal(JB2.area), { forms: ["fraction", "mixed"] }),
        scheme: areaScheme(JB2, 4),
        hints: ["This region lies below the axis.", "The limits are the intercept and the ordinate the question names."],
        workedSolution: areaSolution(JB2),
        commonErrors: [
          ce("fm.int.negative-area-left", E.jb2Neg, `That is the integral, and it is negative because this second region lies under the axis. Its area is $${fTex(JB2.area)}$.`, 3, CER22),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  },
];

function buildQuestion(q) {
  const totalMarks = q.parts.reduce((s, p) => s + p.marks, 0);
  const verbFor = (p) => (p.stem.includes("Write down") ? "write-down" : "find");
  return {
    id: q.id,
    topic: TOPIC,
    specRefs: REFS,
    paper: PAPER,
    tier: "untiered",
    style: q.style,
    difficulty: q.difficulty,
    ao: q.style === "exam-style" ? ["AO1", "AO2", "AO3"] : ["AO1", "AO2"],
    commandWords: q.commandWords,
    emphasis: [],
    context: { setting: q.setting, original: true },
    figures: q.figures ?? [],
    parts: q.parts,
    totalMarks,
    timeAllowanceSec: Math.round(totalMarks * 1.2 * 60),
    skeleton: q.parts.map((p) => `(${p.id})${verbFor(p)}${p.marks}`).join("|"),
    examinerSources: [CER25, CER22],
    solutionProgram: q.parts.map((p) => `${p.id}: ${p.workedSolution.replace(/\n/g, " ")}`).join(" || "),
    verification: `ver.${q.id}`,
    version: 1,
  };
}

const builtQuestions = questions.map(buildQuestion);

const workedExamples = [
  {
    id: `we.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: REFS,
    paper: PAPER,
    stem: `Find the area of the region bounded by the curve $y = ${tex(P_WE1)}$, the $x$-axis and the ordinates $x = ${WE1.a}$ and $x = ${WE1.b}$.`,
    figure: figure(WE1_SVG, `The curve y equals x squared plus 1 with the region between it, the x-axis and the vertical lines x equals 0 and x equals 3 shaded.`),
    steps: [
      {
        n: 1,
        working: `Write the integral: $\\int_{${WE1.a}}^{${WE1.b}} \\left(${tex(P_WE1)}\\right) dx$.`,
        decision: "The left ordinate is the bottom limit and the right one is the top limit. This line is the first mark and it costs no arithmetic, so write it even if the rest defeats you.",
        earns: ["MW1"],
      },
      {
        n: 2,
        working: `Integrate, simplifying each term as you write it: $${bracketTex(P_WE1, WE1.a, WE1.b)}$.`,
        decision: "Simplifying now rather than after the limits go in is what keeps the arithmetic small; the examiners name unsimplified terms as a source of slips.",
        whyMenu: {
          options: [
            "Because the area is the integral of the curve's own equation",
            "Because the limits have to be differentiated first",
            "Because the constant of integration is needed here",
          ],
          correct: 0,
          explain: `A strip's height is the curve's $y$, so the expression inside the integral is the curve itself. A definite integral needs no constant: it cancels in the subtraction.`,
        },
        earns: ["M2"],
      },
      {
        n: 3,
        working: `Top limit first: at $x = ${WE1.b}$ the bracket is $${fTex(at(WE1.F, WE1.b))}$. Then the bottom: at $x = ${WE1.a}$ it is $${fTex(at(WE1.F, WE1.a))}$.`,
        decision: "Putting each substitution in its own bracket is what stops a sign going astray when the bottom value is negative.",
        earns: ["M3"],
      },
      {
        n: 4,
        working: `Subtract, top minus bottom: $${fTex(at(WE1.F, WE1.b))} - \\left(${fTex(at(WE1.F, WE1.a))}\\right) = ${fTex(WE1.I)}$.`,
        decision: `The value is positive, which matches the picture: the whole region sits above the axis. A sanity check like that takes a second and catches a reversed subtraction.`,
        earns: ["W1"],
      },
    ],
    finalAnswer: `$${fTex(WE1.area)}$`,
    twin: {
      stem: `Find the area trapped between the curve $y = ${tex(TWIN1.P)}$ and the $x$-axis, from the ordinate $x = ${TWIN1.a}$ and $x = ${TWIN1.b}$.`,
      answer: numAns(fVal(TWIN1.area)),
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TOPIC}.01`,
    version: 1,
  },
  {
    id: `we.${TOPIC}.02`,
    topic: TOPIC,
    specRefs: REFS,
    paper: PAPER,
    stem: `Find the area of the region bounded by the curve $y = ${tex(P_WE2)}$, the $x$-axis and the ordinates $x = ${WE2.a}$ and $x = ${WE2.b}$.`,
    figure: figure(WE2_SVG, `The curve y equals x squared minus 4x between x equals 0 and x equals 4, lying below the x-axis, with the region shaded.`),
    steps: [
      {
        n: 1,
        working: `Write the integral: $\\int_{${WE2.a}}^{${WE2.b}} \\left(${tex(P_WE2)}\\right) dx$.`,
        decision: "The set-up is the same whichever side of the axis the region is on. Nothing about the limits changes.",
        earns: ["MW1"],
      },
      {
        n: 2,
        working: `Integrate: $${bracketTex(P_WE2, WE2.a, WE2.b)}$.`,
        decision: "Raise each index by one and divide by the new index. The examiners see both halves of that rule dropped, so say it to yourself as you write.",
        earns: ["M2"],
      },
      {
        n: 3,
        working: `At $x = ${WE2.b}$ the bracket is $${fTex(at(WE2.F, WE2.b))}$; at $x = ${WE2.a}$ it is $${fTex(at(WE2.F, WE2.a))}$. Subtracting gives $${fTex(WE2.I)}$.`,
        decision: "A negative result is information, not a mistake. It says every strip in this region hangs below the axis.",
        whyMenu: {
          options: [
            "Because the region lies below the x-axis, so every strip has a negative height",
            "Because the limits were written the wrong way round",
            "Because the curve was differentiated instead of integrated",
          ],
          correct: 0,
          explain: `The limits are in the right order, bottom to top. The minus sign comes from the curve being under the axis across the whole interval.`,
        },
        earns: ["M3"],
      },
      {
        n: 4,
        working: `The region lies below the $x$-axis, so the area is $${fTex(WE2.area)}$.`,
        decision: "Write that sentence. It shows the examiner the sign was read rather than quietly dropped, and it is where the last mark lives.",
        earns: ["W1"],
      },
    ],
    finalAnswer: `$${fTex(WE2.area)}$`,
    twin: {
      stem: `Find the area trapped between the curve $y = ${tex(TWIN2.P)}$ and the $x$-axis, from the ordinate $x = ${TWIN2.a}$ and $x = ${TWIN2.b}$.`,
      answer: numAns(fVal(TWIN2.area)),
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TOPIC}.02`,
    version: 1,
  },
];

const diagnostics = [
  {
    id: `dx.${TOPIC}.pre`,
    topic: TOPIC,
    specRefs: REFS,
    when: "pre",
    items: [
      {
        id: "p1",
        stem: `Three quick checks on what this lesson is built from. None of them is the new idea, so answer from what you already know.\nWhat is $\\int \\left(${tex(P2)}\\right) dx$?`,
        skill: "Integrate a single power term",
        options: [
          { id: "a", text: `$${tex(J2.F)} + c$`, correct: true, feedback: `Raise the index to $3$ and divide the coefficient by $3$, which leaves $${tex(J2.F)}$.` },
          { id: "b", text: `$${tex(P2.map((t) => ({ c: frac(t.c.n, t.c.d * (t.p + 1)), p: t.p })))} + c$`, correct: false, feedback: `The coefficient was divided but the index stayed at $2$. Both halves of the rule apply.` },
          { id: "c", text: `$${tex(P2.map((t) => ({ c: t.c, p: t.p + 1 })))} + c$`, correct: false, feedback: `The index went up but the coefficient was never divided by the new index.` },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "p2",
        stem: `What is the value of $\\int_{${J2.a}}^{${J2.b}} \\left(${tex(P2)}\\right) dx$?`,
        skill: "Evaluate a definite integral",
        options: [
          { id: "a", text: `$${fTex(J2.I)}$`, correct: true, feedback: `$${fTex(at(J2.F, J2.b))} - \\left(${fTex(at(J2.F, J2.a))}\\right) = ${fTex(J2.I)}$.` },
          { id: "b", text: `$${fTex(at(J2.F, J2.b))}$`, correct: false, feedback: `Only the top limit has been substituted. The bottom one still has to be taken away.` },
          { id: "c", text: `$${fTex(fNeg(J2.I))}$`, correct: false, feedback: `The subtraction is the wrong way round. It is the top limit take away the bottom.` },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "p3",
        stem: `Where does the curve $y = ${tex(P7)}$ cross the $x$-axis?`,
        skill: "Find the x-intercepts of a quadratic",
        options: [
          { id: "a", text: "$x = 2$ and $x = -2$", correct: true, feedback: `Setting $y = 0$ gives $x^{2} = 4$, so $x = 2$ or $x = -2$.` },
          { id: "b", text: "$x = 4$ and $x = -4$", correct: false, feedback: `That is the value of $x^{2}$, not of $x$. Take the square root of $4$.` },
          { id: "c", text: "$x = 2$ only", correct: false, feedback: `A square root has two values, so the curve meets the axis twice.` },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
    ],
  },
  {
    id: `dx.${TOPIC}.post`,
    topic: TOPIC,
    specRefs: REFS,
    when: "post",
    items: [
      {
        id: "d1",
        stem: `Which integral gives the area between the curve $y = ${tex(P3)}$, the $x$-axis and the ordinates $x = ${J3.a}$ and $x = ${J3.b}$?`,
        skill: "Set up the integral with the right limits",
        options: [
          { id: "a", text: `$\\int_{${J3.a}}^{${J3.b}} \\left(${tex(P3)}\\right) dx$`, correct: true, feedback: `The curve's own equation goes inside, with the left ordinate at the bottom and the right one at the top.` },
          { id: "b", text: `$\\int_{${J3.b}}^{${J3.a}} \\left(${tex(P3)}\\right) dx$`, correct: false, misconception: "fm.int.limits-reversed", feedback: `The limits are the wrong way round, which changes the sign of everything that follows.` },
          { id: "c", text: `$\\int_{${J3.a}}^{${J3.b}} \\left(${tex(J3.F)}\\right) dx$`, correct: false, misconception: "fm.int.limits-into-integrand", feedback: `That is the integrated expression, already integrated once. What goes inside the integral is the curve itself.` },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d2",
        stem: `A region lies below the $x$-axis and its integral works out as $${fTex(J5.I)}$. What is the area?`,
        skill: "Report a below-axis region",
        options: [
          { id: "a", text: `$${fTex(J5.area)}$`, correct: true, feedback: `The minus sign says the region is below the axis; the area is its size.` },
          { id: "b", text: `$${fTex(J5.I)}$`, correct: false, misconception: "fm.int.negative-area-left", feedback: `An area cannot be negative. The integral tells you where the region is, and the answer line wants how big it is.` },
          { id: "c", text: "$0$", correct: false, misconception: "fm.int.negative-area-left", feedback: `The region has a real size. A negative integral is not an empty region.` },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d3",
        stem: `The curve $y = ${tex(P11)}$ meets the $x$-axis at $x = ${J11.a}$ and $x = ${J11.b}$, and the region between them lies above the axis. Its integral is $${bracketTex(P11, J11.a, J11.b)}$. What is the area?`,
        skill: "Compute the area once the limits come from the intercepts",
        options: [
          { id: "a", text: `$${fTex(J11.area)}$`, correct: true, feedback: `At $x = ${J11.b}$ the bracket is $${fTex(at(J11.F, J11.b))}$ and at $x = ${J11.a}$ it is $${fTex(at(J11.F, J11.a))}$, so the area is $${fTex(J11.area)}$.` },
          { id: "b", text: `$${fTex(at(J11.F, J11.b))}$`, correct: false, misconception: "fm.int.lower-limit-ignored", feedback: `Only the top limit has been substituted. The bottom one at $x = ${J11.a}$ still has to be taken away.` },
          { id: "c", text: `$${fTex(fNeg(J11.area))}$`, correct: false, misconception: "fm.int.limits-reversed", feedback: `The subtraction is the wrong way round. It is the top limit take away the bottom, which gives $${fTex(J11.area)}$.` },
        ],
        secondsExpected: 40,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d4",
        stem: `A question asks for the whole region the curve $y = ${tex(P8)}$ traps against the $x$-axis, and prints no ordinates. What are the limits?`,
        skill: "Find the limits when none are printed",
        options: [
          { id: "a", text: `$x = 0$ and $x = ${J8.b}$, where the curve meets the $x$-axis`, correct: true, feedback: `Setting $y = 0$ gives the two intercepts, and those are the limits.` },
          { id: "b", text: "$x = 0$ and $x = 1$, because no other values are given", correct: false, misconception: "fm.int.limits-not-from-the-question", feedback: `Limits are never invented. Solve $y = 0$ to find where the enclosed region starts and stops.` },
          { id: "c", text: `$y = 0$ and $y = ${fTex(at(P8, 3))}$, the smallest and largest heights`, correct: false, misconception: "fm.int.limits-not-from-the-question", feedback: `The limits of $\\int y \\, dx$ are values of $x$, not of $y$.` },
        ],
        secondsExpected: 35,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d5",
        stem: `Integrating $y = ${tex(P3)}$ gives which expression?`,
        skill: "Apply both halves of the integration rule",
        options: [
          { id: "a", text: `$${tex(J3.F)}$`, correct: true, feedback: `Each index rises by one and each coefficient is divided by its new index.` },
          { id: "b", text: `$${tex(P3.map((t) => ({ c: t.c, p: t.p + 1 })))}$`, correct: false, misconception: "fm.int.coefficient-not-divided", feedback: `The indices are right and no coefficient was divided by the new index.` },
          { id: "c", text: `$${tex(P3.map((t) => ({ c: frac(t.c.n, t.c.d * (t.p + 1)), p: t.p })))}$`, correct: false, misconception: "fm.int.power-not-raised", feedback: `The coefficients were divided and the indices never moved.` },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
    ],
  },
];

const findTheMistake = [
  {
    id: `ftm.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: REFS,
    stem: `Niamh was asked for the area of the region bounded by the curve $y = ${tex(P6)}$, the $x$-axis and the ordinates $x = ${J6.a}$ and $x = ${J6.b}$. Her working:`,
    studentWorking: [
      `Area = $\\int_{${J6.a}}^{${J6.b}} \\left(${tex(P6)}\\right) dx$`,
      `= $${bracketTex(P6, J6.a, J6.b)}$`,
      `at x = ${J6.b}: ${fTex(at(J6.F, J6.b))}`,
      `at x = ${J6.a}: ${fTex(at(J6.F, J6.a))}`,
      `${fTex(at(J6.F, J6.b))} - (${fTex(at(J6.F, J6.a))}) = ${fTex(J6.I)}`,
      `Area = ${fTex(J6.I)}`,
    ],
    mistakeLine: 6,
    misconception: "fm.int.negative-area-left",
    whatWentWrong: `Lines 1 to 5 are all correct: the integral is set up with the right limits, the integration is right, and the subtraction is the right way round.\nLine 6 copies the integral onto the answer line. The integral came out negative because the whole region lies below the $x$-axis, and an area cannot be negative.\nThe area is the size of that value, $${fTex(J6.area)}$.`,
    correction: [`The region lies below the x-axis, so the integral is negative`, `Area = ${fTex(J6.area)}`],
    marksEarnedAsWritten: ["MW1", "M2", "M3"],
    feedback: `Everything mathematical here is right, and CCEA gives all of the method marks. Only the last line costs her, and it is the line the examiners named: a negative value left on the answer line. Add one sentence before the answer, saying the region lies below the axis, and then write the size.`,
    source: CER25,
  },
];

const prompts = [
  {
    id: `rp.${TOPIC}.01`,
    kind: "formula",
    prompt: "Write the integral for the area between a curve, the $x$-axis and the ordinates $x = a$ and $x = b$.",
    answer: "Area $= \\int_{a}^{b} y \\, dx$, with the curve's own equation in place of $y$, $a$ at the bottom and $b$ at the top.",
    keyWords: ["a", "b", "y dx"],
    difficultyPrior: 3,
  },
  {
    id: `rp.${TOPIC}.02`,
    kind: "procedure",
    prompt: "Give the four steps of an area question in order.",
    answer: "Write the integral with both limits; integrate and simplify each term; substitute the top limit and then the bottom one, each in its own bracket; subtract top minus bottom and report the size.",
    keyWords: ["integral", "integrate", "substitute", "subtract"],
    difficultyPrior: 4,
  },
  {
    id: `rp.${TOPIC}.03`,
    kind: "qa",
    prompt: "What does a negative definite integral tell you about a region?",
    answer: "That the region lies below the $x$-axis. The area is the size of the value, so drop the minus sign and say why.",
    keyWords: ["below", "size"],
    difficultyPrior: 5,
  },
  {
    id: `rp.${TOPIC}.04`,
    kind: "trap",
    prompt: "A question asks for the area enclosed by a curve and the $x$-axis and prints no ordinates. Where do the limits come from?",
    answer: "From the curve itself: set $y = 0$ and solve, and the two $x$-intercepts are the limits.",
    keyWords: ["intercepts", "y = 0"],
    difficultyPrior: 5,
  },
  {
    id: `rp.${TOPIC}.05`,
    kind: "procedure",
    prompt: "What do you do when the curve crosses the $x$-axis between the two ordinates?",
    answer: "Split the integral at the root, work out each piece separately, take the size of each, then add them. One integral straight across would let the two pieces cancel.",
    keyWords: ["split", "root", "add"],
    difficultyPrior: 6,
  },
  {
    id: `rp.${TOPIC}.06`,
    kind: "trap",
    prompt: "Which line of an area question earns the first mark, even when the rest goes wrong?",
    answer: "The integral written out with both limits and the curve's equation inside it.",
    keyWords: ["limits", "integral"],
    difficultyPrior: 3,
  },
  {
    id: `rp.${TOPIC}.07`,
    kind: "trap",
    prompt: "Why is the constant of integration never needed in an area question?",
    answer: "Because the integral is definite: the constant appears in both substitutions and cancels in the subtraction.",
    keyWords: ["definite", "cancels"],
    difficultyPrior: 4,
  },
];

/** The insight card is the authored one on disk, copied in unchanged. */
const insight = JSON.parse(fs.readFileSync(`${process.cwd()}/packs/further-maths/insights/u1.area-under-curve.json`, "utf8"));

/* ---- bundle ------------------------------------------------------------------------------------- */

const noteChecks = [
  check("schema", "Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, gate ids g1 to g6 are unique, every prompt block names a prompt in this bundle, and every gate restates the curve and the limits it needs so it reads alone in the review inbox."),
  check("scope-tier", "FM1 is untiered and calculator-allowed. Every integrand is a sum of non-negative integer powers of x, so the integration stays inside FM1-INT-01. The crossing region is taught with a notonspec callout, because the FM1-INT-04 teacher guidance excludes combinations of positive and negative areas; no question asks for an area between two curves, an improper integral, or a volume of revolution."),
  check("formula-sheet", "The Unit 1 sheet gives the integration rule (fs.fm1.integration in packs/further-maths/exam-true/formula-sheets.json). That the area is the definite integral between the two ordinates, and that a negative value means a region below the axis, are must-know; the note says which is which."),
  check("command-words", "Find and Write down are the command words, with the tariffs from packs/further-maths/exam-true/command-words.json (Find 2-3-5, Write down 1-1-2). The stems keep the shape of the area phrasings read in the Summer 2019, 2022 and 2025 FM1 papers while every eight-word run is our own."),
  check("tariff", "3 and 4 marks for a single area, 2 + 4 for intercepts then area, and 1 + 4 + 4 for a two-region question, matching Summer 2025 Q11(vi) (4 marks), Summer 2022 Q10(iii) (4 marks) and Summer 2019 Q13 (3 + 2 + 2) and the FM1 per-part median of 3 in packs/further-maths/exam-true/tariffs.json."),
  check("maths-numeric", `Every integral is computed in exact rational arithmetic by polylib.mjs and checked against a 200 000-strip Riemann sum at three sample points: ${SAMPLES.map((s) => `${s.name} -> exact ${fVal(SAMPLES[0].exact) === s.exact ? s.exact : s.exact}, numeric ${s.numeric.toFixed(6)}`).join("; ")}. Every area printed is the magnitude of its own integral.`),
  check("examiner-alignment", "One examiner callout stands in the body, beside the step it is about (Summer 2025 Q11, the wrong limits and the negative answer line). Every other finding is a Sheet trap. Gates g1 and g2 fix the ordinates and the set-up, g3 runs the method, g4 reads a negative integral, g5 splits at a root and g6 finds the limits from the intercepts."),
  check("copy-shingle", "An 8-word shingle scan of the note and the bundle against every text file of the private FM corpus (scratchpad/fm1-batch-f/lib.mjs shingleClash) returns nothing; every curve, coefficient, ordinate and sentence here is new."),
  check("style-lint", "British English, second person, calm; no exclamation marks and no verdict word about a learner's answer. Every maths segment opens and closes inside one line and holds no prose words, checked by lintTree before the files were written. Seven inline SVG figures, every one drawn from the polynomial it illustrates, and one embeddable video from data/links/media-map.json followed immediately by a gate. The closing panel is a pointer of under 80 words followed by the prompts."),
];

const itemChecks = (detail) => [
  check("schema", "Validated by pipeline/build-content.mts against the Zod Question / WorkedExample / DiagnosticSet / FindTheMistake schema; every scheme sums to its part's marks and the skeleton matches the parts."),
  check("maths-numeric", detail),
  check("command-words", "Command words and tariffs taken from packs/further-maths/exam-true/command-words.json; the wording is ours."),
  check("examiner-alignment", "Every distractor and common error carries a registry misconception evidenced by the Summer 2022 Q10, Summer 2025 Q11 or Summer 2019 Q13 report block."),
  check("copy-shingle", "8-word shingle scan against the private FM corpus returns nothing."),
  check("style-lint", "KaTeX segments paired and prose-free; British English; no exclamation marks; no figure prints the value its own part asks for."),
];

const verification = [
  log(`ver.note.${TOPIC}`, `note.${TOPIC}`, noteChecks),
  log(`ver.we.${TOPIC}.01`, `we.${TOPIC}.01`, itemChecks(`The worked example integrates ${tex(P_WE1)} from ${WE1.a} to ${WE1.b}: the integral is ${tex(WE1.F)}, the top substitution ${fTex(at(WE1.F, WE1.b))}, the bottom ${fTex(at(WE1.F, WE1.a))} and the area ${fTex(WE1.area)}. The twin integrates ${tex(P3)} from ${J3.a} to ${J3.b}, giving ${fTex(J3.area)}.`)),
  log(`ver.we.${TOPIC}.02`, `we.${TOPIC}.02`, itemChecks(`The second worked example integrates ${tex(P_WE2)} from ${WE2.a} to ${WE2.b}: the integral is ${fTex(WE2.I)}, negative because the region lies below the axis, so the area is ${fTex(WE2.area)}. The twin integrates ${tex(P5)} from ${J5.a} to ${J5.b}, giving ${fTex(J5.I)} and an area of ${fTex(J5.area)}.`)),
  ...builtQuestions.map((q) =>
    log(
      `ver.${q.id}`,
      q.id,
      itemChecks(
        `Every value was computed by polylib.mjs in exact rationals: ${q.parts
          .map((p) => `${p.id} -> ${p.answer.kind === "numeric" ? p.answer.value : "the coordinates the scheme names"}`)
          .join("; ")}. Each common-error value was produced by executing the route its feedback describes (routes.* in the generator) and re-checked against the published JSON by verify-published.mjs.`,
      ),
    ),
  ),
  // 23 Sep (job 3): the diagnostics, find-the-mistake items and prompts, never logged before, so never shipped.
  ...draftLogs({ diagnostics, findTheMistake: findTheMistake, prompts, verifier: "The tagged numeric distractors were matched to the routes that produce them by scratchpad/fm1-batch-f/verify-published.mjs, and the rest checked by hand in the read-through." }),
];

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: TOPIC,
    slug: SLUG,
    title: "Area under a curve between two ordinates",
    subject: "further-maths",
    unit: "FM1",
    tier: "untiered",
    strand: "Calculus",
    statementIds: REFS,
    prerequisites: ["fm.u1.definite-integrals", "fm.u1.curve-sketching-quadratic-cubic"],
    order: 39,
    hardness: "S",
    difficulty: 3,
    examinerFlagged: true,
    examinerSources: [CER22, CER25, CER19],
    examWeightHint:
      "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. An area is worth 3 or 4 marks and is usually the closing part of a long curve question: Summer 2025 Q11(vi) (4 marks, the area between a quadratic, the x-axis and two ordinates, answer an exact fraction), Summer 2022 Q10(iii) (4 marks, a region below the axis after a sketch), Summer 2019 Q13 (3 + 2 + 2, two areas in terms of a constant and then an equation between them). Schemes run MW for the integral with its limits, M for the integration, M for the two substitutions and W for the positive area, with follow-through after a slip.",
    mustMemorise: [
      "Area = the integral of y dx from a to b, between the curve, the x-axis and the ordinates x = a and x = b",
      "A region below the axis gives a negative integral: report the area as its size",
      "With no ordinates printed, the limits are the curve's own x-intercepts",
      "A definite integral needs no constant of integration",
    ],
    onFormulaSheet: ["∫axⁿ dx = axⁿ⁺¹/(n + 1) + c, n ≠ −1 (Unit 1 formula sheet, page 2)"],
    notOnThisSpec: [
      "Combinations of positive and negative areas in one region, which the Teacher Guidance excludes",
      "The area between two curves",
      "Volumes of revolution",
      "The trapezium rule and other numerical estimates of an area",
      "Integrals of trigonometric, exponential or logarithmic functions",
    ],
    externalRefs: [
      {
        kind: "youtube",
        videoId: "ggJANe9VEXs",
        channel: "P McAleavey",
        credit: "Integration - Area under a curve CCEA GCSE Further Mathematics, P McAleavey (embeddable id verified in data/links/media-map.json)",
      },
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports",
        asOf: "2026-09-20",
      },
    ],
    keywords: ["area", "ordinates", "region", "x-axis", "negative area"],
  },
  note: {
    id: `note.${TOPIC}`,
    topic: TOPIC,
    title: "Area under a curve between two ordinates",
    subject: "further-maths",
    unit: "FM1",
    tier: "untiered",
    specRefs: REFS,
    calculator: true,
    formulaSheet: {
      given: [
        "Quadratic formula x = (−b ± √(b² − 4ac)) / 2a",
        "Differentiation y = axⁿ ⇒ dy/dx = naxⁿ⁻¹",
        "Integration ∫axⁿ dx = axⁿ⁺¹/(n + 1) + c",
        "Logarithm aˣ = n ⇒ x = log_a n",
      ],
      mustKnow: [
        "Area = ∫ from a to b of y dx",
        "A negative integral means a region below the x-axis",
        "The limits are the two ordinates, or the x-intercepts when none are printed",
        "No constant of integration in a definite integral",
      ],
    },
    notOnThisSpec: [
      "Combinations of positive and negative areas in one region",
      "The area between two curves",
      "Volumes of revolution",
      "The trapezium rule",
    ],
    hardness: "S",
    examinerFlagged: true,
    externalRefs: [
      {
        kind: "youtube",
        videoId: "ggJANe9VEXs",
        channel: "P McAleavey",
        credit: "Integration - Area under a curve CCEA GCSE Further Mathematics, P McAleavey (embeddable id verified in data/links/media-map.json)",
      },
    ],
    sheet: {
      mustBeAbleTo: [
        "Write the area between a curve, the x-axis and two ordinates as a definite integral",
        "Integrate the curve's equation and simplify each term before substituting",
        "Substitute the top limit and then the bottom one, each inside its own bracket",
        "Subtract top minus bottom, in that order",
        "Read a negative integral as a region below the x-axis and report the area as its size",
        "Find the limits from the x-intercepts when the question prints none",
        "Split a region at a root and add the two sizes, which is beyond what CCEA asks and is here as insurance",
        "Give an exact fraction where the question asks for one",
      ],
      howExamined:
        "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. An area is worth 3 or 4 marks and is usually the closing part of a long curve question that has already asked for turning points and a sketch: Summer 2025 Q11(vi) (4 marks, a quadratic between two ordinates, answer an exact fraction), Summer 2022 Q10(iii) (4 marks, a region below the axis, handled well), Summer 2019 Q13 (3 + 2 + 2, two areas in terms of a constant and then an equation between them). The scheme runs MW for the integral written with its limits, M for the integration, M for the two substitutions and W for the positive area, and the later marks are given on follow-through after a slip.",
      traps: [
        "Leaving a negative value on the answer line when the region is below the axis (Summer 2025 FM1 Q11, Summer 2022 FM1 Q10)",
        "Choosing the wrong limits, or inventing them when the question prints none (Summer 2025 FM1 Q11)",
        "Forgetting to integrate at all and substituting the limits into the curve (Summer 2025 FM1 Q11)",
        "Subtracting bottom limit take away top (Summer 2019 FM1 Q13)",
        "Substituting the top limit and never taking the bottom one away (Summer 2025 FM1 Q11)",
        "Arithmetic slips inside the integration: the index left where it was, or the coefficient never divided by its new index (Summer 2025 FM1 Q11, Summer 2022 FM1 Q10)",
        "Comparing two areas wrongly when a question relates them (Summer 2019 FM1 Q13)",
        "Substituting into terms that were never simplified, such as a coefficient over its own index (Summer 2025 FM1 Q11)",
      ],
    },
    verification: `ver.note.${TOPIC}`,
    version: 1,
    updated: "2026-09-20",
  },
  workedExamples,
  diagnostics,
  questions: builtQuestions,
  findTheMistake,
  prompts: prompts.map((p) => ({ ...p, topic: TOPIC, specRefs: REFS, examUnit: "FM1" })),
  insight,
  verification,
};

/* ---- checks and write ----------------------------------------------------------------------------- */

lintTree(bundle, `${SLUG}/bundle.json`);
lintTree(blocks, `${SLUG}/note.blocks.json`);

const allText = [JSON.stringify(bundle), JSON.stringify(blocks)].join(" ");
const clashes = shingleClash(allText, corpusFiles());
if (clashes.length) throw new Error(`shingle clash:\n  ${clashes.slice(0, 10).join("\n  ")}`);

const a = writeJson(OUT(SLUG, "bundle.json"), bundle);
const b = writeJson(OUT(SLUG, "note.blocks.json"), blocks);
console.log(
  `${SLUG}: we=${workedExamples.length} dx=${diagnostics.reduce((s, d) => s + d.items.length, 0)} q=${builtQuestions.length} ftm=${findTheMistake.length} rp=${prompts.length} gates=${blocks.filter((x) => x.type === "gate").length}`,
);
console.log(`  bundle.json  sha256:${a.sha}  ${a.bytes} bytes`);
console.log(`  note.blocks.json  sha256:${b.sha}  ${b.bytes} bytes`);
console.log(`  shingle clashes: ${clashes.length}`);
console.log(`  integral checks: ${SAMPLES.map((s) => `${s.exact} vs ${s.numeric.toFixed(6)}`).join(" | ")}`);
