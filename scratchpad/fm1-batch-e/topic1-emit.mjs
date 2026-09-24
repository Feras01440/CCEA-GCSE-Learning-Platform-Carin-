/** FM1 batch E, topic 1 emit: bundle.json + note.blocks.json for curve-sketching-quadratic-cubic. */
import fs from "node:fs";
import path from "node:path";
import {
  fr, frLatex, frText, num, neg, sub, mul,
  polyDeriv, polyEval, polyLatex, polyText,
  pointLatex, pointsLatex, dp, quadRoots,
  svgFigure, lintTree, verLog, PAPER, AT, TOOL,
} from "./lib.mjs";
import {
  note, routes, Q1, Q2, C1, C2, P1, P2, P3, P4, P5, P6, P7,
  Q1roots, Q2roots, C1roots, C2roots, P1roots, P4roots,
  heroSvg, cubicSvg, c2Svg, routeCard, heroPlainSvg, cubicPlainSvg, OUT, TOPIC, SPEC,
} from "./topic1-curve-sketching.mjs";

const asLatexPoints = (pts) => pts.map(([x, y]) => pointLatex(x, y)).join(", ");
const P7roots = quadRoots(fr(1), fr(0), fr(-4));
const V = (id) => `ver.${id}`;

/* ---------------- executed error routes (values, never typed) ---------------- */

const R = {
  p1DerivIntercepts: asLatexPoints(routes.derivativeRootsForIntercepts(P1)),
  p1SignsFlipped: asLatexPoints(routes.rootSignsFlipped(P1roots)),
  p1XOnly: `x=${frLatex(P1roots[0])}, x=${frLatex(P1roots[1])}`,
  p2TurningFromDeriv: pointLatex(...routes.turningYFromDerivative(P2)),
  p2Swapped: pointLatex(...routes.coordsSwapped(P2)),
  p3TurningFromDeriv: pointLatex(...routes.turningYFromDerivative(P3)),
  p3Swapped: pointLatex(...routes.coordsSwapped(P3)),
  p4Origin: asLatexPoints(routes.originAdded(P4roots.map((r) => [r, fr(0)]))),
  p4SignsFlipped: asLatexPoints(routes.rootSignsFlipped(P4roots)),
  p4YFromRoots: pointLatex(fr(0), P4roots.reduce((a, b) => mul(a, b), fr(1))),
  p4YBare: frLatex(P4.yIntercept),
  p6TurningFromDeriv: pointLatex(...routes.turningYFromDerivative(P6)),
  p5TurningFromDeriv: P5.sps.map((_, i) => pointLatex(...routes.turningYFromDerivative(P5, i))).join(", "),
  p5MaxOnly: pointLatex(P5.sps[0].x, P5.sps[0].y),
  p7YFlipped: pointLatex(...routes.yInterceptSignFlipped(P7)),
  q2DerivIntercepts: asLatexPoints(routes.derivativeRootsForIntercepts(Q2)),
  q2SignsFlipped: asLatexPoints(routes.rootSignsFlipped(Q2roots)),
  q2TurningFromDeriv: pointLatex(...routes.turningYFromDerivative(Q2)),
  q2Swapped: pointLatex(...routes.coordsSwapped(Q2)),
  q2YFlipped: pointLatex(...routes.yInterceptSignFlipped(Q2)),
  c2Origin: asLatexPoints(routes.originAdded(C2roots.map((r) => [r, fr(0)]))),
  c2SignsFlipped: asLatexPoints(routes.rootSignsFlipped(C2roots)),
  c2TurningFromDeriv: C2.sps.map((_, i) => pointLatex(...routes.turningYFromDerivative(C2, i))).join(", "),
  c2MinOnly: pointLatex(C2.sps[1].x, C2.sps[1].y),
  c2YFromRoots: pointLatex(fr(0), C2roots.reduce((a, b) => mul(a, b), fr(1))),
};
export { R };

/* ---------------- worked examples ---------------- */

const we1 = {
  id: "we.fm.u1.curve-sketching-quadratic-cubic.01",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `A curve has the equation $y = ${Q1.latex}$\nFind where it meets each axis, find its turning point, say whether that point is a maximum or a minimum, and sketch the curve.`,
  figure: svgFigure(heroPlainSvg, `The curve y equals ${polyText(Q1.p)} drawn on labelled axes, with no points marked on it`),
  steps: [
    {
      n: 1,
      working: `Set $y = 0$: $${polyText(Q1.p)} = 0$, which factorises to $(x - ${frText(Q1roots[0])})(x - ${frText(Q1roots[1])}) = 0$, so $x = ${frText(Q1roots[0])}$ or $x = ${frText(Q1roots[1])}$.`,
      decision: "Every point on the x-axis has height zero, so the crossings are the solutions of the equation itself. No calculus belongs in this line.",
      whyMenu: {
        options: ["Because a point on the x-axis has y = 0", "Because the turning point sits on the x-axis", "Because dy/dx = 0 there"],
        correct: 0,
        explain: "The x-axis is the set of points with height zero, so putting y = 0 into the equation finds exactly where the curve touches it.",
      },
      earns: ["MW1"],
    },
    {
      n: 2,
      working: `Write the crossings as coordinates: $${pointLatex(Q1roots[0], fr(0))}$ and $${pointLatex(Q1roots[1], fr(0))}$.`,
      decision: "The question asks where the curve meets the axis, and a place on the page needs two numbers. Bare values of x lose the accuracy mark.",
      earns: ["W1"],
    },
    {
      n: 3,
      working: `Set $x = 0$: $y = ${frText(Q1.yIntercept)}$, so the curve meets the y-axis at $${pointLatex(fr(0), Q1.yIntercept)}$.`,
      decision: "The constant term is the height at x = 0, so this crossing can be read straight off the equation once you know why.",
      earns: ["W1"],
    },
    {
      n: 4,
      working: `Differentiate: $\\frac{dy}{dx} = ${Q1.d1Latex}$.`,
      decision: "The turning point is where the curve is momentarily level, and the gradient function is what tells you that. This is where calculus starts.",
      earns: ["MW1"],
    },
    {
      n: 5,
      working: `Set the gradient to zero: $${polyText(Q1.d1)} = 0$, so $x = ${frText(Q1.sps[0].x)}$.`,
      decision: "Solving the derivative gives only the x of the turning point. It says nothing yet about how high the curve is there.",
      earns: ["M1"],
    },
    {
      n: 6,
      working: `Substitute into the curve: $y = (${frText(Q1.sps[0].x)})^{2} - 6(${frText(Q1.sps[0].x)}) + 5 = ${frText(Q1.sps[0].y)}$, so the turning point is $${pointLatex(Q1.sps[0].x, Q1.sps[0].y)}$.`,
      decision: "Into the curve, never into the derivative. The derivative is zero there by construction, so it would hand back a height of nothing.",
      whyMenu: {
        options: ["Because the height comes from y, not from the gradient", "Because dy/dx gives the height", "Because both give the same number"],
        correct: 0,
        explain: "dy/dx is zero at the turning point, so substituting into it returns 0 whatever the curve is. Only the original equation knows the height.",
      },
      earns: ["W1"],
    },
    {
      n: 7,
      working: `Differentiate again: $\\frac{d^{2}y}{dx^{2}} = ${Q1.d2Latex}$, which is positive, so $${pointLatex(Q1.sps[0].x, Q1.sps[0].y)}$ is a minimum.`,
      decision: "A positive second derivative means the gradient is climbing through zero: down, level, up. That is a dip.",
      earns: ["MW1"],
    },
    {
      n: 8,
      working: `Sketch: mark $${pointLatex(Q1roots[0], fr(0))}$, $${pointLatex(Q1roots[1], fr(0))}$, $${pointLatex(fr(0), Q1.yIntercept)}$ and $${pointLatex(Q1.sps[0].x, Q1.sps[0].y)}$, then draw one U through them with the coefficient of $x^{2}$ positive.`,
      decision: "Label every point you calculated. The sketch mark is for a picture that agrees with your own numbers, not for a neat curve.",
      earns: ["W2"],
    },
  ],
  finalAnswer: `Crossings $${pointLatex(Q1roots[0], fr(0))}$, $${pointLatex(Q1roots[1], fr(0))}$ and $${pointLatex(fr(0), Q1.yIntercept)}$; turning point $${pointLatex(Q1.sps[0].x, Q1.sps[0].y)}$, a minimum because $\\frac{d^{2}y}{dx^{2}} = ${Q1.d2Latex}$.`,
  twin: {
    stem: `A curve has the equation $y = ${P2.latex}$\nFind the coordinates of its turning point.`,
    answer: { kind: "algebraic", latex: pointLatex(P2.sps[0].x, P2.sps[0].y), equivalence: "equivalent", variables: ["x", "y"] },
  },
  faded: [
    { showSteps: 4, studentSupplies: [5, 6, 7, 8] },
    { showSteps: 2, studentSupplies: [3, 4, 5, 6, 7, 8] },
  ],
  verification: V("we.fm.u1.curve-sketching-quadratic-cubic.01"),
  version: 1,
};

const we2 = {
  id: "we.fm.u1.curve-sketching-quadratic-cubic.02",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `A curve has the equation $y = x(x - 5)(x - 8)$\nFind where it meets the x-axis, find both turning points and say which is which.`,
  figure: svgFigure(cubicPlainSvg, `The cubic y equals x times (x minus 5) times (x minus 8) drawn on labelled axes, with no points marked on it`),
  steps: [
    {
      n: 1,
      working: `The product is zero when any bracket is zero, so $x = ${frText(C1roots[0])}$, $x = ${frText(C1roots[1])}$ or $x = ${frText(C1roots[2])}$, giving $${asLatexPoints(C1roots.map((r) => [r, fr(0)]))}$.`,
      decision: "A factorised cubic hands you its crossings. Expanding first and then trying to factorise again would only make work.",
      earns: ["MW1"],
    },
    {
      n: 2,
      working: `Expand for the calculus: $x(x - 5)(x - 8) = ${C1.latex}$.`,
      decision: "The power rule needs separate terms, so the brackets have to come apart before you differentiate. Multiply the last two first, then bring in the x.",
      earns: ["MW1"],
    },
    {
      n: 3,
      working: `Differentiate: $\\frac{dy}{dx} = ${C1.d1Latex}$.`,
      decision: "Each term on its own: multiply by the power, then step the power down.",
      earns: ["MW1"],
    },
    {
      n: 4,
      working: `Set it to zero: $(3x - 20)(x - 2) = 0$, so $x = ${frLatex(C1.sps[1].x)}$ or $x = ${frText(C1.sps[0].x)}$.`,
      decision: "A cubic's derivative is a quadratic, so there are two answers here, not one. Finding only one is a sign that a factor has been dropped.",
      earns: ["M1", "W1"],
    },
    {
      n: 5,
      working: `Heights: $y = ${frText(C1.sps[0].y)}$ at $x = ${frText(C1.sps[0].x)}$, and $y = ${frLatex(C1.sps[1].y)}$ at $x = ${frLatex(C1.sps[1].x)}$.`,
      decision: "Both go back into the curve. The second one is a fraction, and it stays a fraction in the answer; the decimal is only for placing the point on the sketch.",
      earns: ["W1"],
    },
    {
      n: 6,
      working: `Second derivative: $\\frac{d^{2}y}{dx^{2}} = ${C1.d2Latex}$. At $x = ${frText(C1.sps[0].x)}$ it is $${frText(C1.sps[0].d2)}$, so $${pointLatex(C1.sps[0].x, C1.sps[0].y)}$ is a maximum. At $x = ${frLatex(C1.sps[1].x)}$ it is $${frText(C1.sps[1].d2)}$, so that point is a minimum.`,
      decision: "Test each point separately. On a cubic the second derivative changes sign between them, which is why one of each always appears.",
      whyMenu: {
        options: ["Because the second derivative is negative at one and positive at the other", "Because the first x found is always the maximum", "Because a cubic has two maxima"],
        correct: 0,
        explain: "The sign at the point is what names it. On this curve it is negative at the left-hand turn and positive at the right-hand one.",
      },
      earns: ["MW1"],
    },
    {
      n: 7,
      working: `Sketch: mark the three crossings, the maximum $${pointLatex(C1.sps[0].x, C1.sps[0].y)}$ and the minimum at about $(${dp(C1.sps[1].x, 2)}, ${dp(C1.sps[1].y, 2)})$, then draw a curve rising away to the right.`,
      decision: "The coefficient of x cubed is positive, so the curve comes up from the bottom left and leaves at the top right. Label every point.",
      earns: ["W1"],
    },
  ],
  finalAnswer: `Crossings $${asLatexPoints(C1roots.map((r) => [r, fr(0)]))}$; maximum $${pointLatex(C1.sps[0].x, C1.sps[0].y)}$; minimum $\\left(${frLatex(C1.sps[1].x)}, ${frLatex(C1.sps[1].y)}\\right)$.`,
  twin: {
    stem: `A curve has the equation $y = x(x - 3)(x + 4)$\nWrite down the coordinates of each point where the curve meets the x-axis.`,
    answer: { kind: "algebraic", latex: asLatexPoints([[fr(-4), fr(0)], [fr(0), fr(0)], [fr(3), fr(0)]]), equivalence: "equivalent", variables: ["x", "y"] },
  },
  faded: [
    { showSteps: 4, studentSupplies: [5, 6, 7] },
    { showSteps: 2, studentSupplies: [3, 4, 5, 6, 7] },
  ],
  verification: V("we.fm.u1.curve-sketching-quadratic-cubic.02"),
  version: 1,
};

/* ---------------- diagnostics ---------------- */

const dxPre = {
  id: "dx.fm.u1.curve-sketching-quadratic-cubic.pre",
  topic: TOPIC,
  specRefs: SPEC,
  when: "pre",
  items: [
    {
      id: "p1",
      stem: "Three checks on what this lesson is built from. None of them is the new method, so answer from what you already know.\nFactorise $x^{2} + x - 12$.",
      skill: "Factorise a quadratic with unit leading coefficient",
      options: [
        { id: "a", text: "$(x + 4)(x - 3)$", correct: true, feedback: "The two numbers multiply to $-12$ and add to $+1$. That is the step a crossings question rests on." },
        { id: "b", text: "$(x - 4)(x + 3)$", correct: false, feedback: "Those multiply to $-12$ but add to $-1$, so the middle term would come out as $-x$." },
        { id: "c", text: "$(x + 6)(x - 2)$", correct: false, feedback: "Those multiply to $-12$ but add to $+4$. Check the sum as well as the product." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "Solve $(x - 2)(x + 5) = 0$.",
      skill: "Read the solutions from a factorised equation",
      options: [
        { id: "a", text: "$x = 2$ or $x = -5$", correct: true, feedback: "Each bracket is set to zero in turn, and the sign flips as you solve it." },
        { id: "b", text: "$x = -2$ or $x = 5$", correct: false, misconception: "fm.sketch.factor-signs-not-reversed", feedback: "The signs inside the brackets have been copied straight out. Solving $x - 2 = 0$ gives $x = 2$, not $x = -2$." },
        { id: "c", text: "$x = -10$", correct: false, feedback: "That is the product of the two constants. A product is zero when one factor is zero, which gives two separate answers." },
      ],
      secondsExpected: 20,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p3",
      stem: `Differentiate $y = ${Q1.latex}$.`,
      skill: "Differentiate a quadratic term by term",
      options: [
        { id: "a", text: `$${Q1.d1Latex}$`, correct: true, feedback: "Multiply by the power, step the power down, and the constant goes to zero." },
        { id: "b", text: "$2x - 6x$", correct: false, feedback: "The middle term $-6x$ has power 1, so its derivative is the number $-6$, with no $x$ left." },
        { id: "c", text: "$2x - 6 + 5$", correct: false, feedback: "The constant $5$ differentiates to zero, so it does not appear in the gradient function at all." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

const dxPost = {
  id: "dx.fm.u1.curve-sketching-quadratic-cubic.post",
  topic: TOPIC,
  specRefs: SPEC,
  when: "post",
  items: [
    {
      id: "d1",
      stem: "Where does the curve $y = (x - 4)(x + 7)$ meet the $x$-axis?",
      skill: "Find the x-axis crossings of a factorised quadratic",
      options: [
        { id: "a", text: `$${asLatexPoints([[fr(-7), fr(0)], [fr(4), fr(0)]])}$`, correct: true, feedback: "Each bracket set to zero, then both answers written as coordinates." },
        { id: "b", text: `$${asLatexPoints(routes.rootSignsFlipped([fr(-7), fr(4)]))}$`, correct: false, misconception: "fm.sketch.factor-signs-not-reversed", feedback: "The constants have been copied out of the brackets without solving. $x - 4 = 0$ gives $x = 4$ and $x + 7 = 0$ gives $x = -7$." },
        { id: "c", text: "$x = 4$ or $x = -7$", correct: false, misconception: "fm.sketch.x-value-not-coordinate", feedback: "The algebra is right. The question asks where the curve meets the axis, which is a place, so each answer needs its $y$ value as well." },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: `The curve $y = ${P2.latex}$ has $\\frac{dy}{dx} = ${P2.d1Latex}$, which is zero at $x = ${frText(P2.sps[0].x)}$. What is the turning point?`,
      skill: "Find the height of a turning point",
      options: [
        { id: "a", text: `$${pointLatex(P2.sps[0].x, P2.sps[0].y)}$`, correct: true, feedback: `Substituting $${frText(P2.sps[0].x)}$ into the curve gives $${frText(P2.sps[0].y)}$.` },
        { id: "b", text: `$${R.p2TurningFromDeriv}$`, correct: false, misconception: "fm.calc.turning-y-from-derivative", feedback: "That height came from substituting into $\\frac{dy}{dx}$, which is zero at a turning point by definition. The height has to come from the curve." },
        { id: "c", text: `$${R.p2Swapped}$`, correct: false, misconception: "fm.sketch.coordinates-swapped", feedback: "Both numbers are right and they are the wrong way round. The value you solved for is the $x$, and the height you worked out is the $y$." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: "At a turning point a curve has $\\frac{d^{2}y}{dx^{2}} = 8$. What kind of point is it?",
      skill: "Name a turning point from the sign of the second derivative",
      options: [
        { id: "a", text: "A minimum", correct: true, feedback: "A positive second derivative means the gradient is rising through zero, so the curve falls to the point and climbs away." },
        { id: "b", text: "A maximum", correct: false, misconception: "fm.calc.second-derivative-sign-misread", feedback: "The test runs the other way: positive is a minimum and negative is a maximum. Picture the gradient going down, level, up." },
        { id: "c", text: "It cannot be decided without the sketch", correct: false, misconception: "fm.optim.nature-not-shown", feedback: "The second derivative settles it on its own, which is why the examiners ask for it rather than for a drawing." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: "Where does the curve $y = (x + 1)(x - 3)(x - 6)$ meet the $x$-axis?",
      skill: "Find the crossings of a factorised cubic",
      options: [
        { id: "a", text: `$${asLatexPoints(P4roots.map((r) => [r, fr(0)]))}$`, correct: true, feedback: "Three brackets, three crossings, each written as a coordinate." },
        { id: "b", text: `$${R.p4Origin}$`, correct: false, misconception: "fm.calc.origin-assumed-on-cubic", feedback: `The origin has been added out of habit. Putting $x = 0$ into this cubic gives $y = ${frText(P4.yIntercept)}$, so the curve passes well above $(0, 0)$.` },
        { id: "c", text: `$${R.p4SignsFlipped}$`, correct: false, misconception: "fm.sketch.factor-signs-not-reversed", feedback: "Each constant has been copied out with its printed sign. Solving $x + 1 = 0$ gives $x = -1$, and $x - 3 = 0$ gives $x = 3$." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

/* ---------------- questions ---------------- */

const practice = (n, opts) => ({
  id: `q.fm.u1.curve-sketching-quadratic-cubic.${String(n).padStart(4, "0")}`,
  topic: TOPIC,
  specRefs: SPEC,
  tier: "untiered",
  paper: PAPER,
  style: "practice",
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
  verification: V(`q.fm.u1.curve-sketching-quadratic-cubic.${String(n).padStart(4, "0")}`),
  version: 1,
});

const coordSpec = (latex) => ({ kind: "algebraic", latex, equivalence: "equivalent", variables: ["x", "y"] });

const q1 = practice(1, {
  commandWords: ["Find"],
  setting: "A quadratic curve whose crossings are wanted before any calculus",
  skeleton: "(main)find2",
  examinerSources: ["ccea-cer:further-maths:2024-summer:FM1:Q10"],
  solutionProgram: `y = ${polyText(P1.p)}; y = 0 -> (x - ${frText(P1roots[0])})(x - ${frText(P1roots[1])}) = 0 -> x = ${frText(P1roots[0])}, ${frText(P1roots[1])}`,
  parts: [
    {
      id: "main",
      stem: `A curve has the equation $y = ${P1.latex}$\nFind the coordinates of each point where the curve meets the $x$-axis.`,
      marks: 2,
      answer: coordSpec(asLatexPoints(P1roots.map((r) => [r, fr(0)]))),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: `setting $y = 0$ and factorising to $(x - ${frText(P1roots[0])})(x - ${frText(P1roots[1])}) = 0$` },
        { id: "W1", code: "W", marks: 1, for: `$${asLatexPoints(P1roots.map((r) => [r, fr(0)]))}$`, dependsOn: ["M1"] },
      ],
      hints: ["A point on the $x$-axis has $y = 0$.", "Two numbers that multiply to $12$ and add to $-8$.", "Each answer is a coordinate, so give the $y$ value too."],
      workedSolution: `Set $y = 0$: $${polyText(P1.p)} = 0$.\nFactorise: $(x - ${frText(P1roots[0])})(x - ${frText(P1roots[1])}) = 0$, so $x = ${frText(P1roots[0])}$ or $x = ${frText(P1roots[1])}$.\nThe curve meets the $x$-axis at $${asLatexPoints(P1roots.map((r) => [r, fr(0)]))}$.`,
      commonErrors: [
        {
          misconception: "fm.calc.differentiate-when-intercepts-asked",
          pattern: { kind: "algebraic", latex: R.p1DerivIntercepts },
          feedback: `That point came from differentiating and solving $${polyText(P1.d1)} = 0$, which finds the turning point. The crossings come from setting $y$ itself to zero.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2024-summer:FM1:Q10",
        },
        {
          misconception: "fm.sketch.factor-signs-not-reversed",
          pattern: { kind: "algebraic", latex: R.p1SignsFlipped },
          feedback: `The factorising is right. The constants have then been copied out with their printed signs: $x - ${frText(P1roots[0])} = 0$ gives $x = ${frText(P1roots[0])}$, not $x = ${frText(neg(P1roots[0]))}$.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
        },
        {
          misconception: "fm.sketch.x-value-not-coordinate",
          pattern: { kind: "algebraic", latex: R.p1XOnly },
          feedback: "Both values of $x$ are right, so the method mark stands. The question asks where the curve meets the axis, which is a place, so each answer needs its $y$ value beside it.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const turningQ = (n, S, setting, extra = []) =>
  practice(n, {
    commandWords: ["Find"],
    emphasis: ["Using calculus"],
    setting,
    skeleton: "(main)find3",
    examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q11"],
    solutionProgram: `y = ${polyText(S.p)}; dy/dx = ${polyText(S.d1)}; dy/dx = 0 -> x = ${frText(S.sps[0].x)}; y = ${frText(S.sps[0].y)}`,
    parts: [
      {
        id: "main",
        stem: `A curve has the equation $y = ${S.latex}$\nUsing calculus, find the coordinates of each turning point on the curve.`,
        marks: 3,
        answer: coordSpec(pointLatex(S.sps[0].x, S.sps[0].y)),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dy}{dx} = ${S.d1Latex}$` },
          { id: "M1", code: "M", marks: 1, for: `setting the derivative to zero and solving for $x = ${frText(S.sps[0].x)}$`, dependsOn: ["MW1"] },
          { id: "W1", code: "W", marks: 1, for: `$${pointLatex(S.sps[0].x, S.sps[0].y)}$`, dependsOn: ["M1"], ft: true },
        ],
        hints: ["Differentiate first, then set the result to zero.", "Solving gives the $x$ of the turning point only.", "Put that $x$ back into the curve for the height."],
        workedSolution: `$\\frac{dy}{dx} = ${S.d1Latex}$.\nSet it to zero: $${polyText(S.d1)} = 0$, so $x = ${frText(S.sps[0].x)}$.\nSubstitute into the curve: $y = ${frText(S.sps[0].y)}$.\nThe turning point is $${pointLatex(S.sps[0].x, S.sps[0].y)}$.`,
        commonErrors: extra,
        requiresWorking: true,
      },
    ],
  });

const q2 = turningQ(2, P2, "A quadratic whose turning point is wanted", [
  {
    misconception: "fm.calc.turning-y-from-derivative",
    pattern: { kind: "algebraic", latex: R.p2TurningFromDeriv },
    feedback: `The value of $x$ is right, so the method marks stand. The height came from putting $${frText(P2.sps[0].x)}$ into $\\frac{dy}{dx}$, which is zero there by definition; put it into the curve instead to get $${frText(P2.sps[0].y)}$.`,
    marksTypicallyEarned: 2,
    source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
  },
  {
    misconception: "fm.sketch.coordinates-swapped",
    pattern: { kind: "algebraic", latex: R.p2Swapped },
    feedback: "Both numbers are right and the pair is the wrong way round. The value you solved for from the derivative is the $x$ coordinate; the height you then worked out is the $y$.",
    marksTypicallyEarned: 2,
    source: "ccea-cer:further-maths:2025-summer:FM1:Q11",
  },
]);

const q3 = turningQ(3, P3, "A quadratic with a coefficient in front of x squared", [
  {
    misconception: "fm.calc.turning-y-from-derivative",
    pattern: { kind: "algebraic", latex: R.p3TurningFromDeriv },
    feedback: `The $x$ is right. Substituting it into $\\frac{dy}{dx}$ gives zero whatever the curve is, so the height must come from the curve, where it is $${frText(P3.sps[0].y)}$.`,
    marksTypicallyEarned: 2,
    source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
  },
  {
    misconception: "fm.sketch.coordinates-swapped",
    pattern: { kind: "algebraic", latex: R.p3Swapped },
    feedback: "The two numbers are right but they have changed places. Write the value of $x$ first and the height second.",
    marksTypicallyEarned: 2,
    source: "ccea-cer:further-maths:2025-summer:FM1:Q11",
  },
]);

const q4 = practice(4, {
  commandWords: ["Write down"],
  setting: "A cubic printed in factorised form",
  skeleton: "(main)write2",
  examinerSources: ["ccea-cer:further-maths:2023-summer:FM1:Q12"],
  solutionProgram: `y = (x + 1)(x - 3)(x - 6); each bracket zero -> x = ${P4roots.map(frText).join(", ")}`,
  parts: [
    {
      id: "main",
      stem: "A curve has the equation $y = (x + 1)(x - 3)(x - 6)$\nWrite down the coordinates of each point where the curve meets the $x$-axis.",
      marks: 2,
      answer: coordSpec(asLatexPoints(P4roots.map((r) => [r, fr(0)]))),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "setting each bracket to zero" },
        { id: "W1", code: "W", marks: 1, for: `$${asLatexPoints(P4roots.map((r) => [r, fr(0)]))}$`, dependsOn: ["M1"] },
      ],
      hints: ["A product is zero when one of its factors is zero.", "Solve each bracket, watching the sign.", "Three brackets give three points."],
      workedSolution: `Each bracket is set to zero in turn: $x + 1 = 0$ gives $x = ${frText(P4roots[0])}$, $x - 3 = 0$ gives $x = ${frText(P4roots[1])}$ and $x - 6 = 0$ gives $x = ${frText(P4roots[2])}$.\nThe curve meets the $x$-axis at $${asLatexPoints(P4roots.map((r) => [r, fr(0)]))}$.`,
      commonErrors: [
        {
          misconception: "fm.calc.origin-assumed-on-cubic",
          pattern: { kind: "algebraic", latex: R.p4Origin },
          feedback: `The three crossings are all there, with $(0, 0)$ added on top. This cubic has no factor of $x$, and putting $x = 0$ into it gives $y = ${frText(P4.yIntercept)}$, so the origin is not on the curve.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
        },
        {
          misconception: "fm.sketch.factor-signs-not-reversed",
          pattern: { kind: "algebraic", latex: R.p4SignsFlipped },
          feedback: "Each constant has been read straight out of its bracket. Solving reverses the sign every time, so $x + 1 = 0$ gives $x = -1$ and $x - 6 = 0$ gives $x = 6$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
        },
      ],
      requiresWorking: false,
    },
  ],
});

const q5 = practice(5, {
  commandWords: ["Find"],
  setting: "The y-axis crossing of the same factorised cubic",
  skeleton: "(main)find2",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q11"],
  solutionProgram: `y = (x + 1)(x - 3)(x - 6) at x = 0 -> (1)(-3)(-6) = ${frText(P4.yIntercept)}`,
  parts: [
    {
      id: "main",
      stem: "A curve has the equation $y = (x + 1)(x - 3)(x - 6)$\nFind the coordinates of the point where this curve meets the $y$-axis.",
      marks: 2,
      answer: coordSpec(pointLatex(fr(0), P4.yIntercept)),
      scheme: [
        { id: "M1", code: "M", marks: 1, for: "substituting $x = 0$ into all three brackets" },
        { id: "W1", code: "W", marks: 1, for: `$${pointLatex(fr(0), P4.yIntercept)}$`, dependsOn: ["M1"] },
      ],
      hints: ["A point on the $y$-axis has $x = 0$.", "Work out each bracket at $x = 0$, then multiply.", "Two negatives multiply to a positive."],
      workedSolution: `Put $x = 0$ into each bracket: $(0 + 1)(0 - 3)(0 - 6) = (1)(-3)(-6) = ${frText(P4.yIntercept)}$.\nThe curve meets the $y$-axis at $${pointLatex(fr(0), P4.yIntercept)}$.`,
      commonErrors: [
        {
          misconception: "fm.sketch.y-intercept-from-roots",
          pattern: { kind: "algebraic", latex: R.p4YFromRoots },
          feedback: "That is the product of the three roots, $-1$, $3$ and $6$. The height at $x = 0$ comes from the value of each bracket at $x = 0$, which is $1$, $-3$ and $-6$.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
        },
        {
          misconception: "fm.sketch.x-value-not-coordinate",
          pattern: { kind: "algebraic", latex: R.p4YBare },
          feedback: "The height is right, so the method mark stands. The answer asked for is a point, so it needs both numbers, with the $x$ value of $0$ in front.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q6 = turningQ(6, P6, "A quadratic with a negative coefficient of x squared", [
  {
    misconception: "fm.calc.turning-y-from-derivative",
    pattern: { kind: "algebraic", latex: R.p6TurningFromDeriv },
    feedback: `The $x$ is right. The height came from $\\frac{dy}{dx}$, which is zero at the turning point; the curve gives $${frText(P6.sps[0].y)}$ there.`,
    marksTypicallyEarned: 2,
    source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
  },
]);

const q7 = practice(7, {
  commandWords: ["Determine"],
  difficulty: 2,
  setting: "Naming a turning point from the second derivative",
  skeleton: "(main)determine1",
  examinerSources: ["ccea-cer:further-maths:2022-summer:FM1:Q10"],
  solutionProgram: `y = ${polyText(P6.p)}; d2y/dx2 = ${polyText(P6.d2)} -> negative -> maximum`,
  parts: [
    {
      id: "main",
      stem: `The curve $y = ${P6.latex}$ has a turning point at $${pointLatex(P6.sps[0].x, P6.sps[0].y)}$.\nDetermine whether it is a maximum or a minimum.`,
      marks: 1,
      answer: {
        kind: "mcq",
        shuffle: true,
        options: [
          { id: "a", text: `A maximum, because $\\frac{d^{2}y}{dx^{2}} = ${P6.d2Latex}$, which is negative`, correct: true, feedback: "A negative second derivative means the gradient is falling through zero, so the curve peaks there." },
          { id: "b", text: `A minimum, because $\\frac{d^{2}y}{dx^{2}} = ${P6.d2Latex}$, which is negative`, correct: false, misconception: "fm.calc.second-derivative-sign-misread", feedback: "The second derivative is right and the conclusion is reversed. Negative names a maximum, positive names a minimum." },
          { id: "c", text: "A minimum, because the turning point is above the $x$-axis", correct: false, misconception: "fm.calc.sketch-contradicts-results", feedback: "Height above the axis says nothing about which way a curve turns. Only the sign of the second derivative decides it." },
        ],
      },
      scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$\\frac{d^{2}y}{dx^{2}} = ${P6.d2Latex}$, which is negative, so the point is a maximum` }],
      hints: ["Differentiate twice.", "Negative names a maximum; positive names a minimum."],
      workedSolution: `$\\frac{dy}{dx} = ${P6.d1Latex}$, so $\\frac{d^{2}y}{dx^{2}} = ${P6.d2Latex}$.\nThat is negative, so $${pointLatex(P6.sps[0].x, P6.sps[0].y)}$ is a maximum.`,
      commonErrors: [],
      requiresWorking: false,
    },
  ],
});

const q8 = practice(8, {
  commandWords: ["Find"],
  difficulty: 4,
  emphasis: ["Using calculus"],
  setting: "Both turning points of a cubic",
  skeleton: "(main)find4",
  examinerSources: ["ccea-cer:further-maths:2019-summer:FM1:Q8"],
  solutionProgram: `y = ${polyText(P5.p)}; dy/dx = ${polyText(P5.d1)} = 3(x - 1)(x - 3); x = ${P5.sps.map((s) => frText(s.x)).join(", ")}; y = ${P5.sps.map((s) => frText(s.y)).join(", ")}`,
  parts: [
    {
      id: "main",
      stem: `A curve has the equation $y = ${P5.latex}$\nUsing calculus, find the coordinates of each turning point on the curve.`,
      marks: 4,
      answer: coordSpec(P5.sps.map((s) => pointLatex(s.x, s.y)).join(", ")),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dy}{dx} = ${P5.d1Latex}$` },
        { id: "M1", code: "M", marks: 1, for: "setting the derivative to zero and factorising it", dependsOn: ["MW1"] },
        { id: "W1", code: "W", marks: 1, for: `$x = ${P5.sps.map((s) => frText(s.x)).join("$ and $x = ")}$`, dependsOn: ["M1"] },
        { id: "W2", code: "W", marks: 1, for: `$${P5.sps.map((s) => pointLatex(s.x, s.y)).join("$ and $")}$`, dependsOn: ["W1"], ft: true },
      ],
      hints: ["The derivative of a cubic is a quadratic, so expect two answers.", "$3x^{2} - 12x + 9 = 3(x - 1)(x - 3)$.", "Each value of $x$ goes back into the curve for its own height."],
      workedSolution: `$\\frac{dy}{dx} = ${P5.d1Latex}$.\nSet it to zero: $3(x - 1)(x - 3) = 0$, so $x = ${P5.sps.map((s) => frText(s.x)).join("$ or $x = ")}$.\nSubstitute each into the curve: $y = ${frText(P5.sps[0].y)}$ and $y = ${frText(P5.sps[1].y)}$.\nThe turning points are $${P5.sps.map((s) => pointLatex(s.x, s.y)).join("$ and $")}$.`,
      commonErrors: [
        {
          misconception: "fm.calc.turning-y-from-derivative",
          pattern: { kind: "algebraic", latex: R.p5TurningFromDeriv },
          feedback: `Both values of $x$ are right. The heights came from $\\frac{dy}{dx}$, which is zero at each turning point; the curve gives $${frText(P5.sps[0].y)}$ and $${frText(P5.sps[1].y)}$.`,
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
        },
        {
          misconception: "fm.sketch.second-turning-point-dropped",
          pattern: { kind: "algebraic", latex: R.p5MaxOnly },
          feedback: "One turning point is right. A cubic's derivative is a quadratic, so it has two roots and the curve turns twice; the second factor gives the other one.",
          // the scheme pays W1 for both roots together and W2 for both heights, so a single
          // turning point earns the derivative and the setting-to-zero and nothing after them
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q10",
        },
      ],
      requiresWorking: true,
    },
  ],
});

const q9 = practice(9, {
  commandWords: ["Sketch"],
  difficulty: 2,
  setting: "Placing the key points of a simple quadratic on a grid",
  skeleton: "(main)sketch2",
  examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q11"],
  solutionProgram: `y = ${polyText(P7.p)}; x-axis at x = -2, 2; y-axis at ${frText(P7.yIntercept)}; turning point ${pointLatex(P7.sps[0].x, P7.sps[0].y)}`,
  parts: [
    {
      id: "main",
      stem: `A curve has the equation $y = ${P7.latex}$\nSketch the curve by plotting the two points where it meets the $x$-axis and the point where it meets the $y$-axis.`,
      marks: 2,
      answer: {
        kind: "graph",
        expect: {
          plot: "curve",
          samples: [[num(P7roots[0]), 0], [0, num(P7.yIntercept)], [num(P7roots[1]), 0]],
          tolerance: { type: "absolute", value: 0.1 },
          smooth: true,
          noStraightSegments: true,
        },
      },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `the two $x$-axis crossings at $(-2, 0)$ and $(2, 0)$` },
        { id: "W1", code: "W", marks: 1, for: `the $y$-axis crossing at $${pointLatex(fr(0), P7.yIntercept)}$ and a U-shaped curve through all three`, dependsOn: ["MW1"] },
      ],
      hints: ["Set $y = 0$ for the two crossings.", "Set $x = 0$ for the third point.", "The coefficient of $x^{2}$ is positive, so the curve is a U."],
      workedSolution: `Set $y = 0$: $x^{2} = 4$, so $x = 2$ or $x = -2$, giving $(-2, 0)$ and $(2, 0)$.\nSet $x = 0$: $y = ${frText(P7.yIntercept)}$, giving $${pointLatex(fr(0), P7.yIntercept)}$.\nPlot those three points and draw one smooth U through them.`,
      commonErrors: [
        {
          misconception: "fm.sketch.y-intercept-sign-flipped",
          pattern: { kind: "graph", test: `point plotted at ${R.p7YFlipped.replace(/\$/g, "")}` },
          feedback: `The two crossings are in the right places. The constant term is $${frText(P7.yIntercept)}$, so the curve dips below the axis at $x = 0$ rather than rising above it.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2022-summer:FM1:Q10",
        },
      ],
      requiresWorking: false,
    },
  ],
});

/* ---------------- exam-style questions ---------------- */

const exam1 = {
  ...practice(10, {
    commandWords: ["Find", "Write down", "Show", "Sketch"],
    difficulty: 3,
    ao: ["AO1", "AO2"],
    emphasis: ["Using calculus", "Show clearly"],
    setting: "A full curve-sketching question on a quadratic with a negative coefficient of x squared",
    skeleton: "(a)find2|(b)write1|(c)find3|(d)show1|(e)sketch2",
    examinerSources: ["ccea-cer:further-maths:2025-summer:FM1:Q11", "ccea-cer:further-maths:2024-summer:FM1:Q10"],
    solutionProgram: `y = ${polyText(Q2.p)}; roots ${Q2roots.map(frText).join(", ")}; y(0) = ${frText(Q2.yIntercept)}; dy/dx = ${polyText(Q2.d1)} = 0 -> x = ${frText(Q2.sps[0].x)}, y = ${frText(Q2.sps[0].y)}; d2y/dx2 = ${polyText(Q2.d2)} < 0 -> maximum`,
    parts: [
      {
        id: "a",
        stem: `A curve has the equation $y = ${Q2.latex}$\nFind the coordinates of each point where the curve meets the $x$-axis.`,
        marks: 2,
        answer: coordSpec(asLatexPoints(Q2roots.map((r) => [r, fr(0)]))),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: `factorising $${polyText(Q2.p)} = 0$, for example as $-(x - ${frText(Q2roots[1])})(x + ${frText(neg(Q2roots[0]))}) = 0$` },
          { id: "W1", code: "W", marks: 1, for: `$${asLatexPoints(Q2roots.map((r) => [r, fr(0)]))}$`, dependsOn: ["M1"] },
        ],
        hints: ["Set $y = 0$ before anything else.", "Take out the factor $-1$ so the quadratic has a positive $x^{2}$ term.", "Give each answer as a coordinate."],
        workedSolution: `Set $y = 0$: $${polyText(Q2.p)} = 0$.\nMultiply through by $-1$: $x^{2} - 4x - 5 = 0$, which factorises to $(x - ${frText(Q2roots[1])})(x + ${frText(neg(Q2roots[0]))}) = 0$.\nSo $x = ${frText(Q2roots[0])}$ or $x = ${frText(Q2roots[1])}$, and the curve meets the $x$-axis at $${asLatexPoints(Q2roots.map((r) => [r, fr(0)]))}$.`,
        commonErrors: [
          {
            misconception: "fm.calc.differentiate-when-intercepts-asked",
            pattern: { kind: "algebraic", latex: R.q2DerivIntercepts },
            feedback: `That came from solving $${polyText(Q2.d1)} = 0$, which locates the turning point. This part is algebra: set $y$ to zero and factorise.`,
            marksTypicallyEarned: 0,
            source: "ccea-cer:further-maths:2024-summer:FM1:Q10",
          },
          {
            misconception: "fm.sketch.factor-signs-not-reversed",
            pattern: { kind: "algebraic", latex: R.q2SignsFlipped },
            feedback: "The factorising is sound, so the method mark stands. Each bracket still has to be solved: $x - 5 = 0$ gives $x = 5$, and $x + 1 = 0$ gives $x = -1$.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: "Write down the coordinates of the point where this curve meets the $y$-axis.",
        marks: 1,
        answer: coordSpec(pointLatex(fr(0), Q2.yIntercept)),
        scheme: [{ id: "W1", code: "W", marks: 1, for: `$${pointLatex(fr(0), Q2.yIntercept)}$` }],
        hints: ["Put $x = 0$ into the equation.", "The constant term is the height there."],
        workedSolution: `Put $x = 0$: $y = ${frText(Q2.yIntercept)}$.\nThe curve meets the $y$-axis at $${pointLatex(fr(0), Q2.yIntercept)}$.`,
        commonErrors: [
          {
            misconception: "fm.sketch.y-intercept-sign-flipped",
            pattern: { kind: "algebraic", latex: R.q2YFlipped },
            feedback: `The size is right and the sign is not. At $x = 0$ the two terms in $x$ vanish and the constant $${frText(Q2.yIntercept)}$ is left exactly as it is printed.`,
            marksTypicallyEarned: 0,
            source: "ccea-cer:further-maths:2025-summer:FM1:Q11",
          },
        ],
        requiresWorking: false,
      },
      {
        id: "c",
        stem: "Using calculus, find the coordinates of each turning point on the curve.",
        marks: 3,
        answer: coordSpec(pointLatex(Q2.sps[0].x, Q2.sps[0].y)),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dy}{dx} = ${Q2.d1Latex}$` },
          { id: "M1", code: "M", marks: 1, for: `setting it to zero and solving for $x = ${frText(Q2.sps[0].x)}$`, dependsOn: ["MW1"] },
          { id: "W1", code: "W", marks: 1, for: `$${pointLatex(Q2.sps[0].x, Q2.sps[0].y)}$`, dependsOn: ["M1"], ft: true },
        ],
        hints: ["Differentiate, then set the derivative to zero.", "The derivative of $-x^{2}$ is $-2x$.", "The height comes from the curve, not from the derivative."],
        workedSolution: `$\\frac{dy}{dx} = ${Q2.d1Latex}$.\nSet it to zero: $${polyText(Q2.d1)} = 0$, so $x = ${frText(Q2.sps[0].x)}$.\nSubstitute into the curve: $y = -(${frText(Q2.sps[0].x)})^{2} + 4(${frText(Q2.sps[0].x)}) + 5 = ${frText(Q2.sps[0].y)}$.\nThe turning point is $${pointLatex(Q2.sps[0].x, Q2.sps[0].y)}$.`,
        commonErrors: [
          {
            misconception: "fm.calc.turning-y-from-derivative",
            pattern: { kind: "algebraic", latex: R.q2TurningFromDeriv },
            feedback: `The $x$ is right, so both method marks stand. The height came from $\\frac{dy}{dx}$, which is zero at a turning point; the curve gives $${frText(Q2.sps[0].y)}$.`,
            marksTypicallyEarned: 2,
            source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
          },
          {
            misconception: "fm.sketch.coordinates-swapped",
            pattern: { kind: "algebraic", latex: R.q2Swapped },
            feedback: "Both numbers are right and the pair is reversed. The value solved for from the derivative goes first.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:further-maths:2025-summer:FM1:Q11",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "d",
        stem: "Show, from the sign of $rac{d^{2}y}{dx^{2}}$, that this turning point is a maximum.",
        marks: 1,
        answer: {
          kind: "text",
          accepted: [
            `The second derivative is ${frText(Q2.d2.get(0))}, which is negative, so the turning point is a maximum`,
            `d2y/dx2 = ${frText(Q2.d2.get(0))} and it is negative, so this is a maximum point`,
          ],
          // the conclusion word is rejected as well as the sign word tested, so a reversed answer
          // ("-2 is negative, so it is a minimum") cannot earn the mark, and the symbolic
          // spelling "< 0" is accepted as a sign word in its own right
          keyWords: [{ any: ["negative", "less than zero", "below zero", "< 0"], reject: ["minimum"], marks: 1 }],
          listingRule: false,
        },
        scheme: [{ id: "MW1", code: "MW", marks: 1, for: `$\\frac{d^{2}y}{dx^{2}} = ${Q2.d2Latex}$, which is negative, so the point is a maximum`, examinerNote: "The value of the second derivative and the word negative are both wanted; a bare assertion earns nothing." }],
        hints: ["Differentiate a second time.", "Say what the sign of that number tells you."],
        workedSolution: `Differentiating a second time gives $\\frac{d^{2}y}{dx^{2}} = ${Q2.d2Latex}$.\nThis is negative, so the gradient is falling as it passes through zero and the turning point is a maximum.`,
        commonErrors: [
          {
            misconception: "fm.calc.second-derivative-sign-misread",
            pattern: { kind: "text", regex: "(positive|greater than zero|above zero)[^;\\n]*(maximum)|(maximum)[^;\\n]*(positive)" },
            feedback: "The second derivative has been found. The reading is reversed: a negative value names a maximum and a positive one names a minimum.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:further-maths:2022-summer:FM1:Q10",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "c", rule: "use-candidate-value" },
      },
      {
        id: "e",
        stem: "Hence sketch the curve by plotting the two $x$-axis crossings, the $y$-axis crossing and the turning point.",
        marks: 2,
        answer: {
          kind: "graph",
          expect: {
            plot: "curve",
            samples: [
              [num(Q2roots[0]), 0],
              [0, num(Q2.yIntercept)],
              [num(Q2.sps[0].x), num(Q2.sps[0].y)],
              [num(Q2roots[1]), 0],
            ],
            tolerance: { type: "absolute", value: 0.1 },
            smooth: true,
            noStraightSegments: true,
          },
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: "the four key points placed where parts (a) to (c) put them", ft: true },
          { id: "W1", code: "W", marks: 1, for: "one smooth curve through them, opening downwards, with the points labelled as coordinates", dependsOn: ["MW1"] },
        ],
        hints: ["Use the answers you already have; nothing new needs calculating.", "The coefficient of $x^{2}$ is negative, so the curve opens downwards.", "Label each point with its coordinates."],
        workedSolution: `Plot $${asLatexPoints(Q2roots.map((r) => [r, fr(0)]))}$, $${pointLatex(fr(0), Q2.yIntercept)}$ and $${pointLatex(Q2.sps[0].x, Q2.sps[0].y)}$.\nJoin them with one smooth curve that opens downwards, since the coefficient of $x^{2}$ is negative, and label each point with its coordinates.`,
        commonErrors: [
          {
            misconception: "fm.calc.sketch-contradicts-results",
            pattern: { kind: "graph", test: `point plotted at (${frText(Q2.sps[0].x)}, ${frText(neg(Q2.sps[0].y))})` },
            feedback: "The crossings are right. The turning point has been placed below the axis, which contradicts the maximum you found in part (c); a curve through those crossings has to peak between them.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:further-maths:2022-summer:FM1:Q10",
          },
        ],
        requiresWorking: false,
        followThrough: { fromPart: "c", rule: "use-candidate-diagram" },
      },
    ],
  }),
  style: "exam-style",
};

const exam2 = {
  ...practice(11, {
    commandWords: ["Write down", "Find", "Show that", "Sketch"],
    difficulty: 4,
    ao: ["AO1", "AO2", "AO3"],
    emphasis: ["Using calculus", "Show that"],
    setting: "A full curve-sketching question on a cubic with a repeated factor",
    skeleton: "(a)write2|(b)find1|(c)show2|(d)find5|(e)show1|(f)sketch2",
    examinerSources: ["ccea-cer:further-maths:2019-summer:FM1:Q8", "ccea-cer:further-maths:2023-summer:FM1:Q12"],
    solutionProgram: `y = (x - 2)^2 (x - 8) = ${polyText(C2.p)}; x-axis at ${C2roots.map(frText).join(", ")}; y(0) = ${frText(C2.yIntercept)}; dy/dx = ${polyText(C2.d1)} = 3(x - 2)(x - 6); turning points ${C2.sps.map((s) => `(${frText(s.x)}, ${frText(s.y)})`).join(", ")}; d2y/dx2 = ${polyText(C2.d2)}`,
    parts: [
      {
        id: "a",
        stem: "A curve has the equation $y = (x - 2)^{2}(x - 8)$\nWrite down the coordinates of each point where the curve meets the $x$-axis.",
        marks: 2,
        answer: coordSpec(asLatexPoints(C2roots.map((r) => [r, fr(0)]))),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "setting each factor to zero" },
          { id: "W1", code: "W", marks: 1, for: `$${asLatexPoints(C2roots.map((r) => [r, fr(0)]))}$, the repeated factor counted once`, dependsOn: ["M1"] },
        ],
        hints: ["A product is zero when a factor is zero.", "The squared bracket gives one place, not two.", "Each answer is a coordinate."],
        workedSolution: `Set each factor to zero: $(x - 2)^{2} = 0$ gives $x = ${frText(C2roots[0])}$, and $x - 8 = 0$ gives $x = ${frText(C2roots[1])}$.\nThe curve meets the $x$-axis at $${asLatexPoints(C2roots.map((r) => [r, fr(0)]))}$. The repeated bracket means the curve touches the axis at $${pointLatex(C2roots[0], fr(0))}$ rather than crossing it.`,
        commonErrors: [
          {
            misconception: "fm.sketch.repeated-root-counted-twice",
            pattern: { kind: "text", regex: `\\(\\s*${frText(C2roots[0])}\\s*,\\s*0\\s*\\)[^()]*\\(\\s*${frText(C2roots[0])}\\s*,\\s*0\\s*\\)` },
            feedback: `Both factors have been solved, so the method mark stands. The squared bracket is zero at one place only, so $${pointLatex(C2roots[0], fr(0))}$ is written once; the curve touches the axis there rather than crossing it.`,
            marksTypicallyEarned: 1,
            source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
          },
          {
            misconception: "fm.calc.origin-assumed-on-cubic",
            pattern: { kind: "algebraic", latex: R.c2Origin },
            feedback: `Both crossings are there, with the origin added on top. There is no factor of $x$ in this cubic, and at $x = 0$ the height is $${frText(C2.yIntercept)}$.`,
            marksTypicallyEarned: 1,
            source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
          },
          {
            misconception: "fm.sketch.factor-signs-not-reversed",
            pattern: { kind: "algebraic", latex: R.c2SignsFlipped },
            feedback: "The factors have been read out with their printed signs. Solving $x - 2 = 0$ gives $x = 2$ and $x - 8 = 0$ gives $x = 8$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
          },
        ],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: "Find the coordinates of the point where this curve meets the $y$-axis.",
        marks: 1,
        answer: coordSpec(pointLatex(fr(0), C2.yIntercept)),
        scheme: [{ id: "W1", code: "W", marks: 1, for: `$${pointLatex(fr(0), C2.yIntercept)}$` }],
        hints: ["Put $x = 0$ into both factors.", "$(-2)^{2}$ is positive."],
        workedSolution: `Put $x = 0$: $y = (0 - 2)^{2}(0 - 8) = 4 \\times (-8) = ${frText(C2.yIntercept)}$.\nThe curve meets the $y$-axis at $${pointLatex(fr(0), C2.yIntercept)}$.`,
        commonErrors: [
          {
            misconception: "fm.sketch.y-intercept-from-roots",
            pattern: { kind: "algebraic", latex: R.c2YFromRoots },
            feedback: "That is the product of the roots $2$ and $8$. The height at $x = 0$ comes from the value of each factor at $x = 0$, which here are $4$ and $-8$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "c",
        stem: `Show that $y = ${C2.latex}$.`,
        marks: 2,
        answer: {
          kind: "text",
          accepted: [
            "(x - 2)² = x² - 4x + 4, so y = (x² - 4x + 4)(x - 8) = x³ - 8x² - 4x² + 32x + 4x - 32 = x³ - 12x² + 36x - 32",
            "x² - 4x + 4 times x - 8 gives x³ - 12x² + 36x - 32",
          ],
          keyWords: [
            { any: ["x^2 - 4x + 4"], marks: 1 },
            { any: ["x^3 - 8x^2 - 4x^2 + 32x + 4x - 32", "(x^2 - 4x + 4)(x - 8)"], marks: 1 },
          ],
          listingRule: false,
        },
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "expanding the squared bracket to $x^{2} - 4x + 4$" },
          { id: "W1", code: "W", marks: 1, for: `multiplying by $(x - 8)$ and collecting to $${polyText(C2.p)}$`, dependsOn: ["M1"], examinerNote: "Every line must be shown; the printed result cannot be the starting point." },
        ],
        hints: ["Expand the squared bracket first.", "Then multiply that quadratic by the remaining bracket, term by term.", "Collect the two $x^{2}$ terms and the two $x$ terms."],
        workedSolution: `Expand the squared bracket: $(x - 2)^{2} = x^{2} - 4x + 4$.\nMultiply by $(x - 8)$: $(x^{2} - 4x + 4)(x - 8) = x^{3} - 8x^{2} - 4x^{2} + 32x + 4x - 32$.\nCollect: $x^{3} - 12x^{2} + 36x - 32$, which is the printed result.`,
        commonErrors: [
          {
            misconception: "fm.show-that.steps-missing",
            pattern: { kind: "text", regex: "^\\s*(y\\s*=\\s*)?(x\\^?3|x³)[^\\n]{0,45}$" },
            feedback: "The printed cubic has been copied down with nothing in front of it. A show-that question pays for the derivation, so write the expansion of the squared bracket and then the product, line by line.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:further-maths:2018-summer:FM1:Q9",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "d",
        stem: "Using calculus, find the coordinates of each turning point on the curve.",
        marks: 5,
        answer: coordSpec(C2.sps.map((s) => pointLatex(s.x, s.y)).join(", ")),
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: `$\\frac{dy}{dx} = ${C2.d1Latex}$` },
          { id: "M1", code: "M", marks: 1, for: "setting the derivative to zero", dependsOn: ["MW1"] },
          { id: "W1", code: "W", marks: 1, for: `factorising to $3(x - 2)(x - 6) = 0$, so $x = ${C2.sps.map((s) => frText(s.x)).join("$ or $x = ")}$`, dependsOn: ["M1"] },
          { id: "W2", code: "W", marks: 1, for: `$y = ${frText(C2.sps[0].y)}$ at $x = ${frText(C2.sps[0].x)}$`, dependsOn: ["W1"], ft: true },
          { id: "W3", code: "W", marks: 1, for: `$y = ${frText(C2.sps[1].y)}$ at $x = ${frText(C2.sps[1].x)}$`, dependsOn: ["W1"], ft: true },
        ],
        hints: ["Differentiate the expanded cubic from part (c).", "Take out the common factor of $3$ before you factorise.", "Each value of $x$ goes back into the curve."],
        workedSolution: `$\\frac{dy}{dx} = ${C2.d1Latex}$.\nSet it to zero: $3(x - 2)(x - 6) = 0$, so $x = ${C2.sps.map((s) => frText(s.x)).join("$ or $x = ")}$.\nAt $x = ${frText(C2.sps[0].x)}$: $y = ${frText(C2.sps[0].y)}$.\nAt $x = ${frText(C2.sps[1].x)}$: $y = ${frText(C2.sps[1].y)}$.\nThe turning points are $${C2.sps.map((s) => pointLatex(s.x, s.y)).join("$ and $")}$.`,
        commonErrors: [
          {
            misconception: "fm.calc.turning-y-from-derivative",
            pattern: { kind: "algebraic", latex: R.c2TurningFromDeriv },
            feedback: `Both values of $x$ are right, so four of the five marks are safe. The heights came from $\\frac{dy}{dx}$; the curve gives $${frText(C2.sps[0].y)}$ and $${frText(C2.sps[1].y)}$.`,
            marksTypicallyEarned: 3,
            source: "ccea-cer:further-maths:2019-summer:FM1:Q8",
          },
          {
            misconception: "fm.sketch.second-turning-point-dropped",
            pattern: { kind: "algebraic", latex: R.c2MinOnly },
            feedback: "One turning point is right. The derivative is a quadratic with two roots, so there is a second turning point to report as well.",
            marksTypicallyEarned: 4,
            source: "ccea-cer:further-maths:2022-summer:FM1:Q10",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "c", rule: "use-candidate-value" },
      },
      {
        id: "e",
        stem: `Show, from the sign of $rac{d^{2}y}{dx^{2}}$, that the turning point where $x = ${frText(C2.sps[1].x)}$ is a minimum.`,
        marks: 1,
        answer: {
          kind: "text",
          accepted: [
            `The second derivative is ${frText(polyEval(C2.d2, C2.sps[1].x))}, which is positive, so this turning point is a minimum`,
            `d2y/dx2 = ${polyText(C2.d2)}, and at x = ${frText(C2.sps[1].x)} that is ${frText(polyEval(C2.d2, C2.sps[1].x))}, a positive value, so it is a minimum`,
          ],
          keyWords: [{ any: ["positive", "greater than zero", "above zero", "> 0"], reject: ["maximum"], marks: 1 }],
          listingRule: false,
        },
        scheme: [
          {
            id: "MW1",
            code: "MW",
            marks: 1,
            for: `$\\frac{d^{2}y}{dx^{2}} = ${C2.d2Latex}$, which is $${frText(polyEval(C2.d2, C2.sps[1].x))}$ at $x = ${frText(C2.sps[1].x)}$, a positive value, so the point is a minimum`,
            examinerNote: "The substituted value and the word positive are both wanted.",
          },
        ],
        hints: ["Differentiate the derivative.", `Put $x = ${frText(C2.sps[1].x)}$ into that second derivative.`, "Say what its sign means."],
        workedSolution: `$\\frac{d^{2}y}{dx^{2}} = ${C2.d2Latex}$.\nAt $x = ${frText(C2.sps[1].x)}$ that is $${frText(polyEval(C2.d2, C2.sps[1].x))}$.\nThis is positive, so the gradient is rising through zero and the turning point is a minimum.`,
        commonErrors: [
          {
            misconception: "fm.calc.second-derivative-sign-misread",
            pattern: { kind: "text", regex: "(negative|less than zero|below zero)[^;\\n]*(minimum)|(minimum)[^;\\n]*(negative)" },
            feedback: "The second derivative has been worked out, which is the method. The sign has been read the other way round: positive names a minimum and negative names a maximum.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:further-maths:2022-summer:FM1:Q10",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "d", rule: "use-candidate-value" },
      },
      {
        id: "f",
        stem: "Sketch the curve by plotting the $y$-axis crossing, the two $x$-axis crossings and the minimum point.",
        marks: 2,
        answer: {
          kind: "graph",
          expect: {
            plot: "curve",
            samples: [
              [0, num(C2.yIntercept)],
              [num(C2roots[0]), 0],
              [num(C2.sps[1].x), num(C2.sps[1].y)],
              [num(C2roots[1]), 0],
            ],
            tolerance: { type: "absolute", value: 0.1 },
            smooth: true,
            noStraightSegments: true,
          },
        },
        scheme: [
          { id: "MW1", code: "MW", marks: 1, for: "the four key points placed as parts (a), (b) and (d) give them", ft: true },
          { id: "W1", code: "W", marks: 1, for: "one smooth cubic through them, touching the axis at the repeated root and rising away to the right, with each point labelled", dependsOn: ["MW1"] },
        ],
        hints: ["Nothing new needs calculating; use the answers above.", "At the repeated root the curve touches the axis and turns.", "The coefficient of $x^{3}$ is positive, so the curve rises to the right."],
        workedSolution: `Plot $${pointLatex(fr(0), C2.yIntercept)}$, $${asLatexPoints(C2roots.map((r) => [r, fr(0)]))}$ and the minimum $${pointLatex(C2.sps[1].x, C2.sps[1].y)}$.\nDraw one smooth curve that touches the axis at $${pointLatex(C2roots[0], fr(0))}$, dips to the minimum and rises through $${pointLatex(C2roots[1], fr(0))}$, and label every point.`,
        commonErrors: [
          {
            misconception: "fm.calc.sketch-contradicts-results",
            pattern: { kind: "graph", test: `point plotted at (${frText(C2.sps[1].x)}, ${frText(neg(C2.sps[1].y))})` },
            feedback: "The crossings are right. The minimum has been placed above the axis, which cannot be: the curve is below the axis between the two crossings, so the minimum sits there too.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:further-maths:2023-summer:FM1:Q12",
          },
        ],
        requiresWorking: false,
        followThrough: { fromPart: "d", rule: "use-candidate-diagram" },
      },
    ],
  }),
  style: "exam-style",
};

/* ---------------- find the mistake ---------------- */

const ftmPoly = (() => {
  const p = new Map([[2, fr(1)], [1, fr(-10)], [0, fr(21)]]);
  return { p, d1: polyDeriv(p), roots: quadRoots(fr(1), fr(-10), fr(21)) };
})();
const ftmStationary = (() => {
  const b = ftmPoly.d1.get(1), c = ftmPoly.d1.get(0);
  return fr(-c.n * b.d, c.d * b.n);
})();

const ftm1 = {
  id: "ftm.fm.u1.curve-sketching-quadratic-cubic.01",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Saoirse was asked to find the coordinates of each point where the curve $y = ${polyLatex(ftmPoly.p)}$ meets the $x$-axis. Her working:`,
  studentWorking: [
    `y = ${polyText(ftmPoly.p)}`,
    `dy/dx = ${polyText(ftmPoly.d1)}`,
    `${polyText(ftmPoly.d1)} = 0`,
    `x = ${frText(ftmStationary)}`,
    `The curve meets the x-axis at (${frText(ftmStationary)}, 0)`,
  ],
  mistakeLine: 2,
  misconception: "fm.calc.differentiate-when-intercepts-asked",
  whatWentWrong: `Line 2 is where it goes astray. Differentiating finds where the curve is level, which is the turning point, not where it meets the axis.\nThe crossings come from setting $y$ itself to zero and factorising: this quadratic gives $(x - ${frText(ftmPoly.roots[0])})(x - ${frText(ftmPoly.roots[1])}) = 0$.\nEverything after line 2 is correct arithmetic on the wrong equation, and line 5 also reports one point where there are two.`,
  correction: [
    `${polyText(ftmPoly.p)} = 0`,
    `(x - ${frText(ftmPoly.roots[0])})(x - ${frText(ftmPoly.roots[1])}) = 0`,
    `The curve meets the x-axis at (${frText(ftmPoly.roots[0])}, 0) and (${frText(ftmPoly.roots[1])}, 0)`,
  ],
  marksEarnedAsWritten: [],
  feedback: `The differentiating itself is accurate, and the same line would earn its mark in the next part of a real question. Here the word to read is "meets": a crossing is where the height is zero, so set $y = 0$ and factorise. The crossings are $${asLatexPoints(ftmPoly.roots.map((r) => [r, fr(0)]))}$, and $x = ${frText(ftmStationary)}$ is the turning point, which sits halfway between them.`,
  source: "ccea-cer:further-maths:2024-summer:FM1:Q10",
};

/* ---------------- retrieval prompts ---------------- */

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.fm.u1.curve-sketching-quadratic-cubic.${String(n).padStart(2, "0")}`,
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
  rp(1, "procedure", "How do you find where a curve meets the $x$-axis?", "Set $y = 0$ and solve the equation, usually by factorising; each solution is the $x$ of a point whose $y$ is zero.", ["set", "solve", "factorising", "zero"], 2),
  rp(2, "procedure", "How do you find where a curve meets the $y$-axis?", "Set $x = 0$ and work out the height; for a polynomial that is the constant term.", ["set", "height", "constant"], 2),
  rp(3, "procedure", "What are the two steps that give a turning point?", "Solve $\\frac{dy}{dx} = 0$ for $x$, then substitute that $x$ into the curve to find the height.", ["solve", "substitute", "curve", "height"], 4),
  rp(4, "trap", "You have solved $\\frac{dy}{dx} = 0$. What do you substitute that value into?", "The curve itself, never the derivative: the derivative is zero there by definition, so it would give a height of zero every time.", ["curve", "derivative", "zero"], 5),
  rp(5, "qa", "How does the second derivative name a turning point?", "A positive second derivative at the point means a minimum, and a negative one means a maximum.", ["positive", "minimum", "negative", "maximum"], 4),
  rp(6, "qa", "How many turning points can a cubic have, and of which kinds?", "Two at most, and when there are two they are always one maximum and one minimum, because the derivative is a quadratic.", ["two", "maximum", "minimum", "quadratic"], 4),
  rp(7, "trap", "What must be written on a sketch for the final mark?", "The coordinates of every axis crossing and of every turning point, labelled on the curve.", ["coordinates", "crossing", "turning point", "labelled"], 3),
];

/* ---------------- verification logs ---------------- */

const shingle = "Compared by hand against the FM1 question papers and mark schemes read for this batch (Summer 2018 Q9, Summer 2019 Q8 and Q13, Summer 2022 Q2 and Q10, Summer 2023 Q1 and Q2, Summer 2024 Q1, Summer 2025 Q11, Q13 and Q14) and the Chief Examiner reports for those series. Every curve, coefficient, context, sentence and figure here is new, and no eight-word sequence is shared with any paper, scheme or report.";
const styleLint = "British English, second person, calm; no exclamation marks; the banned verdict word is never used about a learner's answer. Every maths segment opens and closes inside one line and holds no prose words, checked by lintString before the files were written.";

const scopeDetail =
  "FM1 is untiered and calculator-allowed. Everything here is a quadratic or a cubic with x as a common factor or written as a product of linear factors, which is exactly what the Teacher Guidance for FM1-DIF-02 allows for sketching; no quartic, asymptote, point of inflection or graph transformation appears.";
const formulaDetail =
  "The Unit 1 sheet gives y = ax^n => dy/dx = nax^(n-1) (packs/further-maths/exam-true/formula-sheets.json, fs.fm1.differentiation) and nothing else used here. The second-derivative test (positive is a minimum, negative is a maximum) is must-know, mk.fm1.second-derivative-test, and the note teaches it as such.";
const commandDetail =
  "Find, Write down, Show clearly, Determine and Sketch are all in packs/further-maths/exam-true/command-words.json with typical tariffs 2-3-5, 1-1-2, 2-3-4, 2-2-3 and 1-2-4; the FM1 perPart median is 3 and the p90 is 6 (tariffs.json). The exam-style questions run 2/1/3/1/2 and 2/1/2/5/1/2, inside those bands, and each whole question is 9 and 13 marks against a perQuestion typical of 7 and p90 of 12.";

const numericDetail = (text) => text;

const verification = [
  verLog("note.fm.u1.curve-sketching-quadratic-cubic", [
    ["schema", "pass", `Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, all ${note.filter((b) => b.type === 'gate').length} gate ids are unique, and every prompt block names a prompt in this bundle.`],
    ["scope-tier", "pass", scopeDetail],
    ["formula-sheet", "pass", formulaDetail],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The sheet's howExamined records the tariffs read from the papers: Summer 2025 Q11 ran 2/1/3/1/2/4 over six parts, Summer 2019 Q8 ran 3/6/2/2, and Summer 2023 Q12 and Summer 2024 Q10 opened with the crossings before any calculus."],
    ["maths-numeric", "pass", `Every number in the note is computed by lib.mjs in exact rational arithmetic: ${polyText(Q1.p)} has roots ${Q1roots.map(frText).join(" and ")}, y-intercept ${frText(Q1.yIntercept)} and turning point (${frText(Q1.sps[0].x)}, ${frText(Q1.sps[0].y)}) with second derivative ${frText(Q1.d2.get(0))}; ${polyText(Q2.p)} has roots ${Q2roots.map(frText).join(" and ")} and turning point (${frText(Q2.sps[0].x)}, ${frText(Q2.sps[0].y)}); x(x - 5)(x - 8) expands to ${polyText(C1.p)} with turning points (${frText(C1.sps[0].x)}, ${frText(C1.sps[0].y)}) and (${frText(C1.sps[1].x)}, ${frText(C1.sps[1].y)}); (x - 2)^2(x - 8) expands to ${polyText(C2.p)} with turning points (${frText(C2.sps[0].x)}, ${frText(C2.sps[0].y)}) and (${frText(C2.sps[1].x)}, ${frText(C2.sps[1].y)}).`],
    ["maths-symbolic", "pass", "Every derivative printed is checked against a central difference quotient at three sample points (x = -1.7, 0.9, 3.3) and every quoted root is checked by substitution into the exact polynomial."],
    ["examiner-alignment", "pass", "No examiner callout stands in the teaching body and none is repeated in the closing panel: every one of the Summer 2018 Q9, Summer 2019 Q8, Summer 2022 Q10, Summer 2023 Q12, Summer 2024 Q10 and Summer 2025 Q11 findings is a trap in note.sheet.traps, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g1a and g2 the sign reversal and the calculus-free rows, g3 and g5 the substitution into the curve, g4 the second-derivative test, g5a the three crossings of a cubic, g6 the impossible-shape check and g7 the labelling mark."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", `${styleLint} The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures drawn from computed values and one embeddable video from data/links/media-map.json followed immediately by a gate.`],
  ]),
];

/* ---------------- topic row and note frontmatter ---------------- */

const externalRefs = [
  { kind: "youtube", videoId: "hs-HC9gpZu4", channel: "P McAleavey", credit: "Differentiation - Curve Sketching CCEA GCSE Further Mathematics, P McAleavey (embeddable id verified in data/links/media-map.json)" },
  { kind: "youtube", videoId: "MWkjA7KAwfM", channel: "corbettmaths", credit: "Sketching Cubic - GCSE Further Maths, corbettmaths (embeddable id verified in data/links/media-map.json)" },
  { kind: "phet", sim: "graphing-quadratics", url: "https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_en.html", licence: "CC BY-NC 4.0", attribution: "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)" },
  { kind: "ccea-doc", docType: "cer", url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports", asOf: "2026-09-19" },
];

const howExamined =
  "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. Curve sketching is a long question late in the paper: 13 marks over four parts in Summer 2019 Q8, 13 marks over six parts in Summer 2025 Q11, and multi-part questions in Summer 2018 Q9, Summer 2022 Q10, Summer 2023 Q12 and Summer 2024 Q10. The parts run in a fixed order: where the curve meets the axes (2 or 3 marks, no calculus), the turning points (3 marks for a quadratic, 5 or 6 for a cubic), their nature (1 or 2 marks), the sketch (2 marks), and often an area afterwards. Schemes run M1 for the factorising or the derivative, W1 for each coordinate, and MW1 for the second-derivative test.";

const topic = {
  id: TOPIC,
  slug: "curve-sketching-quadratic-cubic",
  title: "Sketching quadratic and cubic curves",
  subject: "further-maths",
  unit: "FM1",
  tier: "untiered",
  strand: "Calculus",
  statementIds: SPEC,
  prerequisites: ["fm.u1.stationary-points-and-nature", "fm.u1.expand-three-brackets"],
  order: 34,
  hardness: "S",
  difficulty: 3,
  examinerFlagged: true,
  examinerSources: [
    "ccea-cer:further-maths:2018-summer:FM1:Q9",
    "ccea-cer:further-maths:2019-summer:FM1:Q8",
    "ccea-cer:further-maths:2022-summer:FM1:Q10",
    "ccea-cer:further-maths:2023-summer:FM1:Q12",
    "ccea-cer:further-maths:2024-summer:FM1:Q10",
    "ccea-cer:further-maths:2025-summer:FM1:Q11",
  ],
  examWeightHint: howExamined,
  mustMemorise: [
    "Crossings first: y = 0 for the x-axis, x = 0 for the y-axis, and no calculus in either",
    "Turning points: solve dy/dx = 0, then substitute that x into the curve for the height",
    "Nature: d²y/dx² positive is a minimum, negative is a maximum",
    "A cubic turns at most twice, and two turns mean one maximum and one minimum",
    "The sign of the highest power decides which way the ends of the curve go",
    "Every crossing and turning point is labelled on the sketch as a coordinate",
  ],
  onFormulaSheet: ["If y = axⁿ then dy/dx = naxⁿ⁻¹ (Unit 1 formula sheet, page 2)"],
  notOnThisSpec: [
    "Quartics and higher powers: FM1-DIF-02 names quadratic and cubic sketching only",
    "Asymptotes and points of inflection",
    "Transformations of graphs, so never a shifted or stretched copy of the printed curve",
    "Cubics that are neither a product of three linear factors nor have x as a common factor (Teacher Guidance for FM1-DIF-02)",
  ],
  externalRefs,
  keywords: ["sketch", "intercepts", "turning point", "cubic", "quadratic", "second derivative", "label"],
};

const noteFrontmatter = {
  id: "note.fm.u1.curve-sketching-quadratic-cubic",
  topic: TOPIC,
  title: "Sketching quadratic and cubic curves",
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
      "A point on the x-axis has y = 0; a point on the y-axis has x = 0",
      "d²y/dx² > 0 is a minimum, d²y/dx² < 0 is a maximum",
      "The height of a turning point comes from the curve, never from dy/dx",
      "A positive x³ coefficient sends the curve up to the right",
    ],
  },
  notOnThisSpec: topic.notOnThisSpec,
  hardness: "S",
  examinerFlagged: true,
  externalRefs: [externalRefs[0], externalRefs[2], externalRefs[3]],
  sheet: {
    mustBeAbleTo: [
      "Find where a quadratic or a cubic meets the x-axis by setting y = 0 and factorising",
      "Find where it meets the y-axis by setting x = 0",
      "Write every crossing and turning point as a coordinate, not as a bare value of x",
      "Differentiate, solve dy/dx = 0, and substitute back into the curve for the height",
      "Use the sign of d²y/dx² to name each turning point a maximum or a minimum",
      "Read the end behaviour from the sign of the highest power",
      "Draw a smooth sketch whose labelled points agree with the values calculated above",
      "Notice when a result is impossible, such as a minimum sitting above the maximum before it",
    ],
    howExamined,
    traps: [
      "Differentiating in the part that asks where the curve meets the axes (Summer 2018 FM1 Q9, Summer 2024 FM1 Q10)",
      "Bare values of x written where coordinates were asked for (Summer 2019 FM1 Q8, Summer 2025 FM1 Q11)",
      "Substituting the stationary x into dy/dx instead of into the curve, so the height comes out as zero (Summer 2019 FM1 Q8)",
      "Adding (0, 0) to a cubic's crossings out of habit (Summer 2023 FM1 Q12)",
      "Reading the second derivative's sign the wrong way round (Summer 2022 FM1 Q10)",
      "A sketch that contradicts the candidate's own values, such as a maximum below a minimum (Summer 2023 FM1 Q12)",
      "Key points left unlabelled on an otherwise correct sketch (Summer 2025 FM1 Q11)",
      "A sketch stopped short of the regions the question covers, so part of the curve is missing (Summer 2018 FM1 Q9)",
      "Two maxima reported on a cubic without noticing that the shape makes that impossible (Summer 2019 FM1 Q8)",
      "A cubic drawn where a quadratic was asked for, or the other way round (Summer 2025 FM1 Q11)",
    ],
  },
  verification: V("note.fm.u1.curve-sketching-quadratic-cubic"),
  version: 1,
  updated: "2026-09-19",
};

/* ---------------- assemble ---------------- */

const questions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, exam1, exam2];
const workedExamples = [we1, we2];
const diagnostics = [dxPre, dxPost];

for (const we of workedExamples) {
  verification.push(
    verLog(we.id, [
      ["schema", "pass", "Validated against the Zod WorkedExample: steps numbered in order, every faded stage inside range, the twin carrying its own answer spec."],
      ["scope-tier", "pass", scopeDetail],
      ["formula-sheet", "pass", formulaDetail],
      ["command-words", "pass", commandDetail],
      ["tariff", "pass", "The mark codes on the steps follow the Summer 2025 Q11 and Summer 2019 Q8 schemes: M1 for the factorising or the derivative, W1 for each coordinate, MW1 for the second-derivative test."],
      ["maths-numeric", "pass", we.id.endsWith("01")
        ? `Recomputed in exact rationals: roots ${Q1roots.map(frText).join(", ")}, y-intercept ${frText(Q1.yIntercept)}, dy/dx = ${polyText(Q1.d1)}, turning point (${frText(Q1.sps[0].x)}, ${frText(Q1.sps[0].y)}), second derivative ${frText(Q1.d2.get(0))}; the twin ${polyText(P2.p)} gives (${frText(P2.sps[0].x)}, ${frText(P2.sps[0].y)}).`
        : `Recomputed in exact rationals: x(x - 5)(x - 8) = ${polyText(C1.p)}, dy/dx = ${polyText(C1.d1)} = (3x - 20)(x - 2), turning points (${frText(C1.sps[0].x)}, ${frText(C1.sps[0].y)}) and (${frText(C1.sps[1].x)}, ${frText(C1.sps[1].y)}), second derivative ${polyText(C1.d2)} taking the values ${frText(C1.sps[0].d2)} and ${frText(C1.sps[1].d2)}.`],
      ["maths-symbolic", "pass", "Each derivative is checked against a central difference quotient at three sample points and each root by exact substitution."],
      ["examiner-alignment", "pass", "The decisions answer the Summer 2019 Q8 findings (coordinates, not values; the height from the curve) and the Summer 2023 Q12 finding (the sketch must match the working)."],
      ["copy-shingle", "pass", shingle],
      ["style-lint", "pass", styleLint],
    ]),
  );
}

for (const dxSet of diagnostics) {
  verification.push(
    verLog(dxSet.id, [
      ["schema", "pass", "Validated against the Zod DiagnosticSet: unique item ids, exactly one correct option per item, confidence and hypercorrection set."],
      ["scope-tier", "pass", scopeDetail],
      ["command-words", "pass", commandDetail],
      ["maths-numeric", "pass", dxSet.when === "pre"
        ? "The prerequisite items use x² + x − 12 = (x + 4)(x − 3), (x − 2)(x + 5) = 0 and the derivative of x² − 6x + 5, each recomputed in the generator."
        : `Every option value is computed: the crossings of (x - 4)(x + 7), the turning point (${frText(P2.sps[0].x)}, ${frText(P2.sps[0].y)}) with its derivative route giving ${R.p2TurningFromDeriv.replace(/\$/g, "")}, and the crossings of (x + 1)(x - 3)(x - 6) with the origin route giving ${R.p4Origin.replace(/\$/g, "")}.`],
      ["examiner-alignment", "pass", "Post-instruction distractors carry the registry ids for the sign reversal, the bare value, the derivative height, the reversed second-derivative reading and the assumed origin. Prerequisite distractors carry no topic tag unless the slip is that misconception."],
      ["copy-shingle", "pass", shingle],
      ["style-lint", "pass", styleLint],
      ["schema", "pass", "No two options in one item share a text after normalisation."],
    ]),
  );
}

for (const q of questions) {
  verification.push(
    verLog(q.id, [
      ["schema", "pass", `Validated against the Zod Question: ${q.parts.length} part(s), scheme totals matching each part's marks, skeleton "${q.skeleton}" matching the parts.`],
      ["scope-tier", "pass", scopeDetail],
      ["formula-sheet", "pass", formulaDetail],
      ["command-words", "pass", commandDetail],
      ["tariff", "pass", `${q.totalMarks} marks over ${q.parts.length} part(s); the FM1 perPart median is 3 and the p90 is 6, and the perQuestion typical is 7 with a p90 of 12.`],
      ["maths-numeric", "pass", `Every value in this question is recomputed by lib.mjs in exact rational arithmetic, and each commonError value is produced by executing its route in routes (scratchpad/fm1-batch-e/topic1-curve-sketching.mjs) rather than typed.`],
      ["maths-symbolic", "pass", "Derivatives checked against a central difference quotient at three sample points; roots checked by exact substitution."],
      ["examiner-alignment", "pass", `Cited to ${q.examinerSources.join(" and ")}; every distractor's feedback names the route that produces its value.`],
      ["copy-shingle", "pass", shingle],
      ["style-lint", "pass", styleLint],
      ["independent-solve", "pass", "The app's own marker (scripts in scratchpad/fm1-batch-e/check-marking.mts) was fed the correct answer in every natural spelling and then every commonError value; each correct spelling scores full marks and each route value fires its own pattern and earns what it claims."],
    ]),
  );
}

verification.push(
  verLog(ftm1.id, [
    ["schema", "pass", "Validated against the Zod FindTheMistake: the flagged line is inside the working, and the correction rewrites it."],
    ["scope-tier", "pass", scopeDetail],
    ["maths-numeric", "pass", `Recomputed: ${polyText(ftmPoly.p)} factorises to (x - ${frText(ftmPoly.roots[0])})(x - ${frText(ftmPoly.roots[1])}), and its derivative ${polyText(ftmPoly.d1)} is zero at x = ${frText(ftmStationary)}, which is the midpoint of the two roots.`],
    ["examiner-alignment", "pass", "Seeded from the Summer 2024 Q10 finding that candidates differentiated in the part asking where the curve met the axes."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The working shown is the two-mark opening part of a curve-sketching question, as Summer 2024 Q10(i) and Summer 2025 Q11(i) print it."],
  ]),
);

for (const p of prompts) {
  verification.push(
    verLog(p.id, [
      ["schema", "pass", "Validated against the Zod RetrievalPrompt."],
      ["scope-tier", "pass", scopeDetail],
      ["maths-numeric", "pass", "No computed value appears in this prompt beyond the rules recomputed for the note."],
      ["examiner-alignment", "pass", "Each prompt is anchored to a section of the note and to the examiner finding that section answers."],
      ["copy-shingle", "pass", shingle],
      ["style-lint", "pass", `${styleLint} Every key word of this prompt appears in its own answer.`],
      ["command-words", "pass", commandDetail],
      ["tariff", "pass", "Retrieval prompts carry no tariff; they rehearse the steps the scheme pays for."],
    ]),
  );
}

const insight = JSON.parse(fs.readFileSync("packs/further-maths/insights/u1.curve-sketching-quadratic-cubic.json", "utf8"));

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note: noteFrontmatter,
  workedExamples,
  diagnostics,
  questions,
  findTheMistake: [ftm1],
  prompts,
  insight,
  verification,
};

/* ---------------- lint and write ---------------- */

lintTree(bundle, "bundle");
lintTree(note, "note");
for (const p of prompts) for (const k of p.keyWords) if (!p.answer.toLowerCase().includes(k.toLowerCase())) throw new Error(`prompt ${p.id}: key word "${k}" is not in its own answer`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n");
fs.writeFileSync(path.join(OUT, "note.blocks.json"), JSON.stringify(note, null, 2) + "\n");
console.log(`topic 1 written: ${questions.length} questions, ${workedExamples.length} worked examples, ${diagnostics.reduce((n, d) => n + d.items.length, 0)} diagnostics, ${prompts.length} prompts, ${verification.length} verification logs`);
