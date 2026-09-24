/**
 * FM1 batch G — topic 2: matrix-inverse-2x2 (difficulty 2 -> L).
 * Enrichment: data/enrichment/further-maths/matrix-inverse-2x2.md (ccea-only; the inverse as the
 * undo, the three actions as a picture, the determinant on its own line with its sign, the singular
 * sentence frame naming the matrix, and the check by multiplying back are recreated here).
 * Every determinant and inverse is exact and is checked by back-multiplication.
 */
import {
  OUT, PAPER, check, draftLogs, log as verLog, writeJson, lintTree, figure, svgWrap, svgText, svgPath, svgRect, num,
  shingleClash, corpusFiles,
} from "./lib.mjs";
import {
  mat, dims, mMul, mEq, identity, det2, adj2, inv2, checkInverse, mTex, mPlain, invTex,
  matrixBox, matrixRowSvg, routes, matrixAnswer, matrixError, MATRIX_NOTE, frac, fVal, fTex, fPlain, fNeg,
  singularKeyWords,
} from "./matlib.mjs";

const SLUG = "matrix-inverse-2x2";
const TOPIC = "fm.u1.matrix-inverse-2x2";
const REFS = ["FM1-MAT-02"];
const CER19 = "ccea-cer:further-maths:2019-summer:FM1:Q5";
const CER23 = "ccea-cer:further-maths:2023-summer:FM1:Q6";
const CER25 = "ccea-cer:further-maths:2025-summer:FM1:Q5";

/* ---- the matrices, their determinants and their inverses ----------------------------------------- */

const A = mat([[4, 1], [3, 2]]);      // det 5
const N = mat([[-3, 2], [4, -1]]);    // det -5, the negative-determinant case the reports name
const G = mat([[1, 4], [2, 9]]);      // det 1
const B = mat([[2, 6], [1, 4]]);      // det 2
const F = mat([[7, 3], [4, 2]]);      // det 2
const S = mat([[3, 6], [2, 4]]);      // det 0, singular
const H = mat([[6, 9], [2, 3]]);      // det 0, singular

/** Every inverse is produced by inv2 and then proved by multiplying back, both ways. */
const INVERSES = {};
for (const [name, M] of Object.entries({ A, N, G, B, F })) {
  INVERSES[name] = checkInverse(M);
  if (!mEq(mMul(M, INVERSES[name]), identity(2)) || !mEq(mMul(INVERSES[name], M), identity(2))) {
    throw new Error(`${name} failed its back-multiplication check`);
  }
}
const Ai = INVERSES.A;
const Ni = INVERSES.N;
const Gi = INVERSES.G;
const Bi = INVERSES.B;
const Fi = INVERSES.F;

const DET = Object.fromEntries(Object.entries({ A, N, G, B, F, S, H }).map(([k, M]) => [k, det2(M)]));
if (DET.S.n !== 0 || DET.H.n !== 0) throw new Error("the singular examples are not singular");
if (fVal(DET.N) >= 0) throw new Error("N was meant to have a negative determinant");

/** Every printed inverse entry must terminate, because a table cell is compared as a number. */
for (const [name, M] of Object.entries(INVERSES)) {
  for (const row of M) for (const v of row) {
    const d = fVal(v);
    if (Math.abs(d - Math.round(d * 1e6) / 1e6) > 1e-12) throw new Error(`${name} has a non-terminating entry ${fPlain(v)}`);
  }
}

/** "Find k so that this matrix has no inverse": the determinant set to zero. */
const K1 = { b: 4, c: 3, d: 6, k: 12 / 6 };   // det = 6k - 12
const K2 = { a: 5, c: 2, d: 4, k: 20 / 2 };   // det = 20 - 2k
if (K1.d * K1.k - K1.b * K1.c !== 0) throw new Error("K1 does not make the determinant zero");
if (K1.k !== 2 || K2.k !== 10) throw new Error("the k values changed");

/* ---- error routes, executed -------------------------------------------------------------------------- */

const E = {
  aDetReversed: routes.detSignReversed(A),
  nDetReversed: routes.detSignReversed(N),
  aNotDivided: routes.notDividedByDet(A),
  aNotSwapped: routes.adjNotSwapped(A),
  aNotNegated: routes.adjNotNegated(A),
  aFactorOnOne: routes.factorOnOneEntry(A),
  /** The determinant's minus sign dropped from the reciprocal: 1/5 used where 1/(-5) belonged. */
  nSignDropped: adj2(N).map((r) => r.map((v) => frac(v.n, v.d * Math.abs(fVal(DET.N))))),
};
if (mEq(E.aNotDivided, Ai) || mEq(E.aNotSwapped, Ai) || mEq(E.aNotNegated, Ai)) throw new Error("an inverse route lands on the answer");
if (mEq(E.nSignDropped, Ni)) throw new Error("the dropped-sign route lands on the answer");
if (fVal(E.aDetReversed) === fVal(DET.A)) throw new Error("the reversed determinant equals the determinant");

/**
 * 22 Sep fix pass (fm1-g-matrices-1.md MI-1, MI-2): the diagonal products ADDED, ad + bc, executed where it is used.
 * For "find k" on M = (k b; c d): det = dk - bc. Adding the products gives dk + bc = 0, so k = -bc/d.
 * Reversing the subtraction gives bc - dk = 0, which is the right answer again, so no pattern can carry that route.
 */
const productsAdded = (M) => fVal(M[0][0]) * fVal(M[1][1]) + fVal(M[0][1]) * fVal(M[1][0]);
const K1_ADDED = -(K1.b * K1.c) / K1.d;
const K1_REVERSED = (K1.b * K1.c) / K1.d;
if (K1_ADDED === K1.k) throw new Error("the products-added route lands on k");
if (K1_REVERSED !== K1.k) throw new Error("the reversed-subtraction route was expected to land on k itself");
if (productsAdded(A) !== 11 || productsAdded(S) !== 24) throw new Error("the products-added values changed");
/** q0002's worked line: the two diagonal products of N, printed separately. */
const N_AD = fVal(N[0][0]) * fVal(N[1][1]);
const N_BC = fVal(N[0][1]) * fVal(N[1][0]);
if (N_AD - N_BC !== fVal(DET.N)) throw new Error("N's products do not give its determinant");

/* ---- figures ------------------------------------------------------------------------------------------ */

const rr = (v) => Math.round(v * 10) / 10;

/** The three actions drawn on a lettered matrix, with the finished inverse beside it. */
function threeActionsSvg() {
  const letters = [["a", "b"], ["c", "d"]];
  const out = [];
  const x0 = 40;
  const y0 = 56;
  const cell = 52;
  const rowH = 40;
  // the lettered matrix, drawn by hand so the letters can be annotated
  out.push(`<path d='M ${x0 + 9} ${y0} L ${x0} ${y0} L ${x0} ${y0 + 2 * rowH} L ${x0 + 9} ${y0 + 2 * rowH}' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  out.push(`<path d='M ${x0 + 2 * cell - 9} ${y0} L ${x0 + 2 * cell} ${y0} L ${x0 + 2 * cell} ${y0 + 2 * rowH} L ${x0 + 2 * cell - 9} ${y0 + 2 * rowH}' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    out.push(svgText(rr(x0 + cell * (j + 0.5)), rr(y0 + rowH * (i + 0.62)), letters[i][j], { size: 17 }));
  }
  // action 1: a curved arrow joining the leading diagonal
  out.push(`<path d='M ${x0 + 26} ${y0 + 10} C ${x0 + 120} ${y0 - 22} ${x0 + 120} ${y0 + 90} ${x0 + 78} ${y0 + 66}' stroke='currentColor' stroke-width='1.2' fill='none' stroke-dasharray='5 4'/>`);
  out.push(svgText(rr(x0 + 52), rr(y0 - 26), "1  swap the leading diagonal", { size: 10.5 }));
  // action 2: minus badges on the other diagonal
  for (const [i, j] of [[0, 1], [1, 0]]) {
    const cx = x0 + cell * (j + 0.5) + 19;
    const cy = y0 + rowH * (i + 0.62) - 5;
    out.push(`<circle cx='${rr(cx)}' cy='${rr(cy)}' r='8' fill='none' stroke='currentColor' stroke-width='1'/>`);
    out.push(svgText(rr(cx), rr(cy + 4), "−", { size: 12 }));
  }
  out.push(svgText(rr(x0 + 52), rr(y0 + 2 * rowH + 22), "2  change the signs on the other diagonal", { size: 10.5 }));
  // action 3: divide by the determinant
  out.push(svgPath(`M ${x0} ${y0 + 2 * rowH + 34} L ${x0 + 2 * cell} ${y0 + 2 * rowH + 34}`, { width: 1.2 }));
  out.push(svgText(rr(x0 + cell), rr(y0 + 2 * rowH + 52), "ad − bc", { size: 14 }));
  out.push(svgText(rr(x0 + 52), rr(y0 + 2 * rowH + 72), "3  divide by the determinant", { size: 10.5 }));
  // the finished inverse
  out.push(svgPath(`M ${x0 + 2 * cell + 24} ${y0 + rowH} L ${x0 + 2 * cell + 74} ${y0 + rowH} M ${x0 + 2 * cell + 64} ${y0 + rowH - 7} L ${x0 + 2 * cell + 74} ${y0 + rowH} L ${x0 + 2 * cell + 64} ${y0 + rowH + 7}`, { width: 1.4 }));
  const fx = x0 + 2 * cell + 96;
  out.push(svgText(rr(fx + 6), rr(y0 + rowH - 6), "1", { size: 12 }));
  out.push(svgPath(`M ${fx - 22} ${y0 + rowH} L ${fx + 34} ${y0 + rowH}`, { width: 1.1 }));
  out.push(svgText(rr(fx + 6), rr(y0 + rowH + 18), "(ad − bc)", { size: 12 }));
  const rx = fx + 48;
  out.push(`<path d='M ${rx + 9} ${y0} L ${rx} ${y0} L ${rx} ${y0 + 2 * rowH} L ${rx + 9} ${y0 + 2 * rowH}' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  out.push(`<path d='M ${rx + 2 * cell - 9} ${y0} L ${rx + 2 * cell} ${y0} L ${rx + 2 * cell} ${y0 + 2 * rowH} L ${rx + 2 * cell - 9} ${y0 + 2 * rowH}' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  const res = [["d", "−b"], ["−c", "a"]];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    out.push(svgText(rr(rx + cell * (j + 0.5)), rr(y0 + rowH * (i + 0.62)), res[i][j], { size: 17 }));
  }
  out.push(svgText(rr(rx + cell), rr(y0 - 26), "the inverse", { size: 10.5 }));
  out.push(svgText(300, 214, "three actions, in that order, every time", { size: 11.5 }));
  return svgWrap(
    "0 0 600 226",
    "A lettered two by two matrix with three annotations: a dashed arrow swapping a and d on the leading diagonal, minus badges on b and c, and a rule underneath labelled ad minus bc, with the finished inverse drawn beside it",
    out.join(""),
  );
}

/** A worked determinant on its own line, with its sign kept. */
function detSvg(M, name) {
  const d = det2(M);
  const out = [];
  const box = matrixBox(M, { x: 28, y: 36, label: name });
  out.push(box.svg);
  const x = 28 + box.w + 20;
  out.push(svgText(x, 36 + 34, `det ${name} = (${fPlain(M[0][0])})(${fPlain(M[1][1])}) − (${fPlain(M[0][1])})(${fPlain(M[1][0])})`, { size: 14, anchor: "start" }));
  out.push(svgText(x, 36 + 60, `= ${fPlain(d)}`, { size: 16, anchor: "start" }));
  out.push(svgText(300, 140, fVal(d) < 0 ? "a negative determinant, and the minus sign stays with it" : "one line, before the matrix is touched at all", { size: 11.5 }));
  return svgWrap(
    "0 0 600 152",
    `The determinant of matrix ${name} worked out on its own line as ad minus bc, giving ${fPlain(d)}`,
    out.join(""),
  );
}

/** The singular case with the sentence frame the examiners want. */
function singularSvg(M, name) {
  const out = [];
  const box = matrixBox(M, { x: 28, y: 36, label: name });
  out.push(box.svg);
  const x = 28 + box.w + 20;
  out.push(svgText(x, 36 + 26, `det ${name} = (${fPlain(M[0][0])})(${fPlain(M[1][1])}) − (${fPlain(M[0][1])})(${fPlain(M[1][0])}) = 0`, { size: 13.5, anchor: "start" }));
  out.push(svgText(x, 36 + 52, "1", { size: 12, anchor: "start" }));
  out.push(svgPath(`M ${x - 4} ${36 + 58} L ${x + 34} ${36 + 58}`, { width: 1 }));
  out.push(svgText(x, 36 + 76, "0", { size: 12, anchor: "start" }));
  out.push(svgPath(`M ${x - 10} ${36 + 78} L ${x + 44} ${36 + 42}`, { width: 1.6 }));
  out.push(svgRect(24, 128, 552, 34, { width: 1.2, fill: "currentColor", opacity: 0.06 }));
  out.push(svgText(300, 150, `det ${name} = 0, so ${name} has no inverse: ${name} is singular`, { size: 13 }));
  return svgWrap(
    "0 0 600 176",
    `Matrix ${name} with its determinant worked out as zero, the reciprocal struck through, and the sentence naming ${name} as the matrix with no inverse`,
    out.join(""),
  );
}

/** The check: the inverse multiplied back gives the identity. */
function checkSvg(M, Mi, name) {
  return matrixRowSvg(
    [{ M: Mi, label: `${name} inverse`, cell: 52 }, "×", { M, label: name }, "=", { M: identity(2) }],
    {
      title: `The inverse of ${name} multiplied by ${name}, giving the identity matrix with ones on the leading diagonal and zeros elsewhere`,
      note: "twenty seconds, and it catches every sign slip",
      cell: 52,
    },
  );
}

const THREE_SVG = threeActionsSvg();
const DET_SVG = detSvg(A, "A");
const NEG_SVG = detSvg(N, "N");
const SING_SVG = singularSvg(S, "S");
const CHECK_SVG = checkSvg(A, Ai, "A");
const INV_SVG = matrixRowSvg(
  [{ M: A, label: "A" }, "→", { M: adj2(A), label: "swapped and negated" }, "→", { M: Ai, label: "divided by 5" }],
  {
    title: `Matrix A turned into its inverse in two moves: the leading diagonal swapped and the other diagonal negated, then every entry divided by the determinant`,
    note: "swap and negate, then divide by the determinant",
    cell: 50,
  },
);

/* ---- note ----------------------------------------------------------------------------------------------- */

const blocks = [
  {
    type: "hero",
    lede: "There is no dividing by a matrix. What there is instead is an inverse: the matrix that undoes what the first one did, leaving everything where it started. For a two by two there is a short formula, it is not on your formula sheet, and the whole of it is three actions.",
    can: [
      "Work out the determinant of a two by two matrix, sign and all",
      "Say when a matrix has no inverse, and name the matrix that does not",
      "Build an inverse by swapping, negating and dividing, then check it",
    ],
    minutes: 11,
  },
  { type: "h", text: "The matrix that undoes the other one" },
  {
    type: "p",
    md: `Multiply a number by $4$ and you undo it by multiplying by $\\frac{1}{4}$. Matrices have the same idea with a different name: the **inverse** of $A$, written $A^{-1}$, is the matrix for which $A^{-1}A$ and $AA^{-1}$ both give the identity.\nThe identity is the matrix with ones on the leading diagonal and zeros elsewhere. It is the matrix version of $1$: multiplying by it changes nothing.`,
  },
  {
    type: "figure",
    alt: `The inverse of A multiplied by A, giving the identity matrix with ones on the leading diagonal and zeros elsewhere.`,
    svg: CHECK_SVG,
    caption: `That is the definition: $A^{-1}A$ gives the identity.`,
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: `One tap to begin. In the multiplication shown above, what is the matrix on the right-hand side called?`,
    options: ["The identity", "The determinant", "The inverse"],
    answer: "The identity",
    explain: `Ones on the leading diagonal, zeros elsewhere: that is the identity, and reaching it is what proves the other matrix was the inverse.`,
  },
  { type: "h", text: "1. The determinant, on a line of its own" },
  {
    type: "p",
    md: `Before anything else, work out the **determinant**: for the matrix $\\begin{pmatrix}a & b \\\\ c & d\\end{pmatrix}$ it is $ad - bc$.\nWrite it on its own line with its sign attached. That one habit is where this topic's marks live: the reports record slips in the arithmetic, and answers where a determinant of $-5$ became a reciprocal of $\\frac{1}{5}$.`,
  },
  {
    type: "figure",
    alt: `The determinant of matrix A worked out on its own line as ad minus bc, giving 5.`,
    svg: DET_SVG,
    caption: `Leading diagonal times, take away the other diagonal times.`,
  },
  {
    type: "gate",
    id: "g2",
    kind: "number",
    prompt: `For the matrix $N = ${mTex(N)}$, the determinant is $ad - bc$. What is $\\det N$?`,
    answer: fPlain(DET.N),
    explain: `$(${fPlain(N[0][0])})(${fPlain(N[1][1])}) - (${fPlain(N[0][1])})(${fPlain(N[1][0])}) = ${fPlain(DET.N)}$. Taking it the other way round would give $${fPlain(E.nDetReversed)}$, with the sign wrong.`,
  },
  { type: "h", text: "2. When there is no inverse at all" },
  {
    type: "p",
    md: `The formula divides by the determinant, so if the determinant is zero there is nothing to divide by and **no inverse exists**. A matrix like that is called **singular**.\nWhen a question asks why an equation cannot be solved, say both halves: name the matrix, and give the reason. Examiners report answers that said the determinant was zero without making clear whose determinant it was.`,
  },
  {
    type: "figure",
    alt: `Matrix S with its determinant worked out as zero, the reciprocal struck through, and the sentence naming S as the matrix with no inverse.`,
    svg: SING_SVG,
    caption: `The sentence to write, with the matrix named.`,
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: `A matrix has no inverse exactly when its determinant takes one particular value. What is that value?`,
    answer: "0",
    explain: `Zero. The formula divides by the determinant, and nothing can be divided by zero, so a matrix with $\\det = 0$ is singular.`,
  },
  { type: "h", text: "3. Three actions, in order" },
  {
    type: "p",
    md: `With a determinant that is not zero, the inverse is built in three moves. **Swap** the leading diagonal, so $a$ and $d$ change places. **Negate** the other diagonal, so $b$ and $c$ change sign. **Divide** every entry by the determinant.\nDo them in that order and there is nothing to remember beyond the picture below.`,
  },
  {
    type: "figure",
    alt: `A lettered two by two matrix with three annotations: an arrow swapping a and d, minus badges on b and c, and a rule underneath labelled ad minus bc, with the finished inverse beside it.`,
    svg: THREE_SVG,
    caption: `Swap the leading diagonal, negate the other, divide by $ad - bc$.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the formula is not on your sheet",
    md: `The Unit 1 formula sheet gives you the quadratic formula, differentiation, integration and the logarithm definition. It gives you nothing about matrices, so this one is recall. That is why it is worth holding as a picture of three actions rather than as a line of letters.`,
  },
  {
    type: "gate",
    id: "g4",
    kind: "choice",
    prompt: `In the three actions shown above, which pair of entries changes sign?`,
    options: ["$b$ and $c$", "$a$ and $d$", "All four"],
    answer: "$b$ and $c$",
    explain: `The leading diagonal $a$ and $d$ swap places and keep their signs; $b$ and $c$ stay where they are and change sign.`,
  },
  { type: "h", text: "4. A worked inverse, and the check" },
  {
    type: "p",
    md: `Find $A^{-1}$ for $A = ${mTex(A)}$.\n**Step 1.** $\\det A = (${fPlain(A[0][0])})(${fPlain(A[1][1])}) - (${fPlain(A[0][1])})(${fPlain(A[1][0])}) = ${fPlain(DET.A)}$.\n**Step 2.** Swap and negate: $${mTex(adj2(A))}$.\n**Step 3.** Divide by $${fPlain(DET.A)}$: $A^{-1} = ${invTex(A)}$.\n**Step 4.** Check: $A^{-1}A$ gives the identity.`,
  },
  {
    type: "figure",
    alt: `Matrix A turned into its inverse in two moves: swapped and negated, then every entry divided by the determinant.`,
    svg: INV_SVG,
    caption: `Keep the $\\frac{1}{${fPlain(DET.A)}}$ outside, or share it through every entry — but not half and half.`,
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025, Unit 1, Question 5",
    md: "This part was very well answered. The few marks that went were signs: a determinant of $-26$ written as a reciprocal of $\\frac{1}{26}$. Work the determinant out on its own line, and write the reciprocal with brackets round it.",
    source: CER25,
  },
  {
    type: "video",
    videoId: "jLTXaXNPgLo",
    title: "Inverse of a 2x2 Matrix - Corbettmaths",
    channel: "corbettmaths",
    why: "The same three actions on several matrices. It will not tell you that CCEA gives you none of this on the formula sheet, which is the part to hold on to.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `For $N = ${mTex(N)}$ the determinant is $${fPlain(DET.N)}$ and swapping and negating gives $${mTex(adj2(N))}$. What is the entry in row 1, column 1 of $N^{-1}$?`,
    answer: fPlain(Ni[0][0]),
    explain: `Dividing $${fPlain(adj2(N)[0][0])}$ by $${fPlain(DET.N)}$ gives $${fPlain(Ni[0][0])}$. Dividing by $${fPlain(fNeg(DET.N))}$ instead, with the minus sign dropped, would give $${fPlain(E.nSignDropped[0][0])}$.`,
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: `Work out a determinant as $ad - bc$, on its own line, with its sign.\nSay that a matrix with a zero determinant is singular, and name it when you are asked why.\nBuild an inverse by swapping the leading diagonal, negating the other and dividing by the determinant.\nKeep the reciprocal of a negative determinant negative.\nCheck an inverse by multiplying back to the identity.`,
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: `"Find the inverse" is a reliable $2$ marks, almost always part (i) of a longer question whose later parts depend on it. The first mark is the determinant; the second is the arranged matrix with the reciprocal attached. Stuck? Write $\\det = ad - bc$ with the numbers in it. That line alone earns the first mark and tells you whether an inverse exists.`,
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
  { type: "prompt", promptId: `rp.${TOPIC}.06` },
];

/* ---- items ------------------------------------------------------------------------------------------------ */

/** The answer-line sentence: the scalar has to be multiplied through, because entries are marked as written. */
const ENTRY_NOTE = `${MATRIX_NOTE} A fraction, a decimal or a fraction in front of the brackets is accepted.`;

const numAns = (value) => ({
  kind: "numeric",
  value,
  tolerance: { type: "absolute", value: 0.0005 },
  unitRequired: false,
  acceptForms: ["decimal", "fraction"],
});

const ce = (misconception, value, feedback, marks, source) => ({
  misconception,
  pattern: { kind: "numeric", value, tolerance: { type: "absolute", value: 0.0005 } },
  feedback,
  marksTypicallyEarned: marks,
  source,
});

/** Every entry of M divided by the number d, as the last of the three actions would. */
const over = (M, d) => M.map((r) => r.map((v) => frac(v.n, v.d * d)));

const opt = (id, M, correct, feedback, misconception) => ({
  id,
  text: `$${mTex(M)}$`,
  correct,
  feedback,
  ...(misconception ? { misconception } : {}),
});

const questions = [
  {
    id: `q.${TOPIC}.0001`, difficulty: 1, style: "practice", commandWords: ["Calculate"],
    setting: "A determinant on its own, the line every inverse question opens with",
    parts: [{
      id: "main",
      stem: `The matrix $A = ${mTex(A)}$.\nCalculate $\\det A$.`,
      marks: 1,
      answer: numAns(fVal(DET.A)),
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${fPlain(DET.A)}$`, accept: [`$(${fPlain(A[0][0])})(${fPlain(A[1][1])}) - (${fPlain(A[0][1])})(${fPlain(A[1][0])})$ seen`] }],
      hints: [`Leading diagonal multiplied, take away the other diagonal multiplied.`],
      workedSolution: `$\\det A = (${fPlain(A[0][0])})(${fPlain(A[1][1])}) - (${fPlain(A[0][1])})(${fPlain(A[1][0])}) = ${fPlain(DET.A)}$.`,
      commonErrors: [
        ce("fm.matrix.determinant-sign-reversed", fVal(E.aDetReversed), `That is $bc - ad$, the subtraction the other way round. The determinant is $ad - bc$, which gives $${fPlain(DET.A)}$.`, 0, CER19),
      ],
      requiresWorking: false,
    }],
  },
  {
    id: `q.${TOPIC}.0002`, difficulty: 2, style: "practice", commandWords: ["Calculate"],
    setting: "A determinant that comes out negative, where the reports say the marks go",
    parts: [{
      id: "main",
      stem: `The matrix $N = ${mTex(N)}$.\nCalculate $\\det N$.`,
      marks: 1,
      answer: numAns(fVal(DET.N)),
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${fPlain(DET.N)}$` }],
      hints: ["Take care with the signs of the entries as well as with the subtraction."],
      workedSolution: `$\\det N = (${fPlain(N[0][0])})(${fPlain(N[1][1])}) - (${fPlain(N[0][1])})(${fPlain(N[1][0])}) = ${N_AD} - ${N_BC} = ${fPlain(DET.N)}$.\nThe leading diagonal holds two negatives, and their product is positive: $(${fPlain(N[0][0])})(${fPlain(N[1][1])}) = ${N_AD}$.`,
      commonErrors: [
        ce("fm.matrix.determinant-sign-reversed", fVal(E.nDetReversed), `That is $bc - ad$. Taken as $ad - bc$ the determinant is $${fPlain(DET.N)}$, and its minus sign has to survive into the inverse.`, 0, CER25),
      ],
      requiresWorking: false,
    }],
  },
  {
    id: `q.${TOPIC}.0003`, difficulty: 2, style: "practice", commandWords: ["Identify"],
    setting: "A singular matrix, recognised from its determinant",
    parts: [{
      id: "main",
      stem: `The matrix $S = ${mTex(S)}$.\nIdentify the correct statement about $S$.`,
      marks: 2,
      answer: {
        kind: "mcq",
        shuffle: true,
        options: [
          { id: "a", text: `$\\det S = 0$, so $S$ has no inverse`, correct: true, feedback: `The inverse formula divides by the determinant, and nothing divides by zero. A matrix like this is called singular.` },
          { id: "b", text: `$\\det S = 0$, so $S^{-1}$ is the zero matrix`, correct: false, misconception: "fm.matrix.singular-not-recognised", feedback: `There is no inverse at all, not an inverse made of zeros. Nothing multiplies $S$ to give the identity.` },
          { id: "c", text: `$\\det S = ${fVal(S[0][0]) * fVal(S[1][1])} + ${fVal(S[0][1]) * fVal(S[1][0])} = ${productsAdded(S)}$, so the inverse exists`, correct: false, misconception: "fm.matrix.determinant-products-added", feedback: `The two diagonal products have been added. The determinant subtracts them: $${fVal(S[0][0]) * fVal(S[1][1])} - ${fVal(S[0][1]) * fVal(S[1][0])} = 0$, so $S$ has no inverse.` },
        ],
      },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\det S = 0$` },
        { id: "W1", code: "W", marks: 1, for: `$S$ has no inverse`, accept: ["$S$ is singular"] },
      ],
      hints: ["Work the determinant out first."],
      workedSolution: `$\\det S = (${fPlain(S[0][0])})(${fPlain(S[1][1])}) - (${fPlain(S[0][1])})(${fPlain(S[1][0])}) = 12 - 12 = 0$.\nThe inverse formula divides by the determinant, so $S$ has no inverse: $S$ is singular.`,
      commonErrors: [],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0004`, difficulty: 2, style: "practice", commandWords: ["Find"],
    setting: "An inverse whose determinant is one, so the three actions stand alone",
    parts: [{
      id: "main",
      stem: `The matrix $G = ${mTex(G)}$.\nFind $G^{-1}$.\n${ENTRY_NOTE}`,
      marks: 2,
      answer: matrixAnswer(Gi),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\det G = ${fPlain(DET.G)}$` },
        { id: "W1", code: "W", marks: 1, for: `$${mTex(Gi)}$`, ft: true },
      ],
      hints: ["Determinant first.", "Swap the leading diagonal, negate the other one."],
      workedSolution: `$\\det G = (${fPlain(G[0][0])})(${fPlain(G[1][1])}) - (${fPlain(G[0][1])})(${fPlain(G[1][0])}) = ${fPlain(DET.G)}$.\nSwapping and negating gives $${mTex(adj2(G))}$, and dividing by $1$ leaves it unchanged.\nSo $G^{-1} = ${mTex(Gi)}$, and $G^{-1}G$ gives the identity.`,
      commonErrors: [
        matrixError("fm.matrix.adjugate-not-swapped", routes.adjNotSwapped(G), `The signs on the other diagonal changed, and the leading diagonal never swapped. With $a$ and $d$ exchanged as well, the inverse is $${mTex(Gi)}$.`, 1, CER19),
        matrixError("fm.matrix.adjugate-not-negated", routes.adjNotNegated(G), `The leading diagonal swapped, and $b$ and $c$ kept their signs. The other diagonal changes sign, which gives $${mTex(Gi)}$.`, 1, CER19),
      ],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0005`, difficulty: 2, style: "practice", commandWords: ["Find"],
    setting: "An inverse with fractional entries, the standard two-mark shape",
    parts: [{
      id: "main",
      stem: `The matrix $A = ${mTex(A)}$.\nFind $A^{-1}$.\n${ENTRY_NOTE}`,
      // 22 Sep (lead's decision): CCEA's tariff. "Find the inverse" was 2 marks in the Summer 2018, 2019 and 2025
      // schemes: one for the determinant, one for the finished inverse. Every route that gets the determinant right
      // and the inverse wrong therefore keeps 1 of 2.
      marks: 2,
      answer: matrixAnswer(Ai),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\det A = ${fPlain(DET.A)}$` },
        { id: "W1", code: "W", marks: 1, for: `$${invTex(A)}$`, accept: [`$${mTex(Ai)}$`], ft: true },
      ],
      hints: ["Determinant on its own line first.", "Swap, negate, then divide every entry."],
      workedSolution: `$\\det A = ${fPlain(DET.A)}$.\nSwapping and negating gives $${mTex(adj2(A))}$.\nDividing every entry by $${fPlain(DET.A)}$: $A^{-1} = ${invTex(A)} = ${mTex(Ai)}$.`,
      commonErrors: [
        matrixError("fm.matrix.inverse-not-divided-by-det", E.aNotDivided, `Swapped and negated correctly, and then handed in without the division. Every entry still has to be divided by $${fPlain(DET.A)}$, which gives $${mTex(Ai)}$.`, 1, CER25),
        matrixError("fm.matrix.det-factor-on-one-entry-only", E.aFactorOnOne, `Only the first entry was divided by the determinant. The factor of $\\frac{1}{${fPlain(DET.A)}}$ reaches all four, giving $${mTex(Ai)}$.`, 1, CER25),
        matrixError("fm.matrix.adjugate-not-swapped", over(routes.adjNotSwapped(A), fVal(DET.A)), `The signs changed but the leading diagonal never swapped. With $a$ and $d$ exchanged the inverse is $${mTex(Ai)}$.`, 1, CER19),
        matrixError("fm.matrix.adjugate-not-negated", over(routes.adjNotNegated(A), fVal(DET.A)), `The leading diagonal swapped and the other diagonal kept its signs. Negating $b$ and $c$ gives $${mTex(Ai)}$.`, 1, CER19),
      ],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0006`, difficulty: 3, style: "practice", commandWords: ["Write down"],
    setting: "One named entry of an inverse, so each action is tested on its own",
    parts: [{
      id: "main",
      stem: `The matrix $A = ${mTex(A)}$ has $\\det A = ${fPlain(DET.A)}$.\nWrite down the entry in row 1, column 2 of $A^{-1}$.`,
      marks: 2,
      answer: numAns(fVal(Ai[0][1])),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `$${fPlain(adj2(A)[0][1])}$ after swapping and negating` },
        { id: "W1", code: "W", marks: 1, for: `$${fPlain(Ai[0][1])}$`, ft: true },
      ],
      hints: ["That entry is $b$, which changes sign and stays where it is.", "Then divide by the determinant."],
      workedSolution: `Row 1, column 2 holds $b = ${fPlain(A[0][1])}$, which changes sign to $${fPlain(adj2(A)[0][1])}$.\nDividing by $\\det A = ${fPlain(DET.A)}$ gives $${fPlain(Ai[0][1])}$.`,
      commonErrors: [
        ce("fm.matrix.inverse-not-divided-by-det", fVal(E.aNotDivided[0][1]), `The sign was changed but the entry was never divided by the determinant. Dividing $${fPlain(adj2(A)[0][1])}$ by $${fPlain(DET.A)}$ gives $${fPlain(Ai[0][1])}$.`, 1, CER25),
        ce("fm.matrix.adjugate-not-negated", fVal(E.aNotNegated[0][1] ? frac(E.aNotNegated[0][1].n, E.aNotNegated[0][1].d * fVal(DET.A)) : 0), `The entry was divided by the determinant but never negated. The other diagonal changes sign, so the answer is $${fPlain(Ai[0][1])}$.`, 1, CER19),
      ],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0007`, difficulty: 3, style: "practice", commandWords: ["Identify"],
    setting: "Choosing the inverse from four arrangements, each a different action gone wrong",
    parts: [{
      id: "main",
      stem: `The matrix $B = ${mTex(B)}$.\nIdentify $B^{-1}$.`,
      marks: 2,
      answer: {
        kind: "mcq",
        shuffle: true,
        options: [
          opt("a", Bi, true, `$\\det B = ${fPlain(DET.B)}$, and swapping, negating and dividing gives this.`),
          opt("b", adj2(B), false, `Swapped and negated correctly, and then not divided by the determinant.`, "fm.matrix.inverse-not-divided-by-det"),
          opt("c", routes.adjNotSwapped(B).map((r) => r.map((v) => frac(v.n, v.d * fVal(DET.B)))), false, `The signs changed but the leading diagonal never swapped.`, "fm.matrix.adjugate-not-swapped"),
          opt("d", routes.adjNotNegated(B).map((r) => r.map((v) => frac(v.n, v.d * fVal(DET.B)))), false, `The leading diagonal swapped but the other diagonal kept its signs.`, "fm.matrix.adjugate-not-negated"),
        ],
      },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\det B = ${fPlain(DET.B)}$` },
        { id: "W1", code: "W", marks: 1, for: `$${mTex(Bi)}$` },
      ],
      hints: ["Work the determinant out, then apply the three actions in order."],
      workedSolution: `$\\det B = (${fPlain(B[0][0])})(${fPlain(B[1][1])}) - (${fPlain(B[0][1])})(${fPlain(B[1][0])}) = ${fPlain(DET.B)}$.\nSwapping and negating gives $${mTex(adj2(B))}$, and dividing every entry by $${fPlain(DET.B)}$ gives $${mTex(Bi)}$.`,
      commonErrors: [],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0008`, difficulty: 3, style: "practice", commandWords: ["Find"],
    setting: "The value that makes a matrix singular, which is the determinant read as an equation",
    parts: [{
      id: "main",
      stem: `The matrix $M = \\begin{pmatrix}k & ${K1.b} \\\\ ${K1.c} & ${K1.d}\\end{pmatrix}$ has no inverse.\nFind the value of $k$.`,
      marks: 2,
      answer: numAns(K1.k),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `$${K1.d}k - ${K1.b * K1.c} = 0$` },
        { id: "W1", code: "W", marks: 1, for: `$${K1.k}$`, ft: true },
      ],
      hints: ["A matrix has no inverse exactly when its determinant is zero.", "Write the determinant in terms of $k$ and set it to zero."],
      workedSolution: `$\\det M = ${K1.d}k - (${K1.b})(${K1.c}) = ${K1.d}k - ${K1.b * K1.c}$.\nThere is no inverse when the determinant is zero, so $${K1.d}k - ${K1.b * K1.c} = 0$.\nTherefore $k = ${K1.k}$.`,
      commonErrors: [
        ce("fm.matrix.determinant-products-added", K1_ADDED, `Setting the determinant to zero is right, but $${K1.d}k + ${K1.b * K1.c}$ adds the two diagonal products. The determinant subtracts them: $ad - bc = ${K1.d}k - ${K1.b * K1.c}$, and $${K1.d}k - ${K1.b * K1.c} = 0$ gives $k = ${K1.k}$.`, 1, CER19),
      ],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0009`, difficulty: 3, style: "exam-style", commandWords: ["Find", "Explain"],
    setting: "A determinant, an inverse and a singular matrix named, the shape part (i) of a matrix question takes",
    parts: [
      {
        id: "a",
        stem: `The matrix $F = ${mTex(F)}$.\nFind $F^{-1}$.\n${ENTRY_NOTE}`,
        // 22 Sep (lead's decision): 2 marks, CCEA's tariff for "find the inverse" (see q0005).
        marks: 2,
        answer: matrixAnswer(Fi),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$\\det F = ${fPlain(DET.F)}$` },
          { id: "W1", code: "W", marks: 1, for: `$${invTex(F)}$`, accept: [`$${mTex(Fi)}$`], ft: true },
        ],
        hints: ["Determinant on its own line first.", "Swap, negate, divide."],
        workedSolution: `$\\det F = (${fPlain(F[0][0])})(${fPlain(F[1][1])}) - (${fPlain(F[0][1])})(${fPlain(F[1][0])}) = ${fPlain(DET.F)}$.\nSwapping and negating gives $${mTex(adj2(F))}$.\nDividing by $${fPlain(DET.F)}$: $F^{-1} = ${mTex(Fi)}$.`,
        commonErrors: [
          matrixError("fm.matrix.inverse-not-divided-by-det", adj2(F), `Swapped and negated correctly, and then not divided by the determinant. Dividing every entry by $${fPlain(DET.F)}$ gives $${mTex(Fi)}$.`, 1, CER25),
          matrixError("fm.matrix.adjugate-not-negated", over(routes.adjNotNegated(F), fVal(DET.F)), `The leading diagonal swapped and $b$ and $c$ kept their signs. The other diagonal changes sign, giving $${mTex(Fi)}$.`, 1, CER19),
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: `Write down the matrix $F^{-1}F$.\n${ENTRY_NOTE}`,
        marks: 1,
        answer: matrixAnswer(identity(2)),
        scheme: [{ id: "W1", code: "W", marks: 1, for: `the identity matrix $${mTex(identity(2))}$`, ft: true }],
        hints: ["An inverse undoes the matrix it came from."],
        workedSolution: `An inverse multiplied by its own matrix gives the identity, so $F^{-1}F = ${mTex(identity(2))}$.\nMultiplying it out is also a check on part (a).`,
        commonErrors: [],
        requiresWorking: false,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
      {
        id: "c",
        stem: `The matrix $H = ${mTex(H)}$.\nExplain why $H$ has no inverse.`,
        marks: 2,
        answer: {
          kind: "text",
          accepted: [
            "det H = 0, so H has no inverse because the formula divides by the determinant",
            "the determinant of H is zero, so H is singular and has no inverse",
          ],
          keyWords: singularKeyWords("H"),
          listingRule: false,
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$\\det H = 18 - 18 = 0$` },
          { id: "W1", code: "W", marks: 1, for: `$H$ named as the matrix with no inverse`, accept: ["$H$ is singular"] },
        ],
        hints: ["Work out the determinant.", "Name the matrix as well as the reason."],
        workedSolution: `$\\det H = (${fPlain(H[0][0])})(${fPlain(H[1][1])}) - (${fPlain(H[0][1])})(${fPlain(H[1][0])}) = 18 - 18 = 0$.\nThe determinant of H is zero, so H is singular and has no inverse.`,
        commonErrors: [],
        requiresWorking: true,
      },
    ],
  },
];

function buildQuestion(q) {
  const totalMarks = q.parts.reduce((s, p) => s + p.marks, 0);
  const verbFor = (p) => (p.stem.includes("Explain") ? "explain" : p.stem.includes("Identify") ? "identify" : p.stem.includes("Write down") ? "write-down" : p.stem.includes("Calculate") ? "calculate" : "find");
  return {
    id: q.id,
    topic: TOPIC,
    specRefs: REFS,
    paper: PAPER,
    tier: "untiered",
    style: q.style,
    difficulty: q.difficulty,
    ao: q.style === "exam-style" ? ["AO1", "AO2"] : ["AO1"],
    commandWords: q.commandWords,
    emphasis: [],
    context: { setting: q.setting, original: true },
    figures: q.figures ?? [],
    parts: q.parts,
    totalMarks,
    timeAllowanceSec: Math.round(totalMarks * 1.2 * 60),
    skeleton: q.parts.map((p) => `(${p.id})${verbFor(p)}${p.marks}`).join("|"),
    examinerSources: [CER19, CER23, CER25],
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
    stem: `The matrix $A = ${mTex(A)}$.\nFind $A^{-1}$.`,
    figure: figure(INV_SVG, `Matrix A turned into its inverse in two moves: swapped and negated, then every entry divided by the determinant.`),
    steps: [
      {
        n: 1,
        working: `$\\det A = (${fPlain(A[0][0])})(${fPlain(A[1][1])}) - (${fPlain(A[0][1])})(${fPlain(A[1][0])}) = ${fPlain(DET.A)}$.`,
        decision: "On its own line, before the matrix is touched. It earns the first mark, and it tells you straight away whether an inverse exists at all.",
        earns: ["MW1"],
      },
      {
        n: 2,
        working: `Swap the leading diagonal and negate the other one: $${mTex(adj2(A))}$.`,
        decision: `Two separate actions, done in that order. The leading diagonal moves and keeps its signs; the other diagonal stays put and changes sign. This line earns nothing on its own: the second mark is for the finished inverse, after the division.`,
        whyMenu: {
          options: [
            "Because swapping and negating is what makes the product come out as the identity",
            "Because every entry of an inverse is the reciprocal of the original entry",
            "Because the two diagonals are always interchangeable",
          ],
          correct: 0,
          explain: `The arrangement is chosen precisely so that multiplying back gives the identity. Taking reciprocals entry by entry would not undo the matrix at all.`,
        },
        // 22 Sep: no code of its own. CCEA's two marks are the determinant and the finished inverse, so this step is
        // half of the second mark, which is only earned once the division is done.
      },
      {
        n: 3,
        working: `Divide every entry by the determinant: $A^{-1} = ${invTex(A)} = ${mTex(Ai)}$.`,
        decision: `Keep the $\\frac{1}{${fPlain(DET.A)}}$ outside the brackets or share it through all four entries, but do not do half of each. A determinant with a minus sign keeps it here.`,
        earns: ["W1"],
      },
      {
        n: 4,
        working: `Check: $A^{-1}A = ${mTex(Ai)}${mTex(A)} = ${mTex(identity(2))}$.`,
        decision: "It earns no mark of its own. It takes twenty seconds on a calculator paper, and it catches every sign slip in the three actions above.",
      },
    ],
    finalAnswer: `$A^{-1} = ${mTex(Ai)}$`,
    twin: {
      stem: `Find $B^{-1}$ for $B = ${mTex(B)}$.`,
      answer: matrixAnswer(Bi),
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
    stem: `The matrix $N = ${mTex(N)}$.\nFind $N^{-1}$.`,
    figure: figure(NEG_SVG, `The determinant of matrix N worked out on its own line as ad minus bc, coming out negative.`),
    steps: [
      {
        n: 1,
        working: `$\\det N = (${fPlain(N[0][0])})(${fPlain(N[1][1])}) - (${fPlain(N[0][1])})(${fPlain(N[1][0])}) = ${N_AD} - ${N_BC} = ${fPlain(DET.N)}$.`,
        decision: `The leading diagonal holds two negatives, so write each product out rather than doing it in your head: $(${fPlain(N[0][0])})(${fPlain(N[1][1])})$ is $${N_AD}$, not $-${N_AD}$. The determinant is ${fVal(DET.N) < 0 ? "negative" : "positive"}, and that sign has to survive.`,
        earns: ["MW1"],
      },
      {
        n: 2,
        working: `Swap and negate: $${mTex(adj2(N))}$.`,
        decision: "Negating an entry that is already negative makes it positive. Write each one down rather than trusting the pattern. This line earns nothing on its own: the second mark is for the finished inverse.",
      },
      {
        n: 3,
        working: `Divide by $${fPlain(DET.N)}$, with brackets round it: $N^{-1} = ${invTex(N)} = ${mTex(Ni)}$.`,
        decision: `This is the step the reports name. Writing $\\frac{1}{${fPlain(fNeg(DET.N))}}$ instead would give $${mTex(E.nSignDropped)}$, with every sign wrong.`,
        whyMenu: {
          options: [
            "Because the reciprocal of a negative number is negative",
            "Because a determinant is always written as a positive number",
            "Because the minus signs in the matrix cancel it out",
          ],
          correct: 0,
          explain: `The determinant is $${fPlain(DET.N)}$, so the factor is $\\frac{1}{${fPlain(DET.N)}}$. Dropping its sign changes all four entries.`,
        },
        earns: ["W1"],
      },
      {
        n: 4,
        working: `Check: $N^{-1}N = ${mTex(identity(2))}$.`,
        decision: "It earns no mark of its own. If the check gives anything other than the identity, the sign of the determinant is the first place to look.",
      },
    ],
    finalAnswer: `$N^{-1} = ${mTex(Ni)}$`,
    twin: {
      stem: `Find $F^{-1}$ for $F = ${mTex(F)}$.`,
      answer: matrixAnswer(Fi),
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
        stem: `Three quick checks on what this lesson is built from. None of them is the new method, so answer from what you already know.\nWhat is $(${fPlain(N[0][0])}) \\times (${fPlain(N[1][1])})$?`,
        skill: "Multiplying two negatives",
        options: [
          { id: "a", text: `$${fVal(N[0][0]) * fVal(N[1][1])}$`, correct: true, feedback: `Two negatives multiply to a positive.` },
          { id: "b", text: `$${-(fVal(N[0][0]) * fVal(N[1][1]))}$`, correct: false, feedback: `The two minus signs cancel, so the product is positive.` },
          { id: "c", text: `$${fVal(N[0][0]) + fVal(N[1][1])}$`, correct: false, feedback: `That is the sum. The determinant multiplies along each diagonal.` },
        ],
        secondsExpected: 20, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "p2",
        stem: `What is $\\frac{1}{4}$ of $-3$, written as a decimal?`,
        skill: "Dividing a negative by a whole number",
        options: [
          { id: "a", text: "$-0.75$", correct: true, feedback: `Dividing a negative number leaves it negative.` },
          { id: "b", text: "$0.75$", correct: false, feedback: `The sign is unchanged by dividing, so the answer stays negative.` },
          { id: "c", text: "$-1.33$", correct: false, feedback: `That is $-4$ divided by $3$. Here it is $-3$ divided by $4$.` },
        ],
        secondsExpected: 25, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "p3",
        stem: `Which matrix is the identity for two by two multiplication?`,
        skill: "Recognising the identity",
        options: [
          opt("a", identity(2), true, `Ones on the leading diagonal, zeros elsewhere. Multiplying by it changes nothing.`),
          opt("b", mat([[1, 1], [1, 1]]), false, `Every entry is one, which is not the identity: multiplying by it changes the matrix.`),
          opt("c", mat([[0, 0], [0, 0]]), false, `That is the zero matrix. It sends everything to zero.`),
        ],
        secondsExpected: 25, confidence: true, hypercorrectionQueue: true,
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
        stem: `What is $\\det A$ for $A = ${mTex(A)}$?`,
        skill: "The determinant",
        options: [
          { id: "a", text: `$${fPlain(DET.A)}$`, correct: true, feedback: `$ad - bc$, with the leading diagonal first.` },
          { id: "b", text: `$${fPlain(E.aDetReversed)}$`, correct: false, misconception: "fm.matrix.determinant-sign-reversed", feedback: `That is $bc - ad$, taken the other way round.` },
          { id: "c", text: `$${productsAdded(A)}$`, correct: false, misconception: "fm.matrix.determinant-products-added", feedback: `That is $ad + bc$, with the two products added. The determinant subtracts them: $${fVal(A[0][0]) * fVal(A[1][1])} - ${fVal(A[0][1]) * fVal(A[1][0])} = ${fPlain(DET.A)}$.` },
        ],
        secondsExpected: 25, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d2",
        stem: `A matrix has determinant $0$. What follows?`,
        skill: "The singular case",
        options: [
          { id: "a", text: "It has no inverse, and it is called singular", correct: true, feedback: `The formula divides by the determinant, so there is nothing to divide by.` },
          { id: "b", text: "Its inverse is the zero matrix", correct: false, misconception: "fm.matrix.singular-not-recognised", feedback: `No matrix at all multiplies it to give the identity, so there is no inverse to name.` },
          { id: "c", text: "Its inverse is the identity", correct: false, misconception: "fm.matrix.singular-not-recognised", feedback: `The identity is its own inverse. A singular matrix has none.` },
        ],
        secondsExpected: 25, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d3",
        stem: `Which of these is $A^{-1}$ for $A = ${mTex(A)}$, where $\\det A = ${fPlain(DET.A)}$?`,
        skill: "The three actions",
        options: [
          opt("a", Ai, true, `Swapped, negated and then divided by $${fPlain(DET.A)}$.`),
          opt("b", adj2(A), false, `Swapped and negated, and then never divided by the determinant.`, "fm.matrix.inverse-not-divided-by-det"),
          opt("c", E.aNotSwapped.map((r) => r.map((v) => frac(v.n, v.d * fVal(DET.A)))), false, `The signs changed but the leading diagonal never swapped.`, "fm.matrix.adjugate-not-swapped"),
          opt("d", E.aFactorOnOne, false, `Only the first entry was divided by the determinant; the other three were left as they were.`, "fm.matrix.det-factor-on-one-entry-only"),
        ],
        secondsExpected: 40, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d4",
        stem: `A matrix has determinant $${fPlain(DET.N)}$. What factor goes in front of the swapped and negated matrix?`,
        skill: "Keeping the sign of a negative determinant",
        options: [
          { id: "a", text: `$\\frac{1}{${fPlain(DET.N)}}$`, correct: true, feedback: `The reciprocal of a negative number is negative, and the brackets keep it that way.` },
          { id: "b", text: `$\\frac{1}{${fPlain(fNeg(DET.N))}}$`, correct: false, misconception: "fm.matrix.reciprocal-sign-dropped", feedback: `The minus sign has been dropped. That single slip changes all four entries, and the reports name it directly.` },
          { id: "c", text: `$${fPlain(DET.N)}$`, correct: false, misconception: "fm.matrix.inverse-not-divided-by-det", feedback: `The determinant multiplies rather than divides here. The factor is its reciprocal.` },
        ],
        secondsExpected: 30, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d5",
        stem: `How do you check that a matrix you have written down really is the inverse?`,
        skill: "The check",
        options: [
          { id: "a", text: "Multiply it by the original matrix and look for the identity", correct: true, feedback: `That is the definition of an inverse, and it catches sign slips in seconds.` },
          { id: "b", text: "Add it to the original matrix and look for the zero matrix", correct: false, feedback: `An inverse undoes a multiplication, not an addition.` },
          { id: "c", text: "Check that every entry is the reciprocal of the original entry", correct: false, misconception: "fm.matrix.elementwise-product", feedback: `An inverse is not built entry by entry; the whole matrix works together.` },
        ],
        secondsExpected: 25, confidence: true, hypercorrectionQueue: true,
      },
    ],
  },
];

const findTheMistake = [
  {
    id: `ftm.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: REFS,
    stem: `Daithí was asked to find $N^{-1}$, where $N = ${mTex(N)}$. His working:`,
    studentWorking: [
      `det N = (${fPlain(N[0][0])})(${fPlain(N[1][1])}) - (${fPlain(N[0][1])})(${fPlain(N[1][0])}) = ${fPlain(DET.N)}`,
      `swap and negate: ${mPlain(adj2(N))}`,
      `N inverse = 1/${fPlain(fNeg(DET.N))} x ${mPlain(adj2(N))}`,
      `N inverse = ${mPlain(E.nSignDropped)}`,
    ],
    mistakeLine: 3,
    misconception: "fm.matrix.reciprocal-sign-dropped",
    whatWentWrong: `Lines 1 and 2 are both right: the determinant is correct, sign included, and the swapping and negating is exactly right. Line 1 carries the first of the two marks.\nLine 3 writes the reciprocal as $\\frac{1}{${fPlain(fNeg(DET.N))}}$, dropping the minus sign that line 1 had already found. The factor is $\\frac{1}{${fPlain(DET.N)}}$.\nBecause the factor multiplies all four entries, one dropped sign makes every entry wrong: the answer should be $${mPlain(Ni)}$.`,
    correction: [
      `N inverse = 1/(${fPlain(DET.N)}) x ${mPlain(adj2(N))}`,
      `N inverse = ${mPlain(Ni)}`,
    ],
    marksEarnedAsWritten: ["MW1"],
    feedback: `The determinant is right, sign included, so the first mark stands; the second is for the finished inverse, and line 3 is where it went. The fix is a pair of brackets: write the factor as one over the determinant in brackets, sign attached, straight after you work the determinant out. Then check by multiplying back — the identity will not appear if a sign is wrong.`,
    source: CER25,
  },
];

const prompts = [
  { id: `rp.${TOPIC}.01`, kind: "formula", prompt: "How is the determinant of a two by two matrix worked out?", answer: "It is $ad - bc$: the leading diagonal multiplied, take away the other diagonal multiplied.", keyWords: ["ad - bc", "diagonal"], difficultyPrior: 3 },
  { id: `rp.${TOPIC}.02`, kind: "formula", prompt: "Give the three actions that turn a two by two matrix into its inverse.", answer: "Swap the leading diagonal, change the signs on the other diagonal, and divide every entry by the determinant.", keyWords: ["swap", "signs", "divide"], difficultyPrior: 4 },
  { id: `rp.${TOPIC}.03`, kind: "qa", prompt: "When does a matrix have no inverse, and what is it called?", answer: "When its determinant is zero, because the formula divides by the determinant. Such a matrix is called singular.", keyWords: ["zero", "singular"], difficultyPrior: 4 },
  { id: `rp.${TOPIC}.04`, kind: "trap", prompt: "A determinant comes out as $-5$. What is the factor in front of the swapped and negated matrix?", answer: "$\\frac{1}{-5}$, with the minus sign kept. Writing $\\frac{1}{5}$ changes the sign of all four entries.", keyWords: ["-5", "minus"], difficultyPrior: 6 },
  { id: `rp.${TOPIC}.05`, kind: "procedure", prompt: "How do you check an inverse you have just written down?", answer: "Multiply it by the original matrix. The answer should be the identity, with ones on the leading diagonal and zeros elsewhere.", keyWords: ["multiply", "identity"], difficultyPrior: 4 },
  { id: `rp.${TOPIC}.06`, kind: "trap", prompt: "What does the Unit 1 formula sheet give you about matrices?", answer: "Nothing. The determinant and the inverse formula are both recall, which is why they are worth holding as a picture of three actions.", keyWords: ["nothing", "recall"], difficultyPrior: 5 },
  { id: `rp.${TOPIC}.07`, kind: "procedure", prompt: "A question asks why an equation involving a matrix cannot be solved. What two things does the answer need?", answer: "That the determinant is zero, and the name of the matrix whose determinant it is: for example, B has no inverse because det B = 0.", keyWords: ["determinant", "name"], difficultyPrior: 6 },
];

/* ---- bundle ------------------------------------------------------------------------------------------------- */

const noteChecks = [
  check("schema", "Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, gate ids g1 to g5 are unique, every prompt block names a prompt in this bundle, the recap is a heading and one paragraph of five lines before the closing section, and every gate restates the matrix it works on."),
  check("scope-tier", "FM1 is untiered and calculator-allowed. FM1-MAT-02 is the inverse of a 2 by 2 only, and every matrix here is 2 by 2. The determinant as an area scale factor, the transformation reading of a singular matrix, 3 by 3 determinants and inverses, the adjugate by name, transposes and invariant lines are all outside the specification and appear nowhere; the enrichment dossier marks each of them notonspec."),
  check("formula-sheet", "The Unit 1 sheet carries nothing about matrices: mk.fm1.matrix-inverse in packs/further-maths/exam-true/formula-sheets.json is explicitly noted as 'not on the sheet'. The note says so in a why callout, because recall is itself examinable here."),
  check("command-words", "Calculate, Find, Write down, Identify and Explain are the command words, with the tariffs from packs/further-maths/exam-true/command-words.json. The stems keep the shape of the inverse parts read in the Summer 2019, 2023 and 2025 FM1 papers while every matrix and entry is our own; the 2025 matrix in particular is not reused."),
  check("tariff", "1 mark for a determinant, 2 for an inverse (the determinant, then the finished inverse), 2 for the value of k that makes a matrix singular and 2 for the explanation, matching Summer 2019 Q5, Summer 2023 Q6(ii) (1 mark for the explanation) and Summer 2025 Q5(i) (2 marks for the inverse)."),
  check("maths-numeric", `Every determinant and inverse is computed in exact rational arithmetic by matlib.mjs, and every inverse was proved by back-multiplication both ways (A A^-1 = A^-1 A = I) before it was printed: det A = ${fPlain(DET.A)}, det N = ${fPlain(DET.N)}, det G = ${fPlain(DET.G)}, det B = ${fPlain(DET.B)}, det F = ${fPlain(DET.F)}, det S = 0, det H = 0. Every inverse entry was asserted to terminate, because a table cell is compared as a number.`),
  check("examiner-alignment", "One examiner callout stands in the body beside the dividing step (Summer 2025 Q5, the reciprocal of a negative determinant). Every other finding is a Sheet trap. Gates g1 and g2 fix the identity and the determinant, g3 the singular case, g4 which diagonal is negated and g5 the sign of a negative determinant."),
  check("copy-shingle", "An 8-word shingle scan of the note and the bundle against every text file of the private FM corpus (scratchpad/fm1-batch-g/lib.mjs shingleClash) returns nothing; every matrix here is new, and the Summer 2025 matrix is deliberately not among them."),
  check("style-lint", "British English, second person, calm; no exclamation marks and no verdict word about a learner's answer. Every maths segment opens and closes inside one line, holds no prose words, and carries no TeX command without its backslash (scratchpad/fm1-batch-g/bare-tex.mjs). Six inline SVG figures, all drawn from the computed matrices, and one embeddable video from data/links/media-map.json followed immediately by a gate."),
];

const itemChecks = (detail) => [
  check("schema", "Validated by pipeline/build-content.mts against the Zod Question / WorkedExample / DiagnosticSet / FindTheMistake schema; every scheme sums to its part's marks and the skeleton matches the parts."),
  check("maths-numeric", detail),
  check("command-words", "Command words and tariffs taken from packs/further-maths/exam-true/command-words.json; the wording is ours."),
  check("examiner-alignment", "Every common error and every tagged distractor carries a registry misconception evidenced by the Summer 2019 Q5, Summer 2023 Q6 or Summer 2025 Q5 report block, and each tag names the error its route executes (products added, subtraction reversed, reciprocal sign dropped). The one untagged distractor, the additive check in the post-check, has no registry misconception that describes it."),
  check("copy-shingle", "8-word shingle scan against the private FM corpus returns nothing."),
  check("style-lint", "KaTeX segments paired, prose-free and backslash-complete; British English; no exclamation marks. Every whole-matrix answer is a matrix spec marked entry by entry, and a fraction in front of the brackets is multiplied through by the marker (probe-matrix-kind.mts), so the stem's promise about fractions holds."),
];

const verification = [
  verLog(`ver.note.${TOPIC}`, `note.${TOPIC}`, noteChecks),
  verLog(`ver.we.${TOPIC}.01`, `we.${TOPIC}.01`, itemChecks(`The worked example inverts ${mPlain(A)}: det ${fPlain(DET.A)}, adjugate ${mPlain(adj2(A))}, inverse ${mPlain(Ai)}, and the check A^-1 A = I was computed, not asserted. The twin inverts ${mPlain(B)} to ${mPlain(Bi)}.`)),
  verLog(`ver.we.${TOPIC}.02`, `we.${TOPIC}.02`, itemChecks(`The second worked example inverts ${mPlain(N)}, whose determinant is ${fPlain(DET.N)}: the inverse is ${mPlain(Ni)}, and the dropped-sign route gives ${mPlain(E.nSignDropped)}, which the step contrasts. The twin inverts ${mPlain(F)} to ${mPlain(Fi)}.`)),
  ...builtQuestions.map((q) =>
    verLog(
      `ver.${q.id}`,
      q.id,
      itemChecks(
        `Every value was computed by matlib.mjs: ${q.parts
          .map((p) => `${p.id} -> ${p.answer.kind === "table" ? p.answer.cells.map((c) => c.value).join(", ") : p.answer.kind === "numeric" ? p.answer.value : "the option the scheme names"}`)
          .join("; ")}. Each distractor and common error was produced by executing the route its feedback describes (routes.* in matlib.mjs) and re-checked against the published JSON by verify-published.mjs.`,
      ),
    ),
  ),
  // 23 Sep (job 3): the diagnostics, find-the-mistake items and prompts, never logged before, so never shipped.
  ...draftLogs({ diagnostics, findTheMistake: findTheMistake, prompts, verifier: "The matrices were added, multiplied and inverted again from the matrices printed in the items' own stems (scratchpad/fm1-batch-g/probe-drafts-0923.mts), and the rest checked by hand in the read-through." }),
];

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: TOPIC,
    slug: SLUG,
    title: "Determinant and inverse of a 2 × 2 matrix",
    subject: "further-maths",
    unit: "FM1",
    tier: "untiered",
    strand: "Matrices",
    statementIds: REFS,
    prerequisites: ["fm.u1.matrix-arithmetic"],
    order: 46,
    hardness: "L",
    difficulty: 2,
    examinerFlagged: true,
    examinerSources: [CER19, CER23, CER25],
    examWeightHint:
      "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. The inverse is almost always part (i) of a two-part matrix question whose later part depends on it: Summer 2025 Q5(i) (2 marks, described as very well answered, with a few writing 1 over 26 where the determinant was minus 26), Summer 2019 Q5 (a few arithmetic slips in the determinant), Summer 2023 Q6(ii) (1 mark for explaining why an equation could not be solved, where the wording often failed to name the matrix). The Summer 2019 scheme gave two MW marks for the inverse, with follow-through into the part that uses it.",
    mustMemorise: [
      "det of a 2 × 2 with entries a, b, c, d is ad − bc",
      "The inverse is 1/(ad − bc) times the matrix with a and d swapped and b and c negated",
      "det = 0 means the matrix is singular and has no inverse",
      "Neither the determinant nor the inverse formula is on the formula sheet",
      "A⁻¹A and AA⁻¹ both give the identity, which is the check",
    ],
    onFormulaSheet: [],
    notOnThisSpec: [
      "3 × 3 determinants and inverses, which the Teacher Guidance excludes",
      "The determinant as an area scale factor, and the transformation reading of a singular matrix",
      "The adjugate or adjoint by name, and the transpose",
      "Invariant points and invariant lines",
    ],
    externalRefs: [
      {
        kind: "youtube",
        videoId: "jLTXaXNPgLo",
        channel: "corbettmaths",
        credit: "Inverse of a 2x2 Matrix, corbettmaths (embeddable id verified in data/links/media-map.json)",
      },
      {
        kind: "youtube",
        videoId: "T7cleO736w4",
        channel: "corbettmaths",
        credit: "The Determinant of a 2x2 Matrix, corbettmaths (embeddable id verified in data/links/media-map.json)",
      },
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports",
        asOf: "2026-09-20",
      },
    ],
    keywords: ["determinant", "inverse", "singular", "adjugate", "swap and negate"],
  },
  note: {
    id: `note.${TOPIC}`,
    topic: TOPIC,
    title: "Determinant and inverse of a 2 × 2 matrix",
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
        "det = ad − bc, worked on its own line with its sign",
        "Swap the leading diagonal, negate the other, divide by the determinant",
        "det = 0 means singular: no inverse",
        "A⁻¹A gives the identity, which is the check",
      ],
    },
    notOnThisSpec: [
      "3 × 3 determinants and inverses",
      "The determinant as an area scale factor",
      "The adjugate by name, and the transpose",
      "Invariant points and lines",
    ],
    hardness: "L",
    examinerFlagged: true,
    externalRefs: [
      {
        kind: "youtube",
        videoId: "jLTXaXNPgLo",
        channel: "corbettmaths",
        credit: "Inverse of a 2x2 Matrix, corbettmaths (embeddable id verified in data/links/media-map.json)",
      },
    ],
    sheet: {
      mustBeAbleTo: [
        "Work out the determinant of a 2 × 2 matrix as ad − bc, on its own line",
        "Keep the sign of a determinant that comes out negative",
        "Say that a matrix with a zero determinant is singular and has no inverse",
        "Name the matrix that has no inverse when a question asks why an equation cannot be solved",
        "Swap the leading diagonal and negate the other diagonal",
        "Divide every entry by the determinant, keeping the factor whole",
        "Write the reciprocal of a negative determinant with its minus sign",
        "Find the value of a letter that makes a matrix singular",
        "Check an inverse by multiplying back to the identity",
      ],
      howExamined:
        "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. The inverse is almost always part (i) of a two-part matrix question, and the later part depends on it, so the marks there ride on this one: Summer 2025 Q5(i) (2 marks, very well answered), Summer 2019 Q5 (a few arithmetic slips in the determinant), Summer 2023 Q6(ii) (1 mark for explaining why an equation could not be solved). The Summer 2019 scheme gave two MW marks for the inverse, and later parts are marked on follow-through. Neither the determinant nor the inverse formula is given anywhere in the paper.",
      traps: [
        "The reciprocal of a negative determinant written without its minus sign, as 1 over 26 where the determinant was minus 26 (Summer 2025 FM1 Q5)",
        "Arithmetic slips in ad − bc, especially when entries are negative (Summer 2019 FM1 Q5)",
        "Saying the determinant is zero without naming the matrix it belongs to (Summer 2023 FM1 Q6)",
        "Negating the leading diagonal instead of the other one",
        "Swapping the diagonal but leaving the signs of b and c unchanged",
        "Handing in the swapped and negated matrix without dividing by the determinant",
        "Dividing one entry by the determinant and leaving the other three",
        "Writing decimals where the determinant does not divide nicely, instead of exact fractions",
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
  verification,
};

/* ---- checks and write --------------------------------------------------------------------------------------- */

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
console.log(`  dets: A=${fPlain(DET.A)} N=${fPlain(DET.N)} G=${fPlain(DET.G)} B=${fPlain(DET.B)} F=${fPlain(DET.F)} S=0 H=0`);
console.log(`  inverses (each back-multiplied to I): A=${mPlain(Ai)} N=${mPlain(Ni)} G=${mPlain(Gi)} B=${mPlain(Bi)} F=${mPlain(Fi)}`);
