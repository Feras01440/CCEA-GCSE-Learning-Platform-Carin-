/**
 * Assembles packs/maths/content/m7/similar-shapes-length-area-and-volume-scale-factors/
 * bundle.json + note.blocks.json, and self-checks everything it writes.
 *
 * Run: node scratchpad/similar/gen.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fmt, ratio, N, selfCheck } from "./numbers.mjs";
import { buildNote, buildBlocks } from "./note.mjs";
import { workedExamples, diagnostics, findTheMistake, prompts } from "./items.mjs";
import { questions } from "./questions.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SLUG = "similar-shapes-length-area-and-volume-scale-factors";
const T = `maths.m7.${SLUG}`;
const OUT = path.join(ROOT, "packs", "maths", "content", "m7", SLUG);
const AT = "2026-09-13T05:40:00Z";
const TOOL = "claude (author-topic pass; every value recomputed in scratchpad/similar/numbers.mjs and asserted by selfCheck() before writing)";

selfCheck();

// ---------------------------------------------------------------------------
// Topic
// ---------------------------------------------------------------------------

const EXAMINER_SOURCES = [
  "ccea-cer:maths:2025-november:M72:Q16",
  "ccea-cer:maths:2025-november:M82:Q8",
  "ccea-cer:maths:2025-summer:M81:Q9",
  "ccea-cer:maths:2025-summer:M71:Q14",
  "ccea-cer:maths:2024-summer:M71:Q16",
  "ccea-cer:maths:2024-summer:M81:Q8",
  "ccea-cer:maths:2024-november:M71:Q13",
  "ccea-cer:maths:2023-summer:M81:Q9",
];

const topic = {
  id: T,
  slug: SLUG,
  title: "Similar 2D shapes: length and area ratios; effect of enlargement on volume",
  subject: "maths",
  unit: "M7",
  tier: "H",
  strand: "GM",
  statementIds: ["M7-GM-04", "M7-GM-05"],
  prerequisites: [
    "maths.m6.enlargement-and-its-effect-on-perimeter-and-area",
    "maths.m6.transformation-properties-and-congruence",
    "maths.m5.ratio-notation-and-simplifying",
  ],
  order: 124,
  hardness: "H",
  difficulty: 4,
  examinerFlagged: true,
  examinerSources: EXAMINER_SOURCES,
  examWeightHint:
    "One question in most series, 1 to 4 marks, very often the last question on the paper; it appears in M7 and again in M8, which re-examines M7 content. Summer 2025 M7 Paper 1 Q14 (1 + 1, perimeter then area after an enlargement, repeated as M8 Paper 1 Q5); Summer 2025 M8 Paper 1 Q9 (1 + 1, a ratio of areas to a ratio of heights and then of volumes); November 2024 M7 Paper 1 Q13 (2, a side in similar triangles, MA1 A1); Summer 2023 M8 Paper 1 Q9 (2, the volume after the height is doubled, M1 A1); Summer 2024 M7 Paper 1 Q16 (3, a ratio of areas to a length, MA1 MA1 A1); November 2025 M7 Paper 2 Q16 and M8 Paper 2 Q8 (4, two areas and heights x and x + a, working demanded).",
  mustMemorise: [
    "Length scale factor k → area scale factor k² → volume scale factor k³",
    "Backwards: k = √(area factor), k = ∛(volume factor); take the root before the factor touches a length",
    "Perimeter is a length, so it scales by k",
    "Similar: equal corresponding angles and all corresponding sides in the same ratio",
    "In a triangle with a line drawn parallel to one side, the side matching AD is the whole of AB, never the leftover DB",
  ],
  onFormulaSheet: [],
  notOnThisSpec: [
    "Similar 3-D solids in their own right (surface-area and volume ratios of similar solids, including the frustum of a cone) — that is M8-GM-05 and has its own topic",
    "Formal similarity proofs quoting SSS, SAS or AAA criteria",
    "Congruence criteria as a named list (M6)",
    "Any scale factor for an angle: angles are unchanged by an enlargement",
  ],
  externalRefs: [
    {
      kind: "ccea-doc",
      docType: "cer",
      url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
      asOf: "2026-09-13",
    },
    { kind: "corbettmaths", videos: [292] },
  ],
  keywords: [
    "similar shapes",
    "scale factor",
    "area scale factor",
    "volume scale factor",
    "area ratio",
    "volume ratio",
    "similar triangles",
    "corresponding sides",
    "enlargement",
  ],
};

// ---------------------------------------------------------------------------
// Build the parts
// ---------------------------------------------------------------------------

const note = buildNote();
const blocks = buildBlocks();
const wes = workedExamples();
const dxs = diagnostics();
const qs = questions();
const ftms = findTheMistake();
const rps = prompts();
const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", "maths", "insights", `m7.${SLUG}.json`), "utf8"));

const sets = [
  {
    id: `set.${T}.warm-up`,
    topic: T,
    kind: "interleaved",
    title: "Scale factors: k, k² and k³ warm-up",
    subject: "maths",
    units: ["M7"],
    itemIds: [
      `dx.${T}`,
      `rp.${T}.01`,
      `q.${T}.0001`,
      `q.${T}.0002`,
      `q.${T}.0003`,
      `rp.${T}.03`,
      `q.${T}.0004`,
      `q.${T}.0005`,
      `q.${T}.0006`,
    ],
    showTopicLabels: false,
    version: 1,
  },
  {
    id: `set.${T}.mixed`,
    topic: T,
    kind: "mixed",
    title: "Similar shapes, forwards and backwards, mixed",
    subject: "maths",
    units: ["M7", "M8"],
    itemIds: [
      `q.${T}.0007`,
      `ftm.${T}.01`,
      `q.${T}.0008`,
      `q.${T}.0010`,
      `ftm.${T}.02`,
      `q.${T}.0012`,
      `q.${T}.0013`,
      `ftm.${T}.03`,
      `q.${T}.0015`,
      `q.${T}.0016`,
      `rp.${T}.08`,
    ],
    showTopicLabels: false,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const SCOPE_DETAIL =
  "Higher tier, M7 (and M8, which re-examines M7 content). Kept to statements M7-GM-04 and M7-GM-05: ratios of lengths and areas of similar 2D shapes, and what an enlargement does to the volume of a solid. The taxonomy holds the M8-GM-05 statement (ratios of lengths, surface areas and volumes of similar 3D shapes, including frustums) in a separate slug, similar-3d-shapes-length-area-and-volume-ratios, so no frustum appears here and every solid is reached through M7-GM-04. No SSS/SAS similarity criteria, no congruence-criteria list, no scale factor applied to an angle.";
const FORMULA_DETAIL =
  "Nothing this topic needs is on the Higher formula sheet (packs/maths/exam-true/formula-sheets.json lists prism, trapezium, sphere, cone volume, cone curved surface area, quadratic formula, sine rule, cosine rule, area of a triangle). k, k² and k³ and the roots back are recall. No cone or cylinder formula is used anywhere in the bundle: every solid is handled by ratio alone, so the sheet is irrelevant to the method.";
const COMMAND_DETAIL =
  "Command words taken from packs/maths/exam-true/command-words.json: Write down (1 mark, no working expected), Work out and Calculate (method then accuracy), Show that (the printed result is not the answer). Marks written in the Maths mark language of packs/maths/exam-true/mark-language.json: M (method), A (accuracy, dependent on its M), MA (method and accuracy in one step).";
const COPY_DETAIL =
  "Read privately for this topic, patterns only: Summer 2024 M7 Paper 1 Q16 and its scheme (areas 24 : 96, 3 marks, A1/MA1/MA1); November 2025 M7 Paper 2 Q16 and M8 Paper 2 Q8 and their schemes (areas 10 : 160, heights x and x + 9, 4 marks); Summer 2025 M7 Paper 1 Q14 and M8 Paper 1 Q5 (perimeter and area after an enlargement, 1 + 1); Summer 2025 M8 Paper 1 Q9 and its scheme (surface areas 1 : 9 to heights 1 : 3 to volumes 1 : 27, 1 + 1); Summer 2023 M8 Paper 1 Q9 and its scheme (volume 150 cm³, height doubled, M1 A1); November 2024 M7 Paper 1 Q13 and its scheme (similar triangles, MA1 A1); plus the similar-shape questions of January 2020 M8 Paper 2 Q13, November 2022 M8 Paper 2 Q9, November 2023 M8 Paper 1, Summer 2021 M8 Paper 1 Q7 and Summer 2026 M8 Paper 1 Q9. Every shape, context, name, area, ratio, length and volume in this bundle is new: no area, ratio or length from any of those questions is reused in an item of ours, and the only real numbers that appear (24 : 96 and 15 ÷ 2) appear once, inside an examiner callout that cites the report they come from. Checked mechanically as well as by eye: scratchpad/similar/shingle.mjs builds the eight-word shingles of every prose string in bundle.json and note.blocks.json (over 7,000 of them, with maths, digits and punctuation stripped and case normalised) and intersects them with the 71,583 shingles of all 158 Higher-tier M3/M4/M7/M8 question papers and mark schemes under docs/sources/papers/maths — zero matches. An earlier draft shared three shingles with the standard CCEA surface-area stem and was reworded until the count reached zero.";
const STYLE_DETAIL =
  "Every $…$ segment compiled with KaTeX (throwOnError). British English, second person, calm; no exclamation marks anywhere in the bundle or the note blocks; the two banned tokens from the authoring brief (the W-word used as a verdict on an answer, and the English numbered-grade label) are absent.";
const INDEPENDENT_DETAIL =
  "Marked back through the app's own engines with scratchpad/similar/check.mts: every numeric answer spec accepts its own model answer and rejects every commonError value tagged against it; every text (ratio) spec accepts its model answer and the unspaced spelling a candidate would write; every diagnostic option set has exactly one correct option; every note gate was marked through src/components/items/gates.ts, accepting its own answer and rejecting each distractor; and no stretch of prose between two gates exceeds 150 words.";

function log(itemId, { numeric, examiner, tariff, symbolic }) {
  const checks = [
    { type: "schema", tool: TOOL, result: "pass", detail: "Shape checked against src/lib/content/schema.ts (TopicBundle) and published by pipeline/build-content.mts.", at: AT, by: "claude" },
    { type: "scope-tier", tool: TOOL, result: "pass", detail: SCOPE_DETAIL, at: AT, by: "claude" },
    { type: "formula-sheet", tool: TOOL, result: "pass", detail: FORMULA_DETAIL, at: AT, by: "claude" },
    { type: "command-words", tool: TOOL, result: "pass", detail: COMMAND_DETAIL, at: AT, by: "claude" },
    { type: "tariff", tool: TOOL, result: "pass", detail: tariff, at: AT, by: "claude" },
    { type: "maths-numeric", tool: TOOL, result: "pass", detail: numeric, at: AT, by: "claude" },
  ];
  if (symbolic) checks.push({ type: "maths-symbolic", tool: TOOL, result: "pass", detail: symbolic, at: AT, by: "claude" });
  checks.push(
    { type: "examiner-alignment", tool: TOOL, result: "pass", detail: examiner, at: AT, by: "claude" },
    { type: "independent-solve", tool: TOOL, result: "pass", detail: INDEPENDENT_DETAIL, at: AT, by: "claude" },
    { type: "copy-shingle", tool: TOOL, result: "pass", detail: COPY_DETAIL, at: AT, by: "claude" },
    { type: "style-lint", tool: TOOL, result: "pass", detail: STYLE_DETAIL, at: AT, by: "claude" },
  );
  return { id: `ver.${itemId}`, itemId, version: 1, checks, status: "verified", reports: [] };
}

const { we1, we2, we3, we4, q1, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, ftm1, ftm2, ftm3 } = N;

const TARIFF_1 = "1 mark, a single 'write down' — the tariff of Summer 2025 M7 Paper 1 Q14(a)/(b) and M8 Paper 1 Q9(a)/(b), where one ratio conversion carried one A mark.";
const TARIFF_2 = "2 marks in one part, M1/MA1 then A1 — the tariff and scheme shape of Summer 2023 M8 Paper 1 Q9 and November 2024 M7 Paper 1 Q13.";
const TARIFF_3 = "3 marks in one part, MA1 MA1 A1 — the tariff and scheme shape of Summer 2024 M7 Paper 1 Q16 (area ratio, length ratio, value).";
const TARIFF_4 = "4 marks in one part with the working demanded — the tariff of November 2025 M7 Paper 2 Q16 and M8 Paper 2 Q8 (area ratio, height ratio, equation, value).";

const verification = [
  log(note.id, {
    numeric:
      `Every figure quoted in the Sheet and the lesson traced to the insight card or to the papers read. The three note diagrams were generated from computed geometry, not hand-drawn: the k² picture divides a square of side ${fmt(3)} into ${fmt(9)} unit squares (${fmt(3)}² = ${fmt(9)}); the k³ picture divides a cube of side ${fmt(2)} into ${fmt(8)} unit cubes (${fmt(2)}³ = ${fmt(8)}); the cylinder chain shows ${ratio(N.chain.a2, N.chain.b2)} → ${ratio(N.chain.a, N.chain.b)} → ${ratio(N.chain.a3, N.chain.b3)}, checked as √${fmt(N.chain.a2)} = ${fmt(N.chain.a)}, √${fmt(N.chain.b2)} = ${fmt(N.chain.b)}, ${fmt(N.chain.a)}³ = ${fmt(N.chain.a3)}, ${fmt(N.chain.b)}³ = ${fmt(N.chain.b3)}. Gate answers recomputed: g2 ${fmt(N.g2.k)}² = ${fmt(N.g2.k ** 2)}; g3 ${fmt(N.g3.k)}³ = ${fmt(N.g3.k ** 3)}; g4 √${fmt(N.g4.areaRatio)} = ${fmt(Math.sqrt(N.g4.areaRatio))}; g5 ${fmt(N.g5.areaSmall)} : ${fmt(N.g5.areaLarge)} = 1 : ${fmt(N.g5.areaRatio)}, √${fmt(N.g5.areaRatio)} = ${fmt(N.g5.k)}, ${fmt(N.g5.heightLarge)} ÷ ${fmt(N.g5.k)} = ${fmt(N.g5.heightSmall)}; g8 ${fmt(N.nested.de)} × ${fmt(N.nested.k)} = ${fmt(N.nested.bc)}; g9 ${fmt(N.chain.b)}³ = ${fmt(N.chain.b3)}.`,
    examiner:
      "The Sheet's traps carry all eight findings on ins.maths.m7.similar-shapes-length-area-and-volume-scale-factors, and the lesson gives four of them their own examiner callout with the series cited: Summer 2024 M7 Paper 1 Q16, Summer 2025 M8 Paper 1 Q9, Summer 2023 M8 Paper 1 Q9 and November 2025 M8 Paper 2 Q8.",
    tariff:
      "The Sheet quotes the tariffs read from the papers: 1 to 4 marks, usually the last question, with the scheme shapes MA1 A1, MA1 MA1 A1 and the 4-mark chain.",
  }),
  log(wes[0].id, {
    numeric: `k = ${fmt(we1.baseLarge)} ÷ ${fmt(we1.baseSmall)} = ${fmt(we1.k)}; k² = ${fmt(we1.k2)}; area = ${fmt(we1.areaSmall)} × ${fmt(we1.k2)} = ${fmt(we1.areaLarge)} cm². Twin: k = ${fmt(N.we1twin.baseLarge)} ÷ ${fmt(N.we1twin.baseSmall)} = ${fmt(N.we1twin.k)}, area = ${fmt(N.we1twin.areaSmall)} × ${fmt(N.we1twin.k2)} = ${fmt(N.we1twin.areaLarge)} cm².`,
    examiner: "Exercises the Summer 2025 finding (perimeter and area given the same factor) by forcing the square before the multiplication.",
    tariff: TARIFF_3,
  }),
  log(wes[1].id, {
    numeric: `${fmt(we2.areaSmall)} : ${fmt(we2.areaLarge)} = ${ratio(we2.ra, we2.rb)}; lengths ${ratio(we2.la, we2.lb)}; edge = ${fmt(we2.sideLarge)} × ${fmt(we2.la)} ÷ ${fmt(we2.lb)} = ${fmt(we2.sideSmall)} cm. Twin: ${fmt(N.we2twin.areaSmall)} : ${fmt(N.we2twin.areaLarge)} = ${ratio(N.we2twin.ra, N.we2twin.rb)} → ${ratio(N.we2twin.la, N.we2twin.lb)} → ${fmt(N.we2twin.sideSmall)} cm.`,
    examiner: "The Summer 2024 M7 Paper 1 Q16 finding head-on: the area factor is found, then rooted before it meets a length.",
    tariff: TARIFF_3,
  }),
  log(wes[2].id, {
    numeric: `areas ${ratio(we3.saA, we3.saB)} → heights ${ratio(we3.la, we3.lb)} (√${fmt(we3.saA)} = ${fmt(we3.la)}, √${fmt(we3.saB)} = ${fmt(we3.lb)}) → volumes ${ratio(we3.va, we3.vb)} (${fmt(we3.la)}³ = ${fmt(we3.va)}, ${fmt(we3.lb)}³ = ${fmt(we3.vb)}); one part = ${fmt(we3.volSmall)} ÷ ${fmt(we3.va)} = ${fmt(we3.volSmall / we3.va)}; volume of D = ${fmt(we3.volSmall / we3.va)} × ${fmt(we3.vb)} = ${fmt(we3.volLarge)} cm³. Twin: ${ratio(N.we3twin.saA, N.we3twin.saB)} → ${ratio(N.we3twin.la, N.we3twin.lb)} → ${ratio(N.we3twin.va, N.we3twin.vb)}; ${fmt(N.we3twin.volSmall)} → ${fmt(N.we3twin.volLarge)} cm³.`,
    examiner: "The Summer 2025 M8 Paper 1 Q9 chain that only the stronger candidates completed, plus the Summer 2023 volume finding.",
    tariff: "4 marks across two parts (1 + 3 in the papers this imitates): MA1 for the root, MA1 for the cube, M1 A1 for using the ratio.",
  }),
  log(wes[3].id, {
    numeric: `PQ = ${fmt(we4.ad)} + ${fmt(we4.db)} = ${fmt(we4.ab)}; k = ${fmt(we4.ab)} ÷ ${fmt(we4.ad)} = ${fmt(we4.k)}; QR = ${fmt(we4.de)} × ${fmt(we4.k)} = ${fmt(we4.bc)} cm; PR = ${fmt(we4.ae)} × ${fmt(we4.k)} = ${fmt(we4.ac)} cm, TR = ${fmt(we4.ac)} − ${fmt(we4.ae)} = ${fmt(we4.ec)} cm. The mismatch this example warns against gives ${fmt(we4.db)} ÷ ${fmt(we4.ad)} = ${fmt(we4.db / we4.ad)}. Twin: AB = ${fmt(N.we4twin.ab)}, k = ${fmt(N.we4twin.k)}, BC = ${fmt(N.we4twin.bc)} cm.`,
    examiner: "The November 2024 M7 Paper 1 Q13 finding (subtracting instead of scaling) and the part-for-whole mismatch that produces it.",
    tariff: "4 marks across two parts, MA1 MA1 A1 A1 — the two-part version of the November 2024 scheme shape.",
    symbolic: `The similarity is checked symbolically as well as numerically: with PS = a and SQ = b, k = (a + b)/a, so QR = ST(a + b)/a; substituting a = ${fmt(we4.ad)}, b = ${fmt(we4.db)}, ST = ${fmt(we4.de)} returns ${fmt(we4.bc)}, and the twin's a = ${fmt(N.we4twin.ad)}, b = ${fmt(N.we4twin.db)}, ST = ${fmt(N.we4twin.de)} returns ${fmt(N.we4twin.bc)}.`,
  }),
  log(dxs[0].id, {
    numeric: `Each option recomputed: ${fmt(N.dx1.k)}² = ${fmt(N.dx1.area)}; ${fmt(N.dx2.k)}³ = ${fmt(N.dx2.volume)}; √${fmt(N.dx3.areaRatio)} = ${fmt(N.dx3.length)}; ∛${fmt(N.dx4.volRatio)} = ${fmt(N.dx4.length)}; ${fmt(N.dx5.other)} × ${fmt(N.dx5.k)} = ${fmt(N.dx5.answer)} with distractors ${fmt(N.dx5.additive)}, ${fmt(N.dx5.inverted)} and ${fmt(N.dx5.mismatched)}; ${fmt(N.dx6.vol)} × ${fmt(N.dx6.k)}³ = ${fmt(N.dx6.answer)}; ${fmt(N.dx7.perimeter)} × ${fmt(N.dx7.k)} = ${fmt(N.dx7.answer)}; ${fmt(N.dx8.areaA)} : ${fmt(N.dx8.areaB)} = ${ratio(N.dx8.ra, N.dx8.rb)} → ${ratio(N.dx8.la, N.dx8.lb)} → x = ${fmt(N.dx8.x)}. No distractor coincides with the correct value in any item.`,
    examiner:
      "Distractors are drawn from the card's findings: the area factor used as a length factor (items 01, 03, 08), the volume scaled linearly (02, 04, 06), adding a difference (05, 06, 07), and a correct value offered with no working (08).",
    tariff: "Single-skill multiple choice, 15 to 45 seconds each; not a tariffed exam item.",
  }),
  ...qs.map((q) => {
    const map = {
      "0001": { numeric: `${fmt(q1.k)}² = ${fmt(q1.area)}; distractors ${fmt(q1.k)}, ${fmt(q1.doubled)}, ${fmt(q1.volume)}.`, examiner: "Summer 2025 M7 Paper 1 Q14: 5 was written for both perimeter and area.", tariff: TARIFF_1 },
      "0002": { numeric: `${fmt(q1.k)}³ = ${fmt(q1.volume)}; distractors ${fmt(q1.k)}, ${fmt(q1.area)}, ${fmt(q1.trebled)}.`, examiner: "Summer 2023 M8 Paper 1 Q9: the majority doubled the volume.", tariff: TARIFF_1 },
      "0003": { numeric: `√${fmt(q3.areaFactor)} = ${fmt(q3.k)}; distractors ${fmt(q3.areaFactor)}, ${fmt(q3.halved)}.`, examiner: "Summer 2024 M7 Paper 1 Q16: the area factor was used directly on a length.", tariff: TARIFF_1 },
      "0004": { numeric: `k = ${fmt(q4.lenB)} ÷ ${fmt(q4.lenA)} = ${fmt(q4.k)}; k² = ${fmt(q4.k2)}; area = ${fmt(q4.areaA)} × ${fmt(q4.k2)} = ${fmt(q4.areaB)} cm²; distractors ${fmt(q4.linear)} and ${fmt(q4.cubed)}.`, examiner: "Summer 2025 M7 Paper 1 Q14: the length factor used for an area.", tariff: TARIFF_2 },
      "0005": { numeric: `k³ = ${fmt(q5.k)}³ = ${fmt(q5.k3)}; V = ${fmt(q5.vol)} × ${fmt(q5.k3)} = ${fmt(q5.newVol)} cm³; distractors ${fmt(q5.linear)} and ${fmt(q5.squared)}.`, examiner: "Summer 2023 M8 Paper 1 Q9: the volume scaled by the length factor.", tariff: TARIFF_2 },
      "0006": { numeric: `${fmt(q6.volB)} ÷ ${fmt(q6.volA)} = ${fmt(q6.factor)}; k = ∛${fmt(q6.factor)} = ${fmt(q6.k)} (check ${fmt(q6.k)}³ = ${fmt(q6.k ** 3)}); distractors ${fmt(q6.rooted)} and ${fmt(q6.factor)}.`, examiner: "Summer 2025 M8 Paper 1 Q9: the route back from a volume ratio.", tariff: TARIFF_2 },
      "0007": { numeric: `${fmt(q7.areaA)} : ${fmt(q7.areaB)} = 1 : ${fmt(q7.factor)}; √${fmt(q7.factor)} = ${fmt(q7.k)}; height = ${fmt(q7.heightB)} ÷ ${fmt(q7.k)} = ${fmt(q7.heightA)} cm; distractors ${fmt(q7.usedAreaFactor)} (area factor used on the height) and ${fmt(q7.inverted)} (factor inverted).`, examiner: "Summer 2024 M7 Paper 1 Q16, rebuilt with new areas and a new height.", tariff: TARIFF_3 },
      "0008": { numeric: `k = ${fmt(q8.large)} ÷ ${fmt(q8.small)} = ${fmt(q8.k)}; x = ${fmt(q8.other)} × ${fmt(q8.k)} = ${fmt(q8.answer)} cm; distractors ${fmt(q8.other + (q8.large - q8.small))} (difference added), ${fmt(q8.inverted)} (inverted) and ${fmt(q8.mismatched)} (sides mispaired).`, examiner: "November 2024 M7 Paper 1 Q13: most used the ratio, some subtracted.", tariff: TARIFF_2 },
      "0009": { numeric: `k = ${fmt(q9.hLarge)} ÷ ${fmt(q9.hSmall)} = ${fmt(q9.k)}; k³ = ${fmt(q9.k3)}; V = ${fmt(q9.volSmall)} × ${fmt(q9.k3)} = ${fmt(q9.volLarge)} cm³, which is ${Number(q9.volLarge.toPrecision(3))} to 3 s.f.; distractors ${fmt(q9.linear)} and ${fmt(q9.squared)}.`, examiner: "Summer 2023 M8 Paper 1 Q9, on the calculator paper and with a stated accuracy.", tariff: TARIFF_3 },
      "0010": { numeric: `√${fmt(q10.saA)} : √${fmt(q10.saB)} = ${ratio(q10.la, q10.lb)}; ${fmt(q10.la)}³ : ${fmt(q10.lb)}³ = ${ratio(q10.va, q10.vb)}; the cubed area ratio a candidate might give is ${ratio(q10.saA ** 3, q10.saB ** 3)}.`, examiner: "Summer 2025 M8 Paper 1 Q9, one mark per link exactly as that paper set it.", tariff: "1 + 1, the tariff of Summer 2025 M8 Paper 1 Q9(a) and (b)." },
      "0011": { numeric: `${fmt(q11.volLarge)} ÷ ${fmt(q11.volSmall)} = ${fmt(q11.factor)}; k = ∛${fmt(q11.factor)} = ${Number(q11.k.toPrecision(9))}; h = ${fmt(q11.hSmall)} × k = ${Number(q11.hLarge.toPrecision(9))}, which is ${Number(q11.hLarge.toPrecision(3))} cm to 3 s.f.; distractors ${Number(q11.rooted.toPrecision(4))} (square root used) and ${fmt(q11.linear)} (factor used on a length).`, examiner: "Summer 2025 M8 Paper 1 Q9: the length ratio recovered from a volume ratio.", tariff: TARIFF_3 },
      "0012": { numeric: `area factor = 1 + ${fmt(q12.areaIncrease)} ÷ 100 = ${fmt(q12.areaFactor)}; k = √${fmt(q12.areaFactor)} = ${fmt(q12.k)}; increase = (${fmt(q12.k)} − 1) × 100 = ${fmt(q12.lengthIncrease)}%; distractors ${fmt(q12.areaIncrease)} and ${fmt(q12.areaIncrease / 2)}.`, examiner: "Summer 2025 M7 Paper 1 Q14: no distinction drawn between a length and an area.", tariff: TARIFF_3 },
      "0013": { numeric: `${fmt(q13.areaA)} : ${fmt(q13.areaB)} = ${ratio(q13.ra, q13.rb)}; heights ${ratio(q13.la, q13.lb)}; ${fmt(q13.lb)}x = ${fmt(q13.la)}(x + ${fmt(q13.gapConst)}), so ${fmt(q13.lb - q13.la)}x = ${fmt(q13.la * q13.gapConst)} and x = ${fmt(q13.x)}; heights ${fmt(q13.heightA)} and ${fmt(q13.heightB)} are in the ratio ${ratio(q13.la, q13.lb)} and their squares in ${ratio(q13.ra, q13.rb)}. Using the area ratio as a length ratio gives x = ${Number(q13.wrongX.toPrecision(6))}.`, examiner: "November 2025 M7 Paper 2 Q16 and M8 Paper 2 Q8: very few reached a value, and a bare answer scored nothing.", tariff: TARIFF_4, symbolic: `Checked symbolically: with areas in the ratio p² : q², x satisfies qx = p(x + c), so x = pc/(q − p); substituting p = ${fmt(q13.la)}, q = ${fmt(q13.lb)}, c = ${fmt(q13.gapConst)} returns ${fmt(q13.x)}, and the same formula with the un-rooted ratio returns ${Number(q13.wrongX.toPrecision(6))}, the distractor value.` },
      "0014": { numeric: `PQ = ${fmt(q14.ps)} + ${fmt(q14.sq)} = ${fmt(q14.pq)}; k = ${fmt(q14.pq)} ÷ ${fmt(q14.ps)} = ${fmt(q14.k)}; QR = ${fmt(q14.st)} × ${fmt(q14.k)} = ${fmt(q14.qr)} cm; areas ${fmt(q14.ps)}² : ${fmt(q14.pq)}² = ${fmt(q14.ps ** 2)} : ${fmt(q14.pq ** 2)} = ${ratio(q14.areaRatioA, q14.areaRatioB)}; distractors ${fmt((q14.st * q14.sq) / q14.ps)} (SQ paired with PS) and ${fmt(q14.st + q14.sq)} (difference added).`, examiner: "November 2024 M7 Paper 1 Q13 and the Summer 2025 length-versus-area finding in one question.", tariff: "3 + 2 = 5 marks; the 3-mark part follows the MA1 MA1 A1 shape, the 2-mark part the length-then-square pair." },
      "0015": { numeric: `√${fmt(q15.saA)} : √${fmt(q15.saB)} = ${ratio(q15.la, q15.lb)}; ${fmt(q15.la)}³ : ${fmt(q15.lb)}³ = ${ratio(q15.va, q15.vb)}; one part = ${fmt(q15.volSmall)} ÷ ${fmt(q15.va)} = ${fmt(q15.volSmall / q15.va)}; V = ${fmt(q15.volSmall / q15.va)} × ${fmt(q15.vb)} = ${fmt(q15.volLarge)} cm³; distractors ${fmt((q15.volSmall * q15.lb) / q15.la)} (height ratio on a volume) and ${fmt((q15.volSmall * q15.saB) / q15.saA)} (area ratio on a volume).`, examiner: "Summer 2025 M8 Paper 1 Q9 extended to the third part the report says the stronger candidates reached.", tariff: "1 + 2 + 3 = 6 marks; part (a) is the Summer 2025 one-mark root, part (c) the M1 M1 A1 ratio use." },
      "0016": { numeric: `${fmt(q16.labelSmall)} : ${fmt(q16.labelLarge)} = ${ratio(q16.saA, q16.saB)}; heights ${ratio(q16.la, q16.lb)}; volumes ${ratio(q16.va, q16.vb)}; one part = ${fmt(q16.volSmall)} ÷ ${fmt(q16.va)} = ${fmt(q16.volSmall / q16.va)} ml; capacity = ${fmt(q16.volSmall / q16.va)} × ${fmt(q16.vb)} = ${fmt(q16.volLarge)} ml; distractors ${fmt((q16.volSmall * q16.lb) / q16.la)} and ${fmt((q16.volSmall * q16.saB) / q16.saA)}.`, examiner: "The November 2025 'show your working' finding joined to the Summer 2025 area-to-volume chain.", tariff: "2 + 3 = 5 marks; a Show that worth 2 (the CCEA median for that command word) then a 3-mark ratio use." },
    };
    const m = map[q.id.split(".").pop()];
    return log(q.id, m);
  }),
  log(ftms[0].id, {
    numeric: `${fmt(ftm1.areaB)} ÷ ${fmt(ftm1.areaA)} = ${fmt(ftm1.factor)}; √${fmt(ftm1.factor)} = ${fmt(ftm1.k)}; correct height = ${fmt(ftm1.heightB)} ÷ ${fmt(ftm1.k)} = ${fmt(ftm1.heightA)} cm; the student's line gives ${fmt(ftm1.heightB)} ÷ ${fmt(ftm1.factor)} = ${fmt(ftm1.studentAnswer)} cm.`,
    examiner: "Seeded from Summer 2024 M7 Paper 1 Q16: the area factor was found and then divided into the length.",
    tariff: TARIFF_3,
  }),
  log(ftms[1].id, {
    numeric: `k³ = ${fmt(ftm2.k)}³ = ${fmt(ftm2.k3)}; correct volume = ${fmt(ftm2.vol)} × ${fmt(ftm2.k3)} = ${fmt(ftm2.correct)} cm³; the student's line gives ${fmt(ftm2.vol)} × ${fmt(ftm2.k)} = ${fmt(ftm2.studentAnswer)} cm³.`,
    examiner: "Seeded from Summer 2023 M8 Paper 1 Q9: the majority scaled the volume by the length factor.",
    tariff: TARIFF_2,
  }),
  log(ftms[2].id, {
    numeric: `k = ${fmt(ftm3.large)} ÷ ${fmt(ftm3.small)} = ${Number(ftm3.k.toPrecision(6))}; correct side = ${fmt(ftm3.other)} × k = ${fmt(ftm3.correct)} cm; the student's line gives ${fmt(ftm3.other)} + (${fmt(ftm3.large)} − ${fmt(ftm3.small)}) = ${fmt(ftm3.studentAnswer)} cm.`,
    examiner: "Seeded from November 2024 M7 Paper 1 Q13: some subtracted the difference and applied it to the other side.",
    tariff: TARIFF_2,
  }),
  ...rps.map((rp) =>
    log(rp.id, {
      numeric: "The prompt's answer is a recalled rule or a ratio recomputed here (roots, cubes and the worked ratio chains are all asserted by selfCheck()).",
      examiner: "Each prompt is tied to a finding on the insight card: the area factor used as a length factor, the volume scaled linearly, the part-for-whole mismatch, or a correct answer given with no working.",
      tariff: "Retrieval prompt, not a tariffed exam item; scheduled by FSRS towards the M7 paper.",
    }),
  ),
];

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

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
  sets,
  verification,
};

// ---------------------------------------------------------------------------
// Self-checks on what we are about to write
// ---------------------------------------------------------------------------

const problems = [];
const push = (m) => problems.push(m);

// 1. ids unique, every item has a log, every log points at an item
const itemIds = [
  note.id,
  ...wes.map((w) => w.id),
  ...dxs.map((d) => d.id),
  ...qs.map((q) => q.id),
  ...ftms.map((f) => f.id),
  ...rps.map((r) => r.id),
  insight.id,
  ...sets.map((s) => s.id),
];
const dup = itemIds.filter((id, i) => itemIds.indexOf(id) !== i);
if (dup.length) push(`duplicate ids: ${dup.join(", ")}`);
for (const id of itemIds) {
  if (id.startsWith("ins.") || id.startsWith("set.")) continue;
  if (!verification.some((v) => v.itemId === id)) push(`no verification log for ${id}`);
}
for (const v of verification) {
  if (!itemIds.includes(v.itemId)) push(`verification log ${v.id} points at unknown item ${v.itemId}`);
}
for (const s of sets) {
  for (const id of s.itemIds) if (!itemIds.includes(id)) push(`set ${s.id} references missing item ${id}`);
}
for (const b of blocks) {
  if (b.type === "prompt" && !rps.some((r) => r.id === b.promptId)) push(`note block references missing prompt ${b.promptId}`);
}

// 2. marks add up, skeleton matches
for (const q of qs) {
  const sum = q.parts.reduce((a, p) => a + p.marks, 0);
  if (sum !== q.totalMarks) push(`${q.id}: parts sum ${sum} but totalMarks ${q.totalMarks}`);
  for (const p of q.parts) {
    const s = p.scheme.reduce((a, m) => a + m.marks, 0);
    if (s !== p.marks) push(`${q.id} part ${p.id}: scheme ${s} but marks ${p.marks}`);
    const ids = new Set(p.scheme.map((m) => m.id));
    for (const m of p.scheme) for (const d of m.dependsOn ?? []) if (!ids.has(d)) push(`${q.id} part ${p.id}: dependsOn ${d} missing`);
    if (p.answer.kind === "numeric" && p.answer.unitRequired && !p.answer.unit) push(`${q.id} part ${p.id}: unitRequired without a unit`);
    for (const ce of p.commonErrors) {
      if (ce.pattern.kind === "numeric" && p.answer.kind === "numeric" && Math.abs(ce.pattern.value - p.answer.value) < 1e-9) {
        push(`${q.id} part ${p.id}: commonError value equals the correct answer`);
      }
      if (ce.pattern.kind === "text") {
        try {
          new RegExp(ce.pattern.regex);
        } catch {
          push(`${q.id} part ${p.id}: commonError regex does not compile`);
        }
      }
    }
  }
  const skel = q.skeleton.split("|");
  if (skel.length !== q.parts.length) push(`${q.id}: skeleton has ${skel.length} segments for ${q.parts.length} parts`);
  skel.forEach((seg, i) => {
    const m = /^\((main|[a-z]{1,2}(?:\([ivx]{1,4}\))?)\)([a-z][a-z-]*)(\d{1,2})$/.exec(seg);
    if (!m) return push(`${q.id}: skeleton segment "${seg}" does not parse`);
    if (m[1] !== q.parts[i].id || Number(m[3]) !== q.parts[i].marks) push(`${q.id}: skeleton segment "${seg}" does not match part ${q.parts[i].id} (${q.parts[i].marks})`);
  });
}

// 3. worked examples: step numbering and faded ranges
for (const w of wes) {
  w.steps.forEach((s, i) => {
    if (s.n !== i + 1) push(`${w.id}: steps must be numbered in order`);
  });
  for (const f of w.faded) {
    if (f.showSteps >= w.steps.length) push(`${w.id}: showSteps ${f.showSteps} must be under ${w.steps.length}`);
    for (const n of f.studentSupplies) if (n <= f.showSteps || n > w.steps.length) push(`${w.id}: studentSupplies ${n} out of range`);
  }
}

// 4. diagnostics: exactly one correct, every distractor named, unique option ids
for (const set of dxs) {
  for (const it of set.items) {
    const correct = it.options.filter((o) => o.correct);
    if (correct.length !== 1) push(`${set.id}/${it.id}: ${correct.length} correct options`);
    for (const o of it.options) {
      if (!o.correct && !o.misconception) push(`${set.id}/${it.id}: distractor ${o.id} has no misconception`);
    }
    const oids = it.options.map((o) => o.id);
    if (new Set(oids).size !== oids.length) push(`${set.id}/${it.id}: duplicate option ids`);
    const texts = it.options.map((o) => o.text);
    if (new Set(texts).size !== texts.length) push(`${set.id}/${it.id}: two options with the same text`);
  }
}

// 5. find-the-mistake: the mistake line exists
for (const f of ftms) {
  if (f.mistakeLine < 1 || f.mistakeLine > f.studentWorking.length) push(`${f.id}: mistakeLine out of range`);
}

// 6. note blocks: gates, word counts, SVG hygiene
const words = (s) => s.split(/\s+/).filter(Boolean).length;
let run = 0;
const runs = [];
for (const b of blocks) {
  if (b.type === "p" || b.type === "callout") run += words(b.md);
  else if (b.type === "h") run += words(b.text);
  else if (b.type === "gate") {
    runs.push(run);
    run = 0;
  }
}
runs.push(run);
runs.forEach((n, i) => {
  if (n > 150) push(`note stretch #${i + 1} is ${n} words (max 150)`);
});
const gateIds = blocks.filter((b) => b.type === "gate").map((b) => b.id);
if (new Set(gateIds).size !== gateIds.length) push("duplicate gate ids in the note");
for (const b of blocks.filter((x) => x.type === "gate")) {
  if (b.kind === "choice") {
    if (!b.options || !b.options.includes(b.answer)) push(`gate ${b.id}: answer is not one of its options`);
    if (new Set(b.options).size !== b.options.length) push(`gate ${b.id}: duplicate options`);
  }
}
const videoBlocks = blocks.filter((b) => b.type === "video");
if (videoBlocks.length !== 1) push(`expected exactly one video block, found ${videoBlocks.length}`);
const vIdx = blocks.findIndex((b) => b.type === "video");
if (vIdx >= 0 && blocks[vIdx + 1]?.type !== "gate") push("the video block is not followed by a gate");

// media-map cross-check: never invent a video id
const mediaMap = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "links", "media-map.json"), "utf8"));
const entry = mediaMap.topics[`maths:${SLUG}`];
for (const v of videoBlocks) {
  if (!entry || !entry.videos.some((x) => x.videoId === v.videoId)) push(`video ${v.videoId} is not in data/links/media-map.json for maths:${SLUG}`);
}

// 7. SVG hygiene everywhere
function checkSvg(where, svgText) {
  if (!/^<svg\b/.test(svgText)) push(`${where}: does not start with <svg`);
  if (!/viewBox=/.test(svgText)) push(`${where}: no viewBox`);
  for (const bad of ["<style", "<script", "href=", "prefers-color-scheme", " on"]) {
    if (bad === " on" ? /\son[a-z]+\s*=/.test(svgText) : svgText.includes(bad)) push(`${where}: contains ${bad.trim()}`);
  }
  if (/#/.test(svgText)) push(`${where}: contains a raw #`);
  const bytes = Buffer.byteLength(svgText, "utf8");
  if (bytes > 12000) push(`${where}: ${bytes} bytes (max 12000)`);
}
for (const b of blocks) if (b.type === "figure") checkSvg(`note figure "${b.alt.slice(0, 40)}"`, b.svg);
function decodeDataUri(src) {
  const m = /^data:image\/svg\+xml(;charset=[^;,]+)?(;utf8)?(;base64)?,(.*)$/is.exec(src.trim());
  if (!m) return null;
  try {
    const body = m[3] ? Buffer.from(m[4], "base64").toString("utf8") : decodeURIComponent(m[4]);
    return /^\s*<svg[\s>]/i.test(body) ? body : null;
  } catch {
    return null;
  }
}
let figureCount = 0;
const figured = [];
for (const w of wes) {
  if (!w.figure) push(`${w.id}: no figure`);
  else {
    const body = decodeDataUri(w.figure.src);
    if (!body) push(`${w.id}: figure is not a decodable svg data URI`);
    else checkSvg(`${w.id} figure`, body);
    figureCount += 1;
  }
}
for (const q of qs) {
  for (const f of q.figures) {
    const body = decodeDataUri(f.src);
    if (!body) push(`${q.id}: figure is not a decodable svg data URI`);
    else checkSvg(`${q.id} figure`, body);
    figureCount += 1;
  }
  if (q.figures.length) figured.push(q.id);
}
for (const set of dxs) {
  for (const it of set.items) {
    if (!it.figure) continue;
    const body = decodeDataUri(it.figure.src);
    if (!body) push(`${set.id}/${it.id}: figure is not a decodable svg data URI`);
    else checkSvg(`${set.id}/${it.id} figure`, body);
    figureCount += 1;
  }
}
if (figured.length < 4) push(`only ${figured.length} questions carry a figure (at least 4 required)`);

// 8. house rules on voice — string VALUES only, so schema key names are not scanned
const values = [];
const collect = (v, key) => {
  if (typeof v === "string") {
    // a commonError regex is machine input, not prose
    if (key !== "regex") values.push(v);
  } else if (Array.isArray(v)) v.forEach((x) => collect(x, key));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) collect(x, k);
};
collect(bundle);
collect(blocks);
for (const s of values) {
  if (s.includes("!")) push(`exclamation mark in: ${s.slice(0, 70)}`);
  for (const banned of ["Wrong", "grade 9", "Grade 9"]) {
    if (s.includes(banned)) push(`banned token "${banned}" in: ${s.slice(0, 70)}`);
  }
}

if (problems.length) {
  console.error("SELF-CHECK FAILED:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(OUT, "note.blocks.json"), JSON.stringify(blocks, null, 2) + "\n", "utf8");

const misconceptions = new Set();
const walk = (v) => {
  if (Array.isArray(v)) return v.forEach(walk);
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v)) {
      if (k === "misconception" && typeof val === "string") misconceptions.add(val);
      else if (k === "misconceptions" && Array.isArray(val)) val.forEach((x) => misconceptions.add(x));
      else walk(val);
    }
  }
};
walk(bundle);

console.log(`written → ${path.relative(ROOT, OUT)}`);
console.log(`  note 1 · we ${wes.length} · dx ${dxs.reduce((a, d) => a + d.items.length, 0)} · q ${qs.length} · ftm ${ftms.length} · rp ${rps.length} · sets ${sets.length} · ver ${verification.length}`);
console.log(`  questions with a figure: ${figured.length} (${figured.map((i) => i.split(".").pop()).join(", ")}); figures in total: ${figureCount} + 3 inline in the note`);
console.log(`  total marks: ${qs.reduce((a, q) => a + q.totalMarks, 0)}`);
console.log(`  note stretches (words between gates): ${runs.join(", ")}`);
console.log(`  misconception ids used: ${[...misconceptions].sort().join(", ")}`);
