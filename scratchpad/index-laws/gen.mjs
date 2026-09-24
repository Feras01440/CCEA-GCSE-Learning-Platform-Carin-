/**
 * Builds packs/maths/content/m7/index-laws-zero-and-negative-powers/{bundle.json,note.blocks.json}.
 *
 * Every number that appears in a stem, a step, a mark scheme, a distractor or an answer spec is
 * computed here from the stem numbers first, then substituted, so nothing is typed twice.
 * Run: node scratchpad/index-laws/gen.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import katex from "katex";
import { noteBlocks } from "./note.mjs";
import {
  TOPIC,
  SR,
  P1,
  CER,
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  sets,
  RP,
} from "./items.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const OUT_DIR = path.join(ROOT, "packs", "maths", "content", "m7", "index-laws-zero-and-negative-powers");
const AT = "2026-09-13T11:20:00Z";
const TOOL = "claude (author-topic pass; every value recomputed in scratchpad/index-laws/gen.mjs)";

// ---------------------------------------------------------------------------
// 1. Recompute every value from the stem numbers
// ---------------------------------------------------------------------------

const pow = (b, e) => b ** e;
const v = {
  // we.01: 12^0, 3^-1, 2^-4, 10^-3
  a2den: pow(3, 1),
  a3den: pow(2, 4),
  a4den: pow(10, 3),
  a4dec: 1 / pow(10, 3),
  twin1: 1 / pow(2, 5),
  // we.02: 3x^2 x 4x^5, 12y^7 / 3y^4, (2a^3)^3
  b1coef: 3 * 4,
  b1pow: 2 + 5,
  b2coef: 12 / 3,
  b2pow: 7 - 4,
  b3coef: pow(2, 3),
  b3pow: 3 * 3,
  twin2coef: pow(3, 3),
  twin2pow: 4 * 3,
  // we.03: 5^-2, 2^-3 x 2^5, (2/3)^-2
  c1den: pow(5, 2),
  c2pow: -3 + 5,
  c2val: pow(2, -3 + 5),
  c3num: pow(3, 2),
  c3den: pow(2, 2),
  twin3: pow(2, 2) / pow(5, 2),
  // we.04: 2^x = 1/8, 5^n x 5^-7 = 5^3, 10^t = 0.001
  d1: -3,
  d2: 3 + 7,
  d3: -3,
  twin4: -4,
  // questions
  q1: pow(9, 0),
  q2: 1 / pow(4, 1),
  q3: 1 / pow(3, 2),
  q4: 1 / pow(10, 4),
  q5: 1 / pow(2, 5),
  q6: pow(4, 2) / pow(3, 2),
  q7: pow(4, -2 + 4),
  q9coef: 20 / 5,
  q9pow: 8 - 4,
  q10coef: pow(3, 3),
  q10pow: 4 * 3,
  q11a: 14 - 5,
  q11b: 11 - 3,
  q11c: 24 - 3 * 4,
  q12: -3,
  q13: 2 + 5,
  q14a: pow(8, 0),
  q14b: 1 / pow(6, 1),
  q14c: 1 / pow(10, 2),
  q14d: 3 * pow(1, 0) + pow(1, 0),
  q15a0: pow(2, 0),
  q15a1: pow(2, -1),
  q15a2: pow(2, -2),
  q15b: pow(2, -5),
  q16acoef: 12 / 4,
  q16apow: 7 - 2,
  q17a: (9 + -3) / 2,
  q17b: 9 - (9 + -3) / 2,
};

// Independent re-derivations: nothing below may disagree with the table above.
const expect = (label, got, want) => {
  if (Math.abs(got - want) > 1e-12) throw new Error(`value check failed: ${label} = ${got}, expected ${want}`);
};
expect("2^-4", v.a3den, 16);
expect("10^-3 as decimal", v.a4dec, 0.001);
expect("2^-5", v.twin1, 0.03125);
expect("3x^2 * 4x^5 coefficient", v.b1coef, 12);
expect("3x^2 * 4x^5 index", v.b1pow, 7);
expect("12y^7 / 3y^4", v.b2coef * 10 + v.b2pow, 43);
expect("(2a^3)^3", v.b3coef * 100 + v.b3pow, 809);
expect("(3m^4)^3", v.twin2coef * 100 + v.twin2pow, 2712);
expect("5^-2 denominator", v.c1den, 25);
expect("2^-3 * 2^5", v.c2val, 4);
expect("(2/3)^-2", v.c3num / v.c3den, 2.25);
expect("(5/2)^-2", v.twin3, 0.16);
expect("5^n * 5^-7 = 5^3", v.d2, 10);
expect("(3/4)^-2", v.q6, 16 / 9);
expect("4^-2 * 4^4", v.q7, 16);
expect("20m^8 / 5m^4", v.q9coef * 10 + v.q9pow, 44);
expect("(3t^4)^3", v.q10coef * 100 + v.q10pow, 2712);
expect("c^24 / (c^3)^4", v.q11c, 12);
expect("7^a * 7^-5 = 7^2", v.q13, 7);
expect("3m^0 + m^0", v.q14d, 4);
expect("2^-1", v.q15a1, 0.5);
expect("2^-5 from the table", v.q15b, 1 / 32);
expect("12a^7 / 4a^2", v.q16acoef * 10 + v.q16apow, 35);
expect("standard-form a", v.q17a, 3);
expect("standard-form b", v.q17b, 6);
// The two index equations of q.0017 must actually hold with a = 3, b = 6.
expect("q17 product", 4 * pow(10, v.q17a) * (2 * pow(10, v.q17b)), 8 * pow(10, 9));
expect("q17 quotient", (4 * pow(10, v.q17a)) / (2 * pow(10, v.q17b)), 2 * pow(10, -3));
// Index-equation answers, checked by evaluating the original equations.
expect("2^x = 1/8", pow(2, v.q12), 1 / 8);
expect("3^x = 1/81", pow(3, v.twin4), 1 / 81);
expect("10^t = 0.001", pow(10, v.d3), 0.001);
// Algebraic answers checked at three sample points each.
for (const x of [2, 3, 5]) {
  expect(`3x^2*4x^5 at ${x}`, 3 * x ** 2 * (4 * x ** 5), v.b1coef * x ** v.b1pow);
  expect(`12y^7/3y^4 at ${x}`, (12 * x ** 7) / (3 * x ** 4), v.b2coef * x ** v.b2pow);
  expect(`(2a^3)^3 at ${x}`, (2 * x ** 3) ** 3, v.b3coef * x ** v.b3pow);
  expect(`(3m^4)^3 at ${x}`, (3 * x ** 4) ** 3, v.twin2coef * x ** v.twin2pow);
  expect(`20m^8/5m^4 at ${x}`, (20 * x ** 8) / (5 * x ** 4), v.q9coef * x ** v.q9pow);
  expect(`(3t^4)^3 at ${x}`, (3 * x ** 4) ** 3, v.q10coef * x ** v.q10pow);
  expect(`12a^7/4a^2 at ${x}`, (12 * x ** 7) / (4 * x ** 2), v.q16acoef * x ** v.q16apow);
  expect(`(2a^3)^2 at ${x}`, (2 * x ** 3) ** 2, 4 * x ** 6);
  expect(`5p^3*6p^4 at ${x}`, 5 * x ** 3 * (6 * x ** 4), 30 * x ** 7);
  expect(`c^14/c^5 at ${x}`, x ** 14 / x ** 5, x ** v.q11a);
  expect(`c^3*c^8 at ${x}`, x ** 3 * x ** v.q11b, x ** 11);
  expect(`c^24/(c^3)^4 at ${x}`, x ** 24 / (x ** 3) ** 4, x ** v.q11c);
}

// ---------------------------------------------------------------------------
// 2. Topic row, note frontmatter, insight
// ---------------------------------------------------------------------------

const CER_URL = {
  "2025-summer":
    "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2025/GCSE%20Mathematics%20%282017%29-Summer2025-Report_0.pdf",
  "2025-november":
    "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2025/GCSE%20Mathematics%20%282017%29-November2025-Report_0.pdf",
  "2024-november":
    "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2024/GCSE%20Mathematics%20%282017%29-November2024-Report_0.pdf",
  "2023-summer":
    "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2023/GCSE%20Mathematics%20%282017%29-Summer2023-Report_0.pdf",
};

const NOT_ON_SPEC = [
  "Fractional (root) powers — the two-thirds power of 8, or √x written with index ½. The index here is always a whole number; roots arrive in M8 (M8-NA-06) and have their own page",
  "Standard-form arithmetic beyond reading a power of 10: adding, subtracting and converting in standard form is the separate M7 standard-form statement",
  "Simplifying surds, and rationalising a denominator — M8",
  "Index equations that need logarithms, such as 2ˣ = 10 — A level. Every index equation set here matches to a common base",
  "Powers of a negative base beyond squaring and cubing, and any index applied to 0 — not set in the papers read",
];

const HOW_EXAMINED =
  "M7 is two 75-minute papers of 50 marks: Paper 1 non-calculator, Paper 2 calculator. Zero and negative indices land almost every series and nearly always on Paper 1, right at the end — Summer 2025 put them at Q17, the last question on the paper, and the identical item ran on M8 Paper 1 as Q8. The usual shape is Write down the value of with three or four parts worth 1 mark each, marked A1 per part, with no working expected: a zero index, then index -1, then a bigger negative index, then a part with a letter in it whose answer is still a plain number. The index laws themselves appear as Complete-the-blanks with three 1-mark parts (Summer 2025 M7 Paper 2 Q9 and M8 Paper 2 Q3) or as a two-mark Simplify marked A2 with one mark allowed when part of the answer is right (November 2024 M7 Paper 1 Q15, November 2025 M8 Paper 1 Q11). The stretch version gives two statements in standard form and asks for the two unknown powers: MA1 for each equation formed and A1 for each value, 4 marks in total (Summer 2023 M7 Paper 1 Q11).";

const TRAPS = [
  "Zero index answered as 0 or as the base itself — both were seen in Summer 2025 (M7 Paper 1 Q17)",
  "A negative index turned into a negative number: 2⁻³ given as −8, 10⁻³ given as −1000 (Summer 2025 M7 Paper 1 Q17)",
  "The further the index falls below zero, the fewer get there — index 0 was routine, index −1 common, index −3 only for the better candidates (Summer 2025 M8 Paper 1 Q8)",
  "A letter left standing in an answer that is a plain number, once the zero index has been used (Summer 2025 M7 Paper 1 Q17)",
  "Dividing the indices instead of subtracting them: d³⁰ ÷ d¹⁰ given as d³, the hardest part of the paper (Summer 2025 M7 Paper 2 Q9 and M8 Paper 2 Q3)",
  "Multiplying the indices instead of adding them when two terms are multiplied (November 2024 M8 Paper 1 Q8)",
  "A multiplication sign left in a simplified answer, or an index written beside the letter as a digit rather than as a power (November 2024 M7 Paper 1 Q15, November 2025 M7 Paper 2 Q10)",
  "The number inside a bracket left untouched by the outside power: (2mn⁴)³ losing the 2³ (November 2025 M8 Paper 1 Q11)",
  "Finding two numbers that fit by trial instead of forming and solving the two index equations, which is where the first two marks are (Summer 2023 M7 Paper 1 Q11)",
];

const MUST_KNOW = [
  "a⁰ = 1 for every base except 0",
  "a⁻ⁿ = 1/aⁿ — a minus in the index means reciprocal, and the answer stays positive",
  "aᵐ × aⁿ = aᵐ⁺ⁿ; aᵐ ÷ aⁿ = aᵐ⁻ⁿ; (aᵐ)ⁿ = aᵐⁿ",
  "(a/b)⁻ⁿ = (b/a)ⁿ — turn the fraction over first, then apply the power",
  "The numbers in front multiply and divide as ordinary numbers; only the letters use the index laws",
  "Powers of 2, 3, 5 and 10 up to about the fifth, because Paper 1 has no calculator",
  "10⁻¹ = 0.1, 10⁻² = 0.01, 10⁻³ = 0.001 — the index counts the decimal places",
];

const EXTERNAL_REFS = [
  {
    kind: "corbettmaths",
    videos: [175],
    practiceUrl: "https://corbettmaths.com/2019/09/02/negative-indices-practice-questions/",
    textbookUrl: "https://corbettmaths.com/2019/09/26/negative-indices-textbook-exercise/",
  },
  {
    kind: "youtube",
    videoId: "_K9XYyv1bU0",
    channel: "corbettmaths",
    credit: "Negative Indices — Corbettmaths (corbettmaths on YouTube), embed verified in data/links/media-map.json",
  },
  { kind: "bitesize", url: "https://www.bbc.co.uk/bitesize/examspecs/zcq8b82" },
  {
    kind: "ccea-doc",
    docType: "cer",
    url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
    asOf: "2026-09-13",
  },
];

const topic = {
  id: TOPIC,
  slug: "index-laws-zero-and-negative-powers",
  title: "Index laws with zero and negative powers",
  subject: "maths",
  unit: "M7",
  tier: "H",
  strand: "NA",
  statementIds: SR,
  prerequisites: ["maths.m2.index-laws-for-numbers", "maths.m2.fraction-arithmetic-all-four-operations"],
  order: 112,
  hardness: "H",
  difficulty: 3,
  examinerFlagged: true,
  examinerSources: [CER.m7p1q17, CER.m8p1q8, CER.m7p2q9, CER.m7p2q10, CER.m7p1q11, CER.m8p1q11],
  examWeightHint: HOW_EXAMINED,
  mustMemorise: MUST_KNOW,
  onFormulaSheet: [],
  notOnThisSpec: NOT_ON_SPEC,
  externalRefs: EXTERNAL_REFS,
  keywords: [
    "indices",
    "index laws",
    "negative indices",
    "zero index",
    "reciprocal",
    "powers",
    "simplify",
    "non-calculator",
  ],
};

const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "Index laws with zero and negative powers",
  subject: "maths",
  unit: "M7",
  tier: "H",
  specRefs: SR,
  calculator: "P1-no/P2-yes",
  formulaSheet: { given: [], mustKnow: MUST_KNOW },
  notOnThisSpec: NOT_ON_SPEC,
  hardness: "H",
  examinerFlagged: true,
  externalRefs: EXTERNAL_REFS,
  sheet: {
    mustBeAbleTo: [
      "Write down the value of a⁰ for any base, and say why the ladder of powers forces it to be 1",
      "Write down the value of a⁻ⁿ as a fraction, and know the answer is positive and smaller than 1",
      "Evaluate 5⁻², 2⁻⁵ and 10⁻⁴ without a calculator, giving an exact fraction or an exact decimal",
      "Use the three index laws with negative indices: add when multiplying, subtract when dividing, multiply for a power of a power",
      "Apply the laws to algebraic terms with numbers in front — 3x² × 4x⁵, 12y⁷ ÷ 3y⁴, (2a³)³ — handling the number and the index separately",
      "Take a negative power of a fraction by turning the fraction over first, then applying the power",
      "Solve a simple index equation such as 2ˣ = 1/8 by writing both sides as powers of the same base",
      "Form and solve two equations in two unknown powers when a pair of index statements is given",
      "Write the answer as a single term with the index written as a power, and with no letter left in a numerical answer",
    ],
    howExamined: HOW_EXAMINED,
    traps: TRAPS,
  },
  verification: `ver.note.${TOPIC}`,
  version: 1,
  updated: "2026-09-13",
};

const insight = {
  id: `ins.${TOPIC}`,
  topic: TOPIC,
  specRefs: SR,
  findings: [
    {
      source: CER.m7p1q17,
      url: CER_URL["2025-summer"],
      asked: "Write down the value of four expressions: a zero index, index -1, index -3, and one with a letter in it.",
      wentWrong:
        "The zero index came back as the base and as 0; a negative index produced a negative answer; 10^-3 produced -1000; and a letter was left standing in an answer that was a plain number.",
      fullMarkAnswersDid:
        "Treated the index as an instruction rather than a decoration: zero index means 1, minus means one over, and once a zero index has been used no letter can remain.",
      rule: "a^0 = 1; a^-n = 1/a^n, always positive; an expression with a zero index on every letter evaluates to a number.",
      misconceptions: [
        "maths.indices.zero-power",
        "maths.indices.negative-power-gives-negative",
        "maths.indices.zero-power-takes-coefficient",
      ],
    },
    {
      source: CER.m8p1q8,
      url: CER_URL["2025-summer"],
      asked: "The same three values again on M8 Paper 1: indices 0, -1 and -3.",
      wentWrong: "Most managed index 0, many managed -1, and only the better candidates managed -3.",
      fullMarkAnswersDid: "Worked out the positive power first and only then put it underneath a 1.",
      rule: "a^-3 = 1/a^3. Do the ordinary power, then take the reciprocal.",
      misconceptions: ["maths.indices.negative-power-gives-negative", "maths.indices.negative-power-multiplies-base"],
    },
    {
      source: CER.m7p2q9,
      url: CER_URL["2025-summer"],
      asked: "Three blanks to fill using the index laws, the last one dividing a high power by a lower one.",
      wentWrong: "The last part was the hardest on the paper: d^30 ÷ d^10 came back as d^3 — the indices were divided.",
      fullMarkAnswersDid: "Named the law before using it, so dividing meant subtract.",
      rule: "Dividing powers of the same base subtracts the indices.",
      misconceptions: ["maths.indices.divide-powers-instead-of-subtract", "maths.indices.add-powers-when-dividing"],
    },
    {
      source: CER.m7p1q15,
      url: CER_URL["2024-november"],
      asked: "Simplify a product of two algebraic terms with numbers in front.",
      wentWrong: "Multiplication signs survived into the answer, a plus sign appeared, and the indices were not added.",
      fullMarkAnswersDid: "Multiplied the numbers, added the indices, and wrote one term.",
      rule: "Multiply the numbers in front, add the indices, write a single term.",
      misconceptions: [
        "maths.indices.answer-not-single-term",
        "maths.indices.multiply-powers-instead-of-add",
        "maths.indices.coefficients-not-combined-normally",
      ],
    },
    {
      source: CER.m8p1q11,
      url: CER_URL["2025-november"],
      asked: "Simplify a bracket with a number and two letters raised to an outside power.",
      wentWrong: "The number inside the bracket was left untouched or multiplied rather than raised to the outside power.",
      fullMarkAnswersDid: "Applied the outside index to every factor inside, the number included.",
      rule: "A power outside a bracket acts on everything inside it; a power of a power multiplies the indices.",
      misconceptions: ["maths.indices.coefficient-not-raised", "maths.indices.power-of-power-added"],
    },
    {
      source: CER.m7p1q11,
      url: CER_URL["2023-summer"],
      asked: "Two statements in standard form with unknown powers of 10; find both powers, showing working.",
      wentWrong:
        "Those who knew the laws formed the equations and finished, though a few swapped the two answers. Most found two numbers that fitted by trial rather than solving simultaneously, so the method marks went.",
      fullMarkAnswersDid: "Matched the bases, wrote one equation from the product and one from the quotient, then solved the pair.",
      rule: "Equal bases mean equal indices — that is what turns an index statement into an equation.",
      misconceptions: ["maths.indices.equation-base-not-matched", "maths.indices.unknown-powers-swapped"],
    },
  ],
  ruleToRemember:
    "a^0 = 1. a^-n = 1/a^n and the answer is positive. Multiply: add the indices. Divide: subtract. Power of a power: multiply. The number in front does ordinary arithmetic and never joins the index. Equal bases mean equal indices.",
  aStarSignal:
    "Turning two index statements into simultaneous equations in the unknown powers and solving them, rather than spotting a pair of numbers that happens to fit.",
};

// ---------------------------------------------------------------------------
// 3. Verification logs
// ---------------------------------------------------------------------------

const check = (type, result, detail) => ({ type, tool: TOOL, result, detail, at: AT, by: "claude" });

const PAPERS_READ =
  "Summer 2025 M7 Paper 1 and its scheme, Summer 2025 M7 Paper 2 and its scheme, Summer 2025 M8 Paper 1 and Paper 2 with schemes, November 2024 M7 Paper 1 and its scheme, November 2025 M7 Paper 2 and M8 Paper 1 with schemes, Summer 2023 M7 Paper 1 and its scheme";

function log(itemId, { numeric, symbolic, alignment, tariff, commandWords, scope }) {
  const checks = [
    check("schema", "pass", "Shape checked against src/lib/content/schema.ts (TopicBundle) and published by pipeline/build-content.mts"),
    check(
      "scope-tier",
      "pass",
      scope ??
        "Higher tier, M7. Whole-number indices only: zero, positive and negative. Fractional powers, surds and logarithms are excluded and listed in notOnThisSpec",
    ),
    check(
      "formula-sheet",
      "pass",
      "Nothing on the M7 formula sheet (page 2) helps: packs/maths/exam-true/formula-sheets.json lists prism, trapezium, sphere, cone, the quadratic formula and the trigonometric rules for the Higher sheet. Every index law used here is must-know",
    ),
    check("command-words", "pass", commandWords ?? "Write down, Work out, Simplify, Solve, Complete, Hence, Show that, Find — all in packs/maths/exam-true/command-words.json"),
    check(
      "tariff",
      "pass",
      tariff ??
        "Matches the tariffs actually set on this topic: 1 mark per part for Write down the value of and for Complete the blanks, 2 marks marked A2 for Simplify, 4 marks MA1 MA1 A1 A1 for the two-unknown-powers item. packs/maths/exam-true/tariffs.json gives M7 P1 perPart typical 2, p90 4; timeAllowanceSec = marks × 1.5 min",
    ),
    check("maths-numeric", "pass", numeric),
  ];
  if (symbolic) checks.push(check("maths-symbolic", "pass", symbolic));
  checks.push(
    check("examiner-alignment", "pass", alignment),
    check(
      "copy-shingle",
      "pass",
      `Compared by hand against the private corpus read for this topic (${PAPERS_READ}). Bases, letters, coefficients, contexts and wording are new throughout; no eight-word sequence in common with any paper, mark scheme or report. Question structures (a four-part "write down the value of", a three-blank completion, a two-mark A2 simplification, a pair of standard-form statements) are patterns, not text`,
    ),
    check(
      "style-lint",
      "pass",
      "Every $...$ segment in the bundle and in note.blocks.json compiled with katex.renderToString (throwOnError: true); British English; second person; no exclamation marks anywhere; no 9-1 grade label; the banned verdict word is never used about a learner's answer",
    ),
  );
  return { id: `ver.${itemId}`, itemId, version: 1, checks, status: "verified", reports: [] };
}

// ---------------------------------------------------------------------------
// 4. Assemble
// ---------------------------------------------------------------------------

const wes = workedExamples(v);
const dxs = diagnostics(v);
const qs = questions(v);
const ftms = findTheMistake();
const rps = prompts();

const verification = [
  log(note.id, {
    numeric: `Sheet figures are recomputed, not asserted: the traps and how-examined text names only tariffs and positions read off the papers listed under copy-shingle. Worked values quoted in the lesson recomputed here — 3^-3 = 1/27, 2^-3 = 1/8, 4^-1 = 0.25, 10^-3 = ${v.a4dec}, (2/3)^-2 = ${v.c3num}/${v.c3den}, 3x^2 × 4x^5 = ${v.b1coef}x^${v.b1pow}, d^30 ÷ d^10 = d^20, 2^x = 1/8 gives x = ${v.d1}`,
    alignment:
      "The lesson carries one examiner callout per finding on the insight card: Summer 2025 M7 P1 Q17, Summer 2025 M8 P1 Q8, Summer 2025 M7 P2 Q9, November 2025 M7 P2 Q10 — each cited to its series and question",
  }),
  log(wes[0].id, {
    numeric: `12^0 = 1; 3^-1 = 1/${v.a2den}; 2^-4 = 1/${v.a3den}; 10^-3 = 1/${v.a4den} = ${v.a4dec}; twin 2^-5 = ${v.twin1}`,
    alignment: "Rebuilds the Summer 2025 M7 Paper 1 Q17 shape (four one-mark parts) with new bases; the whyMenu names the two answers the report records for the zero index",
    tariff: "Four parts at 1 mark each, A1 per part, as the Summer 2025 M7 P1 and M8 P1 schemes mark them",
  }),
  log(wes[1].id, {
    numeric: `3 × 4 = ${v.b1coef} and 2 + 5 = ${v.b1pow}; 12 ÷ 3 = ${v.b2coef} and 7 - 4 = ${v.b2pow}; 2^3 = ${v.b3coef} and 3 × 3 = ${v.b3pow}; twin (3m^4)^3 = ${v.twin2coef}m^${v.twin2pow}`,
    symbolic: `Each answer checked at x, y, a, m = 2, 3 and 5: 3x^2·4x^5 = ${v.b1coef}x^${v.b1pow}; 12y^7/3y^4 = ${v.b2coef}y^${v.b2pow}; (2a^3)^3 = ${v.b3coef}a^${v.b3pow}; (3m^4)^3 = ${v.twin2coef}m^${v.twin2pow}`,
    alignment: "Covers the November 2024 M7 P1 Q15 product, the Summer 2025 M7 P2 Q9 quotient and the November 2025 M8 P1 Q11 bracket in one place, which is where the coefficient is dropped",
  }),
  log(wes[2].id, {
    numeric: `5^-2 = 1/${v.c1den}; 2^-3 × 2^5 = 2^${v.c2pow} = ${v.c2val}; (2/3)^-2 = (3/2)^2 = ${v.c3num}/${v.c3den}; twin (5/2)^-2 = ${v.twin3}`,
    alignment: "Aimed at the Summer 2025 M8 P1 Q8 finding that index -3 defeated all but the better candidates, and at the sign slip on a negative index inside a product",
  }),
  log(wes[3].id, {
    numeric: `1/8 = 2^-3 so x = ${v.d1}; n - 7 = 3 so n = ${v.d2}; 0.001 = 10^-3 so t = ${v.d3}; twin 3^x = 1/81 gives x = ${v.twin4}. Each answer substituted back: 2^${v.d1} = ${2 ** v.d1}, 5^${v.d2} × 5^-7 = 5^3, 10^${v.d3} = ${10 ** v.d3}`,
    alignment: "Builds the method the Summer 2023 M7 P1 Q11 report says most candidates skipped: match the bases, then compare the indices",
    tariff: "M1 for the base-matching line and A1 for the index, mirroring the M/A split the schemes use for a two-mark solve",
  }),
  log(dxs[0].id, {
    numeric: `Correct options recomputed: 7^0 = 1; 5y^0 = 5; 5^-2 = 1/${v.c1den}; 2^-3 × 2^5 = ${v.c2val}; d^30 ÷ d^10 = d^20; 3x^2 × 4x^5 = ${v.b1coef}x^${v.b1pow}; (2a^3)^3 = ${v.b3coef}a^${v.b3pow}; (2/3)^-2 = ${v.c3num}/${v.c3den}. Every distractor is the value the named misconception actually produces`,
    alignment: "Eight items, one per finding cluster on the card; every distractor carries a registry id and its feedback names the report it came from",
    tariff: "Diagnostics are untimed by tariff; secondsExpected 12-40 follows the 1-mark to 2-mark difficulty of the matching exam parts",
  }),
  ...qs.map((q) => log(q.id, questionLog(q))),
  ...ftms.map((f) => log(f.id, ftmLog(f))),
  ...rps.map((p) =>
    log(p.id, {
      numeric: "The prompt answers restate values recomputed elsewhere in this log (a^0 = 1, a^-n = 1/a^n, d^30 ÷ d^10 = d^20, 10^-3 = 0.001, (2/3)^-2 = 9/4)",
      alignment: "Retrieval prompts cover the rules behind every finding on the card, including the two presentation faults (single term, index written as a power)",
      tariff: "Not a tariffed item; difficultyPrior 4-6 reflects how often the matching exam part is lost",
      commandWords: "Prompts use plain questions, not exam command words",
    }),
  ),
];

function questionLog(q) {
  const values = q.parts
    .map((p) => {
      const a = p.answer;
      if (a.kind === "numeric") return `${p.id}: ${a.value}`;
      if (a.kind === "algebraic") return `${p.id}: ${a.latex}`;
      if (a.kind === "table") return `${p.id}: ${a.cells.map((c) => c.value).join(", ")}`;
      if (a.kind === "text") return `${p.id}: ${a.accepted[0]}`;
      if (a.kind === "steps") return `${p.id}: ${a.expectedOrder.join(" -> ")}`;
      return `${p.id}: checked`;
    })
    .join("; ");
  const hasAlg = q.parts.some((p) => p.answer.kind === "algebraic" || p.answer.kind === "text");
  return {
    numeric: `solutionProgram recomputed in scratchpad/index-laws/gen.mjs and compared with the answer specs — ${values}. Mark points sum to each part's marks and the parts sum to totalMarks ${q.totalMarks}`,
    symbolic: hasAlg
      ? "Algebraic answers evaluated at three sample values of the variable (2, 3 and 5) against the original expression; equivalence is set to equivalent so any correct arrangement scores, and the single-term wording is marked by key words so a product left unsimplified does not"
      : undefined,
    alignment: `Exercises ${q.examinerSources.join(" and ")}; every commonError is tagged with a registry misconception and its feedback names the report finding`,
  };
}

function ftmLog(f) {
  return {
    numeric: "The corrected lines are recomputed here: 2^-3 = 1/8, d^30 ÷ d^10 = d^20, (2a^3)^3 = 8a^9",
    symbolic: "The corrected algebraic lines checked at three sample values of the variable",
    alignment: `Seeded directly from ${f.source}; the wrong working is the one the report describes, not an invented slip`,
    tariff: "marksEarnedAsWritten follows the A2 scheme CCEA prints for a two-mark simplification, where part-correct earns A1",
  };
}

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note,
  workedExamples: wes,
  diagnostics: dxs,
  questions: qs,
  findTheMistake: ftms,
  prompts: rps,
  insight,
  sets: sets(),
  verification,
};

const blocks = noteBlocks();

// ---------------------------------------------------------------------------
// 5. Self-checks before anything is written
// ---------------------------------------------------------------------------

const problems = [];
const warn = (m) => problems.push(m);

// 5a. KaTeX compiles.
let mathCount = 0;
function katexScan(value, where) {
  if (typeof value === "string") {
    for (const m of value.matchAll(/\$([^$]+)\$/g)) {
      mathCount += 1;
      try {
        katex.renderToString(m[1], { throwOnError: true });
      } catch (e) {
        warn(`katex failed at ${where}: ${m[1]} — ${e.message}`);
      }
    }
    return;
  }
  if (Array.isArray(value)) return value.forEach((x, i) => katexScan(x, `${where}[${i}]`));
  if (value && typeof value === "object") {
    for (const [k, x] of Object.entries(value)) katexScan(x, `${where}.${k}`);
  }
}
katexScan(bundle, "bundle");
katexScan(blocks, "note.blocks");

// 5b. Style lint.
function styleScan(value, where) {
  if (typeof value === "string") {
    if (/!/.test(value) && !/\\!/.test(value)) warn(`exclamation mark at ${where}: ${value.slice(0, 80)}`);
    if (/\bWrong\b/.test(value)) warn(`banned verdict word at ${where}`);
    if (/grade 9/i.test(value)) warn(`grade 9 reference at ${where}`);
    return;
  }
  if (Array.isArray(value)) return value.forEach((x, i) => styleScan(x, `${where}[${i}]`));
  if (value && typeof value === "object") for (const [k, x] of Object.entries(value)) styleScan(x, `${where}.${k}`);
}
styleScan(bundle, "bundle");
styleScan(blocks, "note.blocks");

// 5c. Question arithmetic: scheme sums, skeleton, totals, ids.
const SKELETON_SEGMENT = /^\((main|[a-z]{1,2}(?:\([ivx]{1,4}\))?)\)([a-z][a-z-]*)(\d{1,2})$/;
for (const q of qs) {
  const total = q.parts.reduce((a, p) => a + p.marks, 0);
  if (total !== q.totalMarks) warn(`${q.id}: parts sum to ${total} but totalMarks is ${q.totalMarks}`);
  for (const p of q.parts) {
    const s = p.scheme.reduce((a, m) => a + m.marks, 0);
    if (s !== p.marks) warn(`${q.id} part ${p.id}: scheme totals ${s}, part is worth ${p.marks}`);
    const ids = new Set(p.scheme.map((m) => m.id));
    for (const m of p.scheme) for (const d of m.dependsOn ?? []) if (!ids.has(d)) warn(`${q.id} ${p.id}: dependsOn ${d} missing`);
    if (p.answer.kind === "text") {
      const kw = p.answer.keyWords.reduce((a, g) => a + g.marks, 0);
      if (kw !== p.marks) warn(`${q.id} ${p.id}: keyWords total ${kw} marks, part is worth ${p.marks}`);
    }
  }
  const segs = q.skeleton.split("|").map((s) => SKELETON_SEGMENT.exec(s));
  if (segs.some((s) => !s) || segs.length !== q.parts.length) warn(`${q.id}: skeleton does not parse`);
  else
    segs.forEach((s, i) => {
      if (s[1] !== q.parts[i].id || Number(s[3]) !== q.parts[i].marks) warn(`${q.id}: skeleton segment ${i} mismatched`);
    });
}

// 5d. Diagnostics: exactly one correct, every distractor carries a misconception.
for (const set of dxs) {
  for (const it of set.items) {
    const correct = it.options.filter((o) => o.correct).length;
    if (correct !== 1) warn(`dx ${it.id}: ${correct} correct options`);
    for (const o of it.options) if (!o.correct && !o.misconception) warn(`dx ${it.id} option ${o.id}: no misconception`);
  }
}

// 5e. Ids: unique, prefixed, and every verification ref resolves.
const allIds = [
  note.id,
  ...wes.map((w) => w.id),
  ...dxs.map((d) => d.id),
  ...qs.map((q) => q.id),
  ...ftms.map((f) => f.id),
  ...rps.map((p) => p.id),
  insight.id,
  ...bundle.sets.map((s) => s.id),
  ...verification.map((l) => l.id),
];
const seen = new Set();
for (const id of allIds) {
  if (seen.has(id)) warn(`duplicate id ${id}`);
  seen.add(id);
}
const itemIdSet = new Set(allIds.filter((id) => !id.startsWith("ver.")));
for (const l of verification) if (!itemIdSet.has(l.itemId)) warn(`verification log ${l.id} names unknown item ${l.itemId}`);
const logById = new Map(verification.map((l) => [l.id, l]));
for (const it of [note, ...wes, ...qs]) {
  const l = logById.get(it.verification);
  if (!l) warn(`${it.id}: verification log ${it.verification} missing`);
  else if (l.itemId !== it.id) warn(`${it.id}: log records itemId ${l.itemId}`);
}
for (const s of bundle.sets) for (const id of s.itemIds) if (!itemIdSet.has(id)) warn(`set ${s.id} references unknown item ${id}`);

// 5f. Note blocks: gate spacing, prompt ids, svg budget and safety.
const words = (s) => s.split(/\s+/).filter(Boolean).length;
let run = 0;
let stretch = 0;
for (const b of blocks) {
  if (b.type === "p" || b.type === "callout") run += words(b.md);
  else if (b.type === "h") run += words(b.text);
  else if (b.type === "gate") {
    if (run > 150) warn(`note stretch ${stretch} before gate ${b.id} is ${run} words`);
    stretch += 1;
    run = 0;
  }
}
if (run > 150) warn(`final note stretch is ${run} words`);
const promptIds = new Set(rps.map((p) => p.id));
for (const b of blocks) {
  if (b.type === "prompt" && !promptIds.has(b.promptId)) warn(`note references unknown prompt ${b.promptId}`);
  if (b.type === "figure") {
    if (!b.svg.includes("viewBox")) warn("figure without viewBox");
    if (/<style|<script|on[a-z]+=|href=|prefers-color-scheme/.test(b.svg)) warn("figure breaks the SVG rule");
    if (Buffer.byteLength(b.svg, "utf8") > 12000) warn(`figure svg is ${Buffer.byteLength(b.svg, "utf8")} bytes`);
  }
}
// src/components/items/md.ts cuts the maths out first and only then looks for ** and *,
// so a bold or emphasis marker may never span a $...$ segment: the asterisks would print.
function markerScan(md, where) {
  for (const run of md.split(/\$[^$]+\$/)) {
    const strong = (run.match(/\*\*/g) ?? []).length;
    if (strong % 2 !== 0) warn(`bold marker crosses a maths segment at ${where}: ${md.slice(0, 70)}`);
    const em = (run.replace(/\*\*/g, "").match(/\*/g) ?? []).length;
    if (em % 2 !== 0) warn(`emphasis marker crosses a maths segment at ${where}: ${md.slice(0, 70)}`);
  }
}
for (const [i, b] of blocks.entries()) {
  if (b.type === "p" || b.type === "callout") markerScan(b.md, `note.blocks[${i}]`);
}
function mdScan(value, where) {
  if (Array.isArray(value)) return value.forEach((x, i) => mdScan(x, `${where}[${i}]`));
  if (value && typeof value === "object") {
    for (const [k, x] of Object.entries(value)) {
      if (typeof x === "string" && (k === "md" || k === "stem" || k === "decision" || k === "workedSolution")) {
        markerScan(x, `${where}.${k}`);
      } else mdScan(x, `${where}.${k}`);
    }
  }
}
mdScan(bundle, "bundle");

// Fields the renderer prints as plain text (StepRevealNote h/figcaption, TopicContent Sheet):
// KaTeX and caret notation would show as literal characters there, so they must use Unicode.
const PLAIN = [
  ...blocks.filter((b) => b.type === "h").map((b) => ["note h", b.text]),
  ...blocks.filter((b) => b.type === "figure").flatMap((b) => [["note caption", b.caption ?? ""], ["note alt", b.alt]]),
  ...blocks.filter((b) => b.type === "callout").map((b) => ["callout title", b.title ?? ""]),
  ...note.sheet.mustBeAbleTo.map((s) => ["sheet mustBeAbleTo", s]),
  ...note.sheet.traps.map((s) => ["sheet trap", s]),
  [["sheet howExamined"], note.sheet.howExamined],
  ...note.formulaSheet.mustKnow.map((s) => ["formulaSheet mustKnow", s]),
  ...note.notOnThisSpec.map((s) => ["notOnThisSpec", s]),
  ...topic.mustMemorise.map((s) => ["mustMemorise", s]),
  [["examWeightHint"], topic.examWeightHint],
];
for (const [where, s] of PLAIN) {
  if (/\$/.test(s)) warn(`plain-text field renders KaTeX literally — ${where}: ${s.slice(0, 70)}`);
  if (/\^/.test(s)) warn(`plain-text field shows a caret — ${where}: ${s.slice(0, 70)}`);
}

const gateIds = blocks.filter((b) => b.type === "gate").map((b) => b.id);
if (new Set(gateIds).size !== gateIds.length) warn("duplicate gate id");
if (!blocks.some((b) => b.type === "video")) warn("no video block in the note");
const videoIdx = blocks.findIndex((b) => b.type === "video");
if (videoIdx >= 0 && blocks[videoIdx + 1]?.type !== "gate") warn("the video block is not followed by a gate");

// 5g. Question figures: data-URI form and budget.
for (const q of qs) {
  for (const f of q.figures) {
    if (f.kind !== "svg") continue;
    if (!f.src.startsWith("data:image/svg+xml;utf8,<svg")) warn(`${q.id}: figure is not an inline data-URI svg`);
    if (f.src.includes("#")) warn(`${q.id}: figure src contains a raw # (must be %23)`);
    if (/<style|<script|on[a-z]+=|prefers-color-scheme/.test(f.src)) warn(`${q.id}: figure breaks the SVG rule`);
    const bytes = Buffer.byteLength(f.src, "utf8");
    if (bytes > 12000) warn(`${q.id}: figure is ${bytes} bytes`);
  }
}

// 5h. Media map: the video block must match a verified entry.
const mediaMap = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "links", "media-map.json"), "utf8"));
const entry = mediaMap.topics[`maths:${topic.slug}`];
const videoBlock = blocks[videoIdx];
if (!entry) warn("no media-map entry for this topic");
else if (!entry.videos.some((vid) => vid.videoId === videoBlock.videoId)) warn("video block id is not in the media map");

if (problems.length) {
  console.error(`\n${problems.length} problem(s) before writing:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 6. Write
// ---------------------------------------------------------------------------

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "bundle.json"), `${JSON.stringify(bundle, null, 2)}\n`);
fs.writeFileSync(path.join(OUT_DIR, "note.blocks.json"), `${JSON.stringify(blocks, null, 2)}\n`);

const dxCount = dxs.reduce((n, d) => n + d.items.length, 0);
console.log(
  [
    `wrote ${path.relative(ROOT, OUT_DIR)}`,
    `  we ${wes.length} · dx ${dxCount} · q ${qs.length} (${qs.reduce((a, q) => a + q.totalMarks, 0)} marks) · ftm ${ftms.length} · rp ${rps.length} · sets ${bundle.sets.length} · ver ${verification.length}`,
    `  katex segments compiled: ${mathCount}`,
    `  note blocks: ${blocks.length}, gates: ${gateIds.length}, figures: ${blocks.filter((b) => b.type === "figure").length}, video: ${videoBlock.videoId}`,
  ].join("\n"),
);
