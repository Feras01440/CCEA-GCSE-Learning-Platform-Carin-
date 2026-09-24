const figHero = pTriangle({
  rows: ROWS,
  upTo: 8,
  sums: [
    [4, 2],
    [6, 3],
  ],
  title: "Pascal's triangle from row 0 to row 8, rows numbered down the left, with two of the additions drawn: 3 + 3 = 6 in row 4 and 10 + 10 = 20 in row 6",
});
const row5Total = ROWS[5].reduce((a, b) => a + b, 0);
if (row5Total !== 2 ** 5) throw new Error("row 5 does not total 2^5");
const figRowFacts = pTriangle({
  rows: ROWS,
  upTo: 6,
  band: 5,
  title: `Pascal's triangle to row 6 with row 5 shaded: ${ROWS[5].length} numbers, symmetric, adding up to ${row5Total}`,
});
const figStrip = pPowers({
  rows: ROWS,
  n: 4,
  title: "The five terms of (p + q)⁴ with, under each, its coefficient from row 4, its power of p (4, 3, 2, 1, 0) and its power of q (0, 1, 2, 3, 4)",
});

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const exp6 = expandTex(6);
// g7: the sign of one term of (p - q)^5, generated from the same expansion the note prints.
const G7 = { n: 5, qPow: 3 };
const g7Coef = -ROWS[G7.n][G7.qPow];
if (expandTex(G7.n, { sign: -1 }).split(/ (?=[+-] )/)[G7.qPow].replace(/\s/g, "") !== `-${ROWS[G7.n][G7.qPow]}p^{2}q^{3}`) throw new Error("g7 no longer matches the expansion");
const num4 = numberExpansionTex(4, 1, 2);
const num4Terms = num4.split(" + ");

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
  { type: "h", text: "A triangle made by adding", role: "idea" },
  {
    type: "p",
    md: "Start with 1 at the top. Each new row begins and ends with 1, and every number in between is the sum of the two numbers just above it. Keep going and you have Pascal's triangle.",
  },
  {
    type: "figure",
    alt: "Pascal's triangle from row 0 to row 8, each number in a circle, with the rows numbered 0 to 8 down the left. Lines show 3 and 3 in row 3 adding to 6 in row 4, and 10 and 10 in row 5 adding to 20 in row 6.",
    svg: figHero,
    caption: "Each number is the sum of the two just above it: 3 + 3 makes the 6 in row 4, and 10 + 10 makes the 20 in row 6.",
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

  { type: "h", text: "The rows are numbered from 0", role: "idea" },
  {
    type: "figure",
    alt: `Pascal's triangle to row 6 with row 5 shaded. Row 5 is ${rowDigits(5)}: ${ROWS[5].length} numbers, the same read from either end, and a total of ${row5Total}.`,
    svg: figRowFacts,
    caption: `Row 5, shaded, has ${ROWS[5].length} numbers, reads the same both ways and totals ${row5Total}, which is 2⁵.`,
  },
  {
    type: "p",
    md: "The single 1 at the top is row 0, so row $n$ is the row that starts 1, $n$. Three facts check any row you build: row $n$ has $n + 1$ numbers, it reads the same from either end, and its numbers add up to $2^{n}$.\nThe exam gives you nothing here: the triangle is not on the formula sheet, so you build it every time.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "number",
    prompt: `Row 7 of Pascal's triangle begins ${ROWS[7].slice(0, 5).join(", ")}. What is the fourth number of row 8?`,
    answer: String(ROWS[8][3]),
    explain: `The fourth number of row 8 sits below the third and fourth numbers of row 7: $${ROWS[7][2]} + ${ROWS[7][3]} = ${ROWS[8][3]}$. Row 8 begins ${ROWS[8].slice(0, 4).join(", ")}.`,
  },

  { type: "h", text: "Why the numbers count routes", role: "why" },
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

  { type: "h", text: "The powers fall and rise", role: "variant" },
  {
    type: "figure",
    alt: "The five terms of (p + q) to the power 4, p⁴, 4p³q, 6p²q², 4pq³ and q⁴, with a row underneath each for the coefficient (1, 4, 6, 4, 1), the power of p (4, 3, 2, 1, 0) and the power of q (0, 1, 2, 3, 4).",
    svg: figStrip,
    caption: "Read across: the power of p falls from 4 to 0 as the power of q rises from 0 to 4, and the coefficients are row 4.",
  },
  {
    type: "p",
    md: "Row $n$ gives the coefficients of $(p + q)^{n}$ in order. From term to term the power of $p$ falls by 1, from $n$ down to 0, while the power of $q$ rises from 0 to $n$, so in every term the two powers add up to $n$. There are $n + 1$ terms, one for each number in the row.",
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

  { type: "h", text: "A minus sign in the bracket", role: "variant" },
  {
    type: "p",
    md: `For $(p - q)^{n}$, think of it as $(p + (-q))^{n}$. The coefficients and the powers are exactly as before, but every odd power of $-q$ is negative, so the signs alternate:\n$(p - q)^{4} = ${expandTex(4, { sign: -1 })}$`,
  },
  {
    type: "gate",
    id: "g7",
    kind: "number",
    prompt: `In the expansion of $(p - q)^{${G7.n}}$, what is the coefficient of $p^{2}q^{3}$? Give its sign.`,
    answer: `${g7Coef} | −${-g7Coef}`,
    explain: `Row ${G7.n} gives ${-g7Coef} for the term in $p^{2}q^{3}$, and $(-q)^{3}$ is negative, so the term is $${g7Coef}p^{2}q^{3}$.`,
  },

  { type: "h", text: "A number in the bracket", role: "variant" },
  {
    type: "p",
    md: `For $(1 + 2x)^{4}$, use row 4 with 1 in place of $p$ and $2x$ in place of $q$. Every power acts on the whole of $2x$, the 2 as well as the $x$:\n$${ROWS[4][2]}(2x)^{2} = ${num4Terms[2]}$, not $${ROWS[4][2] * 2}x^{2}$\n$(1 + 2x)^{4} = ${num4}$`,
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Beyond what CCEA sets",
    md: "Unit 3 has only set $(p + q)^{n}$ with letters. The same rule covers a minus sign or a number in the bracket, and in Unit 1 most candidates once lost a mark by not cubing the 2 in $(2x)^{3}$.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: "In the expansion of $(1 + 3x)^{4}$, what is the coefficient of $x^{2}$?",
    answer: String(ROWS[4][2] * 3 ** 2),
    explain: `The $x^{2}$ term is $${ROWS[4][2]} \\times (3x)^{2} = ${ROWS[4][2]} \\times ${3 ** 2}x^{2} = ${ROWS[4][2] * 9}x^{2}$. Squaring the $x$ but not the 3 would give ${ROWS[4][2] * 3}.`,
  },

  { type: "h", text: "See it done", role: "see" },
  {
    type: "p",
    md: "**Question.** Complete Pascal's triangle as far as row 6. Hence expand $(p + q)^{6}$.",
  },
  {
    type: "p",
    md: `**Line 1.** Write the triangle out from row 0 to row 6. It earns a mark of its own.\n**Line 2.** Row 6 is ${rowDigits(6)}: seven numbers, because $n + 1 = 7$.\n**Line 3.** $(p + q)^{6} = ${exp6}$\n**Check.** Seven terms, a plus sign between each pair, and the powers in every term add up to 6.`,
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

  { type: "h", text: "You can now" },
  {
    type: "p",
    md: "Build Pascal's triangle to row 8 by adding pairs, starting from row 0.\nCheck a row: $n + 1$ numbers, symmetric, total $2^{n}$.\nExpand $(p + q)^{n}$: row $n$ for the coefficients, the power of $p$ falling and $q$ rising, plus signs between.\nKeep the signs and the whole bracket when the second term is negative or has a number.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The binomial question usually opens with this: complete the triangle for 1 mark, then expand $(p + q)^{n}$ for 1 or 2 marks. In 2026 the grid gave the triangle down to row 6 and asked for rows 7 and 8 first, so build every row you need. Write the triangle out in full, because it is a mark in itself, and join the terms with plus signs.",
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.02` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
];
