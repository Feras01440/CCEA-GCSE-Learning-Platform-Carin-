/**
 * FM3 batch C, topic 1 — binomial-probabilities (difficulty 3 -> S).
 *   node scratchpad/fm3-batch-c/binomial-probabilities.mjs      (from the repository root)
 *
 * Every probability is an exact rational from stat.mjs (Binom), printed with exactDec / d4; every
 * commonError value is route() from routes.mjs, the described slip carried out in code.
 */
import fs from "node:fs";
import path from "node:path";
import { big, bFixed, bMul, bPow, bSub, bValue, figure } from "./lib.mjs";
import { ROWS, d4, exactDec, rat, terminatesWithin } from "./stat.mjs";
import { sup, shown, termWords } from "./binfig.mjs";
import { bTable, bAnatomy, bDots, pGrid } from "./phone.mjs";
import { BIN, BT, M, model, route } from "./routes.mjs";
import { ROOT, CCEA_DOC, PLINKO, UPDATED, emit, plinkoBlock, src, timeFor, verLog, yt } from "./emit.mjs";

const TOPIC = BT;
const SLUG = "binomial-probabilities";
const SPEC = ["FM3-BIN-02"];

const q2019 = src("2019-summer", 4);
const q2022 = src("2022-summer", 4);
const q2023 = src("2023-summer", 4);
const q2024 = src("2024-summer", 4);
const q2025 = src("2025-summer", 4);

const PAPER = {
  unit: "FM3",
  calculator: true,
  resources: ["Scientific calculator", "Formula sheet printed on page 2 of the question-and-answer booklet", "Normal Probability Table on page 3 of the booklet"],
};
const FOUR_DP = "Give your answer to 4 decimal places.";

// ---------------------------------------------------------------------------
// Models and printing helpers
// ---------------------------------------------------------------------------

const B = Object.fromEntries(Object.keys(BIN).map((k) => [k, model(k)]));
/** An exact terminating decimal, printed in full. */
const e = (x) => exactDec(x, 16);
const v4 = (x) => d4(x);
/** A power of p or q, printed exactly: pw(B.bus.q, 3) is "0.614125". */
const pw = (x, k) => e(bPow(x, k));

/** LaTeX for a number that may be a fraction string ("1/6"). */
const texNum = (s) => {
  const f = /^(\d+)\/(\d+)$/.exec(s);
  return f ? `\\left(\\frac{${f[1]}}{${f[2]}}\\right)` : `(${s})`;
};
const powTex = (base, k) => (k === 0 ? "" : k === 1 ? base : `${base}^{${k}}`);

/**
 * A row of Pascal's triangle in words. Rows 7 and 8 are said as a rise and its mirror image
 * ("1, 7, 21, 35, then the same four in reverse"), which is how the symmetry is taught, and which
 * keeps eight numbers of the board's printed triangle from standing in one run.
 */
const rowWords = (n) => {
  const row = ROWS[n];
  if (row.length <= 7) return row.join(" ");
  const half = row.slice(0, Math.ceil(n / 2));
  const words = ["", "one", "two", "three", "four", "five"][half.length];
  return n % 2 === 1 ? `${half.join(", ")}, then the same ${words} in reverse` : `${half.join(", ")}, ${row[n / 2]} in the middle, then the same ${words} in reverse`;
};
/** "10p^{2}q^{3}" */
const symTerm = (n, r) => {
  const c = ROWS[n][r];
  return `${c === 1 ? "" : c}${powTex("p", r)}${powTex("q", n - r)}`;
};
/** "10(0.15)^{2}(0.85)^{3}" */
const numTerm = (b, r, { pStr = b.pStr, qStr = b.qStr, coef = b.coef(r) } = {}) =>
  `${coef === 1 ? "" : coef}${powTex(texNum(pStr), r)}${powTex(texNum(qStr), b.n - r)}`;
/** "10 × 0.15^2 × 0.85^3": plain text for find-the-mistake lines. */
const plainTerm = (b, r, { pStr = b.pStr, qStr = b.qStr, coef = b.coef(r) } = {}) => {
  const parts = [];
  if (coef !== 1) parts.push(String(coef));
  if (r > 0) parts.push(r === 1 ? pStr : `${pStr}^${r}`);
  if (b.n - r > 0) parts.push(b.n - r === 1 ? qStr : `${qStr}^${b.n - r}`);
  return parts.join(" × ");
};

/**
 * Refuses a value whose fifth-and-later digits sit within 0.02 of a rounding tie (0.27795023…):
 * a candidate who rounds one intermediate a little differently would land on the other side.
 */
const safe4 = (x, where) => {
  const scaled = Number(exactOr12(x)) * 1e4;
  const frac = scaled - Math.floor(scaled);
  if (Math.abs(frac - 0.5) < 0.02) throw new Error(`${where}: ${exactOr12(x)} sits on a 4 d.p. rounding tie`);
  return x;
};
const exactOr12 = (x) => bFixed(x, 12);
/** A probability to 4 d.p., under the accuracy instruction the stem carries. */
const prob4 = (x) => ({ kind: "numeric", value: bValue(safe4(x, "answer"), 4), tolerance: { type: "dp", places: 4 }, unitRequired: false, acceptForms: ["decimal"] });
/** An exact short decimal (no rounding is needed when the value terminates). */
const probExact = (x) => {
  if (!terminatesWithin(x, 4)) throw new Error(`probExact: ${e(x)} does not terminate within 4 places`);
  return { kind: "numeric", value: Number(e(x)), tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal", "fraction"] };
};
const ce = (where, misconception, feedback, marks, source, { nth = 0, exact = false } = {}) => {
  const x = route(where, misconception, nth);
  return {
    misconception,
    pattern: exact
      ? { kind: "numeric", value: Number(e(x)), tolerance: { type: "exact" } }
      : { kind: "numeric", value: bValue(safe4(x, where), 4), tolerance: { type: "dp", places: 4 } },
    feedback,
    marksTypicallyEarned: marks,
    source,
  };
};
const rv = (where, misconception, nth = 0) => v4(route(where, misconception, nth));
const re = (where, misconception, nth = 0) => e(route(where, misconception, nth));
/** "nine": the ratio of two exact rationals to the nearest whole number, in words. */
const timesWords = (a, b) => {
  const k = Math.round(Number(bFixed(a, 12)) / Number(bFixed(b, 12)));
  return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"][k];
};
// WE2's quick check says 0 or 1 golds is "a little under a half": hold the generator to it.
if (!(Number(bFixed(B.archer.sum(0, 1), 12)) > 0.4 && Number(bFixed(B.archer.sum(0, 1), 12)) < 0.5)) throw new Error("WE2 quick-check sentence is stale");
/** The fifth decimal digit of an exact rational (the digit that decides a 4 d.p. rounding). */
const d5 = (x) => Number(((x.n * 100000n) / x.d) % 10n);
/** "0.75" -> "75%", exactly. */
const pct = (s) => `${e(bMul(rat(s), big(100n)))}%`;

// The prose below names some context numbers in words ("80% of her free throws"); these asserts
// tie every such number to the model it describes, so a change to routes.mjs cannot leave a stale
// sentence behind.
{
  const must = (cond, what) => {
    if (!cond) throw new Error(`stale context number: ${what}`);
  };
  must(BIN.throws.p === "0.8" && BIN.throws.n === 4, "the free-throw prose says 80%, 0.8, 0.2 and four throws");
  must(pct("0.8") === "80%", "pct(0.8)");
  must(BIN.bus.p === "0.15" && B.bus.qStr === "0.85" && BIN.bus.n === 5, "the bus prose says 85% on time over 5 days");
  must(B.loaves.qStr === BIN.loaves.rises && pct(BIN.loaves.rises) === "88%" && BIN.loaves.n === 7, "the loaves stem says 88% and seven loaves");
  must(pct(BIN.serve.p) === "65%" && BIN.serve.n === 6, "the serve stem says 65% and 6 serves");
  must(B.recycle.qStr === BIN.recycle.recycles && BIN.recycle.n === 7, "the recycle stem gives the recycling rate and seven households");
  must(pct(BIN.mugs.p) === "10%" && BIN.mugs.n === 8, "the mugs stem says 10% and 8 mugs");
  must(pct(BIN.bulbs.p) === "4%" && BIN.bulbs.n === 6, "the bulbs twin says 4% and 6 bulbs");
  must(pct(B.minibus.qStr) === "70%" && BIN.minibus.n === 5, "the minibus item says full on 70% of 5 trips");
  must(BIN.parcels.n === 5 && BIN.trains.n === 6 && BIN.hotel.n === 8 && BIN.level.n === 3 && BIN.dice.n === 5, "trial counts named in stems");
  must(BIN.cafe.n === 6 && BIN.fair.n === 8 && BIN.cards.n === 6 && BIN.sprint.n === 4 && BIN.archer.n === 6 && BIN.quiz.n === 5, "trial counts named in stems");
}

/**
 * Re-evaluates a solutionProgram in floating point, independently of the exact arithmetic that
 * printed it: every "… = value" segment must agree with its own expression to 1e-9.
 */
function checkProgram(id, program) {
  for (const seg of program.split(";")) {
    const m = /^\s*(?:[a-z0-9]+\s*[:=]\s*)?(.+?)\s*=\s*([0-9./]+)\s*$/i.exec(seg);
    if (!m) continue;
    const expr = m[1].replace(/\^/g, "**");
    if (!/^[0-9.+\-*/() ]+$/.test(expr)) continue;
    const got = Function(`return (${expr});`)();
    const want = m[2].includes("/") ? Number(m[2].split("/")[0]) / Number(m[2].split("/")[1]) : Number(m[2]);
    if (Math.abs(got - want) > 1e-9) throw new Error(`${id}: solutionProgram segment "${seg.trim()}" evaluates to ${got}`);
  }
}

// ---------------------------------------------------------------------------
// Figures (note)
// ---------------------------------------------------------------------------

const T = B.throws;
const BU = B.bus;
const K = B.kicks;
const RF = B.raffle;

/** The free-throw table: one row per number of scores, its term and its exact probability. */
const throwRows = [0, 1, 2, 3, 4].map((r) => [r, termWords(T, r), e(T.term(r))]);
const figLadder = bTable({
  head: ["scores", "term", "probability"],
  rows: throwRows,
  total: ["total of the five", e(T.sum(0, 4))],
  title: `Table of the five outcomes of 4 free throws with p = 0.8 and q = 0.2: 0 scores ${e(T.term(0))}, 1 score ${e(T.term(1))}, 2 scores ${e(T.term(2))}, 3 scores ${e(T.term(3))}, 4 scores ${e(T.term(4))}, total 1`,
});
const figLadderShaded = bTable({
  head: ["scores", "term", "probability"],
  rows: throwRows,
  total: ["total of the five", e(T.sum(0, 4))],
  shade: [2, 4],
  title: `The free-throw table with the rows for 2, 3 and 4 scores shaded: at least 2 scores`,
});
const figAnatomy = bAnatomy({
  pieces: [
    { text: String(BU.coef(2)), x: 58, notes: ["coefficient", `from row ${BU.n}`] },
    { text: "×", x: 124 },
    { text: `${BU.pStr}${sup(2)}`, x: 196, notes: ["p squared", "2 late days"] },
    { text: "×", x: 268 },
    { text: `${BU.qStr}${sup(3)}`, x: 336, notes: ["q cubed", "3 on time"] },
  ],
  title: `The term for exactly 2 late buses in 5 days taken apart: the coefficient ${BU.coef(2)}, ${BU.pStr} squared and ${BU.qStr} cubed`,
});
const PHRASES = [
  ["at least 2", [2, 3, 4, 5, 6]],
  ["at most 2", [0, 1, 2]],
  ["more than 2", [3, 4, 5, 6]],
  ["fewer than 2", [0, 1]],
];
const figDots = bDots({
  n: 6,
  rows: PHRASES,
  title: "For 6 trials, a row of dots 0 to 6 for each of four phrases, filled where the phrase includes that number of successes",
});

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

// The twists' gate numbers, tied to their prose.
const SEED = { fail: "0.125", n: 6, r: 5 };
if (e(bSub(big(1n), rat(SEED.fail))) !== "0.875") throw new Error("g10 numbers are stale");
const SPIN = { five: 5, one: 1, n: 4, total: 12, p: "0.4" };
const spinQ = e(bSub(big(1n), rat(SPIN.p)));
const spinTotal = (k) => SPIN.five * k + SPIN.one * (SPIN.n - k);
if (spinTotal(2) !== SPIN.total || spinTotal(3) === SPIN.total || spinTotal(1) === SPIN.total) throw new Error("g11 numbers are stale");

const blocks = [
  {
    type: "hero",
    lede: "Four free throws, each scored with probability 0.8: how likely is exactly three, or at least two? Every answer like that is one or more terms of (p + q)ⁿ with the chances put in for p and q. This lesson turns that into a method you can write out line by line.",
    can: [
      "Name the success and write down p, q and n before any arithmetic",
      "Work out the probability of exactly r successes as one term, coefficient and powers shown",
      "Find at least, at most, more than and fewer than, using 1 minus a bracket when it is shorter",
    ],
    minutes: 0,
  },
  { type: "h", text: "Four throws, five outcomes", role: "idea" },
  {
    type: "p",
    md: "Aoife scores 80% of her free throws, and one throw does not affect the next. She takes four, so she could score 0, 1, 2, 3 or all 4: five outcomes to put a probability on. Each is one term of $(p + q)^{4}$, with $p = 0.8$ for a score and $q = 0.2$ for a miss.",
  },
  {
    type: "figure",
    alt: `A table with a row for each number of scores from 0 to 4, giving the term and its probability: 0 scores, ${termWords(T, 0)} = ${e(T.term(0))}; 1 score, ${termWords(T, 1)} = ${e(T.term(1))}; 2 scores, ${termWords(T, 2)} = ${e(T.term(2))}; 3 scores, ${termWords(T, 3)} = ${e(T.term(3))}; 4 scores, ${termWords(T, 4)} = ${e(T.term(4))}. The total of the five is 1.`,
    svg: figLadder,
    caption: `The coefficients ${ROWS[4].join(", ")} are row 4 of Pascal's triangle. The five probabilities total exactly 1: one outcome must happen.`,
  },
  {
    type: "gate",
    id: "g1",
    kind: "number",
    prompt: "In the table of Aoife's four free throws, what is the probability that she scores exactly 2?",
    answer: e(T.term(2)),
    explain: `Read the row for 2 scores: $6 \\times 0.8^{2} \\times 0.2^{2} = 6 \\times ${pw(T.p, 2)} \\times ${pw(T.q, 2)} = ${e(T.term(2))}$. The 6 is the middle number of row 4 of Pascal's triangle.`,
  },

  { type: "h", text: "Watch the terms build up", role: "idea" },
  {
    type: "p",
    md: "The PhET Plinko board drops balls through rows of pegs. At each peg a ball bounces right with the probability you set, so each row is a trial and a right bounce is a success. The bin a ball lands in counts its right bounces, as $r$ counts successes.",
  },
  plinkoBlock(
    "Open the Lab screen. Set 4 rows and a binary probability of 0.8, then drop at least 500 balls. Before you start, use the free-throw table above to predict which two bins will fill most, and roughly what fraction of the balls each should hold.",
  ),
  {
    type: "gate",
    id: "g9",
    kind: "choice",
    prompt: "On a Plinko board with 4 rows and probability 0.8, bins 3 and 4 fill to about the same height. Which fact from the free-throw table explains that?",
    options: [`P(3) and P(4) are both ${e(T.term(3))}`, "The board is symmetrical, so every bin fills equally", "Bin 4 is the last bin, so the balls collect there"],
    answer: `P(3) and P(4) are both ${e(T.term(3))}`,
    explain: `$4 \\times 0.8^{3} \\times 0.2 = ${e(T.term(3))}$ and $0.8^{4} = ${e(T.term(4))}$. The two terms are equal, so over hundreds of balls those two bins hold about the same share.`,
  },

  { type: "h", text: "When the binomial model fits", role: "idea" },
  {
    type: "p",
    md: "The terms of $(p + q)^{n}$ are probabilities only when four things are true.\nThere is a **fixed number of trials**, $n$.\nEach trial has **two outcomes**, called success and failure.\nThe **probability of success is the same** on every trial.\nThe trials are **independent**: one result does not change the next.\nRolling a fair dice 6 times and counting the sixes passes all four.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: "Using the four checks for a binomial model, which of these situations can be modelled with the binomial expansion?",
    options: [
      "A fair dice is rolled 8 times and the number of sixes is counted",
      "Three sweets are taken from a bag of ten without replacement and the red ones are counted",
      "Cards are dealt from a pack until the first ace appears, and the cards dealt are counted",
    ],
    answer: "A fair dice is rolled 8 times and the number of sixes is counted",
    explain: "Eight rolls give a fixed $n = 8$, two outcomes, $p = \\frac{1}{6}$ on every roll and independent rolls. Taking sweets without replacement changes the probability after each draw, and dealing until an ace has no fixed number of trials.",
  },

  { type: "h", text: "Name the success first", role: "idea" },
  {
    type: "p",
    md: `The success is whatever the question counts, even when it sounds like bad news. For a bus late on exactly 2 of 5 school days, the success is **late**. If the bus is on time on ${pct(BU.qStr)} of days, that ${pct(BU.qStr)} belongs to $q$.`,
  },
  {
    type: "p",
    md: `Write four labels before any arithmetic:\nSuccess: the bus is late.\n$p = ${BU.pStr}$ (late)\n$q = ${BU.qStr}$ (on time)\n$n = ${BU.n}$ (school days)`,
  },
  {
    type: "callout",
    kind: "examiner",
    title: "The swap examiners keep reporting",
    md: "Writing the probability of the other outcome in for $p$ is the slip named most often in this question: 0.3 and 0.7 mixed in one year, 0.2 and 0.8 in two others. The four labels stop it before it starts.",
    source: q2022,
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: "Write the four labels for this: a phone battery passes a quality check with probability 0.96, and a technician counts how many of 5 batteries fail. What is $p$?",
    answer: "0.04",
    explain: "The technician counts failures, so a failed battery is the success here: $p = 0.04$, which is $1 - 0.96$, then $q = 0.96$ and $n = 5$.",
  },

  { type: "h", text: "Exactly r: one term", role: "variant" },
  {
    type: "figure",
    alt: `The term ${BU.coef(2)} × ${BU.pStr}² × ${BU.qStr}³ with a label under each piece: ${BU.coef(2)} is the coefficient from row 5 of Pascal's triangle, ${BU.pStr}² is p squared for 2 late days, ${BU.qStr}³ is q cubed for 3 days on time.`,
    svg: figAnatomy,
    caption: "Every exactly-r term has three pieces: a coefficient from Pascal's triangle, p to the number of successes, q to the number of failures.",
  },
  {
    type: "p",
    md: `Exactly $r$ successes is the term of $(p + q)^{n}$ that contains $p^{r}$. The power of $p$ counts the successes, the power of $q$ counts the failures, and the powers add up to $n$. The coefficient is the matching number in row $n$ of Pascal's triangle.\nFor exactly 2 late buses in 5 days the term is $${symTerm(5, 2)}$.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the coefficient is there",
    md: `Write L for late and O for on time. Two late days can fall in ${BU.coef(2)} different places among 5 days: LLOOO, LOLOO, LOOLO and so on. Each arrangement has probability $${BU.pStr}^{2} \\times ${BU.qStr}^{3}$ and no two can happen at once, so the ${BU.coef(2)} equal amounts add. Row 5 of Pascal's triangle counts the arrangements.`,
  },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: "A term in the expansion of $(p + q)^{6}$ contains $p^{4}$. What is the power of $q$ in that term?",
    answer: "2",
    explain: `The powers in every term of $(p + q)^{6}$ add up to 6, so $q$ has the power $6 - 4 = 2$. The term is $${symTerm(6, 4)}$: 4 successes and 2 failures.`,
  },

  { type: "h", text: "At least r: use the complement", role: "variant" },
  {
    type: "figure",
    alt: `The free-throw table again, with the rows for 2, 3 and 4 scores shaded and boxed. The rows for 0 and 1 scores are left plain.`,
    svg: figLadderShaded,
    caption: "The shaded rows are 'at least 2'. The two plain rows are the ones to take away from 1.",
  },
  {
    type: "p",
    md: "'At least 2' of Aoife's four throws means 2, 3 or 4 scores: three shaded rows. You could add those three. Because all five rows add up to 1, it is shorter to take away the two rows you do not want:\n$P(\\text{at least 2}) = 1 - \\left(P(0) + P(1)\\right)$\nKeep every figure your calculator shows until the last line.",
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: `A footballer takes ${K.n} free kicks, each on target with probability ${K.pStr}, so $P(0) = ${e(K.term(0))}$ and $P(1) = ${e(K.term(1))}$. Work out the probability that at least 2 are on target, to 4 decimal places.`,
    answer: `${v4(K.atLeast(2))} | ${e(K.atLeast(2))}`,
    explain: `$1 - (${e(K.term(0))} + ${e(K.term(1))}) = 1 - ${e(K.sum(0, 1))} = ${e(K.atLeast(2))}$, which is ${v4(K.atLeast(2))}. Adding $P(2)$ up to $P(5)$ gives the same value with four terms instead of two.`,
  },
  {
    type: "p",
    md: `The whole of $P(0) + P(1)$ comes off the 1, so it goes inside a bracket: $1 - (${e(T.term(0))} + ${e(T.term(1))})$ is ${e(T.atLeast(2))}. Leave the bracket out and only $P(0)$ is subtracted, while $P(1)$ is added on: for Aoife that gives ${re("note#bracket", M.bracket)}, which cannot be a probability. Write '1 − (' first, then fill the bracket.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why a sensible-looking answer is not safe",
    md: `With ${RF.n} raffle tickets that each win with probability ${RF.pStr}, $P(0) = ${e(RF.term(0))}$ and $P(1) = ${e(RF.term(1))}$. The unbracketed line gives $1 - ${e(RF.term(0))} + ${e(RF.term(1))} = ${re("note#raffle", M.bracket)}$, which looks like a perfectly good probability. It is nowhere near the chance of at least 2 winning tickets.`,
  },
  {
    type: "gate",
    id: "g7",
    kind: "number",
    prompt: `For ${RF.n} raffle tickets that each win with probability ${RF.pStr}, $P(0) = ${e(RF.term(0))}$ and $P(1) = ${e(RF.term(1))}$. Work out the probability that at least 2 tickets win, with the bracket in place.`,
    answer: `${e(RF.atLeast(2))} | ${v4(RF.atLeast(2))}`,
    explain: `$1 - (${e(RF.term(0))} + ${e(RF.term(1))}) = 1 - ${e(RF.sum(0, 1))} = ${e(RF.atLeast(2))}$. The unbracketed ${re("note#raffle", M.bracket)} is about ${timesWords(route("note#raffle", M.bracket), RF.atLeast(2))} times too big.`,
  },

  { type: "h", text: "At most, more than, fewer than", role: "variant" },
  {
    type: "figure",
    alt: "For 6 trials, four rows of seven dots numbered 0 to 6. At least 2: dots 2 to 6 filled. At most 2: dots 0, 1 and 2 filled. More than 2: dots 3 to 6 filled. Fewer than 2: dots 0 and 1 filled.",
    svg: figDots,
    caption: "Six trials. A filled dot is a number of successes the phrase includes: watch whether 2 itself is filled.",
  },
  {
    type: "p",
    md: "Every phrase names a set of whole numbers of successes, and the boundary is where marks go. 'At most 2' includes 2; 'more than 2' and 'fewer than 2' do not. Write the numbers out first, then take the shorter route: add those terms, or take all the others away from 1.",
  },
  {
    type: "p",
    md: "In 6 trials, 'more than 2' is 3, 4, 5 or 6: four terms to add, or $1 - (P(0) + P(1) + P(2))$ with three. 'At most 2' is $P(0) + P(1) + P(2)$ directly.",
  },
  {
    type: "gate",
    id: "g8",
    kind: "choice",
    prompt: "In 6 games, which numbers of wins does 'more than 4 wins' mean?",
    options: ["5 or 6", "4, 5 or 6", "0, 1, 2, 3 or 4"],
    answer: "5 or 6",
    explain: "More than 4 starts at 5, so the probability is $P(5) + P(6)$. '4 or more' would include 4, and 0 to 4 is 'at most 4', the other side of the boundary.",
  },

  { type: "h", text: "See it done", role: "see" },
  {
    type: "p",
    md: `**Question.** A bus is on time on ${pct(BU.qStr)} of school days, independently. Find the probability that it is late on exactly 2 of the ${BU.n} days from Monday to Friday. ${FOUR_DP}`,
  },
  {
    type: "p",
    md: `**Line 1.** Late is the success: $p = ${BU.pStr}$, $q = ${BU.qStr}$, $n = ${BU.n}$.\n**Line 2.** $P(\\text{exactly 2 late}) = ${symTerm(5, 2)}$\n**Line 3.** $= ${numTerm(BU, 2)}$\n**Line 4.** $= ${BU.coef(2)} \\times ${pw(BU.p, 2)} \\times ${pw(BU.q, 3)}$\n**Line 5.** $= ${e(BU.term(2))}$\n**Line 6.** $= ${v4(BU.term(2))}$ to 4 decimal places.\nThe method marks are for line 2: the term with its coefficient and powers.`,
  },
  {
    type: "video",
    videoId: "9Y4bhtNSW8w",
    title: "Pascal's Triangle / Binomial / Probability",
    channel: "P McAleavey",
    why: "A Northern Ireland teacher takes Pascal's triangle, the expansion and binomial probability for CCEA Further Mathematics. Pause at each probability and check that its working has the lines above: the labels, the term, the numbers in it, the rounding.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `A footballer's free kick is on target with probability ${K.pStr}, independently each time. She takes ${K.n} free kicks. Work out the probability that exactly 1 is on target, to 4 decimal places.`,
    answer: `${v4(K.term(1))} | ${e(K.term(1))}`,
    explain: `$p = ${K.pStr}$, $q = ${K.qStr}$, $n = ${K.n}$, and exactly 1 is the term $${symTerm(K.n, 1)}$: $${K.coef(1)} \\times ${K.pStr} \\times ${K.qStr}^{4} = ${K.coef(1)} \\times ${K.pStr} \\times ${pw(K.q, 4)} = ${e(K.term(1))}$, which is ${v4(K.term(1))}.`,
  },

  { type: "h", text: "Exam twists", role: "twists" },
  {
    type: "p",
    md: "**The probability in disguise.** It has come as a fraction (2019), in words (2021) and as a percentage (2026). Turn it into $p$ at once, and keep a fraction exact rather than rounding it.",
  },
  {
    type: "p",
    md: "**The other outcome is given.** The stem states one outcome's chance, then counts the other (2019, 2022). What is counted is the success, so $p$ is 1 minus the stated value: write that before anything else.",
  },
  {
    type: "gate",
    id: "g10",
    kind: "choice",
    prompt: `A seed fails to germinate with probability one in eight. A question asks for the probability that exactly ${SEED.r} of ${SEED.n} seeds germinate. Which first line is right?`,
    options: [`$p = 0.875$, $q = 0.125$, $n = ${SEED.n}$`, `$p = 0.125$, $q = 0.875$, $n = ${SEED.n}$`, `$p = 0.875$, $q = 0.125$, $n = ${SEED.r}$`],
    answer: `$p = 0.875$, $q = 0.125$, $n = ${SEED.n}$`,
    explain: `Germinating is what is counted, so it is the success: $p = 0.875$, which is $1 - 0.125$, and $q = 0.125$. There are ${SEED.n} seeds, so $n = ${SEED.n}$; the ${SEED.r} is $r$, the number of successes asked for.`,
  },
  {
    type: "p",
    md: "**The count is hidden in the story.** In 2025 the chance was given per day and the question asked about a week of school days, so $n = 5$ came from the calendar rather than from the stem.",
  },
  {
    type: "p",
    md: "**A total, not a count.** In 2024 a points total from three spins had to become a number of times one score came up. List the ways to make the total first.",
  },
  {
    type: "gate",
    id: "g11",
    kind: "choice",
    prompt: `A spinner scores ${SPIN.five} points with probability ${SPIN.p}, or ${SPIN.one} point otherwise. It is spun ${SPIN.n} times. Which event is a total of exactly ${SPIN.total} points?`,
    options: [`Exactly two spins score ${SPIN.five}`, `Exactly three spins score ${SPIN.five}`, `At least two spins score ${SPIN.five}`],
    answer: `Exactly two spins score ${SPIN.five}`,
    explain: `Two ${SPIN.five}s and two ${SPIN.one}s make $${SPIN.five} + ${SPIN.five} + ${SPIN.one} + ${SPIN.one} = ${spinTotal(2)}$; three ${SPIN.five}s make ${spinTotal(3)}, so 'at least two' would include totals that are too big. The probability is then one term: $${ROWS[SPIN.n][2]}(${SPIN.p})^{2}(${spinQ})^{2}$.`,
  },

  { type: "h", text: "You can now" },
  {
    type: "p",
    md: "Check the four conditions, name the success, then write $p$, $q$ and $n$.\nWrite exactly $r$ as one term: the coefficient, $p^{r}$ and $q^{n-r}$.\nTurn at least, at most, more than and fewer than into terms, bracketed when they come off 1.\nTranslate the story first: a fraction, a percentage, a week, a points total.\nRound once, at the end.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "After the triangle and the expansion come the probabilities: usually exactly $r$ for about 3 marks, then at least $r$ for 3 more, each to 4 decimal places. The first marks are for the term with its coefficient and powers, the last for the rounded value. Stuck? Write the labels and the term with the right powers: that line earns marks on its own.",
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.02` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
];

// The honest minute estimate: words at 180 a minute plus 40 seconds a gate (the app's own rule).
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
// Scheme helpers
// ---------------------------------------------------------------------------

/** The three-mark scheme for exactly r, in CCEA's M1 / W1 / W1 layout. */
const exactlyScheme = (b, r, successWords) => [
  {
    id: "M1",
    code: "M",
    marks: 1,
    for: `$${symTerm(b.n, r).replace(/^\d+/, "")}$: the power of $p$ is the number of ${successWords} and the powers add up to ${b.n}`,
    accept: [`${symTerm(b.n, r).replace(/^\d+/, "")}`],
  },
  { id: "W1", code: "W", marks: 1, for: `$${symTerm(b.n, r)}$, the coefficient ${b.coef(r)} from row ${b.n} of Pascal's triangle`, accept: [`${numTerm(b, r)}`], dependsOn: ["M1"] },
  { id: "W2", code: "W", marks: 1, for: `${v4(b.term(r))}`, dependsOn: ["W1"] },
];

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

const Q = (n) => `q.${TOPIC}.${n}`;
const W = (n, part = "main") => `${Q(n)}#${part}`;
const qq = (n, extra) => ({
  id: Q(n),
  topic: TOPIC,
  specRefs: SPEC,
  tier: "untiered",
  paper: PAPER,
  figures: [],
  version: 1,
  verification: `ver.${Q(n)}`,
  ...extra,
});

const questions = [];

// 0001 — naming the success when the stem states the other outcome
{
  const b = B.loaves;
  questions.push(
    qq("0001", {
      style: "practice",
      difficulty: 2,
      ao: ["AO1", "AO3"],
      commandWords: ["Write down", "Calculate"],
      emphasis: ["naming the success", "p and q", "exactly r"],
      context: { setting: "Sourdough loaves that rise evenly or split in a bakery oven", original: true },
      parts: [
        {
          id: "a",
          stem: `A bakery finds that 88% of its sourdough loaves rise evenly in the oven and the rest split. Whether one loaf splits does not affect any other.\nSeven loaves are baked. Orla wants the probability that exactly 1 of them splits.\nWrite down the value of $p$ she should use.`,
          marks: 1,
          answer: probExact(b.p),
          scheme: [{ id: "W1", code: "W", marks: 1, for: `$p = ${b.pStr}$, the probability that a loaf splits` }],
          hints: ["What is Orla counting?", "The success is the outcome being counted, so p is its probability."],
          workedSolution: `Orla is counting loaves that split, so a split loaf is the success.\n$p = 1 - 0.88 = ${b.pStr}$ and $q = ${b.qStr}$.`,
          commonErrors: [
            ce(W("0001", "a"), M.swap, `${b.qStr} is the probability that a loaf rises evenly, but Orla is counting the loaves that split. The success is the outcome being counted, so $p = 1 - ${b.qStr} = ${b.pStr}$.`, 0, q2022, { exact: true }),
          ],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: `Calculate the probability that exactly 1 of the seven loaves splits.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(b.term(1)),
          scheme: exactlyScheme(b, 1, "split loaves"),
          hints: ["Exactly 1 split means 1 split and 6 even: the term with $p^{1}q^{6}$.", "Row 7 of Pascal's triangle starts 1, 7, 21."],
          workedSolution: `$p = ${b.pStr}$, $q = ${b.qStr}$, $n = 7$.\n$P(\\text{exactly 1 splits}) = ${symTerm(7, 1)} = ${numTerm(b, 1)}$\n$= 7 \\times ${b.pStr} \\times ${pw(b.q, 6)} = ${shown(b.term(1))}$\n$= ${v4(b.term(1))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0001", "b"), M.coef, `That is $${b.pStr} \\times ${b.qStr}^{6}$, the probability of one particular order, such as the first loaf splitting and the other six rising. The split loaf could be any of the 7, so multiply by the coefficient 7: ${v4(b.term(1))}.`, 1, q2022),
            ce(W("0001", "b"), M.rounding, `The digits are right up to the last one, but ${shown(b.term(1))} rounds up to ${v4(b.term(1))}: the fifth decimal place is ${d5(b.term(1))}, so the fourth goes up. Round the final value; do not cut it off.`, 2, q2024),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 4,
      timeAllowanceSec: timeFor(4),
      skeleton: "(a)write-down1|(b)calculate3",
      examinerSources: [q2022, q2024],
      solutionProgram: `a: 1 - ${BIN.loaves.rises} = ${b.pStr}; b: 7 * ${b.pStr} * ${b.qStr}^6 = ${e(b.term(1))}`,
    }),
  );
}

// 0002 — exactly r, p stated directly
{
  const b = B.serve;
  questions.push(
    qq("0002", {
      style: "practice",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Calculate"],
      emphasis: ["exactly r", "coefficient"],
      context: { setting: "First serves landing in during a tennis match", original: true },
      parts: [
        {
          id: "main",
          stem: `A tennis player gets 65% of her first serves in, independently of each other. She hits 6 first serves.\nCalculate the probability that exactly 4 of them go in.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(b.term(4)),
          scheme: exactlyScheme(b, 4, "serves in"),
          hints: ["Success is a serve that goes in, so $p = 0.65$.", "Exactly 4 in means 4 in and 2 out: which term of $(p + q)^{6}$ has $p^{4}$?"],
          workedSolution: `$p = ${b.pStr}$, $q = ${b.qStr}$, $n = 6$.\n$P(\\text{exactly 4 in}) = ${symTerm(6, 4)} = ${numTerm(b, 4)}$\n$= 15 \\times ${pw(b.p, 4)} \\times ${pw(b.q, 2)} = ${shown(b.term(4))}$\n$= ${v4(b.term(4))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0002"), M.swap, `The term is right but the numbers are the wrong way round: $15 \\times ${b.qStr}^{4} \\times ${b.pStr}^{2}$ is the probability of exactly 4 serves going out. With $p = ${b.pStr}$ for a serve in, the answer is ${v4(b.term(4))}.`, 2, q2019),
            ce(W("0002"), M.coef, `That is one order only, such as in-in-in-in-out-out. There are 15 orders with 4 serves in and 2 out, the 15 in row 6 of Pascal's triangle, so the probability is 15 times as big: ${v4(b.term(4))}.`, 1, q2023),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(main)calculate3",
      examinerSources: [q2019, q2023],
      solutionProgram: `15 * ${b.pStr}^4 * ${b.qStr}^2 = ${e(b.term(4))}`,
    }),
  );
}

// 0003 — exactly r when the stem gives the other outcome's probability
{
  const b = B.recycle;
  questions.push(
    qq("0003", {
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO3"],
      commandWords: ["Calculate"],
      emphasis: ["naming the success", "exactly r"],
      context: { setting: "Households in a town that do or do not recycle glass", original: true },
      parts: [
        {
          id: "main",
          stem: `In a town, ${pct(b.recycles ?? BIN.recycle.recycles)} of households recycle their glass. Seven households are chosen at random.\nCalculate the probability that exactly 2 of the seven do not recycle their glass.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(b.term(2)),
          scheme: exactlyScheme(b, 2, "households that do not recycle"),
          hints: ["What is being counted? Households that do NOT recycle.", `So $p = ${b.pStr}$, and the term has $p^{2}q^{5}$.`],
          workedSolution: `The count is of households that do not recycle, so $p = ${b.pStr}$ and $q = ${b.qStr}$, $n = 7$.\n$P(\\text{exactly 2}) = ${symTerm(7, 2)} = ${numTerm(b, 2)}$\n$= 21 \\times ${pw(b.p, 2)} \\times ${pw(b.q, 5)} = ${e(b.term(2))}$\n$= ${v4(b.term(2))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0003"), M.swap, `${b.qStr} is the probability that a household does recycle, but the question counts the ones that do not. With $p = ${b.pStr}$ the term is $21 \\times ${b.pStr}^{2} \\times ${b.qStr}^{5} = ${v4(b.term(2))}$.`, 2, q2022),
            ce(W("0003"), M.coef, `That is one arrangement of the 2 non-recyclers among the 7 households. Row 7 of Pascal's triangle gives 21 arrangements, so multiply by 21: ${v4(b.term(2))}.`, 1, q2022),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(main)calculate3",
      examinerSources: [q2022],
      solutionProgram: `21 * ${b.pStr}^2 * ${b.qStr}^5 = ${e(b.term(2))}`,
    }),
  );
}

// 0004 — the simple cases: all and none
{
  const b = B.level;
  questions.push(
    qq("0004", {
      style: "practice",
      difficulty: 1,
      ao: ["AO1"],
      commandWords: ["Find"],
      emphasis: ["all", "none", "keeping it simple"],
      context: { setting: "Completing a level of a video game on each of three attempts", original: true },
      parts: [
        {
          id: "a",
          stem: `Each time Niall plays a particular level of a video game, he completes it with probability ${b.pStr}, independently of his other attempts. He plays the level 3 times.\nFind the probability that he completes it on all three attempts.`,
          marks: 1,
          answer: probExact(b.term(3)),
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${b.pStr}^{3} = ${e(b.term(3))}$` }],
          hints: ["All three is a single term with coefficient 1.", "It is just $p^{3}$."],
          workedSolution: `All three completed is the term $p^{3}$, with coefficient 1 and no $q$.\n$${b.pStr}^{3} = ${e(b.term(3))}$`,
          commonErrors: [ce(W("0004", "a"), M.notNeeded, `$1 - ${b.pStr}^{3}$ is the probability that he fails at least once. The question asks for all three completed, which is $${b.pStr}^{3} = ${e(b.term(3))}$ with nothing taken from 1.`, 0, q2019, { exact: true })],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: "Find the probability that he does not complete the level on any of the three attempts.",
          marks: 2,
          answer: probExact(b.term(0)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `$q^{3}$ with $q = ${b.qStr}$`, accept: [`${b.qStr}^3`] },
            { id: "W1", code: "W", marks: 1, for: `${e(b.term(0))}`, dependsOn: ["M1"] },
          ],
          hints: ["Not completing is the failure, with probability q.", `$q = 1 - ${b.pStr}$.`],
          workedSolution: `Not completing has probability $q = ${b.qStr}$ each time.\nNone completed is the term $q^{3} = ${b.qStr}^{3} = ${e(b.term(0))}$.`,
          commonErrors: [
            ce(W("0004", "b"), M.swap, `$${b.pStr}^{3}$ is the probability of completing all three, part (a). Not completing has probability $${b.qStr}$ each time, so the answer is $${b.qStr}^{3} = ${e(b.term(0))}$.`, 1, q2019, { exact: true }),
            ce(W("0004", "b"), M.notNeeded, `$${b.qStr}^{3} = ${e(b.term(0))}$ was already the answer; taking it from 1 gives the probability of completing the level at least once. Nothing needed subtracting here.`, 1, q2019, { exact: true }),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(a)find1|(b)find2",
      examinerSources: [q2019, q2024],
      solutionProgram: `a: ${b.pStr}^3 = ${e(b.term(3))}; b: ${b.qStr}^3 = ${e(b.term(0))}`,
    }),
  );
}

// 0005 — at least one
{
  const b = B.parcels;
  questions.push(
    qq("0005", {
      style: "practice",
      difficulty: 2,
      ao: ["AO1", "AO2"],
      commandWords: ["Calculate"],
      emphasis: ["at least one", "complement"],
      context: { setting: "Parcels from a courier arriving late", original: true },
      parts: [
        {
          id: "main",
          stem: `A courier delivers each parcel late with probability ${b.pStr}, independently. Five parcels are sent.\nCalculate the probability that at least one of them is delivered late.\n${FOUR_DP}`,
          marks: 2,
          answer: prob4(b.atLeast(1)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `$1 - q^{5}$ with $q = ${b.qStr}$`, accept: [`1 - ${b.qStr}^5`] },
            { id: "W1", code: "W", marks: 1, for: `${v4(b.atLeast(1))}`, dependsOn: ["M1"] },
          ],
          hints: ["At least one is every outcome except none.", "Find P(none late) and take it from 1."],
          workedSolution: `$p = ${b.pStr}$, $q = ${b.qStr}$, $n = 5$.\n$P(\\text{none late}) = ${b.qStr}^{5} = ${e(b.term(0))}$\n$P(\\text{at least one late}) = 1 - ${e(b.term(0))} = ${e(b.atLeast(1))}$\n$= ${v4(b.atLeast(1))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0005"), M.atLeast, `${rv(W("0005"), M.atLeast)} is $${b.qStr}^{5}$, the probability that none is late. That is the part you do not want, so take it from 1: ${v4(b.atLeast(1))}.`, 0, q2022),
            ce(W("0005"), M.wrongTerms, `That is the probability of exactly one late parcel. At least one also includes 2, 3, 4 and 5 late, which is why the route is $1 - P(\\text{none})$: ${v4(b.atLeast(1))}.`, 0, q2024),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 2,
      timeAllowanceSec: timeFor(2),
      skeleton: "(main)calculate2",
      examinerSources: [q2022, q2024],
      solutionProgram: `1 - ${b.qStr}^5 = ${e(b.atLeast(1))}`,
    }),
  );
}

// 0006 — at least 2 by the complement, with the bracket
{
  const b = B.mugs;
  questions.push(
    qq("0006", {
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Calculate"],
      emphasis: ["at least r", "the bracket", "rounding once"],
      context: { setting: "Mugs from a pottery with a fault in the glaze", original: true },
      parts: [
        {
          id: "main",
          stem: `A pottery finds that 10% of its mugs have a fault in the glaze, independently of each other. A box holds 8 mugs.\nCalculate the probability that at least 2 mugs in the box have a fault.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(b.atLeast(2)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: "$1 - [P(0) + P(1)]$, or $P(2) + P(3) + \\dots + P(8)$", accept: ["1 - (P(0) + P(1))"] },
            { id: "W1", code: "W", marks: 1, for: `$1 - [${b.qStr}^{8} + 8(${b.pStr})(${b.qStr})^{7}]$`, accept: [`1 - (${b.qStr}^8 + 8 × ${b.pStr} × ${b.qStr}^7)`], dependsOn: ["M1"] },
            { id: "W2", code: "W", marks: 1, for: `${v4(b.atLeast(2))}`, dependsOn: ["W1"] },
          ],
          hints: ["At least 2 leaves out 0 and 1.", "Work out P(0) and P(1), bracket them, and take the bracket from 1."],
          workedSolution: `$p = ${b.pStr}$, $q = ${b.qStr}$, $n = 8$.\n$P(0) = ${b.qStr}^{8} = ${e(b.term(0))}$ and $P(1) = 8 \\times ${b.pStr} \\times ${b.qStr}^{7} = ${e(b.term(1))}$\n$P(\\text{at least 2}) = 1 - (${e(b.term(0))} + ${e(b.term(1))}) = 1 - ${e(b.sum(0, 1))} = ${e(b.atLeast(2))}$\n$= ${v4(b.atLeast(2))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0006"), M.bracket, `The bracket has been left off: $1 - ${e(b.term(0))} + ${e(b.term(1))}$ subtracts $P(0)$ but adds $P(1)$. Both are outcomes you do not want, so write $1 - (P(0) + P(1))$: ${v4(b.atLeast(2))}.`, 1, q2023),
            ce(W("0006"), M.atLeast, `${rv(W("0006"), M.atLeast)} is $P(0) + P(1)$, the probability of fewer than 2 faulty mugs. Your terms are right; the last step is to take that sum from 1: ${v4(b.atLeast(2))}.`, 0, q2022),
            ce(W("0006"), M.rounding, `The working is right, but ${shown(b.atLeast(2))} has been cut off rather than rounded: the next digit is ${d5(b.atLeast(2))}, so the fourth decimal place goes up to give ${v4(b.atLeast(2))}.`, 2, q2019),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(main)calculate3",
      examinerSources: [q2023, q2022, q2019],
      solutionProgram: `1 - (${b.qStr}^8 + 8 * ${b.pStr} * ${b.qStr}^7) = ${e(b.atLeast(2))}`,
    }),
  );
}

// 0007 — at most r
{
  const b = B.trains;
  questions.push(
    qq("0007", {
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Calculate"],
      emphasis: ["at most r", "the boundary"],
      context: { setting: "Delays on a week of morning train journeys", original: true },
      parts: [
        {
          id: "main",
          stem: `Each of Seán's morning trains is delayed with probability ${b.pStr}, independently. He takes 6 trains in a fortnight.\nCalculate the probability that at most 2 of the trains are delayed.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(b.atMost(2)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: "$P(0) + P(1) + P(2)$", accept: ["P(0) + P(1) + P(2)"] },
            { id: "W1", code: "W", marks: 1, for: `$${b.qStr}^{6} + 6(${b.pStr})(${b.qStr})^{5} + 15(${b.pStr})^{2}(${b.qStr})^{4}$`, dependsOn: ["M1"] },
            { id: "W2", code: "W", marks: 1, for: `${v4(b.atMost(2))}`, dependsOn: ["W1"] },
          ],
          hints: ["At most 2 means 0, 1 or 2 delays.", "Three terms: add them."],
          workedSolution: `$p = ${b.pStr}$, $q = ${b.qStr}$, $n = 6$.\n$P(0) = ${b.qStr}^{6} = ${e(b.term(0))}$, $P(1) = 6 \\times ${b.pStr} \\times ${b.qStr}^{5} = ${e(b.term(1))}$, $P(2) = 15 \\times ${b.pStr}^{2} \\times ${b.qStr}^{4} = ${e(b.term(2))}$\n$P(\\text{at most 2}) = ${e(b.term(0))} + ${e(b.term(1))} + ${e(b.term(2))} = ${e(b.atMost(2))}$\n$= ${v4(b.atMost(2))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0007"), M.wrongTerms, `That is $P(0) + P(1)$, which stops one term short. 'At most 2' includes 2 delays, so add $P(2) = ${e(b.term(2))}$ as well: ${v4(b.atMost(2))}.`, 0, q2024),
            ce(W("0007"), M.notNeeded, `That is $1 - (P(0) + P(1) + P(2))$, the probability of more than 2 delays. At most 2 is the three terms themselves, with nothing taken from 1: ${v4(b.atMost(2))}.`, 0, q2019),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(main)calculate3",
      examinerSources: [q2024, q2019],
      solutionProgram: `${b.qStr}^6 + 6 * ${b.pStr} * ${b.qStr}^5 + 15 * ${b.pStr}^2 * ${b.qStr}^4 = ${e(b.atMost(2))}`,
    }),
  );
}

// 0008 — more than r (the boundary)
{
  const b = B.hotel;
  questions.push(
    qq("0008", {
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Calculate"],
      emphasis: ["more than r", "the boundary"],
      context: { setting: "Hotel guests who come down for breakfast", original: true },
      parts: [
        {
          id: "main",
          stem: `At a small hotel, each guest has breakfast with probability ${b.pStr}, independently of the others. One night there are 8 guests.\nCalculate the probability that more than 6 of the guests have breakfast.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(b.moreThan(6)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: "$P(7) + P(8)$", accept: ["P(7) + P(8)"] },
            { id: "W1", code: "W", marks: 1, for: `$8(${b.pStr})^{7}(${b.qStr}) + (${b.pStr})^{8}$`, dependsOn: ["M1"] },
            { id: "W2", code: "W", marks: 1, for: `${v4(b.moreThan(6))}`, dependsOn: ["W1"] },
          ],
          hints: ["More than 6 of 8 means 7 or 8.", "Two terms: $8p^{7}q$ and $p^{8}$."],
          workedSolution: `$p = ${b.pStr}$, $q = ${b.qStr}$, $n = 8$. More than 6 means 7 or 8.\n$P(7) = 8 \\times ${b.pStr}^{7} \\times ${b.qStr} = ${e(b.term(7))}$ and $P(8) = ${b.pStr}^{8} = ${e(b.term(8))}$\n$P(\\text{more than 6}) = ${e(b.term(7))} + ${e(b.term(8))} = ${e(b.moreThan(6))}$\n$= ${v4(b.moreThan(6))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0008"), M.wrongTerms, `That includes $P(6)$. 'More than 6' starts at 7, so 6 itself is left out: $P(7) + P(8) = ${v4(b.moreThan(6))}$.`, 0, q2024),
            ce(W("0008"), M.swap, `The terms $P(7)$ and $P(8)$ are the right ones, but ${b.qStr} has been used for $p$. A guest having breakfast is the success, with $p = ${b.pStr}$: ${v4(b.moreThan(6))}.`, 1, q2022),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(main)calculate3",
      examinerSources: [q2024, q2022],
      solutionProgram: `8 * ${b.pStr}^7 * ${b.qStr} + ${b.pStr}^8 = ${e(b.moreThan(6))}`,
    }),
  );
}

// 0009 — a fraction for p
{
  const b = B.dice;
  questions.push(
    qq("0009", {
      style: "practice",
      difficulty: 3,
      ao: ["AO1"],
      commandWords: ["Calculate"],
      emphasis: ["p as a fraction", "exactly r"],
      context: { setting: "Rolling a fair six-sided dice five times", original: true },
      parts: [
        {
          id: "main",
          stem: `A fair six-sided dice is rolled 5 times.\nCalculate the probability that exactly one of the rolls is a six.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(b.term(1)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: "$pq^{4}$ with $p = \\frac{1}{6}$", accept: ["(1/6)(5/6)^4"] },
            { id: "W1", code: "W", marks: 1, for: "$5pq^{4} = 5\\left(\\frac{1}{6}\\right)\\left(\\frac{5}{6}\\right)^{4}$", accept: ["5(1/6)(5/6)^4"], dependsOn: ["M1"] },
            { id: "W2", code: "W", marks: 1, for: `${v4(b.term(1))}`, dependsOn: ["W1"] },
          ],
          hints: ["A six is the success: $p = \\frac{1}{6}$, $q = \\frac{5}{6}$.", "Keep the fractions until the end."],
          workedSolution: `$p = \\frac{1}{6}$, $q = \\frac{5}{6}$, $n = 5$.\n$P(\\text{exactly one six}) = 5pq^{4} = 5\\left(\\frac{1}{6}\\right)\\left(\\frac{5}{6}\\right)^{4} = \\frac{${b.term(1).n}}{${b.term(1).d}}$\n$= ${v4(b.term(1))}$ to 4 decimal places.`,
          commonErrors: [
            ce(W("0009"), M.swap, `That is $5 \\times \\frac{5}{6} \\times \\left(\\frac{1}{6}\\right)^{4}$, the probability of exactly one roll that is not a six. A six is what is counted, so $p = \\frac{1}{6}$: ${v4(b.term(1))}.`, 2, q2019),
            ce(W("0009"), M.coef, `That is one order, such as a six first and then four others. The six can come on any of the 5 rolls, so multiply by 5: ${v4(b.term(1))}.`, 1, q2023),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(main)calculate3",
      examinerSources: [q2019, q2023],
      solutionProgram: `5 * (1/6) * (5/6)^4 = ${b.term(1).n}/${b.term(1).d}`,
    }),
  );
}

// 0010 — exam-style, the whole of a CCEA-shaped Q4 (8 marks)
const C = B.cafe;
const figGrid = pGrid({
  rows: ROWS,
  upTo: 5,
  fill: [6],
  title: "Pascal's triangle written out from row 0 to row 5, with one row of seven empty boxes underneath for row 6",
});
questions.push(
  qq("0010", {
    style: "exam-style",
    difficulty: 3,
    ao: ["AO1", "AO2", "AO3"],
    commandWords: ["Complete", "Hence", "Write down", "Calculate"],
    emphasis: ["Pascal's triangle", "expansion", "exactly r", "at least r", "the bracket"],
    context: { setting: "Customers in a café ordering a hot chocolate", original: true },
    figures: [figure(figGrid, `Pascal's triangle from row 0 (1) to row 5 (${ROWS[5].join(" ")}), then one row of seven empty boxes, labelled Row 1 (row 6), under the column numbers 1 to 7.`)],
    parts: [
      {
        id: "a",
        stem: "Complete row 6 of Pascal's triangle by writing its seven numbers in the grid, in order from left to right.",
        marks: 1,
        answer: { kind: "table", cells: ROWS[6].map((v, i) => ({ row: 0, col: i, value: v, tolerance: { type: "exact" } })) },
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: `${ROWS[6].join(" ")}` }],
        hints: ["Each number is the sum of the two above it.", "The row starts and ends with 1, and it is symmetrical."],
        workedSolution: `Each entry is the sum of the two above it in row 5 (${ROWS[5].join(" ")}):\n$1$, $1 + 5 = 6$, $5 + 10 = 15$, $10 + 10 = 20$, $10 + 5 = 15$, $5 + 1 = 6$, $1$\nRow 6 is ${ROWS[6].join(", ")}.`,
        commonErrors: [],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: "Hence write down the expansion of $(p + q)^{6}$.",
        marks: 1,
        answer: {
          kind: "algebraic",
          latex: ROWS[6].map((_, r) => symTerm(6, 6 - r)).join(" + "),
          equivalence: "equivalent",
          variables: ["p", "q"],
          form: "expanded",
        },
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$${ROWS[6].map((_, r) => symTerm(6, 6 - r)).join(" + ")}$` }],
        hints: ["Use the row from part (a) as the coefficients.", "The power of p falls from 6 to 0 as the power of q rises from 0 to 6."],
        workedSolution: `$(p + q)^{6} = ${ROWS[6].map((_, r) => symTerm(6, 6 - r)).join(" + ")}$`,
        commonErrors: [],
        requiresWorking: false,
      },
      {
        id: "c",
        stem: `In a café, each customer orders a hot chocolate with probability ${C.pStr}, independently of the others. Six customers come in.\nCalculate the probability that exactly 2 of them order a hot chocolate.\n${FOUR_DP}`,
        marks: 3,
        answer: prob4(C.term(2)),
        scheme: exactlyScheme(C, 2, "hot chocolates"),
        hints: ["Which term of your expansion has $p^{2}$?", `$p = ${C.pStr}$ for a hot chocolate.`],
        workedSolution: `$p = ${C.pStr}$, $q = ${C.qStr}$, $n = 6$.\n$P(\\text{exactly 2}) = ${symTerm(6, 2)} = ${numTerm(C, 2)}$\n$= 15 \\times ${pw(C.p, 2)} \\times ${pw(C.q, 4)} = ${shown(C.term(2))}$\n$= ${v4(C.term(2))}$ to 4 decimal places.`,
        commonErrors: [
          ce(W("0010", "c"), M.swap, `The term $15p^{2}q^{4}$ is right but ${C.qStr} has gone in for $p$. A hot chocolate is the success, so $p = ${C.pStr}$: ${v4(C.term(2))}.`, 2, q2023),
          ce(W("0010", "c"), M.coef, `The 15 from row 6 has been left out, so this is only one of the 15 orders in which 2 of the 6 customers could order a hot chocolate: ${v4(C.term(2))}.`, 1, q2023),
          ce(W("0010", "c"), M.rounding, `The working is right, but ${shown(C.term(2))} rounds up to ${v4(C.term(2))}, not down: the fifth decimal place is ${d5(C.term(2))}.`, 2, q2024),
        ],
        requiresWorking: true,
      },
      {
        id: "d",
        stem: `Calculate the probability that at least 2 of the six customers order a hot chocolate.\n${FOUR_DP}`,
        marks: 3,
        answer: prob4(C.atLeast(2)),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "$1 - [P(0) + P(1)]$", accept: ["1 - (P(0) + P(1))"] },
          { id: "W1", code: "W", marks: 1, for: `$1 - [${C.qStr}^{6} + 6(${C.pStr})(${C.qStr})^{5}]$`, accept: [`1 - (${C.qStr}^6 + 6 × ${C.pStr} × ${C.qStr}^5)`], dependsOn: ["M1"] },
          { id: "W2", code: "W", marks: 1, for: `${v4(C.atLeast(2))}`, dependsOn: ["W1"] },
        ],
        hints: ["At least 2 leaves out 0 and 1.", "Bracket P(0) + P(1) before taking it from 1."],
        workedSolution: `$P(0) = ${C.qStr}^{6} = ${e(C.term(0))}$ and $P(1) = 6 \\times ${C.pStr} \\times ${C.qStr}^{5} = ${e(C.term(1))}$\n$P(\\text{at least 2}) = 1 - (${e(C.term(0))} + ${e(C.term(1))}) = 1 - ${e(C.sum(0, 1))} = ${e(C.atLeast(2))}$\n$= ${v4(C.atLeast(2))}$ to 4 decimal places.`,
        commonErrors: [
          ce(W("0010", "d"), M.bracket, `That is more than 1, so it cannot be a probability. The bracket is missing: $1 - P(0) + P(1)$ adds $P(1)$ back on. Write $1 - (P(0) + P(1))$: ${v4(C.atLeast(2))}.`, 1, q2023),
          ce(W("0010", "d"), M.atLeast, `${rv(W("0010", "d"), M.atLeast)} is $P(0) + P(1)$, the chance of fewer than 2 hot chocolates. Take it from 1 to reach at least 2: ${v4(C.atLeast(2))}.`, 0, q2022),
          ce(W("0010", "d"), M.coef, `$P(1)$ needs its coefficient: $6 \\times ${C.pStr} \\times ${C.qStr}^{5}$, because the one hot chocolate could be ordered by any of the 6 customers. With it, the answer is ${v4(C.atLeast(2))}.`, 1, q2023),
        ],
        requiresWorking: true,
      },
    ],
    totalMarks: 8,
    timeAllowanceSec: timeFor(8),
    skeleton: "(a)complete1|(b)write-down1|(c)calculate3|(d)calculate3",
    examinerSources: [q2023, q2022, q2025],
    solutionProgram: `a: row 6 = ${ROWS[6].join(" ")}; c: 15 * ${C.pStr}^2 * ${C.qStr}^4 = ${e(C.term(2))}; d: 1 - (${C.qStr}^6 + 6 * ${C.pStr} * ${C.qStr}^5) = ${e(C.atLeast(2))}`,
  }),
);

// 0011 — exam-style: fewer than, then hence at least (9 marks)
const F = B.fair;
questions.push(
  qq("0011", {
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2", "AO3"],
    commandWords: ["Write down", "Calculate", "Hence"],
    emphasis: ["q = 1 - p", "exactly r", "fewer than r", "hence at least r"],
    context: { setting: "A prize game at a school fair", original: true },
    parts: [
      {
        id: "a",
        stem: `At a school fair, a player wins a prize on each go at a game with probability ${F.pStr}, independently of other goes. Ruairi has 8 goes.\nWrite down the probability that Ruairi does not win a prize on a single go.`,
        marks: 1,
        answer: probExact(F.q),
        scheme: [{ id: "W1", code: "W", marks: 1, for: `$q = 1 - ${F.pStr} = ${F.qStr}$` }],
        hints: ["Not winning is the other outcome.", "q = 1 − p."],
        workedSolution: `$q = 1 - ${F.pStr} = ${F.qStr}$`,
        commonErrors: [ce(W("0011", "a"), M.swap, `${F.pStr} is the probability of winning. Not winning is the other outcome: $1 - ${F.pStr} = ${F.qStr}$.`, 0, q2022, { exact: true })],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: `Calculate the probability that Ruairi wins exactly 3 prizes.\n${FOUR_DP}`,
        marks: 3,
        answer: prob4(F.term(3)),
        scheme: exactlyScheme(F, 3, "prizes"),
        hints: [`Row 8 of Pascal's triangle is ${rowWords(8)}.`, "The term has $p^{3}q^{5}$."],
        workedSolution: `$p = ${F.pStr}$, $q = ${F.qStr}$, $n = 8$.\n$P(\\text{exactly 3}) = ${symTerm(8, 3)} = ${numTerm(F, 3)}$\n$= 56 \\times ${pw(F.p, 3)} \\times ${pw(F.q, 5)} = ${e(F.term(3))}$\n$= ${v4(F.term(3))}$ to 4 decimal places.`,
        commonErrors: [
          ce(W("0011", "b"), M.swap, `That is $56 \\times ${F.qStr}^{3} \\times ${F.pStr}^{5}$, the chance of exactly 3 goes without a prize. Winning is the success, so $p = ${F.pStr}$: ${v4(F.term(3))}.`, 2, q2022),
          ce(W("0011", "b"), M.coef, `The 56 from row 8 of Pascal's triangle is missing: there are 56 different sets of 3 goes out of 8 on which the prizes could come. With it the answer is ${v4(F.term(3))}.`, 1, q2022),
          ce(W("0011", "b"), M.rounding, `The working is right, but ${e(F.term(3))} rounds up to ${v4(F.term(3))}: the fifth decimal place is ${d5(F.term(3))}.`, 2, q2024),
        ],
        requiresWorking: true,
      },
      {
        id: "c",
        stem: `Calculate the probability that Ruairi wins fewer than 2 prizes.\n${FOUR_DP}`,
        marks: 3,
        answer: prob4(F.fewerThan(2)),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "$P(0) + P(1)$", accept: ["P(0) + P(1)"] },
          { id: "W1", code: "W", marks: 1, for: `$${F.qStr}^{8} + 8(${F.pStr})(${F.qStr})^{7}$`, accept: [`${F.qStr}^8 + 8 × ${F.pStr} × ${F.qStr}^7`], dependsOn: ["M1"] },
          { id: "W2", code: "W", marks: 1, for: `${v4(F.fewerThan(2))}`, dependsOn: ["W1"] },
        ],
        hints: ["Fewer than 2 means 0 or 1.", "Two terms, added."],
        workedSolution: `Fewer than 2 means 0 or 1 prizes.\n$P(0) = ${F.qStr}^{8} = ${e(F.term(0))}$ and $P(1) = 8 \\times ${F.pStr} \\times ${F.qStr}^{7} = ${e(F.term(1))}$\n$P(\\text{fewer than 2}) = ${e(F.term(0))} + ${e(F.term(1))} = ${e(F.fewerThan(2))}$\n$= ${v4(F.fewerThan(2))}$ to 4 decimal places.`,
        commonErrors: [
          ce(W("0011", "c"), M.wrongTerms, `That includes $P(2)$. Fewer than 2 means 0 or 1 only, so the answer is $P(0) + P(1) = ${v4(F.fewerThan(2))}$.`, 0, q2024),
          ce(W("0011", "c"), M.notNeeded, `That is $1 - (P(0) + P(1))$, the probability of at least 2. Fewer than 2 is the sum $P(0) + P(1)$ itself: ${v4(F.fewerThan(2))}.`, 0, q2019),
        ],
        requiresWorking: true,
      },
      {
        id: "d",
        stem: "Hence find the probability that Ruairi wins at least 2 prizes.",
        marks: 2,
        answer: prob4(F.atLeast(2)),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "$1 - $ their answer to part (c)", ft: true, accept: [`1 - ${v4(F.fewerThan(2))}`] },
          { id: "W1", code: "W", marks: 1, for: `${v4(F.atLeast(2))}`, dependsOn: ["M1"] },
        ],
        hints: ["At least 2 and fewer than 2 cover every outcome between them.", "Take part (c) from 1."],
        workedSolution: `At least 2 is everything that is not fewer than 2.\n$1 - ${e(F.fewerThan(2))} = ${e(F.atLeast(2))}$, which is ${v4(F.atLeast(2))} to 4 decimal places.`,
        commonErrors: [
          ce(W("0011", "d"), M.bracket, `That is above 1: $1 - P(0) + P(1)$ adds $P(1)$ on instead of taking it off. 'Hence' points to part (c): $1 - ${v4(F.fewerThan(2))} = ${v4(F.atLeast(2))}$.`, 1, q2023),
          ce(W("0011", "d"), M.atLeast, `That is part (c) again, the probability of fewer than 2. At least 2 is the rest of the outcomes: $1 - ${v4(F.fewerThan(2))} = ${v4(F.atLeast(2))}$.`, 0, q2022),
        ],
        requiresWorking: true,
        followThrough: { fromPart: "c", rule: "use-candidate-value" },
      },
    ],
    totalMarks: 9,
    timeAllowanceSec: timeFor(9),
    skeleton: "(a)write-down1|(b)calculate3|(c)calculate3|(d)find2",
    examinerSources: [q2022, q2024, q2023, q2019],
    solutionProgram: `a: 1 - ${F.pStr} = ${F.qStr}; b: 56 * ${F.pStr}^3 * ${F.qStr}^5 = ${e(F.term(3))}; c: ${F.qStr}^8 + 8 * ${F.pStr} * ${F.qStr}^7 = ${e(F.fewerThan(2))}; d: 1 - ${e(F.fewerThan(2))} = ${e(F.atLeast(2))}`,
  }),
);

// 0012 — depth pass (23 Sep): the top rung, a points total turned into a count of one score (the
// Summer 2024 twist at its hardest: the count needed is itself an 'at least')
{
  const D = B.darts;
  const { high, low, total } = BIN.darts;
  const totals = [0, 1, 2, 3].map((k) => high * k + low * (D.n - k));
  const need = [0, 1, 2, 3].filter((k) => totals[k] >= total);
  if (need.join() !== "2,3") throw new Error("0012: the totals no longer need exactly two or three high scores");
  questions.push(
    qq("0012", {
      style: "practice",
      difficulty: 4,
      ao: ["AO2", "AO3"],
      commandWords: ["Find"],
      emphasis: ["a points total turned into a count", "at least r", "naming the success"],
      context: { setting: `Three darts, each scoring ${high} or ${low} points`, original: true },
      parts: [
        {
          id: "main",
          stem: `In a darts game every dart scores either ${high} points or ${low} points. Each dart Maeve throws scores ${high} with probability ${D.pStr}, independently of her other darts, and otherwise scores ${low}. She throws ${D.n} darts.\nFind the probability that her total is at least ${total} points.`,
          marks: 3,
          answer: probExact(D.atLeast(2)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `A total of at least ${total} needs at least two ${high}s: two make ${totals[2]} and three make ${totals[3]}, but one makes only ${totals[1]}` },
            { id: "M2", code: "M", marks: 1, for: `$3(${D.pStr})^{2}(${D.qStr}) + (${D.pStr})^{3}$`, accept: [`3 × ${D.pStr}^2 × ${D.qStr} + ${D.pStr}^3`], dependsOn: ["M1"] },
            { id: "W1", code: "W", marks: 1, for: `${e(D.atLeast(2))}`, dependsOn: ["M2"] },
          ],
          hints: ["What totals can three darts make? List them.", `Which of those totals are at least ${total}, and how many ${high}s does each need?`],
          workedSolution: `Three darts make ${totals.join(", ")} points, from 0, 1, 2 or 3 darts scoring ${high}.\nAt least ${total} means ${totals[2]} or ${totals[3]}: at least two ${high}s.\nA ${high} is the success: $p = ${D.pStr}$, $q = ${D.qStr}$, $n = ${D.n}$.\n$P(\\text{at least two}) = 3p^{2}q + p^{3}$\n$= 3(${D.pStr})^{2}(${D.qStr}) + (${D.pStr})^{3}$\n$= ${e(D.term(2))} + ${e(D.term(3))}$\n$= ${e(D.atLeast(2))}$`,
          commonErrors: [
            ce(W("0012"), M.wrongTerms, `That counts two ${high}s only, a total of ${totals[2]}. Three ${high}s make ${totals[3]}, which is also at least ${total}, so add $p^{3} = ${e(D.term(3))}$: ${e(D.atLeast(2))}.`, 1, q2024, { exact: true }),
            ce(W("0012"), M.swap, `That gives ${D.qStr} to a ${high}-point dart, but ${D.qStr} is the chance of a ${low}. A ${high} is what the total needs, so $p = ${D.pStr}$: ${e(D.atLeast(2))}.`, 1, q2022, { exact: true }),
            ce(W("0012"), M.coef, `The term for two ${high}s needs its coefficient 3: the ${low}-point dart could be the first, second or third throw. With it the answer is ${e(D.atLeast(2))}.`, 1, q2023, { exact: true }),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(main)find3",
      examinerSources: [q2024],
      solutionProgram: `3 * ${D.pStr}^2 * ${D.qStr} + ${D.pStr}^3 = ${e(D.atLeast(2))}`,
    }),
  );
}

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

const we1 = {
  id: `we.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `A bus is on time on 85% of school days, independently of other days. Find the probability that it is late on exactly 2 of the 5 days from Monday to Friday.\n${FOUR_DP}`,
  steps: [
    {
      n: 1,
      working: `Late is the success: $p = ${BU.pStr}$, $q = ${BU.qStr}$, $n = ${BU.n}$`,
      decision: `Name the outcome the question counts before anything else. The ${pct(BU.qStr)} in the question is the probability of the other outcome, being on time, so it belongs to $q$, and $p$ is what is left: $1 - ${BU.qStr}$.`,
      input: probExact(BU.p),
    },
    {
      n: 2,
      working: `$P(\\text{exactly 2 late}) = ${symTerm(5, 2)}$`,
      decision: `The power of $p$ is the number of late days and the power of $q$ the number of on-time days, and $2 + 3 = 5$. The coefficient ${BU.coef(2)} is the third number in row 5 of Pascal's triangle, ${ROWS[5].join(" ")}.`,
      whyMenu: {
        options: [
          `There are ${BU.coef(2)} different orders in which 2 late days can fall among 5`,
          "The coefficient is always twice the number of successes",
          `${BU.coef(2)} is $5 \\times 2$, the number of days times the number of late days`,
        ],
        correct: 0,
        explain: `Each order, such as LLOOO with L for late and O for on time, has probability $${BU.pStr}^{2} \\times ${BU.qStr}^{3}$. The ${BU.coef(2)} orders cannot happen together, so their probabilities add. That ${BU.coef(2)} is also $5 \\times 2$ here is a coincidence: for 3 late days out of 5 the coefficient is still ${BU.coef(3)}, not 15.`,
      },
      earns: ["M1", "W1"],
      input: { kind: "numeric", value: BU.coef(2), tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] },
    },
    {
      n: 3,
      working: `$= ${numTerm(BU, 2)} = ${BU.coef(2)} \\times ${pw(BU.p, 2)} \\times ${pw(BU.q, 3)} = ${e(BU.term(2))}$`,
      decision: "Substitute, and work each power out in full. Keep every figure the calculator gives: this is not the final line.",
      earns: ["W1"],
      input: prob4(BU.term(2)),
    },
    {
      n: 4,
      working: `$P(\\text{exactly 2 late}) = ${v4(BU.term(2))}$ to 4 decimal places`,
      decision: `Round once, at the end, to the accuracy asked for. The fifth decimal place of ${e(BU.term(2))} is ${d5(BU.term(2))}, so the fourth ${d5(BU.term(2)) >= 5 ? "goes up" : "stays as it is"}.`,
      input: prob4(BU.term(2)),
    },
  ],
  finalAnswer: `$P(\\text{exactly 2 late}) = ${v4(BU.term(2))}$ to 4 decimal places`,
  twin: {
    stem: `A factory finds that 4% of its light bulbs are faulty, independently of each other. A box holds 6 bulbs. Find the probability that exactly 1 bulb in the box is faulty.\n${FOUR_DP}`,
    answer: prob4(B.bulbs.term(1)),
  },
  faded: [
    { showSteps: 2, studentSupplies: [3, 4] },
    { showSteps: 1, studentSupplies: [2, 3, 4] },
  ],
  verification: `ver.we.${TOPIC}.01`,
  version: 1,
};

const A = B.archer;
const we2 = {
  id: `we.${TOPIC}.02`,
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `An archer hits the gold ring with probability ${A.pStr} on each arrow, independently. She shoots 6 arrows. Find the probability that at least 2 of them hit the gold.\n${FOUR_DP}`,
  steps: [
    {
      n: 1,
      working: `Hitting the gold is the success: $p = ${A.pStr}$, $q = ${A.qStr}$, $n = ${A.n}$`,
      decision: "The question counts golds, and gives their probability directly, so $p$ is the stated 0.3.",
      input: probExact(A.p),
    },
    {
      n: 2,
      working: "$P(\\text{at least 2}) = 1 - \\left(P(0) + P(1)\\right)$",
      decision: "At least 2 means 2, 3, 4, 5 or 6 golds: five terms. The outcomes left out are 0 and 1 golds, only two terms, so take those from 1. Write the bracket before any number goes in.",
      whyMenu: {
        options: ["All seven terms add up to 1, so the five wanted terms are 1 minus the other two", "P(0) and P(1) are always the two largest terms", "A calculator cannot add five terms accurately"],
        correct: 0,
        explain: "One of the outcomes 0, 1, 2, 3, 4, 5 or 6 golds must happen, so the seven probabilities total 1. Taking away the two you do not want leaves the five you do, with less arithmetic to go wrong.",
      },
      earns: ["M1"],
    },
    {
      n: 3,
      working: `$P(0) = ${A.qStr}^{6} = ${e(A.term(0))}$ and $P(1) = 6 \\times ${A.pStr} \\times ${A.qStr}^{5} = ${e(A.term(1))}$`,
      decision: `Each term keeps its coefficient: the 6 in front of $P(1)$ is the second number in row 6 of Pascal's triangle, because the one gold could come with any of the 6 arrows.`,
      earns: ["W1"],
      input: { kind: "numeric", value: Number(e(A.term(1))), tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] },
    },
    {
      n: 4,
      working: `$= 1 - (${e(A.term(0))} + ${e(A.term(1))}) = 1 - ${e(A.sum(0, 1))} = ${e(A.atLeast(2))}$`,
      decision: "Add inside the bracket first, then subtract the whole bracket from 1.",
      input: prob4(A.atLeast(2)),
    },
    {
      n: 5,
      working: `$P(\\text{at least 2}) = ${v4(A.atLeast(2))}$ to 4 decimal places`,
      decision: `Round only now. A quick check: 0 or 1 golds out of 6 has probability ${e(A.sum(0, 1))}, a little under a half, so at least 2 should be a little over a half, and it is.`,
      earns: ["W1"],
      input: prob4(A.atLeast(2)),
    },
  ],
  finalAnswer: `$P(\\text{at least 2 golds}) = ${v4(A.atLeast(2))}$ to 4 decimal places`,
  twin: {
    stem: `A quiz has 5 questions, each with 4 options of which one is right. Aisling guesses every answer at random. Find the probability that she gets at least 2 right.\n${FOUR_DP}`,
    answer: prob4(B.quiz.atLeast(2)),
  },
  faded: [
    { showSteps: 3, studentSupplies: [4, 5] },
    { showSteps: 1, studentSupplies: [2, 3, 4, 5] },
  ],
  verification: `ver.we.${TOPIC}.02`,
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
      stem: "Before the lesson, a check on earlier work. The probability that it rains on a given day is 0.27. What is the probability that it does not rain?",
      skill: "The complement of an event (from GCSE Mathematics)",
      options: [
        { id: "a", text: "0.73", correct: true, feedback: "Yes: it either rains or it does not, so the two probabilities total 1 and the complement is $1 - 0.27$. In this topic that gives you $q$ from $p$." },
        { id: "b", text: "0.27", correct: false, feedback: "That is the probability that it does rain. The complement is what is left of 1: $1 - 0.27 = 0.73$." },
        { id: "c", text: "1.27", correct: false, feedback: "A probability cannot be more than 1. Take 0.27 away from 1 rather than adding it." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "Another check on earlier work. A coin is tossed and a fair dice is rolled. What is the probability of a head and a six?",
      skill: "Multiplying probabilities of independent events (from GCSE Mathematics)",
      options: [
        { id: "a", text: "$\\frac{1}{12}$", correct: true, feedback: "Yes: the events are independent, so 'and' multiplies: $\\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}$. Every term of a binomial expansion is built from products like this." },
        { id: "b", text: "$\\frac{2}{3}$", correct: false, misconception: "fm.prob.add-instead-of-multiply", feedback: "That is $\\frac{1}{2} + \\frac{1}{6}$. Adding answers 'a head or a six'; both together multiply: $\\frac{1}{12}$." },
        { id: "c", text: "$\\frac{1}{6}$", correct: false, feedback: "That is the probability of the six alone. The head has to happen too, so multiply by $\\frac{1}{2}$: $\\frac{1}{12}$." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p3",
      stem: "One more, from the lesson on Pascal's triangle. Which of these is row 5 of Pascal's triangle, the row that starts 1, 5?",
      skill: "Building a row of Pascal's triangle by addition",
      options: [
        { id: "a", text: ROWS[5].join(" "), correct: true, feedback: "Yes: each entry is the sum of the two above it in row 4, 1 4 6 4 1. Row $n$ has $n + 1$ numbers." },
        { id: "b", text: ROWS[4].join(" "), correct: false, misconception: "fm.binomial.wrong-power", feedback: "That is row 4, one row too early. The row that starts 1, 5 is row 5, and it has six numbers." },
        { id: "c", text: "1 5 10 5 1", correct: false, misconception: "fm.binomial.wrong-power", feedback: "Row 5 has six numbers, not five, and it is symmetrical: 1 5 10 10 5 1. Add each pair from row 4 to check." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

const MB = B.minibus;
const TR = B.trio;
const GA = B.games;
const post = {
  id: `dx.${TOPIC}.post`,
  topic: TOPIC,
  specRefs: SPEC,
  when: "post",
  items: [
    {
      id: "d1",
      stem: `A school minibus is full on 70% of trips, independently. Which expression gives the probability that it is not full on exactly 2 of 5 trips?`,
      skill: "Naming the success when the stem states the other outcome",
      options: [
        { id: "a", text: `$${numTerm(MB, 2)}$`, correct: true, feedback: `Yes: not full is what is counted, so $p = ${MB.pStr}$ and exactly 2 is $${symTerm(5, 2)}$.` },
        { id: "b", text: `$${numTerm(MB, 2, { pStr: MB.qStr, qStr: MB.pStr })}$`, correct: false, misconception: M.swap, feedback: `That uses ${MB.qStr}, the probability of a full minibus, as $p$. The question counts trips that are not full, so $p = ${MB.pStr}$.` },
        { id: "c", text: `$${numTerm(MB, 2, { coef: 1 })}$`, correct: false, misconception: M.coef, feedback: "The powers are right, but that is one order only. There are 10 ways to choose which 2 of the 5 trips are not full, so the coefficient 10 is needed." },
      ],
      secondsExpected: 40,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: "What is the coefficient of the term for exactly 3 successes in 7 trials?",
      skill: "Reading a coefficient from the right row and position of Pascal's triangle",
      options: [
        { id: "a", text: String(ROWS[7][3]), correct: true, feedback: `Yes: row 7 is ${rowWords(7)}, and the term with $p^{3}q^{4}$ takes ${ROWS[7][3]}.` },
        { id: "b", text: String(ROWS[6][3]), correct: false, misconception: M.power, feedback: `${ROWS[6][3]} comes from row 6. Seven trials need row 7, ${rowWords(7)}, which gives ${ROWS[7][3]}.` },
        { id: "c", text: String(ROWS[7][2]), correct: false, misconception: M.wrongTerms, feedback: `${ROWS[7][2]} is the coefficient for exactly 2 successes in row 7. Count along from 0: the fourth number, ${ROWS[7][3]}, is the one for 3.` },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: "In 5 trials, which numbers of successes does 'at least 3' mean?",
      skill: "Turning 'at least' into a set of terms",
      options: [
        { id: "a", text: "3, 4 or 5", correct: true, feedback: "Yes: at least 3 includes 3 itself and everything above it, up to 5." },
        { id: "b", text: "4 or 5", correct: false, misconception: M.wrongTerms, feedback: "That is 'more than 3'. At least 3 includes 3." },
        { id: "c", text: "0, 1, 2 or 3", correct: false, misconception: M.atLeast, feedback: "That is 'at most 3', the other direction. At least 3 is 3 or more: 3, 4 or 5." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: `In 3 independent trials with $p = ${TR.pStr}$, $P(0) = ${e(TR.term(0))}$ and $P(1) = ${e(TR.term(1))}$. What is the probability of at least 2 successes?`,
      skill: "The complement with its bracket",
      options: [
        { id: "a", text: e(TR.atLeast(2)), correct: true, feedback: `Yes: $1 - (${e(TR.term(0))} + ${e(TR.term(1))}) = ${e(TR.atLeast(2))}$.` },
        { id: "b", text: re(`dx.${TOPIC}.post#d4:b`, M.bracket), correct: false, misconception: M.bracket, feedback: `That is $1 - ${e(TR.term(0))} + ${e(TR.term(1))}$, with the bracket left off, so $P(1)$ was added on. Both terms come off 1: ${e(TR.atLeast(2))}.` },
        { id: "c", text: re(`dx.${TOPIC}.post#d4:c`, M.atLeast), correct: false, misconception: M.atLeast, feedback: `That is $P(0) + P(1)$, the chance of fewer than 2. Take it from 1: ${e(TR.atLeast(2))}.` },
      ],
      secondsExpected: 40,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d5",
      stem: "A calculator shows 0.31415926 for a probability. What is it to 4 decimal places?",
      skill: "Rounding once, at the end, to the accuracy asked for",
      options: [
        { id: "a", text: "0.3142", correct: true, feedback: "Yes: the fifth decimal place is 5, so the fourth rounds up from 1 to 2." },
        { id: "b", text: "0.3141", correct: false, misconception: M.rounding, feedback: "That cuts the value off after four places instead of rounding it. The next digit is 5, so round up: 0.3142." },
        { id: "c", text: "0.314", correct: false, misconception: M.rounding, feedback: "That is 3 decimal places. The question asked for 4: 0.3142." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d6",
      stem: `A player wins a game with probability ${GA.pStr}, independently each time. She plays 3 games. What is the probability that she wins all three?`,
      skill: "The simple case: all successes is p to the power n",
      options: [
        { id: "a", text: e(GA.term(3)), correct: true, feedback: `Yes: all three is the single term $p^{3} = ${GA.pStr}^{3} = ${e(GA.term(3))}$, with coefficient 1.` },
        { id: "b", text: re(`dx.${TOPIC}.post#d6:b`, M.notNeeded), correct: false, misconception: M.notNeeded, feedback: `That is $1 - ${GA.pStr}^{3}$, the chance that she loses at least one game. All three wins is $${GA.pStr}^{3}$ itself.` },
        { id: "c", text: re(`dx.${TOPIC}.post#d6:c`, M.swap), correct: false, misconception: M.swap, feedback: `That is $${GA.qStr}^{3}$, the chance of losing all three. Winning has probability ${GA.pStr}.` },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

const CA = B.cards;
const ftm1 = {
  id: `ftm.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Ciara was asked for the probability that at least 2 of 6 scratch cards win, when each card wins with probability ${CA.pStr}, independently. Her working:`,
  studentWorking: [
    `p = ${CA.pStr}, q = ${CA.qStr}, n = 6`,
    `P(0) = ${CA.qStr}^6 = ${e(CA.term(0))}`,
    `P(1) = 6 × ${CA.pStr} × ${CA.qStr}^5 = ${e(CA.term(1))}`,
    "P(at least 2) = 1 − P(0) + P(1)",
    `= 1 − ${e(CA.term(0))} + ${e(CA.term(1))} = ${re("ftm1", M.bracket)} = ${rv("ftm1", M.bracket)}`,
  ],
  mistakeLine: 4,
  misconception: M.bracket,
  whatWentWrong: "Line 4 has no bracket. Both $P(0)$ and $P(1)$ are outcomes she does not want, so both have to come off the 1: $1 - (P(0) + P(1))$. As written, $P(1)$ is added back on.",
  correction: [
    `p = ${CA.pStr}, q = ${CA.qStr}, n = 6`,
    `P(0) = ${e(CA.term(0))}`,
    `P(1) = ${e(CA.term(1))}`,
    "P(at least 2) = 1 − (P(0) + P(1))",
    `= 1 − ${e(CA.sum(0, 1))} = ${e(CA.atLeast(2))} = ${v4(CA.atLeast(2))}`,
  ],
  marksEarnedAsWritten: ["M1"],
  feedback: `Her two terms are right, and the idea of taking the unwanted outcomes from 1 is right, so the method mark is safe. The marks go at line 4. A quick check would have caught it: with each card winning only one time in ten, at least 2 winners out of 6 should be unlikely, not ${v4(route("ftm1", M.bracket))}.`,
  source: q2023,
};

const SP = B.sprint;
const ftm2 = {
  id: `ftm.${TOPIC}.02`,
  topic: TOPIC,
  specRefs: SPEC,
  stem: `A sprinter's start is judged legal with probability ${SP.qStr}, independently in each race. Rory was asked for the probability that exactly 1 of her next 4 starts is a false start. His working:`,
  studentWorking: [`p = ${SP.qStr}, q = ${SP.pStr}, n = 4`, "P(exactly 1) = 4pq^3", `= 4 × ${SP.qStr} × ${SP.pStr}^3`, `= ${re("ftm2", M.swap)}`],
  mistakeLine: 1,
  misconception: M.swap,
  whatWentWrong: `Line 1 gives $p$ the probability of a legal start, but the question counts false starts. The success is whatever is being counted, so $p = ${SP.pStr}$ and $q = ${SP.qStr}$.`,
  correction: [`p = ${SP.pStr}, q = ${SP.qStr}, n = 4`, "P(exactly 1) = 4pq^3", `= 4 × ${SP.pStr} × ${SP.qStr}^3`, `= ${e(SP.term(1))}`],
  marksEarnedAsWritten: ["M1", "W1"],
  feedback: `Line 2 is exactly right, so the marks for the term are earned; only the numbers going into it are the wrong way round. A quick check catches it: a false start happens about one race in ten, so exactly one in four races is quite likely, and ${re("ftm2", M.swap)} is far too small. With $p = ${SP.pStr}$ the answer is ${e(SP.term(1))}.`,
  source: q2022,
};

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const RP = (n) => `rp.${TOPIC}.${n}`;
const prompts = [
  {
    id: RP("01"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "procedure",
    prompt: "Before any binomial arithmetic, which four things do you write down?",
    answer: "What counts as a success, in the question's own words; p, the probability of a success; q = 1 − p; and n, the number of trials.",
    keyWords: ["success", "number of trials"],
    examUnit: "FM3",
    difficultyPrior: 2,
  },
  {
    id: RP("02"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "formula",
    prompt: "How do you write the probability of exactly r successes in n trials?",
    answer: "As one term of (p + q)ⁿ: the coefficient from row n of Pascal's triangle, times p to the power r, times q to the power n − r. The two powers add up to n.",
    keyWords: ["coefficient", "pascal", "add up to n"],
    examUnit: "FM3",
    difficultyPrior: 3,
  },
  {
    id: RP("03"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "trap",
    prompt: "How do you work out the probability of at least 2 successes, and what must you not leave out?",
    answer: "1 − (P(0) + P(1)), with the bracket, so that both P(0) and P(1) are subtracted. Without it, P(1) is added instead.",
    keyWords: ["bracket", "subtracted"],
    examUnit: "FM3",
    difficultyPrior: 4,
  },
  {
    id: RP("04"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "trap",
    prompt: "Why do p and q get swapped so often, and how do you stop it?",
    answer: "Questions often give the probability of the outcome you are not counting. Name the success in the question's words first, and give p to that outcome.",
    keyWords: ["not counting", "success"],
    examUnit: "FM3",
    difficultyPrior: 4,
  },
  {
    id: RP("05"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "definition",
    prompt: "When can the terms of (p + q)ⁿ be used as probabilities?",
    answer: "When there is a fixed number of trials, two outcomes on each, the same probability of success every time, and the trials are independent.",
    keyWords: ["fixed number", "two outcomes", "same probability", "independent"],
    examUnit: "FM3",
    difficultyPrior: 3,
  },
  {
    id: RP("06"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "procedure",
    prompt: "In 8 trials, what does 'more than 5 successes' mean, and how do you find its probability?",
    answer: "6, 7 or 8 successes: add P(6) + P(7) + P(8). The 5 itself is not included.",
    keyWords: ["6, 7 or 8", "not included"],
    examUnit: "FM3",
    difficultyPrior: 4,
  },
  {
    id: RP("07"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "procedure",
    prompt: "When should you round in a binomial calculation, and how?",
    answer: "Only at the end: keep every figure until the final answer, then round (do not cut off) to the accuracy asked for, often 4 decimal places.",
    keyWords: ["only at the end", "4 decimal places"],
    examUnit: "FM3",
    difficultyPrior: 3,
  },
  {
    id: RP("08"),
    topic: TOPIC,
    specRefs: SPEC,
    kind: "trap",
    prompt: "A binomial question gives a chance per day and asks about a working week, or asks for a points total. What do you work out before writing any term?",
    answer: "The counts the model needs: n from the story (a working week is 5 days), and, for a total, how many times one score must come up to make it.",
    keyWords: ["n from the story", "how many times"],
    examUnit: "FM3",
    difficultyPrior: 4,
  },
];

// ---------------------------------------------------------------------------
// Sheet, note, topic
// ---------------------------------------------------------------------------

const sheet = {
  mustBeAbleTo: [
    "Check the four conditions for a binomial model: a fixed number of trials, two outcomes, the same probability of success each time, independent trials",
    "Name the success in the question's own words and write $p$, $q = 1 - p$ and $n$ before any arithmetic",
    "Write the probability of exactly $r$ successes as the coefficient from row $n$ of Pascal's triangle times $p^{r}q^{n-r}$, and evaluate it",
    "Recognise the simple cases: all $n$ successes is $p^{n}$ and none is $q^{n}$",
    "Turn 'at least', 'at most', 'more than' and 'fewer than' into the right set of terms, boundary included or not",
    "Use $1 - (\\text{the terms you do not want})$, bracket and all, when that is the shorter route",
    "Keep full accuracy to the last line and round (never cut off) to the 4 decimal places the paper asks for",
    "Translate the story before any term: $p$ from a fraction, words or a percentage; $n$ from a period such as a week of days; a points total as a count of one score",
  ],
  howExamined:
    "Unit 3 is one 1-hour calculator paper of 50 marks, sat each Summer. The binomial question was Q4 in every series from 2019 to 2025 (Q2 in the 2021 paper, Q3 in 2026): Pascal's triangle and the expansion of (p + q)ⁿ for 1 or 2 marks each, then the probabilities, usually 3 marks for exactly r and 3 for at least r, sometimes 2 for a simple all-or-none part, and 'at most' or 'more than' in place of 'at least'. The 2025 and 2026 papers ask for 4 decimal places. The scheme gives M1 for the term's structure, W1 for the coefficient or the substituted terms and W1 for the value, and a calculator's statistics function with no working earns nothing.",
  traps: [
    "Summer 2019 FM3 Q4: the answer for 'none of the pens' taken from 1 when nothing needed subtracting, p and q mixed up, 'at least 2' answered with P(2) alone, and the final mark lost to early or incorrect rounding",
    "Summer 2022 FM3 Q4: the two probabilities used the wrong way round, the coefficient 4 left out of the term, and the words 'at least' not acted on",
    "Summer 2023 FM3 Q4: the bracket left out of 1 − (P(0) + P(1)), so P(1) was added back on, and coefficients dropped from the terms",
    "Summer 2024 FM3 Q4: the wrong terms of the expansion chosen for 'exactly one' and 'at least two', a simple p³ turned into a long calculation, and 0.027 cut down to 0.03",
    "Summer 2025 FM3 Q4: the probabilities of two, three, four and five absences each worked out where 1 minus two terms was quicker and safer, and calculator statistics functions used with no working shown",
  ],
};

const notOnThisSpec = [
  "The ⁿCᵣ notation, factorials and combinations: this specification takes every coefficient from Pascal's triangle",
  "X ~ B(n, p) notation, and the mean np and variance npq of a binomial distribution",
  "More than 8 trials, cumulative binomial tables, and the normal approximation to the binomial",
];

const externalRefs = [yt("9Y4bhtNSW8w", "P McAleavey", "Pascal's Triangle / Binomial / Probability"), PLINKO, CCEA_DOC];

const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "Binomial probabilities: exactly r, at least r, and the bracket",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  specRefs: SPEC,
  calculator: true,
  formulaSheet: {
    given: ["Nothing for this topic: the Unit 3 sheet prints no binomial formula and no Pascal's triangle"],
    mustKnow: [
      "Pascal's triangle to row 8, each entry the sum of the two above it",
      "P(exactly r) = coefficient × pʳ × qⁿ⁻ʳ, with q = 1 − p and the powers adding to n",
      "P(at least r) = 1 − (P(0) + … + P(r − 1)), with the bracket",
      "The four conditions: fixed n, two outcomes, constant p, independent trials",
    ],
  },
  notOnThisSpec,
  hardness: "S",
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
  title: "Binomial probabilities in context (exactly r, at least r)",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  strand: "Binomial distribution",
  statementIds: SPEC,
  prerequisites: ["fm.u3.pascals-triangle-binomial-expansion", "fm.u3.tree-diagrams-probability"],
  order: 10,
  hardness: "S",
  difficulty: 3,
  examinerFlagged: true,
  examinerSources: [q2019, q2022, q2023, q2024, q2025],
  examWeightHint: sheet.howExamined,
  mustMemorise: [
    "Identify p (the success, as the question defines it) and q = 1 − p, and which term matches 'exactly r successes'",
    "'At least r' = 1 − (the sum of the terms below r), with brackets",
    "Show the full derivation (coefficient × powers); keep full accuracy until the final rounding",
  ],
  onFormulaSheet: [],
  notOnThisSpec,
  externalRefs,
  keywords: ["binomial", "exactly", "at least", "at most", "success", "trials", "complement"],
};

const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs/further-maths/insights/u3.binomial-probabilities.json"), "utf8"));

const sets = [
  {
    id: `set.${TOPIC}.ladder`,
    topic: TOPIC,
    kind: "interleaved",
    title: "From all-or-none to a points total: the ladder",
    subject: "further-maths",
    units: ["FM3"],
    itemIds: [`dx.${TOPIC}.pre`, Q("0004"), Q("0001"), Q("0002"), RP("01"), Q("0005"), Q("0003"), ftm2.id, Q("0006"), ftm1.id, Q("0012"), RP("08")],
    showTopicLabels: false,
    version: 1,
  },
  {
    id: `set.${TOPIC}.mixed`,
    topic: TOPIC,
    kind: "mixed",
    title: "Exactly, at least, at most, more than: mixed",
    subject: "further-maths",
    units: ["FM3"],
    itemIds: [Q("0007"), Q("0008"), Q("0009"), RP("06"), Q("0010"), Q("0011"), `dx.${TOPIC}.post`, RP("03")],
    showTopicLabels: false,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const SCOPE =
  "Unit 3 (Statistics), untiered, calculator throughout; statement FM3-BIN-02 with its Teacher Guidance (the full derivation, coefficients from Pascal's triangle, powers shown). n stays at 8 or below; no nCr, no B(n, p) notation, no mean or variance of the distribution.";
const FS =
  "The Unit 3 sheet (packs/further-maths/exam-true/formula-sheets.json, FM3) prints nothing for the binomial; the note and Sheet list Pascal's triangle, the term and the complement as must-know, matching mk.fm3.binomial.";
const CMD = "Command words from packs/further-maths/exam-true/command-words.json: Complete, Write down, Hence, Calculate, Find.";
const TAR =
  "Tariffs follow the FM3 Q4 parts read in the Summer 2019, 2022, 2023, 2024, 2025 and 2026 papers and schemes (triangle 1, expansion 1 or 2, exactly r 2 or 3, at least r 3, a simple case 2) and packs/further-maths/exam-true/tariffs.json (FM3 per part median 2, p90 4, max 5).";
const SHINGLE =
  "Compared against the FM3 papers, schemes and Chief Examiner reports read for this batch (Summer 2019, 2021, 2022, 2023, 2024, 2025 and 2026 papers; 2022-2025 schemes; 2019 and 2022-2025 reports): every context and number is new, and node scripts/qa/shingles.mjs --unit fm3 reports no breach for this topic.";
const STYLE =
  "British English; second person; no exclamation marks; the word for an incorrect answer and the 9-1 grade label do not occur; every $...$ pair opens and closes on one line, no maths segment holds prose, and every TeX command keeps its backslash (lint in emit.mjs, mirroring src/components/items/content-lint.ts).";
const NUM = (what) =>
  `${what} is emitted by scratchpad/fm3-batch-c/binomial-probabilities.mjs from exact rationals (stat.mjs, Binom over BigInt, coefficients from Pascal's triangle built by addition, every model's terms asserted to sum to exactly 1); every distractor value is the result of executing its route in routes.mjs, and verify-published.mjs re-executes all of them against the published JSON.`;

const verification = [
  verLog(note.id, {
    schema: "Shape validated against src/lib/content/schema.ts (NoteFrontmatter, and the note blocks against lesson template v2) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "formula-sheet": FS,
    "command-words": CMD,
    tariff: TAR,
    "maths-numeric": NUM("Every probability in the note, its gates and its four figures"),
    "examiner-alignment": `The one examiner callout in the teaching body carries ${q2022} (p and q swapped, also reported in 2019 and 2023); every other finding is a Sheet trap citing Summer 2019, 2022, 2023, 2024 and 2025 FM3 Q4, each read in pipeline/mine/cer-blocks/further-maths.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(we1.id, {
    schema: "Shape validated against src/lib/content/schema.ts (WorkedExample) by pipeline/build-content.mts",
    "scope-tier": SCOPE,

    tariff: "Four steps carrying M1 and W1 on the term and W1 on the substituted value: the three-mark 'exactly r' pattern of the Summer 2023 and 2025 schemes.",
    "maths-numeric": NUM(`The bus answer ${e(BU.term(2))} (${v4(BU.term(2))}) and the twin's ${v4(B.bulbs.term(1))}`),
    "examiner-alignment": `Step 1 exercises the p/q swap (${q2022}); the why-menu at step 2 exercises the coefficient (${q2023}).`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(we2.id, {
    schema: "Shape validated against src/lib/content/schema.ts (WorkedExample) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    tariff: "Five steps carrying M1 for 1 − (P(0) + P(1)), W1 for the two terms and W1 for the value: the three-mark 'at least r' pattern of the 2023 and 2025 schemes.",
    "maths-numeric": NUM(`The archer answer ${e(A.atLeast(2))} (${v4(A.atLeast(2))}) and the twin's ${v4(B.quiz.atLeast(2))}`),
    "examiner-alignment": `The complement with its bracket (${q2023}) and the shorter route (${q2025}).`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(pre.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": "Prerequisite items only: the complement and 'and' for independent events from GCSE Mathematics, and a row of Pascal's triangle from the previous FM3 topic, each labelled as a check on earlier work.",
    "command-words": CMD,
    "maths-numeric": NUM("Every option value"),
    "examiner-alignment": "Prerequisite distractors carry a tag only where the slip is that misconception (adding for 'and'; the wrong row).",
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(post.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "command-words": CMD,
    "maths-numeric": NUM("Every option value (the d4 and d6 distractors are routes in routes.mjs)"),
    "examiner-alignment": `Every distractor is tagged with a registry misconception reported in ${[q2019, q2022, q2023, q2024].join(", ")}.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(ftm1.id, {
    schema: "Shape validated against src/lib/content/schema.ts (FindTheMistake) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "maths-numeric": NUM(`The unbracketed ${re("ftm1", M.bracket)} and the corrected ${e(CA.atLeast(2))}`),
    "examiner-alignment": `Seeded from ${q2023}: the bracket omitted from 1 − (P(0) + P(1)).`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(ftm2.id, {
    schema: "Shape validated against src/lib/content/schema.ts (FindTheMistake) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "maths-numeric": NUM(`The swapped ${re("ftm2", M.swap)} and the corrected ${e(SP.term(1))}`),
    "examiner-alignment": `Seeded from ${q2022}: the two probabilities used the wrong way round.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  ...prompts.map((p) =>
    verLog(p.id, {
      schema: "Shape validated against src/lib/content/schema.ts (RetrievalPrompt) by pipeline/build-content.mts",
      "scope-tier": SCOPE,
      "formula-sheet": FS,
      "examiner-alignment": `Rehearses the rules behind ${q2019}, ${q2022} and ${q2023}.`,
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
      "maths-numeric": NUM(`Every value in ${q.id} (solutionProgram: ${q.solutionProgram})`),
      "independent-solve": "check-marking.mts feeds the correct answer in every natural spelling, and every commonError value, to the app's own marker (src/components/items/mark.ts) and asserts the marks each earns.",
      "examiner-alignment": `Sources ${q.examinerSources.join(", ")}; every commonError value is the result of executing its described route.`,
      "copy-shingle": SHINGLE,
      "style-lint": STYLE,
    }),
  ),
];

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note,
  workedExamples: [we1, we2],
  diagnostics: [pre, post],
  questions,
  findTheMistake: [ftm1, ftm2],
  prompts,
  insight,
  sets,
  verification,
};

for (const q of questions) checkProgram(q.id, q.solutionProgram);
emit(SLUG, bundle, blocks);
