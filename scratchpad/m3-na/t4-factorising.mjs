/** maths.m3.factorising-quadratics-x2-plus-bx-plus-c — S bundle (difficulty 3). */
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, equiv, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.factorising-quadratics-x2-plus-bx-plus-c";
const SLUG = "factorising-quadratics-x2-plus-bx-plus-c";
const REF = ["M3-NA-06"];

// ---------------------------------------------------------------- symbolic checks
const P = [{ x: 2 }, { x: -3 }, { x: 0.5 }];
const at = (v) => [{ [v]: 2 }, { [v]: -3 }, { [v]: 0.5 }];
const C = {
  a: equiv("x²+9x+20", "(x+4)*(x+5)", "x**2 + 9*x + 20", P),
  b: equiv("x²-7x+12", "(x-3)*(x-4)", "x**2 - 7*x + 12", P),
  c: equiv("x²+3x-28", "(x+7)*(x-4)", "x**2 + 3*x - 28", P),
  d: equiv("x²-5x-36", "(x-9)*(x+4)", "x**2 - 5*x - 36", P),
  e: equiv("y²-11y+24", "(y-3)*(y-8)", "y**2 - 11*y + 24", at("y")),
  f: equiv("p²+4p-45", "(p+9)*(p-5)", "p**2 + 4*p - 45", at("p")),
  g: equiv("x²-13x+40", "(x-5)*(x-8)", "x**2 - 13*x + 40", P),
  h: equiv("n²+2n-63", "(n+9)*(n-7)", "n**2 + 2*n - 63", at("n")),
  i: equiv("2x²+10x-48", "2*(x+8)*(x-3)", "2*x**2 + 10*x - 48", P),
  j: equiv("x²+14x+49", "(x+7)**2", "x**2 + 14*x + 49", P),
  k: equiv("k²-2k-35", "(k-7)*(k+5)", "k**2 - 2*k - 35", at("k")),
  l: equiv("x²+11x+30", "(x+5)*(x+6)", "x**2 + 11*x + 30", P),
  m: equiv("t²-6t", "t*(t-6)", "t**2 - 6*t", at("t")),
  n: equiv("x²-x-20", "(x-5)*(x+4)", "x**2 - x - 20", P),
  o: equiv("3x²-21x+30", "3*(x-2)*(x-5)", "3*x**2 - 21*x + 30", P),
  p: equiv("w²-15w+56", "(w-7)*(w-8)", "w**2 - 15*w + 56", at("w")),
  q: equiv("x²+x-56", "(x+8)*(x-7)", "x**2 + x - 56", P),
  r: equiv("area (x+4)(x+9)", "(x+4)*(x+9)", "x**2 + 13*x + 36", P),
};
// The factor-pair search for x^2 - 7x + 12
const pairs12 = [[1, 12], [2, 6], [3, 4]];
expect("pair sums of 12", pairs12.map(([a, b]) => a + b).join(","), "13,8,7");
expect("chosen pair", -3 + -4, -7);
expect("chosen product", -3 * -4, 12);
assertNoFailures("t4 symbolic");

// ---------------------------------------------------------------- figures
const tableBody = `
<g fill='none' stroke='currentColor' stroke-width='1.4'>
  <path d='M40 62 L600 62'/><path d='M40 104 L600 104'/>
  <path d='M250 30 L250 236'/><path d='M420 30 L420 236'/>
</g>
<g ${TXT} font-size='17' text-anchor='middle'>
  <text x='145' y='52'>pair of factors of +12</text>
  <text x='335' y='52'>sum</text>
  <text x='510' y='52'>is the sum -7?</text>
  <text x='145' y='94'>1 and 12</text><text x='335' y='94'>13</text><text x='510' y='94'>no</text>
  <text x='145' y='134'>2 and 6</text><text x='335' y='134'>8</text><text x='510' y='134'>no</text>
  <text x='145' y='174'>3 and 4</text><text x='335' y='174'>7</text><text x='510' y='174'>right size, wrong sign</text>
  <text x='145' y='214'>-3 and -4</text><text x='335' y='214'>-7</text><text x='510' y='214'>yes</text>
</g>
<g fill='none' stroke='currentColor' stroke-width='2'>
  <rect x='44' y='194' width='552' height='30' rx='6'/>
</g>`;
const tableAlt =
  "A table of factor pairs of positive 12 with their sums: 1 and 12 give 13, 2 and 6 give 8, 3 and 4 give 7, and minus 3 and minus 4 give minus 7. The last row is boxed as the pair that works.";
const tableFig = svgFig(tableBody, tableAlt, 640, 250);

const reverseGridBody = `
<g fill='none' stroke='currentColor' stroke-width='1.6'>
  <rect x='150' y='70' width='360' height='170'/>
  <path d='M330 70 L330 240'/><path d='M150 155 L510 155'/>
</g>
<g ${MATHTXT} font-size='22' text-anchor='middle'>
  <text x='240' y='52'>x</text><text x='420' y='52'>-3</text>
  <text x='240' y='120'>x²</text><text x='420' y='120'>-3x</text>
  <text x='240' y='205'>-4x</text><text x='420' y='205'>+12</text>
</g>
<g ${MATHTXT} font-size='22' text-anchor='end'>
  <text x='130' y='120'>x</text><text x='130' y='205'>-4</text>
</g>
<g ${TXT} font-size='16' text-anchor='middle'>
  <text x='330' y='278'>the corners are given: x² and +12. The two middle cells must add to -7x.</text>
</g>`;
const reverseGridAlt =
  "A two by two grid with the corner cells x squared and plus 12 already filled in, and the two middle cells minus 3x and minus 4x. The headings read x and minus 3 across, x and minus 4 down. A note says the two middle cells must add to minus 7x.";
const reverseGridFig = svgFig(reverseGridBody, reverseGridAlt, 660, 296);

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statement M3-NA-06: quadratics of the form x² + bx + c only, where the coefficient of x² is 1 (or a numerical common factor can be taken out to make it 1). ax² + bx + c with a ≠ 1 is M4, and solving the resulting equation is M3-NA-11, a separate topic.",
  formula: "Nothing on the Higher formula sheet applies. 'Two numbers that multiply to c and add to b' is a must-know rule.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Factorise, Factorise fully, Expand, Show that, Write down).",
  tariff: "Tariffs match the corpus: 'Factorise x² + bx + c' is 2 marks, marked A1 A1 or M1 A1, usually around Q25-Q28 of M3 (Summer 2025 M3 Q25(b), November 2025 M3 Q28, Summer 2026 M3 Q25(b)). A 'factorise fully' with a common factor first is 2-3 marks.",
  copy: "Compared by hand against the M3 papers and schemes read for this batch (Summer 2025 Q25, November 2025 Q28, Summer 2026 Q25, Summer 2024 Q25): every quadratic here is new, none of the corpus expressions is reused, and no eight-word sequence is in common.",
  symbolic: "Each factorisation verified by expanding the bracketed form and comparing with the quadratic at three values of the letter (2, −3 and 0.5).",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Factorise $x^2 - 7x + 12$.",
    figure: tableFig,
    steps: [
      {
        n: 1,
        working: "Two brackets, each starting with $x$: $(x \\quad)(x \\quad)$, because $x \\times x = x^2$.",
        decision: "The coefficient of $x^2$ is 1, so each bracket starts with a single $x$. Writing the skeleton first stops the answer coming out as one bracket.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "Read the signs. The constant $+12$ is positive, so the two numbers have the **same** sign; the $x$ term $-7x$ is negative, so both are negative.",
        decision: "The signs are decided before any searching. Same sign when $c$ is positive, opposite signs when $c$ is negative — that halves the work and prevents the commonest slip.",
        whyMenu: {
          options: [
            "Two numbers multiply to a positive only if they share a sign, and they add to a negative only if both are negative",
            "The signs in the brackets copy the signs in the quadratic, in order",
            "The first bracket takes the minus and the second takes the plus",
          ],
          correct: 0,
          explain: "The product $c$ fixes whether the signs match; the sum $b$ then fixes which way round.",
        },
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "Factor pairs of 12: $1 \\times 12$, $2 \\times 6$, $3 \\times 4$. Sums: 13, 8, 7. With both negative, $-3$ and $-4$ give $-7$.",
        decision: "A short, ordered list rather than guessing. Three pairs, three sums, and the one that matches $b$ is the answer.",
        earns: ["A1"],
      },
      {
        n: 4,
        working: "$x^2 - 7x + 12 = (x - 3)(x - 4)$. Check: $-3x - 4x = -7x$ and $-3 \\times -4 = +12$.",
        decision: "Multiply the brackets back in your head. The middle term is the check that catches a sign slip, and it takes five seconds.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$(x - 3)(x - 4)$",
    twin: {
      stem: "Factorise $w^2 - 15w + 56$.",
      answer: algAnswer("(w-7)(w-8)", { variables: ["w"], mustBeFactorised: true }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Factorise fully $2x^2 + 10x - 48$.",
    steps: [
      {
        n: 1,
        working: "Every coefficient is even: $2x^2 + 10x - 48 = 2(x^2 + 5x - 24)$",
        decision: "The word **fully** is the instruction to look for a common factor first. Once the 2 is outside, what is left is the $x^2 + bx + c$ form the statement names, and the ordinary method works.",
        whyMenu: {
          options: [
            "Because 2 divides 2, 10 and 48, so it comes out of all three terms",
            "Because the first coefficient is 2, so a 2 always comes out",
            "Because dividing by 2 makes the numbers smaller",
          ],
          correct: 0,
          explain: "A common factor has to divide every term; here 2 does, and nothing larger does.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "For $x^2 + 5x - 24$: the constant is negative, so the two numbers have opposite signs. Pairs of 24: $1,24$; $2,12$; $3,8$; $4,6$. Differences: 23, 10, 5, 2.",
        decision: "With a negative constant the numbers have opposite signs, so it is the **difference** that has to match $b$. $8$ and $3$ differ by 5.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$+8$ and $-3$: they multiply to $-24$ and add to $+5$. So $x^2 + 5x - 24 = (x + 8)(x - 3)$.",
        decision: "The larger number takes the sign of $b$. Here $b$ is positive, so the 8 is the positive one.",
        earns: ["A1"],
      },
      {
        n: 4,
        working: "$2x^2 + 10x - 48 = 2(x + 8)(x - 3)$",
        decision: "The 2 goes back in front. Leaving it out is the difference between 'factorised' and 'factorised fully', and it is a mark.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$2(x + 8)(x - 3)$",
    twin: {
      stem: "Factorise fully $3x^2 - 21x + 30$.",
      answer: algAnswer("3(x-2)(x-5)", { mustBeFactorised: true }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
];

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`, topic: T, specRefs: REF, when: "pre",
    items: [
      dxItem("01", "For $x^2 + 9x + 20$, which pair of numbers do you need?", "Find the number pair for a quadratic with both signs positive",
        [
          ["4 and 5", true, null, "$4 \\times 5 = 20$ and $4 + 5 = 9$. Product is the constant, sum is the coefficient of $x$."],
          ["2 and 10", false, "maths.factorising.sign-errors-in-brackets", "$2 \\times 10 = 20$, so the product is right, but $2 + 10 = 12$, not 9. Both conditions have to hold."],
          ["9 and 20", false, "maths.factorising.sign-errors-in-brackets", "Those are $b$ and $c$ themselves. You are looking for two numbers whose product is $c$ and whose sum is $b$."],
        ], 25),
      dxItem("02", "In $x^2 + 3x - 28$, what do the signs tell you before you search?", "Read the signs off the quadratic",
        [
          ["The two numbers have opposite signs", true, null, "A negative constant can only come from a positive times a negative. The positive one is the larger, because $b$ is positive."],
          ["Both numbers are positive", false, "maths.factorising.sign-errors-in-brackets", "Two positives multiply to a positive, but the constant here is $-28$."],
          ["Both numbers are negative", false, "maths.factorising.sign-errors-in-brackets", "Two negatives also multiply to a positive. A negative constant needs one of each."],
        ], 25),
      dxItem("03", "Factorise $x^2 - 5x - 36$.", "Factorise with a negative constant",
        [
          ["$(x - 9)(x + 4)$", true, null, "$-9 \\times 4 = -36$ and $-9 + 4 = -5$. The larger number carries the sign of the middle term."],
          ["$(x + 9)(x - 4)$", false, "maths.factorising.sign-errors-in-brackets", "The signs are the wrong way round: this expands to $x^2 + 5x - 36$. The middle term is negative, so the 9 is the negative one."],
          ["$(x - 6)(x + 6)$", false, "maths.factorising.sign-errors-in-brackets", "That expands to $x^2 - 36$, with no middle term at all. It is the answer to a different question."],
        ], 30),
      dxItem("04", "Factorise fully $3x^2 - 21x + 30$.", "Take out the common factor before factorising",
        [
          ["$3(x - 2)(x - 5)$", true, null, "3 divides all three terms; then $x^2 - 7x + 10$ factorises with $-2$ and $-5$."],
          ["$(3x - 6)(x - 5)$", false, "maths.factorising.not-fully-factorised", "This does expand correctly, but the first bracket still has a factor of 3 in it. 'Fully' means the 3 comes out to the front."],
          ["$3(x^2 - 7x + 10)$", false, "maths.factorising.common-factor-then-stop", "The common factor is out, and that is the first mark, but the bracket still factorises into $(x - 2)(x - 5)$."],
        ], 40),
      dxItem("05", "Factorise $c^2 + 11c + 30$.", "Keep the letter the question uses",
        [
          ["$(c + 5)(c + 6)$", true, null, "$5 \\times 6 = 30$ and $5 + 6 = 11$, written in $c$ because the question is in $c$."],
          ["$(x + 5)(x + 6)$", false, "maths.factorising.wrong-variable-letter", "The numbers are right but the letter changed. November 2025 reported a mark lost for exactly this: use the letter in the question."],
          ["$(c + 3)(c + 10)$", false, "maths.factorising.sign-errors-in-brackets", "$3 \\times 10 = 30$, so the product is right, but $3 + 10 = 13$, not 11."],
        ], 30),
      dxItem("06", "A question says 'Factorise $x^2 - x - 20$'. Which answer would a marker accept?", "Factorise without solving",
        [
          ["$(x - 5)(x + 4)$", true, null, "A product of two brackets, nothing more. Factorising turns an expression into a product; it does not solve anything."],
          ["$x = 5$ or $x = -4$", false, "maths.alg-fractions.treat-expression-as-equation", "Those are the solutions of $x^2 - x - 20 = 0$, which is a different question. Factorise means write it as a product."],
          ["$(x - 5)(x + 4) = 0$", false, "maths.alg-fractions.treat-expression-as-equation", "The factorisation is right, but an expression is never set equal to zero. The '= 0' can cost the accuracy mark."],
        ], 30),
    ],
  },
];

// ---------------------------------------------------------------- questions
const questions = [
  question({
    id: `q.${T}.0001`, topic: T, specRefs: REF, style: "practice", difficulty: 1,
    commandWords: ["Factorise"], setting: "Pure algebra, both signs positive",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q25"],
    solutionProgram: C.a,
    parts: [{
      id: "main", verb: "factorise", marks: 2,
      stem: "Factorise $x^2 + 9x + 20$.",
      answer: algAnswer("(x+4)(x+5)", { mustBeFactorised: true }),
      scheme: [A("A1", 1, "one correct bracket, (x + 4) or (x + 5)"), A("A2", 1, "(x + 4)(x + 5)")],
      hints: ["Two numbers that multiply to 20 and add to 9.", "Pairs of 20: 1 and 20, 2 and 10, 4 and 5."],
      workedSolution: "$4 \\times 5 = 20$ and $4 + 5 = 9$, so $x^2 + 9x + 20 = (x + 4)(x + 5)$.",
      commonErrors: [{
        misconception: "maths.factorising.sign-errors-in-brackets",
        pattern: { kind: "algebraic", latex: "(x+2)(x+10)" },
        feedback: "The product is right, at 20, but the sum is 12 rather than 9. Both conditions have to hold; check the middle term by multiplying back.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2025-summer:M3:Q25",
      }],
      requiresWorking: false,
    }],
  }),
  question({
    id: `q.${T}.0002`, topic: T, specRefs: REF, style: "practice", difficulty: 2, paper: M7P1,
    commandWords: ["Factorise"], setting: "Pure algebra, both numbers negative, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q28"],
    solutionProgram: C.b + " | " + C.g,
    figures: [reverseGridFig],
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $x^2 - 7x + 12$.",
        answer: algAnswer("(x-3)(x-4)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket, (x − 3) or (x − 4)"), A("A2", 1, "(x − 3)(x − 4)")],
        hints: ["The constant is positive and the middle term negative, so both numbers are negative.", "Pairs of 12 with sum 7: 3 and 4."],
        workedSolution: "$-3 \\times -4 = +12$ and $-3 + (-4) = -7$, so the factorisation is $(x - 3)(x - 4)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x+3)(x+4)" },
          feedback: "That expands to $x^2 + 7x + 12$: the constant is right but the middle term has the wrong sign. Both numbers must be negative to add to $-7$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $x^2 - 13x + 40$.",
        answer: algAnswer("(x-5)(x-8)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket, (x − 5) or (x − 8)"), A("A2", 1, "(x − 5)(x − 8)")],
        hints: ["Both numbers negative again.", "Pairs of 40: 1 and 40, 2 and 20, 4 and 10, 5 and 8."],
        workedSolution: "$-5 \\times -8 = 40$ and $-5 - 8 = -13$, so $x^2 - 13x + 40 = (x - 5)(x - 8)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x-4)(x-10)" },
          feedback: "$-4 \\times -10 = 40$, so the constant works, but the sum is $-14$ rather than $-13$. Run through the pairs in order and check the sum each time.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0003`, topic: T, specRefs: REF, style: "practice", difficulty: 2,
    commandWords: ["Factorise"], setting: "Pure algebra, negative constant",
    examinerSources: ["ccea-cer:maths:2025-november:M3:Q28"],
    solutionProgram: C.c + " | " + C.d,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $x^2 + 3x - 28$.",
        answer: algAnswer("(x+7)(x-4)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket, (x + 7) or (x − 4)"), A("A2", 1, "(x + 7)(x − 4)")],
        hints: ["A negative constant means the two numbers have opposite signs.", "Their difference has to be 3: 7 and 4.", "The middle term is positive, so the 7 is the positive one."],
        workedSolution: "$7 \\times (-4) = -28$ and $7 + (-4) = 3$, so $x^2 + 3x - 28 = (x + 7)(x - 4)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x-7)(x+4)" },
          feedback: "The signs are swapped: this expands to $x^2 - 3x - 28$. The number with the sign of the middle term is the larger one, so the 7 is positive.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $x^2 - 5x - 36$.",
        answer: algAnswer("(x-9)(x+4)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket, (x − 9) or (x + 4)"), A("A2", 1, "(x − 9)(x + 4)")],
        hints: ["Opposite signs again, with a difference of 5.", "9 and 4 differ by 5 and multiply to 36.", "The middle term is negative, so the 9 is the negative one."],
        workedSolution: "$-9 \\times 4 = -36$ and $-9 + 4 = -5$, so $x^2 - 5x - 36 = (x - 9)(x + 4)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x-6)(x+6)" },
          feedback: "$(x - 6)(x + 6)$ expands to $x^2 - 36$ with no middle term. This quadratic has a $-5x$, so the two numbers must differ.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0004`, topic: T, specRefs: REF, style: "practice", difficulty: 2,
    commandWords: ["Factorise"], setting: "Pure algebra, letters other than x",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q13"],
    solutionProgram: C.e + " | " + C.f,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $y^2 - 11y + 24$.",
        answer: algAnswer("(y-3)(y-8)", { variables: ["y"], mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket in y"), A("A2", 1, "(y − 3)(y − 8)", { examinerNote: "Brackets written in x lose the second mark." })],
        hints: ["Both numbers negative.", "$3 \\times 8 = 24$ and $3 + 8 = 11$.", "Write the answer in $y$."],
        workedSolution: "$-3 \\times -8 = 24$ and $-3 - 8 = -11$, so $y^2 - 11y + 24 = (y - 3)(y - 8)$.",
        commonErrors: [{
          misconception: "maths.factorising.wrong-variable-letter",
          pattern: { kind: "algebraic", latex: "(x-3)(x-8)" },
          feedback: "The numbers are right and the first mark stands. The letter must be the one in the question; November 2025 M4 Q13 reported a mark lost for switching to $x$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q13",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $p^2 + 4p - 45$.",
        answer: algAnswer("(p+9)(p-5)", { variables: ["p"], mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket in p"), A("A2", 1, "(p + 9)(p − 5)")],
        hints: ["Opposite signs, difference 4.", "$9 \\times 5 = 45$."],
        workedSolution: "$9 \\times (-5) = -45$ and $9 - 5 = 4$, so $p^2 + 4p - 45 = (p + 9)(p - 5)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(p-9)(p+5)" },
          feedback: "Swapped signs give $p^2 - 4p - 45$. The middle term is $+4p$, so the larger number, 9, is the positive one.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q13",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0005`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Factorise"], emphasis: ["fully"], setting: "Pure algebra, a common factor first",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: C.i,
    parts: [{
      id: "main", verb: "factorise", marks: 3,
      stem: "Factorise **fully** $2x^2 + 10x - 48$.",
      answer: algAnswer("2(x+8)(x-3)", { mustBeFactorised: true }),
      scheme: [
        MA("MA1", 1, "2(x² + 5x − 24) — the common factor 2 taken out of all three terms"),
        A("A1", 1, "one correct bracket, (x + 8) or (x − 3)", { ft: true, dependsOn: ["MA1"] }),
        A("A2", 1, "2(x + 8)(x − 3)", { ft: true, dependsOn: ["A1"], examinerNote: "(2x + 16)(x − 3) is not fully factorised and scores a maximum of MA1 A1." }),
      ],
      hints: ["'Fully' is a signal: look for a number that divides every term.", "2 divides 2, 10 and 48.", "Then factorise $x^2 + 5x - 24$ with two numbers that multiply to $-24$ and add to 5."],
      workedSolution: "$2x^2 + 10x - 48 = 2(x^2 + 5x - 24)$. For the bracket, $8 \\times (-3) = -24$ and $8 - 3 = 5$, so $x^2 + 5x - 24 = (x + 8)(x - 3)$.\nAltogether, $2(x + 8)(x - 3)$.",
      commonErrors: [
        {
          misconception: "maths.factorising.common-factor-then-stop",
          pattern: { kind: "algebraic", latex: "2(x^2+5x-24)" },
          feedback: "The common factor is out and that earns the method mark. The bracket still factorises, and 'fully' means going all the way.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        },
        {
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "(2x+16)(x-3)" },
          feedback: "This expands correctly, but the first bracket still contains a factor of 2. The Summer 2025 report made the same point about taking out only part of a common factor.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        },
      ],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0006`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Factorise"], setting: "Pure algebra, a perfect square and a common factor only",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: C.j + " | " + C.m,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $x^2 + 14x + 49$.",
        answer: algAnswer("(x+7)(x+7)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket (x + 7)"), A("A2", 1, "(x + 7)(x + 7) or (x + 7)²")],
        hints: ["Two numbers multiplying to 49 and adding to 14.", "49 = 7 × 7, and 7 + 7 = 14.", "The two brackets come out the same, so it can be written as a square."],
        workedSolution: "$7 \\times 7 = 49$ and $7 + 7 = 14$, so $x^2 + 14x + 49 = (x + 7)(x + 7) = (x + 7)^2$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x+7)(x-7)" },
          feedback: "That expands to $x^2 - 49$ with no middle term. Here both numbers are $+7$, because they must add to $+14$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 1,
        stem: "Factorise $t^2 - 6t$.",
        answer: algAnswer("t(t-6)", { variables: ["t"], mustBeFactorised: true }),
        scheme: [A("A1", 1, "t(t − 6)")],
        hints: ["There is no constant term, so a $t$ comes out of both terms.", "This one needs a single bracket, not two."],
        workedSolution: "Both terms contain $t$, so $t^2 - 6t = t(t - 6)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(t-2)(t-3)" },
          feedback: "That expands to $t^2 - 5t + 6$, which has a constant term. With no constant, the factorisation is a common factor, not two brackets.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0007`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Factorise"], setting: "Pure algebra, small middle coefficient",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q25"],
    solutionProgram: C.q + " | " + C.k,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $x^2 + x - 56$.",
        answer: algAnswer("(x+8)(x-7)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket, (x + 8) or (x − 7)"), A("A2", 1, "(x + 8)(x − 7)")],
        hints: ["The coefficient of $x$ is 1, so the two numbers differ by 1.", "Consecutive factors of 56: 7 and 8.", "The positive one is the larger, because the middle term is positive."],
        workedSolution: "$8 \\times (-7) = -56$ and $8 - 7 = 1$, so $x^2 + x - 56 = (x + 8)(x - 7)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x-8)(x+7)" },
          feedback: "That expands to $x^2 - x - 56$. The middle term here is $+x$, so the 8 takes the plus sign.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M3:Q25",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $k^2 - 2k - 35$.",
        answer: algAnswer("(k-7)(k+5)", { variables: ["k"], mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket in k"), A("A2", 1, "(k − 7)(k + 5)")],
        hints: ["Opposite signs, difference 2.", "$7 \\times 5 = 35$.", "Keep the letter $k$."],
        workedSolution: "$-7 \\times 5 = -35$ and $-7 + 5 = -2$, so $k^2 - 2k - 35 = (k - 7)(k + 5)$.",
        commonErrors: [{
          misconception: "maths.factorising.wrong-variable-letter",
          pattern: { kind: "algebraic", latex: "(x-7)(x+5)" },
          feedback: "The numbers are right; the letter is not. Copy the letter from the question into both brackets.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q13",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0008`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Expand", "Factorise"], setting: "Pure algebra, expanding and factorising as inverse operations",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q25"],
    solutionProgram: C.l,
    parts: [
      {
        id: "a", verb: "expand", marks: 2,
        stem: "Expand and simplify $(x + 5)(x + 6)$.",
        answer: algAnswer("x^2 + 11x + 30", { mustBeExpanded: true }),
        scheme: [MA("MA1", 1, "x² + 6x + 5x + 30"), A("A1", 1, "x² + 11x + 30", { dependsOn: ["MA1"] })],
        hints: ["Four products.", "$6x + 5x = 11x$."],
        workedSolution: "$x^2 + 6x + 5x + 30 = x^2 + 11x + 30$.",
        commonErrors: [{
          misconception: "maths.algebra.like-terms-powers-added",
          pattern: { kind: "algebraic", latex: "x^2 + 30" },
          feedback: "The two middle products were dropped. Every pair of terms is multiplied, which gives four products, not two.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M3:Q25",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "write-down", marks: 1,
        stem: "Hence write down the factorisation of $x^2 + 11x + 30$.",
        answer: algAnswer("(x+5)(x+6)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "(x + 5)(x + 6)", { ft: true, examinerNote: "Follow through from part (a); no further working is expected after 'hence write down'." })],
        hints: ["Part (a) has already done the work, backwards.", "Factorising undoes expanding."],
        workedSolution: "Part (a) showed $(x + 5)(x + 6) = x^2 + 11x + 30$, so the factorisation is $(x + 5)(x + 6)$.",
        commonErrors: [{
          misconception: "maths.quadratics.no-link-between-parts",
          pattern: { kind: "text", regex: "^\\s*$" },
          feedback: "The word 'hence' points straight at part (a). Factorising is expanding run backwards, so the answer is already on the page.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M3:Q21",
        }],
        requiresWorking: false,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  // ------------------------------------------------------------ exam-style
  question({
    id: `q.${T}.0009`, topic: T, specRefs: REF, style: "exam-style", difficulty: 4,
    commandWords: ["Factorise"], emphasis: ["fully"],
    setting: "Pure algebra, a two-part 'Factorise' question in the style of a late M3 item",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q25", "ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: C.n + " | " + C.o,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise\n\n$x^2 - x - 20$",
        answer: algAnswer("(x-5)(x+4)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket, (x − 5) or (x + 4)"), A("A2", 1, "(x − 5)(x + 4)")],
        hints: ["Opposite signs, differing by 1.", "$5 \\times 4 = 20$.", "The middle term is $-x$, so the 5 is negative."],
        workedSolution: "$-5 \\times 4 = -20$ and $-5 + 4 = -1$, so $x^2 - x - 20 = (x - 5)(x + 4)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x+5)(x-4)" },
          feedback: "That expands to $x^2 + x - 20$. The signs decide which number is negative: the middle term is $-x$, so it is the 5.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M3:Q28",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 3,
        stem: "Factorise **fully**\n\n$3x^2 - 21x + 30$",
        answer: algAnswer("3(x-2)(x-5)", { mustBeFactorised: true }),
        scheme: [
          MA("MA1", 1, "3(x² − 7x + 10)"),
          A("A1", 1, "one correct bracket, (x − 2) or (x − 5)", { ft: true, dependsOn: ["MA1"] }),
          A("A2", 1, "3(x − 2)(x − 5)", { ft: true, dependsOn: ["A1"] }),
        ],
        hints: ["3 divides 3, 21 and 30.", "Then factorise $x^2 - 7x + 10$: both numbers negative.", "$-2$ and $-5$ multiply to 10 and add to $-7$."],
        workedSolution: "$3x^2 - 21x + 30 = 3(x^2 - 7x + 10)$, and $-2 \\times -5 = 10$ with $-2 - 5 = -7$, so the full factorisation is $3(x - 2)(x - 5)$.",
        commonErrors: [
          {
            misconception: "maths.factorising.common-factor-then-stop",
            pattern: { kind: "algebraic", latex: "3(x^2-7x+10)" },
            feedback: "The common factor earns the first mark. The bracket is still a factorisable quadratic, and 'fully' asks for the rest.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M4:Q10",
          },
          {
            misconception: "maths.factorising.not-fully-factorised",
            pattern: { kind: "algebraic", latex: "(3x-6)(x-5)" },
            feedback: "Correct when expanded, but the 3 is still hidden inside the first bracket. Take the number out to the front so the two brackets are as simple as they can be.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2025-summer:M4:Q10",
          },
        ],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0010`, topic: T, specRefs: REF, style: "exam-style", difficulty: 4,
    commandWords: ["Show that", "Factorise"], setting: "A rectangular garden path: forming a quadratic, then factorising it",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q25", "ccea-cer:maths:2025-november:M3:Q28"],
    solutionProgram: "(x+4)(x+9) = x^2 + 13x + 36, checked at x = 2, -3, 0.5; factorising back gives (x+4)(x+9); the second part factorises x^2 + 13x + 42 = (x+6)(x+7) since 6*7 = 42 and 6+7 = 13",
    parts: [
      {
        id: "a", verb: "show-that", marks: 2,
        stem: "A rectangular patio is $(x + 4)$ metres long and $(x + 9)$ metres wide.\n\nShow that its area, in square metres, is $x^2 + 13x + 36$.",
        answer: algAnswer("x^2 + 13x + 36", { mustBeExpanded: true }),
        scheme: [
          MA("MA1", 1, "(x + 4)(x + 9) written down and three of the four products correct"),
          A("A1", 1, "x² + 9x + 4x + 36 collected to reach the printed result", { dependsOn: ["MA1"] }),
        ],
        hints: ["Area is length × width, so start by writing the product.", "$x \\times 9 = 9x$ and $4 \\times x = 4x$.", "A 'show that' must end on the printed line, with every step visible."],
        workedSolution: "Area $= (x+4)(x+9) = x^2 + 9x + 4x + 36 = x^2 + 13x + 36$ square metres, as required.",
        commonErrors: [{
          misconception: "maths.quadratics.show-that-fudged",
          pattern: { kind: "algebraic", latex: "x^2 + 36" },
          feedback: "Only the two corner products were used. A 'show that' has to reach the printed line by a forward chain, and the $13x$ comes from the two middle products.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M3:Q25",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "A different patio has area $x^2 + 13x + 42$ square metres.\n\nFactorise $x^2 + 13x + 42$ to find expressions for its length and width.",
        answer: algAnswer("(x+6)(x+7)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "one correct bracket, (x + 6) or (x + 7)"), A("A2", 1, "(x + 6)(x + 7)")],
        hints: ["Two numbers multiplying to 42 and adding to 13.", "Pairs of 42: 1 and 42, 2 and 21, 3 and 14, 6 and 7.", "Both positive, since both the middle term and the constant are positive."],
        workedSolution: "$6 \\times 7 = 42$ and $6 + 7 = 13$, so $x^2 + 13x + 42 = (x + 6)(x + 7)$: the sides are $(x + 6)$ m and $(x + 7)$ m.",
        commonErrors: [
          {
            misconception: "maths.factorising.sign-errors-in-brackets",
            pattern: { kind: "algebraic", latex: "(x+3)(x+14)" },
            feedback: "The product is 42, so the search is on the right track, but $3 + 14 = 17$, not 13. Work through the pairs in order and test the sum each time.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M3:Q28",
          },
          {
            misconception: "maths.alg-fractions.treat-expression-as-equation",
            pattern: { kind: "text", regex: "x\\s*=\\s*-?\\s*(6|7)" },
            feedback: "Those are the solutions of $x^2 + 13x + 42 = 0$, which is a different question and would give negative lengths. Factorise means write the expression as a product.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M3:Q25",
          },
        ],
        requiresWorking: false,
      },
    ],
  }),
];
expect("q0010b pair", 6 * 7, 42);
expect("q0010b sum", 6 + 7, 13);
assertNoFailures("t4 questions");

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T, specRefs: REF,
    stem: "Daire was asked to factorise $x^2 - 2x - 48$. His working:",
    studentWorking: [
      "Two numbers that multiply to −48 and add to −2",
      "6 × 8 = 48 and 8 − 6 = 2",
      "So x² − 2x − 48 = (x + 8)(x − 6)",
    ],
    mistakeLine: 3,
    misconception: "maths.factorising.sign-errors-in-brackets",
    whatWentWrong: "The pair 6 and 8 is correct, but the signs went the wrong way round. $(x + 8)(x - 6)$ expands to $x^2 + 2x - 48$. The middle term is $-2x$, so the larger number, 8, must be the negative one.",
    correction: [
      "Two numbers that multiply to −48 and add to −2",
      "−8 × 6 = −48 and −8 + 6 = −2",
      "So x² − 2x − 48 = (x − 8)(x + 6)",
    ],
    marksEarnedAsWritten: ["A1"],
    feedback: "Finding the pair 6 and 8 is the harder half, and one bracket, $(x - 6)$, is not the one that matches, so a single accuracy mark is realistic here. The rule that fixes it: when the constant is negative, the number that carries the sign of the middle term is the **larger** one. November 2025 M3 Q28 was reported as about a third correct, with muddled signs the usual cause. Multiplying the brackets back takes five seconds and always catches it.",
    source: "ccea-cer:maths:2025-november:M3:Q28",
  },
];
const chk = equiv("ftm check", "(x-8)*(x+6)", "x**2 - 2*x - 48", P);
const chkWrong = equiv("ftm wrong form", "(x+8)*(x-6)", "x**2 + 2*x - 48", P);
assertNoFailures("t4 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", REF, "procedure", "To factorise $x^2 + bx + c$, what two conditions must your pair of numbers satisfy?",
    "They multiply to $c$ and add to $b$. Both conditions at once — a pair that gives the right product but the wrong sum is no use.",
    ["multiply to c", "add to b"], 3),
  rp(T, "02", REF, "trap", "What do the signs of $b$ and $c$ tell you before you start searching?",
    "If $c$ is positive the two numbers share a sign, and that sign is the sign of $b$. If $c$ is negative they have opposite signs, and the larger number takes the sign of $b$.",
    ["same sign", "opposite signs", "larger takes the sign of b"], 5),
  rp(T, "03", REF, "trap", "Why is the letter in the brackets not always $x$?",
    "Because the question chooses the letter. A quadratic in $c$ factorises into brackets in $c$; switching to $x$ costs a mark even when the numbers are right.",
    ["same letter", "mark lost"], 6),
  rp(T, "04", REF, "trap", "The command is 'Factorise fully'. What extra step does 'fully' demand?",
    "Take out any common numerical factor first, and leave it in front: $2x^2 + 10x - 48 = 2(x + 8)(x - 3)$. Stopping at $2(x^2 + 5x - 24)$, or hiding the 2 inside a bracket, both lose marks.",
    ["common factor", "in front", "2(x + 8)(x − 3)"], 6),
  rp(T, "05", REF, "trap", "'Factorise $x^2 - x - 20$' — what must the answer NOT contain?",
    "An equals sign. Factorising produces a product, $(x - 5)(x + 4)$; setting it equal to zero or giving $x = 5$ and $x = -4$ answers a different question.",
    ["product", "no equals sign", "not solved"], 6),
  rp(T, "06", REF, "procedure", "How do you check a factorisation in five seconds?",
    "Multiply the brackets back mentally: the two middle products must give the $x$ term and the two constants must give $c$. A sign slip shows up immediately in the middle term.",
    ["multiply back", "middle term"], 4),
  rp(T, "07", REF, "novel-example", "Factorise $x^2 - 13x + 40$.",
    "$(x - 5)(x - 8)$, since $-5 \\times -8 = 40$ and $-5 - 8 = -13$.",
    ["(x − 5)(x − 8)"], 5),
  rp(T, "08", REF, "novel-example", "Factorise $n^2 + 2n - 63$.",
    "$(n + 9)(n - 7)$, since $9 \\times -7 = -63$ and $9 - 7 = 2$.",
    ["(n + 9)(n − 7)"], 6),
];

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed by expansion: (x − 3)(x − 4) = x² − 7x + 12; factor pairs of 12 give sums 13, 8, 7; (x + 7)(x − 4) = x² + 3x − 28; 2(x + 8)(x − 3) = 2x² + 10x − 48; (x + 7)² = x² + 14x + 49; t(t − 6) = t² − 6t.",
    examiner: "Traps drawn from the taxonomy examinerEvidence for M3-NA-06 and the factorising findings on packs/maths/insights/m3.solving-quadratic-equations-by-factorising.json: Summer 2025 M3 Q25 (about 30% correct), November 2025 M3 Q28 (about a third; muddled signs; brackets written in x), Summer 2025 M4 Q10 (only 4 taken out instead of 4a), November 2025 M4 Q13 (letter and signs).",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, {
    ...base,
    numeric: C.b + "; factor pairs of 12: (1,12) sum 13, (2,6) sum 8, (3,4) sum 7, (−3,−4) sum −7. Twin: " + C.p,
    examiner: "Built on November 2025 M3 Q28, where sign confusion was the reported cause of loss.",
  }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, {
    ...base,
    numeric: C.i + "; twin " + C.o,
    examiner: "Built on Summer 2025 M4 Q10, where taking out only part of a common factor scored nothing for the first part.",
  }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "Pairs checked: 4 × 5 = 20 with sum 9; 2 × 10 = 20 with sum 12; (x − 9)(x + 4) = x² − 5x − 36; (x + 9)(x − 4) = x² + 5x − 36; 3(x − 2)(x − 5) = 3x² − 21x + 30; (c + 5)(c + 6) = c² + 11c + 30; (x − 5)(x + 4) = x² − x − 20.",
    examiner: "Distractors are registry misconceptions from the factorising findings: sign-errors-in-brackets, wrong-variable-letter, not-fully-factorised, common-factor-then-stop, treat-expression-as-equation.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the reported sign, letter and 'fully' errors.",
  })),
  ...findTheMistake.map((f) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: chk + "; the written (incorrect) form: " + chkWrong,
    examiner: f.source + " — the wrong line is the reported sign swap.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Prompt answers recomputed: (x − 5)(x − 8) = x² − 13x + 40 and (n + 9)(n − 7) = n² + 2n − 63, each checked at three values.",
    examiner: "Prompts cover the product-and-sum rule, the sign reading, the letter, 'fully' and the no-equals-sign presentation rule.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "Factorising ax² + bx + c where a is not 1 and cannot be taken out as a common factor — that is M4",
  "Solving the equation once it is factorised is statement M3-NA-11, a separate topic; 'Factorise' on its own never asks for a solution",
  "Completing the square, and factorising expressions that need surds, are outside this statement",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Factorising quadratics of the form x² + bx + c",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: [
      "maths.m3.identities-and-expanding-double-brackets",
      "maths.m2.expanding-and-factorising-with-a-single-term",
    ],
    order: 98,
    hardness: "S",
    difficulty: 3,
    examinerFlagged: false,
    examinerSources: [
      "ccea-cer:maths:2025-summer:M3:Q25",
      "ccea-cer:maths:2025-november:M3:Q28",
      "ccea-cer:maths:2025-summer:M4:Q10",
      "ccea-cer:maths:2025-november:M4:Q13",
    ],
    examWeightHint:
      "One item almost every series, 2 marks, near the end of M3 — usually the second part of a two-part 'Factorise' question whose first part is a single-term common factor (Summer 2025 Q25, Summer 2026 Q25). A standalone 2-mark version appears at Q28 (November 2025). Success is reported at about 30% in M3 and much higher in M4, where the same skill opens the paper.",
    mustMemorise: [
      "Two numbers that multiply to c and add to b",
      "c positive → the numbers share a sign, and it is the sign of b; c negative → opposite signs, and the larger takes the sign of b",
      "'Fully' means take out the common numerical factor first and leave it in front",
      "Use the letter the question uses, in both brackets",
      "Factorise means write as a product — never set the expression equal to zero",
    ],
    onFormulaSheet: [],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["factorise quadratic", "x² + bx + c", "double brackets", "monic quadratic", "factor pairs", "factorise fully"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Factorising x² + bx + c",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [],
      mustKnow: [
        "Product c, sum b",
        "c positive → same signs (the sign of b); c negative → opposite signs, larger takes the sign of b",
        "'Fully' means the common factor comes out first",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "S",
    examinerFlagged: false,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Factorise a quadratic x² + bx + c into two brackets by finding two numbers with product c and sum b",
        "Decide the signs from b and c before searching, rather than by trial",
        "List factor pairs in order and test the sum of each, instead of guessing",
        "Factorise fully: take out a numerical common factor first and write it in front of the brackets",
        "Recognise a perfect square such as x² + 14x + 49 and an expression with no constant term such as t² − 6t",
        "Use the letter the question uses",
        "Check by multiplying the brackets back, especially the middle term",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks), and again without a calculator in M7 Paper 1. One 2-mark item near the end of the paper, very often part (b) of a 'Factorise' question whose part (a) is a single-term common factor. Schemes mark it A1 A1: one mark for a correct bracket, the second for the full factorisation, so a half-right answer still scores. 'Factorise fully' with a common factor runs to 3 marks.",
      traps: [
        "Muddled signs: (x + 7)(x − 4) written where (x − 7)(x + 4) is needed — reported as the usual cause in November 2025 M3 Q28, where only about a third succeeded",
        "Writing the brackets in x when the question is set in another letter, which costs a mark (November 2025 M3 Q28 and M4 Q13)",
        "Not seeing that two brackets are needed at all, and offering a single bracket (November 2025 M3 Q28)",
        "Taking out only part of a common factor — 4 instead of 4a — which scored nothing in Summer 2025 M4 Q10",
        "Stopping at 2(x² + 5x − 24) when the command says fully, or hiding the common factor inside a bracket as (2x + 16)(x − 3)",
        "Answering with solutions, or with '= 0', when only a factorisation was asked for",
      ],
    },
    verification: `ver.note.${T}`,
    version: 1,
    updated: TODAY,
  },
  workedExamples, diagnostics, questions, findTheMistake, prompts,
  sets: [
    {
      id: `set.${T}.warm-up`, topic: T, kind: "interleaved",
      title: "Product c, sum b",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0002`, `rp.${T}.02`, `q.${T}.0003`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Signs, letters and factorising fully",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0004`, `q.${T}.0005`, `ftm.${T}.01`, `q.${T}.0007`, `q.${T}.0009`, `q.${T}.0010`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Factorising x² + bx + c" },
  {
    type: "callout", kind: "spec", title: "The statement",
    md: "**M3-NA-06** — factorise quadratic expressions of the form $x^2 + bx + c$.\nThe Teacher Guidance gives the shape of it: $x^2 - 8x + 15 = (x - 3)(x - 5)$.",
    source: "CCEA GCSE Mathematics specification, statement M3-NA-06 with its Teacher Guidance",
  },
  {
    type: "p",
    md: "Factorising is expanding run backwards. You already know that $(x - 3)(x - 4)$ gives $x^2 - 7x + 12$; this topic starts from the $x^2 - 7x + 12$ and asks for the brackets. It is worth two marks on its own, and it is the gateway to solving quadratics, simplifying algebraic fractions and everything built on them. About 30% of M3 candidates get it right; almost all of the loss is signs.",
  },
  { type: "h", text: "The rule, and why it is the rule" },
  {
    type: "p",
    md: "Expand $(x + p)(x + q)$ and look at what comes out:\n$(x + p)(x + q) = x^2 + qx + px + pq = x^2 + (p + q)x + pq$.\nSo the coefficient of $x$ is $p + q$ and the constant is $pq$. Reading that backwards gives the whole method: **find two numbers that multiply to $c$ and add to $b$.**",
  },
  noteFigure(reverseGridBody, reverseGridAlt, 660, 296,
    "The grid with its corners filled in: the middle cells must add to the x term", "reverse-grid-factorise"),
  {
    type: "gate", id: "g1", kind: "blank",
    prompt: "For $x^2 + 9x + 20$, the two numbers are",
    answer: "4 and 5",
    explain: "$4 \\times 5 = 20$ and $4 + 5 = 9$.",
  },
  { type: "h", text: "Read the signs first, then search" },
  {
    type: "p",
    md: "Most of the errors here are sign errors, and almost all of them are avoidable by deciding the signs **before** looking for numbers.\n**$c$ positive** → the two numbers have the same sign, and it is the sign of $b$. ($x^2 - 7x + 12$: both negative.)\n**$c$ negative** → the two numbers have opposite signs, and the **larger** one carries the sign of $b$. ($x^2 + 3x - 28$: $+7$ and $-4$.)\nThat single decision halves the search and removes the guesswork.",
  },
  {
    type: "gate", id: "g2", kind: "choice",
    prompt: "In $x^2 - 5x - 36$, what are the signs of the two numbers?",
    options: ["One positive, one negative, with the negative one larger", "Both negative", "Both positive"],
    answer: "One positive, one negative, with the negative one larger",
    explain: "$c$ is negative so the signs differ; $b$ is negative so the larger number is the negative one, giving $(x - 9)(x + 4)$.",
  },
  { type: "h", text: "List the pairs, do not guess" },
  {
    type: "p",
    md: "For $x^2 - 7x + 12$: the constant is $+12$ and the middle term is negative, so both numbers are negative. Write the factor pairs of 12 in order and test the sums.",
  },
  noteFigure(tableBody, tableAlt, 640, 250,
    "Factor pairs of 12 and their sums; only minus 3 and minus 4 give minus 7", "factor-pair-table"),
  {
    type: "p",
    md: "$x^2 - 7x + 12 = (x - 3)(x - 4)$.\nAn ordered list is quicker than guessing and it never misses a pair. When $b$ is small, the two numbers are close together: for $x^2 + x - 56$ they differ by 1, which points straight at 7 and 8.",
  },
  {
    type: "gate", id: "g3", kind: "blank",
    prompt: "Factorise $x^2 + 3x - 28$.",
    answer: "(x + 7)(x − 4)",
    explain: "$7 \\times -4 = -28$ and $7 - 4 = 3$.",
  },
  {
    type: "callout", kind: "examiner", title: "November 2025 M3 Q28",
    md: "About a third succeeded. Many did not see that two brackets were needed at all; of those who did, the signs were muddled; and some wrote the brackets in $x$ when the quadratic was in $c$, which cost a mark on its own.",
    source: "ccea-cer:maths:2025-november:M3:Q28",
  },
  { type: "h", text: "Use the letter in front of you" },
  {
    type: "p",
    md: "If the question says $c^2 + 11c + 30$, the answer is $(c + 5)(c + 6)$. Writing $(x + 5)(x + 6)$ is the right maths in the wrong language and it loses the accuracy mark. Copy the letter out of the question into both brackets before you start.",
  },
  {
    type: "gate", id: "g4", kind: "blank",
    prompt: "Factorise $k^2 - 2k - 35$.",
    answer: "(k − 7)(k + 5)",
    explain: "Opposite signs, difference 2; the larger, 7, takes the minus because $b$ is negative.",
  },
  { type: "h", text: "Factorise fully" },
  {
    type: "p",
    md: "When 'fully' appears, look for a number that divides every term and take it out first:\n$2x^2 + 10x - 48 = 2(x^2 + 5x - 24) = 2(x + 8)(x - 3)$.\nTwo different half-answers lose marks here. **Stopping** at $2(x^2 + 5x - 24)$ leaves a quadratic that still factorises. **Hiding** the 2 inside, as $(2x + 16)(x - 3)$, expands correctly but is not fully factorised, because $(2x + 16)$ still has a 2 in it.\nTwo shapes are not double brackets at all: $t^2 - 6t = t(t - 6)$ has no constant term, so a letter comes out; and $x^2 + 14x + 49 = (x + 7)^2$ is a perfect square, where the two brackets turn out the same.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q10",
    md: "Taking out only 4 instead of 4a scored nothing for that part. A common factor has to include every factor the terms share, letters as well as numbers.",
    source: "ccea-cer:maths:2025-summer:M4:Q10",
  },
  {
    type: "gate", id: "g5", kind: "choice",
    prompt: "Factorise fully $3x^2 - 21x + 30$.",
    options: ["$3(x - 2)(x - 5)$", "$3(x^2 - 7x + 10)$", "$(3x - 6)(x - 5)$"],
    answer: "$3(x - 2)(x - 5)$",
    explain: "The second stops too early; the third leaves the 3 inside a bracket.",
  },
  { type: "h", text: "Factorise is not solve" },
  {
    type: "p",
    md: "'Factorise $x^2 - x - 20$' asks for $(x - 5)(x + 4)$ and nothing else. Writing $(x - 5)(x + 4) = 0$, or $x = 5$ and $x = -4$, answers a question that was not asked, and the extra line can cost the mark. Solving comes in the next topic, where the equation is given with an $= 0$ already in place.",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** product $c$, sum $b$; the sign rules; 'fully' means the common factor comes out to the front; the answer is a product, in the question's letter, with no equals sign.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "M3-NA-06 is $x^2 + bx + c$ — the $x^2$ has coefficient 1, or becomes 1 after a common factor is removed. Quadratics like $6x^2 - 17x + 12$, where the 6 will not come out, are **M4**. Completing the square is not in M3 either.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "Expect one 2-mark item near the end of M3, most often part (b) of a 'Factorise' question whose part (a) takes out a single-term common factor. Both marks are accuracy marks and they are given one per bracket, so a partly right answer still scores — write something down.\nThe **first** mark is a correct bracket; the **second** is the complete product, in the right letter, fully factorised. If you are stuck, write the pair you are testing and the sum it gives: the search itself shows the marker what you are doing. And always multiply back: the middle term is the five-second check that catches a sign slip.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.02` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.05` },
];

assertNoFailures("t4 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
