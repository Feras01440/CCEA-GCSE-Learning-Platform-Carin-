/** maths.m3.difference-of-two-squares — H bundle (difficulty 4). */
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, equiv, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.difference-of-two-squares";
const SLUG = "difference-of-two-squares";
const REF = ["M3-NA-07"];
const CER = (yr, series) =>
  `https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/${yr}/GCSE%20Mathematics%20%282017%29-${series}${yr}-Report_0.pdf`;

// ---------------------------------------------------------------- symbolic checks
const P = [{ x: 2 }, { x: -3 }, { x: 0.5 }];
const at = (v) => [{ [v]: 2 }, { [v]: -3 }, { [v]: 0.5 }];
const ab = [{ a: 2, b: 3 }, { a: -1, b: 4 }, { a: 0.5, b: -2 }];
const C = {
  a: equiv("x²-49", "(x+7)*(x-7)", "x**2 - 49", P),
  b: equiv("y²-121", "(y+11)*(y-11)", "y**2 - 121", at("y")),
  c: equiv("36-p²", "(6+p)*(6-p)", "36 - p**2", at("p")),
  cTrap: equiv("(p+6)(p-6)", "(p+6)*(p-6)", "p**2 - 36", at("p")),
  d: equiv("100-w²", "(10+w)*(10-w)", "100 - w**2", at("w")),
  e: equiv("4x²-81", "(2*x+9)*(2*x-9)", "4*x**2 - 81", P),
  f: equiv("9m²-64", "(3*m+8)*(3*m-8)", "9*m**2 - 64", at("m")),
  g: equiv("25a²-4b²", "(5*a+2*b)*(5*a-2*b)", "25*a**2 - 4*b**2", ab),
  h: equiv("5x²-45", "5*(x+3)*(x-3)", "5*x**2 - 45", P),
  i: equiv("2y²-50", "2*(y+5)*(y-5)", "2*y**2 - 50", at("y")),
  j: equiv("3x²-108", "3*(x+6)*(x-6)", "3*x**2 - 108", P),
  k: equiv("x²/4-9", "(x/2+3)*(x/2-3)", "x**2/4 - 9", P),
  l: equiv("49-16t²", "(7+4*t)*(7-4*t)", "49 - 16*t**2", at("t")),
  m: equiv("(x²-16)/(x+4)", "(x+4)*(x-4)", "x**2 - 16", P),
  n: equiv("a²-9b²", "(a+3*b)*(a-3*b)", "a**2 - 9*b**2", ab),
  o: equiv("8x²-2", "2*(2*x+1)*(2*x-1)", "8*x**2 - 2", P),
  p: equiv("x²-1", "(x+1)*(x-1)", "x**2 - 1", P),
  q: equiv("64-9k²", "(8+3*k)*(8-3*k)", "64 - 9*k**2", at("k")),
};
// Arithmetic uses of the identity
expect("83²-17²", 83 ** 2 - 17 ** 2, 6600);
expect("(83+17)(83-17)", 100 * 66, 6600);
expect("45²-35²", 45 ** 2 - 35 ** 2, 800);
expect("(45+35)(45-35)", 80 * 10, 800);
expect("101²-99²", 101 ** 2 - 99 ** 2, 400);
expect("(101+99)(101-99)", 200 * 2, 400);
expect("57²-43²", 57 ** 2 - 43 ** 2, 1400);
expect("(57+43)(57-43)", 100 * 14, 1400);
assertNoFailures("t5 symbolic");

// ---------------------------------------------------------------- figures
const proofBody = `
<g fill='none' stroke='currentColor' stroke-width='1.7'>
  <path d='M40 46 L260 46 L260 156 L180 156 L180 266 L40 266 Z'/>
</g>
<g fill='currentColor' fill-opacity='0.09' stroke='none'>
  <path d='M40 46 L260 46 L260 156 L180 156 L180 266 L40 266 Z'/>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.1' stroke-dasharray='5 4'>
  <path d='M180 46 L180 156'/><path d='M180 156 L260 156'/>
</g>
<g ${TXT} font-size='15' text-anchor='middle'>
  <text x='150' y='32'>a</text><text x='222' y='140'>b</text>
  <text x='110' y='300'>a² - b²: a square with a b by b corner removed</text>
</g>
<g ${TXT} font-size='15' text-anchor='end'><text x='30' y='160'>a</text></g>
<g ${TXT} font-size='26' text-anchor='middle'><text x='320' y='165'>=</text></g>
<g fill='currentColor' fill-opacity='0.09' stroke='currentColor' stroke-width='1.7'>
  <rect x='380' y='90' width='300' height='130'/>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.1' stroke-dasharray='5 4'>
  <path d='M600 90 L600 220'/>
</g>
<g ${TXT} font-size='15' text-anchor='middle'>
  <text x='530' y='76'>a + b</text>
  <text x='530' y='250'>the two pieces slid together</text>
  <text x='530' y='300'>(a + b)(a - b)</text>
</g>
<g ${TXT} font-size='15' text-anchor='start'><text x='692' y='160'>a - b</text></g>`;
const proofAlt =
  "On the left, a square of side a with a smaller square of side b cut out of its bottom right corner, labelled a squared minus b squared. On the right, the same two pieces slid together to form a rectangle of width a + b and height a minus b, labelled (a + b)(a - b).";
const proofFig = svgFig(proofBody, proofAlt, 760, 316);

const orderBody = `
<g ${MATHTXT} font-size='23' text-anchor='start'>
  <text x='30' y='58'>36 - p²</text>
  <text x='250' y='58'>= (6 + p)(6 - p)</text>
  <text x='30' y='150'>p² - 36</text>
  <text x='250' y='150'>= (p + 6)(p - 6)</text>
</g>
<g ${TXT} font-size='16' text-anchor='start'>
  <text x='500' y='58'>first term stays first</text>
  <text x='500' y='150'>a different expression</text>
  <text x='30' y='222'>the two differ by a factor of -1: (p + 6)(p - 6) = -(36 - p²)</text>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.4'>
  <path d='M20 84 L720 84'/>
  <path d='M20 180 L720 180'/>
</g>`;
const orderAlt =
  "Two lines contrasted. 36 minus p squared factorises as (6 + p)(6 - p), keeping the first term first. p squared minus 36 factorises as (p + 6)(p - 6). A note says the two differ by a factor of minus one.";
const orderFig = svgFig(orderBody, orderAlt, 740, 240);

// ---------------------------------------------------------------- insight (built from the taxonomy examinerEvidence for M3-NA-07)
const insight = {
  id: `ins.${T}`,
  topic: T,
  specRefs: REF,
  findings: [
    {
      source: "ccea-cer:maths:2025-summer:M4:Q20",
      url: CER(2025, "Summer"),
      asked: "Simplify an algebraic fraction whose denominator is a difference of two squares.",
      wentWrong: "The difference of two squares went wrong whenever the letter was not the first term: candidates swapped the terms round and factorised as though the square of the letter came first.",
      fullMarkAnswersDid: "Kept the terms in the order given, so a number squared minus a letter squared became (number + letter)(number - letter), and then cancelled whole brackets.",
      rule: "Factorise in the order written: 25 - w² is (5 + w)(5 - w), not (w + 5)(w - 5).",
      misconceptions: ["maths.factorising.dots-term-order"],
    },
    {
      source: "ccea-cer:maths:2024-summer:M4:Q18",
      url: CER(2024, "Summer"),
      asked: "A harder difference of two squares involving three letters.",
      wentWrong: "Under a tenth reached full marks on the harder part. The squared coefficients were the obstacle: candidates did not recognise that a term such as 25a² is (5a)², so the brackets came out without their coefficients.",
      rule: "Square-root each term completely, coefficient included: 25a² - 4b² = (5a + 2b)(5a - 2b).",
      misconceptions: ["maths.factorising.not-fully-factorised", "maths.factorising.sign-errors-in-brackets"],
    },
    {
      source: "ccea-cer:maths:2023-summer:M4:Q19",
      url: CER(2023, "Summer"),
      asked: "A difference of two squares with a fractional coefficient, inside a quadratic in several variables.",
      wentWrong: "The majority scored zero. A fractional coefficient stopped candidates recognising the pattern at all.",
      rule: "A fraction can still be a square: x²/4 - 9 = (x/2 + 3)(x/2 - 3).",
      misconceptions: ["maths.factorising.dots-fractional-coefficient"],
    },
    {
      source: "ccea-cer:maths:2025-summer:M4:Q10",
      url: CER(2025, "Summer"),
      asked: "Factorise fully, taking out a common factor before using the difference of two squares.",
      wentWrong: "Taking out only the number and not the letter scored nothing for that part; others stopped once the common factor was outside and never factorised the bracket.",
      rule: "Common factor out first, and then check whether what is left is still a difference of two squares.",
      misconceptions: ["maths.factorising.common-factor-then-stop", "maths.factorising.not-fully-factorised"],
    },
  ],
  ruleToRemember:
    "a² - b² = (a + b)(a - b): take a whole common factor out first, square-root each remaining term including its coefficient, and keep the terms in the order the question wrote them.",
  aStarSignal:
    "Spotting the pattern when it is disguised — a coefficient that is a perfect square, a fraction, or a second letter — and taking the common factor out before the pattern becomes visible.",
};

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statement M3-NA-07. The core is a² − b² with a common factor taken out first; the harder disguises (a squared coefficient, a second letter, a fractional coefficient) are the same statement as re-examined in M4 and are labelled as such. Sums of two squares, which do not factorise, are used only as a contrast.",
  formula: "Nothing on the Higher formula sheet applies; a² − b² = (a + b)(a − b) is a must-know identity.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Factorise, Factorise fully, Work out, Explain, Simplify, Show that).",
  tariff: "Tariffs match the corpus: a bare difference of two squares is 1-2 marks; 'factorise fully' with a common factor first is 2-3 marks; a disguised version with coefficients or two letters is 2-3 marks late in M4.",
  copy: "Compared by hand against the M3 and M4 papers and schemes read for this batch (Summer 2025 M3 Q25, November 2025 M3 Q28, Summer 2026 M3 Q25, Summer 2024 M3 Q25): every expression here is new and no eight-word sequence is in common.",
  symbolic: "Each factorisation verified by expanding the bracketed form and comparing with the original at three sample points, and each arithmetic use verified by computing both sides exactly.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Factorise $36 - p^2$.",
    figure: orderFig,
    steps: [
      {
        n: 1,
        working: "Two terms, both squares, with a minus between them: $36 = 6^2$ and $p^2 = p \\times p$. So it fits $a^2 - b^2$ with $a = 6$ and $b = p$.",
        decision: "Two terms and a minus sign is the signal. Check both terms really are squares before reaching for the identity — $36 - p^3$ would not qualify.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$a^2 - b^2 = (a + b)(a - b)$, so $36 - p^2 = (6 + p)(6 - p)$.",
        decision: "The **first** term of the expression stays first inside both brackets. Here that is the 6, not the $p$.",
        whyMenu: {
          options: [
            "$(p + 6)(p - 6)$ would expand to $p^2 - 36$, which is the negative of what was asked",
            "$(p + 6)(p - 6)$ is the same thing written the other way round",
            "Either order is accepted because multiplication can be done in any order",
          ],
          correct: 0,
          explain: "Swapping the terms changes the sign of the whole expression: $p^2 - 36 = -(36 - p^2)$.",
        },
        earns: ["A1"],
      },
      {
        n: 3,
        working: "Check: $(6 + p)(6 - p) = 36 - 6p + 6p - p^2 = 36 - p^2$.",
        decision: "The two middle terms always cancel — that is exactly why the identity has no middle term. Seeing them cancel is the confirmation.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$(6 + p)(6 - p)$",
    twin: {
      stem: "Factorise $100 - w^2$.",
      answer: algAnswer("(10+w)(10-w)", { variables: ["w"], mustBeFactorised: true }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3] }, { showSteps: 1, studentSupplies: [2, 3] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Factorise fully $5x^2 - 45$.",
    steps: [
      {
        n: 1,
        working: "$5x^2 - 45 = 5(x^2 - 9)$",
        decision: "Look for a common factor before anything else. $5x^2 - 45$ is **not** a difference of two squares as it stands, because $5x^2$ is not a perfect square; taking the 5 out reveals one.",
        whyMenu: {
          options: [
            "Because 5 divides both 5x² and 45, and what is left, x² − 9, is a difference of two squares",
            "Because a 5 always comes out when the first coefficient is 5",
            "Because 5x² − 45 factorises directly as (√5 x + 3)(√5 x − 3)",
          ],
          correct: 0,
          explain: "The common factor is the first move of 'factorise fully', and here it uncovers the pattern.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$x^2 - 9 = x^2 - 3^2 = (x + 3)(x - 3)$",
        decision: "Now the bracket is $a^2 - b^2$ with $a = x$ and $b = 3$. The letter is first this time, so the brackets start with $x$.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$5x^2 - 45 = 5(x + 3)(x - 3)$",
        decision: "The 5 stays out in front. Stopping at $5(x^2 - 9)$ leaves a factorisable bracket, and the command said fully.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$5(x + 3)(x - 3)$",
    twin: {
      stem: "Factorise fully $2y^2 - 50$.",
      answer: algAnswer("2(y+5)(y-5)", { variables: ["y"], mustBeFactorised: true }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3] }, { showSteps: 0, studentSupplies: [1, 2, 3] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
  {
    id: `we.${T}.03`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Factorise $25a^2 - 4b^2$.",
    steps: [
      {
        n: 1,
        working: "Is each term a square? $25a^2 = (5a)^2$ because $5a \\times 5a = 25a^2$. And $4b^2 = (2b)^2$.",
        decision: "The coefficient is part of the square. Square-rooting a term means square-rooting the number **and** the letter: $\\sqrt{25a^2} = 5a$.",
        whyMenu: {
          options: [
            "$(5a)^2 = 5a \\times 5a = 25a^2$, so 5a is the complete square root",
            "$\\sqrt{25a^2} = 25a$, because only the letter is rooted",
            "$\\sqrt{25a^2} = 5a^2$, because only the number is rooted",
          ],
          correct: 0,
          explain: "Squaring multiplies the coefficient by itself and the letter by itself, so rooting undoes both.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$a^2 - b^2$ pattern with $5a$ and $2b$: $25a^2 - 4b^2 = (5a + 2b)(5a - 2b)$.",
        decision: "Same identity, bigger pieces. Both coefficients travel into the brackets.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "Check: $(5a + 2b)(5a - 2b) = 25a^2 - 10ab + 10ab - 4b^2 = 25a^2 - 4b^2$.",
        decision: "The middle terms cancel again, which is the sign that the identity has been used correctly rather than a general double bracket.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$(5a + 2b)(5a - 2b)$",
    twin: {
      stem: "Factorise $49 - 16t^2$.",
      answer: algAnswer("(7+4t)(7-4t)", { variables: ["t"], mustBeFactorised: true }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3] }, { showSteps: 2, studentSupplies: [3] }],
    verification: `ver.we.${T}.03`,
    version: 1,
  },
];

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`, topic: T, specRefs: REF, when: "pre",
    items: [
      dxItem("01", "Factorise $x^2 - 49$.", "Recognise and factorise the basic pattern",
        [
          ["$(x + 7)(x - 7)$", true, null, "Two squares with a minus between them: $a^2 - b^2 = (a + b)(a - b)$ with $a = x$, $b = 7$."],
          ["$(x - 7)(x - 7)$", false, "maths.factorising.sign-errors-in-brackets", "That expands to $x^2 - 14x + 49$. One bracket takes a plus and one a minus, so the middle terms cancel."],
          ["$(x + 7)^2$", false, "maths.algebra.expand-squared-bracket", "That expands to $x^2 + 14x + 49$. A difference of two squares has no middle term at all."],
        ], 20),
      dxItem("02", "Factorise $36 - p^2$.", "Keep the terms in the order they are written",
        [
          ["$(6 + p)(6 - p)$", true, null, "The 6 is the first term, so it stays first in both brackets. Expanding gives $36 - p^2$."],
          ["$(p + 6)(p - 6)$", false, "maths.factorising.dots-term-order", "That expands to $p^2 - 36$, the negative of what was asked. Summer 2025 M4 Q20 reported exactly this reordering."],
          ["$(6 - p)^2$", false, "maths.algebra.expand-squared-bracket", "That expands to $36 - 12p + p^2$, which has a middle term."],
        ], 30),
      dxItem("03", "Which of these is **not** a difference of two squares?", "Test whether the pattern applies",
        [
          ["$x^2 + 25$", true, null, "A sum, not a difference. $x^2 + 25$ does not factorise at all with real numbers, and no amount of rearranging changes that."],
          ["$x^2 - 25$", false, "maths.factorising.sign-errors-in-brackets", "This is the pattern: $(x + 5)(x - 5)$."],
          ["$9 - y^2$", false, "maths.factorising.dots-term-order", "This is the pattern too, written with the number first: $(3 + y)(3 - y)$."],
        ], 30),
      dxItem("04", "Factorise $4x^2 - 81$.", "Handle a squared coefficient",
        [
          ["$(2x + 9)(2x - 9)$", true, null, "$4x^2 = (2x)^2$ and $81 = 9^2$. The coefficient is square-rooted along with the letter."],
          ["$(4x + 9)(4x - 9)$", false, "maths.factorising.not-fully-factorised", "That expands to $16x^2 - 81$. The square root of $4x^2$ is $2x$, not $4x$."],
          ["$(2x + 81)(2x - 81)$", false, "maths.factorising.not-fully-factorised", "The 81 was not square-rooted. Both terms have to be rooted before they go into the brackets."],
        ], 35),
      dxItem("05", "Factorise fully $3x^2 - 108$.", "Take out the common factor before the identity",
        [
          ["$3(x + 6)(x - 6)$", true, null, "3 divides both terms, leaving $x^2 - 36$, which is the pattern with $a = x$ and $b = 6$."],
          ["$3(x^2 - 36)$", false, "maths.factorising.common-factor-then-stop", "The common factor is out and that is the method mark. The bracket is still a difference of two squares, and 'fully' asks for it."],
          ["$(\\sqrt{3}x + \\sqrt{108})(\\sqrt{3}x - \\sqrt{108})$", false, "maths.factorising.not-fully-factorised", "Correct in form but not in the spirit of a GCSE factorisation. Take the number out first and the brackets stay whole-number."],
        ], 40),
      dxItem("06", "Factorise $\\dfrac{x^2}{4} - 9$.", "Recognise a square with a fractional coefficient",
        [
          ["$\\left(\\dfrac{x}{2} + 3\\right)\\left(\\dfrac{x}{2} - 3\\right)$", true, null, "$\\dfrac{x^2}{4} = \\left(\\dfrac{x}{2}\\right)^2$: a fraction can be a perfect square too."],
          ["$\\left(\\dfrac{x}{4} + 3\\right)\\left(\\dfrac{x}{4} - 3\\right)$", false, "maths.factorising.dots-fractional-coefficient", "That expands to $\\dfrac{x^2}{16} - 9$. The square root of $\\dfrac{1}{4}$ is $\\dfrac{1}{2}$."],
          ["It does not factorise", false, "maths.factorising.dots-fractional-coefficient", "It does. Summer 2023 M4 Q19 reported that a fractional coefficient stopped most candidates recognising the pattern at all."],
        ], 45),
      dxItem("07", "Without a calculator, what is $101^2 - 99^2$?", "Use the identity for arithmetic",
        [
          ["400", true, null, "$(101 + 99)(101 - 99) = 200 \\times 2 = 400$. The identity turns two awkward squares into one easy product."],
          ["4", false, "maths.algebra.expand-squared-bracket", "That is $(101 - 99)^2$. Squaring the difference is not the same as the difference of the squares."],
          ["2", false, "maths.algebra.expand-squared-bracket", "That is $101 - 99$. The identity gives the product of the sum and the difference, not the difference alone."],
        ], 40),
    ],
  },
];

// ---------------------------------------------------------------- questions
const mk = (n, o) => question({ id: `q.${T}.${String(n).padStart(4, "0")}`, topic: T, specRefs: REF, ...o });

const questions = [
  mk(1, {
    style: "practice", difficulty: 1, commandWords: ["Factorise"], setting: "Pure algebra, the basic pattern",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"], solutionProgram: C.a,
    parts: [{
      id: "main", verb: "factorise", marks: 1,
      stem: "Factorise $x^2 - 49$.",
      answer: algAnswer("(x+7)(x-7)", { mustBeFactorised: true }),
      scheme: [A("A1", 1, "(x + 7)(x − 7) in either order")],
      hints: ["$49 = 7^2$. Two squares with a minus between them."],
      workedSolution: "$x^2 - 49 = x^2 - 7^2 = (x + 7)(x - 7)$.",
      commonErrors: [{
        misconception: "maths.factorising.sign-errors-in-brackets",
        pattern: { kind: "algebraic", latex: "(x-7)(x-7)" },
        feedback: "Both brackets took a minus, which gives $x^2 - 14x + 49$. One plus and one minus is what makes the middle terms cancel.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2025-summer:M4:Q10",
      }],
      requiresWorking: false,
    }],
  }),
  mk(2, {
    style: "practice", difficulty: 2, commandWords: ["Factorise"], setting: "Pure algebra, letters other than x",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"], solutionProgram: C.b + " | " + C.p,
    parts: [
      {
        id: "a", verb: "factorise", marks: 1,
        stem: "Factorise $y^2 - 121$.",
        answer: algAnswer("(y+11)(y-11)", { variables: ["y"], mustBeFactorised: true }),
        scheme: [A("A1", 1, "(y + 11)(y − 11)")],
        hints: ["$121 = 11^2$."],
        workedSolution: "$y^2 - 121 = (y + 11)(y - 11)$.",
        commonErrors: [{
          misconception: "maths.factorising.wrong-variable-letter",
          pattern: { kind: "algebraic", latex: "(x+11)(x-11)" },
          feedback: "The numbers are right but the letter is not. Copy the letter from the question into both brackets.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q13",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 1,
        stem: "Factorise $x^2 - 1$.",
        answer: algAnswer("(x+1)(x-1)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "(x + 1)(x − 1)")],
        hints: ["1 is a square: $1 = 1^2$."],
        workedSolution: "$x^2 - 1 = x^2 - 1^2 = (x + 1)(x - 1)$.",
        commonErrors: [{
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "x(x-1)" },
          feedback: "That expands to $x^2 - x$, which has an $x$ term. The 1 is a perfect square, so the difference-of-squares pattern applies.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: false,
      },
    ],
  }),
  mk(3, {
    style: "practice", difficulty: 2, commandWords: ["Factorise"], setting: "Pure algebra, number first",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"], solutionProgram: C.c + " | " + C.d,
    figures: [orderFig],
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $36 - p^2$.",
        answer: algAnswer("(6+p)(6-p)", { variables: ["p"], mustBeFactorised: true }),
        scheme: [
          MA("MA1", 1, "recognition that 36 = 6² and the pattern a² − b² is used"),
          A("A1", 1, "(6 + p)(6 − p)", { dependsOn: ["MA1"], examinerNote: "(p + 6)(p − 6) expands to p² − 36 and does not earn the accuracy mark." }),
        ],
        hints: ["Which term comes first in the expression?", "$36 = 6^2$, and the 6 stays first in both brackets."],
        workedSolution: "$36 - p^2 = 6^2 - p^2 = (6 + p)(6 - p)$. Expanding back: $36 - 6p + 6p - p^2 = 36 - p^2$.",
        commonErrors: [{
          misconception: "maths.factorising.dots-term-order",
          pattern: { kind: "algebraic", latex: "(p+6)(p-6)" },
          feedback: "That expands to $p^2 - 36$, which is the negative of the expression given. Keep the terms in the order written; the method mark stands.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $100 - w^2$.",
        answer: algAnswer("(10+w)(10-w)", { variables: ["w"], mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "100 = 10² and the pattern identified"), A("A1", 1, "(10 + w)(10 − w)", { dependsOn: ["MA1"] })],
        hints: ["$100 = 10^2$.", "The number is the first term, so it leads both brackets."],
        workedSolution: "$100 - w^2 = (10 + w)(10 - w)$.",
        commonErrors: [{
          misconception: "maths.factorising.dots-term-order",
          pattern: { kind: "algebraic", latex: "(w+10)(w-10)" },
          feedback: "Reordering flips the sign: $(w + 10)(w - 10) = w^2 - 100$. Write the brackets starting with the term that starts the expression.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        }],
        requiresWorking: false,
      },
    ],
  }),
  mk(4, {
    style: "practice", difficulty: 3, commandWords: ["Factorise"], setting: "Pure algebra, squared coefficients",
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q18"], solutionProgram: C.e + " | " + C.f,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $4x^2 - 81$.",
        answer: algAnswer("(2x+9)(2x-9)", { mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "4x² = (2x)² and 81 = 9² identified"), A("A1", 1, "(2x + 9)(2x − 9)", { dependsOn: ["MA1"] })],
        hints: ["Is $4x^2$ a perfect square? $2x \\times 2x = 4x^2$.", "Square-root the coefficient as well as the letter."],
        workedSolution: "$4x^2 = (2x)^2$ and $81 = 9^2$, so $4x^2 - 81 = (2x + 9)(2x - 9)$.",
        commonErrors: [{
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "(4x+9)(4x-9)" },
          feedback: "That expands to $16x^2 - 81$. The square root of $4x^2$ is $2x$: the coefficient is rooted too.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q18",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $9m^2 - 64$.",
        answer: algAnswer("(3m+8)(3m-8)", { variables: ["m"], mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "9m² = (3m)² and 64 = 8² identified"), A("A1", 1, "(3m + 8)(3m − 8)", { dependsOn: ["MA1"] })],
        hints: ["$3m \\times 3m = 9m^2$.", "$64 = 8^2$."],
        workedSolution: "$9m^2 - 64 = (3m)^2 - 8^2 = (3m + 8)(3m - 8)$.",
        commonErrors: [{
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "(3m+64)(3m-64)" },
          feedback: "The 64 was left unrooted. Both terms go into the brackets as their square roots, so 64 becomes 8.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M4:Q18",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(5, {
    style: "practice", difficulty: 3, commandWords: ["Factorise"], emphasis: ["fully"],
    setting: "Pure algebra, a common factor before the identity",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"], solutionProgram: C.h + " | " + C.i,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise **fully** $5x^2 - 45$.",
        answer: algAnswer("5(x+3)(x-3)", { mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "5(x² − 9)"), A("A1", 1, "5(x + 3)(x − 3)", { ft: true, dependsOn: ["MA1"] })],
        hints: ["$5x^2$ is not a perfect square, so look for a common factor first.", "5 divides both terms.", "$x^2 - 9$ is then the pattern."],
        workedSolution: "$5x^2 - 45 = 5(x^2 - 9) = 5(x + 3)(x - 3)$.",
        commonErrors: [{
          misconception: "maths.factorising.common-factor-then-stop",
          pattern: { kind: "algebraic", latex: "5(x^2-9)" },
          feedback: "The method mark is earned, and the bracket still factorises. 'Fully' means carrying on until nothing more can come apart.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise **fully** $2y^2 - 50$.",
        answer: algAnswer("2(y+5)(y-5)", { variables: ["y"], mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "2(y² − 25)"), A("A1", 1, "2(y + 5)(y − 5)", { ft: true, dependsOn: ["MA1"] })],
        hints: ["2 divides both terms.", "$y^2 - 25$ is a difference of two squares."],
        workedSolution: "$2y^2 - 50 = 2(y^2 - 25) = 2(y + 5)(y - 5)$.",
        commonErrors: [{
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "(2y+10)(y-5)" },
          feedback: "This expands correctly, but the first bracket still holds a factor of 2. Take the number out to the front so both brackets are as simple as possible.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(6, {
    style: "practice", difficulty: 4, commandWords: ["Factorise"], setting: "Pure algebra, two letters",
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q18"], solutionProgram: C.g + " | " + C.n,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $25a^2 - 4b^2$.",
        answer: algAnswer("(5a+2b)(5a-2b)", { variables: ["a", "b"], mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "25a² = (5a)² and 4b² = (2b)² identified"), A("A1", 1, "(5a + 2b)(5a − 2b)", { dependsOn: ["MA1"] })],
        hints: ["Two letters, but the same identity.", "$\\sqrt{25a^2} = 5a$ and $\\sqrt{4b^2} = 2b$."],
        workedSolution: "$25a^2 - 4b^2 = (5a)^2 - (2b)^2 = (5a + 2b)(5a - 2b)$.",
        commonErrors: [{
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "(5a+2b)(5a+2b)" },
          feedback: "Both brackets took a plus, which gives $25a^2 + 20ab + 4b^2$. One of each sign is what removes the middle term.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M4:Q18",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $a^2 - 9b^2$.",
        answer: algAnswer("(a+3b)(a-3b)", { variables: ["a", "b"], mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "9b² = (3b)² identified"), A("A1", 1, "(a + 3b)(a − 3b)", { dependsOn: ["MA1"] })],
        hints: ["Only the second term carries a coefficient.", "$\\sqrt{9b^2} = 3b$."],
        workedSolution: "$a^2 - 9b^2 = a^2 - (3b)^2 = (a + 3b)(a - 3b)$.",
        commonErrors: [{
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "(a+9b)(a-9b)" },
          feedback: "That expands to $a^2 - 81b^2$. Root the coefficient: $9b^2$ comes from $3b$ squared.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M4:Q18",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(7, {
    style: "practice", difficulty: 4, commandWords: ["Factorise"], setting: "Pure algebra, fractional and reversed forms",
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q19"], solutionProgram: C.k + " | " + C.l,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $\\dfrac{x^2}{4} - 9$.",
        answer: algAnswer("(\\frac{x}{2}+3)(\\frac{x}{2}-3)", { mustBeFactorised: true }),
        scheme: [
          MA("MA1", 1, "x²/4 written as (x/2)², or 9 as 3²"),
          A("A1", 1, "(x/2 + 3)(x/2 − 3), or equivalent such as ¼(x + 6)(x − 6)", { dependsOn: ["MA1"] }),
        ],
        hints: ["A fraction can be a perfect square.", "$\\left(\\dfrac{x}{2}\\right)^2 = \\dfrac{x^2}{4}$.", "An equivalent route: take out $\\tfrac{1}{4}$ first to get $\\tfrac{1}{4}(x^2 - 36)$."],
        workedSolution: "$\\dfrac{x^2}{4} = \\left(\\dfrac{x}{2}\\right)^2$ and $9 = 3^2$, so $\\dfrac{x^2}{4} - 9 = \\left(\\dfrac{x}{2} + 3\\right)\\left(\\dfrac{x}{2} - 3\\right)$. Taking $\\tfrac{1}{4}$ out first gives the equivalent $\\tfrac{1}{4}(x + 6)(x - 6)$.",
        commonErrors: [{
          misconception: "maths.factorising.dots-fractional-coefficient",
          pattern: { kind: "algebraic", latex: "(\\frac{x}{4}+3)(\\frac{x}{4}-3)" },
          feedback: "That expands to $\\dfrac{x^2}{16} - 9$. The square root of $\\tfrac{1}{4}$ is $\\tfrac{1}{2}$, so the bracket holds $\\tfrac{x}{2}$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M4:Q19",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise $49 - 16t^2$.",
        answer: algAnswer("(7+4t)(7-4t)", { variables: ["t"], mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "49 = 7² and 16t² = (4t)² identified"), A("A1", 1, "(7 + 4t)(7 − 4t)", { dependsOn: ["MA1"] })],
        hints: ["Number first, so the 7 leads both brackets.", "$\\sqrt{16t^2} = 4t$."],
        workedSolution: "$49 - 16t^2 = 7^2 - (4t)^2 = (7 + 4t)(7 - 4t)$.",
        commonErrors: [{
          misconception: "maths.factorising.dots-term-order",
          pattern: { kind: "algebraic", latex: "(4t+7)(4t-7)" },
          feedback: "That expands to $16t^2 - 49$, the negative of the expression. The first term of the expression leads both brackets.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(8, {
    style: "practice", difficulty: 3, commandWords: ["Work out"], setting: "Arithmetic with the identity, non-calculator",
    paper: M7P1,
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: "83^2 - 17^2 = (83+17)(83-17) = 100*66 = 6600 (direct: 6889 - 289 = 6600); 45^2 - 35^2 = 80*10 = 800 (2025 - 1225 = 800)",
    parts: [
      {
        id: "a", verb: "work-out", marks: 2,
        stem: "Without using a calculator, work out $83^2 - 17^2$.",
        answer: numAnswer(6600),
        scheme: [MA("MA1", 1, "(83 + 17)(83 − 17) or 100 × 66"), A("A1", 1, "6600", { dependsOn: ["MA1"] })],
        hints: ["This is a difference of two squares with $a = 83$ and $b = 17$.", "$(83 + 17)(83 - 17) = 100 \\times 66$."],
        workedSolution: "$83^2 - 17^2 = (83 + 17)(83 - 17) = 100 \\times 66 = 6600$.",
        commonErrors: [{
          misconception: "maths.algebra.expand-squared-bracket",
          pattern: { kind: "numeric" },
          feedback: "$(83 - 17)^2 = 66^2 = 4356$. Squaring the difference is a different calculation from the difference of the squares.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "work-out", marks: 2,
        stem: "Without using a calculator, work out $45^2 - 35^2$.",
        answer: numAnswer(800),
        scheme: [MA("MA1", 1, "(45 + 35)(45 − 35) or 80 × 10"), A("A1", 1, "800", { dependsOn: ["MA1"] })],
        hints: ["Sum and difference.", "$80 \\times 10$."],
        workedSolution: "$45^2 - 35^2 = (45 + 35)(45 - 35) = 80 \\times 10 = 800$.",
        commonErrors: [{
          misconception: "maths.algebra.expand-squared-bracket",
          pattern: { kind: "numeric" },
          feedback: "$(45 - 35)^2 = 100$. The identity gives the sum times the difference, so the 80 is needed as well.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(9, {
    style: "practice", difficulty: 3, commandWords: ["Explain"], setting: "Reasoning about which expressions factorise",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q18"],
    solutionProgram: "x^2 + 25 has no real factorisation: (x+a)(x+b) needs ab = 25 and a+b = 0, so a = -b and -b^2 = 25, impossible for real b; x^2 - 25 = (x+5)(x-5) checked at x = 2, -3, 0.5",
    parts: [{
      id: "main", verb: "explain", marks: 2,
      stem: "Ruairi says that $x^2 + 25$ factorises as $(x + 5)(x - 5)$.\n\nExplain what is wrong with his answer, and write down an expression that **does** factorise as $(x + 5)(x - 5)$.",
      answer: textAnswer(
        ["(x + 5)(x − 5) expands to x² − 25, not x² + 25; the expression that factorises like this is x² − 25"],
        [
          { any: ["x² − 25", "x^2 - 25", "expands to x squared minus 25"], marks: 1 },
          { any: ["sum of two squares", "does not factorise", "needs a minus", "difference"], marks: 1 },
        ],
      ),
      scheme: [
        MA("MA1", 1, "(x + 5)(x − 5) expanded to x² − 25, or a statement that the identity needs a subtraction"),
        A("A1", 1, "x² − 25 given as the expression that factorises that way", { dependsOn: ["MA1"] }),
      ],
      hints: ["Expand $(x + 5)(x - 5)$ and see what you get.", "The identity is $a^2 - b^2$, with a minus sign.", "A sum of two squares does not factorise with real numbers."],
      workedSolution: "$(x + 5)(x - 5) = x^2 - 5x + 5x - 25 = x^2 - 25$, so it cannot equal $x^2 + 25$. The identity only applies to a **difference** of two squares; $x^2 + 25$ does not factorise at all over the real numbers. The expression that factorises as $(x + 5)(x - 5)$ is $x^2 - 25$.",
      commonErrors: [{
        misconception: "maths.factorising.sign-errors-in-brackets",
        pattern: { kind: "text", regex: "(correct|right|he is (right|correct))" },
        feedback: "Expanding settles it: the two middle terms cancel and the constant is $-25$. There is no factorisation of $x^2 + 25$ with real numbers.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2024-summer:M4:Q18",
      }],
      requiresWorking: true,
    }],
  }),
  mk(10, {
    style: "practice", difficulty: 4, commandWords: ["Factorise", "Simplify"], setting: "Pure algebra, the identity used to cancel a fraction",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: C.m + "; (x^2-16)/(x+4) = (x+4)(x-4)/(x+4) = x-4 for x other than -4",
    parts: [
      {
        id: "a", verb: "factorise", marks: 1,
        stem: "Factorise $x^2 - 16$.",
        answer: algAnswer("(x+4)(x-4)", { mustBeFactorised: true }),
        scheme: [A("A1", 1, "(x + 4)(x − 4)")],
        hints: ["$16 = 4^2$."],
        workedSolution: "$x^2 - 16 = (x + 4)(x - 4)$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x-4)(x-4)" },
          feedback: "That gives $x^2 - 8x + 16$. One bracket takes a plus so the middle terms cancel.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "simplify", marks: 2,
        stem: "Hence simplify $\\dfrac{x^2 - 16}{x + 4}$.",
        answer: algAnswer("x - 4", { equivalence: "simplifiedOnly" }),
        scheme: [
          MA("MA1", 1, "their factorisation used: (x + 4)(x − 4) ÷ (x + 4)", { ft: true }),
          A("A1", 1, "x − 4", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Use part (a) on the numerator.", "The bracket $(x + 4)$ appears top and bottom, so it cancels.", "Cancel whole brackets, never single terms."],
        workedSolution: "$\\dfrac{x^2 - 16}{x + 4} = \\dfrac{(x + 4)(x - 4)}{x + 4} = x - 4$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.cancel-terms-not-factors",
          pattern: { kind: "algebraic", latex: "\\frac{x^2}{x} - 4" },
          feedback: "The 16 and the 4 were cancelled as terms. Only whole factors cancel, which is why the numerator has to be factorised first.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(11, {
    style: "practice", difficulty: 4, commandWords: ["Factorise"], emphasis: ["fully"],
    setting: "Pure algebra, a common factor hiding a squared coefficient",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q10"], solutionProgram: C.o + " | " + C.j,
    parts: [
      {
        id: "a", verb: "factorise", marks: 3,
        stem: "Factorise **fully** $8x^2 - 2$.",
        answer: algAnswer("2(2x+1)(2x-1)", { mustBeFactorised: true }),
        scheme: [
          MA("MA1", 1, "2(4x² − 1)"),
          A("A1", 1, "4x² recognised as (2x)² and 1 as 1²", { ft: true, dependsOn: ["MA1"] }),
          A("A2", 1, "2(2x + 1)(2x − 1)", { ft: true, dependsOn: ["A1"] }),
        ],
        hints: ["2 divides both terms.", "$4x^2 - 1$ is still a difference of two squares.", "$\\sqrt{4x^2} = 2x$ and $\\sqrt{1} = 1$."],
        workedSolution: "$8x^2 - 2 = 2(4x^2 - 1) = 2\\big((2x)^2 - 1^2\\big) = 2(2x + 1)(2x - 1)$.",
        commonErrors: [{
          misconception: "maths.factorising.common-factor-then-stop",
          pattern: { kind: "algebraic", latex: "2(4x^2-1)" },
          feedback: "The common factor earns the first mark. What is left is still a difference of two squares, so there are two more marks on the table.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 2,
        stem: "Factorise **fully** $3x^2 - 108$.",
        answer: algAnswer("3(x+6)(x-6)", { mustBeFactorised: true }),
        scheme: [MA("MA1", 1, "3(x² − 36)"), A("A1", 1, "3(x + 6)(x − 6)", { ft: true, dependsOn: ["MA1"] })],
        hints: ["3 divides 3 and 108.", "$108 \\div 3 = 36 = 6^2$."],
        workedSolution: "$3x^2 - 108 = 3(x^2 - 36) = 3(x + 6)(x - 6)$.",
        commonErrors: [{
          misconception: "maths.factorising.common-factor-then-stop",
          pattern: { kind: "algebraic", latex: "3(x^2-36)" },
          feedback: "One mark for the common factor. The bracket is a difference of two squares, and 'fully' asks you to finish it.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(12, {
    style: "practice", difficulty: 4, commandWords: ["Show that"], setting: "A square patio with a square pond removed",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q18"],
    solutionProgram: "area = x^2 - 9 = (x+3)(x-3); at x = 10 the area is 91 and (13)(7) = 91",
    parts: [{
      id: "main", verb: "show-that", marks: 3,
      stem: "A square patio has side $x$ metres. A square pond of side 3 metres is removed from one corner.\n\nShow that the area of patio remaining can be written as $(x + 3)(x - 3)$ square metres, and work out that area when $x = 10$.",
      answer: numAnswer(91, { unit: "m²", unitRequired: true }),
      scheme: [
        MA("MA1", 1, "remaining area written as x² − 9"),
        A("A1", 1, "x² − 9 factorised to (x + 3)(x − 3)", { dependsOn: ["MA1"] }),
        A("A2", 1, "91 (m²) when x = 10", { ft: true, dependsOn: ["A1"] }),
      ],
      hints: ["The patio is $x^2$ and the pond is $3^2$.", "$x^2 - 9$ is a difference of two squares.", "With $x = 10$, use either $100 - 9$ or $13 \\times 7$."],
      workedSolution: "Remaining area $= x^2 - 3^2 = x^2 - 9 = (x + 3)(x - 3)$ square metres.\nWhen $x = 10$: $(10 + 3)(10 - 3) = 13 \\times 7 = 91 \\text{ m}^2$, which agrees with $100 - 9 = 91$.",
      commonErrors: [{
        misconception: "maths.factorising.sign-errors-in-brackets",
        pattern: { kind: "numeric" },
        feedback: "$(10 - 3)^2 = 49$ is the area of a square of side $x - 3$, which is not the shape described. The pond comes out of a corner, leaving an L-shape of area $x^2 - 9$.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2024-summer:M4:Q18",
      }],
      requiresWorking: true,
    }],
  }),
  // ------------------------------------------------------------ exam-style
  mk(13, {
    style: "exam-style", difficulty: 4, commandWords: ["Factorise"], emphasis: ["fully"],
    setting: "Pure algebra, a two-part 'Factorise' in the style of a late M3 item",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20", "ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: C.q + " | " + C.h,
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise\n\n$64 - 9k^2$",
        answer: algAnswer("(8+3k)(8-3k)", { variables: ["k"], mustBeFactorised: true }),
        scheme: [
          MA("MA1", 1, "64 = 8² and 9k² = (3k)² identified"),
          A("A1", 1, "(8 + 3k)(8 − 3k)", { dependsOn: ["MA1"], examinerNote: "(3k + 8)(3k − 8) expands to 9k² − 64 and does not earn the accuracy mark." }),
        ],
        hints: ["Both terms are squares: $64 = 8^2$ and $9k^2 = (3k)^2$.", "The number comes first in the expression, so it comes first in the brackets."],
        workedSolution: "$64 - 9k^2 = 8^2 - (3k)^2 = (8 + 3k)(8 - 3k)$.",
        commonErrors: [
          {
            misconception: "maths.factorising.dots-term-order",
            pattern: { kind: "algebraic", latex: "(3k+8)(3k-8)" },
            feedback: "That expands to $9k^2 - 64$, the negative of the expression given. Summer 2025 M4 Q20 reported this reordering as the reason the harder version went wrong. The method mark stands.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M4:Q20",
          },
          {
            misconception: "maths.factorising.not-fully-factorised",
            pattern: { kind: "algebraic", latex: "(8+9k)(8-9k)" },
            feedback: "The $9k^2$ was not fully rooted. $\\sqrt{9k^2} = 3k$, so the brackets hold $3k$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M4:Q18",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 3,
        stem: "Factorise **fully**\n\n$5x^2 - 45$",
        answer: algAnswer("5(x+3)(x-3)", { mustBeFactorised: true }),
        scheme: [
          MA("MA1", 1, "common factor 5 taken out: 5(x² − 9)"),
          A("A1", 1, "x² − 9 identified as a difference of two squares", { ft: true, dependsOn: ["MA1"] }),
          A("A2", 1, "5(x + 3)(x − 3)", { ft: true, dependsOn: ["A1"] }),
        ],
        hints: ["Is $5x^2$ a perfect square? No, so a common factor comes out first.", "$5(x^2 - 9)$.", "Finish the bracket."],
        workedSolution: "$5x^2 - 45 = 5(x^2 - 9) = 5(x + 3)(x - 3)$.",
        commonErrors: [{
          misconception: "maths.factorising.common-factor-then-stop",
          pattern: { kind: "algebraic", latex: "5(x^2-9)" },
          feedback: "The common factor is out, which is the method mark. Two accuracy marks remain in the bracket, and 'fully' is the instruction to take them.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q10",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(14, {
    style: "exam-style", difficulty: 5, commandWords: ["Factorise", "Work out"],
    setting: "Pure algebra and arithmetic: the same identity used in both directions",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q19", "ccea-cer:maths:2024-summer:M4:Q18"],
    solutionProgram: "(a) 25a^2 - 4b^2 = (5a+2b)(5a-2b) checked at three (a,b) points; (b) 57^2 - 43^2 = (57+43)(57-43) = 100*14 = 1400 (3249 - 1849 = 1400)",
    parts: [
      {
        id: "a", verb: "factorise", marks: 2,
        stem: "Factorise $25a^2 - 4b^2$.",
        answer: algAnswer("(5a+2b)(5a-2b)", { variables: ["a", "b"], mustBeFactorised: true }),
        scheme: [
          MA("MA1", 1, "(5a)² and (2b)² identified"),
          A("A1", 1, "(5a + 2b)(5a − 2b)", { dependsOn: ["MA1"] }),
        ],
        hints: ["Square-root each term completely, coefficient included.", "$\\sqrt{25a^2} = 5a$, $\\sqrt{4b^2} = 2b$."],
        workedSolution: "$25a^2 - 4b^2 = (5a)^2 - (2b)^2 = (5a + 2b)(5a - 2b)$. Expanding back, the $-10ab$ and $+10ab$ cancel.",
        commonErrors: [{
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "(25a+4b)(25a-4b)" },
          feedback: "Neither term was rooted. Under a tenth of candidates reached full marks on the 2024 version of this, and the coefficients were the obstacle: $25a^2$ comes from $5a$ squared.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q18",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "work-out", marks: 2,
        stem: "Hence, or otherwise, work out $57^2 - 43^2$ without using a calculator.",
        answer: numAnswer(1400),
        scheme: [
          MA("MA1", 1, "(57 + 43)(57 − 43) or 100 × 14"),
          A("A1", 1, "1400", { dependsOn: ["MA1"] }),
        ],
        hints: ["The same identity, with $a = 57$ and $b = 43$.", "$(57 + 43) = 100$, which makes the multiplication easy.", "$100 \\times 14$."],
        workedSolution: "$57^2 - 43^2 = (57 + 43)(57 - 43) = 100 \\times 14 = 1400$.",
        commonErrors: [{
          misconception: "maths.algebra.expand-squared-bracket",
          pattern: { kind: "numeric" },
          feedback: "$(57 - 43)^2 = 14^2 = 196$. The identity multiplies the difference by the sum, so the 100 is needed as well.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M4:Q19",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(15, {
    style: "exam-style", difficulty: 5, commandWords: ["Show that", "Factorise"],
    setting: "A square picture mount: an algebraic border between two squares",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q18", "ccea-cer:maths:2025-summer:M4:Q10"],
    solutionProgram: "border area = (2n)^2 - 6^2 = 4n^2 - 36 = 4(n^2-9) = 4(n+3)(n-3); at n = 7 that is 4*10*4 = 160 and directly 4*49 - 36 = 196 - 36 = 160",
    parts: [
      {
        id: "a", verb: "show-that", marks: 2,
        stem: "A square mount of side $2n$ centimetres has a square hole of side 6 centimetres cut from its centre.\n\nShow that the area of card remaining is $4n^2 - 36$ square centimetres.",
        answer: algAnswer("4n^2 - 36", { variables: ["n"], mustBeExpanded: true }),
        scheme: [
          MA("MA1", 1, "(2n)² and 6² written, or (2n)² − 6²"),
          A("A1", 1, "(2n)² expanded to 4n² and the printed result reached", { dependsOn: ["MA1"] }),
        ],
        hints: ["Big square minus small square.", "$(2n)^2 = 2n \\times 2n = 4n^2$, not $2n^2$.", "A 'show that' must finish on the printed line."],
        workedSolution: "Area of card $= (2n)^2 - 6^2 = 4n^2 - 36$ square centimetres, as required.",
        commonErrors: [{
          misconception: "maths.algebra.bracket-before-squaring",
          pattern: { kind: "algebraic", latex: "2n^2 - 36" },
          feedback: "The coefficient was not squared. $(2n)^2$ means $2n$ multiplied by itself, which is $4n^2$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q18",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "factorise", marks: 3,
        stem: "Factorise **fully** $4n^2 - 36$, and hence find the area of card when $n = 7$.",
        answer: numAnswer(160, { unit: "cm²", unitRequired: true }),
        scheme: [
          MA("MA1", 1, "4(n² − 9) — the common factor 4 out first"),
          A("A1", 1, "4(n + 3)(n − 3)", { ft: true, dependsOn: ["MA1"] }),
          A("A2", 1, "160 (cm²)", { ft: true, dependsOn: ["A1"] }),
        ],
        hints: ["4 divides both terms.", "$n^2 - 9$ is a difference of two squares.", "Substituting $n = 7$ into $4(n + 3)(n - 3)$ gives $4 \\times 10 \\times 4$."],
        workedSolution: "$4n^2 - 36 = 4(n^2 - 9) = 4(n + 3)(n - 3)$.\nWhen $n = 7$: $4 \\times 10 \\times 4 = 160 \\text{ cm}^2$, which agrees with $4(49) - 36 = 160$.",
        commonErrors: [
          {
            misconception: "maths.factorising.not-fully-factorised",
            pattern: { kind: "algebraic", latex: "(2n+6)(2n-6)" },
            feedback: "This does expand to $4n^2 - 36$, but each bracket still contains a factor of 2. Taking the 4 out first gives the fully factorised $4(n + 3)(n - 3)$.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M4:Q10",
          },
          {
            misconception: "maths.factorising.common-factor-then-stop",
            pattern: { kind: "algebraic", latex: "4(n^2-9)" },
            feedback: "The common factor is out, which is the method mark. The bracket is still a difference of two squares.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M4:Q10",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
];
expect("q12 at x=10", 10 ** 2 - 9, 91);
expect("q12 factored at x=10", 13 * 7, 91);
expect("q15 at n=7", 4 * 7 ** 2 - 36, 160);
expect("q15 factored at n=7", 4 * 10 * 4, 160);
expect("83-17 squared", (83 - 17) ** 2, 4356);
assertNoFailures("t5 questions");

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T, specRefs: REF,
    stem: "Méabh was asked to factorise $81 - m^2$. Her working:",
    studentWorking: [
      "81 = 9² and m² = m²",
      "Difference of two squares: a² − b² = (a + b)(a − b)",
      "So 81 − m² = (m + 9)(m − 9)",
    ],
    mistakeLine: 3,
    misconception: "maths.factorising.dots-term-order",
    whatWentWrong: "The terms were reordered. $(m + 9)(m - 9)$ expands to $m^2 - 81$, which is the negative of $81 - m^2$. In the identity, $a$ is whatever comes **first** in the expression, and here that is the 9.",
    correction: [
      "81 = 9² and m² = m², so a = 9 and b = m",
      "81 − m² = (9 + m)(9 − m)",
      "Check: (9 + m)(9 − m) = 81 − 9m + 9m − m² = 81 − m²",
    ],
    marksEarnedAsWritten: ["MA1"],
    feedback: "The pattern was spotted and both terms square-rooted correctly, so the method mark stands. The accuracy mark goes because the order was swapped, and swapping changes the sign of the whole expression. Summer 2025 M4 Q20 reported this as the reason the harder version went wrong: when the letter is not the first term, candidates turn the expression round. Whatever starts the expression starts both brackets.",
    source: "ccea-cer:maths:2025-summer:M4:Q20",
  },
  {
    id: `ftm.${T}.02`,
    topic: T, specRefs: REF,
    stem: "Fionn was asked to factorise fully $12x^2 - 27$. His working:",
    studentWorking: [
      "12x² − 27 has a common factor of 3",
      "= 3(4x² − 9)",
      "4x² − 9 is not a difference of two squares because 4x² is not a square number",
      "Answer: 3(4x² − 9)",
    ],
    mistakeLine: 3,
    misconception: "maths.factorising.common-factor-then-stop",
    whatWentWrong: "$4x^2$ **is** a perfect square: $(2x)^2 = 2x \\times 2x = 4x^2$. A term is a square when its coefficient is a square number and its index is even, so $4x^2 - 9$ factorises as $(2x + 3)(2x - 3)$.",
    correction: [
      "12x² − 27 = 3(4x² − 9)",
      "4x² = (2x)² and 9 = 3²",
      "So 12x² − 27 = 3(2x + 3)(2x − 3)",
    ],
    marksEarnedAsWritten: ["MA1"],
    feedback: "Taking out the 3 is the right first move and earns the method mark. The stopping point costs the two accuracy marks: a coefficient that is itself a square number, with an even index, makes the whole term a square. Summer 2025 M4 Q10 reported both halves of this — candidates taking out only part of a common factor, and candidates stopping once the factor was outside. After every common factor, ask the question again: is what is left still a difference of two squares?",
    source: "ccea-cer:maths:2025-summer:M4:Q10",
  },
];
const chk12 = equiv("ftm02 check", "3*(2*x+3)*(2*x-3)", "12*x**2 - 27", P);
const chk81 = equiv("ftm01 check", "(9+m)*(9-m)", "81 - m**2", at("m"));
assertNoFailures("t5 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", REF, "formula", "$a^2 - b^2 = $ ?",
    "$(a + b)(a - b)$. One bracket has a plus and the other a minus, so the two middle terms cancel and no $x$ term survives.",
    ["(a + b)(a − b)", "middle terms cancel"], 3),
  rp(T, "02", REF, "trap", "How do you factorise $36 - p^2$, and why is $(p + 6)(p - 6)$ not accepted?",
    "$(6 + p)(6 - p)$. The first term of the expression leads both brackets. $(p + 6)(p - 6)$ expands to $p^2 - 36$, which is the negative of what was asked.",
    ["(6 + p)(6 − p)", "order", "negative"], 7),
  rp(T, "03", REF, "procedure", "Before using the identity, what is the first thing to check?",
    "Whether there is a common factor. $5x^2 - 45$ is not a difference of two squares as written, but $5(x^2 - 9)$ is, and 'factorise fully' expects the 5 out in front.",
    ["common factor", "fully", "first"], 6),
  rp(T, "04", REF, "trap", "Is $25a^2$ a perfect square? What is its square root?",
    "Yes. $\\sqrt{25a^2} = 5a$, because $5a \\times 5a = 25a^2$. A term is a square when its coefficient is a square number and its index is even.",
    ["5a", "coefficient", "even index"], 6),
  rp(T, "05", REF, "trap", "Does $x^2 + 25$ factorise?",
    "No. The identity needs a **difference**; a sum of two squares has no factorisation with real numbers. Two terms and a plus sign means stop.",
    ["sum", "does not factorise", "difference"], 5),
  rp(T, "06", REF, "novel-example", "Factorise $9m^2 - 64$.",
    "$(3m + 8)(3m - 8)$, since $9m^2 = (3m)^2$ and $64 = 8^2$.",
    ["(3m + 8)(3m − 8)"], 6),
  rp(T, "07", REF, "novel-example", "Factorise $\\dfrac{x^2}{4} - 9$.",
    "$\\left(\\dfrac{x}{2} + 3\\right)\\left(\\dfrac{x}{2} - 3\\right)$, or equivalently $\\tfrac{1}{4}(x + 6)(x - 6)$. A fraction can be a perfect square.",
    ["x/2", "fraction can be a square"], 8),
  rp(T, "08", REF, "trap", "How does the identity help without a calculator?",
    "It turns two awkward squares into one easy product: $101^2 - 99^2 = (101 + 99)(101 - 99) = 200 \\times 2 = 400$.",
    ["sum times difference", "400"], 6),
  rp(T, "09", REF, "procedure", "Why does the difference of two squares have no middle term?",
    "Expanding $(a + b)(a - b)$ gives $a^2 - ab + ab - b^2$, and the two middle products are equal and opposite, so they cancel.",
    ["cancel", "equal and opposite"], 4),
  rp(T, "10", REF, "trap", "$\\dfrac{x^2 - 16}{x + 4}$ — what is the first move?",
    "Factorise the numerator to $(x + 4)(x - 4)$, then cancel the whole bracket $(x + 4)$, leaving $x - 4$. Never cancel the $x^2$ against the $x$: only whole factors cancel.",
    ["factorise first", "cancel whole brackets", "x − 4"], 8),
];

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed: (6 + p)(6 − p) = 36 − p²; (p + 6)(p − 6) = p² − 36; 5(x + 3)(x − 3) = 5x² − 45; (5a + 2b)(5a − 2b) = 25a² − 4b²; (x/2 + 3)(x/2 − 3) = x²/4 − 9; 101² − 99² = 400 = 200 × 2.",
    examiner: "Examiner callouts come from the insight card built for this topic from the taxonomy examinerEvidence for M3-NA-07: Summer 2025 M4 Q20 (terms reversed), Summer 2024 M4 Q18 (three letters, 9% full marks), Summer 2023 M4 Q19 (fractional coefficient, majority zero), Summer 2025 M4 Q10 (common factor).",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, {
    ...base,
    numeric: C.c + "; the reversed form " + C.cTrap + "; twin " + C.d,
    examiner: "Exercises the Summer 2025 M4 Q20 finding that the terms were reordered when the letter was not first.",
  }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, {
    ...base,
    numeric: C.h + "; twin " + C.i,
    examiner: "Exercises the Summer 2025 M4 Q10 finding that the common factor was taken out incompletely, or taken out and then abandoned.",
  }),
  ver(`ver.we.${T}.03`, `we.${T}.03`, {
    ...base,
    numeric: C.g + "; twin " + C.l,
    examiner: "Exercises the Summer 2024 M4 Q18 finding that squared coefficients were not recognised, where under a tenth reached full marks.",
  }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "(x + 7)(x − 7) = x² − 49; (6 + p)(6 − p) = 36 − p²; (2x + 9)(2x − 9) = 4x² − 81; 3(x + 6)(x − 6) = 3x² − 108; (x/2 + 3)(x/2 − 3) = x²/4 − 9; 101² − 99² = 400 and (101 − 99)² = 4.",
    examiner: "Distractors are registry misconceptions named on the insight card: dots-term-order, dots-fractional-coefficient, not-fully-factorised, common-factor-then-stop, sign-errors-in-brackets, expand-squared-bracket.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the reported reordering, unrooted coefficients and stopping points.",
  })),
  ...findTheMistake.map((f, i) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: i === 0 ? chk81 + "; the written (incorrect) form (m + 9)(m − 9) = m² − 81" : chk12 + "; the written (incomplete) form 3(4x² − 9)",
    examiner: f.source + " — the wrong line reproduces the reported error.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Prompt answers recomputed: (3m + 8)(3m − 8) = 9m² − 64; (x/2 + 3)(x/2 − 3) = x²/4 − 9; 101² − 99² = 400; (x² − 16)/(x + 4) = x − 4 for x ≠ −4.",
    examiner: "Prompts cover the identity, the term order, the common factor, squared and fractional coefficients, and the sum-of-squares contrast.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "A sum of two squares, such as x² + 25, does not factorise — there is nothing to find",
  "Expressions where a term is not a square (x² − 20, x³ − 8) are not this identity; x² − 20 would need surds and x³ − 8 is a difference of cubes, neither of which is on this specification",
  "Solving the resulting equation is statement M3-NA-11; 'Factorise' on its own never asks for solutions",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Difference of two squares",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: ["maths.m3.factorising-quadratics-x2-plus-bx-plus-c"],
    order: 99,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: insight.findings.map((f) => f.source),
    examWeightHint:
      "Usually 1-2 marks in M3, most often as one part of a two-part 'Factorise' question, and then re-examined much harder in M4, where it is the step that unlocks simplifying an algebraic fraction (Summer 2025 Q20) or a multi-letter factorisation (Summer 2024 Q18, 9% full marks; Summer 2023 Q19, majority zero). It is also the identity that makes a non-calculator square difference such as 83² − 17² trivial in M7 Paper 1.",
    mustMemorise: [
      "a² − b² = (a + b)(a − b)",
      "Take a common factor out first: 3x² − 75 = 3(x + 5)(x − 5)",
      "Square-root each term completely, coefficient included: 25a² − 4b² = (5a + 2b)(5a − 2b)",
      "The first term of the expression leads both brackets: 36 − p² = (6 + p)(6 − p)",
      "A sum of two squares does not factorise",
    ],
    onFormulaSheet: [],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["difference of two squares", "DOTS", "factorise", "a² − b²", "term order", "common factor first", "squared coefficient"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Difference of two squares",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [],
      mustKnow: [
        "a² − b² = (a + b)(a − b)",
        "Common factor out first, then check the bracket again",
        "√(25a²) = 5a — the coefficient is square-rooted too",
        "Keep the terms in the order the question writes them",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Recognise a difference of two squares: exactly two terms, both perfect squares, with a minus between them",
        "Factorise x² − 49, y² − 121 and x² − 1 straight away",
        "Factorise with the number first: 36 − p² = (6 + p)(6 − p), keeping the order given",
        "Handle a squared coefficient: 4x² − 81 = (2x + 9)(2x − 9), and two letters: 25a² − 4b² = (5a + 2b)(5a − 2b)",
        "Take a common factor out first and then finish the job: 5x² − 45 = 5(x + 3)(x − 3)",
        "Recognise a square hidden in a fraction: x²/4 − 9 = (x/2 + 3)(x/2 − 3)",
        "Use the identity as arithmetic without a calculator: 83² − 17² = 100 × 66 = 6600",
        "Say why a sum of two squares does not factorise",
        "Use the factorisation to cancel an algebraic fraction, cancelling whole brackets only",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks) and again without a calculator in M7 Paper 1. In M3 it is usually 1-2 marks inside a two-part 'Factorise' question. The hard versions live in M4, where the identity is the key step in simplifying an algebraic fraction or factorising an expression in several letters. Schemes give A1 for the correct pair of brackets, with a preceding method mark where a common factor has to come out first; 'factorise fully' runs to 3 marks.",
      traps: [
        "Reordering the terms: writing (p + 6)(p − 6) for 36 − p², which is the negative of the expression — the reported cause of loss in Summer 2025 M4 Q20",
        "Not square-rooting the coefficient, so 25a² − 4b² comes back as (25a + 4b)(25a − 4b); under a tenth reached full marks on the 2024 version",
        "A fractional coefficient stopping recognition altogether — the majority scored zero in Summer 2023 M4 Q19",
        "Taking out only part of a common factor, such as 4 instead of 4a (Summer 2025 M4 Q10)",
        "Stopping at 5(x² − 9) when the command says fully, or hiding the common factor inside a bracket as (2n + 6)(2n − 6)",
        "Using both the same sign, so (x − 7)(x − 7) appears and a middle term reappears",
        "Trying to factorise a sum of two squares",
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
      title: "Spot the pattern, keep the order",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0003`, `rp.${T}.02`, `q.${T}.0005`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Coefficients, fractions, common factors and arithmetic",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0006`, `q.${T}.0007`, `ftm.${T}.01`, `q.${T}.0011`, `ftm.${T}.02`, `q.${T}.0013`, `q.${T}.0014`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Difference of two squares" },
  {
    type: "callout", kind: "spec", title: "The statement",
    md: "**M3-NA-07** — factorise using the difference of two squares.\nThe Teacher Guidance gives the model: $x^2 - 16 = (x - 4)(x + 4)$.",
    source: "CCEA GCSE Mathematics specification, statement M3-NA-07 with its Teacher Guidance",
  },
  {
    type: "p",
    md: "This is the one factorisation that does not need any searching. Two terms, both squares, a minus between them — and the answer is written down in a single line. It is worth a mark or two on its own in M3, but its real value comes later: it is the step that unlocks the hardest algebraic-fraction questions in M4, and it turns $83^2 - 17^2$ into something you can do in your head.",
  },
  { type: "h", text: "Why the identity is true" },
  {
    type: "p",
    md: "Take a square of side $a$ and cut a square of side $b$ out of one corner. What is left has area $a^2 - b^2$. Now cut the remaining L-shape into two rectangles and slide them together:",
  },
  noteFigure(proofBody, proofAlt, 760, 316,
    "A square with a corner removed rearranges into a rectangle of sides a + b and a − b", "dots-area-proof"),
  {
    type: "p",
    md: "The rectangle is $(a + b)$ long and $(a - b)$ high, so $a^2 - b^2 = (a + b)(a - b)$.\nThe algebra says the same thing: $(a + b)(a - b) = a^2 - ab + ab - b^2$, and the two middle products are equal and opposite, so they cancel. **That is why there is no middle term** — and it is also the check. If you expand your brackets and a middle term survives, the signs are wrong.",
  },
  {
    type: "gate", id: "g1", kind: "blank",
    prompt: "Factorise $x^2 - 49$.",
    answer: "(x + 7)(x − 7)",
    explain: "$49 = 7^2$, so $a = x$ and $b = 7$.",
  },
  { type: "h", text: "Order matters" },
  {
    type: "p",
    md: "In $36 - p^2$ the number comes first, so the **number** leads both brackets: $(6 + p)(6 - p)$.\nTurning it round to $(p + 6)(p - 6)$ gives $p^2 - 36$ — the negative of what was asked. The two differ by a factor of $-1$, and a marker will not accept one for the other.",
  },
  noteFigure(orderBody, orderAlt, 740, 240,
    "36 − p² and p² − 36 factorise differently: whatever starts the expression starts both brackets", "dots-term-order"),
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q20",
    md: "The identity itself was known. It went wrong whenever the letter was not the first term: candidates swapped the terms round and factorised as though the square of the letter came first. Full-mark answers kept the terms in the order given and then cancelled whole brackets.",
    source: "ccea-cer:maths:2025-summer:M4:Q20",
  },
  {
    type: "gate", id: "g2", kind: "choice",
    prompt: "Factorise $100 - w^2$.",
    options: ["$(10 + w)(10 - w)$", "$(w + 10)(w - 10)$", "$(10 - w)^2$"],
    answer: "$(10 + w)(10 - w)$",
    explain: "The second gives $w^2 - 100$; the third has a middle term.",
  },
  { type: "h", text: "Square-root the whole term" },
  {
    type: "p",
    md: "A term is a perfect square when its **coefficient** is a square number and its **index** is even. So:\n$4x^2 = (2x)^2$, because $2x \\times 2x = 4x^2$.\n$25a^2 = (5a)^2$ and $4b^2 = (2b)^2$, so $25a^2 - 4b^2 = (5a + 2b)(5a - 2b)$.\n$\\dfrac{x^2}{4} = \\left(\\dfrac{x}{2}\\right)^2$, so $\\dfrac{x^2}{4} - 9 = \\left(\\dfrac{x}{2} + 3\\right)\\left(\\dfrac{x}{2} - 3\\right)$.\nThe commonest loss is rooting the letter and forgetting the number, which gives brackets that expand to the wrong thing.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2024 M4 Q18 and Summer 2023 M4 Q19",
    md: "Under a tenth of candidates reached full marks on the harder part in 2024, where three letters were involved and the squared coefficients were the obstacle. In 2023 a fractional coefficient stopped most candidates recognising the pattern at all, and the majority scored zero.",
    source: "ccea-cer:maths:2024-summer:M4:Q18",
  },
  {
    type: "gate", id: "g3", kind: "blank",
    prompt: "Factorise $9m^2 - 64$.",
    answer: "(3m + 8)(3m − 8)",
    explain: "$9m^2 = (3m)^2$ and $64 = 8^2$.",
  },
  { type: "h", text: "Common factor first, then look again" },
  {
    type: "p",
    md: "$5x^2 - 45$ is **not** a difference of two squares as it stands, because $5x^2$ is not a perfect square. Take the common factor out and it becomes one:\n$5x^2 - 45 = 5(x^2 - 9) = 5(x + 3)(x - 3)$.\nThat is what **'factorise fully'** is asking for. Two half-answers lose marks: stopping at $5(x^2 - 9)$, and hiding the factor inside as $(2n + 6)(2n - 6)$ — which expands correctly but leaves a 2 in each bracket.\nThe habit worth building: after every common factor, ask the question again. Is what is left still a difference of two squares?",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q10",
    md: "Taking out only the number, and not the letter it shared, scored nothing for that part. Others took the factor out correctly and then stopped, leaving a bracket that still factorised.",
    source: "ccea-cer:maths:2025-summer:M4:Q10",
  },
  {
    type: "gate", id: "g4", kind: "choice",
    prompt: "Factorise fully $8x^2 - 2$.",
    options: ["$2(2x + 1)(2x - 1)$", "$2(4x^2 - 1)$", "$(8x + 2)(x - 1)$"],
    answer: "$2(2x + 1)(2x - 1)$",
    explain: "Take out 2, then $4x^2 - 1 = (2x)^2 - 1^2$.",
  },
  { type: "h", text: "When it does not apply" },
  {
    type: "p",
    md: "$x^2 + 25$ is a **sum** of two squares. There is no factorisation with real numbers, and rearranging will not produce one. Two terms and a plus sign means stop.\n$x^2 - 20$ has only one perfect square: 20 is not a square number, so this needs surds and is not part of this statement.\nAnd 'factorise' never means 'solve'. $(x + 5)(x - 5)$ is a complete answer; adding $= 0$, or offering $x = 5$ and $x = -5$, answers a different question.",
  },
  {
    type: "gate", id: "g5", kind: "choice",
    prompt: "Which of these does **not** factorise?",
    options: ["$x^2 + 36$", "$x^2 - 36$", "$36 - x^2$"],
    answer: "$x^2 + 36$",
    explain: "A sum of two squares has no real factorisation. The other two are $(x + 6)(x - 6)$ and $(6 + x)(6 - x)$.",
  },
  { type: "h", text: "The identity as arithmetic" },
  {
    type: "p",
    md: "M3 gives you a calculator, but M7 Paper 1 does not, and there the identity is a shortcut worth knowing:\n$83^2 - 17^2 = (83 + 17)(83 - 17) = 100 \\times 66 = 6600$.\n$101^2 - 99^2 = 200 \\times 2 = 400$.\nTwo squares you would not want to work out become one easy product. Watch the trap: $(83 - 17)^2$ is a different number entirely.",
  },
  {
    type: "gate", id: "g6", kind: "number",
    prompt: "Without a calculator, $45^2 - 35^2 = $",
    answer: "800",
    explain: "$(45 + 35)(45 - 35) = 80 \\times 10 = 800$.",
  },
  { type: "h", text: "Where it is really going" },
  {
    type: "p",
    md: "The reason this identity is worth more than its two marks is what it does to fractions:\n$\\dfrac{x^2 - 16}{x + 4} = \\dfrac{(x + 4)(x - 4)}{x + 4} = x - 4$.\nNothing cancels until the top is factorised, and only **whole brackets** cancel — crossing out the $x^2$ against the $x$ is worth nothing. That is the M4 question this topic is preparing you for.",
  },
  {
    type: "gate", id: "g7", kind: "blank",
    prompt: "Simplify $\\dfrac{x^2 - 25}{x - 5}$.",
    answer: "x + 5",
    explain: "$\\dfrac{(x + 5)(x - 5)}{x - 5} = x + 5$.",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** $a^2 - b^2 = (a + b)(a - b)$; common factor out first; square-root the coefficient as well as the letter; the first term of the expression leads both brackets; a sum of two squares does not factorise.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "Sums of two squares do not factorise. Differences where a term is not a perfect square ($x^2 - 20$) would need surds, and differences of cubes ($x^3 - 8$) are not on this specification. Solving is M3-NA-11.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "In M3, expect 1-2 marks, usually as one part of a two-part 'Factorise'. In M4 the same identity carries much more weight, and in M7 Paper 1 it turns up as arithmetic.\nThe **first** mark, where there is one, is for recognising the pattern — writing $64 = 8^2$ and $9k^2 = (3k)^2$ shows the marker what you have seen. The **last** mark is the pair of brackets, in the order the expression was written, fully factorised.\nIf you are unsure, expand your answer back. The middle terms must cancel, and the first and last terms must match the question exactly, signs included.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.02` },
  { type: "prompt", promptId: `rp.${T}.03` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.10` },
];

assertNoFailures("t5 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
