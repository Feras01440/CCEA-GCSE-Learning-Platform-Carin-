/** Find-the-mistake items, retrieval prompts, the insight card and the practice sets. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPIC, SPEC } from "./data-a.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export const findTheMistake = [
  {
    id: `ftm.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Orla was asked: make $x$ the subject of $6x = wx + 15$. Her working:",
    studentWorking: ["6x = wx + 15", "6x - 15 = wx", "x = (6x - 15) / w"],
    mistakeLine: 2,
    misconception: "maths.subject.subject-appears-twice-not-collected",
    whatWentWrong:
      "A term was moved, but the wrong one. Taking the 15 across leaves $x$ on both sides, and the last line proves it: the answer still contains an $x$, so $x$ has not been made the subject of anything. The move the mark is for is bringing the two $x$ terms together.",
    correction: ["6x - wx = 15", "x(6 - w) = 15", "x = 15 / (6 - w)"],
    marksEarnedAsWritten: [],
    feedback:
      "Nothing here is careless — the algebra in each line is sound, it is just aimed at the wrong term. Before writing anything, underline every term containing the subject; here that is $6x$ and $wx$, and they have to end up side by side. Examiners in summer 2025 reported that over a third of candidates never made that move, which is why so few of the three marks were taken. Check yours with $w = 1$: the answer $\\dfrac{15}{6-1} = 3$, and $6(3) = 18 = 1(3) + 15$.",
    source: "ccea-cer:maths:2025-summer:M82:Q6",
  },
  {
    id: `ftm.${TOPIC}.02`,
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Jack was asked: make $r$ the subject of $B = Ar^2 + 5$, where $r$ is positive. His working:",
    studentWorking: ["B = Ar^2 + 5", "B - 5 = Ar^2", "root(B - 5) = Ar", "r = root(B - 5) / A"],
    mistakeLine: 3,
    misconception: "maths.subject.root-before-isolating",
    whatWentWrong:
      "The root was taken while $r^2$ was still multiplied by $A$. Rooting both sides of $B - 5 = Ar^2$ gives $\\sqrt{B-5} = \\sqrt{A}\\,r$, not $Ar$, because the root acts on the whole of that side. Divide by $A$ first, and then the only thing left under the root is what belongs there.",
    correction: ["B - 5 = Ar^2", "(B - 5) / A = r^2", "r = root((B - 5) / A)"],
    marksEarnedAsWritten: ["MA1"],
    feedback:
      "The first line of working is right and it keeps its mark, so this is a script that scores something rather than nothing. The rule to carry away is that a power comes off last: isolate $r^2$ completely, then root the whole of the other side. November 2024 examiners saw exactly this, together with root signs drawn over a numerator only. Test it with $A = 4$ and $B = 21$: the right answer gives $r = \\sqrt{4} = 2$, and $4(2^2) + 5 = 21$.",
    source: "ccea-cer:maths:2024-november:M71:Q17",
  },
  {
    id: `ftm.${TOPIC}.03`,
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Ellen was asked: rearrange $p - 5n = q$ to make $n$ the subject. Her working:",
    studentWorking: ["p - 5n = q", "n = (q - p) / 5"],
    mistakeLine: 2,
    misconception: "maths.subject.sign-lost-moving-term",
    whatWentWrong:
      "Two steps were done in one line and a sign was lost on the way. The $5n$ is being subtracted, so it moves across as $+5n$ and the $q$ comes back the other way: $p - q = 5n$. Written as $\\dfrac{q-p}{5}$ the answer is the negative of the right one.",
    correction: ["p - q = 5n", "n = (p - q) / 5"],
    marksEarnedAsWritten: [],
    feedback:
      "Two things would have saved this. First, write the middle line: summer 2023 examiners noted that a mark was available for the intermediate line by itself, and jumping straight to the answer threw it away along with the accuracy mark. Second, substitute: with $p = 17$ and $q = 2$ the correct answer gives $n = 3$, and $17 - 5(3) = 2$, while this version gives $-3$. Thirty seconds of checking, two marks back.",
    source: "ccea-cer:maths:2023-summer:M72:Q10",
  },
];

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior, examUnit = "M7") => ({
  id: `rp.${TOPIC}.${String(n).padStart(2, "0")}`,
  topic: TOPIC,
  specRefs: SPEC,
  examUnit,
  kind,
  prompt,
  answer,
  keyWords,
  difficultyPrior,
});

export const prompts = [
  rp(
    1,
    "procedure",
    "The subject appears in two terms. Name the three moves, in order.",
    "Collect every term containing the subject on one side; factorise the subject out of them; divide both sides by the whole bracket.",
    ["collect", "factorise", "divide by the bracket"],
    6,
  ),
  rp(
    2,
    "procedure",
    "What is the rule for the order in which you undo operations?",
    "Undo them in reverse order: the last thing done to the subject is the first thing you take off, and each operation is applied to the whole of both sides.",
    ["reverse order", "last on first off", "both sides"],
    4,
  ),
  rp(
    3,
    "trap",
    "You have reached $r^2 = \\dfrac{B-5}{A}$. Where exactly does the square root go?",
    "Over the whole of the other side: $r = \\sqrt{\\dfrac{B-5}{A}}$. It is not $\\dfrac{\\sqrt{B-5}}{A}$, and it is never shared out term by term.",
    ["whole side", "not the numerator only", "not term by term"],
    6,
  ),
  rp(
    4,
    "formula",
    "Make $r$ the subject of $A = \\pi r^2$, and say which sign you keep.",
    "$r = \\sqrt{\\dfrac{A}{\\pi}}$. Divide by $\\pi$ first, then root the whole fraction. Only the positive root is kept, because $r$ is a radius, and that reason is written down.",
    ["divide by pi first", "root the whole fraction", "positive because radius"],
    4,
  ),
  rp(
    5,
    "procedure",
    "The subject is inside a denominator. What is the first move, and what do you multiply?",
    "Clear the fraction: multiply every term on both sides by the denominator. Only then can the subject be collected and factorised.",
    ["multiply by the denominator", "every term", "both sides"],
    5,
  ),
  rp(
    6,
    "trap",
    "You have reached $x(8-w) = 12+3w$. What do you divide by, and what must you not divide by?",
    "Divide by the whole bracket $(8-w)$, which goes underneath in one piece. Not by 8 alone, not by $-w$ alone, and never cancel a term that is not a factor.",
    ["whole bracket", "not one term", "factor not term"],
    6,
  ),
  rp(
    7,
    "procedure",
    "How do you check a rearrangement in under a minute?",
    "Pick easy values for the other letters, work the subject out from your answer, then put every value back into the original formula and check the two sides agree.",
    ["easy numbers", "work out the subject", "substitute into the original", "both sides agree"],
    4,
  ),
  rp(
    8,
    "definition",
    "What exactly does 'make $x$ the subject' ask you to produce?",
    "A formula of the form $x = \\ldots$, with $x$ alone on one side and appearing nowhere on the other. If an $x$ is still visible on the right, the question has not been answered.",
    ["x alone", "one side", "x nowhere on the other side"],
    3,
  ),
  rp(
    9,
    "trap",
    "You are out of time on a three-mark rearrangement. What is worth writing down?",
    "The collected line, and then the factorised line. Each scores on its own, and CCEA reported a mark sitting on the intermediate line even where nothing was finished.",
    ["collected line", "factorised line", "scores on its own"],
    5,
  ),
  rp(
    10,
    "novel-example",
    "The volume of a cone is $V = \\dfrac{1}{3}\\pi r^2 h$. Make $h$ the subject, then make $r$ the subject.",
    "$h = \\dfrac{3V}{\\pi r^2}$, which takes two steps. $r = \\sqrt{\\dfrac{3V}{\\pi h}}$, which takes the same two steps and then a root over the whole fraction, positive because $r$ is a radius.",
    ["3V over pi r squared", "root the whole fraction", "positive radius"],
    7,
    "M8",
  ),
];

export const insight = JSON.parse(
  fs.readFileSync(path.join(ROOT, "packs", "maths", "insights", "m7.changing-the-subject-harder-formulae.json"), "utf8"),
);

export const sets = [
  {
    id: `set.${TOPIC}.warm-up`,
    topic: TOPIC,
    kind: "interleaved",
    title: "Changing the subject warm-up",
    subject: "maths",
    units: ["M7"],
    itemIds: [
      `dx.${TOPIC}`,
      `rp.${TOPIC}.02`,
      `q.${TOPIC}.0001`,
      `q.${TOPIC}.0002`,
      `q.${TOPIC}.0003`,
      `rp.${TOPIC}.08`,
      `q.${TOPIC}.0004`,
      `q.${TOPIC}.0008`,
    ],
    showTopicLabels: false,
    version: 1,
  },
  {
    id: `set.${TOPIC}.mixed`,
    topic: TOPIC,
    kind: "mixed",
    title: "Powers, roots, fractions and the subject twice",
    subject: "maths",
    units: ["M7", "M8"],
    itemIds: [
      `q.${TOPIC}.0005`,
      `q.${TOPIC}.0006`,
      `ftm.${TOPIC}.02`,
      `q.${TOPIC}.0007`,
      `q.${TOPIC}.0009`,
      `ftm.${TOPIC}.01`,
      `q.${TOPIC}.0010`,
      `q.${TOPIC}.0011`,
      `q.${TOPIC}.0013`,
      `ftm.${TOPIC}.03`,
      `q.${TOPIC}.0014`,
      `q.${TOPIC}.0012`,
      `q.${TOPIC}.0015`,
      `q.${TOPIC}.0016`,
      `q.${TOPIC}.0017`,
      `rp.${TOPIC}.01`,
    ],
    showTopicLabels: false,
    version: 1,
  },
];
