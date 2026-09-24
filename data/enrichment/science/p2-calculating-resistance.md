# Enrichment dossier — p2-calculating-resistance

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.12, 2.3.13 (F), **2.3.14, 2.3.15 (H)** · tier mixed · difficulty 4 · no prescribed practical
**Key equations:** `R = R₁ + R₂` (series, F) · `R = R₁ / 2` (two **equal** resistors in parallel, F) · `1/R = 1/R₁ + 1/R₂` (any two in parallel, **H**)
**Prerequisite in our taxonomy:** `p2-series-parallel-rules`
**Compiled** 20 September 2026 · 30 minutes
**Headline** **This row was `matched` in our crosswalk and is now corrected to `partial`.** AQA 8464 §6.2.2 states in terms: *"Students are not required to calculate the total resistance of two resistors joined in parallel."* Edexcel CP10.14 is qualitative and CP10.15 calculates **series circuits only**. So **the entire parallel half of this CCEA topic — including the Foundation `R₁/2` case — is beyond both combined-science specifications.** Every borrowed resource will teach series and then stop, or will be A level / separate-physics material pitched higher. And our one examiner finding is precisely in that gap: Summer 2025 P2 Foundation records that two 9 Ω resistors in parallel did not yield 4.5 Ω.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.12/2.3.13 (F) — series `R = R₁ + R₂`; two equal in parallel `R = R₁/2` | **§6.2.2** — "the total resistance of two components is the sum": `R_total = R₁ + R₂`; and "solve problems for circuits which include resistors **in series** using the concept of equivalent resistance" | **CP10.15** — "calculate the currents, potential differences and resistances in **series** circuits" | high | **partial** — series matched, parallel not |
| 2.3.14/2.3.15 (H) — any two in parallel `1/R = 1/R₁ + 1/R₂`; combined series/parallel circuits | **explicitly excluded**: "Students are not required to calculate the total resistance of two resistors joined in parallel." Qualitative only: "explain qualitatively why adding resistors in parallel decreases the total resistance" | **CP10.14** — "explain **why** … with two in parallel the net resistance is decreased" (qualitative) | high | **ccea-only** against combined science |

**Where the parallel calculation does live:** AQA **GCSE Physics 8463** and Edexcel **separate Physics 1PH0** carry it, as does every A level and BTEC treatment. So the material exists — it is simply one qualification-level up from where a Double Award learner would look.

**Consequence for the author.** If she searches "combined science parallel resistance", the honest results will tell her she does not need it. She does. The Sheet should say so, and this is a genuine exclusivity claim for the Higher outcomes.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Series first, and it is just adding lengths.** *AQA §6.2.2's own framing, and the only half with a Level-2 comparison.* Two resistors in a line make the charge pass through both, so the opposition adds: `R = R₁ + R₂`. Extend it to three without ceremony. This half is secure and quick; bank it and move on.

2. **Before any parallel formula: why does adding a resistor make it easier?** *AQA and Edexcel both require exactly this qualitative explanation (AQA §6.2.2 bullet; Edexcel CP10.14) and nothing more — so their material is good for the "why" and useless for the "how".* Adding a branch gives the charge **another route**, so more current flows in total for the same voltage, so the total resistance is **less than either resistor on its own**. That last clause is the sanity check for every calculation in this topic.

3. **The Foundation shortcut deserves its own explanation, not just its own formula.** *CCEA gives Foundation candidates `R = R₁/2` for two **equal** resistors, and our Summer 2025 evidence says two 9 Ω resistors did not give 4.5 Ω.* The reason is worth ten seconds: two identical routes means twice the current for the same voltage, so half the resistance. Framed that way it is not a formula to recall but an answer she can reconstruct — and the "equal" condition, which is where the error probably lies, becomes visible.

4. **The reciprocal formula, with the trap named: you have not finished yet.** *Universal in separate-physics and A level teaching.* `1/R = 1/R₁ + 1/R₂` gives **1/R**, not R. The final step is to invert. Make it a numbered step of its own with its own line of working, exactly as `matrix-inverse-2x2` treats the determinant, because it is the same class of error: the intermediate value looks like an answer.

5. **Always check against the smallest resistor.** *AQA §6.2.2 states the property: "the total resistance of two resistors is less than the resistance of the smallest individual resistor."* That single sentence turns into a free check on every parallel answer. If the total comes out bigger than either, the reciprocal was not inverted.

6. **Combined circuits: reduce the parallel section first, then add.** *The standard separate-physics method.* CCEA's Higher outcome includes combined series/parallel circuits, so the method is: box the parallel section, replace it with a single equivalent resistor, then add along the series line. Drawing the redrawn circuit at each stage is what keeps it manageable.

7. **Use the product-over-sum form as a check, not as the method.** For two resistors, `R = R₁R₂/(R₁ + R₂)` gives the same answer without an inversion step. CCEA's `mustRecall` lists both. Teach the reciprocal form as the method (because it generalises and because it is what the mark scheme expects) and offer product-over-sum as the check.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the reduction ladder.** `viewBox` about `0 0 1000 480`. A combined circuit reduced in three drawn stages, one above the other.

- **Stage 1 — the original circuit**: a cell, a resistor in series, and two resistors in parallel, each labelled with its value. The parallel pair **enclosed in a dashed box** labelled *deal with this first*.
- **Stage 2 — the boxed pair replaced** by a single resistor carrying the computed equivalent value, with the working written beside it on three lines: `1/R = 1/R₁ + 1/R₂`, then the arithmetic, then **`R = …` on its own line** with a small arrow labelled *don't stop at 1/R*.
- **Stage 3 — the simple series circuit** with the total written as an addition.
- **A check band** down the right: *is the parallel value smaller than both R₁ and R₂?* with a tick.
- **Generator parameters:** `series: number[]`, `parallel: number[]`, `stage: 1|2|3`, `showWorking: boolean`, `showCheck: boolean`, `equalResistors: boolean` (which switches the working to the Foundation `R₁/2` route and labels it as such). All values computed; assert the parallel equivalent is less than the smaller input.

**Second figure: why parallel is less — the two-route picture.** One resistor with a single arrow of charge flowing through it, beside two identical resistors with two arrows, the arrow count doubled and the total current annotated. Caption: *same push, two routes, twice the flow — so half the opposition.* This is angle 3 made visual and it is what the Foundation case needs.

**Third, small: the inversion trap card.** Two lines side by side: `1/R = 0.222 → R = 4.5 Ω` with the inversion arrowed, beside `R = 0.222 Ω` struck through. Aimed at the single most likely arithmetic failure.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, but both other boards attach one to the **series** half and its data is directly usable:

- **AQA required practical 15** includes "combinations of resistors in series and parallel" as a *measuring* activity — measure V and I for each combination, compute R = V/I, compare with the predicted value. That comparison is a genuinely good CCEA-settable question even though AQA does not ask for the parallel calculation itself.
- **Edexcel Core Practical CP10.17b** ("test series and parallel circuits") is the same idea.
- The transferable Unit 7 skill: **predict, then measure, then account for the difference** — which also gives an honest reason for why a measured total is never exactly the calculated one (connecting-lead resistance, meter resistance, temperature).

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Calculate the total resistance" [2], series.** Matched on both boards; the easy mark.
2. **"Two 9 Ω resistors are connected in parallel. Calculate the total resistance" [2].** CCEA Foundation, and our recorded failure. Author the `R₁/2` route and make the distractor `18 Ω` (added instead) carry a named misconception.
3. **"Calculate the total resistance of the circuit shown" [3], Higher, combined.** The reduction ladder. Marks for the parallel value, for the inversion, and for the final addition.
4. **"Explain why the total resistance decreases when a second resistor is connected in parallel" [2].** The one part both other boards *do* set, so their material is usable — another route, so more current for the same voltage.
5. **"The total resistance is 4 Ω and one resistor is 12 Ω. Find the other" [3].** The reverse direction, which separates candidates who have a formula from those who understand it.
6. **"A student calculates 1/R = 0.25 and writes R = 0.25 Ω. Explain the error" [1].** A find-the-mistake item straight from the inversion trap.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Two 9 Ω in parallel gives 18 Ω | Parallel is always **less than the smallest**. Two routes, so half the opposition | CCEA S2025 P2 Foundation — our only recorded finding, and it is here |
| Stopping at 1/R | The formula gives the reciprocal; inverting is its own step | universal in separate-physics teaching; the inversion card exists for it |
| `R₁/2` used for unequal resistors | The shortcut needs them **equal**; otherwise use the reciprocal form (Higher) or it cannot be done at Foundation | CCEA's own tier split |
| Parallel total bigger than one branch | Check every parallel answer against the smaller resistor | AQA §6.2.2 states this property explicitly |
| Combined circuit tackled all at once | Box the parallel section, replace it, then add | standard method; the reduction ladder |
| Believing the parallel calculation is not needed | It is Higher CCEA content and is excluded from both combined-science specifications, so borrowed resources will say otherwise | AQA §6.2.2's exclusion sentence; Edexcel CP10.15's "series circuits" wording |

---

## 7. Photographs and simulations

**Photographs: none needed.** Circuit structure is better served by our own diagrams.

**Simulation already held, and it does this topic unusually well:** **PhET *Circuit Construction Kit: DC***. It has a resistance readout and lets resistors be dragged in and out, so the qualitative claim becomes an experiment. Three tasks worth authoring:
1. Build one 9 Ω resistor, note the current. Add a second 9 Ω **in parallel** and predict the new current before connecting. Then compute the total resistance from V and I and compare with 4.5 Ω.
2. Build a series pair and confirm the resistances add.
3. Build a combined circuit and reduce it on paper first, then measure.
That first task is the direct antidote to the recorded Foundation error, and it is the one interactive in our verified set that can deliver it.

**Videos already held:** Freesciencelessons `vJRXozSVTI8` — a single video, and it is AQA-shaped, which means **it may well stop before the parallel calculation**, since AQA does not require it. The `why` line must say so, and the note should not rely on the video for the Higher outcomes. This is a case where our own worked examples have to carry the topic.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **three or more resistors in parallel** (CCEA's Higher outcome is *any two*)
- resistors in parallel treated algebraically, or with the general `1/R = Σ1/Rᵢ` form
- potential dividers, Wheatstone bridges
- internal resistance; resistivity `R = ρL/A`
- "potential difference" as the required term — CCEA says **voltage**

**CCEA-only against combined science, and this is the important half:**
- **the parallel calculation in its entirety** — `R = R₁/2` at Foundation and `1/R = 1/R₁ + 1/R₂` at Higher — which AQA 8464 excludes in terms and Edexcel 1SC0 keeps qualitative
- **combined series/parallel circuits** reduced to a single value

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-calculating-resistance` (status **`partial`**, high confidence — **corrected from `matched` on 20 September 2026** after reading AQA §6.2.2's exclusion sentence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.2** (read in full, including "Students are not required to calculate the total resistance of two resistors joined in parallel") and **Required practical activity 15**
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.12**, **CP10.14**, **CP10.15**, **CP10.17b**
- AQA GCSE Physics 8463 and Edexcel Physics 1PH0 noted as where the parallel calculation does live, one qualification level up
- `data/spec/double-award-science-topics.json` → `p2-calculating-resistance`: outcomes 2.3.12–2.3.15, `keyEquations` (three, with their tiers), `mustRecall`, and the Summer 2025 P2 Foundation `examinerEvidence` entry
- `data/links/media-map.json` key `science:p2-calculating-resistance`
