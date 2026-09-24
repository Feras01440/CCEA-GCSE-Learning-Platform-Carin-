/**
 * FM3 batch C, topic 3 — pascals-triangle-binomial-expansion (difficulty 1 -> L).
 *   node scratchpad/fm3-batch-c/pascals-triangle-binomial-expansion.mjs      (from the repository root)
 *
 * Every coefficient is ROWS[n][k] from stat.mjs (built by addition, each row asserted symmetric
 * with total 2^n); every expansion is built term by term by expandTex / numberExpansionTex; every
 * algebraic commonError is latexRoute() from routes.mjs, the described slip carried out in code.
 */
import { figure } from "./lib.mjs";
import { ROWS, expandTex, termTex } from "./stat.mjs";
import { triangleFig, gridFig, stripFig } from "./pascalfig.mjs";
import { tableSvg } from "./binfig.mjs";
import { PT, MP, latexRoute, numberExpansionTex, notRaisedTex } from "./routes.mjs";
import { CCEA_DOC, PLINKO, UPDATED, emit, plinkoBlock, src, timeFor, verLog, yt } from "./emit.mjs";

const TOPIC = PT;
const SLUG = "pascals-triangle-binomial-expansion";
const SPEC = ["FM3-BIN-01"];

const q2019 = src("2019-summer", 4);
const q2022 = src("2022-summer", 4);
const q2023 = src("2023-summer", 4);
const q2025 = src("2025-summer", 4);

const PAPER = {
  unit: "FM3",
  calculator: true,
  resources: ["Scientific calculator", "Formula sheet printed on page 2 of the question-and-answer booklet", "Normal Probability Table on page 3 of the booklet"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A row said in words; rows 7 and 8 as a rise and its mirror image (see binomial-probabilities.mjs). */
const rowWords = (n) => {
  const row = ROWS[n];
  if (row.length <= 7) return row.join(", ");
  const half = row.slice(0, Math.ceil(n / 2));
  const words = ["", "one", "two", "three", "four", "five"][half.length];
  return n % 2 === 1 ? `${half.join(", ")}, then the same ${words} in reverse` : `${half.join(", ")}, ${row[n / 2]} in the middle, then the same ${words} in reverse`;
};
/** A row in digits, allowed for rows up to 6 (seven numbers at most). */
const rowDigits = (n) => {
  if (ROWS[n].length > 7) throw new Error(`row ${n} would print eight numbers in a run`);
  return ROWS[n].join(" ");
};
const plain = (tex) => tex.replace(/\^\{(\d+)\}/g, "^$1");

const expansion = (n, opts) => ({ kind: "algebraic", latex: expandTex(n, opts), equivalence: "equivalent", variables: ["p", "q"], form: "expanded" });
const ceTex = (where, misconception, feedback, marks, source, nth = 0) => ({
  misconception,
  pattern: { kind: "algebraic", latex: latexRoute(where, misconception, nth) },
  feedback,
  marksTypicallyEarned: marks,
  source,
});
/** A list of terms with commas and no plus signs: the 'plus signs omitted' route of Summer 2019. */
const LIST_REGEX = "^[^+]*,[^+]*$";
const ceList = (feedback, marks) => ({
  misconception: MP.wrongRow,
  pattern: { kind: "text", regex: LIST_REGEX },
  feedback,
  marksTypicallyEarned: marks,
  source: q2019,
});

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

const figHero = triangleFig({
  maxRow: 8,
  additions: [
    [4, 2],
    [6, 3],
  ],
  title: "Pascal's triangle from row 0 to row 8, rows numbered down the left, with two of the additions drawn: 3 + 3 = 6 in row 4 and 10 + 10 = 20 in row 6",
  caption: "Each number is the sum of the two just above it.",
});
const figRowFacts = triangleFig({
  maxRow: 6,
  highlight: 5,
  notes: [`Row 5 has 6 numbers and reads the same both ways.`, `Its total is ${ROWS[5].join(" + ")} = ${ROWS[5].reduce((a, b) => a + b, 0)}, which is 2⁵.`],
  title: "Pascal's triangle to row 6 with row 5 shaded: six numbers, symmetric, adding up to 32",
});
const figStrip = stripFig({
  n: 4,
  title: "The five terms of (p + q)⁴ in a table: coefficients 1, 4, 6, 4, 1; the power of p falls 4, 3, 2, 1, 0; the power of q rises 0, 1, 2, 3, 4; each pair adds to 4",
  caption: "The coefficients are row 4; the powers always add up to 4.",
});
const numRows = [["term", "row 4", "(2x) to the power", "the term"]];
for (let r = 0; r <= 4; r += 1) {
  const pow = 2 ** r;
  const t = numberExpansionTex(4, 1, 2).split(" + ")[r].replace(/\^\{(\d+)\}/g, (_, d) => ({ 2: "²", 3: "³", 4: "⁴" })[d]);
  numRows.push([String(r + 1), String(ROWS[4][r]), r === 0 ? "1" : `${pow}${r === 1 ? "x" : `x${({ 2: "²", 3: "³", 4: "⁴" })[r]}`}`, t]);
}
const figNumber = tableSvg({
  widths: [60, 80, 150, 130],
  rows: numRows,
  title: "The expansion of (1 + 2x)⁴ term by term: the coefficient from row 4 times the right power of the whole of 2x",
  caption: "Every power acts on the whole of 2x, the 2 as well as the x.",
});

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const exp6 = expandTex(6);
const blocks = [
  {
    type: "hero",
    lede: "Start with a 1, and make every new row by adding the two numbers above. That is Pascal's triangle, and each row is a ready-made set of coefficients: row 5 expands (p + q)⁵ without multiplying out a single bracket. Build the triangle, pick the right row, and write the terms with their powers.",
    can: [
      "Build Pascal's triangle to row 8 by adding pairs, and pick the row for any power",
      "Expand (p + q)ⁿ with every coefficient and power, joined by plus signs",
      "Handle a minus sign or a number inside the bracket, such as (p − q)⁴ or (1 + 2x)⁴",
    ],
    minutes: 0,
  },
  { type: "h", text: "A triangle made by adding" },
  {
    type: "p",
    md: "Start with 1 at the top. Each new row begins and ends with 1, and every number in between is the sum of the two numbers just above it. Keep going and you have Pascal's triangle.",
  },
  {
    type: "figure",
    alt: "Pascal's triangle from row 0 to row 8, each number in a circle, with the rows numbered 0 to 8 down the left. Arrows show 3 and 3 in row 3 adding to 6 in row 4, and 10 and 10 in row 5 adding to 20 in row 6.",
    svg: figHero,
    caption: "Each number is the sum of the two just above it.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "In Pascal's triangle, which two numbers from row 4 add to make the first 10 in row 5?",
    options: ["4 and 6", "5 and 5", "1 and 4"],
    answer: "4 and 6",
    explain: `Row 4 is ${rowDigits(4)}. The first 10 in row 5 sits below the 4 and the 6, and $4 + 6 = 10$.`,
  },

  { type: "h", text: "1. The rows are numbered from 0" },
  {
    type: "p",
    md: "The single 1 at the top is row 0, so row $n$ is the row that starts 1, $n$. Three facts check any row you build: row $n$ has $n + 1$ numbers, it reads the same from either end, and its numbers add up to $2^{n}$.\nThe exam gives you nothing here: the triangle is not on the formula sheet, so you build it every time.",
  },
  {
    type: "figure",
    alt: `Pascal's triangle to row 6 with row 5 shaded. Notes under it: row 5 has 6 numbers and reads the same both ways; its total is ${ROWS[5].join(" + ")} = 32, which is 2 to the power 5.`,
    svg: figRowFacts,
    caption: "Count, mirror, total: three checks on every row.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "number",
    prompt: `Row 7 of Pascal's triangle begins ${ROWS[7].slice(0, 5).join(", ")}. What is the fourth number of row 8?`,
    answer: String(ROWS[8][3]),
    explain: `The fourth number of row 8 sits below the third and fourth numbers of row 7: $${ROWS[7][2]} + ${ROWS[7][3]} = ${ROWS[8][3]}$. Row 8 begins ${ROWS[8].slice(0, 4).join(", ")}.`,
  },

  { type: "h", text: "2. The powers fall and rise" },
  {
    type: "p",
    md: "Row $n$ gives the coefficients of $(p + q)^{n}$ in order. From term to term the power of $p$ falls by 1, from $n$ down to 0, while the power of $q$ rises from 0 to $n$, so in every term the two powers add up to $n$. There are $n + 1$ terms, one for each number in the row.",
  },
  {
    type: "figure",
    alt: "A table of the five terms of (p + q) to the power 4. Coefficients 1, 4, 6, 4, 1. Power of p 4, 3, 2, 1, 0, with an arrow marked falls. Power of q 0, 1, 2, 3, 4, with an arrow marked rises. Each row shows the two powers adding to 4.",
    svg: figStrip,
    caption: "The coefficients are row 4; the powers always add up to 4.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the triangle's numbers",
    md: "Multiplying out $(p + q)^{4}$ means choosing $p$ or $q$ from each of the four brackets. Choosing $q$ from exactly two of them gives $p^{2}q^{2}$, and there are 6 ways to pick those two brackets. The 6 in row 4 counts them, and every entry counts choices the same way.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "choice",
    prompt: "Which of these is the expansion of $(p + q)^{3}$?",
    options: [`$${expandTex(3)}$`, "$p^{3} + q^{3}$", `$${expandTex(3, { coefs: [1, 2, 2, 1] })}$`],
    answer: `$${expandTex(3)}$`,
    explain: `Row 3 is ${rowDigits(3)}, so there are four terms with coefficients 1, 3, 3, 1. Leaving out the middle terms, or using 2s from row 2, loses the coefficient marks.`,
  },

  { type: "h", text: "3. Worked example: the two marks" },
  {
    type: "p",
    md: `**Question.** Complete Pascal's triangle to row 6, and hence write down the expansion of $(p + q)^{6}$.\n**Line 1.** Write the triangle out from row 0 to row 6. It earns a mark of its own.\n**Line 2.** Row 6 is ${rowDigits(6)}: seven numbers, because $n + 1 = 7$.\n**Line 3.** $(p + q)^{6} = ${exp6}$\n**Check.** Seven terms, a plus sign between each pair, and the powers in every term add up to 6.`,
  },
  {
    type: "video",
    videoId: "9Y4bhtNSW8w",
    title: "Pascal's Triangle / Binomial / Probability",
    channel: "P McAleavey",
    why: "A Northern Ireland teacher takes Pascal's triangle, the expansion and binomial probability for CCEA Further Mathematics. As you watch, write the triangle out alongside and check each row with the three facts above.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: "In the expansion of $(p + q)^{7}$, what is the coefficient of the term $p^{2}q^{5}$?",
    answer: String(ROWS[7][5]),
    explain: `Row 7 is ${rowWords(7)}. The term with $q^{5}$ is the sixth term, and its coefficient is ${ROWS[7][5]}; the powers $2 + 5 = 7$ check it.`,
  },

  { type: "h", text: "4. A minus sign, or a number in the bracket" },
  {
    type: "p",
    md: `For $(p - q)^{n}$, think of it as $(p + (-q))^{n}$: odd powers of $-q$ are negative, so the signs alternate. $(p - q)^{4} = ${expandTex(4, { sign: -1 })}$.\nFor $(1 + 2x)^{4}$, each power acts on the whole of $2x$: the third term is $6 \\times (2x)^{2} = 6 \\times 4x^{2} = 24x^{2}$, not $12x^{2}$.`,
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Beyond what CCEA sets",
    md: "Unit 3 has only set $(p + q)^{n}$ with letters. The same rule covers a minus sign or a number in the bracket, and in Unit 1 most candidates once lost a mark by not cubing the 2 in $(2x)^{3}$.",
  },
  {
    type: "figure",
    alt: `A table of the five terms of (1 + 2x) to the power 4: coefficients from row 4, 1, 4, 6, 4, 1, times 1, 2x, 4x², 8x³, 16x⁴, giving ${numberExpansionTex(4, 1, 2).replace(/\^\{(\d+)\}/g, (_, d) => ({ 2: "²", 3: "³", 4: "⁴" })[d])}.`,
    svg: figNumber,
    caption: "Every power acts on the whole of 2x, the 2 as well as the x.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: "In the expansion of $(1 + 3x)^{4}$, what is the coefficient of $x^{2}$?",
    answer: String(ROWS[4][2] * 3 ** 2),
    explain: `The $x^{2}$ term is $${ROWS[4][2]} \\times (3x)^{2} = ${ROWS[4][2]} \\times ${3 ** 2}x^{2} = ${ROWS[4][2] * 9}x^{2}$. Squaring the $x$ but not the 3 would give ${ROWS[4][2] * 3}.`,
  },

  { type: "h", text: "5. The triangle inside a Plinko board" },
  {
    type: "p",
    md: "In the PhET Plinko board a ball bounces left or right at each peg. To finish in a given bin it needs a certain number of right bounces, and the number of different paths with that many right bounces is exactly the entry of Pascal's triangle. With a fair board, the bins fill in the proportions of the row.",
  },
  plinkoBlock(
    "Open the Lab screen. Set 4 rows and a binary probability of 0.5, so the board is fair, and drop a few hundred balls. Before you start, use row 4 of the triangle to predict which bin will be fullest and roughly how its height compares with the two end bins.",
  ),
  {
    type: "gate",
    id: "g6",
    kind: "choice",
    prompt: "On a fair Plinko board with 4 rows, the five bins fill roughly in the ratio 1 : 4 : 6 : 4 : 1. Why?",
    options: [
      "Each bin can be reached by as many different paths as its number in row 4",
      "The pegs are placed closer together near the middle",
      "Balls that land in the middle bins bounce fewer times",
    ],
    answer: "Each bin can be reached by as many different paths as its number in row 4",
    explain: `Every ball bounces 4 times. There are ${ROWS[4][2]} orders of 2 rights and 2 lefts, but only 1 order of 4 rights, so the middle bin collects about ${ROWS[4][2]} times as many balls as an end bin.`,
  },

  { type: "h", text: "You can now" },
  {
    type: "p",
    md: "Build Pascal's triangle to row 8 by adding pairs, starting from row 0.\nCheck a row: $n + 1$ numbers, symmetric, total $2^{n}$.\nExpand $(p + q)^{n}$: row $n$ for the coefficients, the power of $p$ falling and $q$ rising, plus signs between.\nKeep the signs and the whole bracket when the second term is negative or has a number.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The binomial question usually opens with this: complete the triangle for 1 mark, then write down the expansion of $(p + q)^{n}$ for 1 or 2 marks. Write the triangle out in full, because it is a mark in itself, and give the expansion as terms joined by plus signs. Stuck on a row? Build it from the row above, then check the count and the symmetry.",
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.02` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
];
{
  const words = blocks
    .map((b) => (b.type === "p" || b.type === "callout" ? b.md : b.type === "h" ? b.text : ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const gates = blocks.filter((b) => b.type === "gate").length;
  blocks[0].minutes = Math.max(5, Math.round(words / 180 + (gates * 40) / 60));
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

const Q = (id) => `q.${TOPIC}.${id}`;
const W = (id, part = "main") => `${Q(id)}#${part}`;
const qq = (id, extra) => ({ id: Q(id), topic: TOPIC, specRefs: SPEC, tier: "untiered", paper: PAPER, figures: [], version: 1, verification: `ver.${Q(id)}`, ...extra });
const questions = [];

// 0001 — complete the next two rows
{
  const fig = gridFig({ upTo: 6, targets: [7, 8], title: "Pascal's triangle written out to row 6, with an empty grid underneath: Row 1 has 8 boxes for row 7 and Row 2 has 9 boxes for row 8" });
  const cells = [];
  [7, 8].forEach((n, i) => ROWS[n].forEach((v, c) => cells.push({ row: i, col: c, value: v, tolerance: { type: "exact" } })));
  questions.push(
    qq("0001", {
      style: "practice",
      difficulty: 1,
      ao: ["AO1"],
      commandWords: ["Complete"],
      emphasis: ["building rows by addition"],
      context: { setting: "Extending Pascal's triangle by two rows", original: true },
      figures: [figure(fig, "Pascal's triangle written out from row 0 to row 6, then an empty grid: Row 1 has eight boxes for row 7 and Row 2 has nine boxes for row 8, with the columns numbered 1 to 9.")],
      parts: [
        {
          id: "main",
          stem: "Complete the next two rows of Pascal's triangle, rows 7 and 8, in the grid. Row 1 of the grid is row 7 of the triangle and Row 2 is row 8.",
          marks: 2,
          answer: { kind: "table", cells },
          scheme: [
            { id: "MW1", code: "MW", marks: 1, for: `row 7: ${rowWords(7)}` },
            { id: "MW2", code: "MW", marks: 1, for: `row 8: ${rowWords(8)}` },
          ],
          hints: ["Each number is the sum of the two above it.", "Both rows start and end with 1 and are symmetrical."],
          workedSolution: `Row 6 is ${rowDigits(6)}. Adding neighbours gives row 7: ${rowWords(7)}.\nAdding neighbours in row 7 gives row 8: ${rowWords(8)}. Row 8 adds up to ${ROWS[8].reduce((a, b) => a + b, 0)}, which is $2^{8}$.`,
          commonErrors: [],
          requiresWorking: false,
        },
      ],
      totalMarks: 2,
      timeAllowanceSec: timeFor(2),
      skeleton: "(main)complete2",
      examinerSources: [q2022, q2025],
      solutionProgram: `row7 = pairwise sums of [${ROWS[6].join(", ")}]; row8 = pairwise sums of row7; sum(row8) = ${ROWS[8].reduce((a, b) => a + b, 0)}`,
    }),
  );
}

// 0002 — expand (p + q)^5
questions.push(
  qq("0002", {
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Write down"],
    emphasis: ["the row for n", "powers falling and rising"],
    context: { setting: "Expanding a fifth power with Pascal's triangle", original: true },
    parts: [
      {
        id: "main",
        stem: "Use Pascal's triangle to write down the expansion of $(p + q)^{5}$.",
        marks: 1,
        answer: expansion(5),
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${expandTex(5)}$` }],
        hints: [`Row 5 is ${rowDigits(5)}.`, "The power of p falls from 5 to 0 as the power of q rises."],
        workedSolution: `Row 5: ${rowDigits(5)}.\n$(p + q)^{5} = ${expandTex(5)}$`,
        commonErrors: [
          ceTex(W("0002"), MP.wrongRow, `That is the expansion of $(p + q)^{4}$: row 4 has been used. The fifth power needs row 5, ${rowDigits(5)}, and six terms whose powers add up to 5.`, 0, q2019),
          ceList(`Those are the right terms, but an expansion is one expression, so the terms are joined by plus signs: $${expandTex(5)}$.`, 0),
        ],
        requiresWorking: false,
      },
    ],
    totalMarks: 1,
    timeAllowanceSec: timeFor(1),
    skeleton: "(main)write-down1",
    examinerSources: [q2019],
    solutionProgram: `coefficients = row 5 = [${ROWS[5].join(", ")}]; terms p^(5-r) q^r`,
  }),
);

// 0003 — expand (p + q)^7
questions.push(
  qq("0003", {
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Write down"],
    emphasis: ["the row for n", "coefficients", "plus signs"],
    context: { setting: "Expanding a seventh power with Pascal's triangle", original: true },
    parts: [
      {
        id: "main",
        stem: "Use Pascal's triangle to write down the expansion of $(p + q)^{7}$.",
        marks: 2,
        answer: expansion(7),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `the coefficients ${rowWords(7)}` },
          { id: "MW2", code: "MW", marks: 1, for: "the powers of p falling from 7 and of q rising to 7, each pair adding to 7" },
        ],
        hints: ["Build down to row 7, which has eight numbers.", "Check the count: eight terms."],
        workedSolution: `Row 7: ${rowWords(7)}.\n$(p + q)^{7} = ${expandTex(7)}$`,
        commonErrors: [
          ceTex(W("0003"), MP.wrongRow, `That is $(p + q)^{6}$, with seven terms. The seventh power has eight terms and uses row 7, ${rowWords(7)}.`, 0, q2019),
          ceTex(W("0003"), MP.coef, `The powers are all right, which is one of the two marks, but the coefficients are missing. Each term takes its number from row 7: ${rowWords(7)}.`, 1, q2023),
          ceList(`The terms are right, but they are joined by commas. An expansion is one expression, so write plus signs between the terms.`, 1),
        ],
        requiresWorking: false,
      },
    ],
    totalMarks: 2,
    timeAllowanceSec: timeFor(2),
    skeleton: "(main)write-down2",
    examinerSources: [q2019, q2023],
    solutionProgram: `coefficients = row 7; terms p^(7-r) q^r, r = 0..7`,
  }),
);

// 0004 — one term
questions.push(
  qq("0004", {
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Write down"],
    emphasis: ["one term", "powers adding to n"],
    context: { setting: "Picking out one term of an eighth-power expansion", original: true },
    parts: [
      {
        id: "main",
        stem: "Write down the term in $p^{3}q^{5}$ in the expansion of $(p + q)^{8}$.",
        marks: 1,
        answer: { kind: "algebraic", latex: termTex(8, 5), equivalence: "equivalent", variables: ["p", "q"] },
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${termTex(8, 5)}$` }],
        hints: ["Row 8 of the triangle gives the coefficients.", "q to the power 5 is the sixth term, counting from p to the power 8."],
        workedSolution: `Row 8: ${rowWords(8)}.\nThe term with $q^{5}$ is the sixth, so its coefficient is ${ROWS[8][5]}: $${termTex(8, 5)}$.`,
        commonErrors: [
          ceTex(W("0004"), MP.wrongRow, `${ROWS[7][5]} is the sixth number of row 7. An eighth power takes its coefficients from row 8, where the sixth number is ${ROWS[8][5]}.`, 0, q2019),
          ceTex(W("0004"), MP.swap, `That is the term in $p^{5}q^{3}$. The question asks for $p^{3}q^{5}$; the coefficient happens to be the same, but the powers must match the ones asked for.`, 0, q2023),
        ],
        requiresWorking: false,
      },
    ],
    totalMarks: 1,
    timeAllowanceSec: timeFor(1),
    skeleton: "(main)write-down1",
    examinerSources: [q2023, q2019],
    solutionProgram: `coefficient = row 8, position 5 = ${ROWS[8][5]}`,
  }),
);

// 0005 — (p - q)^4
questions.push(
  qq("0005", {
    style: "practice",
    difficulty: 2,
    ao: ["AO1", "AO2"],
    commandWords: ["Expand"],
    emphasis: ["a negative term", "alternating signs"],
    context: { setting: "Expanding a bracket with a minus sign", original: true },
    parts: [
      {
        id: "main",
        stem: "Expand $(p - q)^{4}$.",
        marks: 2,
        answer: expansion(4, { sign: -1 }),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: "the coefficients 1, 4, 6, 4, 1 with the powers of p falling and q rising" },
          { id: "MW2", code: "MW", marks: 1, for: "the signs alternating +, −, +, −, +" },
        ],
        hints: ["Treat it as (p + (−q)) to the power 4.", "An odd power of −q is negative."],
        workedSolution: `Row 4: ${rowDigits(4)}, with $-q$ in place of $q$.\n$(p - q)^{4} = ${expandTex(4, { sign: -1 })}$`,
        commonErrors: [
          ceTex(W("0005"), MP.signs, `The coefficients and powers are right, but that is $(p + q)^{4}$. With $-q$ the odd powers are negative: $${expandTex(4, { sign: -1 })}$.`, 1, q2019),
        ],
        requiresWorking: false,
      },
    ],
    totalMarks: 2,
    timeAllowanceSec: timeFor(2),
    skeleton: "(main)expand2",
    examinerSources: [q2019],
    solutionProgram: "coefficients = row 4; sign of term r = (-1)^r",
  }),
);

// 0006 — (1 + 2x)^4, beyond what CCEA sets
questions.push(
  qq("0006", {
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Expand"],
    emphasis: ["a number in the bracket", "powers of the whole term"],
    context: { setting: "Expanding (1 + 2x) to the fourth power", original: true },
    parts: [
      {
        id: "main",
        stem: "Expand and simplify $(1 + 2x)^{4}$.",
        marks: 3,
        answer: { kind: "algebraic", latex: numberExpansionTex(4, 1, 2), equivalence: "equivalent", variables: ["x"], form: "expanded" },
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "the coefficients 1, 4, 6, 4, 1 from row 4" },
          { id: "M2", code: "M", marks: 1, for: "$(2x)^{2}$, $(2x)^{3}$ and $(2x)^{4}$ in the terms", accept: ["1 + 4(2x) + 6(2x)^2 + 4(2x)^3 + (2x)^4"] },
          { id: "W1", code: "W", marks: 1, for: `$${numberExpansionTex(4, 1, 2)}$`, dependsOn: ["M1", "M2"] },
        ],
        hints: ["Use row 4 with p = 1 and q = 2x.", "(2x) squared is 4x squared: square the 2 as well."],
        workedSolution: `$1 + 4(2x) + 6(2x)^{2} + 4(2x)^{3} + (2x)^{4}$\n$= ${numberExpansionTex(4, 1, 2)}$`,
        commonErrors: [
          ceTex(W("0006"), MP.notRaised, `The coefficients are right, but each power was put on the $x$ and not on the 2. $(2x)^{2} = 4x^{2}$, so the terms are $${numberExpansionTex(4, 1, 2)}$.`, 1, "ccea-cer:further-maths:2024-summer:FM1:Q6"),
        ],
        requiresWorking: true,
      },
    ],
    totalMarks: 3,
    timeAllowanceSec: timeFor(3),
    skeleton: "(main)expand3",
    examinerSources: ["ccea-cer:further-maths:2024-summer:FM1:Q6"],
    solutionProgram: `terms = row4[r] * 2^r x^r: ${ROWS[4].map((c, r) => c * 2 ** r).join(", ")}`,
  }),
);

// 0007 — exam-style, the opening of a CCEA binomial question (5 marks)
{
  const fig = gridFig({ upTo: 5, targets: [6], title: "Pascal's triangle written out from row 0 to row 5, then an empty grid of seven boxes, Row 1, for row 6" });
  questions.push(
    qq("0007", {
      style: "exam-style",
      difficulty: 2,
      ao: ["AO1", "AO2"],
      commandWords: ["Complete", "Hence", "Write down"],
      emphasis: ["the triangle as a mark", "expansion", "one term", "a negative term"],
      context: { setting: "Pascal's triangle and the sixth-power expansion", original: true },
      figures: [figure(fig, "Pascal's triangle from row 0 to row 5, and an empty grid of seven boxes, numbered column 1 to column 7, for row 6.")],
      parts: [
        {
          id: "a",
          stem: "Complete row 6 of Pascal's triangle in the grid.",
          marks: 1,
          answer: { kind: "table", cells: ROWS[6].map((v, c) => ({ row: 0, col: c, value: v, tolerance: { type: "exact" } })) },
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: rowDigits(6) }],
          hints: ["Add each neighbouring pair in row 5."],
          workedSolution: `Row 5 is ${rowDigits(5)}; adding neighbours gives row 6: ${rowDigits(6)}.`,
          commonErrors: [],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: "Hence write down the expansion of $(p + q)^{6}$.",
          marks: 1,
          answer: expansion(6),
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${exp6}$` }],
          hints: ["Use the row you have just written."],
          workedSolution: `$(p + q)^{6} = ${exp6}$`,
          commonErrors: [
            ceTex(W("0007", "b"), MP.wrongRow, `That is $(p + q)^{5}$, the row above. The sixth power uses row 6, the row you completed in part (a), and has seven terms.`, 0, q2019),
            ceList("The terms are right, but an expansion needs plus signs between them, not commas.", 0),
          ],
          requiresWorking: false,
        },
        {
          id: "c",
          stem: "Write down the term in $p^{4}q^{2}$ in the expansion of $(p + q)^{6}$.",
          marks: 1,
          answer: { kind: "algebraic", latex: termTex(6, 2), equivalence: "equivalent", variables: ["p", "q"] },
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${termTex(6, 2)}$` }],
          hints: ["q squared is the third term."],
          workedSolution: `The term with $q^{2}$ is the third: $${termTex(6, 2)}$.`,
          commonErrors: [ceTex(W("0007", "c"), MP.swap, `That is the term in $p^{2}q^{4}$. For $p^{4}q^{2}$ the power of $p$ is 4: $${termTex(6, 2)}$.`, 0, q2023)],
          requiresWorking: false,
        },
        {
          id: "d",
          stem: "Write down the expansion of $(p - q)^{6}$.",
          marks: 2,
          answer: expansion(6, { sign: -1 }),
          scheme: [
            { id: "MW1", code: "MW", marks: 1, for: "the coefficients and powers of part (b)" },
            { id: "MW2", code: "MW", marks: 1, for: "the signs alternating, starting with +" },
          ],
          hints: ["Start from part (b).", "The terms with an odd power of q become negative."],
          workedSolution: `$(p - q)^{6} = ${expandTex(6, { sign: -1 })}$`,
          commonErrors: [ceTex(W("0007", "d"), MP.signs, `That is part (b) again. With $-q$ the terms with an odd power of $q$ turn negative: $${expandTex(6, { sign: -1 })}$.`, 1, q2019)],
          requiresWorking: false,
        },
      ],
      totalMarks: 5,
      timeAllowanceSec: timeFor(5),
      skeleton: "(a)complete1|(b)write-down1|(c)write-down1|(d)write-down2",
      examinerSources: [q2019, q2022, q2023, q2025],
      solutionProgram: `row 6 = [${ROWS[6].join(", ")}]; term in p^4 q^2 = ${ROWS[6][2]}; (p - q)^6 signs (-1)^r`,
    }),
  );
}

// ---------------------------------------------------------------------------
// Worked example
// ---------------------------------------------------------------------------

const we = {
  id: `we.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: "Complete Pascal's triangle as far as row 6. Hence write down the expansion of $(p + q)^{6}$.",
  steps: [
    {
      n: 1,
      working: `Rows 0 to 5 are written out, ending with row 5: ${rowDigits(5)}`,
      decision: "Write the triangle out on the page. It is quick, it earns its own mark, and it is where the coefficients come from.",
      earns: [],
    },
    {
      n: 2,
      working: `Row 6: ${rowDigits(6)}`,
      decision: "Add each neighbouring pair of row 5 and put 1 at each end. Check: seven numbers, symmetric, total 64.",
      whyMenu: {
        options: ["Each entry is the sum of the two entries above it", "Each entry is the one above it multiplied by 6", "Row 6 counts up by 6 each time"],
        correct: 0,
        explain: "That addition rule is the whole triangle. Multiplying or counting up gives numbers that are not symmetric and do not total 2 to the power 6.",
      },
      earns: ["MW1"],
      input: { kind: "numeric", value: ROWS[6][3], tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] },
    },
    {
      n: 3,
      working: `$(p + q)^{6} = ${exp6}$`,
      decision: "Take the coefficients from row 6 in order, with the power of p falling from 6 and the power of q rising to 6, and join the seven terms with plus signs.",
      earns: ["MW1"],
      input: expansion(6),
    },
  ],
  finalAnswer: `$(p + q)^{6} = ${exp6}$`,
  twin: {
    stem: "Use Pascal's triangle to write down the expansion of $(a + b)^{5}$.",
    answer: { kind: "algebraic", latex: expandTex(5, { p: "a", q: "b" }), equivalence: "equivalent", variables: ["a", "b"], form: "expanded" },
  },
  faded: [
    { showSteps: 2, studentSupplies: [3] },
    { showSteps: 1, studentSupplies: [2, 3] },
  ],
  verification: `ver.we.${TOPIC}.01`,
  version: 1,
};

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

const pre = {
  id: `dx.${TOPIC}.pre`,
  topic: TOPIC,
  specRefs: SPEC,
  when: "pre",
  items: [
    {
      id: "p1",
      stem: "Before the lesson, a check on earlier work. Which is the expansion of $(p + q)^{2}$?",
      skill: "Expanding a squared bracket (from GCSE Mathematics)",
      options: [
        { id: "a", text: "$p^{2} + 2pq + q^{2}$", correct: true, feedback: "Yes: $(p + q)(p + q) = p^{2} + pq + qp + q^{2}$, and the two middle terms make $2pq$. The 1, 2, 1 is row 2 of Pascal's triangle." },
        { id: "b", text: "$p^{2} + q^{2}$", correct: false, feedback: "The two middle products are missing: multiplying out gives $pq$ twice, so the expansion is $p^{2} + 2pq + q^{2}$." },
        { id: "c", text: "$p^{2} + pq + q^{2}$", correct: false, feedback: "There are two middle products, $pq$ and $qp$, and they are the same, so together they make $2pq$." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "Another check on earlier work. What is $(2x)^{3}$?",
      skill: "A power of a product (from GCSE Mathematics)",
      options: [
        { id: "a", text: "$8x^{3}$", correct: true, feedback: "Yes: the cube acts on the 2 and on the $x$, so $2^{3}x^{3} = 8x^{3}$." },
        { id: "b", text: "$2x^{3}$", correct: false, feedback: "The power acts on the whole bracket, the 2 included: $2^{3} = 8$, so $(2x)^{3} = 8x^{3}$." },
        { id: "c", text: "$6x^{3}$", correct: false, feedback: "That multiplies the 2 by 3. The 2 is cubed: $2 \\times 2 \\times 2 = 8$, so $8x^{3}$." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p3",
      stem: "One more check on earlier work. What is $(-q)^{3}$?",
      skill: "Odd and even powers of a negative (from GCSE Mathematics)",
      options: [
        { id: "a", text: "$-q^{3}$", correct: true, feedback: "Yes: three negatives multiplied give a negative. An even power would be positive." },
        { id: "b", text: "$q^{3}$", correct: false, feedback: "$(-q)(-q) = q^{2}$, and one more $-q$ makes it negative again: $-q^{3}$." },
        { id: "c", text: "$-3q$", correct: false, feedback: "That multiplies by 3 instead of raising to the power 3. $(-q)^{3} = (-q)(-q)(-q) = -q^{3}$." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

const post = {
  id: `dx.${TOPIC}.post`,
  topic: TOPIC,
  specRefs: SPEC,
  when: "post",
  items: [
    {
      id: "d1",
      stem: "Which row of Pascal's triangle gives the coefficients of $(p + q)^{6}$?",
      skill: "Choosing the row for a power",
      options: [
        { id: "a", text: `The row that starts ${ROWS[6].slice(0, 3).join(", ")}`, correct: true, feedback: `Yes: that is row 6, ${rowDigits(6)}, with seven numbers, one for each term.` },
        { id: "b", text: `The row that starts ${ROWS[5].slice(0, 3).join(", ")}`, correct: false, misconception: MP.wrongRow, feedback: "That is row 5, one row too early: it has six numbers, so it expands the fifth power. The sixth power needs the row that starts 1, 6." },
        { id: "c", text: `The row that starts ${ROWS[7].slice(0, 3).join(", ")}`, correct: false, misconception: MP.wrongRow, feedback: "That is row 7, one row too far: it has eight numbers, so it expands the seventh power. Count the single 1 at the top as row 0." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: "How many terms are there in the expansion of $(p + q)^{8}$?",
      skill: "Counting terms: n + 1",
      options: [
        { id: "a", text: "9", correct: true, feedback: "Yes: the power of $q$ runs 0, 1, …, 8, which is nine values, and row 8 has nine numbers." },
        { id: "b", text: "8", correct: false, misconception: MP.wrongRow, feedback: "Eight terms belong to $(p + q)^{7}$. Counting from $q^{0}$ to $q^{8}$ gives nine terms, one for each number in row 8." },
        { id: "c", text: "10", correct: false, misconception: MP.wrongRow, feedback: "Ten terms belong to $(p + q)^{9}$. The power of $q$ runs from 0 to 8, which is nine values." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: "In the expansion of $(p + q)^{7}$, which term is correct?",
      skill: "Powers adding to n, coefficient from row n",
      options: [
        { id: "a", text: `$${termTex(7, 2)}$`, correct: true, feedback: `Yes: the powers $5 + 2 = 7$, and the coefficient of the third term of row 7 is ${ROWS[7][2]}.` },
        { id: "b", text: `$${termTex(7, 2, { coef: ROWS[6][2] })}$`, correct: false, misconception: MP.wrongRow, feedback: `${ROWS[6][2]} comes from row 6. The seventh power takes its coefficients from row 7, where the third number is ${ROWS[7][2]}.` },
        { id: "c", text: "$21p^{5}q^{3}$", correct: false, misconception: MP.wrongRow, feedback: "The powers add up to 8, not 7. In every term of the seventh power the two powers add up to 7." },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: "Which is the expansion of $(p - q)^{3}$?",
      skill: "Alternating signs for a negative term",
      options: [
        { id: "a", text: `$${expandTex(3, { sign: -1 })}$`, correct: true, feedback: "Yes: the terms with $q$ and $q^{3}$ are negative, because odd powers of $-q$ are negative." },
        { id: "b", text: `$${expandTex(3)}$`, correct: false, misconception: MP.signs, feedback: "That is $(p + q)^{3}$. With $-q$, the odd powers of $q$ bring a minus sign." },
        { id: "c", text: "$p^{3} - 3p^{2}q - 3pq^{2} - q^{3}$", correct: false, misconception: MP.signs, feedback: "$(-q)^{2} = q^{2}$ is positive, so the third term is $+3pq^{2}$. The signs alternate." },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

const wrongExp = expandTex(6, { coefs: [...ROWS[5], 0] }).replace(/ \+ 0q\^\{6\}$/, "");
if (!/ \+ pq\^\{5\}$/.test(wrongExp) || wrongExp.split(" + ").length !== 6) throw new Error(`the find-the-mistake working is not the expected six-term line: ${wrongExp}`);
const ftm = {
  id: `ftm.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  stem: "Seán was asked to complete Pascal's triangle and hence expand $(p + q)^{6}$. He skipped the triangle and wrote:",
  studentWorking: [`The row for power 6 is ${ROWS[5].join(", ")}`, `(p + q)^6 = ${plain(wrongExp)}`],
  mistakeLine: 1,
  misconception: MP.notWritten,
  whatWentWrong: `Line 1 is row 5, recalled without writing the triangle. The sixth power needs row 6, ${rowDigits(6)}, which has seven numbers; row 5 has only six, so his expansion is a term short and every coefficient after the first is from the wrong row.`,
  correction: [`The row for power 6 is ${ROWS[6].join(", ")}`, `(p + q)^6 = ${plain(exp6)}`],
  marksEarnedAsWritten: [],
  feedback: `Writing the triangle out would have saved both marks: it is a mark in itself, and counting the rows from row 0 shows that ${ROWS[5].join(", ")} is row 5. His expansion also fails the quick check, six terms where the sixth power has seven.`,
  source: q2019,
};

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const RP = (k) => `rp.${TOPIC}.${k}`;
const prompts = [
  { id: RP("01"), kind: "procedure", prompt: "How is each new row of Pascal's triangle made?", answer: "Start and end the row with 1; every number in between is the sum of the two numbers just above it.", keyWords: ["start and end", "sum of the two"], difficultyPrior: 1 },
  { id: RP("02"), kind: "definition", prompt: "Which row gives the coefficients of (p + q)ⁿ, and how many terms does it have?", answer: "Row n, counting the single 1 at the top as row 0. It has n + 1 numbers, so the expansion has n + 1 terms.", keyWords: ["row n", "row 0", "n + 1"], difficultyPrior: 2 },
  { id: RP("03"), kind: "procedure", prompt: "What happens to the powers from one term of (p + q)ⁿ to the next?", answer: "The power of p falls by 1, from n down to 0, and the power of q rises by 1, from 0 up to n; in every term they add up to n.", keyWords: ["falls", "rises", "add up to n"], difficultyPrior: 2 },
  { id: RP("04"), kind: "trap", prompt: "What changes when you expand (p − q)ⁿ instead of (p + q)ⁿ?", answer: "Only the signs: terms with an odd power of q become negative, so the signs alternate plus, minus, plus.", keyWords: ["odd power", "alternate"], difficultyPrior: 3 },
  { id: RP("05"), kind: "trap", prompt: "Two presentation habits that protect the marks when you expand with Pascal's triangle.", answer: "Write the triangle out on the page, because it earns a mark of its own, and join the terms with plus signs, because an expansion is one expression.", keyWords: ["write the triangle out", "plus signs"], difficultyPrior: 2 },
].map((p) => ({ ...p, topic: TOPIC, specRefs: SPEC, examUnit: "FM3" }));

// ---------------------------------------------------------------------------
// Sheet, note, topic
// ---------------------------------------------------------------------------

const sheet = {
  mustBeAbleTo: [
    "Build Pascal's triangle to row 8 by adding pairs, starting from row 0",
    "Check a row: n + 1 numbers, symmetric, a total of $2^{n}$",
    "Write down the expansion of $(p + q)^{n}$ for $n \\le 8$: coefficients from row n, the power of p falling and of q rising, each pair adding to n",
    "Pick out a single term, such as the term in $p^{3}q^{5}$",
    "Write the terms as one expression joined by plus signs",
    "Keep the signs of a negative term and raise the whole of a term such as 2x (beyond what CCEA sets, same method)",
  ],
  howExamined:
    "The binomial question in Unit 3 (Q4 from 2019 to 2025, Q2 in the 2021 paper and Q3 in 2026) opens with this topic: complete Pascal's triangle, printed with its first rows, for 1 mark, then 'Hence write down the expansion of (p + q)ⁿ' for 1 or 2 marks, with n from 3 to 8. The scheme gives MW1 for the row and MW1 for the expansion, the second sometimes split between the coefficients and the powers. The later parts use the expansion for binomial probabilities.",
  traps: [
    "Summer 2019 FM3 Q4: three quarters expanded correctly, but a few lost a mark by not writing out Pascal's triangle, some expanded to the power 5 instead of 6, and some left out the plus signs or put extra ones between the p and q in a term",
    "Summer 2022 FM3 Q4: almost everyone completed the triangle and the expansion was very well done; the few errors were in the powers",
    "Summer 2023 FM3 Q4: a few made errors with the powers and a few left out the coefficients",
    "Summer 2025 FM3 Q4: almost all completed the triangle and used it in the expansion; the marks lost in this question came in the probability parts that follow",
  ],
};
const notOnThisSpec = [
  "The ⁿCᵣ notation, factorials and the general term: the specification names Pascal's triangle",
  "Powers above 8, and fractional or negative powers (the binomial series)",
  "Expansions with a number or a minus sign inside the bracket are not set in Unit 3, though the method is the same",
];
const externalRefs = [yt("9Y4bhtNSW8w", "P McAleavey", "Pascal's Triangle / Binomial / Probability"), PLINKO, CCEA_DOC];

const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "Pascal's triangle and the expansion of (p + q)ⁿ",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  specRefs: SPEC,
  calculator: true,
  formulaSheet: {
    given: ["Nothing for this topic: Pascal's triangle is not on the Unit 3 formula sheet"],
    mustKnow: [
      "Each row starts and ends with 1; every other entry is the sum of the two above",
      "Row n (counting from row 0) gives the coefficients of (p + q)ⁿ; it has n + 1 numbers",
      "The power of p falls from n to 0 and the power of q rises from 0 to n; they add to n in every term",
    ],
  },
  notOnThisSpec,
  hardness: "L",
  examinerFlagged: true,
  externalRefs,
  sheet,
  verification: `ver.note.${TOPIC}`,
  version: 1,
  updated: UPDATED,
};

const topic = {
  id: TOPIC,
  slug: SLUG,
  title: "Pascal's triangle and expanding (p + q)ⁿ",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  strand: "Binomial distribution",
  statementIds: SPEC,
  prerequisites: ["maths.m3.identities-and-expanding-double-brackets", "maths.m7.index-laws-in-algebra-integer-powers"],
  order: 9,
  hardness: "L",
  difficulty: 1,
  examinerFlagged: true,
  examinerSources: [q2019, q2022, q2023, q2025],
  examWeightHint: sheet.howExamined,
  mustMemorise: [
    "Rows of Pascal's triangle to n = 8, built by adding the two numbers above",
    "(p + q)ⁿ terms: coefficient × pⁿ⁻ʳ qʳ, powers summing to n, joined with + signs",
  ],
  onFormulaSheet: [],
  notOnThisSpec,
  externalRefs,
  keywords: ["Pascal", "binomial expansion", "coefficients", "powers", "(p + q)^n"],
};

const sets = [
  {
    id: `set.${TOPIC}.practice`,
    topic: TOPIC,
    kind: "interleaved",
    title: "Build the rows, then expand: short ladder",
    subject: "further-maths",
    units: ["FM3"],
    itemIds: [`dx.${TOPIC}.pre`, Q("0001"), Q("0002"), RP("02"), Q("0003"), ftm.id, Q("0004"), Q("0005"), Q("0006"), Q("0007"), `dx.${TOPIC}.post`],
    showTopicLabels: false,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const SCOPE =
  "Unit 3 (Statistics), untiered, calculator paper; statement FM3-BIN-01 (use Pascal's triangle to expand (p + q)ⁿ for n up to 8). No nCr notation. The minus-sign and number-in-the-bracket material goes beyond what CCEA sets and carries a notonspec callout in the note and a line in notOnThisSpec.";
const FS = "packs/further-maths/exam-true/formula-sheets.json (FM3): nothing for this statement; the triangle is must-know (mk.fm3.binomial).";
const CMD = "Command words from packs/further-maths/exam-true/command-words.json: Complete, Hence, Write down, Expand.";
const TAR =
  "Tariffs follow the Q4 openings read in the Summer 2019, 2021, 2022, 2023, 2024, 2025 and 2026 papers and schemes (the triangle 1 mark; the expansion 1 or 2 marks) and packs/further-maths/exam-true/tariffs.json.";
const SHINGLE =
  "Compared against the FM3 papers, schemes and reports read for this batch; rows 7 and 8 are said as a rise and its mirror image so that no eight numbers of a printed triangle stand in one run; node scripts/qa/shingles.mjs reports no breach for this topic.";
const STYLE = "British English; second person; no exclamation marks; every $...$ pair on one line, no prose inside maths, every TeX command keeps its backslash.";
const NUM = (what) =>
  `${what} is emitted by scratchpad/fm3-batch-c/pascals-triangle-binomial-expansion.mjs from ROWS in stat.mjs (each row built by addition and asserted symmetric with total 2^n); every expansion is built term by term; every algebraic commonError is its route in routes.mjs, checked by verify-published.mjs.`;

const verification = [
  verLog(note.id, {
    schema: "Shape validated against src/lib/content/schema.ts and lesson template v2 by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "formula-sheet": FS,
    "command-words": CMD,
    tariff: TAR,
    "maths-symbolic": NUM("Every row, expansion and coefficient in the note and its five figures"),
    "examiner-alignment": `Sheet traps cite Summer 2019, 2022, 2023 and 2025 FM3 Q4 from pipeline/mine/cer-blocks/further-maths; no examiner callout is needed in the body.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(we.id, {
    schema: "Shape validated against src/lib/content/schema.ts (WorkedExample) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    tariff: "The triangle MW1 and the expansion MW1 of the 2022-2025 schemes.",
    "maths-symbolic": NUM("Row 6 and the expansion of (p + q)^6, and the twin's (a + b)^5"),
    "examiner-alignment": `Step 1 answers the Summer 2019 finding that not writing the triangle cost a mark (${q2019}).`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(pre.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": "Prerequisite items from GCSE Mathematics: a squared bracket, a power of a product, and an odd power of a negative; honestly labelled; no topic tags.",
    "maths-symbolic": NUM("Every option"),
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(post.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "maths-symbolic": NUM("Every option"),
    "examiner-alignment": `Distractors carry fm.binomial.wrong-power (${q2019}) and fm.binomial.negative-term-signs-lost.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(ftm.id, {
    schema: "Shape validated against src/lib/content/schema.ts (FindTheMistake) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "maths-symbolic": NUM("The six-term expansion from row 5 and the corrected seven-term expansion"),
    "examiner-alignment": `Seeded from ${q2019}: the triangle not written out, and the expansion to the power 5 instead of 6.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  ...prompts.map((p) =>
    verLog(p.id, {
      schema: "Shape validated against src/lib/content/schema.ts (RetrievalPrompt) by pipeline/build-content.mts",
      "scope-tier": SCOPE,
      "examiner-alignment": `Rehearses the habits behind ${q2019}.`,
      "copy-shingle": SHINGLE,
      "style-lint": `${STYLE} Every key word appears in the prompt's own answer.`,
    }),
  ),
  ...questions.map((q) =>
    verLog(q.id, {
      schema: "Shape validated against src/lib/content/schema.ts (Question) by pipeline/build-content.mts",
      "scope-tier": SCOPE,
      "formula-sheet": FS,
      "command-words": CMD,
      tariff: TAR,
      "maths-symbolic": NUM(`Every value in ${q.id} (solutionProgram: ${q.solutionProgram})`),
      "independent-solve": "check-marking.mts feeds each answer in LaTeX, caret, unspaced and reversed spellings, and every commonError, to the app's own marker (src/components/items/mark.ts).",
      "examiner-alignment": `Sources ${q.examinerSources.join(", ") || "none: this item goes beyond what CCEA sets and is labelled so"}; every commonError is the result of executing its described route.`,
      "copy-shingle": SHINGLE,
      "style-lint": STYLE,
    }),
  ),
];

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note,
  workedExamples: [we],
  diagnostics: [pre, post],
  questions,
  findTheMistake: [ftm],
  prompts,
  sets,
  verification,
};

void notRaisedTex;
emit(SLUG, bundle, blocks);
