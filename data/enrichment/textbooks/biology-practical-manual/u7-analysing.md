# u7-analysing: Practical Manual dossier (data handling, across the biology practicals)

**Book.** CCEA's GCSE Double Award Science Biology Practical Manual (an eGuide), © CCEA 2024, 34 printed pages (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 2.
**Ours.** `packs/science/content/u7/u7-analysing/note.blocks.json` and `bundle.json`, read in full on 7 Oct 2026.
**Spec.** Unit 7, Analysing experimental data (our skill ids U7.3.1–U7.3.6): record observations and data, discrete or continuous; accuracy, reliability and validity told apart; mathematical techniques for relationships; scales and axis labels; anomalous results; plotting and the right line.
**Scheme evidence.** Booklet A schemes 2019, 2021, 2022 Higher, 2023, 2025 (`docs/sources/papers/science/<series>/U7-*-Biology-BkA-MS-*`); Booklet B graph and anomaly parts 2019, 2021, 2024 (`U7-*-Biology-BkB-MS-*`); Unit 7 Booklet A sections of the Chief Examiner's reports 2023–2025.
**Verdict.** The book is **richer** than our note **for biology** and thinner overall. Our analysing note and all eighteen of its bundle questions use physics and chemistry contexts (runway, spring, wire, gas syringe, a cross under a flask); biology appears only as one sentence on joining points. Every biology Booklet A task is a data-handling task, and the book supplies the biology versions: signed changes, percentage change, a graph with negative values, rates scaled to an hour, category data. It is thinner on anomalies, scales, lines of best fit and gradients, which it never teaches.

---

## 1. Where in the book

Tables and processing: pp. 9–11 (rise, energy per gram, percentage of a stated value), 13 (froth heights), 16 (counts beside three abiotic readings), 19–20 (signed change, percentage change, the graph grid), 24 (bag masses), 27 (loss in mass), 30 (distance, rate per hour), 32 (change in mass, rate per hour). Accuracy and reliability: p. 10.

## 2. What the book teaches about data, practical by practical (our words)

| Data skill | Where (page) | What it shows |
|---|---|---|
| Recording to a stated precision | Masses to one decimal place (pp. 9, 19, 26); froth in mm (p. 13); bubble in cm (p. 29). | The table's heading and the instruction set the precision; Booklet A gives a mark for it. |
| Signed changes | Every change in mass gets + or − (p. 19). | A loss and a gain are different results; CCEA 2025 Booklet A Q1(d) pays a mark for the signs. |
| Worked columns | Rise (p. 9); change and percentage change (p. 19); loss in mass (p. 26); distance moved (p. 29); change in mass (p. 32). | Derived columns sit to the right of the readings they come from. |
| Rates scaled to an hour | Ten-minute distance × 6 (p. 30); 24-hour change ÷ 24 (p. 32). | A rate in biology is an amount per unit time, not 1 ÷ time. |
| Percentage change | Change ÷ starting mass × 100, signed (p. 19). | Divide by the starting value. |
| Percentage of a stated value | Measured ÷ stated × 100 (p. 11). | 2940 ÷ 12 800 × 100 = 23 % to the nearest whole number. |
| A graph with negative values | Grid with the horizontal axis halfway up (p. 20). | Losses plot below the axis; the crossing is read off. |
| Category and arbitrary-unit data | Light as low, medium or high; moisture in arbitrary units (p. 16). | Not every column is a measured number with an SI unit. |
| Discrete and continuous | Daisy counts (p. 16) beside masses and lengths. | A count takes whole numbers only; the specification names the pair. |
| Accuracy against reliability | Stirring improves accuracy; repeats improve reliability (p. 10). | CCEA 2023 Foundation Booklet A Q1(f)(ii) and Q1(g). |

## 3. Where the book is better than our note

- **Biology contexts for every processing step**, and CCEA's marks attached to them: the sign on a change (2025 Booklet A, and the report: some lost the mark by leaving it off); one decimal place with a trailing zero (2025 report: 13 written for 13.0); the mean of two groups (2021, 2024, 2025 Booklet A; the 2024 and 2025 reports both describe A + B ÷ 2 typed straight into the calculator). Our note has the bracket rule for a mean, in physics.
- **A graph whose values go below zero** (p. 20). None of our analysing note's graphs has a negative axis; the osmosis graph in our b2 note does, but the analysing lesson never teaches where to put the axis or how to read a crossing.
- **Rates in biology are not 1 ÷ time.** Our note's worked-column paragraph says "A rate is 1 ÷ time", true for the cross-under-a-flask reaction it is written for, and misleading beside the potometer (distance per unit time) and the weight potometer (mass per unit time). The book's two rate rules, ×6 and ÷24, are the biology form.
- **Data that are not numbers** (p. 16): category data for light. Our note's recording paragraph treats every column as a number with a unit.

## 4. Where the book is worse, and what it leaves out

- **No anomalies.** Nothing on spotting, circling, repeating or excluding one. CCEA's biology papers ask it (2024 Higher Booklet B Q3(a)(i), 2 marks: the anomalous concentration, and the reason that it breaks the pattern of the rest); our note's anomaly section is good and needs a biology twin.
- **No scale choice, no plotting tolerance, no line rule.** The book says "draw a line graph" (p. 20) and stops. CCEA's biology convention is points joined with ruled straight lines: the 2019 Booklet B scheme gives 1 of its 3 graph marks for straight segments joining neighbouring points (Higher Q2(c)(ii), Foundation Q4(c)(ii)); the 2021 Higher Booklet B scheme credits ruled point-to-point joining within its 3 marks (Q4(a)); the 2024 Foundation Booklet A scheme gives 1 of 4 marks for joining point to point (Q1(c)), and the report adds that a best-fit line was not what examiners wanted; the 2025 Foundation report notes candidates completing the line with a ruler (Q1(h)). Our note states this in one sentence and one twin; the book does not state it at all.
- **No bar charts.** CCEA's biology papers use them (2022 Higher Booklet A Q2, with a mark for a scale using more than half the axis in even intervals; 2023 and 2025 Booklet B).
- **No gradients** (not needed in biology tasks; our note's gradient sections are physics, correctly).
- **Heading errors** that contradict its own convention: a percentage column headed in grams (p. 20); a rate headed "per hour" with no amount unit (p. 30).
- **No validity.** The book uses accuracy and reliability (p. 10) but never validity. The specification's wording is that validity is whether the experiment is suitable for the task; our note's "only the independent variable changes" is one part of that (a point from the specification, not from the book).

## 5. Diagrams and photographs

The only data figure is the empty osmosis grid (p. 20): percentage change in mass up the side, concentration (M) along an axis drawn across the middle, no scale numbers. Recreate as our own empty grid for a "place the axis first" step.

## 6. Calculations and data tasks

All computed and re-checked (`scratchpad/probes/dossier-biology-practical/numbers.mjs`): 2940 ÷ 12 800 × 100 = 22.97, so 23 %; 2.4 cm in ten minutes is 14.4 cm per hour (2.4 × 6, and 2.4 ÷ 10 × 60); 9.6 g in 24 hours is 0.4 g per hour; a cylinder from 3.6 g to 4.1 g changes by +13.9 %.

## 7. The book's data questions, and what CCEA's schemes credit

| Book question (page) | Scheme answer and source |
|---|---|
| Food 1–2: stirring, and why repeat (p. 10) | Accuracy: heat spread evenly. Reliability: repeats, a mean, anomalies seen (2023 F BkA Q1(f)(ii), (g)). |
| Food 5: percentage of the stated value (p. 11) | Measured ÷ stated × 100, rounded as told (2023 H BkA Q1(g)). |
| Osmosis 14 (method step): draw the line graph (p. 20) | Points plotted, joined point to point with a ruler (2025 F BkA Q1(h); the biology convention above). |
| Osmosis 3: no-change concentration (p. 21) | The crossing of the line with the zero axis (2025 F BkA Q1(i)). |
| Washing line 3: the trend (p. 27) | As area increases, loss in mass increases (2022 H BkA Q1(f)). |
| Transect 1: the trend (p. 17) | Increases, then levels off (2021 BkB Q1(b)(i)). |

## 8. Definitions and wording

- **Accurate**: close to the true value (the stirring question). **Reliable**: repeats agree (the repeats question). The book implies both; our note defines both and validity too.
- **Arbitrary units**: a scale with no standard unit (p. 16). Worth one line in our note.
- **Book slips, not to copy:** the percentage column's "/g" (p. 20); the rate columns' missing or loose units (pp. 30, 32).

## 9. Higher-tier-only content

None in the book. (In 2023 CCEA set the percentage-of-stated-value calculation on the Higher paper.)

## 10. Pitfalls the book builds in

- Sign every change (p. 19).
- Keep the stated decimal place (pp. 9, 19, 26).
- Say per what: per hour (pp. 30, 32).

## 11. GAPS in our note, ranked

1. **No biology at all.** Add one `variant` section built on the potato task (the 2025 Booklet A shape): signed changes, percentage change to one decimal place with the trailing zero, the axis placed halfway up, points joined with a ruler, the no-change concentration read from the crossing. Then a Your turn on our own numbers.
2. **Qualify "a rate is 1 ÷ time".** Rewrite the worked-column paragraph: in chemistry a rate is often 1 ÷ time; in biology it is an amount per unit time (cm per hour from a potometer; g per hour from a weight potometer), and a reading over ten minutes is scaled to an hour by × 6.
3. **The biology line rule given its evidence.** The one sentence on joining points should cite the schemes (2019, 2021, 2024, 2025) and sit in a See it, not only a twin.
4. **A biology anomaly.** Twin the anomaly gate with a biology table (for example, root lengths at five concentrations with one value off the trend; the 2024 Higher Booklet B shape), the answer naming the value and saying why it is out of line with the others.
5. **Category data and arbitrary units.** One sentence in the recording paragraph, with the transect table as the example.
6. **A bar chart.** One Your turn on choosing a scale for bars (more than half the axis, even intervals), the 2022 Booklet A mark.

## 12. Anything in our note the book suggests is wrong or misleading

"A rate is 1 ÷ time" (block [18]) is correct for the chemistry it describes but reads as a general rule; beside the book's potometer rates (pp. 30, 32) it would mislead her in a biology task. Qualify it (gap 2).
