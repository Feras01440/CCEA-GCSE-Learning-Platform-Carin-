// Qualification-level metadata for CCEA GCSE Further Mathematics (2017).
// Sources: Specification V2 (§2, §4), docs/research/02-ccea-gcse-further-mathematics-spec.md (grade boundaries, exam dates,
// formula sheets transcribed from the Summer 2025 papers/SAMs), 2025 Unit 1 mark scheme conventions.

export const units = [
  {
    code: "FM1", number: 1, title: "Unit 1: Pure Mathematics", shortTitle: "Pure Mathematics", entryCode: "GFM11", boundaryCode: "GFM1",
    compulsory: true, durationMinutes: 120, marks: 100, umsMax: 100, weighting: 50, calculator: true, availableFrom: "Summer 2018",
    assessment: "External written examination in the form of a single question-and-answer booklet that includes a formula sheet",
    intro: "In this unit, students investigate algebra, trigonometry, differentiation, integration, logarithms, matrices and quadratic inequalities.",
    questionCount: { "Summer 2025": 14, "SAMs 2019": 15 },
    formulaSheet: [
      { name: "Quadratic formula", formula: "x = (−b ± √(b² − 4ac)) / 2a" },
      { name: "Differentiation", formula: "If y = axⁿ then dy/dx = naxⁿ⁻¹" },
      { name: "Integration", formula: "∫ axⁿ dx = axⁿ⁺¹/(n + 1) + c, n ≠ −1" },
      { name: "Logarithms", formula: "If aˣ = n then x = logₐ n" }
    ],
    notInSpec: ["Change of base rule for logarithms", "Fractional indices in differentiation/integration", "Transformations of trig graphs (sin 2x, cos(x − 30°))", "Sine rule and cosine rule", "Three-dimensional optimisation and problems involving π", "Areas combining positive and negative regions", "3 × 3 matrices", "Matrix equations of the form XA = B"],
    lowUptake: false
  },
  {
    code: "FM2", number: 2, title: "Unit 2: Mechanics", shortTitle: "Mechanics", entryCode: "GFM21", boundaryCode: "GFM2",
    compulsory: false, durationMinutes: 60, marks: 50, umsMax: 50, weighting: 25, calculator: true, availableFrom: "Summer 2019",
    assessment: "External written examination in the form of a single question-and-answer booklet that includes a formula sheet",
    intro: "In this unit, students explore kinematics, vectors, forces, Newton's Laws of Motion and moments.",
    questionCount: { "Summer 2025": 6 },
    formulaSheet: [
      { name: "Quadratic formula", formula: "x = (−b ± √(b² − 4ac)) / 2a" },
      { name: "Vectors", formula: "Magnitude of xi + yj is √(x² + y²); angle between xi + yj and i is tan⁻¹(y/x)" },
      { name: "Uniform acceleration", formula: "v = u + at; v² = u² + 2as; s = ut + ½at²; s = ½(u + v)t (u initial velocity, v final velocity, s change in displacement, t time, a acceleration)" },
      { name: "Newton's Second Law", formula: "F = ma (F resultant force, m mass, a acceleration)" }
    ],
    conventions: ["g is taken as 10 m/s² in mark schemes", "Friction, when present, is given as a value or a value per unit mass (F = μR not tested)"],
    notInSpec: ["Projectiles", "Coefficient of friction μ", "Momentum and impulse", "Work, energy and power", "Circular motion", "Non-uniform rods, hinges and ladders"],
    lowUptake: false
  },
  {
    code: "FM3", number: 3, title: "Unit 3: Statistics", shortTitle: "Statistics", entryCode: "GFM31", boundaryCode: "GFM3",
    compulsory: false, durationMinutes: 60, marks: 50, umsMax: 50, weighting: 25, calculator: true, availableFrom: "Summer 2019",
    assessment: "External written examination in the form of a single question-and-answer booklet that includes a formula sheet",
    intro: "In this unit, students investigate central tendency and dispersion, probability, the binomial and normal distributions and bivariate analysis.",
    questionCount: { "Summer 2025": 7 },
    formulaSheet: [
      { name: "Mean", formula: "Mean = Σfx / Σf" },
      { name: "Standard deviation", formula: "Standard deviation = √(Σfx²/Σf − x̄²), where x̄ is the mean" },
      { name: "Addition rule", formula: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)" },
      { name: "Conditional probability", formula: "P(A | B) = P(A ∩ B) / P(B)" },
      { name: "Spearman's coefficient of rank correlation", formula: "r = 1 − 6Σd² / (n(n² − 1))" },
      { name: "Normal Probability Table", formula: "Φ(z) for z = 0.00 to 3.99 with 'ADD' difference columns (booklet page 3)" }
    ],
    notInSpec: ["Median, interquartile range, box plots, histograms", "Product-moment correlation and least-squares regression", "Hypothesis tests", "Inverse normal (z from a probability)", "Two-sided normal probabilities P(a < z < b)"],
    lowUptake: false
  },
  {
    code: "FM4", number: 4, title: "Unit 4: Discrete and Decision Mathematics", shortTitle: "Discrete and Decision Mathematics", entryCode: "GFM41", boundaryCode: "GFM4",
    compulsory: false, durationMinutes: 60, marks: 50, umsMax: 50, weighting: 25, calculator: true, availableFrom: "Summer 2019",
    assessment: "External written examination in the form of a single question-and-answer booklet (no formula sheet)",
    intro: "In this unit, students explore counting, logic, linear programming, time series and critical path analysis.",
    questionCount: { "Summer 2025": 5 },
    formulaSheet: [],
    notInSpec: ["Graph algorithms (Dijkstra, Kruskal/Prim, route inspection)", "Simplex method", "Sorting and bin-packing algorithms", "Game theory"],
    lowUptake: true,
    lowUptakeEvidence: [
      { series: "Summer 2019", note: "'Unit 4 was new to the syllabus. Unfortunately it was not a popular choice... As the number of candidates taking Unit 4 was so small no meaningful report could be written for this paper.'" },
      { series: "Summer 2022", note: "'While Unit 4 was available for assessment, no candidate completed the paper.' Most popular combination Unit 1 + Unit 2, then Unit 1 + Unit 3." },
      { series: "Summer 2023", note: "'Only four candidates sat this paper, but it was very encouraging to see all those who did performing well.'" },
      { series: "Summer 2024", note: "'The number of candidates taking Unit 4... was so small that no meaningful overview could be written for the paper.'" },
      { series: "Summer 2025", note: "'Due to the small number of candidates taking Unit 4... it was not possible to produce a meaningful report for that paper.'" }
    ]
  }
];

export const structureRules = {
  unitsRequired: "Unit 1 (mandatory) plus two of Units 2, 3 and 4",
  totalUms: 200,
  terminalRule: "At least 40% of the assessment (by unit weighting) must be taken in the series in which the final grade is requested (Spec §4.1).",
  resits: "Each unit may be resat once before cash-in; the better result counts unless the unit is needed for the 40% terminal rule, in which case the more recent mark counts (Spec §4.1).",
  availability: "Summer series only (Unit 1 from 2018; Units 2–4 from 2019); not offered in November/March series.",
  priorAttainment: "Students should ideally have covered all of the content in the CCEA GCSE Mathematics specification at Higher Tier, including all of the content of units M4 and M8 (Spec §1.3).",
  guidedLearningHours: 120,
  assessmentObjectives: [
    { code: "AO1", title: "Use and apply standard techniques", perUnit: "35–45%", overall: 40 },
    { code: "AO2", title: "Reason, interpret and communicate mathematically", perUnit: "25–35%", overall: 30 },
    { code: "AO3", title: "Solve problems in mathematics and other contexts", perUnit: "25–35%", overall: 30 }
  ]
};

export const examDates = {
  "Summer 2025": {
    source: "Question papers (actual)",
    FM1: { date: "2025-05-12", weekday: "Monday", session: "Afternoon" },
    FM2: { date: "2025-06-02", weekday: "Monday", session: "Morning" },
    FM3: { date: "2025-06-18", weekday: "Wednesday", session: "Afternoon" },
    FM4: { date: "2025-06-20", weekday: "Friday", session: "Morning" }
  },
  "Summer 2026": {
    source: "CCEA Final GCSE Timetable, Summer 2026 (issued 06/05/2025)",
    FM1: { code: "GFM11", date: "2026-05-15", weekday: "Friday", session: "Afternoon", time: "13:30–15:30", durationMinutes: 120 },
    FM2: { code: "GFM21", date: "2026-06-01", weekday: "Monday", session: "Afternoon", time: "13:30–14:30", durationMinutes: 60 },
    FM3: { code: "GFM31", date: "2026-06-16", weekday: "Tuesday", session: "Morning", time: "09:15–10:15", durationMinutes: 60 },
    FM4: { code: "GFM41", date: "2026-06-19", weekday: "Friday", session: "Morning", time: "09:15–10:15", durationMinutes: 60 },
    contingencyDay: "2026-06-24",
    resultsDay: "2026-08-20"
  },
  "Summer 2027": {
    source: "CCEA Final GCSE Timetable, Summer 2027, Version 2 (dated 01/09/2026); minute-level times should be re-checked against the PDF",
    FM1: { code: "GFM11", date: "2027-05-18", weekday: "Tuesday", session: "Morning", time: "09:15 start", durationMinutes: 120 },
    FM2: { code: "GFM21", date: "2027-06-04", weekday: "Friday", session: "Afternoon", time: "13:30 start", durationMinutes: 60 },
    FM3: { code: "GFM31", date: "2027-06-15", weekday: "Tuesday", session: "Morning", time: "09:15–10:15", durationMinutes: 60 },
    FM4: { code: "GFM41", date: "2027-06-18", weekday: "Friday", session: "Afternoon", time: "13:30 start", durationMinutes: 60 },
    contingencyDay: "2027-06-23",
    resultsDay: "2027-08-19"
  }
};

export const gradeBoundaries = {
  subjectEntryCode: "G2337",
  subjectUms: {
    max: 200,
    fixed: { "A": 160, "B": 146, "C*": 134, "C": 120, "D": 100, "E": 80, "F": 60, "G": 40 },
    aStarBySeries: { "Summer 2024": 185, "Summer 2025": 184, "Summer 2026": 186 },
    note: "Subject-level UMS boundaries are fixed for the life of the specification; A* is set each series at subject level only."
  },
  unitUms: {
    FM1: { max: 100, "a": 80, "b": 73, "c*": 67, "c": 60, "d": 50, "e": 40, "f": 30, "g": 20 },
    FM2: { max: 50, "a": 40, "b": 37, "c*": 34, "c": 30, "d": 25, "e": 20, "f": 15, "g": 10 },
    FM3: { max: 50, "a": 40, "b": 37, "c*": 34, "c": 30, "d": 25, "e": 20, "f": 15, "g": 10 },
    FM4: { max: 50, "a": 40, "b": 37, "c*": 34, "c": 30, "d": 25, "e": 20, "f": 15, "g": 10 }
  },
  rawBySeries: {
    "Summer 2024": {
      FM1: { max: 100, "a": 66, "b": 50, "c*": 35, "c": 20, "d": 17, "e": 15, "f": 13, "g": 11 },
      FM2: { max: 50, "a": 31, "b": 24, "c*": 17, "c": 10, "d": 8, "e": 6, "f": 4, "g": 2 },
      FM3: { max: 50, "a": 41, "b": 31, "c*": 22, "c": 13, "d": 11, "e": 9, "f": 8, "g": 7 },
      FM4: { max: 50, "a": 32, "b": 25, "c*": 18, "c": 11, "d": 9, "e": 7, "f": 6, "g": 5 }
    },
    "Summer 2025": {
      FM1: { max: 100, "a": 68, "b": 52, "c*": 36, "c": 20, "d": 17, "e": 15, "f": 13, "g": 11 },
      FM2: { max: 50, "a": 39, "b": 31, "c*": 24, "c": 17, "d": 14, "e": 12, "f": 10, "g": 8 },
      FM3: { max: 50, "a": 41, "b": 31, "c*": 22, "c": 13, "d": 11, "e": 9, "f": 8, "g": 7 },
      FM4: { max: 50, "a": 32, "b": 25, "c*": 18, "c": 11, "d": 9, "e": 7, "f": 6, "g": 5 }
    },
    "Summer 2026": {
      FM1: { max: 100, "a": 72, "b": 56, "c*": 40, "c": 24, "d": 21, "e": 19, "f": 17, "g": 15 },
      FM2: { max: 50, "a": 37, "b": 29, "c*": 22, "c": 15, "d": 13, "e": 11, "f": 10, "g": 9 },
      FM3: { max: 50, "a": 40, "b": 30, "c*": 21, "c": 12, "d": 10, "e": 8, "f": 7, "g": 6 },
      FM4: { max: 50, "a": 32, "b": 25, "c*": 18, "c": 11, "d": 9, "e": 7, "f": 6, "g": 5 }
    }
  },
  sources: [
    "https://ccea.org.uk/downloads/docs/Grade-Boundaries/individual-quals/GCSE%20Further%20Mathematics%20(2017)/2024/Summer/GCSE%20Further%20Mathematics%20(2017)-Raw%20to%20Uniform%20Mark%20Boundaries-2024-Summer.pdf",
    "https://ccea.org.uk/downloads/docs/Grade-Boundaries/individual-quals/GCSE%20Further%20Mathematics%20(2017)/2025/Summer/GCSE%20Further%20Mathematics%20(2017)-Raw%20to%20Uniform%20Mark%20Boundaries-2025-Summer.pdf",
    "https://ccea.org.uk/downloads/docs/Grade-Boundaries/individual-quals/GCSE%20Further%20Mathematics%20(2017)/2026/Summer/GCSE%20Further%20Mathematics%20(2017)-Raw%20to%20Uniform%20Mark%20Boundaries-2026-Summer.pdf"
  ],
  outcomes: {
    "Summer 2024": { entries: 4549, cumulativePercent: { "A*": 21.8, "A": 58.3, "B": 77.2, "C*": 88.8, "C": 94.7 } },
    "Summer 2025": { entries: 4463, cumulativePercent: { "A*": 22.0, "A": 59.6, "B": 79.2, "C*": 90.3, "C": 95.0 } }
  }
};

export const markingConventions = {
  M: "Method mark – awarded for a correct method (an appropriate equation, formula or process), even if the arithmetic that follows is wrong.",
  W: "Working/accuracy mark – awarded for accurate working or a correct value that follows from the method.",
  MW: "Combined method-and-working mark – awarded only when the method is correct and carried out accurately.",
  notes: [
    "Calculator-only answers with no method score nothing if wrong: 'if the solution is incorrect then they cannot gain any method marks as no method has been shown' (CER 2023); 'Sole use of a calculator will not gain any marks' (Teacher Guidance, simultaneous equations).",
    "Follow-through marking applies after an error; positive marking – credit is given for what is correct.",
    "Where an error trivialises a question, not more than half the marks are usually awarded; a misread that makes a question easier earns only a proportion of the marks.",
    "Method-locked questions: when the question says 'hence', 'use matrices', 'by completing the square' or 'show that', an alternative method (even if mathematically correct) receives no marks; working backwards from a given answer in a 'show that' gains no marks.",
    "Rounding: 'Where rounding is necessary give answers correct to 2 decimal places unless stated otherwise'; log/log tables to 3 decimal places; do not truncate or round intermediate values.",
    "Bold text in a question is a hint to read carefully; final answers go on the answer line; units and money notation where appropriate.",
    "All working must be clearly shown; marks may be awarded for partially correct solutions (front-cover instructions).",
    "Force diagrams: every force needs an arrow and a label; missing or extra forces are penalised (CER 2019–2025)."
  ]
};

export const source = {
  specification: "docs/sources/further-maths/GCSE-Further-Mathematics-2017-specification-v2.pdf (Version 2, 17 September 2019; text: ...-v2.txt)",
  teacherGuidance: "docs/sources/further-maths/GCSE-Further-Mathematics-Teacher-Guidance-2024.pdf (CCEA, December 2024)",
  formulae: "docs/sources/further-maths/GCSE-Further-Mathematics-Formulae-and-Tables.pdf (pages 1–2 image-only; transcribed from the Summer 2025 papers/SAMs)",
  examinerReports: ["Summer 2018", "Summer 2019", "Summer 2022", "Summer 2023", "Summer 2024", "Summer 2025"].map(s => `docs/sources/further-maths/GCSE-Further-Mathematics-Chief-Examiner-Report-${s.replace(' ', '')}.pdf`),
  researchReport: "docs/research/02-ccea-gcse-further-mathematics-spec.md",
  generatedBy: "scripts/build-fm-spec.mjs",
  urls: {
    subjectPage: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017",
    specification: "https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Further%20Mathematics%20(2017)/GCSE%20Further%20Mathematics%20(2017)-specification-Standard_1.pdf",
    teacherGuidance: "https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2024/GCSE%20Further%20Mathematics%20Teacher%20Guidance.pdf",
    pastPapers: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/past-papers-mark-schemes",
    pastPapersFeed: "https://ccea.org.uk/sites/default/files/qualification/507.json",
    reports: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports",
    gradeBoundaries: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/grade-boundaries"
  }
};
