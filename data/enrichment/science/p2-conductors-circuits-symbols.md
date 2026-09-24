# Enrichment dossier — p2-conductors-circuits-symbols

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.1 to 2.3.5 · tier **F** · difficulty 3 · no prescribed practical
**CCEA must-recall:** conductors have **free electrons**, insulators do not. Current in a metal is a flow of **electrons from negative to positive**; **conventional current** flows from **positive to negative**. Standard symbols: cell, battery, switch, lamp, resistor, variable resistor, ammeter, voltmeter, fuse, diode; **the long line of a cell symbol is the positive terminal**. Ammeter in **series**; voltmeter in **parallel** across the component.
**Compiled** 20 September 2026 · 28 minutes
**Headline** The symbols and the meter placement are matched (AQA §6.2.1.1; Edexcel CP10.2), but **the distinction CCEA's examiner says candidates get wrong has no home on either board**: "conventional current" returns **zero hits** in AQA 8464, AQA 8463 and Edexcel 1SC0 — the only "conventional" hits anywhere are in the nuclide-notation sections. Edexcel CP10.8 calls current the rate of flow of charge but never contrasts the two directions. Our Summer 2025 P2 Foundation finding is exactly that confusion, plus the negative terminal. So the electron-flow/conventional-current pair, and cell polarity, must be authored from CCEA alone.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.1, 2.3.2 — conductors have free electrons; insulators do not | §6.2.1.2 (charge flow requires a closed circuit and a source of pd) implies it | **CP10.8** — "an electric current as the rate of flow of charge and the current in metals is a flow of electrons" | high | matched |
| 2.3.3 — **electron flow** (−→+) versus **conventional current** (+→−) | **unmatched** — zero hits for "conventional current" | **unmatched** — CP10.8 names the electron flow only | high | **ccea-only** |
| 2.3.4 — standard circuit symbols | **§6.2.1.1** *Standard circuit diagram symbols* | **CP10.2** — "draw and use electric circuit diagrams representing them with the conventional symbols" | high | matched |
| 2.3.5 — cell polarity (the long line is positive); ammeter in series, voltmeter in parallel | **§6.2.1.1** shows the symbols; meter placement is implied by §6.2.1.3 | **CP10.4** (voltmeter in parallel), **CP10.7** (ammeter in series) — both stated explicitly | high | matched; **cell polarity is CCEA's own** |

**Scope deltas outwards.** Both boards include the **diode** symbol and its one-way behaviour, and Edexcel adds **LDR and thermistor** symbols (CP10.19, CP10.20). CCEA's symbol list includes the diode and the fuse but does not examine the diode's characteristic here.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Conductor or insulator is a question about free electrons.** *Edexcel CP10.8's framing — current *is* a flow of electrons in a metal — makes the property and the phenomenon one idea.* In a metal the outer electrons are not held to any one atom, so a push from a cell moves them; in an insulator every electron is bound, so nothing moves. Teaching the *reason* means she can classify a new material rather than recall a list.

2. **Two directions, one current — and the historical reason, in one sentence.** *CCEA-only, so this framing has to be ours.* Electrons actually drift from **negative to positive**. But the convention was fixed before anyone knew electrons existed, so every circuit diagram, every arrow in every textbook and every mark scheme uses **conventional current, positive to negative**. It is not that one is wrong; it is that one is the physics and the other is the agreed notation. Saying *why* they differ stops it being an arbitrary pair to memorise, which is exactly what our examiner evidence suggests is happening.

3. **Make the direction question explicit every time: "which one is being asked for?"** *Directly from the Summer 2025 P2 Foundation finding.* A question asking about *electron flow* wants negative to positive; a question with an arrow on a circuit diagram means conventional current. Build a gate that shows a circuit with an arrow and asks both questions in turn.

4. **The long line is positive — a fact with no reason, so drill it.** *CCEA names it and the other boards do not.* On the cell symbol the **long thin line** is the positive terminal and the **short thick line** is negative. There is nothing to derive; it is notation, and our examiner records the negative terminal being confused. One gate, twice, and every figure we draw must be consistent with it.

5. **Meters: the rule follows from what each one measures.** *Edexcel states both placements (CP10.4, CP10.7) and it is worth giving the reason rather than the rule.* An **ammeter** measures the current *through* a component, so it must have that same current through it — in series. A **voltmeter** measures the difference *across* a component, so it must be connected across it — in parallel. Reason-first means she can place a meter on an unfamiliar diagram.

6. **The variable resistor is the symbol candidates do not know.** *CCEA Summer 2025 P2 Higher records exactly this.* It is the resistor rectangle with an arrow through it at an angle. Because it is the one symbol used constantly in the P6 practical circuit, it deserves naming explicitly rather than being left to the symbol table.

7. **Draw circuits with straight lines and right angles.** *A convention both boards assume and neither states.* Components sit on the lines, wires meet at corners, and a diagram drawn as a loose loop is harder to mark and harder to read. It is a two-second habit that makes every later topic easier.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the symbol table, with the two traps annotated.** `viewBox` about `0 0 1000 520`. A grid of ten cells, each containing one drawn symbol and its name beneath: cell, battery, switch (open), lamp, resistor, **variable resistor**, ammeter, voltmeter, fuse, diode.

- The **cell** cell is enlarged slightly, with **leader lines to the long and short lines** labelled *long line = positive* and *short line = negative*.
- The **variable resistor** cell is flagged with a small marker and the caption *the one most often not recognised*.
- The **ammeter** and **voltmeter** cells each carry a one-line placement reminder: *goes in the line* and *goes across*.
- **Generator parameters:** `symbols: string[]` (so a subset can be shown), `annotate: string[]`, `blankNames: boolean` for a matching gate, `highlight: string | null`. Symbols drawn to a consistent grid size so they are recognisable at exam scale.

**Second figure: the two arrows.** `viewBox` about `0 0 900 340`. A simple circuit — cell, switch, lamp — drawn once, with **two sets of arrows on the same wires**:

- an **outer set of solid arrows** running **positive → negative**, labelled *conventional current — what the arrow on a circuit diagram means*;
- an **inner set of open arrows** running **negative → positive**, labelled *electron flow — what the electrons actually do*;
- the cell drawn large enough that its long and short lines are unmistakable, with its terminals labelled **+** and **−**.

A caption beneath: *both are true. The convention was fixed before electrons were discovered.* This one figure carries the whole of the CCEA-only content and answers the recorded examiner finding.

**Generator parameters:** `show: ("conventional" | "electron")[]` so either can be shown alone for a gate, `labelTerminals: boolean`, `components: string[]`.

**Third, small: the meter-placement pair.** Two miniature circuits side by side, one with an ammeter correctly in series and one with it wrongly in parallel (struck through), and the same for the voltmeter. Four tiny diagrams, and they are the find-the-mistake bank for the Unit 7 finding.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, but it is the toolkit for **Prescribed Practical P6** and CCEA examines its skills in Unit 7:

- **Testing materials for conductivity** — a cell, a lamp and two crocodile clips; try metals, plastic, graphite, water. Graphite is the interesting case: a non-metal that conducts, because it has delocalised electrons, which links to `c1-carbon-allotropes-nanoparticles`.
- **Building a circuit from a diagram, and drawing a diagram from a built circuit** — both directions, because the exam sets both.
- **Placing the meters**, which is the Unit 7 Booklet B finding recorded on `p2-ohms-law-filament-lamp` and here.

The transferable Unit 7 demand is **drawing a clear circuit diagram with standard symbols** — straight lines, correct symbols, meters in the right places — which is marked directly.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Name the component shown by this symbol" [1] and its reverse, "draw the symbol for a variable resistor" [1].** Both directions; the reverse is where the recorded gap is.
2. **"Draw a circuit diagram showing a cell, a switch, a lamp and an ammeter measuring the current through the lamp" [3].** Marks for correct symbols, a complete circuit, and the ammeter in series.
3. **"In which direction do the electrons move?" [1].** And, separately, *"Mark the direction of the conventional current with an arrow" [1].* Setting both in one question is what fixes the distinction.
4. **"Explain why a metal conducts electricity but plastic does not" [2].** Free electrons versus bound electrons.
5. **"A student connects the voltmeter in series with the lamp. Explain why the reading will not be useful" [2].** A find-the-mistake item aimed at the Unit 7 finding.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Electron flow and conventional current conflated | Two arrows on one circuit, both labelled, with the historical reason given once | **CCEA S2025 P2 Foundation** — the recorded finding |
| The negative terminal identified wrongly | The **long** line is positive. Notation, so drill it | **CCEA S2025 P2 Foundation** |
| The variable-resistor symbol not recognised | Name it explicitly; it is the symbol used in every P6 circuit | **CCEA S2025 P2 Higher** |
| Ammeter placed across the component | The ammeter needs the same current as the component, so it goes in the line | **CCEA S2025 Unit 7 Booklet B** |
| Voltmeter placed in the line | The voltmeter needs the same voltage as the component, so it goes across it | **CCEA S2025 Unit 7 Booklet B** |
| Current is "used up" by components | Deal with it here in one line and fully in `p2-series-parallel-rules` | the topic's neighbour |
| Only metals conduct | Graphite conducts because of its delocalised electrons; links to C1 | the conductivity test |

---

## 7. Photographs and simulations

**Photographs: none needed.** Circuit symbols are notation, and our own drawn table serves better than any photograph of a bench. If an image is wanted at all, a **breadboard or a school circuit board** could anchor "this is what the diagram means" — verify with `pipeline/enrichment/check-commons-licence.mjs` and give it a prompt asking her to draw the diagram for what is shown.

**Simulation already held, and it is the right one:** **PhET *Circuit Construction Kit: DC***. It uses standard symbols in its schematic view, it shows the electrons **moving**, and it has real ammeters and voltmeters to place. Three tasks worth authoring:
1. Switch the view to schematic and build the circuit shown in our figure; check every symbol matches.
2. Watch the electron animation and state which terminal they leave; then mark the conventional current on our printed diagram — the two together are the topic's core.
3. Place an ammeter and a voltmeter correctly, then deliberately swap them and describe what happens to the readings.

**Videos already held:** two Cognito entries. Both AQA-shaped, so both will use "potential difference" where CCEA says **voltage**, and **neither will cover conventional current versus electron flow**, because neither board examines it. The `why` line should carry both points.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- the **diode's** one-way characteristic and I–V curve (AQA §6.2.1.4; Edexcel CP10.18b) — the symbol is on CCEA's list, the behaviour is not
- **LDR and thermistor** symbols and behaviour (Edexcel CP10.19, CP10.20; AQA §6.2.1.4)
- **static electricity**, charging by friction (AQA Physics 8463 §4.2.5; Edexcel Topic 11, physics only)
- drift velocity; resistivity; semiconductors
- "potential difference" as the required term — CCEA says **voltage**

**CCEA-only:**
- **conventional current versus electron flow** as a stated distinction — zero hits on both boards
- **cell polarity** (the long line is the positive terminal) as examinable notation

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-conductors-circuits-symbols` (status **`partial`**, high confidence — **corrected from `matched` on 20 September 2026**)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.1.1**, **§6.2.1.2**, and §6.2.1.4 for the scope boundary
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.2**, **CP10.4**, **CP10.7**, **CP10.8**
- `pipeline/enrichment/lookup-spec.mjs` searches for "conventional current" and for "conventional" alone across AQA 8464, AQA 8463 and Edexcel 1SC0
- `data/spec/double-award-science-topics.json` → `p2-conductors-circuits-symbols`: outcomes 2.3.1–2.3.5, `mustRecall`, and **three** `examinerEvidence` entries (Summer 2025 P2 Foundation, P2 Higher, Unit 7 Booklet B Foundation)
- `data/links/media-map.json` key `science:p2-conductors-circuits-symbols`
