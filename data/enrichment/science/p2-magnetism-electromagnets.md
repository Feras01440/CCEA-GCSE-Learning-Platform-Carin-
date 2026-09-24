# Enrichment dossier — p2-magnetism-electromagnets

**CCEA** Double Award Science, **P2** §2.4 Magnetism and Electromagnetism · outcomes 2.4.1, 2.4.2, 2.4.3 · tier **F** · difficulty 2 · no prescribed practical
**CCEA must-recall:** field lines of a bar magnet run **from north to south outside the magnet**; **plotting compasses** show the direction. A current-carrying coil (**solenoid**) has a field like a bar magnet; **reversing the current reverses the poles**. Electromagnet strength increases with **current**, **number of turns** and a **soft-iron core**.
**Compiled** 20 September 2026 · 28 minutes
**Headline** Cleanly matched — AQA §6.7.1.1, §6.7.1.2 and §6.7.2.1; Edexcel CP12.1 to CP12.9 — and CCEA's single recorded failure is a **variables** failure, not a magnetism one: Summer 2025 P2 Foundation records candidates changing **the battery or the core dimensions** instead of the current, the number of turns or the core material. That is the same fault as the control-variable error in `p2-resistance-length-heating`, so the two should share a habit: name the three things you are allowed to change, and change only those. The topic is otherwise the most accessible in P2 and the best served by simulation in the whole science map.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.4.1 — bar-magnet field lines, north to south outside; plotting compasses | **§6.7.1.1** *Poles of a magnet*; **§6.7.1.2** *Magnetic fields* | **CP12.1** (unlike poles attract), **CP12.4** (shape and direction of the field around bar magnets), **CP12.5** (plotting compasses), **CP12.6** (a compass and the Earth's field) | high | **matched** |
| 2.4.2 — a solenoid's field is like a bar magnet's; reversing the current reverses the poles | **§6.7.2.1** *Electromagnetism* — the field around a current-carrying wire and inside a solenoid | **CP12.7** (a current creates a magnetic effect), **CP12.9** — "explain how inside a solenoid the fields from each turn add together" | high | **matched** |
| 2.4.3 — electromagnet strength: current, turns, soft-iron core | **§6.7.2.1** — the field strength depends on the current and the distance; the solenoid arrangement and an iron core | **CP12.8** — "the strength of the field depends on the size of the current and the distance from the wire" | high | **matched**; the **soft-iron core** is CCEA's explicit third factor |

**Scope deltas outwards, and they are large.** Both boards continue into the **motor effect** — AQA §6.7.2.2 *Fleming's left-hand rule* and §6.7.2.3 *Electric motors*, both **HT only**, and Edexcel **CP12.10–CP12.13** including `F = BIl`. Edexcel also adds **permanent versus induced magnets** (CP12.3) and **electromagnetic induction** in Topic 13. **None of that is CCEA Double Award**, and it is where every borrowed video will go next.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Field lines are a picture of a rule, and the rule has three parts.** *Both boards ask for the shape and direction (AQA §6.7.1.2; Edexcel CP12.4).* Lines run **out of the north pole and into the south** outside the magnet; they **never cross**; and where they are **closer together the field is stronger** — which is why they bunch at the poles. Giving all three rules at once means she can check her own drawing, which is what the marks are for.

2. **The compass is the field detector, and its needle is itself a magnet.** *Edexcel CP12.5 and CP12.6 make this two statements, and the second is the better hook.* A plotting compass placed in the field turns until its north end points along the line — which is also why a compass works on Earth at all, and why the Earth's *magnetic* pole near the geographic north is really a south pole. One sentence of that is worth having; do not develop it.

3. **A solenoid is a bar magnet you can switch off.** *AQA §6.7.2.1's framing, and Edexcel CP12.9 gives the mechanism — the field from each turn adds to the next.* Outside, the field looks exactly like a bar magnet's, with a north and a south end. Inside, the lines are straight, close together and parallel, which is the part that differs and the part worth drawing. The "switch it off" property is what makes it useful.

4. **Reverse the current, reverse the poles — and nothing else changes.** *CCEA's own clause, which neither board states this explicitly.* The field's shape is identical; only the direction of every line flips. A figure showing the same solenoid twice, with the battery the other way round and the labels swapped, makes it a one-look fact.

5. **Three things make it stronger, and a fourth thing does not.** *Directly from the Summer 2025 P2 Foundation finding.* **More current**, **more turns**, **a soft-iron core**. What does *not* count: a bigger battery (that is just more current, said badly), a longer core, a thicker core, or moving the compass closer. Present the three as a fixed list and the near-misses as an explicit reject list, because the reject list is what our examiner evidence says is missing.

6. **Soft iron, and why "soft".** *CCEA names the material; the reason is a free mark and a good idea.* Soft iron magnetises strongly when the current flows and **loses** its magnetism when the current stops — which is exactly what an electromagnet needs. Steel would stay magnetised, which would make a useless electromagnet and a fine permanent magnet. That contrast also covers Edexcel's permanent-versus-induced idea (CP12.3) without importing it as content.

7. **Name a use, and choose one where switching matters.** *Both boards invite applications.* A scrapyard crane is the standard, and it is the right one: the whole point is that it picks up and **drops**, which a permanent magnet cannot do. Loudspeakers and relays are motor-effect applications and belong beyond CCEA.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: bar magnet and solenoid, same field, side by side.** `viewBox` about `0 0 1000 420`.

- **Left — bar magnet.** A rectangle with **N** and **S** ends labelled, and field lines drawn as smooth curves leaving N and entering S, **with arrowheads mid-line**. Lines drawn **closer together near the poles** and further apart at the sides, with a small annotation: *closer lines, stronger field*. Two or three **plotting compasses** drawn on the lines, each with its needle aligned along the line.
- **Right — solenoid.** A coil drawn as a series of loops with a battery and switch, field lines emerging from one end and entering the other in the **same pattern as the bar magnet**, and the ends labelled **N** and **S**. Inside the coil, the lines drawn **straight, parallel and close together**.
- A dashed connector between the two panels labelled *same shape outside*.
- **Generator parameters:** `object: "bar" | "solenoid" | "both"`, `currentDirection: 1 | -1` (which flips every arrowhead and swaps the N/S labels), `showCompasses: boolean`, `turns: number`, `showCore: boolean`, `labels: "full" | "blank"`. Field lines computed from a dipole model so the spacing is genuinely proportional to field strength; assert no two lines cross.

**Second figure: reverse the current.** The same solenoid drawn twice, one above the other, identical except that the **battery is the other way round**, every arrowhead is reversed and the **N and S labels have swapped ends**. One caption: *same shape, opposite direction.* Two seconds to read, and it is a whole outcome.

**Third figure, and the one aimed at the examiner finding: the three sliders.** Three horizontal rows, each with a small electromagnet picture and a slider:
- **current** — from low to high, with the number of field lines increasing;
- **turns** — from few to many, likewise;
- **core** — three states: *air*, *soft iron*, and (greyed, struck through) *steel*, with a note that steel keeps its magnetism.

Beneath, a **reject strip** listing what does **not** belong in the answer: *a bigger battery* (say "more current"), *a longer core*, *a thicker core*, *moving the compass closer*. **Generator parameters:** `factor: "current" | "turns" | "core"`, `showRejects: boolean`, `levels: number`.

---

## 4. Practical variants CCEA also examines

No prescribed practical, but this is one of the cheapest and most visual experiments in P2, and CCEA examines its variable discipline:

| Activity | Source | Measured | Why it matters |
|---|---|---|---|
| **Plotting the field with a compass** | Edexcel CP12.5; AQA §6.7.1.2 | direction at many points, joined into lines | Produces the hero figure by hand; the dot-and-join method is worth describing |
| **Iron filings on paper over a magnet** | standard on both boards | the pattern, qualitatively | Instant and memorable, but it shows shape and **not direction** — which is exactly why the compass is still needed. Worth saying |
| **Counting paperclips lifted** | the standard electromagnet investigation | number of clips against current, or against turns | This is the investigation our examiner evidence is about. One variable at a time |
| **Swapping the core** | CCEA's third factor | clips lifted with air, soft iron, steel | Shows the core's effect and sets up why *soft* iron |

**The Unit 7 demands CCEA marks here:** naming the independent, dependent and control variables — the recorded failure — and keeping the others fixed; repeating the count and taking a mean, since clips lifted is a noisy measurement; and switching off between trials so the core does not retain magnetism.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Draw the magnetic field pattern around this bar magnet" [3].** Marks for the shape, for arrowheads pointing **N to S outside**, and for lines closer at the poles. A `choice` over four computed figures works well: distractors with no arrowheads, arrows reversed, and lines crossing.
2. **"A plotting compass is placed at X. Draw the direction of its needle" [1].** A single mark that tests whether the direction rule is understood rather than recalled.
3. **"Give three ways to increase the strength of the electromagnet" [3].** The recorded failure. Author *bigger battery*, *longer core* and *thicker core* as named `commonError` distractors, each with feedback saying what the answer should have been.
4. **"The current is reversed. What happens to the poles?" [1].** They swap.
5. **"Explain why the core is made of soft iron rather than steel" [2].** Magnetises strongly; loses its magnetism when the current stops.
6. **"Explain why an electromagnet, not a permanent magnet, is used in a scrapyard crane" [2].** It can be switched off to drop the load.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| "Use a bigger battery" offered as a factor | The factor is **more current**. Say the quantity, not the component | **CCEA S2025 P2 Foundation** — the recorded finding |
| Core **dimensions** offered as a factor | The core's **material** is what matters, not its length or thickness | **CCEA S2025 P2 Foundation** |
| Field lines drawn without arrowheads | A field has a direction; the arrowheads are part of the answer | AQA §6.7.1.2 and Edexcel CP12.4 both require direction |
| Field lines drawn crossing | They never cross — a compass cannot point two ways at one place | standard field-line rule |
| Iron filings show direction | They show the **shape** only. The compass gives direction | the practical contrast |
| Reversing the current changes the shape | Only the direction flips; the pattern is identical | CCEA's own clause; the second figure |
| Any iron will do for the core | **Soft** iron loses its magnetism when the current stops; steel keeps it | CCEA names soft iron; covers Edexcel CP12.3's idea without importing it |
| The field only exists at the poles | It is strongest there, shown by the lines being closer — but it is everywhere around the magnet | the spacing annotation |

---

## 7. Photographs (Commons, licence checked 20 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Bar-magnet-iron-filings max.jpg` (MikeRun, Vera Wurmsdobler) | CC BY-SA 4.0 | 1095×602 | Iron filings around a bar magnet — the field pattern as a real photograph. Prompt: *the filings show the shape. What can they not tell you, and what would you use to find it out?* |
| `File:Bar-magnets-attracting-iron-filings max.jpg` (same) | CC BY-SA 4.0 | 2191×1257 | Two attracting magnets; the lines running between them make "closer means stronger" visible |
| `File:Bar-magnets-repelling-iron-filings-max.jpg` (same) | CC BY-SA 4.0 | 2229×1252 | The repelling pair, with the gap where the field cancels. Sets up attract/repel with evidence rather than assertion |
| `File:Solenoid-with-core.JPG` (Svjo) | CC BY-SA 3.0 | 892×314 | A real solenoid with a core in place; makes the third factor a physical object |

**Simulation already held, and it is among the best matches in the whole science map:** **PhET *Magnets and Electromagnets***. It shows the field with a grid of compass needles, lets a real compass be dragged around, has a bar-magnet tab and an electromagnet tab with **sliders for the current and the number of turns**, and a **battery-reversal control**. Three tasks worth authoring:
1. Drag the compass around the bar magnet and describe how the needle behaves near each pole.
2. On the electromagnet tab, increase the **current** only, then the **turns** only, and describe the field each time — one variable at a time, which is the recorded weakness.
3. Reverse the battery and say what changed and what did not.
The one gap: the sim has no soft-iron core option, so the third CCEA factor must come from our own figure and from the paperclip experiment.

**Videos already held:** two Freesciencelessons entries. Both AQA-shaped, so both will continue into the **motor effect and Fleming's left-hand rule**, which are HT-only on AQA and **beyond CCEA Double Award entirely**. One `notonspec` line covers it, and the `why` line should say where to stop watching.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- the **motor effect**, **Fleming's left-hand rule** and **electric motors** (AQA §6.7.2.2, §6.7.2.3, both HT; Edexcel CP12.10–CP12.13)
- **`F = B I l`** and magnetic flux density (Edexcel CP12.13)
- **electromagnetic induction**, generators and transformers (Edexcel Topic 13; AQA Physics 8463)
- **permanent versus induced magnetism** as named categories (Edexcel CP12.3) — the soft-iron/steel contrast covers the idea without the terms
- loudspeakers and relays
- the Earth's magnetic field beyond one sentence about the compass

**CCEA-specific:** the **soft-iron core** named as the third strength factor, and **reversing the current reverses the poles** as an examined statement.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-magnetism-electromagnets` (status `matched`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.7.1.1**, **§6.7.1.2**, **§6.7.2.1**, and §6.7.2.2–§6.7.2.3 for the scope boundary
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP12.1** to **CP12.9**, and CP12.10–CP12.13 for the scope boundary
- `data/spec/double-award-science-topics.json` → `p2-magnetism-electromagnets`: outcomes 2.4.1–2.4.3, `mustRecall`, and the Summer 2025 P2 Foundation `examinerEvidence` entry
- Wikimedia Commons API for all four photographs
- `data/links/media-map.json` key `science:p2-magnetism-electromagnets`
