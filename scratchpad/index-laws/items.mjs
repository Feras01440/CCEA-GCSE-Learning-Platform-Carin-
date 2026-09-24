/**
 * Items for maths.m7.index-laws-zero-and-negative-powers (H bundle).
 * Every numeric value here is recomputed in gen.mjs from the stem numbers before it is written.
 */
import { powersOfTwoTableDataUri, rectangleAreaDataUri } from "./svg.mjs";

export const TOPIC = "maths.m7.index-laws-zero-and-negative-powers";
export const SR = ["M7-NA-02"];

export const P1 = {
  unit: "M7",
  paper: 1,
  calculator: false,
  resources: ["Formula sheet printed on page 2 of the paper"],
};
export const P2 = {
  unit: "M7",
  paper: 2,
  calculator: true,
  resources: ["Formula sheet printed on page 2 of the paper", "Scientific calculator"],
};

const WE = (n) => `we.${TOPIC}.${n}`;
const Q = (n) => `q.${TOPIC}.${String(n).padStart(4, "0")}`;
const FTM = (n) => `ftm.${TOPIC}.${n}`;
export const RP = (n) => `rp.${TOPIC}.${n}`;

const CER = {
  m7p1q17: "ccea-cer:maths:2025-summer:M71:Q17",
  m8p1q8: "ccea-cer:maths:2025-summer:M81:Q8",
  m7p2q9: "ccea-cer:maths:2025-summer:M72:Q9",
  m7p2q10: "ccea-cer:maths:2025-november:M72:Q10",
  m7p1q11: "ccea-cer:maths:2023-summer:M71:Q11",
  m8p1q11: "ccea-cer:maths:2025-november:M81:Q11",
  m7p1q15: "ccea-cer:maths:2024-november:M71:Q15",
  m8p1q8b: "ccea-cer:maths:2024-november:M81:Q8",
};
export { CER };

// --- answer-spec helpers ----------------------------------------------------

const num = (value, { forms = ["decimal", "fraction"], simplified, unit, unitRequired = false } = {}) => ({
  kind: "numeric",
  value,
  tolerance: { type: "exact" },
  ...(unit ? { unit } : {}),
  unitRequired,
  acceptForms: forms,
  ...(simplified === undefined ? {} : { mustBeSimplified: simplified }),
});

const alg = (latex, variables) => ({ kind: "algebraic", latex, equivalence: "equivalent", variables });

/** "Give your answer as a single term" — the form itself carries a mark, so it is key-word marked. */
const singleTerm = (accepted, coefficient, powerForms, rejects) => ({
  kind: "text",
  accepted,
  keyWords: [
    { any: coefficient, marks: 1, reject: rejects },
    { any: powerForms, marks: 1 },
  ],
  listingRule: false,
});

const mp = (id, code, marks, text, extra = {}) => ({ id, code, marks, for: text, ...extra });
const ce = (misconception, pattern, feedback, marksTypicallyEarned, source) => ({
  misconception,
  pattern,
  feedback,
  marksTypicallyEarned,
  ...(source ? { source } : {}),
});
const nErr = (value) => ({ kind: "numeric", value });
const aErr = (latex) => ({ kind: "algebraic", latex });
const tErr = (regex) => ({ kind: "text", regex });

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

export function workedExamples(v) {
  return [
    {
      id: WE("01"),
      topic: TOPIC,
      specRefs: SR,
      paper: P1,
      stem: "Paper 1, no calculator.\n\nWrite down the value of\n(a) $12^{0}$\n(b) $3^{-1}$\n(c) $2^{-4}$\n(d) $10^{-3}$",
      steps: [
        {
          n: 1,
          working: "$12^{0} = 1$",
          decision:
            "Come down the ladder of powers of 12: each step divides by 12, and the step below $12^{1} = 12$ is $12 \\div 12 = 1$. So the zero index gives 1 for every base except 0. It does not give the base and it does not give nothing.",
          whyMenu: {
            options: [
              "Because the step below $12^{1}$ divides by 12, which lands on 1",
              "Because zero of anything is nothing",
              "Because the index does not change the base",
            ],
            correct: 0,
            explain:
              "The second answer gives 0 and the third gives 12; CCEA reports both as the usual wrong answers. Only the dividing pattern explains why 1 is forced.",
          },
          earns: ["A1"],
        },
        {
          n: 2,
          working: `$3^{-1} = \\dfrac{1}{3^{1}} = \\dfrac{1}{${v.a2den}}$`,
          decision:
            "A minus in the index means reciprocal: turn it over. Index $-1$ is the plainest case, so there is only one three underneath. Nothing here is negative.",
          earns: ["A1"],
        },
        {
          n: 3,
          working: `$2^{-4} = \\dfrac{1}{2^{4}} = \\dfrac{1}{${v.a3den}}$`,
          decision:
            "Same move, bigger index. Work out the positive power first ($2^{4} = 16$) and only then put it underneath, so the arithmetic stays ordinary.",
          earns: ["A1"],
        },
        {
          n: 4,
          working: `$10^{-3} = \\dfrac{1}{10^{3}} = \\dfrac{1}{${v.a4den}} = ${v.a4dec}$`,
          decision:
            "For base 10 the index counts the zeros, so three zeros go underneath. Either the fraction or the decimal scores; what does not score is $-1000$, which reads the minus as belonging to the answer.",
          earns: ["A1"],
        },
      ],
      finalAnswer: `$1$, $\\dfrac{1}{3}$, $\\dfrac{1}{16}$ and $\\dfrac{1}{1000}$ (or $${v.a4dec}$)`,
      twin: {
        stem: "Write down the value of $2^{-5}$. Give your answer as a fraction.",
        answer: num(v.twin1, { forms: ["fraction"], simplified: true }),
      },
      faded: [
        { showSteps: 2, studentSupplies: [3, 4] },
        { showSteps: 1, studentSupplies: [2, 3, 4] },
      ],
      verification: `ver.${WE("01")}`,
      version: 1,
    },

    {
      id: WE("02"),
      topic: TOPIC,
      specRefs: SR,
      paper: P1,
      stem: "Simplify\n(a) $3x^{2} \\times 4x^{5}$\n(b) $12y^{7} \\div 3y^{4}$\n(c) $(2a^{3})^{3}$",
      steps: [
        {
          n: 1,
          working: "number in front → ordinary arithmetic;  letter → index law",
          decision:
            "Split the job in two before touching anything. The numbers in front are just numbers and behave normally. The letters are the only place an index law applies. Mixing the two is the single biggest source of lost marks in these questions.",
          whyMenu: {
            options: [
              "The numbers in front multiply or divide as usual; only the indices follow the laws",
              "Everything adds, because the terms are being combined",
              "The numbers in front take the same index as the letter",
            ],
            correct: 0,
            explain:
              "The second gives $7x^{7}$ and the third gives nonsense such as $12^{7}x^{7}$. Two jobs, kept apart.",
          },
        },
        {
          n: 2,
          working: `(a) $3 \\times 4 = ${v.b1coef}$ and $x^{2+5} = x^{${v.b1pow}}$, so $${v.b1coef}x^{${v.b1pow}}$`,
          decision:
            "Multiplying the same base means adding the indices, because $x^{2}$ is two $x$s and $x^{5}$ is five more. Write it as one term: a multiplication sign left in the answer is not a simplified expression.",
          earns: ["A1"],
        },
        {
          n: 3,
          working: `(b) $12 \\div 3 = ${v.b2coef}$ and $y^{7-4} = y^{${v.b2pow}}$, so $${v.b2coef}y^{${v.b2pow}}$`,
          decision:
            "Dividing means subtracting the indices — four of the seven $y$s cancel. This is where CCEA saw $d^{30} \\div d^{10}$ turned into $d^{3}$, so say the word subtract as you write.",
          earns: ["A1"],
        },
        {
          n: 4,
          working: `(c) $2^{3} = ${v.b3coef}$ and $(a^{3})^{3} = a^{3 \\times 3} = a^{${v.b3pow}}$, so $${v.b3coef}a^{${v.b3pow}}$`,
          decision:
            "The power outside the bracket lands on everything inside, the 2 included. A power of a power multiplies the indices, because three lots of three $a$s is nine $a$s. Leaving the 2 alone gives $2a^{9}$ and costs a mark.",
          earns: ["A1"],
        },
      ],
      finalAnswer: `(a) $12x^{7}$  (b) $4y^{3}$  (c) $8a^{9}$`,
      twin: {
        stem: "Simplify $(3m^{4})^{3}$.",
        answer: alg(`${v.twin2coef}m^{${v.twin2pow}}`, ["m"]),
      },
      faded: [
        { showSteps: 2, studentSupplies: [3, 4] },
        { showSteps: 1, studentSupplies: [2, 3, 4] },
      ],
      verification: `ver.${WE("02")}`,
      version: 1,
    },

    {
      id: WE("03"),
      topic: TOPIC,
      specRefs: SR,
      paper: P1,
      stem: "Paper 1, no calculator. Work out, giving each answer as a fraction in its lowest terms.\n(a) $5^{-2}$\n(b) $2^{-3} \\times 2^{5}$\n(c) $\\left(\\dfrac{2}{3}\\right)^{-2}$",
      steps: [
        {
          n: 1,
          working: `(a) $5^{-2} = \\dfrac{1}{5^{2}} = \\dfrac{1}{${v.c1den}}$`,
          decision:
            "Deal with the minus first, then the size. One over $5^{2}$, and $5^{2} = 25$, so the answer is $\\dfrac{1}{25}$. It is a small positive number, not a negative one.",
          earns: ["A1"],
        },
        {
          n: 2,
          working: `(b) $2^{-3} \\times 2^{5} = 2^{-3+5} = 2^{${v.c2pow}} = ${v.c2val}$`,
          decision:
            "Same base multiplied, so add the indices — and $-3$ is added as it stands, minus sign and all. $-3 + 5 = 2$. Dropping the minus gives $2^{8} = 256$, which is the most common wrong answer here.",
          whyMenu: {
            options: [
              "Because multiplying the same base adds the indices, and $-3$ is added as a negative number",
              "Because the indices multiply, giving $2^{-15}$",
              "Because the minus is ignored once the numbers are added",
            ],
            correct: 0,
            explain:
              "The law does not change when an index goes negative. $2^{-3}$ is $\\dfrac{1}{8}$ and $\\dfrac{1}{8} \\times 32 = 4$, which checks the answer.",
          },
          earns: ["A1"],
        },
        {
          n: 3,
          working: `(c) $\\left(\\dfrac{2}{3}\\right)^{-2} = \\left(\\dfrac{3}{2}\\right)^{2}$`,
          decision:
            "A negative index on a fraction turns the fraction upside down, because one over $\\dfrac{2}{3}$ is $\\dfrac{3}{2}$. Do the flip first and the power becomes ordinary.",
          earns: ["A1"],
        },
        {
          n: 4,
          working: `$\\left(\\dfrac{3}{2}\\right)^{2} = \\dfrac{${v.c3num}}{${v.c3den}}$`,
          decision:
            "Square the top and the bottom separately. Leave it as an improper fraction in its lowest terms unless the question asks for something else; on a non-calculator paper an exact fraction is what the accuracy mark is for.",
          earns: ["A1"],
        },
      ],
      finalAnswer: "(a) $\\dfrac{1}{25}$  (b) $4$  (c) $\\dfrac{9}{4}$",
      twin: {
        stem: "Work out $\\left(\\dfrac{5}{2}\\right)^{-2}$. Give your answer as a fraction in its lowest terms.",
        answer: num(v.twin3, { forms: ["fraction"], simplified: true }),
      },
      faded: [
        { showSteps: 3, studentSupplies: [4] },
        { showSteps: 1, studentSupplies: [2, 3, 4] },
      ],
      verification: `ver.${WE("03")}`,
      version: 1,
    },

    {
      id: WE("04"),
      topic: TOPIC,
      specRefs: SR,
      paper: P1,
      stem: "(a) Solve $2^{x} = \\dfrac{1}{8}$.\n(b) $5^{n} \\times 5^{-7} = 5^{3}$. Work out the value of $n$.\n(c) Solve $10^{t} = 0.001$.",
      steps: [
        {
          n: 1,
          working: "(a) $\\dfrac{1}{8} = \\dfrac{1}{2^{3}} = 2^{-3}$",
          decision:
            "The unknown is the index, so the only useful move is to write both sides as powers of the same base. Eight is $2^{3}$, so one eighth is $2^{-3}$. This line is the method mark.",
          earns: ["M1"],
        },
        {
          n: 2,
          working: `$2^{x} = 2^{-3}$, so $x = ${v.d1}$`,
          decision:
            "Equal bases force equal indices — there is no other power of 2 that gives one eighth. Read the index straight off. The answer is negative because the value is less than 1.",
          earns: ["A1"],
        },
        {
          n: 3,
          working: `(b) $5^{n} \\times 5^{-7} = 5^{n-7}$, so $n - 7 = 3$ and $n = ${v.d2}$`,
          decision:
            "Add the indices first, keeping the minus: $n + (-7) = n - 7$. Now the bases match, so the indices match, and it is a one-step equation. Add 7 to both sides.",
          earns: ["M1", "A1"],
        },
        {
          n: 4,
          working: `(c) $0.001 = \\dfrac{1}{1000} = \\dfrac{1}{10^{3}} = 10^{-3}$, so $t = ${v.d3}$`,
          decision:
            "A decimal hides the power, so turn it into a fraction and then into a power of 10. Three decimal places means index $-3$; that link is worth memorising because standard form uses it constantly.",
          earns: ["A1"],
        },
      ],
      finalAnswer: "(a) $x = -3$  (b) $n = 10$  (c) $t = -3$",
      twin: {
        stem: "Solve $3^{x} = \\dfrac{1}{81}$.",
        answer: num(v.twin4, { forms: ["decimal"] }),
      },
      faded: [
        { showSteps: 2, studentSupplies: [3, 4] },
        { showSteps: 1, studentSupplies: [2, 3, 4] },
      ],
      verification: `ver.${WE("04")}`,
      version: 1,
    },
  ];
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

const opt = (id, text, correct, feedback, misconception) => ({
  id,
  text,
  correct,
  ...(misconception ? { misconception } : {}),
  feedback,
});

export function diagnostics(v) {
  return [
    {
      id: `dx.${TOPIC}`,
      topic: TOPIC,
      specRefs: SR,
      when: "both",
      items: [
        {
          id: "01",
          stem: "What is the value of $7^{0}$?",
          skill: "Know that any non-zero base to the power zero is 1",
          options: [
            opt("a", "$1$", true, "Every ladder of powers lands on 1 at the zero index, whatever the base."),
            opt("b", "$0$", false, "The index is zero, not the answer. Come down the ladder: $7^{1} = 7$, and one step down divides by 7, giving 1.", "maths.indices.zero-power"),
            opt("c", "$7$", false, "That is $7^{1}$. The zero index means one more division by 7 than that, which lands on 1.", "maths.indices.zero-power"),
            opt("d", "$\\dfrac{1}{7}$", false, "That is $7^{-1}$, one step further down the ladder than you need. Zero first, then negative.", "maths.indices.zero-power"),
          ],
          secondsExpected: 12,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "02",
          stem: "Simplify $5y^{0}$.",
          skill: "See which part of a term the zero index belongs to",
          options: [
            opt("a", "$5$", true, "The index sits on the $y$ alone, so $y^{0} = 1$ and $5 \\times 1 = 5$."),
            opt("b", "$1$", false, "The whole term has been taken to the power zero. Only the letter carries the index; the 5 is untouched.", "maths.indices.zero-power-takes-coefficient"),
            opt("c", "$0$", false, "A zero index never gives zero. $y^{0} = 1$, so the term is $5 \\times 1$.", "maths.indices.zero-power"),
            opt("d", "$5y$", false, "That treats $y^{0}$ as $y$. The zero index removes the letter by turning it into 1.", "maths.indices.zero-power"),
          ],
          secondsExpected: 20,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "03",
          stem: "What is the value of $5^{-2}$?",
          skill: "Read a negative index as a reciprocal, not as a negative number",
          options: [
            opt("a", `$\\dfrac{1}{${v.c1den}}$`, true, "Minus means turn it over: $\\dfrac{1}{5^{2}} = \\dfrac{1}{25}$."),
            opt("b", "$-25$", false, "The minus has moved from the index onto the answer. A negative index makes a small positive number, never a negative one — CCEA reports this every series.", "maths.indices.negative-power-gives-negative", ),
            opt("c", "$\\dfrac{1}{10}$", false, "The base has been multiplied by the index ($5 \\times 2$). The index counts how many 5s are underneath, so it is $5 \\times 5$.", "maths.indices.negative-power-multiplies-base"),
            opt("d", "$25$", false, "The minus sign has been dropped. That is the value of $5^{2}$; $5^{-2}$ is one over it.", "maths.indices.negative-index-sign-dropped"),
          ],
          secondsExpected: 20,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "04",
          stem: "What is the value of $2^{-3} \\times 2^{5}$?",
          skill: "Add indices when the base is the same, keeping a negative index negative",
          options: [
            opt("a", `$${v.c2val}$`, true, "$-3 + 5 = 2$, so $2^{2} = 4$. Check it: $\\dfrac{1}{8} \\times 32 = 4$."),
            opt("b", "$256$", false, "The minus was dropped and $3 + 5 = 8$ used. The index $-3$ is added exactly as it stands.", "maths.indices.negative-index-sign-dropped"),
            opt("c", "$\\dfrac{1}{32768}$", false, "The indices have been multiplied, giving $2^{-15}$. Multiplying the bases means adding the indices.", "maths.indices.multiply-powers-instead-of-add"),
            opt("d", "$\\dfrac{1}{4}$", false, "The indices were combined the wrong way round ($3 - 5$). Keep the order the expression gives: $-3$ then $+5$.", "maths.indices.negative-index-sign-dropped"),
          ],
          secondsExpected: 30,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "05",
          stem: "Simplify $d^{30} \\div d^{10}$.",
          skill: "Subtract indices when dividing powers of the same base",
          options: [
            opt("a", "$d^{20}$", true, "$30 - 10 = 20$. Ten of the thirty $d$s cancel, leaving twenty."),
            opt("b", "$d^{3}$", false, "The indices have been divided. This is the exact answer CCEA singled out as the hardest slip on the Summer 2025 papers: dividing means subtract.", "maths.indices.divide-powers-instead-of-subtract"),
            opt("c", "$d^{40}$", false, "The indices have been added, which is the rule for multiplying. Dividing goes the other way.", "maths.indices.add-powers-when-dividing"),
            opt("d", "$d^{300}$", false, "The indices have been multiplied. That rule belongs to a power of a power, $(d^{30})^{10}$.", "maths.indices.multiply-powers-instead-of-add"),
          ],
          secondsExpected: 25,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "06",
          stem: "Simplify $3x^{2} \\times 4x^{5}$.",
          skill: "Keep the number in front and the index on separate tracks",
          options: [
            opt("a", `$${v.b1coef}x^{${v.b1pow}}$`, true, "$3 \\times 4 = 12$ for the numbers, $2 + 5 = 7$ for the indices."),
            opt("b", "$7x^{7}$", false, "The numbers in front have been added. They are being multiplied, like everything else on that line.", "maths.indices.coefficients-not-combined-normally"),
            opt("c", "$12x^{10}$", false, "The indices have been multiplied. Multiplying the terms means adding the indices.", "maths.indices.multiply-powers-instead-of-add"),
            opt("d", "$12x^{2} \\times x^{5}$", false, "The numbers are right but the expression is not finished. A simplified answer is one term, with one index.", "maths.indices.answer-not-single-term"),
          ],
          secondsExpected: 30,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "07",
          stem: "Simplify $(2a^{3})^{3}$.",
          skill: "Apply an outside power to every part of the bracket",
          options: [
            opt("a", `$${v.b3coef}a^{${v.b3pow}}$`, true, "$2^{3} = 8$ and $a^{3 \\times 3} = a^{9}$. Everything inside gets cubed."),
            opt("b", "$2a^{9}$", false, "The 2 has been left alone. It is inside the bracket, so it is cubed too: $2^{3} = 8$.", "maths.indices.coefficient-not-raised"),
            opt("c", "$6a^{9}$", false, "The 2 has been multiplied by 3 instead of cubed. An index means repeated multiplication of the 2 by itself.", "maths.indices.coefficient-not-raised"),
            opt("d", "$8a^{6}$", false, "The indices have been added. A power of a power multiplies them: three lots of three $a$s is nine.", "maths.indices.power-of-power-added"),
          ],
          secondsExpected: 35,
          confidence: true,
          hypercorrectionQueue: true,
        },
        {
          id: "08",
          stem: "What is the value of $\\left(\\dfrac{2}{3}\\right)^{-2}$?",
          skill: "Take a negative power of a fraction",
          options: [
            opt("a", `$\\dfrac{${v.c3num}}{${v.c3den}}$`, true, "Flip, then square: $\\left(\\dfrac{3}{2}\\right)^{2} = \\dfrac{9}{4}$."),
            opt("b", "$\\dfrac{4}{9}$", false, "The fraction was squared without being turned over. That is the answer to $\\left(\\dfrac{2}{3}\\right)^{2}$.", "maths.indices.fraction-negative-power-mishandled"),
            opt("c", "$\\dfrac{3}{2}$", false, "The flip happened but the power did not. Both steps are needed, and the 2 outside is still waiting.", "maths.indices.fraction-negative-power-mishandled"),
            opt("d", "$-\\dfrac{4}{9}$", false, "The minus has been carried into the answer. A negative index means reciprocal, and the answer stays positive.", "maths.indices.negative-power-gives-negative"),
          ],
          secondsExpected: 40,
          confidence: true,
          hypercorrectionQueue: true,
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

function mkQ(cfg) {
  const totalMarks = cfg.parts.reduce((a, p) => a + p.marks, 0);
  return {
    id: Q(cfg.n),
    topic: TOPIC,
    specRefs: SR,
    paper: cfg.paper ?? P1,
    tier: "H",
    style: cfg.style,
    difficulty: cfg.difficulty,
    ao: cfg.ao,
    commandWords: cfg.commandWords,
    emphasis: cfg.emphasis ?? [],
    context: { setting: cfg.setting, original: true },
    figures: cfg.figures ?? [],
    parts: cfg.parts,
    totalMarks,
    timeAllowanceSec: totalMarks * 90,
    skeleton: cfg.skeleton,
    ...(cfg.methodLock ? { methodLock: cfg.methodLock } : {}),
    examinerSources: cfg.examinerSources,
    solutionProgram: cfg.solutionProgram,
    verification: `ver.${Q(cfg.n)}`,
    version: 1,
  };
}

const PURE = "Pure number work, no context";
const PURE_ALG = "Pure algebra, no context";

export function questions(v) {
  return [
    // --- the one-mark ladder: zero, then negative, then bigger negative -----
    mkQ({
      n: 1,
      style: "practice",
      difficulty: 1,
      ao: ["AO1"],
      commandWords: ["Write down"],
      setting: PURE,
      skeleton: "(main)write-down1",
      examinerSources: [CER.m7p1q17],
      solutionProgram: "9^0 = 1 for any non-zero base",
      parts: [
        {
          id: "main",
          stem: "Write down the value of $9^{0}$.",
          marks: 1,
          answer: num(v.q1),
          scheme: [mp("A1", "A", 1, "1")],
          hints: ["Come down the powers of 9: 81, 9, then one more step.", "Each step down divides by 9.", "$9 \\div 9 = 1$."],
          workedSolution: "$9^{1} = 9$ and each step down the ladder divides by 9, so $9^{0} = 9 \\div 9 = 1$.",
          commonErrors: [
            ce("maths.indices.zero-power", nErr(0), "The index is zero, not the answer. The ladder of powers lands on 1, never on 0.", 0, CER.m7p1q17),
            ce("maths.indices.zero-power", nErr(9), "That is $9^{1}$. The zero index is one division further down, which gives 1.", 0, CER.m7p1q17),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 2,
      style: "practice",
      difficulty: 1,
      ao: ["AO1"],
      commandWords: ["Write down"],
      setting: PURE,
      skeleton: "(main)write-down1",
      examinerSources: [CER.m7p1q17],
      solutionProgram: "4^-1 = 1/4^1 = 1/4 = 0.25",
      parts: [
        {
          id: "main",
          stem: "Write down the value of $4^{-1}$.",
          marks: 1,
          answer: num(v.q2, { forms: ["fraction", "decimal"] }),
          scheme: [mp("A1", "A", 1, "1/4", { accept: ["0.25"] })],
          hints: ["A minus in the index means turn it over.", "$4^{-1} = \\dfrac{1}{4^{1}}$."],
          workedSolution: "$4^{-1} = \\dfrac{1}{4^{1}} = \\dfrac{1}{4}$, which is $0.25$.",
          commonErrors: [
            ce("maths.indices.negative-power-gives-negative", nErr(-4), "The minus has jumped from the index to the answer. A negative index gives a small positive number.", 0, CER.m7p1q17),
            ce("maths.indices.negative-index-sign-dropped", nErr(4), "The minus sign was ignored. That is the value of $4^{1}$.", 0, CER.m7p1q17),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 3,
      style: "practice",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Write down"],
      setting: PURE,
      skeleton: "(main)write-down1",
      examinerSources: [CER.m8p1q8],
      solutionProgram: "3^-2 = 1/3^2 = 1/9",
      parts: [
        {
          id: "main",
          stem: "Write down the value of $3^{-2}$.",
          marks: 1,
          answer: num(v.q3, { forms: ["fraction"], simplified: true }),
          scheme: [mp("A1", "A", 1, "1/9")],
          hints: ["Work out $3^{2}$ first.", "Then put it underneath a 1."],
          workedSolution: "$3^{2} = 9$, so $3^{-2} = \\dfrac{1}{9}$.",
          commonErrors: [
            ce("maths.indices.negative-power-gives-negative", nErr(-9), "A negative index does not make a negative answer. It makes a reciprocal: $\\dfrac{1}{9}$.", 0, CER.m8p1q8),
            ce("maths.indices.negative-power-multiplies-base", nErr(1 / 6), "The base has been multiplied by the index. The index counts the threes: $3 \\times 3 = 9$ underneath.", 0, CER.m8p1q8),
            ce("maths.indices.negative-index-sign-dropped", nErr(9), "That is $3^{2}$. The minus turns it over.", 0, CER.m8p1q8),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 4,
      style: "practice",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Write down"],
      setting: PURE,
      skeleton: "(main)write-down1",
      examinerSources: [CER.m8p1q8],
      solutionProgram: "10^-4 = 1/10^4 = 1/10000 = 0.0001",
      parts: [
        {
          id: "main",
          stem: "Write down the value of $10^{-4}$.",
          marks: 1,
          answer: num(v.q4, { forms: ["fraction", "decimal"] }),
          scheme: [mp("A1", "A", 1, "1/10000", { accept: ["0.0001"] })],
          hints: ["For base 10 the index counts the zeros.", "$10^{4} = 10\\,000$."],
          workedSolution: "$10^{4} = 10\\,000$, so $10^{-4} = \\dfrac{1}{10\\,000} = 0.0001$.",
          commonErrors: [
            ce("maths.indices.negative-power-gives-negative", nErr(-10000), "The minus belongs to the index, not to the answer. CCEA reported exactly this in Summer 2025.", 0, CER.m7p1q17),
            ce("maths.indices.negative-power-multiplies-base", nErr(-40), "The base has been multiplied by the index. Four tens go underneath, not $10 \\times 4$.", 0, CER.m7p1q17),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 5,
      style: "practice",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Work out"],
      emphasis: ["as a fraction"],
      setting: PURE,
      skeleton: "(main)work-out1",
      examinerSources: [CER.m8p1q8],
      solutionProgram: "2^-5 = 1/2^5 = 1/32",
      parts: [
        {
          id: "main",
          stem: "Work out the value of $2^{-5}$.\nGive your answer **as a fraction**.",
          marks: 1,
          answer: num(v.q5, { forms: ["fraction"], simplified: true }),
          scheme: [mp("A1", "A", 1, "1/32")],
          hints: ["Powers of 2: 2, 4, 8, 16, 32.", "$2^{5} = 32$, and the minus turns it over."],
          workedSolution: "$2^{5} = 32$, so $2^{-5} = \\dfrac{1}{32}$.",
          commonErrors: [
            ce("maths.indices.negative-power-gives-negative", nErr(-32), "A negative index is a reciprocal, so the answer is $\\dfrac{1}{32}$ — small and positive.", 0, CER.m8p1q8),
            ce("maths.indices.negative-power-multiplies-base", nErr(1 / 10), "That is $\\dfrac{1}{2 \\times 5}$. The index says how many 2s are multiplied, giving 32.", 0, CER.m8p1q8),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 6,
      style: "practice",
      difficulty: 3,
      ao: ["AO1"],
      commandWords: ["Work out"],
      emphasis: ["in its lowest terms"],
      setting: PURE,
      skeleton: "(main)work-out2",
      examinerSources: [CER.m8p1q8],
      solutionProgram: "(3/4)^-2 = (4/3)^2 = 16/9",
      parts: [
        {
          id: "main",
          stem: "Work out the value of $\\left(\\dfrac{3}{4}\\right)^{-2}$.\nGive your answer as a fraction **in its lowest terms**.",
          marks: 2,
          answer: num(v.q6, { forms: ["fraction", "mixed"], simplified: true }),
          scheme: [
            mp("M1", "M", 1, "(4/3)^2 seen, or 1 ÷ (9/16)"),
            mp("A1", "A", 1, "16/9", { dependsOn: ["M1"], accept: ["1 7/9"] }),
          ],
          hints: [
            "A negative index on a fraction turns the fraction over first.",
            "$\\left(\\dfrac{3}{4}\\right)^{-2} = \\left(\\dfrac{4}{3}\\right)^{2}$.",
            "Square the top and the bottom separately.",
          ],
          workedSolution: "$\\left(\\dfrac{3}{4}\\right)^{-2} = \\left(\\dfrac{4}{3}\\right)^{2} = \\dfrac{16}{9}$.",
          commonErrors: [
            ce("maths.indices.fraction-negative-power-mishandled", nErr(9 / 16), "The fraction was squared without being turned over. The flip comes first, then the power.", 0, CER.m8p1q8),
            ce("maths.indices.fraction-negative-power-mishandled", nErr(4 / 3), "The flip earns the method mark, so that is worth having. The power has not been applied yet: square the $\\dfrac{4}{3}$.", 1, CER.m8p1q8),
            ce("maths.indices.negative-power-gives-negative", nErr(-9 / 16), "Two things went astray: the minus was carried into the answer and the fraction was not turned over.", 0, CER.m8p1q8),
          ],
          requiresWorking: true,
        },
      ],
    }),
    mkQ({
      n: 7,
      style: "practice",
      difficulty: 3,
      ao: ["AO1"],
      commandWords: ["Work out"],
      setting: PURE,
      skeleton: "(main)work-out2",
      examinerSources: [CER.m8p1q8b],
      solutionProgram: "4^-2 * 4^4 = 4^(-2+4) = 4^2 = 16",
      parts: [
        {
          id: "main",
          stem: "Work out the value of $4^{-2} \\times 4^{4}$.",
          marks: 2,
          answer: num(v.q7),
          scheme: [
            mp("M1", "M", 1, "4^(-2+4) or 4^2 seen"),
            mp("A1", "A", 1, "16", { dependsOn: ["M1"] }),
          ],
          hints: ["Same base multiplied, so add the indices.", "Add $-2$ exactly as it stands: $-2 + 4$.", "$4^{2} = 16$."],
          workedSolution: "$4^{-2} \\times 4^{4} = 4^{-2+4} = 4^{2} = 16$.",
          commonErrors: [
            ce("maths.indices.negative-index-sign-dropped", nErr(4096), "The minus was dropped and $2 + 4 = 6$ used. The index $-2$ joins the sum as a negative number.", 0, CER.m8p1q8b),
            ce("maths.indices.multiply-powers-instead-of-add", nErr(1 / 65536), "The indices were multiplied, giving $4^{-8}$. Multiplying the powers means adding the indices.", 0, CER.m8p1q8b),
          ],
          requiresWorking: true,
        },
      ],
    }),

    // --- the three laws on algebraic terms ---------------------------------
    mkQ({
      n: 8,
      style: "practice",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Simplify"],
      emphasis: ["as a single term"],
      setting: PURE_ALG,
      skeleton: "(main)simplify2",
      examinerSources: [CER.m7p1q15],
      solutionProgram: "5*6 = 30; p^(3+4) = p^7; answer 30p^7",
      parts: [
        {
          id: "main",
          stem: "Simplify $5p^{3} \\times 6p^{4}$.\nGive your answer **as a single term**.",
          marks: 2,
          answer: singleTerm(["30p^7", "30p7", "30 p^7", "30p⁷"], ["30"], ["p^7", "p7", "p⁷"], ["x", "+"]),
          scheme: [
            mp("A2", "A", 2, "30p^7", {
              examinerNote: "Allow A1 for either the 30 or the p^7 correct. No mark for an answer left as a product.",
              reject: ["30 × p^7", "30p × p^7"],
            }),
          ],
          hints: [
            "Do the numbers first, then the letters.",
            "$5 \\times 6 = 30$.",
            "$p^{3} \\times p^{4} = p^{3+4}$.",
          ],
          workedSolution: "$5 \\times 6 = 30$ and $p^{3} \\times p^{4} = p^{7}$, so the answer is $30p^{7}$.",
          commonErrors: [
            ce("maths.indices.coefficients-not-combined-normally", tErr("11\\s*p"), "The numbers in front were added. They are being multiplied, like the rest of the line: $5 \\times 6 = 30$.", 1, CER.m7p1q15),
            ce("maths.indices.multiply-powers-instead-of-add", tErr("30\\s*p\\s*\\^?\\s*12"), "The indices were multiplied. Multiplying terms of the same base adds them: $3 + 4 = 7$.", 1, CER.m7p1q15),
            ce("maths.indices.answer-not-single-term", tErr("[x×]"), "A multiplication sign is still in the answer, so the expression has not been simplified. November 2024 examiners reported exactly this.", 0, CER.m7p1q15),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 9,
      style: "practice",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Simplify"],
      setting: PURE_ALG,
      skeleton: "(main)simplify2",
      examinerSources: [CER.m7p2q9],
      solutionProgram: "20/5 = 4; m^(8-4) = m^4; answer 4m^4",
      parts: [
        {
          id: "main",
          stem: "Simplify $20m^{8} \\div 5m^{4}$.",
          marks: 2,
          answer: alg(`${v.q9coef}m^{${v.q9pow}}`, ["m"]),
          scheme: [
            mp("A2", "A", 2, "4m^4", { examinerNote: "Allow A1 for either the 4 or the m^4 correct." }),
          ],
          hints: ["$20 \\div 5$ for the numbers.", "Dividing powers of the same base subtracts the indices.", "$8 - 4 = 4$."],
          workedSolution: "$20 \\div 5 = 4$ and $m^{8} \\div m^{4} = m^{8-4} = m^{4}$, so the answer is $4m^{4}$.",
          commonErrors: [
            ce("maths.indices.divide-powers-instead-of-subtract", aErr("4m^{2}"), "The indices were divided ($8 \\div 4$). Dividing powers means subtracting: $8 - 4 = 4$. This is the slip CCEA named as the hardest on the Summer 2025 papers.", 1, CER.m7p2q9),
            ce("maths.indices.add-powers-when-dividing", aErr("4m^{12}"), "The indices were added, which is the rule for multiplying. Division goes the other way.", 1, CER.m7p2q9),
            ce("maths.indices.coefficients-not-combined-normally", aErr("15m^{4}"), "The numbers in front were subtracted. They divide: $20 \\div 5 = 4$.", 1, CER.m7p2q9),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 10,
      style: "practice",
      difficulty: 3,
      ao: ["AO1"],
      commandWords: ["Simplify"],
      setting: PURE_ALG,
      skeleton: "(main)simplify2",
      examinerSources: [CER.m8p1q11],
      solutionProgram: "3^3 = 27; t^(4*3) = t^12; answer 27t^12",
      parts: [
        {
          id: "main",
          stem: "Simplify $(3t^{4})^{3}$.",
          marks: 2,
          answer: alg(`${v.q10coef}t^{${v.q10pow}}`, ["t"]),
          scheme: [
            mp("A2", "A", 2, "27t^12", { examinerNote: "Allow A1 for either the 27 or the t^12 correct." }),
          ],
          hints: [
            "The power outside the bracket acts on everything inside.",
            "$3^{3} = 27$.",
            "A power of a power multiplies the indices: $4 \\times 3$.",
          ],
          workedSolution: "$3^{3} = 27$ and $(t^{4})^{3} = t^{4 \\times 3} = t^{12}$, so the answer is $27t^{12}$.",
          commonErrors: [
            ce("maths.indices.coefficient-not-raised", aErr("3t^{12}"), "The 3 was left alone. It is inside the bracket, so it is cubed as well: $3^{3} = 27$. The index is right, so A1 is there.", 1, CER.m8p1q11),
            ce("maths.indices.coefficient-not-raised", aErr("9t^{12}"), "The 3 was multiplied by the outside 3 rather than cubed. An index means repeated multiplication: $3 \\times 3 \\times 3$.", 1, CER.m8p1q11),
            ce("maths.indices.power-of-power-added", aErr("27t^{7}"), "The indices were added. A power of a power multiplies them, because there are three lots of $t^{4}$ multiplied together.", 1, CER.m8p1q11),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 11,
      style: "practice",
      difficulty: 3,
      ao: ["AO1"],
      commandWords: ["Complete"],
      setting: PURE_ALG,
      paper: P2,
      skeleton: "(a)complete1|(b)complete1|(c)complete1",
      examinerSources: [CER.m7p2q9],
      solutionProgram: "14-5 = 9; 11-3 = 8; (c^3)^4 = c^12 and 24-12 = 12",
      parts: [
        {
          id: "a",
          stem: "Complete each statement.\n\n(a) $c^{14} \\div c^{5} = c^{\\square}$",
          marks: 1,
          answer: num(v.q11a),
          scheme: [mp("A1", "A", 1, "9")],
          hints: ["Dividing subtracts the indices.", "$14 - 5$."],
          workedSolution: "$c^{14} \\div c^{5} = c^{14-5} = c^{9}$.",
          commonErrors: [
            ce("maths.indices.divide-powers-instead-of-subtract", nErr(2.8), "The indices were divided. Dividing powers of the same base subtracts them.", 0, CER.m7p2q9),
            ce("maths.indices.add-powers-when-dividing", nErr(19), "The indices were added, which is the multiplying rule.", 0, CER.m7p2q9),
          ],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: "(b) $c^{3} \\times c^{\\square} = c^{11}$",
          marks: 1,
          answer: num(v.q11b),
          scheme: [mp("A1", "A", 1, "8")],
          hints: ["Multiplying adds the indices, so $3 + \\square = 11$.", "Take 3 from 11."],
          workedSolution: "$3 + \\square = 11$, so the missing index is $8$.",
          commonErrors: [
            ce("maths.indices.multiply-powers-instead-of-add", nErr(11 / 3), "The indices were treated as multiplying. Multiplying the terms adds the indices, so this is an addition to undo.", 0, CER.m7p2q9),
          ],
          requiresWorking: false,
        },
        {
          id: "c",
          stem: "(c) $\\dfrac{c^{24}}{(c^{3})^{4}} = c^{\\square}$",
          marks: 1,
          answer: num(v.q11c),
          scheme: [mp("A1", "A", 1, "12", { examinerNote: "Award for 12 however the c^12 on the bottom was obtained." })],
          hints: [
            "Deal with the bottom first: $(c^{3})^{4}$.",
            "A power of a power multiplies the indices, so the bottom is $c^{12}$.",
            "Then subtract: $24 - 12$.",
          ],
          workedSolution: "$(c^{3})^{4} = c^{12}$, so $\\dfrac{c^{24}}{c^{12}} = c^{24-12} = c^{12}$.",
          commonErrors: [
            ce("maths.indices.divide-powers-instead-of-subtract", nErr(2), "The bottom was found correctly but then $24 \\div 12$ was used. Dividing powers subtracts the indices.", 0, CER.m7p2q9),
            ce("maths.indices.power-of-power-added", nErr(17), "The bottom was taken as $c^{7}$, adding $3 + 4$. A power of a power multiplies: $3 \\times 4 = 12$.", 0, CER.m7p2q9),
          ],
          requiresWorking: false,
        },
      ],
    }),

    // --- powers as the unknown ---------------------------------------------
    mkQ({
      n: 12,
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Solve"],
      setting: PURE,
      skeleton: "(main)solve2",
      examinerSources: [CER.m7p1q11],
      solutionProgram: "1/8 = 2^-3; 2^x = 2^-3 so x = -3",
      parts: [
        {
          id: "main",
          stem: "Solve $2^{x} = \\dfrac{1}{8}$.",
          marks: 2,
          answer: num(v.q12),
          scheme: [
            mp("M1", "M", 1, "1/8 written as 2^-3, or 8 = 2^3 seen"),
            mp("A1", "A", 1, "x = -3", { dependsOn: ["M1"] }),
          ],
          hints: [
            "Write the right-hand side as a power of 2.",
            "$8 = 2^{3}$, so $\\dfrac{1}{8} = 2^{-3}$.",
            "Equal bases mean equal indices.",
          ],
          workedSolution: "$\\dfrac{1}{8} = \\dfrac{1}{2^{3}} = 2^{-3}$, so $2^{x} = 2^{-3}$ and $x = -3$.",
          commonErrors: [
            ce("maths.indices.negative-index-sign-dropped", nErr(3), "The 8 was matched but the reciprocal was not. $\\dfrac{1}{8}$ is $2^{-3}$, so the index is negative. The method mark is still there.", 1, CER.m7p1q11),
            ce("maths.indices.equation-base-not-matched", nErr(-8), "The 8 has been read straight off instead of being written as a power of 2. Matching the bases is the whole method.", 0, CER.m7p1q11),
          ],
          requiresWorking: true,
        },
      ],
    }),
    mkQ({
      n: 13,
      style: "practice",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Work out"],
      setting: PURE,
      skeleton: "(main)work-out2",
      examinerSources: [CER.m7p1q11],
      solutionProgram: "a + (-5) = 2 so a = 7",
      parts: [
        {
          id: "main",
          stem: "$7^{a} \\times 7^{-5} = 7^{2}$\n\nWork out the value of $a$.",
          marks: 2,
          answer: num(v.q13),
          scheme: [
            mp("M1", "M", 1, "a - 5 = 2"),
            mp("A1", "A", 1, "a = 7", { dependsOn: ["M1"] }),
          ],
          hints: ["Multiplying the same base adds the indices.", "$a + (-5) = a - 5$.", "Solve $a - 5 = 2$."],
          workedSolution: "$7^{a} \\times 7^{-5} = 7^{a-5}$, so $a - 5 = 2$ and $a = 7$.",
          commonErrors: [
            ce("maths.indices.negative-index-sign-dropped", nErr(-3), "The equation was solved as $a + 5 = 2$. The index $-5$ is added as it stands, which takes 5 away.", 1, CER.m7p1q11),
            ce("maths.indices.multiply-powers-instead-of-add", nErr(-0.4), "The indices were multiplied. Multiplying powers of the same base adds them.", 0, CER.m7p1q11),
          ],
          requiresWorking: true,
        },
      ],
    }),

    // --- exam-style ---------------------------------------------------------
    mkQ({
      n: 14,
      style: "exam-style",
      difficulty: 2,
      ao: ["AO1"],
      commandWords: ["Write down"],
      setting: PURE,
      skeleton: "(a)write-down1|(b)write-down1|(c)write-down1|(d)write-down1",
      examinerSources: [CER.m7p1q17, CER.m8p1q8],
      solutionProgram: "8^0 = 1; 6^-1 = 1/6; 10^-2 = 1/100; 3m^0 + m^0 = 3*1 + 1 = 4",
      parts: [
        {
          id: "a",
          stem: "Write down the value of\n\n(a) $8^{0}$",
          marks: 1,
          answer: num(v.q14a),
          scheme: [mp("A1", "A", 1, "1")],
          hints: ["Any non-zero base to the power zero.", "The ladder lands on 1."],
          workedSolution: "$8^{0} = 1$.",
          commonErrors: [
            ce("maths.indices.zero-power", nErr(0), "The zero is the index, not the answer.", 0, CER.m7p1q17),
            ce("maths.indices.zero-power", nErr(8), "That is $8^{1}$.", 0, CER.m7p1q17),
          ],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: "(b) $6^{-1}$",
          marks: 1,
          answer: num(v.q14b, { forms: ["fraction"], simplified: true }),
          scheme: [mp("A1", "A", 1, "1/6")],
          hints: ["Index $-1$ means the reciprocal.", "One over 6."],
          workedSolution: "$6^{-1} = \\dfrac{1}{6}$.",
          commonErrors: [
            ce("maths.indices.negative-power-gives-negative", nErr(-6), "The minus moved onto the answer. It belongs to the index and makes a reciprocal.", 0, CER.m7p1q17),
          ],
          requiresWorking: false,
        },
        {
          id: "c",
          stem: "(c) $10^{-2}$",
          marks: 1,
          answer: num(v.q14c, { forms: ["fraction", "decimal"] }),
          scheme: [mp("A1", "A", 1, "1/100", { accept: ["0.01"] })],
          hints: ["$10^{2} = 100$.", "Then turn it over."],
          workedSolution: "$10^{-2} = \\dfrac{1}{10^{2}} = \\dfrac{1}{100} = 0.01$.",
          commonErrors: [
            ce("maths.indices.negative-power-gives-negative", nErr(-100), "A negative index never produces a negative answer. Summer 2025 examiners saw this on the matching part of the paper.", 0, CER.m7p1q17),
            ce("maths.indices.negative-power-multiplies-base", nErr(-20), "The base was multiplied by the index. Two tens go underneath.", 0, CER.m7p1q17),
          ],
          requiresWorking: false,
        },
        {
          id: "d",
          stem: "(d) $3m^{0} + m^{0}$",
          marks: 1,
          answer: num(v.q14d),
          scheme: [mp("A1", "A", 1, "4", { examinerNote: "The answer is a number; an answer containing m scores nothing." })],
          hints: ["$m^{0} = 1$, whatever $m$ is.", "So the expression is $3 \\times 1 + 1$."],
          workedSolution: "$m^{0} = 1$, so $3m^{0} = 3$ and $m^{0} = 1$. The total is $3 + 1 = 4$.",
          commonErrors: [
            ce("maths.indices.zero-power-takes-coefficient", nErr(2), "The 3 was taken to the power zero as well. The index sits on the $m$ only, so $3m^{0} = 3$.", 0, CER.m7p1q17),
            ce("maths.indices.answer-not-single-term", tErr("m"), "A letter has survived into a numerical answer — the fault Summer 2025 examiners singled out. Once $m^{0} = 1$ is used, no $m$ can remain.", 0, CER.m7p1q17),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 15,
      style: "exam-style",
      difficulty: 3,
      ao: ["AO1", "AO2"],
      commandWords: ["Complete", "Hence", "Write down", "Show that"],
      setting: "A table of powers of 2 continued past the zero index",
      figures: [
        {
          kind: "svg",
          src: powersOfTwoTableDataUri(),
          alt: "A two-row table. The top row reads 2 to the power 4, 2 cubed, 2 squared, 2 to the power 1, 2 to the power 0, 2 to the power negative 1, 2 to the power negative 2. The bottom row gives 16, 8, 4, 2 and then three blank cells. Curved arrows under the bottom row are labelled divide by 2.",
        },
      ],
      skeleton: "(a)complete3|(b)write-down1|(c)show-that2",
      examinerSources: [CER.m8p1q8, CER.m7p1q17],
      solutionProgram: "2^0 = 1; 2^-1 = 1/2; 2^-2 = 1/4; 2^-5 = 1/32; 2^-3 * 2^5 = 2^2 = 4",
      parts: [
        {
          id: "a",
          stem: "The table shows powers of 2. Each step to the right divides the value by 2.\n\nComplete the table.",
          marks: 3,
          answer: {
            kind: "table",
            cells: [
              { row: 1, col: 4, value: v.q15a0, tolerance: { type: "exact" } },
              { row: 1, col: 5, value: v.q15a1, tolerance: { type: "exact" } },
              { row: 1, col: 6, value: v.q15a2, tolerance: { type: "exact" } },
            ],
          },
          scheme: [
            mp("A1a", "A", 1, "1 for 2^0"),
            mp("A1b", "A", 1, "1/2 or 0.5 for 2^-1"),
            mp("A1c", "A", 1, "1/4 or 0.25 for 2^-2"),
          ],
          hints: ["Keep dividing by 2 as you move right.", "$2 \\div 2 = 1$.", "$1 \\div 2 = \\dfrac{1}{2}$, then halve again."],
          workedSolution: "$2^{0} = 2 \\div 2 = 1$; $2^{-1} = 1 \\div 2 = \\dfrac{1}{2}$; $2^{-2} = \\dfrac{1}{2} \\div 2 = \\dfrac{1}{4}$.",
          commonErrors: [
            ce("maths.indices.zero-power", nErr(0), "The first blank is $2^{0}$. Halving the 2 before it gives 1, not 0.", 0, CER.m8p1q8),
            ce("maths.indices.negative-power-gives-negative", nErr(-2), "The values keep shrinking towards zero but never go below it. Halving 1 gives $\\dfrac{1}{2}$.", 0, CER.m8p1q8),
          ],
          requiresWorking: false,
        },
        {
          id: "b",
          stem: "Hence write down the value of $2^{-5}$.",
          marks: 1,
          answer: num(v.q15b, { forms: ["fraction", "decimal"] }),
          scheme: [mp("A1", "A", 1, "1/32", { accept: ["0.03125"] })],
          hints: ["Carry the table on: $\\dfrac{1}{8}$, then $\\dfrac{1}{16}$.", "$2^{-5} = \\dfrac{1}{2^{5}}$."],
          workedSolution: "Continuing the halving gives $\\dfrac{1}{8}$, $\\dfrac{1}{16}$, $\\dfrac{1}{32}$, so $2^{-5} = \\dfrac{1}{32}$.",
          commonErrors: [
            ce("maths.indices.negative-power-gives-negative", nErr(-32), "The table shows every value staying positive. The answer is $\\dfrac{1}{32}$.", 0, CER.m8p1q8),
          ],
          requiresWorking: false,
          followThrough: { fromPart: "a", rule: "use-candidate-value" },
        },
        {
          id: "c",
          stem: "Show that $2^{-3} \\times 2^{5} = 4$.",
          marks: 2,
          answer: {
            kind: "steps",
            expectedOrder: ["2^(-3+5)", "2^2", "4"],
            allowSkips: false,
          },
          scheme: [
            mp("M1", "M", 1, "2^(-3+5) or 2^2 seen"),
            mp("A1", "A", 1, "reaches 4 with the index step shown", { dependsOn: ["M1"] }),
          ],
          hints: [
            "Same base multiplied, so add the indices.",
            "Add the $-3$ as a negative number: $-3 + 5 = 2$.",
            "Then use the table: $2^{2} = 4$.",
          ],
          workedSolution: "$2^{-3} \\times 2^{5} = 2^{-3+5} = 2^{2} = 4$. Checking with the table: $\\dfrac{1}{8} \\times 32 = 4$.",
          commonErrors: [
            ce("maths.indices.negative-index-sign-dropped", nErr(256), "The minus was dropped and $3 + 5 = 8$ used. In a show-that question the printed answer tells you the index must come to 2.", 0, CER.m7p1q17),
            ce("maths.indices.multiply-powers-instead-of-add", nErr(1 / 32768), "The indices were multiplied. Multiplying the powers adds the indices.", 0, CER.m7p1q17),
          ],
          requiresWorking: true,
        },
      ],
    }),
    mkQ({
      n: 16,
      style: "exam-style",
      difficulty: 3,
      ao: ["AO1", "AO3"],
      commandWords: ["Work out", "Write down"],
      emphasis: ["as a single term"],
      setting: "A rectangle and a square with algebraic side lengths",
      figures: [
        {
          kind: "svg",
          src: rectangleAreaDataUri(),
          alt: "A rectangle with its width labelled four a squared centimetres and its area written inside as twelve a to the power seven square centimetres. The length along the bottom is labelled length and is not given. A note says the diagram is not drawn accurately.",
        },
      ],
      skeleton: "(a)work-out2|(b)write-down2",
      examinerSources: [CER.m7p2q9, CER.m8p1q11],
      solutionProgram: "length = 12a^7 / 4a^2 = 3a^5; area of square = (2a^3)^2 = 4a^6",
      parts: [
        {
          id: "a",
          stem: "The diagram shows a rectangle.\nIts width is $4a^{2}$ cm and its area is $12a^{7}$ cm².\n\nWork out an expression for the length of the rectangle.",
          marks: 2,
          answer: alg(`${v.q16acoef}a^{${v.q16apow}}`, ["a"]),
          scheme: [
            mp("M1", "M", 1, "12a^7 ÷ 4a^2 seen"),
            mp("A1", "A", 1, "3a^5", { dependsOn: ["M1"] }),
          ],
          hints: ["Length is area divided by width.", "$12 \\div 4$ for the numbers.", "Dividing subtracts the indices: $7 - 2$."],
          workedSolution: "Length $= \\dfrac{12a^{7}}{4a^{2}} = 3a^{7-2} = 3a^{5}$ cm.",
          commonErrors: [
            ce("maths.indices.divide-powers-instead-of-subtract", aErr("3a^{3.5}"), "The indices were divided. Dividing powers of the same base subtracts them: $7 - 2 = 5$.", 1, CER.m7p2q9),
            ce("maths.indices.add-powers-when-dividing", aErr("3a^{9}"), "The indices were added. The division line means subtract.", 1, CER.m7p2q9),
            ce("maths.indices.coefficients-not-combined-normally", aErr("8a^{5}"), "The numbers were subtracted. They divide: $12 \\div 4 = 3$. The index is right, so a mark is there.", 1, CER.m7p2q9),
          ],
          requiresWorking: true,
        },
        {
          id: "b",
          stem: "A square has sides of length $2a^{3}$ cm.\n\nWrite down an expression for the area of the square.\nGive your answer **as a single term**.",
          marks: 2,
          answer: singleTerm(["4a^6", "4a6", "4 a^6", "4a⁶"], ["4"], ["a^6", "a6", "a⁶"], ["x", "+"]),
          scheme: [
            mp("A2", "A", 2, "4a^6", { examinerNote: "Allow A1 for either the 4 or the a^6 correct." }),
          ],
          hints: ["Area of a square is side times side.", "$(2a^{3})^{2}$ squares the 2 as well.", "$2^{2} = 4$ and $a^{3 \\times 2} = a^{6}$."],
          workedSolution: "Area $= (2a^{3})^{2} = 2^{2} \\times a^{3 \\times 2} = 4a^{6}$ cm².",
          commonErrors: [
            ce("maths.indices.coefficient-not-raised", tErr("2\\s*a\\s*\\^?\\s*6"), "The 2 was left alone. Both factors of the square include it, so it is squared: $2 \\times 2 = 4$.", 1, CER.m8p1q11),
            ce("maths.indices.power-of-power-added", tErr("4\\s*a\\s*\\^?\\s*5"), "The indices were added. Squaring $a^{3}$ multiplies them: $3 \\times 2 = 6$.", 1, CER.m8p1q11),
            ce("maths.indices.answer-not-single-term", tErr("[x×]"), "A multiplication sign is still there. The area should be written as one term with one index.", 0, CER.m7p2q10),
          ],
          requiresWorking: false,
        },
      ],
    }),
    mkQ({
      n: 17,
      style: "exam-style",
      difficulty: 4,
      ao: ["AO2", "AO3"],
      commandWords: ["Find"],
      emphasis: ["You must show your working"],
      setting: "Two statements in standard form with unknown powers of 10",
      skeleton: "(main)find4",
      methodLock: {
        instruction: "Form two equations in $a$ and $b$ from the indices and solve them together. A pair of numbers found by trial does not show the method.",
        requiredMethod: "match the powers of 10 on each side to give a + b = 9 and a - b = -3, then solve simultaneously",
        evidence: CER.m7p1q11,
      },
      examinerSources: [CER.m7p1q11],
      solutionProgram: "product: 4*2 = 8 and 10^(a+b) = 10^9 so a+b = 9; quotient: 4/2 = 2 and 10^(a-b) = 10^-3 so a-b = -3; adding: 2a = 6, a = 3, b = 6",
      parts: [
        {
          id: "main",
          stem: "$(4 \\times 10^{a}) \\times (2 \\times 10^{b}) = 8 \\times 10^{9}$\n$(4 \\times 10^{a}) \\div (2 \\times 10^{b}) = 2 \\times 10^{-3}$\n\nFind the values of $a$ and $b$.\n**You must show your working.**",
          marks: 4,
          answer: {
            kind: "table",
            cells: [
              { row: 0, col: 0, value: v.q17a, tolerance: { type: "exact" } },
              { row: 0, col: 1, value: v.q17b, tolerance: { type: "exact" } },
            ],
          },
          scheme: [
            mp("MA1", "MA", 1, "a + b = 9"),
            mp("MA2", "MA", 1, "a - b = -3 oe"),
            mp("A1", "A", 1, "a = 3", { dependsOn: ["MA1", "MA2"] }),
            mp("A2", "A", 1, "b = 6", { dependsOn: ["MA1", "MA2"] }),
          ],
          hints: [
            "The numbers in front already match, so the powers of 10 must match too.",
            "Multiplying adds the indices: $a + b = 9$.",
            "Dividing subtracts them: $a - b = -3$.",
            "Add the two equations to remove $b$.",
          ],
          workedSolution:
            "Multiplying: $4 \\times 2 = 8$ and $10^{a} \\times 10^{b} = 10^{a+b}$, so $a + b = 9$.\nDividing: $4 \\div 2 = 2$ and $10^{a} \\div 10^{b} = 10^{a-b}$, so $a - b = -3$.\nAdding the two equations gives $2a = 6$, so $a = 3$ and then $b = 6$.",
          commonErrors: [
            ce("maths.indices.unknown-powers-swapped", tErr("a\\s*=\\s*6"), "Both numbers are right but they are the wrong way round. The division gives $a - b = -3$, so $a$ is the smaller one. Read the two equations back before writing the answer line.", 2, CER.m7p1q11),
            ce("maths.indices.add-powers-when-dividing", tErr("a\\s*-\\s*b\\s*=\\s*3"), "The division was taken as $b - a$. The first bracket is on top, so the index on the bottom is subtracted from it.", 1, CER.m7p1q11),
            ce("maths.indices.equation-base-not-matched", tErr("(?:trial|guess)"), "Two numbers that fit can be spotted, but the question asks for working. Write the two equations from the indices — that is where the first two marks live.", 0, CER.m7p1q11),
          ],
          requiresWorking: true,
        },
      ],
    }),
  ];
}

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

export function findTheMistake() {
  return [
    {
      id: FTM("01"),
      topic: TOPIC,
      specRefs: SR,
      stem: "Sinéad was asked to write down the value of $2^{-3}$. Her working:",
      studentWorking: [
        "2^-3 means 2 x 2 x 2, with the minus kept for the answer",
        "2 x 2 x 2 = 8",
        "2^-3 = -8",
      ],
      mistakeLine: 1,
      misconception: "maths.indices.negative-power-gives-negative",
      whatWentWrong:
        "The minus sign has been moved out of the index and onto the answer. A minus in the index is an instruction to take the reciprocal, so it acts on the whole power: $2^{-3} = \\dfrac{1}{2^{3}}$. The arithmetic on line 2 is fine; it is line 1 that decided the wrong thing.",
      correction: ["2^-3 = 1 / 2^3", "2^3 = 8", "2^-3 = 1/8"],
      marksEarnedAsWritten: [],
      feedback:
        "This was one of the answers CCEA reported from Summer 2025, and it is worth fixing with a picture rather than a rule. On the ladder of powers of 2 — 8, 4, 2, 1 — every step down halves, so the values after $2^{0}$ are $\\dfrac{1}{2}$, $\\dfrac{1}{4}$, $\\dfrac{1}{8}$. They shrink towards zero and never pass it, so a negative answer cannot be right.",
      source: CER.m7p1q17,
    },
    {
      id: FTM("02"),
      topic: TOPIC,
      specRefs: SR,
      stem: "Ruairí was filling in the blank: $d^{30} \\div d^{10} = d^{\\square}$. His working:",
      studentWorking: ["The terms are being divided, so divide the indices", "30 ÷ 10 = 3", "d^30 ÷ d^10 = d^3"],
      mistakeLine: 1,
      misconception: "maths.indices.divide-powers-instead-of-subtract",
      whatWentWrong:
        "The word divide was applied to the indices as well as to the terms. Dividing powers of the same base **subtracts** the indices, because ten of the thirty $d$s cancel with the ten underneath. The arithmetic that follows is correct, but it is answering a different question.",
      correction: ["Dividing powers of the same base subtracts the indices", "30 - 10 = 20", "d^30 ÷ d^10 = d^20"],
      marksEarnedAsWritten: [],
      feedback:
        "This was the hardest part of the Summer 2025 fill-in-the-blanks question, and $d^{3}$ was the answer examiners saw most. A quick check kills it: try small numbers. $d^{6} \\div d^{2}$ is $\\dfrac{d \\times d \\times d \\times d \\times d \\times d}{d \\times d}$, which leaves four $d$s — and $6 \\div 2 = 3$ would have said three.",
      source: CER.m7p2q9,
    },
    {
      id: FTM("03"),
      topic: TOPIC,
      specRefs: SR,
      stem: "Méabh was asked to simplify $(2a^{3})^{3}$. Her working:",
      studentWorking: ["The 3 outside goes onto the a", "(a^3)^3 = a^9", "(2a^3)^3 = 2a^9"],
      mistakeLine: 1,
      misconception: "maths.indices.coefficient-not-raised",
      whatWentWrong:
        "The power outside a bracket acts on everything inside it, and the 2 is inside. Writing the bracket out shows it: $(2a^{3})^{3} = 2a^{3} \\times 2a^{3} \\times 2a^{3}$, which has three 2s to multiply as well as the $a$s. So the 2 becomes $2^{3} = 8$.",
      correction: ["Everything inside the bracket is cubed, the 2 included", "2^3 = 8 and (a^3)^3 = a^9", "(2a^3)^3 = 8a^9"],
      marksEarnedAsWritten: ["A1"],
      feedback:
        "The index work is right, so in the exam this keeps one of the two marks — these are marked A2, with one mark allowed when part of the answer is correct. To finish it, say the bracket out loud as a multiplication before you start, and the untouched 2 becomes impossible to miss.",
      source: CER.m8p1q11,
    },
  ];
}

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const prompt = (n, kind, p, answer, keyWords, difficultyPrior) => ({
  id: RP(n),
  topic: TOPIC,
  specRefs: SR,
  examUnit: "M7",
  kind,
  prompt: p,
  answer,
  keyWords,
  difficultyPrior,
});

export function prompts() {
  return [
    prompt(
      "01",
      "formula",
      "Write the three index laws.",
      "$a^{m} \\times a^{n} = a^{m+n}$ (multiply: add). $a^{m} \\div a^{n} = a^{m-n}$ (divide: subtract). $(a^{m})^{n} = a^{mn}$ (power of a power: multiply).",
      ["add", "subtract", "multiply"],
      4,
    ),
    prompt(
      "02",
      "definition",
      "Why is $a^{0} = 1$?",
      "Each step down a ladder of powers divides by $a$. The step below $a^{1} = a$ is $a \\div a = 1$, and that step is $a^{0}$. It holds for every base except 0.",
      ["divide by a", "step below", "1"],
      4,
    ),
    prompt(
      "03",
      "formula",
      "What does $a^{-n}$ mean, and what sign is the answer?",
      "$a^{-n} = \\dfrac{1}{a^{n}}$ — the reciprocal. The answer is positive and smaller than 1 when $a > 1$; the minus never reaches the answer.",
      ["reciprocal", "one over", "positive"],
      5,
    ),
    prompt(
      "04",
      "procedure",
      "You are simplifying $3x^{2} \\times 4x^{5}$. What happens to the 3 and the 4?",
      "They are ordinary numbers and they multiply: $3 \\times 4 = 12$. The index law touches only the letters, giving $x^{7}$, so the answer is $12x^{7}$.",
      ["multiply", "only the letters", "12"],
      4,
    ),
    prompt(
      "05",
      "trap",
      "$d^{30} \\div d^{10}$ — what do most candidates write, and what is right?",
      "Most write $d^{3}$, dividing the indices. Dividing powers of the same base subtracts them, so it is $d^{20}$.",
      ["subtract", "d^20", "not d^3"],
      6,
    ),
    prompt(
      "06",
      "procedure",
      "$\\left(\\dfrac{a}{b}\\right)^{-n}$ — what is the first move, and what comes after it?",
      "Turn the fraction upside down first: $\\left(\\dfrac{b}{a}\\right)^{n}$. Then apply the power to the top and the bottom separately. Both steps are needed.",
      ["turn it over", "then the power", "top and bottom"],
      6,
    ),
    prompt(
      "07",
      "procedure",
      "How do you solve $2^{x} = \\dfrac{1}{8}$?",
      "Write both sides as powers of the same base: $\\dfrac{1}{8} = \\dfrac{1}{2^{3}} = 2^{-3}$. Equal bases force equal indices, so $x = -3$.",
      ["same base", "2^-3", "equal indices"],
      6,
    ),
    prompt(
      "08",
      "qa",
      "Simplify $5y^{0}$.",
      "$5$. The zero index sits on the $y$ only, so $y^{0} = 1$ and the term is $5 \\times 1$.",
      ["5", "index on the y only"],
      5,
    ),
    prompt(
      "09",
      "trap",
      "Before an index answer goes on the answer line, what three things do you check?",
      "One term, not a product — no multiplication sign left in. The index written as an index, not as a digit beside the letter. No letter at all if the question asked for a value.",
      ["one term", "written as a power", "no letter in a number"],
      5,
    ),
    prompt(
      "10",
      "novel-example",
      "Write $10^{-3}$ as a fraction and as a decimal, and say what the 3 counts.",
      "$\\dfrac{1}{1000}$ and $0.001$. The 3 counts the tens underneath, which is also the number of decimal places.",
      ["1/1000", "0.001", "three tens underneath"],
      4,
    ),
  ];
}

// ---------------------------------------------------------------------------
// Practice sets
// ---------------------------------------------------------------------------

export function sets() {
  return [
    {
      id: `set.${TOPIC}.warm-up`,
      topic: TOPIC,
      kind: "interleaved",
      title: "Zero and negative powers warm-up",
      subject: "maths",
      units: ["M7"],
      itemIds: [`dx.${TOPIC}`, RP("02"), Q(1), Q(2), Q(3), Q(4), RP("03"), Q(5)],
      showTopicLabels: false,
      version: 1,
    },
    {
      id: `set.${TOPIC}.mixed`,
      topic: TOPIC,
      kind: "mixed",
      title: "Fractions, letters and powers you have to find",
      subject: "maths",
      units: ["M7"],
      itemIds: [Q(6), Q(7), FTM("01"), Q(8), Q(9), FTM("02"), Q(10), Q(11), FTM("03"), Q(12), Q(13), Q(17), RP("09")],
      showTopicLabels: false,
      version: 1,
    },
  ];
}

export { WE, Q, FTM };
