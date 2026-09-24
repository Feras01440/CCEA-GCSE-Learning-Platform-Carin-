/** Assembles and writes the bundle + note blocks, after a KaTeX and style pass. */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import katex from "katex";
import { workedExamples, diagnostics, logs, verified, id, TOPIC, SPEC, OUT, AT, noteBlocks } from "./gen.mjs";
import { questions, findTheMistake, prompts } from "./items.mjs";

// --- verification logs for the items that have no `verification` field -------
for (const f of findTheMistake) {
  verified(f.id, {
    tariff:
      "Not a tariff item: a piece of plausible wrong working built from one named finding, with the marks it would actually earn recorded in marksEarnedAsWritten.",
    numeric:
      "01 (3, 1), (8, 1), (3, 4) reflected in y = x gives (1, 3), (1, 8), (4, 3), and the y-axis slip gives (-3, 1), (-8, 1), (-3, 4). 03 scale factor 2/6 = 1/3 and the vertex joins meet at (3, 3); both were recomputed in shapes.mjs as the q0003 and q0011 values.",
    alignment:
      "01 Summer 2025 M7 Paper 2 Q15 (reflected in the wrong line); 02 Summer 2024 M7 Paper 1 Q12 (a combination offered where a single transformation was asked for); 03 Summer 2025 M8 Paper 2 Q9 (the enlargement named, the centre and scale factor missing or inverted).",
  });
}
for (const p of prompts) {
  verified(p.id, {
    tariff: "Atomic recall rather than an exam tariff; scheduled by FSRS towards the M7 and M8 papers.",
    numeric:
      "The coordinate rules quoted here were checked against every image in the bundle: swapping alone reproduces each y = x image and swapping with both signs changed reproduces each y = -x image, in shapes.mjs.",
    alignment:
      "Prompts 1-3 the wrong mirror line (Summer 2025 M7 Paper 2 Q15, November 2025 M7 Paper 1 Q16); 4-6 and 12 the description checklists and the wording rules (Summer 2024 M7 Paper 1 Q12); 7-10 the single equivalent transformation and the two constructions (Summer 2025 M8 Paper 2 Q8 and Q9); 11 the erased first image (Summer 2024 M7 Paper 2 Q15).",
  });
}

// --- note frontmatter -------------------------------------------------------
const note = {
  id: id("note"),
  topic: TOPIC,
  title: "Combined transformations, and the mirrors y = x and y = -x",
  subject: "maths",
  unit: "M7",
  tier: "H",
  specRefs: SPEC,
  calculator: "P1-no/P2-yes",
  formulaSheet: {
    given: [
      "Nothing for this topic. The Higher sheet carries the prism, the trapezium, the sphere, the cone, the quadratic formula, the sine and cosine rules and ½ab sin C, and nothing else.",
    ],
    mustKnow: [
      "Reflection in y = x: (a, b) → (b, a), the coordinates swap and the signs are untouched",
      "Reflection in y = −x: (a, b) → (−b, −a), swap and then change both signs",
      "Apply the transformations in the order the question states, each one acting on the image the one before it made",
      "Two reflections in perpendicular mirrors = a rotation of 180° about the point where they cross",
      "Two reflections in parallel mirrors = a translation of twice the gap, perpendicular to them",
      "Describe fully: reflection + the equation of the mirror; rotation + angle + direction + centre; translation + column vector; enlargement + scale factor + centre",
      "Centre of rotation: the crossing point of the perpendicular bisectors of two vertex joins",
      "Centre of enlargement: the crossing point of the joins of corresponding vertices, extended",
    ],
  },
  notOnThisSpec: [
    "Rotations through angles other than 90° either way and 180° (Teacher Guidance for M6-GM-05)",
    "Matrices as a way of writing transformations",
    "Negative scale factors, which belong to M8-GM-04 and are a separate topic",
    "Invariant points, glide reflections and the formal language of symmetry groups",
  ],
  hardness: "H",
  examinerFlagged: true,
  externalRefs: [
    {
      kind: "ccea-doc",
      docType: "cer",
      url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
      asOf: "2026-09-13",
    },
    { kind: "corbettmaths", videos: [272, 273] },
    {
      kind: "youtube",
      videoId: "AE0w7QRjGqQ",
      channel: "corbettmaths",
      credit: "Reflections - Corbettmaths (video 272), embedded with permission of the uploader",
    },
  ],
  sheet: {
    mustBeAbleTo: [
      "Reflect a point or a shape in the line y = x by swapping each pair of coordinates",
      "Reflect a point or a shape in the line y = −x by swapping each pair and changing both signs",
      "Draw either diagonal on a grid before reflecting anything in it",
      "Carry out two transformations in the order stated, leaving the first image drawn and labelled",
      "Enlarge an image by a fractional scale factor about a centre that is not the origin, by counting across and up from the centre",
      "Describe a reflection fully: the word, and the equation of the mirror line",
      "Describe a rotation fully: the word, the angle, the direction, and the centre as a coordinate pair",
      "Describe a translation fully: the word, and the column vector",
      "Describe an enlargement fully: the word, the scale factor, and the centre",
      "Find the centre of a rotation from the perpendicular bisectors of two vertex joins",
      "Find the centre of an enlargement by joining corresponding vertices and extending",
      "Name the single transformation equivalent to two reflections: a rotation of 180° about the crossing point for perpendicular mirrors, a translation of twice the gap for parallel ones",
    ],
    howExamined:
      "M7 and M8, Paper 1 (no calculator) and Paper 2 (calculator), 50 marks in 75 minutes each; nothing here needs a calculator on either. One or two questions a series, usually among the last five, in two shapes. The drawing shape is 4 marks, marked as first image then final image, two marks each: Summer 2025 M7 Paper 2 Q15 and M8 Paper 2 Q8 both asked for a reflection in y = x followed by an enlargement of scale factor ½ about an off-origin centre, and Summer 2024 M7 Paper 2 Q15 asked for the same with scale factor ½ about (7, 2). The describing shape is 2 or 3 marks with one mark per item on the checklist: Summer 2024 M7 Paper 1 Q12 (rotation, 3), November 2024 M7 Paper 2 Q15 and Summer 2025 M8 Paper 2 Q9 (enlargement, 3), Summer 2026 M7 Paper 2 Q6 (2). Single reflections in y = ±x are worth 2 on their own (November 2025 M7 Paper 1 Q16; Summer 2026 M7 Paper 2 Q14 and M8 Paper 2 Q5). Follow-through is normal: a wrong first image that is then transformed correctly still earns the second stage.",
    traps: [
      "Reflecting in an axis, or in y = −x, when y = x was asked for — the single most-reported slip on this topic (Summer 2025 M7 Paper 2 Q15, November 2025 M7 Paper 1 Q16)",
      "Doing the swap for y = −x but not changing both signs, or changing the signs without swapping",
      "Erasing the first image once the second stage is drawn, which throws away two of the four marks (Summer 2024 M7 Paper 2 Q15)",
      "Halving or doubling the coordinates instead of the distances from the centre, or drawing the image on top of the centre (Summer 2025 M7 Paper 2 Q15)",
      "Describing a single transformation as two joined by \"then\", which scores zero however accurate it is (Summer 2024 M7 Paper 1 Q12)",
      "Writing \"turn\" where the scheme wants \"rotation\", or giving a rotation with no direction or no centre (Summer 2024 M7 Paper 1 Q12)",
      "Naming an enlargement without both the scale factor and the centre — only a minority gave both (Summer 2025 M8 Paper 2 Q9)",
      "Inverting a fractional scale factor, so a shrinking enlargement is called scale factor 3 instead of ⅓ (November 2024 M7 Paper 2 Q15)",
      "Taking two reflections in parallel mirrors as a translation of the gap rather than twice the gap",
      "Applying the second transformation to the original shape instead of to the first image",
    ],
  },
  verification: verified(id("note"), {
    tariff:
      "The Sheet's tariffs come from the schemes read for this topic: 4 marks for the combined drawing (two per stage), 2 for a single reflection drawn, 2 or 3 for a full description depending on how many items the checklist has.",
    numeric:
      "Every coordinate quoted in the lesson is one of the values computed and asserted in scratchpad/transformations/shapes.mjs; the eleven grids in note.blocks.json are drawn from those same arrays rather than from typed-in numbers.",
    alignment:
      "The five examiner callouts carry five of the eight findings on the insight card: Summer 2025 M7 Paper 2 Q15, Summer 2025 M8 Paper 2 Q8, Summer 2025 M8 Paper 2 Q9, Summer 2024 M7 Paper 1 Q12 and, through the trap list, Summer 2024 M7 Paper 2 Q15 and November 2024 M7 Paper 2 Q15.",
  }),
  version: 1,
  updated: "2026-09-13",
};

// --- topic row --------------------------------------------------------------
const topic = {
  id: TOPIC,
  slug: "combined-transformations-and-reflections-in-y-equals-plus-or-minus-x",
  title: "Combined transformations and reflections in y = x and y = −x",
  subject: "maths",
  unit: "M7",
  tier: "H",
  strand: "GM",
  statementIds: SPEC,
  prerequisites: [
    "maths.m6.reflections-in-any-vertical-or-horizontal-line-and-rotations-about-any-point",
    "maths.m6.translations-with-vector-notation",
    "maths.m6.transformation-properties-and-congruence",
    "maths.m5.reflections-in-the-axes",
  ],
  order: 122,
  hardness: "H",
  difficulty: 4,
  examinerFlagged: true,
  examinerSources: [
    "ccea-cer:maths:2025-summer:M82:Q8",
    "ccea-cer:maths:2025-summer:M72:Q15",
    "ccea-cer:maths:2025-summer:M82:Q9",
    "ccea-cer:maths:2024-summer:M72:Q15",
    "ccea-cer:maths:2024-summer:M71:Q12",
    "ccea-cer:maths:2024-november:M72:Q15",
    "ccea-cer:maths:2025-november:M71:Q16",
    "ccea-cer:maths:2024-summer:M82:Q6",
  ],
  examWeightHint:
    "One or two questions a series across M7 and M8, on either paper, usually among the last five. The 4-mark drawing (reflect in y = ±x, then enlarge by a fractional scale factor about a given centre) appeared as Summer 2025 M7 Paper 2 Q15 and M8 Paper 2 Q8 (just over 40% correct, over 30% with no understanding) and Summer 2024 M7 Paper 2 Q15 and M8 Paper 2 Q6 (nearly half full marks). The 2- or 3-mark \"describe fully the single transformation\" appeared as Summer 2024 M7 Paper 1 Q12 (rotation), November 2024 M7 Paper 2 Q15 and Summer 2025 M8 Paper 2 Q9 (enlargement, only a minority giving both centre and scale factor) and Summer 2026 M7 Paper 2 Q6. Single reflections in y = ±x carry 2 marks (November 2025 M7 Paper 1 Q16; Summer 2026 M7 Paper 2 Q14 and M8 Paper 2 Q5).",
  mustMemorise: [
    "Reflection in y = x swaps the coordinates: (a, b) → (b, a)",
    "Reflection in y = −x swaps them and changes both signs: (a, b) → (−b, −a)",
    "Each transformation in a combination acts on the image the one before it made, so the order in the sentence is the order on the page",
    "The first image is worth marks on its own — draw it, label it, leave it",
    "Two reflections in perpendicular mirrors = a rotation of 180° about their crossing point",
    "Two reflections in parallel mirrors = a translation of twice the distance between them",
    "Full descriptions: reflection + mirror line equation; rotation + angle + direction + centre; translation + column vector; enlargement + scale factor + centre",
    "Centre of rotation: perpendicular bisectors of two vertex joins; centre of enlargement: corresponding vertices joined and extended",
  ],
  onFormulaSheet: [],
  notOnThisSpec: [
    "Rotations through angles other than ±90° and 180° (Teacher Guidance for M6-GM-05)",
    "Matrix representations of transformations",
    "Negative scale factors, which belong to M8-GM-04",
    "Invariant points and glide reflections",
  ],
  externalRefs: [
    {
      kind: "ccea-doc",
      docType: "cer",
      url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
      asOf: "2026-09-13",
    },
    { kind: "corbettmaths", videos: [272, 273] },
    {
      kind: "geogebra",
      materialId: "NRvKXvQN",
      attribution: "Made with GeoGebra®",
    },
  ],
  keywords: [
    "combined transformations",
    "reflection in y = x",
    "reflection in y = −x",
    "successive transformations",
    "describe fully",
    "single transformation",
    "centre of rotation",
    "centre of enlargement",
    "fractional scale factor",
    "column vector",
  ],
};

// --- insight card -----------------------------------------------------------
const insight = JSON.parse(
  fs.readFileSync(path.join(OUT, "..", "..", "..", "insights", `m7.${topic.slug}.json`), "utf8"),
);

// --- practice sets ----------------------------------------------------------
const sets = [
  {
    id: id("set", "warm-up"),
    topic: TOPIC,
    kind: "interleaved",
    title: "Mirrors and images: warm-up",
    subject: "maths",
    units: ["M7"],
    itemIds: [
      id("dx"),
      id("rp", "01"),
      questions[0].id,
      questions[1].id,
      questions[2].id,
      id("rp", "02"),
      questions[3].id,
      questions[6].id,
    ],
    showTopicLabels: false,
    version: 1,
  },
  {
    id: id("set", "mixed"),
    topic: TOPIC,
    kind: "mixed",
    title: "Combine it, then describe it",
    subject: "maths",
    units: ["M7", "M8"],
    itemIds: [
      questions[7].id,
      findTheMistake[0].id,
      questions[8].id,
      questions[9].id,
      id("rp", "09"),
      questions[10].id,
      findTheMistake[2].id,
      questions[13].id,
      questions[14].id,
      questions[16].id,
      id("rp", "11"),
    ],
    showTopicLabels: false,
    version: 1,
  },
];

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
  verification: logs,
};

// ---------------------------------------------------------------------------
// Checks before writing
// ---------------------------------------------------------------------------

function everyString(node, visit, where = "") {
  if (typeof node === "string") return visit(node, where);
  if (Array.isArray(node)) return node.forEach((v, i) => everyString(v, visit, `${where}[${i}]`));
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) everyString(v, visit, `${where}.${k}`);
  }
}

let katexSegments = 0;
const banned = [];
const check = (s, where) => {
  // SVG markup, data URIs and mark-scheme regexes are machinery, not prose.
  if (where.includes(".svg") || where.includes(".src") || where.endsWith(".regex") || where.endsWith(".test")) return;
  for (const m of s.matchAll(/\$([^$]+)\$/g)) {
    katexSegments += 1;
    katex.renderToString(m[1], { throwOnError: true });
  }
  if (/!/.test(s) && !/\\!|\[!\]/.test(s)) banned.push(`exclamation mark at ${where}: ${s.slice(0, 70)}`);
  if (/\bWrong\b/.test(s)) banned.push(`the W-word at ${where}`);
  if (/grade 9/i.test(s)) banned.push(`numbered-grade label at ${where}`);
};
everyString(bundle, check, "bundle");
everyString(noteBlocks, check, "note");
assert.equal(banned.length, 0, `style-lint: ${banned.join(" | ")}`);

// Ids, marks and figure coverage.
const weWithFigure = workedExamples.filter((w) => w.figure).length;
assert.equal(weWithFigure, workedExamples.length, "every worked example needs a figure");
const qWithFigure = questions.filter((q) => q.figures.length > 0).length;
assert.equal(qWithFigure, questions.length, "every question needs a figure");
const graphParts = questions.flatMap((q) => q.parts).filter((p) => p.answer.kind === "graph");
assert.ok(graphParts.length >= 2, "at least two drawing parts need a transformation graph spec");
// A graph common error only fires when its `test` spells out the wrong image's vertices.
const VERTEX = /\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)/g;
for (const q of questions) {
  for (const p of q.parts) {
    for (const e of p.commonErrors) {
      if (e.pattern.kind !== "graph") continue;
      const listed = [...e.pattern.test.matchAll(VERTEX)];
      assert.ok(listed.length >= 2, `${q.id} part ${p.id}: graph test lists no vertices: "${e.pattern.test}"`);
      assert.equal(
        listed.length,
        p.answer.expect.image.length,
        `${q.id} part ${p.id}: graph test lists ${listed.length} vertices, the image has ${p.answer.expect.image.length}`,
      );
      const wrong = listed.map((m) => m[0]);
      const right = p.answer.expect.image.map(([x, y]) => `(${x}, ${y})`);
      assert.notEqual(
        [...wrong].sort().join(),
        [...right].sort().join(),
        `${q.id} part ${p.id}: graph test names the correct image`,
      );
    }
    // A two-stage question hands the second part the first part's image as its object.
    if (p.id === "b" && p.answer.kind === "graph") {
      const a = q.parts.find((x) => x.id === "a");
      if (a?.answer.kind === "graph" && a.answer.expect.plot === "transformation") {
        assert.deepEqual(p.answer.expect.object, a.answer.expect.image, `${q.id}: part (b) must start from part (a)'s image`);
      }
    }
  }
}
const textParts = questions.flatMap((q) => q.parts).filter((p) => p.answer.kind === "text");
assert.ok(textParts.length >= 8, "descriptions need text specs with key words");
for (const q of questions) {
  assert.equal(
    q.totalMarks,
    q.parts.reduce((a, p) => a + p.marks, 0),
    `${q.id}: totalMarks`,
  );
  for (const p of q.parts) {
    if (p.scheme.length > 0) {
      assert.equal(p.scheme.reduce((a, m) => a + m.marks, 0), p.marks, `${q.id} part ${p.id}: scheme total`);
    }
  }
}
const allIds = [
  note.id,
  ...workedExamples.map((w) => w.id),
  ...diagnostics.map((d) => d.id),
  ...questions.map((q) => q.id),
  ...findTheMistake.map((f) => f.id),
  ...prompts.map((p) => p.id),
  insight.id,
  ...sets.map((s) => s.id),
];
assert.equal(new Set(allIds).size, allIds.length, "duplicate item id");
for (const s of sets) {
  for (const itemId of s.itemIds) assert.ok(allIds.includes(itemId), `set refers to unknown item ${itemId}`);
}
const logIds = new Set(logs.map((l) => l.itemId));
for (const itemId of [note.id, ...workedExamples.map((w) => w.id), ...diagnostics.map((d) => d.id), ...questions.map((q) => q.id), ...findTheMistake.map((f) => f.id), ...prompts.map((p) => p.id)]) {
  assert.ok(logIds.has(itemId), `no verification log for ${itemId}`);
}
for (const b of noteBlocks) {
  if (b.type === "prompt") assert.ok(prompts.some((p) => p.id === b.promptId), `note prompt block ${b.promptId} not in prompts[]`);
  if (b.type === "figure") assert.ok(!/<style|<script/i.test(b.svg), "note figure must not contain style or script");
}
for (const fig of [...workedExamples.flatMap((w) => [w.figure, w.twin.figure]), ...questions.flatMap((q) => q.figures)]) {
  if (!fig) continue;
  assert.ok(!/<style|<script/i.test(fig.src), "figure must not contain style or script");
  assert.ok(fig.src.length < 16000, "figure data URI too large");
}

// No template placeholder may survive into an emitted file.
const bundleJson = `${JSON.stringify(bundle, null, 2)}\n`;
const noteJson = `${JSON.stringify(noteBlocks, null, 2)}\n`;
for (const [name, json] of [["bundle.json", bundleJson], ["note.blocks.json", noteJson]]) {
  const leak = json.indexOf("${");
  assert.equal(leak, -1, `${name}: unexpanded placeholder at ${leak}: ${json.slice(Math.max(0, leak - 60), leak + 60)}`);
}

// ---------------------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bundle.json"), bundleJson);
fs.writeFileSync(path.join(OUT, "note.blocks.json"), noteJson);

const totalMarks = questions.reduce((a, q) => a + q.totalMarks, 0);
console.log(`written to ${path.relative(process.cwd(), OUT)}`);
console.log(
  `we ${workedExamples.length} · dx ${diagnostics[0].items.length} · q ${questions.length} (${totalMarks} marks) · ftm ${findTheMistake.length} · rp ${prompts.length} · sets ${sets.length} · ver ${logs.length}`,
);
console.log(`note blocks ${noteBlocks.length}, figures ${noteBlocks.filter((b) => b.type === "figure").length}, gates ${noteBlocks.filter((b) => b.type === "gate").length}, videos ${noteBlocks.filter((b) => b.type === "video").length}`);
console.log(`KaTeX segments compiled: ${katexSegments}`);
console.log(`graph answer specs: ${graphParts.length}, text answer specs: ${textParts.length}`);
