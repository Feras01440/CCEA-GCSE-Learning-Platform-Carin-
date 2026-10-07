# CCEA Biology Practical Manual: distilled per practical and per Unit 7 topic

**What this is.** CCEA's own GCSE Double Award Science Biology Practical Manual (an eGuide; © CCEA 2024; 34 printed pages, 36 PDF pages), read in full and compared with our notes. One dossier per prescribed biology practical the book covers (six, named and numbered as the specification names them) and one per Unit 7 topic (four), gathering what the book teaches about planning, carrying out, analysing and concluding across its ten investigations. Every dossier has the same twelve sections (the Unit 7 dossiers adapt the first two to where the skill appears and what the book teaches about it, practical by practical): book pages; the book's method in our words; where the book is better; where it is worse or silent; figures with recreation notes; calculations; the book's questions with the CCEA scheme lines that answer them (the book prints no answers); definitions and book slips; Higher-only content; precautions; our gaps, ranked; anything in our note the book or a scheme suggests is wrong.

**Source files.** `docs/sources/textbooks/GCSE Double Award Science Biology_ Practical Manual.pdf` and its `pdftotext -layout` text, both git-ignored. Page numbers in the dossiers are the book's **printed** numbers; **add 2 for the PDF page** (PDF 1 is the cover, which carries CCEA's risk-assessment notice; PDF 2 is blank; printed p. 1, the contents, is PDF 3; printed p. 34 is the back cover).

**Method (7 Oct 2026).** The text was read in full and all 36 pages rendered locally (pdfjs in Playwright, `scratchpad/probes/dossier-biology-practical/render-pages.mjs`); every page with a figure, photograph or table was inspected as an image, and font weights were extracted to find bold text (only headings and the balanced photosynthesis equation on p. 2 are bold). Our side: every note named in the dossiers read in full (`dump-note.mjs`), every bundle summarised (`dump-bundle.mjs`). Disagreements and the book's unanswered questions were checked against CCEA's Unit 7 Biology mark schemes 2019 and 2021–2025 (both tiers, both booklets, ticks read off the rendered scheme pages where the text layer drops them), the 2026 papers (no schemes yet) and the Unit 7 sections of the Chief Examiner's reports 2023–2025. Marking claims were probed through the app's engine (`probe-scheme-phrasings.mts`) on the working tree as it stood on 7 Oct, which carries uncommitted engine edits; re-probe once the engine work lands.

**What the book is.** Not a textbook: ten worksheets (B1a, B1b, B2, B3, B4, B5a, B5b, B6a, B6b, B6c), each an introduction, safety, apparatus, numbered method, blank results table and unanswered questions. Most are CCEA's own Unit 7 Booklet A tasks lightly edited: B3 is the 2021 Booklet A (50 °C there, 30 °C here); B2 is the 2023 Booklet A; B5a is the 2025 Booklet A (sucrose in % there, in M here); B6a is the 2022 Higher Booklet A; B4 is the 2021 Booklet B Q1; B6c is close to the 2021 Higher Booklet B Q3 (oil there, a sealed bung here); B5b's weighed bags are the design of 2026 Higher Booklet B Q4.

**Verdict convention (note: the opposite way round from the B2 eGuide folder).** Here the verdict states the **book** against **our note**: *book richer*, *equal*, *book thinner*.

**Copyright.** Everything here is in our own words, and no CCEA mark scheme or examiner's report is quoted at length: scheme points are given as paraphrases that keep the marking point, the tariff and the question reference, and the exact probe inputs that use a scheme's own wording are kept only in the git-ignored scratchpad. The shared-run check (`scratchpad/probes/dossier-biology-practical/shared-runs.mjs`) compares every 8-word run of each file with the book's full text, with all 68 Unit 7 mark-scheme texts of 2019–2025 (every subject) and with the four Chief Examiner's report texts (Summer 2023–2025, March 2026); runs that are also in the specification's own text, which includes the Unit 7 apparatus list, are allowed and reported separately. It was run twice, once as written and once with standalone numbers removed on both sides (scheme texts interleave margin tallies that would otherwise break a quoted run), and reports **0 shared runs in each of the 11 files against every source** both times. At 6 words nothing is shared with any scheme or report; with the book, only its own title and two generic phrases. No figure, photograph or table is reproduced; the photographs are credited to Getty Images and to named photographers and illustrators and must never be used.

---

## Dossier table

| Dossier | Practical (specification) | Book pages, printed (PDF) | Our topic slug(s) | Verdict: what the book adds |
|---|---|---|---|---|
| [pp-b1-light-chlorophyll-starch](pp-b1-light-chlorophyll-starch.md) | Prescribed Practical B1: investigate the need for light and chlorophyll in photosynthesis by testing a leaf for starch | pp. 2–7 (PDF 4–9) | `b1-photosynthesis-investigations`; `u7-carrying-out` | **Book thinner**: no reasons, no carbon dioxide or oxygen work; adds tracing the card's position before removal (CCEA 2021, 2024) and a flame-free set-up |
| [pp-b2-energy-content-of-food](pp-b2-energy-content-of-food.md) | Prescribed Practical B2: investigate the energy content of food by burning food samples | pp. 8–11 (PDF 10–13) | `b1-biological-molecules-food-energy`; `u7-carrying-out` | **Equal**: ours explains the low result and proportion; the book carries the five-change table and the percentage of the stated value (CCEA 2023 Higher) and the after-an-accident safety table |
| [pp-b3-temperature-enzyme](pp-b3-temperature-enzyme.md) | Prescribed Practical B3: investigate the effect of temperature on the action of an enzyme | pp. 12–14 (PDF 14–16) | `b1-enzyme-factors`; `u7-planning` | **Book richer**: CCEA's catalase froth method with its control tube; ours teaches only amylase on a spotting tile, never a Unit 7 task |
| [pp-b4-quadrats](pp-b4-quadrats.md) | Prescribed Practical B4: use quadrats to investigate the abundance of plants and/or animals in a habitat | pp. 15–17 (PDF 17–19) | `b1-fieldwork-sampling`; `u7-planning` | **Book thinner**: no key, repeats, mean or estimate; adds a multi-factor transect table and reasons chosen from it |
| [pp-b5-osmosis](pp-b5-osmosis.md) | Prescribed Practical B5: investigate the process of osmosis by measuring the change in length or mass of plant tissue or model cells, using Visking tubing | pp. 18–25 (PDF 20–27) | `b2-osmosis` | **Book richer**: two complete methods, weighed Visking bags with an equal-concentration bag (CCEA 2026 Higher), Booklet A recording marks |
| [pp-b6-potometer-washing-line](pp-b6-potometer-washing-line.md) | Prescribed Practical B6: use a potometer (bubble and weight potometer) ... and washing line method ... | pp. 26–33 (PDF 28–35) | `b2-transpiration-potometer`; `u7-planning` | **Book richer**: three full methods with variables (CCEA 2022 Higher); exposes our weight-potometer wording |
| [u7-planning](u7-planning.md) | Unit 7: planning an investigation (U7.1.1–U7.1.8) | across the book | `u7-planning` | **Book richer for biology**: a biology case for each planning skill, the control tube, named validity precautions; worse on hypotheses, risk and diagrams |
| [u7-carrying-out](u7-carrying-out.md) | Unit 7: carrying out an experiment (U7.2.1) | across the book | `u7-carrying-out` | **Book richer for biology apparatus**: Visking tubing, potometer, quadrat and tape, cork borer, water bath, froth on a ruler, none of which our note handles |
| [u7-analysing](u7-analysing.md) | Unit 7: analysing experimental data (U7.3.1–U7.3.6) | across the book | `u7-analysing` | **Book richer for biology**: signed changes, percentage change, a negative axis, rates per hour, category data; our note has no biology item at all |
| [u7-conclusions](u7-conclusions.md) | Unit 7: drawing conclusions (U7.4.1–U7.4.9) | across the book | `u7-conclusions` (no note yet) | **Book richer** only as contexts: about twenty conclusion questions, none answered; the how comes from CCEA's schemes, cited in the dossier |

Tally (10 dossiers): **book richer 7** (B3, B5, B6, u7-planning, u7-carrying-out, u7-analysing, u7-conclusions as a bank of contexts); **equal 1** (B2); **book thinner 2** (B1, B4).

---

## Improvements the book justifies, for the Unit 7 author

| # | Improvement | Book page | Our topic and block |
|---|---|---|---|
| U1 | Add a biology data `variant`: the potato task end to end (signed changes, percentage change to 1 d.p. with the trailing zero, axis halfway up, points joined with a ruler, the no-change concentration read off). CCEA 2025 Booklet A and report. | 19–21 | `u7-analysing`, after block [20] |
| U2 | Qualify "a rate is 1 ÷ time": in biology a rate is an amount per unit time; scale ten minutes to an hour (× 6) and a day to an hour (÷ 24). | 30, 32 | `u7-analysing` block [18] |
| U3 | Give the biology line rule (join points with ruled straight lines) its scheme evidence (2019, 2021, 2024, 2025) and put it in a See it. | 20 | `u7-analysing` blocks [27], [30] |
| U4 | A biology anomaly twin (2024 Higher Booklet B Q3 shape) and a bar-chart scale Your turn (2022 Higher Booklet A Q2). | — (book silent) | `u7-analysing` blocks [12]–[15]; [21]–[25] |
| U5 | Category data and arbitrary units in the recording paragraph (light as low, medium, high). | 16 | `u7-analysing` block [4] |
| U6 | Biology in the variables section: the washing line (independent leaf area, dependent loss in mass, one control). CCEA 2022 Higher Booklet A Q1(e). | 27 | `u7-planning` blocks [20]–[24] |
| U7 | Control tube against controlled variable: catalase control is 10 cm³ peroxide with 5 cm³ of water or boiled catalase (two marks, CCEA 2021 Higher Booklet A Q1(g)). | 14 | `u7-planning` after block [24] |
| U8 | Expected result → hypothesis: add the reason to one of the book's expected results (larger leaf loses more: more stomata). | 26 | `u7-planning` blocks [25]–[28] |
| U9 | Validity precautions by what each protects (equilibrate, blot, seal, one length, shoot under water, one species). | 13, 19, 26, 29, 31 | `u7-planning` blocks [8]–[13] |
| U10 | Instrument sized to the amount, on a biology case (20 cm³ in a 25 cm³ cylinder; 5 and 10 cm³ syringes). | 8, 12 | `u7-planning` blocks [45]–[50] |
| U11 | Three biology apparatus `variant`s: Visking tubing; the bubble potometer (assemble under water, mark, reset; the 2024 report's weak point); quadrat and tape. | 16, 22–23, 29 | `u7-carrying-out`, new sections after block [18] |
| U12 | A ruler on froth: zero at the liquid's surface, mm, after a fixed time. | 13 | `u7-carrying-out` blocks [3]–[7] |
| U13 | A biology balance reading at 1 d.p. beside the chemistry 2 d.p. one; the water bath and its reason; one biology observation (a Visking bag; a leaf after iodine). | 19, 13, 24 | `u7-carrying-out` blocks [4], [31]–[34], [36] |
| U14 | Author `u7-conclusions` on the biology spine in `u7-conclusions.md` section 11: trend in two features; reasons from a table with a flat distractor column; describe and explain marked apart; deduction from the starch test; paired data for a prediction (2021); the five-change table; true, false or cannot tell (2026); direct proportion from the food graph. | 5, 7, 10–11, 14, 17, 21, 24–25, 27, 30, 33 | `u7-conclusions` (new) |
| U15 | Safety after an accident (tell the teacher, not "someone"; cold tap on a burn; glass in the glass bin), CCEA 2023 Foundation Booklet A Q1(i) and report. | 10 | `u7-planning` blocks [41]–[44] or `u7-carrying-out` block [11] |

## Improvements the book justifies, for the B1 and B2 authors

| # | Improvement | Book page | Our topic and block |
|---|---|---|---|
| B1-1 | Locate the covered region: a leaf outline with the card dashed; shade where blue-black appears (CCEA 2021 F BkB Q1(c)(iii); 2024 F BkB Q2(d)(i)). | 4 | `b1-photosynthesis-investigations` after blocks [12]–[13] |
| B1-2 | Widen destarching time to 24–48 hours (credit-only): gate `g3` refuses "24" and "1 day"; item 0002(a) gives "put it in a dark cupboard for 24 hours" 1 of 2 although its own scheme line accepts 24–48 hours. CCEA 2021 F BkB Q1(a)(i). | 2 | `b1-photosynthesis-investigations` block [10]; bundle `q.science.b1.b1-photosynthesis-investigations.0002(a)` |
| B1-3 | A flame-free starch-test variant (hot water, no burner) beside "turn the Bunsen off"; the ethanol end point (no longer green); forceps. | 3–4 | `b1-photosynthesis-investigations` blocks [3], [5] |
| B1-4 | Harmonise light time across notes: "a day or two in bright light". | 2, 6 | `b1-photosynthesis-investigations` block [13]; `u7-carrying-out` block [16] |
| B2-1 | Five-change effects table, reasons in option notes (CCEA 2023 H BkA Q1(f)). | 11 | `b1-biological-molecules-food-energy` after block [22] |
| B2-2 | Percentage of the stated value heated the water, See it and twin; option note for "percentage lost" (2023 report). | 11 | `b1-biological-molecules-food-energy` after block [16] |
| B2-3 | Stirring (heat spread evenly) and repeats (reliable, mean, anomalies) in examiners' words. | 10 | `b1-biological-molecules-food-energy` blocks [10], [22]–[23] |
| B2-4 | Show CCEA's one-line equation; add relight-if-it-goes-out and weigh to 1 d.p. | 9–10 | `b1-biological-molecules-food-energy` blocks [10], [12] |
| B3-1 | Rebuild the B3 section on catalase froth (main) and protease-milk (variant), keeping amylase as a third (CCEA used it once, March 2019 B1). New figure. | 12–13 | `b1-enzyme-factors` blocks [33]–[39]; bundle items 0007, 0008, 0010 |
| B3-2 | Control tube (two marks: volume and substitute); froth-version variables; sources of error. | 14 | `b1-enzyme-factors` after block [35] |
| B3-3 | Explanation keyed to the temperatures given (20 → 30 °C collisions; 20 → 50 °C denaturation). | 14 | `b1-enzyme-factors` blocks [17]–[22] |
| B3-4 | Widen item 0007(c) (credit-only): an answer in the 2021 scheme's own terms (both solutions brought to the set temperature before the start; CCEA 2021 F BkA Q1(g), 1 mark) and one in the 2024 report's terms (enzyme and substrate warmed to the reaction temperature) each score 0 of 1. Exact probe inputs: `scratchpad/probes/dossier-biology-practical/probe-scheme-phrasings.mts`. | 13 | bundle `q.science.b1.b1-enzyme-factors.0007(c)` |
| B4-1 | Multi-factor transect Your turn with a flat pH column as distractor; directions in the reasons (CCEA 2021 BkB Q1(b)(ii); 2024 report). | 16–17 | `b1-fieldwork-sampling` after blocks [24]–[25] |
| B4-2 | Trends with two features ("rises then levels off"); the method-choice rule as a pair; the soil moisture probe. | 15, 17 | `b1-fieldwork-sampling` blocks [8], [25]; bundle item 0005 |
| B5-1 | Weighed Visking bags `variant` (three bags in a common 5 % outside; observation words; 2026 Higher Q4 shape). | 22–24 | `b2-osmosis` blocks [27]–[31] |
| B5-2 | Booklet A recording marks: signs, 1 d.p. with trailing zero, blot, one length (2025 BkA and report). | 19 | `b2-osmosis` blocks [25]–[26] |
| B5-3 | Variable tick table (2025 BkA Q1(f)/(g)); two tissues compared from their zero crossings (2025 H BkA Q1(k)). | 19–21 | `b2-osmosis` after block [26] |
| B6-1 | Washing-line section with variables and trend (CCEA 2022 H BkA); join it to the greased-leaf gap of the eGuide dossier. | 26–27 | `b2-transpiration-potometer` block [29]; bundle item 0009 |
| B6-2 | Weight potometer wording (see contradiction C1) and the jelly-sealed bung beside the oil layer. | 31–32 | `b2-transpiration-potometer` block [29]; bundle item 0008(b) |
| B6-3 | Bubble potometer set-up: under water, tight fit, mark the start, reset with tap and syringe. | 29 | `b2-transpiration-potometer` block [13] |
| B6-4 | Rates per hour with units (× 6; ÷ 24). | 30, 32 | `b2-transpiration-potometer` after block [18] |

## Where our notes contradict the book

| # | Ours | The book's | Which the specification or schemes support | Ruling |
|---|---|---|---|---|
| C1 | Weight potometer: "the mass lost is the water taken up" (`b2-transpiration-potometer` block [29]); item 0008(b) answer and scheme line "so the only mass lost is the water the shoot took up". | The mass change of flask and contents is the rate of water **loss** by transpiration (p. 32). | The specification titles the weight potometer as measuring uptake; CCEA 2021 Higher Booklet B Q3(a)(ii) gives its 1 mark for stopping evaporation from the flask or, as an alternative, for making the leaves the only route by which water leaves; Q3(b)(ii) rewards more water lost and more transpiration. The balance weighs the shoot too. | Teach the book's version ("water lost through the leaves, close to the water taken up"); widen 0008(b) to the scheme's alternative, which the engine now refuses (0 of 1). |
| C2 | "Flaccid" as a named state, and the required answer of item `q.science.b2.b2-osmosis.0012(a)` (block [9]). | Names turgid only for cells that gained water (p. 21, Question 2). | Every CCEA scheme held names turgid and plasmolysed, never flaccid (2019 and 2025 Booklet A: turgid). | Already raised by the eGuide dossier; keep flaccid as an explanatory middle picture, never a required answer. |
| C3 | "A rate is 1 ÷ time" (`u7-analysing` block [18]), stated generally. | Rates are amounts per unit time: distance × 6 per hour; mass ÷ 24 per hour (pp. 30, 32). | No specification wording; the book and our own b2 transpiration note both work potometer rates as an amount over time. | Not wrong for chemistry; misleading for biology. Qualify it (U2). |
| C4 | Light for 48 hours before the starch test (`b1-photosynthesis-investigations` block [13], worked example 01, items 0003, 0004); `u7-carrying-out` block [16] says a day. | A day (pp. 2, 6). | CCEA's papers: 48 hours (2021, 2024 Foundation Booklet B), two days (2026 Higher). Not marked. | Not a marking matter; our two notes disagree with each other. Harmonise (B1-4). |

Differences that are **not** contradictions: amylase on a spotting tile against catalase froth (both valid; the specification names no enzyme; see B3-1); the capillary-tube osmometer against weighed bags (both valid; see B5-1); resetting the bubble from a reservoir tap against a syringe (CCEA 2024 credits the syringe; our note mentions both and the engine accepts both); boiling water over a Bunsen against supplied hot water (the specification says boiling; both credited); "take the highest temperature" against "stir and read at once" (same reading in practice).

## Errors and slips in the book (do not copy)

- p. 4: the card removed "from the plant" after the leaf has been detached.
- p. 10: "Volume or water"; the answer unit "J/per gram".
- p. 19: "(water)" after the 0.4, 0.6 and 0.8 M solutions; "the table above" for a table that follows; "weight" for weigh.
- p. 20: the percentage-change column headed with a unit of grams.
- p. 21: Question 3 asks for a percentage sucrose concentration on an axis in M (a leftover from CCEA's 2025 paper, which used %).
- p. 16: light headed in arbitrary units while the method asks for low, medium or high.
- p. 18: osmosis introduced without the membrane being called selectively permeable (2.1.2).
- p. 22: a 5 cm³ syringe used to deliver 20 cm³.
- p. 26: "Repeat step 10" written at step 10 (step 9 is meant).
- p. 27: "Dedependent"; "surface are".
- p. 30: rate column "per hour" with no amount unit. p. 32: "each beaker" for each flask.
- p. 14: Question 3 (froth at 30 °C) now expects the opposite explanation to CCEA's 2021 scheme for the same task at 50 °C; a model answer must not be copied across.

## Book content mapped to no topic, or left out, and why

1. **The balanced photosynthesis equation in bold** (p. 2): Higher content of 1.2.2; belongs to `b1-photosynthesis-equation-limiting-factors`, not to a practical dossier.
2. **Photographs** (pp. 6, 23, 24, 32): described only; third-party credits; never to be used.
3. **Sub-practicals as separate dossiers**: B1a/B1b, B5a/B5b and B6a/b/c are sections inside the dossier for their specification practical, as the brief asks (one dossier per prescribed practical).
4. **Chemistry and physics practicals**: not in this book.
5. **Answers**: the book has none; scheme lines stand in, cited by file; the 2026 papers have no schemes yet and are cited as papers only.

## Found while checking (beyond the book)

- **Mislabelled source file.** `docs/sources/papers/science/2024-Summer/U7-H-Biology-BkA-MS-47738.txt` (and its PDF) is the **Chemistry** Unit 7 Booklet A Higher scheme (its header reads Chemistry; its content is potassium hydrogencarbonate and acids). The 2024 Biology Higher Booklet A scheme is missing from our corpus.
- **Engine probe, scheme-true answers refused** (working tree, 7 Oct; the exact inputs, some in a scheme's own words, are kept only in the git-ignored `scratchpad/probes/dossier-biology-practical/probe-scheme-phrasings.mts`): `b2-transpiration-potometer` 0008(b), the 2021 scheme's alternative (the leaves as the only route for water loss) 0/1; `b1-photosynthesis-investigations` 0002(a), a dark cupboard for 24 hours 1/2; gate `g3`, "24" and "1 day" refused; `b1-enzyme-factors` 0007(c), the 2021 scheme's point (both solutions at the set temperature before the start) 0/1 and the 2024 report's point (enzyme and substrate warmed to the reaction temperature) 0/1. Controls passed, 1/1 each: evaporation from the water surface prevented (0008(b)); the syringe reset (0003(b)); the food held closer (food-energy 0005(b)); water and boiled enzyme as the control tube's contents (u7-planning 0014(b)).
- **Validity in our U7 notes** (from the specification, not the book): the specification's wording is "whether the experiment is suitable for the task"; our notes' "only the independent variable changes" is one part of it.
