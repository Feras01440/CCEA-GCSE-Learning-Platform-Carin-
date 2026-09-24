/** maths.m3.hcf-and-lcm-from-prime-factor-form — S bundle (difficulty 3). */
import {
  M3, M7P1, ver, question, M, A, MA, numAnswer, algAnswer, textAnswer, rp, dxItem, svgFig, noteFigure,
  writeBundle, externalCer, expect, assertNoFailures, hcf, lcm, primes, powerPlain, TODAY, TXT, MATHTXT,
} from "./lib.mjs";

const T = "maths.m3.hcf-and-lcm-from-prime-factor-form";
const SLUG = "hcf-and-lcm-from-prime-factor-form";
const REF = ["M3-NA-01"];

// ---------------------------------------------------------------- recomputed numbers
const pairs = {};
for (const [a, b] of [[84, 90], [100, 120], [45, 60], [84, 126], [5500, 9680], [360, 84], [96, 108],
                      [18, 24], [126, 198], [24, 18], [550, 396], [15, 25], [12, 20], [60, 126]]) {
  pairs[`${a}/${b}`] = { h: hcf(a, b), l: lcm(a, b), pa: powerPlain(primes(a)), pb: powerPlain(primes(b)) };
}
expect("hcf 84,90", pairs["84/90"].h, 6);
expect("lcm 84,90", pairs["84/90"].l, 1260);
expect("hcf 100,120", pairs["100/120"].h, 20);
expect("lcm 100,120", pairs["100/120"].l, 600);
expect("hcf 45,60", pairs["45/60"].h, 15);
expect("lcm 45,60", pairs["45/60"].l, 180);
expect("hcf 84,126", pairs["84/126"].h, 42);
expect("lcm 84,126", pairs["84/126"].l, 252);
expect("hcf 5500,9680", pairs["5500/9680"].h, 220);
expect("lcm 5500,9680", pairs["5500/9680"].l, 242000);
expect("hcf 360,84", pairs["360/84"].h, 12);
expect("lcm 96,108", pairs["96/108"].l, 864);
expect("hcf 96,108", pairs["96/108"].h, 12);
expect("lcm 18,24", pairs["18/24"].l, 72);
expect("hcf 126,198", pairs["126/198"].h, 18);
expect("pieces 126/18 + 198/18", 126 / 18 + 198 / 18, 18);
expect("lcm 24,18", pairs["24/18"].l, 72);
expect("badge packs", 72 / 24, 3);
expect("ribbon packs", 72 / 18, 4);
expect("hcf 550,396", pairs["550/396"].h, 22);
expect("lcm 550,396", pairs["550/396"].l, 9900);
expect("lcm 15,25", pairs["15/25"].l, 75);
expect("strips", 75 / 15, 5);
expect("card packs", 75 / 25, 3);
expect("lcm 12,20", pairs["12/20"].l, 60);
expect("hcf 60,126", pairs["60/126"].h, 6);
expect("lcm 60,126", pairs["60/126"].l, 1260);
expect("360 index", powerPlain(primes(360)), "2³ × 3² × 5");
expect("550 index", powerPlain(primes(550)), "2 × 5² × 11");
expect("396 index", powerPlain(primes(396)), "2² × 3² × 11");
assertNoFailures("t1-hcf-lcm numbers");

// ---------------------------------------------------------------- figures
const vennBody = `
<g fill='currentColor' fill-opacity='0.06' stroke='currentColor' stroke-width='1.6'>
  <circle cx='210' cy='150' r='110'/><circle cx='330' cy='150' r='110'/>
</g>
<g ${MATHTXT} font-size='19' text-anchor='middle'>
  <text x='150' y='140'>2</text><text x='150' y='175'>7</text>
  <text x='270' y='140'>2</text><text x='270' y='175'>3</text>
  <text x='390' y='140'>3</text><text x='390' y='175'>5</text>
</g>
<g ${TXT} font-size='16' text-anchor='middle'>
  <text x='120' y='34'>84 = 2 x 2 x 3 x 7</text><text x='420' y='34'>90 = 2 x 3 x 3 x 5</text>
  <text x='270' y='112'>shared</text>
  <text x='270' y='292'>HCF = 2 x 3 = 6</text>
  <text x='270' y='316'>LCM = 2 x 3 x 2 x 7 x 3 x 5 = 1260</text>
</g>
<g stroke='currentColor' stroke-width='1' stroke-dasharray='4 3' fill='none'>
  <path d='M270 190 L270 274'/>
</g>`;
const venn = (w = 540, h = 330) => ({ body: vennBody, w, h });
const vennAlt =
  "Two overlapping circles. The left-only region holds the primes 2 and 7, the overlap holds 2 and 3, the right-only region holds 3 and 5. Labels read 84 = 2 x 2 x 3 x 7 and 90 = 2 x 3 x 3 x 5, with HCF = 2 x 3 = 6 and LCM = 2 x 3 x 2 x 7 x 3 x 5 = 1260 underneath.";
const vennFig = svgFig(venn().body, vennAlt, venn().w, venn().h);

const towerBody = `
<g ${TXT} font-size='17'>
  <text x='16' y='30'>prime</text><text x='130' y='30'>in 5500</text><text x='270' y='30'>in 9680</text>
  <text x='410' y='30'>HCF takes</text><text x='560' y='30'>LCM takes</text>
  <text x='16' y='68'>2</text><text x='130' y='68'>2 squared</text><text x='270' y='68'>2 to the 4</text>
  <text x='410' y='68'>2 squared</text><text x='560' y='68'>2 to the 4</text>
  <text x='16' y='104'>5</text><text x='130' y='104'>5 cubed</text><text x='270' y='104'>5</text>
  <text x='410' y='104'>5</text><text x='560' y='104'>5 cubed</text>
  <text x='16' y='140'>11</text><text x='130' y='140'>11</text><text x='270' y='140'>11 squared</text>
  <text x='410' y='140'>11</text><text x='560' y='140'>11 squared</text>
  <text x='16' y='186'>lowest power for the HCF, highest power for the LCM</text>
</g>
<g stroke='currentColor' stroke-width='1.2'>
  <path d='M10 42 L700 42'/><path d='M395 12 L395 158'/><path d='M545 12 L545 158'/>
</g>`;
const towerAlt =
  "A five-column table listing the primes 2, 5 and 11 with their powers in 5500 and in 9680, then the power the HCF takes (the lower one) and the power the LCM takes (the higher one).";
const towerFig = svgFig(towerBody, towerAlt, 710, 200);

// ---------------------------------------------------------------- verification detail
const base = {
  scope: "Higher tier, M3 statement M3-NA-01. Numbers are given as products of primes or are small enough to factorise; no algebraic HCF/LCM, which is outside this statement.",
  formula: "Nothing on the Higher formula sheet applies; the HCF and LCM rules are must-know facts.",
  command: "Command words taken from packs/maths/exam-true/command-words.json (Write down, Find, Work out, Calculate, Express).",
  tariff: "Tariffs match the M3 pattern read in the corpus: product of primes 2 marks, HCF 2 marks, LCM 2-3 marks, LCM-in-context 3 marks (packs/maths/exam-true/tariffs.json M3 perPart typical 2, p90 4).",
  copy: "Compared by hand against the M3 and M4 papers and schemes read for this batch (Summer 2025 M3, Summer 2024 M3, November 2025 M3, Summer 2022 M3): new numbers, new contexts and new wording throughout; no eight-word sequence in common.",
};

// ---------------------------------------------------------------- worked examples
const workedExamples = [
  {
    id: `we.${T}.01`,
    topic: T,
    specRefs: REF,
    paper: M3,
    stem: "$84 = 2^2 \\times 3 \\times 7$ and $90 = 2 \\times 3^2 \\times 5$.\n\nFind the highest common factor and the lowest common multiple of 84 and 90.",
    figure: vennFig,
    steps: [
      {
        n: 1,
        working: "Write each number as a list of primes: $84 = 2 \\times 2 \\times 3 \\times 7$, $90 = 2 \\times 3 \\times 3 \\times 5$",
        decision: "Index form is compact, but a plain list makes the matching visible. Every prime in the list has to be placed somewhere in the diagram exactly once.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "Shared primes (one 2 and one 3) go in the overlap. What is left over goes outside: 2 and 7 on the 84 side, 3 and 5 on the 90 side.",
        decision: "84 has two 2s and 90 has one, so only one 2 can be shared; the spare 2 belongs to 84 alone. The same logic puts the spare 3 on the 90 side.",
        whyMenu: {
          options: [
            "Because the overlap can only hold as many copies of a prime as the number with fewer of them has",
            "Because the overlap always holds one copy of every prime that appears",
            "Because 84 is the larger power so it keeps both of its 2s",
          ],
          correct: 0,
          explain: "A common factor has to divide both numbers, so it can use a prime only as many times as the smaller supply allows.",
        },
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "$\\text{HCF} = 2 \\times 3 = 6$",
        decision: "The HCF is the overlap multiplied out. Nothing outside the overlap can be in it, because those primes are missing from one of the two numbers.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: "$\\text{LCM} = 6 \\times (2 \\times 7) \\times (3 \\times 5) = 6 \\times 14 \\times 15 = 1260$",
        decision: "The LCM is everything in the diagram: the overlap once, plus each outside region. Written in index form that is $2^2 \\times 3^2 \\times 5 \\times 7$, the highest power of each prime.",
        whyMenu: {
          options: [
            "The overlap is used once, not twice, because the shared primes are the same primes",
            "The overlap is used twice, once for each circle",
            "The overlap is left out of the LCM",
          ],
          correct: 0,
          explain: "$84 \\times 90 = 7560$ counts the shared factor 6 twice; dividing by that 6 gives 1260.",
        },
        earns: ["MA1"],
      },
    ],
    finalAnswer: "HCF = 6, LCM = 1260",
    twin: {
      stem: "$100 = 2^2 \\times 5^2$ and $120 = 2^3 \\times 3 \\times 5$. Find the lowest common multiple of 100 and 120.",
      answer: numAnswer(600, { tolerance: { type: "exact" } }),
    },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }],
    verification: `ver.we.${T}.01`,
    version: 1,
  },
  {
    id: `we.${T}.02`,
    topic: T,
    specRefs: REF,
    paper: M3,
    stem: "Stickers are sold in strips of 15. Reward cards are sold in packs of 25.\n\nMr Hanna needs the same number of stickers as reward cards, with none left over, and he wants to buy as few as possible.\n\nHow many strips of stickers does he buy?",
    steps: [
      {
        n: 1,
        working: "$15 = 3 \\times 5$ and $25 = 5 \\times 5$",
        decision: "Same number of each, none left over, as few as possible: that is the lowest common multiple. Prime factors first, so the LCM is read off rather than guessed.",
        earns: ["MA1"],
      },
      {
        n: 2,
        working: "$\\text{LCM} = 3 \\times 5 \\times 5 = 75$",
        decision: "Highest power of each prime: one 3 and two 5s. So 75 stickers and 75 cards is the smallest matching total.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: "Strips of stickers $= 75 \\div 15 = 5$",
        decision: "The question asks for strips, not stickers. This is the division the examiners keep reporting as the missing last line.",
        whyMenu: {
          options: [
            "75 is the number of stickers; dividing by 15 turns it into strips",
            "75 is already the number of strips",
            "The number of strips is 75 x 15",
          ],
          correct: 0,
          explain: "The LCM answers 'how many stickers'; one more division answers the question that was asked.",
        },
        earns: ["MA1"],
      },
    ],
    finalAnswer: "5 strips (75 stickers and 3 packs of cards)",
    twin: {
      stem: "Pens come in boxes of 12 and pen lids come in bags of 20. Ciara wants equal numbers of pens and lids with none left over, buying as few as possible. How many boxes of pens does she buy?",
      answer: numAnswer(5, { tolerance: { type: "exact" } }),
    },
    faded: [{ showSteps: 1, studentSupplies: [2, 3] }],
    verification: `ver.we.${T}.02`,
    version: 1,
  },
];

// ---------------------------------------------------------------- diagnostics
const diagnostics = [
  {
    id: `dx.${T}`,
    topic: T,
    specRefs: REF,
    when: "pre",
    items: [
      dxItem("01",
        "$\\text{Given } 45 = 3^2 \\times 5 \\text{ and } 60 = 2^2 \\times 3 \\times 5\\text{, what is the HCF of 45 and 60?}$",
        "Read the HCF from two prime factorisations",
        [
          ["$15$", true, null, "Both numbers contain a 3 and a 5, and nothing else in common, so the HCF is 3 x 5 = 15."],
          ["$180$", false, "maths.hcf-lcm.swapped", "That is the LCM. The HCF is the product of only the primes both numbers share, so it is never larger than either number."],
          ["$45$", false, "maths.hcf-lcm.unshared-prime-in-hcf", "45 uses two 3s but 60 has only one, so the second 3 cannot be in a common factor. Take the lower power of each shared prime."],
        ], 20),
      dxItem("02",
        "$\\text{Given } 45 = 3^2 \\times 5 \\text{ and } 60 = 2^2 \\times 3 \\times 5\\text{, what is the LCM of 45 and 60?}$",
        "Read the LCM from two prime factorisations",
        [
          ["$180$", true, null, "Highest power of each prime: 2² x 3² x 5 = 180. It is a multiple of both, and the smallest one."],
          ["$2700$", false, "maths.hcf-lcm.product-as-lcm", "That is 45 x 60. Multiplying the numbers always gives a common multiple, but the shared factor 15 has been counted twice, so it is 15 times too big."],
          ["$15$", false, "maths.hcf-lcm.swapped", "That is the HCF. A common multiple has to be at least as large as each number."],
        ], 25),
      dxItem("03",
        "$\\text{Two numbers are } 2^3 \\times 5^2 \\times 7 \\text{ and } 2^5 \\times 5 \\times 11\\text{. Which power of 2 goes in the HCF?}$",
        "Choose the lower power of a shared prime for the HCF",
        [
          ["$2^3$", true, null, "The first number contains only three 2s, so a common factor cannot use more than three. Lowest power for the HCF."],
          ["$2^5$", false, "maths.hcf-lcm.highest-power-for-hcf", "2⁵ = 32 does not divide the first number, so it cannot be a common factor. Highest power is the LCM rule, not the HCF rule."],
          ["$2^8$", false, "maths.hcf-lcm.highest-power-for-hcf", "The indices were added, which is the rule for multiplying the two numbers together. For the HCF, compare the powers and keep the lower."],
        ], 25),
      dxItem("04",
        "Buns come in packs of 8 and burgers in packs of 6. Sean wants equal numbers with none left over, buying as few as possible. How many **packs of buns** does he buy?",
        "Answer the question asked after finding the LCM",
        [
          ["3", true, null, "LCM(8, 6) = 24, so 24 of each; packs of buns = 24 ÷ 8 = 3. The division at the end is the mark most often lost."],
          ["24", false, "maths.hcf-lcm.stop-at-lcm", "24 is the number of buns, not the number of packs. One more division turns the common multiple into the answer the question asked for."],
          ["4", false, "maths.hcf-lcm.stop-at-lcm", "4 is the number of packs of burgers (24 ÷ 6). Check which item the question names before writing the answer."],
        ], 35),
      dxItem("05",
        "Two ribbons, 126 cm and 198 cm, are cut into equal whole-centimetre pieces with none wasted. What is the **longest** each piece can be?",
        "Recognise an HCF problem from its wording",
        [
          ["18 cm", true, null, "126 = 2 x 3² x 7 and 198 = 2 x 3² x 11, so the HCF is 2 x 9 = 18. 'Longest equal piece, nothing wasted' is always the HCF."],
          ["1386 cm", false, "maths.hcf-lcm.swapped", "That is the LCM, which is longer than either ribbon, so no piece could be that size. 'Cut into equal pieces' means a common factor."],
          ["9 cm", false, "maths.hcf-lcm.unshared-prime-in-hcf", "9 divides both, but so does 18, and the question asks for the longest. The shared 2 has been left out."],
        ], 35),
    ],
  },
];

// ---------------------------------------------------------------- questions
const questions = [
  question({
    id: `q.${T}.0001`, topic: T, specRefs: REF, style: "practice", difficulty: 1,
    commandWords: ["Write down"], setting: "Pure number, two factorisations given",
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q20b"],
    solutionProgram: "shared primes of 3^2*5 and 2^2*3*5 = 3 and 5; HCF = 3*5 = 15; gcd(45,60) = 15",
    parts: [{
      id: "main", verb: "write-down", marks: 1,
      stem: "$45 = 3^2 \\times 5$ and $60 = 2^2 \\times 3 \\times 5$\n\nWrite down the highest common factor of 45 and 60.",
      answer: numAnswer(15),
      scheme: [A("A1", 1, "15")],
      hints: ["Which primes appear in both lists?", "One 3 and one 5 are in both; 45 has no 2s at all."],
      workedSolution: "Both numbers contain a 3 and a 5. 45 has a second 3 that 60 does not, and 60 has 2s that 45 does not. $\\text{HCF} = 3 \\times 5 = 15$.",
      commonErrors: [{
        misconception: "maths.hcf-lcm.swapped",
        pattern: { kind: "numeric" },
        feedback: "180 is the lowest common multiple. The highest common factor divides into both numbers, so it can never be bigger than 45.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2024-summer:M3:Q20b",
      }],
      requiresWorking: false,
    }],
  }),
  question({
    id: `q.${T}.0002`, topic: T, specRefs: REF, style: "practice", difficulty: 2,
    commandWords: ["Find"], setting: "Pure number, two factorisations given",
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q9"],
    solutionProgram: "LCM(3^2*5, 2^2*3*5) = 2^2*3^2*5 = 180; lcm(45,60) = 45*60/15 = 180",
    parts: [{
      id: "main", verb: "find", marks: 2,
      stem: "$45 = 3^2 \\times 5$ and $60 = 2^2 \\times 3 \\times 5$\n\nFind the lowest common multiple of 45 and 60.",
      answer: numAnswer(180),
      scheme: [
        MA("MA1", 1, "highest power of each prime seen: 2² × 3² × 5 (or an equivalent list 2 × 2 × 3 × 3 × 5)"),
        MA("MA2", 1, "180"),
      ],
      hints: ["Take every prime that appears in either list.", "For a prime in both lists, keep the higher power: 3² beats 3."],
      workedSolution: "$\\text{LCM} = 2^2 \\times 3^2 \\times 5 = 4 \\times 9 \\times 5 = 180$.",
      commonErrors: [{
        misconception: "maths.hcf-lcm.product-as-lcm",
        pattern: { kind: "numeric" },
        feedback: "$45 \\times 60 = 2700$ is a common multiple, but not the lowest: the shared factor 15 has been counted twice. Dividing by 15 gives 180.",
        marksTypicallyEarned: 0,
        source: "ccea-cer:maths:2025-summer:M4:Q9",
      }],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0003`, topic: T, specRefs: REF, style: "practice", difficulty: 2,
    commandWords: ["Find"], setting: "Pure number, two factorisations given, two parts",
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q20b"],
    solutionProgram: "84 = 2^2*3*7, 126 = 2*3^2*7; HCF = 2*3*7 = 42; LCM = 2^2*3^2*7 = 252; gcd(84,126) = 42; lcm = 84*126/42 = 252",
    parts: [
      {
        id: "a", verb: "find", marks: 2,
        stem: "$84 = 2^2 \\times 3 \\times 7$ and $126 = 2 \\times 3^2 \\times 7$\n\nFind the highest common factor of 84 and 126.",
        answer: numAnswer(42),
        scheme: [MA("MA1", 1, "lowest power of each shared prime identified: 2 × 3 × 7"), MA("MA2", 1, "42")],
        hints: ["Three primes appear in both: 2, 3 and 7.", "84 has one 3 and 126 has one 2, so only one of each can be shared."],
        workedSolution: "Shared primes at their lower powers: $2 \\times 3 \\times 7 = 42$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.highest-power-for-hcf",
          pattern: { kind: "numeric" },
          feedback: "That uses the higher power of 2 and of 3, which is the LCM rule. A common factor may only use a prime as often as the number with fewer copies of it.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q5b",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 2,
        stem: "Find the lowest common multiple of 84 and 126.",
        answer: numAnswer(252),
        scheme: [MA("MA1", 1, "highest power of each prime seen: 2² × 3² × 7"), MA("MA2", 1, "252")],
        hints: ["Every prime in either list, at its higher power.", "Or use HCF × LCM = 84 × 126."],
        workedSolution: "$\\text{LCM} = 2^2 \\times 3^2 \\times 7 = 4 \\times 9 \\times 7 = 252$. As a check, $84 \\times 126 \\div 42 = 252$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.swapped",
          pattern: { kind: "numeric" },
          feedback: "42 is the answer to part (a). The multiple has to be a number both 84 and 126 divide into, so it is larger than both.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M4:Q5b",
        }],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0004`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Write down", "Express"], emphasis: ["in index form"],
    setting: "Pure number, large numbers given only in index form",
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q2"],
    solutionProgram: "A = 2^2*5^3*11 = 5500, B = 2^4*5*11^2 = 9680; HCF = 2^2*5*11 = 220; LCM = 2^4*5^3*11^2 = 242000; gcd(5500,9680) = 220; 5500*9680/220 = 242000",
    figures: [towerFig],
    parts: [
      {
        id: "a", verb: "write-down", marks: 2,
        stem: "$A = 2^2 \\times 5^3 \\times 11$ and $B = 2^4 \\times 5 \\times 11^2$\n\nWrite down the highest common factor of $A$ and $B$ in index form.",
        answer: algAnswer("2^2 \\times 5 \\times 11", { variables: [] }),
        scheme: [
          MA("MA1", 1, "lower power of at least two of the three primes chosen"),
          MA("MA2", 1, "2² × 5 × 11 (accept 220)"),
        ],
        hints: ["Compare the powers prime by prime and keep the lower one each time.", "For 2: min(2, 4). For 5: min(3, 1). For 11: min(1, 2)."],
        workedSolution: "Lower power of each shared prime: $2^2$, $5^1$, $11^1$, so the HCF is $2^2 \\times 5 \\times 11 = 220$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.highest-power-for-hcf",
          pattern: { kind: "numeric" },
          feedback: "The higher power was taken each time, which builds the LCM. Keeping the lower power gives 2² × 5 × 11.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q2",
        }],
        requiresWorking: false,
      },
      {
        id: "b", verb: "write-down", marks: 2,
        stem: "Write down the lowest common multiple of $A$ and $B$ in index form.",
        answer: algAnswer("2^4 \\times 5^3 \\times 11^2", { variables: [] }),
        scheme: [
          MA("MA1", 1, "higher power of at least two of the three primes chosen"),
          MA("MA2", 1, "2⁴ × 5³ × 11² (accept 242 000)"),
        ],
        hints: ["Same three primes, higher power each time.", "Leaving it in index form is safer than multiplying out."],
        workedSolution: "Higher power of each prime: $2^4 \\times 5^3 \\times 11^2 = 242\\,000$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.product-as-lcm",
          pattern: { kind: "numeric" },
          feedback: "$A \\times B$ adds the indices, so every shared factor is counted twice. The LCM takes the higher power, not the sum.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q2",
        }],
        requiresWorking: false,
      },
    ],
  }),
  question({
    id: `q.${T}.0005`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Express", "Find"], emphasis: ["as a product of its prime factors"],
    setting: "Pure number, one number must be factorised first",
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q9"],
    solutionProgram: "360 = 2^3*3^2*5; 84 = 2^2*3*7; HCF = 2^2*3 = 12; gcd(360,84) = 12",
    parts: [
      {
        id: "a", verb: "express", marks: 2,
        stem: "Express 360 as a product of its prime factors. Give your answer in index form.",
        answer: algAnswer("2^3 \\times 3^2 \\times 5", { variables: [] }),
        scheme: [
          MA("MA1", 1, "a correct factor tree or repeated division reaching 2 × 2 × 2 × 3 × 3 × 5"),
          MA("MA2", 1, "2³ × 3² × 5"),
        ],
        hints: ["Divide by 2 as long as you can, then by 3, then by 5.", "360 → 180 → 90 → 45 → 15 → 5 → 1."],
        workedSolution: "$360 = 2 \\times 180 = 2^2 \\times 90 = 2^3 \\times 45 = 2^3 \\times 3^2 \\times 5$.",
        commonErrors: [{
          misconception: "maths.presentation.answer-without-working",
          pattern: { kind: "text", regex: "^\\s*36\\s*(x|\\\\times)\\s*10\\s*$" },
          feedback: "36 and 10 are factors but not prime factors. Keep splitting until every number left is prime.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M4:Q9",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 2,
        stem: "$84 = 2^2 \\times 3 \\times 7$\n\nFind the highest common factor of 360 and 84.",
        answer: numAnswer(12),
        scheme: [
          MA("MA1", 1, "shared primes at their lower powers: 2² × 3", { ft: true }),
          MA("MA2", 1, "12", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Use your answer to part (a) and compare it with 2² × 3 × 7.", "7 is only in 84, and 5 is only in 360, so neither can be in the HCF."],
        workedSolution: "$360 = 2^3 \\times 3^2 \\times 5$ and $84 = 2^2 \\times 3 \\times 7$. Shared: $2^2$ and $3$, so the HCF is 12.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.unshared-prime-in-hcf",
          pattern: { kind: "numeric" },
          feedback: "84 contains a 7, and 360 does not, so 84 cannot divide 360. Cross out any prime that is missing from one of the lists.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2023-summer:M4:Q9",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  question({
    id: `q.${T}.0006`, topic: T, specRefs: REF, style: "practice", difficulty: 2, paper: M7P1,
    commandWords: ["Work out"], setting: "Pure number, non-calculator friendly",
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q20b"],
    solutionProgram: "96 = 2^5*3, 108 = 2^2*3^3; HCF = 2^2*3 = 12; LCM = 2^5*3^3 = 864; gcd(96,108) = 12; 96*108/12 = 864",
    parts: [
      {
        id: "a", verb: "work-out", marks: 2,
        stem: "$96 = 2^5 \\times 3$ and $108 = 2^2 \\times 3^3$\n\nWork out the highest common factor of 96 and 108.",
        answer: numAnswer(12),
        scheme: [MA("MA1", 1, "2² × 3 identified"), MA("MA2", 1, "12")],
        hints: ["Lower power of 2, lower power of 3.", "min(5, 2) = 2 and min(1, 3) = 1."],
        workedSolution: "$2^2 \\times 3 = 4 \\times 3 = 12$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.highest-power-for-hcf",
          pattern: { kind: "numeric" },
          feedback: "The higher powers were used, giving the LCM. The HCF has to divide 96, and 864 does not.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M3:Q20b",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "work-out", marks: 2,
        stem: "Work out the lowest common multiple of 96 and 108.",
        answer: numAnswer(864),
        scheme: [MA("MA1", 1, "2⁵ × 3³ identified"), MA("MA2", 1, "864")],
        hints: ["Higher power of 2, higher power of 3.", "$32 \\times 27$: double 27 five times."],
        workedSolution: "$2^5 \\times 3^3 = 32 \\times 27 = 864$. Without a calculator, $32 \\times 27 = 32 \\times 27 = (32 \\times 20) + (32 \\times 7) = 640 + 224 = 864$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.product-as-lcm",
          pattern: { kind: "numeric" },
          feedback: "$96 \\times 108$ is a common multiple but counts the shared 12 twice. Dividing by 12 gives 864.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M3:Q20b",
        }],
        requiresWorking: true,
      },
    ],
  }),
  question({
    id: `q.${T}.0007`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Work out"], setting: "Two safety lights on a harbour wall",
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q23"],
    solutionProgram: "18 = 2*3^2, 24 = 2^3*3; LCM = 2^3*3^2 = 72 seconds; lcm(18,24) = 72; 72 s = 1 min 12 s",
    parts: [{
      id: "main", verb: "work-out", marks: 3,
      stem: "Two safety lights on a harbour wall are switched on at the same moment.\n\nThe first light flashes every 18 seconds. The second flashes every 24 seconds.\n\nWork out how long it is until they flash together again. Give your answer in minutes and seconds.",
      answer: textAnswer(
        ["1 minute 12 seconds", "1 min 12 s", "1 min 12 sec"],
        [{ any: ["1 min", "1 minute"], marks: 1 }, { any: ["12 s", "12 sec"], marks: 1 }],
      ),
      scheme: [
        MA("MA1", 1, "18 = 2 × 3² and 24 = 2³ × 3, or a list of multiples of both"),
        MA("MA2", 1, "LCM = 2³ × 3² = 72 (seconds)"),
        MA("MA3", 1, "1 minute 12 seconds", { ft: true, dependsOn: ["MA2"] }),
      ],
      hints: ["Together again means a time that is a multiple of both 18 and 24.", "Prime factors: 18 = 2 × 3 × 3, 24 = 2 × 2 × 2 × 3.", "72 seconds still has to be written in minutes and seconds."],
      workedSolution: "$18 = 2 \\times 3^2$ and $24 = 2^3 \\times 3$, so the LCM is $2^3 \\times 3^2 = 72$ seconds. $72 = 60 + 12$, so they flash together after 1 minute 12 seconds.",
      commonErrors: [
        {
          misconception: "maths.hcf-lcm.stop-at-lcm",
          pattern: { kind: "numeric" },
          feedback: "72 seconds is right, and it earns two of the three marks. The last mark is for writing it as 1 minute 12 seconds, because the question asks for minutes and seconds.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M3:Q23",
        },
        {
          misconception: "maths.hcf-lcm.swapped",
          pattern: { kind: "numeric" },
          feedback: "6 is the highest common factor. The lights coincide at a common multiple, so the number you want is larger than both 18 and 24.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M3:Q23",
        },
      ],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0008`, topic: T, specRefs: REF, style: "practice", difficulty: 3,
    commandWords: ["Calculate"], emphasis: ["longest"], setting: "Two lengths of ribbon cut for a craft class",
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q20b"],
    solutionProgram: "126 = 2*3^2*7, 198 = 2*3^2*11; HCF = 2*3^2 = 18; gcd(126,198) = 18; pieces = 126/18 + 198/18 = 7 + 11 = 18",
    parts: [
      {
        id: "a", verb: "calculate", marks: 3,
        stem: "Two lengths of ribbon measure 126 cm and 198 cm.\n\nThey are cut into equal pieces, each a whole number of centimetres, with no ribbon wasted.\n\nCalculate the longest possible length of each piece.",
        answer: numAnswer(18, { unit: "cm", unitRequired: true }),
        scheme: [
          MA("MA1", 1, "126 = 2 × 3² × 7 and 198 = 2 × 3² × 11 (or a correct factor list for both)"),
          MA("MA2", 1, "shared primes 2 × 3² identified"),
          A("A1", 1, "18 cm", { dependsOn: ["MA2"] }),
        ],
        hints: ["Equal pieces, nothing wasted: the length has to divide both numbers.", "Longest possible means the highest such number.", "126 = 2 × 63 = 2 × 9 × 7; 198 = 2 × 99 = 2 × 9 × 11."],
        workedSolution: "$126 = 2 \\times 3^2 \\times 7$ and $198 = 2 \\times 3^2 \\times 11$. Shared: $2 \\times 3^2 = 18$. Each piece is 18 cm.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.swapped",
          pattern: { kind: "numeric" },
          feedback: "1386 is the lowest common multiple, and it is longer than either ribbon. Cutting into equal pieces is always a common factor.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M3:Q20b",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "calculate", marks: 2,
        stem: "Calculate the total number of pieces obtained.",
        answer: numAnswer(18),
        scheme: [
          MA("MA1", 1, "126 ÷ 18 = 7 and 198 ÷ 18 = 11", { ft: true }),
          A("A1", 1, "18", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Divide each ribbon by the length you found.", "Add the two counts."],
        workedSolution: "$126 \\div 18 = 7$ and $198 \\div 18 = 11$, so $7 + 11 = 18$ pieces.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.stop-at-lcm",
          pattern: { kind: "numeric" },
          feedback: "7 is the number of pieces from the first ribbon only. The question asks for the total, so the 11 pieces from the second ribbon are added.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2025-summer:M3:Q23",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
    ],
  }),
  question({
    id: `q.${T}.0009`, topic: T, specRefs: REF, style: "practice", difficulty: 4,
    commandWords: ["Find", "Explain"], setting: "Reasoning about two numbers given only in index form",
    ao: ["AO2"],
    examinerSources: ["ccea-cer:maths:2024-november:M4:Q2"],
    solutionProgram: "P = 2^3*3*5 = 120, Q = 2*3^2*5^2 = 450; HCF = 2*3*5 = 30; LCM = 2^3*3^2*5^2 = 1800; gcd(120,450) = 30; 120*450/30 = 1800; HCF*LCM = 30*1800 = 54000 = 120*450",
    parts: [
      {
        id: "a", verb: "find", marks: 2,
        stem: "$P = 2^3 \\times 3 \\times 5$ and $Q = 2 \\times 3^2 \\times 5^2$\n\nFind the highest common factor of $P$ and $Q$.",
        answer: numAnswer(30),
        scheme: [MA("MA1", 1, "2 × 3 × 5 identified"), MA("MA2", 1, "30")],
        hints: ["Lower power of each of the three primes.", "min(3, 1) = 1 for the 2s."],
        workedSolution: "$2^1 \\times 3^1 \\times 5^1 = 30$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.highest-power-for-hcf",
          pattern: { kind: "numeric" },
          feedback: "The higher power of each prime gives the LCM. For the HCF, take the lower power each time.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q2",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "explain", marks: 2,
        stem: "Rory says that the lowest common multiple of $P$ and $Q$ is $P \\times Q$.\n\nExplain why he is not correct, and write down the correct lowest common multiple.",
        answer: textAnswer(
          ["P × Q counts the shared factors twice; LCM = 1800", "LCM = 1800 because P × Q = 54 000 is 30 times too big"],
          [
            { any: ["counted twice", "shared", "common factor", "divide by the HCF", "divide by 30"], marks: 1 },
            { any: ["1800", "1 800", "2^3 × 3^2 × 5^2"], marks: 1 },
          ],
        ),
        scheme: [
          MA("MA1", 1, "a reason referring to the shared factor being counted twice, or to P × Q ÷ HCF"),
          MA("MA2", 1, "1800 (or 2³ × 3² × 5²)", { ft: true }),
        ],
        hints: ["$P \\times Q$ is certainly a common multiple. Is it the lowest?", "Each of 2, 3 and 5 is in both numbers, so multiplying uses each of them once too often.", "$P \\times Q \\div \\text{HCF} = 54\\,000 \\div 30$."],
        workedSolution: "$P \\times Q = 120 \\times 450 = 54\\,000$, which is a common multiple but not the lowest: every prime shared by $P$ and $Q$ has been counted twice. Taking the higher power of each prime gives $\\text{LCM} = 2^3 \\times 3^2 \\times 5^2 = 1800$, and indeed $54\\,000 \\div 30 = 1800$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.product-as-lcm",
          pattern: { kind: "numeric" },
          feedback: "Agreeing with Rory earns nothing. $P \\times Q$ is always a common multiple; the lowest one divides it by the HCF, giving 1800.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-november:M4:Q2",
        }],
        requiresWorking: true,
      },
    ],
  }),
  // ------------------------------------------------------------ exam-style
  question({
    id: `q.${T}.0010`, topic: T, specRefs: REF, style: "exam-style", difficulty: 4,
    commandWords: ["Work out"], emphasis: ["packs of name badges"],
    setting: "Ordering badges and lanyards for a school open evening",
    ao: ["AO3"],
    examinerSources: ["ccea-cer:maths:2025-summer:M3:Q23"],
    solutionProgram: "24 = 2^3*3, 18 = 2*3^2; LCM = 2^3*3^2 = 72; lcm(24,18) = 72; badge packs = 72/24 = 3; lanyard packs = 72/18 = 4",
    parts: [{
      id: "main", verb: "work-out", marks: 3,
      stem: "Name badges are sold in packs of 24. Lanyards are sold in packs of 18.\n\nFor an open evening the office needs the same number of badges as lanyards, with none left over. They buy as few packs as possible.\n\nWork out how many **packs of name badges** they buy.",
      answer: numAnswer(3, { unit: "packs", unitRequired: false }),
      scheme: [
        MA("MA1", 1, "24 = 2³ × 3 and 18 = 2 × 3², or lists of multiples of 24 and 18"),
        MA("MA2", 1, "LCM = 72 seen"),
        A("A1", 1, "3", { dependsOn: ["MA2"], examinerNote: "72 alone, or 4 (packs of lanyards), scores a maximum of MA1 MA2." }),
      ],
      hints: ["Same number of each with none left over means a common multiple of 24 and 18.", "As few as possible means the lowest common multiple.", "72 is the number of badges. How many packs of 24 is that?"],
      workedSolution: "$24 = 2^3 \\times 3$ and $18 = 2 \\times 3^2$, so $\\text{LCM} = 2^3 \\times 3^2 = 72$. That is 72 badges and 72 lanyards. Packs of badges $= 72 \\div 24 = 3$ (and 4 packs of lanyards).",
      commonErrors: [
        {
          misconception: "maths.hcf-lcm.stop-at-lcm",
          pattern: { kind: "numeric" },
          feedback: "72 is the number of badges, and it earns the first two marks. The answer line wants packs, so divide by 24 once more. This exact stopping point was reported in Summer 2025 M3 Q23.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M3:Q23",
        },
        {
          misconception: "maths.hcf-lcm.stop-at-lcm",
          pattern: { kind: "numeric" },
          feedback: "4 is the number of packs of lanyards. The bold words in the stem name the item the marker wants counted.",
          marksTypicallyEarned: 2,
          source: "ccea-cer:maths:2025-summer:M3:Q23",
        },
        {
          misconception: "maths.hcf-lcm.swapped",
          pattern: { kind: "numeric" },
          feedback: "6 is the highest common factor of 24 and 18. Buying the same number of each with none left over needs a common multiple, not a common factor.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2025-summer:M3:Q23",
        },
      ],
      requiresWorking: true,
    }],
  }),
  question({
    id: `q.${T}.0011`, topic: T, specRefs: REF, style: "exam-style", difficulty: 4,
    commandWords: ["Write down", "Find"], emphasis: ["as a product of its prime factors"],
    setting: "Pure number, three-part structure in the style of a late M3 question",
    examinerSources: ["ccea-cer:maths:2024-summer:M3:Q20b", "ccea-cer:maths:2023-summer:M4:Q9"],
    solutionProgram: "550 = 2*5^2*11; 396 = 2^2*3^2*11; HCF = 2*11 = 22; LCM = 2^2*3^2*5^2*11 = 9900; gcd(550,396) = 22; 550*396/22 = 9900",
    parts: [
      {
        id: "a", verb: "write-down", marks: 2,
        stem: "Write 550 as a product of its prime factors.",
        answer: algAnswer("2 \\times 5^2 \\times 11", { variables: [] }),
        scheme: [
          MA("MA1", 1, "correct method seen: a factor tree or repeated division reaching 2, 5, 5, 11"),
          MA("MA2", 1, "2 × 5² × 11 (accept 2 × 5 × 5 × 11)"),
        ],
        hints: ["550 is even, so start by halving it.", "275 ends in 5, so divide by 5.", "55 = 5 × 11 and 11 is prime."],
        workedSolution: "$550 = 2 \\times 275 = 2 \\times 5 \\times 55 = 2 \\times 5 \\times 5 \\times 11 = 2 \\times 5^2 \\times 11$.",
        commonErrors: [{
          misconception: "maths.presentation.answer-without-working",
          pattern: { kind: "text", regex: "^\\s*(2\\s*(x|\\\\times)\\s*275|10\\s*(x|\\\\times)\\s*55)\\s*$" },
          feedback: "Those are factors, but 275, 55 and 10 are not prime. Keep splitting until nothing can be split again.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M4:Q9",
        }],
        requiresWorking: true,
      },
      {
        id: "b", verb: "find", marks: 2,
        stem: "$396 = 2^2 \\times 3^2 \\times 11$\n\nFind the highest common factor of 550 and 396.",
        answer: numAnswer(22),
        scheme: [
          MA("MA1", 1, "shared primes 2 and 11 identified at their lower powers", { ft: true }),
          A("A1", 1, "22", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Compare your answer to part (a) with 2² × 3² × 11.", "550 has only one 2; 396 has no 5s."],
        workedSolution: "$550 = 2 \\times 5^2 \\times 11$ and $396 = 2^2 \\times 3^2 \\times 11$. Shared: one 2 and one 11, so the HCF is $2 \\times 11 = 22$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.swapped",
          pattern: { kind: "numeric" },
          feedback: "9900 is the lowest common multiple. The examiners report this swap every series: the highest common factor divides both numbers, so it is at most 396.",
          marksTypicallyEarned: 0,
          source: "ccea-cer:maths:2024-summer:M3:Q20b",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      },
      {
        id: "c", verb: "find", marks: 2,
        stem: "Find the lowest common multiple of 550 and 396.",
        answer: numAnswer(9900),
        scheme: [
          MA("MA1", 1, "2² × 3² × 5² × 11 seen, or 550 × 396 ÷ 22", { ft: true }),
          A("A1", 1, "9900", { ft: true, dependsOn: ["MA1"] }),
        ],
        hints: ["Take the higher power of every prime that appears in either number.", "Or use: HCF × LCM = 550 × 396."],
        workedSolution: "Higher power of each prime: $2^2 \\times 3^2 \\times 5^2 \\times 11 = 4 \\times 9 \\times 25 \\times 11 = 9900$. Check: $550 \\times 396 \\div 22 = 217\\,800 \\div 22 = 9900$.",
        commonErrors: [{
          misconception: "maths.hcf-lcm.product-as-lcm",
          pattern: { kind: "numeric" },
          feedback: "$550 \\times 396$ counts the shared factor 22 twice. Dividing by the HCF gives 9900.",
          marksTypicallyEarned: 1,
          source: "ccea-cer:maths:2023-summer:M4:Q9",
        }],
        requiresWorking: true,
        followThrough: { fromPart: "b", rule: "use-candidate-value" },
      },
    ],
  }),
];

// ---------------------------------------------------------------- find the mistake
const findTheMistake = [
  {
    id: `ftm.${T}.01`,
    topic: T,
    specRefs: REF,
    stem: "Tea lights are sold in boxes of 20 and holders in boxes of 35. Nuala wants equal numbers of each, with none left over, buying as few as possible. She was asked how many **boxes of tea lights** she buys. Her working:",
    studentWorking: [
      "20 = 2 × 2 × 5 and 35 = 5 × 7",
      "LCM = 2 × 2 × 5 × 7 = 140",
      "Answer: 140 boxes of tea lights",
    ],
    mistakeLine: 3,
    misconception: "maths.hcf-lcm.stop-at-lcm",
    whatWentWrong: "140 is the number of tea lights, not the number of boxes. The question names boxes of tea lights, so the common multiple still has to be divided by 20.",
    correction: [
      "20 = 2² × 5 and 35 = 5 × 7, so LCM = 2² × 5 × 7 = 140",
      "Boxes of tea lights = 140 ÷ 20 = 7",
      "Answer: 7 boxes (and 4 boxes of holders)",
    ],
    marksEarnedAsWritten: ["MA1", "MA2"],
    feedback: "The prime factors and the lowest common multiple are both correct, so two of the three marks stand. The last mark is one division away. Summer 2025 M3 Q23 was reported as exactly this: candidates found the common multiple and wrote it on the answer line instead of the quantity asked for. Read the answer line first, then check what unit it wants.",
    source: "ccea-cer:maths:2025-summer:M3:Q23",
  },
];

// ---------------------------------------------------------------- prompts
const prompts = [
  rp(T, "01", REF, "procedure", "From two prime factorisations, how do you build the HCF and how do you build the LCM?",
    "HCF: keep only the primes that appear in both, each at its lower power, and multiply. LCM: keep every prime that appears in either, each at its higher power, and multiply.",
    ["both", "lower power", "either", "higher power"], 3),
  rp(T, "02", REF, "definition", "What does 'highest common factor' mean in words?",
    "The largest number that divides exactly into both numbers. It is never larger than the smaller of the two.",
    ["divides exactly", "both", "largest"], 2),
  rp(T, "03", REF, "definition", "What does 'lowest common multiple' mean in words?",
    "The smallest number that both numbers divide into exactly. It is never smaller than the larger of the two.",
    ["smallest", "divide into", "both"], 2),
  rp(T, "04", REF, "trap", "A question says 'as few as possible, none left over'. HCF or LCM?",
    "LCM. Sharing out or cutting into equal pieces is the HCF; repeating events meeting again, or buying matching quantities, is the LCM.",
    ["LCM", "cutting into equal pieces", "HCF"], 5),
  rp(T, "05", REF, "formula", "$\\text{HCF}(a,b) \\times \\text{LCM}(a,b) = $ ?",
    "$a \\times b$. It is a quick check: once you have the HCF, the LCM is $a \\times b$ divided by it.",
    ["a × b", "check"], 4),
  rp(T, "06", REF, "trap", "You found the lowest common multiple of the two pack sizes. What is the very next thing to do?",
    "Read the answer line again. If it asks for packs, boxes, strips or minutes, divide or convert; the common multiple on its own is usually not the answer.",
    ["answer line", "divide", "packs"], 6),
  rp(T, "07", REF, "novel-example", "$A = 2^4 \\times 3^2 \\times 7$ and $B = 2^2 \\times 3^3 \\times 5$. Write the HCF and the LCM in index form.",
    "$\\text{HCF} = 2^2 \\times 3^2 = 36$; $\\text{LCM} = 2^4 \\times 3^3 \\times 5 \\times 7 = 15\\,120$.",
    ["2² × 3²", "2⁴ × 3³ × 5 × 7"], 6),
];
expect("rp07 HCF", 2 ** 2 * 3 ** 2, 36);
expect("rp07 LCM", 2 ** 4 * 3 ** 3 * 5 * 7, 15120);
expect("rp07 consistency", hcf(2 ** 4 * 3 ** 2 * 7, 2 ** 2 * 3 ** 3 * 5), 36);
expect("rp07 lcm consistency", lcm(2 ** 4 * 3 ** 2 * 7, 2 ** 2 * 3 ** 3 * 5), 15120);
assertNoFailures("t1 prompts");

// ---------------------------------------------------------------- verification logs
const verification = [
  ver(`ver.note.${T}`, `note.${T}`, {
    ...base,
    numeric: "Sheet and note numbers recomputed: HCF(84, 90) = 6, LCM(84, 90) = 1260, 84 × 90 = 7560 = 6 × 1260; HCF(96, 108) = 12, LCM = 864; LCM(18, 24) = 72 s = 1 min 12 s.",
    examiner: "Traps drawn from the taxonomy examinerEvidence for M3-NA-01: Summer 2025 M3 Q23 (stopped at the LCM), Summer 2024 M3 Q20(b) and M4 Q5(b) (HCF given as the LCM), November 2024 M4 Q2 (LCM with a constraint), Summer 2023 M4 Q9 (product of primes).",
  }),
  ver(`ver.we.${T}.01`, `we.${T}.01`, {
    ...base,
    numeric: "84 = 2² × 3 × 7, 90 = 2 × 3² × 5; HCF = 2 × 3 = 6; LCM = 2² × 3² × 5 × 7 = 1260; cross-check 84 × 90 ÷ 6 = 1260. Twin: HCF(100, 120) = 20, LCM = 600 (100 × 120 ÷ 20 = 600).",
    examiner: "Exercises the HCF/LCM swap reported in Summer 2024 M3 Q20(b) by making the overlap visible as a picture.",
  }),
  ver(`ver.we.${T}.02`, `we.${T}.02`, {
    ...base,
    numeric: "15 = 3 × 5, 25 = 5²; LCM = 75; strips = 75 ÷ 15 = 5; packs of cards = 75 ÷ 25 = 3. Twin: LCM(12, 20) = 60, boxes of pens = 60 ÷ 12 = 5.",
    examiner: "Built on the Summer 2025 M3 Q23 finding that candidates stopped at the common multiple instead of the quantity asked for.",
  }),
  ver(`ver.dx.${T}`, `dx.${T}`, {
    ...base,
    numeric: "HCF(45, 60) = 15, LCM = 180, 45 × 60 = 2700 = 15 × 180; min(2³, 2⁵) = 2³; LCM(8, 6) = 24, 24 ÷ 8 = 3, 24 ÷ 6 = 4; HCF(126, 198) = 18, LCM = 1386.",
    examiner: "Every distractor is a named error from the M3-NA-01 evidence: the swap, the highest-power slip, the product-as-LCM slip and stopping at the common multiple.",
  }),
  ...questions.map((q) => ver(`ver.${q.id}`, q.id, {
    ...base,
    numeric: q.solutionProgram,
    examiner: q.examinerSources.join("; ") + " — the distractors in commonErrors reproduce the errors those reports describe.",
  })),
  ...findTheMistake.map((f) => ver(`ver.${f.id}`, f.id, {
    ...base,
    numeric: "20 = 2² × 5, 35 = 5 × 7, LCM = 140; boxes of tea lights = 140 ÷ 20 = 7; boxes of holders = 140 ÷ 35 = 4.",
    examiner: f.source + " — the wrong line is the reported stopping point.",
  })),
  ...prompts.map((p) => ver(`ver.${p.id}`, p.id, {
    ...base,
    numeric: "Facts and the worked values in the prompt answers recomputed: HCF(2⁴ × 3² × 7, 2² × 3³ × 5) = 36 and LCM = 15 120, matching gcd/lcm of 1008 and 540.",
    examiner: "Prompts cover the swap, the stopping point and the HCF × LCM check named in the M3-NA-01 evidence.",
  })),
];

// ---------------------------------------------------------------- bundle
const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: T,
    slug: SLUG,
    title: "HCF and LCM from numbers written as products of prime factors",
    subject: "maths",
    unit: "M3",
    tier: "H",
    strand: "NA",
    statementIds: REF,
    prerequisites: ["maths.m2.hcf-lcm-and-prime-factorisation"],
    order: 94,
    hardness: "S",
    difficulty: 3,
    examinerFlagged: false,
    examinerSources: [
      "ccea-cer:maths:2025-summer:M3:Q23",
      "ccea-cer:maths:2024-summer:M3:Q20b",
      "ccea-cer:maths:2024-summer:M4:Q5b",
      "ccea-cer:maths:2024-november:M4:Q2",
      "ccea-cer:maths:2023-summer:M4:Q9",
      "ccea-cer:maths:2025-summer:M4:Q9",
    ],
    examWeightHint:
      "One item most series, usually 2-4 marks in the second half of M3: either 'write N as a product of its prime factors' followed by an HCF or LCM part (Summer 2024 Q20), or an LCM word problem whose last line converts the common multiple into packs, pieces or minutes (Summer 2025 Q23). M4 re-uses it as a short opener (Summer 2023 Q9, Summer 2025 Q9, November 2024 Q2).",
    mustMemorise: [
      "HCF = the primes both numbers share, each at its LOWER power",
      "LCM = every prime in either number, each at its HIGHER power",
      "HCF × LCM = the product of the two numbers — use it as a check",
      "Cutting or sharing into equal parts is an HCF; events meeting again or matching pack sizes is an LCM",
    ],
    onFormulaSheet: [],
    notOnThisSpec: [
      "Finding the HCF or LCM of algebraic terms such as 12x³y and 18xy² (not part of M3-NA-01)",
      "The HCF or LCM of three or more numbers is not the pattern CCEA has set in M3; two numbers is the standard",
      "Euclid's algorithm and formal proofs about divisibility (A level)",
    ],
    externalRefs: externalCer,
    keywords: ["HCF", "LCM", "prime factors", "index form", "Venn method", "lowest common multiple", "highest common factor"],
  },
  note: {
    id: `note.${T}`,
    topic: T,
    title: "HCF and LCM from prime factor form",
    subject: "maths",
    unit: "M3",
    tier: "H",
    specRefs: REF,
    calculator: "P1-no/P2-yes",
    formulaSheet: {
      given: [],
      mustKnow: [
        "HCF: shared primes at their lower powers",
        "LCM: all primes at their higher powers",
        "HCF × LCM = a × b",
      ],
    },
    notOnThisSpec: [
      "Finding the HCF or LCM of algebraic terms such as 12x³y and 18xy² (not part of M3-NA-01)",
      "The HCF or LCM of three or more numbers is not the pattern CCEA has set in M3; two numbers is the standard",
      "Euclid's algorithm and formal proofs about divisibility (A level)",
    ],
    hardness: "S",
    examinerFlagged: false,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Write a number such as 550 or 360 as a product of its prime factors, in index form",
        "Read the HCF of two numbers straight from their prime factorisations by taking the lower power of each shared prime",
        "Read the LCM by taking the higher power of every prime that appears in either number",
        "Decide from the wording whether a word problem wants the HCF (cutting or sharing into equal parts) or the LCM (events coinciding, matching pack sizes)",
        "Convert the common multiple into the quantity the question actually asks for: packs, pieces, minutes and seconds",
        "Check an answer with HCF × LCM = the product of the two numbers",
      ],
      howExamined:
        "M3 (calculator, 2 hours, 100 marks) and again in M7 Paper 1 with no calculator. Usually one item of 2-4 marks in the second half of the paper: a two-part 'write as a product of prime factors' then 'find the HCF' (Summer 2024 Q20, 2 + 2), or a single LCM word problem of 3 marks whose final mark is for turning the common multiple into packs or minutes (Summer 2025 Q23). Schemes give MA1 for the factorisations or the list of multiples, MA1 for the HCF or LCM itself, and a final A1 for the quantity asked for.",
      traps: [
        "Giving the LCM when the HCF is asked, or the reverse — reported in Summer 2024 M3 Q20(b), where the HCF came back as 630, and again in M4 Q5(b)",
        "Stopping at the common multiple instead of dividing it into packs, pieces or minutes (Summer 2025 M3 Q23; M4 Q9 left as 132)",
        "Using the higher power of a shared prime for the HCF, so the answer does not divide either number (November 2024 M4 Q2)",
        "Multiplying the two numbers and calling it the LCM: that counts every shared prime twice",
        "Stopping a factor tree at 36 × 10 or 2 × 275 instead of splitting down to primes (Summer 2023 M4 Q9)",
      ],
    },
    verification: `ver.note.${T}`,
    version: 1,
    updated: TODAY,
  },
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  sets: [
    {
      id: `set.${T}.warm-up`,
      topic: T,
      kind: "interleaved",
      title: "HCF and LCM warm-up",
      subject: "maths",
      units: ["M3"],
      itemIds: [`dx.${T}`, `rp.${T}.01`, `q.${T}.0001`, `q.${T}.0002`, `rp.${T}.04`, `q.${T}.0003`],
      showTopicLabels: false,
      version: 1,
    },
    {
      id: `set.${T}.mixed`,
      topic: T,
      kind: "mixed",
      title: "Prime factors, HCF, LCM and the question actually asked",
      subject: "maths",
      units: ["M3"],
      itemIds: [`q.${T}.0005`, `q.${T}.0007`, `ftm.${T}.01`, `q.${T}.0008`, `q.${T}.0010`, `q.${T}.0011`],
      showTopicLabels: false,
      version: 1,
    },
  ],
  verification,
};

// ---------------------------------------------------------------- note blocks
const blocks = [
  { type: "h", text: "HCF and LCM from prime factor form" },
  {
    type: "callout",
    kind: "spec",
    title: "The statement",
    md: "**M3-NA-01** — find the least common multiples (LCM) and highest common factor (HCF) of numbers written as the product of their prime factors.\nThe Teacher Guidance sets the exact shape: given $60 = 2^2 \\times 3 \\times 5$ and $126 = 2 \\times 3^2 \\times 7$, deduce the HCF or the LCM of 60 and 126.",
    source: "CCEA GCSE Mathematics specification, statement M3-NA-01 with its Teacher Guidance",
  },
  {
    type: "p",
    md: "You already know how to find an HCF by listing factors. That stops working the moment the numbers get large: nobody lists the factors of 9680. Prime factor form is the upgrade. Once a number is written as a product of primes, its factors are no longer a mystery list — they are every possible selection from those primes. The HCF and the LCM then become two short rules about **powers**, and they take about twenty seconds each.",
  },
  {
    type: "callout",
    kind: "why",
    title: "Why the rules are what they are",
    md: "A **common factor** has to divide both numbers. It may therefore use a prime only as many times as the number with **fewer** copies of it allows — so the HCF takes the lower power.\nA **common multiple** has to contain both numbers inside it. It must therefore carry a prime at least as many times as the number with **more** copies — so the LCM takes the higher power.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "$45 = 3^2 \\times 5$ and $60 = 2^2 \\times 3 \\times 5$. Which primes can appear in the HCF?",
    options: ["3 and 5 only", "2, 3 and 5", "3² and 5"],
    answer: "3 and 5 only",
    explain: "45 has no 2 at all, so no common factor can contain one. And 60 has only one 3, so the HCF gets one 3, not two.",
  },
  { type: "h", text: "The picture: one diagram, both answers" },
  {
    type: "p",
    md: "Write the primes as plain lists and drop each one into a two-circle diagram. Primes in **both** lists go in the overlap; whatever is left over goes in its own circle. Then read the two answers off the same picture: the HCF is the overlap, the LCM is the whole diagram.",
  },
  noteFigure(vennBody, vennAlt, 540, 330,
    "Every prime of 84 and 90 placed once; the overlap is the HCF and the whole diagram is the LCM", "venn-hcf-lcm"),
  {
    type: "p",
    md: "$84 = 2 \\times 2 \\times 3 \\times 7$ and $90 = 2 \\times 3 \\times 3 \\times 5$.\nOne 2 and one 3 are in both, so the overlap is $2 \\times 3 = 6$: that is the HCF.\nThe whole diagram is $6 \\times (2 \\times 7) \\times (3 \\times 5) = 6 \\times 14 \\times 15 = 1260$: that is the LCM. In index form it is $2^2 \\times 3^2 \\times 5 \\times 7$ — the **higher** power of each prime.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "number",
    prompt: "In that diagram, $84 \\times 90 = 7560$. Divide it by the HCF, 6. What do you get?",
    answer: "1260",
    explain: "The product counts the shared 6 twice, so dividing by it gives the LCM. That is the check: HCF × LCM = a × b.",
  },
  { type: "h", text: "Straight from index form, no diagram" },
  {
    type: "p",
    md: "Once the picture makes sense, work from the powers directly. Line the two factorisations up prime by prime:",
  },
  noteFigure(towerBody, towerAlt, 710, 200,
    "Prime by prime, the HCF takes the lower power and the LCM takes the higher power", "power-table-hcf-lcm"),
  {
    type: "p",
    md: "$5500 = 2^2 \\times 5^3 \\times 11$ and $9680 = 2^4 \\times 5 \\times 11^2$.\n$\\text{HCF} = 2^2 \\times 5 \\times 11 = 220$ (lower power each time).\n$\\text{LCM} = 2^4 \\times 5^3 \\times 11^2 = 242\\,000$ (higher power each time).\nIn an exam, leaving those in index form is usually safest: the mark is for the powers, and a slip in the arithmetic can still cost the accuracy mark.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "choice",
    prompt: "$P = 2^3 \\times 7$ and $Q = 2^5 \\times 3$. Which power of 2 goes in the HCF?",
    options: ["$2^3$", "$2^5$", "$2^8$"],
    answer: "$2^3$",
    explain: "$P$ has only three 2s. $2^5 = 32$ does not divide $P$, so it cannot be a common factor.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "blank",
    prompt: "$P = 2^3 \\times 7$ and $Q = 2^5 \\times 3$. Write the LCM in index form.",
    answer: "2^5 × 3 × 7",
    explain: "Higher power of 2, then every other prime that appears: $2^5 \\times 3 \\times 7 = 672$.",
  },
  { type: "h", text: "Which one does the question want?" },
  {
    type: "p",
    md: "Almost every mark lost here is lost on this decision, not on the arithmetic. Two families of wording:\n**HCF** — cutting into equal pieces with nothing wasted, sharing into identical groups, the largest tile that fits, the biggest bag size. The answer is smaller than both numbers.\n**LCM** — two events happening together again, matching two pack sizes with none left over, the shortest length made from both. The answer is at least as big as both numbers.\nA one-second sanity check: if the answer is bigger than both numbers it is a multiple; if it is smaller than both it is a factor. Read your answer back against the story.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2024 M3 Q20(b)",
    md: "The HCF was asked for and the LCM, 630, came back. The same swap turned up in M4 Q5(b) the same series. Writing 'HCF must be smaller than both' at the top of the working takes three seconds and catches it.",
    source: "ccea-cer:maths:2024-summer:M3:Q20b",
  },
  {
    type: "gate",
    id: "g5",
    kind: "choice",
    prompt: "Two ribbons, 126 cm and 198 cm, cut into equal whole-centimetre pieces with nothing wasted. HCF or LCM?",
    options: ["HCF", "LCM", "Neither — divide 198 by 126"],
    answer: "HCF",
    explain: "The piece length has to divide both ribbons, so it is a common factor; 'longest possible' makes it the highest one, 18 cm.",
  },
  { type: "h", text: "The last line is the one that scores" },
  {
    type: "p",
    md: "This is the single most reported loss on this topic. You find the lowest common multiple, it is correct, and the answer line asks for something else — packs, pieces, minutes and seconds.\nBadges in packs of 24, lanyards in packs of 18. $\\text{LCM} = 2^3 \\times 3^2 = 72$, so 72 of each. **Packs of badges** $= 72 \\div 24 = 3$. The 72 earns two marks; the 3 earns the third.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025 M3 Q23",
    md: "Candidates reached the lowest common multiple and stopped there instead of working out how many packs of labels that was. The report notes the same habit in M4 Q9, where the answer was left as 132. Before writing anything, read the answer line and its unit.",
    source: "ccea-cer:maths:2025-summer:M3:Q23",
  },
  {
    type: "gate",
    id: "g6",
    kind: "number",
    prompt: "Buns come in packs of 8, burgers in packs of 6. Equal numbers, none left over, as few as possible. How many packs of **buns**?",
    answer: "3",
    explain: "LCM(8, 6) = 24, so 24 of each; $24 \\div 8 = 3$ packs of buns (and 4 packs of burgers).",
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic. The sheet carries areas, volumes, the quadratic formula and the trigonometry rules only.\n**Must be known:** HCF = shared primes at their lower powers; LCM = all primes at their higher powers; $\\text{HCF} \\times \\text{LCM} = a \\times b$.",
  },
  {
    type: "callout",
    kind: "notonspec",
    title: "Not on this spec",
    md: "M3-NA-01 is about numbers. You will not be asked for the HCF of $12x^3y$ and $18xy^2$, and CCEA's M3 pattern is two numbers, not three. Euclid's algorithm and divisibility proofs are A level.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "Expect one item, 2-4 marks, in the second half of M3, and the same content again with no calculator in M7 Paper 1. Two shapes recur: a two-part 'write 550 as a product of its prime factors' [2] then 'find the HCF of 550 and 396' [2]; or a single 3-mark word problem where the last mark is the conversion.\nThe **first** mark is for the factorisations or a genuine list of multiples — so write $24 = 2^3 \\times 3$ down even if you can see the answer. The **last** mark is for the quantity on the answer line, in its unit. If you are stuck, write both the HCF and the LCM with their labels: a labelled correct value earns its method mark, an unlabelled pair of numbers earns nothing.",
  },
  { type: "prompt", promptId: `rp.${T}.01` },
  { type: "prompt", promptId: `rp.${T}.04` },
  { type: "prompt", promptId: `rp.${T}.05` },
  { type: "prompt", promptId: `rp.${T}.06` },
];

assertNoFailures("t1 final");
export default () => writeBundle("m3", SLUG, bundle, blocks);
