# Enrichment dossier — p2-series-parallel-rules

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.10, 2.3.11 · tier **F** · difficulty 3 · no prescribed practical
**CCEA must-recall:** series — the **same current** through each component, and the supply voltage is **shared**. Parallel — the **same voltage** across each branch as the supply, and the total current is the **sum** of the branch currents.
**Prerequisites in our taxonomy:** `p2-charge-current-cells`, `p2-conductors-circuits-symbols`
**Compiled** 20 September 2026 · 28 minutes
**Headline** Cleanly matched on both boards (AQA §6.2.2, Edexcel CP10.10, CP10.11, CP10.15), and the enrichment worth taking is a single idea: **current is conserved at a junction** (Edexcel states it as its own statement, CP10.11) and **voltage is shared out** — so the two rules are not four facts to memorise but two conservation statements applied twice. Our taxonomy records **no examiner evidence** on this topic, which is itself worth saying: this is where marks are banked, not lost, and its real job is to be secure enough that `p2-calculating-resistance` is possible.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.10 — series rules | **§6.2.2** — "there is the same current through each component"; "the total potential difference of the power supply is shared between the components" | **CP10.10** (a closed circuit with a source of pd drives a current), **CP10.11** (current is conserved at a junction), **CP10.15** (calculate currents, pds and resistances in series circuits) | high | **matched** |
| 2.3.11 — parallel rules | **§6.2.2** — "the potential difference across each component is the same"; "the total current through the whole circuit is the sum of the currents through the separate components" | **CP10.11**, **CP10.14** | high | **matched** |
| — | AQA adds: use circuit diagrams to construct and check series and parallel circuits; explain the design and use of dc series circuits for measurement and testing | Edexcel adds **CP10.16** (design and construction of series circuits for testing and measuring) and **CP10.17b** (Core Practical: test series and parallel circuits) | high | — |

**Scope deltas.** Both boards wrap these rules inside a **practical** — AQA's RP15 includes "combinations of resistors in series and parallel", Edexcel's CP10.17b is "test series and parallel circuits" — where CCEA sets no practical on this outcome (its electricity practical, P6, is the Ohm's law one). That is good news: the other boards' practical write-ups are a legitimate source of *contexts and data* for our questions.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Two conservation ideas, applied twice.** *Edexcel makes the first one a statement of its own — CP10.11, "current is conserved at a junction" — which is a better starting point than four separate rules.* Charge does not pile up or vanish, so whatever flows into a junction flows out of it; and the energy each coulomb carries is handed over to the components it passes through, so the voltages share out. From those two sentences, all four CCEA rules follow. Teaching them as consequences halves what has to be remembered and survives a forgotten rule.

2. **One path or several paths — decide that first.** *The standard opening on both boards (AQA §6.2.2: "there are two ways of joining electrical components").* Before any rule is applied, trace the circuit with a finger: if there is only one route from one terminal to the other, it is series; if the route splits, it is parallel. Most errors in this topic are classification errors, not rule errors, and they are fixed by tracing rather than by looking at the picture's shape.

3. **The water-circuit analogy, with its limit stated.** *A standard device in UK physics teaching (it underpins the way both boards phrase the rules).* Current is like the rate of flow of water in a loop of pipes — the same everywhere in a single loop, splitting and rejoining at junctions. Voltage is like the pressure drop across each section. **Where it breaks:** the analogy suggests current gets "used up" by components, which is exactly the misconception to avoid, so it must be paired with angle 4 immediately.

4. **Current is not used up. Say it as a rule with evidence.** *The most persistent misconception in electricity and the reason CP10.11 exists as a statement.* In a series circuit the ammeter reads the same before **and after** the lamp. Put that as a measured fact on the figure, with two ammeters and identical readings, rather than as an assertion.

5. **Parallel branches are independent, and that is why houses are wired that way.** *Both boards use the domestic context.* Each branch gets the full supply voltage, so one lamp can be switched off without dimming the others. This is the everyday "why" that makes the rule stick, and it links forward to `p2-electricity-in-the-home`.

6. **More branches means more current, which is the seed of the resistance topic.** *AQA §6.2.2: adding resistors in parallel decreases the total resistance.* Adding a branch gives the charge another route, so more current flows in total. Planting that here, qualitatively, is what makes the parallel-resistance formula in the next topic feel inevitable rather than arbitrary.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two circuits, instrumented.** `viewBox` about `0 0 1000 440`, two panels sharing a caption.

- **Left panel — series.** A single loop: cell, switch, two lamps of different resistance. **Three ammeters** in the loop, before, between and after the lamps, all showing the **same reading**. **Two voltmeters** across the two lamps, showing **different** readings that **add to the supply voltage**, with a small sum written beneath (`3.0 V + 1.5 V = 4.5 V`).
- **Right panel — parallel.** Two branches: **one ammeter in each branch and one in the main line**, with the main-line reading equal to the **sum** of the branch readings (`0.4 A + 0.2 A = 0.6 A`). **Two voltmeters**, one across each branch, showing the **same** reading, equal to the supply.
- Under each panel, the rule stated in one line, with the arithmetic from the meters shown beside it, so the rule and its evidence sit together.
- **Generator parameters:** `arrangement: "series" | "parallel"`, `supplyVoltage`, `resistances: number[]` (all meter readings computed from these, never typed), `showMeters: ("A"|"V")[]`, `blankReadings: number[]` so a gate can hide any reading and ask her to fill it, `labels: "full" | "blank"`. Assert the readings satisfy the rules to within rounding.

**Second figure: the junction close-up.** A single junction drawn large, with one arrow in labelled `0.6 A` and two arrows out labelled `0.4 A` and `0.2 A`, and a caption *what goes in comes out — charge is not stored here*. Ten lines of SVG against the topic's central idea.

**Third, small: trace the path.** The same two circuits drawn without meters, each with a dotted finger-trace line from the positive terminal round to the negative, branching in the parallel one. Caption: *one route or several?* Used as the opening classification gate.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, but both other boards attach one and CCEA examines the same *skills* in Unit 7:

- **AQA required practical 15** includes "combinations of resistors in series and parallel" — a measuring activity whose data tables are a ready source of realistic numbers for our questions.
- **Edexcel Core Practical CP10.17b** is "test series and parallel circuits" — the closest thing to a published method for exactly these rules.
- The **transferable Unit 7 demands**: drawing a circuit diagram with standard symbols; placing ammeters in series and voltmeters in parallel (from `p2-ohms-law-filament-lamp`); recording readings in a table with units in the headings; and spotting an anomalous reading.

A cheap and genuinely useful item shape: give a table of meter readings from a two-branch circuit with **one value missing** and ask her to complete it. That tests both rules at once and needs no apparatus.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Complete the table of meter readings" [2–3].** Our `table` answer kind, one input per cell, feedback naming the cell. The single most efficient item in this topic.
2. **"The reading on A₁ is 0.6 A. What is the reading on A₂?" [1].** Junction arithmetic, one mark.
3. **"Explain why the lamps in a house are connected in parallel rather than in series" [2].** Full voltage to each, and independent switching. Both boards set it; CCEA rewards the everyday reason.
4. **"State one similarity and one difference between the current in the two circuits" [2].** A compare item that forces both rules into one answer.
5. **"Draw a circuit diagram showing two lamps in parallel with a switch that controls only one of them" [2].** A drawing item that tests understanding rather than recall, and it is the shape AQA uses for its "design and use of circuits" clause.

**Mark-scheme habit:** the rules are credited as separate points, so "the current is the same" and "the voltages add up" each earn independently. Author the scheme so a half answer scores half, and make the feedback name the missing half.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Source |
|---|---|---|
| Current is used up as it goes round | Two ammeters either side of a lamp, reading the same, on the figure | Edexcel makes conservation its own statement, CP10.11 |
| Current is used up at a junction | The junction close-up: in equals out | CP10.11 |
| The voltage is the same across everything in series | It is **shared**; only in parallel is it the same | AQA §6.2.2 wording |
| A circuit is classified by how it looks | Trace the path: one route or several | standard; the third figure exists for this |
| Adding a lamp in parallel dims the others | Each branch has the full supply voltage. That is why houses are wired this way | AQA §6.2.2; the domestic context |
| Adding branches must reduce the total current | It increases it — another route for charge. This is the seed of the parallel-resistance rule | AQA §6.2.2 |
| The water analogy taken literally | Useful for flow and pressure; it wrongly suggests the current is consumed. State the limit when you use it | analogy discipline |

Our taxonomy records **no examiner evidence** on this topic. The honest "In the exam" line is therefore about tariff and position — low-tariff recall and table completion inside a larger P2 electricity question — and must not invent a finding.

---

## 7. Photographs and simulations

**Photographs: none needed.** The content is circuit structure, which our own diagrams serve better than any photograph; a bench photograph of a wired board adds clutter, not information.

**Simulation already held, and it is the right one:** **PhET *Circuit Construction Kit: DC***. It is unusually well suited here because it shows the moving charges, so "current is not used up" becomes something she watches rather than something she is told. Two tasks worth authoring:
1. Build a series circuit with two different lamps, place ammeters in three positions and record all three readings; then place voltmeters across each lamp and check the voltages add to the supply.
2. Build a two-branch parallel circuit, record the branch and main-line currents, then **remove one branch** and describe what happens to the other — which previews the next topic.

**Videos already held:** Freesciencelessons `CEBfn4ndQWI` and `JhBrAmQYr2g`. Both AQA-shaped; both will say "potential difference" where CCEA says voltage, which is worth one line in the `why` field rather than a callout.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **calculating** combined resistance, in series or parallel — that is `p2-calculating-resistance`, and the parallel calculation is beyond both other boards anyway
- the design of series circuits for measurement and testing as an assessed topic (AQA §6.2.2; Edexcel CP10.16)
- potential dividers, variable resistors as a topic, LDR and thermistor circuits
- internal resistance; Kirchhoff's laws by name
- "potential difference" as the required term — CCEA says **voltage**

**CCEA-specific:** nothing substantive; this is one of the most cleanly matched topics in the crosswalk. The only CCEA-specific habit is the vocabulary.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-series-parallel-rules` (status `matched`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.2** (read in full, including the bulleted rules and the "students should be able to" list)
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.10**, **CP10.11**, **CP10.14**, **CP10.15**, **CP10.16**, **CP10.17b**
- AQA required practical activity 15 and Edexcel Core Practical CP10.17b — for practical contexts and data shapes
- `data/spec/double-award-science-topics.json` → `p2-series-parallel-rules`: outcomes 2.3.10–2.3.11, `mustRecall` (no `examinerEvidence` recorded)
- `data/links/media-map.json` key `science:p2-series-parallel-rules`
