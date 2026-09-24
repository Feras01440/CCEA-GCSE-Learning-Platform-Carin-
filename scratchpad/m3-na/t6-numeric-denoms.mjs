/** maths.m3.algebraic-fractions-with-numerical-denominators — H bundle (difficulty 4). */
import fs from "node:fs";
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, equiv, ev, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.algebraic-fractions-with-numerical-denominators";
const SLUG = "algebraic-fractions-with-numerical-denominators";
const REF = ["M3-NA-08", "M3-NA-10"];
const ADD = ["M3-NA-08"];
const SOLVE = ["M3-NA-10"];
const insight = JSON.parse(fs.readFileSync(`packs/maths/insights/m3.${SLUG}.json`, "utf8"));

// ---------------------------------------------------------------- symbolic checks
const P = [{ x: 2 }, { x: -3 }, { x: 0.5 }];
const at = (v) => [{ [v]: 2 }, { [v]: -3 }, { [v]: 0.5 }];
const C = {
  a: equiv("(3x+1)/4 + (2x-5)/6", "(3*x+1)/4 + (2*x-5)/6", "(13*x-7)/12", P),
  b: equiv("(5x-2)/3 - (x+4)/5", "(5*x-2)/3 - (x+4)/5", "(22*x-22)/15", P),
  c: equiv("(2x+7)/5 + (x-3)/2", "(2*x+7)/5 + (x-3)/2", "(9*x-1)/10", P),
  d: equiv("x/3 + x/4", "x/3 + x/4", "7*x/12", P),
  e: equiv("(x+2)/4 - (x-6)/8", "(x+2)/4 - (x-6)/8", "(x+10)/8", P),
  f: equiv("(4x+1)/5 + (x-2)/10", "(4*x+1)/5 + (x-2)/10", "(9*x)/10", P),
  g: equiv("(3y-2)/2 - (y+1)/6", "(3*y-2)/2 - (y+1)/6", "(8*y-7)/6", at("y")),
  h: equiv("(2x-3)/7 + (x+5)/2", "(2*x-3)/7 + (x+5)/2", "(11*x+29)/14", P),
  i: equiv("(x-4)/3 - (2x+1)/9", "(x-4)/3 - (2*x+1)/9", "(x-13)/9", P),
  j: equiv("2(x+1)/3 + (x-5)/4", "2*(x+1)/3 + (x-5)/4", "(11*x-7)/12", P),
};
// Equations: each solved and then verified by substitution
const eqs = {
  A: { lhs: "(x+4)/2 + (x-1)/3", rhs: 5, root: 4 },
  B: { lhs: "(3*x-1)/4 - (x-5)/6", rhs: 7, root: 11 },
  C: { lhs: "2*(x+3)/5 - (x-4)/2", rhs: 1, root: 22 },
  D: { lhs: "(2*x+5)/6 + (3*x-1)/3", rhs: 4.5, root: 3 },
  E: { lhs: "(5*x-2)/4", rhs: 7, root: 6 },
  F: { lhs: "(x+9)/2 - (2*x+3)/3", rhs: 0, root: 21 },
  G: { lhs: "(x+5)/2 + (x-1)/3", rhs: 8, root: 7 },
  H: { lhs: "x/4 + x/6", rhs: 75, root: 180 },
  I: { lhs: "(4*x+3)/5 - (x-2)/2", rhs: 4, root: 8 },
  J: { lhs: "(x-2)/3 + (x+6)/5", rhs: 6, root: 10.25 },
};
for (const [k, e] of Object.entries(eqs)) {
  expect(`equation ${k} root satisfies it`, ev(e.lhs, { x: e.root }), e.rhs, 1e-9);
}
assertNoFailures("t6 equations");

// ---------------------------------------------------------------- figures
const arrowsBody = `
<g ${MATHTXT} font-size='24' text-anchor='middle'>
  <text x='120' y='170'>(x + 4)</text><text x='120' y='128'>x 12</text>
  <text x='300' y='170'>(x - 1)</text><text x='300' y='128'>x 12</text>
  <text x='560' y='170'>5</text><text x='560' y='128'>x 12</text>
</g>
<g ${MATHTXT} font-size='26' text-anchor='middle'>
  <text x='120' y='240'>2</text><text x='300' y='240'>3</text>
  <text x='210' y='205'>+</text><text x='430' y='205'>=</text>
  <text x='560' y='212'>5</text>
</g>
<g stroke='currentColor' stroke-width='1.6' fill='none'>
  <path d='M100 186 L200 186'/><path d='M280 186 L380 186'/>
</g>
<g stroke='currentColor' stroke-width='1.5' fill='none'>
  <path d='M120 90 L120 108'/><path d='M114 102 L120 110 L126 102'/>
  <path d='M300 90 L300 108'/><path d='M294 102 L300 110 L306 102'/>
  <path d='M560 90 L560 108'/><path d='M554 102 L560 110 L566 102'/>
</g>
<g ${TXT} font-size='17' text-anchor='middle'>
  <text x='340' y='50'>multiply EVERY term by 12, the constant on the right included</text>
  <text x='340' y='300'>6(x + 4) + 4(x - 1) = 60</text>
</g>
<g fill='none' stroke='currentColor' stroke-width='2'>
  <rect x='508' y='72' width='104' height='118' rx='8'/>
</g>`;
const arrowsAlt =
  "The equation (x + 4) over 2 plus (x - 1) over 3 equals 5, with a times 12 arrow pointing down at each of the three terms. The 5 on the right is boxed to show it is multiplied too. Underneath: 6(x + 4) + 4(x - 1) = 60.";
const arrowsFig = svgFig(arrowsBody, arrowsAlt, 680, 320);

const stripBody = `
<g fill='none' stroke='currentColor' stroke-width='1.5'>
  <rect x='60' y='50' width='480' height='46'/>
  <path d='M180 50 L180 96'/><path d='M300 50 L300 96'/><path d='M420 50 L420 96'/>
  <rect x='60' y='130' width='480' height='46'/>
  <path d='M140 130 L140 176'/><path d='M220 130 L220 176'/><path d='M300 130 L300 176'/><path d='M380 130 L380 176'/><path d='M460 130 L460 176'/>
  <rect x='60' y='210' width='480' height='46'/>
</g>
<g stroke='currentColor' stroke-width='0.9' fill='none'>
  <path d='M100 210 L100 256'/><path d='M140 210 L140 256'/><path d='M180 210 L180 256'/><path d='M220 210 L220 256'/>
  <path d='M260 210 L260 256'/><path d='M300 210 L300 256'/><path d='M340 210 L340 256'/><path d='M380 210 L380 256'/>
  <path d='M420 210 L420 256'/><path d='M460 210 L460 256'/><path d='M500 210 L500 256'/>
</g>
<g fill='currentColor' fill-opacity='0.14' stroke='none'>
  <rect x='60' y='50' width='120' height='46'/>
  <rect x='60' y='130' width='80' height='46'/>
</g>
<g ${TXT} font-size='16' text-anchor='start'>
  <text x='556' y='80'>a quarter</text>
  <text x='556' y='160'>a sixth</text>
  <text x='556' y='240'>twelfths</text>
  <text x='60' y='292'>a quarter is 3 twelfths and a sixth is 2 twelfths, so together they are 5 twelfths</text>
</g>`;
const stripAlt =
  "Three bars of equal length. The top bar is divided into quarters with one quarter shaded; the middle bar into sixths with one sixth shaded; the bottom bar into twelfths. A caption says a quarter is 3 twelfths and a sixth is 2 twelfths, so together they are 5 twelfths.";
const stripFig = svgFig(stripBody, stripAlt, 700, 310);

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statements M3-NA-08 (add or subtract algebraic fractions) and M3-NA-10 (set up and solve linear equations of that form). Denominators are NUMBERS only; a denominator containing the unknown belongs to M4-NA-03 and M4-NA-04 and is excluded here, as is any equation that clears to a quadratic.",
  formula: "Nothing on the Higher formula sheet applies. The common-denominator rule and 'multiply every term by the LCM' are must-know.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Simplify, Solve, Write as a single fraction, Form an equation, Show that).",
  tariff: "Tariffs match the corpus: a single fraction from two 2-3 marks; a fractional equation 3-4 marks, with the M3 pattern seen at Summer 2025 M3 Q12 (adding), November 2025 M3 Q29 (4 marks, bracket and two denominators) and Summer 2026 M3 Q27 (4 marks).",
  copy: "Compared by hand against the M3 papers and schemes read for this batch (Summer 2025 Q17, November 2025 Q29, Summer 2026 Q27, Summer 2022 Q25): every expression, equation and context here is new; no eight-word sequence in common.",
  symbolic: "Each single-fraction answer verified by evaluating the original sum and the answer at x = 2, −3 and 0.5; each equation solved and the root substituted back into the original equation.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T, specRefs: ADD, paper: M3,
    stem: "Write $\\dfrac{3x + 1}{4} + \\dfrac{2x - 5}{6}$ as a single fraction in its simplest form.",
    figure: stripFig,
    steps: [
      {
        n: 1,
        working: "Lowest common denominator of 4 and 6 is 12.",
        decision: "The LCM of the denominators, not their product. $4 \\times 6 = 24$ works too, but 12 keeps the numbers small and means no cancelling at the end.",
        whyMenu: {
          options: [
            "12 is the smallest number both 4 and 6 divide into",
            "12 is 4 plus 6 plus 2",
            "12 is always the common denominator for two fractions",
          ],
          correct: 0,
          explain: "$4 = 2^2$ and $6 = 2 \\times 3$, so the LCM is $2^2 \\times 3 = 12$.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$\\dfrac{3(3x+1)}{12} + \\dfrac{2(2x-5)}{12}$",
        decision: "$12 \\div 4 = 3$, so the first numerator is multiplied by 3; $12 \\div 6 = 2$, so the second is multiplied by 2. Each numerator stays inside a bracket until it is expanded.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$\\dfrac{9x + 3 + 4x - 10}{12}$",
        decision: "One denominator now, so the numerators simply add. Expand each bracket on this line and nothing else.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$\\dfrac{13x - 7}{12}$",
        decision: "Collect like terms. Check whether anything cancels: 13 and 7 share no factor with 12, so this is simplest form.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$\\dfrac{13x - 7}{12}$",
    twin: {
      stem: "Write $\\dfrac{2x + 7}{5} + \\dfrac{x - 3}{2}$ as a single fraction.",
      answer: algAnswer("\\frac{9x-1}{10}", { equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T, specRefs: ADD, paper: M3,
    stem: "Write $\\dfrac{5x - 2}{3} - \\dfrac{x + 4}{5}$ as a single fraction.",
    steps: [
      {
        n: 1,
        working: "LCD of 3 and 5 is 15: $\\dfrac{5(5x - 2) - 3(x + 4)}{15}$",
        decision: "3 and 5 share no factor, so the LCD is their product. The second numerator is being subtracted, so it stays inside its bracket.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$\\dfrac{25x - 10 - (3x + 12)}{15}$",
        decision: "Expand each product, but keep the subtracted one bracketed for one more line. This is the line where the marks are usually lost.",
        whyMenu: {
          options: [
            "Because the whole of $3(x + 4)$ is subtracted, not just the $3x$",
            "Because a numerator must always be written in brackets",
            "Because $x + 4$ is negative",
          ],
          correct: 0,
          explain: "The minus sign applies to the entire second numerator, and the bracket keeps that visible until it is removed.",
        },
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$\\dfrac{25x - 10 - 3x - 12}{15}$",
        decision: "Remove the bracket by changing **every** sign inside it: $+3x$ becomes $-3x$ and $+12$ becomes $-12$.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$\\dfrac{22x - 22}{15}$",
        decision: "Collect. The numerator has a common factor 22, so $\\dfrac{22(x - 1)}{15}$ is equally acceptable; 22 and 15 share no factor, so the fraction will not reduce further.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$\\dfrac{22x - 22}{15}$, or $\\dfrac{22(x-1)}{15}$",
    twin: {
      stem: "Write $\\dfrac{3y - 2}{2} - \\dfrac{y + 1}{6}$ as a single fraction.",
      answer: algAnswer("\\frac{8y-7}{6}", { variables: ["y"], equivalence: "equivalent" }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 0, studentSupplies: [1, 2, 3, 4] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
  {
    id: `we.${T}.03`,
    topic: T, specRefs: SOLVE, paper: M3,
    stem: "Solve $\\dfrac{x + 4}{2} + \\dfrac{x - 1}{3} = 5$.",
    figure: arrowsFig,
    steps: [
      {
        n: 1,
        working: "Multiply every term by 12: $\\dfrac{12(x+4)}{2} + \\dfrac{12(x-1)}{3} = 12 \\times 5$",
        decision: "The LCM of 2 and 3 is 6, and 6 would clear both fractions; 12 is used here to match the diagram, and any common multiple works. **Every** term is multiplied, including the 5 on the right.",
        whyMenu: {
          options: [
            "Because an equation stays balanced only if both sides are multiplied by the same amount",
            "Because the fractions are on the left, so only the left side changes",
            "Because the 5 has no denominator, so it is left alone",
          ],
          correct: 0,
          explain: "Multiplying one side alone breaks the equation. The 5 is $\\frac{5}{1}$, and it becomes 60.",
        },
        earns: ["M1"],
      },
      {
        n: 2,
        working: "$6(x + 4) + 4(x - 1) = 60$",
        decision: "$12 \\div 2 = 6$ and $12 \\div 3 = 4$. The denominators are gone; what is left is an ordinary linear equation with brackets.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$6x + 24 + 4x - 4 = 60$, so $10x + 20 = 60$",
        decision: "Expand each bracket term by term, then collect. Keeping the expansion on its own line makes any slip easy to find.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$10x = 40$, so $x = 4$",
        decision: "Solve as usual. Then substitute back: $\\dfrac{8}{2} + \\dfrac{3}{3} = 4 + 1 = 5$. The check costs ten seconds and confirms the sign work.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$x = 4$",
    twin: {
      stem: "Solve $\\dfrac{x + 5}{2} + \\dfrac{x - 1}{3} = 8$.",
      answer: numAnswer(7),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3, 4] }, { showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.03`,
    version: 1,
  },
  {
    id: `we.${T}.04`,
    topic: T, specRefs: SOLVE, paper: M3,
    stem: "A water butt holds $x$ litres when full.\n\nOn Monday a quarter of the water is used. On Tuesday a sixth of the original amount is used. Altogether 75 litres are used.\n\nForm an equation and solve it to find $x$.",
    steps: [
      {
        n: 1,
        working: "$\\dfrac{x}{4} + \\dfrac{x}{6} = 75$",
        decision: "'A quarter of $x$' is $\\frac{x}{4}$ and 'a sixth of $x$' is $\\frac{x}{6}$. Writing the equation is a mark in itself, so it goes on the page before any solving.",
        earns: ["M1"],
      },
      {
        n: 2,
        working: "Multiply every term by 12: $3x + 2x = 900$",
        decision: "LCM of 4 and 6 is 12. $12 \\div 4 = 3$ and $12 \\div 6 = 2$, and the 75 becomes $12 \\times 75 = 900$.",
        whyMenu: {
          options: [
            "$12 \\times 75 = 900$, because the right-hand side is multiplied as well",
            "The 75 stays as it is, because it has no denominator",
            "The 75 is divided by 12 to balance the left side",
          ],
          correct: 0,
          explain: "Every term on both sides is multiplied by the same number, which is what keeps the equation true.",
        },
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$5x = 900$, so $x = 180$",
        decision: "Collect and divide. The answer is a number of litres, so it should look sensible for a water butt.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "Check: $\\dfrac{180}{4} = 45$ and $\\dfrac{180}{6} = 30$, and $45 + 30 = 75$.",
        decision: "Substituting back into the original words, not just the equation, catches a setup error as well as an arithmetic one.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "$x = 180$ litres",
    twin: {
      stem: "Deirdre thinks of a number $n$. She adds 5 and halves the result. She also subtracts 1 from $n$ and divides by 3. The two answers add to 8. Form an equation and solve it to find $n$.",
      answer: numAnswer(7),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3, 4] }, { showSteps: 0, studentSupplies: [1, 2, 3, 4] }],
    verification: `ver.we.${T}.04`,
    version: 1,
  },
];

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`, topic: T, specRefs: REF, when: "pre",
    items: [
      dxItem("01", "What is the lowest common denominator for $\\dfrac{2x}{3} + \\dfrac{x}{4}$?", "Choose the lowest common denominator",
        [
          ["12", true, null, "The smallest number both 3 and 4 divide into. Their product, 12, happens to be the LCM here because they share no factor."],
          ["7", false, "maths.alg-fractions.cannot-start-common-denominator", "The denominators were added. A common denominator has to be a multiple of both, and 7 is a multiple of neither."],
          ["3", false, "maths.alg-fractions.cannot-start-common-denominator", "4 does not divide into 3, so the second fraction cannot be rewritten over 3."],
        ], 15),
      dxItem("02", "$\\dfrac{x + 3}{4} = \\dfrac{?}{12}$. What replaces the question mark?", "Rewrite a fraction over a larger denominator",
        [
          ["$3(x + 3)$", true, null, "The denominator was multiplied by 3, so the numerator is too — and the whole numerator, kept in a bracket."],
          ["$x + 3$", false, "maths.alg-fractions.multiply-only-part-of-side", "Only the denominator changed, which changes the value of the fraction. Whatever is done below the line must be done above it."],
          ["$3x + 3$", false, "maths.alg-fractions.multiply-only-part-of-side", "Only the $x$ was multiplied by 3. The 3 in the numerator is part of the same expression and must be multiplied too, giving $3x + 9$."],
        ], 25),
      dxItem("03", "$\\dfrac{5x}{6} - \\dfrac{x + 2}{6} = $ ?", "Subtract a multi-term numerator",
        [
          ["$\\dfrac{4x - 2}{6}$", true, null, "$5x - (x + 2) = 5x - x - 2 = 4x - 2$. The minus sign reaches both terms of the second numerator."],
          ["$\\dfrac{4x + 2}{6}$", false, "maths.alg-fractions.subtract-multi-term-numerator", "Only the $x$ was subtracted. Removing the bracket changes the sign of every term inside it, so $+2$ becomes $-2$."],
          ["$\\dfrac{6x + 2}{6}$", false, "maths.alg-fractions.subtract-multi-term-numerator", "The numerators were added. The operation between the fractions is a subtraction."],
        ], 30),
      dxItem("04", "To solve $\\dfrac{x}{5} + 2 = 7$, you multiply every term by 5. What does the 2 become?", "Multiply every term, including the constants",
        [
          ["10", true, null, "Every term on both sides is multiplied by 5, so 2 becomes 10 and 7 becomes 35, giving $x + 10 = 35$."],
          ["2", false, "maths.alg-fractions.multiply-only-part-of-side", "Leaving the 2 alone unbalances the equation. November 2024 M3 Q23 reported exactly this: one term on a side multiplied and the other not."],
          ["$\\dfrac{2}{5}$", false, "maths.alg-fractions.multiply-only-part-of-side", "That divides instead of multiplying. The aim is to clear the denominator, so every term is multiplied by 5."],
        ], 30),
      dxItem("05", "Solving $\\dfrac{2x + 1}{3} = 5$, what is the correct first line?", "Clear a single denominator",
        [
          ["$2x + 1 = 15$", true, null, "Multiplying both sides by 3 cancels the denominator on the left and turns the 5 into 15."],
          ["$3(2x + 1) = 5$", false, "maths.alg-fractions.multiply-only-part-of-side", "The numerator was multiplied by 3 as well as the denominator cancelled, so the left side has been multiplied twice. Summer 2025 M4 Q3 reported this as an incorrect first line with no follow-through."],
          ["$2x + 1 = \\dfrac{5}{3}$", false, "maths.alg-fractions.multiply-only-part-of-side", "The right side was divided instead of multiplied. To undo a division by 3, multiply."],
        ], 30),
      dxItem("06", "Solving $\\dfrac{x}{2} + \\dfrac{x}{3} = 1$, a student writes $0.5x + 0.33x = 1$. What is the risk?", "Keep fractions exact",
        [
          ["0.33 is not exactly one third, so the answer will be slightly out", true, null, "$\\frac{1}{3} = 0.333...$; rounding it loses accuracy marks. Clearing the denominators keeps everything exact."],
          ["There is no risk, decimals are always fine", false, "maths.alg-fractions.decimal-conversion-rounding", "Summer 2023 M3 Q19 reported candidates who converted to decimals losing one or two marks through rounding."],
          ["Decimals cannot be used in algebra", false, "maths.alg-fractions.decimal-conversion-rounding", "They can, but a recurring decimal has to be rounded, and that is where the accuracy goes. Multiplying by 6 avoids the problem entirely."],
        ], 35),
      dxItem("07", "In $\\dfrac{3(x - 2)}{4} = 6$, what is the first line after multiplying by 4?", "Clear a denominator with a bracket above it",
        [
          ["$3(x - 2) = 24$", true, null, "The 4 cancels on the left and the 6 becomes 24. The bracket is expanded on the next line, not this one."],
          ["$3x - 2 = 24$", false, "maths.algebra.bracket-expansion-sign", "The bracket was removed without multiplying the $-2$ by 3. November 2025 M4 Q14 reported expansions of this shape going wrong."],
          ["$3(x - 2) = 6$", false, "maths.alg-fractions.multiply-only-part-of-side", "The right side was not multiplied. Both sides get the same treatment."],
        ], 35),
      dxItem("08", "You solved a fractional equation and got $x = 4$. What is the quickest way to be sure?", "Check by substitution",
        [
          ["Put 4 back into the original equation and see whether both sides agree", true, null, "Ten seconds, and it catches sign slips and expansion errors alike. It is the best habit on this topic."],
          ["Check the answer is a whole number", false, "maths.alg-fractions.decimal-conversion-rounding", "Fractional equations often have fractional answers; being a whole number proves nothing."],
          ["Re-read the working for mistakes", false, "maths.presentation.answer-without-working", "Re-reading tends to repeat the same thinking. Substituting tests the answer independently."],
        ], 25),
    ],
  },
];

// ---------------------------------------------------------------- questions
const mk = (n, o) => question({ id: `q.${T}.${String(n).padStart(4, "0")}`, topic: T, ...o });

const questions = [
  mk(1, {
    specRefs: ADD, style: "practice", difficulty: 1, commandWords: ["Simplify"], setting: "Pure algebra, same denominator",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q12"],
    solutionProgram: "(5x)/6 - (x+2)/6 = (5x - x - 2)/6 = (4x-2)/6 = (2x-1)/3; checked at x = 2 (10/6 - 4/6 = 1), x = -3, x = 0.5",
    parts: [{
      id: "main", verb: "simplify", marks: 2,
      stem: "Simplify $\\dfrac{5x}{6} - \\dfrac{x + 2}{6}$.",
      answer: algAnswer("\\frac{4x-2}{6}", { equivalence: "equivalent" }),
      scheme: [
        MA("MA1", 1, "5x − (x + 2) over 6, with the second numerator bracketed"),
        A("A1", 1, "(4x − 2)/6, or the equivalent (2x − 1)/3", { dependsOn: ["MA1"] }),
      ],
      hints: ["The denominators already match, so only the numerators are combined.", "The whole of $x + 2$ is subtracted."],
      workedSolution: "$\\dfrac{5x - (x + 2)}{6} = \\dfrac{5x - x - 2}{6} = \\dfrac{4x - 2}{6}$, which also simplifies to $\\dfrac{2x - 1}{3}$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.subtract-multi-term-numerator",
        pattern: { kind: "algebraic", latex: "\\frac{4x+2}{6}" },
        feedback: "Only the $x$ was subtracted. When the bracket comes off, every sign inside it changes, so $+2$ becomes $-2$.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2025-summer:M4:Q21",
      }],
      requiresWorking: true,
    }],
  }),
  mk(2, {
    specRefs: ADD, style: "practice", difficulty: 2, commandWords: ["Simplify"], paper: M7P1,
    setting: "Pure algebra, one denominator a multiple of the other, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q12"],
    solutionProgram: C.f + " | " + C.e,
    parts: [
      {
        id: "a", verb: "simplify", marks: 2,
        stem: "Write $\\dfrac{4x + 1}{5} + \\dfrac{x - 2}{10}$ as a single fraction.",
        answer: algAnswer("\\frac{9x}{10}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 10 with numerators 2(4x + 1) and (x − 2)"),
          A("A1", 1, "9x/10", { dependsOn: ["M1"] }),
        ],
        hints: ["10 is already a multiple of 5, so 10 is the lowest common denominator.", "$10 \\div 5 = 2$, so the first numerator doubles.", "$8x + 2 + x - 2$ — the numbers cancel."],
        workedSolution: "$\\dfrac{2(4x + 1) + (x - 2)}{10} = \\dfrac{8x + 2 + x - 2}{10} = \\dfrac{9x}{10}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.cannot-start-common-denominator",
          pattern: { kind: "algebraic", latex: "\\frac{5x-1}{15}" },
          feedback: "Numerators and denominators were added separately. Rewrite both fractions over 10 first, then add only the numerators.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M3:Q12",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{x + 2}{4} - \\dfrac{x - 6}{8}$ as a single fraction.",
        answer: algAnswer("\\frac{x+10}{8}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 8 with numerators 2(x + 2) and (x − 6)"),
          A("A1", 1, "2x + 4 − (x − 6) with the subtracted numerator bracketed", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(x + 10)/8"),
        ],
        hints: ["8 is a multiple of 4.", "$8 \\div 4 = 2$, so the first numerator doubles.", "Removing the subtracted bracket turns $-6$ into $+6$."],
        workedSolution: "$\\dfrac{2(x + 2) - (x - 6)}{8} = \\dfrac{2x + 4 - x + 6}{8} = \\dfrac{x + 10}{8}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.subtract-multi-term-numerator",
          pattern: { kind: "algebraic", latex: "\\frac{x-2}{8}" },
          feedback: "The $-6$ kept its sign. Minus a bracket changes every term inside it, so $-6$ becomes $+6$ and the numerator is $x + 10$.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q21",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(3, {
    specRefs: ADD, style: "practice", difficulty: 3, commandWords: ["Simplify"],
    setting: "Pure algebra, denominators with no common factor",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q12"],
    solutionProgram: C.a + " | " + C.c,
    figures: [stripFig],
    parts: [
      {
        id: "a", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{3x + 1}{4} + \\dfrac{2x - 5}{6}$ as a single fraction in its simplest form.",
        answer: algAnswer("\\frac{13x-7}{12}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "lowest common denominator 12 identified"),
          A("A1", 1, "numerators 3(3x + 1) and 2(2x − 5) over 12", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(13x − 7)/12"),
        ],
        hints: ["The LCM of 4 and 6 is 12, not 24.", "$12 \\div 4 = 3$ and $12 \\div 6 = 2$.", "$9x + 3 + 4x - 10$."],
        workedSolution: "$\\dfrac{3(3x + 1) + 2(2x - 5)}{12} = \\dfrac{9x + 3 + 4x - 10}{12} = \\dfrac{13x - 7}{12}$.",
        commonErrors: [
          {
            misconception: "maths.alg-fractions.multiply-only-part-of-side",
            pattern: { kind: "algebraic", latex: "\\frac{9x+1+4x-5}{12}" },
            feedback: "Only the $x$ terms were multiplied up. The multiplier applies to the whole numerator, so $3(3x + 1) = 9x + 3$.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M4:Q3",
          },
          {
            misconception: "maths.alg-fractions.cannot-start-common-denominator",
            pattern: { kind: "algebraic", latex: "\\frac{5x-4}{10}" },
            feedback: "Numerators and denominators were combined separately. Over half the candidates in Summer 2025 M3 Q12 did not know where to begin; the first move is always the common denominator.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-summer:M3:Q12",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{2x + 7}{5} + \\dfrac{x - 3}{2}$ as a single fraction.",
        answer: algAnswer("\\frac{9x-1}{10}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 10 identified"),
          A("A1", 1, "numerators 2(2x + 7) and 5(x − 3) over 10", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(9x − 1)/10"),
        ],
        hints: ["5 and 2 share no factor, so the LCD is 10.", "$10 \\div 5 = 2$ and $10 \\div 2 = 5$.", "$4x + 14 + 5x - 15$."],
        workedSolution: "$\\dfrac{2(2x + 7) + 5(x - 3)}{10} = \\dfrac{4x + 14 + 5x - 15}{10} = \\dfrac{9x - 1}{10}$.",
        commonErrors: [{
          misconception: "maths.algebra.bracket-expansion-sign",
          pattern: { kind: "algebraic", latex: "\\frac{9x+29}{10}" },
          feedback: "$5(x - 3)$ came out as $5x + 15$. Multiplying a bracket keeps the sign of each term, so it is $5x - 15$.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-november:M4:Q14",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(4, {
    specRefs: ADD, style: "practice", difficulty: 3, commandWords: ["Simplify"],
    setting: "Pure algebra, subtraction with a multi-term numerator",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q21"],
    solutionProgram: C.b + " | " + C.i,
    parts: [
      {
        id: "a", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{5x - 2}{3} - \\dfrac{x + 4}{5}$ as a single fraction.",
        answer: algAnswer("\\frac{22x-22}{15}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 15 with numerators 5(5x − 2) and 3(x + 4)"),
          A("A1", 1, "25x − 10 − (3x + 12), with the subtracted numerator bracketed", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(22x − 22)/15, or 22(x − 1)/15"),
        ],
        hints: ["LCD 15.", "Keep the subtracted numerator in a bracket until it is expanded.", "$-(3x + 12) = -3x - 12$."],
        workedSolution: "$\\dfrac{5(5x - 2) - 3(x + 4)}{15} = \\dfrac{25x - 10 - (3x + 12)}{15} = \\dfrac{25x - 10 - 3x - 12}{15} = \\dfrac{22x - 22}{15}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.subtract-multi-term-numerator",
          pattern: { kind: "algebraic", latex: "\\frac{22x+2}{15}" },
          feedback: "The $+12$ kept its sign after the bracket was removed. Both terms change: $-3x - 12$. The Summer 2025 report noted that only a small number reached full marks once more than one term had to be subtracted.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q21",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{x - 4}{3} - \\dfrac{2x + 1}{9}$ as a single fraction.",
        answer: algAnswer("\\frac{x-13}{9}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 9 with numerators 3(x − 4) and (2x + 1)"),
          A("A1", 1, "3x − 12 − (2x + 1)", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(x − 13)/9"),
        ],
        hints: ["9 is already a multiple of 3.", "$9 \\div 3 = 3$, so the first numerator triples.", "$3x - 12 - 2x - 1$."],
        workedSolution: "$\\dfrac{3(x - 4) - (2x + 1)}{9} = \\dfrac{3x - 12 - 2x - 1}{9} = \\dfrac{x - 13}{9}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.subtract-multi-term-numerator",
          pattern: { kind: "algebraic", latex: "\\frac{x-11}{9}" },
          feedback: "The $+1$ was not turned into $-1$. Removing a subtracted bracket changes every sign inside it.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M4:Q21",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(5, {
    specRefs: ADD, style: "practice", difficulty: 4, commandWords: ["Simplify"],
    setting: "Pure algebra, a multiplier outside a fraction",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q14"],
    solutionProgram: C.j + " | " + C.h,
    parts: [
      {
        id: "a", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{2(x + 1)}{3} + \\dfrac{x - 5}{4}$ as a single fraction.",
        answer: algAnswer("\\frac{11x-7}{12}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 12 with numerators 8(x + 1) and 3(x − 5)"),
          A("A1", 1, "8x + 8 + 3x − 15", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(11x − 7)/12"),
        ],
        hints: ["The 2 outside is part of the first numerator: it is $\\dfrac{2x + 2}{3}$.", "LCD 12, so the first numerator is multiplied by 4 and the second by 3.", "$4 \\times 2(x + 1) = 8(x + 1)$."],
        workedSolution: "$\\dfrac{2(x+1)}{3} = \\dfrac{2x + 2}{3}$. Over 12: $\\dfrac{4(2x + 2) + 3(x - 5)}{12} = \\dfrac{8x + 8 + 3x - 15}{12} = \\dfrac{11x - 7}{12}$.",
        commonErrors: [{
          misconception: "maths.algebra.bracket-expansion-sign",
          pattern: { kind: "algebraic", latex: "\\frac{7x-11}{12}" },
          feedback: "The 2 outside the first bracket was dropped, giving $4(x + 1)$ instead of $8(x + 1)$. Turn $\\dfrac{2(x+1)}{3}$ into $\\dfrac{2x+2}{3}$ first and the multiplier cannot be missed.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q14",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{2x - 3}{7} + \\dfrac{x + 5}{2}$ as a single fraction.",
        answer: algAnswer("\\frac{11x+29}{14}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 14 with numerators 2(2x − 3) and 7(x + 5)"),
          A("A1", 1, "4x − 6 + 7x + 35", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(11x + 29)/14"),
        ],
        hints: ["7 and 2 share no factor, so the LCD is 14.", "$14 \\div 7 = 2$ and $14 \\div 2 = 7$.", "$4x - 6 + 7x + 35$."],
        workedSolution: "$\\dfrac{2(2x - 3) + 7(x + 5)}{14} = \\dfrac{4x - 6 + 7x + 35}{14} = \\dfrac{11x + 29}{14}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "algebraic", latex: "\\frac{11x+2}{14}" },
          feedback: "The constants were not multiplied up: $7(x + 5)$ is $7x + 35$, not $7x + 5$. Every term of a numerator is multiplied.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q3",
        }],
        requiresWorking: true,
      },
    ],
  }),
  mk(6, {
    specRefs: SOLVE, style: "practice", difficulty: 2, commandWords: ["Solve"], paper: M7P1,
    setting: "Pure algebra, one fraction, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q9"],
    solutionProgram: "(5x-2)/4 = 7 -> 5x - 2 = 28 -> 5x = 30 -> x = 6; check (30-2)/4 = 28/4 = 7",
    parts: [{
      id: "main", verb: "solve", marks: 3,
      stem: "Solve $\\dfrac{5x - 2}{4} = 7$.",
      answer: numAnswer(6),
      scheme: [
        M("M1", 1, "both sides multiplied by 4: 5x − 2 = 28"),
        MA("MA1", 1, "5x = 30"),
        A("A1", 1, "x = 6", { dependsOn: ["M1"] }),
      ],
      hints: ["Multiplying both sides by 4 cancels the denominator on the left.", "The 7 becomes 28.", "$5x = 30$."],
      workedSolution: "$\\dfrac{5x - 2}{4} = 7 \\Rightarrow 5x - 2 = 28 \\Rightarrow 5x = 30 \\Rightarrow x = 6$. Check: $\\dfrac{30 - 2}{4} = 7$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.multiply-only-part-of-side",
        pattern: { kind: "numeric" },
        feedback: "The right side was left as 7, giving $5x - 2 = 7$. Multiplying by 4 applies to both sides, so the 7 becomes 28.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2024-november:M4:Q9",
      }],
      requiresWorking: true,
    }],
  }),
  mk(7, {
    specRefs: SOLVE, style: "practice", difficulty: 3, commandWords: ["Solve"],
    setting: "Pure algebra, two fractions and a constant",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q19"],
    solutionProgram: "(x+4)/2 + (x-1)/3 = 5; x6: 3(x+4) + 2(x-1) = 30 -> 3x+12+2x-2 = 30 -> 5x+10 = 30 -> x = 4; check 8/2 + 3/3 = 4 + 1 = 5",
    figures: [arrowsFig],
    parts: [{
      id: "main", verb: "solve", marks: 4,
      stem: "Solve $\\dfrac{x + 4}{2} + \\dfrac{x - 1}{3} = 5$.",
      answer: numAnswer(4),
      scheme: [
        M("M1", 1, "every term multiplied by 6 (or 12): 3(x + 4) + 2(x − 1) = 30"),
        A("A1", 1, "3x + 12 + 2x − 2 = 30", { dependsOn: ["M1"] }),
        MA("MA1", 1, "5x + 10 = 30 or 5x = 20"),
        A("A2", 1, "x = 4", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["LCM of 2 and 3 is 6.", "The 5 on the right becomes 30.", "$3x + 12 + 2x - 2 = 30$.", "Collect to $5x + 10 = 30$."],
      workedSolution: "Multiply every term by 6: $3(x + 4) + 2(x - 1) = 30$.\nExpand: $3x + 12 + 2x - 2 = 30$.\nCollect: $5x + 10 = 30$, so $5x = 20$ and $x = 4$.\nCheck: $\\dfrac{8}{2} + \\dfrac{3}{3} = 4 + 1 = 5$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "numeric" },
          feedback: "The 5 was not multiplied by 6, so the equation became $5x + 10 = 5$. Every term on both sides gets the same multiplier.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M3:Q23",
        },
        {
          misconception: "maths.alg-fractions.decimal-conversion-rounding",
          pattern: { kind: "numeric" },
          feedback: "Converting to decimals introduced a rounding error. Summer 2023 M3 Q19 reported that decimal routes lost one or two marks; multiplying through by 6 keeps everything exact.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2023-summer:M3:Q19",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(8, {
    specRefs: SOLVE, style: "practice", difficulty: 3, commandWords: ["Solve"],
    setting: "Pure algebra, a subtraction of two fractions",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q19"],
    solutionProgram: "(3x-1)/4 - (x-5)/6 = 7; x12: 3(3x-1) - 2(x-5) = 84 -> 9x-3-2x+10 = 84 -> 7x+7 = 84 -> x = 11; check 32/4 - 6/6 = 8 - 1 = 7",
    parts: [{
      id: "main", verb: "solve", marks: 4,
      stem: "Solve $\\dfrac{3x - 1}{4} - \\dfrac{x - 5}{6} = 7$.",
      answer: numAnswer(11),
      scheme: [
        M("M1", 1, "every term multiplied by 12: 3(3x − 1) − 2(x − 5) = 84"),
        A("A1", 1, "9x − 3 − 2x + 10 = 84, with both signs of the second bracket changed", { dependsOn: ["M1"] }),
        MA("MA1", 1, "7x + 7 = 84 or 7x = 77"),
        A("A2", 1, "x = 11", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["LCM of 4 and 6 is 12; the 7 becomes 84.", "$-2(x - 5) = -2x + 10$.", "Collect: $7x + 7 = 84$."],
      workedSolution: "Multiply every term by 12: $3(3x - 1) - 2(x - 5) = 84$.\nExpand: $9x - 3 - 2x + 10 = 84$.\nCollect: $7x + 7 = 84$, so $7x = 77$ and $x = 11$.\nCheck: $\\dfrac{32}{4} - \\dfrac{6}{6} = 8 - 1 = 7$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.subtract-multi-term-numerator",
        pattern: { kind: "numeric" },
        feedback: "$-2(x - 5)$ was taken as $-2x - 10$, so the constant came out wrong. The minus multiplies both terms, turning $-5$ into $+10$.",
        marksTypicallyEarned: 1,
        source: "ccea-cer:maths:2025-summer:M4:Q21",
      }],
      requiresWorking: true,
    }],
  }),
  mk(9, {
    specRefs: SOLVE, style: "practice", difficulty: 4, commandWords: ["Solve"],
    setting: "Pure algebra, unknown on both sides with two fractions",
    examinerSources: ["ccea-cer:maths:2024-november:M3:Q23"],
    solutionProgram: "(x+9)/2 = (2x+3)/3; x6: 3(x+9) = 2(2x+3) -> 3x+27 = 4x+6 -> 21 = x; check 30/2 = 15 and 45/3 = 15",
    parts: [{
      id: "main", verb: "solve", marks: 4,
      stem: "Solve $\\dfrac{x + 9}{2} = \\dfrac{2x + 3}{3}$.",
      answer: numAnswer(21),
      scheme: [
        M("M1", 1, "cross-multiplying or multiplying both sides by 6: 3(x + 9) = 2(2x + 3)"),
        A("A1", 1, "3x + 27 = 4x + 6", { dependsOn: ["M1"] }),
        MA("MA1", 1, "21 = x or −x = −21"),
        A("A2", 1, "x = 21", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["Multiplying both sides by 6 clears both denominators at once.", "$6 \\div 2 = 3$ and $6 \\div 3 = 2$.", "Gather the $x$ terms on the side that keeps them positive."],
      workedSolution: "Multiply both sides by 6: $3(x + 9) = 2(2x + 3)$.\nExpand: $3x + 27 = 4x + 6$.\nSubtract $3x$ and 6 from both sides: $21 = x$.\nCheck: $\\dfrac{30}{2} = 15$ and $\\dfrac{45}{3} = 15$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.multiply-only-part-of-side",
        pattern: { kind: "numeric" },
        feedback: "Both denominators were simply crossed out, leaving $x + 9 = 2x + 3$ and $x = 6$. Removing a denominator means multiplying **both** sides by it, so the left needs $\\times 3$ and the right $\\times 2$, giving $3(x + 9) = 2(2x + 3)$. November 2024 M3 Q23 named this: whatever one term is multiplied by, every term on both sides gets the same.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2024-november:M3:Q23",
      }],
      requiresWorking: true,
    }],
  }),
  mk(10, {
    specRefs: SOLVE, style: "practice", difficulty: 4, commandWords: ["Solve"],
    setting: "Pure algebra, a bracket above a fraction line",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q14"],
    solutionProgram: "2(x+3)/5 - (x-4)/2 = 1; x10: 4(x+3) - 5(x-4) = 10 -> 4x+12-5x+20 = 10 -> -x+32 = 10 -> x = 22; check 2*25/5 - 18/2 = 10 - 9 = 1",
    parts: [{
      id: "main", verb: "solve", marks: 4,
      stem: "Solve $\\dfrac{2(x + 3)}{5} - \\dfrac{x - 4}{2} = 1$.",
      answer: numAnswer(22),
      scheme: [
        M("M1", 1, "every term multiplied by 10: 4(x + 3) − 5(x − 4) = 10"),
        A("A1", 1, "4x + 12 − 5x + 20 = 10, with both signs of the second bracket changed", { dependsOn: ["M1"] }),
        MA("MA1", 1, "−x + 32 = 10 or −x = −22"),
        A("A2", 1, "x = 22", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["LCD 10; the 1 on the right becomes 10.", "$10 \\div 5 = 2$, and that 2 multiplies the whole numerator $2(x + 3)$, giving $4(x + 3)$.", "$-5(x - 4) = -5x + 20$.", "The $x$ coefficient comes out negative; divide by $-1$ at the end."],
      workedSolution: "Multiply every term by 10: $4(x + 3) - 5(x - 4) = 10$.\nExpand: $4x + 12 - 5x + 20 = 10$.\nCollect: $-x + 32 = 10$, so $-x = -22$ and $x = 22$.\nCheck: $\\dfrac{2 \\times 25}{5} - \\dfrac{18}{2} = 10 - 9 = 1$.",
      commonErrors: [
        {
          misconception: "maths.algebra.bracket-expansion-sign",
          pattern: { kind: "numeric" },
          feedback: "$-5(x - 4)$ came out as $-5x - 20$, so the constant was wrong. November 2025 M4 Q14 reported expansions of this shape going wrong, though follow-through marks were still available.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q14",
        },
        {
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "numeric" },
          feedback: "The 1 on the right was left unmultiplied. Every term on both sides is multiplied by 10, so the right becomes 10.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M3:Q23",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(11, {
    specRefs: SOLVE, style: "practice", difficulty: 4, commandWords: ["Solve"],
    setting: "Pure algebra, a fraction on the right-hand side",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q19"],
    solutionProgram: "(2x+5)/6 + (3x-1)/3 = 9/2; x6: (2x+5) + 2(3x-1) = 27 -> 2x+5+6x-2 = 27 -> 8x+3 = 27 -> x = 3; check 11/6 + 8/3 = 11/6 + 16/6 = 27/6 = 4.5",
    parts: [{
      id: "main", verb: "solve", marks: 4,
      stem: "Solve $\\dfrac{2x + 5}{6} + \\dfrac{3x - 1}{3} = \\dfrac{9}{2}$.",
      answer: numAnswer(3),
      scheme: [
        M("M1", 1, "every term multiplied by 6: (2x + 5) + 2(3x − 1) = 27"),
        A("A1", 1, "2x + 5 + 6x − 2 = 27", { dependsOn: ["M1"] }),
        MA("MA1", 1, "8x + 3 = 27 or 8x = 24"),
        A("A2", 1, "x = 3", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["6 is a multiple of 6, 3 and 2, so it clears all three fractions.", "$6 \\times \\dfrac{9}{2} = 27$.", "$2x + 5 + 6x - 2 = 27$."],
      workedSolution: "Multiply every term by 6: $(2x + 5) + 2(3x - 1) = 27$.\nExpand: $2x + 5 + 6x - 2 = 27$.\nCollect: $8x + 3 = 27$, so $8x = 24$ and $x = 3$.\nCheck: $\\dfrac{11}{6} + \\dfrac{8}{3} = \\dfrac{11}{6} + \\dfrac{16}{6} = \\dfrac{27}{6} = \\dfrac{9}{2}$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.decimal-conversion-rounding",
        pattern: { kind: "numeric" },
        feedback: "The fractions were turned into decimals and rounded. Keeping them exact, by multiplying every term by 6, avoids the loss entirely.",
        marksTypicallyEarned: 3,
        source: "ccea-cer:maths:2023-summer:M3:Q19",
      }],
      requiresWorking: true,
    }],
  }),
  mk(12, {
    specRefs: SOLVE, style: "practice", difficulty: 4, commandWords: ["Form an equation", "Solve"],
    emphasis: ["form an equation"], setting: "A water butt emptied over two days",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-november:M3:Q23"],
    solutionProgram: "x/4 + x/6 = 75; x12: 3x + 2x = 900 -> 5x = 900 -> x = 180; check 45 + 30 = 75",
    parts: [{
      id: "main", verb: "form-an-equation", marks: 4,
      stem: "A water butt holds $x$ litres when full.\n\nOn Monday a quarter of the full amount is used. On Tuesday a sixth of the full amount is used. Altogether 75 litres are used.\n\n**Form an equation** in $x$ and solve it to find how many litres the butt holds when full.",
      answer: numAnswer(180, { unit: "litres", unitRequired: false }),
      scheme: [
        M("M1", 1, "x/4 + x/6 = 75 formed"),
        A("A1", 1, "every term multiplied by 12: 3x + 2x = 900", { dependsOn: ["M1"] }),
        MA("MA1", 1, "5x = 900"),
        A("A2", 1, "x = 180 (litres)", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["'A quarter of $x$' is $\\dfrac{x}{4}$.", "The two amounts add to 75.", "LCM of 4 and 6 is 12, and the 75 becomes 900."],
      workedSolution: "$\\dfrac{x}{4} + \\dfrac{x}{6} = 75$.\nMultiply every term by 12: $3x + 2x = 900$, so $5x = 900$ and $x = 180$ litres.\nCheck: $\\dfrac{180}{4} = 45$ and $\\dfrac{180}{6} = 30$, and $45 + 30 = 75$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "numeric" },
          feedback: "The 75 was not multiplied by 12, so the equation became $5x = 75$. Both sides get the same multiplier.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2024-november:M3:Q23",
        },
        {
          misconception: "maths.alg-fractions.cannot-start-common-denominator",
          pattern: { kind: "numeric" },
          feedback: "The two fractions were treated as $\\dfrac{x}{4} + \\dfrac{x}{6} = \\dfrac{2x}{10}$. Denominators are never added; rewrite both over 12 or clear them.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M3:Q12",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(13, {
    specRefs: SOLVE, style: "practice", difficulty: 4, commandWords: ["Form an equation", "Solve"],
    setting: "A number puzzle with two fractional operations",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q19"],
    solutionProgram: "(n+5)/2 + (n-1)/3 = 8; x6: 3(n+5) + 2(n-1) = 48 -> 3n+15+2n-2 = 48 -> 5n+13 = 48 -> 5n = 35 -> n = 7; check 12/2 + 6/3 = 6 + 2 = 8",
    parts: [{
      id: "main", verb: "form-an-equation", marks: 4,
      stem: "Deirdre thinks of a number $n$.\n\nShe adds 5 to it and halves the result. She also subtracts 1 from $n$ and divides that result by 3.\n\nHer two answers add to 8. Form an equation and solve it to find $n$.",
      answer: numAnswer(7),
      scheme: [
        M("M1", 1, "(n + 5)/2 + (n − 1)/3 = 8 formed"),
        A("A1", 1, "every term multiplied by 6: 3(n + 5) + 2(n − 1) = 48", { dependsOn: ["M1"] }),
        MA("MA1", 1, "5n + 13 = 48 or 5n = 35"),
        A("A2", 1, "n = 7", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["'Adds 5 then halves' is $\\dfrac{n + 5}{2}$, with the whole of $n + 5$ over the 2.", "LCM of 2 and 3 is 6; the 8 becomes 48.", "$3n + 15 + 2n - 2 = 48$."],
      workedSolution: "$\\dfrac{n + 5}{2} + \\dfrac{n - 1}{3} = 8$.\nMultiply every term by 6: $3(n + 5) + 2(n - 1) = 48$.\nExpand and collect: $3n + 15 + 2n - 2 = 48$, so $5n + 13 = 48$, $5n = 35$ and $n = 7$.\nCheck: $\\dfrac{12}{2} + \\dfrac{6}{3} = 6 + 2 = 8$.",
      commonErrors: [{
        misconception: "maths.alg-fractions.cannot-start-common-denominator",
        pattern: { kind: "numeric" },
        feedback: "The equation was written as $\\dfrac{n}{2} + 5 + \\dfrac{n}{3} - 1 = 8$, which is a different instruction. 'Adds 5 and halves the result' puts the whole of $n + 5$ over the 2.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2023-summer:M3:Q19",
      }],
      requiresWorking: true,
    }],
  }),
  // ------------------------------------------------------------ exam-style
  mk(14, {
    specRefs: ADD, style: "exam-style", difficulty: 4, commandWords: ["Simplify"],
    emphasis: ["as a single fraction"], setting: "Pure algebra, in the style of a mid-paper M3 item",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q12", "ccea-cer:maths:2025-summer:M4:Q21"],
    solutionProgram: C.a,
    parts: [{
      id: "main", verb: "simplify", marks: 3,
      stem: "Write\n\n$\\dfrac{3x + 1}{4} + \\dfrac{2x - 5}{6}$\n\n**as a single fraction** in its simplest form.",
      answer: algAnswer("\\frac{13x-7}{12}", { equivalence: "equivalent" }),
      scheme: [
        M("M1", 1, "lowest common denominator 12"),
        A("A1", 1, "3(3x + 1) + 2(2x − 5) over 12", { dependsOn: ["M1"] }),
        MA("MA1", 1, "(13x − 7)/12", { examinerNote: "(26x − 14)/24 from using 24 as the denominator earns M1 A1 and the final mark only if simplified." }),
      ],
      hints: ["Find the lowest common multiple of 4 and 6.", "Multiply each numerator by what its denominator was multiplied by.", "Expand, then collect."],
      workedSolution: "$\\dfrac{3(3x + 1) + 2(2x - 5)}{12} = \\dfrac{9x + 3 + 4x - 10}{12} = \\dfrac{13x - 7}{12}$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.cannot-start-common-denominator",
          pattern: { kind: "algebraic", latex: "\\frac{5x-4}{10}" },
          feedback: "Tops and bottoms were added separately. Over half the candidates in Summer 2025 M3 Q12 did not know where to start; the common denominator is always the first line.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M3:Q12",
        },
        {
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "algebraic", latex: "\\frac{13x-4}{12}" },
          feedback: "The constants were not multiplied up: $3(3x + 1) = 9x + 3$ and $2(2x - 5) = 4x - 10$. The whole numerator is multiplied, not just the $x$ term.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q3",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(15, {
    specRefs: SOLVE, style: "exam-style", difficulty: 5, commandWords: ["Solve"],
    setting: "Pure algebra, a four-mark fractional equation in the style of a late M3 item",
    examinerSources: ["ccea-cer:maths:2023-summer:M3:Q19", "ccea-cer:maths:2025-november:M4:Q14"],
    solutionProgram: "(4x+3)/5 - (x-2)/2 = 4; multiply every term by 10: 2(4x+3) - 5(x-2) = 40 -> 8x+6-5x+10 = 40 -> 3x+16 = 40 -> 3x = 24 -> x = 8; check (35)/5 - (6)/2 = 7 - 3 = 4",
    parts: [{
      id: "main", verb: "solve", marks: 4,
      stem: "Solve\n\n$\\dfrac{4x + 3}{5} - \\dfrac{x - 2}{2} = 4$",
      answer: numAnswer(8),
      scheme: [
        M("M1", 1, "every term multiplied by 10: 2(4x + 3) − 5(x − 2) = 40"),
        A("A1", 1, "8x + 6 − 5x + 10 = 40, both signs of the second bracket changed", { dependsOn: ["M1"] }),
        MA("MA1", 1, "3x + 16 = 40 or 3x = 24"),
        A("A2", 1, "x = 8", { ft: true, dependsOn: ["MA1"] }),
      ],
      hints: ["LCM of 5 and 2 is 10; the 4 on the right becomes 40.", "$10 \\div 5 = 2$ and $10 \\div 2 = 5$.", "$-5(x - 2) = -5x + 10$.", "Collect to $3x + 16 = 40$."],
      workedSolution: "Multiply every term by 10: $2(4x + 3) - 5(x - 2) = 40$.\nExpand: $8x + 6 - 5x + 10 = 40$.\nCollect: $3x + 16 = 40$, so $3x = 24$ and $x = 8$.\nCheck: $\\dfrac{35}{5} - \\dfrac{6}{2} = 7 - 3 = 4$.",
      commonErrors: [
        {
          misconception: "maths.alg-fractions.subtract-multi-term-numerator",
          pattern: { kind: "numeric" },
          feedback: "$-5(x - 2)$ came out as $-5x - 10$, so the constant was $-4$ instead of $+16$. The minus multiplies both terms inside the bracket.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q21",
        },
        {
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "numeric" },
          feedback: "The 4 on the right was left unmultiplied, so the equation became $2(4x + 3) - 5(x - 2) = 4$. Every term on both sides takes the same multiplier, so the 4 becomes 40.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M3:Q23",
        },
      ],
      requiresWorking: true,
    }],
  }),
  mk(16, {
    specRefs: REF, style: "exam-style", difficulty: 5, commandWords: ["Simplify", "Solve"],
    setting: "Pure algebra, a single fraction then the equation it comes from",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q12", "ccea-cer:maths:2023-summer:M3:Q19"],
    solutionProgram: "(a) (x-2)/3 + (x+6)/5 = (5(x-2) + 3(x+6))/15 = (5x-10+3x+18)/15 = (8x+8)/15; (b) setting it equal to 6: 8x+8 = 90 -> x = 82/8 = 10.25; check (10.25-2)/3 + (10.25+6)/5 = 2.75 + 3.25 = 6",
    parts: [
      {
        id: "a", verb: "simplify", marks: 3,
        stem: "Write $\\dfrac{x - 2}{3} + \\dfrac{x + 6}{5}$ as a single fraction.",
        answer: algAnswer("\\frac{8x+8}{15}", { equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "common denominator 15 with numerators 5(x − 2) and 3(x + 6)"),
          A("A1", 1, "5x − 10 + 3x + 18", { dependsOn: ["M1"] }),
          MA("MA1", 1, "(8x + 8)/15, or 8(x + 1)/15"),
        ],
        hints: ["3 and 5 share no factor, so the LCD is 15.", "$5(x - 2) = 5x - 10$ and $3(x + 6) = 3x + 18$."],
        workedSolution: "$\\dfrac{5(x - 2) + 3(x + 6)}{15} = \\dfrac{5x - 10 + 3x + 18}{15} = \\dfrac{8x + 8}{15}$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "algebraic", latex: "\\frac{8x+4}{15}" },
          feedback: "The constants were not multiplied: $5 \\times (-2) = -10$, not $-2$. The multiplier reaches every term of the numerator.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M4:Q3",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 2,
        stem: "Hence solve $\\dfrac{x - 2}{3} + \\dfrac{x + 6}{5} = 6$. Give your answer as an exact value.",
        answer: numAnswer(10.25, { acceptForms: ["decimal", "fraction", "mixed"] }),
        scheme: [
          M("M1", 1, "their single fraction set equal to 6 and the denominator cleared: 8x + 8 = 90", { ft: true }),
          A("A1", 1, "x = 10.25, or 41/4, or 10¼", { ft: true, dependsOn: ["M1"] }),
        ],
        hints: ["Use your answer to part (a): one fraction equal to 6.", "Multiply both sides by 15, so the 6 becomes 90.", "$8x = 82$; leave the answer exact rather than rounding."],
        workedSolution: "From (a), $\\dfrac{8x + 8}{15} = 6$, so $8x + 8 = 90$, $8x = 82$ and $x = \\dfrac{41}{4} = 10.25$.\nCheck: $\\dfrac{8.25}{3} + \\dfrac{16.25}{5} = 2.75 + 3.25 = 6$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.decimal-conversion-rounding",
          pattern: { kind: "numeric" },
          feedback: "The answer was rounded when an exact value was asked for. $\\dfrac{82}{8}$ is exactly 10.25, so nothing needs rounding here.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M3:Q19",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  mk(17, {
    specRefs: SOLVE, style: "exam-style", difficulty: 5, commandWords: ["Show that", "Solve"],
    setting: "A club membership split between two age groups",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-november:M3:Q23", "ccea-cer:maths:2023-summer:M3:Q19"],
    solutionProgram: "n/3 + n/5 + 8 = 48; multiply every term by 15: 5n + 3n + 120 = 720, so 8n + 120 = 720 and 8n = 600, n = 75; check 75/3 = 25 and 75/5 + 8 = 23, and 25 + 23 = 48",
    parts: [
      {
        id: "a", verb: "show-that", marks: 2,
        stem: "A hockey club has $n$ members.\n\nOne third of the members are juniors. One fifth of the members, plus 8 more people, are coaches or helpers. Together the juniors and the coaches or helpers number 48.\n\nShow that $\\dfrac{n}{3} + \\dfrac{n}{5} + 8 = 48$ and hence that $8n + 120 = 720$.",
        answer: algAnswer("8n + 120 = 720", { variables: ["n"], equivalence: "equivalent" }),
        scheme: [
          M("M1", 1, "n/3 + n/5 + 8 = 48 written from the information"),
          A("A1", 1, "every term multiplied by 15 to reach 5n + 3n + 120 = 720, then 8n + 120 = 720 shown", { dependsOn: ["M1"], examinerNote: "The printed line must be reached by a forward chain; substituting a value earns nothing." }),
        ],
        hints: ["'One third of the members' is $\\dfrac{n}{3}$.", "Multiply every term by 15, the LCM of 3 and 5.", "$15 \\times 48 = 720$ and $15 \\times 8 = 120$."],
        workedSolution: "Juniors: $\\dfrac{n}{3}$. Coaches or helpers: $\\dfrac{n}{5} + 8$. Together: $\\dfrac{n}{3} + \\dfrac{n}{5} + 8 = 48$.\nMultiply every term by 15: $5n + 3n + 120 = 720$, and $5n + 3n = 8n$, so $8n + 120 = 720$, as required.",
        commonErrors: [{
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "text", regex: "5n \\+ 3n \\+ 8 = 720" },
          feedback: "The 8 was not multiplied by 15. Every term on both sides takes the same multiplier, so the 8 becomes 120.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M3:Q23",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "solve", marks: 2,
        stem: "Solve your equation to find the number of members in the club.",
        answer: numAnswer(75),
        scheme: [
          MA("MA1", 1, "8n = 600", { ft: true }),
          A("A1", 1, "n = 75", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Subtract 120 from both sides.", "$8n = 600$.", "The answer is a number of people, so it should be a whole number."],
        workedSolution: "$8n + 120 = 720$ gives $8n = 600$, so $n = 75$ members.\nCheck: juniors $= \\dfrac{75}{3} = 25$; coaches or helpers $= \\dfrac{75}{5} + 8 = 15 + 8 = 23$; and $25 + 23 = 48$.",
        commonErrors: [{
          misconception: "maths.alg-fractions.multiply-only-part-of-side",
          pattern: { kind: "numeric" },
          feedback: "The 8 was treated as though it had already been multiplied, giving $8n = 480$. Keep the two stages separate: clear the fractions, then solve.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-november:M3:Q23",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
];
// verify the numbers used in the later questions
expect("q15 root", ev("(4*x+3)/5 - (x-2)/2", { x: 8 }), 4);
expect("q16 root", ev("(x-2)/3 + (x+6)/5", { x: 10.25 }), 6);
expect("q16 single fraction at x=2", ev("(8*x+8)/15", { x: 2 }), ev("(x-2)/3 + (x+6)/5", { x: 2 }));
expect("q17 club juniors", 75 / 3, 25);
expect("q17 club helpers", 75 / 5 + 8, 23);
expect("q17 total", 25 + 23, 48);
expect("q17 cleared", 8 * 75 + 120, 720);
assertNoFailures("t6 questions");

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T, specRefs: SOLVE,
    stem: "Sinéad was asked to solve $\\dfrac{x}{4} + 3 = 9$. Her working:",
    studentWorking: [
      "Multiply by 4",
      "x + 3 = 36",
      "x = 33",
    ],
    mistakeLine: 2,
    misconception: "maths.alg-fractions.multiply-only-part-of-side",
    whatWentWrong: "The 3 on the left was not multiplied. Multiplying every term by 4 turns $\\dfrac{x}{4}$ into $x$, the 3 into 12 and the 9 into 36.",
    correction: [
      "Multiply every term by 4",
      "x + 12 = 36",
      "x = 24",
    ],
    marksEarnedAsWritten: ["M1"],
    feedback: "Choosing to multiply by 4 is the right method and earns the method mark. The 9 on the right was multiplied correctly, which shows the idea was understood; the 3 in the middle was simply missed. November 2024 M3 Q23 reported the same pattern: one term on a side multiplied and its neighbour left alone. A habit that fixes it: write the multiplier above every term before you start, then work along the line.",
    source: "ccea-cer:maths:2024-november:M3:Q23",
  },
  {
    id: `ftm.${T}.02`,
    topic: T, specRefs: ADD,
    stem: "Ciarán was asked to write $\\dfrac{4x - 1}{3} - \\dfrac{x + 2}{4}$ as a single fraction. His working:",
    studentWorking: [
      "Common denominator 12",
      "= [4(4x − 1) − 3(x + 2)] over 12",
      "= [16x − 4 − 3x + 6] over 12",
      "= (13x + 2) over 12",
    ],
    mistakeLine: 3,
    misconception: "maths.alg-fractions.subtract-multi-term-numerator",
    whatWentWrong: "$-3(x + 2)$ is $-3x - 6$, not $-3x + 6$. The minus sign multiplies both terms of the bracket, so the $+2$ becomes $-6$.",
    correction: [
      "Common denominator 12",
      "= [4(4x − 1) − 3(x + 2)] over 12",
      "= [16x − 4 − 3x − 6] over 12",
      "= (13x − 10) over 12",
    ],
    marksEarnedAsWritten: ["M1", "A1"],
    feedback: "The common denominator and both bracketed numerators are right, so the first two marks stand. Line 3 is where it stops: the minus in front of the 3 travels into the bracket and reaches both terms. Writing $-3(x+2)$ as $-(3x + 6)$ first makes the second sign change impossible to miss. Summer 2025 M4 Q21 reported that only a small number reached full marks once more than one term had to be subtracted.",
    source: "ccea-cer:maths:2025-summer:M4:Q21",
  },
  {
    id: `ftm.${T}.03`,
    topic: T, specRefs: SOLVE,
    stem: "Niall was asked to solve $\\dfrac{x}{2} + \\dfrac{x}{3} = 10$. His working:",
    studentWorking: [
      "0.5x + 0.33x = 10",
      "0.83x = 10",
      "x = 12.048...",
      "x = 12.0",
    ],
    mistakeLine: 1,
    misconception: "maths.alg-fractions.decimal-conversion-rounding",
    whatWentWrong: "$\\dfrac{1}{3}$ is not 0.33; it is $0.333\\ldots$ . Rounding it at the very first line puts an error into everything that follows, and the exact answer is 12, not 12.048.",
    correction: [
      "Multiply every term by 6",
      "3x + 2x = 60",
      "5x = 60",
      "x = 12",
    ],
    marksEarnedAsWritten: ["M1"],
    feedback: "The structure is sound and the arithmetic is carried out correctly, so the method mark is safe, and 12.0 is close enough to look right. The accuracy marks go because the very first line was already inexact. Summer 2023 M3 Q19 put it plainly: those who multiplied through by the common denominator succeeded; those who converted to decimals lost one or two marks to rounding. Clearing the denominators is also quicker.",
    source: "ccea-cer:maths:2023-summer:M3:Q19",
  },
];
expect("ftm01 correct", ev("x/4 + 3", { x: 24 }), 9);
expect("ftm02 correct at x=2", ev("(4*x-1)/3 - (x+2)/4", { x: 2 }), ev("(13*x-10)/12", { x: 2 }));
expect("ftm03 correct", ev("x/2 + x/3", { x: 12 }), 10);
assertNoFailures("t6 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", ADD, "procedure", "The four moves for writing $\\dfrac{ax+b}{p} \\pm \\dfrac{cx+d}{q}$ as a single fraction.",
    "1 Lowest common denominator of $p$ and $q$. 2 Multiply each numerator by what its denominator was multiplied by, keeping it in a bracket. 3 Expand, changing every sign inside a subtracted bracket. 4 Collect like terms and check whether the fraction cancels.",
    ["lowest common denominator", "bracket", "every sign", "collect"], 4),
  rp(T, "02", ADD, "trap", "Why must a subtracted numerator stay in a bracket?",
    "Because the minus sign belongs to the whole numerator. Removing the bracket changes the sign of every term inside it, and forgetting the second term is the most reported loss on this topic.",
    ["whole numerator", "every sign"], 7),
  rp(T, "03", SOLVE, "procedure", "How do you start solving an equation with numerical denominators?",
    "Multiply **every** term on both sides by the lowest common denominator, and write that line down. The fractions disappear and an ordinary linear equation is left.",
    ["every term", "both sides", "LCD"], 4),
  rp(T, "04", SOLVE, "trap", "$\\dfrac{x}{5} + 2 = 7$. What do the 2 and the 7 become when you multiply by 5?",
    "10 and 35. Every term, on both sides, takes the multiplier — not only the fraction.",
    ["10", "35", "every term"], 6),
  rp(T, "05", SOLVE, "trap", "Why not turn the fractions into decimals?",
    "Because one third is $0.333\\ldots$, so decimals force a rounding at the first line and the accuracy marks go with it. Keeping the fractions exact is both safer and quicker.",
    ["recurring", "rounding", "accuracy"], 6),
  rp(T, "06", SOLVE, "trap", "$\\dfrac{2x + 1}{3} = 5$. What is the correct first line?",
    "$2x + 1 = 15$. Multiplying both sides by 3 cancels the denominator; multiplying the numerator by 3 as well would be doing it twice.",
    ["2x + 1 = 15", "cancels"], 6),
  rp(T, "07", ADD, "formula", "$\\dfrac{a}{p} + \\dfrac{b}{q} = $ ?",
    "$\\dfrac{aq + bp}{pq}$ — and if $p$ and $q$ share a factor, the lowest common denominator is smaller than $pq$ and keeps the numbers down.",
    ["aq + bp", "pq", "lowest"], 4),
  rp(T, "08", SOLVE, "procedure", "How do you check a solution to a fractional equation?",
    "Substitute it back into the original equation and evaluate both sides. It takes ten seconds and catches sign slips that re-reading will not.",
    ["substitute", "both sides"], 3),
  rp(T, "09", SOLVE, "trap", "'A number is increased by 5 and the result halved.' Write that in symbols.",
    "$\\dfrac{n + 5}{2}$, with the whole of $n + 5$ over the 2. $\\dfrac{n}{2} + 5$ is a different instruction.",
    ["whole numerator", "(n + 5)/2"], 7),
  rp(T, "10", REF, "trap", "Which fractional equations are NOT part of this topic?",
    "Any with the unknown in a denominator, such as $\\dfrac{2}{x+1}$: those are M4, and they clear to a quadratic. Here the denominators are always numbers and the equation stays linear.",
    ["unknown in the denominator", "M4", "linear"], 6),
  rp(T, "11", ADD, "novel-example", "Write $\\dfrac{2x + 7}{5} + \\dfrac{x - 3}{2}$ as a single fraction.",
    "$\\dfrac{2(2x+7) + 5(x-3)}{10} = \\dfrac{4x + 14 + 5x - 15}{10} = \\dfrac{9x - 1}{10}$.",
    ["(9x − 1)/10"], 6),
];

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed: (3x+1)/4 + (2x−5)/6 = (13x−7)/12; (5x−2)/3 − (x+4)/5 = (22x−22)/15; (x+4)/2 + (x−1)/3 = 5 has root x = 4 (8/2 + 3/3 = 5); x/4 + x/6 = 75 has root 180 (45 + 30 = 75); a quarter is 3 twelfths and a sixth is 2 twelfths.",
    examiner: "Every examiner callout comes from packs/maths/insights/m3.algebraic-fractions-with-numerical-denominators.json: Summer 2023 M3 Q19, Summer 2025 M3 Q12, November 2024 M3 Q23 and M4 Q9, Summer 2025 M4 Q3, November 2025 M4 Q14.",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, { ...base, numeric: C.a + "; twin " + C.c, examiner: "Built on Summer 2025 M3 Q12, where over half the candidates could not start an addition of algebraic fractions." }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, { ...base, numeric: C.b + "; twin " + C.g, examiner: "Built on Summer 2025 M4 Q21, where subtracting more than one term in a numerator was the reported obstacle." }),
  ver(`ver.we.${T}.03`, `we.${T}.03`, { ...base, numeric: "(x+4)/2 + (x−1)/3 = 5: ×6 gives 3(x+4) + 2(x−1) = 30, so 5x + 10 = 30 and x = 4; substituting back gives 4 + 1 = 5. Twin: (x+5)/2 + (x−1)/3 = 8 gives 5x + 13 = 48, x = 7, and 6 + 2 = 8.", examiner: "Built on November 2024 M3 Q23 and Summer 2025 M4 Q3, both about terms left unmultiplied." }),
  ver(`ver.we.${T}.04`, `we.${T}.04`, { ...base, numeric: "x/4 + x/6 = 75: ×12 gives 3x + 2x = 900, so x = 180; check 45 + 30 = 75. Twin: (n+5)/2 + (n−1)/3 = 8 gives 5n + 13 = 48 and n = 7; check 6 + 2 = 8.", examiner: "Covers the 'set up and solve' half of M3-NA-10 and the multiply-every-term finding from November 2024 M3 Q23." }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "LCD(3,4) = 12; (x+3)/4 = 3(x+3)/12; 5x − (x+2) = 4x − 2; x/5 + 2 = 7 clears to x + 10 = 35; (2x+1)/3 = 5 clears to 2x + 1 = 15; 1/3 = 0.333… so 0.33 is inexact; 3(x−2)/4 = 6 clears to 3(x−2) = 24.",
    examiner: "Distractors are the registry misconceptions named on the insight card: cannot-start-common-denominator, multiply-only-part-of-side, subtract-multi-term-numerator, decimal-conversion-rounding, bracket-expansion-sign.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the errors those findings describe.",
  })),
  ...findTheMistake.map((f) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: "Corrected lines recomputed: x/4 + 3 = 9 gives x = 24 (6 + 3 = 9); (4x−1)/3 − (x+2)/4 = (13x−10)/12, checked at x = 2, −3 and 0.5; x/2 + x/3 = 10 gives x = 12 (6 + 4 = 10), against the decimal route's 12.048.",
    examiner: f.source + " — the wrong line reproduces the reported error.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Prompt answers recomputed: (2x+7)/5 + (x−3)/2 = (9x−1)/10, checked at x = 2, −3 and 0.5; x/5 + 2 = 7 clears to x + 10 = 35.",
    examiner: "Prompts cover the four moves, the bracketed subtraction, multiplying every term, the decimal trap and the M4 boundary.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "Denominators containing the unknown, such as 2/(x + 1) — those are M4-NA-03 and M4-NA-04",
  "Any equation that clears to a quadratic: at M3 the equation stays linear",
  "Simplifying a fraction by factorising and cancelling is statement M3-NA-09, the next topic",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Algebraic fractions with numerical denominators: simplifying and solving equations",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: [
      "maths.m1.adding-and-subtracting-fractions",
      "maths.m2.linear-equations-unknown-on-both-sides-and-fractions",
      "maths.m2.expanding-and-factorising-with-a-single-term",
    ],
    order: 100,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: insight.findings.map((f) => f.source),
    examWeightHint:
      "Two items most series. An 'add these two algebraic fractions' of 2-3 marks mid-paper (Summer 2025 M3 Q12, where only a third succeeded and over half could not start), and a fractional equation of 3-4 marks late on (Summer 2023 M3 Q19 at about 10% full marks, November 2025 M3 Q29, Summer 2026 M3 Q27). M4 re-uses the same skill as an opener (Summer 2025 Q3, November 2024 Q9).",
    mustMemorise: [
      "Lowest common denominator of the numbers, then multiply each numerator by what its denominator was multiplied by",
      "A subtracted numerator stays in brackets; when the bracket goes, every sign inside it changes",
      "To solve, multiply EVERY term on BOTH sides by the LCD — constants included",
      "Never convert to decimals: one third is not 0.33",
      "Substitute the answer back into the original equation as a check",
    ],
    onFormulaSheet: [],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["algebraic fractions", "numerical denominators", "common denominator", "single fraction", "fractional equations", "clear the denominators", "LCM of denominators"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Algebraic fractions with numerical denominators",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [],
      mustKnow: [
        "a/p ± b/q = (aq ± bp)/pq, with the LCD used where it is smaller",
        "Minus a bracket changes every sign inside it",
        "To clear denominators, multiply every term on both sides by the LCD",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Find the lowest common denominator of two numerical denominators and rewrite both fractions over it",
        "Add or subtract two algebraic fractions and give a single fraction in its simplest form",
        "Keep a subtracted numerator in brackets and change every sign when the bracket is removed",
        "Handle a multiplier outside a fraction, such as 2(x + 1)/3",
        "Solve an equation by multiplying every term on both sides by the lowest common denominator",
        "Solve an equation with the unknown on both sides and a fraction on each side",
        "Set up such an equation from words or from a context, and say what the answer means",
        "Keep every line exact rather than converting to decimals",
        "Check a solution by substituting it back into the original equation",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks), and again with no calculator in M7 Paper 1. Two items are usual: an addition or subtraction of two algebraic fractions worth 2-3 marks in the middle of the paper, and a fractional equation worth 3-4 marks near the end. Schemes give M1 for the common denominator or for multiplying every term by the LCD, A1 for the correctly bracketed numerators or the cleared line, then MA1 per expansion or collection line and a final accuracy mark for the value of the unknown.",
      traps: [
        "Not knowing where to start: over half the candidates in Summer 2025 M3 Q12 could not begin the addition",
        "Adding numerators and denominators separately, so 2/3 + 1/4 becomes 3/7",
        "Multiplying only part of a side — the 4 multiplied but the −2x beside it left alone (November 2024 M3 Q23)",
        "Multiplying the numerator by the denominator as well as cancelling it, an incorrect first line with no follow-through (Summer 2025 M4 Q3)",
        "Subtracting only the first term of a bracketed numerator (Summer 2025 M4 Q21)",
        "Converting to decimals and rounding, which cost one or two marks in Summer 2023 M3 Q19 and again in Summer 2023 M4 Q8",
        "Expanding a bracket after clearing the fraction and losing a sign (November 2025 M4 Q14)",
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
      title: "Common denominator first",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0002`, `rp.${T}.03`, `q.${T}.0006`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Single fractions, equations and setting up",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0004`, `ftm.${T}.02`, `q.${T}.0008`, `ftm.${T}.03`, `q.${T}.0012`, `q.${T}.0015`, `q.${T}.0017`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Algebraic fractions with numerical denominators" },
  {
    type: "callout", kind: "spec", title: "The two statements",
    md: "**M3-NA-08** — add or subtract algebraic fractions, for example simplify $\\dfrac{4x+3}{10} + \\dfrac{6x-5}{5}$.\n**M3-NA-10** — set up and solve linear equations of the form $\\dfrac{4x+3}{10} + \\dfrac{6x-5}{5} = \\dfrac{13}{2}$.",
    source: "CCEA GCSE Mathematics specification, statements M3-NA-08 and M3-NA-10",
  },
  {
    type: "p",
    md: "Nothing here is new. It is the fraction arithmetic you have done since Year 7, with an $x$ somewhere in the numerator. And yet in Summer 2025 only a third of candidates added two of these correctly, and over half did not know where to begin. The reason is almost always the same: the first line was never written. Two rules carry the whole topic — **common denominator** when you are simplifying, **multiply every term** when you are solving.",
  },
  { type: "h", text: "Adding: the common denominator" },
  {
    type: "p",
    md: "A quarter and a sixth are not fifths or tenths. Cut both into twelfths and they can be counted together:",
  },
  noteFigure(stripBody, stripAlt, 700, 310,
    "A quarter is 3 twelfths and a sixth is 2 twelfths", "fraction-strips-twelfths"),
  {
    type: "p",
    md: "The same is true with algebra in the numerator. For $\\dfrac{3x+1}{4} + \\dfrac{2x-5}{6}$:\n1 Lowest common denominator of 4 and 6 is **12** (not 24 — the LCM keeps the numbers small).\n2 $12 \\div 4 = 3$, so the first numerator is multiplied by 3; $12 \\div 6 = 2$, so the second by 2:\n$\\dfrac{3(3x+1) + 2(2x-5)}{12}$\n3 Expand: $\\dfrac{9x + 3 + 4x - 10}{12}$\n4 Collect: $\\dfrac{13x - 7}{12}$\nThe whole numerator is multiplied, not just the $x$ term. That is where the first mark goes.",
  },
  {
    type: "gate", id: "g1", kind: "blank",
    prompt: "$\\dfrac{x + 3}{4} = \\dfrac{?}{12}$ — what goes in place of the question mark?",
    answer: "3(x + 3)",
    explain: "The denominator was tripled, so the numerator is tripled too — all of it, which is why it stays in a bracket.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M3 Q12",
    md: "A third of candidates found the common denominator and added correctly. Over half did not know where to begin. Writing the common denominator on the page, before anything else, is the move that turns a blank into two marks.",
    source: "ccea-cer:maths:2025-summer:M3:Q12",
  },
  { type: "h", text: "Subtracting: the bracket that saves the marks" },
  {
    type: "p",
    md: "When the second numerator has more than one term and is being subtracted, the minus belongs to **all** of it. Write $\\dfrac{5x-2}{3} - \\dfrac{x+4}{5}$ as\n$\\dfrac{5(5x-2) - 3(x+4)}{15}$\nExpand inside the bracket on one line: $25x - 10 - (3x + 12)$.\nRemove it on the next, changing **every** sign: $25x - 10 - 3x - 12 = 22x - 22$.\nSo the answer is $\\dfrac{22x - 22}{15}$, which may also be written $\\dfrac{22(x-1)}{15}$.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q21",
    md: "Once more than one term had to be subtracted from a numerator, only a small number reached full marks. Showing the expansion inside its bracket, then a separate line with the signs changed, is what the full-mark answers did.",
    source: "ccea-cer:maths:2025-summer:M4:Q21",
  },
  {
    type: "gate", id: "g2", kind: "choice",
    prompt: "$\\dfrac{5x}{6} - \\dfrac{x+2}{6} = $ ?",
    options: ["$\\dfrac{4x-2}{6}$", "$\\dfrac{4x+2}{6}$", "$\\dfrac{6x+2}{6}$"],
    answer: "$\\dfrac{4x-2}{6}$",
    explain: "$5x - (x + 2) = 5x - x - 2$. The $+2$ becomes $-2$.",
  },
  { type: "h", text: "Solving: multiply EVERY term" },
  {
    type: "p",
    md: "An equation is different from an expression. You are allowed to destroy the fractions completely, because whatever you do to one side you do to the other. Multiply every term by the lowest common denominator and they vanish.",
  },
  noteFigure(arrowsBody, arrowsAlt, 680, 320,
    "Every term is multiplied, including the constant on the right", "clear-denominators-arrows"),
  {
    type: "p",
    md: "$\\dfrac{x+4}{2} + \\dfrac{x-1}{3} = 5$\n1 Multiply every term by 6: $3(x+4) + 2(x-1) = 30$. The 5 became 30 — **that is the mark most often lost.**\n2 Expand: $3x + 12 + 2x - 2 = 30$\n3 Collect: $5x + 10 = 30$\n4 Solve: $5x = 20$, so $x = 4$\n5 Check: $\\dfrac{8}{2} + \\dfrac{3}{3} = 4 + 1 = 5$. Ten seconds, and it confirms every sign.",
  },
  {
    type: "callout", kind: "examiner", title: "November 2024 M3 Q23 and Summer 2025 M4 Q3",
    md: "In 2024 a common error was multiplying the 4 by 3 but not the $-2x$ beside it; many blanks suggested cross-multiplying was unfamiliar. In 2025 some multiplied the numerator by 3 as well as cancelling the denominator — an incorrect first line, with no follow-through available afterwards.",
    source: "ccea-cer:maths:2024-november:M3:Q23",
  },
  {
    type: "gate", id: "g3", kind: "number",
    prompt: "$\\dfrac{x}{5} + 2 = 7$. Multiply every term by 5. What does the 2 become?",
    answer: "10",
    explain: "And the 7 becomes 35, so $x + 10 = 35$ and $x = 25$.",
  },
  {
    type: "gate", id: "g4", kind: "choice",
    prompt: "$\\dfrac{2x+1}{3} = 5$. The correct first line is",
    options: ["$2x + 1 = 15$", "$3(2x + 1) = 5$", "$2x + 1 = \\dfrac{5}{3}$"],
    answer: "$2x + 1 = 15$",
    explain: "Multiplying both sides by 3 cancels the denominator on the left and turns the 5 into 15.",
  },
  { type: "h", text: "Never go to decimals" },
  {
    type: "p",
    md: "$\\dfrac{x}{2} + \\dfrac{x}{3} = 10$ tempts you into $0.5x + 0.33x = 10$. But $\\dfrac{1}{3}$ is $0.333\\ldots$, so that line is already wrong, and it gives $x = 12.048\\ldots$ instead of the exact 12.\nMultiplying every term by 6 gives $3x + 2x = 60$, so $5x = 60$ and $x = 12$. Exact, and faster.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2023 M3 Q19",
    md: "About a tenth got full marks. Those who multiplied through by 12, or used a common denominator of 12, succeeded; those who converted to decimals lost one or two marks through rounding. The same point was made again about M4 Q8 that series.",
    source: "ccea-cer:maths:2023-summer:M3:Q19",
  },
  {
    type: "gate", id: "g5", kind: "number",
    prompt: "$\\dfrac{x}{2} + \\dfrac{x}{3} = 10$. Multiplying every term by 6 gives $5x = ?$",
    answer: "60",
    explain: "$3x + 2x = 60$, so $x = 12$ exactly.",
  },
  { type: "h", text: "Setting one up" },
  {
    type: "p",
    md: "M3-NA-10 says 'set up **and** solve', so the equation itself carries a mark. Read each phrase and translate it whole:\n'A number increased by 5, then halved' is $\\dfrac{n+5}{2}$ — the whole of $n + 5$ sits over the 2. $\\dfrac{n}{2} + 5$ is a different instruction.\n'A quarter of the full amount' is $\\dfrac{x}{4}$.\nA water butt holds $x$ litres; a quarter is used, then a sixth, and 75 litres go altogether:\n$\\dfrac{x}{4} + \\dfrac{x}{6} = 75 \\Rightarrow 3x + 2x = 900 \\Rightarrow x = 180$ litres.\nCheck against the words, not just the algebra: $45 + 30 = 75$.",
  },
  {
    type: "gate", id: "g6", kind: "choice",
    prompt: "'A number is increased by 5 and the result halved.' In symbols that is",
    options: ["$\\dfrac{n+5}{2}$", "$\\dfrac{n}{2} + 5$", "$\\dfrac{n}{2+5}$"],
    answer: "$\\dfrac{n+5}{2}$",
    explain: "The addition happens first, so all of $n + 5$ goes over the 2.",
  },
  {
    type: "gate", id: "g7", kind: "number",
    prompt: "$\\dfrac{x}{4} + \\dfrac{x}{6} = 75$. Multiplying every term by 12 gives $5x = ?$",
    answer: "900",
    explain: "$3x + 2x = 900$, so $x = 180$.",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** $\\dfrac{a}{p} \\pm \\dfrac{b}{q} = \\dfrac{aq \\pm bp}{pq}$, with the LCD used where it is smaller; minus a bracket changes every sign inside it; to clear denominators, multiply every term on both sides by the LCD.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "The denominators here are **numbers**. A denominator containing the unknown, such as $\\dfrac{2}{x+1}$, is M4-NA-03 and M4-NA-04 — and those equations clear to a quadratic. At M3 the equation always stays linear. Simplifying a fraction by factorising and cancelling is the next statement, M3-NA-09.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "Expect two items: an addition or subtraction worth 2-3 marks in the middle of M3, and an equation worth 3-4 marks near the end. The same skills open M4 and reappear with no calculator in M7 Paper 1.\nThe **first** mark is always the same thing written down — the common denominator when you are simplifying, or the multiplied-out line when you are solving. Write it even if you can see the answer.\nThe **last** mark is the value of the unknown, exact, or the single fraction fully collected.\nIf you are stuck, write the LCD and the line with every numerator bracketed. That alone is usually a mark, and it very often unlocks the rest.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.02` },
  { type: "prompt", promptId: `rp.${T}.03` },
  { type: "prompt", promptId: `rp.${T}.05` },
  { type: "prompt", promptId: `rp.${T}.09` },
];

assertNoFailures("t6 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
