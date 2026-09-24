/**
 * FM3 batch C statistics library: Pascal's triangle, binomial expansions and probabilities as exact
 * rationals, the normal distribution from an error-function series, and the SVG builders the four
 * topics share. Every printed number in the bundles comes from here.
 *
 * Self-checks run at import:
 *   - every row of Pascal's triangle is built by addition, is symmetric and sums to 2^n
 *   - the binomial probabilities of 0 … n successes sum to exactly 1 as rationals
 *   - Phi(z) agrees to four decimal places with the four table entries the Summer 2023 and
 *     Summer 2025 Unit 3 mark schemes print (0.7881, 0.8849, 0.9192, 0.9452) and with 0.9938,
 *     the entry behind the wrong area the Summer 2024 report records
 */
import { big, bAdd, bSub, bMul, bPow, bDec, bFixed, px, svgGroup, svgTextIn, svgText, svgPath, svgRect, svgCircle, svgLine, svgWrap } from "./lib.mjs";

/* ---- Pascal's triangle ---------------------------------------------------------------------- */

/** Rows 0 … maxN, each built from the row above by addition. */
export function pascalRows(maxN) {
  const rows = [[1]];
  for (let n = 1; n <= maxN; n += 1) {
    const prev = rows[n - 1];
    const row = [1];
    for (let k = 1; k < n; k += 1) row.push(prev[k - 1] + prev[k]);
    row.push(1);
    rows.push(row);
  }
  for (const [n, row] of rows.entries()) {
    if (row.length !== n + 1) throw new Error(`row ${n} has ${row.length} entries`);
    for (let k = 0; k <= n; k += 1) if (row[k] !== row[n - k]) throw new Error(`row ${n} is not symmetric`);
    const total = row.reduce((a, b) => a + b, 0);
    if (total !== 2 ** n) throw new Error(`row ${n} sums to ${total}, not ${2 ** n}`);
  }
  return rows;
}

export const ROWS = pascalRows(8);
export const choose = (n, r) => {
  if (n > 8) throw new Error("this specification stops at n = 8");
  return ROWS[n][r];
};

/* ---- binomial expansions as LaTeX ------------------------------------------------------------ */

const powTex = (sym, k) => (k === 0 ? "" : k === 1 ? sym : `${sym}^{${k}}`);

/**
 * The expansion of (p + q)^n or (p - q)^n as LaTeX, terms in the order the row is written.
 * `coefFactor(r)` lets a wrong route drop or change a coefficient; `sign` is -1 for a minus inside.
 */
export function expandTex(n, { p = "p", q = "q", sign = 1, coefs = null } = {}) {
  const row = coefs ?? ROWS[n];
  const terms = [];
  for (let r = 0; r <= n; r += 1) {
    const c = row[r];
    const s = sign === -1 && r % 2 === 1 ? -1 : 1;
    const body = `${powTex(p, n - r)}${powTex(q, r)}`;
    const head = c === 1 ? "" : String(c);
    terms.push({ sign: s, text: `${head}${body}` });
  }
  return terms
    .map((t, i) => (i === 0 ? `${t.sign < 0 ? "-" : ""}${t.text}` : ` ${t.sign < 0 ? "-" : "+"} ${t.text}`))
    .join("");
}

/** The expansion of (a + bx)^n with every coefficient computed; `raiseNumbers: false` is the slip route. */
export function expandNumberTex(n, a, b, x = "x", { raiseNumbers = true, coefs = null } = {}) {
  const row = coefs ?? ROWS[n];
  const parts = [];
  for (let r = 0; r <= n; r += 1) {
    const c = row[r] * (raiseNumbers ? a ** (n - r) * b ** r : a ** (n - r));
    const body = powTex(x, r);
    const head = c === 1 && body !== "" ? "" : String(c);
    parts.push(`${head}${body}`);
  }
  return parts.map((t, i) => (i === 0 ? t : ` + ${t}`)).join("");
}

/** The single term in p^(n-r) q^r, as LaTeX. */
export function termTex(n, r, { p = "p", q = "q", coef = null } = {}) {
  const c = coef ?? choose(n, r);
  const head = c === 1 ? "" : String(c);
  return `${head}${powTex(p, n - r)}${powTex(q, r)}`;
}

/* ---- binomial probabilities as exact rationals ------------------------------------------------ */

/** P(X = r) for n trials with success probability p (a decimal string), exact. */
export function binomTerm(n, r, pStr) {
  const p = bDec(pStr);
  const q = bDec(String(1 - Number(pStr)));
  if (bFixed(bAdd(p, q), 10) !== (1).toFixed(10)) throw new Error(`p and q do not total 1 for ${pStr}`);
  return bMul(big(choose(n, r)), bMul(bPow(p, r), bPow(q, n - r)));
}

/** Every P(X = r), r = 0 … n, asserted to sum to exactly 1. */
export function binomAll(n, pStr) {
  const terms = [];
  for (let r = 0; r <= n; r += 1) terms.push(binomTerm(n, r, pStr));
  let total = big(0n);
  for (const t of terms) total = bAdd(total, t);
  if (total.n !== total.d) throw new Error(`the ${n + 1} probabilities sum to ${bFixed(total, 12)}, not 1`);
  return terms;
}

/** The sum of P(X = r) for r in [from, to], exact. */
export function binomRange(n, pStr, from, to) {
  let total = big(0n);
  for (let r = from; r <= to; r += 1) total = bAdd(total, binomTerm(n, r, pStr));
  return total;
}

/* ---- the normal distribution ------------------------------------------------------------------ */

/** erf by the positive-term series erf(x) = 2x e^(-x^2)/sqrt(pi) * sum (2x^2)^k / (1.3.5...(2k+1)). */
function erf(x) {
  const ax = Math.abs(x);
  let term = 1;
  let sum = 1;
  for (let k = 1; k < 200; k += 1) {
    term *= (2 * ax * ax) / (2 * k + 1);
    sum += term;
    if (term < 1e-18 * sum) break;
  }
  const v = ((2 * ax) / Math.sqrt(Math.PI)) * Math.exp(-ax * ax) * sum;
  return x < 0 ? -v : v;
}

/** Phi(z) = P(Z < z), the area to the left, as the printed table gives it. */
export const phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
/** The table's own four-decimal reading for a z-value. */
export const phiFixed = (z, places = 4) => phi(z).toFixed(places);
/** The standard normal density, for drawing. */
export const density = (t) => Math.exp((-t * t) / 2) / Math.sqrt(2 * Math.PI);

// The four entries the Summer 2023 and Summer 2025 schemes print, plus the one behind the wrong
// area the Summer 2024 report records: our series must reproduce all five.
for (const [z, want] of [[0.8, "0.7881"], [1.2, "0.8849"], [1.4, "0.9192"], [1.6, "0.9452"], [2.5, "0.9938"]]) {
  if (phiFixed(z) !== want) throw new Error(`Phi(${z}) computed as ${phiFixed(z)}, table says ${want}`);
}
// The 68-95 proportions of the band figure, to the nearest tenth of a per cent.
export const BAND = {
  one: (phi(1) - phi(-1)) * 100,
  two: (phi(2) - phi(-2)) * 100,
  three: (phi(3) - phi(-3)) * 100,
  inner: (phi(1) - phi(0)) * 100,
  second: (phi(2) - phi(1)) * 100,
  outer: (phi(3) - phi(2)) * 100,
  beyondThree: (1 - (phi(3) - phi(-3))) * 100,
};
if (BAND.one.toFixed(0) !== "68" || BAND.two.toFixed(0) !== "95") throw new Error("the 68-95 proportions did not come out");

/** z = (x - mean) / sd, asserted to terminate inside two decimal places (the table's precision). */
export function zScore(x, mean, sd) {
  const z = (x - mean) / sd;
  const r = Math.round(z * 100) / 100;
  if (Math.abs(z - r) > 1e-12) throw new Error(`z = ${z} is not exact to two decimal places`);
  return r;
}

/* ---- exact binomial and normal models (importable by FM3 batch D) ------------------------------ */

/** "0.15" or "1/6" as an exact BigInt rational. */
export const rat = (s) => {
  const t = String(s).trim();
  const f = /^(\d+)\/(\d+)$/.exec(t);
  return f ? big(BigInt(f[1]), BigInt(f[2])) : bDec(t);
};
export const ONE = big(1n);
export const ZERO = big(0n);
/** The exact rational rounded to four decimal places, as the paper's answer line carries it. */
export const d4 = (x) => bFixed(x, 4);
/** The rounded value as an exact rational (what a candidate who rounds early carries on with). */
export const roundTo = (x, places) => bDec(bFixed(x, places));
/**
 * A terminating decimal printed in full ("0.531441"), refusing anything that does not terminate
 * inside `maxPlaces` places — so printed working is always the exact value the generator holds.
 */
export function exactDec(x, maxPlaces = 12) {
  for (let places = 0; places <= maxPlaces; places += 1) {
    const s = bFixed(x, places);
    const back = bDec(s);
    if (back.n === x.n && back.d === x.d) return s;
  }
  throw new Error(`exactDec: ${bFixed(x, 14)} does not terminate within ${maxPlaces} places`);
}
/** True when the rational terminates within `maxPlaces` decimal places. */
export function terminatesWithin(x, maxPlaces) {
  const s = bFixed(x, maxPlaces);
  const back = bDec(s);
  return back.n === x.n && back.d === x.d;
}

/**
 * A binomial model B(n, p) held exactly. Success is "the thing the question counts"; `p` is its
 * probability as the question states it (decimal or fraction string), `q = 1 - p`.
 * Coefficients come from ROWS (Pascal's triangle built by addition), never from a factorial.
 */
export class Binom {
  constructor(n, pStr) {
    if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error(`Binom: n = ${n} is outside 1..8`);
    this.n = n;
    this.pStr = String(pStr);
    this.p = rat(pStr);
    this.q = bSub(ONE, this.p);
    if (this.p.n <= 0n || this.q.n <= 0n) throw new Error(`Binom: p = ${pStr} is not strictly between 0 and 1`);
    this.qStr = /\//.test(this.pStr) ? `${this.q.n}/${this.q.d}` : exactDec(this.q);
    let total = ZERO;
    for (let r = 0; r <= n; r += 1) total = bAdd(total, this.term(r));
    if (total.n !== total.d) throw new Error(`Binom(${n}, ${pStr}): the terms sum to ${bFixed(total, 12)}, not 1`);
  }
  coef(r) {
    return ROWS[this.n][r];
  }
  /** P(X = r) = C(n, r) p^r q^(n - r). */
  term(r, { p = this.p, q = this.q, coef = this.coef(r) } = {}) {
    if (r < 0 || r > this.n) return ZERO;
    return bMul(big(BigInt(coef)), bMul(bPow(p, r), bPow(q, this.n - r)));
  }
  /** The sum of P(X = k) for k = from … to (inclusive, clipped to 0 … n). */
  sum(from, to, opts) {
    let total = ZERO;
    for (let k = Math.max(0, from); k <= Math.min(this.n, to); k += 1) total = bAdd(total, this.term(k, opts));
    return total;
  }
  atLeast(r, opts) {
    return bSub(ONE, this.sum(0, r - 1, opts));
  }
  atMost(r, opts) {
    return this.sum(0, r, opts);
  }
  moreThan(r, opts) {
    return this.sum(r + 1, this.n, opts);
  }
  fewerThan(r, opts) {
    return this.sum(0, r - 1, opts);
  }
}

/**
 * A normal model N(mean, sd^2) read the way the Unit 3 paper reads it: z = (x - mean)/sd exact to
 * two decimal places, then the four-figure table value Phi(|z|), then the tail.
 * Every probability is the table arithmetic (1 - 0.7881 = 0.2119), held as an exact rational.
 */
export class Normal {
  constructor(mean, sd) {
    this.mean = mean;
    this.sd = sd;
  }
  z(x) {
    return zScore(x, this.mean, this.sd);
  }
  /** The table entry for |z| as a four-decimal string and as an exact rational. */
  table(z) {
    const s = phiFixed(Math.abs(z));
    return { s, r: bDec(s) };
  }
  /** P(X < x): the area to the left. */
  below(x) {
    const z = this.z(x);
    const t = this.table(z).r;
    return z >= 0 ? t : bSub(ONE, t);
  }
  /** P(X > x): the area to the right. */
  above(x) {
    const z = this.z(x);
    const t = this.table(z).r;
    return z >= 0 ? bSub(ONE, t) : t;
  }
}

/* ---- shared SVG builders ---------------------------------------------------------------------- */

/** A stack of framed working lines, each with a short note to its right. */
export function linesSvg(lines, { title, note, width = 580, lineH = 34, size = 15, highlight = -1, noteX = 330 } = {}) {
  const out = [];
  out.push(svgPath(`M 14 16 L 14 ${16 + lines.length * lineH}`, { width: 1.6 }));
  out.push(svgPath(`M 14 16 L 24 16 M 14 ${16 + lines.length * lineH} L 24 ${16 + lines.length * lineH}`, { width: 1.2 }));
  lines.forEach((l, i) => {
    const y = 34 + i * lineH;
    if (i === highlight) out.push(svgRect(18, y - 21, noteX - 40, 26, { width: 1.2, fill: "currentColor", opacity: 0.09 }));
    out.push(svgText(28, y, l.text, { size, anchor: "start" }));
    if (l.note) out.push(svgText(noteX, y, l.note, { size: 10.5, anchor: "start" }));
  });
  const H = 34 + lines.length * lineH + (note ? 22 : 0);
  if (note) out.push(svgText(width / 2, H - 8, note, { size: 11.5 }));
  return svgWrap(`0 0 ${width} ${Math.round(H)}`, title, out.join(""));
}

/**
 * Pascal's triangle to `maxRow`, rows numbered down the left, entries in circles.
 * `highlight` tints one row; `showAdditions` draws that many worked additions; `blankFrom` leaves
 * the entries of later rows empty so a gate can ask for them.
 */
export function triangleSvg({ maxRow = 8, highlight = null, showAdditions = 0, blankFrom = null, title, caption }) {
  const W = 760;
  const stepX = 42;
  const stepY = 42;
  const top = 34;
  const left = 74;
  const cx = (n, k) => left + (W - left - 24) / 2 - 24 - (n * stepX) / 2 + k * stepX;
  const cy = (n) => top + n * stepY;
  const body = [];
  const texts = [];
  if (highlight !== null) {
    body.push(svgRect(left - 44, cy(highlight) - 17, W - left - 6, 34, { width: 1, fill: "currentColor", opacity: 0.1 }));
  }
  for (let n = 0; n <= maxRow; n += 1) {
    texts.push(svgTextIn(22, cy(n) + 4, `row ${n}`));
    for (let k = 0; k <= n; k += 1) {
      const x = cx(n, k);
      const y = cy(n);
      body.push(svgCircle(x, y, 15, { fill: "none", width: 1.1 }));
      if (blankFrom === null || n < blankFrom) texts.push(svgTextIn(x, y + 5, String(ROWS[n][k])));
    }
  }
  for (let i = 0; i < showAdditions; i += 1) {
    const n = 4 + i;
    const k = 2 + i;
    const x = cx(n, k);
    const y = cy(n);
    body.push(svgPath(`M ${px(cx(n - 1, k - 1))} ${px(cy(n - 1) + 16)} L ${px(x - 6)} ${px(y - 17)}`, { width: 1.1, dash: "3 3" }));
    body.push(svgPath(`M ${px(cx(n - 1, k))} ${px(cy(n - 1) + 16)} L ${px(x + 6)} ${px(y - 17)}`, { width: 1.1, dash: "3 3" }));
    texts.push(svgTextIn(x, y - 20, "+"));
  }
  const H = cy(maxRow) + (caption ? 54 : 30);
  if (caption) texts.push(svgTextIn(W / 2, H - 12, caption));
  return svgWrap(
    `0 0 ${W} ${Math.round(H)}`,
    title,
    body.join("") + svgGroup(texts.join(""), { size: 12.5, anchor: "middle" }),
  );
}

/**
 * The term strip: one row per term of (p + q)^n with the coefficient, the two powers and the
 * running total of the powers. `blankColumn` empties one column for a gated version.
 */
export function termStripSvg({ n, p = "p", q = "q", blankColumn = null, title, caption, values = null }) {
  const W = 700;
  const rowH = 30;
  const top = 58;
  const colX = values ? [70, 190, 330, 470, 600] : [90, 240, 400, 560];
  const heads = values ? ["successes r", "coefficient", `${p} power`, `${q} power`, "value"] : ["term", "coefficient", `${p} power`, `${q} power`];
  const body = [];
  const texts = [];
  body.push(svgLine(30, top - 22, W - 24, top - 22, { width: 1.4 }));
  heads.forEach((h, i) => texts.push(svgTextIn(colX[i], top - 30, h)));
  for (let r = 0; r <= n; r += 1) {
    const y = top + r * rowH;
    texts.push(svgTextIn(colX[0], y, values ? String(r) : `term ${r + 1}`));
    texts.push(svgTextIn(colX[1], y, blankColumn === "coefficient" ? "" : String(ROWS[n][r])));
    texts.push(svgTextIn(colX[2], y, blankColumn === "p" ? "" : `${p} to the ${n - r}`));
    texts.push(svgTextIn(colX[3], y, blankColumn === "q" ? "" : `${q} to the ${r}`));
    if (values) texts.push(svgTextIn(colX[4], y, values[r]));
    else texts.push(svgTextIn(colX[3] + 110, y, `${n - r} + ${r} = ${n}`));
    body.push(svgLine(30, y + 9, W - 24, y + 9, { width: 0.6 }));
  }
  const H = top + (n + 1) * rowH + (caption ? 34 : 14);
  if (caption) texts.push(svgTextIn(W / 2, H - 12, caption));
  if (!values) texts.push(svgTextIn(colX[3] + 110, top - 30, "powers add to n"));
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12 }));
}

/* ---- the bell curve --------------------------------------------------------------------------- */

const PLOT = { x0: 70, y0: 40, w: 760, h: 200 };
const Z_MIN = -3.6;
const Z_MAX = 3.6;
const X = (z) => PLOT.x0 + ((z - Z_MIN) / (Z_MAX - Z_MIN)) * PLOT.w;
const Y = (d) => PLOT.y0 + PLOT.h - (d / density(0)) * PLOT.h;
const BASE = PLOT.y0 + PLOT.h;

function curveD(from = Z_MIN, to = Z_MAX, steps = 100) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const z = from + ((to - from) * i) / steps;
    pts.push(`${i === 0 ? "M" : "L"} ${px(Math.round(X(z) * 100) / 100)} ${px(Math.round(Y(density(z)) * 100) / 100)}`);
  }
  return pts.join(" ");
}

function shadeD(from, to) {
  const inner = curveD(from, to, 34).replace(/^M/, "L");
  return `M ${px(Math.round(X(from) * 100) / 100)} ${px(BASE)} ${inner} L ${px(Math.round(X(to) * 100) / 100)} ${px(BASE)} Z`;
}

/**
 * The banded curve: the standard normal shape with the sigma lines, the percentages inside the
 * bands and the 68 / 95 brackets. `labels: false` leaves every percentage off, which is the copy a
 * question carries; `real` prints the actual quantities under the sigma marks.
 */
export function bellSvg({ labels = true, real = null, brackets = true, title, caption, meanLine = true }) {
  const body = [];
  const texts = [];
  const pc = (v) => `${v.toFixed(1)}%`;
  if (labels) {
    const bands = [
      [-1, 0, pc(BAND.inner)],
      [0, 1, pc(BAND.inner)],
      [1, 2, pc(BAND.second)],
      [-2, -1, pc(BAND.second)],
      [2, 3, pc(BAND.outer)],
      [-3, -2, pc(BAND.outer)],
    ];
    for (const [a, b] of bands) body.push(svgPath(shadeD(a, b), { width: 0.6, fill: "currentColor", opacity: Math.abs(a + b) >= 4 ? 0.06 : Math.abs(a + b) >= 2 ? 0.12 : 0.18 }));
    for (const [a, b, label] of bands) {
      const mid = (a + b) / 2;
      texts.push(svgTextIn(X(mid), Math.min(BASE - 8, Y(density(mid)) + 26), label));
    }
  }
  body.push(svgPath(curveD(), { width: 1.8 }));
  body.push(svgLine(PLOT.x0 - 10, BASE, PLOT.x0 + PLOT.w + 10, BASE, { width: 1.4 }));
  for (let z = -3; z <= 3; z += 1) {
    if (z === 0 && !meanLine) continue;
    body.push(svgPath(`M ${px(X(z))} ${px(BASE)} L ${px(X(z))} ${px(Y(density(z)))}`, { width: z === 0 ? 1.4 : 1, dash: z === 0 ? "5 4" : "3 3" }));
    const sigma = z === 0 ? "mean" : `mean ${z < 0 ? "-" : "+"} ${Math.abs(z) === 1 ? "" : Math.abs(z)}sd`.replace("  ", " ");
    texts.push(svgTextIn(X(z), BASE + 18, sigma));
    if (real) texts.push(svgTextIn(X(z), BASE + 34, `${real.value(z)}${real.unit ? ` ${real.unit}` : ""}`));
  }
  if (brackets) {
    const yTop = PLOT.y0 - 6;
    body.push(svgPath(`M ${px(X(-1))} ${px(yTop + 14)} L ${px(X(-1))} ${px(yTop)} L ${px(X(1))} ${px(yTop)} L ${px(X(1))} ${px(yTop + 14)}`, { width: 1.2 }));
    body.push(svgPath(`M ${px(X(-2))} ${px(yTop - 6)} L ${px(X(-2))} ${px(yTop - 20)} L ${px(X(2))} ${px(yTop - 20)} L ${px(X(2))} ${px(yTop - 6)}`, { width: 1.2 }));
    if (labels) {
      texts.push(svgTextIn(X(0), yTop + 11, `about ${BAND.one.toFixed(0)}%`));
      texts.push(svgTextIn(X(0), yTop - 9, `about ${BAND.two.toFixed(0)}%`));
    }
  }
  if (meanLine) texts.push(svgTextIn(X(0), PLOT.y0 - 28, "mean = median = mode"));
  const H = BASE + (real ? 52 : 36) + (caption ? 22 : 0);
  if (caption) texts.push(svgTextIn(PLOT.x0 + PLOT.w / 2, H - 8, caption));
  return svgWrap(`0 0 900 ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12 }));
}

/**
 * The shaded-tail decision card: the curve with x marked on the axis, its z underneath, the
 * required region shaded and (optionally) the two-cell decision strip along the bottom.
 * No probability is ever printed on it, so a question may carry it.
 */
export function tailSvg({ mean, sd, x, z, tail, unit = "", showDecision = true, title, caption, quantity = "x" }) {
  const body = [];
  const texts = [];
  const zc = Math.max(Z_MIN + 0.05, Math.min(Z_MAX - 0.05, z));
  body.push(svgPath(tail === "right" ? shadeD(zc, Z_MAX) : shadeD(Z_MIN, zc), { width: 0.6, fill: "currentColor", opacity: 0.18 }));
  body.push(svgPath(curveD(), { width: 1.8 }));
  body.push(svgLine(PLOT.x0 - 10, BASE, PLOT.x0 + PLOT.w + 10, BASE, { width: 1.4 }));
  body.push(svgPath(`M ${px(X(0))} ${px(BASE)} L ${px(X(0))} ${px(Y(density(0)))}`, { width: 1.3, dash: "5 4" }));
  body.push(svgPath(`M ${px(X(zc))} ${px(BASE)} L ${px(X(zc))} ${px(Y(density(zc)))}`, { width: 1.3 }));
  texts.push(svgTextIn(X(0), BASE + 18, `mean = ${mean}${unit ? ` ${unit}` : ""}`));
  texts.push(svgTextIn(X(zc), BASE + 18, `${quantity} = ${x}${unit ? ` ${unit}` : ""}`));
  texts.push(svgTextIn(X(zc), BASE + 34, `z = ${z.toFixed(2)}`));
  texts.push(svgTextIn(X(0), BASE + 34, "z = 0"));
  const arrowY = Y(density(zc)) - 26;
  const tipX = tail === "right" ? X(zc) + 90 : X(zc) - 90;
  body.push(svgPath(`M ${px(X(zc))} ${px(arrowY)} L ${px(tipX)} ${px(arrowY)}`, { width: 1.2 }));
  body.push(svgPath(`M ${px(tipX)} ${px(arrowY)} L ${px(tipX + (tail === "right" ? -9 : 9))} ${px(arrowY - 5)} M ${px(tipX)} ${px(arrowY)} L ${px(tipX + (tail === "right" ? -9 : 9))} ${px(arrowY + 5)}`, { width: 1.2 }));
  texts.push(svgTextIn((X(zc) + tipX) / 2, arrowY - 12, "the shaded region"));
  let H = BASE + 56;
  if (showDecision) {
    const boxY = H;
    const boxes = [
      ["shaded to the LEFT", "read the table value", tail === "left"],
      ["shaded to the RIGHT", "take it from 1", tail === "right"],
    ];
    boxes.forEach(([a, b, active], i) => {
      const bx = PLOT.x0 + i * 390;
      body.push(svgRect(bx, boxY, 360, 44, { width: active ? 2 : 1, fill: "currentColor", opacity: active ? 0.12 : 0 }));
      texts.push(svgTextIn(bx + 180, boxY + 18, a));
      texts.push(svgTextIn(bx + 180, boxY + 34, b));
    });
    H = boxY + 62;
  }
  if (caption) {
    texts.push(svgTextIn(450, H + 4, caption));
    H += 20;
  }
  return svgWrap(`0 0 900 ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12 }));
}

/** Two stacked curves showing that the left tail below -z has the same area as the right tail above z. */
export function foldSvg({ z, title, caption }) {
  const W = 880;
  const panelH = 150;
  const body = [];
  const texts = [];
  const px0 = 60;
  const pw = W - 120;
  const zx = (t) => px0 + ((t - Z_MIN) / (Z_MAX - Z_MIN)) * pw;
  const drawPanel = (top, from, to, label) => {
    const base = top + panelH - 26;
    const yy = (d) => top + (panelH - 26) - (d / density(0)) * (panelH - 52);
    const pts = [];
    for (let i = 0; i <= 120; i += 1) {
      const t = Z_MIN + ((Z_MAX - Z_MIN) * i) / 120;
      pts.push(`${i === 0 ? "M" : "L"} ${px(Math.round(zx(t) * 100) / 100)} ${px(Math.round(yy(density(t)) * 100) / 100)}`);
    }
    const shade = [];
    for (let i = 0; i <= 60; i += 1) {
      const t = from + ((to - from) * i) / 60;
      shade.push(`L ${px(Math.round(zx(t) * 100) / 100)} ${px(Math.round(yy(density(t)) * 100) / 100)}`);
    }
    body.push(svgPath(`M ${px(zx(from))} ${px(base)} ${shade.join(" ")} L ${px(zx(to))} ${px(base)} Z`, { width: 0.6, fill: "currentColor", opacity: 0.2 }));
    body.push(svgPath(pts.join(" "), { width: 1.7 }));
    body.push(svgLine(px0 - 8, base, px0 + pw + 8, base, { width: 1.3 }));
    const peak = Math.round(yy(density(0)) * 100) / 100;
    body.push(svgPath(`M ${px(zx(0))} ${px(base)} L ${px(zx(0))} ${px(peak)}`, { width: 1.2, dash: "5 4" }));
    texts.push(svgTextIn(zx(0), base + 16, "z = 0"));
    texts.push(svgTextIn(zx(from === Z_MIN ? to : from), base + 16, label));
    return base;
  };
  const baseTop = drawPanel(20, Z_MIN, -z, `z = -${z.toFixed(2)}`);
  const baseBottom = drawPanel(20 + panelH + 20, z, Z_MAX, `z = ${z.toFixed(2)}`);
  body.push(svgPath(`M ${px(zx(-z) - 40)} ${px(baseTop + 30)} L ${px(zx(z) + 40)} ${px(baseBottom - 60)}`, { width: 1, dash: "4 4" }));
  texts.push(svgTextIn(W / 2, baseTop + 48, "same area, by symmetry"));
  const H = baseBottom + (caption ? 46 : 26);
  if (caption) texts.push(svgTextIn(W / 2, H - 10, caption));
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12 }));
}

/**
 * An extract with the shape of the Normal Probability Table on page 3 of the Unit 3 booklet:
 * z to one decimal place down the side, the second decimal across the top. Every value here is
 * computed by our own series, not copied.
 */
export function tableExtractSvg({ zRows, title, caption }) {
  const W = 760;
  const rowH = 26;
  const left = 56;
  const colW = (W - left - 20) / 11;
  const top = 44;
  const body = [];
  const texts = [];
  texts.push(svgTextIn(left + colW / 2, top - 10, "z"));
  for (let c = 0; c < 10; c += 1) texts.push(svgTextIn(left + colW * (c + 1.5), top - 10, `.0${c}`));
  body.push(svgLine(left, top - 4, W - 20, top - 4, { width: 1.3 }));
  body.push(svgLine(left + colW, top - 22, left + colW, top + zRows.length * rowH, { width: 1.1 }));
  zRows.forEach((zr, i) => {
    const y = top + i * rowH + 17;
    texts.push(svgTextIn(left + colW / 2, y, zr.toFixed(1)));
    for (let c = 0; c < 10; c += 1) texts.push(svgTextIn(left + colW * (c + 1.5), y, phiFixed(zr + c / 100).slice(1)));
    body.push(svgLine(left, y + 9, W - 20, y + 9, { width: 0.5 }));
  });
  const H = top + zRows.length * rowH + (caption ? 40 : 18);
  if (caption) texts.push(svgTextIn(W / 2, H - 12, caption));
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 11.5 }));
}

/** Three panels: wide classes, narrow classes, then the smooth curve behind the outline. */
export function histToCurveSvg({ title, caption }) {
  const W = 880;
  const panelW = 270;
  const panelH = 150;
  const body = [];
  const texts = [];
  const panel = (index, widths, label, withCurve) => {
    const x0 = 20 + index * (panelW + 20);
    const base = panelH + 30;
    const zw = 7.2;
    const sx = (z) => x0 + ((z + 3.6) / zw) * panelW;
    const tallest = phi(widths / 2) - phi(-widths / 2);
    const barH = (pArea) => (pArea / tallest) * (panelH - 24);
    for (let z = -3.6; z < 3.59; z += widths) {
      const a = phi(z + widths) - phi(z);
      const h = barH(a);
      if (h < 0.4) continue;
      body.push(svgRect(sx(z), base - h, ((widths / zw) * panelW), h, { width: 1, fill: "currentColor", opacity: 0.14 }));
    }
    if (withCurve) {
      const pts = [];
      for (let i = 0; i <= 90; i += 1) {
        const z = -3.6 + (7.2 * i) / 90;
        const h = barH(phi(z + widths / 2) - phi(z - widths / 2));
        pts.push(`${i === 0 ? "M" : "L"} ${px(Math.round(sx(z) * 100) / 100)} ${px(Math.round((base - h) * 100) / 100)}`);
      }
      body.push(svgPath(pts.join(" "), { width: 1.8 }));
    }
    body.push(svgLine(x0, base, x0 + panelW, base, { width: 1.2 }));
    texts.push(svgTextIn(x0 + panelW / 2, base + 18, label));
  };
  panel(0, 1.2, "wide classes", false);
  panel(1, 0.45, "narrower classes", false);
  panel(2, 0.18, "narrower still, and the outline", true);
  const H = panelH + 66 + (caption ? 20 : 0);
  if (caption) texts.push(svgTextIn(W / 2, H - 8, caption));
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12 }));
}

/** Two small outlines side by side: a symmetric bell and a right-skewed shape. */
export function shapeCardSvg({ title, caption, leftLabel, rightLabel }) {
  const W = 760;
  const H = 210;
  const body = [];
  const texts = [];
  const panel = (x0, skew, label) => {
    const base = 150;
    const w = 300;
    const pts = [];
    for (let i = 0; i <= 90; i += 1) {
      const t = -3.4 + (6.8 * i) / 90;
      const d = skew ? Math.exp(-((Math.log(Math.max(0.08, (t + 3.6) / 2.2)) + 0.1) ** 2) / 0.5) * 0.42 : density(t);
      pts.push(`${i === 0 ? "M" : "L"} ${px(Math.round((x0 + ((t + 3.4) / 6.8) * w) * 100) / 100)} ${px(Math.round((base - (d / (skew ? 0.42 : density(0))) * 100) * 100) / 100)}`);
    }
    body.push(svgPath(pts.join(" "), { width: 1.8 }));
    body.push(svgLine(x0, base, x0 + w, base, { width: 1.2 }));
    texts.push(svgTextIn(x0 + w / 2, base + 22, label));
  };
  panel(40, false, leftLabel);
  panel(410, true, rightLabel);
  texts.push(svgTextIn(W / 2, H - 10, caption));
  return svgWrap(`0 0 ${W} ${H}`, title, body.join("") + svgGroup(texts.join(""), { size: 12 }));
}

/** Four small curves, lettered, for a "which one is the normal distribution" item. */
export function fourShapesSvg({ title, caption, letters = ["A", "B", "C", "D"], normalAt = 1 }) {
  const W = 880;
  const H = 210;
  const body = [];
  const texts = [];
  const shapes = ["skew", "normal", "flat", "twin"];
  const order = [];
  let s = 0;
  for (let i = 0; i < 4; i += 1) {
    if (i === normalAt) order.push("normal");
    else {
      while (shapes[s] === "normal") s += 1;
      order.push(shapes[s]);
      s += 1;
    }
  }
  const value = (kind, t) => {
    if (kind === "normal") return density(t) / density(0);
    if (kind === "skew") return Math.exp(-((Math.log(Math.max(0.08, (t + 3.6) / 2.2)) + 0.1) ** 2) / 0.5);
    if (kind === "flat") return Math.abs(t) <= 2.2 ? 0.62 : 0.02;
    return (density(t - 1.5) + density(t + 1.5)) / (2 * density(0)) / 0.62;
  };
  order.forEach((kind, i) => {
    const x0 = 20 + i * 215;
    const w = 190;
    const base = 150;
    const pts = [];
    for (let k = 0; k <= 80; k += 1) {
      const t = -3.4 + (6.8 * k) / 80;
      const v = Math.max(0, Math.min(1.05, value(kind, t)));
      pts.push(`${k === 0 ? "M" : "L"} ${px(Math.round((x0 + ((t + 3.4) / 6.8) * w) * 100) / 100)} ${px(Math.round((base - v * 100) * 100) / 100)}`);
    }
    body.push(svgPath(pts.join(" "), { width: 1.7 }));
    body.push(svgLine(x0, base, x0 + w, base, { width: 1.2 }));
    texts.push(svgTextIn(x0 + w / 2, base + 22, letters[i]));
  });
  texts.push(svgTextIn(W / 2, H - 10, caption));
  return svgWrap(`0 0 ${W} ${H}`, title, body.join("") + svgGroup(texts.join(""), { size: 12.5 }));
}

/** The p / q label card: the four lines to fill in before any arithmetic. */
export function labelCardSvg({ lines, title, caption }) {
  const W = 620;
  const rowH = 34;
  const body = [];
  const texts = [];
  body.push(svgRect(20, 20, W - 40, lines.length * rowH + 20, { width: 1.3 }));
  lines.forEach((l, i) => {
    const y = 48 + i * rowH;
    texts.push(svgTextIn(46, y, l.label));
    body.push(svgLine(250, y + 4, 560, y + 4, { width: 1 }));
    if (l.value) texts.push(svgTextIn(300, y, l.value));
  });
  const H = lines.length * rowH + 40 + (caption ? 28 : 8);
  if (caption) texts.push(svgTextIn(W / 2, H - 10, caption));
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 13, anchor: "start" }));
}
