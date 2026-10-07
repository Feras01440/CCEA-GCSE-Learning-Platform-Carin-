# pp-b5-osmosis: Practical Manual dossier

**Book.** CCEA's GCSE Double Award Science Biology Practical Manual (an eGuide), © CCEA 2024, 34 printed pages (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 2.
**Ours.** `packs/science/content/b2/b2-osmosis/note.blocks.json` (sections 6 and 7, blocks [23]–[31]) and `bundle.json`. Read in full on 7 Oct 2026. Read this beside the eGuide dossier `data/enrichment/textbooks/biology-unit-2/b2-osmosis.md`, which already covers the theory (equal concentration as a third case, % sucrose, the plasmolysed cell put back in water, the word "flaccid"); this file covers the practical.
**Spec.** Prescribed Practical B5, "investigate the process of osmosis by measuring the change in length or mass of plant tissue or model cells, using Visking tubing"; B2 2.1.1, 2.1.2, 2.1.3. Unit 7 apparatus list: Visking tubing, electronic balance, ruler. All Foundation.
**Scheme evidence.** The book's B5a is CCEA's 2025 Unit 7 Biology Booklet A (potato cylinders; `docs/sources/papers/science/2025-Summer/U7-H-Biology-BkA-MS-67243.txt`, `U7-F-Biology-BkA-MS-67234.txt`, paper `U7-H-Biology-BkA-Paper-67650.txt`) and close to the 2019 Booklet A (`2019-Summer/U7-H-Biology-BkA-MS-9975.txt`, `U7-F-Biology-BkA-MS-9954.txt`). Its B5b method (weighed Visking bags) is the one CCEA set in 2026 Higher Booklet B Q4 (paper `2026-Summer/U7-H-Biology-BkB-Paper-69357.txt`; no scheme yet). Chief Examiner's report 2025, Unit 7 Booklet A.
**Verdict.** The book is **richer** than our note on the practical: two complete methods, and the weighed-bag Visking design CCEA examined in 2026, which our note does not teach (ours uses the capillary-tube version). Our note is richer on why: cell states, the percentage-change divisor, the graph's zero crossing, the plant cell against the animal cell.

---

## 1. Book pages

B5a (potato tissue), printed pp. 18–21 (PDF 20–23): introduction, safety and apparatus p. 18; method and the percentage-change equation p. 19; results table and a graph grid p. 20; five questions p. 21. B5b (Visking tubing), pp. 22–25 (PDF 24–27): introduction, apparatus and the first thirteen steps p. 22; remaining steps and a photograph of the set-up p. 23; results table, a photograph of the bags afterwards and Questions 1–3 p. 24; Question 4 p. 25.

## 2. The book's methods, in order (our words)

**B5a, potato cylinders.**
1. Idea (p. 18): the membrane decides what enters and leaves; water molecules are small and cross it; osmosis is a kind of diffusion; water moves from the more dilute solution to the more concentrated one, so a cell gains or loses mass or length. Expected: some cylinders gain, some lose.
2. Label five 250 cm³ beakers and measure 100 cm³ of 0.0, 0.2, 0.4, 0.6 and 0.8 M sucrose into them (p. 19).
3. On a tile, bore five cylinders from one potato (a borer of at least 14 mm), trim any skin off the ends and cut each to 40 mm (p. 19).
4. Weigh each to one decimal place, record it, and put it in its beaker; leave for 24 hours (p. 19).
5. Take each out, blot it dry, reweigh to one decimal place (p. 19).
6. Subtract, and put a plus or minus sign on every change; then percentage change = change ÷ starting mass × 100, again signed (p. 19).
7. Plot percentage change against concentration on a grid whose horizontal axis runs across the middle, so losses plot below it (p. 20).

**B5b, Visking tubing bags.**
1. Idea (p. 22): the tubing stands in for the membrane, the liquid inside for the cytoplasm; a difference in concentration across it moves water in or out, and the bag's mass changes to match.
2. Soak three 30 cm lengths. Knot one end, rub the other open, put in 20 cm³ of liquid with a syringe, knot it, dry the outside, weigh it (pp. 22–23).
3. Bag 1 holds water, bag 2 holds 5 % sucrose, bag 3 holds 20 % sucrose. **Every bag stands in 5 % sucrose** in its own boiling tube (pp. 22–23).
4. After 24 hours, dry and reweigh each bag (p. 23).

So the outside is fixed and the inside varies: bag 1 is weaker than its surroundings and should lose mass, bag 2 is equal and should show no overall change, bag 3 is stronger and should gain.

## 3. Where the book is better than our note

- **The weighed-bag design.** Our note teaches Visking tubing only as a bag on a capillary tube whose level rises (block [28]). CCEA's 2026 Higher Booklet B Q4 weighed four bags of the same inside solution in four outside concentrations and asked why a percentage change was used, why one bag lost mass, and what the inside concentration might be from where the changes cross zero (on CCEA's figures, +40, +17, −8 and −18 % at 0, 5, 10 and 15 %, so between 5 and 10 %). The book's version varies the inside instead and includes an **equal** bag (5 % in 5 %), which is the third case the eGuide dossier also found missing.
- **What she should see** (photograph, p. 24): the bag that held water ends limp and wrinkled; the 20 % bag ends plump and tight. The book asks for that observation (Question 2). Our note has no observation of a bag at all.
- **Booklet A recording habits**, every one of them a mark in CCEA's schemes: the cylinder bored, trimmed and cut to one length; blotted before every weighing; masses to one decimal place; a **plus or minus sign** on every change (2025 Booklet A Q1(d), one mark; the 2025 report says some lost it by leaving the sign off); percentages to one decimal place **including a trailing zero** (the 2025 report: 13 written where 13.0 was needed).
- **A grid built for negative values** (p. 20): the horizontal axis sits halfway up. Our graph shows the shape; the book shows her where to start drawing.
- **Variables by name** are not asked in the book, but the same task in 2025 Booklet A Q1(f)/(g) asked her to tick each: final mass, dependent; concentration of sucrose, independent; volume of solution or time between weighings, controlled (one mark a row).

## 4. Where the book is worse, and what it leaves out

- **No reason for the percentage.** The book gives the formula with no why. CCEA asks the why (2019 Booklet A Q5: the cylinders had different starting masses; 2026 Higher Q4(a)). Our note's insistence on the starting mass as divisor is better; the eGuide dossier's gap 3 (same gain, different starting masses) answers the why.
- **The membrane is never called selectively permeable** in B5a (p. 18), though 2.1.2 defines osmosis through one and CCEA's B2 schemes give it a mark.
- **No cell states taught.** The book asks for the term for cells in water (turgid) without defining it; our note's three-state figure and red-onion photograph are far stronger.
- **Unit and wording slips** (section 8), including one that would mislead: concentrations are in M, but Question 3 asks for "the percentage sucrose solution" that gave no change, a leftover from CCEA's 2025 paper, which used 0, 5, 10 and 20 % solutions.
- **A 5 cm³ syringe to deliver 20 cm³** (p. 22) means four fills per bag; harmless, but a 20 cm³ syringe or measuring cylinder would be the better choice of apparatus, which is itself a Unit 7 skill.

## 5. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Our equivalent | Recreation note |
|---|---|---|---|---|
| Results table and graph grid (p. 20) | Six columns: beaker, concentration (M), starting mass, final mass, change, percentage change; a grid with percentage change up the side and concentration along an axis drawn halfway up. | Where her data go. | Our graph (crossing at about 0.45 mol dm⁻³). | Add the empty-grid step to a See it: place the axis at zero first, then plot. |
| Set-up photograph (p. 23) | Three boiling tubes in a wooden rack, numbered 1–3 and marked 0 %, 5 % and 20 %, each holding a knotted bag in liquid. Credited to a named photographer. | The B5b set-up. | **No.** | Draw our own: three tubes, each a bag of stated inside concentration, all labelled "5 % outside". Never use the photograph. |
| Bags afterwards (p. 24) | Three bags side by side: 0 % shrunken and crinkled, 5 % about as it started, 20 % fat and taut. | The observation for Question 2. | **No.** | Our own drawing of the three outcomes, with the words she should use: smaller, wrinkled, limp; unchanged; swollen, firm. |

## 6. Calculations and data tasks

- **Change in mass**, signed (p. 19).
- **Percentage change** = change ÷ starting mass × 100, signed, to one decimal place (p. 19). A check on our own figures for a dossier example: a cylinder from 3.6 g to 4.1 g changes by +0.5 g, and +0.5 ÷ 3.6 × 100 = +13.9 %.
- **Reading the no-change concentration** from the graph (p. 21, Question 3). CCEA's 2025 Higher Q1(k) extends it: two tissues on one graph; the one whose line crosses zero at the higher concentration has the more concentrated cell contents.
- A model See it for the weighed bags, on our own numbers (computed in `scratchpad/probes/dossier-biology-practical/numbers.mjs`): all bags in 5 % outside; water inside, 20.6 g to 18.9 g, −1.7 g, −8.3 %; 5 % inside, 21.3 g to 21.3 g, 0.0 g, 0.0 %; 20 % inside, 22.0 g to 25.1 g, +3.1 g, +14.1 %.

## 7. The book's questions, and what CCEA's schemes credit

| Book question (page) | Scheme answer and source |
|---|---|
| B5a 1: the change in water (p. 21) | Mass increases / gained (2019 H BkA Q6(a)(i); Foundation Q7). |
| B5a 2: the term for those cells (p. 21) | Turgid (2019 BkA Q6(a)(ii); 2025 H BkA Q1(h)). |
| B5a 3: the concentration with no change (p. 21) | Read where the line crosses zero, in the unit of the axis (M here, despite the question's "%"). 2025 F BkA Q1(i): 10 %, on CCEA's data. |
| B5a 4–5: the change in 0.8 M, and why (p. 21) | Decreases; water moved out of the potato into the solution, from the dilute to the concentrated solution (2019 BkA Q6(b), two marks). |
| B5b 1: what the tubing represents (p. 24) | The cell membrane (selectively or partially permeable). |
| B5b 2: what she saw in tube 1 (p. 24) | The bag is smaller, wrinkled, limp (an observation, not an explanation). |
| B5b 3–4: describe and explain bags 1 and 2 (pp. 24–25) | Bag 1 loses mass: water leaves through the tubing into the stronger 5 % outside. Bag 2: no overall change, because inside and outside are equally concentrated, so there is no net movement. (Water, never sucrose, is what moves: on one part of the 2025 Foundation Booklet A the report's commonest error was sucrose crossing the membrane.) |

## 8. Definitions and wording

- **Osmosis** (p. 18): a kind of diffusion in which water passes from the weaker solution into the stronger. The book leaves out the membrane's property; the specification's definition (2.1.2) includes it.
- **Visking tubing** (p. 22): a model of the cell membrane.
- **Book slips, not to copy:** "(water)" printed after the 0.4, 0.6 and 0.8 M solutions in step 2 (p. 19); "the table above" for a table that follows (p. 19); the percentage-change column headed with a unit of grams (p. 20); "weight" for weigh (p. 19); Question 3's "%" for M (p. 21).
- **Flaccid**: the book, like CCEA's schemes, names only turgid (and plasmolysed elsewhere). See the eGuide dossier, section 7, on our note's required answer "flaccid".

## 9. Higher-tier-only content

None in the book. (CCEA put the two-tissue comparison on the 2025 Higher paper only.)

## 10. Pitfalls and precautions the book builds in

- Cut the cylinders to **one length**, skin trimmed off (p. 19).
- **Blot dry** before every weighing, cylinders and bags alike (pp. 19, 22–23).
- Sign every change, **+** or **−** (p. 19).
- Knife and cork borer used on a tile, with care (p. 18).

## 11. GAPS in our note, ranked

1. **The weighed-bag Visking method is missing.** Add a `variant` section: a See it on three bags in a common 5 % outside (the numbers in section 6), the observation words for each bag, then a Your turn in the 2026 shape (one inside solution, four outside concentrations; which bag loses mass and why; what the inside concentration might be). Keep the capillary version as the second picture.
2. **Booklet A recording marks.** One `twists` paragraph and a gate: signed changes, one decimal place with the trailing zero, blot before weighing, one length for every cylinder. Cite the 2025 report.
3. **Variable classification for this task.** A three-row tick table (2025 shape): final mass, concentration, volume of solution.
4. **Comparing two tissues from their zero crossings** (2025 Higher Q1(k)): the further right the crossing, the more concentrated the cell contents.
5. **Units on the axis decide the answer's unit.** One option note: a crossing read off an M axis is given in M, whatever the stem says.

## 12. Anything in our note the book suggests is wrong or misleading

Nothing new. The eGuide dossier's point stands: our note and item `q.science.b2.b2-osmosis.0012(a)` require "flaccid", a word the book and CCEA's schemes never use; the book's Question 2 and CCEA 2025 Q1(h) both want turgid for cells that gained water.
