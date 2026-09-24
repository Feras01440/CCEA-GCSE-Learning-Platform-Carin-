# Enrichment dossier — p2-ohms-law-filament-lamp

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.8 (F), **2.3.9 (H)** · tier mixed · difficulty 4 · **Prescribed Practical P6**
**CCEA practical P6:** use a voltmeter to measure the voltage across a metal wire and an ammeter to measure the current passing through it
**Key equation:** `V = I × R` (volts, amperes, ohms) — Foundation
**Prerequisites in our taxonomy:** `p2-charge-current-cells`, `p2-conductors-circuits-symbols`
**Compiled** 20 September 2026 · 30 minutes
**Headline** This is one of the best-matched topics in the whole science crosswalk, and the borrowing is unusually direct: **AQA required practical 16** and **Edexcel Core Practical CP10.17** are both the same investigation as CCEA's P6, and CP10.17 even pairs the resistor with the filament lamp exactly as CCEA does. The one place to be careful is the axes: **CCEA plots voltage on the y-axis** in P6, where the rest of the world plots I–V characteristics with current on the y-axis. Our figures must use CCEA's convention and say that the other one exists.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.8 (F) — V = I × R; Ohm's law for a metal wire at constant temperature | **§6.2.1.3** *Current, resistance and potential difference*, with V = I R to recall and apply | **CP10.13** — recall and use V = I × R | high | **matched** |
| 2.3.9 (H) — the filament lamp V–I graph curves because resistance rises with temperature | **§6.2.1.4** *Resistors* — "the resistance of a filament lamp increases as the temperature of the filament increases"; ohmic conductors at constant temperature | **CP10.18** — how current varies with potential difference for filament lamps, diodes and fixed resistors | high | **matched** |
| Prescribed Practical P6 | **Required practical activity 16** — "investigate the I–V characteristics of a variety of circuit elements, including a filament lamp, a diode and a resistor at constant temperature" | **CP10.17** Core Practical — "investigate the relationship between potential difference, current and resistance for a resistor and a filament lamp" | high | **matched** |

**Scope deltas.** Both boards add the **diode** (AQA RP16 and §6.2.1.4; Edexcel CP10.18b) and both add **thermistors and LDRs** (AQA §6.2.1.4; Edexcel CP10.19, CP10.20) — all beyond CCEA. AQA also standardises on "potential difference" and notes that credit is given for either term; CCEA says **voltage** throughout.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Resistance is "how hard it is to push a current through", and it has a number.** *The framing both boards use before any equation — AQA §6.2.1.3 opens with "the greater the resistance, the smaller the current for a given potential difference".* Start with that sentence and the comparison it licenses (a thin wire versus a thick one), then let `R = V/I` arrive as the way to put a number on it. Concept before procedure, and it makes the ohm mean something.

2. **Ohm's law is not a definition — it is a claim about a particular component.** *AQA §6.2.1.4 is careful about this: "for some resistors the value of R remains constant but in others it can change".* `V = IR` always works, because it defines R at that moment. **Ohm's law** is the stronger statement that R stays *constant* as the current changes, and it is only true for a metal conductor at constant temperature. Getting this distinction straight is what makes the filament lamp comprehensible rather than a contradiction.

3. **The graph is the evidence, so read the shape, not the points.** *Both boards make the I–V characteristic the assessed object.* A straight line through the origin means proportional, which means constant resistance, which means ohmic. A curve means the resistance is changing. Make "straight through the origin = obeys Ohm's law" a gated statement.

4. **Why the lamp curves: a three-step chain, and it is the Higher mark.** *CCEA Summer 2025 P2 Higher spells it out: temperature rises → more collisions between electrons and atoms → resistance increases.* That is the chain the mark scheme wants and it should appear as three linked boxes, not as prose. The everyday anchor: the filament is a heater that happens to glow, so of course its properties change as it warms.

5. **Keep the wire cool, and say how.** *CCEA Summer 2025 Unit 7 Booklet B names the method points: switch off between readings, use small currents.* Because the whole of 2.3.8 is "at constant temperature", the practical's controls are the physics, not housekeeping. A borrowed AQA method will mention this only in passing; for CCEA it is a marked point.

6. **Ammeter in series, voltmeter in parallel — with the reason.** *Universal, and CCEA's Unit 7 evidence records placement being asked about.* The ammeter must have the same current through it as the component, so it goes in the line; the voltmeter must have the same voltage across it as the component, so it goes across. Giving the reason rather than the rule means she can reconstruct it on the diagram.

7. **Take readings both ways, and go through the origin.** *Standard in the AQA and Edexcel practical write-ups.* Reversing the supply gives negative values and completes the characteristic through the origin, which is what makes the lamp's S-shape visible. CCEA's P6 does not demand it, but the resulting graph is the one every textbook prints, so she should recognise it.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two characteristics, side by side, on CCEA's axes.** `viewBox` about `0 0 960 440`.

- Two sets of axes sharing a caption. **Voltage on the y-axis, current on the x-axis** — CCEA's P6 convention, which is the reverse of the usual textbook I–V graph. A small note under the figure: *many books draw this the other way round, with current up the side; the physics is the same.*
- **Left panel — the metal wire.** Plotted points and a ruled straight line through the origin, extended into the third quadrant. A right-angled triangle on the line with the gradient annotated `V/I = R = … Ω`, and a caption *constant gradient, so constant resistance — this obeys Ohm's law*.
- **Right panel — the filament lamp.** Plotted points and a smooth curve through the origin, bending away from the voltage axis. **Two dashed construction lines** at different currents, each dropping to the axes, with `R = V/I` computed and printed at both — two different numbers. Caption: *the gradient changes, so the resistance changes*.
- **Generator parameters:** `component: "wire" | "lamp"`, `resistance` (wire) or `curve` coefficients (lamp), `points: number`, `showGradientTriangle`, `readAt: number[]` (the currents at which to compute R), `quadrants: 1 | 2`, `axesConvention: "ccea" | "textbook"` so both can be emitted and compared. Every plotted point and every R computed; assert no `NaN` at the origin.

**Second figure: the three-step chain.** Three linked boxes with arrows: **current increases → filament gets hotter → atoms vibrate more, so electrons collide with them more often → resistance increases**. Drawn as a chain, because the mark scheme awards the links. A small inset of a lamp filament beside it.

**Third figure: the P6 circuit.** The practical circuit drawn with CCEA's symbols: cell, switch, variable resistor, the test wire, **ammeter in series** and **voltmeter in parallel across the wire**, each meter labelled with its rule and its reason. Generator parameters: `blankMeters: boolean` for a labelling gate, `wrongVersion: "ammeter-parallel" | "voltmeter-series" | null` for find-the-mistake items — both are real candidate errors.

---

## 4. Practical variants CCEA also examines

**CCEA Prescribed Practical P6** is the core. Variants worth knowing, and all three are settable by CCEA:

| Variant | Source | What changes | Why it matters |
|---|---|---|---|
| **Add the filament lamp** | Edexcel **CP10.17** pairs resistor and lamp in one core practical | same circuit, lamp in place of the wire | This is exactly CCEA's 2.3.8 + 2.3.9 pairing, so Edexcel's write-up is the closest external match we have |
| **Add a diode** | AQA **RP16**; Edexcel CP10.18b | needs a protective resistor in series | **Beyond CCEA** — recognise it in borrowed material and cut it |
| **Vary the length of the wire** | AQA **RP15** | length is the independent variable, not voltage | This is CCEA's `p2-resistance-length-heating`, a different topic — do not merge them |
| **Reverse the supply** | both boards' write-ups | negative readings, graph through the origin | Not required by P6 but produces the familiar full characteristic |

**The Unit 7 skills CCEA actually marks here:** ammeter and voltmeter placement; keeping the wire at constant temperature (switch off between readings, small currents); choosing a sensible range of voltages; repeating and taking a mean; plotting with voltage on the y-axis; drawing a line or curve of best fit and deciding which is appropriate.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Complete the circuit diagram to show how the student measured the current through and the voltage across the wire" [2].** One mark per meter, in the right place. Our `label` answer kind or a `choice` over four computed circuit figures whose distractors are the two swap errors.
2. **"Calculate the resistance" [2].** `R = V/I`, with the unit. Both boards set it constantly; the unit is a separate mark.
3. **"Explain how the graph shows that the wire obeys Ohm's law" [2].** Straight line **and** through the origin — two marks, and the second is the one dropped.
4. **"Explain why the resistance of the filament lamp increases as the current increases" [3].** The Higher chain. Author the scheme as three linked points so a partial chain scores.
5. **"Use the graph to find the resistance at 0.5 A and at 1.5 A" [3].** Two readings and two calculations, which is what makes "the resistance changes" concrete. Edexcel CP10.18 invites exactly this.
6. **"Suggest why the student switched the circuit off between readings" [1].** The constant-temperature control, straight from CCEA's own Unit 7 evidence.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| A filament lamp "breaks" Ohm's law, so V = IR fails | V = IR always holds; Ohm's law is the extra claim that R is constant, and the lamp does not meet it | AQA §6.2.1.4's careful wording |
| "The graph curves because the lamp gets brighter" | The chain is temperature → more electron–atom collisions → more resistance. Brightness is a symptom | CCEA S2025 P2 Higher |
| A straight line alone proves Ohm's law | Straight **and through the origin**. A straight line with an intercept is not proportional | universal; the second mark on the standard question |
| Ammeter across the component | The ammeter needs the same current as the component, so it goes in the line; the voltmeter needs the same voltage, so it goes across | CCEA S2025 Unit 7 Booklet B |
| Temperature control is housekeeping | The statement says "at constant temperature", so the control is the physics | CCEA S2025 Unit 7 Booklet B |
| Resistance is a property of the material only | It depends on the component's state — including how hot it is right now | follows from 2.3.9 |
| Reading the graph on the wrong axes | CCEA's P6 plots **voltage on the y-axis**; most textbooks plot current there | CCEA `mustRecall` |

---

## 7. Photographs (Commons, licence checked 20 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Incandescent Lamp Filament.jpg` (Gauravggs) | CC BY-SA 4.0 | 3072×4096 | A glowing filament, close. Prompt: *this wire is white-hot. What has happened to its resistance compared with when the lamp was switched off, and why?* |
| `File:Old-fashioned light bulb.jpg` (Reinhard Manthey) | CC BY-SA 3.0 de | 680×1000 | The coiled filament visible in an old bulb; good for the "it is a heater that glows" anchor. Note the licence is the German CC BY-SA port, which the fetcher accepts |
| `File:Filament bulb.jpg` (Subasis Mahat) | CC BY-SA 4.0 | 6000×4000 | High resolution alternative |

**Simulations — both already held and both good.**
- **PhET *Ohm's Law*** — three sliders and a live equation; the cleanest possible demonstration that V, I and R move together. Task: fix R and double V, predict I before releasing.
- **PhET *Circuit Construction Kit: DC — Virtual Lab*** — build the P6 circuit itself, with a real ammeter and voltmeter to place. Task: build the circuit, place both meters correctly, take five pairs of readings and plot them with voltage on the y-axis. This is the practical, rehearsable before the bench.

**Videos already held:** Cognito `BbizKa6eywo` and Freesciencelessons `WzSh6ykqn9I`. Both are AQA-shaped and both will cover the **diode**, and probably thermistors and LDRs — one `notonspec` line covers all three.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **diodes** and their one-way characteristic (AQA §6.2.1.4 and RP16; Edexcel CP10.18b)
- **thermistors and LDRs** (AQA §6.2.1.4; Edexcel CP10.19, CP10.20)
- **P = I²R** and **E = QV** (AQA §6.2.4); resistivity; superconductors
- the term "potential difference" as the required vocabulary — CCEA says **voltage**
- internal resistance, e.m.f.

**CCEA-specific:** plotting **voltage on the y-axis** in P6; the explicit constant-temperature controls as marked method points; and "voltage" rather than "potential difference" throughout.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-ohms-law-filament-lamp` (status `matched`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.1.3**, **§6.2.1.4** and **Required practical activity 16** (read in full)
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.13**, **CP10.17** (Core Practical), **CP10.18**, and CP10.19–CP10.20 for the scope boundary
- `data/spec/double-award-science-topics.json` → `p2-ohms-law-filament-lamp`: outcomes 2.3.8–2.3.9, Prescribed Practical P6, `mustRecall`, `keyEquations`, and two `examinerEvidence` entries (Summer 2025 P2 Higher; Summer 2025 Unit 7 Booklet B Foundation)
- Wikimedia Commons API for all three photographs
- `data/links/media-map.json` key `science:p2-ohms-law-filament-lamp`
