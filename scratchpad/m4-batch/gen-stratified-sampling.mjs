/**
 * maths.m4.stratified-sampling-and-population-estimates — H bundle.
 * Every stratum share, population estimate and rounded count is computed here from the
 * table in the stem, so stems, answers, schemes and verification logs cannot drift apart.
 */
import fs from "node:fs";
import path from "node:path";
import { PAPER, timeFor, svgFigure, writeBundle, collectLogs, UPDATED, ROOT } from "./lib.mjs";

const SLUG = "stratified-sampling-and-population-estimates";
const TID = `maths.m4.${SLUG}`;
const qid = (n) => `q.${TID}.${String(n).padStart(4, "0")}`;

// ---------------------------------------------------------------------------
// Sampling arithmetic, computed once
// ---------------------------------------------------------------------------
/** Share of the sample that a stratum gets. */
const share = (stratum, population, sample) => (stratum / population) * sample;
/** Capture-recapture: marked/sample = firstCatch/population. */
const recapture = (marked, sampleSize, markedInSample) => (marked * sampleSize) / markedInSample;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
/** Part of a class, assuming the values are spread evenly across it; 0 when the class is outside the range. */
const slice = (from, to, lo, hi, freq) => (Math.max(0, Math.min(to, hi) - Math.max(from, lo)) / (hi - lo)) * freq;

const D = {};

// WE1 — five year groups, sample of 75
D.we1groups = [
  { name: "Year 8", n: 240 },
  { name: "Year 9", n: 216 },
  { name: "Year 10", n: 198 },
  { name: "Year 11", n: 186 },
  { name: "Year 12", n: 160 },
];
D.we1pop = sum(D.we1groups.map((g) => g.n));
D.we1sample = 75;
D.we1raw = D.we1groups.map((g) => share(g.n, D.we1pop, D.we1sample));
D.we1round = D.we1raw.map((x) => Math.round(x));
if (D.we1pop !== 1000 || sum(D.we1round) !== D.we1sample) throw new Error("we1 stratified totals do not check");

// WE2 — capture-recapture
D.we2 = recapture(24, 30, 4);

// WE3 — sample from a subgroup, with a class split
D.we3table = [
  { lo: 0, hi: 10, f: 24 },
  { lo: 10, hi: 20, f: 36 },
  { lo: 20, hi: 30, f: 48 },
  { lo: 30, hi: 50, f: 30 },
  { lo: 50, hi: 80, f: 12 },
];
D.we3sub = sum(D.we3table.filter((c) => c.lo >= 20).map((c) => c.f)); // 90
D.we3want = sum(D.we3table.map((c) => slice(25, 40, c.lo, c.hi, c.f))); // 24 + 15 = 39
D.we3sample = 30;
D.we3ans = share(D.we3want, D.we3sub, D.we3sample);
if (D.we3sub !== 90 || D.we3want !== 39 || D.we3ans !== 13) throw new Error("we3 subgroup arithmetic does not check");

// Practice
D.q1 = share(200, 800, 40);
D.q2 = share(450, 1200, 80);
D.q3raw = share(176, 640, 50);
D.q3 = Math.round(D.q3raw);
D.q4groups = [350, 275, 175];
D.q4pop = sum(D.q4groups);
D.q4 = D.q4groups.map((g) => share(g, D.q4pop, 64));
if (D.q4pop !== 800 || sum(D.q4) !== 64) throw new Error("q4 totals do not check");
D.q5 = (9 * 960) / 120;
D.q6 = (12 / 45) * 1500;
D.q7 = recapture(40, 50, 8);
D.q8 = recapture(15, 24, 2);
D.q9raw = recapture(25, 32, 7);
D.q9 = Math.floor(D.q9raw);
D.q10table = [
  { label: "16 to 25", n: 120 },
  { label: "26 to 35", n: 150 },
  { label: "36 to 50", n: 140 },
  { label: "51 to 70", n: 90 },
];
D.q10sub = 140 + 90;
D.q10raw = share(90, D.q10sub, 60);
D.q10 = Math.round(D.q10raw);
D.q10other = Math.round(share(140, D.q10sub, 60));
D.q11table = [
  { lo: 0, hi: 5, f: 40 },
  { lo: 5, hi: 10, f: 64 },
  { lo: 10, hi: 20, f: 80 },
  { lo: 20, hi: 40, f: 56 },
];
D.q11sub = sum(D.q11table.filter((c) => c.lo >= 10).map((c) => c.f)); // 136
D.q11want = sum(D.q11table.map((c) => slice(15, 30, c.lo, c.hi, c.f))); // 40 + 28 = 68
D.q11 = share(D.q11want, D.q11sub, 44);
if (D.q11sub !== 136 || D.q11want !== 68 || D.q11 !== 22) throw new Error("q11 arithmetic does not check");
D.q13expected = share(45, 180, 60); // 15 juniors expected
D.q13actual = 9;
D.q14groups = [186, 154, 132, 108];
D.q14pop = sum(D.q14groups); // 580
D.q14raw = D.q14groups.map((g) => share(g, D.q14pop, 50));
D.q14round = D.q14raw.map((x) => Math.round(x));
D.q14shortfall = 50 - sum(D.q14round); // 1
D.q14biggestRemainder = D.q14raw.reduce(
  (best, x, i) => (x - Math.floor(x) > D.q14raw[best] - Math.floor(D.q14raw[best]) ? i : best),
  0,
);

// Exam-style
D.e1groups = [
  { label: "Under 12", n: 180 },
  { label: "12 to 15", n: 240 },
  { label: "16 to 18", n: 150 },
  { label: "Over 18", n: 330 },
];
D.e1pop = sum(D.e1groups.map((g) => g.n)); // 900
D.e1 = D.e1groups.map((g) => share(g.n, D.e1pop, 60));
if (D.e1pop !== 900 || sum(D.e1) !== 60) throw new Error("e1 totals do not check");
D.e2 = recapture(45, 60, 9); // 300
D.e3table = [
  { lo: 0, hi: 7, f: 66 },
  { lo: 7, hi: 14, f: 84 },
  { lo: 14, hi: 28, f: 98 },
  { lo: 28, hi: 56, f: 52 },
];
D.e3pop = sum(D.e3table.map((c) => c.f)); // 300
D.e3a = share(66 + 84, D.e3pop, 50); // 25
D.e3sub = 98 + 52; // 150
D.e3want = sum(D.e3table.map((c) => slice(21, 42, c.lo, c.hi, c.f))); // 49 + 26 = 75
D.e3b = share(D.e3want, D.e3sub, 30); // 15
if (D.e3pop !== 300 || D.e3a !== 25 || D.e3want !== 75 || D.e3b !== 15) throw new Error("e3 arithmetic does not check");
D.e4bars = [
  { lo: 0, hi: 10, fd: 3 },
  { lo: 10, hi: 20, fd: 5 },
  { lo: 20, hi: 40, fd: 4 },
  { lo: 40, hi: 60, fd: 2 },
  { lo: 60, hi: 100, fd: 0.5 },
].map((b) => ({ ...b, f: b.fd * (b.hi - b.lo) }));
D.e4total = sum(D.e4bars.map((b) => b.f)); // 220
D.e4want = sum(D.e4bars.map((b) => slice(50, 100, b.lo, b.hi, b.f))); // 20 + 20 = 40
D.e4sample = 44;
D.e4b = share(D.e4want, D.e4total, D.e4sample); // 8
if (D.e4total !== 220 || D.e4want !== 40 || D.e4b !== 8) throw new Error("e4 arithmetic does not check");

const f1 = (x) => x.toFixed(1);
const f2 = (x) => x.toFixed(2);

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

/** Population bar split into four strata, with the sample bar beneath in the same proportions. */
const POP_SAMPLE_FIG = `<svg viewBox="0 0 380 250" xmlns="http://www.w3.org/2000/svg" width="380" height="250" role="img" aria-labelledby="popsampfig"><title id="popsampfig">A long bar showing a population of 900 split into four age groups, and a shorter bar beneath showing a sample of 60 split in the same proportions</title><g fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.5"><rect x="40" y="52" width="60" height="40"/><rect x="100" y="52" width="80" height="40"/><rect x="180" y="52" width="50" height="40"/><rect x="230" y="52" width="110" height="40"/></g><g fill="currentColor" fill-opacity="0.28" stroke="currentColor" stroke-width="1.5"><rect x="40" y="170" width="60" height="26"/><rect x="100" y="170" width="80" height="26"/><rect x="180" y="170" width="50" height="26"/><rect x="230" y="170" width="110" height="26"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="13"><text x="40" y="40">Population: 900 members</text><text x="40" y="160">Stratified sample: 60 members</text><text x="70" y="77" text-anchor="middle">180</text><text x="140" y="77" text-anchor="middle">240</text><text x="205" y="77" text-anchor="middle">150</text><text x="285" y="77" text-anchor="middle">330</text><text x="70" y="188" text-anchor="middle">12</text><text x="140" y="188" text-anchor="middle">16</text><text x="205" y="188" text-anchor="middle">10</text><text x="285" y="188" text-anchor="middle">22</text></g><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M70 96 V162"/><path d="M140 96 V162"/><path d="M205 96 V162"/><path d="M285 96 V162"/><path d="M66 154 L70 162 L74 154"/><path d="M136 154 L140 162 L144 154"/><path d="M201 154 L205 162 L209 154"/><path d="M281 154 L285 162 L289 154"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="11"><text x="40" y="116">Under 12</text><text x="112" y="116">12 to 15</text><text x="184" y="116">16 to 18</text><text x="258" y="116">Over 18</text><text x="40" y="222">Each group keeps the same share: 180 out of 900 is one fifth, and so is 12 out of 60</text></g></svg>`;

/** Histogram of plant heights with unequal class widths. */
const HISTOGRAM_FIG = `<svg viewBox="0 0 380 320" xmlns="http://www.w3.org/2000/svg" width="380" height="320" role="img" aria-labelledby="histfig"><title id="histfig">A histogram of plant heights with unequal class widths and frequency density on the vertical axis</title><g fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.5"><rect x="50" y="130" width="28" height="120"/><rect x="78" y="50" width="28" height="200"/><rect x="106" y="90" width="56" height="160"/><rect x="162" y="170" width="56" height="80"/><rect x="218" y="230" width="112" height="20"/></g><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M50 40 V250 H345"/></g><g fill="none" stroke="currentColor" stroke-width="1"><path d="M50 250 v5 M78 250 v5 M106 250 v5 M134 250 v5 M162 250 v5 M190 250 v5 M218 250 v5 M246 250 v5 M274 250 v5 M302 250 v5 M330 250 v5"/><path d="M50 250 h-5 M50 210 h-5 M50 170 h-5 M50 130 h-5 M50 90 h-5 M50 50 h-5"/></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="10"><text x="50" y="268" text-anchor="middle">0</text><text x="78" y="268" text-anchor="middle">10</text><text x="106" y="268" text-anchor="middle">20</text><text x="134" y="268" text-anchor="middle">30</text><text x="162" y="268" text-anchor="middle">40</text><text x="190" y="268" text-anchor="middle">50</text><text x="218" y="268" text-anchor="middle">60</text><text x="246" y="268" text-anchor="middle">70</text><text x="274" y="268" text-anchor="middle">80</text><text x="302" y="268" text-anchor="middle">90</text><text x="330" y="268" text-anchor="middle">100</text><text x="42" y="254" text-anchor="end">0</text><text x="42" y="214" text-anchor="end">1</text><text x="42" y="174" text-anchor="end">2</text><text x="42" y="134" text-anchor="end">3</text><text x="42" y="94" text-anchor="end">4</text><text x="42" y="54" text-anchor="end">5</text></g><g fill="currentColor" font-family="system-ui,sans-serif" font-size="12"><text x="198" y="288" text-anchor="middle">Height (cm)</text><text x="56" y="32">Frequency density</text></g></svg>`;

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

const workedExamples = [
  {
    id: `we.${TID}.01`,
    topic: TID,
    specRefs: ["M4-HD-01"],
    paper: PAPER,
    stem: `A school has 1000 pupils: 240 in Year 8, 216 in Year 9, 198 in Year 10, 186 in Year 11 and 160 in Year 12. A stratified sample of 75 pupils is to be taken.\n\nWork out how many pupils from each year group should be in the sample.`,
    figure: svgFigure(
      POP_SAMPLE_FIG,
      "A long bar showing a population of 900 club members split into four age groups, and a shorter bar beneath showing a stratified sample of 60 split into the same four proportions, with arrows joining each group to its share of the sample.",
    ),
    steps: [
      {
        n: 1,
        working: "Each group's share of the sample $=$ (group size $\\div$ population) $\\times$ sample size",
        decision:
          "Stratified means every group is represented in the same proportion as in the population. Writing the rule once, before any arithmetic, is what turns five calculations into one repeated calculation.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because each group should be the same fraction of the sample as it is of the population",
            "Because every group must contribute the same number of pupils",
            "Because the sample must be the same size as the smallest group",
          ],
          correct: 0,
          explain:
            "A stratified sample copies the shape of the population. Equal numbers from each group would over-represent the small groups.",
        },
      },
      {
        n: 2,
        working: `Year 8: $\\dfrac{240}{1000} \\times 75 = ${D.we1raw[0]}$`,
        decision: "The fraction is the group's share of the school; multiplying by 75 turns that share into pupils.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: `Year 9: $${D.we1raw[1]}$, Year 10: $${D.we1raw[2]}$, Year 11: $${D.we1raw[3]}$, Year 12: $${D.we1raw[4]}$`,
        decision:
          "Same calculation, four more times. Keep the decimals visible for now — rounding before the check at the end can lose a pupil.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: `Rounded: ${D.we1round.join(", ")}`,
        decision:
          "Pupils are whole people, so each figure is rounded to the nearest whole number. In Summer 2024 the examiners noted candidates who left a decimal number of animals in a population question; the same rule applies here.",
        earns: ["MA1"],
        whyMenu: {
          options: [
            "Because you cannot put 16.2 pupils in a sample",
            "Because the answer must always be even",
            "Because decimals are not allowed in statistics",
          ],
          correct: 0,
          explain: "The thing being counted is people, so the answer has to be a whole number of them.",
        },
      },
      {
        n: 5,
        working: `Check: $${D.we1round.join(" + ")} = ${sum(D.we1round)}$`,
        decision:
          "Add the rounded figures and compare with the sample size. They come to 75, so nothing has to be adjusted. If they had come to 74 or 76, one group would be moved by one — the one whose decimal was closest to the halfway point.",
        earns: ["A1"],
      },
    ],
    finalAnswer: `Year 8: ${D.we1round[0]}, Year 9: ${D.we1round[1]}, Year 10: ${D.we1round[2]}, Year 11: ${D.we1round[3]}, Year 12: ${D.we1round[4]} (total ${sum(D.we1round)})`,
    twin: {
      stem: "A club has 600 members: 180 juniors, 150 seniors, 210 adults and 60 veterans. Work out the numbers in a stratified sample of 40.",
      answer: {
        kind: "table",
        cells: [
          { row: 0, col: 0, value: share(180, 600, 40) },
          { row: 0, col: 1, value: share(150, 600, 40) },
          { row: 0, col: 2, value: share(210, 600, 40) },
          { row: 0, col: 3, value: share(60, 600, 40) },
        ],
      },
    },
    faded: [
      { showSteps: 2, studentSupplies: [3, 4, 5] },
      { showSteps: 1, studentSupplies: [2, 3, 4, 5] },
    ],
    verification: `ver.we.${TID}.01`,
    version: 1,
  },
  {
    id: `we.${TID}.02`,
    topic: TID,
    specRefs: ["M4-HD-01"],
    paper: PAPER,
    stem: `24 trout were caught in a lake, marked and returned. Two weeks later 30 trout were caught, and 4 of them were marked.\n\n(a) Estimate the number of trout in the lake.\n(b) State one fault with this method and suggest one improvement.`,
    steps: [
      {
        n: 1,
        working: "$\\dfrac{\\text{marked in the second sample}}{\\text{size of the second sample}} = \\dfrac{\\text{marked in the lake}}{\\text{trout in the lake}}$",
        decision:
          "The whole method is one assumption: the marked fish have mixed in, so the proportion marked in a handful is the proportion marked in the lake. Writing the two fractions is the method mark.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because the marked fish are assumed to have spread evenly through the lake",
            "Because 4 is a quarter of 24",
            "Because the two samples were the same size",
          ],
          correct: 0,
          explain:
            "Even mixing is what lets a small catch stand for the whole lake. If the marked fish stayed together, the second catch would tell you nothing about the rest.",
        },
      },
      {
        n: 2,
        working: `$\\dfrac{4}{30} = \\dfrac{24}{N}$`,
        decision:
          "Put the numbers in with the marked counts on top and the totals underneath, on both sides. In Summer 2024 only about a quarter of candidates got this far: most did not recognise the proportion argument.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: `$N = \\dfrac{24 \\times 30}{4} = ${D.we2}$`,
        decision: "Cross-multiply and divide. A quick sense check: 4 out of 30 is about one in seven, and 24 is about one seventh of 180.",
        earns: ["A1"],
      },
      {
        n: 4,
        working: "Fault: the marks may have worn off, or the trout may not have mixed back through the lake in two weeks. Improvement: use a tag that lasts, and leave longer between the two catches so the marked fish spread out.",
        decision:
          "The criticism has to be about **this** procedure. The Summer 2024 examiners said critiques were often generic — 'the sample is too small' — when the marks were for faults in the method described.",
        earns: ["A1"],
      },
    ],
    finalAnswer: `About ${D.we2} trout`,
    twin: {
      stem: "36 beetles are caught, marked and released. Later, 45 beetles are caught and 6 are marked. Estimate the beetle population.",
      answer: {
        kind: "numeric",
        value: recapture(36, 45, 6),
        tolerance: { type: "exact" },
        unitRequired: false,
        acceptForms: ["decimal"],
      },
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
    specRefs: ["M4-HD-01"],
    paper: PAPER,
    stem: `The table shows the time $t$, in minutes, that 150 customers waited to be served.\n\n$0 < t \\le 10$: 24; $10 < t \\le 20$: 36; $20 < t \\le 30$: 48; $30 < t \\le 50$: 30; $50 < t \\le 80$: 12.\n\nA stratified sample of 30 customers is taken **from those who waited longer than 20 minutes**. Estimate how many customers in this sample waited between 25 and 40 minutes.`,
    steps: [
      {
        n: 1,
        working: `Those who waited longer than 20 minutes: $48 + 30 + 12 = ${D.we3sub}$`,
        decision:
          "The sample is not taken from all 150. The first job is to find the population the sample actually comes from, and 150 must not appear again.",
        earns: ["M1"],
        whyMenu: {
          options: [
            "Because the sample is drawn only from the customers who waited over 20 minutes",
            "Because 150 is too large a number to divide by",
            "Because the first two rows are not needed for any part of the question",
          ],
          correct: 0,
          explain:
            "The stem restricts the sample to a subgroup, so that subgroup is the population for this calculation. Using 150 gives an answer roughly half the right size.",
        },
      },
      {
        n: 2,
        working: `Between 25 and 30: half of the $20 < t \\le 30$ class $= \\tfrac{5}{10} \\times 48 = ${slice(25, 40, 20, 30, 48)}$`,
        decision:
          "25 to 30 is 5 minutes out of the 10-minute class, so take that fraction of its frequency. This assumes the waits are spread evenly through the class, which is why the answer is an estimate.",
        earns: ["MA1"],
      },
      {
        n: 3,
        working: `Between 30 and 40: $\\tfrac{10}{20} \\times 30 = ${slice(25, 40, 30, 50, 30)}$, so the group of interest is $24 + 15 = ${D.we3want}$`,
        decision: "Same idea for the wider class: 10 minutes out of 20. Add the two pieces to get the number of customers we are sampling from.",
        earns: ["MA1"],
      },
      {
        n: 4,
        working: `$\\dfrac{${D.we3want}}{${D.we3sub}} \\times ${D.we3sample} = ${D.we3ans}$`,
        decision:
          "Now the stratified rule, with the subgroup as the population. November 2025 examiners: of the candidates who had the frequencies right, many still did not scale them to the sample size.",
        earns: ["A1"],
      },
    ],
    finalAnswer: `${D.we3ans} customers`,
    twin: {
      stem: "Using the same table, a stratified sample of 45 customers is taken from those who waited longer than 10 minutes. Estimate how many in this sample waited between 15 and 35 minutes.",
      answer: {
        kind: "numeric",
        value: share(
          sum(D.we3table.map((c) => slice(15, 35, c.lo, c.hi, c.f))),
          sum(D.we3table.filter((c) => c.lo >= 10).map((c) => c.f)),
          45,
        ),
        tolerance: { type: "absolute", value: 0.5 },
        unitRequired: false,
        acceptForms: ["decimal"],
      },
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
    specRefs: ["M4-HD-01"],
    when: "pre",
    items: [
      {
        id: "01",
        stem: "A town has 4000 residents; 600 are aged over 70. A stratified sample of 200 residents is taken. How many should be over 70?",
        skill: "Apply the stratified rule to one group",
        options: [
          opt("a", "30", true, "600 ÷ 4000 × 200 = 30. The group is 15% of the town, so it is 15% of the sample."),
          opt("b", "600", false, "That is the whole group in the town. A sample of 200 cannot contain 600 people; the group's count has to be scaled down to the sample.", "maths.sampling.stratified-stops-at-group-count"),
          opt("c", "50", false, "The sample was split equally between groups. A stratified sample keeps each group's share, not equal shares.", "maths.sampling.stratified-stops-at-group-count"),
          opt("d", "1333", false, "The fraction was used upside down: 4000 ÷ 600 × 200. Group size goes on top, population underneath.", "maths.sampling.proportion-inverted"),
        ],
        secondsExpected: 25,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "02",
        stem: "A stratified sample of 50 is taken from 720 people. One group has 168 people. How many of them are in the sample?",
        skill: "Round a stratum share to a whole person",
        options: [
          opt("a", "12", true, "168 ÷ 720 × 50 = 11.67, and people are whole, so 12."),
          opt("b", "11.67", false, "The arithmetic is right, but 11.67 people is not something you can sample. Round to the nearest whole person.", "maths.sampling.people-not-whole-number"),
          opt("c", "11", false, "11.67 rounds up, not down. Round to the nearest whole number unless the question says otherwise.", "maths.sampling.people-not-whole-number"),
          opt("d", "168", false, "That is the size of the group in the population, not its share of a sample of 50.", "maths.sampling.stratified-stops-at-group-count"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "03",
        stem: "30 birds are caught, ringed and released. Later, 40 birds are caught and 5 are ringed. Which equation estimates the population $N$?",
        skill: "Set up the capture-recapture proportion",
        options: [
          opt("a", "$\\dfrac{5}{40} = \\dfrac{30}{N}$", true, "The proportion ringed in the second catch equals the proportion ringed in the whole population."),
          opt("b", "$\\dfrac{5}{40} = \\dfrac{N}{30}$", false, "The fraction on the right is upside down. The ringed birds, 30, are the part; N is the whole.", "maths.sampling.proportion-inverted"),
          opt("c", "$N = 30 + 40 - 5$", false, "Adding the two catches counts birds, not proportions, and gives a number far too small. The method compares fractions.", "maths.sampling.capture-recapture-no-start"),
          opt("d", "$N = 5 \\times 40$", false, "That has no connection to the 30 ringed birds. Every number in the stem has to appear in the proportion.", "maths.sampling.capture-recapture-no-start"),
        ],
        secondsExpected: 35,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "04",
        stem: "A capture-recapture calculation gives $N = 146.67$. What should be written on the answer line?",
        skill: "Give a population estimate as a whole number",
        options: [
          opt("a", "About 147 animals", true, "Animals are whole, and the word 'estimate' in the question does not excuse a decimal."),
          opt("b", "146.67 animals", false, "The arithmetic is right but 0.67 of an animal cannot exist. The examiners named this loss in Summer 2024.", "maths.sampling.people-not-whole-number"),
          opt("c", "146.7 animals", false, "Rounding to 1 decimal place does not fix it: the unit is animals, so the answer is a whole number.", "maths.sampling.people-not-whole-number"),
          opt("d", "100 animals", false, "Rounding to 1 significant figure throws away accuracy the calculation earned. Round to the nearest whole animal.", "maths.sampling.people-not-whole-number"),
        ],
        secondsExpected: 20,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "05",
        stem: "A table has 200 people in total. A stratified sample of 20 is taken **from the 80 people aged over 40**. Which total goes on the bottom of the fraction?",
        skill: "Sample from a subgroup, not the whole table",
        options: [
          opt("a", "80", true, "The sample comes from that subgroup, so the subgroup is the population for this calculation."),
          opt("b", "200", false, "The sample is not drawn from everyone. Using 200 makes every answer less than half the size it should be.", "maths.sampling.whole-population-not-subgroup"),
          opt("c", "20", false, "20 is the sample size, which multiplies the fraction; it is not the population.", "maths.sampling.proportion-inverted"),
          opt("d", "120", false, "That is the number aged 40 or under — the people the sample is not taken from.", "maths.sampling.whole-population-not-subgroup"),
        ],
        secondsExpected: 30,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "06",
        stem: "A class in a table is $20 < t \\le 30$ with frequency 48. Estimate how many values lie between 25 and 30.",
        skill: "Split a class proportionally",
        options: [
          opt("a", "24", true, "25 to 30 is 5 of the 10 minutes, so take half the frequency, assuming an even spread."),
          opt("b", "48", false, "That is the whole class, 20 to 30. Only the part above 25 is wanted.", "maths.sampling.whole-population-not-subgroup"),
          opt("c", "5", false, "5 is the width of the part in minutes, not a number of customers.", "maths.histograms.plot-frequency-not-density"),
          opt("d", "9.6", false, "48 has been divided by 5 instead of multiplied by the fraction 5/10. Multiply the frequency by the share of the class you want.", "maths.sampling.proportion-inverted"),
        ],
        secondsExpected: 35,
        confidence: true,
        hypercorrectionQueue: true,
      },
      {
        id: "07",
        stem: "A survey of 200 people at a leisure centre contains 24 people aged over 65, although 22% of the town is over 65. Which comment would earn the reasoning mark?",
        skill: "Argue from the numbers given, not from memorised points",
        options: [
          opt("a", "22% of 200 is 44, but only 24 were asked, so the over-65s are under-represented", true, "The mark comes from doing the one calculation the data allows and comparing the two numbers."),
          opt("b", "The sample is too small to be representative", false, "A memorised point with no use of the figures. Summer 2025 examiners said strong candidates lost this mark by listing principles instead of calculating.", "maths.sampling.generic-critique"),
          opt("c", "The sample is biased", false, "This names a conclusion without evidence. Say which group is over- or under-represented and by how much.", "maths.stats.generic-reason-not-data-specific"),
          opt("d", "24 out of 200 is a small number of people", false, "A comment on size rather than proportion. Compare 24 with the 44 the town's percentage would predict.", "maths.sampling.generic-critique"),
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
  specRefs: ["M4-HD-01"],
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

const numExact = (value, unit) => ({
  kind: "numeric",
  value,
  tolerance: { type: "exact" },
  ...(unit ? { unit, unitRequired: false } : { unitRequired: false }),
  acceptForms: ["decimal"],
});

const CE = {
  stops: (value, marks, src) => ({
    misconception: "maths.sampling.stratified-stops-at-group-count",
    pattern: { kind: "numeric", value },
    feedback:
      "That is the size of the group in the population, not its share of the sample. Multiply the group's fraction by the sample size; the whole point of the method is to scale down.",
    marksTypicallyEarned: marks,
    source: src ?? "ccea-cer:maths:2025-november:M4:Q23",
  }),
  inverted: (value, marks) => ({
    misconception: "maths.sampling.proportion-inverted",
    pattern: { kind: "numeric", value },
    feedback: "The fraction is upside down. The group size goes on top and the population underneath, then multiply by the sample size.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-summer:M4:Q15",
  }),
  notWhole: (value, marks) => ({
    misconception: "maths.sampling.people-not-whole-number",
    pattern: { kind: "numeric", value },
    feedback:
      "The arithmetic is right and earns its method mark; the answer line still needs a whole number of people. Round it, and say which group it belongs to.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2024-summer:M4:Q15",
  }),
  wholePop: (value, marks) => ({
    misconception: "maths.sampling.whole-population-not-subgroup",
    pattern: { kind: "numeric", value },
    feedback:
      "The total of the whole table was used underneath. The sample is drawn only from the subgroup named in the question, so that subgroup's total is the population here.",
    marksTypicallyEarned: marks,
    source: "ccea-cer:maths:2025-summer:M4:Q22",
  }),
};

const questions = [
  question({
    id: qid(1),
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["stratified sample"],
    setting: "A single group inside a population of 800",
    verbs: { main: "work-out" },
    parts: [
      part({
        stem: "A population of 800 people contains a group of 200. A stratified sample of 40 people is taken. Work out how many of the group should be in the sample.",
        marks: 2,
        answer: numExact(D.q1),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "200 ÷ 800 × 40 seen" },
          { id: "A1", code: "A", marks: 1, for: `${D.q1}`, dependsOn: ["MA1"] },
        ],
        hints: ["Group ÷ population × sample size.", "200 out of 800 is a quarter."],
        workedSolution: `$\\dfrac{200}{800} \\times 40 = ${D.q1}$ people.`,
        commonErrors: [CE.stops(200, 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q18"],
    solutionProgram: `share(200,800,40) = 0.25*40 = ${D.q1}`,
  }),
  question({
    id: qid(2),
    style: "practice",
    difficulty: 1,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["stratified sample"],
    setting: "A single group inside a population of 1200",
    verbs: { main: "work-out" },
    parts: [
      part({
        stem: "A stratified sample of 80 is taken from a population of 1200. One group contains 450 people. Work out how many of them should be in the sample.",
        marks: 2,
        answer: numExact(D.q2),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "450 ÷ 1200 × 80 seen" },
          { id: "A1", code: "A", marks: 1, for: `${D.q2}`, dependsOn: ["MA1"] },
        ],
        hints: ["Group ÷ population × sample size.", "450 ÷ 1200 = 0.375."],
        workedSolution: `$\\dfrac{450}{1200} \\times 80 = 0.375 \\times 80 = ${D.q2}$ people.`,
        commonErrors: [CE.inverted(213, 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q18"],
    solutionProgram: `share(450,1200,80) = 0.375*80 = ${D.q2}`,
  }),
  question({
    id: qid(3),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Work out"],
    emphasis: ["stratified sample", "rounding"],
    setting: "A single group inside a population of 640",
    verbs: { main: "work-out" },
    parts: [
      part({
        stem: "A stratified sample of 50 is taken from 640 members of a leisure centre. One group contains 176 members. Work out how many of them should be in the sample.",
        marks: 2,
        answer: numExact(D.q3),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `176 ÷ 640 × 50 = ${D.q3raw}` },
          { id: "A1", code: "A", marks: 1, for: `${D.q3}, rounded to a whole member`, dependsOn: ["MA1"] },
        ],
        hints: ["Group ÷ population × sample size.", "The answer will not be a whole number until you round it."],
        workedSolution: `$\\dfrac{176}{640} \\times 50 = ${D.q3raw}$, so ${D.q3} members.`,
        commonErrors: [CE.notWhole(D.q3raw, 1)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q15"],
    solutionProgram: `share(176,640,50) = ${D.q3raw} -> round = ${D.q3}`,
  }),
  question({
    id: qid(4),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Complete"],
    emphasis: ["stratified sample", "table"],
    setting: "Three departments of a company of 800 staff",
    verbs: { main: "complete" },
    parts: [
      part({
        stem: "A company has 800 staff: 350 in production, 275 in sales and 175 in administration. Complete a stratified sample of 64 staff by giving the number from each department.",
        marks: 3,
        answer: {
          kind: "table",
          cells: [
            { row: 0, col: 0, value: D.q4[0] },
            { row: 0, col: 1, value: D.q4[1] },
            { row: 0, col: 2, value: D.q4[2] },
          ],
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "350 ÷ 800 × 64 (or any one department) seen" },
          { id: "MA2", code: "MA", marks: 1, for: `two of ${D.q4.join(", ")} correct`, dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: `all three correct: ${D.q4.join(", ")}, totalling 64`, dependsOn: ["MA1"] },
        ],
        hints: ["The same calculation three times.", "350 + 275 + 175 = 800.", "Your three answers should add to 64."],
        workedSolution: `Production $\\dfrac{350}{800} \\times 64 = ${D.q4[0]}$; sales $\\dfrac{275}{800} \\times 64 = ${D.q4[1]}$; administration $\\dfrac{175}{800} \\times 64 = ${D.q4[2]}$. Check: $${D.q4.join(" + ")} = ${sum(D.q4)}$.`,
        commonErrors: [
          {
            misconception: "maths.sampling.stratified-stops-at-group-count",
            pattern: { kind: "text", regex: "21\\D+21\\D+22" },
            feedback:
              "The sample has been divided equally between the three departments. Stratified means each department keeps its share of the workforce, so the biggest department sends the most staff.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M4:Q18",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q18"],
    solutionProgram: `shares of 64 from 350/275/175 of 800 = ${D.q4.join(", ")}; total ${sum(D.q4)}`,
  }),
  question({
    id: qid(5),
    style: "practice",
    difficulty: 3,
    ao: ["AO2"],
    commandWords: ["Work out"],
    emphasis: ["reverse", "sample size"],
    setting: "A stratified sample of unknown size",
    verbs: { main: "work-out" },
    parts: [
      part({
        stem: "A stratified sample is taken from 960 students. One group of 120 students contributes 9 students to the sample. Work out the size of the whole sample.",
        marks: 2,
        answer: numExact(D.q5),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "120 ÷ 960 × n = 9, or 9 ÷ (120 ÷ 960) seen" },
          { id: "A1", code: "A", marks: 1, for: `${D.q5}`, dependsOn: ["MA1"] },
        ],
        hints: ["Write the usual rule with the sample size as the unknown.", "120 ÷ 960 = 0.125, so 0.125n = 9."],
        workedSolution: `$\\dfrac{120}{960} \\times n = 9$, so $0.125n = 9$ and $n = ${D.q5}$.`,
        commonErrors: [CE.inverted(72 * 8, 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q18"],
    solutionProgram: `0.125 n = 9 -> n = ${D.q5}`,
  }),
  question({
    id: qid(6),
    style: "practice",
    difficulty: 3,
    ao: ["AO2"],
    commandWords: ["Work out"],
    emphasis: ["reverse", "group size"],
    setting: "A stratified sample of 45 from a population of 1500",
    verbs: { main: "work-out" },
    parts: [
      part({
        stem: "A stratified sample of 45 people is taken from a population of 1500. One group contributes 12 people to the sample. Work out the size of that group in the population.",
        marks: 2,
        answer: numExact(D.q6),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "12 ÷ 45 × 1500 seen, or g ÷ 1500 × 45 = 12" },
          { id: "A1", code: "A", marks: 1, for: `${D.q6}`, dependsOn: ["MA1"] },
        ],
        hints: ["The group's share of the sample equals its share of the population.", "12 out of 45 of the population of 1500."],
        workedSolution: `$\\dfrac{12}{45} = \\dfrac{g}{1500}$, so $g = \\dfrac{12}{45} \\times 1500 = ${D.q6}$ people.`,
        commonErrors: [CE.inverted(5625, 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q18"],
    solutionProgram: `g = (12/45)*1500 = ${D.q6}`,
  }),
  question({
    id: qid(7),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["population estimate"],
    setting: "Marked and recaptured squirrels in a wood",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "40 squirrels are caught in a wood, marked and released. Later, 50 squirrels are caught and 8 of them are marked. Calculate an estimate of the number of squirrels in the wood.",
        marks: 2,
        answer: numExact(D.q7),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "8/50 = 40/N, or 40 × 50 ÷ 8 seen" },
          { id: "A1", code: "A", marks: 1, for: `${D.q7}`, dependsOn: ["MA1"] },
        ],
        hints: ["The proportion marked in the second catch equals the proportion marked in the wood.", "8 out of 50 is the same as 40 out of N."],
        workedSolution: `$\\dfrac{8}{50} = \\dfrac{40}{N}$, so $N = \\dfrac{40 \\times 50}{8} = ${D.q7}$ squirrels.`,
        commonErrors: [
          {
            misconception: "maths.sampling.capture-recapture-no-start",
            pattern: { kind: "numeric", value: 82 },
            feedback:
              "The three numbers have been added and the overlap taken off. This method compares proportions, not counts: set the fraction marked in the catch equal to the fraction marked in the wood.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M4:Q15",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q15"],
    solutionProgram: `recapture(40,50,8) = 40*50/8 = ${D.q7}`,
  }),
  question({
    id: qid(8),
    style: "practice",
    difficulty: 2,
    ao: ["AO1"],
    commandWords: ["Calculate"],
    emphasis: ["population estimate"],
    setting: "Marked and recaptured newts in a pond",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "15 newts are caught in a pond, marked and released. Later, 24 newts are caught and 2 of them are marked. Calculate an estimate of the number of newts in the pond.",
        marks: 2,
        answer: numExact(D.q8),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "2/24 = 15/N, or 15 × 24 ÷ 2 seen" },
          { id: "A1", code: "A", marks: 1, for: `${D.q8}`, dependsOn: ["MA1"] },
        ],
        hints: ["Set the two proportions equal.", "2 out of 24 is one in twelve."],
        workedSolution: `$\\dfrac{2}{24} = \\dfrac{15}{N}$, so $N = \\dfrac{15 \\times 24}{2} = ${D.q8}$ newts.`,
        commonErrors: [CE.inverted(Math.round((2 * 15) / 24), 0)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q15"],
    solutionProgram: `recapture(15,24,2) = 15*24/2 = ${D.q8}`,
  }),
  question({
    id: qid(9),
    style: "practice",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Calculate"],
    emphasis: ["population estimate", "whole number"],
    setting: "Marked and recaptured beetles in a field",
    verbs: { main: "calculate" },
    parts: [
      part({
        stem: "25 beetles are caught in a field, marked and released. Later, 32 beetles are caught and 7 of them are marked. Calculate an estimate of the number of beetles in the field.",
        marks: 3,
        answer: numExact(D.q9),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "7/32 = 25/N seen" },
          { id: "MA2", code: "MA", marks: 1, for: `N = 25 × 32 ÷ 7 = ${f2(D.q9raw)}`, dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: `${D.q9} beetles (accept 115), given as a whole number`, dependsOn: ["MA2"] },
        ],
        hints: ["Set the two proportions equal.", "The division does not come out exactly.", "Beetles are whole creatures."],
        workedSolution: `$\\dfrac{7}{32} = \\dfrac{25}{N}$, so $N = \\dfrac{25 \\times 32}{7} = ${f2(D.q9raw)}$, which is about ${D.q9} beetles.`,
        commonErrors: [CE.notWhole(Number(f2(D.q9raw)), 2)],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q15"],
    solutionProgram: `recapture(25,32,7) = 800/7 = ${D.q9raw} -> whole number ${D.q9}`,
  }),
  question({
    id: qid(10),
    style: "practice",
    difficulty: 4,
    ao: ["AO2"],
    commandWords: ["Estimate"],
    emphasis: ["stratified sample", "subgroup"],
    setting: "Ages of 500 members of a gym",
    verbs: { main: "estimate" },
    parts: [
      part({
        stem: "A gym has 500 members: 120 aged 16 to 25, 150 aged 26 to 35, 140 aged 36 to 50 and 90 aged 51 to 70. A stratified sample of 60 members is taken **from those aged 36 and over**. Estimate how many members in this sample are aged 51 to 70.",
        marks: 3,
        answer: numExact(D.q10),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `aged 36 and over = 140 + 90 = ${D.q10sub}` },
          { id: "MA2", code: "MA", marks: 1, for: `90 ÷ ${D.q10sub} × 60 = ${f2(D.q10raw)}`, dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: `${D.q10} members`, dependsOn: ["MA2"] },
        ],
        hints: ["The sample is not taken from all 500.", "Add the two groups aged 36 and over first.", "Round to a whole member."],
        workedSolution: `Members aged 36 and over: $140 + 90 = ${D.q10sub}$. Then $\\dfrac{90}{${D.q10sub}} \\times 60 = ${f2(D.q10raw)}$, so ${D.q10} members.`,
        commonErrors: [
          CE.wholePop(Math.round(share(90, 500, 60)), 0),
          CE.notWhole(Number(f2(D.q10raw)), 2),
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q22", "ccea-cer:maths:2025-november:M4:Q23"],
    solutionProgram: `sub = 140 + 90 = ${D.q10sub}; share(90, ${D.q10sub}, 60) = ${D.q10raw} -> ${D.q10}; the other group gives ${D.q10other}, and ${D.q10} + ${D.q10other} = 60`,
  }),
  question({
    id: qid(11),
    style: "practice",
    difficulty: 4,
    ao: ["AO2", "AO3"],
    commandWords: ["Estimate"],
    emphasis: ["stratified sample", "subgroup", "class split"],
    setting: "Masses of 240 parcels in a depot",
    verbs: { main: "estimate" },
    parts: [
      part({
        stem: "The table shows the mass $m$, in kg, of 240 parcels.\n\n$0 < m \\le 5$: 40; $5 < m \\le 10$: 64; $10 < m \\le 20$: 80; $20 < m \\le 40$: 56.\n\nA stratified sample of 44 parcels is taken from those with mass over 10 kg. Estimate how many parcels in this sample have a mass between 15 kg and 30 kg.",
        marks: 4,
        answer: numExact(D.q11),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `parcels over 10 kg = 80 + 56 = ${D.q11sub}` },
          { id: "MA2", code: "MA", marks: 1, for: `15 to 20 kg: (5/10) × 80 = ${slice(15, 30, 10, 20, 80)}` },
          { id: "MA3", code: "MA", marks: 1, for: `20 to 30 kg: (10/20) × 56 = ${slice(15, 30, 20, 40, 56)}, total ${D.q11want}`, dependsOn: ["MA2"] },
          { id: "A1", code: "A", marks: 1, for: `${D.q11want} ÷ ${D.q11sub} × 44 = ${D.q11} parcels`, dependsOn: ["MA1", "MA3"] },
        ],
        hints: [
          "First find how many parcels the sample is drawn from.",
          "15 to 20 kg is half of the 10 to 20 class.",
          "20 to 30 kg is half of the 20 to 40 class.",
          "Then scale that total down to the sample of 44.",
        ],
        workedSolution: `Over 10 kg: $80 + 56 = ${D.q11sub}$ parcels. Between 15 and 30 kg: $\\tfrac{5}{10} \\times 80 = ${slice(15, 30, 10, 20, 80)}$ and $\\tfrac{10}{20} \\times 56 = ${slice(15, 30, 20, 40, 56)}$, so $${D.q11want}$ parcels. Sample: $\\dfrac{${D.q11want}}{${D.q11sub}} \\times 44 = ${D.q11}$ parcels.`,
        commonErrors: [
          CE.wholePop(Math.round(share(D.q11want, 240, 44)), 2),
          CE.stops(D.q11want, 3),
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q22", "ccea-cer:maths:2025-november:M4:Q23"],
    solutionProgram: `sub = 80 + 56 = ${D.q11sub}; want = 40 + 28 = ${D.q11want}; share(${D.q11want}, ${D.q11sub}, 44) = ${D.q11}`,
  }),
  question({
    id: qid(12),
    style: "practice",
    difficulty: 3,
    ao: ["AO3"],
    commandWords: ["State", "Give a reason"],
    emphasis: ["criticise the method"],
    setting: "A survey carried out at one time and place",
    verbs: { main: "state" },
    parts: [
      part({
        stem: "A researcher stands outside a supermarket between 10 am and 11 am on a Tuesday and asks the first 50 shoppers how often they buy fresh fish. State one fault with this sampling method and suggest one improvement.",
        marks: 2,
        answer: {
          kind: "text",
          accepted: [
            "Only people who shop on a weekday morning can be asked, so people at work are left out; ask at several different times and on different days",
            "Everyone asked already shops at this supermarket, so it says nothing about shoppers elsewhere; survey at more than one shop",
          ],
          keyWords: [
            { any: ["weekday morning", "time of day", "one shop", "only shoppers", "people at work", "same supermarket"], marks: 1 },
            { any: ["different times", "different days", "several shops", "more than one", "spread"], marks: 1, reject: ["bigger sample"] },
          ],
          listingRule: true,
        },
        scheme: [
          {
            id: "A1",
            code: "A",
            marks: 1,
            for: "a fault tied to this method: one time of day, one day of the week, or one shop, so a whole group of shoppers cannot appear",
            reject: ["the sample is too small", "it is biased (with no reason)"],
          },
          {
            id: "A2",
            code: "A",
            marks: 1,
            for: "an improvement that repairs the stated fault: survey at several times, on several days, or at more than one shop",
            reject: ["ask more people"],
          },
        ],
        hints: [
          "Ask yourself who could never be asked by this method.",
          "The improvement must fix the fault you named, not just enlarge the sample.",
        ],
        workedSolution:
          "Fault: everyone asked is a weekday-morning shopper at one supermarket, so people who work during the day, or shop elsewhere, cannot be chosen. Improvement: repeat the survey at several different times and on different days, and at more than one shop.",
        commonErrors: [
          {
            misconception: "maths.sampling.generic-critique",
            pattern: { kind: "text", regex: "too small|not enough people|bigger sample" },
            feedback:
              "This is the memorised answer, and it does not describe anything in the method given. Name the group this procedure can never reach, then say what would reach them.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M4:Q15",
          },
        ],
        requiresWorking: false,
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q15", "ccea-cer:maths:2025-summer:M4:Q18"],
    solutionProgram: "No numeric answer: the two marks are one specific fault and one matching improvement",
  }),
  question({
    id: qid(13),
    style: "practice",
    difficulty: 4,
    ao: ["AO3"],
    commandWords: ["Explain"],
    emphasis: ["reasoning with the data"],
    setting: "A club sample tested for representativeness",
    verbs: { main: "explain" },
    parts: [
      part({
        stem: "A club has 180 members, of whom 45 are juniors. A sample of 60 members is taken, and 9 of them are juniors. Explain whether this sample represents the club's junior members fairly. Use the figures in your answer.",
        marks: 3,
        answer: {
          kind: "text",
          accepted: [
            "45 out of 180 is 25%, and 25% of 60 is 15, but only 9 juniors were chosen, so juniors are under-represented",
          ],
          keyWords: [
            { any: ["25%", "one quarter", "45/180", "0.25"], marks: 1 },
            { any: ["15"], marks: 1 },
            { any: ["under-represented", "fewer than expected", "too few juniors", "not fairly"], marks: 1 },
          ],
          listingRule: false,
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "45 ÷ 180 = 0.25, or 25%, seen" },
          { id: "MA2", code: "MA", marks: 1, for: `0.25 × 60 = ${D.q13expected} juniors expected`, dependsOn: ["MA1"] },
          {
            id: "A1",
            code: "A",
            marks: 1,
            for: `comparison stated: 9 is fewer than ${D.q13expected}, so juniors are under-represented`,
            dependsOn: ["MA2"],
            examinerNote: "A memorised comment about representativeness with no calculation scores nothing.",
          },
        ],
        hints: [
          "Work out what fraction of the club is junior.",
          "Apply that fraction to the sample of 60 to see how many juniors you would expect.",
          "Compare that with the 9 actually chosen, and say which way it goes.",
        ],
        workedSolution: `Juniors are $\\dfrac{45}{180} = 25\\%$ of the club. A fair sample of 60 would contain $0.25 \\times 60 = ${D.q13expected}$ juniors, but only 9 were chosen, so juniors are under-represented in this sample.`,
        commonErrors: [
          {
            misconception: "maths.stats.generic-reason-not-data-specific",
            pattern: { kind: "text", regex: "random|biased|too small" },
            feedback:
              "The reasoning mark comes from the numbers in the question. Summer 2025 examiners said even strong candidates listed memorised points; those who did the one calculation the data allowed scored.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-summer:M4:Q18",
          },
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q18"],
    solutionProgram: `45/180 = 0.25; 0.25*60 = ${D.q13expected} expected; 9 actual, so under-represented`,
  }),
  question({
    id: qid(14),
    style: "practice",
    difficulty: 4,
    ao: ["AO2", "AO3"],
    commandWords: ["Work out", "Explain"],
    emphasis: ["stratified sample", "rounding", "total"],
    setting: "Four year groups whose rounded shares do not add to the sample size",
    verbs: { a: "work-out", b: "explain" },
    parts: [
      part({
        id: "a",
        stem: `A college has ${D.q14pop} students: ${D.q14groups[0]} in Year 11, ${D.q14groups[1]} in Year 12, ${D.q14groups[2]} in Year 13 and ${D.q14groups[3]} in Year 14. A stratified sample of 50 students is taken. Work out the number from each year group, rounded to the nearest whole student.`,
        marks: 2,
        answer: {
          kind: "table",
          cells: D.q14round.map((v, i) => ({ row: 0, col: i, value: v })),
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `${D.q14groups[0]} ÷ ${D.q14pop} × 50 = ${f2(D.q14raw[0])} (or any one group) seen` },
          { id: "A1", code: "A", marks: 1, for: `${D.q14round.join(", ")}`, dependsOn: ["MA1"] },
        ],
        hints: ["Group ÷ population × sample size, four times.", "Keep two decimal places before rounding."],
        workedSolution: `The four unrounded shares are $${D.q14raw.map((x) => f2(x)).join("$, $")}$, which round to ${D.q14round.join(", ")}.`,
        commonErrors: [CE.stops(D.q14groups[0], 0)],
      }),
      part({
        id: "b",
        stem: "Your four numbers do not add to 50. Explain which year group should provide the extra student, and why.",
        marks: 2,
        answer: {
          kind: "text",
          accepted: [
            "The four rounded numbers add to 49, so one more is needed; Year 13's unrounded value 11.38 was the furthest below a whole number, so Year 13 provides the extra student",
          ],
          keyWords: [
            { any: ["49", "one short", "one more"], marks: 1 },
            { any: ["Year 13", "11.38", "largest decimal", "furthest", "rounded down the most"], marks: 1 },
          ],
          listingRule: false,
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `${D.q14round.join(" + ")} = ${sum(D.q14round)}, which is ${D.q14shortfall} short of 50`, ft: true },
          {
            id: "A1",
            code: "A",
            marks: 1,
            for: `Year ${11 + D.q14biggestRemainder} takes the extra student, because its unrounded value ${f2(D.q14raw[D.q14biggestRemainder])} had the largest fractional part and so was rounded down by the most`,
            dependsOn: ["MA1"],
          },
        ],
        hints: [
          "Add your four rounded numbers and compare with 50.",
          "Look back at the unrounded figures and find the one that lost the most in rounding.",
        ],
        workedSolution: `$${D.q14round.join(" + ")} = ${sum(D.q14round)}$, which is ${D.q14shortfall} short of the 50 required. The unrounded values were $${D.q14raw.map((x) => f2(x)).join("$, $")}$; the largest fractional part is $0.${String(f2(D.q14raw[D.q14biggestRemainder])).split(".")[1]}$ in Year ${11 + D.q14biggestRemainder}, so that group provides the extra student and the sample is complete.`,
        commonErrors: [
          {
            misconception: "maths.sampling.people-not-whole-number",
            pattern: { kind: "text", regex: "leave it|does not matter|49 is fine" },
            feedback:
              "The sample must contain the number of students asked for. One group takes the extra place, and the fairest choice is the one whose exact share was cut back the most by rounding.",
            marksTypicallyEarned: 1,
          },
        ],
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q18"],
    solutionProgram: `raw shares of 50 from ${D.q14groups.join("/")} of ${D.q14pop} = ${D.q14raw.map((x) => f2(x)).join(", ")}; rounded ${D.q14round.join(", ")} sum ${sum(D.q14round)}; shortfall ${D.q14shortfall}; largest fractional part index ${D.q14biggestRemainder}`,
  }),

  // ---- exam-style ----
  question({
    id: qid(15),
    style: "exam-style",
    difficulty: 3,
    ao: ["AO1", "AO2"],
    commandWords: ["Complete"],
    emphasis: ["stratified sample", "table"],
    setting: "Four age groups in a sports club of 900 members",
    verbs: { main: "complete" },
    figures: [
      svgFigure(
        POP_SAMPLE_FIG,
        "A long bar showing a population of 900 club members split into four age groups of 180, 240, 150 and 330, and a shorter bar beneath showing a stratified sample of 60 split into 12, 16, 10 and 22.",
      ),
    ],
    parts: [
      part({
        stem: `A sports club has 900 members: ${D.e1groups.map((g) => `${g.n} ${g.label.toLowerCase()}`).join(", ")}.\n\nA stratified sample of 60 members is to be taken. Complete the table to show how many members from each age group should be in the sample. Show your working out clearly.`,
        marks: 4,
        answer: {
          kind: "table",
          cells: D.e1.map((v, i) => ({ row: 0, col: i, value: v })),
        },
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "180 ÷ 900 × 60 (or any one group) seen as the method" },
          { id: "MA2", code: "MA", marks: 1, for: `two of ${D.e1.join(", ")} correct`, dependsOn: ["MA1"] },
          { id: "MA3", code: "MA", marks: 1, for: `all four correct: ${D.e1.join(", ")}`, dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: "the four entries checked against the sample size: they total 60", dependsOn: ["MA3"] },
        ],
        hints: [
          "Each group keeps its share: group ÷ 900 × 60.",
          "180 out of 900 is one fifth.",
          "Add your four answers — they must come to 60.",
        ],
        workedSolution: `${D.e1groups
          .map((g, i) => `${g.label}: $\\dfrac{${g.n}}{900} \\times 60 = ${D.e1[i]}$`)
          .join("; ")}. Check: $${D.e1.join(" + ")} = ${sum(D.e1)}$.`,
        commonErrors: [
          {
            misconception: "maths.sampling.stratified-stops-at-group-count",
            pattern: { kind: "text", regex: "15\\D+15\\D+15\\D+15" },
            feedback:
              "The 60 has been shared equally between the four groups. Stratified sampling keeps each group's proportion, so the 330-strong group must send far more than the 150-strong one.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2023-summer:M4:Q18",
          },
          CE.inverted(300, 0),
        ],
      }),
    ],
    examinerSources: ["ccea-cer:maths:2023-summer:M4:Q18"],
    solutionProgram: `shares of 60 from ${D.e1groups.map((g) => g.n).join("/")} of 900 = ${D.e1.join(", ")}; total ${sum(D.e1)}`,
  }),
  question({
    id: qid(16),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO2", "AO3"],
    commandWords: ["Calculate", "State"],
    emphasis: ["population estimate", "criticise the method"],
    setting: "Marking and recapturing newts in a pond over two weeks",
    verbs: { a: "calculate", b: "state" },
    parts: [
      part({
        id: "a",
        stem: "A conservation group catches 45 newts in a pond, marks each one and returns it to the pond. Two weeks later they catch 60 newts, and 9 of them are marked.\n\nCalculate an estimate of the number of newts in the pond.",
        marks: 3,
        answer: numExact(D.e2),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "proportion argument set up: 9/60 = 45/N (oe)" },
          { id: "MA1", code: "MA", marks: 1, for: "N = 45 × 60 ÷ 9", dependsOn: ["M1"] },
          { id: "A1", code: "A", marks: 1, for: `${D.e2} newts, as a whole number`, dependsOn: ["MA1"] },
        ],
        hints: [
          "The fraction of the second catch that is marked should match the fraction of the pond that is marked.",
          "9 out of 60 equals 45 out of N.",
          "Give a whole number of newts.",
        ],
        workedSolution: `$\\dfrac{9}{60} = \\dfrac{45}{N}$, so $N = \\dfrac{45 \\times 60}{9} = ${D.e2}$ newts.`,
        commonErrors: [
          {
            misconception: "maths.sampling.capture-recapture-no-start",
            pattern: { kind: "numeric", value: 96 },
            feedback:
              "The catches have been added rather than compared as proportions. Write the two fractions, marked over total on each side, and the method mark is secured even if the arithmetic slips.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M4:Q15",
          },
          CE.inverted(Math.round((9 * 45) / 60), 0),
        ],
      }),
      part({
        id: "b",
        stem: "State one fault with this method of estimating the population, and suggest how it could be improved.",
        marks: 2,
        answer: {
          kind: "text",
          accepted: [
            "The marks may wear off in two weeks, so marked newts are counted as unmarked; use a longer-lasting tag",
            "Newts may have been born or died between the two catches; shorten the time between the catches",
            "The marked newts may not have mixed back through the pond; leave longer, or catch from several places in the pond",
          ],
          keyWords: [
            { any: ["marks wear off", "tag", "mixed", "born", "died", "same place", "two weeks"], marks: 1, reject: ["too small"] },
            { any: ["longer-lasting", "permanent", "shorter time", "longer time", "several places", "different parts"], marks: 1, reject: ["catch more newts"] },
          ],
          listingRule: true,
        },
        scheme: [
          {
            id: "A1",
            code: "A",
            marks: 1,
            for: "a fault in the procedure described: marks wearing off, newts not mixing back, or births and deaths in the two weeks",
            reject: ["the sample is too small", "it is not accurate"],
          },
          {
            id: "A2",
            code: "A",
            marks: 1,
            for: "an improvement that repairs the stated fault",
            dependsOn: ["A1"],
            reject: ["catch more newts (unless linked to a stated fault)"],
          },
        ],
        hints: [
          "What could change about the newts, or about the marks, in two weeks?",
          "The improvement has to fix the fault you named.",
        ],
        workedSolution:
          "Fault: over two weeks the marks may fade, so a marked newt in the second catch is recorded as unmarked and the estimate comes out too large. Improvement: use a tag that will still be visible, and check the marks carefully before recording.",
        commonErrors: [
          {
            misconception: "maths.sampling.generic-critique",
            pattern: { kind: "text", regex: "too small|not enough|more newts" },
            feedback:
              "This is the point most candidates gave in Summer 2024, and it was not what the marks were for. The examiners wanted a criticism of the procedure described — marking, waiting, recatching.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2024-summer:M4:Q15",
          },
        ],
        requiresWorking: false,
      }),
    ],
    examinerSources: ["ccea-cer:maths:2024-summer:M4:Q15"],
    solutionProgram: `recapture(45,60,9) = 45*60/9 = ${D.e2}`,
  }),
  question({
    id: qid(17),
    style: "exam-style",
    difficulty: 4,
    ao: ["AO2"],
    commandWords: ["Estimate"],
    emphasis: ["stratified sample", "grouped table", "class split"],
    setting: "Loan lengths of 300 library books",
    verbs: { a: "estimate", b: "estimate" },
    parts: [
      part({
        id: "a",
        stem: `A library records the number of days $d$ that each of 300 books was on loan.\n\n$0 < d \\le 7$: 66; $7 < d \\le 14$: 84; $14 < d \\le 28$: 98; $28 < d \\le 56$: 52.\n\nA stratified sample of 50 books is taken from all 300. Estimate how many books in the sample were on loan for 14 days or less.`,
        marks: 3,
        answer: numExact(D.e3a),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: "66 + 84 = 150 books on loan for 14 days or less" },
          { id: "MA2", code: "MA", marks: 1, for: "150 ÷ 300 × 50 seen", dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: `${D.e3a} books`, dependsOn: ["MA2"] },
        ],
        hints: ["Add the first two classes.", "The sample is taken from all 300 here.", "150 out of 300 is half."],
        workedSolution: `Books on loan for 14 days or less: $66 + 84 = 150$. Sample: $\\dfrac{150}{300} \\times 50 = ${D.e3a}$ books.`,
        commonErrors: [CE.stops(150, 1)],
      }),
      part({
        id: "b",
        stem: "A second stratified sample, of 30 books, is taken from those on loan for more than 14 days. Estimate how many books in this second sample were on loan for between 21 and 42 days.",
        marks: 3,
        answer: numExact(D.e3b),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `books on loan for more than 14 days = 98 + 52 = ${D.e3sub}` },
          { id: "MA2", code: "MA", marks: 1, for: `(7/14) × 98 = ${slice(21, 42, 14, 28, 98)} and (14/28) × 52 = ${slice(21, 42, 28, 56, 52)}, total ${D.e3want}`, dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: `${D.e3want} ÷ ${D.e3sub} × 30 = ${D.e3b} books`, dependsOn: ["MA2"] },
        ],
        hints: [
          "This sample comes only from the last two classes.",
          "21 to 28 days is half of the 14 to 28 class.",
          "28 to 42 days is half of the 28 to 56 class.",
        ],
        workedSolution: `More than 14 days: $98 + 52 = ${D.e3sub}$ books. Between 21 and 42 days: $\\tfrac{7}{14} \\times 98 = ${slice(21, 42, 14, 28, 98)}$ and $\\tfrac{14}{28} \\times 52 = ${slice(21, 42, 28, 56, 52)}$, giving $${D.e3want}$. Sample: $\\dfrac{${D.e3want}}{${D.e3sub}} \\times 30 = ${D.e3b}$ books.`,
        commonErrors: [
          CE.wholePop(Math.round(share(D.e3want, 300, 30)), 1),
          CE.stops(D.e3want, 2),
        ],
      }),
    ],
    methodLock: {
      instruction: "Estimate how many books in this second sample",
      requiredMethod:
        "Subgroup total underneath the fraction, with each part-class found by proportion of its width; using the 300 total earns no accuracy mark",
      evidence: "ccea-cer:maths:2025-summer:M4:Q22",
    },
    examinerSources: ["ccea-cer:maths:2025-summer:M4:Q22", "ccea-cer:maths:2025-november:M4:Q23"],
    solutionProgram: `(a) (66+84)/300*50 = ${D.e3a}; (b) sub = 98+52 = ${D.e3sub}; want = 49 + 26 = ${D.e3want}; ${D.e3want}/${D.e3sub}*30 = ${D.e3b}`,
  }),
  question({
    id: qid(18),
    style: "exam-style",
    difficulty: 5,
    ao: ["AO2", "AO3"],
    commandWords: ["Calculate", "Estimate", "Give a reason"],
    emphasis: ["histogram", "stratified sample", "reason"],
    setting: "A histogram of the heights of plants in a nursery",
    verbs: { a: "calculate", b: "estimate", c: "give-a-reason" },
    figures: [
      svgFigure(
        HISTOGRAM_FIG,
        "A histogram of plant heights in centimetres with frequency density on the vertical axis. The bars are 0 to 10 at density 3, 10 to 20 at density 5, 20 to 40 at density 4, 40 to 60 at density 2 and 60 to 100 at density 0.5.",
      ),
    ],
    parts: [
      part({
        id: "a",
        stem: "The histogram gives information about the heights of the plants in a nursery.\n\nCalculate the total number of plants represented by the histogram.",
        marks: 3,
        answer: numExact(D.e4total),
        scheme: [
          { id: "M1", code: "M", marks: 1, for: "frequency = frequency density × class width used for at least one bar" },
          { id: "MA1", code: "MA", marks: 1, for: `frequencies ${D.e4bars.map((b) => b.f).join(", ")}`, dependsOn: ["M1"] },
          { id: "A1", code: "A", marks: 1, for: `${D.e4total} plants`, dependsOn: ["MA1"] },
        ],
        hints: [
          "The height of a bar is frequency density, not frequency.",
          "Multiply each density by the width of its class.",
          "The classes are not all the same width.",
        ],
        workedSolution: `${D.e4bars
          .map((b) => `$${b.lo}$ to $${b.hi}$: $${b.fd} \\times ${b.hi - b.lo} = ${b.f}$`)
          .join("; ")}. Total $= ${D.e4total}$ plants.`,
        commonErrors: [
          {
            misconception: "maths.histograms.plot-frequency-not-density",
            pattern: { kind: "numeric", value: sum(D.e4bars.map((b) => b.fd)) },
            feedback:
              "The bar heights have been added as if they were frequencies. On a histogram the area of a bar is the frequency, so multiply each height by its class width first.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M4:Q23",
          },
        ],
      }),
      part({
        id: "b",
        stem: `A stratified sample of ${D.e4sample} plants is taken from the nursery. Estimate how many plants in the sample have a height of more than 50 cm.`,
        marks: 3,
        answer: numExact(D.e4b),
        scheme: [
          { id: "MA1", code: "MA", marks: 1, for: `plants over 50 cm: (10/20) × 40 = ${slice(50, 100, 40, 60, 40)} and 20 from the last bar, total ${D.e4want}`, ft: true },
          { id: "MA2", code: "MA", marks: 1, for: `${D.e4want} ÷ ${D.e4total} × ${D.e4sample} seen`, dependsOn: ["MA1"] },
          { id: "A1", code: "A", marks: 1, for: `${D.e4b} plants`, dependsOn: ["MA2"] },
        ],
        hints: [
          "50 cm falls in the middle of the 40 to 60 class.",
          "Take the part of that bar above 50, then all of the last bar.",
          "Scale the result down to the sample of 44.",
        ],
        workedSolution: `Above 50 cm: half of the 40 to 60 bar, $\\tfrac{10}{20} \\times 40 = ${slice(50, 100, 40, 60, 40)}$, plus all ${D.e4bars[4].f} of the 60 to 100 bar, giving $${D.e4want}$ plants. Sample: $\\dfrac{${D.e4want}}{${D.e4total}} \\times ${D.e4sample} = ${D.e4b}$ plants.`,
        commonErrors: [
          CE.stops(D.e4want, 1),
          {
            misconception: "maths.sampling.whole-population-not-subgroup",
            pattern: { kind: "numeric", value: Math.round(share(D.e4bars[4].f, D.e4total, D.e4sample)) },
            feedback:
              "Only the last bar was used. 50 cm cuts the 40 to 60 bar in half, so half of that bar's 40 plants belong in the group as well.",
            marksTypicallyEarned: 1,
            source: "ccea-cer:maths:2025-november:M4:Q23",
          },
        ],
        followThrough: { fromPart: "a", rule: "use-candidate-value" },
      }),
      part({
        id: "c",
        stem: "Give a reason why your answer to part (b) is only an estimate.",
        marks: 1,
        answer: {
          kind: "text",
          accepted: [
            "The individual heights inside each class are not known, so the plants are assumed to be spread evenly across the 40 to 60 class",
          ],
          keyWords: [
            { any: ["spread evenly", "evenly distributed", "exact heights not known", "assume", "grouped"], marks: 1, reject: ["the sample is small"] },
          ],
          listingRule: false,
        },
        scheme: [
          {
            id: "A1",
            code: "A",
            marks: 1,
            for: "the data is grouped, so splitting the 40 to 60 bar assumes the heights are spread evenly across the class",
            reject: ["because it says estimate", "because the sample is small"],
          },
        ],
        hints: ["What did you assume when you took half of the 40 to 60 bar?"],
        workedSolution:
          "Because the histogram only records how many plants fall in each class, not their individual heights. Taking half of the 40 to 60 bar assumes the heights in that class are spread evenly, which may not be true.",
        commonErrors: [
          {
            misconception: "maths.stats.generic-reason-not-data-specific",
            pattern: { kind: "text", regex: "because it says estimate|rounded" },
            feedback:
              "Repeating the word in the question does not answer it. Name the assumption you made: that the heights are spread evenly inside the class you cut in half.",
            marksTypicallyEarned: 0,
            source: "ccea-cer:maths:2025-november:M4:Q23",
          },
        ],
        requiresWorking: false,
      }),
    ],
    examinerSources: ["ccea-cer:maths:2025-november:M4:Q23", "ccea-cer:maths:2025-summer:M4:Q22"],
    solutionProgram: `frequencies = fd x width: ${D.e4bars.map((b) => `${b.fd}x${b.hi - b.lo}=${b.f}`).join(", ")}; total ${D.e4total}; over 50 = 20 + 20 = ${D.e4want}; ${D.e4want}/${D.e4total}*${D.e4sample} = ${D.e4b}`,
  }),
];

// ---------------------------------------------------------------------------
// Find the mistake
// ---------------------------------------------------------------------------

const findTheMistake = [
  {
    id: `ftm.${TID}.01`,
    topic: TID,
    specRefs: ["M4-HD-01"],
    stem: "Orla was asked: a village of 1200 people contains 320 people aged under 18. A stratified sample of 75 people is taken. How many should be under 18? Her working:",
    studentWorking: ["320 out of 1200", "320 ÷ 1200 = 0.2667", "Answer: 320 people under 18"],
    mistakeLine: 3,
    misconception: "maths.sampling.stratified-stops-at-group-count",
    whatWentWrong:
      "The group's share of the village was worked out correctly and then the group's own size was written on the answer line. The share still has to be turned into people in the sample by multiplying by 75.",
    correction: ["320 ÷ 1200 = 0.2667", "0.2667 × 75 = 20", "Answer: 20 people under 18"],
    marksEarnedAsWritten: ["MA1"],
    feedback:
      "The fraction is right and earns the method mark. The last step is the one that makes it a sample: multiply the fraction by the sample size. A sample of 75 cannot contain 320 people, and that check takes a second. November 2025 M4 Q23: of the candidates who had the frequencies right, many did not scale them to the sample size.",
    source: "ccea-cer:maths:2025-november:M4:Q23",
  },
  {
    id: `ftm.${TID}.02`,
    topic: TID,
    specRefs: ["M4-HD-01"],
    stem: "Finn was asked to estimate a rabbit population. 18 rabbits were caught, marked and released; later 28 rabbits were caught and 5 were marked. His working:",
    studentWorking: ["5/28 = 18/N", "N = 18 × 28 ÷ 5", "N = 100.8", "Answer: 100.8 rabbits"],
    mistakeLine: 4,
    misconception: "maths.sampling.people-not-whole-number",
    whatWentWrong:
      "Every line of the proportion and the arithmetic is correct. The answer line still reports 0.8 of a rabbit; a population is a whole number of animals.",
    correction: ["5/28 = 18/N", "N = 18 × 28 ÷ 5 = 100.8", "Answer: about 101 rabbits"],
    marksEarnedAsWritten: ["MA1", "MA1"],
    feedback:
      "Both method marks stand: the proportion is set up exactly as the scheme wants and the calculation is right. Only the final accuracy mark is at risk, and one word — 'about 101 rabbits' — protects it. Summer 2024 M4 Q15: some candidates who found the estimate left a decimal number of animals and lost that mark.",
    source: "ccea-cer:maths:2024-summer:M4:Q15",
  },
  {
    id: `ftm.${TID}.03`,
    topic: TID,
    specRefs: ["M4-HD-01"],
    stem: "Meabh was asked: a table shows 250 journeys, of which 60 took over 40 minutes and 40 took over 60 minutes. A stratified sample of 20 journeys is taken **from those over 40 minutes**. How many of the sample took over 60 minutes? Her working:",
    studentWorking: ["40 out of 250 took over 60 minutes", "40 ÷ 250 × 20 = 3.2", "Answer: 3 journeys"],
    mistakeLine: 2,
    misconception: "maths.sampling.whole-population-not-subgroup",
    whatWentWrong:
      "The sample is drawn only from the 60 journeys over 40 minutes, so 60 is the population for this calculation, not 250. Using the whole table makes the answer far too small.",
    correction: ["The sample comes from the 60 journeys over 40 minutes", "40 ÷ 60 × 20 = 13.33", "Answer: 13 journeys"],
    marksEarnedAsWritten: [],
    feedback:
      "The shape of the working is exactly right, which is worth noticing — the rule was applied correctly to the wrong population. Read the sampling sentence twice and underline the words that say where the sample comes from, then write that total down before anything else. Summer 2025 M4 Q22(c) asked for a sample from those waiting longer than six hours, and many left it blank.",
    source: "ccea-cer:maths:2025-summer:M4:Q22",
  },
];

// ---------------------------------------------------------------------------
// Retrieval prompts
// ---------------------------------------------------------------------------

const rp = (n, kind, prompt, answer, keyWords, difficultyPrior) => ({
  id: `rp.${TID}.${String(n).padStart(2, "0")}`,
  topic: TID,
  specRefs: ["M4-HD-01"],
  kind,
  prompt,
  answer,
  keyWords,
  examUnit: "M4",
  difficultyPrior,
});

const prompts = [
  rp(1, "formula", "How many from a group should appear in a stratified sample?", "$\\dfrac{\\text{group size}}{\\text{population}} \\times \\text{sample size}$, rounded to a whole person.", ["group over population", "times sample size"], 3),
  rp(2, "definition", "What does stratified mean, and why is it used?", "Every group is represented in the sample in the same proportion as in the population, so no group is over- or under-represented. Equal numbers from each group would over-represent the small ones.", ["same proportion", "no group over-represented"], 4),
  rp(3, "formula", "The capture-recapture relationship for estimating a population.", "$\\dfrac{\\text{marked in the second sample}}{\\text{size of the second sample}} = \\dfrac{\\text{number marked}}{\\text{population}}$, so population $= \\dfrac{\\text{marked} \\times \\text{second sample}}{\\text{marked in it}}$.", ["proportion marked", "equal fractions"], 6),
  rp(4, "trap", "A sample is taken **from those over 40 minutes**. Which total goes underneath the fraction?", "The total of that subgroup only, not the whole table. The restriction in the sentence redefines the population for that calculation.", ["subgroup", "not the whole table"], 7),
  rp(5, "trap", "Your stratified calculation gives 16.2 people. What goes on the answer line?", "16 people. The thing being counted is people, so the answer is a whole number; a decimal costs the accuracy mark.", ["whole number", "16"], 4),
  rp(6, "procedure", "You have rounded four stratum shares and they add to 49 instead of 50. What now?", "Give the extra place to the group whose unrounded value had the largest fractional part, so the sample is the size asked for and the proportions stay as close as possible.", ["largest decimal", "total must match"], 7),
  rp(7, "procedure", "How do you estimate how many values in a class lie between two values inside it?", "Take the fraction of the class width you want and multiply by the frequency, assuming the values are spread evenly across the class. That assumption is why the answer is an estimate.", ["fraction of the width", "spread evenly", "estimate"], 6),
  rp(8, "trap", "A question asks whether a sample represents a population, and gives numbers. What earns the mark?", "Doing the one calculation the numbers allow — work out the expected number from the population's proportion and compare it with the number in the sample. A memorised comment about representativeness earns nothing.", ["calculate", "compare", "not memorised"], 7),
  rp(9, "procedure", "What makes a criticism of a sampling method worth a mark?", "It must name a fault in the procedure described — the time, the place, the method of marking, the gap between the catches — and the improvement must repair that fault. 'The sample is too small' is not tied to the method.", ["specific to the method", "improvement matches"], 6),
  rp(10, "trap", "On a histogram, how do you get a frequency from a bar?", "Frequency = frequency density × class width, so the frequency is the **area** of the bar. Adding the bar heights counts nothing.", ["density times width", "area"], 6),
  rp(11, "qa", "A group of 200 in a population of 1600 contributes how many to a stratified sample of 48?", "$\\dfrac{200}{1600} \\times 48 = 6$ people.", ["6"], 3),
  rp(12, "novel-example", "80 fish are marked and released. Later 50 fish are caught and 6 are marked. Estimate the population, and say what you assumed.", "$\\dfrac{6}{50} = \\dfrac{80}{N}$, so $N = \\dfrac{80 \\times 50}{6} \\approx 667$ fish. It assumes the marked fish mixed evenly back through the water and that none died or lost its mark.", ["667", "mixed evenly", "assumption"], 7),
];

const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", "maths", "insights", `m4.${SLUG}.json`), "utf8"));

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

const HOW_EXAMINED =
  "M4 (calculator, 2 hours, 100 marks). One item most series, and it moves. A 3- to 4-mark stratified calculation, often the last part of a longer statistics question: Summer 2023 Q18 (complete the table, well answered), Summer 2025 Q22(c) (a sample of five from those waiting longer than six hours — many blank), November 2025 Q23(c) (a sample of 80 taken from frequencies that had to be read off a histogram), Summer 2026 Q20 (a sample of 20 from those above a threshold, 3 marks). Separately, a 4- to 5-mark population-estimate question with a written critique: Summer 2024 Q15, where 28% got full marks. Schemes read MA1 for the group total, MA1 for the proportion and A1 for the whole-number answer; in the critique each of the fault and the improvement is a separate A1.";

const bundle = {
  $schema: "../../../../pipeline/schema/topic-bundle.schema.json",
  topic: {
    id: TID,
    slug: SLUG,
    title: "Stratified sampling and estimating populations from samples",
    subject: "maths",
    unit: "M4",
    tier: "H",
    strand: "HD",
    statementIds: ["M4-HD-01"],
    prerequisites: [
      "maths.m1.handling-data-cycle-sampling-surveys-and-bias",
      "maths.m5.ratio-notation-and-simplifying",
      "maths.m6.relative-frequency-and-experimental-probability",
    ],
    order: 137,
    hardness: "H",
    difficulty: 4,
    examinerFlagged: true,
    examinerSources: [
      "ccea-cer:maths:2023-summer:M4:Q18",
      "ccea-cer:maths:2024-summer:M4:Q15",
      "ccea-cer:maths:2025-summer:M4:Q18",
      "ccea-cer:maths:2025-summer:M4:Q22",
      "ccea-cer:maths:2025-november:M4:Q23",
    ],
    examWeightHint:
      "A 3- to 4-mark stratified part in most series, usually the last part of a bigger statistics question (Summer 2023 Q18, Summer 2025 Q22(c), November 2025 Q23(c), Summer 2026 Q20), plus a 4- to 5-mark population-estimate-and-critique question in some (Summer 2024 Q15). The hardest versions take the sample from a subgroup, or from frequencies that must first be read off a histogram.",
    mustMemorise: [
      "Stratum share of the sample = (stratum size ÷ population) × sample size",
      "When the sample is taken from a subgroup, that subgroup's total is the population for the calculation",
      "Answers are whole people, animals or objects; round, and check the parts add to the sample size",
      "If the rounded parts fall short, the extra place goes to the group whose exact value had the largest fractional part",
      "Population estimate: (marked in the second sample ÷ size of that sample) = (number marked ÷ population)",
      "Part of a class = (width of the part ÷ width of the class) × frequency, assuming an even spread",
      "On a histogram, frequency = frequency density × class width",
      "A criticism must name a fault in the method described, and the improvement must repair that fault",
    ],
    onFormulaSheet: [],
    notOnThisSpec: [
      "Systematic, cluster, quota or multi-stage sampling as named techniques (M4-HD-01 names stratified sampling only)",
      "Standard error, confidence intervals or any measure of sampling uncertainty (A level, not GCSE)",
      "Random number tables and formal randomisation procedures",
    ],
    externalRefs: [
      { kind: "corbettmaths", videos: [281] },
      {
        kind: "ccea-doc",
        docType: "cer",
        url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
        asOf: UPDATED,
      },
    ],
    keywords: [
      "stratified sampling",
      "sample",
      "population estimate",
      "capture recapture",
      "representative sample",
      "proportional sampling",
      "subgroup",
    ],
  },
  note: {
    id: `note.${TID}`,
    topic: TID,
    title: "Stratified sampling and population estimates",
    subject: "maths",
    unit: "M4",
    tier: "H",
    specRefs: ["M4-HD-01"],
    calculator: true,
    formulaSheet: {
      given: [],
      mustKnow: [
        "Stratum share = (stratum size ÷ population) × sample size",
        "Population estimate: marked in sample ÷ sample size = marked in population ÷ population",
        "Part of a class = (part width ÷ class width) × frequency",
        "Histogram: frequency = frequency density × class width",
      ],
    },
    notOnThisSpec: [
      "Systematic, cluster or quota sampling by name",
      "Confidence intervals or standard error (A level, not GCSE)",
    ],
    hardness: "H",
    examinerFlagged: true,
    externalRefs: [],
    sheet: {
      mustBeAbleTo: [
        "Work out how many from each group belong in a stratified sample, and check that the parts add to the sample size",
        "Round a stratum share to a whole person, and decide which group takes an extra place when the rounded parts fall short",
        "Work backwards: find the sample size, or a group's size in the population, from one group's contribution",
        "Take a stratified sample from a subgroup named in the question, using that subgroup's total as the population",
        "Estimate part of a class by proportion of its width, assuming an even spread",
        "Read frequencies off a histogram (frequency density × class width) and then sample from them",
        "Estimate a population from a marked sample and a recapture, giving a whole number of animals",
        "Criticise the sampling method actually described, and give an improvement that repairs that fault",
        "Decide, using the figures given, whether a sample represents a group fairly",
      ],
      howExamined: HOW_EXAMINED,
      traps: [
        "Writing the group's size in the population instead of its share of the sample (November 2025 M4 Q23)",
        "Using the whole table's total when the sample is drawn from a subgroup only (Summer 2025 M4 Q22(c), where many left it blank)",
        "Leaving a decimal number of people or animals on the answer line (Summer 2024 M4 Q15)",
        "Turning the proportion upside down, so the population goes on top",
        "Splitting the sample equally between the groups instead of proportionally",
        "Giving a memorised critique — 'the sample is too small' — instead of a fault in the method described (Summer 2024 M4 Q15)",
        "Listing principles of representativeness when the question hands you numbers to calculate with (Summer 2025 M4 Q18)",
        "Adding bar heights on a histogram instead of multiplying each density by its class width (November 2025 M4 Q23)",
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
      title: "Stratified shares warm-up",
      subject: "maths",
      units: ["M4"],
      itemIds: [`dx.${TID}`, `rp.${TID}.01`, qid(1), qid(2), qid(3), `rp.${TID}.03`, qid(7)],
      showTopicLabels: false,
      version: 1,
    },
    {
      id: `set.${TID}.mixed`,
      topic: TID,
      kind: "mixed",
      title: "Subgroups, estimates and critiques, mixed",
      subject: "maths",
      units: ["M4"],
      itemIds: [qid(9), qid(10), `ftm.${TID}.03`, qid(11), qid(13), `ftm.${TID}.01`, qid(17), qid(18), `rp.${TID}.04`],
      showTopicLabels: false,
      version: 1,
    },
  ],
  verification: [],
};

// ---------------------------------------------------------------------------
// Verification details
// ---------------------------------------------------------------------------

const SCOPE =
  "Higher tier (M4). Stratified sampling and population estimates from samples, as M4-HD-01 states; no named alternative sampling schemes, no confidence intervals";
const FORMULA =
  "Nothing is taken from the Higher formula sheet. The stratified rule, the recapture proportion and frequency = frequency density x class width are all recall (packs/maths/exam-true/formula-sheets.json lists mk.frequency-density under must-know and has no sampling entry)";

const numericDetails = {};
for (const q of questions) numericDetails[q.id] = q.solutionProgram;

const details = {};
details[`note.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Sheet quotes the tariffs seen in the M4 papers read: 3-4 marks for a stratified part, 4-5 for an estimate with a critique",
  numeric: `Every worked figure in the note recomputed in scratchpad/m4-batch/gen-stratified-sampling.mjs: the 1000-pupil table gives ${D.we1round.join(", ")} summing to ${sum(D.we1round)}; the recapture 24 x 30 / 4 = ${D.we2}; the subgroup example gives ${D.we3want}/${D.we3sub} x ${D.we3sample} = ${D.we3ans}; the 900-member club gives ${D.e1.join(", ")} summing to ${sum(D.e1)}`,
  examiner:
    "Traps map onto the four findings of packs/maths/insights/m4.stratified-sampling-and-population-estimates.json (Summer 2023 Q18, Summer 2024 Q15, Summer 2025 Q18, November 2025 Q23) and the Summer 2025 Q22(c) evidence on the taxonomy entry",
};
details[`we.${TID}.01`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Five steps earning M1 MA1 MA1 MA1 A1, matching the 3- to 4-mark complete-the-table item of Summer 2023 M4 Q18 with the total check added",
  numeric: `Population 240+216+198+186+160 = ${D.we1pop} asserted; shares of 75 are ${D.we1raw.join(", ")}, rounding to ${D.we1round.join(", ")}, and the generator asserts that these sum to ${D.we1sample}. Twin: 180/150/210/60 of 600 at sample 40 gives ${[180, 150, 210, 60].map((g) => share(g, 600, 40)).join(", ")}, summing to 40`,
  examiner: "Exercises the Summer 2023 M4 Q18 finding (mostly full marks, with slips in one group) and the whole-number rule from Summer 2024 M4 Q15",
};
details[`we.${TID}.02`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Four steps earning M1 MA1 A1 A1, matching the 2 + 2 mark shape of Summer 2024 M4 Q15",
  numeric: `4/30 = 24/N gives N = 24 x 30 / 4 = ${D.we2}, checked back: 24/${D.we2} = ${(24 / D.we2).toFixed(4)} and 4/30 = ${(4 / 30).toFixed(4)}. Twin: 36 x 45 / 6 = ${recapture(36, 45, 6)}`,
  examiner: "Built on the Summer 2024 M4 Q15 finding that most candidates did not recognise the proportion argument and that critiques were generic",
};
details[`we.${TID}.03`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Four steps earning M1 MA1 MA1 A1, the 4-mark shape of Summer 2025 M4 Q22(c)",
  numeric: `Subgroup 48+30+12 = ${D.we3sub} asserted; 25-30 gives (5/10)x48 = ${slice(25, 40, 20, 30, 48)} and 30-40 gives (10/20)x30 = ${slice(25, 40, 30, 50, 30)}, total ${D.we3want} asserted; ${D.we3want}/${D.we3sub} x ${D.we3sample} = ${D.we3ans} asserted. Twin recomputed by the same slice/share helpers`,
  examiner: "Directly seeded from Summer 2025 M4 Q22(c) (sample from those waiting longer than six hours) and November 2025 M4 Q23(c)",
};
details[`dx.${TID}`] = {
  scope: SCOPE,
  formula: FORMULA,
  tariff: "Diagnostic items, not tariffed; each is one decision inside the 3- or 4-mark question",
  numeric: `Values checked in the generator: 600/4000 x 200 = ${share(600, 4000, 200)}; 168/720 x 50 = ${f2(share(168, 720, 50))}; 30 x 40 / 5 = ${recapture(30, 40, 5)}; (5/10) x 48 = ${slice(25, 30, 20, 30, 48)}; 22% of 200 = 44`,
  examiner:
    "Every distractor carries a misconception: the registry ids stratified-stops-at-group-count, people-not-whole-number, capture-recapture-no-start, generic-critique, stats.generic-reason-not-data-specific and histograms.plot-frequency-not-density, plus the two new ids reported in the batch message (sampling.proportion-inverted, sampling.whole-population-not-subgroup)",
};
for (const q of questions) {
  details[q.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: `${q.totalMarks} marks in ${q.parts.length} part(s); mark codes follow the M4 schemes read (Summer 2025 Q22(c): MA1 MA1 MA1 A1; Summer 2024 Q15: MA1 A1 then A1 A1 for fault and improvement)`,
    numeric: numericDetails[q.id],
    examiner: `Exercises ${q.examinerSources.join(", ")}`,
  };
}
for (const f of findTheMistake) {
  details[f.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Matches the 3- to 4-mark stratified item and the 2-mark estimate; marksEarnedAsWritten counts only what the scheme would still credit",
    numeric:
      f.id.endsWith("01")
        ? `Correct route recomputed: 320/1200 = ${(320 / 1200).toFixed(4)}, x 75 = ${share(320, 1200, 75)}`
        : f.id.endsWith("02")
          ? `Correct route recomputed: 18 x 28 / 5 = ${recapture(18, 28, 5)}, rounded to ${Math.round(recapture(18, 28, 5))}`
          : `Correct route recomputed: 40/60 x 20 = ${f2(share(40, 60, 20))} so 13 journeys; the written route gives 40/250 x 20 = ${share(40, 250, 20)}`,
    examiner: `Seeded from ${f.source}`,
  };
}
for (const p of prompts) {
  details[p.id] = {
    scope: SCOPE,
    formula: FORMULA,
    tariff: "Retrieval prompt; no tariff",
    numeric: `Any worked value recomputed in the generator, for example 200/1600 x 48 = ${share(200, 1600, 48)} and 80 x 50 / 6 = ${recapture(80, 50, 6).toFixed(2)}`,
    examiner: "Drawn from the rule lines of packs/maths/insights/m4.stratified-sampling-and-population-estimates.json",
  };
}

bundle.verification = collectLogs(bundle, details);

// ---------------------------------------------------------------------------
// Note blocks
// ---------------------------------------------------------------------------

const blocks = [
  { type: "h", text: "Stratified sampling and population estimates" },
  {
    type: "callout",
    kind: "spec",
    title: "The statement",
    md: "**M4-HD-01** — understand and use stratified sampling techniques.\nIt is the only sampling technique the specification names at this level, and it is examined alongside estimating a population from a sample.",
    source: "CCEA GCSE Mathematics specification, statement M4-HD-01",
  },
  {
    type: "p",
    md: "One question in most M4 papers, worth **3 or 4 marks**, and it usually hides at the end of a longer statistics question — after a histogram, after a median. In Summer 2023 it was well answered. In Summer 2025 the same skill, applied to a **subgroup**, was left blank by many; in November 2025 the frequencies first had to be read off a histogram, and only a small proportion finished. The arithmetic is one line. Everything else is reading.",
  },
  {
    type: "gate",
    id: "g0",
    kind: "choice",
    prompt: "In a stratified sample, how much of the sample does each group get?",
    options: ["The same share it has of the population", "An equal number from every group", "As many as will fit"],
    answer: "The same share it has of the population",
    explain: "That single sentence is the whole method, and the calculation below is just it written as a fraction.",
  },
  { type: "h", text: "The idea: keep the shape of the population" },
  {
    type: "p",
    md: "A sample is **stratified** when every group takes the same share of the sample as it has of the population. If one fifth of a club is under 12, one fifth of the sample is under 12.\nThat gives one rule, used over and over:\n$\\text{from a group} = \\dfrac{\\text{group size}}{\\text{population}} \\times \\text{sample size}$",
  },
  {
    type: "figure",
    alt: "A long bar showing a population of 900 club members split into four age groups of 180, 240, 150 and 330, and a shorter bar beneath showing a stratified sample of 60 split into 12, 16, 10 and 22, with arrows joining each group to its share.",
    svg: POP_SAMPLE_FIG,
    caption: "The sample bar is the population bar shrunk: every block keeps its share, so 180 out of 900 becomes 12 out of 60.",
  },
  {
    type: "gate",
    id: "g1",
    kind: "number",
    prompt: "A population of 800 contains a group of 200. How many of that group belong in a stratified sample of 40?",
    answer: "10",
    explain: "200 ÷ 800 × 40 = 10. The group is a quarter of the population, so a quarter of the sample.",
  },
  {
    type: "p",
    md: "Two finishing habits turn three marks into four.\n**Whole people.** A share of 16.2 is rounded to 16: you cannot sample a fifth of a person.\n**Check the total.** Add your rounded numbers; they must come to the sample size. If four groups round to 49 when 50 were asked for, give the extra place to the group whose exact value had the largest decimal part — that is the group rounding treated worst.",
  },
  {
    type: "gate",
    id: "g2",
    kind: "blank",
    prompt: "A stratified calculation gives 13.75 members. What goes on the answer line?",
    answer: "14",
    explain: "Round to the nearest whole member. A decimal number of people costs the accuracy mark.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "November 2025 M4 Q23(c)",
    md: "A stratified sample of 80, taken from frequencies that had to be read off a histogram first. **Only a small proportion finished.** Most never got the frequencies right; of those who did, many wrote down the group's own frequency instead of scaling it to the sample. The scaling is the whole method — a sample of 80 cannot contain 75 plants from one class.",
    source: "ccea-cer:maths:2025-november:M4:Q23",
  },
  {
    type: "gate",
    id: "g2b",
    kind: "number",
    prompt: "A group of 250 in a population of 2000 contributes how many to a stratified sample of 48?",
    answer: "6",
    explain: "250 ÷ 2000 × 48 = 6. The group is one eighth of the population, so one eighth of the sample.",
  },
  { type: "h", text: "The hard version: sampling from a subgroup" },
  {
    type: "p",
    md: "Read this sentence twice: **“A stratified sample of 30 is taken from those who waited longer than 20 minutes.”** The population for this calculation is no longer the whole table — it is that subgroup, and its total goes underneath the fraction.\nWith 24, 36, 48, 30 and 12 in the five classes, the subgroup is $48 + 30 + 12 = 90$. If the question then asks for those between 25 and 40 minutes, cut the classes: $\\tfrac{5}{10} \\times 48 = 24$ and $\\tfrac{10}{20} \\times 30 = 15$, giving 39. So the sample contains $\\tfrac{39}{90} \\times 30 = 13$.",
  },
  {
    type: "gate",
    id: "g3",
    kind: "number",
    prompt: "A class is $20 < t \\le 30$ with frequency 48. How many values lie between 25 and 30, assuming an even spread?",
    answer: "24",
    explain: "25 to 30 is 5 of the 10 minutes, so take half of 48.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025 M4 Q22(c)",
    md: "A stratified sample of five patients, taken from those waiting longer than six hours. **Many left it blank.** The mathematics is the same single rule; what stopped people was not noticing that the population had been narrowed by the sentence. Underline the words that say where the sample comes from, and write that total down before you do anything else.",
    source: "ccea-cer:maths:2025-summer:M4:Q22",
  },
  { type: "h", text: "Estimating a population you cannot count" },
  {
    type: "p",
    md: "You cannot count the fish in a lake. So: catch some, mark them, put them back, wait, catch again, and see what fraction of the new catch is marked. If the marked fish have mixed back through the lake, that fraction is the fraction of the whole lake that is marked:\n$\\dfrac{\\text{marked in the second catch}}{\\text{size of the second catch}} = \\dfrac{\\text{number you marked}}{\\text{population}}$\nWith 24 marked, then 4 marked in a catch of 30: $\\tfrac{4}{30} = \\tfrac{24}{N}$, so $N = \\tfrac{24 \\times 30}{4} = 180$ fish. **Whole fish**, and the word 'about' in front.",
  },
  {
    type: "gate",
    id: "g4",
    kind: "number",
    prompt: "40 squirrels are marked. Later 50 are caught and 8 are marked. Estimate the population.",
    answer: "250",
    explain: "8/50 = 40/N, so N = 40 × 50 ÷ 8 = 250.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2024 M4 Q15",
    md: "Only about a quarter reached the estimate; **most did not recognise the proportion argument** at all. Some who did left a decimal number of animals. And the critique in part (b) was usually generic — 'the sample is too small' — when the marks were for faults in **the method described**: marks wearing off, animals not mixing back, births and deaths between the catches.",
    source: "ccea-cer:maths:2024-summer:M4:Q15",
  },
  {
    type: "gate",
    id: "g4b",
    kind: "choice",
    prompt: "Which criticism of a capture-recapture study would earn a mark?",
    options: [
      "The marks may have worn off, so marked animals are recorded as unmarked",
      "The sample is too small to be reliable",
      "The estimate is not exact",
    ],
    answer: "The marks may have worn off, so marked animals are recorded as unmarked",
    explain: "It names something in the method described. The other two could be said about any study at all.",
  },
  { type: "h", text: "When the question hands you numbers, calculate" },
  {
    type: "p",
    md: "Some parts ask whether a sample is fair, or why an answer is only an estimate. These look like writing questions and are not.\nIf figures are given, the mark is for **using them**: find the proportion in the population, apply it to the sample, and compare. A club of 180 with 45 juniors is 25% junior, so a fair sample of 60 would hold 15 juniors; if it holds 9, the juniors are under-represented — and that sentence is the answer.\nIf the question asks why an answer is an estimate, name the **assumption**: the data is grouped, so values were assumed to be spread evenly inside a class.",
  },
  {
    type: "gate",
    id: "g4c",
    kind: "number",
    prompt: "A club of 180 members has 45 juniors. In a fair sample of 60, how many juniors would you expect?",
    answer: "15",
    explain: "45 ÷ 180 = 25%, and 25% of 60 is 15. That number is what you compare the sample against.",
  },
  {
    type: "callout",
    kind: "examiner",
    title: "Summer 2025 M4 Q18",
    md: "Candidates were asked to reason about whether a sample represented a population. **Even strong candidates overthought it** and listed memorised points about representativeness. Those who calculated 30% of 142 and compared the two numbers got the marks. When numbers are given, the reasoning mark lives in the arithmetic.",
    source: "ccea-cer:maths:2025-summer:M4:Q18",
  },
  {
    type: "gate",
    id: "g5",
    kind: "choice",
    prompt: "A town is 22% over 65; a sample of 200 contains 24 people over 65. Which comment earns the mark?",
    options: [
      "22% of 200 is 44, but only 24 were asked, so the over-65s are under-represented",
      "The sample is too small to be representative",
      "The sample is biased",
    ],
    answer: "22% of 200 is 44, but only 24 were asked, so the over-65s are under-represented",
    explain: "One calculation with the numbers given, then a comparison. The other two are memorised and use nothing from the question.",
  },
  {
    type: "gate",
    id: "g6",
    kind: "blank",
    prompt: "On a histogram, how do you turn a bar into a frequency?",
    answer: "frequency density × class width",
    explain: "The area of the bar is the frequency. Bar heights on their own cannot be added.",
  },
  {
    type: "callout",
    kind: "mustknow",
    title: "Sheet or memory?",
    md: "**On the Higher formula sheet:** nothing for this topic.\n**Must be known:** group ÷ population × sample size; the recapture proportion, marked in sample over sample size equals marked in population over population; part of a class $= \\dfrac{\\text{part width}}{\\text{class width}} \\times$ frequency; frequency $=$ frequency density $\\times$ class width.",
  },
  {
    type: "gate",
    id: "g7",
    kind: "choice",
    prompt: "You are stuck on a 3-mark stratified part. What is the first thing worth writing down?",
    options: [
      "The total of the group the sample is taken from",
      "The answer you think is most likely",
      "A sentence about representativeness",
    ],
    answer: "The total of the group the sample is taken from",
    explain: "That is the first method mark, and it is available before any answer appears.",
  },
  { type: "h", text: "In the exam" },
  {
    type: "p",
    md: "The stratified part usually says **“Estimate how many …”** or **“Complete the table”**, and often adds **“Show your working out clearly”**. The first mark is the group total you are sampling from — write it down even if you go no further. The next is the fraction times the sample size. The last is the whole-number answer with the group named.\nThe estimate question says **“Calculate an estimate of the number of …”** followed by **“State one fault … and suggest how it could be improved.”** Two separate marks there: one for a fault in the method printed, one for an improvement that repairs it.\nIf you are stuck: write the population you are sampling from, then the fraction. Those are the method marks, and they are available before any answer appears.",
  },
  { type: "prompt", promptId: `rp.${TID}.01` },
  { type: "prompt", promptId: `rp.${TID}.03` },
  { type: "prompt", promptId: `rp.${TID}.04` },
  { type: "prompt", promptId: `rp.${TID}.08` },
  { type: "prompt", promptId: `rp.${TID}.09` },
];

writeBundle("m4", SLUG, bundle, blocks);
