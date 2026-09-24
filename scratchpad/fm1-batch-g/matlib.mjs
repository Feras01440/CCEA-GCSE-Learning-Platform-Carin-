/**
 * Exact 2-D matrix arithmetic and matrix figures for FM1 batch G.
 * Entries are the rationals from lib.mjs, so determinants and inverses are exact and every
 * printed matrix is the one the generator computed. Nothing is rounded until it is printed.
 */
import { frac, fAdd, fSub, fMul, fDiv, fNeg, fVal, fTex, fPlain, num, svgWrap, svgText, svgPath, svgRect } from "./lib.mjs";

/** A matrix from a nested array of integers (or of {n,d} rationals). */
export const mat = (rows) => rows.map((r) => r.map((v) => (typeof v === "number" ? frac(v) : v)));
export const dims = (M) => [M.length, M[0].length];
export const sameSize = (A, B) => dims(A)[0] === dims(B)[0] && dims(A)[1] === dims(B)[1];
export const conformable = (A, B) => dims(A)[1] === dims(B)[0];

export const mMap = (A, f) => A.map((r, i) => r.map((v, j) => f(v, i, j)));
export function mAdd(A, B) {
  if (!sameSize(A, B)) throw new Error("mAdd: different sizes");
  return mMap(A, (v, i, j) => fAdd(v, B[i][j]));
}
export function mSub(A, B) {
  if (!sameSize(A, B)) throw new Error("mSub: different sizes");
  return mMap(A, (v, i, j) => fSub(v, B[i][j]));
}
export const mScale = (k, A) => mMap(A, (v) => fMul(frac(k), v));
export function mMul(A, B) {
  if (!conformable(A, B)) throw new Error(`mMul: ${dims(A).join("x")} by ${dims(B).join("x")} is not conformable`);
  const [m, n] = dims(A);
  const p = dims(B)[1];
  const out = [];
  for (let i = 0; i < m; i++) {
    const row = [];
    for (let j = 0; j < p; j++) {
      let s = frac(0);
      for (let k = 0; k < n; k++) s = fAdd(s, fMul(A[i][k], B[k][j]));
      row.push(s);
    }
    out.push(row);
  }
  return out;
}
export const mEq = (A, B) => sameSize(A, B) && A.every((r, i) => r.every((v, j) => v.n === B[i][j].n && v.d === B[i][j].d));
export const identity = (n) => mat(Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))));

/** det of a 2 x 2, as ad - bc. */
export function det2(A) {
  if (dims(A)[0] !== 2 || dims(A)[1] !== 2) throw new Error("det2 needs a 2 by 2");
  return fSub(fMul(A[0][0], A[1][1]), fMul(A[0][1], A[1][0]));
}
/** The swapped-and-negated matrix: a and d exchanged, b and c negated. */
export const adj2 = (A) => [
  [A[1][1], fNeg(A[0][1])],
  [fNeg(A[1][0]), A[0][0]],
];
export function inv2(A) {
  const d = det2(A);
  if (d.n === 0) throw new Error("inv2: the matrix is singular");
  return mMap(adj2(A), (v) => fDiv(v, d));
}
/** Back-multiplication check: A A^-1 = I and A^-1 A = I. */
export function checkInverse(A) {
  const Ai = inv2(A);
  const I = identity(2);
  if (!mEq(mMul(A, Ai), I) || !mEq(mMul(Ai, A), I)) throw new Error("inverse failed its back-multiplication check");
  return Ai;
}

/* ---- printing -------------------------------------------------------------------------------- */

/** A matrix as KaTeX; entries are exact, fractions printed as fractions. */
export const mTex = (A, { env = "pmatrix" } = {}) =>
  `\\begin{${env}}${A.map((r) => r.map((v) => fTex(v)).join(" & ")).join(" \\\\ ")}\\end{${env}}`;
/** A matrix as one line of plain text, for studentWorking lines and figure text. */
export const mPlain = (A) => `(${A.map((r) => r.map((v) => fPlain(v)).join(" ")).join(" ; ")})`;
/** The 1/det factor in front of the adjugate, or nothing when the determinant is 1. */
export const invTex = (A) => {
  const d = det2(A);
  const body = mTex(adj2(A));
  return d.n === 1 && d.d === 1 ? body : `\\frac{1}{${fTex(d)}}${body}`;
};

/* ---- answer specs -------------------------------------------------------------------------------- */

/**
 * A whole matrix as the engine's `matrix` answer kind (suite 1064).
 * A scalar in front of the brackets is multiplied into every entry — a fraction, a decimal or a
 * negative, with or without a times sign, and fractions stay exact — so an inverse may be written
 * either way round and no stem has to ask for the entries to be worked out (probe-matrix-kind.mts).
 */
export const matrixAnswer = (M) => ({
  kind: "matrix",
  rows: dims(M)[0],
  cols: dims(M)[1],
  entries: M.map((r) => r.map((v) => fPlain(v))),
  tolerance: { type: "absolute", value: 0.0005 },
});

/** A whole wrong matrix as a commonError, so the route is diagnosed on the answer line. */
export const matrixError = (misconception, M, feedback, marksTypicallyEarned, source) => ({
  misconception,
  pattern: { kind: "matrix", entries: M.map((r) => r.map((v) => fPlain(v))) },
  feedback,
  marksTypicallyEarned,
  ...(source ? { source } : {}),
});

/**
 * The answer-line sentence for a whole-matrix part. It no longer has to warn about a leading scalar:
 * the engine multiplies one through, so `1/5 (2 -1; -3 4)` and the worked-out entries both mark right.
 */
export const MATRIX_NOTE = "Write the answer as a matrix.";

/**
 * 22 Sep (fm1-g-matrices-1.md MI-5): the negations that cancel a "the determinant is zero" key word, so that
 * "the determinant is not zero" can never collect the marks its opposite earns. Written in normaliseText's
 * own spelling (apostrophes dropped, relation signs spaced), which is what the marker compares against.
 */
export const DET_NEGATIONS = ["not zero", "not 0", "non zero", "nonzero", "isnt zero", "isnt 0", "not equal", "doesnt equal", "does not equal", "≠ 0", "≠ zero"];

/**
 * The three key-word groups of an "explain why <name> has no inverse / cannot be solved" part: the determinant,
 * its value zero (or the word singular), and the matrix named. On a 2-mark part the marks are shared out by the
 * fraction of groups earned, rounding down: all three give 2, any two give 1 (the determinant idea without the
 * name, or "H is singular"), one alone gives 0. A negation cancels the first two groups.
 */
export const singularKeyWords = (name) => [
  { any: ["determinant", "det"], marks: 1, reject: DET_NEGATIONS },
  { any: ["0", "zero", "singular"], marks: 1, reject: [...DET_NEGATIONS, "not singular"] },
  // "matrix H" comes first only so that a 1-mark answer is told "still missing matrix H" rather than a bare letter;
  // the marker lower-cases key words and answers alike before comparing them.
  { any: [`matrix ${name}`, name], marks: 1 },
];

/* ---- error routes, each one executed ------------------------------------------------------------ */

export const routes = {
  /** Entry by entry in matching positions, instead of row by column. */
  elementwise: (A, B) => {
    if (!sameSize(A, B)) return null;
    return mMap(A, (v, i, j) => fMul(v, B[i][j]));
  },
  /** Row of the first taken with the row of the second: B transposed into the product. */
  rowsAndColumnsSwapped: (A, B) => {
    const Bt = B[0].map((_, j) => B.map((r) => r[j]));
    if (!conformable(A, Bt)) return null;
    return mMul(A, Bt);
  },
  /** bc - ad instead of ad - bc. */
  detSignReversed: (A) => fSub(fMul(A[0][1], A[1][0]), fMul(A[0][0], A[1][1])),
  /** b and c negated, a and d left where they are. */
  adjNotSwapped: (A) => [
    [A[0][0], fNeg(A[0][1])],
    [fNeg(A[1][0]), A[1][1]],
  ],
  /** a and d exchanged, b and c left with their signs. */
  adjNotNegated: (A) => [
    [A[1][1], A[0][1]],
    [A[1][0], A[0][0]],
  ],
  /** The adjugate handed in as the inverse. */
  notDividedByDet: (A) => adj2(A),
  /** 1/det applied to the first entry only. */
  factorOnOneEntry: (A) => {
    const d = det2(A);
    const adj = adj2(A);
    return mMap(adj, (v, i, j) => (i === 0 && j === 0 ? fDiv(v, d) : v));
  },
  /** X A instead of A^-1 B: the inverse multiplied on the wrong side. */
  orderReversed: (A, B) => {
    const Ai = inv2(A);
    if (!conformable(B, Ai)) return null;
    return mMul(B, Ai);
  },
  /** A - B where B - A was wanted. */
  subtractWrongWay: (A, B) => mSub(A, B),
};

/* ---- figures ------------------------------------------------------------------------------------- */

const rr = (v) => Math.round(v * 10) / 10;

/**
 * One matrix drawn with square brackets, entries laid out on a grid. `blanks` is a list of
 * [row, col] positions drawn as a short rule instead of a value, for a gated or answer grid.
 */
export function matrixBox(A, { x, y, cell = 44, rowH = 34, blanks = [], label } = {}) {
  const [m, n] = dims(A);
  const w = n * cell;
  const h = m * rowH;
  const out = [];
  const bx = 9;
  out.push(`<path d='M ${rr(x + bx)} ${rr(y)} L ${rr(x)} ${rr(y)} L ${rr(x)} ${rr(y + h)} L ${rr(x + bx)} ${rr(y + h)}' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  out.push(`<path d='M ${rr(x + w - bx)} ${rr(y)} L ${rr(x + w)} ${rr(y)} L ${rr(x + w)} ${rr(y + h)} L ${rr(x + w - bx)} ${rr(y + h)}' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const cx = x + cell * (j + 0.5);
      const cy = y + rowH * (i + 0.6);
      if (blanks.some(([bi, bj]) => bi === i && bj === j)) {
        out.push(`<path d='M ${rr(cx - 13)} ${rr(cy + 3)} L ${rr(cx + 13)} ${rr(cy + 3)}' stroke='currentColor' stroke-width='1' stroke-opacity='0.55' fill='none'/>`);
      } else {
        out.push(svgText(rr(cx), rr(cy), fPlain(A[i][j]), { size: 14 }));
      }
    }
  }
  if (label) out.push(svgText(rr(x + w / 2), rr(y - 9), label, { size: 11 }));
  return { svg: out.join(""), w, h };
}

/** A row of matrices with operators between them: [{ M, label }, "+", { M }] … */
export function matrixRowSvg(parts, { caption, title, note, cell = 44, rowH = 34, gap = 22 } = {}) {
  const out = [];
  let x = 24;
  const top = 42;
  let maxH = 0;
  for (const p of parts) {
    if (typeof p === "string") {
      out.push(svgText(rr(x + 12), rr(top + rowH), p, { size: 18 }));
      x += 30;
      continue;
    }
    const box = matrixBox(p.M, { x, y: top, cell: p.cell ?? cell, rowH, blanks: p.blanks ?? [], label: p.label });
    out.push(box.svg);
    x += box.w + gap;
    maxH = Math.max(maxH, box.h);
  }
  const W = Math.max(x + 16, 320);
  const H = top + maxH + (note ? 46 : 24);
  if (note) out.push(svgText(rr(W / 2), rr(top + maxH + 28), note, { size: 11.5 }));
  return svgWrap(`0 0 ${Math.round(W)} ${Math.round(H)}`, title ?? caption, out.join(""));
}

export { frac, fAdd, fSub, fMul, fDiv, fNeg, fVal, fTex, fPlain };
