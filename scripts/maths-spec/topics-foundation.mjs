// Teachable topics for the Foundation units, in teaching order (stage 1 = M1 + M5, stage 2 = M2 + M6;
// within a stage: number → algebra → geometry → data). Each topic groups 1–6 closely related spec
// statements from ONE unit into a 20–40 minute session. `examinerEvidence` is drawn from the CCEA
// Chief Examiner reports summarised in docs/research/01-ccea-gcse-mathematics-spec.md §9 and the
// parallel-version report §11. `difficulty`: 1 routinely well answered … 5 repeatedly <10% full marks.
// `corbettmaths` entries are ONLY those quoted in docs/research/04-maths-learning-platforms.md or
// docs/research/08-past-papers-and-question-banks*.md (no invented video numbers; url null = not quoted).

const ev = (series, unit, note) => ({ series, unit, note });
const cm = (title, videoNumber, url = null) => ({ title, videoNumber, url });

export const FOUNDATION_TOPICS = [
  // ═══════════════ STAGE 1 — M1 ═══════════════
  // ── Number ──
  {
    slug: 'integers-ordering-and-inequality-symbols', title: 'Integers: four operations, ordering and inequality symbols', strand: 'NA',
    statementIds: ['M1-NA-01', 'M1-NA-02', 'M1-NA-03'], prerequisites: [], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q10(c): the "large majority" could not order 0.6, 0.605, 0.61 from largest to smallest.'),
      ev('Summer 2025', 'M1', 'Q22: 2½ read as 2 × ½ = 1 when comparing a mixed list of fractions and decimals; 2 − 0.02 = 1.98.'),
      ev('November 2025', 'M5', 'Paper 1 overview: "very poor numeracy skills" and repeated arithmetical errors; little checking of work.'),
    ],
    mustMemorise: ['Rules for adding/subtracting/multiplying/dividing negative numbers', 'Meaning of =, ≠, <, >, ≤, ≥'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['integers', 'negative numbers', 'ordering', 'inequality symbols', 'written methods'],
  },
  {
    slug: 'calculator-use-bidmas-and-inverse-operations', title: 'Calculator use, order of operations (BIDMAS) and inverse operations', strand: 'NA',
    statementIds: ['M1-NA-04', 'M1-NA-05', 'M1-NA-06'], prerequisites: ['integers-ordering-and-inequality-symbols'], calculator: 'calc', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2024', 'M1', 'Q17: calculator misuse — order of operations ignored and the fraction display 14/5 left unconverted (calculator mode).'),
      ev('November 2025', 'M1', 'Q25: BIDMAS ignored when rounding a calculation to 2 d.p. (51.35 given).'),
      ev('November 2025', 'M2', 'Q4(b): inverse operations applied in the wrong order; examiners advise teaching inverse operations "in reverse order".'),
      ev('November 2025', 'M1', 'Q12(b): inverse of a formula done as ÷2 then +1 (6.5) instead of reversing the operations.'),
    ],
    mustMemorise: ['BIDMAS/BODMAS priority', 'Inverse pairs: +/−, ×/÷, square/√, cube/∛'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['calculator', 'BIDMAS', 'order of operations', 'inverse operations', 'reciprocal'],
  },
  {
    slug: 'factors-multiples-primes-squares-and-cubes', title: 'Factors, multiples, primes, squares, cubes and roots', strand: 'NA',
    statementIds: ['M1-NA-07', 'M1-NA-08', 'M1-NA-09'], prerequisites: ['integers-ordering-and-inequality-symbols'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('November 2025', 'M1', 'Q18: prime and square numbers between 20 and 30 was among the worst-answered questions.'),
      ev('Summer 2025', 'M5', 'Paper 1 Q1(b): prime numbers on a spinner — "very few"; the term "multiple" was unfamiliar in Q1(a)(ii).'),
      ev('Summer 2025', 'M5', 'Paper 1 Q10: square + cube numbers summing to 52 and a triangular number between 40 and 50 — mostly guessed.'),
      ev('Summer 2024', 'M2', 'Q15: 81 not recognised as a square number; Q22 flow diagram treated 81 as prime.'),
    ],
    mustMemorise: ['Primes to 100 (at least to 30)', 'Square numbers to 15², cube numbers to 5³', 'Index notation 10², 6³'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['factor', 'multiple', 'prime', 'square number', 'cube number', 'square root', 'powers of 10'],
  },
  {
    slug: 'place-value-and-decimals', title: 'Place value, reading, comparing and calculating with decimals', strand: 'NA',
    statementIds: ['M1-NA-10', 'M1-NA-11', 'M1-NA-12'], prerequisites: ['integers-ordering-and-inequality-symbols'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('November 2025', 'M1', 'Q11: difference in place value of the 8s in 2835 and 4283 — answers 752, 600, 100.'),
      ev('November 2025', 'M2', 'Q3: place value errors; Q6 "100 g in 1 kg".'),
      ev('Summer 2023', 'M1', 'Q1(b): 78 million in figures — "often adding 4 zeros".'),
    ],
    mustMemorise: ['Place-value columns to thousandths'], onFormulaSheet: [],
    corbettmaths: [cm('Words & Figures', '362'), cm('Words & Figures', '363')],
    keywords: ['place value', 'decimals', 'tenths', 'hundredths', 'words and figures'],
  },
  {
    slug: 'rounding-and-money-notation', title: 'Rounding (decimal places, 1 s.f., powers of 10) and money notation', strand: 'NA',
    statementIds: ['M1-NA-13', 'M1-NA-14'], prerequisites: ['place-value-and-decimals'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q10(a): rounding 43.812 to 1 d.p. — 44 common.'),
      ev('November 2025', 'M2', 'Q17: almost half could not round to 2 d.p.'),
      ev('Summer 2023', 'all', 'General advice: money to 2 d.p. (£73.30, never "£45.50p"); 1 d.p. money answers penalised.'),
      ev('Summer 2025', 'M5', 'Paper 1 Q6: money notation "0.80p".'),
    ],
    mustMemorise: ['Rounding rules (5 rounds up)', 'Money always to 2 d.p. — 26.3 on a calculator is £26.30'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['rounding', 'decimal places', 'significant figures', 'nearest 10/100/1000', 'money'],
  },
  {
    slug: 'equivalent-fractions-and-fraction-to-decimal', title: 'Equivalent fractions and writing fractions as decimals', strand: 'NA',
    statementIds: ['M1-NA-15', 'M1-NA-16'], prerequisites: ['place-value-and-decimals'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q3: changing 2/7 to a decimal — accuracy lost by premature rounding.'),
      ev('Summer 2023', 'M5', 'Paper 1 Q9: fraction/percentage equivalence table frequently blank.'),
    ],
    mustMemorise: ['Common equivalents: ½ = 0.5, ¼ = 0.25, ¾ = 0.75, 1/5 = 0.2, 1/10 = 0.1'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['equivalent fractions', 'simplify', 'terminating decimal', 'fraction to decimal'],
  },
  {
    slug: 'adding-and-subtracting-fractions', title: 'Adding and subtracting fractions and mixed numbers', strand: 'NA',
    statementIds: ['M1-NA-17'], prerequisites: ['equivalent-fractions-and-fraction-to-decimal'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M1', 'Q26: 5/8 + 1/3 then 1 − 23/24 — 6/11 from adding tops and bottoms; "few competent using the fraction button".'),
      ev('November 2025', 'M2', 'Q18: adding fractions — "four candidates out of every five made no valid attempt".'),
      ev('November 2025', 'M5', 'Paper 1 Q16: 3/7 + 1/4 then 1 − 19/28 — most zero (4/11).'),
      ev('November 2025', 'M7', 'Paper 1 Q6: 3/7 + 1/4 — 4/11; 19/28 left as final answer.'),
    ],
    mustMemorise: ['Common denominator method', 'Mixed number ↔ improper fraction'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['fractions', 'common denominator', 'mixed numbers', 'adding fractions', 'subtracting fractions'],
  },
  {
    slug: 'fraction-of-a-quantity', title: 'Fraction of a quantity and one quantity as a fraction of another', strand: 'NA',
    statementIds: ['M1-NA-18', 'M1-NA-19'], prerequisites: ['equivalent-fractions-and-fraction-to-decimal'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M2', 'Overview: converting a fraction to a rounded decimal/percentage to find a fraction of an amount fails for 2/7; ⅔ → 28.57%.'),
      ev('Summer 2025', 'M5', 'Paper 1 Q15(b): "so few" could find 2/5 of 20; M6 Paper 1 Q12(b) 2/5 of the remaining 11.'),
      ev('Summer 2024', 'M1', 'Q15(a)(ii): 45 as a fraction of 120 — "not even fractions".'),
      ev('Summer 2025', 'M1', 'Q24/Q25: multi-step problems (¼ of 200 notes × £10; 45% then ⅔ of the remainder) — ⅔ of the whole taken instead.'),
    ],
    mustMemorise: ['Fraction of amount: divide by denominator, multiply by numerator'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['fraction of an amount', 'fraction of a quantity', 'express as a fraction'],
  },
  {
    slug: 'percentages-of-quantities', title: 'Percentages: meaning, percentage of a quantity, one quantity as a percentage of another', strand: 'NA',
    statementIds: ['M1-NA-20', 'M1-NA-21', 'M1-NA-22'], prerequisites: ['fraction-of-a-quantity'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('November 2025', 'M2', 'Q16: one number as a percentage of another — more than half scored zero; M1 Q24 gave 0.35 without ×100.'),
      ev('Summer 2024', 'M5', 'Paper 1 Q11: 6% of 700 without a calculator — many never started; 700 ÷ 6 seen.'),
      ev('Summer 2025', 'M5', 'Paper 1 Q9: ⅓ and 35% of 120 — ⅓ treated as 30%/33%; 1% × 35 struggles.'),
      ev('November 2024', 'M5', 'Paper 1: 2% simple interest on £7200 — "1% = 720" seen.'),
    ],
    mustMemorise: ['10% = ÷10, 1% = ÷100, 50% = ½, 25% = ¼', 'x as a % of y = x ÷ y × 100'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['percentage', 'percent of an amount', 'percentage of', 'parts per 100'],
  },
  {
    slug: 'percentage-increase-and-decrease', title: 'Percentage increase and decrease, profit and loss', strand: 'NA',
    statementIds: ['M1-NA-23'], prerequisites: ['percentages-of-quantities'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q23: percentage increase when the increase is given — 108% and 92% seen more often than the correct 8%; M2 Q15 the same.'),
      ev('Summer 2023', 'M1', 'Q24: percentage loss calculated from £54 rather than the original £126; M2 Q15 loss without subtracting first.'),
      ev('Summer 2025', 'M3', 'Q8: percentage increase "all-or-nothing" — 43% scored zero.'),
      ev('November 2025', 'M1', 'Q27: 12% profit — forgot to add back the £10 080.'),
    ],
    mustMemorise: ['% change = change ÷ original × 100', 'Multiplier method: ×1.12 for +12%, ×0.85 for −15%'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['percentage increase', 'percentage decrease', 'percentage change', 'profit', 'loss', 'multiplier'],
  },
  {
    slug: 'fractions-decimals-percentages-equivalence', title: 'Fraction, decimal and percentage equivalences in context', strand: 'NA',
    statementIds: ['M1-NA-24'], prerequisites: ['percentages-of-quantities'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Overview: "a significant number… believe that a third is 30%, 33% or 33.3%"; M1 Q24 ⅓ off vs 15% off.'),
      ev('Summer 2023', 'M1', 'Q10: best offer 25% / ⅓ / £50 off — "£50 off" read as 50% off; Q11 "33% < ⅓" judged false.'),
      ev('Summer 2025', 'M2', 'Q14: mixed number 2½ treated as 1 — flagged as a persistent misconception even at M3 (Q7).'),
    ],
    mustMemorise: ['⅓ ≈ 33.3% (not 30%), ⅔ ≈ 66.7%, ⅛ = 12.5%, 1/5 = 20%'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['FDP', 'equivalence', 'compare offers', 'fraction decimal percentage'],
  },
  {
    slug: 'money-and-simple-finance', title: 'Money and simple finance: wages, discount, simple interest, budgeting, APR/AER', strand: 'NA',
    statementIds: ['M1-NA-25'], prerequisites: ['percentage-increase-and-decrease', 'rounding-and-money-notation'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('November 2025', 'M1', 'Q9(b): pension contributions — few progressed beyond £81.'),
      ev('November 2025', 'M2', 'Q12(b): bonds problem — fewer than 20% correct.'),
      ev('Summer 2023', 'M1', 'Q29: tuck-shop cost/profit was accessible.'),
      ev('Summer 2024', 'M2', 'Q6: 10% of £1950 found then the wrong operation applied.'),
    ],
    mustMemorise: ['Simple interest = P × R × T ÷ 100', 'Profit = income − costs'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['money', 'wages', 'salary', 'discount', 'simple interest', 'APR', 'AER', 'budget', 'debt', 'bank account'],
  },
  // ── Algebra ──
  {
    slug: 'algebraic-notation-and-vocabulary', title: 'Algebraic notation, vocabulary and function machines', strand: 'NA',
    statementIds: ['M1-NA-26', 'M1-NA-27', 'M1-NA-28'], prerequisites: ['integers-ordering-and-inequality-symbols'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M2', 'Q3: algebraic notation — "5h" and "6h" errors.'),
      ev('November 2025', 'M5', 'Paper 2 Q17: 3x × 4 = 12x — "very small proportion"; answers 12 and 7x (M6 Paper 2 Q13: 54%).'),
      ev('Summer 2024', 'M1', 'Q22: flow diagram/function machine — 81 treated as prime.'),
    ],
    mustMemorise: ['3b means 3 × b; y² means y × y; a/b means a ÷ b', 'Expression vs equation vs formula vs identity'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['algebra notation', 'expression', 'equation', 'formula', 'term', 'factor', 'function machine', 'input output'],
  },
  {
    slug: 'collecting-like-terms-and-expanding-constant-brackets', title: 'Collecting like terms and expanding a constant over a bracket', strand: 'NA',
    statementIds: ['M1-NA-29'], prerequisites: ['algebraic-notation-and-vocabulary'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q19: collecting terms with negatives (5c + −2d) and expanding 5(2t + 5) caused errors; M2 Q11(a) the same.'),
      ev('November 2023', 'M2', 'Simplifying −2x + 6y was poorly done.'),
      ev('Summer 2023', 'M2', 'Q22: expand and simplify — only −14y correct; squared term missed.'),
    ],
    mustMemorise: ['2(a + b) = 2a + 2b', 'Only like terms combine'], onFormulaSheet: [],
    corbettmaths: [cm('Collecting Like Terms', '9', 'https://corbettmaths.com/2013/12/28/collecting-like-terms-video-9/')],
    keywords: ['like terms', 'simplify', 'expand', 'brackets', 'collecting terms'],
  },
  {
    slug: 'factorising-with-constant-common-factors', title: 'Factorising by taking out a constant common factor', strand: 'NA',
    statementIds: ['M1-NA-30'], prerequisites: ['collecting-like-terms-and-expanding-constant-brackets', 'factors-multiples-primes-squares-and-cubes'], calculator: 'either', difficulty: 2,
    examinerEvidence: [ev('Summer 2025', 'M3', 'Q25: factorising with 4a as the common factor was achieved by "only the very best".')],
    mustMemorise: ['3a + 6b = 3(a + 2b); check by expanding'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['factorise', 'common factor', 'highest common factor'],
  },
  {
    slug: 'writing-expressions-and-formulae-from-context', title: 'Writing expressions and formulae from real-life contexts', strand: 'NA',
    statementIds: ['M1-NA-31'], prerequisites: ['algebraic-notation-and-vocabulary'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q12: writing h + 5 then 2h + 5 — "very few correct"; "5h" for "5 more than h"; "h + 5 =" written.'),
      ev('Summer 2025', 'M3', 'Q10: expression in pence (3x…) — more than 70% scored zero; M2 Q18 used £2 instead of 200 p.'),
      ev('Summer 2023', 'M1', 'Q20: perimeter expression 2a + 3 written as 5a; M2 Q11 perimeter with two variables.'),
    ],
    mustMemorise: ['"5 more than h" = h + 5; "twice h" = 2h; units consistent (pence vs pounds)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['forming expressions', 'writing formulae', 'expressions in context', 'perimeter expression'],
  },
  {
    slug: 'substitution-and-standard-formulae', title: 'Substituting into formulae (in words or symbols) and using standard formulae', strand: 'NA',
    statementIds: ['M1-NA-32', 'M1-NA-33'], prerequisites: ['algebraic-notation-and-vocabulary', 'calculator-use-bidmas-and-inverse-operations'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M1', 'Q21: substituting into P = ne/s — 16 and 3 written as "163"; same in M2 Q14 and M3 Q6.'),
      ev('November 2024', 'M2', 'Substitution into formulae "definitely a topic for additional teaching focus".'),
      ev('Summer 2023', 'M1', 'Q15: cooking-time formula 20 × 11 + 45 — 65 from 20 + 45; M2 Q6 answer "2 hours 65 minutes".'),
    ],
    mustMemorise: ['ne means n × e', 'Perimeter, area and volume formulae for rectangles, triangles and cuboids'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['substitution', 'formula', 'evaluate', 'word formula'],
  },
  {
    slug: 'solving-linear-equations', title: 'Setting up and solving linear equations in one unknown', strand: 'NA',
    statementIds: ['M1-NA-34'], prerequisites: ['collecting-like-terms-and-expanding-constant-brackets', 'calculator-use-bidmas-and-inverse-operations'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q26: solve 3(y − 7) = 18 — brackets not expanded (3y − 7 = 18 → y = 8.33), sign errors, trial and improvement; M2 Q19 "very few applied an algebraic method".'),
      ev('Summer 2024', 'M1', 'Q29: solve 5(2y + 3) = 79 — "most… no marks"; M2 Q21 more than half expanded the bracket wrongly.'),
      ev('November 2025', 'M1', 'Q19(b): 3x − 2 = 5.5 gave 7.5 or 22.5; M2 Q11(b) "only half… able to solve this very straightforward equation".'),
    ],
    mustMemorise: ['Balance method: do the same to both sides', 'Expand brackets before solving'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['linear equations', 'solve', 'unknown', 'brackets', 'balance method'],
  },
  {
    slug: 'coordinates-and-plotting-straight-line-graphs', title: 'Coordinates in four quadrants and plotting straight-line graphs', strand: 'NA',
    statementIds: ['M1-NA-35', 'M1-NA-36'], prerequisites: ['substitution-and-standard-formulae', 'integers-ordering-and-inequality-symbols'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q10: points plotted but no line drawn; M3 Q2(b) the same.'),
      ev('November 2025', 'M7', 'Paper 2 Q12: line y = 6 − x — no table of values; x and y swapped.'),
    ],
    mustMemorise: ['(x, y) — along then up', 'Lines x = a are vertical, y = b horizontal', 'Table of values then join with a ruler'], onFormulaSheet: [],
    corbettmaths: [cm('Drawing Linear Graphs', '186')],
    keywords: ['coordinates', 'quadrants', 'straight line graph', 'table of values', 'y = mx + c plotting'],
  },
  {
    slug: 'real-life-linear-graphs', title: 'Constructing and interpreting linear graphs in real-world contexts', strand: 'NA',
    statementIds: ['M1-NA-37'], prerequisites: ['coordinates-and-plotting-straight-line-graphs'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M2', 'Q21: meaning of the gradient after the delivery charge — "little was correct"; gradient 1.5 found by counting squares.'),
      ev('November 2025', 'M3', 'Q19: real-life linear graph — very few full marks; "cost per point".'),
    ],
    mustMemorise: ['Intercept = fixed charge; gradient = rate (cost per unit)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['real-life graph', 'cost graph', 'interpret graph', 'linear graph context'],
  },
  // ── Geometry and measures ──
  {
    slug: 'geometric-vocabulary-notation-and-drawing', title: 'Geometric vocabulary, labelling conventions, measuring and drawing', strand: 'GM',
    statementIds: ['M1-GM-01', 'M1-GM-02', 'M1-GM-03', 'M1-GM-14'], prerequisites: [], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q13: measuring an angle to tolerance and explaining why it cannot be 137°; wrong protractor scale; cm → mm errors (×100, ÷10).'),
      ev('November 2025', 'M1', 'Q6(b): drawing a rectangle from a given diagonal — "very disappointing"; Q13(c) no protractor brought.'),
    ],
    mustMemorise: ['Acute < 90° < obtuse < 180° < reflex', 'Parallel, perpendicular, vertex, edge, regular polygon, line/rotational symmetry'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['vocabulary', 'notation', 'protractor', 'measuring angles', 'symmetry', 'regular polygon', 'parallel', 'perpendicular'],
  },
  {
    slug: 'angles-at-a-point-and-on-a-line', title: 'Angles at a point, on a straight line and vertically opposite', strand: 'GM',
    statementIds: ['M1-GM-04'], prerequisites: ['geometric-vocabulary-notation-and-drawing'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q12: "angles on opposite ends of straight lines" misconception (M2/M3); Q19 angle chase quadrilateral → straight line.'),
      ev('Summer 2023', 'M1', 'Q26: angles with reasons — poor; reasons must be stated in words.'),
    ],
    mustMemorise: ['Angles at a point 360°; on a straight line 180°; vertically opposite angles equal'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['angles at a point', 'angles on a straight line', 'vertically opposite', 'angle reasons'],
  },
  {
    slug: 'angles-on-parallel-lines', title: 'Alternate and corresponding angles on parallel lines', strand: 'GM',
    statementIds: ['M1-GM-05'], prerequisites: ['angles-at-a-point-and-on-a-line'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M1', 'Q29: alternate/corresponding/co-interior angles — "very poorly attempted by nearly all"; answered "acute/obtuse" or numbers.'),
      ev('November 2025', 'M3', 'Q13: parallel-line angles — more than 70% wrong on (a), more than 60% on (b); M2 Q14 "vast majority scored zero".'),
      ev('Summer 2023', 'M3', 'Q10: angles with reasons "most disappointing… despite being a lower grade question"; the alternate angle rarely identified; "Z angles" earns nothing.'),
    ],
    mustMemorise: ['Alternate angles equal; corresponding angles equal; co-interior angles sum to 180°', 'Use the words "alternate"/"corresponding", never "Z"/"F" angles'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['parallel lines', 'alternate angles', 'corresponding angles', 'co-interior', 'angle reasons'],
  },
  {
    slug: 'circle-parts-and-vocabulary', title: 'Parts of a circle: centre, radius, chord, diameter, circumference', strand: 'GM',
    statementIds: ['M1-GM-06'], prerequisites: ['geometric-vocabulary-notation-and-drawing'], calculator: 'either', difficulty: 2,
    examinerEvidence: [ev('Summer 2023', 'M1', 'Q8: mark a point on the circumference, draw a radius, measure the diameter in mm — "only the very strongest" (640/6400 instead of 64).')],
    mustMemorise: ['Diameter = 2 × radius'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['circle', 'radius', 'diameter', 'chord', 'circumference', 'centre'],
  },
  {
    slug: 'triangles-and-quadrilaterals-properties-and-angles', title: 'Properties of triangles and quadrilaterals and their angle sums', strand: 'GM',
    statementIds: ['M1-GM-07'], prerequisites: ['angles-at-a-point-and-on-a-line'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q20: isosceles triangle angles — angle sum taken as 360°.'),
      ev('November 2025', 'M1', 'Q21: angles in two triangles — 312° summed, subtracted from 360° and halved; M2 Q14 "vast majority scored zero"; Q28 quadrilateral with 4x and 3x (189 ÷ 3 and ÷ 4).'),
      ev('Summer 2024', 'M1', 'Q4(a): a kite was not identified; November 2024 M2 kite angles.'),
    ],
    mustMemorise: ['Triangle 180°, quadrilateral 360°', 'Isosceles base angles equal; equilateral 60°', 'Properties of square, rectangle, parallelogram, rhombus, kite, trapezium'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['triangle', 'quadrilateral', 'isosceles', 'equilateral', 'kite', 'rhombus', 'trapezium', 'parallelogram', 'angle sum'],
  },
  {
    slug: '3d-shapes-nets-plans-and-elevations', title: '3D shapes: faces, edges, vertices, nets, plans and elevations', strand: 'GM',
    statementIds: ['M1-GM-08', 'M1-GM-09'], prerequisites: ['geometric-vocabulary-notation-and-drawing'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('November 2025', 'M1', 'Q22: cuboid named "cube/rectangle"; edges and vertices transposed; net of a cylinder → "circle"; M2 Q13 under 60% cuboid, 40% cylinder net; M3 Q5 3D vocabulary.'),
      ev('Summer 2024', 'M1', 'Q18(b): plan view of a 3D shape; M3 Q4(b) plan drawing gaps.'),
      ev('Summer 2023', 'M1', 'Q22: volume and external surface area of an open box from its net — units missing, areas summed.'),
    ],
    mustMemorise: ['Cube 6 faces, 12 edges, 8 vertices', 'Plan = view from above; front/side elevations'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['3D shapes', 'faces', 'edges', 'vertices', 'nets', 'plans', 'elevations', 'isometric'],
  },
  {
    slug: 'metric-units-estimating-and-converting', title: 'Metric units: estimating measures and converting between units', strand: 'GM',
    statementIds: ['M1-GM-10', 'M1-GM-11', 'M1-GM-12'], prerequisites: ['place-value-and-decimals'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M1', 'Q4: choosing units — 0.6 g for a 10p coin, 6 cm for a smartphone.'),
      ev('Summer 2024', 'M1', 'Q5: 1000 ml in a litre unknown to many — "basic functional knowledge".'),
      ev('November 2025', 'M1', 'Q14: 8.3 kg ÷ 125 g — unit conversion; 66.4 not rounded down; Q6(b) 6.3 cm → mm (×100, ÷10, rounded to 60).'),
      ev('Summer 2025', 'M1', 'Q16: 60 litres → 60 000 cm³ needed for depth — "almost none converted".'),
    ],
    mustMemorise: ['1 cm = 10 mm, 1 m = 100 cm, 1 km = 1000 m', '1 kg = 1000 g, 1 tonne = 1000 kg', '1 litre = 1000 ml = 1000 cm³'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['metric units', 'convert units', 'estimate measures', 'litres', 'millilitres', 'grams', 'kilograms'],
  },
  {
    slug: 'time-timetables-and-measure-problems', title: 'Time, timetables, temperature and problems with measures', strand: 'GM',
    statementIds: ['M1-GM-13'], prerequisites: ['metric-units-estimating-and-converting'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M1', 'Q11(a): time difference 21:55 to 06:06 — calculator 2155 − 606 = 1549; M2 Q3(a) time intervals "no clear strategy".'),
      ev('Summer 2023', 'M1', 'Q23: 100 minutes in an hour; 45 min ≠ 0.75 h (answers 1.2 or 12 in M2 Q13).'),
      ev('November 2025', 'M5', 'Paper 1 Q11: 7 h → 420 min then 15% — "100 minutes in an hour"; 1.05 h read as 105 min.'),
    ],
    mustMemorise: ['60 minutes in an hour — never work in decimals of 100', '¼ h = 15 min = 0.25 h, ¾ h = 45 min = 0.75 h'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['time', 'timetable', '24-hour clock', 'temperature', 'calendar', 'time intervals'],
  },
  {
    slug: 'speed-and-compound-measures', title: 'Speed and other compound measures (heart rate, miles per gallon)', strand: 'GM',
    statementIds: ['M1-GM-15'], prerequisites: ['time-timetables-and-measure-problems', 'substitution-and-standard-formulae'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M1', 'Q25: average speed for a whole journey "beyond… practically all"; (30 + 54)/2 = 42 mph; M2 Q18 "very few… any marks".'),
      ev('Summer 2023', 'M3', 'Q5: time and speed — "tens rather than 60ths"; 54 ÷ 45.'),
      ev('Summer 2025', 'M5', 'Paper 2 Q15 (2023): time spent 4.3 h for 4½ h and average speed "beyond the capability of the vast majority".'),
    ],
    mustMemorise: ['Speed = distance ÷ time; distance = speed × time', 'Average speed = total distance ÷ total time'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['speed', 'distance', 'time', 'compound measures', 'average speed', 'rate'],
  },
  {
    slug: 'perimeter-and-area-rectangles-triangles-compound', title: 'Perimeter and area of rectangles, triangles and compound shapes', strand: 'GM',
    statementIds: ['M1-GM-16'], prerequisites: ['substitution-and-standard-formulae', 'triangles-and-quadrilaterals-properties-and-angles'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q28: area of a badge made of triangles and rectangles (6 marks) "proved too difficult… frequently left blank"; M2 Q21 and M3 Q14 the same problem — over half failed to score the first mark.'),
      ev('November 2025', 'M2', 'Q24: area problem — 70% zero, 5% correct; M1 Q32 rectangles inside a 60 cm square few understood.'),
      ev('Summer 2025', 'M1', 'Q6: area vs perimeter confusion; Summer 2024 M1 Q13 area of a fence and rounding tins up.'),
    ],
    mustMemorise: ['Area of rectangle = l × w; triangle = ½ × base × height', 'Perimeter = distance round the outside'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['perimeter', 'area', 'rectangle', 'triangle', 'compound shape', 'composite'],
  },
  {
    slug: 'circumference-and-area-of-circles', title: 'Circumference and area of circles and semicircles', strand: 'GM',
    statementIds: ['M1-GM-17'], prerequisites: ['circle-parts-and-vocabulary', 'substitution-and-standard-formulae'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q19: circumference of circular tables for ribbon — "vast majority… zero"; only 4% correct; M1 Q27 "very few… considered… circumference".'),
      ev('November 2025', 'M2', 'Q28: circumference/area — 75% zero, 7% correct; formulae not recalled; diameter/radius confused.'),
      ev('Summer 2024', 'M3', 'Q11: circumference in context — area found instead; Summer 2023 M2 Q25 semicircle radius ÷2 instead of subtracting.'),
    ],
    mustMemorise: ['C = πd = 2πr', 'A = πr²', 'Semicircle perimeter includes the diameter'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['circumference', 'area of circle', 'pi', 'semicircle', 'radius', 'diameter'],
  },
  {
    slug: 'surface-area-and-volume-of-cubes-and-cuboids', title: 'Surface area and volume of cubes and cuboids (including capacity)', strand: 'GM',
    statementIds: ['M1-GM-18'], prerequisites: ['3d-shapes-nets-plans-and-elevations', 'perimeter-and-area-rectangles-triangles-compound', 'metric-units-estimating-and-converting'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q16: volume of a cuboid then depth of 60 litres — most added the dimensions (140); almost none converted 60 l = 60 000 cm³; M2 Q8(b) the same.'),
      ev('Summer 2025', 'M3', 'Q2: volume given → missing dimension — "three quarters of the entry calculated the volume of the container and could proceed no further".'),
      ev('November 2025', 'M1', 'Q5(b): volume of a cube structure — faces counted, hidden cubes ignored; Summer 2023 M1 Q22 open box from a net.'),
    ],
    mustMemorise: ['Volume of cuboid = l × w × h', 'Surface area = sum of the areas of all faces', '1 litre = 1000 cm³'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['volume', 'surface area', 'cuboid', 'cube', 'capacity', 'litres'],
  },
  // ── Handling data ──
  {
    slug: 'handling-data-cycle-sampling-surveys-and-bias', title: 'The handling-data cycle: samples, populations, surveys, data types and bias', strand: 'HD',
    statementIds: ['M1-HD-01', 'M1-HD-02', 'M1-HD-03', 'M1-HD-04', 'M1-HD-05', 'M1-HD-06'], prerequisites: [], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M1', 'Q21: qualitative/discrete/continuous — "mostly guessed".'),
      ev('November 2025', 'M1', 'Q31: criticising a sample vs a questionnaire — "sample too small"; same reason given twice; M3 Q15 generic criticism.'),
      ev('Summer 2024', 'M4', 'Q15(b): faults and improvements in a sampling method.'),
    ],
    mustMemorise: ['Discrete (counted) vs continuous (measured) vs qualitative', 'Bigger random sample → more reliable', 'Bias: sample must represent the population'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['handling data cycle', 'sample', 'population', 'random sampling', 'bias', 'questionnaire', 'data types', 'hypothesis'],
  },
  {
    slug: 'classifying-data-and-two-circle-venn-diagrams', title: 'Sorting and tabulating data, including 2-circle Venn diagrams', strand: 'HD',
    statementIds: ['M1-HD-07'], prerequisites: ['handling-data-cycle-sampling-surveys-and-bias'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M1', 'Q30: Venn diagram completion (3 marks) — 15 placed outside; few completed 35 and 20; (b) rarely correct.'),
      ev('Summer 2023', 'M1', 'Q27: Venn — answer 2 from ignoring the overlap; November 2025 M1 Q23 overlap 28 − 12 not found; M3 Q20 total including the overlap.'),
    ],
    mustMemorise: ['Fill the intersection first, then subtract', 'Grouping notation 0 ≤ t < 4 vs 0–4'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['Venn diagram', 'two circles', 'sort data', 'classify', 'tally', 'grouped frequency'],
  },
  {
    slug: 'two-way-tables-and-extracting-data', title: 'Two-way tables and extracting data from tables and lists', strand: 'HD',
    statementIds: ['M1-HD-08', 'M1-HD-09'], prerequisites: ['handling-data-cycle-sampling-surveys-and-bias'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M2', 'Q10/Q16/Q17: multi-step reading from tables lost marks.'),
      ev('Summer 2024', 'M5', 'Paper 2 Q14: percentage voting from two columns of a table.'),
    ],
    mustMemorise: [], onFormulaSheet: [], corbettmaths: [],
    keywords: ['two-way table', 'distance chart', 'read tables', 'timetable data'],
  },
  {
    slug: 'mean-median-mode-and-range', title: 'Mean, median, mode and range from a list', strand: 'HD',
    statementIds: ['M1-HD-10'], prerequisites: ['integers-ordering-and-inequality-symbols'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M1', 'Q14(b): median of 12 values (two middle values); November 2024 M2 median with even n from stem-and-leaf.'),
      ev('Summer 2024', 'M2', 'Q16: mean vs range confusion; range used as an average.'),
      ev('November 2025', 'M1', 'Q15(c): effect on the mean of changing a value.'),
    ],
    mustMemorise: ['Mean = total ÷ how many; median = middle of ordered list; mode = most common; range = biggest − smallest'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['mean', 'median', 'mode', 'range', 'averages'],
  },
  {
    slug: 'averages-from-frequency-tables', title: 'Mean, mode and median from an ungrouped frequency table', strand: 'HD',
    statementIds: ['M1-HD-11'], prerequisites: ['mean-median-mode-and-range'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q27: mean from a frequency table — divided by 4 (rows) not 20; range taken from the frequencies; M2 Q20 ÷4/÷10.'),
      ev('Summer 2025', 'M3', 'Q13: range from a frequency table — a quarter correct; mean rounded to 2.'),
    ],
    mustMemorise: ['Mean = Σ(fx) ÷ Σf — divide by the total frequency, not the number of rows'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['frequency table', 'mean from table', 'fx', 'modal value', 'median from table'],
  },
  {
    slug: 'bar-charts-pictograms-pie-charts-and-line-graphs', title: 'Bar charts, pictograms, pie charts, line graphs and misleading graphs', strand: 'HD',
    statementIds: ['M1-HD-12'], prerequisites: ['classifying-data-and-two-circle-venn-diagrams'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M1', 'Q21: pie chart missing angles (75° each) and explaining that 75° ≠ 75%; M2 Q13(c) the same explanation.'),
      ev('Summer 2023', 'M1', 'Q17: pie chart — ÷100 not ÷360; wrong protractor scale.'),
      ev('Summer 2025', 'M1', 'Q14: bar chart — highest bar vs highest total; bars drawn freehand; Summer 2024 M1 Q15(b) pie charts with different sample sizes.'),
    ],
    mustMemorise: ['Pie chart: angle = frequency ÷ total × 360°', 'Composite bar charts; check scales and axis labels for misleading graphs'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['bar chart', 'pictogram', 'pie chart', 'line graph', 'misleading graph', 'composite bar chart'],
  },
  {
    slug: 'frequency-trees-flow-charts-and-stem-and-leaf', title: 'Frequency trees, flow charts and stem-and-leaf diagrams', strand: 'HD',
    statementIds: ['M1-HD-12'], prerequisites: ['classifying-data-and-two-circle-venn-diagrams', 'mean-median-mode-and-range'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('November 2025', 'M1', 'Q30: flow charts — "divisible" not understood; M3 Q14 flowchart gaps.'),
      ev('Summer 2023', 'M1', 'Q28: stem-and-leaf key and ordering; M3 Q12 stem-and-leaf well done.'),
      ev('Summer 2024', 'M1', 'Q22: flow diagram — 81 treated as prime.'),
    ],
    mustMemorise: ['Stem-and-leaf needs an ordered leaf row and a key', 'Frequency-tree branches add to the parent total'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['frequency tree', 'flow chart', 'stem and leaf', 'decision tree'],
  },
  {
    slug: 'comparing-distributions-patterns-and-exceptions', title: 'Comparing distributions and finding patterns and exceptions in data', strand: 'HD',
    statementIds: ['M1-HD-13', 'M1-HD-14'], prerequisites: ['mean-median-mode-and-range', 'bar-charts-pictograms-pie-charts-and-line-graphs'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M1', 'Q23: comparing means and using "range" — the word range is required; M2 Q7(b)(ii) and M3 Q8(b) wording.'),
      ev('Summer 2024', 'M1', 'Q14(b): interpreting the wettest day/month from data.'),
      ev('November 2025', 'all', 'Data-handling reasoning must refer to the actual data; generic statements score nothing.'),
    ],
    mustMemorise: ['Compare an average AND a measure of spread, quoting the numbers'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['compare distributions', 'inference', 'patterns', 'exceptions', 'interpret data'],
  },
  {
    slug: 'scatter-diagrams-and-correlation', title: 'Scatter diagrams and recognising correlation', strand: 'HD',
    statementIds: ['M1-HD-15'], prerequisites: ['coordinates-and-plotting-straight-line-graphs'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q22(a): "positive" written without "correlation"; M3 Q14(a) relationship vs correlation wording.'),
    ],
    mustMemorise: ['Positive / negative / no correlation — describe in context'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['scatter diagram', 'scatter graph', 'correlation', 'positive correlation', 'negative correlation'],
  },

  // ═══════════════ STAGE 1 — M5 ═══════════════
  // ── Number ──
  {
    slug: 'non-calculator-arithmetic', title: 'Non-calculator methods with whole numbers, fractions, decimals and percentages', strand: 'NA',
    statementIds: ['M5-NA-01'], prerequisites: ['place-value-and-decimals', 'percentages-of-quantities', 'fraction-of-a-quantity'], calculator: 'non-calc', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 1 overview: "a large number of candidates at this level still have very poor numeracy skills"; Q2 money without a calculator; Q7 44 ÷ 6 then 8 × £1.75 (times-table errors).'),
      ev('Summer 2023', 'M5', 'Paper 1 Q7(b): 972 ÷ 36 by a "similar method" — long division errors; Q1 6.5 × £7 = "£45.5".'),
      ev('Summer 2025', 'M6', 'Paper 1 Q6: 35% via 0.35 × 120 without a calculator; Q8 0.65 + 0.2 = 0.67.'),
      ev('November 2025', 'M5', 'Paper 2 Q1: manual arithmetic errors even on the calculator paper.'),
    ],
    mustMemorise: ['Times tables to 12 × 12', 'Column methods; multiplying by 0.2 = ÷5; dividing by 0.5 = ×2'], onFormulaSheet: [],
    corbettmaths: [cm('Multiplication', '199'), cm('Multiplication', '200')],
    keywords: ['non-calculator', 'mental methods', 'written methods', 'long multiplication', 'long division'],
  },
  {
    slug: 'estimation-and-approximation', title: 'Estimating answers and checking with approximation', strand: 'NA',
    statementIds: ['M5-NA-02'], prerequisites: ['rounding-and-money-notation', 'non-calculator-arithmetic'], calculator: 'non-calc', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 1 Q3: estimation ignored (398 × 3.1 done exactly); Paper 2 Q4 and M7 Paper 1 Q2 the same.'),
      ev('Summer 2023', 'M5', 'Paper 1 Q12: using 23 × 146 = 3358 to find 2.3 × 1.46; estimating (200 × 30) ÷ 0.5 (3000 common).'),
      ev('November 2025', 'M6', 'Paper 1 Q5(b): estimating a square root (100/2 = 50; 20 × 2 = 40 for 20.3²).'),
    ],
    mustMemorise: ['Round each number to 1 s.f. then calculate', 'Dividing by 0.5 doubles'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['estimate', 'approximation', 'round to 1 significant figure', 'check calculations'],
  },
  {
    slug: 'ratio-notation-and-simplifying', title: 'Ratio notation, simplest form and links to fractions', strand: 'NA',
    statementIds: ['M5-NA-03'], prerequisites: ['fraction-of-a-quantity', 'factors-multiples-primes-squares-and-cubes'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M5', 'Paper 2 Q13: writing 500 g : 750 g : 1 kg as a ratio — "many ignored ratio altogether"; 1 kg → 100 g.'),
      ev('Summer 2023', 'M6', 'Paper 2 Q9(a): writing ½ : ¾ : 1 as a ratio — partial marks only.'),
      ev('Summer 2025', 'M7', 'Paper 2 Q3(d): ratio used for a probability (not allowed).'),
    ],
    mustMemorise: ['Same units before simplifying', '1:3 means the first person gets ¼'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['ratio', 'simplify ratio', 'ratio to fraction', 'equivalent ratios'],
  },
  {
    slug: 'dividing-a-quantity-in-a-ratio', title: 'Dividing a quantity in a given ratio (including when one part is known)', strand: 'NA',
    statementIds: ['M5-NA-04'], prerequisites: ['ratio-notation-and-simplifying'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 1 Q13: ratio not of the "share" type (45 boys = 5 parts) — parts added to 8 and 45 ÷ 8; M6 Paper 1 Q10 and M7 Paper 1 Q5 the same.'),
      ev('Summer 2025', 'M5', 'Paper 2 Q13: share £240 in the ratio 1:4 — ÷4 not ÷5; 560 shared; M7 Paper 2 Q4 the same.'),
      ev('Summer 2024', 'M5', 'Paper 2 Q15: cordial 800 ml and 2100 ml → 2800 — "very little understanding… 2900 ml" or 2900 ÷ 4 = 725; same on M6/M7.'),
      ev('November 2025', 'M5', 'Paper 1 Q15: 180 ÷ 13, 180 ÷ 7; M6 Paper 2 Q11 1680/3 and 1680/5.'),
    ],
    mustMemorise: ['Add the parts, find one part, multiply', 'If one share is known, divide by its number of parts to find one part'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['share in a ratio', 'divide in a ratio', 'ratio problems', 'one part known'],
  },
  {
    slug: 'proportion-best-buy-scaling-and-exchange-rates', title: 'Proportion in context: unitary method, best buy, recipes, mixing and exchange rates', strand: 'NA',
    statementIds: ['M5-NA-05'], prerequisites: ['ratio-notation-and-simplifying', 'metric-units-estimating-and-converting'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 2 Q8: best value with three sizes — insufficient comparisons; price + capacity nonsense; M6 Paper 2 Q3 price × capacity invalid.'),
      ev('Summer 2023', 'M5', 'Paper 2 Q5: tiling — 16 000 ÷ 20 instead of ÷ 20²; M6 Paper 2 Q1 the same.'),
      ev('Summer 2025', 'M6', 'Paper 2: exchange rates and unit comparisons were among the best-answered questions.'),
      ev('November 2025', 'M7', 'Paper 2 Q2: 500 ÷ 1.33 exchange-rate step; M5 Paper 2 Q11 special-offer cupcakes only the strongest.'),
    ],
    mustMemorise: ['Unitary method: find the value of one, then scale', 'Best buy: compare price per unit (or units per £)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['proportion', 'unitary method', 'best buy', 'value for money', 'recipe', 'exchange rate', 'scaling', 'mixing', 'concentration'],
  },
  {
    slug: 'sequences-special-numbers-and-rules', title: 'Sequences: triangular, square and cube numbers; term-to-term and position-to-term rules', strand: 'NA',
    statementIds: ['M5-NA-06', 'M5-NA-07'], prerequisites: ['factors-multiples-primes-squares-and-cubes'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 2 Q10(c)(d): pattern sequences (square numbers) — guessing; Q5(a) recognising cube numbers; M7 Paper 1 Q2 square/cube/triangular numbers.'),
      ev('Summer 2025', 'M5', 'Paper 2 Q11(a): describing the rule "difference of two dice" — wrote "adds".'),
      ev('November 2025', 'M5', 'Paper 1 Q12(a): sequence with negatives (−2 → 0); Q6 rule given instead of a term; Paper 2 Q16 improper-fraction sequence stopped at 3.4.'),
      ev('Summer 2024', 'M5', 'Paper 1 Q9(b): used the 5th not the 6th term.'),
    ],
    mustMemorise: ['Triangular numbers 1, 3, 6, 10, 15, 21, 28, 36, 45, 55', 'Square numbers to 144, cube numbers 1, 8, 27, 64, 125'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['sequences', 'triangular numbers', 'square numbers', 'cube numbers', 'term-to-term', 'position-to-term', 'patterns'],
  },
  {
    slug: 'real-life-graphs-conversion-and-distance-time', title: 'Real-life graphs: conversion graphs, distance–time and travel graphs', strand: 'NA',
    statementIds: ['M5-NA-08'], prerequisites: ['real-life-linear-graphs', 'speed-and-compound-measures'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 2 Q9: conversion graph — reading £34 500 at 41 000 "disappointing"; converting 16 000 "most… no marks… cannot interpret graphical data beyond taking simple readings"; M6 Paper 2 Q4(b) reading at 32 000 and halving.'),
      ev('Summer 2024', 'M5', 'Paper 2 Q6: drawing a conversion graph — points misplotted, (−5, 23), bar charts drawn; reading at 22 °C / 27 °F.'),
      ev('Summer 2023', 'M5', 'Paper 2 Q15: distance–time graph — time spent given as 4.3/4.30 for 4.5 h; average speed "beyond the capability of the vast majority" (20/0.3, 20/30); M6 Paper 2 Q11 "very disappointing".'),
    ],
    mustMemorise: ['Gradient of a distance–time graph = speed; horizontal = stopped', 'Scale up readings (e.g. read 16 000 as 4 × 4000)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['conversion graph', 'distance-time graph', 'travel graph', 'real-life graph', 'reading graphs'],
  },
  // ── Geometry and measures ──
  {
    slug: 'reading-scales-accuracy-and-imperial-units', title: 'Reading scales, the approximate nature of measurement, and imperial units', strand: 'GM',
    statementIds: ['M5-GM-01', 'M5-GM-02'], prerequisites: ['metric-units-estimating-and-converting', 'rounding-and-money-notation'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('November 2025', 'M5', 'Paper 1 Q18: shortest length for 92 m to the nearest metre — fewer than 10% (answer 90 given); M6 Paper 1 Q13 and M7 Paper 1 Q8 the same (90 not 91.5).'),
      ev('November 2025', 'M7', 'Paper 2 Q3: kg → lb — did not know 1 kg = 2.2 lb; M6 Paper 2 Q9 kg/lb costing with the wrong conversion.'),
      ev('Summer 2025', 'M5', 'Paper 2 Q7: km → miles via 16 × 1.6 = 25.6 — needed 5 miles = 8 km; Summer 2024 M5 Paper 2 Q9 gallons → litres then cans (÷4.5, 14.4 not rounded up).'),
      ev('Summer 2023', 'M5', 'Paper 1 Q4(d): gauge intervals (£620); Paper 2 Q7 feet conversion; Nov 2025 M5 Paper 1 Q1(d) scale interval 2 (361).'),
    ],
    mustMemorise: ['5 miles ≈ 8 km; 1 kg ≈ 2.2 lb (all other conversions are given)', 'A measurement to the nearest unit lies within ± half a unit'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['scales', 'measuring instruments', 'imperial units', 'miles', 'kilometres', 'pounds', 'gallons', 'accuracy of measurement', 'bounds'],
  },
  {
    slug: 'maps-scale-drawings-and-accurate-drawing', title: 'Maps, scale factors, scale drawings, compass directions and accurate drawing', strand: 'GM',
    statementIds: ['M5-GM-03', 'M5-GM-10'], prerequisites: ['ratio-notation-and-simplifying', 'geometric-vocabulary-notation-and-drawing', 'metric-units-estimating-and-converting'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 1 Q12(b): 1:25 000 with 8 cm → 200 000 cm → 2 km "poorly answered by nearly all… a lot of blank answer spaces"; M6 Paper 1 Q9(b) and M7 Paper 1 Q5(b) ("1 cm = 25 000 km") the same.'),
      ev('Summer 2024', 'M5', 'Paper 1 Q12: scale drawing of a triangle — not drawn; measured the given diagram; 10.5 cm → 100.5 m; some lacked ruler/protractor.'),
      ev('Summer 2023', 'M5', 'Paper 2 Q1: compass directions (south-west vs south-east); November 2025 M5 Paper 1 Q2 "WS, NS".'),
      ev('Summer 2024', 'M7', 'Paper 1 Q3: told to "use a scale drawing" — Pythagoras gained nothing.'),
    ],
    mustMemorise: ['Eight compass points', 'Scale 1:25 000 — convert cm to km via ÷100 000', 'Bring ruler, compasses, protractor'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['map scale', 'scale drawing', 'scale factor', 'compass points', 'bearings basics', 'accurate drawing', 'ruler and protractor'],
  },
  {
    slug: 'angle-sum-of-triangles-and-polygons', title: 'Using the angle sum of a triangle to find angle sums of polygons', strand: 'GM',
    statementIds: ['M5-GM-04'], prerequisites: ['triangles-and-quadrilaterals-properties-and-angles'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M5', 'Paper 2 Q13: angles in a pentagon — 540° unknown; 360° used; M6 Paper 2 Q10 184 not halved; M7 Paper 2 Q7.'),
      ev('Summer 2023', 'M5', 'Paper 2 Q11: polygon angle sums via triangles; M6 Paper 2 Q7 decagon via quadrilaterals.'),
      ev('November 2025', 'M5', 'Paper 1 Q19: polygon angle sum — more than 6 triangles drawn, or measured.'),
    ],
    mustMemorise: ['Angle sum of an n-sided polygon = (n − 2) × 180°', 'Pentagon 540°, hexagon 720°'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['angle sum', 'polygon', 'pentagon', 'hexagon', 'triangles in a polygon'],
  },
  {
    slug: 'reflections-in-the-axes', title: 'Single transformations: reflections in the x-axis and y-axis', strand: 'GM',
    statementIds: ['M5-GM-05', 'M5-GM-06'], prerequisites: ['coordinates-and-plotting-straight-line-graphs', 'geometric-vocabulary-notation-and-drawing'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M5', 'Paper 2 Q12(a): reflection in the x-axis — "disappointingly high number unable".'),
      ev('Summer 2024', 'M5', 'Paper 2 Q8: describing a reflection — "mirrored/flipped"; "in x"; x = 0 instead of y = 0; M6 Paper 2 Q5 and M7 Paper 2 Q1 the same.'),
      ev('November 2025', 'M6', 'Paper 1: reflections among the best-answered questions.'),
    ],
    mustMemorise: ['x-axis is the line y = 0; y-axis is the line x = 0', 'Describe: "reflection in the line …"'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['reflection', 'mirror line', 'x-axis', 'y-axis', 'transformations', 'symmetry'],
  },
  {
    slug: 'rotations-about-the-origin', title: 'Rotations about the origin (±90° and 180°)', strand: 'GM',
    statementIds: ['M5-GM-07'], prerequisites: ['reflections-in-the-axes'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 2 Q15: rotation 90° clockwise about the origin — "most… unable"; reflected or rotated 180°; M6 Paper 2 Q10 reflected in the y-axis.'),
      ev('Summer 2024', 'M6', 'Paper 1 Q16: describing a single rotation — angle/direction/centre missing; extra transformations added; M7 Paper 1 Q12 "turn" ≠ rotate.'),
    ],
    mustMemorise: ['A rotation needs angle, direction and centre', 'Use tracing paper; 180° needs no direction'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['rotation', 'centre of rotation', 'clockwise', 'anticlockwise', 'origin', 'tracing paper'],
  },
  {
    slug: 'translations', title: 'Translations (describing and performing, in words)', strand: 'GM',
    statementIds: ['M5-GM-08'], prerequisites: ['coordinates-and-plotting-straight-line-graphs'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M5', 'Paper 1 Q17: describing a translation — "only one candidate gained both marks"; "4 across"; extra transformations; M7 Paper 1 Q7 "moved".'),
      ev('Summer 2023', 'M5', 'Paper 1 Q14(a): the word "translation" was used "a couple of times" in the whole cohort; "three across".'),
      ev('Summer 2025', 'M5', 'Paper 1 Q16(b): reverse translation — only the very best; (a) drawn without a ruler; M6 Paper 1 Q13(b) the same.'),
    ],
    mustMemorise: ['Say "translation … right/left and … up/down"; the shape does not turn or resize'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['translation', 'describe a translation', 'slide', 'transformations'],
  },
  {
    slug: 'enlargements-positive-whole-number-scale-factor', title: 'Enlargements by a positive whole-number scale factor', strand: 'GM',
    statementIds: ['M5-GM-09'], prerequisites: ['coordinates-and-plotting-straight-line-graphs', 'ratio-notation-and-simplifying'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M5', 'Paper 2 Q4: enlargement scale factor given as 64 or 8 instead of 4 (areas compared); deciding whether an enlargement is correct answered "can\'t tell"; M6 Paper 2 Q1 the same.'),
      ev('November 2025', 'M5', 'Paper 2 Q6(a): scale factor 4 from comparing areas; fewer than half got 2.'),
      ev('Summer 2025', 'M5', 'Paper 2 Q12: enlargement lines unruled; M6 Paper 2 enlarging a rectangle well done.'),
    ],
    mustMemorise: ['Scale factor = new length ÷ old length (compare lengths, not areas)', 'Rays from the centre of enlargement'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['enlargement', 'scale factor', 'centre of enlargement', 'similar shapes basics'],
  },
  // ── Handling data (probability) ──
  {
    slug: 'probability-vocabulary-and-scale', title: 'The language of probability and the probability scale 0–1', strand: 'HD',
    statementIds: ['M5-HD-01', 'M5-HD-02', 'M5-HD-03'], prerequisites: ['fractions-decimals-percentages-equivalence'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M5', 'Paper 1 Q5: probability scale — words written instead of letters, "disappointing"; November 2025 M5 Paper 1 Q8 probability in words.'),
      ev('Summer 2024', 'M5', 'Paper 2 Q3(a): "unbiased" = fair; (c) "all quadrilaterals" → certain; Paper 1 Q8 explaining "over half" → must be > 0.5.'),
      ev('Summer 2025', 'M5', 'Paper 2 Q6(c): probability of both events on a scale (1/6) — very few; marked 2/6; M6 Paper 2 Q1(c) two arrows drawn.'),
    ],
    mustMemorise: ['Impossible 0, evens ½, certain 1', 'Probabilities as fractions/decimals/percentages — never words or ratios in answers'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['probability scale', 'likely', 'unlikely', 'evens', 'certain', 'impossible', 'fair', 'random', 'risk'],
  },
  {
    slug: 'listing-outcomes-and-systematic-listing', title: 'Listing outcomes for one and two events; systematic listing', strand: 'HD',
    statementIds: ['M5-HD-04', 'M5-HD-05'], prerequisites: ['probability-vocabulary-and-scale'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 2 Q11(c)(d): probabilities from a two-dice difference table (8/36, 6/36) — words used instead of fractions; "greater than 3" misunderstood.'),
      ev('Summer 2023', 'M6', 'Paper 2: listing combinations was among the best-answered questions.'),
    ],
    mustMemorise: ['List in a fixed order (or use a two-way table) so nothing is missed'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['outcomes', 'sample space', 'systematic listing', 'combinations', 'two events'],
  },
  {
    slug: 'calculating-probabilities-and-expectation', title: 'Calculating probabilities, mutually exclusive events, P(not A) and expectation', strand: 'HD',
    statementIds: ['M5-HD-06', 'M5-HD-07', 'M5-HD-08', 'M5-HD-09'], prerequisites: ['listing-outcomes-and-systematic-listing', 'fraction-of-a-quantity'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M5', 'Paper 1 Q4: probability from a bar chart 3/10 — denominator taken as the axis maximum; Q15(a) explaining why P(red) ≠ ¼ (4/20 or 1/5 answers).'),
      ev('Summer 2024', 'M5', 'Paper 1 Q15: missing probability — 0.3 read as 0.03 → 0.46; M6 Paper 1 Q10 the same; M7 Paper 1 Q6 "1/5".'),
      ev('November 2025', 'M7', 'Paper 2 Q8(b): expected frequency 68 — only 4/10 of 400 found; M6 Paper 2 Q14(b) expected frequency (50%).'),
      ev('Summer 2023', 'M7', 'Paper 1 Q4: P(not q) as 1 − q — answers "100 − q", "50%", "x − q".'),
    ],
    mustMemorise: ['P(event) = favourable ÷ total equally likely outcomes', 'Probabilities of all outcomes sum to 1; P(not A) = 1 − P(A)', 'Expected number = probability × number of trials'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['probability', 'equally likely', 'mutually exclusive', 'not happening', 'expectation', 'expected frequency'],
  },

  // ═══════════════ STAGE 2 — M2 ═══════════════
  // ── Number ──
  {
    slug: 'index-laws-for-numbers', title: 'Index notation and index laws for positive whole-number powers', strand: 'NA',
    statementIds: ['M2-NA-01'], prerequisites: ['factors-multiples-primes-squares-and-cubes'], calculator: 'either', difficulty: 2,
    examinerEvidence: [ev('Summer 2025', 'M6', 'Paper 2 Q13(c): indices — only the very best; November 2025 M6 Paper 2 Q16 m⁷ from adding, e⁵ from dividing.')],
    mustMemorise: ['aᵐ × aⁿ = aᵐ⁺ⁿ; aᵐ ÷ aⁿ = aᵐ⁻ⁿ; (aᵐ)ⁿ = aᵐⁿ'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['indices', 'index laws', 'powers', 'exponents'],
  },
  {
    slug: 'hcf-lcm-and-prime-factorisation', title: 'HCF, LCM and prime factor decomposition', strand: 'NA',
    statementIds: ['M2-NA-02'], prerequisites: ['factors-multiples-primes-squares-and-cubes', 'index-laws-for-numbers'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M2', 'Q26: square number from a product of primes — more than 80% zero; M3 Q18 prime factors/squares gaps.'),
      ev('Summer 2025', 'M2', 'Q22: HCF by listing factors missed some (answer 7); Summer 2024 M2 Q28(b) product of primes written without × signs; M3 Q20(b) HCF given as the LCM 630.'),
      ev('Summer 2023', 'all', 'Advice: product of primes with index notation and × signs; M3 Q20 product of primes well done.'),
    ],
    mustMemorise: ['Factor-tree method; HCF = common primes, LCM = all primes at highest power'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['HCF', 'LCM', 'prime factorisation', 'product of primes', 'divisor', 'factor tree'],
  },
  {
    slug: 'decimals-of-any-size-and-significant-figures', title: 'Calculating with decimals of any size and rounding to significant figures', strand: 'NA',
    statementIds: ['M2-NA-03', 'M2-NA-04'], prerequisites: ['place-value-and-decimals', 'rounding-and-money-notation'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('November 2025', 'M2', 'Q17: rounding to 2 d.p. — almost half could not.'),
      ev('Summer 2023', 'M6', 'Paper 2 Q6: rounding 264/18 appropriately; M7 Paper 2 Q2 rounding 14.66 early.'),
    ],
    mustMemorise: ['First significant figure = first non-zero digit'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['significant figures', 'decimals', 'rounding', 'appropriate accuracy'],
  },
  {
    slug: 'recurring-decimals-and-fraction-to-decimal-conversion', title: 'Recurring decimals and converting fractions to decimals by division', strand: 'NA',
    statementIds: ['M2-NA-05'], prerequisites: ['equivalent-fractions-and-fraction-to-decimal', 'decimals-of-any-size-and-significant-figures'], calculator: 'either', difficulty: 2,
    examinerEvidence: [ev('Summer 2025', 'M3', 'Q3: changing 2/7 to a decimal — accuracy lost; examiners repeatedly warn against rounding ⅔ to 0.67 mid-calculation.')],
    mustMemorise: ['Recurring notation (dot over digit); ⅓ = 0.333…, 1/6 = 0.1666…, 1/9 = 0.111…'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['recurring decimal', 'fraction to decimal', 'division', 'exact fraction'],
  },
  {
    slug: 'fraction-arithmetic-all-four-operations', title: 'Multiplying and dividing fractions and mixed numbers', strand: 'NA',
    statementIds: ['M2-NA-06'], prerequisites: ['adding-and-subtracting-fractions'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M8', 'Paper 1 Q9: multiplying three simple fractions — added; (2/10)³ given as 6/30 or 8/100; "surprising how many candidates had difficulty in multiplying fractions" (Summer 2023 M8 P1).'),
      ev('Summer 2023', 'M8', 'Paper 1 Q8: 1/3 × 2/5 = 3/15.'),
    ],
    mustMemorise: ['Multiply tops and bottoms; divide = multiply by the reciprocal; convert mixed numbers first'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['multiply fractions', 'divide fractions', 'mixed numbers', 'reciprocal'],
  },
  {
    slug: 'repeated-percentage-change-and-depreciation', title: 'Percentage multipliers, repeated proportional change and depreciation', strand: 'NA',
    statementIds: ['M2-NA-07'], prerequisites: ['percentage-increase-and-decrease'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('November 2025', 'M2', 'Q25: 15% decrease then increase — one in three zero; M3 Q17 two decreases applied instead of decrease then increase.'),
      ev('November 2025', 'M4', 'Q15: "depreciated" misunderstood; M3 Q30 reverse percentage/depreciation.'),
      ev('Summer 2025', 'M2', 'Q23: percentage change of a perimeter — stopped at 234 or gave 234/240 = 97.5%.'),
    ],
    mustMemorise: ['Multiplier for −15% is 0.85; repeated change = multiplier raised to a power'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['multiplier', 'repeated percentage change', 'depreciation', 'successive percentages'],
  },
  {
    slug: 'compound-interest-and-finance-problems', title: 'Compound interest and finance problems (insurance, tax, mortgages, investments)', strand: 'NA',
    statementIds: ['M2-NA-08'], prerequisites: ['repeated-percentage-change-and-depreciation', 'money-and-simple-finance'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q27: compound interest — simple interest used, percentages added; "one in ten" fully correct; M4 Q4 simple interest scored 2 marks only.'),
      ev('Summer 2024', 'M3', 'Q19: compound interest with different yearly rates — simple interest, rates added, 0.5% used as the multiplier.'),
      ev('Summer 2023', 'M4', 'Q1: compound interest rounding (£4820.50); M2 Q20 done as simple interest.'),
    ],
    mustMemorise: ['Compound interest: multiply by (1 + r/100) each year (max three iterations at M2)', 'Do not round until the end'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['compound interest', 'insurance', 'taxation', 'mortgage', 'investment', 'finance'],
  },
  // ── Algebra ──
  {
    slug: 'expanding-and-factorising-with-a-single-term', title: 'Expanding a single term over a bracket and factorising with term factors', strand: 'NA',
    statementIds: ['M2-NA-09', 'M2-NA-10'], prerequisites: ['collecting-like-terms-and-expanding-constant-brackets', 'factorising-with-constant-common-factors', 'index-laws-for-numbers'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M2', 'Q22: expand and simplify — only −14y correct, squared term missed; M3 Q15 a quarter correct, no 2y × 3y term.'),
      ev('Summer 2025', 'M3', 'Q25: factorising with 4a as the common factor — "only the very best".'),
      ev('November 2025', 'M3', 'Q28: factorising — about a third; sign errors.'),
    ],
    mustMemorise: ['x(2x + 3) = 2x² + 3x; x² − 3x = x(x − 3)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['expand', 'single bracket', 'factorise', 'common factor', 'term factor'],
  },
  {
    slug: 'linear-equations-unknown-on-both-sides-and-fractions', title: 'Forming and solving linear equations with the unknown on both sides and simple fractions', strand: 'NA',
    statementIds: ['M2-NA-11'], prerequisites: ['solving-linear-equations', 'writing-expressions-and-formulae-from-context'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M2', 'Q25: form and solve 4a − 2 = 24 — "few knew what to do".'),
      ev('Summer 2024', 'M2', 'Q29: form an equation as instructed — "1% of the total candidates" did; M3 Q21 forming/solving only the very best, trial and improvement instead.'),
      ev('November 2025', 'M2', 'Q11(b): two-step equation — "only half… able to solve this very straightforward equation"; November 2023 M2 solving 5y − 9 = … with negatives.'),
    ],
    mustMemorise: ['Collect the unknowns on one side; multiply through to clear a fraction', 'Trial and improvement scores nothing when an equation is required'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['linear equations', 'unknown both sides', 'form an equation', 'x/4 + 3 = 7', 'equations with fractions'],
  },
  {
    slug: 'midpoint-and-length-of-a-line-segment', title: 'Midpoint and length of a line segment from coordinates', strand: 'NA',
    statementIds: ['M2-NA-12'], prerequisites: ['coordinates-and-plotting-straight-line-graphs'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M2', 'Q24: midpoint in reverse (find the other endpoint) — (2, 20) from adding; (3, 8) "midpoint of the midpoint".'),
      ev('Summer 2024', 'M3', 'Q22: reverse midpoint (find a and b) poorly answered; M4 Q7 the same.'),
    ],
    mustMemorise: ['Midpoint = average of the x’s and of the y’s', 'Length by Pythagoras on the differences'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['midpoint', 'length of a line', 'coordinates', 'distance between points'],
  },
  {
    slug: 'gradient-and-intercept-of-linear-graphs-in-context', title: 'Gradient and intercept of linear graphs and their meaning in context', strand: 'NA',
    statementIds: ['M2-NA-13'], prerequisites: ['real-life-linear-graphs'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2023', 'M2', 'Q21: meaning of the gradient — "little was correct"; gradient 1.5 by counting squares; M3 Q14 "alien to very many"; M4 Q2 "cost per day".'),
      ev('November 2025', 'M2', 'Q27(b): meaning of the gradient on a real-life graph poorly answered.'),
    ],
    mustMemorise: ['Gradient = rise ÷ run (use the scales, not squares)', 'Intercept = starting/fixed value; gradient = rate per unit'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['gradient', 'intercept', 'rate of change', 'car hire graph', 'interpret gradient'],
  },
  // ── Geometry and measures ──
  {
    slug: 'density', title: 'Density = mass ÷ volume', strand: 'GM',
    statementIds: ['M2-GM-01'], prerequisites: ['speed-and-compound-measures', 'surface-area-and-volume-of-cubes-and-cuboids'], calculator: 'either', difficulty: 2,
    examinerEvidence: [ev('Summer 2025', 'M3', 'Q19(b): compound-measure formula triangle not understood (pressure); density questions require the same rearrangement skill.')],
    mustMemorise: ['Density = mass ÷ volume; mass = density × volume'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['density', 'mass', 'volume', 'compound measure', 'g/cm³'],
  },
  {
    slug: 'area-of-quadrilaterals-and-composite-shapes', title: 'Area of kite, parallelogram, rhombus, trapezium and composite shapes', strand: 'GM',
    statementIds: ['M2-GM-02', 'M2-GM-03'], prerequisites: ['perimeter-and-area-rectangles-triangles-compound', 'circumference-and-area-of-circles'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q25: area of a trapezium then divide the volume by it — rarely; M3 Q17 order of operations in ½(a + b)h despite the formula sheet.'),
      ev('Summer 2023', 'M2', 'Q25: semicircle radius — ÷2 instead of subtracting; M4 Q4 the same.'),
      ev('Summer 2025', 'M2', 'Q21: badge area (two triangles + rectangle) most challenging; many zero.'),
    ],
    mustMemorise: ['Parallelogram = base × height; kite/rhombus = ½ × d₁ × d₂'], onFormulaSheet: ['Area of trapezium = ½(a + b)h'], corbettmaths: [],
    keywords: ['trapezium', 'parallelogram', 'kite', 'rhombus', 'composite shape', 'compound area'],
  },
  {
    slug: 'volume-of-prisms-and-cylinders', title: 'Volume (and surface area) of right prisms and cylinders', strand: 'GM',
    statementIds: ['M2-GM-04'], prerequisites: ['surface-area-and-volume-of-cubes-and-cuboids', 'area-of-quadrilaterals-and-composite-shapes'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M2', 'Q26: volume of a cylinder (grade C) — 90% scored zero; 12 used instead of 6 for the radius; circumference instead of area; 12 × 18 = 216. "Most candidates struggled to find the volume of a cylinder."'),
      ev('Summer 2024', 'M2', 'Q25: trapezium-prism length from the volume — rarely; M3 Q17 stopped at 36.'),
      ev('Summer 2024', 'M3', 'Q24: cylinder + hemisphere volume, 90% full, round down to 16 cups; M4 Q9 sphere used for the hemisphere.'),
    ],
    mustMemorise: ['Cylinder volume = πr²h', 'Prism volume = cross-section area × length (given)'], onFormulaSheet: ['Volume of prism = area of cross-section × length'], corbettmaths: [],
    keywords: ['prism', 'cylinder', 'volume', 'cross-section', 'triangular prism', 'surface area of prism'],
  },
  {
    slug: 'pythagoras-theorem-in-2d', title: 'Pythagoras’ theorem in 2D', strand: 'GM',
    statementIds: ['M2-GM-05'], prerequisites: ['factors-multiples-primes-squares-and-cubes', 'triangles-and-quadrilaterals-properties-and-angles'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M2', 'Q28: Pythagoras to find a length then an area — fewer than 5% correct; added instead of subtracting; M3 Q21 more than half no marks.'),
      ev('Summer 2024', 'M2', 'Q24: Pythagoras for the shorter side — "over 80%… no marks"; hypotenuse formula used; M3 Q16 "3 marks or 0".'),
      ev('November 2025', 'M2', 'Q29: Pythagoras in context — "unable to spot it"; M3 Q21 trapezium perimeter via Pythagoras, result given as final; Summer 2023 M2 Q23 "very few saw Pythagoras".'),
    ],
    mustMemorise: ['a² + b² = c² (c = hypotenuse); subtract for a shorter side', 'Spot right angles in context (ladders, diagonals, trapezium sides)'], onFormulaSheet: [],
    corbettmaths: [cm('Pythagoras', null, 'http://corbettmaths.com/2012/08/19/pythagoras-video/')],
    keywords: ['Pythagoras', 'hypotenuse', 'right-angled triangle', 'shorter side', 'diagonal'],
  },
  // ── Handling data ──
  {
    slug: 'three-circle-venn-diagrams', title: '3-circle Venn diagrams', strand: 'HD',
    statementIds: ['M2-HD-01'], prerequisites: ['classifying-data-and-two-circle-venn-diagrams'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q23: Venn diagrams — "fewer than 10%… complete correctly"; M3 Q15 overlap ignored.'),
      ev('Summer 2023', 'M2', 'Q17: Venn — 22 placed first; M3 Q11 "all or nothing"; November 2025 M2 Q15 a quarter, M3 Q7 about half.'),
    ],
    mustMemorise: ['Start from the centre (all three) and work outwards, subtracting'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['Venn diagram', 'three circles', 'sets', 'intersection', 'union'],
  },
  {
    slug: 'estimated-mean-and-modal-class-from-grouped-data', title: 'Estimated mean, modal class and median class from grouped data', strand: 'HD',
    statementIds: ['M2-HD-02', 'M2-HD-03'], prerequisites: ['averages-from-frequency-tables', 'classifying-data-and-two-circle-venn-diagrams'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M2', 'Q26: estimated mean from a grouped table (no blank columns given) — "75%… no marks; only 15%… correct"; divided by 6 not 50; (b) median class similar.'),
      ev('November 2025', 'M3', 'Q22: grouped mean — rounded, ÷ number of groups, bounds used instead of midpoints; M4 Q7 frequency density attempted; M2 Q30 ÷4 groups.'),
      ev('Summer 2023', 'M2', 'Q24: bounds used instead of midpoints; M3 Q17 estimated mean well done; November 2025 advice: do not round a terminating estimated mean and check it lies within the data.'),
    ],
    mustMemorise: ['Use midpoints × frequency, divide by total frequency', 'Modal class = highest frequency; median class contains the (n+1)/2-th value'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['estimated mean', 'grouped frequency', 'midpoint', 'modal class', 'median class'],
  },
  {
    slug: 'lines-of-best-fit-interpolation-outliers-and-causation', title: 'Lines of best fit, correlation language, interpolation/extrapolation, outliers and causation', strand: 'HD',
    statementIds: ['M2-HD-04', 'M2-HD-05', 'M2-HD-06', 'M2-HD-07', 'M2-HD-08', 'M2-HD-09'], prerequisites: ['scatter-diagrams-and-correlation'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('November 2025', 'M3', 'Q23(a): extrapolation — "32 kg not plotted"; M4 Q8(a) explaining why extrapolation is unreliable.'),
      ev('November 2023', 'M4', '"Outlier" is the only accepted word (not "anomaly").'),
      ev('Summer 2024', 'M2', 'Q22(a): "positive" without "correlation"; M3 Q14(a) "relationship" vs "correlation".'),
    ],
    mustMemorise: ['Line of best fit: roughly equal points either side', 'Interpolation (inside the data) reliable; extrapolation (outside) unreliable', 'Correlation does not imply causation'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['line of best fit', 'interpolate', 'extrapolate', 'outlier', 'correlation', 'causation'],
  },

  // ═══════════════ STAGE 2 — M6 ═══════════════
  // ── Number / algebra ──
  {
    slug: 'binary-and-number-systems', title: 'Number systems and decimal ↔ binary conversion', strand: 'NA',
    statementIds: ['M6-NA-01', 'M6-NA-02'], prerequisites: ['place-value-and-decimals', 'index-laws-for-numbers'], calculator: 'non-calc', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M6', 'Paper 1 Q17: binary — blank if not taught; wrong powers of 2; answer "23.0"; M7 Paper 1 Q13 place values reversed.'),
      ev('November 2025', 'M6', 'Paper 1 Q18: binary (11101; "49 not square"); M7 Paper 1 Q13 (11101, 11001).'),
      ev('Summer 2023', 'M8', 'Paper 2 Q2: binary/subject of a formula — more than 70% correct.'),
    ],
    mustMemorise: ['Binary place values 1, 2, 4, 8, 16, 32, 64, 128'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['binary', 'base 2', 'number systems', 'decimal to binary'],
  },
  {
    slug: 'index-laws-in-algebra', title: 'Index laws in algebra for positive powers', strand: 'NA',
    statementIds: ['M6-NA-03'], prerequisites: ['index-laws-for-numbers', 'expanding-and-factorising-with-a-single-term'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 2 Q9(c): d³⁰ ÷ d¹⁰ = d³; M6 Paper 2 Q13(c) only the very best.'),
      ev('November 2025', 'M6', 'Paper 2 Q16: m⁷ from adding, e⁵ from dividing; Summer 2024 M6 Paper 2 Q14 3 instead of 8; M7 Paper 2 Q10 "m12" not written as a power.'),
    ],
    mustMemorise: ['y² × y³ = y⁵; y⁶ ÷ y⁴ = y²; (y²)³ = y⁶; coefficients multiply/divide normally'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['index laws', 'algebra', 'simplify powers', 'indices'],
  },
  {
    slug: 'trial-and-improvement', title: 'Systematic trial and improvement', strand: 'NA',
    statementIds: ['M6-NA-04'], prerequisites: ['substitution-and-standard-formulae', 'decimals-of-any-size-and-significant-figures'], calculator: 'calc', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M6', 'Paper 2 Q15: trial and improvement — 3.55 not tested; 3.5 given without a test value; M7 Paper 2 Q12 "3.5 alone can be 0 marks"; M8 Paper 2 Q3 >60% full, final check forgotten.'),
    ],
    mustMemorise: ['Test the half-way value to decide the rounding; show every trial in a table'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['trial and improvement', 'approximate solution', 'half-way test'],
  },
  {
    slug: 'linear-inequalities-in-one-variable', title: 'Linear inequalities in one variable and number lines', strand: 'NA',
    statementIds: ['M6-NA-05'], prerequisites: ['linear-equations-unknown-on-both-sides-and-fractions', 'integers-ordering-and-inequality-symbols'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M6', 'Paper 2 Q15: 3(2x + 1) < … — few expanded correctly; < replaced by = and not reinstated; "x = 5/6"; M7 Paper 2 Q11 answer without an inequality sign penalised.'),
      ev('Summer 2024', 'M6', 'Paper 1 Q15: x + (x + 3) > 4 → x > 5.5 — "x = 5.5" given; M7 Paper 1 Q9 many no marks; M8 Paper 1 Q1 over a quarter could not write the inequality.'),
      ev('Summer 2023', 'M6', 'Paper 2 Q12(b): the ">" symbol "seems to scare candidates"; November 2025 M6 Paper 2 Q17 4x < 3 → x < 4/3 sign not restored.'),
    ],
    mustMemorise: ['Keep the inequality sign in the answer', 'Number line: open circle < >, filled circle ≤ ≥', 'Flip the sign when multiplying/dividing by a negative'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['inequalities', 'number line', 'solve inequality', 'integer solutions'],
  },
  {
    slug: 'changing-the-subject-of-a-simple-formula', title: 'Changing the subject of a simple formula', strand: 'NA',
    statementIds: ['M6-NA-06'], prerequisites: ['linear-equations-unknown-on-both-sides-and-fractions', 'substitution-and-standard-formulae'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M6', 'Paper 2 Q14(b): changing the subject — "nonsensical rearrangements".'),
      ev('Summer 2024', 'M2', 'Q1(b): working backwards through a formula (÷2 then −15) — poorly done; November 2025 M1 Q12(b).'),
    ],
    mustMemorise: ['Reverse the operations in reverse order'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['change the subject', 'rearrange formula', 'make x the subject'],
  },
  {
    slug: 'nth-term-of-linear-sequences', title: 'nth term of a linear sequence', strand: 'NA',
    statementIds: ['M6-NA-07'], prerequisites: ['sequences-special-numbers-and-rules', 'algebraic-notation-and-vocabulary'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M6', 'Paper 1 Q12: nth term — 13, "+3", "n3", −2n + 3; M7 Paper 1 Q10(a) 3n + 2, n + 3, 13 for 3n − 2.'),
      ev('November 2025', 'M6', 'Paper 1 Q19: nth term of a combined sequence — listing only = 0; 6n; 6n − 2 vs 118; M7 Paper 1 Q14 6n + 2.'),
      ev('Summer 2023', 'M8', 'Paper 1 Q3: nth term ~75% correct.'),
    ],
    mustMemorise: ['nth term = (common difference)n + (zero term)', 'Check by substituting n = 1, 2'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['nth term', 'linear sequence', 'arithmetic sequence', 'position-to-term'],
  },
  {
    slug: 'simultaneous-equations-graphically', title: 'Solving two linear simultaneous equations graphically', strand: 'NA',
    statementIds: ['M6-NA-08'], prerequisites: ['coordinates-and-plotting-straight-line-graphs', 'gradient-and-intercept-of-linear-graphs-in-context'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M6', 'Paper 2 Q14: needed the line drawn — x = 2, y = 3 without the line = 0 marks; M7 Paper 2 Q10 the same.'),
      ev('Summer 2023', 'M6', 'Paper 1 Q14: algebraic solution scores nothing; line wrong; M7 Paper 1 Q9 intersection not stated.'),
      ev('November 2025', 'M6', 'Paper 2 Q18: "much better than before"; negative gradient, intercept 6; M8 Paper 1 Q2 >60% (2023).'),
    ],
    mustMemorise: ['Draw both lines (table of values); the solution is the intersection — state x and y'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['simultaneous equations', 'graphical solution', 'intersection of lines'],
  },
  {
    slug: 'plotting-quadratic-graphs', title: 'Plotting quadratic graphs and solving with lines y = ±a', strand: 'NA',
    statementIds: ['M6-NA-09'], prerequisites: ['coordinates-and-plotting-straight-line-graphs', 'substitution-and-standard-formulae'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M6', 'Paper 1 Q13: quadratic graph — substitution errors, symmetry, turning point below −4, reading both roots; M7 Paper 1 Q10 table errors (−2, −4), curve flat between points.'),
      ev('November 2025', 'M7', 'Paper 2 Q15(c): minimum from a quadratic graph — ruler joins; straight line between (1, 0) and (2, 0); scale 0.2 misread; M8 Paper 2 Q7 only 35% read the minimum.'),
    ],
    mustMemorise: ['(−2)² = +4 — square the negative correctly', 'Smooth curve; the turning point may lie below the lowest table value', 'Read roots where y = 0 (both!)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['quadratic graph', 'parabola', 'table of values', 'roots', 'turning point', 'y = a'],
  },
  // ── Geometry and measures ──
  {
    slug: 'bearings', title: 'Three-figure bearings', strand: 'GM',
    statementIds: ['M6-GM-01'], prerequisites: ['maps-scale-drawings-and-accurate-drawing', 'angles-at-a-point-and-on-a-line'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M6', 'Paper 1 Q11: a reflex bearing was "too difficult for the majority".'),
      ev('November 2025', 'M8', 'Paper 2 Q11: bearings combined with the sine rule — nearly a quarter full marks.'),
    ],
    mustMemorise: ['Measure clockwise from North; three figures (e.g. 045°)', 'Back bearing = ±180°'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['bearings', 'three-figure bearing', 'north', 'clockwise', 'back bearing'],
  },
  {
    slug: 'interior-and-exterior-angles-of-polygons', title: 'Interior and exterior angles of polygons', strand: 'GM',
    statementIds: ['M6-GM-02'], prerequisites: ['angle-sum-of-triangles-and-polygons'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M6', 'Paper 1 Q14: number of sides — 180 used instead of 360; "4 rather than 40"; M7 Paper 1 Q10 180 ÷ 9 = 20, 180 − 9 = 172.'),
      ev('Summer 2024', 'M6', 'Paper 1 Q14: sides from interior angle 140° — exterior 40 found then stuck; (n − 2) × 180 by trial; M8 Paper 1 Q2 exterior step missed.'),
      ev('November 2025', 'M6', 'Paper 2 Q15: pentagon angle 72 instead of 108; M8 Paper 2 Q1 72° given as the interior angle; Summer 2023 M6 Paper 2 Q15(a) 180/15 = 12.'),
    ],
    mustMemorise: ['Exterior angles sum to 360°; n = 360 ÷ exterior angle', 'Interior + exterior = 180°', 'Interior sum = (n − 2) × 180°'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['interior angle', 'exterior angle', 'regular polygon', 'number of sides', 'tessellation'],
  },
  {
    slug: 'transformation-properties-and-congruence', title: 'Properties preserved under transformations; congruence', strand: 'GM',
    statementIds: ['M6-GM-03', 'M6-GM-08'], prerequisites: ['reflections-in-the-axes', 'rotations-about-the-origin', 'enlargements-positive-whole-number-scale-factor'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M8', 'Paper 2 Q4(b): congruent vs similar — just over a third; candidates "confuse ‘congruent’ with ‘similar’"; M6 Paper 2 Q15(b) evenly split.'),
    ],
    mustMemorise: ['Reflection, rotation, translation → congruent image; enlargement → similar image', 'Inverse of each transformation'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['congruent', 'congruence', 'preserved properties', 'inverse transformation', 'similar'],
  },
  {
    slug: 'reflections-in-any-vertical-or-horizontal-line-and-rotations-about-any-point', title: 'Reflections in lines x = a / y = b and rotations about any point', strand: 'GM',
    statementIds: ['M6-GM-04', 'M6-GM-05'], prerequisites: ['reflections-in-the-axes', 'rotations-about-the-origin'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 2 Q6: rotation about the wrong point / anticlockwise / reflected instead.'),
      ev('Summer 2023', 'M7', 'Paper 2 Q9: rotation with the wrong centre; M8 Paper 2 Q3 rotation ~75% correct.'),
      ev('Summer 2024', 'M8', 'Paper 1 Q3: describing a rotation fully — about half.'),
    ],
    mustMemorise: ['Full description: rotation, angle, direction, centre / reflection in the line …'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['reflection', 'line x = a', 'line y = b', 'rotation about a point', 'describe transformation'],
  },
  {
    slug: 'translations-with-vector-notation', title: 'Translations using column-vector notation', strand: 'GM',
    statementIds: ['M6-GM-06'], prerequisites: ['translations'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M7', 'Paper 1 Q7: translation — "move/slide"; vector written (9 3) or (3, 9).'),
      ev('November 2025', 'M7', 'Paper 1 Q7: "moved"; "4 across"; vector written as a fraction; M6 Paper 1 Q12 rotation/reflection named, vector errors.'),
    ],
    mustMemorise: ['Column vector: top = right(+)/left(−), bottom = up(+)/down(−) — no fraction line'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['translation', 'vector notation', 'column vector'],
  },
  {
    slug: 'enlargement-and-its-effect-on-perimeter-and-area', title: 'Effect of enlargement on perimeter and area (length and area scale factors)', strand: 'GM',
    statementIds: ['M6-GM-07'], prerequisites: ['enlargements-positive-whole-number-scale-factor', 'perimeter-and-area-rectangles-triangles-compound'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M6', 'Paper 1 Q18(b): area scale factor — "large proportion did not know the link between scale factor and area"; M7 Paper 1 Q14 length vs area (5 and 5; 10); M8 Paper 1 Q5 perimeter/area scale factors well done by the strongest.'),
      ev('Summer 2024', 'M8', 'Paper 1 Q8: area SF vs length SF — more than 40% correct; M7 Paper 1 Q16 area ratio → lengths (15 ÷ 4 instead of 15 ÷ 2).'),
    ],
    mustMemorise: ['Length × k → perimeter × k, area × k²'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['enlargement', 'area scale factor', 'perimeter scale factor', 'k squared'],
  },
  {
    slug: 'ruler-and-compass-constructions', title: 'Standard ruler-and-compass constructions', strand: 'GM',
    statementIds: ['M6-GM-09'], prerequisites: ['maps-scale-drawings-and-accurate-drawing', 'triangles-and-quadrilaterals-properties-and-angles'], calculator: 'non-calc', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M6', 'Paper 1 Q15: angle bisector — many drew the bisector first then arcs (no marks); "if not covered in revision… unlikely"; M7 Paper 1 Q11 arcs from N and P or a perpendicular bisector; M8 Paper 1 Q2 some used a protractor.'),
      ev('November 2025', 'M6', 'Paper 1 Q15: angle bisector — arcs required; "alternative method accepted this time only"; the one-arc shortcut "will not work in future"; M8 Paper 1 Q1 two thirds.'),
      ev('Summer 2023', 'M8', 'Paper 2 Q5: perpendicular bisector/locus — just over half.'),
    ],
    mustMemorise: ['Perpendicular bisector, angle bisector, perpendicular from/to a line, equilateral triangle — always show construction arcs (dark pencil, scripts are scanned)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['constructions', 'perpendicular bisector', 'angle bisector', 'compasses', 'equilateral triangle'],
  },
  {
    slug: 'loci-and-regions', title: 'Loci and shading regions, including real-life problems', strand: 'GM',
    statementIds: ['M6-GM-10'], prerequisites: ['ruler-and-compass-constructions', 'circle-parts-and-vocabulary'], calculator: 'non-calc', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M6', 'Paper 2 Q12: loci region (line midway + arc from A + shading) — "mainly poor… not prepared for this question type"; M7 Paper 2 Q8 tolerance/dark pencil.'),
      ev('Summer 2023', 'M6', 'Paper 2 Q17: locus — arcs but no horizontal line halfway between A and B; M7 Paper 2 Q13 the same; M8 Paper 2 unexpected zeros on locus.'),
    ],
    mustMemorise: ['Fixed distance from a point → circle; from a line → parallel lines; equidistant from two points → perpendicular bisector; from two lines → angle bisector'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['locus', 'loci', 'region', 'equidistant', 'shading'],
  },
  // ── Handling data ──
  {
    slug: 'sample-space-diagrams-for-two-events', title: 'Sample-space diagrams for two successive events', strand: 'HD',
    statementIds: ['M6-HD-01'], prerequisites: ['listing-outcomes-and-systematic-listing', 'calculating-probabilities-and-expectation'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2024', 'M7', 'Paper 2 Q10: sample space 4/12 — fractions added; Q16 two dice outcomes (only (1,4), (2,3) counted).'),
      ev('Summer 2024', 'M6', 'Paper 1: outcomes table among the best-answered questions.'),
    ],
    mustMemorise: ['Two dice → 36 equally likely outcomes'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['sample space', 'two dice', 'spinners', 'outcomes table'],
  },
  {
    slug: 'relative-frequency-and-experimental-probability', title: 'Relative frequency, experimental vs theoretical probability and sample size', strand: 'HD',
    statementIds: ['M6-HD-02', 'M6-HD-03', 'M6-HD-04'], prerequisites: ['calculating-probabilities-and-expectation', 'handling-data-cycle-sampling-surveys-and-bias'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2023', 'M6', 'Paper 1 Q13: relative-frequency table and estimate 2300 ÷ 0.23 — "undoubtedly the hardest question"; only the very best reached 10 000; M7 Paper 1 Q8 "guessing values"; M8 Paper 1 Q1 500 × 0.23 just over a quarter.'),
      ev('Summer 2025', 'M6', 'Paper 2 Q11: 0.305 from 1 − sum; 239 from 400 − (20 + 39 + 102); Q16 reliability — chose "nearer to 0.5" rather than more trials; M7 Paper 1 Q12 "even number of flips".'),
      ev('November 2025', 'M7', 'Paper 1 Q11: estimating a population from 17/100 → 2000 — "many did not know"; M8 Paper 1 Q2 under half; M6 Paper 1 Q16 confused with estimating a mean.'),
      ev('Summer 2024', 'M6', 'Paper 2 Q8(b): 600 ÷ 30 = 20 then stuck; Summer 2023 M6 Paper 2 Q10 1800/0.3 = 6000 "had to be less than 1800".'),
    ],
    mustMemorise: ['Relative frequency = frequency ÷ total trials', 'Estimate = relative frequency × number of trials', 'More trials → better estimate'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['relative frequency', 'experimental probability', 'theoretical probability', 'sample size', 'estimate frequency'],
  },
];
