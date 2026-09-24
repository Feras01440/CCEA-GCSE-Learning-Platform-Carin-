/** maths.m3.upper-and-lower-bounds-addition-and-multiplication — S bundle (difficulty 3). */
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, round, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.upper-and-lower-bounds-addition-and-multiplication";
const SLUG = "upper-and-lower-bounds-addition-and-multiplication";
const REF = ["M3-NA-03"];

// ---------------------------------------------------------------- recomputed numbers
const ub = (v, half) => round(v + half, 6);
const lb = (v, half) => round(v - half, 6);
const N = {
  boltLB: lb(6.4, 0.05), boltUB: ub(6.4, 0.05),
  rectUB: round(ub(14, 0.5) * ub(9, 0.5), 6), rectLB: round(lb(14, 0.5) * lb(9, 0.5), 6),
  perimUB: round(2 * (ub(14, 0.5) + ub(9, 0.5)), 6), perimLB: round(2 * (lb(14, 0.5) + lb(9, 0.5)), 6),
  parcelsUB: round(2.45 + 3.75 + 1.95, 6), parcelsLB: round(2.35 + 3.65 + 1.85, 6),
  floorUB: round(5.65 * 3.45, 6), floorLB: round(5.55 * 3.35, 6),
  cratesUB: round(8 * 47.5, 6), cratesLB: round(8 * 42.5, 6),
  cuboidUB: round(4.25 * 2.55 * 1.85, 9), cuboidLB: round(4.15 * 2.45 * 1.75, 9),
  massUB: round(2.75 * 45.5, 6), massLB: round(2.65 * 44.5, 6),
  boardUB: round(87.5 * 42.5, 6), boardLB: round(82.5 * 37.5, 6),
  trapUB: round(0.5 * (7.25 + 11.65) * 5.05, 6), trapLB: round(0.5 * (7.15 + 11.55) * 4.95, 6),
  ncUB: round(8.5 * 5.5, 6), ncLB: round(7.5 * 4.5, 6),
  fieldUB: round(2 * (48.5 + 31.5), 6),
};
expect("bolt LB", N.boltLB, 6.35);
expect("bolt UB", N.boltUB, 6.45);
expect("rect UB", N.rectUB, 137.75);
expect("rect LB", N.rectLB, 114.75);
expect("perim UB", N.perimUB, 48);
expect("perim LB", N.perimLB, 44);
expect("parcels UB", N.parcelsUB, 8.15);
expect("parcels LB", N.parcelsLB, 7.85);
expect("floor UB", N.floorUB, 19.4925);
expect("floor LB", N.floorLB, 18.5925);
expect("crates UB", N.cratesUB, 380);
expect("crates LB", N.cratesLB, 340);
expect("cuboid UB", N.cuboidUB, 20.049375);
expect("cuboid LB", N.cuboidLB, 17.793125);
expect("mass UB", N.massUB, 125.125);
expect("mass LB", N.massLB, 117.925);
expect("board UB", N.boardUB, 3718.75);
expect("board LB", N.boardLB, 3093.75);
expect("trap UB", N.trapUB, 47.7225);
expect("trap LB", N.trapLB, 46.2825);
expect("nc UB", N.ncUB, 46.75);
expect("nc LB", N.ncLB, 33.75);
expect("field UB", N.fieldUB, 160);
assertNoFailures("t2 numbers");

// ---------------------------------------------------------------- figures
const lineBody = `
<g stroke='currentColor' stroke-width='1.6' fill='none'>
  <path d='M40 108 L620 108'/>
  <path d='M170 98 L170 118'/><path d='M330 92 L330 124'/><path d='M490 98 L490 118'/>
</g>
<g ${MATHTXT} font-size='17' text-anchor='middle'>
  <text x='170' y='150'>6.35</text><text x='330' y='150'>6.4</text><text x='490' y='150'>6.45</text>
</g>
<g ${TXT} font-size='14' text-anchor='middle'>
  <text x='170' y='174'>lower bound</text><text x='330' y='174'>rounded value</text><text x='490' y='174'>upper bound</text>
  <text x='250' y='62'>0.05 below</text><text x='410' y='62'>0.05 above</text>
  <text x='330' y='32'>every length that rounds to 6.4 lives in here</text>
</g>
<g stroke='currentColor' stroke-width='1.4' fill='none'>
  <path d='M330 74 L182 74'/><path d='M182 74 L192 69'/><path d='M182 74 L192 79'/>
  <path d='M330 74 L478 74'/><path d='M478 74 L468 69'/><path d='M478 74 L468 79'/>
</g>
<circle cx='170' cy='108' r='5.5' fill='currentColor' stroke='currentColor'/>
<circle cx='490' cy='108' r='5.5' fill='none' stroke='currentColor' stroke-width='1.8'/>`;
const lineAlt =
  "A number line marked 6.35, 6.4 and 6.45. Arrows from 6.4 out to each end are labelled 0.05 below and 0.05 above. The point at 6.35 is a filled circle (included) and the point at 6.45 is an open circle (not included).";
const lineFig = svgFig(lineBody, lineAlt, 660, 190);

const areaBody = `
<g fill='currentColor' fill-opacity='0.08' stroke='currentColor' stroke-width='1.8'>
  <rect x='60' y='50' width='406' height='266'/>
</g>
<g fill='none' stroke='currentColor' stroke-width='1.4' stroke-dasharray='6 4'>
  <rect x='60' y='50' width='378' height='247'/>
</g>
<g ${TXT} font-size='15' text-anchor='middle'>
  <text x='263' y='38'>14.5 cm (upper bound of the length)</text>
  <text x='263' y='190'>upper bound of the area</text>
  <text x='263' y='214'>14.5 x 9.5 = 137.75 sq cm</text>
  <text x='263' y='340'>dashed rectangle: the measured 14 cm by 9 cm</text>
</g>
<g ${TXT} font-size='15' text-anchor='start'>
  <text x='486' y='186'>9.5 cm</text><text x='486' y='206'>(upper bound</text><text x='486' y='226'>of the width)</text>
</g>`;
const areaAlt =
  "A solid rectangle 14.5 cm by 9.5 cm with the measured 14 cm by 9 cm rectangle drawn inside it as a dashed outline. The solid rectangle is labelled upper bound of the area, 14.5 times 9.5 = 137.75 square centimetres.";
const areaFig = svgFig(areaBody, areaAlt, 660, 356);

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statement M3-NA-03: bounds in ADDITION and MULTIPLICATION only. Subtraction and division of bounds are M4-NA-01 and are deliberately kept out; every item pairs upper with upper and lower with lower.",
  formula: "Only the trapezium-area formula is taken from the Higher sheet (fs.trapezium-area). The half-unit rule and the pairing rule are must-know.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Write down, Calculate, Work out, Find, Explain).",
  tariff: "Tariffs match the M3/M4 bounds pattern: a bound written down 1 mark, a bounded area or total 2-3 marks, a bound inside a formula 3-4 marks (packs/maths/exam-true/tariffs.json M3 perPart typical 2, p90 4).",
  copy: "Compared by hand against the M3 and M4 papers and schemes read for this batch (Summer 2022 M3 Q24 bounds of a rectangle, Summer 2024 M4, November 2025 M4): new contexts, new measurements and new wording; no eight-word sequence in common.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T,
    specRefs: REF,
    paper: M3,
    stem: "A rectangular tray is measured as 14 cm long and 9 cm wide, each correct to the nearest centimetre.\n\nCalculate the upper bound and the lower bound of the area of the tray.",
    figure: areaFig,
    steps: [
      {
        n: 1,
        working: "Nearest centimetre, so the half unit is $0.5$ cm. Length: $13.5$ to $14.5$. Width: $8.5$ to $9.5$.",
        decision: "Write all four bounds before any multiplying. Half of the accuracy is what you add and subtract: nearest 1 gives 0.5, one decimal place gives 0.05, nearest 10 gives 5.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "Upper bound of area $= 14.5 \\times 9.5 = 137.75 \\text{ cm}^2$",
        decision: "Both measurements are multiplied, and both are positive, so the area is largest when each side is at its largest. Upper with upper.",
        whyMenu: {
          options: [
            "Because making either side bigger makes the product bigger",
            "Because the upper bound is always used first",
            "Because 14.5 and 9.5 are the values that were measured",
          ],
          correct: 0,
          explain: "Area grows with each side, so the two upper bounds together give the greatest possible area.",
        },
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "Lower bound of area $= 13.5 \\times 8.5 = 114.75 \\text{ cm}^2$",
        decision: "Lower with lower, by the same reasoning. Notice how wide the gap is: the true area could be anywhere across 23 cm², from a measurement that looked precise.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "Upper bound $137.75 \\text{ cm}^2$; lower bound $114.75 \\text{ cm}^2$ (units, and the full display kept)",
        decision: "Both answers are exact here, so nothing is rounded. When a bound does not come out exactly, leave the whole calculator display: rounding a bound is the error the November 2025 report named.",
        earns: ["A1"],
      },
    ],
    finalAnswer: "Upper bound 137.75 cm², lower bound 114.75 cm²",
    twin: {
      stem: "A rectangular photograph is measured as 5.6 cm by 3.4 cm, each correct to 1 decimal place. Calculate the upper bound of its area.",
      answer: numAnswer(N.floorUB, { unit: "cm²", unitRequired: true, tolerance: { type: "absolute", value: 0.0001 } }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T,
    specRefs: REF,
    paper: M3,
    stem: "Eight identical crates are loaded onto a trailer. Each crate has mass 45 kg, correct to the nearest 5 kg.\n\nCalculate the greatest possible total mass of the eight crates.",
    steps: [
      {
        n: 1,
        working: "Nearest 5 kg, so the half unit is $2.5$ kg: each crate is between $42.5$ kg and $47.5$ kg.",
        decision: "Half of 5 is 2.5, not 5 and not 0.5. This exact half-unit is what the Summer 2025 examiners reported going wrong, with 45 being used as though it were the bound.",
        whyMenu: {
          options: [
            "Because anything from 42.5 kg up to 47.5 kg rounds to 45 kg when rounding to the nearest 5",
            "Because 45 - 5 = 40 and 45 + 5 = 50",
            "Because the nearest 5 means the bounds end in 5",
          ],
          correct: 0,
          explain: "The rounding interval has width 5 and is centred on 45, so it stretches 2.5 either side.",
        },
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "Greatest total $= 8 \\times 47.5 = 380 \\text{ kg}$",
        decision: "Eight lots of the heaviest a crate could be. The 8 is an exact count, not a measurement, so it has no bounds of its own.",
        earns: ["MA1"],
      },
    ],
    finalAnswer: "380 kg",
    twin: {
      stem: "Twelve identical bags of sand each have mass 25 kg, correct to the nearest 5 kg. Calculate the least possible total mass of the twelve bags.",
      answer: numAnswer(270, { unit: "kg", unitRequired: true }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
];
expect("twin bags least", 12 * 22.5, 270);
assertNoFailures("t2 worked examples");

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`,
    topic: T,
    specRefs: REF,
    when: "pre",
    items: [
      dxItem("01",
        "A rope is 6.4 m long, correct to 1 decimal place. What is its upper bound?",
        "Find a half unit from a stated accuracy",
        [
          ["6.45 m", true, null, "One decimal place means the half unit is 0.05, so the rope can reach 6.45 m without rounding to 6.5."],
          ["6.5 m", false, "maths.bounds.rounded-display", "6.5 m would round to 6.5, not 6.4. The bound sits halfway between 6.4 and 6.5."],
          ["6.41 m", false, "maths.bounds.rounded-display", "That assumes two decimal places of accuracy. The half unit is half of 0.1, which is 0.05."],
        ], 20),
      dxItem("02",
        "A box has mass 30 kg, correct to the nearest 5 kg. What is its lower bound?",
        "Halve a nearest-5 accuracy",
        [
          ["27.5 kg", true, null, "Half of 5 is 2.5. Anything from 27.5 kg upwards rounds to 30 kg."],
          ["25 kg", false, "maths.bounds.wrong-half-unit-for-nearest-5", "The whole 5 was subtracted instead of half of it. 25 kg would round to 25, not 30."],
          ["29.5 kg", false, "maths.bounds.wrong-half-unit-for-nearest-5", "That is the half unit for the nearest whole kilogram. Here the rounding step is 5, so the half unit is 2.5."],
        ], 25),
      dxItem("03",
        "A rectangle measures 8 cm by 5 cm, each to the nearest cm. Which calculation gives the **greatest** possible area?",
        "Pair the bounds correctly for a product",
        [
          ["$8.5 \\times 5.5$", true, null, "Area increases when either side increases, so both upper bounds together give the greatest area: 46.75 cm²."],
          ["$8.5 \\times 4.5$", false, "maths.bounds.both-upper-in-subtraction", "Mixing an upper with a lower is what subtraction and division need. A product of two positive lengths wants both at their largest."],
          ["$8 \\times 5$", false, "maths.bounds.substitute-given-values", "Those are the measured values, so this is the area as written down, not a bound at all."],
        ], 30),
      dxItem("04",
        "Three parcels have masses 2.4 kg, 3.7 kg and 1.9 kg, each to 1 decimal place. What is the greatest possible total?",
        "Add three upper bounds",
        [
          ["8.15 kg", true, null, "2.45 + 3.75 + 1.95 = 8.15 kg. In an addition, every upper bound is used."],
          ["8.05 kg", false, "maths.bounds.bounds-of-answer-not-inputs", "That is 8.0 + 0.05: the three masses were added first and the answer bounded afterwards. Bound the inputs, not the output — each of the three parcels has its own 0.05."],
          ["8.00 kg", false, "maths.bounds.substitute-given-values", "That is the total of the measured values. A bound needs the extreme each mass could take."],
        ], 30),
      dxItem("05",
        "The area of a rectangle comes out as 19.4925 cm². The question asks for the upper bound. What goes on the answer line?",
        "Present a bound without rounding it",
        [
          ["19.4925 cm²", true, null, "A bound is exact, so the whole display goes down, with the unit. Rounding it would make the stated bound untrue."],
          ["19.5 cm²", false, "maths.bounds.rounded-display", "Rounding a bound to 3 significant figures claims the area could reach 19.5, which it cannot. Examiners flagged this exact habit in November 2025."],
          ["19 cm²", false, "maths.bounds.rounded-display", "The accuracy mark is for the full value. There is no instruction to round here."],
        ], 25),
      dxItem("06",
        "A trapezium has parallel sides 7.2 cm and 11.6 cm and height 5.0 cm, all to 1 decimal place. Which substitution gives the **greatest** area?",
        "Use bounds inside a formula from the sheet",
        [
          ["$\\tfrac{1}{2}(7.25 + 11.65) \\times 5.05$", true, null, "Every measurement appears once and increasing any of them increases the area, so all three upper bounds are used: 47.7225 cm²."],
          ["$\\tfrac{1}{2}(7.2 + 11.6) \\times 5.05$", false, "maths.bounds.substitute-given-values", "Two measured values were left as they were. Each measurement in the formula has its own bound."],
          ["$\\tfrac{1}{2}(7.25 + 11.65) \\times 5.0$", false, "maths.formula.misapplied-power-or-coefficient", "The height was left unbounded. Read the formula symbol by symbol and bound every letter in it."],
        ], 40),
    ],
  },
];

// ---------------------------------------------------------------- questions
const questions = [
  question({
    id: `q.${T}.0001`, topic: T, specRefs: REF, style: "practice", difficulty: 1,
    commandWords: ["Write down"], setting: "A single measurement to 1 decimal place",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q17"],
    solutionProgram: "half unit = 0.1/2 = 0.05; LB = 6.4 - 0.05 = 6.35; UB = 6.4 + 0.05 = 6.45",
    figures: [lineFig],
    parts: [
      {
        id: "a", verb: "write-down", marks: 1,
        stem: "The length of a bolt is 6.4 cm, correct to 1 decimal place.\n\nWrite down the lower bound of the length.",
        answer: numAnswer(6.35, { unit: "cm" }),
        scheme: [A("A1", 1, "6.35 (cm)")],
        hints: ["One decimal place rounds in steps of 0.1, so the half unit is 0.05."],
        workedSolution: "Half of $0.1$ is $0.05$, so the lower bound is $6.4 - 0.05 = 6.35$ cm.",
        commonErrors: [{
          misconception: "maths.bounds.rounded-display",
          pattern: { kind: "numeric" },
          feedback: "A whole 0.1 was subtracted. 6.3 rounds to 6.3, not to 6.4; the boundary is halfway between, at 6.35.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "write-down", marks: 1,
        stem: "Write down the upper bound of the length.",
        answer: numAnswer(6.45, { unit: "cm" }),
        scheme: [A("A1", 1, "6.45 (cm)")],
        hints: ["Add the same 0.05 that you subtracted."],
        workedSolution: "$6.4 + 0.05 = 6.45$ cm.",
        commonErrors: [{
          misconception: "maths.bounds.rounded-display",
          pattern: { kind: "numeric" },
          feedback: "A whole 0.1 was added. 6.5 would round to 6.5, not to 6.4; the boundary sits halfway between them, at 6.45.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0002`, topic: T, specRefs: REF, style: "practice", difficulty: 2,
    commandWords: ["Write down"], setting: "Three measurements to three different accuracies",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q13"],
    solutionProgram: "nearest 10 m: 5 either side of 80 -> 75, 85; nearest 5 kg: 2.5 either side of 30 -> 27.5, 32.5; 2 dp: 0.005 either side of 3.27 -> 3.265, 3.275",
    parts: [
      {
        id: "a", verb: "write-down", marks: 1,
        stem: "A field is 80 m long, correct to the nearest 10 m.\n\nWrite down the lower bound of the length.",
        answer: numAnswer(75, { unit: "m" }),
        scheme: [A("A1", 1, "75 (m)")],
        hints: ["The rounding step is 10, so the half unit is 5."],
        workedSolution: "$80 - 5 = 75$ m.",
        commonErrors: [{
          misconception: "maths.bounds.wrong-half-unit-for-nearest-5",
          pattern: { kind: "numeric" },
          feedback: "79.5 is the bound for the nearest metre. Here the measurement is to the nearest 10 m, so the half unit is 5.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q13",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "write-down", marks: 1,
        stem: "A sack has mass 30 kg, correct to the nearest 5 kg.\n\nWrite down the upper bound of the mass.",
        answer: numAnswer(32.5, { unit: "kg" }),
        scheme: [A("A1", 1, "32.5 (kg)")],
        hints: ["Half of 5 is 2.5."],
        workedSolution: "$30 + 2.5 = 32.5$ kg.",
        commonErrors: [{
          misconception: "maths.bounds.wrong-half-unit-for-nearest-5",
          pattern: { kind: "numeric" },
          feedback: "The whole 5 was added. 35 kg would round to 35, not 30; the boundary is halfway, at 32.5.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q13",
        }],
        requiresWorking: false,
      },
      {
        id: "c", verb: "write-down", marks: 1,
        stem: "A reading is 3.27 seconds, correct to 2 decimal places.\n\nWrite down the upper bound of the reading.",
        answer: numAnswer(3.275, { unit: "s" }),
        scheme: [A("A1", 1, "3.275 (s)")],
        hints: ["Two decimal places rounds in steps of 0.01."],
        workedSolution: "Half of $0.01$ is $0.005$, so the upper bound is $3.275$ s.",
        commonErrors: [{
          misconception: "maths.bounds.rounded-display",
          pattern: { kind: "numeric" },
          feedback: "3.28 rounds to 3.28. The boundary is halfway between 3.27 and 3.28.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0003`, topic: T, specRefs: REF, style: "practice", difficulty: 2,
    commandWords: ["Calculate"], setting: "Three parcels weighed to 1 decimal place",
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q17"],
    solutionProgram: "UB = 2.45 + 3.75 + 1.95 = 8.15; LB = 2.35 + 3.65 + 1.85 = 7.85",
    parts: [
      {
        id: "a", verb: "calculate", marks: 2,
        stem: "Three parcels have masses 2.4 kg, 3.7 kg and 1.9 kg, each correct to 1 decimal place.\n\nCalculate the upper bound of the total mass.",
        answer: numAnswer(8.15, { unit: "kg", unitRequired: true }),
        scheme: [
          MA("MA1", 1, "2.45 + 3.75 + 1.95 seen (all three upper bounds)"),
          A("A1", 1, "8.15 kg", { dependsOn: ["MA1"] }),
        ],
        hints: ["Each parcel has its own half unit of 0.05.", "For the largest total, take every mass at its largest."],
        workedSolution: "Upper bounds: $2.45$, $3.75$, $1.95$. Total $= 8.15$ kg.",
        commonErrors: [{
          misconception: "maths.bounds.bounds-of-answer-not-inputs",
          pattern: { kind: "numeric" },
          feedback: "The three masses were added first and 0.05 added to the total. Each parcel carries its own uncertainty, so three lots of 0.05 are gained, not one.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "calculate", marks: 2,
        stem: "Calculate the lower bound of the total mass.",
        answer: numAnswer(7.85, { unit: "kg", unitRequired: true }),
        scheme: [
          MA("MA1", 1, "2.35 + 3.65 + 1.85 seen (all three lower bounds)"),
          A("A1", 1, "7.85 kg", { dependsOn: ["MA1"] }),
        ],
        hints: ["Take every mass at its smallest this time."],
        workedSolution: "Lower bounds: $2.35$, $3.65$, $1.85$. Total $= 7.85$ kg.",
        commonErrors: [{
          misconception: "maths.bounds.both-upper-in-subtraction",
          pattern: { kind: "numeric" },
          feedback: "The measured values give 8.0 kg, which is the total as written, not the smallest it could be. In an addition every quantity goes to its lower bound together.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0004`, topic: T, specRefs: REF, style: "practice", difficulty: 2, paper: M7P1,
    commandWords: ["Work out"], setting: "A rectangle measured to the nearest centimetre, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q16"],
    solutionProgram: "UB = 8.5*5.5 = 46.75; LB = 7.5*4.5 = 33.75",
    parts: [
      {
        id: "a", verb: "work-out", marks: 2,
        stem: "A rectangular tile measures 8 cm by 5 cm, each correct to the nearest centimetre.\n\nWork out the upper bound of the area of the tile.",
        answer: numAnswer(46.75, { unit: "cm²", unitRequired: true }),
        scheme: [MA("MA1", 1, "8.5 × 5.5 seen"), A("A1", 1, "46.75 cm²", { dependsOn: ["MA1"] })],
        hints: ["Nearest centimetre gives a half unit of 0.5.", "$8.5 \\times 5.5 = 8.5 \\times 5 + 8.5 \\times 0.5$."],
        workedSolution: "$8.5 \\times 5.5 = 42.5 + 4.25 = 46.75 \\text{ cm}^2$.",
        commonErrors: [{
          misconception: "maths.bounds.substitute-given-values",
          pattern: { kind: "numeric" },
          feedback: "$8 \\times 5$ is the area from the measured values. A bound needs each side at the extreme it could reach.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q16",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "work-out", marks: 2,
        stem: "Work out the lower bound of the area of the tile.",
        answer: numAnswer(33.75, { unit: "cm²", unitRequired: true }),
        scheme: [MA("MA1", 1, "7.5 × 4.5 seen"), A("A1", 1, "33.75 cm²", { dependsOn: ["MA1"] })],
        hints: ["Both sides at their smallest.", "$7.5 \\times 4.5 = 7.5 \\times 4 + 7.5 \\times 0.5$."],
        workedSolution: "$7.5 \\times 4.5 = 30 + 3.75 = 33.75 \\text{ cm}^2$.",
        commonErrors: [{
          misconception: "maths.bounds.both-upper-in-subtraction",
          pattern: { kind: "numeric" },
          feedback: "$8.5 \\times 4.5$ mixes an upper bound with a lower one. That pairing belongs to subtraction and division; a product of lengths pairs like with like.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0005`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Calculate"], setting: "Crates loaded onto a trailer, mass to the nearest 5 kg",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q13"],
    solutionProgram: "half unit 2.5; UB total = 8*47.5 = 380; LB total = 8*42.5 = 340",
    parts: [
      {
        id: "a", verb: "calculate", marks: 2,
        stem: "Eight identical crates each have mass 45 kg, correct to the nearest 5 kg.\n\nCalculate the greatest possible total mass of the eight crates.",
        answer: numAnswer(380, { unit: "kg", unitRequired: true }),
        scheme: [MA("MA1", 1, "47.5 seen as the upper bound of one crate"), A("A1", 1, "380 kg", { dependsOn: ["MA1"] })],
        hints: ["Half of 5 is 2.5, so one crate is at most 47.5 kg.", "The 8 is a count, not a measurement, so it is exact."],
        workedSolution: "Upper bound of one crate $= 47.5$ kg, so the greatest total is $8 \\times 47.5 = 380$ kg.",
        commonErrors: [{
          misconception: "maths.bounds.wrong-half-unit-for-nearest-5",
          pattern: { kind: "numeric" },
          feedback: "$8 \\times 50$ uses a whole 5 kg above 45. The Summer 2025 report named this: half of 5 is 2.5, so the crate reaches 47.5 kg.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q13",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "calculate", marks: 2,
        stem: "Calculate the least possible total mass of the eight crates.",
        answer: numAnswer(340, { unit: "kg", unitRequired: true }),
        scheme: [MA("MA1", 1, "42.5 seen as the lower bound of one crate"), A("A1", 1, "340 kg", { dependsOn: ["MA1"] })],
        hints: ["Take one crate at its lightest.", "$8 \\times 42.5$."],
        workedSolution: "Lower bound of one crate $= 42.5$ kg, so the least total is $8 \\times 42.5 = 340$ kg.",
        commonErrors: [{
          misconception: "maths.bounds.substitute-given-values",
          pattern: { kind: "numeric" },
          feedback: "$8 \\times 45$ is the total from the recorded mass. The question asks for the least the trailer could be carrying.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q13",
        }],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0006`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Calculate"], setting: "A rectangular kitchen floor measured to 1 decimal place",
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q16"],
    solutionProgram: "UB = 5.65*3.45 = 19.4925; LB = 5.55*3.35 = 18.5925; UB perimeter = 2*(5.65+3.45) = 18.2",
    parts: [
      {
        id: "a", verb: "calculate", marks: 3,
        stem: "A kitchen floor is a rectangle measuring 5.6 m by 3.4 m, each correct to 1 decimal place.\n\nCalculate the upper bound of the area of the floor.",
        answer: numAnswer(19.4925, { unit: "m²", unitRequired: true, tolerance: { type: "absolute", value: 0.0001 } }),
        scheme: [
          MA("MA1", 1, "5.65 and 3.45 both seen as upper bounds"),
          MA("MA2", 1, "5.65 × 3.45"),
          A("A1", 1, "19.4925 m²", { dependsOn: ["MA2"], examinerNote: "19.5 or 19.49 scores MA1 MA2 only; a bound is not rounded." }),
        ],
        hints: ["Half unit 0.05 on each side.", "Both sides at their largest for the largest area.", "Leave the whole display: 19.4925."],
        workedSolution: "Upper bounds $5.65$ m and $3.45$ m. Area $= 5.65 \\times 3.45 = 19.4925 \\text{ m}^2$.",
        commonErrors: [
          {
            misconception: "maths.bounds.rounded-display",
            pattern: { kind: "numeric" },
            feedback: "The method marks stand, and the last mark is lost to rounding. A bound is a statement that the area cannot exceed it, so 19.4925 is written in full.",
            marksTypicallyEarned: 2,
            source: "ccea-cer:maths:2025-november:M4:Q17",
          },
          {
            misconception: "maths.bounds.bounds-of-answer-not-inputs",
            pattern: { kind: "numeric" },
            feedback: "$5.6 \\times 3.4 = 19.04$ was worked out first and then bounded. The bounds go on the measurements, before any multiplying.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M4:Q17",
          },
        ],
        requiresWorking: true,
      },
      {
        id: "b", verb: "calculate", marks: 2,
        stem: "Calculate the upper bound of the perimeter of the floor.",
        answer: numAnswer(18.2, { unit: "m", unitRequired: true }),
        scheme: [
          MA("MA1", 1, "2 × (5.65 + 3.45) or 5.65 + 5.65 + 3.45 + 3.45"),
          A("A1", 1, "18.2 m", { dependsOn: ["MA1"] }),
        ],
        hints: ["The perimeter is an addition, so every side goes to its upper bound.", "$2 \\times 9.1$."],
        workedSolution: "$2(5.65 + 3.45) = 2 \\times 9.1 = 18.2$ m.",
        commonErrors: [{
          misconception: "maths.bounds.bounds-of-answer-not-inputs",
          pattern: { kind: "numeric" },
          feedback: "The perimeter 18.0 m was found first and 0.05 added. Four sides are added, so four half units are gained, giving 18.2 m.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0007`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Calculate"], setting: "Mass of a metal block from density and volume",
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q16"],
    solutionProgram: "mass = density*volume; UB = 2.75*45.5 = 125.125; LB = 2.65*44.5 = 117.925",
    parts: [{
      id: "main", verb: "calculate", marks: 3,
      stem: "A block of metal has volume 45 cm³, correct to the nearest cm³, and density 2.7 g/cm³, correct to 1 decimal place.\n\n$\\text{mass} = \\text{density} \\times \\text{volume}$\n\nCalculate the upper bound of the mass of the block.",
      answer: numAnswer(125.125, { unit: "g", unitRequired: true, tolerance: { type: "absolute", value: 0.0001 } }),
      scheme: [
        MA("MA1", 1, "45.5 and 2.75 both seen"),
        MA("MA2", 1, "2.75 × 45.5"),
        A("A1", 1, "125.125 g", { dependsOn: ["MA2"] }),
      ],
      hints: ["Two different accuracies: nearest cm³ gives 0.5, one decimal place gives 0.05.", "Mass grows with both density and volume, so take both upper bounds.", "Keep the full display."],
      workedSolution: "Upper bounds: volume $45.5 \\text{ cm}^3$, density $2.75 \\text{ g/cm}^3$. Mass $= 2.75 \\times 45.5 = 125.125$ g.",
      commonErrors: [
        {
          misconception: "maths.bounds.substitute-given-values",
          pattern: { kind: "numeric" },
          feedback: "$2.7 \\times 45$ uses the recorded values. The Summer 2024 report noted that the weakest answers substituted the given numbers and never wrote a bound at all.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q16",
        },
        {
          misconception: "maths.formula.misapplied-power-or-coefficient",
          pattern: { kind: "numeric" },
          feedback: "$2.75 \\times 45$ bounds the density but leaves the volume as measured. Every letter in the formula needs its own bound.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M4:Q16",
        },
      ],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0008`, topic: T, specRefs: REF, style: "practice", difficulty: 4,
    commandWords: ["Calculate"], setting: "Volume of a cuboid box from three measurements",
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q16"],
    solutionProgram: "UB = 4.25*2.55*1.85 = 20.049375; LB = 4.15*2.45*1.75 = 17.793125",
    parts: [
      {
        id: "a", verb: "calculate", marks: 3,
        stem: "A cuboid box measures 4.2 m by 2.5 m by 1.8 m, each correct to 1 decimal place.\n\nCalculate the upper bound of the volume of the box.",
        answer: numAnswer(20.049375, { unit: "m³", unitRequired: true, tolerance: { type: "absolute", value: 1e-6 } }),
        scheme: [
          MA("MA1", 1, "4.25, 2.55 and 1.85 all seen"),
          MA("MA2", 1, "4.25 × 2.55 × 1.85"),
          A("A1", 1, "20.049375 m³", { dependsOn: ["MA2"] }),
        ],
        hints: ["Three measurements, three half units of 0.05.", "Volume grows with every edge, so take all three upper bounds.", "Do not round: the display reads 20.049375."],
        workedSolution: "$4.25 \\times 2.55 \\times 1.85 = 10.8375 \\times 1.85 = 20.049375 \\text{ m}^3$.",
        commonErrors: [{
          misconception: "maths.bounds.rounded-display",
          pattern: { kind: "numeric" },
          feedback: "Both method marks stand. A bound is left exactly as the calculator gives it unless the question says otherwise.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "calculate", marks: 2,
        stem: "Calculate the lower bound of the volume of the box.",
        answer: numAnswer(17.793125, { unit: "m³", unitRequired: true, tolerance: { type: "absolute", value: 1e-6 } }),
        scheme: [MA("MA1", 1, "4.15 × 2.45 × 1.75"), A("A1", 1, "17.793125 m³", { dependsOn: ["MA1"] })],
        hints: ["All three edges at their smallest."],
        workedSolution: "$4.15 \\times 2.45 \\times 1.75 = 10.1675 \\times 1.75 = 17.793125 \\text{ m}^3$.",
        commonErrors: [{
          misconception: "maths.bounds.both-upper-in-subtraction",
          pattern: { kind: "numeric" },
          feedback: "$4.25 \\times 2.45 \\times 1.85$ mixes bounds. For a product of positive lengths, the smallest volume uses every lower bound together.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        }],
        requiresWorking: true,
      },
    ],
  }),
  // ------------------------------------------------------------ exam-style
  question({
    id: `q.${T}.0009`, topic: T, specRefs: REF, style: "exam-style", difficulty: 4,
    commandWords: ["Calculate", "Explain"], emphasis: ["not"],
    setting: "Three students disagree about the area of a notice board",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q16", "ccea-cer:maths:2025-summer:M4:Q13"],
    solutionProgram: "nearest 5 cm -> half unit 2.5; UB = 87.5*42.5 = 3718.75; LB = 82.5*37.5 = 3093.75; 3000 < 3093.75 so Niamh's value is impossible; 3400 and 3600 both lie inside [3093.75, 3718.75]",
    parts: [
      {
        id: "a", verb: "calculate", marks: 3,
        stem: "A rectangular notice board is measured as 85 cm by 40 cm, each correct to the nearest 5 cm.\n\nCalculate the upper bound and the lower bound of the area of the notice board.",
        answer: textAnswer(
          ["upper bound 3718.75 cm², lower bound 3093.75 cm²"],
          [{ any: ["3718.75"], marks: 1 }, { any: ["3093.75"], marks: 1 }],
        ),
        scheme: [
          MA("MA1", 1, "half unit 2.5 used: 82.5, 87.5, 37.5, 42.5 (any three of the four)"),
          MA("MA2", 1, "upper bound 87.5 × 42.5 = 3718.75 (cm²)"),
          MA("MA3", 1, "lower bound 82.5 × 37.5 = 3093.75 (cm²)"),
        ],
        hints: ["Both measurements are to the nearest 5 cm, so the half unit is 2.5 cm.", "Upper bound of the area uses both upper bounds.", "Lower bound of the area uses both lower bounds."],
        workedSolution: "Bounds of the sides: $82.5 \\le L < 87.5$ and $37.5 \\le W < 42.5$.\nUpper bound of area $= 87.5 \\times 42.5 = 3718.75 \\text{ cm}^2$.\nLower bound of area $= 82.5 \\times 37.5 = 3093.75 \\text{ cm}^2$.",
        commonErrors: [{
          misconception: "maths.bounds.wrong-half-unit-for-nearest-5",
          pattern: { kind: "numeric" },
          feedback: "$90 \\times 45$ adds a whole 5 cm to each side. To the nearest 5, the half unit is 2.5, so the sides reach 87.5 cm and 42.5 cm.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M4:Q13",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "explain", marks: 2,
        stem: "Niamh says the area could be 3000 cm². Owen says it could be 3400 cm².\n\nOne of them is definitely **not** correct. State which one, and explain your reasoning clearly.",
        answer: textAnswer(
          ["Niamh, because 3000 is below the lower bound 3093.75", "Niamh is not correct: the smallest possible area is 3093.75 cm²"],
          [
            { any: ["Niamh"], marks: 1, reject: ["Owen"] },
            { any: ["below the lower bound", "less than 3093.75", "smaller than the lower bound", "outside the range"], marks: 1 },
          ],
        ),
        scheme: [
          MA("MA1", 1, "Niamh identified", { ft: true }),
          MA("MA2", 1, "reason: 3000 is less than the lower bound 3093.75, so no pair of possible measurements can give it", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Compare each claim with the interval you found in part (a).", "3400 sits between 3093.75 and 3718.75, so it is possible.", "The reason must quote the bound, not just say the number looks too small."],
        workedSolution: "The area must satisfy $3093.75 \\le A < 3718.75$. Owen's 3400 cm² lies inside that interval, so it is possible. Niamh's 3000 cm² is below the lower bound of 3093.75 cm², so it cannot happen; she has probably used 80 cm by 37.5 cm, taking a whole 5 cm off the length.",
        commonErrors: [{
          misconception: "maths.bounds.bounds-of-answer-not-inputs",
          pattern: { kind: "text", regex: "Owen" },
          feedback: "Owen's 3400 cm² sits comfortably inside the interval from part (a), so it is possible. The value that cannot occur is the one outside the interval.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q16",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  question({
    id: `q.${T}.0010`, topic: T, specRefs: REF, style: "exam-style", difficulty: 4,
    commandWords: ["Calculate"], setting: "A trapezium-shaped flower bed measured to 1 decimal place",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q16", "ccea-cer:maths:2025-november:M4:Q17"],
    solutionProgram: "area = (1/2)(a+b)h; UB = 0.5*(7.25+11.65)*5.05 = 0.5*18.9*5.05 = 47.7225; LB = 0.5*(7.15+11.55)*4.95 = 0.5*18.7*4.95 = 46.2825",
    parts: [{
      id: "main", verb: "calculate", marks: 4,
      stem: "A flower bed is a trapezium. Its parallel sides are 7.2 m and 11.6 m, and the distance between them is 5.0 m. Each measurement is correct to 1 decimal place.\n\nCalculate the upper bound of the area of the flower bed.\n\n(The formula sheet gives the area of a trapezium as $\\tfrac{1}{2}(a+b)h$.)",
      answer: numAnswer(47.7225, { unit: "m²", unitRequired: true, tolerance: { type: "absolute", value: 0.0001 } }),
      scheme: [
        MA("MA1", 1, "half unit 0.05 applied: 7.25, 11.65 and 5.05 seen"),
        MA("MA2", 1, "correct use of the formula: ½(7.25 + 11.65) × 5.05"),
        MA("MA3", 1, "9.45 × 5.05 or 18.9 × 5.05 ÷ 2"),
        A("A1", 1, "47.7225 m²", { dependsOn: ["MA2"], examinerNote: "47.7 scores a maximum of MA1 MA2 MA3; a bound is not rounded." }),
      ],
      hints: ["Three measurements, each with a half unit of 0.05.", "Increasing a, b or h increases the area, so every bound is an upper bound.", "Add the parallel sides first: 7.25 + 11.65 = 18.9.", "Leave the display as it stands."],
      workedSolution: "Upper bounds $a = 7.25$, $b = 11.65$, $h = 5.05$.\n$\\text{Area} = \\tfrac{1}{2}(7.25 + 11.65) \\times 5.05 = \\tfrac{1}{2} \\times 18.9 \\times 5.05 = 9.45 \\times 5.05 = 47.7225 \\text{ m}^2$.",
      commonErrors: [
        {
          misconception: "maths.formula.misapplied-power-or-coefficient",
          pattern: { kind: "numeric" },
          feedback: "The halving was left out. Read the formula symbol by symbol before substituting: $\\tfrac{1}{2}(a+b)h$ halves the sum of the parallel sides.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2024-summer:M4:Q16",
        },
        {
          misconception: "maths.bounds.substitute-given-values",
          pattern: { kind: "numeric" },
          feedback: "$\\tfrac{1}{2}(7.2 + 11.6) \\times 5 = 47$ is the area from the recorded measurements. Bounds go on every measurement before the formula is used.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2024-summer:M4:Q16",
        },
        {
          misconception: "maths.bounds.rounded-display",
          pattern: { kind: "numeric" },
          feedback: "The three method marks stand and the accuracy mark goes. Saying the area cannot exceed 47.7 m² is a slightly different claim from the true bound, 47.7225 m².",
          marksTypicallyEarned: 3,
          source: "ccea-cer:maths:2025-november:M4:Q17",
        },
      ],
      requiresWorking: true,
    }],
  }),
];
expect("trap no-half", 18.9 * 5.05, 95.445);
expect("trap measured", 0.5 * (7.2 + 11.6) * 5, 47);
expect("cuboid mixed", round(4.25 * 2.45 * 1.85, 9), 19.263125);
assertNoFailures("t2 question numbers");

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T,
    specRefs: REF,
    stem: "A rectangular sign is measured as 60 cm by 25 cm, each correct to the nearest 5 cm. Conor was asked for the upper bound of the area. His working:",
    studentWorking: [
      "60 to the nearest 5 gives 55 to 65",
      "25 to the nearest 5 gives 20 to 30",
      "Upper bound of area = 65 × 30 = 1950 cm²",
    ],
    mistakeLine: 1,
    misconception: "maths.bounds.wrong-half-unit-for-nearest-5",
    whatWentWrong: "The whole 5 was added and subtracted instead of half of it. To the nearest 5 cm, the half unit is 2.5 cm, so 60 cm lies between 57.5 cm and 62.5 cm, and 25 cm lies between 22.5 cm and 27.5 cm.",
    correction: [
      "60 to the nearest 5 gives 57.5 to 62.5",
      "25 to the nearest 5 gives 22.5 to 27.5",
      "Upper bound of area = 62.5 × 27.5 = 1718.75 cm²",
    ],
    marksEarnedAsWritten: ["MA1"],
    feedback: "The structure is right: both measurements bounded first, then both upper bounds multiplied together. That earns the method mark. The half unit is what went: half of 5 is 2.5, so 65 cm is a whole rounding step too far and would itself round to 65. Summer 2025 M4 Q13 was reported as the same slip, with 45 used where 47.5 was needed. Write the half unit down as a number before you use it.",
    source: "ccea-cer:maths:2025-summer:M4:Q13",
  },
];
expect("ftm correct UB", 62.5 * 27.5, 1718.75);
expect("ftm wrong UB", 65 * 30, 1950);
assertNoFailures("t2 ftm");

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", REF, "procedure", "What is the half unit for each of these: nearest whole number, 1 decimal place, 2 decimal places, nearest 10, nearest 5?",
    "0.5, 0.05, 0.005, 5 and 2.5. The half unit is always half of the rounding step.",
    ["half of the step", "0.05", "2.5"], 3),
  rp(T, "02", REF, "trap", "Why is the half unit for 'to the nearest 5' equal to 2.5?",
    "The interval of values that round to it has width 5 and is centred on the stated value, so it reaches 2.5 either side.",
    ["width 5", "centred", "2.5 either side"], 5),
  rp(T, "03", REF, "procedure", "For the greatest possible SUM or PRODUCT of positive measurements, which bounds do you use?",
    "All upper bounds together; for the least, all lower bounds together. Mixing an upper with a lower belongs to subtraction and division, which are M4.",
    ["all upper", "all lower", "never mix"], 4),
  rp(T, "04", REF, "trap", "Where do the bounds go: on the measurements, or on the answer?",
    "On the measurements, before any calculation. Working out the answer first and then adding a half unit to it is the error examiners report most on this topic.",
    ["on the measurements", "before", "not the answer"], 6),
  rp(T, "05", REF, "trap", "The calculator shows 19.4925 for an upper bound. What do you write?",
    "19.4925, in full, with the unit. A bound is never rounded unless the question tells you to; rounding it changes what is being claimed.",
    ["full display", "unit", "not rounded"], 5),
  rp(T, "06", REF, "definition", "A length is 12 cm to the nearest cm. Write the error interval.",
    "$11.5 \\le L < 12.5$. The lower bound is included because 11.5 rounds up to 12; the upper bound is not, because 12.5 rounds up to 13.",
    ["11.5", "12.5", "less than"], 5),
  rp(T, "07", REF, "novel-example", "A rectangle is 9 cm by 4 cm, each to the nearest cm. Upper and lower bounds of the area?",
    "Upper $= 9.5 \\times 4.5 = 42.75 \\text{ cm}^2$; lower $= 8.5 \\times 3.5 = 29.75 \\text{ cm}^2$.",
    ["42.75", "29.75"], 6),
  rp(T, "08", REF, "trap", "Which bounds question belongs to M4, not M3?",
    "Anything where the quantities are subtracted or divided — a difference in lengths, a speed, a density from mass and volume. In M3 the calculation is an addition or a multiplication, so the bounds always pair like with like.",
    ["subtraction", "division", "M4"], 7),
];
expect("rp07 UB", 9.5 * 4.5, 42.75);
expect("rp07 LB", 8.5 * 3.5, 29.75);
assertNoFailures("t2 prompts");

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Note values recomputed: 6.4 ± 0.05 → 6.35/6.45; 14.5 × 9.5 = 137.75 and 13.5 × 8.5 = 114.75 (spread 23 cm²); 8 × 47.5 = 380; 2(5.65 + 3.45) = 18.2; ½(7.25 + 11.65) × 5.05 = 47.7225.",
    examiner: "Traps drawn from the taxonomy examinerEvidence for M3-NA-03 and the bounds findings on packs/maths/insights/m4.upper-and-lower-bounds-subtraction-and-division.json: Summer 2024 M4 Q16 (substituted the given values, formula slips), November 2025 M4 Q17 (bounded the answer, rounded 3.86), Summer 2025 M4 Q13 (nearest-5 half unit).",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, {
    ...base,
    numeric: "14 ± 0.5 → 13.5/14.5; 9 ± 0.5 → 8.5/9.5; UB area 14.5 × 9.5 = 137.75; LB area 13.5 × 8.5 = 114.75; spread 23. Twin: 5.65 × 3.45 = 19.4925.",
    examiner: "Built on Summer 2024 M4 Q16 (candidates substituting the given values) and on the Teacher Guidance example for M3-NA-03.",
  }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, {
    ...base,
    numeric: "45 ± 2.5 → 42.5/47.5; greatest total 8 × 47.5 = 380 kg. Twin: 25 ± 2.5 → 22.5; least total 12 × 22.5 = 270 kg.",
    examiner: "Built on Summer 2025 M4 Q13, where the nearest-5 bound was the reported obstacle.",
  }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "6.4 ± 0.05; 30 ± 2.5; 8.5 × 5.5 = 46.75 and 8.5 × 4.5 = 38.25; 2.45 + 3.75 + 1.95 = 8.15; 5.65 × 3.45 = 19.4925; ½(7.25 + 11.65) × 5.05 = 47.7225.",
    examiner: "Every distractor is a registry misconception from the bounds findings: wrong-half-unit-for-nearest-5, rounded-display, substitute-given-values, bounds-of-answer-not-inputs, both-upper-in-subtraction, misapplied-power-or-coefficient.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the commonErrors reproduce the errors those reports describe.",
  })),
  ...findTheMistake.map((f) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: "60 ± 2.5 → 57.5/62.5; 25 ± 2.5 → 22.5/27.5; correct UB 62.5 × 27.5 = 1718.75; the written (incorrect) 65 × 30 = 1950.",
    examiner: f.source + " — the wrong line reproduces the reported half-unit error.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Values in the prompt answers recomputed: 9.5 × 4.5 = 42.75 and 8.5 × 3.5 = 29.75; the error interval 11.5 ≤ L < 12.5 for 12 cm to the nearest cm.",
    examiner: "Prompts cover the half unit, the pairing rule, bounding the inputs and keeping the full display, all named in the bounds findings.",
  })),
];

// ---------------------------------------------------------------- bundle
const NOT_ON = [
  "Bounds in SUBTRACTION and DIVISION — a difference of two lengths, a speed, a density from mass ÷ volume. That is M4-NA-01, and there the bounds are deliberately mixed",
  "Error intervals written with inequality signs are a convenience, not the CCEA wording: papers ask for 'the upper bound' and 'the lower bound' by name",
  "Truncation (chopping digits off) rather than rounding — not used in this specification",
];
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T, slug: SLUG,
    title: "Upper and lower bounds in addition and multiplication",
    subject: "maths", unit: "M3", tier: "H", strand: "NA",
    statementIds: REF,
    prerequisites: [
      "maths.m5.reading-scales-accuracy-and-imperial-units",
      "maths.m2.decimals-of-any-size-and-significant-figures",
    ],
    order: 96,
    hardness: "S",
    difficulty: 3,
    examinerFlagged: false,
    examinerSources: [
      "ccea-cer:maths:2024-summer:M4:Q16",
      "ccea-cer:maths:2025-november:M4:Q17",
      "ccea-cer:maths:2025-summer:M4:Q13",
    ],
    examWeightHint:
      "One item most series, 2-4 marks, usually in the last third of the paper. The recurring M3 shape is a rectangle measured to a stated accuracy with the range of the area asked for, sometimes wrapped in a 'who is definitely not correct' judgement. M4 raises the same skill into a formula (Summer 2024 Q16, November 2025 Q17) and into subtraction and division.",
    mustMemorise: [
      "Half unit = half the rounding step: nearest 1 → 0.5, 1 d.p. → 0.05, nearest 10 → 5, nearest 5 → 2.5",
      "Bound the measurements, never the answer",
      "Addition and multiplication of positive quantities: all upper bounds together for the maximum, all lower bounds for the minimum",
      "Leave a bound as the full calculator display; do not round it",
      "An exact count (8 crates, 4 sides) has no bounds",
    ],
    onFormulaSheet: [
      "Area of a trapezium ½(a + b)h — given on the Higher sheet, and bounds questions sometimes sit inside it",
      "Volume of a prism, volume and surface area of a sphere, cone volume and curved surface area",
    ],
    notOnThisSpec: NOT_ON,
    externalRefs: externalCer,
    keywords: ["upper bound", "lower bound", "error interval", "degree of accuracy", "half unit", "nearest 5", "bounds of an area"],
  },
  note: {
    id: `note.${T}`, topic: T,
    title: "Upper and lower bounds: adding and multiplying",
    subject: "maths", unit: "M3", tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: ["Area of a trapezium ½(a + b)h", "Volume of a prism = area of cross-section × length"],
      mustKnow: [
        "Half unit = half the rounding step (nearest 5 → 2.5)",
        "Maximum sum or product: every upper bound; minimum: every lower bound",
        "Bound the inputs, not the output; keep the full display",
      ],
    },
    notOnThisSpec: NOT_ON,
    hardness: "S",
    examinerFlagged: false,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Write down the upper and lower bounds of a measurement given to the nearest unit, to the nearest 5 or 10, or to a number of decimal places",
        "Explain why a value stated to the nearest 5 has a half unit of 2.5",
        "Find the greatest and least possible total when several measurements are added",
        "Find the greatest and least possible area or volume when measurements are multiplied",
        "Substitute bounds into a formula from the sheet, such as ½(a + b)h, bounding every letter in it",
        "Decide whether a stated value is possible by comparing it with the interval you have calculated, and say why",
        "Leave a bound as the full calculator display, with its unit",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks), with the same skill re-tested without a calculator in M7 Paper 1. Usually one item of 2-4 marks late in the paper: a rectangle or a total measured to a stated accuracy, with the range of the area or the total asked for, sometimes dressed as a judgement ('which of these three values is definitely not correct, and what mistake has been made'). Schemes give MA1 for the four bounds written down, MA1 for the correct pairing in the calculation, and an A1 for the value with its unit.",
      traps: [
        "Using the whole rounding step instead of half of it, especially 'to the nearest 5' — the reported obstacle in Summer 2025 M4 Q13, where 45 was used in place of 47.5",
        "Calculating with the measured values first and bounding the answer afterwards (November 2025 M4 Q17)",
        "Substituting the given values and never writing a bound at all — reported as what the weakest candidates did in Summer 2024 M4 Q16",
        "Bounding some of the letters in a formula but not all of them (Summer 2024 M4 Q16, November 2024 M4 Q16)",
        "Rounding the bound: 3.86 was written where the whole display was wanted (November 2025 M4 Q17)",
        "Mixing an upper bound with a lower bound in a product — that pairing belongs to the M4 subtraction and division statement, not to this one",
      ],
    },
    verification: `ver.note.${T}`,
    version: 1,
    updated: TODAY,
  },
  workedExamples, diagnostics, questions, findTheMistake, prompts,
  sets: [
    {
      id: `set.${T}.warm-up`, topic: T, kind: "interleaved",
      title: "Bounds warm-up: half units first",
      subject: "maths", units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0002`, `rp.${T}.02`, `q.${T}.0003`],
      showTopicLabels: false, version: 1,
    },
    {
      id: `set.${T}.mixed`, topic: T, kind: "mixed",
      title: "Bounds of areas, totals and formulae",
      subject: "maths", units: ["M3"],
      itemIds: [`q.${T}.0005`, `q.${T}.0006`, `ftm.${T}.01`, `q.${T}.0008`, `q.${T}.0009`, `q.${T}.0010`],
      showTopicLabels: false, version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "Upper and lower bounds: adding and multiplying" },
  {
    type: "callout", kind: "spec", title: "The statement",
    md: "**M3-NA-03** — calculate the upper and lower bounds in calculations involving addition and multiplication of numbers expressed to a given degree of accuracy.\nThe Teacher Guidance names the classic: given the sides of a rectangle correct to the nearest unit, calculate the range of values within which the area lies.",
    source: "CCEA GCSE Mathematics specification, statement M3-NA-03 with its Teacher Guidance",
  },
  {
    type: "p",
    md: "Every measurement is a lie of a useful kind. A ruler that reads 6.4 cm is not telling you the length is 6.4 cm; it is telling you the length is **near** 6.4 cm. This topic is about being exact about how near. Once you can say how far a single measurement might be out, you can say how far a total, an area or a volume might be out — and that is a genuinely useful piece of engineering, not a trick.",
  },
  { type: "h", text: "One measurement: the half unit" },
  {
    type: "p",
    md: "A value rounded to 6.4 came from somewhere in an interval centred on 6.4. The interval is one rounding step wide, so it reaches **half a step** either side. Half a step is the whole topic; get it right and the rest is arithmetic.",
  },
  noteFigure(lineBody, lineAlt, 660, 190,
    "Every length that rounds to 6.4 lies between 6.35 and 6.45", "bounds-number-line"),
  {
    type: "p",
    md: "**The half unit is half the rounding step.**\nNearest whole number → $0.5$. One decimal place → $0.05$. Two decimal places → $0.005$. Nearest 10 → $5$. **Nearest 5 → $2.5$.**\nThat last one costs marks every year. If a crate is 45 kg to the nearest 5 kg, it weighs between $42.5$ kg and $47.5$ kg — not between 40 and 50.\nNotice the two ends behave differently: $6.35$ does round to $6.4$, so the lower bound is included; $6.45$ rounds up to $6.5$, so the upper bound is not. Written as an interval that is $6.35 \\le L < 6.45$. CCEA papers usually ask for 'the upper bound' and 'the lower bound' by name, so the values matter more than the notation.",
  },
  {
    type: "gate", id: "g1", kind: "number",
    prompt: "A sack is 30 kg to the nearest 5 kg. Its lower bound, in kg, is",
    answer: "27.5",
    explain: "Half of 5 is 2.5, so the sack weighs at least 27.5 kg.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2025 M4 Q13",
    md: "A mass given to the nearest 5 kg was the obstacle: 45 was used where 47.5 was needed, and the question fell apart from there. Write the half unit down as a number — '2.5' — before you touch the rest of the question.",
    source: "ccea-cer:maths:2025-summer:M4:Q13",
  },
  { type: "h", text: "Adding: every bound goes the same way" },
  {
    type: "p",
    md: "Three parcels of $2.4$ kg, $3.7$ kg and $1.9$ kg, each to 1 decimal place. The heaviest the load can be is every parcel at its heaviest:\n$2.45 + 3.75 + 1.95 = 8.15$ kg.\nThe lightest is every parcel at its lightest: $2.35 + 3.65 + 1.85 = 7.85$ kg.\nThree parcels means three half units, so the total is uncertain by $0.15$ kg either way, not by $0.05$. That is the whole reason bounds go on the **measurements** and not on the answer.",
  },
  {
    type: "gate", id: "g2", kind: "choice",
    prompt: "Which is the upper bound of $2.4 + 3.7 + 1.9$ with each value to 1 d.p.?",
    options: ["8.15", "8.05", "8.5"],
    answer: "8.15",
    explain: "Each of the three has its own 0.05, so the total gains 0.15.",
  },
  { type: "h", text: "Multiplying: the biggest rectangle you could be holding" },
  {
    type: "p",
    md: "A tray measured 14 cm by 9 cm, each to the nearest centimetre. The area grows if either side grows, so the greatest area uses **both** upper bounds and the least uses both lower bounds.",
  },
  noteFigure(areaBody, areaAlt, 660, 356,
    "The largest rectangle the measurements allow: 14.5 cm by 9.5 cm", "bounds-area-model"),
  {
    type: "p",
    md: "Upper bound of area $= 14.5 \\times 9.5 = 137.75 \\text{ cm}^2$.\nLower bound of area $= 13.5 \\times 8.5 = 114.75 \\text{ cm}^2$.\nThose two are 23 cm² apart, from a measurement that looked exact. Rounding to the nearest centimetre is a surprisingly blunt instrument once two lengths are multiplied.",
  },
  {
    type: "callout", kind: "why", title: "Why 'all upper' is right here but not in M4",
    md: "Multiplying and adding are both **increasing**: make any input bigger and the answer gets bigger. So the extremes line up — all upper together, all lower together.\nSubtracting and dividing are not. $a - b$ gets bigger when $b$ gets **smaller**, so the maximum pairs the upper bound of $a$ with the lower bound of $b$. That is statement M4-NA-01, a separate topic; in M3 you never need to mix them.",
  },
  {
    type: "gate", id: "g3", kind: "choice",
    prompt: "A rectangle is 8 cm by 5 cm to the nearest cm. The greatest possible area is",
    options: ["$8.5 \\times 5.5 = 46.75$", "$8.5 \\times 4.5 = 38.25$", "$8 \\times 5 = 40$"],
    answer: "$8.5 \\times 5.5 = 46.75$",
    explain: "Both sides at their largest. Mixing bounds is for subtraction and division.",
  },
  { type: "h", text: "Bounds inside a formula" },
  {
    type: "p",
    md: "The step up is a formula with three measurements in it. A trapezium-shaped bed has parallel sides $7.2$ m and $11.6$ m and height $5.0$ m, each to 1 decimal place. The formula sheet gives $\\tfrac{1}{2}(a+b)h$, and all three letters are measurements, so all three get bounded:\n$\\tfrac{1}{2}(7.25 + 11.65) \\times 5.05 = \\tfrac{1}{2} \\times 18.9 \\times 5.05 = 47.7225 \\text{ m}^2$.\nRead the formula symbol by symbol first. The reported losses here are never about bounds: they are about forgetting the $\\tfrac{1}{2}$, or bounding two letters and leaving the third alone.",
  },
  {
    type: "callout", kind: "examiner", title: "Summer 2024 M4 Q16 and November 2024 M4 Q16",
    md: "The bounds themselves were mostly right. Marks went on the formula: a letter not squared, a coefficient not doubled, and the weakest answers simply substituted the values as given and never bounded anything.",
    source: "ccea-cer:maths:2024-summer:M4:Q16",
  },
  {
    type: "gate", id: "g4", kind: "number",
    prompt: "$\\tfrac{1}{2}(7.25 + 11.65) \\times 5.05$ — work out the bracket first. $7.25 + 11.65 = $",
    answer: "18.9",
    explain: "Then halve it (9.45) and multiply by 5.05 to reach 47.7225.",
  },
  { type: "h", text: "Two habits that cost the accuracy mark" },
  {
    type: "p",
    md: "**Do not bound the answer.** Work out $5.6 \\times 3.4 = 19.04$ and then add $0.05$, and you get $19.09$, which is nothing. The bounds belong on $5.6$ and $3.4$, giving $5.65 \\times 3.45 = 19.4925$.\n**Do not round a bound.** $19.4925$ is the answer. Writing $19.5$ says the area could reach $19.5 \\text{ m}^2$, and it cannot. Unless the question asks for an accuracy, the full display goes on the answer line with its unit.",
  },
  {
    type: "callout", kind: "examiner", title: "November 2025 M4 Q17",
    md: "About three in ten scored full marks. Many worked with the given values and bounded the result afterwards, and most who got to the end rounded it instead of leaving the display as it stood.",
    source: "ccea-cer:maths:2025-november:M4:Q17",
  },
  {
    type: "gate", id: "g5", kind: "choice",
    prompt: "Your calculator shows 20.049375 for an upper bound. What goes on the answer line?",
    options: ["20.049375", "20.05", "20"],
    answer: "20.049375",
    explain: "A bound is exact. Round it only when the question tells you to.",
  },
  {
    type: "callout", kind: "mustknow", title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** areas and volumes you may need to bound — the trapezium $\\tfrac{1}{2}(a+b)h$, the prism, the sphere and the cone.\n**Must be known:** the half unit is half the rounding step; addition and multiplication take all upper bounds together for the maximum and all lower bounds for the minimum; an exact count has no bounds.",
  },
  {
    type: "callout", kind: "notonspec", title: "Not on this spec",
    md: "M3-NA-03 is addition and multiplication only. Bounds in a **subtraction** or a **division** — a difference in lengths, a speed, a density — belong to M4-NA-01, and only there do you pair an upper bound with a lower one. Truncation is not used in this specification.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "Expect one item of 2-4 marks in the last third of M3, and the same skill again with no calculator in M7 Paper 1. The commonest shape is a rectangle measured to a stated accuracy with the range of the area wanted; a variant gives three suggested values and asks which is **definitely not** possible, with a reason.\nThe **first** mark is for the bounds written down, so write all four before anything else: a correct set of bounds with a slip afterwards still scores. The **last** mark is the value with its unit and no rounding. If you are stuck, write the half unit and the four bounds anyway — that is usually a mark in hand.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.03` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.05` },
];

assertNoFailures("t2 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
