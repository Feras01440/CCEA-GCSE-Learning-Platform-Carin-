# Enrichment dossier — moments-uniform-rod

**CCEA** GCSE Further Mathematics (2017), **FM2** Unit 2 Mechanics, area Moments · statement **FM2-MOM-01** · difficulty 4 · calculator paper
**CCEA statement:** demonstrate understanding of the Principle of Moments and equilibrium of a rigid body, **restricted to a horizontal uniform rod supported by one or two pivots**
**CCEA Teacher Guidance:** problems will involve **uniform rods only — no hinge or ladder questions**
**Formula sheet:** **nothing.** `moment = force × perpendicular distance` must be recalled.
**Prerequisites in our taxonomy:** `force-diagrams`, `equilibrium-of-forces`
**Compiled** 20 September 2026 · 30 minutes
**Headline** CCEA's evidence calls this a **"very good discriminator"** (Summer 2019) and a "good differentiator" (Summer 2024), with most candidates earning something and only the strongest earning everything. The gap is always the same: candidates can compute *a* moment but cannot run the **two conditions together** — moments balance **and** vertical forces balance — and Summer 2022 records the specific failure of using moments where the answer needed the vertical equation. The single best borrowing is the A level habit of **choosing the pivot point deliberately, to make an unknown disappear**, which turns a simultaneous problem into two single-unknown ones.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | DfE A level | Confidence | Status |
|---|---|---|---|---|---|---|
| FM2-MOM-01 | **unmatched** — no mechanics | **unmatched** | **unmatched** | **Section S, Moments** | high | **partial** |

(DfE mechanics sections: **P** quantities and units, **Q** kinematics, **R** forces and Newton's laws, **S** moments.)

There is also a **GCSE Physics** comparison worth knowing about, and it is closer in level than A level is: AQA 8463 §4.5.4 *Moments, levers and gears (physics only)* and CCEA's own Double Award P1 `p1-moments` (Prescribed Practical P3). Those treat the principle of moments at exactly this level, though without the two-support algebra. For a first-teaching pass, GCSE Physics material is better pitched than A level Mechanics material.

**Scope deltas.** A level section S includes **non-uniform rods**, **ladders against walls**, **hinges** and moments about any point in two dimensions. CCEA excludes hinges and ladders in terms and restricts to a **horizontal uniform rod**. Almost every A level worked example is therefore off-limits, while GCSE Physics examples are under-powered on the algebra — so this topic needs more original authoring than most.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Two conditions, always both, and they answer different questions.** *The universal A level statement of rigid-body equilibrium.* For a rod in equilibrium:
   - **moments about any point balance** — clockwise = anticlockwise;
   - **vertical forces balance** — up = down.
   CCEA's Summer 2022 finding is candidates using moments where the vertical equation was needed. So teach them as a **pair with a division of labour**: the vertical equation relates the reactions to the loads; the moments equation locates things along the rod. Put the two equations side by side in every worked example, and label which unknown each one is for.

2. **Choose the pivot to kill an unknown.** *The single most useful technique in the topic, standard in every A level treatment and absent from GCSE Physics material.* Moments may be taken about **any** point, so take them about a point where an unknown force acts — that force then has zero distance and vanishes from the equation. CCEA's Summer 2023 evidence shows candidates taking moments "about A, B, C and the centre all seen", which means the choice is being made at random rather than strategically. Make it a numbered step with its reason: *take moments about the support you do not want to find*.

3. **The weight of a uniform rod acts at its midpoint — and it is easy to forget entirely.** *CCEA's own `mustMemorise`, and Summer 2022 records "plank weight omitted".* "Uniform" is the word that licences it, and CCEA prints that word deliberately. Draw the weight arrow at the midpoint in every figure, and make one gate ask only *where does the rod's weight act, and how do you know?*

4. **On the point of tilting, the other reaction is zero.** *CCEA's `mustMemorise` again; the classic A level modelling step.* When a load moves far enough that the rod is about to rotate about one support, the reaction at the **other** support becomes zero. This converts a wordy scenario into one clean equation, and it is the part Summer 2025 says the weakest candidates attacked by trial and error instead.

5. **Use the variable, do not guess the number.** *CCEA Summer 2025 Q5(iii): "the weakest resorted to trial and error rather than using the variable d."* When the question introduces a distance `d`, the method is to write the moments equation **in terms of `d`** and solve. This is the moment the topic stops being arithmetic, and it is the discriminator. Frame it as: you already know how to solve an equation; the mechanics is only in writing it down.

6. **Reactions in a fixed ratio are still two unknowns until you use both equations.** *CCEA Summer 2022: candidates "could not deal with R and 3R".* When the question says one support carries three times the other, substitute `3R` straight into both equations. Worth a worked example of its own, because it looks harder than it is.

7. **Keep `g` in, or take it out of both sides consistently.** *Summer 2022 records `g` omitted.* Either work in newtons throughout (weights as `mg`) or note that `g` cancels from a moments equation when every term is a weight — but never halfway. State the choice before writing the equation.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the rod with its two equations.** `viewBox` about `0 0 1000 460`.

- A **horizontal rod** drawn as a long thin rectangle, with a **distance ruler** beneath it marked in metres from the left end, so every position can be read off rather than assumed.
- **Supports** drawn as triangles at their stated positions, with **upward reaction arrows** labelled `R₁` and `R₂` (or `R` and `3R` when the question sets a ratio).
- **Downward arrows**: each load at its position, and the **rod's own weight at the midpoint**, with the midpoint marked by a small centre symbol and labelled *uniform rod: weight acts here*.
- **A distance bracket** under the rod for every force, running from the chosen pivot to that force's line of action — these brackets are the perpendicular distances, and drawing them is what stops the wrong distance being used.
- **To the right, the two equations boxed separately**, each with a caption saying what it is for:
  - `clockwise = anticlockwise` — *use this to find a distance, or to eliminate a reaction*
  - `up = down` — *use this to find the other reaction*
- **Generator parameters:** `length`, `supports: [position, label][]`, `loads: [position, magnitude, label][]`, `rodWeight`, `pivotAt` (which recomputes every distance bracket and regenerates the moments equation), `unknown: "R1" | "R2" | "d" | "W"`, `showBrackets: boolean`, `tiltingAbout: number | null` (which sets the far reaction to zero and annotates it). All distances and moments computed; assert the two equations are consistent.

**Second figure: pivot choice, twice.** The same rod drawn twice, one above the other, identical except for a marked pivot — at the left support in the top copy, at the right support in the bottom. Under each, the moments equation that results, with the vanished reaction struck through and a caption *taking moments here removes R₂*. Seeing the same physical problem produce two different, equally valid equations is what makes "choose the pivot" a strategy rather than a rule.

**Third, small: on the point of tilting.** Three miniature rods with a load sliding right, the right-hand reaction arrow shrinking and then disappearing, captioned *about to tilt: R = 0 at the other support*.

---

## 4. Practical variants CCEA also examines

No prescribed practical in Further Mathematics, but this topic has a real laboratory cousin worth knowing:

- **CCEA Double Award Science Prescribed Practical P3** is the Principle of Moments — a metre rule on a pivot with hanging masses. Our own `science:p1-moments` dossier territory covers it, and the apparatus makes an excellent hook here: she may well have done it.
- **AQA GCSE Physics 8463 §4.5.4** (moments, levers and gears) has abundant free material at the right conceptual level — Cognito, Freesciencelessons, Bitesize — which is **better pitched for a first pass than A level Mechanics**, provided the algebra is then added.
- **Two-support variants** (a plank on two trestles, a beam on two walls, a diving board) are CCEA's staple and are where the algebra lives; A level's ladder and hinge problems are excluded.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets this as a **multi-part question with an escalating ladder** — Q4 in Summer 2019, Q6 in 2022, Q5 in 2023, 2024 and 2025 — where the early parts are accessible and the last part is the paper's discriminator.

1. **"Find the reaction at A" [3].** Take moments about B to eliminate R_A's partner, then solve. Summer 2019 describes the mark split exactly: **one mark for a moments equation with two correct moments, one for equating vertically**.
2. **"Find the reaction at each support" [4].** Both conditions, deliberately.
3. **"The supports are such that one reaction is three times the other. Find them" [4].** Substitute `3R` into both equations.
4. **"The load is moved to … Find the new reaction" [3].** Summer 2022: candidates "failed to recalculate R when the load moved". A twin item, on purpose.
5. **"Find the distance d at which the rod is about to tilt" [4–5].** The discriminator: set the far reaction to zero, write the moments equation in terms of `d`, solve. Summer 2025's part (iii).
6. **"Find the weight of the rod" [3].** Rearranged unknown, same two equations.

**Mark-scheme habit worth copying:** Summer 2024 notes that "most gained a mark for any correctly calculated moment", so a single correct `force × distance` product earns credit even inside a failed equation. Author the scheme to award that independently, and say so in the feedback — it materially changes how she should attempt a part she cannot finish.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Moments used where the vertical equation is needed | Two conditions with a division of labour: moments locate, vertical forces total | CCEA S2022 Q6(iii) |
| The rod's own weight omitted | "Uniform" means the weight acts at the midpoint. Draw it first, before the loads | CCEA S2022 Q6 |
| The pivot chosen at random | Take moments about the support you do not want to find | CCEA S2023 Q5: moments "about A, B, C and the centre all seen" |
| Reactions in a ratio not handled | Substitute `3R` into both equations; it is still one unknown | CCEA S2022 Q6 |
| The reaction not recalculated when the load moves | New position, new distances, new equations | CCEA S2022 Q6(iv) |
| Trial and error instead of algebra | Write the moments equation in terms of `d` and solve it | CCEA S2025 Q5(iii) |
| `g` dropped from some terms only | Decide once: newtons throughout, or `g` cancelled from every term | CCEA S2022 Q6 |
| The distance measured from the wrong point | Draw the bracket from the chosen pivot to each force, on the figure | standard; the distance brackets in the hero figure exist for this |

---

## 7. Photographs, videos and simulations

**Photographs.** Two verified on Commons in this session, and both earn their place:

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Stand-up seesaw playground Achim.jpg` (RogerWiki) | **CC0** | 4000×3000 | The cleanest licence in the set. Prompt: *two people of different weights balance. What does that tell you about their distances from the pivot?* |
| `File:Playground seesaw.jpg` (Killarnee) | CC BY-SA 4.0 | 2592×1936 | Alternative framing if a plain single-pivot rod is wanted |
| `File:Liebherr tower crane at reconstruction of the GES-2 in Moscow.jpg` (Dmitry Ivanov) | CC BY-SA 4.0 | 4123×2923 | The counterweight-and-jib photograph. Prompt: *why is the counterweight so much closer to the tower than the load is?* — a real engineering answer to "why does distance matter as much as force" |

**Videos already held** (`further-maths:moments-uniform-rod`): **P McAleavey `wFDT9OyS_uY`** (CCEA Further Mathematics by name — should lead) and Corbettmaths `5yDLFvr3DZs`.

**Simulation held, and it is the best in FM2:** **PhET *Balancing Act*** — `phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html`. It models exactly this content: a plank on a fulcrum, masses placed at marked distances, with an optional "level" indicator and a *Balance Lab* screen that shows the moments numerically. Two tasks worth authoring: (i) place a known mass and predict where a second, different mass must go before releasing the support; (ii) on the Balance Lab, verify that clockwise and anticlockwise moments are equal, then move one mass and predict the new position. Note that it uses a **single** fulcrum, so it teaches the principle but not the two-support algebra. That caveat is now written into the entry's `task` field in `data/links/media-map.json`, so it reaches the page — `task` is used rather than a new `note` field because `src/lib/content/media.ts` maps sim fields explicitly and would silently drop anything else.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **hinges and ladders** against walls — excluded by CCEA's Teacher Guidance in terms, and the single commonest A level moments context
- **non-uniform rods** (where the weight does not act at the midpoint)
- **non-horizontal rods**, forces at an angle to the rod, and the general perpendicular-distance calculation `Fd sin θ`
- friction at a support; toppling versus sliding
- couples, and moments in two dimensions about an arbitrary point
- centre of mass by calculation (composite bodies)

**CCEA-specific:** the restriction to a **horizontal uniform rod with one or two supports**; the two-support algebra with reactions possibly in a given ratio; and the "about to tilt" condition, which CCEA names in `mustMemorise` and examines.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:moments-uniform-rod` (status `partial`, high confidence)
- DfE GCE AS and A level subject content for mathematics, **section S Moments**
- AQA 8365, OCR 6993, Edexcel 4PM1 specifications — searched; none carries moments
- AQA GCSE Physics 8463 §4.5.4 *Moments, levers and gears (physics only)* — noted as the better-pitched comparison for a first teaching pass, and the link to CCEA Double Award P1 `p1-moments` / Prescribed Practical P3
- Save My Exams and Physics & Maths Tutor A level Mechanics moments notes — for the choose-your-pivot strategy and the two-conditions framing
- `data/spec/further-mathematics.json` → `moments-uniform-rod`: statement FM2-MOM-01, Teacher Guidance, `mustMemorise`, and **five** `examinerEvidence` entries (Summer 2019 Q4, 2022 Q6, 2023 Q5, 2024 Q5, 2025 Q5(iii))
- Wikimedia Commons API for all three photographs above
- `data/links/media-map.json` key `further-maths:moments-uniform-rod`
