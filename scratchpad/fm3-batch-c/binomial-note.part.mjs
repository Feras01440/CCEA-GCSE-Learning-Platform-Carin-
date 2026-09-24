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
    md: "Check the four conditions, then name the success in the question's words and write $p$, $q$ and $n$.\nWrite exactly $r$ as one term: the coefficient, $p^{r}$ and $q^{n-r}$.\nTurn at least, at most, more than and fewer than into terms, bracketed when they come off 1.\nTranslate the story first: a fraction, a percentage, a week of days or a points total.\nRound once, at the end, as the question says.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The probability parts follow Pascal's triangle and the expansion: usually exactly $r$ for about 3 marks, then at least $r$ for 3 more, each to 4 decimal places. The first marks are for the term written with its coefficient and powers; the last is for the rounded value. If you are stuck, write the labels and the term with the right powers, because that line earns marks on its own.",
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.02` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
];
