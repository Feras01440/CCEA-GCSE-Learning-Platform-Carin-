/** FM1 batch E, topic 3 emit: bundle.json + note.blocks.json for integration-as-inverse. */
import fs from "node:fs";
import path from "node:path";
import {
  fr, frLatex, frText, num, add, sub, mul, div, neg,
  poly, terms, polyFrom, polyDeriv, polyEval, polyLatex, polyText,
  svgFigure, lintTree, verLog, PAPER,
} from "./lib.mjs";
import {
  note, routes, W1, W2, W3, X1, X2, X3, X4,
  P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11,
  inverseCard, ruleCard, negativeCard, familySvg, pickedSvg, pickedPlainSvg,
} from "./topic3-integration.mjs";

const OUT = path.resolve("packs/further-maths/content/fm1/integration-as-inverse");
const TOPIC = "fm.u1.integration-as-inverse";
const SPEC = ["FM1-INT-01", "FM1-INT-02"];
const V = (id) => `ver.${id}`;
const qid = (n) => `q.fm.u1.integration-as-inverse.${String(n).padStart(4, "0")}`;

const plusC = (p) => `${polyLatex(p)} + c`;
const intSpec = (p) => ({ kind: "algebraic", latex: plusC(p), equivalence: "equivalent", variables: ["x", "c"] });
const curveSpec = (p) => ({ kind: "algebraic", latex: `y = ${polyLatex(p)}`, equivalence: "equivalent", variables: ["x", "y"] });
const numSpec = (v) => ({ kind: "numeric", value: num(v), tolerance: { type: "absolute", value: 0.005 }, unitRequired: false, acceptForms: ["decimal", "fraction"] });

const USE_C = "Use $c$ for the constant of integration.";

/* ---------------- shared prose ---------------- */

const scopeDetail =
  "FM1 is untiered and calculator-allowed. Every integrand here is a sum of terms ax^n with n a whole number other than -1, which is exactly FM1-INT-02; the excluded power -1 never appears, no fractional index appears, and no definite integral is evaluated (that belongs to FM1-INT-03).";
const formulaDetail =
  "The Unit 1 sheet gives the integral of ax^n as ax^(n+1)/(n+1) + c for n not equal to -1 (packs/further-maths/exam-true/formula-sheets.json, fs.fm1.integration), and the note quotes it. What is not on the sheet, and is taught here as must-know, is that a constant k integrates to kx, that a/x^n has to be rewritten as ax^-n first, and that a point on the curve fixes c.";
const commandDetail =
  "Find and Express are both in packs/further-maths/exam-true/command-words.json with typical tariffs 2-3-5 and 1-2-4; the FM1 perPart median is 3 and the p90 is 6 (tariffs.json). The stems use the paper's own wordings: find the integral, express y in terms of x, and find y in terms of x given a point.";
const shingle =
  "Compared by hand against the FM1 question papers and mark schemes read for this batch (Summer 2018 Q2, Summer 2019 Q3 and Q13, Summer 2022 Q2, Summer 2023 Q1 and Q2, Summer 2024 Q1, Summer 2025 Q6 and Q11) and the Chief Examiner reports for those series. Every integrand, point, coefficient, sentence and figure here is new, and no eight-word sequence is shared with any paper, scheme or report.";
const styleLint =
  "British English, second person, calm; no exclamation marks; the banned verdict word is never used about a learner's answer. Every maths segment opens and closes inside one line and holds no prose words, checked by lintString before the files were written.";

/* ---------------- worked examples ---------------- */

const we1 = {
  id: "we.fm.u1.integration-as-inverse.01",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `Find $\\int \\left(${W1.dLatex}\\right) dx$`,
  figure: svgFigure(ruleCard, "A four-row card giving the integration rule: raise the power, divide by the new power, add the constant, and turn a constant term into a term in x"),
  steps: [
    {
      n: 1,
      working: `Take the first term. $6x^{2}$ raises to $x^{3}$, and $6 \\div 3 = 2$, giving $2x^{3}$.`,
      decision: "Raise the power first, then divide by the power you have just made. Dividing by the old power is the commonest slip in this topic.",
      whyMenu: {
        options: ["Because you divide by the NEW power, which is 3", "Because you divide by the old power, which is 2", "Because you multiply by the new power"],
        correct: 0,
        explain: "Differentiating x cubed brings a 3 out in front, so dividing by 3 is what cancels it when you go the other way.",
      },
      earns: ["MW1"],
    },
    {
      n: 2,
      working: `$-4x$ is $-4x^{1}$. It raises to $x^{2}$, and $-4 \\div 2 = -2$, giving $-2x^{2}$.`,
      decision: "A plain term in x has power 1, so its new power is 2. Keeping the sign with the coefficient throughout avoids the usual second-term slip.",
      earns: ["MW1"],
    },
    {
      n: 3,
      working: `$5$ is $5x^{0}$. It raises to $x^{1}$, and $5 \\div 1 = 5$, giving $5x$.`,
      decision: "A constant is not left alone. It becomes a term in x, which is exactly the term that would differentiate back to it.",
      earns: ["MW1"],
    },
    {
      n: 4,
      working: `Add the constant of integration: $\\int \\left(${W1.dLatex}\\right) dx = ${W1.baseLatex} + c$.`,
      decision: "Without a point to pin it down, the height is unknown, so the answer is a family of curves and the letter says so. The integral sign is dropped now that the integrating is done.",
      earns: ["W1"],
    },
  ],
  finalAnswer: `$${W1.baseLatex} + c$`,
  twin: {
    stem: `Find $\\int \\left(${P3.dLatex}\\right) dx$. ${USE_C}`,
    answer: intSpec(P3.base),
  },
  faded: [
    { showSteps: 2, studentSupplies: [3, 4] },
    { showSteps: 1, studentSupplies: [2, 3, 4] },
  ],
  verification: V("we.fm.u1.integration-as-inverse.01"),
  version: 1,
};

const we2 = {
  id: "we.fm.u1.integration-as-inverse.02",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `The gradient function of a curve is $\\frac{dy}{dx} = ${W2.dLatex}$, and the curve passes through the point $(${frText(W2.px)}, ${frText(W2.py)})$.\nExpress $y$ in terms of $x$.`,
  figure: svgFigure(pickedPlainSvg, `A curve drawn on labelled axes, passing through the point (${frText(W2.px)}, ${frText(W2.py)}), with its equation not given`),
  steps: [
    {
      n: 1,
      working: `The gradient function is given, so $y$ is found by integrating: $y = ${W2.baseLatex} + c$.`,
      decision: "The word gradient describes what has been handed to you, not what to do with it. The differentiating has already happened, so the move here is backwards.",
      whyMenu: {
        options: ["Because dy/dx is given and y is wanted", "Because the word gradient means differentiate", "Because the point must be substituted first"],
        correct: 0,
        explain: "Look at what the question gives and what it wants. Given the derivative and asked for the curve, you integrate.",
      },
      earns: ["MW1", "MW2"],
    },
    {
      n: 2,
      working: `Substitute the point: $x = ${frText(W2.px)}$ and $y = ${frText(W2.py)}$ give $${frText(W2.baseAtPoint)} + c = ${frText(W2.py)}$.`,
      decision: "The point goes into the integrated expression, never into the gradient function. The gradient function knows nothing about height.",
      earns: ["M1"],
    },
    {
      n: 3,
      working: `So $c = ${frText(W2.c)}$.`,
      decision: "One point is exactly enough: the family of curves has one unknown, and one equation settles it.",
      earns: ["W1"],
    },
    {
      n: 4,
      working: `Write the curve as one equation: $y = ${W2.curveLatex}$.`,
      decision: "The value of c goes inside the equation. Writing it beside the answer, or leaving the letter in place, loses the final mark.",
      earns: ["W2"],
    },
  ],
  finalAnswer: `$y = ${W2.curveLatex}$`,
  twin: {
    stem: `The gradient function of a curve is $\\frac{dy}{dx} = ${P8.dLatex}$, and the curve passes through $(${frText(P8.px)}, ${frText(P8.py)})$.\nExpress $y$ in terms of $x$.`,
    answer: curveSpec(P8.curve),
  },
  faded: [
    { showSteps: 2, studentSupplies: [3, 4] },
    { showSteps: 1, studentSupplies: [2, 3, 4] },
  ],
  verification: V("we.fm.u1.integration-as-inverse.02"),
  version: 1,
};

const we3 = {
  id: "we.fm.u1.integration-as-inverse.03",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `A curve has $\\frac{dy}{dx} = ${W3.dLatex}$ and passes through the point $(${frText(W3.px)}, ${frText(W3.py)})$.\nFind an expression for $y$.`,
  figure: svgFigure(negativeCard, "A four-row card taking a term with a negative power through the rewrite, the raised index, the division and the answer written back over the line"),
  steps: [
    {
      n: 1,
      working: `Rewrite the fraction as a power: $\\frac{12}{x^{3}} = 12x^{-3}$.`,
      decision: "The rule only speaks about powers of x, so anything under a line comes up as a negative index before anything else happens.",
      earns: ["M1"],
    },
    {
      n: 2,
      working: `$8x^{3}$ raises to $x^{4}$ and $8 \\div 4 = 2$, giving $2x^{4}$. The constant $-5$ becomes $-5x$.`,
      decision: "Two ordinary terms, done the ordinary way. Finish each one before moving on.",
      earns: ["MW1"],
    },
    {
      n: 3,
      working: `$12x^{-3}$ raises to $x^{-2}$, and $12 \\div -2 = -6$, giving $-6x^{-2}$, which is $-\\frac{6}{x^{2}}$.`,
      decision: "The index goes up, so -3 becomes -2, and the new power is negative, which is where the sign of the answer comes from.",
      whyMenu: {
        options: ["Because the new power is -2 and dividing by it changes the sign", "Because the index goes down to -4", "Because the sign of the coefficient never changes"],
        correct: 0,
        explain: "Raising -3 by one gives -2. Dividing a positive 12 by a negative 2 gives -6.",
      },
      earns: ["W1"],
    },
    {
      n: 4,
      working: `So $y = ${W3.baseLatex} + c$.`,
      decision: "Collect the three terms and add the constant. The negative power can stay as an index or go back over the line, and CCEA prints it over the line.",
      earns: ["W2"],
    },
    {
      n: 5,
      working: `Substitute $(${frText(W3.px)}, ${frText(W3.py)})$: $${frText(W3.baseAtPoint)} + c = ${frText(W3.py)}$, so $c = ${frText(W3.c)}$ and $y = ${W3.curveLatex}$.`,
      decision: `A quick check: putting $x = ${frText(W3.px)}$ into the finished curve gives $${frText(W3.py)}$, which is the point you were given.`,
      earns: ["M1", "W3"],
    },
  ],
  finalAnswer: `$y = ${W3.curveLatex}$`,
  twin: {
    stem: `Find $\\int \\left(${P6.dLatex}\\right) dx$. ${USE_C}`,
    answer: intSpec(P6.base),
  },
  faded: [
    { showSteps: 3, studentSupplies: [4, 5] },
    { showSteps: 1, studentSupplies: [2, 3, 4, 5] },
  ],
  verification: V("we.fm.u1.integration-as-inverse.03"),
  version: 1,
};

/* ---------------- diagnostics ---------------- */

const dxPre = {
  id: "dx.fm.u1.integration-as-inverse.pre",
  topic: TOPIC,
  specRefs: SPEC,
  when: "pre",
  items: [
    {
      id: "p1",
      stem: "Three checks on what this lesson is built from. None of them is the new method, so answer from what you already know.\nDifferentiate $y = 2x^{3}$.",
      skill: "Differentiate a single power of x",
      options: [
        { id: "a", text: "$6x^{2}$", correct: true, feedback: "Multiply by the power and step the power down. Integration is about to run this backwards." },
        { id: "b", text: "$2x^{2}$", correct: false, feedback: "The power steps down, and the coefficient is also multiplied by that power, so the $2$ becomes $6$." },
        { id: "c", text: "$6x^{3}$", correct: false, feedback: "The coefficient is right. The power has to step down as well, from $3$ to $2$." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "Write $\\frac{6}{x^{3}}$ using a single power of $x$.",
      skill: "Move a power from under the line to a negative index",
      options: [
        { id: "a", text: "$6x^{-3}$", correct: true, feedback: "A power under the line changes sign as it comes up. That rewrite is what lets the integration rule reach the term." },
        { id: "b", text: "$6x^{3}$", correct: false, feedback: "Crossing the line changes the sign of the index, so the $3$ becomes $-3$." },
        { id: "c", text: "$-6x^{3}$", correct: false, feedback: "The sign that changes belongs to the index, not to the coefficient. The $6$ stays positive." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p3",
      stem: "What is $12 \\div -2$?",
      skill: "Divide by a negative number",
      options: [
        { id: "a", text: "$-6$", correct: true, feedback: "A positive divided by a negative is negative. This exact division appears whenever a negative power is integrated." },
        { id: "b", text: "$6$", correct: false, feedback: "The sign of a quotient follows the signs of the two numbers, and here one of them is negative." },
        { id: "c", text: "$-24$", correct: false, feedback: "That is $12 \\times -2$. The question divides." },
      ],
      secondsExpected: 15,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

const dxPost = {
  id: "dx.fm.u1.integration-as-inverse.post",
  topic: TOPIC,
  specRefs: SPEC,
  when: "post",
  items: [
    {
      id: "d1",
      stem: "What is $\\int 6x^{2}\\,dx$?",
      skill: "Integrate a single power of x",
      options: [
        { id: "a", text: "$2x^{3} + c$", correct: true, feedback: "The power rises to $3$ and $6 \\div 3 = 2$." },
        { id: "b", text: `$${polyLatex(routes.notDivided(gradientOf({ 2: 6 })))} + c$`, correct: false, misconception: "fm.int.coefficient-not-divided", feedback: "The power has risen correctly. The coefficient still has to be divided by that new power of $3$." },
        { id: "c", text: `$${polyLatex(routes.dividedByOriginalPower(gradientOf({ 2: 6 })))} + c$`, correct: false, misconception: "fm.int.divided-by-original-power", feedback: "The division has used the old power of $2$. It is the new power, $3$, that the coefficient is divided by." },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: `A candidate writes $\\int \\left(${P3.dLatex}\\right) dx = ${P3.baseLatex}$. What is missing?`,
      skill: "Remember the constant of integration",
      options: [
        { id: "a", text: "$+ c$", correct: true, feedback: "Every indefinite integral ends with the constant, because a constant differentiates away and cannot be recovered." },
        { id: "b", text: "Nothing; the answer is complete", correct: false, misconception: "fm.int.constant-omitted", feedback: "The integrating is right and the answer is one mark short. Without a point to fix it, the height is unknown, so $+ c$ belongs there." },
        { id: "c", text: "The integral sign in front of the answer", correct: false, misconception: "fm.int.constant-omitted", feedback: "The integral sign is dropped once the integrating is done; keeping it says the work is unfinished. What is missing is the constant." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: `A question reads: the gradient function of a curve is $\\frac{dy}{dx} = ${P7.dLatex}$ and the curve passes through $(${frText(P7.px)}, ${frText(P7.py)})$. Find the equation of the curve. What is the first move?`,
      skill: "Choose the direction from what the question gives",
      options: [
        { id: "a", text: `Integrate $${P7.dLatex}$`, correct: true, feedback: "The derivative is given and the curve is wanted, so the journey is backwards." },
        { id: "b", text: `Differentiate $${P7.dLatex}$`, correct: false, misconception: "fm.int.gradient-word-triggers-differentiation", feedback: `The word gradient describes what you have been handed, not what to do with it. Differentiating would give $${polyLatex(routes.differentiatedInstead(P7))}$, which is the second derivative.` },
        { id: "c", text: "Use $y = mx + c$ with the given point", correct: false, misconception: "fm.int.gradient-word-triggers-differentiation", feedback: "That formula is for a straight line of constant gradient. Here the gradient changes with $x$, so the curve is not a line." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: `What is $\\int ${P6.dLatex}\\,dx$?`,
      skill: "Integrate a negative power",
      options: [
        { id: "a", text: `$${P6.baseLatex} + c$`, correct: true, feedback: "The index rises from $-3$ to $-2$, and $6 \\div -2 = -3$." },
        { id: "b", text: `$${polyLatex(routes.dividedByOriginalPower(P6))} + c$`, correct: false, misconception: "fm.int.divided-by-original-power", feedback: "The index has risen correctly. The division has used the old index $-3$ rather than the new one $-2$." },
        { id: "c", text: `$${polyLatex(routes.powerNotRaised(P6))} + c$`, correct: false, misconception: "fm.int.power-not-raised", feedback: "The division by $-2$ is right, so the new power was worked out. The index itself still has to rise from $-3$ to $-2$." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d5",
      stem: `A curve has $\\frac{dy}{dx} = ${P7.dLatex}$, so $y = ${P7.baseLatex} + c$, and it passes through $(${frText(P7.px)}, ${frText(P7.py)})$. Which substitution finds $c$?`,
      skill: "Substitute the point into the integrated expression",
      options: [
        { id: "a", text: `$${frText(P7.baseAtPoint)} + c = ${frText(P7.py)}$`, correct: true, feedback: `Putting $x = ${frText(P7.px)}$ into the integrated expression and setting it equal to $y$ gives $c = ${frText(P7.c)}$.` },
        { id: "b", text: `$${frText(polyEval(P7.d, P7.px))} + c = ${frText(P7.py)}$`, correct: false, misconception: "fm.int.point-substituted-into-gradient", feedback: "That value came from the gradient function. The gradient function says nothing about height, so the point belongs in the integrated expression." },
        { id: "c", text: `$c = ${frText(P7.py)}$`, correct: false, misconception: "fm.int.constant-omitted", feedback: "That would only be true if the rest of the expression were zero at that point. Work out the integrated terms at $x = 2$ first." },
      ],
      secondsExpected: 40,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

/** A tiny helper so the diagnostic options above can build a one-term gradient function. */
function gradientOf(obj) {
  return { d: polyFrom(obj) };
}

/* ---------------- question builder ---------------- */

const mkQ = (n, opts) => ({
  id: qid(n),
  topic: TOPIC,
  specRefs: SPEC,
  tier: "untiered",
  paper: PAPER,
  style: opts.style ?? "practice",
  difficulty: opts.difficulty ?? 3,
  ao: opts.ao ?? ["AO1"],
  commandWords: opts.commandWords,
  emphasis: opts.emphasis ?? [],
  context: { setting: opts.setting, original: true },
  figures: opts.figures ?? [],
  parts: opts.parts,
  totalMarks: opts.parts.reduce((s, p) => s + p.marks, 0),
  timeAllowanceSec: Math.round(opts.parts.reduce((s, p) => s + p.marks, 0) * 72),
  skeleton: opts.skeleton,
  examinerSources: opts.examinerSources,
  solutionProgram: opts.solutionProgram,
  verification: V(qid(n)),
  version: 1,
});

/** A plain "find the integral" question with the three routes that can go wrong. */
function integralQ(n, g, marks, { difficulty = 2, extraErrors = [] } = {}) {
  const errs = [
    {
      misconception: "fm.int.constant-omitted",
      pattern: { kind: "algebraic", latex: polyLatex(routes.constantOmitted(g)) },
      feedback: "Every term is integrated correctly. The constant of integration is missing: without a point to fix the height, the answer is a family of curves, so it ends with $+ c$.",
      marksTypicallyEarned: Math.max(0, marks - 1),
      source: "ccea-cer:further-maths:2022-summer:FM1:Q2",
    },
    {
      misconception: "fm.int.coefficient-not-divided",
      pattern: { kind: "algebraic", latex: plusC(routes.notDivided(g)) },
      feedback: "Each power has risen by one, which is the first half of the rule. The coefficient then has to be divided by that new power.",
      marksTypicallyEarned: Math.max(0, marks - 2),
      source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
    },
    {
      misconception: "fm.int.divided-by-original-power",
      pattern: { kind: "algebraic", latex: plusC(routes.dividedByOriginalPower(g)) },
      feedback: "The powers have risen correctly and the division has used the power you started with. It is the new power that the coefficient is divided by.",
      marksTypicallyEarned: Math.max(0, marks - 2),
      source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
    },
    ...extraErrors,
  ];
  const seen = new Set();
  const unique = errs.filter((e) => {
    const k = e.pattern.latex.replace(/\s+/g, "");
    if (seen.has(k) || k === plusC(g.base).replace(/\s+/g, "")) return false;
    seen.add(k);
    return true;
  });
  return mkQ(n, {
    commandWords: ["Find"],
    difficulty,
    setting: "A plain indefinite integral of the kind that opens a Unit 1 paper",
    skeleton: `(main)find${marks}`,
    examinerSources: ["ccea-cer:further-maths:2022-summer:FM1:Q2", "ccea-cer:further-maths:2023-summer:FM1:Q2"],
    solutionProgram: `integrate ${g.dText} -> ${g.baseText} + c`,
    parts: [
      {
        id: "main",
        stem: `Find $\\int \\left(${g.dLatex}\\right) dx$\n${USE_C}`,
        marks,
        answer: intSpec(g.base),
        scheme: (() => {
          const hasNeg = terms(g.d).some(([e]) => e < 0);
          const mw = terms(g.d).map(([e], i) => ({
            id: `MW${i + 1}`,
            code: "MW",
            marks: 1,
            for: `$${polyLatex(poly([[e + 1, div(g.d.get(e), fr(e + 1))]]))}$ from the term $${polyLatex(poly([[e, g.d.get(e)]]))}$`,
          }));
          const mwCount = Math.max(1, marks - 1 - (hasNeg ? 1 : 0));
          return [
            ...(hasNeg ? [{ id: "M1", code: "M", marks: 1, for: `writing the term under the line with a negative index` }] : []),
            ...mw.slice(0, mwCount),
            { id: "W1", code: "W", marks: 1, for: `$${g.baseLatex} + c$ complete, with the constant of integration` },
          ];
        })(),
        hints: ["Raise each power by one.", "Then divide each coefficient by the power you have just made.", "The answer ends with $+ c$."],
        workedSolution: `${terms(g.d)
          .map(([e, c]) => `$${polyLatex(poly([[e, c]]))}$ raises to $x^{${e + 1}}$ and $${frText(c)} \\div ${e + 1} = ${frText(div(c, fr(e + 1)))}$, giving $${polyLatex(poly([[e + 1, div(c, fr(e + 1))]]))}$.`)
          .join("\n")}\nSo the integral is $${g.baseLatex} + c$.`,
        commonErrors: unique,
        requiresWorking: true,
      },
    ],
  });
}

/** A "find the curve from its gradient function and a point" question. */
function curveQ(n, g, marks, { difficulty = 4, style = "practice", extraErrors = [] } = {}) {
  const fromGradient = routes.cFromGradient(g);
  const errs = [
    {
      misconception: "fm.int.constant-omitted",
      pattern: { kind: "algebraic", latex: `y = ${polyLatex(routes.cLeftAsLetter(g))} + c` },
      feedback: `The integrating is right. The point $(${frText(g.px)}, ${frText(g.py)})$ is there to fix the constant, so substitute it and write the number in place of the letter.`,
      marksTypicallyEarned: Math.max(0, marks - 2),
      source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
    },
    {
      misconception: "fm.int.point-substituted-into-gradient",
      pattern: { kind: "algebraic", latex: `y = ${polyLatex(fromGradient.curve)}` },
      feedback: `The integrated terms are right. The constant came from substituting into $\\frac{dy}{dx}$, which gives $${frText(polyEval(g.d, g.px))}$ at that point; the substitution belongs in the integrated expression, where it gives $c = ${frText(g.c)}$.`,
      marksTypicallyEarned: Math.max(0, marks - 2),
      source: "ccea-cer:further-maths:2024-summer:FM1:Q1",
    },
    {
      misconception: "fm.int.differentiated-instead",
      pattern: { kind: "algebraic", latex: `y = ${polyLatex(routes.differentiatedInstead(g))}` },
      feedback: `That is $\\frac{d^{2}y}{dx^{2}}$, so the given expression has been differentiated. A gradient function is already a derivative, so recovering $y$ means integrating.`,
      marksTypicallyEarned: 0,
      source: "ccea-cer:further-maths:2025-summer:FM1:Q6",
    },
    ...extraErrors,
  ];
  const seen = new Set();
  const unique = errs.filter((e) => {
    const k = e.pattern.latex.replace(/\s+/g, "");
    if (seen.has(k) || k === `y = ${polyLatex(g.curve)}`.replace(/\s+/g, "")) return false;
    seen.add(k);
    return true;
  });
  return mkQ(n, {
    style,
    commandWords: ["Express", "Find"],
    difficulty,
    ao: ["AO1", "AO2"],
    setting: "A curve recovered from its gradient function and one point on it",
    skeleton: `(main)express${marks}`,
    examinerSources: ["ccea-cer:further-maths:2023-summer:FM1:Q2", "ccea-cer:further-maths:2025-summer:FM1:Q6"],
    solutionProgram: `integrate ${g.dText} -> ${g.baseText} + c; at (${frText(g.px)}, ${frText(g.py)}) c = ${frText(g.c)}; y = ${g.curveText}`,
    parts: [
      {
        id: "main",
        stem: `The gradient function of a curve is $\\frac{dy}{dx} = ${g.dLatex}$, and the curve passes through the point $(${frText(g.px)}, ${frText(g.py)})$.\nExpress $y$ in terms of $x$.`,
        marks,
        answer: curveSpec(g.curve),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: "recognising that the curve is found by integrating" },
          { id: "W1", code: "W", marks: marks - 3, for: `$y = ${g.baseLatex} + c$` },
          { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(g.px)}$ and $y = ${frText(g.py)}$`, dependsOn: ["W1"] },
          { id: "W2", code: "W", marks: 1, for: `$c = ${frText(g.c)}$ and the curve written as $y = ${g.curveLatex}$`, dependsOn: ["M1"], ft: true },
        ],
        hints: ["The gradient function is already a derivative, so integrate it.", "Do not forget $+ c$ at this stage.", "Substitute the point into the integrated expression, then write one equation."],
        workedSolution: `Integrating: $y = ${g.baseLatex} + c$.\nSubstituting $x = ${frText(g.px)}$ and $y = ${frText(g.py)}$: $${frText(g.baseAtPoint)} + c = ${frText(g.py)}$.\nSo $c = ${frText(g.c)}$ and $y = ${g.curveLatex}$.`,
        commonErrors: unique,
        requiresWorking: true,
      },
    ],
  });
}

/* ---------------- practice ---------------- */

const q1 = integralQ(1, P1, 2);
const q2 = integralQ(2, P2, 3);
const q3 = integralQ(3, P3, 2);
const q4 = integralQ(4, P4, 2);
const q5 = integralQ(5, P5, 3, { difficulty: 4 });
const q6 = integralQ(6, P6, 3, { difficulty: 4 });
const q7 = integralQ(7, P9, 3, { difficulty: 4 });
const q8 = integralQ(8, P10, 3, { difficulty: 4 });
const q9 = curveQ(9, P7, 4);
const q10 = curveQ(10, P8, 4);

const q11 = mkQ(11, {
  commandWords: ["Find"],
  difficulty: 2,
  setting: "Finding the constant of integration from a point",
  skeleton: "(main)find2",
  examinerSources: ["ccea-cer:further-maths:2024-summer:FM1:Q1"],
  solutionProgram: `y = 2x^3 + c through (${frText(P11.px)}, ${frText(P11.py)}) -> ${frText(P11.baseAtPoint)} + c = ${frText(P11.py)} -> c = ${frText(P11.c)}`,
  parts: [
    {
      id: "main",
      stem: `A curve has equation $y = ${P11.baseLatex} + c$ and passes through the point $(${frText(P11.px)}, ${frText(P11.py)})$.\nFind the value of $c$.`,
      marks: 2,
      answer: numSpec(P11.c),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(P11.px)}$ and $y = ${frText(P11.py)}$` },
        { id: "W1", code: "W", marks: 1, for: `$c = ${frText(P11.c)}$`, dependsOn: ["M1"] },
      ],
      hints: ["Put both coordinates into the equation.", "Work out the term in $x$ first, then solve for $c$."],
      workedSolution: `Substituting: $2 \\times ${frText(P11.px)}^{3} + c = ${frText(P11.py)}$, so $${frText(P11.baseAtPoint)} + c = ${frText(P11.py)}$.\nTherefore $c = ${frText(P11.c)}$.`,
      commonErrors: [
        {
          misconception: "fm.int.point-substituted-into-gradient",
          pattern: { kind: "numeric", value: num(routes.cFromGradient(P11).c) },
          feedback: `That value comes from substituting into $\\frac{dy}{dx} = ${P11.dLatex}$, which is $${frText(polyEval(P11.d, P11.px))}$ at $x = ${frText(P11.px)}$. The point belongs in the equation of the curve.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2024-summer:FM1:Q1",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q12 = mkQ(12, {
  commandWords: ["Identify"],
  difficulty: 2,
  setting: "Choosing the direction from the wording of a stem",
  skeleton: "(main)identify1",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q6"],
  solutionProgram: `dy/dx given, y wanted -> integrate`,
  parts: [
    {
      id: "main",
      stem: `A question reads: the gradient function of a curve is $\\frac{dy}{dx} = ${P7.dLatex}$, and the curve passes through $(${frText(P7.px)}, ${frText(P7.py)})$. Find the equation of the curve.\nIdentify the correct first step.`,
      marks: 1,
      answer: {
        kind: "mcq",
        shuffle: true,
        options: [
          { id: "a", text: `Integrate $${P7.dLatex}$, then use the point to find $c$`, correct: true, feedback: "The derivative is given and the curve is wanted, so the move is backwards, and the point fixes the constant afterwards." },
          { id: "b", text: `Differentiate $${P7.dLatex}$`, correct: false, misconception: "fm.int.gradient-word-triggers-differentiation", feedback: `That would give $${polyLatex(routes.differentiatedInstead(P7))}$, the second derivative. The word gradient names what you were handed, not what to do with it.` },
          { id: "c", text: `Substitute $x = ${frText(P7.px)}$ into $${P7.dLatex}$`, correct: false, misconception: "fm.int.point-substituted-into-gradient", feedback: "That gives the gradient at the point, which is a useful number in other questions but says nothing about the height of the curve." },
        ],
      },
      scheme: [{ id: "W1", code: "W", marks: 1, for: "integrating the gradient function, then using the point" }],
      hints: ["What has the question given you, and what does it want?", "The gradient function is already a derivative."],
      workedSolution: `The question gives $\\frac{dy}{dx}$ and asks for $y$, so the curve is recovered by integrating.\nThe point $(${frText(P7.px)}, ${frText(P7.py)})$ is then substituted into the integrated expression to find $c$.`,
      commonErrors: [],
      requiresWorking: false,
    },
  ],
});

const q13 = mkQ(13, {
  commandWords: ["Identify"],
  difficulty: 2,
  setting: "Why an indefinite integral carries a constant",
  skeleton: "(main)identify1",
  examinerSources: ["ccea-cer:further-maths:2023-summer:FM1:Q2"],
  solutionProgram: `a constant differentiates to 0, so it cannot be recovered`,
  parts: [
    {
      id: "main",
      stem: "Identify the reason an indefinite integral is written with $+ c$.",
      marks: 1,
      answer: {
        kind: "mcq",
        shuffle: true,
        options: [
          { id: "a", text: "A constant differentiates to zero, so its value cannot be recovered from the gradient function", correct: true, feedback: "Every curve in the family has the same derivative, so the letter holds that place open until a point fixes it." },
          { id: "b", text: "The answer is only an approximation", correct: false, misconception: "fm.int.constant-omitted", feedback: "Integration of a power is exact. The constant is not a margin of error; it is the height the derivative could not remember." },
          { id: "c", text: "$c$ stands for the coefficient of the first term", correct: false, misconception: "fm.int.constant-omitted", feedback: "It stands for an unknown constant term. The coefficients are all determined by the rule." },
        ],
      },
      scheme: [{ id: "W1", code: "W", marks: 1, for: "a constant differentiates to zero, so it cannot be recovered" }],
      hints: ["What happens to a constant when you differentiate?", "Think about the family of curves with the same gradient."],
      workedSolution: `Differentiating removes any constant term, because a constant has no gradient.\nSo every curve $y = f(x) + k$ has the same gradient function, and going backwards cannot tell which one it was. The letter $c$ holds that place until a point on the curve is given.`,
      commonErrors: [],
      requiresWorking: false,
    },
  ],
});

const q14 = curveQ(14, X4, 4);

/* ---------------- exam-style ---------------- */

const exam1 = curveQ(15, X1, 5, { difficulty: 4, style: "exam-style" });

const exam2 = mkQ(16, {
  style: "exam-style",
  commandWords: ["Find"],
  difficulty: 5,
  ao: ["AO1", "AO2"],
  setting: "An integral with a negative power, then the curve through a point",
  skeleton: "(a)find4|(b)find3",
  examinerSources: ["ccea-cer:further-maths:2019-summer:FM1:Q3", "ccea-cer:further-maths:2024-summer:FM1:Q1"],
  solutionProgram: `integrate ${X2.dText} -> ${X2.baseText} + c; at (${frText(X2.px)}, ${frText(X2.py)}) c = ${frText(X2.c)}; y = ${X2.curveText}`,
  parts: [
    {
      id: "a",
      stem: `Find $\\int \\left(${X2.dLatex}\\right) dx$\n${USE_C}`,
      marks: 4,
      answer: intSpec(X2.base),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `writing $\\frac{8}{x^{3}}$ as $8x^{-3}$` },
        { id: "MW1", code: "MW", marks: 1, for: `$x^{5}$ from $5x^{4}$, and $3x$ from $3$` },
        { id: "W1", code: "W", marks: 1, for: `$\\frac{4}{x^{2}}$ from $-\\frac{8}{x^{3}}$`, dependsOn: ["M1"] },
        { id: "W2", code: "W", marks: 1, for: `$${X2.baseLatex} + c$ complete, with the constant of integration`, dependsOn: ["W1"] },
      ],
      hints: ["Rewrite the fraction with a negative index first.", "The index rises, so $-3$ becomes $-2$.", "Dividing by $-2$ changes the sign of that term."],
      workedSolution: `Rewrite: $\\frac{8}{x^{3}} = 8x^{-3}$, so the integrand is $5x^{4} - 8x^{-3} + 3$.\n$5x^{4}$ raises to $x^{5}$ and $5 \\div 5 = 1$, giving $x^{5}$.\n$-8x^{-3}$ raises to $x^{-2}$ and $-8 \\div -2 = 4$, giving $4x^{-2}$, which is $\\frac{4}{x^{2}}$.\n$3$ becomes $3x$.\nSo the integral is $${X2.baseLatex} + c$.`,
      commonErrors: [
        {
          misconception: "fm.int.constant-omitted",
          pattern: { kind: "algebraic", latex: X2.baseLatex },
          feedback: "All three terms are integrated correctly. The constant of integration is missing from the end.",
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q2",
        },
        {
          misconception: "fm.int.divided-by-original-power",
          pattern: { kind: "algebraic", latex: plusC(routes.dividedByOriginalPower(X2)) },
          feedback: "Every index has risen correctly. Each coefficient has then been divided by the index it started from rather than by the new one.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
        },
        {
          misconception: "fm.int.coefficient-not-divided",
          pattern: { kind: "algebraic", latex: plusC(routes.notDivided(X2)) },
          feedback: "The indices are right. The second half of the rule is missing: divide each coefficient by the new power.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: `A curve with $\\frac{dy}{dx} = ${X2.dLatex}$ passes through the point $(${frText(X2.px)}, ${frText(X2.py)})$.\nFind the equation of the curve.`,
      marks: 3,
      answer: curveSpec(X2.curve),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(X2.px)}$ and $y = ${frText(X2.py)}$ into the answer to part (a)`, ft: true },
        { id: "W1", code: "W", marks: 1, for: `$c = ${frText(X2.c)}$`, dependsOn: ["M1"] },
        { id: "W2", code: "W", marks: 1, for: `$y = ${X2.curveLatex}$ written as one equation`, dependsOn: ["W1"] },
      ],
      hints: ["Use the integral from part (a).", `At $x = ${frText(X2.px)}$ the integrated terms come to $${frText(X2.baseAtPoint)}$.`, "Write the value of $c$ inside the equation."],
      workedSolution: `From part (a), $y = ${X2.baseLatex} + c$.\nAt $x = ${frText(X2.px)}$ the integrated terms give $${frText(X2.baseAtPoint)}$, so $${frText(X2.baseAtPoint)} + c = ${frText(X2.py)}$.\nTherefore $c = ${frText(X2.c)}$ and $y = ${X2.curveLatex}$.`,
      commonErrors: [
        {
          misconception: "fm.int.constant-omitted",
          pattern: { kind: "algebraic", latex: `y = ${polyLatex(routes.cLeftAsLetter(X2))} + c` },
          feedback: "The integrating is right and the point has not been used. Substitute it to replace the letter with its number.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
        },
        {
          misconception: "fm.int.point-substituted-into-gradient",
          pattern: { kind: "algebraic", latex: `y = ${polyLatex(routes.cFromGradient(X2).curve)}` },
          feedback: `The constant has been found from $\\frac{dy}{dx}$, which is $${frText(polyEval(X2.d, X2.px))}$ at that point. The point has to go into the integrated expression instead, which gives $c = ${frText(X2.c)}$.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2024-summer:FM1:Q1",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "a", rule: "use-candidate-value" },
    },
  ],
});

const exam3 = mkQ(17, {
  style: "exam-style",
  commandWords: ["Find"],
  difficulty: 5,
  ao: ["AO1", "AO2"],
  setting: "Both directions from one gradient function: the second derivative, then the curve",
  skeleton: "(a)find2|(b)find5",
  examinerSources: ["ccea-cer:further-maths:2024-summer:FM1:Q1", "ccea-cer:further-maths:2025-summer:FM1:Q6"],
  solutionProgram: `dy/dx = ${X3.dText}; d2y/dx2 = ${X3.secondText}; integrate -> ${X3.baseText} + c; at (${frText(X3.px)}, ${frText(X3.py)}) c = ${frText(X3.c)}; y = ${X3.curveText}`,
  parts: [
    {
      id: "a",
      stem: `Given that $\\frac{dy}{dx} = ${X3.dLatex}$\nfind an expression for $\\frac{d^{2}y}{dx^{2}}$.`,
      marks: 2,
      answer: { kind: "algebraic", latex: X3.secondLatex, equivalence: "equivalent", variables: ["x"] },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$18x$ from $9x^{2}$, and $0$ from the constant` },
        { id: "W1", code: "W", marks: 1, for: `$${X3.secondLatex}$ complete` },
      ],
      hints: ["This part goes forwards, so differentiate.", "Rewrite $\\frac{8}{x^{3}}$ as $8x^{-3}$ first.", "The index steps down from $-3$ to $-4$."],
      workedSolution: `Rewrite: $\\frac{dy}{dx} = 9x^{2} - 8x^{-3} + 2$.\n$9x^{2}$ gives $18x$; $-8x^{-3}$ gives $-8 \\times -3 \\times x^{-4} = 24x^{-4}$; the constant gives $0$.\nSo $\\frac{d^{2}y}{dx^{2}} = ${X3.secondLatex}$.`,
      commonErrors: [
        {
          misconception: "fm.int.differentiated-instead",
          pattern: { kind: "algebraic", latex: X3.baseLatex },
          feedback: "That is the integral of the given expression. This part asks for the second derivative, so the move here is forwards, not backwards.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "b",
      stem: `Find $y$ in terms of $x$, given that $y = ${frText(X3.py)}$ when $x = ${frText(X3.px)}$.`,
      marks: 5,
      answer: curveSpec(X3.curve),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: "recognising that $y$ is recovered by integrating, not by differentiating again" },
        { id: "MW2", code: "MW", marks: 1, for: `$3x^{3}$ from $9x^{2}$, and $2x$ from $2$` },
        { id: "W1", code: "W", marks: 1, for: `$\\frac{4}{x^{2}}$ from $-\\frac{8}{x^{3}}$` },
        { id: "M1", code: "M", marks: 1, for: `substituting $x = ${frText(X3.px)}$ and $y = ${frText(X3.py)}$ into the integrated expression`, dependsOn: ["W1"] },
        { id: "W2", code: "W", marks: 1, for: `$c = ${frText(X3.c)}$ and $y = ${X3.curveLatex}$`, dependsOn: ["M1"], ft: true },
      ],
      hints: ["Integrate the expression you were given, not the answer to part (a).", "The index rises, so $-3$ becomes $-2$, and dividing by $-2$ changes the sign.", "Then substitute the point and write one equation."],
      workedSolution: `Integrating $9x^{2} - 8x^{-3} + 2$: $9x^{2}$ gives $3x^{3}$; $-8x^{-3}$ raises to $x^{-2}$ and $-8 \\div -2 = 4$, giving $\\frac{4}{x^{2}}$; $2$ gives $2x$.\nSo $y = ${X3.baseLatex} + c$.\nAt $x = ${frText(X3.px)}$ the integrated terms give $${frText(X3.baseAtPoint)}$, so $${frText(X3.baseAtPoint)} + c = ${frText(X3.py)}$ and $c = ${frText(X3.c)}$.\nTherefore $y = ${X3.curveLatex}$.`,
      commonErrors: [
        {
          misconception: "fm.int.differentiated-instead",
          pattern: { kind: "algebraic", latex: `y = ${X3.secondLatex}` },
          feedback: "That is the answer to part (a), the second derivative. To reach $y$ from $\\frac{dy}{dx}$ you integrate.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2024-summer:FM1:Q1",
        },
        {
          misconception: "fm.int.constant-omitted",
          pattern: { kind: "algebraic", latex: `y = ${polyLatex(routes.cLeftAsLetter(X3))} + c` },
          feedback: "Every term is integrated correctly, which is three of the five marks. The point is there to fix the constant, so substitute it and write the number in.",
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
        },
        {
          misconception: "fm.int.point-substituted-into-gradient",
          pattern: { kind: "algebraic", latex: `y = ${polyLatex(routes.cFromGradient(X3).curve)}` },
          feedback: `The constant has come from the gradient function, which is $${frText(polyEval(X3.d, X3.px))}$ at $x = ${frText(X3.px)}$. Substituting into the integrated expression instead gives $c = ${frText(X3.c)}$.`,
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2024-summer:FM1:Q1",
        },
      ],
      requiresWorking: true,
    },
  ],
});

/* ---------------- find the mistake ---------------- */

const ftm1 = {
  id: "ftm.fm.u1.integration-as-inverse.01",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Niamh was asked to find $\\int \\left(${W1.dLatex}\\right) dx$. Her working:`,
  studentWorking: [
    `${W1.dText}`,
    `6x^2 becomes 2x^3`,
    `-4x becomes -2x^2`,
    `5 becomes 5x`,
    `${W1.baseText}`,
  ],
  mistakeLine: 5,
  misconception: "fm.int.constant-omitted",
  whatWentWrong: `Lines 2, 3 and 4 are all correct, and each of them would earn its own mark.\nLine 5 collects them and stops. An indefinite integral has no single answer: every curve $y = ${W1.baseText} + k$ has the gradient function she started from.\nThe constant of integration says so, and its absence costs the final mark.`,
  correction: [`${W1.baseText} + c`],
  marksEarnedAsWritten: ["MW1", "MW2", "MW3"],
  feedback: `The integrating is faultless, and that is most of the marks. One character is missing. A useful habit is to write $+ c$ as soon as you drop the integral sign, before you tidy anything else, so that it is never the thing you run out of time to add. The finished answer is $${W1.baseLatex} + c$.`,
  source: "ccea-cer:further-maths:2022-summer:FM1:Q2",
};

const ftm2 = {
  id: "ftm.fm.u1.integration-as-inverse.02",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Oisín was asked: the gradient function of a curve is $\\frac{dy}{dx} = ${P7.dLatex}$ and the curve passes through $(${frText(P7.px)}, ${frText(P7.py)})$. Find the equation of the curve. His working:`,
  studentWorking: [
    `dy/dx = ${P7.dText}`,
    `d2y/dx2 = ${polyText(routes.differentiatedInstead(P7))}`,
    `y = ${polyText(routes.differentiatedInstead(P7))}x + c`,
    `${frText(P7.py)} = ${frText(mul(fr(6), P7.px))} + c so c = ${frText(sub(P7.py, mul(fr(6), P7.px)))}`,
    `y = ${polyText(routes.differentiatedInstead(P7))}x ${num(sub(P7.py, mul(fr(6), P7.px))) < 0 ? "-" : "+"} ${frText(sub(P7.py, mul(fr(6), P7.px))).replace("-", "")}`,
  ],
  mistakeLine: 2,
  misconception: "fm.int.gradient-word-triggers-differentiation",
  whatWentWrong: `Line 2 differentiates. The word gradient in the stem describes what was handed over, not what to do with it: $\\frac{dy}{dx}$ is already the result of differentiating, so going forwards again reaches the second derivative and moves away from the curve.\nEverything after line 2 is careful work on the wrong expression, which is why the page looks orderly.\nIntegrating instead gives $y = ${P7.baseLatex} + c$, and the point then makes $c = ${frText(P7.c)}$.`,
  correction: [
    `y = ${P7.baseText} + c`,
    `${frText(P7.py)} = ${frText(P7.baseAtPoint)} + c so c = ${frText(P7.c)}`,
    `y = ${P7.curveText}`,
  ],
  marksEarnedAsWritten: [],
  feedback: `The substitution technique in lines 4 and 5 is exactly right, and it will earn its marks once it is applied to the correct expression. Before you start, ask what the question has given you and what it wants: here it gives $\\frac{dy}{dx}$ and wants $y$, which is the backwards journey. The curve is $y = ${P7.curveLatex}$.`,
  source: "ccea-cer:further-maths:2025-summer:FM1:Q6",
};

const ftm3 = {
  id: "ftm.fm.u1.integration-as-inverse.03",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Eabha was asked to find $\\int ${P5.dLatex}\\,dx$. Her working:`,
  studentWorking: [
    `9x^-4`,
    `The new index is -3`,
    `9x^-3 / -4`,
    `= ${polyText(routes.dividedByOriginalPower(P5))} + c`,
  ],
  mistakeLine: 3,
  misconception: "fm.int.divided-by-original-power",
  whatWentWrong: `Line 2 is right: raising $-4$ by one gives $-3$, and the index always rises here.\nLine 3 then divides by $-4$, the index she started from. The rule divides by the **new** power, which is $-3$.\nSo the term is $9x^{-3} \\div -3 = -3x^{-3}$, which is $-\\frac{3}{x^{3}}$.`,
  correction: [`9x^-3 / -3`, `= ${P5.baseText} + c`],
  marksEarnedAsWritten: ["M1"],
  feedback: `Writing the new index on its own line, as in line 2, is a good habit, and it is what makes the slip visible: the number you divide by should be the one you have just written. A quick check settles it either way, since differentiating $-3x^{-3}$ gives $9x^{-4}$ back again. The integral is $${P5.baseLatex} + c$.`,
  source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
};

/* ---------------- retrieval prompts ---------------- */

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.fm.u1.integration-as-inverse.${String(n).padStart(2, "0")}`,
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
  rp(1, "formula", "State the rule for integrating $ax^{n}$.", "Raise the power by one and divide by that new power: $\\frac{ax^{n+1}}{n+1} + c$, provided $n$ is not $-1$.", ["raise", "divide", "new power", "n+1"], 3),
  rp(2, "qa", "Why does an indefinite integral end with $+ c$?", "Because a constant differentiates to zero, so the gradient function cannot say which member of the family of curves it came from.", ["constant", "zero", "family"], 3),
  rp(3, "procedure", "What does a constant term such as $7$ integrate to?", "It becomes $7x$, because $7$ is $7x^{0}$ and raising the power gives $7x^{1}$.", ["7x", "raising the power"], 2),
  rp(4, "procedure", "How do you integrate $\\frac{12}{x^{3}}$?", "Rewrite it as $12x^{-3}$, raise the index to $-2$ and divide by $-2$, giving $-6x^{-2}$.", ["rewrite", "index", "divide", "12x"], 5),
  rp(5, "trap", "You raise a power from $2$ to $3$. Which number do you divide the coefficient by?", "The new power, which is $3$; dividing by the old power of $2$ is the usual slip.", ["new power", "3", "old power"], 4),
  rp(6, "procedure", "You have $y = 3x^{2} + c$ and the curve passes through a point. What do you do?", "Substitute both coordinates into that equation and solve for $c$, then write the curve as one equation with the number in place of the letter.", ["substitute", "solve", "one equation"], 3),
  rp(7, "trap", "Where does the given point go: into the gradient function or into the integrated expression?", "Into the integrated expression, because the gradient function carries no information about height.", ["integrated expression", "gradient function", "height"], 5),
  rp(8, "trap", "A stem says the gradient function of a curve is $\\frac{dy}{dx} = \\ldots$. What does that tell you to do?", "Integrate, because the differentiating has already been done; the word gradient names what you were given.", ["integrate", "differentiating", "given"], 5),
  rp(9, "definition", "Which power cannot be integrated by this rule, and why?", "The power $-1$, because raising it gives zero and the rule would divide by zero; that integral is not on this specification.", ["-1", "zero", "divide"], 3),
];

/* ---------------- verification ---------------- */

const verification = [];
const push = (id, checks) => verification.push(verLog(id, checks));

push("note.fm.u1.integration-as-inverse", [
  ["schema", "pass", `Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, all ${note.filter((b) => b.type === 'gate').length} gate ids are unique and every prompt block names a prompt in this bundle.`],
  ["scope-tier", "pass", scopeDetail],
  ["formula-sheet", "pass", formulaDetail],
  ["command-words", "pass", commandDetail],
  ["tariff", "pass", "The sheet's howExamined records the tariffs read from the papers: a plain integral opened Summer 2018 Q2 and Summer 2022 Q2, Summer 2023 Q2 asked for the curve from its gradient function for 5 marks, Summer 2024 Q1 ran 2 marks then 5, and Summer 2025 Q6 was the same 5-mark shape."],
  ["maths-numeric", "pass", `Every integral in the note is computed by polyInteg in exact rational arithmetic and checked by differentiating it back at three sample points: ${W1.dText} integrates to ${W1.baseText}; ${W2.dText} integrates to ${W2.baseText}, and the point (${frText(W2.px)}, ${frText(W2.py)}) gives c = ${frText(W2.c)} and the curve ${W2.curveText}; ${X4.dText} integrates to ${X4.baseText} with c = ${frText(X4.c)}.`],
  ["maths-symbolic", "pass", "Every printed integral is differentiated back and compared with the integrand at x = 2, 3 and -1.5; every value of c is checked by substituting the point into the finished curve."],
  ["examiner-alignment", "pass", "One examiner callout stands in the teaching body, beside the constant of integration it is about, which is the limit the template allows; every other finding (Summer 2019 Q3, Summer 2022 Q2, Summer 2024 Q1, Summer 2025 Q6) is a trap in note.sheet.traps rather than a callout in the closing panel, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g2 the division by the new power, g2a and g3 the constant, g5 the negative power, g5a and g6 the substitution, g7 the gradient-word trap and g8 the presentation of the finished equation."],
  ["copy-shingle", "pass", shingle],
  ["style-lint", "pass", `${styleLint} The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures drawn from computed values and one embeddable video from data/links/media-map.json followed immediately by a gate.`],
]);

const workedExamples = [we1, we2, we3];
const diagnostics = [dxPre, dxPost];
const questions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, exam1, exam2, exam3];
const findTheMistake = [ftm1, ftm2, ftm3];

for (const we of workedExamples) {
  push(we.id, [
    ["schema", "pass", "Validated against the Zod WorkedExample: steps numbered in order, both faded stages inside range, the twin carrying its own answer spec."],
    ["scope-tier", "pass", scopeDetail],
    ["formula-sheet", "pass", formulaDetail],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The step codes follow the Summer 2023 Q2 and Summer 2024 Q1 schemes: MW1 per integrated term, M1 for the substitution of the point, W1 for the value of c and the finished equation."],
    ["maths-numeric", "pass", `Recomputed and differentiated back: ${we.id.endsWith("01") ? `${W1.dText} integrates to ${W1.baseText}` : we.id.endsWith("02") ? `${W2.dText} integrates to ${W2.baseText}, c = ${frText(W2.c)}, curve ${W2.curveText}` : `${W3.dText} integrates to ${W3.baseText}, c = ${frText(W3.c)}, curve ${W3.curveText}`}.`],
    ["maths-symbolic", "pass", "Each integral is differentiated back to the integrand at three sample points; each curve is checked through its own point."],
    ["examiner-alignment", "pass", "The decisions answer the Summer 2023 Q2 findings (the constant, the integral sign, simplifying) and the Summer 2025 Q6 finding (the word gradient)."],
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
      ? "The prerequisite items differentiate 2x^3, rewrite 6/x^3 with a negative index and divide 12 by -2, each recomputed in the generator."
      : `Every option value is produced by executing a route: 6x^2 integrates to 2x^3 against ${polyText(routes.notDivided(gradientOf({ 2: 6 })))} and ${polyText(routes.dividedByOriginalPower(gradientOf({ 2: 6 })))}; ${P6.dText} integrates to ${P6.baseText} against ${polyText(routes.dividedByOriginalPower(P6))} and ${polyText(routes.powerNotRaised(P6))}; the point route gives ${frText(polyEval(P7.d, P7.px))} where the curve gives ${frText(P7.baseAtPoint)}.`],
    ["examiner-alignment", "pass", "Post-instruction distractors carry the registry ids for the missing constant, the two division slips, the unraised power, the gradient-word trigger and the point substituted into the derivative. Prerequisite distractors carry no topic tag unless the slip is that misconception."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["tariff", "pass", "Diagnostics carry no tariff; each is a single-skill check of one step of the method."],
  ]);
}

for (const q of questions) {
  push(q.id, [
    ["schema", "pass", `Validated against the Zod Question: ${q.parts.length} part(s), scheme totals matching each part's marks, skeleton "${q.skeleton}" matching the parts.`],
    ["scope-tier", "pass", scopeDetail],
    ["formula-sheet", "pass", formulaDetail],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", `${q.totalMarks} marks over ${q.parts.length} part(s); the FM1 perPart median is 3 and the p90 is 6, and the perQuestion typical is 7.`],
    ["maths-numeric", "pass", "Every integral in this question is computed by polyInteg and differentiated back at three sample points; every commonError expression is produced by executing its route in routes (scratchpad/fm1-batch-e/topic3-integration.mjs) rather than typed."],
    ["maths-symbolic", "pass", "Each printed integral is checked against its integrand at x = 2, 3 and -1.5, and each value of c by substituting the point into the finished curve."],
    ["examiner-alignment", "pass", `Cited to ${q.examinerSources.join(" and ")}; every distractor's feedback names the route that produces its value.`],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["independent-solve", "pass", "The app's own marker (scratchpad/fm1-batch-e/check-marking.mts) was fed the correct answer in every natural spelling and then every commonError expression; each correct spelling scores full marks and each route value fires its own pattern and earns what it claims."],
  ]);
}

for (const f of findTheMistake) {
  push(f.id, [
    ["schema", "pass", "Validated against the Zod FindTheMistake: exactly one wrong line, flagged inside the working, and the correction rewrites it."],
    ["scope-tier", "pass", scopeDetail],
    ["maths-numeric", "pass", `Both the wrong route and the right one are executed in the generator: ${f.id.endsWith("01") ? `${W1.baseText} against ${W1.baseText} + c` : f.id.endsWith("02") ? `the derivative route ${polyText(routes.differentiatedInstead(P7))} against the integral ${P7.baseText} with c = ${frText(P7.c)}` : `${polyText(routes.dividedByOriginalPower(P5))} against ${P5.baseText}`}.`],
    ["examiner-alignment", "pass", "Seeded from the Summer 2022 Q2, Summer 2023 Q2 and Summer 2025 Q6 findings on the constant, the division and the gradient-word trigger."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The working shown is an opening integration question of 2 to 5 marks, as Summer 2022 Q2, Summer 2023 Q2 and Summer 2025 Q6 print them."],
  ]);
}

for (const p of prompts) {
  push(p.id, [
    ["schema", "pass", "Validated against the Zod RetrievalPrompt."],
    ["scope-tier", "pass", scopeDetail],
    ["maths-numeric", "pass", "Any value quoted here is one of the computed integrals above."],
    ["examiner-alignment", "pass", "Each prompt is anchored to a section of the note and to the examiner finding that section answers."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", `${styleLint} Every key word of this prompt appears in its own answer.`],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "Retrieval prompts carry no tariff; they rehearse the steps the scheme pays for."],
  ]);
}

/* ---------------- topic row and note frontmatter ---------------- */

const externalRefs = [
  { kind: "youtube", videoId: "D78fDp2OAVk", channel: "corbettmaths", credit: "Introduction to Integration for GCSE Further Maths, corbettmaths (embeddable id verified in data/links/media-map.json)" },
  { kind: "youtube", videoId: "aTu6DIXIUHI", channel: "corbettmaths", credit: "Integration - Finding the Equation of a Curve - GCSE Further Maths, corbettmaths (embeddable id verified in data/links/media-map.json)" },
  { kind: "phet", sim: "calculus-grapher", url: "https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher_en.html", licence: "CC BY-NC 4.0", attribution: "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)" },
  { kind: "ccea-doc", docType: "cer", url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports", asOf: "2026-09-19" },
];

const howExamined =
  "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. Integration as the reverse of differentiation is an early question: a plain integral for 2 marks opened Summer 2018 Q2 and Summer 2022 Q2, the full find-the-curve version was 5 marks in Summer 2023 Q2 and again in Summer 2025 Q6, and Summer 2024 Q1 ran a 2-mark second derivative followed by a 5-mark integration from the same gradient function. Wordings are find the integral, express y in terms of x, and find y in terms of x given that y = ... when x = .... Schemes run MW1 per correctly integrated term, M1 for substituting the point and W1 for the value of c inside the finished equation.";

const notOnThisSpec = [
  "The integral of x⁻¹, excluded by FM1-INT-02 because the rule would divide by zero",
  "Fractional indices, which are excluded across Unit 1",
  "Integration by substitution, by parts, or of trigonometric, exponential and logarithmic functions",
  "Definite integrals, which belong to FM1-INT-03 and are met in the next topic",
];

const topic = {
  id: TOPIC,
  slug: "integration-as-inverse",
  title: "Integration as the reverse of differentiation",
  subject: "further-maths",
  unit: "FM1",
  tier: "untiered",
  strand: "Calculus",
  statementIds: SPEC,
  prerequisites: ["fm.u1.differentiation-integer-powers"],
  order: 36,
  hardness: "H",
  difficulty: 4,
  examinerFlagged: true,
  examinerSources: [
    "ccea-cer:further-maths:2019-summer:FM1:Q3",
    "ccea-cer:further-maths:2022-summer:FM1:Q2",
    "ccea-cer:further-maths:2023-summer:FM1:Q2",
    "ccea-cer:further-maths:2024-summer:FM1:Q1",
    "ccea-cer:further-maths:2025-summer:FM1:Q6",
  ],
  examWeightHint: howExamined,
  mustMemorise: [
    "∫axⁿ dx = axⁿ⁺¹/(n + 1) + c, and n is never −1 on this specification",
    "Raise the power, then divide by the NEW power",
    "A constant k integrates to kx",
    "Rewrite a/xⁿ as ax⁻ⁿ before integrating; the index rises, so −3 becomes −2",
    "Every indefinite integral ends with + c",
    "A point on the curve goes into the integrated expression, never into dy/dx",
    "Drop the integral sign once you have integrated, and give the curve as one equation",
  ],
  onFormulaSheet: ["∫axⁿ dx = axⁿ⁺¹/(n + 1) + c, n ≠ −1 (Unit 1 formula sheet, page 2)"],
  notOnThisSpec,
  externalRefs,
  keywords: ["integrate", "constant of integration", "gradient function", "equation of a curve", "negative index"],
};

const noteFrontmatter = {
  id: "note.fm.u1.integration-as-inverse",
  topic: TOPIC,
  title: "Integration as the reverse of differentiation",
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
      "A constant k integrates to kx",
      "Rewrite a/xⁿ as ax⁻ⁿ before integrating",
      "Every indefinite integral ends with + c",
      "The point given goes into the integrated expression, not into dy/dx",
    ],
  },
  notOnThisSpec,
  hardness: "H",
  examinerFlagged: true,
  externalRefs: [externalRefs[0], externalRefs[2], externalRefs[3]],
  sheet: {
    mustBeAbleTo: [
      "Integrate a sum of terms axⁿ by raising each power and dividing by the new power",
      "Turn a constant term k into kx",
      "Rewrite a/xⁿ as ax⁻ⁿ and integrate it, keeping the sign the new power gives",
      "Write + c on every indefinite integral, and explain why it is there",
      "Recognise from the wording that a gradient function has to be integrated, not differentiated",
      "Substitute a given point into the integrated expression to find c",
      "Present the curve as a single equation beginning y =, with the integral sign dropped",
      "Simplify each term as you go, so 6x³/3 is written 2x³",
    ],
    howExamined,
    traps: [
      "The constant of integration omitted, or found and never written into the equation (Summer 2019 FM1 Q3, Summer 2022 FM1 Q2, Summer 2023 FM1 Q2)",
      "The coefficient divided by the power it started from rather than by the new one (Summer 2023 FM1 Q2)",
      "The power raised but the coefficient never divided",
      "The word gradient read as an instruction to differentiate (Summer 2025 FM1 Q6)",
      "y = mx + c used as though the curve were a straight line (Summer 2025 FM1 Q6)",
      "Limits invented and a definite integral evaluated when none was asked for (Summer 2023 FM1 Q2, Summer 2025 FM1 Q6)",
      "The integral sign kept in front of the finished expression (Summer 2023 FM1 Q2)",
      "A negative power mishandled, or the sign lost when dividing by a negative new power (Summer 2024 FM1 Q1)",
      "The point substituted into dy/dx instead of into the integrated expression",
      "Errors clustering in the second term, whatever the expression (Summer 2022 FM1 Q2)",
      "The second derivative found where the curve was wanted (Summer 2023 FM1 Q2)",
      "The integrated expression left unsimplified, or the value of c written beside the equation rather than inside it (Summer 2025 FM1 Q6)",
    ],
  },
  verification: V("note.fm.u1.integration-as-inverse"),
  version: 1,
  updated: "2026-09-19",
};

/* ---------------- assemble ---------------- */

const insight = JSON.parse(fs.readFileSync("packs/further-maths/insights/u1.integration-as-inverse.json", "utf8"));

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
const norm = (s) => s.toLowerCase().replace(/[-−]/g, " ").replace(/[.,;:()\\]/g, " ").replace(/\s+/g, " ").trim();
for (const p of prompts) for (const k of p.keyWords) if (!norm(p.answer).includes(norm(k))) throw new Error(`prompt ${p.id}: key word "${k}" is not in its own answer`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n");
fs.writeFileSync(path.join(OUT, "note.blocks.json"), JSON.stringify(note, null, 2) + "\n");
console.log(`topic 3 written: ${questions.length} questions, ${workedExamples.length} worked examples, ${diagnostics.reduce((n, d) => n + d.items.length, 0)} diagnostics, ${findTheMistake.length} find-the-mistake, ${prompts.length} prompts, ${verification.length} verification logs`);
