# Enrichment dossier — p2-charge-current-cells

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.6, 2.3.7 · tier **F** · difficulty 2 · no prescribed practical
**Key equation:** `Q = I × t` — charge in **coulombs (C)**, current in **amperes (A)**, time in **seconds (s)**
**CCEA must-recall:** cells in series — the total voltage is the **sum** of the cell voltages, **taking polarity into account**
**Prerequisite in our taxonomy:** `p2-conductors-circuits-symbols`
**Compiled** 20 September 2026 · 26 minutes
**Headline** Cleanly matched on both boards for the equation (AQA §6.2.1.2; Edexcel **CP10.9**), and the recorded failure is not physics at all: CCEA Summer 2025 P2 Foundation records **minutes not converted to seconds** — the same arithmetic slip our `p2-electrical-power-energy-cost` dossier records for `E = Pt`. That is a cross-topic pattern worth naming once and drilling in both places. The second half, **cells in series taking polarity into account**, is CCEA's own emphasis: both boards cover batteries, but neither asks what happens when a cell is put in backwards.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.6 — `Q = I × t`, with units | **§6.2.1.2** *Electrical charge and current* — charge flow, current and time, `Q = I t`, with charge in coulombs | **CP10.9** — "recall and use the equation: charge (coulomb, C) = current (ampere, A) × time (second, s)" | high | **matched** |
| 2.3.7 — cells in series; total voltage is the sum, **taking polarity into account** | §6.2.1.2 covers a closed circuit with a source of pd; the polarity case is not set | **CP10.10** — a closed circuit with a source of potential difference drives a current | high | **partial** — the summing is implied, the polarity case is CCEA's own |

**Scope deltas outwards.** Edexcel adds **CP10.5** and **CP10.6**, defining potential difference as energy transferred per unit charge and giving `E = Q × V` — which is a genuinely useful "what is a volt?" explanation but is **beyond CCEA** as an equation. AQA adds `E = QV` in §6.2.4.2 for the same reason.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Current is a rate, so the equation is a definition, not a formula to memorise.** *Edexcel CP10.8's framing — current is "the rate of flow of charge" — makes `Q = I × t` inevitable.* One ampere means one coulomb passing every second. So in `t` seconds, `I × t` coulombs pass. Deriving it in one line means a forgotten rearrangement can be rebuilt, and it explains why the time must be in **seconds**: the ampere is defined against the second.

2. **The seconds rule, stated as a consequence rather than a warning.** *CCEA Summer 2025 P2 Foundation: minutes not converted.* Because the ampere is coulombs *per second*, any time given in minutes or hours must be converted **before** substitution, on its own line of working. Our `p2-electrical-power-energy-cost` dossier records the identical slip for `E = Pt`; flagging it as the **same** habit in both topics is worth more than two separate warnings.

3. **Give the coulomb a size.** *A framing worth borrowing from any good treatment, because "coulomb" is an empty word otherwise.* A current of 1 A is about what a small torch bulb draws; run it for a minute and 60 coulombs have passed. Attaching one everyday number to the unit makes an answer of 1 800 C recognisable as reasonable and an answer of 30 C as suspicious.

4. **Cells in series: line up the arrows before adding.** *CCEA's own "taking polarity into account" clause, which neither other board sets.* Two 1.5 V cells the same way round give 3.0 V. Turn one round and they oppose: 1.5 − 1.5 = 0 V. The rule is to check that every long line faces the same way along the loop, then add; if one is reversed, subtract it. Drawing the cells with their long and short lines visible — building on `p2-conductors-circuits-symbols` — makes this a reading task rather than a memory one.

5. **A battery is cells in series, which is why the symbol looks like that.** *A small observation that ties the notation together.* The battery symbol is two or more cell symbols drawn end to end. Saying it once explains both the word and the picture, and it is the reason the voltages add.

6. **Charge is conserved, so the same coulombs come back.** *Links forward to `p2-series-parallel-rules`.* The charge is not consumed by the lamp; it goes round and round, and what the lamp takes is **energy**, not charge. Planting this here, before the series/parallel rules, means the "current is used up" misconception arrives already contradicted.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the coulomb counter.** `viewBox` about `0 0 900 360`. A simple circuit — cell, switch, lamp — with a **gate drawn across one wire** and a counter beside it.

- Small charge markers drawn moving along the wire towards the gate, evenly spaced.
- A **counter box** reading `charge that has passed: … C`, and beside it a **timer** reading `… s`, with the **current** printed between them as `charge ÷ time = … A`.
- Three stacked rows beneath showing the same relationship rearranged: `Q = I × t`, `I = Q ÷ t`, `t = Q ÷ I`, with the one being used boxed.
- **A conversion strip** under the whole figure, tinted so it reads as compulsory: `3 minutes = 3 × 60 = 180 s`.
- **Generator parameters:** `current`, `timeValue`, `timeUnit: "s" | "min" | "h"`, `solveFor: "Q" | "I" | "t"`, `showConversion: boolean` (on whenever `timeUnit` is not seconds), `showRearrangements: boolean`. Every number computed; assert the conversion row appears whenever the unit is not seconds.

**Second figure: the polarity ladder.** `viewBox` about `0 0 940 320`. Four small circuits in a row, each with two or three cells drawn **with their long and short lines clearly different**, and the total voltage printed beneath:

1. two cells, same way round → **3.0 V**
2. two cells, one reversed → **0 V**
3. three cells, all same way → **4.5 V**
4. three cells, one reversed → **1.5 V**

A caption band: *check every long line faces the same way round the loop, then add. A reversed cell subtracts.* **Generator parameters:** `cells: (1 | -1)[]` (direction per cell), `cellVoltage`, `showTotal: boolean`, `blankTotal: boolean` for a gate. The total computed from the array, so no arithmetic is typed.

**Third, small: the everyday coulomb.** One line with three anchors on a scale — *a torch bulb for one second: 1 C* · *for one minute: 60 C* · *a kettle for one minute: about 780 C* — to give the unit a felt size.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome. Two real activities and one measurement habit:

- **Measure the current in a simple circuit and time it**, then compute the charge. It is the equation, done once with real numbers, and it takes two minutes.
- **Add cells one at a time**, measuring the voltage across the battery each time, then **reverse one** and measure again. This is the polarity idea made observable, and no other board's material will contain it.
- The transferable Unit 7 demand is **unit conversion inside a calculation** and **recording a time to a sensible precision** — both marked, and both the topic's recorded weakness.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Calculate the charge that flows" [2].** With the time given in **minutes**, deliberately, at least once. One mark for the conversion, one for the answer with its unit.
2. **"A charge of 300 C flows in 2 minutes. Calculate the current" [3].** The rearranged version, with the conversion still required.
3. **"Three 1.5 V cells are connected in series. What is the total voltage?" [1].** Then the twin: *"One cell is now connected the other way round. What is the total voltage?" [2].* The second is CCEA's own and is the discriminator.
4. **"State the unit of charge" [1].** Low tariff, and units are separately credited throughout this topic.
5. **"Explain why the time must be in seconds" [1].** A stretch item that rewards understanding the definition rather than the rule.

**Mark-scheme habit worth copying from both boards:** the equation, the substitution and the answer-with-unit are credited separately, so a correct rearrangement with an arithmetic slip still scores. Author it that way and let the feedback name which part was right.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Minutes substituted directly | The ampere is coulombs **per second**. Convert on its own line first | **CCEA S2025 P2 Foundation** — and the identical slip is recorded on `p2-electrical-power-energy-cost`, so teach it as one habit |
| Charge and current used interchangeably | Current is the **rate**; charge is the **amount**. One is per second, the other is not | Edexcel CP10.8's "rate of flow of charge" |
| Cells always add | Only if they face the same way. A reversed cell subtracts | CCEA's "taking polarity into account" — neither other board sets this |
| The lamp uses up the charge | The charge goes round; the lamp takes **energy** from it. Sets up the next topic | links to `p2-series-parallel-rules` |
| The coulomb has no felt size | One amp for one second. Anchor it once with a torch bulb | the everyday-scale strip |
| Unit omitted from the answer | The unit is a separate mark in this topic on every board | universal mark-scheme habit |

---

## 7. Photographs and simulations

**Photographs: none needed.** The content is a definition and an arithmetic habit; our own figures serve it better. A photograph of a **battery holder with two cells, one visibly reversed** would be the only one worth having — search with `pipeline/enrichment/check-commons-licence.mjs` and prompt: *what voltage would a voltmeter read across this pair, and why?*

**Simulation already held:** **PhET *Circuit Construction Kit: DC***. Two honest uses here. First, it **animates the moving charges**, which makes "current is a rate of flow" visible rather than asserted. Second, its battery voltage is adjustable and multiple batteries can be placed — so the series-addition idea can be built and measured. Its limit: it has **no charge counter and no timer**, so `Q = I × t` cannot be verified in it; the task should be about the flow and the voltage addition, and should say so. Reversing a battery in the sim is possible and is the cheapest demonstration of the polarity point.

**Videos already held:** Freesciencelessons and Cognito. Both AQA-shaped, so both will say "potential difference" where CCEA says **voltage**, and both may introduce `E = QV`, which is beyond CCEA. Neither will cover the reversed-cell case. One `why` line covers all three points.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **`E = Q × V`** and potential difference defined as energy per unit charge (Edexcel CP10.5, CP10.6; AQA §6.2.4.2)
- **`E = I V t`** (Edexcel CP10.27)
- internal resistance and e.m.f.
- the coulomb defined from the elementary charge; counting electrons
- **static electricity** and charge transfer by friction (physics-only on both boards)
- "potential difference" as the required term — CCEA says **voltage**

**CCEA-specific:** **cells in series taking polarity into account** — both boards cover batteries, neither sets the reversed-cell case.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-charge-current-cells` (status `matched`, high confidence; the polarity clause is recorded as the CCEA emphasis)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.1.2** *Electrical charge and current*
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.8**, **CP10.9**, **CP10.10**, and CP10.5–CP10.6 for the scope boundary
- `data/spec/double-award-science-topics.json` → `p2-charge-current-cells`: outcomes 2.3.6–2.3.7, `keyEquations`, `mustRecall`, and the Summer 2025 P2 Foundation `examinerEvidence` entry
- `data/enrichment/science/p2-electrical-power-energy-cost.md` — for the matching minutes-to-seconds finding, taught here as the same habit
- `data/links/media-map.json` key `science:p2-charge-current-cells`
