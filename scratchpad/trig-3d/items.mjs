/**
 * Worked examples, diagnostics, find-the-mistake items and retrieval prompts for
 * maths.m8.pythagoras-and-trigonometry-in-3d. Every number comes from core.mjs.
 */
import {
  cuboidFacts,
  pyramidFacts,
  wedgeFacts,
  cubeFromDiagonal,
  surd,
  sf,
  dp,
  long,
  atanDeg,
  cuboidPair,
  pyramidEdgePair,
  pyramidFacePair,
  wedgePair,
  cuboidOnly,
  fig,
  assert,
} from "./core.mjs";

const TOPIC = "maths.m8.pythagoras-and-trigonometry-in-3d";
const SPEC = ["M8-GM-03"];
const P2 = { unit: "M8", paper: 2, calculator: true, resources: ["Formula sheet printed on page 2 of the paper"] };
const P1 = { unit: "M8", paper: 1, calculator: false, resources: ["Formula sheet printed on page 2 of the paper"] };

// ---------------------------------------------------------------------------
// Worked example 1 — the cuboid, three parts, the shape of Summer 2025 Q12
// ---------------------------------------------------------------------------

const w1 = cuboidFacts(8, 6, 5, "we1");
const w1t = cuboidFacts(12, 9, 8, "we1 twin");
assert(w1.ac === 10 && w1t.ac === 15 && w1t.ag === 17, "we1 diagonals are not the exact values written into the prose");

const we1Figure = fig(
  cuboidPair(w1, {
    spaceDiagLabel: "AG",
    baseDiagLabel: "AC",
    angle: "x",
    triBase: "AC = 10 cm",
    triHeight: "CG = 5 cm",
    triHyp: "AG",
  }),
  "On the left, a cuboid ABCDEFGH drawn in oblique projection with the hidden edges AD, DC and DH dashed. AB is 8 cm, BC is 6 cm and the vertical edge CG is 5 cm. The base diagonal AC is dashed and the space diagonal AG is drawn thick, with the angle x between them marked at A and a right angle marked at C. On the right, triangle ACG is drawn again on its own: AC = 10 cm along the bottom, CG = 5 cm vertical, AG as the hypotenuse and the angle x at A.",
);

const we1TwinFigure = fig(
  cuboidPair(w1t, { spaceDiagLabel: "AG", baseDiagLabel: "AC", angle: "x", triHeight: "CG = 8 cm" }),
  "A cuboid ABCDEFGH with AB = 12 cm, BC = 9 cm and CG = 8 cm, hidden edges dashed, the base diagonal AC dashed and the space diagonal AG drawn thick with the angle x marked at A, and beside it triangle ACG drawn on its own.",
);

export const workedExamples = [
  {
    id: "we.maths.m8.pythagoras-and-trigonometry-in-3d.01",
    topic: TOPIC,
    specRefs: SPEC,
    paper: P2,
    stem: "$ABCDEFGH$ is a cuboid. $AB = 8$ cm, $BC = 6$ cm and $CG = 5$ cm.\n\n(a) Show that $AC = 10$ cm.\n(b) Calculate the length of the space diagonal $AG$.\n(c) Calculate the angle between $AG$ and the base $ABCD$.",
    figure: we1Figure,
    steps: [
      {
        n: 1,
        working: "Triangle $ABC$ lies flat in the base, right-angled at $B$.\n$AC^2 = 8^2 + 6^2 = 64 + 36 = 100$",
        decision:
          "Nothing in three dimensions can be done until you have found a triangle that is right-angled and whose sides you know. The base is a rectangle, so $ABC$ has a right angle at $B$, and two of its sides are printed on the diagram. That is the triangle to start in.",
        whyMenu: {
          options: [
            "Because $ABC$ is right-angled at $B$ and two of its sides are given",
            "Because $AC$ is the longest line in the cuboid",
            "Because the base is the biggest face",
          ],
          correct: 0,
          explain:
            "The longest line in the cuboid is the space diagonal $AG$, not $AC$, and the size of a face never decides anything. What makes $ABC$ usable is the right angle at $B$ with two known sides.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$AC = \\sqrt{100} = 10$ cm, as required.",
        decision:
          "A show-that part needs the printed answer to appear at the end of your working, so write the square root line out. Stopping at $AC^2 = 100$ leaves the second mark unearned, because 100 is not a length.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "Triangle $ACG$ stands vertically, right-angled at $C$ because $CG$ is vertical and $AC$ is in the base.\n$AG^2 = AC^2 + CG^2 = 10^2 + 5^2 = 125$",
        decision:
          "Now use the answer from part (a) as one side of a new triangle. $CG$ is vertical, so it is at right angles to every line in the base, including $AC$. Draw that triangle beside the solid before you write anything: the whole of 3-D Pythagoras is two 2-D steps joined at $AC$.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$AG = \\sqrt{125} = 11.1803\\ldots = 11.2$ cm (3 s.f.)",
        decision:
          "Keep $\\sqrt{125}$ on the calculator for part (c); write the rounded 11.2 on the answer line only. In one line you could have written $AG^2 = 8^2 + 6^2 + 5^2$, which is the same two steps rolled together.",
        earns: ["A1"],
      },
      {
        n: 5,
        working: "The angle between $AG$ and the base is $\\angle GAC$.",
        decision:
          "The shadow of $AG$ on the base is $AC$, so the angle you want sits between the diagonal and its shadow, at $A$. Write the three letters down; examiners give a mark for naming or marking the angle before any trigonometry happens, and it is the mark most candidates miss.",
        whyMenu: {
          options: ["$\\angle GAC$", "$\\angle GAB$", "$\\angle AGC$"],
          correct: 0,
          explain:
            "$\\angle GAB$ is the angle between $AG$ and one edge of the base, not between $AG$ and the base itself. $\\angle AGC$ is at the top of the triangle, so it is the angle $AG$ makes with the vertical edge; it comes to $90°$ minus the angle you were asked for.",
        },
        earns: ["MA1"],
      },
      {
        n: 6,
        working: "In triangle $ACG$: opposite $= CG = 5$, adjacent $= AC = 10$.\n$\\tan \\angle GAC = \\dfrac{5}{10}$",
        decision:
          "In the extracted triangle the labels are obvious: $CG$ is opposite the angle, $AC$ is next to it, so the ratio is tangent. Tangent is also the safer choice here because both of its sides are exact whole numbers, while the hypotenuse is a root.",
        earns: ["MA1"],
      },
      {
        n: 7,
        working: "$\\angle GAC = \\tan^{-1}(0.5) = 26.565\\ldots° = 26.6°$ (1 d.p.)",
        decision:
          "Round once, at the end. A CCEA answer line for an angle prints the degree symbol, so a value to one decimal place or to three significant figures is what the scheme expects.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$AC = 10$ cm, $AG = \\sqrt{125} = 11.2$ cm (3 s.f.) and the angle between $AG$ and the base is $26.6°$",
    twin: {
      stem: "$ABCDEFGH$ is a cuboid with $AB = 12$ cm, $BC = 9$ cm and $CG = 8$ cm. Calculate the angle that $AG$ makes with the base $ABCD$.",
      figure: we1TwinFigure,
      answer: {
        kind: "numeric",
        value: w1t.angle,
        tolerance: { type: "sf", figures: 3 },
        unit: "degrees",
        unitRequired: false,
        acceptForms: ["decimal"],
      },
    },
    faded: [
      { showSteps: 4, studentSupplies: [5, 6, 7] },
      { showSteps: 2, studentSupplies: [3, 4, 5, 6, 7] },
    ],
    verification: "ver.we.maths.m8.pythagoras-and-trigonometry-in-3d.01",
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Worked example 2 — the square-based pyramid: two different angles
// ---------------------------------------------------------------------------

const p2 = pyramidFacts(10, 12, "we2");
const p2t = pyramidFacts(14, 24, "we2 twin");
assert(p2.slantHeight === 13 && p2t.slantHeight === 25, "we2 slant heights are not the exact values written into the prose");

const we2Figure = fig(
  pyramidEdgePair(p2, { angle: "y", triBase: "AM = 7.07 cm", triHeight: "VM = 12 cm", triHyp: "VA" }),
  "On the left, a square-based pyramid VABCD drawn in oblique projection, base edge AB = 10 cm, with the hidden edges AD, DC and VD dashed. The base diagonal AC is dashed, the vertical height VM from the apex to the centre M of the base is dashed and labelled 12 cm, and the slant edge VA is drawn thick with the angle y marked at A. On the right, triangle AMV is drawn on its own: AM = 7.07 cm along the bottom, VM = 12 cm vertical, VA as the hypotenuse and the angle y at A.",
);

const we2FaceFigure = fig(
  pyramidFacePair(p2, { angle: "z", triBase: "MN = 5 cm", triHeight: "VM = 12 cm", triHyp: "VN" }),
  "The same pyramid VABCD with N marked as the midpoint of the base edge AB. The vertical height VM is dashed, MN is dashed and runs from the centre of the base to N, and the slant height VN is drawn thick with the angle z marked at N. Beside it, triangle NMV is drawn on its own: MN = 5 cm along the bottom, VM = 12 cm vertical, VN as the hypotenuse and the angle z at N.",
);

const we2TwinFigure = fig(
  pyramidFacePair(p2t, { angle: "z", triBase: "MN = 7 cm", triHeight: "VM = 24 cm", triHyp: "VN" }),
  "A square-based pyramid with base edge 14 cm and vertical height 24 cm, N the midpoint of a base edge, the height VM and the segment MN dashed, the slant height VN drawn thick and the angle z marked at N, with triangle NMV drawn again on its own.",
);

workedExamples.push({
  id: "we.maths.m8.pythagoras-and-trigonometry-in-3d.02",
  topic: TOPIC,
  specRefs: SPEC,
  paper: P2,
  stem: "$VABCD$ is a pyramid with a square base of side 10 cm. The apex $V$ is vertically above the centre $M$ of the base, and $VM = 12$ cm.\n\n(a) Calculate the length of the slant edge $VA$.\n(b) Calculate the angle between $VA$ and the base.\n(c) $N$ is the midpoint of $AB$. Calculate the angle between the sloping face $VAB$ and the base.",
  figure: we2Figure,
  steps: [
    {
      n: 1,
      working: "$AC = \\sqrt{10^2 + 10^2} = \\sqrt{200} = 14.142\\ldots$ cm, so $AM = \\tfrac{1}{2}AC = 7.0710\\ldots$ cm",
      decision:
        "$V$ is above the centre of the base, so the foot of the height is $M$, the point where the diagonals cross. To reach $M$ from $A$ you travel half of a diagonal, and the diagonal comes from Pythagoras in the square base.",
      earns: ["MA1"],
    },
    {
      n: 2,
      working: "Triangle $AMV$ is right-angled at $M$.\n$VA^2 = AM^2 + VM^2 = 50 + 144 = 194$, so $VA = \\sqrt{194} = 13.928\\ldots = 13.9$ cm (3 s.f.)",
      decision:
        "$AM^2$ is exactly 50, because $AM = \\tfrac{1}{2}\\sqrt{200}$ and squaring undoes the root: there is no need to square a rounded 7.07. Keeping the exact 50 is what protects the accuracy mark in part (b).",
      whyMenu: {
        options: ["$AM^2 = 50$ exactly", "$AM^2 = 49.98$", "$AM^2 = 7.07$"],
        correct: 0,
        explain:
          "$AM = \\tfrac{1}{2}\\sqrt{200}$, so $AM^2 = \\tfrac{1}{4} \\times 200 = 50$. Squaring the rounded 7.07 gives 49.98, and that small drift is exactly how accuracy marks disappear.",
      },
      earns: ["A1"],
    },
    {
      n: 3,
      working: "The angle between $VA$ and the base is $\\angle VAM$ (that is, $\\angle VAC$).\n$\\tan \\angle VAM = \\dfrac{12}{7.0710\\ldots}$, so $\\angle VAM = 59.49\\ldots° = 59.5°$ (1 d.p.)",
      decision:
        "The shadow of the slant edge $VA$ on the base is $AM$, along the diagonal, so the angle sits at $A$ in triangle $AMV$. Type the $\\sqrt{50}$ straight into the calculator rather than 7.07.",
      earns: ["MA1", "MA1", "A1"],
    },
    {
      n: 4,
      working: "For the face $VAB$: $N$ is the midpoint of $AB$, so $MN = 5$ cm and $VN \\perp AB$.\n$\\tan \\angle VNM = \\dfrac{12}{5}$, so $\\angle VNM = 67.38\\ldots° = 67.4°$ (1 d.p.)",
      decision:
        "A face is not a line, so the angle is measured along the line of greatest slope: drop from $V$ to the midpoint $N$ of the bottom edge. The shadow of $VN$ on the base is $MN$, which is half the base edge, 5 cm, and not half the diagonal. Two different angles come out of the same pyramid, which is why the question can ask for either.",
      whyMenu: {
        options: [
          "$MN = 5$ cm, half of a base edge",
          "$MN = 7.07$ cm, half of a diagonal",
          "$MN = 10$ cm, a whole base edge",
        ],
        correct: 0,
        explain:
          "Half the diagonal takes you from the centre out to a corner, which is the slant-edge question. Half an edge takes you from the centre to the middle of a side, which is the face question. Naming the point $N$ on your own sketch keeps the two apart.",
      },
      earns: ["MA1", "MA1", "A1"],
    },
  ],
  finalAnswer:
    "$VA = \\sqrt{194} = 13.9$ cm (3 s.f.); the slant edge meets the base at $59.5°$; the sloping face meets the base at $67.4°$",
  twin: {
    stem: "A pyramid has a square base of side 14 cm and its apex is 24 cm vertically above the centre of the base. Calculate the angle between a sloping face and the base.",
    figure: we2TwinFigure,
    answer: {
      kind: "numeric",
      value: p2t.faceAngle,
      tolerance: { type: "sf", figures: 3 },
      unit: "degrees",
      unitRequired: false,
      acceptForms: ["decimal"],
    },
  },
  faded: [
    { showSteps: 2, studentSupplies: [3, 4] },
    { showSteps: 1, studentSupplies: [2, 3, 4] },
  ],
  verification: "ver.we.maths.m8.pythagoras-and-trigonometry-in-3d.02",
  version: 1,
});

// ---------------------------------------------------------------------------
// Worked example 3 — the wedge, and what rounding early costs
// ---------------------------------------------------------------------------

const w3 = wedgeFacts(9, 4, 2.5, "we3");
const w3t = wedgeFacts(12, 5, 3.5, "we3 twin");
const w3Rounded = atanDeg(2.5, 9.8);
assert(sf(w3.angle) !== sf(w3Rounded), "we3: the rounding trap no longer changes the answer");

const we3Figure = fig(
  wedgePair(w3, {
    angle: "θ",
    triBase: "AC = √97 m",
    triHeight: "CG = 2.5 m",
    triHyp: "AG",
    captionA: "the wedge",
    captionB: "triangle ACG, drawn on its own",
  }),
  "On the left, a wedge: the horizontal rectangular base ABCD has AB = 9 m and BC = 4 m, and the vertical rectangular face DCGH at the back is 2.5 m high, so ABGH is the sloping face. Hidden edges AD, DC and DH are dashed. The base diagonal AC is dashed and the sloping line AG is drawn thick, with the angle theta marked at A and a right angle at C. On the right, triangle ACG on its own: AC = root 97 m along the bottom, CG = 2.5 m vertical, AG the hypotenuse, angle theta at A.",
);

const we3TwinFigure = fig(
  wedgePair(w3t, { angle: "θ", triBase: "AC = 13 m", triHeight: "CG = 3.5 m" }),
  "A wedge with a horizontal base ABCD 12 m by 5 m and a vertical back face 3.5 m high, hidden edges dashed, the base diagonal AC dashed and the sloping line AG drawn thick with the angle theta at A, and triangle ACG drawn on its own beside it.",
);

workedExamples.push({
  id: "we.maths.m8.pythagoras-and-trigonometry-in-3d.03",
  topic: TOPIC,
  specRefs: SPEC,
  paper: P2,
  stem: "A skateboard ramp is a wedge. The horizontal base $ABCD$ measures $AB = 9$ m by $BC = 4$ m, and the back face $DCGH$ is vertical with $CG = 2.5$ m. $ABGH$ is the sloping surface.\n\n(a) Calculate the length of $AG$, the longest line on the sloping surface.\n(b) Calculate the angle that $AG$ makes with the base.",
  figure: we3Figure,
  steps: [
    {
      n: 1,
      working: "In the base, $ABC$ is right-angled at $B$.\n$AC^2 = 9^2 + 4^2 = 97$, so $AC = \\sqrt{97} = 9.8488\\ldots$ m",
      decision:
        "The solid is not a cuboid, but the method does not change: find the shadow first. $AC$ is the shadow of $AG$ on the ground, and it comes from the rectangle you are standing on.",
      earns: ["MA1"],
    },
    {
      n: 2,
      working: "$AG^2 = AC^2 + CG^2 = 97 + 2.5^2 = 103.25$, so $AG = \\sqrt{103.25} = 10.161\\ldots = 10.2$ m (3 s.f.)",
      decision:
        "Use $AC^2 = 97$, not $9.8488^2$. Squaring a square root hands back the whole number, so the second Pythagoras step stays exact and quick.",
      earns: ["MA1", "A1"],
    },
    {
      n: 3,
      working: "The angle with the base is $\\angle GAC$.\n$\\tan \\angle GAC = \\dfrac{2.5}{\\sqrt{97}}$",
      decision:
        "Type the root itself into the calculator. It is one keystroke more than typing 9.8, and it is the difference between the answer the scheme prints and an answer that is out by a tenth of a degree.",
      earns: ["MA1", "MA1"],
    },
    {
      n: 4,
      working: `$\\angle GAC = ${long(w3.angle, 4)}\\ldots° = ${dp(w3.angle)}°$ (1 d.p.)\nRounding $AC$ to 9.8 first would have given $${dp(w3Rounded)}°$ instead.`,
      decision:
        "Both versions look reasonable on the page, and only one of them earns the accuracy mark. This is the single most common way a correct method still loses its last mark in this topic.",
      whyMenu: {
        options: [
          "Keep $\\sqrt{97}$ and round once at the end",
          "Round $AC$ to 9.8, then find the angle",
          "Round $AC$ to 10, then find the angle",
        ],
        correct: 0,
        explain: `Rounding to 9.8 gives ${dp(w3Rounded)}° and rounding to 10 gives ${dp(atanDeg(2.5, 10))}°, so both miss ${dp(w3.angle)}°. Keep the root, or use your calculator's answer key, and round only on the answer line.`,
      },
      earns: ["A1"],
    },
  ],
  finalAnswer: `$AG = \\sqrt{103.25} = 10.2$ m (3 s.f.) and $AG$ makes an angle of $${dp(w3.angle)}°$ with the base`,
  twin: {
    stem: "A loading ramp is a wedge with a horizontal base $ABCD$ measuring $AB = 12$ m by $BC = 5$ m and a vertical back face of height $CG = 3.5$ m. Calculate the angle that $AG$ makes with the base.",
    figure: we3TwinFigure,
    answer: {
      kind: "numeric",
      value: w3t.angle,
      tolerance: { type: "sf", figures: 3 },
      unit: "degrees",
      unitRequired: false,
      acceptForms: ["decimal"],
    },
  },
  faded: [
    { showSteps: 2, studentSupplies: [3, 4] },
    { showSteps: 1, studentSupplies: [2, 3, 4] },
  ],
  verification: "ver.we.maths.m8.pythagoras-and-trigonometry-in-3d.03",
  version: 1,
});

// ---------------------------------------------------------------------------
// Worked example 4 — backwards, on the non-calculator paper
// ---------------------------------------------------------------------------

const c4 = cubeFromDiagonal(12, "we4");
const c4t = cubeFromDiagonal(15, "we4 twin");
const s4 = surd(48);
const s4t = surd(75);
assert(s4.latex === "4\\sqrt{3}" && s4t.latex === "5\\sqrt{3}", "we4 surds are not the values written into the prose");

const we4Figure = fig(
  cuboidOnly({ w: 6, d: 6, h: 6, ac: 8.485, ag: 12 }, {
    edges: { AB: "x cm", BC: "x cm", CG: "x cm" },
    spaceDiag: true,
    spaceDiagLabel: "12 cm",
    target: 150,
  }),
  "A cube ABCDEFGH drawn in oblique projection with the hidden edges AD, DC and DH dashed. Each of the edges AB, BC and CG is labelled x cm, and the space diagonal AG is drawn thick and labelled 12 cm.",
);

const we4TwinFigure = fig(
  cuboidOnly({ w: 6, d: 6, h: 6, ac: 8.485, ag: 15 }, {
    edges: { AB: "x cm", BC: "x cm", CG: "x cm" },
    spaceDiag: true,
    spaceDiagLabel: "15 cm",
    target: 150,
  }),
  "A cube with every edge labelled x cm and the space diagonal drawn thick and labelled 15 cm, hidden edges dashed.",
);

workedExamples.push({
  id: "we.maths.m8.pythagoras-and-trigonometry-in-3d.04",
  topic: TOPIC,
  specRefs: SPEC,
  paper: P1,
  stem: "A cube has a space diagonal of 12 cm. Work out the length of one edge, leaving your answer in the form $a\\sqrt{b}$.",
  figure: we4Figure,
  steps: [
    {
      n: 1,
      working: "Let each edge be $x$ cm. The three dimensions are $x$, $x$ and $x$.\n$x^2 + x^2 + x^2 = 12^2$",
      decision:
        "Read the space-diagonal rule backwards. The sum of the squares of the three dimensions is the square of the diagonal, whichever of the four quantities is the unknown one.",
      earns: ["MA1"],
    },
    {
      n: 2,
      working: "$3x^2 = 144$, so $x^2 = 48$",
      decision:
        "Collect the three identical squares first. Dividing by 3 before taking any root keeps the arithmetic in whole numbers, which matters on the paper where the calculator is away.",
      whyMenu: {
        options: ["$3x^2 = 144$", "$3x = 144$", "$x^2 = 144 \\times 3$"],
        correct: 0,
        explain:
          "$x^2 + x^2 + x^2$ is $3x^2$, not $3x$: it is three copies of the square. And 144 is being shared between the three squares, so it is divided by 3, not multiplied.",
      },
      earns: ["MA1"],
    },
    {
      n: 3,
      working: "$x = \\sqrt{48} = \\sqrt{16 \\times 3} = 4\\sqrt{3}$ cm",
      decision:
        "The form $a\\sqrt{b}$ is being asked for, so pull out the largest square factor: 16 divides 48 and $\\sqrt{16} = 4$. Leaving $\\sqrt{48}$ would not be in the form demanded, and a decimal would earn nothing on this paper.",
      earns: ["A1"],
    },
  ],
  finalAnswer: "$x = 4\\sqrt{3}$ cm",
  twin: {
    stem: "A cube has a space diagonal of 15 cm. Work out the length of one edge, leaving your answer in the form $a\\sqrt{b}$.",
    figure: we4TwinFigure,
    answer: {
      kind: "algebraic",
      latex: "5\\sqrt{3}",
      equivalence: "equivalent",
      variables: [],
    },
  },
  faded: [
    { showSteps: 1, studentSupplies: [2, 3] },
    { showSteps: 0, studentSupplies: [1, 2, 3] },
  ],
  verification: "ver.we.maths.m8.pythagoras-and-trigonometry-in-3d.04",
  version: 1,
});

// ---------------------------------------------------------------------------
// Diagnostics — eight items, a named misconception on every distractor
// ---------------------------------------------------------------------------

const dxCuboid = cuboidFacts(3, 4, 12, "dx01");
assert(dxCuboid.ag === 13 && dxCuboid.ac === 5, "dx01 numbers changed");

const dxFigure = fig(
  cuboidOnly(dxCuboid, { edges: { AB: "3 cm", BC: "4 cm", CG: "12 cm" }, spaceDiag: true, spaceDiagLabel: "AG", target: 140 }),
  "A cuboid ABCDEFGH with AB = 3 cm, BC = 4 cm and CG = 12 cm, hidden edges dashed, and the space diagonal AG drawn thick.",
);

const dxAngleFigure = fig(
  cuboidOnly(cuboidFacts(6, 8, 7, "dx02"), {
    edges: {},
    baseDiag: true,
    spaceDiag: true,
    spaceDiagLabel: "AG",
    target: 150,
  }),
  "A cuboid ABCDEFGH with the base diagonal AC dashed and the space diagonal AG drawn thick from the front-bottom-left corner A to the opposite top corner G. Hidden edges are dashed.",
);

const dxPyramidFigure = fig(
  pyramidFacePair(pyramidFacts(12, 9, "dx05"), {
    angle: "z",
    edges: { AB: "12 cm" },
    triBase: "MN = 6 cm",
    triHeight: "VM = 9 cm",
    triHyp: "VN",
  }),
  "A square-based pyramid of base edge 12 cm and vertical height 9 cm, with N the midpoint of the base edge AB, the height VM and the segment MN dashed and the slant height VN drawn thick with the angle z at N, and triangle NMV drawn on its own beside it.",
);

export const diagnostics = [
  {
    id: "dx.maths.m8.pythagoras-and-trigonometry-in-3d",
    topic: TOPIC,
    specRefs: SPEC,
    when: "both",
    items: [
      {
        id: "01",
        stem: "The cuboid measures 3 cm by 4 cm by 12 cm. Which calculation gives the length of the space diagonal $AG$?",
        skill: "Extend Pythagoras to three dimensions",
        figure: dxFigure,
        options: [
          {
            id: "a",
            text: "$\\sqrt{3^2 + 4^2 + 12^2} = 13$ cm",
            correct: true,
            feedback: "All three dimensions, squared and added, then rooted. It is two Pythagoras steps written as one line.",
          },
          {
            id: "b",
            text: "$3 + 4 + 12 = 19$ cm",
            correct: false,
            misconception: "maths.trig3d.dimensions-added",
            feedback:
              "Lengths are added only along a path of edges. A straight line through the middle is shorter than the journey round the edges, so 19 cm is too long; the squares are what get added.",
          },
          {
            id: "c",
            text: "$\\sqrt{3^2 + 4^2} = 5$ cm",
            correct: false,
            misconception: "maths.trig3d.two-dimensions-only",
            feedback:
              "That is the base diagonal $AC$, using only two of the three dimensions. It is the correct first step, and the height still has to go in.",
          },
          {
            id: "d",
            text: "$3^2 + 4^2 + 12^2 = 169$ cm",
            correct: false,
            misconception: "maths.trig3d.squares-not-rooted",
            feedback: "169 is $AG^2$. A squared length is not a length: take the square root to finish, giving 13 cm.",
          },
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "02",
        stem: "Which of these is the angle that $AG$ makes with the base $ABCD$?",
        skill: "Identify the angle between a line and a plane",
        figure: dxAngleFigure,
        options: [
          {
            id: "a",
            text: "$\\angle GAC$",
            correct: true,
            feedback: "The shadow of $AG$ on the base is $AC$, and the angle between a line and a plane is the angle between the line and its shadow.",
          },
          {
            id: "b",
            text: "$\\angle GAB$",
            correct: false,
            misconception: "maths.trig3d.wrong-angle-identified",
            feedback:
              "$AB$ is one edge of the base, not the shadow of $AG$. This is the answer examiners saw most often in Summer 2025, and it gives an angle that is too large.",
          },
          {
            id: "c",
            text: "$\\angle AGC$",
            correct: false,
            misconception: "maths.trig3d.complement-of-required-angle",
            feedback:
              "That angle is at the top of the triangle, between $AG$ and the vertical edge $CG$. It comes to $90°$ minus the angle asked for, so subtracting from 90 would rescue it.",
          },
          {
            id: "d",
            text: "$\\angle ACG$",
            correct: false,
            misconception: "maths.trig3d.no-2d-triangle",
            feedback:
              "Draw triangle $ACG$ on its own and you can see $\\angle ACG$ is the right angle, always $90°$. Sketching the triangle separately is what makes this obvious.",
          },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "03",
        stem: "In the vertical triangle $ACG$, $AC = 10$ and $CG = 6$, and the right angle is at $C$. Which line finds the angle at $A$?",
        skill: "Choose the ratio inside the extracted triangle",
        options: [
          {
            id: "a",
            text: "$\\tan A = \\dfrac{6}{10}$",
            correct: true,
            feedback: "Opposite over adjacent, and both of those sides are known exactly, so nothing has to be worked out first.",
          },
          {
            id: "b",
            text: "$\\tan A = \\dfrac{10}{6}$",
            correct: false,
            misconception: "maths.trig.cannot-rearrange-ratio",
            feedback:
              "The fraction is upside down: 6 is opposite the angle at $A$ and 10 is beside it. This gives $59.0°$ instead of $31.0°$, and the two add to $90°$, which is a useful check.",
          },
          {
            id: "c",
            text: "$\\sin A = \\dfrac{6}{10}$",
            correct: false,
            misconception: "maths.trig.wrong-ratio-or-angle",
            feedback:
              "Sine needs the hypotenuse underneath, and here 10 is the adjacent side. The hypotenuse of this triangle is $AG$, which has not been found yet.",
          },
          {
            id: "d",
            text: "$\\cos A = \\dfrac{6}{10}$",
            correct: false,
            misconception: "maths.trig.wrong-ratio-or-angle",
            feedback:
              "Cosine is adjacent over hypotenuse. Here 6 is the opposite side, so this ratio pairs the wrong two sides.",
          },
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "04",
        stem: "A pyramid has a square base of side 12 cm and a vertical height of 9 cm. For the angle between the **slant edge** and the base, which length do you need along the base?",
        skill: "Half the diagonal for a slant edge, half the edge for a face",
        options: [
          {
            id: "a",
            text: "Half the base diagonal, $6\\sqrt{2} = 8.49$ cm",
            correct: true,
            feedback: "The slant edge ends at a corner, and the shadow from the centre to a corner is half a diagonal.",
          },
          {
            id: "b",
            text: "Half the base edge, 6 cm",
            correct: false,
            misconception: "maths.trig3d.half-base-vs-half-diagonal",
            feedback:
              "Half the edge takes you from the centre to the middle of a side, which is the sloping-face question. This mix-up gives $56.3°$ instead of $46.7°$.",
          },
          {
            id: "c",
            text: "The whole base diagonal, $12\\sqrt{2} = 17.0$ cm",
            correct: false,
            misconception: "maths.trig.isosceles-not-halved",
            feedback:
              "The apex stands above the centre, so the horizontal run from a corner is only as far as the centre: half of the diagonal.",
          },
          {
            id: "d",
            text: "No base length is needed, the height is enough",
            correct: false,
            misconception: "maths.trig3d.no-2d-triangle",
            feedback:
              "One length cannot fix an angle. Draw the right-angled triangle on its own and it has two sides you must know before any ratio can be written.",
          },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "05",
        stem: "For this pyramid, the angle $z$ between the sloping face $VAB$ and the base is found from which right-angled triangle?",
        skill: "Use the perpendicular height and half the base for a face angle",
        figure: dxPyramidFigure,
        options: [
          {
            id: "a",
            text: "Triangle $NMV$, with $MN = 6$ and $VM = 9$",
            correct: true,
            feedback: "$VN$ is the line of greatest slope on that face, its shadow is $MN$, and $MN$ is half the base edge.",
          },
          {
            id: "b",
            text: "Triangle $AMV$, with $AM = 8.49$ and $VM = 9$",
            correct: false,
            misconception: "maths.trig3d.half-base-vs-half-diagonal",
            feedback:
              "That triangle contains the slant edge $VA$, so it answers the slant-edge question. For a face, go to the middle of the bottom edge, not to a corner.",
          },
          {
            id: "c",
            text: "Triangle $VAB$, with $AB = 12$",
            correct: false,
            misconception: "maths.trig3d.no-2d-triangle",
            feedback:
              "Triangle $VAB$ is the sloping face itself, and it has no right angle in it. The angle you want is between that face and the floor, so the triangle must have one line in the face and one in the base.",
          },
          {
            id: "d",
            text: "Triangle $VMB$, with $MB = 8.49$ and $VM = 9$",
            correct: false,
            misconception: "maths.trig3d.wrong-angle-identified",
            feedback:
              "$MB$ also runs to a corner, so this is the slant-edge triangle again, drawn from the other end of the edge.",
          },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "06",
        stem: "A cone has base radius 7 cm and vertical height 24 cm. Which statement is right?",
        skill: "Tell the slant height apart from the vertical height",
        options: [
          {
            id: "a",
            text: "The slant height is 25 cm, from $\\sqrt{7^2 + 24^2}$",
            correct: true,
            feedback: "Radius, vertical height and slant height make a right-angled triangle, with the slant height as the hypotenuse.",
          },
          {
            id: "b",
            text: "The slant height is 24 cm, the same as the vertical height",
            correct: false,
            misconception: "maths.trig3d.slant-height-as-vertical-height",
            feedback:
              "The vertical height goes straight down the middle; the slant height runs down the surface to the rim, so it is always the longer of the two.",
          },
          {
            id: "c",
            text: "The slant height is $\\sqrt{24^2 - 7^2} = 22.96$ cm",
            correct: false,
            misconception: "maths.trig3d.slant-height-as-vertical-height",
            feedback:
              "Subtracting treats 24 as the hypotenuse. The hypotenuse is the side opposite the right angle, and the right angle is where the height meets the base, so the slant height is the hypotenuse.",
          },
          {
            id: "d",
            text: "The slant height is $7 + 24 = 31$ cm",
            correct: false,
            misconception: "maths.trig3d.dimensions-added",
            feedback: "Lengths are added along a path, never across a triangle. Pythagoras adds the squares.",
          },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "07",
        stem: "You have found $AC = \\sqrt{97}$ and need $\\tan^{-1}\\left(\\dfrac{2.5}{AC}\\right)$. Which keeps the accuracy mark?",
        skill: "Work with exact values until the final line",
        options: [
          {
            id: "a",
            text: "Type $\\sqrt{97}$ into the calculator and round once at the end",
            correct: true,
            feedback: "One rounding, on the answer line. That is what the mark scheme's long decimal is telling you to do.",
          },
          {
            id: "b",
            text: "Round $AC$ to 9.8, then find the angle",
            correct: false,
            misconception: "maths.trig.premature-rounding",
            feedback: `This gives ${dp(w3Rounded)}° instead of ${dp(w3.angle)}°. The method mark survives, the accuracy mark does not.`,
          },
          {
            id: "c",
            text: "Round $AC$ to 10, then find the angle",
            correct: false,
            misconception: "maths.trig.premature-rounding",
            feedback: `Rounding to a whole number moves the answer to ${dp(atanDeg(2.5, 10))}°, which is out by a third of a degree.`,
          },
          {
            id: "d",
            text: "Use 97 rather than $\\sqrt{97}$, since 97 is exact",
            correct: false,
            misconception: "maths.trig3d.squares-not-rooted",
            feedback:
              "97 is exact but it is an area, not a length: it is $AC^2$. Keep the root for any ratio, and keep the 97 for any further Pythagoras step.",
          },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "08",
        stem: "The space diagonal of a cube is 9 cm. Which equation starts the problem correctly?",
        skill: "Read the space-diagonal rule backwards",
        options: [
          {
            id: "a",
            text: "$3x^2 = 81$",
            correct: true,
            feedback: "Three equal squares add to the square of the diagonal, so $x^2 = 27$ and $x = 3\\sqrt{3}$ cm.",
          },
          {
            id: "b",
            text: "$2x^2 = 81$",
            correct: false,
            misconception: "maths.trig3d.two-dimensions-only",
            feedback: "Two squares give a face diagonal. A space diagonal crosses all three dimensions, so three squares are added.",
          },
          {
            id: "c",
            text: "$3x = 9$",
            correct: false,
            misconception: "maths.trig3d.dimensions-added",
            feedback: "The edges are not simply shared out along the diagonal; it is the squares that add, not the lengths.",
          },
          {
            id: "d",
            text: "$x^2 = 27$, so $x = 27$ cm",
            correct: false,
            misconception: "maths.trig3d.squares-not-rooted",
            feedback: "The first line is right and then the root is missing: $x = \\sqrt{27} = 3\\sqrt{3} = 5.196\\ldots$ cm.",
          },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Find the mistake — seeded from the Chief Examiner reports
// ---------------------------------------------------------------------------

const f1 = cuboidFacts(7, 4, 6, "ftm1");
const f2 = cuboidFacts(10, 5, 4, "ftm2");
const f2Wrong = atanDeg(4, 10);
const f3 = pyramidFacts(16, 15, "ftm3");
assert(Math.abs(f1.ac - Math.hypot(7, 4)) < 1e-12, "ftm1: the wrong answer must equal the base diagonal");

export const findTheMistake = [
  {
    id: "ftm.maths.m8.pythagoras-and-trigonometry-in-3d.01",
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Caoimhe was asked how long the space diagonal $AG$ is in a cuboid measuring 7 cm by 4 cm by 6 cm. Her working:",
    studentWorking: ["AG² = 7² + 4²", "AG² = 49 + 16 = 65", "AG = √65", "AG = 8.06 cm (3 s.f.)"],
    mistakeLine: 1,
    misconception: "maths.trig3d.two-dimensions-only",
    whatWentWrong:
      "Only two of the three dimensions went into the first line, so what has been found is $AC$, the diagonal of the base, not $AG$. The height of 6 cm never appears anywhere in the working. The first line should be $AG^2 = 7^2 + 4^2 + 6^2$, or the same thing in two steps: find $AC^2 = 65$ first, then $AG^2 = AC^2 + 6^2$.",
    correction: ["AG² = 7² + 4² + 6²", "AG² = 49 + 16 + 36 = 101", "AG = √101", "AG = 10.0 cm (3 s.f.)"],
    marksEarnedAsWritten: ["MA1"],
    feedback:
      "The method is sound and it has been aimed one dimension short, which is why the first mark still stands: 65 is exactly the intermediate value a two-step solution needs. Before you press the root key, count the dimensions in your line and check there are three. Summer 2025 examiners reported that most candidates could find the diagonal, so this is a habit worth locking in rather than a hard idea.",
    source: "ccea-cer:maths:2025-summer:M82:Q12",
  },
  {
    id: "ftm.maths.m8.pythagoras-and-trigonometry-in-3d.02",
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Jack was asked for the angle that $AG$ makes with the base $ABCD$ in a cuboid with $AB = 10$ cm, $BC = 5$ cm and $CG = 4$ cm. His working:",
    studentWorking: [
      "AG² = 10² + 5² + 4² = 141, so AG = 11.87 cm",
      "Angle between AG and the base = angle GAB",
      "tan GAB = 4 ÷ 10",
      "Angle = 21.8°",
    ],
    mistakeLine: 2,
    misconception: "maths.trig3d.wrong-angle-identified",
    whatWentWrong:
      "The diagonal is right and the angle is not. $\\angle GAB$ is measured from the edge $AB$, but the shadow of $AG$ on the base is the base diagonal $AC$, not an edge. The angle asked for is $\\angle GAC$, and the triangle that contains it is $ACG$, right-angled at $C$.",
    correction: [
      "AC² = 10² + 5² = 125, so AC = √125",
      "Angle between AG and the base = angle GAC",
      "tan GAC = 4 ÷ √125",
      `Angle = ${dp(f2.angle)}° (1 d.p.)`,
    ],
    marksEarnedAsWritten: ["MA1"],
    feedback: `The first line earns its mark, and the answer is then ${dp(f2Wrong)}° instead of ${dp(f2.angle)}°. Examiners in both Summer 2023 and Summer 2025 reported this as the step that separates the grades: about half the candidates could point to the correct angle. Shine a torch straight down on $AG$ and ask what line the shadow falls on; that line is the one the angle is measured from.`,
    source: "ccea-cer:maths:2023-summer:M82:Q12",
  },
  {
    id: "ftm.maths.m8.pythagoras-and-trigonometry-in-3d.03",
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Orla was asked for the angle between a sloping face and the base of a pyramid with a square base of side 16 cm and a vertical height of 15 cm. Her working:",
    studentWorking: [
      "Diagonal of base = √(16² + 16²) = 22.63 cm",
      "Half the diagonal = 11.31 cm",
      "tan (angle) = 15 ÷ 11.31",
      "Angle = 53.0°",
    ],
    mistakeLine: 2,
    misconception: "maths.trig3d.half-base-vs-half-diagonal",
    whatWentWrong:
      "Half the diagonal runs from the centre of the base out to a corner, so this is the angle the slant edge makes with the base. A face is measured along its line of greatest slope, from the apex down to the midpoint of a bottom edge, and the shadow of that line is half a base edge: 8 cm.",
    correction: [
      "N is the midpoint of AB, so MN = 8 cm",
      "tan (angle VNM) = 15 ÷ 8",
      `Angle VNM = ${dp(f3.faceAngle)}° (1 d.p.)`,
    ],
    marksEarnedAsWritten: [],
    feedback: `Both angles are real angles of this pyramid: ${dp(f3.edgeAngle)}° for the slant edge and ${dp(f3.faceAngle)}° for the face, and the face is always the steeper. A quick sketch of the base square with the centre, a corner and the midpoint of a side marked on it settles which run you need before any trigonometry starts.`,
    source: "ccea-cer:maths:2024-november:M82:Q13",
  },
];

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const rp = (nn, kind, prompt, answer, keyWords, difficultyPrior, image) => ({
  id: `rp.maths.m8.pythagoras-and-trigonometry-in-3d.${nn}`,
  topic: TOPIC,
  specRefs: SPEC,
  examUnit: "M8",
  kind,
  prompt,
  answer,
  keyWords,
  ...(image ? { image } : {}),
  difficultyPrior,
});

export const prompts = [
  rp(
    "01",
    "procedure",
    "The three moves in every 3-D question.",
    "1 Find the right-angled triangle that contains what you want. 2 Draw it again on its own, with its three vertices and the lengths you know. 3 Use Pythagoras for a length, or a trigonometric ratio for an angle, keeping every value exact until the answer line.",
    ["find the triangle", "draw it separately", "Pythagoras or a ratio"],
    4,
  ),
  rp(
    "02",
    "formula",
    "The space diagonal of a cuboid with dimensions $a$, $b$ and $c$.",
    "$d = \\sqrt{a^2 + b^2 + c^2}$, because $d^2 = (a^2 + b^2) + c^2$: the base diagonal first, then the height.",
    ["sum of the three squares", "two Pythagoras steps"],
    3,
  ),
  rp(
    "03",
    "definition",
    "What does the angle between a line and a plane mean?",
    "The angle between the line and its shadow on the plane, where the shadow is what you would see if light came straight down onto the plane. For a space diagonal on the base of a cuboid the shadow is the base diagonal.",
    ["shadow", "projection", "line and its shadow"],
    5,
  ),
  rp(
    "04",
    "trap",
    "A cuboid $ABCDEFGH$ has $E$ above $A$ and $G$ above $C$. Which angle is the angle between $AG$ and the base, and which two are the tempting ones?",
    "$\\angle GAC$. The tempting ones are $\\angle GAB$, measured from an edge instead of from the diagonal, and $\\angle AGC$, which is $90°$ minus the angle you want.",
    ["GAC", "not GAB", "AGC is the complement"],
    5,
  ),
  rp(
    "05",
    "formula",
    "In a square-based pyramid, which base length goes with the slant edge, and which goes with a sloping face?",
    "Slant edge: half the base diagonal, because the edge ends at a corner. Sloping face: half the base edge, because the line of greatest slope ends at the midpoint of a side. The face angle is always the steeper of the two.",
    ["half the diagonal for the edge", "half the edge for the face"],
    6,
  ),
  rp(
    "06",
    "procedure",
    "How do you set out a 3-D solution so a marker can follow it?",
    "Mark the triangle on the given diagram, then redraw it beside your working with its letters and known lengths, name the angle in three letters, write the ratio with numbers, and put one rounded answer on the answer line.",
    ["redraw the triangle", "name the angle", "one answer on the line"],
    4,
  ),
  rp(
    "07",
    "trap",
    "You have found a diagonal of $\\sqrt{97}$ and need an angle. What do you type?",
    "$\\sqrt{97}$ itself, not 9.8 and not 10. Rounding before the last step moves the angle by a tenth of a degree or more and loses the accuracy mark.",
    ["keep the surd", "round once at the end"],
    5,
  ),
  rp(
    "08",
    "novel-example",
    "A cube has edge $x$. Write its space diagonal, and then the edge of a cube whose space diagonal is 9 cm.",
    "Space diagonal $= x\\sqrt{3}$, since $x^2 + x^2 + x^2 = 3x^2$. If $x\\sqrt{3} = 9$ then $3x^2 = 81$, $x^2 = 27$ and $x = 3\\sqrt{3}$ cm.",
    ["x root 3", "3x squared", "3 root 3"],
    6,
  ),
  rp(
    "09",
    "qa",
    "How are the radius, the vertical height and the slant height of a cone related?",
    "$l^2 = r^2 + h^2$: they form a right-angled triangle with the slant height as the hypotenuse, so the slant height is always longer than the vertical height.",
    ["l squared equals r squared plus h squared", "slant is the hypotenuse"],
    4,
  ),
  rp(
    "10",
    "trap",
    "You know all three sides of the extracted triangle. Which ratio should you choose for the angle?",
    "The one whose two sides you were given or found exactly, which is usually tangent with the height over the base diagonal. Choosing a ratio that uses a value you rounded earlier is how accuracy marks are lost.",
    ["use the exact sides", "tangent with height over base diagonal"],
    5,
  ),
];

export const weFigures = { we1Figure, we2Figure, we2FaceFigure, we3Figure, we4Figure };
