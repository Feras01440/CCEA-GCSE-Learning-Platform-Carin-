/**
 * FM1 batch E shared generator library.
 * Exact rational arithmetic, polynomials with integer powers (positive and negative),
 * derivative / integral, LaTeX printing, SVG builders and the lint gates the brief demands.
 * Nothing here is hand-typed into a bundle: every printed number comes out of these functions.
 */

/* ---------------- exact rationals ---------------- */

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export function fr(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`fr needs integers, got ${n}/${d}`);
  if (d === 0) throw new Error("fr: zero denominator");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
export const isFr = (v) => v && typeof v === "object" && Number.isInteger(v.n) && Number.isInteger(v.d);
const F = (v) => (isFr(v) ? v : fr(v));
export const add = (a, b) => fr(F(a).n * F(b).d + F(b).n * F(a).d, F(a).d * F(b).d);
export const sub = (a, b) => add(a, neg(b));
export const neg = (a) => fr(-F(a).n, F(a).d);
export const mul = (a, b) => fr(F(a).n * F(b).n, F(a).d * F(b).d);
export const div = (a, b) => {
  const B = F(b);
  if (B.n === 0) throw new Error("div by zero");
  return fr(F(a).n * B.d, F(a).d * B.n);
};
export const num = (a) => F(a).n / F(a).d;
export const isInt = (a) => F(a).d === 1;
export const cmp = (a, b) => num(sub(a, b));
export const eqFr = (a, b) => F(a).n === F(b).n && F(a).d === F(b).d;

/** Plain text of a rational: "-8/3", "36". */
export function frText(a) {
  const x = F(a);
  return x.d === 1 ? String(x.n) : `${x.n}/${x.d}`;
}
/** LaTeX of a rational: "-\frac{8}{3}", "36". */
export function frLatex(a) {
  const x = F(a);
  if (x.d === 1) return String(x.n);
  return x.n < 0 ? `-\\frac{${-x.n}}{${x.d}}` : `\\frac{${x.n}}{${x.d}}`;
}
/** Decimal of a rational, fixed places, with no floating-point tail. */
export function frDec(a, places) {
  const v = num(a);
  const s = v.toFixed(places);
  return s === "-0" || /^-0\.0*$/.test(s) ? s.slice(1) : s;
}
/** Shortest exact decimal when the rational terminates, else null. */
export function frExactDec(a) {
  const x = F(a);
  let d = x.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  if (d !== 1) return null;
  let places = 0;
  let t = x.d;
  while (t % 2 === 0) {
    t /= 2;
    places++;
  }
  let p5 = 0;
  t = x.d;
  while (t % 5 === 0) {
    t /= 5;
    p5++;
  }
  return frDec(x, Math.max(places, p5));
}

/* ---------------- polynomials with integer powers ---------------- */

/** A polynomial is a Map from integer exponent to a non-zero rational coefficient. */
export function poly(terms) {
  const m = new Map();
  for (const [e, c] of terms) {
    const key = Number(e);
    if (!Number.isInteger(key)) throw new Error(`exponent must be an integer: ${e}`);
    const cur = m.get(key) ?? fr(0);
    const next = add(cur, c);
    if (next.n === 0) m.delete(key);
    else m.set(key, next);
  }
  return m;
}
export const polyFrom = (obj) => poly(Object.entries(obj).map(([e, c]) => [Number(e), F(c)]));
export const terms = (p) => [...p.entries()].sort((a, b) => b[0] - a[0]);

export function polyEval(p, x) {
  let out = fr(0);
  for (const [e, c] of p.entries()) {
    if (e >= 0) out = add(out, mul(c, ipow(F(x), e)));
    else {
      if (num(x) === 0) throw new Error("polyEval: negative power at x = 0");
      out = add(out, div(c, ipow(F(x), -e)));
    }
  }
  return out;
}
function ipow(a, k) {
  let out = fr(1);
  for (let i = 0; i < k; i++) out = mul(out, a);
  return out;
}

export function polyDeriv(p) {
  const out = [];
  for (const [e, c] of p.entries()) {
    if (e === 0) continue;
    out.push([e - 1, mul(c, fr(e))]);
  }
  return poly(out);
}

/** Indefinite integral (no constant). Throws on the excluded power -1. */
export function polyInteg(p) {
  const out = [];
  for (const [e, c] of p.entries()) {
    if (e === -1) throw new Error("integral of x^-1 is not on this specification");
    out.push([e + 1, div(c, fr(e + 1))]);
  }
  return poly(out);
}

export const polyAdd = (a, b) => poly([...terms(a), ...terms(b)]);
export const polyScale = (a, k) => poly(terms(a).map(([e, c]) => [e, mul(c, k)]));
export const polyMul = (a, b) => {
  const out = [];
  for (const [e1, c1] of a.entries()) for (const [e2, c2] of b.entries()) out.push([e1 + e2, mul(c1, c2)]);
  return poly(out);
};

/**
 * LaTeX for a polynomial in `v`.
 * style.negativeAsFraction: write a x^{-n} as \frac{a}{x^{n}} (how CCEA prints an answer).
 */
export function polyLatex(p, v = "x", style = {}) {
  const { negativeAsFraction = true } = style;
  const ts = terms(p);
  if (ts.length === 0) return "0";
  let s = "";
  for (const [e, c] of ts) {
    const negative = num(c) < 0;
    const mag = negative ? neg(c) : c;
    s += s === "" ? (negative ? "-" : "") : negative ? " - " : " + ";
    s += termLatex(mag, e, v, negativeAsFraction);
  }
  return s;
}
function termLatex(mag, e, v, negativeAsFraction) {
  const one = eqFr(mag, fr(1));
  if (e === 0) return frLatex(mag);
  if (e > 0) {
    const pow = e === 1 ? v : `${v}^{${e}}`;
    if (one) return pow;
    const m = F(mag);
    if (m.d === 1) return `${m.n}${pow}`;
    // a numerator of 1 is never printed beside the power: x^4/4, not 1x^4/4
    return `\\frac{${m.n === 1 ? "" : m.n}${pow}}{${m.d}}`;
  }
  const k = -e;
  const pow = k === 1 ? v : `${v}^{${k}}`;
  if (!negativeAsFraction) return `${one ? "" : frLatex(mag)}${v}^{-${k}}`;
  const m = F(mag);
  if (m.d === 1) return `\\frac{${m.n}}{${pow}}`;
  return `\\frac{${m.n}}{${m.d}${pow}}`;
}

/** Plain-text polynomial ("3x^2 - 4/x^3 + 5") for student-working lines and key words. */
export function polyText(p, v = "x") {
  const ts = terms(p);
  if (ts.length === 0) return "0";
  let s = "";
  for (const [e, c] of ts) {
    const negative = num(c) < 0;
    const mag = negative ? neg(c) : c;
    s += s === "" ? (negative ? "-" : "") : negative ? " - " : " + ";
    const m = F(mag);
    const coef = m.d === 1 ? String(m.n) : `(${m.n}/${m.d})`;
    if (e === 0) s += m.d === 1 ? String(m.n) : `${m.n}/${m.d}`;
    else if (e > 0) s += `${eqFr(mag, fr(1)) ? "" : coef}${v}${e === 1 ? "" : `^${e}`}`;
    else s += `${coef}${v}^${e}`;
  }
  return s;
}

/* ---------------- roots and quadratics ---------------- */

/** Rational roots of ax^2 + bx + c (a, b, c rationals) or null when they are not rational. */
export function quadRoots(a, b, c) {
  const A = F(a), B = F(b), C = F(c);
  const discNum = sub(mul(B, B), mul(fr(4), mul(A, C)));
  const d = num(discNum);
  if (d < 0) return null;
  const s = Math.sqrt(d);
  const rs = Math.round(s * 1e6) / 1e6;
  if (Math.abs(rs * rs - d) > 1e-9) return null;
  // sqrt of a rational p/q is rational only when p and q are both squares
  const pn = F(discNum).n, pd = F(discNum).d;
  const rn = Math.round(Math.sqrt(pn)), rd = Math.round(Math.sqrt(pd));
  if (rn * rn !== pn || rd * rd !== pd) return null;
  const root = fr(rn, rd);
  const r1 = div(add(neg(B), root), mul(fr(2), A));
  const r2 = div(sub(neg(B), root), mul(fr(2), A));
  return cmp(r1, r2) <= 0 ? [r1, r2] : [r2, r1];
}

/** Stationary points of a polynomial: [{x, y, d2, nature}] sorted by x. Rational x only. */
export function stationaryPoints(p) {
  const d1 = polyDeriv(p);
  const d2 = polyDeriv(d1);
  const es = [...d1.keys()].sort((a, b) => b - a);
  const top = es[0] ?? 0;
  let xs;
  if (top === 2) {
    const a = d1.get(2) ?? fr(0), b = d1.get(1) ?? fr(0), c = d1.get(0) ?? fr(0);
    xs = quadRoots(a, b, c);
    if (!xs) throw new Error("stationaryPoints: irrational roots");
  } else if (top === 1) {
    const a = d1.get(1) ?? fr(0), b = d1.get(0) ?? fr(0);
    xs = [div(neg(b), a)];
  } else throw new Error(`stationaryPoints: unsupported derivative degree ${top}`);
  return xs.map((x) => {
    const second = polyEval(d2, x);
    return {
      x,
      y: polyEval(p, x),
      d2: second,
      nature: num(second) > 0 ? "minimum" : num(second) < 0 ? "maximum" : "inconclusive",
    };
  });
}

/* ---------------- printing helpers ---------------- */

export const pointLatex = (x, y) => `(${frLatex(x)}, ${frLatex(y)})`;
export const pointText = (x, y) => `(${frText(x)}, ${frText(y)})`;
export const pointsLatex = (pts) => pts.map(([x, y]) => pointLatex(x, y)).join(", ");
/** Fixed-decimal formatter: never interpolate a raw float. */
export const dp = (v, places) => {
  const n = typeof v === "number" ? v : num(v);
  const s = n.toFixed(places);
  return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s;
};

/* ---------------- SVG ---------------- */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r1 = (v) => {
  const n = Math.round(v * 10) / 10;
  if (!Number.isFinite(n)) throw new Error("svg coordinate is not finite");
  return String(n);
};

/**
 * A plotted graph on axes through the origin.
 * opts: { xMin, xMax, yMin, yMax, xStep, yStep, curves:[{f, dashed?}], points:[{x,y,label?,anchor?,dy?}],
 *         verticals:[{x, from, to}], shade:{f, from, to}?, aria, width, height, xLabel, yLabel, notes:[{x,y,text,anchor?}] }
 */
export function graphSvg(opts) {
  const W = opts.width ?? 560;
  const H = opts.height ?? 340;
  const PAD = { l: 44, r: 26, t: 22, b: 40 };
  const { xMin, xMax, yMin, yMax } = opts;
  if (![xMin, xMax, yMin, yMax].every(Number.isFinite)) throw new Error("graphSvg needs finite bounds");
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const sx = (x) => PAD.l + ((x - xMin) / (xMax - xMin)) * iw;
  const sy = (y) => PAD.t + ih - ((y - yMin) / (yMax - yMin)) * ih;
  const parts = [];
  const xStep = opts.xStep ?? 1;
  const yStep = opts.yStep ?? 1;

  // grid
  const grid = [];
  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 1e-9; x += xStep) grid.push(`M ${r1(sx(x))} ${r1(PAD.t)} L ${r1(sx(x))} ${r1(PAD.t + ih)}`);
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) grid.push(`M ${r1(PAD.l)} ${r1(sy(y))} L ${r1(PAD.l + iw)} ${r1(sy(y))}`);
  parts.push(`<path d='${grid.join(" ")}' stroke='currentColor' stroke-width='0.5' stroke-opacity='0.16' fill='none'/>`);

  // shaded region under a curve
  if (opts.shade) {
    const { f, from, to } = opts.shade;
    const pts = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      pts.push(`${r1(sx(x))} ${r1(sy(clamp(f(x), yMin, yMax)))}`);
    }
    const base = `${r1(sx(to))} ${r1(sy(clamp(0, yMin, yMax)))} L ${r1(sx(from))} ${r1(sy(clamp(0, yMin, yMax)))}`;
    parts.push(`<path d='M ${pts.join(" L ")} L ${base} Z' fill='currentColor' fill-opacity='0.14' stroke='none'/>`);
  }

  // axes
  const axisY = clamp(0, yMin, yMax);
  const axisX = clamp(0, xMin, xMax);
  parts.push(`<path d='M ${r1(PAD.l)} ${r1(sy(axisY))} L ${r1(PAD.l + iw)} ${r1(sy(axisY))}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);
  parts.push(`<path d='M ${r1(sx(axisX))} ${r1(PAD.t)} L ${r1(sx(axisX))} ${r1(PAD.t + ih)}' stroke='currentColor' stroke-width='1.3' fill='none'/>`);

  // ticks
  const ticks = [];
  const labels = [];
  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 1e-9; x += xStep) {
    const v = Math.round(x * 1e6) / 1e6;
    if (Math.abs(v) < 1e-9) continue;
    ticks.push(`M ${r1(sx(v))} ${r1(sy(axisY) - 4)} L ${r1(sx(v))} ${r1(sy(axisY) + 4)}`);
    labels.push(`<text x='${r1(sx(v))}' y='${r1(sy(axisY) + 17)}' font-family='inherit' font-size='11' fill='currentColor' text-anchor='middle'>${esc(v)}</text>`);
  }
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) {
    const v = Math.round(y * 1e6) / 1e6;
    if (Math.abs(v) < 1e-9) continue;
    ticks.push(`M ${r1(sx(axisX) - 4)} ${r1(sy(v))} L ${r1(sx(axisX) + 4)} ${r1(sy(v))}`);
    labels.push(`<text x='${r1(sx(axisX) - 7)}' y='${r1(sy(v) + 4)}' font-family='inherit' font-size='11' fill='currentColor' text-anchor='end'>${esc(v)}</text>`);
  }
  parts.push(`<path d='${ticks.join(" ")}' stroke='currentColor' stroke-width='1' fill='none'/>`);
  parts.push(labels.join(""));
  parts.push(`<text x='${r1(sx(axisX) - 7)}' y='${r1(sy(axisY) + 17)}' font-family='inherit' font-size='11' fill='currentColor' text-anchor='end'>0</text>`);

  // curves
  for (const c of opts.curves ?? []) {
    const d = curvePath(c.f, c.from ?? xMin, c.to ?? xMax, sx, sy, yMin, yMax, c.samples);
    if (!d) throw new Error("graphSvg: a curve produced no path");
    parts.push(
      `<path d='${d}' stroke='currentColor' stroke-width='${c.dashed ? 1.3 : 2}' fill='none' stroke-linejoin='round' stroke-linecap='round'${c.dashed ? " stroke-dasharray='6 4' stroke-opacity='0.9'" : ""}/>`,
    );
  }

  // straight segments (dashed guides)
  if ((opts.verticals ?? []).length > 0) {
    const d = (opts.verticals ?? [])
      .map((v) => `M ${r1(sx(v.x))} ${r1(sy(clamp(v.from, yMin, yMax)))} L ${r1(sx(v.x))} ${r1(sy(clamp(v.to, yMin, yMax)))}`)
      .join(" ");
    parts.push(`<path d='${d}' stroke='currentColor' stroke-width='1.1' stroke-dasharray='5 4' stroke-opacity='0.75' fill='none'/>`);
  }
  if ((opts.horizontals ?? []).length > 0) {
    const d = (opts.horizontals ?? [])
      .map((v) => `M ${r1(sx(clamp(v.from, xMin, xMax)))} ${r1(sy(v.y))} L ${r1(sx(clamp(v.to, xMin, xMax)))} ${r1(sy(v.y))}`)
      .join(" ");
    parts.push(`<path d='${d}' stroke='currentColor' stroke-width='1.1' stroke-dasharray='5 4' stroke-opacity='0.75' fill='none'/>`);
  }

  // marked points
  for (const p of opts.points ?? []) {
    parts.push(`<circle cx='${r1(sx(p.x))}' cy='${r1(sy(p.y))}' r='3.4' fill='currentColor'/>`);
    if (p.label) {
      const anchor = p.anchor ?? "start";
      const ox = anchor === "end" ? -8 : anchor === "middle" ? 0 : 8;
      parts.push(
        `<text x='${r1(sx(p.x) + ox)}' y='${r1(sy(p.y) + (p.dy ?? -8))}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='${anchor}'>${esc(p.label)}</text>`,
      );
    }
  }
  for (const n of opts.notes ?? []) {
    parts.push(
      `<text x='${r1(sx(n.x))}' y='${r1(sy(n.y))}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='${n.anchor ?? "middle"}'>${esc(n.text)}</text>`,
    );
  }
  parts.push(`<text x='${r1(PAD.l + iw)}' y='${r1(sy(axisY) - 8)}' font-family='inherit' font-size='12' fill='currentColor' text-anchor='end'>${esc(opts.xLabel ?? "x")}</text>`);
  parts.push(`<text x='${r1(sx(axisX) + 8)}' y='${r1(PAD.t + 10)}' font-family='inherit' font-size='12' fill='currentColor'>${esc(opts.yLabel ?? "y")}</text>`);
  if (opts.footer) parts.push(`<text x='${r1(PAD.l + iw / 2)}' y='${r1(H - 8)}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='middle'>${esc(opts.footer)}</text>`);

  const aria = esc(opts.aria ?? "graph");
  return finish(`<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${aria}'><title>${aria}</title>${parts.join("")}</svg>`);
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
function curvePath(f, from, to, sx, sy, yMin, yMax, samples) {
  const n = samples ?? 170;
  const out = [];
  let pen = false;
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    let y;
    try {
      y = f(x);
    } catch {
      y = NaN;
    }
    if (!Number.isFinite(y) || y < yMin - 1e-9 || y > yMax + 1e-9) {
      pen = false;
      continue;
    }
    out.push(`${pen ? "L" : "M"} ${r1(sx(x))} ${r1(sy(y))}`);
    pen = true;
  }
  return out.length >= 2 ? out.join(" ") : null;
}

/** A labelled card of rows, used for method summaries. */
export function cardSvg({ title, rows, footer, width = 560, note }) {
  const rowH = 30;
  const top = title ? 46 : 20;
  const H = top + rows.length * rowH + (footer ? 34 : 12);
  const parts = [];
  if (title) parts.push(`<text x='20' y='28' font-family='inherit' font-size='13' fill='currentColor' fill-opacity='0.8'>${esc(title)}</text>`);
  rows.forEach((row, i) => {
    const y = top + i * rowH;
    parts.push(`<rect x='14' y='${r1(y)}' width='${width - 28}' height='26' rx='5' fill='currentColor' fill-opacity='0.06' stroke='currentColor' stroke-width='1'/>`);
    parts.push(`<text x='28' y='${r1(y + 18)}' font-family='inherit' font-size='13' fill='currentColor'>${esc(row[0])}</text>`);
    if (row[1]) parts.push(`<text x='${width - 28}' y='${r1(y + 18)}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='end'>${esc(row[1])}</text>`);
  });
  if (footer) parts.push(`<text x='${width / 2}' y='${r1(H - 12)}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='middle'>${esc(footer)}</text>`);
  if (note) parts.push(`<text x='20' y='${r1(H - 12)}' font-family='inherit' font-size='11.5' fill='currentColor'>${esc(note)}</text>`);
  return finish(`<svg viewBox='0 0 ${width} ${H}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${esc(title ?? "table")}'><title>${esc(title ?? "table")}</title>${parts.join("")}</svg>`);
}

/**
 * A labelled plane shape built from explicit segments, for the optimisation contexts.
 * shapes: [{kind:'rect'|'line'|'poly', ...}], labels: [{x,y,text,anchor?}]
 */
export function diagramSvg({ width = 520, height = 300, shapes, labels, aria, footer }) {
  const parts = [];
  for (const s of shapes) {
    if (s.kind === "rect") {
      parts.push(
        `<rect x='${r1(s.x)}' y='${r1(s.y)}' width='${r1(s.w)}' height='${r1(s.h)}' fill='${s.fill ? "currentColor" : "none"}' fill-opacity='${s.fill ?? 0}' stroke='currentColor' stroke-width='${s.width ?? 1.8}'${s.dashed ? " stroke-dasharray='6 4'" : ""}/>`,
      );
    } else if (s.kind === "line") {
      parts.push(
        `<path d='M ${r1(s.x1)} ${r1(s.y1)} L ${r1(s.x2)} ${r1(s.y2)}' stroke='currentColor' stroke-width='${s.width ?? 1.8}' fill='none'${s.dashed ? " stroke-dasharray='6 4'" : ""} stroke-linecap='round'/>`,
      );
    } else if (s.kind === "poly") {
      const d = `M ${s.pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(" L ")}${s.close === false ? "" : " Z"}`;
      parts.push(
        `<path d='${d}' fill='${s.fill ? "currentColor" : "none"}' fill-opacity='${s.fill ?? 0}' stroke='currentColor' stroke-width='${s.width ?? 1.8}' stroke-linejoin='round'${s.dashed ? " stroke-dasharray='6 4'" : ""}/>`,
      );
    } else if (s.kind === "arrow") {
      parts.push(`<path d='M ${r1(s.x1)} ${r1(s.y1)} L ${r1(s.x2)} ${r1(s.y2)}' stroke='currentColor' stroke-width='1.1' fill='none'/>`);
      const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
      const a1 = [s.x2 - 7 * Math.cos(ang - 0.4), s.y2 - 7 * Math.sin(ang - 0.4)];
      const a2 = [s.x2 - 7 * Math.cos(ang + 0.4), s.y2 - 7 * Math.sin(ang + 0.4)];
      parts.push(`<path d='M ${r1(s.x2)} ${r1(s.y2)} L ${r1(a1[0])} ${r1(a1[1])} L ${r1(a2[0])} ${r1(a2[1])} Z' fill='currentColor' stroke='none'/>`);
    }
  }
  for (const l of labels ?? []) {
    parts.push(
      `<text x='${r1(l.x)}' y='${r1(l.y)}' font-family='inherit' font-size='${l.size ?? 12.5}' fill='currentColor' text-anchor='${l.anchor ?? "middle"}'>${esc(l.text)}</text>`,
    );
  }
  if (footer) parts.push(`<text x='${width / 2}' y='${r1(height - 10)}' font-family='inherit' font-size='11.5' fill='currentColor' text-anchor='middle'>${esc(footer)}</text>`);
  const a = esc(aria ?? "diagram");
  return finish(`<svg viewBox='0 0 ${width} ${height}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${a}'><title>${a}</title>${parts.join("")}</svg>`);
}

function finish(svg) {
  if (/NaN|undefined|null/.test(svg)) throw new Error(`SVG carries a generator slip: ${svg.slice(0, 160)}`);
  if (/<style|<script|on[a-z]+\s*=|href=/i.test(svg)) throw new Error("SVG breaks the SVG rule (style/script/handler/href)");
  for (const tag of svg.match(/<path\b[^>]*>/g) ?? []) if (!/\sd\s*=\s*'/.test(tag)) throw new Error("a <path> has no d attribute");
  if (!/<(path|line|polyline|polygon|rect|circle|ellipse)\b/.test(svg)) throw new Error("SVG draws no shape");
  if (svg.length > 12000) throw new Error(`SVG is ${svg.length} bytes, over the 12 KB limit`);
  return svg;
}

export const dataUri = (svg) => `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`;
export const svgFigure = (svg, alt) => ({ kind: "svg", src: dataUri(svg), alt });

/* ---------------- lint gates ---------------- */

const PROSE_IN_MATHS = /\b(with|centre|center|and|the|then|onto|about|from|which|label|image|scale|factor|would|gives|when|because|answer|question)\b/i;
const TEX_TEXT = /\\(?:text|mathrm|textbf|mbox|operatorname)\{[^}]*\}/g;
const TEX_CMD = /\\[a-zA-Z]+/g;

/** Every learner-facing string must survive these. Throws with the offending text. */
export function lintString(s, where) {
  if (typeof s !== "string") return;
  if (s.includes("${")) throw new Error(`${where}: unexpanded placeholder in "${s.slice(0, 80)}"`);
  if (/\bNaN\b|\bnull\b|\[object Object\]|[{}=\\\d]\s*undefined\b|\bundefined\s*[{}=\\\d]/.test(s)) throw new Error(`${where}: leaked value in "${s.slice(0, 80)}"`);
  if (/!/.test(s) && !/\\!/.test(s)) throw new Error(`${where}: exclamation mark in "${s.slice(0, 80)}"`);
  if (/\bWrong\b/.test(s)) throw new Error(`${where}: the word "Wrong" in "${s.slice(0, 80)}"`);
  if (s.includes("$")) {
    const lines = s.split("\n");
    for (const line of lines) {
      const n = (line.match(/\$/g) ?? []).length;
      if (n % 2 !== 0) throw new Error(`${where}: unpaired "$" on the line "${line.slice(0, 90)}"`);
    }
    const parts = s.split("$");
    for (let i = 1; i < parts.length; i += 2) {
      const seg = parts[i].replace(TEX_TEXT, "").replace(TEX_CMD, " ");
      if (PROSE_IN_MATHS.test(seg)) throw new Error(`${where}: prose inside a maths segment "$${parts[i].slice(0, 60)}$"`);
    }
  }
}

const SKIP_KEYS = new Set(["svg", "src", "regex", "latex", "id", "url", "videoId", "misconception", "verification", "itemId", "source", "solutionProgram", "accepted", "any", "reject", "answer", "correctOrder", "attribution", "licence", "credit", "tool", "detail"]);

/** Walk a bundle-shaped object and lint every learner-facing string. */
export function lintTree(node, where = "root") {
  if (Array.isArray(node)) {
    node.forEach((v, i) => lintTree(v, `${where}[${i}]`));
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === "string") {
      if (!SKIP_KEYS.has(k)) lintString(v, `${where}.${k}`);
      if (k === "svg" || k === "src") {
        const t = k === "src" && v.startsWith("data:") ? decodeURIComponent(v.slice(v.indexOf(",") + 1)) : v;
        if (t.startsWith("<svg") && /NaN|undefined/.test(t)) throw new Error(`${where}.${k}: SVG carries NaN or undefined`);
      }
    } else lintTree(v, `${where}.${k}`);
  }
}

/* ---------------- verification-log helper ---------------- */

export const AT = "2026-09-19T12:00:00Z";
export const TOOL =
  "claude (FM1 batch-E generators in scratchpad/fm1-batch-e: lib.mjs does every polynomial, derivative, integral, stationary point and root in exact rational arithmetic; routes.mjs executes each error route in code; verify-published.mjs re-executes every route against the published JSON; check-marking.mts feeds the app's own marker every correct spelling and every commonError value)";

export function verLog(itemId, checks) {
  return {
    id: `ver.${itemId}`,
    itemId,
    version: 1,
    checks: checks.map(([type, result, detail]) => ({ type, tool: TOOL, result, detail, at: AT, by: "claude" })),
    status: "verified",
    reports: [],
  };
}

export const PAPER = {
  unit: "FM1",
  calculator: true,
  resources: ["Scientific calculator", "Formula sheet printed on page 2 of the question-and-answer booklet"],
};
