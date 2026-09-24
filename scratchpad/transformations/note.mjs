/** The lesson: note.blocks.json for maths.m7.combined-transformations-… */
import { gridSvg } from "./lib.mjs";
import * as S from "./shapes.mjs";

const fig = (alt, svg, caption) => ({ type: "figure", alt, svg, ...(caption ? { caption } : {}) });
const YX = { kind: "y=x", label: "y = x", labelAt: [7.0, 7.5] };
const YNX = { kind: "y=-x", label: "y = -x", labelAt: [6.4, -7.3] };
const YNX_TOP = { kind: "y=-x", label: "y = -x", labelAt: [-6.5, 7.5] };

// --- figure 1 -------------------------------------------------------------
const f1 = gridSvg({
  lines: [YX, YNX_TOP],
  joins: [
    { from: S.P1, to: S.P1x },
    { from: S.P1, to: S.P1nx },
  ],
  marks: [
    { at: S.P1, kind: "point", label: "P (3, 5)", labelAt: [1.9, 5.9] },
    { at: S.P1x, kind: "point", label: "P' (5, 3)", labelAt: [6.7, 3.7] },
    { at: S.P1nx, kind: "point", label: "P\" (-5, -3)", labelAt: [-4.7, -4.2] },
  ],
});

// --- figure 2 -------------------------------------------------------------
const f2 = gridSvg({
  lines: [YX],
  shapes: [
    { pts: S.A2, label: "A", at: [6.2, 1.6], dots: true },
    { pts: S.A2i, label: "A'", style: "final", at: [1.5, 6.2], dots: true },
  ],
  joins: S.A2.map((p, i) => ({ from: p, to: S.A2i[i] })),
});

// --- figure 3 -------------------------------------------------------------
const f3 = gridSvg({
  lines: [YNX],
  shapes: [
    { pts: S.B3, label: "B", at: [4.9, 3.7], dots: true },
    { pts: S.B3i, label: "B'", style: "final", at: [-3.9, -4.6], dots: true },
  ],
  joins: S.B3.map((p, i) => ({ from: p, to: S.B3i[i] })),
});

// --- figure 4: the combined transformation --------------------------------
const f4 = gridSvg({
  lines: [YX],
  shapes: [
    { pts: S.C4, label: "A", at: [7.0, 1.6] },
    { pts: S.C4i, label: "A'", style: "image", at: [1.4, 6.9] },
    { pts: S.C4f, label: "A\"", style: "final", at: [-3.1, 2.1] },
  ],
  marks: [{ at: [-5, -2], label: "(-5, -2)", labelAt: [-5.0, -3.3] }],
  rays: S.C4i.map((p) => ({ from: [-5, -2], to: p, extend: 1.06 })),
});

// --- figure 5: two perpendicular mirrors ----------------------------------
const f5 = gridSvg({
  lines: [YX, YNX],
  shapes: [
    { pts: S.D5, label: "C", at: [2.9, 5.6] },
    { pts: S.D5i, label: "C'", style: "image", at: [5.8, 2.6] },
    { pts: S.D5f, label: "C\"", style: "final", at: [-3.1, -5.7] },
  ],
  joins: [{ from: S.D5[1], to: S.D5f[1] }],
  marks: [{ at: [0, 0], kind: "point", label: "O", labelAt: [0.9, 0.8] }],
});

// --- figure 6: two parallel mirrors ---------------------------------------
const f6 = gridSvg({
  lines: [
    { kind: "x=", at: -5, label: "x = -5", labelAt: [-3.8, 0.7] },
    { kind: "x=", at: -1, label: "x = -1", labelAt: [0.4, 0.7] },
  ],
  shapes: [
    { pts: S.E6, label: "P", at: [-7.2, 3.0] },
    { pts: S.E6i, label: "P'", style: "image", at: [-3.2, 3.0] },
    { pts: S.E6f, label: "P\"", style: "final", at: [0.8, 3.0] },
  ],
  arrows: [{ from: [-8, 6.9], to: [0, 6.9], label: "8 right", labelAt: [-4, 7.6] }],
});

// --- figure 7: the centre of a rotation -----------------------------------
const f7 = gridSvg({
  shapes: [
    { pts: S.F7, label: "R", at: [1.9, 1.6], dots: true },
    { pts: S.F7i, label: "R'", style: "final", at: [-0.8, 5.2], dots: true },
  ],
  joins: [
    { from: S.F7[0], to: S.F7i[0] },
    { from: S.F7[1], to: S.F7i[1] },
  ],
  bisectors: [
    { u: -1, v: 3, w: 7 },
    { u: -4, v: 6, w: 16 },
  ],
  marks: [{ at: S.F7c, label: "centre (-1, 2)", labelAt: [-4.0, 0.9] }],
});

// --- figure 8: the centre of an enlargement -------------------------------
const f8 = gridSvg({
  shapes: [
    { pts: S.G8, label: "S", at: [-3.1, 3.4], dots: true },
    { pts: S.G8i, label: "S'", style: "final", at: [0.65, 0.65], dots: true },
  ],
  rays: S.G8.map((p) => ({ from: S.G8c, to: p, extend: 1.1 })),
  marks: [{ at: S.G8c, label: "centre (2, -1)", labelAt: [4.6, -1.9] }],
});

// --- figure 9: order matters ----------------------------------------------
const f9 = gridSvg({
  lines: [YX],
  shapes: [
    { pts: S.H9, label: "T", at: [1.8, 2.6] },
    { pts: S.H9a2, label: "U", style: "final", at: [-1.8, 2.6] },
    { pts: S.H9b2, label: "V", style: "final", at: [1.8, -2.6] },
  ],
});

// --- figure 10: a translation, fully described ----------------------------
const f10 = gridSvg({
  shapes: [
    { pts: S.J10, label: "M", at: [-6.4, 4.0] },
    { pts: S.J10i, label: "M'", style: "final", at: [-1.3, -3.0] },
  ],
  arrows: [{ from: S.J10[0], to: S.J10i[0], label: "5 right, 7 down", labelAt: [-2.5, 0.6] }],
});

// --- figure 11: a fractional enlargement with rays ------------------------
const f11 = gridSvg({
  shapes: [
    { pts: S.K11, label: "K", at: [-0.6, -0.9] },
    { pts: S.K11i, label: "K'", style: "final", at: [-5.2, -3.0] },
  ],
  rays: S.K11.map((p) => ({ from: S.K11c, to: p, extend: 1.08 })),
  marks: [{ at: S.K11c, label: "(-5, -5)", labelAt: [-6.5, -6.2] }],
});

export const FIGURE_COUNT = 11;

export const blocks = [
  { type: "h", text: "Combined transformations, and the mirrors y = x and y = -x" },
  {
    type: "callout",
    kind: "spec",
    title: "The two statements",
    md: "**M7-GM-01** — describe and transform 2D shapes using combined transformations.\n**M7-GM-02** — describe and transform 2D shapes using reflections in the lines $y = \\pm x$.",
    source: "CCEA GCSE Mathematics specification, statements M7-GM-01 and M7-GM-02",
  },
  {
    type: "p",
    md: "This is the grid question, and it is worth going after. It turns up in M7 and again in M8, on either paper, usually as one of the last four questions, worth 2 to 4 marks. Two things are asked: **do** two transformations one after the other, or **describe** the single transformation that has already happened. In Summer 2025 the M8 version was answered correctly by just over 40 per cent, and more than 30 per cent showed no understanding of it at all. Almost all of that is one missing skill — reflecting in a sloping mirror — and you can own it in an afternoon.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "blank",
    prompt: "The point $(3, 5)$ is reflected in the line $y = x$. Its image is",
    answer: "(5, 3) | 5, 3 | 5 3",
    explain: "Reflecting in $y = x$ swaps the two coordinates, so $(3, 5)$ becomes $(5, 3)$. That is the whole rule, and the rest of this lesson is about trusting it.",
  },
  { type: "h", text: "Why y = x swaps the coordinates" },
  {
    type: "p",
    md: "The line $y = x$ is made of every point whose two coordinates are equal: $(1, 1)$, $(4, 4)$, $(-3, -3)$. Reflecting in it is the move that **exchanges the roles of across and up**. Go 3 across and 5 up, reflect, and you go 5 across and 3 up. So $(a, b) \\to (b, a)$.\n\nThe line $y = -x$ is the other diagonal, through $(1, -1)$ and $(-4, 4)$. It swaps the roles too, but it also turns each direction into its opposite, so $(a, b) \\to (-b, -a)$: **swap, then change both signs.**",
  },
  fig(
    "A coordinate grid from -8 to 8 on both axes. The dashed line y = x runs from bottom left to top right and the dashed line y = -x runs from top left to bottom right. The point P at (3, 5) is marked. A dashed segment joins P to its image P dash at (5, 3), crossing the line y = x at right angles. A second dashed segment joins P to its image P double dash at (-5, -3), crossing the line y = -x.",
    f1,
    "One point, two diagonal mirrors: (3, 5) becomes (5, 3) in y = x, and (-5, -3) in y = -x.",
  ),
  {
    type: "gate",
    id: "g2",
    kind: "blank",
    prompt: "The point $(3, 5)$ is reflected in the line $y = -x$. Its image is",
    answer: "(-5, -3) | -5, -3 | -5 -3",
    explain: "Swap to get $(5, 3)$, then change both signs to get $(-5, -3)$. Doing only the swap gives $(5, 3)$, which is the $y = x$ answer; doing only the signs gives $(-3, -5)$, which is a half turn about the origin.",
  },
  {
    type: "p",
    md: "**Do it vertex by vertex.** Reflect one corner, mark it, reflect the next, mark it, then join them up. A triangle takes three swaps. The shape below has corners at $(4, 1)$, $(7, 1)$ and $(7, 3)$, so its image has corners at $(1, 4)$, $(1, 7)$ and $(3, 7)$ — and you can read that straight off the list without measuring anything.",
  },
  fig(
    "A coordinate grid from -8 to 8. The dashed mirror line y = x is drawn. Triangle A has vertices at (4, 1), (7, 1) and (7, 3), below the mirror line. Its image, triangle A dash, has vertices at (1, 4), (1, 7) and (3, 7), above the mirror line. A dashed segment joins each vertex to its image.",
    f2,
    "Reflection in y = x: every vertex has its pair of coordinates swapped.",
  ),
  {
    type: "gate",
    id: "g3",
    kind: "choice",
    prompt: "A triangle has a vertex at $(-2, 6)$. After a reflection in $y = x$ that vertex is at",
    options: ["(6, -2)", "(2, 6)", "(-6, 2)"],
    answer: "(6, -2)",
    explain: "Swap the pair as it stands, minus signs and all: $(-2, 6) \\to (6, -2)$. The signs are not touched by a reflection in $y = x$.",
  },
  fig(
    "A coordinate grid from -8 to 8. The dashed mirror line y = -x is drawn from top left to bottom right. Triangle B has vertices at (2, 3), (6, 3) and (6, 5) in the first quadrant. Its image, triangle B dash, has vertices at (-3, -2), (-3, -6) and (-5, -6) in the third quadrant. A dashed segment joins each vertex to its image.",
    f3,
    "Reflection in y = -x: swap the coordinates, then change both signs.",
  ),
  {
    type: "callout",
    kind: "why",
    title: "Draw the mirror first",
    md: "Both diagonals are already a feature of the grid, so drawing them costs about four seconds: $y = x$ runs corner to corner through the origin with a slope of 1, and $y = -x$ is the other diagonal. Every November and every summer the reports record the same slip — the shape reflected in the $y$-axis, or in $y = -x$ when $y = x$ was asked for. A drawn mirror line makes that slip visible to you before it becomes visible to a marker.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "choice",
    prompt: "Which line passes through $(1, -1)$, $(0, 0)$ and $(-4, 4)$?",
    options: ["$y = -x$", "$y = x$", "the $y$-axis"],
    answer: "$y = -x$",
    explain: "Each point has a $y$-coordinate that is the negative of its $x$-coordinate, so the line is $y = -x$: the diagonal that falls from left to right.",
  },
  { type: "h", text: "See it" },
  {
    type: "video",
    videoId: "AE0w7QRjGqQ",
    title: "Reflections - Corbettmaths",
    channel: "corbettmaths",
    corbettmathsNumber: 272,
    why: "Corbettmaths video 272 does the vertex-by-vertex reflection, including the sloping mirrors, at the pace of someone drawing it on a grid. Watch it once, then come back and answer the gate below without pausing it again.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "blank",
    prompt: "Reflect $(-6, 2)$ in the line $y = x$. The image is",
    answer: "(2, -6) | 2, -6 | 2 -6",
    explain: "Swap: $(-6, 2) \\to (2, -6)$. If you also changed the signs you have reflected in $y = -x$ instead, which is the most common of all the slips on this topic.",
  },
  { type: "h", text: "Two transformations, in the order given" },
  {
    type: "p",
    md: "A combined question reads like this: *reflect in $y = x$, followed by an enlargement of scale factor $\\tfrac{1}{2}$ with centre $(-5, -2)$.* Three rules carry it:\n\n**1 Do them in the order written.** The first transformation acts on the original shape; the second acts on the image the first one made, never on the original.\n\n**2 Leave the middle image on the grid.** It is worth marks on its own. Rubbing it out after using it throws those marks away, and the reports say plainly that candidates do this.\n\n**3 Label as you go.** Call them A, A' and A\" so the marker can see which is which.",
  },
  {
    type: "gate",
    id: "g6",
    kind: "choice",
    prompt: "A question says: reflect in $y = -x$, followed by a translation. Which shape does the translation act on?",
    options: ["The image made by the reflection", "The original shape", "Either, because the order does not matter"],
    answer: "The image made by the reflection",
    explain: "Each transformation acts on whatever the one before it produced. That is why the middle image has to be drawn before you can start the second step.",
  },
  fig(
    "A coordinate grid from -8 to 8. The dashed line y = x is drawn. Triangle A has vertices at (4, 1), (8, 1) and (8, 3). Its reflection in y = x, drawn with a dashed outline and labelled A dash, has vertices at (1, 4), (1, 8) and (3, 8). A cross marks the centre of enlargement at (-5, -2), and three dotted rays run from that centre through the vertices of A dash. Halfway along each ray is a vertex of the final image A double dash, at (-2, 1), (-2, 3) and (-1, 3).",
    f4,
    "Reflect first (A to A'), then enlarge A' from the centre (-5, -2) with scale factor one half to reach A\".",
  ),
  {
    type: "p",
    md: "**The enlargement step, in one sentence:** draw a ray from the centre to a vertex, then put the image of that vertex at $\\tfrac{1}{2}$ of the way along it. Vertex $(1, 4)$ is 6 across and 6 up from $(-5, -2)$; half of that is 3 across and 3 up, which lands on $(-2, 1)$. Do the same for the other two. Nothing here needs a ruler measurement — the counting on the grid is exact.",
  },
  {
    type: "gate",
    id: "g7",
    kind: "blank",
    prompt: "Enlarge $(3, 8)$ by scale factor $\\tfrac{1}{2}$ with centre $(-5, -2)$. The image is",
    answer: "(-1, 3) | -1, 3 | -1 3",
    explain: "From $(-5, -2)$ to $(3, 8)$ is 8 across and 10 up. Half of that is 4 across and 5 up, which reaches $(-1, 3)$. Halving the coordinates themselves would give $(1.5, 4)$ and that ignores the centre completely.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025, M7 Paper 2 Q15",
    md: "This exact shape of question — reflect in $y = x$, then enlarge by $\\tfrac{1}{2}$ about a centre that was not the origin. Reflections in the axes, and in $y = -x$, were common. The scale factor itself was understood; the centre was not, and some candidates drew their image sitting on top of the centre. The same combination was on M8 Paper 2 Q8 that summer, where just over 40 per cent were correct.",
    source: "ccea-cer:maths:2025-summer:M72:Q15",
  },
  {
    type: "gate",
    id: "g8",
    kind: "choice",
    prompt: "In a 4-mark combined question you reflect in the wrong line, then enlarge your own image correctly. What is still available?",
    options: [
      "The marks for the second stage",
      "Nothing, because the first stage was wrong",
      "All four marks",
    ],
    answer: "The marks for the second stage",
    explain: "CCEA marks positively: the enlargement is judged against the image you actually drew. The examiners recorded exactly this in Summer 2025. It is why a committed attempt beats a blank grid every time.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025, M8 Paper 2 Q8",
    md: "Over 30 per cent of candidates showed no understanding of the combination at all. But look at what the rest of the report says: candidates who reflected in the wrong line and then enlarged **their own** image properly still picked up marks. So if you are unsure of stage one, commit to something, draw it, and then do stage two to it carefully. A wrong first image with a right second step is worth more than a blank grid.",
    source: "ccea-cer:maths:2025-summer:M82:Q8",
  },
  {
    type: "p",
    md: "**Order changes the answer.** Below, triangle T is reflected in $y = x$ and then rotated a quarter turn anticlockwise about the origin, giving U. Do the same two transformations the other way round and you get V instead. They are not the same triangle, so read the sentence carefully and start where it tells you to.",
  },
  fig(
    "A coordinate grid from -8 to 8 with the dashed line y = x. Triangle T has vertices at (1, 2), (4, 2) and (1, 4). Triangle U, in the second quadrant, has vertices at (-1, 2), (-4, 2) and (-1, 4): it is T reflected in y = x and then rotated 90 degrees anticlockwise about the origin. Triangle V, in the fourth quadrant, has vertices at (1, -2), (4, -2) and (1, -4): it is T rotated first and then reflected.",
    f9,
    "U is reflect-then-rotate; V is rotate-then-reflect. Same two transformations, different answers.",
  ),
  {
    type: "gate",
    id: "g9",
    kind: "choice",
    prompt: "T is rotated $90^\\circ$ anticlockwise about the origin first, and the image is then reflected in $y = x$. Which triangle is that?",
    options: ["V", "U", "Both, since the order makes no difference"],
    answer: "V",
    explain: "V is the rotate-first route. U comes from reflecting first. Reading the sentence from left to right and starting where it starts is the whole skill here.",
  },
  { type: "h", text: "One transformation that does the work of two" },
  {
    type: "p",
    md: "Two transformations in a row always add up to a single one, and CCEA likes asking for it. Two cases are worth knowing by heart.\n\n**Two reflections in perpendicular mirrors give a rotation of $180^\\circ$ about the point where the mirrors cross.** $y = x$ and $y = -x$ are perpendicular and cross at the origin, so reflecting in one and then the other is a half turn about $(0, 0)$. A half turn needs no direction: clockwise and anticlockwise land in the same place.",
  },
  fig(
    "A coordinate grid from -8 to 8 with both dashed diagonals, y = x and y = -x, drawn through the origin O. Triangle C has vertices at (2, 5), (2, 7) and (5, 5). Its reflection in y = x, shown dashed and labelled C dash, has vertices at (5, 2), (7, 2) and (5, 5). Reflecting C dash in y = -x gives C double dash at (-2, -5), (-2, -7) and (-5, -5). A dashed segment from (2, 7) through the origin to (-2, -7) shows the half turn.",
    f5,
    "Reflect in y = x, then in y = -x: the result is a rotation of 180 degrees about the origin.",
  ),
  {
    type: "gate",
    id: "g10",
    kind: "choice",
    prompt: "A shape is reflected in the $x$-axis and then in the $y$-axis. The single transformation is",
    options: [
      "a rotation of $180^\\circ$ about the origin",
      "a reflection in the line $y = x$",
      "a translation",
    ],
    answer: "a rotation of $180^\\circ$ about the origin",
    explain: "The two axes are perpendicular and cross at the origin, so the pair is a half turn about $(0, 0)$. Two reflections never leave you with another reflection.",
  },
  {
    type: "p",
    md: "**Two reflections in parallel mirrors give a translation**, perpendicular to the mirrors, of **twice** the gap between them. Below, the mirrors $x = -5$ and $x = -1$ are 4 apart, so P ends up 8 to the right — not 4. The doubling is the part that gets forgotten.",
  },
  fig(
    "A coordinate grid from -8 to 8 with two dashed vertical mirror lines, x = -5 and x = -1. Triangle P has vertices at (-8, 2), (-6, 2) and (-8, 6). Reflecting in x = -5 gives the dashed triangle P dash at (-2, 2), (-4, 2) and (-2, 6). Reflecting that in x = -1 gives P double dash at (0, 2), (2, 2) and (0, 6). An arrow across the top of the grid is labelled 8 right.",
    f6,
    "Mirrors 4 apart, so the single transformation is a translation of 8 to the right.",
  ),
  {
    type: "gate",
    id: "g11",
    kind: "number",
    prompt: "A shape is reflected in $x = 2$ and then in $x = 7$. It ends up translated how many units to the right?",
    answer: "10",
    explain: "The mirrors are 5 apart and the translation is twice the gap: $2 \\times 5 = 10$ to the right. Reflecting in the far mirror first would give 10 to the left instead.",
  },
  { type: "h", text: "Describing: every detail, or no mark" },
  {
    type: "p",
    md: "*Describe fully the single transformation…* is a 2- or 3-mark instruction with a checklist behind it, and the marks are handed out one per item on the list. Give the name and nothing else and you have one of three.",
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "The four checklists",
    md: "**Reflection** — the word *reflection*, and the **equation of the mirror line** ($y = x$, not \"the diagonal\"). [2 marks]\n**Rotation** — the word *rotation*, the **angle**, the **direction** (unless it is $180^\\circ$), and the **centre** as a coordinate pair. [3 marks]\n**Translation** — the word *translation* and the **column vector**. [2 marks]\n**Enlargement** — the word *enlargement*, the **scale factor** (with its sign), and the **centre**. [3 marks]\nAnd one rule over all four: **the question says single, so write one transformation.** A description made of two transformations joined by \"then\" scores zero, however well it describes the picture.",
  },
  {
    type: "gate",
    id: "g12",
    kind: "choice",
    prompt: "Which of these earns all three marks?",
    options: [
      "Rotation, $90^\\circ$ clockwise, about $(2, -1)$",
      "Turned $90^\\circ$ about $(2, -1)$",
      "Rotation of $90^\\circ$ about the centre",
      "Reflection in $y = x$ then a translation",
    ],
    answer: "Rotation, $90^\\circ$ clockwise, about $(2, -1)$",
    explain: "Name, angle, direction, centre. \"Turned\" is not the word *rotation* and loses the naming mark; \"about the centre\" names no point; and the last one describes two transformations when the question asked for one.",
  },
  {
    type: "p",
    md: "**Finding the centre of a rotation.** Join a vertex to its image and construct the perpendicular bisector of that join. Do it again for a second vertex. The centre is where the two bisectors cross — it is the only point that is the same distance from each vertex as it is from that vertex's image. On a grid you can usually spot the crossing point by eye once the two bisectors are drawn.",
  },
  fig(
    "A coordinate grid from -8 to 8. Triangle R has vertices at (1, 1), (4, 1) and (1, 3). Triangle R dash has vertices at (0, 4), (0, 7) and (-2, 4). Dashed segments join (1, 1) to (0, 4) and (4, 1) to (0, 7). Two dotted lines, the perpendicular bisectors of those joins, cross at the point (-1, 2), which is ringed and labelled as the centre.",
    f7,
    "The perpendicular bisectors of two vertex joins meet at the centre of rotation, (-1, 2).",
  ),
  {
    type: "gate",
    id: "g13",
    kind: "choice",
    prompt: "In the figure above, R is mapped onto R'. The full description is",
    options: [
      "Rotation, $90^\\circ$ anticlockwise, about $(-1, 2)$",
      "Rotation, $90^\\circ$ clockwise, about $(-1, 2)$",
      "Rotation, $90^\\circ$ anticlockwise, about the origin",
    ],
    answer: "Rotation, $90^\\circ$ anticlockwise, about $(-1, 2)$",
    explain: "The long side of R points to the right; on R' it points upwards, which is a quarter turn anticlockwise. Writing $270^\\circ$ clockwise instead would also be accepted, because it is the same turn.",
  },
  {
    type: "p",
    md: "**Finding the centre of an enlargement.** Join each vertex of the image to the matching vertex of the object and extend the lines. All of them meet at the centre. The scale factor is the image length divided by the object length, using a pair of matching sides — and if the image is the smaller shape, that fraction is less than 1, which is exactly what a fractional scale factor means.",
  },
  fig(
    "A coordinate grid from -8 to 8. Triangle S has vertices at (-4, 2), (-4, 8) and (2, 2). The smaller triangle S dash has vertices at (0, 0), (0, 2) and (2, 0). Three dotted rays start at the ringed point (2, -1), pass through the vertices of S dash and continue to the matching vertices of S.",
    f8,
    "Join each vertex to its image and extend: the rays meet at the centre (2, -1), and S' is one third the size of S.",
  ),
  {
    type: "gate",
    id: "g14",
    kind: "blank",
    prompt: "In the figure above, the vertical side of S is 6 units and the vertical side of S' is 2 units. The scale factor is",
    answer: "1/3 | 0.333 | 0.3333 | one third | a third",
    explain: "Image over object: $\\tfrac{2}{6} = \\tfrac{1}{3}$. Writing 3 describes the enlargement the other way round, from the small shape to the big one, and loses the mark.",
  },
  fig(
    "A coordinate grid from -8 to 8. Triangle K has vertices at (-2, -2), (4, -2) and (-2, 4). Three dotted rays run from the ringed point (-5, -5) through the vertices of the smaller triangle K dash at (-4, -4), (-2, -4) and (-4, -2), and on to the vertices of K.",
    f11,
    "Scale factor one third about (-5, -5): each image vertex sits one third of the way out along its ray.",
  ),
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025, M8 Paper 2 Q9",
    md: "Candidates recognised that the transformation was an enlargement, but only a minority gave **both** the centre and the scale factor correctly. In November 2024 on M7 Paper 2 the same pattern: the word was right, the scale factor was often wrong, and few found the centre. The centre is the one part you can construct rather than guess — join the corresponding vertices and extend.",
    source: "ccea-cer:maths:2025-summer:M82:Q9",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2024, M7 Paper 1 Q12",
    md: "Two ways of losing this one. Describing a combination when the question said *single transformation* scored zero. And \"turn\" was written where *rotate* was wanted, alongside missing directions and missing centres. Both are wording, not mathematics, which makes them the cheapest marks on the paper to protect.",
    source: "ccea-cer:maths:2024-summer:M71:Q12",
  },
  fig(
    "A coordinate grid from -8 to 8. Triangle M has vertices at (-7, 3), (-5, 3) and (-7, 6). Triangle M dash has vertices at (-2, -4), (0, -4) and (-2, -1). A solid arrow runs from (-7, 3) to (-2, -4) and is labelled 5 right, 7 down.",
    f10,
    "A translation is described by its column vector: 5 across and 7 down.",
  ),
  {
    type: "gate",
    id: "g15",
    kind: "choice",
    prompt: "How should the translation in the figure above be written?",
    options: [
      "A translation by the column vector with 5 on top and $-7$ underneath",
      "A translation to $(-2, -4)$",
      "A translation of 5 and 7",
    ],
    answer: "A translation by the column vector with 5 on top and $-7$ underneath",
    explain: "The top number is the movement across and the bottom number is the movement up, so down is negative. A coordinate pair names a place, not a movement, and \"5 and 7\" says nothing about direction.",
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Not on this specification",
    md: "Rotations are limited to $90^\\circ$ either way and $180^\\circ$, so you will never be asked for $30^\\circ$ or $45^\\circ$. Matrices are not used for transformations anywhere in this course. Negative scale factors belong to M8 and are not part of these two statements, and invariant points and glide reflections are not on the specification at all. What you do need is everything from M5 and M6 — reflections in the axes and in lines like $x = 3$, rotations about any point, translations by a column vector — because a combined question is built out of them.",
  },
  {
    type: "gate",
    id: "g16",
    kind: "choice",
    prompt: "Which of these could be asked in an M7 or M8 combined-transformation question?",
    options: [
      "A rotation of $180^\\circ$ about $(2, 1)$",
      "A rotation of $45^\\circ$ about the origin",
      "A transformation given as a 2 by 2 matrix",
    ],
    answer: "A rotation of $180^\\circ$ about $(2, 1)$",
    explain: "The Teacher Guidance limits rotations to a quarter turn either way and a half turn, about any point. Angles like $45^\\circ$ and matrix transformations are not on this specification, so you never have to prepare for them.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "M7 and M8 each have a Paper 1 (no calculator) and a Paper 2 (calculator), 50 marks in 75 minutes, and no part of this topic needs a calculator on either. The wording barely changes from year to year: *Draw the image of the triangle after a reflection in the line $y = x$, followed by an enlargement of scale factor $\\tfrac{1}{2}$ with centre $(a, b)$*, or *Describe fully the single transformation that maps A to B.*\n\nThe first mark is the first image, drawn and left alone. The last mark is the final image in exactly the right place, or the last item on the description checklist. If you stall, draw the mirror line, reflect one vertex and write its coordinates down — a partly correct image is marked positively, and a blank grid is not.",
  },
  {
    type: "gate",
    id: "g17",
    kind: "choice",
    prompt: "You have drawn the middle image and you are running out of time. What do you do with it?",
    options: [
      "Leave it on the grid and label it",
      "Rub it out so only the final answer is showing",
      "Cross it out neatly",
    ],
    answer: "Leave it on the grid and label it",
    explain: "It is worth marks in its own right — typically two of the four. The reports record candidates erasing a correct first image and losing those marks. Crossed-out work is still marked, but there is no reason to cross out something correct.",
  },
  {
    type: "callout",
    kind: "why",
    title: "A ten-second check",
    md: "After a reflection in $y = x$, every image coordinate should be a swapped copy of an object coordinate: $(4, 1)$ goes to $(1, 4)$, and the two lists should match up pair for pair. After a reflection in $y = -x$, the same check with both signs changed. After an enlargement, count the distances: each image vertex should be $k$ times as far from the centre as its object vertex, measured across and up separately. Three checks, ten seconds, and they catch almost every slip this topic produces.",
  },
  { type: "prompt", promptId: "rp.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.01" },
  { type: "prompt", promptId: "rp.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.03" },
  { type: "prompt", promptId: "rp.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.06" },
  { type: "prompt", promptId: "rp.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.08" },
  { type: "prompt", promptId: "rp.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.11" },
];
