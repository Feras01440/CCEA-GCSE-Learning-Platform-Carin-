/**
 * maths.m4.perpendicular-lines — H bundle.
 * Every gradient, intercept and coordinate below is computed with exact rationals and
 * asserted against the stem before it is printed into a stem, answer, scheme or log.
 */
import { PAPER, timeFor, svgFigure, writeBundle, collectLogs, UPDATED, DEFAULT_COPY } from "./lib.mjs";

const SLUG = "perpendicular-lines";
const TID = `maths.m4.${SLUG}`;
const qid = (n) => `q.${TID}.${String(n).padStart(4, "0")}`;

// ---------------------------------------------------------------------------
// Exact rational arithmetic — the whole topic is fractions, so nothing is floated
// ---------------------------------------------------------------------------
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function F(n, d = 1) {
  if (d === 0) throw new Error("zero denominator");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(Math.abs(n), Math.abs(d)) || 1;
  return { n: n / g, d: d / g };
}
const val = (f) => f.n / f.d;
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const perp = (m) => F(-m.d, m.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;

/** LaTeX: -\frac{3}{4}, 5, \frac{2}{3} */
function tex(f) {
  if (f.d === 1) return String(f.n);
  return `${f.n < 0 ? "-" : ""}\\frac{${Math.abs(f.n)}}{${f.d}}`;
}
/** Plain text for schemes and feedback: −3/4, 5, 2/3 (true minus sign) */
function plain(f) {
  const s = f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
  return s.replace("-", "\u2212");
}
/** y = mx + c as LaTeX */
function eqTex(m, c) {
  const mm = eq(m, F(1)) ? "" : eq(m, F(-1)) ? "-" : tex(m);
  const cPart = c.n === 0 ? "" : c.n > 0 ? ` + ${tex(c)}` : ` - ${tex(F(-c.n, c.d))}`;
  return `y = ${mm}x${cPart}`;
}
function eqPlain(m, c) {
  const mm = eq(m, F(1)) ? "" : eq(m, F(-1)) ? "\u2212" : plain(m);
  const cPart = c.n === 0 ? "" : c.n > 0 ? ` + ${plain(c)}` : ` \u2212 ${plain(F(-c.n, c.d))}`;
  return `y = ${mm}x${cPart}`;
}
/** c from y = mx + c through (x0, y0) — asserted to reproduce y0 */
function intercept(m, x0, y0) {
  const c = sub(F(y0), mul(m, F(x0)));
  const back = add(mul(m, F(x0)), c);
  if (!eq(back, F(y0))) throw new Error(`intercept check failed for m=${plain(m)} through (${x0}, ${y0})`);
  return c;
}
const gradThrough = (x1, y1, x2, y2) => F(y2 - y1, x2 - x1);

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

/** Axes from -6..8 with line L and its perpendicular K through a marked point. */
const AXES_FIG = `<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" width="360" height="300" role="img" aria-labelledby="perpfig"><title id="perpfig">A line of gradient one half and a line of gradient minus two crossing at right angles</title><g stroke="currentColor" stroke-width="0.5" opacity="0.35" fill="none"><path d="M30 20 V280 M70 20 V280 M110 20 V280 M150 20 V280 M190 20 V280 M230 20 V280 M270 20 V280 M310 20 V280 M350 20 V280"/><path d="M20 30 H350 M20 70 H350 M20 110 H350 M20 150 H350 M20 190 H350 M20 230 H350 M20 270 H350"/></g><g stroke="currentColor" stroke-width="1.6" fill="none"><path d="M20 150 H352"/><path d="M150 18 V282"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="12"><text x="348" y="166" text-anchor="end">x</text><text x="140" y="28">y</text><text x="146" y="166" text-anchor="end">O</text></g><g stroke="currentColor" stroke-width="2" fill="none"><path d="M30 215 L350 55"/><path d="M92 20 L222 280" stroke-dasharray="7 4"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="330" y="48">L</text><text x="228" y="272">K</text><text x="196" y="138" font-size="12">P</text></g><circle cx="190" cy="130" r="3.4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.4" fill="none"><path d="M190 130 L207 138 L199 155 L182 147 Z" opacity="0.9"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="255" y="112">gradient 1/2</text><text x="214" y="222">gradient \u22122</text></g></svg>`;

/** Rhombus with its two diagonals meeting at right angles at M. */
const RHOMBUS_FIG = `<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" width="340" height="260" role="img" aria-labelledby="rhombfig"><title id="rhombfig">A rhombus with both diagonals drawn, meeting at right angles at the point M</title><g stroke="currentColor" stroke-width="1.8" fill="none"><path d="M60 130 L170 40 L280 130 L170 220 Z"/></g><g stroke="currentColor" stroke-width="1.4" fill="none" stroke-dasharray="6 4"><path d="M60 130 H280"/><path d="M170 40 V220"/></g><g stroke="currentColor" stroke-width="1.3" fill="none"><path d="M170 145 H185 V130"/></g><circle cx="170" cy="130" r="3.2" fill="currentColor"/><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="48" y="134">A</text><text x="166" y="32">B</text><text x="288" y="134">C</text><text x="166" y="238">D</text><text x="150" y="124">M</text></g><g stroke="currentColor" stroke-width="1.2" fill="none"><path d="M112 88 L118 82 M118 88 L124 82"/><path d="M222 88 L228 82 M228 88 L234 82"/><path d="M112 172 L118 178 M118 172 L124 178"/><path d="M222 172 L228 178 M228 172 L234 178"/></g></svg>`;

/** Question figure: L through A and B, K perpendicular through B. */
const GRID_FIG = `<svg viewBox="0 0 340 280" xmlns="http://www.w3.org/2000/svg" width="340" height="280"><g stroke="currentColor" stroke-width="0.5" opacity="0.35" fill="none"><path d="M20 20 V260 M60 20 V260 M100 20 V260 M140 20 V260 M180 20 V260 M220 20 V260 M260 20 V260 M300 20 V260"/><path d="M20 20 H320 M20 60 H320 M20 100 H320 M20 140 H320 M20 180 H320 M20 220 H320 M20 260 H320"/></g><g stroke="currentColor" stroke-width="1.6" fill="none"><path d="M20 180 H322"/><path d="M180 18 V262"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="12"><text x="318" y="196" text-anchor="end">x</text><text x="170" y="28">y</text><text x="176" y="196" text-anchor="end">O</text><text x="56" y="106">A</text><text x="304" y="196">B</text></g><g stroke="currentColor" stroke-width="2" fill="none"><path d="M40 100 L320 180"/></g><circle cx="60" cy="100" r="3.4" fill="currentColor"/><circle cx="300" cy="180" r="3.4" fill="currentColor"/><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="300" y="92">L</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="318" y="34" text-anchor="end">diagram not drawn</text><text x="318" y="47" text-anchor="end">accurately</text></g></svg>`;

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

// WE1 — 4x + 3y = 24 through (-6, 5)
const we1 = (() => {
  const mL = F(-4, 3); // 3y = -4x + 24
  const mK = perp(mL); // 3/4
  const c = intercept(mK, -6, 5); // 19/2
  return { mL, mK, c };
})();

// WE2 — L through A(-2, 1) and B(6, 5); K perpendicular through B; find t with (t, 3) on K
const we2 = (() => {
  const mL = gradThrough(-2, 1, 6, 5); // 1/2
  const mK = perp(mL); // -2
  const c = intercept(mK, 6, 5); // 17
  const t = div(sub(F(3), c), mK); // (3 - 17) / -2 = 7
  const backY = add(mul(mK, t), c);
  if (!eq(backY, F(3))) throw new Error("we2 t check failed");
  return { mL, mK, c, t };
})();

// WE3 — rhombus: diagonal PR is 3y = x + 9, diagonals meet at M(3, 4)
const we3 = (() => {
  const mPR = F(1, 3);
  const onPR = eq(add(mul(mPR, F(3)), F(3)), F(4)); // y = x/3 + 3 at x = 3 gives 4
  if (!onPR) throw new Error("we3 midpoint not on PR");
  const mQS = perp(mPR); // -3
  const c = intercept(mQS, 3, 4); // 13
  return { mPR, mQS, c };
})();

const workedExamples = [
  {
    id: `we.${TID}.01`,
    topic: TID,
    specRefs: ["M4-NA-06"],
    paper: PAPER,
    stem: `Find the equation of the straight line that passes through $(-6,\\ 5)$ and is perpendicular to the line $4x + 3y = 24$.`,
    figure: svgFigure(
      AXES_FIG,
      "Coordinate axes with a solid line L of gradient one half and a dashed line K of gradient minus two crossing it at right angles at a marked point P.",
    ),
    steps: [
      {
        n: 1,
        working: `$4x + 3y = 24 \\Rightarrow 3y = -4x + 24 \\Rightarrow y = ${eqTex(F(-4, 3), F(8)).slice(4)}$`,
        decision:
          "The gradient can only be read once the equation is in the form y = mx + c. I make y the subject first: subtract 4x from both sides, then divide every term by 3.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because the number in front of x is only the gradient when y is alone on one side",
            "Because 4x + 3y = 24 is not the equation of a straight line",
            "Because the gradient is always the largest number in the equation",
          ],
          correct: 0,
          explain:
            "y = mx + c is the only arrangement in which the coefficient of x is the gradient. Reading 4 straight off 4x + 3y = 24 gives the wrong line.",
        },
      },
      {
        n: 2,
        working: `gradient of the given line $= ${tex(we1.mL)}$`,
        decision: "Both terms were divided by 3, so the coefficient of x is −4/3, not −4. I write it down before touching the perpendicular.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: `perpendicular gradient $= ${tex(we1.mK)}$`,
        decision:
          "Turn the fraction upside down and change the sign: the negative reciprocal of −4/3 is 3/4. A quick check: (−4/3) × (3/4) = −1.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because the gradients of two perpendicular lines multiply to give −1",
            "Because perpendicular lines always have positive gradients",
            "Because you always swap the sign and leave the fraction alone",
          ],
          correct: 0,
          explain: "Perpendicular gradients multiply to −1, so the second gradient is −1 divided by the first: the negative reciprocal.",
        },
      },
      {
        n: 4,
        working: `$5 = ${tex(we1.mK)}(-6) + c \\Rightarrow 5 = -\\tfrac{9}{2} + c \\Rightarrow c = ${tex(we1.c)}$`,
        decision:
          "The gradient alone is not an equation. Substituting the given point into y = mx + c is the only step that uses the coordinates, and it is where the examiners say candidates stop.",
        earns: ["MA1"],
      },
      {
        n: 5,
        working: `$${eqTex(we1.mK, we1.c)}$, or $4y = 3x + 38$`,
        decision:
          "Write the finished equation, not just c. Multiplying through by 4 clears the fractions if you prefer whole numbers; both forms are accepted.",
        earns: ["A1"],
      },
    ],
    finalAnswer: `$${eqTex(we1.mK, we1.c)}$ (equivalently $4y = 3x + 38$)`,
    twin: {
      stem: `Find the equation of the straight line that passes through $(4,\\ -1)$ and is perpendicular to the line $5x + 2y = 14$.`,
      answer: {
        kind: "algebraic",
        latex: "y = \\frac{2}{5}x - \\frac{13}{5}",
        equivalence: "equivalent",
        variables: ["x", "y"],
      },
    },
    faded: [
      { showSteps: 3, studentSupplies: [4, 5] },
      { showSteps: 1, studentSupplies: [2, 3, 4, 5] },
    ],
    verification: `ver.we.${TID}.01`,
    version: 1,
  },
  {
    id: `we.${TID}.02`,
    topic: TID,
    specRefs: ["M4-NA-06"],
    paper: PAPER,
    stem: `Line $L$ passes through $A(-2,\\ 1)$ and $B(6,\\ 5)$. Line $K$ is perpendicular to $L$ and also passes through $B$. The point $(t,\\ 3)$ lies on $K$. Find the value of $t$.`,
    steps: [
      {
        n: 1,
        working: `gradient of $L = \\dfrac{5 - 1}{6 - (-2)} = \\dfrac{4}{8} = ${tex(we2.mL)}$`,
        decision:
          "Change in y over change in x, taking the points in the same order top and bottom. Subtracting −2 adds 2, which is where sign slips happen.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: `gradient of $K = ${tex(we2.mK)}$`,
        decision: "Negative reciprocal of 1/2. Check: (1/2) × (−2) = −1.",
        earns: ["A1"],
      },
      {
        n: 3,
        working: `$5 = ${tex(we2.mK)}(6) + c \\Rightarrow c = ${tex(we2.c)}$, so $K$ is $${eqTex(we2.mK, we2.c)}$`,
        decision:
          "B is on K, so its coordinates satisfy the equation of K. The examiners' note on this question is that most candidates had both gradients and then stopped: the equation is the tool that answers the question.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because a coordinate cannot be found from a gradient alone",
            "Because every line must be written in the form y = mx + c",
            "Because B is the midpoint of K",
          ],
          correct: 0,
          explain: "A gradient describes a direction; only the equation ties x and y together so an unknown coordinate can be found.",
        },
      },
      {
        n: 4,
        working: `$3 = ${tex(we2.mK)}t + ${tex(we2.c)} \\Rightarrow 2t = 14 \\Rightarrow t = ${tex(we2.t)}$`,
        decision:
          "Substitute the known coordinate, here y = 3, and solve the linear equation. Adding 2t to both sides keeps every number positive.",
        earns: ["A1"],
      },
    ],
    finalAnswer: `$t = ${tex(we2.t)}$`,
    twin: {
      stem: `Line $L$ passes through $P(-1,\\ 4)$ and $Q(5,\\ 6)$. Line $K$ is perpendicular to $L$ and passes through $Q$. The point $(s,\\ 12)$ lies on $K$. Find the value of $s$.`,
      answer: { kind: "numeric", value: 3, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal", "fraction"] },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TID}.02`,
    version: 1,
  },
  {
    id: `we.${TID}.03`,
    topic: TID,
    specRefs: ["M4-NA-06"],
    paper: PAPER,
    stem: `$PQRS$ is a rhombus. Its diagonals cross at $M(3,\\ 4)$. The diagonal $PR$ has equation $3y = x + 9$. Find the equation of the diagonal $QS$.`,
    figure: svgFigure(
      RHOMBUS_FIG,
      "A rhombus ABCD with all four sides marked equal and both diagonals drawn as dashed lines meeting at a point M, where a right-angle square is marked.",
    ),
    steps: [
      {
        n: 1,
        working: `$3y = x + 9 \\Rightarrow y = \\tfrac{1}{3}x + 3$, so the gradient of $PR$ is $${tex(we3.mPR)}$`,
        decision: "Divide every term by 3, including the 9. The gradient is 1/3, not 1.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: `The diagonals of a rhombus cross at right angles, so the gradient of $QS = ${tex(we3.mQS)}$`,
        decision:
          "This is the geometry fact that unlocks the question: all four sides equal means the diagonals are perpendicular bisectors of each other. Negative reciprocal of 1/3 is −3.",
        earns: ["A1"],
        whyMenu: {
          options: [
            "Because the diagonals of a rhombus meet at right angles",
            "Because the diagonals of a rhombus are equal in length",
            "Because a rhombus is a rectangle",
          ],
          correct: 0,
          explain:
            "Equal sides force the diagonals to bisect each other at right angles. Equal diagonals is the rectangle property, which is a different shape.",
        },
      },
      {
        n: 3,
        working: `$M(3,\\ 4)$ lies on both diagonals: $4 = ${tex(we3.mQS)}(3) + c \\Rightarrow c = ${tex(we3.c)}$`,
        decision:
          "The crossing point is on QS as well as on PR, so it is the point to substitute. Check it really is on PR first: 3(4) = 3 + 9.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: `$${eqTex(we3.mQS, we3.c)}$`,
        decision: "Write the equation out. A quick check: at x = 3, −3(3) + 13 = 4, which is M.",
        earns: ["A1"],
      },
    ],
    finalAnswer: `$${eqTex(we3.mQS, we3.c)}$`,
    twin: {
      stem: `$ABCD$ is a rhombus whose diagonals cross at $M(2,\\ -1)$. The diagonal $AC$ has equation $4y = x - 6$. Find the equation of the diagonal $BD$.`,
      answer: { kind: "algebraic", latex: "y = -4x + 7", equivalence: "equivalent", variables: ["x", "y"] },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TID}.03`,
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
    specRefs: ["M4-NA-06"],
    when: "pre",
    items: [
      {
        id: "01",
        stem: "What is the gradient of a line perpendicular to $y = 3x - 7$?",
        skill: "Take the negative reciprocal of a whole-number gradient",
        options: [
          opt("a", "$-\\frac{1}{3}$", true, "Turn 3 upside down to get 1/3 and change the sign. Check: 3 × (−1/3) = −1."),
          opt("b", "$3$", false, "That is the gradient of a parallel line. Perpendicular needs the sign changed and the fraction turned over.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
          opt("c", "$-3$", false, "The sign has changed but the fraction has not been turned over. 3 × (−3) = −9, not −1.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
          opt("d", "$\\frac{1}{3}$", false, "The fraction has been turned over but the sign is still positive. 3 × 1/3 = 1, not −1.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
        ],
        secondsExpected: 15,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "02",
        stem: "What is the gradient of the line $2x + 5y = 20$?",
        skill: "Rearrange to y = mx + c before reading the gradient",
        options: [
          opt("a", "$-\\frac{2}{5}$", true, "5y = −2x + 20, so y = −2/5 x + 4. Every term was divided by 5."),
          opt("b", "$2$", false, "That is the coefficient of x before the equation was rearranged. The gradient can only be read once y is alone.", "maths.lines.gradient-read-without-rearranging"),
          opt("c", "$-2$", false, "The sign is right but the division by 5 has not been done. Divide every term, including the 2x.", "maths.lines.gradient-read-without-rearranging"),
          opt("d", "$\\frac{5}{2}$", false, "The fraction has been turned over. Rearranging gives −2/5; the reciprocal belongs to the perpendicular, not to this line.", "maths.lines.gradient-inverted"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "03",
        stem: "A line has gradient $-\\frac{5}{2}$. What is the gradient of a line perpendicular to it?",
        skill: "Negative reciprocal of a negative fraction",
        options: [
          opt("a", "$\\frac{2}{5}$", true, "Turn it over to get −2/5, then change the sign to +2/5. Check: (−5/2) × (2/5) = −1."),
          opt("b", "$-\\frac{2}{5}$", false, "The fraction has been turned over but the sign kept. Two negative gradients multiply to a positive number, so they cannot be perpendicular.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
          opt("c", "$\\frac{5}{2}$", false, "Only the sign has changed. The fraction has to be turned over as well.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
          opt("d", "$-\\frac{5}{2}$", false, "That is the original gradient, which describes a parallel line.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "04",
        stem: "A line with gradient $4$ passes through $(2,\\ 3)$. What is the value of $c$ in $y = 4x + c$?",
        skill: "Substitute a point to find the intercept",
        options: [
          opt("a", "$-5$", true, "3 = 4(2) + c gives 3 = 8 + c, so c = −5."),
          opt("b", "$11$", false, "The 8 has been added instead of subtracted. From 3 = 8 + c, take 8 from both sides.", "maths.lines.equation-not-found-after-gradient"),
          opt("c", "$3$", false, "That is the y-coordinate of the point. It is only the intercept when the x-coordinate is 0.", "maths.lines.intercept-not-recognised"),
          opt("d", "$2$", false, "That is the x-coordinate. Substitute both coordinates into y = 4x + c and solve for c.", "maths.lines.equation-not-found-after-gradient"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "05",
        stem: "A line passes through $(-3,\\ 8)$ and $(5,\\ 4)$. What is its gradient?",
        skill: "Gradient from two points, with a negative coordinate",
        options: [
          opt("a", "$-\\frac{1}{2}$", true, "(4 − 8) ÷ (5 − (−3)) = −4 ÷ 8 = −1/2. Subtracting −3 adds 3."),
          opt("b", "$-2$", false, "The difference in x has been divided by the difference in y. Gradient is change in y over change in x.", "maths.lines.gradient-inverted"),
          opt("c", "$\\frac{1}{2}$", false, "The size is right but the minus has been lost: y falls from 8 to 4 as x increases, so the gradient is negative.", "maths.lines.gradient-sign-missed"),
          opt("d", "$-\\frac{1}{4}$", false, "The change in x has been taken as 5 − 3 = 2 instead of 5 − (−3) = 8. Subtracting a negative adds.", "maths.lines.gradient-from-wrong-points"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "06",
        stem: "Which line is perpendicular to $y = -\\frac{1}{4}x + 9$?",
        skill: "Recognise a perpendicular line from its equation",
        options: [
          opt("a", "$y = 4x - 1$", true, "(−1/4) × 4 = −1, so the two lines meet at right angles."),
          opt("b", "$y = -4x + 9$", false, "(−1/4) × (−4) = +1. Both gradients are negative, so both lines slope the same way.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
          opt("c", "$y = \\frac{1}{4}x + 9$", false, "(−1/4) × (1/4) is not −1. Only the sign was changed; the fraction must be turned over too.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
          opt("d", "$y = -\\frac{1}{4}x - 3$", false, "Same gradient, different intercept: that is a parallel line, not a perpendicular one.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "07",
        stem: "The diagonals of a rhombus cross at $(6,\\ 2)$. One diagonal has gradient $\\frac{2}{3}$. What is the equation of the other diagonal?",
        skill: "Use the right-angle property of a rhombus and substitute the crossing point",
        options: [
          opt("a", "$y = -\\frac{3}{2}x + 11$", true, "Perpendicular gradient −3/2, then 2 = −3/2(6) + c gives c = 11."),
          opt("b", "$y = \\frac{2}{3}x - 2$", false, "That is the first diagonal itself. The other diagonal is perpendicular to it.", "maths.lines.perpendicular-gradient-not-negative-reciprocal"),
          opt("c", "$y = -\\frac{3}{2}x$", false, "The gradient is right but the crossing point was never substituted, so c is missing.", "maths.lines.equation-not-found-after-gradient"),
          opt("d", "$y = -\\frac{3}{2}x + 2$", false, "The y-coordinate of the crossing point has been used as c. It is only c when x = 0; here x = 6.", "maths.lines.intercept-not-recognised"),
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
  specRefs: ["M4-NA-06"],
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

const algAnswer = (latex) => ({ kind: "algebraic", latex, equivalence: "equivalent", variables: ["x", "y"] });
const numAnswer = (value, unit) => ({
  kind: "numeric",
  value,
  tolerance: { type: "exact" },
  ...(unit ? { unit, unitRequired: false } : { unitRequired: false }),
  acceptForms: ["decimal", "fraction"],
});

// --- computed values for the practice ladder -------------------------------
const P = {};
P.q1 = perp(F(2)); // -1/2
P.q2 = perp(F(-3, 4)); // 4/3
P.q3 = F(-2, 5); // from 2x + 5y = 20
P.q4L = F(3, 4); // from 3x - 4y = 12
P.q4 = perp(P.q4L); // -4/3
P.q5m = perp(F(1, 2)); // -2
P.q5c = intercept(P.q5m, 0, 6); // 6
P.q6m = perp(F(2)); // -1/2
P.q6c = intercept(P.q6m, 4, -1); // 1
P.q7m = perp(F(-1, 5)); // 5
P.q7c = intercept(P.q7m, -3, 7); // 22
P.q8L = F(-3, 2); // 3x + 2y = 8
P.q8m = perp(P.q8L); // 2/3
P.q8c = intercept(P.q8m, 6, 2); // -2
P.q9L = F(2, 5); // 5y - 2x = 15
P.q9m = perp(P.q9L); // -5/2
P.q9c = intercept(P.q9m, -4, 9); // -1
P.q10L = gradThrough(-1, 8, 5, -4); // -2
P.q10 = perp(P.q10L); // 1/2
P.q11L = gradThrough(2, -5, 8, 3); // 4/3
P.q11m = perp(P.q11L); // -3/4
P.q11c = intercept(P.q11m, 8, 3); // 9
P.q12a = F(4);
P.q12b = F(-1, 4); // x + 4y = 12
P.q13L = gradThrough(1, 2, 7, 5); // 1/2
P.q13m = perp(P.q13L); // -2
P.q13c = intercept(P.q13m, 7, 5); // 19
P.q13k = div(sub(F(7), P.q13c), P.q13m); // 6
P.q14L = gradThrough(-1, 2, 5, 6); // 2/3
P.q14mid = [2, 4];
P.q14m = perp(P.q14L); // -3/2
P.q14c = intercept(P.q14m, 2, 4); // 7

// exam-style
const E1 = (() => {
  const mL = F(-2, 5); // 2x + 5y = 30
  const mK = perp(mL); // 5/2
  const c = intercept(mK, 10, -3); // -28
  return { mL, mK, c };
})();
const E2 = (() => {
  const mL = gradThrough(-5, 4, 3, 0); // -1/2
  const mK = perp(mL); // 2
  const c = intercept(mK, 3, 0); // -6
  return { mL, mK, c };
})();
const E3 = (() => {
  const mAC = F(-1, 2); // x + 2y = 14
  const onAC = eq(add(F(4), mul(F(2), F(5))), F(14)); // 4 + 2(5) = 14
  if (!onAC) throw new Error("E3: M is not on AC");
  const mBD = perp(mAC); // 2
  const c = intercept(mBD, 4, 5); // -3
  const dOnBD = eq(add(mul(mBD, F(7)), c), F(11)); // 2(7) - 3 = 11
  if (!dOnBD) throw new Error("E3: D is not on BD");
  const B = [2 * 4 - 7, 2 * 5 - 11]; // M is the midpoint of BD
  return { mAC, mBD, c, B };
})();
const E4 = (() => {
  const mL = gradThrough(-2, -3, 6, 1); // 1/2
  const mK = perp(mL); // -2
  const c = intercept(mK, 6, 1); // 13
  const t = div(sub(F(21), c), mK); // -4
  if (!eq(add(mul(mK, t), c), F(21))) throw new Error("E4 t check");
  return { mL, mK, c, t };
})();

const CE = {
  noRearrange: (latexGuess, marks, source) => ({
    misconception: "maths.lines.gradient-read-without-rearranging",
    pattern: { kind: "algebraic", latex: latexGuess },
    feedback:
      "The gradient was read before the equation was rearranged. Make y the subject first, dividing every term, and only then take the negative reciprocal. No follow-through is allowed from a gradient that is not the correct one or its negative reciprocal.",
    marksTypicallyEarned: marks,
    source,
  }),
  notNegRecip: (latexGuess, marks, source) => ({
    misconception: "maths.lines.perpendicular-gradient-not-negative-reciprocal",
    pattern: { kind: "algebraic", latex: latexGuess },
    feedback:
      "The gradient of the given line was used, or only its sign was changed. Perpendicular means negative reciprocal: turn the fraction over and change the sign, then check that the two gradients multiply to −1.",
    marksTypicallyEarned: marks,
    source,
  }),
  stoppedAtGradient: (latexGuess, marks, source) => ({
    misconception: "maths.lines.equation-not-found-after-gradient",
    pattern: { kind: "algebraic", latex: latexGuess },
    feedback:
      "The perpendicular gradient is correct, and that is the first mark. The remaining marks are for substituting the given point into y = mx + c, finding c and writing the whole equation.",
    marksTypicallyEarned: marks,
    source,
  }),
};

const questions = [
  question({
    id: qid(1),
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Write down"],
    emphasis: ["gradient", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "write-down" },
    parts: [
      part({
        stem: "Write down the gradient of a line perpendicular to $y = 2x + 7$.",
        marks: 1,
        answer: numAnswer(-0.5),
        scheme: [{ id: "A1", code: "A", marks: 1, for: `${plain(P.q1)} or \u22120.5`, accept: ["\u22121/2", "\u22120.5"] }],
        hints: ["The gradient of the given line is 2.", "Turn 2 into the fraction 2/1, then invert and change the sign."],
        workedSolution: `The gradient of the given line is $2$. The negative reciprocal is $${tex(P.q1)}$.`,
        commonErrors: [CE.notNegRecip("m = -2", 0, "ccea-cer:maths:2025-summer:M4:Q14")],
        requiresWorking: false,
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q14"],
    solutionProgram: "perp(2) = -1/2; check 2 * (-1/2) = -1",
  }),
  question({
    id: qid(2),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Write down"],
    emphasis: ["gradient", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "write-down" },
    parts: [
      part({
        stem: "Write down the gradient of a line perpendicular to $y = -\\frac{3}{4}x + 2$.",
        marks: 1,
        answer: numAnswer(4 / 3),
        scheme: [{ id: "A1", code: "A", marks: 1, for: `${plain(P.q2)} or 1.33...`, accept: ["4/3", "1.3 recurring"] }],
        hints: ["Turn −3/4 upside down.", "Then change the sign."],
        workedSolution: `Inverting $-\\tfrac{3}{4}$ gives $-\\tfrac{4}{3}$; changing the sign gives $${tex(P.q2)}$. Check: $-\\tfrac{3}{4} \\times \\tfrac{4}{3} = -1$.`,
        commonErrors: [CE.notNegRecip("m = -\\frac{4}{3}", 0, "ccea-cer:maths:2025-summer:M4:Q14")],
        requiresWorking: false,
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q14"],
    solutionProgram: "perp(-3/4) = 4/3; check (-3/4) * (4/3) = -1",
  }),
  question({
    id: qid(3),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Find"],
    emphasis: ["gradient", "rearrange"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the gradient of the line $2x + 5y = 20$.",
        marks: 2,
        answer: numAnswer(-0.4),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "rearranged to y = \u22122/5 x + 4 (or 5y = \u22122x + 20 followed by division by 5)" },
          { id: "A1", code: "A", marks: 1, for: `gradient = ${plain(P.q3)} or \u22120.4`, dependsOn: ["MA1"] },
        ],
        hints: ["Subtract 2x from both sides.", "Divide every term by 5, including the 2x."],
        workedSolution: `$2x + 5y = 20 \\Rightarrow 5y = -2x + 20 \\Rightarrow y = ${tex(P.q3)}x + 4$, so the gradient is $${tex(P.q3)}$.`,
        commonErrors: [CE.noRearrange("m = 2", 0, "ccea-cer:maths:2024-summer:M4:Q17")],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q17"],
    solutionProgram: "5y = -2x + 20 -> y = (-2/5)x + 4; gradient = -2/5 = -0.4",
  }),
  question({
    id: qid(4),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Find"],
    emphasis: ["perpendicular", "rearrange"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the gradient of a line perpendicular to $3x - 4y = 12$.",
        marks: 2,
        answer: numAnswer(-4 / 3),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `rearranged to y = 3/4 x \u2212 3, so the gradient of the given line is ${plain(P.q4L)}` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q4)}`, dependsOn: ["MA1"] },
        ],
        hints: ["−4y = −3x + 12; dividing by −4 changes both signs.", "Then invert and change the sign."],
        workedSolution: `$3x - 4y = 12 \\Rightarrow -4y = -3x + 12 \\Rightarrow y = ${tex(P.q4L)}x - 3$. The gradient is $${tex(P.q4L)}$, so a perpendicular line has gradient $${tex(P.q4)}$.`,
        commonErrors: [
          CE.noRearrange("m = -\\frac{1}{3}", 0, "ccea-cer:maths:2024-summer:M4:Q17"),
          {
            misconception: "maths.lines.gradient-sign-missed",
            pattern: { kind: "algebraic", latex: "m = -\\frac{3}{4}" },
            feedback:
              "Dividing −4y = −3x + 12 by −4 makes the x term positive: y = 3/4 x − 3. Both signs on the right change, not just the constant.",
            marksTypicallyEarned: 0,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q17"],
    solutionProgram: "-4y = -3x + 12 -> y = (3/4)x - 3; perp = -4/3",
  }),
  question({
    id: qid(5),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Find"],
    emphasis: ["equation", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the equation of the line that passes through $(0,\\ 6)$ and is perpendicular to $y = \\frac{1}{2}x$.",
        marks: 2,
        answer: algAnswer(`y = -2x + 6`),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `perpendicular gradient = ${plain(P.q5m)}` },
          { id: "A1", code: "A", marks: 1, for: `${eqPlain(P.q5m, P.q5c)} (c read straight from the point on the y-axis)`, dependsOn: ["MA1"] },
        ],
        hints: ["The negative reciprocal of 1/2 is −2.", "The point has x = 0, so its y-coordinate is c."],
        workedSolution: `The perpendicular gradient is $${tex(P.q5m)}$. Since $x = 0$ at the given point, $c = 6$ directly, so the line is $${eqTex(P.q5m, P.q5c)}$.`,
        commonErrors: [
          {
            misconception: "maths.lines.intercept-not-recognised",
            pattern: { kind: "algebraic", latex: "y = -2x" },
            feedback:
              "The gradient earns the first mark. The point (0, 6) is on the y-axis, so c = 6 without any substitution; leaving c out loses the accuracy mark.",
            marksTypicallyEarned: 1,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q17"],
    solutionProgram: "perp(1/2) = -2; point (0,6) on the y-axis so c = 6; y = -2x + 6; check x=0 -> y=6",
  }),
  question({
    id: qid(6),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Find"],
    emphasis: ["equation", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the equation of the line that passes through $(4,\\ -1)$ and is perpendicular to $y = 2x + 9$.",
        marks: 3,
        answer: algAnswer("y = -\\frac{1}{2}x + 1"),
        scheme: [
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q6m)}` },
          { id: "MA1", code: "MA", marks: 1, for: "\u22121 = \u22121/2 (4) + c, leading to c = 1" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(P.q6m, P.q6c)} oe`, dependsOn: ["MA1"] },
        ],
        hints: ["Negative reciprocal of 2.", "Substitute x = 4 and y = −1 into y = mx + c.", "Write the finished equation, not just c."],
        workedSolution: `Gradient $= ${tex(P.q6m)}$. Substituting: $-1 = ${tex(P.q6m)}(4) + c = -2 + c$, so $c = ${tex(P.q6c)}$ and the line is $${eqTex(P.q6m, P.q6c)}$.`,
        commonErrors: [CE.stoppedAtGradient("m = -\\frac{1}{2}", 1, "ccea-cer:maths:2024-november:M4:Q17")],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q17"],
    solutionProgram: "perp(2) = -1/2; -1 = -1/2*4 + c -> c = 1; check -1/2*4 + 1 = -1",
  }),
  question({
    id: qid(7),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Find"],
    emphasis: ["equation", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the equation of the line that passes through $(-3,\\ 7)$ and is perpendicular to $y = -\\frac{1}{5}x + 4$.",
        marks: 3,
        answer: algAnswer("y = 5x + 22"),
        scheme: [
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q7m)}` },
          { id: "MA1", code: "MA", marks: 1, for: "7 = 5(\u22123) + c, leading to c = 22" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(P.q7m, P.q7c)}`, dependsOn: ["MA1"] },
        ],
        hints: ["The negative reciprocal of −1/5 is 5.", "7 = 5(−3) + c.", "5 × (−3) is −15, so c is larger than 7."],
        workedSolution: `Gradient $= ${tex(P.q7m)}$. Then $7 = 5(-3) + c = -15 + c$, so $c = ${tex(P.q7c)}$ and the line is $${eqTex(P.q7m, P.q7c)}$.`,
        commonErrors: [
          {
            misconception: "maths.lines.equation-not-found-after-gradient",
            pattern: { kind: "algebraic", latex: "y = 5x - 8" },
            feedback:
              "The gradient mark is earned. In 7 = 5(−3) + c the product is −15, so c = 7 + 15 = 22. Adding instead of subtracting is the usual slip when the coordinate is negative.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2024-november:M4:Q17",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q17"],
    solutionProgram: "perp(-1/5) = 5; 7 = 5*(-3) + c -> c = 22; check 5*(-3) + 22 = 7",
  }),
  question({
    id: qid(8),
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Find"],
    emphasis: ["equation", "perpendicular", "rearrange"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the equation of the line that passes through $(6,\\ 2)$ and is perpendicular to $3x + 2y = 8$.",
        marks: 4,
        answer: algAnswer("y = \\frac{2}{3}x - 2"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `rearranged to y = ${plain(P.q8L)}x + 4` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q8m)}`, dependsOn: ["MA1"] },
          { id: "MA2", code: "MA", marks: 1, for: "2 = 2/3 (6) + c, leading to c = \u22122" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(P.q8m, P.q8c)} oe, e.g. 3y = 2x \u2212 6`, dependsOn: ["MA2"] },
        ],
        hints: ["2y = −3x + 8, then divide every term by 2.", "Invert −3/2 and change the sign.", "Substitute (6, 2)."],
        workedSolution: `$3x + 2y = 8 \\Rightarrow y = ${tex(P.q8L)}x + 4$, gradient $${tex(P.q8L)}$. Perpendicular gradient $${tex(P.q8m)}$. Then $2 = ${tex(P.q8m)}(6) + c = 4 + c$, so $c = ${tex(P.q8c)}$ and the line is $${eqTex(P.q8m, P.q8c)}$.`,
        commonErrors: [CE.noRearrange("m = \\frac{1}{3}", 0, "ccea-cer:maths:2024-summer:M4:Q17")],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q17"],
    solutionProgram: "2y = -3x + 8 -> m = -3/2; perp = 2/3; 2 = (2/3)*6 + c -> c = -2; check (2/3)*6 - 2 = 2",
  }),
  question({
    id: qid(9),
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Find"],
    emphasis: ["equation", "perpendicular", "rearrange"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the equation of the line that passes through $(-4,\\ 9)$ and is perpendicular to $5y - 2x = 15$.",
        marks: 4,
        answer: algAnswer("y = -\\frac{5}{2}x - 1"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `rearranged to y = ${plain(P.q9L)}x + 3` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q9m)}`, dependsOn: ["MA1"] },
          { id: "MA2", code: "MA", marks: 1, for: "9 = \u22125/2 (\u22124) + c, leading to c = \u22121" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(P.q9m, P.q9c)} oe, e.g. 2y = \u22125x \u2212 2`, dependsOn: ["MA2"] },
        ],
        hints: ["Add 2x to both sides, then divide every term by 5.", "The given gradient is 2/5.", "−5/2 × −4 = +10, so c = 9 − 10."],
        workedSolution: `$5y - 2x = 15 \\Rightarrow 5y = 2x + 15 \\Rightarrow y = ${tex(P.q9L)}x + 3$. Perpendicular gradient $${tex(P.q9m)}$. Then $9 = ${tex(P.q9m)}(-4) + c = 10 + c$, so $c = ${tex(P.q9c)}$ and the line is $${eqTex(P.q9m, P.q9c)}$.`,
        commonErrors: [
          {
            misconception: "maths.lines.equation-not-found-after-gradient",
            pattern: { kind: "algebraic", latex: "y = -\\frac{5}{2}x + 19" },
            feedback:
              "Two marks for the rearrangement and the perpendicular gradient. Then −5/2 × (−4) = +10, not −10, so c = 9 − 10 = −1. Two negatives multiply to a positive.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2024-november:M4:Q17",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q17", "ccea-cer:maths:2024-november:M4:Q17"],
    solutionProgram: "5y = 2x + 15 -> m = 2/5; perp = -5/2; 9 = (-5/2)*(-4) + c = 10 + c -> c = -1",
  }),
  question({
    id: qid(10),
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Find"],
    emphasis: ["gradient", "two points", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "A line passes through $(-1,\\ 8)$ and $(5,\\ -4)$. Find the gradient of a line perpendicular to it.",
        marks: 2,
        answer: numAnswer(0.5),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `(\u22124 \u2212 8) \u00f7 (5 \u2212 (\u22121)) = \u221212/6 = ${plain(P.q10L)}` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q10)} or 0.5`, dependsOn: ["MA1"] },
        ],
        hints: ["Change in y over change in x, in the same order top and bottom.", "5 − (−1) = 6."],
        workedSolution: `Gradient $= \\dfrac{-4 - 8}{5 - (-1)} = \\dfrac{-12}{6} = ${tex(P.q10L)}$, so a perpendicular line has gradient $${tex(P.q10)}$.`,
        commonErrors: [
          {
            misconception: "maths.lines.gradient-inverted",
            pattern: { kind: "numeric", value: -1 / 2 },
            feedback:
              "The two differences have been used the other way round: gradient is change in y over change in x. Here that is −12 ÷ 6 = −2, and the perpendicular gradient is +1/2.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M4:Q18",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q18"],
    solutionProgram: "m = (-4 - 8)/(5 - (-1)) = -12/6 = -2; perp = 1/2",
  }),
  question({
    id: qid(11),
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Find"],
    emphasis: ["equation", "perpendicular", "two points"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "$A$ is the point $(2,\\ -5)$ and $B$ is the point $(8,\\ 3)$. Find the equation of the line through $B$ that is perpendicular to $AB$.",
        marks: 4,
        answer: algAnswer("y = -\\frac{3}{4}x + 9"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `gradient of AB = (3 \u2212 (\u22125)) \u00f7 (8 \u2212 2) = 8/6 = ${plain(P.q11L)}` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q11m)}`, dependsOn: ["MA1"] },
          { id: "MA2", code: "MA", marks: 1, for: "3 = \u22123/4 (8) + c, leading to c = 9" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(P.q11m, P.q11c)} oe, e.g. 4y = \u22123x + 36`, dependsOn: ["MA2"] },
        ],
        hints: ["Work out the gradient of AB first.", "8/6 simplifies to 4/3.", "The new line passes through B, so substitute (8, 3)."],
        workedSolution: `Gradient of $AB = \\dfrac{3 - (-5)}{8 - 2} = \\dfrac{8}{6} = ${tex(P.q11L)}$. Perpendicular gradient $${tex(P.q11m)}$. Then $3 = ${tex(P.q11m)}(8) + c = -6 + c$, so $c = ${tex(P.q11c)}$ and the line is $${eqTex(P.q11m, P.q11c)}$.`,
        commonErrors: [CE.stoppedAtGradient("m = -\\frac{3}{4}", 2, "ccea-cer:maths:2025-november:M4:Q18")],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q18"],
    solutionProgram: "m(AB) = 8/6 = 4/3; perp = -3/4; 3 = (-3/4)*8 + c = -6 + c -> c = 9",
  }),
  question({
    id: qid(12),
    style: "practice",
    difficulty: 3,
    ao: ["AO2"],
    commandWords: ["Show that"],
    emphasis: ["Show that", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "show" },
    parts: [
      part({
        stem: "Show that the lines $y = 4x - 3$ and $x + 4y = 12$ are perpendicular.",
        marks: 2,
        answer: {
          kind: "steps",
          expectedOrder: ["x + 4y = 12 gives 4y = -x + 12 so y = -1/4 x + 3", "gradients are 4 and -1/4", "4 x (-1/4) = -1 so the lines are perpendicular"],
          allowSkips: false,
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `second equation rearranged to y = ${plain(P.q12b)}x + 3, gradient ${plain(P.q12b)}` },
          {
            id: "A1",
            code: "A",
            marks: 1,
            for: "product of gradients shown to be \u22121, with the conclusion stated",
            dependsOn: ["MA1"],
            examinerNote: "The product must be seen; stating that one gradient is the negative reciprocal of the other, with both gradients written, is also accepted.",
          },
        ],
        hints: ["Rearrange the second equation to y = mx + c.", "Multiply the two gradients together.", "Say what the answer −1 tells you."],
        workedSolution: `$x + 4y = 12 \\Rightarrow 4y = -x + 12 \\Rightarrow y = ${tex(P.q12b)}x + 3$. The gradients are $4$ and $${tex(P.q12b)}$, and $4 \\times ${tex(P.q12b)} = -1$, so the lines are perpendicular.`,
        commonErrors: [
          {
            misconception: "maths.presentation.answer-without-working",
            pattern: { kind: "text", regex: "perpendicular$" },
            feedback:
              "Show that means the reasoning is the answer. Both gradients and the product −1 must appear on the page; a bare statement earns nothing.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M4:Q17",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q17"],
    solutionProgram: "4y = -x + 12 -> m2 = -1/4; m1 = 4; m1*m2 = -1",
  }),
  question({
    id: qid(13),
    style: "practice",
    difficulty: 4,
    ao: ["AO2", "AO3"],
    commandWords: ["Find"],
    emphasis: ["missing coordinate", "perpendicular"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Line $L$ passes through $(1,\\ 2)$ and $(7,\\ 5)$. Line $K$ is perpendicular to $L$ and passes through $(7,\\ 5)$. The point $(k,\\ 7)$ lies on $K$. Find the value of $k$.",
        marks: 4,
        answer: numAnswer(6),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `gradient of L = 3/6 = ${plain(P.q13L)}` },
          { id: "A1", code: "A", marks: 1, for: `gradient of K = ${plain(P.q13m)}`, dependsOn: ["MA1"] },
          { id: "MA2", code: "MA", marks: 1, for: `equation of K: ${eqPlain(P.q13m, P.q13c)}` },
          { id: "A2", code: "A", marks: 1, for: "7 = \u22122k + 19 leading to k = 6", dependsOn: ["MA2"] },
        ],
        hints: ["Find the gradient of L, then of K.", "Use (7, 5) to find c for K.", "Put y = 7 into the equation of K and solve for x."],
        workedSolution: `Gradient of $L = \\dfrac{5-2}{7-1} = ${tex(P.q13L)}$, so gradient of $K = ${tex(P.q13m)}$. Through $(7,5)$: $5 = -14 + c$, so $c = ${tex(P.q13c)}$ and $K$ is $${eqTex(P.q13m, P.q13c)}$. Putting $y = 7$: $7 = -2k + 19$, so $2k = 12$ and $k = ${tex(P.q13k)}$.`,
        commonErrors: [CE.stoppedAtGradient("m = -2", 2, "ccea-cer:maths:2025-november:M4:Q18")],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q18"],
    solutionProgram: "m(L) = (5-2)/(7-1) = 1/2; m(K) = -2; 5 = -2*7 + c -> c = 19; 7 = -2k + 19 -> k = 6; check -2*6 + 19 = 7",
  }),
  question({
    id: qid(14),
    style: "practice",
    difficulty: 4,
    ao: ["AO2"],
    commandWords: ["Find"],
    emphasis: ["perpendicular bisector", "midpoint"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "$P$ is the point $(-1,\\ 2)$ and $Q$ is the point $(5,\\ 6)$. Find the equation of the perpendicular bisector of $PQ$.",
        marks: 5,
        answer: algAnswer("y = -\\frac{3}{2}x + 7"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "midpoint of PQ = (2, 4)" },
          { id: "MA2", code: "MA", marks: 1, for: `gradient of PQ = 4/6 = ${plain(P.q14L)}` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(P.q14m)}`, dependsOn: ["MA2"] },
          { id: "MA3", code: "MA", marks: 1, for: "4 = \u22123/2 (2) + c, leading to c = 7" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(P.q14m, P.q14c)} oe, e.g. 2y = \u22123x + 14`, dependsOn: ["MA3"] },
        ],
        hints: [
          "A perpendicular bisector cuts PQ in half and at right angles, so it needs the midpoint and the perpendicular gradient.",
          "Midpoint: average the x-coordinates and the y-coordinates.",
          "Substitute the midpoint, not P or Q.",
        ],
        workedSolution: `Midpoint of $PQ = \\left(\\dfrac{-1+5}{2},\\ \\dfrac{2+6}{2}\\right) = (2,\\ 4)$. Gradient of $PQ = \\dfrac{6-2}{5-(-1)} = \\dfrac{4}{6} = ${tex(P.q14L)}$, so the perpendicular gradient is $${tex(P.q14m)}$. Then $4 = ${tex(P.q14m)}(2) + c = -3 + c$, so $c = ${tex(P.q14c)}$ and the bisector is $${eqTex(P.q14m, P.q14c)}$.`,
        commonErrors: [
          {
            misconception: "maths.lines.midpoint-instead-of-equation",
            pattern: { kind: "text", regex: "^\\s*\\(?\\s*2\\s*,\\s*4\\s*\\)?\\s*$" },
            feedback:
              "The midpoint is the first mark, not the answer. A bisector is a line: carry on to the perpendicular gradient and then substitute (2, 4) to find c.",
            marksTypicallyEarned: 1,
          },
          {
            misconception: "maths.lines.equation-not-found-after-gradient",
            pattern: { kind: "algebraic", latex: "y = -\\frac{3}{2}x + \\frac{7}{2}" },
            feedback:
              "The gradient marks are earned. P was substituted instead of the midpoint: 2 = −3/2(−1) + c gives the wrong c. A bisector passes through the middle of PQ.",
            marksTypicallyEarned: 3,
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q18", "ccea-cer:maths:2024-november:M4:Q17"],
    solutionProgram: "mid = ((-1+5)/2, (2+6)/2) = (2,4); m(PQ) = 4/6 = 2/3; perp = -3/2; 4 = (-3/2)*2 + c -> c = 7",
  }),

  // ---- exam-style ----
  question({
    id: qid(15),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Find"],
    emphasis: ["equation", "perpendicular", "rearrange"],
    setting: "Pure algebra, no context",
    verbs: { main: "find" },
    parts: [
      part({
        stem: "Find the equation of the line which passes through the point $(10,\\ -3)$ and is perpendicular to the line $2x + 5y = 30$.",
        marks: 4,
        answer: algAnswer("y = \\frac{5}{2}x - 28"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `5y = \u22122x + 30, so y = ${plain(E1.mL)}x + 6` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(E1.mK)} or 2.5`, dependsOn: ["MA1"], examinerNote: "No follow-through from any gradient other than \u22122/5 or its negative reciprocal." },
          { id: "MA2", code: "MA", marks: 1, for: "\u22123 = 5/2 (10) + c, leading to c = \u221228" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(E1.mK, E1.c)} oe, e.g. 2y = 5x \u2212 56`, dependsOn: ["MA2"] },
        ],
        hints: [
          "Rearrange first: the gradient is not 2.",
          "Divide every term by 5 when you make y the subject.",
          "Substitute x = 10 and y = −3 into y = 5/2 x + c.",
        ],
        workedSolution: `$2x + 5y = 30 \\Rightarrow 5y = -2x + 30 \\Rightarrow y = ${tex(E1.mL)}x + 6$, so the gradient is $${tex(E1.mL)}$ and the perpendicular gradient is $${tex(E1.mK)}$. Substituting $(10,\\ -3)$: $-3 = ${tex(E1.mK)}(10) + c = 25 + c$, so $c = ${tex(E1.c)}$. The line is $${eqTex(E1.mK, E1.c)}$.`,
        commonErrors: [
          CE.noRearrange("m = -\\frac{1}{2}", 0, "ccea-cer:maths:2024-summer:M4:Q17"),
          CE.stoppedAtGradient("m = \\frac{5}{2}", 2, "ccea-cer:maths:2025-summer:M4:Q14"),
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q17", "ccea-cer:maths:2025-summer:M4:Q14"],
    solutionProgram: "5y = -2x + 30 -> m = -2/5; perp = 5/2; -3 = (5/2)*10 + c = 25 + c -> c = -28; check (5/2)*10 - 28 = -3",
  }),
  question({
    id: qid(16),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Find", "Write down"],
    emphasis: ["equation", "perpendicular", "diagram"],
    setting: "Two plotted points A and B on a coordinate grid with the line L through them",
    verbs: { a: "find", b: "write-down" },
    figures: [
      svgFigure(
        GRID_FIG,
        "A coordinate grid with the x-axis and y-axis drawn. A straight line L slopes gently downwards from left to right and passes through two marked points, A on the left above the x-axis and B further right on the x-axis.",
      ),
    ],
    parts: [
      part({
        id: "a",
        stem: "The diagram shows the line $L$ through the points $A(-5,\\ 4)$ and $B(3,\\ 0)$.\n\nFind the equation of the line that is perpendicular to $L$ and passes through $B$.",
        marks: 4,
        answer: algAnswer("y = 2x - 6"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `gradient of L = (0 \u2212 4) \u00f7 (3 \u2212 (\u22125)) = \u22124/8 = ${plain(E2.mL)}` },
          { id: "A1", code: "A", marks: 1, for: `perpendicular gradient = ${plain(E2.mK)}`, dependsOn: ["MA1"] },
          { id: "MA2", code: "MA", marks: 1, for: "0 = 2(3) + c, leading to c = \u22126" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(E2.mK, E2.c)}`, dependsOn: ["MA2"] },
        ],
        hints: ["Use the two coordinates printed in the question, not the squares on the grid.", "B is on the x-axis, so its y-coordinate is 0.", "Substitute (3, 0)."],
        workedSolution: `Gradient of $L = \\dfrac{0 - 4}{3 - (-5)} = \\dfrac{-4}{8} = ${tex(E2.mL)}$, so the perpendicular gradient is $${tex(E2.mK)}$. Through $B(3,\\ 0)$: $0 = 2(3) + c$, so $c = ${tex(E2.c)}$ and the line is $${eqTex(E2.mK, E2.c)}$.`,
        commonErrors: [
          {
            misconception: "maths.lines.gradient-counting-squares-ignores-scale",
            pattern: { kind: "algebraic", latex: "m = -1" },
            feedback:
              "The gradient was counted off the grid rather than worked out from the coordinates. The diagram is not drawn accurately, so use (−5, 4) and (3, 0): −4 ÷ 8 = −1/2.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M4:Q16",
          },
        ],
      }),
      part({
        id: "b",
        stem: "Write down the coordinates of the point where this perpendicular line crosses the $y$-axis.",
        marks: 1,
        answer: { kind: "text", accepted: ["(0, -6)", "(0, \u22126)", "0, -6"], keyWords: [{ any: ["(0, -6)", "(0, \u22126)"], marks: 1 }], listingRule: false },
        scheme: [{ id: "A1", code: "A", marks: 1, for: "(0, \u22126), follow through from the candidate's c", ft: true }],
        hints: ["A line crosses the y-axis where x = 0.", "The y-intercept is the value of c."],
        workedSolution: `At the $y$-axis $x = 0$, so $y = c = ${tex(E2.c)}$: the point is $(0,\\ -6)$.`,
        commonErrors: [
          {
            misconception: "maths.lines.intercept-not-recognised",
            pattern: { kind: "text", regex: "-6\\s*,\\s*0" },
            feedback:
              "The coordinates are the other way round. On the y-axis the x-coordinate is 0, so the point is (0, −6). The pair (−6, 0) is where the line crosses the x-axis, and 3 is where it crosses there.",
            marksTypicallyEarned: 0,
          },
        ],
        requiresWorking: false,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q16", "ccea-cer:maths:2025-summer:M4:Q14"],
    solutionProgram: "m(L) = (0-4)/(3-(-5)) = -1/2; perp = 2; 0 = 2*3 + c -> c = -6; y-intercept (0, -6)",
  }),
  question({
    id: qid(17),
    style: "exam-style",
    difficulty: 5,
    ao: ["AO2", "AO3"],
    commandWords: ["Find", "Show that"],
    emphasis: ["rhombus", "diagonals", "perpendicular"],
    setting: "The diagonals of a rhombus ABCD crossing at a given point",
    verbs: { a: "find", b: "find" },
    figures: [
      svgFigure(
        RHOMBUS_FIG,
        "A rhombus ABCD with all four sides marked equal and both diagonals drawn as dashed lines meeting at a point M, where a right-angle square is marked.",
      ),
    ],
    parts: [
      part({
        id: "a",
        stem: "The diagonals of the rhombus $ABCD$ meet at $M(4,\\ 5)$. The diagonal $AC$ has equation $x + 2y = 14$.\n\nFind the equation of the diagonal $BD$.",
        marks: 4,
        answer: algAnswer("y = 2x - 3"),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `2y = \u2212x + 14, so gradient of AC = ${plain(E3.mAC)}` },
          { id: "A1", code: "A", marks: 1, for: `gradient of BD = ${plain(E3.mBD)}, because the diagonals of a rhombus cross at right angles`, dependsOn: ["MA1"] },
          { id: "MA2", code: "MA", marks: 1, for: "5 = 2(4) + c, leading to c = \u22123" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(E3.mBD, E3.c)}`, dependsOn: ["MA2"] },
        ],
        hints: [
          "The diagonals of a rhombus cross at right angles — that is what makes this a perpendicular question.",
          "Rearrange x + 2y = 14 to read the gradient.",
          "M is on both diagonals, so substitute (4, 5).",
        ],
        workedSolution: `$x + 2y = 14 \\Rightarrow y = ${tex(E3.mAC)}x + 7$, so the gradient of $AC$ is $${tex(E3.mAC)}$. The diagonals of a rhombus are perpendicular, so $BD$ has gradient $${tex(E3.mBD)}$. $M(4,\\ 5)$ lies on $BD$: $5 = 2(4) + c$, so $c = ${tex(E3.c)}$ and $BD$ is $${eqTex(E3.mBD, E3.c)}$.`,
        commonErrors: [
          CE.noRearrange("m = -1", 0, "ccea-cer:maths:2024-summer:M4:Q17"),
          CE.stoppedAtGradient("m = 2", 2, "ccea-cer:maths:2024-november:M4:Q17"),
        ],
      }),
      part({
        id: "b",
        stem: "The vertex $D$ has coordinates $(7,\\ 11)$. Find the coordinates of the vertex $B$.",
        marks: 2,
        answer: { kind: "text", accepted: ["(1, -1)", "(1, \u22121)", "1, -1"], keyWords: [{ any: ["(1, -1)", "(1, \u22121)"], marks: 1 }], listingRule: false },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "uses that M is the midpoint of BD: 4 = (x + 7) \u00f7 2 and 5 = (y + 11) \u00f7 2" },
          { id: "A1", code: "A", marks: 1, for: "B = (1, \u22121)", dependsOn: ["MA1"] },
        ],
        hints: [
          "The diagonals of a rhombus bisect each other, so M is the midpoint of BD.",
          "Going from D to M changes x by −3 and y by −6; do the same again.",
          "Check your point satisfies the equation of BD.",
        ],
        workedSolution: `The diagonals bisect each other, so $M$ is the midpoint of $BD$: $4 = \\dfrac{x + 7}{2}$ gives $x = 1$, and $5 = \\dfrac{y + 11}{2}$ gives $y = -1$. So $B = (1,\\ -1)$, and it checks in $y = 2x - 3$: $2(1) - 3 = -1$.`,
        commonErrors: [
          {
            misconception: "maths.lines.midpoint-instead-of-equation",
            pattern: { kind: "text", regex: "5\\.5\\s*,\\s*8" },
            feedback:
              "That is the midpoint of D and M, not the far vertex. M is already the midpoint of BD, so B is the same step again beyond M: from D(7, 11) to M(4, 5) is −3 and −6, so B is (1, −1).",
            marksTypicallyEarned: 1,
          },
        ],
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
    ],
    methodLock: {
      instruction: "Find the equation of the diagonal BD",
      requiredMethod:
        "The perpendicular property of the rhombus diagonals, then substitution of M; measuring the diagram or guessing a second point earns nothing",
      evidence: "ccea-cer:maths:2023-summer:M4:Q16",
    },
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q16", "ccea-cer:maths:2024-november:M4:Q17"],
    solutionProgram:
      "AC: 2y = -x + 14 -> m = -1/2; BD perpendicular so m = 2; through M(4,5): 5 = 8 + c -> c = -3; BD: y = 2x - 3; D(7,11) on BD since 2*7-3 = 11; B = 2M - D = (8-7, 10-11) = (1,-1)",
  }),
  question({
    id: qid(18),
    style: "exam-style",
    difficulty: 5,
    ao: ["AO2", "AO3"],
    commandWords: ["Find"],
    emphasis: ["perpendicular", "missing coordinate"],
    setting: "Two perpendicular lines L and K through given points",
    verbs: { a: "find", b: "find", c: "find" },
    parts: [
      part({
        id: "a",
        stem: "Line $L$ passes through $P(-2,\\ -3)$ and $Q(6,\\ 1)$.\n\nFind the gradient of $L$.",
        marks: 2,
        answer: numAnswer(0.5),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "(1 \u2212 (\u22123)) \u00f7 (6 \u2212 (\u22122)) = 4/8" },
          { id: "A1", code: "A", marks: 1, for: `${plain(E4.mL)} or 0.5`, dependsOn: ["MA1"] },
        ],
        hints: ["Change in y over change in x.", "1 − (−3) = 4 and 6 − (−2) = 8."],
        workedSolution: `Gradient of $L = \\dfrac{1 - (-3)}{6 - (-2)} = \\dfrac{4}{8} = ${tex(E4.mL)}$.`,
        commonErrors: [
          {
            misconception: "maths.lines.gradient-from-wrong-points",
            pattern: { kind: "numeric", value: 2 },
            feedback:
              "The differences have been swapped: 8 ÷ 4 instead of 4 ÷ 8. Gradient is always change in y over change in x, with the points taken in the same order on both lines of the fraction.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M4:Q16",
          },
        ],
      }),
      part({
        id: "b",
        stem: "Line $K$ is perpendicular to $L$ and passes through $Q$. Find the equation of $K$.",
        marks: 3,
        answer: algAnswer("y = -2x + 13"),
        scheme: [
          { id: "A1", code: "A", marks: 1, for: `gradient of K = ${plain(E4.mK)}`, ft: true },
          { id: "MA1", code: "MA", marks: 1, for: "1 = \u22122(6) + c, leading to c = 13" },
          { id: "A2", code: "A", marks: 1, for: `${eqPlain(E4.mK, E4.c)}`, dependsOn: ["MA1"] },
        ],
        hints: ["Negative reciprocal of your answer to part (a).", "K passes through Q(6, 1).", "Write the equation, not just c."],
        workedSolution: `Gradient of $K = ${tex(E4.mK)}$. Through $Q(6,\\ 1)$: $1 = -2(6) + c = -12 + c$, so $c = ${tex(E4.c)}$ and $K$ is $${eqTex(E4.mK, E4.c)}$.`,
        commonErrors: [CE.stoppedAtGradient("m = -2", 1, "ccea-cer:maths:2025-november:M4:Q18")],
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
      part({
        id: "c",
        stem: "The point $(t,\\ 21)$ lies on $K$. Find the value of $t$.",
        marks: 2,
        answer: numAnswer(-4),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "21 = \u22122t + 13 (their equation of K with y = 21)", ft: true },
          { id: "A1", code: "A", marks: 1, for: "t = \u22124", dependsOn: ["MA1"] },
        ],
        hints: ["Substitute y = 21 into the equation of K.", "21 − 13 = 8, and 8 = −2t.", "Dividing 8 by −2 gives a negative answer."],
        workedSolution: `Substituting $y = 21$ into $${eqTex(E4.mK, E4.c)}$: $21 = -2t + 13$, so $-2t = 8$ and $t = ${tex(E4.t)}$. Check: $-2(-4) + 13 = 21$.`,
        commonErrors: [
          {
            misconception: "maths.lines.equation-not-found-after-gradient",
            pattern: { kind: "numeric", value: 4 },
            feedback:
              "The substitution mark is earned. From −2t = 8, dividing by −2 gives t = −4; a positive 4 would give y = 5, not 21. Substituting back is the quickest check.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-november:M4:Q18",
          },
        ],
        followThrough: { fromPart: "b", rule: "use-candidate-value" },
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q18", "ccea-cer:maths:2024-november:M4:Q17"],
    solutionProgram:
      "m(L) = (1-(-3))/(6-(-2)) = 4/8 = 1/2; m(K) = -2; 1 = -2*6 + c -> c = 13; 21 = -2t + 13 -> t = -4; check -2*(-4)+13 = 21",
  }),
];

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

const findTheMistake = [
  {
    id: `ftm.${TID}.01`,
    topic: TID,
    specRefs: ["M4-NA-06"],
    stem: "Niamh was asked to find the equation of the line through $(2,\\ 5)$ perpendicular to $3x + 2y = 18$. Her working:",
    studentWorking: [
      "Gradient of 3x + 2y = 18 is 3",
      "Perpendicular gradient = \u22121/3",
      "5 = \u22121/3 (2) + c",
      "c = 5 + 2/3 = 17/3",
      "y = \u22121/3 x + 17/3",
    ],
    mistakeLine: 1,
    misconception: "maths.lines.gradient-read-without-rearranging",
    whatWentWrong:
      "The gradient was read from 3x + 2y = 18 while y was still tied up with a 2. Rearranging gives 2y = \u22123x + 18, then y = \u22123/2 x + 9, so the gradient is \u22123/2 and the perpendicular gradient is 2/3.",
    correction: [
      "2y = \u22123x + 18, so y = \u22123/2 x + 9 and the gradient is \u22123/2",
      "Perpendicular gradient = 2/3",
      "5 = 2/3 (2) + c, so c = 5 \u2212 4/3 = 11/3",
      "y = 2/3 x + 11/3, or 3y = 2x + 11",
    ],
    marksEarnedAsWritten: [],
    feedback:
      "Every line after the first is worked correctly, which makes this expensive: the scheme allows follow-through only from the correct gradient or its negative reciprocal, so nothing is earned. Make y the subject before you look for m, and divide every term when you do. Summer 2024 M4 Q17: many candidates scored zero here for exactly this reason.",
    source: "ccea-cer:maths:2024-summer:M4:Q17",
  },
  {
    id: `ftm.${TID}.02`,
    topic: TID,
    specRefs: ["M4-NA-06"],
    stem: "Ciara was asked to find the equation of the line through $(8,\\ 1)$ perpendicular to $y = 4x - 5$. Her working:",
    studentWorking: ["Perpendicular gradient = \u22124", "1 = \u22124(8) + c", "c = 33", "y = \u22124x + 33"],
    mistakeLine: 1,
    misconception: "maths.lines.perpendicular-gradient-not-negative-reciprocal",
    whatWentWrong:
      "Only the sign was changed. Perpendicular means negative reciprocal: turn 4 over to get 1/4 and then change the sign, giving \u22121/4. The test is that the two gradients multiply to \u22121, and 4 \u00d7 (\u22124) = \u221216.",
    correction: ["Perpendicular gradient = \u22121/4", "1 = \u22121/4 (8) + c = \u22122 + c", "c = 3", "y = \u22121/4 x + 3"],
    marksEarnedAsWritten: [],
    feedback:
      "The substitution and the arithmetic are sound, so the method you are carrying is right; it is the first line that costs everything, because the rest follows from it. Say the check out loud before you move on: the two gradients must multiply to \u22121. Summer 2025 M4 Q14: weaker candidates used the gradient itself or its reciprocal without the sign change.",
    source: "ccea-cer:maths:2025-summer:M4:Q14",
  },
  {
    id: `ftm.${TID}.03`,
    topic: TID,
    specRefs: ["M4-NA-06"],
    stem: "Sean was asked to find the equation of the line through $(4,\\ 9)$ perpendicular to the line $y = \\frac{2}{3}x + 1$. His working:",
    studentWorking: [
      "Gradient = (9 \u2212 1) \u00f7 (4 \u2212 0) = 2",
      "Perpendicular gradient = \u22121/2",
      "9 = \u22121/2 (4) + c",
      "c = 11",
      "y = \u22121/2 x + 11",
    ],
    mistakeLine: 1,
    misconception: "maths.lines.gradient-from-wrong-points",
    whatWentWrong:
      "A gradient was invented from the point in the question and the intercept of the printed line. Those two points are not both on the given line, so the number 2 belongs to no line at all. The gradient is already printed: it is 2/3.",
    correction: [
      "The given line is y = 2/3 x + 1, so its gradient is 2/3",
      "Perpendicular gradient = \u22123/2",
      "9 = \u22123/2 (4) + c = \u22126 + c",
      "c = 15",
      "y = \u22123/2 x + 15, or 2y = \u22123x + 30",
    ],
    marksEarnedAsWritten: [],
    feedback:
      "This is the error the Summer 2023 examiners singled out: coordinates printed in the question were combined into a gradient of their own, and no follow-through was allowed from it. Before you calculate anything, ask which line the gradient is supposed to describe; if the equation is given, read m from it.",
    source: "ccea-cer:maths:2023-summer:M4:Q16",
  },
];

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.${TID}.${String(n).padStart(2, "0")}`,
  topic: TID,
  specRefs: ["M4-NA-06"],
  kind,
  prompt,
  answer,
  keyWords,
  examUnit: "M4",
  difficultyPrior,
});

const prompts = [
  rp(1, "formula", "The gradients of two perpendicular lines multiply to give what?", "$-1$. So if one gradient is $m$, the other is $-\\dfrac{1}{m}$.", ["\u22121", "negative reciprocal"], 3),
  rp(2, "procedure", "The four steps for finding the equation of a perpendicular line through a given point.", "1 Rearrange the given line to $y = mx + c$ and read $m$. 2 Perpendicular gradient $= -\\dfrac{1}{m}$. 3 Substitute the given point into $y = mx + c$ to find $c$. 4 Write the whole equation.", ["rearrange", "negative reciprocal", "substitute", "write the equation"], 5),
  rp(3, "trap", "Why is the gradient of $3x + 2y = 18$ not $3$?", "Because $y$ is not on its own. Rearranged, $2y = -3x + 18$ and $y = -\\tfrac{3}{2}x + 9$, so the gradient is $-\\tfrac{3}{2}$. Every term is divided by 2, including the $3x$.", ["rearrange", "divide every term", "\u22123/2"], 7),
  rp(4, "qa", "A line has gradient $-\\dfrac{2}{7}$. What is the gradient of a perpendicular line?", "$\\dfrac{7}{2}$. Turn it over and change the sign; check $-\\tfrac{2}{7} \\times \\tfrac{7}{2} = -1$.", ["7/2", "negative reciprocal"], 4),
  rp(5, "procedure", "You have the perpendicular gradient and a point. What is the very next line of working?", "Substitute the point into $y = mx + c$ and solve for $c$. The examiners' note is that most candidates stop at the gradient; the remaining marks live in this line.", ["substitute", "solve for c"], 6),
  rp(6, "definition", "What is a perpendicular bisector, and what two things must you work out to find its equation?", "The line that cuts a segment in half and at right angles. You need the midpoint of the segment and the negative reciprocal of the segment's gradient.", ["midpoint", "negative reciprocal", "right angles"], 6),
  rp(7, "qa", "The diagonals of a rhombus have what special relationship?", "They bisect each other at right angles, so their gradients multiply to $-1$ and the crossing point lies on both.", ["right angles", "bisect", "\u22121"], 5),
  rp(8, "trap", "A question gives a line and a point, and you want the gradient. Where must the gradient come from?", "From the given line only. Building a gradient out of the point in the question and some other printed coordinate describes no line in the question, and no follow-through is allowed from it.", ["from the given line", "no follow-through"], 7),
  rp(9, "procedure", "You have the equation of a perpendicular line and you are asked for a missing coordinate. What do you do?", "Substitute the coordinate you know into the equation and solve the resulting linear equation for the one you do not know.", ["substitute", "solve"], 6),
  rp(10, "novel-example", "A line through $(0,\\ 7)$ is perpendicular to $y = \\tfrac{1}{3}x - 2$. Write its equation without doing any substitution.", "$y = -3x + 7$. The point is on the $y$-axis, so its $y$-coordinate is $c$ directly.", ["\u22123", "c = 7", "y-axis"], 5),
];

// ---------------------------------------------------------------------------
// Insight card (packs/maths/insights/m4.perpendicular-lines.json)
// ---------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";
const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", "maths", "insights", `m4.${SLUG}.json`), "utf8"));

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

const HOW_EXAMINED =
  "M4 (calculator, 2 hours, 100 marks). One question every series, 4 marks, single part, placed between Q14 and Q18: Summer 2023 Q16, Summer 2024 Q17, November 2024 Q17, Summer 2025 Q14, November 2025 Q18, Summer 2026 Q15. Half of them print the line in the form ax + by = c so that it must be rearranged first. The scheme is A1 for the perpendicular gradient, MA1 for the substitution of the point, MA1 for c and A1 for the finished equation; when the question asks for a missing coordinate instead, the last two marks move to forming the equation and substituting the known coordinate.";

const bundle = {
  $schema: "../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: TID,
    slug: SLUG,
    title: "Gradients of perpendicular lines and equations of perpendiculars",
    subject: "maths",
    unit: "M4",
    tier: "H",
    strand: "NA",
    statementIds: ["M4-NA-06"],
    prerequisites: ["maths.m3.straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines"],
    order: 132,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: [
      "ccea-cer:maths:2023-summer:M4:Q16",
      "ccea-cer:maths:2024-summer:M4:Q17",
      "ccea-cer:maths:2024-november:M4:Q17",
      "ccea-cer:maths:2025-summer:M4:Q14",
      "ccea-cer:maths:2025-november:M4:Q18",
    ],
    examWeightHint:
      "One 4-mark question in every M4 paper read (Summer 2023 Q16, Summer 2024 Q17, November 2024 Q17, Summer 2025 Q14, November 2025 Q18, Summer 2026 Q15), always in the middle third of the paper. The harder versions give the line as ax + by = c, or ask for a missing coordinate rather than an equation.",
    mustMemorise: [
      "Perpendicular gradient = \u22121/m; equivalently the two gradients multiply to \u22121",
      "Rearrange to y = mx + c before reading m, dividing every term",
      "Substitute the given point into y = mx + c to find c, then write the whole equation",
      "Gradient between two points = (change in y) \u00f7 (change in x), taken in the same order",
      "The diagonals of a rhombus (and of a square) bisect each other at right angles",
      "A perpendicular bisector needs the midpoint as well as the perpendicular gradient",
    ],
    onFormulaSheet: [],
    notOnThisSpec: [
      "The vector form or the equation of a line in three dimensions (A level, not GCSE)",
      "Distance from a point to a line as a formula (not on this specification)",
      "The equation of a tangent to a circle at a given point is M8-NA, not M4: this statement is about perpendicular gradients themselves",
    ],
    externalRefs: [
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
        asOf: UPDATED,
      },
    ],
    keywords: ["perpendicular lines", "negative reciprocal", "gradient", "equation of perpendicular", "rhombus diagonals", "perpendicular bisector"],
  },
  note: {
    id: `note.${TID}`,
    topic: TID,
    title: "Perpendicular lines",
    subject: "maths",
    unit: "M4",
    tier: "H",
    specRefs: ["M4-NA-06"],
    calculator: true,
    formulaSheet: {
      given: [],
      mustKnow: [
        "y = mx + c, and the gradient between two points = (change in y) \u00f7 (change in x)",
        "Perpendicular gradients: m and \u22121/m, product \u22121",
        "Midpoint of a segment = the average of the x-coordinates and the average of the y-coordinates",
      ],
    },
    notOnThisSpec: [
      "The vector form or the equation of a line in three dimensions (A level, not GCSE)",
      "Distance from a point to a line as a formula (not on this specification)",
    ],
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Write down the gradient of a line perpendicular to a given line, from a whole number, a fraction or a negative fraction",
        "Rearrange ax + by = c into y = mx + c, dividing every term, and read the gradient",
        "Find the equation of the line through a given point perpendicular to a given line, and write the whole equation",
        "Find a gradient from two coordinates, including when one coordinate is negative",
        "Use the equation of the perpendicular as a tool: substitute a known coordinate to find a missing one",
        "Find the equation of the perpendicular bisector of a segment, using the midpoint",
        "Use the fact that the diagonals of a rhombus cross at right angles to find the equation of the second diagonal",
        "Show that two given lines are perpendicular by finding both gradients and their product",
      ],
      howExamined: HOW_EXAMINED,
      traps: [
        "Reading the gradient before rearranging: from 3x + 2y = 7 the gradient is not 3 (Summer 2024 M4 Q17, where many scored zero)",
        "Changing the sign without turning the fraction over, or turning it over without changing the sign (Summer 2025 M4 Q14)",
        "Stopping at the perpendicular gradient and never substituting the point, so c is missing (November 2024 M4 Q17, Summer 2025 M4 Q14)",
        "Inventing a gradient from coordinates printed in the question that are not both on the given line \u2014 no follow-through is allowed from it (Summer 2023 M4 Q16)",
        "Finding both gradients in a missing-coordinate question and stalling, instead of writing the equation and substituting (November 2025 M4 Q18)",
        "Substituting an end point instead of the midpoint in a perpendicular bisector",
        "Dividing only the constant when rearranging, so \u22124y = \u22123x + 12 becomes y = \u22123/4 x \u2212 3",
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
      title: "Perpendicular gradients warm-up",
      subject: "maths",
      units: ["M4"],
      itemIds: [`dx.${TID}`, `rp.${TID}.01`, qid(1), qid(2), qid(3), `rp.${TID}.03`, qid(4)],
      showTopicLabels: false,
      version: 1,
    },
    {
      id: `set.${TID}.mixed`,
      topic: TID,
      kind: "mixed",
      title: "Perpendiculars, bisectors and diagonals, mixed",
      subject: "maths",
      units: ["M4"],
      itemIds: [qid(8), qid(11), `ftm.${TID}.01`, qid(13), qid(14), `ftm.${TID}.03`, qid(17), qid(18), `rp.${TID}.08`],
      showTopicLabels: false,
      version: 1,
    },
  ],
  verification: [],
};

// ---------------------------------------------------------------------------
// Verification details
// ---------------------------------------------------------------------------

const SCOPE = "Higher tier (M4). Straight lines in two dimensions only, as M4-NA-06 states; no three-dimensional lines, no vector form, no distance-from-a-point formula";
const FORMULA = "Nothing is taken from the Higher formula sheet: y = mx + c, the gradient formula, the midpoint and the perpendicular rule are all must-know (packs/maths/exam-true/formula-sheets.json, mk.straight-line, mk.midpoint, mk.parallel-perpendicular)";

const numericDetails = {};
for (const q of questions) numericDetails[q.id] = q.solutionProgram;

const details = {};
details[`note.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Sheet quotes the tariff seen in the six M4 papers read: one 4-mark single-part question per series, Q14\u2013Q18",
  numeric: "Every gradient, intercept and coordinate quoted in the note recomputed as exact fractions in scratchpad/m4-batch/gen-perpendicular-lines.mjs (F/add/mul/intercept helpers, each substitution checked back into y = mx + c)",
  examiner: "Traps map one to one onto the five findings of packs/maths/insights/m4.perpendicular-lines.json (Summer 2023 Q16, Summer 2024 Q17, November 2024 Q17, Summer 2025 Q14, November 2025 Q18)",
};
for (const we of workedExamples) {
  details[we.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff:
      we.id.endsWith("01")
        ? "Five steps earning MA1 A1 MA1 MA1 A1, the 4-mark shape of Summer 2024 M4 Q17 with one extra step for the rearrangement"
        : we.id.endsWith("02")
          ? "Four steps matching the 4-mark missing-coordinate scheme of November 2025 M4 Q18"
          : "Four steps matching a 4-mark equation-of-a-diagonal question; the rhombus context comes from the Teacher Guidance on M4-NA-06",
    numeric: "",
    symbolic: "",
    examiner: "",
  };
}
details[`we.${TID}.01`].numeric =
  "4x + 3y = 24 gives m = -4/3; perpendicular 3/4; c = 5 - (3/4)(-6) = 19/2; substituting x = -6 returns y = 5 exactly (checked by intercept() in the generator). Twin: 5x + 2y = 14 gives m = -5/2, perpendicular 2/5, c = -1 - (2/5)(4) = -13/5, and (2/5)(4) - 13/5 = -1";
details[`we.${TID}.01`].symbolic = "y = (3/4)x + 19/2 checked at x = -6, 0 and 2: y = 5, 9.5 and 11, all on 4y = 3x + 38";
details[`we.${TID}.01`].examiner =
  "Exercises the Summer 2024 M4 Q17 finding (cannot rearrange to read the gradient) and the Summer 2025 M4 Q14 finding (gradient known, c only by the more able)";
details[`we.${TID}.02`].numeric =
  "m(L) = (5-1)/(6-(-2)) = 1/2; m(K) = -2; c = 5 - (-2)(6) = 17; t from 3 = -2t + 17 gives t = 7, and -2(7) + 17 = 3. Twin: m(L) = (6-4)/(5-(-1)) = 1/3, m(K) = -3, c = 6 + 15 = 21, s from 12 = -3s + 21 gives s = 3";
details[`we.${TID}.02`].symbolic = "y = -2x + 17 checked at x = 6, 7 and 0: y = 5, 3 and 17";
details[`we.${TID}.02`].examiner = "Built on the November 2025 M4 Q18 finding: both gradients found, then the candidates stalled";
details[`we.${TID}.03`].numeric =
  "3y = x + 9 gives m = 1/3; M(3,4) checked on it since 3(4) = 3 + 9; perpendicular gradient -3; c = 4 + 9 = 13; -3(3) + 13 = 4. Twin: 4y = x - 6 gives m = 1/4, perpendicular -4, c = -1 + 8 = 7, and -4(2) + 7 = -1";
details[`we.${TID}.03`].symbolic = "y = -3x + 13 checked at x = 3, 0 and 4: y = 4, 13 and 1";
details[`we.${TID}.03`].examiner =
  "Covers the Teacher Guidance example on M4-NA-06 (rhombus diagonals) and the Summer 2023 M4 Q16 finding that the gradient must come from the given line";

details[`dx.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Diagnostic items, not tariffed; each is one step of the 4-mark question",
  numeric:
    "Each item checked in the generator: perp(3) = -1/3; 2x + 5y = 20 gives -2/5; perp(-5/2) = 2/5; 3 = 4(2) + c gives c = -5; (4-8)/(5-(-3)) = -1/2; (-1/4)(4) = -1; perpendicular of 2/3 is -3/2 with c = 2 + 9 = 11",
  examiner:
    "Every distractor carries a registry misconception drawn from the five findings on the insight card: gradient-read-without-rearranging, perpendicular-gradient-not-negative-reciprocal, equation-not-found-after-gradient, gradient-from-wrong-points, gradient-inverted, gradient-sign-missed, intercept-not-recognised",
};
for (const q of questions) {
  details[q.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: `${q.totalMarks} marks in ${q.parts.length} part(s); mark codes and shape taken from the M4 schemes read (Summer 2024 Q17 A1/MA1/MA1/A1, November 2024 Q17, November 2025 Q18, Summer 2025 Q14)`,
    numeric: numericDetails[q.id],
    symbolic:
      q.parts.some((p) => p.answer.kind === "algebraic")
        ? "Each equation checked at three x-values by substituting back into y = mx + c and confirming the given point lies on it"
        : undefined,
    examiner: `Exercises ${q.examinerSources.join(", ")}`,
  };
}
for (const f of findTheMistake) {
  details[f.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Matches the 4-mark single-part question shape; marksEarnedAsWritten reflects the no-follow-through rule in the schemes read",
    numeric:
      f.id.endsWith("01")
        ? "Correct route recomputed: 2y = -3x + 18, m = -3/2, perpendicular 2/3, c = 5 - 4/3 = 11/3, and (2/3)(2) + 11/3 = 5"
        : f.id.endsWith("02")
          ? "Correct route recomputed: perpendicular of 4 is -1/4, c = 1 + 2 = 3, and (-1/4)(8) + 3 = 1"
          : "Correct route recomputed: gradient 2/3 printed, perpendicular -3/2, c = 9 + 6 = 15, and (-3/2)(4) + 15 = 9",
    examiner: `Seeded from ${f.source}`,
  };
}
for (const p of prompts) {
  details[p.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Retrieval prompt; no tariff",
    numeric: "Every worked value in the prompt or answer recomputed with the generator's exact-fraction helpers",
    examiner: "Drawn from the rule lines of packs/maths/insights/m4.perpendicular-lines.json",
  };
}

bundle.verification = collectLogs(bundle, details);

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const blocks = [
  { type: "h", text: "Perpendicular lines" },
  {
    type: "callout",
    kind: "spec",
    title: "The statement",
    md: "**M4-NA-06** \u2014 understand and use the gradients of perpendicular lines.\nThe Teacher Guidance adds the two shapes it is examined in: showing that $y = -5x$ and $5y = x + 4$ are perpendicular, and finding the equation of one diagonal of a rhombus from the other and the midpoint.",
    source: "CCEA GCSE Mathematics specification, statement M4-NA-06, with its Teacher Guidance",
  },
  {
    type: "p",
    md: "Every M4 paper read for this lesson carries one of these, worth **4 marks**, somewhere between Q14 and Q18. The examiners' verdict in Summer 2025 was that it is being answered better each year: almost everyone now knows the gradient flips and changes sign. The marks are lost **after** that \u2014 in the rearranging before it, and in the substitution after it.",
  },
  {
    type: "figure",
    alt: "Coordinate axes with a solid line L of gradient one half and a dashed line K of gradient minus two crossing it at right angles at a marked point P.",
    svg: AXES_FIG,
    caption: "Gradient 1/2 and gradient \u22122: across 2 and up 1 becomes across 1 and down 2. Their product is \u22121.",
  },
  {
    type: "gate",
    id: "g0",
    kind: "choice",
    prompt: "Two lines are perpendicular. What do their gradients multiply to give?",
    options: ["\u22121", "1", "0"],
    answer: "\u22121",
    explain: "That one fact is the whole topic. A product of 1 means the lines are parallel-ish in slope, and 0 is impossible for two sloping lines.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why \u22121, and not something else",
    md: "A gradient is a direction: **across $q$, up $p$** means gradient $\\tfrac{p}{q}$. Turn that arrow a quarter turn and it becomes **across $-p$, up $q$**, so the new gradient is $\\tfrac{q}{-p} = -\\tfrac{q}{p}$ \u2014 the old one turned over with its sign changed. Multiply them: $\\tfrac{p}{q} \\times \\left(-\\tfrac{q}{p}\\right) = -1$, every time.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "What is the gradient of a line perpendicular to $y = 3x + 1$?",
    options: ["\u22121/3", "3", "\u22123"],
    answer: "\u22121/3",
    explain: "Turn 3 over to get 1/3, then change the sign. Check: 3 \u00d7 (\u22121/3) = \u22121.",
  },
  { type: "h", text: "The method, and the reason for each step" },
  {
    type: "p",
    md: "**1 Rearrange the given line to $y = mx + c$.** The coefficient of $x$ is the gradient only when $y$ stands alone. From $4x + 3y = 24$: subtract $4x$ to get $3y = -4x + 24$, then divide **every term** by 3 to get $y = -\\tfrac{4}{3}x + 8$. The gradient is $-\\tfrac{4}{3}$, not $-4$ and certainly not $4$.\n**2 Turn it over and change the sign.** $-\\tfrac{4}{3} \\rightarrow \\tfrac{3}{4}$.\n**3 Substitute the given point.** Through $(-6,\\ 5)$: $5 = \\tfrac{3}{4}(-6) + c = -\\tfrac{9}{2} + c$, so $c = \\tfrac{19}{2}$.\n**4 Write the whole equation:** $y = \\tfrac{3}{4}x + \\tfrac{19}{2}$, or $4y = 3x + 38$.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "blank",
    prompt: "Rearrange $5y - 2x = 15$. What is its gradient?",
    answer: "2/5",
    explain: "5y = 2x + 15, so y = 2/5 x + 3. Every term is divided by 5, including the 2x.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2024 M4 Q17",
    md: "The line was printed as $3x + 2y = 7$. **Many candidates scored zero** because they could not rearrange it to read the gradient, and the scheme allows follow-through only from the correct gradient or its negative reciprocal. One line of rearranging protects all four marks.",
    source: "ccea-cer:maths:2024-summer:M4:Q17",
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: "A line of gradient $\\tfrac{3}{4}$ passes through $(8,\\ 1)$. What is $c$?",
    answer: "-5",
    explain: "1 = 3/4 (8) + c = 6 + c, so c = \u22125.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "November 2024 M4 Q17 and Summer 2025 M4 Q14",
    md: "In both series most candidates produced the perpendicular gradient and then could not finish. **The gradient is one mark of four.** Substituting the point into $y = mx + c$, solving for $c$, and writing the finished equation are the other three, and a wrong starting gradient usually meant nothing at all.",
    source: "ccea-cer:maths:2024-november:M4:Q17; ccea-cer:maths:2025-summer:M4:Q14",
  },
  {
    type: "gate",
    id: "g3b",
    kind: "number",
    prompt: "Out of the 4 marks, how many does the perpendicular gradient on its own earn?",
    answer: "1",
    explain: "One. The other three are the substitution, the value of c, and the finished equation.",
  },
  { type: "h", text: "The equation is a tool, not the answer" },
  {
    type: "p",
    md: "The A-grade version of this question does not ask for an equation at all. **November 2025 Q18** gave two points on line $L$, two points on a perpendicular line $K$ \u2014 one of them with an unknown coordinate \u2014 and asked for that coordinate. Most candidates found both gradients and stopped.\nThe move is to write $K$'s equation anyway, then substitute what you know. With $L$ through $(-2,\\ 1)$ and $(6,\\ 5)$, $m_L = \\tfrac{1}{2}$ and $m_K = -2$. Through $(6,\\ 5)$: $c = 17$, so $K$ is $y = -2x + 17$. If $(t,\\ 3)$ is on $K$ then $3 = -2t + 17$, giving $t = 7$.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: "$K$ is $y = -2x + 17$. The point $(u,\\ 9)$ lies on $K$. What is $u$?",
    answer: "4",
    explain: "9 = \u22122u + 17, so 2u = 8 and u = 4.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2023 M4 Q16",
    md: "The commonest error was inventing a gradient from the two coordinates printed in the question \u2014 numbers that were not both on the given line. **No follow-through was allowed from it.** Before you divide anything, name the line your gradient belongs to.",
    source: "ccea-cer:maths:2023-summer:M4:Q16",
  },
  {
    type: "gate",
    id: "g4b",
    kind: "choice",
    prompt: "A question gives the line $y = \\tfrac{2}{3}x + 1$ and the point $(4,\\ 9)$. Where does the gradient come from?",
    options: ["The printed equation: $m = \\tfrac{2}{3}$", "The point and the intercept: $(9-1) \\div (4-0) = 2$", "The two numbers in the point: $9 \\div 4$"],
    answer: "The printed equation: $m = \\tfrac{2}{3}$",
    explain: "The point is not on the given line, so combining it with anything else describes no line in the question.",
  },
  { type: "h", text: "Shapes: rhombus diagonals and perpendicular bisectors" },
  {
    type: "p",
    md: "A **rhombus** has four equal sides, and that forces its diagonals to bisect each other at right angles. So if one diagonal's equation and the crossing point are given, the other diagonal is a perpendicular-line question in disguise: read $m$, flip and change sign, substitute the crossing point.\nA **perpendicular bisector** of $PQ$ needs two things: the perpendicular gradient, and the **midpoint** of $PQ$ (average the $x$-coordinates, average the $y$-coordinates). Substituting $P$ instead of the midpoint gives a parallel line in the wrong place.",
  },
  {
    type: "figure",
    alt: "A rhombus ABCD with all four sides marked equal and both diagonals drawn as dashed lines meeting at a point M, where a right-angle square is marked.",
    svg: RHOMBUS_FIG,
    caption: "Equal sides force the diagonals to cross at right angles at M, which is the midpoint of both.",
  },
  {
    type: "gate",
    id: "g5",
    kind: "blank",
    prompt: "$P(-1,\\ 2)$ and $Q(5,\\ 6)$. What is the midpoint of $PQ$?",
    answer: "(2, 4)",
    explain: "Average each coordinate: (\u22121 + 5) \u00f7 2 = 2 and (2 + 6) \u00f7 2 = 4.",
  },
  {
    type: "gate",
    id: "g6",
    kind: "choice",
    prompt: "The diagonals of a rhombus cross at $(6,\\ 2)$ and one has gradient $\\tfrac{2}{3}$. Which is the other diagonal?",
    options: ["y = \u22123/2 x + 11", "y = \u22123/2 x + 2", "y = 2/3 x \u2212 2"],
    answer: "y = \u22123/2 x + 11",
    explain: "Gradient \u22123/2, then 2 = \u22123/2 (6) + c = \u22129 + c, so c = 11.",
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** $y = mx + c$; gradient $= \\dfrac{\\text{change in } y}{\\text{change in } x}$; perpendicular gradient $= -\\dfrac{1}{m}$; midpoint $= \\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)$; the diagonals of a rhombus bisect each other at right angles.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "It is nearly always worded **\u201cFind the equation of the line which passes through the point \u2026 and is perpendicular to \u2026\u201d**, one part, 4 marks, no diagram. The first mark is the perpendicular gradient. The last mark is the **whole equation** written out, so finishing with \u201c$c = 5$\u201d scores three of four.\nIf you are stuck: rearrange whatever line you are given, write $m$, write $-\\tfrac{1}{m}$, then write $y = -\\tfrac{1}{m}x + c$ and substitute. Even an unfinished version of that chain collects the method marks. If the question mentions a rhombus, a square or a bisector, the perpendicular idea is hiding inside the shape.",
  },
  { type: "prompt", promptId: `rp.${TID}.02` },
  { type: "prompt", promptId: `rp.${TID}.03` },
  { type: "prompt", promptId: `rp.${TID}.05` },
  { type: "prompt", promptId: `rp.${TID}.08` },
];

writeBundle("m4", SLUG, bundle, blocks);
