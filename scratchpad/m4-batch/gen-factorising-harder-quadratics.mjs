/**
 * maths.m4.factorising-harder-quadratics-ax2-plus-bx-plus-c — H bundle.
 * Every factorisation is proved here by expanding the brackets symbolically and by
 * substituting three sample points, before it reaches a stem, an answer or a scheme.
 */
import fs from "node:fs";
import path from "node:path";
import { PAPER, timeFor, svgFigure, writeBundle, collectLogs, UPDATED, ROOT } from "./lib.mjs";

const SLUG = "factorising-harder-quadratics-ax2-plus-bx-plus-c";
const TID = `maths.m4.${SLUG}`;
const qid = (n) => `q.${TID}.${String(n).padStart(4, "0")}`;

// ---------------------------------------------------------------------------
// Symbolic check: expand k(ax + by + c)(dx + ey + f) and compare with the target
// ---------------------------------------------------------------------------
const bin = (ax = 0, by = 0, c = 0) => ({ ax, by, c });
const near = (a, b) => Math.abs(a - b) < 1e-9;

function expand(k, p, q) {
  return {
    x2: k * p.ax * q.ax,
    xy: k * (p.ax * q.by + p.by * q.ax),
    y2: k * p.by * q.by,
    x: k * (p.ax * q.c + p.c * q.ax),
    y: k * (p.by * q.c + p.c * q.by),
    k: k * p.c * q.c,
  };
}
const evalPoly = (t, x, y) =>
  (t.x2 ?? 0) * x * x + (t.xy ?? 0) * x * y + (t.y2 ?? 0) * y * y + (t.x ?? 0) * x + (t.y ?? 0) * y + (t.k ?? 0);

/** Proves target === k * p * q, both by coefficients and at three sample points. */
function proof(label, target, k, p, q) {
  const got = expand(k, p, q);
  for (const key of ["x2", "xy", "y2", "x", "y", "k"]) {
    if (!near(got[key] ?? 0, target[key] ?? 0)) {
      throw new Error(`${label}: coefficient ${key} is ${got[key]}, expected ${target[key] ?? 0}`);
    }
  }
  const points = [
    [2, 3],
    [-1, 5],
    [4, -2],
  ];
  const checks = points.map(([x, y]) => {
    const lhs = evalPoly(target, x, y);
    const rhs = k * (p.ax * x + p.by * y + p.c) * (q.ax * x + q.by * y + q.c);
    if (!near(lhs, rhs)) throw new Error(`${label}: value check failed at (${x}, ${y}): ${lhs} vs ${rhs}`);
    return `(${x}, ${y}) -> ${lhs}`;
  });
  return `${label}: coefficients match and the three sample points agree [${checks.join("; ")}]`;
}

const PROOFS = [];
const prove = (...args) => {
  const line = proof(...args);
  PROOFS.push(line);
  return line;
};

// Worked examples
prove("we1 6x^2 + 11x - 10 = (3x - 2)(2x + 5)", { x2: 6, x: 11, k: -10 }, 1, bin(3, 0, -2), bin(2, 0, 5));
prove("we2 12x^2 - 27y^2 = 3(2x + 3y)(2x - 3y)", { x2: 12, y2: -27 }, 3, bin(2, 3, 0), bin(2, -3, 0));
prove("we3 2ax^2 + 11axy + 12ay^2 = a(2x + 3y)(x + 4y)", { x2: 2, xy: 11, y2: 12 }, 1, bin(2, 3, 0), bin(1, 4, 0));
prove("we4 (9/16)x^2 - 49 = ((3/4)x + 7)((3/4)x - 7)", { x2: 9 / 16, k: -49 }, 1, bin(3 / 4, 0, 7), bin(3 / 4, 0, -7));

// Practice
prove("q1 2x^2 + 7x + 3", { x2: 2, x: 7, k: 3 }, 1, bin(2, 0, 1), bin(1, 0, 3));
prove("q2 3x^2 + 10x + 8", { x2: 3, x: 10, k: 8 }, 1, bin(3, 0, 4), bin(1, 0, 2));
prove("q3 5x^2 - 13x + 6", { x2: 5, x: -13, k: 6 }, 1, bin(5, 0, -3), bin(1, 0, -2));
prove("q4 4x^2 - 4x - 15", { x2: 4, x: -4, k: -15 }, 1, bin(2, 0, 3), bin(2, 0, -5));
prove("q5 6x^2 - 19x + 10", { x2: 6, x: -19, k: 10 }, 1, bin(3, 0, -2), bin(2, 0, -5));
prove("q6 8x^2 + 2x - 15", { x2: 8, x: 2, k: -15 }, 1, bin(4, 0, -5), bin(2, 0, 3));
prove("q7 2x^2 - 50 = 2(x + 5)(x - 5)", { x2: 2, k: -50 }, 2, bin(1, 0, 5), bin(1, 0, -5));
prove("q8 (1/4)x^2 - 81 = ((1/2)x + 9)((1/2)x - 9)", { x2: 1 / 4, k: -81 }, 1, bin(1 / 2, 0, 9), bin(1 / 2, 0, -9));
prove("q9 8m^2 - 18n^2 (inside 2n) = 2(2m + 3n)(2m - 3n)", { x2: 8, y2: -18 }, 2, bin(2, 3, 0), bin(2, -3, 0));
prove("q10 20a^2 - 45b^2 (inside 5a) = 5(2a + 3b)(2a - 3b)", { x2: 20, y2: -45 }, 5, bin(2, 3, 0), bin(2, -3, 0));
prove("q11 x^2 + 2xy - 15y^2", { x2: 1, xy: 2, y2: -15 }, 1, bin(1, 5, 0), bin(1, -3, 0));
prove("q12 2x^2 - 7xy + 6y^2", { x2: 2, xy: -7, y2: 6 }, 1, bin(1, -2, 0), bin(2, -3, 0));
// Four-term grouping: treat m as x and n as y; 6mn + 9m - 4n - 6 = (3m - 2)(2n + 3)
prove("q13 6mn + 9m - 4n - 6 = (3m - 2)(2n + 3)", { xy: 6, x: 9, y: -4, k: -6 }, 1, bin(3, 0, -2), bin(0, 2, 3));
prove("q14 10cd - 15c + 4d - 6 = (5c + 2)(2d - 3)", { xy: 10, x: -15, y: 4, k: -6 }, 1, bin(5, 0, 2), bin(0, 2, -3));

// Exam-style
prove("e1 7x^2 - 63y^2 (inside 7a) = 7(x + 3y)(x - 3y)", { x2: 7, y2: -63 }, 7, bin(1, 3, 0), bin(1, -3, 0));
prove("e2a 6x^2 + x - 12 = (3x - 4)(2x + 3)", { x2: 6, x: 1, k: -12 }, 1, bin(3, 0, -4), bin(2, 0, 3));
prove("e2b 4x^2 - 9 = (2x + 3)(2x - 3)", { x2: 4, k: -9 }, 1, bin(2, 0, 3), bin(2, 0, -3));
prove("e3a 3x^2 - 14x - 5 = (3x + 1)(x - 5)", { x2: 3, x: -14, k: -5 }, 1, bin(3, 0, 1), bin(1, 0, -5));
prove("e4a 4p^2 - 20pq + 25q^2 = (2p - 5q)^2", { x2: 4, xy: -20, y2: 25 }, 1, bin(2, -5, 0), bin(2, -5, 0));
prove("e4b x^2 - 16y^2 (inside 2xy) = (x + 4y)(x - 4y)", { x2: 1, y2: -16 }, 1, bin(1, 4, 0), bin(1, -4, 0));
// Twins
prove("we1 twin 10x^2 - 9x - 7 = (5x - 7)(2x + 1)", { x2: 10, x: -9, k: -7 }, 1, bin(5, 0, -7), bin(2, 0, 1));
prove("we2 twin 50a^2 - 32b^2 = 2(5a + 4b)(5a - 4b)", { x2: 50, y2: -32 }, 2, bin(5, 4, 0), bin(5, -4, 0));
prove("we3 twin 3x^2 - 5xy - 12y^2 = (3x + 4y)(x - 3y)", { x2: 3, xy: -5, y2: -12 }, 1, bin(3, 4, 0), bin(1, -3, 0));
prove("we4 twin (25/36)x^2 - 16", { x2: 25 / 36, k: -16 }, 1, bin(5 / 6, 0, 4), bin(5 / 6, 0, -4));

// Perimeter for E3(b): area (3x + 1)(x - 5), one side (x - 5), perimeter = 2((3x + 1) + (x - 5)) = 8x - 8
const E3perim = { x: 2 * (3 + 1), k: 2 * (1 + -5) };
if (E3perim.x !== 8 || E3perim.k !== -8) throw new Error("E3 perimeter check failed");

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

const GRID_FIG = `<svg viewBox="0 0 340 250" xmlns="http://www.w3.org/2000/svg" width="340" height="250" role="img" aria-labelledby="gridfig"><title id="gridfig">A two by two grid area model showing six x squared, fifteen x, minus four x and minus ten</title><g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="90" y="60" width="210" height="140"/><path d="M220 60 V200"/><path d="M90 140 H300"/></g><g fill="currentColor" fill-opacity="0.1" stroke="none"><rect x="90" y="60" width="130" height="80"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="15"><text x="155" y="107" text-anchor="middle">6x²</text><text x="260" y="107" text-anchor="middle">+15x</text><text x="155" y="177" text-anchor="middle">−4x</text><text x="260" y="177" text-anchor="middle">−10</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="15" font-weight="600"><text x="155" y="48" text-anchor="middle">2x</text><text x="260" y="48" text-anchor="middle">+5</text><text x="78" y="107" text-anchor="end">3x</text><text x="78" y="177" text-anchor="end">−2</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="12"><text x="90" y="228">6x² + 15x − 4x − 10 = 6x² + 11x − 10</text></g></svg>`;

const GRID2_FIG = `<svg viewBox="0 0 340 250" xmlns="http://www.w3.org/2000/svg" width="340" height="250" role="img" aria-labelledby="grid2fig"><title id="grid2fig">A two by two grid area model for two x squared minus seven x y plus six y squared</title><g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="90" y="60" width="210" height="140"/><path d="M215 60 V200"/><path d="M90 138 H300"/></g><g fill="currentColor" fill-opacity="0.1" stroke="none"><rect x="90" y="60" width="125" height="78"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="15"><text x="152" y="105" text-anchor="middle">2x²</text><text x="258" y="105" text-anchor="middle">−3xy</text><text x="152" y="175" text-anchor="middle">−4xy</text><text x="258" y="175" text-anchor="middle">+6y²</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="15" font-weight="600"><text x="152" y="48" text-anchor="middle">2x</text><text x="258" y="48" text-anchor="middle">−3y</text><text x="78" y="105" text-anchor="end">x</text><text x="78" y="175" text-anchor="end">−2y</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="12"><text x="90" y="228">2x² − 3xy − 4xy + 6y² = 2x² − 7xy + 6y²</text></g></svg>`;

const RECT_FIG = `<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg" width="340" height="200" role="img" aria-labelledby="rectfig"><title id="rectfig">A rectangle with its area written inside and one side labelled x minus five</title><g fill="none" stroke="currentColor" stroke-width="1.7"><rect x="60" y="50" width="220" height="100"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="14"><text x="170" y="105" text-anchor="middle">Area = (3x² − 14x − 5) cm²</text><text x="48" y="105" text-anchor="end">(x − 5) cm</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="332" y="24" text-anchor="end">diagram not drawn</text><text x="332" y="38" text-anchor="end">accurately</text></g></svg>`;

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

const workedExamples = [
  {
    id: `we.${TID}.01`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    paper: PAPER,
    stem: "Factorise $6x^2 + 11x - 10$.",
    figure: svgFigure(
      GRID_FIG,
      "A two by two grid area model. The columns are headed 2x and plus 5, the rows are headed 3x and minus 2, and the four cells contain 6x squared, plus 15x, minus 4x and minus 10.",
    ),
    steps: [
      {
        n: 1,
        working: "$a = 6$, $c = -10$, so $ac = -60$; $b = 11$",
        decision:
          "With a number in front of $x^2$, the pair of numbers you need multiplies to $ac$, not to $c$. Writing $ac$ down first is what separates this from the easier $x^2 + bx + c$ case.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because the 6 has to be shared out between the two brackets, and ac keeps track of it",
            "Because ac is always larger than c",
            "Because b is the product of the two numbers",
          ],
          correct: 0,
          explain:
            "In $(px + m)(qx + n)$ the constant term is $mn$ and the $x^2$ coefficient is $pq$, so the pair that splits the middle term multiplies to $pq \\times mn = ac$.",
        },
      },
      {
        n: 2,
        working: "Pair with product $-60$ and sum $11$: $15$ and $-4$",
        decision:
          "Run through the factor pairs of 60 — 1 and 60, 2 and 30, 3 and 20, 4 and 15, 5 and 12, 6 and 10 — and look for a difference of 11, because the product is negative. That is 15 and 4, and the larger takes the sign of $b$.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$6x^2 + 15x - 4x - 10$",
        decision: "Split the middle term using that pair. The expression has not changed: $15x - 4x = 11x$.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$3x(2x + 5) - 2(2x + 5)$",
        decision:
          "Factorise the first two terms and the last two separately. The second bracket must come out identical to the first; if it does not, take out a negative common factor instead, as here where $-2$ was used rather than $2$.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because taking out −2 makes the second bracket match the first",
            "Because −4x − 10 cannot be factorised any other way",
            "Because a minus sign must always be taken outside",
          ],
          correct: 0,
          explain: "Taking out $+2$ would give $2(-2x - 5)$, which does not match $(2x + 5)$. The sign of the common factor is chosen to make the brackets agree.",
        },
      },
      {
        n: 5,
        working: "$(3x - 2)(2x + 5)$",
        decision:
          "Both terms share $(2x + 5)$, so take it out. Check by expanding the middle: $3x \\times 5 = 15x$ and $-2 \\times 2x = -4x$, giving $11x$.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$(3x - 2)(2x + 5)$",
    twin: {
      stem: "Factorise $10x^2 - 9x - 7$.",
      answer: {
        kind: "algebraic",
        latex: "(5x-7)(2x+1)",
        equivalence: "equivalent",
        variables: ["x"],
        mustBeFactorised: true,
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4, 5] },
      { showSteps: 1, studentSupplies: [2, 3, 4, 5] },
    ],
    verification: `ver.we.${TID}.01`,
    version: 1,
  },
  {
    id: `we.${TID}.02`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    paper: PAPER,
    stem: "Factorise fully $12x^2 - 27y^2$.",
    steps: [
      {
        n: 1,
        working: "Highest common factor of $12$ and $27$ is $3$: $3(4x^2 - 9y^2)$",
        decision:
          "Always look for a common factor first, numbers and letters. Here the letters share nothing, so only the 3 comes out.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$4x^2 = (2x)^2$ and $9y^2 = (3y)^2$",
        decision:
          "The word **fully** means keep going. Inside the bracket is a square minus a square, even though neither term is a bare letter. Rewriting each term as something squared makes it visible.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because a² − b² factorises whatever a and b are",
            "Because 4 and 9 are the only square numbers",
            "Because x and y must have the same power",
          ],
          correct: 0,
          explain: "$a^2 - b^2 = (a + b)(a - b)$ holds for any $a$ and $b$, including $2x$, $3y$, a fraction, or a product of letters.",
        },
      },
      {
        n: 3,
        working: "$3(2x + 3y)(2x - 3y)$",
        decision:
          "Apply the difference of two squares, keeping the 3 outside. In November 2025 most candidates took the common factor out and stopped there; only the top candidates saw the difference of two squares that was left.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$3(2x + 3y)(2x - 3y)$",
    twin: {
      stem: "Factorise fully $50a^2 - 32b^2$.",
      answer: {
        kind: "algebraic",
        latex: "2(5a+4b)(5a-4b)",
        equivalence: "equivalent",
        variables: ["a", "b"],
        mustBeFactorised: true,
      },
    },
    faded: [
      { showSteps: 1, studentSupplies: [2, 3] },
      { showSteps: 0, studentSupplies: [1, 2, 3] },
    ],
    verification: `ver.we.${TID}.02`,
    version: 1,
  },
  {
    id: `we.${TID}.03`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    paper: PAPER,
    stem: "Factorise fully $2ax^2 + 11axy + 12ay^2$.",
    steps: [
      {
        n: 1,
        working: "$a(2x^2 + 11xy + 12y^2)$",
        decision:
          "Every term has an $a$, so it comes out first. The bracket is then an ordinary harder quadratic, but in two letters instead of one.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$ac = 2 \\times 12 = 24$, and a pair with product $24$ and sum $11$: $3$ and $8$",
        decision:
          "Treat $y$ the way the constant behaves in a one-letter quadratic: the coefficients are 2, 11 and 12, so the method does not change at all.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$a(2x^2 + 3xy + 8xy + 12y^2) = a[x(2x + 3y) + 4y(2x + 3y)]$",
        decision:
          "Split and group. The common factor of the second pair is $4y$, not 4: the letters count too, and this is the step where the second variable is usually dropped.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$a(x + 4y)(2x + 3y)$",
        decision:
          "Take out $(2x + 3y)$. Check the middle by expanding: $x \\times 3y = 3xy$ and $4y \\times 2x = 8xy$, giving $11xy$, and each term still carries its $a$.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$a(x + 4y)(2x + 3y)$",
    twin: {
      stem: "Factorise $3x^2 - 5xy - 12y^2$.",
      answer: {
        kind: "algebraic",
        latex: "(3x+4y)(x-3y)",
        equivalence: "equivalent",
        variables: ["x", "y"],
        mustBeFactorised: true,
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TID}.03`,
    version: 1,
  },
  {
    id: `we.${TID}.04`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    paper: PAPER,
    stem: "Factorise $\\dfrac{9}{16}x^2 - 49$.",
    steps: [
      {
        n: 1,
        working: "No common factor: $\\tfrac{9}{16}$ and $49$ share nothing",
        decision: "The first check still happens, and it comes to nothing here. That is worth writing, because it stops you looking for one again later.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$\\dfrac{9}{16}x^2 = \\left(\\dfrac{3}{4}x\\right)^2$ and $49 = 7^2$",
        decision:
          "A fraction can be a perfect square: $\\sqrt{9} = 3$ and $\\sqrt{16} = 4$. This is the case Summer 2023 examiners said most candidates scored zero on, simply because they did not look for a square root of a fraction.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because the square root of 9/16 is 3/4, so the term is a perfect square",
            "Because fractions cannot be factorised",
            "Because 9/16 must be turned into a decimal first",
          ],
          correct: 0,
          explain: "Square-root the top and the bottom separately: $\\sqrt{9/16} = 3/4$. The difference of two squares does not care that $a$ is a fraction.",
        },
      },
      {
        n: 3,
        working: "$\\left(\\dfrac{3}{4}x + 7\\right)\\left(\\dfrac{3}{4}x - 7\\right)$",
        decision:
          "Apply $a^2 - b^2 = (a + b)(a - b)$ with $a = \\tfrac{3}{4}x$ and $b = 7$. Expanding the middle gives $-\\tfrac{21}{4}x + \\tfrac{21}{4}x = 0$, as it must.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$\\left(\\dfrac{3}{4}x + 7\\right)\\left(\\dfrac{3}{4}x - 7\\right)$",
    twin: {
      stem: "Factorise $\\dfrac{25}{36}x^2 - 16$.",
      answer: {
        kind: "algebraic",
        latex: "\\left(\\frac{5}{6}x+4\\right)\\left(\\frac{5}{6}x-4\\right)",
        equivalence: "equivalent",
        variables: ["x"],
        mustBeFactorised: true,
      },
    },
    faded: [
      { showSteps: 1, studentSupplies: [2, 3] },
      { showSteps: 0, studentSupplies: [1, 2, 3] },
    ],
    verification: `ver.we.${TID}.04`,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

const opt = (id, text, correct, feedback, misconception) =>
  misconception ? { id, text, correct, misconception, feedback } : { id, text, correct, feedback };

const diagnostics = [
  {
    id: `dx.${TID}`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    when: "pre",
    items: [
      {
        id: "01",
        stem: "To factorise $6x^2 + 11x - 10$, which pair of numbers do you look for?",
        skill: "Use ac, not c, when splitting the middle term",
        options: [
          opt("a", "Product $-60$, sum $11$", true, "With a in front of x², the pair multiplies to ac = 6 × (−10) = −60."),
          opt("b", "Product $-10$, sum $11$", false, "That is the rule for x² + bx + c, where a = 1. Here the 6 has to be accounted for, so use ac.", "maths.factorising.middle-term-split-ignores-a"),
          opt("c", "Product $11$, sum $-60$", false, "The product and the sum have been swapped. The pair multiplies to ac and adds to b.", "maths.factorising.middle-term-split-ignores-a"),
          opt("d", "Product $6$, sum $11$", false, "That uses a instead of ac. The product needed is a × c.", "maths.factorising.middle-term-split-ignores-a"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "02",
        stem: "Factorise $3x^2 + 10x + 8$.",
        skill: "Factorise ax² + bx + c with positive coefficients",
        options: [
          opt("a", "$(3x + 4)(x + 2)$", true, "Expanding the middle gives 6x + 4x = 10x."),
          opt("b", "$(3x + 8)(x + 1)$", false, "The constants multiply to 8 but the middle term comes to 3x + 8x = 11x, not 10x. Check the middle by expanding.", "maths.factorising.sign-errors-in-brackets"),
          opt("c", "$(3x + 2)(x + 4)$", false, "This gives 12x + 2x = 14x. The 3 multiplies whichever constant sits in the other bracket, so the order matters.", "maths.factorising.sign-errors-in-brackets"),
          opt("d", "$3(x + 4)(x + 2)$", false, "Expanding gives 3x² + 18x + 24. The 3 belongs inside one bracket, not outside both; 3 is not a factor of the whole expression.", "maths.factorising.not-fully-factorised"),
        ],
        secondsExpected: 35,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "03",
        stem: "Factorise fully $5p^2 - 45q^2$.",
        skill: "Common factor first, then the difference of two squares",
        options: [
          opt("a", "$5(p + 3q)(p - 3q)$", true, "Take out 5, then p² − 9q² is a difference of two squares."),
          opt("b", "$5(p^2 - 9q^2)$", false, "The common factor is right, and that is the first mark. Fully means keep going: p² − 9q² still factorises.", "maths.factorising.common-factor-then-stop"),
          opt("c", "$(5p + 9q)(p - 5q)$", false, "Expanding gives 5p² − 25pq + 9pq − 45q², which has a pq term the original does not. Take the common factor out first.", "maths.factorising.sign-errors-in-brackets"),
          opt("d", "$5(p - 3q)^2$", false, "A squared bracket expands to p² − 6pq + 9q², with a middle term. A difference of two squares has one plus and one minus bracket.", "maths.factorising.dots-term-order"),
        ],
        secondsExpected: 35,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "04",
        stem: "Factorise $\\dfrac{1}{9}x^2 - 25$.",
        skill: "Difference of two squares with a fractional coefficient",
        options: [
          opt("a", "$\\left(\\dfrac{1}{3}x + 5\\right)\\left(\\dfrac{1}{3}x - 5\\right)$", true, "√(1/9) = 1/3 and √25 = 5, so it is a² − b² with a = x/3."),
          opt("b", "It does not factorise", false, "A fraction can be a perfect square. Square-root the top and the bottom separately.", "maths.factorising.dots-fractional-coefficient"),
          opt("c", "$\\dfrac{1}{9}(x + 5)(x - 5)$", false, "Expanding gives (x² − 25)/9, and the constant term is −25/9, not −25. The 1/9 cannot be taken out of the 25.", "maths.factorising.dots-fractional-coefficient"),
          opt("d", "$\\left(\\dfrac{1}{9}x + 5\\right)\\left(\\dfrac{1}{9}x - 5\\right)$", false, "This gives x²/81 as the first term. The square root of 1/9 is 1/3, not 1/9.", "maths.factorising.dots-fractional-coefficient"),
        ],
        secondsExpected: 40,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "05",
        stem: "Factorise $x^2 + 2xy - 15y^2$.",
        skill: "Factorise a quadratic in two variables",
        options: [
          opt("a", "$(x + 5y)(x - 3y)$", true, "The pair is +5 and −3: they give 5xy − 3xy = 2xy and −15y²."),
          opt("b", "$(x + 5)(x - 3)$", false, "The y has been dropped. Every bracket must contain y, or the y² term cannot appear when you expand.", "maths.factorising.wrong-variable-letter"),
          opt("c", "$(x - 5y)(x + 3y)$", false, "The signs are the other way round: this gives −2xy. Check the middle term by expanding.", "maths.factorising.sign-errors-in-brackets"),
          opt("d", "$(x + 15y)(x - y)$", false, "The constants multiply to −15 but the middle comes to 14xy, not 2xy. Test the pair on the middle term before you commit.", "maths.factorising.sign-errors-in-brackets"),
        ],
        secondsExpected: 40,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "06",
        stem: "Factorise $6mn + 9m - 4n - 6$ by grouping.",
        skill: "Group four terms, choosing the sign of the second common factor",
        options: [
          opt("a", "$(3m - 2)(2n + 3)$", true, "3m(2n + 3) − 2(2n + 3): taking out −2 makes the second bracket match."),
          opt("b", "$(3m + 2)(2n + 3)$", false, "Expanding gives +4n + 6 at the end, not −4n − 6. The common factor taken out of the last pair is −2.", "maths.factorising.sign-errors-in-brackets"),
          opt("c", "$3m(2n + 3) + 2(-2n - 3)$", false, "This is a correct line of working but not a factorisation: the two brackets do not match, so nothing can be taken out. Use −2 instead of +2.", "maths.algebra.expression-left-factorised"),
          opt("d", "$(6m - 4)(n + 1.5)$", false, "Expanding gives 6mn + 9m − 4n − 6, so the algebra works, but 6m − 4 still has a common factor of 2 and the answer contains a decimal. Factorise fully into whole-number brackets.", "maths.factorising.not-fully-factorised"),
        ],
        secondsExpected: 45,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "07",
        stem: "Factorise fully $3ax^2 - 75ay^2$.",
        skill: "Take out a common factor with a letter, then finish",
        options: [
          opt("a", "$3a(x + 5y)(x - 5y)$", true, "3a comes out, and x² − 25y² is a difference of two squares."),
          opt("b", "$3a(x^2 - 25y^2)$", false, "The common factor is right, and it earns the first mark. Fully means the bracket must be factorised too.", "maths.factorising.common-factor-then-stop"),
          opt("c", "$3(ax^2 - 25ay^2)$", false, "Only part of the common factor has been taken out: the a is in both terms as well.", "maths.factorising.not-fully-factorised"),
          opt("d", "$3a(x - 5y)^2$", false, "A squared bracket has a middle term, −10xy. The difference of two squares needs one plus bracket and one minus bracket.", "maths.factorising.dots-term-order"),
        ],
        secondsExpected: 40,
        confidence: true,
        hypercorrectionQueue: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

const part = (o) => ({
  id: o.id ?? "main",
  stem: o.stem,
  marks: o.marks,
  answer: o.answer,
  scheme: o.scheme,
  hints: o.hints,
  workedSolution: o.workedSolution,
  commonErrors: o.commonErrors ?? [],
  requiresWorking: o.requiresWorking ?? true,
  ...(o.followThrough ? { followThrough: o.followThrough } : {}),
});

const question = (o) => ({
  id: o.id,
  topic: TID,
  specRefs: ["M4-NA-02"],
  paper: PAPER,
  tier: "H",
  style: o.style,
  difficulty: o.difficulty,
  ao: o.ao,
  commandWords: o.commandWords,
  emphasis: o.emphasis,
  context: { setting: o.setting, original: true },
  figures: o.figures ?? [],
  parts: o.parts,
  totalMarks: o.parts.reduce((n, p) => n + p.marks, 0),
  timeAllowanceSec: timeFor(o.parts.reduce((n, p) => n + p.marks, 0)),
  skeleton: o.parts.map((p) => `(${p.id})${o.verbs[p.id]}${p.marks}`).join("|"),
  ...(o.methodLock ? { methodLock: o.methodLock } : {}),
  examinerSources: o.examinerSources,
  solutionProgram: o.solutionProgram,
  verification: `ver.${o.id}`,
  version: 1,
});

const factored = (latex, vars) => ({
  kind: "algebraic",
  latex,
  equivalence: "equivalent",
  variables: vars,
  mustBeFactorised: true,
});

const CE = {
  stopAtCommon: (latex, marks) => ({
    misconception: "maths.factorising.common-factor-then-stop",
    pattern: { kind: "algebraic", latex },
    feedback:
      "The common factor is out and that is the first mark. Factorise fully means keep going until nothing inside the bracket factorises; here a difference of two squares is still waiting.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2025-november:M4:Q22",
  }),
  splitIgnoresA: (latex, marks) => ({
    misconception: "maths.factorising.middle-term-split-ignores-a",
    pattern: { kind: "algebraic", latex },
    feedback:
      "The pair was chosen to multiply to the constant term instead of to ac. With a number in front of x², multiply a by c first, then look for that product with the sum b.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-summer:M4:Q18",
  }),
  signs: (latex, marks) => ({
    misconception: "maths.factorising.sign-errors-in-brackets",
    pattern: { kind: "algebraic", latex },
    feedback:
      "The two constants are the right size but the signs do not give the middle term. Expand the middle of your answer and compare it with the question before you move on.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-summer:M4:Q12b",
  }),
};

const questions = [
  question({
    id: qid(1),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $2x^2 + 7x + 3$.",
        marks: 2,
        answer: factored("(2x+1)(x+3)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = 6 with the pair 6 and 1, or 2x² + 6x + x + 3 seen" },
          { id: "A1", code: "A", marks: 1, for: "(2x + 1)(x + 3) oe", dependsOn: ["MA1"] },
        ],
        hints: ["ac = 2 × 3 = 6, and the pair adds to 7.", "6 and 1.", "Split the middle term and group."],
        workedSolution: "$ac = 6$, pair $6$ and $1$: $2x^2 + 6x + x + 3 = 2x(x + 3) + 1(x + 3) = (2x + 1)(x + 3)$.",
        commonErrors: [CE.splitIgnoresA("(2x+3)(x+1)", 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q12b"],
    solutionProgram: "ac = 6; pair 6,1; 2x^2 + 6x + x + 3 = (2x+1)(x+3); expanded coefficients 2, 7, 3 verified in the generator",
  }),
  question({
    id: qid(2),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $3x^2 + 10x + 8$.",
        marks: 2,
        answer: factored("(3x+4)(x+2)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = 24 with the pair 6 and 4, or 3x² + 6x + 4x + 8 seen" },
          { id: "A1", code: "A", marks: 1, for: "(3x + 4)(x + 2) oe", dependsOn: ["MA1"] },
        ],
        hints: ["ac = 3 × 8 = 24, and the pair adds to 10.", "6 and 4."],
        workedSolution: "$ac = 24$, pair $6$ and $4$: $3x^2 + 6x + 4x + 8 = 3x(x + 2) + 4(x + 2) = (3x + 4)(x + 2)$.",
        commonErrors: [CE.splitIgnoresA("(3x+8)(x+1)", 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q12b"],
    solutionProgram: "ac = 24; pair 6,4; (3x+4)(x+2); coefficients 3, 10, 8 verified",
  }),
  question({
    id: qid(3),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise", "negative middle term"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $5x^2 - 13x + 6$.",
        marks: 2,
        answer: factored("(5x-3)(x-2)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = 30 with the pair −10 and −3, or 5x² − 10x − 3x + 6 seen" },
          { id: "A1", code: "A", marks: 1, for: "(5x − 3)(x − 2) oe", dependsOn: ["MA1"] },
        ],
        hints: ["ac = 30 and the sum is −13.", "Both numbers are negative, because the product is positive and the sum negative.", "−10 and −3."],
        workedSolution: "$ac = 30$, pair $-10$ and $-3$: $5x^2 - 10x - 3x + 6 = 5x(x - 2) - 3(x - 2) = (5x - 3)(x - 2)$.",
        commonErrors: [CE.signs("(5x+3)(x+2)", 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q12b"],
    solutionProgram: "ac = 30; pair -10,-3; (5x-3)(x-2); coefficients 5, -13, 6 verified",
  }),
  question({
    id: qid(4),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $4x^2 - 4x - 15$.",
        marks: 2,
        answer: factored("(2x+3)(2x-5)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = −60 with the pair −10 and 6, or 4x² − 10x + 6x − 15 seen" },
          { id: "A1", code: "A", marks: 1, for: "(2x + 3)(2x − 5) oe", dependsOn: ["MA1"] },
        ],
        hints: ["ac = −60, sum −4.", "−10 and 6.", "Group: 2x(2x − 5) + 3(2x − 5)."],
        workedSolution: "$ac = -60$, pair $-10$ and $6$: $4x^2 - 10x + 6x - 15 = 2x(2x - 5) + 3(2x - 5) = (2x + 3)(2x - 5)$.",
        commonErrors: [CE.signs("(2x-3)(2x+5)", 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q12b"],
    solutionProgram: "ac = -60; pair -10,6; (2x+3)(2x-5); coefficients 4, -4, -15 verified",
  }),
  question({
    id: qid(5),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise", "grouping"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    figures: [
      svgFigure(
        GRID_FIG,
        "A two by two grid area model. The columns are headed 2x and plus 5, the rows are headed 3x and minus 2, and the four cells contain 6x squared, plus 15x, minus 4x and minus 10.",
      ),
    ],
    parts: [
      part({
        stem: "The grid shows how $6x^2 + 11x - 10$ is split before grouping. Use the same method to factorise $6x^2 - 19x + 10$.",
        marks: 2,
        answer: factored("(3x-2)(2x-5)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = 60 with the pair −15 and −4, or 6x² − 15x − 4x + 10 seen" },
          { id: "A1", code: "A", marks: 1, for: "(3x − 2)(2x − 5) oe", dependsOn: ["MA1"] },
        ],
        hints: ["ac = 6 × 10 = 60 and the sum is −19.", "Both numbers are negative: −15 and −4.", "Group in pairs as the grid shows."],
        workedSolution: "$ac = 60$, pair $-15$ and $-4$: $6x^2 - 15x - 4x + 10 = 3x(2x - 5) - 2(2x - 5) = (3x - 2)(2x - 5)$.",
        commonErrors: [CE.splitIgnoresA("(6x-5)(x-2)", 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: "ac = 60; pair -15,-4; (3x-2)(2x-5); coefficients 6, -19, 10 verified",
  }),
  question({
    id: qid(6),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $8x^2 + 2x - 15$.",
        marks: 2,
        answer: factored("(4x-5)(2x+3)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = −120 with the pair 12 and −10, or 8x² + 12x − 10x − 15 seen" },
          { id: "A1", code: "A", marks: 1, for: "(4x − 5)(2x + 3) oe", dependsOn: ["MA1"] },
        ],
        hints: ["ac = −120, sum 2.", "12 and −10.", "8x² + 12x − 10x − 15."],
        workedSolution: "$ac = -120$, pair $12$ and $-10$: $8x^2 + 12x - 10x - 15 = 4x(2x + 3) - 5(2x + 3) = (4x - 5)(2x + 3)$.",
        commonErrors: [CE.splitIgnoresA("(8x-5)(x+3)", 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: "ac = -120; pair 12,-10; (4x-5)(2x+3); coefficients 8, 2, -15 verified",
  }),
  question({
    id: qid(7),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise fully", "difference of two squares"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise fully $2x^2 - 50$.",
        marks: 2,
        answer: factored("2(x+5)(x-5)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "2(x² − 25)" },
          { id: "A1", code: "A", marks: 1, for: "2(x + 5)(x − 5)", dependsOn: ["MA1"] },
        ],
        hints: ["Common factor first.", "x² − 25 is a difference of two squares."],
        workedSolution: "$2x^2 - 50 = 2(x^2 - 25) = 2(x + 5)(x - 5)$.",
        commonErrors: [CE.stopAtCommon("2(x^2-25)", 1)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22"],
    solutionProgram: "2(x^2 - 25) = 2(x+5)(x-5); coefficients 2, 0, -50 verified",
  }),
  question({
    id: qid(8),
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Factorise"],
    emphasis: ["difference of two squares", "fraction"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $\\dfrac{1}{4}x^2 - 81$.",
        marks: 2,
        answer: factored("\\left(\\frac{1}{2}x+9\\right)\\left(\\frac{1}{2}x-9\\right)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "(1/2)x and 9 identified as the square roots" },
          { id: "A1", code: "A", marks: 1, for: "((1/2)x + 9)((1/2)x − 9) oe, e.g. (x/2 + 9)(x/2 − 9)", dependsOn: ["MA1"] },
        ],
        hints: ["Is each term a perfect square?", "√(1/4) = 1/2 and √81 = 9.", "Then use a² − b² = (a + b)(a − b)."],
        workedSolution: "$\\tfrac{1}{4}x^2 = \\left(\\tfrac{1}{2}x\\right)^2$ and $81 = 9^2$, so $\\tfrac{1}{4}x^2 - 81 = \\left(\\tfrac{1}{2}x + 9\\right)\\left(\\tfrac{1}{2}x - 9\\right)$.",
        commonErrors: [
          {
            misconception: "maths.factorising.dots-fractional-coefficient",
            pattern: { kind: "algebraic", latex: "\\frac{1}{4}(x+9)(x-9)" },
            feedback:
              "Expanding this gives a constant term of −81/4, not −81. The 1/4 belongs inside the brackets as part of the square root: √(1/4) = 1/2. Summer 2023 M4 Q19: most candidates scored zero on the fractional case.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M4:Q19",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q19"],
    solutionProgram: "sqrt(1/4) = 1/2, sqrt(81) = 9; (x/2 + 9)(x/2 - 9); coefficients 1/4, 0, -81 verified",
  }),
  question({
    id: qid(9),
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Factorise"],
    emphasis: ["factorise fully", "two letters"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise fully $8m^2n - 18n^3$.",
        marks: 3,
        answer: factored("2n(2m+3n)(2m-3n)", ["m", "n"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "2n(4m² − 9n²)" },
          { id: "MA2", code: "MA", marks: 1, for: "4m² and 9n² recognised as (2m)² and (3n)²", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "2n(2m + 3n)(2m − 3n)", dependsOn: ["MA2"] },
        ],
        hints: ["The common factor includes a letter: both terms contain n.", "8 and 18 share a factor of 2.", "4m² − 9n² is a difference of two squares."],
        workedSolution: "$8m^2n - 18n^3 = 2n(4m^2 - 9n^2) = 2n(2m + 3n)(2m - 3n)$.",
        commonErrors: [
          CE.stopAtCommon("2n(4m^2-9n^2)", 1),
          {
            misconception: "maths.factorising.not-fully-factorised",
            pattern: { kind: "algebraic", latex: "2(4m^2n-9n^3)" },
            feedback: "Only the number was taken out. Both terms also contain n, so the common factor is 2n.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M4:Q19",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q19", "ccea-cer:maths:2025-november:M4:Q22"],
    solutionProgram: "2n(4m^2 - 9n^2) = 2n(2m+3n)(2m-3n); inner coefficients 8, 0, -18 verified after the 2 is factored",
  }),
  question({
    id: qid(10),
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Factorise"],
    emphasis: ["factorise fully", "two letters"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise fully $20a^3 - 45ab^2$.",
        marks: 3,
        answer: factored("5a(2a+3b)(2a-3b)", ["a", "b"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "5a(4a² − 9b²)" },
          { id: "MA2", code: "MA", marks: 1, for: "(2a)² and (3b)² recognised", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "5a(2a + 3b)(2a − 3b)", dependsOn: ["MA2"] },
        ],
        hints: ["20 and 45 share 5; both terms contain a.", "That leaves 4a² − 9b².", "Both are perfect squares."],
        workedSolution: "$20a^3 - 45ab^2 = 5a(4a^2 - 9b^2) = 5a(2a + 3b)(2a - 3b)$.",
        commonErrors: [CE.stopAtCommon("5a(4a^2-9b^2)", 1)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22"],
    solutionProgram: "5a(4a^2 - 9b^2) = 5a(2a+3b)(2a-3b); inner coefficients 20, 0, -45 verified after the 5 is factored",
  }),
  question({
    id: qid(11),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["factorise", "two variables"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $x^2 + 2xy - 15y^2$.",
        marks: 2,
        answer: factored("(x+5y)(x-3y)", ["x", "y"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "pair 5 and −3 identified (product −15, sum 2)" },
          { id: "A1", code: "A", marks: 1, for: "(x + 5y)(x − 3y)", dependsOn: ["MA1"] },
        ],
        hints: ["Treat it as x² + 2x − 15 and put a y with each constant.", "5 and −3.", "Check the middle: 5xy − 3xy = 2xy."],
        workedSolution: "$x^2 + 2xy - 15y^2 = (x + 5y)(x - 3y)$, since $5xy - 3xy = 2xy$ and $5y \\times -3y = -15y^2$.",
        commonErrors: [
          {
            misconception: "maths.factorising.wrong-variable-letter",
            pattern: { kind: "algebraic", latex: "(x+5)(x-3)" },
            feedback:
              "The y has been dropped from both brackets. Expanding gives x² + 2x − 15, with no y² term at all. Every constant needs its y.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2023-summer:M4:Q19",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q19"],
    solutionProgram: "(x+5y)(x-3y); coefficients x2 = 1, xy = 2, y2 = -15 verified",
  }),
  question({
    id: qid(12),
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Factorise"],
    emphasis: ["factorise", "two variables", "grouping"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    figures: [
      svgFigure(
        GRID2_FIG,
        "A two by two grid area model for two x squared minus seven x y plus six y squared. The columns are headed 2x and minus 3y, the rows are headed x and minus 2y, and the cells contain 2x squared, minus 3xy, minus 4xy and plus 6y squared.",
      ),
    ],
    parts: [
      part({
        stem: "Factorise $2x^2 - 7xy + 6y^2$.",
        marks: 3,
        answer: factored("(x-2y)(2x-3y)", ["x", "y"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = 12 with the pair −3 and −4" },
          { id: "MA2", code: "MA", marks: 1, for: "2x² − 3xy − 4xy + 6y², grouped as x(2x − 3y) − 2y(2x − 3y)", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "(x − 2y)(2x − 3y)", dependsOn: ["MA2"] },
        ],
        hints: ["ac = 2 × 6 = 12 and the sum is −7.", "−3 and −4.", "The common factor of the second pair is −2y, not −2."],
        workedSolution:
          "$ac = 12$, pair $-3$ and $-4$: $2x^2 - 3xy - 4xy + 6y^2 = x(2x - 3y) - 2y(2x - 3y) = (x - 2y)(2x - 3y)$.",
        commonErrors: [
          {
            misconception: "maths.factorising.wrong-variable-letter",
            pattern: { kind: "algebraic", latex: "(x-2)(2x-3y)" },
            feedback:
              "The second common factor was taken as −2 rather than −2y. Look at −4xy + 6y²: both terms contain y, so the y comes out with the 2.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2023-summer:M4:Q19",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q19", "ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: "ac = 12; pair -3,-4; (x-2y)(2x-3y); coefficients x2 = 2, xy = -7, y2 = 6 verified",
  }),
  question({
    id: qid(13),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["grouping", "four terms"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $6mn + 9m - 4n - 6$.",
        marks: 2,
        answer: factored("(3m-2)(2n+3)", ["m", "n"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "3m(2n + 3) − 2(2n + 3) seen" },
          { id: "A1", code: "A", marks: 1, for: "(3m − 2)(2n + 3)", dependsOn: ["MA1"] },
        ],
        hints: ["Group the first two terms and the last two.", "Take 3m out of the first pair.", "Take −2 out of the second pair so the brackets match."],
        workedSolution: "$6mn + 9m - 4n - 6 = 3m(2n + 3) - 2(2n + 3) = (3m - 2)(2n + 3)$.",
        commonErrors: [
          {
            misconception: "maths.algebra.expression-left-factorised",
            pattern: { kind: "algebraic", latex: "3m(2n+3)+2(-2n-3)" },
            feedback:
              "This line is correct but the brackets do not match, so nothing can come out. Take −2 from the last pair instead of +2 and the second bracket becomes (2n + 3).",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-summer:M4:Q20",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: "3m(2n+3) - 2(2n+3) = (3m-2)(2n+3); expanded xy = 6, x = 9, y = -4, k = -6 verified",
  }),
  question({
    id: qid(14),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Factorise"],
    emphasis: ["grouping", "four terms"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise $10cd - 15c + 4d - 6$.",
        marks: 2,
        answer: factored("(5c+2)(2d-3)", ["c", "d"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "5c(2d − 3) + 2(2d − 3) seen" },
          { id: "A1", code: "A", marks: 1, for: "(5c + 2)(2d − 3)", dependsOn: ["MA1"] },
        ],
        hints: ["Group the first two terms and the last two.", "5c comes out of the first pair.", "The second bracket must match the first."],
        workedSolution: "$10cd - 15c + 4d - 6 = 5c(2d - 3) + 2(2d - 3) = (5c + 2)(2d - 3)$.",
        commonErrors: [CE.signs("(5c-2)(2d-3)", 1)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: "5c(2d-3) + 2(2d-3) = (5c+2)(2d-3); expanded xy = 10, x = -15, y = 4, k = -6 verified",
  }),

  // ---- exam-style ----
  question({
    id: qid(15),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Factorise"],
    emphasis: ["factorise fully", "three letters"],
    setting: "Pure algebra, no context",
    verbs: { main: "factorise" },
    parts: [
      part({
        stem: "Factorise fully $7ax^2 - 63ay^2$.",
        marks: 3,
        answer: factored("7a(x+3y)(x-3y)", ["a", "x", "y"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "7a(x² − 9y²)" },
          { id: "MA2", code: "MA", marks: 2, for: "7a(x + 3y)(x − 3y)", dependsOn: ["MA1"] },
        ],
        hints: [
          "7 and 63 share a factor, and both terms contain a.",
          "That leaves x² − 9y².",
          "Fully means the bracket must be factorised too.",
        ],
        workedSolution: "$7ax^2 - 63ay^2 = 7a(x^2 - 9y^2) = 7a(x + 3y)(x - 3y)$.",
        commonErrors: [
          CE.stopAtCommon("7a(x^2-9y^2)", 1),
          {
            misconception: "maths.factorising.not-fully-factorised",
            pattern: { kind: "algebraic", latex: "7(ax^2-9ay^2)" },
            feedback: "The a was left inside. The highest common factor is 7a, numbers and letters together.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M4:Q19",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22", "ccea-cer:maths:2023-summer:M4:Q19"],
    solutionProgram: "7a(x^2 - 9y^2) = 7a(x+3y)(x-3y); inner coefficients 7, -63 verified with the a carried through",
  }),
  question({
    id: qid(16),
    style: "exam-style",
    difficulty: 5,
    ao: ["AO1", "AO2"],
    commandWords: ["Factorise", "Hence", "Simplify"],
    emphasis: ["factorise", "Hence", "simplify"],
    setting: "Pure algebra, no context",
    verbs: { a: "factorise", b: "simplify" },
    parts: [
      part({
        id: "a",
        stem: "Factorise $6x^2 + x - 12$.",
        marks: 3,
        answer: factored("(3x-4)(2x+3)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = −72 with the pair 9 and −8" },
          { id: "MA2", code: "MA", marks: 1, for: "6x² + 9x − 8x − 12 grouped as 3x(2x + 3) − 4(2x + 3)", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "(3x − 4)(2x + 3)", dependsOn: ["MA2"] },
        ],
        hints: ["ac = 6 × (−12) = −72 and the sum is 1.", "9 and −8.", "Group, choosing the sign so the brackets match."],
        workedSolution: "$ac = -72$, pair $9$ and $-8$: $6x^2 + 9x - 8x - 12 = 3x(2x + 3) - 4(2x + 3) = (3x - 4)(2x + 3)$.",
        commonErrors: [CE.splitIgnoresA("(6x-4)(x+3)", 0), CE.signs("(3x+4)(2x-3)", 1)],
      }),
      part({
        id: "b",
        stem: "Hence simplify $\\dfrac{6x^2 + x - 12}{4x^2 - 9}$.",
        marks: 3,
        answer: {
          kind: "algebraic",
          latex: "\\frac{3x-4}{2x-3}",
          equivalence: "equivalent",
          variables: ["x"],
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "4x² − 9 = (2x + 3)(2x − 3)" },
          { id: "MA2", code: "MA", marks: 1, for: "both top and bottom written as products, with (2x + 3) common", dependsOn: ["MA1"], ft: true },
          { id: "A1", code: "A", marks: 1, for: "(3x − 4) over (2x − 3)", dependsOn: ["MA2"] },
        ],
        hints: [
          "Hence means use your answer to part (a).",
          "The bottom is a difference of two squares.",
          "Cancel the bracket that appears on both top and bottom.",
        ],
        workedSolution:
          "$\\dfrac{6x^2 + x - 12}{4x^2 - 9} = \\dfrac{(3x - 4)(2x + 3)}{(2x + 3)(2x - 3)} = \\dfrac{3x - 4}{2x - 3}$, cancelling the whole bracket $(2x + 3)$.",
        commonErrors: [
          {
            misconception: "maths.alg-fractions.cancel-terms-not-factors",
            pattern: { kind: "algebraic", latex: "\\frac{x-12}{-9}" },
            feedback:
              "Single terms have been crossed out across the fraction. Only whole brackets cancel, and only once both top and bottom are written as products.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M4:Q22",
          },
          {
            misconception: "maths.factorising.common-factor-then-stop",
            pattern: { kind: "algebraic", latex: "\\frac{(3x-4)(2x+3)}{(2x+3)(2x-3)}" },
            feedback:
              "Both factorisations are right and earn two marks. The last mark is for cancelling (2x + 3) and writing the single simplified fraction.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2025-november:M4:Q22",
          },
        ],
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
    ],
    methodLock: {
      instruction: "Hence simplify",
      requiredMethod: "The factorisation from part (a), with the denominator factorised as a difference of two squares; cancelling terms earns nothing",
      evidence: "ccea-cer:maths:2025-november:M4:Q22",
    },
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22", "ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram:
      "(a) ac = -72; pair 9,-8; (3x-4)(2x+3) with coefficients 6, 1, -12 verified. (b) 4x^2 - 9 = (2x+3)(2x-3) verified; cancel (2x+3) to give (3x-4)/(2x-3); checked at x = 2, -1 and 4",
  }),
  question({
    id: qid(17),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO2", "AO3"],
    commandWords: ["Factorise", "Find"],
    emphasis: ["factorise", "perimeter", "diagram"],
    setting: "A rectangle whose area is given as a quadratic and one of whose sides is given",
    verbs: { a: "factorise", b: "find" },
    figures: [
      svgFigure(
        RECT_FIG,
        "A rectangle with the area written inside it as 3x squared minus 14x minus 5 square centimetres, and the left-hand side labelled x minus 5 centimetres.",
      ),
    ],
    parts: [
      part({
        id: "a",
        stem: "Factorise $3x^2 - 14x - 5$.",
        marks: 2,
        answer: factored("(3x+1)(x-5)", ["x"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "ac = −15 with the pair −15 and 1, or 3x² − 15x + x − 5 seen" },
          { id: "A1", code: "A", marks: 1, for: "(3x + 1)(x − 5)", dependsOn: ["MA1"] },
        ],
        hints: ["ac = 3 × (−5) = −15 and the sum is −14.", "−15 and 1.", "3x(x − 5) + 1(x − 5)."],
        workedSolution: "$ac = -15$, pair $-15$ and $1$: $3x^2 - 15x + x - 5 = 3x(x - 5) + 1(x - 5) = (3x + 1)(x - 5)$.",
        commonErrors: [CE.splitIgnoresA("(3x-5)(x+1)", 0)],
      }),
      part({
        id: "b",
        stem: "The rectangle has area $(3x^2 - 14x - 5)$ cm² and one side of length $(x - 5)$ cm. Find an expression, in its simplest form, for the perimeter of the rectangle.",
        marks: 3,
        answer: {
          kind: "algebraic",
          latex: "8x-8",
          equivalence: "equivalent",
          variables: ["x"],
          mustBeExpanded: true,
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "other side = 3x + 1, from the factorisation in part (a)", ft: true },
          { id: "MA2", code: "MA", marks: 1, for: "perimeter = 2(3x + 1) + 2(x − 5), or 2[(3x + 1) + (x − 5)]", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "8x − 8 (accept 8(x − 1))", dependsOn: ["MA2"] },
        ],
        hints: [
          "Area = length × width, so the other side is the second bracket.",
          "Perimeter adds all four sides.",
          "Expand and collect: 6x + 2 + 2x − 10.",
        ],
        workedSolution:
          "The area factorises as $(3x + 1)(x - 5)$, so the other side is $(3x + 1)$ cm. Perimeter $= 2(3x + 1) + 2(x - 5) = 6x + 2 + 2x - 10 = 8x - 8$ cm.",
        commonErrors: [
          {
            misconception: "maths.algebra.expression-left-factorised",
            pattern: { kind: "algebraic", latex: "(3x+1)(x-5)" },
            feedback:
              "That is the area again, not the perimeter. The factorisation tells you the second side; the perimeter is twice the sum of the two sides.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2024-summer:M4:Q12b",
          },
          {
            misconception: "maths.algebra.bracket-expansion-sign",
            pattern: { kind: "algebraic", latex: "8x+12" },
            feedback:
              "The −5 lost its sign when the bracket was doubled: $2(x - 5) = 2x - 10$, not $2x + 10$. Two method marks stand.",
            marksTypicallyEarned: 2,
          },
        ],
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q12b", "ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram:
      "(a) ac = -15; pair -15,1; (3x+1)(x-5), coefficients 3, -14, -5 verified. (b) other side 3x+1; perimeter 2(3x+1) + 2(x-5) = 8x - 8, checked at x = 6 (area 3(36) - 84 - 5 = 19 = 19 x 1, sides 19 and 1, perimeter 40 = 8(6) - 8)",
  }),
  question({
    id: qid(18),
    style: "exam-style",
    difficulty: 5,
    ao: ["AO1", "AO2"],
    commandWords: ["Factorise"],
    emphasis: ["factorise fully", "perfect square", "three letters"],
    setting: "Pure algebra, no context",
    verbs: { a: "factorise", b: "factorise" },
    parts: [
      part({
        id: "a",
        stem: "Factorise fully $4ap^2 - 20apq + 25aq^2$.",
        marks: 3,
        answer: factored("a(2p-5q)^2", ["a", "p", "q"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "a(4p² − 20pq + 25q²)" },
          { id: "MA2", code: "MA", marks: 1, for: "ac = 100 with the pair −10 and −10, or (2p − 5q)(2p − 5q) seen", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "a(2p − 5q)² (accept a(2p − 5q)(2p − 5q))", dependsOn: ["MA2"] },
        ],
        hints: ["Every term has an a.", "Inside, ac = 4 × 25 = 100 and the sum is −20.", "The pair is −10 and −10, so the two brackets are the same."],
        workedSolution:
          "$4ap^2 - 20apq + 25aq^2 = a(4p^2 - 20pq + 25q^2)$. Inside, $ac = 100$ and the pair is $-10$ and $-10$: $4p^2 - 10pq - 10pq + 25q^2 = 2p(2p - 5q) - 5q(2p - 5q) = (2p - 5q)^2$. So the answer is $a(2p - 5q)^2$.",
        commonErrors: [
          {
            misconception: "maths.factorising.dots-term-order",
            pattern: { kind: "algebraic", latex: "a(2p+5q)(2p-5q)" },
            feedback:
              "That is a difference of two squares, which has no middle term; expanding it gives 4p² − 25q². This expression has −20pq, so both brackets carry the minus.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2023-summer:M4:Q19",
          },
          {
            misconception: "maths.factorising.not-fully-factorised",
            pattern: { kind: "algebraic", latex: "(2p-5q)^2" },
            feedback: "The a has been lost. It is a factor of all three terms and belongs in the answer.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2025-november:M4:Q22",
          },
        ],
      }),
      part({
        id: "b",
        stem: "Factorise fully $2x^3y - 32xy^3$.",
        marks: 3,
        answer: factored("2xy(x+4y)(x-4y)", ["x", "y"]),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "2xy(x² − 16y²)" },
          { id: "MA2", code: "MA", marks: 1, for: "x² and 16y² recognised as x² and (4y)²", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "2xy(x + 4y)(x − 4y)", dependsOn: ["MA2"] },
        ],
        hints: ["The common factor contains both letters.", "2, x and y are in both terms.", "x² − 16y² is a difference of two squares."],
        workedSolution: "$2x^3y - 32xy^3 = 2xy(x^2 - 16y^2) = 2xy(x + 4y)(x - 4y)$.",
        commonErrors: [
          CE.stopAtCommon("2xy(x^2-16y^2)", 1),
          {
            misconception: "maths.factorising.not-fully-factorised",
            pattern: { kind: "algebraic", latex: "2x(x^2y-16y^3)" },
            feedback: "Only part of the common factor came out; y is in both terms too, so the factor is 2xy.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M4:Q22",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q19", "ccea-cer:maths:2025-november:M4:Q22", "ccea-cer:maths:2024-summer:M4:Q18"],
    solutionProgram:
      "(a) a(4p^2 - 20pq + 25q^2) = a(2p - 5q)^2, coefficients x2 = 4, xy = -20, y2 = 25 verified. (b) 2xy(x^2 - 16y^2) = 2xy(x+4y)(x-4y), inner coefficients 1 and -16 verified",
  }),
];

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

const findTheMistake = [
  {
    id: `ftm.${TID}.01`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    stem: "Aoibhinn was asked to factorise fully $3ax^2 - 75ay^2$. Her working:",
    studentWorking: ["Common factor 3a", "3a(x² − 25y²)", "Answer: 3a(x² − 25y²)"],
    mistakeLine: 3,
    misconception: "maths.factorising.common-factor-then-stop",
    whatWentWrong:
      "The common factor is exactly right, including the $a$. What is left inside the bracket, $x^2 - 25y^2$, is a difference of two squares, and the word **fully** means it has to be factorised too.",
    correction: ["3a(x² − 25y²)", "x² = (x)² and 25y² = (5y)²", "3a(x + 5y)(x − 5y)"],
    marksEarnedAsWritten: ["MA1"],
    feedback:
      "One of the three marks is safe: taking out 3a, letters included, is the step many candidates miss altogether. The habit that collects the other two is to look at every bracket you write and ask whether it is still factorisable. November 2025 M4 Q22: most took 3a out, and only the top candidates saw the difference of two squares left behind.",
    source: "ccea-cer:maths:2025-november:M4:Q22",
  },
  {
    id: `ftm.${TID}.02`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    stem: "Conor was asked to factorise $6x^2 - 5x - 6$. His working:",
    studentWorking: [
      "Need two numbers with product −6 and sum −5",
      "−6 and 1",
      "6x² − 6x + x − 6",
      "6x(x − 1) + 1(x − 6)",
      "Stuck",
    ],
    mistakeLine: 1,
    misconception: "maths.factorising.middle-term-split-ignores-a",
    whatWentWrong:
      "The pair was chosen to multiply to $c$, which is the rule only when the coefficient of $x^2$ is 1. Here $a = 6$, so the product needed is $ac = 6 \\times (-6) = -36$, with sum $-5$: that is $4$ and $-9$.",
    correction: [
      "ac = 6 × (−6) = −36, sum −5",
      "4 and −9",
      "6x² + 4x − 9x − 6",
      "2x(3x + 2) − 3(3x + 2)",
      "(2x − 3)(3x + 2)",
    ],
    marksEarnedAsWritten: [],
    feedback:
      "Notice that the grouping in line 4 was attempted properly — the method is sound, it was fed the wrong pair. Write $ac$ on the page before you hunt for numbers; the moment the two brackets fail to match, that is the signal the pair came from $c$ rather than $ac$. Summer 2024 M4 Q12(b): wrong factorising produced answers of 40 and 6 that could never have solved the equation.",
    source: "ccea-cer:maths:2024-summer:M4:Q12b",
  },
  {
    id: `ftm.${TID}.03`,
    topic: TID,
    specRefs: ["M4-NA-02"],
    stem: "Sorcha was asked to factorise $\\dfrac{4}{25}x^2 - 9$. Her working:",
    studentWorking: ["4/25 is not a square number", "So this is not a difference of two squares", "Answer: does not factorise"],
    mistakeLine: 1,
    misconception: "maths.factorising.dots-fractional-coefficient",
    whatWentWrong:
      "A fraction can be a perfect square: square-root the numerator and the denominator separately. $\\sqrt{4} = 2$ and $\\sqrt{25} = 5$, so $\\tfrac{4}{25}x^2 = \\left(\\tfrac{2}{5}x\\right)^2$, and $9 = 3^2$.",
    correction: [
      "4/25 x² = (2/5 x)² and 9 = 3²",
      "a² − b² = (a + b)(a − b) with a = 2x/5 and b = 3",
      "(2x/5 + 3)(2x/5 − 3)",
    ],
    marksEarnedAsWritten: [],
    feedback:
      "Nothing here is careless — it is a gap, and it is a common one: Summer 2023 M4 Q19 reported that most candidates scored zero on the fractional case. Add one line to your checklist: before deciding a difference will not factorise, take the square root of each term, fractions included, top and bottom separately.",
    source: "ccea-cer:maths:2023-summer:M4:Q19",
  },
];

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.${TID}.${String(n).padStart(2, "0")}`,
  topic: TID,
  specRefs: ["M4-NA-02"],
  kind,
  prompt,
  answer,
  keyWords,
  examUnit: "M4",
  difficultyPrior,
});

const prompts = [
  rp(1, "procedure", "The four steps for factorising $ax^2 + bx + c$.", "1 Take out any common factor. 2 Work out $ac$ and find a pair with product $ac$ and sum $b$. 3 Split the middle term with that pair. 4 Group in twos and take out the matching bracket.", ["common factor", "ac", "split", "group"], 5),
  rp(2, "trap", "Why is $ac$, and not $c$, the product you need?", "Because in $(px + m)(qx + n)$ the $x^2$ coefficient is $pq$ and the constant is $mn$, so the pair splitting the middle term multiplies to $pq \\times mn = ac$. Using $c$ alone works only when $a = 1$.", ["ac", "a = 1 only"], 7),
  rp(3, "formula", "The difference of two squares.", "$a^2 - b^2 = (a + b)(a - b)$, where $a$ and $b$ can be fractions, products of letters, or anything else that squares.", ["a² − b²", "any a and b"], 4),
  rp(4, "trap", "What does the word **fully** add to 'factorise'?", "Keep going until nothing inside any bracket factorises. Most often it means the difference of two squares that is left after a common factor comes out.", ["keep going", "difference of two squares"], 6),
  rp(5, "trap", "Factorise $\\dfrac{9}{16}x^2 - 49$.", "$\\left(\\tfrac{3}{4}x + 7\\right)\\left(\\tfrac{3}{4}x - 7\\right)$. Square-root the top and the bottom separately: $\\sqrt{9/16} = 3/4$.", ["3/4 x", "fraction can be a square"], 8),
  rp(6, "procedure", "When you group four terms, how do you choose the sign of the second common factor?", "Choose it so the second bracket comes out identical to the first. If $+2$ gives $2(-2x - 5)$, take out $-2$ instead to get $-2(2x + 5)$.", ["brackets must match", "negative factor"], 6),
  rp(7, "trap", "Factorise $x^2 + 2xy - 15y^2$. What is easy to lose?", "$(x + 5y)(x - 3y)$. The $y$ in each bracket: without it the $y^2$ term cannot appear when the brackets are expanded.", ["keep the y", "(x + 5y)(x − 3y)"], 6),
  rp(8, "trap", "$4x^2y^2$ is the square of what?", "$(2xy)^2$. A whole product of letters and numbers can be the $a$ in $a^2 - b^2$.", ["(2xy)²"], 6),
  rp(9, "procedure", "How do you check a factorisation in ten seconds?", "Expand the middle term only: multiply the outside pair and the inside pair and add. If that does not give $b$, the pair or the signs are out.", ["expand the middle", "compare with b"], 4),
  rp(10, "qa", "What is the highest common factor of $20a^3$ and $45ab^2$?", "$5a$. Take the numbers and the letters together: 5 divides both, and $a$ is in both.", ["5a", "numbers and letters"], 5),
  rp(11, "trap", "When a question says **hence simplify** a fraction, what must you do first?", "Use the factorisation you have just found, factorise the other part of the fraction as well, and then cancel a whole bracket. Cancelling single terms across the fraction earns nothing.", ["use part (a)", "whole brackets"], 7),
  rp(12, "novel-example", "Factorise $6x^2 + x - 12$.", "$ac = -72$, pair $9$ and $-8$: $6x^2 + 9x - 8x - 12 = 3x(2x + 3) - 4(2x + 3) = (3x - 4)(2x + 3)$.", ["−72", "(3x − 4)(2x + 3)"], 7),
];

const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", "maths", "insights", `m4.${SLUG}.json`), "utf8"));

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

const HOW_EXAMINED =
  "M4 (calculator, 2 hours, 100 marks). Two appearances. A short Factorise part early on, 2 to 3 marks, often as (a)(i) and (a)(ii) of a question whose later part solves an equation (Summer 2025 Q10, Summer 2026 Q14). Then a 3-mark Factorise fully in the last third, with a common factor containing a letter followed by a difference of two squares (Summer 2023 Q19, Summer 2024 Q18(a), November 2025 Q22(a), Summer 2026 Q17), sometimes followed by a Hence simplify part worth another 3. Schemes read MA1 for the common factor and MA2 for the completed factorisation, or MA1 for the split and A1 for the brackets.";

const bundle = {
  $schema: "../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: TID,
    slug: SLUG,
    title: "Factorising ax² + bx + c and more complex expressions (grouping, two variables)",
    subject: "maths",
    unit: "M4",
    tier: "H",
    strand: "NA",
    statementIds: ["M4-NA-02"],
    prerequisites: ["maths.m3.factorising-quadratics-x2-plus-bx-plus-c", "maths.m3.difference-of-two-squares"],
    order: 128,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: [
      "ccea-cer:maths:2023-summer:M4:Q19",
      "ccea-cer:maths:2024-summer:M4:Q18",
      "ccea-cer:maths:2024-summer:M4:Q12b",
      "ccea-cer:maths:2025-summer:M4:Q20",
      "ccea-cer:maths:2025-november:M4:Q22",
    ],
    examWeightHint:
      "A 2- to 3-mark Factorise early (Summer 2025 Q10, Summer 2026 Q14) and a 3-mark Factorise fully in the last third (Summer 2023 Q19, Summer 2024 Q18(a), November 2025 Q22(a), Summer 2026 Q17), the latter often carrying a 3-mark Hence simplify. The same skill also decides the simplify-an-algebraic-fraction questions in M4 and M8.",
    mustMemorise: [
      "Common factor first, numbers and letters together",
      "For ax² + bx + c, find a pair with product ac and sum b; split the middle term and group",
      "Choose the sign of the second common factor so the two brackets match",
      "a² − b² = (a + b)(a − b), with a and b allowed to be fractions or products of letters",
      "Factorise fully means keep going until no bracket factorises: usually a difference of two squares after the common factor",
      "In two variables, every constant carries its second letter: (x + 5y)(x − 3y), not (x + 5)(x − 3)",
      "4x²y² is (2xy)², and 9/16 x² is (3x/4)²",
      "Check by expanding the middle term only",
    ],
    onFormulaSheet: [],
    notOnThisSpec: [
      "Completing the square as a factorising or solving method (excluded at M4 by the Teacher Guidance)",
      "The factor theorem or factorising cubics (A level, not GCSE)",
      "Factorising over surds or complex numbers",
    ],
    externalRefs: [
      { kind: "corbettmaths", videos: [119, 120] },
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
        asOf: UPDATED,
      },
    ],
    keywords: ["factorise", "ax² + bx + c", "harder quadratics", "grouping", "two variables", "difference of two squares", "factorise fully"],
  },
  note: {
    id: `note.${TID}`,
    topic: TID,
    title: "Factorising ax² + bx + c and harder expressions",
    subject: "maths",
    unit: "M4",
    tier: "H",
    specRefs: ["M4-NA-02"],
    calculator: true,
    formulaSheet: {
      given: [],
      mustKnow: [
        "Pair with product ac and sum b, then split the middle term and group",
        "a² − b² = (a + b)(a − b)",
        "Highest common factor includes letters as well as numbers",
        "A perfect square trinomial: a² − 2ab + b² = (a − b)²",
      ],
    },
    notOnThisSpec: [
      "Completing the square (excluded at M4 by the Teacher Guidance)",
      "The factor theorem and cubics (A level, not GCSE)",
    ],
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Factorise ax² + bx + c by splitting the middle term with a pair whose product is ac and whose sum is b",
        "Group four terms in pairs, choosing the sign of the second common factor so the brackets match",
        "Take out the highest common factor first, numbers and letters together",
        "Recognise a difference of two squares after a common factor, and finish the factorisation",
        "Apply a² − b² when a or b is a fraction, such as 9/16 x² − 49",
        "Apply a² − b² when a or b is a product of letters, such as 4x²y² − 9",
        "Factorise a quadratic in two variables, keeping the second letter in both brackets",
        "Recognise a perfect square trinomial such as 4p² − 20pq + 25q²",
        "Use a factorisation in a Hence part: simplify an algebraic fraction, or find a missing side of a rectangle",
      ],
      howExamined: HOW_EXAMINED,
      traps: [
        "Looking for a pair that multiplies to c instead of ac when there is a number in front of x² (Summer 2024 M4 Q12(b), where wrong factorising produced impossible roots)",
        "Taking out the common factor and stopping, leaving a difference of two squares unfactorised — most candidates in November 2025 M4 Q22",
        "Taking out only part of the common factor: 3 instead of 3a, or 2 instead of 2n",
        "Not recognising a fraction as a perfect square — most candidates scored zero on this case (Summer 2023 M4 Q19)",
        "Dropping the second letter, writing (x + 5)(x − 3) for a quadratic in x and y (Summer 2023 M4 Q19)",
        "Reading a perfect square trinomial as a difference of two squares, so both signs are not negative",
        "Taking out +2 instead of −2 when grouping, so the two brackets do not match and nothing can be factorised",
        "Cancelling single terms in a Hence simplify part instead of whole brackets (November 2025 M4 Q22)",
      ],
    },
    verification: `ver.note.${TID}`,
    version: 1,
    updated: UPDATED,
  },
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  insight,
  sets: [
    {
      id: `set.${TID}.warm-up`,
      topic: TID,
      kind: "interleaved",
      title: "Splitting the middle term warm-up",
      subject: "maths",
      units: ["M4"],
      itemIds: [`dx.${TID}`, `rp.${TID}.01`, qid(1), qid(2), qid(3), `rp.${TID}.02`, qid(4)],
      showTopicLabels: false,
      version: 1,
    },
    {
      id: `set.${TID}.mixed`,
      topic: TID,
      kind: "mixed",
      title: "Fully factorised: common factors, squares and two letters",
      subject: "maths",
      units: ["M4"],
      itemIds: [qid(8), qid(9), `ftm.${TID}.01`, qid(12), qid(13), `ftm.${TID}.03`, qid(15), qid(16), qid(18), `rp.${TID}.04`],
      showTopicLabels: false,
      version: 1,
    },
  ],
  verification: [],
};

// ---------------------------------------------------------------------------
// Verification details
// ---------------------------------------------------------------------------

const SCOPE =
  "Higher tier (M4). Quadratics of the form ax^2 + bx + c and the more complex expressions named in the Teacher Guidance on M4-NA-02 (3x^2 - 75, x^2 + xy - 6y^2, 2px - qx - 2py + qy); completing the square is excluded at M4 by the Teacher Guidance and does not appear";
const FORMULA =
  "Nothing is taken from the Higher formula sheet: the split-the-middle-term method and a^2 - b^2 = (a + b)(a - b) are both recall (packs/maths/exam-true/formula-sheets.json has no factorising entry)";
const SYMBOLIC = `Every factorisation in this bundle is proved in scratchpad/m4-batch/gen-factorising-harder-quadratics.mjs: the brackets are expanded symbolically into coefficients of x^2, xy, y^2, x, y and 1 and compared with the target, then evaluated at the three points (2, 3), (-1, 5) and (4, -2); the script throws if any comparison fails. ${PROOFS.length} factorisations proved.`;

const numericDetails = {};
for (const q of questions) numericDetails[q.id] = q.solutionProgram;

const details = {};
details[`note.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Sheet quotes the tariffs seen in the M4 papers read: 2-3 marks for an early Factorise, 3 marks for a late Factorise fully, plus 3 for a Hence simplify",
  numeric: "Every ac value and every pair quoted in the note recomputed in the generator (6 x -10 = -60 with 15 and -4; 2 x 12 = 24 with 3 and 8; 6 x -12 = -72 with 9 and -8)",
  symbolic: SYMBOLIC,
  examiner:
    "Traps map onto the three findings of packs/maths/insights/m4.factorising-harder-quadratics-ax2-plus-bx-plus-c.json (Summer 2023 Q19, Summer 2024 Q18, November 2025 Q22) plus the Summer 2024 Q12(b) and Summer 2025 Q20 evidence on the taxonomy entry",
};
for (const we of workedExamples) {
  details[we.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff:
      we.id.endsWith("01")
        ? "Five steps earning M1 MA1 MA1 MA1 A1, the 2- to 3-mark shape of an early Factorise with the grouping shown in full"
        : we.id.endsWith("02")
          ? "Three steps earning MA1 MA1 A1, exactly the 3-mark November 2025 M4 Q22(a) shape (MA1 common factor, MA2 completed)"
          : we.id.endsWith("03")
            ? "Four steps earning MA1 MA1 MA1 A1, the 3-mark Summer 2024 M4 Q18(a) shape with three letters"
            : "Three steps earning M1 MA1 A1, the 2-mark Summer 2023 M4 Q19(a) fractional case",
    numeric:
      we.id.endsWith("01")
        ? "ac = 6 x (-10) = -60; pair 15 and -4 with 15 + (-4) = 11; twin 10x^2 - 9x - 7 has ac = -70 with pair -14 and 5"
        : we.id.endsWith("02")
          ? "HCF(12, 27) = 3; 4 = 2^2 and 9 = 3^2; twin HCF(50, 32) = 2 with 25 = 5^2 and 16 = 4^2"
          : we.id.endsWith("03")
            ? "ac = 2 x 12 = 24; pair 3 and 8 with 3 + 8 = 11; twin 3x^2 - 5xy - 12y^2 has ac = -36 with pair 4 and -9"
            : "sqrt(9/16) = 3/4 and sqrt(49) = 7; twin sqrt(25/36) = 5/6 and sqrt(16) = 4",
    symbolic: SYMBOLIC,
    examiner:
      we.id.endsWith("01")
        ? "Exercises the Summer 2024 M4 Q12(b) finding that wrong factorising produced impossible roots"
        : we.id.endsWith("02")
          ? "Exercises the November 2025 M4 Q22 finding that most stopped after the common factor"
          : we.id.endsWith("03")
            ? "Exercises the Summer 2024 M4 Q18 finding about three letters, and the Summer 2023 M4 Q19 finding that 'a' was taken out and then progress stopped"
            : "Directly seeded from the Summer 2023 M4 Q19 finding that most scored zero on the fractional difference of two squares",
  };
}
details[`dx.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Diagnostic items, not tariffed; each is one decision inside the 2- or 3-mark question",
  numeric: "Each option expanded in the generator and compared with the stem: 6 x -10 = -60, 3 x 8 = 24, HCF(5, 45) = 5, sqrt(1/9) = 1/3, and the four-term grouping 6mn + 9m - 4n - 6",
  symbolic: SYMBOLIC,
  examiner:
    "Every distractor carries a misconception: the registry ids common-factor-then-stop, dots-fractional-coefficient, dots-term-order, not-fully-factorised, sign-errors-in-brackets, wrong-variable-letter and algebra.expression-left-factorised, plus the new id reported in the batch message (factorising.middle-term-split-ignores-a)",
};
for (const q of questions) {
  details[q.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: `${q.totalMarks} marks in ${q.parts.length} part(s); mark codes follow the M4 schemes read (Summer 2024 Q18(a): MA1 then MA2; Summer 2023 Q19(b): M1 A2; November 2025 Q22: MA1 MA2 then MA1 MA1 MA1)`,
    numeric: numericDetails[q.id],
    symbolic: SYMBOLIC,
    examiner: `Exercises ${q.examinerSources.join(", ")}`,
  };
}
for (const f of findTheMistake) {
  details[f.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Matches the 2- and 3-mark Factorise shapes; marksEarnedAsWritten counts only the steps the scheme would still credit",
    numeric:
      f.id.endsWith("01")
        ? "Correct route recomputed: HCF = 3a, then x^2 - 25y^2 = (x + 5y)(x - 5y), verified by expansion"
        : f.id.endsWith("02")
          ? "Correct route recomputed: ac = 6 x (-6) = -36 with pair 4 and -9, giving (2x - 3)(3x + 2), verified by expansion to 6x^2 - 5x - 6"
          : "Correct route recomputed: sqrt(4/25) = 2/5 and sqrt(9) = 3, giving (2x/5 + 3)(2x/5 - 3), verified by expansion to (4/25)x^2 - 9",
    symbolic: SYMBOLIC,
    examiner: `Seeded from ${f.source}`,
  };
}
for (const p of prompts) {
  details[p.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Retrieval prompt; no tariff",
    numeric: "Any worked factorisation in the prompt or answer proved by the generator's expansion check",
    symbolic: SYMBOLIC,
    examiner: "Drawn from the rule lines of packs/maths/insights/m4.factorising-harder-quadratics-ax2-plus-bx-plus-c.json",
  };
}

bundle.verification = collectLogs(bundle, details);

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const blocks = [
  { type: "h", text: "Factorising ax² + bx + c and harder expressions" },
  {
    type: "callout",
    kind: "spec",
    title: "The statement",
    md: "**M4-NA-02** — factorise quadratic expressions of the form $ax^2 + bx + c$.\nThe Teacher Guidance shows what 'more complex' means in practice: $3x^2 - 75$, $x^2 + xy - 6y^2$, $2px - qx - 2py + qy$. So: a common factor, two variables, and four terms to group.",
    source: "CCEA GCSE Mathematics specification, statement M4-NA-02, with its Teacher Guidance",
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Not on this spec",
    md: "**Completing the square is excluded at M4** by the Teacher Guidance, so you will never be asked to factorise or solve that way. The factor theorem and cubics are A level.",
  },
  {
    type: "p",
    md: "This turns up twice in an M4 paper. A short **Factorise** near the start, 2 or 3 marks, usually attached to a question that goes on to solve an equation. Then a 3-mark **Factorise fully** in the last third — and that one is a discriminator. In November 2025 most candidates took the common factor out and stopped; only the top candidates saw what was left.",
  },
  {
    type: "gate",
    id: "g0",
    kind: "number",
    prompt: "Warm-up. For $x^2 + 7x + 12$, what do the two numbers in the brackets multiply to give?",
    answer: "12",
    explain: "12, the constant term, because the coefficient of x² is 1. Everything below is about what changes when it is not.",
  },
  { type: "h", text: "The number in front of x² changes one thing" },
  {
    type: "p",
    md: "For $x^2 + bx + c$ you look for two numbers that multiply to $c$ and add to $b$. As soon as there is an $a$ in front, that rule breaks: the pair must multiply to **$ac$**.\nTake $6x^2 + 11x - 10$. Here $ac = 6 \\times (-10) = -60$ and $b = 11$, so the pair is $15$ and $-4$. Split the middle term with them, then group in twos.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why ac and not c",
    md: "Expand $(px + m)(qx + n)$: the $x^2$ term is $pq\\,x^2$, the constant is $mn$, and the middle is $(pn + mq)x$. Multiply the outer coefficient by the constant: $pq \\times mn$, which is the same as $(pn) \\times (mq)$ — the product of the two pieces of the middle term. So the pair you want multiplies to $ac$.",
  },
  {
    type: "gate",
    id: "g0b",
    kind: "blank",
    prompt: "For $6x^2 + 11x - 10$, which pair multiplies to $-60$ and adds to $11$?",
    answer: "15 and −4",
    explain: "The factor pairs of 60 that differ by 11 are 15 and 4, and the larger takes the sign of b.",
  },
  {
    type: "figure",
    alt: "A two by two grid area model. The columns are headed 2x and plus 5, the rows are headed 3x and minus 2, and the four cells contain 6x squared, plus 15x, minus 4x and minus 10.",
    svg: GRID_FIG,
    caption: "The grid holds the four pieces. Reading the edges gives $(3x - 2)(2x + 5)$.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "number",
    prompt: "For $6x^2 - 19x + 10$, what is $ac$?",
    answer: "60",
    explain: "6 × 10 = 60. The pair then needs product 60 and sum −19: that is −15 and −4.",
  },
  {
    type: "p",
    md: "**Grouping, and the sign that decides it.** Once the middle term is split,\n$6x^2 + 15x - 4x - 10 = 3x(2x + 5) - 2(2x + 5) = (3x - 2)(2x + 5)$\nThe second common factor is $-2$, not $+2$, because $+2$ would give $2(-2x - 5)$ and the brackets would not match. Matching brackets is the signal that everything so far is right; if yours differ, the pair came from $c$ instead of $ac$.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "choice",
    prompt: "Factorise $6mn + 9m - 4n - 6$ by grouping.",
    options: ["(3m − 2)(2n + 3)", "(3m + 2)(2n + 3)", "(3m − 2)(2n − 3)"],
    answer: "(3m − 2)(2n + 3)",
    explain: "3m(2n + 3) − 2(2n + 3). Taking out −2 is what makes the second bracket match.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2024 M4 Q12(b)",
    md: "Candidates solved a quadratic after factorising it, and **answers of 40 and 6 appeared from wrong factorising** — values that could never satisfy the equation. Ten seconds of checking prevents it: expand only the middle term of your brackets and compare it with $b$.",
    source: "ccea-cer:maths:2024-summer:M4:Q12b",
  },
  { type: "h", text: "Fully means keep going" },
  {
    type: "p",
    md: "The late question almost always has the same shape: **a common factor with a letter in it, then a difference of two squares.**\n$12x^2 - 27y^2 = 3(4x^2 - 9y^2) = 3(2x + 3y)(2x - 3y)$\nThe common factor is one mark. The two marks after it are for noticing that $4x^2 - 9y^2$ is $(2x)^2 - (3y)^2$ and finishing. Before you write an answer, look at every bracket you have and ask whether it still factorises.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "blank",
    prompt: "Factorise fully $5p^2 - 45q^2$.",
    answer: "5(p + 3q)(p − 3q)",
    explain: "Take out 5, then p² − 9q² is a difference of two squares.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "November 2025 M4 Q22(a)",
    md: "Factorise fully, with a common factor of $3a$ followed by a difference of two squares. **Most took the $3a$ out; only the top candidates recognised the difference of two squares that remained.** Two of the three marks were sitting in that one extra line.",
    source: "ccea-cer:maths:2025-november:M4:Q22",
  },
  { type: "h", text: "When a and b are not simple letters" },
  {
    type: "p",
    md: "$a^2 - b^2 = (a + b)(a - b)$ is true for **any** $a$ and $b$. That is the whole A-grade idea here.\n**A fraction can be a square.** $\\tfrac{9}{16}x^2 = \\left(\\tfrac{3}{4}x\\right)^2$, because you square-root the top and the bottom separately. So $\\tfrac{9}{16}x^2 - 49 = \\left(\\tfrac{3}{4}x + 7\\right)\\left(\\tfrac{3}{4}x - 7\\right)$.\n**A product of letters can be a square.** $4x^2y^2 = (2xy)^2$, so $4x^2y^2 - 9 = (2xy + 3)(2xy - 3)$.\n**Two variables.** $x^2 + 2xy - 15y^2 = (x + 5y)(x - 3y)$ — the $y$ stays in both brackets, or the $y^2$ term cannot appear.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "blank",
    prompt: "$\\dfrac{1}{9}x^2$ is the square of what?",
    answer: "x/3",
    explain: "√(1/9) = 1/3, so it is (x/3)². Square-root the numerator and the denominator separately.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2023 M4 Q19 and Summer 2024 M4 Q18",
    md: "Summer 2023: a difference of two squares with a **fractional coefficient**, and **most candidates scored zero**; then an expression in three letters where most took the common factor out and could not handle the $x$ and $y$ terms. Summer 2024 repeated it, and the examiners' note was to treat $4x^2y^2$ as $(2xy)^2$.",
    source: "ccea-cer:maths:2023-summer:M4:Q19; ccea-cer:maths:2024-summer:M4:Q18",
  },
  {
    type: "gate",
    id: "g5",
    kind: "choice",
    prompt: "Factorise $x^2 - 6xy + 8y^2$.",
    options: ["(x − 2y)(x − 4y)", "(x − 2)(x − 4)", "(x + 2y)(x − 4y)"],
    answer: "(x − 2y)(x − 4y)",
    explain: "−2y and −4y: they give −6xy in the middle and +8y² at the end. Without the y there is no y² term at all.",
  },
  {
    type: "gate",
    id: "g6",
    kind: "choice",
    prompt: "Which is $4p^2 - 20pq + 25q^2$?",
    options: ["(2p − 5q)²", "(2p + 5q)(2p − 5q)", "(4p − 5q)(p − 5q)"],
    answer: "(2p − 5q)²",
    explain: "A middle term of −20pq means it is a perfect square, not a difference of two squares — the second option has no middle term at all.",
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** pair with product $ac$ and sum $b$, then split and group; $a^2 - b^2 = (a + b)(a - b)$ for any $a$ and $b$; the highest common factor includes letters; $a^2 - 2ab + b^2 = (a - b)^2$.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The wording is bare: **“Factorise”** or **“Factorise fully”**, with an answer line and 2 or 3 marks. The first mark is the common factor, or the split of the middle term — write that line even if the rest will not come.\nWhen a later part says **“Hence simplify”**, it is telling you the factorisation you just found is a factor of the fraction. Factorise the other part as well, then cancel a **whole bracket**. Crossing out single terms scores nothing.\nAnd the last habit: expand the middle of your brackets before you move on. It is the cheapest mark-check in the paper.",
  },
  { type: "prompt", promptId: `rp.${TID}.01` },
  { type: "prompt", promptId: `rp.${TID}.02` },
  { type: "prompt", promptId: `rp.${TID}.04` },
  { type: "prompt", promptId: `rp.${TID}.05` },
  { type: "prompt", promptId: `rp.${TID}.09` },
];

writeBundle("m4", SLUG, bundle, blocks);
console.log(`proved ${PROOFS.length} factorisations symbolically and at three sample points`);
