# CCEA GCSE Mathematics (2017 specification) — research report

Compiled 1 September 2026 from primary CCEA sources. Every PDF/JSON cited was downloaded into
`docs/sources/maths/` (filenames given in Appendix A). All URLs below were checked live on 1 Sept 2026 and returned HTTP 200.

Northern Ireland context: CCEA GCSEs are graded **A\*, A, B, C\*, C, D, E, F, G** (U = unclassified). They are **not** graded 9–1. Grade C\* was introduced for first certification in Summer 2019 and A\* was re-aligned to grade 9 (CCEA "GCSE Guidance Notes: Entry, Re-sit and Aggregation Rules", Section 1).

A second, independently written version of this report produced by a parallel research process during the same session is preserved alongside this file as `01-ccea-gcse-mathematics-spec.parallel-version.md`; it was not used as a source here.

---

## 1. Status of the specification (is there a new spec for 2025–2028?)

| Fact | Detail | Source |
|---|---|---|
| Current specification | CCEA GCSE Mathematics (2017), **Version 2: 8 June 2017**. First teaching Sept 2017, first assessment Summer 2018 (M1–M4), first award Summer 2019. Subject code **2210**, QAN **603/1688/3**, 120 GLH, Level 1/2. | Spec PDF p.1–3; subject page |
| Spec PDF (Standard) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%282017%29/GCSE%20Mathematics%20%282017%29-specification-Standard_0.pdf (site says "last updated 05/02/2026", but the document itself is still Version 2 and its change log lists only "Version 2, 8 June 2017, p.6 wording changed"; text is identical to the older `…-Standard.pdf` link apart from layout) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017 |
| Spec PDF (Irish-medium) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%20%282017%29/GCSE%20Mathematics%20%20%282017%29-specification-Irish-medium.pdf | subject page |
| **No new Mathematics spec for 2025–2028** | CCEA's "Reform of Qualifications" timeline: Aug 2026 GCSE baseline survey (26 Aug–21 Oct 2026); Jan 2027 drafting begins; May 2027 consultation on drafts; July 2027 accreditation; **Sept 2028 publication; Sept 2029 first teaching; Aug 2031 first award** of new GCSEs. The 2017 Maths spec therefore remains live through at least Summer 2031 cohorts. (Only GCSE English Language has an "interim specification" from Sept 2026 — see the Nov/March changes Q&A; nothing equivalent for Maths.) | https://ccea.org.uk/reform-of-qualifications ; https://ccea.org.uk/news/2026/august/ccea-launches-survey-gather-baseline-evidence-ahead-gcse-reform |
| **Series change announced Aug 2026** | Circular S/IF/35/26 (August 2026): "From November 2027, the November series for both GCSE Mathematics and GCSE English Language will become a qualification resit series only" — only candidates who have already cashed in may enter. November 2026 runs as normal (last November in which a unit can be sat for the first time). | https://ccea.org.uk/downloads/docs/Circulars/S/2026/August/S-IF-35-26-August.pdf ; Q&A: https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/November%20and%20March%20Examination%20Series%20Changes%20%28from%20202627%29.pdf (linked from https://ccea.org.uk/examiner-centre-support/examinations-support/202627-assessment-updates) |
| January series | The spec (2017) promised January sittings from 2019/2020; January series ran in Jan 2019 and Jan 2020 only. Since 2021 CCEA runs a **November** series instead (past-paper feed and Chief Examiner reports: Jan 2019, Jan 2020, then Nov 2021, Nov 2022 … Nov 2025). No January GCSE timetable exists for 2025–2027. | 504.json feed; reports page; https://ccea.org.uk/key-stage-4/gcse/timetables |

---

## 2. Structure: units, papers, calculators, durations, marks, weightings

Source: Specification section 2 "Specification at a Glance" (pp.6–7) and section 4; raw-mark totals from the Summer 2025 question papers; UMS from CCEA grade-boundary documents.

| Unit | Tier / type | Papers | Calculator | Duration | Raw marks | Weighting | Max UMS | Targeted unit grades |
|---|---|---|---|---|---|---|---|---|
| **M1** | Foundation, first unit | 1 paper | **With** calculator | 1 h 45 min | 100 | 45% | 107 (of 180 scale) | D, E, F, G (+ Level 1 Functional Maths) |
| **M2** | Foundation, first unit | 1 paper | **With** calculator | 1 h 45 min | 100 | 45% | 131 | C\*, C, D, E, F, G (+ Level 1 or 2 Functional Maths) |
| **M3** | Higher, first unit | 1 paper | **With** calculator | 2 h | 100 | 45% | 143 | B, C\*, C, D, E |
| **M4** | Higher, first unit | 1 paper | **With** calculator | 2 h | 100 | 45% | 180 | A, B, C\*, C, allowable D (A\* only at subject level) |
| **M5** | Foundation Completion Test | Paper 1 **non-calculator** + Paper 2 **with** calculator | P1 no / P2 yes | 1 h + 1 h | 50 + 50 | 55% | 131 (of 220 scale) | D, E, F, G |
| **M6** | Foundation Completion Test | Paper 1 non-calc + Paper 2 calc | P1 no / P2 yes | 1 h + 1 h | 50 + 50 | 55% | 160 | C\*, C, D, E, F, G |
| **M7** | Higher Completion Test | Paper 1 non-calc + Paper 2 calc | P1 no / P2 yes | 1 h 15 + 1 h 15 | 50 + 50 | 55% | 175 | B, C\*, C, D, E |
| **M8** | Higher Completion Test | Paper 1 non-calc + Paper 2 calc | P1 no / P2 yes | 1 h 15 + 1 h 15 | 50 + 50 | 55% | 220 | A, B, C\*, C, allowable D (A\* at subject level) |

Unit entry codes (timetables/grade boundaries): GMC11, GMC21, GMC31, GMC41; GMC51/52, GMC61/62, GMC71/72, GMC81/82; cash-in **G9602**. Past-paper file names use "GMC1"…"GMC8" and the Chief Examiner reports label completion papers M51/M52, M61/M62, M71/M72, M81/M82.

Key rules (spec §2, §4.1, §4.5, §4.6):
- Students take **two units: one of M1–M4 and one of M5–M8**; one must be a completion test. Recommended pathways: M1+M5, M2+M6, M3+M7, M4+M8.
- **Terminal rule:** at least 40% of the assessment (by weighting) must be taken in the series in which the grade is cashed in — i.e. at least one unit must be sat in the cash-in series.
- Resits: each unit may be resat **once** before cash-in; the better result counts unless that unit is needed to satisfy the terminal rule, in which case the more recent mark counts. After cash-in the qualification may be retaken (two further attempts per unit; higher of the last two counts).
- M1–M4 are timetabled at the **same time** (so only one may be entered per series); M5–M8 are timetabled concurrently on a **different day**, with Paper 2 (calculator) following Paper 1 (non-calculator) the same morning (timetables show P1 9.15, P2 10.45).
- **Calculators:** must be used in M1, M2, M3, M4 and Paper 2 of every completion test; must **not** be used in Paper 1 of the completion tests. Minimum functions +, −, ×, ÷, √, x^y, single memory; Higher papers need trigonometric and statistical functions, Foundation papers statistical functions. No symbolic algebra/calculus, no communication, no stored text/formulae; no lids/covers with printed formulae.
- Marks per paper (Summer 2025 front covers): "The total mark for this paper is 100" (M1–M4) and "…is 50" (each completion paper).

### 2.1 Permitted combinations and reachable grade ranges

Spec §4.5 table "Available Final GCSE Grades":

| Combination | Final GCSE grades available | Check against UMS scale |
|---|---|---|
| M1 + M5 | **D–G** (all grades in range) | max 107+131 = 238 UMS < 240 (C) → top grade D |
| M2 + M6 | **C\*–G** | max 131+160 = 291 (C\* band 268–291); min g+g = 36+44 = 80 = G |
| M3 + M7 | **B–E** | max 143+175 = 318 (B band 292–319); min e+e = 72+88 = 160 = E |
| M4 + M8 | **A\*–D** | max 180+220 = 400; allowable d+d = 99+121 = 220 = D |

Notes:
- The spec (§4.5) says "Candidates may enter any one of Units M1, M2, M3 or M4 together with any one of Units M5, M6 or M8" — M7 is evidently omitted by mistake since M3+M7 is a recommended pathway. CCEA's entry rules confirm that "students may take different units at different tiers" and can resit a unit at a different tier, and CCEA's own worked examples include M3+M6 (grade C) and M3+M8 (grade A) — so **any first unit may be combined with any completion unit**; the grade ceiling/floor simply follows from the UMS caps above.
- The 2020 support booklet "Guidance for teachers on Grading, Aggregation, Resit and Terminal Rules" describes M2+M6 as "available grades C\*, C, D, E, F" and M4+M8 as "A\*, A, B, C\*, C" (i.e. the *targeted* range), whereas the specification lists C\*–G and A\*–D (which is what the UMS arithmetic allows). Treat the specification as authoritative.
- Grade A\* is **only awarded at subject level**; its UMS boundary is set each series (394/400 in Summer 2025, 393 in Summer 2026).

### 2.2 Uniform Mark Scale (fixed for the life of the spec)

Total 400 UMS. Subject-level boundaries: A 320, B 292, C\* 268, C 240, D 200, E 160, F 120, G 80 (A\* set per series).
Unit UMS boundaries (Guidance for teachers 2020, p.8; raw-to-UMS documents):

| Unit grade | M1–M4 (max 180) | M5–M8 (max 220) |
|---|---|---|
| a | 144–180 | 176–220 |
| b | 132–143 | 161–175 |
| c\* | 121–131 | 148–160 |
| c | 108–120 | 132–147 |
| d | 90–107 (M4 "allowable d" boundary 99) | 110–131 (M8 "allowable d" boundary 121) |
| e | 72–89 | 88–109 |
| f | 54–71 | 66–87 |
| g | 36–53 | 44–65 |

Caps: M1 max 107, M2 max 131, M3 max 143; M5 max 131, M6 max 160, M7 max 175.

### 2.3 Recent raw-mark grade boundaries (out of 100 per unit)

Source: https://ccea.org.uk/downloads/docs/Grade-Boundaries/individual-quals/GCSE%20Mathematics%20%282017%29/2025/Summer/GCSE%20Mathematics%20%282017%29-Raw%20to%20Uniform%20Mark%20Boundaries-2025-Summer.pdf and the 2026 equivalent (…/2026/Summer/…-2026-Summer.pdf). Raw boundaries change every series; UMS boundaries do not.

| Unit | Summer 2025 raw marks | Summer 2026 raw marks |
|---|---|---|
| GMC1 (M1) | d 46, e 35, f 25, g 15 | d 47, e 35, f 24, g 13 |
| GMC2 (M2) | c\* 68, c 52, d 39, e 26, f 14, g 2 | c\* 71, c 54, d 41, e 28, f 15, g 2 |
| GMC3 (M3) | b 55, c\* 45, c 35, d 25, e 15 | b 58, c\* 48, c 39, d 30, e 21 |
| GMC4 (M4) | a 45, b 37, c\* 29, c 21, d 17 | a 45, b 37, c\* 29, c 21, d 17 |
| GMC5 (M5) | d 54, e 40, f 27, g 14 | d 50, e 35, f 21, g 7 |
| GMC6 (M6) | c\* 61, c 50, d 41, e 32, f 24, g 16 | c\* 66, c 54, d 44, e 34, f 25, g 16 |
| GMC7 (M7) | b 59, c\* 50, c 42, d 34, e 26 | b 65, c\* 56, c 48, d 40, e 32 |
| GMC8 (M8) | a 40, b 31, c\* 23, c 15, d 11 | a 49, b 39, c\* 30, c 21, d 16 |
| Subject A\* | 394 UMS | 393 UMS |

(The very low raw boundaries on M4/M8 show how demanding those papers are: 45% raw on M4 and 40–49% on M8 map to unit grade a.)

### 2.4 Functional Mathematics
Reported alongside the GCSE: M1 can give **Level 1**, M2 **Level 1 or Level 2**, based on a raw-mark threshold set each series; Level 2 is printed as an endorsement on the certificate (spec §4.4–4.5).

---

## 3. Assessment objectives

Spec §4.2–4.3.

| AO | Description (spec wording, abridged) | Foundation (M1+M5 or M2+M6) | Higher (M3+M7 or M4+M8) |
|---|---|---|---|
| **AO1** Use and apply standard techniques | recall facts, terminology, definitions; use and interpret notation; carry out routine procedures/multi-step tasks | **47–53%** | **37–43%** |
| **AO2** Reason, interpret and communicate mathematically | make deductions/inferences/conclusions; construct chains of reasoning; interpret and communicate information; present arguments and proofs; assess validity of an argument | **22–28%** | **27–33%** |
| **AO3** Solve problems in mathematics and other contexts | translate problems into mathematical processes; make connections between areas of maths; interpret results in context; evaluate methods/results; evaluate effect of assumptions | **22–28%** | **27–33%** |

Support: "Summer 2021 Assessment Resource: GCSE Mathematics Breakdown of Assessment Objectives" gives a question-by-question AO/strand grid for each paper — https://ccea.org.uk/downloads/docs/Support/General/2021/Summer%202021%20Assessment%20Resource%3A%20GCSE%20Mathematics%20Breakdown%20of%20Assessment%20Objectives.pdf

---

## 4. Formulae: given on the Formula Sheet vs must be memorised

Verified from page 2 of the Summer 2025 live papers (rendered images saved as `formula-sheet-*-Summer2025-p2.png`), and identical in the 2019 specimen papers.

**Foundation Formula Sheet (M1, M2, M5 P1/P2, M6 P1/P2)** — only two items:
- Area of trapezium = ½(a + b)h
- Volume of prism = area of cross-section × length

**Higher Formula Sheet (M3, M4, M7 P1/P2, M8 P1/P2):**
- Volume of prism = area of cross-section × length
- Area of trapezium = ½(a + b)h
- Volume of sphere = 4⁄3 πr³; Surface area of sphere = 4πr²
- Volume of cone = ⅓πr²h; Curved surface area of cone = πrl
- Quadratic equation: solutions of ax² + bx + c = 0 (a ≠ 0) are x = [−b ± √(b² − 4ac)] / 2a
- In any triangle ABC: Sine rule a/sin A = b/sin B = c/sin C; Cosine rule a² = b² + c² − 2bc cos A; Area = ½ab sin C

**Therefore NOT given (must be known), among others:** circumference and area of a circle; area of triangle ½bh, parallelogram, kite/rhombus; Pythagoras' theorem; SOH-CAH-TOA; volume/surface area of cuboid, cylinder (πr²h, 2πrh + 2πr²); arc length and sector area as fractions of the circle; interior/exterior angle facts for polygons; speed = distance/time, density = mass/volume, pressure = force/area; compound interest/multiplier methods; mean from frequency tables; equation of a straight line y = mx + c and gradient formula; midpoint; index laws; laws of probability (addition/multiplication rules); the conversions **5 miles ≈ 8 km and 1 kg ≈ 2.2 lb** (Teacher Guidance, M5: "All other conversions will be given"); metric conversions incl. 1 litre = 1000 cm³.

Scope limits stated in the CCEA Teacher Guidance (2019, elaboration column):
- "The method of completing the square to solve quadratic equations is excluded" (M4).
- "Proofs of circle theorems are excluded" (M4); theorems listed: angle at centre/circumference, angles in same segment, cyclic quadrilaterals, tangent–radius, tangent kite, alternate segment theorem.
- "The ambiguous case of the sine rule is excluded" (M8).
- "Use of second differences to determine the rule for the nth term of more complex quadratic sequences is excluded" (M7).
- Rotations limited to ±90° and 180° (M5 about the origin; M6 about any point).
- Number systems: "Questions will not be asked on number systems, with the exception of Decimal and Binary" (M6).
- Rounding: "appropriate degree of accuracy" means no more decimal places than the data given.
- Teacher Guidance PDF: https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2019/Teacher%20Guidance.pdf

---

## 5. Full subject content by unit (from the specification, §3.1–3.8)

Strands used by the spec: **Number and algebra**, **Geometry and measures**, **Handling data** (statistics and probability). Each unit assumes the earlier units (M2 assumes M1; M3 assumes M1–M2; M4 assumes M1–M3; M5 assumes M1; M6 assumes M1, M2, M5; M7 assumes M1, M2, M3, M5, M6; M8 assumes M1–M7).

### 5.1 Unit M1 — Foundation Tier (targets D, E, F, G; Level 1 Functional)
**Number and algebra**
- four operations with positive and negative integers, efficient written methods; order integers, decimals, fractions; symbols =, ≠, <, >, ≤, ≥
- use calculators effectively; priority of operations incl. brackets, powers, roots, reciprocals; inverse operations
- index notation for squares, cubes, powers of 10; factor, multiple, common factor/multiple, prime; square/cube (roots)
- place value; read/write/compare decimals to 3 d.p.; +−×÷ decimals to 3 d.p.; round to given/appropriate accuracy, d.p. or 1 s.f., or a power of 10; decimal notation for money
- equivalent fractions; simple fraction → terminating decimal; add/subtract simple fractions and mixed numbers; fraction of a quantity; one quantity as a fraction of another
- percentage = parts per 100; percentage of a quantity; one quantity as a percentage of another; percentage increase/decrease; equivalences between fractions, decimals, percentages
- money and simple finance: profit/loss, discount, wages/salaries, bank accounts, simple interest, budgeting, debt, APR and AER
- roles of letter symbols; vocabulary of expressions, equations, formulae, inequalities, terms, factors; interpret simple expressions as functions with inputs/outputs
- simplify by collecting like terms and multiplying a constant over a bracket; factorise by taking out common constant factors
- write simple formulae/expressions from real-life contexts; substitute into formulae (in words or algebra); use standard formulae
- set up and solve linear equations in one unknown; coordinates in all 4 quadrants; recognise/plot straight-line graphs; construct and interpret linear graphs in real-world contexts

**Geometry and measures**
- conventional terms/notation (points, lines, vertices, edges, parallel/perpendicular, right angles, polygons, regular polygons, reflection/rotation symmetry); labelling conventions; draw diagrams from descriptions
- angles at a point, on a straight line, vertically opposite; alternate and corresponding angles on parallel lines
- circle terms: centre, radius, chord, diameter, circumference; properties of triangles and quadrilaterals (square, rectangle, parallelogram, trapezium, kite, rhombus)
- faces/surfaces/edges/vertices of cubes, cuboids, prisms, cylinders, pyramids, cones, spheres; nets, plans and elevations
- metric units; sensible estimates; metric conversions; problems with length, area, volume/capacity, mass, time, temperature; measure lines and angles
- compound measures such as speed, heartbeats per minute, miles per gallon
- perimeter/area of triangles, rectangles and simple compound shapes; circumference and area of circles; surface area and volume of cubes and cuboids

**Handling data**
- handling-data cycle; sample vs population; simple random sampling and effect of sample size; design experiments/surveys and data-collection sheets; types of data; sources of bias
- sort/classify/tabulate qualitative, discrete and continuous data incl. **2-circle Venn diagrams**; extract data from tables/lists; two-way tables
- mean, median, mode, range from a list; mean from an ungrouped frequency table; mode and median from it
- construct/interpret frequency tables and diagrams, pictograms, bar charts, pie charts, line graphs, **frequency trees and flow charts**; misleading graphs; patterns and exceptions; compare distributions; scatter diagrams and correlation

### 5.2 Unit M5 — Foundation Completion Test (targets D–G; assumes M1)
**Number and algebra**
- problems with whole numbers, fractions, decimals, percentages **without a calculator**; estimation and approximation to check
- ratio notation and simplest form, links to fractions; divide a quantity in a given ratio; ratio/proportion in context (conversion, best-buy, comparison, scaling, mixing, concentrations, exchange rates)
- sequences of triangular, square, cube numbers; term-to-term and position-to-term rules
- plot/interpret real-life graphs: conversion graphs, distance–time graphs, intersecting travel graphs

**Geometry and measures**
- read scales on measuring instruments; continuous/approximate nature of measurement
- imperial units in common use and approximate metric equivalents (know 5 miles = 8 km, 1 kg = 2.2 lb)
- maps, scale factors, scale drawings; angle sum of a triangle (deduce polygon angle sums)
- single transformations: reflections in the x and y axes; rotations about the origin (±90°, 180°); translations; enlargements by positive whole-number scale factor
- draw triangles/2D shapes with ruler and protractor

**Handling data**
- probability vocabulary incl. uncertainty and risk; fair, random, evens, certain, likely, unlikely, impossible; probability scale 0–1
- list outcomes for single and two successive events; systematic listing strategies
- probabilities as fractions/decimals from equally likely outcomes and simple combined events; mutually exclusive outcomes sum to 1; P(not A) = 1 − P(A); expectation

### 5.3 Unit M2 — Foundation Tier (targets C\*–G; Level 1/2 Functional; assumes M1)
**Number and algebra**
- index notation and index laws for positive whole-number powers; divisor, HCF, LCM, prime factor decomposition
- +−×÷ decimals of any size; round to significant figures; recurring decimals are exact fractions (and vice versa)
- +−×÷ fractions incl. mixed numbers; percentage and repeated proportional change
- finance: compound interest, insurance, taxation, mortgages, investments
- multiply a single term over a bracket; factorise by taking out common factors that are terms
- linear equations with unknown on both sides and of the form (x/4) + 3 = 7
- midpoint and length of a line from 2D coordinates; gradients and intercepts of linear graphs in context (e.g. car-hire cost graph)

**Geometry and measures**
- compound measures such as density
- perimeter/area of kite, parallelogram, rhombus, trapezium; composite shapes; volumes of right prisms; **Pythagoras' theorem in 2D**

**Handling data**
- **3-circle Venn diagrams**; estimate mean from grouped frequency distribution; modal class and median class
- lines of best fit by eye; conclusions from scatter diagrams; positive/negative/no correlation; interpolation/extrapolation and its dangers; outliers; correlation ≠ causation

### 5.4 Unit M6 — Foundation Completion Test (targets C\*–G; assumes M1, M2, M5)
**Number and algebra**
- principles of number systems; **decimal ↔ binary** conversion
- index laws in algebra for positive powers
- **systematic trial and improvement** for equations with no simple analytical method
- linear inequalities in one variable, solution set on a number line
- change the subject of a simple formula; nth term of a linear sequence
- solve two linear simultaneous equations **graphically**
- plot simple quadratic graphs and use them to find approximate intersections with lines y = ±a only

**Geometry and measures**
- bearings; interior and exterior angle sums of polygons
- properties preserved under transformations; reflections in lines parallel to the axes; rotations about any point (±90°, 180°); translations using **vector notation**; effect of enlargement on perimeter and area; congruence
- standard ruler-and-compass constructions; loci incl. real-life problems

**Handling data**
- systematic listing for single and two successive events; relative frequency as estimate of probability; experimental vs theoretical; larger samples give better estimates

### 5.5 Unit M3 — Higher Tier (targets B, C\*, C, D, E; assumes M1, M2)
**Number and algebra**
- LCM and HCF from products of prime factors; original quantity from a proportional change (**reverse percentages**)
- **upper and lower bounds** in calculations involving addition and multiplication
- equation vs identity; multiply two linear expressions; **factorise x² + bx + c**; **difference of two squares**
- add/subtract algebraic fractions with numerical denominators, e.g. (4x+3)/10 + (6x−5)/5; simplify/multiply/divide algebraic fractions with linear or quadratic numerators/denominators
- solve linear equations such as (4x+3)/10 + (6x−5)/5 = 13/2; set up and solve **quadratic equations by factorising**
- y = mx + c: gradient and intercept; equation of a line through two points or one point and a gradient; gradients of parallel lines

**Geometry and measures**
- circle terms: tangent, arc, sector, segment; compound measures such as **pressure**
- mensuration: **arc length, sector area, surface area of a cylinder, volume and surface area of cone and sphere**
- **trigonometric ratios sin/cos/tan in 2D**, incl. angles of elevation and depression

**Handling data**
- quartiles and interquartile range from a list; **cumulative frequency tables and curves**; estimate median/quartiles/IQR from the curve; **box plots**; infer population properties from a sample and know limitations

### 5.6 Unit M7 — Higher Completion Test (targets B–E; assumes M1, M2, M3, M5, M6)
**Number and algebra**
- **surds and π in exact calculations**; index laws for zero, positive and **negative** powers; **standard index form** (interpret, order, calculate)
- index laws in algebra for integer powers
- **two linear simultaneous equations algebraically**
- **linear inequalities in two variables, solution set shown on a graph** (regions)
- change the subject of a formula incl. powers/roots of the subject and **subject appearing in more than one term**
- nth term of **non-linear sequences** (complex second-difference work excluded)
- recognise, sketch and interpret graphs of linear, quadratic, simple cubic and reciprocal y = k/x (x ≠ 0) functions
- quadratic graphs to find approximate intersections with lines y = mx + c
- **direct proportion** (graphical and algebraic)

**Geometry and measures**
- **combined transformations**; reflections in the lines **y = ±x**; enlargement by a **fractional** scale factor; effect of enlargement on **volume**
- **ratios of lengths and areas of similar 2D shapes**

**Handling data**
- **product rule for counting** (m × n)
- when to add or multiply probabilities (mutually exclusive: P(A)+P(B); independent: P(A)×P(B))
- **tree diagrams for independent successive events**

### 5.7 Unit M4 — Higher Tier (targets A, B, C\*, C, allowable D; A\* at subject level; assumes M1–M3)
**Number and algebra**
- **upper and lower bounds with subtraction and division**
- **factorise ax² + bx + c**; add/subtract algebraic fractions with **linear denominators**, e.g. 2/(x+2) + 3/(2x−1); solve equations such as 2/(x+2) + 3/(2x−1) = 1
- **quadratic equations by factorising and by the formula where the coefficient of x² ≠ 1**, and more complex equations (may need rearranging first; completing the square excluded)
- **gradients of perpendicular lines**

**Geometry and measures**
- more complex mensuration, e.g. **frustums**
- **circle theorems** (understand and use; proofs excluded)

**Handling data**
- **stratified sampling**
- **histograms with unequal class intervals** (construct and interpret; frequency density)

### 5.8 Unit M8 — Higher Completion Test (targets A–C, allowable D; A\* at subject level; assumes M1–M7)
**Number and algebra**
- **rational vs irrational numbers**; **recurring decimal → fraction**
- index laws for **integer, fractional and negative powers** (numeric and algebraic)
- **growth and decay** problems, e.g. compound-interest formula
- **simplify surd expressions incl. rationalising denominators** such as 5/(3√2)
- **simultaneous equations, one linear and one non-linear**
- **exponential graphs y = kˣ** for positive k (growth/decay rates)
- **intersection of a line and a quadratic** as approximate solutions of the simultaneous equations (may need algebraic manipulation)
- **gradient at a point on a curve as instantaneous rate of change**
- **equation of a circle centre the origin, radius r; equation of a tangent to the circle at a point**
- **inverse (indirect) proportion** (graphical and algebraic)

**Geometry and measures**
- **sine and cosine rules**; **area of a triangle = ½ab sin C**
- **Pythagoras and trigonometry in 2D and 3D**
- **enlargement with negative scale factors**
- **ratios of lengths, areas and volumes of similar 3D shapes**

**Handling data**
- most appropriate method for complex probability problems
- **tree diagrams for successive events that are NOT independent** (e.g. without replacement)

### 5.9 Where the "usual Higher topics" sit in this spec (M3/M4/M7/M8-only content)

| Topic asked about | Where it lives in CCEA GCSE Maths (2017) |
|---|---|
| Surds | M7 (use surds and π in exact calculations); M8 (simplify, rationalise denominator; rational vs irrational) |
| Functions / function notation, composite & inverse functions | **Not in this spec** beyond M1 "interpret simple expressions as functions with inputs and outputs" (formal f(x), fg(x), f⁻¹ are GCSE Further Mathematics content) |
| Vectors | Only **translation vectors** (column vector notation) in M6; no vector geometry/proof in GCSE Maths |
| Circle theorems | M4 (use; proofs excluded) |
| Iteration | Only **trial and improvement** (M6); no iterative formulae x_{n+1} = … |
| Algebraic proof | No explicit statement; M3 "know the difference between an equation and an identity"; AO2 "present arguments and proofs"; grade-A descriptor "formal proofs"; M4 papers have set short proof-style questions (e.g. Summer 2024 Q20 "prove the surface area of a sphere and a cube can never be the same") |
| Trigonometric graphs | **Not in this spec** (graphs required: linear, quadratic, simple cubic, reciprocal (M7), exponential (M8)) |
| Sine / cosine rule, ½ab sin C | M8 (formulae given on Higher sheet) |
| Histograms (unequal classes) | M4 |
| Quadratic formula | M4 (given on sheet); completing the square excluded |
| Simultaneous equations with a quadratic | M8 |
| Inequality regions | M7 (linear inequalities in two variables on a graph) |
| Similarity 2D / 3D | M7 (lengths & areas, 2D); M8 (lengths, areas, volumes, 3D) |
| Upper / lower bounds | M3 (+, ×); M4 (−, ÷) |
| Direct / inverse proportion | M7 direct; M8 inverse |
| Transformations of graphs y = f(x) + a etc. | **Not in this spec** |
| Cumulative frequency, box plots, quartiles | M3 |
| Standard form, negative/zero indices | M7; fractional indices M8 |
| Reverse percentages | M3 |
| Compound interest / growth & decay | M2 (compound interest in finance); M8 (growth/decay formula, exponential graphs) |
| Equation of a circle & tangent | M8 (centre origin only) |
| Frustums | M4 |
| Stratified sampling | M4 |
| Tree diagrams | M7 independent; M8 dependent (without replacement) |
| Product rule for counting | M7 |
| Perpendicular gradients | M4 |
| Enlargement negative SF | M8; fractional SF M7 |
| Binary numbers, trial & improvement, loci/constructions, relative frequency | Foundation completion M6 (and therefore assumed for M7/M8) |

Companion CCEA document mapping every statement to M1/M2/M3/M4 columns: "Progression of Subject Content" — https://ccea.org.uk/downloads/docs/Support/General/2019/Progression%20of%20Subject%20Content.pdf

---

## 6. Examination timetables

Source page: https://ccea.org.uk/key-stage-4/gcse/timetables (Final timetables). Morning sessions start 9.15am. Only Summer and November series contain Mathematics; the March series is Science/Entry Level only; no January series exists.

| Series | M1/M2/M3/M4 (one sitting; M1/M2 1h45, M3/M4 2h) | M5–M8 Paper 1 (non-calc) then Paper 2 (calc) | Results day | PDF |
|---|---|---|---|---|
| **Summer 2025** (for reference) | Thu 15 May 2025, 9.15am (M1/M2 to 11.00, M3/M4 to 11.15 — from paper covers) | Wed 4 June 2025: F 9.15–10.15 & 10.45–11.45; H 9.15–10.30 & 10.45–12.00 | — | https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202025.pdf |
| **November 2025** | Tue 18 Nov 2025, 9.15am | Thu 20 Nov 2025 (same times as above) | Thu 5 Feb 2026 | https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20November%202025.pdf |
| **Summer 2026** | **Thu 14 May 2026**, morning session (9.15am) | **Wed 3 June 2026**: F 9.15–10.15 & 10.45–11.45; H 9.15–10.30 & 10.45–12.00 | Thu 20 Aug 2026 | https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202026.pdf |
| **November 2026** (last November open to first-time unit entries) | **Tue 17 Nov 2026**, 9.15–11.00 (F) / 9.15–11.15 (H) | **Thu 19 Nov 2026**: F 9.15–10.15 & 10.45–11.45; H 9.15–10.30 & 10.45–12.00 | Thu 4 Feb 2027 | https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20November%202026.pdf |
| **March 2027** | no Mathematics units | — | Thu 15 Apr 2027 | https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20March%202027.pdf |
| **Summer 2027** (Final, Version 2, 1 Sept 2026) | **Fri 14 May 2027**, morning session | **Thu 27 May 2027**: F 9.15–10.15 & 10.45–11.45; H 9.15–10.30 & 10.45–12.00 | Thu 19 Aug 2027 | https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202027%20%28Version%202%29.pdf |
| **November 2027 onward** | Resit-only series for GCSE Maths (must already have cashed in); timetable not yet published | | | Circular S/IF/35/26 |

Unit/cash-in availability grid for GCSE Mathematics in the Q&A document ("November 2026 to November 2030"): GMC1–4, GMC5–8 and cash-in G9602 available every Summer and November; November 2027, 2028, 2029, 2030 flagged "*Only available with a previous cash-in for the specification". Worked cohort scenarios: a student starting Sept 2026 and cashing in Summer 2028 can sit units in Nov 2026, Summer 2027 and Summer 2028 but **cannot** use Nov 2027.

2026/27 Calendar of Events (results, entry deadlines): https://ccea.org.uk/downloads/docs/ccea-asset/Entries/Calendar%20of%20Events%20-%20202627.pdf (e.g. "Issue GCSE English and GCSE Mathematics Question Papers" 4–5 Nov 2026 for the November series).

---

## 7. Past papers, mark schemes and the JSON feed

- Past papers page: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes
- The page is rendered from the JSON feed **id 504**: https://ccea.org.uk/sites/default/files/qualification/504.json (saved as `docs/sources/maths/504.json`; a parsed index is in `504-index.tsv`). Note: ccea.org.uk pages and the JSON need a browser User-Agent; PDFs download directly.
- Feed contents (1 Sept 2026): **635 entries** — Standard (English), Irish Medium and Modified (large print) versions. Series covered: Summer 2018 (M1–M4 only); January 2019; Summer 2019; January 2020; Summer 2021; November 2021; Summer/November 2022, 2023, 2024, 2025; **Summer 2026 question papers only (12 entries, mark schemes not yet released)**. Each Standard series has 12 question papers + 12 mark schemes (M1, M2, M3, M4, M5 P1/P2, M6 P1/P2, M7 P1/P2, M8 P1/P2).
- URL pattern (Standard): `https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/<YEAR>-<Series>/Standard/0/GCSE-Mathematics%20-504-<Series><YEAR>-<Tier>%20Tier%2C%20<Unit>-Paper.pdf` and `…-MS.pdf` for mark schemes. Examples:
  - Summer 2025 M4 paper: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-Paper.pdf
  - Summer 2025 M4 mark scheme: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-MS.pdf
  - Summer 2025 M8 Paper 1: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M8%3A%20Paper%201%20%28Non-Calculator%29-Paper.pdf
  - November 2025 M1 paper: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M1%20%28With%20calculator%29-Paper.pdf
  - Summer 2026 M8 Paper 2: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2026-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2026-Higher%20Tier%2C%20M8%3A%20Paper%202%20%28With%20calculator%29-Paper.pdf
  - (Beware one irregular filename: Summer 2025/2026 M7 Paper 1 is `…M7%3A%20Paper%201%20%28Non-Calculator-Paper.pdf` — missing closing bracket.)
- Legacy (2010 "T-unit" spec, qualification id 505) papers: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/archived-past-papers-mark-schemes ; mapping document "Mapping T spec to M Spec": https://ccea.org.uk/downloads/docs/Support/General/2019/Mapping%20T%20spec%20to%20M%20Spec.pdf
- **Specimen Assessment Materials** (all 12 papers + mark schemes, 2019 upload, 4.1 MB): https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials_23.pdf (Irish-medium: …/Specimen%20Assessment%20Materials%20%28Irish-Medium%29_1.pdf)
- Grade boundaries page: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/grade-boundaries
- Reports page (Chief Examiner reports 2018–Nov 2025): https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports

---

## 8. Support materials (CCEA)

Support page: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/support

| Resource | URL |
|---|---|
| Teacher Guidance (elaboration of every learning outcome, 2019) | https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2019/Teacher%20Guidance.pdf |
| Student Guide | https://ccea.org.uk/downloads/docs/Support/Student%20Guidance/2019/Student%20Guide_17.pdf |
| Guidance for teachers on Grading, Aggregation, Resit and Terminal Rules (March 2020) | https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2020/Guidance%20for%20teachers%20on%20Grading%2C%20Aggregation%2C%20Resit%20and%20Terminal%20Rules.pdf |
| Snapshot (one-page overview) | https://ccea.org.uk/downloads/docs/Support/General/2019/Snapshot_11.pdf |
| Progression of Subject Content (M1→M4 grid) | https://ccea.org.uk/downloads/docs/Support/General/2019/Progression%20of%20Subject%20Content.pdf |
| Planning Framework Templates M1–M4 / M5–M8 (docx) | https://ccea.org.uk/downloads/docs/Support/General/2021/Planning%20Framework%20Templates%20for%20M1%2C%20M2%2C%20M3%2C%20M4%20Units.docx ; https://ccea.org.uk/downloads/docs/Support/General/2021/Planning%20Framework%20Templates%20for%20M5%2C%20M6%2C%20M7%2C%20M8%20Units.docx |
| Breakdown of Assessment Objectives (Summer 2021) | https://ccea.org.uk/downloads/docs/Support/General/2021/Summer%202021%20Assessment%20Resource%3A%20GCSE%20Mathematics%20Breakdown%20of%20Assessment%20Objectives.pdf |
| Practice Papers 2021/22 (zip; M1, M2, M3, M4, M6, M8 + mark schemes; M5/M7 not provided) | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/GCSE%20Mathematics%20Practice%20Papers%20202122.zip (individual PDFs listed on the support page, e.g. https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M4%20Practice%20Paper_0.pdf) |
| Exemplification of Examination Performance, Grade A and Grade C (2019 scripts) | https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Mathematics%20Grade%20A%20Exemplifying%20Examination%20Performance%202019.pdf ; …/GCSE%20Mathematics%20Grade%20C%20Exemplifying%20Examination%20Performance%202019.pdf |
| Data Handling resources (pptx): Frequency Trees, Listing Strategies, Venn Diagrams, "What happens if…?" | e.g. https://ccea.org.uk/downloads/docs/Support/Data%20Handling%20Resources/2019/Venn%20Diagrams.pptx |
| Problem-solving presentation (ppt, 2021) and support-event slides (2017–2019) | https://ccea.org.uk/downloads/docs/Support/General/2021/CCEA%20GCSE%20Mathematics%20-%20Problem%20solving.ppt |
| Webinars page (Oct 2022 support webinar) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/webinars |
| **Paper Builder** (teacher login; builds bespoke papers + mark schemes from past questions, option to add formula sheet) | https://ccea.org.uk/learning-resources/paper-builder |
| **Topic Tracker** (teacher-only bank of past-paper questions by topic) | https://ccea.org.uk/learning-resources/topic-tracker → https://topictracker.ccea.org.uk/default.aspx |
| BBC Bitesize bespoke CCEA GCSE Maths materials (linked from CCEA subject page) | https://www.bbc.com/education/examspecs/zcq8b82 |
| Summer 2023 "Additional Support Materials" (temporary expanded formula sheets used only in 2023) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/assessment |
| GCSE Guidance Notes: Entry, Re-sit and Aggregation Rules | https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/GCSE%20Guidance%20Notes%3A%20Entry%2C%20Re-sit%20and%20Aggregation%20Rules.pdf |

CCEA does **not** publish separate "eGuides", "fact files" or "formulae sheets" for GCSE Mathematics; the only formula sheet is the one printed on page 2 of each paper (Section 4), and the topic-level support is the Teacher Guidance, Progression grid, Topic Tracker and Paper Builder listed above. Subject Officer: Lisa McFarland (lmcfarland@ccea.org.uk); Specification Support Officer: Nuala Tierney (ntierney@ccea.org.uk).

---

## 9. Chief Examiner's Reports — what was worst answered, per unit

Reports page: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports

### 9.1 Summer 2025 — https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2025/GCSE%20Mathematics%20%282017%29-Summer2025-Report_0.pdf

**M1 (Foundation, calc).** Overview: challenging but fair; Q28 (final, area of a badge made of triangles and rectangles, 6 marks) "proved too difficult… frequently left blank"; candidates struggle to write clear explanations. Worst answered / common errors:
- Q12 writing expressions (h + 5, then 2h + 5): very few correct; "5h" for "5 more than h"; writing "h + 5 =" (not an expression); numerical answers.
- Q16 volume of cuboid then depth of 60 litres: most added the dimensions (140); almost none converted 60 l = 60 000 cm³ and divided.
- Q22 difference between largest and smallest of mixed fraction/decimal list: 2½ read as 2 × ½ = 1; 2 − 0.02 = 1.98.
- Q23 percentage increase when increase given: answers 108%/92% from wrong methods; only the best got 8%.
- Q24 money/notes problem (¼ of 200 notes × £10, ⅗ of 200 × £5 …): first mark only for most; ⅗ of 150 or of 100.
- Q25 45% of 540 then ⅔ of remainder: found ⅔ of 540 instead.
- Q26 solve 3(y − 7) = 18: brackets not expanded (3y − 7 = 18 → y = 8.33); sign errors; trial and improvement.
- Q27 frequency table: mean divided by 4 not 20; range of frequencies instead of values.
- Q10(c) ordering decimals 0.6, 0.605, 0.61 largest to smallest; Q10(a) rounding 43.812 to 1 d.p. (44 common).
- Q13 measuring angle to tolerance; cm→mm (×100/÷10 errors); explaining why an angle cannot be 137°.
- Q14 bar chart: highest bar vs highest total; drawing bars freehand; Q6 area vs perimeter confusion; Q4(b) square numbers summing to 40; Q19 collecting terms with negatives (5c + −2d) and expanding 5(2t + 5); Q20 isosceles triangle angles (angle sum "360°"); Q21 pie chart missing angles (75° each) and explaining 75° ≠ 75%.

**M2 (Foundation, calc).** Overview: AO3 questions challenging; Q8(b), Q21, Q28 frequently left blank; Q19, 22, 25, 26 ("basic concepts with no context") also hard; "most candidates struggled to find the volume of a cylinder". Three flagged misconceptions: 2½ = 1; converting a fraction to a decimal/percentage to find a fraction of an amount (fails for 2/7); answering the question they expect rather than the one asked.
- Q26 volume of cylinder (grade C): **90% scored zero** — used 12 not 6 for radius, circumference instead of area, 12 × 18 = 216.
- Q28 Pythagoras to find a length then area: **<5% correct**; added instead of subtracting.
- Q21 badge area (two triangles + rectangle): most challenging; many zero.
- Q25 form/solve 4a − 2 = 24: "few knew what to do".
- Q19 solve 3(y − 7) = 18: added 18 + 7 then ÷3; no algebraic method.
- Q24 midpoint reverse (find other endpoint): (2, 20) from adding; (3, 8) "midpoint of the midpoint".
- Q22 HCF: listing factors missed some (answer 7); Q23 percentage change of perimeter: stopped at new perimeter 234 or 234/240 = 97.5%.
- Q18 expression in pence (200 − 3x): used £2; included "=".
- Q14 2½ as 1; Q10/Q16/Q17 fraction of amount and multi-step reading; Q8(b) 60 l → 60 000 cm³ then depth; Q3 algebraic notation (5h, 6h); Q11(a) 5c + −2d; Q20 mean from table ÷4/÷10; Q5 measuring/ mm–cm; Q13(c) 75° vs 75% explanation.

**M3 (Higher, calc).** Overview: well designed; most entered at correct level; no time issues.
- Q2 volume given → missing dimension: "three quarters of the entry calculated the volume of the container and could proceed no further" (zero marks).
- Q14 badge area problem: over half failed to score the first mark; "more challenging than anticipated".
- Q10 expression in pence: >70% scored zero.
- Q12 adding algebraic fractions (common denominator): only one third correct; over half could not start.
- Q26 arc length (260°/360 of circumference): many divided circumference by 260 or used area.
- Q21 Pythagoras then area of triangle: more than half no marks; wrong substitution.
- Q24(c) IQR from cumulative frequency: readings in £1000s forgotten; Q24(b) plotting at lower bound/midpoint.
- Q19 surface area of cylinder confused with volume; pressure = force/area link not understood (Q19b).
- Q16 equation of line through two points: only top 10%; Q25 factorising with 4a common factor (very best only) and factorising quadratic (≈30%); Q13 range from a frequency table (¼ correct), mean rounded to 2; Q8 percentage increase (all-or-nothing, 43% zero); Q7 2½ misread as 1; Q3 changing 2/7 to a decimal (accuracy lost); Q22 reverse percentage — forgot to add the £20.64 difference; Q23 LCM — stopped at LCM instead of number of packs; Q20 Venn diagram total including overlap.

**M4 (Higher, calc).** Overview: marks 1–100; "more scores in the 90+ bracket than in previous series". Examiners' list of hardest questions: **Q13 (bounds), Q15(a) (setting up a quadratic from area of a right-angled triangle), Q17(b) (reasoning with circle theorems), Q18 (reasoning about representative samples), Q20 (factorising and simplifying an algebraic fraction), Q21 (adding algebraic fractions), Q22 (histograms, especially estimating the median)**. General weaknesses: use of brackets in algebra; rounding/accuracy; leaving multiple solutions without indicating the final one (worst is marked).
- Q13 bounds: 45 kg used instead of 47.5 kg for "50 kg to nearest 5 kg"; rounding up instead of down; non-integer answer.
- Q15(a) "show that" quadratic: full marks or zero; candidates tried to solve the given equation or "fix" their working; 4x used instead of x + 4.
- Q17(b) circle theorems: needed isosceles triangle + alternate segment theorem; very few full marks; (a) reason "opposite angles in cyclic quadrilateral are equal" (wrong).
- Q18 sampling/representation reasoning: even able candidates "overthought"; those who calculated 30% of 142 scored.
- Q20 factorise & cancel algebraic fraction: difference of two squares with terms reversed; grouping method problems.
- Q21 add algebraic fractions: "only a small number… full marks" — subtraction of more than one term in numerator.
- Q22(a) histogram on blank grid: many zero (no frequency density; scales/labels); (b) estimate median from histogram "continues to cause problems for the vast majority"; (c) stratified sampling: many blank.
- Also: Q12 arc length — majority found the minor arc (6.1 cm) not major (15.9 cm), rounding to 1 d.p. forgotten; Q14 perpendicular line — gradient −¼ known but substitution to find c only by more able; Q16 multi-step trig — early rounding; Q19 reverse percentage (112% = £1008) — subtracted from wrong value; Q4 m² + (m+7)(m−2) → "m⁴"; Q6(b) force from pressure — used volume; Q10(b) solving quadratic — negative root ignored; Q11(c) IQR forgetting thousands; Q8 assumed angle BAC = 90°; Q9 LCM left as 132; Q5 answer left factorised or set = 0.

**M5 Paper 1 (Foundation non-calc, "M51").** Overview: "a large number of candidates at this level still have very poor numeracy skills"; poor written reasoning.
- Q1(b) prime numbers on a spinner: very few; "unfamiliar with… prime numbers"; Q1(a)(ii) 'multiple' unfamiliar.
- Q2 add/subtract money without calculator; ⅓ of £258 (¼ of cohort); 10% of £8 (gave new rate £8.80).
- Q7 44 ÷ 6 → 8 boxes then 8 × £1.75: times tables, rounding down to 7, 44 × 1.75.
- Q9 ⅓ and 35% of 120: ⅓ treated as 30%/33%; 1% × 35 struggles.
- Q10 square + cube numbers summing to 52; triangular number between 40 and 50 (guessing).
- Q12(a) map scale 2 cm = 15 km → 12 cm (15 × 12 = 180); Q12(b) 1:25 000 with 8 cm → 200 000 cm → 2 km: "poorly answered by nearly all… a lot of blank answer spaces".
- Q13 ratio not of the 'share' type (45 boys = 5 parts): added parts to 8 and divided 45 by 8.
- Q14 T-shirt cost with design fee: failed to subtract £60 first / add it back.
- Q15(b) 2/5 of 20: "so few… able to find 2/5 of 20"; Q15(a) explaining why P(red) ≠ ¼ (4/20 or 1/5 answers).
- Q16(b) reverse translation: only the very best; (a) translation without ruler.
- Q3 estimation ignored (398 × 3.1 done exactly); Q8 estimating area × cost (240 from adding); Q11 0.65 + 0.2 = 0.67; Q4 probability from bar chart 3/10 (denominator = axis max); Q6 money notation "0.80p".

**M5 Paper 2 (Foundation calc, "M52").** Overview: answered well; QWC poor.
- Q9 conversion graph: (a) reading £34 500 at 41 000 — "disappointing"; (b) converting 16 000 — "most… no marks… cannot interpret graphical data beyond taking simple readings".
- Q15 rotation 90° clockwise about origin: "most… unable"; reflected or rotated 180°.
- Q6(c) probability of both events on a scale (1/6): very few; marked 2/6.
- Q11(a) describing rule "difference of two dice" (wrote "adds"); (c)(d) probabilities from a sample-space table (8/36, 6/36) — words used instead of fractions; "greater than 3" misunderstood.
- Q10(c)(d) pattern sequences (square numbers) — guessing; Q7 km→miles via steps (16 × 1.6 = 25.6; needed 5 miles = 8 km); Q8 best value with three sizes — insufficient comparisons, price+capacity nonsense; Q13 share £240 in ratio 1:4 (÷4 not ÷5; shared 560); Q5(a) recognising cube numbers; Q12 enlargement lines unruled; Q4 estimation not used; Q14 forgot final subtraction.

**M6 Paper 1 (Foundation non-calc, "M61").** Overview: best answered — units, change, missing probability, translation, perimeter scale factor. Difficult: square + cube = 52, map scale 1:25 000, number of sides of polygon, area scale factor.
- Q9(b) map scale 1:25 000 → 2 km: blanks/yes-no without working; Q9(a) 15 × 12 instead of 15 × 6.
- Q10 ratio (45 boys = 5 shares): added 3 + 5 = 8; poor division (72 ÷ 4).
- Q14 sides of polygon: used 180 instead of 360; "4 rather than 40".
- Q15 angle bisector construction: many drew bisector first then arcs (no marks).
- Q17 binary: blank if not taught; wrong powers of 2; answer "23.0".
- Q18(b) area scale factor: "large proportion did not know the link between scale factor and area".
- Q12(b) 2/5 of 20 (and 2/5 of the remaining 11); Q7(a) 25 + 27; Q7(b) triangular numbers; Q6 35% by 0.35 × 120 without calculator; ⅓ as 30%/33%; Q8 0.65 + 0.2 = 0.67; Q13(b) reverse translation; Q16 reliability of experimental probability (chose nearer to 0.5 rather than more trials); Q11 design fee.

**M6 Paper 2 (Foundation calc, "M62").** Overview: some lost marks on easier M2/M5 prerequisite material; hardest: combined probability on a scale, relative-frequency table, region satisfying loci conditions, graphical simultaneous equations, inequality with brackets.
- Q15 inequality 3(2x + 1) < … : few expanded brackets correctly; replaced < with = and forgot to reinstate; answered x = 5/6.
- Q14 simultaneous equations graphically: needed the line drawn (x = 2, y = 3 without line = 0 marks).
- Q12 loci region construction (line midway + arc from A + shading): "mainly poor… not prepared for this question type".
- Q13(c) indices — only the very best.
- Q11 relative frequency: 0.305 from 1 − sum; 239 from 400 − (20+39+102).
- Q1(c) P(Y and even) = 2/12 = 1/6 on a scale: two arrows drawn.
- Q4(b) conversion graph — reading at 32 000 and halving; own conversion rates got nothing; Q2 16 × 1.6 = 25.6 or 16 miles; Q3 best value — price × capacity invalid; Q8 ratio share of £240 (÷4); Q9 stopped at 47; Q10 rotation — reflected in y-axis; Q5(b) 20 squares for pattern 5.

**M7 Paper 1 (Higher non-calc, "M71").** Overview: differentiated well; some candidates better suited to M8 or M6; read questions ("estimate"); make 1/7 and 0/6 distinguishable.
- Q16 standard form + 30% increase: only a small percentage; forgot to add on; 9 × 10⁸ written as 9 × 8 = 72; answer not returned to standard form.
- Q17 indices (zero, negative, fractional): (a) "3 or 0", (b) −8, (c) −1000/−30, (d) y left in; (b),(c) better than (a),(d).
- Q15 simultaneous equations needing both equations multiplied: trial & improvement = 0; add/subtract errors; stuck at 19x = 152.
- Q11 angle bisector: arcs from N and P, or perpendicular bisector; many omitted.
- Q5(b) 1:25 000 scale: "1 cm = 25 000 km"; could not convert 200 000 cm.
- Q10 sides of polygon: 180 ÷ 9 = 20, 180 − 9 = 172; many no marks.
- Q14 length vs area scale factor (5 and 5; 10); Q7 design fee ignored (40 T-shirts = £380); Q2 square/cube/triangular numbers; Q3 35% via 0.35 × 120; Q8(b) 2/5 of 11; Q12 reliability "even number of flips"; Q13 binary place values reversed.

**M7 Paper 2 (Higher calc, "M72").** Overview: write down what is keyed in (e.g. 0.70 × 800 = 560); "800 × 0.7 = 56" seen on a calculator paper.
- Q13 change subject where x appears twice (5x = vx + 4y): few full marks; x left on both sides; "a lot of incorrect work".
- Q15 reflection in y = x then enlargement SF 0.5 centre (−4, 0): reflected in wrong line (axes, y = −x); centre misused.
- Q12 tree diagram: branches unlabelled or swapped; (b) added 0.3 + 0.1 instead of multiplying.
- Q11 inequality: answer without inequality sign penalised; 6x < 5 → x < 1.2; bracket expansion 6x + 1.
- Q10 graphical simultaneous equations: solution without line = 0; x/y mixed in table.
- Q9(c) indices: d³⁰ ÷ d¹⁰ = d³; Q8 loci region (tolerance; use dark pencil); Q4 ratio share (÷4; shared 560); Q7(a) 0.305; Q6 rotation about wrong point/anticlockwise/reflection; Q14(b) 40 − 3 (product rule); Q3(d) ratio used for probability.

**M8 Paper 1 (Higher non-calc, "M81").** Overview: this series the non-calculator paper was harder than the calculator paper, especially in the second half.
- Q11 equation involving surds: fewer than half gained even one mark; only the strongest full marks.
- Q10 inverse variation + algebraic manipulation (grade A): top 20% correct; a quarter no marks.
- Q13 coordinate geometry of the circle (gradient of tangent → equation of radius → intersection → equation of circle): just under 20% completed.
- Q14 surd manipulation and rational/irrational reasoning: sign errors common.
- Q7 standard form with percentage increase: over a third no marks; ~40% full marks.
- Q9 ratio of heights/volumes of a cylinder given ratio of areas: stronger candidates only.
- Q8 indices: index 0 fine, −1 many, −3 only better candidates.
- Q6 simultaneous equations needing both multiplied (multiple of 19): over half completed.
- Q12 recurring decimals to fractions and subtract: most got one mark; Q2 angle bisector (some used protractor); Q1, Q3, Q4, Q5 (polygon sides, reliability, binary, perimeter/area scale factors) well done.

**M8 Paper 2 (Higher calc, "M82").** Overview: more accessible than Paper 1.
- Q14 area formula then cosine rule (6 marks): nearly a third full marks; weaker candidates "could not determine a logical starting point".
- Q12 space diagonal then angle: majority found the diagonal; fewer than half identified/calculated the angle.
- Q11 sine rule: "many completely correct… and many incorrect approaches".
- Q8 combined transformations (reflection in y = x then enlargement): just over 40% correct; 30% no understanding.
- Q9 describing an enlargement: majority named it; only a minority gave centre and scale factor correctly.
- Q6 change subject (x terms both sides): under half full marks; over a third didn't gather terms.
- Q7(b) discounting repeats in combinations: just under half; Q5 inequality (nearly 70% correct; sign dropped); Q13 probability without replacement (A\* question): >70% full marks; Q10 tree diagram ~75% full marks; Q4 graphical simultaneous (>80%); Q3 algebraic indices (¾ all correct).

### 9.2 Summer 2024 — https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2024/GCSE%20Mathematics%20%282017%29-Summer2024-Report_0.pdf

Subject overview: performance "now generally comparable with pre-Covid standards"; a minority entered for the wrong paper.

**M1.** Overview: fair, most >40%; some candidates had no calculator or wrong calculator mode. Hardest:
- Q25 average speed for a whole journey: "beyond… practically all"; (30 + 54)/2 = 42 mph.
- Q27 circumference of tables to buy edging: "very few… considered… circumference"; £37.50 from 2 × 15 × £1.25.
- Q29 solve 5(2y + 3) = 79: "most… no marks"; brackets expanded wrongly.
- Q30 Venn diagram completion (3 marks): 15 outside placed; few completed 35 and 20; (b) rarely correct.
- Q14(b) median of 12 values (two middle values) and interpreting wettest day/month; Q15(a)(ii) 45 as a fraction of 120 ("not even fractions"); Q15(b) pie charts with different sample sizes; Q21 substituting into P = ne/s (16 and 3 written as 163); Q23 comparing means and using "range" (word required); Q5 1000 ml in a litre unknown ("basic functional knowledge"); Q11(a) time difference 21:55 to 06:06 (calculator 2155 − 606 = 1549); Q13 area of fence and rounding tins up (45 from rounding down); Q18(b) plan view of a 3D shape; Q19 angles in quadrilateral + straight line; Q4(a) naming a kite; Q22 flow diagram (81 as prime); Q24 ⅓ off vs 15% off; Q28 multi-step hats problem (¼ of remaining rather than total); Q17 calculator use (order of operations, fraction display 14/5 → set mode).

**M2.** Overview: "no questions at grade C in which more than 30% gained full marks"; some had no calculator; multiple methods offered.
- Q29 form an equation as instructed: "1% of the total candidates" did; Q30 final question: little valid method.
- Q19 circumference (ribbon round circular tables): "vast majority… zero"; only 4% correct.
- Q24 Pythagoras (find shorter side): "over 80%… no marks"; hypotenuse formula used.
- Q26 estimated mean from grouped table (no blank columns given): "75%… no marks; only 15%… correct"; divided by 6 not 50; (b) median class similar.
- Q23 Venn diagrams: "fewer than 10%… complete correctly".
- Q27 compound interest: simple interest used, percentages added; "one in ten" fully correct.
- Q25 area of trapezium then divide volume by it: rarely; Q18 average speed: "very few… any marks" (57 miles total not found); Q21 solve 5(2y+3) = 79: "more than half did not multiply out the bracket correctly"; Q28(b) product of primes without × signs; Q17 ⅓ as 30%/33%; Q16 mean vs range confusion; Q12 angles on a straight line misconception; Q14 formula substitution (163); Q15 81 not recognised as square; Q1(b) inverse of a formula (÷2 then −15); Q3(a) time intervals; Q5 7 m² read as 7²; Q6 10% of £1950 then wrong operation; Q7(b)(ii) "Declan"; Q10 points plotted but no line drawn; Q22(a) "positive" without "correlation".

**M3.** Overview: marks bunched in the middle; "from Question 21 onwards… apparent drop"; algebra (forming expressions/equations Q21, 25, 28) weak; Pythagoras (Q16) and trig (Q23) below usual; cumulative frequency/box plot (Q26) notably weak; speed (Q10) only the very best.
- Q28 set up quadratic from information then solve: "only a handful" for (a); (b) often blank.
- Q21 form and solve linear equation: only the very best; trial and improvement instead.
- Q22 reverse midpoint (find a and b): poorly answered.
- Q25 quadratic expression for area: product of brackets left unexpanded; 12x instead of 12x².
- Q26 cumulative frequency: median read at 12.5 on x-axis; IQR unfamiliar; comparisons must interpret ("on average… greater median"; "less consistent… greater range").
- Q27 reverse percentage (£726 = 128% → £575): majority subtracted 28%.
- Q23 trigonometry (stepladder): did not split into two right-angled triangles.
- Q16 Pythagoras: added squares — "3 marks or 0".
- Q17 length of trapezium-prism given volume: order of operations in ½(a+b)h; stopped at 36.
- Q24 cylinder + hemisphere volume, 90% full, round down to 16 cups; Q10 average speed; Q11 circumference (area found instead; whole metres); Q19 compound interest with different yearly rates (simple interest, added rates, 0.5% as multiplier); Q20(b) HCF (gave LCM 630); Q4(b) plan drawing; Q2(b) points plotted, line not drawn / gradient misused; Q14(a) relationship vs correlation; Q15 Venn overlap ignored; Q8(b) "range" wording; Q9 ⅓ as 0.3; Q6 formula substitution 163; Q1 calculator functionality (fraction key).

**M4.** Overview: marks 1–99; several markers felt many M4 entrants "would have been better suited sitting M3". Hardest: **Q12(a) setting up a quadratic via Pythagoras; Q15 estimating a population from samples (28% full marks); Q17 perpendicular line when the given line must be rearranged to y = mx + c; Q18 harder difference of two squares and adding algebraic fractions incl. a whole number (9% full marks in (b)); Q19(c) circle theorems (6% full marks); Q20 proving surface areas of a sphere and cube can never be equal (7%); Q22 quadratic from areas of a square and trapezium (5% full marks; most challenging)**; Q23 equation with algebra in denominators (18%).
- Other errors: Q12(b) solving the quadratic (40 and 6 from wrong factorising); Q7 reverse midpoint; Q8 trig in isosceles triangle (1.4 m not halved); Q9 cylinder + hemisphere (sphere used; 90% forgotten; rounding); Q10(a) CF median not on a grid line, IQR scale; (b) comparing IQRs — use "spread/variation"; Q11 reverse percentage (28% subtracted or 72% used); Q13 quadratic expression left as brackets; Q14 multi-step trig (40% full marks); Q16 bounds (u², 2a errors); Q21(b) histogram reverse reading (all or nothing); Q1 Pythagoras rounding 12.9; Q3(a) grouped mean ÷6 or mid-points; Q4 compound interest (simple interest 2 marks); Q5(b) HCF vs LCM; Q6 forming linear equation (13x); Q15(b) faults/improvements in sampling.

**M5 Paper 1.** Some candidates lacked ruler/protractor. Hardest: Q17 medals problem (63 = 7/10 of total): "few… meaningful attempts"; 100 − 63 = 37. Q11 6% of 700 then subtract: many never started; 700 ÷ 6. Q12 scale drawing of triangle: not drawn; measured given diagram; 10.5 cm → 100.5 m. Q8(a)(ii)(iii) explaining probability statements ("over half" → must be > 0.5; even number of cards). Q6 sharing 21 so one has 5 more (16 and 5); age problem ÷2 twice. Q15 missing probability (0.3 read as 0.03 → 0.46); Q16 translation (one direction only, non-congruent shape); Q14(b) proportion (24 × 3 = 72); Q7 estimation ignored; Q4(b) line symmetry; Q3 ounces; Q9(b) using 5th not 6th term.

**M5 Paper 2.** Some candidates had no calculator. Hardest: Q15 ratio (800 ml and 2100 ml cordial → 2800): "very little understanding… 2900 ml" or 2900 ÷ 4 = 725. Q4 enlargement scale factor (64 or 8 given instead of 4) and deciding if an enlargement is correct (answered "can't tell"). Q6 drawing a conversion graph (points misplotted, (−5, 23), bar charts drawn) and reading at 22 °C / 27 °F. Q8 describing a reflection ("mirrored/flipped"; "in x", x = 0). Q13 angles in a pentagon (540° unknown; 360° used). Q14 percentage voting from two columns; Q9 gallons→litres then cans (÷4.5; 14.4 not rounded up); Q10 marathons vs km (31 days in June; mixed units); Q11(a) probabilities with wrong denominators; (b) relative frequency 160 "estimated" as 200; Q12 oysters per dive (Colin chosen); Q3(a) "unbiased" = fair; (c) all quadrilaterals → certain; Q1(b) ¼ of a number whose ⅓ is 16; Q7 sequence rule.

**M6 Paper 1.** Best: estimation, sequences, outcomes table, tutoring pay, ice-cream scoops, translation. Hardest: Q12 medals probability (63 = 7/10; 21 or 37 given); Q13 quadratic graph (substitution, symmetry, turning point below −4, reading both roots); Q14 sides of polygon from interior 140° (exterior 40 found then stuck; (n−2)×180 trial); Q15 inequality x + (x + 3) > 4 → x > 5.5 ("x = 5.5" given); Q16 describing a single rotation (angle/direction/centre; extra transformations added); Q3(a)(ii)(iii) probability explanations; Q6 6% of 700 without calculator (1/6 of 700; 1% = 10); Q7 scale drawing (10.6 → 100.6); Q2(b) 84 ÷ 2 ÷ 2; Q10 0.3 as 0.03.

**M6 Paper 2.** Best: delivery comparison, sequence, best diver, index a. Hardest: Q1 enlargement scale factor (64/8) and checking an enlargement; Q3 conversion graph (misplotted, reading at 21/22.5, negative value at 27); Q12 cordial ratio (2900; 725); Q15 trial and improvement (3.55 not tested; 3.5 without test value); Q13 combined probability (added 4/6 + ½ = 5/8; 5/6 used); Q16 final probability question 35/101 (only the best); Q14 indices (3 instead of 8); Q10 pentagon angles (540°; 184 not halved); Q5 describing reflection (x-axis / y = 0); Q6 gallons (16 ÷ 4.5); Q7 marathons (conversion factors); Q8(b) relative frequency estimate (600 ÷ 30 = 20 then stuck); Q9 oysters per dive; Q11 percentage voting.

**M7 Paper 1.** Overview: read the question (Q3 said "use a scale drawing"; Pythagoras gained nothing); show working; write figures clearly. Hardest: Q9 form and solve inequality x + (x+3) > … ("3x" for Joanne; x = 5.5 instead of x > 5.5; many no marks); Q10 quadratic graph — table values (−2, −4 errors), curve flat between points, roots not both given, line y = 2x − 3 not drawn, intersections rarely given; Q15 standard form with different units (1.05 × 7 for 1.05 × 10⁷; g vs kg); Q16 ratio of areas → lengths (SF 4 found; 15 ÷ 4 instead of 15 ÷ 2; answer 7.5); Q11 sides of polygon (exterior 40°, then stuck); Q12 single rotation description (turn/clockwise/point); Q13 simultaneous equations (added instead of subtracting; trial and error = 0); Q8 medals 7/10 (100 assumed); Q14 volume difference (added numbers); Q5(b) 24 ÷ 4 = 6 then stopped; Q1 6% of 700; Q2 estimation; Q6 missing probability "1/5".

**M7 Paper 2.** Overview: use the calculator (Q8 totals); show what is keyed (0.2 × 0.3 = 0.06); read carefully (miles vs km in Q4). Hardest: Q14 direct proportion with square (√45 given; x not squared → 11.25; correct 7.5 rare); Q15 reflection in y = x then enlargement SF ½ centre (7, 2) (reflected in y-axis; erased work); Q16 probability of two dice outcomes (added; only (1,4),(2,3) counted; 0.156 correct); Q9 cordial ratio (2900; 725); Q12 trial and improvement (3.55 not checked; 3.5 alone can be 0 marks); Q13 probability 35/101 (⅓ used for 0.3; stuck at 66 girls); Q1 describing a reflection in the x-axis ("flipped", "x line", y = x); Q10 sample space 4/12 (added fractions); Q5(b) 160 estimated as 200 or 160/600; Q7 pentagon 540°; Q3 gallons ÷ 4.5; Q4 unit conversion; Q8 percentage voting.

**M8 Paper 1.** Overview: good paper, stretched A\* candidates. Hardest: Q12 Pythagoras, surds and areas in a complex situation (A\* differentiator; most made some progress); Q10 indices simplification ("very mixed"; ¼ full, ¼ zero); Q9 multiplying three simple fractions (added; (2/10)³ = 6/30 or 8/100; only two repetitions); Q1 inequality (over a quarter couldn't write it; sign lost → "="); Q8 area SF vs length SF (>40% correct); Q7 standard form with different units (sizeable minority ignored units); Q2 polygon sides (exterior angle step missed); Q3 rotation description (nearly half full); Q4 quadratic graph — both roots, intersections with line, "which line to draw" (only the strongest); Q13 matching graphs (over a third all four); Q5 simultaneous equations (very well); Q6 combinations (very well); Q11 non-replacement probability (majority full marks).

**M8 Paper 2.** Hardest: Q12 closing A\* trig (cosine rule + sine rule + area with an added line): about one sixth full marks; Q10 chord/tangent/equation of circle proof: over a quarter proved the chord equation, ~10% stopped at gradient, only the strongest completed part 3; Q9(c) gradient of tangent to exponential graph (only better candidates drew a tangent); Q6 combined transformations (reflection in y = x too difficult for weaker; nearly half full); Q7 wordy probability (about half); Q4 biased dice twice (thirds: full / forgot both orders / didn't know); Q5 direct square variation (fraction at the end); Q1 probability of two events (added; "less than 5" included 5); Q11 3D angle between diagonal and base (over half full marks); Q3 trial and improvement (>60% full; final check forgotten); Q8 tree diagram (labels omitted).

### 9.3 Summer 2023 — https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2023/GCSE%20Mathematics%20%282017%29-Summer2023-Report_0.pdf

(Extracted by a delegated full read of the downloaded report; key statistics spot-checked against the text. Note: the Summer 2023 papers were sat with the temporary "Additional Support Materials"/help-sheet inserts of that year.)

**Subject overview:** papers differentiated by outcome; no time or language issues; a minority would have been better entered for the next lower tier; Covid disruption has "left gaps in basic mathematical skills of many pupils".

**M1 (Foundation, calc).** Overview: "fairly difficult"; Q1–9 straightforward; knowledge gaps in the circle question (Q8) and units of measurement (Q4); many blanks from lack of knowledge. Worst answered: Q21 qualitative/discrete/continuous ("mostly guessed"); Q4 units (0.6 g for a 10p coin, 6 cm for a smartphone); Q8 circle — mark a point on the circumference, draw a radius, measure the diameter in mm (640/6400 instead of 64); Q22 volume and external surface area of an open box from a net (units missing, areas summed); Q25 equation with a bracket ("little understanding"); Q26 angles with reasons ("Z angles" not credited); Q20 perimeter expression/solve (2a + 3 as 5a; a = 10.5); Q15 formula substitution 20 × 11 + 45 (65 from 20 + 45); Q17 pie chart (÷100 not ÷360; wrong protractor scale); Q27 Venn (answer 2 from ignoring the overlap); Q13 base area → gravel (volume found; 13.5 rounded to 14); Q10 "£50 off" read as 50% off, ⅓ as 30/33%; Q11 "33% < ⅓" false; Q23 100 minutes in an hour, 45 min ≠ 0.75 h; Q24 percentage loss from £54 not £126; Q28 stem-and-leaf key/order; Q1(b) 78 million in figures.

| M1 Q | Topic | Verdict |
|---|---|---|
| 1 | 100 − 19%; 78 million in figures | (a) fine; (b) "often adding 4 zeros" |
| 4 | Choosing units | Poor |
| 8 | Circle: circumference point, radius, diameter in mm | Poor — "only the very strongest" |
| 10 | Best offer 25% / ⅓ / £50 off | Poor |
| 13 | Base area → gravel (13.5 kg) | Poor |
| 15 | Formula (cooking time) + h/min | Poor |
| 17 | Pie chart measure/interpret | Poor |
| 20 | Perimeter expression; solve | Poor |
| 21 | Data types | Guessed |
| 22 | Open-box volume / surface area | Poor |
| 23 | Timetable; average speed | Discriminator |
| 24 | Percentage loss | Poor |
| 25 | Equation with bracket | Poor |
| 26 | Angles with reasons | Poor |
| 27 | Venn diagram | Poor |
| 29 | Tuck-shop cost/profit | Accessible |

**M2 (Foundation, calc).** Overview: all questions attempted; explanations not "clear and concise"; protractor problems; "show your working" misunderstood on calculator papers. Worst answered: Q12 (topic evidently untaught — "few candidates got any correct… Teachers should ensure that all material on the specification is taught"); Q14 angles with reasons ("almost no candidates scored full marks"); Q23 open box surface area then Pythagoras ("very few saw Pythagoras"); Q21 real-life graph — gradient meaning ("little was correct" after the delivery charge; gradient 1.5 by counting squares); Q22 expand and simplify (only −14y right; squared term missed); Q16 equation with bracket (subtract 2 then ÷4); Q6 formula → "2 hours 65 minutes"; Q11 perimeter with two variables; Q25 semicircle radius (÷2 instead of subtracting); Q15 percentage loss without subtracting; Q17 Venn (22 placed first); Q24 midpoints for estimated mean (used bounds); Q20 compound interest done as simple; Q13 45 min → 0.75 h (answers 1.2 or 12); Q3 volume instead of base area; Q1 ⅓ as 30/33%, "£50 for 50%".

**M3 (Higher, calc).** Overview: marks bunched 45–65%; blanks in the last third; many should have sat M2; algebra weaker than usual (Q3, 8, 15, 21); reasoning/communication weak (Q2, 10, 12b, 14b, 16, 17b, 25b); time and speed (Q5) and linear relationships (Q14) need focus. Worst answered: Q10 angles with reasons ("most disappointing… despite being a lower grade question"; alternate angle rarely identified); Q18 reverse percentage (£10 225 = 81.8%; most found 18.2% and subtracted); Q24 curved surface area of a cylinder with a 1 cm overlap ("very few fully correct"; volume formula used); Q21(b) solving a quadratic by factorising ("very, very few saw the link"; x = 5 by trial); Q14 real-life gradient ("alien to very many"); Q15 expanding brackets (a quarter correct; no 2y × 3y term); Q5 time/speed ("tens rather than 60ths"; 54 ÷ 45); Q7 percentage loss (just over half); Q11 Venn ("all or nothing"); Q6(b) diagonal of base via Pythagoras ("most simply recorded 45 cm"); Q22 line through two points (midpoint given instead); Q19 fractional equation (~10% full; decimals lose accuracy); Q9 profit (115 items already sold ignored); Q23 trig with boy's height in cm; Q25 box plot (five given values plotted; UQ 20 missed). Well done: pie chart (Q4), stem-and-leaf (Q12), estimated mean (Q17), product of primes (Q20).

**M4 (Higher, calc).** Overview: marks 4–99; last 4–5 questions left blank more than usual; many better suited to M3. Examiners' list of hardest: **Q13 cylinder curved surface area with overlap; Q15 bounds with distance/speed/time (1 h 10.5 min); Q16 perpendicular line; Q17(b) circle-theorem reasoning ("majority obtained zero"); Q19 difference of two squares with a fractional coefficient and three-variable factorising (majority zero); Q20 quadratic from a trapezium area (mean 1 mark; majority zero); Q21(b) median from a histogram; Q23 apex angle of a sector forming a cone ("rare… to make the correct link")**. Also: Q7 reverse percentages (mean 2 marks; 18.2% added/subtracted); Q10(b) solving the linked quadratic ("very poorly"; positive root only); Q2 gradient meaning (1.5 by counting squares; "cost per day"); Q12 added 85 instead of 0.85 m; Q22 fractional equation → quadratic (negative root ignored; 2 d.p.); Q1 compound interest rounding (£4820.50); Q4 semicircle ÷2 instead of subtract. Well answered: Q9 product of primes ("best answered"), Q18 stratified sampling, Q17(a), Q21(a), Q3, Q5, Q6, Q8.

**M5 Paper 1 (non-calc).** Worst: Q7(b) 972 ÷ 36 by a "similar method" (kept estimating; long division errors); Q5 probability scale (words instead of letters — "disappointing"); Q12 using 23 × 146 = 3358 to find 2.3 × 1.46 and estimating (200 × 30) ÷ 0.5 (3000 common); Q14(a) describing a translation ("translation" used "a couple of times" in the whole cohort; "three across"); Q9 fraction/percentage table (blank); Q13 pass-rate percentages (46%, 90%, 10%); Q2(b) pattern term (32 instead of white counters); Q3 25% of 84p (50% twice → 21p); Q4(d) gauge intervals (£620); Q6 probability with denominator 16 from axis; Q10 conclusion "beat < 1 second" (very few); Q1 6.5 × £7 (42; "£45.5"); Q14(b) no ruler/protractor.

**M5 Paper 2 (calc).** Overview: "probability and basic points of a compass were problematic"; drawings untidy. Worst: Q15 distance–time graph — time spent (4.3/4.30 for 4.5 h) and average speed "beyond the capability of the vast majority" (20/0.3, 20/30); Q13 writing 500 g : 750 g : 1 kg as a ratio ("many ignored ratio altogether"; 1 kg → 100 g) and better value; Q5 tiling (16 000 ÷ 20 instead of ÷ 20²; 10 + 4 = 14); Q1 compass directions (south-west vs south-east); Q12(a) reflection in the x-axis ("disappointingly high number unable"); Q12(b) enlargement (scale factor added); Q14 probability table (decimals summed as integers → 0.4) and relative frequency (1800 ÷ 3); Q11 polygon angle sums via triangles; Q7 scale drawing tolerance/feet conversion; Q10 early rounding of £14.66; Q4 sequences (25 + 9 = 34).

**M6 Paper 1 (non-calc).** Overview: some topics not covered ("a few highlighted this fact by adding comments on their papers"). Worst: Q13 relative-frequency table and estimate 2300 ÷ 0.23 ("undoubtedly the hardest question"; 100 − 88 = 12; 0.81 → 0.19; only the very best reached 10 000); Q11 reflex bearing ("too difficult for the majority"); Q14 graphical simultaneous equations (algebraic solution scores nothing; line wrong); Q12 nth term (13, "+3", "n3", −2n + 3); Q10(a) describing a translation ("translation" omitted; direction missing); Q3(b) exact division after estimating (÷3 then ÷6 → 54); Q8 3.358 and 3000; Q9 15 + 8 = 23 → 46%; Q6 explanation marks; Q1 probability line counted in tens.

**M6 Paper 2 (calc).** Best: unit comparison, listing combinations, exchange rates, enlarging a rectangle. Worst: Q9(a) writing a ratio (½ : ¾ : 1 partial); Q14(b) changing the subject ("nonsensical rearrangements"); Q15(a) sides from exterior angle (180/15 = 12) and (b) congruence (evenly split); Q17 locus (arcs but no horizontal line halfway between A and B); Q11 distance–time graph ("very disappointing"; "11 to 3.30", 4.3 h; 40 mph not seen); Q1 tiling (16 000 not ÷ 400); Q12(b) inequality (">" symbol "seems to scare candidates"); Q10 relative frequency 1800/0.3 = 6000 ("had to be less than 1800"); Q7 decagon via quadrilaterals; Q6 rounding 264/18.

**M7 Paper 1 (non-calc).** Worst: Q12 Pythagoras (√5) then perimeter of a semicircle in terms of π ("most unable"; forgot 2r; used area; used 3.14); Q8 relative-frequency table (0.22, 27) and estimate 10 000 ("guessing values"); Q4 probability of "not q" as 1 − q (answers "100 − q", "50%", "x − q"); Q10(b) linking a sequence to square numbers; Q13 independent vs mutually exclusive (guessed); Q10(a) nth term 3n − 2 (3n + 2, n + 3, 13); Q7 translation ("move/slide"; vector written (9 3) or (3, 9)); Q9 graphical simultaneous equations (intersection not stated); Q11 index laws (indices reversed); Q6 46% and 90%/10%; Q5 3.358 and 0.5 estimation; Q2 interpreting 63 bpm; Q3 ratio not allowed for probability.

**M7 Paper 2 (calc).** Worst: Q15 proportion R ∝ v² ("many did not seem to know this topic"; square omitted; square root used); Q14 similar shapes (3x/x wrong; 4/3 rounded to 1.3; adding instead of scaling); Q16(b) combined probability (added instead of multiplied; tree unlabelled); Q13 locus (no horizontal line); Q11 number of sides from exterior angle (24 then ±2 or ÷2); Q8(b) inequality (sign not restored; "−3" only); Q9 rotation (wrong centre); Q10(b) show 3m = h − y; Q5 better-value comparison (20% of 500 error); Q7 20/30 not resolved to 40 mph; Q6 1800 ÷ 3 = 600; Q1 "£20.9"; Q2 rounding 14.66.

**M8 Paper 1 (non-calc).** Overview: introductory questions "more challenging and possibly off-putting than anticipated"; "surprising how many candidates had difficulty in multiplying fractions"; hurdles: area/volume scale factors, surds, coordinate geometry. Worst: Q10 surd manipulation (A\*; "most challenging"; partial marks for expanding only); Q12 line/circle intersection and equation of a diameter (A\*; trial and error with a sketch; gradient known but not the equation); Q9 volume scale factor 8 ("the majority of candidates doubled the volume"); Q5 perimeter of a semicircle equal to a triangle's — find radius (a quarter could do neither; diameter omitted); Q1 relative frequency 500 × 0.23 (just over a quarter full marks; frequencies added); Q8 P(one of two independent events) — fraction multiplication errors (1/3 × 2/5 = 3/15); Q6 "independent"/"mutually exclusive" (fewer than half knew); Q7 negative-scale-factor enlargement (40% full / 40% zero; wrong centre); Q11 non-replacement probability (fraction multiplication). Good: Q2 graphical simultaneous (>60%), Q3 nth term (~75%), Q4 standard form.

**M8 Paper 2 (calc).** Overview: "more manageable than Paper 1"; unexpected zeros on exterior angle of a polygon and on locus. Worst: Q13 A\* AO3 algebra problem (just over a third scored; only the strongest full); Q4(b) congruent vs similar (just over a third; "confuse 'congruent' with 'similar'"); Q4(a) 180 ÷ 24 and (n − 2) confusion (~70% ok); Q5 perpendicular bisector/locus (just over half; no horizontal line); Q8 direct square proportion (large proportion could not start; over a third full); Q10 multi-step trigonometry (~40% full; over 40% no correct first step); Q11(b)(ii) tangent for rate of decay (only the best); Q12(b) angle between space diagonal and base (only half knew which angle); Q6 pie chart vs raw data reasoning (generic); Q7 line of reflection (nearly half). Strong: Q9 tree diagram (>80%), Q2 binary/subject (>70%), Q3 rotation (~75%).

**General advice (Summer 2023):** read bold words ("£50 off" ≠ 50%; "not"); check sense (decimal hours, probabilities > 1, estimates larger than the population); show what is keyed into the calculator; bring calculator, ruler, protractor; money to 2 d.p. (£73.30, never "£45.50p"); state units; do not round early — write the full calculator display in bounds questions; use the formula insert; put the intended solution on the answer line ("the worst solution is marked"); give reasons for angles ("Z angles" earns nothing); name transformations fully ("translation… three right, nine up"); probabilities as fractions, never words or ratios; reverse percentages start from "81.8% = £10 225"; product of primes with index notation and × signs; keep the inequality sign; teachers should ensure "all material on the specification is taught".

### 9.4 November 2025 — https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2025/GCSE%20Mathematics%20%282017%29-November2025-Report_0.pdf

(Extracted by a delegated full read of the downloaded report; key statistics spot-checked against the text. November cohorts are smaller and skew towards Foundation/resit candidates.)

**Subject overview:** papers accessible and well differentiated; most attempted all questions and showed working; no time problems.

**M1.** Overview: marks single figures to high 80s; candidates "often find difficulty accessing marks in questions testing their ability to communicate mathematical reasoning"; "not checking their work or rereading questions". Worst: **Q29 alternate/corresponding/co-interior angles** ("very poorly attempted by nearly all"; answered "acute/obtuse" or numbers); **Q26 5/8 + 1/3 then 1 − 23/24** (6/11 from adding tops and bottoms; product 5/24; "few competent using the fraction button"); **Q21 angles in two triangles** (312° summed then subtracted from 360° and halved); **Q18 prime and square numbers between 20 and 30**; **Q30 flow charts** ("divisible" not understood); **Q32 rectangles inside a 60 cm square** (final AO3; few understood); Q22 3D shapes (cuboid named "cube/rectangle"; edges/vertices transposed; net of a cylinder → "circle"); Q6(b) drawing a rectangle from a given diagonal ("very disappointing"), 6.3 cm → mm (×100, ÷10, or rounded to 60); Q23 Venn (overlap 28 − 12 not found); Q24 one number as a percentage of another (0.35 without ×100); Q11 place value difference of the 8s in 2835 and 4283 (752, 600, 100); Q14 8.3 kg ÷ 125 g (unit conversion; 66.4 not rounded down); Q9(b) pension contributions (few beyond £81); Q19(b) solving 3x − 2 = 5.5 (7.5 or 22.5); Q28 quadrilateral with 4x and 3x (189 ÷ 3 and ÷ 4); Q31 criticising a sample vs a questionnaire ("sample too small"; same reason twice); Q5(b) volume of a cube structure (faces counted, hidden cubes ignored); Q4(c) shading 25% (four squares); Q12(b) inverse of a formula (÷2 then +1 → 6.5); Q15(c) effect on mean; Q25 rounding to 2 d.p. (1.34; BIDMAS ignored → 51.35); Q27 12% profit (forgot to add £10 080); Q13(c) measuring angle (no protractor).

**M2.** Overview: many "lack basic skills" — percentage of an amount, one quantity as a percentage of another, two-step equations, adding fractions, parallel-line angles; candidates prepared for "one particular version of a question"; some scored >90 and should have entered M3. Worst: **Q26 square number from a product of primes (>80% zero)**; **Q28 circumference/area of a circle (75% zero, 7% correct; formulae not recalled; diameter/radius)**; **Q18 adding fractions ("four candidates out of every five made no valid attempt")**; **Q24 area problem (70% zero, 5% correct)**; Q21 (3-mark question, ~75% zero — "clearly an area that needs attention"); Q14 two triangles' angles ("vast majority scored zero"; 360° assumed); Q16 one number as a percentage of another (more than half zero); Q29 Pythagoras in context ("unable to spot it"); Q15 Venn (a quarter); Q20 quadrilateral 3x/4x (20%; "3° and 4°"); Q25 15% decrease then increase (one in three zero); Q27(b) meaning of gradient; Q30 estimated mean (÷4 groups); Q13 3D shapes (under 60% cuboid; 40% cylinder net); Q17 rounding to 2 d.p. (almost half could not); Q11(b) "only half… able to solve this very straightforward equation"; Q6 "100 g in 1 kg"; Q3 place value; Q4(b) inverse operations order; Q12(b) bonds problem (<20%).

**M3.** Overview: "performance from Question 20 onwards declined rapidly, even on routine type questions such as trigonometry in Question 24"; gaps in Q13 (parallel lines), Q14 (flowcharts), Q18 (prime factors/squares), Q23 (extrapolation); generic rather than contextual reasoning. Worst: **Q26(b) explaining IQR vs range ("the poorest response on the entire paper"; needed "range affected by the high maximum")**; **Q24 trigonometry (<20% full; identified cos but could not rearrange; used tan)**; **Q13 parallel-line angles (>70% wrong on (a), >60% on (b))**; **Q31 equation of a line through two points** (midpoint found; negative gradient missed; intercept misunderstood); Q23(a) extrapolation ("32 kg not plotted"); Q25 pressure (base area vs length/volume/surface area; no square root); Q28 factorising (about a third; sign errors); Q19 real-life linear graph (very few full; cost per point); Q10 fractions (23/24 given as final); Q21 trapezium perimeter via Pythagoras (Pythagoras result given as final; squares added); Q22 grouped mean (rounded; ÷ number of groups; bounds not midpoints); Q30 reverse percentage/depreciation; Q17 two decreases instead of decrease then increase; Q5 3D vocabulary; Q6 two triangles (360°); Q7 Venn (about half); Q26(a) box plot (five given values plotted); Q29 fractional equation errors; Q20 ¾ of circle not taken; Q15 sample criticism generic.

**M4.** Overview: marks 18–99; "hardly any questions were left blank"; hardest: **Q22(b) dividing algebraic fractions (5% full)**; **Q20(c) circle-theorem reasoning (6%; reasons omitted "opposite"/"cyclic")**; **Q11(b) box-plot reasoning (9%; generic "IQR excludes extremes")**; **Q10 pressure on a pyramid base ("area in contact" — used volume of cube, ÷4 instead of √)**; **Q19 quadratic from an L-shape area (overlap ignored; 122 cm² unused; negative root kept)**; **Q18 perpendicular gradient → coordinate (top only)**; **Q23 histogram (frequency-density scale), median from histogram, stratified sampling (top only)**; Q24 fractional equation with algebraic denominators (negatives; b² without brackets in the formula); Q17 bounds in Pythagoras (~30% full; bounds applied after calculating; 3.86 rounded); Q16 line through two points (minus missed; Δx/Δy; c = 8 not recognised); Q14 fractional equation (3(3x − 1) expansion); Q21 two-step trig (1 d.p.); Q15 "depreciated" misunderstood; Q7 grouped mean (26; bounds; frequency density attempted); Q8(a) explaining extrapolation. Well answered: Q1, Q2, Q3, Q4, Q5, Q6, Q9, Q12, Q13.

**M5 Paper 1 (non-calc).** Overview: poor numeracy and "repeated arithmetical errors"; little checking. Worst: **Q17 describing a translation ("only one candidate gained both marks"; "4 across"; extra transformations)**; **Q18 bounds — shortest length for 92 m to the nearest metre (<10%; answer 90)**; **Q16 3/7 + 1/4 then 1 − 19/28 (most zero; 4/11)**; Q15 ratio (180 ÷ 13, 180 ÷ 7); Q2 compass directions (wrong town; "WS, NS"); Q9 age problem (1/5 of 40 as 7, 9, 15, 20); Q11 7 h → 420 min then 15% (100 min in an hour; 420 ÷ 15; 1.05 h as 105 min); Q13 scale and perimeter (length + width; area; whole grid); Q12(a) sequence with negatives (−2 → 0); Q1(d) scale interval 2 (361); Q3(c) vague "certain" events; Q8 probability in words; Q10 conversion graph readings; Q5(b) estimation (11 not 12); Q6 rule given instead of term; Q14 0/13, 4/13; Q19 polygon angle sum (more than 6 triangles; measuring).

**M5 Paper 2 (calc).** Overview: "very little evidence of candidates checking their answers for reasonableness"; a few had no calculator. Worst: **Q17 3x × 4 = 12x ("very small proportion"; 12; 7x)**; **Q14 4/10 → 2/5 → 15 sweets (12 or 14)**; **Q15 ratio (÷3 and ÷5 instead of ÷8)**; **Q11 special-offer cupcakes (only the strongest; 14 × 75p)**; Q10 fractions of amounts and difference (132 summed; 0.66/0.67); Q6(a) scale factor (4 from comparing areas); Q18 probability table/relative frequency (0.145 in both boxes; 160 + 92); Q9 sum vs 11% of 400 (35 ignoring 10; 400 ÷ 11); Q13 kg → lb costing (conversion ignored); Q4(b) 49 rare; Q3(b) 2/5 vs 2/10 "equally likely"; Q7(c) probability statements; Q5 121.5 from multiplying; Q16 improper-fraction sequence (stopped at 3.4); Q12 925 instead of difference; Q1 manual arithmetic; Q2 weight × price.

**M6 Paper 1 (non-calc).** Best: reflections, probability, extending sequences. Worst: **Q13 shortest length/bounds (90)**; **Q5(b) estimating a square root (100/2 = 50; 20 × 2 = 40 for 20.3²)**; **Q17 combining fractions 42/102**; **Q19 nth term of a combined sequence (listing only = 0; 6n; 6n − 2 vs 118)**; **Q15 angle bisector (arcs required; "alternative method accepted this time only")**; Q16 estimating a number of drivers (confused with estimating a mean); Q3 age difference; Q6 forgot 420 − 63; 105 → 1 h 45; Q11 3/7 + 1/4 (4/11); Q12 translation (rotation/reflection named; vector errors); Q14 interior angle sum (6 × 180 errors; went on to 135); Q10 ratio 180 ÷ 13; Q18 binary (11101; "49 not square"); Q7 sequence (−3; 45); Q8 perimeter/area confusion.

**M6 Paper 2 (calc).** Best: gallons, enlargement, probability, listing, exchange rates. Worst: **Q17 inequality (4x < 3 → x < 4/3; sign not restored)**; **Q16 indices (m⁷ from adding; e⁵ from dividing)**; **Q15 pentagon angle (72 instead of 108)**; **Q11 ratio (1680/3 and 1680/5; 210 vs 420)**; Q6 fractions of quantities ("divide by numerator, multiply by denominator"; rounding ⅔); Q9 kg/lb costing (15 × 0.65; wrong conversion); Q10 4/10 → 2/5 → 15; Q13 12x (54%); Q14(b) expected frequency (50%); Q7 cupcakes (£8.40 for 12); Q3 probability scale (9/12; D not A); Q5 35; Q18 graphical simultaneous ("much better than before"; negative gradient, intercept 6).

**M7 Paper 1 (non-calc).** Worst: **Q17 ordering numbers in standard form (few three marks; guessing = 0)**; **Q11 estimating a population from 17/100 → 2000 ("many did not know"; stopped at 100)**; **Q7 describing a translation ("moved"; "4 across"; vector as a fraction)**; **Q6 25% → fraction then 3/7 + 1/4 (4/11; 19/28 left; subtracted/multiplied)**; Q12 fraction of students 42/102 (42/270; 0.4 × 270); Q18 simultaneous equations (trial and error = 0); Q8 bounds (90 not 91.5); Q9 6 × 180 = 1080 (÷8 = 135; 6 × 360; 8 × 180); Q10 angle bisector (arcs required; bisector forgotten); Q16 reflection in y = x (y-axis; 180° rotation); Q14 nth term 6n + 2; Q13 binary (11101, 11001); Q3 perimeter from scale (stopped at 20; area); Q5 ratio (180 ÷ 30 error); Q4(c) ratio used for probability; Q1 forgot to subtract (63 vs 357).

**M7 Paper 2 (calc).** Worst: **Q16 similar shapes area ratio 1:16 → 1:4 → x = 3 ("very few"; "very unfamiliar")**; **Q14(b) P(no sixes) from a tree diagram (few; added fractions >1; labels missing)**; **Q15(c) minimum from a quadratic graph (ruler joins; straight line between (1,0) and (2,0); scale 0.2 misread)**; **Q3 kg → lb (didn't know 1 kg = 2.2 lb)**; Q11 inequality (x = 0.75 written; 4 ÷ 3); Q8(a) probability table (0.29 ÷ 2; blue twice red) and (b) expected 68 (only 4/10 of 400); Q12 line y = 6 − x and intersection (no table; x/y swapped); Q9 pentagon angles (wrong sum; interior/exterior; wrong polygon); Q10 indices ("m12" not as a power); Q6 explaining why 4; Q7 12x (12; 4 × 3x); Q2 500 ÷ 1.33; Q13 270 ÷ 15; Q1 2.10 ÷ 3 = 70p; Q4 stopped at 6/15; Q5 multiplication errors on a calculator paper.

**M8 Paper 1 (non-calc).** Overview: Q2 and Q3 "proved difficult enough for even the better candidates"; A/A\* questions well attempted. Worst: **Q8 standard form without a calculator (30% unable; best 20% full; addition hardest)**; **Q15 Pythagoras + area of a parallelogram (strongest 10% full)**; **Q2 interpreting 17 and 2000 (under half)**; **Q3 males/females fraction (under half; 42/270)**; **Q11 index simplification and an index proof (third full / third zero; 40% convincing; "didn't understand meaning of indices")**; **Q13 inverse proportion (a third beyond reach; 40% full; equation manipulation)**; Q12 negative-scale-factor enlargement (55%; one vertex only); Q6 independent probability xy (x + y given; >60% ok); Q7 reflection in y = x (two thirds; axis used); Q1 angle bisector (two thirds; arcs unclear); Q5 nth term (~70%); Q9 simultaneous equations (majority full); Q10 recurring decimal → fraction (70%); Q14 probability (majority full; fraction multiplication).

**M8 Paper 2 (calc).** Worst: **Q10 equation of a circle and its tangent (few recalled; straight-line equation given; ~30%/~40%)**; **Q8 similar shapes ratios (just over a quarter; correct answer with no working = 0)**; **Q7 quadratic graph (negative x; straight segments at the minimum; only 35% read the minimum; top fifth final part)**; **Q11 bearings + sine rule and Q12 areas + cosine rule (each nearly a quarter full marks)**; Q9 tree diagram interpretation (just over half); Q1 polygon (72° as interior; >60% full); Q3 inequality (sign not reintroduced; >⅔); Q6 tree labels omitted (>80%); Q2, Q4, Q5 very well.

**General advice (November 2025):** read and reread; check reasonableness; show working (a correct answer alone can score zero — M3 Q9, M7 Q3, M8 P2 Q8); use the calculator and the fraction button, writing the calculation down; units; legibility (1 vs 7; dark pencil for graphs/box plots); answer the question asked, not a rehearsed version; data-handling reasoning must refer to the actual data (not "IQR excludes extremes"); circle-theorem reasons need key words ("opposite", "cyclic"); if several solutions are left, the worst is marked; keep the full calculator display in bounds questions; do not round terminating estimated means and check the mean lies within the data; probabilities as fractions not words/ratios; describe translations in words ("4 right and 6 down") or with correct vector notation; constructions must show arcs (the one-arc shortcut "will not work in future"); restore the inequality sign; write indices as powers; use the graph when told to and note the scale; teach inverse operations in reverse order, Pythagoras in context, flowcharts, extrapolation, and "area in contact" for pressure; enter candidates in the right unit (M2 >90 → M3; M7 high → M8, low → M6).

### 9.5 Cross-series synthesis: the hardest topics (evidence-weighted)

**Foundation first units (M1/M2)**
1. Forming and solving equations/expressions with brackets — 3(y−7)=18, 5(2y+3)=79, 4a−2=24, "5 more than h", expressions in pence (2025 M1 Q12/19/26, M2 Q3/18/19/25; 2024 M1 Q29, M2 Q21/29; 2023 M1 Q20/25, M2 Q11/16/22; Nov 2025 M1 Q19b, M2 Q11b).
2. Volume/capacity: cylinder volume (90% zero, 2025 M2 Q26), cuboid volume vs sum of edges, litres ↔ cm³/ml, depth of liquid, open-box nets (2025 M1 Q16, M2 Q8b; 2024 M1 Q5/Q11b; 2023 M1 Q13/22, M2 Q3/23).
3. Pythagoras in context (<5% correct 2025 M2 Q28; >80% zero 2024 M2 Q24; "unable to spot it" Nov 2025 M2 Q29).
4. Percentages and fractions of amounts: % increase when the increase is given, one quantity as a % of another (Nov 2025 M2 Q16 >50% zero), ⅓ treated as 30/33%, 2/7 converted to a decimal, 2½ read as 1, "£50 off" as 50%, multi-step "45% then ⅔ of the remainder" (2025 M1 Q18/22/23/25, M2 Q10/14/15/17; 2024 M1 Q24, M2 Q17; 2023 M1 Q10/11/24, M2 Q1/15).
5. Adding fractions without/with the calculator (Nov 2025 M1 Q26, M2 Q18 "four out of five made no valid attempt").
6. Compound-shape areas (badge; rectangles in a square — Nov 2025 M2 Q24 70% zero), circumference/area of a circle in context (4% correct 2024 M2 Q19; 75% zero Nov 2025 M2 Q28), trapezium/prism reverse problems (2024 M2 Q25).
7. Angles: parallel-line angle names (Nov 2025 M1 Q29, M2/M3 Q13/14), angles in two triangles ("360°"), angles with reasons (2023 M1 Q26, M2 Q14 "almost no candidates full marks"), quadrilaterals with 3x/4x.
8. Statistics: estimated mean from grouped table (75% zero, 2024 M2 Q26), mean/range from frequency tables (÷4 not ÷20), median of an even-sized list, Venn diagrams (<10% correct 2024 M2 Q23; 2023 answer "2"), pie-chart angles and "75° ≠ 75%", comparing distributions using the word "range", data types (2023 M1 Q21 guessed), criticising sampling methods.
9. Average speed (2024 M1 Q25, M2 Q18; 2023 M1 Q23, M3 Q5 "54 ÷ 45") and time intervals (21:55→06:06; "100 minutes in an hour").
10. Reverse midpoint, gradient/intercept and meaning of gradient in real-life graphs (2023 M2 Q21, M3 Q14 "alien"), HCF by listing, compound interest (10% correct, 2024 M2 Q27), square numbers from prime factors (>80% zero Nov 2025 M2 Q26), plans/elevations, 3D vocabulary (cuboid, edges/vertices, net of cylinder), units of measurement (0.6 g coin), cm↔mm, ordering decimals, rounding to 1/2 d.p., formula substitution ("163" for 16 × 3).

**Foundation completion (M5/M6)**
1. Ratio that is not "share in the ratio" (45 boys = 5 parts; cordial 800:2100 → 2800; sofa 1680 ÷ 8; writing 500 g : 750 g : 1 kg as a ratio) and sharing a remainder (÷4 instead of ÷5).
2. Map scales 1:25 000 with unit conversion (200 000 cm → 2 km) and compass directions — blank for most.
3. Non-calculator percentages/fractions (35%, 6% of 700, 25% of 84p, ⅓ ≠ 30%, 2/5 of 20, 3/7 + 1/4 → 4/11), the medals problem (63 = 7/10 of total), estimation using a given product (23 × 146 → 2.3 × 1.46) and dividing by 0.5, exact division after estimating.
4. Constructions and loci (angle bisector; region inside rectangle; "horizontal line halfway"), rotations about the origin (90° clockwise), reflections in the x-axis, reverse translations, **describing a translation** (Nov 2025 M5 Q17 "only one candidate gained both marks"), describing single transformations with all details, area vs length scale factors, enlargement scale factor (64/8 given instead of 4).
5. Conversion and distance–time graphs (plotting; reading beyond simple values; time spent as 4.3 h; average speed 20/0.5), sequences/patterns (square, cube, triangular, prime numbers; nth term), binary (if untaught), reflex bearings.
6. Bounds ("shortest length" 91.5 not 90 — <10% correct Nov 2025), estimating square roots, polygon angle sums (540°; interior vs exterior; sides from exterior angle 15°), pentagon 72 vs 108.
7. Algebra at the top of M6: inequalities with brackets (answer must keep the inequality sign; ">" "seems to scare candidates"), simultaneous equations graphically (line must be drawn), trial and improvement (must test 3.55), indices (m⁷/e⁵ errors), changing the subject ("nonsensical rearrangements"), 3x × 4 = 12x, quadratic graph turning point/roots.
8. Probability: combined events on a probability scale (1/6), sample-space fractions (8/36), relative-frequency tables (0.305 error; 2300 ÷ 0.23 "undoubtedly the hardest"), expected frequency, probability scale in words vs letters/fractions, explaining why P(red) ≠ ¼, reliability = more trials, P(not q) = 1 − q, "independent"/"mutually exclusive" terminology.

**Higher first units (M3/M4)**
1. Setting up quadratic equations from geometry (area of right-angled triangle, Pythagoras, square + trapezium, trapezium alone, L-shape: 5–"handful" % full marks; "majority zero") and "show that" questions (all or nothing).
2. Algebraic fractions: adding with common denominators (⅓ of M3), factorising/cancelling with difference of two squares (incl. fractional coefficients and three variables), adding with a whole number (9%), **dividing algebraic fractions (5% full, Nov 2025)**, equations with algebra in the denominator (18%).
3. Circle theorems requiring two-step reasoning (alternate segment + isosceles; 6% full marks in 2024 and Nov 2025; "majority obtained zero" 2023) and stating reasons with key words ("opposite", "cyclic").
4. Histograms: drawing from a blank grid (frequency density), **estimating the median from a histogram** ("vast majority" fail; every series), reverse readings; stratified sampling and population estimates from samples (28%); reasoning about representativeness.
5. Bounds with awkward rounding ("to the nearest 5 kg" → 47.5; 1 h 10.5 min), division/subtraction bounds, bounds in Pythagoras, rounding the final answer the right way; keep the full calculator display.
6. Cumulative frequency/IQR/box plots — reading at 12.5 on the wrong axis, forgetting the £1000s scale, plotting the five given values, comparing/explaining with correct vocabulary ("spread/variation"; "range affected by the high maximum" — "poorest response on the entire paper", Nov 2025 M3).
7. Arc length/sector (major vs minor arc, ÷260), cylinder surface area vs volume (with 1 cm overlap), pressure = force/area ("area in contact"), cylinder + hemisphere multi-step, frustums/cone from a sector (apex angle), composite solids with rounding down.
8. Straight lines: equation through two points (top 10% in M3; "very limited success" Nov 2025), perpendicular line when rearrangement to y = mx + c is needed, perpendicular gradient → coordinate, reverse midpoint, meaning of gradient in context.
9. Trigonometry: recognising the need to split isosceles/stepladder diagrams, rearranging cos to find a side (<20% full Nov 2025 M3 Q24), multi-step trig with early rounding, Pythagoras "3 marks or 0", diagonal of a base needs Pythagoras.
10. Number: reverse percentages (subtracting 18.2/28% instead of ÷0.818/1.28 — every series), compound interest with differing rates/0.5%, LCM/HCF in context (stopping at 132), expressions in pence (>70% zero on M3), forming linear equations (trial & improvement instead), time and speed ("tens rather than 60ths"), square numbers from prime factors, parallel-line angle facts (>70% wrong on M3 Nov 2025).
11. Short proofs (sphere vs cube surface area, 7%) and index proofs.

**Higher completion (M7/M8)**
1. Surds: equations with surds (<50% one mark), simplifying/rationalising with sign errors, rational vs irrational reasoning; combined Pythagoras-surds-area problems (A\*); perimeter of a semicircle in terms of π (forgetting 2r).
2. Inverse and direct variation with algebra (square relationships R ∝ v² — "many did not seem to know this topic"; fractional final steps; 20–40% full on inverse questions).
3. Coordinate geometry of the circle: equation of a tangent/radius/chord/diameter and of the circle itself (≈20–40% complete; "few recalled").
4. Multi-step non-right-angled trigonometry: cosine rule + sine rule + ½ab sin C with an auxiliary line or bearings (1/6 to 1/3 full marks); 3D — space diagonal then the angle.
5. Standard form: combined with percentage change and mixed units (over a third zero), ordering, and non-calculator arithmetic (30% unable; addition hardest).
6. Indices with negative/fractional powers (index −3, fractional, algebraic simplification, index proofs) — very mixed.
7. Changing the subject when it appears twice (few full marks on M7; under half on M8).
8. Transformations: combined (reflection in y = x then enlargement with a given centre; reflect in wrong line), describing enlargement centre/scale factor, negative scale factors, describing a translation correctly.
9. Similar shapes: area ratio 1:16 → length ratio 1:4 ("very unfamiliar"), volume scale factor 8 ("majority doubled the volume"), ratio of heights/volumes from areas.
10. Simultaneous equations requiring both equations to be multiplied; graphical solutions without drawing the line score nothing; population estimates from relative frequency (17/100 → 2000; 500 × 0.23).
11. Probability: tree diagrams (labels; add vs multiply; P(no sixes)), non-replacement (well taught: >70% full on A\* question), product rule with repeats, multiplying three fractions, P(not q).
12. Quadratic graphs: which line to draw to solve a given equation; reading both roots and the minimum; gradient of a tangent to an exponential curve; inequalities in one and two variables (keep the inequality sign); trial and improvement final check; nth term of combined/quadratic sequences.

**Recurring general advice from examiners (all series):** show every step and write down what is keyed into the calculator; read bold instructions ("estimate", "use a scale drawing", "form an equation", "give your answer as a fraction", "to 1 decimal place", "whole number", "not"); answer the question asked; do not offer multiple methods without indicating the final one (the worst is marked); use rulers/dark pencil for constructions (scripts are scanned) and show arcs; keep the inequality symbol; don't round early; include units and correct money notation; write explanations mathematically (e.g. "75% of 360° = 270°") and use statistical vocabulary ("range", "spread") tied to the actual data; ensure the calculator is in the correct mode and bring a protractor/ruler; check work (ordering data, arithmetic, reasonableness); candidates entered at the wrong tier/unit is a recurring theme; teach every statement on the specification.

---

## 10. Confidence notes and open questions

- The spec PDF now served (`…-specification-Standard_0.pdf`, "last updated 05/02/2026") is still Version 2 (8 June 2017) inside; the 2026 date appears to be a re-upload rather than a content revision. No addendum for 2025–2028 was found on the subject page, News, or Circulars pages.
- Exact start time of M1–M4 in Summer 2026/2027 is inferred from the timetable's "normal start time for morning sessions is 9.15am" (the maths row itself carries no time in those PDFs; November 2025/2026 timetables and the Summer 2025 paper covers explicitly show 9.15am).
- Whether CCEA will publish a November 2027 GCSE timetable containing Maths units (resit-only) is not yet known; the Q&A says the November series will remain in November pending the reform survey.
- The grade-range wording differs between the specification (M2+M6: C\*–G; M4+M8: A\*–D) and the 2019/2020 support booklets (C\*–F; A\*–C); the spec plus UMS arithmetic is followed here.
- The BBC Bitesize page linked by CCEA (https://www.bbc.com/education/examspecs/zcq8b82) returns HTTP 200 but its content could not be fetched here, so its topic coverage is unverified.
- Chief Examiner reports for Summer 2023 and November 2025 were extracted by delegated full reads of the downloaded PDFs (9.3/9.4) with spot-checks of quoted statistics; Summer 2025 and Summer 2024 were read in full directly. Some symbols (£, °, fractions) are garbled in the PDF text extraction and were reconstructed only where unambiguous.
- Web search was unavailable during this session; everything above comes from direct fetches of ccea.org.uk (browser User-Agent required for HTML/JSON) and the downloaded documents.
- A "GCSE Mathematics Specification Addendum 2022/2023" (assessment arrangements: advance information/additional support materials for units sat in November 2022 and Summer 2023 only) exists and is saved as `spec-addendum-2022-23.pdf`; it "applies only to candidates entering in November 2022 or Summer 2023" and has no effect on 2025–2028 assessments.

---

## Appendix A — files saved in `docs/sources/maths/`

| File | Source URL |
|---|---|
| 504.json (+ 504-index.tsv parsed index) | https://ccea.org.uk/sites/default/files/qualification/504.json |
| GCSE-Mathematics-2017-specification-Standard_0.pdf (+ spec.txt) | spec URL in §1 |
| GCSE-Mathematics-2017-specification-Standard.pdf | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%282017%29/GCSE%20Mathematics%20%282017%29-specification-Standard.pdf |
| Specimen-Assessment-Materials_23.pdf | §7 |
| Teacher-Guidance-2019.pdf; Student-Guide_17.pdf; Guidance-Grading-Aggregation-Resit-Terminal-Rules.pdf; Progression-of-Subject-Content.pdf; Snapshot_11.pdf; Breakdown-of-Assessment-Objectives-2021.pdf; Mapping-T-spec-to-M-spec.pdf | §8 |
| CER-Summer2025.pdf, CER-Summer2024.pdf, CER-Summer2023.pdf, CER-November2025.pdf, CER-November2024.pdf (+ .txt / .compact.txt) | §9 (Nov 2024: https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2024/GCSE%20Mathematics%20%282017%29-November2024-Report_0.pdf) |
| Timetable-GCSE-Summer2025/November2025/Summer2026/November2026/March2027/Summer2027-v2.pdf | §6 |
| Circular-S-IF-35-26-August.pdf (Nov/March series change); Circular-S-IF-31-25-August.pdf, Circular-S-IF-39-24-August.pdf (JCQ appeals), Circular-S-IF-59-23-October.pdf (subject officer) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/circulars |
| Nov-March-Series-Changes-QA-2026-27.pdf | §1 |
| GCSE-Guidance-Notes-Entry-Resit-Aggregation-Rules.pdf | §8 |
| Calendar-of-Events-2026-27.pdf | §6 |
| GradeBoundaries-Raw-to-UMS-Summer2025.pdf, GradeBoundaries-Raw-to-UMS-Summer2026.pdf | §2.3 |
| Paper-Summer2025-M1/M2/M3/M4/M6-Paper1/M7-Paper1/M8-Paper1/M8-Paper2.pdf and formula-sheet-*-Summer2025-p2.png | §7 URL pattern |
| page*.html, site_*.html, news-gcse-reform-2026-08.html | saved HTML of the CCEA pages cited |

(Other files in the folder — report-*.pdf, spec-2017-*.pdf, spec-addendum-2022-23.pdf, timetable-summer2026.pdf, grade-boundaries-summer2024.pdf, specimen-assessment-materials.pdf, teacher-guidance-2019.pdf, circular-S-IF-35-26-Nov-March-series.pdf — were written by a parallel process during this session and were not used for this report.)
