# Enrichment dossier — p2-resistance-length-heating

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.16, 2.3.17 · tier **F** · difficulty 3 · no prescribed practical on this outcome
**CCEA must-recall:** for a metal wire at constant temperature, **resistance is proportional to length** — the resistance (y) against length (x) graph is a **straight line through the origin**. Control variables: **thickness/diameter, material, temperature**. A current **heats** a wire because free electrons **collide with the metal atoms/ions**, transferring energy.
**Prerequisite in our taxonomy:** `p2-ohms-law-filament-lamp`
**Compiled** 20 September 2026 · 28 minutes
**Headline** Matched on both boards, and unusually well: **AQA required practical 15** is literally "the length of a wire at constant temperature" and **Edexcel CP10.21** is "explore the variation of resistance", so their practical write-ups are directly usable. The mark loss CCEA records is not about resistance at all — Summer 2025 Unit 7 Booklet B records a **control variable given as the length**, which is the *independent* variable, and a **missing gradient unit**. Both are experimental-design errors, so the lesson's weight belongs on the variable table and on what the gradient of this particular graph means.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.16 — resistance proportional to length; the straight-line-through-the-origin graph; control variables | **§6.2.1.4** *Resistors*, and **Required practical activity 15**: "investigate the factors affecting the resistance of electrical circuits. This should include: **the length of a wire at constant temperature**; combinations of resistors in series and parallel" | **CP10.21** — "explain how the design and use of circuits can be used to explore the variation of resistance" | high | **matched** |
| 2.3.17 — the heating effect: free electrons collide with the metal ions, transferring energy | **§6.2.4.2** *Energy transfers in everyday appliances* (work is done when charge flows) | **CP10.22** (an energy transfer occurs when there is a current in a resistor), **CP10.23** (dissipated as thermal energy), **CP10.24** — "explain the energy transfer as the result of **collisions between electrons and the ions in the lattice**", **CP10.25**, **CP10.26** | high | **matched, and Edexcel is much the better source** |

**Edexcel CP10.24 is the single closest statement on any board** — it gives the collision mechanism explicitly, which is exactly CCEA's 2.3.17, where AQA only says work is done.

**Scope deltas outwards.** Both boards examine **reducing unwanted energy transfer through low-resistance wires** (Edexcel CP10.25) and the **advantages and disadvantages of the heating effect** (CP10.26). AQA's RP15 also covers series and parallel combinations, which belongs to `p2-calculating-resistance`. Neither board asks for **resistivity** at this level.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Longer wire, more collisions — one mechanism for both halves of the topic.** *Edexcel CP10.24 supplies the mechanism and CCEA's 2.3.16 supplies the consequence, and they are the same physics.* Electrons drifting through a metal collide with the vibrating metal ions. A longer wire means more ions to get past, so more collisions, so more resistance — and each collision transfers energy to the lattice, which is why the wire warms. Teaching the two outcomes as **one mechanism seen twice** is the biggest economy available here, and it means the heating explanation is not a separate thing to learn.

2. **Proportional means straight *and* through the origin.** *The standard graph-literacy point, reinforced by CCEA's own wording.* Zero length means zero resistance, so the line must pass through (0, 0). A straight line that misses the origin shows a relationship but not proportionality — usually because the connecting leads have their own small resistance, which is a genuinely good "suggest why" answer.

3. **The control variables are the ones you could have changed and chose not to.** *Directly from the Summer 2025 Unit 7 Booklet B finding, where a candidate gave the **length** as a control variable.* Build the habit as a three-column table filled in a fixed order: **independent** (the one I change — length), **dependent** (the one I measure — resistance), **control** (the ones I keep the same — thickness, material, temperature). Filling the independent box *first* makes it impossible to write it again in the control column.

4. **Keeping the temperature constant is the physics, not the housekeeping.** *Reinforces `p2-ohms-law-filament-lamp`, where the same control is marked.* Because resistance rises with temperature, a wire that warms up during the experiment gives readings that drift. Switch off between readings, use small currents, and keep the contact time short. Saying *why* connects the two topics and earns the mark.

5. **The gradient has a unit, and it means something.** *Summer 2025 Unit 7 Booklet B: gradient unit missing.* Resistance on the y-axis in ohms, length on the x-axis in metres, so the gradient is in **ohms per metre** — the resistance of one metre of that particular wire. Naming what the gradient *is*, not just computing it, is what makes the unit obvious rather than an afterthought.

6. **Heating is sometimes the point and sometimes the waste.** *Edexcel CP10.26 asks for exactly this comparison.* A kettle element, a toaster and a filament lamp want the heat; the cables in a wall and a phone charger do not, which is why those use thick, low-resistance wires (CP10.25). One contrast, four examples, and it connects to `p2-electrical-power-energy-cost` and `p2-electricity-in-the-home`.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the mechanism, at two lengths.** `viewBox` about `0 0 1000 400`, two panels sharing a caption.

- **Left — short wire.** A magnified section of wire with a regular lattice of **fixed metal ions** drawn as circles and a few **electrons** drawn travelling left to right, their paths shown as short zig-zags with **collision marks** where they meet ions. A counter beneath: `collisions on the way through: 4`.
- **Right — wire twice as long.** The identical lattice, twice the length, the same electrons, the same drift, and roughly **twice the collision marks**. Counter: `collisions: 8`.
- **Two captions:** *more collisions → more resistance* and *every collision transfers energy to the lattice → the wire warms up*.
- **Generator parameters:** `lengths: [number, number]`, `electrons: number`, `showCollisionCount: boolean`, `showHeatingCaption: boolean`. Collision marks placed on a computed grid so the counts are genuinely proportional; assert the second count is about twice the first.

**Second figure: the results graph, with its gradient named.** `viewBox` about `0 0 760 520`.

- Axes: **length / m** across, **resistance / Ω** up — both labelled with **quantity and unit**, since the unit is the recorded loss.
- Plotted points from a computed data set, a ruled line of best fit **through the origin**, and the origin marked.
- A **gradient triangle** on the line with both legs labelled with their values, and the result written as `gradient = … Ω / … m = … Ω per metre`, with a leader labelling it *the resistance of one metre of this wire*.
- A **greyed alternative line** offset above the origin, captioned *a line that misses the origin is not proportional — the leads have resistance too*.
- **Generator parameters:** `resistancePerMetre`, `points: number[]`, `showTriangle`, `showOffsetLine: boolean`, `blankAxisLabels: boolean` for a gate aimed at the unit.

**Third, small: the variable table.** A three-column table with the columns headed **independent (I change)**, **dependent (I measure)**, **control (I keep the same)**, pre-filled with *length* / *resistance* / *thickness, material, temperature*, and a blank version for the gate. Ten lines of SVG against the recorded finding, and it transfers to every Unit 7 question in the pack.

---

## 4. Practical variants CCEA also examines

No prescribed practical is tagged to this outcome, but **AQA RP15 and Edexcel CP10.21 are both this experiment**, and CCEA examines it in Unit 7.

| Variant | Source | What changes | Why it matters |
|---|---|---|---|
| **Length of a wire at constant temperature** | **AQA RP15**, first bullet; CCEA's own | length is the independent variable | The core method; AQA's write-up is directly usable |
| **Thickness of the wire** | commonly set alongside | cross-sectional area varies | A "suggest another factor" part; CCEA names thickness as a *control*, so setting it as the variable is a good contrast item |
| **Different materials** | both boards | constantan, copper, nichrome | Shows the gradient is a property of the material |
| **Combinations of resistors** | AQA RP15, second bullet | series and parallel | That is `p2-calculating-resistance`; do not merge them |

**The Unit 7 demands CCEA marks:** identifying independent, dependent and control variables correctly; keeping the wire cool and saying why; taking readings over a sensible range of lengths; plotting with the unit on each axis; drawing a line of best fit through the origin; and giving the gradient **with its unit**.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Name the independent, dependent and two control variables" [3–4].** The recorded failure. Our `table` answer kind, one input per cell, with feedback naming the cell — and a `commonError` for *length* appearing in the control column.
2. **"Plot the results and draw a line of best fit" [3].** Our `points-line` answer kind; tolerance half a small square, with the line required.
3. **"Use the graph to find the resistance of 1.5 m of the wire" [2].** A read-off, which is easier than a gradient and appears more often.
4. **"Calculate the gradient and state its unit" [2].** One mark for the value, **one for the unit** — the recorded loss.
5. **"Explain why the resistance increases as the length increases" [2].** The collision mechanism: more ions to pass, more collisions.
6. **"Explain why the wire gets warm when a current flows" [2].** Edexcel CP10.24's exact statement — collisions between electrons and the ions transfer energy.
7. **"Suggest why the line does not pass exactly through the origin" [1].** The leads have resistance.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The independent variable listed as a control | Fill the independent box first; it cannot then appear twice | **CCEA S2025 Unit 7 Booklet B** — the recorded finding |
| Gradient given without a unit | Ω on the y-axis, m on the x-axis, so the gradient is **ohms per metre** — the resistance of one metre | **CCEA S2025 Unit 7 Booklet B** |
| "Straight line" taken as proof of proportionality | Straight **and through the origin**. Zero length, zero resistance | CCEA's own wording |
| Temperature control treated as tidiness | Resistance rises with temperature, so a warming wire gives drifting readings | links to `p2-ohms-law-filament-lamp` |
| Heating explained as "friction" | Collisions between the moving electrons and the metal ions transfer energy to the lattice | **Edexcel CP10.24**, the best statement on any board |
| Resistance treated as a property of the material only | It depends on length and thickness as well; the gradient is what belongs to the material | the three-variable table |
| Heating always wasteful | A kettle wants it; a cable does not. Thick low-resistance wires reduce it where it is unwanted | Edexcel CP10.25, CP10.26 |

---

## 7. Photographs and simulations

**Photographs: none needed** — the content is a mechanism and a graph, both better drawn than photographed. If one is wanted, a **glowing toaster or kettle element** makes the heating effect vivid; verify with `pipeline/enrichment/check-commons-licence.mjs` and prompt: *this element is a long thin wire. Why is it long and thin, and where is the energy going?*

**Simulation already held, and it is precisely on target:** **PhET *Resistance in a Wire***. It has sliders for **length**, **area** and **resistivity**, with a live formula and a picture of the wire whose ions get more numerous as the length grows. Two tasks worth authoring:
1. Fix the area and material, double the length, and predict the resistance before releasing the slider — then read it off. That is the proportionality, tested.
2. Change the area instead, and describe what happens. That is the control variable she is told to keep constant, made visible — which is the best possible answer to *why* it is a control.
Its one limit: the sim shows **resistivity** as a slider, which is beyond CCEA, so the task should treat that slider as "the material" and say so.

**Videos already held:** two Freesciencelessons entries. Both AQA-shaped, so both will use "potential difference", and both are likely to bundle the **series and parallel combinations** from AQA RP15 into the same video — which is `p2-calculating-resistance`, where AQA does not require the parallel calculation anyway. One `why` line should say what to take and what to leave.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **resistivity** and `R = ρL/A` (appears as a slider in the PhET sim and in A level material)
- **thermistors and LDRs** as temperature- and light-dependent resistors (AQA §6.2.1.4; Edexcel CP10.19, CP10.20)
- `P = I²R` as the heating calculation (AQA §6.2.4.1; Edexcel CP10.31)
- superconductors
- combinations of resistors — that is `p2-calculating-resistance`, and the parallel half is beyond both boards
- "potential difference" as the required term — CCEA says **voltage**

**CCEA-specific:** nothing substantive. This is a well-matched topic; the CCEA emphases are the **control-variable naming** and the **gradient unit**, both of which are experimental-skills marks rather than content.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-resistance-length-heating` (status `matched`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.1.4**, **Required practical activity 15** (read in full) and §6.2.4.2
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.21**, **CP10.22**, **CP10.23**, **CP10.24** (the collision mechanism, read in full), **CP10.25**, **CP10.26**
- `data/spec/double-award-science-topics.json` → `p2-resistance-length-heating`: outcomes 2.3.16–2.3.17, `mustRecall`, and the Summer 2025 Unit 7 Booklet B `examinerEvidence` entry
- `data/links/media-map.json` key `science:p2-resistance-length-heating`
