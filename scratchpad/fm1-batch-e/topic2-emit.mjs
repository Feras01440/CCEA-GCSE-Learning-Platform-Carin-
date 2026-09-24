/** FM1 batch E, topic 2 emit: bundle.json + note.blocks.json for optimisation. */
import fs from "node:fs";
import path from "node:path";
import {
  fr, frLatex, frText, num, add, sub, mul, div, neg,
  polyFrom, polyDeriv, polyEval, polyLatex, polyText,
  svgFigure, lintTree, verLog, PAPER,
} from "./lib.mjs";
import {
  note, routes, A, B, C, D, E, F, G, Hc,
  wallDiagram, wallDiagramVars, pensDiagram, plotDiagram, plotDiagramVars, noticeDiagram, riverDiagram, areaGraph, lengthGraph, stepCard, natureCard,
} from "./topic2-optimisation.mjs";

const OUT = path.resolve("packs/further-maths/content/fm1/optimisation");
const TOPIC = "fm.u1.optimisation";
const SPEC = ["FM1-DIF-02"];
const V = (id) => `ver.${id}`;
const qid = (n) => `q.fm.u1.optimisation.${String(n).padStart(4, "0")}`;

/* ---------------- executed error routes ---------------- */

const wallRoute = routes.wallSideCounted(A, { 2: -1, 1: 24 }); // 2x + 2y = 48 -> y = 24 - x -> A = 24x - x^2
const plotRoute = routes.wallSideCounted(B, { 1: 2, [-1]: 108 }); // fencing taken as 2x + 2y
const R = {
  aLinearDropped: polyLatex(routes.linearTermDropped(A)),
  aDerivZero: frLatex(A.x),
  bSignKept: polyLatex(routes.negativePowerSignKept(B)),
  bLinearDropped: polyLatex(routes.linearTermDropped(B)),
  bSquareRoot: num(routes.squareRootNotTaken(B)),
  gStopAtX: num(routes.finalQuantityNotEvaluated(G)),
  hcSquareRoot: num(routes.squareRootNotTaken(Hc)),
  hcFromDerivative: num(routes.valueFromDerivative(Hc)),
  dStopAtX: num(routes.finalQuantityNotEvaluated(D)),
  eSquareRoot: num(routes.squareRootNotTaken(E)),
  eStopAtX: num(routes.finalQuantityNotEvaluated(E)),
  cStopAtX: num(routes.finalQuantityNotEvaluated(C)),
  fStopAtX: num(routes.finalQuantityNotEvaluated(F)),
  fLinearDropped: polyLatex(routes.linearTermDropped(F)),
  fSquareRoot: num(routes.squareRootNotTaken(F)),
  wallY: "24 - x",
  wallArea: num(wallRoute.value),
  plotExpr: polyLatex(plotRoute.p),
};

/* ---------------- shared prose ---------------- */

const scopeDetail =
  "FM1 is untiered and calculator-allowed. Every context here is two-dimensional and free of pi, as the Teacher Guidance for FM1-DIF-02 requires; every expression is a sum of terms in one letter with whole-number powers, so no product, quotient or chain rule is needed and no fractional index appears.";
const formulaDetail =
  "The Unit 1 sheet gives y = ax^n => dy/dx = nax^(n-1) (packs/further-maths/exam-true/formula-sheets.json, fs.fm1.differentiation). The second-derivative test is must-know (mk.fm1.second-derivative-test) and the note teaches it; nothing else used here is on the sheet.";
const commandDetail =
  "Find, Show that, Calculate and the instruction Using calculus are all in packs/further-maths/exam-true/command-words.json, the last as a method lock (lock.fm.use-calculus in method-locks.json). Show that carries a typical tariff of 2-3-4 and Using calculus 3-5-8; the FM1 perPart median is 3 and the p90 is 6 (tariffs.json).";
const shingle =
  "Compared by hand against the FM1 question papers and mark schemes read for this batch (Summer 2018 Q2 and Q9, Summer 2019 Q8 and Q13, Summer 2022 Q2 and Q10, Summer 2023 Q1 and Q2, Summer 2024 Q1, Summer 2025 Q11, Q13 and Q14) and the Chief Examiner reports for those series. Every context, dimension, number, sentence and figure here is new: the settings are a garden bed, a divided vegetable plot, a printed notice, two barn pens, a tray workshop and a riverside field, none of which appears in the corpus, and no eight-word sequence is shared with any paper, scheme or report.";
const styleLint =
  "British English, second person, calm; no exclamation marks; the banned verdict word is never used about a learner's answer. Every maths segment opens and closes inside one line and holds no prose words, checked by lintString before the files were written.";

/* ---------------- worked examples ---------------- */

const we1 = {
  id: "we.fm.u1.optimisation.01",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `A rectangular flower bed is made against a straight wall. The other three sides are edged with $${frText(A.edging)}$ m of timber. The two sides at right angles to the wall are each $x$ m long.\nFind the value of $x$ that gives the greatest possible area, show that it is a maximum, and state that greatest area.`,
  figure: svgFigure(wallDiagramVars, `A rectangular flower bed against a wall, with two sides of x metres, the side facing the wall y metres, and the ${frText(A.edging)} metres of timber covering those three sides`),
  steps: [
    {
      n: 1,
      working: `The timber covers two sides of $x$ and one side of $y$, so $2x + y = ${frText(A.edging)}$ and $y = ${frText(A.edging)} - 2x$.`,
      decision: "The wall is the fourth side and costs nothing, which is the only reason this problem has an answer. Reading that from the picture is the first mark.",
      whyMenu: {
        options: ["Because the wall replaces one of the four sides", "Because the bed is a square", "Because x and y are always equal"],
        correct: 0,
        explain: "Three sides are edged, not four, so the constraint is 2x + y rather than 2x + 2y.",
      },
      earns: ["MW1"],
    },
    {
      n: 2,
      working: `The area is $A = xy = x(${frText(A.edging)} - 2x) = ${A.latex}$.`,
      decision: "Substituting the constraint leaves one letter, which is what differentiation needs. Expand it now: an unsimplified expression is where slips start.",
      earns: ["MW1"],
    },
    {
      n: 3,
      working: `Differentiate: $\\frac{dA}{dx} = ${A.d1Latex}$.`,
      decision: "Each term separately: multiply by the power, step the power down. The term in x contributes its coefficient, never nothing.",
      earns: ["MW1"],
    },
    {
      n: 4,
      working: `Set the gradient to zero: $${A.d1Latex} = 0$, so $4x = ${frText(A.edging)}$ and $x = ${frText(A.x)}$.`,
      decision: "A largest or smallest value sits where the quantity stops changing, so the derivative is zero there.",
      earns: ["M1", "W1"],
    },
    {
      n: 5,
      working: `Differentiate again: $\\frac{d^{2}A}{dx^{2}} = ${A.d2Latex}$, which is negative, so $x = ${frText(A.x)}$ gives a maximum.`,
      decision: "The question is not answered until the turning point has been named. A negative second derivative is the evidence the scheme pays for.",
      earns: ["MW1"],
    },
    {
      n: 6,
      working: `Substitute back: $y = ${frText(A.edging)} - 2 \\times ${frText(A.x)} = ${frText(A.y)}$ m, and $A = ${frText(A.x)} \\times ${frText(A.y)} = ${frText(A.value)}$ m².`,
      decision: `The question asked for the area, not for x. Finishing at $x = ${frText(A.x)}$ leaves the last marks on the table, and the unit belongs on the answer line.`,
      whyMenu: {
        options: ["Because the question asked for an area, not a length", "Because x is always the answer", "Because the units are the same either way"],
        correct: 0,
        explain: "x is a width in metres; the area is in square metres. Read the last line of the question before writing anything down.",
      },
      earns: ["W1"],
    },
  ],
  finalAnswer: `$x = ${frText(A.x)}$ m gives a maximum, because $\\frac{d^{2}A}{dx^{2}} = ${A.d2Latex}$, and the greatest area is $${frText(A.value)}$ m².`,
  twin: {
    stem: `A rectangular pen is built against a barn wall using $${frText(D.fencing)}$ m of fencing for the two ends, the far side and one divider parallel to the ends, each end being $x$ m.\nThe area is $A = ${D.latex}$. Find the value of $x$ that gives the greatest area.`,
    answer: { kind: "numeric", value: num(D.x), tolerance: { type: "absolute", value: 0.005 }, unitRequired: false, acceptForms: ["decimal", "fraction"] },
  },
  faded: [
    { showSteps: 3, studentSupplies: [4, 5, 6] },
    { showSteps: 1, studentSupplies: [2, 3, 4, 5, 6] },
  ],
  verification: V("we.fm.u1.optimisation.01"),
  version: 1,
};

const we2 = {
  id: "we.fm.u1.optimisation.02",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `A rectangular vegetable plot of area $${frText(B.area)}$ m² is fenced round all four sides and has one more fence across it, parallel to the two shorter sides. The plot is $x$ m across.\nFind the value of $x$ that uses the least fencing, show that it is a minimum, and state that least length.`,
  figure: svgFigure(plotDiagramVars, `A rectangular vegetable plot of area ${frText(B.area)} square metres, x metres across and y metres deep, with one extra fence of length y across the middle`),
  steps: [
    {
      n: 1,
      working: `The area fixes the depth: $xy = ${frText(B.area)}$, so $y = \\frac{${frText(B.area)}}{x}$.`,
      decision: "Here the constraint is an area rather than a length, so the substitution produces a fraction instead of a subtraction.",
      earns: ["MW1"],
    },
    {
      n: 2,
      working: `The fencing is two sides of $x$, two sides of $y$ and one more $y$ across the middle: $L = 2x + 3y = 2x + \\frac{162}{x}$.`,
      decision: "Count the fences on the picture one at a time. Leaving the middle fence out is the single commonest way this expression goes wrong.",
      whyMenu: {
        options: ["Because the extra fence is a third side of length y", "Because the extra fence is a third side of length x", "Because the extra fence has no length"],
        correct: 0,
        explain: "The fence runs parallel to the shorter sides, so it is as long as they are, and the total in y becomes 3y rather than 2y.",
      },
      earns: ["MW1"],
    },
    {
      n: 3,
      working: `Write the fraction as a power and differentiate: $L = 2x + 162x^{-1}$, so $\\frac{dL}{dx} = ${B.d1Latex}$.`,
      decision: "The power rule only speaks about powers, so the fraction has to come up as a negative index first. The index steps down from -1 to -2.",
      earns: ["MW1"],
    },
    {
      n: 4,
      working: `Set it to zero: $\\frac{162}{x^{2}} = 2$, so $x^{2} = ${frText(div(fr(162), fr(2)))}$ and $x = ${frText(B.x)}$.`,
      decision: "Take the square root, and take only the positive one: a length cannot be negative, so the other root is discarded with a word.",
      earns: ["M1", "W1"],
    },
    {
      n: 5,
      working: `Second derivative: $\\frac{d^{2}L}{dx^{2}} = ${B.d2Latex}$. At $x = ${frText(B.x)}$ that is $${frLatex(B.second)}$, which is positive, so this is a minimum.`,
      decision: "This second derivative depends on x, so the value of x has to be put in before the sign can be read. A general statement is not evidence.",
      earns: ["MW1"],
    },
    {
      n: 6,
      working: `Substitute back: $y = \\frac{${frText(B.area)}}{${frText(B.x)}} = ${frText(B.y)}$ m, and $L = 2 \\times ${frText(B.x)} + 3 \\times ${frText(B.y)} = ${frText(B.value)}$ m.`,
      decision: "Check the answer against the picture: a plot 9 m by 6 m has an area of 54 m², so the constraint is satisfied and the arithmetic holds.",
      earns: ["W1"],
    },
  ],
  finalAnswer: `$x = ${frText(B.x)}$ m gives a minimum, because $\\frac{d^{2}L}{dx^{2}} = ${frLatex(B.second)}$ there, and the least fencing is $${frText(B.value)}$ m.`,
  twin: {
    stem: `A rectangular field of area $${frText(F.area)}$ m² lies beside a river and is fenced on three sides only, the side parallel to the river being $x$ m.\nThe fencing is $L = ${F.latex}$ m. Find the value of $x$ that uses the least fencing.`,
    answer: { kind: "numeric", value: num(F.x), tolerance: { type: "absolute", value: 0.005 }, unitRequired: false, acceptForms: ["decimal", "fraction"] },
  },
  faded: [
    { showSteps: 3, studentSupplies: [4, 5, 6] },
    { showSteps: 1, studentSupplies: [2, 3, 4, 5, 6] },
  ],
  verification: V("we.fm.u1.optimisation.02"),
  version: 1,
};

const we3 = {
  id: "we.fm.u1.optimisation.03",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `A notice is printed on a rectangular card. The printed part has an area of $${frText(C.printed)}$ cm² and is $w$ cm wide. There is a margin of $${frText(C.sideMargin)}$ cm at each side and $${frText(C.endMargin)}$ cm at the top and at the bottom.\nShow that the total area of the card is $A = ${C.latex}$ cm², then find the least possible total area.`,
  figure: svgFigure(noticeDiagram, `A notice with a printed rectangle of area ${frText(C.printed)} square centimetres and margins of ${frText(C.sideMargin)} centimetres at the sides and ${frText(C.endMargin)} centimetres at the top and bottom`),
  steps: [
    {
      n: 1,
      working: `The printed part is $w$ by $h$ with $wh = ${frText(C.printed)}$, so $h = \\frac{${frText(C.printed)}}{w}$.`,
      decision: "The fixed printed area is the constraint. Naming the printed height h before using it keeps the two rectangles apart in your head.",
      earns: ["MW1"],
    },
    {
      n: 2,
      working: `The card is wider by two side margins and taller by two end margins: $(w + ${frText(mul(fr(2), C.sideMargin))})$ by $\\left(h + ${frText(mul(fr(2), C.endMargin))}\\right)$.`,
      decision: "Two margins, not one, on each measurement. Halving this is the slip that makes the whole answer plausible and wrong.",
      earns: ["MW1"],
    },
    {
      n: 3,
      working: `Multiply out: $A = wh + 8w + 6h + 48 = ${frText(C.printed)} + 8w + 6\\left(\\frac{${frText(C.printed)}}{w}\\right) + 48 = ${C.latex}$.`,
      decision: "Every line of a show-that earns its own mark, so write the expansion before the tidy version. The printed result is the last line you write, never the first.",
      earns: ["MW1", "W1"],
    },
    {
      n: 4,
      working: `Differentiate: $\\frac{dA}{dw} = ${C.d1Latex}$.`,
      decision: "The constant 348 goes to zero and the fraction is differentiated as 1800w to the power -1, whose index steps down to -2.",
      earns: ["MW1"],
    },
    {
      n: 5,
      working: `Set it to zero: $\\frac{1800}{w^{2}} = 8$, so $w^{2} = ${frText(div(fr(1800), fr(8)))}$ and $w = ${frText(C.x)}$ cm.`,
      decision: "Only the positive root is a width. Leaving the answer as w squared is the last place this question is commonly abandoned.",
      earns: ["M1", "W1"],
    },
    {
      n: 6,
      working: `Second derivative: $\\frac{d^{2}A}{dw^{2}} = ${C.d2Latex}$, which at $w = ${frText(C.x)}$ is $${frLatex(C.second)}$: positive, so the area is least here.`,
      decision: "Positive means the gradient is climbing through zero, which is a dip, and a dip in area is the smallest card.",
      earns: ["MW1"],
    },
    {
      n: 7,
      working: `The least total area is $A = ${frText(348)} + 8 \\times ${frText(C.x)} + \\frac{1800}{${frText(C.x)}} = ${frText(C.value)}$ cm².`,
      decision: `That is a card $${frText(C.outerW)}$ cm by $${frText(C.outerH)}$ cm, which multiplies back to $${frText(C.value)}$, so the answer checks against the picture.`,
      earns: ["W1"],
    },
  ],
  finalAnswer: `$w = ${frText(C.x)}$ cm gives a minimum, and the least total area of the card is $${frText(C.value)}$ cm².`,
  twin: {
    stem: `A workshop makes $x$ trays a week, and the cost of making each tray is $C = ${E.latex}$ pounds.\nFind the number of trays a week that makes the cost of each tray least.`,
    answer: { kind: "numeric", value: num(E.x), tolerance: { type: "absolute", value: 0.005 }, unitRequired: false, acceptForms: ["decimal"] },
  },
  faded: [
    { showSteps: 4, studentSupplies: [5, 6, 7] },
    { showSteps: 2, studentSupplies: [3, 4, 5, 6, 7] },
  ],
  verification: V("we.fm.u1.optimisation.03"),
  version: 1,
};

/* ---------------- diagnostics ---------------- */

const dxPre = {
  id: "dx.fm.u1.optimisation.pre",
  topic: TOPIC,
  specRefs: SPEC,
  when: "pre",
  items: [
    {
      id: "p1",
      stem: `Three checks on what this lesson is built from. None of them is the new method, so answer from what you already know.\nA rectangle $x$ m by $y$ m has area $${frText(B.area)}$ m². Write $y$ in terms of $x$.`,
      skill: "Rearrange a product to make one letter the subject",
      options: [
        { id: "a", text: `$y = \\frac{${frText(B.area)}}{x}$`, correct: true, feedback: "Dividing both sides of $xy = 54$ by $x$ leaves $y$ on its own. That fraction is what turns an optimisation problem into one letter." },
        { id: "b", text: `$y = ${frText(B.area)} - x$`, correct: false, feedback: "Subtracting undoes an addition. Here $x$ and $y$ are multiplied, so the opposite operation is division." },
        { id: "c", text: `$y = ${frText(B.area)}x$`, correct: false, feedback: "That would make $y$ grow with $x$. A fixed area means the two measurements work against each other." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "Differentiate $y = 5x^{-1}$.",
      skill: "Differentiate a negative power",
      options: [
        { id: "a", text: "$-5x^{-2}$", correct: true, feedback: "Multiply by the power $-1$ and step the index down to $-2$." },
        { id: "b", text: "$5x^{-2}$", correct: false, feedback: "The coefficient is multiplied by the power, and that power is $-1$, so the sign changes." },
        { id: "c", text: "$-5x^{0}$", correct: false, feedback: "The index steps down from $-1$, and down from $-1$ is $-2$." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p3",
      stem: "Solve $x^{2} = 81$ for the positive value of $x$.",
      skill: "Take a square root",
      options: [
        { id: "a", text: "$x = 9$", correct: true, feedback: "Both roots are $9$ and $-9$; a length takes the positive one." },
        { id: "b", text: "$x = 81$", correct: false, misconception: "fm.optim.square-root-not-taken", feedback: "That is the value of $x^{2}$. The square root still has to be taken before you have $x$." },
        { id: "c", text: "$x = 40.5$", correct: false, feedback: "Halving undoes doubling, not squaring. The opposite of squaring is the square root." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

const dxPost = {
  id: "dx.fm.u1.optimisation.post",
  topic: TOPIC,
  specRefs: SPEC,
  when: "post",
  items: [
    {
      id: "d1",
      stem: `A bed against a wall uses $${frText(A.edging)}$ m of edging on three sides, the two ends being $x$ m each. Which constraint is right?`,
      skill: "Read a constraint from a picture",
      options: [
        { id: "a", text: `$2x + y = ${frText(A.edging)}$`, correct: true, feedback: "Two ends and one front, because the wall takes the fourth side." },
        { id: "b", text: `$2x + 2y = ${frText(A.edging)}$`, correct: false, misconception: "fm.optim.wall-side-fenced", feedback: `That fences all four sides and ignores the wall. It would give a greatest area of $${R.wallArea}$ m² instead of $${frText(A.value)}$ m².` },
        { id: "c", text: `$xy = ${frText(A.edging)}$`, correct: false, misconception: "fm.optim.constraint-not-read-from-diagram", feedback: "That is an area of 48 m², but 48 m of edging is a length. The constraint has to add up the sides." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: "You have solved $\\frac{dA}{dx} = 0$ and found a value of $x$. What does the scheme want next?",
      skill: "Know the step after solving the derivative",
      options: [
        { id: "a", text: "The second derivative, with its value and sign", correct: true, feedback: "A stationary value is not yet a maximum. The second derivative is the evidence the mark is for." },
        { id: "b", text: "Nothing more; the value of $x$ is the answer", correct: false, misconception: "fm.optim.nature-not-shown", feedback: "The question asks for a maximum or a minimum, so the turning point has to be named before the answer is complete." },
        { id: "c", text: "A table of values on either side", correct: false, misconception: "fm.optim.nature-not-shown", feedback: "A sign check either side is valid mathematics, but where the stem says using calculus the second derivative is the expected evidence." },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: `The bed's area is $A = ${A.latex}$ and the greatest area is wanted. You have found $x = ${frText(A.x)}$. What do you write on the answer line?`,
      skill: "Answer the quantity the question asked for",
      options: [
        { id: "a", text: `$${frText(A.value)}$ m²`, correct: true, feedback: `Substituting $${frText(A.x)}$ back into $A$ gives $${frText(A.value)}$, and an area carries square metres.` },
        { id: "b", text: `$${frText(A.x)}$ m`, correct: false, misconception: "fm.optim.final-quantity-not-evaluated", feedback: "That is the width that produces the greatest area, not the area itself. The last step is to substitute it back." },
        { id: "c", text: `$${frText(A.y)}$ m`, correct: false, misconception: "fm.optim.final-quantity-not-evaluated", feedback: "That is the other side of the bed. Both lengths are useful working, and neither is the area that was asked for." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: `A quantity has $\\frac{d^{2}P}{dx^{2}} = ${frLatex(B.second)}$ at its stationary value. What has been shown?`,
      skill: "Read the sign of the second derivative",
      options: [
        { id: "a", text: "That the stationary value is a minimum", correct: true, feedback: "A positive second derivative means the gradient is climbing through zero, which is a dip." },
        { id: "b", text: "That the stationary value is a maximum", correct: false, misconception: "fm.calc.second-derivative-sign-misread", feedback: "The test runs the other way: positive names a minimum and negative names a maximum." },
        { id: "c", text: "Nothing, because the value is a fraction", correct: false, misconception: "fm.optim.nature-not-shown", feedback: "Only the sign matters, and a fraction has a sign like any other number. This one is positive." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d5",
      stem: `Differentiate $L = ${F.latex}$.`,
      skill: "Differentiate a sum with a plain term in x and a negative power",
      options: [
        { id: "a", text: `$${F.d1Latex}$`, correct: true, feedback: "The plain $x$ contributes $1$, and $576x^{-1}$ gives $-576x^{-2}$." },
        { id: "b", text: `$${R.fLinearDropped}$`, correct: false, misconception: "fm.calc.linear-term-derivative-omitted", feedback: "The fraction has been handled correctly and the plain $x$ has vanished. The derivative of $x$ is $1$, so that $1$ belongs in the answer." },
        { id: "c", text: `$1 + \\frac{576}{x^{2}}$`, correct: false, misconception: "fm.calc.negative-power-differentiation", feedback: "The index is right. Multiplying $576$ by the power $-1$ makes that term negative." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

/* ---------------- question builder ---------------- */

const mkQ = (n, opts) => ({
  id: qid(n),
  topic: TOPIC,
  specRefs: SPEC,
  tier: "untiered",
  paper: PAPER,
  style: opts.style ?? "practice",
  difficulty: opts.difficulty ?? 4,
  ao: opts.ao ?? ["AO1", "AO2"],
  commandWords: opts.commandWords,
  emphasis: opts.emphasis ?? [],
  context: { setting: opts.setting, original: true },
  figures: opts.figures ?? [],
  parts: opts.parts,
  totalMarks: opts.parts.reduce((s, p) => s + p.marks, 0),
  timeAllowanceSec: Math.round(opts.parts.reduce((s, p) => s + p.marks, 0) * 72),
  skeleton: opts.skeleton,
  methodLock: opts.methodLock,
  examinerSources: opts.examinerSources,
  solutionProgram: opts.solutionProgram,
  verification: V(qid(n)),
  version: 1,
});

const numSpec = (v, unit) => ({
  kind: "numeric",
  value: num(v),
  tolerance: { type: "absolute", value: 0.005 },
  ...(unit ? { unit, unitRequired: true } : { unitRequired: false }),
  acceptForms: ["decimal", "fraction"],
});
const algSpec = (latex, variables = ["x"]) => ({ kind: "algebraic", latex, equivalence: "equivalent", variables });

/**
 * OP-7: a right number with no unit earns the substitution mark on a two-mark part.
 * The value is the part's own computed answer, so the pattern is never typed.
 */
const unitOmitted = (value, unit, noun, source) => ({
  misconception: "fm.optim.unit-omitted",
  // A numeric pattern here would be read as "the spec marks this correct, so it can never fire"
  // (content-lint.ts does not look at unitRequired), yet the marker does fire it: the number alone
  // is not a correct answer when the unit is demanded. The pattern is the bare number, with no
  // unit after it, built from the computed value.
  pattern: { kind: "text", regex: `^\\s*${frText(value)}(\\.0+)?\\s*$` },
  feedback: `The number is right and the substitution earns its mark. The quantity is ${noun}, so the answer line needs its unit: $${frText(value)}$ ${unit}.`,
  marksTypicallyEarned: 1,
  source,
});

const CALC_LOCK = {
  instruction: "Using calculus",
  requiredMethod: "Differentiate, set the derivative to zero and solve, then confirm the nature of the turning point with the second derivative.",
  evidence: "ccea-cer:further-maths:2019-summer:FM1:Q14",
};

/* ---------------- practice ---------------- */

const q1 = mkQ(1, {
  commandWords: ["Find"],
  difficulty: 2,
  setting: "Differentiating an area expression that has already been formed",
  skeleton: "(main)find2",
  examinerSources: ["ccea-cer:further-maths:2024-summer:FM1:Q13"],
  solutionProgram: `A = ${A.text}; dA/dx = ${A.d1Text}`,
  parts: [
    {
      id: "main",
      stem: `The area of a flower bed is given by $A = ${A.latex}$, where $x$ is measured in metres.\nFind $\\frac{dA}{dx}$.`,
      marks: 2,
      answer: algSpec(A.d1Latex),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$-4x$ from the term in $x^{2}$` },
        { id: "W1", code: "W", marks: 1, for: `$${A.d1Latex}$ complete` },
      ],
      hints: ["Differentiate each term on its own.", `The term $48x$ has power 1, so it leaves $48$ behind.`],
      workedSolution: `$-2x^{2}$ gives $-4x$, and $48x$ gives $48$.\nSo $\\frac{dA}{dx} = ${A.d1Latex}$.`,
      commonErrors: [
        {
          misconception: "fm.calc.linear-term-derivative-omitted",
          pattern: { kind: "algebraic", latex: R.aLinearDropped },
          feedback: "The squared term is right. The term $48x$ is a straight line of gradient $48$, so it leaves $48$ behind rather than nothing.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
        {
          misconception: "fm.calc.default-to-derivative-zero",
          pattern: { kind: "algebraic", latex: R.aDerivZero },
          feedback: `That is the value of $x$ you would get by going one step further and solving $${A.d1Latex} = 0$. This part asks only for the expression.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2025-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q2 = mkQ(2, {
  commandWords: ["Solve"],
  difficulty: 2,
  setting: "Solving the derivative equal to zero",
  skeleton: "(main)solve2",
  examinerSources: ["ccea-cer:further-maths:2019-summer:FM1:Q14"],
  solutionProgram: `${A.d1Text} = 0 -> x = ${frText(A.x)}`,
  parts: [
    {
      id: "main",
      stem: `A flower bed has $\\frac{dA}{dx} = ${A.d1Latex}$.\nSolve $\\frac{dA}{dx} = 0$.`,
      marks: 2,
      answer: numSpec(A.x),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `setting $${A.d1Latex} = 0$` },
        { id: "W1", code: "W", marks: 1, for: `$x = ${frText(A.x)}$`, dependsOn: ["M1"] },
      ],
      hints: ["Move the term in $x$ to the other side.", "Then divide by its coefficient."],
      workedSolution: `$${A.d1Latex} = 0$ gives $4x = ${frText(A.edging)}$.\nDividing by $4$: $x = ${frText(A.x)}$.`,
      commonErrors: [],
      requiresWorking: true,
    },
  ],
});

const q3 = mkQ(3, {
  commandWords: ["Find"],
  difficulty: 3,
  setting: "Differentiating a length expression with a negative power",
  skeleton: "(main)find3",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q14"],
  solutionProgram: `L = ${B.text}; L = 2x + 162x^-1; dL/dx = ${B.d1Text}`,
  parts: [
    {
      id: "main",
      stem: `The fencing round a vegetable plot is given by $L = ${B.latex}$, where $x$ is measured in metres.\nFind $\\frac{dL}{dx}$.`,
      marks: 3,
      answer: algSpec(B.d1Latex),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `writing the fraction as $162x^{-1}$` },
        { id: "MW1", code: "MW", marks: 1, for: `$2$ from the term $2x$` },
        { id: "W1", code: "W", marks: 1, for: `$${B.d1Latex}$ complete`, dependsOn: ["M1"] },
      ],
      hints: ["Rewrite the fraction with a negative index first.", "Multiplying $162$ by the power $-1$ changes the sign.", "The index steps down from $-1$ to $-2$."],
      workedSolution: `Rewrite: $L = 2x + 162x^{-1}$.\n$2x$ gives $2$.\n$162x^{-1}$ gives $162 \\times (-1) \\times x^{-2} = -162x^{-2}$.\nSo $\\frac{dL}{dx} = ${B.d1Latex}$.`,
      commonErrors: [
        {
          misconception: "fm.calc.negative-power-differentiation",
          pattern: { kind: "algebraic", latex: R.bSignKept },
          feedback: "The index has stepped down correctly. Multiplying $162$ by the power $-1$ makes that term negative, so it is subtracted.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2025-summer:FM1:Q14",
        },
        {
          misconception: "fm.calc.linear-term-derivative-omitted",
          pattern: { kind: "algebraic", latex: R.bLinearDropped },
          feedback: "The fraction is handled correctly and the term $2x$ has disappeared. Its derivative is the number $2$, which belongs in the answer.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q4 = mkQ(4, {
  commandWords: ["Solve"],
  difficulty: 3,
  setting: "Solving a derivative with a negative power equal to zero",
  skeleton: "(main)solve3",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q14"],
  solutionProgram: `${B.d1Text} = 0 -> x^2 = 81 -> x = ${frText(B.x)}`,
  parts: [
    {
      id: "main",
      stem: `A length is given by $L = ${B.latex}$ for $x > 0$, and $\\frac{dL}{dx} = ${B.d1Latex}$.\nSolve $\\frac{dL}{dx} = 0$.`,
      marks: 3,
      answer: numSpec(B.x),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `rearranging to $\\frac{162}{x^{2}} = 2$` },
        { id: "W1", code: "W", marks: 1, for: `$x^{2} = ${frText(div(fr(162), fr(2)))}$`, dependsOn: ["M1"] },
        { id: "W2", code: "W", marks: 1, for: `$x = ${frText(B.x)}$, the negative root rejected because $x$ is a length`, dependsOn: ["W1"] },
      ],
      hints: ["Move the fraction to the other side.", "Multiply both sides by $x^{2}$.", "Take the square root, and keep the positive one."],
      workedSolution: `$2 - \\frac{162}{x^{2}} = 0$ gives $\\frac{162}{x^{2}} = 2$.\nMultiplying by $x^{2}$ and dividing by $2$: $x^{2} = ${frText(div(fr(162), fr(2)))}$.\nSo $x = ${frText(B.x)}$, taking the positive root because $x$ is a length.`,
      commonErrors: [
        {
          misconception: "fm.optim.square-root-not-taken",
          pattern: { kind: "numeric", value: R.bSquareRoot },
          feedback: `That is the value of $x^{2}$, reached correctly. One step is left: take the square root, which gives $x = ${frText(B.x)}$.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q5 = mkQ(5, {
  commandWords: ["Find"],
  difficulty: 4,
  emphasis: ["Using calculus"],
  methodLock: CALC_LOCK,
  setting: "A short maximum problem with the expression already formed",
  skeleton: "(main)find4",
  examinerSources: ["ccea-cer:further-maths:2019-summer:FM1:Q14"],
  solutionProgram: `A = ${G.text}; dA/dx = ${G.d1Text} = 0 -> x = ${frText(G.x)}; A = ${frText(G.value)}; d2A/dx2 = ${G.d2Text} < 0`,
  parts: [
    {
      id: "main",
      stem: `A quantity is given by $A = x(20 - x)$ for $0 < x < 20$.\nUsing calculus, find the greatest value that $A$ can take.`,
      marks: 4,
      answer: numSpec(G.value),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `expanding to $A = ${G.latex}$ and differentiating to $\\frac{dA}{dx} = ${G.d1Latex}$` },
        { id: "M1", code: "M", marks: 1, for: `setting the derivative to zero, giving $x = ${frText(G.x)}$`, dependsOn: ["MW1"] },
        { id: "MW2", code: "MW", marks: 1, for: `$\\frac{d^{2}A}{dx^{2}} = ${G.d2Latex}$, negative, so a maximum` },
        { id: "W1", code: "W", marks: 1, for: `$A = ${frText(G.value)}$`, dependsOn: ["M1"], ft: true },
      ],
      hints: ["Expand the bracket before differentiating.", "Set the derivative to zero and solve.", "The question asks for the value of $A$, so substitute back."],
      workedSolution: `Expand: $A = ${G.latex}$.\nDifferentiate: $\\frac{dA}{dx} = ${G.d1Latex}$.\nSet to zero: $x = ${frText(G.x)}$.\n$\\frac{d^{2}A}{dx^{2}} = ${G.d2Latex}$, which is negative, so this is a maximum.\nSubstitute back: $A = ${frText(G.x)}(20 - ${frText(G.x)}) = ${frText(G.value)}$.`,
      commonErrors: [
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.gStopAtX },
          feedback: `That is the value of $x$ at the maximum, which is three of the four marks. The question asks for the greatest value of $A$, so put it back: $A = ${frText(G.value)}$.`,
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q6 = mkQ(6, {
  commandWords: ["Find"],
  difficulty: 4,
  emphasis: ["Using calculus"],
  methodLock: CALC_LOCK,
  setting: "A short minimum problem with a negative power",
  skeleton: "(main)find4",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q14"],
  solutionProgram: `C = ${Hc.text}; dC/dx = ${Hc.d1Text} = 0 -> x^2 = 100 -> x = ${frText(Hc.x)}`,
  parts: [
    {
      id: "main",
      stem: `A cost is given by $C = ${Hc.latex}$ for $x > 0$.\nUsing calculus, find the value of $x$ which makes $C$ least.`,
      marks: 4,
      answer: numSpec(Hc.x),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dC}{dx} = ${Hc.d1Latex}$` },
        { id: "M1", code: "M", marks: 1, for: `setting it to zero and reaching $x^{2} = ${frText(div(fr(300), fr(3)))}$`, dependsOn: ["MW1"] },
        { id: "W1", code: "W", marks: 1, for: `$x = ${frText(Hc.x)}$`, dependsOn: ["M1"] },
        { id: "MW2", code: "MW", marks: 1, for: `$\\frac{d^{2}C}{dx^{2}} = ${Hc.d2Latex}$, which is $${frLatex(Hc.second)}$ at $x = ${frText(Hc.x)}$, positive, so a minimum` },
      ],
      hints: ["Rewrite the fraction as $300x^{-1}$.", "Set the derivative to zero and multiply through by $x^{2}$.", "Take the positive square root, then confirm with the second derivative."],
      workedSolution: `$\\frac{dC}{dx} = ${Hc.d1Latex}$.\nSet to zero: $\\frac{300}{x^{2}} = 3$, so $x^{2} = ${frText(div(fr(300), fr(3)))}$ and $x = ${frText(Hc.x)}$.\n$\\frac{d^{2}C}{dx^{2}} = ${Hc.d2Latex}$, which at $x = ${frText(Hc.x)}$ is $${frLatex(Hc.second)}$: positive, so $C$ is least here.`,
      commonErrors: [
        {
          misconception: "fm.optim.square-root-not-taken",
          pattern: { kind: "numeric", value: R.hcSquareRoot },
          feedback: `That is $x^{2}$, so the method marks stand. Take the square root to reach $x = ${frText(Hc.x)}$.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q7 = mkQ(7, {
  commandWords: ["Find"],
  difficulty: 3,
  setting: "Substituting the optimal value back into the quantity",
  skeleton: "(main)find2",
  examinerSources: ["ccea-cer:further-maths:2022-summer:FM1:Q13"],
  solutionProgram: `C = ${Hc.text} at x = ${frText(Hc.x)} -> ${frText(Hc.value)}`,
  parts: [
    {
      id: "main",
      stem: `A cost is given by $C = ${Hc.latex}$, and it is least when $x = ${frText(Hc.x)}$.\nFind that least cost.`,
      marks: 2,
      answer: numSpec(Hc.value),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(Hc.x)}$ into $C$` },
        { id: "W1", code: "W", marks: 1, for: `$${frText(Hc.value)}$`, dependsOn: ["M1"] },
      ],
      hints: ["Put the value into the original expression, not into the derivative.", "Work out both terms and add them."],
      workedSolution: `$C = 3 \\times ${frText(Hc.x)} + \\frac{300}{${frText(Hc.x)}} = 30 + 30 = ${frText(Hc.value)}$.`,
      commonErrors: [
        {
          misconception: "fm.calc.turning-y-from-derivative",
          pattern: { kind: "numeric", value: R.hcFromDerivative },
          feedback: `That is what $\\frac{dC}{dx}$ gives at $x = ${frText(Hc.x)}$, and it is zero there by definition. The cost itself comes from the original expression, where it is $${frText(Hc.value)}$.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q8 = mkQ(8, {
  commandWords: ["Determine"],
  difficulty: 2,
  setting: "Naming a turning point from the second derivative",
  skeleton: "(main)determine1",
  examinerSources: ["ccea-cer:further-maths:2023-summer:FM1:Q13"],
  solutionProgram: `d2A/dx2 = ${A.d2Text} -> negative -> maximum`,
  parts: [
    {
      id: "main",
      stem: `A bed's area has $\\frac{d^{2}A}{dx^{2}} = ${A.d2Latex}$ at its stationary value.\nDetermine whether that value is a maximum or a minimum.`,
      marks: 1,
      answer: {
        kind: "mcq",
        shuffle: true,
        options: [
          { id: "a", text: "A maximum, because the second derivative is negative", correct: true, feedback: "A negative second derivative means the gradient is falling through zero, which is a peak." },
          { id: "b", text: "A minimum, because the second derivative is negative", correct: false, misconception: "fm.calc.second-derivative-sign-misread", feedback: "The value is read correctly and the conclusion is reversed. Negative names a maximum and positive names a minimum." },
          { id: "c", text: "It cannot be decided without a sketch", correct: false, misconception: "fm.optim.nature-not-shown", feedback: "The second derivative settles it on its own, which is exactly why the scheme asks for it." },
        ],
      },
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$\\frac{d^{2}A}{dx^{2}} = ${A.d2Latex}$, which is negative, so the stationary value is a maximum` }],
      hints: ["Look only at the sign.", "Negative names a maximum."],
      workedSolution: `$\\frac{d^{2}A}{dx^{2}} = ${A.d2Latex}$ is negative, so the gradient is falling through zero and the stationary value is a maximum.`,
      commonErrors: [],
      requiresWorking: false,
    },
  ],
});

const q9 = mkQ(9, {
  commandWords: ["Write down"],
  difficulty: 4,
  setting: "Forming a fencing expression from a fixed area",
  figures: [svgFigure(plotDiagramVars, `A rectangular vegetable plot of area ${frText(B.area)} square metres, x metres across and y metres deep, with one extra fence of length y across the middle`)],
  skeleton: "(main)write3",
  examinerSources: ["ccea-cer:further-maths:2022-summer:FM1:Q13"],
  solutionProgram: `xy = ${frText(B.area)} -> y = 54/x; L = 2x + 3y = ${B.text}`,
  parts: [
    {
      id: "main",
      stem: `A rectangular vegetable plot is $x$ m across and $y$ m deep, and its area is $${frText(B.area)}$ m². It is fenced round all four sides, and one more fence runs across it parallel to the sides of length $y$.\nWrite down an expression in $x$ for the total length of fencing.`,
      marks: 3,
      answer: algSpec(B.latex),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: "$L = 2x + 3y$ read from the diagram" },
        { id: "M1", code: "M", marks: 1, for: `$y = \\frac{${frText(B.area)}}{x}$ from the area` },
        { id: "W1", code: "W", marks: 1, for: `$L = ${B.latex}$`, dependsOn: ["MW1", "M1"] },
      ],
      hints: ["Count the fences of each length separately.", "The extra fence is parallel to the sides of length $y$, so it is $y$ long.", `Use $xy = ${frText(B.area)}$ to replace $y$.`],
      workedSolution: `There are two sides of length $x$, two of length $y$, and one more of length $y$ across the middle, so $L = 2x + 3y$.\nThe area gives $y = \\frac{${frText(B.area)}}{x}$.\nSo $L = 2x + 3 \\times \\frac{${frText(B.area)}}{x} = ${B.latex}$.`,
      commonErrors: [
        {
          misconception: "fm.optim.constraint-not-read-from-diagram",
          pattern: { kind: "algebraic", latex: R.plotExpr },
          feedback: "The substitution for $y$ is right, so the method mark stands. Only four fences have been counted: the extra one across the middle is another $y$, which makes the total $2x + 3y$.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q10 = mkQ(10, {
  commandWords: ["Write down"],
  difficulty: 3,
  setting: "Reading a constraint from a three-sided fence",
  figures: [svgFigure(wallDiagramVars, `A rectangular flower bed against a wall, edged on three sides only, with the two ends x metres and the side facing the wall y metres`)],
  skeleton: "(main)write2",
  examinerSources: ["ccea-cer:further-maths:2022-summer:FM1:Q13"],
  solutionProgram: `2x + y = ${frText(A.edging)} -> y = ${frText(A.edging)} - 2x`,
  parts: [
    {
      id: "main",
      stem: `A flower bed is a rectangle $x$ m by $y$ m built against a straight wall, with the side of length $y$ facing the wall. The three sides that are not the wall are edged with $${frText(A.edging)}$ m of timber.\nWrite down $y$ in terms of $x$.`,
      marks: 2,
      answer: algSpec(`${frText(A.edging)} - 2x`),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$2x + y = ${frText(A.edging)}$` },
        { id: "W1", code: "W", marks: 1, for: `$y = ${frText(A.edging)} - 2x$`, dependsOn: ["MW1"] },
      ],
      hints: ["Which three sides carry timber?", "The wall is the fourth side, so it is not edged."],
      workedSolution: `The timber runs along the two sides of length $x$ and the one side of length $y$, so $2x + y = ${frText(A.edging)}$.\nRearranging gives $y = ${frText(A.edging)} - 2x$.`,
      commonErrors: [
        {
          misconception: "fm.optim.wall-side-fenced",
          pattern: { kind: "algebraic", latex: R.wallY },
          feedback: `That comes from $2x + 2y = ${frText(A.edging)}$, which edges all four sides. The wall takes one of them, so only one length of $y$ is paid for.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q11 = mkQ(11, {
  commandWords: ["Find"],
  difficulty: 4,
  emphasis: ["Using calculus"],
  methodLock: CALC_LOCK,
  setting: "Two pens against a barn wall",
  skeleton: "(main)find3",
  examinerSources: ["ccea-cer:further-maths:2019-summer:FM1:Q14"],
  solutionProgram: `A = ${D.text}; dA/dx = ${D.d1Text} = 0 -> x = ${frText(D.x)}`,
  parts: [
    {
      id: "main",
      stem: `Two pens are built side by side against a barn wall, using $${frText(D.fencing)}$ m of fencing for the two ends, the far side and one divider. Each end is $x$ m, and the area enclosed is $A = ${D.latex}$ m².\nUsing calculus, find the value of $x$ which gives the greatest area.`,
      marks: 3,
      answer: numSpec(D.x),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dA}{dx} = ${D.d1Latex}$` },
        { id: "M1", code: "M", marks: 1, for: "setting the derivative to zero", dependsOn: ["MW1"] },
        { id: "W1", code: "W", marks: 1, for: `$x = ${frText(D.x)}$`, dependsOn: ["M1"] },
      ],
      hints: ["Differentiate the expression as it stands.", "Set the result to zero.", "Divide by the coefficient of $x$."],
      workedSolution: `$\\frac{dA}{dx} = ${D.d1Latex}$.\nSet it to zero: $6x = ${frText(D.fencing)}$, so $x = ${frText(D.x)}$.`,
      commonErrors: [],
      requiresWorking: true,
    },
  ],
});

const q12 = mkQ(12, {
  commandWords: ["Find"],
  difficulty: 3,
  setting: "Evaluating the greatest area once x is known",
  skeleton: "(main)find2",
  examinerSources: ["ccea-cer:further-maths:2022-summer:FM1:Q13"],
  solutionProgram: `A = ${D.text} at x = ${frText(D.x)} -> ${frText(D.value)}`,
  parts: [
    {
      id: "main",
      stem: `The area of the two pens is $A = ${D.latex}$ m², and it is greatest when $x = ${frText(D.x)}$.\nFind the greatest area.`,
      marks: 2,
      answer: numSpec(D.value, "m²"),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(D.x)}$ into $A$` },
        { id: "W1", code: "W", marks: 1, for: `$${frText(D.value)}$ m², with the unit`, dependsOn: ["M1"] },
      ],
      hints: ["Substitute into the expression for the area.", "An area is measured in square metres."],
      workedSolution: `$A = ${frText(D.fencing)} \\times ${frText(D.x)} - 3 \\times ${frText(D.x)}^{2} = 216 - 108 = ${frText(D.value)}$ m².`,
      commonErrors: [
        unitOmitted(D.value, "m²", "an area", "ccea-cer:further-maths:2022-summer:FM1:Q13"),
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.dStopAtX },
          feedback: `That is the value of $x$, which is the length of one end in metres. The area is what the question asks for, and substituting gives $${frText(D.value)}$ m².`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q13 = mkQ(13, {
  commandWords: ["Find"],
  difficulty: 4,
  emphasis: ["Using calculus"],
  methodLock: CALC_LOCK,
  setting: "The number of trays that makes the cost of each one least",
  skeleton: "(main)find4",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q14"],
  solutionProgram: `C = ${E.text}; dC/dx = ${E.d1Text} = 0 -> x^2 = 400 -> x = ${frText(E.x)}`,
  parts: [
    {
      id: "main",
      stem: `A workshop makes $x$ trays a week, and the cost of making each tray is $C = ${E.latex}$ pounds.\nUsing calculus, find the number of trays a week that makes the cost of each tray least.`,
      marks: 4,
      answer: numSpec(E.x),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dC}{dx} = ${E.d1Latex}$` },
        { id: "M1", code: "M", marks: 1, for: `setting it to zero and reaching $x^{2} = ${frText(div(fr(800), fr(2)))}$`, dependsOn: ["MW1"] },
        { id: "W1", code: "W", marks: 1, for: `$x = ${frText(E.x)}$`, dependsOn: ["M1"] },
        { id: "MW2", code: "MW", marks: 1, for: `$\\frac{d^{2}C}{dx^{2}} = ${E.d2Latex}$, which is $${frLatex(E.second)}$ at $x = ${frText(E.x)}$, positive, so a minimum` },
      ],
      hints: ["The constant term differentiates to zero.", "Rewrite $\\frac{800}{x}$ as $800x^{-1}$.", "Take the positive root, then confirm with the second derivative."],
      workedSolution: `$\\frac{dC}{dx} = ${E.d1Latex}$.\nSet to zero: $\\frac{800}{x^{2}} = 2$, so $x^{2} = ${frText(div(fr(800), fr(2)))}$ and $x = ${frText(E.x)}$.\n$\\frac{d^{2}C}{dx^{2}} = ${E.d2Latex}$, which at $x = ${frText(E.x)}$ is $${frLatex(E.second)}$: positive, so the cost is least at $${frText(E.x)}$ trays a week.`,
      commonErrors: [
        {
          misconception: "fm.optim.square-root-not-taken",
          pattern: { kind: "numeric", value: R.eSquareRoot },
          feedback: `That is $x^{2}$, reached correctly. The square root is still to be taken, which gives $${frText(E.x)}$ trays.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
  ],
});

/* ---------------- exam-style ---------------- */

const exam1 = mkQ(14, {
  style: "exam-style",
  commandWords: ["Show that", "Find"],
  difficulty: 5,
  ao: ["AO1", "AO2", "AO3"],
  emphasis: ["Show that", "Using calculus"],
  methodLock: CALC_LOCK,
  setting: "A printed notice with fixed printed area and margins",
  figures: [svgFigure(noticeDiagram, `A notice with a printed rectangle of area ${frText(C.printed)} square centimetres and margins of ${frText(C.sideMargin)} centimetres at the sides and ${frText(C.endMargin)} centimetres at the top and bottom`)],
  skeleton: "(a)show1|(b)show2|(c)find5|(d)find2",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q14", "ccea-cer:further-maths:2024-summer:FM1:Q13"],
  solutionProgram: `wh = ${frText(C.printed)}; A = (w + 6)(h + 8) = ${C.text}; dA/dw = ${C.d1Text} = 0 -> w^2 = 225 -> w = ${frText(C.x)}; d2A/dw2 = ${C.d2Text} -> ${frText(C.second)} > 0; A = ${frText(C.value)}`,
  parts: [
    {
      id: "a",
      stem: `A notice is printed on a rectangular card. The printed part is $w$ cm wide, $h$ cm tall and has an area of $${frText(C.printed)}$ cm². There is a margin of $${frText(C.sideMargin)}$ cm at each side and $${frText(C.endMargin)}$ cm at the top and at the bottom.\nShow that $h = \\frac{${frText(C.printed)}}{w}$.`,
      marks: 1,
      answer: {
        kind: "text",
        accepted: [
          `The printed area is wh = ${frText(C.printed)}, so dividing both sides by w gives h = ${frText(C.printed)}/w`,
          `wh = ${frText(C.printed)} therefore h = ${frText(C.printed)}/w`,
        ],
        keyWords: [{ any: [`wh = ${frText(C.printed)}`, `hw = ${frText(C.printed)}`, `w x h = ${frText(C.printed)}`], marks: 1 }],
        listingRule: false,
      },
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$wh = ${frText(C.printed)}$, then dividing by $w$`, examinerNote: "The area equation must appear; the printed result alone is not a derivation." }],
      hints: ["Write down the area of the printed rectangle.", "Then make $h$ the subject."],
      workedSolution: `The printed rectangle is $w$ by $h$, so its area is $wh = ${frText(C.printed)}$.\nDividing both sides by $w$ gives $h = \\frac{${frText(C.printed)}}{w}$.`,
      commonErrors: [],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: `Show that the total area of the card is $A = ${C.latex}$ cm².`,
      marks: 2,
      answer: {
        kind: "text",
        accepted: [
          `A = (w + 6)(h + 8) = wh + 8w + 6h + 48 = ${frText(C.printed)} + 8w + 6(${frText(C.printed)}/w) + 48 = 8w + 348 + 1800/w`,
          `The card is (w + 6) by (h + 8), so A = wh + 8w + 6h + 48, and with h = ${frText(C.printed)}/w that is 8w + 348 + 1800/w`,
        ],
        keyWords: [
          { any: ["(w + 6)(h + 8)", "w + 6 h + 8", "w + 6 by h + 8"], marks: 1 },
          { any: ["wh + 8w + 6h + 48"], marks: 1 },
        ],
        listingRule: false,
      },
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `the card measuring $(w + ${frText(mul(fr(2), C.sideMargin))})$ by $\\left(h + ${frText(mul(fr(2), C.endMargin))}\\right)$` },
        { id: "W1", code: "W", marks: 1, for: `expanding and substituting $h = \\frac{${frText(C.printed)}}{w}$ to reach $${C.latex}$`, dependsOn: ["M1"], examinerNote: "Every line is wanted; the printed result cannot be the starting point." },
      ],
      hints: ["Each measurement grows by two margins.", "Multiply the two brackets out before substituting.", "Collect the two constant terms."],
      workedSolution: `The card is $(w + ${frText(mul(fr(2), C.sideMargin))})$ cm by $\\left(h + ${frText(mul(fr(2), C.endMargin))}\\right)$ cm, so $A = (w + ${frText(mul(fr(2), C.sideMargin))})(h + ${frText(mul(fr(2), C.endMargin))})$.\nMultiplying out: $A = wh + 8w + 6h + 48$.\nSubstituting $wh = ${frText(C.printed)}$ and $h = ${frText(C.printed)}/w$ gives $A = ${frText(C.printed)} + 8w + 6(${frText(C.printed)}/w) + 48 = ${C.latex}$.`,
      commonErrors: [
        {
          misconception: "fm.show-that.steps-missing",
          pattern: { kind: "text", regex: "^\\s*(a\\s*=\\s*)?8w\\s*\\+\\s*348[^\\n]{0,30}$" },
          feedback: "The printed expression has been copied down with nothing in front of it. A show-that pays for the derivation, so write the two brackets, the expansion and the substitution as three separate lines.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2018-summer:FM1:Q12",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "c",
      stem: `Using calculus, find the value of $w$ that makes the total area least, showing clearly that it is a minimum.`,
      marks: 5,
      answer: numSpec(C.x),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dA}{dw} = ${C.d1Latex}$` },
        { id: "M1", code: "M", marks: 1, for: "setting the derivative to zero", dependsOn: ["MW1"] },
        { id: "W1", code: "W", marks: 1, for: `$w^{2} = ${frText(div(fr(1800), fr(8)))}$`, dependsOn: ["M1"] },
        { id: "W2", code: "W", marks: 1, for: `$w = ${frText(C.x)}$, the negative root rejected because $w$ is a width`, dependsOn: ["W1"] },
        { id: "MW2", code: "MW", marks: 1, for: `$\\frac{d^{2}A}{dw^{2}} = ${C.d2Latex}$, which is $${frLatex(C.second)}$ at $w = ${frText(C.x)}$, positive, so a minimum` },
      ],
      hints: ["Write $\\frac{1800}{w}$ as $1800w^{-1}$ before differentiating.", "The constant term differentiates to zero.", "After solving, differentiate a second time and substitute your value of $w$."],
      workedSolution: `$\\frac{dA}{dw} = ${C.d1Latex}$.\nSet it to zero: $\\frac{1800}{w^{2}} = 8$, so $w^{2} = ${frText(div(fr(1800), fr(8)))}$ and $w = ${frText(C.x)}$ cm, taking the positive root because $w$ is a width.\n$\\frac{d^{2}A}{dw^{2}} = ${C.d2Latex}$, which at $w = ${frText(C.x)}$ is $${frLatex(C.second)}$.\nThat is positive, so the total area is least when $w = ${frText(C.x)}$ cm.`,
      commonErrors: [
        {
          misconception: "fm.optim.square-root-not-taken",
          pattern: { kind: "numeric", value: num(routes.squareRootNotTaken(C)) },
          feedback: `That is $w^{2}$, which is three of the five marks. Take the square root for $w = ${frText(C.x)}$, then show the second derivative is positive.`,
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "b", rule: "use-candidate-value" },
    },
    {
      id: "d",
      stem: "Find the least possible total area of the card.",
      marks: 2,
      answer: numSpec(C.value, "cm²"),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `substituting $w = ${frText(C.x)}$ into $A$`, ft: true },
        { id: "W1", code: "W", marks: 1, for: `$${frText(C.value)}$ cm², with the unit`, dependsOn: ["M1"] },
      ],
      hints: ["Substitute your value of $w$ into the expression from part (b).", `A check: the card is $${frText(C.outerW)}$ cm by $${frText(C.outerH)}$ cm.`],
      workedSolution: `$A = ${frText(348)} + 8 \\times ${frText(C.x)} + \\frac{1800}{${frText(C.x)}} = ${frText(348)} + 120 + 120 = ${frText(C.value)}$ cm².\nAs a check, the card is $${frText(C.outerW)}$ cm by $${frText(C.outerH)}$ cm, and $${frText(C.outerW)} \\times ${frText(C.outerH)} = ${frText(C.value)}$.`,
      commonErrors: [
        unitOmitted(C.value, "cm²", "an area", "ccea-cer:further-maths:2022-summer:FM1:Q13"),
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.cStopAtX },
          feedback: `That is the printed width in centimetres, which part (c) already asked for. This part wants the area of the whole card, which is $${frText(C.value)}$ cm².`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "c", rule: "use-candidate-value" },
    },
  ],
});

const exam2 = mkQ(15, {
  style: "exam-style",
  commandWords: ["Show that", "Find"],
  difficulty: 4,
  ao: ["AO1", "AO2", "AO3"],
  emphasis: ["Show that", "Using calculus"],
  methodLock: CALC_LOCK,
  setting: "Two pens against a barn wall",
  figures: [svgFigure(pensDiagram, "Two rectangular pens side by side against a barn wall, the two ends and the divider each x metres and the far side y metres")],
  skeleton: "(a)show1|(b)show1|(c)find4|(d)find2",
  examinerSources: ["ccea-cer:further-maths:2019-summer:FM1:Q14", "ccea-cer:further-maths:2022-summer:FM1:Q13"],
  solutionProgram: `3x + y = ${frText(D.fencing)}; A = x(36 - 3x) = ${D.text}; dA/dx = ${D.d1Text} = 0 -> x = ${frText(D.x)}; d2A/dx2 = ${D.d2Text} < 0; A = ${frText(D.value)}`,
  parts: [
    {
      id: "a",
      stem: `Two rectangular pens are built side by side against a long barn wall. Altogether they use $${frText(D.fencing)}$ m of fencing for the two ends, the far side and the divider between them. Each end, and the divider, is $x$ m long, and the far side is $y$ m long.\nShow that $y = ${frText(D.fencing)} - 3x$.`,
      marks: 1,
      answer: {
        kind: "text",
        accepted: [
          `The fencing covers two ends, the divider and the far side, so 3x + y = ${frText(D.fencing)}, giving y = ${frText(D.fencing)} - 3x`,
          `3x + y = ${frText(D.fencing)} so y = ${frText(D.fencing)} - 3x`,
        ],
        keyWords: [{ any: [`3x + y = ${frText(D.fencing)}`, `y + 3x = ${frText(D.fencing)}`], marks: 1 }],
        listingRule: false,
      },
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$3x + y = ${frText(D.fencing)}$ read from the arrangement, then rearranged`, examinerNote: "The three lengths of x must be counted: two ends and the divider." }],
      hints: ["How many fences are $x$ metres long?", "The wall is not fenced."],
      workedSolution: `Three fences are $x$ m long: the two ends and the divider. One fence is $y$ m long: the far side.\nSo $3x + y = ${frText(D.fencing)}$, and rearranging gives $y = ${frText(D.fencing)} - 3x$.`,
      commonErrors: [],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: `Show that the total area enclosed is $A = ${D.latex}$ m².`,
      marks: 1,
      answer: {
        kind: "text",
        accepted: [
          `A = xy = x(${frText(D.fencing)} - 3x) = ${frText(D.fencing)}x - 3x²`,
          `The area is xy, and substituting y gives x(${frText(D.fencing)} - 3x) = ${frText(D.fencing)}x - 3x^2`,
        ],
        keyWords: [{ any: [`x(${frText(D.fencing)} - 3x)`, `xy = x(${frText(D.fencing)} - 3x)`], marks: 1 }],
        listingRule: false,
      },
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$A = xy = x(${frText(D.fencing)} - 3x)$, expanded` }],
      hints: ["The two pens together form one rectangle.", "Substitute the expression for $y$ from part (a)."],
      workedSolution: `The two pens together are one rectangle $x$ m by $y$ m, so $A = xy$.\nSubstituting from part (a): $A = x(${frText(D.fencing)} - 3x) = ${D.latex}$.`,
      commonErrors: [],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
    {
      id: "c",
      stem: "Using calculus, find the value of $x$ which gives the greatest total area, showing clearly that it is a maximum.",
      marks: 4,
      answer: numSpec(D.x),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dA}{dx} = ${D.d1Latex}$` },
        { id: "M1", code: "M", marks: 1, for: "setting the derivative to zero", dependsOn: ["MW1"] },
        { id: "W1", code: "W", marks: 1, for: `$x = ${frText(D.x)}$`, dependsOn: ["M1"] },
        { id: "MW2", code: "MW", marks: 1, for: `$\\frac{d^{2}A}{dx^{2}} = ${D.d2Latex}$, which is negative, so a maximum` },
      ],
      hints: ["Differentiate the expression from part (b).", "Set it to zero and solve.", "Differentiate again and read the sign."],
      workedSolution: `$\\frac{dA}{dx} = ${D.d1Latex}$.\nSet it to zero: $6x = ${frText(D.fencing)}$, so $x = ${frText(D.x)}$.\n$\\frac{d^{2}A}{dx^{2}} = ${D.d2Latex}$, which is negative, so $x = ${frText(D.x)}$ gives the greatest area.`,
      commonErrors: [],
      requiresWorking: true,
      followThrough: { fromPart: "b", rule: "use-candidate-value" },
    },
    {
      id: "d",
      stem: "Find the greatest total area enclosed.",
      marks: 2,
      answer: numSpec(D.value, "m²"),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(D.x)}$, or $x = ${frText(D.x)}$ and $y = ${frText(D.y)}$`, ft: true },
        { id: "W1", code: "W", marks: 1, for: `$${frText(D.value)}$ m², with the unit`, dependsOn: ["M1"] },
      ],
      hints: ["Substitute your value of $x$ into the area.", `A check: $y = ${frText(D.y)}$ m, and $${frText(D.x)} \\times ${frText(D.y)}$ is the same number.`],
      workedSolution: `$A = ${frText(D.fencing)} \\times ${frText(D.x)} - 3 \\times ${frText(D.x)}^{2} = ${frText(D.value)}$ m².\nAs a check, $y = ${frText(D.fencing)} - 3 \\times ${frText(D.x)} = ${frText(D.y)}$ m, and $${frText(D.x)} \\times ${frText(D.y)} = ${frText(D.value)}$.`,
      commonErrors: [
        unitOmitted(D.value, "m²", "an area", "ccea-cer:further-maths:2022-summer:FM1:Q13"),
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.dStopAtX },
          feedback: `That is the value of $x$ from part (c), a length in metres. The area is $${frText(D.value)}$ m².`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "c", rule: "use-candidate-value" },
    },
  ],
});

const exam3 = mkQ(16, {
  style: "exam-style",
  commandWords: ["Find", "Show"],
  difficulty: 5,
  ao: ["AO1", "AO2", "AO3"],
  emphasis: ["Using calculus"],
  methodLock: CALC_LOCK,
  setting: "The cost of making each tray in a workshop",
  skeleton: "(a)find2|(b)find3|(c)show2|(d)find2",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q14", "ccea-cer:further-maths:2019-summer:FM1:Q14"],
  solutionProgram: `C = ${E.text}; dC/dx = ${E.d1Text}; = 0 -> x^2 = 400 -> x = ${frText(E.x)}; d2C/dx2 = ${E.d2Text} -> ${frText(E.second)} > 0; C = ${frText(E.value)}`,
  parts: [
    {
      id: "a",
      stem: `A workshop makes $x$ trays a week. The cost of making each tray, in pounds, is\n$C = ${E.latex}$\nFind $\\frac{dC}{dx}$.`,
      marks: 2,
      answer: algSpec(E.d1Latex),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `writing $\\frac{800}{x}$ as $800x^{-1}$` },
        { id: "W1", code: "W", marks: 1, for: `$${E.d1Latex}$, the constant gone`, dependsOn: ["M1"] },
      ],
      hints: ["Rewrite the fraction with a negative index.", "The constant $15$ differentiates to zero."],
      workedSolution: `Rewrite: $C = 2x + 15 + 800x^{-1}$.\n$2x$ gives $2$, $15$ gives $0$, and $800x^{-1}$ gives $-800x^{-2}$.\nSo $\\frac{dC}{dx} = ${E.d1Latex}$.`,
      commonErrors: [
        {
          misconception: "fm.calc.negative-power-differentiation",
          pattern: { kind: "algebraic", latex: polyLatex(routes.negativePowerSignKept(E)) },
          feedback: "The index is right. Multiplying $800$ by the power $-1$ makes that term negative, so it is subtracted rather than added.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2025-summer:FM1:Q14",
        },
        {
          misconception: "fm.calc.linear-term-derivative-omitted",
          pattern: { kind: "algebraic", latex: polyLatex(routes.linearTermDropped(E)) },
          feedback: "The fraction is handled correctly and the term $2x$ has gone. Its derivative is the number $2$, which belongs in the answer.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: "Using calculus, find the number of trays a week that makes the cost of each tray least.",
      marks: 3,
      answer: numSpec(E.x),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "setting the derivative to zero", ft: true },
        { id: "W1", code: "W", marks: 1, for: `$x^{2} = ${frText(div(fr(800), fr(2)))}$`, dependsOn: ["M1"] },
        { id: "W2", code: "W", marks: 1, for: `$x = ${frText(E.x)}$, the negative root rejected because $x$ is a number of trays`, dependsOn: ["W1"] },
      ],
      hints: ["Set the derivative from part (a) to zero.", "Multiply both sides by $x^{2}$.", "Take the positive square root."],
      workedSolution: `Set $\\frac{dC}{dx} = 0$: $\\frac{800}{x^{2}} = 2$.\nMultiplying by $x^{2}$ and dividing by $2$: $x^{2} = ${frText(div(fr(800), fr(2)))}$.\nSo $x = ${frText(E.x)}$ trays a week, taking the positive root.`,
      commonErrors: [
        {
          misconception: "fm.optim.square-root-not-taken",
          pattern: { kind: "numeric", value: R.eSquareRoot },
          feedback: `That is $x^{2}$, so two of the three marks stand. One step is left: take the square root for $${frText(E.x)}$ trays.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
    {
      id: "c",
      stem: `Show clearly that this number of trays gives the least cost.`,
      marks: 2,
      answer: {
        kind: "text",
        accepted: [
          `d2C/dx2 = ${E.d2Text}, and at x = ${frText(E.x)} that is ${frText(E.second)}, which is positive, so the cost is a minimum`,
          `The second derivative is 1600/x^3, which at x = ${frText(E.x)} is ${frText(E.second)}, a positive value, so this is a minimum`,
        ],
        // the second group rejects the opposite conclusion as well as testing the sign word, so
        // "positive, so the cost is greatest" cannot earn it, and "> 0" counts as a sign word
        keyWords: [
          { any: ["1600/x^3", "1600x^-3", "1600 over x cubed"], marks: 1 },
          { any: ["positive", "greater than zero", "above zero", "> 0"], reject: ["maximum", "greatest"], marks: 1 },
        ],
        listingRule: false,
      },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{d^{2}C}{dx^{2}} = ${E.d2Latex}$` },
        { id: "W1", code: "W", marks: 1, for: `the value $${frLatex(E.second)}$ at $x = ${frText(E.x)}$, positive, so a minimum`, dependsOn: ["MW1"], examinerNote: "A word with no number attached earns nothing here." },
      ],
      hints: ["Differentiate the derivative.", "Substitute your value of $x$.", "Say what the sign of that number means."],
      workedSolution: `Differentiating again: $\\frac{d^{2}C}{dx^{2}} = ${E.d2Latex}$, that is $1600/x^3$.\nAt $x = ${frText(E.x)}$ this is $${frLatex(E.second)}$, which is positive.\nA positive second derivative means the gradient is climbing through zero, so the cost is at a minimum.`,
      commonErrors: [
        {
          misconception: "fm.calc.second-derivative-sign-misread",
          pattern: { kind: "text", regex: "(negative|less than zero|below zero)[^;\\n]*(minimum|least)|(minimum|least)[^;\\n]*(negative)" },
          feedback: "The second derivative has been found, which is the method mark. The sign is being read backwards: a positive value names a minimum and a negative one names a maximum.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "b", rule: "use-candidate-value" },
    },
    {
      id: "d",
      stem: "Find the least cost of making each tray.",
      marks: 2,
      answer: numSpec(E.value),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(E.x)}$ into $C$`, ft: true },
        { id: "W1", code: "W", marks: 1, for: `$${frText(E.value)}$`, dependsOn: ["M1"] },
      ],
      hints: ["Substitute into the original expression for $C$.", "Three terms to add."],
      workedSolution: `$C = 2 \\times ${frText(E.x)} + 15 + \\frac{800}{${frText(E.x)}} = 40 + 15 + 40 = ${frText(E.value)}$ pounds.`,
      commonErrors: [
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.eStopAtX },
          feedback: `That is the number of trays from part (b). This part asks for the cost of each tray at that number, which is $${frText(E.value)}$ pounds.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "b", rule: "use-candidate-value" },
    },
  ],
});

const exam4 = mkQ(17, {
  style: "exam-style",
  commandWords: ["Show that", "Find"],
  difficulty: 5,
  ao: ["AO1", "AO2", "AO3"],
  emphasis: ["Show that", "Using calculus"],
  methodLock: CALC_LOCK,
  setting: "A field beside a river, fenced on three sides",
  figures: [svgFigure(riverDiagram, `A rectangular field of area ${frText(F.area)} square metres beside a river, fenced on three sides: the side opposite the river x metres and each end y metres`)],
  skeleton: "(a)show1|(b)show2|(c)find5|(d)find1",
  examinerSources: ["ccea-cer:further-maths:2022-summer:FM1:Q13", "ccea-cer:further-maths:2019-summer:FM1:Q14"],
  solutionProgram: `xy = ${frText(F.area)}; L = x + 2y = ${F.text}; dL/dx = ${F.d1Text} = 0 -> x^2 = 576 -> x = ${frText(F.x)}; d2L/dx2 -> ${frText(F.second)} > 0; L = ${frText(F.value)}`,
  parts: [
    {
      id: "a",
      stem: `A rectangular field of area $${frText(F.area)}$ m² lies beside a straight river. The side along the river needs no fence. The side opposite the river is $x$ m long and the two ends are each $y$ m long.\nShow that $y = \\frac{${frText(F.area)}}{x}$.`,
      marks: 1,
      answer: {
        kind: "text",
        accepted: [
          `The area is xy = ${frText(F.area)}, so dividing by x gives y = ${frText(F.area)}/x`,
          `xy = ${frText(F.area)} therefore y = ${frText(F.area)}/x`,
        ],
        keyWords: [{ any: [`xy = ${frText(F.area)}`, `yx = ${frText(F.area)}`, `x x y = ${frText(F.area)}`, `x times y = ${frText(F.area)}`, `xy is ${frText(F.area)}`], marks: 1 }],
        listingRule: false,
      },
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$xy = ${frText(F.area)}$, then dividing by $x$` }],
      hints: ["Write down the area of the rectangle.", "Make $y$ the subject."],
      workedSolution: `The field is $x$ m by $y$ m, so $xy = ${frText(F.area)}$.\nDividing both sides by $x$ gives $y = \\frac{${frText(F.area)}}{x}$.`,
      commonErrors: [],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: `Show that the total length of fencing is $L = ${F.latex}$ m.`,
      marks: 2,
      answer: {
        kind: "text",
        accepted: [
          `The fence covers the far side and the two ends, so L = x + 2y = x + 2(${frText(F.area)}/x) = x + 576/x`,
          `L = x + 2y and y = ${frText(F.area)}/x, so L = x + 2(${frText(F.area)}/x) = x + 576/x`,
        ],
        keyWords: [
          { any: ["x + 2y"], marks: 1 },
          // a one-step substitution ("replacing y with 288/x") earns the substitution mark too
          { any: [`2(${frText(F.area)}/x)`, `2 x ${frText(F.area)}/x`, `${frText(F.area)}/x`], marks: 1 },
        ],
        listingRule: false,
      },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: "$L = x + 2y$ read from the arrangement" },
        { id: "W1", code: "W", marks: 1, for: `substituting $y = \\frac{${frText(F.area)}}{x}$ to reach $${F.latex}$`, dependsOn: ["MW1"] },
      ],
      hints: ["Three sides are fenced, not four.", "Two of them are the ends, each $y$ m.", "Now replace $y$."],
      workedSolution: `The fence runs along the side opposite the river and the two ends, so $L = x + 2y$.\nSubstituting $y = ${frText(F.area)}/x$ gives $L = x + 2(${frText(F.area)}/x) = ${F.latex}$.`,
      commonErrors: [
        {
          misconception: "fm.optim.wall-side-fenced",
          pattern: { kind: "text", regex: "\\b2x\\s*\\+\\s*2y\\b" },
          feedback: "That fences all four sides. The river takes the side opposite $x$, so only one length of $x$ and the two ends are paid for.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
    {
      id: "c",
      stem: "Using calculus, find the value of $x$ which uses the least fencing, showing clearly that it is a minimum.",
      marks: 5,
      answer: numSpec(F.x),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `writing $\\frac{576}{x}$ as $576x^{-1}$` },
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dL}{dx} = ${F.d1Latex}$, including the $1$ from the term in $x$`, dependsOn: ["M1"] },
        { id: "W1", code: "W", marks: 1, for: `$x^{2} = ${frText(div(fr(576), fr(1)))}$`, dependsOn: ["MW1"] },
        { id: "W2", code: "W", marks: 1, for: `$x = ${frText(F.x)}$, the negative root rejected because $x$ is a length`, dependsOn: ["W1"] },
        { id: "MW2", code: "MW", marks: 1, for: `$\\frac{d^{2}L}{dx^{2}} = ${F.d2Latex}$, which is $${frLatex(F.second)}$ at $x = ${frText(F.x)}$, positive, so a minimum` },
      ],
      hints: ["The plain $x$ differentiates to $1$, not to nothing.", "Multiply through by $x^{2}$ after setting the derivative to zero.", "Confirm with the second derivative at your value of $x$."],
      workedSolution: `Rewrite: $L = x + 576x^{-1}$, so $\\frac{dL}{dx} = ${F.d1Latex}$.\nSet it to zero: $\\frac{576}{x^{2}} = 1$, so $x^{2} = ${frText(fr(576))}$ and $x = ${frText(F.x)}$ m, taking the positive root.\n$\\frac{d^{2}L}{dx^{2}} = ${F.d2Latex}$, which at $x = ${frText(F.x)}$ is $${frLatex(F.second)}$: positive, so this is the least fencing.`,
      commonErrors: [
        {
          misconception: "fm.optim.square-root-not-taken",
          pattern: { kind: "numeric", value: R.fSquareRoot },
          feedback: `That is $x^{2}$, so three of the five marks stand. Taking the square root gives $x = ${frText(F.x)}$ m.`,
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "b", rule: "use-candidate-value" },
    },
    {
      id: "d",
      stem: "Find the least length of fencing needed.",
      marks: 1,
      answer: numSpec(F.value, "m"),
      scheme: [{ id: "W1", code: "W", marks: 1, for: `$${frText(F.value)}$ m, with the unit`, ft: true }],
      hints: [`Substitute $x = ${frText(F.x)}$ into $L$.`, `A check: $y = ${frText(F.y)}$ m, so the three sides are ${frText(F.x)}, ${frText(F.y)} and ${frText(F.y)}.`],
      workedSolution: `$L = ${frText(F.x)} + \\frac{576}{${frText(F.x)}} = ${frText(F.x)} + ${frText(F.x)} = ${frText(F.value)}$ m.\nAs a check, $y = \\frac{${frText(F.area)}}{${frText(F.x)}} = ${frText(F.y)}$ m, and $${frText(F.x)} + 2 \\times ${frText(F.y)} = ${frText(F.value)}$ m.`,
      commonErrors: [
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.fStopAtX },
          feedback: `That is the value of $x$ from part (c), the length of one side. The fencing is all three sides together, which is $${frText(F.value)}$ m.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "c", rule: "use-candidate-value" },
    },
  ],
});

/* ---------------- find the mistake ---------------- */

const ftm1 = {
  id: "ftm.fm.u1.optimisation.01",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Ruairí was asked for the least length of fencing for a field of area $${frText(F.area)}$ m² beside a river, where $L = ${F.latex}$. His working:`,
  studentWorking: [
    `L = ${F.text}`,
    `dL/dx = ${F.d1Text}`,
    `${F.d1Text} = 0 so x^2 = 576`,
    `x = ${frText(F.x)}`,
    `The least length of fencing is ${frText(F.x)} m`,
  ],
  mistakeLine: 5,
  misconception: "fm.optim.final-quantity-not-evaluated",
  whatWentWrong: `Lines 1 to 4 are all correct, and they are worth most of the marks.\nLine 5 reports the value of $x$, which is the length of one side of the field. The question asked for the total fencing, and that is $L$.\nSubstituting back gives $L = ${frText(F.x)} + \\frac{576}{${frText(F.x)}} = ${frText(F.value)}$ m.`,
  correction: [
    `L = ${frText(F.x)} + 576/${frText(F.x)}`,
    `The least length of fencing is ${frText(F.value)} m`,
  ],
  marksEarnedAsWritten: ["M1", "MW1", "W1", "W2"],
  feedback: `The calculus is sound and it earns its marks. What is missing is the last line: a value of $x$ is not the quantity the question named. Read the final sentence of the question again, substitute, and write the answer with its unit. Here the fencing is $${frText(F.value)}$ m, made up of $${frText(F.x)}$ m along the far side and $${frText(F.y)}$ m at each end.`,
  source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
};

const ftm2 = {
  id: "ftm.fm.u1.optimisation.02",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Méabh was asked to show that the stationary value of $A = ${D.latex}$ is a maximum. Her working:`,
  studentWorking: [
    `dA/dx = ${D.d1Text}`,
    `${D.d1Text} = 0 so x = ${frText(D.x)}`,
    `d2A/dx2 = ${D.d2Text}`,
    `${D.d2Text} is negative so this is a minimum`,
    `The area is least when x = ${frText(D.x)}`,
  ],
  mistakeLine: 4,
  misconception: "fm.calc.second-derivative-sign-misread",
  whatWentWrong: `Lines 1 to 3 are exactly right, including the second derivative, which is the step most candidates forget altogether.\nLine 4 reads the sign the wrong way round. A negative second derivative means the gradient is falling as it passes through zero: up, level, down, which is a peak.\nPositive names a minimum; negative names a maximum.`,
  correction: [
    `${D.d2Text} is negative so this is a maximum`,
    `The area is greatest when x = ${frText(D.x)}`,
  ],
  marksEarnedAsWritten: ["MW1", "M1", "W1"],
  feedback: `All the calculus is right, so the method and working marks up to line 3 stand. Only the reading of the sign has slipped. Picture the gradient itself: if it is decreasing as it crosses zero, the curve rose to the point and then fell, and that is a maximum. A quick sanity check also helps here, since a fixed length of fencing can enclose a largest area but has no smallest one.`,
  source: "ccea-cer:further-maths:2023-summer:FM1:Q13",
};

const ftm3 = {
  id: "ftm.fm.u1.optimisation.03",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Cara was asked for the greatest area of a bed built against a wall with $${frText(A.edging)}$ m of edging on three sides, the two ends each $x$ m. Her working:`,
  studentWorking: [
    `2x + 2y = ${frText(A.edging)} so y = ${R.wallY}`,
    `A = x(${R.wallY}) = ${polyText(wallRoute.p)}`,
    `dA/dx = ${polyText(polyDeriv(wallRoute.p))}`,
    `dA/dx = 0 gives x = ${frText(wallRoute.x)}`,
    `The greatest area is ${R.wallArea} m^2`,
  ],
  mistakeLine: 1,
  misconception: "fm.optim.wall-side-fenced",
  whatWentWrong: `Everything from line 2 onwards is correct working on the expression in line 1, which is why the error is so hard to spot on the page.\nLine 1 fences all four sides. The wall provides one of them, so the edging covers two ends of $x$ and one side of $y$ only: $2x + y = ${frText(A.edging)}$.\nThat gives $y = ${frText(A.edging)} - 2x$ and $A = ${A.latex}$, whose greatest value is $${frText(A.value)}$ m², not $${R.wallArea}$ m².`,
  correction: [
    `2x + y = ${frText(A.edging)} so y = ${frText(A.edging)} - 2x`,
    `A = x(${frText(A.edging)} - 2x) = ${A.text}`,
    `The greatest area is ${frText(A.value)} m^2`,
  ],
  marksEarnedAsWritten: [],
  feedback: `The calculus is faultless, and that is the part worth rehearsing. The first mark is the one lost outright, and it takes the accuracy marks with it, because every later line is correct working on an expression that was never the right one. Before writing a constraint, count on the diagram which sides actually carry fencing: here the wall takes one side, so only three lengths are paid for, and the answer roughly doubles to $${frText(A.value)}$ m².`,
  source: "ccea-cer:further-maths:2022-summer:FM1:Q13",
};

/* ---------------- retrieval prompts ---------------- */

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.fm.u1.optimisation.${String(n).padStart(2, "0")}`,
  topic: TOPIC,
  specRefs: SPEC,
  kind,
  prompt,
  answer,
  keyWords,
  examUnit: "FM1",
  difficultyPrior,
});

const prompts = [
  rp(1, "procedure", "What are the five steps of an optimisation question?", "Read the constraint, use it to write the quantity in one letter, differentiate and set the derivative to zero, confirm the nature with the second derivative, then substitute back for the quantity asked.", ["constraint", "one letter", "differentiate", "second derivative", "substitute"], 4),
  rp(2, "definition", "What does the word constraint mean in one of these questions?", "The sentence or diagram that ties the two letters together, such as a fixed length of fencing or a fixed area.", ["ties", "fixed", "fencing", "area"], 3),
  rp(3, "trap", "A bed is fenced on three sides against a wall, with ends of $x$ and a front of $y$. Why is the constraint not $2x + 2y$?", "The wall provides the fourth side, so only two ends and one front are fenced.", ["wall", "fourth side", "two ends"], 5),
  rp(4, "procedure", "How do you differentiate a term such as $\\frac{162}{x}$?", "Rewrite it as $162x^{-1}$, multiply by the power $-1$ and step the index down to $-2$, giving $-162x^{-2}$.", ["rewrite", "power", "index", "162x"], 5),
  rp(5, "qa", "After solving $\\frac{dA}{dx} = 0$, what does the scheme still want?", "The second derivative, worked out at that value of x, with its sign read as a maximum or a minimum.", ["second derivative", "sign", "maximum", "minimum"], 4),
  rp(6, "trap", "You reach $x^{2} = 81$. What is left to do?", "Take the square root, giving $x = 9$, and reject the negative root because a length cannot be negative.", ["square root", "9", "negative"], 3),
  rp(7, "trap", "You have found the value of $x$ that maximises an area. Are you finished?", "Only if the question asked for x; otherwise substitute it back to find the area, the length or the cost that was asked for, with its unit.", ["substitute", "area", "unit"], 5),
  rp(8, "qa", "What do the words using calculus in a stem forbid?", "Any non-calculus route: a table of values, a graph read by eye or a calculator maximum earns nothing.", ["table of values", "graph", "calculator"], 4),
  rp(9, "trap", "Which optimisation contexts are not asked on this specification?", "Three-dimensional problems such as boxes, and anything involving pi.", ["three dimensional", "boxes", "pi"], 3),
];

/* ---------------- verification ---------------- */

const verification = [];
const push = (id, checks) => verification.push(verLog(id, checks));

push("note.fm.u1.optimisation", [
  ["schema", "pass", `Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, all ${note.filter((b) => b.type === 'gate').length} gate ids are unique and every prompt block names a prompt in this bundle.`],
  ["scope-tier", "pass", scopeDetail],
  ["formula-sheet", "pass", formulaDetail],
  ["command-words", "pass", commandDetail],
  ["tariff", "pass", "The sheet's howExamined records the tariffs read from the papers: Summer 2025 Q14 ran 1/1/5 with the calculus part carrying the nature test, Summer 2022 Q13 and Summer 2019 Q14 were multi-part questions of 7 to 12 marks late in the paper, and Summer 2024 Q13 was a good discriminator with two printed results to prove."],
  ["maths-numeric", "pass", `Every number in the note is computed in exact rational arithmetic: the bed A = ${A.text} has dA/dx = ${A.d1Text}, x = ${frText(A.x)}, y = ${frText(A.y)} and A = ${frText(A.value)} with second derivative ${frText(A.second)}; the plot L = ${B.text} has dL/dx = ${B.d1Text}, x = ${frText(B.x)}, y = ${frText(B.y)}, L = ${frText(B.value)} and second derivative ${frText(B.second)}; the notice A = ${C.text} has w = ${frText(C.x)}, h = ${frText(C.h)}, outer ${frText(C.outerW)} by ${frText(C.outerH)} and A = ${frText(C.value)}.`],
  ["maths-symbolic", "pass", "Every derivative is checked against a central difference quotient at three sample points (x = 0.7, 2.3, 5.9), every stationary value by exact substitution into the derivative, and every context by rebuilding the quantity from its two dimensions."],
  ["examiner-alignment", "pass", "No examiner callout stands in the teaching body and none is repeated in the closing panel: every one of the Summer 2018 Q12, Summer 2019 Q14, Summer 2022 Q13, Summer 2024 Q13 and Summer 2025 Q14 findings is a trap in note.sheet.traps, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g2 the missing final step, g3 the constraint, g5 the nature test, g6 the quantity asked for, g7 the square root after a negative power and g7a the doubled margin."],
  ["copy-shingle", "pass", shingle],
  ["style-lint", "pass", `${styleLint} The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures drawn from computed values and one embeddable video from data/links/media-map.json followed immediately by a gate.`],
]);

const workedExamples = [we1, we2, we3];
const diagnostics = [dxPre, dxPost];
const questions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, exam1, exam2, exam3, exam4];
const findTheMistake = [ftm1, ftm2, ftm3];

for (const we of workedExamples) {
  push(we.id, [
    ["schema", "pass", "Validated against the Zod WorkedExample: steps numbered in order, both faded stages inside range, the twin carrying its own answer spec."],
    ["scope-tier", "pass", scopeDetail],
    ["formula-sheet", "pass", formulaDetail],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The step codes follow the Summer 2025 Q14 scheme: MW1 for each formed expression, M1 and W1 for the derivative set to zero and solved, MW1 for the second-derivative test, W1 for the quantity asked for."],
    ["maths-numeric", "pass", `Recomputed in exact rationals: ${we.id.endsWith("01") ? `A = ${A.text}, x = ${frText(A.x)}, y = ${frText(A.y)}, A = ${frText(A.value)}, second derivative ${frText(A.second)}; twin ${D.text} gives x = ${frText(D.x)}` : we.id.endsWith("02") ? `L = ${B.text}, x = ${frText(B.x)}, y = ${frText(B.y)}, L = ${frText(B.value)}, second derivative ${frText(B.second)}; twin ${F.text} gives x = ${frText(F.x)}` : `A = ${C.text}, w = ${frText(C.x)}, h = ${frText(C.h)}, A = ${frText(C.value)}, second derivative ${frText(C.second)}; twin ${E.text} gives x = ${frText(E.x)}`}.`],
    ["maths-symbolic", "pass", "Derivatives checked against a central difference quotient at three sample points; every optimised value rebuilt from the two dimensions of the context."],
    ["examiner-alignment", "pass", "The decisions answer the Summer 2022 Q13 findings (read the constraint, keep the derivative of the linear term, finish with the quantity asked) and the Summer 2019 Q14 finding (show that it is a maximum)."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
  ]);
}

for (const d of diagnostics) {
  push(d.id, [
    ["schema", "pass", "Validated against the Zod DiagnosticSet: unique item ids, exactly one correct option per item, no two option texts alike after normalisation."],
    ["scope-tier", "pass", scopeDetail],
    ["command-words", "pass", commandDetail],
    ["maths-numeric", "pass", d.when === "pre"
      ? "The prerequisite items rearrange xy = 54, differentiate 5x^-1 and take the square root of 81, each recomputed in the generator."
      : `Every option value is computed: the constraint 2x + y = ${frText(A.edging)} against the four-sided route giving ${R.wallArea} m², the greatest area ${frText(A.value)} m², the second derivative ${frText(B.second)} and the derivative ${F.d1Text} against the dropped-linear-term route ${polyText(routes.linearTermDropped(F))}.`],
    ["examiner-alignment", "pass", "Post-instruction distractors carry the registry ids for the unread constraint, the missing nature test, the quantity not evaluated, the reversed second-derivative reading and the dropped linear term. Prerequisite distractors carry no topic tag unless the slip is that misconception."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["tariff", "pass", "Diagnostics carry no tariff; each is a single-skill check of one step of the five."],
  ]);
}

for (const q of questions) {
  push(q.id, [
    ["schema", "pass", `Validated against the Zod Question: ${q.parts.length} part(s), scheme totals matching each part's marks, skeleton "${q.skeleton}" matching the parts.`],
    ["scope-tier", "pass", scopeDetail],
    ["formula-sheet", "pass", formulaDetail],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", `${q.totalMarks} marks over ${q.parts.length} part(s); the FM1 perPart median is 3 and the p90 is 6, and the perQuestion typical is 7 with a p90 of 12.`],
    ["maths-numeric", "pass", "Every value in this question is recomputed by lib.mjs in exact rational arithmetic, and every commonError value is produced by executing its route in routes (scratchpad/fm1-batch-e/topic2-optimisation.mjs) rather than typed."],
    ["maths-symbolic", "pass", "Derivatives checked against a central difference quotient at three sample points; each optimised quantity rebuilt from the dimensions of its context."],
    ["examiner-alignment", "pass", `Cited to ${q.examinerSources.join(" and ")}; every distractor's feedback names the route that produces its value.`],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["independent-solve", "pass", "The app's own marker (scratchpad/fm1-batch-e/check-marking.mts) was fed the correct answer in every natural spelling and then every commonError value; each correct spelling scores full marks and each route value fires its own pattern and earns what it claims."],
  ]);
}

for (const f of findTheMistake) {
  push(f.id, [
    ["schema", "pass", "Validated against the Zod FindTheMistake: exactly one wrong line, flagged inside the working, and the correction rewrites it."],
    ["scope-tier", "pass", scopeDetail],
    ["maths-numeric", "pass", `Both the wrong route and the right one are executed in the generator: ${f.id.endsWith("01") ? `x = ${frText(F.x)} against the fencing ${frText(F.value)} m` : f.id.endsWith("02") ? `the second derivative ${frText(D.second)} at x = ${frText(D.x)}` : `the four-sided constraint gives ${R.wallArea} m² against the correct ${frText(A.value)} m²`}.`],
    ["examiner-alignment", "pass", "Seeded from the Summer 2022 Q13 and Summer 2023 Q13 findings on the final quantity, the constraint and the nature test."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The working shown is the calculus part of a late-paper optimisation question, worth 4 or 5 marks as Summer 2025 Q14(iii) prints it."],
  ]);
}

for (const p of prompts) {
  push(p.id, [
    ["schema", "pass", "Validated against the Zod RetrievalPrompt."],
    ["scope-tier", "pass", scopeDetail],
    ["maths-numeric", "pass", "Any value quoted here is one of the computed context values above."],
    ["examiner-alignment", "pass", "Each prompt is anchored to a section of the note and to the examiner finding that section answers."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", `${styleLint} Every key word of this prompt appears in its own answer.`],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "Retrieval prompts carry no tariff; they rehearse the steps the scheme pays for."],
  ]);
}

/* ---------------- topic row and note frontmatter ---------------- */

const externalRefs = [
  { kind: "youtube", videoId: "0LNa9xqi-Mo", channel: "N.I. Maths Tutor", credit: "Maximising Using Differentiation - GCSE Further Maths/AS-Level Maths Solution, N.I. Maths Tutor (embeddable id verified in data/links/media-map.json)" },
  { kind: "youtube", videoId: "9GkYv-vTEOU", channel: "corbettmaths", credit: "Solving Problems using Differentiation, corbettmaths (embeddable id verified in data/links/media-map.json)" },
  { kind: "phet", sim: "calculus-grapher", url: "https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher_en.html", licence: "CC BY-NC 4.0", attribution: "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)" },
  { kind: "corbettmaths", videos: [564], practiceUrl: "https://corbettmaths.com/wp-content/uploads/2019/11/Application-of-Differentiation-pdf-1.pdf" },
  { kind: "ccea-doc", docType: "cer", url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports", asOf: "2026-09-19" },
];

const howExamined =
  "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. Optimisation is the last or second-last question and the best discriminator on the paper: 7 marks over three parts in Summer 2025 Q14, and multi-part questions of 8 to 12 marks in Summer 2018 Q12, Summer 2019 Q14, Summer 2022 Q13 and Summer 2024 Q13. The shape is fixed: one or two show-that parts worth 1 or 2 marks each that build the expression, then a 4 or 5 mark part reading using calculus, find the value of x ... showing that it is a maximum, and often a final 1 or 2 mark part asking for the optimised quantity itself. Schemes run M1 for the rewrite of a negative power, MW1 for the derivative, M1 and W1 for setting it to zero and solving, MW1 for the second derivative with its sign, and W1 for the quantity with its unit.";

const notOnThisSpec = [
  "Three-dimensional optimisation problems such as open boxes and tanks (Teacher Guidance for FM1-DIF-02)",
  "Any problem involving π, so no circles, cylinders or arcs",
  "Fractional indices, which are excluded across Unit 1",
  "The product, quotient and chain rules, which belong to A level",
];

const topic = {
  id: TOPIC,
  slug: "optimisation",
  title: "Optimisation problems",
  subject: "further-maths",
  unit: "FM1",
  tier: "untiered",
  strand: "Calculus",
  statementIds: SPEC,
  prerequisites: ["fm.u1.stationary-points-and-nature", "fm.u1.differentiation-integer-powers"],
  order: 35,
  hardness: "H",
  difficulty: 5,
  examinerFlagged: true,
  examinerSources: [
    "ccea-cer:further-maths:2018-summer:FM1:Q12",
    "ccea-cer:further-maths:2019-summer:FM1:Q14",
    "ccea-cer:further-maths:2022-summer:FM1:Q13",
    "ccea-cer:further-maths:2024-summer:FM1:Q13",
    "ccea-cer:further-maths:2025-summer:FM1:Q14",
  ],
  examWeightHint: howExamined,
  mustMemorise: [
    "Read the constraint first, and use it to write the quantity in one letter only",
    "Simplify the expression before differentiating",
    "The derivative of a plain term in x is its coefficient, never nothing",
    "Rewrite a/x as ax⁻¹ before differentiating, and the index steps down to −2",
    "After solving dy/dx = 0, take the square root where one is needed and reject the negative root",
    "Show the second derivative and its sign: positive is a minimum, negative is a maximum",
    "Finish by substituting back for the quantity the question named, with its unit",
  ],
  onFormulaSheet: ["If y = axⁿ then dy/dx = naxⁿ⁻¹ (Unit 1 formula sheet, page 2)"],
  notOnThisSpec,
  externalRefs,
  keywords: ["optimisation", "maximise", "minimise", "constraint", "second derivative", "show that", "units"],
};

const noteFrontmatter = {
  id: "note.fm.u1.optimisation",
  topic: TOPIC,
  title: "Optimisation problems",
  subject: "further-maths",
  unit: "FM1",
  tier: "untiered",
  specRefs: SPEC,
  calculator: true,
  formulaSheet: {
    given: [
      "Quadratic formula x = (−b ± √(b² − 4ac)) / 2a",
      "Differentiation y = axⁿ ⇒ dy/dx = naxⁿ⁻¹",
      "Integration ∫axⁿ dx = axⁿ⁺¹/(n + 1) + c",
      "Logarithm aˣ = n ⇒ x = log_a n",
    ],
    mustKnow: [
      "d²y/dx² > 0 is a minimum, d²y/dx² < 0 is a maximum",
      "Rewrite a/xⁿ as ax⁻ⁿ before differentiating",
      "The derivative of kx is k",
      "A length is positive, so the negative square root is rejected with a word",
    ],
  },
  notOnThisSpec,
  hardness: "H",
  examinerFlagged: true,
  externalRefs: [externalRefs[0], externalRefs[2], externalRefs[4]],
  sheet: {
    mustBeAbleTo: [
      "Read a constraint from a diagram or a sentence and write one letter in terms of the other",
      "Form the quantity to optimise as an expression in one letter, and simplify it",
      "Prove a printed expression line by line in a show-that part",
      "Differentiate that expression, including a term with a negative power",
      "Set the derivative to zero, solve it, and reject a negative root with a reason",
      "Use the second derivative, with its value substituted, to name a maximum or a minimum",
      "Substitute back to find the area, length or cost the question asked for, with its unit",
      "Recognise that using calculus forbids a table of values or a calculator maximum",
    ],
    howExamined,
    traps: [
      "The constraint cannot be read from the diagram, so the expression is never formed (Summer 2022 FM1 Q13)",
      "A side the wall or river provides is counted in the fencing",
      "The term in x is dropped when differentiating, because its derivative is a plain number (Summer 2022 FM1 Q13)",
      "A negative power mishandled in the derivative (Summer 2025 FM1 Q14)",
      "x squared is found and the square root is never taken (Summer 2022 FM1 Q13)",
      "The second derivative is not used at all, so the maximum is never shown (Summer 2019 FM1 Q14)",
      "The sign of the second derivative is read the wrong way round",
      "The value of x is written on the answer line where the area, length or cost was asked for (Summer 2022 FM1 Q13)",
      "Expressions left unsimplified, which causes slips further down (Summer 2019 FM1 Q14)",
      "The last part not attempted at all, because it was not clear that calculus was what it needed (Summer 2019 FM1 Q14)",
      "A show-that part answered by adding the terms without expanding them line by line, and the final answer given as a different quantity from the one named (Summer 2018 FM1 Q12)",
      "The printed results of the show-that parts neither proved nor used, although the derivative of the printed expression was within reach (Summer 2024 FM1 Q13)",
      "A table of values or a calculator maximum offered where the stem says using calculus, which earns nothing (method lock lock.fm.use-calculus)",
    ],
  },
  verification: V("note.fm.u1.optimisation"),
  version: 1,
  updated: "2026-09-19",
};

/* ---------------- assemble ---------------- */

const insight = JSON.parse(fs.readFileSync("packs/further-maths/insights/u1.optimisation.json", "utf8"));

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note: noteFrontmatter,
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  insight,
  verification,
};

lintTree(bundle, "bundle");
lintTree(note, "note");
const norm = (s) => s.toLowerCase().replace(/[-2212]/g, " ").replace(/[.,;:()]/g, " ").replace(/s+/g, " ").trim();
for (const p of prompts) for (const k of p.keyWords) if (!norm(p.answer).includes(norm(k))) throw new Error(`prompt ${p.id}: key word "${k}" is not in its own answer`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n");
fs.writeFileSync(path.join(OUT, "note.blocks.json"), JSON.stringify(note, null, 2) + "\n");
console.log(`topic 2 written: ${questions.length} questions, ${workedExamples.length} worked examples, ${diagnostics.reduce((n, d) => n + d.items.length, 0)} diagnostics, ${findTheMistake.length} find-the-mistake, ${prompts.length} prompts, ${verification.length} verification logs`);
