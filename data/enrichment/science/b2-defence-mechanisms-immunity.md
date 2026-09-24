# Enrichment dossier — b2-defence-mechanisms-immunity

**CCEA** Double Award Science, **B2** §2.6 Health, Disease, Defence Mechanisms and Treatments · outcome 2.6.5 · tier **F** · difficulty 3 · no prescribed practical
**CCEA must-recall:** barriers — **skin, mucous membranes, blood clotting**. **Lymphocytes** produce **antibodies** in response to **antigens**; antibodies clump microorganisms, reducing spread and symptoms; **phagocytes** engulf and digest microorganisms. **Memory lymphocytes** give a faster, larger **secondary response**. **Active** immunity — the body makes its own antibodies (infection or vaccine). **Passive** immunity — antibodies are received (for example from the mother).
**Compiled** 20 September 2026 · 30 minutes
**Headline** **Edexcel CB5.13 is the best-matched statement on any board and the only one that names memory lymphocytes and the secondary response** — its parts (c) and (d) are literally "the antigens also trigger production of memory lymphocytes" and "the role of memory lymphocytes in the secondary response to the antigen". That is exactly the content our Summer 2025 B2 Foundation report says was "explained vaguely". AQA never names memory cells at all; §4.3.1.7 only says white blood cells "respond quickly". Two CCEA requirements have no home anywhere: **active and passive immunity** as named categories return zero hits in all three specifications.

---

## 1. Crosswalk

| CCEA 2.6.5 | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| Barriers: skin, mucous membranes, blood clotting | **§4.3.1.6** — non-specific defence: skin, nose, trachea and bronchi, stomach | **CB5.12** — physical barriers (mucus, cilia, skin) and chemical defences (including lysozyme) | high | matched, different lists |
| Lymphocytes → antibodies in response to antigens; antibodies clump microorganisms; phagocytes engulf and digest | §4.3.1.6 — white blood cells defend by **phagocytosis, antibody production, antitoxin production** | **CB5.13a/b** — exposure to pathogen; the antigens trigger an immune response causing the production of antibodies | high | matched |
| **Memory lymphocytes**; faster, larger **secondary response** | **unmatched** — §4.3.1.7 says only that white blood cells "respond quickly to produce the correct antibodies" | **CB5.13c/d** — "the antigens also trigger production of **memory lymphocytes**"; "the role of memory lymphocytes in the **secondary response** to the antigen" | high | **matched to Edexcel only** |
| **Active** and **passive** immunity | **unmatched** | **unmatched** | high | **ccea-only** |

Evidence for the negatives: `active immunity` and `passive immunity` return **zero hits** in AQA 8464, AQA 8461 and Edexcel 1SC0; `memory lymphocyte` returns CB5.13 in Edexcel and nothing in AQA.

**Scope deltas outwards.** AQA adds **antitoxin production** as a third white-blood-cell role, which CCEA does not require; Edexcel names **cilia** and **lysozyme** specifically. AQA §4.3.1.7 adds **herd immunity** ("immunising a large proportion of the population"), which CCEA covers in `b2-antibiotics-resistance-vaccines`, not here.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Three lines of defence, in order, and the third is the clever one.** *A structure both boards imply by separating non-specific from specific defence (AQA §4.3.1.6's two halves; Edexcel CB5.12 versus CB5.13).* **First**: keep them out — skin, mucus, clotting. **Second**: kill anything that gets in, without asking what it is — phagocytes. **Third**: identify this *particular* pathogen and make a weapon shaped for it — lymphocytes and antibodies. Ordering it this way explains why the third takes days: it has to be built to order.

2. **Antigen and antibody: a lock and a key cut to fit it.** *The standard GCSE analogy, and worth using because CCEA's `b1-enzymes-and-digestion` has already established lock-and-key for enzymes — so it is a second use of a model she owns.* The **antigen** is the marker on the pathogen's surface; the **antibody** is the protein shaped to attach to that specific marker. **Where it breaks:** unlike an enzyme, the antibody is not a catalyst and does not change the antigen — it sticks to it. Say that when you use it.

3. **Antibodies clump, they do not kill.** *CCEA's own wording — "antibodies clump microorganisms, reducing spread and symptoms" — is more specific than either other board, and is a marked point.* Clumping holds the microorganisms together so they cannot spread through the body and so phagocytes can engulf several at once. Giving the *consequence* is what earns the mark; "antibodies destroy the pathogen" does not.

4. **The secondary response, as a graph with two humps — and the graph is the explanation.** *This is the topic's single most valuable representation, it is exactly Edexcel CB5.13d, and it is the recorded CCEA failure.* First exposure: a slow, small rise in antibody concentration after a lag of several days. Second exposure to the **same** antigen: a much **faster** and much **larger** rise. The reason is the memory lymphocytes left behind by the first response. A learner who can point at the two humps and say "faster and larger, because memory lymphocytes were already there" has answered the question that our examiner says was answered vaguely.

5. **Active versus passive: who made the antibodies?** *CCEA-only, so this framing has to be ours.* One question sorts every case: **did your own body make them?** If yes it is **active** — whether the trigger was an infection or a vaccine — and it lasts, because memory lymphocytes remain. If the antibodies arrived ready-made — across the placenta, in breast milk, in an injection of antibodies — it is **passive**: it works immediately but fades, because no memory lymphocytes were made. The "immediate but temporary versus slow but lasting" trade-off is the part worth a sentence.

6. **Why vaccination works, in one line that connects to this topic.** *AQA §4.3.1.7 and Edexcel CB5.14 both state it.* A vaccine is a dead or inactive pathogen: enough antigen to trigger a primary response and leave memory lymphocytes, without the disease. That is active immunity produced deliberately, and it is the bridge to `b2-antibiotics-resistance-vaccines`.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two-exposure antibody graph.** `viewBox` about `0 0 940 440`. This is the figure that answers the recorded examiner finding, and it should be the topic's hero image.

- Axes: **time in days** across, **concentration of antibody in the blood** up (no numbers on the y-axis — there are none to give honestly; label it *relative concentration*).
- **Two vertical markers on the time axis**, labelled *first exposure to the antigen* and *second exposure to the same antigen*.
- **Curve 1:** a lag of several days, then a slow rise to a modest peak, then a decline.
- **Curve 2:** a very short lag, a steep rise to a peak several times higher, then a slower decline.
- **Three annotations that carry the marks:** a horizontal double-headed arrow comparing the two **lag times**, labelled *faster*; a vertical double-headed arrow comparing the two **peaks**, labelled *larger*; and a small labelled marker in the trough between them reading *memory lymphocytes remain here*.
- **Generator parameters:** `lag1`, `lag2`, `peak1`, `peak2`, `showAnnotations: ("faster"|"larger"|"memory")[]`, `blankSecondCurve: boolean` (so a gate can ask her to choose or sketch the second response), `exposures: 2 | 3`. Curves computed from the parameters; assert peak2 > peak1 and lag2 < lag1.

**Second figure: the three lines of defence.** A vertical strip of three bands with a pathogen symbol travelling down through them. **Band 1** — a barrier layer labelled skin, mucous membranes, blood clotting, with most pathogens stopped. **Band 2** — a phagocyte engulfing one, labelled *any pathogen, no questions asked*. **Band 3** — a lymphocyte with antibodies shown as small shapes that **fit** the pathogen's surface markers, labelled *this pathogen only*. A time axis down the left: *immediate · minutes to hours · days*. Generator: `bands: (1|2|3)[]`, `labels: "full"|"blank"`.

**Third figure: the active/passive sorter.** Four cards — *caught chickenpox*, *had the MMR vaccine*, *antibodies from the mother across the placenta*, *an injection of antibodies after a snake bite* — with two bins labelled **active (your body made them — lasts)** and **passive (they arrived ready-made — fades)**. Maps straight onto our `label` answer kind and is the whole of the CCEA-only content in one interaction.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, but two real links:

- **Aseptic technique** (CCEA `b2-health-communicable-diseases-aseptic`; AQA Biology 8461 §4.1.1.6, biology-only) is the practical cousin — culturing microorganisms safely, and the reason we do not culture human pathogens in school.
- **Antibiotic sensitivity plates** belong to `b2-antibiotics-resistance-vaccines` but the measuring and comparing skill is the same, and a clear-zone data table is a legitimate Unit 7 question stem.

The transferable Unit 7 demand here is **reading a two-curve graph and comparing two responses quantitatively** — which is the secondary-response question in disguise, and is worth building as a data item.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Describe how the body prevents microorganisms entering" [2–3].** The barrier list. CCEA's list differs from AQA's (blood clotting is CCEA's; the stomach and trachea are AQA's), so use CCEA's.
2. **"Explain how lymphocytes protect the body" [3].** Antigens recognised → antibodies produced → specific to that pathogen → clumping. The **clumping consequence** is the mark most often missed.
3. **"The graph shows antibody concentration after two exposures. Explain the difference between the two responses" [4].** The flagship item, and the recorded CCEA weakness. Marks: faster; larger; memory lymphocytes from the first exposure; they recognise the antigen immediately. Author all four as separate scheme points so a two-mark answer is diagnosed rather than just scored.
4. **"Give one difference between active and passive immunity" [2].** CCEA-only. Who made the antibodies, and how long it lasts.
5. **"Explain why a baby is protected from some diseases for the first few months" [2].** Passive immunity from the mother — CCEA-only and a lovely real context.
6. **"Explain why phagocytes can act immediately but lymphocytes take several days" [2].** A stretch item that tests the specific/non-specific distinction properly.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The secondary response explained as "you are immune now" | Faster **and** larger, because memory lymphocytes were already present. Point at both annotations on the graph | **CCEA S2025 B2 Foundation** — the recorded finding; Edexcel CB5.13d is the only statement that names it |
| Antibodies kill or dissolve pathogens | They **clump** them, so the pathogen cannot spread and phagocytes can engulf several at once | CCEA's own wording, which is more specific than either other board's |
| Antigen and antibody used interchangeably | The antigen is **on the pathogen**; the antibody is made **by you** and fits it. Two different objects | universal; the lock-and-key figure keeps them apart |
| Phagocytes are specific | Phagocytes engulf anything foreign; only lymphocytes are specific to one pathogen | AQA §4.3.1.6's split into phagocytosis and antibody production |
| A vaccine gives you the disease | A dead or inactive pathogen carries the antigen without causing illness | AQA §4.3.1.7; Edexcel CB5.14 |
| Passive immunity lasts | It is immediate but fades, because **no memory lymphocytes** are made. That single clause explains both halves | CCEA-only content |
| Reaching for antitoxins | AQA's third white-blood-cell role; not required by CCEA | AQA §4.3.1.6 |

---

## 7. Photographs and simulations

**Photographs.** Nothing was verified for this topic in this session. The two worth searching for, with `pipeline/enrichment/check-commons-licence.mjs`, are a **phagocyte engulfing a bacterium** (electron micrograph) and a **blood clot or scab**, the latter being the barrier CCEA names and the other boards do not. Give each a prompt: for the micrograph, *which line of defence is this, and is it specific to one pathogen?*; for the scab, *what is this barrier keeping out, and what would happen without it?*

**Simulations: none held, and `media-map.json` records `sims: []` for this slug.** That is the right call — no faithful free interactive models the immune response at this level, and a generic "cells moving around" animation would model nothing. The interactive here is our own two-exposure graph with a `blankSecondCurve` parameter, which is a better teaching object than anything available to embed.

**Videos already held:** Freesciencelessons `5X9MklLVhlw` and `HSrrPdJDqxM`. Both AQA-shaped, so both will cover **antitoxins** and **neither will cover active versus passive immunity**, because AQA does not examine it. Say so in the `why` line — the omission is the more important half.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **antitoxin production** as a third white-blood-cell role (AQA §4.3.1.6)
- **cilia** and **lysozyme** as named defences (Edexcel CB5.12) — CCEA says mucous membranes and does not name the enzyme
- **herd immunity** and immunising a large proportion of the population (AQA §4.3.1.7) — CCEA covers this in `b2-antibiotics-resistance-vaccines`
- B cells and T cells as named cell types; the complement system; inflammation
- monoclonal antibodies (AQA Biology 8461 only)
- vaccination schedules and vaccine side effects — AQA states in terms that these are not required, and CCEA does not need them either

**CCEA-only:**
- **active and passive immunity** as named categories — zero hits in AQA 8464, AQA 8461 and Edexcel 1SC0
- **blood clotting** as a named barrier
- the **clumping** consequence of antibody action, worded as CCEA words it

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:b2-defence-mechanisms-immunity` (status **`partial`**, high confidence — **corrected from `matched` on 20 September 2026**)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§4.3.1.6** and **§4.3.1.7** (read in full)
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CB5.12**, **CB5.13** (read in full from the specification text, including parts c and d on memory lymphocytes and the secondary response), **CB5.14**
- `pipeline/enrichment/lookup-spec.mjs` searches for "active immunity", "passive immunity" and "memory lymphocyte" across all three specifications
- `data/spec/double-award-science-topics.json` → `b2-defence-mechanisms-immunity`: outcome 2.6.5, `mustRecall`, and the Summer 2025 B2 Foundation `examinerEvidence` entry
- `data/links/media-map.json` key `science:b2-defence-mechanisms-immunity`
