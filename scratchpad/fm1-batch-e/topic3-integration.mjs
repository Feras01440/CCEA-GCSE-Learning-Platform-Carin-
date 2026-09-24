/**
 * FM1 batch E, topic 3: fm.u1.integration-as-inverse (difficulty 4, full H treatment).
 * Integration as the reverse of differentiation: indefinite integrals, + c, and finding c from a point.
 */
import {
  fr, frLatex, frText, num, add, sub, mul, div, neg,
  polyFrom, poly, terms, polyDeriv, polyInteg, polyEval, polyLatex, polyText,
  graphSvg, cardSvg, dp,
} from "./lib.mjs";

const assert = (ok, msg) => {
  if (!ok) throw new Error(`integration generator: ${msg}`);
};

/**
 * One gradient function and everything derived from it.
 * `through` is the point the curve passes through, when the topic asks for c.
 */
export function gradientFunction(spec) {
  const d = polyFrom(spec.dydx);
  const base = polyInteg(d);
  const out = {
    ...spec,
    d,
    base,
    dLatex: polyLatex(d),
    dText: polyText(d),
    baseLatex: polyLatex(base),
    baseText: polyText(base),
    second: polyDeriv(d),
  };
  out.secondLatex = polyLatex(out.second);
  out.secondText = polyText(out.second);
  // the integral is checked by differentiating it back at three sample points
  const back = polyDeriv(base);
  for (const t of [2, 3, -1.5]) {
    const x = fr(Math.round(t * 1e6), 1e6);
    assert(num(polyEval(back, x)) - num(polyEval(d, x)) < 1e-9, `${spec.name}: the integral does not differentiate back at x = ${t}`);
  }
  if (spec.through) {
    const [px, py] = spec.through;
    const c = sub(fr(py), polyEval(base, fr(px)));
    const curve = poly([...terms(base), [0, c]]);
    assert(num(polyEval(curve, fr(px))) === py, `${spec.name}: the curve does not pass through the given point`);
    out.c = c;
    out.curve = curve;
    out.curveLatex = polyLatex(curve);
    out.curveText = polyText(curve);
    out.px = fr(px);
    out.py = fr(py);
    out.baseAtPoint = polyEval(base, fr(px));
  }
  return out;
}

/* ------------------------------------------------------------------ the integrands */

export const W1 = gradientFunction({ name: "we1", dydx: { 2: 6, 1: -4, 0: 5 } });
export const W2 = gradientFunction({ name: "we2", dydx: { 2: 3, 1: -10, 0: 4 }, through: [3, 1] });
export const W3 = gradientFunction({ name: "we3", dydx: { 3: 8, [-3]: 12, 0: -5 }, through: [1, 4] });
export const X1 = gradientFunction({ name: "x1", dydx: { 2: 12, 1: 6, 0: -7 }, through: [2, 9] });
export const X2 = gradientFunction({ name: "x2", dydx: { 4: 5, [-3]: -8, 0: 3 }, through: [2, 6] });
export const X3 = gradientFunction({ name: "x3", dydx: { 2: 9, [-3]: -8, 0: 2 }, through: [2, 5] });
export const X4 = gradientFunction({ name: "x4", dydx: { 1: 4, 0: -9 }, through: [3, 2] });

export const P1 = gradientFunction({ name: "p1", dydx: { 3: 8 } });
export const P2 = gradientFunction({ name: "p2", dydx: { 4: 10, 0: 3 } });
export const P3 = gradientFunction({ name: "p3", dydx: { 2: 12, 1: -6 } });
export const P4 = gradientFunction({ name: "p4", dydx: { 0: 5, 1: -2 } });
export const P5 = gradientFunction({ name: "p5", dydx: { [-4]: 9 } });
export const P6 = gradientFunction({ name: "p6", dydx: { [-3]: 6 } });
export const P7 = gradientFunction({ name: "p7", dydx: { 1: 6, 0: 1 }, through: [2, 5] });
export const P8 = gradientFunction({ name: "p8", dydx: { 1: 8, 0: -3 }, through: [1, 4] });
export const P9 = gradientFunction({ name: "p9", dydx: { [-2]: 4 } });
export const P10 = gradientFunction({ name: "p10", dydx: { 3: 1, 2: -6, 0: 4 } });
export const P11 = gradientFunction({ name: "p11", dydx: { 2: 6 }, through: [2, 20] });

/* ------------------------------------------------------------------ error routes */

export const routes = {
  /** The integral written without its constant of integration. */
  constantOmitted: (g) => g.base,
  /** Differentiating where integration was needed. */
  differentiatedInstead: (g) => polyDeriv(g.d),
  /** The power raised correctly but the coefficient never divided. */
  notDivided: (g) => poly(terms(g.d).map(([e, c]) => [e + 1, c])),
  /** The coefficient divided by the NEW power but the power itself left where it was. */
  powerNotRaised: (g) => poly(terms(g.d).map(([e, c]) => [e, div(c, fr(e + 1))])),
  /** The coefficient divided by the ORIGINAL power instead of the new one (a constant term is left alone). */
  dividedByOriginalPower: (g) => poly(terms(g.d).map(([e, c]) => (e === 0 ? [1, c] : [e + 1, div(c, fr(e))]))),
  /** The value of c found and then written with the wrong sign. */
  cSignFlipped: (g) => poly([...terms(g.base), [0, neg(g.c)]]),
  /** The point substituted into the gradient function rather than into the integrated curve. */
  cFromGradient: (g) => {
    const c = sub(g.py, polyEval(g.d, g.px));
    return { c, curve: poly([...terms(g.base), [0, c]]) };
  },
  /** The constant of integration never evaluated, so the answer still carries a letter. */
  cLeftAsLetter: (g) => poly(terms(g.base)),
};

/* ------------------------------------------------------------------ figures */

export const inverseCard = cardSvg({
  title: "the two directions of the calculus you know",
  rows: [
    ["y = 2x^3 + 5x", "differentiate: multiply by the power, step it down"],
    ["dy/dx = 6x^2 + 5", "integrate: raise the power, divide by the new one"],
    ["and back to y = 2x^3 + 5x + c", "the constant is the price of going backwards"],
  ],
  footer: "each move undoes the other, except for what the constant remembers",
});

export const ruleCard = cardSvg({
  title: "the rule, and it is on the formula sheet",
  rows: [
    ["raise the power by one", "x^2 becomes x^3"],
    ["divide by that new power", "6x^2 becomes 6x^3 / 3 = 2x^3"],
    ["add c", "every indefinite integral ends with + c"],
    ["a constant term k", "becomes kx, because k is kx^0"],
  ],
  footer: "the excluded case is n = -1, which this specification never asks for",
});

export const negativeCard = cardSvg({
  title: "negative powers, one step at a time",
  rows: [
    ["12/x^3 is 12x^-3", "rewrite before you integrate"],
    ["raise the index: -3 becomes -2", "the index always goes UP by one here"],
    ["divide by -2", "12x^-2 / -2 = -6x^-2"],
    ["write it back over the line", "-6/x^2"],
  ],
  footer: "dividing by a negative new power is where the sign is won or lost",
});

/** A family of parallel curves: the same gradient function, many constants. */
export const familySvg = (() => {
  const base = (x) => x * x - 4 * x;
  const cs = [-3, 0, 3, 6];
  return graphSvg({
    xMin: -1.4, xMax: 5.4, yMin: -8, yMax: 11, xStep: 1, yStep: 2, width: 560, height: 340,
    curves: cs.map((c) => ({ f: (x) => base(x) + c, samples: 70 })),
    notes: cs.map((c, i) => ({ x: 5.0, y: base(5) + c, text: `c = ${c}`, anchor: "end" })),
    aria: "Four curves of the same shape stacked above one another, each a vertical shift of the next, all with the same gradient at any given x",
    footer: "same gradient everywhere, different heights",
  });
})();

/** The one curve of that family through a named point. */
export const pickedSvg = (() => {
  const f = (x) => num(polyEval(W2.curve, fr(Math.round(x * 1e6), 1e6)));
  return graphSvg({
    xMin: -1.2, xMax: 5.2, yMin: -6, yMax: 14, xStep: 1, yStep: 2, width: 560, height: 340,
    curves: [{ f }],
    points: [{ x: num(W2.px), y: num(W2.py), label: `(${frText(W2.px)}, ${frText(W2.py)})`, anchor: "start", dy: -10 }],
    aria: `The single curve y = ${polyText(W2.curve)} passing through the point (${frText(W2.px)}, ${frText(W2.py)})`,
    footer: "one point picks one curve out of the family",
  });
})();

/**
 * The same picture for the worked example, whose answer is that equation: the curve and the given
 * point are drawn, and neither the title nor the footer says what the equation turns out to be.
 */
export const pickedPlainSvg = (() => {
  const f = (x) => num(polyEval(W2.curve, fr(Math.round(x * 1e6), 1e6)));
  return graphSvg({
    xMin: -1.2, xMax: 5.2, yMin: -6, yMax: 14, xStep: 1, yStep: 2, width: 560, height: 340,
    curves: [{ f }],
    points: [{ x: num(W2.px), y: num(W2.py), label: `(${frText(W2.px)}, ${frText(W2.py)})`, anchor: "start", dy: -10 }],
    aria: `A curve drawn on labelled axes, passing through the point (${frText(W2.px)}, ${frText(W2.py)}), with its equation not given`,
    footer: "the point the curve passes through is the one the question gives you",
  });
})();

/* ------------------------------------------------------------------ note blocks */

export const note = [
  {
    type: "hero",
    lede: "Differentiating takes a curve and hands back its gradient. Integration runs the film backwards: from the gradient to the curve. One thing is lost on the way, the height the curve started at, and that is what the constant of integration is for.",
    can: [
      "Integrate any sum of whole-number powers of x, raising the power and dividing by the new one",
      "Explain why every indefinite integral ends with + c, and never leave it out",
      "Use a point on the curve to find c and write the curve as one equation",
    ],
    minutes: 20,
  },
  { type: "h", text: "Running the film backwards" },
  {
    type: "p",
    md: "You already know how to go from a curve to its gradient. Going the other way is just as useful: a question can tell you how steep something is everywhere and ask what it actually is.\nThat reverse journey is integration, and almost all of it is the differentiation rule read from right to left.",
  },
  { type: "figure", alt: "A three-row card showing a curve, its derivative and the journey back to the curve with a constant added", svg: inverseCard, caption: "Down the card is differentiation. Up the card is integration." },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "One tap to begin. If $\\frac{dy}{dx}$ is given and $y$ is wanted, which way are you going?",
    options: ["Backwards, so integrate", "Forwards, so differentiate", "Neither: substitute a value"],
    answer: "Backwards, so integrate",
    explain: "The gradient function is the finished product of differentiating, so recovering $y$ means undoing it.",
  },
  { type: "h", text: "1. Raise the power, divide by the new one" },
  {
    type: "p",
    md: "The Unit 1 formula sheet prints the rule as $\\int ax^{n}\\,dx = \\frac{ax^{n+1}}{n+1} + c$ for $n \\neq -1$.\nRead it as two moves, the opposite way round from differentiating. **Raise** the power by one. Then **divide** by that new power. Each term is done on its own, as before.",
  },
  { type: "figure", alt: "A four-row card giving the integration rule: raise the power, divide by the new power, add c, and turn a constant k into kx", svg: ruleCard, caption: "Raise, divide, add $c$. The excluded case $n = -1$ never appears on this specification." },
  {
    type: "callout",
    kind: "why",
    title: "Why dividing is the right move",
    md: "Differentiating $x^{3}$ brings a $3$ out in front. So if you start from $x^{2}$ and raise the power to get $x^{3}$, you have gained a factor of $3$ that was never there. Dividing by the new power cancels it exactly, which is why the two moves undo one another.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "blank",
    prompt: "Integrate $8x^{3}$. Raising the power gives $x^{4}$, and dividing $8$ by $4$ gives ___ $x^{4}$",
    answer: "2",
    explain: "The new power is $4$, and $8 \\div 4 = 2$, so the term integrates to $2x^{4}$. Dividing by the old power of $3$ is the commonest slip on this line.",
  },
  { type: "h", text: "2. Where the constant comes from" },
  {
    type: "p",
    md: "Differentiating throws information away. The curves $y = x^{2} - 4x$, $y = x^{2} - 4x + 3$ and $y = x^{2} - 4x - 3$ all have the same gradient function, because a constant contributes nothing to a gradient.\nGoing backwards you cannot tell which one you started from, so the answer is written with a letter standing for the height that was lost: $+ c$.",
  },
  { type: "figure", alt: "Four identical curves stacked above one another, each a vertical shift of the next, sharing the same gradient at every value of x", svg: familySvg, caption: "One gradient function, a whole family of curves. Only $c$ tells them apart." },
  {
    type: "gate",
    id: "g2a",
    kind: "choice",
    prompt: "The four curves in the picture share one gradient function. What is different about them?",
    options: ["Their heights", "Their shapes", "Their gradients at $x = 3$"],
    answer: "Their heights",
    explain: "A constant lifts a curve without tilting it anywhere, so every one of them has the same steepness at any value of $x$ you pick.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "The mark that goes most often",
    md: "Across Summer 2019, 2022, 2023, 2024 and 2025 the same note appears in the Chief Examiner's report: candidates integrate correctly and omit the constant, or find it and never write it into the equation. It is one character, and it is a mark in nearly every integration question on the paper.",
    source: "ccea-cer:further-maths:2023-summer:FM1:Q2",
  },
  {
    type: "gate",
    id: "g3",
    kind: "choice",
    prompt: "Why does an indefinite integral end with $+ c$?",
    options: [
      "Because a constant differentiates to zero, so its value cannot be recovered",
      "Because the answer is only an estimate",
      "Because $c$ is always zero and is written out of habit",
    ],
    answer: "Because a constant differentiates to zero, so its value cannot be recovered",
    explain: "Every member of the family has the same derivative, so the gradient function cannot say which curve it came from. The letter holds that place open.",
  },
  { type: "h", text: "3. A full integration, term by term" },
  {
    type: "p",
    md: `Take $\\int \\left(${W1.dLatex}\\right) dx$.\n**First term.** $6x^{2}$: raise to $x^{3}$, divide $6$ by $3$, giving $2x^{3}$.\n**Second term.** $-4x$ is $-4x^{1}$: raise to $x^{2}$, divide $-4$ by $2$, giving $-2x^{2}$.\n**Third term.** $5$ is $5x^{0}$: raise to $x^{1}$, divide $5$ by $1$, giving $5x$.\n**Finish.** $\\int \\left(${W1.dLatex}\\right) dx = ${W1.baseLatex} + c$.`,
  },
  {
    type: "video",
    videoId: "D78fDp2OAVk",
    title: "Introduction to Integration for GCSE Further Maths",
    channel: "corbettmaths",
    why: "The same rule at a slower pace, with more short examples than there is room for here.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "blank",
    prompt: `In that integral the term $5$ became $5x$. What does a constant $k$ always integrate to? Write your answer in terms of $k$ and $x$.`,
    answer: "kx | k x | kx + c",
    explain: "A constant is $kx^{0}$. Raising the power gives $kx^{1}$ and dividing by $1$ changes nothing, so it becomes $kx$.",
  },
  { type: "h", text: "4. Negative powers" },
  {
    type: "p",
    md: `A term under a line has to be rewritten with a negative index first, exactly as it is for differentiating.\nThe difference is the direction: here the index goes **up**. So $\\frac{12}{x^{3}} = 12x^{-3}$ raises to $x^{-2}$, and dividing $12$ by $-2$ gives $-6x^{-2}$, which is $-\\frac{6}{x^{2}}$.`,
  },
  { type: "figure", alt: "A four-row card taking 12 over x cubed through the rewrite, the raised index, the division by minus 2 and the answer written back over the line", svg: negativeCard, caption: "The new power can be negative, and dividing by it changes the sign." },
  {
    type: "callout",
    kind: "notonspec",
    title: "The one power that is excluded",
    md: "The rule needs $n \\neq -1$, because raising $-1$ gives $0$ and dividing by zero is meaningless. That integral is not on this specification, so you will never be asked for $\\int \\frac{1}{x}\\,dx$. Fractional indices are excluded across the whole unit too.",
    source: "CCEA GCSE Further Mathematics specification, statement FM1-INT-02 and its Teacher Guidance",
  },
  {
    type: "gate",
    id: "g5",
    kind: "blank",
    prompt: "Integrate $6x^{-3}$. The index rises to $-2$ and you divide by $-2$, giving ___ $x^{-2}$",
    answer: "-3",
    explain: "$6 \\div -2 = -3$, so the term becomes $-3x^{-2}$, which is $-\\frac{3}{x^{2}}$. The sign comes from the new power being negative.",
  },
  { type: "h", text: "5. One point picks one curve" },
  {
    type: "p",
    md: `Most exam questions do not stop at $+ c$. They give you a point the curve passes through, which is enough to pin down which member of the family it is.\nFor $\\frac{dy}{dx} = ${W2.dLatex}$ the integral is $y = ${W2.baseLatex} + c$. Substituting $x = ${frText(W2.px)}$ and $y = ${frText(W2.py)}$ gives $${frText(W2.baseAtPoint)} + c = ${frText(W2.py)}$, so $c = ${frText(W2.c)}$.`,
  },
  { type: "figure", alt: `A single curve through the point (${frText(W2.px)}, ${frText(W2.py)})`, svg: pickedSvg, caption: `The point $(${frText(W2.px)}, ${frText(W2.py)})$ selects one curve, and its equation is $y = ${W2.curveLatex}$.` },
  {
    type: "gate",
    id: "g5a",
    kind: "number",
    prompt: "How many points on the curve are needed to fix the value of $c$?",
    answer: "1",
    explain: "One point gives one equation, and there is one unknown, so one point is exactly enough.",
  },
  {
    type: "p",
    md: `Write the finished curve as a single equation: $y = ${W2.curveLatex}$.\nLeaving $c$ on a line of its own, or writing the answer as $y = ${W2.baseLatex} + c$ with $c$ named underneath, loses the last mark. The examiners want one equation.`,
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: `A curve has $y = 3x^{2} + c$ and passes through $(2, 20)$. What is $c$?`,
    answer: "8",
    explain: "Substituting gives $3 \\times 4 + c = 20$, so $12 + c = 20$ and $c = 8$. The point goes into the integrated curve, never into the gradient function.",
  },
  { type: "h", text: "6. The word that catches people out" },
  {
    type: "p",
    md: "A stem that says *the gradient function of a curve is* $\\frac{dy}{dx} = \\ldots$ is asking you to go **backwards**. The word gradient is not an instruction to differentiate; the differentiating has already been done for you.\nThe examiners record this every year. In Summer 2025 the word sent a large number of candidates straight into differentiating, and others tried $y = mx + c$ as though the curve were a straight line.",
  },
  {
    type: "callout",
    kind: "why",
    title: "How to tell which direction you are in",
    md: "Look at what the question hands you. If it gives you $y$ and wants steepness, differentiate. If it gives you $\\frac{dy}{dx}$ and wants $y$, integrate. The word gradient can sit in either sentence, so it decides nothing on its own.",
  },
  {
    type: "gate",
    id: "g7",
    kind: "choice",
    prompt: "A question reads: the gradient function of a curve is $\\frac{dy}{dx} = 6x - 1$, and the curve passes through $(1, 4)$. Find the equation of the curve. What is the first move?",
    options: [
      "Integrate $6x - 1$",
      "Differentiate $6x - 1$",
      "Substitute $x = 1$ into $6x - 1$",
    ],
    answer: "Integrate $6x - 1$",
    explain: "The gradient function is already the derivative, so the curve is found by integrating. Substituting comes afterwards, to find $c$.",
  },
  { type: "h", text: "7. Presenting the answer" },
  {
    type: "p",
    md: "Three small habits carry marks. Drop the integral sign as soon as you have integrated: writing $\\int$ in front of the answer says the work is not finished. Keep $+ c$ until the point is used, and then replace it with its number. And simplify as you go, so $\\frac{6x^{3}}{3}$ is written $2x^{3}$ rather than left standing.\nFinally, give the answer as the question asks: *express $y$ in terms of $x$* wants one equation beginning $y =$.",
  },
  {
    type: "gate",
    id: "g8",
    kind: "choice",
    prompt: `Which is the finished answer for a curve with $\\frac{dy}{dx} = ${X4.dLatex}$ through $(${frText(X4.px)}, ${frText(X4.py)})$?`,
    options: [
      `$y = ${X4.curveLatex}$`,
      `$y = ${X4.baseLatex} + c$`,
      `$\\int \\left(${X4.dLatex}\\right) dx = ${X4.baseLatex}$`,
    ],
    answer: `$y = ${X4.curveLatex}$`,
    explain: `Integrating gives $y = ${X4.baseLatex} + c$, and the point makes $c = ${frText(X4.c)}$. The finished answer is one equation with the number in place of the letter.`,
  },
  { type: "h", text: "You can now" },
  {
    type: "p",
    md: "Integrate a sum of whole-number powers of $x$ by raising each power and dividing by the new one.\nTurn a constant term $k$ into $kx$.\nRewrite $\\frac{a}{x^{n}}$ as $ax^{-n}$ and integrate it, keeping the sign the new power gives.\nSay why $+ c$ belongs on every indefinite integral.\nUse a point on the curve to find $c$ and present the curve as a single equation.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The wordings are *find* the integral and *express $y$ in terms of $x$, given that $y$ takes a stated value at a stated $x$*. The first mark is for one term integrated correctly, so start writing even if a term defeats you. The last mark is for $c$ evaluated and written inside one finished equation.",
  },
  { type: "prompt", promptId: "rp.fm.u1.integration-as-inverse.01" },
  { type: "prompt", promptId: "rp.fm.u1.integration-as-inverse.02" },
  { type: "prompt", promptId: "rp.fm.u1.integration-as-inverse.04" },
  { type: "prompt", promptId: "rp.fm.u1.integration-as-inverse.06" },
  { type: "prompt", promptId: "rp.fm.u1.integration-as-inverse.08" },
];
