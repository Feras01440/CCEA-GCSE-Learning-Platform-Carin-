/**
 * FM3 batch C, topic 4 — normal-distribution-bell-curve (difficulty 1 -> L), authored to the depth
 * standard (22 Sep 2026) from the start.
 *   node scratchpad/fm3-batch-c/normal-distribution-bell-curve.mjs      (from the repository root)
 *
 * The 68%, 95% and 99.7% figures are computed from the error-function Phi in stat.mjs and asserted
 * (routes.mjs `within`); every range is mean ± k standard deviations as an exact rational; every
 * figure is drawn from the density or from Phi (phone.mjs); every commonError value is route() from
 * routes.mjs, the described slip carried out in code.
 */
import { bAdd, bMul, big, figure } from "./lib.mjs";
import { exactDec, rat } from "./stat.mjs";
import { nBell, nHist, nShapes, nBands, nSketch, nFour, nTail } from "./phone.mjs";
import { BC, BELL, MB, within, oneTail, halfBand, kSd, route } from "./routes.mjs";
import { CCEA_DOC, PLINKO, UPDATED, emit, plinkoBlock, src, timeFor, verLog, yt } from "./emit.mjs";

const TOPIC = BC;
const SLUG = "normal-distribution-bell-curve";
const SPEC = ["FM3-NOR-01"];
const q2019 = src("2019-summer", 5);

const PAPER = {
  unit: "FM3",
  calculator: true,
  resources: ["Scientific calculator", "Formula sheet printed on page 2 of the question-and-answer booklet", "Normal Probability Table on page 3 of the booklet"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const e = (x) => exactDec(x, 12);
/** mean + k sd for a context, printed exactly. */
const at = (key, k) => e(kSd(key, k));
/** k sd as a printed amount. */
const sds = (key, k) => e(bMul(big(BigInt(k)), rat(String(BELL[key].sd))));
const n = (v) => String(v);

const pctSpec = (v, min, max) => ({ kind: "numeric", value: v, tolerance: { type: "range", min, max }, unit: "%", unitRequired: false, acceptForms: ["decimal", "percent"] });
const exactSpec = (v, unit) => ({ kind: "numeric", value: Number(v), tolerance: { type: "exact" }, ...(unit ? { unit } : {}), unitRequired: false, acceptForms: ["decimal"] });
const ce = (where, misconception, feedback, marks, source, nth = 0) => ({
  misconception,
  pattern: { kind: "numeric", value: Number(e(route(where, misconception, nth))), tolerance: { type: "exact" } },
  feedback,
  marksTypicallyEarned: marks,
  source,
});

// The rule-of-thumb figures the whole topic prints, computed once and held here.
const W1 = within(1); // 68
const W2 = within(2); // 95
const W3 = within(3); // 99.7
const T1 = oneTail(1); // 16
const T2 = oneTail(2); // 2.5
const OUT1 = 100 - W1; // 32
const OUT2 = 100 - W2; // 5
if (W1 !== 68 || W2 !== 95 || W3 !== 99.7 || T1 !== 16 || T2 !== 2.5 || OUT1 !== 32 || OUT2 !== 5) throw new Error("the rule-of-thumb figures have moved");

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

const figBell = nBell({ title: "A symmetric bell-shaped curve with a dashed line at its peak labelled mean = median = mode, and its two tails running along the axis" });
const figHist = nHist({ wide: 1, narrow: 0.25, title: "The same normal distribution as a histogram with classes one standard deviation wide, then with classes a quarter of a standard deviation wide and the smooth curve over them" });
const figShapes = nShapes({ leftTitle: "heights: symmetric", rightTitle: "incomes: skewed", title: "A symmetric bell for heights, whose peak and mean coincide, beside a skewed curve for incomes, whose long right tail pulls the mean past the peak" });
const figBands = nBands({ title: "A normal curve divided at the mean and one and two standard deviations either side, with the share of each band and brackets for about 68% and about 95%" });
const figTail = nTail({ mean: "μ", x: "μ + σ", z: 1, tail: "right", statement: `about ${T1}%`, showZ: false, title: `A normal curve with the region beyond one standard deviation above the mean shaded, about ${T1}%` });
const FL = BELL.flour;
const figSketch = nSketch({ mean: FL.mean, sd: FL.sd, unit: "mass (g)", title: `A sketch of the flour masses: a bell with ${FL.mean} under the peak and ${at("flour", -2)}, ${at("flour", -1)}, ${at("flour", 1)} and ${at("flour", 2)} marked` });
const figFour = nFour({ order: ["skewed", "bell", "twoPeaks", "flat"], title: "Four sketches labelled A to D" });

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const BA = BELL.babies;
const MK = BELL.marks;
const SPAN = { mean: 20.5 }; // gate g3: hand spans, cm
const FISH = { mean: 30, sd: 2.5 }; // gate g7
if (FISH.mean + 2 * FISH.sd !== 35 || FISH.mean - 2 * FISH.sd !== 25) throw new Error("g7 numbers are stale");

const blocks = [
  {
    type: "hero",
    lede: "Measure a thousand heights, weigh a crate of apples, or time the same run again and again, and the results pile up in the same shape: one hump in the middle, falling away evenly on both sides. This lesson is about that shape, the normal curve, and the figures that come with it.",
    can: [
      "Recognise a variable that is roughly normal, and one that is not",
      "Sketch the curve with the mean at the centre and the standard deviations marked",
      "Use the 68% and 95% figures to find ranges and rough percentages",
    ],
    minutes: 0,
  },
  { type: "h", text: "One shape, many measurements", role: "idea" },
  {
    type: "p",
    md: "The heights of adult women, the masses of apples from one orchard and the errors in repeated measurements of one length all make the same shape when you plot a lot of them: most values sit near the middle, and fewer and fewer lie further out on either side. The smooth outline of that shape is the normal curve, often called the bell curve.",
  },
  {
    type: "figure",
    alt: "A smooth, symmetric bell-shaped curve over a horizontal axis. A dashed line runs from the peak down to the axis, labelled mean = median = mode. The two tails, each labelled, run closer and closer to the axis without meeting it.",
    svg: figBell,
    caption: "Symmetric about the mean, highest at the mean, and tails that come closer and closer to the axis without touching it.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "Which of these is most likely to follow a normal distribution?",
    options: ["The heights of 17-year-old boys in Northern Ireland", "The number of cars owned by each family on a street", "The yearly incomes of everyone who works in a city"],
    answer: "The heights of 17-year-old boys in Northern Ireland",
    explain: "Heights are measured on a continuous scale and gather evenly around the average. The number of cars is a small whole number that piles up at 0, 1 and 2, and incomes have a long tail of very high values, so neither is symmetric.",
  },

  { type: "h", text: "Where the bell comes from", role: "idea" },
  {
    type: "figure",
    alt: "Two histograms of the same distribution. The upper one has six wide classes and looks like a staircase. The lower one has twenty-four narrow classes, and a smooth bell-shaped curve drawn over it follows the tops of the bars.",
    svg: figHist,
    caption: "The same distribution drawn with wide classes, then with narrow ones: as the classes narrow, the steps become the curve.",
  },
  {
    type: "p",
    md: "A histogram of many heights with wide classes looks like a staircase. Make the classes narrower and the steps get smaller, until the outline is the smooth curve. Each bar's area stands for the fraction of the data in its class, so the whole area under the curve is 1.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: "What does the whole area under a normal curve stand for?",
    options: ["All of the data, a fraction of 1", "The mean of the data", "The standard deviation of the data"],
    answer: "All of the data, a fraction of 1",
    explain: "Each bar's area is the fraction of the data in its class, and all the fractions together make 1. That is why an area under the curve is a probability, which the next lesson uses.",
  },

  { type: "h", text: "Mean, median and mode together", role: "idea" },
  {
    type: "figure",
    alt: "Two curves side by side. On the left, heights: a symmetric bell with one dashed line at its peak, labelled peak and mean. On the right, incomes: a curve that rises steeply, peaks early and has a long tail to the right; one dashed line marks the peak and another, further right, the mean.",
    svg: figShapes,
    caption: "In the bell the peak and the mean are the same place. In a skewed shape like incomes, the long tail pulls the mean away.",
  },
  {
    type: "p",
    md: "The normal curve is symmetric about its mean, so half of the data lies on each side. It is highest at the mean. Its tails come closer and closer to the axis without touching it, so very large or very small values can happen, just more and more rarely.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the three averages agree",
    md: "The mode is where the curve is highest, which is the centre. The median cuts the area in half, and by symmetry the halves meet at the centre too. So for a normal distribution the mean, the median and the mode are the same number.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: `The hand spans of the pupils in a year group are normally distributed with mean ${SPAN.mean} cm. What is the median hand span, in centimetres?`,
    answer: n(SPAN.mean),
    explain: `The curve is symmetric about the mean, so the median, which cuts the area in half, is also ${SPAN.mean} cm.`,
  },

  { type: "h", text: "Why so many things are normal", role: "why" },
  {
    type: "p",
    md: "A height is the sum of many small influences, each pushing a little up or a little down. The PhET Plinko board does the same with balls: every peg gives a small push left or right, and the bin a ball lands in adds up its pushes. With many rows, the bins fill into a bell.",
  },
  plinkoBlock(
    "Open the Lab screen and set the binary probability to 0.5. Start with only 2 rows and drop a few hundred balls. Then add rows one at a time, up to the most the board allows, and drop a few thousand. Describe how the outline of the full bins changes as the rows increase.",
  ),
  {
    type: "gate",
    id: "g4",
    kind: "choice",
    prompt: "On the Plinko board, what happens to the outline of the bins as you add more rows?",
    options: ["It comes closer to a smooth, symmetric bell", "It flattens, with every bin equally full", "It leans over towards one side"],
    answer: "It comes closer to a smooth, symmetric bell",
    explain: "Each extra row adds one more small push, left or right. The more pushes a ball's final bin adds up, the closer the bins come to the normal curve, with the middle bins fullest.",
  },

  { type: "h", text: "Within one or two standard deviations", role: "variant" },
  {
    type: "figure",
    alt: "A normal curve with vertical lines at the mean μ and at one and two standard deviations either side. The bands hold 34.1% between the mean and one standard deviation on each side, 13.6% between one and two, and 2.3% in each tail beyond two. Brackets above mark about 68% within one standard deviation and about 95% within two.",
    svg: figBands,
    caption: `The shares of a normal distribution: about ${W1}% lies within one standard deviation of the mean, about ${W2}% within two.`,
  },
  {
    type: "p",
    md: `The standard deviation sets the width of the bell. About ${W1}% of the values lie within one standard deviation of the mean, and about ${W2}% within two. Almost all, about ${W3}%, lie within three, so a value more than three standard deviations from the mean is very unusual.`,
  },
  {
    type: "p",
    md: `Newborn babies' masses have mean ${n(BA.mean)} kg and standard deviation ${n(BA.sd)} kg. Two standard deviations is ${sds("babies", 2)} kg, so about ${W2}% of newborns weigh between ${at("babies", -2)} kg and ${at("babies", 2)} kg.`,
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `The marks in a test are normally distributed with mean ${MK.mean} and standard deviation ${MK.sd}. About ${W1}% of the marks lie between ${at("marks", -1)} and what mark?`,
    answer: at("marks", 1),
    explain: `One standard deviation either side of the mean: $${MK.mean} - ${MK.sd} = ${at("marks", -1)}$ and $${MK.mean} + ${MK.sd} = ${at("marks", 1)}$.`,
  },

  { type: "h", text: "One side of the curve", role: "variant" },
  {
    type: "figure",
    alt: `A normal curve with the region to the right of μ + σ shaded and labelled about ${T1}%.`,
    svg: figTail,
    caption: `Beyond one standard deviation on one side: half of the ${OUT1}% outside, about ${T1}%.`,
  },
  {
    type: "p",
    md: `Because the curve is symmetric, every share splits evenly about the mean. Half of the values lie above the mean. The ${OUT1}% outside one standard deviation is shared by two tails, so about ${T1}% lie above the mean plus one standard deviation. The ${OUT2}% outside two gives about ${T2}% in each tail; the exact share is 2.3%.`,
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: `Newborn babies' masses have mean ${n(BA.mean)} kg and standard deviation ${n(BA.sd)} kg. About what percentage of newborns weigh more than ${at("babies", 2)} kg?`,
    answer: `${T2} | 2.3 | 2.28`,
    explain: `${at("babies", 2)} kg is two standard deviations above the mean. The ${OUT2}% outside two standard deviations splits into two tails of about ${T2}% each.`,
  },

  { type: "h", text: "See it done", role: "see" },
  {
    type: "p",
    md: `**Question.** The masses of bags of flour are normally distributed with mean ${FL.mean} g and standard deviation ${FL.sd} g. Sketch the distribution, find the masses between which about ${W2}% of bags lie, and estimate the percentage heavier than ${at("flour", 1)} g.`,
  },
  {
    type: "figure",
    alt: `The sketch: a bell curve with ${FL.mean} under the peak and ${at("flour", -2)}, ${at("flour", -1)}, ${at("flour", 1)} and ${at("flour", 2)} marked for one and two standard deviations either side.`,
    svg: figSketch,
    caption: "Line 1 as a sketch: the mean under the peak, and one and two standard deviations marked either side.",
  },
  {
    type: "p",
    md: `**Line 1.** Sketch the bell with the mean, ${FL.mean}, under the peak.\n**Line 2.** $2 \\times ${FL.sd} = ${sds("flour", 2)}$, so mark ${at("flour", -2)}, ${at("flour", -1)}, ${at("flour", 1)} and ${at("flour", 2)}.\n**Line 3.** About ${W2}% lie between ${at("flour", -2)} g and ${at("flour", 2)} g.\n**Line 4.** ${at("flour", 1)} g is one standard deviation above the mean.\n**Line 5.** $(100 - ${W1}) \\div 2 = ${T1}$, so about ${T1}% are heavier.`,
  },
  {
    type: "video",
    videoId: "2WKfG8c3J74",
    title: "Normal Distribution",
    channel: "P McAleavey",
    why: "A Northern Ireland teacher on the normal distribution for CCEA Further Mathematics. As you watch, sketch each curve you see and mark the mean under its peak.",
  },
  {
    type: "gate",
    id: "g7",
    kind: "number",
    prompt: `The lengths of a kind of fish are normally distributed with mean ${FISH.mean} cm and standard deviation ${FISH.sd} cm. About ${W2}% of the fish are between what length and ${FISH.mean + 2 * FISH.sd} cm?`,
    answer: n(FISH.mean - 2 * FISH.sd),
    explain: `About ${W2}% lies within two standard deviations: $2 \\times ${FISH.sd} = ${2 * FISH.sd}$, and $${FISH.mean} - ${2 * FISH.sd} = ${FISH.mean - 2 * FISH.sd}$ cm.`,
  },

  { type: "h", text: "You can now" },
  {
    type: "p",
    md: `Recognise the bell: symmetric, highest at the mean, with tails that never touch the axis.\nThe mean, median and mode are equal, and the whole area under the curve is 1.\nAbout ${W1}% lies within one standard deviation of the mean, ${W2}% within two, ${W3}% within three.\nFor one tail, halve what is outside: about ${T1}% beyond one standard deviation, ${T2}% beyond two.`,
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: `No paper has yet set a question on the shape alone: it comes inside the normal question, where the mean and standard deviation are given and a sketch with the mean and the value under the axis made full marks far more likely in 2019. That year nearly a fifth left the question blank or tried the standard deviation formula, which is never needed here. Use ${W1}% and ${W2}% to check every answer.`,
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.02` },
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
// Questions
// ---------------------------------------------------------------------------

const Q = (id) => `q.${TOPIC}.${id}`;
const WQ = (id, part = "main") => `${Q(id)}#${part}`;
const qq = (id, extra) => ({ id: Q(id), topic: TOPIC, specRefs: SPEC, tier: "untiered", paper: PAPER, figures: [], version: 1, verification: `ver.${Q(id)}`, ...extra });
const questions = [];

// 0001 — which variable is roughly normal
questions.push(
  qq("0001", {
    style: "practice",
    difficulty: 1,
    ao: ["AO1", "AO2"],
    commandWords: ["Identify"],
    emphasis: ["recognising a normal variable", "a non-example"],
    context: { setting: "Four real variables, one of them roughly normal", original: true },
    parts: [
      {
        id: "main",
        stem: "Identify the variable that is most likely to be approximately normally distributed.",
        marks: 1,
        answer: {
          kind: "mcq",
          shuffle: true,
          options: [
            { id: "a", text: "The lengths of leaves picked from one oak tree", correct: true, feedback: "Yes: lengths are continuous and gather evenly around the average leaf, with fewer very short or very long ones." },
            { id: "b", text: "The number of goals scored in a football match", correct: false, feedback: "Goals are small whole numbers that pile up at 0, 1 and 2 with a tail to the right, so the shape is not a symmetric bell." },
            { id: "c", text: "The waiting times at a stop where a bus comes exactly every 10 minutes", correct: false, feedback: "Arriving at a random moment, every wait from 0 to 10 minutes is equally likely, so the shape is flat, not a bell." },
            { id: "d", text: "The prices of houses sold in Belfast in one year", correct: false, feedback: "Most prices sit in the lower middle with a long tail of very expensive houses, so the shape is skewed, not symmetric." },
          ],
        },
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: "the leaf lengths" }],
        hints: ["Look for a quantity measured on a continuous scale that gathers evenly around its average.", "Counts, flat waiting times and prices with a few very large values do not make a symmetric bell."],
        workedSolution: "Leaf lengths are continuous and spread evenly either side of the average length, so they are roughly normal. Goals are whole numbers, the bus waits are flat and house prices have a long upper tail.",
        commonErrors: [],
        requiresWorking: false,
      },
    ],
    totalMarks: 1,
    timeAllowanceSec: timeFor(1),
    skeleton: "(main)identify1",
    examinerSources: [q2019],
    solutionProgram: "continuous and symmetric about its average: leaf lengths",
  }),
);

// 0002 — which sketch could be normal
questions.push(
  qq("0002", {
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Identify"],
    emphasis: ["the shape of the curve"],
    context: { setting: "Four sketched distributions", original: true },
    figures: [figure(figFour, "Four sketches labelled A to D. A rises steeply, peaks early and has a long tail to the right. B has one peak in the middle and falls away equally on both sides. C has two peaks. D is flat across the middle with steep sides.")],
    parts: [
      {
        id: "main",
        stem: "Identify the sketch, A, B, C or D, that could show a normal distribution.",
        marks: 1,
        answer: {
          kind: "mcq",
          shuffle: false,
          options: [
            { id: "a", text: "A", correct: false, feedback: "A rises steeply and has a long tail to the right: it is skewed, and a normal curve is symmetric." },
            { id: "b", text: "B", correct: true, feedback: "Yes: one peak in the middle, and the same shape on both sides of it." },
            { id: "c", text: "C", correct: false, feedback: "Two peaks means two groups mixed together. A normal curve has one peak, at the mean." },
            { id: "d", text: "D", correct: false, feedback: "A flat top means every value in the middle is equally likely. A normal curve is highest at the mean and falls away from it." },
          ],
        },
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: "B" }],
        hints: ["A normal curve has one peak.", "It is the same shape on both sides of that peak."],
        workedSolution: "Only B has one peak in the middle with the same shape on both sides. A is skewed, C has two peaks and D is flat.",
        commonErrors: [],
        requiresWorking: false,
      },
    ],
    totalMarks: 1,
    timeAllowanceSec: timeFor(1),
    skeleton: "(main)identify1",
    examinerSources: [q2019],
    solutionProgram: "one peak, symmetric: B",
  }),
);

// 0003 — the share within two standard deviations
questions.push(
  qq("0003", {
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Write down"],
    emphasis: ["the 95% figure"],
    context: { setting: "The rule-of-thumb shares of a normal distribution", original: true },
    parts: [
      {
        id: "main",
        stem: "Write down roughly what percentage of the values in a normal distribution lie within two standard deviations of the mean.",
        marks: 1,
        answer: pctSpec(W2, 95, 95.5),
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: `${W2}%` }],
        hints: ["One standard deviation either side holds about 68%.", "Two either side holds most of the rest."],
        workedSolution: `About ${W2}% lies within two standard deviations of the mean (the table makes it 95.4%).`,
        commonErrors: [
          ce(WQ("0003"), MB.proportion, `${W1}% is the share within ONE standard deviation. Two standard deviations either side hold about ${W2}%.`, 0, q2019),
          ce(WQ("0003"), MB.proportion, `${W3}% is the share within THREE standard deviations. Two either side hold about ${W2}%.`, 0, q2019, 1),
        ],
        requiresWorking: false,
      },
    ],
    totalMarks: 1,
    timeAllowanceSec: timeFor(1),
    skeleton: "(main)write-down1",
    examinerSources: [q2019],
    solutionProgram: `2 * Phi(2) - 1 = 0.9545 -> about ${W2}%`,
  }),
);

// 0004 — the lower end of the middle 95%
{
  const A = BELL.apples;
  questions.push(
    qq("0004", {
      style: "practice",
      difficulty: 2,
      ao: ["AO1", "AO2"],
      commandWords: ["Find"],
      emphasis: ["mean ± 2 standard deviations"],
      context: { setting: "Masses of apples from an orchard", original: true },
      parts: [
        {
          id: "main",
          stem: `The masses of apples from an orchard are normally distributed with mean ${A.mean} g and standard deviation ${A.sd} g.\nAbout ${W2}% of the apples weigh between $m$ grams and ${at("apples", 2)} grams. Find $m$.`,
          marks: 2,
          answer: exactSpec(at("apples", -2), "g"),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `$2 \\times ${A.sd} = ${sds("apples", 2)}$, two standard deviations`, accept: [`${A.mean} - 2 × ${A.sd}`] },
            { id: "W1", code: "W", marks: 1, for: at("apples", -2), dependsOn: ["M1"] },
          ],
          hints: [`About ${W2}% lies within two standard deviations of the mean.`, `${at("apples", 2)} is the mean plus two standard deviations; $m$ is the mean minus two.`],
          workedSolution: `About ${W2}% lies within two standard deviations of the mean.\n$2 \\times ${A.sd} = ${sds("apples", 2)}$ g, and $${A.mean} + ${sds("apples", 2)} = ${at("apples", 2)}$ g matches the upper value.\n$m = ${A.mean} - ${sds("apples", 2)} = ${at("apples", -2)}$`,
          commonErrors: [
            ce(WQ("0004"), MB.proportion, `That is one standard deviation below the mean, the edge of the middle ${W1}%. For about ${W2}% go two standard deviations: $${A.mean} - ${sds("apples", 2)} = ${at("apples", -2)}$.`, 1, q2019),
            ce(WQ("0004"), MB.oneSided, `${A.mean} g is the mean, so that interval covers only the upper half of the ${W2}%. The two standard deviations go both ways: $m = ${A.mean} - ${sds("apples", 2)} = ${at("apples", -2)}$.`, 1, q2019),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 2,
      timeAllowanceSec: timeFor(2),
      skeleton: "(main)find2",
      examinerSources: [q2019],
      solutionProgram: `m = ${A.mean} - 2 * ${A.sd} = ${at("apples", -2)}; check ${A.mean} + 2 * ${A.sd} = ${at("apples", 2)}`,
    }),
  );
}

// 0005 — the share beyond one standard deviation on one side
{
  const A = BELL.apples;
  questions.push(
    qq("0005", {
      style: "practice",
      difficulty: 2,
      ao: ["AO1", "AO2"],
      commandWords: ["Find"],
      emphasis: ["one tail", "halving what is outside"],
      context: { setting: "Masses of apples from an orchard", original: true },
      parts: [
        {
          id: "main",
          stem: `The masses of apples from an orchard are normally distributed with mean ${A.mean} g and standard deviation ${A.sd} g.\nFind roughly what percentage of the apples weigh more than ${at("apples", 1)} g.`,
          marks: 2,
          answer: pctSpec(T1, 15.8, 16.2),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `${at("apples", 1)} is one standard deviation above the mean, and $(100 - ${W1}) \\div 2$` },
            { id: "W1", code: "W", marks: 1, for: `${T1}%`, dependsOn: ["M1"] },
          ],
          hints: [`${at("apples", 1)} g is the mean plus one standard deviation.`, `${OUT1}% lies outside one standard deviation, split between two tails.`],
          workedSolution: `$${A.mean} + ${A.sd} = ${at("apples", 1)}$, one standard deviation above the mean.\n${W1}% lies within one standard deviation, so ${OUT1}% lies outside, half in each tail.\n$${OUT1} \\div 2 = ${T1}$, so about ${T1}% of the apples weigh more than ${at("apples", 1)} g.`,
          commonErrors: [
            ce(WQ("0005"), MB.proportion, `${halfBand(1)}% is the band between the mean and ${at("apples", 1)} g. The apples heavier than ${at("apples", 1)} g are the tail beyond it: $(100 - ${W1}) \\div 2 = ${T1}$%.`, 0, q2019),
            ce(WQ("0005"), MB.proportion, `${OUT1}% lies outside one standard deviation on BOTH sides, the light apples as well as the heavy ones. Only half of it is above ${at("apples", 1)} g: about ${T1}%.`, 1, q2019, 1),
            ce(WQ("0005"), MB.tail, `${100 - T1}% is the share LIGHTER than ${at("apples", 1)} g. The question asks for the heavier ones, the thin tail on the right: about ${T1}%.`, 1, q2019),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 2,
      timeAllowanceSec: timeFor(2),
      skeleton: "(main)find2",
      examinerSources: [q2019],
      solutionProgram: `(100 - ${W1}) / 2 = ${T1}`,
    }),
  );
}

// 0006 — is a value unusual?
{
  const x = 5.0;
  const k = (x - BA.mean) / BA.sd;
  if (!(k > 3 && k < 3.5)) throw new Error("0006 needs a mass a little over three standard deviations out");
  questions.push(
    qq("0006", {
      style: "practice",
      difficulty: 3,
      ao: ["AO2", "AO3"],
      commandWords: ["Identify"],
      emphasis: ["beyond three standard deviations", "tails never touch the axis"],
      context: { setting: "Masses of newborn babies", original: true },
      parts: [
        {
          id: "main",
          stem: `The masses of newborn babies are normally distributed with mean ${n(BA.mean)} kg and standard deviation ${n(BA.sd)} kg. A baby is born weighing ${x.toFixed(1)} kg.\nIdentify the correct statement about this mass.`,
          marks: 1,
          answer: {
            kind: "mcq",
            shuffle: true,
            options: [
              { id: "a", text: "The mass is very unusual: it is more than three standard deviations above the mean", correct: true, feedback: `Yes: ${x.toFixed(1)} − ${n(BA.mean)} = ${(x - BA.mean).toFixed(1)} kg, which is ${k.toFixed(1)} standard deviations. About ${W3}% of newborns are within three standard deviations, so this is very rare.` },
              { id: "b", text: "The mass is ordinary: it is within two standard deviations of the mean", correct: false, feedback: `Two standard deviations reach only ${at("babies", 2)} kg. ${x.toFixed(1)} kg is well beyond that, more than three standard deviations out.` },
              { id: "c", text: "The mass is impossible, because the curve meets the axis three standard deviations from the mean", correct: false, feedback: "The tails come closer and closer to the axis but never meet it: a mass this far out is very rare, not impossible." },
            ],
          },
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: "very unusual: more than three standard deviations above the mean" }],
          hints: [`How many standard deviations of ${n(BA.sd)} kg is ${x.toFixed(1)} kg above ${n(BA.mean)} kg?`, `About ${W3}% lies within three standard deviations.`],
          workedSolution: `$${x.toFixed(1)} - ${n(BA.mean)} = ${(x - BA.mean).toFixed(1)}$ kg, and $${(x - BA.mean).toFixed(1)} \\div ${n(BA.sd)} = ${k.toFixed(1)}$ standard deviations.\nAbout ${W3}% lies within three standard deviations, so the mass is very unusual, though not impossible.`,
          commonErrors: [],
          requiresWorking: false,
        },
      ],
      totalMarks: 1,
      timeAllowanceSec: timeFor(1),
      skeleton: "(main)identify1",
      examinerSources: [q2019],
      solutionProgram: `(${x} - ${BA.mean}) / ${BA.sd} = ${k.toFixed(1)} > 3`,
    }),
  );
}

// 0007 — exam-style: the opening of a normal question, the curve's own facts (5 marks)
{
  const Bo = BELL.boys;
  const tall = Bo.mean + 3 * Bo.sd;
  questions.push(
    qq("0007", {
      style: "exam-style",
      difficulty: 2,
      ao: ["AO1", "AO2", "AO3"],
      commandWords: ["Write down", "Find", "Show that"],
      emphasis: ["the median", "mean ± 2 standard deviations", "one tail", "three standard deviations"],
      context: { setting: "Heights of Year 12 boys in a school", original: true },
      parts: [
        {
          id: "a",
          stem: `The heights of the Year 12 boys in a school are normally distributed with mean ${Bo.mean} cm and standard deviation ${Bo.sd} cm.\nWrite down the median height.`,
          marks: 1,
          answer: exactSpec(Bo.mean, "cm"),
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `${Bo.mean} cm` }],
          hints: ["The curve is symmetric about the mean."],
          workedSolution: `The curve is symmetric about the mean, so the median is the mean: ${Bo.mean} cm.`,
          commonErrors: [],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: `About ${W2}% of the boys are between $h$ cm and ${at("boys", 2)} cm tall. Find $h$.`,
          marks: 2,
          answer: exactSpec(at("boys", -2), "cm"),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `$2 \\times ${Bo.sd} = ${sds("boys", 2)}$`, accept: [`${Bo.mean} - 2 × ${Bo.sd}`] },
            { id: "W1", code: "W", marks: 1, for: at("boys", -2), dependsOn: ["M1"] },
          ],
          hints: [`${at("boys", 2)} is two standard deviations above the mean.`, "Go the same distance below it."],
          workedSolution: `$2 \\times ${Bo.sd} = ${sds("boys", 2)}$\n$h = ${Bo.mean} - ${sds("boys", 2)} = ${at("boys", -2)}$`,
          commonErrors: [
            ce(WQ("0007", "b"), MB.proportion, `That is one standard deviation below the mean, the edge of the middle ${W1}%. About ${W2}% needs two: $${Bo.mean} - ${sds("boys", 2)} = ${at("boys", -2)}$.`, 1, q2019),
            ce(WQ("0007", "b"), MB.oneSided, `${Bo.mean} cm is the mean: that interval holds only the upper half of the ${W2}%. Go two standard deviations below as well: ${at("boys", -2)} cm.`, 1, q2019),
          ],
          requiresWorking: true,
        },
        {
          id: "c",
          stem: `Find roughly what percentage of the boys are taller than ${at("boys", 2)} cm.`,
          marks: 1,
          answer: pctSpec(T2, 2.2, 2.6),
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$(100 - ${W2}) \\div 2 = ${T2}$%` }],
          hints: [`${OUT2}% lies outside two standard deviations.`, "Only the tall boys' tail is wanted."],
          workedSolution: `${W2}% lies within two standard deviations, so ${OUT2}% lies outside, half in each tail.\n$${OUT2} \\div 2 = ${T2}$, so about ${T2}% of the boys are taller than ${at("boys", 2)} cm.`,
          commonErrors: [
            ce(WQ("0007", "c"), MB.proportion, `${OUT2}% is outside two standard deviations on BOTH sides, the short boys as well. The tall ones are half of it: about ${T2}%.`, 0, q2019),
            ce(WQ("0007", "c"), MB.proportion, `${halfBand(2)}% lies between the mean and ${at("boys", 2)} cm. Taller than ${at("boys", 2)} cm is the thin tail beyond it: about ${T2}%.`, 0, q2019, 1),
          ],
          requiresWorking: true,
        },
        {
          id: "d",
          stem: `One boy is ${tall} cm tall. Show that this height is very unusual.`,
          marks: 1,
          answer: {
            kind: "text",
            accepted: [`It is three standard deviations above the mean, and about ${W3}% of heights lie within three standard deviations, so very few boys are this tall.`],
            keyWords: [{ any: ["three standard deviations", "3 standard deviations", "three sd", "3 sd", "3 s.d.", "3σ", "three times the standard deviation"], marks: 1 }],
            listingRule: false,
          },
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `${tall} cm is three standard deviations above the mean, beyond which lies only about ${((100 - W3) / 2).toFixed(2)}% of heights` }],
          hints: [`How far is ${tall} cm above ${Bo.mean} cm, in standard deviations?`],
          workedSolution: `$${tall} - ${Bo.mean} = ${3 * Bo.sd}$ cm, which is $3 \\times ${Bo.sd}$: three standard deviations above the mean. About ${W3}% of heights lie within three standard deviations, so very few boys are this tall.`,
          commonErrors: [],
          requiresWorking: true,
        },
      ],
      totalMarks: 5,
      timeAllowanceSec: timeFor(5),
      skeleton: "(a)write-down1|(b)find2|(c)find1|(d)show-that1",
      examinerSources: [q2019],
      solutionProgram: `a: median = mean = ${Bo.mean}; b: ${Bo.mean} - 2 * ${Bo.sd} = ${at("boys", -2)}; c: (100 - ${W2}) / 2 = ${T2}; d: (${tall} - ${Bo.mean}) / ${Bo.sd} = 3`,
    }),
  );
}

// ---------------------------------------------------------------------------
// Worked example
// ---------------------------------------------------------------------------

const WO = BELL.women;
const LV = BELL.leaves;
const we = {
  id: `we.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `The heights of adult women in a town are normally distributed with mean ${WO.mean} cm and standard deviation ${WO.sd} cm. Find the two heights between which about ${W2}% of the women lie.`,
  steps: [
    {
      n: 1,
      working: `About ${W2}% lies within two standard deviations of the mean: $\\mu \\pm 2\\sigma$.`,
      decision: `Pick the multiple from the percentage before any arithmetic: ${W1}% goes with one standard deviation, ${W2}% with two.`,
      whyMenu: {
        options: [`About ${W2}% of a normal distribution lies within two standard deviations of the mean`, "95 is close to 100, and doubling reaches it", "The standard deviation is always doubled"],
        correct: 0,
        explain: `The figure comes from the curve itself: the bands within two standard deviations hold ${W2}% of the area. Within one they hold ${W1}%, so the multiple depends on the percentage asked for.`,
      },
      earns: [],
      input: { kind: "numeric", value: 2, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] },
    },
    {
      n: 2,
      working: `$2 \\times ${WO.sd} = ${sds("women", 2)}$ cm`,
      decision: "Two standard deviations is the distance from the mean to each end of the range.",
      earns: ["M1"],
      input: exactSpec(sds("women", 2)),
    },
    {
      n: 3,
      working: `$${WO.mean} - ${sds("women", 2)} = ${at("women", -2)}$ cm`,
      decision: "Go that distance below the mean for the lower end.",
      earns: ["W1"],
      input: exactSpec(at("women", -2)),
    },
    {
      n: 4,
      working: `$${WO.mean} + ${sds("women", 2)} = ${at("women", 2)}$ cm, so about ${W2}% lie between ${at("women", -2)} cm and ${at("women", 2)} cm.`,
      decision: "And the same distance above it for the upper end: the range is centred on the mean.",
      earns: ["W1"],
      input: exactSpec(at("women", 2)),
    },
  ],
  finalAnswer: `Between ${at("women", -2)} cm and ${at("women", 2)} cm.`,
  twin: {
    stem: `The lengths of the leaves on a hedge are normally distributed with mean ${n(LV.mean)} cm and standard deviation ${n(LV.sd)} cm. Find the lower of the two lengths between which about ${W2}% of the leaves lie.`,
    answer: exactSpec(at("leaves", -2)),
  },
  faded: [
    { showSteps: 3, studentSupplies: [4] },
    { showSteps: 2, studentSupplies: [3, 4] },
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
      stem: "Before the lesson, a check on earlier work. Two classes both have a mean mark of 60. Class A's marks have standard deviation 4 and class B's have standard deviation 12. What does that tell you?",
      skill: "What a standard deviation measures (from the lesson on mean and standard deviation)",
      options: [
        { id: "a", text: "Class B's marks are more spread out", correct: true, feedback: "Yes: the standard deviation measures spread about the mean. In this lesson it sets the width of the bell." },
        { id: "b", text: "Class B did better on average", correct: false, feedback: "Both means are 60, so neither did better on average. The larger standard deviation says class B's marks are more spread out." },
        { id: "c", text: "Class A has more pupils", correct: false, feedback: "The standard deviation says nothing about how many pupils there are; it measures how spread out the marks are." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "Another check on earlier work. A set of data has mean 50 and standard deviation 5. Which value is two standard deviations above the mean?",
      skill: "Stepping from the mean in standard deviations (from the lesson on mean and standard deviation)",
      options: [
        { id: "a", text: "60", correct: true, feedback: "Yes: two steps of 5 above 50. Ranges in this lesson are built the same way." },
        { id: "b", text: "55", correct: false, feedback: "That is one standard deviation above the mean. Two steps of 5 reach 60." },
        { id: "c", text: "52", correct: false, feedback: "That adds 2 rather than two standard deviations. Two steps of 5 above 50 reach 60." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p3",
      stem: "One more check on earlier work. What fraction of a set of data lies above its median?",
      skill: "The median cuts the data in half (from GCSE Mathematics)",
      options: [
        { id: "a", text: "A half", correct: true, feedback: "Yes: the median is the middle value, with half the data on each side. On a symmetric curve it sits at the mean." },
        { id: "b", text: "A quarter", correct: false, feedback: "A quarter lies above the upper quartile. The median has half of the data above it." },
        { id: "c", text: "It depends on the mean", correct: false, feedback: "The median always has half the data on each side, whatever the mean is." },
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
      stem: "Which statement is true of every normal distribution?",
      skill: "The properties of the normal curve",
      options: [
        { id: "a", text: "The mean, the median and the mode are equal", correct: true, feedback: "Yes: the curve is symmetric about the mean and highest there, so all three averages sit at the centre." },
        { id: "b", text: "The mean is larger than the median", correct: false, feedback: "That happens in a skewed distribution with a long upper tail, such as incomes. A normal curve is symmetric, so the two are equal." },
        { id: "c", text: "The curve meets the axis three standard deviations from the mean", correct: false, feedback: "The tails come closer and closer to the axis but never meet it; beyond three standard deviations is very rare, not impossible." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: "About what percentage of a normal distribution lies within two standard deviations of the mean?",
      skill: "The 95% figure",
      options: [
        { id: "a", text: `${W2}%`, correct: true, feedback: `Yes: about ${W2}% within two standard deviations, and about ${W1}% within one.` },
        { id: "b", text: `${W1}%`, correct: false, misconception: MB.proportion, feedback: `${W1}% is the share within ONE standard deviation. Two standard deviations hold about ${W2}%.` },
        { id: "c", text: `${W2 / 2}%`, correct: false, misconception: MB.oneSided, feedback: `${W2 / 2}% is the share between the mean and two standard deviations on ONE side. Both sides together hold about ${W2}%.` },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: "Masses are normally distributed with mean 200 g and standard deviation 10 g. Between which two masses do about 68% of them lie?",
      skill: "A range centred on the mean",
      options: [
        { id: "a", text: "190 g and 210 g", correct: true, feedback: "Yes: one standard deviation either side of the mean." },
        { id: "b", text: "200 g and 210 g", correct: false, misconception: MB.oneSided, feedback: "That range starts at the mean, so it holds only half of the 68%. Go one standard deviation below the mean as well: 190 g to 210 g." },
        { id: "c", text: "180 g and 220 g", correct: false, misconception: MB.proportion, feedback: "Two standard deviations either side hold about 95%. For about 68%, go one standard deviation: 190 g to 210 g." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: "A question says that some masses are normally distributed with mean 200 g and standard deviation 10 g, and asks roughly what percentage are over 220 g. What do you need to work out first?",
      skill: "Using the given mean and standard deviation",
      options: [
        { id: "a", text: "How many standard deviations 220 g is above the mean", correct: true, feedback: "Yes: 220 g is two standard deviations above 200 g, so about 2.5% are heavier. The mean and standard deviation are given; nothing needs recalculating." },
        { id: "b", text: "The standard deviation again, using the formula", correct: false, misconception: MB.sdFormula, feedback: "The standard deviation is given as 10 g; the formula is for finding it from data. Count how many standard deviations 220 g is from the mean instead." },
        { id: "c", text: "The mean of 200 and 220", correct: false, feedback: "The mean of the distribution is given as 200 g. What matters is how far 220 g is from it, counted in standard deviations." },
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

const ftmWrong = e(route("bell-ftm1", MB.proportion));
const ftm = {
  id: `ftm.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  stem: `The masses of newborn babies are normally distributed with mean ${n(BA.mean)} kg and standard deviation ${n(BA.sd)} kg. Ciara was asked roughly what percentage weigh more than ${at("babies", 1)} kg. Her working:`,
  studentWorking: [
    `${at("babies", 1)} kg is ${n(BA.mean)} + ${n(BA.sd)}, one standard deviation above the mean`,
    `About ${W1}% lie within one standard deviation of the mean`,
    `So 100 − ${W1} = ${OUT1}% lie outside it`,
    `Heavier than ${at("babies", 1)} kg: about ${ftmWrong}%`,
  ],
  mistakeLine: 4,
  misconception: MB.proportion,
  whatWentWrong: `Line 4 counts all of the ${OUT1}% as heavy babies. The ${OUT1}% outside one standard deviation is split equally between the two tails, so only half of it, about ${T1}%, lies above ${at("babies", 1)} kg; the other ${T1}% are the light babies below ${at("babies", -1)} kg.`,
  correction: [
    `${at("babies", 1)} kg is ${n(BA.mean)} + ${n(BA.sd)}, one standard deviation above the mean`,
    `About ${W1}% lie within one standard deviation of the mean`,
    `So 100 − ${W1} = ${OUT1}% lie outside it`,
    `Heavier than ${at("babies", 1)} kg: ${OUT1} ÷ 2 = ${T1}%`,
  ],
  marksEarnedAsWritten: ["M1"],
  feedback: `Her first three lines are right, so the method is safe until the last step. A sketch shows the slip at once: shading above ${at("babies", 1)} kg covers one thin tail, and a third of all babies would be far too many for it.`,
  source: q2019,
};

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const RP = (k) => `rp.${TOPIC}.${k}`;
const prompts = [
  { id: RP("01"), kind: "definition", prompt: "Describe the shape of a normal distribution.", answer: "A symmetric bell: highest at the mean, falling away evenly on both sides, with tails that come closer and closer to the axis without touching it.", keyWords: ["symmetric", "mean", "tails"], difficultyPrior: 1 },
  { id: RP("02"), kind: "formula", prompt: "Roughly what percentages of a normal distribution lie within one, two and three standard deviations of the mean?", answer: `About ${W1}% within one standard deviation, ${W2}% within two and ${W3}% within three.`, keyWords: [`${W1}%`, `${W2}%`], difficultyPrior: 1 },
  { id: RP("03"), kind: "definition", prompt: "How are the mean, the median and the mode of a normal distribution related, and why?", answer: "They are equal: the curve is symmetric about the mean, so its highest point and the point that halves the area are both at the centre.", keyWords: ["equal", "symmetric"], difficultyPrior: 2 },
  { id: RP("04"), kind: "procedure", prompt: "About what percentage of a normal distribution lies more than one standard deviation above the mean, and why?", answer: `About ${T1}%: the ${OUT1}% outside one standard deviation is split equally between the two tails.`, keyWords: [`${T1}%`, "split equally"], difficultyPrior: 2 },
  { id: RP("05"), kind: "trap", prompt: "Give one variable that is roughly normal and one that is not, with a reason for each.", answer: "Adult heights are roughly normal: continuous and gathered evenly around the mean. Incomes are not: most people earn near the lower end, with a long tail of very high incomes, so the shape is skewed.", keyWords: ["heights", "skewed"], difficultyPrior: 2 },
].map((p) => ({ ...p, topic: TOPIC, specRefs: SPEC, examUnit: "FM3" }));

// ---------------------------------------------------------------------------
// Sheet, note, topic
// ---------------------------------------------------------------------------

const sheet = {
  mustBeAbleTo: [
    "Recognise a variable that is roughly normal (continuous and gathered evenly around its average: heights, masses, measurement errors) and one that is not (counts, or skewed data such as incomes)",
    "Describe the curve: bell-shaped and symmetric about the mean, mean = median = mode, total area 1, tails that approach the axis without meeting it",
    "Sketch the curve with the mean under the peak and one and two standard deviations marked either side",
    `Use about ${W1}% within one standard deviation, ${W2}% within two and ${W3}% within three, and halve what lies outside for one tail`,
    "Use the mean and standard deviation the question gives: they are never recalculated",
  ],
  howExamined:
    "No Unit 3 paper from 2019 to 2026 has set the shape as a question of its own. It is examined inside the normal question (Q5 in 2019, 2023, 2024 and 2026, Q7 in 2022, Q6 in 2025 and Q3 in the 2021 paper), where the mean and standard deviation are given and a probability above or below one value is asked. The Teacher Guidance encourages a good diagram, and the 2019 report found that a sketch with the mean and the value under the axis made full marks far more likely.",
  traps: [
    "Summer 2019 FM3 Q5: nearly a fifth of candidates left the normal question blank or tried the standard deviation formula, which suggests the topic had not been taught; the mean and standard deviation were given, and a sketch with the mean and the value below the axis made full marks far more likely",
  ],
};
const notOnThisSpec = [
  "The equation of the normal curve (its probability density function)",
  "Standardising and z-values, which are the next topic",
  "Quality-control warning and action lines, and the normal approximation to the binomial",
];
const externalRefs = [yt("2WKfG8c3J74", "P McAleavey", "Normal Distribution"), PLINKO, CCEA_DOC];

const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "The normal distribution: the bell curve and its 68% and 95% figures",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  specRefs: SPEC,
  calculator: true,
  formulaSheet: {
    given: ["Nothing for this topic: the Normal Probability Table on page 3 of the booklet belongs to the next topic"],
    mustKnow: [
      "Bell-shaped and symmetric about the mean; mean = median = mode; total area 1",
      `About ${W1}% within one standard deviation of the mean, ${W2}% within two, ${W3}% within three`,
      "Roughly normal: heights, masses, measurement errors; not normal: counts and skewed data such as incomes",
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
  title: "The normal distribution as a model for real-world variables",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  strand: "Normal distribution",
  statementIds: SPEC,
  prerequisites: ["fm.u3.mean-and-standard-deviation"],
  order: 11,
  hardness: "L",
  difficulty: 1,
  examinerFlagged: true,
  examinerSources: [q2019],
  examWeightHint: sheet.howExamined,
  mustMemorise: ["Bell-shaped, symmetric about the mean; total area 1; mean = median = mode", "Roughly 68% within 1 SD, 95% within 2 SD", "Examples: heights, masses, measurement errors"],
  onFormulaSheet: [],
  notOnThisSpec,
  externalRefs,
  keywords: ["bell curve", "symmetric", "continuous", "mean", "standard deviation"],
};

const sets = [
  {
    id: `set.${TOPIC}.ladder`,
    topic: TOPIC,
    kind: "interleaved",
    title: "From the shape to the 68% and 95% figures: the ladder",
    subject: "further-maths",
    units: ["FM3"],
    itemIds: [`dx.${TOPIC}.pre`, Q("0001"), Q("0002"), RP("01"), Q("0003"), Q("0004"), ftm.id, Q("0005"), RP("04"), Q("0006"), Q("0007"), `dx.${TOPIC}.post`],
    showTopicLabels: false,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const SCOPE =
  "Unit 3 (Statistics), untiered, calculator paper; statement FM3-NOR-01 (recognise that many real-world variables take the shape of a bell curve) with its Teacher Guidance (a good diagram). The 68%, 95% and 99.7% figures come from the spec file's mustMemorise; no standardising, no table, no curve equation (the next topic and beyond).";
const FS = "packs/further-maths/exam-true/formula-sheets.json (FM3): nothing for this statement; the Normal Probability Table on page 3 belongs to FM3-NOR-02.";
const CMD = "Command words from packs/further-maths/exam-true/command-words.json: Identify, Write down, Find, Show that.";
const TAR =
  "No FM3 paper from 2019 to 2026 sets this statement as a part of its own (read: the Summer 2019, 2021, 2022, 2023, 2024, 2025 and 2026 papers and the 2019 and 2021-2025 schemes); the exam-style question is built as the opening of a normal question in the paper's context shape, at 1-2 marks a part, inside packs/further-maths/exam-true/tariffs.json (FM3 per part median 2).";
const SHINGLE =
  "Compared against the FM3 papers, schemes and Chief Examiner reports read for this batch; every context and number is new, and node scripts/qa/shingles.mjs --unit fm3 reports no breach for this topic.";
const STYLE = "British English; second person; no exclamation marks; every $...$ pair on one line, no prose inside maths, every TeX command keeps its backslash.";
const NUM = (what) =>
  `${what} is emitted by scratchpad/fm3-batch-c/normal-distribution-bell-curve.mjs: the 68/95/99.7 figures from the erf-series Phi in stat.mjs (asserted in routes.mjs), every range as mean ± k standard deviations in exact rationals, every figure drawn from the density or from Phi; every distractor value is its executed route in routes.mjs, checked by verify-published.mjs.`;

const verification = [
  verLog(note.id, {
    schema: "Shape validated against src/lib/content/schema.ts and lesson template v2 by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "formula-sheet": FS,
    "command-words": CMD,
    tariff: TAR,
    "maths-numeric": NUM("Every share, range and value in the note, its gates and its seven figures"),
    "examiner-alignment": `The Sheet's trap cites ${q2019} (the question left blank or the standard deviation formula tried; the sketch with the mean and the value below the axis); no examiner callout is needed in the body.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(we.id, {
    schema: "Shape validated against src/lib/content/schema.ts (WorkedExample) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    tariff: "Four steps: the multiple chosen from the percentage, then M1 for two standard deviations and W1 for each end of the range.",
    "maths-numeric": NUM(`The range ${at("women", -2)} to ${at("women", 2)} and the twin's ${at("leaves", -2)}`),
    "examiner-alignment": `Rehearses the mean and standard deviation used as given (${q2019}).`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(pre.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": "Prerequisite items only: the standard deviation as spread and as a step from the mean (the previous FM3 topic), and the median as the halfway value (GCSE Mathematics), each labelled as a check on earlier work.",
    "command-words": CMD,
    "maths-numeric": NUM("Every option value"),
    "examiner-alignment": "Prerequisite distractors carry no misconception tag; their feedback names the slip.",
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(post.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "command-words": CMD,
    "maths-numeric": NUM("Every option value"),
    "examiner-alignment": `d4 (b) is the ${q2019} finding (the standard deviation formula reached for); the other tags are the two misconceptions this topic registers, flagged in the registry as evidenced by analogy only.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(ftm.id, {
    schema: "Shape validated against src/lib/content/schema.ts (FindTheMistake) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "maths-numeric": NUM(`The unhalved ${ftmWrong}% and the corrected ${T1}%`),
    "examiner-alignment": `Seeded from ${q2019}: the proportions of a topic a fifth of candidates had not met; the slip is registered as fm.normal.proportion-misread, evidenced by analogy.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  ...prompts.map((p) =>
    verLog(p.id, {
      schema: "Shape validated against src/lib/content/schema.ts (RetrievalPrompt) by pipeline/build-content.mts",
      "scope-tier": SCOPE,
      "formula-sheet": FS,
      "examiner-alignment": `Rehearses the facts behind ${q2019}.`,
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
  workedExamples: [we],
  diagnostics: [pre, post],
  questions,
  findTheMistake: [ftm],
  prompts,
  sets,
  verification,
};

emit(SLUG, bundle, blocks);
