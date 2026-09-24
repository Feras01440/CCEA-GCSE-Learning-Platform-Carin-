/**
 * FM1 batch G — topic 4: matrix-simultaneous-equations (difficulty 3 -> S).
 * Enrichment: data/enrichment/further-maths/matrix-simultaneous-equations.md (ccea-only; read the
 * command first, transcribe the coefficients rather than solving, line the equations up, then it is
 * matrix-equations unchanged, un-box x and y, and check by substituting back).
 * Every inverse is back-multiplied to the identity and every solution is substituted into BOTH
 * original equations before it is printed.
 */
import {
  OUT, PAPER, check, draftLogs, log as verLog, writeJson, lintTree, figure, svgWrap, svgText, svgPath, svgRect, num,
  shingleClash, corpusFiles,
} from "./lib.mjs";
import {
  mat, dims, mMul, mEq, identity, det2, adj2, inv2, checkInverse, mTex, mPlain, invTex,
  matrixBox, matrixRowSvg, routes, matrixAnswer, matrixError, MATRIX_NOTE, frac, fVal, fPlain, fNeg,
  DET_NEGATIONS,
} from "./matlib.mjs";
import fs from "node:fs";

/** 22 Sep fix pass: the registry id for every slip made while writing the pair as AX = B (fm1-g-matrices-1 class MI-2). */
const MISFORMED = "fm.matrix.coefficient-matrix-misformed";

const SLUG = "matrix-simultaneous-equations";
const TOPIC = "fm.u1.matrix-simultaneous-equations";
const REFS = ["FM1-MAT-04"];
const CER18 = "ccea-cer:further-maths:2018-summer:FM1:Q5";
const CER23 = "ccea-cer:further-maths:2023-summer:FM1:Q6";
const CER25 = "ccea-cer:further-maths:2025-summer:FM1:Q5";

/* ---- the systems, solved and checked ------------------------------------------------------------ */

/**
 * A pair ax + by = e, cx + dy = f solved the way the topic teaches: build A and B, invert A,
 * pre-multiply. The answer is then put back into BOTH original equations before it is used.
 */
function system({ a, b, e, c, d, f, names = ["x", "y"] }) {
  const A = mat([[a, b], [c, d]]);
  const B = mat([[e], [f]]);
  const Ai = checkInverse(A);
  const X = mMul(Ai, B);
  const x = fVal(X[0][0]);
  const y = fVal(X[1][0]);
  if (Math.abs(a * x + b * y - e) > 1e-9) throw new Error(`the first equation fails at x = ${x}, y = ${y}`);
  if (Math.abs(c * x + d * y - f) > 1e-9) throw new Error(`the second equation fails at x = ${x}, y = ${y}`);
  for (const v of [x, y]) if (Math.abs(v - Math.round(v * 1e6) / 1e6) > 1e-12) throw new Error(`solution ${v} does not terminate`);
  return { A, B, Ai, X, x, y, a, b, c, d, e, f, det: det2(A), names };
}

const S1 = system({ a: 4, b: 3, e: 18, c: 2, d: 5, f: 16 });        // det 14, x = 3, y = 2
const S2 = system({ a: 3, b: 2, e: 12, c: 1, d: -1, f: -1 });       // det -5, x = 2, y = 3
const S3 = system({ a: 5, b: 2, e: 11, c: 3, d: 4, f: 15 });        // needs lining up first
const S4 = system({ a: 4, b: 1, e: 9, c: 0, d: 2, f: 6 });          // a missing term, so a zero
const S5 = system({ a: 3, b: 2, e: 19, c: 5, d: 4, f: 33, names: ["n", "p"] }); // a context
// The twin's leading diagonal entries differ, so "swapped" and "not swapped" are visibly different
// matrices and the distractors built from it cannot collide with the right answer.
const TWIN = system({ a: 2, b: 3, e: 14, c: 3, d: 5, f: 22 });      // det 1

/** The singular pair: parallel lines, so no unique solution. */
const SING = { a: 2, b: 3, e: 7, c: 4, d: 6, f: 11 };
const SING_A = mat([[SING.a, SING.b], [SING.c, SING.d]]);
if (det2(SING_A).n !== 0) throw new Error("the singular pair is not singular");

/** The pair as the paper prints it, and as a plain line for a figure. */
const eqTex = (s, i) =>
  i === 1
    ? `${s.a === 1 ? "" : s.a}${s.names[0]} ${s.b < 0 ? "-" : "+"} ${Math.abs(s.b) === 1 ? "" : Math.abs(s.b)}${s.names[1]} = ${s.e}`
    : `${s.c === 0 ? "" : s.c === 1 ? "" : s.c}${s.c === 0 ? "" : s.names[0]}${s.c === 0 ? "" : " "}${s.c === 0 ? "" : s.d < 0 ? "- " : "+ "}${Math.abs(s.d) === 1 ? "" : Math.abs(s.d)}${s.names[1]} = ${s.f}`;
/** Both equations, written the way a paper stacks them. */
const pairTex = (s) => `${eqTex(s, 1)}\\\\${eqTex(s, 2)}`;
const pairLines = (s) => [eqTex(s, 1), eqTex(s, 2)];

/* ---- error routes, executed ------------------------------------------------------------------------ */

const E = {
  /** The coefficient matrix transposed: the columns read down instead of across. */
  s1Transposed: mat([[S1.a, S1.c], [S1.b, S1.d]]),
  /** The constants written into the coefficient matrix's second column. */
  s1ConstantsInside: mat([[S1.a, S1.e], [S1.c, S1.f]]),
  /** The inverse multiplied on the wrong side, so B A^-1 is formed. */
  s1OrderReversed: routes.orderReversed(S1.A, S1.B),
};
if (mEq(E.s1Transposed, S1.A)) throw new Error("the transposed coefficient matrix equals the right one");

/* ---- figures ----------------------------------------------------------------------------------------- */

const rr = (v) => Math.round(v * 10) / 10;

/** The transcription: two equations on the left, three matrices on the right. */
function translateSvg(s) {
  const out = [];
  const lines = pairLines(s);
  out.push(svgText(26, 54, lines[0], { size: 16, anchor: "start" }));
  out.push(svgText(26, 84, lines[1], { size: 16, anchor: "start" }));
  out.push(svgText(96, 26, "the pair as printed", { size: 10.5 }));
  out.push(svgPath("M 186 68 L 232 68 M 222 61 L 232 68 L 222 75", { width: 1.5 }));
  out.push(svgText(209, 54, "copy", { size: 10 }));
  const boxA = matrixBox(s.A, { x: 248, y: 42, cell: 42, rowH: 30 });
  out.push(boxA.svg);
  out.push(svgText(248 + boxA.w / 2, 30, "coefficients", { size: 10.5 }));
  const boxX = matrixBox(mat([["x"], ["y"]].map((r) => r.map(() => 0))), { x: 248 + boxA.w + 12, y: 42, cell: 34, rowH: 30 });
  // the variable column is drawn by hand so it can hold letters
  const vx = 248 + boxA.w + 12;
  out.push(`<path d='M ${vx + 9} 42 L ${vx} 42 L ${vx} 102 L ${vx + 9} 102' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  out.push(`<path d='M ${vx + 25} 42 L ${vx + 34} 42 L ${vx + 34} 102 L ${vx + 25} 102' stroke='currentColor' stroke-width='1.4' fill='none'/>`);
  out.push(svgText(vx + 17, 62, s.names[0], { size: 15 }));
  out.push(svgText(vx + 17, 92, s.names[1], { size: 15 }));
  out.push(svgText(vx + 17, 30, "unknowns", { size: 10.5 }));
  const ex = vx + 34 + 14;
  out.push(svgText(ex, 72, "=", { size: 16 }));
  const boxB = matrixBox(s.B, { x: ex + 16, y: 42, cell: 40, rowH: 30 });
  out.push(boxB.svg);
  out.push(svgText(ex + 16 + boxB.w / 2, 30, "constants", { size: 10.5 }));
  out.push(svgText(300, 134, "nothing is solved here: the numbers are copied where they stand", { size: 11.5 }));
  return svgWrap(
    "0 0 600 148",
    `Two simultaneous equations beside the three matrices they become: the coefficients in a two by two box, the unknowns in a column, and the constants in a column on the other side of the equals sign`,
    out.join(""),
  );
}

/** Lining the equations up, and a missing term written as a zero. */
function lineUpSvg() {
  const out = [];
  out.push(svgRect(22, 36, 258, 92, { width: 1.2, fill: "currentColor", opacity: 0.05 }));
  out.push(svgText(151, 30, "as printed", { size: 10.5 }));
  out.push(svgText(151, 66, "5x = 11 − 2y", { size: 15 }));
  out.push(svgText(151, 94, "2y = 6", { size: 15 }));
  out.push(svgText(151, 118, "not ready to copy", { size: 10.5 }));
  out.push(svgPath("M 292 82 L 330 82 M 320 75 L 330 82 L 320 89", { width: 1.5 }));
  out.push(svgRect(344, 36, 234, 92, { width: 1.2, fill: "currentColor", opacity: 0.05 }));
  out.push(svgText(461, 30, "lined up", { size: 10.5 }));
  out.push(svgText(461, 66, "5x + 2y = 11", { size: 15 }));
  out.push(svgText(461, 94, "0x + 2y = 6", { size: 15 }));
  out.push(svgText(461, 118, "a missing term is a zero", { size: 10.5 }));
  out.push(svgText(300, 154, "four slots in the box, and all four have to be filled", { size: 11.5 }));
  return svgWrap(
    "0 0 600 168",
    `Two equations as printed beside the same two lined up: the terms in x and y on the left of each equals sign, and a missing term written as zero`,
    out.join(""),
  );
}

/** The final un-boxing: a column becomes two named values. */
function unboxSvg(s) {
  const out = [];
  const box = matrixBox(s.X, { x: 150, y: 40, cell: 44, rowH: 32, label: "X" });
  out.push(box.svg);
  out.push(svgPath("M 226 72 L 282 72 M 272 65 L 282 72 L 272 79", { width: 1.5 }));
  out.push(svgText(254, 58, "read it off", { size: 10 }));
  out.push(svgRect(300, 46, 200, 52, { width: 1.2, fill: "currentColor", opacity: 0.07 }));
  out.push(svgText(400, 78, `${s.names[0]} = ${fPlain(s.X[0][0])}, ${s.names[1]} = ${fPlain(s.X[1][0])}`, { size: 17 }));
  out.push(svgText(400, 38, "the answer line", { size: 10.5 }));
  out.push(svgText(300, 128, "a column is not the answer until the two values are named", { size: 11.5 }));
  return svgWrap(
    "0 0 600 142",
    `The solution column beside the same two numbers written out as named values on the answer line`,
    out.join(""),
  );
}

/** The command that decides everything: two stems side by side. */
function commandSvg() {
  const out = [];
  out.push(svgRect(22, 38, 258, 86, { width: 1.2, fill: "currentColor", opacity: 0.05 }));
  out.push(svgText(151, 32, "one instruction", { size: 10.5 }));
  out.push(svgText(151, 68, "Solve these equations", { size: 14 }));
  out.push(svgText(151, 100, "any correct method earns the marks", { size: 10.5 }));
  out.push(svgRect(344, 38, 234, 86, { width: 1.2, fill: "currentColor", opacity: 0.05 }));
  out.push(svgText(461, 32, "the other", { size: 10.5 }));
  out.push(svgText(461, 68, "Using a matrix method,", { size: 14 }));
  out.push(svgText(461, 86, "solve these equations", { size: 14 }));
  out.push(svgText(461, 112, "only the matrix route earns anything", { size: 10.5 }));
  out.push(svgText(300, 150, "the same pair of equations, and only one of them lets you eliminate", { size: 11.5 }));
  return svgWrap(
    "0 0 600 164",
    `Two versions of the same question side by side: one saying solve these equations, the other saying use a matrix method, with a note that only the matrix route earns marks in the second`,
    out.join(""),
  );
}

const TRANSLATE_SVG = translateSvg(S1);
const LINEUP_SVG = lineUpSvg();
const UNBOX_SVG = unboxSvg(S1);
const COMMAND_SVG = commandSvg();
const SOLVE_SVG = matrixRowSvg(
  [{ M: S1.Ai, label: "the inverse", cell: 52 }, "×", { M: S1.B, label: "constants" }, "=", { M: S1.X, label: "X" }],
  {
    title: `The inverse of the coefficient matrix multiplied by the column of constants, giving the solution column`,
    note: "the inverse goes in front, exactly as in a matrix equation",
    cell: 52,
  },
);

/* ---- note ---------------------------------------------------------------------------------------------- */

const blocks = [
  {
    type: "hero",
    lede: "Two equations in two unknowns can be written as a single matrix equation: the coefficients in a box, the unknowns in a column, the constants in another. Once it is in that shape there is nothing new to learn — it is solved with an inverse, exactly like any matrix equation.",
    can: [
      "Read a pair of equations straight into a coefficient matrix and two columns",
      "Solve the matrix equation with an inverse and read the two values off",
      "Say why the instruction to use matrices makes every other method worth nothing",
    ],
    minutes: 15,
  },
  { type: "h", text: "When the question names the method" },
  {
    type: "p",
    md: `You can already solve two equations in two unknowns by elimination. This topic is not about a better way; it is about what to do when the question **tells you** to use matrices.\nWhen it does, a perfect elimination earns nothing at all. So the first thing to read is the instruction, not the equations.`,
  },
  {
    type: "figure",
    alt: `Two versions of the same question side by side: one saying solve these equations, the other saying use a matrix method, with a note that only the matrix route earns marks in the second.`,
    svg: COMMAND_SVG,
    caption: `Same equations. Only one of them leaves you free to eliminate.`,
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: `One tap to begin. A question says "using a matrix method, solve these equations", and a candidate solves them correctly by elimination. What does that earn?`,
    options: ["Nothing", "Full marks, because the answer is right", "Half the marks"],
    answer: "Nothing",
    explain: `A named method is part of the question. The examiners report full, correct elimination solutions scoring zero on exactly this instruction.`,
  },
  { type: "h", text: "1. Copy the numbers into three boxes" },
  {
    type: "p",
    md: `The translation is mechanical. The coefficients of $x$ and $y$ go into a $2 \\times 2$ box in the order they are written. The unknowns go into a column, and the constants into a column on the other side.\nNothing is worked out and nothing is cancelled. If you find yourself doing arithmetic at this stage, you are solving rather than copying.`,
  },
  {
    type: "figure",
    alt: `Two simultaneous equations beside the three matrices they become: the coefficients in a two by two box, the unknowns in a column, and the constants in a column.`,
    svg: TRANSLATE_SVG,
    caption: `$AX = B$, read straight off the page.`,
  },
  {
    type: "gate",
    id: "g2",
    kind: "number",
    prompt: `For the pair $${eqTex(S1, 1)}$ and $${eqTex(S1, 2)}$, the coefficients go into a $2 \\times 2$ matrix. What number sits in row 2, column 1 of it?`,
    answer: fPlain(S1.A[1][0]),
    explain: `Row 2 is the second equation and column 1 is the $x$ column, so it is the coefficient of $x$ there, which is $${fPlain(S1.A[1][0])}$.`,
  },
  { type: "h", text: "2. Line them up before you copy" },
  {
    type: "p",
    md: `The copying only works if both equations are in the form $ax + by = c$, with the letters in the same order on the left and the number alone on the right.\nSo $5x = 11 - 2y$ is rewritten as $5x + 2y = 11$ first. A missing term is a **zero**, not a gap: the box has four slots and all four are filled.`,
  },
  {
    type: "figure",
    alt: `Two equations as printed beside the same two lined up, with a missing term written as zero.`,
    svg: LINEUP_SVG,
    caption: `Rearrange first, then copy.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why a missing term has to be a zero",
    md: `The product multiplies row by column, so every row needs an entry in both columns to reproduce its equation. An empty slot would change the shape of the matrix, and the product would no longer be the pair you started from.`,
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: `An equation in a pair reads $2y = 6$, with no term in $x$. What number goes in its $x$ slot in the coefficient matrix?`,
    answer: "0",
    explain: `Zero. Writing $0x + 2y = 6$ keeps the row complete, and the product still reproduces the equation.`,
  },
  { type: "h", text: "3. Now it is a matrix equation" },
  {
    type: "p",
    md: `From here there is nothing new. The equation is $AX = B$, so $X = A^{-1}B$: find the determinant, build the inverse, and pre-multiply both sides.\nThe inverse goes in front of the column of constants, as always, and the product of a $2 \\times 2$ with a $2 \\times 1$ is the $2 \\times 1$ column you are after.`,
  },
  {
    type: "figure",
    alt: `The inverse of the coefficient matrix multiplied by the column of constants, giving the solution column.`,
    svg: SOLVE_SVG,
    caption: `The same three steps as any matrix equation.`,
  },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: `The coefficient matrix for the pair above is $${mTex(S1.A)}$. What is its determinant?`,
    answer: fPlain(S1.det),
    explain: `$(${fPlain(S1.A[0][0])})(${fPlain(S1.A[1][1])}) - (${fPlain(S1.A[0][1])})(${fPlain(S1.A[1][0])}) = ${fPlain(S1.det)}$. A determinant of zero would mean no unique solution.`,
  },
  { type: "h", text: "4. The column is not the answer yet" },
  {
    type: "p",
    md: `The product gives a column. The question asked for two values, so name them: $${S1.names[0]} = ${fPlain(S1.X[0][0])}$ and $${S1.names[1]} = ${fPlain(S1.X[1][0])}$.\nThen check. Put both values into **both** original equations: $${S1.a}(${fPlain(S1.X[0][0])}) + ${S1.b}(${fPlain(S1.X[1][0])}) = ${S1.e}$, and the second works as well. Twenty seconds, and it catches every slip above it.`,
  },
  {
    type: "figure",
    alt: `The solution column beside the same two numbers written out as named values on the answer line.`,
    svg: UNBOX_SVG,
    caption: `Read the column off, top for $${S1.names[0]}$ and bottom for $${S1.names[1]}$.`,
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025, Unit 1, Question 5",
    md: "The inverse in part (i) was very well done. Part (ii) said to use a matrix method, and many solved by substitution or elimination instead: those answers received no marks. Of those who did use matrices, several struggled with the layout.",
    source: CER25,
  },
  {
    type: "video",
    videoId: "OQmK37wH_WA",
    title: "Using Matrices to Solve Simultaneous Equations - Corbettmaths",
    channel: "corbettmaths",
    why: "The whole route once, from the pair of equations to the two values, with the layout written out.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `Solving a pair gives the column $${mTex(S1.X)}$, where the top entry is $${S1.names[0]}$ and the bottom is $${S1.names[1]}$. What is the value of $${S1.names[1]}$?`,
    answer: fPlain(S1.X[1][0]),
    explain: `The bottom entry is $${S1.names[1]}$, so $${S1.names[1]} = ${fPlain(S1.X[1][0])}$. Writing the column alone would leave the answer line unanswered.`,
  },
  { type: "h", text: "5. When there is no unique solution" },
  {
    type: "p",
    md: `If the determinant of the coefficient matrix is zero, the matrix has no inverse and the method stops. That is not a mistake in your working: it is the pair telling you something.\nTwo equations whose coefficients are in the same ratio are parallel lines, so they never meet at a single point. Say that, and name the matrix whose determinant is zero.`,
  },
  {
    type: "figure",
    alt: `A pair of equations whose coefficient matrix has determinant zero, with the two equations shown to be multiples of one another.`,
    svg: matrixRowSvg(
      [{ M: SING_A, label: "coefficients" }],
      {
        title: `The coefficient matrix of a pair whose determinant is zero, so the two equations describe parallel lines`,
        note: `every entry of row 2 is twice the entry above it, so the determinant is zero`,
      },
    ),
    caption: `One row is a multiple of the other, so the determinant is zero.`,
  },
  {
    type: "gate",
    id: "g6",
    kind: "choice",
    prompt: `The coefficient matrix of a pair of equations has determinant zero. What does that mean?`,
    options: ["There is no unique solution", "The solution is zero", "One unknown must be negative"],
    answer: "There is no unique solution",
    explain: `No inverse exists, so the matrix method stops. The two equations describe parallel lines, which never meet at a single point.`,
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: `Read the instruction first, and use matrices whenever the question names them.\nLine both equations up, writing a missing term as a zero.\nCopy the coefficients, the unknowns and the constants into three matrices.\nSolve with the inverse, in front, and read the two values off the column.\nCheck both values in both original equations, and say when there is no unique solution.`,
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: `This comes as "find the inverse" and then "hence, using a matrix method, solve", for about $2 + 4$ marks, and the second part is locked to the matrix route. The working runs from the pair written as $AX = B$ to $x$ and $y$ named on the answer line. Stuck? Copy the coefficients into a box: once the pair is $AX = B$, the method marks are within reach.`,
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.05` },
  { type: "prompt", promptId: `rp.${TOPIC}.07` },
];

/* ---- items ------------------------------------------------------------------------------------------------ */

const ENTRY_NOTE = MATRIX_NOTE;
const MATRIX_INSTRUCTION = "You must use a matrix method.";
/** The answer line of a solve part, which names both unknowns so a column alone is not offered. */
const pairNote = (s) => `Give the values of $${s.names[0]}$ and $${s.names[1]}$.`;

/** The solution of a pair, encoded as the engine's coordinate-pair form so she may write either
 *  the tuple or the paper's own "x = …, y = …" answer line. */
const pairAnswer = (s) => ({
  kind: "algebraic",
  latex: `(${fPlain(s.X[0][0])}, ${fPlain(s.X[1][0])})`,
  equivalence: "equivalent",
  variables: s.names,
});

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
const ceA = (misconception, latex, feedback, marks, source) => ({
  misconception,
  pattern: { kind: "algebraic", latex },
  feedback,
  marksTypicallyEarned: marks,
  source,
});

const opt = (id, M, correct, feedback, misconception) => ({
  id,
  text: `$${mTex(M)}$`,
  correct,
  feedback,
  ...(misconception ? { misconception } : {}),
});

const LOCK = {
  instruction: "You must use a matrix method.",
  requiredMethod: "Write the pair as AX = B, find the inverse of the coefficient matrix and compute X = A inverse times B. Elimination and substitution earn nothing.",
  evidence: CER25,
};

const questions = [
  {
    id: `q.${TOPIC}.0001`, difficulty: 1, style: "practice", commandWords: ["Write down"],
    setting: "The transcription on its own, before any solving",
    parts: [{
      id: "main",
      stem: `A pair of simultaneous equations is\n$${eqTex(S1, 1)}$\n$${eqTex(S1, 2)}$\nThis pair is to be written as $AX = B$.\nWrite down the coefficient matrix $A$.\n${ENTRY_NOTE}`,
      marks: 1,
      answer: matrixAnswer(S1.A),
      scheme: [{ id: "W1", code: "W", marks: 1, for: `$${mTex(S1.A)}$` }],
      hints: ["Copy the coefficients in the order they are written, one equation to a row."],
      workedSolution: `Row 1 holds the coefficients of the first equation and row 2 those of the second, so $A = ${mTex(S1.A)}$.`,
      commonErrors: [
        matrixError(MISFORMED, E.s1Transposed, `The coefficients have been read down the columns instead of across the rows. One equation fills one row, so $A = ${mTex(S1.A)}$.`, 0, CER25),
        matrixError(MISFORMED, E.s1ConstantsInside, `The constants have gone into the coefficient matrix. They belong in a column of their own on the other side of the equals sign.`, 0, CER25),
      ],
      requiresWorking: false,
    }],
  },
  {
    id: `q.${TOPIC}.0002`, difficulty: 2, style: "practice", commandWords: ["Write down"],
    setting: "A pair that has to be rearranged before the coefficients can be copied",
    parts: [{
      id: "main",
      stem: `A pair of simultaneous equations is\n$${S3.a}${S3.names[0]} = ${S3.e} - ${S3.b}${S3.names[1]}$\n$${eqTex(S3, 2)}$\nThis pair is to be written as $AX = B$.\nWrite down the coefficient matrix $A$.\n${ENTRY_NOTE}`,
      marks: 2,
      answer: matrixAnswer(S3.A),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `the first equation rearranged to $${eqTex(S3, 1)}$` },
        { id: "W1", code: "W", marks: 1, for: `$${mTex(S3.A)}$`, ft: true },
      ],
      hints: [`Both equations need the letters on the left and the number alone on the right.`],
      workedSolution: `The first equation rearranges to $${eqTex(S3, 1)}$.\nCopying both rows of coefficients, $A = ${mTex(S3.A)}$.`,
      commonErrors: [
        // The transcription mark follows through from her own rearrangement, so this route keeps
        // the second mark and loses the first; the marker awards it per correct entry.
        matrixError(MISFORMED, mat([[S3.a, -S3.b], [S3.c, S3.d]]), `The term in $${S3.names[1]}$ crossed the equals sign without changing sign. Moving $-${S3.b}${S3.names[1]}$ across makes it $+${S3.b}${S3.names[1]}$, so the first row is $${S3.a}$ and $${S3.b}$. The copying itself follows through and keeps a mark.`, 1, CER25),
      ],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0003`, difficulty: 2, style: "practice", commandWords: ["Write down"],
    setting: "A pair with a missing term, which has to be written as a zero",
    parts: [{
      id: "main",
      stem: `A pair of simultaneous equations is\n$${eqTex(S4, 1)}$\n$${S4.d}${S4.names[1]} = ${S4.f}$\nThis pair is to be written as $AX = B$.\nWrite down the coefficient matrix $A$.\n${ENTRY_NOTE}`,
      marks: 2,
      answer: matrixAnswer(S4.A),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `the missing term written as $0${S4.names[0]}$` },
        { id: "W1", code: "W", marks: 1, for: `$${mTex(S4.A)}$`, ft: true },
      ],
      hints: [`The second equation has no term in $${S4.names[0]}$, so its coefficient is zero.`],
      workedSolution: `The second equation is $0${S4.names[0]} + ${S4.d}${S4.names[1]} = ${S4.f}$.\nSo the coefficient matrix has all four slots filled: $A = ${mTex(S4.A)}$.`,
      commonErrors: [],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0004`, difficulty: 2, style: "practice", commandWords: ["Calculate"],
    setting: "The determinant of a coefficient matrix, which decides whether the method can run",
    parts: [{
      id: "main",
      stem: `The coefficient matrix of a pair of simultaneous equations is $A = ${mTex(S2.A)}$.\nCalculate $\\det A$.`,
      marks: 1,
      answer: numAns(fVal(S2.det)),
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${fPlain(S2.det)}$` }],
      hints: ["Leading diagonal multiplied, take away the other diagonal multiplied."],
      workedSolution: `$\\det A = (${fPlain(S2.A[0][0])})(${fPlain(S2.A[1][1])}) - (${fPlain(S2.A[0][1])})(${fPlain(S2.A[1][0])}) = ${fPlain(S2.det)}$.`,
      commonErrors: [
        ce("fm.matrix.determinant-sign-reversed", fVal(routes.detSignReversed(S2.A)), `That is $bc - ad$, the subtraction the other way round. The determinant is $${fPlain(S2.det)}$, and its sign has to survive into the inverse.`, 0, CER25),
      ],
      requiresWorking: false,
    }],
  },
  {
    id: `q.${TOPIC}.0005`, difficulty: 3, style: "practice", commandWords: ["Solve"],
    setting: "The whole route on a pair with a positive determinant",
    methodLock: LOCK,
    parts: [{
      id: "main",
      stem: `Solve the simultaneous equations\n$${eqTex(S1, 1)}$\n$${eqTex(S1, 2)}$\n${MATRIX_INSTRUCTION}\n${pairNote(S1)}`,
      marks: 5,
      answer: pairAnswer(S1),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$${mTex(S1.A)}\\begin{pmatrix}${S1.names[0]} \\\\ ${S1.names[1]}\\end{pmatrix} = ${mTex(S1.B)}$, with the unknowns in the middle column` },
        { id: "M2", code: "M", marks: 1, for: `$\\det A = ${fPlain(S1.det)}$`, dependsOn: ["MW1"] },
        { id: "M3", code: "M", marks: 1, for: `$A^{-1} = ${invTex(S1.A)}$`, dependsOn: ["M2"] },
        { id: "M4", code: "M", marks: 1, for: `$X = A^{-1}B$, with the inverse in front`, dependsOn: ["M3"] },
        { id: "W1", code: "W", marks: 1, for: `$${S1.names[0]} = ${fPlain(S1.X[0][0])}$, $${S1.names[1]} = ${fPlain(S1.X[1][0])}$`, ft: true },
      ],
      hints: ["Copy the coefficients and the constants into matrices first.", "Then it is a matrix equation: find the inverse and pre-multiply.", "Read the two values off the column and name them."],
      workedSolution: `Writing the pair as $AX = B$ gives $A = ${mTex(S1.A)}$ and $B = ${mTex(S1.B)}$.\n$\\det A = ${fPlain(S1.det)}$, so $A^{-1} = ${invTex(S1.A)}$.\n$X = A^{-1}B = ${mTex(S1.X)}$, so $${S1.names[0]} = ${fPlain(S1.X[0][0])}$ and $${S1.names[1]} = ${fPlain(S1.X[1][0])}$.\nChecking in both equations: $${S1.a}(${fPlain(S1.X[0][0])}) + ${S1.b}(${fPlain(S1.X[1][0])}) = ${S1.e}$ and $${S1.c}(${fPlain(S1.X[0][0])}) + ${S1.d}(${fPlain(S1.X[1][0])}) = ${S1.f}$.`,
      commonErrors: [
        ceA("fm.matrix.values-in-wrong-slots", `(${fPlain(S1.X[1][0])}, ${fPlain(S1.X[0][0])})`, `The two values are right and they have swapped places. The top entry of the column is $${S1.names[0]}$ and the bottom is $${S1.names[1]}$, so $${S1.names[0]} = ${fPlain(S1.X[0][0])}$.`, 4, CER25),
      ],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0006`, difficulty: 3, style: "practice", commandWords: ["Solve"],
    setting: "A pair whose coefficient matrix has a negative determinant",
    methodLock: LOCK,
    parts: [{
      id: "main",
      stem: `Solve the simultaneous equations\n$${eqTex(S2, 1)}$\n$${eqTex(S2, 2)}$\n${MATRIX_INSTRUCTION}\n${pairNote(S2)}`,
      marks: 5,
      answer: pairAnswer(S2),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `the pair written as $AX = B$` },
        { id: "M2", code: "M", marks: 1, for: `$\\det A = ${fPlain(S2.det)}$`, dependsOn: ["MW1"] },
        { id: "M3", code: "M", marks: 1, for: `$A^{-1} = ${invTex(S2.A)}$`, dependsOn: ["M2"] },
        { id: "M4", code: "M", marks: 1, for: `$X = A^{-1}B$`, dependsOn: ["M3"] },
        { id: "W1", code: "W", marks: 1, for: `$${S2.names[0]} = ${fPlain(S2.X[0][0])}$, $${S2.names[1]} = ${fPlain(S2.X[1][0])}$`, ft: true },
      ],
      hints: ["The determinant comes out negative here, and the minus sign stays with it.", "Check both values in both equations at the end."],
      workedSolution: `$A = ${mTex(S2.A)}$ and $B = ${mTex(S2.B)}$.\n$\\det A = ${fPlain(S2.det)}$, so $A^{-1} = ${invTex(S2.A)}$.\n$X = A^{-1}B = ${mTex(S2.X)}$, so $${S2.names[0]} = ${fPlain(S2.X[0][0])}$ and $${S2.names[1]} = ${fPlain(S2.X[1][0])}$.\nBoth original equations check out with those values.`,
      commonErrors: [
        ceA("fm.matrix.values-in-wrong-slots", `(${fPlain(S2.X[1][0])}, ${fPlain(S2.X[0][0])})`, `Both values are right and they are the wrong way round. The top of the column is $${S2.names[0]}$.`, 4, CER25),
      ],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0007`, difficulty: 3, style: "practice", commandWords: ["Identify"],
    setting: "What the instruction to use matrices rules out",
    parts: [{
      id: "main",
      stem: `A question reads "using a matrix method, solve these simultaneous equations".\nA candidate solves them correctly by elimination and gets both values right.\nIdentify what that answer earns.`,
      marks: 1,
      answer: {
        kind: "mcq",
        shuffle: true,
        options: [
          { id: "a", text: "No marks at all", correct: true, feedback: `A named method is part of the question. The examiners report exactly this: correct elimination, no marks.` },
          { id: "b", text: "Full marks, because both values are right", correct: false, misconception: "fm.matrix.method-instruction-ignored", feedback: `The answer is not what is being marked here. The method named in the question is.` },
          { id: "c", text: "The final accuracy mark only", correct: false, misconception: "fm.matrix.method-instruction-ignored", feedback: `Nothing is available when the required method is not used, not even the answer mark.` },
        ],
      },
      scheme: [{ id: "W1", code: "W", marks: 1, for: "no marks" }],
      hints: ["Read what the question told her to do."],
      workedSolution: `The instruction names the method, so only the matrix route earns marks.\nA correct answer reached by elimination earns no marks at all.`,
      commonErrors: [],
      requiresWorking: false,
    }],
  },
  {
    id: `q.${TOPIC}.0008`, difficulty: 4, style: "practice", commandWords: ["Explain"],
    setting: "A pair that the matrix method cannot solve, and why",
    parts: [{
      id: "main",
      stem: `A pair of simultaneous equations is\n$${SING.a}x + ${SING.b}y = ${SING.e}$\n$${SING.c}x + ${SING.d}y = ${SING.f}$\nExplain why these equations cannot be solved by a matrix method.`,
      marks: 2,
      answer: {
        kind: "text",
        accepted: [
          "the determinant of the coefficient matrix is 0, so it has no inverse and there is no unique solution",
          "det A = 0, so the coefficient matrix is singular and cannot be inverted",
        ],
        // 22 Sep (the MA-3 / MI-5 class): the determinant and its value zero are the MW1 idea, one mark each and
        // cancelled by a negation; the consequence is W1, worth two group marks so that the scheme's own accepts
        // ("the coefficient matrix is singular", "the lines are parallel") earn 1 of 2 on their own. Groups total 4,
        // so all three ideas give 2, the determinant idea alone or the consequence alone give 1, and a lone
        // "zero" or "det" gives 0.
        keyWords: [
          { any: ["determinant", "det"], marks: 1, reject: DET_NEGATIONS },
          { any: ["0", "zero"], marks: 1, reject: DET_NEGATIONS },
          {
            any: ["no inverse", "not invertible", "cannot be inverted", "cant be inverted", "not have an inverse", "doesnt have an inverse", "singular", "no unique solution", "not a unique solution", "no solution", "parallel"],
            marks: 2,
            reject: ["not singular", "not parallel"],
          },
        ],
        listingRule: false,
      },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\det A = ${SING.a * SING.d} - ${SING.b * SING.c} = 0$` },
        { id: "W1", code: "W", marks: 1, for: `no inverse exists, so there is no unique solution`, accept: ["the coefficient matrix is singular", "the lines are parallel"] },
      ],
      hints: ["Work out the determinant of the coefficient matrix.", "Say what a determinant of zero rules out."],
      workedSolution: `The coefficient matrix is $${mTex(SING_A)}$, and its determinant is $${SING.a * SING.d} - ${SING.b * SING.c} = 0$.\nThe determinant of the coefficient matrix is 0, so it has no inverse and there is no unique solution.\nThe two equations describe parallel lines, which never meet at a single point.`,
      commonErrors: [],
      requiresWorking: true,
    }],
  },
  {
    id: `q.${TOPIC}.0009`, difficulty: 3, style: "exam-style", commandWords: ["Find", "Solve"],
    setting: "The inverse, then the pair it solves, which is how the papers set this",
    methodLock: LOCK,
    parts: [
      {
        id: "a",
        stem: `The matrix $A = ${mTex(TWIN.A)}$.\nFind $A^{-1}$.\n${ENTRY_NOTE}`,
        marks: 2,
        answer: matrixAnswer(TWIN.Ai),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$\\det A = ${fPlain(TWIN.det)}$` },
          { id: "W1", code: "W", marks: 1, for: `$${mTex(TWIN.Ai)}$`, ft: true },
        ],
        hints: ["Determinant first, then swap and negate."],
        workedSolution: `$\\det A = (${fPlain(TWIN.A[0][0])})(${fPlain(TWIN.A[1][1])}) - (${fPlain(TWIN.A[0][1])})(${fPlain(TWIN.A[1][0])}) = ${fPlain(TWIN.det)}$.\nSwapping and negating gives $A^{-1} = ${mTex(TWIN.Ai)}$.`,
        commonErrors: [
          matrixError("fm.matrix.adjugate-not-negated", routes.adjNotNegated(TWIN.A), `The leading diagonal swapped and $b$ and $c$ kept their signs. The other diagonal changes sign, giving $${mTex(TWIN.Ai)}$.`, 1, CER18),
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: `Hence solve the simultaneous equations\n$${eqTex(TWIN, 1)}$\n$${eqTex(TWIN, 2)}$\n${MATRIX_INSTRUCTION}\n${pairNote(TWIN)}`,
        marks: 4,
        answer: pairAnswer(TWIN),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `the pair written as $AX = B$ with $B = ${mTex(TWIN.B)}$` },
          { id: "M2", code: "M", marks: 1, for: `$X = A^{-1}B$, using the inverse from part (a)`, dependsOn: ["MW1"] },
          { id: "M3", code: "M", marks: 1, for: "the product worked row by column", dependsOn: ["M2"] },
          { id: "W1", code: "W", marks: 1, for: `$${TWIN.names[0]} = ${fPlain(TWIN.X[0][0])}$, $${TWIN.names[1]} = ${fPlain(TWIN.X[1][0])}$`, ft: true },
        ],
        hints: [`The coefficients are already the matrix $A$ from part (a).`, "Put the constants in a column and pre-multiply."],
        workedSolution: `The pair is $AX = B$ with $B = ${mTex(TWIN.B)}$.\nUsing the inverse from part (a), $X = A^{-1}B = ${mTex(TWIN.Ai)}${mTex(TWIN.B)} = ${mTex(TWIN.X)}$.\nSo $${TWIN.names[0]} = ${fPlain(TWIN.X[0][0])}$ and $${TWIN.names[1]} = ${fPlain(TWIN.X[1][0])}$, and both values satisfy both equations.`,
        commonErrors: [
          ceA("fm.matrix.values-in-wrong-slots", `(${fPlain(TWIN.X[1][0])}, ${fPlain(TWIN.X[0][0])})`, `Both values are right and they are the wrong way round. The top of the column is $${TWIN.names[0]}$.`, 3, CER25),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  },
  {
    id: `q.${TOPIC}.0010`, difficulty: 4, style: "exam-style", commandWords: ["Write down", "Solve"],
    setting: "A context in two unknown prices, formed and then solved by the named method",
    methodLock: LOCK,
    parts: [
      {
        id: "a",
        stem: `A stationer sells notebooks at $${S5.names[0]}$ pounds each and pens at $${S5.names[1]}$ pounds each.\n${S5.a} notebooks and ${S5.b} pens cost ${S5.e} pounds.\n${S5.c} notebooks and ${S5.d} pens cost ${S5.f} pounds.\nWrite down two equations in $${S5.names[0]}$ and $${S5.names[1]}$.`,
        marks: 2,
        answer: {
          kind: "text",
          accepted: [
            `${S5.a}n + ${S5.b}p = ${S5.e} and ${S5.c}n + ${S5.d}p = ${S5.f}`,
            `${S5.a}n + ${S5.b}p = ${S5.e}, ${S5.c}n + ${S5.d}p = ${S5.f}`,
          ],
          // 22 Sep: the same equation written in the other order, or with the total on the left, is the same mark.
          keyWords: [
            { any: [`${S5.a}n + ${S5.b}p = ${S5.e}`, `${S5.b}p + ${S5.a}n = ${S5.e}`, `${S5.e} = ${S5.a}n + ${S5.b}p`, `${S5.e} = ${S5.b}p + ${S5.a}n`], marks: 1 },
            { any: [`${S5.c}n + ${S5.d}p = ${S5.f}`, `${S5.d}p + ${S5.c}n = ${S5.f}`, `${S5.f} = ${S5.c}n + ${S5.d}p`, `${S5.f} = ${S5.d}p + ${S5.c}n`], marks: 1 },
          ],
          listingRule: false,
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$${S5.a}${S5.names[0]} + ${S5.b}${S5.names[1]} = ${S5.e}$` },
          { id: "W1", code: "W", marks: 1, for: `$${S5.c}${S5.names[0]} + ${S5.d}${S5.names[1]} = ${S5.f}$` },
        ],
        hints: ["Each sentence about a total cost becomes one equation."],
        workedSolution: `${S5.a} notebooks at $${S5.names[0]}$ pounds and ${S5.b} pens at $${S5.names[1]}$ pounds give ${S5.a}n + ${S5.b}p = ${S5.e} and ${S5.c}n + ${S5.d}p = ${S5.f}.`,
        commonErrors: [],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: `Solve your two equations to find the price of a notebook and the price of a pen.\n${MATRIX_INSTRUCTION}\n${pairNote(S5)}`,
        marks: 5,
        answer: pairAnswer(S5),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `the pair written as $AX = B$ with $A = ${mTex(S5.A)}$` },
          { id: "M2", code: "M", marks: 1, for: `$\\det A = ${fPlain(S5.det)}$`, dependsOn: ["MW1"] },
          { id: "M3", code: "M", marks: 1, for: `$A^{-1} = ${invTex(S5.A)}$`, dependsOn: ["M2"] },
          { id: "M4", code: "M", marks: 1, for: `$X = A^{-1}B$`, dependsOn: ["M3"] },
          { id: "W1", code: "W", marks: 1, for: `$${S5.names[0]} = ${fPlain(S5.X[0][0])}$, $${S5.names[1]} = ${fPlain(S5.X[1][0])}$`, ft: true },
        ],
        hints: ["Copy the coefficients from your two equations into a matrix.", "Then it is a matrix equation."],
        workedSolution: `$A = ${mTex(S5.A)}$ and $B = ${mTex(S5.B)}$.\n$\\det A = ${fPlain(S5.det)}$, so $A^{-1} = ${invTex(S5.A)}$.\n$X = A^{-1}B = ${mTex(S5.X)}$, so a notebook costs ${fPlain(S5.X[0][0])} pounds and a pen costs ${fPlain(S5.X[1][0])} pounds.\nChecking: ${S5.a}(${fPlain(S5.X[0][0])}) + ${S5.b}(${fPlain(S5.X[1][0])}) = ${S5.e} and ${S5.c}(${fPlain(S5.X[0][0])}) + ${S5.d}(${fPlain(S5.X[1][0])}) = ${S5.f}.`,
        commonErrors: [
          ceA("fm.matrix.values-in-wrong-slots", `(${fPlain(S5.X[1][0])}, ${fPlain(S5.X[0][0])})`, `The two prices are right and they belong the other way round: the top of the column is the notebook, at ${fPlain(S5.X[0][0])} pounds.`, 4, CER25),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  },
];

function buildQuestion(q) {
  const totalMarks = q.parts.reduce((s, p) => s + p.marks, 0);
  const verbFor = (p) => (p.stem.includes("Explain") ? "explain" : p.stem.includes("Identify") ? "identify" : p.stem.includes("Write down") ? "write-down" : p.stem.includes("Calculate") ? "calculate" : p.stem.includes("Solve") ? "solve" : "find");
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
    emphasis: q.methodLock ? ["You must use a matrix method"] : [],
    context: { setting: q.setting, original: true },
    figures: q.figures ?? [],
    parts: q.parts,
    totalMarks,
    timeAllowanceSec: Math.round(totalMarks * 1.2 * 60),
    skeleton: q.parts.map((p) => `(${p.id})${verbFor(p)}${p.marks}`).join("|"),
    ...(q.methodLock ? { methodLock: q.methodLock } : {}),
    examinerSources: [CER25, CER23],
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
    stem: `Solve the simultaneous equations\n$${eqTex(S1, 1)}$\n$${eqTex(S1, 2)}$\nYou must use a matrix method.\n${pairNote(S1)}`,
    figure: figure(TRANSLATE_SVG, `Two simultaneous equations beside the three matrices they become: the coefficients in a box, the unknowns in a column and the constants in a column.`),
    steps: [
      {
        n: 1,
        working: `Copy the numbers into three matrices: $${mTex(S1.A)}$ for the coefficients, a column for $${S1.names[0]}$ and $${S1.names[1]}$, and $${mTex(S1.B)}$ for the constants.`,
        decision: "This line is transcription, not mathematics, and it earns a mark before any arithmetic. Both equations are already in the right form here, so nothing has to be rearranged.",
        earns: ["MW1"],
      },
      {
        n: 2,
        working: `$\\det A = (${fPlain(S1.A[0][0])})(${fPlain(S1.A[1][1])}) - (${fPlain(S1.A[0][1])})(${fPlain(S1.A[1][0])}) = ${fPlain(S1.det)}$.`,
        decision: "The determinant on its own line. A zero here would mean the pair has no unique solution, so it is worth knowing before any more work is done.",
        earns: ["M2"],
      },
      {
        n: 3,
        working: `Swap, negate and divide: $A^{-1} = ${invTex(S1.A)}$.`,
        decision: "The same three actions as any inverse. From this point the question is an ordinary matrix equation.",
        whyMenu: {
          options: [
            "Because the pair is now AX = B, and an inverse is what undoes a multiplying matrix",
            "Because the determinant has to be cancelled from both sides",
            "Because the two equations can be added together",
          ],
          correct: 0,
          explain: `Once the pair is written as a matrix equation, nothing about it is new: pre-multiply both sides by the inverse.`,
        },
        earns: ["M3"],
      },
      {
        n: 4,
        working: `$X = A^{-1}B = ${mTex(S1.Ai)}${mTex(S1.B)} = ${mTex(S1.X)}$.`,
        decision: "The inverse goes in front of the constants. The product of a two by two and a column is a column, which is what the two unknowns need.",
        earns: ["M4"],
      },
      {
        n: 5,
        working: `Reading the column off: $${S1.names[0]} = ${fPlain(S1.X[0][0])}$ and $${S1.names[1]} = ${fPlain(S1.X[1][0])}$. Checking in both equations: $${S1.a}(${fPlain(S1.X[0][0])}) + ${S1.b}(${fPlain(S1.X[1][0])}) = ${S1.e}$ and $${S1.c}(${fPlain(S1.X[0][0])}) + ${S1.d}(${fPlain(S1.X[1][0])}) = ${S1.f}$.`,
        decision: `The column is not the answer line. Name both values, and substitute them into both original equations: that check costs twenty seconds and catches every slip above it.`,
        earns: ["W1"],
      },
    ],
    finalAnswer: `$${S1.names[0]} = ${fPlain(S1.X[0][0])}$, $${S1.names[1]} = ${fPlain(S1.X[1][0])}$`,
    twin: {
      stem: `Solve the simultaneous equations $${eqTex(TWIN, 1)}$ and $${eqTex(TWIN, 2)}$, using a matrix method. ${pairNote(TWIN)}`,
      answer: pairAnswer(TWIN),
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
        stem: `Three quick checks on what this lesson is built from. None of them is the new method, so answer from what you already know.\nRearrange $5x = 11 - 2y$ so that both letters are on the left.`,
        skill: "Rearranging a linear equation",
        options: [
          { id: "a", text: "$5x + 2y = 11$", correct: true, feedback: `The term in $y$ crosses the equals sign and changes sign.` },
          { id: "b", text: "$5x - 2y = 11$", correct: false, feedback: `Moving $-2y$ across makes it $+2y$, not $-2y$.` },
          { id: "c", text: "$5x + 2y = -11$", correct: false, feedback: `The $11$ was already on the right and does not move, so its sign is unchanged.` },
        ],
        secondsExpected: 25, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "p2",
        stem: `What is the inverse of $${mTex(TWIN.A)}$?`,
        skill: "The inverse of a 2 by 2",
        options: [
          opt("a", TWIN.Ai, true, `The determinant is $${fPlain(TWIN.det)}$, so swapping and negating is the whole of it.`),
          opt("b", routes.adjNotNegated(TWIN.A), false, `The leading diagonal swapped and the other one kept its signs.`),
          opt("c", routes.adjNotSwapped(TWIN.A), false, `The signs changed and the leading diagonal never swapped.`),
        ],
        secondsExpected: 30, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "p3",
        stem: `A $2 \\times 2$ matrix is multiplied by a $2 \\times 1$ column. What shape is the answer?`,
        skill: "The shape of a product",
        options: [
          { id: "a", text: "$2 \\times 1$", correct: true, feedback: `The inner numbers match and the outer two give the shape, so the answer is a column.` },
          { id: "b", text: "$2 \\times 2$", correct: false, feedback: `The columns of the answer come from the second matrix, which has one.` },
          { id: "c", text: "$1 \\times 2$", correct: false, feedback: `Rows come first: the answer has as many rows as the first matrix.` },
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
        stem: `For the pair $${eqTex(S1, 1)}$ and $${eqTex(S1, 2)}$, which is the coefficient matrix?`,
        skill: "Transcribing the coefficients",
        options: [
          opt("a", S1.A, true, `One equation to a row, in the order the terms are written.`),
          opt("b", E.s1Transposed, false, `The coefficients have been read down the columns instead of across the rows.`, MISFORMED),
          opt("c", E.s1ConstantsInside, false, `The constants have gone into the coefficient matrix. They belong in a column of their own.`, MISFORMED),
        ],
        secondsExpected: 35, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d2",
        stem: `An equation in a pair reads $3y = 12$, with no term in $x$. What goes in its $x$ slot?`,
        skill: "A missing term",
        options: [
          { id: "a", text: "$0$", correct: true, feedback: `A missing term is a zero. The row has to be complete for the product to reproduce the equation.` },
          { id: "b", text: "The slot is left empty", correct: false, misconception: MISFORMED, feedback: `A matrix has no empty slots: leaving one out would change its shape.` },
          { id: "c", text: "$1$", correct: false, misconception: MISFORMED, feedback: `A coefficient of $1$ would put an $x$ into the equation that is not there.` },
        ],
        secondsExpected: 25, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d3",
        stem: `A pair has been written as $AX = B$. What comes next?`,
        skill: "The method once the pair is transcribed",
        options: [
          { id: "a", text: `Find $A^{-1}$ and work out $A^{-1}B$`, correct: true, feedback: `From here it is an ordinary matrix equation, with the inverse in front.` },
          { id: "b", text: `Work out $BA^{-1}$`, correct: false, misconception: "fm.matrix.inverse-order", feedback: `The inverse goes in front of both sides. $BA^{-1}$ is a different product, and here it does not even exist.` },
          { id: "c", text: "Add the two equations to remove one unknown", correct: false, misconception: "fm.matrix.method-instruction-ignored", feedback: `That is elimination. When the question names the matrix method, elimination earns nothing.` },
        ],
        secondsExpected: 30, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d4",
        stem: `Solving a pair gives the column $${mTex(S1.X)}$. What should be written on the answer line?`,
        skill: "Naming the two values",
        options: [
          { id: "a", text: `$${S1.names[0]} = ${fPlain(S1.X[0][0])}$, $${S1.names[1]} = ${fPlain(S1.X[1][0])}$`, correct: true, feedback: `The top entry is $${S1.names[0]}$ and the bottom is $${S1.names[1]}$.` },
          { id: "b", text: `$${S1.names[0]} = ${fPlain(S1.X[1][0])}$, $${S1.names[1]} = ${fPlain(S1.X[0][0])}$`, correct: false, misconception: "fm.matrix.values-in-wrong-slots", feedback: `The two values have swapped. The column is read top to bottom in the order the unknowns were written.` },
          { id: "c", text: `The column $${mTex(S1.X)}$ on its own`, correct: false, misconception: "fm.matrix.values-in-wrong-slots", feedback: `The question asked for two values, so both have to be named. A column is not an answer line.` },
        ],
        secondsExpected: 30, confidence: true, hypercorrectionQueue: true,
      },
      {
        id: "d5",
        stem: `The coefficient matrix of a pair has determinant $0$. What does that tell you?`,
        skill: "The singular case",
        options: [
          { id: "a", text: "There is no unique solution, because the matrix has no inverse", correct: true, feedback: `The two equations describe parallel lines, so they never meet at a single point.` },
          { id: "b", text: "Both unknowns are zero", correct: false, misconception: "fm.matrix.singular-not-recognised", feedback: `The determinant says nothing about the values; it says the method cannot run.` },
          { id: "c", text: "The pair must be solved by elimination instead", correct: false, misconception: "fm.matrix.singular-not-recognised", feedback: `Elimination would not find a unique solution either: there is not one to find.` },
        ],
        secondsExpected: 30, confidence: true, hypercorrectionQueue: true,
      },
    ],
  },
];

const findTheMistake = [
  {
    id: `ftm.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: REFS,
    stem: `Órla was asked to solve $${eqTex(S1, 1)}$ and $${eqTex(S1, 2)}$, using a matrix method. Her working:`,
    studentWorking: [
      `${eqTex(S1, 1)}`,
      `${eqTex(S1, 2)}`,
      `multiply the second equation by 2: ${2 * S1.c}${S1.names[0]} + ${2 * S1.d}${S1.names[1]} = ${2 * S1.f}`,
      `subtract: ${2 * S1.d - S1.b}${S1.names[1]} = ${2 * S1.f - S1.e}, so ${S1.names[1]} = ${fPlain(S1.X[1][0])}`,
      `${S1.names[0]} = ${fPlain(S1.X[0][0])}`,
    ],
    mistakeLine: 3,
    misconception: "fm.matrix.method-instruction-ignored",
    whatWentWrong: `Every line of this is correct arithmetic, and both values at the end are right.\nLine 3 is where the marks go: it starts an elimination. The question named the matrix method, so no part of this route earns anything, however accurate it is.\nThe line that belongs there writes the pair as $AX = B$, with the coefficients in a matrix and the constants in a column.`,
    // 23 Sep (job 3): one step per line, so the fix a learner types ("AX = B", "X = A inverse x B") can match a line.
    // The values are named through the column of unknowns, X = (x ; y) = (3 ; 2), as rp.05 teaches; written as
    // "x = 3 and y = 2" they would let the values she already had count as the fix (tried against markFix).
    correction: [
      `AX = B`,
      `A = ${mPlain(S1.A)} and B = ${mPlain(S1.B)}`,
      `X = A inverse x B`,
      `X = (${S1.names.join(" ; ")}) = ${mPlain(S1.X)}`,
    ],
    marksEarnedAsWritten: [],
    feedback: `This is the hardest kind of mistake to accept, because nothing in it is wrong: the arithmetic is clean and the answer is right. What the examiners mark here is the method the question named, and the report for that series records correct elimination solutions earning nothing at all. Read the instruction before the equations, every time.`,
    source: CER25,
  },
];

const prompts = [
  { id: `rp.${TOPIC}.01`, kind: "procedure", prompt: "How is a pair of simultaneous equations written as a matrix equation?", answer: "The coefficients go into a $2 \\times 2$ matrix, one equation to a row; the unknowns go into a column; the constants go into a column on the other side, giving $AX = B$.", keyWords: ["coefficients", "column", "AX = B"], difficultyPrior: 4 },
  { id: `rp.${TOPIC}.02`, kind: "trap", prompt: "What has to be done to the equations before the coefficients are copied?", answer: "Line them up as $ax + by = c$, with both letters on the left in the same order and the number alone on the right.", keyWords: ["lined up", "left"], difficultyPrior: 5 },
  { id: `rp.${TOPIC}.03`, kind: "trap", prompt: "One equation of a pair has no term in $x$. What goes in its slot?", answer: "A zero. Every slot of the coefficient matrix has to be filled for the product to reproduce the equations.", keyWords: ["zero", "filled"], difficultyPrior: 5 },
  { id: `rp.${TOPIC}.04`, kind: "formula", prompt: "Once the pair is $AX = B$, how is it solved?", answer: "$X = A^{-1}B$: find the determinant, build the inverse, and pre-multiply the column of constants.", keyWords: ["A^-1 B", "pre-multiply"], difficultyPrior: 4 },
  { id: `rp.${TOPIC}.05`, kind: "trap", prompt: "The product gives a column. Why is that not the answer?", answer: "The question asked for two values, so both have to be named: the top entry is the first unknown and the bottom entry the second.", keyWords: ["named", "top"], difficultyPrior: 5 },
  { id: `rp.${TOPIC}.06`, kind: "procedure", prompt: "How do you check a solution found this way?", answer: "Put both values into both original equations. It takes twenty seconds and catches any slip in the inverse or the product.", keyWords: ["both", "original"], difficultyPrior: 4 },
  { id: `rp.${TOPIC}.07`, kind: "trap", prompt: "A question says to use a matrix method and you solve it correctly by elimination. What does that earn?", answer: "Nothing. A named method is part of the question, and the examiners record correct elimination answers scoring zero.", keyWords: ["nothing", "named"], difficultyPrior: 7 },
  { id: `rp.${TOPIC}.08`, kind: "qa", prompt: "What does a determinant of zero mean for a pair of simultaneous equations?", answer: "The coefficient matrix has no inverse, so there is no unique solution: the two equations describe parallel lines.", keyWords: ["no inverse", "unique"], difficultyPrior: 6 },
];

const insight = JSON.parse(fs.readFileSync(`${process.cwd()}/packs/further-maths/insights/u1.matrix-simultaneous-equations.json`, "utf8"));

/* ---- bundle ------------------------------------------------------------------------------------------------- */

const noteChecks = [
  check("schema", "Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, gate ids g1 to g6 are unique, every prompt block names a prompt in this bundle, the recap is a heading and one paragraph of five lines before the closing section, and every gate restates the pair or the column it works on."),
  check("scope-tier", "FM1 is untiered and calculator-allowed. FM1-MAT-04 is 2 by 2 systems written as AX = B and solved with X = A inverse B, and excludes XA = B: every question here is that form. Nothing classifies consistent and inconsistent systems, and nothing goes to three unknowns by matrix methods, both of which the enrichment dossier marks as beyond this specification."),
  check("formula-sheet", "The Unit 1 sheet carries nothing about matrices, so the inverse formula and the whole method are recall."),
  check("command-words", "Solve, Find, Write down, Calculate, Identify and Explain are the command words, with the tariffs from packs/further-maths/exam-true/command-words.json; the Using a matrix method entry in exam-true/method-locks.json is carried on every question whose stem names the method, with the Summer 2025 Q5(ii) evidence."),
  check("tariff", "2 + 4 for the inverse-then-solve pairing and 5 for an unscaffolded solve, matching Summer 2025 Q5 (2 marks for the inverse, 4 for the hence part); the worded context runs 2 + 5, and the singular explanation 2."),
  check("maths-numeric", `Every system is solved by inverting the coefficient matrix and the solution is substituted into BOTH original equations before it is printed: ${[S1, S2, S3, S4, S5, TWIN].map((s) => `${s.names[0]} = ${fPlain(s.X[0][0])}, ${s.names[1]} = ${fPlain(s.X[1][0])} (det ${fPlain(s.det)})`).join("; ")}. Every inverse was proved by back-multiplication both ways, and the singular pair's determinant is asserted to be zero.`),
  check("examiner-alignment", "One examiner callout stands in the body beside the un-boxing step (Summer 2025 Q5, the method instruction ignored and the layout). Every other finding is a Sheet trap. Gate g1 is the instruction itself, g2 and g3 the transcription, g4 the determinant, g5 the naming of the two values and g6 the singular case."),
  check("copy-shingle", "Checked with node scripts/qa/shingles.mjs --topic matrix-simultaneous-equations: no eight-word run is shared with any question paper, mark scheme or Chief Examiner report."),
  check("style-lint", "British English, second person, calm; no exclamation marks and no verdict word about a learner's answer. Every maths segment opens and closes inside one line, holds no prose words, and carries no TeX command without its backslash. Six inline SVG figures, all drawn from the computed systems, and one embeddable video from data/links/media-map.json followed immediately by a gate."),
];

const itemChecks = (detail) => [
  check("schema", "Validated by pipeline/build-content.mts against the Zod Question / WorkedExample / DiagnosticSet / FindTheMistake schema; every scheme sums to its part's marks and the skeleton matches the parts."),
  check("maths-numeric", detail),
  check("command-words", "Command words, tariffs and the method lock taken from packs/further-maths/exam-true/; the wording is ours."),
  check("examiner-alignment", "Every post-check distractor and every common error carries a registry misconception naming the error its route executes, evidenced by the Summer 2025 Q5, Summer 2023 Q6 or Summer 2018 Q5 report block; the slips made while writing the pair as AX = B share one id, which the Summer 2025 report names as layout."),
  check("copy-shingle", "scripts/qa/shingles.mjs reports no shared eight-word run for this topic."),
  check("style-lint", "KaTeX segments paired, prose-free and backslash-complete; British English; no exclamation marks. A solution pair is encoded as the engine's coordinate-pair form, so the paper's own x = …, y = … answer line is accepted."),
];

const verification = [
  verLog(`ver.note.${TOPIC}`, `note.${TOPIC}`, noteChecks),
  verLog(`ver.we.${TOPIC}.01`, `we.${TOPIC}.01`, itemChecks(`The worked example solves ${eqTex(S1, 1)} and ${eqTex(S1, 2)} by inverting ${mPlain(S1.A)} (determinant ${fPlain(S1.det)}) and multiplying ${mPlain(S1.B)}, giving ${mPlain(S1.X)}; both values were substituted into both equations. The twin solves the det ${fPlain(TWIN.det)} pair, giving ${mPlain(TWIN.X)}.`)),
  ...builtQuestions.map((q) =>
    verLog(
      `ver.${q.id}`,
      q.id,
      itemChecks(
        `Every value was computed by matlib.mjs and every solution substituted into both original equations: ${q.parts
          .map((p) => `${p.id} -> ${p.answer.kind === "matrix" ? p.answer.entries.map((r) => r.join(" ")).join(" ; ") : p.answer.kind === "numeric" ? p.answer.value : p.answer.kind === "algebraic" ? p.answer.latex : "the option or wording the scheme names"}`)
          .join("; ")}. Each distractor and common error was produced by executing the route its feedback describes.`,
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
    title: "Solving 2 × 2 simultaneous equations with matrices",
    subject: "further-maths",
    unit: "FM1",
    tier: "untiered",
    strand: "Matrices",
    statementIds: REFS,
    prerequisites: ["fm.u1.matrix-inverse-2x2", "fm.u1.matrix-equations"],
    order: 48,
    hardness: "S",
    difficulty: 3,
    examinerFlagged: true,
    examinerSources: [CER25, CER23],
    examWeightHint:
      "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. The shape is 'find the inverse' then 'hence, using a matrix method, solve', for about 2 + 4 marks: Summer 2025 Q5, where the inverse was very well answered and part (ii) was not, because many solved by substitution or elimination despite the instruction and received no marks, and several who did use matrices struggled with the layout. The report also notes the type had not appeared recently. The questions here give a mark for each stage of the route: the pair written as AX = B, the determinant, the inverse, the product and x and y named.",
    mustMemorise: [
      "Write the pair as AX = B: coefficients in a 2 × 2, unknowns in a column, constants in a column",
      "Line both equations up first, and write a missing term as a zero",
      "Solve with X = A⁻¹B, the inverse in front",
      "Read the column off and name both values on the answer line",
      "When the question names the matrix method, elimination earns nothing",
    ],
    onFormulaSheet: [],
    notOnThisSpec: [
      "Systems of three equations solved by matrix methods",
      "Classifying systems as consistent or inconsistent beyond 'no unique solution'",
      "Equations of the form XA = B",
      "3 × 3 matrices and their inverses",
    ],
    externalRefs: [
      {
        kind: "youtube",
        videoId: "OQmK37wH_WA",
        channel: "corbettmaths",
        credit: "Using Matrices to Solve Simultaneous Equations, corbettmaths (embeddable id verified in data/links/media-map.json)",
      },
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports",
        asOf: "2026-09-20",
      },
    ],
    keywords: ["matrix method", "coefficient matrix", "column vector", "simultaneous"],
  },
  note: {
    id: `note.${TOPIC}`,
    topic: TOPIC,
    title: "Solving 2 × 2 simultaneous equations with matrices",
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
        "Coefficients in a 2 × 2, unknowns in a column, constants in a column",
        "A missing term is a zero",
        "X = A⁻¹B, the inverse in front",
        "Name x and y on the answer line, and check both in both equations",
      ],
    },
    notOnThisSpec: [
      "Three equations by matrix methods",
      "Classifying consistent and inconsistent systems",
      "Equations of the form XA = B",
      "3 × 3 matrices",
    ],
    hardness: "S",
    examinerFlagged: true,
    externalRefs: [
      {
        kind: "youtube",
        videoId: "OQmK37wH_WA",
        channel: "corbettmaths",
        credit: "Using Matrices to Solve Simultaneous Equations, corbettmaths (embeddable id verified in data/links/media-map.json)",
      },
    ],
    sheet: {
      mustBeAbleTo: [
        "Read the instruction and use matrices whenever the question names them",
        "Line both equations up as ax + by = c before copying anything",
        "Write a missing term as a zero coefficient",
        "Copy the coefficients into a 2 × 2 matrix, one equation to a row",
        "Write the unknowns and the constants as two columns, giving AX = B",
        "Find the determinant and the inverse of the coefficient matrix",
        "Work out X = A⁻¹B with the inverse in front",
        "Name both values on the answer line rather than leaving a column",
        "Check both values in both original equations",
        "Say that a zero determinant means no unique solution, and name the matrix",
      ],
      howExamined:
        "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. The shape is 'find the inverse' then 'hence, using a matrix method, solve', for about 2 + 4 marks. Summer 2025 Q5 is the example in our evidence: the inverse was very well answered, and part (ii) was not, because many solved by substitution or elimination despite the instruction and received no marks; several who did use matrices struggled with the layout. The report also records that the type had not appeared recently. The questions here give a mark for each stage of the route (the pair written as AX = B, the determinant, the inverse, the product, and x and y named), with follow-through from the inverse in the earlier part.",
      traps: [
        "Solving by elimination or substitution when the question names the matrix method, which earns nothing at all (Summer 2025 FM1 Q5)",
        "Laying the matrix method out so that the examiner cannot follow it (Summer 2025 FM1 Q5)",
        "Copying coefficients before both equations are lined up as ax + by = c",
        "Leaving a slot empty where an equation has no term in one unknown",
        "Reading the coefficients down the columns instead of across the rows",
        "Writing the constants into the coefficient matrix instead of a column of their own",
        "Multiplying the inverse on the wrong side (Summer 2018 FM1 Q5)",
        "Leaving the answer as a column instead of naming x and y (Summer 2025 FM1 Q5)",
        "Giving the two values the wrong way round (Summer 2025 FM1 Q5)",
        "Explaining why the method fails without naming the matrix whose determinant is zero (Summer 2023 FM1 Q6)",
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

/* ---- checks and write --------------------------------------------------------------------------------------- */

// No option set may repeat a reading: a distractor built by an error route can collide with the
// right answer when the matrix happens to be symmetric in the entries that route touches.
for (const d of diagnostics) {
  for (const it of d.items) {
    const seen = new Set();
    for (const o of it.options) {
      if (seen.has(o.text)) throw new Error(`${d.id}(${it.id}) repeats the option "${o.text}"`);
      seen.add(o.text);
    }
  }
}
for (const q of builtQuestions) {
  for (const p of q.parts) {
    if (p.answer.kind !== "mcq") continue;
    const seen = new Set();
    for (const o of p.answer.options) {
      if (seen.has(o.text)) throw new Error(`${q.id}(${p.id}) repeats the option "${o.text}"`);
      seen.add(o.text);
    }
  }
}

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
console.log(`  solutions (each checked in both equations): ${[S1, S2, S3, S4, S5, TWIN].map((s) => `${s.names[0]}=${fPlain(s.X[0][0])} ${s.names[1]}=${fPlain(s.X[1][0])} (det ${fPlain(s.det)})`).join(" | ")}`);
