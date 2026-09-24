/** maths.m3.straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines — H bundle (difficulty 4). */
import fs from "node:fs";
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, round, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines";
const SLUG = "straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines";
const REF = ["M3-NA-12", "M3-NA-13", "M3-NA-14"];
const MX = ["M3-NA-12"], EQ = ["M3-NA-13"], PAR = ["M3-NA-14"];
const insight = JSON.parse(fs.readFileSync(`packs/maths/insights/m3.${SLUG}.json`, "utf8"));

// ---------------------------------------------------------------- recomputed numbers
const grad = (p, q) => round((q[1] - p[1]) / (q[0] - p[0]), 10);
const inter = (p, m) => round(p[1] - m * p[0], 10);
const line = (p, q) => { const m = grad(p, q); return { m, c: inter(p, m) }; };
const mid = (p, q) => [round((p[0] + q[0]) / 2, 10), round((p[1] + q[1]) / 2, 10)];
const on = (m, c, x) => round(m * x + c, 10);

const L = {
  A: line([2, 1], [6, 13]),          // y = 3x - 5
  B: line([0, 5], [4, -7]),          // y = -3x + 5
  C: line([-2, 9], [3, -1]),         // y = -2x + 5
  D: line([1, 2], [5, 14]),          // y = 3x - 1
  E: line([-3, -7], [1, 5]),         // y = 3x + 2
  F: line([0, -4], [5, 11]),         // y = 3x - 4
  G: line([2, 7], [8, 4]),           // y = -0.5x + 8
  H: line([-4, 6], [2, -6]),         // y = -2x - 2
};
expect("A m", L.A.m, 3); expect("A c", L.A.c, -5); expect("A at 6", on(L.A.m, L.A.c, 6), 13);
expect("B m", L.B.m, -3); expect("B c", L.B.c, 5); expect("B at 4", on(L.B.m, L.B.c, 4), -7);
expect("C m", L.C.m, -2); expect("C c", L.C.c, 5); expect("C at 3", on(L.C.m, L.C.c, 3), -1);
expect("D m", L.D.m, 3); expect("D c", L.D.c, -1); expect("D at 5", on(L.D.m, L.D.c, 5), 14);
expect("E m", L.E.m, 3); expect("E c", L.E.c, 2); expect("E at 1", on(L.E.m, L.E.c, 1), 5);
expect("F m", L.F.m, 3); expect("F c", L.F.c, -4); expect("F at 5", on(L.F.m, L.F.c, 5), 11);
expect("G m", L.G.m, -0.5); expect("G c", L.G.c, 8); expect("G at 8", on(L.G.m, L.G.c, 8), 4);
expect("H m", L.H.m, -2); expect("H c", L.H.c, -2); expect("H at 2", on(L.H.m, L.H.c, 2), -6);
expect("midpoint A trap", JSON.stringify(mid([2, 1], [6, 13])), JSON.stringify([4, 7]));
// point + gradient
expect("through (4,-3) m=2 c", inter([4, -3], 2), -11);
expect("through (-1,6) m=-4 c", inter([-1, 6], -4), 2);
expect("parallel to y=4x-1 through (2,11)", inter([2, 11], 4), 3);
expect("parallel to 2y=6x+5 through (1,4)", inter([1, 4], 3), 1);
expect("parallel to y=3-2x through (5,1)", inter([5, 1], -2), 11);
// rearranging
expect("3x+4y=24 gradient", round(-3 / 4, 10), -0.75);
expect("3x+4y=24 y-intercept", 24 / 4, 6);
expect("3x+4y=24 x-intercept", 24 / 3, 8);
expect("2x+3y=12 y-intercept", 12 / 3, 4);
expect("2x+3y=12 x-intercept", 12 / 2, 6);
expect("2x+3y=12 gradient", round(-2 / 3, 10), round(-2 / 3, 10));
expect("5y-2x=15 gradient", round(2 / 5, 10), 0.4);
expect("5y-2x=15 intercept", 15 / 5, 3);
// real-life graph
expect("hire gradient", (85 - 25) / 5, 12);
expect("hire at 5 days", 12 * 5 + 25, 85);
expect("hire at 3 days", 12 * 3 + 25, 61);
expect("square-count trap", (85 - 25) / 20 / (5 / 1), 0.6);
assertNoFailures("t9 numbers");

// ---------------------------------------------------------------- figures
// Grid mapping for figure 1: x from -1 to 8 (50 px per unit), y from -8 to 16 (14 px per unit)
const X1 = (x) => round(60 + (x + 1) * 50, 2);
const Y1 = (y) => round(40 + (16 - y) * 14, 2);
const axesBody = `
<g stroke='currentColor' stroke-width='0.6' stroke-opacity='0.35' fill='none'>
  ${[-1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((x) => `<path d='M${X1(x)} 40 L${X1(x)} 376'/>`).join("")}
  ${[-5, 0, 5, 10, 15].map((y) => `<path d='M60 ${Y1(y)} L510 ${Y1(y)}'/>`).join("")}
</g>
<g stroke='currentColor' stroke-width='1.6' fill='none'>
  <path d='M60 ${Y1(0)} L510 ${Y1(0)}'/>
  <path d='M${X1(0)} 40 L${X1(0)} 376'/>
</g>
<g stroke='currentColor' stroke-width='2.2' fill='none'>
  <path d='M${X1(-0.5)} ${Y1(-6.5)} L${X1(7)} ${Y1(16)}'/>
</g>
<g stroke='currentColor' stroke-width='1.4' stroke-dasharray='5 4' fill='none'>
  <path d='M${X1(2)} ${Y1(1)} L${X1(6)} ${Y1(1)} L${X1(6)} ${Y1(13)}'/>
</g>
<g fill='currentColor' stroke='none'>
  <circle cx='${X1(2)}' cy='${Y1(1)}' r='4.5'/>
  <circle cx='${X1(6)}' cy='${Y1(13)}' r='4.5'/>
  <circle cx='${X1(0)}' cy='${Y1(-5)}' r='4.5'/>
</g>
<g ${TXT} font-size='15'>
  <text x='${X1(2) - 46}' y='${Y1(1) + 5}'>(2, 1)</text>
  <text x='${X1(6) + 10}' y='${Y1(13) + 5}'>(6, 13)</text>
  <text x='${X1(0) + 10}' y='${Y1(-5) + 18}'>(0, -5)</text>
  <text x='${X1(4) - 24}' y='${Y1(1) + 22}'>run 4</text>
  <text x='${X1(6) + 10}' y='${Y1(7)}'>rise 12</text>
  <text x='58' y='400'>gradient = rise / run = 12 / 4 = 3, and the line crosses the y-axis at -5, so y = 3x - 5</text>
  <text x='${X1(8) - 6}' y='${Y1(0) + 20}'>x</text>
  <text x='${X1(0) + 8}' y='52'>y</text>
</g>`;
const axesAlt =
  "Coordinate axes with a straight line rising from lower left to upper right through (2, 1) and (6, 13) and crossing the y-axis at (0, -5). A dashed right-angled triangle joins the two points, with the horizontal side labelled run 4 and the vertical side labelled rise 12. A caption gives gradient = 12 over 4 = 3 and the equation y = 3x - 5.";
const axesFig = svgFig(axesBody, axesAlt, 540, 416);

// Figure 2: parallel lines. x from -1 to 6 (55 px), y from -4 to 12 (20 px)
const X2 = (x) => round(60 + (x + 1) * 55, 2);
const Y2 = (y) => round(30 + (12 - y) * 20, 2);
const parallelBody = `
<g stroke='currentColor' stroke-width='0.6' stroke-opacity='0.35' fill='none'>
  ${[-1, 0, 1, 2, 3, 4, 5, 6].map((x) => `<path d='M${X2(x)} 30 L${X2(x)} 350'/>`).join("")}
  ${[-4, 0, 4, 8, 12].map((y) => `<path d='M60 ${Y2(y)} L445 ${Y2(y)}'/>`).join("")}
</g>
<g stroke='currentColor' stroke-width='1.6' fill='none'>
  <path d='M60 ${Y2(0)} L445 ${Y2(0)}'/>
  <path d='M${X2(0)} 30 L${X2(0)} 350'/>
</g>
<g stroke='currentColor' stroke-width='2.2' fill='none'>
  <path d='M${X2(-1)} ${Y2(-1)} L${X2(5.5)} ${Y2(12)}'/>
  <path d='M${X2(0.5)} ${Y2(-2)} L${X2(6)} ${Y2(9)}'/>
</g>
<g ${TXT} font-size='15'>
  <text x='${X2(3) - 76}' y='${Y2(8) - 8}'>y = 2x + 1</text>
  <text x='${X2(5) - 30}' y='${Y2(5) + 20}'>y = 2x - 3</text>
  <text x='58' y='386'>same gradient, different intercept: the lines never meet</text>
</g>`;
const parallelAlt =
  "Coordinate axes with two parallel straight lines of gradient 2, one labelled y = 2x + 1 and the other y = 2x - 3. A caption says: same gradient, different intercept, so the lines never meet.";
const parallelFig = svgFig(parallelBody, parallelAlt, 470, 400);

// Figure 3: real-life graph with awkward scales. x days 0-5 (68 px), y cost 0-100 in 20s (3 px per pound)
const X3 = (d) => round(80 + d * 68, 2);
const Y3 = (c) => round(340 - c * 2.8, 2);
const hireBody = `
<g stroke='currentColor' stroke-width='0.6' stroke-opacity='0.35' fill='none'>
  ${[0, 1, 2, 3, 4, 5].map((d) => `<path d='M${X3(d)} ${Y3(100)} L${X3(d)} ${Y3(0)}'/>`).join("")}
  ${[0, 20, 40, 60, 80, 100].map((c) => `<path d='M${X3(0)} ${Y3(c)} L${X3(5)} ${Y3(c)}'/>`).join("")}
</g>
<g stroke='currentColor' stroke-width='1.6' fill='none'>
  <path d='M${X3(0)} ${Y3(0)} L${X3(5)} ${Y3(0)}'/>
  <path d='M${X3(0)} ${Y3(0)} L${X3(0)} ${Y3(100)}'/>
</g>
<g stroke='currentColor' stroke-width='2.2' fill='none'>
  <path d='M${X3(0)} ${Y3(25)} L${X3(5)} ${Y3(85)}'/>
</g>
<g stroke='currentColor' stroke-width='1.3' stroke-dasharray='5 4' fill='none'>
  <path d='M${X3(1)} ${Y3(37)} L${X3(4)} ${Y3(37)} L${X3(4)} ${Y3(73)}'/>
</g>
<g fill='currentColor' stroke='none'>
  <circle cx='${X3(0)}' cy='${Y3(25)}' r='4'/>
</g>
<g ${TXT} font-size='14' text-anchor='middle'>
  ${[0, 1, 2, 3, 4, 5].map((d) => `<text x='${X3(d)}' y='${Y3(0) + 20}'>${d}</text>`).join("")}
  <text x='${X3(2.5)}' y='${Y3(0) + 44}'>days hired</text>
</g>
<g ${TXT} font-size='14' text-anchor='end'>
  ${[0, 20, 40, 60, 80, 100].map((c) => `<text x='${X3(0) - 8}' y='${Y3(c) + 5}'>${c}</text>`).join("")}
</g>
<g ${TXT} font-size='14'>
  <text x='${X3(0) - 58}' y='${Y3(100) - 14}'>cost (pounds)</text>
  <text x='${X3(2.5) - 20}' y='${Y3(37) + 20}'>3 days</text>
  <text x='${X3(4) + 8}' y='${Y3(55)}'>36 pounds</text>
  <text x='${X3(0) + 10}' y='${Y3(25) - 10}'>fixed charge 25</text>
  <text x='30' y='386'>gradient = 36 / 3 = 12 pounds per day, read with the scales - not by counting squares</text>
</g>`;
const hireAlt =
  "A real-life straight-line graph of hire cost in pounds against days hired. The line starts at 25 pounds when no days are hired and reaches 85 pounds at 5 days. A dashed triangle spans 3 days horizontally and 36 pounds vertically, and a caption gives gradient = 36 over 3 = 12 pounds per day, read with the scales rather than by counting squares.";
const hireFig = svgFig(hireBody, hireAlt, 560, 400);

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statements M3-NA-12 (y = mx + c, m and c), M3-NA-13 (equation through two points, or one point and a gradient) and M3-NA-14 (parallel lines). Perpendicular gradients are M4 and are named only as a contrast; so is the equation of a circle and its tangent.",
  formula: "Nothing on the Higher formula sheet applies. The gradient formula and 'parallel means equal gradients' are must-know.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Find, Write down, Calculate, Draw, Explain, Express, Use).",
  tariff: "Tariffs match the corpus: 'Find the equation of the straight line through two points' is 3 marks (Summer 2025 M3 Q16(b), November 2025 M3 Q31); 'Write down the equation of any line parallel to …' is 1 mark (November 2022 M3); a parallel line through a given point runs to 4 marks (November 2022 M3 Q25); reading and interpreting a real-life gradient is 3-4 marks.",
  copy: "Compared by hand against the M3 papers and schemes read for this batch (Summer 2025 Q16, November 2025 Q31, Summer 2023 Q22, November 2022 Q25): every pair of coordinates, every line and every context here is new; no eight-word sequence in common.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T, specRefs: EQ, paper: M3,
    stem: "Find the equation of the straight line passing through the points $(2, 1)$ and $(6, 13)$. Give your answer in the form $y = mx + c$.",
    figure: axesFig,
    steps: [
      {
        n: 1,
        working: "$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{13 - 1}{6 - 2} = \\dfrac{12}{4} = 3$",
        decision: "Change in $y$ **on top**, change in $x$ underneath. Take the two coordinates in the same order in both differences, so the signs look after themselves.",
        whyMenu: {
          options: [
            "Gradient is how much $y$ changes for each 1 that $x$ changes, so the $y$ difference is divided by the $x$ difference",
            "Gradient is the $x$ difference divided by the $y$ difference",
            "Gradient is the difference of the two $y$ values",
          ],
          correct: 0,
          explain: "Steepness is rise per unit of run, so the rise goes on top.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "Substitute $(2, 1)$ into $y = 3x + c$: $1 = 3(2) + c$",
        decision: "Either point works. Putting the numbers in and solving for $c$ is quicker and safer than reading the intercept off a sketch.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$1 = 6 + c$, so $c = -5$",
        decision: "One line of arithmetic. A negative intercept is perfectly normal, and the picture confirms it: the line crosses the $y$-axis below the origin.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$y = 3x - 5$. Check with the other point: $3(6) - 5 = 13$.",
        decision: "The question asked for an **equation**, so the answer is the whole thing, $y = 3x - 5$. Checking with the second point costs five seconds and catches a sign slip.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$y = 3x - 5$",
    twin: {
      stem: "Find the equation of the straight line through $(1, 2)$ and $(5, 14)$, in the form $y = mx + c$.",
      answer: algAnswer("y = 3x - 1", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T, specRefs: EQ, paper: M3,
    stem: "Find the equation of the straight line through $(-2, 9)$ and $(3, -1)$.",
    steps: [
      {
        n: 1,
        working: "$m = \\dfrac{-1 - 9}{3 - (-2)} = \\dfrac{-10}{5} = -2$",
        decision: "The $y$ values fall as $x$ rises, so the gradient must come out negative. Notice $3 - (-2) = 5$: subtracting a negative adds.",
        whyMenu: {
          options: [
            "A line that goes downhill from left to right has a negative gradient",
            "A gradient is never negative; the minus sign is dropped",
            "The gradient is negative only if both coordinates are negative",
          ],
          correct: 0,
          explain: "Going from $x = -2$ to $x = 3$, the $y$ value drops from 9 to $-1$, so the change in $y$ is negative.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "Substitute $(3, -1)$: $-1 = -2(3) + c$, so $-1 = -6 + c$",
        decision: "The tidier of the two points is usually the one with smaller numbers; either is acceptable.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$c = 5$, so $y = -2x + 5$",
        decision: "Check with the other point: $-2(-2) + 5 = 4 + 5 = 9$. Correct.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$y = -2x + 5$",
    twin: {
      stem: "Find the equation of the straight line through $(-4, 6)$ and $(2, -6)$.",
      answer: algAnswer("y = -2x - 2", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3] }, { showSteps: 0, studentSupplies: [1, 2, 3] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
  {
    id: `we.${T}.03`,
    topic: T, specRefs: PAR, paper: M3,
    stem: "Find the equation of the line that is parallel to $2y = 6x + 5$ and passes through the point $(1, 4)$.",
    figure: parallelFig,
    steps: [
      {
        n: 1,
        working: "Rearrange into $y = mx + c$: $y = 3x + 2.5$, so the gradient of the given line is 3.",
        decision: "You cannot read $m$ off $2y = 6x + 5$ as it stands: the 6 belongs to a $2y$, not a $y$. Divide every term by 2 first.",
        whyMenu: {
          options: [
            "Because the gradient is only the coefficient of $x$ once $y$ is by itself",
            "Because the gradient is always the largest number in the equation",
            "Because the gradient of $2y = 6x + 5$ is 6",
          ],
          correct: 0,
          explain: "$2y = 6x + 5$ is the same line as $y = 3x + 2.5$, and its steepness is 3, not 6.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "Parallel lines have equal gradients, so the new line is $y = 3x + c$.",
        decision: "That is the whole content of parallel: same $m$, different $c$. The intercept has to come from the point.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "Substitute $(1, 4)$: $4 = 3(1) + c$, so $c = 1$.",
        decision: "One substitution, one line. The point given is the only thing that distinguishes this line from every other line of gradient 3.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$y = 3x + 1$",
        decision: "Check: at $x = 1$, $y = 4$. The answer is an equation, not just the gradient.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$y = 3x + 1$",
    twin: {
      stem: "Find the equation of the line parallel to $3y = 12x - 7$ that passes through $(2, 11)$.",
      answer: algAnswer("y = 4x + 3", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.03`,
    version: 1,
  },
  {
    id: `we.${T}.04`,
    topic: T, specRefs: MX, paper: M3,
    stem: "A firm hires out equipment. The graph shows the total cost, in pounds, against the number of days hired.\n\nFind the gradient of the line, say what it means, and write down an equation connecting the cost $C$ and the number of days $d$.",
    figure: hireFig,
    steps: [
      {
        n: 1,
        working: "Pick two points that sit on grid intersections and are far apart: $(1, 37)$ and $(4, 73)$.",
        decision: "Far apart keeps the reading error small, and grid intersections keep the values exact. Choosing awkward points is where accuracy is lost.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$m = \\dfrac{73 - 37}{4 - 1} = \\dfrac{36}{3} = 12$",
        decision: "Use the **values on the axes**, not the number of squares. One square across is 1 day but one square up is 20 pounds, so counting squares would give a completely different number.",
        whyMenu: {
          options: [
            "Because the two axes have different scales, so a square is not the same amount on each",
            "Because counting squares is always wrong",
            "Because the graph is not drawn accurately",
          ],
          correct: 0,
          explain: "Squares only work as a shortcut when both axes go up in the same steps, which they rarely do in a real-life graph.",
        },
        earns: ["A1"],
      },
      {
        n: 3,
        working: "The gradient means the cost rises by 12 pounds for each extra day of hire.",
        decision: "An interpretation needs the **units of both axes**: pounds per day. 'It goes up by 12' is not enough.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "The line meets the cost axis at 25, so $C = 12d + 25$.",
        decision: "The intercept is the fixed charge, paid before any days are counted. Reading it straight off the axis is quicker than substituting.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "Gradient 12, meaning £12 per day; $C = 12d + 25$",
    twin: {
      stem: "A different firm charges a fixed £18 plus £9 per day, so $C = 9d + 18$. Work out the cost of a 4-day hire.",
      answer: numAnswer(54, { unit: "pounds", unitRequired: false }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.04`,
    version: 1,
  },
];
expect("hire at 1 day", 12 * 1 + 25, 37);
expect("hire at 4 days", 12 * 4 + 25, 73);
expect("twin hire 4 days", 9 * 4 + 18, 54);
expect("twin parallel 3y=12x-7", inter([2, 11], 4), 3);
assertNoFailures("t9 worked examples");

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`, topic: T, specRefs: REF, when: "pre",
    items: [
      dxItem("01", "In $y = mx + c$, what do $m$ and $c$ stand for?", "Read the two constants of a straight line",
        [
          ["$m$ is the gradient and $c$ is the $y$-intercept", true, null, "$m$ is how much $y$ rises for each 1 that $x$ increases; $c$ is the $y$ value where the line crosses the $y$-axis."],
          ["$m$ is the $y$-intercept and $c$ is the gradient", false, "maths.lines.intercept-not-recognised", "The other way round. The number attached to $x$ controls the steepness."],
          ["$m$ is the midpoint and $c$ is the length", false, "maths.lines.midpoint-instead-of-equation", "Neither. A midpoint is a point; $y = mx + c$ describes a whole line."],
        ], 15),
      dxItem("02", "Find the gradient of the line through $(2, 1)$ and $(6, 13)$.", "Use the gradient formula the right way up",
        [
          ["3", true, null, "$\\dfrac{13 - 1}{6 - 2} = \\dfrac{12}{4} = 3$: change in $y$ on top."],
          ["$\\dfrac{1}{3}$", false, "maths.lines.gradient-inverted", "The differences were divided the wrong way round. Summer 2025 M4 Q2 reported x-differences being put on top of y-differences."],
          ["12", false, "maths.lines.gradient-from-wrong-points", "That is only the change in $y$. It still has to be divided by the change in $x$."],
        ], 25),
      dxItem("03", "A line passes through $(0, 5)$ and $(4, -7)$. What is $c$?", "Recognise a point on the y-axis",
        [
          ["5", true, null, "$x = 0$ means the point is on the $y$-axis, so its $y$ value is the intercept. No substitution is needed."],
          ["$-7$", false, "maths.lines.intercept-not-recognised", "That is the $y$ value at $x = 4$, not at $x = 0$."],
          ["$-1$", false, "maths.lines.midpoint-instead-of-equation", "That is the mean of 5 and $-7$, which is the $y$ value of the midpoint, not the intercept."],
        ], 25),
      dxItem("04", "A line goes downhill from left to right. What do you know about $m$?", "Read the sign of a gradient",
        [
          ["$m$ is negative", true, null, "As $x$ increases, $y$ decreases, so the change in $y$ is negative. November 2025 M3 Q31 reported the negative direction being missed."],
          ["$m$ is positive", false, "maths.lines.gradient-sign-missed", "A positive gradient rises from left to right."],
          ["$m$ is zero", false, "maths.lines.gradient-sign-missed", "A gradient of zero is a horizontal line, which neither rises nor falls."],
        ], 20),
      dxItem("05", "What is the gradient of $2y = 6x + 5$?", "Rearrange before reading the gradient",
        [
          ["3", true, null, "Divide every term by 2: $y = 3x + 2.5$. The gradient is the coefficient of $x$ once $y$ is alone."],
          ["6", false, "maths.lines.gradient-read-without-rearranging", "6 is the coefficient of $x$, but the left side is $2y$, not $y$. The equation has to be in the form $y = mx + c$ first."],
          ["2", false, "maths.lines.gradient-read-without-rearranging", "2 is the coefficient of $y$. Dividing by it is the step that reveals the gradient."],
        ], 30),
      dxItem("06", "Which line is parallel to $y = 4x - 1$?", "Use equal gradients",
        [
          ["$y = 4x + 7$", true, null, "Same gradient, different intercept. Parallel lines have equal $m$ and are never the same line."],
          ["$y = -4x - 1$", false, "maths.lines.gradient-sign-missed", "The gradient is $-4$, so that line falls while the first rises: they cross."],
          ["$y = \\tfrac{1}{4}x - 1$", false, "maths.lines.perpendicular-gradient-not-negative-reciprocal", "A reciprocal gradient is not parallel. (The negative reciprocal, $-\\tfrac{1}{4}$, would be perpendicular, which is M4.)"],
        ], 25),
      dxItem("07", "Find the equation of the line through $(2, 1)$ and $(6, 13)$.", "Give an equation, not a point",
        [
          ["$y = 3x - 5$", true, null, "Gradient 3, then substituting a point gives $c = -5$. 'Equation of the line' always means $y = mx + c$."],
          ["$(4, 7)$", false, "maths.lines.midpoint-instead-of-equation", "That is the midpoint of the two points. Summer 2023 M3 Q22 and November 2025 M3 Q31 both reported a midpoint offered where an equation was asked for."],
          ["$m = 3$", false, "maths.lines.equation-not-found-after-gradient", "The gradient is right and it is the method mark, but the answer is not finished until $c$ is found and the equation written."],
        ], 35),
      dxItem("08", "On a real-life graph, one square across is 2 days and one square up is £50. How do you find the gradient?", "Use the scales, not the squares",
        [
          ["Read the actual values at two points and divide the change in cost by the change in days", true, null, "Counting squares assumes both axes step by the same amount, which they do not here."],
          ["Count squares up and divide by squares across", false, "maths.lines.gradient-counting-squares-ignores-scale", "That gives a number with no meaning. Summer 2023 M3 Q14 reported gradients of 23 or 1.5 from square-counting."],
          ["Divide the two values shown on the graph", false, "maths.lines.gradient-counting-squares-ignores-scale", "Dividing one reading by another is not a gradient. A gradient is a change divided by a change."],
        ], 35),
    ],
  },
];

// ---------------------------------------------------------------- questions
const mk = (n, o) => question({ id: `q.${T}.${String(n).padStart(4, "0")}`, topic: T, ...o });

const questions = [
  mk(1, {
    specRefs: MX, style: "practice", difficulty: 1, commandWords: ["Write down"], paper: M7P1,
    setting: "Pure algebra, reading m and c",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q16"],
    solutionProgram: "y = 5x - 2 has m = 5 and c = -2; y = 7 - 3x rearranges to y = -3x + 7 so m = -3 and c = 7",
    parts: [
      {
        id: "a", verb: "write-down", marks: 1,
        stem: "Write down the gradient of the line $y = 5x - 2$.",
        answer: numAnswer(5),
        scheme: [A("A1", 1, "5")],
        hints: ["The gradient is the number multiplying $x$."],
        workedSolution: "In $y = mx + c$, $m$ is the coefficient of $x$, so the gradient is 5.",
        commonErrors: [{
          misconception: "maths.lines.intercept-not-recognised",
          pattern: { kind: "numeric" },
          feedback: "$-2$ is the $y$-intercept. The gradient is the number attached to $x$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q16",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "write-down", marks: 1,
        stem: "Write down the gradient of the line $y = 7 - 3x$.",
        answer: numAnswer(-3),
        scheme: [A("A1", 1, "−3")],
        hints: ["Rewrite it as $y = -3x + 7$ first.", "The minus sign belongs to the gradient."],
        workedSolution: "$y = 7 - 3x$ is $y = -3x + 7$, so the gradient is $-3$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-sign-missed",
          pattern: { kind: "numeric" },
          feedback: "The minus sign was left behind. Written as $y = -3x + 7$, the coefficient of $x$ is $-3$, and the line falls from left to right.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        }],
        requiresWorking: false,
      },
      {
        id: "c", verb: "write-down", marks: 1,
        stem: "Write down the coordinates of the point where $y = 7 - 3x$ crosses the $y$-axis.",
        answer: textAnswer(["(0, 7)", "0, 7"], [{ any: ["0, 7", "(0, 7)"], marks: 1 }]),
        scheme: [A("A1", 1, "(0, 7)")],
        hints: ["On the $y$-axis, $x = 0$."],
        workedSolution: "Putting $x = 0$ gives $y = 7$, so the line crosses at $(0, 7)$.",
        commonErrors: [{
          misconception: "maths.lines.intercept-not-recognised",
          pattern: { kind: "text", regex: "\\(\\s*0\\s*,\\s*-\\s*3\\s*\\)|^\\s*-\\s*3\\s*$" },
          feedback: "$-3$ is the gradient. The $y$-intercept is the constant, and it is the $y$ value when $x = 0$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M4:Q11",
        }],
        requiresWorking: false,
      },
    ],
  }),
  mk(2, {
    specRefs: EQ, style: "practice", difficulty: 2, commandWords: ["Find"],
    setting: "Pure coordinate geometry, two points with positive gradient",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q2"],
    solutionProgram: "through (2,1) and (6,13): m = (13-1)/(6-2) = 3; 1 = 3(2) + c so c = -5; y = 3x - 5; check 3(6) - 5 = 13",
    figures: [axesFig],
    parts: [{
      id: "main", verb: "find", marks: 3,
      stem: "Find the equation of the straight line passing through the points $(2, 1)$ and $(6, 13)$.\n\nGive your answer in the form $y = mx + c$.",
      answer: algAnswer("y = 3x - 5", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "gradient formula used: (13 − 1)/(6 − 2)"),
        A("A1", 1, "m = 3", { dependsOn: ["M1"] }),
        MA("MA1", 1, "c = −5 and the equation y = 3x − 5 written", { ft: true }),
      ],
      hints: ["Gradient is change in $y$ over change in $x$.", "$\\dfrac{12}{4} = 3$.", "Substitute one of the points into $y = 3x + c$."],
      workedSolution: "$m = \\dfrac{13 - 1}{6 - 2} = 3$. Substituting $(2, 1)$: $1 = 6 + c$, so $c = -5$ and $y = 3x - 5$. Check at $(6, 13)$: $18 - 5 = 13$.",
      commonErrors: [
        {
          misconception: "maths.lines.midpoint-instead-of-equation",
          pattern: { kind: "text", regex: "\\(\\s*4\\s*,\\s*7\\s*\\)" },
          feedback: "$(4, 7)$ is the midpoint of the two points. 'Equation of the line' asks for $y = mx + c$, not a point. This substitution was reported in Summer 2023 M3 Q22 and again in November 2025 M3 Q31.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M3:Q22",
        },
        {
          misconception: "maths.lines.equation-not-found-after-gradient",
          pattern: { kind: "text", regex: "^\\s*(m\\s*=\\s*)?3\\s*$" },
          feedback: "The gradient is right, and that is the first two marks. The last mark is for finding $c$ and writing the whole equation.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(3, {
    specRefs: EQ, style: "practice", difficulty: 3, commandWords: ["Find"],
    setting: "Pure coordinate geometry, negative gradient",
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q31"],
    solutionProgram: "through (-2,9) and (3,-1): m = (-1-9)/(3-(-2)) = -10/5 = -2; -1 = -2(3) + c so c = 5; y = -2x + 5; check -2(-2) + 5 = 9 | through (-4,6) and (2,-6): m = -12/6 = -2, c = -2, y = -2x - 2; check -2(2) - 2 = -6",
    parts: [
      {
        id: "a", verb: "find", marks: 3,
        stem: "Find the equation of the straight line through $(-2, 9)$ and $(3, -1)$.",
        answer: algAnswer("y = -2x + 5", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "(−1 − 9)/(3 − (−2)) or equivalent"),
          A("A1", 1, "m = −2", { dependsOn: ["M1"] }),
          MA("MA1", 1, "c = 5 and y = −2x + 5", { ft: true }),
        ],
        hints: ["Take both differences in the same order.", "$3 - (-2) = 5$.", "The $y$ values fall, so the gradient is negative."],
        workedSolution: "$m = \\dfrac{-1 - 9}{3 - (-2)} = \\dfrac{-10}{5} = -2$. Substituting $(3, -1)$: $-1 = -6 + c$, so $c = 5$ and $y = -2x + 5$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-sign-missed",
          pattern: { kind: "algebraic", latex: "y = 2x + 5" },
          feedback: "The minus was lost. Going from $x = -2$ to $x = 3$, the $y$ value drops from 9 to $-1$, so the change in $y$ is negative and the line goes downhill.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 3,
        stem: "Find the equation of the straight line through $(-4, 6)$ and $(2, -6)$.",
        answer: algAnswer("y = -2x - 2", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "(−6 − 6)/(2 − (−4)) or equivalent"),
          A("A1", 1, "m = −2", { dependsOn: ["M1"] }),
          MA("MA1", 1, "c = −2 and y = −2x − 2", { ft: true }),
        ],
        hints: ["$-6 - 6 = -12$ and $2 - (-4) = 6$.", "Substitute either point."],
        workedSolution: "$m = \\dfrac{-12}{6} = -2$. Substituting $(2, -6)$: $-6 = -4 + c$, so $c = -2$ and $y = -2x - 2$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-inverted",
          pattern: { kind: "algebraic", latex: "y = -0.5x + 4" },
          feedback: "The differences were divided the wrong way round. The change in $y$ goes on top of the change in $x$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q2",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(4, {
    specRefs: EQ, style: "practice", difficulty: 2, commandWords: ["Find"], paper: M7P1,
    setting: "Pure coordinate geometry, one point on the y-axis, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q11"],
    solutionProgram: "through (0,5) and (4,-7): c = 5 read straight off; m = (-7-5)/4 = -3; y = -3x + 5; check -3(4) + 5 = -7",
    parts: [{
      id: "main", verb: "find", marks: 3,
      stem: "A straight line passes through $(0, 5)$ and $(4, -7)$.\n\nFind its equation in the form $y = mx + c$.",
      answer: algAnswer("y = -3x + 5", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "gradient formula used: (−7 − 5)/(4 − 0)"),
        A("A1", 1, "m = −3", { dependsOn: ["M1"] }),
        MA("MA1", 1, "c = 5 read from (0, 5), and y = −3x + 5 written", { ft: true }),
      ],
      hints: ["One of the points has $x = 0$ — what does that tell you immediately?", "$c$ can be read straight off, with no substitution.", "$\\dfrac{-12}{4} = -3$."],
      workedSolution: "$(0, 5)$ lies on the $y$-axis, so $c = 5$ at once.\n$m = \\dfrac{-7 - 5}{4 - 0} = \\dfrac{-12}{4} = -3$, so $y = -3x + 5$. Check: $-3(4) + 5 = -7$.",
      commonErrors: [{
        misconception: "maths.lines.intercept-not-recognised",
        pattern: { kind: "text", regex: "substitut" },
        feedback: "Substituting works, but it is the long way round and it is where slips happen. A point with $x = 0$ gives $c$ directly — Summer 2023 M4 Q11 reported candidates missing that and making mistakes on the detour.",
        marksTypicallyEarned: 2,
        source: "ccea-cer:maths:2023-summer:M4:Q11",
      }],
      requiresWorking: true,
    }],
  }),
  mk(5, {
    specRefs: EQ, style: "practice", difficulty: 2, commandWords: ["Find"],
    setting: "Pure coordinate geometry, one point and a given gradient",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q2"],
    solutionProgram: "through (4,-3) with m = 2: -3 = 8 + c so c = -11, y = 2x - 11; through (-1,6) with m = -4: 6 = 4 + c so c = 2, y = -4x + 2",
    parts: [
      {
        id: "a", verb: "find", marks: 2,
        stem: "Find the equation of the line with gradient 2 that passes through $(4, -3)$.",
        answer: algAnswer("y = 2x - 11", { equivalence: "equivalent" }),
        scheme: [M("M1", 1, "−3 = 2(4) + c"), A("A1", 1, "y = 2x − 11", { dependsOn: ["M1"] })],
        hints: ["Start from $y = 2x + c$.", "Put the point in and solve for $c$."],
        workedSolution: "$-3 = 2(4) + c$, so $-3 = 8 + c$ and $c = -11$. The line is $y = 2x - 11$.",
        commonErrors: [{
          misconception: "maths.lines.equation-not-found-after-gradient",
          pattern: { kind: "numeric" },
          feedback: "$c = -11$ is right, and it earns the method mark. The question asks for the equation, so the answer line needs $y = 2x - 11$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 2,
        stem: "Find the equation of the line with gradient $-4$ that passes through $(-1, 6)$.",
        answer: algAnswer("y = -4x + 2", { equivalence: "equivalent" }),
        scheme: [M("M1", 1, "6 = −4(−1) + c"), A("A1", 1, "y = −4x + 2", { dependsOn: ["M1"] })],
        hints: ["$-4 \\times -1 = +4$.", "$6 = 4 + c$."],
        workedSolution: "$6 = -4(-1) + c = 4 + c$, so $c = 2$ and the line is $y = -4x + 2$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-sign-missed",
          pattern: { kind: "algebraic", latex: "y = -4x + 10" },
          feedback: "$-4 \\times -1$ is $+4$, not $-4$. Two negatives multiplied give a positive, so $c = 2$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(6, {
    specRefs: PAR, style: "practice", difficulty: 1, commandWords: ["Write down"],
    setting: "Pure algebra, any parallel line",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q16"],
    solutionProgram: "any line y = -2x + k with k not 3 is parallel to y = 3 - 2x; sample y = -2x + 7; and any y = 0.5x + k with k not -1 is parallel to y = 0.5x - 1",
    parts: [
      {
        id: "a", verb: "write-down", marks: 1,
        stem: "Write down the equation of the line that is parallel to $y = 3 - 2x$ and passes through $(0, 7)$.",
        answer: algAnswer("y = -2x + 7", { equivalence: "equivalent" }),
        scheme: [A("A1", 1, "y = −2x + 7")],
        hints: ["Parallel means the same gradient.", "Rewrite the given line as $y = -2x + 3$ first.", "The point is on the $y$-axis, so it gives $c$ straight away."],
        workedSolution: "$y = 3 - 2x$ is $y = -2x + 3$, so the gradient is $-2$. The point $(0, 7)$ lies on the $y$-axis, so $c = 7$ and the line is $y = -2x + 7$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-sign-missed",
          pattern: { kind: "algebraic", latex: "y = 2x + 7" },
          feedback: "The gradient of $y = 3 - 2x$ is $-2$, not 2. Rewriting it with the $x$ term first makes the sign visible.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "write-down", marks: 1,
        stem: "Write down the equation of the line parallel to $2y = x - 8$ that passes through $(0, 4)$.",
        answer: algAnswer("y = 0.5x + 4", { equivalence: "equivalent" }),
        scheme: [A("A1", 1, "y = ½x + 4, or y = 0.5x + 4")],
        hints: ["Divide through by 2 first.", "$y = \\tfrac{1}{2}x - 4$, so the gradient is $\\tfrac{1}{2}$.", "The point is on the $y$-axis, so it gives $c$ directly."],
        workedSolution: "Dividing by 2, $y = \\tfrac{1}{2}x - 4$, so the gradient is $\\tfrac{1}{2}$. The point $(0, 4)$ gives $c = 4$, so the line is $y = \\tfrac{1}{2}x + 4$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-read-without-rearranging",
          pattern: { kind: "algebraic", latex: "y = x + 4" },
          feedback: "The gradient was read as 1 from $2y = x - 8$. The left side has to be a single $y$ before the coefficient of $x$ is the gradient.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q16",
        }],
        requiresWorking: false,
      },
    ],
  }),
  mk(7, {
    specRefs: PAR, style: "practice", difficulty: 3, commandWords: ["Find"],
    setting: "Pure algebra, a parallel line through a given point",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q16"],
    solutionProgram: "parallel to y = 4x - 1 through (2,11): m = 4, 11 = 8 + c so c = 3, y = 4x + 3 | parallel to 2y = 6x + 5 through (1,4): m = 3, 4 = 3 + c so c = 1, y = 3x + 1",
    figures: [parallelFig],
    parts: [
      {
        id: "a", verb: "find", marks: 3,
        stem: "Find the equation of the line parallel to $y = 4x - 1$ that passes through $(2, 11)$.",
        answer: algAnswer("y = 4x + 3", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "gradient 4 used for the new line"),
          A("A1", 1, "11 = 4(2) + c", { dependsOn: ["M1"] }),
          MA("MA1", 1, "y = 4x + 3"),
        ],
        hints: ["Parallel lines have equal gradients.", "Start from $y = 4x + c$.", "Substitute the point."],
        workedSolution: "Gradient 4, so $y = 4x + c$. At $(2, 11)$: $11 = 8 + c$, so $c = 3$ and the line is $y = 4x + 3$.",
        commonErrors: [{
          misconception: "maths.lines.equation-not-found-after-gradient",
          pattern: { kind: "numeric" },
          feedback: "The gradient is right and earns a mark. The question asks for an equation, which needs $c$ from the point as well.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 3,
        stem: "Find the equation of the line parallel to $2y = 6x + 5$ that passes through $(1, 4)$.",
        answer: algAnswer("y = 3x + 1", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "2y = 6x + 5 rearranged to y = 3x + 2.5, gradient 3"),
          A("A1", 1, "4 = 3(1) + c", { dependsOn: ["M1"] }),
          MA("MA1", 1, "y = 3x + 1"),
        ],
        hints: ["Divide every term by 2 before reading the gradient.", "$y = 3x + 2.5$.", "Substitute $(1, 4)$ into $y = 3x + c$."],
        workedSolution: "Dividing by 2: $y = 3x + 2.5$, so the gradient is 3. At $(1, 4)$: $4 = 3 + c$, so $c = 1$ and the line is $y = 3x + 1$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-read-without-rearranging",
          pattern: { kind: "algebraic", latex: "y = 6x - 2" },
          feedback: "The gradient was taken as 6 from $2y = 6x + 5$. Divide through by 2 first; the gradient is 3.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q16",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(8, {
    specRefs: MX, style: "practice", difficulty: 3, commandWords: ["Find", "Write down"],
    setting: "Pure algebra, a line given in the form ax + by = c",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q16"],
    solutionProgram: "3x + 4y = 24 -> 4y = -3x + 24 -> y = -0.75x + 6; gradient -0.75, y-intercept (0,6); x-intercept at y = 0 gives 3x = 24 so x = 8",
    parts: [
      {
        id: "a", verb: "express", marks: 2,
        stem: "Rearrange $3x + 4y = 24$ into the form $y = mx + c$.",
        answer: algAnswer("y = -0.75x + 6", { equivalence: "equivalent" }),
        scheme: [M("M1", 1, "4y = −3x + 24"), A("A1", 1, "y = −¾x + 6, or y = −0.75x + 6", { dependsOn: ["M1"] })],
        hints: ["Get the $y$ term on its own first.", "Then divide every term by 4."],
        workedSolution: "$4y = -3x + 24$, so $y = -\\tfrac{3}{4}x + 6$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-read-without-rearranging",
          pattern: { kind: "algebraic", latex: "y = 3x + 24" },
          feedback: "The 4 was never divided out and the sign of the $x$ term was kept. Moving $3x$ across makes it $-3x$, and then every term is divided by 4.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q16",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "write-down", marks: 2,
        stem: "Write down the coordinates of the points where $3x + 4y = 24$ crosses the two axes.",
        answer: textAnswer(
          ["(0, 6) and (8, 0)", "0, 6 and 8, 0"],
          [{ any: ["0, 6", "(0, 6)"], marks: 1 }, { any: ["8, 0", "(8, 0)"], marks: 1 }],
        ),
        scheme: [
          A("A1", 1, "(0, 6) — the y-intercept", { ft: true }),
          A("A2", 1, "(8, 0) — the x-intercept"),
        ],
        hints: ["On the $y$-axis, $x = 0$.", "On the $x$-axis, $y = 0$.", "$3x = 24$."],
        workedSolution: "At $x = 0$: $4y = 24$, so $y = 6$ and the point is $(0, 6)$.\nAt $y = 0$: $3x = 24$, so $x = 8$ and the point is $(8, 0)$.",
        commonErrors: [{
          misconception: "maths.lines.intercept-not-recognised",
          pattern: { kind: "text", regex: "\\(\\s*0\\s*,\\s*24\\s*\\)|\\(\\s*24\\s*,\\s*0\\s*\\)|^\\s*24\\s*$" },
          feedback: "24 is the constant in the original form, not an intercept. Set each variable to zero in turn to find where the line crosses each axis.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M4:Q11",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(9, {
    specRefs: MX, style: "practice", difficulty: 3, commandWords: ["Draw"], emphasis: ["draw"],
    setting: "Drawing a line given in the form ax + by = c",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q16"],
    solutionProgram: "2x + 3y = 12: at x = 0, y = 4; at y = 0, x = 6; at x = 3, y = 2; three points (0,4), (3,2), (6,0) all satisfy 2x + 3y = 12",
    parts: [{
      id: "main", verb: "draw", marks: 3,
      stem: "Draw the graph of $2x + 3y = 12$ for values of $x$ from 0 to 6.",
      answer: {
        kind: "graph",
        expect: {
          plot: "points-line",
          points: [[0, 4], [3, 2], [6, 0]],
          lineThrough: [[0, 4], [6, 0]],
          tolerance: { type: "absolute", value: 0.2 },
          lineRequired: true,
        },
      },
      scheme: [
        M("M1", 1, "at least two correct points found, e.g. (0, 4) and (6, 0)"),
        A("A1", 1, "a third point or a correct table of values", { dependsOn: ["M1"] }),
        MA("MA1", 1, "a straight line ruled through the points across the given range"),
      ],
      hints: ["The quickest two points are where the line crosses each axis.", "Put $x = 0$, then put $y = 0$.", "A third point is worth finding as a check: try $x = 3$."],
      workedSolution: "At $x = 0$: $3y = 12$, so $y = 4$ — the point $(0, 4)$.\nAt $y = 0$: $2x = 12$, so $x = 6$ — the point $(6, 0)$.\nA check point at $x = 3$: $6 + 3y = 12$, so $y = 2$ — the point $(3, 2)$.\nThe three points are in line; join them with a ruler.",
      commonErrors: [{
        misconception: "maths.graphs.points-joined-with-ruler",
        pattern: { kind: "graph", test: "only one point plotted, or a freehand line" },
        feedback: "Two points fix a straight line, but a third is the check that one of them is not misplaced. Use a ruler, and extend the line across the whole range asked for.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2025-november:M4:Q16",
      }],
      requiresWorking: true,
    }],
  }),
  mk(10, {
    specRefs: MX, style: "practice", difficulty: 3, commandWords: ["Find", "Explain"],
    setting: "A real-life straight-line graph for equipment hire",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q14", "ccea-cer:maths:2023-summer:M4:Q2"],
    solutionProgram: "points (1,37) and (4,73): gradient = (73-37)/(4-1) = 36/3 = 12 pounds per day; intercept 25; C = 12d + 25; at d = 3, C = 61",
    figures: [hireFig],
    parts: [
      {
        id: "a", verb: "find", marks: 2,
        stem: "The graph shows the cost, in pounds, of hiring equipment for $d$ days.\n\nFind the gradient of the line.",
        answer: numAnswer(12),
        scheme: [
          M("M1", 1, "two points read with the scales and a difference over a difference formed, e.g. (73 − 37)/(4 − 1)"),
          A("A1", 1, "12", { dependsOn: ["M1"] }),
        ],
        hints: ["Choose two points that are far apart and sit on grid intersections.", "Use the values on the axes, not the number of squares.", "$\\dfrac{36}{3}$."],
        workedSolution: "Reading $(1, 37)$ and $(4, 73)$: $m = \\dfrac{73 - 37}{4 - 1} = \\dfrac{36}{3} = 12$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-counting-squares-ignores-scale",
          pattern: { kind: "numeric" },
          feedback: "Squares were counted instead of values read. One square across is 1 day but one square up is 20 pounds, so the two are not comparable. Summer 2023 M3 Q14 reported gradients of 23 and 1.5 arriving this way.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M3:Q14",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "explain", marks: 1,
        stem: "Explain what the gradient represents.",
        answer: textAnswer(
          ["The cost increases by £12 for each extra day of hire"],
          [{ any: ["per day", "each day", "each extra day"], marks: 1, reject: ["correlation", "positive relationship"] }],
        ),
        scheme: [A("A1", 1, "the cost rises by £12 for each extra day (units of both axes present)", { ft: true })],
        hints: ["Use the units of both axes.", "Pounds per what?"],
        workedSolution: "The cost goes up by £12 for every extra day the equipment is hired.",
        commonErrors: [{
          misconception: "maths.stats.compare-without-context-words",
          pattern: { kind: "text", regex: "(positive correlation|as one goes up)" },
          feedback: "That is scatter-graph language. This is a rule connecting two quantities, so the interpretation needs the units of both axes: pounds per day.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M4:Q2",
        }],
        requiresWorking: false,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
      {
        id: "c", verb: "find", marks: 2,
        stem: "Write down an equation connecting the cost $C$ and the number of days $d$, and use it to find the cost of hiring the equipment for 3 days.",
        answer: numAnswer(61, { unit: "pounds", unitRequired: false }),
        scheme: [
          A("A1", 1, "C = 12d + 25 (or their gradient with the intercept 25)", { ft: true }),
          A("A2", 1, "£61", { ft: true, dependsOn: ["A1"] }),
        ],
        hints: ["The intercept is the charge before any days are counted.", "Read it where the line meets the cost axis.", "$12 \\times 3 + 25$."],
        workedSolution: "The line meets the cost axis at 25, so $C = 12d + 25$.\nAt $d = 3$: $C = 36 + 25 = £61$.",
        commonErrors: [{
          misconception: "maths.lines.intercept-not-recognised",
          pattern: { kind: "numeric" },
          feedback: "The fixed charge of £25 was left out. The intercept is part of the rule, not an extra.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M3:Q14",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(11, {
    specRefs: REF, style: "practice", difficulty: 4, commandWords: ["Explain"],
    setting: "Judging a claim about two lines",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q16"],
    solutionProgram: "y = 2x + 5 has gradient 2; 4y = 8x - 3 rearranges to y = 2x - 0.75 with gradient 2; equal gradients and different intercepts, so parallel; 6y = 3x + 12 gives y = 0.5x + 2, gradient 0.5, not parallel",
    parts: [{
      id: "main", verb: "explain", marks: 3,
      stem: "Here are three lines.\n\n**A:** $y = 2x + 5$\n**B:** $4y = 8x - 3$\n**C:** $6y = 3x + 12$\n\nTwo of them are parallel. State which two, and explain how you know.",
      answer: textAnswer(
        ["A and B, because both have gradient 2 once written as y = mx + c"],
        [
          { any: ["A and B", "B and A"], marks: 1, reject: ["C"] },
          { any: ["gradient 2", "same gradient", "both 2"], marks: 1 },
        ],
      ),
      scheme: [
        M("M1", 1, "at least one of B and C rearranged into y = mx + c"),
        A("A1", 1, "gradients identified: A 2, B 2, C ½", { dependsOn: ["M1"] }),
        MA("MA1", 1, "A and B named, with the reason that their gradients are equal"),
      ],
      hints: ["You cannot compare gradients until every equation has a single $y$ on the left.", "Divide B by 4 and C by 6.", "Parallel means equal gradients."],
      workedSolution: "**A** is already in the right form: gradient 2.\n**B:** dividing by 4 gives $y = 2x - 0.75$: gradient 2.\n**C:** dividing by 6 gives $y = \\tfrac{1}{2}x + 2$: gradient $\\tfrac{1}{2}$.\nA and B have the same gradient and different intercepts, so they are parallel; C is not.",
      commonErrors: [{
        misconception: "maths.lines.gradient-read-without-rearranging",
        pattern: { kind: "text", regex: "B and C" },
        feedback: "The coefficients of $x$ were compared before the equations were rearranged. Once $y$ is alone, B has gradient 2 and C has gradient $\\tfrac{1}{2}$.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2025-november:M4:Q16",
      }],
      requiresWorking: true,
    }],
  }),
  mk(12, {
    specRefs: REF, style: "practice", difficulty: 4, commandWords: ["Calculate", "Find"],
    setting: "Pure coordinate geometry, midpoint and equation in the same question",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q2", "ccea-cer:maths:2023-summer:M3:Q22"],
    solutionProgram: "P(2,1), Q(6,13): midpoint ((2+6)/2, (1+13)/2) = (4,7); gradient (13-1)/(6-2) = 3; c = -5; y = 3x - 5; check midpoint lies on the line: 3(4) - 5 = 7",
    figures: [axesFig],
    parts: [
      {
        id: "a", verb: "calculate", marks: 2,
        stem: "$P$ is the point $(2, 1)$ and $Q$ is the point $(6, 13)$.\n\nCalculate the midpoint of $PQ$.",
        answer: textAnswer(["(4, 7)", "4, 7"], [{ any: ["4, 7", "(4, 7)"], marks: 1 }]),
        scheme: [M("M1", 1, "((2 + 6)/2, (1 + 13)/2)"), A("A1", 1, "(4, 7)", { dependsOn: ["M1"] })],
        hints: ["Average the $x$ values and average the $y$ values."],
        workedSolution: "Midpoint $= \\left(\\dfrac{2 + 6}{2}, \\dfrac{1 + 13}{2}\\right) = (4, 7)$.",
        commonErrors: [{
          misconception: "maths.lines.midpoint-instead-of-equation",
          pattern: { kind: "text", regex: "\\(\\s*8\\s*,\\s*14\\s*\\)" },
          feedback: "The coordinates were added but not halved. A midpoint is the average of each pair.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q2",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 3,
        stem: "Find the equation of the line $PQ$.",
        answer: algAnswer("y = 3x - 5", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "gradient (13 − 1)/(6 − 2) used"),
          A("A1", 1, "m = 3", { dependsOn: ["M1"] }),
          MA("MA1", 1, "y = 3x − 5", { ft: true }),
        ],
        hints: ["This part wants an equation, not a point.", "Gradient first, then substitute $P$ or $Q$.", "The midpoint from part (a) also lies on the line — a useful check."],
        workedSolution: "$m = \\dfrac{13 - 1}{6 - 2} = 3$; substituting $P(2, 1)$ gives $c = -5$, so $PQ$ is $y = 3x - 5$.\nCheck with the midpoint $(4, 7)$: $3(4) - 5 = 7$.",
        commonErrors: [{
          misconception: "maths.lines.midpoint-instead-of-equation",
          pattern: { kind: "text", regex: "\\(\\s*4\\s*,\\s*7\\s*\\)" },
          feedback: "That is part (a) repeated. 'Equation of the line' means $y = mx + c$; the midpoint is a point on it, not the line itself.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M3:Q22",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  // ------------------------------------------------------------ exam-style
  mk(13, {
    specRefs: EQ, style: "exam-style", difficulty: 4, commandWords: ["Find"], emphasis: ["in the form y = mx + c"],
    setting: "Pure coordinate geometry, in the style of a final M3 question",
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q31", "ccea-cer:maths:2023-summer:M3:Q22"],
    solutionProgram: "through (-2,9) and (3,-1): m = -2, c = 5, y = -2x + 5; midpoint would be (0.5, 4), which is not the answer",
    parts: [{
      id: "main", verb: "find", marks: 3,
      stem: "Find the equation of the straight line passing through the points $(-2, 9)$ and $(3, -1)$.\n\nGive your answer in the form $y = mx + c$.",
      answer: algAnswer("y = -2x + 5", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "gradient formula used with the coordinates in a consistent order"),
        A("A1", 1, "m = −2", { dependsOn: ["M1"], examinerNote: "m = 2 (sign lost) scores M1 only." }),
        MA("MA1", 1, "c = 5 and the equation y = −2x + 5 written", { ft: true }),
      ],
      hints: ["Change in $y$ over change in $x$, both in the same order.", "$3 - (-2) = 5$.", "The line falls, so check your gradient is negative.", "Substitute either point to find $c$."],
      workedSolution: "$m = \\dfrac{-1 - 9}{3 - (-2)} = \\dfrac{-10}{5} = -2$.\nSubstituting $(3, -1)$: $-1 = -6 + c$, so $c = 5$.\nThe line is $y = -2x + 5$. Check with $(-2, 9)$: $4 + 5 = 9$.",
      commonErrors: [
        {
          misconception: "maths.lines.midpoint-instead-of-equation",
          pattern: { kind: "text", regex: "\\(\\s*0\\.5\\s*,\\s*4\\s*\\)" },
          feedback: "That is the midpoint. November 2025 M3 Q31 reported very limited success on this question, with many candidates doing a midpoint calculation instead.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        },
        {
          misconception: "maths.lines.gradient-sign-missed",
          pattern: { kind: "algebraic", latex: "y = 2x + 5" },
          feedback: "The gradient came out positive. Only the best candidates in November 2025 got the negative gradient: going left to right the line goes downhill, so $m$ must be negative.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        },
        {
          misconception: "maths.lines.equation-not-found-after-gradient",
          pattern: { kind: "numeric" },
          feedback: "The gradient is correct, which is two of the three marks. The answer line asks for the equation, so $c$ still has to be found.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(14, {
    specRefs: PAR, style: "exam-style", difficulty: 4, commandWords: ["Find"],
    setting: "Pure coordinate geometry, a parallel line built from two given points",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q16", "ccea-cer:maths:2025-summer:M4:Q2"],
    solutionProgram: "L through (1,2) and (5,14): m = 3, c = -1, so L is y = 3x - 1; parallel line through (-3,-7): -7 = 3(-3) + c so c = 2, y = 3x + 2; check at (1,5): 3 + 2 = 5",
    parts: [
      {
        id: "a", verb: "find", marks: 3,
        stem: "A line $L$ passes through the points $(1, 2)$ and $(5, 14)$.\n\nFind the equation of $L$ in the form $y = mx + c$.",
        answer: algAnswer("y = 3x - 1", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "(14 − 2)/(5 − 1)"),
          A("A1", 1, "m = 3", { dependsOn: ["M1"] }),
          MA("MA1", 1, "y = 3x − 1", { ft: true }),
        ],
        hints: ["$\\dfrac{12}{4}$.", "Substitute $(1, 2)$ into $y = 3x + c$."],
        workedSolution: "$m = \\dfrac{14 - 2}{5 - 1} = 3$; at $(1, 2)$, $2 = 3 + c$, so $c = -1$ and $L$ is $y = 3x - 1$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-inverted",
          pattern: { kind: "algebraic", latex: "y = 0.333x + 1.667" },
          feedback: "The differences were divided the wrong way round. Change in $y$ goes on top.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q2",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 3,
        stem: "Find the equation of the line that is parallel to $L$ and passes through the point $(-3, -7)$.",
        answer: algAnswer("y = 3x + 2", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "their gradient from (a) reused for the parallel line", { ft: true }),
          A("A1", 1, "−7 = 3(−3) + c", { ft: true, dependsOn: ["M1"] }),
          MA("MA1", 1, "y = 3x + 2", { ft: true }),
        ],
        hints: ["Parallel means the same gradient, so no new gradient calculation is needed.", "$3 \\times -3 = -9$.", "$-7 = -9 + c$."],
        workedSolution: "Parallel to $L$, so the gradient is 3. At $(-3, -7)$: $-7 = -9 + c$, so $c = 2$ and the line is $y = 3x + 2$.",
        commonErrors: [{
          misconception: "maths.lines.gradient-sign-missed",
          pattern: { kind: "algebraic", latex: "y = 3x - 16" },
          feedback: "$3 \\times -3$ is $-9$, so $-7 = -9 + c$ and $c = +2$. The sign of the substituted term is where this goes wrong.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-november:M4:Q16",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(15, {
    specRefs: REF, style: "exam-style", difficulty: 5, commandWords: ["Find", "Show that"],
    setting: "Pure coordinate geometry, a point tested against a line",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q31", "ccea-cer:maths:2023-summer:M4:Q11"],
    solutionProgram: "A(0,-4), B(5,11): m = 15/5 = 3, c = -4 read from A, so AB is y = 3x - 4; C(4,8): 3(4) - 4 = 8 so C lies on AB; D(2,4): 3(2) - 4 = 2 which is not 4, so D does not lie on AB",
    parts: [
      {
        id: "a", verb: "find", marks: 3,
        stem: "$A$ is the point $(0, -4)$ and $B$ is the point $(5, 11)$.\n\nFind the equation of the line $AB$ in the form $y = mx + c$.",
        answer: algAnswer("y = 3x - 4", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "(11 − (−4))/(5 − 0)"),
          A("A1", 1, "m = 3", { dependsOn: ["M1"] }),
          MA("MA1", 1, "c = −4 read from A, and y = 3x − 4 written", { ft: true }),
        ],
        hints: ["$A$ is on the $y$-axis, so $c$ can be read straight off.", "$11 - (-4) = 15$.", "$\\dfrac{15}{5} = 3$."],
        workedSolution: "$A(0, -4)$ lies on the $y$-axis, so $c = -4$.\n$m = \\dfrac{11 - (-4)}{5 - 0} = \\dfrac{15}{5} = 3$, so $AB$ is $y = 3x - 4$.",
        commonErrors: [{
          misconception: "maths.lines.intercept-not-recognised",
          pattern: { kind: "algebraic", latex: "y = 3x + 11" },
          feedback: "The intercept was taken from the wrong point. $A$ has $x = 0$, so its $y$ value, $-4$, is $c$.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2023-summer:M4:Q11",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "show-that", marks: 2,
        stem: "$C$ is the point $(4, 8)$ and $D$ is the point $(2, 4)$.\n\nShow that $C$ lies on the line $AB$ but $D$ does not.",
        answer: textAnswer(
          ["Substituting x = 4 gives y = 8, so C is on AB; substituting x = 2 gives y = 2, not 4, so D is not"],
          [
            { any: ["3(4) − 4 = 8", "12 − 4 = 8", "gives 8"], marks: 1 },
            { any: ["3(2) − 4 = 2", "6 − 4 = 2", "gives 2", "not 4"], marks: 1 },
          ],
        ),
        scheme: [
          MA("MA1", 1, "x = 4 substituted into their equation to obtain 8, matching C", { ft: true }),
          MA("MA2", 1, "x = 2 substituted to obtain 2, which does not match D's y value of 4", { ft: true }),
        ],
        hints: ["A point lies on a line when its coordinates satisfy the equation.", "Put the $x$ value in and see whether the $y$ value comes out.", "Both points need testing — the question asks about each."],
        workedSolution: "For $C(4, 8)$: $3(4) - 4 = 8$, which matches the $y$ coordinate, so $C$ lies on $AB$.\nFor $D(2, 4)$: $3(2) - 4 = 2$, but $D$ has $y = 4$, so $D$ does not lie on $AB$.",
        commonErrors: [{
          misconception: "maths.lines.equation-not-found-after-gradient",
          pattern: { kind: "text", regex: "^\\s*(yes|no)\\s*$" },
          feedback: "A bare yes or no earns nothing here. The substitution is the evidence, so both calculations need to be on the page.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q31",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(16, {
    specRefs: MX, style: "exam-style", difficulty: 4, commandWords: ["Find", "Explain", "Use"],
    setting: "A real-life straight-line graph with awkward scales",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q14", "ccea-cer:maths:2023-summer:M4:Q2"],
    solutionProgram: "line through (0,25) and (5,85): gradient 12 pounds per day; C = 12d + 25; at d = 7 the cost is 12(7) + 25 = 109; a 9-day hire costs 12(9) + 25 = 133",
    figures: [hireFig],
    parts: [
      {
        id: "a", verb: "find", marks: 3,
        stem: "The graph shows the cost, in pounds, of hiring equipment for $d$ days.\n\nFind the gradient of the line and explain what it means.",
        answer: numAnswer(12),
        scheme: [
          M("M1", 1, "two points read using the axis scales and a difference over a difference formed"),
          A("A1", 1, "gradient 12", { dependsOn: ["M1"] }),
          MA("MA1", 1, "interpretation with both units: the cost rises by £12 for each extra day", { ft: true }),
        ],
        hints: ["Pick two points far apart that sit on grid intersections.", "Read the values from the axes, not the squares.", "The interpretation needs pounds **per day**."],
        workedSolution: "Reading $(1, 37)$ and $(4, 73)$: $m = \\dfrac{73 - 37}{4 - 1} = 12$.\nIt means the cost increases by £12 for each additional day of hire.",
        commonErrors: [
          {
            misconception: "maths.lines.gradient-counting-squares-ignores-scale",
            pattern: { kind: "numeric" },
            feedback: "Squares were counted rather than values read. The two axes step by different amounts, so a square is not the same quantity on each.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M3:Q14",
          },
          {
            misconception: "maths.stats.compare-without-context-words",
            pattern: { kind: "text", regex: "(goes up|increases)\\s*$" },
            feedback: "The value is right but the interpretation is incomplete. Both units are needed: pounds per day.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2023-summer:M4:Q2",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "b", verb: "use", marks: 3,
        stem: "Write down an equation connecting $C$ and $d$, and use it to find the cost of a 9-day hire.",
        answer: numAnswer(133, { unit: "pounds", unitRequired: false }),
        scheme: [
          A("A1", 1, "intercept 25 identified as the fixed charge", { ft: true }),
          A("A2", 1, "C = 12d + 25", { ft: true, dependsOn: ["A1"] }),
          MA("MA1", 1, "£133", { ft: true, dependsOn: ["A2"] }),
        ],
        hints: ["The intercept is the cost before any days are counted.", "$C = 12d + 25$.", "A 9-day hire is beyond the graph, so the equation is the way to get it."],
        workedSolution: "The line meets the cost axis at 25, so $C = 12d + 25$.\nAt $d = 9$: $C = 108 + 25 = £133$.",
        commonErrors: [{
          misconception: "maths.graphs.substitute-instead-of-read-graph",
          pattern: { kind: "numeric" },
          feedback: "The fixed charge was dropped. The £25 is paid whatever the number of days, so it stays in the equation.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2023-summer:M3:Q14",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
];
expect("q15 C on line", on(3, -4, 4), 8);
expect("q15 D off line", on(3, -4, 2), 2);
expect("q16 9-day hire", 12 * 9 + 25, 133);
expect("q14b c", inter([-3, -7], 3), 2);
assertNoFailures("t9 questions");

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T, specRefs: EQ,
    stem: "Bláthnaid was asked to find the equation of the line through $(1, 3)$ and $(5, 15)$. Her working:",
    studentWorking: [
      "Midpoint = ((1 + 5)/2, (3 + 15)/2) = (3, 9)",
      "Answer: (3, 9)",
    ],
    mistakeLine: 1,
    misconception: "maths.lines.midpoint-instead-of-equation",
    whatWentWrong: "A midpoint is a single point. The equation of a line is a rule, $y = mx + c$, that every point on the line obeys. The question asked for the rule.",
    correction: [
      "m = (15 − 3)/(5 − 1) = 12/4 = 3",
      "Substituting (1, 3): 3 = 3(1) + c, so c = 0",
      "Answer: y = 3x",
    ],
    marksEarnedAsWritten: [],
    feedback: "The midpoint calculation itself is carried out correctly, but it answers a different question, so nothing is available. The habit worth building is to read the answer line first: if it has a gap for an equation, the answer starts with $y =$; if it has two brackets for coordinates, it is a point. Summer 2023 M3 Q22 and November 2025 M3 Q31 both reported a large proportion of candidates offering a midpoint here.",
    source: "ccea-cer:maths:2023-summer:M3:Q22",
  },
  {
    id: `ftm.${T}.02`,
    topic: T, specRefs: EQ,
    stem: "Pádraig was asked to find the equation of the line through $(-1, 8)$ and $(4, -2)$. His working:",
    studentWorking: [
      "m = (4 − (−1)) / (−2 − 8) = 5 / (−10) = −0.5",
      "Substituting (4, −2): −2 = −0.5(4) + c, so c = 0",
      "Answer: y = −0.5x",
    ],
    mistakeLine: 1,
    misconception: "maths.lines.gradient-inverted",
    whatWentWrong: "The $x$ differences were put on top of the $y$ differences. Gradient is change in $y$ divided by change in $x$, so it should be $\\dfrac{-2 - 8}{4 - (-1)} = \\dfrac{-10}{5} = -2$.",
    correction: [
      "m = (−2 − 8) / (4 − (−1)) = −10 / 5 = −2",
      "Substituting (4, −2): −2 = −8 + c, so c = 6",
      "Answer: y = −2x + 6",
    ],
    marksEarnedAsWritten: [],
    feedback: "Everything after line 1 is done correctly, but on an upside-down gradient, so the method mark for the formula is not available. A memory hook: gradient is how much $y$ changes for each 1 that $x$ changes, so $y$ is on top. A quick sanity check also catches it — from $(-1, 8)$ to $(4, -2)$ the line drops 10 while moving only 5 across, so it is steeper than 1, not shallower. Summer 2025 M4 Q2 reported the recurring error as putting the $x$-differences on top.",
    source: "ccea-cer:maths:2025-summer:M4:Q2",
  },
  {
    id: `ftm.${T}.03`,
    topic: T, specRefs: PAR,
    stem: "Seán was asked for the equation of the line parallel to $3y = 12x + 5$ through the point $(2, 3)$. His working:",
    studentWorking: [
      "Gradient of 3y = 12x + 5 is 12",
      "So the new line is y = 12x + c",
      "3 = 12(2) + c, so c = −21",
      "Answer: y = 12x − 21",
    ],
    mistakeLine: 1,
    misconception: "maths.lines.gradient-read-without-rearranging",
    whatWentWrong: "The gradient was read from an equation that was not in the form $y = mx + c$. Dividing every term by 3 gives $y = 4x + \\tfrac{5}{3}$, so the gradient is 4, not 12.",
    correction: [
      "3y = 12x + 5 gives y = 4x + 5/3, so the gradient is 4",
      "The new line is y = 4x + c",
      "3 = 4(2) + c, so c = −5",
      "Answer: y = 4x − 5",
    ],
    marksEarnedAsWritten: ["A1"],
    feedback: "The structure is exactly right — same gradient as the given line, then the point substituted to find $c$ — and the substitution is carried out correctly, so one accuracy mark is realistic on follow-through. The single missed step is dividing through by the coefficient of $y$. The rule is simple: no gradient can be read until there is one $y$, on its own, on the left.",
    source: "ccea-cer:maths:2025-november:M4:Q16",
  },
];
expect("ftm01 correct m", grad([1, 3], [5, 15]), 3);
expect("ftm01 correct c", inter([1, 3], 3), 0);
expect("ftm02 correct m", grad([-1, 8], [4, -2]), -2);
expect("ftm02 correct c", inter([4, -2], -2), 6);
expect("ftm03 correct c", inter([2, 3], 4), -5);
assertNoFailures("t9 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", MX, "formula", "In $y = mx + c$, what are $m$ and $c$?",
    "$m$ is the gradient — how much $y$ rises for each 1 that $x$ increases. $c$ is the $y$-intercept, the $y$ value where the line crosses the $y$-axis.",
    ["gradient", "y-intercept"], 3),
  rp(T, "02", EQ, "formula", "$m = $ ?",
    "$m = \\dfrac{y_2 - y_1}{x_2 - x_1}$ — change in $y$ on top. Take both differences with the points in the same order.",
    ["change in y over change in x", "same order"], 4),
  rp(T, "03", EQ, "procedure", "The three steps for finding the equation of a line through two points.",
    "1 Find $m$ from the gradient formula. 2 Substitute either point into $y = mx + c$ and solve for $c$. 3 Write the whole equation $y = mx + c$.",
    ["gradient", "substitute", "write the equation"], 5),
  rp(T, "04", EQ, "trap", "A question asks for 'the equation of the line'. What is the commonest wrong answer?",
    "The midpoint. An equation is a rule beginning $y =$; a midpoint is a single point. Read the answer line before you start.",
    ["midpoint", "y =", "answer line"], 7),
  rp(T, "05", EQ, "trap", "One of the two points has $x = 0$. What does that save you?",
    "The whole substitution: that point is on the $y$-axis, so its $y$ value **is** $c$. Only the gradient still has to be worked out.",
    ["on the y-axis", "c directly"], 6),
  rp(T, "06", MX, "trap", "What is the gradient of $3y = 12x + 5$?",
    "4. Divide every term by 3 first: $y = 4x + \\tfrac{5}{3}$. No gradient can be read until $y$ is on its own.",
    ["divide by 3", "4", "rearrange first"], 7),
  rp(T, "07", PAR, "definition", "What is true of two parallel lines?",
    "They have equal gradients and different $y$-intercepts. Same $m$, different $c$ — so they never meet.",
    ["equal gradients", "different intercepts"], 4),
  rp(T, "08", PAR, "procedure", "How do you find the line parallel to a given line through a given point?",
    "Take the gradient of the given line (rearranging first if necessary), write $y = mx + c$ with that $m$, substitute the point and solve for $c$.",
    ["same gradient", "substitute the point"], 5),
  rp(T, "09", MX, "trap", "Why must you not count squares to find a gradient on a real-life graph?",
    "Because the two axes usually go up in different steps. Read the actual values at two points and divide the change in the vertical quantity by the change in the horizontal one.",
    ["scales differ", "read the values"], 7),
  rp(T, "10", MX, "trap", "How do you interpret a gradient on a real-life graph?",
    "In the units of both axes: 'the cost rises by £12 for each extra day'. A bare number, or scatter-graph language about correlation, does not earn the mark.",
    ["units of both axes", "per"], 6),
  rp(T, "11", MX, "procedure", "How do you find where $3x + 4y = 24$ crosses each axis?",
    "Put $x = 0$ for the $y$-intercept, giving $(0, 6)$; put $y = 0$ for the $x$-intercept, giving $(8, 0)$. Those two points are also the quickest way to draw the line.",
    ["x = 0", "y = 0", "two points"], 6),
];

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed: through (2,1) and (6,13), m = 12/4 = 3 and c = −5, and 3(6) − 5 = 13; midpoint of the same pair is (4,7); through (−2,9) and (3,−1), m = −2 and c = 5; 2y = 6x + 5 gives y = 3x + 2.5; hire graph gradient (73 − 37)/(4 − 1) = 12 with intercept 25, so C = 12d + 25 and C(3) = 61.",
    examiner: "Every examiner callout comes from packs/maths/insights/m3.straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines.json: Summer 2023 M3 Q22 and Q14, M4 Q11 and Q2, Summer 2025 M4 Q2, November 2025 M3 Q31 and M4 Q16.",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, { ...base, numeric: "m = (13 − 1)/(6 − 2) = 3; c from (2,1): 1 = 6 + c so c = −5; check 3(6) − 5 = 13. Twin: through (1,2) and (5,14), m = 3 and c = −1, and 3(5) − 1 = 14.", examiner: "Built on Summer 2023 M3 Q22 and November 2025 M3 Q31, where midpoints were offered instead of equations." }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, { ...base, numeric: "m = (−1 − 9)/(3 − (−2)) = −10/5 = −2; c from (3,−1): −1 = −6 + c so c = 5; check −2(−2) + 5 = 9. Twin: through (−4,6) and (2,−6), m = −2 and c = −2.", examiner: "Built on November 2025 M3 Q31, where the negative direction was missed." }),
  ver(`ver.we.${T}.03`, `we.${T}.03`, { ...base, numeric: "2y = 6x + 5 gives y = 3x + 2.5, gradient 3; at (1,4): 4 = 3 + c so c = 1. Twin: 3y = 12x − 7 gives gradient 4; at (2,11): 11 = 8 + c so c = 3.", examiner: "Built on November 2025 M4 Q16, where the gradient was read without rearranging." }),
  ver(`ver.we.${T}.04`, `we.${T}.04`, { ...base, numeric: "Points (1,37) and (4,73) both satisfy C = 12d + 25; gradient 36/3 = 12; intercept 25. Twin: C = 9d + 18 gives C(4) = 54.", examiner: "Built on Summer 2023 M3 Q14 and M4 Q2, where square-counting and scatter-graph language cost marks." }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "m through (2,1) and (6,13) = 3 (and the inverted value 1/3); (0,5) gives c = 5; 2y = 6x + 5 has gradient 3; y = 4x − 1 is parallel to y = 4x + 7; midpoint of (2,1) and (6,13) is (4,7); a graph with 1 square = 1 day and 1 square = 20 pounds gives 0.6 by square counting against the true 12.",
    examiner: "Distractors are the registry misconceptions named on the insight card: midpoint-instead-of-equation, intercept-not-recognised, gradient-inverted, gradient-sign-missed, gradient-read-without-rearranging, gradient-from-wrong-points, gradient-counting-squares-ignores-scale, equation-not-found-after-gradient.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the errors those findings describe.",
  })),
  ...findTheMistake.map((f) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: "Corrected lines recomputed: through (1,3) and (5,15), m = 3 and c = 0; through (−1,8) and (4,−2), m = −2 and c = 6; 3y = 12x + 5 has gradient 4 and through (2,3) gives c = −5.",
    examiner: f.source + " — the wrong line reproduces the reported error.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Prompt answers recomputed: 3y = 12x + 5 gives gradient 4; 3x + 4y = 24 crosses at (0,6) and (8,0).",
    examiner: "Prompts cover m and c, the gradient formula, the midpoint trap, reading c off the axis, rearranging, parallel gradients and reading a real-life gradient with the scales.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "Perpendicular lines and the negative reciprocal gradient — that is M4",
  "The equation of a circle and its tangent, and the gradient of a curve, are M8",
  "Finding the equation of a line from a graph you have to draw yourself is a different skill from reading one that is given",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Straight lines: y = mx + c, finding the equation of a line, parallel lines",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: [
      "maths.m2.gradient-and-intercept-of-linear-graphs-in-context",
      "maths.m2.midpoint-and-length-of-a-line-segment",
    ],
    order: 103,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: insight.findings.map((f) => f.source),
    examWeightHint:
      "One or two items, usually among the last five questions of M3. 'Find the equation of the straight line through two points, in the form y = mx + c' is 3 marks and is reliably hard — only the top tenth managed it in Summer 2025 Q16, and November 2025 Q31 was reported as very limited success. A real-life gradient with awkward scales is 3-4 marks earlier in the paper, and 'write down the equation of any line parallel to …' is a 1-mark gift.",
    mustMemorise: [
      "m = (y₂ − y₁)/(x₂ − x₁) — change in y on top",
      "Substitute a point into y = mx + c to find c; a point with x = 0 gives c directly",
      "Parallel lines have equal gradients and different intercepts",
      "Rearrange into y = mx + c before reading a gradient",
      "Downhill from left to right means a negative gradient",
      "'Equation of the line' means y = mx + c, never a point",
    ],
    onFormulaSheet: [],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["y = mx + c", "gradient", "y-intercept", "equation of a line", "parallel lines", "through two points", "rearranging", "real-life graph"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Straight lines: y = mx + c and parallel lines",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [],
      mustKnow: [
        "m = (y₂ − y₁)/(x₂ − x₁)",
        "Parallel lines have equal gradients",
        "Rearrange to y = mx + c before reading m or c",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Read the gradient and the y-intercept from y = mx + c, including when the x term is written second",
        "Find the gradient of a line through two points, with the correct sign",
        "Find the equation of a line through two points, in the form y = mx + c",
        "Find the equation of a line through one point with a given gradient",
        "Recognise that a point with x = 0 gives c immediately",
        "Rearrange 3y = 12x + 5 or 3x + 4y = 24 into y = mx + c before reading the gradient",
        "Find where a line crosses each axis, and use those two points to draw it",
        "Write down the equation of a line parallel to a given one, and find the parallel line through a given point",
        "Read a gradient from a real-life graph using the axis scales, and interpret it in the units of both axes",
        "Test whether a given point lies on a given line",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks), with the same content again without a calculator in M7 Paper 1. Expect one 3-mark 'find the equation through two points' among the last five questions — it is one of the least well answered items on the paper — and often a real-life graph earlier, worth 3-4 marks, asking for a gradient, its meaning and an equation. 'Write down the equation of any line parallel to …' appears as a 1-mark item. Schemes give M1 for the gradient formula, A1 for the correct value with its sign, and a final mark for c and the complete equation.",
      traps: [
        "Giving the midpoint instead of the equation — a large proportion did this in Summer 2023 M3 Q22, and it recurred in November 2025 M3 Q31",
        "Putting the x-differences on top of the y-differences (Summer 2025 M4 Q2)",
        "Losing the minus sign on a falling line: only the best reached −2 in November 2025 M3 Q31",
        "Not noticing that a point with x = 0 gives c, and taking the long route with mistakes (Summer 2023 M4 Q11)",
        "Reading a gradient from 3y = 12x + 5 without dividing by 3 (November 2025 M4 Q16)",
        "Counting squares on a real-life graph and ignoring the axis scales, giving values such as 1.5 (Summer 2023 M3 Q14 and M4 Q2)",
        "Stopping once the gradient is found, without writing the equation",
        "Interpreting a real-life gradient in scatter-graph language instead of the units of both axes (Summer 2023 M4 Q2)",
      ],
    },
    verification: `ver.note.${T}`,
    version: 1,
    updated: TODAY,
  },
  workedExamples, diagnostics, questions, findTheMistake, prompts,
  insight,
  sets: [
    {
      id: `set.${T}.warm-up`, topic: T, kind: "interleaved",
      title: "Gradient first, then the intercept",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0002`, `rp.${T}.02`, `q.${T}.0005`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Two points, parallel lines and real-life gradients",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0003`, `ftm.${T}.01`, `q.${T}.0007`, `ftm.${T}.03`, `q.${T}.0012`, `q.${T}.0013`, `q.${T}.0016`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Straight lines: y = mx + c and parallel lines" },
  {
    type: "callout", kind: "spec", title: "The three statements",
    md: "**M3-NA-12** — understand that $y = mx + c$ represents a straight line, that $m$ is the gradient and $c$ is the $y$-intercept. The guidance adds: derive a linear relationship from a straight-line graph, draw $3x - 4y = 7$, and determine the $x$- and $y$-intercepts.\n**M3-NA-13** — find the equation of a line through two given points, or through one point with a given gradient.\n**M3-NA-14** — understand and use the gradients of parallel lines. The guidance: $y = -5x$ and $y = -5x + 3$ are parallel with gradient $-5$.",
    source: "CCEA GCSE Mathematics specification, statements M3-NA-12 to M3-NA-14 with their Teacher Guidance",
  },
  {
    type: "p",
    md: "'Find the equation of the straight line through these two points' is, year after year, one of the least well answered questions on M3. In Summer 2025 only the top tenth managed it; in November 2025 the report described very limited success. The method is three lines long. What goes wrong is almost never the arithmetic — it is answering a different question, or losing a minus sign.",
  },
  { type: "h", text: "What m and c actually are" },
  {
    type: "p",
    md: "$y = mx + c$ is a rule that every point on the line obeys. $m$ is the **gradient**: how much $y$ changes for each 1 that $x$ increases. $c$ is the **$y$-intercept**: the $y$ value where the line crosses the $y$-axis, which is simply what $y$ equals when $x = 0$.\nWatch the order. $y = 7 - 3x$ is $y = -3x + 7$: the gradient is $-3$ and the intercept is 7. The minus belongs to the gradient.",
  },
  {
    type: "gate", id: "g1", kind: "blank",
    prompt: "What is the gradient of $y = 9 - 4x$?",
    answer: "−4",
    explain: "Rewrite as $y = -4x + 9$. The coefficient of $x$, sign included, is the gradient.",
  },
  { type: "h", text: "Through two points: three lines of work" },
  {
    type: "p",
    md: "Take $(2, 1)$ and $(6, 13)$. The gradient triangle shows exactly what the formula is measuring.",
  },
  noteFigure(axesBody, axesAlt, 540, 416,
    "The gradient triangle: rise 12 over run 4 gives m = 3, and the line crosses the y-axis at −5", "line-gradient-triangle"),
  {
    type: "p",
    md: "**1 Gradient.** $m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{13 - 1}{6 - 2} = \\dfrac{12}{4} = 3$. Change in $y$ **on top** — the rise, divided by the run.\n**2 Intercept.** Substitute either point into $y = 3x + c$. Using $(2, 1)$: $1 = 6 + c$, so $c = -5$.\n**3 Write the equation.** $y = 3x - 5$. Then check with the other point: $3(6) - 5 = 13$. Correct.\nTaking both differences with the points in the same order is what keeps the signs right. If you start with the 13, start with the 6.",
  },
  {
    type: "gate", id: "g2", kind: "number",
    prompt: "The gradient of the line through $(1, 2)$ and $(5, 14)$ is",
    answer: "3",
    explain: "$\\dfrac{14 - 2}{5 - 1} = \\dfrac{12}{4} = 3$.",
  },
  { type: "h", text: "The midpoint is not the answer" },
  {
    type: "p",
    md: "This is the single biggest loss on the topic. The midpoint of $(2, 1)$ and $(6, 13)$ is $(4, 7)$ — a correct calculation, and a complete answer to a different question.\nAn **equation** is a rule and starts with $y =$. A **midpoint** is a point and comes in brackets. Read the answer line before you start: a gap for coordinates wants a point; a long blank line wants an equation.\nUseful as a check, though: the midpoint always lies on the line, and $3(4) - 5 = 7$.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2023 M3 Q22 and November 2025 M3 Q31",
    md: "The strongest candidates found the gradient and the intercept and placed them correctly. A large proportion offered the midpoint instead. In 2025 the report added that only the best used the gradient formula to reach $-2$, and diagram-based approaches missed the negative direction and what the intercept means.",
    source: "ccea-cer:maths:2025-november:M3:Q31",
  },
  {
    type: "gate", id: "g3", kind: "choice",
    prompt: "'Find the equation of the line through $(1, 3)$ and $(5, 15)$.' Which is the answer?",
    options: ["$y = 3x$", "$(3, 9)$", "$m = 3$"],
    answer: "$y = 3x$",
    explain: "$(3, 9)$ is the midpoint; $m = 3$ is only half the work.",
  },
  { type: "h", text: "Signs, and the point that gives you c for free" },
  {
    type: "p",
    md: "**Falling means negative.** Through $(-2, 9)$ and $(3, -1)$: $m = \\dfrac{-1 - 9}{3 - (-2)} = \\dfrac{-10}{5} = -2$. Notice $3 - (-2) = 5$ — subtracting a negative adds. Sketch the two points if you are unsure: downhill from left to right is always a negative gradient.\n**A point on the $y$-axis gives $c$ immediately.** If the line passes through $(0, 5)$, then $c = 5$ and no substitution is needed at all. Missing that turns a two-step question into a four-step one, with two extra chances to slip.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2023 M4 Q11 and Summer 2025 M4 Q2",
    md: "The gradient was generally fine. Some candidates did not notice that the $y$-intercept was given by one of the points and went the long way round, making mistakes. A recurring error put the $x$-differences on top of the $y$-differences.",
    source: "ccea-cer:maths:2023-summer:M4:Q11",
  },
  {
    type: "gate", id: "g4", kind: "blank",
    prompt: "A line passes through $(0, 5)$ and $(4, -7)$. Write its equation.",
    answer: "y = −3x + 5",
    explain: "$c = 5$ from the first point; $m = \\dfrac{-12}{4} = -3$.",
  },
  { type: "h", text: "Rearrange before you read" },
  {
    type: "p",
    md: "You can only read $m$ and $c$ off an equation that has a **single $y$** on the left.\n$2y = 6x + 5$ → divide everything by 2 → $y = 3x + 2.5$. The gradient is 3, not 6.\n$3x + 4y = 24$ → $4y = -3x + 24$ → $y = -\\tfrac{3}{4}x + 6$. Gradient $-\\tfrac{3}{4}$, intercept 6.\nThat second form is also the quickest to **draw**: put $x = 0$ to get $(0, 6)$, put $y = 0$ to get $(8, 0)$, plot both and rule the line. A third point is worth finding as a check.",
  },
  {
    type: "gate", id: "g5", kind: "number",
    prompt: "What is the gradient of $3y = 12x + 5$?",
    answer: "4",
    explain: "Divide every term by 3: $y = 4x + \\tfrac{5}{3}$.",
  },
  { type: "h", text: "Parallel lines" },
  {
    type: "p",
    md: "Two lines are parallel when they have the **same gradient** and **different intercepts** — same steepness, different starting height, so they never meet.",
  },
  noteFigure(parallelBody, parallelAlt, 470, 400,
    "Parallel lines: equal gradients, different intercepts", "parallel-lines"),
  {
    type: "p",
    md: "So 'write down the equation of any line parallel to $y = 3 - 2x$' is a one-mark gift: the gradient is $-2$, so $y = -2x + 7$ will do, or any other constant except 3.\nA parallel line **through a given point** is the same three-step method with the gradient handed to you. Parallel to $2y = 6x + 5$ through $(1, 4)$: rearrange to get $m = 3$, write $y = 3x + c$, substitute to get $c = 1$, and the line is $y = 3x + 1$.",
  },
  {
    type: "gate", id: "g6", kind: "blank",
    prompt: "Find the line parallel to $y = 4x - 1$ through $(2, 11)$.",
    answer: "y = 4x + 3",
    explain: "Gradient 4; $11 = 8 + c$ gives $c = 3$.",
  },
  { type: "h", text: "Real-life graphs: use the scales" },
  {
    type: "p",
    md: "When the axes are 'days' and 'pounds', a gradient is still rise over run — but a square across and a square up are different amounts, so counting squares gives a number that means nothing.",
  },
  noteFigure(hireBody, hireAlt, 560, 400,
    "Read two points using the axis values, then divide the change in cost by the change in days", "real-life-gradient"),
  {
    type: "p",
    md: "Choose two points that are **far apart** and sit on grid intersections: $(1, 37)$ and $(4, 73)$. Then $m = \\dfrac{73 - 37}{4 - 1} = \\dfrac{36}{3} = 12$.\nThe interpretation needs the units of **both** axes: 'the cost rises by £12 for each extra day'. And the intercept has a meaning too — it is the fixed charge of £25 paid before any days are counted, so $C = 12d + 25$.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2023 M3 Q14 and M4 Q2",
    md: "Counting squares while ignoring the scales produced answers such as 23 and 1.5, and some candidates simply divided the two values shown. Good candidates who chose awkward points lost accuracy. The interpretation needed 'cost per day'; some used scatter-graph language instead.",
    source: "ccea-cer:maths:2023-summer:M3:Q14",
  },
  {
    type: "gate", id: "g7", kind: "number",
    prompt: "With $C = 12d + 25$, the cost of a 3-day hire, in pounds, is",
    answer: "61",
    explain: "$12 \\times 3 + 25 = 61$.",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$; substitute a point to find $c$; a point with $x = 0$ gives $c$ directly; parallel means equal gradients; rearrange to $y = mx + c$ before reading anything.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "**Perpendicular** lines and the negative reciprocal gradient are M4, not M3. The equation of a circle and its tangent, and the gradient of a curve, are M8.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "Expect a 3-mark 'find the equation through two points' among the last five questions of M3, and often a real-life graph earlier worth 3-4 marks. The 1-mark 'any line parallel to' is free marks when it appears.\nThe **first** mark is the gradient formula with the numbers in it — write $\\dfrac{13 - 1}{6 - 2}$ down, because a correct formula with an arithmetic slip still scores.\nThe **last** mark is the complete equation, starting with $y =$, with $c$ found and the sign of $m$ checked against the direction of the line.\nIf you are stuck, find the gradient and write it down. Two of the three marks live there, and it is the only part that cannot be guessed.",
  },
  { type: "prompt", promptId: `rp.${T}.02` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.06` },
  { type: "prompt", promptId: `rp.${T}.07` },
  { type: "prompt", promptId: `rp.${T}.09` },
];

assertNoFailures("t9 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
