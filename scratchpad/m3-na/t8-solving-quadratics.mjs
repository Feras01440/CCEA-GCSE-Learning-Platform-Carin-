/** maths.m3.solving-quadratic-equations-by-factorising — H bundle (difficulty 4). */
import fs from "node:fs";
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, equiv, ev, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

import { roots as rootsOf } from "./error-routes.mjs";

/** A two-root answer as a comma-separated solution set, computed from the coefficients. */
const solutionSet = (letter, a, b, c) => {
  const rs = rootsOf(a, b, c);
  if (rs.length !== 2) throw new Error(`solutionSet: ${a}x^2+${b}x+${c} has ${rs.length} real roots`);
  return algAnswer(rs.map((r) => `${letter}=${r}`).join(", "), { equivalence: "equivalent", variables: [] });
};

const T = "maths.m3.solving-quadratic-equations-by-factorising";
const SLUG = "solving-quadratic-equations-by-factorising";
const REF = ["M3-NA-11"];
const insight = JSON.parse(fs.readFileSync(`packs/maths/insights/m3.${SLUG}.json`, "utf8"));

// ---------------------------------------------------------------- checks
const P = [{ x: 2 }, { x: -3 }, { x: 0.5 }];
const at = (v, pts = [2, -3, 0.5]) => pts.map((p) => ({ [v]: p }));
const C = {
  a: equiv("x²+5x-24", "(x+8)*(x-3)", "x**2 + 5*x - 24", P),
  b: equiv("x²-7x", "x*(x-7)", "x**2 - 7*x", P),
  c: equiv("x²-9x", "x*(x-9)", "x**2 - 9*x", P),
  d: equiv("x²-49", "(x+7)*(x-7)", "x**2 - 49", P),
  e: equiv("x²+3x-40", "(x+8)*(x-5)", "x**2 + 3*x - 40", P),
  f: equiv("2x²-18", "2*(x+3)*(x-3)", "2*x**2 - 18", P),
  g: equiv("x²-10x+21", "(x-3)*(x-7)", "x**2 - 10*x + 21", P),
  h: equiv("c²-11c+30", "(c-5)*(c-6)", "c**2 - 11*c + 30", at("c")),
  i: equiv("x²+4x-12", "(x+6)*(x-2)", "x**2 + 4*x - 12", P),
  j: equiv("x²-6x-27", "(x-9)*(x+3)", "x**2 - 6*x - 27", P),
  k: equiv("n²+n-156", "(n+13)*(n-12)", "n**2 + n - 156", at("n")),
  l: equiv("x²-31x+168", "(x-7)*(x-24)", "x**2 - 31*x + 168", P),
  m: equiv("x²+2x-35", "(x+7)*(x-5)", "x**2 + 2*x - 35", P),
  n: equiv("y²-13y+42", "(y-6)*(y-7)", "y**2 - 13*y + 42", at("y")),
  o: equiv("x²-5x-14", "(x-7)*(x+2)", "x**2 - 5*x - 14", P),
  p: equiv("rect diag setup", "x**2 + (31-x)**2", "2*x**2 - 62*x + 961", P),
};
// Roots verified by substitution
const roots = {
  "x^2+5x-24=0": { expr: "x**2 + 5*x - 24", rs: [-8, 3] },
  "x^2-7x=0": { expr: "x**2 - 7*x", rs: [0, 7] },
  "x^2=9x": { expr: "x**2 - 9*x", rs: [0, 9] },
  "x^2-49=0": { expr: "x**2 - 49", rs: [-7, 7] },
  "x^2+3x=40": { expr: "x**2 + 3*x - 40", rs: [-8, 5] },
  "2x^2-18=0": { expr: "2*x**2 - 18", rs: [-3, 3] },
  "x^2-10x+21=0": { expr: "x**2 - 10*x + 21", rs: [3, 7] },
  "x^2+4x=12": { expr: "x**2 + 4*x - 12", rs: [-6, 2] },
  "x^2-6x-27=0": { expr: "x**2 - 6*x - 27", rs: [-3, 9] },
  "n^2+n-156=0": { expr: "x**2 + x - 156", rs: [-13, 12] },
  "x^2-31x+168=0": { expr: "x**2 - 31*x + 168", rs: [7, 24] },
  "x^2+2x-35=0": { expr: "x**2 + 2*x - 35", rs: [-7, 5] },
  "y^2-13y+42=0": { expr: "x**2 - 13*x + 42", rs: [6, 7] },
  "x^2-5x-14=0": { expr: "x**2 - 5*x - 14", rs: [-2, 7] },
};
for (const [name, r] of Object.entries(roots)) {
  for (const root of r.rs) expect(`${name} root ${root}`, ev(r.expr, { x: root }), 0, 1e-9);
}
// Context checks
expect("rect 5 by 8 area", 5 * (5 + 3), 40);
expect("diag 7,24", 7 ** 2 + 24 ** 2, 625);
expect("diag 24,7 sum", 7 + 24, 31);
expect("consecutive 12,13", 12 * 13, 156);
expect("triangle base 9 height 4", 0.5 * 9 * 4, 18);
expect("triangle from x=5", 0.5 * (5 + 4) * (5 - 1), 18);
expect("number 9 check", 9 ** 2, 6 * 9 + 27);
assertNoFailures("t8 checks");

// ---------------------------------------------------------------- figures
const zeroBody = `
<g ${MATHTXT} font-size='24' text-anchor='middle'>
  <text x='330' y='52'>(x + 8)(x - 3) = 0</text>
  <text x='160' y='186'>x + 8 = 0</text>
  <text x='500' y='186'>x - 3 = 0</text>
  <text x='160' y='240'>x = -8</text>
  <text x='500' y='240'>x = 3</text>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.6'>
  <path d='M300 70 L160 148'/><path d='M156 140 L160 152 L168 146'/>
  <path d='M360 70 L500 148'/><path d='M492 146 L500 152 L504 140'/>
</g>
<g ${TXT} font-size='16' text-anchor='middle'>
  <text x='330' y='112'>a product is zero only if one of its factors is zero</text>
  <text x='330' y='290'>two brackets, two solutions - both go on the answer line</text>
</g>`;
const zeroAlt =
  "The equation (x + 8)(x - 3) = 0 branching into two: x + 8 = 0 giving x = -8, and x - 3 = 0 giving x = 3. A caption says a product is zero only if one of its factors is zero, and that two brackets give two solutions.";
const zeroFig = svgFig(zeroBody, zeroAlt, 660, 310);

const rectBody = `
<g fill='currentColor' fill-opacity='0.07' stroke='currentColor' stroke-width='1.7'>
  <rect x='70' y='70' width='380' height='150'/>
</g>
<g ${TXT} font-size='17' text-anchor='middle'>
  <text x='260' y='52'>(x + 3) metres</text>
  <text x='260' y='152'>area = 40 m²</text>
  <text x='260' y='268'>x(x + 3) = 40, so x² + 3x - 40 = 0</text>
</g>
<g ${TXT} font-size='17' text-anchor='start'><text x='466' y='150'>x metres</text></g>`;
const rectAlt =
  "A rectangle labelled x metres high and (x + 3) metres wide, with area 40 square metres marked inside. Underneath: x(x + 3) = 40, so x squared plus 3x minus 40 = 0.";
const rectFig = svgFig(rectBody, rectAlt, 620, 288);

const diagBody = `
<g fill='none' stroke='currentColor' stroke-width='1.7'>
  <rect x='70' y='60' width='340' height='170'/>
  <path d='M70 230 L410 60'/>
  <path d='M70 206 L94 206 L94 230'/>
</g>
<g ${TXT} font-size='16' text-anchor='middle'>
  <text x='240' y='44'>(31 - x) cm</text>
  <text x='268' y='132'>25 cm</text>
  <text x='240' y='286'>x² + (31 - x)² = 25², so x² - 31x + 168 = 0</text>
</g>
<g ${TXT} font-size='16' text-anchor='start'><text x='424' y='150'>x cm</text></g>`;
const diagAlt =
  "A rectangle with width (31 - x) cm and height x cm, with a diagonal of 25 cm drawn and a right angle marked in the bottom left corner. Underneath: x squared plus (31 - x) squared equals 25 squared, so x squared minus 31x plus 168 = 0.";
const diagFig = svgFig(diagBody, diagAlt, 620, 304);

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statement M3-NA-11: set up and solve quadratic equations using FACTORS. The coefficient of x² is 1, or becomes 1 after a numerical common factor is removed. The quadratic formula, completing the square and equations that do not factorise are M4.",
  formula: "The quadratic formula is on the Higher sheet but is deliberately not used here: this statement asks for a solution by factors. Pythagoras' theorem is not on the sheet and must be known for the setup questions.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Factorise, Solve, Hence, Show that, Form an equation, Find).",
  tariff: "Tariffs match the corpus: 'Factorise' 2 marks then 'Hence solve' 2 marks (Summer 2023 M3 Q21, Summer 2023 M4 Q10); a 'show that' setup 4 marks with the solve worth 2 (Summer 2024 M3 Q28); a standalone solve 3 marks.",
  copy: "Compared by hand against the M3 papers and schemes read for this batch (Summer 2024 Q28, Summer 2025 Q25, November 2025 Q28, Summer 2026 Q25): every equation, context and number here is new; no eight-word sequence in common.",
  symbolic: "Each factorisation verified by expansion at three values, and every root substituted back into its own equation to confirm it gives zero.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Solve $x^2 + 5x - 24 = 0$.",
    figure: zeroFig,
    steps: [
      {
        n: 1,
        working: "It is already in the form $= 0$, so factorise: two numbers multiplying to $-24$ and adding to 5 are $+8$ and $-3$.",
        decision: "A quadratic can only be solved by factors once one side is zero. Here it already is, so the first move is the factorisation.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$(x + 8)(x - 3) = 0$",
        decision: "Keep the $= 0$ on the line. It is the whole reason the factorisation is useful.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "Either $x + 8 = 0$ or $x - 3 = 0$",
        decision: "Two numbers multiply to zero only if at least one of them **is** zero. That is the step the factorising was for, and it is what splits the problem into two easy ones.",
        whyMenu: {
          options: [
            "Because a product can only be zero when one of its factors is zero",
            "Because both brackets must be zero at the same time",
            "Because zero divided by a bracket is zero",
          ],
          correct: 0,
          explain: "If neither bracket were zero, their product would be some non-zero number.",
        },
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$x = -8$ or $x = 3$",
        decision: "Two brackets, two solutions. Both go on the answer line: reporting only the positive one is the single most reported loss on this topic.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$x = -8$ or $x = 3$",
    twin: {
      stem: "Solve $x^2 + 2x - 35 = 0$.",
      answer: solutionSet("x", 1, 2, -35),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Solve $x^2 = 9x$.",
    steps: [
      {
        n: 1,
        working: "Rearrange to make one side zero: $x^2 - 9x = 0$.",
        decision: "Never divide both sides by $x$. It looks tidy and it destroys a solution, because $x$ might be zero and dividing by zero is not allowed.",
        whyMenu: {
          options: [
            "Dividing by $x$ assumes $x$ is not zero, and here $x = 0$ is one of the answers",
            "Dividing by $x$ is fine because $x$ cancels",
            "Dividing by $x$ gives $x = 9$, which is the only solution",
          ],
          correct: 0,
          explain: "Substituting $x = 0$ into the original gives $0 = 0$, so it genuinely is a solution.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "Both terms contain $x$, so $x(x - 9) = 0$.",
        decision: "With no constant term the factorisation is a common factor, not two full brackets. It is still a product equal to zero, which is all that matters.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$x = 0$ or $x - 9 = 0$",
        decision: "The first 'bracket' is the single $x$. It is a factor like any other, so it gives a solution like any other.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$x = 0$ or $x = 9$",
        decision: "Check both: $0^2 = 9 \\times 0$ is true, and $81 = 81$ is true. Two solutions, both correct.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$x = 0$ or $x = 9$",
    twin: {
      stem: "Solve $x^2 = 7x$.",
      answer: solutionSet("x", 1, -7, 0),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3, 4] }, { showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
  {
    id: `we.${T}.03`,
    topic: T, specRefs: REF, paper: M3,
    stem: "A rectangular vegetable bed is $x$ metres wide and $(x + 3)$ metres long. Its area is 40 m².\n\nForm an equation and solve it to find the width of the bed.",
    figure: rectFig,
    steps: [
      {
        n: 1,
        working: "$x(x + 3) = 40$",
        decision: "Area is length times width. Writing the equation before expanding anything is a mark in its own right.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$x^2 + 3x = 40$, so $x^2 + 3x - 40 = 0$",
        decision: "Expand, then move everything to one side so that the other side is zero. The factorising method needs that zero.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$(x + 8)(x - 5) = 0$, so $x = -8$ or $x = 5$",
        decision: "Two numbers multiplying to $-40$ and adding to 3 are $+8$ and $-5$. Both roots are written down before either is discussed.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$x = -8$ is rejected because a width cannot be negative, so the bed is 5 m wide.",
        decision: "The rejection needs a **reason** in words. Simply omitting the negative root looks like forgetting it; saying why it is impossible is what earns the mark and shows the context has been understood.",
        whyMenu: {
          options: [
            "Because a length cannot be negative, so $x = -8$ has no meaning here",
            "Because negative answers are never allowed in algebra",
            "Because the larger root is always the answer",
          ],
          correct: 0,
          explain: "The root $-8$ satisfies the equation perfectly well; it is the context, not the algebra, that rules it out.",
        },
        earns: ["MA1"],
      },
    ],
    finalAnswer: "The bed is 5 m wide (and 8 m long, giving an area of 40 m²)",
    twin: {
      stem: "A rectangular tray is $x$ cm wide and $(x + 4)$ cm long. Its area is 45 cm². Form an equation and solve it to find the width.",
      answer: numAnswer(5, { unit: "cm", unitRequired: false }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3, 4] }, { showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.03`,
    version: 1,
  },
  {
    id: `we.${T}.04`,
    topic: T, specRefs: REF, paper: M3,
    stem: "A rectangle has a diagonal of 25 cm. Its height is $x$ cm and its width is $(31 - x)$ cm.\n\nShow that $x^2 - 31x + 168 = 0$, and hence find the two possible heights.",
    figure: diagFig,
    steps: [
      {
        n: 1,
        working: "The diagonal makes a right-angled triangle with the two sides, so $x^2 + (31 - x)^2 = 25^2$.",
        decision: "A rectangle with its diagonal is a Pythagoras question in disguise. Spotting that is the first mark, and it is the step examiners report as missing.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$x^2 + 961 - 62x + x^2 = 625$",
        decision: "$(31 - x)^2$ is a squared bracket, so it has three terms: $961 - 62x + x^2$. Squaring each term separately would lose the middle one.",
        whyMenu: {
          options: [
            "$(31 - x)^2 = (31 - x)(31 - x) = 961 - 31x - 31x + x^2$",
            "$(31 - x)^2 = 961 - x^2$",
            "$(31 - x)^2 = 961 + x^2$",
          ],
          correct: 0,
          explain: "Squaring a bracket means multiplying it by itself, which gives four products and a middle term of $-62x$.",
        },
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$2x^2 - 62x + 961 - 625 = 0$, so $2x^2 - 62x + 336 = 0$, and dividing by 2 gives $x^2 - 31x + 168 = 0$.",
        decision: "Collect, move everything to one side, then divide through by the common factor 2 to reach the printed line exactly.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$(x - 7)(x - 24) = 0$, so $x = 7$ or $x = 24$.",
        decision: "Two numbers multiplying to 168 and adding to 31 are 7 and 24. Both are valid here: a $7 \\times 24$ rectangle and a $24 \\times 7$ rectangle are the same rectangle seen two ways, and $7^2 + 24^2 = 625$.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$x = 7$ or $x = 24$ (the rectangle is 7 cm by 24 cm)",
    twin: {
      stem: "A rectangle has a diagonal of 13 cm. Its height is $x$ cm and its width is $(17 - x)$ cm. Show that $x^2 - 17x + 60 = 0$ and find the two possible heights.",
      answer: solutionSet("x", 1, -17, 60),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.04`,
    version: 1,
  },
];
expect("twin tray", 5 * (5 + 4), 45);
expect("twin diag 5,12", 5 ** 2 + 12 ** 2, 169);
expect("twin diag sum", 5 + 12, 17);
expect("twin diag quad", 5 ** 2 - 17 * 5 + 60, 0);
expect("twin diag quad 12", 12 ** 2 - 17 * 12 + 60, 0);
assertNoFailures("t8 worked examples");

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`, topic: T, specRefs: REF, when: "pre",
    items: [
      dxItem("01", "$(x + 4)(x - 6) = 0$. What are the solutions?", "Use the zero-product principle",
        [
          ["$x = -4$ or $x = 6$", true, null, "Each bracket set to zero in turn. A product is zero only when one of its factors is zero."],
          ["$x = 4$ or $x = -6$", false, "maths.factorising.sign-errors-in-brackets", "The signs were copied straight from the brackets. $x + 4 = 0$ gives $x = -4$, not $+4$."],
          ["$x = 6$ only", false, "maths.quadratics.negative-root-discarded", "Two brackets give two solutions. Summer 2023 M4 Q10 reported many candidates writing only the positive root."],
        ], 20),
      dxItem("02", "Solve $x^2 - 10x + 21 = 0$.", "Solve a quadratic already equal to zero",
        [
          ["$x = 3$ or $x = 7$", true, null, "$(x - 3)(x - 7) = 0$: two numbers multiplying to 21 and adding to 10, both negative."],
          ["$x = -3$ or $x = -7$", false, "maths.factorising.sign-errors-in-brackets", "The brackets are $(x - 3)$ and $(x - 7)$, so setting them to zero gives positive values."],
          ["$x = 21$ or $x = 10$", false, "maths.quadratics.treat-as-linear", "The numbers from the equation were copied out. They are the product and the sum of the two solutions, not the solutions themselves."],
        ], 30),
      dxItem("03", "Solve $x^2 = 7x$.", "Keep the zero root",
        [
          ["$x = 0$ or $x = 7$", true, null, "Rearranged to $x(x - 7) = 0$. The single $x$ is a factor, so $x = 0$ is a genuine solution: $0^2 = 7 \\times 0$."],
          ["$x = 7$ only", false, "maths.quadratics.negative-root-discarded", "Both sides were divided by $x$, which quietly assumes $x$ is not zero and throws a solution away."],
          ["$x = 7$ or $x = -7$", false, "maths.quadratics.treat-as-linear", "That would solve $x^2 = 49$. Here the right-hand side is $7x$, so the equation rearranges to $x^2 - 7x = 0$."],
        ], 35),
      dxItem("04", "Part (a) asked you to factorise $x^2 + 5x - 24$. Part (b) says 'Hence solve $x^2 + 5x - 24 = 0$'. What does 'hence' tell you?", "Use the previous part",
        [
          ["Use your factorisation from (a): set each bracket to zero", true, null, "'Hence' means the earlier result is the route. Summer 2023 M3 Q21 reported that very few saw the link."],
          ["Start again with trial and improvement", false, "maths.quadratics.no-link-between-parts", "Trial earns no method marks, and the answer is already half-written in part (a)."],
          ["Use the quadratic formula", false, "maths.quadratics.no-link-between-parts", "It would give the right roots, but 'hence' asks for the factorising route, and this statement is about solving by factors."],
        ], 30),
      dxItem("05", "Solve $2x^2 - 18 = 0$.", "Take out a common factor first",
        [
          ["$x = 3$ or $x = -3$", true, null, "$2(x^2 - 9) = 0$, so $2(x + 3)(x - 3) = 0$ and the two brackets give $\\pm 3$. The 2 cannot be zero, so it contributes nothing."],
          ["$x = 3$ only", false, "maths.quadratics.negative-root-discarded", "A difference of two squares always gives a pair. $(-3)^2 = 9$ as well, so $-3$ works too."],
          ["$x = 9$ or $x = -9$", false, "maths.quadratics.treat-as-linear", "The 2 was divided out but the square root was not taken: $x^2 = 9$ gives $x = \\pm 3$."],
        ], 35),
      dxItem("06", "A rectangle is $x$ m wide and $(x + 3)$ m long with area 40 m². Solving gives $x = 5$ or $x = -8$. What goes on the answer line?", "Reject a root with a reason",
        [
          ["5, because a width cannot be negative", true, null, "The reason is part of the answer. Stating it shows the context was understood and it is what the scheme rewards."],
          ["5 and −8", false, "maths.quadratics.no-validity-check-of-roots", "Both satisfy the equation, but a width of −8 m has no meaning. The context rules one out."],
          ["5, with no reason given", false, "maths.quadratics.no-validity-check-of-roots", "The value is right and most of the marks are safe, but the mark for rejecting the negative root asks for the reason in words."],
        ], 35),
      dxItem("07", "Factorise and solve $c^2 - 11c + 30 = 0$.", "Use the letter in the question",
        [
          ["$c = 5$ or $c = 6$", true, null, "$(c - 5)(c - 6) = 0$. The equation is in $c$, so the answer is in $c$."],
          ["$x = 5$ or $x = 6$", false, "maths.factorising.wrong-variable-letter", "The values are right but the letter changed. November 2025 M3 Q28 and M4 Q13 both reported a mark lost for switching to $x$."],
          ["$c = -5$ or $c = -6$", false, "maths.factorising.sign-errors-in-brackets", "The brackets are $(c - 5)$ and $(c - 6)$, so the solutions are positive."],
        ], 30),
      dxItem("08", "A question says 'Show that $x^2 - 31x + 168 = 0$'. What must your working do?", "Answer a 'show that' properly",
        [
          ["Start from the information given and reach that line, with every step visible", true, null, "A forward chain. The printed line is the destination, never a starting point."],
          ["Substitute $x = 7$ and check it gives zero", false, "maths.quadratics.show-that-fudged", "That verifies one root; it does not show where the equation comes from, and it earns nothing."],
          ["Solve the equation and give both roots", false, "maths.quadratics.show-that-solve-instead", "Solving is usually the next part. Summer 2024 M3 Q28 reported many candidates skipping the setup and solving the printed equation instead."],
        ], 35),
    ],
  },
];

// ---------------------------------------------------------------- questions
const mk = (n, o) => question({ id: `q.${T}.${String(n).padStart(4, "0")}`, topic: T, specRefs: REF, ...o });

const questions = [
  mk(1, {
    style: "practice", difficulty: 1, commandWords: ["Solve"], paper: M7P1,
    setting: "Pure algebra, already factorised, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q10"],
    solutionProgram: "(x+4)(x-6) = 0 gives x = -4 and x = 6; substituting: (-4)^2 - 2(-4) - 24 = 16 + 8 - 24 = 0 and 36 - 12 - 24 = 0",
    parts: [{
      id: "main", verb: "solve", marks: 2,
      stem: "Solve $(x + 4)(x - 6) = 0$.",
      answer: solutionSet("x", 1, -2, -24),
      scheme: [A("A1", 1, "x = −4"), A("A2", 1, "x = 6")],
      hints: ["A product is zero only when one of its factors is zero.", "Set each bracket equal to zero in turn."],
      workedSolution: "$x + 4 = 0$ gives $x = -4$; $x - 6 = 0$ gives $x = 6$.",
      commonErrors: [{
        misconception: "maths.factorising.sign-errors-in-brackets",
        pattern: { kind: "numeric" },
        feedback: "The signs were copied from the brackets. Solving $x + 4 = 0$ means subtracting 4, which gives $x = -4$.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2023-summer:M4:Q10",
      }],
      requiresWorking: false,
    }],
  }),
  mk(2, {
    style: "practice", difficulty: 2, commandWords: ["Solve"], paper: M7P1,
    setting: "Pure algebra, equations already equal to zero, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q21"],
    solutionProgram: C.g + "; roots 3 and 7 substituted into x^2 - 10x + 21 give 9 - 30 + 21 = 0 and 49 - 70 + 21 = 0 | " + C.a + "; roots -8 and 3 give 64 - 40 - 24 = 0 and 9 + 15 - 24 = 0",
    parts: [
      {
        id: "a", verb: "solve", marks: 3,
        stem: "Solve $x^2 - 10x + 21 = 0$.",
        answer: solutionSet("x", 1, -10, 21),
        scheme: [
          M("M1", 1, "(x − 3)(x − 7) = 0"),
          A("A1", 1, "x = 3", { dependsOn: ["M1"] }),
          A("A2", 1, "x = 7", { dependsOn: ["M1"] }),
        ],
        hints: ["Two numbers multiplying to 21 and adding to 10, both negative.", "$(x - 3)(x - 7) = 0$.", "Set each bracket to zero."],
        workedSolution: "$(x - 3)(x - 7) = 0$, so $x = 3$ or $x = 7$.",
        commonErrors: [{
          misconception: "maths.quadratics.negative-root-discarded",
          pattern: { kind: "numeric" },
          feedback: "Only one root was given. Two brackets always produce two solutions, and each carries its own accuracy mark.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2023-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 3,
        stem: "Solve $x^2 + 5x - 24 = 0$.",
        answer: solutionSet("x", 1, 5, -24),
        scheme: [
          M("M1", 1, "(x + 8)(x − 3) = 0"),
          A("A1", 1, "x = −8", { dependsOn: ["M1"] }),
          A("A2", 1, "x = 3", { dependsOn: ["M1"] }),
        ],
        hints: ["Opposite signs, because the constant is negative.", "$8 \\times (-3) = -24$ and $8 - 3 = 5$."],
        workedSolution: "$(x + 8)(x - 3) = 0$, so $x = -8$ or $x = 3$.",
        commonErrors: [{
          misconception: "maths.quadratics.negative-root-discarded",
          pattern: { kind: "numeric" },
          feedback: "The negative root was dropped. There is no context here to rule it out, so both values belong on the answer line.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(3, {
    style: "practice", difficulty: 2, commandWords: ["Factorise", "Hence"],
    setting: "Pure algebra, the standard factorise-then-solve pair",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q21", "ccea-cer:maths:2023-summer:M4:Q10"],
    solutionProgram: C.m + "; roots -7 and 5 substituted into x^2 + 2x - 35 give 49 - 14 - 35 = 0 and 25 + 10 - 35 = 0",
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $x^2 + 2x - 35$.",
        answer: algAnswer("(x+7)(x-5)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket"), A("A2", 1, "(x + 7)(x − 5)")],
        hints: ["Opposite signs, differing by 2.", "$7 \\times 5 = 35$."],
        workedSolution: "$7 \\times (-5) = -35$ and $7 - 5 = 2$, so $x^2 + 2x - 35 = (x + 7)(x - 5)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x-7)(x+5)" },
          feedback: "That expands to $x^2 - 2x - 35$. The middle term is $+2x$, so the larger number, 7, is the positive one.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "solve", marks: 2,
        stem: "Hence solve $x^2 + 2x - 35 = 0$.",
        answer: solutionSet("x", 1, 2, -35),
        scheme: [
          MA("MA1", 1, "their brackets each set equal to zero", { ft: true }),
          A("A1", 1, "x = −7 and x = 5 (both)", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["'Hence' means use part (a).", "Set each bracket to zero.", "Both values are wanted."],
        workedSolution: "From (a), $(x + 7)(x - 5) = 0$, so $x + 7 = 0$ or $x - 5 = 0$, giving $x = -7$ or $x = 5$.",
        commonErrors: [
          {
            misconception: "maths.quadratics.no-link-between-parts",
            pattern: { kind: "text", regex: "trial|guess|try x" },
            feedback: "Trial and improvement earns no method marks. Part (a) has already done the work; 'hence' is the instruction to use it.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M3:Q21",
          },
          {
            misconception: "maths.quadratics.negative-root-discarded",
            pattern: { kind: "numeric" },
            feedback: "Only the positive root was written. Summer 2023 M4 Q10 reported this directly: many who made the link still gave one root.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2023-summer:M4:Q10",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(4, {
    style: "practice", difficulty: 3, commandWords: ["Solve"],
    setting: "Pure algebra, rearranging to equal zero first",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: C.e + "; x^2 + 3x = 40 rearranges to x^2 + 3x - 40 = 0, roots -8 and 5 (64 - 24 - 40 = 0; 25 + 15 - 40 = 0) | " + C.i + "; x^2 + 4x = 12 has roots -6 and 2 (36 - 24 - 12 = 0; 4 + 8 - 12 = 0)",
    parts: [
      {
        id: "a", verb: "solve", marks: 3,
        stem: "Solve $x^2 + 3x = 40$.",
        answer: solutionSet("x", 1, 3, -40),
        scheme: [
          M("M1", 1, "rearranged to x² + 3x − 40 = 0"),
          A("A1", 1, "(x + 8)(x − 5) = 0", { dependsOn: ["M1"] }),
          A("A2", 1, "x = −8 and x = 5 (both)", { dependsOn: ["A1"] }),
        ],
        hints: ["One side has to be zero before factorising helps.", "Subtract 40 from both sides.", "$8 \\times (-5) = -40$ and $8 - 5 = 3$."],
        workedSolution: "$x^2 + 3x - 40 = 0$, so $(x + 8)(x - 5) = 0$ and $x = -8$ or $x = 5$.",
        commonErrors: [{
          misconception: "maths.quadratics.treat-as-linear",
          pattern: { kind: "numeric" },
          feedback: "The terms were moved about as if the equation were linear. A quadratic is solved by getting zero on one side and factorising, not by isolating $x$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 3,
        stem: "Solve $x^2 + 4x = 12$.",
        answer: solutionSet("x", 1, 4, -12),
        scheme: [
          M("M1", 1, "rearranged to x² + 4x − 12 = 0"),
          A("A1", 1, "(x + 6)(x − 2) = 0", { dependsOn: ["M1"] }),
          A("A2", 1, "x = −6 and x = 2 (both)", { dependsOn: ["A1"] }),
        ],
        hints: ["Make one side zero.", "$6 \\times (-2) = -12$ and $6 - 2 = 4$."],
        workedSolution: "$x^2 + 4x - 12 = 0$, so $(x + 6)(x - 2) = 0$ and $x = -6$ or $x = 2$.",
        commonErrors: [{
          misconception: "maths.quadratics.negative-root-discarded",
          pattern: { kind: "numeric" },
          feedback: "The negative root was left out. With no context to rule it out, both solutions are needed.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(5, {
    style: "practice", difficulty: 3, commandWords: ["Solve"],
    setting: "Pure algebra, no constant term",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: C.b + "; x^2 = 7x gives x(x-7) = 0, roots 0 and 7 (0 = 0; 49 = 49) | " + C.c + "; x^2 = 9x gives roots 0 and 9",
    parts: [
      {
        id: "a", verb: "solve", marks: 3,
        stem: "Solve $x^2 = 9x$.",
        answer: solutionSet("x", 1, -9, 0),
        scheme: [
          M("M1", 1, "rearranged to x² − 9x = 0 (not divided by x)"),
          A("A1", 1, "x(x − 9) = 0", { dependsOn: ["M1"] }),
          A("A2", 1, "x = 0 and x = 9 (both)", { dependsOn: ["A1"] }),
        ],
        hints: ["Move everything to one side rather than dividing by $x$.", "Both terms share a factor of $x$.", "The single $x$ is a factor, so it gives a solution too."],
        workedSolution: "$x^2 - 9x = 0$, so $x(x - 9) = 0$ and $x = 0$ or $x = 9$. Check: $0^2 = 9 \\times 0$ and $81 = 81$.",
        commonErrors: [{
          misconception: "maths.quadratics.negative-root-discarded",
          pattern: { kind: "numeric" },
          feedback: "Dividing both sides by $x$ assumes $x$ is not zero, and it quietly removes the solution $x = 0$. Rearrange to zero instead and take the common factor out.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 2,
        stem: "Solve $2x^2 - 18 = 0$.",
        answer: solutionSet("x", 2, 0, -18),
        scheme: [
          M("M1", 1, "2(x + 3)(x − 3) = 0, or x² = 9"),
          A("A1", 1, "x = 3 and x = −3 (both)", { dependsOn: ["M1"] }),
        ],
        hints: ["Take out the common factor 2.", "$x^2 - 9$ is a difference of two squares.", "A square root has two values."],
        workedSolution: "$2(x^2 - 9) = 0$, so $2(x + 3)(x - 3) = 0$ and $x = 3$ or $x = -3$. The factor 2 can never be zero, so it gives no solution.",
        commonErrors: [{
          misconception: "maths.quadratics.negative-root-discarded",
          pattern: { kind: "numeric" },
          feedback: "Only the positive square root was taken. $(-3)^2 = 9$ as well, so $-3$ is equally a solution.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(6, {
    style: "practice", difficulty: 3, commandWords: ["Solve"],
    setting: "Pure algebra, letters other than x",
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q28", "ccea-cer:maths:2025-november:M4:Q13"],
    solutionProgram: C.h + "; roots 5 and 6 give 25 - 55 + 30 = 0 and 36 - 66 + 30 = 0 | " + C.n + "; roots 6 and 7 give 36 - 78 + 42 = 0 and 49 - 91 + 42 = 0",
    parts: [
      {
        id: "a", verb: "solve", marks: 3,
        stem: "Solve $c^2 - 11c + 30 = 0$.",
        answer: solutionSet("c", 1, -11, 30),
        scheme: [
          M("M1", 1, "(c − 5)(c − 6) = 0, in c"),
          A("A1", 1, "c = 5", { dependsOn: ["M1"] }),
          A("A2", 1, "c = 6", { dependsOn: ["M1"], examinerNote: "Answers given as x = 5, x = 6 lose one accuracy mark." }),
        ],
        hints: ["Both numbers negative.", "$5 \\times 6 = 30$ and $5 + 6 = 11$.", "Answer in $c$."],
        workedSolution: "$(c - 5)(c - 6) = 0$, so $c = 5$ or $c = 6$.",
        commonErrors: [{
          misconception: "maths.factorising.wrong-variable-letter",
          pattern: { kind: "text", regex: "x\\s*=\\s*5" },
          feedback: "The values are right but the letter is not. Both November 2025 papers reported a mark lost for switching to $x$ when the question used another letter.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-november:M4:Q13",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 3,
        stem: "Solve $y^2 - 13y + 42 = 0$.",
        answer: solutionSet("y", 1, -13, 42),
        scheme: [
          M("M1", 1, "(y − 6)(y − 7) = 0, in y"),
          A("A1", 1, "y = 6", { dependsOn: ["M1"] }),
          A("A2", 1, "y = 7", { dependsOn: ["M1"] }),
        ],
        hints: ["Both negative again.", "$6 \\times 7 = 42$ and $6 + 7 = 13$."],
        workedSolution: "$(y - 6)(y - 7) = 0$, so $y = 6$ or $y = 7$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "numeric" },
          feedback: "$(y - 6) = 0$ gives $y = +6$. Adding 6 to both sides is the step that fixes the sign.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(7, {
    style: "practice", difficulty: 4, commandWords: ["Form an equation", "Solve"],
    emphasis: ["form an equation"], setting: "A rectangular vegetable bed",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q28"],
    solutionProgram: "x(x+3) = 40 -> x^2 + 3x - 40 = 0 -> (x+8)(x-5) = 0 -> x = -8 or 5; reject -8 (a width cannot be negative); check 5 x 8 = 40",
    figures: [rectFig],
    parts: [{
      id: "main", verb: "form-an-equation", marks: 5,
      stem: "A rectangular vegetable bed is $x$ metres wide and $(x + 3)$ metres long. Its area is 40 m².\n\n**Form an equation** in $x$ and solve it to find the width of the bed. Give a reason for rejecting any solution you do not use.",
      answer: numAnswer(5, { unit: "m", unitRequired: false }),
      scheme: [
        M("M1", 1, "x(x + 3) = 40 formed"),
        A("A1", 1, "x² + 3x − 40 = 0", { dependsOn: ["M1"] }),
        A("A2", 1, "(x + 8)(x − 5) = 0", { dependsOn: ["A1"] }),
        MA("MA1", 1, "x = −8 and x = 5 both obtained"),
        MA("MA2", 1, "x = 5 chosen, with the reason that a width cannot be negative"),
      ],
      hints: ["Area is length × width.", "Expand and move everything to one side.", "$8 \\times (-5) = -40$ and $8 - 5 = 3$.", "One root cannot be a width — say why."],
      workedSolution: "$x(x + 3) = 40$, so $x^2 + 3x - 40 = 0$ and $(x + 8)(x - 5) = 0$, giving $x = -8$ or $x = 5$.\nA width cannot be negative, so $x = -8$ is rejected and the bed is 5 m wide. Check: $5 \\times 8 = 40 \\text{ m}^2$.",
      commonErrors: [
        {
          misconception: "maths.quadratics.no-validity-check-of-roots",
          pattern: { kind: "numeric" },
          feedback: "$-8$ does satisfy the equation, but a bed cannot be $-8$ m wide. The final mark is for choosing 5 and saying why the other root is impossible.",
          marksTypicallyEarned: 4,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        },
        {
          misconception: "maths.quadratics.wrong-shape-formula-setup",
          pattern: { kind: "numeric" },
          feedback: "That comes from $2x + 2(x + 3) = 40$, which is the perimeter. The question gives an area, so the sides are multiplied.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(8, {
    style: "practice", difficulty: 4, commandWords: ["Form an equation", "Solve"],
    setting: "Two consecutive whole numbers with a given product",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q28"],
    solutionProgram: "n(n+1) = 156 -> n^2 + n - 156 = 0 -> (n+13)(n-12) = 0 -> n = -13 or 12; 12 x 13 = 156 and (-13) x (-12) = 156 so both are valid for whole numbers, but positive integers give 12 and 13",
    parts: [{
      id: "main", verb: "form-an-equation", marks: 4,
      stem: "Two consecutive **positive** whole numbers have a product of 156.\n\nBy forming and solving a quadratic equation, find the two numbers.",
      answer: numAnswer(12),
      scheme: [
        M("M1", 1, "n(n + 1) = 156, or equivalent, formed"),
        A("A1", 1, "n² + n − 156 = 0", { dependsOn: ["M1"] }),
        A("A2", 1, "(n + 13)(n − 12) = 0", { dependsOn: ["A1"] }),
        MA("MA1", 1, "12 and 13, with n = −13 rejected as not positive"),
      ],
      hints: ["Call the smaller number $n$; the next one is $n + 1$.", "Their product is 156.", "$13 \\times 12 = 156$, so the numbers in the brackets are 13 and 12."],
      workedSolution: "$n(n + 1) = 156$, so $n^2 + n - 156 = 0$ and $(n + 13)(n - 12) = 0$, giving $n = -13$ or $n = 12$.\nThe numbers must be positive, so $n = 12$ and the pair is 12 and 13. Check: $12 \\times 13 = 156$.",
      commonErrors: [{
        misconception: "maths.quadratics.show-that-solve-instead",
        pattern: { kind: "numeric" },
        feedback: "That is $156 \\div 2$, which is what you would get by treating the numbers as equal. Consecutive means they differ by 1, so the product is $n(n + 1)$.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2024-summer:M3:Q28",
      }],
      requiresWorking: true,
    }],
  }),
  mk(9, {
    style: "practice", difficulty: 4, commandWords: ["Form an equation", "Solve"],
    setting: "A triangular flag with algebraic base and height",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q28"],
    solutionProgram: "(1/2)(x+4)(x-1) = 18 -> (x+4)(x-1) = 36 -> x^2 + 3x - 4 = 36 -> x^2 + 3x - 40 = 0 -> (x+8)(x-5) = 0 -> x = 5 (reject -8, a length cannot be negative); check base 9, height 4, area 18",
    parts: [{
      id: "main", verb: "form-an-equation", marks: 5,
      stem: "A triangular flag has base $(x + 4)$ cm and perpendicular height $(x - 1)$ cm. Its area is 18 cm².\n\nForm an equation in $x$ and solve it to find the base of the flag.",
      answer: numAnswer(9, { unit: "cm", unitRequired: false }),
      scheme: [
        M("M1", 1, "½(x + 4)(x − 1) = 18 formed"),
        A("A1", 1, "(x + 4)(x − 1) = 36, the halving cleared", { dependsOn: ["M1"] }),
        A("A2", 1, "x² + 3x − 40 = 0", { dependsOn: ["A1"] }),
        MA("MA1", 1, "(x + 8)(x − 5) = 0 giving x = −8 or x = 5"),
        MA("MA2", 1, "base = 9 cm, with x = −8 rejected because a length cannot be negative"),
      ],
      hints: ["Area of a triangle is $\\tfrac{1}{2} \\times \\text{base} \\times \\text{height}$.", "Multiply both sides by 2 to clear the half.", "$(x + 4)(x - 1) = x^2 + 3x - 4$.", "The question asks for the base, not for $x$."],
      workedSolution: "$\\tfrac{1}{2}(x + 4)(x - 1) = 18$, so $(x + 4)(x - 1) = 36$ and $x^2 + 3x - 4 = 36$, giving $x^2 + 3x - 40 = 0$.\n$(x + 8)(x - 5) = 0$, so $x = -8$ or $x = 5$. A length cannot be negative, so $x = 5$ and the base is $5 + 4 = 9$ cm. Check: $\\tfrac{1}{2} \\times 9 \\times 4 = 18 \\text{ cm}^2$.",
      commonErrors: [
        {
          misconception: "maths.quadratics.no-validity-check-of-roots",
          pattern: { kind: "numeric" },
          feedback: "$x = 5$ is correct, and four of the five marks are safe. The question asks for the **base**, which is $x + 4 = 9$ cm.",
          marksTypicallyEarned: 4,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        },
        {
          misconception: "maths.quadratics.wrong-shape-formula-setup",
          pattern: { kind: "numeric" },
          feedback: "The halving was left out, so the equation became $(x + 4)(x - 1) = 18$, that is $x^2 + 3x - 22 = 0$. That will not factorise, which is itself the warning: a triangle is half of the rectangle around it, so the 18 has to be doubled to 36 first.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(10, {
    style: "practice", difficulty: 4, commandWords: ["Solve"],
    setting: "Pure algebra, a number described in words",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q21"],
    solutionProgram: C.j + "; x^2 = 6x + 27 rearranges to x^2 - 6x - 27 = 0, roots 9 and -3 (81 - 54 - 27 = 0; 9 + 18 - 27 = 0)",
    parts: [{
      id: "main", verb: "solve", marks: 4,
      stem: "The square of a number is 27 more than six times the number.\n\nForm a quadratic equation and solve it to find the two possible numbers.",
      answer: solutionSet("x", 1, -6, -27),
      scheme: [
        M("M1", 1, "x² = 6x + 27 formed"),
        A("A1", 1, "x² − 6x − 27 = 0", { dependsOn: ["M1"] }),
        A("A2", 1, "(x − 9)(x + 3) = 0", { dependsOn: ["A1"] }),
        MA("MA1", 1, "x = 9 and x = −3, both given"),
      ],
      hints: ["'The square of a number' is $x^2$; 'six times the number' is $6x$.", "Bring everything to one side.", "$-9 \\times 3 = -27$ and $-9 + 3 = -6$.", "Nothing in the wording rules out a negative number."],
      workedSolution: "$x^2 = 6x + 27$, so $x^2 - 6x - 27 = 0$ and $(x - 9)(x + 3) = 0$, giving $x = 9$ or $x = -3$.\nCheck: $81 = 54 + 27$ and $9 = -18 + 27$. Both work, and the question asks for two numbers, so both are kept.",
      commonErrors: [{
        misconception: "maths.quadratics.negative-root-discarded",
        pattern: { kind: "numeric" },
        feedback: "Only the positive value was given. Here the context is just 'a number', which does not rule out $-3$, and the question asks for two.",
        marksTypicallyEarned: 3,
        source: "ccea-cer:maths:2023-summer:M4:Q10",
      }],
      requiresWorking: true,
    }],
  }),
  mk(11, {
    style: "practice", difficulty: 5, commandWords: ["Show that", "Solve"],
    setting: "A rectangle with a given diagonal",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q28"],
    solutionProgram: C.p + "; x^2 + (31-x)^2 = 625 -> 2x^2 - 62x + 961 = 625 -> 2x^2 - 62x + 336 = 0 -> x^2 - 31x + 168 = 0; " + C.l + "; roots 7 and 24 and 7^2 + 24^2 = 625",
    figures: [diagFig],
    parts: [
      {
        id: "a", verb: "show-that", marks: 4,
        stem: "A rectangle has a diagonal of 25 cm. Its height is $x$ cm and its width is $(31 - x)$ cm.\n\nShow that $x^2 - 31x + 168 = 0$.",
        answer: algAnswer("x^2 - 31x + 168 = 0", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "Pythagoras used: x² + (31 − x)² = 25²"),
          A("A1", 1, "(31 − x)² expanded correctly as 961 − 62x + x²", { dependsOn: ["M1"] }),
          MA("MA1", 1, "2x² − 62x + 336 = 0 or equivalent"),
          MA("MA2", 1, "divided by 2 to reach x² − 31x + 168 = 0", { examinerNote: "Starting from the printed equation, or substituting a root, earns nothing." }),
        ],
        hints: ["The diagonal makes a right-angled triangle with the two sides.", "$(31 - x)^2$ has three terms — write it as $(31 - x)(31 - x)$ first.", "Collect and take everything to one side.", "There is a common factor of 2 to divide out."],
        workedSolution: "By Pythagoras, $x^2 + (31 - x)^2 = 25^2$.\n$(31 - x)^2 = 961 - 62x + x^2$, so $x^2 + 961 - 62x + x^2 = 625$.\nCollecting: $2x^2 - 62x + 961 - 625 = 0$, that is $2x^2 - 62x + 336 = 0$.\nDividing by 2: $x^2 - 31x + 168 = 0$, as required.",
        commonErrors: [{
          misconception: "maths.algebra.expand-squared-bracket",
          pattern: { kind: "algebraic", latex: "2x^2 + 336 = 0" },
          feedback: "$(31 - x)^2$ was taken as $961 + x^2$, so the $-62x$ never appeared and the equation collapsed to $2x^2 + 336 = 0$, which no value of $x$ satisfies. Squaring a bracket produces a middle term; write it as two brackets first.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 2,
        stem: "Solve the equation to find the two possible heights of the rectangle.",
        answer: solutionSet("x", 1, -31, 168),
        scheme: [
          MA("MA1", 1, "(x − 7)(x − 24) = 0", { ft: true }),
          A("A1", 1, "x = 7 and x = 24 (both)", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Two numbers multiplying to 168 and adding to 31.", "$7 \\times 24 = 168$.", "Both roots make sense here: they are the two sides of the same rectangle."],
        workedSolution: "$(x - 7)(x - 24) = 0$, so $x = 7$ or $x = 24$. Both are valid: the rectangle is 7 cm by 24 cm, and $7^2 + 24^2 = 625 = 25^2$.",
        commonErrors: [{
          misconception: "maths.quadratics.negative-root-discarded",
          pattern: { kind: "numeric" },
          feedback: "Only one root was given. Here neither is impossible — they are the height and the width of the same rectangle — so both belong on the answer line.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(12, {
    style: "practice", difficulty: 4, commandWords: ["Explain"],
    setting: "Judging a piece of algebra",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: "x^2 = 5x: dividing by x gives x = 5 only; rearranging gives x(x-5) = 0 with roots 0 and 5; substituting x = 0 into the original gives 0 = 0, so 0 is a solution",
    parts: [{
      id: "main", verb: "explain", marks: 3,
      stem: "To solve $x^2 = 5x$, Séamus divides both sides by $x$ and writes $x = 5$.\n\nExplain what is wrong with his method, and give the complete solution.",
      answer: textAnswer(
        ["Dividing by x assumes x is not zero and loses the solution x = 0; the solutions are x = 0 and x = 5"],
        [
          { any: ["divide by x", "assumes x is not zero", "cannot divide by zero", "loses a solution"], marks: 1 },
          { any: ["x = 0", "0 and 5"], marks: 1 },
        ],
      ),
      scheme: [
        MA("MA1", 1, "a statement that dividing by x assumes x ≠ 0 and so loses a solution"),
        MA("MA2", 1, "correct method shown: x² − 5x = 0 and x(x − 5) = 0"),
        A("A1", 1, "x = 0 and x = 5", { dependsOn: ["MA2"] }),
      ],
      hints: ["Put $x = 0$ into the original equation and see whether it works.", "What is not allowed when you divide?", "Rearranging to zero and taking out a common factor keeps both solutions."],
      workedSolution: "Putting $x = 0$ into $x^2 = 5x$ gives $0 = 0$, so $x = 0$ is a genuine solution. Dividing both sides by $x$ assumes $x$ is not zero, so that solution is thrown away.\nThe safe method is to rearrange: $x^2 - 5x = 0$, so $x(x - 5) = 0$ and $x = 0$ or $x = 5$.",
      commonErrors: [{
        misconception: "maths.quadratics.treat-as-linear",
        pattern: { kind: "text", regex: "(correct|nothing wrong|fine)" },
        feedback: "The answer $x = 5$ is one of the two, so the method looks fine until you test $x = 0$. Summer 2025 M4 Q10 reported weaker candidates rearranging a quadratic as if it were linear; the same instinct is at work here.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2025-summer:M4:Q10",
      }],
      requiresWorking: true,
    }],
  }),
  // ------------------------------------------------------------ exam-style
  mk(13, {
    style: "exam-style", difficulty: 4, commandWords: ["Factorise", "Hence"],
    setting: "Pure algebra, in the style of a late M3 two-part item",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q21", "ccea-cer:maths:2023-summer:M4:Q10"],
    solutionProgram: C.o + "; roots 7 and -2 substituted into x^2 - 5x - 14 give 49 - 35 - 14 = 0 and 4 + 10 - 14 = 0",
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise\n\n$x^2 - 5x - 14$",
        answer: algAnswer("(x-7)(x+2)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket"), A("A2", 1, "(x − 7)(x + 2)")],
        hints: ["Opposite signs, difference 5.", "$7 \\times 2 = 14$.", "The middle term is negative, so the 7 is the negative one."],
        workedSolution: "$-7 \\times 2 = -14$ and $-7 + 2 = -5$, so $x^2 - 5x - 14 = (x - 7)(x + 2)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x+7)(x-2)" },
          feedback: "That expands to $x^2 + 5x - 14$. The middle term is $-5x$, so the larger number carries the minus.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "solve", marks: 2,
        stem: "Hence solve\n\n$x^2 - 5x - 14 = 0$",
        answer: solutionSet("x", 1, -5, -14),
        scheme: [
          MA("MA1", 1, "their brackets set equal to zero", { ft: true }),
          A("A1", 1, "x = 7 and x = −2 (both)", { ft: true, dependsOn: ["MA1"], examinerNote: "One root only scores MA1. Trial and improvement scores nothing." }),
        ],
        hints: ["Use part (a).", "Set each bracket to zero.", "Both values are needed."],
        workedSolution: "$(x - 7)(x + 2) = 0$, so $x = 7$ or $x = -2$.",
        commonErrors: [
          {
            misconception: "maths.quadratics.no-link-between-parts",
            pattern: { kind: "text", regex: "trial|guess" },
            feedback: "Summer 2023 M3 Q21 put it plainly: very few connected the two parts, and most offered a single value found by trial. The factorisation is the method the scheme rewards.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M3:Q21",
          },
          {
            misconception: "maths.quadratics.negative-root-discarded",
            pattern: { kind: "numeric" },
            feedback: "One root is on the page and the other is one line away: $x + 2 = 0$ gives $x = -2$.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2023-summer:M4:Q10",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(14, {
    style: "exam-style", difficulty: 5, commandWords: ["Show that", "Solve"],
    setting: "A rectangular garden with a border removed",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q28", "ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: "(x+7)(x+2) - 3^2 = 27 -> x^2 + 9x + 14 - 9 = 27 -> x^2 + 9x - 22 = 0 -> (x+11)(x-2) = 0 -> x = -11 or 2; reject -11 (a length cannot be negative); length = x + 7 = 9 m; check lawn 9 x 4 = 36, pond 9, grass 27",
    parts: [
      {
        id: "a", verb: "show-that", marks: 3,
        stem: "A rectangular lawn measures $(x + 7)$ m by $(x + 2)$ m. A square pond of side 3 m is dug out of it. The area of grass remaining is 27 m².\n\nShow that $x^2 + 9x - 22 = 0$.",
        answer: algAnswer("x^2 + 9x - 22 = 0", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "(x + 7)(x + 2) − 3² = 27 formed"),
          A("A1", 1, "x² + 9x + 14 − 9 = 27", { dependsOn: ["M1"] }),
          MA("MA1", 1, "x² + 9x − 22 = 0 reached"),
        ],
        hints: ["Lawn area minus pond area equals the grass remaining.", "$(x + 7)(x + 2) = x^2 + 9x + 14$.", "The pond is $3 \\times 3 = 9$."],
        workedSolution: "$(x + 7)(x + 2) - 3^2 = 27$.\nExpanding: $x^2 + 9x + 14 - 9 = 27$, that is $x^2 + 9x + 5 = 27$.\nTaking 27 across: $x^2 + 9x - 22 = 0$, as required.",
        commonErrors: [{
          misconception: "maths.quadratics.overlap-ignored-compound-area",
          pattern: { kind: "algebraic", latex: "x^2 + 9x - 16 = 0" },
          feedback: "The pond was subtracted as 3 rather than $3^2$. A square of side 3 m has area 9 m².",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 3,
        stem: "Solve the equation and hence find the length of the lawn. Give a reason for rejecting the other solution.",
        answer: numAnswer(9, { unit: "m", unitRequired: false }),
        scheme: [
          MA("MA1", 1, "(x + 11)(x − 2) = 0, giving x = −11 or x = 2", { ft: true }),
          MA("MA2", 1, "x = 2 chosen, with the reason that a length cannot be negative", { ft: true }),
          A("A1", 1, "length = 9 m", { ft: true, dependsOn: ["MA2"] }),
        ],
        hints: ["Two numbers multiplying to $-22$ and adding to 9.", "$11 \\times (-2) = -22$ and $11 - 2 = 9$.", "The length asked for is $x + 7$, not $x$."],
        workedSolution: "$(x + 11)(x - 2) = 0$, so $x = -11$ or $x = 2$.\nA length cannot be negative, so $x = -11$ is rejected and $x = 2$. The lawn is $x + 7 = 9$ m long.\nCheck: the lawn is $9 \\times 4 = 36 \\text{ m}^2$, the pond is $9 \\text{ m}^2$, and $36 - 9 = 27 \\text{ m}^2$ of grass.",
        commonErrors: [
          {
            misconception: "maths.quadratics.no-validity-check-of-roots",
            pattern: { kind: "numeric" },
            feedback: "A negative value of $x$ would make the width $x + 2$ negative, so it cannot be a length. Test each root against the shape before writing it down.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2024-summer:M3:Q28",
          },
          {
            misconception: "maths.quadratics.wrong-shape-formula-setup",
            pattern: { kind: "numeric" },
            feedback: "$x = 2$ is correct, and two of the three marks are safe. The question asks for the length of the lawn, which is $x + 7 = 9$ m.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2024-summer:M3:Q28",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(15, {
    style: "exam-style", difficulty: 5, commandWords: ["Form an equation", "Solve"],
    setting: "A picture and its mount",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q28", "ccea-cer:maths:2023-summer:M3:Q21"],
    solutionProgram: "framed width x+2, framed height (x+5)+2 = x+7; (x+2)(x+7) = 176 -> x^2 + 9x + 14 = 176 -> x^2 + 9x - 162 = 0 -> (x+18)(x-9) = 0 -> x = -18 or 9; reject -18 (a width cannot be negative); check 11 x 16 = 176",
    parts: [{
      id: "main", verb: "form-an-equation", marks: 5,
      stem: "A rectangular photograph is $x$ cm wide and $(x + 5)$ cm tall.\n\nIt is placed in a frame that adds 2 cm to the width and 2 cm to the height. The framed picture has an area of 176 cm².\n\nForm an equation in $x$ and solve it to find the width of the photograph.",
      answer: numAnswer(6, { unit: "cm", unitRequired: false }),
      scheme: [
        M("M1", 1, "(x + 2)(x + 7) = 176 formed"),
        A("A1", 1, "x² + 9x + 14 = 176", { dependsOn: ["M1"] }),
        A("A2", 1, "x² + 9x − 162 = 0", { dependsOn: ["A1"] }),
        MA("MA1", 1, "(x + 18)(x − 9) = 0 giving x = −18 or x = 9"),
        MA("MA2", 1, "x = 9 chosen, with the reason that a width cannot be negative"),
      ],
      hints: ["The framed width is $x + 2$ and the framed height is $(x + 5) + 2 = x + 7$.", "Their product is 176.", "$x^2 + 9x + 14 = 176$.", "$18 \\times (-9) = -162$ and $18 - 9 = 9$."],
      workedSolution: "Framed width $= x + 2$; framed height $= x + 7$.\n$(x + 2)(x + 7) = 176$, so $x^2 + 9x + 14 = 176$ and $x^2 + 9x - 162 = 0$.\n$(x + 18)(x - 9) = 0$, so $x = -18$ or $x = 9$. A width cannot be negative, so the photograph is 9 cm wide.\nCheck: framed size $11 \\times 16 = 176 \\text{ cm}^2$.",
      commonErrors: [
        {
          misconception: "maths.quadratics.wrong-shape-formula-setup",
          pattern: { kind: "numeric" },
          feedback: "That is the framed width, $x + 2$. The question asks for the width of the photograph itself, which is $x$.",
          marksTypicallyEarned: 4,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        },
        {
          misconception: "maths.quadratics.no-validity-check-of-roots",
          pattern: { kind: "numeric" },
          feedback: "$-18$ satisfies the equation but not the picture: a photograph cannot have a negative width. The last mark is for saying so.",
          marksTypicallyEarned: 4,
          source: "ccea-cer:maths:2024-summer:M3:Q28",
        },
      ],
      requiresWorking: true,
    }],
  }),
];
expect("q14 lawn grass", (2 + 7) * (2 + 2) - 9, 27);
expect("q14 quadratic root", ev("x**2 + 9*x - 22", { x: 2 }), 0);
expect("q14 other root", ev("x**2 + 9*x - 22", { x: -11 }), 0);
expect("q14 length", 2 + 7, 9);
expect("q15 framed", (9 + 2) * (9 + 7), 176);
expect("q15 quadratic root", ev("x**2 + 9*x - 162", { x: 9 }), 0);
expect("q15 other root", ev("x**2 + 9*x - 162", { x: -18 }), 0);
assertNoFailures("t8 questions");

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T, specRefs: REF,
    stem: "Rónán was asked to solve $x^2 + 3x - 28 = 0$. His working:",
    studentWorking: [
      "(x + 7)(x − 4) = 0",
      "x + 7 = 0 or x − 4 = 0",
      "x = 7 or x = 4",
    ],
    mistakeLine: 3,
    misconception: "maths.factorising.sign-errors-in-brackets",
    whatWentWrong: "The numbers were copied straight out of the brackets instead of being solved for. $x + 7 = 0$ means $x = -7$, not $+7$.",
    correction: [
      "(x + 7)(x − 4) = 0",
      "x + 7 = 0 gives x = −7; x − 4 = 0 gives x = 4",
      "x = −7 or x = 4",
    ],
    marksEarnedAsWritten: ["M1"],
    feedback: "The factorisation is correct and earns the method mark, and the two brackets are correctly set to zero. The last line reverses one sign: solving $x + 7 = 0$ means taking 7 from both sides. A quick substitution catches it — $7^2 + 21 - 28 = 42$, not 0, while $(-7)^2 - 21 - 28 = 0$.",
    source: "ccea-cer:maths:2025-november:M3:Q28",
  },
  {
    id: `ftm.${T}.02`,
    topic: T, specRefs: REF,
    stem: "Aoibhe was asked to solve $x^2 = 6x$. Her working:",
    studentWorking: [
      "Divide both sides by x",
      "x = 6",
    ],
    mistakeLine: 1,
    misconception: "maths.quadratics.treat-as-linear",
    whatWentWrong: "Dividing by $x$ assumes $x$ is not zero. Here $x = 0$ satisfies the equation — $0 = 0$ — so a solution has been thrown away.",
    correction: [
      "x² − 6x = 0",
      "x(x − 6) = 0",
      "x = 0 or x = 6",
    ],
    marksEarnedAsWritten: ["MA1"],
    feedback: "One of the two roots is right, so something is salvaged. The habit to build is fixed: a quadratic is rearranged so that one side is zero, and then factorised. Dividing by the unknown is never safe, because the unknown might be the thing that is zero. Summer 2025 M4 Q10 reported weaker candidates rearranging a quadratic as if it were a linear equation, which is the same instinct.",
    source: "ccea-cer:maths:2025-summer:M4:Q10",
  },
  {
    id: `ftm.${T}.03`,
    topic: T, specRefs: REF,
    stem: "A rectangular patio is $x$ m wide and $(x + 2)$ m long, with an area of 35 m². Cormac was asked to form an equation and find the width. His working:",
    studentWorking: [
      "x(x + 2) = 35",
      "x² + 2x − 35 = 0",
      "(x + 7)(x − 5) = 0",
      "x = −7 or x = 5",
      "Answer: x = −7 or x = 5",
    ],
    mistakeLine: 5,
    misconception: "maths.quadratics.no-validity-check-of-roots",
    whatWentWrong: "Both roots solve the equation, but only one can be a width. A patio cannot be $-7$ m wide, so that root has to be rejected — and the rejection needs a reason in words.",
    correction: [
      "x = −7 or x = 5",
      "A width cannot be negative, so x = −7 is rejected",
      "The patio is 5 m wide (and 7 m long, giving 35 m²)",
    ],
    marksEarnedAsWritten: ["M1", "A1", "A2", "MA1"],
    feedback: "Four of the five marks are safe: the equation, the rearrangement, the factorisation and both roots are all correct. The last mark is for reading the algebra back into the context and saying which root the situation allows, and why. It is one sentence, and it is a mark every series. The same sentence also guards against the opposite slip, discarding a root that the context does in fact allow.",
    source: "ccea-cer:maths:2024-summer:M3:Q28",
  },
];
expect("ftm01 root check", ev("x**2 + 3*x - 28", { x: -7 }), 0);
expect("ftm01 wrong check", ev("x**2 + 3*x - 28", { x: 7 }), 42);
expect("ftm03 patio", 5 * 7, 35);
assertNoFailures("t8 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", REF, "procedure", "The four steps for solving a quadratic by factorising.",
    "1 Rearrange so that one side is zero. 2 Factorise. 3 Set each bracket equal to zero. 4 Give both solutions.",
    ["equals zero", "factorise", "each bracket", "both"], 3),
  rp(T, "02", REF, "definition", "Why does setting each bracket to zero work?",
    "Because a product can only be zero when one of its factors is zero. If neither bracket were zero, their product would be some non-zero number.",
    ["product", "factor", "zero"], 4),
  rp(T, "03", REF, "trap", "You have $(x + 8)(x - 3) = 0$. What are the solutions?",
    "$x = -8$ and $x = 3$. Each bracket is solved, not copied: $x + 8 = 0$ gives $-8$.",
    ["−8", "3", "solve the bracket"], 5),
  rp(T, "04", REF, "trap", "Why must you never divide both sides of $x^2 = 6x$ by $x$?",
    "Because it assumes $x$ is not zero, and $x = 0$ is one of the solutions. Rearrange to $x^2 - 6x = 0$ and factorise to $x(x - 6) = 0$ instead.",
    ["assumes not zero", "loses a root", "x(x − 6)"], 7),
  rp(T, "05", REF, "trap", "A context question gives the roots 5 and −8. What do you write?",
    "The value the context allows, with a reason for rejecting the other: 'a length cannot be negative, so $x = 5$'. Silently dropping a root does not earn the mark.",
    ["reason", "reject", "in words"], 7),
  rp(T, "06", REF, "trap", "'Hence solve' follows a 'Factorise' part. What does it mean?",
    "Use the factorisation you have just written. Another method, including trial or the formula, is not the route the scheme rewards here.",
    ["use the previous part", "factorisation"], 6),
  rp(T, "07", REF, "trap", "What must a 'Show that' answer do?",
    "Start from the information given and reach the printed line, with every step visible. Substituting the answer in, or starting from the printed line, earns nothing.",
    ["forward chain", "every step", "printed line"], 6),
  rp(T, "08", REF, "procedure", "How do you set up a quadratic from a rectangle with a given diagonal?",
    "The diagonal and the two sides form a right-angled triangle, so Pythagoras gives $a^2 + b^2 = d^2$. Expand any squared bracket in full, collect, and take everything to one side.",
    ["Pythagoras", "squared bracket", "one side"], 8),
  rp(T, "09", REF, "trap", "$(31 - x)^2$ — what is the expansion?",
    "$961 - 62x + x^2$. Squaring a bracket means multiplying it by itself, so there is always a middle term.",
    ["middle term", "961 − 62x + x²"], 7),
  rp(T, "10", REF, "novel-example", "Solve $x^2 + 4x = 12$.",
    "$x^2 + 4x - 12 = 0$, so $(x + 6)(x - 2) = 0$ and $x = -6$ or $x = 2$.",
    ["−6", "2"], 5),
  rp(T, "11", REF, "trap", "Which quadratics are NOT solved by this method?",
    "Any that will not factorise over the integers, and any where the coefficient of $x^2$ is not 1 and has no common factor. Those need the quadratic formula, which is M4.",
    ["will not factorise", "formula", "M4"], 6),
];

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed: (x + 8)(x − 3) = x² + 5x − 24 with roots −8 and 3; x(x − 9) = x² − 9x with roots 0 and 9; x(x + 3) = 40 gives x = 5 (5 × 8 = 40); x² + (31 − x)² = 625 gives x² − 31x + 168 = 0 with roots 7 and 24, and 7² + 24² = 625.",
    examiner: "Every examiner callout comes from packs/maths/insights/m3.solving-quadratic-equations-by-factorising.json: Summer 2023 M3 Q21 and M4 Q10, Summer 2024 M3 Q28, Summer 2025 M4 Q10, November 2025 M3 Q28 and M4 Q13.",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, { ...base, numeric: C.a + "; roots −8 and 3 substituted give 0. Twin: x² + 2x − 35 = 0 has roots −7 and 5.", examiner: "Built on Summer 2023 M4 Q10, where many candidates wrote only the positive root." }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, { ...base, numeric: C.c + "; roots 0 and 9 substituted into x² − 9x give 0. Twin: x² = 7x has roots 0 and 7.", examiner: "Built on Summer 2025 M4 Q10, where a quadratic was rearranged as if it were linear." }),
  ver(`ver.we.${T}.03`, `we.${T}.03`, { ...base, numeric: "x(x + 3) = 40 gives x² + 3x − 40 = 0; " + C.e + "; roots −8 and 5; 5 × 8 = 40. Twin: x(x + 4) = 45 gives x = 5 and 5 × 9 = 45.", examiner: "Built on Summer 2024 M3 Q28, where only a handful set up the equation and some gave one solution." }),
  ver(`ver.we.${T}.04`, `we.${T}.04`, { ...base, numeric: C.p + "; " + C.l + "; roots 7 and 24 with 7² + 24² = 625. Twin: 5² + 12² = 169 and x² − 17x + 60 = 0 has roots 5 and 12.", examiner: "Built on Summer 2024 M3 Q28, a Pythagoras 'show that' followed by a solve." }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "(x + 4)(x − 6) = 0 gives −4 and 6; x² − 10x + 21 = 0 gives 3 and 7; x² = 7x gives 0 and 7; 2x² − 18 = 0 gives ±3; x(x + 3) = 40 gives 5 and −8; c² − 11c + 30 = 0 gives 5 and 6.",
    examiner: "Distractors are the registry misconceptions named on the insight card: no-link-between-parts, negative-root-discarded, treat-as-linear, show-that-solve-instead, show-that-fudged, no-validity-check-of-roots, sign-errors-in-brackets, wrong-variable-letter.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the errors those findings describe.",
  })),
  ...findTheMistake.map((f) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: "Corrected roots substituted: x² + 3x − 28 = 0 at x = −7 gives 0 (at x = 7 it gives 42); x² = 6x has roots 0 and 6; x(x + 2) = 35 gives x = 5 with 5 × 7 = 35.",
    examiner: f.source + " — the wrong line reproduces the reported error.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Prompt answers recomputed: (x + 6)(x − 2) = x² + 4x − 12 with roots −6 and 2; (31 − x)² = 961 − 62x + x².",
    examiner: "Prompts cover the four steps, the zero-product reason, the dropped root, rejecting with a reason, 'hence' and 'show that'.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "Quadratics that do not factorise over the integers — those need the quadratic formula, which is M4",
  "ax² + bx + c with a not equal to 1 and no numerical common factor (M4)",
  "Completing the square, and solving by graph, are not part of this statement",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Setting up and solving quadratic equations by factorising",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: [
      "maths.m3.factorising-quadratics-x2-plus-bx-plus-c",
      "maths.m3.difference-of-two-squares",
    ],
    order: 102,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: insight.findings.map((f) => f.source),
    examWeightHint:
      "One item most series, and often the last question. The usual shape is 'Factorise' for 2 marks and then 'Hence solve' for 2 (Summer 2023 M3 Q21, M4 Q10); the harder shape is a 'show that' setup worth 4 marks with the solve worth 2 (Summer 2024 M3 Q28, where only a handful set up the equation and part (b) was often blank).",
    mustMemorise: [
      "Rearrange so one side is 0, factorise, set each bracket to 0 — and give BOTH solutions",
      "A product is zero only if one of its factors is zero",
      "Never divide both sides by x: that throws away the solution x = 0",
      "Reject a root only when the context forbids it, and write the reason",
      "'Show that' means a forward chain to the printed line, never a substitution",
    ],
    onFormulaSheet: [
      "The quadratic formula is printed on the Higher sheet, but this statement asks for a solution by factors",
    ],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["quadratic equation", "factorising", "solve quadratic", "forming quadratics", "show that", "zero product", "reject a root"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Solving quadratic equations by factorising",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: ["Quadratic formula x = (−b ± √(b² − 4ac)) ÷ 2a — printed on the Higher sheet, but not the method this statement asks for"],
      mustKnow: [
        "A product is zero only when one of its factors is zero",
        "Rearrange to = 0 before factorising",
        "Pythagoras' theorem, for the rectangle-with-a-diagonal setups",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Solve an equation that is already factorised, such as (x + 4)(x − 6) = 0",
        "Rearrange a quadratic so that one side is zero, then factorise and solve",
        "Solve an equation with no constant term by taking out a common factor, keeping the root x = 0",
        "Solve a quadratic that is a difference of two squares, giving both roots",
        "Use 'hence': carry the factorisation from part (a) into part (b)",
        "Set up a quadratic from an area, from consecutive numbers, from a described number, or from a rectangle with a given diagonal",
        "Answer a 'show that' by a forward chain to the printed line",
        "Reject a root when the context forbids it, and say why in words",
        "Answer in the letter the question uses, and answer what was asked (a length, not x)",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks), and again without a calculator in M7 Paper 1. It is usually one of the last two questions. The common pair is 'Factorise' [2] then 'Hence solve' [2]; the harder version is a 'show that' worth 4 marks from an area or a Pythagoras setup, with a 2-mark solve afterwards. Schemes give M1 for the factorisation or the setup, then an accuracy mark per root, so a single correct root still scores.",
      traps: [
        "Not connecting part (b) to part (a): 'very, very few saw the link', with a single value found by trial (Summer 2023 M3 Q21)",
        "Giving only one solution, usually the positive one (Summer 2023 M4 Q10, Summer 2025 M4 Q10)",
        "Dividing both sides by x, which loses the root x = 0 (Summer 2025 M4 Q10)",
        "Rearranging a quadratic as if it were linear (Summer 2025 M4 Q10)",
        "Solving the printed equation instead of setting it up in a 'show that' (Summer 2024 M3 Q28), or substituting a value to 'verify' it",
        "Muddled signs when reading the roots out of the brackets (November 2025 M3 Q28)",
        "Writing the brackets or the roots in x when the question uses another letter (November 2025 M3 Q28, M4 Q13)",
        "Giving x when the question asked for a length or a base",
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
      title: "Zero on one side, then factorise",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0002`, `rp.${T}.02`, `q.${T}.0003`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Rearranging, setting up and rejecting roots",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0005`, `ftm.${T}.02`, `q.${T}.0007`, `ftm.${T}.03`, `q.${T}.0011`, `q.${T}.0013`, `q.${T}.0015`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Solving quadratic equations by factorising" },
  {
    type: "callout", kind: "spec", title: "The statement",
    md: "**M3-NA-11** — set up and solve quadratic equations using factors.\nTwo halves: **set up** (turn a situation into a quadratic) and **solve** (by factors — not by the formula, and not by trial).",
    source: "CCEA GCSE Mathematics specification, statement M3-NA-11",
  },
  {
    type: "p",
    md: "You can already factorise. This topic is what factorising is **for**. The whole idea rests on one fact about zero, and everything else is bookkeeping. Examiners report the same two losses every series: candidates who do not connect the solving part to the factorising part, and candidates who find both solutions and then write down one.",
  },
  { type: "h", text: "The one fact" },
  {
    type: "p",
    md: "If two numbers multiply to give zero, at least one of them **is** zero. Nothing else does that: $3 \\times 7 = 21$, $0.2 \\times 0.5 = 0.1$, and only a zero anywhere in the product makes the product zero.\nSo if $(x + 8)(x - 3) = 0$, one of those brackets is zero — and each possibility gives a small linear equation.",
  },
  noteFigure(zeroBody, zeroAlt, 660, 310,
    "A product is zero only if a factor is zero, so two brackets give two solutions", "zero-product-principle"),
  {
    type: "p",
    md: "Notice what that requires: the equation must have **zero on one side**. $(x + 8)(x - 3) = 6$ tells you nothing, because there are dozens of ways to multiply to 6. Getting a zero is the first move of every question here.",
  },
  {
    type: "gate", id: "g1", kind: "blank",
    prompt: "$(x + 4)(x - 6) = 0$. The solutions are",
    answer: "x = −4 or x = 6",
    explain: "$x + 4 = 0$ gives $-4$, and $x - 6 = 0$ gives $6$. Solve each bracket rather than copying its number.",
  },
  { type: "h", text: "The four steps" },
  {
    type: "p",
    md: "**1 Rearrange so one side is zero.** $x^2 + 3x = 40$ becomes $x^2 + 3x - 40 = 0$.\n**2 Factorise.** $(x + 8)(x - 5) = 0$.\n**3 Set each bracket to zero.** $x + 8 = 0$ or $x - 5 = 0$.\n**4 Give both solutions.** $x = -8$ or $x = 5$.\nStep 4 is where the marks go. Each root usually carries its own accuracy mark, so writing one of them still scores — but writing both is free.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2023 M4 Q10 and Summer 2023 M3 Q21",
    md: "Factorising was excellent. The solving was very poor: most candidates did not connect it with the previous part, and many who did wrote only the positive root. In the M3 version, most offered a single value found by trial.",
    source: "ccea-cer:maths:2023-summer:M4:Q10",
  },
  {
    type: "gate", id: "g2", kind: "blank",
    prompt: "Solve $x^2 - 10x + 21 = 0$.",
    answer: "x = 3 or x = 7",
    explain: "$(x - 3)(x - 7) = 0$.",
  },
  { type: "h", text: "Two shapes that catch people out" },
  {
    type: "p",
    md: "**No constant term.** $x^2 = 9x$. It is tempting to divide both sides by $x$ and write $x = 9$. That throws a solution away, because dividing by $x$ quietly assumes $x$ is not zero — and $x = 0$ works perfectly well here: $0 = 0$.\nRearrange instead: $x^2 - 9x = 0$, so $x(x - 9) = 0$ and $x = 0$ or $x = 9$. The lone $x$ is a factor like any other.\n**A difference of two squares.** $2x^2 - 18 = 0$ gives $2(x + 3)(x - 3) = 0$, so $x = 3$ or $x = -3$. The factor 2 can never be zero, so it contributes no solution.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q10",
    md: "In the solving part, weaker candidates rearranged the equation as if it were linear, and some dropped the negative root. In the factorising part, taking out only 4 instead of 4a scored nothing.",
    source: "ccea-cer:maths:2025-summer:M4:Q10",
  },
  {
    type: "gate", id: "g3", kind: "choice",
    prompt: "Solve $x^2 = 7x$.",
    options: ["$x = 0$ or $x = 7$", "$x = 7$ only", "$x = 7$ or $x = -7$"],
    answer: "$x = 0$ or $x = 7$",
    explain: "$x(x - 7) = 0$. Dividing by $x$ would lose the zero root.",
  },
  { type: "h", text: "'Hence' is an instruction" },
  {
    type: "p",
    md: "When part (a) says 'Factorise $x^2 - 5x - 14$' and part (b) says 'Hence solve $x^2 - 5x - 14 = 0$', the word **hence** means: use what you have just written. The brackets are already on the page; setting each to zero takes one line.\nTrial and improvement earns no method marks, and the quadratic formula, though it would give the right answers, is not the route this statement asks for.",
  },
  {
    type: "gate", id: "g4", kind: "blank",
    prompt: "You factorised $x^2 + 2x - 35 = (x + 7)(x - 5)$. Hence solve $x^2 + 2x - 35 = 0$.",
    answer: "x = −7 or x = 5",
    explain: "Set each bracket to zero; both values are wanted.",
  },
  { type: "h", text: "Setting one up" },
  {
    type: "p",
    md: "Half the marks on this statement are for turning a situation into an equation. Three shapes recur.\n**An area.** A bed $x$ m by $(x + 3)$ m with area 40 m²:",
  },
  noteFigure(rectBody, rectAlt, 620, 288,
    "Area = length × width gives the quadratic", "quadratic-setup-rectangle"),
  {
    type: "p",
    md: "$x(x + 3) = 40 \\Rightarrow x^2 + 3x - 40 = 0 \\Rightarrow (x + 8)(x - 5) = 0$, so $x = -8$ or $x = 5$.\n**Consecutive numbers.** Two consecutive whole numbers with product 156: $n(n + 1) = 156$, so $n^2 + n - 156 = 0$ and $(n + 13)(n - 12) = 0$, giving 12 and 13.\n**A rectangle with a diagonal.** This is Pythagoras in disguise, and spotting it is the first mark.",
  },
  noteFigure(diagBody, diagAlt, 620, 304,
    "The diagonal and the two sides make a right-angled triangle", "quadratic-setup-diagonal"),
  {
    type: "p",
    md: "$x^2 + (31 - x)^2 = 25^2$. Expand the squared bracket **in full**: $(31 - x)^2 = 961 - 62x + x^2$. Then $2x^2 - 62x + 336 = 0$, and dividing by 2 gives $x^2 - 31x + 168 = 0$, so $x = 7$ or $x = 24$ — the two sides of the same rectangle.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2024 M3 Q28",
    md: "Only a handful set up the equation; many simply solved the printed one, and part (b) was often left blank. Of those who factorised correctly, some listed only one solution.",
    source: "ccea-cer:maths:2024-summer:M3:Q28",
  },
  {
    type: "gate", id: "g5", kind: "number",
    prompt: "A bed is $x$ m by $(x + 3)$ m with area 40 m². The positive root of $x^2 + 3x - 40 = 0$ is",
    answer: "5",
    explain: "$(x + 8)(x - 5) = 0$; a width cannot be $-8$ m.",
  },
  { type: "h", text: "Rejecting a root — with a reason" },
  {
    type: "p",
    md: "Both roots always satisfy the **equation**. Only the context can rule one out, and when it does, the rejection has to be written down:\n'A width cannot be negative, so $x = -8$ is rejected.'\nOne sentence, one mark. Silently omitting the root looks identical to forgetting it.\nAnd the opposite matters just as much: in the diagonal question, **neither** root is impossible, so both are kept. Test each root against the situation rather than assuming the negative one always goes.\nFinally, answer what was asked. If $x$ is the width and the question wants the base, which is $x + 4$, then the number on the answer line is $x + 4$.",
  },
  {
    type: "gate", id: "g6", kind: "choice",
    prompt: "A patio is $x$ m by $(x + 2)$ m with area 35 m². Solving gives $x = 5$ or $x = -7$. What goes on the answer line?",
    options: ["5 m, because a width cannot be negative", "5 m and −7 m", "5 m, with no reason"],
    answer: "5 m, because a width cannot be negative",
    explain: "The reason is worth a mark; the value on its own leaves it on the table.",
  },
  { type: "h", text: "'Show that' has its own rules" },
  {
    type: "p",
    md: "A 'show that' gives you the destination and asks for the journey. Start from the information in the question, work forwards, and finish exactly on the printed line with every step visible.\nWhat earns nothing: starting from the printed equation, substituting a root to check it works, or solving the equation instead of deriving it. The solving is nearly always the next part, and it is worth its own marks.",
  },
  {
    type: "gate", id: "g7", kind: "choice",
    prompt: "'Show that $x^2 - 31x + 168 = 0$.' Which working earns the marks?",
    options: [
      "Pythagoras, expand, collect, divide by 2 — ending on the printed line",
      "Substitute $x = 7$ and show it gives 0",
      "Factorise the printed equation and solve it",
    ],
    answer: "Pythagoras, expand, collect, divide by 2 — ending on the printed line",
    explain: "A forward chain from the given information to the printed result.",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** the quadratic formula — but this statement asks for factors, so it is not the method here.\n**Must be known:** a product is zero only if a factor is zero; rearrange to $= 0$ first; never divide by the unknown; Pythagoras' theorem for the diagonal setups; reject a root only with a written reason.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "Quadratics that do not factorise over the integers need the formula, which is **M4**. So does $ax^2 + bx + c$ when $a$ is not 1 and no common factor can be removed. Completing the square is not part of M3.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "Expect one item, often the last question of M3, and the same content again with no calculator in M7 Paper 1. Either 'Factorise' [2] then 'Hence solve' [2], or a 'show that' setup [4] with a solve [2] after it.\nThe **first** mark is the equation rearranged to $= 0$, or the setup line. Write it even if the factorising defeats you.\nThe **last** marks are the two roots — and, in a context, the one the situation allows, with the reason.\nIf you are stuck on a 'show that', write the relationship the picture gives you (area, Pythagoras, consecutive numbers). That line alone is usually the method mark, and part (b) can still be attempted from the printed equation.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.05` },
  { type: "prompt", promptId: `rp.${T}.07` },
  { type: "prompt", promptId: `rp.${T}.09` },
];

assertNoFailures("t8 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
