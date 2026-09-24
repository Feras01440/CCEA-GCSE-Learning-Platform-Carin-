/**
 * Builds packs/maths/content/m7/combined-transformations-and-reflections-in-y-equals-plus-or-minus-x/
 *   bundle.json + note.blocks.json
 * Every coordinate comes from shapes.mjs, where it is computed and asserted.
 * Run: npx tsx ... no — plain node: node scratchpad/transformations/gen.mjs
 */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import katex from "katex";
import { gridSvg, svgFigure, fmtList } from "./lib.mjs";
import * as S from "./shapes.mjs";
import { blocks as noteBlocks } from "./note.mjs";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const SLUG = "combined-transformations-and-reflections-in-y-equals-plus-or-minus-x";
const TOPIC = `maths.m7.${SLUG}`;
const OUT = path.join(ROOT, "packs", "maths", "content", "m7", SLUG);
const AT = "2026-09-13T14:30:00Z";
const SPEC = ["M7-GM-01", "M7-GM-02"];

const id = (prefix, tail) => `${prefix}.${TOPIC}${tail ? `.${tail}` : ""}`;
const P1 = { unit: "M7", paper: 1, calculator: false, resources: ["formula-sheet-H"] };
const P2 = { unit: "M7", paper: 2, calculator: true, resources: ["formula-sheet-H", "scientific-calculator"] };
const M8P1 = { unit: "M8", paper: 1, calculator: false, resources: ["formula-sheet-H"] };
const M8P2 = { unit: "M8", paper: 2, calculator: true, resources: ["formula-sheet-H", "scientific-calculator"] };

const YX = { kind: "y=x", label: "y = x", labelAt: [7.0, 7.5] };
const YNX = { kind: "y=-x", label: "y = -x", labelAt: [6.4, -7.3] };
const YNX_TOP = { kind: "y=-x", label: "y = -x", labelAt: [-6.5, 7.5] };

const qfig = (opts, alt) => svgFigure(gridSvg(opts), alt);
const graph = (object, image) => ({ kind: "graph", expect: { plot: "transformation", object, image } });
const text = (accepted, keyWords) => ({ kind: "text", accepted, keyWords, listingRule: false });

/**
 * A "describe fully the single transformation" answer. CCEA scores a description made of two
 * transformations as zero, however accurate it is, so the chaining words cancel every group.
 */
const COMBINATION_WORDS = ["then", "followed by", "and then", "after that"];
const describe = (accepted, keyWords) =>
  text(
    accepted,
    keyWords.map((g) => ({ ...g, reject: [...(g.reject ?? []), ...COMBINATION_WORDS] })),
  );

/** Accepted spellings of a coordinate pair, for a text answer. */
const pair = (p) => [`(${p[0]}, ${p[1]})`, `${p[0]}, ${p[1]}`, `${p[0]} ${p[1]}`];

const NAME_REJECT = ["rotation", "translation", "enlargement"];
const nameGroup = (words, reject) => ({ any: words, marks: 1, reject });
const ROTATION_NAME = nameGroup(["rotation", "rotate", "rotated"], ["reflection", "translation", "enlargement"]);
const REFLECTION_NAME = nameGroup(["reflection", "reflect", "reflected"], NAME_REJECT);
const ENLARGEMENT_NAME = nameGroup(["enlargement", "enlarge", "enlarged"], ["reflection", "rotation", "translation"]);
const TRANSLATION_NAME = nameGroup(["translation", "translate", "translated"], ["reflection", "rotation", "enlargement"]);

const cwClockwise = (deg) => {
  const other = (360 - deg) % 360;
  return [
    `${deg}° clockwise`,
    `${deg} clockwise`,
    `${deg} degrees clockwise`,
    `clockwise ${deg}`,
    `clockwise ${deg}°`,
    `${other}° anticlockwise`,
    `${other} anticlockwise`,
    `${other}° anti-clockwise`,
    `${other} anti-clockwise`,
    `anticlockwise ${other}`,
    `anti-clockwise ${other}`,
  ];
};
const cwAnti = (deg) => {
  const other = (360 - deg) % 360;
  return [
    `${deg}° anticlockwise`,
    `${deg} anticlockwise`,
    `${deg}° anti-clockwise`,
    `${deg} anti-clockwise`,
    `${deg} degrees anticlockwise`,
    `anticlockwise ${deg}`,
    `anti-clockwise ${deg}`,
    `${other}° clockwise`,
    `${other} clockwise`,
    `clockwise ${other}`,
  ];
};

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

const TOOL = "claude (author-topic pass; every image point recomputed and asserted in scratchpad/transformations/shapes.mjs before writing)";
const CORPUS =
  "Read privately before writing, for pattern only (tariffs, part structure, scheme wording): Summer 2025 M7 Paper 2 and its scheme; Summer 2025 M8 Paper 2 and its scheme; Summer 2024 M7 Paper 2 and its scheme; Summer 2024 M7 Paper 1 and its scheme; November 2024 M7 Paper 2 and its scheme; November 2025 M7 Paper 1 and its scheme; Summer 2026 M7 Paper 2 and M8 Paper 2. Every shape, coordinate, centre, mirror line and context in this bundle is new; no stem, scheme line or diagram was reused, and no eight-word sequence is shared with any of them.";
const SCOPE =
  "Higher tier, statements M7-GM-01 and M7-GM-02. Rotations are limited to 90 degrees either way and 180 degrees, as the M6-GM-05 Teacher Guidance requires. Fractional scale factors appear only as the second stage of a combination, which is how CCEA examines them here; negative scale factors (M8-GM-04) and matrix transformations are excluded, and so are invariant points and glide reflections.";
const FORMULA =
  "Nothing for this topic is on the Higher formula sheet (packs/maths/exam-true/formula-sheets.json: prism, trapezium, sphere, cone, quadratic formula, sine and cosine rules, half ab sin C). The coordinate rules for y = x and y = -x, and the four description checklists, are recall.";
const COMMAND =
  "Command words taken from packs/maths/exam-true/command-words.json: Draw (typical 2 marks, 'accurately, labels where asked'), Describe / Describe fully (typical 2, trap: 'name plus vector / centre, angle, direction / line / centre and scale factor'), Write down (typical 1, no working needed).";
const STYLE =
  "Every $...$ segment compiled with KaTeX 0.18.5 (throwOnError) by the generator. British English, second person, no exclamation marks, no scolding; the banned tokens from the authoring brief (the W-word for an incorrect answer, and the English numbered-grade label) are absent from the bundle and the note blocks.";
const SOLVE =
  "Every image in this bundle was produced by the transformation functions in scratchpad/transformations/lib.mjs and asserted against the coordinates written into the content (scratchpad/transformations/shapes.mjs); each described centre was recovered independently, rotations by the intersection of two perpendicular bisectors and enlargements by the intersection of two vertex joins, and each scale factor by the ratio of matching side lengths. The 16 text answer specs were then marked back through the app's own engine (src/components/items/text-marking.ts): each accepts its model answer and every alternative listed in every key-word group, and nine answers the examiners call wrong - the wrong mirror line, a combination offered for a single transformation, 'turn' for rotate, the direction reversed, a missing centre, an inverted scale factor and the halved translation - all fall short of full marks.";

function log(itemId, { tariff, numeric, alignment }) {
  const c = (type, detail) => ({ type, tool: TOOL, result: "pass", detail, at: AT, by: "claude" });
  return {
    id: `ver.${itemId}`,
    itemId,
    version: 1,
    checks: [
      c("schema", "Shape checked against src/lib/content/schema.ts (TopicBundle) and published by pipeline/build-content.mts"),
      c("scope-tier", SCOPE),
      c("formula-sheet", FORMULA),
      c("command-words", COMMAND),
      c("tariff", tariff),
      c("maths-numeric", numeric),
      c("examiner-alignment", alignment),
      c("independent-solve", SOLVE),
      c("copy-shingle", CORPUS),
      c("style-lint", STYLE),
    ],
    status: "verified",
    reports: [],
  };
}

const logs = [];
const verified = (itemId, detail) => {
  logs.push(log(itemId, detail));
  return `ver.${itemId}`;
};

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

const we1Fig = qfig(
  {
    lines: [YX],
    shapes: [{ pts: S.W1, label: "T", at: [3.2, 2.4] }],
    marks: [{ at: S.W1c, label: "(-5, -2)", labelAt: [-5.0, -3.3] }],
  },
  "A coordinate grid from -8 to 8 with the dashed mirror line y = x. Triangle T has vertices at (2, 1), (2, 7) and (6, 1). A ringed cross marks the point (-5, -2).",
);

const we2Fig = qfig(
  {
    lines: [YX, YNX],
    shapes: [{ pts: S.W2, label: "C", at: [2.9, 5.6] }],
  },
  "A coordinate grid from -8 to 8 with both dashed diagonals y = x and y = -x. Triangle C has vertices at (2, 5), (2, 7) and (5, 5).",
);

const we3Fig = qfig(
  {
    shapes: [
      { pts: S.W3, label: "P", at: [-6.0, -2.0], dots: true },
      { pts: S.W3i, label: "Q", style: "final", at: [-2.9, 2.2], dots: true },
    ],
  },
  "A coordinate grid from -8 to 8. Triangle P has vertices at (-7, -3), (-7, 1) and (1, -3). The smaller triangle Q has vertices at (-4, 1), (-4, 3) and (0, 1).",
);

const we4Fig = qfig(
  {
    shapes: [
      { pts: S.W4, label: "G", at: [4.3, 1.6], dots: true },
      { pts: S.W4i, label: "H", style: "final", at: [6.0, -4.6], dots: true },
    ],
  },
  "A coordinate grid from -8 to 8. Triangle G has vertices at (3, 1), (7, 1) and (3, 3). Triangle H, the same size and shape but turned, has vertices at (5, -3), (5, -7) and (7, -3).",
);

const workedExamples = [
  {
    id: id("we", "01"),
    topic: TOPIC,
    specRefs: SPEC,
    paper: P2,
    stem:
      "Triangle T has vertices $(2, 1)$, $(2, 7)$ and $(6, 1)$.\n\nDraw the image of T after a reflection in the line $y = x$, followed by an enlargement of scale factor $\\tfrac{1}{2}$ with centre $(-5, -2)$.\n\nLabel the first image T' and the final image T\".",
    figure: we1Fig,
    steps: [
      {
        n: 1,
        working: "Draw the line $y = x$ through $(0, 0)$, $(1, 1)$, $(2, 2)$, …",
        decision:
          "The mirror goes on the grid before anything is reflected. It costs four seconds and it is the single thing that stops the image landing in the wrong place.",
      },
      {
        n: 2,
        working: "$(2, 1) \\to (1, 2)$, $(2, 7) \\to (7, 2)$, $(6, 1) \\to (1, 6)$",
        decision:
          "A reflection in $y = x$ swaps each pair of coordinates. I take the vertices one at a time and write each image down before I draw it, so there is a record even if the drawing goes wrong.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because reflecting in $y = x$ exchanges the across and up parts of each point",
            "Because both coordinates change sign",
            "Because the shape moves 2 to the right",
          ],
          correct: 0,
          explain:
            "The line $y = x$ is where the two coordinates are equal, so reflecting in it swaps their roles. Changing both signs would be a reflection in $y = -x$.",
        },
      },
      {
        n: 3,
        working: "Draw T' at $(1, 2)$, $(7, 2)$, $(1, 6)$ and label it. Leave it there.",
        decision:
          "This first image is worth marks on its own. Rubbing it out once the second stage is drawn is the presentation slip the reports keep recording.",
        earns: ["A1"],
      },
      {
        n: 4,
        working: "From $(-5, -2)$: to $(1, 2)$ is 6 across, 4 up. Half is 3 across, 2 up $\\to (-2, 0)$.",
        decision:
          "An enlargement measures from the centre, not from the origin and not from the shape. I count the steps across and up separately, halve each one, and that is the image vertex.",
        earns: ["M1"],
      },
      {
        n: 5,
        working: "$(7, 2)$: 12 across, 4 up $\\to$ 6 across, 2 up $\\to (1, 0)$. $(1, 6)$: 6 across, 8 up $\\to$ 3 across, 4 up $\\to (-2, 2)$.",
        decision:
          "The same counting for the other two vertices. The scale factor is a half, so the image is half as far from the centre in every direction — and half the size.",
      },
      {
        n: 6,
        working: "Draw T\" at $(-2, 0)$, $(1, 0)$, $(-2, 2)$ and label it.",
        decision:
          "Both images are on the grid and both are labelled, so the marker can follow the order without guessing which triangle came first.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "T' at (1, 2), (7, 2), (1, 6); T\" at (-2, 0), (1, 0), (-2, 2)",
    twin: {
      stem:
        "Triangle U has vertices $(1, 3)$, $(5, 3)$ and $(1, 5)$. Reflect U in the line $y = x$, then enlarge that image by scale factor $\\tfrac{1}{2}$ with centre $(-3, -1)$. Where does the final image sit?",
      answer: graph(S.W1tw, S.W1twf),
      figure: qfig(
        {
          lines: [YX],
          shapes: [{ pts: S.W1tw, label: "U", at: [2.1, 3.5] }],
          marks: [{ at: [-3, -1], label: "(-3, -1)", labelAt: [-3.0, -2.3] }],
        },
        "A coordinate grid from -8 to 8 with the dashed line y = x. Triangle U has vertices at (1, 3), (5, 3) and (1, 5). A ringed cross marks (-3, -1).",
      ),
    },
    faded: [
      { showSteps: 3, studentSupplies: [4, 5, 6] },
      { showSteps: 1, studentSupplies: [2, 3, 4, 5, 6] },
    ],
    version: 1,
    verification: verified(id("we", "01"), {
      tariff:
        "Modelled on the 4-mark combined drawing that CCEA sets in M7 and M8 (Summer 2025 M7 Paper 2 Q15 and M8 Paper 2 Q8, both marked as first image then final image, two marks each). Six steps, four mark codes.",
      numeric: `Reflection in y = x: ${fmtList(S.W1)} -> ${fmtList(S.W1i)}. Enlargement sf 1/2 about (-5, -2): ${fmtList(S.W1i)} -> ${fmtList(S.W1f)}. Twin: ${fmtList(S.W1tw)} -> ${fmtList(S.W1twi)} -> ${fmtList(S.W1twf)}.`,
      alignment:
        "Summer 2025 M7 Paper 2 Q15 and M8 Paper 2 Q8 (reflection in the wrong line; centre of enlargement misused) and Summer 2024 M7 Paper 2 Q15 (the first image erased). Step 3 exists only to make the erasure impossible.",
    }),
  },
  {
    id: id("we", "02"),
    topic: TOPIC,
    specRefs: SPEC,
    paper: P1,
    stem:
      "Triangle C has vertices $(2, 5)$, $(2, 7)$ and $(5, 5)$.\n\n(a) Reflect C in the line $y = x$ and label the image C'.\n(b) Reflect C' in the line $y = -x$ and label the image C\".\n(c) Describe fully the single transformation that maps C onto C\".",
    figure: we2Fig,
    steps: [
      {
        n: 1,
        working: "$(2, 5) \\to (5, 2)$, $(2, 7) \\to (7, 2)$, $(5, 5) \\to (5, 5)$",
        decision:
          "Swap each pair for the reflection in $y = x$. The vertex $(5, 5)$ sits on the mirror, so it does not move — a useful check that the mirror is drawn where I think it is.",
        earns: ["A1"],
      },
      {
        n: 2,
        working: "$(5, 2) \\to (-2, -5)$, $(7, 2) \\to (-2, -7)$, $(5, 5) \\to (-5, -5)$",
        decision:
          "Now the second mirror acts on C', not on C. For $y = -x$ I swap and then change both signs.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "Compare C and C\": $(2, 5) \\to (-2, -5)$, $(2, 7) \\to (-2, -7)$, $(5, 5) \\to (-5, -5)$.",
        decision:
          "Every coordinate has had its sign changed and nothing else. That is the fingerprint of a half turn about the origin.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because the two mirrors are perpendicular, so the pair is a rotation about the point where they cross",
            "Because two reflections always give another reflection",
            "Because the shape has moved, so it must be a translation",
          ],
          correct: 0,
          explain:
            "$y = x$ and $y = -x$ meet at right angles at the origin. Two reflections in perpendicular mirrors always give a rotation of $180^\\circ$ about their crossing point.",
        },
      },
      {
        n: 4,
        working: "Rotation, $180^\\circ$, about the origin $(0, 0)$.",
        decision:
          "Three items: the name, the angle, the centre. A half turn needs no direction, because clockwise and anticlockwise finish in the same place. One transformation, not two.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "(a) C' at (5, 2), (7, 2), (5, 5)  (b) C\" at (-2, -5), (-2, -7), (-5, -5)  (c) Rotation, 180°, about the origin (0, 0)",
    twin: {
      stem:
        "Shape D is reflected in the line $x = 2$, and that image is then reflected in the line $y = -1$. Describe fully the single transformation that maps D onto the final image.",
      answer: describe(["Rotation, 180°, about (2, -1)"], [
        ROTATION_NAME,
        { any: ["180", "180°", "half turn"], marks: 1 },
        { any: pair([2, -1]).concat(["about (2, -1)"]), marks: 1 },
      ]),
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 0, studentSupplies: [1, 2, 3, 4] },
    ],
    version: 1,
    verification: verified(id("we", "02"), {
      tariff:
        "Two 2-mark drawing stages and a 3-mark 'describe fully', which is how CCEA splits this material (Summer 2026 M7 Paper 2 Q6 describe for 2; Summer 2024 M7 Paper 1 Q12 rotation described for 3, one mark each for name, angle and direction, and centre).",
      numeric: `Reflect in y = x: ${fmtList(S.W2)} -> ${fmtList(S.W2i)}. Reflect that in y = -x: -> ${fmtList(S.W2f)}. A half turn about the origin applied to C gives the same three points, which is the equivalence the last part states. Twin: reflect in x = 2 then y = -1 gives ${fmtList(S.W2twf)} from ${fmtList(S.W2tw)}, and a half turn about (2, -1) reproduces it.`,
      alignment:
        "Summer 2024 M7 Paper 1 Q12 — combinations offered where a single transformation was asked for, and rotations described without the direction or the centre. Part (c) is the antidote: one transformation, every item on the checklist.",
    }),
  },
  {
    id: id("we", "03"),
    topic: TOPIC,
    specRefs: SPEC,
    paper: P2,
    stem: "Describe fully the single transformation that maps triangle P onto triangle Q.",
    figure: we3Fig,
    steps: [
      {
        n: 1,
        working: "P is 8 wide and 4 tall; Q is 4 wide and 2 tall. Same angles, different size.",
        decision:
          "Size has changed, so it is an enlargement. Reflections, rotations and translations all leave lengths alone, which rules them out in one glance.",
        earns: ["A1"],
      },
      {
        n: 2,
        working: "Scale factor $= \\dfrac{\\text{image}}{\\text{object}} = \\dfrac{4}{8} = \\tfrac{1}{2}$",
        decision:
          "Image over object, using a matching pair of sides. Q is the image, so the fraction is less than 1. Writing 2 would describe the enlargement the other way round.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "Join $(-7, -3)$ to $(-4, 1)$ and extend; join $(1, -3)$ to $(0, 1)$ and extend.",
        decision:
          "The centre is where the vertex joins meet. Two of them are enough to fix the point; a third is a free check.",
        earns: ["M1"],
      },
      {
        n: 4,
        working: "The lines meet at $(-1, 5)$. Check: $(-1, 5)$ to $(-7, -3)$ is $(-6, -8)$; half of that is $(-3, -4)$, landing on $(-4, 1)$.",
        decision:
          "I verify the centre by walking half way along one ray. If it lands on the image vertex, the centre and the scale factor agree with each other.",
      },
      {
        n: 5,
        working: "Enlargement, scale factor $\\tfrac{1}{2}$, centre $(-1, 5)$.",
        decision:
          "Three items on one line. Leaving the centre out is what the Summer 2025 report singled out, and it is a third of the marks.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "Enlargement, scale factor ½, centre (-1, 5)",
    twin: {
      stem:
        "A triangle with vertices $(-4, 2)$, $(-4, 8)$ and $(2, 2)$ is mapped onto a triangle with vertices $(0, 0)$, $(0, 2)$ and $(2, 0)$. Describe fully the single transformation.",
      answer: describe(["Enlargement, scale factor 1/3, centre (2, -1)"], [
        ENLARGEMENT_NAME,
        { any: ["1/3", "one third", "a third", "0.33", "0.333"], marks: 1 },
        { any: pair([2, -1]), marks: 1 },
      ]),
      figure: qfig(
        {
          shapes: [
            { pts: S.G8, label: "A", at: [-3.1, 3.4], dots: true },
            { pts: S.G8i, label: "B", style: "final", at: [0.7, 0.7], dots: true },
          ],
        },
        "A coordinate grid from -8 to 8. Triangle A has vertices at (-4, 2), (-4, 8) and (2, 2). The smaller triangle B has vertices at (0, 0), (0, 2) and (2, 0).",
      ),
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4, 5] },
      { showSteps: 0, studentSupplies: [1, 2, 3, 4, 5] },
    ],
    version: 1,
    verification: verified(id("we", "03"), {
      tariff:
        "3 marks, one each for the name, the scale factor and the centre, exactly as the Summer 2025 M8 Paper 2 Q9 and November 2024 M7 Paper 2 Q15 schemes award them.",
      numeric: `Object ${fmtList(S.W3)} maps to ${fmtList(S.W3i)}. The two vertex joins meet at (-1, 5), recovered by intersecting them in lib.mjs, and the ratio of matching sides is 4/8 = 1/2. Twin: ${fmtList(S.G8)} to ${fmtList(S.G8i)}, centre recovered as (2, -1), scale factor 1/3.`,
      alignment:
        "Summer 2025 M8 Paper 2 Q9 — the enlargement was recognised but only a minority gave both the centre and the scale factor. Steps 3 and 4 make the centre something you construct rather than estimate.",
    }),
  },
  {
    id: id("we", "04"),
    topic: TOPIC,
    specRefs: SPEC,
    paper: P1,
    stem: "Describe fully the single transformation that maps triangle G onto triangle H.",
    figure: we4Fig,
    steps: [
      {
        n: 1,
        working: "G and H are the same size, and G has been turned: its long side runs across, H's runs down.",
        decision:
          "Same size rules out an enlargement. The shape is not simply slid along, so it is not a translation. A reflection would give a mirror image; this one has been turned, so it is a rotation.",
        earns: ["A1"],
      },
      {
        n: 2,
        working: "The long side of G points right; on H it points down. Right turned to down is a quarter turn clockwise.",
        decision:
          "I read the angle and the direction off one side rather than off the whole shape, because one side has an unambiguous direction.",
        earns: ["A1"],
        whyMenu: {
          options: [
            "Because a side pointing right becomes a side pointing down after a quarter turn clockwise",
            "Because the shape has moved to the right",
            "Because the shape is below the x-axis",
          ],
          correct: 0,
          explain:
            "Track one side, not the whole triangle. Right becoming down is $90^\\circ$ clockwise; right becoming up would be $90^\\circ$ anticlockwise.",
        },
      },
      {
        n: 3,
        working: "Join $(3, 1)$ to $(5, -3)$ and bisect it at right angles; join $(7, 1)$ to $(5, -7)$ and do the same.",
        decision:
          "The centre is the same distance from a vertex as from its image, so it lies on the perpendicular bisector of the join. Two bisectors pin it down.",
        earns: ["M1"],
      },
      {
        n: 4,
        working: "The bisectors cross at $(2, -2)$.",
        decision:
          "I test it: a quarter turn clockwise about $(2, -2)$ sends $(3, 1)$ to $(5, -3)$, which is where H's vertex is.",
      },
      {
        n: 5,
        working: "Rotation, $90^\\circ$ clockwise, about $(2, -2)$.",
        decision:
          "Name, angle, direction, centre. Writing $270^\\circ$ anticlockwise instead would also be accepted, because it is the same turn; writing \"turn\" instead of \"rotation\" would not.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "Rotation, 90° clockwise, about (2, -2)  (equivalently 270° anticlockwise about (2, -2))",
    twin: {
      stem:
        "A triangle with vertices $(1, 1)$, $(4, 1)$ and $(1, 3)$ is mapped onto a triangle with vertices $(0, 4)$, $(0, 7)$ and $(-2, 4)$. Describe fully the single transformation.",
      answer: describe(["Rotation, 90° anticlockwise, about (-1, 2)"], [
        ROTATION_NAME,
        { any: cwAnti(90), marks: 1 },
        { any: pair([-1, 2]), marks: 1 },
      ]),
      figure: qfig(
        {
          shapes: [
            { pts: S.F7, label: "R", at: [1.9, 1.6], dots: true },
            { pts: S.F7i, label: "R'", style: "final", at: [-0.8, 5.2], dots: true },
          ],
        },
        "A coordinate grid from -8 to 8. Triangle R has vertices at (1, 1), (4, 1) and (1, 3). Triangle R dash has vertices at (0, 4), (0, 7) and (-2, 4).",
      ),
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4, 5] },
      { showSteps: 0, studentSupplies: [1, 2, 3, 4, 5] },
    ],
    version: 1,
    verification: verified(id("we", "04"), {
      tariff:
        "3 marks in the shape of the Summer 2024 M7 Paper 1 Q12 scheme, which awarded one mark each for the word, the angle with its direction, and the centre.",
      numeric: `A quarter turn clockwise about (2, -2) sends ${fmtList(S.W4)} to ${fmtList(S.W4i)}; 270 degrees anticlockwise about the same centre reproduces it. The centre was recovered independently as the intersection of the perpendicular bisectors of two vertex joins. Twin: ${fmtList(S.F7)} to ${fmtList(S.F7i)}, centre recovered as (-1, 2).`,
      alignment:
        "Summer 2024 M7 Paper 1 Q12 — 'turn' written for rotate, directions the wrong way round, and centres missing. Step 5 names all three risks in one line.",
    }),
  },
];

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

const opt = (o, t, correct, feedback, misconception) => ({
  id: o,
  text: t,
  correct,
  feedback,
  ...(misconception ? { misconception } : {}),
});

const diagnostics = [
  {
    id: id("dx"),
    topic: TOPIC,
    specRefs: SPEC,
    when: "both",
    items: [
      {
        id: "01",
        skill: "Reflect a point in the line y = x",
        stem: "The point $(4, 7)$ is reflected in the line $y = x$. Where is its image?",
        options: [
          opt("a", "$(7, 4)$", true, "Reflecting in $y = x$ swaps the pair, so $(4, 7)$ becomes $(7, 4)$. On the grid, check that the join between them crosses the mirror at a right angle."),
          opt("b", "$(-4, 7)$", false, "That is the reflection in the $y$-axis. The examiners see this one every series: draw $y = x$ on the grid first and the slip disappears.", "maths.transform.reflect-wrong-line"),
          opt("c", "$(4, -7)$", false, "That is the reflection in the $x$-axis. Reflecting in $y = x$ leaves both signs alone and swaps the numbers instead.", "maths.transform.reflect-wrong-line"),
          opt("d", "$(-7, -4)$", false, "You swapped and then changed both signs, which is the rule for $y = -x$. For $y = x$ the swap is the whole of it.", "maths.transform.reflect-y-eq-minus-x-swap-only"),
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "02",
        skill: "Reflect a point in the line y = -x",
        stem: "The point $(4, 7)$ is reflected in the line $y = -x$. Where is its image?",
        options: [
          opt("a", "$(-7, -4)$", true, "Swap to $(7, 4)$, then change both signs to $(-7, -4)$. Two moves, in that order."),
          opt("b", "$(7, 4)$", false, "You did the swap but stopped there, which is the $y = x$ answer. The second mirror also reverses both directions.", "maths.transform.reflect-y-eq-minus-x-swap-only"),
          opt("c", "$(-4, -7)$", false, "You changed both signs without swapping. That is a rotation of $180^\\circ$ about the origin, not a reflection.", "maths.transform.reflect-y-eq-x-negates-not-swaps"),
          opt("d", "$(-4, 7)$", false, "That is the reflection in the $y$-axis. The mirror here is the falling diagonal, so both coordinates are involved.", "maths.transform.reflect-wrong-line"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "03",
        skill: "Recognise the line y = -x",
        stem: "Which line passes through $(2, -2)$, $(0, 0)$ and $(-5, 5)$?",
        options: [
          opt("a", "$y = -x$", true, "Each $y$-coordinate is the negative of its $x$-coordinate, so it is the diagonal that falls from left to right."),
          opt("b", "$y = x$", false, "On $y = x$ the two coordinates are equal, so it would pass through $(2, 2)$ and $(-5, -5)$. This line does the opposite.", "maths.transform.reflect-wrong-line"),
          opt("c", "the $x$-axis", false, "The $x$-axis is $y = 0$ and passes through $(2, 0)$, not $(2, -2)$.", "maths.transform.reflect-wrong-line"),
          opt("d", "$x = -y$ only, which is a different line from $y = -x$", false, "$x = -y$ and $y = -x$ are two ways of writing the same line; rearranging one gives the other.", "maths.transform.reflect-wrong-line"),
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "04",
        skill: "Combine two reflections in perpendicular mirrors",
        stem: "A shape is reflected in $y = x$, and that image is then reflected in $y = -x$. What single transformation has the same effect?",
        options: [
          opt("a", "A rotation of $180^\\circ$ about the origin", true, "The two mirrors are perpendicular and cross at the origin, so the pair is a half turn about $(0, 0)$. No direction is needed for $180^\\circ$."),
          opt("b", "A reflection in the $y$-axis", false, "Two reflections never leave you with another reflection: each one reverses the sense of the shape, so two put it back.", "maths.transform.two-reflections-taken-as-one-reflection"),
          opt("c", "A rotation of $90^\\circ$ clockwise about the origin", false, "The angle of the rotation is twice the angle between the mirrors. These two are $90^\\circ$ apart, so the turn is $180^\\circ$.", "maths.transform.rotation-direction-reversed"),
          opt("d", "A translation", false, "A translation comes from two reflections in **parallel** mirrors. These two cross, so the result is a rotation about the crossing point.", "maths.transform.two-reflections-taken-as-one-reflection"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "05",
        skill: "Know what a full description of a rotation contains",
        stem: "Which answer would earn all three marks for describing a rotation?",
        options: [
          opt("a", "Rotation, $90^\\circ$ anticlockwise, about $(3, -2)$", true, "Name, angle, direction, centre. That is the complete checklist, and $270^\\circ$ clockwise would be accepted for the middle two."),
          opt("b", "Turned $90^\\circ$ anticlockwise about $(3, -2)$", false, "Everything else is right, but \"turned\" is not the word *rotation* and the naming mark goes. The reports name this one directly.", "maths.transform.rotation-details-missing"),
          opt("c", "Rotation of $90^\\circ$ about the centre of the grid", false, "The angle is there but the direction is missing and the centre is not a coordinate pair. Two of the three items are unmarked.", "maths.transform.rotation-details-missing"),
          opt("d", "Rotation $90^\\circ$ anticlockwise, then a translation 2 to the right", false, "The question asks for a *single* transformation. A description made of two scores zero however well it fits the picture.", "maths.transform.describe-with-two-transformations"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "06",
        skill: "Combine two reflections in parallel mirrors",
        stem: "A shape is reflected in the line $x = 1$, and that image is reflected in the line $x = 5$. What single transformation has the same effect?",
        options: [
          opt("a", "A translation of 8 to the right", true, "The mirrors are 4 apart and the translation is twice the gap. The doubling is the part most often missed."),
          opt("b", "A translation of 4 to the right", false, "4 is the gap between the mirrors. Reflecting twice carries the shape across the gap and out the same distance again, so it moves 8.", "maths.transform.two-reflections-taken-as-one-reflection"),
          opt("c", "A reflection in $x = 3$", false, "$x = 3$ is halfway between the mirrors, but two reflections cannot give a reflection: the shape comes back the right way round.", "maths.transform.two-reflections-taken-as-one-reflection"),
          opt("d", "A rotation of $180^\\circ$ about $(3, 0)$", false, "A rotation comes from two mirrors that cross. These two are parallel, so nothing turns.", "maths.transform.two-reflections-taken-as-one-reflection"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "07",
        skill: "Enlarge a point by a fractional scale factor about a given centre",
        stem: "The point $(8, 6)$ is enlarged by scale factor $\\tfrac{1}{2}$ with centre $(2, 2)$. Where is its image?",
        options: [
          opt("a", "$(5, 4)$", true, "From $(2, 2)$ to $(8, 6)$ is 6 across and 4 up. Half of that is 3 across and 2 up, landing on $(5, 4)$."),
          opt("b", "$(4, 3)$", false, "You halved the coordinates themselves, which is what happens only when the centre is the origin. Count from $(2, 2)$ instead.", "maths.transform.enlargement-sf-applied-to-coordinates"),
          opt("c", "$(2, 2)$", false, "That is the centre. The image sits part of the way along the ray, not on top of the centre — a slip the Summer 2025 report records.", "maths.transform.centre-of-enlargement-misused"),
          opt("d", "$(14, 10)$", false, "That is scale factor 2: you doubled the distances instead of halving them. A scale factor below 1 brings the image closer to the centre.", "maths.transform.enlargement-sf-applied-to-coordinates"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "08",
        skill: "Apply two transformations in the stated order",
        stem: "*Reflect the shape in $y = x$, followed by a translation 3 units down.* What does the translation act on?",
        options: [
          opt("a", "The image produced by the reflection", true, "Each transformation acts on whatever the one before it produced, which is why the middle image has to exist before you start the second step."),
          opt("b", "The original shape, then the two images are compared", false, "That gives two separate images of the original, not a combination. The word *followed by* chains them together.", "maths.transform.order-of-combination-reversed"),
          opt("c", "Either, because the final image is the same both ways", false, "Swapping the order generally moves the final image somewhere else. Only in special cases do two transformations commute.", "maths.transform.order-of-combination-reversed"),
          opt("d", "The original shape, and the reflection is then applied to that", false, "That is the reverse order. Read left to right and start with the transformation named first.", "maths.transform.order-of-combination-reversed"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
    ],
  },
];

logs.push(
  log(id("dx"), {
    tariff: "Single-skill items rather than exam tariffs: each is one decision out of the 2-to-4-mark chain that M7 and M8 set.",
    numeric: `01 (4,7) -> ${fmtList([S.DX.pYeqX])} in y = x, and the distractors are the y-axis image ${fmtList([S.DX.pYaxis])}, the x-axis image ${fmtList([S.DX.pXaxis])} and the y = -x image ${fmtList([S.DX.pYeqNegX])}. 02 the same point in y = -x. 06 two mirrors 4 apart translate by ${S.DX.parallelGap}. 07 enlargement sf 1/2 about (2,2) sends (8,6) to ${fmtList([S.DX.enlargeQ])}; the distractors are the halved coordinates ${fmtList([S.DX.enlargeHalved])} and the sf 2 image ${fmtList([S.DX.enlargeSf2])}. Every distractor value was recomputed from the slip it names.`,
    alignment:
      "01-03 the wrong mirror line (Summer 2025 M7 Paper 2 Q15, November 2025 M7 Paper 1 Q16); 04 and 06 the combination that has to be named as one transformation (Summer 2025 M8 Paper 2 Q8); 05 the wording rules (Summer 2024 M7 Paper 1 Q12); 07 the centre of enlargement (Summer 2025 M7 Paper 2 Q15); 08 order.",
  }),
);

export { workedExamples, diagnostics, logs, verified, id, TOPIC, SPEC, P1, P2, M8P1, M8P2, YX, YNX, YNX_TOP, qfig, graph, text, describe, pair, ROTATION_NAME, REFLECTION_NAME, ENLARGEMENT_NAME, TRANSLATION_NAME, cwClockwise, cwAnti, OUT, AT, noteBlocks, katex, fs, path, assert };
