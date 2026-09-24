// Unit structure, formula sheets, exam dates and grade boundaries for CCEA GCSE Mathematics (2017).
// Sources: spec §2/§4.5/§4.6; docs/research/01-ccea-gcse-mathematics-spec.md §2, §4, §6 and
// the parallel-version report §3, §6, §8, §9 (raw-to-UMS boundary PDFs, Summer 2025/2026 timetables).

export const FOUNDATION_FORMULA_SHEET = [
  'Area of trapezium = ½(a + b)h',
  'Volume of prism = area of cross-section × length',
];

export const HIGHER_FORMULA_SHEET = [
  'Volume of prism = area of cross-section × length',
  'Area of trapezium = ½(a + b)h',
  'Volume of sphere = 4/3 πr³',
  'Surface area of sphere = 4πr²',
  'Volume of cone = 1/3 πr²h',
  'Curved surface area of cone = πrl',
  'Quadratic equation: the solutions of ax² + bx + c = 0, where a ≠ 0, are x = [−b ± √(b² − 4ac)] / 2a',
  'Sine rule: a/sin A = b/sin B = c/sin C',
  'Cosine rule: a² = b² + c² − 2bc cos A',
  'Area of triangle = ½ab sin C',
];

const corbett = (n, extra = {}) => ({
  revisionPage: `https://corbettmaths.com/2022/09/21/ccea-m${n}-revision/`,
  ...extra,
});

export const UNITS = [
  {
    code: 'M1', tier: 'F', kind: 'gateway', title: 'Unit M1: Foundation Tier', entryCode: 'GMC11',
    targetGrades: ['D', 'E', 'F', 'G'], allowableGrade: null, functionalMathematics: 'Level 1',
    papers: [{ name: 'Paper', calculator: true, durationMinutes: 105, marks: 100 }],
    weighting: 45, maxUms: 107, umsScale: 180, prerequisiteUnits: [],
    formulaSheet: FOUNDATION_FORMULA_SHEET,
    corbettmaths: corbett(1, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M1.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M1-Booklet-Corbettmaths.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M1-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2021/11/A-Bit-of-Everything-CCEA-M1.pdf',
      practicePaperSetA: 'https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Set-A-M1.pdf',
      ultimateVideo: 'https://www.youtube.com/watch?v=cNDfKSwfzKE',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN67LNpjEr4Xav97VkdnRFmjY',
    }),
  },
  {
    code: 'M2', tier: 'F', kind: 'gateway', title: 'Unit M2: Foundation Tier', entryCode: 'GMC21',
    targetGrades: ['C*', 'C', 'D', 'E', 'F', 'G'], allowableGrade: null, functionalMathematics: 'Level 1 or Level 2',
    papers: [{ name: 'Paper', calculator: true, durationMinutes: 105, marks: 100 }],
    weighting: 45, maxUms: 131, umsScale: 180, prerequisiteUnits: ['M1'],
    formulaSheet: FOUNDATION_FORMULA_SHEET,
    corbettmaths: corbett(2, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M2.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M2-Booklet-Corbettmaths.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M2-Booklet-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2021/11/A-Bit-of-Everything-CCEA-M2.pdf',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN650RIzPzoHhmFHHLj0Y1jsg',
    }),
  },
  {
    code: 'M3', tier: 'H', kind: 'gateway', title: 'Unit M3: Higher Tier', entryCode: 'GMC31',
    targetGrades: ['B', 'C*', 'C', 'D', 'E'], allowableGrade: null, functionalMathematics: null,
    papers: [{ name: 'Paper', calculator: true, durationMinutes: 120, marks: 100 }],
    weighting: 45, maxUms: 143, umsScale: 180, prerequisiteUnits: ['M1', 'M2'],
    formulaSheet: HIGHER_FORMULA_SHEET,
    corbettmaths: corbett(3, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M3.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M3-Booklet-Corbettmaths.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M3-Booklet-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2022/05/A-Bit-of-Everything-CCEA-M3.pdf',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN67BWvEi8aY3rCFg2mKmKh6J',
    }),
  },
  {
    code: 'M4', tier: 'H', kind: 'gateway', title: 'Unit M4: Higher Tier', entryCode: 'GMC41',
    targetGrades: ['A', 'B', 'C*', 'C'], allowableGrade: 'D', functionalMathematics: null,
    aStar: 'A* is awarded at subject level only, from the combined M4 + M8 uniform marks.',
    papers: [{ name: 'Paper', calculator: true, durationMinutes: 120, marks: 100 }],
    weighting: 45, maxUms: 180, umsScale: 180, prerequisiteUnits: ['M1', 'M2', 'M3'],
    formulaSheet: HIGHER_FORMULA_SHEET,
    corbettmaths: corbett(4, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M4-.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M4-Booklet-Corbettmaths.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/12/M4-Booklet-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2021/11/A-Bit-of-Everything-CCEA-M4.pdf',
      practicePaperSetA: 'https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Set-A-M4.pdf',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN65WiAbtrBpUjZlGMS1h28GU',
    }),
  },
  {
    code: 'M5', tier: 'F', kind: 'completion', title: 'Unit M5: Foundation Tier Completion Test', entryCode: 'GMC51/GMC52',
    targetGrades: ['D', 'E', 'F', 'G'], allowableGrade: null, functionalMathematics: null,
    papers: [
      { name: 'Paper 1', calculator: false, durationMinutes: 60, marks: 50 },
      { name: 'Paper 2', calculator: true, durationMinutes: 60, marks: 50 },
    ],
    weighting: 55, maxUms: 131, umsScale: 220, prerequisiteUnits: ['M1'],
    formulaSheet: FOUNDATION_FORMULA_SHEET,
    corbettmaths: corbett(5, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M5-Checklist.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M5-Booklet-Corbettmaths.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M5-Booklet-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2022/04/A-Bit-of-Everything-CCEA-M5-1.pdf',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN65MEhygAA3MIyr8HfYV5bRl',
    }),
  },
  {
    code: 'M6', tier: 'F', kind: 'completion', title: 'Unit M6: Foundation Tier Completion Test', entryCode: 'GMC61/GMC62',
    targetGrades: ['C*', 'C', 'D', 'E', 'F', 'G'], allowableGrade: null, functionalMathematics: null,
    papers: [
      { name: 'Paper 1', calculator: false, durationMinutes: 60, marks: 50 },
      { name: 'Paper 2', calculator: true, durationMinutes: 60, marks: 50 },
    ],
    weighting: 55, maxUms: 160, umsScale: 220, prerequisiteUnits: ['M1', 'M2', 'M5'],
    formulaSheet: FOUNDATION_FORMULA_SHEET,
    corbettmaths: corbett(6, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M6-Checklist.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M6-Booklet-Corbettmaths.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M6-Booklet-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2022/04/A-Bit-of-Everything-CCEA-M6.pdf',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN64jcJ9F5zTK4SRlb102jHzA',
    }),
  },
  {
    code: 'M7', tier: 'H', kind: 'completion', title: 'Unit M7: Higher Tier Completion Test', entryCode: 'GMC71/GMC72',
    targetGrades: ['B', 'C*', 'C', 'D', 'E'], allowableGrade: null, functionalMathematics: null,
    papers: [
      { name: 'Paper 1', calculator: false, durationMinutes: 75, marks: 50 },
      { name: 'Paper 2', calculator: true, durationMinutes: 75, marks: 50 },
    ],
    weighting: 55, maxUms: 175, umsScale: 220, prerequisiteUnits: ['M1', 'M2', 'M3', 'M5', 'M6'],
    formulaSheet: HIGHER_FORMULA_SHEET,
    corbettmaths: corbett(7, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M7-Checklist.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M7-Booklet-Corbettmaths.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M7-Booklet-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2022/04/A-Bit-of-Everything-CCEA-M7.pdf',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN67p4VtB5jluY6b0KnqkhqMm',
    }),
  },
  {
    code: 'M8', tier: 'H', kind: 'completion', title: 'Unit M8: Higher Tier Completion Test', entryCode: 'GMC81/GMC82',
    targetGrades: ['A', 'B', 'C*', 'C'], allowableGrade: 'D', functionalMathematics: null,
    aStar: 'A* is awarded at subject level only, from the combined M4 + M8 uniform marks.',
    papers: [
      { name: 'Paper 1', calculator: false, durationMinutes: 75, marks: 50 },
      { name: 'Paper 2', calculator: true, durationMinutes: 75, marks: 50 },
    ],
    weighting: 55, maxUms: 220, umsScale: 220, prerequisiteUnits: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'],
    formulaSheet: HIGHER_FORMULA_SHEET,
    corbettmaths: corbett(8, {
      checklistPdf: 'https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M8-Checklist.pdf',
      checklistPdfAlt: 'https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Checklist-M8.pdf',
      bookletPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M8-Booklet-1.pdf',
      bookletAnswersPdf: 'https://corbettmaths.com/wp-content/uploads/2022/09/M8-Booklet-Answers.pdf',
      bitOfEverythingPdf: 'https://corbettmaths.com/wp-content/uploads/2022/04/A-Bit-of-Everything-CCEA-M8.pdf',
      practicePaperSetA: ['https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Set-A-M8-Paper-1.pdf', 'https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Set-A-M8-Paper-2-1.pdf'],
      ultimateVideo: 'https://www.youtube.com/watch?v=twPU3HYboOI',
      playlist: 'https://www.youtube.com/playlist?list=PLCkAjxP1zN65iAGUvckYv_gCd2W3FHxz4',
    }),
  },
];

export const STRANDS = [
  { id: 'NA', title: 'Number and algebra' },
  { id: 'GM', title: 'Geometry and measures' },
  { id: 'HD', title: 'Handling data' },
];

export const PATHWAYS = {
  recommended: [['M1', 'M5'], ['M2', 'M6'], ['M3', 'M7'], ['M4', 'M8']],
  availableFinalGrades: { 'M1+M5': 'D–G', 'M2+M6': 'C*–G', 'M3+M7': 'B–E', 'M4+M8': 'A*–D' },
  rules: [
    'Students take two units: one of M1–M4 and one of M5–M8; one must be a completion test.',
    'Terminal rule: at least 40% of the assessment (by weighting) must be sat in the cash-in series.',
    'Each unit may be resat once before cash-in; the better result counts unless the unit is needed for the terminal rule, in which case the more recent mark counts.',
    'M1–M4 are timetabled simultaneously; M5–M8 are timetabled simultaneously on a different day, Paper 2 (calculator) immediately after Paper 1 (non-calculator).',
    'Calculators must be used in M1–M4 and in Paper 2 of every completion test; must not be used in Paper 1 of a completion test.',
  ],
  cashInCode: 'G9602',
};

// Morning sessions start 9.15am. Times are Foundation / Higher.
export const EXAM_DATES = {
  'Summer 2026': {
    gateway: { date: '2026-05-14', weekday: 'Thursday', start: '09:15', end: { F: '11:00', H: '11:15' } },
    completion: {
      date: '2026-06-03', weekday: 'Wednesday',
      paper1: { F: '09:15–10:15', H: '09:15–10:30' }, paper2: { F: '10:45–11:45', H: '10:45–12:00' },
    },
    resultsDay: '2026-08-20', contingencyDay: '2026-06-24',
    source: 'https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202026.pdf',
  },
  'November 2026': {
    gateway: { date: '2026-11-17', weekday: 'Tuesday', start: '09:15', end: { F: '11:00', H: '11:15' } },
    completion: {
      date: '2026-11-19', weekday: 'Thursday',
      paper1: { F: '09:15–10:15', H: '09:15–10:30' }, paper2: { F: '10:45–11:45', H: '10:45–12:00' },
    },
    resultsDay: '2027-02-04',
    note: 'Last November series open to first-time unit entries; from November 2027 the November series is resit-only for GCSE Mathematics (Circular S/IF/35/26).',
    source: 'https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20November%202026.pdf',
  },
  'Summer 2027': {
    gateway: { date: '2027-05-14', weekday: 'Friday', start: '09:15', end: { F: '11:00', H: '11:15' } },
    completion: {
      date: '2027-05-27', weekday: 'Thursday',
      paper1: { F: '09:15–10:15', H: '09:15–10:30' }, paper2: { F: '10:45–11:45', H: '10:45–12:00' },
    },
    resultsDay: '2027-08-19', contingencyDay: '2027-06-23',
    note: 'Final timetable Version 2 (1 September 2026).',
    source: 'https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202027%20%28Version%202%29.pdf',
  },
};

export const GRADE_BOUNDARIES = {
  subjectUms: {
    total: 400,
    'A*': { 'Summer 2025': 394, 'Summer 2026': 393, note: 'Set each series; awarded at subject level only from M4 + M8.' },
    A: 320, B: 292, 'C*': 268, C: 240, D: 200, E: 160, F: 120, G: 80,
  },
  unitUms: {
    gateway: { maxUms: 180, a: 144, b: 132, 'c*': 121, c: 108, d: 90, e: 72, f: 54, g: 36, allowableD: { M4: 99 } },
    completion: { maxUms: 220, a: 176, b: 161, 'c*': 148, c: 132, d: 110, e: 88, f: 66, g: 44, allowableD: { M8: 121 } },
    caps: { M1: 107, M2: 131, M3: 143, M4: 180, M5: 131, M6: 160, M7: 175, M8: 220 },
  },
  raw: {
    'Summer 2025': {
      M1: { d: 46, e: 35, f: 25, g: 15 },
      M2: { 'c*': 68, c: 52, d: 39, e: 26, f: 14, g: 2 },
      M3: { b: 55, 'c*': 45, c: 35, d: 25, e: 15 },
      M4: { a: 45, b: 37, 'c*': 29, c: 21, d: 17 },
      M5: { d: 54, e: 40, f: 27, g: 14 },
      M6: { 'c*': 61, c: 50, d: 41, e: 32, f: 24, g: 16 },
      M7: { b: 59, 'c*': 50, c: 42, d: 34, e: 26 },
      M8: { a: 40, b: 31, 'c*': 23, c: 15, d: 11 },
      rawMaxPerUnit: 100,
    },
    'Summer 2026': {
      M1: { d: 47, e: 35, f: 24, g: 13 },
      M2: { 'c*': 71, c: 54, d: 41, e: 28, f: 15, g: 2 },
      M3: { b: 58, 'c*': 48, c: 39, d: 30, e: 21 },
      M4: { a: 45, b: 37, 'c*': 29, c: 21, d: 17 },
      M5: { d: 50, e: 35, f: 21, g: 7 },
      M6: { 'c*': 66, c: 54, d: 44, e: 34, f: 25, g: 16 },
      M7: { b: 65, 'c*': 56, c: 48, d: 40, e: 32 },
      M8: { a: 49, b: 39, 'c*': 30, c: 21, d: 16 },
      rawMaxPerUnit: 100,
    },
  },
};
