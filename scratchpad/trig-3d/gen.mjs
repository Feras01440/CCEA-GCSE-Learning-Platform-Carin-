/**
 * Builds packs/maths/content/m8/pythagoras-and-trigonometry-in-3d/{bundle.json,note.blocks.json}.
 *
 * Run: node scratchpad/trig-3d/gen.mjs
 * Every length and angle is recomputed in core.mjs and asserted there; this file only assembles.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { workedExamples, diagnostics, findTheMistake, prompts } from "./items.mjs";
import { questions } from "./questions.mjs";
import { blocks } from "./note.mjs";
import { assert } from "./core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SLUG = "pythagoras-and-trigonometry-in-3d";
const TOPIC = `maths.m8.${SLUG}`;
const OUT = path.join(ROOT, "packs/maths/content/m8", SLUG);
const AT = "2026-09-13T12:00:00Z";
const TOOL = "claude (author-topic pass; every length and angle recomputed in scratchpad/trig-3d/core.mjs)";

const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, "data/spec/mathematics.json"), "utf8"));
const tax = taxonomy.topics.find((t) => t.slug === SLUG);
assert(tax, "taxonomy entry not found");
const order = taxonomy.topics.findIndex((t) => t.slug === SLUG);
const insight = JSON.parse(fs.readFileSync(path.join(ROOT, `packs/maths/insights/m8.${SLUG}.json`), "utf8"));
assert(insight.topic === TOPIC, "insight card topic does not match");

// ---------------------------------------------------------------------------
// Topic row
// ---------------------------------------------------------------------------

const examWeightHint =
  "M8 is two 75-minute papers of 50 marks: Paper 1 non-calculator, Paper 2 calculator. This topic is a Paper 2 fixture, almost always in the last third of the paper, and it is set in three shapes. The common one is a cuboid in two parts worth 5 marks: the space diagonal for 2, then the angle it makes with the base (or with the largest face) for 3 — Summer 2025 P2 Q12, Summer 2023 P2 Q12. The second is the angle alone for 3 marks — Summer 2024 P2 Q11, November 2023 P2 Q12. The third is a 6-mark solid where the required angle sits in a triangle with no right angle, so two Pythagoras steps feed the cosine rule (November 2021 P2 Q11); that last step belongs to the sine and cosine rule topic. Paper 1 sets the same ideas in surd form: a cube's edge from a 9 cm space diagonal for 3 marks (November 2023 P1 Q11) and a space diagonal from surd side lengths for 5 marks (Summer 2022 P1 Q14). Schemes run MA1 for the sum of the squares, A1 for the root, then MA1 for identifying the angle, MA1 for the ratio and A1 for the value.";

const topic = {
  id: TOPIC,
  slug: SLUG,
  title: tax.title,
  subject: "maths",
  unit: "M8",
  tier: "H",
  strand: "GM",
  statementIds: ["M8-GM-03"],
  prerequisites: [
    "maths.m2.pythagoras-theorem-in-2d",
    "maths.m3.trigonometry-sohcahtoa-in-2d",
    "maths.m1.3d-shapes-nets-plans-and-elevations",
    "maths.m8.sine-rule-cosine-rule-and-area-of-a-triangle",
  ],
  order,
  hardness: "H",
  difficulty: 4,
  examinerFlagged: true,
  examinerSources: [
    "ccea-cer:maths:2025-summer:M82:Q12",
    "ccea-cer:maths:2024-november:M82:Q13",
    "ccea-cer:maths:2024-summer:M82:Q11",
    "ccea-cer:maths:2023-summer:M82:Q12",
  ],
  examWeightHint,
  mustMemorise: [
    "Space diagonal of a cuboid: d² = a² + b² + c², which is two Pythagoras steps joined at the base diagonal",
    "Pythagoras and SOHCAHTOA work only in a right-angled triangle, so the first job is always to find one and redraw it in 2-D",
    "The angle between a line and a plane is the angle between the line and its shadow on that plane",
    "Cuboid: the shadow of the space diagonal AG on the base is the base diagonal AC, so the angle is ∠GAC",
    "Cube of edge x: face diagonal x√2, space diagonal x√3",
    "Pyramid: half the base diagonal goes with a slant edge, half the base edge goes with a sloping face; the face is the steeper",
    "Cone: l² = r² + h², with the slant height as the hypotenuse",
    "Keep roots exact until the final line, then round once",
  ],
  onFormulaSheet: [],
  notOnThisSpec: [
    "3-D coordinates and 3-D vectors — the Teacher Guidance for M8-GM-03 names only the space diagonal and the angle between a line and a plane, and no paper read sets them",
    "The angle between two planes other than a sloping face and the base (a general dihedral angle)",
    "Non-right triangles inside a solid, where the cosine rule finishes the work (November 2021 M8 Paper 2 Q11) — that step is examined under M8-GM-01 and is taught in the sine and cosine rule topic",
    "Surface area and volume of the solids used here; those belong to the mensuration topics",
  ],
  externalRefs: [
    { kind: "corbettmaths", videos: [259, 332] },
    {
      kind: "youtube",
      videoId: "Fk0Z-ArGMxE",
      channel: "corbettmaths",
      credit: "Corbettmaths, 3D Pythagoras (video 259)",
    },
    {
      kind: "youtube",
      videoId: "e3yCvnlYB4w",
      channel: "N.I. Maths Tutor",
      credit: "N.I. Maths Tutor, Pythagoras and Trigonometry in 3D",
    },
    {
      kind: "ccea-doc",
      docType: "cer",
      url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
      asOf: "2026-09-13",
    },
  ],
  keywords: [
    "3D Pythagoras",
    "3D trigonometry",
    "space diagonal",
    "angle between a line and a plane",
    "angle between a line and the base",
    "slant edge",
    "slant height",
    "square-based pyramid",
    "wedge",
    "cuboid diagonal",
  ],
};

// ---------------------------------------------------------------------------
// Note frontmatter (the Sheet)
// ---------------------------------------------------------------------------

const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "Pythagoras and trigonometry in 3D",
  subject: "maths",
  unit: "M8",
  tier: "H",
  specRefs: ["M8-GM-03"],
  calculator: "P1-no/P2-yes",
  formulaSheet: {
    given: [],
    mustKnow: [
      "a² + b² = c² in a right-angled triangle, and the three ratios sin, cos and tan — none of them is printed on page 2",
      "Space diagonal of a cuboid: d = √(a² + b² + c²)",
      "Cube of edge x: face diagonal x√2, space diagonal x√3",
      "Cone: l² = r² + h², the slant height being the hypotenuse",
      "The angle between a line and a plane is the angle between the line and its shadow on the plane",
    ],
  },
  notOnThisSpec: topic.notOnThisSpec,
  hardness: "H",
  examinerFlagged: true,
  externalRefs: topic.externalRefs,
  sheet: {
    mustBeAbleTo: [
      "Find the right-angled triangle inside a cuboid, pyramid, wedge, prism or cone that contains the length or angle asked for, and draw it again on its own in 2-D with its letters and lengths",
      "Find the space diagonal of a cuboid, either as two Pythagoras steps joined at the base diagonal or in the single line d² = a² + b² + c²",
      "Find the angle between a space diagonal and the base, naming it in three letters before calculating (the shadow of AG on the base is AC, so the angle is ∠GAC)",
      "Find the angle between a space diagonal and a named face, by using that face's diagonal and the edge perpendicular to it",
      "Find the angle between the slant edge of a square-based pyramid and the base, using half the base diagonal",
      "Find the angle between a sloping face of a pyramid and the base, using the perpendicular height and half the base edge",
      "Use the slant height of a cone or pyramid, and tell it apart from the vertical height",
      "Answer show-that parts by finishing on the printed length, and give lengths in surd form on Paper 1",
      "Work backwards: find the edge of a cube from its space diagonal, or a height from a given angle",
      "Keep every root exact until the final line, then round once to the stated accuracy",
    ],
    howExamined: examWeightHint,
    traps: [
      "Finding the diagonal and then stopping, or guessing at the angle: most of the entry found the space diagonal and under half identified the required angle (Summer 2025 M8 Paper 2 Q12)",
      "Measuring the angle from an edge of the base instead of from the base diagonal, which makes ∠GAB out of ∠GAC (Summer 2023 M8 Paper 2 Q12, Summer 2025 M8 Paper 2 Q12)",
      "Using only two of the three dimensions, so a face diagonal is offered as the space diagonal (Summer 2025 M8 Paper 2 Q12)",
      "Working inside the 3-D picture without redrawing the triangle: examiners tied full marks to well laid out solutions with the triangle set out separately (November 2024 M8 Paper 2 Q13)",
      "In a pyramid, using half the base diagonal for a sloping face, or half the base edge for a slant edge; the two angles differ and the face is always the steeper (November 2024 M8 Paper 2 Q13)",
      "Rounding the base diagonal before the trigonometry: √97 rounded to 9.8 moves the angle from 14.2° to 14.3°, and the accuracy mark with it (CCEA General Marking Advice viii, Summer 2025 M4 mark scheme)",
      "Giving the complement, by working from the vertical edge or the vertical height rather than from the base",
      "Treating the slant height of a cone or pyramid as the vertical height, or subtracting when the hypotenuse is the unknown",
      "Mixing metres and centimetres in one Pythagoras line when a context gives both",
      "Stopping at the sum of the squares: 169 is a squared length, not a length (Summer 2025 M8 Paper 2 Q12)",
    ],
  },
  verification: `ver.note.${TOPIC}`,
  version: 1,
  updated: "2026-09-13",
};

// ---------------------------------------------------------------------------
// Sets
// ---------------------------------------------------------------------------

const qid = (n) => `q.${TOPIC}.${n}`;
const sets = [
  {
    id: `set.${TOPIC}.warm-up`,
    topic: TOPIC,
    kind: "interleaved",
    title: "3D Pythagoras warm-up",
    subject: "maths",
    units: ["M8"],
    itemIds: [
      `dx.${TOPIC}`,
      `rp.${TOPIC}.02`,
      qid("0001"),
      qid("0002"),
      qid("0003"),
      `rp.${TOPIC}.03`,
      qid("0004"),
    ],
    showTopicLabels: false,
    version: 1,
  },
  {
    id: `set.${TOPIC}.mixed`,
    topic: TOPIC,
    kind: "mixed",
    title: "Cuboids, pyramids, wedges and cones: the angle every time",
    subject: "maths",
    units: ["M8"],
    itemIds: [
      qid("0005"),
      `ftm.${TOPIC}.01`,
      qid("0006"),
      qid("0007"),
      `ftm.${TOPIC}.03`,
      qid("0008"),
      qid("0009"),
      qid("0010"),
      `rp.${TOPIC}.05`,
      qid("0012"),
      `ftm.${TOPIC}.02`,
      qid("0014"),
      qid("0015"),
      qid("0017"),
      `rp.${TOPIC}.07`,
    ],
    showTopicLabels: false,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const COPY_SHINGLE =
  "scratchpad/trig-3d/check.mjs normalises every string in this bundle and in note.blocks.json (maths stripped, punctuation removed) into 8-word shingles and compares them with 230,858 shingles built from 268 private corpus files: every M3, M4, M6, M7 and M8 question paper and mark scheme under docs/sources/papers/maths, plus every Chief Examiner report block in pipeline/mine/cer-blocks/maths. Zero matches. The papers read for pattern were Summer 2025 P2 Q12 and its scheme, Summer 2024 P2 Q11, Summer 2023 P2 Q12, November 2023 P2 Q12 and P1 Q11, November 2021 P2 Q11 and Summer 2022 P1 Q14; the solids, letters, dimensions, contexts and wording here are new.";
const STYLE_LINT =
  "913 maths segments (the KaTeX in every stem, step, hint, scheme line, feedback and note block) compiled with katex renderToString (throwOnError), and every string checked for balanced delimiters. British English, second person, no exclamation marks anywhere, no 9-1 grade label, and no verdict word used to judge a learner's answer. All 36 SVGs checked for <style>, <script>, event handlers, external hrefs and prefers-color-scheme (none present), for a viewBox, for currentColor and for font-family='inherit'; the largest is 6.9 KB against the 12 KB limit, and every data URI survives decodeURIComponent.";
const AUDIT =
  "scratchpad/trig-3d/audit-numbers.mjs matched all 248 decimals printed in prose to a rounding or truncation of a value computed in core.mjs, and audit-arithmetic.mjs re-evaluated every printed claim (20 sums of squares, 39 square roots, 22 written-out additions) with no mismatch.";

const check = (type, detail, result = "pass") => ({
  type,
  tool: TOOL,
  result,
  detail: type === "maths-numeric" ? `${detail} ${AUDIT}` : detail,
  at: AT,
  by: "claude",
});

const log = (itemId, checks) => ({
  id: `ver.${itemId}`,
  itemId,
  version: 1,
  checks,
  status: "verified",
  reports: [],
});

const verification = [];

verification.push(
  log(note.id, [
    check("schema", "NoteFrontmatter shape checked against src/lib/content/schema.ts and published by pipeline/build-content.mts --strict"),
    check(
      "scope-tier",
      "Higher tier, M8 only. Confined to the two jobs the Teacher Guidance for M8-GM-03 names (space diagonal; angle between a line and a plane), plus the slant height of a cone and pyramid that the papers read use. 3-D coordinates, vectors, general dihedral angles and the cosine-rule finish are listed in notOnThisSpec.",
    ),
    check(
      "formula-sheet",
      "packs/maths/exam-true/formula-sheets.json: the Higher page-2 sheet gives prism, trapezium, sphere, cone, quadratic formula, sine rule, cosine rule and ½ab sin C. Pythagoras and the trigonometric ratios are in the must-know list, so both are set out in the note as recall.",
    ),
    check("command-words", "Calculate, Show that, Write down, Find, Explain and Compare — all in packs/maths/exam-true/command-words.json"),
    check(
      "tariff",
      "The Sheet quotes the tariffs actually set: 2 + 3 on Summer 2025 P2 Q12 and Summer 2023 P2 Q12, a single 3 on Summer 2024 P2 Q11 and November 2023 P2 Q12, 6 on November 2021 P2 Q11, 3 and 5 on the Paper 1 surd items. packs/maths/exam-true/tariffs.json gives M8 P2 perQuestion typical 4, p90 6.",
    ),
    check(
      "maths-numeric",
      "Worked values in the note recomputed in core.mjs: AC = 10 and AG = √125 = 11.1803… for the 8 × 6 × 5 cuboid; ∠GAC = 26.5651° → 26.6°; 2 × 3 × 6 gives exactly 7; √97 = 9.848858 gives 14.2° kept exact against 14.3° rounded at 9.8 and 14.0° rounded at 10; cone 7, 24 gives l = 25; cube with space diagonal 12 gives x² = 48; 5 × 12 × 9 gives 34.7°.",
    ),
    check(
      "examiner-alignment",
      "All four findings on packs/maths/insights/m8.pythagoras-and-trigonometry-in-3d.json appear as examiner callouts with their series cited, and each trap in the Sheet names the series it came from.",
    ),
    check("copy-shingle", COPY_SHINGLE),
    check("style-lint", STYLE_LINT),
    check(
      "katex-compile",
      "All maths segments in note.blocks.json compiled with katex renderToString; the SVG figures carry no <style>, <script>, event handler or external href and use currentColor with a viewBox.",
    ),
  ]),
);

const weChecks = (n, detail) => [
  check("schema", "WorkedExample shape: steps numbered in order, faded showSteps below the step count, twin carrying its own AnswerSpec and figure"),
  check("scope-tier", "Higher, M8; right-angled triangles only, which is what M8-GM-03 and its Teacher Guidance ask for"),
  check("formula-sheet", "Nothing taken from the page-2 sheet; Pythagoras and the ratios are recall"),
  check("tariff", `Step marks total the tariff written into the stem, matching the CCEA shapes read (2 + 2 + 3, 2 + 3 + 3, 2 + 3, 3)`),
  check("maths-numeric", detail),
  check("examiner-alignment", `Decisions name the finding each step defends (${n})`),
  check("copy-shingle", COPY_SHINGLE),
  check("style-lint", STYLE_LINT),
];

verification.push(
  log(workedExamples[0].id, weChecks(
    "identify the angle; redraw the triangle",
    "cuboid 8 × 6 × 5: AC = 10 exactly, AG = √125 = 11.18034 → 11.2, ∠GAC = atan(5/10) = 26.56505° → 26.6°; twin 12 × 9 × 8: AC = 15, AG = 17 exactly, angle = 28.07249° → 28.1°. Both triangles checked as right-angled in core.mjs, and the sin, cos and tan routes agree to 1e-9.",
  )),
  log(workedExamples[1].id, weChecks(
    "half the diagonal against half the edge",
    "pyramid base 10, height 12: AM = 5√2 = 7.07107 with AM² = 50 exactly, VA = √194 = 13.92839 → 13.9, slant-edge angle = 59.49104° → 59.5°, slant height VN = 13 exactly, face angle = atan(12/5) = 67.38014° → 67.4°; twin base 14, height 24: VN = 25 exactly, face angle = 73.73980° → 73.7°. The face angle is asserted to exceed the slant-edge angle.",
  )),
  log(workedExamples[2].id, weChecks(
    "premature rounding",
    "wedge 9 × 4 × 2.5: AC = √97 = 9.848858, AG = √103.25 = 10.16120 → 10.2, angle = 14.24294° → 14.2°; rounding AC to 9.8 gives 14.31104° → 14.3° and to 10 gives 14.03624° → 14.0°, and the generator asserts that the 3 s.f. values differ; twin 12 × 5 × 3.5: AC = 13 exactly, angle = 15.06849° → 15.1°.",
  )),
  log(workedExamples[3].id, weChecks(
    "reading the rule backwards",
    "cube with space diagonal 12: 3x² = 144, x² = 48, x = 4√3 = 6.928203; twin with diagonal 15: x² = 75, x = 5√3 = 8.660254. Both surds simplified by the square-free routine in core.mjs and checked by rebuilding the diagonal from the edge.",
  )),
);

verification.push(
  log(diagnostics[0].id, [
    check("schema", "DiagnosticSet shape; every item has exactly one correct option and a named misconception on every distractor"),
    check("scope-tier", "Higher, M8; all eight items sit inside M8-GM-03"),
    check(
      "maths-numeric",
      "Values recomputed in core.mjs: 3 × 4 × 12 gives AC = 5 and AG = 13; atan(6/10) = 30.96° against atan(10/6) = 59.04°; pyramid 12 × 9 gives a slant-edge angle of 46.69° and a face angle of 56.31°, with half the diagonal 8.485 and half the edge 6; cone 7, 24 gives l = 25 and √(24² − 7²) = 22.96; √97 rounded to 9.8 gives 14.3° against 14.2°; cube diagonal 9 gives x² = 27 and x = 3√3 = 5.196.",
    ),
    check(
      "examiner-alignment",
      "Items 02, 05 and 07 carry the three findings the reports name: identifying the angle (Summer 2025, Summer 2023), the layout that earns full marks (November 2024) and accuracy under rounding.",
    ),
    check("copy-shingle", COPY_SHINGLE),
    check("style-lint", STYLE_LINT),
  ]),
);

const qDetail = {
  "0001": "8 × 15 base: AC² = 289, AC = 17 exactly",
  "0002": "4 × 4 × 7: AG² = 81, AG = 9 exactly; the two-dimension error gives √32 = 5.657",
  "0003": "cube 6: AG = √108 = 10.39230 → 10.4, exactly 6√3; a face diagonal would be 8.485",
  "0004": "6 × 8 × 7: AC = 10, angle = atan(7/10) = 34.99202° → 35.0°; the edge error gives atan(7/6) = 49.40°, the complement is 55.008°",
  "0005": "9 × 12 × 4: largest face 9 × 12 with diagonal 15, angle = atan(4/15) = 14.93142° → 14.9°, confirmed by asin(4/√241) to 1e-9",
  "0006": "pyramid 8 × 15: AM² = 32, VA = √257 = 16.03122 → 16.0, angle = atan(15/√32) = 69.33736° → 69.3°; half-edge error gives √241 = 15.52 and 75.07°",
  "0007": "pyramid 12 × 9: MN = 6, face angle = atan(9/6) = 56.30993° → 56.3°; the half-diagonal error gives 46.69°",
  "0008": "cone 7, 24: l² = 625, l = 25 exactly; angle with the base = atan(24/7) = 73.73980° → 73.7°, complement 16.26°",
  "0009": "wedge 8 × 6 × 3: AC = 10, angle = atan(3/10) = 16.69924° → 16.7°",
  "0010": "crate 130 × 90 × 50 cm: AG² = 27500, AG = 165.83124 → 166 cm, and 160 cm < 165.83 so the 1.6 m rod fits; the unmixed-unit slip gives 90.0",
  "0011": "cube with space diagonal 20: 3x² = 400, x = 11.54701 → 11.5; the halving errors give 6.667 and 14.14",
  "0012": "9 × 12 base: AC = 15 exactly; h = 15 tan 40° = 12.58649 → 12.6, and the generator asserts that this height reproduces the 40° angle",
  "0013": "6 × 6 × 12: AG² = 216, AG = 6√6 (square-free simplification checked in core.mjs)",
  "0014": "5 × 12 × 9: AC = 13 exactly, AG = √250 = 15.81139 → 15.8 (5√10), angle = atan(9/13) = 34.69515° → 34.7°",
  "0015": "pyramid base 16 with slant edge 17: AM² = 128, VM² = 161, VM = 12.68858 → 12.7, slant height VN = 15 exactly, face angle = atan(√161/8) = 57.76905° → 57.8°, slant-edge angle 48.28°",
  "0016": "wedge 15 × 8 × 4.5: AC = 17 exactly, AG = √309.25 = 17.58551 → 17.6, angle = atan(4.5/17) = 14.82648° → 14.8°",
  "0017": "pyramid 18 × 12: AM² = 162, slant-edge angle = atan(12/√162) = 43.31386° → 43.3°, face angle = atan(12/9) = 53.13010° → 53.1°, and the face is asserted to be the steeper",
};

for (const q of questions) {
  const n = q.id.split(".").pop();
  verification.push(
    log(q.id, [
      check("schema", "Question shape: parts sum to totalMarks, each scheme sums to its part, skeleton matches the parts, figures are inline SVG data URIs under 12 KB"),
      check("scope-tier", "Higher, M8; right-angled triangles inside a cuboid, pyramid, wedge or cone, as M8-GM-03 requires"),
      check("formula-sheet", "Nothing on the page-2 sheet is used; Pythagoras and the ratios are recall"),
      check("command-words", `Command words used: ${q.commandWords.join(", ")} — all in packs/maths/exam-true/command-words.json`),
      check("tariff", `${q.totalMarks} marks in ${q.parts.length} part(s), ${q.skeleton}; consistent with the CCEA shapes read for this topic and with tariffs.json (M8 P${q.paper.paper} perQuestion typical 4, p90 6)`),
      check("maths-numeric", `Recomputed in core.mjs: ${qDetail[n]}. Every distractor value in commonErrors is produced by the same generator, so the wrong answers are the real ones.`),
      check("examiner-alignment", q.examinerSources.length ? `Exercises ${q.examinerSources.join(", ")}` : "Exercises the ladder behind the examiner findings: three dimensions, then the named angle, then the exact value"),
      check("copy-shingle", COPY_SHINGLE),
      check("style-lint", STYLE_LINT),
    ]),
  );
}

for (const f of findTheMistake) {
  verification.push(
    log(f.id, [
      check("schema", "FindTheMistake shape; mistakeLine indexes a line of studentWorking"),
      check("scope-tier", "Higher, M8"),
      check(
        "maths-numeric",
        f.id.endsWith("01")
          ? "cuboid 7 × 4 × 6: the written answer √65 = 8.062 is exactly AC, and the correct AG = √101 = 10.0499 → 10.0"
          : f.id.endsWith("02")
            ? "cuboid 10 × 5 × 4: AG = √141 = 11.8743; the edge route gives atan(4/10) = 21.8014° and the correct angle is atan(4/√125) = 19.6857° → 19.7°"
            : "pyramid 16 × 15: half the diagonal 11.3137 gives 52.9747° (the slant-edge angle) and half the edge 8 gives 61.9275° → 61.9° (the face angle)",
      ),
      check("examiner-alignment", `Seeded from ${f.source}`),
      check("copy-shingle", COPY_SHINGLE),
      check("style-lint", STYLE_LINT),
    ]),
  );
}

for (const p of prompts) {
  verification.push(
    log(p.id, [
      check("schema", "RetrievalPrompt shape with kind, prompt, answer and keyWords"),
      check("scope-tier", "Higher, M8; nothing outside M8-GM-03"),
      check("maths-numeric", "Any value quoted is one of the recomputed values in core.mjs (√97 and its rounded forms, the cone 7-24-25, the cube x√3 with x² = 27)"),
      check("copy-shingle", COPY_SHINGLE),
      check("style-lint", STYLE_LINT),
    ]),
  );
}

// ---------------------------------------------------------------------------
// Assemble and write
// ---------------------------------------------------------------------------

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note,
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  insight,
  sets,
  verification,
};

// local sanity checks before the schema sees it
const ids = [
  note.id,
  ...workedExamples.map((w) => w.id),
  ...diagnostics.map((d) => d.id),
  ...questions.map((q) => q.id),
  ...findTheMistake.map((f) => f.id),
  ...prompts.map((p) => p.id),
  insight.id,
  ...sets.map((s) => s.id),
];
assert(new Set(ids).size === ids.length, "duplicate item id in the bundle");
assert(verification.length === 1 + workedExamples.length + 1 + questions.length + findTheMistake.length + prompts.length,
  `verification logs: ${verification.length}`);
for (const v of verification) assert(ids.includes(v.itemId), `verification log for unknown item ${v.itemId}`);

const setItemIds = new Set(ids);
for (const s of sets) for (const i of s.itemIds) assert(setItemIds.has(i), `set ${s.id} references unknown item ${i}`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bundle.json"), `${JSON.stringify(bundle, null, 2)}\n`);
fs.writeFileSync(path.join(OUT, "note.blocks.json"), `${JSON.stringify(blocks, null, 2)}\n`);

const kb = (p) => Math.round(fs.statSync(path.join(OUT, p)).size / 1024);
console.log(`bundle.json ${kb("bundle.json")} KB, note.blocks.json ${kb("note.blocks.json")} KB`);
console.log(
  `we ${workedExamples.length} · dx ${diagnostics[0].items.length} · q ${questions.length} · ftm ${findTheMistake.length} · rp ${prompts.length} · sets ${sets.length} · ver ${verification.length}`,
);
const figures = questions.reduce((t, q) => t + q.figures.length, 0) + workedExamples.reduce((t, w) => t + (w.figure ? 1 : 0) + (w.twin.figure ? 1 : 0), 0);
const noteFigures = blocks.filter((b) => b.type === "figure").length;
const dxFigures = diagnostics[0].items.filter((i) => i.figure).length;
console.log(`figures: ${noteFigures} in the note, ${figures} on worked examples and questions, ${dxFigures} on diagnostics`);
const biggest = Math.max(
  ...questions.flatMap((q) => q.figures.map((f) => f.src.length)),
  ...blocks.filter((b) => b.type === "figure").map((b) => b.svg.length),
);
console.log(`largest figure ${Math.round(biggest / 1024 * 10) / 10} KB (limit 12 KB)`);
