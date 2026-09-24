/** Topic row, note frontmatter, worked examples and diagnostics for maths.m7.changing-the-subject-harder-formulae. */

export const TOPIC = "maths.m7.changing-the-subject-harder-formulae";
export const SPEC = ["M7-NA-07"];
export const SOURCES = [
  "ccea-cer:maths:2025-summer:M72:Q13",
  "ccea-cer:maths:2025-summer:M82:Q6",
  "ccea-cer:maths:2024-november:M71:Q17",
  "ccea-cer:maths:2024-november:M81:Q9",
  "ccea-cer:maths:2023-summer:M72:Q10",
];

const SHEET = "Formula sheet printed on page 2 of the paper";
const CALC = "Scientific calculator (must be used)";
export const M7P1 = { unit: "M7", paper: 1, calculator: false, resources: [SHEET] };
export const M7P2 = { unit: "M7", paper: 2, calculator: true, resources: [SHEET, CALC] };
export const M8P1 = { unit: "M8", paper: 1, calculator: false, resources: [SHEET] };
export const M8P2 = { unit: "M8", paper: 2, calculator: true, resources: [SHEET, CALC] };

const NOT_ON_SPEC = [
  "Rearranging a formula that needs the quadratic formula, for example making r the subject of A = 2πr² + 2πrh — M7-NA-07 covers a power OR the subject in more than one term, and no paper read sets both at once in a way that produces a quadratic in the subject",
  "Changing the subject of a formula containing a logarithm, an exponential or a trigonometric function — A level",
  "Functions and inverse functions, f⁻¹(x) — not on this specification, although the reverse-the-operations chain here is exactly the idea it becomes",
  "Proving that a rearrangement is valid for every value, or stating the values the letters may not take (division by zero) — beyond GCSE, though it is worth noticing that the bracket you divide by must not be zero",
];

const HOW_EXAMINED =
  "M7 and M8 are each two 75-minute papers of 50 marks: Paper 1 non-calculator, Paper 2 calculator. Changing the subject is set in nearly every series and in both units — in summer 2025 the identical formula appeared as M7 Paper 2 Q13 and as M8 Paper 2 Q6. It is almost always a single part with no context: the formula is printed on its own line and the answer line already reads 'Answer x =', which tells you the examiner wants the letter isolated. Two marks is the standard tariff for one or two clean steps (November 2024 M8 Paper 1 Q9, summer 2023 M7 Paper 2 Q10(b), summer 2026 M7 Paper 1 Q11 and M8 Paper 1 Q2, November 2023 M7 Paper 2 Q15). Three marks is the tariff whenever the subject appears twice or a power has to be undone (summer 2025 M7 Paper 2 Q13 and M8 Paper 2 Q6, summer 2022 M7 Paper 1 Q14 and M8 Paper 1 Q8). Position is late: question 13 to 17 of an M7 paper, and anywhere from question 2 to question 9 of M8, where the paper starts harder. Schemes run one MA1 per rearrangement line — collected line, factorised line, finished subject — or MA1 then A1 on a two-mark part, so a part-finished script still scores.";

export const topic = {
  id: TOPIC,
  slug: "changing-the-subject-harder-formulae",
  title: "Changing the subject with powers, roots, or the subject appearing twice",
  subject: "maths",
  unit: "M7",
  tier: "H",
  strand: "NA",
  statementIds: SPEC,
  prerequisites: [
    "maths.m6.changing-the-subject-of-a-simple-formula",
    "maths.m2.expanding-and-factorising-with-a-single-term",
  ],
  order: 117,
  hardness: "H",
  difficulty: 4,
  examinerFlagged: true,
  examinerSources: SOURCES,
  examWeightHint: HOW_EXAMINED,
  mustMemorise: [
    "Do the same thing to the whole of both sides — the equals sign is a level beam",
    "Undo the operations in reverse order: the last thing done to the subject is the first thing off",
    "Subject in two terms: collect, factorise, divide by the whole bracket",
    "Clear a denominator first, multiplying every term on both sides",
    "Isolate the power completely, then root the whole side; write ± unless the context rules the negative out",
    "A = πr² gives r = √(A/π), and V = ⅓πr²h gives r = √(3V/πh)",
  ],
  onFormulaSheet: [],
  notOnThisSpec: NOT_ON_SPEC,
  externalRefs: [
    { kind: "corbettmaths", videos: [8] },
    {
      kind: "youtube",
      videoId: "MKMSa-X6Rgw",
      channel: "corbettmaths",
      credit: "Corbettmaths, 'Changing the Subject Advanced' (video 8)",
    },
    {
      kind: "ccea-doc",
      docType: "cer",
      url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
      asOf: "2026-09-13",
    },
  ],
  keywords: [
    "change the subject",
    "rearrange",
    "subject appears twice",
    "factorise out",
    "powers and roots",
    "make x the subject",
    "inverse operations",
    "clear the denominator",
  ],
};

export const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "Changing the subject with powers, roots, or the subject appearing twice",
  subject: "maths",
  unit: "M7",
  tier: "H",
  specRefs: SPEC,
  calculator: "P1-no/P2-yes",
  formulaSheet: {
    given: [],
    mustKnow: [
      "Whatever you do, do it to the whole of both sides",
      "Undo operations in reverse order — last on, first off",
      "Subject in two terms: collect, factorise, divide by the bracket",
      "Multiply every term on both sides by the denominator before anything else",
      "Isolate the power first, then root the whole side; ± unless the context rules the negative out",
      "A = πr² so r = √(A/π); the sheet gives the cone and sphere formulae but never the rearranging",
    ],
  },
  notOnThisSpec: NOT_ON_SPEC,
  hardness: "H",
  examinerFlagged: true,
  externalRefs: topic.externalRefs,
  sheet: {
    mustBeAbleTo: [
      "Say which letter is the subject, and what 'make x the subject' is asking you to produce",
      "Undo a chain of operations in reverse order, one operation per line of working",
      "Isolate a squared subject completely before rooting, and put the root over the whole of the other side",
      "Undo a square root by squaring both sides, again over the whole side",
      "Decide when a rearranged square needs ± and when the context (a length, a radius, a time, a speed) allows one value, and write the reason",
      "Collect every term containing the subject on one side, factorise the subject out, and divide by the whole bracket",
      "Clear a denominator by multiplying every term on both sides, including when the subject is inside that denominator",
      "Rearrange the two formulae the Teacher Guidance names: A = πr² and P = 100(s − c)/c",
      "Check a rearrangement by substituting easy numbers back into the original formula",
    ],
    howExamined: HOW_EXAMINED,
    traps: [
      "Leaving the subject on both sides: over a third of the M8 entry never gathered the terms together, which is what the first mark is for (summer 2025 M8 Paper 2 Q6)",
      "Collecting the terms and then stopping, because the subject was never factorised out of them (summer 2025 M7 Paper 2 Q13)",
      "Taking the square root before the squared term has been isolated, so the division is trapped under the root (November 2024 M7 Paper 1 Q17)",
      "Drawing the root over the numerator only instead of over the whole side (November 2024 M7 Paper 1 Q17)",
      "Failing the plainest step of all — over a fifth could not divide both sides by a single letter (November 2024 M8 Paper 1 Q9)",
      "Skipping the intermediate line, when a mark was available for that line by itself (summer 2023 M7 Paper 2 Q10)",
      "Dividing by one term of the bracket instead of by the whole bracket, or cancelling a term that is not a factor",
      "Multiplying only some of the terms when clearing a denominator",
      "Losing a sign when a term crosses the equals sign, which the substitution check would catch in thirty seconds",
      "Giving one value where ± was needed, or keeping a negative radius because the reason was never thought about",
    ],
  },
  verification: `ver.note.${TOPIC}`,
  version: 1,
  updated: "2026-09-13",
};

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

export const workedExamples = [
  {
    id: `we.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: SPEC,
    paper: M7P1,
    stem: "The volume of a cone is $V = \\dfrac{1}{3}\\pi r^2 h$, where $r$ is the radius of the base and $h$ is the height.\n\nMake $r$ the subject of the formula.",
    steps: [
      {
        n: 1,
        working: "$3V = \\pi r^2 h$",
        decision:
          "The $\\tfrac{1}{3}$ is a division, and it is the outermost thing in the formula, so it comes off first: multiply the whole of both sides by 3. Clearing the fraction now keeps every line after it free of fractions, which is where sign slips usually come from.",
        whyMenu: {
          options: [
            "Because the division by 3 is the outermost operation, so it is undone first",
            "Because 3 is the smallest number in the formula",
            "Because you always deal with numbers before letters",
          ],
          correct: 0,
          explain:
            "Size has nothing to do with it. You are undoing a chain, and the chain is undone from the outside in. The $\\tfrac{1}{3}$ is wrapped around everything, so it is the first wrapper off.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$\\dfrac{3V}{\\pi h} = r^2$",
        decision:
          "What is left of the right-hand side is $r^2$ multiplied by $\\pi$ and by $h$, so divide both sides by $\\pi h$ in a single step. Notice what is now alone: $r^2$, not $r$. That is deliberate — the power always comes off last.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$r = \\sqrt{\\dfrac{3V}{\\pi h}}$",
        decision:
          "Only now does the square root go on, and it goes over the whole of the other side, fraction and all. A radius cannot be negative, so the negative root is dropped — and that reason is written down rather than assumed.",
        whyMenu: {
          options: [
            "Because the root undoes the square, and it must cover everything the square was applied to",
            "Because roots are always written over fractions",
            "Because the numerator is the only part that was squared",
          ],
          correct: 0,
          explain:
            "$r^2$ equals the whole fraction, so the root has to act on the whole fraction. Rooting the numerator only gives $\\dfrac{\\sqrt{3V}}{\\pi h}$, which is a different number — this is exactly the slip the November 2024 report describes.",
        },
        earns: ["MA1"],
      },
      {
        n: 4,
        working:
          "Check with $V = 96\\pi$ and $h = 8$: $r = \\sqrt{\\dfrac{288\\pi}{8\\pi}} = \\sqrt{36} = 6$, and $\\dfrac{1}{3}\\pi(6^2)(8) = 96\\pi$",
        decision:
          "Two lines of arithmetic turn a hopeful answer into a checked one. Pick values that cancel, work the subject out from your rearrangement, then put everything back into the original formula. The two sides agree, so the rearrangement is sound.",
      },
    ],
    finalAnswer: "$r = \\sqrt{\\dfrac{3V}{\\pi h}}$, taking the positive root because $r$ is a radius",
    twin: {
      stem: "Kinetic energy is $E = \\dfrac{1}{2}mv^2$, where $v$ is a speed.\n\nMake $v$ the subject of the formula.",
      answer: {
        kind: "algebraic",
        latex: "v=\\sqrt{\\frac{2E}{m}}",
        equivalence: "equivalent",
        variables: ["v", "E", "m"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TOPIC}.01`,
    version: 1,
  },
  {
    id: `we.${TOPIC}.02`,
    topic: TOPIC,
    specRefs: SPEC,
    paper: M7P2,
    stem: "$8x - 3w = wx + 12$\n\nMake $x$ the subject of the formula.",
    steps: [
      {
        n: 1,
        working: "$8x - wx = 12 + 3w$",
        decision:
          "$x$ appears on both sides, so nothing can be divided yet. The first move is always the same: every term containing $x$ to one side, everything else to the other. The $wx$ crosses and becomes $-wx$; the $-3w$ crosses and becomes $+3w$. This single line is worth a mark on its own, and it is the line a third of the summer 2025 entry never wrote.",
        whyMenu: {
          options: [
            "Because dividing by $x$ now would leave another $x$ behind",
            "Because the left-hand side must always be the longer one",
            "Because $w$ is smaller than 8",
          ],
          correct: 0,
          explain:
            "Dividing by $x$ turns $wx$ into $w$ but turns $12$ into $\\dfrac{12}{x}$, so the subject is still there. Only when both $x$ terms are side by side can the $x$ be pulled out.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$x(8 - w) = 12 + 3w$",
        decision:
          "Factorise. Each term on the left gives up its $x$, leaving $8$ and $-w$ inside the bracket, so the subject now appears exactly once in the whole formula. Multiply the bracket back out in your head to check nothing changed.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$x = \\dfrac{12 + 3w}{8 - w}$",
        decision:
          "Divide both sides by the whole bracket $(8 - w)$, not by 8 and not by $-w$. The bracket goes underneath in one piece and the subject is alone.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working:
          "Check with $w = 2$: $x = \\dfrac{12 + 6}{8 - 2} = 3$, and $8(3) - 3(2) = 18$ while $2(3) + 12 = 18$",
        decision:
          "Both sides of the original formula come to 18, so the rearrangement holds. If they had disagreed you would have caught a sign slip with three marks still in play.",
      },
    ],
    finalAnswer: "$x = \\dfrac{12 + 3w}{8 - w}$",
    twin: {
      stem: "$5y + 2c = cy + 14$\n\nMake $y$ the subject of the formula.",
      answer: {
        kind: "algebraic",
        latex: "y=\\frac{14-2c}{5-c}",
        equivalence: "equivalent",
        variables: ["y", "c"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TOPIC}.02`,
    version: 1,
  },
  {
    id: `we.${TOPIC}.03`,
    topic: TOPIC,
    specRefs: SPEC,
    paper: M8P1,
    stem: "$k = \\dfrac{2n}{n + 5}$\n\nMake $n$ the subject of the formula.",
    steps: [
      {
        n: 1,
        working: "$k(n + 5) = 2n$, so $kn + 5k = 2n$",
        decision:
          "The subject is inside the denominator, so it cannot move until the fraction is gone. Multiply both sides by $(n+5)$ and expand. Do not be put off that this looks like it has made things worse: it has turned an impossible shape into a familiar one, with $n$ in two terms.",
        whyMenu: {
          options: [
            "Because nothing can be collected while $n$ is trapped underneath a fraction",
            "Because brackets are always expanded first",
            "Because $k$ is the subject at the moment",
          ],
          correct: 0,
          explain:
            "A denominator is a division wrapped around the whole numerator. Undo it first and every remaining step is ordinary collecting and factorising.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$5k = 2n - kn$, so $5k = n(2 - k)$",
        decision:
          "Now it is the standard case. Collect the two $n$ terms on one side, everything else on the other, then factorise $n$ out. Writing both of these on one line is fine as long as both are visible — the CCEA scheme credits the factorised form.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$n = \\dfrac{5k}{2 - k}$",
        decision:
          "Divide by the whole bracket. The subject is alone on the left and appears nowhere on the right, which is the test for being finished.",
        earns: ["A1"],
      },
      {
        n: 4,
        working:
          "Check with $k = 1.5$: $n = \\dfrac{7.5}{0.5} = 15$, and $\\dfrac{2 \\times 15}{15 + 5} = \\dfrac{30}{20} = 1.5$",
        decision:
          "The value of $k$ you started with comes back out, so the rearrangement is right. Choosing $k = 1.5$ rather than a whole number was deliberate: it makes an accidental sign flip show up loudly.",
      },
    ],
    finalAnswer: "$n = \\dfrac{5k}{2 - k}$",
    twin: {
      stem: "$g = \\dfrac{3t}{t - 4}$\n\nMake $t$ the subject of the formula.",
      answer: {
        kind: "algebraic",
        latex: "t=\\frac{4g}{g-3}",
        equivalence: "equivalent",
        variables: ["t", "g"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TOPIC}.03`,
    version: 1,
  },
  {
    id: `we.${TOPIC}.04`,
    topic: TOPIC,
    specRefs: SPEC,
    paper: M8P2,
    stem: "$T = \\dfrac{3x^2}{x^2 + 4}$\n\nMake $x$ the subject of the formula.",
    steps: [
      {
        n: 1,
        working: "$T(x^2 + 4) = 3x^2$, so $Tx^2 + 4T = 3x^2$",
        decision:
          "This is the hardest shape the specification allows: the subject appears twice and it is squared. Treat $x^2$ as the thing you are making the subject and the whole question becomes the familiar one. Clear the denominator first, as always.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$4T = 3x^2 - Tx^2$",
        decision:
          "Collect the two $x^2$ terms on one side and the rest on the other. Putting them on the right keeps the coefficient positive, which saves a sign at the end — a small choice, but it is where marks leak.",
        whyMenu: {
          options: [
            "Because both terms contain $x^2$, so they are the ones that must end up together",
            "Because $4T$ is the only term with a number in it",
            "Because the right-hand side is shorter",
          ],
          correct: 0,
          explain:
            "The rule does not change when the subject is squared: every term containing the thing you want goes to one side. Here that thing is $x^2$.",
        },
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$4T = x^2(3 - T)$, so $x^2 = \\dfrac{4T}{3 - T}$",
        decision:
          "Factorise $x^2$ out and divide by the whole bracket. The squared subject is now alone, which is the condition for rooting.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$x = \\pm\\sqrt{\\dfrac{4T}{3 - T}}$",
        decision:
          "Root the whole side. Nothing in the formula says $x$ is a length, so both values survive and the $\\pm$ has to be written. Check with $T = 2$: $x^2 = \\dfrac{8}{1} = 8$, and putting $x^2 = 8$ back gives $\\dfrac{3 \\times 8}{8 + 4} = 2$.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$x^2 = \\dfrac{4T}{3 - T}$, so $x = \\pm\\sqrt{\\dfrac{4T}{3 - T}}$",
    twin: {
      stem: "$W = \\dfrac{5y^2}{y^2 - 2}$, where $y$ is a positive length.\n\nMake $y$ the subject of the formula.",
      answer: {
        kind: "algebraic",
        latex: "y=\\sqrt{\\frac{2W}{W-5}}",
        equivalence: "equivalent",
        variables: ["y", "W"],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4] },
      { showSteps: 1, studentSupplies: [2, 3, 4] },
    ],
    verification: `ver.we.${TOPIC}.04`,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

const dx = (id, stem, skill, secondsExpected, options) => ({
  id,
  stem,
  skill,
  options,
  secondsExpected,
  confidence: true,
  hypercorrectionQueue: true,
});

const opt = (id, text, correct, feedback, misconception) =>
  misconception ? { id, text, correct, misconception, feedback } : { id, text, correct, feedback };

export const diagnostics = [
  {
    id: `dx.${TOPIC}`,
    topic: TOPIC,
    specRefs: SPEC,
    when: "both",
    items: [
      dx(
        "01",
        "In $y = \\dfrac{x}{4} + 9$, which operation do you undo first to make $x$ the subject?",
        "Undo operations in reverse order",
        20,
        [
          opt("a", "Subtract 9 from both sides", true, "The $+9$ was the last thing done to $x$, so it is the first thing off. That leaves $y - 9 = \\dfrac{x}{4}$."),
          opt("b", "Multiply both sides by 4", false, "The divide by 4 is wrapped inside the $+9$, so it has to wait. Multiplying by 4 first gives $4y = x + 36$, which is still true but has not undone the chain in order and usually ends in a lost 36.", "maths.subject.inverse-out-of-order"),
          opt("c", "Divide both sides by 4", false, "That would undo a multiplication, and $x$ is being divided by 4, not multiplied. Read the chain before reaching for an operation.", "maths.subject.inverse-out-of-order"),
          opt("d", "Divide both sides by 9", false, "The 9 is added, not multiplied, so it comes off by subtracting. Undoing an addition with a division is the commonest way a two-mark rearrangement scores nothing.", "maths.subject.inverse-out-of-order"),
        ],
      ),
      dx(
        "02",
        "$a = b^2 - c$. Which is the finished answer when $b$ is made the subject?",
        "Isolate the power, then root the whole side",
        30,
        [
          opt("a", "$b = \\pm\\sqrt{a + c}$", true, "Add $c$ to both sides to get $b^2 = a + c$, then root the whole of that side. Nothing says $b$ is a length, so both values stay."),
          opt("b", "$b = \\sqrt{a} + c$", false, "The root has been shared out over the two terms. $\\sqrt{a+c}$ is not $\\sqrt{a} + \\sqrt{c}$, and it is certainly not $\\sqrt{a} + c$; try $a = 9$, $c = 16$ and the two come to 5 and 7.", "maths.subject.root-applied-termwise"),
          opt("c", "$b = \\sqrt{a} - c$", false, "Rooting happened before the $-c$ was dealt with. Isolate $b^2$ completely first, then root. This is the error the November 2024 M7 report singles out.", "maths.subject.root-before-isolating"),
          opt("d", "$b = \\sqrt{a + c}$", false, "The expression is right and the algebra is sound; only the second value is missing. A squared subject gives two answers, so write $\\pm$ unless the context rules one out.", "maths.subject.plus-minus-omitted"),
        ],
      ),
      dx(
        "03",
        "$m = \\sqrt{n + 7}$. Which makes $n$ the subject?",
        "Undo a square root by squaring both sides",
        25,
        [
          opt("a", "$n = m^2 - 7$", true, "Square both sides to get $m^2 = n + 7$, then subtract 7. Two clean lines, two marks."),
          opt("b", "$n = m^2 + 7$", false, "The squaring is right and the sign is not. The 7 is added to $n$ inside the root, so it comes off by subtracting once the root has gone.", "maths.subject.sign-lost-moving-term"),
          opt("c", "$n = \\dfrac{m}{2} - 7$", false, "Halving is not the opposite of a square root. Squaring is. Halving $\\sqrt{16}$ gives 2, but the number under the root was 16.", "maths.subject.power-undone-by-dividing"),
          opt("d", "$n = \\sqrt{m} - 7$", false, "A second root has been applied instead of a square. The root is already there; your job is to remove it by squaring.", "maths.subject.root-before-isolating"),
        ],
      ),
      dx(
        "04",
        "$5t = ht + 9$, and $t$ is to be the subject. What is the correct first line?",
        "Collect the subject terms on one side",
        25,
        [
          opt("a", "$5t - ht = 9$", true, "Both $t$ terms are now on the same side, which is what the first mark is for. Next: factorise to $t(5-h) = 9$."),
          opt("b", "$5t - 9 = ht$", false, "A term has moved, but the wrong one: $t$ is still on both sides, so there is nothing you can divide by. Move the $ht$, not the 9.", "maths.subject.subject-appears-twice-not-collected"),
          opt("c", "$t = \\dfrac{ht + 9}{5}$", false, "Dividing by 5 while $t$ is still on the right means $t$ has not been made the subject at all. The examiner reads the right-hand side, sees a $t$ and awards nothing.", "maths.subject.subject-appears-twice-not-collected"),
          opt("d", "$5t + ht = 9$", false, "The $ht$ crossed the equals sign but kept its sign. Moving a positive term makes it negative: $5t - ht = 9$.", "maths.subject.sign-lost-moving-term"),
        ],
      ),
      dx(
        "05",
        "You have reached $x(4 - p) = 7$. What finishes the rearrangement?",
        "Divide by the whole bracket",
        20,
        [
          opt("a", "Divide both sides by $(4 - p)$", true, "The bracket is one factor, so it moves underneath in one piece: $x = \\dfrac{7}{4 - p}$."),
          opt("b", "Divide both sides by 4, then by $-p$", false, "The bracket is a single factor, not two separate ones. Dividing by 4 alone does nothing useful, because 4 is added to $-p$ inside the bracket rather than multiplying it.", "maths.subject.divide-by-only-one-term"),
          opt("c", "Expand the bracket to get $4x - px = 7$", false, "That is true, but it undoes the work: you have just put the subject back into two terms. Factorising was the step before the finish, not a detour.", "maths.subject.not-factorised-after-collecting"),
          opt("d", "Subtract 4 from both sides", false, "The 4 is inside a bracket that multiplies $x$, so it cannot be taken off the outside. Only the whole bracket can move, and it moves by division.", "maths.subject.inverse-out-of-order"),
        ],
      ),
      dx(
        "06",
        "Which statement about square roots is true?",
        "A root acts on the whole side, not term by term",
        30,
        [
          opt("a", "$\\sqrt{u + v}$ is not the same as $\\sqrt{u} + \\sqrt{v}$", true, "Correct, and it is worth testing once so you never forget: $\\sqrt{9 + 16} = 5$ while $\\sqrt{9} + \\sqrt{16} = 7$."),
          opt("b", "$\\sqrt{u + v} = \\sqrt{u} + \\sqrt{v}$ for all positive $u$ and $v$", false, "Roots do not share out over a sum. Try $u = 9$ and $v = 16$: one side is 5, the other is 7.", "maths.subject.root-applied-termwise"),
          opt("c", "$\\sqrt{u + v} = \\dfrac{u + v}{2}$", false, "Halving is not rooting. $\\sqrt{16}$ is 4 and half of 16 is 8. The confusion comes from the 2 in the phrase 'square root'.", "maths.subject.power-undone-by-dividing"),
          opt("d", "Rooting both sides of $u = v^2 + 3$ gives $\\sqrt{u} = v + \\sqrt{3}$", false, "Same slip inside a rearrangement. Subtract the 3 first, then root: $v = \\sqrt{u - 3}$.", "maths.subject.root-applied-termwise"),
        ],
      ),
      dx(
        "07",
        "$y = \\dfrac{3w + 1}{5}$, and $w$ is to be the subject. What is the first move?",
        "Clear the denominator before anything else",
        25,
        [
          opt("a", "Multiply both sides by 5", true, "The whole of $3w + 1$ is being divided by 5, so undo that first: $5y = 3w + 1$."),
          opt("b", "Subtract 1 from both sides", false, "The 1 is inside the fraction, so it is not yet available to move. Clear the denominator and it comes within reach on the next line.", "maths.subject.inverse-out-of-order"),
          opt("c", "Multiply the left-hand side by 5 and leave the right alone", false, "That tips the balance. Whatever is done to one side must be done to the whole of the other.", "maths.subject.denominator-not-cleared"),
          opt("d", "Divide both sides by 3", false, "The 3 multiplies $w$ inside the fraction, so it is the last thing to be undone, not the first.", "maths.subject.inverse-out-of-order"),
        ],
      ),
      dx(
        "08",
        "You reach $x^2 = \\dfrac{9k}{4}$ in a question that says 'Work out the values of $x$'. What goes on the answer line?",
        "Decide when a rearranged square needs both values",
        35,
        [
          opt("a", "$x = \\dfrac{3\\sqrt{k}}{2}$ and $x = -\\dfrac{3\\sqrt{k}}{2}$", true, "Values, plural, and nothing here is a length, so both survive. Rooting top and bottom of the fraction gives $\\dfrac{3\\sqrt{k}}{2}$."),
          opt("b", "$x = \\dfrac{3\\sqrt{k}}{2}$", false, "The arithmetic is right; the answer line is short by one value. Drop the negative only when you can write the reason beside it.", "maths.subject.plus-minus-omitted"),
          opt("c", "$x = \\dfrac{9k}{8}$", false, "The square has been undone by halving. Root the numerator and the denominator instead: $\\sqrt{9k} = 3\\sqrt{k}$ and $\\sqrt{4} = 2$.", "maths.subject.power-undone-by-dividing"),
          opt("d", "$x = \\dfrac{3\\sqrt{k}}{4}$", false, "The root reached the numerator but stopped before the denominator. It has to cover the whole of that side, so the 4 becomes 2.", "maths.subject.root-before-isolating"),
        ],
      ),
    ],
  },
];
