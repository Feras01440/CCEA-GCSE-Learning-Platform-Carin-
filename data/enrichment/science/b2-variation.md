# Enrichment dossier — b2-variation

**CCEA** Double Award Science, **B2** §2.5 Variation and Natural Selection · outcomes 2.5.1, 2.5.2 · tier **F** · difficulty 2 · no prescribed practical
**CCEA must-recall:** **continuous** variation (height, length) — a range of values, plotted as a **histogram**. **Discontinuous** variation (tongue rolling, hand dominance) — distinct categories, plotted as a **bar chart**. Genetic basis: **mutations** (random changes in chromosome number or gene structure) and **sexual reproduction**. Environmental basis: for example diet affecting height.
**Compiled** 20 September 2026 · 28 minutes
**Headline** The topic splits in two and the two halves have completely different comparison positions. **The causes of variation are matched almost word for word by Edexcel CB3.20** (genetic variation from mutation and sexual reproduction; environmental variation). **The continuous/discontinuous distinction is CCEA-only** — "continuous variation" and "discontinuous" return zero hits in AQA 8464, AQA 8461 and Edexcel 1SC0, and its nearest published home is GCSE Statistics, not GCSE Science. So enrich the causes freely and author the graph half from scratch. Our taxonomy records **no examiner evidence** on this topic, which the "In the exam" panel must respect.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.5.1 — **continuous** and **discontinuous** variation; histogram versus bar chart | **unmatched** | **unmatched** | high | **ccea-only** |
| 2.5.2 — genetic causes (mutation, sexual reproduction) and environmental causes | **§4.6.2.1** *Variation* — differences arise from the genes inherited, the conditions in which the organism has developed, or a combination; mutations arise continuously and most have no effect | **CB3.20** — "causes of variation that influence phenotype: a genetic variation — different characteristics as a result of **mutation and sexual reproduction**; b environmental variation — different characteristics caused by an organism's environment (acquired characteristics)"; also **CB3.22**, **CB3.23** | high | **matched** |

Evidence for the negative: `continuous variation` and `discontinuous` return **zero** content hits in all three specifications. (An apparent Edexcel hit came from trailing maths-skills boilerplate in an earlier version of our statement index; the indexer now closes a statement at "Use of mathematics", and the hit is gone.)

**Scope deltas outwards.** Edexcel adds **CB3.19** (most phenotypic features result from *multiple* genes, not single-gene inheritance) and **CB3.23** (most mutations have no effect, some a small effect, rarely one is significant). AQA adds that **mutations arise continuously** and that very rarely a mutation leads to a new phenotype suited to an environmental change — which is its bridge into natural selection.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Sort before you define: can you count the categories, or do you have to measure?** *A classification-first opening, and the most reliable route into the CCEA-only half.* If the answers fall into separate named groups you can count — blood group, tongue roller or not, hand dominance — it is **discontinuous**. If you need a ruler, a balance or a tape, and any value in between is possible, it is **continuous**. Give her eight characteristics to sort before either word is defined; the definitions then land on a sorting she has already done.

2. **The graph follows from the data, not from a rule to remember.** *This is the part no borrowed resource will supply, and it is where the marks are.* Discontinuous data has **gaps between the categories**, so the bars are drawn with gaps: a **bar chart**. Continuous data has no gaps — one value runs into the next — so the bars touch: a **histogram**. Teaching the gap as the reason means she can derive which graph to draw instead of recalling it, and it connects to her maths work on bar charts and histograms.

3. **Two sources of genetic variation, and they do different jobs.** *Edexcel CB3.20a names both in one clause, which is the clearest statement on any board.* **Mutation** makes something genuinely new — a random change to a gene or to chromosome number. **Sexual reproduction** shuffles what already exists — two parents, meiosis, a new combination. New versus new-combination is the distinction worth drawing, and it prepares `b2-natural-selection-selective-breeding`, where the variation has to come from somewhere.

4. **Most variation is both.** *AQA §4.6.2.1 states it explicitly: differences arise from genes, from the environment, or from a combination.* Height is the standard example and CCEA names diet as the environmental factor: genes set a range, diet decides where in that range you land. Presenting it as "genes propose, environment disposes" gives her a defensible answer to the common exam question "suggest why two plants with the same genes are different heights".

5. **Name a characteristic that is purely environmental.** *A good discriminator used across GCSE biology.* A scar, a spoken language, a dyed hair colour — nothing genetic about them at all. Having one clean example on each end of the scale (blood group purely genetic, scar purely environmental, height both) makes the three-way sort possible.

6. **Most mutations do nothing. Say it, because the word frightens people.** *Edexcel CB3.23 is an entire statement about this, and AQA says mutations "arise continuously".* Mutations happen all the time and the vast majority have no effect on the phenotype; a few have a small effect; very rarely one matters. This is honest, it defuses the film-monster association, and it sets up why natural selection needs *many* generations.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two graphs, side by side, from the same class.** `viewBox` about `0 0 1000 420`. This is the figure that carries the CCEA-only half, and there is nothing equivalent in the free material.

- **Left panel — discontinuous.** A **bar chart** of tongue rolling: two bars, "can roll" and "cannot roll", with a **visible gap between them**, a bracket over the gap labelled *nothing in between*, and the x-axis labelled with categories, not numbers.
- **Right panel — continuous.** A **histogram** of height: bars **touching**, x-axis a continuous number line in cm with class boundaries marked, and a bracket labelled *every value in between is possible*.
- Under both, one line each: *counted into groups → bar chart, with gaps* and *measured on a scale → histogram, bars touching*.
- **Generator parameters:** `type: "discontinuous" | "continuous"`, `data` (categories with counts, or measurements with class width), `showGapAnnotation: boolean`, `blankAxis: boolean` for a gated version. Bars computed from the data; assert class widths are equal so it is a legitimate GCSE histogram.

**Second figure: the sorting mat.** A two-column table with eight characteristic cards to be placed — blood group, height, hand span, tongue rolling, eye colour, mass, number of fingers, shoe size — headed *counted* and *measured*. Drawn as draggable-looking boxes so it reads as an activity. This maps straight onto our `label` or `order` answer kinds and is the opening interaction.

**Third figure: the three-way cause strip.** A horizontal bar with three labelled regions — **purely genetic** (blood group), **both** (height), **purely environmental** (a scar) — with a marker that can be placed anywhere along it. Generator parameter `characteristic` so several can be emitted. It makes "genetic or environmental?" a spectrum rather than a false binary, which is what the exam question actually rewards.

---

## 4. Practical variants CCEA also examines

No prescribed practical, but this topic has the cheapest real data-collection activity in B2 and CCEA examines the resulting skills in Unit 7:

- **Collect class data** on one continuous characteristic (height, hand span, reaction time) and one discontinuous one (tongue rolling, hand dominance), then draw both graphs. No apparatus beyond a ruler.
- The **Unit 7 demands this exercises**: choosing sensible class intervals for continuous data; labelling axes with quantity and unit; deciding whether bars touch; identifying an anomalous value.
- **Edexcel CB9.5's fieldwork** (quadrats and belt transects) is where the other boards put their data-collection practical for variation-adjacent content; its write-up is a usable model for the method-and-table part, though the biology differs.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Is this an example of continuous or discontinuous variation? Give a reason." [2].** CCEA-only, one mark for the answer and one for the reason (measured on a scale / falls into distinct groups). The reason is where the mark is lost.
2. **"Draw a suitable graph for these data" [3].** With a table supplied. Marks for the correct graph type, the axes, and the plotting. Our `histogram` answer kind marks bar heights directly.
3. **"Explain why two plants grown from genetically identical cuttings are different heights" [2].** The environmental half; both boards set this shape. AQA's "or a combination" wording is the model answer.
4. **"State two causes of genetic variation" [2].** Mutation and sexual reproduction — Edexcel CB3.20a's exact pair.
5. **"Suggest why most mutations have no effect on an organism" [1–2].** Edexcel CB3.23's territory and a good stretch item.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Source |
|---|---|---|
| The graph type is a rule to memorise | Gaps in the data mean gaps between the bars. Derive it, do not recall it | CCEA-only content; the hero figure |
| Continuous means "lots of values" | It means **any** value in the range is possible, because you measure rather than count | standard classification framing |
| Variation is either genetic or environmental | Most is both. Genes set the range, the environment decides the position within it | AQA §4.6.2.1 says "or a combination" explicitly |
| Mutation is the only source of genetic variation | Mutation makes new alleles; sexual reproduction makes new combinations | Edexcel CB3.20a names both |
| Mutations are rare and always harmful | They arise continuously and most have no effect at all | Edexcel CB3.23; AQA §4.6.2.1 |
| Acquired characteristics are inherited | A scar is environmental and is not passed on. This is the misconception that natural selection depends on defeating | Edexcel CB3.20b's "acquired characteristics" wording |
| Eye colour is a clean discontinuous example | It is usually taught as one, but it is polygenic; blood group and tongue rolling are safer | Edexcel CB3.19 (multiple genes) |

Our taxonomy records **no examiner evidence** for this topic. The honest "In the exam" line is about tariff and position — low-tariff recall and a graph-drawing part inside a larger §2.5 question — and must not invent a finding.

---

## 7. Photographs and simulations

**Photographs: none required**, and the topic is better served by data than by images. If one is wanted, a group photograph showing a range of heights makes continuous variation immediate — but choose carefully, since the house rules bar content targeting identifiable private individuals, and a classroom photograph of real pupils is exactly that. Prefer our own graphs.

**Simulation held, with a caveat:** **PhET *Natural Selection*** is mapped to this slug. It is a good sim, but it models **selection**, not variation — it belongs to the next topic and is correctly mapped there too. For this topic its only honest use is to show the starting population's variation before any selection pressure is applied: *set the population running with no selection factor and describe the spread of the trait.* If that framing is not wanted, leave the panel empty rather than imply the sim covers this content.

**Videos already held:** Freesciencelessons `_LoPYfhTgeI` and Cognito `4PtOgToaKP8`. Both AQA-shaped, so **neither will cover continuous versus discontinuous variation**, because AQA does not examine it. That is worth an explicit `why` line: the video covers the causes, our lesson covers the graphs.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **polygenic inheritance** as a named idea (Edexcel CB3.19)
- the **relative effect sizes** of mutations as a graded statement (Edexcel CB3.23)
- mutation **types** — substitution, insertion, deletion — and their effects on protein structure
- the **Human Genome Project** (Edexcel CB3.21)
- normal distribution curves fitted to continuous data (that is Further Mathematics FM3, not B2)
- evolution and natural selection — the next topic

**CCEA-only:**
- **continuous and discontinuous variation** as named categories, and the **histogram versus bar chart** decision that follows from them. Nothing in AQA 8464, AQA 8461 or Edexcel 1SC0 covers this; its nearest published home is GCSE Statistics

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:b2-variation` (status **`partial`**, high confidence — **corrected from `matched` on 20 September 2026**)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§4.6.2.1** *Variation*
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CB3.19**, **CB3.20** (read in full), **CB3.22**, **CB3.23**
- `pipeline/enrichment/lookup-spec.mjs` searches for "continuous variation" and "discontinuous" across all three specifications: zero content hits
- `data/spec/double-award-science-topics.json` → `b2-variation`: outcomes 2.5.1–2.5.2, `mustRecall`, `keywords` (no `examinerEvidence` recorded)
- `data/links/media-map.json` key `science:b2-variation`
