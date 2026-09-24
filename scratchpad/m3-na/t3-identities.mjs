/** maths.m3.identities-and-expanding-double-brackets — S bundle (difficulty 3). */
import fs from "node:fs";
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, equiv, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.identities-and-expanding-double-brackets";
const SLUG = "identities-and-expanding-double-brackets";
const REF = ["M3-NA-04", "M3-NA-05"];
const insight = JSON.parse(fs.readFileSync("packs/maths/insights/m3.identities-and-expanding-double-brackets.json", "utf8"));

// ---------------------------------------------------------------- symbolic checks
const P = [{ x: 2 }, { x: -3 }, { x: 0.5 }];
const PY = [{ y: 2 }, { y: -3 }, { y: 0.5 }];
const PM = [{ m: 2 }, { m: -3 }, { m: 0.5 }];
const C = {
  a: equiv("(x+4)(x-2)", "(x+4)*(x-2)", "x**2 + 2*x - 8", P),
  b: equiv("(3x-4)(2x-3)", "(3*x-4)*(2*x-3)", "6*x**2 - 17*x + 12", P),
  c: equiv("(4x-1)(2x+5)", "(4*x-1)*(2*x+5)", "8*x**2 + 18*x - 5", P),
  d: equiv("m^2+(m+7)(m-2)", "m**2 + (m+7)*(m-2)", "2*m**2 + 5*m - 14", PM),
  e: equiv("(x+5)^2", "(x+5)**2", "x**2 + 10*x + 25", P),
  f: equiv("(2y-3)^2", "(2*y-3)**2", "4*y**2 - 12*y + 9", PY),
  g: equiv("(2x+3)(x+5)", "(2*x+3)*(x+5)", "2*x**2 + 13*x + 15", P),
  h: equiv("3(2x+5)-4", "3*(2*x+5) - 4", "6*x + 11", P),
  i: equiv("(x+4)(x+3)", "(x+4)*(x+3)", "x**2 + 7*x + 12", P),
  j: equiv("(x+5)^2-7", "(x+5)**2 - 7", "x**2 + 10*x + 18", P),
  k: equiv("(x-6)(x+6)", "(x-6)*(x+6)", "x**2 - 36", P),
  l: equiv("(5x+2)(3x-7)", "(5*x+2)*(3*x-7)", "15*x**2 - 29*x - 14", P),
  m: equiv("(x+9)(x-4)", "(x+9)*(x-4)", "x**2 + 5*x - 36", P),
  n: equiv("(3x-5)^2", "(3*x-5)**2", "9*x**2 - 30*x + 25", P),
  o: equiv("(2x+7)(2x+7)-4x^2", "(2*x+7)*(2*x+7) - 4*x**2", "28*x + 49", P),
  p: equiv("(n+6)(n+1) area", "(n+6)*(n+1)", "n**2 + 7*n + 6", [{ n: 2 }, { n: -3 }, { n: 0.5 }]),
  q: equiv("(2x+3)(x+5)-x*x", "(2*x+3)*(x+5) - x*x", "x**2 + 13*x + 15", P),
  r: equiv("(x+7)(x-2)", "(x+7)*(x-2)", "x**2 + 5*x - 14", P),
  s: equiv("(4t-1)(t+6)", "(4*t-1)*(t+6)", "4*t**2 + 23*t - 6", [{ t: 2 }, { t: -3 }, { t: 0.5 }]),
  t: equiv("(x-8)^2", "(x-8)**2", "x**2 - 16*x + 64", P),
  u: equiv("2(x+3)(x+4)", "2*(x+3)*(x+4)", "2*x**2 + 14*x + 24", P),
};
// The identity (x + a)(x + 3) = x^2 + 7x + b forces a = 4, b = 12
expect("identity a", 7 - 3, 4);
expect("identity b", 4 * 3, 12);
// The identity (x + p)^2 - q = x^2 + 10x + 18 forces p = 5, q = 7
expect("identity p", 10 / 2, 5);
expect("identity q", 5 * 5 - 18, 7);
// Numerical check of an equation vs an identity
expect("equation 4x+6=26 at x=5", 4 * 5 + 6, 26);
expect("equation 4x+6=26 at x=1", 4 * 1 + 6, 10);
assertNoFailures("t3 symbolic");

// ---------------------------------------------------------------- figures
const gridBody = (a1, a2, b1, b2, c11, c12, c21, c22, foot) => `
<g fill='none' stroke='currentColor' stroke-width='1.6'>
  <rect x='120' y='60' width='400' height='180'/>
  <path d='M320 60 L320 240'/><path d='M120 150 L520 150'/>
</g>
<g ${MATHTXT} font-size='22' text-anchor='middle'>
  <text x='220' y='40'>${a1}</text><text x='420' y='40'>${a2}</text>
  <text x='220' y='115'>${c11}</text><text x='420' y='115'>${c12}</text>
  <text x='220' y='205'>${c21}</text><text x='420' y='205'>${c22}</text>
</g>
<g ${MATHTXT} font-size='22' text-anchor='end'>
  <text x='100' y='115'>${b1}</text><text x='100' y='205'>${b2}</text>
</g>
<g ${TXT} font-size='16' text-anchor='middle'>
  <text x='320' y='280'>${foot}</text>
</g>`;
const gridAlt = (a1, a2, b1, b2, c11, c12, c21, c22, res) =>
  `A two by two grid. The columns are headed ${a1} and ${a2}; the rows are headed ${b1} and ${b2}. The four cells read ${c11}, ${c12}, ${c21} and ${c22}. Underneath: ${res}.`;

const gridMain = gridBody("3x", "-4", "2x", "-3", "6x²", "-8x", "-9x", "+12", "6x² - 8x - 9x + 12 = 6x² - 17x + 12");
const gridMainAlt = gridAlt("3x", "minus 4", "2x", "minus 3", "6x squared", "minus 8x", "minus 9x", "plus 12",
  "6x squared minus 8x minus 9x plus 12 equals 6x squared minus 17x plus 12");
const gridMainFig = svgFig(gridMain, gridMainAlt, 640, 300);

const gridSquare = gridBody("x", "+5", "x", "+5", "x²", "+5x", "+5x", "+25", "x² + 5x + 5x + 25 = x² + 10x + 25");
const gridSquareAlt = gridAlt("x", "plus 5", "x", "plus 5", "x squared", "plus 5x", "plus 5x", "plus 25",
  "x squared plus 10x plus 25, the two middle cells being identical");
const gridSquareFig = svgFig(gridSquare, gridSquareAlt, 640, 300);

const areaBody = `
<g fill='currentColor' fill-opacity='0.07' stroke='currentColor' stroke-width='1.8'>
  <rect x='90' y='60' width='420' height='210'/>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.3' stroke-dasharray='6 4'>
  <path d='M370 60 L370 270'/><path d='M90 205 L510 205'/>
</g>
<g ${MATHTXT} font-size='20' text-anchor='middle'>
  <text x='230' y='140'>2x²</text><text x='440' y='140'>3x</text>
  <text x='230' y='245'>10x</text><text x='440' y='245'>15</text>
  <text x='230' y='42'>2x</text><text x='440' y='42'>3</text>
</g>
<g ${MATHTXT} font-size='20' text-anchor='end'>
  <text x='74' y='140'>x</text><text x='74' y='245'>5</text>
</g>
<g ${TXT} font-size='16' text-anchor='middle'>
  <text x='300' y='306'>area = 2x² + 3x + 10x + 15 = 2x² + 13x + 15</text>
</g>`;
const areaAlt =
  "A rectangle of width 2x + 3 and height x + 5, split by dashed lines into four regions labelled 2x squared, 3x, 10x and 15. Underneath: area = 2x squared + 13x + 15.";
const areaFig = svgFig(areaBody, areaAlt, 620, 326);
expect("area model", 2 * 4 + 3 * 2 + 10 * 2 + 15, (2 * 2 + 3) * (2 + 5));
assertNoFailures("t3 area model");

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statements M3-NA-04 (equation against identity, the ≡ symbol) and M3-NA-05 (multiply two linear expressions; (a ± b)² = a² ± 2ab + b²). Factorising back is M3-NA-06, a separate topic, and cubic products are outside the statement.",
  formula: "Nothing on the Higher formula sheet applies; (a ± b)² = a² ± 2ab + b² is named in the Teacher Guidance as something to know.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Expand, Expand and simplify, Simplify, Find, Show that, Write down, Explain).",
  tariff: "Tariffs match the corpus: 'Expand and simplify (3x − 4)(2x − 3)' 2 marks (Summer 2026 M3 Q25(a)), an area expression 2 marks (November 2025 M3 Q27, Summer 2024 M3 Q25), a three-term expansion 3 marks (Summer 2025 M3 Q18), a comparing-coefficients identity 3 marks.",
  copy: "Compared by hand against the M3 papers and schemes read for this batch (Summer 2025 Q18, Summer 2024 Q25, November 2025 Q27, Summer 2026 Q25, Summer 2022 Q19): new letters, new coefficients and new contexts; no eight-word sequence in common.",
  symbolic: "Every expansion verified by evaluating the bracketed form and the expanded form at x = 2, x = −3 and x = 0.5 (or the letter the item uses) and confirming they agree.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T, specRefs: ["M3-NA-05"], paper: M3,
    stem: "Expand and simplify $(3x - 4)(2x - 3)$.",
    figure: gridMainFig,
    steps: [
      {
        n: 1,
        working: "Grid headings: columns $3x$ and $-4$; rows $2x$ and $-3$.",
        decision: "The sign travels with the term. Writing $-4$ and $-3$ into the headings means the signs are handled once, at the start, instead of being patched on later.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$3x \\times 2x = 6x^2$; $-4 \\times 2x = -8x$; $3x \\times -3 = -9x$; $-4 \\times -3 = +12$",
        decision: "Four cells, four products, every pair used exactly once. The first cell is always the squared term: $x \\times x = x^2$, never $x$.",
        whyMenu: {
          options: [
            "$3x \\times 2x = 6x^2$ because the numbers multiply and $x \\times x = x^2$",
            "$3x \\times 2x = 6x$ because the $x$s stay as they are",
            "$3x \\times 2x = 5x^2$ because the coefficients add",
          ],
          correct: 0,
          explain: "Multiplying multiplies the numbers and adds the indices: $3 \\times 2 = 6$ and $x^1 \\times x^1 = x^2$.",
        },
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$6x^2 - 8x - 9x + 12$",
        decision: "All four terms written out before any collecting. Two negatives multiplied give $+12$, which is the sign candidates most often drop.",
        earns: ["A1"],
      },
      {
        n: 4,
        working: "$6x^2 - 17x + 12$",
        decision: "Only the two $x$ terms are alike, so only they combine: $-8x - 9x = -17x$. The $x^2$ term and the number have no partner and stay as they are.",
        whyMenu: {
          options: [
            "$-8x - 9x = -17x$ — both are negative, so they add together in size",
            "$-8x - 9x = -1x$ — the numbers subtract",
            "$-8x - 9x = 72x^2$ — like terms multiply",
          ],
          correct: 0,
          explain: "Owing 8 and owing 9 more is owing 17. Collecting like terms never changes the power.",
        },
        earns: ["A1"],
      },
    ],
    finalAnswer: "$6x^2 - 17x + 12$",
    twin: {
      stem: "Expand and simplify $(5x + 2)(3x - 7)$.",
      answer: algAnswer("15x^2 - 29x - 14", { mustBeExpanded: true }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T, specRefs: ["M3-NA-04", "M3-NA-05"], paper: M3,
    stem: "$(x + a)(x + 3) \\equiv x^2 + 7x + b$ for all values of $x$.\n\nFind the values of $a$ and $b$.",
    steps: [
      {
        n: 1,
        working: "$\\equiv$ means true for **every** $x$, not just one. So the two sides must be the same expression, term for term.",
        decision: "This is the whole difference between an equation and an identity. An equation asks which $x$ makes it true; an identity says the two sides are two spellings of one expression, so their coefficients must match.",
        whyMenu: {
          options: [
            "Because two expressions equal for every value must have the same coefficient of each power",
            "Because $\\equiv$ is just a tidier way of writing $=$",
            "Because $x$ has a particular value that makes both sides agree",
          ],
          correct: 0,
          explain: "If the two sides differed in any coefficient, you could choose an $x$ that made them disagree.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "Expand the left side: $(x + a)(x + 3) = x^2 + 3x + ax + 3a = x^2 + (3 + a)x + 3a$",
        decision: "Expand first, then compare. Collecting the two $x$ terms into a single coefficient $(3 + a)$ is what makes the comparison possible.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "Compare the $x$ terms: $3 + a = 7$, so $a = 4$. Compare the numbers: $b = 3a = 12$.",
        decision: "Two comparisons, two unknowns. Take the one with a single unknown first, then use it in the other.",
        earns: ["A1"],
      },
      {
        n: 4,
        working: "Check: $(x + 4)(x + 3) = x^2 + 7x + 12$. Substituting $x = 2$: $6 \\times 5 = 30$ and $4 + 14 + 12 = 30$.",
        decision: "A substitution check costs ten seconds and catches a sign slip. Any value of $x$ will do, because an identity holds for all of them.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$a = 4$ and $b = 12$",
    twin: {
      stem: "$(x + p)^2 - q \\equiv x^2 + 10x + 18$ for all values of $x$. Find $p$ and $q$.",
      answer: textAnswer(
        ["p = 5, q = 7"],
        [{ any: ["p = 5", "p=5"], marks: 1 }, { any: ["q = 7", "q=7"], marks: 1 }],
      ),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
];

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`, topic: T, specRefs: REF, when: "pre",
    items: [
      dxItem("01", "$3x \\times 2x = $ ?", "Multiply two terms in x",
        [
          ["$6x^2$", true, null, "Numbers multiply, and $x \\times x = x^2$. The first cell of a double bracket is always the squared term."],
          ["$6x$", false, "maths.algebra.like-terms-powers-added", "The two $x$s were not multiplied. Summer 2024 M3 Q25 reported 12x appearing where 12x² was needed."],
          ["$5x^2$", false, "maths.algebra.like-terms-powers-added", "The coefficients were added instead of multiplied. Adding is for like terms; here the terms are being multiplied."],
        ], 15),
      dxItem("02", "$m^2 + m^2 = $ ?", "Collect like terms without changing the power",
        [
          ["$2m^2$", true, null, "Two of the same thing. Collecting like terms adds the coefficients and leaves the power alone."],
          ["$m^4$", false, "maths.algebra.like-terms-powers-added", "The indices were added, which is the rule for $m^2 \\times m^2$. Summer 2025 M4 Q4 was reported as exactly this."],
          ["$2m^4$", false, "maths.algebra.like-terms-powers-added", "Both the coefficient and the index were changed. Only the coefficient changes when like terms are added."],
        ], 15),
      dxItem("03", "$-4 \\times -3 = $ ?", "Sign of the last product in a double bracket",
        [
          ["$+12$", true, null, "Two negatives multiplied give a positive. This is the last cell of the grid and the one most often dropped."],
          ["$-12$", false, "maths.algebra.bracket-expansion-sign", "Only one sign was used. Each of the two minus signs belongs to its own term, and the pair of them makes the product positive."],
          ["$-7$", false, "maths.algebra.bracket-expansion-sign", "The terms were added rather than multiplied. In a grid every cell is a product."],
        ], 15),
      dxItem("04", "Expand and simplify $(x + 7)(x - 2)$.", "Expand a monic double bracket with mixed signs",
        [
          ["$x^2 + 5x - 14$", true, null, "$x^2 - 2x + 7x - 14$, and $-2x + 7x = 5x$. The number term is negative because $+7 \\times -2 = -14$."],
          ["$x^2 - 5x - 14$", false, "maths.algebra.bracket-expansion-sign", "The middle terms were collected the wrong way round: $+7x$ is larger than $-2x$, so the total is positive."],
          ["$x^2 + 5x + 14$", false, "maths.algebra.bracket-expansion-sign", "$+7 \\times -2$ is $-14$, not $+14$. The last cell keeps the product of the two signs."],
        ], 30),
      dxItem("05", "Expand $(x + 5)^2$.", "Square a bracket correctly",
        [
          ["$x^2 + 10x + 25$", true, null, "$(x+5)(x+5)$ has four products; the two middle ones are both $5x$, which is where the $2ab$ comes from."],
          ["$x^2 + 25$", false, "maths.algebra.expand-squared-bracket", "Only the two corner cells were used. Squaring a bracket is not squaring each term: the two middle cells give $10x$."],
          ["$x^2 + 5x + 25$", false, "maths.algebra.expand-squared-bracket", "One middle cell was counted. There are two of them, both $5x$, so the middle term is $10x$."],
        ], 25),
      dxItem("06", "A rectangle has length $(2x + 3)$ and width $(x + 5)$. What is the **quadratic expression** for its area?",
        "Give an area as an expanded quadratic, not a product",
        [
          ["$2x^2 + 13x + 15$", true, null, "Area is length × width, expanded and simplified. 'Quadratic expression' means it is written out, starting with the $x^2$ term."],
          ["$(2x + 3)(x + 5)$", false, "maths.algebra.expression-left-factorised", "That is the area, but left as a product. A quadratic expression is the expanded form; Summer 2024 M3 Q25 lost marks for exactly this."],
          ["$2x^2 + 13x + 15 = 0$", false, "maths.alg-fractions.treat-expression-as-equation", "An expression is not an equation and is never set equal to zero. The answer line wants the expression on its own."],
        ], 35),
    ],
  },
];

// ---------------------------------------------------------------- questions
const questions = [
  question({
    id: `q.${T}.0001`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 1,
    commandWords: ["Expand"], setting: "Pure algebra, no context",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q15"],
    solutionProgram: C.a,
    parts: [{
      id: "main", verb: "expand", marks: 2,
      stem: "Expand and simplify $(x + 4)(x - 2)$.",
      answer: algAnswer("x^2 + 2x - 8", { mustBeExpanded: true }),
      scheme: [
        MA("MA1", 1, "three of the four products correct, e.g. x² − 2x + 4x − 8"),
        A("A1", 1, "x² + 2x − 8", { dependsOn: ["MA1"] }),
      ],
      hints: ["Four products: $x \\times x$, $x \\times -2$, $4 \\times x$, $4 \\times -2$.", "Collect $-2x + 4x$."],
      workedSolution: "$x^2 - 2x + 4x - 8 = x^2 + 2x - 8$.",
      commonErrors: [{
        misconception: "maths.algebra.bracket-expansion-sign",
        pattern: { kind: "algebraic", latex: "x^2 - 2x - 8" },
        feedback: "Only the first term of the first bracket reached the $-2$; the $+4$ was never multiplied by $x$. All four cells are needed, and $4 \\times x = 4x$.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2023-summer:M3:Q15",
      }],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0002`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 2,
    commandWords: ["Expand"], setting: "Pure algebra, no context",
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q27"],
    solutionProgram: C.b,
    figures: [gridMainFig],
    parts: [{
      id: "main", verb: "expand", marks: 2,
      stem: "Expand and simplify $(3x - 4)(2x - 3)$.",
      answer: algAnswer("6x^2 - 17x + 12", { mustBeExpanded: true }),
      scheme: [
        MA("MA1", 1, "6x² − 9x − 8x + 12, or three of the four products correct"),
        A("A1", 1, "6x² − 17x + 12", { dependsOn: ["MA1"] }),
      ],
      hints: ["Take the signs into the grid headings: $3x$, $-4$, $2x$, $-3$.", "$-4 \\times -3 = +12$.", "$-9x - 8x = -17x$."],
      workedSolution: "$6x^2 - 9x - 8x + 12 = 6x^2 - 17x + 12$.",
      commonErrors: [
        {
          misconception: "maths.algebra.bracket-expansion-sign",
          pattern: { kind: "algebraic", latex: "6x^2 - 17x - 12" },
          feedback: "The last product came out negative. Two minus signs multiplied give a plus, so the constant is $+12$. The method mark still stands.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q27",
        },
        {
          misconception: "maths.algebra.like-terms-powers-added",
          pattern: { kind: "algebraic", latex: "6x - 17x + 12" },
          feedback: "$3x \\times 2x$ is $6x^2$, not $6x$. Multiplying two terms in $x$ always produces $x^2$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M3:Q25",
        },
      ],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0003`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 2, paper: M7P1,
    commandWords: ["Expand"], setting: "Pure algebra, squared brackets, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q15"],
    solutionProgram: C.e + " | " + C.f,
    figures: [gridSquareFig],
    parts: [
      {
        id: "a", verb: "expand", marks: 2,
        stem: "Expand and simplify $(x + 5)^2$.",
        answer: algAnswer("x^2 + 10x + 25", { mustBeExpanded: true }),
        scheme: [MA("MA1", 1, "(x + 5)(x + 5) written out, or x² + 5x + 5x + 25"), A("A1", 1, "x² + 10x + 25", { dependsOn: ["MA1"] })],
        hints: ["Write the bracket out twice before expanding.", "The two middle cells are both $5x$."],
        workedSolution: "$(x+5)(x+5) = x^2 + 5x + 5x + 25 = x^2 + 10x + 25$.",
        commonErrors: [{
          misconception: "maths.algebra.expand-squared-bracket",
          pattern: { kind: "algebraic", latex: "x^2 + 25" },
          feedback: "Squaring a bracket is not squaring each term. Writing $(x+5)(x+5)$ out first makes the two middle $5x$ cells appear.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M3:Q15",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "expand", marks: 2,
        stem: "Expand and simplify $(2y - 3)^2$.",
        answer: algAnswer("4y^2 - 12y + 9", { variables: ["y"], mustBeExpanded: true }),
        scheme: [MA("MA1", 1, "(2y − 3)(2y − 3) written out, or 4y² − 6y − 6y + 9"), A("A1", 1, "4y² − 12y + 9", { dependsOn: ["MA1"] })],
        hints: ["$(2y)^2 = 4y^2$, not $2y^2$.", "$-3 \\times -3 = +9$.", "The middle term is $2 \\times 2y \\times -3$."],
        workedSolution: "$(2y-3)(2y-3) = 4y^2 - 6y - 6y + 9 = 4y^2 - 12y + 9$.",
        commonErrors: [{
          misconception: "maths.algebra.bracket-before-squaring",
          pattern: { kind: "algebraic", latex: "2y^2 - 12y + 9" },
          feedback: "The coefficient was not squared. $(2y)^2$ means $2y \\times 2y = 4y^2$; the 2 is inside the bracket and is squared with the $y$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M3:Q15",
        }],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0004`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 3,
    commandWords: ["Expand", "Simplify"], setting: "Pure algebra, a square term added to a product",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q4"],
    solutionProgram: C.d,
    parts: [{
      id: "main", verb: "expand", marks: 3,
      stem: "Expand and simplify $m^2 + (m + 7)(m - 2)$.",
      answer: algAnswer("2m^2 + 5m - 14", { variables: ["m"], mustBeExpanded: true }),
      scheme: [
        MA("MA1", 1, "m² − 2m + 7m − 14 seen (the product expanded)"),
        MA("MA2", 1, "m² + (m² + 5m − 14)"),
        A("A1", 1, "2m² + 5m − 14", { dependsOn: ["MA2"] }),
      ],
      hints: ["Expand the product first and leave the lone $m^2$ alone for the moment.", "$(m+7)(m-2) = m^2 + 5m - 14$.", "$m^2 + m^2 = 2m^2$, and the power does not change."],
      workedSolution: "$(m+7)(m-2) = m^2 - 2m + 7m - 14 = m^2 + 5m - 14$. Adding the $m^2$ outside: $m^2 + m^2 + 5m - 14 = 2m^2 + 5m - 14$.",
      commonErrors: [{
        misconception: "maths.algebra.like-terms-powers-added",
        pattern: { kind: "algebraic", latex: "m^4 + 5m - 14" },
        feedback: "The two $m^2$ terms were multiplied instead of added. Collecting like terms adds the coefficients: $m^2 + m^2 = 2m^2$. The Summer 2025 report named this exact step.",
        marksTypicallyEarned: 2,
        source: "ccea-cer:maths:2025-summer:M4:Q4",
      }],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0005`, topic: T, specRefs: ["M3-NA-04"], style: "practice", difficulty: 2,
    commandWords: ["Explain", "Write down"], setting: "Telling an equation from an identity",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q5"],
    solutionProgram: "4x + 6 = 26 is true only at x = 5 (4*5+6 = 26; at x = 1, 4+6 = 10 not 26); 2(2x+3) = 4x+6 for all x, checked at x = 0, 1, -2",
    parts: [
      {
        id: "a", verb: "explain", marks: 2,
        stem: "Here are two statements.\n\n**A:** $4x + 6 = 26$\n**B:** $4x + 6 \\equiv 2(2x + 3)$\n\nExplain the difference between them.",
        answer: textAnswer(
          ["A is an equation, true only for x = 5; B is an identity, true for every value of x"],
          [
            { any: ["equation", "only true for one value", "only for x = 5"], marks: 1 },
            { any: ["identity", "true for all values", "every value of x", "any x"], marks: 1 },
          ],
        ),
        scheme: [
          MA("MA1", 1, "A described as an equation, true only for a particular value (x = 5)"),
          MA("MA2", 1, "B described as an identity, true for every value of x"),
        ],
        hints: ["Try $x = 1$ in each statement and see what happens.", "One of them is a question about $x$; the other is a fact about the expression."],
        workedSolution: "In **A**, putting $x = 1$ gives $10 = 26$, which fails; only $x = 5$ works, since $4(5) + 6 = 26$. **A** is an **equation**: it is true for one particular value.\nIn **B**, $2(2x + 3) = 4x + 6$ whatever $x$ is; the right side is just the left side written in a different way. **B** is an **identity**, and that is what the $\\equiv$ sign announces.",
        commonErrors: [{
          misconception: "maths.alg-fractions.treat-expression-as-equation",
          pattern: { kind: "text", regex: "(both|they are)\\s+(the\\s+)?same" },
          feedback: "They look alike but do different jobs. An equation is a question — which $x$ makes this true. An identity is a statement that two expressions are the same thing for every $x$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q5",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "write-down", marks: 1,
        stem: "Write down the value of $x$ that satisfies statement **A**.",
        answer: numAnswer(5),
        scheme: [A("A1", 1, "5")],
        hints: ["$4x = 20$."],
        workedSolution: "$4x + 6 = 26$, so $4x = 20$ and $x = 5$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.treat-expression-as-equation",
          pattern: { kind: "numeric" },
          feedback: "The 6 was added rather than subtracted. Undo the $+6$ first: $4x = 26 - 6 = 20$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q5",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0006`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 3,
    commandWords: ["Find", "Expand"], emphasis: ["quadratic expression"],
    setting: "A rectangular allotment plot with algebraic sides",
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q25", "ccea-cer:maths:2025-november:M3:Q27"],
    solutionProgram: C.g,
    figures: [areaFig],
    parts: [{
      id: "main", verb: "find", marks: 2,
      stem: "An allotment plot is a rectangle of length $(2x + 3)$ metres and width $(x + 5)$ metres.\n\nFind the **quadratic expression** for the area of the plot. Expand and simplify your answer.",
      answer: algAnswer("2x^2 + 13x + 15", { mustBeExpanded: true }),
      scheme: [
        MA("MA1", 1, "(2x + 3)(x + 5) seen, or 2x² + 10x + 3x + 15"),
        A("A1", 1, "2x² + 13x + 15", { dependsOn: ["MA1"] }),
      ],
      hints: ["Area of a rectangle is length × width; write the product down first.", "Four products: $2x \\times x$, $2x \\times 5$, $3 \\times x$, $3 \\times 5$.", "The two middle products are $10x$ and $3x$, so $10x + 3x = 13x$."],
      workedSolution: "$(2x+3)(x+5) = 2x^2 + 10x + 3x + 15 = 2x^2 + 13x + 15$ square metres.",
      commonErrors: [
        {
          misconception: "maths.algebra.expression-left-factorised",
          pattern: { kind: "algebraic", latex: "(2x+3)(x+5)" },
          feedback: "That is the area, but not as a quadratic expression. The command 'expand and simplify' asks for it written out, and Summer 2024 M3 Q25 reported the product being left on the answer line.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M3:Q25",
        },
        {
          misconception: "maths.algebra.like-terms-powers-added",
          pattern: { kind: "algebraic", latex: "2x + 13x + 15" },
          feedback: "$2x \\times x = 2x^2$. November 2025 M3 Q27 reported answers with no quadratic first term earning nothing, and those who knew it was quadratic usually got both marks.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q27",
        },
        {
          misconception: "maths.algebra.misread-plus-as-times",
          pattern: { kind: "algebraic", latex: "6x + 16" },
          feedback: "That is the perimeter, $2(2x + 3) + 2(x + 5)$. The question asks for the area, so the two sides are multiplied.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q5",
        },
      ],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0007`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 3,
    commandWords: ["Expand"], setting: "Pure algebra, a common factor outside a pair of brackets",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q15"],
    solutionProgram: C.u,
    parts: [{
      id: "main", verb: "expand", marks: 3,
      stem: "Expand and simplify $2(x + 3)(x + 4)$.",
      answer: algAnswer("2x^2 + 14x + 24", { mustBeExpanded: true }),
      scheme: [
        MA("MA1", 1, "(x + 3)(x + 4) expanded: x² + 7x + 12"),
        MA("MA2", 1, "every term multiplied by 2"),
        A("A1", 1, "2x² + 14x + 24", { dependsOn: ["MA2"] }),
      ],
      hints: ["Deal with the two brackets first and keep the 2 waiting outside.", "$(x+3)(x+4) = x^2 + 7x + 12$.", "The 2 multiplies all three terms, not just the first."],
      workedSolution: "$(x+3)(x+4) = x^2 + 4x + 3x + 12 = x^2 + 7x + 12$. Then $2(x^2 + 7x + 12) = 2x^2 + 14x + 24$.",
      commonErrors: [{
        misconception: "maths.algebra.bracket-expansion-sign",
        pattern: { kind: "algebraic", latex: "2x^2 + 7x + 12" },
        feedback: "The 2 reached the first term only. Multiplying a bracket multiplies every term inside it, so $7x$ becomes $14x$ and 12 becomes 24.",
        marksTypicallyEarned: 2,
        source: "ccea-cer:maths:2023-summer:M3:Q15",
      }],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0008`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 3,
    commandWords: ["Show that"], setting: "Pure algebra, a difference of two areas",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q5"],
    solutionProgram: C.o,
    parts: [{
      id: "main", verb: "show-that", marks: 3,
      stem: "Show that $(2x + 7)^2 - 4x^2 = 28x + 49$.",
      answer: algAnswer("28x + 49", { equivalence: "equivalent", mustBeExpanded: true }),
      scheme: [
        MA("MA1", 1, "(2x + 7)(2x + 7) written out or 4x² + 14x + 14x + 49"),
        MA("MA2", 1, "4x² + 28x + 49 obtained"),
        A("A1", 1, "subtraction of 4x² completed to reach 28x + 49", { dependsOn: ["MA2"] }),
      ],
      hints: ["Write the square out as two brackets before expanding.", "$(2x)^2 = 4x^2$ and the two middle cells are both $14x$.", "The $4x^2$ terms cancel, leaving a linear expression."],
      workedSolution: "$(2x+7)^2 = (2x+7)(2x+7) = 4x^2 + 14x + 14x + 49 = 4x^2 + 28x + 49$.\nThen $4x^2 + 28x + 49 - 4x^2 = 28x + 49$, as required.",
      commonErrors: [{
        misconception: "maths.algebra.expand-squared-bracket",
        pattern: { kind: "algebraic", latex: "49" },
        feedback: "$(2x+7)^2$ was taken as $4x^2 + 49$, so the middle term vanished. A 'show that' has to reach the printed line by a forward chain, and the $28x$ comes from the two middle cells of the square.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2025-summer:M4:Q5",
      }],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0009`, topic: T, specRefs: ["M3-NA-05"], style: "practice", difficulty: 3,
    commandWords: ["Expand"], setting: "Pure algebra, a letter other than x",
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q27"],
    solutionProgram: C.s,
    parts: [{
      id: "main", verb: "expand", marks: 2,
      stem: "Expand and simplify $(4t - 1)(t + 6)$.",
      answer: algAnswer("4t^2 + 23t - 6", { variables: ["t"], mustBeExpanded: true }),
      scheme: [MA("MA1", 1, "4t² + 24t − t − 6, or three of the four products correct"), A("A1", 1, "4t² + 23t − 6", { dependsOn: ["MA1"] })],
      hints: ["Keep the letter the question uses: the answer is in $t$, not $x$.", "$4t \\times 6 = 24t$ and $-1 \\times t = -t$.", "$24t - t = 23t$."],
      workedSolution: "$4t^2 + 24t - t - 6 = 4t^2 + 23t - 6$.",
      commonErrors: [{
        misconception: "maths.factorising.wrong-variable-letter",
        pattern: { kind: "algebraic", latex: "4x^2 + 23x - 6" },
        feedback: "The working is right but the letter changed. Examiners report a mark lost for switching to $x$ when the question is set in another letter.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2025-november:M3:Q27",
      }],
      requiresWorking: true,
    }],
  }),
  // ------------------------------------------------------------ exam-style
  question({
    id: `q.${T}.0010`, topic: T, specRefs: ["M3-NA-04", "M3-NA-05"], style: "exam-style", difficulty: 4,
    commandWords: ["Find"], emphasis: ["for all values of x"],
    setting: "Pure algebra, comparing coefficients across an identity",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q4", "ccea-cer:maths:2023-summer:M3:Q15"],
    solutionProgram: "(x+a)(x+3) = x^2 + (3+a)x + 3a; matching x^2 + 7x + b gives 3 + a = 7 so a = 4, and b = 3a = 12; check (x+4)(x+3) = x^2+7x+12 at x = 2: 30 = 30",
    parts: [{
      id: "main", verb: "find", marks: 3,
      stem: "$(x + a)(x + 3) \\equiv x^2 + 7x + b$ for all values of $x$.\n\nFind the value of $a$ and the value of $b$.",
      answer: textAnswer(
        ["a = 4, b = 12"],
        [{ any: ["a = 4", "a=4"], marks: 1 }, { any: ["b = 12", "b=12"], marks: 1 }],
      ),
      scheme: [
        MA("MA1", 1, "left side expanded: x² + 3x + ax + 3a, or x² + (3 + a)x + 3a"),
        A("A1", 1, "a = 4 from 3 + a = 7", { dependsOn: ["MA1"] }),
        A("A2", 1, "b = 12", { ft: true, dependsOn: ["A1"] }),
      ],
      hints: ["$\\equiv$ means the two sides are the same expression, so matching terms must have matching coefficients.", "Expand the left side and collect the $x$ terms into one coefficient.", "Compare the $x$ terms first: $3 + a = 7$."],
      workedSolution: "$(x+a)(x+3) = x^2 + 3x + ax + 3a = x^2 + (3+a)x + 3a$.\nComparing the $x$ terms: $3 + a = 7$, so $a = 4$.\nComparing the constants: $b = 3a = 12$.\nCheck at $x = 2$: $(2+4)(2+3) = 30$ and $4 + 14 + 12 = 30$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.treat-expression-as-equation",
          pattern: { kind: "numeric" },
          feedback: "The $7x$ was read straight off as $a$. The $x$ term of the expansion is $(3 + a)x$, because both brackets contribute to it, so $a = 7 - 3 = 4$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M3:Q15",
        },
        {
          misconception: "maths.algebra.like-terms-powers-added",
          pattern: { kind: "numeric" },
          feedback: "The 3 from the other bracket was copied straight out as $a$. Expanding gives $x^2 + (3 + a)x + 3a$, so it is $3 + a$ that equals 7, giving $a = 4$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q4",
        },
      ],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0011`, topic: T, specRefs: ["M3-NA-05"], style: "exam-style", difficulty: 4,
    commandWords: ["Find", "Expand"], emphasis: ["quadratic expression"],
    setting: "A rectangular lawn with a square pond cut out of one corner",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q25", "ccea-cer:maths:2025-summer:M4:Q5"],
    solutionProgram: C.q + " | lawn (2x+3)(x+5) = 2x^2 + 13x + 15, pond x*x = x^2, difference = x^2 + 13x + 15",
    parts: [
      {
        id: "a", verb: "find", marks: 2,
        stem: "A rectangular lawn measures $(2x + 3)$ metres by $(x + 5)$ metres.\n\nFind the quadratic expression for the area of the lawn. Expand and simplify your answer.",
        answer: algAnswer("2x^2 + 13x + 15", { mustBeExpanded: true }),
        scheme: [
          MA("MA1", 1, "(2x + 3)(x + 5) or 2x² + 10x + 3x + 15"),
          A("A1", 1, "2x² + 13x + 15", { dependsOn: ["MA1"] }),
        ],
        hints: ["Length × width.", "$2x \\times 5 = 10x$ and $3 \\times x = 3x$."],
        workedSolution: "$(2x+3)(x+5) = 2x^2 + 10x + 3x + 15 = 2x^2 + 13x + 15$ square metres.",
        commonErrors: [{
          misconception: "maths.algebra.expression-left-factorised",
          pattern: { kind: "algebraic", latex: "(2x+3)(x+5)" },
          feedback: "Half the work is done: the product is right but the command asks for it expanded and simplified. One mark is available for the product, the second for the expansion.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M3:Q25",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 2,
        stem: "A square pond of side $x$ metres is dug out of one corner of the lawn.\n\nFind, in terms of $x$, the area of grass that remains. Give your answer as a simplified quadratic expression.",
        answer: algAnswer("x^2 + 13x + 15", { mustBeExpanded: true }),
        scheme: [
          MA("MA1", 1, "their area from (a) minus x²", { ft: true }),
          A("A1", 1, "x² + 13x + 15", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["The pond has area $x \\times x$.", "Subtract that from your answer to part (a).", "$2x^2 - x^2 = x^2$, and the other terms are unchanged."],
        workedSolution: "Pond area $= x^2$. Remaining grass $= (2x^2 + 13x + 15) - x^2 = x^2 + 13x + 15$ square metres.",
        commonErrors: [
          {
            misconception: "maths.algebra.like-terms-powers-added",
            pattern: { kind: "algebraic", latex: "2x^2 + 13x + 15 - x" },
            feedback: "The pond's area is $x \\times x = x^2$, not $x$. A square of side $x$ has area $x^2$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M3:Q25",
          },
          {
            misconception: "maths.algebra.bracket-expansion-sign",
            pattern: { kind: "algebraic", latex: "x^2 + 13x + 15 = 0" },
            feedback: "An expression is not set equal to anything. The answer line wants the expression by itself, as reported in Summer 2025 M4 Q5.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M4:Q5",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
];

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T, specRefs: ["M3-NA-05"],
    stem: "Órla was asked to expand and simplify $n^2 + (n + 6)(n - 3)$. Her working:",
    studentWorking: [
      "(n + 6)(n − 3) = n² − 3n + 6n − 18",
      "= n² + 3n − 18",
      "n² + n² + 3n − 18",
      "= n⁴ + 3n − 18",
    ],
    mistakeLine: 4,
    misconception: "maths.algebra.like-terms-powers-added",
    whatWentWrong: "The two $n^2$ terms were multiplied instead of added. Collecting like terms adds the coefficients and leaves the power exactly as it is, so $n^2 + n^2 = 2n^2$.",
    correction: [
      "(n + 6)(n − 3) = n² + 3n − 18",
      "n² + n² + 3n − 18",
      "= 2n² + 3n − 18",
    ],
    marksEarnedAsWritten: ["MA1", "MA2"],
    feedback: "The expansion is correct and so is the collection of the middle terms, so the two method marks stand. The accuracy mark goes on the last line: adding two identical terms doubles the coefficient and never touches the index. The Summer 2025 M4 report described the same slip, with $m^2 + m^2$ coming back as $m^4$. A quick test is worth having: put $n = 1$ into the original, $1 + 7 \\times (-2) = -13$, and into the answer, $2 + 3 - 18 = -13$.",
    source: "ccea-cer:maths:2025-summer:M4:Q4",
  },
];
expect("ftm n=1 original", 1 + (1 + 6) * (1 - 3), -13);
expect("ftm n=1 answer", 2 * 1 + 3 * 1 - 18, -13);
assertNoFailures("t3 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", REF, "definition", "What does $\\equiv$ mean, and how is an identity different from an equation?",
    "$\\equiv$ means the two sides are equal for every value of the letter. An equation is true only for particular values and asks you to find them; an identity is a statement that two expressions are the same thing.",
    ["every value", "identity", "equation", "particular"], 4),
  rp(T, "02", ["M3-NA-05"], "formula", "$(a + b)^2 = $ ? and $(a - b)^2 = $ ?",
    "$a^2 + 2ab + b^2$ and $a^2 - 2ab + b^2$. The middle term comes from the two identical cells of the grid.",
    ["2ab", "a²", "b²"], 4),
  rp(T, "03", ["M3-NA-05"], "procedure", "How many products does expanding two brackets give, and what is always true of the first one?",
    "Four, one for each pair of terms. The first is the product of the two leading terms, so it is always the squared term: $3x \\times 2x = 6x^2$.",
    ["four", "squared term"], 3),
  rp(T, "04", ["M3-NA-05"], "trap", "$m^2 + m^2 = $ ?",
    "$2m^2$. Adding like terms adds the coefficients and leaves the power alone; $m^4$ would be $m^2 \\times m^2$.",
    ["2m²", "power unchanged"], 6),
  rp(T, "05", ["M3-NA-05"], "trap", "Why is $(x + 5)^2$ not $x^2 + 25$?",
    "Squaring a bracket means multiplying it by itself, which produces four products, not two. The two middle cells are both $5x$, giving the $10x$.",
    ["four products", "10x", "middle"], 6),
  rp(T, "06", ["M3-NA-05"], "trap", "A question asks for the 'quadratic expression' for an area. What must the answer look like?",
    "Expanded and simplified, starting with the $x^2$ term, and not set equal to anything. A product left in brackets, or an equation ending in $= 0$, loses the accuracy mark.",
    ["expanded", "not equal to zero", "x² term"], 7),
  rp(T, "07", ["M3-NA-05"], "novel-example", "Expand and simplify $(x + 9)(x - 4)$.",
    "$x^2 + 5x - 36$. The middle term is $-4x + 9x = 5x$ and the constant is $9 \\times -4 = -36$.",
    ["x² + 5x − 36"], 5),
  rp(T, "08", REF, "trap", "You have expanded correctly but you are not sure. What is the ten-second check?",
    "Put a value such as $x = 2$ into the original and into your answer. An identity holds for every value, so the two must agree; if they do not, the slip is in the expansion.",
    ["substitute", "x = 2", "agree"], 5),
];

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed and checked by substitution: (3x − 4)(2x − 3) = 6x² − 17x + 12; (x + 5)² = x² + 10x + 25; (2y − 3)² = 4y² − 12y + 9; (2x + 3)(x + 5) = 2x² + 13x + 15; 4x + 6 = 26 at x = 5 only; (x + 4)(x + 3) = x² + 7x + 12.",
    examiner: "Every examiner callout is taken from packs/maths/insights/m3.identities-and-expanding-double-brackets.json: Summer 2023 M3 Q15, Summer 2024 M3 Q25, Summer 2025 M4 Q4 and Q5, November 2025 M3 Q27.",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, {
    ...base,
    numeric: C.b + "; twin " + C.l,
    examiner: "Exercises the Summer 2023 M3 Q15 finding (a second term not multiplied by the leading term) and the Summer 2024 M3 Q25 finding (12x for 12x²).",
  }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, {
    ...base,
    numeric: "(x + a)(x + 3) = x² + (3 + a)x + 3a; 3 + a = 7 gives a = 4; b = 3a = 12; check at x = 2: 6 × 5 = 30 = 4 + 14 + 12. Twin: (x + p)² − q = x² + 2px + p² − q, so 2p = 10 (p = 5) and p² − q = 18 (q = 7).",
    examiner: "Covers statement M3-NA-04 directly, and the Summer 2025 M4 Q5 finding that an expression was set equal to zero or left as a product.",
  }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "3x × 2x = 6x²; m² + m² = 2m²; −4 × −3 = +12; (x + 7)(x − 2) = x² + 5x − 14; (x + 5)² = x² + 10x + 25; (2x + 3)(x + 5) = 2x² + 13x + 15 — each checked at three values.",
    examiner: "Distractors are the registry misconceptions named on the insight card: like-terms-powers-added, bracket-expansion-sign, expand-squared-bracket, expression-left-factorised.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the errors those findings describe.",
  })),
  ...findTheMistake.map((f) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: "(n + 6)(n − 3) = n² + 3n − 18; n² + n² + 3n − 18 = 2n² + 3n − 18; substitution check at n = 1 gives −13 on both sides.",
    examiner: f.source + " — the wrong line is the reported m² + m² = m⁴ slip.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Prompt answers recomputed: (a ± b)² = a² ± 2ab + b²; (x + 9)(x − 4) = x² + 5x − 36, checked at x = 2, −3 and 0.5.",
    examiner: "Prompts cover the identity definition, the four products, the like-terms trap and the 'quadratic expression' presentation rule from the insight card.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "Factorising a quadratic back into brackets is statement M3-NA-06, a separate topic",
  "Expanding three brackets, or any product that gives a cubic, is not in M3-NA-05",
  "Completing the square, and identities that need it, are outside this specification at M3",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Equations vs identities and expanding two linear expressions",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: ["maths.m2.expanding-and-factorising-with-a-single-term"],
    order: 97,
    hardness: "S",
    difficulty: 3,
    examinerFlagged: false,
    examinerSources: insight.findings.map((f) => f.source),
    examWeightHint:
      "One or two items every series. The short form is 'Expand and simplify (3x − 4)(2x − 3)' for 2 marks around Q25 (Summer 2026 Q25(a)); the applied form is an area written as a quadratic expression, also 2 marks (Summer 2024 Q25, November 2025 Q27). A three-term version worth 3 marks appears mid-paper (Summer 2025 Q18). M4 re-uses it as an opener (Summer 2025 Q4, Q5).",
    mustMemorise: [
      "Four products from two brackets; the first is always the squared term",
      "(a + b)² = a² + 2ab + b² and (a − b)² = a² − 2ab + b²",
      "≡ means true for every value; = in an equation means true for particular values",
      "Collecting like terms adds coefficients and never changes the power",
      "'Expand and simplify' means expanded — not left as a product and not set equal to zero",
    ],
    onFormulaSheet: [],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["identity", "identity symbol", "expand double brackets", "quadratic expression", "FOIL", "grid method", "equation vs identity", "comparing coefficients"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Identities and expanding double brackets",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [],
      mustKnow: [
        "(a + b)² = a² + 2ab + b²; (a − b)² = a² − 2ab + b²",
        "Two brackets give four products; the leading pair gives the x² term",
        "≡ means the two sides agree for every value of the letter",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "S",
    examinerFlagged: false,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Say what the identity symbol ≡ means and tell an identity from an equation, with a reason",
        "Expand and simplify a product of two linear expressions such as (3x − 4)(2x − 3), keeping the signs with their terms",
        "Square a bracket: (x + 5)² = x² + 10x + 25, and (2y − 3)² = 4y² − 12y + 9 with the coefficient squared",
        "Write an area or a difference of areas as a simplified quadratic expression",
        "Expand a product that has a number in front, multiplying every term by it",
        "Compare coefficients across an identity to find unknown constants",
        "Check an expansion in ten seconds by substituting a value into both forms",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks), and again with no calculator in M7 Paper 1. Usually two items. The bare version, 'Expand and simplify (3x − 4)(2x − 3)', is 2 marks near Q25; the applied version gives a rectangle with algebraic sides and asks for the quadratic expression for its area, also 2 marks (Summer 2024 Q25, November 2025 Q27). A longer version worth 3 marks adds a square term to a product (Summer 2025 Q18). Schemes give MA1 for the four products written out and A1 for the collected answer.",
      traps: [
        "The first product not made quadratic — 12x where 12x² was needed (Summer 2024 M3 Q25); November 2025 M3 Q27 reported that answers without a quadratic first term earned nothing",
        "Adding two squared terms and changing the power: m² + m² given as m⁴ (Summer 2025 M4 Q4)",
        "The second term of a bracket not multiplied by the leading term, so only two or three products appear (Summer 2023 M3 Q15)",
        "Leaving the answer as a product when 'expand and simplify' or 'quadratic expression' was asked, or setting it equal to zero (Summer 2025 M4 Q5, Summer 2024 M3 Q25)",
        "(x + 5)² written as x² + 25, with the two middle terms lost",
        "Reading an area question as a perimeter question, so the sides are added instead of multiplied (Summer 2025 M4 Q5)",
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
      title: "Four products, then collect",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.03`, `q.${T}.0001`, `q.${T}.0002`, `rp.${T}.02`, `q.${T}.0003`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Expanding, squaring, areas and identities",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0004`, `q.${T}.0006`, `ftm.${T}.01`, `q.${T}.0008`, `q.${T}.0010`, `q.${T}.0011`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Identities and expanding double brackets" },
  {
    type: "callout", kind: "spec", title: "The two statements",
    md: "**M3-NA-04** — know the difference between an equation and an identity. The Teacher Guidance adds: know the meaning of the word 'identity' and the identity symbol $\\equiv$.\n**M3-NA-05** — multiply two linear expressions. The guidance names the examples: expand and simplify $(x + 4)(x - 2)$, and know that $(a \\pm b)^2 = a^2 \\pm 2ab + b^2$.",
    source: "CCEA GCSE Mathematics specification, statements M3-NA-04 and M3-NA-05 with their Teacher Guidance",
  },
  {
    type: "p",
    md: "Expanding two brackets is the engine of the whole algebra strand. Factorising, solving quadratics, algebraic fractions and the quadratic formula all rest on being able to do this without thinking. It is worth two marks on its own most series, and it quietly decides whether the six-mark questions later in the paper are possible.",
  },
  { type: "h", text: "Equation or identity?" },
  {
    type: "p",
    md: "Two statements that look almost the same:\n$4x + 6 = 26$ is an **equation**. Try $x = 1$: $10 = 26$, which fails. Only $x = 5$ works. An equation is a question — which values make this true.\n$4x + 6 \\equiv 2(2x + 3)$ is an **identity**. Try any $x$ you like; it works every time, because the right side is the left side rewritten. The symbol $\\equiv$ announces exactly that.\nThe practical payoff: if two expressions are identical, their coefficients must match term for term. That is what lets you find unknown constants by comparing.",
  },
  {
    type: "gate", id: "g1", kind: "choice",
    prompt: "Which of these is an identity?",
    options: ["$3(x + 2) \\equiv 3x + 6$", "$3x + 6 = 18$", "$x^2 = 9$"],
    answer: "$3(x + 2) \\equiv 3x + 6$",
    explain: "It holds for every $x$. The other two are true only for particular values.",
  },
  { type: "h", text: "The grid: four products, no exceptions" },
  {
    type: "p",
    md: "Two brackets, two terms each, so four pairs and four products. A grid keeps every pair visible. Take the sign into the heading — write $-4$, not 4 — and the signs look after themselves.",
  },
  noteFigure(gridMain, gridMainAlt, 640, 300,
    "Every pair of terms multiplied once: the four cells of (3x − 4)(2x − 3)", "grid-expand-main"),
  {
    type: "p",
    md: "$(3x - 4)(2x - 3) = 6x^2 - 8x - 9x + 12 = 6x^2 - 17x + 12$.\nThree things are worth saying out loud:\n**The top-left cell is always the squared term.** $3x \\times 2x = 6x^2$. Numbers multiply, and $x \\times x = x^2$.\n**The bottom-right cell carries the product of the two signs.** $-4 \\times -3 = +12$.\n**Only the middle two cells are alike**, so only they collect: $-8x - 9x = -17x$.",
  },
  {
    type: "callout", kind: "examiner", title: "November 2025 M3 Q27 and Summer 2024 M3 Q25",
    md: "Answers with no quadratic first term earned nothing at all; candidates who knew the answer had to start with an $x^2$ term mostly took both marks. In 2024 the recurring slip was $12x$ where $12x^2$ was needed.",
    source: "ccea-cer:maths:2025-november:M3:Q27",
  },
  {
    type: "gate", id: "g2", kind: "blank",
    prompt: "Expand and simplify $(x + 7)(x - 2)$.",
    answer: "x² + 5x − 14",
    explain: "$x^2 - 2x + 7x - 14$, and $-2x + 7x = 5x$.",
  },
  { type: "h", text: "Squaring a bracket" },
  {
    type: "p",
    md: "$(x + 5)^2$ is not $x^2 + 25$. Write it out as $(x + 5)(x + 5)$ and the grid tells the truth:",
  },
  noteFigure(gridSquare, gridSquareAlt, 640, 300,
    "The two middle cells of a squared bracket are identical — that is where 2ab comes from", "grid-expand-square"),
  {
    type: "p",
    md: "The two middle cells are both $5x$, so the middle term is $10x$. That is the whole content of the guidance formula: $(a + b)^2 = a^2 + 2ab + b^2$, and $(a - b)^2 = a^2 - 2ab + b^2$ with the middle term negative.\nWhen a coefficient is involved, the coefficient is squared too: $(2y - 3)^2 = 4y^2 - 12y + 9$, because $(2y)^2 = 2y \\times 2y = 4y^2$.",
  },
  {
    type: "gate", id: "g3", kind: "choice",
    prompt: "$(2y - 3)^2 = $ ?",
    options: ["$4y^2 - 12y + 9$", "$2y^2 - 12y + 9$", "$4y^2 + 9$"],
    answer: "$4y^2 - 12y + 9$",
    explain: "$(2y)^2 = 4y^2$; the two middle cells are each $-6y$; $-3 \\times -3 = +9$.",
  },
  { type: "h", text: "Collecting like terms never changes the power" },
  {
    type: "p",
    md: "$m^2 + (m + 7)(m - 2)$. Expand the product: $m^2 + 5m - 14$. Now add the lone $m^2$:\n$m^2 + m^2 + 5m - 14 = 2m^2 + 5m - 14$.\nTwo of a thing is two of that thing. $m^4$ would be $m^2 \\times m^2$, which is not what addition does.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q4",
    md: "The expansion mark was earned widely. Adding the two squared terms is where it went: $m^2 + m^2$ came back as $m^4$ for many candidates.",
    source: "ccea-cer:maths:2025-summer:M4:Q4",
  },
  {
    type: "gate", id: "g4", kind: "blank",
    prompt: "$3n^2 + n^2 = $ ?",
    answer: "4n²",
    explain: "Add the coefficients, leave the index: $3 + 1 = 4$.",
  },
  { type: "h", text: "Areas: the applied version" },
  {
    type: "p",
    md: "A rectangle $(2x + 3)$ by $(x + 5)$. The area model is the same grid, drawn to scale: four regions whose areas are the four products.",
  },
  noteFigure(areaBody, areaAlt, 620, 326,
    "The four regions of a rectangle with algebraic sides are the four products of the grid", "area-model-expand"),
  {
    type: "p",
    md: "Area $= 2x^2 + 3x + 10x + 15 = 2x^2 + 13x + 15$.\nWatch the command word. **'Quadratic expression'** and **'expand and simplify'** both mean: written out, starting with the $x^2$ term, not left as a product and not set equal to zero. Leaving $(2x+3)(x+5)$ on the answer line throws away the accuracy mark for work you have already done.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q5",
    md: "Most candidates who started with the right product expanded it correctly. Marks went for leaving the product unexpanded, for setting it equal to zero, for using only part of the height, for finding a perimeter instead, and for re-factorising after expanding.",
    source: "ccea-cer:maths:2025-summer:M4:Q5",
  },
  {
    type: "gate", id: "g5", kind: "choice",
    prompt: "A rectangle is $(x + 6)$ by $(x + 1)$. What is the quadratic expression for its area?",
    options: ["$x^2 + 7x + 6$", "$(x + 6)(x + 1)$", "$4x + 14$"],
    answer: "$x^2 + 7x + 6$",
    explain: "The product expanded. $4x + 14$ is the perimeter; the bracketed form is not yet an expression in the form asked for.",
  },
  { type: "h", text: "Comparing coefficients" },
  {
    type: "p",
    md: "$(x + a)(x + 3) \\equiv x^2 + 7x + b$ for all $x$.\nExpand: $x^2 + 3x + ax + 3a = x^2 + (3 + a)x + 3a$.\nThe $\\equiv$ means the sides are the same expression, so their coefficients match:\n$x$ terms: $3 + a = 7$, so $a = 4$.\nNumbers: $b = 3a = 12$.\nNotice that $a$ is not simply 7 — both brackets contribute to the $x$ term, which is why the $3$ is there.",
  },
  {
    type: "gate", id: "g6", kind: "number",
    prompt: "$(x + a)(x + 2) \\equiv x^2 + 9x + c$. The value of $a$ is",
    answer: "7",
    explain: "$2 + a = 9$. (And then $c = 2a = 14$.)",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** four products from two brackets, the first one squared; $(a \\pm b)^2 = a^2 \\pm 2ab + b^2$; $\\equiv$ means true for every value; collecting like terms never changes the power.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "Turning a quadratic back into brackets is **M3-NA-06**, the next topic. Expanding three brackets to a cubic is not part of M3-NA-05, and completing the square is not in this unit.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "Expect two items. The bare 'Expand and simplify' is 2 marks, usually around Q25; the area version is also 2 marks and sits in the same stretch. A 3-mark version adds a square term to a product.\nThe **first** mark is for the four products written out, so write them all down even if you can see the answer — a correct grid with one arithmetic slip still scores. The **last** mark is the collected expression in the letter the question uses, expanded, and equal to nothing.\nIf you are unsure, substitute. Put $x = 2$ into the original and into your answer; an identity agrees for every value, so a disagreement points straight at the slip.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.02` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.06` },
];

assertNoFailures("t3 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
