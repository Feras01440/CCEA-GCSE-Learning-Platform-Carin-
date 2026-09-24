# Enrichment dossier — p2-electricity-in-the-home

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.19, 2.3.21 to 2.3.25 · tier **F** · **difficulty 4 — the widest topic in P2**, six outcomes · no prescribed practical
**CCEA must-recall:** **d.c.** flows one way (cells) — flat CRO trace; **a.c.** reverses repeatedly (mains, **50 Hz**) — sine-wave CRO trace. A one-way switch makes or breaks the circuit and is **always on the live side**. Three-pin plug: **live (brown, fused)**, **neutral (blue)**, **earth (green/yellow, to the metal case)**. If the live touches the metal case a large current flows to earth and **melts the fuse**, cutting off the supply; **double-insulated** appliances have plastic cases and need **no earth**. Choose a fuse just above the normal current: **I = P / V**, then 3 A, 5 A or 13 A.
**Compiled** 20 September 2026 · 32 minutes
**Headline** Most of this is matched (AQA §6.2.3.1–§6.2.3.2; Edexcel CP10.33–CP10.41), but **three of CCEA's requirements have no home on either board** — and two of them are exactly what its examiners record as failing. **"Double insulat" returns zero hits** in AQA 8464, AQA 8463 and Edexcel 1SC0, and CCEA Summer 2024 says candidates could not explain why such an appliance needs no earth wire. **Choosing a fuse rating** from `I = P/V` is also CCEA's own: both boards explain what a fuse does, neither asks for the rating to be selected. And the **CRO trace comparison** for a.c. and d.c. is CCEA's, with Summer 2025 recording those sketches as weak.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.19 — a.c. and d.c.; **CRO traces** | **§6.2.3.1** *Direct and alternating potential difference*; mains 230 V, 50 Hz | **CP10.33** (difference between direct and alternating voltage), **CP10.34**, **CP10.35**, **CP10.36** (UK mains a.c. at 50 Hz) | high | **partial** — the concepts match; the **CRO trace** is CCEA's own |
| 2.3.21 — switch on the live side | **§6.2.3.2** *Mains electricity* | **CP10.39** — "explain why switches and fuses should be connected in the live wire" | high | matched |
| 2.3.22, 2.3.23 — three-pin plug: live, neutral, earth, colours, fuse | **§6.2.3.2** — the three wires, their colours and roles | **CP10.37** (live and neutral function), **CP10.38** (earth wire, fuses and circuit breakers), **CP10.40** (the potential differences) | high | matched |
| 2.3.24 — fuse action when the live touches the case; **double insulation** | §6.2.3.2 covers the earth-wire and fuse action | CP10.38, **CP10.41** (dangers of a live-to-earth connection) | high | **partial** — the fuse action matches; **double insulation is ccea-only** |
| 2.3.25 — **choosing a fuse rating** from `I = P / V` (3 A, 5 A, 13 A) | **unmatched** | **unmatched** | high | **ccea-only** |

Evidence: `double insulat` returns **zero hits** in AQA 8464, AQA 8463 and Edexcel 1SC0; neither board's fuse statements ask for a rating to be chosen.

**Scope deltas outwards.** Edexcel adds the actual **potential differences** between live, neutral and earth as numbers (CP10.40) and the physics of why touching live is dangerous (CP10.41). AQA adds the **National Grid** in §6.2.4.3, which is beyond CCEA.

---

## 2. Teaching angles worth recreating (in our own words)

1. **One sentence separates a.c. from d.c., and the trace is that sentence drawn.** *AQA §6.2.3.1's framing.* **d.c.**: the current always flows the same way, so the trace is a **flat horizontal line** at a steady height. **a.c.**: the current reverses, so the trace is a **wave crossing the zero line**. Since CCEA examines the sketch and our Summer 2025 evidence says the sketches were weak, draw the two traces side by side on the **same axes** and make the sketch itself the gated task.

2. **50 Hz means fifty full cycles a second — and that fixes the trace.** *Both boards state the frequency; CCEA examines it.* One complete wave is one cycle; fifty of them fit into a second, so each takes one-fiftieth of a second. Putting a time axis on the trace with one cycle marked turns "50 Hz" from a number into something she can point at.

3. **Three wires, three jobs — say the job, not just the colour.** *Both boards list the wires; the colours alone are the weakest possible answer.* **Live (brown)** brings the supply and is the dangerous one; **neutral (blue)** completes the circuit back; **earth (green and yellow)** does nothing at all in normal use, and is a safety route to the ground connected to the metal case. That last clause — *does nothing until something goes wrong* — is what makes the fault sequence understandable.

4. **The fault sequence, as a chain of four steps.** *CCEA Summer 2024: fuse action in a three-pin plug was "least well answered", so decompose it.* (i) The live wire touches the metal case; (ii) the case is connected to earth, which is a very low-resistance path; (iii) a very large current flows; (iv) the fuse wire melts and **breaks the live connection**, so the case is no longer live. Four steps, four marks, and the last clause matters: the fuse protects the *user* by disconnecting the live wire, not by absorbing the current.

5. **Why the switch and the fuse are both on the live side.** *Edexcel CP10.39 states it; the reason is worth giving.* Both are there to **cut the appliance off from the live supply**. A switch in the neutral wire would stop the appliance working but leave everything inside it still connected to live — still dangerous to touch. The same argument covers the fuse.

6. **Double insulation: no metal to go live, so nothing to earth.** *CCEA-only — zero hits on either board — and our recorded failure.* If the whole case is plastic, the live wire cannot make the outside of the appliance live, so there is nothing for an earth wire to protect. Such appliances have **two-core** cable and carry the double-square symbol. Because no borrowed resource covers this, it needs its own section and its own gate, and the symbol is worth showing.

7. **Choosing the fuse: work out the normal current, then take the next one up.** *CCEA-only.* Compute `I = P / V` with V = 230 V, then pick the smallest standard fuse **above** that value from 3 A, 5 A, 13 A. The reason for "just above" is worth one line: too high and it will not blow when it should; too low and it will blow in normal use. Make the two-step layout compulsory — the current on one line, the chosen fuse on the next.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two CRO traces.** `viewBox` about `0 0 940 380`. Two screens side by side, drawn as CRO grids with a marked **zero line** across the middle of each.

- **Left — d.c.** A flat horizontal line above the zero line, labelled *always the same direction*.
- **Right — a.c.** A sine wave crossing the zero line, with **one complete cycle bracketed** and labelled *1 cycle*, and a note beneath: *50 cycles every second = 50 Hz*.
- Both screens share a **time axis** beneath with the same scale, so the comparison is honest.
- A caption band: *above the line, current one way; below the line, the other way.*
- **Generator parameters:** `type: "dc" | "ac" | "both"`, `frequency`, `amplitude`, `showCycleBracket: boolean`, `blankTrace: "dc" | "ac" | null` so a gate can ask her to choose or sketch the missing one. The wave computed from `frequency`; assert the bracketed cycle spans exactly one period.

**Second figure: the plug, wired and labelled.** `viewBox` about `0 0 880 520`. A three-pin plug with the back off, drawn to CCEA's conventions.

- Three wires to three terminals, each labelled with **name, colour and job** on three short lines: *live — brown — brings the supply*; *neutral — blue — completes the circuit*; *earth — green and yellow — safety path to the metal case*.
- The **fuse** drawn in the live line, labelled and with a leader saying *in the live wire, so it cuts off the supply*.
- The **cable grip** shown, since it appears in exam diagrams.
- **Generator parameters:** `labels: "full" | "names-only" | "blank"`, `showJobs: boolean`, `wrongVersion: "fuse-in-neutral" | "colours-swapped" | "earth-omitted" | null` — all three are real find-the-mistake items, and the third is the double-insulation contrast.

**Third figure: the fault chain.** Four linked boxes reading *live wire touches the metal case* → *case is earthed, so a very low-resistance path exists* → *a very large current flows* → *the fuse melts and breaks the live connection*. Drawn as a chain because the mark scheme awards the links, aimed squarely at the Summer 2024 finding.

**Fourth, small: the double-insulation card.** Two appliances side by side — a metal-cased one with three wires and an earth, and a plastic-cased one with **two** wires and the **double-square symbol** — with one caption: *no metal outside, so nothing can become live, so no earth is needed.*

---

## 4. Practical variants CCEA also examines

No prescribed practical, and for obvious reasons nothing here is done at mains voltage. What CCEA does examine:

- **Wiring a plug** (on a demonstration plug, not a live one) — the classic exercise, and the source of the labelling question.
- **Examining a blown fuse** against an intact one; the broken wire inside is visible and memorable.
- **CRO traces from a low-voltage a.c. supply and from a cell** — a genuine demonstration that produces exactly the two traces CCEA asks her to sketch, and the only way to make the comparison real.
- **Sorting appliances** by whether they are earthed or double-insulated, using the symbol on the rating plate. Free, and it directly addresses the recorded gap.

The transferable Unit 7 demand: **reading a trace from a screen** and **choosing a component from a calculated value**, which is the fuse question.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Sketch the trace you would see on a CRO for a.c. and for d.c." [2].** CCEA's own, and recorded as weak. Encode as a `choice` over four computed traces whose distractors are a sine wave not crossing zero, a flat line at zero, and a square wave.
2. **"Label the three wires in this plug and give the function of each" [3–6].** Our `label` answer kind; the **function** is where the marks are.
3. **"Explain how the earth wire and the fuse together protect the user" [4].** The four-link chain. Author the scheme link by link so a partial chain scores.
4. **"Explain why the fuse and the switch are in the live wire" [2].** Edexcel CP10.39's exact statement.
5. **"A hairdryer is rated 1150 W and runs from the 230 V mains. Which fuse should be fitted: 3 A, 5 A or 13 A?" [3].** CCEA-only. Marks: the current from `I = P/V`; the choice of the next fuse above; ideally a reason.
6. **"Explain why this appliance does not need an earth wire" [2].** The double-insulation item — the recorded failure, and unavailable in any borrowed resource.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Double insulation not understood | No metal on the outside, so nothing can become live, so there is nothing for an earth wire to protect. Two-core cable, double-square symbol | **CCEA S2024 P2 Foundation** — and **zero hits on either board**, so it must be authored here |
| The fuse "uses up" the current | The fuse **melts and breaks the circuit**, disconnecting the live wire | **CCEA S2024** — fuse action "least well answered" |
| CRO traces drawn wrongly | d.c. is a flat line; a.c. is a wave **crossing zero**. Draw both on one zero line | **CCEA S2025 P2 Foundation** |
| The earth wire carries current normally | It carries nothing until a fault occurs. That is why the appliance works without it — and why double insulation is an alternative | follows from angle 3 |
| Wire colours given without jobs | The colour identifies the wire; the mark is for the job | universal mark-scheme habit |
| Fuse chosen below the working current | Just **above** the normal current: too low and it blows in normal use, too high and it will not blow in a fault | CCEA-only content |
| Switch in the neutral wire is fine | The appliance would stop, but its insides would stay connected to live | Edexcel CP10.39 |
| 50 Hz means 50 volts | It is fifty complete cycles per second; the mains voltage is 230 V | both boards state both numbers |

---

## 7. Photographs (Commons, licence checked 20 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Three pin mains plug (UK).svg` (Slashme) | CC BY-SA 3.0 | 245×187 | A labelled UK plug with cable grip, neutral, earth, live and fuse. **Use as a drawing reference for our own figure**, since the house rule is to recreate diagrams; its numbering shows the conventional layout |
| `File:Selection of Fuses.JPG` (Pfnicholls) | CC BY-SA 4.0 | 800×542 | Real UK domestic cartridge fuses alongside other types. Prompt: *these are 3 A, 5 A and 13 A. Which would you fit to a 1150 W hairdryer on the 230 V mains, and why not the next one up?* |

A photograph of the **double-square double-insulation symbol** on a rating plate would be the single most valuable image for this topic, because that content exists nowhere else. Search for it with `pipeline/enrichment/check-commons-licence.mjs` before authoring.

**Simulation already held, with an honest limit:** **PhET *Circuit Construction Kit: DC***. The "DC" is the point — it cannot show a.c., a CRO trace, a plug or a fuse rating, so it models **none** of this topic's distinctive content. It does have a **fuse** component that blows on excess current, which is a genuine demonstration of angle 4 and worth one task: *put a fuse in a circuit, raise the current until it blows, and describe what happens to the rest of the circuit.* Frame the task that narrowly or leave the panel empty; the rest of the topic needs our own figures.

**Videos already held:** three Cognito entries. All AQA-shaped, so all will use "potential difference", may include the **National Grid**, and **none will cover double insulation or choosing a fuse rating**, because neither board examines them. Those two omissions are the topic's recorded failures, so the `why` line must say so plainly.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **the National Grid**, transformers and step-up/step-down (AQA §6.2.4.3; Edexcel CP13.6–CP13.10)
- the **numerical potential differences** between live, neutral and earth (Edexcel CP10.40) — useful context, not required
- **circuit breakers and RCDs** in detail (Edexcel CP10.38 names them; CCEA's outcome is the fuse)
- r.m.s. and peak values; the CRO's time-base and volts-per-division settings as calculations
- ring mains, consumer units, earthing of the supply
- "potential difference" as the required term — CCEA says **voltage**

**CCEA-only:**
- **double insulation** and why such an appliance needs no earth wire — zero hits in AQA 8464, AQA 8463 and Edexcel 1SC0
- **choosing a fuse rating** from `I = P / V` and the 3 A / 5 A / 13 A set
- **sketching and comparing the CRO traces** for a.c. and d.c.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-electricity-in-the-home` (status **`partial`**, high confidence — **corrected from `matched` on 20 September 2026** after searching for "double insulat" and checking both boards' fuse statements)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.3.1**, **§6.2.3.2**, and §6.2.4.3 for the scope boundary
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.33** to **CP10.41**
- `pipeline/enrichment/lookup-spec.mjs` searches for "double insulat", "fuse" and "earth wire" across AQA 8464, AQA 8463 and Edexcel 1SC0
- `data/spec/double-award-science-topics.json` → `p2-electricity-in-the-home`: outcomes 2.3.19–2.3.25, `keyEquations`, `mustRecall`, and two `examinerEvidence` entries (Summer 2025 P2 Foundation; Summer 2024 P2 Foundation)
- Wikimedia Commons API for both images above
- `data/links/media-map.json` key `science:p2-electricity-in-the-home`
