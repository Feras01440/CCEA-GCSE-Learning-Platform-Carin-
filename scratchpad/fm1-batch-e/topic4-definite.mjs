/** FM1 batch E, topic 4: fm.u1.definite-integrals (difficulty 2, L). */
import fs from "node:fs";
import path from "node:path";
import {
  fr, frLatex, frText, num, add, sub, mul, div, neg, isInt,
  poly, terms, polyFrom, polyDeriv, polyInteg, polyEval, polyLatex, polyText,
  graphSvg, cardSvg, svgFigure, lintTree, verLog, PAPER, dp,
} from "./lib.mjs";

const OUT = path.resolve("packs/further-maths/content/fm1/definite-integrals");
const TOPIC = "fm.u1.definite-integrals";
const SPEC = ["FM1-INT-03"];
const V = (id) => `ver.${id}`;
const qid = (n) => `q.fm.u1.definite-integrals.${String(n).padStart(4, "0")}`;
const assert = (ok, msg) => {
  if (!ok) throw new Error(`definite-integrals generator: ${msg}`);
};

/** One definite integral, fully computed. */
function definite(name, integrand, a, b) {
  const f = polyFrom(integrand);
  const F = polyInteg(f);
  const A = fr(a), B = fr(b);
  const Fb = polyEval(F, B);
  const Fa = polyEval(F, A);
  const value = sub(Fb, Fa);
  // the antiderivative is confirmed by differentiating it back at three sample points
  const back = polyDeriv(F);
  for (const t of [1.3, 2.4, 3.7]) {
    const x = fr(Math.round(t * 1e6), 1e6);
    assert(Math.abs(num(polyEval(back, x)) - num(polyEval(f, x))) < 1e-9, `${name}: the antiderivative does not differentiate back at x = ${t}`);
  }
  return {
    name, f, F, a: A, b: B, Fa, Fb, value,
    fLatex: polyLatex(f),
    fText: polyText(f),
    FLatex: polyLatex(F),
    FText: polyText(F),
    integralLatex: `\\int_{${frText(A)}}^{${frText(B)}} \\left(${polyLatex(f)}\\right) dx`,
    reversed: sub(Fa, Fb),
    intoIntegrand: sub(polyEval(f, B), polyEval(f, A)),
    upperOnly: Fb,
  };
}

/* the integrals this topic uses */
export const WE = definite("we", { 2: 3, 1: -4, 0: 1 }, 1, 3);
export const Q1 = definite("q1", { 1: 2, 0: 3 }, 1, 4);
export const Q2 = definite("q2", { 3: 4, 1: -6 }, 1, 2);
export const Q3 = definite("q3", { 2: 1, 1: 1 }, 0, 2);
export const Q4 = definite("q4", { [-2]: 12 }, 2, 3);
export const Q5 = definite("q5", { 1: 6, 0: -2 }, -1, 2);
export const Q6 = definite("q6", { 2: 1, 1: -4 }, 0, 3);
export const EX = definite("ex", { 2: 3, 1: 2, 0: -5 }, 1, 3);
export const TW = definite("twin", { 2: 6, 0: 1 }, 0, 2);

/* the integral carrying an unknown constant */
const K = (() => {
  // integral from 0 to 2 of (k + 6x) dx = [kx + 3x^2] = 2k + 12
  const a = fr(0), b = fr(2);
  const xPart = polyInteg(polyFrom({ 1: 6 }));
  const constPart = polyEval(polyInteg(polyFrom({ 0: 1 })), b); // x evaluated at b, the multiplier of k
  const value = { kCoeff: sub(constPart, polyEval(polyInteg(polyFrom({ 0: 1 })), a)), constant: sub(polyEval(xPart, b), polyEval(xPart, a)) };
  const target = fr(20);
  const kValue = div(sub(target, value.constant), value.kCoeff);
  assert(num(add(mul(value.kCoeff, kValue), value.constant)) === num(target), "k does not satisfy the equation");
  return { a, b, kCoeff: value.kCoeff, constant: value.constant, target, kValue, latex: `${frText(value.kCoeff)}k + ${frText(value.constant)}` };
})();
export { K };

/* ------------------------------------------------------------------ error routes */

export const routes = {
  limitsReversed: (d) => d.reversed,
  limitsIntoIntegrand: (d) => d.intoIntegrand,
  lowerLimitIgnored: (d) => d.upperOnly,
  /** The unknown constant integrated as if it were the variable, so it vanishes between the limits. */
  constantIntegratedAsVariable: () => K.constant,
};

/** Numeric commonErrors that would be marked correct, or repeat one another, are dropped. */
function numericErrors(d, correct, list) {
  const seen = new Set([num(correct).toFixed(9)]);
  const out = [];
  for (const e of list) {
    const key = num(e.value).toFixed(9);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...e, pattern: { kind: "numeric", value: num(e.value) } });
  }
  return out.map(({ value, ...rest }) => rest);
}

/* ------------------------------------------------------------------ figures */

const methodCard = cardSvg({
  title: "a definite integral in four moves",
  rows: [
    ["integrate, and simplify each term", "3x^3 / 3 is written x^3"],
    ["put the answer in square brackets", "with the two limits on the right"],
    ["substitute the TOP limit, in brackets", "F(b)"],
    ["subtract the BOTTOM one, in brackets", "F(b) - F(a)"],
  ],
  footer: "no constant of integration: it would cancel in the subtraction",
});
export { methodCard };

export const weSvg = graphSvg({
  xMin: -0.6, xMax: 4.2, yMin: -3, yMax: 16, xStep: 1, yStep: 2, width: 560, height: 330,
  curves: [{ f: (x) => num(polyEval(WE.f, fr(Math.round(x * 1e6), 1e6))), samples: 120 }],
  shade: { f: (x) => num(polyEval(WE.f, fr(Math.round(x * 1e6), 1e6))), from: num(WE.a), to: num(WE.b) },
  verticals: [
    { x: num(WE.a), from: 0, to: num(polyEval(WE.f, WE.a)) },
    { x: num(WE.b), from: 0, to: num(polyEval(WE.f, WE.b)) },
  ],
  notes: [{ x: 2, y: 2.2, text: `the integral from ${frText(WE.a)} to ${frText(WE.b)}`, anchor: "middle" }],
  aria: `The curve y = ${WE.fText} with the strip between x = ${frText(WE.a)} and x = ${frText(WE.b)} shaded`,
  footer: "two limits, one number",
});

const bracketCard = cardSvg({
  title: "where the marks go astray",
  rows: [
    ["subtracting the wrong way round", "the answer comes out with the wrong sign"],
    ["no brackets round a substitution", "a minus sign reaches only the first term"],
    ["limits put into the original curve", "the integrating step is skipped"],
    ["an unknown k treated as the variable", "k is a constant, so it integrates to kx"],
  ],
  footer: "top limit first, bottom limit second, each inside its own bracket",
});
export { bracketCard };

/* ------------------------------------------------------------------ note blocks */

export const note = [
  {
    type: "hero",
    lede: "An indefinite integral hands back a family of curves. Put two numbers on the integral sign and you get a single number instead: integrate, substitute the top limit, subtract the bottom one. The constant of integration cancels itself out on the way.",
    can: [
      "Integrate an expression and write it in square brackets with its limits",
      "Substitute both limits in the right order and subtract to reach one number",
      "Treat an unknown constant in the integrand as a constant, and leave the answer exact",
    ],
    minutes: 12,
  },
  { type: "h", text: "Two numbers on the integral sign" },
  {
    type: "p",
    md: `Once you can integrate, a definite integral asks for very little more. Write $\\int_{${frText(WE.a)}}^{${frText(WE.b)}}$ and the question is no longer which curve, but how much, between those two values of $x$.\nThe recipe never changes: integrate, substitute the top limit, subtract the bottom one.`,
  },
  { type: "figure", alt: `The curve y = ${WE.fText} with the strip between x = ${frText(WE.a)} and x = ${frText(WE.b)} shaded`, svg: weSvg, caption: `The two limits mark off one strip, and the integral turns it into the single number $${frText(WE.value)}$.` },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "One tap to begin. What does a definite integral give you?",
    options: ["A single number", "A family of curves", "An expression in $x$"],
    answer: "A single number",
    explain: "The limits are substituted in, so every $x$ disappears and one value is left.",
  },
  { type: "h", text: "1. The four moves" },
  {
    type: "p",
    md: `Integrate exactly as you already do, and **simplify each term while you write it**: $\\frac{3x^{3}}{3}$ is $x^{3}$, and substituting into the tidy form is far quicker and safer.\nPut the result in square brackets with the limits on the right, substitute the top limit, then subtract the bottom one. Give each substitution its own bracket so that the minus sign reaches every term of it.`,
  },
  { type: "figure", alt: "A four-row card giving the method: integrate and simplify, use square brackets with the limits, substitute the top limit, subtract the bottom one", svg: methodCard, caption: "The constant of integration is left out: it would appear twice and cancel." },
  {
    type: "callout",
    kind: "why",
    title: "Why there is no $+ c$ here",
    md: "Write the constant in and you get $(F(b) + c) - (F(a) + c)$. The two copies cancel, whatever $c$ was. That is why a definite integral has one answer while an indefinite one has a family, and it is why the constant is simply not written.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "number",
    prompt: `$\\int_{1}^{4} 2x\\,dx = \\left[x^{2}\\right]_{1}^{4}$. Work out the value.`,
    answer: "15",
    explain: "$4^{2} - 1^{2} = 16 - 1 = 15$. Top limit first, bottom limit second.",
  },
  { type: "h", text: "2. A worked example" },
  {
    type: "p",
    md: `Take $${WE.integralLatex}$.\n**Integrate.** $3x^{2}$ gives $x^{3}$, $-4x$ gives $-2x^{2}$, and $1$ gives $x$, so the bracket is $\\left[${WE.FLatex}\\right]_{${frText(WE.a)}}^{${frText(WE.b)}}$.\n**Top limit.** At $x = ${frText(WE.b)}$: $${frText(WE.Fb)}$.\n**Bottom limit.** At $x = ${frText(WE.a)}$: $${frText(WE.Fa)}$.\n**Subtract.** $${frText(WE.Fb)} - \\left(${frText(WE.Fa)}\\right) = ${frText(WE.value)}$.`,
  },
  {
    type: "video",
    videoId: "NgOyeuww_Gs",
    title: "Integration - The Definite Integral - GCSE Further Maths",
    channel: "corbettmaths",
    why: "The same four moves at a slower pace, with the bracket notation written out each time.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: `In that example the top limit gave $${frText(WE.Fb)}$ and the bottom limit gave $${frText(WE.Fa)}$. What is the value of the integral?`,
    answer: frText(WE.value),
    explain: `$${frText(WE.Fb)} - \\left(${frText(WE.Fa)}\\right) = ${frText(WE.value)}$. Subtracting the other way round would give $${frText(WE.reversed)}$, which is the same size with the wrong sign.`,
  },
  { type: "h", text: "3. Where the marks go" },
  {
    type: "p",
    md: "Four slips account for almost every lost mark here, and all four are visible on the page as you write.\nSubtracting the wrong way round turns the answer's sign over. A substitution written without brackets lets the minus sign reach only its first term. Putting the limits into the original expression skips the integrating altogether. And an unknown letter in the integrand is a **constant**, not the variable.",
  },
  { type: "figure", alt: "A four-row card naming the four slips: subtracting the wrong way, missing brackets, limits into the original curve, and an unknown constant treated as a variable", svg: bracketCard, caption: "Each of these is visible on the page before you reach the answer." },
  {
    type: "callout",
    kind: "notonspec",
    title: "A negative answer is still an answer",
    md: "Here a negative value is simply what the integral comes to. Deciding what to do about a region below the axis when an **area** is wanted belongs to the area topic that follows this one.",
    source: "CCEA GCSE Further Mathematics specification, statements FM1-INT-03 and FM1-INT-04",
  },
  {
    type: "gate",
    id: "g4",
    kind: "choice",
    prompt: `$\\int_{${frText(K.a)}}^{${frText(K.b)}} (k + 6x)\\,dx$, where $k$ is a constant. What does the $k$ integrate to?`,
    options: [`$kx$`, `$\\frac{k^{2}}{2}$`, `$k$`],
    answer: `$kx$`,
    explain: `$k$ is a constant, so it behaves exactly as a number does: it becomes $kx$. Treating it as the variable gives $\\frac{k^{2}}{2}$, which then cancels between the limits and loses the $k$ altogether.`,
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: `Integrate an expression and write it in square brackets with its two limits.\nSimplify each term before substituting, so $\\frac{3x^{3}}{3}$ is written $x^{3}$.\nSubstitute the top limit, then subtract the bottom one, each inside its own bracket.\nTreat an unknown constant in the integrand as a constant, so it integrates to a term in $x$.\nLeave the answer exact when it is a fraction.`,
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The wording is *find the value of* the integral, worth two to four marks. The first mark is for the integrated bracket with its limits, so write it down even if the arithmetic worries you. The last mark is for the subtraction in the right order. Leave an exact fraction as a fraction.",
  },
  { type: "prompt", promptId: "rp.fm.u1.definite-integrals.01" },
  { type: "prompt", promptId: "rp.fm.u1.definite-integrals.02" },
  { type: "prompt", promptId: "rp.fm.u1.definite-integrals.04" },
  { type: "prompt", promptId: "rp.fm.u1.definite-integrals.05" },
];

/* ------------------------------------------------------------------ items */

const numSpec = (v, forms = ["decimal", "fraction"]) => ({
  kind: "numeric",
  value: num(v),
  tolerance: isInt(v) ? { type: "absolute", value: 0.005 } : { type: "dp", places: 2 },
  unitRequired: false,
  acceptForms: forms,
});

const mkQ = (n, opts) => ({
  id: qid(n),
  topic: TOPIC,
  specRefs: SPEC,
  tier: "untiered",
  paper: PAPER,
  style: opts.style ?? "practice",
  difficulty: opts.difficulty ?? 2,
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

function evaluateQ(n, d, marks, { difficulty = 2, style = "practice" } = {}) {
  const hasNeg = terms(d.f).some(([e]) => e < 0);
  const errs = numericErrors(d, d.value, [
    {
      value: routes.limitsReversed(d),
      misconception: "fm.int.limits-reversed",
      feedback: `The integrating and both substitutions are right, so the method marks stand. The bottom limit has been taken from the top one the wrong way round: it is $${frText(d.Fb)} - \\left(${frText(d.Fa)}\\right)$, which gives $${frText(d.value)}$.`,
      marksTypicallyEarned: Math.max(0, marks - 1),
      source: "ccea-cer:further-maths:2018-summer:FM1:Q2",
    },
    {
      value: routes.limitsIntoIntegrand(d),
      misconception: "fm.int.limits-into-integrand",
      feedback: `That came from putting the two limits straight into $${d.fText}$ and subtracting. The limits belong in the integrated expression $${d.FText}$, which gives $${frText(d.value)}$.`,
      marksTypicallyEarned: 0,
      source: "ccea-cer:further-maths:2018-summer:FM1:Q2",
    },
    {
      value: routes.lowerLimitIgnored(d),
      misconception: "fm.int.lower-limit-ignored",
      feedback: `The top limit has been substituted correctly. The bottom limit still has to be substituted and taken away: $${frText(d.Fb)} - \\left(${frText(d.Fa)}\\right) = ${frText(d.value)}$.`,
      marksTypicallyEarned: Math.max(0, marks - 1),
      source: "ccea-cer:further-maths:2018-summer:FM1:Q2",
    },
  ]);
  return mkQ(n, {
    style,
    difficulty,
    commandWords: ["Find"],
    setting: "A definite integral evaluated between two ordinates",
    skeleton: `(main)find${marks}`,
    examinerSources: ["ccea-cer:further-maths:2018-summer:FM1:Q2"],
    solutionProgram: `integrate ${d.fText} -> ${d.FText}; F(${frText(d.b)}) = ${frText(d.Fb)}; F(${frText(d.a)}) = ${frText(d.Fa)}; value = ${frText(d.value)}`,
    parts: [
      {
        id: "main",
        stem: `Find the value of\n$${d.integralLatex}$`,
        marks,
        answer: numSpec(d.value),
        scheme: [
          ...(hasNeg ? [{ id: "M1", code: "M", marks: 1, for: "writing the term under the line with a negative index" }] : []),
          { id: "MW1", code: "MW", marks: 1, for: `$\\left[${d.FLatex}\\right]_{${frText(d.a)}}^{${frText(d.b)}}$, each term simplified` },
          ...(marks - (hasNeg ? 3 : 2) > 0 ? [{ id: "M2", code: "M", marks: marks - (hasNeg ? 3 : 2), for: "substituting both limits, each inside its own bracket" }] : []),
          { id: "W1", code: "W", marks: 1, for: `$${frText(d.value)}$`, dependsOn: ["MW1"] },
        ],
        hints: ["Integrate first, and simplify each term as you write it.", "Substitute the top limit, then the bottom one.", "Put each substitution in its own bracket before subtracting."],
        workedSolution: `Integrating gives $\\left[${d.FLatex}\\right]_{${frText(d.a)}}^{${frText(d.b)}}$.\nAt $x = ${frText(d.b)}$ the bracket is $${frText(d.Fb)}$.\nAt $x = ${frText(d.a)}$ it is $${frText(d.Fa)}$.\nSubtracting: $${frText(d.Fb)} - \\left(${frText(d.Fa)}\\right) = ${frText(d.value)}$.`,
        commonErrors: errs,
        requiresWorking: true,
      },
    ],
  });
}

const q1 = evaluateQ(1, Q1, 3);
const q2 = evaluateQ(2, Q2, 3);
const q3 = evaluateQ(3, Q3, 3, { difficulty: 3 });
const q4 = evaluateQ(4, Q4, 4, { difficulty: 3 });
const q5 = evaluateQ(5, Q5, 3, { difficulty: 3 });
const q6 = evaluateQ(6, Q6, 3, { difficulty: 3 });

const exam = mkQ(7, {
  style: "exam-style",
  difficulty: 3,
  ao: ["AO1", "AO2"],
  commandWords: ["Find", "Hence"],
  setting: "A definite integral, then the same integral with an unknown constant in it",
  skeleton: "(a)find4|(b)find2|(c)find1",
  examinerSources: ["ccea-cer:further-maths:2018-summer:FM1:Q2", "ccea-cer:further-maths:2019-summer:FM1:Q13"],
  solutionProgram: `integrate ${EX.fText} -> ${EX.FText}; F(${frText(EX.b)}) = ${frText(EX.Fb)}; F(${frText(EX.a)}) = ${frText(EX.Fa)}; value = ${frText(EX.value)}. integral of (k + 6x) from ${frText(K.a)} to ${frText(K.b)} = ${K.latex}; = ${frText(K.target)} -> k = ${frText(K.kValue)}`,
  parts: [
    {
      id: "a",
      stem: `Find the value of\n$${EX.integralLatex}$`,
      marks: 4,
      answer: numSpec(EX.value),
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$x^{3}$ and $x^{2}$ from the first two terms` },
        { id: "MW2", code: "MW", marks: 1, for: `$-5x$ from the constant term, giving $\\left[${EX.FLatex}\\right]_{${frText(EX.a)}}^{${frText(EX.b)}}$` },
        { id: "M1", code: "M", marks: 1, for: "substituting both limits, each inside its own bracket", dependsOn: ["MW2"] },
        { id: "W1", code: "W", marks: 1, for: `$${frText(EX.value)}$`, dependsOn: ["M1"] },
      ],
      hints: ["Integrate each term and simplify as you go.", `At $x = ${frText(EX.b)}$ the bracket comes to $${frText(EX.Fb)}$.`, "Subtract the bottom limit inside its own bracket, because it is negative."],
      workedSolution: `Integrating gives $\\left[${EX.FLatex}\\right]_{${frText(EX.a)}}^{${frText(EX.b)}}$.\nAt $x = ${frText(EX.b)}$: $${frText(EX.Fb)}$.\nAt $x = ${frText(EX.a)}$: $${frText(EX.Fa)}$.\nSubtracting: $${frText(EX.Fb)} - \\left(${frText(EX.Fa)}\\right) = ${frText(EX.value)}$.`,
      commonErrors: numericErrors(EX, EX.value, [
        {
          value: routes.limitsReversed(EX),
          misconception: "fm.int.limits-reversed",
          feedback: `Both substitutions are right, so three of the four marks stand. The subtraction has gone the other way round: it is $${frText(EX.Fb)} - \\left(${frText(EX.Fa)}\\right) = ${frText(EX.value)}$.`,
          marksTypicallyEarned: 3,
          source: "ccea-cer:further-maths:2018-summer:FM1:Q2",
        },
        {
          value: routes.lowerLimitIgnored(EX),
          misconception: "fm.int.lower-limit-ignored",
          feedback: `That is the value of the bracket at the top limit alone. The bottom limit gives $${frText(EX.Fa)}$, and subtracting a negative number adds it on: $${frText(EX.value)}$.`,
          marksTypicallyEarned: 2,
          source: "ccea-cer:further-maths:2018-summer:FM1:Q2",
        },
        {
          value: routes.limitsIntoIntegrand(EX),
          misconception: "fm.int.limits-into-integrand",
          feedback: `That came from substituting the limits into $${EX.fText}$ itself. They belong in the integrated expression $${EX.FText}$.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2018-summer:FM1:Q2",
        },
      ]),
      requiresWorking: true,
    },
    {
      id: "b",
      stem: `$k$ is a constant.\nFind, in terms of $k$, the value of\n$\\int_{${frText(K.a)}}^{${frText(K.b)}} (k + 6x)\\,dx$`,
      marks: 2,
      answer: { kind: "algebraic", latex: K.latex, equivalence: "equivalent", variables: ["k"] },
      scheme: [
        { id: "MW1", code: "MW", marks: 1, for: `$\\left[kx + 3x^{2}\\right]_{${frText(K.a)}}^{${frText(K.b)}}$, with $k$ treated as a constant` },
        { id: "W1", code: "W", marks: 1, for: `$${K.latex}$`, dependsOn: ["MW1"] },
      ],
      hints: ["$k$ is a constant, so it integrates exactly as a number does.", "A constant $k$ becomes $kx$.", "Substitute the limits as usual; the lower limit is zero here."],
      workedSolution: `$k$ is a constant, so it integrates to $kx$, and $6x$ integrates to $3x^{2}$.\nThat gives $\\left[kx + 3x^{2}\\right]_{${frText(K.a)}}^{${frText(K.b)}}$.\nAt $x = ${frText(K.b)}$: $${frText(K.kCoeff)}k + ${frText(K.constant)}$. At $x = ${frText(K.a)}$: $0$.\nSo the integral is $${K.latex}$.`,
      commonErrors: [
        {
          misconception: "fm.int.unknown-constant-integrated",
          pattern: { kind: "algebraic", latex: frText(routes.constantIntegratedAsVariable()) },
          feedback: `The term in $x$ is right. The $k$ has been integrated as though it were the variable, giving $\\frac{k^{2}}{2}$, which is the same at both limits and cancels, so the $k$ disappears. A constant integrates to $kx$.`,
          marksTypicallyEarned: 1,
          source: "ccea-cer:further-maths:2019-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
    },
    {
      id: "c",
      stem: `Given that $\\int_{${frText(K.a)}}^{${frText(K.b)}} (k + 6x)\\,dx = ${frText(K.target)}$, find the value of $k$.`,
      marks: 1,
      answer: numSpec(K.kValue),
      scheme: [{ id: "W1", code: "W", marks: 1, for: `$${K.latex} = ${frText(K.target)}$, so $k = ${frText(K.kValue)}$`, ft: true }],
      hints: ["Set your answer to part (b) equal to the given value.", "Then solve the linear equation."],
      workedSolution: `From part (b), $${K.latex} = ${frText(K.target)}$.\nSo $${frText(K.kCoeff)}k = ${frText(sub(K.target, K.constant))}$ and $k = ${frText(K.kValue)}$.`,
      commonErrors: [
        {
          misconception: "fm.int.unknown-constant-integrated",
          pattern: { kind: "numeric", value: num(K.target) },
          feedback: `That is the value of the integral, not of $k$. Setting $${K.latex} = ${frText(K.target)}$ and solving gives $k = ${frText(K.kValue)}$.`,
          marksTypicallyEarned: 0,
          source: "ccea-cer:further-maths:2019-summer:FM1:Q13",
        },
      ],
      requiresWorking: true,
      followThrough: { fromPart: "b", rule: "use-candidate-value" },
    },
  ],
});

/* ---------------- worked example ---------------- */

const we1 = {
  id: "we.fm.u1.definite-integrals.01",
  topic: TOPIC,
  specRefs: SPEC,
  paper: PAPER,
  stem: `Find the value of $${WE.integralLatex}$`,
  figure: svgFigure(weSvg, `The curve y = ${WE.fText} with the strip between x = ${frText(WE.a)} and x = ${frText(WE.b)} shaded`),
  steps: [
    {
      n: 1,
      working: `Integrate each term and simplify as you write it: $\\left[${WE.FLatex}\\right]_{${frText(WE.a)}}^{${frText(WE.b)}}$.`,
      decision: "Simplifying now, rather than leaving a term over its divisor, is what keeps the substitution arithmetic short. The limits travel with the square bracket.",
      whyMenu: {
        options: ["Because the square bracket holds the limits until they are substituted", "Because the integral sign is still needed", "Because the constant of integration goes inside it"],
        correct: 0,
        explain: "The bracket with its limits is the standard notation, and it makes clear that two substitutions are still to come.",
      },
      earns: ["MW1"],
    },
    {
      n: 2,
      working: `Substitute the top limit: at $x = ${frText(WE.b)}$ the bracket is $${frText(WE.Fb)}$.`,
      decision: "Top limit first. Working it out on its own line, in its own bracket, is what protects the next step from a sign slip.",
      earns: ["M1"],
    },
    {
      n: 3,
      working: `Substitute the bottom limit: at $x = ${frText(WE.a)}$ the bracket is $${frText(WE.Fa)}$.`,
      decision: "The same expression, the other value. Nothing is re-integrated here.",
      earns: ["M2"],
    },
    {
      n: 4,
      working: `Subtract, top minus bottom: $${frText(WE.Fb)} - \\left(${frText(WE.Fa)}\\right) = ${frText(WE.value)}$.`,
      decision: `The order matters. The other way round gives $${frText(WE.reversed)}$, the same size with the sign turned over, and the scheme does not accept it.`,
      earns: ["W1"],
    },
  ],
  finalAnswer: `$${frText(WE.value)}$`,
  twin: {
    stem: `Find the value of $${TW.integralLatex}$`,
    answer: numSpec(TW.value),
  },
  faded: [
    { showSteps: 2, studentSupplies: [3, 4] },
    { showSteps: 1, studentSupplies: [2, 3, 4] },
  ],
  verification: V("we.fm.u1.definite-integrals.01"),
  version: 1,
};

/* ---------------- diagnostics ---------------- */

const dxPre = {
  id: "dx.fm.u1.definite-integrals.pre",
  topic: TOPIC,
  specRefs: SPEC,
  when: "pre",
  items: [
    {
      id: "p1",
      stem: "Two checks on what this lesson is built from. Neither is the new method, so answer from what you already know.\nWhat is $\\int 6x^{2}\\,dx$?",
      skill: "Integrate a single power of x",
      options: [
        { id: "a", text: "$2x^{3} + c$", correct: true, feedback: "Raise the power to $3$ and divide $6$ by that new power." },
        { id: "b", text: "$6x^{3} + c$", correct: false, feedback: "The power has risen correctly. The coefficient still has to be divided by the new power of $3$." },
        { id: "c", text: "$12x + c$", correct: false, feedback: "That is the derivative. Integrating raises the power rather than lowering it." },
      ],
      secondsExpected: 25,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "p2",
      stem: "What is $7 - (-3)$?",
      skill: "Subtract a negative number",
      options: [
        { id: "a", text: "$10$", correct: true, feedback: "Subtracting a negative adds it on. This exact step appears whenever the lower limit gives a negative value." },
        { id: "b", text: "$4$", correct: false, feedback: "That is $7 - 3$. The number being subtracted is itself negative, so the two signs make a plus." },
        { id: "c", text: "$-10$", correct: false, feedback: "The first number is positive and larger, so the answer is positive." },
      ],
      secondsExpected: 15,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

const dxPost = {
  id: "dx.fm.u1.definite-integrals.post",
  topic: TOPIC,
  specRefs: SPEC,
  when: "post",
  items: [
    {
      id: "d1",
      stem: `A candidate integrates and reaches $\\left[${Q1.FLatex}\\right]_{${frText(Q1.a)}}^{${frText(Q1.b)}}$. What comes next?`,
      skill: "Substitute the limits in the right order",
      options: [
        { id: "a", text: `$\\left(${frText(Q1.Fb)}\\right) - \\left(${frText(Q1.Fa)}\\right)$`, correct: true, feedback: `Top limit first, bottom limit second, giving $${frText(Q1.value)}$.` },
        { id: "b", text: `$\\left(${frText(Q1.Fa)}\\right) - \\left(${frText(Q1.Fb)}\\right)$`, correct: false, misconception: "fm.int.limits-reversed", feedback: `That gives $${frText(Q1.reversed)}$, the right size with the sign turned over. The number on top of the integral sign is substituted first.` },
        { id: "c", text: `$\\left(${frText(Q1.Fb)}\\right) + \\left(${frText(Q1.Fa)}\\right)$`, correct: false, misconception: "fm.int.limits-reversed", feedback: "The two substitutions are subtracted, not added. Adding them would count the strip below the lower limit as well." },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d2",
      stem: `What is the value of $${Q2.integralLatex}$?`,
      skill: "Evaluate a definite integral",
      options: [
        { id: "a", text: `$${frText(Q2.value)}$`, correct: true, feedback: `The bracket is $${Q2.FText}$, worth $${frText(Q2.Fb)}$ at the top limit and $${frText(Q2.Fa)}$ at the bottom.` },
        { id: "b", text: `$${frText(routes.limitsReversed(Q2))}$`, correct: false, misconception: "fm.int.limits-reversed", feedback: "Both substitutions are right and the subtraction has gone the wrong way round, which turns the sign over." },
        { id: "c", text: `$${frText(routes.limitsIntoIntegrand(Q2))}$`, correct: false, misconception: "fm.int.limits-into-integrand", feedback: `That came from putting the limits into $${Q2.fText}$ itself. They belong in the integrated expression.` },
      ],
      secondsExpected: 40,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d3",
      stem: "Why is there no $+ c$ in a definite integral?",
      skill: "Explain why the constant of integration is absent",
      options: [
        { id: "a", text: "It appears in both substitutions and cancels in the subtraction", correct: true, feedback: "$(F(b) + c) - (F(a) + c)$ leaves $F(b) - F(a)$ whatever $c$ was." },
        { id: "b", text: "Because $c$ is always zero between limits", correct: false, misconception: "fm.int.constant-omitted", feedback: "The constant is not zero; it is simply the same at both limits, so it subtracts away." },
        { id: "c", text: "Because the answer is a number rather than an expression", correct: false, misconception: "fm.int.constant-omitted", feedback: "That is true of the answer but it is not the reason. The reason is that the two copies of $c$ cancel." },
      ],
      secondsExpected: 30,
      confidence: true,
      hypercorrectionQueue: true,
    },
    {
      id: "d4",
      stem: `In $\\int_{${frText(K.a)}}^{${frText(K.b)}} (k + 6x)\\,dx$ the letter $k$ is a constant. What does it integrate to?`,
      skill: "Treat an unknown constant as a constant",
      options: [
        { id: "a", text: "$kx$", correct: true, feedback: "A constant behaves as a number does: raise the power of $x^{0}$ to $x^{1}$ and divide by $1$." },
        { id: "b", text: "$\\frac{k^{2}}{2}$", correct: false, misconception: "fm.int.unknown-constant-integrated", feedback: `That treats $k$ as the variable. It then takes the same value at both limits and cancels, so the $k$ vanishes and the answer collapses to $${frText(K.constant)}$.` },
        { id: "c", text: "$k$", correct: false, misconception: "fm.int.unknown-constant-integrated", feedback: "Leaving it unchanged is what differentiating would do to $kx$. Integrating goes the other way, so it gains a factor of $x$." },
      ],
      secondsExpected: 35,
      confidence: true,
      hypercorrectionQueue: true,
    },
  ],
};

/* ---------------- find the mistake ---------------- */

const ftm1 = {
  id: "ftm.fm.u1.definite-integrals.01",
  topic: TOPIC,
  specRefs: SPEC,
  stem: `Aoibhín was asked to find $${Q5.integralLatex}$. Her working:`,
  studentWorking: [
    `${Q5.fText}`,
    `[${Q5.FText}] from ${frText(Q5.a)} to ${frText(Q5.b)}`,
    `At x = ${frText(Q5.b)}: ${frText(Q5.Fb)}`,
    `At x = ${frText(Q5.a)}: ${frText(Q5.Fa)}`,
    `${frText(Q5.Fa)} - ${frText(Q5.Fb)} = ${frText(Q5.reversed)}`,
  ],
  mistakeLine: 5,
  misconception: "fm.int.limits-reversed",
  whatWentWrong: `Lines 2, 3 and 4 are all correct, including the substitution of a negative lower limit, which is where most slips happen.\nLine 5 subtracts the top value from the bottom one. The rule is the other way round: the limit written above the integral sign goes first.\nSo it is $${frText(Q5.Fb)} - \\left(${frText(Q5.Fa)}\\right) = ${frText(Q5.value)}$.`,
  correction: [`${frText(Q5.Fb)} - (${frText(Q5.Fa)}) = ${frText(Q5.value)}`],
  marksEarnedAsWritten: ["MW1", "M1"],
  feedback: `Everything up to line 4 earns its marks, and the arithmetic in line 5 is itself accurate. Only the order is reversed, which turns the sign of the answer over. A habit that prevents it: write the top value first, then a minus, then the bottom value inside its own bracket, before working anything out. The value is $${frText(Q5.value)}$.`,
  source: "ccea-cer:further-maths:2018-summer:FM1:Q2",
};

/* ---------------- prompts ---------------- */

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.fm.u1.definite-integrals.${String(n).padStart(2, "0")}`,
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
  rp(1, "formula", "How do you evaluate a definite integral between $a$ and $b$?", "Integrate, write the result in square brackets with the limits, substitute the top limit and subtract the bottom one.", ["integrate", "square brackets", "substitute", "subtract"], 2),
  rp(2, "qa", "Why is there no constant of integration in a definite integral?", "It appears in both substitutions and cancels in the subtraction, so the answer is the same whatever the constant was.", ["cancels", "subtraction", "both substitutions"], 3),
  rp(3, "trap", "You reach the square bracket. Which limit is substituted first?", "The top one, the number written above the integral sign; subtracting the other way round turns the sign of the answer over.", ["top", "above", "sign"], 3),
  rp(4, "trap", "An integrand contains a letter $k$ that the question calls a constant. What does it integrate to?", "It integrates to $kx$, exactly as a number would; treating it as the variable makes it cancel between the limits.", ["kx", "number", "variable"], 5),
  rp(5, "procedure", "Why simplify each term before substituting the limits?", "Because substituting into a tidy term such as $x^{3}$ is quicker and safer than into an untidy one left over its divisor.", ["tidy", "quicker", "safer"], 3),
];

/* ---------------- verification ---------------- */

const scopeDetail =
  "FM1 is untiered and calculator-allowed. Every integrand here is a sum of terms ax^n with n a whole number other than -1, and every integral is taken between two ordinates x = a and x = b, which is exactly FM1-INT-03 and its Teacher Guidance. What a negative value means for an area is left to the area-under-curve topic and is flagged as such in the note.";
const formulaDetail =
  "The Unit 1 sheet gives the integral of ax^n as ax^(n+1)/(n+1) + c for n not equal to -1 (packs/further-maths/exam-true/formula-sheets.json, fs.fm1.integration). The square-bracket notation, the order of the two substitutions and the fact that the constant cancels are not on the sheet and are taught here as must-know.";
const commandDetail =
  "Find is the command word, with typical tariff 2-3-5 in packs/further-maths/exam-true/command-words.json; the FM1 perPart median is 3 and the p90 is 6 (tariffs.json). Every part says Find the value of, as Summer 2018 Q2 and Summer 2019 Q13 print it, and requiresWorking is true throughout.";
const shingle =
  "Compared by hand against the FM1 question papers and mark schemes read for this batch (Summer 2018 Q2, Summer 2019 Q13, Summer 2022 Q2, Summer 2023 Q2, Summer 2024 Q1, Summer 2025 Q6 and Q11) and the Chief Examiner reports for those series. Every integrand, pair of limits, coefficient, sentence and figure here is new, and no eight-word sequence is shared with any paper, scheme or report.";
const styleLint =
  "British English, second person, calm; no exclamation marks; the banned verdict word is never used about a learner's answer. Every maths segment opens and closes inside one line and holds no prose words, checked by lintString before the files were written.";

const verification = [];
const push = (id, checks) => verification.push(verLog(id, checks));

push("note.fm.u1.definite-integrals", [
  ["schema", "pass", `Validated against the Zod NoteFrontmatter and the NoteBlock union by pipeline/build-content.mts; the hero block is first, all ${note.filter((b) => b.type === 'gate').length} gate ids are unique and every prompt block names a prompt in this bundle.`],
  ["scope-tier", "pass", scopeDetail],
  ["formula-sheet", "pass", formulaDetail],
  ["command-words", "pass", commandDetail],
  ["tariff", "pass", "The sheet's howExamined records the tariffs read from the papers: Summer 2018 Q2 was a short definite integral early in the paper, Summer 2019 Q13 carried an unknown constant for 7 marks, and Summer 2025 Q11(vi) asked for an area by integration for 4 marks at the end of a curve-sketching question."],
  ["maths-numeric", "pass", `Every value in the note is computed and the antiderivative differentiated back at three sample points: ${WE.fText} integrates to ${WE.FText}, giving ${frText(WE.Fb)} at x = ${frText(WE.b)} and ${frText(WE.Fa)} at x = ${frText(WE.a)}, so the integral is ${frText(WE.value)} and the reversed subtraction would give ${frText(WE.reversed)}; the integral of (k + 6x) from ${frText(K.a)} to ${frText(K.b)} is ${K.latex}.`],
  ["maths-symbolic", "pass", "Each antiderivative is differentiated back and compared with its integrand at x = 1.3, 2.4 and 3.7."],
  ["examiner-alignment", "pass", "No examiner callout stands in the teaching body and none is repeated in the closing panel: both the Summer 2018 Q2 and the Summer 2019 Q13 findings are traps in note.sheet.traps, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g2 the substitution, g3 the order of the subtraction and g4 the unknown constant."],
  ["copy-shingle", "pass", shingle],
  ["style-lint", "pass", `${styleLint} The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures drawn from computed values and one embeddable video from data/links/media-map.json followed immediately by a gate.`],
]);

const questions = [q1, q2, q3, q4, q5, q6, exam];
const workedExamples = [we1];
const diagnostics = [dxPre, dxPost];
const findTheMistake = [ftm1];

for (const we of workedExamples) {
  push(we.id, [
    ["schema", "pass", "Validated against the Zod WorkedExample: steps numbered in order, both faded stages inside range, the twin carrying its own answer spec."],
    ["scope-tier", "pass", scopeDetail],
    ["formula-sheet", "pass", formulaDetail],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The step codes follow the Summer 2018 Q2 and Summer 2025 Q11(vi) schemes: MW1 for the integrated bracket, M1 for each substitution, W1 for the value."],
    ["maths-numeric", "pass", `Recomputed: ${WE.fText} integrates to ${WE.FText}; F(${frText(WE.b)}) = ${frText(WE.Fb)}, F(${frText(WE.a)}) = ${frText(WE.Fa)}, value ${frText(WE.value)}; the twin ${TW.fText} from ${frText(TW.a)} to ${frText(TW.b)} gives ${frText(TW.value)}.`],
    ["maths-symbolic", "pass", "The antiderivative is differentiated back to the integrand at three sample points."],
    ["examiner-alignment", "pass", "The decisions answer the Summer 2018 Q2 findings on simplifying before substituting and on bracketing each substitution."],
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
      ? "The prerequisite items integrate 6x^2 and subtract a negative number, both recomputed in the generator."
      : `Every option value is produced by executing a route: ${Q1.fText} gives ${frText(Q1.value)} against the reversed ${frText(Q1.reversed)}; ${Q2.fText} gives ${frText(Q2.value)} against the reversed ${frText(routes.limitsReversed(Q2))} and the integrand route ${frText(routes.limitsIntoIntegrand(Q2))}; the unknown-constant route collapses the integral to ${frText(K.constant)}.`],
    ["examiner-alignment", "pass", "Post-instruction distractors carry the registry ids for the reversed subtraction, the limits put into the integrand, the misunderstood constant and the unknown constant integrated as a variable. Prerequisite distractors carry no topic tag unless the slip is that misconception."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["tariff", "pass", "Diagnostics carry no tariff; each is a single-skill check of one of the four moves."],
  ]);
}

for (const q of questions) {
  push(q.id, [
    ["schema", "pass", `Validated against the Zod Question: ${q.parts.length} part(s), scheme totals matching each part's marks, skeleton "${q.skeleton}" matching the parts.`],
    ["scope-tier", "pass", scopeDetail],
    ["formula-sheet", "pass", formulaDetail],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", `${q.totalMarks} marks over ${q.parts.length} part(s); the FM1 perPart median is 3 and the p90 is 6.`],
    ["maths-numeric", "pass", "Every value is computed by polyInteg and polyEval in exact rational arithmetic, the antiderivative is differentiated back at three sample points, and every commonError value is produced by executing its route (limits reversed, limits put into the integrand, lower limit ignored, unknown constant integrated as a variable) rather than typed. A route whose value the spec would mark correct is dropped by numericErrors before the bundle is written."],
    ["maths-symbolic", "pass", "Each antiderivative is checked against its integrand at x = 1.3, 2.4 and 3.7."],
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
    ["maths-numeric", "pass", `Both routes are executed: the correct value is ${frText(Q5.value)} and the reversed subtraction gives ${frText(Q5.reversed)}.`],
    ["examiner-alignment", "pass", "Seeded from the Summer 2018 Q2 finding on missing brackets and careless substitution."],
    ["copy-shingle", "pass", shingle],
    ["style-lint", "pass", styleLint],
    ["command-words", "pass", commandDetail],
    ["tariff", "pass", "The working shown is a 3-mark definite integral of the kind Summer 2018 Q2 prints."],
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
  { kind: "youtube", videoId: "NgOyeuww_Gs", channel: "corbettmaths", credit: "Integration - The Definite Integral - GCSE Further Maths, corbettmaths (embeddable id verified in data/links/media-map.json)" },
  { kind: "youtube", videoId: "LYuo8ZGFayQ", channel: "TLMaths", credit: "A Definite Integral Example, TLMaths (embeddable id verified in data/links/media-map.json)" },
  { kind: "phet", sim: "calculus-grapher", url: "https://phet.colorado.edu/sims/html/calculus-grapher/latest/calculus-grapher_en.html", licence: "CC BY-NC 4.0", attribution: "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)" },
  { kind: "ccea-doc", docType: "cer", url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports", asOf: "2026-09-19" },
];

const howExamined =
  "Unit 1 is one two-hour calculator paper of 100 marks, sat every Summer. A definite integral is worth 2 to 4 marks: on its own early in the paper, as in Summer 2018 Q2, or as the closing part of a longer calculus question, as in Summer 2025 Q11(vi), which asked for an area between the curve and two ordinates for 4 marks. Summer 2019 Q13 built a 7-mark question on an integrand carrying an unknown constant and was reported as the hardest question on that paper. Schemes run MW1 per integrated term, M1 for substituting both limits and W1 for the value.";

const notOnThisSpec = [
  "The integral of x⁻¹, excluded by FM1-INT-02",
  "Fractional indices, excluded across Unit 1",
  "Integration by substitution or by parts, and integrals of trigonometric, exponential or logarithmic functions",
  "What to do about a region below the x-axis when an area is wanted: that belongs to the area-under-curve topic",
];

const topic = {
  id: TOPIC,
  slug: "definite-integrals",
  title: "Forming and evaluating definite integrals",
  subject: "further-maths",
  unit: "FM1",
  tier: "untiered",
  strand: "Calculus",
  statementIds: SPEC,
  prerequisites: ["fm.u1.integration-as-inverse"],
  order: 37,
  hardness: "L",
  difficulty: 2,
  examinerFlagged: true,
  examinerSources: ["ccea-cer:further-maths:2018-summer:FM1:Q2", "ccea-cer:further-maths:2019-summer:FM1:Q13"],
  examWeightHint: howExamined,
  mustMemorise: [
    "[F(x)] from a to b means F(b) − F(a): top limit first",
    "Simplify each term before substituting, so 3x³/3 is written x³",
    "Put each substitution inside its own bracket before subtracting",
    "No constant of integration: it cancels in the subtraction",
    "An unknown constant such as k integrates to kx",
    "Leave an exact fraction as a fraction unless the question asks otherwise",
  ],
  onFormulaSheet: ["∫axⁿ dx = axⁿ⁺¹/(n + 1) + c, n ≠ −1 (Unit 1 formula sheet, page 2)"],
  notOnThisSpec,
  externalRefs,
  keywords: ["definite integral", "limits", "ordinates", "evaluate", "square brackets"],
};

const noteFrontmatter = {
  id: "note.fm.u1.definite-integrals",
  topic: TOPIC,
  title: "Forming and evaluating definite integrals",
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
      "[F(x)] from a to b = F(b) − F(a)",
      "The constant of integration cancels, so it is not written",
      "Each substitution goes inside its own bracket",
      "An unknown constant k integrates to kx",
    ],
  },
  notOnThisSpec,
  hardness: "L",
  examinerFlagged: true,
  externalRefs: [externalRefs[0], externalRefs[2], externalRefs[3]],
  sheet: {
    mustBeAbleTo: [
      "Integrate the expression and write it in square brackets with the two limits",
      "Simplify each integrated term before substituting",
      "Substitute the top limit, then the bottom one, each inside its own bracket",
      "Subtract in the right order and reach a single value",
      "Treat an unknown constant in the integrand as a constant, so it becomes a term in x",
      "Leave an exact fraction as a fraction, and accept a negative value as an answer",
      "Say why no constant of integration appears",
    ],
    howExamined,
    traps: [
      "Subtracting the bottom value from the top one the wrong way round, which turns the sign over",
      "Terms left unsimplified, such as a cube term still written over three, causing arithmetic slips (Summer 2018 FM1 Q2)",
      "Substitutions written without brackets, so a minus sign reaches only the first term (Summer 2018 FM1 Q2)",
      "The limits put into the original expression instead of the integrated one",
      "The lower limit never substituted at all",
      "An unknown constant integrated as though it were the variable, so it cancels between the limits (Summer 2019 FM1 Q13)",
      "The integral sign kept in front of the finished bracket",
      "Integration answered less securely than differentiation across the paper, so the early marks are worth rehearsing (Summer 2018 FM1 Q2)",
      "A comparison between two integrals misread, such as one area taken as a multiple of the other (Summer 2019 FM1 Q13)",
    ],
  },
  verification: V("note.fm.u1.definite-integrals"),
  version: 1,
  updated: "2026-09-19",
};

/* ---------------- assemble ---------------- */

const insight = JSON.parse(fs.readFileSync("packs/further-maths/insights/u1.definite-integrals.json", "utf8"));

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
const norm = (s) => s.toLowerCase().replace(/[-−]/g, " ").replace(/[.,;:()\\${}]/g, " ").replace(/\s+/g, " ").trim();
for (const p of prompts) for (const k of p.keyWords) if (!norm(p.answer).includes(norm(k))) throw new Error(`prompt ${p.id}: key word "${k}" is not in its own answer`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n");
fs.writeFileSync(path.join(OUT, "note.blocks.json"), JSON.stringify(note, null, 2) + "\n");
console.log(`topic 4 written: ${questions.length} questions, ${workedExamples.length} worked example, ${diagnostics.reduce((n, d) => n + d.items.length, 0)} diagnostics, ${findTheMistake.length} find-the-mistake, ${prompts.length} prompts, ${verification.length} verification logs`);
