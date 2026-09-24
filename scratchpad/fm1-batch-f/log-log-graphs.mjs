/**
 * FM1 batch F — topic 4: log-log-graphs (difficulty 3 -> S).
 * Enrichment: data/enrichment/further-maths/log-log-graphs.md (status ccea-only; the make-it-straight
 * framing, the three-line derivation beside y = mx + c, the gradient triangle and the un-logging step
 * are recreated here in our own words and our own figures).
 * Every table value, log, gradient, intercept and distractor is computed below.
 */
import fs from "node:fs";
import {
  OUT, PAPER, check, draftLogs, log as verLog, writeJson, lintTree, figure, svgWrap, svgText, svgPath, svgRect, num,
  shingleClash, corpusFiles,
} from "./lib.mjs";

const SLUG = "log-log-graphs";
const TOPIC = "fm.u1.log-log-graphs";
const REFS = ["FM1-LOG-02"];
const CER18 = "ccea-cer:further-maths:2018-summer:FM1:Q11";
const CER19 = "ccea-cer:further-maths:2019-summer:FM1:Q10";
const CER22 = "ccea-cer:further-maths:2022-summer:FM1:Q12";
const CER24 = "ccea-cer:further-maths:2024-summer:FM1:Q12";
const CER25 = "ccea-cer:further-maths:2025-summer:FM1:Q10";

/* ---- the two data sets, computed from k and n ------------------------------------------------ */

const d3 = (v) => Math.round(v * 1000) / 1000;
const lg = (v) => d3(Math.log10(v));

function dataset({ k, n, xs, xName, yName }) {
  const ys = xs.map((x) => {
    const y = k * x ** n;
    const r = Math.round(y * 1e9) / 1e9;
    if (!Number.isInteger(r)) throw new Error(`${yName} at ${x} is ${y}, which is not a whole measurement`);
    return r;
  });
  const logx = xs.map(lg);
  const logy = ys.map(lg);
  // the identity log y = n log x + log k, checked at three sample points
  const samples = [0, 2, 4].map((i) => ({
    x: xs[i],
    lhs: logy[i],
    rhs: d3(n * Math.log10(xs[i]) + Math.log10(k)),
  }));
  for (const s of samples) if (Math.abs(s.lhs - s.rhs) > 0.0005) throw new Error(`identity failed at ${xName} = ${s.x}: ${s.lhs} vs ${s.rhs}`);
  return { k, n, xs, ys, logx, logy, logk: lg(k), xName, yName, samples, points: xs.map((_, i) => [logx[i], logy[i]]) };
}

const A = dataset({ k: 4, n: 1.5, xs: [1, 4, 9, 16, 25], xName: "h", yName: "F" });
const B = dataset({ k: 5, n: 2, xs: [2, 4, 6, 8, 10], xName: "d", yName: "P" });

/** The gradient read from the two end points of the drawn line, using the rounded table values. */
function gradientFrom(D, i, j) {
  const g = (D.logy[j] - D.logy[i]) / (D.logx[j] - D.logx[i]);
  return Math.round(g * 1e9) / 1e9;
}
const A_GRAD = gradientFrom(A, 0, 4);
const B_GRAD = gradientFrom(B, 0, 4);
if (Math.abs(A_GRAD - A.n) > 1e-9) throw new Error(`A gradient ${A_GRAD} is not n`);
if (Math.abs(B_GRAD - B.n) > 1e-9) throw new Error(`B gradient ${B_GRAD} is not n`);

/** k recovered from the intercept, to one decimal place. */
const kFrom = (logk) => Math.round(10 ** logk * 10) / 10;
const A_K = kFrom(A.logk); // 4.0
const B_K = kFrom(B.logk); // 5.0

/** Predictions, inside the range of the plotted data. */
const A_PRED_X = 12.25;
const A_PRED_Y = Math.round(A.k * A_PRED_X ** A.n * 1e9) / 1e9; // 171.5
const B_PRED_X = 7;
const B_PRED_Y = Math.round(B.k * B_PRED_X ** B.n * 1e9) / 1e9; // 245
const PUMP_RATE = 50;
const PUMPS = Math.ceil(A_PRED_Y / PUMP_RATE);

/* ---- error routes, executed -------------------------------------------------------------------- */

const routes = {
  /** The gradient fraction written upside down. */
  gradientInverted: (D) => Math.round((1 / gradientFrom(D, 0, 4)) * 1e9) / 1e9,
  /** The intercept handed in as the constant, with no un-logging. */
  logKGivenAsK: (D) => D.logk,
  /** The gradient and the intercept read into each other's answer lines. */
  swapped: (D) => ({ nIsIntercept: D.logk, kIsGradient: D.n }),
  /** A log value given to two decimal places where three were demanded. */
  twoDecimalPlaces: (v) => Math.round(v * 100) / 100,
  /** The logarithms of the data substituted into the power law itself. */
  logsIntoPowerLaw: (D, x) => Math.round(D.k * Math.log10(x) ** D.n * 1e6) / 1e6,
  /** A quantity that must cover the demand, rounded down instead of up. */
  roundedDown: (v, rate) => Math.floor(v / rate),
};

const E = {
  aInverted: routes.gradientInverted(A),
  bInverted: routes.gradientInverted(B),
  aLogK: routes.logKGivenAsK(A),
  bLogK: routes.logKGivenAsK(B),
  aSwapN: routes.swapped(A).nIsIntercept,
  aSwapK: routes.swapped(A).kIsGradient,
  logy108TwoDp: routes.twoDecimalPlaces(A.logy[2]),
  aLogsIntoPowerLaw: routes.logsIntoPowerLaw(A, A_PRED_X),
  bLogsIntoPowerLaw: routes.logsIntoPowerLaw(B, B_PRED_X),
  pumpsRoundedDown: routes.roundedDown(A_PRED_Y, PUMP_RATE),
};

/* ---- figures ------------------------------------------------------------------------------------ */

const rr = (v) => Math.round(v * 10) / 10;
const r1 = (v) => num(Math.round(v * 10) / 10);

/** A framed panel of axes with a point set, drawn from the data. */
function panel({ x0, y0, w, h, xs, ys, xLabel, yLabel, curve, line, circled, triangle, intercept, title }) {
  const xLo = 0;
  const xHi = Math.max(...xs) * 1.12;
  const yLo = 0;
  const yHi = Math.max(...ys) * 1.12;
  const sx = (v) => x0 + 38 + ((v - xLo) / (xHi - xLo)) * (w - 50);
  const sy = (v) => y0 + h - 34 - ((v - yLo) / (yHi - yLo)) * (h - 52);
  const out = [];
  out.push(svgRect(x0, y0, w, h, { width: 1, fill: "currentColor", opacity: 0.03 }));
  out.push(`<path d='M ${r1(sx(xLo))} ${r1(sy(yLo))} L ${r1(sx(xHi))} ${r1(sy(yLo))}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  out.push(`<path d='M ${r1(sx(xLo))} ${r1(sy(yHi))} L ${r1(sx(xLo))} ${r1(sy(yLo))}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  if (curve) {
    const d = [];
    for (let i = 0; i <= 120; i++) {
      const v = xLo + ((xHi - xLo) * i) / 120;
      const yy = curve(v);
      if (yy > yHi) break;
      d.push(`${d.length === 0 ? "M" : "L"} ${r1(sx(v))} ${r1(sy(yy))}`);
    }
    out.push(`<path d='${d.join(" ")}' stroke='currentColor' stroke-width='1.8' fill='none' stroke-dasharray='7 4'/>`);
  }
  if (line) {
    out.push(`<path d='M ${r1(sx(line[0][0]))} ${r1(sy(line[0][1]))} L ${r1(sx(line[1][0]))} ${r1(sy(line[1][1]))}' stroke='currentColor' stroke-width='1.8' fill='none'/>`);
  }
  for (const [i, v] of xs.entries()) {
    const cx = sx(v);
    const cy = sy(ys[i]);
    out.push(`<circle cx='${r1(cx)}' cy='${r1(cy)}' r='2.4' fill='currentColor'/>`);
    if (circled) out.push(`<circle cx='${r1(cx)}' cy='${r1(cy)}' r='5.4' fill='none' stroke='currentColor' stroke-width='1'/>`);
  }
  if (triangle) {
    const [p, q] = triangle;
    out.push(`<path d='M ${r1(sx(p[0]))} ${r1(sy(p[1]))} L ${r1(sx(q[0]))} ${r1(sy(p[1]))} L ${r1(sx(q[0]))} ${r1(sy(q[1]))}' stroke='currentColor' stroke-width='1.1' fill='none' stroke-dasharray='4 3'/>`);
    out.push(svgText(rr((sx(p[0]) + sx(q[0])) / 2), rr(sy(p[1]) + 15), `${d3(q[0] - p[0])}`, { size: 10.5 }));
    out.push(svgText(rr(sx(q[0]) + 16), rr((sy(p[1]) + sy(q[1])) / 2), `${d3(q[1] - p[1])}`, { size: 10.5, anchor: "start" }));
  }
  if (intercept !== undefined) {
    out.push(`<path d='M ${r1(sx(xLo) - 6)} ${r1(sy(intercept))} L ${r1(sx(xLo) + 6)} ${r1(sy(intercept))}' stroke='currentColor' stroke-width='1.6' fill='none'/>`);
    out.push(svgText(rr(sx(xLo) + 12), rr(sy(intercept) - 7), intercept === 0 ? "0" : "log k", { size: 11, anchor: "start" }));
  }
  out.push(svgText(x0 + w / 2, y0 + h - 8, xLabel, { size: 11.5 }));
  out.push(svgText(x0 + 12, y0 + 18, yLabel, { size: 11.5, anchor: "start" }));
  if (title) out.push(svgText(x0 + w / 2, y0 - 6, title, { size: 11 }));
  return out.join("");
}

function heroSvg() {
  const body = [
    panel({
      x0: 16, y0: 26, w: 250, h: 210,
      xs: A.xs, ys: A.ys, xLabel: `${A.xName}`, yLabel: `${A.yName}`,
      curve: (v) => A.k * v ** A.n,
      title: "the data as measured",
    }),
    svgPath("M 274 130 L 316 130 M 306 123 L 316 130 L 306 137", { width: 1.6 }),
    svgText(295, 116, "take logs", { size: 10 }),
    svgText(295, 152, "of both", { size: 10 }),
    panel({
      x0: 324, y0: 26, w: 250, h: 210,
      xs: A.logx, ys: A.logy, xLabel: "log h", yLabel: "log F",
      line: [[A.logx[0], A.logy[0]], [A.logx[4], A.logy[4]]],
      circled: true,
      intercept: A.logy[0],
      title: "the same data, straightened",
    }),
    svgText(295, 260, "a straight line holds just two numbers: a gradient and an intercept", { size: 11.5 }),
  ].join("");
  return svgWrap(
    "0 0 590 272",
    `Two panels: on the left the measured data curving upwards, on the right the same data plotted as log F against log h, lying on a straight line with its intercept marked log k`,
    body,
  );
}

function derivationSvg() {
  const rows = [
    `${A.yName} = k${A.xName}^n`,
    `log ${A.yName} = log(k${A.xName}^n)`,
    `log ${A.yName} = log k + log ${A.xName}^n`,
    `log ${A.yName} = n log ${A.xName} + log k`,
  ];
  const out = [];
  rows.forEach((t, i) => {
    out.push(svgText(30, 34 + i * 34, t, { size: 15, anchor: "start" }));
  });
  out.push(svgText(300, 34, "start from the power law", { size: 10.5, anchor: "start" }));
  out.push(svgText(300, 68, "take logs of both sides", { size: 10.5, anchor: "start" }));
  out.push(svgText(300, 102, "the product law splits it", { size: 10.5, anchor: "start" }));
  out.push(svgText(300, 136, "the power law brings n down", { size: 10.5, anchor: "start" }));
  out.push(svgRect(20, 120, 260, 26, { width: 1.2, fill: "currentColor", opacity: 0.08 }));
  out.push(svgText(30, 186, "y = m x + c", { size: 15, anchor: "start" }));
  out.push(svgPath("M 118 150 L 60 176 M 60 176 L 72 172 M 60 176 L 64 166", { width: 1 }));
  out.push(svgPath("M 200 150 L 128 176 M 128 176 L 140 172 M 128 176 L 132 166", { width: 1 }));
  out.push(svgText(300, 186, "gradient is n, intercept is log k", { size: 10.5, anchor: "start" }));
  return svgWrap(
    "0 0 560 208",
    `Four lines of algebra turning the power law into log F equals n log h plus log k, set beside y equals m x plus c with arrows joining the gradient to n and the intercept to log k`,
    out.join(""),
  );
}

function tableSvg(D, { blanks = [], caption }) {
  const cols = D.xs.length + 1;
  const w = 560;
  const cw = (w - 20) / cols;
  const rows = [
    [`${D.xName === "h" ? "Depth h (cm)" : "Diameter d (cm)"}`, ...D.xs.map(String)],
    [`${D.xName === "h" ? "Flow F (l/s)" : "Price P (pounds)"}`, ...D.ys.map(String)],
    [`log ${D.xName}`, ...D.logx.map((v) => v.toFixed(3))],
    [`log ${D.yName}`, ...D.logy.map((v) => v.toFixed(3))],
  ];
  const out = [];
  const rh = 30;
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const x = 10 + c * cw;
      const y = 12 + r * rh;
      out.push(svgRect(x, y, cw, rh, { width: 0.9, fill: "currentColor", opacity: r === 0 ? 0.07 : 0 }));
      const blank = blanks.some((b) => b.r === r && b.c === c);
      if (blank) out.push(`<path d='M ${r1(x + cw * 0.22)} ${r1(y + rh * 0.68)} L ${r1(x + cw * 0.78)} ${r1(y + rh * 0.68)}' stroke='currentColor' stroke-width='1' fill='none' stroke-opacity='0.5'/>`);
      else out.push(svgText(x + cw / 2, y + rh * 0.66, cell, { size: c === 0 ? 10.5 : 12 }));
    });
  });
  return svgWrap(`0 0 ${w} ${12 + rows.length * rh + 10}`, caption, out.join(""));
}

function mistakeSvg() {
  const out = [];
  const mk = (x0, label, opts) =>
    out.push(
      panel({
        x0, y0: 30, w: 250, h: 168,
        xs: A.logx, ys: A.logy,
        xLabel: opts.wrongAxes ? "h" : "log h",
        yLabel: opts.wrongAxes ? "F" : "log F",
        line: [[A.logx[0], A.logy[0]], [A.logx[4], A.logy[4]]],
        circled: true,
        triangle: opts.flipped ? [[A.logx[0], A.logy[4]], [A.logx[4], A.logy[0]]] : undefined,
        title: label,
      }),
    );
  mk(16, "axes named after the raw data", { wrongAxes: true });
  mk(324, "the triangle read upside down", { flipped: true });
  out.push(svgText(295, 220, "two panels, one thing wrong in each", { size: 11.5 }));
  return svgWrap(
    "0 0 590 234",
    `Two small log-log panels, each with one fault: the first has its axes named h and F instead of log h and log F, the second has the gradient triangle drawn with its legs the wrong way up`,
    out.join(""),
  );
}

function triangleSvg() {
  const body = [
    panel({
      x0: 30, y0: 30, w: 500, h: 220,
      xs: A.logx, ys: A.logy, xLabel: "log h", yLabel: "log F",
      line: [[A.logx[0], A.logy[0]], [A.logx[4], A.logy[4]]],
      circled: true,
      triangle: [[A.logx[0], A.logy[0]], [A.logx[4], A.logy[4]]],
      intercept: A.logy[0],
      title: "two points far apart, on the line",
    }),
    svgText(280, 268, "the rise goes on top, the run underneath", { size: 11.5 }),
  ].join("");
  return svgWrap(
    "0 0 560 280",
    `The log-log line with a dashed right-angled triangle drawn between its two end points, the horizontal leg and the vertical leg each labelled with their measured change, and the intercept marked log k`,
    body,
  );
}

const HERO_SVG = heroSvg();
const DERIV_SVG = derivationSvg();
const TABLE_SVG = tableSvg(A, { caption: `The table for the weir data with the depth, the flow and both rows of logarithms to three decimal places` });
const TABLE_BLANK_SVG = tableSvg(A, {
  blanks: A.xs.map((_, i) => ({ r: 3, c: i + 1 })),
  caption: `The same table with the row of log F values left blank`,
});
const MISTAKE_SVG = mistakeSvg();
const TRIANGLE_SVG = triangleSvg();

/* ---- note --------------------------------------------------------------------------------------- */

const blocks = [
  {
    type: "hero",
    lede: "Some relationships are curves, and a curve is hard to read. Take logarithms of both measurements and the curve straightens out, because a power law becomes a straight line in log form. A straight line holds only two numbers, and those two numbers are the answer.",
    can: [
      "Turn a power law into the straight line log y = n log x + log k",
      "Complete a table of logarithms to three decimal places and plot the log-log graph",
      "Read the power from the gradient and the constant from the intercept, un-logging it",
    ],
    minutes: 15,
  },
  { type: "h", text: "Make it straight, then read it" },
  {
    type: "p",
    md: `Water over a notch in a dam follows a rule $F = k h^{n}$, where $h$ is the depth and $F$ the flow. Five depths give a curve, and a curve will not tell you $k$ or $n$.\nSo change the axes on purpose: plot $\\log F$ against $\\log h$ and the points fall on a straight line, which holds only a gradient and an intercept.`,
  },
  {
    type: "figure",
    alt: `Two panels: the measured flow against depth curving upwards on the left, and the same data plotted as log F against log h lying on a straight line on the right.`,
    svg: HERO_SVG,
    caption: `The same five measurements, twice: as they come, and after logarithms.`,
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: `One tap to begin. In the two panels above, what has been plotted on the axes of the right-hand panel?`,
    options: [`$\\log F$ against $\\log h$`, `$F$ against $h$`, `$F$ against $\\log h$`],
    answer: `$\\log F$ against $\\log h$`,
    explain: `Both measurements are replaced by their logarithms. Taking the logarithm of only one of them would not straighten a power law.`,
  },
  { type: "h", text: "1. Three lines of algebra, and it is a straight line" },
  {
    type: "p",
    md: `Start from $F = k h^{n}$ and take logarithms of both sides. The product law splits the right-hand side, then the power law brings $n$ down in front.\nWhat is left is $\\log F = n \\log h + \\log k$. Set that beside $y = mx + c$: the gradient is $n$ and the intercept is $\\log k$. Every question on this topic is those two matches, used twice.`,
  },
  {
    type: "figure",
    alt: `Four lines of algebra turning the power law into log F equals n log h plus log k, set beside y equals mx plus c, with arrows joining the gradient to n and the intercept to log k.`,
    svg: DERIV_SVG,
    caption: `Three uses of the log laws, and the power law is a straight line.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the intercept is not k",
    md: `The derivation put $\\log k$ where $c$ sits, not $k$. So the number read off the vertical axis is the logarithm of the constant, and it still has to be un-logged. Keep that as a step of its own.`,
  },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: `Comparing $\\log F = n \\log h + \\log k$ with $y = mx + c$, what does the gradient of the log-log line give you?`,
    options: [`$n$`, `$k$`, `$\\log k$`],
    answer: `$n$`,
    explain: `The gradient sits where $m$ sits, and that is $n$. The intercept sits where $c$ sits, and that is $\\log k$.`,
  },
  { type: "h", text: "2. The table, to three decimal places" },
  {
    type: "p",
    md: `The paper gives the measurements and asks you to add two rows of logarithms. Work to **three decimal places** every time: two places is a mark thrown away, and the examiners name it almost every year.\nHere are five depths and flows from the weir, with both rows of logarithms filled in.`,
  },
  {
    type: "figure",
    alt: `A table with rows for depth h, flow F, log h and log F, the logarithm rows given to three decimal places.`,
    svg: TABLE_SVG,
    caption: `Both rows to three decimal places, which is what the answer line is marked against.`,
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: `In the weir table above, one flow is $F = ${A.ys[2]}$ litres per second. What is $\\log F$ for that reading, to three decimal places?`,
    answer: A.logy[2].toFixed(3),
    explain: `$\\log ${A.ys[2]} = ${A.logy[2].toFixed(3)}$. Writing $${E.logy108TwoDp}$ instead would lose the accuracy mark that the three decimal places carry.`,
  },
  { type: "h", text: "3. Plotting, and where the marks leak" },
  {
    type: "p",
    md: `Label the axes $\\log h$ and $\\log F$ before you plot anything: the labels are worth a mark on their own. Choose the scale from the range of the **logarithm** values, not the raw data, or the points bunch into a corner.\nPlot each point and circle it, then lay a ruled line through them. Circled points, labelled axes and a ruled line are three separate places examiners take marks off.`,
  },
  {
    type: "figure",
    alt: `Two small log-log panels, one with its axes named h and F instead of log h and log F, the other with the gradient triangle drawn the wrong way up.`,
    svg: MISTAKE_SVG,
    caption: `Two panels, one fault each. Both faults are named in the reports almost every year.`,
  },
  {
    type: "gate",
    id: "g4",
    kind: "choice",
    prompt: `In the left-hand panel above, the axes are named $h$ and $F$. What should they be named?`,
    options: [`$\\log h$ and $\\log F$`, `$h$ and $\\log F$`, `$n$ and $k$`],
    answer: `$\\log h$ and $\\log F$`,
    explain: `The numbers being plotted are logarithms, so the axes carry those names. Unlabelled or wrongly labelled axes lose a mark before any reading is taken.`,
  },
  { type: "h", text: "4. The gradient gives the power" },
  {
    type: "p",
    md: `Pick two points that are far apart and sit exactly on your line, then write the fraction the right way up: the change in $\\log F$ on top, the change in $\\log h$ underneath.\nFar apart matters, because a short triangle turns a small reading error into a large gradient error. Check the sign as you go: if $\\log F$ rises as $\\log h$ rises, $n$ is positive.`,
  },
  {
    type: "figure",
    alt: `The log-log line with a dashed right-angled triangle between its end points, the horizontal and vertical legs labelled with their changes, and the intercept marked log k.`,
    svg: TRIANGLE_SVG,
    caption: `Rise over run, in logarithm units: $\\frac{${d3(A.logy[4] - A.logy[0])}}{${d3(A.logx[4] - A.logx[0])}} = ${A.n}$.`,
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `On the log-log line shown above, the triangle has a vertical change of $${d3(A.logy[4] - A.logy[0])}$ and a horizontal change of $${d3(A.logx[4] - A.logx[0])}$. What is the gradient, and so the value of $n$?`,
    answer: String(A.n),
    explain: `$\\frac{${d3(A.logy[4] - A.logy[0])}}{${d3(A.logx[4] - A.logx[0])}} = ${A.n}$. Dividing the other way round would give $${d3(E.aInverted)}$, which is the reciprocal and not the power.`,
  },
  { type: "h", text: "5. The intercept gives log k, so un-log it" },
  {
    type: "p",
    md: `Read where the line meets the vertical axis. For the weir line that is $${A.logk.toFixed(3)}$, and the derivation says that number is $\\log k$, not $k$.\nUn-log it as its own step: $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$. Then write the relationship with your own numbers in it, $F = ${A_K.toFixed(1)} h^{${A.n}}$, not as a log equation.`,
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2018, Unit 1, Question 11",
    md: "Nearly everybody took logarithms and found the gradient. The constant was the step that failed: a large group handed in the intercept itself, so what reached the answer line was its logarithm rather than the constant.",
    source: CER18,
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: `A log-log line meets the vertical axis at $\\log k = ${B.logk.toFixed(3)}$. What is $k$, correct to one decimal place?`,
    answer: B_K.toFixed(1),
    explain: `$k = 10^{${B.logk.toFixed(3)}} = ${B_K.toFixed(1)}$. Handing in $${B.logk.toFixed(3)}$ would be the logarithm of the constant, which is the most repeated slip on this topic.`,
  },
  { type: "h", text: "6. Using the relationship, and checking it" },
  {
    type: "p",
    md: `With $F = ${A_K.toFixed(1)} h^{${A.n}}$ you can predict. At $h = ${A_PRED_X}$ cm the flow is $${A_K.toFixed(1)} \\times ${A_PRED_X}^{${A.n}} = ${A_PRED_Y}$ litres per second. Put the depth in, not its logarithm.\nThen check the range. The line was fitted to depths from $${A.xs[0]}$ to $${A.xs[4]}$ cm, so $${A_PRED_X}$ is safe. A prediction far outside that is a guess, and a wild answer usually means a slip earlier.`,
  },
  {
    type: "video",
    videoId: "KvipqSYQrmA",
    title: "log/log Graphs - Corbettmaths",
    channel: "corbettmaths",
    why: "This technique is set by almost no other board, so there is little video to choose from; this one runs the whole method once, end to end.",
  },
  {
    type: "gate",
    id: "g7",
    kind: "number",
    prompt: `Using $F = ${A_K.toFixed(1)} h^{${A.n}}$ for the weir, what is the flow when the depth is $h = ${B_PRED_X}$ cm? Give your answer correct to one decimal place.`,
    answer: (Math.round(A.k * B_PRED_X ** A.n * 10) / 10).toFixed(1),
    explain: `$${A_K.toFixed(1)} \\times ${B_PRED_X}^{${A.n}} = ${(Math.round(A.k * B_PRED_X ** A.n * 10) / 10).toFixed(1)}$. The depth goes in, never its logarithm.`,
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: `Derive $\\log y = n \\log x + \\log k$ from $y = kx^{n}$ in three lines.\nComplete a table of logarithms to three decimal places.\nPlot $\\log y$ against $\\log x$ with labelled axes, circled points and a ruled line.\nRead $n$ from the gradient, rise over run, and $\\log k$ from the intercept.\nUn-log the intercept, predict, and check the prediction sits inside the data.`,
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: `One long question, once a paper, about ten marks, in the same order every year: table, plot and line, the two constants, the relationship, a prediction. The first mark is the table to three decimal places; the last is the un-logged constant or a checked prediction. Stuck? Write $\\log y = n \\log x + \\log k$ beside $y = mx + c$ and read off which is which.`,
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
  { type: "prompt", promptId: `rp.${TOPIC}.06` },
];

/* ---- items ---------------------------------------------------------------------------------------- */

const numAns = (value, { dp, unit } = {}) => ({
  kind: "numeric",
  value,
  tolerance: dp === undefined ? { type: "absolute", value: 0.0005 } : { type: "dp", places: dp },
  unitRequired: false,
  acceptForms: ["decimal", "fraction"],
  ...(unit ? { unit } : {}),
});

const ce = (misconception, value, feedback, marks, source) => ({
  misconception,
  // Exact-match-only patterns never fire on a rounded answer (0.667 for 2/3), so every pattern
  // carries a tolerance wide enough for the form a learner actually writes.
  pattern: { kind: "numeric", value, tolerance: { type: "absolute", value: 0.005 } },
  feedback,
  marksTypicallyEarned: marks,
  source,
});

const tableFigure = (svg, alt) => [figure(svg, alt)];

const questions = [
  {
    id: `q.${TOPIC}.0001`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Complete"],
    setting: "The two missing logarithms of a weir table, the part every log-log question opens with",
    figures: tableFigure(
      tableSvg(A, {
        blanks: [{ r: 3, c: 3 }, { r: 3, c: 5 }],
        caption: `The weir table with two of the log F values left blank`,
      }),
      `A table of depth, flow, log h and log F for five weir readings, with two of the log F values left blank.`,
    ),
    parts: [
      {
        id: "main",
        stem: `The table shows five depths $h$ and flows $F$ measured at a weir, with most of the logarithms already worked out.\nFill in the two values missing from the $\\log F$ row, each correct to three decimal places.`,
        marks: 2,
        answer: {
          kind: "table",
          cells: [
            { row: 3, col: 3, value: A.logy[2], tolerance: { type: "absolute", value: 0.0005 } },
            { row: 3, col: 5, value: A.logy[4], tolerance: { type: "absolute", value: 0.0005 } },
          ],
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$${A.logy[2].toFixed(3)}$` },
          { id: "W1", code: "W", marks: 1, for: `$${A.logy[4].toFixed(3)}$` },
        ],
        hints: [`Use the log key on your calculator, which works to base $10$.`, "Three decimal places throughout."],
        workedSolution: `$\\log ${A.ys[2]} = ${A.logy[2].toFixed(3)}$ and $\\log ${A.ys[4]} = ${A.logy[4].toFixed(3)}$, both to three decimal places.`,
        commonErrors: [],
        requiresWorking: false,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0002`,
    difficulty: 1,
    style: "practice",
    commandWords: ["Calculate"],
    setting: "A single log value at the accuracy the paper demands",
    parts: [
      {
        id: "main",
        stem: `A flow of $F = ${A.ys[2]}$ litres per second is recorded at a weir.\nCalculate $\\log F$. Give your answer correct to three decimal places.`,
        marks: 1,
        answer: numAns(A.logy[2], { dp: 3 }),
        scheme: [{ id: "W1", code: "W", marks: 1, for: `$${A.logy[2].toFixed(3)}$` }],
        hints: [`The log key is base $10$.`],
        workedSolution: `$\\log ${A.ys[2]} = ${Math.log10(A.ys[2]).toFixed(6)}\\ldots$, which is $${A.logy[2].toFixed(3)}$ to three decimal places.`,
        commonErrors: [
          ce("fm.logs.decimal-places-instruction-ignored", E.logy108TwoDp, `The value is right and the accuracy is not. This topic is marked to three decimal places throughout, so write $${A.logy[2].toFixed(3)}$.`, 0, CER22),
        ],
        requiresWorking: false,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0003`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Find"],
    setting: "The gradient of a log-log line read from two points on it",
    figures: tableFigure(TRIANGLE_SVG, `A log-log line with a dashed right-angled triangle drawn between its two end points, each leg labelled with its change.`),
    parts: [
      {
        id: "main",
        stem: `The graph shows the line drawn from a set of weir readings, where $F = k h^{n}$.\nThe line passes through $(${A.logx[0]}, ${A.logy[0].toFixed(3)})$ and $(${A.logx[4].toFixed(3)}, ${A.logy[4].toFixed(3)})$.\nFind the value of $n$.`,
        marks: 2,
        answer: numAns(A.n),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$\\frac{${d3(A.logy[4] - A.logy[0])}}{${d3(A.logx[4] - A.logx[0])}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${A.n}$`, ft: true },
        ],
        hints: [`Comparing with $y = mx + c$, the gradient is $n$.`, "Change in the vertical on top, change in the horizontal underneath."],
        workedSolution: `The gradient is $\\frac{${A.logy[4].toFixed(3)} - ${A.logy[0].toFixed(3)}}{${A.logx[4].toFixed(3)} - ${A.logx[0]}} = \\frac{${d3(A.logy[4] - A.logy[0])}}{${d3(A.logx[4] - A.logx[0])}} = ${A.n}$.\nComparing $\\log F = n \\log h + \\log k$ with $y = mx + c$, that gradient is $n$, so $n = ${A.n}$.`,
        commonErrors: [
          ce("fm.logs.gradient-inverted", E.aInverted, `The fraction is upside down: that is the horizontal change divided by the vertical one. The change in $\\log F$ goes on top, which gives $${A.n}$.`, 1, CER22),
          ce("fm.logs.gradient-intercept-swapped", E.aSwapN, `That is the intercept of the line, which is $\\log k$. The gradient is what gives $n$, and here it is $${A.n}$.`, 0, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0004`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Find"],
    setting: "The constant recovered from the intercept, which is the step the reports name most often",
    parts: [
      {
        id: "main",
        stem: `For a relationship of the form $F = k h^{n}$, the graph of $\\log F$ against $\\log h$ is a straight line meeting the vertical axis at $${A.logk.toFixed(3)}$.\nFind the value of $k$. Give your answer correct to one decimal place.`,
        marks: 2,
        answer: numAns(A_K, { dp: 1 }),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$\\log k = ${A.logk.toFixed(3)}$, so $k = 10^{${A.logk.toFixed(3)}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${A_K.toFixed(1)}$`, ft: true },
        ],
        hints: [`The intercept sits where $c$ sits in $y = mx + c$, and here that is $\\log k$.`, "Undo the logarithm with a power of ten."],
        workedSolution: `Comparing $\\log F = n \\log h + \\log k$ with $y = mx + c$, the intercept is $\\log k$.\nSo $\\log k = ${A.logk.toFixed(3)}$ and $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$ to one decimal place.`,
        commonErrors: [
          ce("fm.logs.log-a-given-as-a", E.aLogK, `That is the intercept itself, which is $\\log k$ rather than $k$. Undo the logarithm: $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.`, 1, CER18),
          ce("fm.logs.gradient-intercept-swapped", E.aSwapK, `That is the gradient of the line, which gives $n$. The constant comes from the intercept, un-logged, and is $${A_K.toFixed(1)}$.`, 0, CER25),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0005`,
    difficulty: 2,
    style: "practice",
    commandWords: ["Write down"],
    setting: "Turning the two constants back into the relationship the question asked about",
    parts: [
      {
        id: "main",
        stem: `A set of weir readings gives a log-log line of gradient $${A.n}$ meeting the vertical axis at $${A.logk.toFixed(3)}$.\nWrite down the relationship between $F$ and $h$.`,
        marks: 1,
        answer: {
          kind: "mcq",
          shuffle: true,
          options: [
            { id: "a", text: `$F = ${A_K.toFixed(1)} h^{${A.n}}$`, correct: true, feedback: `The gradient is the power and the un-logged intercept is the coefficient.` },
            { id: "b", text: `$F = ${A.logk.toFixed(3)} h^{${A.n}}$`, correct: false, misconception: "fm.logs.log-a-given-as-a", feedback: `The intercept has gone in without being un-logged. It is $\\log k$, so $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.` },
            { id: "c", text: `$F = ${A.n} h^{${A_K.toFixed(1)}}$`, correct: false, misconception: "fm.logs.gradient-intercept-swapped", feedback: `The two constants have changed places. The gradient is the power, and the constant multiplies.` },
            { id: "d", text: `$\\log F = ${A.n} \\log h + ${A.logk.toFixed(3)}$`, correct: false, misconception: "fm.logs.log-values-in-original-equation", feedback: `That is the straight line, which is true but is not what was asked. The relationship between $F$ and $h$ is the power law itself.` },
          ],
        },
        scheme: [{ id: "W1", code: "W", marks: 1, for: `$F = ${A_K.toFixed(1)} h^{${A.n}}$` }],
        hints: [`Un-log the intercept first.`],
        workedSolution: `The gradient is $n = ${A.n}$ and the intercept is $\\log k = ${A.logk.toFixed(3)}$, so $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.\nThe relationship is $F = ${A_K.toFixed(1)} h^{${A.n}}$.`,
        commonErrors: [],
        requiresWorking: false,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0006`,
    difficulty: 3,
    style: "practice",
    commandWords: ["Calculate"],
    setting: "A prediction from the finished relationship, inside the range of the readings",
    parts: [
      {
        id: "main",
        stem: `The weir readings give $F = ${A_K.toFixed(1)} h^{${A.n}}$, where $h$ is in centimetres and $F$ is in litres per second.\nCalculate the flow when the depth is $${A_PRED_X}$ cm.`,
        marks: 2,
        answer: numAns(A_PRED_Y),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$${A_K.toFixed(1)} \\times ${A_PRED_X}^{${A.n}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${A_PRED_Y}$`, ft: true },
        ],
        hints: ["Put the depth into the relationship, not its logarithm."],
        workedSolution: `$F = ${A_K.toFixed(1)} \\times ${A_PRED_X}^{${A.n}} = ${A_K.toFixed(1)} \\times ${Math.round(A_PRED_X ** A.n * 1000) / 1000} = ${A_PRED_Y}$ litres per second.`,
        commonErrors: [
          ce("fm.logs.log-values-in-original-equation", E.aLogsIntoPowerLaw, `That came from putting $\\log ${A_PRED_X}$ into the power law. The logarithms belong on the graph; the relationship itself takes the depth, so $F = ${A_PRED_Y}$.`, 0, CER18),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0007`,
    difficulty: 3,
    style: "practice",
    commandWords: ["Calculate"],
    setting: "A context answer that has to be rounded the way the situation demands",
    parts: [
      {
        id: "main",
        stem: `At a depth of $${A_PRED_X}$ cm the weir carries $${A_PRED_Y}$ litres per second.\nEach pump can move $${PUMP_RATE}$ litres per second.\nCalculate the number of pumps needed to move all of this flow.`,
        marks: 2,
        answer: numAns(PUMPS),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$${A_PRED_Y} \\div ${PUMP_RATE} = ${Math.round((A_PRED_Y / PUMP_RATE) * 1000) / 1000}$` },
          { id: "W1", code: "W", marks: 1, for: `$${PUMPS}$`, ft: true },
        ],
        hints: [`Divide first, then ask what the answer is for.`],
        workedSolution: `$${A_PRED_Y} \\div ${PUMP_RATE} = ${Math.round((A_PRED_Y / PUMP_RATE) * 1000) / 1000}$.\nPumps come whole, and all of the flow has to be moved, so $${PUMPS}$ pumps are needed.`,
        commonErrors: [
          ce("fm.logs.rounded-too-early", E.pumpsRoundedDown, `The division is right and the rounding goes the wrong way for this context. With $${E.pumpsRoundedDown}$ pumps some of the flow is left, so $${PUMPS}$ are needed.`, 1, CER24),
        ],
        requiresWorking: true,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0008`,
    difficulty: 3,
    style: "practice",
    commandWords: ["Identify"],
    setting: "The range check, which turns a lucky answer into a checked one",
    parts: [
      {
        id: "main",
        stem: `The weir readings ran from a depth of $${A.xs[0]}$ cm to a depth of $${A.xs[4]}$ cm, and gave $F = ${A_K.toFixed(1)} h^{${A.n}}$.\nA student uses this to predict the flow at a depth of $${A.xs[4] * 4}$ cm.\nIdentify the reason this prediction should not be trusted.`,
        marks: 1,
        answer: {
          kind: "mcq",
          shuffle: true,
          options: [
            { id: "a", text: `The depth $${A.xs[4] * 4}$ cm lies outside the range of the readings the line was drawn from`, correct: true, feedback: `The line was fitted between $${A.xs[0]}$ cm and $${A.xs[4]}$ cm. Beyond that the relationship has not been tested.` },
            { id: "b", text: `The relationship only works for whole-number depths`, correct: false, misconception: "fm.logs.result-outside-data-range-unnoticed", feedback: `A power law takes any positive depth. What limits the prediction is the range of the data behind it.` },
            { id: "c", text: `The value of $k$ was rounded to one decimal place`, correct: false, misconception: "fm.logs.result-outside-data-range-unnoticed", feedback: `Rounding $k$ shifts the answer slightly. The real problem is that the depth is far outside the measurements.` },
            { id: "d", text: `Logarithms cannot be taken of a number larger than $${A.xs[4]}$`, correct: false, misconception: "fm.logs.result-outside-data-range-unnoticed", feedback: `Logarithms exist for every positive number. The limit here is the data, not the mathematics.` },
          ],
        },
        scheme: [{ id: "W1", code: "W", marks: 1, for: `outside the range of the plotted data` }],
        hints: ["Ask what the line was drawn from."],
        workedSolution: `The line was fitted to depths between $${A.xs[0]}$ cm and $${A.xs[4]}$ cm.\nA depth of $${A.xs[4] * 4}$ cm sits well outside that range, so the prediction is an extrapolation rather than a reading.`,
        commonErrors: [],
        requiresWorking: false,
      },
    ],
  },
  {
    id: `q.${TOPIC}.0009`,
    difficulty: 4,
    style: "exam-style",
    commandWords: ["Complete", "Plot", "Find", "Write down"],
    setting: "The full log-log question in the order CCEA sets it: table, plot, the two constants, the relationship",
    figures: tableFigure(TABLE_BLANK_SVG, `A table of depth, flow and log h for five weir readings, with the whole log F row left blank.`),
    parts: [
      {
        id: "a",
        stem: `The table shows the depth $h$ cm and the flow $F$ litres per second at a weir, together with the values of $\\log h$.\nIt is believed that $F = k h^{n}$, where $k$ and $n$ are constants.\nComplete the $\\log F$ row of the table, giving each value correct to three decimal places.`,
        marks: 2,
        answer: {
          kind: "table",
          cells: A.logy.map((v, i) => ({ row: 3, col: i + 1, value: v, tolerance: { type: "absolute", value: 0.0005 } })),
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `the five values of $\\log F$` },
          { id: "W1", code: "W", marks: 1, for: `all five correct to three decimal places` },
        ],
        hints: [`The log key on the calculator is base $10$.`, "Three decimal places for every entry."],
        workedSolution: `Taking logarithms of each flow gives ${A.logy.map((v) => v.toFixed(3)).join(", ")}, each to three decimal places.`,
        commonErrors: [],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: `Plot $\\log F$ against $\\log h$ and draw the straight line through your points.\nLabel the axes $\\log h$ and $\\log F$.`,
        marks: 3,
        answer: {
          kind: "graph",
          expect: {
            plot: "points-line",
            points: A.points,
            lineThrough: [A.points[0], A.points[4]],
            lineRequired: true,
            tolerance: { type: "absolute", value: 0.02 },
          },
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: "a scale chosen from the range of the logarithm values, with both axes labelled" },
          { id: "W1", code: "W", marks: 1, for: "all five points plotted and circled" },
          { id: "W2", code: "W", marks: 1, for: "a ruled straight line through the points", dependsOn: ["W1"] },
        ],
        hints: ["Label the axes before plotting anything.", "Choose the scale from the logarithm values, not the raw readings."],
        workedSolution: `The five points are ${A.points.map(([px, py]) => `(${px.toFixed(3)}, ${py.toFixed(3)})`).join(", ")}.\nThey lie on a straight line, which passes through $(${A.points[0][0].toFixed(3)}, ${A.points[0][1].toFixed(3)})$ and $(${A.points[4][0].toFixed(3)}, ${A.points[4][1].toFixed(3)})$.`,
        commonErrors: [],
        requiresWorking: false,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
      {
        id: "c",
        stem: `Using your graph, find the value of $n$.`,
        marks: 2,
        answer: numAns(A.n),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `a gradient from two points on the line, $\\frac{${d3(A.logy[4] - A.logy[0])}}{${d3(A.logx[4] - A.logx[0])}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${A.n}$`, ft: true },
        ],
        hints: ["Take two points far apart on the line.", `The gradient is $n$.`],
        workedSolution: `Using the two end points, the gradient is $\\frac{${A.logy[4].toFixed(3)} - ${A.logy[0].toFixed(3)}}{${A.logx[4].toFixed(3)} - ${A.logx[0]}} = ${A.n}$.\nComparing with $y = mx + c$, that gradient is $n$, so $n = ${A.n}$.`,
        commonErrors: [
          ce("fm.logs.gradient-inverted", E.aInverted, `The fraction is the wrong way up. The change in $\\log F$ belongs on top, which gives $${A.n}$.`, 1, CER22),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "b", rule: "use-candidate-diagram" },
      },
      {
        id: "d",
        stem: `Using your graph, find the value of $k$. Give your answer correct to one decimal place.`,
        marks: 2,
        answer: numAns(A_K, { dp: 1 }),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `intercept $= ${A.logk.toFixed(3)}$, so $k = 10^{${A.logk.toFixed(3)}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${A_K.toFixed(1)}$`, ft: true },
        ],
        hints: ["The intercept is not the constant itself.", "Undo the logarithm with a power of ten."],
        workedSolution: `The line meets the vertical axis at $${A.logk.toFixed(3)}$, and that value is $\\log k$.\nSo $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$ to one decimal place.`,
        commonErrors: [
          ce("fm.logs.log-a-given-as-a", E.aLogK, `That is the intercept, which is $\\log k$. It still has to be un-logged: $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.`, 1, CER18),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "b", rule: "use-candidate-diagram" },
      },
      {
        id: "e",
        stem: `Write down the relationship between $F$ and $h$.`,
        marks: 1,
        answer: {
          kind: "mcq",
          shuffle: true,
          options: [
            { id: "a", text: `$F = ${A_K.toFixed(1)} h^{${A.n}}$`, correct: true, feedback: `The power comes from the gradient and the coefficient from the un-logged intercept.` },
            { id: "b", text: `$\\log F = ${A.n} \\log h + ${A.logk.toFixed(3)}$`, correct: false, misconception: "fm.logs.log-values-in-original-equation", feedback: `That is the equation of the line you drew. The question asks for the relationship between $F$ and $h$ themselves.` },
            { id: "c", text: `$F = ${A.logk.toFixed(3)} h^{${A.n}}$`, correct: false, misconception: "fm.logs.log-a-given-as-a", feedback: `The intercept has been used without un-logging it. The coefficient is $10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.` },
            { id: "d", text: `$F = ${A.n} h^{${A_K.toFixed(1)}}$`, correct: false, misconception: "fm.logs.gradient-intercept-swapped", feedback: `The two constants have swapped places. The gradient is the power.` },
          ],
        },
        scheme: [{ id: "W1", code: "W", marks: 1, for: `$F = ${A_K.toFixed(1)} h^{${A.n}}$`, ft: true }],
        hints: ["Put your two constants into the form the question named."],
        workedSolution: `With $n = ${A.n}$ and $k = ${A_K.toFixed(1)}$, the relationship is $F = ${A_K.toFixed(1)} h^{${A.n}}$.`,
        commonErrors: [],
        requiresWorking: false,
        followThrough: { fromPart: "d", rule: "use-candidate-value" },
      },
    ],
  },
  {
    id: `q.${TOPIC}.0010`,
    difficulty: 4,
    style: "exam-style",
    commandWords: ["Complete", "Find", "Calculate"],
    setting: "A second context with a different power, taken from the table straight to a prediction",
    figures: tableFigure(
      tableSvg(B, {
        blanks: [{ r: 2, c: 3 }, { r: 3, c: 3 }],
        caption: `A table of diameter, price, log d and log P for five circular tabletops, with two values left blank`,
      }),
      `A table of diameter, price, log d and log P for five circular tabletops, with one log d value and one log P value left blank.`,
    ),
    parts: [
      {
        id: "a",
        stem: `A workshop prices circular tabletops by diameter. The table shows five diameters $d$ cm and prices $P$ pounds, and it is believed that $P = k d^{n}$.\nFill in the two values missing from the table, each correct to three decimal places.`,
        marks: 2,
        answer: {
          kind: "table",
          cells: [
            { row: 2, col: 3, value: B.logx[2], tolerance: { type: "absolute", value: 0.0005 } },
            { row: 3, col: 3, value: B.logy[2], tolerance: { type: "absolute", value: 0.0005 } },
          ],
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$${B.logx[2].toFixed(3)}$` },
          { id: "W1", code: "W", marks: 1, for: `$${B.logy[2].toFixed(3)}$` },
        ],
        hints: ["Three decimal places for both."],
        workedSolution: `$\\log ${B.xs[2]} = ${B.logx[2].toFixed(3)}$ and $\\log ${B.ys[2]} = ${B.logy[2].toFixed(3)}$, each to three decimal places.`,
        commonErrors: [],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: `The graph of $\\log P$ against $\\log d$ is a straight line through $(${B.logx[0].toFixed(3)}, ${B.logy[0].toFixed(3)})$ and $(${B.logx[4]}, ${B.logy[4].toFixed(3)})$.\nFind the value of $n$.`,
        marks: 2,
        answer: numAns(B.n),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$\\frac{${d3(B.logy[4] - B.logy[0])}}{${d3(B.logx[4] - B.logx[0])}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${B.n}$`, ft: true },
        ],
        hints: [`The gradient of the log-log line is $n$.`],
        workedSolution: `The gradient is $\\frac{${B.logy[4].toFixed(3)} - ${B.logy[0].toFixed(3)}}{${B.logx[4]} - ${B.logx[0].toFixed(3)}} = \\frac{${d3(B.logy[4] - B.logy[0])}}{${d3(B.logx[4] - B.logx[0])}} = ${B.n}$.\nSo $n = ${B.n}$.`,
        commonErrors: [
          ce("fm.logs.gradient-inverted", E.bInverted, `The fraction is upside down. The change in $\\log P$ goes on top, giving $${B.n}$.`, 1, CER22),
        ],
        requiresWorking: true,
      },
      {
        id: "c",
        stem: `The same line meets the vertical axis at $${B.logk.toFixed(3)}$.\nFind the value of $k$. Give your answer correct to one decimal place.`,
        marks: 2,
        answer: numAns(B_K, { dp: 1 }),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$k = 10^{${B.logk.toFixed(3)}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${B_K.toFixed(1)}$`, ft: true },
        ],
        hints: ["The intercept is the logarithm of the constant."],
        workedSolution: `The intercept is $\\log k = ${B.logk.toFixed(3)}$, so $k = 10^{${B.logk.toFixed(3)}} = ${B_K.toFixed(1)}$ to one decimal place.`,
        commonErrors: [
          ce("fm.logs.log-a-given-as-a", E.bLogK, `That is $\\log k$, straight off the axis. Un-log it: $k = 10^{${B.logk.toFixed(3)}} = ${B_K.toFixed(1)}$.`, 1, CER18),
        ],
        requiresWorking: true,
      },
      {
        id: "d",
        stem: `Using $P = ${B_K.toFixed(1)} d^{${B.n}}$, calculate the price of a tabletop of diameter $${B_PRED_X}$ cm.`,
        marks: 2,
        answer: numAns(B_PRED_Y),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `$${B_K.toFixed(1)} \\times ${B_PRED_X}^{${B.n}}$` },
          { id: "W1", code: "W", marks: 1, for: `$${B_PRED_Y}$`, ft: true },
        ],
        hints: ["The diameter goes in, not its logarithm."],
        workedSolution: `$P = ${B_K.toFixed(1)} \\times ${B_PRED_X}^{${B.n}} = ${B_K.toFixed(1)} \\times ${B_PRED_X ** B.n} = ${B_PRED_Y}$ pounds.\nThe diameter $${B_PRED_X}$ cm sits inside the range $${B.xs[0]}$ cm to $${B.xs[4]}$ cm, so the prediction is safe.`,
        commonErrors: [
          ce("fm.logs.log-values-in-original-equation", E.bLogsIntoPowerLaw, `That came from putting $\\log ${B_PRED_X}$ into the power law. The relationship takes the diameter itself, so $P = ${B_PRED_Y}$.`, 0, CER18),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "c", rule: "use-candidate-value" },
      },
    ],
  },
];

function buildQuestion(q) {
  const totalMarks = q.parts.reduce((s, p) => s + p.marks, 0);
  const verbFor = (p) => {
    if (p.stem.includes("Complete")) return "complete";
    if (p.stem.includes("Plot")) return "plot";
    if (p.stem.includes("Write down")) return "write-down";
    if (p.stem.includes("Identify")) return "identify";
    if (p.stem.includes("Calculate")) return "calculate";
    return "find";
  };
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
    examinerSources: [CER18, CER22, CER25],
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
    stem: `A log-log graph of $\\log F$ against $\\log h$ is a straight line through $(${A.logx[0]}, ${A.logy[0].toFixed(3)})$ and $(${A.logx[4].toFixed(3)}, ${A.logy[4].toFixed(3)})$, where $F = k h^{n}$.\nFind $n$ and $k$, and write down the relationship between $F$ and $h$.`,
    figure: figure(TRIANGLE_SVG, `A log-log line with a dashed right-angled triangle between its two end points, both legs labelled, and the intercept marked log k.`),
    steps: [
      {
        n: 1,
        working: `Write the two forms side by side: $\\log F = n \\log h + \\log k$ and $y = mx + c$.`,
        decision: "This line costs nothing and it decides everything that follows: it is what tells you the gradient is the power and the intercept is the logarithm of the constant.",
        earns: ["MW1"],
      },
      {
        n: 2,
        working: `Gradient $= \\frac{${A.logy[4].toFixed(3)} - ${A.logy[0].toFixed(3)}}{${A.logx[4].toFixed(3)} - ${A.logx[0]}} = \\frac{${d3(A.logy[4] - A.logy[0])}}{${d3(A.logx[4] - A.logx[0])}} = ${A.n}$, so $n = ${A.n}$.`,
        decision: "The change in the vertical goes on top. Writing the fraction out before dividing is what stops it going in upside down.",
        whyMenu: {
          options: [
            `Because the gradient sits where $m$ sits, and the comparison puts $n$ there`,
            `Because $n$ is always the larger of the two constants`,
            `Because the gradient of any log-log line is $1$`,
          ],
          correct: 0,
          explain: `Only the comparison with $y = mx + c$ decides it. The gradient is in the $m$ position, and the algebra put $n$ there.`,
        },
        earns: ["M2"],
      },
      {
        n: 3,
        working: `The line meets the vertical axis at $${A.logk.toFixed(3)}$, so $\\log k = ${A.logk.toFixed(3)}$.`,
        decision: "Name what you have read before you use it. Calling it log k rather than k is the whole defence against the slip the reports name most often.",
        earns: ["M3"],
      },
      {
        n: 4,
        working: `Un-log it: $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.`,
        decision: "A separate line for a separate step. Folded into the line above, this is the step that quietly goes missing.",
        earns: ["W1"],
      },
      {
        n: 5,
        working: `So the relationship is $F = ${A_K.toFixed(1)} h^{${A.n}}$.`,
        decision: `Answer in the form the question named. Leaving it as a log equation answers a different question, and so does giving the two constants without assembling them.`,
        earns: ["W2"],
      },
    ],
    finalAnswer: `$n = ${A.n}$, $k = ${A_K.toFixed(1)}$ and $F = ${A_K.toFixed(1)} h^{${A.n}}$`,
    twin: {
      stem: `A log-log graph of $\\log P$ against $\\log d$ is a straight line of gradient $${B.n}$ meeting the vertical axis at $${B.logk.toFixed(3)}$, where $P = k d^{n}$.\nFind $k$, correct to one decimal place.`,
      answer: numAns(B_K, { dp: 1 }),
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4, 5] },
      { showSteps: 1, studentSupplies: [2, 3, 4, 5] },
    ],
    verification: `ver.we.${TOPIC}.01`,
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
        stem: `Three quick checks on what this lesson is built from. None of them is the new idea, so answer from what you already know.\nWhat is the gradient of the straight line through $(1, 5)$ and $(4, 11)$?`,
        skill: "Gradient from two points",
        options: [
          { id: "a", text: "$2$", correct: true, feedback: `The change in the vertical is $6$ and in the horizontal is $3$, so the gradient is $2$.` },
          { id: "b", text: "$0.5$", correct: false, feedback: `That is the fraction the other way up. The vertical change belongs on top.` },
          { id: "c", text: "$6$", correct: false, feedback: `That is the vertical change on its own. It still has to be divided by the horizontal change.` },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "p2",
        stem: `In $y = mx + c$, what does $c$ tell you?`,
        skill: "The intercept of a straight line",
        options: [
          { id: "a", text: "Where the line crosses the vertical axis", correct: true, feedback: `At $x = 0$ the equation leaves $y = c$, which is the intercept.` },
          { id: "b", text: "How steep the line is", correct: false, feedback: `That is $m$, the gradient. The constant $c$ fixes the height.` },
          { id: "c", text: "Where the line crosses the horizontal axis", correct: false, feedback: `That crossing is where $y = 0$, which is a different value.` },
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "p3",
        stem: `Using the laws of logarithms, what is $\\log(k x^{n})$?`,
        skill: "Product and power laws",
        options: [
          { id: "a", text: `$\\log k + n \\log x$`, correct: true, feedback: `The product law splits it, then the power law brings $n$ down in front.` },
          { id: "b", text: `$\\log k \\times n \\log x$`, correct: false, feedback: `A product inside a logarithm becomes a sum of logarithms, not a product of them.` },
          { id: "c", text: `$n \\log k + \\log x$`, correct: false, feedback: `The power belongs to $x$, so it is $\\log x$ that $n$ multiplies.` },
        ],
        secondsExpected: 30,
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
        stem: `Taking logarithms of $y = kx^{n}$ gives which straight line?`,
        skill: "The linear form of a power law",
        options: [
          { id: "a", text: `$\\log y = n \\log x + \\log k$`, correct: true, feedback: `Product law then power law, and the result sits beside $y = mx + c$.` },
          { id: "b", text: `$\\log y = k \\log x + \\log n$`, correct: false, misconception: "fm.logs.gradient-intercept-swapped", feedback: `The two constants have changed places. The power comes down as the gradient.` },
          { id: "c", text: `$\\log y = \\log n + \\log k + \\log x$`, correct: false, misconception: "fm.logs.power-as-multiplier-inside", feedback: `The power does not become a separate logarithm; it multiplies $\\log x$.` },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d2",
        stem: `A log-log line has gradient $${A.n}$ and meets the vertical axis at $${A.logk.toFixed(3)}$. What is $k$?`,
        skill: "Un-logging the intercept",
        options: [
          { id: "a", text: `$${A_K.toFixed(1)}$`, correct: true, feedback: `The intercept is $\\log k$, so $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.` },
          { id: "b", text: `$${A.logk.toFixed(3)}$`, correct: false, misconception: "fm.logs.log-a-given-as-a", feedback: `That is the intercept itself, which is the logarithm of $k$. It still has to be un-logged.` },
          { id: "c", text: `$${A.n}$`, correct: false, misconception: "fm.logs.gradient-intercept-swapped", feedback: `That is the gradient, which gives the power rather than the constant.` },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d3",
        stem: `A log-log line rises by $${d3(A.logy[4] - A.logy[0])}$ as $\\log h$ increases by $${d3(A.logx[4] - A.logx[0])}$. What is $n$?`,
        skill: "The gradient, the right way up",
        options: [
          { id: "a", text: `$${A.n}$`, correct: true, feedback: `The vertical change goes on top: $\\frac{${d3(A.logy[4] - A.logy[0])}}{${d3(A.logx[4] - A.logx[0])}} = ${A.n}$.` },
          { id: "b", text: `$${d3(E.aInverted)}$`, correct: false, misconception: "fm.logs.gradient-inverted", feedback: `That is the fraction upside down, which gives the reciprocal of the power.` },
          { id: "c", text: `$${d3(A.logy[4] - A.logy[0])}$`, correct: false, misconception: "fm.logs.gradient-inverted", feedback: `That is the vertical change alone. A gradient is always a division.` },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d4",
        stem: `A table of logarithms is being completed for a log-log graph. To how many decimal places should the values be given?`,
        skill: "The accuracy this topic is marked to",
        options: [
          { id: "a", text: "Three", correct: true, feedback: `Three decimal places throughout, in the table and on the plot.` },
          { id: "b", text: "Two", correct: false, misconception: "fm.logs.decimal-places-instruction-ignored", feedback: `Two places is the accuracy the reports name as a lost mark almost every year on this topic.` },
          { id: "c", text: "As many as the calculator shows", correct: false, misconception: "fm.logs.decimal-places-instruction-ignored", feedback: `The paper asks for three, and a full calculator display is not what the answer line is marked against.` },
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "d5",
        stem: `With $F = ${A_K.toFixed(1)} h^{${A.n}}$, what goes into the relationship when a depth of $${A_PRED_X}$ cm is predicted?`,
        skill: "What the finished relationship takes",
        options: [
          { id: "a", text: `$${A_PRED_X}$, the depth itself`, correct: true, feedback: `The logarithms were only there to straighten the graph. The relationship takes the measurement.` },
          { id: "b", text: `$\\log ${A_PRED_X}$, the logarithm of the depth`, correct: false, misconception: "fm.logs.log-values-in-original-equation", feedback: `Putting a logarithm into the power law mixes the two forms, and gives $${d3(E.aLogsIntoPowerLaw)}$ instead of $${A_PRED_Y}$.` },
          { id: "c", text: `$${A.logk.toFixed(3)}$, the intercept`, correct: false, misconception: "fm.logs.log-values-in-original-equation", feedback: `The intercept is already used: it became the constant in front. The depth is what varies.` },
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
    stem: `Orla drew a log-log graph for $F = k h^{n}$ and read the gradient as ${A.n} and the intercept as ${A.logk.toFixed(3)}. Her working:`,
    studentWorking: [
      `log F = n log h + log k`,
      `comparing with y = mx + c`,
      `gradient = n, so n = ${A.n}`,
      `intercept = k, so k = ${A.logk.toFixed(3)}`,
      `F = ${A.logk.toFixed(3)} h^${A.n}`,
    ],
    mistakeLine: 4,
    misconception: "fm.logs.log-a-given-as-a",
    whatWentWrong: `Lines 1 to 3 are exactly right, and line 5 is honest work on the value line 4 handed over.\nLine 4 names the intercept as $k$. The comparison in line 2 put $\\log k$ in the intercept position, not $k$, so the number read off the axis is the logarithm of the constant.\nUn-logging it gives $k = 10^{${A.logk.toFixed(3)}} = ${A_K.toFixed(1)}$.`,
    // 23 Sep (job 3): the first line mirrors the flagged line under its own label (intercept), which is what lets the
    // fix box mark her value for k against it: "k = 4", "k = 10^0.602 = 4.0" and a bare "4" all fix it, while
    // "log k = 0.602" only renames line 4's number and is "not there yet". Twelve correction shapes were tried
    // against markFix; one step per line refused "k = 4", because no line then carried the flagged label.
    correction: [`intercept = log k, so k = 10^${A.logk.toFixed(3)} = ${A_K.toFixed(1)}`, `F = ${A_K.toFixed(1)} h^${A.n}`],
    marksEarnedAsWritten: ["MW1", "M2"],
    feedback: `The comparison and the gradient are both right, so the method marks stand and the rest is marked on her own value. The fix is one extra line, written every time: the intercept is log k, so k is ten to that power. Examiners have named this step in three separate series, which is why it is worth a line of its own.`,
    source: CER18,
  },
];

const prompts = [
  {
    id: `rp.${TOPIC}.01`,
    kind: "formula",
    prompt: "What straight line does $y = kx^{n}$ become when logarithms are taken?",
    answer: "$\\log y = n \\log x + \\log k$, so the gradient is $n$ and the intercept is $\\log k$.",
    keyWords: ["n log x", "log k", "gradient"],
    difficultyPrior: 4,
  },
  {
    id: `rp.${TOPIC}.02`,
    kind: "procedure",
    prompt: "Give the three steps that turn $y = kx^{n}$ into a straight line.",
    answer: "Take logarithms of both sides; use the product law to split $\\log(kx^{n})$ into $\\log k + \\log x^{n}$; use the power law to write $\\log x^{n}$ as $n \\log x$.",
    keyWords: ["take logarithms", "product law", "power law"],
    difficultyPrior: 5,
  },
  {
    id: `rp.${TOPIC}.03`,
    kind: "trap",
    prompt: "The log-log line meets the vertical axis at $0.602$. What is $k$?",
    answer: "The intercept is $\\log k$, so $k = 10^{0.602} = 4.0$ to one decimal place. The intercept is never the constant itself.",
    keyWords: ["log k", "10", "4.0"],
    difficultyPrior: 6,
  },
  {
    id: `rp.${TOPIC}.04`,
    kind: "trap",
    prompt: "Which way up is the gradient of a log-log line written?",
    answer: "The change in $\\log y$ on top, the change in $\\log x$ underneath, taken between two points far apart on the line.",
    keyWords: ["log y", "top", "log x"],
    difficultyPrior: 5,
  },
  {
    id: `rp.${TOPIC}.05`,
    kind: "qa",
    prompt: "To how many decimal places are the log values given, and what are the axes labelled?",
    answer: "Three decimal places throughout, and the axes are labelled $\\log x$ and $\\log y$, not $x$ and $y$.",
    keyWords: ["three", "log x", "log y"],
    difficultyPrior: 4,
  },
  {
    id: `rp.${TOPIC}.06`,
    kind: "trap",
    prompt: "Why should a prediction be checked against the range of the data?",
    answer: "The line was fitted only to the readings you plotted, so outside that range the relationship has not been tested and the answer is a guess.",
    keyWords: ["range", "fitted", "guess"],
    difficultyPrior: 5,
  },
  {
    id: `rp.${TOPIC}.07`,
    kind: "trap",
    prompt: "Once $k$ and $n$ are found, what goes into the relationship to make a prediction?",
    answer: "The measurement itself, not its logarithm. The logarithms were only used to straighten the graph.",
    keyWords: ["measurement", "not its logarithm"],
    difficultyPrior: 5,
  },
];

const insight = JSON.parse(fs.readFileSync(`${process.cwd()}/packs/further-maths/insights/u1.log-log-graphs.json`, "utf8"));

/* ---- bundle ---------------------------------------------------------------------------------------- */

const noteChecks = [
  check("schema", "Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, gate ids g1 to g7 are unique, every prompt block names a prompt in this bundle, and every gate restates the values it needs so it reads alone in the review inbox."),
  check("scope-tier", "FM1 is untiered and calculator-allowed. The technique stays inside FM1-LOG-02: a log/log plot of a power law drawn from a table, which the Teacher Guidance says will give a straight line. The change-of-base rule, semi-log plots of y = ka^x, natural logarithms, log-ruled paper and least-squares regression are all outside the specification and appear nowhere."),
  check("formula-sheet", "The Unit 1 sheet gives only a^x = n so x = log_a n. The relationship log y = n log x + log k is NOT given, so the note derives it in three lines and the Sheet lists it as must-know."),
  check("command-words", "Complete, Plot, Find, Write down, Calculate and Identify are the command words, with the tariffs from packs/further-maths/exam-true/command-words.json (Complete 1-2-3, Sketch/Plot 1-2-4, Find 2-3-5, Write down 1-1-2). The stems keep the shape of the log-log questions read in the 2022 and 2025 FM1 papers while every eight-word run is our own."),
  check("tariff", "The exam-style question runs 2 + 3 + 2 + 2 + 1, matching the 6 + 4 + 2 shape of Summer 2022 Q12 and Summer 2025 Q10 with the table and the plot separated so each is marked on its own; the second runs 2 + 2 + 2 + 2."),
  check("maths-numeric", `Both data sets are generated from k and n, so every printed value is computed: set A is k = ${A.k}, n = ${A.n}, giving flows ${A.ys.join(", ")} and logs ${A.logy.map((v) => v.toFixed(3)).join(", ")}; set B is k = ${B.k}, n = ${B.n}, giving prices ${B.ys.join(", ")}. The identity log y = n log x + log k was checked at three sample points in each set (${A.samples.map((s) => `${s.lhs} vs ${s.rhs}`).join("; ")}), the gradient between the end points was recomputed as ${A_GRAD} and ${B_GRAD}, and every k was recovered as 10 to the intercept.`),
  check("examiner-alignment", "One examiner callout stands in the body beside the un-logging step (Summer 2018 Q11, the intercept handed in as the constant). Every other finding is a Sheet trap. Gates g1 and g2 fix what is plotted and what the gradient means, g3 the three decimal places, g4 the axis labels, g5 the gradient the right way up, g6 the un-logging, g7 the prediction."),
  check("copy-shingle", "An 8-word shingle scan of the note and the bundle against every text file of the private FM corpus (scratchpad/fm1-batch-f/lib.mjs shingleClash) returns nothing. The weir and tabletop contexts are new; the enrichment dossier's framings are recreated in our own words and our own figures, and no external text is reproduced."),
  check("style-lint", "British English, second person, calm; no exclamation marks and no verdict word about a learner's answer. Every maths segment opens and closes inside one line and holds no prose words, checked by lintTree before the files were written. Six inline SVG figures, all computed from the two data sets, and one embeddable video from data/links/media-map.json followed immediately by a gate. The closing panel is a pointer of under 80 words followed by the prompts."),
];

const itemChecks = (detail) => [
  check("schema", "Validated by pipeline/build-content.mts against the Zod Question / WorkedExample / DiagnosticSet / FindTheMistake schema; every scheme sums to its part's marks and the skeleton matches the parts."),
  check("maths-numeric", detail),
  check("command-words", "Command words and tariffs taken from packs/further-maths/exam-true/command-words.json; the wording is ours."),
  check("examiner-alignment", "Every distractor and common error carries a registry misconception evidenced by the Summer 2018 Q11, Summer 2019 Q10, Summer 2022 Q12, Summer 2024 Q12 or Summer 2025 Q10 report block."),
  check("copy-shingle", "8-word shingle scan against the private FM corpus returns nothing."),
  check("style-lint", "KaTeX segments paired and prose-free; British English; no exclamation marks; no figure prints the value its own part asks for."),
];

const verification = [
  verLog(`ver.note.${TOPIC}`, `note.${TOPIC}`, noteChecks),
  verLog(`ver.we.${TOPIC}.01`, `we.${TOPIC}.01`, itemChecks(`The worked example reads n = ${A.n} from the gradient ${d3(A.logy[4] - A.logy[0])} over ${d3(A.logx[4] - A.logx[0])} and k = 10 to the power ${A.logk.toFixed(3)} = ${A_K.toFixed(1)}; the twin recovers k = ${B_K.toFixed(1)} from an intercept of ${B.logk.toFixed(3)}. Both were computed, not typed.`)),
  ...builtQuestions.map((q) =>
    verLog(
      `ver.${q.id}`,
      q.id,
      itemChecks(
        `Every value was computed from k and n by the generator: ${q.parts
          .map((p) => `${p.id} -> ${p.answer.kind === "numeric" ? p.answer.value : p.answer.kind === "table" ? p.answer.cells.map((c) => c.value).join(", ") : "the option or plot the scheme names"}`)
          .join("; ")}. Each common-error value was produced by executing the route its feedback describes (routes.* in the generator) and re-checked against the published JSON by verify-published.mjs. The plotted points were checked against the app's own plotLattice, so every one can be tapped within the part's tolerance.`,
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
    title: "Log/log graphs: finding k and n in y = kxⁿ",
    subject: "further-maths",
    unit: "FM1",
    tier: "untiered",
    strand: "Logarithms",
    statementIds: REFS,
    prerequisites: ["fm.u1.laws-of-logarithms"],
    order: 43,
    hardness: "S",
    difficulty: 3,
    examinerFlagged: true,
    examinerSources: [CER18, CER19, CER22, CER24, CER25],
    examWeightHint:
      "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. This is one long structured question, once a paper, worth about 10 to 12 marks, and its parts come in the same order every year: Summer 2018 Q11, Summer 2019 Q10, Summer 2022 Q12 (6 + 4 + 2), Summer 2023 Q13, Summer 2024 Q12, Summer 2025 Q10 (6 + 4 + 2). The scheme gives M for taking logarithms, W for the table to three decimal places, W each for labelled axes, plotted points and a straight line, M and W for the gradient, M and W for the un-logged constant, and the later marks are given on follow-through from the candidate's own graph.",
    mustMemorise: [
      "y = kxⁿ becomes log y = n log x + log k: gradient n, intercept log k",
      "k = 10 to the power of the intercept, never the intercept itself",
      "Table values to three decimal places; axes labelled log x and log y; points circled; the line ruled",
      "Choose the scale from the range of the log values, not the raw data",
      "A prediction must lie inside the range of the data the line was drawn from",
    ],
    onFormulaSheet: ["If aˣ = n then x = logₐ n (Unit 1 formula sheet, page 2). The relationship log y = n log x + log k is not given."],
    notOnThisSpec: [
      "The change of base rule, which the Teacher Guidance excludes",
      "Semi-log graphs and relationships of the form y = kaˣ",
      "Natural logarithms and the number e",
      "Logarithmic graph paper, since CCEA supplies ordinary paper and a table of computed logarithms",
      "Least-squares regression, correlation coefficients and residuals",
    ],
    externalRefs: [
      {
        kind: "youtube",
        videoId: "KvipqSYQrmA",
        channel: "corbettmaths",
        credit: "log/log Graphs, corbettmaths (embeddable id verified in data/links/media-map.json)",
      },
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports",
        asOf: "2026-09-20",
      },
    ],
    keywords: ["log-log graph", "straight line", "gradient", "intercept", "power law", "y = kx^n"],
  },
  note: {
    id: `note.${TOPIC}`,
    topic: TOPIC,
    title: "Log/log graphs: finding k and n in y = kxⁿ",
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
        "log y = n log x + log k, derived from y = kxⁿ",
        "Gradient = n, intercept = log k",
        "k = 10 to the power of the intercept",
        "Log values to three decimal places; axes labelled log x and log y",
      ],
    },
    notOnThisSpec: [
      "The change of base rule",
      "Semi-log graphs and y = kaˣ",
      "Natural logarithms and e",
      "Logarithmic graph paper",
      "Least-squares regression and correlation coefficients",
    ],
    hardness: "S",
    examinerFlagged: true,
    externalRefs: [
      {
        kind: "youtube",
        videoId: "KvipqSYQrmA",
        channel: "corbettmaths",
        credit: "log/log Graphs, corbettmaths (embeddable id verified in data/links/media-map.json)",
      },
    ],
    sheet: {
      mustBeAbleTo: [
        "Derive log y = n log x + log k from y = kxⁿ in three lines",
        "Complete a table of log values to three decimal places",
        "Choose a scale from the range of the log values",
        "Label the axes log x and log y before plotting",
        "Plot and circle each point, then rule a straight line through them",
        "Read the gradient from two points far apart on the line, the right way up",
        "Read the intercept as log k and un-log it to find k",
        "Write the finished relationship in the form the question named",
        "Predict from the relationship using the measurement itself, and check the prediction lies inside the data range",
        "Round a contextual answer the way the situation demands",
      ],
      howExamined:
        "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. This is one long structured question, once a paper, worth about 10 to 12 marks: Summer 2018 Q11, Summer 2019 Q10, Summer 2022 Q12 (6 for the table, the plot and the line, 4 for the two constants, 2 for a prediction), Summer 2023 Q13, Summer 2024 Q12, Summer 2025 Q10 (the same 6 + 4 + 2). The parts come in the same order every year: complete the table, plot and draw the line, find the two constants, write the relationship, predict. Marks are given on follow-through from the candidate's own graph, so a wrong reading early does not cost everything.",
      traps: [
        "Giving the intercept as the constant instead of un-logging it (Summer 2018 FM1 Q11, Summer 2019 FM1 Q10, Summer 2022 FM1 Q12)",
        "Inverting the gradient, so the answer is the reciprocal of the power (Summer 2022 FM1 Q12, Summer 2024 FM1 Q12)",
        "Log values given to two decimal places where three are demanded (Summer 2022 FM1 Q12, Summer 2025 FM1 Q10)",
        "Axes unlabelled, or the log of one variable plotted on the wrong axis (Summer 2019 FM1 Q10, Summer 2022 FM1 Q12, Summer 2025 FM1 Q10)",
        "An inappropriate scale, chosen from the raw data rather than the log values, so the points bunch (Summer 2018 FM1 Q11)",
        "Points plotted but not circled, or the line not ruled (Summer 2019 FM1 Q10, Summer 2022 FM1 Q12)",
        "Substituting log values into the power law itself instead of the measurement (Summer 2018 FM1 Q11)",
        "A prediction outside the range of the plotted data accepted without question (Summer 2019 FM1 Q10, Summer 2023 FM1 Q13)",
        "The two constants written on each other's answer lines (Summer 2025 FM1 Q10)",
        "A contextual answer rounded down when the situation needs it rounded up (Summer 2024 FM1 Q12)",
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

/* ---- checks and write -------------------------------------------------------------------------------- */

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
console.log(`  A: k=${A.k} n=${A.n} logs=${A.logy.map((v) => v.toFixed(3)).join(",")} gradient=${A_GRAD} k from intercept=${A_K}`);
console.log(`  B: k=${B.k} n=${B.n} logs=${B.logy.map((v) => v.toFixed(3)).join(",")} gradient=${B_GRAD} k from intercept=${B_K}`);
