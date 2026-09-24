/**
 * Items for maths.m7.standard-form: worked examples, diagnostics, questions,
 * find-the-mistake and retrieval prompts. Every number here is recomputed in gen.mjs.
 */
import { figCompare, figBarModel, figOrderCards, COMPARE_ALT, BARMODEL_ALT, ORDERCARD_ALT } from "./svgs.mjs";

export const TOPIC = "maths.m7.standard-form";
export const SPEC = ["M7-NA-03"];
const SHEET = ["Formula sheet printed on page 2 of the paper"];
const P1_M7 = { unit: "M7", paper: 1, calculator: false, resources: SHEET };
const P2_M7 = { unit: "M7", paper: 2, calculator: true, resources: [...SHEET, "Scientific calculator"] };
const P1_M8 = { unit: "M8", paper: 1, calculator: false, resources: SHEET };

const qid = (n) => `q.${TOPIC}.${String(n).padStart(4, "0")}`;

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

export const workedExamples = [
  {
    id: `we.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: SPEC,
    paper: P1_M7,
    stem: "$P = 6.4 \\times 10^{9}$, $Q = 2.5 \\times 10^{-5}$ and $R = 4 \\times 10^{3}$.\nWork out the value of $\\dfrac{PQ}{R}$.\nGive your answer in standard form.",
    steps: [
      {
        n: 1,
        working: "$PQ = (6.4 \\times 2.5) \\times 10^{9 + (-5)} = 16 \\times 10^{4}$",
        decision: "Split the job in two. Multiply the front numbers, and add the powers because $10^{9} \\times 10^{-5}$ is nine tens joined to five tens taken away, leaving four. Adding a negative power is a subtraction, so the power comes down to 4 rather than up to 14.",
        whyMenu: {
          options: [
            "Because $10^{a} \\times 10^{b} = 10^{a+b}$, and $9 + (-5) = 4$",
            "Because the bigger power always wins",
            "Because $9 \\times (-5) = -45$",
          ],
          correct: 0,
          explain: "The index law is the reason, and it holds whatever the signs are. Multiplying the powers instead of adding them is the commonest slip here, and it puts the answer out by many powers of ten.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$16 \\times 10^{4} = 1.6 \\times 10^{5}$",
        decision: "Re-normalise straight away rather than at the end. The front number 16 is not below 10, so slide its point one place left and put that place back into the power. Doing it now keeps the next division tidy.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$\\dfrac{1.6 \\times 10^{5}}{4 \\times 10^{3}} = (1.6 \\div 4) \\times 10^{5-3} = 0.4 \\times 10^{2}$",
        decision: "The same split, the other way round: divide the front numbers, subtract the powers. $1.6 \\div 4 = 0.4$ needs no calculator once you see it as $16 \\div 4$ with the point put back.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$0.4 \\times 10^{2} = 4 \\times 10^{1}$",
        decision: "Re-normalise again, this time upwards: 0.4 is below 1, so the point slides one place right and the power drops by one. The value is 40 either way, but only $4 \\times 10^{1}$ is in standard form, and the question asked for standard form.",
        whyMenu: {
          options: [
            "Because the front number must be at least 1 and less than 10",
            "Because $0.4 \\times 10^{2}$ is the wrong value",
            "Because a power of 1 is not allowed",
          ],
          correct: 0,
          explain: "$0.4 \\times 10^{2}$ has exactly the right value. It simply is not standard form, and the final mark on these questions is for the form.",
        },
        earns: ["A1"],
      },
    ],
    finalAnswer: "$4 \\times 10^{1}$",
    twin: {
      stem: "$M = 8.1 \\times 10^{7}$, $N = 5 \\times 10^{-3}$ and $K = 1.5 \\times 10^{2}$.\nWork out $\\dfrac{MN}{K}$, giving your answer in standard form.",
      answer: {
        kind: "numeric",
        value: 2700,
        tolerance: { type: "exact" },
        unitRequired: false,
        acceptForms: ["standardForm"],
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
    paper: P1_M7,
    stem: "Work out $(5.4 \\times 10^{-3}) + (8 \\times 10^{-4})$.\nGive your answer in standard form.",
    steps: [
      {
        n: 1,
        working: "$-3$ is the larger power, so aim to write both terms as something $\\times 10^{-3}$.",
        decision: "Adding has no index law behind it, so the first decision is which power both numbers will share. Choosing the larger of the two keeps one number untouched and makes the other smaller, which is easier to write than a front number above 10.",
        whyMenu: {
          options: [
            "Because addition only works when both numbers count the same thing",
            "Because $10^{-3}$ is bigger than $10^{-4}$",
            "Because you always use the first number's power",
          ],
          correct: 0,
          explain: "It is the same reason you cannot add 3 metres to 4 centimetres as they stand. The power of ten is the unit here, and both terms have to be counting in it before the front numbers can be combined.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$8 \\times 10^{-4} = 0.8 \\times 10^{-3}$",
        decision: "Raising the power from $-4$ to $-3$ makes the power of ten ten times bigger, so the front number must become ten times smaller to keep the value the same. The point slides one place left.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$5.4 \\times 10^{-3} + 0.8 \\times 10^{-3} = 6.2 \\times 10^{-3}$",
        decision: "Now the powers match, so add the front numbers and keep the shared power. Check the front number is still between 1 and 10 before writing it on the answer line: 6.2 is, so nothing more is needed.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$6.2 \\times 10^{-3}$",
    twin: {
      stem: "Work out $(9.3 \\times 10^{6}) - (4.5 \\times 10^{5})$, giving your answer in standard form.",
      answer: {
        kind: "numeric",
        value: 8850000,
        tolerance: { type: "exact" },
        unitRequired: false,
        acceptForms: ["standardForm"],
      },
    },
    faded: [
      { showSteps: 1, studentSupplies: [2, 3] },
      { showSteps: 0, studentSupplies: [1, 2, 3] },
    ],
    verification: `ver.we.${TOPIC}.02`,
    version: 1,
  },

  {
    id: `we.${TOPIC}.03`,
    topic: TOPIC,
    specRefs: SPEC,
    paper: P1_M8,
    stem: "A photo library holds $8 \\times 10^{6}$ images.\nOver one year the number of images increases by 25%.\nWork out the new number of images.\nGive your answer in standard form.",
    steps: [
      {
        n: 1,
        working: "25% of $8 \\times 10^{6} = 0.25 \\times 8 \\times 10^{6} = 2 \\times 10^{6}$",
        decision: "The percentage is taken of the whole quantity, front number and power together. Because 25% is a quarter, only the front number needs any arithmetic: a quarter of 8 is 2, and the power of ten is untouched.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$8 \\times 10^{6} + 2 \\times 10^{6} = 10 \\times 10^{6}$",
        decision: "An increase means the amount found is added on. The powers already match, so the front numbers add directly. This is the step examiners report being skipped most often: the percentage gets found and then written on the answer line by itself.",
        whyMenu: {
          options: [
            "Because an increase is the original plus the extra",
            "Because 25% is the answer the question wants",
            "Because the powers have to be added as well",
          ],
          correct: 0,
          explain: "The question asked for the new number, not the size of the change. Reading the last line of the question again before writing the answer catches this every time.",
        },
        earns: ["A1"],
      },
      {
        n: 3,
        working: "$10 \\times 10^{6} = 1 \\times 10^{7}$",
        decision: "The front number has reached 10, which is outside the range, so slide once more. This is the final mark: the question demanded standard form, and $10 \\times 10^{6}$ is the right value written the wrong way.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$1 \\times 10^{7}$ images",
    twin: {
      stem: "A reservoir holds $2.5 \\times 10^{5}$ cubic metres of water. After heavy rain the volume increases by 60%. Work out the new volume, giving your answer in standard form.",
      answer: {
        kind: "numeric",
        value: 400000,
        tolerance: { type: "exact" },
        unit: "cubic metres",
        unitRequired: false,
        acceptForms: ["standardForm"],
      },
    },
    faded: [
      { showSteps: 1, studentSupplies: [2, 3] },
      { showSteps: 0, studentSupplies: [1, 2, 3] },
    ],
    verification: `ver.we.${TOPIC}.03`,
    version: 1,
  },

  {
    id: `we.${TOPIC}.04`,
    topic: TOPIC,
    specRefs: SPEC,
    paper: P2_M7,
    stem: "One grain of a fine sand has mass $1.1 \\times 10^{-2}$ grams.\nA lorry carries $7.5 \\times 10^{3}$ kilograms of the sand.\nWork out how many grains the lorry carries.\nGive your answer in standard form, correct to 3 significant figures.",
    steps: [
      {
        n: 1,
        working: "$7.5 \\times 10^{3}\\text{ kg} = 7.5 \\times 10^{3} \\times 10^{3}\\text{ g} = 7.5 \\times 10^{6}\\text{ g}$",
        decision: "Before any dividing, put both masses in one unit. There are $10^{3}$ grams in a kilogram, so multiplying by $10^{3}$ raises the power by 3. Grams is the better choice here because it leaves the small number alone.",
        whyMenu: {
          options: [
            "Because a power of ten is not a unit, so the two masses are not comparable yet",
            "Because grams are always used in standard form",
            "Because the lorry mass is the larger of the two",
          ],
          correct: 0,
          explain: "Powers of ten only tell you the size of a number, never what it is measuring. Two quantities have to be in the same unit before any comparison or division means anything.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "number of grains $= \\dfrac{7.5 \\times 10^{6}}{1.1 \\times 10^{-2}}$",
        decision: "Total mass divided by the mass of one grain. A quick size check first: the total is huge and each grain is tiny, so the answer must be an enormous number, which rules out any answer with a negative power.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$= 6.818\\,181\\,8\\ldots \\times 10^{8}$",
        decision: "On Paper 2 this goes straight into the calculator using the $\\times 10^{x}$ key. Some displays give $6.818181818 \\times 10^{8}$ and some give 6.818181818E8; they are the same number written two ways.",
        earns: ["A1"],
      },
      {
        n: 4,
        working: "$= 6.82 \\times 10^{8}$ grains",
        decision: "Round the front number to 3 significant figures and leave the power alone, then write the power out in full. An E copied from the display onto the answer line earns nothing, because it is calculator notation rather than mathematics.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "$6.82 \\times 10^{8}$ grains",
    twin: {
      stem: "One droplet of an oil has mass $4.5 \\times 10^{-5}$ grams. A tank holds $2.7 \\times 10^{2}$ kilograms of the oil. Work out how many droplets the tank holds, giving your answer in standard form.",
      answer: {
        kind: "numeric",
        value: 6000000000,
        tolerance: { type: "exact" },
        unitRequired: false,
        acceptForms: ["standardForm"],
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

export const diagnostics = [
  {
    id: `dx.${TOPIC}`,
    topic: TOPIC,
    specRefs: SPEC,
    when: "both",
    items: [
      {
        id: "01",
        stem: "Which of these is written correctly in standard form?",
        skill: "Recognise the range 1 to 10 that the front number must sit in",
        options: [
          { id: "a", text: "$1.24 \\times 10^{4}$", correct: true, feedback: "The front number is between 1 and 10 and the power is a whole number, so this is the only one of the three that counts." },
          { id: "b", text: "$12.4 \\times 10^{3}$", correct: false, misconception: "maths.stdform.mantissa-not-normalised", feedback: "This has the right value, 12 400, but the front number has to be below 10. Slide the point one place left and raise the power: $1.24 \\times 10^{4}$." },
          { id: "c", text: "$0.124 \\times 10^{5}$", correct: false, misconception: "maths.stdform.mantissa-not-normalised", feedback: "Again the value is right but the front number is below 1. Slide the point one place right and drop the power by one: $1.24 \\times 10^{4}$." },
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "02",
        stem: "What is $9 \\times 10^{8}$ as an ordinary number?",
        skill: "Read a positive power of ten as a count of places",
        options: [
          { id: "a", text: "$900\\,000\\,000$", correct: true, feedback: "The 9 moves eight places, giving nine hundred million." },
          { id: "b", text: "$72$", correct: false, misconception: "maths.stdform.power-of-ten-dropped", feedback: "That is $9 \\times 8$. The 8 is not a number to multiply by; it counts how far the digits move. Examiners saw this exact reading in Summer 2025, and every step after it is lost." },
          { id: "c", text: "$90\\,000\\,000$", correct: false, misconception: "maths.stdform.power-of-ten-dropped", feedback: "Eight zeros were written after the 9 instead of eight places moved, which lands one place short. Count places from where the point starts, just after the 9." },
          { id: "d", text: "$0.000\\,000\\,09$", correct: false, misconception: "maths.stdform.decimal-point-wrong-direction", feedback: "A positive power makes a number bigger. A negative power would have been needed for this one." },
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "03",
        stem: "Write $0.000\\,42$ in standard form.",
        skill: "Convert a number below 1 into standard form",
        options: [
          { id: "a", text: "$4.2 \\times 10^{-4}$", correct: true, feedback: "The point slides four places right to sit after the 4, so the power is $-4$." },
          { id: "b", text: "$4.2 \\times 10^{4}$", correct: false, misconception: "maths.stdform.decimal-point-wrong-direction", feedback: "The sign of the power is the one thing that says whether the number is tiny or huge. $4.2 \\times 10^{4}$ is 42 000." },
          { id: "c", text: "$42 \\times 10^{-5}$", correct: false, misconception: "maths.stdform.mantissa-not-normalised", feedback: "The value is right, but 42 is not between 1 and 10. Slide one more place: $4.2 \\times 10^{-4}$." },
          { id: "d", text: "$4.2 \\times 10^{-3}$", correct: false, misconception: "maths.stdform.decimal-point-wrong-direction", feedback: "Three zeros were counted rather than four places. Count the places the point travels, not the zeros it passes." },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "04",
        stem: "Work out $(3 \\times 10^{5}) \\times (4 \\times 10^{-2})$.",
        skill: "Multiply in standard form and re-normalise",
        options: [
          { id: "a", text: "$1.2 \\times 10^{4}$", correct: true, feedback: "$3 \\times 4 = 12$ and $5 + (-2) = 3$, giving $12 \\times 10^{3}$, which re-normalises to $1.2 \\times 10^{4}$." },
          { id: "b", text: "$12 \\times 10^{3}$", correct: false, misconception: "maths.stdform.mantissa-not-normalised", feedback: "Every step was right and the value is right. The front number just has to come below 10, which costs one more slide and one more on the power." },
          { id: "c", text: "$1.2 \\times 10^{-10}$", correct: false, misconception: "maths.stdform.powers-multiplied-not-added", feedback: "The powers were multiplied: $5 \\times (-2) = -10$. Multiplying the numbers means adding the powers, because $10^{5} \\times 10^{-2}$ is five tens with two divided out." },
          { id: "d", text: "$1.2 \\times 10^{8}$", correct: false, misconception: "maths.stdform.negative-power-misread", feedback: "The negative sign was dropped, so $5 + 2$ was used instead of $5 + (-2)$. A negative power pulls the answer down, not up." },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "05",
        stem: "Work out $(5 \\times 10^{4}) + (3 \\times 10^{3})$.",
        skill: "Add two numbers in standard form by matching the powers",
        options: [
          { id: "a", text: "$5.3 \\times 10^{4}$", correct: true, feedback: "$3 \\times 10^{3}$ becomes $0.3 \\times 10^{4}$, and $5 + 0.3 = 5.3$ at the shared power." },
          { id: "b", text: "$8 \\times 10^{7}$", correct: false, misconception: "maths.stdform.powers-combined-when-adding", feedback: "The fronts and the powers were both added. There is no index law for addition: $10^{4} + 10^{3}$ is not $10^{7}$, it is 11 000." },
          { id: "c", text: "$8 \\times 10^{4}$", correct: false, misconception: "maths.stdform.addition-without-calculator", feedback: "The fronts were added as though the powers already matched. Rewrite one number first so that both read $\\times 10^{4}$, then add." },
          { id: "d", text: "$5.3 \\times 10^{3}$", correct: false, misconception: "maths.stdform.addition-without-calculator", feedback: "The front numbers were matched to $10^{4}$ but the smaller power was carried down to the answer. Whichever power you convert to is the power the answer keeps." },
        ],
        secondsExpected: 35,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "06",
        stem: "Which of these is the largest?",
        skill: "Order numbers in standard form by comparing powers first",
        options: [
          { id: "a", text: "$2 \\times 10^{-2}$", correct: true, feedback: "$-2$ is the highest power of the three, so this is the largest at 0.02, even though 2 is the smallest front number." },
          { id: "b", text: "$9 \\times 10^{-4}$", correct: false, misconception: "maths.stdform.ordered-by-mantissa", feedback: "The 9 catches the eye, but the power decides first. $9 \\times 10^{-4}$ is 0.0009, well under 0.02." },
          { id: "c", text: "$6 \\times 10^{-3}$", correct: false, misconception: "maths.stdform.ordered-by-mantissa", feedback: "This is 0.006, which sits between the other two. Compare the powers, and only look at the front numbers when the powers tie." },
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "07",
        stem: "Sample $A$ has mass $3.4 \\times 10^{5}$ grams. Sample $B$ has mass $4 \\times 10^{2}$ kilograms. Which is heavier?",
        skill: "Match the units before comparing two quantities in standard form",
        options: [
          { id: "a", text: "$B$, because it is 400 kg against 340 kg", correct: true, feedback: "Both masses in one unit, then compared. That single conversion line is what the scheme is looking for." },
          { id: "b", text: "$A$, because $10^{5}$ beats $10^{2}$", correct: false, misconception: "maths.stdform.units-not-matched", feedback: "The powers are measuring different things, so they cannot be compared as they stand. In kilograms, $A$ is $3.4 \\times 10^{2}$, and 340 is less than 400." },
          { id: "c", text: "$A$, because 3.4 is nearly as big as 4 and its power is much bigger", correct: false, misconception: "maths.stdform.units-not-matched", feedback: "Convert before you reason about size at all. Examiners in Summer 2024 reported a whole group comparing the printed numbers without converting." },
        ],
        secondsExpected: 35,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "08",
        stem: "A calculator display reads 3.6E-05. The question asks for standard form. What goes on the answer line?",
        skill: "Turn a calculator display into standard form on the answer line",
        options: [
          { id: "a", text: "$3.6 \\times 10^{-5}$", correct: true, feedback: "The E is the calculator's shorthand for times ten to the power. Written out in full, it earns the mark." },
          { id: "b", text: "3.6E-05", correct: false, misconception: "maths.stdform.calculator-display-copied", feedback: "The display has been copied rather than read. E is not mathematical notation, so it earns nothing on an answer line." },
          { id: "c", text: "$0.000\\,036$", correct: false, misconception: "maths.stdform.final-not-in-standard-form", feedback: "This is the right value as an ordinary number, but the question asked for standard form, and the last mark on these questions is for the form." },
          { id: "d", text: "$3.6^{-5}$", correct: false, misconception: "maths.stdform.calculator-display-copied", feedback: "This is a different number altogether, about 0.0017. The power belongs to the ten, never to the front number." },
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

/** Small helper so every question carries the same boilerplate. */
function Q({ n, paper, style, difficulty, ao, commandWords, emphasis, setting, figures = [], parts, skeleton, sources, program }) {
  const totalMarks = parts.reduce((a, p) => a + p.marks, 0);
  return {
    id: qid(n),
    topic: TOPIC,
    specRefs: SPEC,
    tier: "H",
    paper,
    style,
    difficulty,
    ao,
    commandWords,
    emphasis,
    context: { setting, original: true },
    figures,
    parts,
    totalMarks,
    timeAllowanceSec: totalMarks * 90,
    skeleton,
    examinerSources: sources,
    solutionProgram: program,
    verification: `ver.${qid(n)}`,
    version: 1,
  };
}

const SF = (value, extra = {}) => ({
  kind: "numeric",
  value,
  tolerance: { type: "exact" },
  unitRequired: false,
  acceptForms: ["standardForm"],
  ...extra,
});

const DEC = (value, extra = {}) => ({
  kind: "numeric",
  value,
  tolerance: { type: "exact" },
  unitRequired: false,
  acceptForms: ["decimal"],
  ...extra,
});

export const questions = [
  Q({
    n: 1,
    paper: P1_M7,
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Express"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Write $2\\,970\\,000$ in standard form.",
        marks: 1,
        answer: SF(2970000),
        scheme: [{ id: "A1", code: "A", marks: 1, for: "$2.97 \\times 10^{6}$", accept: ["2.97 x 10^6 written with any multiplication sign"] }],
        hints: [
          "Where does the decimal point sit at the moment? Just after the last zero.",
          "Slide it left until only one digit is in front of it, counting the places.",
          "Six places, so the power is 6.",
        ],
        workedSolution: "The point starts after the final zero. Sliding it left to sit between the 2 and the 9 takes six places, so $2\\,970\\,000 = 2.97 \\times 10^{6}$.",
        commonErrors: [
          {
            misconception: "maths.stdform.mantissa-not-normalised",
            pattern: { kind: "text", regex: "29\\.?7\\s*[x×]\\s*10" },
            feedback: "The value is right but the front number must come below 10. One more slide left gives $2.97 \\times 10^{6}$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-november:M81:Q6",
          },
        ],
        requiresWorking: false,
      },
    ],
    skeleton: "(main)write1",
    sources: ["ccea-cer:maths:2024-november:M81:Q6"],
    program: "2970000 = 2.97e6; point slides 6 places left; check 2.97*10^6 = 2970000",
  }),

  Q({
    n: 2,
    paper: P1_M7,
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Express"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Write $0.000\\,405$ in standard form.",
        marks: 1,
        answer: SF(0.000405),
        scheme: [{ id: "A1", code: "A", marks: 1, for: "$4.05 \\times 10^{-4}$" }],
        hints: [
          "The number is below 1, so the power will be negative.",
          "Slide the point right until it sits just after the 4.",
          "Count places, not zeros: there are three zeros but four places.",
        ],
        workedSolution: "Sliding the point right to sit after the 4 takes four places, and sliding right means a negative power, so $0.000\\,405 = 4.05 \\times 10^{-4}$.",
        commonErrors: [
          {
            misconception: "maths.stdform.decimal-point-wrong-direction",
            pattern: { kind: "numeric", value: 40500 },
            feedback: "The size is right but the sign of the power is not. A number below 1 always needs a negative power; $4.05 \\times 10^{4}$ is 40 500.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-november:M81:Q6",
          },
          {
            misconception: "maths.stdform.decimal-point-wrong-direction",
            pattern: { kind: "numeric", value: 0.00405 },
            feedback: "Three zeros were counted instead of four places. The point has to travel past the zeros and past the 4 itself, which is one more place than the zeros suggest.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-november:M81:Q6",
          },
        ],
        requiresWorking: false,
      },
    ],
    skeleton: "(main)write1",
    sources: ["ccea-cer:maths:2024-november:M81:Q6"],
    program: "0.000405 = 4.05e-4; four places right; check 4.05*10^-4 = 0.000405",
  }),

  Q({
    n: 3,
    paper: P1_M7,
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Write down"],
    emphasis: [],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Write $5.06 \\times 10^{-4}$ as an ordinary number.",
        marks: 1,
        answer: DEC(0.000506),
        scheme: [{ id: "A1", code: "A", marks: 1, for: "$0.000\\,506$" }],
        hints: [
          "A negative power slides the point left.",
          "Four places left from just after the 5.",
          "Keep the zero that sits inside the number as well as the ones in front.",
        ],
        workedSolution: "Sliding the point four places left from after the 5 gives $0.000\\,506$. The zero between the 5 and the 6 stays where it is; it is part of the digits, not part of the sliding.",
        commonErrors: [
          {
            misconception: "maths.stdform.negative-power-misread",
            pattern: { kind: "numeric", value: 50600 },
            feedback: "A negative power makes a number smaller, so the answer is below 1. The minus sign is doing the same job as a division by $10^{4}$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-november:M81:Q6",
          },
        ],
        requiresWorking: false,
      },
    ],
    skeleton: "(main)write1",
    sources: ["ccea-cer:maths:2024-november:M81:Q6"],
    program: "5.06e-4 = 0.000506; check 0.000506 * 10^4 = 5.06",
  }),

  Q({
    n: 4,
    paper: P1_M7,
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Express"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Write $84 \\times 10^{5}$ in standard form.",
        marks: 1,
        answer: SF(8400000),
        scheme: [{ id: "A1", code: "A", marks: 1, for: "$8.4 \\times 10^{6}$" }],
        hints: [
          "This is already a number times a power of ten, but it is not standard form yet.",
          "84 has to come below 10.",
          "Sliding the point one place left costs one on the power, so the power goes up by one.",
        ],
        workedSolution: "$84 = 8.4 \\times 10$, so $84 \\times 10^{5} = 8.4 \\times 10 \\times 10^{5} = 8.4 \\times 10^{6}$.",
        commonErrors: [
          {
            misconception: "maths.stdform.mantissa-not-normalised",
            pattern: { kind: "numeric", value: 840000 },
            feedback: "The power was moved the wrong way. Making the front number smaller must make the power bigger, or the value changes.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
        ],
        requiresWorking: false,
      },
    ],
    skeleton: "(main)write1",
    sources: ["ccea-cer:maths:2025-summer:M81:Q7"],
    program: "84e5 = 8.4e6; check 8.4*10^6 = 8400000 = 84*10^5",
  }),

  Q({
    n: 5,
    paper: P1_M7,
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Work out $(3 \\times 10^{5}) \\times (2.5 \\times 10^{-8})$.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(0.0075),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "$3 \\times 2.5 = 7.5$ and $5 + (-8) = -3$ seen, or $7.5 \\times 10^{-3}$ unsimplified" },
          { id: "MA2", code: "MA", marks: 1, for: "$7.5 \\times 10^{-3}$" },
        ],
        hints: [
          "Front numbers together, powers together.",
          "Multiplying means adding the powers, and one of them is negative.",
          "$5 + (-8) = -3$.",
        ],
        workedSolution: "$3 \\times 2.5 = 7.5$ and $10^{5} \\times 10^{-8} = 10^{5 + (-8)} = 10^{-3}$, so the answer is $7.5 \\times 10^{-3}$. The front number is already between 1 and 10, so nothing more is needed.",
        commonErrors: [
          {
            misconception: "maths.stdform.powers-multiplied-not-added",
            pattern: { kind: "numeric", value: 7.5e-40 },
            feedback: "The powers were multiplied rather than added: $5 \\times (-8) = -40$. Multiplying two powers of ten adds their indices, which is the index law $10^{a} \\times 10^{b} = 10^{a+b}$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
          {
            misconception: "maths.stdform.negative-power-misread",
            pattern: { kind: "numeric", value: 7.5e13 },
            feedback: "The minus sign was lost when the powers were added. $5 + (-8)$ is a subtraction, so the power finishes below zero, and the answer is a small number.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2024-november:M81:Q6",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out2",
    sources: ["ccea-cer:maths:2025-november:M81:Q8"],
    program: "3*2.5 = 7.5; 5 + (-8) = -3; answer 7.5e-3 = 0.0075",
  }),

  Q({
    n: 6,
    paper: P1_M7,
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Work out $(7.2 \\times 10^{6}) \\div (9 \\times 10^{-2})$.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(80000000),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "$7.2 \\div 9 = 0.8$ and $6 - (-2) = 8$ seen, or $0.8 \\times 10^{8}$" },
          { id: "MA2", code: "MA", marks: 1, for: "$8 \\times 10^{7}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "Divide the front numbers, subtract the powers.",
          "Subtracting a negative power adds: $6 - (-2) = 8$.",
          "0.8 is below 1, so the answer needs one more slide before it is in standard form.",
        ],
        workedSolution: "$7.2 \\div 9 = 0.8$ and $10^{6} \\div 10^{-2} = 10^{6 - (-2)} = 10^{8}$, giving $0.8 \\times 10^{8}$. Since 0.8 is below 1, slide the point one place right and drop the power by one: $8 \\times 10^{7}$.",
        commonErrors: [
          {
            misconception: "maths.stdform.mantissa-not-normalised",
            pattern: { kind: "text", regex: "0\\.8\\s*[x×]\\s*10" },
            feedback: "The division was done correctly, which is the first mark. The answer mark needs the front number between 1 and 10: slide right once and take one off the power to get $8 \\times 10^{7}$.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
          {
            misconception: "maths.stdform.negative-power-misread",
            pattern: { kind: "numeric", value: 8000 },
            feedback: "The powers were subtracted as $6 - 2$. Taking away a negative power adds it on, so the power is 8 before re-normalising, not 4.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-november:M81:Q6",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out2",
    sources: ["ccea-cer:maths:2025-november:M81:Q8", "ccea-cer:maths:2024-november:M81:Q6"],
    program: "7.2/9 = 0.8; 6 - (-2) = 8; 0.8e8 = 8e7 = 80000000",
  }),

  Q({
    n: 7,
    paper: P1_M7,
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Work out $(6 \\times 10^{-4}) + (3.5 \\times 10^{-3})$.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(0.0041),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "both terms written at one power, e.g. $0.6 \\times 10^{-3} + 3.5 \\times 10^{-3}$, or both written as ordinary numbers" },
          { id: "MA2", code: "MA", marks: 1, for: "$4.1 \\times 10^{-3}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "There is no index law for addition, so the powers have to match first.",
          "Rewrite $6 \\times 10^{-4}$ at the power $-3$.",
          "Raising the power by one slides that front number's point one place left: $0.6 \\times 10^{-3}$.",
        ],
        workedSolution: "$6 \\times 10^{-4} = 0.6 \\times 10^{-3}$, so the sum is $0.6 \\times 10^{-3} + 3.5 \\times 10^{-3} = 4.1 \\times 10^{-3}$. As ordinary numbers this is $0.0006 + 0.0035 = 0.0041$, which is the same thing.",
        commonErrors: [
          {
            misconception: "maths.stdform.powers-combined-when-adding",
            pattern: { kind: "numeric", value: 9.5e-7 },
            feedback: "The front numbers and the powers were both added. Addition has no index law: two numbers can only be added once they are counting in the same power of ten.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
          {
            misconception: "maths.stdform.addition-without-calculator",
            pattern: { kind: "numeric", value: 0.0095 },
            feedback: "The fronts were added as though the powers already matched. Convert one term first, then add: $0.6 + 3.5 = 4.1$ at the power $-3$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out2",
    sources: ["ccea-cer:maths:2025-november:M81:Q8"],
    program: "6e-4 = 0.6e-3; 0.6 + 3.5 = 4.1; answer 4.1e-3 = 0.0041",
  }),

  Q({
    n: 8,
    paper: P1_M7,
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Work out $(5.2 \\times 10^{9}) - (7 \\times 10^{8})$.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(4500000000),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "both terms written at one power, e.g. $5.2 \\times 10^{9} - 0.7 \\times 10^{9}$" },
          { id: "MA2", code: "MA", marks: 1, for: "$4.5 \\times 10^{9}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "Match the powers before subtracting.",
          "Write $7 \\times 10^{8}$ at the power 9.",
          "$7 \\times 10^{8} = 0.7 \\times 10^{9}$.",
        ],
        workedSolution: "$7 \\times 10^{8} = 0.7 \\times 10^{9}$, so the subtraction is $5.2 \\times 10^{9} - 0.7 \\times 10^{9} = 4.5 \\times 10^{9}$. The front number is between 1 and 10, so that is the answer.",
        commonErrors: [
          {
            misconception: "maths.stdform.addition-without-calculator",
            pattern: { kind: "numeric", value: 450000000 },
            feedback: "The front numbers were matched correctly but the answer kept the smaller power. Once $7 \\times 10^{8}$ has been rewritten as $0.7 \\times 10^{9}$, the shared power 9 is the power the answer carries.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out2",
    sources: ["ccea-cer:maths:2025-november:M81:Q8"],
    program: "7e8 = 0.7e9; 5.2 - 0.7 = 4.5; answer 4.5e9 = 4500000000",
  }),

  Q({
    n: 9,
    paper: P1_M7,
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Work out $(2 \\times 10^{5})^{3}$.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(8e15),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "$2^{3} = 8$ and $10^{5 \\times 3} = 10^{15}$ seen" },
          { id: "MA2", code: "MA", marks: 1, for: "$8 \\times 10^{15}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "The cube applies to everything inside the bracket.",
          "Cube the front number, and multiply the power by 3.",
          "$2^{3} = 8$ and $5 \\times 3 = 15$.",
        ],
        workedSolution: "$(2 \\times 10^{5})^{3} = 2^{3} \\times (10^{5})^{3} = 8 \\times 10^{15}$. The power inside a bracket is multiplied by the outside power, not added to itself.",
        commonErrors: [
          {
            misconception: "maths.stdform.power-of-bracket-mishandled",
            pattern: { kind: "numeric", value: 6e8 },
            feedback: "The bracket was treated as a multiplication by 3, giving $2 \\times 3$ and $5 + 3$. A cube means three copies multiplied together, so the front number is cubed and the power is tripled.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
          {
            misconception: "maths.stdform.power-of-ten-dropped",
            pattern: { kind: "numeric", value: 8e5 },
            feedback: "The front number was cubed but the power was left alone. Everything inside the bracket is cubed, the power of ten included.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M71:Q16",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out2",
    sources: ["ccea-cer:maths:2025-november:M81:Q8"],
    program: "2^3 = 8; 5*3 = 15; answer 8e15",
  }),

  Q({
    n: 10,
    paper: P1_M7,
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["List"],
    emphasis: ["you must show your working"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "$A = 4.2 \\times 10^{-3}$\n$B = 0.000\\,52$\n$C = 3.9 \\times 10^{-4}$\nList $A$, $B$ and $C$ in order of size, starting with the smallest.\nYou must show your working.",
        marks: 3,
        answer: {
          kind: "mcq",
          shuffle: true,
          options: [
            { id: "cba", text: "$C$, $B$, $A$", correct: true, feedback: "As ordinary numbers, 0.000 39, 0.000 52 and 0.0042. The conversions are two of the three marks, so write them down even when the order is obvious to you." },
            { id: "cab", text: "$C$, $A$, $B$", correct: false, misconception: "maths.stdform.ordered-by-mantissa", feedback: "The front numbers 3.9, 4.2 and 5.2 were compared. $A$ has a power of $-3$ against the other two at $-4$, so $A$ is about ten times bigger than either of them." },
            { id: "abc", text: "$A$, $B$, $C$", correct: false, misconception: "maths.stdform.ordered-largest-first", feedback: "This is the right order reversed. The question asked you to start with the smallest, and the answer boxes are filled left to right." },
          ],
        },
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "all three written in one common form, either as ordinary numbers or all at the same power of ten" },
          { id: "A1", code: "A", marks: 1, for: "$A = 0.0042$, $B = 0.000\\,52$, $C = 0.000\\,39$ all correct", dependsOn: ["M1"] },
          { id: "A2", code: "A", marks: 1, for: "order given as $C$, $B$, $A$", ft: true, dependsOn: ["M1"] },
        ],
        hints: [
          "Put all three into the same form before comparing anything.",
          "Ordinary numbers are easiest here because one of them is already written that way.",
          "$B$ is $5.2 \\times 10^{-4}$, so $B$ and $C$ share a power and the front numbers decide between them.",
        ],
        workedSolution: "As ordinary numbers, $A = 0.0042$, $B = 0.000\\,52$ and $C = 0.000\\,39$. Comparing them gives $C < B < A$, so the order is $C$, $B$, $A$. In standard form the same working reads $C = 3.9 \\times 10^{-4}$, $B = 5.2 \\times 10^{-4}$, $A = 42 \\times 10^{-4}$.",
        commonErrors: [
          {
            misconception: "maths.presentation.answer-without-working",
            pattern: { kind: "text", regex: "^\\s*C\\s*,?\\s*B\\s*,?\\s*A\\s*$" },
            feedback: "The order is right, but two of the three marks are for the conversions. Writing every number in one form, even briefly, is what the scheme is paid to see.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-november:M71:Q17",
          },
          {
            misconception: "maths.stdform.ordered-by-mantissa",
            pattern: { kind: "text", regex: "^\\s*C\\s*,?\\s*A\\s*,?\\s*B\\s*$" },
            feedback: "The front numbers were compared before the powers. $A$ has the largest power of the three, which makes it the largest number whatever its front number looks like.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M71:Q17",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)list3",
    sources: ["ccea-cer:maths:2025-november:M71:Q17"],
    program: "A = 4.2e-3 = 0.0042; B = 0.00052 = 5.2e-4; C = 3.9e-4 = 0.00039; sorted -> C, B, A",
  }),

  Q({
    n: 11,
    paper: P1_M7,
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Work out"],
    emphasis: ["you must show your working"],
    setting: "Two laboratory samples labelled in different units of mass",
    figures: [{ kind: "svg", src: figCompare(), alt: COMPARE_ALT }],
    parts: [
      {
        id: "main",
        stem: "Sample $X$ has mass $6.4 \\times 10^{5}$ milligrams.\nSample $Y$ has mass $5.9 \\times 10^{2}$ grams.\nWork out which sample is heavier.\nYou must show your working.",
        marks: 2,
        answer: {
          kind: "mcq",
          shuffle: false,
          options: [
            { id: "x", text: "$X$, because it is 640 g against 590 g", correct: true, feedback: "Both masses put into grams first, then compared. That conversion line carries the method mark." },
            { id: "y", text: "$Y$, because $5.9 \\times 10^{2}$ grams is the larger unit", correct: false, misconception: "maths.stdform.units-not-matched", feedback: "The unit being larger does not make the quantity larger. In grams, $X$ is $6.4 \\times 10^{2}$, which is 640 against $Y$'s 590." },
            { id: "z", text: "$X$, because $10^{5}$ is a bigger power than $10^{2}$", correct: false, misconception: "maths.stdform.units-not-matched", feedback: "The choice happens to be right, but the reason is not, and the marks here are for the conversion. Powers attached to different units are not comparable." },
          ],
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "both masses written in one unit, e.g. $6.4 \\times 10^{5}\\text{ mg} = 6.4 \\times 10^{2}\\text{ g}$, or $5.9 \\times 10^{2}\\text{ g} = 5.9 \\times 10^{5}\\text{ mg}$" },
          { id: "A1", code: "A", marks: 1, for: "$X$ chosen, with the two converted masses seen", dependsOn: ["MA1"] },
        ],
        hints: [
          "One label is in milligrams and one is in grams, so nothing can be compared yet.",
          "There are $10^{3}$ milligrams in a gram.",
          "Dividing by $10^{3}$ takes 3 off the power: $6.4 \\times 10^{5}\\text{ mg} = 6.4 \\times 10^{2}\\text{ g}$.",
        ],
        workedSolution: "There are 1000 milligrams in a gram, so $X = 6.4 \\times 10^{5}\\text{ mg} = 6.4 \\times 10^{2}\\text{ g} = 640\\text{ g}$. Sample $Y$ is $5.9 \\times 10^{2}\\text{ g} = 590\\text{ g}$. Since $640 > 590$, sample $X$ is heavier.",
        commonErrors: [
          {
            misconception: "maths.stdform.units-not-matched",
            pattern: { kind: "text", regex: "10\\s*\\^?\\s*5.{0,20}(bigger|larger|greater)" },
            feedback: "The two powers are attached to different units, so comparing them compares nothing. Summer 2024 examiners reported a sizeable group doing exactly this. Convert first, then compare.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M81:Q7",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out2",
    sources: ["ccea-cer:maths:2024-summer:M71:Q15", "ccea-cer:maths:2024-summer:M81:Q7"],
    program: "X = 6.4e5 mg = 6.4e2 g = 640 g; Y = 5.9e2 g = 590 g; 640 > 590 so X",
  }),

  Q({
    n: 12,
    paper: P1_M8,
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "A count of trees in a forestry plantation",
    figures: [{ kind: "svg", src: figBarModel(), alt: BARMODEL_ALT }],
    parts: [
      {
        id: "main",
        stem: "A plantation contains $6 \\times 10^{5}$ trees.\nOver ten years the number of trees increases by 70%.\nWork out the new number of trees.\nGive your answer in standard form.",
        marks: 3,
        answer: SF(1020000),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "70% of $6 \\times 10^{5}$ found, i.e. $4.2 \\times 10^{5}$ or $420\\,000$" },
          { id: "A1", code: "A", marks: 1, for: "added on: $10.2 \\times 10^{5}$ or $1\\,020\\,000$", dependsOn: ["MA1"] },
          { id: "A2", code: "A", marks: 1, for: "$1.02 \\times 10^{6}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "Take the percentage of the whole quantity: front number and power together.",
          "10% is $6 \\times 10^{4}$, so 70% is seven of those.",
          "After adding, check whether the front number is still below 10.",
        ],
        workedSolution: "70% of $6 \\times 10^{5}$ is $0.7 \\times 6 \\times 10^{5} = 4.2 \\times 10^{5}$. Adding it on gives $6 \\times 10^{5} + 4.2 \\times 10^{5} = 10.2 \\times 10^{5}$. The front number 10.2 is not below 10, so slide once more: $1.02 \\times 10^{6}$. The multiplier route reaches the same place: $1.7 \\times 6 \\times 10^{5} = 10.2 \\times 10^{5}$.",
        commonErrors: [
          {
            misconception: "maths.percent.increase-not-added",
            pattern: { kind: "numeric", value: 420000 },
            feedback: "That is the size of the increase, which earns the first mark. The question asked for the new number, so it still has to be added to the original.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M71:Q16",
          },
          {
            misconception: "maths.stdform.final-not-in-standard-form",
            pattern: { kind: "text", regex: "10\\.2\\s*[x×]\\s*10" },
            feedback: "The arithmetic is complete and both of the first two marks are safe. The last mark is for the form: 10.2 is not below 10, so one more slide gives $1.02 \\times 10^{6}$.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out3",
    sources: ["ccea-cer:maths:2025-summer:M71:Q16", "ccea-cer:maths:2025-summer:M81:Q7"],
    program: "0.7*6e5 = 4.2e5; 6e5 + 4.2e5 = 10.2e5 = 1.02e6 = 1020000; check 1.7*6e5 = 1020000",
  }),

  Q({
    n: 13,
    paper: P2_M7,
    style: "practice",
    difficulty: 3,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["in standard form", "to 3 significant figures"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "main",
        stem: "Calculate $(4.7 \\times 10^{8}) \\times (6.3 \\times 10^{-3})$.\nGive your answer in standard form, correct to 3 significant figures.",
        marks: 2,
        answer: {
          kind: "numeric",
          value: 2960000,
          tolerance: { type: "sf", figures: 3 },
          unitRequired: false,
          acceptForms: ["standardForm"],
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "$2.961 \\times 10^{6}$ or $2\\,961\\,000$ seen, or $29.61 \\times 10^{5}$" },
          { id: "A1", code: "A", marks: 1, for: "$2.96 \\times 10^{6}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "Use the $\\times 10^{x}$ key rather than typing the digits and a power.",
          "Round the front number only; the power is not part of the significant figures.",
          "$2.961 \\rightarrow 2.96$ to 3 significant figures.",
        ],
        workedSolution: "$4.7 \\times 6.3 = 29.61$ and $8 + (-3) = 5$, giving $29.61 \\times 10^{5} = 2.961 \\times 10^{6}$. To 3 significant figures that is $2.96 \\times 10^{6}$.",
        commonErrors: [
          {
            misconception: "maths.stdform.calculator-display-copied",
            pattern: { kind: "text", regex: "2\\.96\\s*[Ee]\\s*0?6" },
            feedback: "That is the display rather than the answer. E means times ten to the power, so write it out: $2.96 \\times 10^{6}$.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
          {
            misconception: "maths.stdform.mantissa-not-normalised",
            pattern: { kind: "text", regex: "29\\.6\\d*\\s*[x×]\\s*10" },
            feedback: "The multiplication is right, so the method mark is safe. The front number must come below 10, which moves the power from 5 up to 6.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)calculate2",
    sources: ["ccea-cer:maths:2025-summer:M81:Q7"],
    program: "4.7*6.3 = 29.61; 8 + (-3) = 5; 29.61e5 = 2.961e6; 3 sf -> 2.96e6",
  }),

  Q({
    n: 14,
    paper: P1_M7,
    style: "practice",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Find"],
    emphasis: [],
    setting: "Pure number, no context",
    parts: [
      {
        id: "a",
        stem: "In standard form,\n$(4 \\times 10^{p}) \\times (2 \\times 10^{q}) = 8 \\times 10^{9}$\n$(4 \\times 10^{p}) \\div (2 \\times 10^{q}) = 2 \\times 10^{3}$\nFind the value of $p$.",
        marks: 2,
        answer: DEC(6),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "$p + q = 9$ and $p - q = 3$ both seen" },
          { id: "MA2", code: "MA", marks: 1, for: "$p = 6$", dependsOn: ["MA1"] },
        ],
        hints: [
          "The front numbers already work: $4 \\times 2 = 8$ and $4 \\div 2 = 2$, so they tell you nothing about $p$ and $q$.",
          "Multiplying adds the powers, so $p + q = 9$. Dividing subtracts them, so $p - q = 3$.",
          "Add the two equations to remove $q$.",
        ],
        workedSolution: "Multiplying adds the powers, so $p + q = 9$; dividing subtracts them, so $p - q = 3$. Adding the two equations gives $2p = 12$, so $p = 6$.",
        commonErrors: [
          {
            misconception: "maths.stdform.powers-multiplied-not-added",
            pattern: { kind: "numeric", value: 4.5 },
            feedback: "The powers were treated as being multiplied, giving $pq = 9$. Multiplying two powers of ten adds their indices; it is the front numbers that get multiplied.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: "Find the value of $q$.",
        marks: 1,
        answer: DEC(3),
        scheme: [{ id: "A1", code: "A", marks: 1, for: "$q = 3$", ft: true }],
        hints: [
          "Put your value of $p$ back into either equation.",
          "$6 + q = 9$.",
        ],
        workedSolution: "Substituting $p = 6$ into $p + q = 9$ gives $q = 3$. Checking both lines: $(4 \\times 10^{6}) \\times (2 \\times 10^{3}) = 8 \\times 10^{9}$ and $(4 \\times 10^{6}) \\div (2 \\times 10^{3}) = 2 \\times 10^{3}$.",
        commonErrors: [],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
    skeleton: "(a)find2|(b)find1",
    sources: ["ccea-cer:maths:2025-november:M81:Q8"],
    program: "p + q = 9; p - q = 3; 2p = 12 so p = 6, q = 3; check 4e6*2e3 = 8e9 and 4e6/2e3 = 2e3",
  }),

  // --- exam-style ---------------------------------------------------------

  Q({
    n: 15,
    paper: P1_M7,
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["List"],
    emphasis: ["you must show your working"],
    setting: "Pure number, no context",
    figures: [{ kind: "svg", src: figOrderCards(), alt: ORDERCARD_ALT }],
    parts: [
      {
        id: "main",
        stem: "$A = (6 \\times 10^{-4}) + (3 \\times 10^{2})$\n$B = (6 \\times 10^{-4}) \\times (3 \\times 10^{2})$\n$C = (6 \\times 10^{-4}) \\div (3 \\times 10^{2})$\nList $A$, $B$ and $C$ in order of size, starting with the smallest.\nYou must show your working.",
        marks: 3,
        answer: {
          kind: "mcq",
          shuffle: true,
          options: [
            { id: "cba", text: "$C$, $B$, $A$", correct: true, feedback: "$C = 2 \\times 10^{-6}$, $B = 1.8 \\times 10^{-1}$ and $A$ is a fraction over 300. Two of the three marks are for those values appearing on the page." },
            { id: "bca", text: "$B$, $C$, $A$", correct: false, misconception: "maths.stdform.ordered-by-mantissa", feedback: "$B$ and $C$ were separated by their front numbers, 1.8 against 2. Their powers are $-1$ and $-6$, so $C$ is the smaller by a factor of about a hundred thousand." },
            { id: "cab", text: "$C$, $A$, $B$", correct: false, misconception: "maths.stdform.powers-combined-when-adding", feedback: "$A$ has been undervalued, which usually means the addition was done by combining the powers. Adding $6 \\times 10^{-4}$ to $3 \\times 10^{2}$ barely changes it, so $A$ stays just above 300." },
            { id: "abc", text: "$A$, $B$, $C$", correct: false, misconception: "maths.stdform.ordered-largest-first", feedback: "This is the right order reversed. The question asked you to start with the smallest." },
          ],
        },
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "a correct method for at least two of the three, e.g. powers added for $B$ and subtracted for $C$" },
          { id: "A1", code: "A", marks: 1, for: "$A = 300.0006$, $B = 1.8 \\times 10^{-1}$ and $C = 2 \\times 10^{-6}$ all correct (any equivalent form)", dependsOn: ["M1"] },
          { id: "A2", code: "A", marks: 1, for: "order given as $C$, $B$, $A$", ft: true, dependsOn: ["M1"] },
        ],
        hints: [
          "Work out all three before ordering anything.",
          "Only the addition needs the powers matched; the other two are front numbers and powers handled separately.",
          "$B = 18 \\times 10^{-2}$, which re-normalises to $1.8 \\times 10^{-1}$.",
        ],
        workedSolution: "$A$: the powers must match, so $6 \\times 10^{-4} = 0.000\\,000\\,6 \\times 10^{2}$ and $A = 300.0006$, which is a little over 300.\n$B$: $6 \\times 3 = 18$ and $-4 + 2 = -2$, so $B = 18 \\times 10^{-2} = 1.8 \\times 10^{-1} = 0.18$.\n$C$: $6 \\div 3 = 2$ and $-4 - 2 = -6$, so $C = 2 \\times 10^{-6} = 0.000\\,002$.\nSmallest first: $C$, $B$, $A$.",
        commonErrors: [
          {
            misconception: "maths.stdform.powers-combined-when-adding",
            pattern: { kind: "text", regex: "A\\s*=\\s*9\\s*[x×]\\s*10" },
            feedback: "$A$ was treated as though addition had an index law, giving $6 + 3 = 9$ and $-4 + 2 = -2$. Only multiplication adds the powers; addition needs them matched first.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M71:Q17",
          },
          {
            misconception: "maths.presentation.answer-without-working",
            pattern: { kind: "text", regex: "^\\s*C\\s*,?\\s*B\\s*,?\\s*A\\s*$" },
            feedback: "The order is right and no marks follow it, because the paper said to show your working. Write the three values down, however roughly, and two more marks are there.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-november:M71:Q17",
          },
          {
            misconception: "maths.stdform.ordered-by-mantissa",
            pattern: { kind: "text", regex: "^\\s*B\\s*,?\\s*C\\s*,?\\s*A\\s*$" },
            feedback: "$B$ and $C$ were ordered by their front numbers, 1.8 against 2. Their powers are $-1$ and $-6$, so $C$ is the smaller of the two by a factor of about a hundred thousand.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-november:M71:Q17",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)list3",
    sources: ["ccea-cer:maths:2025-november:M71:Q17"],
    program: "A = 6e-4 + 3e2 = 300.0006; B = 18e-2 = 1.8e-1; C = 2e-6; sorted -> C, B, A",
  }),

  Q({
    n: 16,
    paper: P1_M8,
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "The mass of ice on a glacier, measured in tonnes",
    parts: [
      {
        id: "main",
        stem: "A glacier held $1.6 \\times 10^{9}$ tonnes of ice.\nOver twenty years the mass of ice decreased by 35%.\nWork out the new mass of ice.\nGive your answer in standard form.",
        marks: 3,
        answer: SF(1040000000, { unit: "tonnes" }),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "35% of $1.6 \\times 10^{9}$ found, i.e. $5.6 \\times 10^{8}$ or $560\\,000\\,000$; or the multiplier 0.65 seen" },
          { id: "A1", code: "A", marks: 1, for: "subtracted: $1.04 \\times 10^{9}$ or $1\\,040\\,000\\,000$ reached in any form", dependsOn: ["MA1"] },
          { id: "A2", code: "A", marks: 1, for: "$1.04 \\times 10^{9}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "A decrease means the amount found is taken away from the original.",
          "$0.35 \\times 1.6 = 0.56$, so 35% is $0.56 \\times 10^{9}$.",
          "Or go straight there with the multiplier $1 - 0.35 = 0.65$.",
        ],
        workedSolution: "35% of $1.6 \\times 10^{9}$ is $0.35 \\times 1.6 \\times 10^{9} = 0.56 \\times 10^{9} = 5.6 \\times 10^{8}$. Taking it away gives $1.6 \\times 10^{9} - 0.56 \\times 10^{9} = 1.04 \\times 10^{9}$ tonnes. The multiplier route is quicker: $0.65 \\times 1.6 = 1.04$, so the answer is $1.04 \\times 10^{9}$ tonnes, and the front number is already in range.",
        commonErrors: [
          {
            misconception: "maths.percent.increase-not-added",
            pattern: { kind: "numeric", value: 560000000 },
            feedback: "That is the mass of ice lost, which earns the first mark. The question asked for the mass remaining, so it has to come off the original.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
          {
            misconception: "maths.percent.depreciation-means-increase",
            pattern: { kind: "numeric", value: 2160000000 },
            feedback: "The change was added rather than taken away. Read the verb once more before the last line: decreased means the answer has to be smaller than the number you started with.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
          {
            misconception: "maths.stdform.power-of-ten-dropped",
            pattern: { kind: "numeric", value: 9.36 },
            feedback: "$1.6 \\times 10^{9}$ was read as $1.6 \\times 9$. The 9 counts places, not a quantity to multiply by, and a glacier measured in single tonnes should have felt wrong.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-summer:M71:Q16",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(main)work-out3",
    sources: ["ccea-cer:maths:2025-summer:M81:Q7", "ccea-cer:maths:2025-summer:M71:Q16"],
    program: "0.35*1.6e9 = 5.6e8; 1.6e9 - 0.56e9 = 1.04e9 = 1040000000; check 0.65*1.6e9 = 1.04e9",
  }),

  Q({
    n: 17,
    paper: P2_M7,
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1", "AO2"],
    commandWords: ["Express", "Work out", "Write down"],
    emphasis: ["in standard form"],
    setting: "The mass of a single bacterium and the mass of a colony",
    parts: [
      {
        id: "a",
        stem: "A colony of bacteria has mass $3.8 \\times 10^{-4}$ kilograms.\nWrite this mass in grams.\nGive your answer in standard form.",
        marks: 1,
        answer: SF(0.38, { unit: "g" }),
        scheme: [{ id: "A1", code: "A", marks: 1, for: "$3.8 \\times 10^{-1}$ g" }],
        hints: [
          "There are $10^{3}$ grams in a kilogram.",
          "Multiplying by $10^{3}$ raises the power by 3.",
          "$-4 + 3 = -1$.",
        ],
        workedSolution: "Multiplying by 1000 to change kilograms into grams raises the power by 3: $3.8 \\times 10^{-4}\\text{ kg} = 3.8 \\times 10^{-1}\\text{ g}$, which is 0.38 g.",
        commonErrors: [
          {
            misconception: "maths.stdform.units-not-matched",
            pattern: { kind: "numeric", value: 0.00000038 },
            feedback: "The power was lowered by 3 instead of raised. Grams are smaller than kilograms, so the same mass needs a bigger number of them.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M81:Q7",
          },
        ],
        requiresWorking: false,
      },
      {
        id: "b",
        stem: "One bacterium has mass $9.5 \\times 10^{-13}$ grams.\nWork out how many bacteria are in the colony.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(400000000000),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "$\\dfrac{3.8 \\times 10^{-1}}{9.5 \\times 10^{-13}}$ seen, with both masses in grams", ft: true },
          { id: "A1", code: "A", marks: 1, for: "$4 \\times 10^{11}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "Divide the mass of the colony by the mass of one bacterium.",
          "Both masses must be in the same unit first, which is what part (a) gave you.",
          "$3.8 \\div 9.5 = 0.4$ and $-1 - (-13) = 12$.",
        ],
        workedSolution: "$\\dfrac{3.8 \\times 10^{-1}}{9.5 \\times 10^{-13}} = (3.8 \\div 9.5) \\times 10^{-1 - (-13)} = 0.4 \\times 10^{12} = 4 \\times 10^{11}$ bacteria.",
        commonErrors: [
          {
            misconception: "maths.stdform.units-not-matched",
            pattern: { kind: "numeric", value: 400000000 },
            feedback: "The colony mass was used in kilograms while the bacterium was in grams, so the answer is a thousand times too small. Part (a) exists to prevent exactly this.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M81:Q7",
          },
          {
            misconception: "maths.stdform.mantissa-not-normalised",
            pattern: { kind: "text", regex: "0\\.4\\s*[x×]\\s*10" },
            feedback: "The division is right, so the method mark is safe. The front number has to reach at least 1: slide right once and drop the power to get $4 \\times 10^{11}$.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
        ],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
      {
        id: "c",
        stem: "Write your answer to part (b) as an ordinary number.",
        marks: 1,
        answer: DEC(400000000000),
        scheme: [{ id: "A1", code: "A", marks: 1, for: "$400\\,000\\,000\\,000$", ft: true }],
        hints: [
          "A power of 11 slides the point eleven places right.",
          "Start from 4 and count the places, not the zeros you write.",
          "Four hundred thousand million.",
        ],
        workedSolution: "$4 \\times 10^{11}$ moves the 4 eleven places, giving $400\\,000\\,000\\,000$.",
        commonErrors: [
          {
            misconception: "maths.stdform.power-of-ten-dropped",
            pattern: { kind: "numeric", value: 44 },
            feedback: "$4 \\times 10^{11}$ was read as $4 \\times 11$. The power counts the places the digits move; it is never a number to multiply the front number by.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-summer:M71:Q16",
          },
        ],
        requiresWorking: false,
        followThrough: { fromPart: "b", rule: "use-candidate-value" },
      },
    ],
    skeleton: "(a)write1|(b)work-out2|(c)write1",
    sources: ["ccea-cer:maths:2024-summer:M81:Q7", "ccea-cer:maths:2025-summer:M71:Q16"],
    program: "3.8e-4 kg = 3.8e-1 g = 0.38 g; 0.38 / 9.5e-13 = 4e11; 4e11 as ordinary = 400000000000",
  }),

  Q({
    n: 18,
    paper: P1_M8,
    style: "exam-style",
    difficulty: 4,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["in standard form"],
    setting: "Pure number, no context",
    parts: [
      {
        id: "a",
        stem: "Work out $(4 \\times 10^{5})^{2}$.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(160000000000),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "$4^{2} = 16$ and $10^{10}$ seen, or $16 \\times 10^{10}$" },
          { id: "MA2", code: "MA", marks: 1, for: "$1.6 \\times 10^{11}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "Square everything inside the bracket.",
          "Squaring a power of ten doubles it.",
          "16 is not below 10, so one more slide is needed.",
        ],
        workedSolution: "$(4 \\times 10^{5})^{2} = 4^{2} \\times 10^{5 \\times 2} = 16 \\times 10^{10}$, and re-normalising gives $1.6 \\times 10^{11}$.",
        commonErrors: [
          {
            misconception: "maths.stdform.mantissa-not-normalised",
            pattern: { kind: "text", regex: "16\\s*[x×]\\s*10" },
            feedback: "Both squarings are right, so the method mark is yours. The answer mark is for the form: 16 becomes 1.6 and the power rises from 10 to 11.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-summer:M81:Q7",
          },
          {
            misconception: "maths.stdform.power-of-bracket-mishandled",
            pattern: { kind: "numeric", value: 1.6e8 },
            feedback: "The power was added to itself as $5 + 2$ instead of multiplied by 2. A square is the bracket times itself, so $10^{5} \\times 10^{5} = 10^{10}$.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "b",
        stem: "Work out $(1.5 \\times 10^{-2}) + (9 \\times 10^{-3})$.\nGive your answer in standard form.",
        marks: 2,
        answer: SF(0.024),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "both terms at one power, e.g. $1.5 \\times 10^{-2} + 0.9 \\times 10^{-2}$, or $0.015 + 0.009$" },
          { id: "MA2", code: "MA", marks: 1, for: "$2.4 \\times 10^{-2}$", dependsOn: ["MA1"] },
        ],
        hints: [
          "Match the powers before adding anything.",
          "Write $9 \\times 10^{-3}$ at the power $-2$.",
          "$9 \\times 10^{-3} = 0.9 \\times 10^{-2}$.",
        ],
        workedSolution: "$9 \\times 10^{-3} = 0.9 \\times 10^{-2}$, so the sum is $1.5 \\times 10^{-2} + 0.9 \\times 10^{-2} = 2.4 \\times 10^{-2}$. As ordinary numbers, $0.015 + 0.009 = 0.024$.",
        commonErrors: [
          {
            misconception: "maths.stdform.powers-combined-when-adding",
            pattern: { kind: "numeric", value: 1.05e-4 },
            feedback: "Both halves were added, giving $1.5 + 9 = 10.5$ and $-2 + (-3) = -5$. Addition has no index law; the powers have to be made equal instead.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
          {
            misconception: "maths.stdform.addition-without-calculator",
            pattern: { kind: "numeric", value: 0.105 },
            feedback: "The front numbers were added without matching the powers first, so 9 was counted as nine hundredths rather than nine thousandths. Convert, then add.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M81:Q8",
          },
        ],
        requiresWorking: true,
      },
    ],
    skeleton: "(a)work-out2|(b)work-out2",
    sources: ["ccea-cer:maths:2025-november:M81:Q8"],
    program: "(4e5)^2 = 16e10 = 1.6e11; 9e-3 = 0.9e-2; 1.5 + 0.9 = 2.4 -> 2.4e-2 = 0.024",
  }),
];

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

export const findTheMistake = [
  {
    id: `ftm.${TOPIC}.01`,
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Erin was asked: a data centre stores $7 \\times 10^{6}$ files. The number of files increases by 20%. Work out the new number of files, giving your answer in standard form. Her working:",
    studentWorking: ["7 x 10^6 = 7 x 6 = 42", "20% of 42 = 8.4", "42 + 8.4 = 50.4", "Answer: 50.4"],
    mistakeLine: 1,
    misconception: "maths.stdform.power-of-ten-dropped",
    whatWentWrong: "The first line reads $10^{6}$ as a 6 to multiply by. The 6 is a count of places, so $7 \\times 10^{6}$ is seven million, not 42. Every line after it is competent percentage work applied to a number about a hundred and seventy thousand times too small, so none of it can be credited.",
    correction: ["20% of 7 x 10^6 = 1.4 x 10^6", "7 x 10^6 + 1.4 x 10^6 = 8.4 x 10^6", "Answer: 8.4 x 10^6 files"],
    marksEarnedAsWritten: [],
    feedback: "The percentage method was sound, and on the right number it would have scored everything. Examiners in Summer 2025 reported this exact reading on a question about a reservoir. One habit fixes it: before calculating, say the number out loud as an ordinary number. Seven million files is believable for a data centre; 42 files is not.",
    source: "ccea-cer:maths:2025-summer:M71:Q16",
  },
  {
    id: `ftm.${TOPIC}.02`,
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Daniel was asked to work out $(4 \\times 10^{5}) + (3 \\times 10^{4})$ without a calculator, giving his answer in standard form. His working:",
    studentWorking: ["4 + 3 = 7", "5 + 4 = 9", "Answer: 7 x 10^9"],
    mistakeLine: 2,
    misconception: "maths.stdform.powers-combined-when-adding",
    whatWentWrong: "Line 2 uses the multiplication rule on an addition. Adding the powers is what you do when the two numbers are multiplied together; here they are being added, and there is no index law for that. The powers have to be made equal first, and then only the front numbers move.",
    correction: ["3 x 10^4 = 0.3 x 10^5", "4 + 0.3 = 4.3", "Answer: 4.3 x 10^5"],
    marksEarnedAsWritten: [],
    feedback: "Line 1 is the right instinct in the wrong place: the front numbers do add, but only once both terms are counting in the same power of ten. Examiners in November 2025 named addition as the hardest of these operations without a calculator. A size check catches it too, since $7 \\times 10^{9}$ is more than ten thousand times the largest number in the question.",
    source: "ccea-cer:maths:2025-november:M81:Q8",
  },
  {
    id: `ftm.${TOPIC}.03`,
    topic: TOPIC,
    specRefs: SPEC,
    stem: "Orla was asked which is heavier: parcel $P$ at $2.6 \\times 10^{6}$ milligrams, or parcel $Q$ at $3 \\times 10^{3}$ grams. She had to show her working. Her working:",
    studentWorking: ["P has power 6, Q has power 3", "6 is bigger than 3", "Answer: P is heavier"],
    mistakeLine: 1,
    misconception: "maths.stdform.units-not-matched",
    whatWentWrong: "Line 1 compares two powers that are attached to different units, so they are not measuring the same thing. A power of ten records size, never what is being measured. In grams, $P$ is $2.6 \\times 10^{3}$, which is 2600 g against $Q$'s 3000 g, so the conclusion is the other way round.",
    correction: ["2.6 x 10^6 mg = 2.6 x 10^3 g", "2600 g compared with 3000 g", "Answer: Q is heavier"],
    marksEarnedAsWritten: [],
    feedback: "Comparing the powers is the right move once the units agree, and it is a quick way to sort standard-form numbers. Summer 2024 examiners reported over half the M8 entry converting one quantity and comparing as though both were done, with others not converting at all. Make the conversion line the first thing on the page whenever two units appear.",
    source: "ccea-cer:maths:2024-summer:M71:Q15",
  },
];

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.${TOPIC}.${String(n).padStart(2, "0")}`,
  topic: TOPIC,
  specRefs: SPEC,
  examUnit: "M7",
  kind,
  prompt,
  answer,
  keyWords,
  difficultyPrior,
});

export const prompts = [
  rp(1, "definition", "What does it mean for a number to be written in standard form?", "It is written as $a \\times 10^{n}$ where $a$ is at least 1 and less than 10, and $n$ is a whole number, positive or negative.", ["a times ten to the n", "between 1 and 10", "whole number power"], 3),
  rp(2, "procedure", "How do you convert an ordinary number into standard form?", "Slide the decimal point until exactly one non-zero digit is in front of it, and count the places. Sliding left gives a positive power, sliding right gives a negative one. Count places, not zeros.", ["slide the point", "count places", "left positive", "right negative"], 4),
  rp(3, "procedure", "How do you multiply or divide two numbers in standard form?", "Handle the front numbers and the powers separately: multiply or divide the front numbers, add the powers when multiplying and subtract them when dividing. Then re-normalise so the front number is between 1 and 10.", ["front numbers", "add the powers", "subtract the powers", "re-normalise"], 4),
  rp(4, "procedure", "How do you add or subtract two numbers in standard form without a calculator?", "Rewrite one of them so that both have the same power of ten, usually the larger one. Then add or subtract the front numbers, keep the shared power, and re-normalise if the front number has left the range.", ["same power", "rewrite one", "add the front numbers", "re-normalise"], 6),
  rp(5, "trap", "A question increases a standard-form quantity by a percentage. What are the three things the marks are for?", "Finding the percentage of the whole quantity, adding it on to the original, and writing the final answer back in standard form with the front number between 1 and 10.", ["find the percentage", "add it on", "back in standard form"], 6),
  rp(6, "trap", "Two quantities are given in standard form but in different units. What is the first line you write?", "The conversion of one of them into the other's unit. A power of ten is not a unit, so the powers cannot be compared until both quantities are measuring in the same thing.", ["convert", "same unit", "power is not a unit"], 5),
  rp(7, "procedure", "Your working has reached $0.4 \\times 10^{7}$. What do you do, and why?", "Re-normalise to $4 \\times 10^{6}$. The value is right but the front number must be at least 1 and below 10, and the final mark on these questions is for the form rather than the size.", ["re-normalise", "4 times 10 to the 6", "front number between 1 and 10"], 5),
  rp(8, "qa", "How do you work out $(a \\times 10^{n})^{k}$?", "Raise both parts to the power: $a^{k} \\times 10^{nk}$. The power of ten is multiplied by $k$, not added to itself in the front number. Then re-normalise.", ["raise both parts", "multiply the power", "re-normalise"], 5),
  rp(9, "trap", "Your calculator display reads 5.3E-04. What do you write on the answer line?", "$5.3 \\times 10^{-4}$. The E is the calculator's shorthand for times ten to the power, and it earns nothing if it is copied onto an answer line.", ["times ten to the power", "write it out", "E earns nothing"], 4),
  rp(10, "trap", "An ordering question says to show your working. What has to appear on the page?", "Every number converted to one common form, either all as ordinary numbers or all at the same power of ten. The order on its own scores nothing, however it was found.", ["convert every number", "one common form", "order alone scores nothing"], 5),
];

export { figCompare, figBarModel, figOrderCards };
