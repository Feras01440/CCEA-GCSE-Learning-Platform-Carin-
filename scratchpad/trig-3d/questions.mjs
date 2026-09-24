/**
 * The 17 questions (13 practice, 4 exam-style) for maths.m8.pythagoras-and-trigonometry-in-3d.
 * Every value is recomputed in core.mjs; nothing here is typed from memory.
 */
import {
  cuboidFacts,
  pyramidFacts,
  wedgeFacts,
  coneFacts,
  cubeFromDiagonal,
  surd,
  sf,
  dp,
  long,
  atanDeg,
  asinDeg,
  hyp2,
  cuboidPair,
  cuboidOnly,
  pyramidEdgePair,
  pyramidFacePair,
  wedgePair,
  conePair,
  fig,
  assert,
} from "./core.mjs";

const TOPIC = "maths.m8.pythagoras-and-trigonometry-in-3d";
const SPEC = ["M8-GM-03"];
const RES = ["Formula sheet printed on page 2 of the paper"];
const P2 = { unit: "M8", paper: 2, calculator: true, resources: RES };
const P1 = { unit: "M8", paper: 1, calculator: false, resources: RES };

const num = (value, { unit, figures = 3, places, unitRequired = false, forms = ["decimal"] }) => ({
  kind: "numeric",
  value,
  tolerance: places === undefined ? { type: "sf", figures } : { type: "dp", places },
  ...(unit ? { unit } : {}),
  unitRequired,
  acceptForms: forms,
});

let seq = 0;
const questions = [];

function Q(o) {
  seq += 1;
  const id = `q.${TOPIC}.${String(seq).padStart(4, "0")}`;
  const totalMarks = o.parts.reduce((t, p) => t + p.marks, 0);
  for (const p of o.parts) {
    const s = p.scheme.reduce((t, m) => t + m.marks, 0);
    assert(s === p.marks, `${id} part ${p.id}: scheme totals ${s}, part is worth ${p.marks}`);
  }
  const skeleton = o.skeleton;
  const q = {
    id,
    topic: TOPIC,
    specRefs: SPEC,
    tier: "H",
    paper: o.paper ?? P2,
    style: o.style ?? "practice",
    difficulty: o.difficulty,
    ao: o.ao ?? ["AO2"],
    commandWords: o.commandWords,
    emphasis: o.emphasis ?? [],
    context: { setting: o.setting, original: true },
    figures: o.figures ?? [],
    parts: o.parts,
    skeleton,
    examinerSources: o.examinerSources ?? [],
    ...(o.solutionProgram ? { solutionProgram: o.solutionProgram } : {}),
    totalMarks,
    timeAllowanceSec: Math.round(totalMarks * 90),
    verification: `ver.${id}`,
    version: 1,
  };
  questions.push(q);
  return q;
}

// ---------------------------------------------------------------------------
// 0001 — the base diagonal on its own
// ---------------------------------------------------------------------------

const q1 = cuboidFacts(8, 15, 6, "q1");
assert(q1.ac === 17, "q1 base diagonal changed");

Q({
  difficulty: 1,
  ao: ["AO1"],
  commandWords: ["Calculate"],
  setting: "A cuboid drawn in oblique projection, no context",
  figures: [
    fig(
      cuboidOnly(q1, { edges: { AB: "8 cm", BC: "15 cm", CG: "6 cm" }, baseDiag: true, baseDiagLabel: "AC", target: 160 }),
      "A cuboid ABCDEFGH with AB = 8 cm, BC = 15 cm and the vertical edge CG = 6 cm. The hidden edges AD, DC and DH are dashed, and the diagonal AC of the base is dashed and labelled AC.",
    ),
  ],
  skeleton: "(main)calculate2",
  solutionProgram: "AC^2 = 8^2 + 15^2 = 64 + 225 = 289; AC = sqrt(289) = 17",
  parts: [
    {
      id: "main",
      stem: "$ABCDEFGH$ is a cuboid with $AB = 8$ cm, $BC = 15$ cm and $CG = 6$ cm.\nCalculate the length of the base diagonal $AC$.",
      marks: 2,
      answer: num(q1.ac, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AC^2 = 8^2 + 15^2$ (or $= 289$)" },
        { id: "A1", code: "A", marks: 1, for: "$AC = 17$ (cm)", dependsOn: ["MA1"] },
      ],
      hints: [
        "The base $ABCD$ is a rectangle, so triangle $ABC$ has a right angle at $B$.",
        "Only two of the three dimensions belong in this calculation.",
        "$64 + 225 = 289$, and 289 is a square number.",
      ],
      workedSolution:
        "Triangle $ABC$ lies in the base and is right-angled at $B$, so $AC^2 = 8^2 + 15^2 = 64 + 225 = 289$ and $AC = \\sqrt{289} = 17$ cm.",
      commonErrors: [
        {
          misconception: "maths.trig3d.dimensions-added",
          pattern: { kind: "numeric", value: 23 },
          feedback:
            "The two lengths were added rather than their squares. Pythagoras adds the squares and then takes the root: $\\sqrt{64 + 225} = 17$ cm, which is sensibly shorter than going 8 cm then 15 cm round the edges.",
          marksTypicallyEarned: 0,
        },
        {
          misconception: "maths.trig3d.squares-not-rooted",
          pattern: { kind: "numeric", value: 289 },
          feedback: "289 is $AC^2$. One more keystroke gives the length itself, $\\sqrt{289} = 17$ cm.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0002 — the space diagonal in one line
// ---------------------------------------------------------------------------

const q2 = cuboidFacts(4, 4, 7, "q2");
assert(q2.ag === 9, "q2 space diagonal changed");

Q({
  difficulty: 2,
  ao: ["AO1"],
  commandWords: ["Calculate"],
  setting: "A cuboid drawn in oblique projection, no context",
  figures: [
    fig(
      cuboidOnly(q2, { edges: { AB: "4 cm", BC: "4 cm", CG: "7 cm" }, spaceDiag: true, spaceDiagLabel: "AG", target: 155 }),
      "A cuboid ABCDEFGH with AB = 4 cm, BC = 4 cm and CG = 7 cm, hidden edges AD, DC and DH dashed, and the space diagonal AG drawn thick from A to the opposite corner G.",
    ),
  ],
  skeleton: "(main)calculate2",
  solutionProgram: "AG^2 = 4^2 + 4^2 + 7^2 = 16 + 16 + 49 = 81; AG = 9",
  parts: [
    {
      id: "main",
      stem: "$ABCDEFGH$ is a cuboid with $AB = 4$ cm, $BC = 4$ cm and $CG = 7$ cm.\nCalculate the length of the space diagonal $AG$.",
      marks: 2,
      answer: num(q2.ag, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AG^2 = 4^2 + 4^2 + 7^2$ (or $= 81$), or the two-step route $AC^2 = 32$ then $AG^2 = 32 + 49$" },
        { id: "A1", code: "A", marks: 1, for: "$AG = 9$ (cm)", dependsOn: ["MA1"] },
      ],
      hints: [
        "All three dimensions go in, each one squared.",
        "In two steps: the base diagonal squared is $4^2 + 4^2 = 32$, then add $7^2$.",
        "$16 + 16 + 49 = 81$.",
      ],
      workedSolution:
        "$AG^2 = 4^2 + 4^2 + 7^2 = 16 + 16 + 49 = 81$, so $AG = \\sqrt{81} = 9$ cm. In two steps: $AC^2 = 32$, then $AG^2 = 32 + 49 = 81$.",
      commonErrors: [
        {
          misconception: "maths.trig3d.two-dimensions-only",
          pattern: { kind: "numeric", value: q2.ac, tolerance: { type: "sf", figures: 3 } },
          feedback:
            "This is $AC$, the diagonal of the base: only two dimensions were used. Adding $7^2$ to the 32 you already have finishes it, and $AG = 9$ cm.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
        {
          misconception: "maths.trig3d.dimensions-added",
          pattern: { kind: "numeric", value: 15 },
          feedback:
            "The three lengths were added. A straight line through the inside of the box is shorter than a walk along three edges, so add the squares instead.",
          marksTypicallyEarned: 0,
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0003 — a cube
// ---------------------------------------------------------------------------

const q3 = cuboidFacts(6, 6, 6, "q3");

Q({
  difficulty: 2,
  ao: ["AO1"],
  commandWords: ["Calculate"],
  emphasis: ["3 significant figures"],
  setting: "A cube drawn in oblique projection, no context",
  figures: [
    fig(
      cuboidOnly(q3, { edges: { AB: "6 cm", BC: "6 cm", CG: "6 cm" }, spaceDiag: true, spaceDiagLabel: "AG", target: 150 }),
      "A cube ABCDEFGH with every edge 6 cm, hidden edges AD, DC and DH dashed, and the space diagonal AG drawn thick.",
    ),
  ],
  skeleton: "(main)calculate2",
  solutionProgram: "AG^2 = 6^2*3 = 108; AG = sqrt(108) = 10.3923048454; 3sf -> 10.4",
  parts: [
    {
      id: "main",
      stem: "A cube has edges of length 6 cm.\nCalculate the length of one of its space diagonals, correct to 3 significant figures.",
      marks: 2,
      answer: num(q3.ag, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AG^2 = 6^2 + 6^2 + 6^2$ (or $= 108$)" },
        { id: "A1", code: "A", marks: 1, for: "$10.4$ (cm), accept $\\sqrt{108}$ or $6\\sqrt{3}$", accept: ["6√3", "√108"], dependsOn: ["MA1"] },
      ],
      hints: [
        "All three edges are the same, so the calculation is $3 \\times 6^2$.",
        "$\\sqrt{108} = 10.392\\ldots$",
        "Three significant figures means 10.4.",
      ],
      workedSolution: "$AG^2 = 6^2 + 6^2 + 6^2 = 108$, so $AG = \\sqrt{108} = 10.392\\ldots = 10.4$ cm (3 s.f.). Exactly, $AG = 6\\sqrt{3}$ cm.",
      commonErrors: [
        {
          misconception: "maths.trig3d.two-dimensions-only",
          pattern: { kind: "numeric", value: q3.ac, tolerance: { type: "sf", figures: 3 } },
          feedback: "$8.49$ cm is the diagonal of a face, which uses two edges. A space diagonal crosses all three.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
        {
          misconception: "maths.trig3d.dimensions-added",
          pattern: { kind: "numeric", value: 18 },
          feedback: "Three edges added end to end come to 18 cm, but the diagonal cuts straight through. Add the squares, then take the root.",
          marksTypicallyEarned: 0,
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0004 — name the angle, then find it
// ---------------------------------------------------------------------------

const q4 = cuboidFacts(6, 8, 7, "q4");
assert(q4.ac === 10, "q4 base diagonal changed");

Q({
  difficulty: 3,
  ao: ["AO1", "AO2"],
  commandWords: ["Write down", "Calculate"],
  emphasis: ["the base"],
  setting: "A cuboid drawn in oblique projection, no context",
  figures: [
    fig(
      cuboidPair(q4, {
        edges: { AB: "6 cm", BC: "8 cm", CG: "7 cm" },
        spaceDiagLabel: "AG",
        baseDiagLabel: "AC",
        angle: "x",
        triBase: "AC = 10 cm",
        triHeight: "CG = 7 cm",
      }),
      "On the left, a cuboid ABCDEFGH with AB = 6 cm, BC = 8 cm and CG = 7 cm, hidden edges dashed, the base diagonal AC dashed, the space diagonal AG drawn thick and the angle x marked at A between them. On the right, triangle ACG on its own with AC = 10 cm, CG = 7 cm and the angle x at A.",
    ),
  ],
  skeleton: "(a)write-down1|(b)calculate3",
  solutionProgram: "AC = sqrt(6^2+8^2) = 10; tan x = 7/10; x = 34.9920202017 -> 35.0",
  parts: [
    {
      id: "a",
      stem: "$ABCDEFGH$ is a cuboid with $AB = 6$ cm, $BC = 8$ cm and $CG = 7$ cm.\nWrite down, in three letters, the angle that $AG$ makes with the base $ABCD$.",
      marks: 1,
      answer: {
        kind: "text",
        accepted: ["angle GAC", "GAC", "CAG", "angle CAG", "∠GAC"],
        keyWords: [{ any: ["GAC", "CAG"], marks: 1, reject: ["GAB", "BAG", "AGC"] }],
        listingRule: false,
      },
      scheme: [{ id: "MA1", code: "MA", marks: 1, for: "$\\angle GAC$ (accept $\\angle CAG$, or the angle marked on the diagram at $A$ between $AG$ and $AC$)" }],
      hints: [
        "Shine a light straight down on $AG$: the shadow it casts on the base is the line the angle is measured from.",
        "That shadow is the base diagonal, not an edge.",
      ],
      workedSolution: "The projection of $AG$ on the base is $AC$, so the angle between $AG$ and the base is $\\angle GAC$.",
      commonErrors: [
        {
          misconception: "maths.trig3d.wrong-angle-identified",
          pattern: { kind: "text", regex: "G\\s*A\\s*B|B\\s*A\\s*G" },
          feedback:
            "$\\angle GAB$ is measured from the edge $AB$. The base is a whole plane, and the line to measure from is the shadow of $AG$, which is the diagonal $AC$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
        {
          misconception: "maths.trig3d.complement-of-required-angle",
          pattern: { kind: "text", regex: "A\\s*G\\s*C|C\\s*G\\s*A" },
          feedback:
            "$\\angle AGC$ sits at the top, between $AG$ and the vertical edge. It is $90°$ minus the angle you want, so this answer can be rescued by subtracting from 90.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M82:Q12",
        },
      ],
      requiresWorking: false,
    },
    {
      id: "b",
      stem: "Calculate the size of this angle.",
      marks: 3,
      answer: num(q4.angle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AC = 10$ seen, or triangle $ACG$ drawn with two known sides" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle GAC = \\dfrac{7}{10}$ (or $\\sin \\angle GAC = \\dfrac{7}{\\sqrt{149}}$, or $\\cos \\angle GAC = \\dfrac{10}{\\sqrt{149}}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(q4.angle)}°$ (accept $35°$ or ${sf(q4.angle)})`, dependsOn: ["MA2"] },
      ],
      hints: [
        "Find $AC$ first: it is the diagonal of a 6 by 8 rectangle.",
        "In triangle $ACG$ the height 7 is opposite the angle and $AC$ is next to it.",
        "$\\tan^{-1}(0.7) = 34.99\\ldots$",
      ],
      workedSolution: `$AC = \\sqrt{6^2 + 8^2} = 10$ cm. In triangle $ACG$, right-angled at $C$, $\\tan \\angle GAC = \\dfrac{7}{10}$, so $\\angle GAC = ${long(q4.angle, 4)}\\ldots = ${dp(q4.angle)}°$.`,
      commonErrors: [
        {
          misconception: "maths.trig3d.wrong-angle-identified",
          pattern: { kind: "numeric", value: atanDeg(7, 6), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The 6 cm edge has been used instead of the base diagonal, which measures the angle from $AB$ rather than from the base. Replace the 6 with $AC = 10$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
        {
          misconception: "maths.trig3d.complement-of-required-angle",
          pattern: { kind: "numeric", value: 90 - q4.angle, tolerance: { type: "sf", figures: 3 } },
          feedback: `This is the angle at $G$, between $AG$ and the vertical edge. Subtract from $90°$ to get ${dp(q4.angle)}°, or work from $A$ in the first place.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2023-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0005 — the angle with a face, the Summer 2025 wording
// ---------------------------------------------------------------------------

const q5 = cuboidFacts(9, 12, 4, "q5");
assert(q5.ac === 15, "q5 face diagonal changed");
const q5Angle = atanDeg(4, 15);
assert(Math.abs(q5Angle - asinDeg(4, q5.ag)) < 1e-9, "q5: the two routes to the angle disagree");

Q({
  difficulty: 4,
  commandWords: ["Calculate"],
  emphasis: ["largest face"],
  setting: "A cuboid drawn in oblique projection, no context",
  figures: [
    fig(
      cuboidOnly(q5, {
        edges: { AB: "9 cm", BC: "12 cm", CG: "4 cm" },
        spaceDiag: true,
        spaceDiagLabel: "AG",
        target: 165,
      }),
      "A cuboid ABCDEFGH with AB = 9 cm, BC = 12 cm and the vertical edge CG = 4 cm, so the base ABCD is the largest face. Hidden edges AD, DC and DH are dashed and the space diagonal AG is drawn thick.",
    ),
  ],
  skeleton: "(main)calculate3",
  solutionProgram: "largest face is 9 by 12; its diagonal = sqrt(81+144) = 15; tan angle = 4/15; angle = 14.9314174..., 3sf 14.9",
  parts: [
    {
      id: "main",
      stem: "$ABCDEFGH$ is a cuboid with $AB = 9$ cm, $BC = 12$ cm and $CG = 4$ cm.\nCalculate the angle between $AG$ and one of the two largest faces.",
      marks: 3,
      answer: num(q5Angle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "Largest face identified as $9 \\times 12$ and its diagonal found: $\\sqrt{9^2 + 12^2} = 15$" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan(\\text{angle}) = \\dfrac{4}{15}$ (or $\\sin(\\text{angle}) = \\dfrac{4}{\\sqrt{241}}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(q5Angle)}°$`, dependsOn: ["MA2"] },
      ],
      hints: [
        "Compare the three faces: $9 \\times 12$, $9 \\times 4$ and $12 \\times 4$. The largest is the base.",
        "The line you measure from is the diagonal of that face, and the perpendicular distance from $G$ to it is the remaining edge, 4 cm.",
        "$\\tan^{-1}\\left(\\dfrac{4}{15}\\right) = 14.93\\ldots$",
      ],
      workedSolution: `The largest faces are the $9 \\times 12$ rectangles, and $ABCD$ is one of them. Its diagonal is $AC = \\sqrt{9^2 + 12^2} = 15$ cm, and $G$ stands 4 cm above $C$, so $\\tan(\\text{angle}) = \\dfrac{4}{15}$ and the angle is $${dp(q5Angle)}°$.`,
      commonErrors: [
        {
          misconception: "maths.trig3d.wrong-angle-identified",
          pattern: { kind: "numeric", value: atanDeg(9, 12), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "This is an angle inside the face itself, between the diagonal and an edge. The question wants the angle that $AG$ makes with the face, which needs the 4 cm standing perpendicular to it.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
        {
          misconception: "maths.trig.premature-rounding",
          pattern: { kind: "numeric", value: 15 },
          feedback:
            "15 cm is the diagonal of the largest face, so the first mark is safe. The question asks for an angle, so one more step is needed: $\\tan^{-1}(4 \\div 15)$.",
          marksTypicallyEarned: 1,
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0006 — pyramid: slant edge, then its angle with the base
// ---------------------------------------------------------------------------

const q6 = pyramidFacts(8, 15, "q6");

Q({
  difficulty: 3,
  commandWords: ["Calculate"],
  setting: "A square-based pyramid, no context",
  figures: [
    fig(
      pyramidEdgePair(q6, { angle: "x", edges: { AB: "8 cm" }, triBase: `AM = ${sf(q6.half)} cm`, triHeight: "VM = 15 cm" }),
      "On the left, a square-based pyramid VABCD with base edge AB = 8 cm and the apex V vertically above the centre M of the base, with VM = 15 cm. The base diagonal AC and the height VM are dashed, the slant edge VA is drawn thick and the angle x is marked at A. On the right, triangle AMV on its own with AM = 5.66 cm, VM = 15 cm and the angle x at A.",
    ),
  ],
  skeleton: "(a)calculate2|(b)calculate3",
  solutionProgram:
    "AC = 8*sqrt(2) = 11.3137084990; AM = 5.6568542495; VA = sqrt(32+225) = sqrt(257) = 16.0312195419 -> 16.0; tan x = 15/5.6568542495; x = 69.3373562328 -> 69.3",
  parts: [
    {
      id: "a",
      stem: "$VABCD$ is a pyramid with a square base of side 8 cm. The apex $V$ is vertically above the centre $M$ of the base and $VM = 15$ cm.\nCalculate the length of the slant edge $VA$.",
      marks: 2,
      answer: num(q6.slantEdge, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AM^2 = 32$ seen (from $AC = \\sqrt{128}$, or from $4^2 + 4^2$), or $VA^2 = 32 + 225$" },
        { id: "A1", code: "A", marks: 1, for: "$16.0$ (cm), accept $\\sqrt{257}$ or $16.03\\ldots$", dependsOn: ["MA1"] },
      ],
      hints: [
        "$M$ is where the diagonals cross, so $AM$ is half of the base diagonal.",
        "Half of $\\sqrt{128}$ squares to 32, so there is no need for a decimal here.",
        "$\\sqrt{32 + 225} = \\sqrt{257}$.",
      ],
      workedSolution:
        "$AC = \\sqrt{8^2 + 8^2} = \\sqrt{128}$, so $AM = \\tfrac{1}{2}\\sqrt{128}$ and $AM^2 = 32$. Then $VA^2 = AM^2 + VM^2 = 32 + 225 = 257$, so $VA = \\sqrt{257} = 16.0$ cm (3 s.f.).",
      commonErrors: [
        {
          misconception: "maths.trig3d.half-base-vs-half-diagonal",
          pattern: { kind: "numeric", value: hyp2(4, 15), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "Half a base edge (4 cm) was used. That run belongs to the sloping face; the slant edge runs out to a corner, so the run is half the diagonal, whose square is 32.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M82:Q13",
        },
        {
          misconception: "maths.trig.isosceles-not-halved",
          pattern: { kind: "numeric", value: hyp2(q6.diag, 15), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The whole diagonal was used. The apex stands above the centre, so the horizontal distance from $A$ to the foot of the height is only half of $AC$.",
          marksTypicallyEarned: 0,
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "Calculate the angle between $VA$ and the base.",
      marks: 3,
      answer: num(q6.edgeAngle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "Angle $VAM$ (or $VAC$) identified, or triangle $AMV$ drawn separately" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle VAM = \\dfrac{15}{\\sqrt{32}}$ (or $\\sin \\angle VAM = \\dfrac{15}{\\sqrt{257}}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(q6.edgeAngle)}°$`, dependsOn: ["MA2"] },
      ],
      hints: [
        "The shadow of $VA$ on the base is $AM$.",
        "Use the exact $\\sqrt{32}$, not a rounded 5.66.",
        "$\\tan^{-1}\\left(\\dfrac{15}{\\sqrt{32}}\\right) = 69.3\\ldots$",
      ],
      workedSolution: `The angle is $\\angle VAM$. $\\tan \\angle VAM = \\dfrac{15}{\\sqrt{32}}$, so $\\angle VAM = ${long(q6.edgeAngle, 4)}\\ldots = ${dp(q6.edgeAngle)}°$.`,
      commonErrors: [
        {
          misconception: "maths.trig3d.complement-of-required-angle",
          pattern: { kind: "numeric", value: 90 - q6.edgeAngle, tolerance: { type: "sf", figures: 3 } },
          feedback: `This is the angle at $V$, between the slant edge and the vertical height. Subtracting from $90°$ gives ${dp(q6.edgeAngle)}°.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2023-summer:M82:Q12",
        },
        {
          misconception: "maths.trig3d.half-base-vs-half-diagonal",
          pattern: { kind: "numeric", value: atanDeg(15, 4), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "Half the base edge has been used again. For a slant edge the run along the base is half the diagonal, $\\sqrt{32} = 5.66$ cm, not 4 cm.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M82:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0007 — pyramid: the sloping face against the base
// ---------------------------------------------------------------------------

const q7 = pyramidFacts(12, 9, "q7");
assert(q7.slantHeight === hyp2(6, 9), "q7 slant height changed");

Q({
  difficulty: 4,
  commandWords: ["Calculate"],
  emphasis: ["sloping face"],
  setting: "A square-based pyramid, no context",
  figures: [
    fig(
      pyramidFacePair(q7, { angle: "y", edges: { AB: "12 cm" }, triBase: "MN = 6 cm", triHeight: "VM = 9 cm" }),
      "On the left, a square-based pyramid VABCD with base edge 12 cm and vertical height VM = 9 cm, N marked as the midpoint of AB. VM and MN are dashed, the slant height VN is drawn thick and the angle y is marked at N. On the right, triangle NMV on its own with MN = 6 cm, VM = 9 cm and the angle y at N.",
    ),
  ],
  skeleton: "(main)calculate3",
  solutionProgram: "MN = 6; VM = 9; tan y = 9/6 = 1.5; y = 56.3099324740 -> 56.3",
  parts: [
    {
      id: "main",
      stem: "$VABCD$ is a pyramid with a square base of side 12 cm. The apex $V$ is 9 cm vertically above the centre $M$ of the base, and $N$ is the midpoint of $AB$.\nCalculate the angle between the sloping face $VAB$ and the base.",
      marks: 3,
      answer: num(q7.faceAngle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$MN = 6$ used (half of a base edge), or triangle $NMV$ drawn separately" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle VNM = \\dfrac{9}{6}$ (or $\\tan$ of the same ratio from $VN = \\sqrt{117}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(q7.faceAngle)}°$`, dependsOn: ["MA2"] },
      ],
      hints: [
        "A face meets the base along the line $AB$; the steepest line in the face runs from $V$ down to the midpoint $N$.",
        "The shadow of $VN$ on the base is $MN$, half of a base edge.",
        "$\\tan^{-1}(1.5) = 56.3\\ldots$",
      ],
      workedSolution: `$N$ is the midpoint of $AB$, so $MN = 6$ cm and $VN$ is perpendicular to $AB$. In triangle $NMV$, right-angled at $M$, $\\tan \\angle VNM = \\dfrac{9}{6} = 1.5$, so the angle is $${dp(q7.faceAngle)}°$.`,
      commonErrors: [
        {
          misconception: "maths.trig3d.half-base-vs-half-diagonal",
          pattern: { kind: "numeric", value: q7.edgeAngle, tolerance: { type: "sf", figures: 3 } },
          feedback: `Half the diagonal (${sf(q7.half)} cm) was used, which gives the angle the slant edge makes with the base, ${dp(q7.edgeAngle)}°. For a face use half an edge, 6 cm.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M82:Q13",
        },
        {
          misconception: "maths.trig3d.no-2d-triangle",
          pattern: { kind: "numeric", value: atanDeg(9, 12), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The whole base edge, 12 cm, was used as the run. Draw triangle $NMV$ on its own and the run is clearly $MN$, from the centre to the midpoint of the edge.",
          marksTypicallyEarned: 0,
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0008 — a cone: slant height and the angle at the rim
// ---------------------------------------------------------------------------

const q8 = coneFacts(7, 24, "q8");
assert(q8.l === 25, "q8 slant height changed");

Q({
  difficulty: 3,
  commandWords: ["Show that", "Calculate"],
  setting: "A cone standing on its base, no context",
  figures: [
    fig(
      conePair(q8, { angle: "x", rLabel: "7 cm", hLabel: "24 cm", lLabel: "l", triBase: "OP = 7 cm", triHeight: "OV = 24 cm" }),
      "On the left, a cone standing on its circular base, with the vertical height from the apex V to the centre O drawn dashed and labelled 24 cm, the radius OP dashed and labelled 7 cm, a right angle at O, and the slant height VP drawn thick and labelled l, with the angle x marked at P. On the right, triangle POV on its own with OP = 7 cm, OV = 24 cm and the angle x at P.",
    ),
  ],
  skeleton: "(a)show-that2|(b)calculate2",
  solutionProgram: "l^2 = 7^2 + 24^2 = 49 + 576 = 625; l = 25; tan x = 24/7; x = 73.7397952917 -> 73.7",
  parts: [
    {
      id: "a",
      stem: "A cone has base radius 7 cm and vertical height 24 cm. $V$ is the apex, $O$ is the centre of the base and $P$ is a point on the edge of the base.\nShow that the slant height $VP$ is 25 cm.",
      marks: 2,
      answer: num(q8.l, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$VP^2 = 7^2 + 24^2$ (or $= 625$)" },
        { id: "A1", code: "A", marks: 1, for: "$VP = \\sqrt{625} = 25$ seen", dependsOn: ["MA1"] },
      ],
      hints: [
        "The height meets the base at right angles, so $OP$, $OV$ and $VP$ make a right-angled triangle.",
        "The slant height is the hypotenuse of that triangle.",
        "$49 + 576 = 625$.",
      ],
      workedSolution:
        "$OV$ is perpendicular to the base, so triangle $POV$ is right-angled at $O$ with the slant height as hypotenuse: $VP^2 = 7^2 + 24^2 = 49 + 576 = 625$, so $VP = 25$ cm.",
      commonErrors: [
        {
          misconception: "maths.trig3d.slant-height-as-vertical-height",
          pattern: { kind: "numeric", value: Math.sqrt(24 * 24 - 7 * 7), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "Subtracting treats the 24 as the hypotenuse. The right angle is where the height meets the base, so the side opposite it, the slant height, is the longest and the squares are added.",
          marksTypicallyEarned: 0,
        },
        {
          misconception: "maths.trig3d.squares-not-rooted",
          pattern: { kind: "numeric", value: 625 },
          feedback: "625 is $VP^2$. A show-that part needs the final line to be the printed length, so take the root: $VP = 25$ cm.",
          marksTypicallyEarned: 1,
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "Calculate the angle between the slant height $VP$ and the base.",
      marks: 2,
      answer: num(q8.base, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$\\tan \\angle VPO = \\dfrac{24}{7}$ (or $\\cos \\angle VPO = \\dfrac{7}{25}$, or $\\sin \\angle VPO = \\dfrac{24}{25}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(q8.base)}°$`, dependsOn: ["MA1"] },
      ],
      hints: ["The angle sits at $P$, where the slant height meets the base.", "$\\tan^{-1}\\left(\\dfrac{24}{7}\\right) = 73.7\\ldots$"],
      workedSolution: `In triangle $POV$, $\\tan \\angle VPO = \\dfrac{24}{7}$, so the angle is $${dp(q8.base)}°$. With the 25 from part (a), $\\cos \\angle VPO = \\dfrac{7}{25}$ gives the same value.`,
      commonErrors: [
        {
          misconception: "maths.trig3d.complement-of-required-angle",
          pattern: { kind: "numeric", value: q8.apex, tolerance: { type: "sf", figures: 3 } },
          feedback: `${dp(q8.apex)}° is the angle at the apex, between the slant height and the vertical. The angle with the base is its complement, ${dp(q8.base)}°.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0009 — a wedge
// ---------------------------------------------------------------------------

const q9 = wedgeFacts(8, 6, 3, "q9");
assert(q9.ac === 10, "q9 base diagonal changed");

Q({
  difficulty: 3,
  commandWords: ["Calculate"],
  setting: "A wedge-shaped stage ramp, metres",
  figures: [
    fig(
      wedgePair(q9, { angle: "x", unit: "m", triBase: "AC = 10 m", triHeight: "CG = 3 m" }),
      "On the left, a wedge: the horizontal rectangular base ABCD has AB = 8 m and BC = 6 m, and the back face DCGH is vertical with CG = 3 m, so ABGH is the sloping surface. The hidden edges AD, DC and DH are dashed, the base diagonal AC is dashed and the sloping line AG is drawn thick with the angle x at A. On the right, triangle ACG on its own with AC = 10 m, CG = 3 m and the angle x at A.",
    ),
  ],
  skeleton: "(main)calculate3",
  solutionProgram: "AC = sqrt(8^2+6^2) = 10; tan x = 3/10; x = 16.6992442339 -> 16.7",
  parts: [
    {
      id: "main",
      stem: "A wedge-shaped ramp has a horizontal base $ABCD$ with $AB = 8$ m and $BC = 6$ m. The back face $DCGH$ is vertical with $CG = 3$ m, and $ABGH$ is the sloping surface.\nCalculate the angle that $AG$ makes with the base.",
      marks: 3,
      answer: num(q9.angle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AC = \\sqrt{8^2 + 6^2} = 10$" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle GAC = \\dfrac{3}{10}$" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(q9.angle)}°$`, dependsOn: ["MA2"] },
      ],
      hints: [
        "The solid is not a cuboid, and the method does not change: find the shadow of $AG$ on the ground first.",
        "$G$ stands 3 m above $C$.",
        "$\\tan^{-1}(0.3) = 16.7\\ldots$",
      ],
      workedSolution: `$AC = \\sqrt{8^2 + 6^2} = 10$ m is the shadow of $AG$ on the base. In triangle $ACG$, right-angled at $C$, $\\tan \\angle GAC = \\dfrac{3}{10}$, so the angle is $${dp(q9.angle)}°$.`,
      commonErrors: [
        {
          misconception: "maths.trig3d.wrong-angle-identified",
          pattern: { kind: "numeric", value: atanDeg(3, 8), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The 8 m edge was used instead of the base diagonal. That is the angle the sloping face makes with the base along $AH$, not the angle $AG$ makes with the base.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
        {
          misconception: "maths.trig3d.no-2d-triangle",
          pattern: { kind: "numeric", value: atanDeg(3, 6), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The 6 m edge was used as the run. Redraw triangle $ACG$ on its own: the side next to the angle is the base diagonal $AC$, which is 10 m.",
          marksTypicallyEarned: 0,
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0010 — will it fit? (mixed units)
// ---------------------------------------------------------------------------

const q10 = cuboidFacts(130, 90, 50, "q10");
assert(q10.ag > 160, "q10: the rod no longer fits, so the wording would be untrue");

Q({
  difficulty: 4,
  commandWords: ["Calculate", "Explain"],
  emphasis: ["metres", "centimetres"],
  setting: "A storage crate and a metal rod, mixed units",
  figures: [
    fig(
      cuboidOnly(q10, { edges: { AB: "1.3 m", BC: "90 cm", CG: "0.5 m" }, spaceDiag: true, spaceDiagLabel: "AG", target: 165 }),
      "A rectangular crate ABCDEFGH drawn as a cuboid with AB = 1.3 m, BC = 90 cm and the vertical edge CG = 0.5 m. Hidden edges are dashed and the space diagonal AG is drawn thick.",
    ),
  ],
  skeleton: "(a)calculate3|(b)explain1",
  solutionProgram: "convert: 130 cm, 90 cm, 50 cm; AG^2 = 16900 + 8100 + 2500 = 27500; AG = 165.831239518 -> 166 cm; 160 < 165.8 so a 1.6 m rod fits",
  parts: [
    {
      id: "a",
      stem: "A crate is a cuboid $ABCDEFGH$ with $AB = 1.3$ m, $BC = 90$ cm and $CG = 0.5$ m.\nCalculate the length of the longest straight rod that will fit inside the crate. Give your answer in centimetres, correct to 3 significant figures.",
      marks: 3,
      answer: num(q10.ag, { unit: "cm", unitRequired: true }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "All three lengths in the same unit: 130, 90 and 50 (cm)" },
        { id: "MA2", code: "MA", marks: 1, for: "$AG^2 = 130^2 + 90^2 + 50^2$ (or $= 27\\,500$)" },
        { id: "A1", code: "A", marks: 1, for: "$166$ (cm), accept $165.8$ or $\\sqrt{27500}$", dependsOn: ["MA2"] },
      ],
      hints: [
        "Convert everything to centimetres before any squaring: 1.3 m is 130 cm.",
        "The longest straight line inside a cuboid is the space diagonal.",
        "$\\sqrt{27\\,500} = 165.83\\ldots$",
      ],
      workedSolution:
        "In centimetres the crate is $130 \\times 90 \\times 50$. The longest straight line inside is the space diagonal: $AG^2 = 130^2 + 90^2 + 50^2 = 16\\,900 + 8\\,100 + 2\\,500 = 27\\,500$, so $AG = \\sqrt{27\\,500} = 165.8\\ldots = 166$ cm (3 s.f.).",
      commonErrors: [
        {
          misconception: "maths.trig.unit-mismatch-when-adding",
          pattern: { kind: "numeric", value: Math.sqrt(1.3 ** 2 + 90 ** 2 + 0.5 ** 2), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "Metres and centimetres went into the same calculation, so the 90 swamped the other two. Convert first: 1.3 m is 130 cm and 0.5 m is 50 cm.",
          marksTypicallyEarned: 0,
        },
        {
          misconception: "maths.trig3d.two-dimensions-only",
          pattern: { kind: "numeric", value: q10.ac, tolerance: { type: "sf", figures: 3 } },
          feedback: "150 cm is the diagonal across the floor of the crate. The rod can also be tilted upwards, so the 50 cm height belongs in the calculation too.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "A rod is 1.6 m long. Explain whether it will fit inside the crate.",
      marks: 1,
      answer: {
        kind: "text",
        accepted: [
          "Yes, because 160 cm is less than 165.8 cm",
          "Yes, 1.6 m is shorter than the space diagonal",
          "Yes, it fits diagonally",
        ],
        keyWords: [{ any: ["yes", "it fits", "will fit"], marks: 1, reject: ["no", "does not fit"] }],
        listingRule: false,
      },
      scheme: [
        {
          id: "MA1",
          code: "MA",
          marks: 1,
          for: "Yes, with a comparison: $160 < 165.8$ (follow through from part (a))",
          ft: true,
          examinerNote: "A bare yes with no comparison scores nothing; the reason is the mark.",
        },
      ],
      hints: ["Put both lengths in the same unit before comparing.", "The rod must lie along the longest line available, the space diagonal."],
      workedSolution: "The rod is 160 cm and the longest line inside the crate is 165.8 cm, so the rod fits, but only if it is placed along the space diagonal.",
      commonErrors: [
        {
          misconception: "maths.trig.unit-mismatch-when-adding",
          pattern: { kind: "text", regex: "\\bno\\b|does ?n[o']t fit" },
          feedback:
            "1.6 m is 160 cm, which is shorter than the 166 cm diagonal, so it does fit. Comparing 1.6 with 166 without converting is what turns this answer around.",
          marksTypicallyEarned: 0,
        },
      ],
      requiresWorking: false,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0011 — backwards from the space diagonal, with a calculator
// ---------------------------------------------------------------------------

const q11 = cubeFromDiagonal(20, "q11");

Q({
  difficulty: 4,
  commandWords: ["Calculate"],
  setting: "A cube, no context",
  figures: [
    fig(
      cuboidOnly({ w: 6, d: 6, h: 6 }, {
        edges: { AB: "x cm", BC: "x cm", CG: "x cm" },
        spaceDiag: true,
        spaceDiagLabel: "20 cm",
        target: 150,
      }),
      "A cube ABCDEFGH with each edge labelled x cm and the space diagonal AG drawn thick and labelled 20 cm. Hidden edges are dashed.",
    ),
  ],
  skeleton: "(main)calculate3",
  solutionProgram: "3x^2 = 400; x^2 = 133.333333333; x = 11.5470053838 -> 11.5",
  parts: [
    {
      id: "main",
      stem: "The space diagonal of a cube is 20 cm.\nCalculate the length of an edge of the cube, correct to 3 significant figures.",
      marks: 3,
      answer: num(q11.x, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$x^2 + x^2 + x^2 = 20^2$ or $3x^2 = 400$" },
        { id: "MA2", code: "MA", marks: 1, for: "$x^2 = \\dfrac{400}{3}$ (or $133.3\\ldots$)" },
        { id: "A1", code: "A", marks: 1, for: "$11.5$ (cm), accept $\\dfrac{20}{\\sqrt{3}}$ or $11.547\\ldots$", dependsOn: ["MA2"] },
      ],
      hints: [
        "Call the edge $x$ and write the space-diagonal rule with all three dimensions equal.",
        "$x^2 + x^2 + x^2$ collects to $3x^2$.",
        "Divide by 3 before taking the square root.",
      ],
      workedSolution:
        "Let the edge be $x$ cm. Then $3x^2 = 20^2 = 400$, so $x^2 = \\dfrac{400}{3} = 133.33\\ldots$ and $x = 11.547\\ldots = 11.5$ cm (3 s.f.).",
      commonErrors: [
        {
          misconception: "maths.trig3d.dimensions-added",
          pattern: { kind: "numeric", value: 20 / 3, tolerance: { type: "sf", figures: 3 } },
          feedback:
            "Dividing the diagonal by 3 treats the three edges as sections of it. They are not: it is the three squares that add to $20^2$, so $3x^2 = 400$.",
          marksTypicallyEarned: 0,
        },
        {
          misconception: "maths.trig3d.two-dimensions-only",
          pattern: { kind: "numeric", value: 20 / Math.SQRT2, tolerance: { type: "sf", figures: 3 } },
          feedback: "Two squares were used, which is the rule for a face diagonal. A space diagonal uses all three, so divide 400 by 3 rather than by 2.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0012 — the angle is given, the height is not
// ---------------------------------------------------------------------------

const q12h = 15 * Math.tan((40 * Math.PI) / 180);
const q12 = cuboidFacts(9, 12, q12h, "q12");
assert(Math.abs(q12.angle - 40) < 1e-9, "q12: the height no longer produces a 40 degree angle");

Q({
  difficulty: 4,
  commandWords: ["Show that", "Calculate"],
  setting: "A cuboid drawn in oblique projection, no context",
  figures: [
    fig(
      cuboidOnly(q12, {
        edges: { AB: "9 cm", BC: "12 cm", CG: "h cm" },
        baseDiag: true,
        spaceDiag: true,
        angle: "40°",
        target: 165,
      }),
      "A cuboid ABCDEFGH with AB = 9 cm, BC = 12 cm and the vertical edge CG labelled h cm. Hidden edges are dashed, the base diagonal AC is dashed, the space diagonal AG is drawn thick and the angle between AG and AC at A is marked 40 degrees, with a right angle at C.",
    ),
  ],
  skeleton: "(a)show-that2|(b)calculate3",
  solutionProgram: "AC = sqrt(81+144) = 15; h = 15 tan 40 = 12.5864938...; 3sf 12.6",
  parts: [
    {
      id: "a",
      stem: "$ABCDEFGH$ is a cuboid with $AB = 9$ cm and $BC = 12$ cm. The space diagonal $AG$ makes an angle of $40°$ with the base.\nShow that the base diagonal $AC$ is 15 cm.",
      marks: 2,
      answer: num(15, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AC^2 = 9^2 + 12^2$ (or $= 225$)" },
        { id: "A1", code: "A", marks: 1, for: "$AC = \\sqrt{225} = 15$ seen", dependsOn: ["MA1"] },
      ],
      hints: ["The base is a rectangle, so triangle $ABC$ is right-angled at $B$.", "$81 + 144 = 225$."],
      workedSolution: "$AC^2 = 9^2 + 12^2 = 81 + 144 = 225$, so $AC = \\sqrt{225} = 15$ cm.",
      commonErrors: [
        {
          misconception: "maths.trig3d.squares-not-rooted",
          pattern: { kind: "numeric", value: 225 },
          feedback: "225 is $AC^2$, and a show-that part must finish on the printed length: $\\sqrt{225} = 15$ cm.",
          marksTypicallyEarned: 1,
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "Calculate the height $CG$ of the cuboid.",
      marks: 3,
      answer: num(q12h, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "Triangle $ACG$ used with the $40°$ at $A$ and $AC = 15$" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan 40° = \\dfrac{CG}{15}$ or $CG = 15\\tan 40°$" },
        { id: "A1", code: "A", marks: 1, for: `$${sf(q12h)}$ (cm), accept $12.59$ or $12.586\\ldots$`, dependsOn: ["MA2"] },
      ],
      hints: [
        "The $40°$ lives in triangle $ACG$, between $AG$ and $AC$.",
        "$CG$ is opposite the angle and $AC$ is next to it, so tangent again.",
        "Multiply, do not divide: $CG = 15 \\times \\tan 40°$.",
      ],
      workedSolution: `In triangle $ACG$, right-angled at $C$, $\\tan 40° = \\dfrac{CG}{15}$, so $CG = 15\\tan 40° = ${long(q12h, 4)}\\ldots = ${sf(q12h)}$ cm (3 s.f.).`,
      commonErrors: [
        {
          misconception: "maths.trig.cannot-rearrange-ratio",
          pattern: { kind: "numeric", value: 15 / Math.tan((40 * Math.PI) / 180), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The ratio was rearranged the wrong way round: $\\tan 40° = \\dfrac{CG}{15}$ means $CG = 15\\tan 40°$, so the 15 multiplies. Dividing gives a height taller than the base diagonal, which the diagram rules out.",
          marksTypicallyEarned: 2,
        },
        {
          misconception: "maths.trig3d.no-2d-triangle",
          pattern: { kind: "numeric", value: 12 * Math.tan((40 * Math.PI) / 180), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The 12 cm edge was used instead of $AC$. The $40°$ is measured from the base diagonal, so the triangle containing it has $AC = 15$ along the bottom.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0013 — Paper 1, in surd form
// ---------------------------------------------------------------------------

const q13 = cuboidFacts(6, 6, 12, "q13");
const s13 = surd(216);
assert(s13.latex === "6\\sqrt{6}", "q13 surd changed");

Q({
  difficulty: 4,
  paper: P1,
  commandWords: ["Find"],
  emphasis: ["in the form"],
  setting: "A cuboid drawn in oblique projection, no context",
  figures: [
    fig(
      cuboidOnly(q13, { edges: { AB: "6 cm", BC: "6 cm", CG: "12 cm" }, spaceDiag: true, spaceDiagLabel: "AG", target: 165 }),
      "A cuboid ABCDEFGH with AB = 6 cm, BC = 6 cm and the vertical edge CG = 12 cm, hidden edges dashed, and the space diagonal AG drawn thick.",
    ),
  ],
  skeleton: "(main)find3",
  solutionProgram: "AG^2 = 36 + 36 + 144 = 216; sqrt(216) = sqrt(36*6) = 6 sqrt 6",
  parts: [
    {
      id: "main",
      stem: "$ABCDEFGH$ is a cuboid with $AB = 6$ cm, $BC = 6$ cm and $CG = 12$ cm.\nFind the length of $AG$, leaving your answer in the form $a\\sqrt{b}$.",
      marks: 3,
      answer: { kind: "algebraic", latex: "6\\sqrt{6}", equivalence: "equivalent", variables: [] },
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AG^2 = 6^2 + 6^2 + 12^2$" },
        { id: "MA2", code: "MA", marks: 1, for: "$AG = \\sqrt{216}$" },
        { id: "A1", code: "A", marks: 1, for: "$6\\sqrt{6}$ (cm)", dependsOn: ["MA2"] },
      ],
      hints: [
        "There is no calculator, so leave the root alone until the end.",
        "$36 + 36 + 144 = 216$.",
        "Look for the largest square factor of 216: it is 36.",
      ],
      workedSolution: "$AG^2 = 6^2 + 6^2 + 12^2 = 36 + 36 + 144 = 216$, so $AG = \\sqrt{216} = \\sqrt{36 \\times 6} = 6\\sqrt{6}$ cm.",
      commonErrors: [
        {
          misconception: "maths.surds.not-simplified-first",
          pattern: { kind: "algebraic", latex: "\\sqrt{216}" },
          feedback:
            "$\\sqrt{216}$ is correct but not in the form asked for. Split off the largest square factor: $216 = 36 \\times 6$, so the answer is $6\\sqrt{6}$.",
          marksTypicallyEarned: 2,
        },
        {
          misconception: "maths.trig3d.two-dimensions-only",
          pattern: { kind: "algebraic", latex: "6\\sqrt{2}" },
          feedback: "$6\\sqrt{2}$ is the diagonal of the square base, from two dimensions. The 12 cm height still has to be added in as $12^2$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
    },
  ],
});

// ---------------------------------------------------------------------------
// 0014 — exam-style: the Summer 2025 shape, three parts
// ---------------------------------------------------------------------------

const e1 = cuboidFacts(5, 12, 9, "e1");
assert(e1.ac === 13, "e1 base diagonal changed");

Q({
  style: "exam-style",
  difficulty: 4,
  commandWords: ["Show that", "Calculate"],
  emphasis: ["the base"],
  setting: "A cuboid drawn in oblique projection, no context",
  examinerSources: ["ccea-cer:maths:2025-summer:M82:Q12", "ccea-cer:maths:2023-summer:M82:Q12"],
  figures: [
    fig(
      cuboidPair(e1, {
        edges: { AB: "5 cm", BC: "12 cm", CG: "9 cm" },
        baseDiagLabel: "AC",
        spaceDiagLabel: "AG",
        angle: "x",
        triBase: "AC = 13 cm",
        triHeight: "CG = 9 cm",
      }),
      "On the left, a cuboid ABCDEFGH with AB = 5 cm, BC = 12 cm and the vertical edge CG = 9 cm, hidden edges AD, DC and DH dashed, the base diagonal AC dashed, the space diagonal AG drawn thick and the angle x marked at A with a right angle at C. On the right, triangle ACG on its own with AC = 13 cm, CG = 9 cm, AG as the hypotenuse and the angle x at A.",
    ),
  ],
  skeleton: "(a)show-that2|(b)calculate2|(c)calculate3",
  solutionProgram:
    "AC^2 = 5^2 + 12^2 = 169, AC = 13; AG^2 = 169 + 81 = 250, AG = 15.8113883008 -> 15.8; tan x = 9/13, x = 34.6951535312 -> 34.7",
  parts: [
    {
      id: "a",
      stem: "$ABCDEFGH$ is a cuboid with $AB = 5$ cm, $BC = 12$ cm and $CG = 9$ cm.\nShow that $AC = 13$ cm.",
      marks: 2,
      answer: num(13, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AC^2 = 5^2 + 12^2$ (or $= 169$)" },
        { id: "A1", code: "A", marks: 1, for: "$AC = \\sqrt{169} = 13$ seen", dependsOn: ["MA1"] },
      ],
      hints: ["Triangle $ABC$ lies flat in the base and is right-angled at $B$.", "$25 + 144 = 169$, and 169 is a square number."],
      workedSolution: "$AC^2 = 5^2 + 12^2 = 25 + 144 = 169$, so $AC = \\sqrt{169} = 13$ cm.",
      commonErrors: [
        {
          misconception: "maths.trig3d.squares-not-rooted",
          pattern: { kind: "numeric", value: 169 },
          feedback: "169 is $AC^2$. Show-that parts are marked on the final line, so write $AC = \\sqrt{169} = 13$ cm.",
          marksTypicallyEarned: 1,
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "Calculate the length of the space diagonal $AG$.",
      marks: 2,
      answer: num(e1.ag, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AG^2 = 13^2 + 9^2$ (or $= 250$), or $AG^2 = 5^2 + 12^2 + 9^2$" },
        { id: "A1", code: "A", marks: 1, for: "$15.8$ (cm), accept $\\sqrt{250}$, $5\\sqrt{10}$ or $15.81\\ldots$", dependsOn: ["MA1"] },
      ],
      hints: [
        "Use part (a): triangle $ACG$ is right-angled at $C$ with $AC = 13$ and $CG = 9$.",
        "$169 + 81 = 250$.",
        "$\\sqrt{250} = 15.81\\ldots$",
      ],
      workedSolution: "$AG^2 = AC^2 + CG^2 = 169 + 81 = 250$, so $AG = \\sqrt{250} = 15.81\\ldots = 15.8$ cm (3 s.f.).",
      commonErrors: [
        {
          misconception: "maths.trig3d.two-dimensions-only",
          pattern: { kind: "numeric", value: hyp2(12, 9), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "15 cm is the diagonal of the $12 \\times 9$ face. The space diagonal needs the third dimension as well, so start from $AC = 13$ and add $9^2$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
    {
      id: "c",
      stem: "Calculate the angle between $AG$ and the base $ABCD$.",
      marks: 3,
      answer: num(e1.angle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$\\angle GAC$ identified, or triangle $ACG$ drawn separately with $AC$ and $CG$ marked" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle GAC = \\dfrac{9}{13}$ (or $\\sin \\angle GAC = \\dfrac{9}{\\sqrt{250}}$, or $\\cos \\angle GAC = \\dfrac{13}{\\sqrt{250}}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(e1.angle)}°$ (accept $34.7°$ or $34.70°$)`, dependsOn: ["MA2"] },
      ],
      hints: [
        "Name the angle before calculating: the shadow of $AG$ on the base is $AC$.",
        "The exact sides are 9 and 13, so tangent keeps everything exact.",
        "$\\tan^{-1}\\left(\\dfrac{9}{13}\\right) = 34.69\\ldots$",
      ],
      workedSolution: `The angle between $AG$ and the base is $\\angle GAC$. In triangle $ACG$, $\\tan \\angle GAC = \\dfrac{9}{13}$, so $\\angle GAC = ${long(e1.angle, 4)}\\ldots = ${dp(e1.angle)}°$ (1 d.p.).`,
      commonErrors: [
        {
          misconception: "maths.trig3d.wrong-angle-identified",
          pattern: { kind: "numeric", value: atanDeg(9, 5), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The 5 cm edge was used, so this is $\\angle GAB$ rather than the angle with the base. Less than half of the Summer 2025 entry identified this angle, and naming it in three letters first is what fixes it.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
        {
          misconception: "maths.trig.premature-rounding",
          pattern: { kind: "numeric", value: atanDeg(9, 15.8), tolerance: { type: "absolute", value: 0.02 } },
          feedback:
            "A rounded 15.8 was used with sine instead of the exact $\\sqrt{250}$. Use the two exact sides 9 and 13 with tangent, or keep the root, and the accuracy mark is safe.",
          marksTypicallyEarned: 2,
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "b", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0015 — exam-style: pyramid, height from the slant edge, then the face angle
// ---------------------------------------------------------------------------

const e2 = pyramidFacts(16, Math.sqrt(17 * 17 - 128), "e2");
assert(Math.abs(e2.slantEdge - 17) < 1e-9 && e2.slantHeight === 15, "e2 pyramid numbers changed");

Q({
  style: "exam-style",
  difficulty: 5,
  commandWords: ["Show that", "Calculate"],
  emphasis: ["sloping face"],
  setting: "A glass pyramid on a square base, no context",
  examinerSources: ["ccea-cer:maths:2024-november:M82:Q13"],
  figures: [
    fig(
      pyramidEdgePair(e2, {
        edges: { AB: "16 cm" },
        innerLabels: { VA: "17 cm" },
        innerSides: { VA: 1 },
        height: true,
        angle: "",
        triBase: `AM = ${sf(e2.half)} cm`,
        triHeight: "VM = h",
        triHyp: "VA = 17 cm",
        captionB: "triangle AMV, drawn on its own",
      }),
      "On the left, a square-based pyramid VABCD with base edge AB = 16 cm and slant edge VA = 17 cm. The base diagonal AC and the vertical height VM from the apex to the centre M are dashed, and VA is drawn thick. On the right, triangle AMV on its own with AM = 11.31 cm along the bottom, the height VM labelled h and the hypotenuse VA = 17 cm.",
    ),
  ],
  skeleton: "(a)show-that3|(b)calculate3",
  solutionProgram:
    "AC = 16 sqrt 2 = 22.6274169980; AM = 11.3137084990, AM^2 = 128; VM^2 = 17^2 - 128 = 161; VM = 12.6885775404 -> 12.7; MN = 8; tan angle = 12.6885775404/8; angle = 57.7690472195 -> 57.8",
  parts: [
    {
      id: "a",
      stem: "$VABCD$ is a pyramid with a square base of side 16 cm. The apex $V$ is vertically above the centre $M$ of the base, and the slant edge $VA$ is 17 cm.\nShow that the vertical height of the pyramid is 12.7 cm, correct to 3 significant figures.",
      marks: 3,
      answer: num(e2.ht, { unit: "cm" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AC = \\sqrt{16^2 + 16^2}$ and $AM = \\tfrac{1}{2}AC$, or $AM^2 = 128$ stated" },
        { id: "MA2", code: "MA", marks: 1, for: "$VM^2 = 17^2 - 128$ (or $= 161$)" },
        { id: "A1", code: "A", marks: 1, for: "$VM = \\sqrt{161} = 12.688\\ldots = 12.7$ seen", dependsOn: ["MA2"] },
      ],
      hints: [
        "The height drops to the centre of the base, so the triangle is $AMV$ with $AM$ half a diagonal.",
        "This time the hypotenuse is known, so the squares are subtracted.",
        "$289 - 128 = 161$.",
      ],
      workedSolution:
        "$AC = \\sqrt{16^2 + 16^2} = \\sqrt{512}$, so $AM = \\tfrac{1}{2}\\sqrt{512}$ and $AM^2 = 128$. In triangle $AMV$, right-angled at $M$, $VM^2 = VA^2 - AM^2 = 289 - 128 = 161$, so $VM = \\sqrt{161} = 12.688\\ldots = 12.7$ cm (3 s.f.).",
      commonErrors: [
        {
          misconception: "maths.trig3d.slant-height-as-vertical-height",
          pattern: { kind: "numeric", value: hyp2(17, e2.half), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The squares were added, which treats $VA$ as a shorter side. $VA$ is the hypotenuse of triangle $AMV$ because the right angle is at $M$, so subtract: $17^2 - 128$.",
          marksTypicallyEarned: 1,
        },
        {
          misconception: "maths.trig3d.half-base-vs-half-diagonal",
          pattern: { kind: "numeric", value: Math.sqrt(289 - 64), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "Half a base edge (8 cm) was used. The slant edge $VA$ runs to a corner, so the horizontal run is half a diagonal, whose square is 128 rather than 64.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M82:Q13",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "$N$ is the midpoint of $AB$. Calculate the angle between the sloping face $VAB$ and the base.",
      marks: 3,
      answer: num(e2.faceAngle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$MN = 8$ used, or triangle $NMV$ drawn separately" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle VNM = \\dfrac{\\sqrt{161}}{8}$ (accept $\\dfrac{12.688\\ldots}{8}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(e2.faceAngle)}°$ (accept $57.8°$)`, dependsOn: ["MA2"] },
      ],
      hints: [
        "The line of greatest slope in the face runs from $V$ to $N$, and its shadow is $MN$.",
        "$MN$ is half of a base edge, so 8 cm.",
        "Keep $\\sqrt{161}$ rather than 12.7.",
      ],
      workedSolution: `In triangle $NMV$, right-angled at $M$, $\\tan \\angle VNM = \\dfrac{\\sqrt{161}}{8}$, so $\\angle VNM = ${long(e2.faceAngle, 4)}\\ldots = ${dp(e2.faceAngle)}°$. (The slant height $VN = \\sqrt{161 + 64} = 15$ cm, a useful check.)`,
      commonErrors: [
        {
          misconception: "maths.trig3d.half-base-vs-half-diagonal",
          pattern: { kind: "numeric", value: e2.edgeAngle, tolerance: { type: "sf", figures: 3 } },
          feedback: `Half the diagonal was used, giving the angle the slant edge makes with the base, ${dp(e2.edgeAngle)}°. The face is the steeper of the two at ${dp(e2.faceAngle)}°.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M82:Q13",
        },
        {
          misconception: "maths.trig.premature-rounding",
          pattern: { kind: "numeric", value: atanDeg(12.7, 8), tolerance: { type: "absolute", value: 0.015 } },
          feedback:
            "The rounded 12.7 from part (a) was used. Carry the exact $\\sqrt{161}$ forward; the printed 12.7 is only for the answer line.",
          marksTypicallyEarned: 2,
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0016 — exam-style: a wedge in context
// ---------------------------------------------------------------------------

const e3 = wedgeFacts(15, 8, 4.5, "e3");
assert(e3.ac === 17, "e3 base diagonal changed");

Q({
  style: "exam-style",
  difficulty: 4,
  commandWords: ["Calculate"],
  setting: "A wedge-shaped loading bay for a farm trailer, metres",
  examinerSources: ["ccea-cer:maths:2024-summer:M82:Q11"],
  figures: [
    fig(
      wedgePair(e3, { angle: "x", unit: "m", triBase: "AC = 17 m", triHeight: "CG = 4.5 m" }),
      "On the left, a wedge-shaped loading bay: the horizontal rectangular base ABCD has AB = 15 m and BC = 8 m, and the back face DCGH is vertical with CG = 4.5 m, so ABGH is the sloping surface. Hidden edges AD, DC and DH are dashed, the base diagonal AC is dashed and the sloping line AG is drawn thick with the angle x at A. On the right, triangle ACG on its own with AC = 17 m, CG = 4.5 m and the angle x at A.",
    ),
  ],
  skeleton: "(a)calculate2|(b)calculate3",
  solutionProgram: "AC = sqrt(225+64) = 17; AG = sqrt(289+20.25) = sqrt(309.25) = 17.5855054...; tan x = 4.5/17; x = 14.8264802... -> 14.8",
  parts: [
    {
      id: "a",
      stem: "A loading bay is a wedge. Its horizontal base $ABCD$ has $AB = 15$ m and $BC = 8$ m, the back face $DCGH$ is vertical with $CG = 4.5$ m, and $ABGH$ is the sloping surface.\nCalculate the length of $AG$.",
      marks: 2,
      answer: num(e3.ag, { unit: "m" }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AC = 17$ found, or $AG^2 = 15^2 + 8^2 + 4.5^2$" },
        { id: "A1", code: "A", marks: 1, for: "$17.6$ (m), accept $\\sqrt{309.25}$ or $17.58\\ldots$", dependsOn: ["MA1"] },
      ],
      hints: ["Find the diagonal of the base first: 15 and 8 make a 17.", "Then $AG^2 = 17^2 + 4.5^2$.", "$289 + 20.25 = 309.25$."],
      workedSolution:
        "$AC^2 = 15^2 + 8^2 = 289$, so $AC = 17$ m. Then $AG^2 = 289 + 4.5^2 = 309.25$ and $AG = \\sqrt{309.25} = 17.58\\ldots = 17.6$ m (3 s.f.).",
      commonErrors: [
        {
          misconception: "maths.trig3d.two-dimensions-only",
          pattern: { kind: "numeric", value: 17 },
          feedback: "17 m is $AC$, the diagonal across the ground. $G$ is 4.5 m above $C$, so one more Pythagoras step is needed.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "Calculate the angle that $AG$ makes with the base.",
      marks: 3,
      answer: num(e3.angle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$\\angle GAC$ identified, or triangle $ACG$ drawn separately" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle GAC = \\dfrac{4.5}{17}$ (or $\\sin \\angle GAC = \\dfrac{4.5}{17.58\\ldots}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(e3.angle)}°$`, dependsOn: ["MA2"] },
      ],
      hints: [
        "The shadow of $AG$ on the ground is $AC$, so the angle is at $A$ in triangle $ACG$.",
        "Both exact sides are known: 4.5 and 17.",
        "$\\tan^{-1}\\left(\\dfrac{4.5}{17}\\right) = 14.8\\ldots$",
      ],
      workedSolution: `The angle is $\\angle GAC$. $\\tan \\angle GAC = \\dfrac{4.5}{17}$, so $\\angle GAC = ${long(e3.angle, 4)}\\ldots = ${dp(e3.angle)}°$ (1 d.p.).`,
      commonErrors: [
        {
          misconception: "maths.trig3d.wrong-angle-identified",
          pattern: { kind: "numeric", value: atanDeg(4.5, 15), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The 15 m edge was used instead of $AC$. That is the slope you would climb walking straight up the side $AH$, not the slope along $AG$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M82:Q11",
        },
        {
          misconception: "maths.trig3d.complement-of-required-angle",
          pattern: { kind: "numeric", value: 90 - e3.angle, tolerance: { type: "sf", figures: 3 } },
          feedback: `This is the angle at $G$, between $AG$ and the vertical. Subtract from $90°$ to get ${dp(e3.angle)}°.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2023-summer:M82:Q12",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

// ---------------------------------------------------------------------------
// 0017 — exam-style: both angles of the same pyramid, then compare
// ---------------------------------------------------------------------------

const e4 = pyramidFacts(18, 12, "e4");

Q({
  style: "exam-style",
  difficulty: 5,
  commandWords: ["Calculate", "Compare"],
  emphasis: ["slant edge", "sloping face"],
  setting: "A square-based pyramid roof, no context",
  examinerSources: ["ccea-cer:maths:2024-november:M82:Q13", "ccea-cer:maths:2024-summer:M82:Q11"],
  figures: [
    fig(
      pyramidEdgePair(e4, { angle: "x", edges: { AB: "18 m" }, triBase: `AM = ${sf(e4.half)} m`, triHeight: "VM = 12 m" }),
      "A square-based pyramid VABCD of base edge 18 m with apex V vertically above the centre M, VM = 12 m. The base diagonal AC and the height VM are dashed, the slant edge VA is drawn thick and the angle x is marked at A. Beside it, triangle AMV on its own with AM = 12.73 m, VM = 12 m and the angle x at A.",
    ),
    fig(
      pyramidFacePair(e4, { angle: "y", edges: { AB: "18 m" }, triBase: "MN = 9 m", triHeight: "VM = 12 m" }),
      "The same pyramid with N the midpoint of AB. VM and MN are dashed, the slant height VN is drawn thick and the angle y is marked at N. Beside it, triangle NMV on its own with MN = 9 m, VM = 12 m and the angle y at N.",
    ),
  ],
  skeleton: "(a)calculate3|(b)calculate3",
  solutionProgram:
    "AC = 18 sqrt 2 = 25.4558441227; AM = 12.7279220614; tan x = 12/12.7279220614; x = 43.3138570... -> 43.3; MN = 9; tan y = 12/9; y = 53.1301023542 -> 53.1; y > x",
  parts: [
    {
      id: "a",
      stem: "A roof is a pyramid on a square base of side 18 m, with its apex $V$ 12 m vertically above the centre $M$ of the base.\nCalculate the angle between the slant edge $VA$ and the base.",
      marks: 3,
      answer: num(e4.edgeAngle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$AM = \\tfrac{1}{2}\\sqrt{18^2 + 18^2} = 12.727\\ldots$ (or $AM^2 = 162$)" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle VAM = \\dfrac{12}{12.727\\ldots}$ (or $\\dfrac{12}{\\sqrt{162}}$)" },
        { id: "A1", code: "A", marks: 1, for: `$${dp(e4.edgeAngle)}°$`, dependsOn: ["MA2"] },
      ],
      hints: [
        "The slant edge ends at a corner, so the run along the base is half a diagonal.",
        "$AM^2 = \\tfrac{1}{4} \\times 648 = 162$.",
        "$\\tan^{-1}\\left(\\dfrac{12}{\\sqrt{162}}\\right) = 43.3\\ldots$",
      ],
      workedSolution: `$AC = \\sqrt{18^2 + 18^2} = \\sqrt{648}$, so $AM^2 = 162$ and $AM = ${sf(e4.half)}$ m. Then $\\tan \\angle VAM = \\dfrac{12}{\\sqrt{162}}$, so $\\angle VAM = ${dp(e4.edgeAngle)}°$ (1 d.p.).`,
      commonErrors: [
        {
          misconception: "maths.trig3d.half-base-vs-half-diagonal",
          pattern: { kind: "numeric", value: e4.faceAngle, tolerance: { type: "sf", figures: 3 } },
          feedback: `Half a base edge (9 m) was used, which answers part (b) instead: ${dp(e4.faceAngle)}°. A slant edge runs to a corner, so use half the diagonal.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M82:Q13",
        },
        {
          misconception: "maths.trig.isosceles-not-halved",
          pattern: { kind: "numeric", value: atanDeg(12, e4.diag), tolerance: { type: "sf", figures: 3 } },
          feedback: "The whole diagonal was used. $M$ is the centre, so the run from $A$ is half of $AC$.",
          marksTypicallyEarned: 1,
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "$N$ is the midpoint of $AB$. Calculate the angle between the sloping face $VAB$ and the base, and compare it with your answer to part (a).",
      marks: 3,
      answer: num(e4.faceAngle, { unit: "degrees", places: 1 }),
      scheme: [
        { id: "MA1", code: "MA", marks: 1, for: "$MN = 9$ used, or triangle $NMV$ drawn separately" },
        { id: "MA2", code: "MA", marks: 1, for: "$\\tan \\angle VNM = \\dfrac{12}{9}$" },
        {
          id: "A1",
          code: "A",
          marks: 1,
          for: `$${dp(e4.faceAngle)}°$, with a comparison: the face is steeper than the slant edge`,
          dependsOn: ["MA2"],
          examinerNote: "Follow through the comparison from part (a).",
          ft: true,
        },
      ],
      hints: [
        "The face meets the base along $AB$, and the steepest line in it runs from $V$ to $N$.",
        "$MN$ is half a base edge, 9 m.",
        "Compare $\\tan^{-1}\\left(\\tfrac{12}{9}\\right)$ with your answer to (a): the smaller run gives the larger angle.",
      ],
      workedSolution: `$MN = 9$ m, so $\\tan \\angle VNM = \\dfrac{12}{9}$ and $\\angle VNM = ${dp(e4.faceAngle)}°$. That is larger than the $${dp(e4.edgeAngle)}°$ in part (a): the same height stands over a shorter run, so the face is steeper than the slant edge.`,
      commonErrors: [
        {
          misconception: "maths.trig3d.half-base-vs-half-diagonal",
          pattern: { kind: "numeric", value: e4.edgeAngle, tolerance: { type: "sf", figures: 3 } },
          feedback: `Part (a) has been repeated. For a face the run is half an edge, 9 m, not half the diagonal, so the answer is ${dp(e4.faceAngle)}°.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M82:Q13",
        },
        {
          misconception: "maths.trig3d.no-2d-triangle",
          pattern: { kind: "numeric", value: atanDeg(12, 18), tolerance: { type: "sf", figures: 3 } },
          feedback:
            "The whole base edge, 18 m, was used as the run. In triangle $NMV$ the run is from the centre $M$ out to $N$, which is half of that.",
          marksTypicallyEarned: 0,
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

assert(questions.length === 17, `expected 17 questions, built ${questions.length}`);
assert(questions.filter((q) => q.style === "exam-style").length === 4, "expected 4 exam-style questions");
assert(
  questions.every((q) => q.figures.length >= 1),
  "every question must carry a figure",
);

export { questions };
