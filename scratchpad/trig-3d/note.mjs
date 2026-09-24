/**
 * The lesson: packs/maths/content/m8/pythagoras-and-trigonometry-in-3d/note.blocks.json.
 * Figures are inline SVG written by figs.mjs; every number is recomputed in core.mjs.
 */
import {
  cuboidFacts,
  pyramidFacts,
  wedgeFacts,
  coneFacts,
  cuboidPair,
  cuboidOnly,
  pyramidEdgePair,
  pyramidFacePair,
  wedgePair,
  conePair,
  cuboid,
  compose,
  sf,
  dp,
  long,
  atanDeg,
  assert,
} from "./core.mjs";

const nCuboid = cuboidFacts(8, 6, 5, "note cuboid");
const nPyramid = pyramidFacts(10, 12, "note pyramid");
const nWedge = wedgeFacts(9, 4, 2.5, "note wedge");
const nCone = coneFacts(7, 24, "note cone");
const nRounded = atanDeg(2.5, 9.8);
assert(nCuboid.ac === 10 && nCone.l === 25, "note numbers changed");

const rp = (nn) => ({ type: "prompt", promptId: `rp.maths.m8.pythagoras-and-trigonometry-in-3d.${nn}` });

// --- figure 1: the cuboid and the two triangles inside it ------------------
const figCuboid = {
  type: "figure",
  alt: "On the left, a cuboid ABCDEFGH drawn in oblique projection with the hidden edges AD, DC and DH dashed. AB is 8 cm, BC is 6 cm and the vertical edge CG is 5 cm. The base diagonal AC is dashed, the space diagonal AG is drawn thick, the angle x between them is marked at A and a right angle is marked at C. On the right, triangle ACG is drawn again on its own: AC = 10 cm along the bottom, CG = 5 cm up the right-hand side, AG as the hypotenuse and the angle x at A.",
  svg: cuboidPair(nCuboid, {
    edges: { AB: "8 cm", BC: "6 cm", CG: "5 cm" },
    baseDiagLabel: "AC",
    spaceDiagLabel: "AG",
    angle: "x",
    triBase: "AC = 10 cm",
    triHeight: "CG = 5 cm",
    captionA: "1  find the triangle",
    captionB: "2  draw it on its own",
  }),
  caption: "The whole topic in one picture: the triangle you need is inside the solid, and it is much easier to use once it is outside it.",
};

// --- figure 2: which angle? ------------------------------------------------
const figWhichAngle = {
  type: "figure",
  alt: "Two copies of the same cuboid. In the left copy the base diagonal AC is dashed and the angle between the space diagonal AG and AC is marked at A: this is the angle between AG and the base. In the right copy the angle marked at A is between AG and the bottom front edge AB, labelled 'not this'.",
  svg: compose([
    {
      ...cuboid({ w: 8, d: 6, h: 5, scale: 19, baseDiag: true, spaceDiag: true, angle: "x" }),
      caption: "the angle with the base: between AG and AC",
    },
    {
      ...cuboid({ w: 8, d: 6, h: 5, scale: 19, spaceDiag: true, markAngle: ["G", "A", "B"], markAngleLabel: "not this" }),
      caption: "measured from an edge instead: too large",
    },
  ]),
  caption: "The base is a whole plane, not one edge. The line the angle is measured from is the shadow of AG, which is the diagonal AC.",
};

// --- figure 3 and 4: the pyramid, twice ------------------------------------
const figPyramidEdge = {
  type: "figure",
  alt: "A square-based pyramid VABCD with base edge 10 cm and the apex V vertically above the centre M of the base, VM = 12 cm. The base diagonal AC and the height VM are dashed, the slant edge VA is drawn thick and the angle y is marked at A. Beside it, triangle AMV drawn on its own with AM = 7.07 cm, VM = 12 cm and the angle y at A.",
  svg: pyramidEdgePair(nPyramid, { angle: "y", triBase: "AM = 7.07 cm", triHeight: "VM = 12 cm" }),
  caption: "Slant edge against the base: the run is half a diagonal, because the edge ends at a corner.",
};

const figPyramidFace = {
  type: "figure",
  alt: "The same pyramid with N marked as the midpoint of the base edge AB. The height VM and the line MN are dashed, the slant height VN is drawn thick and the angle z is marked at N. Beside it, triangle NMV drawn on its own with MN = 5 cm, VM = 12 cm and the angle z at N.",
  svg: pyramidFacePair(nPyramid, { angle: "z", triBase: "MN = 5 cm", triHeight: "VM = 12 cm" }),
  caption: "Sloping face against the base: the run is half an edge, because the steepest line ends at the middle of a side.",
};

// --- figure 5: the wedge ---------------------------------------------------
const figWedge = {
  type: "figure",
  alt: "A wedge: the horizontal rectangular base ABCD is 9 m by 4 m and the back face DCGH is vertical and 2.5 m high, so ABGH is the sloping surface. Hidden edges are dashed, the base diagonal AC is dashed and the sloping line AG is drawn thick with the angle theta at A. Beside it, triangle ACG drawn on its own with AC = root 97 m, CG = 2.5 m and the angle theta at A.",
  svg: wedgePair(nWedge, { angle: "θ", triBase: "AC = √97 m", triHeight: "CG = 2.5 m" }),
  caption: "A wedge is not a cuboid, and the method does not change: shadow first, then the vertical triangle.",
};

// --- figure 6: the cone ----------------------------------------------------
const figCone = {
  type: "figure",
  alt: "A cone with base radius 7 cm and vertical height 24 cm. The height from the apex V to the centre O of the base is dashed, the radius OP is dashed, a right angle is marked at O and the slant height VP is drawn thick and labelled l, with the angle x at P. Beside it, triangle POV drawn on its own with OP = 7 cm, OV = 24 cm and the angle x at P.",
  svg: conePair(nCone, { angle: "x", triBase: "OP = 7 cm", triHeight: "OV = 24 cm" }),
  caption: "Radius, vertical height and slant height form a right-angled triangle, with the slant height as the hypotenuse.",
};

// --- figure 7: the cube, read backwards ------------------------------------
const figCube = {
  type: "figure",
  alt: "A cube ABCDEFGH with the edges AB, BC and CG each labelled x, the base diagonal AC dashed and labelled x root 2, and the space diagonal AG drawn thick and labelled x root 3. The hidden edges AD, DC and DH are dashed.",
  svg: cuboidOnly({ w: 6, d: 6, h: 6 }, {
    edges: { AB: "x", BC: "x", CG: "x" },
    baseDiag: true,
    baseDiagLabel: "x√2",
    spaceDiag: true,
    spaceDiagLabel: "x√3",
    target: 160,
  }),
  caption: "In a cube the face diagonal is x√2 and the space diagonal is x√3, which turns a backwards question into one line.",
};

export const blocks = [
  { type: "h", text: "Pythagoras and trigonometry in 3D" },
  {
    type: "callout",
    kind: "spec",
    title: "The statement",
    md: "**M8-GM-03** — use Pythagoras' theorem and trigonometry to solve 2D and 3D problems.\nThe Teacher Guidance names exactly two jobs: **find the length of a space diagonal**, and **find the angle between a line and a plane**.",
    source: "CCEA GCSE Mathematics specification, statement M8-GM-03 and its Teacher Guidance",
  },
  {
    type: "p",
    md: "This is the question CCEA uses near the end of the M8 calculator paper, worth 3 to 6 marks, and it is the one that sorts the top grades. In Summer 2025 most of the entry found the space diagonal and **fewer than half** could then say which angle they were being asked for. The good news is hidden in that sentence: the calculation is easy, and what is being tested is whether you can see the right triangle. This lesson is about seeing it.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "number",
    prompt: "Warm-up, from M2. A rectangle measures 6 cm by 8 cm. How long is its diagonal, in cm?",
    answer: "10",
    explain: "$\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$ cm. Every 3-D question you meet starts with exactly this step, done inside the solid.",
  },

  { type: "h", text: "Every 3-D question is a 2-D question in disguise" },
  {
    type: "p",
    md: "There is no new theorem here. Pythagoras and SOHCAHTOA still only work in a **right-angled triangle**, and a cuboid is full of them. The whole skill is finding the one triangle that contains what you want, and then drawing it again on its own, outside the solid, where the words opposite, adjacent and hypotenuse mean something.\n\nTake the cuboid below. $AC$ lies flat in the base. $CG$ is vertical, so it is at right angles to **every** line in the base, including $AC$. That gives triangle $ACG$ a right angle at $C$.",
  },
  figCuboid,
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: "In the cuboid above, where is the right angle in triangle $ACG$?",
    options: ["At $C$", "At $A$", "At $G$"],
    answer: "At $C$",
    explain:
      "$CG$ is vertical and $AC$ lies in the base, so they meet at right angles at $C$. That is why $AG$ is the hypotenuse of this triangle, and it is why the longest line in the whole cuboid is the space diagonal.",
  },
  {
    type: "p",
    md: "So the space diagonal comes out of **two Pythagoras steps joined at $AC$**:\n\n1. In the base: $AC^2 = 8^2 + 6^2 = 100$, so $AC = 10$ cm.\n2. Standing up: $AG^2 = AC^2 + CG^2 = 100 + 25 = 125$, so $AG = \\sqrt{125} = 11.2$ cm (3 s.f.).\n\nSubstituting the first line into the second gives the one-line version, $AG^2 = a^2 + b^2 + c^2$. Both routes earn the same marks; the two-step version is safer because it leaves $AC$ written down, and you will need $AC$ again for the angle.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: "A cuboid measures 2 cm by 3 cm by 6 cm. How long is its space diagonal, in cm?",
    answer: "7",
    explain: "$2^2 + 3^2 + 6^2 = 4 + 9 + 36 = 49$, and $\\sqrt{49} = 7$ cm. Three dimensions, each squared, then one square root.",
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "Must know — none of this is on the formula sheet",
    md: "$a^2 + b^2 = c^2$ and the three ratios $\\sin$, $\\cos$, $\\tan$ are **not** printed on page 2. The sheet gives you the sine rule, the cosine rule, $\\tfrac{1}{2}ab\\sin C$, the cone and the sphere, and nothing else that helps here.\n**Space diagonal**: $d = \\sqrt{a^2 + b^2 + c^2}$.\n**Cube of edge $x$**: face diagonal $x\\sqrt{2}$, space diagonal $x\\sqrt{3}$.",
  },
  {
    type: "video",
    videoId: "Fk0Z-ArGMxE",
    title: "3D Pythagoras - Corbettmaths",
    channel: "corbettmaths",
    corbettmathsNumber: 259,
    why: "Corbettmaths video 259 works the space diagonal in the same two steps used above. Watch it if you want the method said out loud once more before the angle work starts.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "blank",
    prompt: "Fill the gap: to find a space diagonal you add the squares of ___ dimensions.",
    answer: "three | 3 | all three",
    explain: "Three. Using only two gives the diagonal of a face, which is the most common way this question is started and not finished.",
  },

  { type: "h", text: "The angle between a line and a plane" },
  {
    type: "p",
    md: "Here is the definition that settles every one of these questions.\n\n**The angle between a line and a plane is the angle between the line and its shadow on that plane** — the shadow you would see with a light directly overhead.\n\nShine that light on the space diagonal $AG$. The shadow of $G$ lands on $C$, so the shadow of $AG$ is $AC$, and the angle you want is $\\angle GAC$: between the diagonal and the base diagonal, measured at $A$.",
  },
  figWhichAngle,
  {
    type: "gate",
    id: "g5",
    kind: "choice",
    prompt: "Which three letters name the angle between $AG$ and the base $ABCD$?",
    options: ["$\\angle GAC$", "$\\angle GAB$", "$\\angle AGC$"],
    answer: "$\\angle GAC$",
    explain:
      "$\\angle GAB$ is measured from an edge, which is the mistake examiners saw most often in 2023 and 2025. $\\angle AGC$ is at the top of the triangle, between $AG$ and the vertical edge, so it is $90°$ minus the angle you want.",
  },
  {
    type: "p",
    md: "Once the triangle is drawn on its own the trigonometry is M3 work. In triangle $ACG$ the side opposite $\\angle GAC$ is the height $CG = 5$, and the side next to it is $AC = 10$, so $\\tan \\angle GAC = \\dfrac{5}{10}$ and $\\angle GAC = 26.6°$.\n\nChoose **tangent** whenever you can: its two sides, the height and the base diagonal, are usually the exact ones. The hypotenuse $AG$ is often a root, and rounding it is where the last mark goes.",
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: "A different cuboid has base diagonal $AC = 12$ cm and height $CG = 9$ cm. Find the angle between $AG$ and the base, in degrees, to 1 decimal place.",
    answer: "36.9",
    explain: "$\\tan^{-1}\\left(\\dfrac{9}{12}\\right) = 36.869\\ldots = 36.9°$. Height on top, base diagonal underneath, every time.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the shadow, and not some other line?",
    md: "Of all the lines you could draw in the base from $A$, the shadow $AC$ is the one that makes the **smallest** angle with $AG$. Tilt away from it, as $\\angle GAB$ does, and the angle grows. The angle a line makes with a plane is defined as that smallest one, which is why there is only ever one right answer.",
  },

  { type: "h", text: "Pyramids: two angles, two different runs" },
  {
    type: "p",
    md: "A square-based pyramid gives CCEA two questions from one solid, and they have different answers.\n\n**The slant edge $VA$ against the base.** The edge ends at a corner, so its shadow runs from the centre $M$ out to the corner $A$: that is **half a diagonal**.",
  },
  figPyramidEdge,
  {
    type: "p",
    md: "**A sloping face against the base.** A face is not a line, so you measure along its steepest line: from the apex $V$ straight down the face to $N$, the midpoint of the bottom edge. The shadow of $VN$ is $MN$, which is **half an edge**.",
  },
  figPyramidFace,
  {
    type: "gate",
    id: "g7",
    kind: "choice",
    prompt: "The pyramid above has base 10 cm and height 12 cm. For the angle between the **sloping face** and the base, what is the run along the base?",
    options: ["5 cm, half an edge", "7.07 cm, half a diagonal", "10 cm, a whole edge"],
    answer: "5 cm, half an edge",
    explain:
      "Half an edge, so $\\tan z = \\dfrac{12}{5}$ and $z = 67.4°$. Half a diagonal would have given the slant edge's angle, $59.5°$. Same pyramid, same height, two honest answers to two different questions.",
  },
  {
    type: "p",
    md: "The face is always the steeper of the two, because the same height stands over a shorter run. If your two answers come out the other way round, the runs have been swapped.\n\nA **wedge** or a triangular prism behaves exactly like the cuboid: find the shadow on the ground, then stand the triangle up.",
  },
  figWedge,
  {
    type: "gate",
    id: "g8",
    kind: "choice",
    prompt: "In the wedge above, which line is the shadow of $AG$ on the base?",
    options: ["$AC$", "$AB$", "$AH$"],
    answer: "$AC$",
    explain: "$G$ stands directly above $C$, so the shadow of $AG$ is $AC$, the diagonal of the base rectangle, and the angle is $\\angle GAC$.",
  },
  {
    type: "p",
    md: "**Cones** join the family through the slant height. The radius, the vertical height and the slant height make a right-angled triangle with the slant height as the hypotenuse, so $l^2 = r^2 + h^2$. The slant height is therefore always longer than the vertical height, which is worth checking before you use either in $\\pi r l$.",
  },
  figCone,
  {
    type: "gate",
    id: "g9",
    kind: "number",
    prompt: "A cone has radius 7 cm and vertical height 24 cm. What is its slant height, in cm?",
    answer: "25",
    explain: "$\\sqrt{7^2 + 24^2} = \\sqrt{625} = 25$ cm. It is longer than 24, as it must be.",
  },

  { type: "h", text: "Exact until the very last line" },
  {
    type: "p",
    md: `Here is a real cost. In the wedge above, $AC = \\sqrt{97} = 9.8488\\ldots$ m. The angle is $\\tan^{-1}\\left(\\dfrac{2.5}{AC}\\right)$.\n\n**Keeping $\\sqrt{97}$:** ${dp(nWedge.angle)}°. **Rounding $AC$ to 9.8 first:** ${dp(nRounded)}°. **Rounding to 10:** ${dp(atanDeg(2.5, 10))}°.\n\nAll three look like sensible answers on the page, and only the first earns the accuracy mark. Mark schemes print the long decimal ($${long(nWedge.angle, 6)}\\ldots$) precisely because that is what an unrounded chain produces.`,
  },
  {
    type: "gate",
    id: "g10",
    kind: "choice",
    prompt: "You have $AC^2 = 97$ and need the angle. What do you type in?",
    options: ["$\\sqrt{97}$, and round once at the end", "9.8, it is close enough", "97, it is exact"],
    answer: "$\\sqrt{97}$, and round once at the end",
    explain:
      "97 is exact but it is $AC^2$, not a length. Use the root for the ratio, keep the 97 for any further Pythagoras step, and round only on the answer line.",
  },
  figCube,
  {
    type: "gate",
    id: "g11",
    kind: "blank",
    prompt: "A cube has space diagonal 12 cm. Write $x^2$ as a number, where $x$ cm is an edge.",
    answer: "48",
    explain: "$3x^2 = 144$, so $x^2 = 48$ and $x = \\sqrt{48} = 4\\sqrt{3}$ cm. Backwards questions are the same rule, solved for the edge instead.",
  },

  { type: "h", text: "Where the marks are actually lost" },
  {
    type: "callout",
    kind: "examiner",
    md: "**The diagonal is not the problem; the angle is.** Most of the entry found the space diagonal, and under half went on to identify the angle it makes with the base. Name the angle in three letters before you touch the calculator — that naming is itself worth a mark.",
    source: "ccea-cer:maths:2025-summer:M82:Q12",
  },
  {
    type: "gate",
    id: "g12",
    kind: "choice",
    prompt: "A question asks for the angle between $AG$ and **the largest face**, rather than the base. What changes?",
    options: [
      "Use the diagonal of that face, and the edge perpendicular to it",
      "Nothing, the answer is the same as with the base",
      "Use the longest edge of the cuboid",
    ],
    answer: "Use the diagonal of that face, and the edge perpendicular to it",
    explain:
      "The plane has moved, so the shadow moves with it. For a $9 \\times 12$ face, the shadow is that face's diagonal, 15, and the perpendicular distance is the remaining edge. The method is identical once you have asked which plane.",
  },
  {
    type: "callout",
    kind: "examiner",
    md: "**About half the entry knew which angle the space diagonal made with the base**, and three quarters of those then chose the correct ratio. So the ratio is not where you are losing marks: the diagram is. Redraw the triangle.",
    source: "ccea-cer:maths:2023-summer:M82:Q12",
  },
  {
    type: "callout",
    kind: "examiner",
    md: "**Layout earns marks.** Around 40% gained full marks on the 3-D trigonometry question, and examiners tied the full-mark scripts to solutions that were well laid out. A labelled triangle beside the working, then one ratio, then one answer on the line.",
    source: "ccea-cer:maths:2024-november:M82:Q13",
  },
  {
    type: "callout",
    kind: "examiner",
    md: "**It is learnable.** Over half the entry gained full marks on the angle between a space diagonal and the base, and nearly everyone made a sensible start. Examiners put that down to preparation, which is exactly what this page is for.",
    source: "ccea-cer:maths:2024-summer:M82:Q11",
  },
  {
    type: "gate",
    id: "g13",
    kind: "choice",
    prompt: "Which of these would an examiner reward first in a 3-mark angle question?",
    options: [
      "Naming the angle, or drawing the triangle with its lengths on it",
      "Writing the final answer to 3 significant figures",
      "Writing out $a^2 + b^2 = c^2$",
    ],
    answer: "Naming the angle, or drawing the triangle with its lengths on it",
    explain:
      "CCEA schemes for this topic open with a mark for using or identifying the correct angle, before any ratio appears. It is the cheapest mark in the question and the one most often left behind.",
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Not on this spec",
    md: "3-D coordinates and 3-D vectors; the angle between two planes other than a face and the base; anything needing the cosine rule **in this topic** (a non-right triangle inside a solid belongs to the sine and cosine rule topic, and CCEA has set it that way, as in the November 2021 cuboid where the angle asked for sat at the far corner); surface areas or volumes, which live in the mensuration topics.",
  },

  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "**How it is worded.** Usually two or three parts on the calculator paper: *show that* a base diagonal is a given length [2], *calculate* the space diagonal [2], then *calculate the angle between* that diagonal *and the base* [3]. Sometimes the angle comes alone for 3 marks, and sometimes a pyramid or a wedge replaces the cuboid.",
  },
  {
    type: "p",
    md: "**What the first mark is for.** The first Pythagoras line, or naming the angle. **What the last mark is for.** The rounded value with its degree symbol or unit, from working that stayed exact. **If you are stuck:** draw any right-angled triangle you can see inside the solid, label the sides you know, and write one Pythagoras line. A method mark is available for the correct first step even when the question is never finished.",
  },
  {
    type: "gate",
    id: "g14",
    kind: "blank",
    prompt: "Complete the sentence an examiner wants to see first: the angle between $AG$ and the base is angle ___ .",
    answer: "GAC | CAG | gac | cag",
    explain: "Three letters, with the vertex of the angle in the middle. Writing that line before any calculation is worth a mark on its own.",
  },
  {
    type: "video",
    videoId: "e3yCvnlYB4w",
    title: "Pythagoras and Trigonometry in 3D",
    channel: "N.I. Maths Tutor",
    why: "A Northern Ireland teacher working CCEA-style 3-D questions, including the wording CCEA uses for the angle with the base. Useful once you have done a few yourself.",
  },
  {
    type: "gate",
    id: "g15",
    kind: "number",
    prompt: "Last one. A cuboid is 5 cm by 12 cm by 9 cm. Find the angle between its space diagonal and the base, in degrees, to 1 decimal place.",
    answer: "34.7",
    explain:
      "$AC = \\sqrt{5^2 + 12^2} = 13$, then $\\tan^{-1}\\left(\\dfrac{9}{13}\\right) = 34.695\\ldots = 34.7°$. Two lines, once you know which triangle to draw.",
  },
  rp("01"),
  rp("03"),
  rp("04"),
  rp("05"),
  rp("07"),
];
