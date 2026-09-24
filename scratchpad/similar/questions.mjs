/**
 * The 16 questions: a minimally varied practice ladder, then four exam-style items.
 */
import { fmt, ratio, frac, fracPlain, clean, sf, N } from "./numbers.mjs";
import {
  figTrianglePair, figRectPair, figCuboidPair, figConePair, figCylinderPair, figNestedTriangle, figQuadPair, dataUri,
} from "./figs.mjs";

const T = "maths.m7.similar-shapes-length-area-and-volume-scale-factors";
const P1 = { unit: "M7", paper: 1, calculator: false, resources: ["formula-sheet-H"] };
const P2 = { unit: "M7", paper: 2, calculator: true, resources: ["formula-sheet-H", "scientific-calculator"] };
const M8P1 = { unit: "M8", paper: 1, calculator: false, resources: ["formula-sheet-H"] };
const M8P2 = { unit: "M8", paper: 2, calculator: true, resources: ["formula-sheet-H", "scientific-calculator"] };

const svgFig = (src, alt) => ({ kind: "svg", src: dataUri(src), alt });

const num = (value, o = {}) => {
  const { tol = { type: "exact" }, unit, unitRequired = false, forms = ["decimal", "fraction"] } = o;
  return {
    kind: "numeric",
    // an sf tolerance means the question demanded that accuracy, so the stored
    // value is the rounded form the answer line is meant to carry
    value: tol.type === "sf" ? sf(value, tol.figures) : clean(value),
    tolerance: tol,
    ...(unit ? { unit } : {}),
    unitRequired,
    acceptForms: forms,
  };
};
const txt = (accepted, keyWords = []) => ({ kind: "text", accepted, keyWords, listingRule: false });
const err = (misconception, value, feedback, marksTypicallyEarned, source) => ({
  misconception,
  pattern: { kind: "numeric", value: clean(value) },
  feedback,
  marksTypicallyEarned,
  ...(source ? { source } : {}),
});
const errText = (misconception, regex, feedback, marksTypicallyEarned, source) => ({
  misconception,
  pattern: { kind: "text", regex },
  feedback,
  marksTypicallyEarned,
  ...(source ? { source } : {}),
});

function question(spec) {
  const totalMarks = spec.parts.reduce((a, p) => a + p.marks, 0);
  return {
    id: `q.${T}.${spec.n}`,
    topic: T,
    specRefs: spec.specRefs,
    paper: spec.paper,
    tier: "H",
    style: spec.style,
    difficulty: spec.difficulty,
    ao: spec.ao,
    commandWords: spec.commandWords,
    emphasis: spec.emphasis,
    context: { setting: spec.setting, original: true },
    figures: spec.figures ?? [],
    parts: spec.parts,
    totalMarks,
    timeAllowanceSec: Math.round(totalMarks * 1.5 * 60),
    skeleton: spec.skeleton,
    examinerSources: spec.examinerSources,
    solutionProgram: spec.solutionProgram,
    verification: `ver.q.${T}.${spec.n}`,
    version: 1,
  };
}

export function questions() {
  const { q1, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16 } = N;

  const list = [];

  // 0001 — the trivially easy opener: area factor from a length factor
  list.push(
    question({
      n: "0001",
      specRefs: ["M7-GM-05"],
      paper: P1,
      style: "practice",
      difficulty: 1,
      ao: ["AO1"],
      commandWords: ["Write down"],
      emphasis: ["area scale factor"],
      setting: "Bare scale-factor recall, no context",
      skeleton: "(main)write1",
      examinerSources: ["ccea-cer:maths:2025-summer:M71:Q14"],
      solutionProgram: `area factor = ${fmt(q1.k)}^2 = ${fmt(q1.area)}`,
      parts: [
        {
          id: "main",
          marks: 1,
          stem: `A shape is enlarged by scale factor ${fmt(q1.k)}.\n\nWrite down how many times bigger the area of the shape becomes.`,
          answer: num(q1.area),
          scheme: [{ id: "A1", code: "A", marks: 1, for: `${fmt(q1.area)}`, accept: [`${fmt(q1.k)}²`, `${fmt(q1.k)} squared`] }],
          hints: [`An area is a length multiplied by a length.`, `Both of those lengths grow by ${fmt(q1.k)}.`],
          workedSolution: `Area takes two factors of $k$, so the area factor is $${fmt(q1.k)}^2 = ${fmt(q1.area)}$.`,
          commonErrors: [
            err(
              "maths.similar.area-sf-treated-as-length-sf",
              q1.k,
              `That is the factor for a length or a perimeter. An area needs $k$ twice. Summer 2025 examiners saw the same number written for both parts of exactly this question.`,
              0,
              "ccea-cer:maths:2025-summer:M71:Q14",
            ),
            err(
              "maths.similar.sf-doubled-not-squared",
              q1.doubled,
              `That is $${fmt(q1.k)}$ doubled rather than squared. Doubling and squaring only agree at 2.`,
              0,
              "ccea-cer:maths:2025-summer:M71:Q14",
            ),
            err(
              "maths.similar.wrong-power-applied",
              q1.volume,
              `$${fmt(q1.k)}^3$ is the volume factor. A flat shape has two dimensions, so the power is 2.`,
              0,
            ),
          ],
          requiresWorking: false,
        },
      ],
    }),
  );

  // 0002 — the same question, one dimension up
  list.push(
    question({
      n: "0002",
      specRefs: ["M7-GM-04"],
      paper: P1,
      style: "practice",
      difficulty: 1,
      ao: ["AO1"],
      commandWords: ["Write down"],
      emphasis: ["volume scale factor"],
      setting: "Bare scale-factor recall, no context",
      skeleton: "(main)write1",
      examinerSources: ["ccea-cer:maths:2023-summer:M81:Q9"],
      solutionProgram: `volume factor = ${fmt(q1.k)}^3 = ${fmt(q1.volume)}`,
      parts: [
        {
          id: "main",
          marks: 1,
          stem: `A solid is enlarged by scale factor ${fmt(q1.k)}.\n\nWrite down how many times bigger the volume of the solid becomes.`,
          answer: num(q1.volume),
          scheme: [{ id: "A1", code: "A", marks: 1, for: `${fmt(q1.volume)}`, accept: [`${fmt(q1.k)}³`, `${fmt(q1.k)} cubed`] }],
          hints: [`A volume is a length multiplied by a length multiplied by a length.`, `All three grow by ${fmt(q1.k)}.`],
          workedSolution: `Volume takes three factors of $k$, so the volume factor is $${fmt(q1.k)}^3 = ${fmt(q1.volume)}$.`,
          commonErrors: [
            err(
              "maths.similar.volume-scaled-linearly",
              q1.k,
              `That is the length factor. The solid grew in three directions at once, so the volume factor is the cube. This is the error the Summer 2023 report says the majority of candidates made.`,
              0,
              "ccea-cer:maths:2023-summer:M81:Q9",
            ),
            err(
              "maths.similar.wrong-power-applied",
              q1.area,
              `$${fmt(q1.k)}^2$ is the surface-area factor. A solid has a third dimension too.`,
              0,
            ),
            err("maths.similar.sf-doubled-not-squared", q1.trebled, `That is $${fmt(q1.k)}$ trebled rather than cubed.`, 0),
          ],
          requiresWorking: false,
        },
      ],
    }),
  );

  // 0003 — the first step backwards
  list.push(
    question({
      n: "0003",
      specRefs: ["M7-GM-05"],
      paper: M8P1,
      style: "practice",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Write down"],
      emphasis: ["area ratio back to a length ratio"],
      setting: "Bare scale-factor recall, no context",
      skeleton: "(main)write1",
      examinerSources: ["ccea-cer:maths:2024-summer:M71:Q16"],
      solutionProgram: `k = sqrt(${fmt(q3.areaFactor)}) = ${fmt(q3.k)}`,
      parts: [
        {
          id: "main",
          marks: 1,
          stem: `The area of shape $B$ is ${fmt(q3.areaFactor)} times the area of the similar shape $A$.\n\nWrite down the length scale factor from $A$ to $B$.`,
          answer: num(q3.k),
          scheme: [{ id: "A1", code: "A", marks: 1, for: `${fmt(q3.k)}`, accept: [`√${fmt(q3.areaFactor)}`] }],
          hints: [`${fmt(q3.areaFactor)} is $k^2$, not $k$.`, `Take the square root.`],
          workedSolution: `The area factor is $k^2$, so $k = \\sqrt{${fmt(q3.areaFactor)}} = ${fmt(q3.k)}$.`,
          commonErrors: [
            err(
              "maths.similar.area-sf-treated-as-length-sf",
              q3.areaFactor,
              `The area factor has been copied across to the lengths. It is $k^2$: root it first. This one step is what the Summer 2024 report found candidates missing.`,
              0,
              "ccea-cer:maths:2024-summer:M71:Q16",
            ),
            err("maths.similar.sf-doubled-not-squared", q3.halved, `Halving does not undo squaring. Check it: $${fmt(q3.halved)}^2 = ${fmt(q3.halved ** 2)}$.`, 0),
          ],
          requiresWorking: false,
        },
      ],
    }),
  );

  // 0004 — length factor to an area
  list.push(
    question({
      n: "0004",
      specRefs: ["M7-GM-05"],
      paper: P1,
      style: "practice",
      difficulty: 2,
      ao: ["AO1", "AO2"],
      commandWords: ["Work out"],
      emphasis: ["length scale factor", "area from k squared"],
      setting: "Two similar rectangles on a printed sheet",
      figures: [
        svgFig(
          figRectPair({
            leftName: "A",
            rightName: "B",
            leftW: 60,
            leftH: 42,
            rightW: 140,
            rightH: 98,
            leftLabel: [`length ${fmt(q4.lenA)} cm`, `area ${fmt(q4.areaA)} cm²`],
            rightLabel: [`length ${fmt(q4.lenB)} cm`, `area = ?`],
            note: "A and B are similar rectangles",
          }),
          `Two similar rectangles. The smaller, labelled A, has its length marked ${fmt(q4.lenA)} cm and its area marked ${fmt(q4.areaA)} square centimetres. The larger, labelled B, has its length marked ${fmt(q4.lenB)} cm and its area marked as unknown. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(main)work2",
      examinerSources: ["ccea-cer:maths:2025-summer:M71:Q14"],
      solutionProgram: `k = ${fmt(q4.lenB)}/${fmt(q4.lenA)} = ${fmt(q4.k)}; k^2 = ${fmt(q4.k2)}; area = ${fmt(q4.areaA)}*${fmt(q4.k2)} = ${fmt(q4.areaB)}`,
      parts: [
        {
          id: "main",
          marks: 2,
          stem:
            `$A$ and $B$ are similar rectangles.\n\n` +
            `$A$ has length ${fmt(q4.lenA)} cm and area ${fmt(q4.areaA)} cm².\n` +
            `$B$ has length ${fmt(q4.lenB)} cm.\n\n` +
            `Work out the area of $B$.`,
          answer: num(q4.areaB, { unit: "cm²", unitRequired: true }),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `k = ${fmt(q4.k)} or k² = ${fmt(q4.k2)} seen`, accept: [`${fmt(q4.lenB)} ÷ ${fmt(q4.lenA)}`] },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q4.areaB)} cm²`, dependsOn: ["MA1"], reject: [`${fmt(q4.areaB)} cm`] },
          ],
          hints: [
            `Pair the two lengths: $${fmt(q4.lenB)} \\div ${fmt(q4.lenA)}$.`,
            `You are asked for an area, so square the factor.`,
            `Give the answer in cm².`,
          ],
          workedSolution: `$k = ${fmt(q4.lenB)} \\div ${fmt(q4.lenA)} = ${fmt(q4.k)}$, so $k^2 = ${fmt(q4.k2)}$ and the area of $B$ is $${fmt(q4.areaA)} \\times ${fmt(q4.k2)} = ${fmt(q4.areaB)}$ cm².`,
          commonErrors: [
            err(
              "maths.similar.area-sf-treated-as-length-sf",
              q4.linear,
              `The length factor ${fmt(q4.k)} has been used on an area. Square it first: the area factor is ${fmt(q4.k2)}.`,
              0,
              "ccea-cer:maths:2025-summer:M71:Q14",
            ),
            err("maths.similar.wrong-power-applied", q4.cubed, `That cubes the factor, which is what a volume would need. A rectangle is flat.`, 0),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0005 — length factor to a volume
  list.push(
    question({
      n: "0005",
      specRefs: ["M7-GM-04"],
      paper: P1,
      style: "practice",
      difficulty: 2,
      ao: ["AO1", "AO2"],
      commandWords: ["Work out"],
      emphasis: ["volume from k cubed"],
      setting: "Two similar cuboid storage boxes",
      figures: [
        svgFig(
          figCuboidPair({
            leftName: "the original box",
            rightName: "the new box",
            leftLabel: `volume ${fmt(q5.vol)} cm³`,
            rightLabel: "volume = ?",
            note: `Every length is ${fmt(q5.k)} times as long`,
          }),
          `Two similar cuboids drawn in three dimensions. The smaller one is labelled as the original box with volume ${fmt(q5.vol)} cubic centimetres. The larger one is labelled as the new box with its volume marked as unknown, and a note says every length is ${fmt(q5.k)} times as long. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(main)work2",
      examinerSources: ["ccea-cer:maths:2023-summer:M81:Q9"],
      solutionProgram: `k^3 = ${fmt(q5.k)}^3 = ${fmt(q5.k3)}; V = ${fmt(q5.vol)}*${fmt(q5.k3)} = ${fmt(q5.newVol)}`,
      parts: [
        {
          id: "main",
          marks: 2,
          stem:
            `A storage box is a cuboid of volume ${fmt(q5.vol)} cm³.\n\n` +
            `A similar box is made in which every length is ${fmt(q5.k)} times as long.\n\n` +
            `Work out the volume of the new box.`,
          answer: num(q5.newVol, { unit: "cm³", unitRequired: true }),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `${fmt(q5.vol)} × ${fmt(q5.k)}³ or ${fmt(q5.k3)} seen` },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q5.newVol)} cm³`, dependsOn: ["M1"] },
          ],
          hints: [
            `The box grew in three directions, not one.`,
            `Volume factor $= ${fmt(q5.k)}^3$.`,
            `Give the answer in cm³.`,
          ],
          workedSolution: `The volume factor is $${fmt(q5.k)}^3 = ${fmt(q5.k3)}$, so the new volume is $${fmt(q5.vol)} \\times ${fmt(q5.k3)} = ${fmt(q5.newVol)}$ cm³.`,
          commonErrors: [
            err(
              "maths.similar.volume-scaled-linearly",
              q5.linear,
              `The volume has been multiplied by the length factor. The box is ${fmt(q5.k)} times longer, ${fmt(q5.k)} times wider and ${fmt(q5.k)} times taller, which is the cube. The Summer 2023 report records most candidates doing exactly this.`,
              0,
              "ccea-cer:maths:2023-summer:M81:Q9",
            ),
            err("maths.similar.wrong-power-applied", q5.squared, `Squaring gives the surface-area factor. A volume takes the third power.`, 0),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0006 — backwards from a volume ratio
  list.push(
    question({
      n: "0006",
      specRefs: ["M7-GM-04"],
      paper: M8P1,
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Work out"],
      emphasis: ["volume ratio back to a length ratio", "cube root"],
      setting: "Two similar solid models, no context",
      skeleton: "(main)work2",
      examinerSources: ["ccea-cer:maths:2025-summer:M81:Q9"],
      solutionProgram: `factor = ${fmt(q6.volB)}/${fmt(q6.volA)} = ${fmt(q6.factor)}; k = cbrt(${fmt(q6.factor)}) = ${fmt(q6.k)}`,
      parts: [
        {
          id: "main",
          marks: 2,
          stem:
            `Two similar solids have volumes ${fmt(q6.volA)} cm³ and ${fmt(q6.volB)} cm³.\n\n` +
            `Work out the length scale factor from the smaller solid to the larger solid.`,
          answer: num(q6.k),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `${fmt(q6.volB)} ÷ ${fmt(q6.volA)} = ${fmt(q6.factor)}` },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q6.k)}`, dependsOn: ["MA1"], accept: [`∛${fmt(q6.factor)}`] },
          ],
          hints: [
            `Divide to find how many times bigger the volume is.`,
            `That number is $k^3$.`,
            `Take the cube root: which number cubed gives ${fmt(q6.factor)}?`,
          ],
          workedSolution: `$${fmt(q6.volB)} \\div ${fmt(q6.volA)} = ${fmt(q6.factor)}$, and this is $k^3$. So $k = \\sqrt[3]{${fmt(q6.factor)}} = ${fmt(q6.k)}$, because $${fmt(q6.k)}^3 = ${fmt(q6.k ** 3)}$.`,
          commonErrors: [
            err(
              "maths.similar.volume-sf-not-cube-rooted",
              q6.rooted,
              `That is the square root. A volume ratio carries $k^3$, so the cube root is the way back; the square root would be right for a ratio of areas.`,
              1,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
            err(
              "maths.similar.volume-scaled-linearly",
              q6.factor,
              `${fmt(q6.factor)} is how many times bigger the **volume** is. MA1 is yours for finding it; the length factor is its cube root.`,
              1,
              "ccea-cer:maths:2023-summer:M81:Q9",
            ),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0007 — the Summer 2024 shape, new numbers
  list.push(
    question({
      n: "0007",
      specRefs: ["M7-GM-05"],
      paper: P1,
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Work out"],
      emphasis: ["area ratio", "square root", "length"],
      setting: "Two similar shapes with their areas given",
      figures: [
        svgFig(
          figTrianglePair({
            leftName: "A",
            rightName: "B",
            leftArea: `area ${fmt(q7.areaA)} cm²`,
            rightArea: `area ${fmt(q7.areaB)} cm²`,
            leftSide: "height = ?",
            rightSide: `height ${fmt(q7.heightB)} cm`,
            question: "A and B are similar shapes",
          }),
          `Two similar shapes drawn as triangles. Shape A has area ${fmt(q7.areaA)} square centimetres and its height marked as unknown. Shape B is larger, with area ${fmt(q7.areaB)} square centimetres and height ${fmt(q7.heightB)} cm. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(main)work3",
      examinerSources: ["ccea-cer:maths:2024-summer:M71:Q16"],
      solutionProgram: `ratio ${fmt(q7.areaA)}:${fmt(q7.areaB)} = 1:${fmt(q7.factor)}; lengths 1:${fmt(q7.k)}; h = ${fmt(q7.heightB)}/${fmt(q7.k)} = ${fmt(q7.heightA)}`,
      parts: [
        {
          id: "main",
          marks: 3,
          stem:
            `$A$ and $B$ are similar shapes.\n\n` +
            `The area of $A$ is ${fmt(q7.areaA)} cm² and the area of $B$ is ${fmt(q7.areaB)} cm².\n` +
            `The height of $B$ is ${fmt(q7.heightB)} cm.\n\n` +
            `Work out the height of $A$.`,
          answer: num(q7.heightA, { unit: "cm", unitRequired: false }),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `ratio of areas ${fmt(q7.areaA)} : ${fmt(q7.areaB)} = 1 : ${fmt(q7.factor)}` },
            { id: "MA2", code: "MA", marks: 1, for: `ratio of heights 1 : ${fmt(q7.k)}`, dependsOn: ["MA1"], examinerNote: "Follow through a candidate's own area ratio into its square root." },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q7.heightA)}`, dependsOn: ["MA2"] },
          ],
          hints: [
            `Write the two areas as a ratio and simplify it.`,
            `Square-root both parts to reach the heights.`,
            `$B$ is the larger shape, so $A$'s height is smaller than ${fmt(q7.heightB)} cm.`,
          ],
          workedSolution:
            `Areas $${fmt(q7.areaA)} : ${fmt(q7.areaB)} = 1 : ${fmt(q7.factor)}$. Heights $= 1 : \\sqrt{${fmt(q7.factor)}} = 1 : ${fmt(q7.k)}$. ` +
            `So the height of $A$ is $${fmt(q7.heightB)} \\div ${fmt(q7.k)} = ${fmt(q7.heightA)}$ cm.`,
          commonErrors: [
            err(
              "maths.similar.area-sf-treated-as-length-sf",
              q7.usedAreaFactor,
              `The area factor ${fmt(q7.factor)} has been divided into the height. MA1 is yours for finding it, and one square root turns it into the ${fmt(q7.k)} the height actually needs. This is the Summer 2024 question almost exactly.`,
              1,
              "ccea-cer:maths:2024-summer:M71:Q16",
            ),
            err(
              "maths.similar.scale-factor-inverted",
              q7.inverted,
              `The factor has been used upside down, so the smaller shape came out taller than the larger one. Check the direction before dividing.`,
              2,
            ),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0008 — a missing side in similar triangles
  list.push(
    question({
      n: "0008",
      specRefs: ["M7-GM-05"],
      paper: P2,
      style: "practice",
      difficulty: 2,
      ao: ["AO1", "AO2"],
      commandWords: ["Work out"],
      emphasis: ["corresponding sides", "length scale factor"],
      setting: "Two similar triangles printed side by side",
      figures: [
        svgFig(
          figTrianglePair({
            leftName: "A",
            rightName: "B",
            leftBase: `${fmt(q8.small)} cm`,
            rightBase: `${fmt(q8.large)} cm`,
            leftSide: `${fmt(q8.other)} cm`,
            rightSide: "x cm",
            question: "A and B are similar triangles",
          }),
          `Two similar triangles. Triangle A has its base marked ${fmt(q8.small)} cm and the side above it marked ${fmt(q8.other)} cm. Triangle B is larger, with its base marked ${fmt(q8.large)} cm and the corresponding side marked x cm. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(main)work2",
      examinerSources: ["ccea-cer:maths:2024-november:M71:Q13"],
      solutionProgram: `k = ${fmt(q8.large)}/${fmt(q8.small)} = ${fmt(q8.k)}; x = ${fmt(q8.other)}*k = ${fmt(q8.answer)}`,
      parts: [
        {
          id: "main",
          marks: 2,
          stem:
            `$A$ and $B$ are similar triangles.\n\n` +
            `The base of $A$ is ${fmt(q8.small)} cm and the base of $B$ is ${fmt(q8.large)} cm.\n` +
            `The side marked on $A$ is ${fmt(q8.other)} cm.\n\n` +
            `Work out the length marked $x$.`,
          answer: num(q8.answer, { unit: "cm", unitRequired: false }),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `${fmt(q8.large)} ÷ ${fmt(q8.small)} = ${fracPlain(q8.large, q8.small)}`, accept: [`${fmt(q8.other)}/${fmt(q8.small)} = x/${fmt(q8.large)}`] },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q8.answer)}`, dependsOn: ["MA1"] },
          ],
          hints: [
            `The two bases correspond, so they give $k$.`,
            `$k = ${fmt(q8.large)} \\div ${fmt(q8.small)} = ${frac(q8.large, q8.small)}$.`,
            `$B$ is the larger triangle, so $x$ is more than ${fmt(q8.other)} cm.`,
          ],
          workedSolution: `$k = \\dfrac{${fmt(q8.large)}}{${fmt(q8.small)}} = ${frac(q8.large, q8.small)}$, so $x = ${fmt(q8.other)} \\times ${frac(q8.large, q8.small)} = ${fmt(q8.answer)}$ cm.`,
          commonErrors: [
            err(
              "maths.similar.additive-instead-of-multiplicative",
              q8.other + (q8.large - q8.small),
              `The difference $${fmt(q8.large)} - ${fmt(q8.small)} = ${fmt(q8.large - q8.small)}$ has been added on. Similar shapes are linked by a multiplier; the November 2024 report describes the same subtraction.`,
              0,
              "ccea-cer:maths:2024-november:M71:Q13",
            ),
            err("maths.similar.scale-factor-inverted", q8.inverted, `The scale factor has been used upside down, so the larger triangle came out with the shorter side.`, 1),
            err("maths.similar.corresponding-sides-mismatched", q8.mismatched, `The ${fmt(q8.other)} cm side has been paired with a base rather than with its own partner. Pair first, then divide.`, 0),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0009 — volume of a similar cone, calculator, rounding demanded
  list.push(
    question({
      n: "0009",
      specRefs: ["M7-GM-04"],
      paper: M8P2,
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Calculate"],
      emphasis: ["volume from k cubed", "stated accuracy"],
      setting: "Two similar conical paper cups",
      figures: [
        svgFig(
          figConePair({
            leftName: "the small cup",
            rightName: "the large cup",
            leftHeight: `${fmt(q9.hSmall)} cm`,
            rightHeight: `${fmt(q9.hLarge)} cm`,
            leftLabel: [`holds ${fmt(q9.volSmall)} cm³`],
            rightLabel: ["holds ?"],
            note: "The two cups are similar cones",
          }),
          `Two similar cones standing on their bases, drawn as paper cups. The small cup has height ${fmt(q9.hSmall)} cm and holds ${fmt(q9.volSmall)} cubic centimetres. The large cup has height ${fmt(q9.hLarge)} cm and its capacity is marked as unknown. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(main)calculate3",
      examinerSources: ["ccea-cer:maths:2023-summer:M81:Q9"],
      solutionProgram: `k = ${fmt(q9.hLarge)}/${fmt(q9.hSmall)} = ${fmt(q9.k)}; k^3 = ${fmt(q9.k3)}; V = ${fmt(q9.volSmall)}*${fmt(q9.k3)} = ${fmt(q9.volLarge)}`,
      parts: [
        {
          id: "main",
          marks: 3,
          stem:
            `Two paper cups are similar cones.\n\n` +
            `The small cup is ${fmt(q9.hSmall)} cm high and holds ${fmt(q9.volSmall)} cm³.\n` +
            `The large cup is ${fmt(q9.hLarge)} cm high.\n\n` +
            `Calculate how much the large cup holds.\n` +
            `Give your answer correct to 3 significant figures.`,
          answer: num(q9.volLarge, { tol: { type: "sf", figures: 3 }, unit: "cm³", unitRequired: true }),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `k = ${fmt(q9.hLarge)} ÷ ${fmt(q9.hSmall)} = ${fmt(q9.k)}` },
            { id: "MA2", code: "MA", marks: 1, for: `k³ = ${fmt(q9.k3)} or ${fmt(q9.volSmall)} × ${fmt(q9.k)}³ seen`, dependsOn: ["MA1"] },
            { id: "A1", code: "A", marks: 1, for: `${Number(q9.volLarge.toPrecision(3))} cm³`, dependsOn: ["MA2"], accept: [`${fmt(q9.volLarge)}`] },
          ],
          hints: [
            `Heights correspond, so they give $k$.`,
            `Capacity is a volume, so cube $k$.`,
            `Round only at the end, to 3 significant figures.`,
          ],
          workedSolution:
            `$k = ${fmt(q9.hLarge)} \\div ${fmt(q9.hSmall)} = ${fmt(q9.k)}$, so $k^3 = ${fmt(q9.k3)}$. ` +
            `The large cup holds $${fmt(q9.volSmall)} \\times ${fmt(q9.k3)} = ${fmt(q9.volLarge)}$ cm³, which is ${Number(q9.volLarge.toPrecision(3))} cm³ to 3 significant figures.`,
          commonErrors: [
            err(
              "maths.similar.volume-scaled-linearly",
              q9.linear,
              `The capacity has been multiplied by ${fmt(q9.k)} rather than by ${fmt(q9.k)}³. MA1 is yours for the scale factor; the cube is the second mark.`,
              1,
              "ccea-cer:maths:2023-summer:M81:Q9",
            ),
            err("maths.similar.wrong-power-applied", q9.squared, `Squaring gives the surface-area factor, which would be right for the paper the cup is made of, not for what it holds.`, 1),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0010 — the Summer 2025 M8 pair, new numbers
  list.push(
    question({
      n: "0010",
      specRefs: ["M7-GM-04", "M7-GM-05"],
      paper: M8P1,
      style: "practice",
      difficulty: 4,
      ao: ["AO1", "AO2"],
      commandWords: ["Write down"],
      emphasis: ["surface-area ratio", "height ratio", "volume ratio"],
      setting: "Two similar solid shapes labelled A and B",
      figures: [
        svgFig(
          figCylinderPair({
            leftName: "A",
            rightName: "B",
            leftLabel: "surface area 9 parts",
            rightLabel: "surface area 49 parts",
            note: `Surface areas in the ratio ${ratio(q10.saA, q10.saB)}`,
          }),
          `Two similar solids drawn as cylinders. The smaller is labelled A and the larger is labelled B, and a note above them says the ratio of their surface areas is ${ratio(q10.saA, q10.saB)}. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(a)write1|(b)write1",
      examinerSources: ["ccea-cer:maths:2025-summer:M81:Q9"],
      solutionProgram: `heights = sqrt(${fmt(q10.saA)}):sqrt(${fmt(q10.saB)}) = ${ratio(q10.la, q10.lb)}; volumes = ${fmt(q10.la)}^3:${fmt(q10.lb)}^3 = ${ratio(q10.va, q10.vb)}`,
      parts: [
        {
          id: "a",
          marks: 1,
          stem:
            `$A$ and $B$ are similar solids.\n\n` +
            `Their surface areas are in the ratio $${ratio(q10.saA, q10.saB)}$.\n\n` +
            `Write down the ratio of the height of $A$ to the height of $B$.`,
          answer: txt([ratio(q10.la, q10.lb), `${fmt(q10.la)}:${fmt(q10.lb)}`]),
          scheme: [{ id: "A1", code: "A", marks: 1, for: `${ratio(q10.la, q10.lb)}` }],
          hints: [`Surface area is an area, so it carries $k^2$.`, `Square-root each part of the ratio.`],
          workedSolution: `$\\sqrt{${fmt(q10.saA)}} : \\sqrt{${fmt(q10.saB)}} = ${ratio(q10.la, q10.lb)}$.`,
          commonErrors: [
            errText(
              "maths.similar.area-sf-treated-as-length-sf",
              `^\\s*${fmt(q10.saA)}\\s*:\\s*${fmt(q10.saB)}\\s*$`,
              `That is the area ratio written out again. Take the square root of each part to reach the heights — the step the Summer 2025 report says only the stronger candidates made.`,
              0,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
          ],
          requiresWorking: false,
        },
        {
          id: "b",
          marks: 1,
          stem: `Write down the ratio of the volume of $A$ to the volume of $B$.`,
          answer: txt([ratio(q10.va, q10.vb), `${fmt(q10.va)}:${fmt(q10.vb)}`]),
          scheme: [{ id: "A1", code: "A", marks: 1, for: `${ratio(q10.va, q10.vb)}`, ft: true, examinerNote: "Follow through the candidate's own height ratio cubed." }],
          hints: [`Cube each part of the height ratio from part (a).`, `$${fmt(q10.la)}^3 = ${fmt(q10.va)}$.`],
          workedSolution: `$${fmt(q10.la)}^3 : ${fmt(q10.lb)}^3 = ${ratio(q10.va, q10.vb)}$.`,
          commonErrors: [
            errText(
              "maths.similar.wrong-power-applied",
              `^\\s*${fmt(q10.saA ** 3)}\\s*:\\s*${fmt(q10.saB ** 3)}\\s*$`,
              `The **area** ratio has been cubed. Cube the height ratio from part (a) instead; going straight from areas to volumes skips the lengths and raises $k$ to the sixth power.`,
              0,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
          ],
          requiresWorking: false,
          followThrough: { fromPart: "a", rule: "use-candidate-value" },
        },
      ],
    }),
  );

  // 0011 — volume ratio to a height, calculator, cube root
  list.push(
    question({
      n: "0011",
      specRefs: ["M7-GM-04"],
      paper: M8P2,
      style: "practice",
      difficulty: 4,
      ao: ["AO1", "AO2"],
      commandWords: ["Calculate"],
      emphasis: ["volume ratio", "cube root", "stated accuracy"],
      setting: "Two similar bottles of cordial",
      skeleton: "(main)calculate3",
      examinerSources: ["ccea-cer:maths:2025-summer:M81:Q9"],
      solutionProgram: `factor = ${fmt(q11.volLarge)}/${fmt(q11.volSmall)} = ${fmt(q11.factor)}; k = cbrt(${fmt(q11.factor)}) = ${fmt(q11.k)}; h = ${fmt(q11.hSmall)}*k = ${fmt(q11.hLarge)}`,
      parts: [
        {
          id: "main",
          marks: 3,
          stem:
            `Two bottles of cordial are similar in shape.\n\n` +
            `The small bottle holds ${fmt(q11.volSmall)} ml and is ${fmt(q11.hSmall)} cm tall.\n` +
            `The large bottle holds ${fmt(q11.volLarge)} ml.\n\n` +
            `Calculate the height of the large bottle.\n` +
            `Give your answer correct to 3 significant figures.`,
          answer: num(q11.hLarge, { tol: { type: "sf", figures: 3 }, unit: "cm", unitRequired: false }),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `${fmt(q11.volLarge)} ÷ ${fmt(q11.volSmall)} = ${fmt(q11.factor)}` },
            { id: "MA2", code: "MA", marks: 1, for: `k = ∛${fmt(q11.factor)} = ${Number(q11.k.toPrecision(4))}`, dependsOn: ["MA1"] },
            { id: "A1", code: "A", marks: 1, for: `${Number(q11.hLarge.toPrecision(3))}`, dependsOn: ["MA2"], accept: [`${Number(q11.hLarge.toPrecision(4))}`] },
          ],
          hints: [
            `How many times more does the large bottle hold?`,
            `That number is $k^3$, so take the cube root.`,
            `Keep the full cube root on your calculator and round only at the end.`,
          ],
          workedSolution:
            `$${fmt(q11.volLarge)} \\div ${fmt(q11.volSmall)} = ${fmt(q11.factor)}$, which is $k^3$. ` +
            `So $k = \\sqrt[3]{${fmt(q11.factor)}} = ${Number(q11.k.toPrecision(6))}\\ldots$ and the height is $${fmt(q11.hSmall)} \\times ${Number(q11.k.toPrecision(6))}\\ldots = ${Number(q11.hLarge.toPrecision(3))}$ cm to 3 significant figures.`,
          commonErrors: [
            err(
              "maths.similar.volume-sf-not-cube-rooted",
              Number(q11.rooted.toPrecision(4)),
              `The square root has been used where the cube root is needed. Areas carry $k^2$; volumes carry $k^3$.`,
              1,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
            err(
              "maths.similar.volume-scaled-linearly",
              q11.linear,
              `The volume factor ${fmt(q11.factor)} has been used on a height. MA1 is yours for finding it; it still has to be cube-rooted.`,
              1,
              "ccea-cer:maths:2023-summer:M81:Q9",
            ),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0012 — percentages, the November 2022 shape
  list.push(
    question({
      n: "0012",
      specRefs: ["M7-GM-05"],
      paper: P2,
      style: "practice",
      difficulty: 4,
      ao: ["AO2", "AO3"],
      commandWords: ["Work out"],
      emphasis: ["percentage increase", "area to length"],
      setting: "Two similar photographs enlarged for a display",
      skeleton: "(main)work3",
      examinerSources: ["ccea-cer:maths:2025-summer:M71:Q14"],
      solutionProgram: `area factor = 1 + ${fmt(q12.areaIncrease)}/100 = ${fmt(q12.areaFactor)}; k = sqrt(${fmt(q12.areaFactor)}) = ${fmt(q12.k)}; increase = ${fmt(q12.lengthIncrease)}%`,
      parts: [
        {
          id: "main",
          marks: 3,
          stem:
            `Two photographs are similar rectangles.\n\n` +
            `The area of the larger photograph is ${fmt(q12.areaIncrease)}% greater than the area of the smaller one.\n\n` +
            `Work out the percentage by which the width of the larger photograph is greater than the width of the smaller one.\n` +
            `The answer line is printed in %.`,
          answer: num(q12.lengthIncrease),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `area factor = ${fmt(q12.areaFactor)}` },
            { id: "MA2", code: "MA", marks: 1, for: `k = √${fmt(q12.areaFactor)} = ${fmt(q12.k)}`, dependsOn: ["MA1"] },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q12.lengthIncrease)}`, dependsOn: ["MA2"], accept: [`${fmt(q12.lengthIncrease)}%`] },
          ],
          hints: [
            `"${fmt(q12.areaIncrease)}% greater" means the area is multiplied by ${fmt(q12.areaFactor)}.`,
            `That multiplier is $k^2$.`,
            `Turn $k$ back into a percentage increase by subtracting 1.`,
          ],
          workedSolution:
            `The area factor is $1 + ${fmt(q12.areaIncrease / 100)} = ${fmt(q12.areaFactor)}$, and this is $k^2$. ` +
            `So $k = \\sqrt{${fmt(q12.areaFactor)}} = ${fmt(q12.k)}$, which is an increase of ${fmt(q12.lengthIncrease)}%.`,
          commonErrors: [
            err(
              "maths.similar.area-sf-treated-as-length-sf",
              q12.areaIncrease,
              `The area's percentage has been copied to the width. Convert to a multiplier, square-root it, then convert back.`,
              0,
              "ccea-cer:maths:2025-summer:M71:Q14",
            ),
            err("maths.similar.sf-doubled-not-squared", q12.areaIncrease / 2, `Halving the percentage is not the same as square-rooting the multiplier: $${fmt(1 + q12.areaIncrease / 200)}^2 = ${fmt((1 + q12.areaIncrease / 200) ** 2)}$, not ${fmt(q12.areaFactor)}.`, 0),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // ---- exam-style ---------------------------------------------------------

  // 0013 — the November 2025 shape, new numbers
  list.push(
    question({
      n: "0013",
      specRefs: ["M7-GM-05"],
      paper: P1,
      style: "exam-style",
      difficulty: 5,
      ao: ["AO1", "AO2", "AO3"],
      commandWords: ["Work out"],
      emphasis: ["area ratio", "length ratio", "forming and solving an equation"],
      setting: "Two similar shapes whose heights are given algebraically",
      figures: [
        svgFig(
          figQuadPair({
            leftName: "A",
            rightName: "B",
            leftLabel: `area ${fmt(q13.areaA)} cm²`,
            rightLabel: `area ${fmt(q13.areaB)} cm²`,
            leftSide: `height x cm`,
            rightSide: `height (x + ${fmt(q13.gapConst)}) cm`,
            note: "A and B are similar shapes",
          }),
          `Two similar four-sided shapes. Shape A has area ${fmt(q13.areaA)} square centimetres and height x cm. Shape B is larger, with area ${fmt(q13.areaB)} square centimetres and height x plus ${fmt(q13.gapConst)} cm. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(main)work4",
      examinerSources: ["ccea-cer:maths:2025-november:M72:Q16", "ccea-cer:maths:2025-november:M82:Q8"],
      solutionProgram:
        `ratio ${fmt(q13.areaA)}:${fmt(q13.areaB)} = ${ratio(q13.ra, q13.rb)}; lengths ${ratio(q13.la, q13.lb)}; ` +
        `${fmt(q13.lb)}x = ${fmt(q13.la)}(x + ${fmt(q13.gapConst)}); x = ${fmt(q13.x)}`,
      parts: [
        {
          id: "main",
          marks: 4,
          stem:
            `$A$ and $B$ are similar shapes.\n\n` +
            `The area of $A$ is ${fmt(q13.areaA)} cm² and the area of $B$ is ${fmt(q13.areaB)} cm².\n` +
            `The height of $A$ is $x$ cm and the height of $B$ is $(x + ${fmt(q13.gapConst)})$ cm.\n\n` +
            `Work out the value of $x$.\n` +
            `Show your working out clearly.`,
          answer: num(q13.x),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `ratio of areas ${fmt(q13.areaA)} : ${fmt(q13.areaB)} = ${ratio(q13.ra, q13.rb)}` },
            { id: "MA2", code: "MA", marks: 1, for: `ratio of heights ${ratio(q13.la, q13.lb)}`, dependsOn: ["MA1"] },
            { id: "M1", code: "M", marks: 1, for: `${fmt(q13.lb)}x = ${fmt(q13.la)}(x + ${fmt(q13.gapConst)}) oe`, dependsOn: ["MA2"], accept: [`x/(x + ${fmt(q13.gapConst)}) = ${fracPlain(q13.la, q13.lb)}`] },
            { id: "A1", code: "A", marks: 1, for: `x = ${fmt(q13.x)}`, dependsOn: ["M1"], examinerNote: "A correct value with no working scores zero here: the part demands the working." },
          ],
          hints: [
            `Simplify $${fmt(q13.areaA)} : ${fmt(q13.areaB)}$ first — both parts divide by ${fmt(q13.areaA / q13.ra)}.`,
            `Square-root each part to get the heights.`,
            `Then $\\dfrac{x}{x + ${fmt(q13.gapConst)}} = ${frac(q13.la, q13.lb)}$, and cross-multiply.`,
          ],
          workedSolution:
            `Areas $${fmt(q13.areaA)} : ${fmt(q13.areaB)} = ${ratio(q13.ra, q13.rb)}$, so heights $= ${ratio(q13.la, q13.lb)}$. ` +
            `Then $\\dfrac{x}{x + ${fmt(q13.gapConst)}} = ${frac(q13.la, q13.lb)}$, so $${fmt(q13.lb)}x = ${fmt(q13.la)}(x + ${fmt(q13.gapConst)}) = ${fmt(q13.la)}x + ${fmt(q13.la * q13.gapConst)}$. ` +
            `That gives $${fmt(q13.lb - q13.la)}x = ${fmt(q13.la * q13.gapConst)}$ and $x = ${fmt(q13.x)}$. ` +
            `Check: the heights are ${fmt(q13.heightA)} cm and ${fmt(q13.heightB)} cm, in the ratio ${ratio(q13.la, q13.lb)}.`,
          commonErrors: [
            err(
              "maths.similar.area-sf-treated-as-length-sf",
              q13.wrongX,
              `The area ratio ${ratio(q13.ra, q13.rb)} has been used as the height ratio. MA1 is yours for the ratio; square-root it before it goes into the equation. November 2025 examiners reported that this step was the one candidates could not make.`,
              1,
              "ccea-cer:maths:2025-november:M72:Q16",
            ),
            errText(
              "maths.presentation.answer-without-working",
              `^\\s*(x\\s*=\\s*)?${fmt(q13.x)}\\s*$`,
              `If the value is right but nothing else is on the page, the part scores nothing — it says to show the working clearly. Write the area ratio, the height ratio and the equation, and those marks are yours even if the final line slips.`,
              0,
              "ccea-cer:maths:2025-november:M82:Q8",
            ),
          ],
          requiresWorking: true,
        },
      ],
    }),
  );

  // 0014 — similar triangles inside one diagram, then an area ratio
  list.push(
    question({
      n: "0014",
      specRefs: ["M7-GM-05"],
      paper: P2,
      style: "exam-style",
      difficulty: 4,
      ao: ["AO1", "AO2"],
      commandWords: ["Work out", "Write down"],
      emphasis: ["parallel lines", "corresponding sides", "area ratio"],
      setting: "One triangle with a line drawn parallel to its base",
      figures: [
        svgFig(
          figNestedTriangle({
            apex: "P",
            left: "Q",
            right: "R",
            dName: "S",
            eName: "T",
            adLabel: `${fmt(q14.ps)} cm`,
            dbLabel: `${fmt(q14.sq)} cm`,
            deLabel: `${fmt(q14.st)} cm`,
            bcLabel: "QR",
            t: 0.4,
          }),
          `Triangle P Q R with P at the top. S lies on PQ and T lies on PR, and ST is drawn across the triangle parallel to QR, with chevron marks on ST and QR showing they are parallel. PS is marked ${fmt(q14.ps)} cm, SQ is marked ${fmt(q14.sq)} cm and ST is marked ${fmt(q14.st)} cm. The side QR is labelled but its length is not given. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(a)work3|(b)write2",
      examinerSources: ["ccea-cer:maths:2024-november:M71:Q13", "ccea-cer:maths:2025-summer:M71:Q14"],
      solutionProgram:
        `PQ = ${fmt(q14.ps)} + ${fmt(q14.sq)} = ${fmt(q14.pq)}; k = ${fmt(q14.pq)}/${fmt(q14.ps)} = ${fmt(q14.k)}; ` +
        `QR = ${fmt(q14.st)}*${fmt(q14.k)} = ${fmt(q14.qr)}; areas = ${fmt(q14.ps)}^2:${fmt(q14.pq)}^2 = ${ratio(q14.areaRatioA, q14.areaRatioB)}`,
      parts: [
        {
          id: "a",
          marks: 3,
          stem:
            `In the diagram, $S$ lies on $PQ$ and $T$ lies on $PR$, and $ST$ is parallel to $QR$.\n\n` +
            `$PS = ${fmt(q14.ps)}$ cm, $SQ = ${fmt(q14.sq)}$ cm and $ST = ${fmt(q14.st)}$ cm.\n\n` +
            `Work out the length of $QR$.`,
          answer: num(q14.qr, { unit: "cm", unitRequired: false }),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `PQ = ${fmt(q14.ps)} + ${fmt(q14.sq)} = ${fmt(q14.pq)}` },
            { id: "MA2", code: "MA", marks: 1, for: `k = ${fmt(q14.pq)} ÷ ${fmt(q14.ps)} = ${fmt(q14.k)}`, dependsOn: ["MA1"], accept: [`${fmt(q14.st)}/${fmt(q14.ps)} = QR/${fmt(q14.pq)}`] },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q14.qr)}`, dependsOn: ["MA2"] },
          ],
          hints: [
            `Both triangles have their apex at $P$.`,
            `The side matching $PS$ is the whole of $PQ$, so add $${fmt(q14.ps)} + ${fmt(q14.sq)}$ first.`,
            `$ST$ and $QR$ are the corresponding parallel sides.`,
          ],
          workedSolution:
            `$ST$ is parallel to $QR$, so triangles $PST$ and $PQR$ are similar. ` +
            `$PQ = ${fmt(q14.ps)} + ${fmt(q14.sq)} = ${fmt(q14.pq)}$ cm, so $k = ${fmt(q14.pq)} \\div ${fmt(q14.ps)} = ${fmt(q14.k)}$ and $QR = ${fmt(q14.st)} \\times ${fmt(q14.k)} = ${fmt(q14.qr)}$ cm.`,
          commonErrors: [
            err(
              "maths.similar.corresponding-sides-mismatched",
              (q14.st * q14.sq) / q14.ps,
              `$SQ$ has been paired with $PS$. $SQ$ is only the part of $PQ$ left over; the side that corresponds to $PS$ is the whole of $PQ$.`,
              0,
              "ccea-cer:maths:2024-november:M71:Q13",
            ),
            err(
              "maths.similar.additive-instead-of-multiplicative",
              q14.st + q14.sq,
              `$SQ$ has been added to $ST$. Similar triangles scale by multiplying, not by adding a difference.`,
              0,
              "ccea-cer:maths:2024-november:M71:Q13",
            ),
          ],
          requiresWorking: true,
        },
        {
          id: "b",
          marks: 2,
          stem: `Write down the ratio of the area of triangle $PST$ to the area of triangle $PQR$.\n\nGive your ratio in its simplest form.`,
          answer: txt([ratio(q14.areaRatioA, q14.areaRatioB), `${fmt(q14.areaRatioA)}:${fmt(q14.areaRatioB)}`]),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `length ratio ${ratio(q14.ps, q14.pq)} or ${ratio(2, 5)} seen`, ft: true },
            { id: "A1", code: "A", marks: 1, for: `${ratio(q14.areaRatioA, q14.areaRatioB)}`, dependsOn: ["MA1"] },
          ],
          hints: [`The lengths are in the ratio $${fmt(q14.ps)} : ${fmt(q14.pq)}$; simplify it.`, `Square each part of the length ratio.`],
          workedSolution:
            `Lengths $${fmt(q14.ps)} : ${fmt(q14.pq)} = ${ratio(2, 5)}$, so areas $= 2^2 : 5^2 = ${ratio(q14.areaRatioA, q14.areaRatioB)}$.`,
          commonErrors: [
            errText(
              "maths.similar.area-sf-treated-as-length-sf",
              `^\\s*2\\s*:\\s*5\\s*$`,
              `That is the ratio of the lengths. Areas take the square of each part, so it becomes ${ratio(q14.areaRatioA, q14.areaRatioB)}. Summer 2025 examiners saw the same number given for a length and for an area.`,
              1,
              "ccea-cer:maths:2025-summer:M71:Q14",
            ),
          ],
          requiresWorking: true,
          followThrough: { fromPart: "a", rule: "use-candidate-value" },
        },
      ],
    }),
  );

  // 0015 — the full chain, non-calculator, three parts
  list.push(
    question({
      n: "0015",
      specRefs: ["M7-GM-04", "M7-GM-05"],
      paper: M8P1,
      style: "exam-style",
      difficulty: 5,
      ao: ["AO1", "AO2", "AO3"],
      commandWords: ["Write down", "Work out"],
      emphasis: ["area ratio to length ratio", "length ratio to volume ratio", "using a ratio"],
      setting: "Two similar cylindrical tins on a shelf",
      figures: [
        svgFig(
          figCylinderPair({
            leftName: "C",
            rightName: "D",
            leftLabel: `volume ${fmt(q15.volSmall)} cm³`,
            rightLabel: "volume = ?",
            note: `Curved surface areas in the ratio ${ratio(q15.saA, q15.saB)}`,
          }),
          `Two similar cylindrical tins standing upright. The smaller is labelled C with volume ${fmt(q15.volSmall)} cubic centimetres; the larger is labelled D with its volume marked as unknown. A note says the ratio of their curved surface areas is ${ratio(q15.saA, q15.saB)}. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(a)write1|(b)work2|(c)work3",
      examinerSources: ["ccea-cer:maths:2025-summer:M81:Q9", "ccea-cer:maths:2025-november:M82:Q8"],
      solutionProgram:
        `heights = sqrt(${fmt(q15.saA)}):sqrt(${fmt(q15.saB)}) = ${ratio(q15.la, q15.lb)}; ` +
        `volumes = ${fmt(q15.la)}^3:${fmt(q15.lb)}^3 = ${ratio(q15.va, q15.vb)}; ` +
        `one part = ${fmt(q15.volSmall)}/${fmt(q15.va)} = ${fmt(q15.volSmall / q15.va)}; V = ${fmt(q15.volSmall / q15.va)}*${fmt(q15.vb)} = ${fmt(q15.volLarge)}`,
      parts: [
        {
          id: "a",
          marks: 1,
          stem:
            `$C$ and $D$ are similar cylindrical tins.\n\n` +
            `The ratio of the curved surface area of $C$ to the curved surface area of $D$ is $${ratio(q15.saA, q15.saB)}$.\n\n` +
            `Write down the ratio of the height of $C$ to the height of $D$.`,
          answer: txt([ratio(q15.la, q15.lb), `${fmt(q15.la)}:${fmt(q15.lb)}`]),
          scheme: [{ id: "A1", code: "A", marks: 1, for: `${ratio(q15.la, q15.lb)}` }],
          hints: [`Both ${fmt(q15.saA)} and ${fmt(q15.saB)} are square numbers.`, `Square-root each part.`],
          workedSolution: `$\\sqrt{${fmt(q15.saA)}} : \\sqrt{${fmt(q15.saB)}} = ${ratio(q15.la, q15.lb)}$.`,
          commonErrors: [
            errText(
              "maths.similar.area-sf-treated-as-length-sf",
              `^\\s*${fmt(q15.saA)}\\s*:\\s*${fmt(q15.saB)}\\s*$`,
              `The area ratio has been repeated. Square-root each part: a surface area carries $k^2$.`,
              0,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
          ],
          requiresWorking: false,
        },
        {
          id: "b",
          marks: 2,
          stem: `Work out the ratio of the volume of $C$ to the volume of $D$.`,
          answer: txt([ratio(q15.va, q15.vb), `${fmt(q15.va)}:${fmt(q15.vb)}`]),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `${fmt(q15.la)}³ : ${fmt(q15.lb)}³ seen`, ft: true },
            { id: "A1", code: "A", marks: 1, for: `${ratio(q15.va, q15.vb)}`, dependsOn: ["MA1"] },
          ],
          hints: [`Cube each part of your height ratio.`, `$${fmt(q15.lb)}^3 = ${fmt(q15.vb)}$.`],
          workedSolution: `$${fmt(q15.la)}^3 : ${fmt(q15.lb)}^3 = ${ratio(q15.va, q15.vb)}$.`,
          commonErrors: [
            errText(
              "maths.similar.wrong-power-applied",
              `^\\s*${fmt(q15.saA ** 3)}\\s*:\\s*${fmt(q15.saB ** 3)}\\s*$`,
              `The area ratio has been cubed instead of the height ratio. Areas reach volumes only through the lengths.`,
              0,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
          ],
          requiresWorking: true,
          followThrough: { fromPart: "a", rule: "use-candidate-value" },
        },
        {
          id: "c",
          marks: 3,
          stem: `The volume of $C$ is ${fmt(q15.volSmall)} cm³.\n\nWork out the volume of $D$.`,
          answer: num(q15.volLarge, { unit: "cm³", unitRequired: true }),
          scheme: [
            { id: "M1", code: "M", marks: 1, for: `${fmt(q15.volSmall)} ÷ ${fmt(q15.va)} = ${fmt(q15.volSmall / q15.va)}`, ft: true },
            { id: "M2", code: "M", marks: 1, for: `${fmt(q15.volSmall / q15.va)} × ${fmt(q15.vb)}`, dependsOn: ["M1"], accept: [`${fmt(q15.volSmall)} × ${fracPlain(q15.vb, q15.va)}`] },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q15.volLarge)} cm³`, dependsOn: ["M2"] },
          ],
          hints: [
            `Your ratio says $C$ is ${fmt(q15.va)} parts and $D$ is ${fmt(q15.vb)} parts.`,
            `Divide ${fmt(q15.volSmall)} by ${fmt(q15.va)} to find one part.`,
            `Then multiply by ${fmt(q15.vb)}.`,
          ],
          workedSolution:
            `From part (b) the volumes are in the ratio $${ratio(q15.va, q15.vb)}$. One part is $${fmt(q15.volSmall)} \\div ${fmt(q15.va)} = ${fmt(q15.volSmall / q15.va)}$ cm³, ` +
            `so the volume of $D$ is $${fmt(q15.volSmall / q15.va)} \\times ${fmt(q15.vb)} = ${fmt(q15.volLarge)}$ cm³.`,
          commonErrors: [
            err(
              "maths.similar.volume-scaled-linearly",
              (q15.volSmall * q15.lb) / q15.la,
              `The **height** ratio has been used on a volume. Use the cubed ratio from part (b).`,
              0,
              "ccea-cer:maths:2023-summer:M81:Q9",
            ),
            err(
              "maths.similar.wrong-power-applied",
              (q15.volSmall * q15.saB) / q15.saA,
              `The area ratio has been used on a volume. The volumes are in the ratio ${ratio(q15.va, q15.vb)}.`,
              0,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
          ],
          requiresWorking: true,
          followThrough: { fromPart: "b", rule: "use-candidate-value" },
        },
      ],
    }),
  );

  // 0016 — show that, then a capacity
  list.push(
    question({
      n: "0016",
      specRefs: ["M7-GM-04", "M7-GM-05"],
      paper: P2,
      style: "exam-style",
      difficulty: 5,
      ao: ["AO1", "AO2", "AO3"],
      commandWords: ["Show that", "Work out"],
      emphasis: ["area ratio to length ratio", "length ratio to volume ratio", "showing the chain"],
      setting: "Two similar cartons of apple juice in a shop",
      figures: [
        svgFig(
          figCuboidPair({
            leftName: "small carton",
            rightName: "large carton",
            leftLabel: [`label area ${fmt(q16.labelSmall)} cm²`, `holds ${fmt(q16.volSmall)} ml`],
            rightLabel: [`label area ${fmt(q16.labelLarge)} cm²`, `holds ?`],
            note: "The two cartons are similar",
          }),
          `Two similar cartons drawn as cuboids. The small carton has a label of area ${fmt(q16.labelSmall)} square centimetres and holds ${fmt(q16.volSmall)} millilitres. The large carton has a label of area ${fmt(q16.labelLarge)} square centimetres and its capacity is marked as unknown. The diagram is not drawn accurately.`,
        ),
      ],
      skeleton: "(a)show2|(b)work3",
      examinerSources: ["ccea-cer:maths:2025-summer:M81:Q9", "ccea-cer:maths:2025-november:M82:Q8"],
      solutionProgram:
        `ratio ${fmt(q16.labelSmall)}:${fmt(q16.labelLarge)} = ${ratio(q16.saA, q16.saB)}; heights ${ratio(q16.la, q16.lb)}; ` +
        `volumes ${ratio(q16.va, q16.vb)}; one part = ${fmt(q16.volSmall)}/${fmt(q16.va)} = ${fmt(q16.volSmall / q16.va)}; V = ${fmt(q16.volLarge)}`,
      parts: [
        {
          id: "a",
          marks: 2,
          stem:
            `Two cartons of apple juice are similar.\n\n` +
            `The label on the small carton has area ${fmt(q16.labelSmall)} cm² and the label on the large carton has area ${fmt(q16.labelLarge)} cm².\n\n` +
            `Show that the ratio of the height of the small carton to the height of the large carton is $${ratio(q16.la, q16.lb)}$.`,
          answer: {
            kind: "text",
            accepted: [
              `${fmt(q16.labelSmall)} : ${fmt(q16.labelLarge)} = ${ratio(q16.saA, q16.saB)}, and the square root of each part gives ${ratio(q16.la, q16.lb)}`,
            ],
            keyWords: [
              { any: [`${ratio(q16.saA, q16.saB)}`, `${fmt(q16.saA)}:${fmt(q16.saB)}`], marks: 1 },
              { any: ["square root", "root", "√", "squared"], marks: 1 },
            ],
            listingRule: false,
          },
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `${fmt(q16.labelSmall)} : ${fmt(q16.labelLarge)} = ${ratio(q16.saA, q16.saB)}` },
            { id: "A1", code: "A", marks: 1, for: `√${fmt(q16.saA)} : √${fmt(q16.saB)} = ${ratio(q16.la, q16.lb)} seen`, dependsOn: ["MA1"], examinerNote: "The printed result is given, so the marks are for the chain above it, not for restating it." },
          ],
          hints: [
            `Simplify $${fmt(q16.labelSmall)} : ${fmt(q16.labelLarge)}$ — both divide by ${fmt(q16.labelSmall / q16.saA)}.`,
            `A label is an area, so it carries $k^2$.`,
            `Square-root each part and the printed ratio appears.`,
          ],
          workedSolution:
            `The labels are areas, so $${fmt(q16.labelSmall)} : ${fmt(q16.labelLarge)} = ${ratio(q16.saA, q16.saB)}$ is $k^2$. ` +
            `Taking the square root of each part, the heights are $\\sqrt{${fmt(q16.saA)}} : \\sqrt{${fmt(q16.saB)}} = ${ratio(q16.la, q16.lb)}$, as required.`,
          commonErrors: [
            errText(
              "maths.presentation.answer-without-working",
              `^\\s*${fmt(q16.la)}\\s*:\\s*${fmt(q16.lb)}\\s*$`,
              `The printed ratio has been copied back. In a *show that* part the marks live in the lines above it: the simplified area ratio, then the square root.`,
              0,
              "ccea-cer:maths:2025-november:M82:Q8",
            ),
          ],
          requiresWorking: true,
        },
        {
          id: "b",
          marks: 3,
          stem: `The small carton holds ${fmt(q16.volSmall)} ml.\n\nWork out how much the large carton holds.`,
          answer: num(q16.volLarge, { unit: "ml", unitRequired: true }),
          scheme: [
            { id: "MA1", code: "MA", marks: 1, for: `volumes ${ratio(q16.va, q16.vb)}` },
            { id: "M1", code: "M", marks: 1, for: `${fmt(q16.volSmall)} ÷ ${fmt(q16.va)} = ${fmt(q16.volSmall / q16.va)}`, dependsOn: ["MA1"], accept: [`${fmt(q16.volSmall)} × ${fracPlain(q16.vb, q16.va)}`] },
            { id: "A1", code: "A", marks: 1, for: `${fmt(q16.volLarge)} ml`, dependsOn: ["M1"] },
          ],
          hints: [
            `Cube each part of the height ratio $${ratio(q16.la, q16.lb)}$.`,
            `That gives volumes $${ratio(q16.va, q16.vb)}$.`,
            `One part is $${fmt(q16.volSmall)} \\div ${fmt(q16.va)}$.`,
          ],
          workedSolution:
            `Heights $${ratio(q16.la, q16.lb)}$ give volumes $${fmt(q16.la)}^3 : ${fmt(q16.lb)}^3 = ${ratio(q16.va, q16.vb)}$. ` +
            `One part is $${fmt(q16.volSmall)} \\div ${fmt(q16.va)} = ${fmt(q16.volSmall / q16.va)}$ ml, so the large carton holds $${fmt(q16.volSmall / q16.va)} \\times ${fmt(q16.vb)} = ${fmt(q16.volLarge)}$ ml.`,
          commonErrors: [
            err(
              "maths.similar.volume-scaled-linearly",
              (q16.volSmall * q16.lb) / q16.la,
              `The height ratio has been used on a capacity. A capacity is a volume, so cube the ratio first.`,
              0,
              "ccea-cer:maths:2023-summer:M81:Q9",
            ),
            err(
              "maths.similar.wrong-power-applied",
              (q16.volSmall * q16.saB) / q16.saA,
              `The area ratio ${ratio(q16.saA, q16.saB)} has been used on a volume. Land on the heights, then cube.`,
              0,
              "ccea-cer:maths:2025-summer:M81:Q9",
            ),
          ],
          requiresWorking: true,
          followThrough: { fromPart: "a", rule: "use-candidate-value" },
        },
      ],
    }),
  );

  return list;
}
