# b2-osmosis: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Biology Unit 2 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** `packs/science/content/b2/b2-osmosis/note.blocks.json` and `bundle.json`, read in full on 27 Sep 2026.
**Spec.** B2 2.1.1, 2.1.2, 2.1.3 and Prescribed Practical B5 (all Foundation).
**Verdict.** Our note is **richer** than the book. The book adds one teaching device we lack (a three-way comparison of inside against outside concentration) and one exam shape we under-serve (a plasmolysed cell returned to pure water).

---

## 1. Book chapter and pages

Section 2.1 (osmosis and water movement in plants): introduction and learning outcomes p. 1; "Osmosis, plasmolysis and turgidity" pp. 2–6 (worked example p. 3, method and results table p. 4, graph and exam tip p. 5, Test Yourself 2.1.1 p. 6). Answers p. 99.

## 2. The book's teaching sequence

1. Every cell holds water plus dissolved sugars and salts, and sits in a liquid of its own; the membrane is the gatekeeper, and water, a small molecule, crosses it easily (p. 1).
2. Osmosis is named as a special case of diffusion: water only, from the weaker side towards the stronger side (p. 1).
3. The swollen (turgid) cell first, drawn and labelled, with its job: the wall resists further entry, the cell is firm, and many firm cells pressing on one another hold the plant up (p. 2).
4. Then the plasmolysed cell, drawn with the same five labels, and the consequence at plant scale: wilting (p. 2).
5. A worked example on one plasmolysed cell from a potato cylinder, then the same cell moved into pure water (p. 3).
6. From one cell to many: potato cylinders as the measurable stand-in, the method, and a three-row table linking the comparison of concentrations to the direction of water and the result (p. 4).
7. Why percentage change is used (starting sizes differ), the formula, and the axis convention for the graph (p. 4).
8. The graph with gains above and losses below zero, and the reading that matters: where the line crosses zero, inside and outside are equally concentrated (p. 5).
9. Self-test on the same graph shape (p. 6); Visking tubing appears only as a pointer to Prescribed Practical B5b (p. 6).

## 3. Explanations and analogies the book uses that our note lacks

- **Two liquids, always compared** (p. 3, exam tip; p. 4, table). The book's habit is to name *both* liquids every time, the cell's own contents and the one outside, and then decide which is weaker. Our note teaches direction from a generic two-compartment picture and applies it well in its worked answer, but never lays the three possible comparisons side by side.
- **Equal concentration as a case of its own** (p. 4, middle row; p. 5 exam tip). When inside and outside match, the cylinder neither gains nor loses on balance, and that is what the zero-crossing of the graph *means*. Our note gives the crossing value in a caption and a bundle item, but does not teach "no overall movement of water" as the third outcome.
- **Why a percentage, not a raw change** (p. 4). The book justifies the percentage by the cylinders' unequal starting lengths or masses. Our note gives the formula and insists on dividing by the starting mass, but never says why a raw gain in grams would mislead.
- **Firm cells hold each other up** (p. 2). The book pictures a plant's stiffness as many swollen cells pushing against their neighbours. Our note says a plant of turgid cells "stands up" without that picture.

## 4. Diagrams and photographs

| Book figure (page) | What it shows and its labels | What it is for | Our equivalent | Recreation note for our spec |
|---|---|---|---|---|
| Turgid plant cell (p. 2) | Rounded-rectangle cell: thin outer wall, membrane tight against it, large pale central vacuole, cytoplasm as a tan band, dark nucleus in one corner. Five labels: nucleus, cytoplasm, vacuole, membrane and wall. | The reference state before any loss of water. | Yes: cell A of our three-cell figure. | Keep ours. |
| Plasmolysed plant cell (p. 2, reused p. 3) | Same outline; cytoplasm shrunk to an irregular wavy blob well inside the wall, a small vacuole, clear gaps between wall and membrane. Same five labels. | Shows which structure moved and which did not. | Yes: cell C, plus a real red-onion micrograph (ours is stronger). | Keep ours; the book's wavy shrunken outline is a good cue that the membrane follows the contents inwards. |
| Results table (p. 4) | Four columns: concentration inside, concentration outside, direction of water, result for the cells and the cylinder. Three rows: outside is pure water; outside matches; outside is stronger. | The whole topic in one grid. | **No.** | Build a three-row grid (or a match interaction): rows *outside weaker*, *outside equal*, *outside stronger*; columns *water moves*, *cells become*, *cylinder mass*. |
| % change in mass against sucrose concentration (p. 5, repeated p. 6) | x: concentration of the outside sucrose solution, 0–14 %; y: % change in mass, −4 to +5. Eight crosses on a straight falling line, crossing zero mid-range, with a vertical guide at the crossing. | Reading the concentration of the cell contents from the zero-crossing. | Yes, but ours is in mol dm⁻³ and crosses at about 0.45. | Add a twin in **% sucrose** (CCEA has set both: 2021 used 0 % and 15 % sugar, 2022 used 0.0 M to 0.3 M). Use our own numbers, for example a crossing near 6 %. |

## 5. Worked examples, calculations and data tasks

- **One-cell diagnosis, then reversal** (p. 3). Shape: a single labelled cell from a cylinder left in a strong sugar solution. Part 1: say how you can tell it has lost water (two features: membrane parted from the wall, smaller vacuole). Part 2: it is now put in pure water; describe and explain the changes (firm again; vacuole and cytoplasm swell; membrane back against the wall; water enters because the outside is now the weaker liquid). This is exactly the shape of CCEA 2021 B2 (both tiers) Q5(b)–(c): `docs/sources/papers/science/2021-Summer/B2-H-Biology-MS-18444.txt`, where (c) is three marks for *water moves in*, *across a selectively (or partially) permeable membrane*, *from dilute to concentrated*.
- **Percentage change** (p. 4): change ÷ starting value × 100, justified by unequal starting sizes. Our note has the same calculation with better step detail.
- **Graph reading** (pp. 5–6): find the concentration at zero change and say what it means; then describe and explain the cells at a concentration above the crossing. Numbers pattern: eight evenly spaced points on a straight line, the crossing landing on a grid line.

## 6. Practice question types

- **Describe** the evidence in a drawing that a cell has lost water (2 marks: two observable features).
- **Describe and explain** the changes when the cell is moved (3–4 marks: state, structures, direction of water, reason in terms of the two liquids).
- **State** the concentration of the cell contents from the graph and justify it (a value plus reasoning: zero change, equal concentrations, no overall movement).
- **Describe and explain** the cells in a solution stronger than their own contents (plasmolysed; contents shrink; membrane parts from the wall; water leaves by osmosis).
- The exam tip on p. 5 also warns she may be asked to **draw** this graph, with values either side of zero.

## 7. Definitions and wording

- **Osmosis** (p. 1): water diffusing across a selectively permeable membrane, out of the weaker solution into the stronger one. Same meaning as our note and the specification.
- **Turgid** (p. 2): vacuole and cytoplasm as full as they can be, membrane pressed on the wall, the wall preventing more uptake. Same idea as ours.
- **Plasmolysed** (p. 2): vacuole and cytoplasm reduced, membrane parted from the wall.
- **Flaccid: a vocabulary difference.** The book uses only two named states, turgid and plasmolysed, and so does every CCEA scheme we hold (2021 B2 Q5(b)(i) credits *plasmolysed*; U7 Booklet A 2019 and 2025 credit *turgid*). "Flaccid" appears in neither the book, the specification nor any scheme. Our note names a middle state "flaccid", and bundle item `q.science.b2.b2-osmosis.0012(a)` requires *flaccid* as its answer. Recommendation: keep flaccid as an explanatory middle picture, labelled as a word CCEA does not ask for, and never make it a required answer; when a CCEA diagram shows the membrane away from the wall, the answer is plasmolysed.
- **Naming the membrane.** The book says "selectively permeable" throughout; the 2021 scheme accepts selectively, partially, semi- or differentially permeable. Our note's pointer says "partially permeable" once while its body says "selectively permeable": harmless, but use the specification's word consistently.

## 8. Higher-tier-only content in the book

None on pp. 1–6 (no bold text). The Higher link, red cells bursting in water, is taught in 2.2 (p. 12) and belongs to `b2-blood-and-vessels`.

## 9. Pitfalls and "remember" notes in the book

- Compare the **two** liquids every time before stating a direction (p. 3).
- Plot the outside concentration along the **horizontal** axis and the change up the **vertical** one (p. 4).
- The graph is unusual because it has values **below zero**; losses are plotted under the axis (p. 5).
- The zero-crossing is the point of **equal concentration**, not a point where osmosis has stopped altogether (p. 5).

## 10. GAPS in our note, ranked

1. **Equal concentration is never taught as the third case.** Add a `variant` section whose See it takes three cylinders (outside weaker, equal, stronger) to three outcomes, then a Your turn on the equal case; recreate the book's three-row grid as our own figure.
2. **No reversal item.** Add a See it on a plasmolysed cell moved into pure water (describe and explain, 3 marks, the CCEA 2021 Q5(c) shape): membrane returns to the wall, vacuole swells, water enters from the weaker outside liquid.
3. **Why a percentage change.** Add an example/non-example pair: two cylinders gain the same 0.40 g from different starting masses; the raw change says "the same", the percentage change says "different".
4. **Concentrations only in mol dm⁻³.** Add a twin of the graph item in % sucrose, since CCEA uses both.
5. **Stiffness picture.** One sentence and a small figure of neighbouring turgid cells pressing on each other, so "support" in 2.1.6 has a mechanism.

## 11. Anything in our note the book suggests is wrong or misleading

Nothing is wrong. One risk: the required answer *flaccid* in `q.science.b2.b2-osmosis.0012(a)` rests on a term the book and every CCEA scheme we hold never use (see section 7).
