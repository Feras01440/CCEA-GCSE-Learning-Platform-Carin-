# Enrichment dossier — b2-natural-selection-selective-breeding

**CCEA** Double Award Science, **B2** §2.5 Variation and Natural Selection · outcomes **2.5.3 (partly Higher)**, 2.5.4 · tier mixed · difficulty 4 · no prescribed practical
**CCEA must-recall:** natural selection — variation in phenotypes → competition → the best-adapted survive (e.g. antibiotic resistance) → they reproduce and pass on their genes. **Higher:** evolution is a continuing process of natural selection that can form new species; extinction results from failure to adapt to environmental change. Selective breeding — humans choose individuals with desirable characteristics and breed them over many generations.
**Prerequisite in our taxonomy:** `b2-variation`
**Compiled** 20 September 2026 · 32 minutes
**Headline** CCEA's Summer 2024 B2 Foundation report calls natural selection, in as many words, **"a topic that candidates find difficult"** — and the reason is almost always the same one, documented across decades of biology-education research and visible in every mark scheme: candidates describe individuals *changing to suit* their environment rather than a population's *proportions shifting*. The fix is structural, not verbal. Teach it as a **four-step chain applied to a population**, insist on the word order, and use antibiotic resistance — which CCEA names in its own must-recall and which both other boards set (Edexcel CB4.3; AQA §4.6.3.4) — as the worked case, because it happens fast enough to be evidence rather than a story.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.5.3 — natural selection; **Higher:** evolution as a continuing process forming new species; extinction | **§4.6.2.2** *Evolution* — "the gradual change in the inherited characteristics of a population over time through a process of natural selection which may result in the formation of a new species"; **§4.6.3.3** *Extinction* | **CB4.2** — "explain Darwin's theory of evolution by natural selection" | high | **matched** |
| Antibiotic resistance as the worked example | **§4.6.3.4** *Resistant bacteria* — the full MRSA treatment | **CB4.3** — "explain how the emergence of resistant organisms supports Darwin's theory of evolution" | high | **matched**, and both are richer than CCEA needs |
| 2.5.4 — selective breeding over many generations | **§4.6.2.3** *Selective breeding* | **CB4.8** — "explain selective breeding and its impact on food plants and domesticated animals" | high | **matched** |

**Scope deltas outwards.** Edexcel adds **CB4.4/CB4.5** (evidence for human evolution from fossils and stone tools) and **CB4.7** (the three-domain classification) — both beyond CCEA. AQA adds **§4.6.3.1 Evidence for evolution** and **§4.6.3.2 Fossils**, the history of Darwin and Wallace, and inbreeding problems in selective breeding. CCEA needs the mechanism, one example, extinction, and selective breeding — no more.

**Practical consequence.** This is a well-matched topic with abundant material. The enrichment job is **selection and compression**, not discovery.

---

## 2. Teaching angles worth recreating (in our own words)

1. **The four-step chain, in fixed order, applied to a population.** *AQA's definition is the one to model on — "the gradual change in the inherited characteristics of a **population** over time" — and CCEA's own must-recall is already a chain.* The four steps:
   1. there is **variation** in the population (from `b2-variation` — mutation and sexual reproduction);
   2. more offspring are produced than can survive, so there is **competition**;
   3. individuals with the **more useful characteristic** are more likely to survive;
   4. survivors **reproduce and pass the alleles on**, so the proportion of that characteristic **increases in the next generation**.
   Fixing the order matters because mark schemes award the links, and step 4's second clause — the proportion changing — is the one most often missing.

2. **Populations change; individuals do not.** *The central misconception in the whole of evolution teaching, and the likely content of CCEA's "candidates find this difficult".* A bacterium does not become resistant because antibiotics are present; some were already resistant, and the antibiotic removed the others. Put the two sentences side by side as a find-the-mistake item and make the correct one the phrasing every worked answer uses.

3. **Antibiotic resistance, because it is evidence you can date.** *CCEA names it; Edexcel CB4.3 words it as evidence that *supports* the theory; AQA §4.6.3.4 gives the fullest treatment.* The argument: a population of bacteria varies; an antibiotic kills the non-resistant ones; the resistant ones survive and reproduce; bacteria divide every twenty minutes, so within days the population is largely resistant. It is natural selection sped up to human timescales, and it links forward to `b2-antibiotics-resistance-vaccines`.

4. **Selective breeding is the same mechanism with a human doing the choosing.** *AQA §4.6.2.3 and Edexcel CB4.8 both frame it this way, and it is the cheapest possible teaching economy.* Replace step 3 — instead of the environment deciding who survives, a farmer decides who breeds. Everything else is identical, including the "over many generations" clause that CCEA's must-recall emphasises. Teaching the second idea as a modification of the first halves the load.

5. **"Over many generations" is a mark, not a flourish.** *CCEA's must-recall says it for selective breeding; AQA says "gradual" for evolution.* A single generation changes nothing. Any answer that describes one round of choosing or one round of survival has missed the point, and the word *generations* should appear in every model answer.

6. **Extinction is the failure case of the same process.** *AQA §4.6.3.3; CCEA's Higher clause.* If the environment changes faster than the population's useful variation can spread — or if there is no useful variation to start with — the species dies out. Framing extinction as natural selection's null result rather than as a separate topic keeps §2.5 as one idea.

7. **Do not say "the fittest" without defining it.** *A standard teaching caution.* "Fittest" means best suited to *this* environment now, not strongest or fastest. The same characteristic can be an advantage and then a disadvantage when conditions change — which is exactly what makes extinction possible.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the population strip, four generations.** `viewBox` about `0 0 1020 420`. The figure that makes "populations change, individuals do not" visible.

- **Four columns**, one per generation, each containing the **same number** of small organism symbols.
- Two variants distinguished by **outline style** (solid ring and double ring), never by colour alone, with a key.
- **Generation 1:** mostly solid, a few double-ring. A **selection-pressure band** is applied between columns 1 and 2, labelled (e.g. *antibiotic added* or *habitat darkens*), and the organisms removed by it are drawn **struck through and greyed** rather than deleted, so the removal is visible.
- **Generations 2, 3, 4:** the proportion of double-ring rises, with a small **percentage annotation** under each column computed from the counts.
- **A caption under the whole strip:** *no individual changed. The proportions did.*
- **Generator parameters:** `generations: number`, `startProportion`, `selectionStrength`, `variantLabels: [string, string]`, `pressureLabel`, `showPercentages: boolean`, `showRemoved: boolean`. Every count and percentage computed from the model; assert the populations are equal in size so the proportion is the only thing moving.

**Second figure: the four-step chain.** Four linked boxes with arrows, each carrying its step from angle 1, and a **second row beneath** showing the same four boxes re-labelled for **selective breeding**, with only box 3 changed (from *the environment selects* to *a human selects*). One figure, two topics, and the economy is the teaching point. Generator parameter `mode: "natural" | "selective" | "both"`.

**Third, small: the two sentences.** A find-the-mistake card with two statements — *the bacteria became resistant because of the antibiotic* (struck through) and *some bacteria were already resistant, and the antibiotic removed the rest* — with a one-line note on why the first is wrong. Ten lines of SVG against the topic's defining error.

---

## 4. Practical variants CCEA also examines

No prescribed practical, but three activities support it and two connect to practicals CCEA does set:

- **The bead or counter simulation.** A tray of two colours of bead, a "predator" removing a fixed number each round, then the survivors doubled. Three rounds and the proportion has visibly shifted. Cheap, and it produces real data for a graph.
- **Antibiotic sensitivity plates** — discs of different antibiotics on a lawn of bacteria, measuring the clear zones. This is the practical cousin and it links to CCEA's **aseptic technique** content in `b2-health-communicable-diseases-aseptic`. Measuring and comparing zone diameters is a legitimate Unit 7 data question.
- **The peppered moth**, as a documented historical case with real survey data. Genuine numbers, a genuine environmental change, and a genuine reversal after clean-air legislation — which makes the "advantage depends on the environment" point better than any invented example.

The transferable Unit 7 demand: reading a population-proportion graph over time and **explaining a trend in terms of a mechanism**, which is exactly the shape of the highest-tariff question here.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Explain how the population became resistant to the antibiotic" [4].** The staple on all three boards. Marks awarded for the chain links: variation present → antibiotic kills non-resistant → resistant survive and reproduce → proportion increases over generations. Author the scheme link by link so a partial chain scores, and make the feedback name the missing link.
2. **"Describe how a farmer could produce cows that give more milk" [3].** Selective breeding, and "over many generations" is one of the three marks.
3. **"Suggest why the species became extinct" [2].** The environment changed and the population had no useful variation / could not adapt fast enough.
4. **"Explain why this is evidence for evolution" [2].** Edexcel CB4.3's exact framing — the resistant-organism case treated as *evidence*, not just as an example. A good stretch item.
5. **Data item [3–4].** A graph of the percentage of resistant bacteria over years, with "describe the trend" and "explain it". This is where the chain and the graph-reading meet.
6. **Find-the-mistake [1–2].** A candidate answer that says the bacteria "changed so they could survive". Our `find-the-mistake` item type, and it is the single most useful item in the topic.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Individuals change to suit the environment | Populations change; individuals do not. Some were already different, and selection removed the rest | the defining misconception in evolution teaching; CCEA S2024 B2 Foundation records the topic as difficult |
| The antibiotic *causes* resistance | The resistance was already there, by mutation, before the antibiotic arrived | Edexcel CB4.3's "supports Darwin's theory" framing |
| Organisms "want" or "try" to adapt | No intention anywhere. Survival is a consequence, not a goal | standard; avoid teleological verbs in every model answer |
| One generation is enough | "Over many generations" is a marked phrase for both natural selection and selective breeding | CCEA `mustRecall`; AQA's "gradual" |
| "Fittest" means strongest | Best suited to this environment now. Change the environment and the advantage can reverse | the peppered-moth reversal makes this concrete |
| Acquired characteristics are inherited | A characteristic gained in life is not passed on; only alleles are | connects to `b2-variation`'s "acquired characteristics" |
| Selective breeding is a different mechanism | Same chain, one step replaced: a human chooses instead of the environment | AQA §4.6.2.3 and Edexcel CB4.8 both frame it this way |
| Extinction is unrelated | It is the failure case of the same process | AQA §4.6.3.3; CCEA's Higher clause |

---

## 7. Photographs (Commons, licence checked 20 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Peppered moth (Biston betularia) female.jpg` (Charles J. Sharp) | CC BY-SA 4.0 | 5018×3345 | The pale form, sharply photographed. Prompt: *on a soot-blackened tree trunk, would this moth be more or less likely to be eaten, and what would that do to the proportions in the next generation?* |
| `File:(1931) Peppered Moth (Biston betularia) (27164551650).jpg` (Ben Sale) | CC BY 2.0 | 1500×1084 | Alternative, and a second image lets the pale and dark forms be shown together if a dark-form photograph is also sourced |
| `File:(MHNT) Biston betularia - Lustenice Czech Republic - Male dorsal.jpg` (Didier Descouens) | CC BY-SA 4.0 | 6435×4542 | Museum specimen, very high resolution; good for a close comparison figure |

Searches for openly licensed **dog-breed variety** images returned only "No restrictions" results, which the fetcher refuses. If a selective-breeding photograph is wanted, try **crop varieties** (maize, brassicas) or **cattle breeds** and verify with `pipeline/enrichment/check-commons-licence.mjs` first.

**Simulation already held, and it is well matched:** **PhET *Natural Selection***. It runs a rabbit population with a heritable trait, a selection factor (wolves or limited food) and a live population graph, so the proportion shift is watched rather than asserted. Two tasks worth authoring: (i) run it with **no** selection factor and describe what happens to the proportions; (ii) add the selection factor and describe the graph, then explain the shape using the four-step chain. Task (i) matters, because a sim that only ever shows selection can leave the impression that change is automatic.

**Videos already held:** Freesciencelessons `7RraYCKvTXc` and `99nEQd2k6k4`. Both AQA-shaped and both will reach **fossils, the history of Darwin and Wallace, and speciation in more depth than CCEA needs** — one `notonspec` line covers it.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **evidence for evolution from fossils** (AQA §4.6.3.1, §4.6.3.2) and **human evolution from fossils and stone tools** (Edexcel CB4.4, CB4.5)
- **classification** and the three-domain system (Edexcel CB4.7; AQA §4.6.4)
- the **history** of Darwin and Wallace, and why the theory was resisted
- **speciation mechanisms** and isolation in detail — CCEA's Higher clause says only that natural selection *can* form new species
- **inbreeding** and its problems in selective breeding (AQA §4.6.2.3)
- cloning and tissue culture

**CCEA-specific:** nothing substantive — this is a well-matched topic. The CCEA emphases are the **four-step chain** as the assessed structure, **antibiotic resistance** as the named example, and **extinction** sitting inside the same outcome.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:b2-natural-selection-selective-breeding` (status `matched`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§4.6.2.2**, **§4.6.2.3**, **§4.6.3.3**, **§4.6.3.4**, and §4.6.3.1–§4.6.3.2 for the scope boundary
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CB4.2**, **CB4.3**, **CB4.8**, and CB4.4, CB4.5, CB4.7 for the scope boundary
- `data/spec/double-award-science-topics.json` → `b2-natural-selection-selective-breeding`: outcomes 2.5.3–2.5.4, `mustRecall`, and the Summer 2024 B2 Foundation `examinerEvidence` entry
- Wikimedia Commons API for all three photographs, and for the refused dog-breed results
- `data/links/media-map.json` key `science:b2-natural-selection-selective-breeding`
