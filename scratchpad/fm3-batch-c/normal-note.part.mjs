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
const DEL = { mean: 50, sd: 8, hours: 1 };
const zDel = (DEL.hours * 60 - DEL.mean) / DEL.sd;
if (zDel !== 1.25) throw new Error("g10 numbers are stale");

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
    md: "When $x$ is below the mean and you want the area above it, more than half of the curve is shaded. By the same symmetry $P(Z > -z) = P(Z < z) = \\Phi(z)$: read the table and stop.\nThe sketch keeps you honest here. If more than half is shaded, the answer must be more than 0.5.",
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
    md: "**Words that change the tail.** 'Does not qualify', 'or over' and 'at least' decide the shading, not the method (2021). For a measurement, 75 or over has the same probability as more than 75.",
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
