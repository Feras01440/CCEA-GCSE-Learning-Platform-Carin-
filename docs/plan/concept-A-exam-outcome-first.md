# Concept A — Exam-Outcome-First

**Working title:** *The Last Marks* (internal codename; the product name is the brother's call)
**Lens:** design the platform backward from the marks an A\* candidate actually loses, using the Chief Examiner reports as the requirements document.
**Date:** 2 September 2026
**Inputs:** `docs/research/01` … `10` (cited by file number and section throughout), `data/spec/double-award-science.json` (7 units, 419 numbered learning outcomes, 67 Higher-only, 18 prescribed practicals), and the existing Next.js 16 / React 19 / Tailwind 4 / KaTeX / Mafs / JSXGraph / Motion / ts-fsrs / Dexie / compute-engine / MathLive scaffold in `package.json`.
**Constraint reminders:** one developer with AI assistance; first genuinely useful version in about two weeks, then continuous improvement; static export, no backend; non-commercial personal use (so YouTube embeds, PhET CC BY-NC and GeoGebra are allowed); CCEA papers deep-linked only (their site blocks iframes); Corbettmaths linked/embedded but never copied.

---

## 0. The arithmetic the whole concept is built on

The brother's acceptance test is "will it make me really achieve the highest marks?". So start from what "highest marks" means in CCEA numbers, all from the research:

| Qualification | What A\* (or A\*A\*) actually requires | Source |
|---|---|---|
| GCSE Mathematics (M4 + M8) | Subject-level A\* boundary **394/400 UMS (Summer 2025), 393/400 (Summer 2026)**; A is 320. Unit-a boundaries are 144/180 UMS on M4 and 176/220 on M8, so A\* is "near-maximum UMS on both units". Raw marks for unit-a were only 45/100 on M4 (2025 and 2026) and 40/100 (2025) / 49/100 (2026) on M8, which shows how demanding the papers are; a Student Room A\* holder reported raw 77/100 on M4 (177/180 UMS) and 90/100 on M8 (220/220 UMS). Only **6.2% of 24,487** candidates got A\* in 2026 (7.0% in 2025). | 01 §2.2–2.3; 09 §2.1, §2.3 |
| GCSE Further Mathematics (U1 + U2 + U3) | A\* at **184/200 (2025), 186/200 (2026)** UMS; A is 160. Unit 1 grade a was 66–72/100 raw; Mechanics a 31–39/50; Statistics a 40–41/50. 22.2% of 4,520 candidates got A\* in 2026, so it is reachable but requires near-full raw marks across all three units. | 02 §2; 09 §2.1 |
| Double Award Science (B1, C1, P1, B2, C2, P2, Unit 7) | A\*A\* at **544/600 (2025), 541/600 (2026)** UMS; A\*A 510–512; AA 480. 5.1% of 8,514 got A\*A\* in 2026. Unit 7 (Booklet A 7.5% + Booklet B 17.5%) is 25% of the qualification and, per the audit, "unserved" by any platform. | 03 §2; 05 §4; 09 §2.1, §2.3 |

Consequence: the product is not "revision"; it is a mark-recovery system. On M4 the gap between "grade A" (45 raw) and "A\*-consistent" (~77+ raw) is 30+ marks that strong candidates lose on a documented list of question types. The examiner reports name those questions every series (01 §9; 02 §8; 03 §7). Section 2 turns that list into product mechanics; everything else in the document exists to deliver Section 2.

---

## 1. Her question, answered (to her, plainly)

You already have the spec, the past papers, the mark schemes and Corbettmaths. This does not replace them. It does three things they do not.

**It knows where your marks go.** Every question is tagged to the CCEA spec statement it tests and to the mistakes examiners report. The 2025 M4 report names bounds, forming a quadratic from a triangle, circle-theorem reasoning, algebraic fractions and the median from a histogram as the questions that separated candidates; those are built first. After each set you see which marks you lost and why: method, accuracy, misread, presentation, or not attempted.

**It brings things back before you forget them.** Anything wrong, or right with low confidence, returns in 1–3 days and again a week later, scheduled backwards from your paper dates (Summer 2027: M4 Friday 14 May, Further Maths Unit 1 Tuesday 18 May, M8 Thursday 27 May). You open it and the day's work is already chosen.

**It speaks in UMS.** An A\* in Maths was 394/400 in 2025 and 393/400 in 2026. Every mock is converted to UMS from the published boundaries and you see the gap in raw marks.

You also get original CCEA-style questions with full mark schemes for every M4 and M8 topic, the physics equations you must recall (there is no formula sheet), and Booklet B practical-theory practice.

It is worth 30 minutes, four or five days a week. Within three weeks it shows you, in numbers, whether it is working.

*(Under 250 words.)*

---

## 2. Where the marks are lost, and the mechanic that recovers each

Column key: **Evidence** quotes or paraphrases the Chief Examiner reports as recorded in the research files (S = Summer, N = November). **Mechanic** names the component; the component catalogue is in §7. **Phase** refers to §8.

### 2.1 GCSE Mathematics — M4 (Higher, calculator, 2 h, 100 raw, 180 UMS; unit-a raw 45 in 2025 and 2026)

| Topic (spec unit) | Evidence (01 §9) | Why a strong candidate loses it | Mechanic | Phase |
|---|---|---|---|---|
| Upper and lower bounds (M3 add/multiply; M4 subtract/divide) | S2025 Q13 on the examiners' hardest-question list: "45 kg used instead of 47.5 kg for '50 kg to nearest 5 kg'; rounding up instead of down; non-integer answer". S2023 Q15 (1 h 10.5 min). N2025 Q17 "~30% full; bounds applied after calculating; 3.86 rounded". | Builds the interval wrongly for non-unit rounding; picks the wrong pair for a quotient; rounds early. | **Bounds Ladder**: a number line that shades the interval as she types the rounding unit; a mandatory two-column UB/LB table before any calculation; rule cards ("largest a ÷ b uses UB ÷ LB"); find-the-mistake items seeded with the exact 45/47.5 error; feedback flags any intermediate rounding. | 0 |
| Forming a quadratic from geometry; "show that" | S2025 Q15(a) "full marks or zero; candidates tried to solve the given equation or 'fix' their working; 4x used instead of x + 4". S2024 Q22 "5% full marks; most challenging". S2023 Q20 "mean 1 mark; majority zero". N2025 Q19 (L-shape: "overlap ignored, 122 cm² unused, negative root kept"). | Cannot translate the diagram into expressions; works backwards from the printed answer, which scores nothing. | **Form-the-Equation trainer**: step-locked (expression for each side/area → equate → expand → rearrange → compare), backward-faded worked examples, and a "show that" checker that refuses backward working and explains why examiners give it zero. | 0 |
| Circle theorems: two-step reasoning with the accepted words | S2025 Q17(b) "needed isosceles triangle + alternate segment theorem; very few full marks"; (a) wrong reason "opposite angles in cyclic quadrilateral are equal". S2024 Q19(c) 6% full. S2023 Q17(b) "majority obtained zero". N2025 Q20(c) 6% ("opposite"/"cyclic" omitted). | Sees one theorem, not the chain; writes reasons without the key words. | **Theorem Chain** (JSXGraph): pick the reason, the relevant arc/angles light up; a reason phrase bank with the mandatory key words; chain problems needing two theorems plus an isosceles fact; self-explanation menu ("why does this theorem apply here?"). | 0 |
| Algebraic fractions: add/subtract with linear denominators; factorise-and-cancel; divide; equations with algebraic denominators | S2025 Q20 "difference of two squares with terms reversed", Q21 "only a small number… full marks — subtraction of more than one term in numerator". S2024 Q18(b) 9% full. N2025 Q22(b) dividing "5% full"; Q24 "negatives; b² without brackets in the formula". S2025 M3 Q12 "only one third correct; over half could not start". | Does not factorise first; sign error subtracting a bracketed numerator; cancels across a sum. | **Factorise-First routine** as a WorkedExampleAsQuestion (each step is an input; a wrong step reveals only that step's fix); minimally-varied sets; distractors tagged "cancelled across a sum", "sign lost in subtraction". | 0 |
| Histograms (frequency density on a blank grid; median from a histogram; reverse readings) and stratified sampling | S2025 Q22(a) "many zero (no frequency density; scales/labels)", (b) median "continues to cause problems for the vast majority", (c) "many blank". S2024 Q21(b) "all or nothing". N2025 Q23 "top only". S2024 Q15 population estimate 28% full. | Does not compute FD = frequency ÷ width; cannot invert area to frequency. | **Histogram Builder** (Mafs/SVG): bars sized by FD; drag a vertical line and watch the cumulative area fill to half; stratified-sampling calculator with the rounding rule and a "sum must equal sample" check. | 0 |
| Reverse percentages, compound interest, depreciation | S2025 Q19 "112% = £1008 — subtracted from wrong value". S2024 Q11 "28% subtracted or 72% used". S2023 Q7 mean 2 marks ("18.2% added/subtracted"). N2025 Q15 "'depreciated' misunderstood"; M3 N2025 Q30. Described as an error "every series". | Subtracts the percentage instead of dividing by the multiplier. | **Multiplier-first** drill ("112% = £1008 → 1% = …"); interleaved with forward percentage change so she must decide direction; find-the-mistake. | 0 |
| Straight lines: through two points; perpendicular line when the given line must be rearranged; perpendicular gradient → coordinate | S2024 Q17; S2023 Q16; N2025 Q16 "minus missed; Δx/Δy; c = 8 not recognised", Q18 "top only"; S2025 M3 Q16 "only top 10%". | Skips the rearrangement; sign slips. | **PredictThenPlot**: type the equation, see it drawn against the target; automatic check that gradients multiply to −1. | 1 |
| Multi-step trigonometry and mensuration (isosceles halves; early rounding; sector → cone apex angle; cylinder curved surface with overlap; cylinder + hemisphere) | S2025 Q16 "early rounding", Q8 "assumed angle BAC = 90°". S2024 Q8 "1.4 m not halved", Q14 "40% full", Q9 "sphere used; 90% forgotten". S2023 Q13, Q23 "rare to make the correct link". | Rounds intermediate values; misses the auxiliary line; confuses surface area with volume. | **Full-precision rule** (feedback detects an intermediate rounding that explains the error); auxiliary-line prompts; a "what is on the formula sheet?" toggle (sphere/cone are given; cylinder and circle are not — 01 §4). | 1 |
| Arc length and sector (major vs minor); pressure = force ÷ "area in contact"; compound solids | S2025 Q12 "majority found the minor arc (6.1 cm) not major (15.9 cm)", Q6(b) "used volume". N2025 Q10 "pyramid base — used volume of cube, ÷4 instead of √". | Misreads which arc; wrong "area". | Read-the-question prompts (bold words captured before answering); an SSDD set on one sector diagram (arc, area, perimeter, cone). | 1 |
| Cumulative frequency, IQR, box plots and data-handling reasoning | S2025 Q11(c) "forgetting thousands". N2025 M3 Q26(b) "the poorest response on the entire paper" (needed "range affected by the high maximum"). N2025 M4 Q11(b) 9% (generic "IQR excludes extremes"). | Generic rather than data-specific reasoning. | **Reason-with-the-data** sentence frames that must cite a value from the chart before they are accepted. | 1 |
| Presentation losses | S2025 M4 overview: "leaving multiple solutions without indicating the final one (worst is marked)"; "use of brackets in algebra; rounding/accuracy"; S2023: "money to 2 d.p.", "state units", "keep the inequality sign". | Not maths; marks still gone. | Exam mode has a single final-answer field; the Mark Ledger tags "presentation" losses separately so they are visible and cheap to fix. | 0 |

### 2.2 GCSE Mathematics — M8 Paper 1 (non-calculator, 1 h 15 min, 50 raw). In S2025 "the non-calculator paper was harder than the calculator paper, especially in the second half" (01 §9.1).

| Topic | Evidence (01 §9) | Failure | Mechanic | Phase |
|---|---|---|---|---|
| Surds: equations, simplifying, rationalising; rational vs irrational | S2025 Q11 "fewer than half gained even one mark"; Q14 "sign errors common". S2024 Q10 "most challenging; partial marks for expanding only". S2023 M7 Q12 "perimeter of a semicircle in terms of π — most unable; forgot 2r". | Non-calculator manipulation fluency. | **Non-calc Five**: a daily five-item non-calculator set (surds, indices, standard form, fractions, recurring decimals, π-exact answers) scheduled by FSRS; a surd ladder with one-thing-changes variation. | 0 |
| Coordinate geometry of the circle (tangent, radius, chord, equation of the circle) | S2025 Q13 "just under 20% completed". S2024 Q12 (A\*) "gradient known but not the equation". N2025 P2 Q10 "few recalled; straight-line equation given". | Does not chain gradient of radius → perpendicular gradient → line through the point. | **Circle & Tangent** (Mafs) with the four-step chain as inputs; the diagram redraws after each step. | 0 |
| Inverse and direct variation, including squares | S2025 Q10 "top 20% correct; a quarter no marks". S2023 M7 Q15 "many did not seem to know this topic; square omitted". N2025 Q13 "a third beyond reach". | Skips "find k first"; drops the square. | **k-first** template; SSDD set (y ∝ x, y ∝ x², y ∝ 1/x on the same numbers). | 0 |
| Standard form arithmetic with percentage change and mixed units, without a calculator | S2025 Q7 "over a third no marks; ~40% full". N2025 Q8 "30% unable; addition hardest". S2024 M7 Q15 "1.05 × 7 for 1.05 × 10⁷; g vs kg". | Index handling plus unit conversion. | Non-calc Five with a unit-conversion sub-drill; feedback names the specific slip. | 0 |
| Similar shapes: area and volume scale factors | S2025 Q9 "stronger candidates only". S2024 Q9 "the majority of candidates doubled the volume". N2025 M7 Q16 "very few; very unfamiliar". | Uses k where k² or k³ is needed. | **k, k², k³** animation (JSXGraph) with predict-then-reveal: guess the new volume, then watch it. | 1 |
| Indices with negative and fractional powers; index proofs | S2025 Q8 "index −3 only better candidates". N2025 Q11 "third full / third zero; 'didn't understand meaning of indices'". | Meaning, not procedure. | Variation sets that hold the base fixed and vary the index; proof scaffold with a self-explanation step. | 0 |
| Recurring decimals → fractions; multiplying fractions | S2025 Q12 "most got one mark". S2023 P1 "surprising how many candidates had difficulty in multiplying fractions". | Arithmetic under no-calculator conditions. | Non-calc Five. | 0 |
| Simultaneous equations needing both equations multiplied (M7) | S2025 M7 Q15 "trial & improvement = 0; stuck at 19x = 152". | Method not accepted. | Method-locked item ("algebraic method required"); feedback explains the zero. | 1 |

### 2.3 GCSE Mathematics — M8 Paper 2 (calculator, 1 h 15 min, 50 raw)

| Topic | Evidence (01 §9) | Failure | Mechanic | Phase |
|---|---|---|---|---|
| Cosine rule + sine rule + ½ab sin C with an auxiliary line or bearings | S2025 Q14 "nearly a third full marks; weaker candidates could not determine a logical starting point". S2024 Q12 "about one sixth full marks". N2025 Q11/Q12 "each nearly a quarter full marks". | Rule selection and chaining, not the formulae (which are on the sheet). | **Which-Rule?** decision drill (given what is known → choose sine/cosine/½ab sin C/Pythagoras); auxiliary-line prompts; a visible "formula sheet" panel so she practises with exactly what she will have. | 0 |
| 3D Pythagoras and trigonometry: identifying the angle | S2025 Q12 "fewer than half identified/calculated the angle". S2023 Q12(b) "only half knew which angle". | Spatial identification. | Static SVG stepper in Phase 0 (cuboid → base diagonal → space diagonal → the angle); draggable R3F cuboid in Phase 2. | 0 / 2 |
| Combined transformations; describing an enlargement (centre and SF); negative scale factors | S2025 Q8 "just over 40% correct; 30% no understanding", Q9 "only a minority gave centre and scale factor". S2024 Q7 "40% full / 40% zero". N2025 P1 Q12 "one vertex only". | Wrong mirror line; misused centre; incomplete description. | **Transformation Stepper** (Mafs): apply two transformations with a ghost trail; description checklist (name, centre, SF/angle/direction/vector) that will not submit incomplete. | 1 |
| Change the subject when it appears twice | S2025 Q6 "under half full; over a third didn't gather terms". S2024 M7 Q13 "few full marks; x left on both sides". | Gathering terms. | WorkedExampleAsQuestion; variation. | 0 |
| Quadratic and exponential graphs: which line to draw; both roots and the minimum; gradient of a tangent | N2025 Q7 "only 35% read the minimum; straight segments at the minimum". S2024 P2 Q9(c) "only better candidates drew a tangent". S2023 Q11(b)(ii). | Reading and constructing. | Mafs graph with a draggable tangent and a "which line to draw?" MCQ that requires the algebra first. | 1 |
| Probability: tree labels; add vs multiply; product rule with repeats | S2025 Q10 "~75% full", Q7(b) "just under half". N2025 M7 Q14(b). Without-replacement (A\* question) ">70% full marks". | Mostly fine. | Light touch: a handful of items. Deliberately not a Phase 0 investment because the reports show it is well taught. | 1 |

### 2.4 GCSE Further Mathematics (02 §8)

**Unit 1 Pure (2 h, 100 raw; unit-a raw 66/68/72 in 2024/25/26)**

| Topic | Evidence | Mechanic | Phase |
|---|---|---|---|
| Algebraic fractions | "Flagged every year (2018 Q8 … 2025 Q7): not factorising all quadratics first ('tying themselves up in knots with cubic numerators'), not using (x+3)(x−3) as LCD, illegal cancelling across sums, sign errors". | The same Factorise-First routine as M4, at FM difficulty (quadratic numerators and denominators, three-term LCDs). | 0 |
| Differentiation applied in an unfamiliar way; tangents and normals | 2025 Q8(ii) "poorly answered by the majority"; Q13 "set dy/dx = 0 'out of habit' instead of dy/dx = 5"; 2024 Q9 "set curve = line instead of differentiating"; 2019 Q11 normals. | **Read-the-derivative-condition** drill: items alternate dy/dx = 0, dy/dx = k, gradient at x = a, normal vs tangent; Mafs tangent/normal visual. | 0 |
| Laws of logarithms (simplify/combine) | 2023 Q7(a) "only the best candidates scoring any marks"; 2024 Q6(a) "forgot to cube the 2 in (2x)³"; 2022 Q5(a) "one of the most challenging". Standard log equations are answered well. | Log-law ladder with variation; find-the-mistake built from the (2x)³ error. | 0 |
| Optimisation (final question) | 2025 Q14 "negative powers when differentiating; second derivative for nature"; 2022 Q13 "answer 30 mm instead of substituting back for 60 mm"; 2019 Q14 "many did not realise calculus needed". | **Optimisation template**: form → differentiate → solve → nature → substitute back → answer the question asked; the last step is a separate input. | 0 |
| Forming three simultaneous equations from context | 2025 Q12(iv) "the most poorly answered part of the entire paper" (currency conversion with a 40% decrease); "Sole use of a calculator will not gain any marks"; 2024 Q11 (thousands, forgetting to scale back). | **Form-don't-solve** bank: contexts (percentages, currency, thousands) where the deliverable is the three equations; the solve step is auto-checked and shown as working. | 0 |
| Integration to recover a curve from its gradient (+ c) | 2025 Q6 "poorly answered — saw the word 'gradient' and differentiated"; 2023 Q2 "constant omitted"; 2019 Q13 "most difficult question on the whole paper". | Interleaved with differentiation so she must decide direction; find-the-mistake. | 0 |
| Trig graphs and equations (tan asymptotes; second solution in range; CAST) | 2025 Q2(a) tan "particularly problematic (asymptote drawn at 180°, curves crossing asymptotes)"; 2022 Q4(b)(i) "majority scored 1 mark". | Mafs trig graph with quadrant overlay and a range slider; "find all solutions in range" with count check. | 1 |
| Completing the square then "hence" find the minimum | 2025 Q3(ii), 2023 Q4(ii), 2019 Q2: "candidates differentiate instead — zero marks because the required method was not used". | Method-locked item type (see Pillar 6). | 0 |
| Quadratic inequalities; cubic sketching; log/log graphs; matrices under "use matrices" | 2024 Q3 wrong region without a sketch; 2023 Q12 extra (0,0) intercept; 2025 Q5(ii) algebraic solutions "received no marks"; log-log presentation (3 dp, axes, inverting the gradient). | Method-locked items; sketch checklist (intercepts, turning points labelled, asymptotes); presentation rules in feedback (2 dp default, 3 dp for log tables). | 1 |

**Unit 2 Mechanics (1 h, 50 raw; unit-a raw 31/39/37)**

| Topic | Evidence | Mechanic | Phase |
|---|---|---|---|
| Force diagrams | "Every report: missing arrows/labels, omitted normal reaction, weight of rod not at the centre, mass written instead of weight"; 2025 "only around 50% achieved full marks for correctly labelling the forces". | **Force-Diagram Check**: drag labelled arrows onto the body; a checklist ticks (weight mg at centre, R perpendicular, T along the string, friction opposing motion, no extra reactions). | 1 |
| Force on a pulley = 2T | 2025 Q4(iv) "the least well-answered question on the paper"; 2022 Q5(iv) "a large number didn't know". | One FSRS card plus three items; the pulley shows the resultant in every connected-particle problem. | 1 |
| i, j vector equations; vector/scalar definitions | 2024 Q2(i) "so few candidates gained more than one out of five"; Q1 "under 50% full marks every year; 'weight' wrongly classed as scalar". | Vector/scalar deck; coefficient-equating drill (leaving i and j inside scalar equations is a tagged error). | 1 |
| Resolving on inclined planes; equilibrium (a = 0) | "sin/cos swapped; R = 17 sin 33° type errors; not realising a = 0 in equilibrium parts; weight instead of mass in F = ma". | Resolving template with a diagram that rotates the axes; a = 0 prompt in equilibrium parts. | 1 |
| Moments | "Omitting rod weight, extra reactions, cannot handle R and 3R, not recalculating R when the load moves; trial-and-error instead of variable d" (2025 Q5(iii)). | Moments with a variable distance; the checklist from force diagrams applies. | 1 |
| Two-vehicle graphs; suvat sign and "show that" | 2023 Q6 "very poorly done"; 2024 Q1 displacement-time and average speed; "'show that' by substituting the answer (no marks)". | Graph stepper; sign-convention card; the "show that" checker from M4. | 2 |

**Unit 3 Statistics (1 h, 50 raw; unit-a raw 41/41/40; "consistently the highest-scoring unit")**

| Topic | Evidence | Mechanic | Phase |
|---|---|---|---|
| Conditional probability | "The top discriminator every single year"; 2023 Q3(iv) "only 25% correct"; typical error "dividing by the whole population". | **Denominator drill**: P(A given B) from two-way tables, trees, Venn diagrams and binomial/normal contexts; the denominator is a separate input. | 1 |
| Standard deviation of combined or adjusted data | 2025 Q5(ii) "one of the most challenging — cannot recover Σx² from mean and SD". | Σx²-first template. | 1 |
| Linear transformation of mean and SD; Σfx² errors | 2023 Q6(ii) "many strange equations involving m and n"; 2024 Q1(iii) "adding 3 to the SD"; 2025 Q2 "squaring the fx column". | Two cards and a short item set; table-building drill with the fx² column. | 1 |
| Binomial "at least"; normal negative z; Spearman ties and the line through (x̄, ȳ) | "Missing brackets in 1 − (P(0) + P(1))"; "negative z (leaving 0.8849 instead of 1 − …)"; "tied ranks; (Σd)² vs Σd²; line must pass through (x̄, ȳ)". | Brackets discipline in feedback; a z-diagram habit (sketch before table); tie-handling items. | 1 |

### 2.5 Double Award Science (03 §7)

| Topic | Evidence | Mechanic | Phase |
|---|---|---|---|
| Physics equation recall (no formula sheet in any physics paper) | March 2026 report: "a wrong physics equation leading to a correct numerical answer will lead to no marks". P1 F S2025 "kinetic-energy formula: surprising lack". P2 F S2025 "P = IV not recalled". Unit conversions g → kg, minutes → seconds, mA → A repeatedly cited. | **Equation Vault**: the ~25 equations in 03 §5.9 plus 8 conversions as FSRS cards; the calculation answer box requires the equation line before numbers are accepted. | 0 |
| Verbatim definitions | "Definitions must be learnt verbatim from the CCEA Glossary of Terms". P1 H S2025 power definition "most challenging part"; Hooke's law full definition ("elastic limit" not accepted); mass "amount of matter"; centre of gravity must say "weight acts"; Principle of Moments must include "about a point" and "in equilibrium". | **Glossary Deck** with key-word checking (an answer must contain the marked words to pass), linked to the official glossary PDFs. | 0 |
| QWC six-mark questions (one per paper plus one in each Booklet B; three-band scheme) | P1 fusion QWC ("fission confusion, 'atoms' instead of nuclei, energy given as the by-product instead of helium"); C2 aluminium-extraction QWC ("bauxite/haematite confusion, cryolite lowers m.p. of Al₂O₃"); P2 stars QWC ("push" of gravity); B1 aerobic respiration QWC; Booklet B Biology fieldwork QWC ("few mentioned a key"). Cross-cutting: "a correct answer alongside an incorrect one scores zero". | **QWC Builder**: model answer → faded → independent; band self-marking against the descriptors; key-point checklist; the listing rule is enforced in feedback. | 1 |
| Booklet B practical theory (3 × 30 min, 35 marks each at HT = 17.5%) | 2024: "paper proved more difficult than expected, which suggests a lack of knowledge and skills around the practical aspect". Physics BB S2025: "unit and direction of a moment 'very poorly answered'"; "control variable given as length"; "density = m × V"; reliability vs accuracy. Chemistry BB: "gas syringe and conical flask misnamed"; "x-axis label omitted"; fume cupboard. Booklet A: "unit omitted from axis label"; "straight-line segments instead of a curve"; "2-D labelled apparatus diagrams (no 3-D, no four-legged tripods)". | **Practical Studio** (18 modules, one per prescribed practical): method, variables, apparatus-diagram builder with 2-D symbols, results-table and graph skills (labels with units, best-fit line or curve, "related but not proportional"), evaluation vocabulary; eight Booklet-B-style original items each. | 0 (3 modules) / 1 (all 18) |
| Chemistry equations: formulae, balanced, ionic, half | C1 H S2025 "ionic equations (Br₂ + KI) continue to prove challenging"; C1 F "writing formulae and balanced equations disappointing"; C2 F "diatomic elements forgotten"; C2 H "Fe → Fe³⁺ + 3e⁻ (electron side/number)". | **Equation Lab**: formula writer (ion charges from the Data Leaflet), balancer (own drills plus the PhET balancing sim), half-equation drills; a diatomic-elements card. | 1 |
| Organic chemistry | S2024: "Organic chemistry continues to be the topic with which candidates struggle" (general formulae, naming, drawing full structures, fractional distillation, carboxylic acid + base). | Structure drawing and naming drills; process-ordering tasks. | 1 |
| Observation and phrasing marks | "colourless solution forms/remains", "heat given out", "ions carry charge (not current)", "fewer successful collisions per unit time", "Cu not CU", "chloride ion not chlorine ion", "exothermic is a deduction not an observation". | **Phrasebook cards**: the accepted phrasing as retrieval prompts, tagged to the LO. | 1 |
| Biology processes and terminology | B2 H S2025 "independent assortment almost never named"; test cross "only the most able"; B1 H "nitrogen cycle processes B and C (only fixation and nitrification known)"; "last stages of eutrophication"; B2 F potometer bubble "thought water enters via stomata"; "zygote vs embryo"; "% of base C"; "restriction-enzyme staggered cuts and number of fragments". | **Sequence & Label** tasks: order the stages of a process; label a diagram from memory (an informational diagram, never decorative). | 1 |
| Graph and data interpretation | B1 H "trend descriptions not taken from the graph"; "misreading graph values"; "comparative language when comparing data". | The same reason-with-the-data frames as Maths. | 1 |

### 2.6 Foundation Mathematics (M1, M2, M5, M6) — supported, not the first build

She is on the Higher route, but the data model, exam map and UMS engine must handle Foundation from day one (M2 + M6 caps at C\*; M1 + M5 at D — 01 §2.1). The Foundation content pack is Phase 2. Its highest-evidence targets (01 §9.5): forming and solving equations with brackets (3(y − 7) = 18 "brackets not expanded"); cylinder volume ("90% scored zero", S2025 M2 Q26); Pythagoras in context ("<5% correct", S2025 M2 Q28); adding fractions ("four candidates out of every five made no valid attempt", N2025 M2 Q18); non-share ratio and 1:25 000 map scales; describing a translation ("only one candidate gained both marks", N2025 M5 Q17); bounds "shortest length" (91.5 not 90, <10%); constructions with visible arcs; graphical simultaneous equations ("line must be drawn").

---

## 3. Product pillars

Each pillar: what it is; why nobody else offers it for CCEA (from the platform audits 04, 05, 08, 09); the learning-science evidence (06); how she would use it in a typical week.

### Pillar 1 — Exam Map and UMS Engine
**What.** On first open, her actual entry pattern is recorded: which gateway unit (M4) and completion unit (M8) and in which series; Further Maths units; Double Award units and tier. The map renders the real CCEA dates (§4), the 40% terminal rule, the one-resit-before-cash-in rule, and the November 2027 resit-only cut-off for Maths. Every mock and mixed set feeds a raw → UMS → grade conversion using the fixed unit UMS scales (M4 max 180, M8 max 220) and the published raw boundaries per series, with A\* shown as a band (393–394/400), never a fixed mark.
**Why unique.** Maths Genie: "We don't have the grade calculator for CCEA Maths yet" (04 §2.2). No platform "exposes A\*–G with C\* or the per-unit grade ceilings" (04 §4.2). Parents "phone tutors to ask which tests their child sits" and students are "visibly confused about what raw percentage [A\*] means ('some say 79%, others 90+')" (09 §1, §7.1).
**Evidence.** Feedback must answer "where am I going / how am I going / where next" (Hattie & Timperley, 06 §8); self-paced mastery without a dated plan underperforms (EEF mastery, Kulik 1990, 06 §11); goal-setting and progress information are the "informational" game elements that help (06 §14).
**Her week.** She looks at it twice: Sunday, when the week card shows the UMS forecast and the gap in raw marks; and after any mock.

### Pillar 2 — Mark Ledger and Misconception Bank
**What.** A structured, per-learning-outcome bank of the errors the Chief Examiners report (Section 2 is its seed), with each diagnostic distractor tagged 1:1 to a named misconception. Every lost mark she records is tagged (misconception / procedural slip / misread / presentation / time / not attempted) and the tags feed the review queue and a running "top 10 traps" sheet.
**Why unique.** "Chief Examiner reports are narrative PDFs; nobody has structured them into a per-learning-outcome misconception bank" (03 §10). Diagnostic Questions and Eedi are organised by England NC codes and AQA/Edexcel/OCR (04 §2.13).
**Evidence.** Distractors mapped to misconceptions with feedback (Little & Bjork 2015; Butler & Roediger 2008 feedback halves lure intrusions, 06 §9); error logs feeding spaced re-probes (06 §15.5); EEF: knowledge of misconceptions "invaluable" (06 §9).
**Her week.** Passive most days; on Friday the ledger shows the week's lost marks by tag and the three cheapest to recover.

### Pillar 3 — Original CCEA-style Question Bank with M/A/B mark schemes
**What.** Original questions per topic, in CCEA layout (command words, marks in brackets, answer line, calculator flag, tier), each with a mark scheme in the M/A/B convention (method, accuracy, independent) including follow-through, and process-level feedback per mark point. Official CCEA questions are indexed by metadata and deep-linked, never copied (08 §11).
**Why unique.** "No student-facing, CCEA-mapped topic-by-topic past-paper question bank" — CCEA's Paper Builder and Topic Tracker are teachers-only (04 §4.1; 08 §6). On Target Resources exists because "there are very few actual past papers" (09 §7.1). Save My Exams has past papers only for CCEA, no topic questions (04 §2.6; 05 §2.5).
**Evidence.** Format-matched, material-matched practice transfers (Yang 2021, 222 classroom studies, g = 0.50, 06 §2); mark-scheme literacy via self-grading with rubrics g = 0.34 (Sanchez 2017, 06 §15); high-information feedback d = 0.99 vs ✓/✗ 0.24 (Wisniewski 2020, 06 §8).
**Her week.** Roughly 25–35 original questions a week across learn, mixed and exam modes; two or three of them past-paper deep links.

### Pillar 4 — Spaced retrieval scheduled backwards from the paper date
**What.** ts-fsrs (FSRS-6) with desired retention 0.90, raised to 0.93 in the last six weeks; an exam-date mode that never schedules an item's first return after its paper; a hypercorrection queue for confident-wrong answers (re-probe at 1–3 days and about a week); the daily queue is item-level and therefore topic-mixed by construction.
**Why unique.** Seneca, Cognito and Khan "have the mechanics but not the content" for CCEA (04 §4.7); "no spaced repetition or per-unit progress tracking tied to CCEA" (04 §4.7). No mainstream tool "exposes forgetting-curve / exam-date retention forecasts to the student" (07 §9).
**Evidence.** Spaced retrieval vs massed g = 0.74 (Latimier 2021); optimal gap 10–20% of the retention interval (Cepeda 2008); FSRS dominates SM-2 on 350 M reviews (06 §3); hypercorrection persists at one week but confident errors return if forgotten (Butler 2011) and replicates in 219,826 UK pupil responses (Foster 2022, 06 §9); successive relearning "more than a full letter grade" (Rawson 2013, 06 §4).
**Her week.** Every session starts with the review inbox ("Due today: 14 · ~9 min"); about 60–90 items a week.

### Pillar 5 — Paper 1 / Paper 2 modes (non-calculator fluency and calculator discipline)
**What.** M8 Paper 1 items are practised without a calculator control and with a "write the working" requirement; Paper 2 and M4 items show a "write what you keyed" line. The Non-calc Five is a daily fixture once M8 is in scope.
**Why unique.** "No completion-unit-specific (M5–M8) practice separating Paper 1 non-calculator from Paper 2 calculator skills" (04 §4.4).
**Evidence.** Test-format consistency moderates the testing effect (Yang 2021, 06 §2, §15); examiners: "show what is keyed in (0.70 × 800 = 560)" and "800 × 0.7 = 56 seen on a calculator paper" (01 §9.1 M7 P2).
**Her week.** Five non-calculator items a day (about four minutes); one timed non-calculator half-paper every second weekend from Phase 1.

### Pillar 6 — Method-locked question trainer
**What.** A distinct item type for the instructions that make a mathematically valid answer worth zero: "hence", "show that", "use matrices", "form an equation", "use a scale drawing", "estimate", "give your answer as a fraction", "to 1 decimal place". The stem's bold instruction must be captured (tap it) before answering; the checker scores by the required method.
**Why unique.** Derived directly from the FM and Maths reports ("drill the 'method-locked' question types where the wrong (even if mathematically valid) method scores zero", 02 §9.2; "read bold words ('£50 off' ≠ 50%; 'not')", 01 §9.3). No audited platform has such an item type.
**Evidence.** Metacognitive prompts embedded in the task, not a separate skills module (EEF +8 months, 06 §12); erroneous examples beat problem solving on a delayed test, d = 0.33 (McLaren 2015, 06 §9).
**Her week.** Three or four method-locked items inside mixed practice; they are deliberately unlabelled so she has to notice.

### Pillar 7 — Equation Vault and Glossary Deck (science recall, verbatim)
**What.** The physics equations that must be recalled (03 §5.9), chemistry formulae (Mr, moles, concentration, yield, atom economy, Rf), unit conversions, and definitions with examiner-required key words, as FSRS cards; the science calculation answer box requires the equation before numbers.
**Why unique.** "No official formula sheet exists for physics — students must memorise ~25 equations; no CCEA-branded equation practice tool" (03 §10 gap 1). Quizlet CCEA sets exist but are user-generated and uncontrolled (05 §2.13).
**Evidence.** Successive relearning to criterion across ≥3 spaced sessions (06 §4); retrieval g ≈ 0.5 with feedback (06 §2); Matuschak's prompt properties (focused, precise, consistent, tractable, effortful; 07 §2.8).
**Her week.** Folded into the review inbox; 25/25 equations at criterion within the first three weeks, then maintenance.

### Pillar 8 — Practical Studio (Unit 7, 25% of Double Award)
**What.** One module per prescribed practical (B1–B6, C1–C6, P1–P6 from the spec JSON): aim and method, variables, apparatus diagram builder using 2-D symbols, results table and graph skills, sources of error, evaluation vocabulary (accuracy, reliability, validity, anomalous), and eight Booklet-B-style original items; a Booklet A checklist for the 1 December – 1 May window.
**Why unique.** "Unit 7 Practical Skills (25% of the qualification) is unserved apart from Bitesize's 18 prescribed-practical pages and CCEA's PDF Practical Manual. No interactive planning/analysis trainer, no Booklet-B-style question practice" (05 §4.2). CCEA: "the only ones to directly examine practical work" (05 §0).
**Evidence.** Worked examples then fading for extended-response structure (06 §6); dual coding with informational diagrams and "draw and label from memory" (06 §10); self-grading against rubrics (06 §15).
**Her week.** One practical module per week from Phase 1; Booklet B timed sets from March.

### Pillar 9 — QWC Builder (six-mark answers, three bands)
**What.** For every unit paper's QWC and each Booklet B QWC: a model answer, a faded version, then independent writing; band self-marking against the descriptors; key-point checklist; the "listing" rule (correct + incorrect = zero) enforced.
**Why unique.** No CCEA QWC trainer exists; Bitesize quizzes are "generic Combined Science quizzes organised by AQA paper structure" (05 §1.3).
**Evidence.** Faded worked examples (Renkl 2002); self-assessment improves subsequent test performance (Sanchez 2017; Panadero 2017, 06 §15).
**Her week.** One QWC per week per science she is sitting that year.

### Pillar 10 — "See it move" diagrams tied to the failure points
**What.** Interactive figures built only where the reports show a spatial or structural failure: Theorem Chain, Histogram Builder, Circle & Tangent, Transformation Stepper, k/k²/k³, trig graphs with asymptotes, force diagrams, ray diagrams for lenses (P2 F S2025: "many could not construct any ray"), PhET sims for circuits, refraction, Hooke's law, moments, balancing equations (05 §2.11 list). Every interactive has a predict-then-reveal step and a tap alternative to drag (WCAG 2.5.7).
**Why unique.** "No UK GCSE product combines Brilliant-grade interaction with Khan-grade mastery states" and none is "CCEA-native in its design language" (07 §9).
**Evidence.** Words + pictures and prediction before reveal (Mayer; Brilliant, 07 §2.1); concreteness fading (Fyfe 2014, 06 §10); the EEF's warning that decorative visuals are "lethal mutations" (06 §0) is the reason there are no diagrams anywhere else.
**Her week.** Two or three interactives inside the week's target topics; never as a separate "explore" area.

### Pillar 11 — UMS-calibrated mocks with self-marking first
**What.** Timed to CCEA marks-per-minute (M4: 100 marks in 120 min; M8 P1/P2: 50 in 75 each; FM U1: 100 in 120; B1/C1/P1 HT: 70 in 60; Booklet B: 35 in 30). Phase 0 uses official past papers via deep link (she works on paper, enters marks per question against the official mark scheme); Phase 1 adds original full mocks. She marks first, the platform then applies the M/A/B scheme and shows the discrepancy, converts to UMS, and files every lost mark in the ledger.
**Why unique.** Aggregators "stop at PDF links" and "never turn papers into topic-tagged question banks with mark-scheme feedback" (05 §4.9); nobody converts to UMS (04 §4.2).
**Evidence.** Self-grading with rubrics (06 §15); retrieval under low stakes reduces test anxiety in 72% of pupils (Agarwal 2014); timed practice introduced after mastery and ramped (06 §15.6).
**Her week.** One timed section (30–40 min) at the weekend from Phase 1; a full paper per unit every six weeks.

### Pillar 12 — Linked Library (deep links, never copies)
**What.** Each topic node carries: the CCEA spec statement and Teacher Guidance exclusions; deep links to official past-paper questions (`#page=N`) and mark schemes; the Corbettmaths video numbers from the CCEA checklists (04 §2.1; 08 §9.3) as privacy-enhanced YouTube embeds and PDF links; the Bitesize CCEA article; NI Maths Tutor's video solution for that paper; the DAS fact file or FM Q&A booklet; the relevant PhET sim. A watched video never marks anything complete.
**Why unique.** The closest existing thing is a school Google Site mapping M4 and M7/8 topics to Corbettmaths (08 §8), unconnected to any progress data.
**Evidence.** Watching inflates confidence not skill (Kardas & O'Brien 2018) — hence "force an attempt within 60 seconds" after any video (06 §13).
**Her week.** Whenever a worked example is not enough; the platform points, it does not duplicate.

---

## 4. The daily and weekly loop, and how it changes as exams approach

Dosage is set by the tutoring evidence: "30–45 minutes, 4–5 days a week, in a fixed plan that runs back from the exam dates" (06 §16), and by the NI context — pupils describe "a permanent state of assessment" (09 §7.1), so sessions are bounded and there is no daily-streak punishment.

### 4.1 One session (30–45 minutes)

| Minute | Block | What happens | Source |
|---|---|---|---|
| 0–8 | **Review inbox** | FSRS items due today: equations, definitions, misconception re-probes, hypercorrection items, method-locked one-liners. Three-button grading (Again / Good / Easy). | 06 §3–4; 07 §2.10 |
| 8–25 | **Target block** | One sub-skill chosen by "weakest × marks at stake" (Section 2 weighting). Sequence: short note → worked example with self-explanation menu → Your-Turn twin → two backward-faded completions → 4–6 minimally-varied items → 3 mixed items. Rolling success governor: below ~70% step back; above ~90% fade and interleave. | 06 §6, §10, §11 |
| 25–35 | **Exam habit** | 3 exam-style items in mixed mode (no topic labels), one non-calculator if M8 is in scope, one find-the-mistake or method-locked item. Confidence slider on each. | 06 §5, §9, §15 |
| 35–40 | **Close** | Tag any lost marks; one-line plan–monitor–evaluate prompt ("which mark was cheapest to lose?"); tomorrow's queue previewed. No celebration unless a milestone. | 06 §12; 07 §7 |

### 4.2 One week

| Day | Session | Notes |
|---|---|---|
| Mon–Thu | Standard session (above) | Target blocks rotate subjects by proximity to the next paper and marks at stake. |
| Fri | **Mixed quiz** (20 items, everything studied to date, interleaved) + ledger review | Interleaved retrieval in science too (Sana & Yan 2022, d = 0.35, 06 §5). |
| Sat or Sun | **Timed section** (from Phase 1; 30–40 min) or a Practical Studio module | Timed work only after a topic has reached Proficient (06 §15.6). |
| Sun | **Week card** | Spec points at Proficient+, marks recovered, top 3 traps, UMS forecast, predicted retention on paper day. Weekly streak counted in weeks with ≥3 sessions; one freeze per half-term (07 §7). |

### 4.3 The year, on the real 2026–27 dates (01 §6; 02 §6; 03 §6; 09 §5.3, §6)

The Exam Map is configured on day one for her actual entries; two common shapes:

- **Shape A — everything in Summer 2027** (she is in Year 12, or her school enters M4 in November 2026 and M8 in Summer 2027).
- **Shape B — two-year** (Year 11 now: M4 and B1/C1/P1 in Summer 2027 or November 2026/March 2027; M8, B2/C2/P2, Unit 7 and Further Maths in Summer 2028). Note the constraints: **November 2027 is resit-only for Maths** and **March 2028 has no Science**, so a Year 11 who wants a November attempt must use November 2026.

| Window | Calendar facts | What the platform does |
|---|---|---|
| **Birthday → early Oct 2026** | — | Diagnose everything in scope (4–6 misconception-tagged items per node, with confidence); Equation Vault and Glossary Deck to criterion; Target blocks start on the Section 2 list, highest marks-at-stake first. |
| **Oct → 19 Nov 2026** | November series: DAS unit 1s Mon 9 Nov (B1), Tue 10 Nov (C1), Wed 11 Nov (P1); **M1–M4 Tue 17 Nov**; **M5–M8 Thu 19 Nov**. Results Thu 4 Feb 2027. Last November open to first-time Maths entries. | If she is entered: a six-week sprint on that unit — retention raised to 0.93, weekly timed sections from week 2, full paper in weeks 4 and 5, paper-eve card. If not: normal loop. |
| **1 Dec 2026 → 1 May 2027** | Unit 7 Booklet A window (3 × 1 h practicals, 15 marks each). | Practical Studio modules front-loaded so the Booklet A skills (tables, graphs, units, 2 d.p. masses) are fluent before the school schedules the tasks. |
| **Jan → Feb 2027** | March series (Science only): B1 Mon 22 Feb, C1 Wed 24 Feb, P1 Fri 26 Feb (9.30). Results Thu 15 Apr 2027. Last March series with Science. | Mock cycle 1 (past series, UMS-calibrated) for every unit in scope; ledger produces the first "top 10 traps". |
| **Mar → mid-Apr 2027** | — | Retention 0.93; mock cycle 2 on a different series; Practical Studio Booklet B timed sets; QWC weekly. |
| **Mid-Apr → exam eve** | — | Weekly full papers per unit in rotation; Non-calc Five daily; the last 14 days are retrieval and mixed practice only, no new topics. |
| **Exam run, Summer 2027** | Tue 11 May B1 (pm) · **Fri 14 May M1–M4 (am)** · Mon 17 May C1 · **Tue 18 May FM Unit 1 (am)** · Tue 25 May P1 · **Thu 27 May M5–M8 (P1 9.15, P2 10.45)** · Wed 2 Jun B2 + Biology Booklet B · Fri 4 Jun FM Unit 2 (pm) · Thu 10 Jun C2 + Chemistry Booklet B · Mon 14 Jun P2 + Physics Booklet B · Tue 15 Jun FM Unit 3 (am). Contingency Wed 23 Jun. | "Next paper only" mode: the queue re-weights to the next exam; the paper-eve card the night before each (traps, what is and is not on the formula sheet, calculator mode, ruler/protractor/black ink, timing plan). No sessions on paper mornings. |
| **Results Thu 19 Aug 2027** | — | Retro screen: predicted vs actual UMS per unit; for Shape B, the Year-2 plan starts (M8 and completion units for Summer 2028). |

---

## 5. Content plan

### 5.1 Taxonomy and counts

The unit is the primary navigation object and checklists are cumulative (M8 assumes M1–M7; 04 §5.1). Topic nodes are the unit of authoring.

| Subject | Nodes (full) | Notes | Worked examples | Diagnostic MCQs (misconception-tagged) | Practice questions (with answers) | Exam-style questions (with M/A/B schemes) | Find-the-mistake | Videos to embed / link | Sims and interactives |
|---|---|---|---|---|---|---|---|---|---|
| GCSE Maths Higher (M3, M4, M7, M8 + the M1/M2/M5/M6 prerequisites the reports flag) | ~75 | 75 (≤300 words + one informational diagram each) | ~110 | ~375 (5/node) | ~750 (10/node) | ~180 | ~75 | ~120 Corbettmaths videos (from the M3/M4/M7/M8 checklists), ~20 NI Maths Tutor paper solutions | ~25 Mafs/JSXGraph interactives; ~6 GeoGebra applets (3D solids, constructions, loci) |
| GCSE Maths Foundation (M1, M2, M5, M6) | ~60 | 60 | ~70 | ~300 | ~480 | ~90 | ~40 | ~100 Corbettmaths (M1/M2/M5/M6 checklists) | reuse |
| Further Maths U1 / U2 / U3 | ~22 / ~12 / ~12 = 46 | 46 | ~70 | ~230 | ~460 | ~110 | ~30 | NI Maths Tutor FM playlists where available; otherwise none (link CCEA Q&A booklets and fact files instead) | ~12 (trig graphs, tangents/normals, force diagrams, v–t graphs, normal curve) |
| Double Award Science | 41 section pages (7 + 6 + 9 + 9 + 5 + 5 for B1…P2) with 419 LO checklists; 18 practical modules | 41 section notes + 18 practical modules | ~60 calculation and QWC models | ~200 | ~450 retrieval prompts (definitions, equations, phrases, sequences) | ~120 structured questions + 144 Booklet-B items (8 per practical) | ~40 | Science Shorts (5), Chemistry Chicken (8), PhysicsRocksItsTrue, GCSE Physics Online CCEA free videos | ~30 PhET sims (05 §2.11 table) with CC BY-NC attribution; ~15 label-from-memory diagrams |
| Cross-cutting | Equation Vault 25 + 8 conversions; Glossary Deck ~180 terms (three glossaries); QWC models 21 (3 per unit paper incl. Booklet B) | | | | | | | | |

Totals at the end of Phase 2: roughly **240 nodes, 300 worked examples, 1,100 diagnostics, 2,100 practice items, 640 exam-style items, 185 find-the-mistake items, ~260 video links/embeds, ~90 interactives and sims.**

### 5.2 What a topic node contains ("what you actually need to know")

1. **Spec line and scope**: the exact CCEA statement(s) and the Teacher Guidance exclusions in plain words (e.g. "completing the square is excluded from M4"; "the ambiguous case of the sine rule is excluded from M8"; "no transformations of trig graphs in FM Unit 1"; "P(1 < z < 2) is not asked"). Sources: 01 §4–5; 02 §4; 03 §5.
2. **Formula-sheet status**: given / must be recalled (01 §4; 02 §4; 03 §5.9).
3. **The note**: ≤300 words, one informational diagram, the method as a decision ("I notice a right angle and two sides, so Pythagoras before trig", 06 §12).
4. **Examiner's warnings**: 2–4 lines from Section 2 in our own words, cited to the report.
5. **Worked example(s)** as WorkedExampleAsQuestion; **Your Turn** twin; **faded** completions.
6. **Diagnostics** (4–6) with tagged distractors; **practice** (8–12) in a variation sequence then mixed; **exam-style** (2–3) with mark scheme; **find-the-mistake** (1).
7. **Links**: CCEA paper deep links by question metadata; Corbettmaths video number; Bitesize; NI Maths Tutor; sim.

### 5.3 Authoring pipeline (AI-drafted, verified)

```
1 SEED      spec statement (Maths/FM: from the spec + Teacher Guidance; Science: data/spec JSON id,
            e.g. P1 1.4.17) + examiner evidence lines (Section 2) + formula-sheet status
2 DRAFT     AI drafts note, worked example, diagnostics, practice, exam-style + mark scheme
            into the Zod schema (10 §9.2): Question → Part → answer.kind, MarkPoint[M|A|B|QWC],
            commonErrors[], each distractor with a misconception tag
3 AUTOCHECK KaTeX renders (htmlAndMathml); numeric answers recomputed with compute-engine/mathjs;
            algebraic answers pass isIdenticallyEqual; marks sum; calculator and tier flags set;
            every distractor tagged; n-gram similarity check against the privately downloaded
            CCEA papers/mark schemes and Corbettmaths PDFs (reject > 8-word overlaps)
4 VERIFY    human pass (the developer, 15–30 min per node) with the QA rubric below; two official
            mark schemes open for style; the spec exclusions checked
5 PUBLISH   "verified" badge; unverified items never appear in her queue
6 FIELD QA  her "flag this" button files a ticket with the item id and her answer; any item with
            > 40% confident-wrong responses is re-reviewed; parameters re-optimised monthly
```

**QA rubric** (score 0/1/2 on each; publish at ≥ 16/20 with no zero on 1, 5 or 10):
1. Spec-exact (right unit, right statement, right tier).
2. In scope (no excluded methods; formula-sheet status correct).
3. CCEA style (command words, mark allocation, answer line, calculator flag, layout).
4. Mark scheme in M/A/B with follow-through and a stated final-answer rule.
5. Answer independently verified (computation or second solution).
6. Every distractor tagged to a named misconception with a specific explanation.
7. Feedback is process-level plus a next step (a twin to fix it now).
8. Diagram is informational; labels on the figure; no decoration.
9. Accessible: alt text, MathML output, tap alternative for any drag.
10. No third-party copyright (no CCEA, Corbettmaths, BBC or textbook wording).

### 5.4 Linked instead of authored

| Linked (with attribution) | Why not authored |
|---|---|
| CCEA past papers and mark schemes (feeds 504/507/584; `#page=N` deep links; link-health monitor for five-year removals and `_0` renames) | Copyright: "not permitted to distribute the content via electronic means… store it in a retrieval system" (08 §5). |
| CCEA Specimen Assessment Materials, 2021/22 Practice Papers, FM Q&A booklets (Units 1–3), FM and DAS fact files, Practical Manuals, glossaries, Exemplification of grade A performance, Teacher Guidance, Chief Examiner reports | Official, free, already good; our value is pointing to the right page at the right time. |
| Corbettmaths videos (YouTube privacy-enhanced embed; oEmbed confirms embedding is enabled), practice-question and textbook-exercise PDFs, CCEA checklists, booklets, practice papers | Terms: "link rather than upload", "never… individual questions… within other resources that are redistributed" (04 §2.1). |
| BBC Bitesize CCEA GCSE Maths (M1–M8 guides) and Double Award pathway (article ids in 05 §1.2) | BBC copyright; no embed facility; good explanatory text. |
| NI Maths Tutor full video solutions for every M4 and M8 paper 2022 – May 2026 | Already exists and is free (04 §2.20). |
| Keady Maths topic-sorted CCEA past-paper questions (M2–M8) | Exists (09 §7.2); link with a copyright caveat. |
| PhET sims (iframe with the CC BY-NC attribution line and visible logo), GeoGebra applets ("Made with GeoGebra" attribution) | Non-commercial use permitted (05 §2.11; 07 §6). |
| Science Shorts, Chemistry Chicken, PhysicsRocksItsTrue, GCSE Physics Online CCEA section | Verified NI-relevant video (05 §2.19–2.20). |

---

## 6. Information architecture and data model

### 6.1 Routes (Next.js App Router, `output: 'export'`, `trailingSlash: true`, all dynamic routes enumerated with `generateStaticParams`)

| Route | Screen | Phase |
|---|---|---|
| `/` | **Today**: review inbox (single CTA), target block, exam habit, next-paper countdown. Bento only here (≤ 8 tiles). | 0 |
| `/map` | **Exam Map**: units, series, dates, rules (terminal 40%, one resit, Nov 2027 cut-off), UMS forecast per unit, A\* band. | 0 |
| `/maths` → `/maths/[unit]` → `/maths/[unit]/[topic]` | Unit overview with cumulative checklist; topic node with tabs Learn / Practice / Exam / Links. Units: m1–m8. | 0 (m4, m8 + flagged m3/m7 nodes) |
| `/further-maths/[unit]/[topic]` | u1, u2, u3. | 0 (u1 top-six) / 1 |
| `/science/[unit]/[section]` | b1, c1, p1, b2, c2, p2 section pages with LO checklists (from `data/spec/double-award-science.json`, tier-filtered). | 0 (units in scope) / 1 |
| `/science/practicals/[code]` | 18 Practical Studio modules. | 0 (3) / 1 |
| `/science/equations`, `/science/glossary` | Equation Vault; Glossary Deck. | 0 |
| `/practice` | Mixed-practice builder: unit(s), calculator/non-calculator, marks, time, item types. | 0 |
| `/mock` → `/mock/[paperId]` | Timed mode; self-mark against the scheme; UMS conversion; ledger filing. Phase 0 = official-paper deep-link mode; Phase 1 = original mocks. | 0 / 1 |
| `/review` | The full FSRS queue and forecast. | 0 |
| `/ledger` | Mark Ledger: losses by tag, misconception profile, calibration (confidence vs accuracy), top 10 traps. | 0 (basic) / 1 |
| `/library` | Past-paper index by series and unit (deep links), linked resources by topic. | 0 |
| `/settings` | Retention target, theme, reduced motion, data export/import (JSON). | 0 |

### 6.2 Data model (Dexie, IndexedDB; content is static JSON/MDX in the repo)

```
Profile        { id, name, startDate, tierPrefs, retentionTarget }
ExamPlan       { unitCode, series, date, paperDates[], tier, cashIn: boolean }
SpecStatement  { id (e.g. "M4.3.2", "P1-1.4.17", "FM1-diff-3"), unit, text, tier, exclusions[], formulaGiven }
Topic          { id, unit, title, specIds[], prerequisites[], marksAtStake, mdxPath }
Question       (10 §9.2 Zod schema) { id, topicId, specIds[], source: original|pastPaperStyle,
                 calculator, tier, difficulty, parts[]: { answer.kind numeric|algebraic|mcq|text|drawing,
                 scheme: MarkPoint[{ code M|A|B|QWC, marks, description, followThrough }],
                 commonErrors[{ pattern, misconceptionId, feedback }], methodLock?: "hence"|"showThat"|... } }
Misconception  { id, specIds[], label, examinerRef (report + question), reprobeItemIds[] }
Attempt        { id, questionId, partId, mode learn|mixed|exam, answer, marksAwarded[], errorTags[],
                 confidence 1-5, durationMs, at }
Card           { id, itemId, kind prompt|question|misconception|equation|definition, unitCode,
                 examDate, fsrs: { due, stability, difficulty, state, last_review } }
ReviewLog      { cardId, rating, at, elapsedDays, scheduledDays }   // for later parameter optimisation
MockSession    { id, paperRef (official paper id or original mock id), unitCode, series, startedAt,
                 durationMs, perQuestion[{ q, marksSelf, marksPlatform, tags[] }], raw, ums, grade }
Resource       { id, type video|pdf|sim|article|paper, provider, url, videoNumber?, topicIds[], licenceNote }
PaperIndex     { id, feed 504|507|584, series, year, unit, tier, paperUrl, msUrl, changed, pageMap?[{ q, page, topicIds[], marks, calc }] }
```

UMS conversion is data, not code: `data/boundaries/*.json` holds the fixed unit UMS scales (01 §2.2; 02 §2) and the per-series raw boundaries (01 §2.3; 02 §2; 09 §2.3), and the engine interpolates raw → UMS within the published bands, labelling A\* as a band.

---

## 7. Visual and interaction concept

Aligned with 07 §7: serious, monochrome plus one accent, one type family, light default (exam papers are black on white), motion 150–300 ms and transform/opacity only, `MotionConfig reducedMotion="user"`, WCAG 2.2 targets (24 px minimum, 44 px on answer buttons), tap alternatives for every drag, colour never the only signal, KaTeX `htmlAndMathml`.

**Palette and type.** Off-white ground (#fafafa), near-black ink (#171717), a 200-step neutral grey with reduced blue chroma, a single accent used only for "the thing to do next" (LCH-generated from base/accent/contrast so dark and high-contrast themes come free — Linear, 07 §3). Inter for UI with `tnum` for score tables; KaTeX fonts for maths; STIX Two Text optional for long notes. No mascots, no decorative imagery, no background music.

**Density.** Notes are short and interrupted: nothing longer than ~150 words without an interaction (07 §7.1). One question per screen in practice. The dashboard is the only bento.

### Signature moments

1. **The Ledger opens.** After a mixed set, the marks appear as a single row of small squares; lost marks flip to hairline outlines and settle under their tag headings (method / accuracy / misread / presentation / not attempted). One sentence beneath: "7 marks lost. The 2 misreads are the cheapest to recover." Motion: 200 ms, transform only.
2. **Bounds Ladder.** She types "50 kg to the nearest 5 kg"; the number line shades 47.5 to 52.5 and the two bounds slide into a two-column table that must be complete before the calculation field unlocks. Typing 45 produces the specific message from the report.
3. **Theorem Chain.** A JSXGraph circle with a tangent and a chord; tapping a reason from the phrase bank highlights exactly the angles it justifies; the reason line composes itself with the key words ("alternate segment theorem") and refuses to accept "Z angles"-style shorthand.
4. **Histogram median.** Bars drawn from her frequency-density inputs; she drags a vertical line and the area to its left fills; the readout shows the cumulative frequency and stops changing colour when it reaches n/2.
5. **Equation before numbers.** In a physics calculation the answer box shows two lines: the equation line accepts symbols only, gives a quiet tick when it matches the vault, and only then opens the substitution and answer lines with the unit picker. The March 2026 examiner sentence appears once, the first time, and never again.
6. **Force-Diagram Check.** Arrows are dragged (or tapped) onto a body on a slope; the checklist ticks in order; the pulley card shows the 2T resultant when both tensions are placed.
7. **The UMS dial.** After a mock: raw → UMS → grade drawn as a single arc; the A\* band (393–394) is a thin bracket at the top and the caption says the gap in raw marks on this unit.
8. **Paper-eve card.** The night before each paper: her ten traps, what is and is not on the formula sheet for that paper, calculator mode/ruler/protractor/black ink, the timing plan (marks per minute), and one line: "Nothing new tonight." Reduced-motion safe; printable.

Celebration is reserved for three events (first Proficient in a unit, unit Mastered, "exam-ready" on a paper) and lasts 1.2 s (FEAT test, 07 §3).

---

## 8. Phased roadmap

### Phase 0 — the birthday version (about two weeks; ~90 hours; content over features)

**In**

| Item | Budget |
|---|---|
| Exam Map with the real 2026–27 dates and rules; UMS engine with 2025/2026 boundaries; A\* band | 6 h |
| Today page: review inbox (ts-fsrs, exam-date cap, hypercorrection re-probe), target block, exam habit, close | 10 h |
| Topic node template (Learn / Practice / Exam / Links) with numeric, MCQ and short-text answer types; algebraic answers shown against the solution for self-marking (MathLive + compute-engine deferred to Phase 1) | 10 h |
| **30 Maths nodes**: the 12 M4 nodes, the 20 M8 checklist topics collapsed to 14 nodes, and 4 flagged M3/M7 prerequisites (reverse percentages, algebraic fractions, arc/sector, simultaneous equations). Each: note + 1 worked example + 4 diagnostics + 6 practice + 1 exam-style with scheme (= 30 notes, 30 worked, 120 diagnostics, 180 practice, 30 exam-style) | 22 h (AI-drafted; ~45 min verification each) |
| **6 FM Unit 1 nodes** (algebraic fractions, tangents/normals and derivative conditions, log laws, optimisation, forming three equations, integration from a gradient), same shape | 5 h |
| **Equation Vault** (25 equations + 8 conversions) and **Glossary Deck** for the science units in scope this year (own short paraphrases containing the examiner key words; linked to the official glossaries) | 4 h |
| **3 Practical Studio modules** chosen for the units in scope (e.g. P2 Hooke's law, C1 reactions of acids, B3 enzymes) with 8 Booklet-B-style items each | 5 h |
| **4 interactives**: Bounds Ladder, Theorem Chain, Histogram median, Circle & Tangent (Mafs/JSXGraph already installed) | 10 h |
| Mark Ledger v1 (tags + confidence + top traps) | 4 h |
| Mock mode v1: official past paper by deep link; per-question mark entry against the official mark scheme; UMS conversion; ledger filing | 4 h |
| Linked Library: ingest feeds 504/507/584 into `PaperIndex`; Corbettmaths video numbers for the 36 nodes; NI Maths Tutor solution links | 4 h |
| Gift layer: welcome note, birthday-dated start, results-day milestones (4 Feb, 15 Apr, 19 Aug 2027) | 2 h |
| Polish pass on the four surfaces that matter (answer button, feedback card, review-complete, mastery chip); light/dark; reduced motion | 6 h |

**Out (deliberately):** Foundation content; FM Units 2 and 3; full Double Award section pages; QWC Builder; MathLive input and algebraic auto-marking; Excalidraw working canvas; 3D; PWA offline; AI tutor; original full mocks; calibration charts.

**Why it is already worth her time on day one.** Nothing she owns tells her which unit-paper combination she is sitting and what A\* costs in raw marks on each (Pillar 1); nothing converts her mocks to UMS (Pillar 11); nothing gives her original M4/M8 questions with mark schemes on the exact topics the examiners list as where marks are lost (Pillars 2–3); nothing schedules the physics equations and her own errors to return before she forgets them (Pillars 4, 7). Those four are complete in Phase 0.

### Phase 1 — weeks 3–10 (to mid-November 2026)

Complete the Higher taxonomy (≈75 nodes) and FM Unit 1; FM Units 2 and 3 core nodes; all 18 Practical Studio modules before the 1 December Booklet A window; Double Award section pages with LO checklists and retrieval prompts for the units in scope; QWC Builder; MathLive input with compute-engine three-stage equivalence (10 §10.3); find-the-mistake bank; method-locked item type; Transformation Stepper, k/k²/k³, trig graphs, force diagrams, PhET embeds; original full mocks (two per unit); Mark Ledger v2 with calibration; PWA offline (post-build Serwist, 10 §8.3). If she is entered for a November unit, the sprint mode ships first.

### Phase 2 — December 2026 to March 2027

Foundation pack (M1/M2/M5/M6) for completeness and in case of tier changes; remaining Double Award units; FM Units 2 and 3 complete; R3F 3D for 3D trigonometry, solids and lattices; Excalidraw working capture for multi-mark items; label-from-memory diagrams; monthly cumulative mocks; parent/giver read-only view; Irish-medium term toggle if wanted (09 §10).

### Phase 3 — April 2027 onward

Exam-run mode (paper-eve cards, between-paper re-weighting, "next paper only"); optional Claude marking of photographed working via a serverless function with structured outputs (10 §13) — never in the static bundle; results retro on 19 August 2027; bridge-to-AS content (CCEA A level Maths); for the two-year shape, the Summer 2028 plan (M8, B2/C2/P2, Unit 7, FM), respecting that November 2027 is resit-only and March 2028 has no Science.

---

## 9. What not to build, and what to link instead

| Not building | Why |
|---|---|
| Re-hosted or transcribed CCEA papers, mark schemes or glossary text; iframes of CCEA PDFs | Copyright notice forbids electronic distribution and retrieval-system storage; the site blocks iframes (08 §5). Deep-link with `#page=N`. |
| Copies of Corbettmaths questions, checklists or booklets | Terms forbid inclusion "within other resources that are redistributed" (04 §2.1). Embed the videos, link the PDFs. |
| A video course | Corbettmaths, NI Maths Tutor (every M4/M8 paper solved on video), Science Shorts, GCSE Physics Online already exist; watching does not count as learning (06 §13). |
| Generic notes for every M1–M8 topic | Bitesize has ~108 bespoke CCEA guides (04 §2.9); CGP/Hodder cover it. Our notes are short and examiner-driven. |
| Leaderboards, XP, hearts, daily streaks with loss, badges for logging in | Hanus & Fox 2015 lower exam scores; Deci 1999 d ≈ −0.40; Sparx complaints (06 §14; 07 §2.2, §2.7). |
| An AI chat tutor in Phase 0 | Static export has no server; marking accuracy unverified; cost; the worked solutions and hints do the job first (10 §13). |
| FM Unit 4 | Zero candidates in 2022, four in 2023 (02 §3). |
| 9–1 grades as a primary scale | NI keeps A\*–G; only a tooltip equivalent (09 §3, §9.4). |
| Desmos or tldraw integrations | Licence terms unreadable or proprietary (07 §6; 10 §4, §11). Mafs, JSXGraph, Excalidraw instead. |
| A generic "how to revise" module | Metacognition only works inside subject content (06 §12). |
| Predicted papers | Invites false confidence; the reports already say which question types recur. |
| Accounts, social features, a backend | One user; data lives in IndexedDB with JSON export. |
| Foundation-first content | She is on M4 + M8; Foundation ships in Phase 2 as insurance. |

**Things others already do well, which we link and do not duplicate:** Corbettmaths (videos, textbook exercises, CCEA checklists, "Ultimate" booklets, Set A/B practice papers, "A Bit of Everything"); BBC Bitesize CCEA Maths and Double Award pathways including the 18 prescribed-practical pages; CCEA (papers, mark schemes, specimen materials, 2021/22 practice papers, FM Q&A booklets and fact files, DAS fact files, practical manuals, glossaries, grade A exemplification, Chief Examiner reports); NI Maths Tutor (paper video solutions); GCSE Physics Online CCEA section; Keady Maths topic-sorted questions; PhET; Science Shorts; Chemistry Chicken.

---

## 10. How we will prove it works for her

This is an n = 1 design with no control group, so the proof is within-person, pre-registered, and expressed in the exam's own units.

| Measure | Baseline (weeks 1–3) | Cadence | Success criterion (pre-registered) |
|---|---|---|---|
| **Node diagnostics** (4–6 misconception-tagged items + confidence per node) | All nodes in scope | Re-diagnose each node after ≥ 7 days (delayed, not immediate; 06 §11) | ≥ 80% of nodes at Proficient (≥ 80% on a delayed mixed check) by the end of Phase 1; Mastered requires sustained performance on later cumulative tests with downward movement allowed (07 §2.3). |
| **UMS-calibrated mocks** on unseen past series (Summer 2024 → Nov 2024 → Summer 2025 → Nov 2025 → Summer 2026 once its mark schemes are published) | One M4 and one M8 paper (P1 + P2) under real timing; FM Unit 1; one paper per DAS unit in scope | Every six weeks; the developer double-marks one paper per cycle to check her self-marking | By mock cycle 3 (February 2027): M4 ≥ 80/100 and M8 ≥ 85/100 raw under timing (consistent with the reported A\* profile of 77 and 90, 09 §2.3); FM Unit 1 ≥ 80/100 raw (unit-a was 66–72); DAS unit papers ≥ 85% raw at Higher; Booklet B sets ≥ 30/35. |
| **Mark-loss decomposition** (per mock, by tag) | First mock | Every mock | Misread + presentation + not-attempted losses → ≤ 2 marks per paper by cycle 3; method-mark losses on the Section 2 "hardest question" topics halved between cycle 1 and cycle 3. |
| **Retention forecast** (FSRS predicted recall on paper day, per item) | After first reviews | Weekly on the week card | Items with predicted recall < 90% on the paper date trend to zero by the last fortnight; Equation Vault 25/25 at criterion in three spaced sessions by week 3, then maintained. |
| **Hypercorrection** | — | Re-probe at 1–3 days and ~7 days | ≥ 80% of confident-wrong items answered correctly at the one-week re-probe (Butler 2011 says they return otherwise). |
| **Calibration** (confidence vs accuracy per topic) | First 200 answers | Monthly | Over-confident topics (confidence high, accuracy low) shrink each month; shown to her, not hidden (06 §12). |
| **Process** (not vanity) | — | Weekly | ≥ 4 sessions/week, median 30–45 min; time-to-mastery per node recorded (Rawson & Dunlosky 2022 treat it as the outcome, 06 §4). No minutes-logged targets. |
| **External check** | — | School mock UMS when available; results days 4 Feb 2027 (if November entries), 15 Apr 2027, 19 Aug 2027 | Platform-predicted UMS within ±10 of the awarded UMS per unit. |

Honesty rules: report every mock, not the best; never adjust a boundary to make a forecast look better; the A\* band is displayed as 393–394 with the note that it is re-derived each series (09 §9.6).

---

## 11. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| **A wrong answer or wrong mark scheme in AI-drafted content** teaches an error | High / high | The pipeline in §5.3 (independent recomputation, n-gram check, human verification, QA rubric, "verified" gate); her flag button; any item with > 40% confident-wrong responses is pulled for review. |
| **Copyright** (CCEA papers, mark schemes, glossary; Corbettmaths; BBC) | Medium / high | Deep links only; no re-hosting; private, non-commercial, non-indexed deployment; attribution everywhere; glossary cards are our own short paraphrases containing the key words. If the platform is ever shared beyond her, ask CCEA (info@ccea.org.uk / subject officer) before anything is reproduced (08 §11.7). |
| **Two weeks is not enough** | High / medium | The Phase 0 list is fixed; content beats features; MathLive, PWA and 3D are explicitly deferred; the app template is built once and reused for all 36 nodes. |
| **She does not use it** | Medium / high | Review-first home page with one CTA; 30-minute sessions; weekly streak with a freeze, never a penalty; the exam map makes every session's purpose visible; the brother checks the week card with her on Sundays; no nagging notifications. |
| **Wrong assumptions about her entries** (Year 11 vs 12; November 2026 entry; tier) | Medium / medium | The Exam Map is editable data; both year shapes are supported; the November 2027 and March 2028 changes are encoded as warnings. |
| **Mafs is stale** (no release since October 2024) | Medium / low | Pin the version; wrap every diagram in one component; JSXGraph as the fallback (10 §4). |
| **Boundaries move** | Certain / low | Boundaries are data with a series selector; A\* is always a band; forecasts show a range. |
| **Anxiety and burnout** (DE survey: "permanent state of assessment") | Medium / high | Bounded sessions; timed mode only after mastery and ramped from 1.5× time; no public comparison; retrieval framed as anxiety-reducing (Agarwal 2014); "nothing new tonight" on paper eves. |
| **Foundation neglect if the school changes her tier** | Low / medium | Data model supports M1–M8 from day one; Foundation pack in Phase 2. |
| **Self-marking bias inflates mock scores** | Medium / medium | Developer double-marks one paper per cycle; rubric training before the first mock; the platform's M/A/B scheme is applied after hers and the discrepancy is shown. |
| **YouTube offline / PhET terms** | Low / low | Video badged "online only"; PhET used via iframe with CC BY-NC attribution because the site is non-commercial and ad-free; nothing monetised. |
| **Windows tooling** (paths, PowerShell script policy, Defender watch) | Medium / low | Move the repo to a short path without spaces; `npm.cmd`; Defender exclusion (10 §15). |
| **Spec reform** | None before September 2029 first teaching (09 §9.4) | Unit structures and grade scales are data, not code. |

---

## Appendix — research files used

01 CCEA GCSE Mathematics spec and Chief Examiner reports (§2 structure and boundaries, §4 formula sheet, §5 content, §6 timetables, §9 reports, §9.5 synthesis) · 02 Further Mathematics (§2 boundaries, §4 content and exclusions, §6 dates, §8 reports, §9 implications) · 03 Double Award Science (§2 structure, §5.9 physics equations, §6 dates, §7 reports, §10 gaps) · 04 Maths platforms audit (§1 table, §2.1 Corbettmaths terms and checklists, §4 gaps, §5 implications) · 05 Science platforms audit (§1 Bitesize map, §2.11 PhET, §4 gaps) · 06 Learning science (§1 summary table, §2–§17) · 07 Design (§2 products, §3 polish, §4 accessibility, §6 licences, §7 principles, §8 components) · 08 Past papers and question banks (§3 feeds, §5 copyright, §9 Corbettmaths mapping, §11 legal build) · 09 NI context (§2 grade statistics and boundaries, §5–6 timelines and dates, §7 student voices, §9 changes, §10 gift ideas) · 10 Technical stack (§0 recommended stack, §9 schema, §10 answer checking, §13 tutor, §15 Windows) · `data/spec/README.md` and `double-award-science.json`.
