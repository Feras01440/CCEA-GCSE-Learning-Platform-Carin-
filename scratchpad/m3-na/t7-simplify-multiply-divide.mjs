/** maths.m3.simplifying-multiplying-and-dividing-algebraic-fractions — H bundle (difficulty 5). */
import fs from "node:fs";
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, equiv, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.simplifying-multiplying-and-dividing-algebraic-fractions";
const SLUG = "simplifying-multiplying-and-dividing-algebraic-fractions";
const REF = ["M3-NA-09"];
const insight = JSON.parse(fs.readFileSync(`packs/maths/insights/m3.${SLUG}.json`, "utf8"));

// ---------------------------------------------------------------- symbolic checks
const P = [{ x: 1 }, { x: 5.5 }, { x: -1.5 }];
const at = (v, pts = [1, 5.5, -1.5]) => pts.map((p) => ({ [v]: p }));
const C = {
  idx1: equiv("6x²/(8x)", "6*x**2/(8*x)", "3*x/4", at("x", [1, 5.5, -1.5])),
  idx2: equiv("15x⁵/(20x²)", "15*x**5/(20*x**2)", "3*x**3/4", at("x", [1, 5.5, -1.5])),
  mul1: equiv("(2x²/3)(x/6)", "(2*x**2/3)*(x/6)", "x**3/9", P),
  mul2: equiv("(3a/4)(8/(9a²))", "(3*a/4)*(8/(9*a**2))", "2/(3*a)", at("a", [1, 5.5, -1.5])),
  mul3: equiv("((x+2)/5)(10/(x+2))", "((x+2)/5)*(10/(x+2))", "2", P),
  s1: equiv("(x²-9)/(x²+7x+12)", "(x**2-9)/(x**2+7*x+12)", "(x-3)/(x+4)", P),
  s2: equiv("(x²+5x+6)/(x²-4)", "(x**2+5*x+6)/(x**2-4)", "(x+3)/(x-2)", P),
  s3: equiv("(2x+10)/(x²-25)", "(2*x+10)/(x**2-25)", "2/(x-5)", P),
  s4: equiv("(x²-7x+12)/(x²-16)", "(x**2-7*x+12)/(x**2-16)", "(x-3)/(x+4)", P),
  s5: equiv("(3x²-27)/(x²+2x-15)", "(3*x**2-27)/(x**2+2*x-15)", "3*(x+3)/(x+5)", P),
  s6: equiv("(25-w²)/(w²-3w-10)", "(25-w**2)/(w**2-3*w-10)", "-(5+w)/(w+2)", at("w", [1, 5.5, -1.5])),
  s7: equiv("(x²-x-20)/(x²-25)", "(x**2-x-20)/(x**2-25)", "(x+4)/(x+5)", P),
  d1: equiv("div1", "((x**2-16)/(3*x)) / ((x+4)/(6*x**2))", "2*x*(x-4)", P),
  d2: equiv("div2", "((x**2-4)/(x+5)) / ((x-2)/(2*x+10))", "2*(x+2)", P),
  d3: equiv("div3", "((6*x**2)/(x**2-9)) / ((2*x)/(x+3))", "3*x/(x-3)", P),
  d4: equiv("div4", "((x**2+6*x+8)/(x**2-1)) / ((x+4)/(x-1))", "(x+2)/(x+1)", at("x", [3, 5.5, -1.5])),
  g1: equiv("grouping", "(a*b+3*a+2*b+6)/(b**2-9)", "(a+2)/(b-3)", [{ a: 1, b: 1 }, { a: 4, b: 7 }, { a: -2.5, b: 0.5 }]),
  m4: equiv("mul4", "((x+3)/(x**2-16))*((x-4)/(x+3))", "1/(x+4)", P),
  m5: equiv("mul5", "((x**2-1)/(4*x))*((2*x)/(x-1))", "(x+1)/2", at("x", [3, 5.5, -1.5])),
};
assertNoFailures("t7 symbolic");

// ---------------------------------------------------------------- figures
const cancelBody = `
<g ${TXT} font-size='16' text-anchor='middle'>
  <text x='180' y='32'>factorise, then cancel a whole bracket</text>
  <text x='560' y='32'>cancelling single terms does not work</text>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.5'>
  <path d='M60 118 L300 118'/>
  <path d='M420 118 L700 118'/>
  <path d='M370 16 L370 250'/>
</g>
<g ${MATHTXT} font-size='21' text-anchor='middle'>
  <text x='180' y='100'>(x + 3)(x - 3)</text>
  <text x='180' y='152'>(x + 3)(x + 4)</text>
  <text x='180' y='226'>x - 3</text>
  <text x='560' y='100'>x² - 9</text>
  <text x='560' y='152'>x² + 7x + 12</text>
  <text x='560' y='226'>nothing cancels yet</text>
</g>
<g ${MATHTXT} font-size='21' text-anchor='middle'>
  <text x='180' y='250'>x + 4</text>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.5'>
  <path d='M148 232 L212 232'/>
  <ellipse cx='142' cy='94' rx='48' ry='17'/>
  <ellipse cx='142' cy='146' rx='48' ry='17'/>
</g>
<g stroke='currentColor' stroke-width='2' fill='none'>
  <path d='M524 92 L556 108'/>
  <path d='M524 144 L556 160'/>
</g>
<g ${TXT} font-size='14' text-anchor='middle'>
  <text x='180' y='278'>the ringed brackets are identical, so they divide out</text>
  <text x='560' y='278'>the crossed terms are parts of a sum, not factors</text>
</g>`;
const cancelAlt =
  "Two panels. On the left, (x + 3)(x - 3) over (x + 3)(x + 4) with the identical (x + 3) brackets ringed top and bottom, giving (x - 3) over (x + 4). On the right, x squared minus 9 over x squared plus 7x plus 12 with the x squared terms struck through and a note that nothing cancels until the expression is factorised.";
const cancelFig = svgFig(cancelBody, cancelAlt, 740, 296);

const flowBody = `
<g fill='none' stroke='currentColor' stroke-width='1.6'>
  <rect x='24' y='60' width='150' height='78' rx='10'/>
  <rect x='214' y='60' width='150' height='78' rx='10'/>
  <rect x='404' y='60' width='150' height='78' rx='10'/>
  <rect x='594' y='60' width='150' height='78' rx='10'/>
</g>
<g stroke='currentColor' stroke-width='1.6' fill='none'>
  <path d='M178 99 L206 99'/><path d='M198 93 L206 99 L198 105'/>
  <path d='M368 99 L396 99'/><path d='M388 93 L396 99 L388 105'/>
  <path d='M558 99 L586 99'/><path d='M578 93 L586 99 L578 105'/>
</g>
<g ${TXT} font-size='15' text-anchor='middle'>
  <text x='99' y='94'>flip the</text><text x='99' y='114'>second fraction</text>
  <text x='289' y='94'>factorise every</text><text x='289' y='114'>top and bottom</text>
  <text x='479' y='94'>cancel whole</text><text x='479' y='114'>brackets</text>
  <text x='669' y='94'>write the one</text><text x='669' y='114'>fraction left</text>
  <text x='384' y='36'>dividing algebraic fractions</text>
  <text x='384' y='182'>most candidates stop after the first two boxes</text>
</g>`;
const flowAlt =
  "A four-box flow for dividing algebraic fractions: flip the second fraction, factorise every top and bottom, cancel whole brackets, write the one fraction left. A note says most candidates stop after the first two boxes.";
const flowFig = svgFig(flowBody, flowAlt, 770, 200);

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statement M3-NA-09: simplify, multiply and divide algebraic fractions with linear or quadratic numerators and denominators. Adding and subtracting fractions with algebraic denominators is M4-NA-03 and is excluded; so is anything needing a cubic factorisation.",
  formula: "Nothing on the Higher formula sheet applies. a/b × c/d = ac/bd is named in the Teacher Guidance; the difference of two squares and 'divide by multiplying by the reciprocal' are must-know.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Simplify, Simplify fully, Factorise, Express, Show that).",
  tariff: "Tariffs match the corpus: a single-term simplification 1-2 marks, a factorise-and-cancel 3 marks, a multiplication 3 marks and a division 4 marks, all in the last third of the paper (November 2024 M4 Q19, Summer 2025 M4 Q20, November 2025 M4 Q22).",
  copy: "Compared by hand against the M3 and M4 papers and schemes read for this batch (Summer 2025 M3, Summer 2024 M3, November 2025 M3, Summer 2026 M3): every fraction here is new, including the two quoted only inside the spec callout, and no eight-word sequence is in common.",
  symbolic: "Each simplification verified by evaluating the original fraction and the simplified form at three values (1, 5.5 and −1.5, or a pair of values for two-letter items) and confirming they agree.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Simplify $\\dfrac{x^2 - 9}{x^2 + 7x + 12}$.",
    figure: cancelFig,
    steps: [
      {
        n: 1,
        working: "Nothing cancels yet. Factorise the top: $x^2 - 9$ is a difference of two squares, so it is $(x + 3)(x - 3)$.",
        decision: "A fraction only cancels when top and bottom are written as **products**. As sums, $x^2 - 9$ and $x^2 + 7x + 12$ share nothing that can be crossed out.",
        whyMenu: {
          options: [
            "Because cancelling divides, and you can only divide out a factor of the whole top and the whole bottom",
            "Because the $x^2$ terms are not exactly the same",
            "Because the bottom has three terms and the top has two",
          ],
          correct: 0,
          explain: "$\\dfrac{6}{8} = \\dfrac{2 \\times 3}{2 \\times 4}$ cancels because 2 is a factor of both; $\\dfrac{2 + 3}{2 + 4}$ does not cancel at all.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "Factorise the bottom: two numbers multiplying to 12 and adding to 7 are 3 and 4, so $x^2 + 7x + 12 = (x + 3)(x + 4)$.",
        decision: "Both parts get factorised before anything else happens. Doing one and stopping leaves nothing to compare.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$\\dfrac{(x + 3)(x - 3)}{(x + 3)(x + 4)}$ — the bracket $(x + 3)$ appears in both, so it divides out.",
        decision: "Cancel the whole bracket, not part of it. What remains is a single fraction with no common factor left.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$\\dfrac{x - 3}{x + 4}$",
        decision: "Check that nothing else cancels: $(x - 3)$ and $(x + 4)$ are different brackets, so this is fully simplified. Leave it as brackets rather than expanding.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$\\dfrac{x - 3}{x + 4}$",
    twin: {
      stem: "Simplify $\\dfrac{x^2 + 5x + 6}{x^2 - 4}$.",
      answer: algAnswer("\\frac{x+3}{x-2}", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Simplify $\\dfrac{6x^2}{8x}$ and $\\dfrac{2x^2}{3} \\times \\dfrac{x}{6}$.",
    steps: [
      {
        n: 1,
        working: "$\\dfrac{6x^2}{8x}$: the numbers share a factor of 2, so $\\dfrac{6}{8} = \\dfrac{3}{4}$. The letters divide by subtracting indices: $\\dfrac{x^2}{x} = x$.",
        decision: "Numbers and letters are handled separately. Dividing powers of the same letter **subtracts** the indices; it never divides them.",
        whyMenu: {
          options: [
            "$\\dfrac{x^2}{x^1} = x^{2-1} = x$",
            "$\\dfrac{x^2}{x^1} = x^{2 \\div 1} = x^2$",
            "$\\dfrac{x^2}{x^1} = x^{2+1} = x^3$",
          ],
          correct: 0,
          explain: "$x^2 = x \\times x$, and one of them cancels with the single $x$ below.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$\\dfrac{6x^2}{8x} = \\dfrac{3x}{4}$",
        decision: "Both parts simplified. There is no bracket here, so it is ordinary index work, not factorising.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$\\dfrac{2x^2}{3} \\times \\dfrac{x}{6} = \\dfrac{2x^2 \\times x}{3 \\times 6} = \\dfrac{2x^3}{18}$",
        decision: "To multiply, multiply the tops and multiply the bottoms: $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$. Multiplying powers of the same letter **adds** the indices.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$\\dfrac{2x^3}{18} = \\dfrac{x^3}{9}$",
        decision: "Simplify at the end: 2 divides into 18 nine times. Cancelling before multiplying would have worked too and kept the numbers smaller.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$\\dfrac{3x}{4}$ and $\\dfrac{x^3}{9}$",
    twin: {
      stem: "Simplify $\\dfrac{15x^5}{20x^2}$.",
      answer: algAnswer("\\frac{3x^3}{4}", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 0, studentSupplies: [1, 2, 3, 4] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
  {
    id: `we.${T}.03`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Simplify $\\dfrac{x^2 - 16}{3x} \\div \\dfrac{x + 4}{6x^2}$.",
    figure: flowFig,
    steps: [
      {
        n: 1,
        working: "$\\dfrac{x^2 - 16}{3x} \\times \\dfrac{6x^2}{x + 4}$",
        decision: "Dividing by a fraction means multiplying by its reciprocal: turn the **second** fraction upside down and change the sign to a multiplication. The first fraction is untouched.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$x^2 - 16 = (x + 4)(x - 4)$, so $\\dfrac{(x + 4)(x - 4)}{3x} \\times \\dfrac{6x^2}{x + 4}$",
        decision: "Now factorise everything that will factorise. This is the step most candidates never reach, and it is where the question is actually won.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$(x + 4)$ cancels, and $\\dfrac{6x^2}{3x} = 2x$.",
        decision: "Cancel across the multiplication: any bracket on a top may cancel with the same bracket on a bottom, and the numbers and powers simplify as usual.",
        whyMenu: {
          options: [
            "Because in a product of fractions every top is multiplied by every top, so a common factor anywhere cancels",
            "Because $(x + 4)$ appears twice, so it becomes $(x+4)^2$",
            "Because only the first fraction may be cancelled",
          ],
          correct: 0,
          explain: "The whole thing is one fraction, $\\dfrac{(x+4)(x-4) \\times 6x^2}{3x(x+4)}$, so any matching factor divides out.",
        },
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$2x(x - 4)$",
        decision: "There is no denominator left, so the answer is a product rather than a fraction. Leaving it factorised is fine; $2x^2 - 8x$ is equally acceptable.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$2x(x - 4)$, or $2x^2 - 8x$",
    twin: {
      stem: "Simplify $\\dfrac{6x^2}{x^2 - 9} \\div \\dfrac{2x}{x + 3}$.",
      answer: algAnswer("\\frac{3x}{x-3}", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3, 4] }, { showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.03`,
    version: 1,
  },
  {
    id: `we.${T}.04`,
    topic: T, specRefs: REF, paper: M3,
    stem: "Simplify $\\dfrac{25 - w^2}{w^2 - 3w - 10}$.",
    steps: [
      {
        n: 1,
        working: "Top: $25 - w^2$ is a difference of two squares with the **number first**, so it is $(5 + w)(5 - w)$.",
        decision: "Keep the order the question wrote. $(w + 5)(w - 5)$ would be $w^2 - 25$, the negative of the top, and the answer would come out with the wrong sign.",
        whyMenu: {
          options: [
            "$(w + 5)(w - 5) = w^2 - 25$, which is not the top",
            "$(w + 5)(w - 5)$ is the same thing rearranged",
            "The order never matters in a factorisation",
          ],
          correct: 0,
          explain: "Swapping the terms multiplies the whole expression by $-1$.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "Bottom: two numbers multiplying to $-10$ and adding to $-3$ are $-5$ and $2$, so $w^2 - 3w - 10 = (w - 5)(w + 2)$.",
        decision: "Ordinary quadratic factorising. Now compare: the top has $(5 - w)$ and the bottom has $(w - 5)$ — not identical, but very nearly.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$(5 - w) = -(w - 5)$, so $\\dfrac{(5 + w)(5 - w)}{(w - 5)(w + 2)} = \\dfrac{-(5 + w)(w - 5)}{(w - 5)(w + 2)}$",
        decision: "Two brackets that are reverses of each other differ by a factor of $-1$. Pulling the minus sign out makes them identical, and then they cancel.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$-\\dfrac{5 + w}{w + 2}$",
        decision: "The minus stays with the fraction. Writing $\\dfrac{-(w + 5)}{w + 2}$ or $\\dfrac{-w - 5}{w + 2}$ says the same thing.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$-\\dfrac{5 + w}{w + 2}$",
    twin: {
      stem: "Simplify $\\dfrac{x^2 - x - 20}{x^2 - 25}$.",
      answer: algAnswer("\\frac{x+4}{x+5}", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.04`,
    version: 1,
  },
];

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`, topic: T, specRefs: REF, when: "pre",
    items: [
      dxItem("01", "Simplify $\\dfrac{6x^2}{8x}$.", "Simplify a single-term fraction with indices",
        [
          ["$\\dfrac{3x}{4}$", true, null, "$\\dfrac{6}{8} = \\dfrac{3}{4}$ and $\\dfrac{x^2}{x} = x$, because dividing powers subtracts the indices."],
          ["$\\dfrac{3x^2}{4}$", false, "maths.indices.divide-powers-instead-of-subtract", "The $x$ on the bottom was ignored. $\\dfrac{x^2}{x} = x^{2-1} = x$."],
          ["$\\dfrac{6x}{8}$", false, "maths.indices.divide-powers-instead-of-subtract", "The letters were dealt with but the numbers were not. $\\dfrac{6}{8}$ cancels to $\\dfrac{3}{4}$."],
        ], 20),
      dxItem("02", "$\\dfrac{x^2 - 9}{x^2 + 7x + 12}$. What is the first move?", "Factorise before cancelling",
        [
          ["Factorise the top and the bottom", true, null, "Nothing can cancel while both parts are sums. Once they are products, matching brackets divide out."],
          ["Cancel the $x^2$ terms", false, "maths.alg-fractions.cancel-terms-not-factors", "The $x^2$ terms are parts of a sum, not factors of the whole expression. November 2024 M4 Q19 reported weaker candidates cancelling single terms across the fraction."],
          ["Set it equal to zero and solve", false, "maths.alg-fractions.treat-expression-as-equation", "This is an expression, not an equation. 'Simplify' asks for a tidier expression, never a value of $x$."],
        ], 25),
      dxItem("03", "Simplify $\\dfrac{2x + 10}{x^2 - 25}$.", "Take out a common factor, then use the difference of two squares",
        [
          ["$\\dfrac{2}{x - 5}$", true, null, "$2x + 10 = 2(x + 5)$ and $x^2 - 25 = (x + 5)(x - 5)$, so the $(x + 5)$ brackets cancel."],
          ["$\\dfrac{2x + 10}{x^2 - 25}$ does not simplify", false, "maths.factorising.not-fully-factorised", "It does, once both parts are factorised. The top has a common factor of 2 and the bottom is a difference of two squares."],
          ["$\\dfrac{2x + 2}{x - 5}$", false, "maths.alg-fractions.cancel-terms-not-factors", "The 10 and the 25 were treated as if they cancelled. Only whole factors cancel, which is why the factorising comes first."],
        ], 35),
      dxItem("04", "$\\dfrac{a}{b} \\div \\dfrac{c}{d} = $ ?", "Recall the rule for dividing fractions",
        [
          ["$\\dfrac{a}{b} \\times \\dfrac{d}{c}$", true, null, "Multiply by the reciprocal of the **second** fraction. The first fraction is left exactly as it is."],
          ["$\\dfrac{b}{a} \\times \\dfrac{c}{d}$", false, "maths.alg-fractions.divide-flip-then-stop", "The wrong fraction was inverted. It is always the one you are dividing by."],
          ["$\\dfrac{ac}{bd}$", false, "maths.alg-fractions.divide-flip-then-stop", "That is the rule for multiplying. Division needs the second fraction turned over first."],
        ], 20),
      dxItem("05", "After flipping in $\\dfrac{x^2 - 16}{3x} \\times \\dfrac{6x^2}{x + 4}$, what comes next?", "Carry a division through to the end",
        [
          ["Factorise $x^2 - 16$, then cancel", true, null, "$(x + 4)(x - 4)$ on the top cancels with the $(x + 4)$ on the bottom. November 2025 M4 Q22 reported only one in twenty getting this far."],
          ["Multiply everything out and stop", false, "maths.alg-fractions.divide-flip-then-stop", "Expanding hides the factors. Most candidates inverted, expanded and then stalled with nothing cancelling."],
          ["Cancel the $x^2$ with the $3x$", false, "maths.alg-fractions.cancel-terms-not-factors", "$x^2$ is part of $x^2 - 16$, not a factor of it. Nothing on the top may be cancelled until it is factorised."],
        ], 40),
      dxItem("06", "Factorise $25 - w^2$ for use in a fraction.", "Keep the term order in a difference of two squares",
        [
          ["$(5 + w)(5 - w)$", true, null, "The number comes first in the expression, so it comes first in both brackets. Summer 2025 M4 Q20 named this exact point."],
          ["$(w + 5)(w - 5)$", false, "maths.factorising.dots-term-order", "That is $w^2 - 25$, the negative. Used in a fraction it puts a sign error into the final answer."],
          ["$(5 - w)^2$", false, "maths.factorising.dots-term-order", "That expands to $25 - 10w + w^2$, which has a middle term."],
        ], 30),
      dxItem("07", "Simplify $\\dfrac{x + 3}{x^2 - 16} \\times \\dfrac{x - 4}{x + 3}$.", "Cancel across a product of fractions",
        [
          ["$\\dfrac{1}{x + 4}$", true, null, "$(x + 3)$ cancels, and $x^2 - 16 = (x + 4)(x - 4)$, so the $(x - 4)$ cancels too, leaving 1 on the top."],
          ["$\\dfrac{x - 4}{x^2 - 16}$", false, "maths.alg-fractions.divide-flip-then-stop", "The $(x + 3)$ was cancelled and the work stopped there. The denominator still factorises, and then more cancels."],
          ["$x + 4$", false, "maths.alg-fractions.cancel-terms-not-factors", "The answer was turned upside down. After cancelling, the 1 stays on the top and $(x + 4)$ on the bottom."],
        ], 45),
      dxItem("08", "A question says 'Simplify $\\dfrac{x^2 + 5x + 6}{x^2 - 4}$'. Which answer would a marker accept?", "Simplify, do not solve",
        [
          ["$\\dfrac{x + 3}{x - 2}$", true, null, "A single fraction in its lowest terms, left as brackets. That is what 'simplify' asks for."],
          ["$x = -2$ or $x = -3$", false, "maths.alg-fractions.treat-expression-as-equation", "Those solve $x^2 + 5x + 6 = 0$, a question that was not asked. November 2024 M4 Q19 reported candidates trying to solve an expression."],
          ["$\\dfrac{x + 3}{x - 2} = 0$", false, "maths.alg-fractions.treat-expression-as-equation", "The simplification is right, but an expression is never set equal to anything. The extra line can cost the accuracy mark."],
        ], 30),
    ],
  },
];

// ---------------------------------------------------------------- questions
const mk = (n, o) => question({ id: `q.${T}.${String(n).padStart(4, "0")}`, topic: T, specRefs: REF, ...o });

const questions = [
  mk(1, {
    style: "practice", difficulty: 1, commandWords: ["Simplify"], paper: M7P1,
    setting: "Pure algebra, single terms, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q19"], solutionProgram: C.idx1 + " | " + C.idx2,
    parts: [
      {
        id: "a", verb: "simplify", marks: 2,
        stem: "Simplify $\\dfrac{6x^2}{8x}$.",
        answer: algAnswer("\\frac{3x}{4}", { equivalence: "equivalent" }),
        scheme: [MA("MA1", 1, "6/8 reduced to 3/4, or x²/x reduced to x"), A("A1", 1, "3x/4", { dependsOn: ["MA1"] })],
        hints: ["Deal with the numbers and the letters separately.", "$\\dfrac{x^2}{x} = x^{2-1}$."],
        workedSolution: "$\\dfrac{6}{8} = \\dfrac{3}{4}$ and $\\dfrac{x^2}{x} = x$, so $\\dfrac{6x^2}{8x} = \\dfrac{3x}{4}$.",
        commonErrors: [{
          misconception: "maths.indices.divide-powers-instead-of-subtract",
          pattern: { kind: "algebraic", latex: "\\frac{3x^2}{4}" },
          feedback: "The $x$ on the bottom was left out. Dividing powers of the same letter subtracts the indices, so $x^2 \\div x = x$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "simplify", marks: 2,
        stem: "Simplify $\\dfrac{15x^5}{20x^2}$.",
        answer: algAnswer("\\frac{3x^3}{4}", { equivalence: "equivalent" }),
        scheme: [MA("MA1", 1, "15/20 reduced to 3/4, or x⁵/x² reduced to x³"), A("A1", 1, "3x³/4", { dependsOn: ["MA1"] })],
        hints: ["$15$ and $20$ share a factor of 5.", "$x^5 \\div x^2 = x^3$."],
        workedSolution: "$\\dfrac{15}{20} = \\dfrac{3}{4}$ and $\\dfrac{x^5}{x^2} = x^3$, so the answer is $\\dfrac{3x^3}{4}$.",
        commonErrors: [{
          misconception: "maths.indices.divide-powers-instead-of-subtract",
          pattern: { kind: "algebraic", latex: "\\frac{3x^{2.5}}{4}" },
          feedback: "The indices were divided instead of subtracted. $x^5 \\div x^2 = x^{5-2} = x^3$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: false,
      },
    ],
  }),
  mk(2, {
    style: "practice", difficulty: 2, commandWords: ["Simplify"],
    setting: "Pure algebra, multiplying single-term fractions",
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q19"], solutionProgram: C.mul1 + " | " + C.mul2,
    parts: [
      {
        id: "a", verb: "simplify", marks: 2,
        stem: "Simplify $\\dfrac{2x^2}{3} \\times \\dfrac{x}{6}$.",
        answer: algAnswer("\\frac{x^3}{9}", { equivalence: "equivalent" }),
        scheme: [MA("MA1", 1, "2x³/18 or equivalent before simplifying"), A("A1", 1, "x³/9", { dependsOn: ["MA1"] })],
        hints: ["Tops multiply, bottoms multiply.", "$x^2 \\times x = x^3$.", "$\\dfrac{2}{18}$ reduces."],
        workedSolution: "$\\dfrac{2x^2 \\times x}{3 \\times 6} = \\dfrac{2x^3}{18} = \\dfrac{x^3}{9}$.",
        commonErrors: [{
          misconception: "maths.indices.multiply-powers-instead-of-add",
          pattern: { kind: "algebraic", latex: "\\frac{x^2}{9}" },
          feedback: "$x^2 \\times x = x^3$: multiplying powers of the same letter adds the indices.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Simplify $\\dfrac{3a}{4} \\times \\dfrac{8}{9a^2}$.",
        answer: algAnswer("\\frac{2}{3a}", { variables: ["a"], equivalence: "equivalent" }),
        scheme: [
          MA("MA1", 1, "24a/(36a²) or equivalent single fraction"),
          MA("MA2", 1, "numbers reduced: 24/36 = 2/3"),
          A("A1", 1, "2/(3a)", { dependsOn: ["MA2"] }),
        ],
        hints: ["Multiply the tops and the bottoms, or cancel first.", "$\\dfrac{a}{a^2} = \\dfrac{1}{a}$.", "$\\dfrac{24}{36} = \\dfrac{2}{3}$."],
        workedSolution: "$\\dfrac{3a \\times 8}{4 \\times 9a^2} = \\dfrac{24a}{36a^2} = \\dfrac{2}{3a}$.",
        commonErrors: [{
          misconception: "maths.indices.divide-powers-instead-of-subtract",
          pattern: { kind: "algebraic", latex: "\\frac{2a}{3}" },
          feedback: "The letter ended up on the wrong side. There are two $a$s below and one above, so one $a$ is left on the bottom.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(3, {
    style: "practice", difficulty: 3, commandWords: ["Simplify"],
    setting: "Pure algebra, factorise and cancel",
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q19"], solutionProgram: C.s1,
    figures: [cancelFig],
    parts: [{
      id: "main", verb: "simplify", marks: 3,
      stem: "Simplify $\\dfrac{x^2 - 9}{x^2 + 7x + 12}$.",
      answer: algAnswer("\\frac{x-3}{x+4}", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "x² − 9 factorised as (x + 3)(x − 3)"),
        A("A1", 1, "x² + 7x + 12 factorised as (x + 3)(x + 4)"),
        MA("MA1", 1, "(x − 3)/(x + 4) after cancelling (x + 3)"),
      ],
      hints: ["Nothing can cancel until both parts are products.", "The top is a difference of two squares.", "The bottom needs two numbers multiplying to 12 and adding to 7."],
      workedSolution: "$\\dfrac{(x + 3)(x - 3)}{(x + 3)(x + 4)} = \\dfrac{x - 3}{x + 4}$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.cancel-terms-not-factors",
          pattern: { kind: "algebraic", latex: "\\frac{-9}{7x+12}" },
          feedback: "The $x^2$ terms were crossed out. They are parts of a sum, not factors, so nothing may be removed until both parts are written as products.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        },
        {
          misconception: "maths.factorising.not-fully-factorised",
          pattern: { kind: "algebraic", latex: "\\frac{(x+3)(x-3)}{(x+3)(x+4)}" },
          feedback: "Both factorisations are correct, which earns two marks. The last mark is for cancelling the common bracket and writing the single fraction that is left.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(4, {
    style: "practice", difficulty: 3, commandWords: ["Simplify"],
    setting: "Pure algebra, a common factor on the top",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"], solutionProgram: C.s3 + " | " + C.s4,
    parts: [
      {
        id: "a", verb: "simplify", marks: 3,
        stem: "Simplify $\\dfrac{2x + 10}{x^2 - 25}$.",
        answer: algAnswer("\\frac{2}{x-5}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "2x + 10 factorised as 2(x + 5)"),
          A("A1", 1, "x² − 25 factorised as (x + 5)(x − 5)"),
          MA("MA1", 1, "2/(x − 5)"),
        ],
        hints: ["The top has a common factor.", "The bottom is a difference of two squares.", "Cancel the whole $(x + 5)$ bracket."],
        workedSolution: "$\\dfrac{2(x + 5)}{(x + 5)(x - 5)} = \\dfrac{2}{x - 5}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.cancel-terms-not-factors",
          pattern: { kind: "algebraic", latex: "\\frac{2x+2}{x-5}" },
          feedback: "The 10 was cancelled against the 25 as though they were factors. Factorise both parts first; then the whole bracket $(x + 5)$ is what divides out.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Simplify $\\dfrac{x^2 - 7x + 12}{x^2 - 16}$.",
        answer: algAnswer("\\frac{x-3}{x+4}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "x² − 7x + 12 factorised as (x − 3)(x − 4)"),
          A("A1", 1, "x² − 16 factorised as (x + 4)(x − 4)"),
          MA("MA1", 1, "(x − 3)/(x + 4)"),
        ],
        hints: ["Both numbers on the top are negative.", "The bottom is a difference of two squares.", "$(x - 4)$ is the common bracket."],
        workedSolution: "$\\dfrac{(x - 3)(x - 4)}{(x + 4)(x - 4)} = \\dfrac{x - 3}{x + 4}$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "\\frac{x-3}{x-4}" },
          feedback: "The wrong bracket was cancelled. $(x - 4)$ appears on both the top and the bottom; $(x + 4)$ appears only on the bottom and stays there.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(5, {
    style: "practice", difficulty: 4, commandWords: ["Simplify"], emphasis: ["fully"],
    setting: "Pure algebra, a common factor and then a difference of two squares",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"], solutionProgram: C.s5,
    parts: [{
      id: "main", verb: "simplify", marks: 4,
      stem: "Simplify **fully** $\\dfrac{3x^2 - 27}{x^2 + 2x - 15}$.",
      answer: algAnswer("\\frac{3(x+3)}{x+5}", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "common factor 3 taken out of the numerator: 3(x² − 9)"),
        A("A1", 1, "3(x + 3)(x − 3)", { dependsOn: ["M1"] }),
        A("A2", 1, "x² + 2x − 15 factorised as (x + 5)(x − 3)"),
        MA("MA1", 1, "3(x + 3)/(x + 5)"),
      ],
      hints: ["The top has a common factor of 3.", "What is left is a difference of two squares.", "The bottom needs two numbers multiplying to $-15$ and adding to 2.", "$(x - 3)$ is the common bracket."],
      workedSolution: "$\\dfrac{3(x^2 - 9)}{x^2 + 2x - 15} = \\dfrac{3(x + 3)(x - 3)}{(x + 5)(x - 3)} = \\dfrac{3(x + 3)}{x + 5}$.",
      commonErrors: [
        {
          misconception: "maths.factorising.common-factor-then-stop",
          pattern: { kind: "algebraic", latex: "\\frac{3(x^2-9)}{(x+5)(x-3)}" },
          feedback: "The common factor is out and the bottom is factorised, so two marks stand. The bracket $(x^2 - 9)$ still factorises, and only then does anything cancel.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        },
        {
          misconception: "maths.alg-fractions.cancel-terms-not-factors",
          pattern: { kind: "algebraic", latex: "\\frac{3x^2-27}{2x-15}" },
          feedback: "The $x^2$ terms were cancelled. Only whole factors cancel; the factorising has to come first.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(6, {
    style: "practice", difficulty: 4, commandWords: ["Simplify"],
    setting: "Pure algebra, reversed difference of two squares",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"], solutionProgram: C.s6,
    parts: [{
      id: "main", verb: "simplify", marks: 4,
      stem: "Simplify $\\dfrac{25 - w^2}{w^2 - 3w - 10}$.",
      answer: algAnswer("-\\frac{5+w}{w+2}", { variables: ["w"], equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "25 − w² factorised as (5 + w)(5 − w), keeping the order given"),
        A("A1", 1, "w² − 3w − 10 factorised as (w − 5)(w + 2)"),
        MA("MA1", 1, "(5 − w) rewritten as −(w − 5), or an equivalent handling of the sign"),
        A("A2", 1, "−(5 + w)/(w + 2), or equivalent", { dependsOn: ["MA1"] }),
      ],
      hints: ["The top is a difference of two squares with the number first.", "The bottom factorises with $-5$ and $+2$.", "$(5 - w)$ and $(w - 5)$ are the same apart from a factor of $-1$.", "Pull the minus out in front of the whole fraction."],
      workedSolution: "$\\dfrac{(5 + w)(5 - w)}{(w - 5)(w + 2)} = \\dfrac{-(5 + w)(w - 5)}{(w - 5)(w + 2)} = -\\dfrac{5 + w}{w + 2}$.",
      commonErrors: [{
        misconception: "maths.factorising.dots-term-order",
        pattern: { kind: "algebraic", latex: "\\frac{w+5}{w+2}" },
        feedback: "The top was factorised as $(w + 5)(w - 5)$, which is $w^2 - 25$ rather than $25 - w^2$, so the minus sign disappeared. Summer 2025 M4 Q20 named this: keep the terms in the order the question wrote them.",
        marksTypicallyEarned: 2,
        source: "ccea-cer:maths:2025-summer:M4:Q20",
      }],
      requiresWorking: true,
    }],
  }),
  mk(7, {
    style: "practice", difficulty: 3, commandWords: ["Simplify"],
    setting: "Pure algebra, multiplying two bracketed fractions",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22"], solutionProgram: C.mul3 + " | " + C.m4,
    parts: [
      {
        id: "a", verb: "simplify", marks: 2,
        stem: "Simplify $\\dfrac{x + 2}{5} \\times \\dfrac{10}{x + 2}$.",
        answer: numAnswer(2),
        scheme: [MA("MA1", 1, "(x + 2) cancelled top and bottom"), A("A1", 1, "2", { dependsOn: ["MA1"] })],
        hints: ["The same bracket appears above and below.", "$\\dfrac{10}{5} = 2$."],
        workedSolution: "The $(x + 2)$ brackets cancel, leaving $\\dfrac{10}{5} = 2$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.cancel-terms-not-factors",
          pattern: { kind: "algebraic", latex: "\\frac{10x+20}{5x+10}" },
          feedback: "Everything was expanded first, which hides the common bracket. Cancel before multiplying out and the answer falls out in one line.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q22",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Simplify $\\dfrac{x + 3}{x^2 - 16} \\times \\dfrac{x - 4}{x + 3}$.",
        answer: algAnswer("\\frac{1}{x+4}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "x² − 16 factorised as (x + 4)(x − 4)"),
          A("A1", 1, "(x + 3) and (x − 4) both cancelled", { dependsOn: ["M1"] }),
          MA("MA1", 1, "1/(x + 4)"),
        ],
        hints: ["Factorise the only part that will factorise.", "Two different brackets cancel here.", "When everything on the top cancels, a 1 is left there."],
        workedSolution: "$\\dfrac{(x + 3)(x - 4)}{(x + 4)(x - 4)(x + 3)} = \\dfrac{1}{x + 4}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.divide-flip-then-stop",
          pattern: { kind: "algebraic", latex: "\\frac{x-4}{x^2-16}" },
          feedback: "The $(x + 3)$ was cancelled and the work stopped. The denominator still factorises, and the $(x - 4)$ then cancels as well.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q22",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(8, {
    style: "practice", difficulty: 4, commandWords: ["Simplify"],
    setting: "Pure algebra, dividing algebraic fractions",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22"], solutionProgram: C.d3,
    figures: [flowFig],
    parts: [{
      id: "main", verb: "simplify", marks: 4,
      stem: "Simplify $\\dfrac{6x^2}{x^2 - 9} \\div \\dfrac{2x}{x + 3}$.",
      answer: algAnswer("\\frac{3x}{x-3}", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "second fraction inverted and the division changed to a multiplication"),
        A("A1", 1, "x² − 9 factorised as (x + 3)(x − 3)"),
        MA("MA1", 1, "(x + 3) cancelled and 6x²/(2x) reduced to 3x"),
        A("A2", 1, "3x/(x − 3)", { dependsOn: ["MA1"] }),
      ],
      hints: ["Turn the second fraction over and multiply.", "$x^2 - 9$ is a difference of two squares.", "$\\dfrac{6x^2}{2x} = 3x$."],
      workedSolution: "$\\dfrac{6x^2}{(x + 3)(x - 3)} \\times \\dfrac{x + 3}{2x} = \\dfrac{6x^2}{2x(x - 3)} = \\dfrac{3x}{x - 3}$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.divide-flip-then-stop",
          pattern: { kind: "algebraic", latex: "\\frac{6x^2(x+3)}{(x+3)(x-3)2x}" },
          feedback: "The flip and the factorising are both done, which is two marks, but nothing was cancelled. November 2025 M4 Q22 reported only one in twenty finishing: most earned a mark or two and then stalled.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-november:M4:Q22",
        },
        {
          misconception: "maths.alg-fractions.divide-flip-then-stop",
          pattern: { kind: "algebraic", latex: "\\frac{12x^3}{(x^2-9)(x+3)}" },
          feedback: "The first fraction was inverted instead of the second, or the two were multiplied without flipping. It is always the fraction you are dividing **by** that turns over.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q22",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(9, {
    style: "practice", difficulty: 4, commandWords: ["Simplify"],
    setting: "Pure algebra, division with a common factor in a denominator",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22"], solutionProgram: C.d2,
    parts: [{
      id: "main", verb: "simplify", marks: 4,
      stem: "Simplify $\\dfrac{x^2 - 4}{x + 5} \\div \\dfrac{x - 2}{2x + 10}$.",
      answer: algAnswer("2(x+2)", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "inverted: (x² − 4)/(x + 5) × (2x + 10)/(x − 2)"),
        A("A1", 1, "x² − 4 = (x + 2)(x − 2) and 2x + 10 = 2(x + 5)", { dependsOn: ["M1"] }),
        MA("MA1", 1, "(x + 5) and (x − 2) both cancelled"),
        A("A2", 1, "2(x + 2), or 2x + 4", { dependsOn: ["MA1"] }),
      ],
      hints: ["Flip the second fraction.", "$x^2 - 4$ is a difference of two squares, and $2x + 10$ has a common factor.", "Two different brackets cancel.", "No denominator is left, so the answer is not a fraction."],
      workedSolution: "$\\dfrac{(x + 2)(x - 2)}{x + 5} \\times \\dfrac{2(x + 5)}{x - 2} = 2(x + 2)$.",
      commonErrors: [{
        misconception: "maths.factorising.common-factor-then-stop",
        pattern: { kind: "algebraic", latex: "\\frac{(x+2)(x-2)(2x+10)}{(x+5)(x-2)}" },
        feedback: "The flip is right and one factorisation is done, so two marks stand. $2x + 10$ also factorises, to $2(x + 5)$, and that is what lets the $(x + 5)$ cancel.",
        marksTypicallyEarned: 2,
        source: "ccea-cer:maths:2025-november:M4:Q22",
      }],
      requiresWorking: true,
    }],
  }),
  mk(10, {
    style: "practice", difficulty: 5, commandWords: ["Simplify"],
    setting: "Pure algebra, division needing three factorisations",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22"], solutionProgram: C.d4,
    parts: [{
      id: "main", verb: "simplify", marks: 4,
      stem: "Simplify $\\dfrac{x^2 + 6x + 8}{x^2 - 1} \\div \\dfrac{x + 4}{x - 1}$.",
      answer: algAnswer("\\frac{x+2}{x+1}", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "inverted: × (x − 1)/(x + 4)"),
        A("A1", 1, "x² + 6x + 8 = (x + 2)(x + 4)"),
        A("A2", 1, "x² − 1 = (x + 1)(x − 1)"),
        MA("MA1", 1, "(x + 4) and (x − 1) cancelled to give (x + 2)/(x + 1)"),
      ],
      hints: ["Flip first, then factorise everything.", "The top of the first fraction needs two numbers multiplying to 8 and adding to 6.", "$x^2 - 1$ is a difference of two squares.", "Two brackets cancel."],
      workedSolution: "$\\dfrac{(x + 2)(x + 4)}{(x + 1)(x - 1)} \\times \\dfrac{x - 1}{x + 4} = \\dfrac{x + 2}{x + 1}$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.divide-flip-then-stop",
        pattern: { kind: "algebraic", latex: "\\frac{(x^2+6x+8)(x-1)}{(x^2-1)(x+4)}" },
        feedback: "The flip earns the first mark. Nothing can cancel while the quadratics are still sums; factorise all three before looking for common brackets.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2025-november:M4:Q22",
      }],
      requiresWorking: true,
    }],
  }),
  mk(11, {
    style: "practice", difficulty: 5, commandWords: ["Simplify"],
    setting: "Pure algebra, factorising by grouping in the numerator",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q20"], solutionProgram: C.g1,
    parts: [{
      id: "main", verb: "simplify", marks: 4,
      stem: "Simplify $\\dfrac{ab + 3a + 2b + 6}{b^2 - 9}$.",
      answer: algAnswer("\\frac{a+2}{b-3}", { variables: ["a", "b"], equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "numerator grouped: a(b + 3) + 2(b + 3)"),
        A("A1", 1, "(a + 2)(b + 3)", { dependsOn: ["M1"] }),
        A("A2", 1, "b² − 9 = (b + 3)(b − 3)"),
        MA("MA1", 1, "(a + 2)/(b − 3)"),
      ],
      hints: ["Four terms on the top: take them in pairs.", "$ab + 3a = a(b + 3)$ and $2b + 6 = 2(b + 3)$.", "The same bracket comes out of both pairs.", "The bottom is a difference of two squares."],
      workedSolution: "$ab + 3a + 2b + 6 = a(b + 3) + 2(b + 3) = (a + 2)(b + 3)$, and $b^2 - 9 = (b + 3)(b - 3)$, so the fraction is $\\dfrac{(a + 2)(b + 3)}{(b + 3)(b - 3)} = \\dfrac{a + 2}{b - 3}$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.cancel-terms-not-factors",
        pattern: { kind: "algebraic", latex: "\\frac{ab+3a+2b+6}{b^2-9}" },
        feedback: "Grouping is the move: pair the first two terms and the last two, take a factor out of each pair, and the same bracket appears in both. Summer 2025 M4 Q20 reported grouping troubling the less able.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2025-summer:M4:Q20",
      }],
      requiresWorking: true,
    }],
  }),
  mk(12, {
    style: "practice", difficulty: 4, commandWords: ["Simplify"],
    setting: "Pure algebra, multiplication with a single-term fraction",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22"], solutionProgram: C.m5,
    parts: [{
      id: "main", verb: "simplify", marks: 3,
      stem: "Simplify $\\dfrac{x^2 - 1}{4x} \\times \\dfrac{2x}{x - 1}$.",
      answer: algAnswer("\\frac{x+1}{2}", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "x² − 1 factorised as (x + 1)(x − 1)"),
        A("A1", 1, "(x − 1) cancelled and 2x/(4x) reduced to 1/2", { dependsOn: ["M1"] }),
        MA("MA1", 1, "(x + 1)/2"),
      ],
      hints: ["The only thing that factorises is $x^2 - 1$.", "$(x - 1)$ appears top and bottom.", "$\\dfrac{2x}{4x} = \\dfrac{1}{2}$."],
      workedSolution: "$\\dfrac{(x + 1)(x - 1)}{4x} \\times \\dfrac{2x}{x - 1} = \\dfrac{2x(x + 1)}{4x} = \\dfrac{x + 1}{2}$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.cancel-terms-not-factors",
        pattern: { kind: "algebraic", latex: "\\frac{x^2-1}{2(x-1)}" },
        feedback: "The numbers and the $x$s were cancelled but the quadratic was left as a sum. Factorising $x^2 - 1$ is what lets the $(x - 1)$ go.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2025-november:M4:Q22",
      }],
      requiresWorking: true,
    }],
  }),
  mk(13, {
    style: "practice", difficulty: 4, commandWords: ["Explain", "Simplify"],
    setting: "Judging a piece of algebra",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q19"],
    solutionProgram: "(x^2+5x+6)/(x^2-4) = (x+2)(x+3)/((x+2)(x-2)) = (x+3)/(x-2), checked at x = 1, 5.5, -1.5; cancelling the x^2 terms would give (5x+6)/(-4), which disagrees at x = 1 (11/-4 = -2.75 vs -4)",
    parts: [
      {
        id: "a", verb: "explain", marks: 2,
        stem: "Ronan simplifies $\\dfrac{x^2 + 5x + 6}{x^2 - 4}$ by crossing out the $x^2$ on the top and the $x^2$ on the bottom, giving $\\dfrac{5x + 6}{-4}$.\n\nExplain why this is not correct.",
        answer: textAnswer(
          ["Only common factors can be cancelled; x² is part of a sum, not a factor. Substituting x = 1 gives −4 in the original but −2.75 in Ronan's version."],
          [
            { any: ["factor", "not a factor", "part of a sum", "term"], marks: 1 },
            { any: ["factorise", "substitute", "different value", "check"], marks: 1 },
          ],
        ),
        scheme: [
          MA("MA1", 1, "a statement that only common factors cancel, and that x² is a term in a sum rather than a factor"),
          MA("MA2", 1, "supporting evidence: factorising first, or substituting a value to show the two expressions differ"),
        ],
        hints: ["Compare with numbers: does $\\dfrac{2 + 3}{2 + 4}$ simplify to $\\dfrac{3}{4}$?", "Try substituting $x = 1$ into both expressions.", "What has to be true of something before it can be cancelled?"],
        workedSolution: "Cancelling divides the **whole** top and the **whole** bottom by the same thing, so only a common factor may go. Here $x^2$ is one term of a sum, not a factor of $x^2 + 5x + 6$.\nA quick test settles it: at $x = 1$ the original is $\\dfrac{1 + 5 + 6}{1 - 4} = \\dfrac{12}{-3} = -4$, while Ronan's version gives $\\dfrac{11}{-4} = -2.75$. The two are different expressions.",
        commonErrors: [{
          misconception: "maths.alg-fractions.cancel-terms-not-factors",
          pattern: { kind: "text", regex: "(correct|fine|allowed)" },
          feedback: "It is the single most reported error on this topic. Compare with numbers: $\\dfrac{2+3}{2+4}$ is $\\dfrac{5}{6}$, not $\\dfrac{3}{4}$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Simplify $\\dfrac{x^2 + 5x + 6}{x^2 - 4}$ correctly.",
        answer: algAnswer("\\frac{x+3}{x-2}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "x² + 5x + 6 = (x + 2)(x + 3)"),
          A("A1", 1, "x² − 4 = (x + 2)(x − 2)"),
          MA("MA1", 1, "(x + 3)/(x − 2)"),
        ],
        hints: ["Two numbers multiplying to 6 and adding to 5.", "The bottom is a difference of two squares.", "$(x + 2)$ is the common bracket."],
        workedSolution: "$\\dfrac{(x + 2)(x + 3)}{(x + 2)(x - 2)} = \\dfrac{x + 3}{x - 2}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.treat-expression-as-equation",
          pattern: { kind: "text", regex: "x\\s*=\\s*-?\\s*[23]" },
          feedback: "Those solve $x^2 + 5x + 6 = 0$, which was not asked. 'Simplify' wants a tidier expression, never a value.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        }],
        requiresWorking: true,
      },
    ],
  }),
  // ------------------------------------------------------------ exam-style
  mk(14, {
    style: "exam-style", difficulty: 4, commandWords: ["Simplify"],
    setting: "Pure algebra, in the style of a late M3 item",
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q19", "ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: C.s2,
    parts: [{
      id: "main", verb: "simplify", marks: 3,
      stem: "Simplify\n\n$\\dfrac{x^2 + 5x + 6}{x^2 - 4}$",
      answer: algAnswer("\\frac{x+3}{x-2}", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "x² + 5x + 6 factorised as (x + 2)(x + 3)"),
        A("A1", 1, "x² − 4 factorised as (x + 2)(x − 2)"),
        MA("MA1", 1, "(x + 3)/(x − 2)", { examinerNote: "Answers left as the product of brackets score M1 A1 only." }),
      ],
      hints: ["Factorise both parts before anything else.", "The bottom is a difference of two squares.", "Cancel the whole common bracket."],
      workedSolution: "$\\dfrac{(x + 2)(x + 3)}{(x + 2)(x - 2)} = \\dfrac{x + 3}{x - 2}$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.cancel-terms-not-factors",
          pattern: { kind: "algebraic", latex: "\\frac{5x+6}{-4}" },
          feedback: "The $x^2$ terms were crossed out. They are terms in a sum, not factors, so nothing cancels until both parts are products.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        },
        {
          misconception: "maths.alg-fractions.treat-expression-as-equation",
          pattern: { kind: "algebraic", latex: "\\frac{x+3}{x-2}=0" },
          feedback: "The simplification is correct, so the method and first accuracy marks stand. The '= 0' is an unnecessary claim, and November 2024 reported candidates trying to solve an expression.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2024-november:M4:Q19",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(15, {
    style: "exam-style", difficulty: 5, commandWords: ["Simplify"],
    setting: "Pure algebra, a two-part simplify-then-divide item",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q22", "ccea-cer:maths:2025-summer:M4:Q20"],
    solutionProgram: C.s7 + " | " + C.d1,
    parts: [
      {
        id: "a", verb: "simplify", marks: 3,
        stem: "Simplify $\\dfrac{x^2 - x - 20}{x^2 - 25}$.",
        answer: algAnswer("\\frac{x+4}{x+5}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "x² − x − 20 factorised as (x − 5)(x + 4)"),
          A("A1", 1, "x² − 25 factorised as (x + 5)(x − 5)"),
          MA("MA1", 1, "(x + 4)/(x + 5)"),
        ],
        hints: ["Two numbers multiplying to $-20$ and adding to $-1$.", "The bottom is a difference of two squares.", "$(x - 5)$ is the common bracket."],
        workedSolution: "$\\dfrac{(x - 5)(x + 4)}{(x + 5)(x - 5)} = \\dfrac{x + 4}{x + 5}$.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "\\frac{x-4}{x+5}" },
          feedback: "The signs in the top bracket were swapped: $(x + 5)(x - 4)$ would give $x^2 + x - 20$. The middle term is $-x$, so the 5 is the negative one.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 4,
        stem: "Simplify $\\dfrac{x^2 - 16}{3x} \\div \\dfrac{x + 4}{6x^2}$.",
        answer: algAnswer("2x(x-4)", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "inverted: (x² − 16)/(3x) × 6x²/(x + 4)"),
          A("A1", 1, "x² − 16 factorised as (x + 4)(x − 4)", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(x + 4) cancelled and 6x²/(3x) reduced to 2x"),
          A("A2", 1, "2x(x − 4), or 2x² − 8x", { dependsOn: ["MA1"] }),
        ],
        hints: ["Turn the second fraction over and multiply.", "The only thing that factorises is $x^2 - 16$.", "$\\dfrac{6x^2}{3x} = 2x$.", "No denominator survives, so the answer is a product."],
        workedSolution: "$\\dfrac{(x + 4)(x - 4)}{3x} \\times \\dfrac{6x^2}{x + 4} = \\dfrac{6x^2(x - 4)}{3x} = 2x(x - 4)$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.divide-flip-then-stop",
          pattern: { kind: "algebraic", latex: "\\frac{(x^2-16)6x^2}{3x(x+4)}" },
          feedback: "The flip earns the method mark, and that is where most answers stopped in November 2025: only one in twenty finished. Factorise the numerator and the cancelling becomes obvious.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q22",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(16, {
    style: "exam-style", difficulty: 5, commandWords: ["Show that", "Simplify"],
    setting: "A rectangle whose area and width are given as quadratics",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q19", "ccea-cer:maths:2025-november:M4:Q22"],
    solutionProgram: "area = x^2 + 7x + 10 = (x+2)(x+5); width = x^2 - 4 over x + 5 = (x+2)(x-2)/(x+5); length = area / width = (x+2)(x+5) * (x+5)/((x+2)(x-2)) = (x+5)^2/(x-2); checked at x = 1: area 18, width -3/6 = -0.5, length -36; (1+5)^2/(1-2) = 36/-1 = -36",
    parts: [
      {
        id: "a", verb: "show-that", marks: 2,
        stem: "A rectangle has area $(x^2 + 7x + 10)$ square units.\n\nShow that the area can be written as $(x + 2)(x + 5)$.",
        answer: algAnswer("(x+2)(x+5)", { mustBeFactorised: true }),
        scheme: [
          M("M1", 1, "two numbers multiplying to 10 and adding to 7 identified"),
          A("A1", 1, "(x + 2)(x + 5) reached, or the product expanded back to the printed quadratic", { dependsOn: ["M1"] }),
        ],
        hints: ["$2 \\times 5 = 10$ and $2 + 5 = 7$.", "A 'show that' may be finished either way, but the chain has to be visible."],
        workedSolution: "$2 \\times 5 = 10$ and $2 + 5 = 7$, so $x^2 + 7x + 10 = (x + 2)(x + 5)$. Expanding back gives $x^2 + 5x + 2x + 10 = x^2 + 7x + 10$, as required.",
        commonErrors: [{
          misconception: "maths.factorising.sign-errors-in-brackets",
          pattern: { kind: "algebraic", latex: "(x+1)(x+10)" },
          feedback: "The product is 10 but the sum is 11, not 7. Both conditions must hold; multiply back to check.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q20",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 4,
        stem: "The width of the rectangle is $\\dfrac{x^2 - 4}{x + 5}$ units.\n\nFind an expression for the length, simplified as far as possible.",
        answer: algAnswer("\\frac{(x+5)^2}{x-2}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "length = area ÷ width, written as (x + 2)(x + 5) ÷ (x² − 4)/(x + 5)", { ft: true }),
          A("A1", 1, "inverted: (x + 2)(x + 5) × (x + 5)/(x² − 4)", { dependsOn: ["M1"] }),
          A("A2", 1, "x² − 4 factorised as (x + 2)(x − 2)"),
          MA("MA1", 1, "(x + 5)²/(x − 2), or (x + 5)(x + 5)/(x − 2)"),
        ],
        hints: ["Length is area divided by width.", "Dividing by a fraction means multiplying by its reciprocal.", "$x^2 - 4$ is a difference of two squares.", "$(x + 2)$ cancels; the two $(x + 5)$ brackets multiply together."],
        workedSolution: "$\\text{length} = (x + 2)(x + 5) \\div \\dfrac{x^2 - 4}{x + 5} = (x + 2)(x + 5) \\times \\dfrac{x + 5}{(x + 2)(x - 2)} = \\dfrac{(x + 5)^2}{x - 2}$.",
        commonErrors: [
          {
            misconception: "maths.alg-fractions.divide-flip-then-stop",
            pattern: { kind: "algebraic", latex: "\\frac{(x+2)(x+5)(x+5)}{x^2-4}" },
            feedback: "The reciprocal was used, which earns two marks, but $x^2 - 4$ was left as a sum. Factorising it is what lets the $(x + 2)$ cancel.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2025-november:M4:Q22",
          },
          {
            misconception: "maths.alg-fractions.cancel-terms-not-factors",
            pattern: { kind: "algebraic", latex: "\\frac{x+5}{x-2}" },
            feedback: "One $(x + 5)$ was cancelled against nothing. There is an $(x + 5)$ in the area and another from the flipped width, so the answer carries $(x + 5)^2$.",
            marksTypicallyEarned: 3,
            source: "ccea-cer:maths:2025-november:M4:Q22",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
];
// independent checks of the composite question
const chkRect = equiv("rect length", "((x+2)*(x+5)) / ((x**2-4)/(x+5))", "(x+5)**2/(x-2)", P);
assertNoFailures("t7 questions");

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T, specRefs: REF,
    stem: "Eimear was asked to simplify $\\dfrac{x^2 - 4}{x^2 + 6x + 8}$. Her working:",
    studentWorking: [
      "x² cancels with x²",
      "= (−4) over (6x + 8)",
      "= −4 over 2(3x + 4)",
      "= −2 over (3x + 4)",
    ],
    mistakeLine: 1,
    misconception: "maths.alg-fractions.cancel-terms-not-factors",
    whatWentWrong: "The $x^2$ terms are parts of sums, not factors. Cancelling divides the **whole** top and the **whole** bottom by the same thing, so only a common factor may be removed — and that means factorising first.",
    correction: [
      "x² − 4 = (x + 2)(x − 2)",
      "x² + 6x + 8 = (x + 2)(x + 4)",
      "= (x + 2)(x − 2) over (x + 2)(x + 4)",
      "= (x − 2) over (x + 4)",
    ],
    marksEarnedAsWritten: [],
    feedback: "Everything after line 1 is done carefully, but it is careful work on the wrong expression, so no marks are available. A ten-second test would have caught it: at $x = 1$ the original is $\\dfrac{-3}{15} = -0.2$ and Eimear's version is $\\dfrac{-2}{7} \\approx -0.29$. November 2024 M4 Q19 named this directly: weaker candidates cancelled single terms across the fraction. Nothing may be crossed out until both parts are products.",
    source: "ccea-cer:maths:2024-november:M4:Q19",
  },
  {
    id: `ftm.${T}.02`,
    topic: T, specRefs: REF,
    stem: "Odhrán was asked to simplify $\\dfrac{x^2 - 25}{x + 2} \\div \\dfrac{x - 5}{3x + 6}$. His working:",
    studentWorking: [
      "Flip the second fraction",
      "= (x² − 25) over (x + 2) × (3x + 6) over (x − 5)",
      "= (x² − 25)(3x + 6) over (x + 2)(x − 5)",
      "Answer: (x² − 25)(3x + 6) over (x + 2)(x − 5)",
    ],
    mistakeLine: 4,
    misconception: "maths.alg-fractions.divide-flip-then-stop",
    whatWentWrong: "The division was turned into a multiplication correctly, and then the work stopped. Nothing was factorised, so nothing cancelled: $x^2 - 25 = (x + 5)(x - 5)$ and $3x + 6 = 3(x + 2)$, and both of those brackets have a partner below.",
    correction: [
      "= (x + 5)(x − 5) over (x + 2) × 3(x + 2) over (x − 5)",
      "(x − 5) cancels and (x + 2) cancels",
      "Answer: 3(x + 5)",
    ],
    marksEarnedAsWritten: ["M1"],
    feedback: "Inverting the second fraction is the right first move and earns the method mark, which is exactly where November 2025 M4 Q22 reported most candidates stopping — only one in twenty finished. The habit to build is a fixed order: flip, then factorise **every** top and bottom, then cancel whole brackets, then write what is left. Two of those four steps were missing here, and each is a mark.",
    source: "ccea-cer:maths:2025-november:M4:Q22",
  },
  {
    id: `ftm.${T}.03`,
    topic: T, specRefs: REF,
    stem: "Tomás was asked to simplify $\\dfrac{36 - y^2}{y^2 - 4y - 12}$. His working:",
    studentWorking: [
      "36 − y² = (y + 6)(y − 6)",
      "y² − 4y − 12 = (y − 6)(y + 2)",
      "(y − 6) cancels",
      "Answer: (y + 6) over (y + 2)",
    ],
    mistakeLine: 1,
    misconception: "maths.factorising.dots-term-order",
    whatWentWrong: "$(y + 6)(y - 6)$ is $y^2 - 36$, not $36 - y^2$. The two differ by a factor of $-1$, so the whole answer comes out with the wrong sign.",
    correction: [
      "36 − y² = (6 + y)(6 − y), keeping the order given",
      "(6 − y) = −(y − 6), so the top is −(6 + y)(y − 6)",
      "y² − 4y − 12 = (y − 6)(y + 2)",
      "Answer: −(y + 6) over (y + 2)",
    ],
    marksEarnedAsWritten: ["A1"],
    feedback: "The bottom is factorised correctly and the cancelling is carried out neatly, so an accuracy mark is realistic. The sign is what goes. Summer 2025 M4 Q20 reported exactly this: the difference of two squares went wrong when the letter was not the first term, because candidates swapped the terms round. Whatever starts the expression starts both brackets, and if the reversed bracket is needed, pull out the $-1$ deliberately.",
    source: "ccea-cer:maths:2025-summer:M4:Q20",
  },
];
const chkF1 = equiv("ftm01 correct", "(x**2-4)/(x**2+6*x+8)", "(x-2)/(x+4)", P);
const chkF2 = equiv("ftm02 correct", "((x**2-25)/(x+2)) / ((x-5)/(3*x+6))", "3*(x+5)", P);
const chkF3 = equiv("ftm03 correct", "(36-y**2)/(y**2-4*y-12)", "-(y+6)/(y+2)", [{ y: 1 }, { y: 5.5 }, { y: -1.5 }]);
assertNoFailures("t7 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", REF, "procedure", "What must be true before anything in an algebraic fraction can be cancelled?",
    "Both the top and the bottom must be written as products. Only a whole common factor cancels; a term inside a sum never does.",
    ["products", "whole factor", "not a term"], 4),
  rp(T, "02", REF, "trap", "Why can you not cancel the $x^2$ in $\\dfrac{x^2 - 9}{x^2 + 7x + 12}$?",
    "Because $x^2$ is one term of a sum, not a factor of the whole expression. Compare with numbers: $\\dfrac{2+3}{2+4}$ is $\\dfrac{5}{6}$, not $\\dfrac{3}{4}$.",
    ["term", "factor", "sum"], 7),
  rp(T, "03", REF, "formula", "$\\dfrac{a}{b} \\times \\dfrac{c}{d} = $ ? and $\\dfrac{a}{b} \\div \\dfrac{c}{d} = $ ?",
    "$\\dfrac{ac}{bd}$, and $\\dfrac{a}{b} \\times \\dfrac{d}{c}$ — it is the **second** fraction that is turned over.",
    ["ac/bd", "reciprocal", "second"], 4),
  rp(T, "04", REF, "procedure", "The four steps for dividing algebraic fractions.",
    "1 Flip the second fraction and multiply. 2 Factorise every top and every bottom. 3 Cancel whole brackets. 4 Write the single fraction that is left.",
    ["flip", "factorise everything", "cancel brackets"], 6),
  rp(T, "05", REF, "trap", "Which factorising tools do you need on this topic?",
    "A common factor, the difference of two squares, a quadratic $x^2 + bx + c$, and grouping when there are four terms.",
    ["common factor", "difference of two squares", "grouping"], 6),
  rp(T, "06", REF, "trap", "$\\dfrac{6x^2}{8x}$ — what happens to the letters?",
    "$\\dfrac{x^2}{x} = x$: dividing powers of the same letter subtracts the indices. The numbers cancel separately, so the answer is $\\dfrac{3x}{4}$.",
    ["subtract indices", "3x/4"], 5),
  rp(T, "07", REF, "trap", "You have simplified an algebraic fraction. What must the answer NOT contain?",
    "An equals sign, and no value of $x$. 'Simplify' asks for a tidier expression; solving is a different question.",
    ["no equals sign", "expression"], 5),
  rp(T, "08", REF, "trap", "$(5 - w)$ and $(w - 5)$ — how are they related, and how do you use it?",
    "$(5 - w) = -(w - 5)$. Pull the $-1$ out so the two brackets match, cancel them, and leave the minus sign in front of the fraction.",
    ["factor of −1", "pull the minus out"], 8),
  rp(T, "09", REF, "novel-example", "Simplify $\\dfrac{2x + 10}{x^2 - 25}$.",
    "$\\dfrac{2(x + 5)}{(x + 5)(x - 5)} = \\dfrac{2}{x - 5}$.",
    ["2/(x − 5)"], 6),
  rp(T, "10", REF, "novel-example", "Simplify $\\dfrac{ab + 3a + 2b + 6}{b^2 - 9}$.",
    "Group the top: $a(b + 3) + 2(b + 3) = (a + 2)(b + 3)$. The bottom is $(b + 3)(b - 3)$, so the answer is $\\dfrac{a + 2}{b - 3}$.",
    ["grouping", "(a + 2)/(b − 3)"], 9),
  rp(T, "11", REF, "trap", "Which algebraic-fraction questions belong to M4, not here?",
    "Adding or subtracting fractions whose denominators contain the unknown, such as $\\dfrac{2}{x+2} + \\dfrac{3}{2x-1}$. This statement covers simplifying, multiplying and dividing only.",
    ["adding", "M4", "denominators with x"], 6),
];

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed: (x²−9)/(x²+7x+12) = (x−3)/(x+4); 6x²/(8x) = 3x/4; (2x²/3)(x/6) = x³/9; (x²−16)/(3x) ÷ (x+4)/(6x²) = 2x(x−4); (25−w²)/(w²−3w−10) = −(5+w)/(w+2) — each checked at three values.",
    examiner: "Every examiner callout comes from packs/maths/insights/m3.simplifying-multiplying-and-dividing-algebraic-fractions.json: November 2024 M4 Q19, Summer 2025 M4 Q20, November 2025 M4 Q22.",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, { ...base, numeric: C.s1 + "; twin " + C.s2, examiner: "Built on November 2024 M4 Q19, where weaker candidates cancelled single terms across the fraction." }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, { ...base, numeric: C.idx1 + "; " + C.mul1 + "; twin " + C.idx2, examiner: "Covers the Teacher Guidance examples for M3-NA-09 and the index rules that sit under them." }),
  ver(`ver.we.${T}.03`, `we.${T}.03`, { ...base, numeric: C.d1 + "; twin " + C.d3, examiner: "Built on November 2025 M4 Q22, where only one in twenty finished a division." }),
  ver(`ver.we.${T}.04`, `we.${T}.04`, { ...base, numeric: C.s6 + "; twin " + C.s7, examiner: "Built on Summer 2025 M4 Q20, where the difference of two squares went wrong once the letter was not the first term." }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "6x²/(8x) = 3x/4; (2x+10)/(x²−25) = 2/(x−5); (x+3)/(x²−16) × (x−4)/(x+3) = 1/(x+4); (x²+5x+6)/(x²−4) = (x+3)/(x−2); (5+w)(5−w) = 25 − w² and (w+5)(w−5) = w² − 25.",
    examiner: "Distractors are the registry misconceptions named on the insight card, plus the index misconceptions: cancel-terms-not-factors, treat-expression-as-equation, divide-flip-then-stop, dots-term-order, not-fully-factorised, divide-powers-instead-of-subtract.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the errors those findings describe.",
  })),
  ...findTheMistake.map((f, i) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: [chkF1, chkF2, chkF3][i],
    examiner: f.source + " — the wrong line reproduces the reported error.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Prompt answers recomputed: (2x+10)/(x²−25) = 2/(x−5) and (ab+3a+2b+6)/(b²−9) = (a+2)/(b−3), each checked at three points.",
    examiner: "Prompts cover cancelling factors not terms, the reciprocal rule, the four steps of a division, the term order and the M4 boundary.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "Adding or subtracting fractions whose denominators contain the unknown — that is M4-NA-03",
  "Solving an equation made from such fractions — that is M4-NA-04",
  "Factorisations that need a cubic, or quadratics of the form ax² + bx + c with a not 1 and no common factor (M4)",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Simplifying, multiplying and dividing algebraic fractions (factorise and cancel)",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: [
      "maths.m3.difference-of-two-squares",
      "maths.m2.fraction-arithmetic-all-four-operations",
      "maths.m6.index-laws-in-algebra",
    ],
    order: 101,
    hardness: "H",
    difficulty: 5,
    examinerFlagged: true,
    examinerSources: insight.findings.map((f) => f.source),
    examWeightHint:
      "In M3 it appears as a short simplification of 1-3 marks. The heavy version is in M4, late in the paper: a factorise-and-cancel of 3 marks (November 2024 Q19, about a third full marks; Summer 2025 Q20) or a division of 4 marks (November 2025 Q22, where only one in twenty finished). Every one of those questions is decided by whether the candidate factorises before trying to cancel.",
    mustMemorise: [
      "Factorise the top and the bottom first; only whole common factors cancel",
      "a/b × c/d = ac/bd; to divide, multiply by the reciprocal of the SECOND fraction",
      "Dividing powers of the same letter subtracts the indices; multiplying adds them",
      "Keep the terms in the order given: 25 − w² is (5 + w)(5 − w)",
      "(5 − w) = −(w − 5): reversed brackets differ by a factor of −1",
      "An expression is simplified, never solved",
    ],
    onFormulaSheet: [],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["algebraic fractions", "simplify", "cancel", "multiply", "divide", "factorise and cancel", "reciprocal", "grouping"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Simplifying, multiplying and dividing algebraic fractions",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [],
      mustKnow: [
        "a/b × c/d = ac/bd; a/b ÷ c/d = a/b × d/c",
        "Only whole common factors cancel",
        "a² − b² = (a + b)(a − b), in the order given",
        "xᵐ ÷ xⁿ = xᵐ⁻ⁿ and xᵐ × xⁿ = xᵐ⁺ⁿ",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Simplify a single-term fraction such as 6x²/(8x) using the index laws",
        "Multiply two algebraic fractions, cancelling before or after multiplying",
        "Factorise a quadratic numerator and denominator and cancel the common bracket",
        "Take out a common factor first when one is hiding, as in (2x + 10)/(x² − 25)",
        "Factorise a four-term numerator by grouping",
        "Handle a reversed difference of two squares, using (5 − w) = −(w − 5)",
        "Divide by inverting the second fraction, then factorising everything, then cancelling whole brackets",
        "Say why single terms cannot be cancelled, and check with a substitution",
        "Leave the answer as an expression, in brackets, with no equals sign",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks) carries a short version worth 1-3 marks; M4 carries the hard version late in the paper and M7 Paper 1 can ask it without a calculator. Schemes give M1 for the first correct factorisation, A1 for the second, and MA1 for the cancelled single fraction; a division adds a method mark for inverting the second fraction. Partial credit is generous, so a correct factorisation is always worth writing down.",
      traps: [
        "Cancelling single terms across the fraction instead of whole factors — the dominant error in November 2024 M4 Q19",
        "Trying to solve the expression, as if it were an equation (November 2024 M4 Q19)",
        "Reordering a difference of two squares when the letter is not the first term, which flips the sign of the answer (Summer 2025 M4 Q20)",
        "Taking out only part of a common factor, or dividing by it instead of factorising it out (November 2024 M4 Q19)",
        "Inverting the second fraction and then stopping: only one in twenty finished the division in November 2025 M4 Q22",
        "Expanding everything, which hides the very brackets that were about to cancel",
        "Not spotting grouping when the numerator has four terms (Summer 2025 M4 Q20)",
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
      title: "Factorise first, then cancel",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0003`, `rp.${T}.02`, `q.${T}.0004`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Cancelling, grouping, reversed squares and dividing",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0006`, `ftm.${T}.01`, `q.${T}.0008`, `ftm.${T}.02`, `q.${T}.0011`, `q.${T}.0015`, `q.${T}.0016`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Simplifying, multiplying and dividing algebraic fractions" },
  {
    type: "callout", kind: "spec", title: "The statement",
    md: "**M3-NA-09** — simplify, multiply and divide algebraic fractions with linear or quadratic numerators and denominators.\nThe Teacher Guidance names the range: simplify $\\dfrac{6x^2}{8x}$, work out $\\dfrac{2x^2}{3} \\times \\dfrac{x}{6}$, simplify $\\dfrac{x^2 + x - 6}{x^2 - 4}$, and know that $\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{ac}{bd}$.",
    source: "CCEA GCSE Mathematics specification, statement M3-NA-09 with its Teacher Guidance",
  },
  {
    type: "p",
    md: "This is the topic that separates the top grades. In November 2025 only one candidate in twenty finished a division of algebraic fractions, and in November 2024 about a third simplified one correctly. The maths is not hard; the discipline is. There is one rule, and everything follows from it: **you may only cancel a factor of the whole top with a factor of the whole bottom.** Which means: factorise first, always.",
  },
  { type: "h", text: "Why factorising has to come first" },
  {
    type: "p",
    md: "Cancelling is division. $\\dfrac{6}{8} = \\dfrac{2 \\times 3}{2 \\times 4} = \\dfrac{3}{4}$ works because 2 divides the **whole** top and the **whole** bottom. Now look at $\\dfrac{2 + 3}{2 + 4}$: that is $\\dfrac{5}{6}$, and no crossing out is allowed, because the 2s are parts of sums.\nAlgebra behaves the same way.",
  },
  noteFigure(cancelBody, cancelAlt, 740, 296,
    "Whole brackets cancel; terms inside a sum do not", "cancel-factors-not-terms"),
  {
    type: "p",
    md: "$\\dfrac{x^2 - 9}{x^2 + 7x + 12}$: as written, nothing cancels. Factorise both parts and a common bracket appears:\n$\\dfrac{(x + 3)(x - 3)}{(x + 3)(x + 4)} = \\dfrac{x - 3}{x + 4}$.\nIf you ever doubt an answer here, substitute. At $x = 1$ the original is $\\dfrac{-8}{20} = -0.4$, and so is $\\dfrac{-2}{5}$. Crossing out the $x^2$ terms instead would give $\\dfrac{-9}{7x + 12}$, which is $-0.47\\ldots$ at $x = 1$ — a different expression.",
  },
  {
    type: "callout", kind: "examiner", title: "November 2024 M4 Q19",
    md: "About a third got full marks. Most took the common factor out, though some divided by it instead of factorising. Weaker candidates cancelled single terms across the fraction, or tried to solve the expression as though it were an equation.",
    source: "ccea-cer:maths:2024-november:M4:Q19",
  },
  {
    type: "gate", id: "g1", kind: "choice",
    prompt: "$\\dfrac{x^2 - 9}{x^2 + 7x + 12}$. What is the first move?",
    options: ["Factorise the top and the bottom", "Cancel the $x^2$ terms", "Set it equal to zero"],
    answer: "Factorise the top and the bottom",
    explain: "Nothing may be cancelled while either part is still a sum.",
  },
  { type: "h", text: "Single terms: the index laws" },
  {
    type: "p",
    md: "When there are no brackets, it is ordinary index work. Deal with the numbers and the letters separately:\n$\\dfrac{6x^2}{8x} = \\dfrac{3x}{4}$, because $\\dfrac{6}{8} = \\dfrac{3}{4}$ and $\\dfrac{x^2}{x} = x^{2-1} = x$.\nTo multiply, tops times tops and bottoms times bottoms, and indices **add**:\n$\\dfrac{2x^2}{3} \\times \\dfrac{x}{6} = \\dfrac{2x^3}{18} = \\dfrac{x^3}{9}$.\nCancelling before you multiply keeps the numbers small and is usually quicker.",
  },
  {
    type: "gate", id: "g2", kind: "blank",
    prompt: "Simplify $\\dfrac{15x^5}{20x^2}$.",
    answer: "3x³/4",
    explain: "$\\dfrac{15}{20} = \\dfrac{3}{4}$ and $x^5 \\div x^2 = x^3$.",
  },
  { type: "h", text: "The four tools you need" },
  {
    type: "p",
    md: "Every question here is a factorising question in disguise. Four tools cover all of them:\n**A common factor.** $2x + 10 = 2(x + 5)$, and $3x^2 - 27 = 3(x^2 - 9)$ — then look again, because that bracket factorises too.\n**The difference of two squares.** $x^2 - 25 = (x + 5)(x - 5)$.\n**A quadratic $x^2 + bx + c$.** Two numbers multiplying to $c$ and adding to $b$.\n**Grouping**, when the numerator has four terms: $ab + 3a + 2b + 6 = a(b + 3) + 2(b + 3) = (a + 2)(b + 3)$.\nSo $\\dfrac{2x + 10}{x^2 - 25} = \\dfrac{2(x + 5)}{(x + 5)(x - 5)} = \\dfrac{2}{x - 5}$.",
  },
  {
    type: "gate", id: "g3", kind: "blank",
    prompt: "Simplify $\\dfrac{x^2 - 7x + 12}{x^2 - 16}$.",
    answer: "(x − 3)/(x + 4)",
    explain: "$(x - 3)(x - 4)$ over $(x + 4)(x - 4)$; the $(x - 4)$ cancels.",
  },
  { type: "h", text: "When the brackets are reversed" },
  {
    type: "p",
    md: "$\\dfrac{25 - w^2}{w^2 - 3w - 10}$. Factorise in the order given: $25 - w^2 = (5 + w)(5 - w)$, and $w^2 - 3w - 10 = (w - 5)(w + 2)$.\nThe top has $(5 - w)$ and the bottom has $(w - 5)$. They are not identical, but they differ only by a sign: $(5 - w) = -(w - 5)$. Pull the minus out and they cancel:\n$\\dfrac{(5 + w) \\times -(w - 5)}{(w - 5)(w + 2)} = -\\dfrac{5 + w}{w + 2}$.\nWriting the top as $(w + 5)(w - 5)$ instead would lose that minus sign and the whole answer would be the negative of the right one.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q20",
    md: "Most earned a mark for taking a common factor out of the denominator. The difference of two squares went wrong whenever the letter was not the first term, because candidates swapped the terms round; grouping in the numerator troubled the less able. Full-mark answers kept the terms in their given order and cancelled whole brackets.",
    source: "ccea-cer:maths:2025-summer:M4:Q20",
  },
  {
    type: "gate", id: "g4", kind: "choice",
    prompt: "$(5 - w)$ is the same as",
    options: ["$-(w - 5)$", "$(w - 5)$", "$-(5 + w)$"],
    answer: "$-(w - 5)$",
    explain: "Reversing a subtraction changes the sign of the whole bracket.",
  },
  { type: "h", text: "Dividing: flip, factorise, cancel, finish" },
  {
    type: "p",
    md: "Dividing by a fraction means multiplying by its reciprocal — and it is the **second** fraction that turns over. After that it is a multiplication, so all the same rules apply.",
  },
  noteFigure(flowBody, flowAlt, 770, 200,
    "The fixed order for a division; most candidates stop after two boxes", "divide-fractions-flow"),
  {
    type: "p",
    md: "$\\dfrac{x^2 - 16}{3x} \\div \\dfrac{x + 4}{6x^2}$\n1 Flip: $\\dfrac{x^2 - 16}{3x} \\times \\dfrac{6x^2}{x + 4}$\n2 Factorise: $\\dfrac{(x + 4)(x - 4)}{3x} \\times \\dfrac{6x^2}{x + 4}$\n3 Cancel: $(x + 4)$ goes, and $\\dfrac{6x^2}{3x} = 2x$\n4 Finish: $2x(x - 4)$\nNotice that no denominator survives, so the answer is not a fraction at all. That is fine.",
  },
  {
    type: "callout", kind: "examiner", title: "November 2025 M4 Q22",
    md: "Only one in twenty finished. Most earned a mark or two for inverting the second fraction and factorising the denominators, and then stalled. Full-mark answers inverted, factorised every numerator and denominator, cancelled the common brackets and wrote the single fraction that was left.",
    source: "ccea-cer:maths:2025-november:M4:Q22",
  },
  {
    type: "gate", id: "g5", kind: "blank",
    prompt: "$\\dfrac{x + 2}{x - 1} \\div \\dfrac{x + 2}{x + 5} = $ ?",
    answer: "(x + 5)/(x − 1)",
    explain: "Flip and multiply; the $(x + 2)$ brackets cancel.",
  },
  {
    type: "gate", id: "g6", kind: "blank",
    prompt: "Simplify $\\dfrac{6x^2}{x^2 - 9} \\div \\dfrac{2x}{x + 3}$.",
    answer: "3x/(x − 3)",
    explain: "Flip, factorise $x^2 - 9$, cancel $(x + 3)$, and $\\dfrac{6x^2}{2x} = 3x$.",
  },
  { type: "h", text: "Simplify is not solve" },
  {
    type: "p",
    md: "$\\dfrac{x + 3}{x - 2}$ is a complete answer. Adding '$= 0$', or offering $x = -3$, answers a question nobody asked and can cost the accuracy mark. An expression is simplified; only an equation is solved.\nOne more habit: leave the answer in brackets. $\\dfrac{3(x + 3)}{x + 5}$ is better than $\\dfrac{3x + 9}{x + 5}$, because the brackets show that nothing further cancels.",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** $\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{ac}{bd}$ and $\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$; only whole common factors cancel; $a^2 - b^2 = (a+b)(a-b)$ in the order given; $x^m \\div x^n = x^{m-n}$.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "**Adding or subtracting** fractions whose denominators contain the unknown, such as $\\dfrac{2}{x+2} + \\dfrac{3}{2x-1}$, is M4-NA-03, and solving such an equation is M4-NA-04. M3-NA-09 is simplify, multiply and divide only.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "In M3 this is a short item of 1-3 marks. In M4 it is one of the last questions, worth 3-4, and it is where the top grades are won.\nMarks are given per factorisation, so **write every factorisation down even if the cancelling then defeats you**: a correct top and a correct bottom is usually two of the three marks. In a division, the flip is a mark on its own.\nThe **last** mark is the single fraction in lowest terms, left in brackets, with nothing set equal to anything.\nIf you are stuck, follow the fixed order and do not improvise: flip if it is a division, factorise every top and bottom, then look for matching brackets.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.03` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.08` },
  { type: "prompt", promptId: `rp.${T}.11` },
];

assertNoFailures("t7 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
