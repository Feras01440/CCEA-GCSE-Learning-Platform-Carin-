# Enrichment dossier — connected-particles-and-pulleys

**CCEA** GCSE Further Mathematics (2017), **FM2** Unit 2 Mechanics, area Newton's laws of motion · statement **FM2-NEW-01** · **difficulty 5 — the hardest topic in FM2 by our own scoring** · calculator paper
**CCEA statement:** apply F = ma to two connected bodies in rectilinear motion. **F = μR will not be tested.**
**CCEA Teacher Guidance:** questions may involve **calculating the magnitude of the resultant force exerted by a string on a pulley**. With connected particles, either both bodies move horizontally, or both move vertically, or one moves horizontally and the other vertically.
**Formula sheet (Unit 2):** `F = ma` only. **The pulley-force result is not given.**
**Prerequisites in our taxonomy:** `newtons-second-law-linear`, `maths:simultaneous-equations-linear`
**Compiled** 20 September 2026 · 35 minutes
**Headline** CCEA's Summer 2025 report calls the force-on-the-pulley part **"the least well-answered question on the paper"**, and Summer 2022 records that "a large number of candidates didn't know that the force on the pulley was double the calculated tension". This is the one place in FM2 where a short, memorable result does most of the work — and where the A level literature independently reports the same failure, so the framing below is doubly evidenced. Everything else in the topic is `newtons-second-law-linear` done twice, carefully, with the two equations added to eliminate T.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | DfE A level | Confidence | Status |
|---|---|---|---|---|---|---|
| FM2-NEW-01 (connected-bodies part) | **unmatched** — no mechanics | **unmatched** | **unmatched** | **Section R, Forces and Newton's laws** | high | **partial** |

(DfE mechanics sections: **P** quantities and units, **Q** kinematics, **R** forces and Newton's laws, **S** moments.)

**Scope deltas.** A level connected-particle work includes **μR**, bodies on **inclined planes connected over a pulley**, and sometimes three connected bodies. CCEA restricts to two bodies, straight-line motion, and the three configurations in the Teacher Guidance. The **force on the pulley**, by contrast, is a CCEA emphasis that A level treats only in passing — so on that one part the borrowed material is *thinner*, not richer.

---

## 2. Teaching angles worth recreating (in our own words)

1. **One body at a time. Two diagrams, two equations, then add.** *The explicit recommendation in every A level treatment — Save My Exams' OCR and CIE "Connected bodies (pulleys)" notes both state that the particles move in different directions so they must be considered separately.* CCEA's Summer 2025 finding confirms it from the marking end: "**treating the masses separately was more successful than the whole system**." So the method is: draw each body's own diagram, write `F = ma` for each with the **same `a`** and the **same `T`**, then add the two equations so `T` cancels. Adding is the step worth naming, because it is what makes the pair solvable without algebra she finds hard.

2. **Same string, same tension; same string, same acceleration — and say why.** *Standard, and worth the ten seconds.* The string is light and inextensible over a smooth pulley, so the tension is the same throughout and the two bodies must move at the same rate. Those two sentences are what licence the "same `T`, same `a`" in step 1, and CCEA's Summer 2022 evidence ("poor equations of motion for each block") suggests candidates who omit them are guessing at the equations rather than deriving them.

3. **The force on the pulley is the vector sum of two tensions — and the two strings usually pull in different directions.** *CCEA's own `mustMemorise`, and the single most valuable line in this dossier.* Get the general statement right first and the special cases follow:
   - strings **parallel** (both vertical, either side of the pulley): the pulls are in the same direction, so the resultant is **2T**, straight down;
   - strings at **right angles** (one horizontal, one vertical — CCEA's third configuration): the resultant is **T√2**, at 45° to each;
   - strings at angle **θ** between them: **2T cos(θ/2)**.
   Summer 2025 records the force "wrongly taken as 2T" when the strings were *not* parallel, so teaching only the 2T case is actively harmful. Teach the parallelogram first, then the three results as consequences.

4. **The A level literature reports the same misconception, which is unusual and worth using.** *A level examiner commentary records that students "incorrectly assumed that the force on the pulley was made up of the components of the two weights, with very few realising that the resultant force acted vertically downwards".* Two independent bodies of evidence naming the same error means the insight card can say so, and it justifies giving this one result a section of its own rather than a footnote.

5. **When the connection breaks, start again from scratch.** *CCEA Summer 2019 Q5(iv) ("new acceleration after the tow-bar breaks — only by the more able") and the "string breaks" variant in `mustMemorise`.* After a tow-bar snaps or a string is cut, each body is a **separate** `F = ma` problem with its own forces, and the tension is gone. Make it an explicit "redraw" step: new diagrams, new equations. This is the part that separates grades.

6. **Do not carry a later value back into an earlier part.** *CCEA Summer 2024 Q6: "substituting the later value of M into part (i) scored zero."* Each part uses the information available at that point. Worth one line in the "In the exam" panel because it costs whole parts.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the split diagram.** `viewBox` about `0 0 1000 520`. The physical set-up along the top, and the two free-body diagrams pulled out beneath it.

- **Top band — the set-up.** For the pulley configuration: a table edge with a pulley at the corner, body A on the table connected by a string over the pulley to body B hanging. For the tow-bar configuration: a car and trailer on a horizontal line joined by a bar.
- **Two dashed "exploded" lines** running down from each body to its own free-body diagram below, so the figure says visually *separate them*.
- **Lower band — two free-body diagrams side by side**, each with only that body's forces: for A, tension right, friction left, weight down, `R` up; for B, weight `Bg` down, tension up. **The same label `T` on both**, boxed, with a caption *one string, one tension*. **The same acceleration `a` on both**, as an open arrow, with a caption *inextensible, so one acceleration*.
- **Beneath each diagram, its equation**, and beneath both, the two equations written one above the other with a rule and a `+` sign in the margin, and `T` struck through on both sides to show the elimination.
- **Generator parameters:** `configuration: "pulley-table" | "both-vertical" | "tow-bar"`, `massA`, `massB`, `friction`, with `T` and `a` computed by solving the pair; `showElimination: boolean`; `stage: "setup" | "split" | "equations" | "solved"`. Assert the solved `T` and `a` satisfy both equations.

**Second figure, and the one that earns the topic its keep: the pulley-force parallelogram.** `viewBox` about `0 0 940 380`. Three panels, same pulley drawn in each, differing only in the angle between the strings.

- **Panel 1 — parallel strings** (both vertical). Two `T` arrows drawn down each side, the parallelogram degenerate, the resultant drawn as a single bold arrow labelled **2T, vertically downwards**.
- **Panel 2 — right angle** (one horizontal, one vertical). Two `T` arrows at 90°, the parallelogram a square, the diagonal drawn and labelled **T√2, at 45°**.
- **Panel 3 — general angle θ.** Two `T` arrows with θ marked between them, the parallelogram drawn with dashed sides, the diagonal labelled **2T cos(θ/2)**.
- Under all three, one line: *the force on the pulley is the resultant of the two pulls — find it the same way every time.*
- **Generator parameters:** `angleDeg` (which produces any of the three, with the magnitude computed from `2T cos(θ/2)`), `tension`, `showParallelogram: boolean`, `panels: number[]`.

**Third, small: the break card.** The set-up before and after the string is cut, side by side, with the tension arrow removed in the second and a caption *new diagram, new equation, new acceleration*.

---

## 4. Practical variants CCEA also examines

No prescribed practical, but the three configurations in the Teacher Guidance are the examinable contexts and are worth naming explicitly, because A level adds others CCEA never sets:

| Configuration | CCEA sets it | Typical context |
|---|---|---|
| Both bodies **horizontal** | yes | car and trailer joined by a tow-bar; two blocks joined by a string on a table |
| Both bodies **vertical** | yes | two masses either side of a pulley (strings parallel → pulley force 2T) |
| One **horizontal**, one **vertical** | yes | block on a table, string over a pulley at the edge, mass hanging (strings at right angles → pulley force T√2) |
| Two bodies connected **over a pulley on an inclined plane** | **no** | A level standard; avoid |
| **Three** connected bodies | **no** | A level occasionally; avoid |

---

## 5. Question types the other boards use that CCEA also rewards

This is a long multi-part question — Q5 in Summer 2019, 2022 and 2025, Q4 in Summer 2023, Q6 in Summer 2024 — typically five or six parts and 12 or more marks, and it is the paper's main discriminator.

1. **"Find the acceleration of the system" [3–4].** Two equations, added. Marks for each equation and the answer.
2. **"Find the tension in the string" [2].** Substitute back into either equation. Summer 2023 shows the target lines exactly: `T − 90 = Ma` and `51.6 − T = Ma`.
3. **"Find the magnitude of the force exerted by the string on the pulley" [2–3].** The discriminator, and the least well-answered part on the 2025 paper. Marks for recognising it is a resultant of two tensions **and** for the correct geometry.
4. **"The tow-bar breaks. Find the new deceleration of the trailer" [3].** Redraw, new equation.
5. **"Show that the mass is M" [3].** Forward route only; verification is capped, as in `newtons-second-law-linear`.

**Mark-scheme habits worth copying:** each equation of motion is its own method mark and survives arithmetic slips (Summer 2019 records "poor arithmetic" costing accuracy but not method); and Summer 2024 notes **generous follow-through**, so our scheme should carry a wrong `a` forward into the tension mark.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The pulley force is always 2T | It is the **resultant of two pulls**. 2T only when the strings are parallel; T√2 at a right angle; 2T cos(θ/2) in general | CCEA S2022 Q5(iv) and **S2025 Q4(iv), "the least well-answered question on the paper"** |
| The pulley force is the sum of the two weights, or their components | It is built from the **tensions**, not the weights | A level examiner commentary reports exactly this; worth naming because two independent sources agree |
| The system treated as one body | One body, one diagram, one equation — then add | CCEA S2025 Q4(ii): separate treatment "was more successful" |
| A wrong single equation such as `T − 30 − 80 = 8a` | Each equation contains only the forces on **that** body. Name the body before writing it | CCEA S2025 Q4(ii) records this exact equation |
| Mass and force confused | Units on every quantity: kg against N | CCEA S2025 Q4(ii) |
| After the break, the old acceleration is reused | New diagram, new equation. The tension is gone | CCEA S2019 Q5(iv) |
| A later value substituted into an earlier part | Each part uses what was known at that point | CCEA S2024 Q6 — scored zero |
| `F = ma` applied where it is not needed | Some parts are pure force-balance or kinematics. Read what is asked | CCEA S2023 Q4(ii) |

---

## 7. Photographs, videos and simulations

**Photographs.** One is genuinely useful here, because a real pulley makes the two-strings-one-tension idea concrete. Verified on Commons in this session: **`File:Einfachst möglicher Flaschenzug (Tischversuch).jpg`** (Rhetos, **CC0**, 1933 × 1994) — a simple table-top pulley rig. Prompt: *the two parts of the string pull on the pulley. In which direction is the force on the pulley, and how does it compare with the tension?* Check any alternative with `pipeline/enrichment/check-commons-licence.mjs` before use; several pulley images on Commons carry "No restrictions", which the fetcher refuses.

**Videos already held** (`further-maths:connected-particles-and-pulleys`): **P McAleavey `VOzYJqjx-UA` and `AVxOEUW8ccA`** — CCEA Further Mathematics by name. These should lead; for the hardest topic in FM2, board-specific video is worth more than production values.

**Simulations: none, and that is now recorded.** PhET *Forces and Motion: Basics* had been mapped here; it is a single-body force-and-acceleration sim and models neither a pulley nor a connected pair. It was removed from `data/links/media-map.json` on 20 September 2026 and the slug's `sims` array is deliberately empty. There is no faithful free connected-particles sim in our verified set.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **F = μR** and coefficients of friction
- **connected bodies on an inclined plane**, and pulleys at the top of a slope — the commonest A level configuration and not a CCEA one
- **three or more connected bodies**; strings with mass; pulleys with moment of inertia
- impulse and momentum in connected systems; the jerk when a string becomes taut
- the tension varying along a heavy string

**CCEA-specific:**
- the **force exerted by the string on the pulley**, named in the Teacher Guidance and examined repeatedly, which A level treats only in passing
- the three permitted configurations, and the **string-breaks / tow-bar-snaps** follow-up part
- friction supplied as a value or per unit mass

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:connected-particles-and-pulleys` (status `partial`, high confidence)
- DfE GCE AS and A level subject content for mathematics, **section R Forces and Newton's laws**
- AQA 8365, OCR 6993, Edexcel 4PM1 specifications — searched; none carries connected-particle mechanics
- Save My Exams "Connected Bodies (Pulleys)" notes for OCR A Level Maths and CIE A Level Mechanics; Physics & Maths Tutor *M1 Dynamics — Connected particles* topic-question compilation — for the one-body-at-a-time discipline and the range of contexts
- A level examiner commentary on the force exerted on a pulley (the "components of the two weights" misconception), which independently matches CCEA's own finding
- `data/spec/further-mathematics.json` → `connected-particles-and-pulleys`: statement FM2-NEW-01, Teacher Guidance, `mustMemorise`, and **five** `examinerEvidence` entries (Summer 2019 Q5, 2022 Q5, 2023 Q4, 2024 Q6, 2025 Q4)
- Wikimedia Commons API for the pulley photograph above
- `data/links/media-map.json` key `further-maths:connected-particles-and-pulleys`
