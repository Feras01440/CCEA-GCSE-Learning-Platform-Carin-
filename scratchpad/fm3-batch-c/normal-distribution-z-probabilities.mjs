/**
 * FM3 batch C, topic 2 — normal-distribution-z-probabilities (difficulty 3 -> S).
 *   node scratchpad/fm3-batch-c/normal-distribution-z-probabilities.mjs      (from the repository root)
 *
 * Every z is (x - mean)/sd asserted exact to two decimal places (stat.mjs zScore); every table value
 * is Phi from the error-function series, printed to four places and checked against the entries the
 * 2022-2025 schemes print; every probability is the table arithmetic held as an exact rational; every
 * commonError value is route() from routes.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { big, bFixed, bMul, bSub, bValue, figure } from "./lib.mjs";
import { Normal, ONE, exactDec, phi, phiFixed, d4, rat } from "./stat.mjs";
import { nTail, nScales, nTable, nSides, nFold, nRough, zLabel } from "./phone.mjs";

/** x / y for two exact rationals. */
const ratDiv = (x, y) => big(x.n * y.d, x.d * y.n);
import { NORM, NT, MN, MC, NDXD, nmodel, route, tailAt, tableValue } from "./routes.mjs";
import { shown } from "./binfig.mjs";
import { ROOT, CCEA_DOC, UPDATED, emit, src, timeFor, verLog, yt } from "./emit.mjs";

const TOPIC = NT;
const SLUG = "normal-distribution-z-probabilities";
const SPEC = ["FM3-NOR-02"];

const q2019 = src("2019-summer", 5);
const q2022 = src("2022-summer", 7);
const q2023 = src("2023-summer", 5);
const q2024 = src("2024-summer", 5);
const q2025 = src("2025-summer", 6);

const PAPER = {
  unit: "FM3",
  calculator: true,
  resources: ["Scientific calculator", "Formula sheet printed on page 2 of the question-and-answer booklet", "Normal Probability Table on page 3 of the booklet"],
};
const FOUR_DP = "Give your answer to 4 decimal places.";

// ---------------------------------------------------------------------------
// Printing helpers
// ---------------------------------------------------------------------------

const e = (x) => exactDec(x, 16);
/** A probability as the answer line gives it: four decimal places, trailing zeros kept. */
const pv = (x) => d4(x);
const Z = new Normal(0, 1);
/** The four-figure table entry for |z|, as printed. */
const T = (z) => Z.table(z).s;
/** A z-value printed as the paper prints it: 1.3, -0.9, 1.45. */
const zs = (z) => String(z);
/** A number from a context, printed plainly. */
const n = (v) => String(v);

const N = Object.fromEntries(Object.keys(NORM).map((k) => [k, nmodel(k)]));
const above = (k, x) => N[k].above(x);
const below = (k, x) => N[k].below(x);

/** Refuses a table entry within 0.02 of a four-figure rounding tie, so every printed entry is safe. */
const safeTable = (z) => {
  const scaled = phi(Math.abs(z)) * 1e4;
  const frac = scaled - Math.floor(scaled);
  if (Math.abs(frac - 0.5) < 0.02) throw new Error(`Phi(${z}) sits on a four-figure rounding tie`);
  return z;
};

const prob4 = (x) => ({ kind: "numeric", value: bValue(x, 4), tolerance: { type: "dp", places: 4 }, unitRequired: false, acceptForms: ["decimal"] });
const zSpec = (z) => ({ kind: "numeric", value: z, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] });
const ce = (where, misconception, feedback, marks, source, { nth = 0, exact = false } = {}) => {
  const x = route(where, misconception, nth);
  return {
    misconception,
    pattern: exact ? { kind: "numeric", value: Number(e(x)), tolerance: { type: "exact" } } : { kind: "numeric", value: bValue(x, 4), tolerance: { type: "dp", places: 4 } },
    feedback,
    marksTypicallyEarned: marks,
    source,
  };
};
const rv = (where, misconception, nth = 0) => d4(route(where, misconception, nth));

/** The z-line of a worked solution: "z = \frac{40.5 - 34}{5} = 1.3". */
const zLine = (k, x) => {
  const { mean, sd } = NORM[k];
  return `z = \\frac{${n(x)} - ${n(mean)}}{${n(sd)}} = ${zs(N[k].z(x))}`;
};

// Every z used in this topic, held to the table's own safety margin.
for (const z of [1.3, 1.8, 0.6, 0.9, 1.24, 1.45, 0.35, 2.3, 1.55, 1.05, 2.1, 1.15, 0.85, 1.62, 1.6, 2.2, 1.35, 1.65, 0.7, 1.9, 1.7, 1.84, 0.95, 1.0, 1.06, 0.62, 1.01, 1.5, 0.82]) safeTable(z);

// ---------------------------------------------------------------------------
// Figures (note)
// ---------------------------------------------------------------------------

const TR = NORM.trout;
const figHero = nTail({
  mean: TR.mean,
  x: 40.5,
  z: N.trout.z(40.5),
  unit: TR.unit,
  tail: "right",
  statement: "P(L > 40.5)",
  title: `A normal curve for trout lengths with mean ${TR.mean} cm, and the region above 40.5 cm shaded; 40.5 cm has z = ${zs(N.trout.z(40.5))}`,
});
const figScales = nScales({
  marks: (z) => n(TR.mean + z * TR.sd),
  unitLabel: "length (cm)",
  highlight: { z: N.trout.z(40.5), top: n(40.5), bottom: zs(N.trout.z(40.5)) },
  title: `Two aligned scales: trout length from ${TR.mean - 3 * TR.sd} to ${TR.mean + 3 * TR.sd} cm above, z from −3 to 3 below, with 40.5 cm lined up with z = ${zs(N.trout.z(40.5))}`,
});
const figTable = nTable({
  rows: [1.1, 1.2, 1.3, 1.4],
  cols: [0, 0.01, 0.02, 0.03, 0.04],
  ring: { row: 1.3, col: 0 },
  title: "An extract in the shape of the Normal Probability Table, rows 1.1 to 1.4 and columns .00 to .04, with the entry for z = 1.30 ringed",
});
const figDecision = nSides({
  z: 0.9,
  title: "Two curves: shaded to the left of z, which is Phi(z); shaded to the right of z, which is 1 minus Phi(z)",
});
const figFold = nFold({
  z: 0.6,
  title: "Two curves: the left tail below z = −0.60 shaded on the upper curve and the right tail above z = 0.60 shaded on the lower one, marked as the same area",
});
const figBelowMean = nTail({
  mean: TR.mean,
  x: 29.5,
  z: N.trout.z(29.5),
  unit: TR.unit,
  tail: "right",
  statement: "P(L > 29.5)",
  title: "A normal curve for trout lengths with 29.5 cm marked below the mean and everything above it shaded, more than half of the curve",
});
const figRough = nRough({
  title: "The right-hand tails of the normal curve beyond z = 1, 2 and 3, each labelled with the share of the curve it holds",
});

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const z405 = N.trout.z(40.5);
const z43 = N.trout.z(43);
const z37 = N.trout.z(37);
const z31 = N.trout.z(31);
const z295 = N.trout.z(29.5);

// The twists' gate numbers, tied to the prose that states them.
const COND = { a: "0.2", b: "0.8", lo: 150, hi: 170 };
const condRatio = e(ratDiv(rat(COND.a), rat(COND.b)));
const condProduct = e(bMul(rat(COND.a), rat(COND.b)));
if (condRatio !== "0.25" || condProduct !== "0.16") throw new Error("g9 numbers are stale");
const DEL = { mean: 48, sd: 8, hours: 1 };
const zDel = (DEL.hours * 60 - DEL.mean) / DEL.sd;
if (zDel !== 1.5) throw new Error("g10 numbers are stale");

const blocks = [
  {
    type: "hero",
    lede: "Trout on a fish farm have lengths that follow a normal curve. What fraction are longer than 40.5 cm? One subtraction and one division turn 40.5 into a z-score, the printed table turns the z-score into an area, and a quick sketch tells you whether that area is the answer or 1 minus it.",
    can: [
      "Standardise a value with z = (x − μ)/σ and say what the z-score means",
      "Read Φ(z) from the Normal Probability Table and decide from a sketch whether to take it from 1",
      "Use the symmetry of the curve when the value is below the mean",
    ],
    minutes: 0,
  },
  { type: "h", text: "How many trout are longer than 40.5 cm?", role: "idea" },
  {
    type: "p",
    md: `On a fish farm the trout have lengths that are normally distributed with mean ${TR.mean} cm and standard deviation ${TR.sd} cm. The fraction longer than 40.5 cm is the area under the curve to the right of 40.5.\nThe whole area under the curve is 1, so that shaded area is a probability, $P(L > 40.5)$.`,
  },
  {
    type: "figure",
    alt: `A bell-shaped curve over a horizontal axis. Under the axis, the mean ${TR.mean} cm with z = 0 under it, and 40.5 cm with z = ${zLabel(z405)} under it. The region under the curve to the right of 40.5 is shaded and labelled P(L > 40.5) above the curve.`,
    svg: figHero,
    caption: "The mean sits under the peak. The values and their z-scores go under the axis; only the shaded area goes above it.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "On the trout curve, which way from 40.5 cm does the shaded region go?",
    options: ["To the right, towards longer trout", "To the left, towards shorter trout"],
    answer: "To the right, towards longer trout",
    explain: "The question is about trout longer than 40.5 cm, so the region runs to the right of 40.5, out into the tail.",
  },

  { type: "h", text: "Standardise: count the standard deviations", role: "idea" },
  {
    type: "p",
    md: "Every normal curve has the same shape; only its centre and its spread change. The z-score measures a value in standard deviations from the mean:\n$z = \\frac{x - \\mu}{\\sigma}$\nSubtract the mean to find how far $x$ is from the middle, then divide by the standard deviation to count that distance in standard deviations.",
  },
  {
    type: "figure",
    alt: `Two parallel number lines. The upper one is trout length in cm, ${[-3, -2, -1, 0, 1, 2, 3].map((z) => n(TR.mean + z * TR.sd)).join(", ")}; the lower one is z, −3 to 3, with each length directly above its z-value. A bold line joins 40.5 cm on the upper scale to z = ${zs(z405)} on the lower one.`,
    svg: figScales,
    caption: `Each standard deviation, ${TR.sd} cm, is one step on the z scale.`,
  },
  {
    type: "p",
    md: `For the trout, $${zLine("trout", 40.5)}$: 40.5 cm sits ${zs(z405)} steps above the mean on the lower scale.`,
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "Learn this one",
    md: "$z = \\frac{x - \\mu}{\\sigma}$ is not on the Unit 3 formula sheet. $\\mu$ is the mean and $\\sigma$ the standard deviation. A value below the mean gives a negative $z$.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "number",
    prompt: `Trout lengths have mean ${TR.mean} cm and standard deviation ${TR.sd} cm. What is the z-score of a trout 29.5 cm long?`,
    answer: `${zs(z295)} | ${zs(z295).replace("-", "−")}`,
    explain: `$z = \\frac{29.5 - ${TR.mean}}{${TR.sd}} = \\frac{${n(29.5 - TR.mean)}}{${TR.sd}} = ${zs(z295)}$. The minus sign says 29.5 cm is below the mean.`,
  },

  { type: "h", text: "The table gives the left area", role: "idea" },
  {
    type: "p",
    md: "The Normal Probability Table on page 3 of the booklet lists $\\Phi(z)$, the area under the standard curve to the left of $z$, which is $P(Z < z)$.",
  },
  {
    type: "figure",
    alt: `A table extract. Rows 1.1, 1.2, 1.3 and 1.4 down the side, columns .00 to .04 across the top. The entry in row 1.3, column .00, ${T(1.3)}, is ringed.`,
    svg: figTable,
    caption: "An extract: z to one decimal place down the side, the second decimal place across. The printed table runs from 0.00 to 3.99.",
  },
  {
    type: "p",
    md: `Find the row for $z$ to one decimal place, then move across to the column for the second decimal place. For $z = 1.30$ that is row 1.3, column .00: $\\Phi(1.30) = ${T(1.3)}$, the ringed entry.`,
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: "Using the table extract with rows 1.1 to 1.4, what is $\\Phi(1.24)$?",
    answer: T(1.24),
    explain: `Row 1.2, column .04: $\\Phi(1.24) = ${T(1.24)}$, the area to the left of $z = 1.24$.`,
  },

  { type: "h", text: "Rough sizes of the tails", role: "idea" },
  {
    type: "figure",
    alt: `A normal curve with the right-hand tails beyond z = 1, 2 and 3 shaded more and more darkly, and under each z the share of the curve beyond it: ${[1, 2, 3].map((k) => `${((1 - phi(k)) * 100).toFixed(k === 3 ? 2 : k === 2 ? 1 : 0)}%`).join(", ")}.`,
    svg: figRough,
    caption: "The share of the curve beyond z = 1, 2 and 3: numbers to hold an answer against before writing it down.",
  },
  {
    type: "p",
    md: "About 68% of a normal distribution lies within one standard deviation of the mean, so each tail beyond $z = 1$ holds about 16%. About 95% lies within two, so a tail beyond $z = 2$ holds roughly 2.5%; the table makes it 2.3%. Compare every answer with these before you write it down.",
  },
  {
    type: "gate",
    id: "g8",
    kind: "choice",
    prompt: "Roughly what fraction of a normal curve lies in the right-hand tail beyond $z = 2.1$?",
    options: ["A little under 2.5%", "About 16%", "About 98%"],
    answer: "A little under 2.5%",
    explain: `Beyond $z = 2$ is about 2.3%, and 2.1 is a little further out: $1 - \\Phi(2.1) = 1 - ${T(2.1)} = ${pv(bSub(ONE, Z.table(2.1).r))}$, about ${(Number(pv(bSub(ONE, Z.table(2.1).r))) * 100).toFixed(1)}%. The 98% is $\\Phi(2.1)$, the area to the left.`,
  },

  { type: "h", text: "Positive z: shade, then decide", role: "variant" },
  {
    type: "p",
    md: "The table only ever gives the area to the left. So draw the curve, mark $x$ and its $z$ under the axis, and shade the region the question asks for. Then decide.",
  },
  {
    type: "figure",
    alt: "Two small curves. On the left one the region to the left of z is shaded, labelled P(Z < z) = Φ(z). On the right one the region to the right of z is shaded, labelled P(Z > z) = 1 − Φ(z).",
    svg: figDecision,
    caption: "Shaded to the left: read the table. Shaded to the right: take the table value from 1.",
  },
  {
    type: "p",
    md: "Shaded to the left, the answer is $\\Phi(z)$. Shaded to the right, the answer is $1 - \\Phi(z)$, because the whole area is 1.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "The mark most often dropped",
    md: "Examiners have reported candidates who found $z$ correctly and then gave the table value where 1 minus it was needed, and they noted that a sketch with $x$ and $z$ under the axis made full marks far more likely.",
    source: q2019,
  },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: `Trout lengths have mean ${TR.mean} cm and standard deviation ${TR.sd} cm, and $\\Phi(1.3) = ${T(1.3)}$. What is $P(L > 40.5)$?`,
    answer: pv(above("trout", 40.5)),
    explain: `Shaded to the right, so $1 - \\Phi(1.3) = 1 - ${T(1.3)} = ${pv(above("trout", 40.5))}$. Giving ${pv(route("znote#trout-right", MN.notSubtracted))} would say that most trout are longer than 40.5 cm.`,
  },

  { type: "h", text: "Negative z: fold the curve", role: "variant" },
  {
    type: "figure",
    alt: "Two curves, one above the other. On the upper curve the left tail below z = −0.60 is shaded and labelled P(Z < −0.60). On the lower curve the right tail above z = 0.60 is shaded and labelled P(Z > 0.60). A box between them says same area, by symmetry.",
    svg: figFold,
    caption: "Fold the curve at the mean and one tail lands on the other.",
  },
  {
    type: "p",
    md: `The table stops at $z = 0$ because the curve is symmetric about its mean. The left tail below $-z$ is the mirror image of the right tail above $z$, so the two areas are equal:\n$P(Z < -z) = P(Z > z) = 1 - \\Phi(z)$\nFor a trout shorter than 31 cm, $${zLine("trout", 31)}$.`,
  },
  {
    type: "callout",
    kind: "why",
    title: "Why it is 1 minus",
    md: `$\\Phi(${zs(-z31)})$ is everything to the left of $+${zs(-z31)}$. Fold the tail below $${zs(z31)}$ across the mean and it lands exactly on the tail above $+${zs(-z31)}$, which is everything except $\\Phi(${zs(-z31)})$.`,
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: `Trout lengths have mean ${TR.mean} cm and standard deviation ${TR.sd} cm, and $\\Phi(${zs(-z31)}) = ${T(z31)}$. Work out $P(L < 31)$.`,
    answer: pv(below("trout", 31)),
    explain: `$z = ${zs(z31)}$, a left tail below a negative $z$: $1 - \\Phi(${zs(-z31)}) = 1 - ${T(z31)} = ${pv(below("trout", 31))}$. Leaving ${T(z31)} would say most trout are shorter than 31 cm, and the sketch shows only a thin tail.`,
  },

  { type: "h", text: "Above a value below the mean", role: "variant" },
  {
    type: "figure",
    alt: `A normal curve with 29.5 cm marked below the mean ${TR.mean} cm, z = ${zLabel(z295)} under it, and everything to the right of 29.5 shaded, more than half of the curve, labelled P(L > 29.5).`,
    svg: figBelowMean,
    caption: "More than half is shaded, so the answer is more than 0.5.",
  },
  {
    type: "p",
    md: "When $x$ is below the mean and you want the area above it, more than half of the curve is shaded. By the same symmetry, $P(Z > -z)$ is $P(Z < z)$, which is $\\Phi(z)$: read the table and stop.\nThe sketch keeps you honest here. If more than half is shaded, the answer must be more than 0.5.",
  },
  {
    type: "gate",
    id: "g7",
    kind: "number",
    prompt: `Trout lengths have mean ${TR.mean} cm and standard deviation ${TR.sd} cm, and $\\Phi(${zs(-z295)}) = ${T(z295)}$. What is $P(L > 29.5)$?`,
    answer: pv(above("trout", 29.5)),
    explain: `$z = ${zs(z295)}$ and the area above it is the mirror image of the area below $+${zs(-z295)}$: $P(L > 29.5) = \\Phi(${zs(-z295)}) = ${T(z295)}$. Taking it from 1 would give ${pv(bSub(ONE, above("trout", 29.5)))}, less than a half, which the sketch rules out.`,
  },

  { type: "h", text: "See it done", role: "see" },
  {
    type: "p",
    md: `**Question.** Trout lengths have mean ${TR.mean} cm and standard deviation ${TR.sd} cm. Find the probability that a trout is longer than 43 cm. ${FOUR_DP}`,
  },
  {
    type: "p",
    md: `**Line 1.** $z = \\frac{43 - ${TR.mean}}{${TR.sd}}$\n**Line 2.** $= ${zs(z43)}$. The first two marks are for these two lines.\n**Line 3.** Sketch: 43 cm is above the mean, so shade to the right.\n**Line 4.** $P(L > 43) = 1 - \\Phi(${zs(z43)})$\n**Line 5.** $= 1 - ${T(z43)}$\n**Line 6.** $= ${pv(above("trout", 43))}$`,
  },
  {
    type: "video",
    videoId: "0wSN38J2t18",
    title: "Master Normal Distribution in minutes!",
    channel: "N.I. Maths Tutor",
    why: "A Northern Ireland tutor on normal-distribution probabilities for CCEA. As you watch, make the decision yourself before each answer appears: which side is shaded, and is the table value the answer or 1 minus it?",
  },
  {
    type: "gate",
    id: "g5",
    kind: "number",
    prompt: `Trout lengths have mean ${TR.mean} cm and standard deviation ${TR.sd} cm, and $\\Phi(${zs(z37)}) = ${T(z37)}$. Work out $P(L < 37)$ to 4 decimal places.`,
    answer: pv(below("trout", 37)),
    explain: `$${zLine("trout", 37)}$. The region is shaded to the left, so the answer is $\\Phi(${zs(z37)}) = ${T(z37)}$ itself, with nothing taken from 1.`,
  },

  { type: "h", text: "Exam twists", role: "twists" },
  {
    type: "p",
    md: "**More than a value below the mean.** The second part in 2024, 2025 and 2026. More than half the curve is shaded, so the answer is over 0.5: read $\\Phi$ at the positive $z$ and stop.",
  },
  {
    type: "p",
    md: "**Given that.** 2022 and 2023 ended with less than one value, given less than a larger one. Everything below the smaller value is also below the larger, so divide one tail by the other.",
  },
  {
    type: "gate",
    id: "g9",
    kind: "choice",
    prompt: `Plant heights are normally distributed, with $P(H < ${COND.lo}) = ${COND.a}$ and $P(H < ${COND.hi}) = ${COND.b}$. What is the probability that a plant is shorter than ${COND.lo} cm, given that it is shorter than ${COND.hi} cm?`,
    options: [condRatio, condProduct, COND.a],
    answer: condRatio,
    explain: `Every plant under ${COND.lo} cm is also under ${COND.hi} cm, so the top of the fraction is $P(H < ${COND.lo})$ itself: $\\frac{${COND.a}}{${COND.b}} = ${condRatio}$. Multiplying ${COND.a} by ${COND.b} treats the two heights as independent, and they are not.`,
  },
  {
    type: "p",
    md: "**Units that do not match.** 2026 gave a mean in minutes and asked about a number of hours. Convert first, then standardise: 2 hours is 120 minutes.",
  },
  {
    type: "p",
    md: "**Words that change the tail.** 'Or over' and 'does not qualify' decide the shading, not the method (2021). For a measurement, 'or over' and 'more than' give the same probability.",
  },
  {
    type: "gate",
    id: "g10",
    kind: "choice",
    prompt: `Delivery times have mean ${DEL.mean} minutes and standard deviation ${DEL.sd} minutes. A question asks for the probability that a delivery does not take more than ${DEL.hours} hour. Which first line is right?`,
    options: [
      `$z = \\frac{${DEL.hours * 60} - ${DEL.mean}}{${DEL.sd}}$, shaded to the left`,
      `$z = \\frac{${DEL.hours} - ${DEL.mean}}{${DEL.sd}}$, shaded to the left`,
      `$z = \\frac{${DEL.hours * 60} - ${DEL.mean}}{${DEL.sd}}$, shaded to the right`,
    ],
    answer: `$z = \\frac{${DEL.hours * 60} - ${DEL.mean}}{${DEL.sd}}$, shaded to the left`,
    explain: `An hour is ${DEL.hours * 60} minutes, so standardise ${DEL.hours * 60}, not ${DEL.hours}: $z = ${zDel}$. 'Does not take more than' is the region to the left of ${DEL.hours * 60}, so the answer is read straight from the table: $\\Phi(${zDel}) = ${T(zDel)}$.`,
  },

  { type: "h", text: "You can now" },
  {
    type: "p",
    md: "Standardise with $z = \\frac{x - \\mu}{\\sigma}$, which is not on the formula sheet.\nRead $\\Phi(z)$: the row for the first decimal place, the column for the second.\nSketch and shade first, then choose $\\Phi(z)$ or $1 - \\Phi(z)$, folding the curve for a negative $z$.\nFor 'given that', divide one tail by the other.\nCheck an answer against 16% beyond one standard deviation and 2.3% beyond two.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The normal question sits in the middle of Unit 3: usually two parts of 3 or 4 marks, each a probability above or below one value, to 4 decimal places, and in 2022 and 2023 a 2-mark 'given that' to finish. The first two marks are for the z-value, then one for the shading or the 1 minus decision, and the last for the answer. Stuck? Sketch and shade: the picture shows the next step.",
  },
  { type: "prompt", promptId: `rp.${TOPIC}.01` },
  { type: "prompt", promptId: `rp.${TOPIC}.02` },
  { type: "prompt", promptId: `rp.${TOPIC}.03` },
  { type: "prompt", promptId: `rp.${TOPIC}.04` },
  { type: "prompt", promptId: `rp.${TOPIC}.06` },
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
// Scheme helpers
// ---------------------------------------------------------------------------

const zMarks = (k, x) => {
  const { mean, sd } = NORM[k];
  const z = N[k].z(x);
  return [
    { id: "M1", code: "M", marks: 1, for: `$z = \\frac{${n(x)} - ${n(mean)}}{${n(sd)}}$`, accept: [`(${n(x)} - ${n(mean)})/${n(sd)}`] },
    { id: "W1", code: "W", marks: 1, for: `$z = ${zs(z)}$`, dependsOn: ["M1"] },
  ];
};
/** The four-mark tail scheme: z (M1 W1), the 1 minus or symmetry step (M1), the value (W1). */
const fourMark = (k, x, tail) => {
  const z = N[k].z(x);
  const needsOneMinus = (tail === "above" && z > 0) || (tail === "below" && z < 0);
  const p = tail === "above" ? above(k, x) : below(k, x);
  return [
    ...zMarks(k, x),
    needsOneMinus
      ? { id: "M2", code: "M", marks: 1, for: `$1 - \\Phi(${zs(Math.abs(z))})$, from a sketch shaded to the ${tail === "above" ? "right" : "left"}`, accept: [`1 - ${T(z)}`] }
      : { id: "M2", code: "M", marks: 1, for: `$\\Phi(${zs(Math.abs(z))})$ by symmetry, from a sketch with more than half the curve shaded` },
    { id: "W2", code: "W", marks: 1, for: pv(p), dependsOn: ["M2"] },
  ];
};
/** The three-mark scheme where no subtraction is needed (or the value reads straight off). */
const threeMark = (k, x, tail) => {
  const z = N[k].z(x);
  const p = tail === "above" ? above(k, x) : below(k, x);
  return [...zMarks(k, x), { id: "MW1", code: "MW", marks: 1, for: `$\\Phi(${zs(Math.abs(z))}) = ${pv(p)}$` }];
};

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

const Q = (id) => `q.${TOPIC}.${id}`;
const W = (id, part = "main") => `${Q(id)}#${part}`;
const qq = (id, extra) => ({
  id: Q(id),
  topic: TOPIC,
  specRefs: SPEC,
  tier: "untiered",
  paper: PAPER,
  figures: [],
  version: 1,
  verification: `ver.${Q(id)}`,
  ...extra,
});
const questions = [];

// 0001 — reading the table extract
{
  const z = 1.84;
  const fig = nTable({
    rows: [1.7, 1.8, 1.9],
    cols: [0, 0.01, 0.02, 0.03, 0.04],
    title: "An extract in the shape of the Normal Probability Table, rows 1.7 to 1.9 and columns .00 to .04",
  });
  questions.push(
    qq("0001", {
      style: "practice",
      difficulty: 1,
      ao: ["AO1"],
      commandWords: ["Write down"],
      emphasis: ["reading the table", "right-hand tail"],
      context: { setting: "Reading an extract of the Normal Probability Table", original: true },
      figures: [figure(fig, "A table extract with rows 1.7, 1.8 and 1.9 down the side and columns .00 to .04 across the top; each entry is the area to the left of z.")],
      parts: [
        {
          id: "a",
          stem: `The extract has the same layout as the Normal Probability Table in the Unit 3 booklet.\nWrite down $\\Phi(${z})$.`,
          marks: 1,
          answer: { kind: "numeric", value: Number(T(z)), tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] },
          scheme: [{ id: "W1", code: "W", marks: 1, for: T(z) }],
          hints: ["Row 1.8 down the side.", "Then the column headed .04."],
          workedSolution: `Row 1.8, column .04: $\\Phi(${z}) = ${T(z)}$.`,
          commonErrors: [],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: `$Z$ is a standard normal variable. Write down $P(Z > ${z})$.`,
          marks: 1,
          answer: { kind: "numeric", value: Number(pv(bSub(ONE, Z.table(z).r))), tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] },
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$1 - ${T(z)} = ${pv(bSub(ONE, Z.table(z).r))}$` }],
          hints: ["The table value is the area to the left of 1.84.", "The area to the right is what is left of 1."],
          workedSolution: `$P(Z > ${z}) = 1 - \\Phi(${z}) = 1 - ${T(z)} = ${pv(bSub(ONE, Z.table(z).r))}$`,
          commonErrors: [ce(W("0001", "b"), MN.notSubtracted, `${T(z)} is the area to the LEFT of ${z}, which is what the table always gives. The right-hand tail is what is left of 1: $1 - ${T(z)} = ${pv(bSub(ONE, Z.table(z).r))}$.`, 0, q2019, { exact: true })],
          requiresWorking: false,
        },
      ],
      totalMarks: 2,
      timeAllowanceSec: timeFor(2),
      skeleton: "(a)write-down1|(b)write-down1",
      examinerSources: [q2019],
      solutionProgram: `a: Phi(${z}) = ${T(z)}; b: 1 - ${T(z)} = ${pv(bSub(ONE, Z.table(z).r))}`,
    }),
  );
}

/** A one-part practice probability question. */
const practice = (id, { k, x, tail, marks, difficulty, setting, stemLead, ask, hints, commonErrors, sources, emphasis }) => {
  const z = N[k].z(x);
  const p = tail === "above" ? above(k, x) : below(k, x);
  const needsOneMinus = (tail === "above" && z > 0) || (tail === "below" && z < 0);
  const scheme = marks === 4 ? fourMark(k, x, tail) : threeMark(k, x, tail);
  const ws = [
    `$${zLine(k, x)}$`,
    `Sketch: ${n(x)} is ${z > 0 ? "above" : "below"} the mean and the region is shaded to the ${tail === "above" ? "right" : "left"}${needsOneMinus ? "" : z < 0 ? ", more than half of the curve" : ""}.`,
    needsOneMinus
      ? `$P = 1 - \\Phi(${zs(Math.abs(z))}) = 1 - ${T(z)} = ${pv(p)}$`
      : `$P = \\Phi(${zs(Math.abs(z))}) = ${pv(p)}$${z < 0 ? ", by symmetry" : ""}`,
  ].join("\n");
  return qq(id, {
    style: "practice",
    difficulty,
    ao: ["AO1", "AO2"],
    commandWords: ["Find"],
    emphasis,
    context: { setting, original: true },
    parts: [
      {
        id: "main",
        stem: `${stemLead}\n${ask}\n${FOUR_DP}`,
        marks,
        answer: prob4(p),
        scheme,
        hints,
        workedSolution: ws,
        commonErrors,
        requiresWorking: true,
      },
    ],
    totalMarks: marks,
    timeAllowanceSec: timeFor(marks),
    skeleton: `(main)find${marks}`,
    examinerSources: sources,
    solutionProgram: `z = (${n(x)} - ${n(NORM[k].mean)}) / ${n(NORM[k].sd)} = ${zs(z)}; P = ${needsOneMinus ? `1 - ${T(z)}` : T(z)} = ${pv(p)}`,
  });
};

// 0002 — a left tail with a positive z: read the table and stop
{
  const k = "commute";
  const x = NORM[k].x;
  const z = N[k].z(x);
  questions.push(
    practice("0002", {
      k, x, tail: "below", marks: 3, difficulty: 2,
      setting: "Commuting times to work",
      emphasis: ["standardising", "left-hand tail"],
      stemLead: `The times Gráinne takes to drive to work are normally distributed with mean ${NORM[k].mean} minutes and standard deviation ${NORM[k].sd} minutes.`,
      ask: `Find the probability that on a randomly chosen day her journey takes less than ${n(x)} minutes.`,
      hints: ["Standardise first: subtract the mean, divide by the standard deviation.", "Shaded to the left, so the table value is the answer."],
      commonErrors: [
        ce(W("0002"), MN.wrongTail, `Your z-value is right, but the region is to the LEFT of ${n(x)} minutes, and the table gives exactly that area. Subtracting from 1 gives the chance of a longer journey. The answer is $\\Phi(${zs(z)}) = ${T(z)}$.`, 2, q2024),
        ce(W("0002"), MN.zFormula, `That comes from swapping the mean and the standard deviation in the formula. The z-score is $\\frac{x - \\mu}{\\sigma} = \\frac{${n(x)} - ${NORM[k].mean}}{${NORM[k].sd}} = ${zs(z)}$, giving ${T(z)}.`, 0, q2022),
      ],
      sources: [q2024, q2022],
    }),
  );
}

// 0003 — a right tail with a positive z
{
  const k = "carrots";
  const x = NORM[k].x;
  const z = N[k].z(x);
  questions.push(
    practice("0003", {
      k, x, tail: "above", marks: 4, difficulty: 2,
      setting: "Masses of bags of carrots from a packing line",
      emphasis: ["standardising", "right-hand tail", "1 minus"],
      stemLead: `The masses of bags of carrots filled by a machine are normally distributed with mean ${NORM[k].mean} g and standard deviation ${NORM[k].sd} g.`,
      ask: `Find the probability that a bag chosen at random has a mass of more than ${n(x)} g.`,
      hints: ["The region is to the right of 1045.2 g.", "The table gives the left-hand area, so take it from 1."],
      commonErrors: [
        ce(W("0003"), MN.notSubtracted, `${T(z)} is $\\Phi(${zs(z)})$, the area to the left of ${n(x)} g: nearly every bag. The question wants the heavy tail, $1 - ${T(z)} = ${pv(above(k, x))}$.`, 2, q2019),
        ce(W("0003"), MN.zFormula, `The z-value has the mean and the standard deviation the wrong way round. $z = \\frac{${n(x)} - ${NORM[k].mean}}{${NORM[k].sd}} = ${zs(z)}$, and then $1 - ${T(z)} = ${pv(above(k, x))}$.`, 1, q2024),
      ],
      sources: [q2019, q2024],
    }),
  );
}

// 0004 — a left tail with a negative z: the fold
{
  const k = "deer";
  const x = NORM[k].x;
  const z = N[k].z(x);
  questions.push(
    practice("0004", {
      k, x, tail: "below", marks: 4, difficulty: 3,
      setting: "Shoulder heights of red deer stags in a park",
      emphasis: ["negative z", "symmetry"],
      stemLead: `The shoulder heights of red deer stags in a park are normally distributed with mean ${NORM[k].mean} cm and standard deviation ${NORM[k].sd} cm.`,
      ask: `Find the probability that a stag chosen at random is less than ${n(x)} cm tall.`,
      hints: ["The z-value is negative: the table has no row for it.", "Fold the curve: the tail below −1.15 matches the tail above 1.15."],
      commonErrors: [
        ce(W("0004"), MN.negative, `${T(z)} is $\\Phi(${zs(-z)})$, the area to the left of $+${zs(-z)}$: most of the curve. The tail below $${zs(z)}$ is its mirror image on the other side, so the answer is $1 - ${T(z)} = ${pv(below(k, x))}$.`, 2, q2023),
        ce(W("0004"), MN.zFormula, `That z-value divides by the mean. $z = \\frac{x - \\mu}{\\sigma} = \\frac{${n(x)} - ${NORM[k].mean}}{${NORM[k].sd}} = ${zs(z)}$, a negative value, and the tail below it is $1 - ${T(z)} = ${pv(below(k, x))}$.`, 0, q2022),
      ],
      sources: [q2023, q2022],
    }),
  );
}

// 0005 — a right tail with a negative z: more than half the curve
{
  const k = "led";
  const x = NORM[k].x;
  const z = N[k].z(x);
  questions.push(
    practice("0005", {
      k, x, tail: "above", marks: 3, difficulty: 3,
      setting: "Lifetimes of LED light bulbs",
      emphasis: ["negative z", "right-hand tail", "no subtraction"],
      stemLead: `The lifetimes of a type of LED bulb are normally distributed with mean ${NORM[k].mean} hours and standard deviation ${NORM[k].sd} hours.`,
      ask: `Find the probability that a bulb chosen at random lasts for more than ${n(x)} hours before it fails.`,
      hints: ["23 725 hours is below the mean, so more than half the curve is shaded.", "By symmetry the area above −0.85 equals the area below +0.85."],
      commonErrors: [
        ce(W("0005"), MN.wrongTail, `That is less than a half, but more than half of the curve lies above ${n(x)} hours, which is below the mean. By symmetry the area above $${zs(z)}$ is $\\Phi(${zs(-z)}) = ${T(z)}$, with nothing taken from 1.`, 2, q2025),
      ],
      sources: [q2025, q2024],
    }),
  );
}

// 0006 — z to two decimal places, used as it is
{
  const k = "bread";
  const x = NORM[k].x;
  const z = N[k].z(x);
  questions.push(
    practice("0006", {
      k, x, tail: "above", marks: 4, difficulty: 3,
      setting: "Masses of loaves from a bakery",
      emphasis: ["z to two decimal places", "right-hand tail"],
      stemLead: `The masses of loaves from a bakery are normally distributed with mean ${NORM[k].mean} g and standard deviation ${NORM[k].sd} g.`,
      ask: `Find the probability that a loaf chosen at random weighs more than ${n(x)} g.`,
      hints: ["Keep z to two decimal places: the table has a column for the second one.", "Shaded to the right: 1 minus the table value."],
      commonErrors: [
        ce(W("0006"), MN.zRounded, `The method is right, but $z = ${zs(z)}$ was rounded to ${(Math.round(z * 10) / 10).toFixed(1)} before the table was read. The table has a column for the second decimal place: $1 - \\Phi(${zs(z)}) = 1 - ${T(z)} = ${pv(above(k, x))}$.`, 3, q2019),
        ce(W("0006"), MN.notSubtracted, `${T(z)} is the area to the left of ${n(x)} g. The heavy loaves are the right-hand tail: $1 - ${T(z)} = ${pv(above(k, x))}$.`, 2, q2019),
      ],
      sources: [q2019],
    }),
  );
}

// 0007 — a unit to convert first (hours to minutes)
{
  const k = "desk";
  const x = NORM[k].x;
  const z = N[k].z(x);
  const q = practice("0007", {
    k, x, tail: "above", marks: 4, difficulty: 3,
    setting: "Times to assemble a flat-pack desk",
    emphasis: ["matching units", "right-hand tail"],
    stemLead: `The times people take to assemble a flat-pack desk are normally distributed with mean ${NORM[k].mean} minutes and standard deviation ${NORM[k].sd} minutes.`,
    ask: "Find the probability that a person chosen at random takes more than 2 hours to assemble one.",
    hints: ["Put 2 hours into minutes first: the mean and the standard deviation are in minutes.", "Then standardise and shade to the right."],
    commonErrors: [ce(W("0007"), MN.notSubtracted, `${T(z)} is $\\Phi(${zs(z)})$, the proportion who finish within 2 hours. More than 2 hours is the right-hand tail: $1 - ${T(z)} = ${pv(above(k, x))}$.`, 2, q2019)],
    sources: [q2019],
  });
  q.parts[0].workedSolution = `2 hours = ${n(x)} minutes.\n${q.parts[0].workedSolution}`;
  questions.push(q);
}

// 0008 — standardising to compare two results
{
  const fr = NORM.french;
  const hi = NORM.history;
  const zf = N.french.z(fr.x);
  const zh = N.history.z(hi.x);
  if (!(zf > zh && hi.x > fr.x)) throw new Error("0008 needs the lower raw mark to have the higher z");
  questions.push(
    qq("0008", {
      style: "practice",
      difficulty: 3,
      ao: ["AO2", "AO3"],
      commandWords: ["Calculate", "State"],
      emphasis: ["standardising to compare", "z as a distance in standard deviations"],
      context: { setting: "Comparing a French mark and a History mark", original: true },
      parts: [
        {
          id: "a",
          stem: `Ciarán scored ${fr.x} in a French test and ${hi.x} in a History test. The French marks had mean ${fr.mean} and standard deviation ${fr.sd}; the History marks had mean ${hi.mean} and standard deviation ${hi.sd}.\nCalculate the z-score of his French mark.`,
          marks: 1,
          answer: zSpec(zf),
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$z = \\frac{${fr.x} - ${fr.mean}}{${fr.sd}} = ${zs(zf)}$` }],
          hints: ["Subtract the French mean, then divide by the French standard deviation."],
          workedSolution: `$z = \\frac{${fr.x} - ${fr.mean}}{${fr.sd}} = ${zs(zf)}$`,
          commonErrors: [ce(W("0008", "a"), MN.zFormula, `${fr.x - fr.mean} is how many marks above the mean he is. Dividing by the standard deviation turns that into standard deviations: $\\frac{${fr.x - fr.mean}}{${fr.sd}} = ${zs(zf)}$.`, 0, q2022, { exact: true })],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: "Calculate the z-score of his History mark.",
          marks: 1,
          answer: zSpec(zh),
          scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$z = \\frac{${hi.x} - ${hi.mean}}{${hi.sd}} = ${zs(zh)}$` }],
          hints: ["Use the History mean and standard deviation."],
          workedSolution: `$z = \\frac{${hi.x} - ${hi.mean}}{${hi.sd}} = ${zs(zh)}$`,
          commonErrors: [ce(W("0008", "b"), MN.zFormula, `${hi.x - hi.mean} is the distance above the mean in marks. Divide by the standard deviation, ${hi.sd}: $z = ${zs(zh)}$.`, 0, q2022, { exact: true })],
          requiresWorking: false,
        },
        {
          id: "c",
          stem: "In which subject did Ciarán do better compared with the others who sat the test?",
          marks: 1,
          answer: {
            kind: "mcq",
            shuffle: false,
            options: [
              { id: "a", text: `French, because its z-score is higher`, correct: true, feedback: `Yes: ${zs(zf)} standard deviations above the mean beats ${zs(zh)}, even though the raw mark is lower.` },
              { id: "b", text: `History, because ${hi.x} is higher than ${fr.x}`, correct: false, feedback: `The raw marks come from different tests with different means and spreads, so they cannot be compared directly. The z-scores can: French ${zs(zf)}, History ${zs(zh)}.` },
              { id: "c", text: "Neither: the two results are equally good", correct: false, feedback: `The z-scores differ: ${zs(zf)} for French and ${zs(zh)} for History, so French is the stronger result.` },
            ],
          },
          scheme: [{ id: "W1", code: "W", marks: 1, for: "French, with the two z-scores compared" }],
          hints: ["Compare the z-scores, not the raw marks."],
          workedSolution: `French: $z = ${zs(zf)}$. History: $z = ${zs(zh)}$. ${zs(zf)} > ${zs(zh)}, so the French mark is further above its mean, measured in standard deviations: French is the better result.`,
          commonErrors: [],
          requiresWorking: false,
        },
      ],
      totalMarks: 3,
      timeAllowanceSec: timeFor(3),
      skeleton: "(a)calculate1|(b)calculate1|(c)state1",
      examinerSources: [q2022],
      solutionProgram: `a: (${fr.x} - ${fr.mean}) / ${fr.sd} = ${zs(zf)}; b: (${hi.x} - ${hi.mean}) / ${hi.sd} = ${zs(zh)}`,
    }),
  );
}

// 0009 — 'does not': the complement is in the wording, not the arithmetic
{
  const k = "parcel";
  const x = NORM[k].x;
  const z = N[k].z(x);
  questions.push(
    practice("0009", {
      k, x, tail: "below", marks: 3, difficulty: 3,
      setting: "Parcels that cost extra to post",
      emphasis: ["reading 'does not'", "left-hand tail"],
      stemLead: `A shop's parcels have masses that are normally distributed with mean ${n(NORM[k].mean)} kg and standard deviation ${n(NORM[k].sd)} kg. A parcel heavier than ${n(x)} kg costs extra to post.`,
      ask: "Find the probability that a parcel chosen at random does not cost extra to post.",
      hints: ["Not costing extra means a mass of at most 2.12 kg.", "That is a left-hand region: read the table."],
      commonErrors: [
        ce(W("0009"), MN.wrongTail, `That is the probability that a parcel DOES cost extra, the tail above ${n(x)} kg. Not costing extra is everything below it: $\\Phi(${zs(z)}) = ${T(z)}$.`, 2, q2025),
      ],
      sources: [q2025],
    }),
  );
}

// 0010 — exam-style, two parts on one context (8 marks)
{
  const k = "cans";
  const c = NORM[k];
  const za = N[k].z(c.xa);
  const zb = N[k].z(c.xb);
  const sa = fourMark(k, c.xa, "above");
  const sb = fourMark(k, c.xb, "below");
  questions.push(
    qq("0010", {
      style: "exam-style",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Find"],
      emphasis: ["standardising", "right-hand tail", "negative z"],
      context: { setting: "Volumes of drink in cans from a filling machine", original: true },
      parts: [
        {
          id: "a",
          stem: `The volumes of drink in cans filled by a machine are normally distributed with mean ${c.mean} ml and standard deviation ${n(c.sd)} ml.\nFind the probability that a can chosen at random contains more than ${n(c.xa)} ml.\n${FOUR_DP}`,
          marks: 4,
          answer: prob4(above(k, c.xa)),
          scheme: sa,
          hints: ["Standardise, then sketch.", "Shaded to the right: take the table value from 1."],
          workedSolution: `$${zLine(k, c.xa)}$\nSketch: shaded to the right of $z = ${zs(za)}$.\n$P(V > ${n(c.xa)}) = 1 - \\Phi(${zs(za)}) = 1 - ${T(za)} = ${pv(above(k, c.xa))}$`,
          commonErrors: [
            ce(W("0010", "a"), MN.notSubtracted, `$z = ${zs(za)}$ is right, but ${T(za)} is the area to its LEFT, the cans with less than ${n(c.xa)} ml. Take it from 1: ${pv(above(k, c.xa))}.`, 2, q2019),
            ce(W("0010", "a"), MN.zFormula, `That z-value divides by the mean. With $z = \\frac{${n(c.xa)} - ${c.mean}}{${n(c.sd)}} = ${zs(za)}$ the answer is $1 - ${T(za)} = ${pv(above(k, c.xa))}$.`, 1, q2024),
          ],
          requiresWorking: true,
        },
        {
          id: "b",
          stem: `Find the probability that a can chosen at random contains less than ${n(c.xb)} ml.\n${FOUR_DP}`,
          marks: 4,
          answer: prob4(below(k, c.xb)),
          scheme: sb,
          hints: ["This z-value is negative.", "Fold: the tail below −0.9 has the same area as the tail above 0.9."],
          workedSolution: `$${zLine(k, c.xb)}$\nSketch: the left tail below $z = ${zs(zb)}$ is shaded.\n$P(V < ${n(c.xb)}) = 1 - \\Phi(${zs(-zb)}) = 1 - ${T(zb)} = ${pv(below(k, c.xb))}$`,
          commonErrors: [
            ce(W("0010", "b"), MN.negative, `${T(zb)} is the area to the left of $+${zs(-zb)}$, most of the curve. The tail below $${zs(zb)}$ is the mirror image of the tail above $+${zs(-zb)}$: $1 - ${T(zb)} = ${pv(below(k, c.xb))}$.`, 2, q2023),
          ],
          requiresWorking: true,
        },
      ],
      totalMarks: 8,
      timeAllowanceSec: timeFor(8),
      skeleton: "(a)find4|(b)find4",
      examinerSources: [q2019, q2023, q2024],
      solutionProgram: `a: z = (${n(c.xa)} - ${c.mean}) / ${n(c.sd)} = ${zs(za)}; 1 - ${T(za)} = ${pv(above(k, c.xa))}; b: z = (${n(c.xb)} - ${c.mean}) / ${n(c.sd)} = ${zs(zb)}; 1 - ${T(zb)} = ${pv(below(k, c.xb))}`,
    }),
  );
}

// 0011 — exam-style: z first, then two probabilities (7 marks)
{
  const k = "parkrun";
  const c = NORM[k];
  const za = N[k].z(c.xa);
  const zc = N[k].z(c.xc);
  questions.push(
    qq("0011", {
      style: "exam-style",
      difficulty: 4,
      ao: ["AO1", "AO2"],
      commandWords: ["Calculate", "Find"],
      emphasis: ["the z-value", "negative z both ways"],
      context: { setting: "Finishing times in a weekly 5 km park run", original: true },
      parts: [
        {
          id: "a",
          stem: `The finishing times in a weekly 5 km park run are normally distributed with mean ${n(c.mean)} minutes and standard deviation ${n(c.sd)} minutes.\nCalculate the z-value for a finishing time of ${n(c.xa)} minutes.`,
          marks: 2,
          answer: zSpec(za),
          scheme: zMarks(k, c.xa),
          hints: ["Subtract the mean from the time, then divide by the standard deviation.", "The time is below the mean, so z is negative."],
          workedSolution: `$${zLine(k, c.xa)}$`,
          commonErrors: [
            ce(W("0011", "a"), MN.zFormula, `That is the time minus the mean, in minutes. Divide by the standard deviation to count it in standard deviations: $\\frac{${n(c.xa)} - ${n(c.mean)}}{${n(c.sd)}} = ${zs(za)}$.`, 1, q2022, { nth: 0, exact: true }),
            ce(W("0011", "a"), MN.zFormula, `The size is right but the sign is lost: the formula subtracts the mean FROM the value, $${n(c.xa)} - ${n(c.mean)}$, which is negative because ${n(c.xa)} minutes is below the mean. $z = ${zs(za)}$.`, 1, q2022, { nth: 1, exact: true }),
          ],
          requiresWorking: true,
        },
        {
          id: "b",
          stem: `Find the probability that a runner chosen at random finishes in less than ${n(c.xa)} minutes.\n${FOUR_DP}`,
          marks: 2,
          answer: prob4(below(k, c.xa)),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `$1 - \\Phi(${zs(-za)})$, using their z-value`, ft: true, accept: [`1 - ${T(za)}`] },
            { id: "W1", code: "W", marks: 1, for: pv(below(k, c.xa)), dependsOn: ["M1"] },
          ],
          hints: ["Use your z-value from part (a).", "A left tail below a negative z: fold it onto the right-hand side."],
          workedSolution: `$P(T < ${n(c.xa)}) = P(Z < ${zs(za)}) = 1 - \\Phi(${zs(-za)}) = 1 - ${T(za)} = ${pv(below(k, c.xa))}$`,
          commonErrors: [ce(W("0011", "b"), MN.negative, `${T(za)} is the area to the left of $+${zs(-za)}$. The fast finishers below $${zs(za)}$ are the mirror image of the tail above $+${zs(-za)}$: $1 - ${T(za)} = ${pv(below(k, c.xa))}$.`, 0, q2022)],
          requiresWorking: true,
          followThrough: { fromPart: "a", rule: "use-candidate-value" },
        },
        {
          id: "c",
          stem: `Find the probability that a runner chosen at random takes more than ${n(c.xc)} minutes.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(above(k, c.xc)),
          scheme: threeMark(k, c.xc, "above"),
          hints: ["22.95 minutes is well below the mean.", "More than half the curve is shaded, so the answer is more than 0.5."],
          workedSolution: `$${zLine(k, c.xc)}$\nSketch: everything above $z = ${zs(zc)}$ is shaded, more than half of the curve.\n$P(T > ${n(c.xc)}) = \\Phi(${zs(-zc)}) = ${T(zc)}$`,
          commonErrors: [ce(W("0011", "c"), MN.wrongTail, `That is under a half, but almost every runner takes longer than ${n(c.xc)} minutes. By symmetry the area above $${zs(zc)}$ is $\\Phi(${zs(-zc)}) = ${T(zc)}$, with nothing taken from 1.`, 2, q2024)],
          requiresWorking: true,
        },
      ],
      totalMarks: 7,
      timeAllowanceSec: timeFor(7),
      skeleton: "(a)calculate2|(b)find2|(c)find3",
      examinerSources: [q2022, q2024],
      solutionProgram: `a: (${n(c.xa)} - ${n(c.mean)}) / ${n(c.sd)} = ${zs(za)}; b: 1 - ${T(za)} = ${pv(below(k, c.xa))}; c: z = (${n(c.xc)} - ${n(c.mean)}) / ${n(c.sd)} = ${zs(zc)}; ${T(zc)}`,
    }),
  );
}

// 0012 — depth pass (23 Sep): the top rung and the neighbouring topic. The 2022 and 2023 shape at
// the paper's own length (3 + 4 + 2): below a value above the mean, below a value below it, then
// the first given the second, where one event sits inside the other.
{
  const k = "cucumbers";
  const c = NORM[k];
  const za = N[k].z(c.xa);
  const zb = N[k].z(c.xb);
  if (!(za > 0 && zb < 0)) throw new Error("0012 needs one value above the mean and one below");
  const pa = below(k, c.xa);
  const pb = below(k, c.xb);
  const pc = ratDiv(pb, pa);
  questions.push(
    qq("0012", {
      style: "practice",
      difficulty: 4,
      ao: ["AO1", "AO2", "AO3"],
      commandWords: ["Find"],
      emphasis: ["standardising", "negative z", "given that", "one event inside the other"],
      context: { setting: "Lengths of cucumbers grown in a greenhouse", original: true },
      parts: [
        {
          id: "a",
          stem: `The lengths of cucumbers grown in a greenhouse are normally distributed with mean ${n(c.mean)} cm and standard deviation ${n(c.sd)} cm.\nFind the probability that a cucumber chosen at random is shorter than ${n(c.xa)} cm.\n${FOUR_DP}`,
          marks: 3,
          answer: prob4(pa),
          scheme: threeMark(k, c.xa, "below"),
          hints: [`Standardise ${n(c.xa)}.`, "Shorter than means the region to the left, which the table gives directly."],
          workedSolution: `$${zLine(k, c.xa)}$\nShaded to the left of a positive z, so read the table:\n$P(L < ${n(c.xa)}) = \\Phi(${zs(za)}) = ${T(za)}$`,
          commonErrors: [
            ce(W("0012", "a"), MN.wrongTail, `That is the area to the right of $z = ${zs(za)}$. Shorter than ${n(c.xa)} cm is the region to the left, which is the table value itself: ${pv(pa)}.`, 2, q2023),
            ce(W("0012", "a"), MN.zFormula, `The mean and the standard deviation have changed places in the formula. Subtract the mean, ${n(c.mean)}, then divide by the standard deviation, ${n(c.sd)}: $z = ${zs(za)}$, and $\\Phi(${zs(za)}) = ${T(za)}$.`, 0, q2022),
          ],
          requiresWorking: true,
        },
        {
          id: "b",
          stem: `Find the probability that a cucumber chosen at random is shorter than ${n(c.xb)} cm.\n${FOUR_DP}`,
          marks: 4,
          answer: prob4(pb),
          scheme: fourMark(k, c.xb, "below"),
          hints: [`${n(c.xb)} cm is below the mean, so z is negative.`, "Fold the curve: the tail below the negative z matches the tail above the positive one."],
          workedSolution: `$${zLine(k, c.xb)}$\nThe tail below $${zs(zb)}$ matches the tail above $${zs(-zb)}$:\n$P(L < ${n(c.xb)}) = 1 - \\Phi(${zs(-zb)}) = 1 - ${T(zb)} = ${pv(pb)}$`,
          commonErrors: [
            ce(W("0012", "b"), MN.negative, `${T(zb)} is the area to the left of $+${zs(-zb)}$, most of the curve. The short cucumbers are the thin tail below $${zs(zb)}$, its mirror image: $1 - ${T(zb)} = ${pv(pb)}$.`, 2, q2023),
            ce(W("0012", "b"), MN.zFormula, `The mean and the standard deviation have changed places in the formula. Subtract the mean, then divide by the standard deviation: $z = ${zs(zb)}$, and the tail below it is $1 - ${T(zb)} = ${pv(pb)}$.`, 0, q2022),
          ],
          requiresWorking: true,
        },
        {
          id: "c",
          stem: `Find the probability that a cucumber chosen at random is shorter than ${n(c.xb)} cm, given that it is shorter than ${n(c.xa)} cm.\n${FOUR_DP}`,
          marks: 2,
          answer: prob4(pc),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `$\\frac{${pv(pb)}}{${pv(pa)}}$: their (b) over their (a)`, ft: true, accept: [`${pv(pb)}/${pv(pa)}`] },
            { id: "W1", code: "W", marks: 1, for: pv(pc), dependsOn: ["M1"] },
          ],
          hints: [`Every cucumber shorter than ${n(c.xb)} cm is also shorter than ${n(c.xa)} cm.`, "So the probability of both is part (b) alone: divide it by part (a)."],
          workedSolution: `Shorter than ${n(c.xb)} cm lies inside shorter than ${n(c.xa)} cm, so the probability of both is part (b).\n$P(L < ${n(c.xb)} \\mid L < ${n(c.xa)}) = \\frac{${pv(pb)}}{${pv(pa)}} = ${shown(pc)}$\n$= ${pv(pc)}$ to 4 decimal places`,
          commonErrors: [
            ce(W("0012", "c"), MC.subset, `Multiplying ${pv(pb)} by ${pv(pa)} on the top and then dividing by ${pv(pa)} gives part (b) back. Every cucumber shorter than ${n(c.xb)} cm is already shorter than ${n(c.xa)} cm, so the top is ${pv(pb)} alone: $\\frac{${pv(pb)}}{${pv(pa)}} = ${pv(pc)}$.`, 0, q2023),
            ce(W("0012", "c"), MC.independent, `That is ${pv(pb)} times ${pv(pa)}, which treats the two lengths as independent events, and it never divides. Being shorter than ${n(c.xb)} cm already means being shorter than ${n(c.xa)} cm: divide, $\\frac{${pv(pb)}}{${pv(pa)}} = ${pv(pc)}$.`, 0, q2022),
          ],
          requiresWorking: true,
          followThrough: { fromPart: "b", rule: "use-candidate-value" },
        },
      ],
      totalMarks: 9,
      timeAllowanceSec: timeFor(9),
      skeleton: "(a)find3|(b)find4|(c)find2",
      examinerSources: [q2023, q2022],
      solutionProgram: `a: z = (${n(c.xa)} - ${n(c.mean)}) / ${n(c.sd)} = ${zs(za)}; ${T(za)}; b: z = (${n(c.xb)} - ${n(c.mean)}) / ${n(c.sd)} = ${zs(zb)}; 1 - ${T(zb)} = ${pv(pb)}; c: ${pv(pb)} / ${pv(pa)} = ${bFixed(pc, 10)}`,
    }),
  );
}

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

const CH = NORM.chocolate;
const zch = N.chocolate.z(CH.x);
const we1 = {
  id: `we.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `The masses of a brand of chocolate bar are normally distributed with mean ${CH.mean} g and standard deviation ${n(CH.sd)} g. Find the probability that a bar chosen at random weighs more than ${n(CH.x)} g.\n${FOUR_DP}`,
  figure: figure(
    nTail({ mean: CH.mean, x: CH.x, z: zch, unit: CH.unit, tail: "right", statement: `P(M > ${n(CH.x)})`, showZ: false, title: `A normal curve with the mean ${CH.mean} g marked and the region above ${n(CH.x)} g shaded` }),
    `A normal curve with the mean ${CH.mean} g under the peak and ${n(CH.x)} g marked to its right; the region above ${n(CH.x)} g is shaded.`,
  ),
  steps: [
    {
      n: 1,
      working: `$${zLine("chocolate", CH.x)}$`,
      decision: "Standardise first: the table works in z, not in grams. Subtract the mean, then divide by the standard deviation.",
      earns: ["M1", "W1"],
      input: zSpec(zch),
    },
    {
      n: 2,
      working: `Sketch: ${n(CH.x)} g is above the mean, so the region to the right of $z = ${zs(zch)}$ is shaded.`,
      decision: "Shade before reading the table. The table gives the area to the left, and this region is on the right, so the answer will be 1 minus the table value.",
      whyMenu: {
        options: [
          `The question asks for bars heavier than ${n(CH.x)} g, and those lie to the right`,
          "The z-value is positive, so the answer is always 1 minus the table value",
          "The table gives right-hand areas",
        ],
        correct: 0,
        explain: `The wording decides the side. A positive z alone does not: $P(M < ${n(CH.x)})$ has the same z-value and is shaded to the left, read straight from the table.`,
      },
      earns: ["M2"],
    },
    {
      n: 3,
      working: `$P(M > ${n(CH.x)}) = 1 - \\Phi(${zs(zch)}) = 1 - ${T(zch)} = ${pv(N.chocolate.above(CH.x))}$`,
      decision: `Read row 1.4, column .05, and take it from 1. A quick check: a tail beyond $z = ${zs(zch)}$ should sit between 2.3% (beyond 2) and 16% (beyond 1), and ${pv(N.chocolate.above(CH.x))} does.`,
      earns: ["W2"],
      input: prob4(N.chocolate.above(CH.x)),
    },
  ],
  finalAnswer: `$P(M > ${n(CH.x)}) = ${pv(N.chocolate.above(CH.x))}$`,
  twin: {
    stem: `A cyclist's times to ride to college are normally distributed with mean ${NORM.cyclists.mean} minutes and standard deviation ${NORM.cyclists.sd} minutes. Find the probability that a ride takes more than ${n(NORM.cyclists.x)} minutes.\n${FOUR_DP}`,
    answer: prob4(N.cyclists.above(NORM.cyclists.x)),
  },
  faded: [
    { showSteps: 1, studentSupplies: [2, 3] },
    { showSteps: 0, studentSupplies: [1, 2, 3] },
  ],
  verification: `ver.we.${TOPIC}.01`,
  version: 1,
};

const WA = NORM.washers;
const zwa = N.washers.z(WA.x);
const we2 = {
  id: `we.${TOPIC}.02`,
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `The diameters of washers from a machine are normally distributed with mean ${n(WA.mean)} mm and standard deviation ${n(WA.sd)} mm. Find the probability that a washer chosen at random has a diameter of less than ${n(WA.x)} mm.\n${FOUR_DP}`,
  steps: [
    {
      n: 1,
      working: `$${zLine("washers", WA.x)}$`,
      decision: `${n(WA.x)} mm is below the mean, so z comes out negative: the washer is ${zs(-zwa)} standard deviations under the mean.`,
      earns: ["M1", "W1"],
      input: zSpec(zwa),
    },
    {
      n: 2,
      working: `Sketch: the left tail below $z = ${zs(zwa)}$ is shaded. By symmetry it matches the right tail above $z = ${zs(-zwa)}$.`,
      decision: "The table has no negative rows. Fold the curve at the mean: the tail below the negative value lands on the tail above the positive one.",
      whyMenu: {
        options: [`The left tail below ${zs(zwa)} has the same area as the right tail above ${zs(-zwa)}`, `The table has a row for ${zs(zwa)}`, "A negative z-value means the probability is negative"],
        correct: 0,
        explain: "The curve is symmetric about its mean, so mirror-image tails have equal areas. The table stops at z = 0, and no probability is ever negative.",
      },
      earns: ["M2"],
    },
    {
      n: 3,
      working: `$P(D < ${n(WA.x)}) = 1 - \\Phi(${zs(-zwa)}) = 1 - ${T(zwa)} = ${pv(N.washers.below(WA.x))}$`,
      decision: `The rough check agrees: a tail beyond two standard deviations holds about 2.3%, and this one starts ${zs(-zwa)} standard deviations out, so it should hold a little less. ${pv(N.washers.below(WA.x))} is ${(Number(pv(N.washers.below(WA.x))) * 100).toFixed(2)}%.`,
      earns: ["W2"],
      input: prob4(N.washers.below(WA.x)),
    },
  ],
  finalAnswer: `$P(D < ${n(WA.x)}) = ${pv(N.washers.below(WA.x))}$`,
  twin: {
    stem: `Bags of sand have masses that are normally distributed with mean ${n(NORM.sand.mean)} kg and standard deviation ${n(NORM.sand.sd)} kg. Find the probability that a bag chosen at random weighs less than ${n(NORM.sand.x)} kg.\n${FOUR_DP}`,
    answer: prob4(N.sand.below(NORM.sand.x)),
  },
  faded: [
    { showSteps: 1, studentSupplies: [2, 3] },
    { showSteps: 0, studentSupplies: [1, 2, 3] },
  ],
  verification: `ver.we.${TOPIC}.02`,
  version: 1,
};
if (!(zwa < -2 && zwa > -2.6)) throw new Error("WE2's rough-check sentence assumes z a little below -2");

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
      stem: "Before the lesson, a check on earlier work. A set of heights has mean 160 cm and standard deviation 8 cm. Which height is exactly one standard deviation above the mean?",
      skill: "What a standard deviation measures (from the lesson on mean and standard deviation)",
      options: [
        { id: "a", text: "168 cm", correct: true, feedback: "Yes: one standard deviation above the mean is $160 + 8$. A z-score counts steps like this one." },
        { id: "b", text: "161 cm", correct: false, feedback: "That is one centimetre above the mean. One standard deviation is 8 cm, so the height is 168 cm." },
        { id: "c", text: "152 cm", correct: false, feedback: "That is one standard deviation below the mean. Above means add: 168 cm." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "Another check, from the lesson on the bell curve. About what percentage of a normal distribution lies within one standard deviation of the mean?",
      skill: "The 68% of the 68-95 rule (from the lesson on the bell curve)",
      options: [
        { id: "a", text: "68%", correct: true, feedback: "Yes. So about 32% lies outside, split equally: about 16% in each tail. That makes a quick check on table answers." },
        { id: "b", text: "95%", correct: false, feedback: "95% is the figure for two standard deviations. Within one it is about 68%." },
        { id: "c", text: "50%", correct: false, feedback: "Half the curve lies on each side of the mean, but within one standard deviation either side is about 68%." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p3",
      stem: `One more check on earlier work. If $P(A) = ${T(1.3)}$, what is the probability that $A$ does not happen?`,
      skill: "The complement of an event (from GCSE Mathematics)",
      options: [
        { id: "a", text: pv(bSub(ONE, Z.table(1.3).r)), correct: true, feedback: `Yes: $1 - ${T(1.3)}$. Every right-hand tail in this topic is found this way.` },
        { id: "b", text: T(1.3), correct: false, feedback: `That is the probability that A happens. What is left of 1 is $1 - ${T(1.3)}$.` },
        { id: "c", text: e(bAddOne(Z.table(1.3).r)), correct: false, feedback: `A probability cannot be more than 1. Subtract ${T(1.3)} from 1 instead of adding it.` },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

function bAddOne(x) {
  return big(x.n + x.d, x.d);
}

const D1 = NDXD.d1;
const d1z = (D1.x - D1.mean) / D1.sd;
const post = {
  id: `dx.${TOPIC}.post`,
  topic: TOPIC,
  specRefs: SPEC,
  when: "post",
  items: [
    {
      id: "d1",
      stem: `$X$ is normally distributed with mean ${D1.mean} and standard deviation ${D1.sd}. What is the z-score of $x = ${D1.x}$?`,
      skill: "Standardising with z = (x − μ)/σ",
      options: [
        { id: "a", text: String(d1z), correct: true, feedback: `Yes: $\\frac{${D1.x} - ${D1.mean}}{${D1.sd}} = ${d1z}$, two standard deviations above the mean.` },
        { id: "b", text: e(route(`dx.${TOPIC}.post#d1:b`, MN.zFormula)), correct: false, misconception: MN.zFormula, feedback: `That is $${D1.x} - ${D1.mean}$, the distance in units. Divide by the standard deviation to count it in standard deviations: ${d1z}.` },
        { id: "c", text: e(route(`dx.${TOPIC}.post#d1:c`, MN.zFormula)), correct: false, misconception: MN.zFormula, feedback: `That divides by the variance, ${D1.sd * D1.sd}. The z formula divides by the standard deviation, ${D1.sd}: ${d1z}.` },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: "Which area does $\\Phi(z)$ in the Normal Probability Table give?",
      skill: "What the table gives",
      options: [
        { id: "a", text: "The area to the left of z", correct: true, feedback: "Yes: $\\Phi(z) = P(Z < z)$. Every other area is worked out from it." },
        { id: "b", text: "The area to the right of z", correct: false, misconception: MN.notSubtracted, feedback: "The table gives the left-hand area. Reading it as the right-hand area is how 1 minus gets missed." },
        { id: "c", text: "The area to the left of −z", correct: false, misconception: MN.negative, feedback: "The table has no negative rows: $\\Phi(z)$ is the area to the left of the positive value z. The area left of −z is $1 - \\Phi(z)$." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: `$\\Phi(${zs(-NDXD.d3.z)}) = ${T(NDXD.d3.z)}$. What is $P(Z < ${zs(NDXD.d3.z)})$?`,
      skill: "A left tail below a negative z",
      options: [
        { id: "a", text: pv(tailAt(NDXD.d3.z, "below")), correct: true, feedback: `Yes: by symmetry $P(Z < ${zs(NDXD.d3.z)}) = 1 - \\Phi(${zs(-NDXD.d3.z)}) = ${pv(tailAt(NDXD.d3.z, "below"))}$.` },
        { id: "b", text: e(route(`dx.${TOPIC}.post#d3:b`, MN.negative)), correct: false, misconception: MN.negative, feedback: `That is $\\Phi(${zs(-NDXD.d3.z)})$, the area to the left of $+${zs(-NDXD.d3.z)}$. The tail below $${zs(NDXD.d3.z)}$ is its mirror image, $1 - ${T(NDXD.d3.z)}$.` },
        { id: "c", text: e(route(`dx.${TOPIC}.post#d3:c`, MN.zRounded)), correct: false, misconception: MN.zRounded, feedback: `That uses $z = -1.0$. Keep both decimal places: $1 - \\Phi(${zs(-NDXD.d3.z)}) = ${pv(tailAt(NDXD.d3.z, "below"))}$.` },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: "$X$ is normally distributed with mean 50 and standard deviation 10. Which expression gives $P(X > 63)$?",
      skill: "A right-hand tail above a positive z",
      options: [
        { id: "a", text: "$1 - \\Phi(1.3)$", correct: true, feedback: "Yes: $z = \\frac{63 - 50}{10} = 1.3$, shaded to the right, so 1 minus the table value." },
        { id: "b", text: "$\\Phi(1.3)$", correct: false, misconception: MN.notSubtracted, feedback: "That is the area to the left of 63. Above 63 is the right-hand tail: $1 - \\Phi(1.3)$." },
        { id: "c", text: "$1 - \\Phi(1.06)$", correct: false, misconception: MN.zFormula, feedback: "1.06 comes from $\\frac{63 - 10}{50}$, the mean and standard deviation swapped. $z = \\frac{63 - 50}{10} = 1.3$." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d5",
      stem: "$X$ is normally distributed with mean 50 and standard deviation 10. Which expression gives $P(X > 41)$?",
      skill: "A right-hand tail above a negative z",
      options: [
        { id: "a", text: "$\\Phi(0.9)$", correct: true, feedback: "Yes: $z = -0.9$, and the area above it is the mirror image of the area below $+0.9$, which the table gives directly." },
        { id: "b", text: "$1 - \\Phi(0.9)$", correct: false, misconception: MN.wrongTail, feedback: "That is under a half, but 41 is below the mean, so more than half the curve lies above it. The answer is $\\Phi(0.9)$ itself." },
        { id: "c", text: "$1 - \\Phi(0.62)$", correct: false, misconception: MN.zFormula, feedback: "0.62 comes from $\\frac{41 - 10}{50}$, the mean and standard deviation swapped. $z = \\frac{41 - 50}{10} = -0.9$." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};
// The d4 and d5 expressions are built on the stated numbers: check them.
if (Math.round(((63 - 50) / 10) * 100) / 100 !== 1.3 || Math.round(((63 - 10) / 50) * 100) / 100 !== 1.06) throw new Error("d4 expressions are stale");
if (Math.round(((41 - 50) / 10) * 100) / 100 !== -0.9 || Math.round(((41 - 10) / 50) * 100) / 100 !== 0.62) throw new Error("d5 expressions are stale");

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

const LA = NORM.lambs;
const zla = N.lambs.z(LA.x);
const ftm1 = {
  id: `ftm.${TOPIC}.01`,
  topic: TOPIC,
  specRefs: SPEC,
  stem: `The birth masses of lambs on a farm are normally distributed with mean ${n(LA.mean)} kg and standard deviation ${n(LA.sd)} kg. Niamh was asked for the probability that a lamb weighs less than ${n(LA.x)} kg at birth. Her working:`,
  studentWorking: [`z = (${n(LA.x)} − ${n(LA.mean)}) / ${n(LA.sd)} = ${zs(zla).replace("-", "−")}`, `Φ(${zs(-zla)}) = ${T(zla)}`, `P(M < ${n(LA.x)}) = ${pv(route("normal-ftm1", MN.negative))}`],
  mistakeLine: 3,
  misconception: MN.negative,
  whatWentWrong: `Line 3 gives the table value as the answer. $\\Phi(${zs(-zla)})$ is the area to the left of $+${zs(-zla)}$, but the lambs lighter than ${n(LA.x)} kg are the tail below $${zs(zla)}$, its mirror image. That tail is $1 - \\Phi(${zs(-zla)})$.`,
  correction: [`z = (${n(LA.x)} − ${n(LA.mean)}) / ${n(LA.sd)} = ${zs(zla).replace("-", "−")}`, `Φ(${zs(-zla)}) = ${T(zla)}`, `P(M < ${n(LA.x)}) = 1 − ${T(zla)} = ${pv(N.lambs.below(LA.x))}`],
  marksEarnedAsWritten: ["M1", "W1"],
  feedback: `Her z-value is right and so is the table reading, so the first two marks are hers. The marks go at line 3. A sketch would have stopped it: ${n(LA.x)} kg is below the mean, so the shaded tail is a thin sliver, and ${T(zla)} would mean most lambs are that light.`,
  source: q2023,
};

const PE = NORM.pencils;
const zpe = N.pencils.z(PE.x);
const ftm2 = {
  id: `ftm.${TOPIC}.02`,
  topic: TOPIC,
  specRefs: SPEC,
  stem: `The lengths of pencils from a factory are normally distributed with mean ${n(PE.mean)} cm and standard deviation ${n(PE.sd)} cm. Rory was asked for the probability that a pencil is longer than ${n(PE.x)} cm. His working:`,
  studentWorking: [`z = (${n(PE.x)} − ${n(PE.mean)}) / ${n(PE.sd)} = ${zs(zpe).replace("-", "−")}`, `Φ(${zs(-zpe)}) = ${T(zpe)}`, `P(L > ${n(PE.x)}) = 1 − ${T(zpe)} = ${pv(route("normal-ftm2", MN.wrongTail))}`],
  mistakeLine: 3,
  misconception: MN.wrongTail,
  whatWentWrong: `Line 3 subtracts from 1 when nothing needed subtracting. ${n(PE.x)} cm is below the mean, so the region above it is more than half of the curve, and by symmetry its area is $\\Phi(${zs(-zpe)})$ itself.`,
  correction: [`z = (${n(PE.x)} − ${n(PE.mean)}) / ${n(PE.sd)} = ${zs(zpe).replace("-", "−")}`, `Φ(${zs(-zpe)}) = ${T(zpe)}`, `P(L > ${n(PE.x)}) = Φ(${zs(-zpe)}) = ${T(zpe)}`],
  marksEarnedAsWritten: ["M1", "W1"],
  feedback: `The z-value and the table reading earn their marks. The last step is the one examiners see most often in this position: a small answer where the sketch shows most of the curve shaded. Almost all the pencils are longer than ${n(PE.x)} cm, so the answer is ${T(zpe)}.`,
  source: q2024,
};

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const RP = (k) => `rp.${TOPIC}.${k}`;
const prompts = [
  { id: RP("01"), kind: "formula", prompt: "The formula that turns a value x into a z-score, and what its letters mean.", answer: "z = (x − μ)/σ, where μ is the mean and σ the standard deviation. It is not on the formula sheet.", keyWords: ["mean", "standard deviation", "not on the formula sheet"], difficultyPrior: 2 },
  { id: RP("02"), kind: "definition", prompt: "What does Φ(z) in the Normal Probability Table give?", answer: "The area under the standard normal curve to the left of z, which is P(Z < z).", keyWords: ["area", "left"], difficultyPrior: 2 },
  { id: RP("03"), kind: "procedure", prompt: "How do you find P(X > x) when x is above the mean?", answer: "Find z, sketch the curve and shade to the right of x, then work out 1 − Φ(z).", keyWords: ["sketch", "right"], difficultyPrior: 3 },
  { id: RP("04"), kind: "trap", prompt: "How do you find P(X < x) when x is below the mean, so that z is negative?", answer: "By symmetry the left tail below a negative z equals the right tail above the positive value, so the answer is 1 − Φ of the positive z. Leaving Φ as the answer is the slip examiners report.", keyWords: ["symmetry", "right tail"], difficultyPrior: 4 },
  { id: RP("05"), kind: "trap", prompt: "What is P(X > x) when x is below the mean, and why must it be more than 0.5?", answer: "It is Φ of the positive z, read straight from the table; more than half the curve is shaded, so it must be more than 0.5.", keyWords: ["more than half", "table"], difficultyPrior: 4 },
  { id: RP("06"), kind: "procedure", prompt: "On a normal sketch, what goes below the axis and what goes above it?", answer: "Below the axis: the mean, the value x and their z-values. Above it: only the shaded area, which is the probability.", keyWords: ["below the axis", "above"], difficultyPrior: 3 },
  { id: RP("07"), kind: "definition", prompt: "Which normal probabilities does this specification ask for, and which does it not?", answer: "Single tails only, above or below one value, found from a z-value. Never the area between two values, and never a z-value from a probability.", keyWords: ["single tails", "between two values"], difficultyPrior: 3 },
  { id: RP("08"), kind: "trap", prompt: "How do you find the probability that X is less than a, given that X is less than b, when a is smaller than b?", answer: "Divide: P(X < a) ÷ P(X < b). Every value below a is also below b, so the top of the fraction is P(X < a) itself; multiplying the two probabilities is the slip examiners report.", keyWords: ["divide", "also below b"], difficultyPrior: 4 },
].map((p) => ({ ...p, topic: TOPIC, specRefs: SPEC, examUnit: "FM3" }));

// ---------------------------------------------------------------------------
// Sheet, note, topic
// ---------------------------------------------------------------------------

const sheet = {
  mustBeAbleTo: [
    "Standardise a value with $z = \\frac{x - \\mu}{\\sigma}$, which is not on the formula sheet, keeping z to two decimal places",
    "Read $\\Phi(z) = P(Z < z)$ from the Normal Probability Table: the row for the first decimal place, the column for the second",
    "Sketch the curve with the mean, x and their z-values under the axis and shade the region the question asks for",
    "Give $P(Z > z) = 1 - \\Phi(z)$ for a right-hand tail",
    "Use symmetry for a negative z: $P(Z < -z) = 1 - \\Phi(z)$ and $P(Z > -z) = \\Phi(z)$",
    "Put every quantity in the same unit before standardising (hours into minutes, kilograms into grams)",
    "Check an answer against the 68% and 95% proportions before writing it, and give it to 4 decimal places",
    "For 'less than a, given less than b' with a below b, divide one tail by the other: every value below a is also below b",
  ],
  howExamined:
    "Unit 3 has carried a normal-distribution question in every paper since the topic arrived: Q5 in 2019, 2023 and 2024, Q7 in 2022, Q6 in 2025, Q3 in the 2021 paper and Q5 in 2026. It is two parts of 3 or 4 marks, each a probability above or below a single value for a stated mean and standard deviation, to 4 decimal places since 2022. The scheme gives M1 W1 for the z-value, a further mark for the sketch and the 1 minus or symmetry step, and W1 for the value. The 2022 and 2023 papers then built a 2-mark conditional probability on the two answers: every value below the smaller one is also below the larger, so one tail is divided by the other.",
  traps: [
    "Summer 2019 FM3 Q5: nearly a fifth left the question blank or reached for the standard deviation formula; many found z and then did not take the table value from 1; a sketch with the mean, x and the z-values under the axis made full marks far more likely",
    "Summer 2022 FM3 Q7: a few did not know how to form z, and some dropped half the marks on a negative z they could not handle",
    "Summer 2023 FM3 Q5: for z = −1.2 the table value 0.8849 was left as the answer where 1 − 0.8849 was needed",
    "Summer 2024 FM3 Q5: the z formula misapplied, and in part (ii) the wrong area chosen, 0.0062 given for a region covering almost all of the curve",
    "Summer 2025 FM3 Q6: a few could not form z at all, some were unsure when to subtract from 1 (0.0808 appeared where 0.9192 was needed), and calculator normal functions were used with no working shown",
  ],
};

const notOnThisSpec = [
  "The area between two values, P(a < X < b): CCEA's Teacher Guidance rules it out",
  "Finding a z-value, or a value of x, from a given probability (the inverse normal)",
  "The equation of the curve, hypothesis tests, and the normal approximation to the binomial",
];
const externalRefs = [yt("0wSN38J2t18", "N.I. Maths Tutor", "Master Normal Distribution in minutes!"), CCEA_DOC];

const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "Normal probabilities: z, the table, and the 1 minus decision",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  specRefs: SPEC,
  calculator: true,
  formulaSheet: {
    given: ["The Normal Probability Table on page 3 of the booklet: Φ(z), the area to the left of z, for z from 0.00 to 3.99"],
    mustKnow: [
      "z = (x − μ)/σ: not on the formula sheet",
      "P(Z > z) = 1 − Φ(z)",
      "P(Z < −z) = 1 − Φ(z) and P(Z > −z) = Φ(z), by symmetry",
      "About 68% within one standard deviation and 95% within two, for a rough check",
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
  title: "Probabilities from the normal table using z = (x − μ)/σ",
  subject: "further-maths",
  unit: "FM3",
  tier: "untiered",
  strand: "Normal distribution",
  statementIds: SPEC,
  prerequisites: ["fm.u3.normal-distribution-bell-curve"],
  order: 12,
  hardness: "S",
  difficulty: 3,
  examinerFlagged: true,
  examinerSources: [q2019, q2022, q2023, q2024, q2025],
  examWeightHint: sheet.howExamined,
  mustMemorise: [
    "z = (x − μ)/σ (not on the formula sheet)",
    "The table gives Φ(z) = P(Z < z) for z ≥ 0; P(Z > z) = 1 − Φ(z); P(Z < −z) = 1 − Φ(z)",
    "Sketch the curve, mark μ and x below the axis, shade the required tail; only single tails are examined",
  ],
  onFormulaSheet: ["Normal Probability Table (Unit 3 booklet page 3)"],
  notOnThisSpec,
  externalRefs,
  keywords: ["z-score", "standardise", "normal table", "tail", "1 minus", "Φ(z)"],
};

const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs/further-maths/insights/u3.normal-distribution-z-probabilities.json"), "utf8"));

const sets = [
  {
    id: `set.${TOPIC}.ladder`,
    topic: TOPIC,
    kind: "interleaved",
    title: "From z to the table to the tail: short ladder",
    subject: "further-maths",
    units: ["FM3"],
    itemIds: [`dx.${TOPIC}.pre`, Q("0001"), RP("01"), Q("0002"), Q("0003"), RP("03"), Q("0004"), ftm1.id, Q("0005"), ftm2.id],
    showTopicLabels: false,
    version: 1,
  },
  {
    id: `set.${TOPIC}.mixed`,
    topic: TOPIC,
    kind: "mixed",
    title: "Left, right, above and below the mean: mixed",
    subject: "further-maths",
    units: ["FM3"],
    itemIds: [Q("0006"), Q("0007"), Q("0008"), Q("0009"), RP("04"), Q("0010"), Q("0012"), Q("0011"), `dx.${TOPIC}.post`, RP("05"), RP("08")],
    showTopicLabels: false,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const SCOPE =
  "Unit 3 (Statistics), untiered, calculator throughout; statement FM3-NOR-02 with its Teacher Guidance: single tails of the form P(Z > z) or P(Z < -z), a probability from a z-value only, and a good diagram encouraged. No area between two values, no inverse normal.";
const FS =
  "packs/further-maths/exam-true/formula-sheets.json (FM3): the Normal Probability Table is given on page 3; z = (x - mu)/sigma is must-know (mk.fm3.z-score) and is taught as such.";
const CMD = "Command words from packs/further-maths/exam-true/command-words.json: Find, Calculate, Write down, State.";
const TAR =
  "Tariffs follow the normal parts read in the Summer 2019, 2021, 2022, 2023, 2024, 2025 and 2026 papers and the 2022-2025 schemes (3 or 4 marks a part: M1 W1 for z, a mark for the sketch or the 1 minus step, W1 for the value) and packs/further-maths/exam-true/tariffs.json.";
const SHINGLE =
  "Compared against the FM3 papers, schemes and Chief Examiner reports read for this batch (Summer 2019, 2021-2026 papers; 2022-2025 schemes; 2019 and 2022-2025 reports): every context and number is new, and node scripts/qa/shingles.mjs reports no breach for this topic.";
const STYLE =
  "British English; second person; no exclamation marks; the word for an incorrect answer and the 9-1 grade label do not occur; every $...$ pair opens and closes on one line, no maths segment holds prose, every TeX command keeps its backslash.";
const NUM = (what) =>
  `${what} is emitted by scratchpad/fm3-batch-c/normal-distribution-z-probabilities.mjs: every z is (x - mean)/sd asserted exact to two decimal places, every table value is Phi from an error-function series that reproduces 0.7881, 0.8849, 0.9192, 0.9332, 0.9452, 0.9599 and 0.9938 from the schemes, and every probability is the table arithmetic as an exact rational; every distractor is its route in routes.mjs, re-executed by verify-published.mjs.`;

const verification = [
  verLog(note.id, {
    schema: "Shape validated against src/lib/content/schema.ts (NoteFrontmatter, and the note blocks against lesson template v2) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "formula-sheet": FS,
    "command-words": CMD,
    tariff: TAR,
    "maths-numeric": NUM("Every z-value, table entry and probability in the note, its gates and its seven figures"),
    "examiner-alignment": `The one examiner callout in the body carries ${q2019}; every other finding is a Sheet trap citing Summer 2019 Q5, 2022 Q7, 2023 Q5, 2024 Q5 and 2025 Q6, each read in pipeline/mine/cer-blocks/further-maths.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(we1.id, {
    schema: "Shape validated against src/lib/content/schema.ts (WorkedExample) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    tariff: "Three steps carrying M1 W1 for z, M2 for the sketch and the decision, W2 for the value: the four-mark right-tail pattern of the Summer 2025 scheme.",
    "maths-numeric": NUM(`The chocolate answer ${pv(N.chocolate.above(CH.x))} and the twin's ${pv(N.cyclists.above(NORM.cyclists.x))}`),
    "examiner-alignment": `The why-menu at step 2 exercises the subtract-from-1 decision reported in ${q2019} and ${q2025}.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(we2.id, {
    schema: "Shape validated against src/lib/content/schema.ts (WorkedExample) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    tariff: "Three steps carrying M1 W1 for the negative z, M2 for the symmetry step, W2 for the value: the four-mark negative-z pattern of the Summer 2022 and 2023 schemes.",
    "maths-numeric": NUM(`The washer answer ${pv(N.washers.below(WA.x))} and the twin's ${pv(N.sand.below(NORM.sand.x))}`),
    "examiner-alignment": `The negative z reported in ${q2022} and ${q2023}.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(pre.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": "Prerequisite items only: a standard deviation as a step, the 68% proportion from the bell-curve lesson, and the complement, each labelled as earlier work; no topic misconception tags.",
    "command-words": CMD,
    "maths-numeric": NUM("Every option value"),
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(post.id, {
    schema: "Shape validated against src/lib/content/schema.ts (DiagnosticSet) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "command-words": CMD,
    "maths-numeric": NUM("Every option value (the d1 and d3 distractors are routes in routes.mjs; the d4 and d5 expressions are asserted against their numbers)"),
    "examiner-alignment": `Every distractor carries a registry misconception reported in ${[q2019, q2022, q2023, q2024, q2025].join(", ")}.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(ftm1.id, {
    schema: "Shape validated against src/lib/content/schema.ts (FindTheMistake) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "maths-numeric": NUM(`The table value left as the answer, ${T(zla)}, and the corrected ${pv(N.lambs.below(LA.x))}`),
    "examiner-alignment": `Seeded from ${q2023}: the table value left where 1 minus it was needed for a negative z.`,
    "copy-shingle": SHINGLE,
    "style-lint": STYLE,
  }),
  verLog(ftm2.id, {
    schema: "Shape validated against src/lib/content/schema.ts (FindTheMistake) by pipeline/build-content.mts",
    "scope-tier": SCOPE,
    "maths-numeric": NUM(`The wrong area ${pv(route("normal-ftm2", MN.wrongTail))} and the corrected ${T(zpe)}`),
    "examiner-alignment": `Seeded from ${q2024} (0.0062 given for a region covering almost all the curve) and ${q2025} (0.0808 where 0.9192 was needed).`,
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

emit(SLUG, bundle, blocks);
