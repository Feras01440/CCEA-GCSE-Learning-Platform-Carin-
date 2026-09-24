/** Questions, find-the-mistake items and retrieval prompts. Every coordinate comes from shapes.mjs. */
import * as S from "./shapes.mjs";
import { fmtList, fmt } from "./lib.mjs";
import {
  id,
  TOPIC,
  SPEC,
  P1,
  P2,
  M8P1,
  M8P2,
  YX,
  YNX,
  YNX_TOP,
  qfig,
  graph,
  text,
  describe,
  pair,
  ROTATION_NAME,
  REFLECTION_NAME,
  ENLARGEMENT_NAME,
  TRANSLATION_NAME,
  cwClockwise,
  cwAnti,
  verified,
} from "./gen.mjs";

const qid = (n) => id("q", String(n).padStart(4, "0"));
const ce = (misconception, pattern, feedback, marksTypicallyEarned, source) => ({
  misconception,
  pattern,
  feedback,
  marksTypicallyEarned,
  ...(source ? { source } : {}),
});
const tp = (regex) => ({ kind: "text", regex });
const gp = (test) => ({ kind: "graph", test });

const SRC = {
  m7p2_2025: "ccea-cer:maths:2025-summer:M72:Q15",
  m8p2_2025: "ccea-cer:maths:2025-summer:M82:Q8",
  m8p2_2025q9: "ccea-cer:maths:2025-summer:M82:Q9",
  m7p2_2024: "ccea-cer:maths:2024-summer:M72:Q15",
  m7p1_2024: "ccea-cer:maths:2024-summer:M71:Q12",
  m7p2_2024n: "ccea-cer:maths:2024-november:M72:Q15",
  m7p1_2025n: "ccea-cer:maths:2025-november:M71:Q16",
  m8p2_2024: "ccea-cer:maths:2024-summer:M82:Q6",
};

const q = (n, o) => {
  const totalMarks = o.parts.reduce((a, p) => a + p.marks, 0);
  return {
    id: qid(n),
    topic: TOPIC,
    specRefs: o.specRefs ?? SPEC,
    paper: o.paper,
    tier: "H",
    style: o.style,
    difficulty: o.difficulty,
    ao: o.ao,
    commandWords: o.commandWords,
    emphasis: o.emphasis,
    context: { setting: o.setting, original: true },
    figures: o.figures,
    parts: o.parts,
    totalMarks,
    timeAllowanceSec: totalMarks * 90,
    skeleton: o.skeleton,
    examinerSources: o.examinerSources,
    solutionProgram: o.solutionProgram,
    verification: verified(qid(n), o.verification),
    version: 1,
  };
};

// --- 0001 ------------------------------------------------------------------
const q1 = q(1, {
  paper: P1,
  style: "practice",
  difficulty: 1,
  ao: ["AO1"],
  commandWords: ["Write down"],
  emphasis: ["reflection in y = x", "coordinates of an image"],
  setting: "A single point on a coordinate grid, no context",
  figures: [
    qfig(
      { lines: [YX], marks: [{ at: S.Q1, kind: "point", label: `A ${fmt(S.Q1)}`, labelAt: [5.4, -3.1] }] },
      "A coordinate grid from -8 to 8 with the dashed mirror line y = x drawn through the origin. The point A is marked at (6, -2).",
    ),
  ],
  skeleton: "(main)write1",
  examinerSources: [SRC.m7p1_2025n],
  solutionProgram: "reflect (6, -2) in y = x: swap the pair -> (-2, 6)",
  parts: [
    {
      id: "main",
      marks: 1,
      stem: `The point $A$ has coordinates $${fmt(S.Q1)}$.\n\nWrite down the coordinates of the image of $A$ after a reflection in the line $y = x$.`,
      answer: text([fmt(S.Q1a)], [{ any: pair(S.Q1a), marks: 1 }]),
      scheme: [{ id: "A1", code: "A", marks: 1, for: `${fmt(S.Q1a)}`, accept: ["x = -2, y = 6"] }],
      hints: ["Reflecting in $y = x$ swaps the two coordinates.", "The signs are not touched — swap the pair exactly as it stands."],
      workedSolution: `Reflection in $y = x$ swaps the coordinates, so $${fmt(S.Q1)} \\to ${fmt(S.Q1a)}$.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          tp("\\(?\\s*-6\\s*,\\s*-2\\s*\\)?"),
          "That is the reflection in the $y$-axis. Draw $y = x$ on the grid and the two answers stop looking alike.",
          0,
          SRC.m7p1_2025n,
        ),
        ce(
          "maths.transform.reflect-y-eq-minus-x-swap-only",
          tp("\\(?\\s*2\\s*,\\s*-6\\s*\\)?"),
          "You swapped and then changed both signs, which is the rule for $y = -x$. For $y = x$ the swap is the whole of it.",
          0,
          SRC.m7p2_2025,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "1 mark, 'Write down' (packs/maths/exam-true/command-words.json: typical tariff 1, no working needed).",
    numeric: `reflect ${fmt(S.Q1)} in y = x -> ${fmt(S.Q1a)}; the two distractor values are the y-axis image (-6, -2) and the y = -x image ${fmt(S.Q2a)}.`,
    alignment: "November 2025 M7 Paper 1 Q16 — most reflected correctly in y = x, but some used the y-axis or a half turn instead.",
  },
});

// --- 0002 ------------------------------------------------------------------
const q2 = q(2, {
  paper: P1,
  style: "practice",
  difficulty: 1,
  ao: ["AO1"],
  commandWords: ["Write down"],
  emphasis: ["reflection in y = -x", "coordinates of an image"],
  setting: "A single point on a coordinate grid, no context",
  figures: [
    qfig(
      { lines: [YNX_TOP], marks: [{ at: S.Q1, kind: "point", label: `A ${fmt(S.Q1)}`, labelAt: [5.4, -3.1] }] },
      "A coordinate grid from -8 to 8 with the dashed mirror line y = -x drawn through the origin. The point A is marked at (6, -2).",
    ),
  ],
  skeleton: "(main)write1",
  examinerSources: [SRC.m7p2_2025],
  solutionProgram: "reflect (6, -2) in y = -x: swap then change both signs -> (2, -6)",
  parts: [
    {
      id: "main",
      marks: 1,
      stem: `The point $A$ has coordinates $${fmt(S.Q1)}$.\n\nWrite down the coordinates of the image of $A$ after a reflection in the line $y = -x$.`,
      answer: text([fmt(S.Q2a)], [{ any: pair(S.Q2a), marks: 1 }]),
      scheme: [{ id: "A1", code: "A", marks: 1, for: `${fmt(S.Q2a)}`, accept: ["x = 2, y = -6"] }],
      hints: ["Swap the coordinates first.", "Then change the sign of both of them."],
      workedSolution: `Swap to get $${fmt(S.Q1a)}$, then change both signs: $${fmt(S.Q2a)}$.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-y-eq-minus-x-swap-only",
          tp("\\(?\\s*-2\\s*,\\s*6\\s*\\)?"),
          "You stopped after the swap, which is the $y = x$ answer. The falling diagonal also reverses both directions.",
          0,
          SRC.m7p2_2025,
        ),
        ce(
          "maths.transform.reflect-y-eq-x-negates-not-swaps",
          tp("\\(?\\s*-6\\s*,\\s*2\\s*\\)?"),
          "Both signs changed but the pair was not swapped, so that is a half turn about the origin rather than a reflection.",
          0,
          SRC.m7p1_2025n,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "1 mark, 'Write down'.",
    numeric: `reflect ${fmt(S.Q1)} in y = -x -> ${fmt(S.Q2a)}; the swap-only slip gives ${fmt(S.Q1a)} and the sign-only slip gives (-6, 2).`,
    alignment: "Summer 2025 M7 Paper 2 Q15 — reflections in y = -x were offered where y = x was asked for, and the two rules are only told apart by practising both.",
  },
});

// --- 0003 ------------------------------------------------------------------
const q3 = q(3, {
  paper: P1,
  style: "practice",
  difficulty: 2,
  ao: ["AO1"],
  commandWords: ["Draw"],
  emphasis: ["reflection in y = x", "drawing an image"],
  setting: "A triangle on a coordinate grid, no context",
  figures: [
    qfig(
      { lines: [YX], shapes: [{ pts: S.Q3, label: "A", at: [4.4, 1.7], dots: true }] },
      "A coordinate grid from -8 to 8 with the dashed line y = x. Triangle A has vertices at (3, 1), (8, 1) and (3, 4).",
    ),
  ],
  skeleton: "(main)draw2",
  examinerSources: [SRC.m7p1_2025n],
  solutionProgram: "reflect each vertex in y = x by swapping its coordinates",
  parts: [
    {
      id: "main",
      marks: 2,
      stem: `Triangle $A$ has vertices $${fmt(S.Q3[0])}$, $${fmt(S.Q3[1])}$ and $${fmt(S.Q3[2])}$.\n\nDraw the image of triangle $A$ after a reflection in the line $y = x$.`,
      answer: graph(S.Q3, S.Q3i),
      scheme: [
        {
          id: "A1",
          code: "A",
          marks: 2,
          for: `correct reflection, vertices ${fmtList(S.Q3i)}`,
          examinerNote: "Award 1 mark for two vertices in the correct position.",
        },
      ],
      hints: ["Draw the line $y = x$ on the grid first.", "Swap the coordinates of one vertex, mark it, then do the next.", "Join the three image points up when all of them are marked."],
      workedSolution: `Swapping each pair: $${fmt(S.Q3[0])} \\to ${fmt(S.Q3i[0])}$, $${fmt(S.Q3[1])} \\to ${fmt(S.Q3i[1])}$, $${fmt(S.Q3[2])} \\to ${fmt(S.Q3i[2])}$.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          gp(`image drawn at ${fmtList(S.Q3wrong)}, the reflection in the y-axis`),
          `A reflection in the $y$-axis puts the triangle at ${fmtList(S.Q3wrong)}. The mirror here is the rising diagonal, so both coordinates move.`,
          0,
          SRC.m7p1_2025n,
        ),
        ce(
          "maths.transform.mirror-line-not-drawn",
          gp(`image drawn at ${fmtList(S.Q3unmoved)}, the object left exactly where it is`),
          "The triangle has not moved, which is what happens when the mirror was never drawn and there was nothing to reflect across. Put $y = x$ on the grid first, then swap one vertex at a time.",
          0,
          SRC.m8p2_2024,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "2 marks for a single reflection drawn on a grid, as in November 2025 M7 Paper 1 Q16 (A2, with 1 mark for two vertices correct).",
    numeric: `${fmtList(S.Q3)} reflected in y = x gives ${fmtList(S.Q3i)}; the y-axis slip gives ${fmtList(S.Q3wrong)}.`,
    alignment: "November 2025 M7 Paper 1 Q16 — most candidates were correct, but the y-axis and a 180 degree rotation were the two wrong routes recorded.",
  },
});

// --- 0004 ------------------------------------------------------------------
const q4 = q(4, {
  paper: P2,
  style: "practice",
  difficulty: 2,
  ao: ["AO1"],
  commandWords: ["Draw"],
  emphasis: ["reflection in y = -x", "drawing an image"],
  setting: "A triangle on a coordinate grid, no context",
  figures: [
    qfig(
      { lines: [YNX], shapes: [{ pts: S.Q4, label: "B", at: [3.5, 3.8], dots: true }] },
      "A coordinate grid from -8 to 8 with the dashed line y = -x. Triangle B has vertices at (1, 3), (5, 3) and (5, 6).",
    ),
  ],
  skeleton: "(main)draw2",
  examinerSources: [SRC.m8p2_2024],
  solutionProgram: "reflect each vertex in y = -x: swap, then change both signs",
  parts: [
    {
      id: "main",
      marks: 2,
      stem: `Triangle $B$ has vertices $${fmt(S.Q4[0])}$, $${fmt(S.Q4[1])}$ and $${fmt(S.Q4[2])}$.\n\nDraw the image of triangle $B$ after a reflection in the line $y = -x$.`,
      answer: graph(S.Q4, S.Q4i),
      scheme: [
        {
          id: "A1",
          code: "A",
          marks: 2,
          for: `correct reflection, vertices ${fmtList(S.Q4i)}`,
          examinerNote: "Award 1 mark for two vertices in the correct position.",
        },
      ],
      hints: ["The mirror falls from the top left to the bottom right.", "Swap each pair of coordinates, then change both signs.", "Check one vertex by measuring: it should be the same distance from the mirror as its image."],
      workedSolution: `$${fmt(S.Q4[0])} \\to ${fmt(S.Q4i[0])}$, $${fmt(S.Q4[1])} \\to ${fmt(S.Q4i[1])}$, $${fmt(S.Q4[2])} \\to ${fmt(S.Q4i[2])}$.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-y-eq-minus-x-swap-only",
          gp(`image drawn at ${fmtList(S.Q4swap)}, the reflection in y = x`),
          `Swapping alone reflects in $y = x$ and puts the triangle at ${fmtList(S.Q4swap)}. The second half of the rule is the two sign changes.`,
          0,
          SRC.m7p2_2025,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "2 marks for a single reflection, matching the Summer 2026 M7 Paper 2 Q14 and M8 Paper 2 Q5 'reflect in y = -x' items.",
    numeric: `${fmtList(S.Q4)} reflected in y = -x gives ${fmtList(S.Q4i)}; reflecting in y = x instead gives ${fmtList(S.Q4swap)}.`,
    alignment: "Summer 2024 M8 Paper 2 Q6 — weaker candidates found the sloping mirror impossible and made no progress at all.",
  },
});

// --- 0005 ------------------------------------------------------------------
const q5 = q(5, {
  paper: P1,
  style: "practice",
  difficulty: 2,
  ao: ["AO2"],
  commandWords: ["Describe fully"],
  emphasis: ["describing a reflection", "equation of the mirror line"],
  setting: "Two congruent triangles on a coordinate grid, no context",
  figures: [
    qfig(
      {
        shapes: [
          { pts: S.Q5, label: "C", at: [-4.6, 3.0], dots: true },
          { pts: S.Q5i, label: "D", style: "final", at: [3.2, -4.5], dots: true },
        ],
      },
      "A coordinate grid from -8 to 8. Triangle C has vertices at (-6, 2), (-2, 2) and (-6, 5). Triangle D has vertices at (2, -6), (2, -2) and (5, -6).",
    ),
  ],
  skeleton: "(main)describe2",
  examinerSources: [SRC.m7p1_2024],
  solutionProgram: "each vertex of D is the vertex of C with its coordinates swapped, so the mirror is y = x",
  parts: [
    {
      id: "main",
      marks: 2,
      stem: "Describe fully the single transformation that maps triangle $C$ onto triangle $D$.",
      answer: describe(["Reflection in the line y = x"], [
        REFLECTION_NAME,
        { any: ["y = x", "y=x", "y = x line"], marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "reflection", reject: ["turn", "flip", "mirrored"] },
        { id: "A2", code: "A", marks: 1, for: "in the line y = x", reject: ["the diagonal", "the sloping line"] },
      ],
      hints: ["Same size and the sense reversed, so it is a reflection.", "Compare one vertex with its image: what has happened to the pair of numbers?", "The mirror needs its equation, not a description of where it is."],
      workedSolution: `Each vertex has had its coordinates swapped — $${fmt(S.Q5[0])} \\to ${fmt(S.Q5i[0])}$ and $${fmt(S.Q5[1])} \\to ${fmt(S.Q5i[1])}$ — so the mirror is the line $y = x$.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          tp("y\\s*=\\s*-\\s*x"),
          "The rising diagonal is $y = x$; $y = -x$ falls from left to right. Test one vertex against each line before you commit.",
          1,
          SRC.m7p2_2025,
        ),
        ce(
          "maths.transform.describe-with-two-transformations",
          tp("then|followed by|and then"),
          "The question asks for a single transformation, so a description made of two scores nothing. One reflection does the whole job here.",
          0,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "2 marks, one for the name and one for the equation of the mirror, as in the Summer 2024 M7 Paper 2 Q1 scheme ('reflection in the x-axis', A1 A1).",
    numeric: `${fmtList(S.Q5)} reflected in y = x gives ${fmtList(S.Q5i)}, which is the image drawn in the figure.`,
    alignment: "Summer 2024 M7 Paper 1 Q12 — combinations were offered where one transformation was wanted, and named lines were replaced by vague descriptions.",
  },
});

// --- 0006 ------------------------------------------------------------------
const q6 = q(6, {
  paper: P1,
  style: "practice",
  difficulty: 2,
  ao: ["AO2"],
  commandWords: ["Describe fully"],
  emphasis: ["describing a reflection", "equation of the mirror line"],
  setting: "Two congruent triangles on a coordinate grid, no context",
  figures: [
    qfig(
      {
        shapes: [
          { pts: S.Q6, label: "E", at: [3.3, 5.2], dots: true },
          { pts: S.Q6i, label: "F", style: "final", at: [-5.4, -3.4], dots: true },
        ],
      },
      "A coordinate grid from -8 to 8. Triangle E has vertices at (2, 4), (2, 7) and (6, 4). Triangle F has vertices at (-4, -2), (-7, -2) and (-4, -6).",
    ),
  ],
  skeleton: "(main)describe2",
  examinerSources: [SRC.m7p2_2025],
  solutionProgram: "each vertex of F is the vertex of E swapped and negated, so the mirror is y = -x",
  parts: [
    {
      id: "main",
      marks: 2,
      stem: "Describe fully the single transformation that maps triangle $E$ onto triangle $F$.",
      answer: describe(["Reflection in the line y = -x"], [
        REFLECTION_NAME,
        { any: ["y = -x", "y=-x", "y = - x"], marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "reflection", reject: ["turn", "flip"] },
        { id: "A2", code: "A", marks: 1, for: "in the line y = -x", accept: ["x = -y"], reject: ["the diagonal"] },
      ],
      hints: ["The sense of the triangle is reversed, so it is a reflection.", "Take one vertex and its image: what happened to the numbers and to the signs?", "Give the mirror as an equation."],
      workedSolution: `$${fmt(S.Q6[0])} \\to ${fmt(S.Q6i[0])}$: the coordinates are swapped and both signs are changed, which is the rule for the mirror $y = -x$.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          tp("y\\s*=\\s*x(?!\\s*-)"),
          "$y = x$ would leave the triangle in the first quadrant. Both signs have changed as well, so the mirror is the falling diagonal.",
          1,
          SRC.m7p2_2025,
        ),
        ce(
          "maths.transform.rotation-details-missing",
          tp("rotation|rotate"),
          "A rotation of $180^\\circ$ would keep the triangle the same way round; here the sense is reversed, which only a reflection does.",
          0,
          SRC.m7p1_2025n,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "2 marks, name and mirror, matching the 2-mark 'describe fully' items on M7 and M8 Paper 2.",
    numeric: `${fmtList(S.Q6)} reflected in y = -x gives ${fmtList(S.Q6i)}.`,
    alignment: "Summer 2025 M7 Paper 2 Q15 and November 2025 M7 Paper 1 Q16 — the two diagonals are routinely confused with each other and with the axes.",
  },
});

// --- 0007 ------------------------------------------------------------------
const q7 = q(7, {
  paper: P1,
  style: "practice",
  difficulty: 2,
  ao: ["AO1"],
  commandWords: ["Write down"],
  emphasis: ["two reflections in order", "coordinates of an image"],
  setting: "A single point on a coordinate grid, no context",
  figures: [
    qfig(
      {
        lines: [YX, YNX_TOP],
        marks: [{ at: S.Q7, kind: "point", label: `B ${fmt(S.Q7)}`, labelAt: [-3.4, 5.9] }],
      },
      "A coordinate grid from -8 to 8 with both dashed diagonals, y = x and y = -x, drawn through the origin. The point B is marked at (-3, 5).",
    ),
  ],
  skeleton: "(main)write1",
  examinerSources: [SRC.m8p2_2025],
  solutionProgram: "reflect (-3, 5) in y = x -> (5, -3); reflect that in y = -x -> (3, -5); a half turn about the origin gives the same point",
  parts: [
    {
      id: "main",
      marks: 1,
      stem: `The point $B$ has coordinates $${fmt(S.Q7)}$.\n\n$B$ is reflected in the line $y = x$, and that image is then reflected in the line $y = -x$.\n\nWrite down the coordinates of the final image.`,
      answer: text([fmt(S.Q7b)], [{ any: pair(S.Q7b), marks: 1 }]),
      scheme: [{ id: "A1", code: "A", marks: 1, for: `${fmt(S.Q7b)}`, ignore: [fmt(S.Q7a)] }],
      hints: [`After the first reflection the point is at $${fmt(S.Q7a)}$.`, "Now apply the second rule to that point, not to $B$.", "Check: two perpendicular mirrors make a half turn about the origin."],
      workedSolution: `$${fmt(S.Q7)} \\to ${fmt(S.Q7a)}$ in $y = x$, then $${fmt(S.Q7a)} \\to ${fmt(S.Q7b)}$ in $y = -x$. Both signs of $B$ have simply been changed, which is the half turn about the origin that two perpendicular mirrors always produce.`,
      commonErrors: [
        ce(
          "maths.transform.order-of-combination-reversed",
          tp("\\(?\\s*5\\s*,\\s*-3\\s*\\)?"),
          `That is the image after the first reflection only. It is worth writing down, but the second mirror still has to act on it.`,
          0,
          SRC.m8p2_2025,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "1 mark, 'Write down', used as the bridge between the single-reflection items and the 4-mark drawings.",
    numeric: `${fmt(S.Q7)} -> ${fmt(S.Q7a)} -> ${fmt(S.Q7b)}; a rotation of 180 degrees about the origin applied to ${fmt(S.Q7)} gives ${fmt(S.Q7b)}, which is asserted in shapes.mjs.`,
    alignment: "Summer 2025 M8 Paper 2 Q8 — over 30 per cent showed no understanding of a combination; this item isolates the ordering with no drawing to get in the way.",
  },
});

// --- 0008 ------------------------------------------------------------------
const q8 = q(8, {
  paper: P2,
  style: "practice",
  difficulty: 3,
  ao: ["AO1"],
  commandWords: ["Draw"],
  emphasis: ["combined transformation", "reflection then translation"],
  setting: "A triangle on a coordinate grid, no context",
  figures: [
    qfig(
      { lines: [YX], shapes: [{ pts: S.Q8, label: "G", at: [1.8, 3.1] }] },
      "A coordinate grid from -8 to 8 with the dashed line y = x. Triangle G has vertices at (1, 2), (1, 6) and (4, 2).",
    ),
  ],
  skeleton: "(a)draw2|(b)draw2",
  examinerSources: [SRC.m7p2_2024, SRC.m8p2_2025],
  solutionProgram: "reflect in y = x, then translate the image 6 left and 4 down",
  parts: [
    {
      id: "a",
      marks: 2,
      stem: `Triangle $G$ has vertices $${fmt(S.Q8[0])}$, $${fmt(S.Q8[1])}$ and $${fmt(S.Q8[2])}$.\n\nDraw $G'$, the image of $G$ after a reflection in the line $y = x$.`,
      answer: graph(S.Q8, S.Q8i),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "reflection in y = x attempted, at least two vertices swapped" },
        { id: "A1", code: "A", marks: 1, for: `G' correct at ${fmtList(S.Q8i)}`, dependsOn: ["M1"] },
      ],
      hints: ["Draw the line $y = x$ on the grid first.", "Swap each pair of coordinates in turn.", "Leave $G'$ drawn and labelled — it carries two of this question's four marks on its own."],
      workedSolution: `Reflecting in $y = x$ swaps each pair: ${fmtList(S.Q8)} becomes ${fmtList(S.Q8i)}.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          gp(`image drawn at ${fmtList(S.Q8yaxis)}, the reflection in the y-axis`),
          `A reflection in the $y$-axis puts $G'$ at ${fmtList(S.Q8yaxis)}. The mirror here is the rising diagonal, so the coordinates swap and the signs stay as they are.`,
          0,
          SRC.m7p2_2024,
        ),
      ],
      requiresWorking: false,
    },
    {
      id: "b",
      marks: 2,
      stem: `Draw $G''$, the image of $G'$ after a translation 6 units left and 4 units down.\n\n(So $G''$ is the image of $G$ after a reflection in the line $y = x$, followed by that translation.)`,
      answer: graph(S.Q8i, S.Q8f),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "the translation applied to the candidate's own G'", ft: true },
        { id: "A1", code: "A", marks: 1, for: `G'' correct at ${fmtList(S.Q8f)}`, dependsOn: ["M1"] },
      ],
      hints: ["Work from $G'$, not from $G$.", "6 left and 4 down means subtract 6 from each $x$ and 4 from each $y$.", "The shape does not turn or change size, so check that $G''$ looks exactly like $G'$."],
      workedSolution: `Translating ${fmtList(S.Q8i)} 6 left and 4 down gives ${fmtList(S.Q8f)}.`,
      commonErrors: [
        ce(
          "maths.transform.order-of-combination-reversed",
          gp(`image drawn at ${fmtList(S.Q8wrongOrder)}, the translation applied to G instead of to G'`),
          `Translating the original triangle gives ${fmtList(S.Q8wrongOrder)}. The second transformation acts on the image the first one made, so start from $G'$.`,
          0,
          SRC.m8p2_2025,
        ),
        ce(
          "maths.transform.translation-vector-wrong-form",
          gp(`image drawn at ${fmtList(S.Q8vectorSwapped)}, the two components of the vector swapped`),
          `That is 4 left and 6 down, with the two numbers the wrong way round. The first number is the movement across and the second is the movement up or down.`,
          1,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: false,
      followThrough: { fromPart: "a", rule: "use-candidate-diagram" },
    },
  ],
  verification: {
    tariff:
      "4 marks split two and two, exactly as the Summer 2025 M8 Paper 2 Q8 scheme sets it out (first image M1 A1, final image M1 A1). The paper prints the chain as one instruction; here each stage is its own part so that a correct first image scores its two marks even when the second stage goes wrong, which is how the scheme actually behaves.",
    numeric: `${fmtList(S.Q8)} -> reflect in y = x -> ${fmtList(S.Q8i)} -> translate (-6, -4) -> ${fmtList(S.Q8f)}.`,
    alignment: "Summer 2024 M7 Paper 2 Q15 (the first image erased, worth two marks) and Summer 2025 M8 Paper 2 Q8 (the second stage credited even after a wrong first stage).",
  },
});

// --- 0009 ------------------------------------------------------------------
const q9 = q(9, {
  paper: P2,
  style: "practice",
  difficulty: 3,
  ao: ["AO2"],
  commandWords: ["Describe fully"],
  emphasis: ["two reflections as one rotation", "full description"],
  setting: "A triangle and its final image on a coordinate grid, no context",
  figures: [
    qfig(
      {
        lines: [YX, YNX],
        shapes: [
          { pts: S.Q9, label: "H", at: [5.2, 1.7], dots: true },
          { pts: S.Q9f, label: "J", style: "final", at: [-5.2, -1.7], dots: true },
        ],
        marks: [{ at: [0, 0], kind: "point", label: "O", labelAt: [1.0, 0.8] }],
      },
      "A coordinate grid from -8 to 8 with both dashed diagonals through the origin O. Triangle H has vertices at (3, 1), (6, 1) and (6, 3). Triangle J has vertices at (-3, -1), (-6, -1) and (-6, -3).",
    ),
  ],
  skeleton: "(main)describe3",
  examinerSources: [SRC.m8p2_2025, SRC.m7p1_2024],
  solutionProgram: "reflect H in y = x, then that image in y = -x; the pair is a rotation of 180 degrees about the origin",
  parts: [
    {
      id: "main",
      marks: 3,
      stem: `Triangle $H$ is reflected in the line $y = x$. That image is then reflected in the line $y = -x$, giving triangle $J$.\n\nDescribe fully the single transformation that maps $H$ onto $J$.`,
      answer: describe(["Rotation, 180°, about the origin (0, 0)"], [
        ROTATION_NAME,
        { any: ["180", "180°", "half turn"], marks: 1 },
        { any: pair([0, 0]).concat(["the origin", "origin"]), marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "rotation", reject: ["turn", "reflection and reflection"] },
        { id: "A2", code: "A", marks: 1, for: "180° (half turn)", ignore: ["clockwise", "anticlockwise"] },
        { id: "A3", code: "A", marks: 1, for: "about the origin (0, 0)" },
      ],
      hints: ["The two mirrors are perpendicular. What do two perpendicular mirrors always give?", "Where do $y = x$ and $y = -x$ cross?", "A half turn needs no direction."],
      workedSolution: `Reflecting ${fmtList(S.Q9)} in $y = x$ gives ${fmtList(S.Q9i)}, and reflecting that in $y = -x$ gives ${fmtList(S.Q9f)}. Every coordinate has had its sign changed, which is a rotation of $180^\\circ$ about the origin — the point where the two perpendicular mirrors cross.`,
      commonErrors: [
        ce(
          "maths.transform.describe-with-two-transformations",
          tp("reflection.*(then|and).*reflection|reflect.*then.*reflect"),
          "Describing the two reflections again scores nothing: the question asks what single transformation does the same job.",
          0,
          SRC.m7p1_2024,
        ),
        ce(
          "maths.transform.two-reflections-taken-as-one-reflection",
          tp("reflection|reflect"),
          "Two reflections put the sense of the shape back the right way round, so the result can never be another reflection.",
          0,
          SRC.m8p2_2025,
        ),
        ce(
          "maths.transform.rotation-details-missing",
          tp("^\\s*rotation\\s*$"),
          "The word alone is one of three marks. The angle and the centre are the other two, and both are short to write.",
          1,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "3 marks, one each for the name, the angle and the centre, following the Summer 2024 M7 Paper 1 Q12 rotation scheme (A1 A1 A1).",
    numeric: `${fmtList(S.Q9)} -> ${fmtList(S.Q9i)} -> ${fmtList(S.Q9f)}; a rotation of 180 degrees about the origin applied to H reproduces J, asserted in shapes.mjs.`,
    alignment: "Summer 2025 M8 Paper 2 Q8 (the combination) and Summer 2024 M7 Paper 1 Q12 (single transformation, all its details).",
  },
});

// --- 0010 ------------------------------------------------------------------
const q10 = q(10, {
  paper: P2,
  style: "practice",
  difficulty: 3,
  ao: ["AO2"],
  commandWords: ["Describe fully"],
  emphasis: ["describing a rotation", "centre of rotation"],
  setting: "Two congruent triangles on a coordinate grid, no context",
  figures: [
    qfig(
      {
        shapes: [
          { pts: S.Q10, label: "K", at: [-4.3, 2.2], dots: true },
          { pts: S.Q10i, label: "L", style: "final", at: [2.6, 2.2], dots: true },
        ],
      },
      "A coordinate grid from -8 to 8. Triangle K has vertices at (-5, 1), (-5, 4) and (-3, 1). Triangle L has vertices at (1, 3), (4, 3) and (1, 1).",
    ),
  ],
  skeleton: "(main)describe3",
  examinerSources: [SRC.m7p1_2024],
  solutionProgram: "perpendicular bisectors of two vertex joins meet at (-1, -1); a quarter turn clockwise about it maps K onto L",
  parts: [
    {
      id: "main",
      marks: 3,
      stem: "Describe fully the single transformation that maps triangle $K$ onto triangle $L$.",
      answer: describe(["Rotation, 90° clockwise, about (-1, -1)"], [
        ROTATION_NAME,
        { any: cwClockwise(90), marks: 1 },
        { any: pair(S.Q10c), marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "rotation", reject: ["turn", "turned"] },
        { id: "A2", code: "A", marks: 1, for: "90° clockwise", accept: ["270° anticlockwise", "quarter turn clockwise"] },
        { id: "A3", code: "A", marks: 1, for: `about ${fmt(S.Q10c)}` },
      ],
      hints: ["Same size, turned round: that is a rotation.", "Track one side: the long side of $K$ points up, and on $L$ it points to the right.", "Join a vertex to its image and construct the perpendicular bisector; do it twice and the centre is where they cross."],
      workedSolution: `Joining $${fmt(S.Q10[0])}$ to $${fmt(S.Q10i[0])}$ and $${fmt(S.Q10[1])}$ to $${fmt(S.Q10i[1])}$ and bisecting both at right angles gives a crossing point at $${fmt(S.Q10c)}$. A quarter turn clockwise about that point maps ${fmtList(S.Q10)} onto ${fmtList(S.Q10i)}.`,
      commonErrors: [
        ce(
          "maths.transform.centre-of-rotation-assumed-origin",
          tp("\\(?\\s*0\\s*,\\s*0\\s*\\)?|origin"),
          "The origin is the default guess, not the answer. Construct the centre from two perpendicular bisectors and it comes out at $(-1, -1)$.",
          2,
          SRC.m7p1_2024,
        ),
        ce(
          "maths.transform.rotation-direction-reversed",
          tp("90[^a-z]*anti|anticlockwise\\s*90|anti-clockwise\\s*90"),
          "Check the direction on one side: the long side of $K$ points upwards and ends up pointing right, which is clockwise. $270^\\circ$ anticlockwise says the same thing.",
          2,
          SRC.m7p1_2024,
        ),
        ce(
          "maths.transform.rotation-details-missing",
          tp("turn(ed|s)?\\b"),
          "\"Turn\" is not the word the scheme wants. Write *rotation* and the naming mark is safe.",
          2,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "3 marks, matching Summer 2024 M7 Paper 1 Q12 ('Rotation, 90 degrees anticlockwise, about (1, 2)', A1 A1 A1).",
    numeric: `A quarter turn clockwise about ${fmt(S.Q10c)} maps ${fmtList(S.Q10)} onto ${fmtList(S.Q10i)}; the centre was recovered independently as the intersection of two perpendicular bisectors.`,
    alignment: "Summer 2024 M7 Paper 1 Q12 — 'turn' for rotate, the wrong direction, and no centre were the three ways marks went.",
  },
});

// --- 0011 ------------------------------------------------------------------
const q11 = q(11, {
  paper: P2,
  style: "practice",
  difficulty: 3,
  ao: ["AO2"],
  commandWords: ["Describe fully"],
  emphasis: ["describing an enlargement", "fractional scale factor", "centre of enlargement"],
  setting: "Two similar triangles on a coordinate grid, no context",
  figures: [
    qfig(
      {
        shapes: [
          { pts: S.Q11, label: "M", at: [-5.2, -4.4], dots: true },
          { pts: S.Q11i, label: "N", style: "final", at: [0.7, 0.7], dots: true },
        ],
      },
      "A coordinate grid from -8 to 8. Triangle M has vertices at (-6, -6), (-6, 0) and (-3, -6). The smaller triangle N has vertices at (0, 0), (0, 2) and (1, 0).",
    ),
  ],
  skeleton: "(main)describe3",
  examinerSources: [SRC.m8p2_2025q9, SRC.m7p2_2024n],
  solutionProgram: "scale factor = 2/6 = 1/3; the vertex joins meet at (3, 3)",
  parts: [
    {
      id: "main",
      marks: 3,
      stem: "Describe fully the single transformation that maps triangle $M$ onto triangle $N$.",
      answer: describe(["Enlargement, scale factor 1/3, centre (3, 3)"], [
        ENLARGEMENT_NAME,
        { any: ["1/3", "one third", "a third", "0.33", "0.333"], marks: 1 },
        { any: pair(S.Q11c), marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "enlargement" },
        { id: "A2", code: "A", marks: 1, for: "scale factor 1/3", accept: ["0.33", "one third"], reject: ["3", "-1/3"] },
        { id: "A3", code: "A", marks: 1, for: `centre ${fmt(S.Q11c)}` },
      ],
      hints: ["The size has changed and the angles have not, so it is an enlargement.", "Scale factor is image length over object length.", "Join each vertex of $N$ to the matching vertex of $M$ and extend the lines until they meet."],
      workedSolution: `The vertical side of $M$ is 6 and the vertical side of $N$ is 2, so the scale factor is $\\tfrac{2}{6} = \\tfrac{1}{3}$. Joining $${fmt(S.Q11[0])}$ to $${fmt(S.Q11i[0])}$ and $${fmt(S.Q11[1])}$ to $${fmt(S.Q11i[1])}$ and extending, the lines meet at $${fmt(S.Q11c)}$.`,
      commonErrors: [
        ce(
          "maths.transform.enlargement-centre-or-sf-missing",
          tp("^\\s*enlargement(\\s*,?\\s*(scale factor\\s*)?(1/3|one third))?\\s*$"),
          "The centre is a third of this question. It is the one part you can construct rather than estimate: join corresponding vertices and extend.",
          2,
          SRC.m8p2_2025q9,
        ),
        ce(
          "maths.transform.enlargement-sf-applied-to-coordinates",
          tp("scale factor\\s*3\\b|sf\\s*3\\b"),
          "3 describes the enlargement from $N$ to $M$. Going the way the question asks, the image is the smaller triangle, so the scale factor is below 1.",
          2,
          SRC.m7p2_2024n,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "3 marks, one each for the name, the scale factor and the centre, as in the Summer 2025 M8 Paper 2 Q9 and November 2024 M7 Paper 2 Q15 schemes.",
    numeric: `${fmtList(S.Q11)} enlarged by 1/3 about ${fmt(S.Q11c)} gives ${fmtList(S.Q11i)}; the centre was recovered as the intersection of two vertex joins and the scale factor as the ratio of matching sides.`,
    alignment: "Summer 2025 M8 Paper 2 Q9 — only a minority gave both the centre and the scale factor; November 2024 M7 Paper 2 Q15 — the scale factor was often wrong and few found the centre.",
  },
});

// --- 0012 ------------------------------------------------------------------
const q12 = q(12, {
  paper: P1,
  style: "practice",
  difficulty: 3,
  ao: ["AO2"],
  commandWords: ["Describe fully"],
  emphasis: ["two reflections as one translation", "column vector"],
  setting: "A triangle and its final image on a coordinate grid, no context",
  figures: [
    qfig(
      {
        lines: [
          { kind: "x=", at: -3, label: "x = -3", labelAt: [-1.8, -0.9] },
          { kind: "x=", at: 1, label: "x = 1", labelAt: [2.1, -0.9] },
        ],
        shapes: [
          { pts: S.Q12, label: "P", at: [-6.2, 3.0] },
          { pts: S.Q12f, label: "R", style: "final", at: [2.2, 3.0] },
        ],
      },
      "A coordinate grid from -8 to 8 with two dashed vertical mirror lines, x = -3 and x = 1. Triangle P has vertices at (-7, 2), (-4, 2) and (-7, 5). Triangle R has vertices at (1, 2), (4, 2) and (1, 5).",
    ),
  ],
  skeleton: "(main)describe2",
  examinerSources: [SRC.m8p2_2025],
  solutionProgram: "two parallel mirrors 4 apart give a translation of 2 x 4 = 8 in the x direction",
  parts: [
    {
      id: "main",
      marks: 2,
      stem: `Triangle $P$ is reflected in the line $x = -3$. That image is then reflected in the line $x = 1$, giving triangle $R$.\n\nDescribe fully the single transformation that maps $P$ onto $R$.`,
      answer: describe(["Translation by the column vector 8, 0"], [
        TRANSLATION_NAME,
        { any: ["8 right", "8 units right", "8 to the right", "8 0", "(8, 0)", "8 across"], marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "translation", reject: ["moved", "slid", "shifted"] },
        { id: "A2", code: "A", marks: 1, for: "column vector 8 over 0", accept: ["8 right", "8 right and 0 up"], reject: ["4 right"] },
      ],
      hints: ["Two parallel mirrors cannot turn or flip the shape, so what is left?", "How far apart are the mirrors?", "The shape moves twice that distance."],
      workedSolution: `Reflecting ${fmtList(S.Q12)} in $x = -3$ gives ${fmtList(S.Q12i)}, and reflecting that in $x = 1$ gives ${fmtList(S.Q12f)}. Every vertex has moved 8 to the right — twice the 4-unit gap between the mirrors — so it is a translation by the column vector with 8 on top and 0 underneath.`,
      commonErrors: [
        ce(
          "maths.transform.two-reflections-taken-as-one-reflection",
          tp("4 right|4 units|\\(4, 0\\)"),
          "4 is the gap between the mirrors. The shape crosses that gap and comes out the same distance again on the far side, so it travels 8.",
          1,
          SRC.m8p2_2025,
        ),
        ce(
          "maths.transform.translation-vector-wrong-form",
          tp("\\(?\\s*0\\s*,\\s*8\\s*\\)?|8 up"),
          "The top number of a column vector is the movement across and the bottom one is the movement up. Here nothing moves vertically.",
          1,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "2 marks, name and vector, as in the November 2025 M7 Paper 1 Q7 scheme ('Translation', then the vector, A1 A1).",
    numeric: `${fmtList(S.Q12)} -> reflect in x = -3 -> ${fmtList(S.Q12i)} -> reflect in x = 1 -> ${fmtList(S.Q12f)}; translating P by (8, 0) reproduces R, asserted in shapes.mjs.`,
    alignment: "Summer 2025 M8 Paper 2 Q8 — candidates who could not see past the two separate steps made no progress on the combination.",
  },
});

// --- 0013 ------------------------------------------------------------------
const q13 = q(13, {
  paper: P1,
  style: "practice",
  difficulty: 3,
  ao: ["AO1"],
  commandWords: ["Write down"],
  emphasis: ["reflection then rotation", "order of a combination"],
  setting: "A single vertex of a shape on a coordinate grid, no context",
  figures: [
    qfig(
      {
        lines: [YX],
        marks: [{ at: S.Q13, kind: "point", label: `V ${fmt(S.Q13)}`, labelAt: [1.4, 5.9] }],
      },
      "A coordinate grid from -8 to 8 with the dashed line y = x. The vertex V is marked at (2, 5).",
    ),
  ],
  skeleton: "(main)write2",
  examinerSources: [SRC.m8p2_2025],
  solutionProgram: "reflect (2, 5) in y = x -> (5, 2); rotate 90 degrees clockwise about the origin -> (2, -5)",
  parts: [
    {
      id: "main",
      marks: 2,
      stem: `A shape is reflected in the line $y = x$, and the image is then rotated $90^\\circ$ clockwise about the origin.\n\nOne vertex of the shape is at $V${fmt(S.Q13)}$. Write down the coordinates of the image of $V$.`,
      answer: text([fmt(S.Q13b)], [{ any: pair(S.Q13b), marks: 1 }]),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: `${fmt(S.Q13a)} seen after the reflection` },
        { id: "A1", code: "A", marks: 1, for: `${fmt(S.Q13b)}`, dependsOn: ["MA1"], ft: true },
      ],
      hints: ["Do the reflection first and write the point down.", "A quarter turn clockwise about the origin sends $(x, y)$ to $(y, -x)$.", "Try it on a point you can picture, such as $(1, 0)$, if you are unsure of the direction."],
      workedSolution: `The reflection gives $${fmt(S.Q13)} \\to ${fmt(S.Q13a)}$. A quarter turn clockwise about the origin then sends $${fmt(S.Q13a)}$ to $${fmt(S.Q13b)}$.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          tp(`\\(?\\s*${S.Q13wrongMirror[0]}\\s*,\\s*${S.Q13wrongMirror[1]}\\s*\\)?`),
          `That is the reflection of V in y = -x, which swaps the coordinates and changes both signs. Reflection in y = x only swaps them: V${fmt(S.Q13)} goes to ${fmt(S.Q13a)}. Then the clockwise quarter turn sends ${fmt(S.Q13a)} to ${fmt(S.Q13b)}.`,
          1,
          SRC.m7p1_2024,
        ),
        ce(
          "maths.transform.rotation-direction-reversed",
          tp(`\\(?\\s*${S.Q13wrongDir[0]}\\s*,\\s*${S.Q13wrongDir[1]}\\s*\\)?`),
          "That is the image if the quarter turn went the other way, and also what you get by rotating first and reflecting afterwards. Clockwise sends $(x, y)$ to $(y, -x)$; anticlockwise sends it to $(-y, x)$. The order in the sentence is the order on the page: reflect first, then rotate.",
          1,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: true,
    },
  ],
  verification: {
    tariff: "2 marks, one for the intermediate point and one for the final answer, in the shape of the two-stage schemes CCEA prints for combinations.",
    numeric: `${fmt(S.Q13)} -> reflect in y = x -> ${fmt(S.Q13a)} -> rotate 90 clockwise about the origin -> ${fmt(S.Q13b)}.`,
    alignment: "Summer 2025 M8 Paper 2 Q8 — the combination is the barrier, not either transformation on its own.",
  },
});

// --- 0014 ------------------------------------------------------------------
const q14 = q(14, {
  paper: P2,
  style: "practice",
  difficulty: 4,
  ao: ["AO1"],
  commandWords: ["Draw"],
  emphasis: ["combined transformation", "reflection in y = -x then enlargement"],
  setting: "A triangle on a coordinate grid, no context",
  figures: [
    qfig(
      {
        lines: [YNX],
        shapes: [{ pts: S.Q14, label: "W", at: [3.3, 3.3] }],
        marks: [{ at: S.Q14c, kind: "centre", label: `${fmt(S.Q14c)}`, labelAt: [3.9, 1.6] }],
      },
      "A coordinate grid from -8 to 8 with the dashed line y = -x. Triangle W has vertices at (2, 2), (6, 2) and (2, 6). A ringed cross marks the centre of enlargement at (2, 2).",
    ),
  ],
  skeleton: "(a)draw2|(b)draw2",
  examinerSources: [SRC.m7p2_2025, SRC.m8p2_2025],
  solutionProgram: "reflect in y = -x, then enlarge the image by 1/2 about (2, 2)",
  parts: [
    {
      id: "a",
      marks: 2,
      stem: `Triangle $W$ has vertices $${fmt(S.Q14[0])}$, $${fmt(S.Q14[1])}$ and $${fmt(S.Q14[2])}$.\n\nDraw $W'$, the image of $W$ after a reflection in the line $y = -x$.`,
      answer: graph(S.Q14, S.Q14i),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "reflection in y = -x attempted, at least two vertices swapped and negated" },
        { id: "A1", code: "A", marks: 1, for: `W' correct at ${fmtList(S.Q14i)}`, dependsOn: ["M1"] },
      ],
      hints: ["Swap each pair of coordinates, then change both signs.", "The mirror falls from the top left to the bottom right; draw it first.", "Leave $W'$ drawn and labelled — it carries two of this question's four marks."],
      workedSolution: `Reflecting in $y = -x$ swaps each pair and changes both signs: ${fmtList(S.Q14)} becomes ${fmtList(S.Q14i)}.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          gp(`image drawn at ${fmtList(S.Q14yaxis)}, the reflection in the y-axis`),
          `The $y$-axis only changes the sign of each $x$-coordinate, which puts $W'$ at ${fmtList(S.Q14yaxis)}. The falling diagonal swaps the pair as well.`,
          0,
          SRC.m7p2_2025,
        ),
      ],
      requiresWorking: false,
    },
    {
      id: "b",
      marks: 2,
      stem: `Draw $W''$, the image of $W'$ after an enlargement of scale factor $\\tfrac{1}{2}$ with centre $${fmt(S.Q14c)}$.\n\n(So $W''$ is the image of $W$ after a reflection in the line $y = -x$, followed by that enlargement.)`,
      answer: graph(S.Q14i, S.Q14f),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "rays from (2, 2) to the candidate's own W', distances halved", ft: true },
        { id: "A1", code: "A", marks: 1, for: `W'' correct at ${fmtList(S.Q14f)}`, dependsOn: ["M1"] },
      ],
      hints: ["Count across and up from $(2, 2)$ to each vertex of $W'$.", "Halve both counts and mark the point you reach.", "The image is half the size of $W'$, so check its side lengths when you have drawn it."],
      workedSolution: `From the centre $${fmt(S.Q14c)}$, vertex $${fmt(S.Q14i[0])}$ is 4 left and 4 down; half of that is 2 left and 2 down, giving $${fmt(S.Q14f[0])}$. The same counting gives $${fmt(S.Q14f[1])}$ and $${fmt(S.Q14f[2])}$.`,
      commonErrors: [
        ce(
          "maths.transform.centre-of-enlargement-misused",
          gp(`image drawn at ${fmtList(S.Q14fromOrigin)}, the coordinates halved from the origin instead of from the given centre`),
          `Halving the coordinates themselves gives ${fmtList(S.Q14fromOrigin)}, which is the enlargement about the origin. The centre is the point you measure from, and here it is $${fmt(S.Q14c)}$.`,
          0,
          SRC.m7p2_2025,
        ),
        ce(
          "maths.transform.order-of-combination-reversed",
          gp(`image drawn at ${fmtList(S.Q14wrongOrder)}, the enlargement applied to W instead of to W'`),
          `Enlarging the original triangle gives ${fmtList(S.Q14wrongOrder)}. The enlargement acts on the reflected image, so start from $W'$.`,
          0,
          SRC.m8p2_2025,
        ),
      ],
      requiresWorking: false,
      followThrough: { fromPart: "a", rule: "use-candidate-diagram" },
    },
  ],
  verification: {
    tariff:
      "4 marks in two stages of two, the standard CCEA shape for this question (Summer 2025 M7 Paper 2 Q15 and M8 Paper 2 Q8). Each stage is its own part, so the reflection scores its two marks even if the enlargement then goes wrong.",
    numeric: `${fmtList(S.Q14)} -> reflect in y = -x -> ${fmtList(S.Q14i)} -> enlarge by 1/2 about ${fmt(S.Q14c)} -> ${fmtList(S.Q14f)}.`,
    alignment: "Summer 2025 M7 Paper 2 Q15 — the scale factor was understood but the centre was not, with some images drawn at the centre itself.",
  },
});

// --- 0015 exam-style --------------------------------------------------------
const q15 = q(15, {
  paper: P2,
  style: "exam-style",
  difficulty: 4,
  ao: ["AO1"],
  commandWords: ["Draw"],
  emphasis: ["combined transformation", "reflection in y = x then fractional enlargement"],
  setting: "A triangle on a coordinate grid, no context",
  figures: [
    qfig(
      {
        lines: [YX],
        shapes: [{ pts: S.Q15, label: "T", at: [2.4, 3.0] }],
        marks: [{ at: S.Q15c, kind: "centre", label: `${fmt(S.Q15c)}`, labelAt: [-6.0, -2.3] }],
      },
      "A coordinate grid from -8 to 8 with the dashed line y = x. Triangle T has vertices at (1, 2), (7, 2) and (1, 6). A ringed cross marks the centre of enlargement at (-6, -1).",
    ),
  ],
  skeleton: "(a)draw2|(b)draw2",
  examinerSources: [SRC.m7p2_2025, SRC.m8p2_2025],
  solutionProgram: "reflect T in y = x, then enlarge the image by 1/2 about (-6, -1)",
  parts: [
    {
      id: "a",
      marks: 2,
      stem: `Draw $T'$, the image of triangle $T$ after a reflection in the line $y = x$.`,
      answer: graph(S.Q15, S.Q15i),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "reflection in y = x attempted" },
        { id: "A1", code: "A", marks: 1, for: `T' correct at ${fmtList(S.Q15i)}`, dependsOn: ["M1"] },
      ],
      hints: ["Draw $y = x$ before you reflect anything.", "Write the three swapped vertices down before you draw them.", "Leave $T'$ on the grid: it is worth two marks whatever happens next."],
      workedSolution: `Reflecting in $y = x$ swaps each pair, so ${fmtList(S.Q15)} becomes ${fmtList(S.Q15i)}.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          gp(`image drawn at ${fmtList(S.Q15yaxis)}, the reflection in the y-axis`),
          `The $y$-axis puts $T'$ at ${fmtList(S.Q15yaxis)}. Even so, the next part is still worth having: enlarge whatever you drew, carefully, and those marks are there.`,
          0,
          SRC.m7p2_2025,
        ),
      ],
      requiresWorking: false,
    },
    {
      id: "b",
      marks: 2,
      stem: `Draw $F$, the image of $T'$ after an enlargement of scale factor $\\tfrac{1}{2}$ with centre $${fmt(S.Q15c)}$.\n\n(So $F$ is the image of $T$ after a reflection in the line $y = x$, followed by that enlargement.)`,
      answer: graph(S.Q15i, S.Q15f),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "enlargement of the candidate's own T' from (-6, -1), distances halved", ft: true },
        { id: "A1", code: "A", marks: 1, for: `F correct at ${fmtList(S.Q15f)}`, dependsOn: ["M1"] },
      ],
      hints: ["From $(-6, -1)$, count across and up to each vertex of $T'$.", "Halve both counts and mark the point you land on.", "Check the finished triangle is half the size of $T'$."],
      workedSolution: `From $${fmt(S.Q15c)}$, vertex $${fmt(S.Q15i[0])}$ is 8 across and 2 up; halving gives 4 across and 1 up, which is $${fmt(S.Q15f[0])}$. The other two vertices give $${fmt(S.Q15f[1])}$ and $${fmt(S.Q15f[2])}$, so $F$ is the triangle ${fmtList(S.Q15f)}.`,
      commonErrors: [
        ce(
          "maths.transform.centre-of-enlargement-misused",
          gp(`image drawn at ${fmtList(S.Q15wrongCentre)}, the sign of the centre's y-coordinate misread so the counting started from the wrong point`),
          `Reading the centre as $(-6, 1)$ puts the image at ${fmtList(S.Q15wrongCentre)}. Mark the centre on the grid before you count, and check its sign against the question.`,
          1,
          SRC.m7p2_2025,
        ),
      ],
      requiresWorking: false,
      followThrough: { fromPart: "a", rule: "use-candidate-diagram" },
    },
  ],
  verification: {
    tariff:
      "4 marks, the exact tariff and wording pattern of the combined-transformation question CCEA set on M7 Paper 2 and M8 Paper 2 in Summer 2025 (scheme: first image M1 A1, final image M1 A1). The chain is split into two parts so each stage is marked against the image it acts on, which is what the scheme does.",
    numeric: `${fmtList(S.Q15)} -> reflect in y = x -> ${fmtList(S.Q15i)} -> enlarge by 1/2 about ${fmt(S.Q15c)} -> ${fmtList(S.Q15f)}.`,
    alignment: "Summer 2025 M7 Paper 2 Q15 and M8 Paper 2 Q8 — just over 40 per cent correct, over 30 per cent with no understanding, and partial credit for a correct second stage applied to a wrong first image.",
  },
});

// --- 0016 exam-style --------------------------------------------------------
const q16 = q(16, {
  paper: M8P2,
  style: "exam-style",
  difficulty: 4,
  ao: ["AO2"],
  commandWords: ["Describe fully"],
  emphasis: ["describing an enlargement", "fractional scale factor", "centre of enlargement"],
  setting: "Two similar triangles on a coordinate grid, no context",
  figures: [
    qfig(
      {
        shapes: [
          { pts: S.Q16, label: "A", at: [-6.4, 1.2], dots: true },
          { pts: S.Q16i, label: "B", style: "final", at: [1.0, -1.6], dots: true },
        ],
      },
      "A coordinate grid from -8 to 8. Triangle A has vertices at (-8, -1), (-8, 5) and (-2, -1). The smaller triangle B has vertices at (0, -3), (0, -1) and (2, -3).",
    ),
  ],
  skeleton: "(main)describe3",
  examinerSources: [SRC.m8p2_2025q9],
  solutionProgram: "scale factor = 2/6 = 1/3; the vertex joins meet at (4, -4)",
  parts: [
    {
      id: "main",
      marks: 3,
      stem: "Describe fully the single transformation that maps shape $A$ onto shape $B$.",
      answer: describe(["Enlargement, scale factor 1/3, centre (4, -4)"], [
        ENLARGEMENT_NAME,
        { any: ["1/3", "one third", "a third", "0.33", "0.333"], marks: 1 },
        { any: pair(S.Q16c), marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "enlargement" },
        { id: "A2", code: "A", marks: 1, for: "scale factor 1/3", accept: ["0.33", "one third"], reject: ["3", "-3"] },
        { id: "A3", code: "A", marks: 1, for: `centre ${fmt(S.Q16c)}` },
      ],
      hints: ["Compare a matching pair of sides to get the scale factor.", "Join each vertex of $B$ to the matching vertex of $A$.", "Extend those joins until they cross; that crossing point is the centre."],
      workedSolution: `The vertical side of $A$ is 6 and of $B$ is 2, so the scale factor is $\\tfrac{1}{3}$. Joining $${fmt(S.Q16[0])}$ to $${fmt(S.Q16i[0])}$ and $${fmt(S.Q16[1])}$ to $${fmt(S.Q16i[1])}$ and extending, the lines meet at $${fmt(S.Q16c)}$. Check: $${fmt(S.Q16c)}$ to $${fmt(S.Q16[2])}$ is 6 left and 3 up, and a third of that is 2 left and 1 up, landing on $${fmt(S.Q16i[2])}$.`,
      commonErrors: [
        ce(
          "maths.transform.enlargement-centre-or-sf-missing",
          tp("^\\s*enlargement\\b.{0,30}$"),
          "Naming the transformation is one mark of three. The scale factor and the centre are the other two, and the centre can be constructed.",
          1,
          SRC.m8p2_2025q9,
        ),
        ce(
          "maths.transform.describe-with-two-transformations",
          tp("then|followed by"),
          "An enlargement about the right centre needs no translation afterwards. Adding one turns a complete answer into a combination, which scores nothing.",
          0,
          SRC.m7p2_2024n,
        ),
      ],
      requiresWorking: false,
    },
  ],
  verification: {
    tariff: "3 marks, the tariff and scheme shape of Summer 2025 M8 Paper 2 Q9 ('Enlargement, scale factor …, centre (…)', A1 A1 A1).",
    numeric: `${fmtList(S.Q16)} enlarged by 1/3 about ${fmt(S.Q16c)} gives ${fmtList(S.Q16i)}; the centre was recovered as the intersection of two vertex joins and the scale factor as the ratio of matching sides.`,
    alignment: "Summer 2025 M8 Paper 2 Q9 — the transformation was recognised but only a minority gave both the centre and the scale factor; November 2024 M7 Paper 2 Q15 — a translation added afterwards scored zero.",
  },
});

// --- 0017 exam-style --------------------------------------------------------
const q17 = q(17, {
  paper: M8P1,
  style: "exam-style",
  difficulty: 5,
  ao: ["AO1", "AO2"],
  commandWords: ["Draw", "Describe fully"],
  emphasis: ["two reflections", "single equivalent rotation"],
  setting: "A triangle on a coordinate grid, no context",
  figures: [
    qfig(
      { lines: [YX], shapes: [{ pts: S.Q17, label: "P", at: [1.7, 4.4] }] },
      "A coordinate grid from -8 to 8 with the dashed line y = x. Triangle P has vertices at (1, 3), (1, 6) and (3, 3).",
    ),
  ],
  skeleton: "(a)draw2|(b)draw2|(c)describe3",
  examinerSources: [SRC.m8p2_2025, SRC.m7p1_2024],
  solutionProgram: "reflect P in y = x, reflect that in the x-axis; the pair is a quarter turn clockwise about the origin",
  parts: [
    {
      id: "a",
      marks: 2,
      stem: `Triangle $P$ has vertices $${fmt(S.Q17[0])}$, $${fmt(S.Q17[1])}$ and $${fmt(S.Q17[2])}$.\n\nReflect $P$ in the line $y = x$. Label the image $P'$.`,
      answer: graph(S.Q17, S.Q17a),
      scheme: [
        {
          id: "A1",
          code: "A",
          marks: 2,
          for: `correct reflection, vertices ${fmtList(S.Q17a)}`,
          examinerNote: "Award 1 mark for two vertices in the correct position.",
        },
      ],
      hints: ["Swap the coordinates of each vertex.", "The vertex $(3, 3)$ is on the mirror, so it stays where it is."],
      workedSolution: `Swapping each pair: ${fmtList(S.Q17)} becomes ${fmtList(S.Q17a)}. The vertex $${fmt(S.Q17[2])}$ lies on the mirror and does not move.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-wrong-line",
          gp(`image drawn at ${fmtList(S.Q17yaxis)}, the reflection in the y-axis`),
          `The $y$-axis sends the triangle to ${fmtList(S.Q17yaxis)}; $y = x$ sends it down and right instead. Drawing the mirror first separates the two.`,
          0,
          SRC.m7p1_2025n,
        ),
      ],
      requiresWorking: false,
    },
    {
      id: "b",
      marks: 2,
      stem: `Reflect $P'$ in the $x$-axis. Label the image $P''$.`,
      answer: graph(S.Q17a, S.Q17b),
      scheme: [
        {
          id: "A1",
          code: "A",
          marks: 2,
          for: `correct reflection of the candidate's own P', vertices ${fmtList(S.Q17b)}`,
          ft: true,
          examinerNote: "Follow through from part (a); award 1 mark for two vertices in the correct position.",
        },
      ],
      hints: ["A reflection in the $x$-axis changes the sign of each $y$-coordinate.", "Work from $P'$, not from $P$."],
      workedSolution: `Changing the sign of each $y$-coordinate of ${fmtList(S.Q17a)} gives ${fmtList(S.Q17b)}.`,
      commonErrors: [
        ce(
          "maths.transform.order-of-combination-reversed",
          gp(`image drawn at ${fmtList(S.Q17wrongOrder)}, the x-axis reflection applied to P instead of to P'`),
          `Reflecting the original triangle in the $x$-axis gives ${fmtList(S.Q17wrongOrder)}. The second mirror acts on the image the first one made, so start from $P'$.`,
          0,
          SRC.m8p2_2025,
        ),
      ],
      requiresWorking: false,
      followThrough: { fromPart: "a", rule: "use-candidate-diagram" },
    },
    {
      id: "c",
      marks: 3,
      stem: "Describe fully the single transformation that maps $P$ onto $P''$.",
      answer: describe(["Rotation, 90° clockwise, about the origin (0, 0)"], [
        ROTATION_NAME,
        { any: cwClockwise(90), marks: 1 },
        { any: pair([0, 0]).concat(["the origin", "origin"]), marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "rotation", reject: ["turn", "turned"] },
        { id: "A2", code: "A", marks: 1, for: "90° clockwise", accept: ["270° anticlockwise", "quarter turn clockwise"] },
        { id: "A3", code: "A", marks: 1, for: "about the origin (0, 0)" },
      ],
      hints: ["The two mirrors cross at the origin, so the single transformation is a rotation about it.", "Follow one vertex from $P$ to $P''$ to read off the direction.", "The angle is twice the angle between the mirrors."],
      workedSolution: `$${fmt(S.Q17[0])}$ ends up at $${fmt(S.Q17b[0])}$ and $${fmt(S.Q17[1])}$ at $${fmt(S.Q17b[1])}$: each point $(x, y)$ has become $(y, -x)$, which is a quarter turn clockwise about the origin. The mirrors $y = x$ and the $x$-axis meet at $45^\\circ$, and the rotation is twice that.`,
      commonErrors: [
        ce(
          "maths.transform.describe-with-two-transformations",
          tp("reflection.*(then|and).*reflection|reflect.*then.*reflect"),
          "Repeating the two reflections describes the picture but not what the question asked. One rotation does the same job.",
          0,
          SRC.m7p1_2024,
        ),
        ce(
          "maths.transform.rotation-direction-reversed",
          tp("anti-?\\s*clockwise\\s*90|90[^a-z]*anti"),
          "Follow one vertex: $(1, 6)$ finishes at $(6, -1)$, which is a quarter turn clockwise. Anticlockwise would send it to $(-6, 1)$.",
          2,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: false,
      followThrough: { fromPart: "b", rule: "use-candidate-diagram" },
    },
  ],
  verification: {
    tariff: "2 + 2 + 3, built from the tariffs CCEA actually uses: 2 marks per single reflection drawn on a grid (November 2025 M7 Paper 1 Q16) and 3 for a rotation described fully (Summer 2024 M7 Paper 1 Q12). Seven marks sits inside the M8 Paper 1 range (p90 = 6, max = 12).",
    numeric: `${fmtList(S.Q17)} -> reflect in y = x -> ${fmtList(S.Q17a)} -> reflect in the x-axis -> ${fmtList(S.Q17b)}; a quarter turn clockwise about the origin applied to P reproduces P'', asserted in shapes.mjs.`,
    alignment: "Summer 2025 M8 Paper 2 Q8 (the combination) and Summer 2024 M7 Paper 1 Q12 (single transformation with every detail). Mirrors that meet at 45 degrees give a 90 degree rotation, so the A* version of the idea is reachable from two ordinary reflections.",
  },
});

// --- 0018 exam-style --------------------------------------------------------
const q18 = q(18, {
  paper: P2,
  style: "exam-style",
  difficulty: 3,
  ao: ["AO1", "AO2"],
  commandWords: ["Draw", "Describe fully"],
  emphasis: ["reflection in y = -x", "a reflection is its own inverse"],
  setting: "A triangle on a coordinate grid, no context",
  figures: [
    qfig(
      { lines: [YNX], shapes: [{ pts: S.Q18, label: "T", at: [4.8, 1.6] }] },
      `A coordinate grid from -8 to 8 with the dashed line y = -x. Triangle T has vertices at ${fmtList(S.Q18)}.`,
    ),
  ],
  skeleton: "(a)draw2|(b)describe2",
  examinerSources: [SRC.m8p2_2024, SRC.m7p2_2025],
  solutionProgram: "reflect T in y = -x to get U; reflecting U in the same line returns T",
  parts: [
    {
      id: "a",
      marks: 2,
      stem: `Triangle $T$ has vertices $${fmt(S.Q18[0])}$, $${fmt(S.Q18[1])}$ and $${fmt(S.Q18[2])}$.\n\nReflect $T$ in the line $y = -x$. Label the image $U$.`,
      answer: graph(S.Q18, S.Q18i),
      scheme: [
        {
          id: "A1",
          code: "A",
          marks: 2,
          for: `correct reflection, vertices ${fmtList(S.Q18i)}`,
          examinerNote: "Award 1 mark for two vertices in the correct position.",
        },
      ],
      hints: ["Swap each pair of coordinates, then change both signs.", "Every vertex should end up the same distance from the mirror as it started."],
      workedSolution: `${fmtList(S.Q18)} becomes ${fmtList(S.Q18i)}: each pair is swapped and then both signs are changed.`,
      commonErrors: [
        ce(
          "maths.transform.reflect-y-eq-minus-x-swap-only",
          gp(`image drawn at ${fmtList(S.Q18swap)}, the coordinates swapped without the sign change`),
          `Swapping alone is the rule for $y = x$ and puts the image at ${fmtList(S.Q18swap)}. This mirror falls from left to right, so both signs change as well.`,
          0,
          SRC.m7p2_2025,
        ),
      ],
      requiresWorking: false,
    },
    {
      id: "b",
      marks: 2,
      stem: "Describe fully the single transformation that maps $U$ back onto $T$.",
      answer: describe(["Reflection in the line y = -x"], [
        REFLECTION_NAME,
        { any: ["y = -x", "y=-x", "y = - x"], marks: 1 },
      ]),
      scheme: [
        { id: "A1", code: "A", marks: 1, for: "reflection" },
        { id: "A2", code: "A", marks: 1, for: "in the line y = -x", accept: ["x = -y", "the same line"] },
      ],
      hints: ["Reflect $U$ in the same mirror and see where it lands.", "What happens if you swap and negate a pair of coordinates twice?"],
      workedSolution: `Reflecting ${fmtList(S.Q18i)} in $y = -x$ swaps and negates each pair again, which returns ${fmtList(S.Q18)}. A reflection is its own inverse, so the same line does the journey back.`,
      commonErrors: [
        ce(
          "maths.transform.describe-with-two-transformations",
          tp("then|followed by"),
          "One reflection takes $U$ straight back to $T$. Adding a second transformation turns a complete answer into a combination, which earns nothing.",
          0,
          SRC.m7p1_2024,
        ),
        ce(
          "maths.transform.rotation-details-missing",
          tp("rotation|rotate"),
          "A rotation would keep the triangle the same way round. Reflecting reverses its sense, and reflecting again puts it back.",
          0,
          SRC.m7p1_2024,
        ),
      ],
      requiresWorking: false,
      followThrough: { fromPart: "a", rule: "use-candidate-diagram" },
    },
  ],
  verification: {
    tariff: "2 + 2, matching the Summer 2026 M7 Paper 2 Q14 'reflect in y = -x' (2 marks) and the 2-mark 'describe fully' for a reflection.",
    numeric: `${fmtList(S.Q18)} -> reflect in y = -x -> ${fmtList(S.Q18i)}; reflecting that image in the same line returns the original triangle, asserted in shapes.mjs.`,
    alignment: "Summer 2024 M8 Paper 2 Q6 — weaker candidates found the reflection in a sloping mirror impossible; part (b) rewards seeing that the same mirror undoes it.",
  },
});

export const questions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18];

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

export const findTheMistake = [
  {
    id: id("ftm", "01"),
    topic: TOPIC,
    specRefs: SPEC,
    stem:
      "Niamh was asked to draw the image of a triangle with vertices $(3, 1)$, $(8, 1)$ and $(3, 4)$ after a reflection in the line $y = x$. Her working:",
    studentWorking: [
      "The mirror is a sloping line through the middle of the grid.",
      "Reflecting (3, 1) gives (-3, 1).",
      "Reflecting (8, 1) gives (-8, 1), and (3, 4) gives (-3, 4).",
      "So the image is the triangle (-3, 1), (-8, 1), (-3, 4).",
    ],
    mistakeLine: 2,
    misconception: "maths.transform.reflect-wrong-line",
    whatWentWrong:
      "Line 2 changes the sign of the first coordinate, which is a reflection in the $y$-axis. A reflection in $y = x$ leaves the signs alone and swaps the two numbers instead. Line 1 is where it really went wrong: the mirror was never drawn, so there was nothing to check against.",
    correction: [
      "Draw y = x on the grid, through (0, 0), (1, 1), (2, 2) and so on.",
      "Swap each pair: (3, 1) goes to (1, 3).",
      "(8, 1) goes to (1, 8), and (3, 4) goes to (4, 3).",
      "The image is the triangle (1, 3), (1, 8), (4, 3).",
    ],
    marksEarnedAsWritten: [],
    feedback:
      "Nothing is lost that four seconds would not have saved. Every series the reports name this slip: the shape reflected in an axis when a diagonal was asked for. Draw the mirror line first and it becomes very hard to make.",
    source: "ccea-cer:maths:2025-summer:M72:Q15",
  },
  {
    id: id("ftm", "02"),
    topic: TOPIC,
    specRefs: SPEC,
    stem:
      "Ciara was asked: *Describe fully the single transformation that maps shape A onto shape B.* Her answer:",
    studentWorking: [
      "A and B are the same size, so nothing has been enlarged.",
      "Reflect A in the line y = x.",
      "Then translate that image 4 units down.",
      "So the transformation is a reflection in y = x followed by a translation 4 down.",
    ],
    mistakeLine: 4,
    misconception: "maths.transform.describe-with-two-transformations",
    whatWentWrong:
      "Line 4 gives two transformations when the question asked for one. The description may be a perfectly accurate account of the picture, and it still scores zero, because *single transformation* is an instruction rather than a hint.",
    correction: [
      "Read the instruction again: one transformation, with all of its details.",
      "Same size and turned round, not flipped: that is a rotation.",
      "Construct the centre from the perpendicular bisectors of two vertex joins.",
      "Write: rotation, then the angle, then the direction, then the centre.",
    ],
    marksEarnedAsWritten: [],
    feedback:
      "The mathematics behind lines 1 to 3 is sound, and that is worth knowing. The marks went on the last line. When a description needs the word \"then\", it is not the answer the question wants, so go back and find the one transformation that does the whole job.",
    source: "ccea-cer:maths:2024-summer:M71:Q12",
  },
  {
    id: id("ftm", "03"),
    topic: TOPIC,
    specRefs: SPEC,
    stem:
      "Aoife was asked to describe fully the single transformation that maps a triangle with vertices $(-6, -6)$, $(-6, 0)$ and $(-3, -6)$ onto a triangle with vertices $(0, 0)$, $(0, 2)$ and $(1, 0)$. Her answer, for 3 marks:",
    studentWorking: [
      "The second triangle is smaller, so it is an enlargement.",
      "The big triangle is 3 times the size of the small one.",
      "So it is an enlargement with scale factor 3.",
    ],
    mistakeLine: 3,
    misconception: "maths.transform.enlargement-centre-or-sf-missing",
    whatWentWrong:
      "Two things happen on line 3. The scale factor is written the wrong way round: it is measured from the object to the image, so a shrinking enlargement has a scale factor below 1, here $\\tfrac{1}{3}$. And the centre is missing altogether, which is a third of the marks on its own.",
    correction: [
      "Scale factor = image length ÷ object length = 2 ÷ 6 = 1/3.",
      "Join (-6, -6) to (0, 0) and (-6, 0) to (0, 2), then extend both lines.",
      "They meet at (3, 3), so that is the centre.",
      "Enlargement, scale factor 1/3, centre (3, 3).",
    ],
    marksEarnedAsWritten: ["A1"],
    feedback:
      "The first mark is safe: the transformation was named. The Summer 2025 examiners reported exactly this pattern — the enlargement recognised, but only a minority giving both the centre and the scale factor. Both are short to write and the centre can be constructed rather than guessed.",
    source: "ccea-cer:maths:2025-summer:M82:Q9",
  },
];

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: id("rp", String(n).padStart(2, "0")),
  topic: TOPIC,
  specRefs: SPEC,
  kind,
  prompt,
  answer,
  keyWords,
  examUnit: "M7",
  difficultyPrior,
});

export const prompts = [
  rp(1, "formula", "A point $(a, b)$ is reflected in the line $y = x$. Where does it go?", "$(b, a)$ — the coordinates swap and the signs are untouched.", ["swap", "(b, a)"], 3),
  rp(2, "formula", "A point $(a, b)$ is reflected in the line $y = -x$. Where does it go?", "$(-b, -a)$ — swap the coordinates, then change both signs.", ["swap", "signs", "(-b, -a)"], 5),
  rp(3, "procedure", "What is the first thing you do on the grid before reflecting in $y = x$ or $y = -x$?", "Draw the mirror line. $y = x$ rises through $(1, 1)$, $(2, 2)$; $y = -x$ falls through $(1, -1)$, $(-2, 2)$.", ["draw the line", "mirror"], 3),
  rp(4, "definition", "What must a full description of a rotation contain?", "The word rotation, the angle, the direction (unless it is $180^\\circ$) and the centre as a coordinate pair.", ["rotation", "angle", "direction", "centre"], 5),
  rp(5, "definition", "What must a full description of an enlargement contain?", "The word enlargement, the scale factor with its sign, and the centre of enlargement.", ["enlargement", "scale factor", "centre"], 5),
  rp(6, "definition", "What must a full description of a reflection, and of a translation, contain?", "A reflection needs the word reflection and the equation of the mirror line. A translation needs the word translation and the column vector.", ["equation", "mirror line", "column vector"], 4),
  rp(7, "qa", "Two reflections in perpendicular mirror lines are equivalent to which single transformation?", "A rotation of $180^\\circ$ about the point where the two mirrors cross. No direction is needed for a half turn.", ["rotation", "180", "intersection"], 6),
  rp(8, "qa", "Two reflections in parallel mirror lines are equivalent to which single transformation?", "A translation perpendicular to the mirrors, of twice the distance between them.", ["translation", "twice", "distance"], 6),
  rp(9, "procedure", "How do you find the centre of a rotation from a shape and its image?", "Join two vertices to their images and construct the perpendicular bisector of each join. The centre is where the bisectors cross.", ["perpendicular bisector", "cross"], 7),
  rp(10, "procedure", "How do you find the centre of an enlargement from a shape and its image?", "Join each vertex of the image to the matching vertex of the object and extend the lines. They all meet at the centre.", ["join", "extend", "meet"], 6),
  rp(11, "trap", "In a combined transformation, why must the first image stay on the grid?", "It carries marks of its own — usually two of the four — and the second transformation is marked against it, so erasing it throws those marks away.", ["marks", "erase", "first image"], 5),
  rp(12, "trap", "Two wording traps in *describe fully the single transformation*.", "Writing \"turn\" instead of *rotation*, and describing two transformations joined by \"then\" when one was asked for. The second scores zero however accurate it is.", ["turn", "single", "zero"], 6),
];
