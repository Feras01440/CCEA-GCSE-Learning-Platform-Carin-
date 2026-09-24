// Teachable topics for the Higher units, in teaching order (stage 3 = M3 + M7, stage 4 = M4 + M8).
// See topics-foundation.mjs for conventions. Prerequisites may point at Foundation topics.

const ev = (series, unit, note) => ({ series, unit, note });
const cm = (title, videoNumber, url = null) => ({ title, videoNumber, url });

export const HIGHER_TOPICS = [
  // ═══════════════ STAGE 3 — M3 ═══════════════
  // ── Number ──
  {
    slug: 'hcf-and-lcm-from-prime-factor-form', title: 'HCF and LCM from numbers written as products of prime factors', strand: 'NA',
    statementIds: ['M3-NA-01'], prerequisites: ['hcf-lcm-and-prime-factorisation'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q23: LCM problem — stopped at the LCM instead of the number of packs; M4 Q9 LCM left as 132.'),
      ev('Summer 2024', 'M3', 'Q20(b): HCF given as the LCM 630; M4 Q5(b) HCF vs LCM confusion; November 2024 M4 Q2 LCM with a two-digit constraint.'),
      ev('Summer 2023', 'M4', 'Q9: product of primes "best answered".'),
    ],
    mustMemorise: ['HCF = product of shared primes (lowest powers); LCM = product of all primes (highest powers)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['HCF', 'LCM', 'prime factors', 'Venn method', 'lowest common multiple'],
  },
  {
    slug: 'reverse-percentages', title: 'Reverse percentages: finding the original quantity', strand: 'NA',
    statementIds: ['M3-NA-02'], prerequisites: ['repeated-percentage-change-and-depreciation'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M3', 'Q27: £726 = 128% → £575 — the majority subtracted 28%; M4 Q11 28% subtracted or 72% used.'),
      ev('Summer 2023', 'M3', 'Q18: £10 225 = 81.8% — most found 18.2% and subtracted; M4 Q7 mean 2 marks.'),
      ev('Summer 2025', 'M3', 'Q22: reverse percentage — forgot to add the £20.64 difference; M4 Q19 (112% = £1008) subtracted from the wrong value; "every series".'),
    ],
    mustMemorise: ['Original = final ÷ multiplier (e.g. ÷ 1.28 after a 28% increase, ÷ 0.818 after an 18.2% decrease)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['reverse percentage', 'original amount', 'inverse percentage', 'before the increase'],
  },
  {
    slug: 'upper-and-lower-bounds-addition-and-multiplication', title: 'Upper and lower bounds in addition and multiplication', strand: 'NA',
    statementIds: ['M3-NA-03'], prerequisites: ['reading-scales-accuracy-and-imperial-units', 'decimals-of-any-size-and-significant-figures'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M4', 'Q16: bounds in a formula (u², 2a errors).'),
      ev('November 2025', 'M4', 'Q17: bounds applied after calculating instead of before; 3.86 rounded — "leave the full calculator display".'),
    ],
    mustMemorise: ['To the nearest 5 → ±2.5; to 1 d.p. → ±0.05', 'Max product = UB × UB; max sum = UB + UB'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['upper bound', 'lower bound', 'error interval', 'degree of accuracy'],
  },
  // ── Algebra ──
  {
    slug: 'identities-and-expanding-double-brackets', title: 'Equations vs identities and expanding two linear expressions', strand: 'NA',
    statementIds: ['M3-NA-04', 'M3-NA-05'], prerequisites: ['expanding-and-factorising-with-a-single-term'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M3', 'Q25: quadratic expression for an area — product of brackets left unexpanded; 12x instead of 12x²; M4 Q13 left as brackets.'),
      ev('Summer 2025', 'M4', 'Q4: m² + (m + 7)(m − 2) → "m⁴".'),
      ev('Summer 2023', 'M3', 'Q15: expanding brackets — a quarter correct; no 2y × 3y term.'),
    ],
    mustMemorise: ['(a ± b)² = a² ± 2ab + b²', 'FOIL / grid method; ≡ means true for all values'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['identity', 'expand double brackets', 'quadratic expression', 'FOIL', 'equation vs identity'],
  },
  {
    slug: 'factorising-quadratics-x2-plus-bx-plus-c', title: 'Factorising quadratics of the form x² + bx + c', strand: 'NA',
    statementIds: ['M3-NA-06'], prerequisites: ['identities-and-expanding-double-brackets', 'expanding-and-factorising-with-a-single-term'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q25: factorising a quadratic ≈30% correct.'),
      ev('November 2025', 'M3', 'Q28: factorising — about a third; sign errors.'),
      ev('Summer 2025', 'M4', 'Q10: factorising and DOTS handled well by M4 entrants.'),
    ],
    mustMemorise: ['Find two numbers that multiply to c and add to b'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['factorise quadratic', 'x² + bx + c', 'double brackets', 'monic quadratic'],
  },
  {
    slug: 'difference-of-two-squares', title: 'Difference of two squares', strand: 'NA',
    statementIds: ['M3-NA-07'], prerequisites: ['factorising-quadratics-x2-plus-bx-plus-c'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M4', 'Q20: difference of two squares with the terms reversed when simplifying an algebraic fraction.'),
      ev('Summer 2024', 'M4', 'Q18: harder DOTS with three letters — 9% full marks on (b).'),
      ev('Summer 2023', 'M4', 'Q19: DOTS with a fractional coefficient and a three-variable quadratic — majority zero.'),
    ],
    mustMemorise: ['a² − b² = (a + b)(a − b); take out a common factor first (3x² − 75 = 3(x + 5)(x − 5))'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['difference of two squares', 'DOTS', 'factorise', 'a² − b²'],
  },
  {
    slug: 'algebraic-fractions-with-numerical-denominators', title: 'Algebraic fractions with numerical denominators: simplifying and solving equations', strand: 'NA',
    statementIds: ['M3-NA-08', 'M3-NA-10'], prerequisites: ['adding-and-subtracting-fractions', 'linear-equations-unknown-on-both-sides-and-fractions', 'expanding-and-factorising-with-a-single-term'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q12: adding algebraic fractions (common denominator) — only one third correct; over half could not start.'),
      ev('Summer 2023', 'M3', 'Q19: fractional equation — ~10% full marks; decimals lose accuracy; November 2025 M3 Q29 errors, M4 Q14 3(3x − 1) expansion.'),
      ev('Summer 2025', 'M4', 'Q3: linear equations with fractions handled well by M4 entrants; Q21 subtraction of more than one term in a numerator "only a small number… full marks".'),
    ],
    mustMemorise: ['Common denominator; bracket whole numerators when subtracting', 'Multiply every term by the LCM of denominators to clear fractions'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['algebraic fractions', 'common denominator', 'fractional equations', '(4x + 3)/10'],
  },
  {
    slug: 'simplifying-multiplying-and-dividing-algebraic-fractions', title: 'Simplifying, multiplying and dividing algebraic fractions (factorise and cancel)', strand: 'NA',
    statementIds: ['M3-NA-09'], prerequisites: ['difference-of-two-squares', 'fraction-arithmetic-all-four-operations', 'index-laws-in-algebra'], calculator: 'either', difficulty: 5,
    examinerEvidence: [
      ev('November 2025', 'M4', 'Q22(b): dividing algebraic fractions — 5% full marks.'),
      ev('Summer 2025', 'M4', 'Q20: factorise and cancel an algebraic fraction — DOTS with terms reversed; grouping-method problems.'),
      ev('Summer 2024', 'M4', 'Q18(b): writing three terms as a single fraction — 9% full marks.'),
    ],
    mustMemorise: ['Factorise numerator and denominator fully, then cancel common factors', 'Dividing = multiply by the reciprocal'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['algebraic fractions', 'simplify', 'cancel', 'multiply', 'divide', 'factorise and cancel'],
  },
  {
    slug: 'solving-quadratic-equations-by-factorising', title: 'Setting up and solving quadratic equations by factorising', strand: 'NA',
    statementIds: ['M3-NA-11'], prerequisites: ['factorising-quadratics-x2-plus-bx-plus-c', 'difference-of-two-squares'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2023', 'M3', 'Q21(b): solving a quadratic by factorising — "very, very few saw the link"; x = 5 by trial.'),
      ev('Summer 2024', 'M3', 'Q28: set up a quadratic from information then solve — "only a handful" for (a); (b) often blank.'),
      ev('Summer 2025', 'M4', 'Q10(b): negative root ignored; Q5 answer left factorised or set = 0; M4 Q15(a) "show that" all or nothing.'),
    ],
    mustMemorise: ['Rearrange to = 0, factorise, set each bracket = 0 — give BOTH solutions', 'Reject a negative root only when the context demands it'], onFormulaSheet: [],
    corbettmaths: [cm('Solving Quadratics', '266')],
    keywords: ['quadratic equation', 'factorising', 'solve quadratic', 'forming quadratics', 'show that'],
  },
  {
    slug: 'straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines', title: 'Straight lines: y = mx + c, finding the equation of a line, parallel lines', strand: 'NA',
    statementIds: ['M3-NA-12', 'M3-NA-13', 'M3-NA-14'], prerequisites: ['gradient-and-intercept-of-linear-graphs-in-context', 'midpoint-and-length-of-a-line-segment'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q16: equation of a line through two points — only the top 10%; M4 Q2 midpoint and line equation handled better.'),
      ev('November 2025', 'M3', 'Q31: line through two points — midpoint found instead; negative gradient missed; intercept misunderstood; M4 Q16 Δx/Δy, c = 8 not recognised.'),
      ev('Summer 2023', 'M3', 'Q22: line through two points — midpoint given instead.'),
    ],
    mustMemorise: ['m = (y₂ − y₁)/(x₂ − x₁); substitute a point to find c', 'Parallel lines have equal gradients', 'Rearrange ax + by = c into y = mx + c to read m'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['y = mx + c', 'gradient', 'y-intercept', 'equation of a line', 'parallel lines', 'through two points'],
  },
  // ── Geometry and measures ──
  {
    slug: 'circle-parts-arc-length-and-sector-area', title: 'Tangent, arc, sector, segment; arc length and sector area', strand: 'GM',
    statementIds: ['M3-GM-01', 'M3-GM-03'], prerequisites: ['circumference-and-area-of-circles', 'circle-parts-and-vocabulary', 'fraction-of-a-quantity'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q26: arc length (260°/360 of the circumference) — many divided the circumference by 260 or used area; M4 Q12 the majority found the minor arc (6.1 cm) not the major (15.9 cm), rounding to 1 d.p. forgotten.'),
      ev('Summer 2023', 'M7', 'Paper 1 Q12: perimeter of a semicircle in terms of π — "most unable"; forgot 2r; used area; used 3.14; M8 Paper 1 Q5 a quarter could do neither.'),
      ev('Summer 2023', 'M4', 'Q23: apex angle of a sector forming a cone — "rare… to make the correct link".'),
    ],
    mustMemorise: ['Arc length = θ/360 × 2πr; sector area = θ/360 × πr²', 'Perimeter of a sector includes two radii'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['arc length', 'sector area', 'sector', 'segment', 'tangent', 'arc', 'perimeter of sector'],
  },
  {
    slug: 'cylinder-cone-and-sphere-surface-area-and-volume', title: 'Surface area and volume of cylinders, cones and spheres (and hemispheres)', strand: 'GM',
    statementIds: ['M3-GM-03'], prerequisites: ['volume-of-prisms-and-cylinders', 'circle-parts-arc-length-and-sector-area'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q19: surface area of a cylinder confused with volume; Summer 2023 M3 Q24 curved surface area with a 1 cm overlap "very few fully correct" (M4 Q13 the same).'),
      ev('Summer 2024', 'M3', 'Q24: cylinder + hemisphere volume, 90% full, round down to 16 cups; M4 Q9 sphere used, 90% forgotten, rounding.'),
      ev('Summer 2024', 'M4', 'Q20: proving the surface areas of a sphere and a cube can never be equal — 7% full marks; November 2024 M4 Q22 radius of a cone from its volume; November 2023 M4 cone vs hemisphere surface areas.'),
    ],
    mustMemorise: ['Cylinder: V = πr²h, curved SA = 2πrh, total SA = 2πrh + 2πr²', 'Hemisphere = half a sphere (+ circular face for surface area)'],
    onFormulaSheet: ['Volume of sphere = 4/3 πr³', 'Surface area of sphere = 4πr²', 'Volume of cone = 1/3 πr²h', 'Curved surface area of cone = πrl'], corbettmaths: [],
    keywords: ['cylinder surface area', 'cone', 'sphere', 'hemisphere', 'volume', 'curved surface area', 'slant height'],
  },
  {
    slug: 'pressure', title: 'Pressure = force ÷ area', strand: 'GM',
    statementIds: ['M3-GM-02'], prerequisites: ['density', 'area-of-quadrilaterals-and-composite-shapes'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M3', 'Q19(b): pressure = force/area link not understood; M4 Q6(b) force from pressure — volume used.'),
      ev('November 2025', 'M4', 'Q10: pressure on the base of a pyramid — "area in contact"; volume of the cube used; ÷4 instead of √; M3 Q25 base area vs length/volume/surface area.'),
    ],
    mustMemorise: ['Pressure = force ÷ area (area in contact); force = pressure × area'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['pressure', 'force', 'area', 'compound measures', 'N/m²'],
  },
  {
    slug: 'trigonometry-sohcahtoa-in-2d', title: 'Trigonometry (sin, cos, tan) in right-angled triangles; angles of elevation and depression', strand: 'GM',
    statementIds: ['M3-GM-04'], prerequisites: ['pythagoras-theorem-in-2d', 'ratio-notation-and-simplifying'], calculator: 'calc', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M3', 'Q24: trigonometry — fewer than 20% full marks; identified cos but could not rearrange; used tan; "even on routine type questions such as trigonometry".'),
      ev('Summer 2024', 'M3', 'Q23: stepladder — did not split into two right-angled triangles; M4 Q8 isosceles triangle (1.4 m not halved); M4 Q14 multi-step trig 40% full marks.'),
      ev('Summer 2025', 'M4', 'Q16: multi-step trig — early rounding; Q8 assumed angle BAC = 90°; Summer 2023 M3 Q23 boy’s height in cm; M8 Paper 2 Q10 (2023) ~40% full.'),
    ],
    mustMemorise: ['SOH CAH TOA; label opposite/adjacent/hypotenuse from the angle', 'Rearranging cos θ = a/h → a = h cos θ, h = a/cos θ', 'Keep full calculator values until the end'], onFormulaSheet: [],
    corbettmaths: [cm('Pythagoras’ Theorem and Trigonometry (FSL M4 map)', '257–263, 329–332')],
    keywords: ['trigonometry', 'SOHCAHTOA', 'sine', 'cosine', 'tangent', 'angle of elevation', 'angle of depression'],
  },
  // ── Handling data ──
  {
    slug: 'quartiles-and-interquartile-range-from-a-list', title: 'Quartiles and interquartile range from a list', strand: 'HD',
    statementIds: ['M3-HD-01'], prerequisites: ['mean-median-mode-and-range'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('November 2023', 'M4', 'IQR from a list caused problems.'),
      ev('Summer 2025', 'M3', 'Q24(c): IQR — readings in £1000s forgotten; M4 Q11(c) the same.'),
    ],
    mustMemorise: ['Order the data; LQ at ¼(n+1), median at ½(n+1), UQ at ¾(n+1); IQR = UQ − LQ'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['quartiles', 'interquartile range', 'IQR', 'lower quartile', 'upper quartile'],
  },
  {
    slug: 'cumulative-frequency-tables-and-curves', title: 'Cumulative frequency tables and curves; estimating median, quartiles and IQR', strand: 'HD',
    statementIds: ['M3-HD-02', 'M3-HD-03'], prerequisites: ['quartiles-and-interquartile-range-from-a-list', 'estimated-mean-and-modal-class-from-grouped-data'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M3', 'Q26: median read at 12.5 on the x-axis; IQR unfamiliar; M4 Q10(a) median not on a grid line, IQR scale.'),
      ev('Summer 2025', 'M3', 'Q24(b): plotting at the lower bound/midpoint instead of the upper bound; (c) IQR in £1000s forgotten; M4 Q11 cumulative frequency otherwise well handled.'),
    ],
    mustMemorise: ['Plot cumulative frequency at the UPPER class boundary', 'Read median at n/2, quartiles at n/4 and 3n/4 on the cumulative-frequency axis'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['cumulative frequency', 'ogive', 'median from curve', 'quartiles from curve', 'interquartile range'],
  },
  {
    slug: 'box-plots-and-comparing-distributions', title: 'Box plots, comparing distributions and inferring from samples', strand: 'HD',
    statementIds: ['M3-HD-03', 'M3-HD-04'], prerequisites: ['cumulative-frequency-tables-and-curves', 'comparing-distributions-patterns-and-exceptions'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M3', 'Q26(b): explaining IQR vs range — "the poorest response on the entire paper"; needed "range affected by the high maximum"; Q26(a) the five given values were plotted as the box plot; M4 Q11(b) 9% — generic "IQR excludes extremes" not accepted.'),
      ev('Summer 2024', 'M3', 'Q26: comparisons must interpret ("on average… greater median"; "less consistent… greater range"); M4 Q10(b) use "spread/variation".'),
      ev('Summer 2023', 'M3', 'Q25: box plot — five given values plotted; UQ 20 missed.'),
    ],
    mustMemorise: ['Box plot needs min, LQ, median, UQ, max (derive from the curve, not the five given data values)', 'Compare a median (average) and IQR/range (spread) in context'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['box plot', 'box and whisker', 'compare distributions', 'spread', 'inference from sample'],
  },

  // ═══════════════ STAGE 3 — M7 ═══════════════
  // ── Number ──
  {
    slug: 'surds-and-pi-in-exact-calculations', title: 'Using surds and π in exact calculations', strand: 'NA',
    statementIds: ['M7-NA-01'], prerequisites: ['circumference-and-area-of-circles', 'pythagoras-theorem-in-2d', 'factors-multiples-primes-squares-and-cubes'], calculator: 'non-calc', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2023', 'M7', 'Paper 1 Q12: Pythagoras (√5) then the perimeter of a semicircle in terms of π — "most unable"; forgot 2r; used 3.14.'),
      ev('Summer 2024', 'M8', 'Paper 1 Q12: Pythagoras, surds and areas in a complex situation — A* differentiator.'),
      ev('November 2025', 'M8', 'Paper 1 Q15: Pythagoras + area of a parallelogram in exact form — strongest 10% full marks.'),
    ],
    mustMemorise: ['Leave answers as 5√2 or 10π when asked for exact form', 'Area of a circle radius 5 = 25π'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['surds', 'exact form', 'in terms of pi', 'leave in surd form'],
  },
  {
    slug: 'index-laws-zero-and-negative-powers', title: 'Index laws with zero and negative powers (numbers)', strand: 'NA',
    statementIds: ['M7-NA-02'], prerequisites: ['index-laws-for-numbers', 'fraction-arithmetic-all-four-operations'], calculator: 'non-calc', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 1 Q17: indices — (a) a⁰ given as "3 or 0"; (b) −8; (c) −1000/−30; M8 Paper 1 Q8 index −3 only for better candidates.'),
      ev('Summer 2023', 'M7', 'Paper 1 Q11: index laws — indices reversed.'),
    ],
    mustMemorise: ['a⁰ = 1; a⁻ⁿ = 1/aⁿ; 10⁻¹ = 0.1'], onFormulaSheet: [],
    corbettmaths: [cm('Negative Indices', '175')],
    keywords: ['negative indices', 'zero index', 'index laws', 'reciprocal'],
  },
  {
    slug: 'standard-form', title: 'Standard index form: interpreting, ordering and calculating', strand: 'NA',
    statementIds: ['M7-NA-03'], prerequisites: ['index-laws-zero-and-negative-powers', 'place-value-and-decimals'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 1 Q16: standard form + 30% increase — only a small percentage; forgot to add on; "9 × 10⁸ = 9 × 8 = 72"; answer not returned to standard form; M8 Paper 1 Q7 over a third no marks.'),
      ev('November 2025', 'M7', 'Paper 1 Q17: ordering numbers in standard form — few three marks; M8 Paper 1 Q8 standard form without a calculator: 30% unable, addition hardest.'),
      ev('Summer 2024', 'M7', 'Paper 1 Q15: standard form with different units (1.05 × 7 for 1.05 × 10⁷; g vs kg); M8 Paper 1 Q7 a sizeable minority ignored units.'),
    ],
    mustMemorise: ['a × 10ⁿ with 1 ≤ a < 10', 'Add/subtract: same power first; multiply/divide: handle a’s and powers separately'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['standard form', 'scientific notation', 'powers of ten', 'ordering standard form'],
  },
  // ── Algebra ──
  {
    slug: 'index-laws-in-algebra-integer-powers', title: 'Index laws in algebra for integer (including negative) powers', strand: 'NA',
    statementIds: ['M7-NA-04'], prerequisites: ['index-laws-in-algebra', 'index-laws-zero-and-negative-powers'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 1 Q17(d): y left in the answer; November 2025 M7 Paper 2 Q10 "m12" not written as a power.'),
      ev('Summer 2025', 'M8', 'Paper 2 Q3: algebraic indices — three quarters all correct.'),
    ],
    mustMemorise: ['x⁰ = 1, 1/x = x⁻¹; 12a²b/(6ab³) = 2ab⁻²'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['index laws', 'algebra', 'negative powers', 'simplify'],
  },
  {
    slug: 'simultaneous-equations-algebraically', title: 'Solving two linear simultaneous equations algebraically', strand: 'NA',
    statementIds: ['M7-NA-05'], prerequisites: ['simultaneous-equations-graphically', 'linear-equations-unknown-on-both-sides-and-fractions'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 1 Q15: both equations needed multiplying — trial and improvement = 0; add/subtract errors; stuck at 19x = 152; M8 Paper 1 Q6 over half completed.'),
      ev('Summer 2024', 'M7', 'Paper 1 Q13: added instead of subtracting; trial and error = 0; November 2025 M7 Paper 1 Q18 the same; M8 Paper 1 Q9 majority full.'),
    ],
    mustMemorise: ['Match coefficients, then add (opposite signs) or subtract (same signs); substitute back and check'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['simultaneous equations', 'elimination', 'substitution', 'algebraic'],
  },
  {
    slug: 'inequalities-in-two-variables-and-regions', title: 'Linear inequalities in two variables: shading regions on a graph', strand: 'NA',
    statementIds: ['M7-NA-06'], prerequisites: ['linear-inequalities-in-one-variable', 'straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M8', 'Paper 1 Q1: writing an inequality — over a quarter could not; sign lost → "="; M8 Paper 2 Q5 (2025) nearly 70% correct, sign dropped.'),
      ev('November 2025', 'M8', 'Paper 2 Q3: inequality — sign not reintroduced; more than two thirds correct.'),
    ],
    mustMemorise: ['Draw each boundary line (dashed for < >, solid for ≤ ≥); test a point; shade/label the required region'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['inequalities', 'regions', 'shading', 'two variables', 'linear programming'],
  },
  {
    slug: 'changing-the-subject-harder-formulae', title: 'Changing the subject with powers, roots, or the subject appearing twice', strand: 'NA',
    statementIds: ['M7-NA-07'], prerequisites: ['changing-the-subject-of-a-simple-formula', 'expanding-and-factorising-with-a-single-term'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 2 Q13: 5x = vx + 4y (x appears twice) — few full marks; x left on both sides; "a lot of incorrect work"; M8 Paper 2 Q6 under half full, over a third did not gather terms.'),
      ev('November 2023', 'M7', 'Change of subject via x² = yz; Summer 2023 M7 Paper 2 Q10(b) show 3m = h − y.'),
    ],
    mustMemorise: ['Collect subject terms on one side, factorise the subject out, divide', 'Square/root as the last step'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['change the subject', 'rearrange', 'subject appears twice', 'factorise out', 'powers and roots'],
  },
  {
    slug: 'nth-term-of-non-linear-sequences', title: 'nth term of non-linear sequences (n², fractions, simple quadratic)', strand: 'NA',
    statementIds: ['M7-NA-08'], prerequisites: ['nth-term-of-linear-sequences', 'sequences-special-numbers-and-rules'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M7', 'Paper 1 Q10(b): linking a sequence to the square numbers.'),
      ev('November 2025', 'M8', 'Paper 1 Q5: nth term ~70% correct.'),
    ],
    mustMemorise: ['Compare with n², 2n², n² ± k; second differences for complex quadratics are excluded'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['nth term', 'quadratic sequence', 'non-linear sequence', 'square numbers'],
  },
  {
    slug: 'recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs', title: 'Recognising and sketching linear, quadratic, cubic and reciprocal graphs', strand: 'NA',
    statementIds: ['M7-NA-09'], prerequisites: ['plotting-quadratic-graphs', 'straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 1 Q13: matching graphs to equations — over a third got all four.'),
      ev('November 2025', 'M7', 'Paper 2 Q15(c): minimum from a quadratic graph — ruler joins and misread scale.'),
    ],
    mustMemorise: ['Shapes: line, U/∩ parabola (turning point by symmetry), S-shaped cubic, two-branch reciprocal y = k/x (never crosses the axes)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['sketch graphs', 'cubic graph', 'reciprocal graph', 'quadratic graph', 'turning point', 'intercepts'],
  },
  {
    slug: 'quadratic-graphs-and-intersections-with-straight-lines', title: 'Quadratic graphs: intersections with lines y = mx + c', strand: 'NA',
    statementIds: ['M7-NA-10'], prerequisites: ['plotting-quadratic-graphs', 'simultaneous-equations-graphically'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M7', 'Paper 1 Q10: line y = 2x − 3 not drawn; intersections rarely given; roots not both given; M8 Paper 1 Q4 "which line to draw" only the strongest.'),
      ev('Summer 2023', 'M8', 'Paper 1 Q2: graphical simultaneous equations more than 60% correct.'),
    ],
    mustMemorise: ['Draw the line on the same axes; solutions are the x-values of the intersections'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['quadratic graph', 'intersection', 'line and curve', 'graphical solution'],
  },
  {
    slug: 'direct-proportion', title: 'Direct proportion (including y ∝ x²): graphs and equations', strand: 'NA',
    statementIds: ['M7-NA-11'], prerequisites: ['proportion-best-buy-scaling-and-exchange-rates', 'changing-the-subject-harder-formulae'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2023', 'M7', 'Paper 2 Q15: R ∝ v² — "many did not seem to know this topic"; square omitted; square root used; M8 Paper 2 Q8 a large proportion could not start.'),
      ev('Summer 2024', 'M7', 'Paper 2 Q14: direct proportion with a square (√45 given; x not squared → 11.25; 7.5 rare); M8 Paper 2 Q5 fraction at the end.'),
    ],
    mustMemorise: ['y ∝ x → y = kx; y ∝ x² → y = kx²; find k from the given pair, then substitute'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['direct proportion', 'varies as', 'constant of proportionality', 'y = kx', 'y = kx²'],
  },
  // ── Geometry and measures ──
  {
    slug: 'combined-transformations-and-reflections-in-y-equals-plus-or-minus-x', title: 'Combined transformations and reflections in y = x and y = −x', strand: 'GM',
    statementIds: ['M7-GM-01', 'M7-GM-02'], prerequisites: ['reflections-in-any-vertical-or-horizontal-line-and-rotations-about-any-point', 'translations-with-vector-notation', 'transformation-properties-and-congruence'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 2 Q15: reflection in y = x then enlargement SF 0.5 centre (−4, 0) — reflected in the wrong line (axes, y = −x); centre misused; M8 Paper 2 Q8 just over 40% correct, 30% "no understanding".'),
      ev('Summer 2024', 'M7', 'Paper 2 Q15: reflected in the y-axis instead of y = x; M8 Paper 2 Q6 nearly half full; November 2025 M7 Paper 1 Q16 y-axis / 180° rotation; M8 Paper 1 Q7 two thirds.'),
    ],
    mustMemorise: ['y = x swaps coordinates (a, b) → (b, a); y = −x → (−b, −a)', 'Apply transformations in the order stated'], onFormulaSheet: [],
    corbettmaths: [cm('Transformations (FSL M7/8 map)', '325, 326, 275, 272–274, 104a–109')],
    keywords: ['combined transformations', 'reflection in y = x', 'reflection in y = −x', 'successive transformations'],
  },
  {
    slug: 'enlargements-with-fractional-scale-factors', title: 'Enlargements by a fractional scale factor and describing enlargements', strand: 'GM',
    statementIds: ['M7-GM-03'], prerequisites: ['enlargements-positive-whole-number-scale-factor', 'fraction-arithmetic-all-four-operations'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 2 Q9: describing an enlargement — the majority named it; only a minority gave centre and scale factor correctly.'),
      ev('Summer 2025', 'M7', 'Paper 2 Q15: enlargement SF 0.5 with a given centre — centre misused.'),
    ],
    mustMemorise: ['SF ½ halves distances from the centre; describe with "enlargement, scale factor …, centre (…)"'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['enlargement', 'fractional scale factor', 'centre of enlargement', 'describe enlargement'],
  },
  {
    slug: 'similar-shapes-length-area-and-volume-scale-factors', title: 'Similar 2D shapes: length and area ratios; effect of enlargement on volume', strand: 'GM',
    statementIds: ['M7-GM-04', 'M7-GM-05'], prerequisites: ['enlargement-and-its-effect-on-perimeter-and-area', 'transformation-properties-and-congruence', 'ratio-notation-and-simplifying'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M7', 'Paper 2 Q16: area ratio 1:16 → 1:4 → x = 3 — "very few"; "very unfamiliar".'),
      ev('Summer 2023', 'M8', 'Paper 1 Q9: volume scale factor 8 — "the majority of candidates doubled the volume"; M7 Paper 2 Q14 similar shapes (3x/x wrong; 4/3 rounded to 1.3; adding instead of scaling).'),
      ev('Summer 2024', 'M7', 'Paper 1 Q16: ratio of areas → lengths (SF 4 found; 15 ÷ 4 instead of 15 ÷ 2).'),
    ],
    mustMemorise: ['Length SF k → area SF k² → volume SF k³; take square/cube roots to go back to lengths', 'Similar triangles: equal angles, sides in the same ratio'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['similar shapes', 'scale factor', 'area ratio', 'volume ratio', 'similar triangles'],
  },
  // ── Handling data ──
  {
    slug: 'product-rule-for-counting', title: 'The product rule for counting', strand: 'HD',
    statementIds: ['M7-HD-01'], prerequisites: ['listing-outcomes-and-systematic-listing'], calculator: 'either', difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 2 Q14(b): product rule — 8 × 5 then 40 − 3 (discounting repeats); M8 Paper 2 Q7(b) just under half.'),
      ev('Summer 2024', 'M8', 'Paper 1 Q6: combinations very well done.'),
    ],
    mustMemorise: ['m ways × n ways; subtract any excluded combinations'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['product rule', 'counting', 'combinations', 'm × n'],
  },
  {
    slug: 'adding-and-multiplying-probabilities', title: 'When to add or multiply probabilities: mutually exclusive and independent events', strand: 'HD',
    statementIds: ['M7-HD-02'], prerequisites: ['calculating-probabilities-and-expectation', 'sample-space-diagrams-for-two-events', 'fraction-arithmetic-all-four-operations'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M7', 'Paper 1 Q13: independent vs mutually exclusive — guessed; M8 Paper 1 Q6 fewer than half knew; Q8 P(one of two independent events) fraction errors.'),
      ev('Summer 2024', 'M7', 'Paper 2 Q16: two dice — added instead of multiplied; 0.156 needed both orders; M8 Paper 2 Q4 biased dice twice (thirds: full / forgot both orders / didn’t know); Q1 "less than 5" included 5.'),
      ev('November 2025', 'M8', 'Paper 1 Q6: independent probability xy — x + y given; over 60% correct.'),
    ],
    mustMemorise: ['OR (mutually exclusive) → add; AND (independent) → multiply', 'Count both orders for "one of each"'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['mutually exclusive', 'independent events', 'addition rule', 'multiplication rule', 'AND OR probability'],
  },
  {
    slug: 'tree-diagrams-for-independent-events', title: 'Tree diagrams for independent events (with replacement)', strand: 'HD',
    statementIds: ['M7-HD-03'], prerequisites: ['adding-and-multiplying-probabilities'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M7', 'Paper 2 Q12: branches unlabelled or swapped; (b) added 0.3 + 0.1 instead of multiplying; M8 Paper 2 Q10 ~75% full marks.'),
      ev('November 2025', 'M7', 'Paper 2 Q14(b): P(no sixes) from a tree diagram — few; fractions added to more than 1; labels missing; M8 Paper 2 Q6 labels omitted (>80% otherwise).'),
    ],
    mustMemorise: ['Label every branch; each pair of branches sums to 1; multiply along, add between'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['tree diagram', 'independent events', 'with replacement', 'successive events'],
  },

  // ═══════════════ STAGE 4 — M4 ═══════════════
  {
    slug: 'upper-and-lower-bounds-subtraction-and-division', title: 'Upper and lower bounds in subtraction and division (applying bounds)', strand: 'NA',
    statementIds: ['M4-NA-01'], prerequisites: ['upper-and-lower-bounds-addition-and-multiplication', 'speed-and-compound-measures'], calculator: 'calc', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M4', 'Q13: "50 kg to the nearest 5 kg" — 45 used instead of 47.5; rounding up instead of down; non-integer answer given.'),
      ev('Summer 2023', 'M4', 'Q15: bounds with distance/speed/time (1 h 10.5 min) among the hardest questions.'),
      ev('November 2025', 'M4', 'Q17: bounds in Pythagoras — ~30% full marks; bounds applied after calculating; "leave the full calculator display".'),
    ],
    mustMemorise: ['Max of a − b = UB(a) − LB(b); max of a ÷ b = UB(a) ÷ LB(b)', 'Use bounds before calculating; do not round intermediate values'], onFormulaSheet: [],
    corbettmaths: [cm('Applying Bounds', '184')],
    keywords: ['bounds', 'upper bound', 'lower bound', 'subtraction', 'division', 'error interval', 'applying bounds'],
  },
  {
    slug: 'factorising-harder-quadratics-ax2-plus-bx-plus-c', title: 'Factorising ax² + bx + c and more complex expressions (grouping, two variables)', strand: 'NA',
    statementIds: ['M4-NA-02'], prerequisites: ['factorising-quadratics-x2-plus-bx-plus-c', 'difference-of-two-squares'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2023', 'M4', 'Q19: DOTS with a fractional coefficient and a three-variable quadratic — majority zero.'),
      ev('Summer 2025', 'M4', 'Q20: grouping-method problems when factorising to simplify an algebraic fraction.'),
      ev('Summer 2024', 'M4', 'Q12(b): solving the quadratic — 40 and 6 from wrong factorising.'),
    ],
    mustMemorise: ['Split the middle term (product ac, sum b) then factorise by grouping', 'Always look for a common factor first'], onFormulaSheet: [],
    corbettmaths: [cm('Factorising Harder Quadratics', '119')],
    keywords: ['factorise', 'ax² + bx + c', 'harder quadratics', 'grouping', 'two variables'],
  },
  {
    slug: 'algebraic-fractions-with-linear-denominators', title: 'Algebraic fractions with linear denominators: adding, subtracting and solving equations', strand: 'NA',
    statementIds: ['M4-NA-03', 'M4-NA-04'], prerequisites: ['algebraic-fractions-with-numerical-denominators', 'simplifying-multiplying-and-dividing-algebraic-fractions', 'identities-and-expanding-double-brackets'], calculator: 'either', difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'M4', 'Q21: adding algebraic fractions — "only a small number… full marks"; subtraction of more than one term in the numerator.'),
      ev('Summer 2024', 'M4', 'Q18(b): adding algebraic fractions including a whole number — 9% full marks; Q23 equation with algebra in the denominators — 18%.'),
      ev('November 2025', 'M4', 'Q24: fractional equation with algebraic denominators — negatives; b² without brackets in the formula.'),
    ],
    mustMemorise: ['Common denominator (x + 2)(2x − 1); bracket numerators; whole numbers become n(denominator)', 'Clear denominators, then solve the resulting linear or quadratic equation'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['algebraic fractions', 'linear denominators', '2/(x+2) + 3/(2x−1)', 'equations with algebraic denominators'],
  },
  {
    slug: 'quadratic-formula-and-harder-quadratic-equations', title: 'The quadratic formula and setting up/solving harder quadratic equations', strand: 'NA',
    statementIds: ['M4-NA-05'], prerequisites: ['solving-quadratic-equations-by-factorising', 'factorising-harder-quadratics-ax2-plus-bx-plus-c', 'pythagoras-theorem-in-2d', 'area-of-quadrilaterals-and-composite-shapes'], calculator: 'calc', difficulty: 5,
    examinerEvidence: [
      ev('Summer 2024', 'M4', 'Q22: quadratic from the areas of a square and a trapezium — 5% full marks, "most challenging"; Q12(a) setting up a quadratic via Pythagoras.'),
      ev('Summer 2023', 'M4', 'Q20: quadratic from a trapezium area — mean 1 mark, majority zero; Q22 fractional equation → quadratic, negative root ignored, 2 d.p.'),
      ev('Summer 2025', 'M4', 'Q15(a): "show that" quadratic from a right-angled triangle — full marks or zero; candidates tried to solve the given equation; 4x used instead of x + 4; November 2025 M4 Q19 L-shape overlap ignored; November 2023 M4 quadratic from the surface area of a cuboid.'),
    ],
    mustMemorise: ['Rearrange to ax² + bx + c = 0 first; substitute with brackets (−b)² ; give both roots to the accuracy asked', 'Completing the square is NOT required'],
    onFormulaSheet: ['Quadratic equation: the solutions of ax² + bx + c = 0, where a ≠ 0, are x = [−b ± √(b² − 4ac)] / 2a'], corbettmaths: [],
    keywords: ['quadratic formula', 'solve quadratic', 'forming quadratic equations', 'show that', 'area problems', 'Pythagoras quadratic'],
  },
  {
    slug: 'perpendicular-lines', title: 'Gradients of perpendicular lines and equations of perpendiculars', strand: 'NA',
    statementIds: ['M4-NA-06'], prerequisites: ['straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M4', 'Q17: perpendicular line when the given line must be rearranged to y = mx + c — among the hardest; Summer 2023 M4 Q16 the same.'),
      ev('Summer 2025', 'M4', 'Q14: gradient −¼ known but substitution to find c only by the more able; "being answered better each year".'),
      ev('November 2025', 'M4', 'Q18: perpendicular gradient → missing coordinate — top candidates only.'),
    ],
    mustMemorise: ['Perpendicular gradient = −1/m (product of gradients = −1)', 'Rearrange to y = mx + c before reading m'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['perpendicular lines', 'negative reciprocal', 'gradient', 'equation of perpendicular', 'rhombus diagonals'],
  },
  {
    slug: 'frustums-and-compound-solids', title: 'Frustums and compound solids: harder mensuration', strand: 'GM',
    statementIds: ['M4-GM-01'], prerequisites: ['cylinder-cone-and-sphere-surface-area-and-volume', 'circle-parts-arc-length-and-sector-area'], calculator: 'calc', difficulty: 4,
    examinerEvidence: [
      ev('November 2024', 'M4', 'Q12: surface area of a compound shape from two cylinders; Q22 radius of a cone from its volume.'),
      ev('Summer 2023', 'M4', 'Q13: curved surface area of a cylinder with an overlap; Q23 apex angle of a sector forming a cone "rare… to make the correct link".'),
      ev('Summer 2024', 'M4', 'Q9: cylinder + hemisphere — sphere used, 90% forgotten, rounding.'),
    ],
    mustMemorise: ['Frustum = large cone − small cone', 'Compound solids: add/subtract volumes; count only exposed faces for surface area'],
    onFormulaSheet: ['Volume of cone = 1/3 πr²h', 'Curved surface area of cone = πrl', 'Volume of sphere = 4/3 πr³', 'Surface area of sphere = 4πr²'],
    corbettmaths: [cm('Volume of a Frustum', '360a')],
    keywords: ['frustum', 'compound solids', 'mensuration', 'cone', 'hemisphere', 'surface area', 'volume'],
  },
  {
    slug: 'circle-theorems', title: 'Circle theorems (use, with reasons; proofs excluded)', strand: 'GM',
    statementIds: ['M4-GM-02'], prerequisites: ['circle-parts-arc-length-and-sector-area', 'triangles-and-quadrilaterals-properties-and-angles', 'angles-on-parallel-lines'], calculator: 'either', difficulty: 5,
    examinerEvidence: [
      ev('Summer 2024', 'M4', 'Q19(c): circle-theorem reasoning (chord then alternate segment) — 6% full marks.'),
      ev('November 2025', 'M4', 'Q20(c): circle-theorem reasoning — 6%; reasons omitted the key words "opposite"/"cyclic".'),
      ev('Summer 2025', 'M4', 'Q17(b): needed an isosceles triangle + the alternate segment theorem — very few full marks; (a) reason "opposite angles in a cyclic quadrilateral are equal" (wrong); Summer 2023 M4 Q17(b) "majority obtained zero".'),
    ],
    mustMemorise: ['Angle in a semicircle = 90°; angle at centre = 2 × angle at circumference; angles in the same segment equal; opposite angles of a cyclic quadrilateral sum to 180°; tangent ⟂ radius; two tangents equal (tangent kite); alternate segment theorem', 'State the theorem in words as the reason'], onFormulaSheet: [],
    corbettmaths: [cm('Circle Theorems — theorems', '64', 'http://corbettmaths.com/2013/04/04/circle-theorems-theorems/'), cm('Circle Theorems — examples', '65', 'http://corbettmaths.com/2013/04/04/circle-theorems-examples/')],
    keywords: ['circle theorems', 'cyclic quadrilateral', 'alternate segment', 'tangent', 'angle at the centre', 'same segment', 'semicircle'],
  },
  {
    slug: 'stratified-sampling-and-population-estimates', title: 'Stratified sampling and estimating populations from samples', strand: 'HD',
    statementIds: ['M4-HD-01'], prerequisites: ['handling-data-cycle-sampling-surveys-and-bias', 'relative-frequency-and-experimental-probability', 'ratio-notation-and-simplifying'], calculator: 'calc', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M4', 'Q22(c): stratified sampling — many blank; Q18 reasoning about representative samples — even able candidates "overthought"; those who calculated 30% of 142 scored.'),
      ev('Summer 2024', 'M4', 'Q15: estimating a population from samples — 28% full marks; (b) faults/improvements in sampling.'),
      ev('Summer 2023', 'M4', 'Q18: stratified sampling well answered; November 2025 M4 Q23 top candidates only.'),
    ],
    mustMemorise: ['Stratum sample = (stratum size ÷ population) × sample size; round sensibly so the total is right'], onFormulaSheet: [],
    corbettmaths: [cm('Stratified Sampling', '281')],
    keywords: ['stratified sampling', 'sample', 'population estimate', 'representative sample', 'proportional sampling'],
  },
  {
    slug: 'histograms-unequal-widths', title: 'Histograms with unequal class widths (frequency density) and estimating the median', strand: 'HD',
    statementIds: ['M4-HD-02'], prerequisites: ['estimated-mean-and-modal-class-from-grouped-data', 'cumulative-frequency-tables-and-curves', 'bar-charts-pictograms-pie-charts-and-line-graphs'], calculator: 'calc', difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'M4', 'Q22(a): histogram on a blank grid — many zero (no frequency density; own scales; unlabelled axes); (b) estimating the median from a histogram "continues to cause problems for the vast majority".'),
      ev('November 2024', 'M4', 'Q21: histograms and sampling — "majority obtaining zero marks in both parts".'),
      ev('Summer 2024', 'M4', 'Q21(b): reverse reading from a histogram — all or nothing; Summer 2023 M4 Q21(b) and November 2023 median from a histogram; November 2025 M4 Q23 frequency-density scale — top only.'),
    ],
    mustMemorise: ['Frequency density = frequency ÷ class width; area of bar = frequency', 'Median: find the bar containing the n/2-th value and interpolate by area'], onFormulaSheet: [],
    corbettmaths: [cm('Histograms', '157'), cm('Histograms', '158'), cm('Histograms', '159'), cm('Histograms', '52')],
    keywords: ['histogram', 'frequency density', 'unequal class widths', 'median from histogram', 'grouped continuous data'],
  },

  // ═══════════════ STAGE 4 — M8 ═══════════════
  // ── Number ──
  {
    slug: 'surds-simplifying-rationalising-and-irrational-numbers', title: 'Surds: simplifying, expanding, rationalising the denominator; rational vs irrational', strand: 'NA',
    statementIds: ['M8-NA-01', 'M8-NA-05'], prerequisites: ['surds-and-pi-in-exact-calculations', 'identities-and-expanding-double-brackets', 'index-laws-zero-and-negative-powers'], calculator: 'non-calc', difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 1 Q11: equation involving surds — fewer than half gained even one mark; Q14 surd manipulation and rational/irrational reasoning — sign errors common.'),
      ev('Summer 2023', 'M8', 'Paper 1 Q10: surd manipulation (A*) — "most challenging"; partial marks for expanding only.'),
      ev('Summer 2024', 'M8', 'Paper 1 Q12: Pythagoras, surds and areas — A* differentiator.'),
    ],
    mustMemorise: ['√(ab) = √a√b; √12 = 2√3; (√a)² = a', 'Rationalise: multiply top and bottom by the surd (5/(3√2) = 5√2/6)', 'Rational = can be written p/q; √2, π are irrational'], onFormulaSheet: [],
    corbettmaths: [cm('Irrational Numbers', '230'), cm('Surds', '305'), cm('Surds', '306'), cm('Surds', '307'), cm('Surds', '308')],
    keywords: ['surds', 'simplify surds', 'rationalise the denominator', 'irrational numbers', 'rational numbers', 'exact form'],
  },
  {
    slug: 'recurring-decimals-to-fractions', title: 'Changing recurring decimals to fractions', strand: 'NA',
    statementIds: ['M8-NA-02'], prerequisites: ['recurring-decimals-and-fraction-to-decimal-conversion', 'simultaneous-equations-algebraically'], calculator: 'non-calc', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 1 Q12: recurring decimals to fractions and subtract — most got one mark.'),
      ev('November 2025', 'M8', 'Paper 1 Q10: recurring decimal → fraction — 70% correct.'),
    ],
    mustMemorise: ['Let x = 0.ẋẏ…, multiply by 10ⁿ (n = length of the repeat), subtract, divide'], onFormulaSheet: [],
    corbettmaths: [cm('Recurring Decimals', '96')],
    keywords: ['recurring decimal', 'convert to fraction', 'algebraic method', 'rational'],
  },
  {
    slug: 'fractional-and-negative-indices', title: 'Fractional and negative indices (numbers)', strand: 'NA',
    statementIds: ['M8-NA-03'], prerequisites: ['index-laws-zero-and-negative-powers', 'factors-multiples-primes-squares-and-cubes'], calculator: 'non-calc', difficulty: 4,
    examinerEvidence: [
      ev('November 2025', 'M8', 'Paper 1 Q11: index simplification and an index proof — a third full / a third zero; "didn’t understand meaning of indices".'),
      ev('Summer 2024', 'M8', 'Paper 1 Q10: indices simplification "very mixed" — ¼ full, ¼ zero; Summer 2025 M7 Paper 1 Q17 fractional index part poorly done.'),
    ],
    mustMemorise: ['a^(1/n) = ⁿ√a; a^(m/n) = (ⁿ√a)ᵐ; a⁻ⁿ = 1/aⁿ; 27^(2/3) = 9, 8^(−4/3) = 1/16'], onFormulaSheet: [],
    corbettmaths: [cm('Negative Indices', '175'), cm('Fractional Indices', '173')],
    keywords: ['fractional indices', 'negative indices', 'roots as powers', 'evaluate indices'],
  },
  {
    slug: 'growth-decay-and-exponential-graphs', title: 'Growth and decay (compound-interest formula) and exponential graphs y = kˣ', strand: 'NA',
    statementIds: ['M8-NA-04', 'M8-NA-08'], prerequisites: ['compound-interest-and-finance-problems', 'index-laws-zero-and-negative-powers', 'recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'M8', 'Paper 2 Q9: exponential graph — trebling; (c) gradient of a tangent for the rate of decay only by better candidates.'),
      ev('Summer 2023', 'M8', 'Paper 2 Q11(b)(ii): tangent for the rate of decay — only the best.'),
    ],
    mustMemorise: ['Amount = start × (multiplier)ⁿ; decay multiplier < 1', 'y = kˣ passes through (0, 1); growth for k > 1, decay for 0 < k < 1'], onFormulaSheet: [],
    corbettmaths: [cm('Growth and Decay', '236'), cm('Exponential Graphs', '345')],
    keywords: ['growth and decay', 'compound interest formula', 'exponential graph', 'half-life', 'y = k^x'],
  },
  // ── Algebra ──
  {
    slug: 'index-laws-in-algebra-fractional-and-negative-powers', title: 'Index laws in algebra for fractional and negative powers', strand: 'NA',
    statementIds: ['M8-NA-06'], prerequisites: ['index-laws-in-algebra-integer-powers', 'fractional-and-negative-indices'], calculator: 'non-calc', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 2 Q3: algebraic indices — three quarters all correct.'),
      ev('November 2025', 'M8', 'Paper 1 Q11: index proof — 40% convincing.'),
    ],
    mustMemorise: ['y^(½) × y^(3/2) = y²; (x⁶)^(1/3) = x²; write √x as x^(½)'], onFormulaSheet: [], corbettmaths: [],
    keywords: ['index laws', 'algebra', 'fractional powers', 'negative powers', 'index proof'],
  },
  {
    slug: 'simultaneous-equations-linear-and-non-linear', title: 'Simultaneous equations: one linear and one non-linear', strand: 'NA',
    statementIds: ['M8-NA-07'], prerequisites: ['simultaneous-equations-algebraically', 'quadratic-formula-and-harder-quadratic-equations'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2023', 'M8', 'Paper 1 Q12: line/circle intersection and equation of a diameter (A*) — trial and error with a sketch.'),
      ev('Summer 2023', 'M8', 'Paper 2 Q13: A* AO3 algebra problem — just over a third scored; only the strongest full marks.'),
    ],
    mustMemorise: ['Rearrange the linear equation, substitute into the quadratic, solve, find both pairs'], onFormulaSheet: [],
    corbettmaths: [cm('Non-linear Simultaneous Equations', '298')],
    keywords: ['simultaneous equations', 'non-linear', 'quadratic and linear', 'substitution'],
  },
  {
    slug: 'graphical-solution-of-quadratic-equations', title: 'Using the intersection of a line and a quadratic graph to solve equations', strand: 'NA',
    statementIds: ['M8-NA-09'], prerequisites: ['quadratic-graphs-and-intersections-with-straight-lines', 'simultaneous-equations-linear-and-non-linear'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M8', 'Paper 1 Q4: both x-intercepts, intersections with a line, "which line solves the equation" — only the strongest.'),
      ev('November 2025', 'M8', 'Paper 2 Q7: quadratic graph — negative x; straight segments at the minimum; top fifth for the final part.'),
    ],
    mustMemorise: ['Rearrange the target equation into (drawn curve) = (straight line); draw that line; read the x-values'], onFormulaSheet: [],
    corbettmaths: [cm('Graphical Solutions', '267d')],
    keywords: ['graphical solution', 'quadratic graph', 'which line to draw', 'intersection'],
  },
  {
    slug: 'gradient-of-a-curve-as-rate-of-change', title: 'Gradient at a point on a curve as instantaneous rate of change (tangents)', strand: 'NA',
    statementIds: ['M8-NA-10'], prerequisites: ['recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs', 'gradient-and-intercept-of-linear-graphs-in-context'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'M8', 'Paper 2 Q9(c): gradient of a tangent to an exponential graph — only the better candidates drew a tangent.'),
      ev('Summer 2023', 'M8', 'Paper 2 Q11(b)(ii): tangent for the rate of decay — only the best.'),
    ],
    mustMemorise: ['Draw a tangent at the point; gradient = rise ÷ run using the axis scales; units = y-units per x-unit'], onFormulaSheet: [],
    corbettmaths: [cm('Rates of Change', '390a')],
    keywords: ['rate of change', 'tangent to a curve', 'gradient of a curve', 'instantaneous rate'],
  },
  {
    slug: 'equation-of-a-circle-and-its-tangent', title: 'Equation of a circle centred at the origin and the tangent at a point', strand: 'NA',
    statementIds: ['M8-NA-11', 'M8-NA-12'], prerequisites: ['perpendicular-lines', 'pythagoras-theorem-in-2d', 'circle-parts-arc-length-and-sector-area'], calculator: 'either', difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 1 Q13: gradient of tangent → equation of radius → intersection → equation of circle — just under 20% completed.'),
      ev('November 2025', 'M8', 'Paper 2 Q10: equation of a circle and its tangent — "few recalled"; a straight-line equation given for the circle; ~30%/~40%.'),
      ev('Summer 2024', 'M8', 'Paper 2 Q10: prove the chord equation then a hard third part — about 1/10 stalled after the gradient; only the strongest completed.'),
    ],
    mustMemorise: ['x² + y² = r²', 'Tangent ⟂ radius: gradient of tangent = −1 ÷ (gradient of radius), then y − y₁ = m(x − x₁)'], onFormulaSheet: [],
    corbettmaths: [cm('Equation of a Circle', '12')],
    keywords: ['equation of a circle', 'tangent to a circle', 'x² + y² = r²', 'coordinate geometry', 'radius gradient'],
  },
  {
    slug: 'inverse-proportion', title: 'Inverse (indirect) proportion: graphs and equations', strand: 'NA',
    statementIds: ['M8-NA-13'], prerequisites: ['direct-proportion', 'recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 1 Q10: inverse variation with algebraic manipulation (grade A) — top 20% correct; a quarter no marks.'),
      ev('November 2025', 'M8', 'Paper 1 Q13: inverse proportion — a third beyond reach; 40% full; equation manipulation.'),
    ],
    mustMemorise: ['y ∝ 1/x → y = k/x (xy constant); y ∝ 1/x² → y = k/x²'], onFormulaSheet: [],
    corbettmaths: [cm('Inverse Proportion', '255')],
    keywords: ['inverse proportion', 'indirect proportion', 'inversely proportional', 'y = k/x'],
  },
  // ── Geometry and measures ──
  {
    slug: 'sine-rule-cosine-rule-and-area-of-a-triangle', title: 'Sine rule, cosine rule and area = ½ab sin C', strand: 'GM',
    statementIds: ['M8-GM-01', 'M8-GM-02'], prerequisites: ['trigonometry-sohcahtoa-in-2d', 'bearings', 'changing-the-subject-harder-formulae'], calculator: 'calc', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 2 Q14: area formula then cosine rule (6 marks) — nearly a third full marks; weaker candidates "could not determine a logical starting point"; Q11 sine rule "many completely correct… and many incorrect approaches".'),
      ev('Summer 2024', 'M8', 'Paper 2 Q12: closing A* question (cosine rule + sine rule + area with an added line) — about one sixth full marks.'),
      ev('November 2025', 'M8', 'Paper 2 Q11 (bearings + sine rule) and Q12 (areas + cosine rule) — each nearly a quarter full marks.'),
    ],
    mustMemorise: ['When to use which: two angles + side → sine rule; two sides + included angle or three sides → cosine rule', 'The ambiguous case is excluded'],
    onFormulaSheet: ['Sine rule: a/sin A = b/sin B = c/sin C', 'Cosine rule: a² = b² + c² − 2bc cos A', 'Area of triangle = ½ab sin C'],
    corbettmaths: [cm('Sine Rule', '333'), cm('Sine Rule', '334'), cm('Cosine Rule', '335'), cm('Cosine Rule', '336'), cm('Area of any Triangle', '337')],
    keywords: ['sine rule', 'cosine rule', 'area of a triangle', '½ab sin C', 'non-right-angled triangles'],
  },
  {
    slug: 'pythagoras-and-trigonometry-in-3d', title: 'Pythagoras and trigonometry in 3D (space diagonals, angle between a line and a plane)', strand: 'GM',
    statementIds: ['M8-GM-03'], prerequisites: ['trigonometry-sohcahtoa-in-2d', 'sine-rule-cosine-rule-and-area-of-a-triangle', '3d-shapes-nets-plans-and-elevations'], calculator: 'calc', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 2 Q12: space diagonal then the angle — the majority found the diagonal; fewer than half identified/calculated the angle.'),
      ev('Summer 2023', 'M8', 'Paper 2 Q12(b): angle between a space diagonal and the base — only half knew which angle; Summer 2024 M8 Paper 2 Q11 over half full marks; November 2023 M8 side of a cube from a space diagonal of 9.'),
    ],
    mustMemorise: ['Space diagonal² = a² + b² + c²', 'Draw the right-angled triangle containing the required angle'], onFormulaSheet: [],
    corbettmaths: [cm('3D Pythagoras', '259'), cm('3D Trigonometry', '332')],
    keywords: ['3D Pythagoras', '3D trigonometry', 'space diagonal', 'angle between line and plane'],
  },
  {
    slug: 'enlargements-with-negative-scale-factors', title: 'Enlargements with negative scale factors', strand: 'GM',
    statementIds: ['M8-GM-04'], prerequisites: ['enlargements-with-fractional-scale-factors'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2023', 'M8', 'Paper 1 Q7: negative-scale-factor enlargement — 40% full / 40% zero; wrong centre.'),
      ev('November 2025', 'M8', 'Paper 1 Q12: 55%; one vertex only enlarged.'),
    ],
    mustMemorise: ['Negative SF: image on the opposite side of the centre, inverted, distances × |k|'], onFormulaSheet: [],
    corbettmaths: [cm('Negative Scale Factors', '108')],
    keywords: ['enlargement', 'negative scale factor', 'centre of enlargement'],
  },
  {
    slug: 'similar-3d-shapes-length-area-and-volume-ratios', title: 'Similar 3D shapes: ratios of lengths, surface areas and volumes', strand: 'GM',
    statementIds: ['M8-GM-05'], prerequisites: ['similar-shapes-length-area-and-volume-scale-factors', 'frustums-and-compound-solids'], calculator: 'either', difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 1 Q9: ratio of heights/volumes of a cylinder given the ratio of areas — stronger candidates only.'),
      ev('November 2025', 'M8', 'Paper 2 Q8: similar shapes ratios — just over a quarter; a correct answer with no working scored 0.'),
    ],
    mustMemorise: ['Length ratio a:b → area ratio a²:b² → volume ratio a³:b³; convert via square/cube roots'], onFormulaSheet: [],
    corbettmaths: [cm('Similar Shapes (Volumes)', '293b')],
    keywords: ['similar solids', 'volume ratio', 'surface area ratio', 'scale factor', 'frustum'],
  },
  // ── Handling data ──
  {
    slug: 'conditional-probability-and-tree-diagrams-without-replacement', title: 'Tree diagrams without replacement and choosing methods for complex probability problems', strand: 'HD',
    statementIds: ['M8-HD-01', 'M8-HD-02'], prerequisites: ['tree-diagrams-for-independent-events', 'product-rule-for-counting', 'three-circle-venn-diagrams'], calculator: 'either', difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'M8', 'Paper 2 Q13: probability without replacement (A* question) — more than 70% full marks; Paper 1 Q11 (2023) fraction-multiplication errors.'),
      ev('Summer 2024', 'M8', 'Paper 2 Q7: wordy probability — about half; Paper 1 Q11 non-replacement majority full marks.'),
      ev('November 2025', 'M8', 'Paper 2 Q9: tree-diagram interpretation — just over half; Paper 1 Q14 majority full.'),
    ],
    mustMemorise: ['Without replacement: denominators (and numerators) reduce on the second pick', 'Choose the method: list, sample space, Venn or tree'], onFormulaSheet: [],
    corbettmaths: [cm('Conditional Probability', '247')],
    keywords: ['conditional probability', 'without replacement', 'tree diagram', 'dependent events', 'complex probability'],
  },
];
