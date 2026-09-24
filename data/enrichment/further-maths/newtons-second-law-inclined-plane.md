# Enrichment dossier — newtons-second-law-inclined-plane

**CCEA** GCSE Further Mathematics (2017), **FM2** Unit 2 Mechanics, area Newton's laws of motion · statement **FM2-NEW-01** · difficulty 4 · calculator paper
**CCEA statement:** apply F = ma to a body on an inclined plane. **F = μR will not be tested**; friction is given as a value or a value per unit mass.
**CCEA Teacher Guidance:** straight-line motion only. **Any externally applied forces acting on a body on an inclined plane will act parallel to that plane.**
**Formula sheet (Unit 2):** `F = ma` only. **`R = mg cos α` and the component `mg sin α` are not given.**
**Prerequisites in our taxonomy:** `newtons-second-law-linear`, `resolving-forces`, `equilibrium-of-forces`
**Compiled** 20 September 2026 · 30 minutes
**Headline** Two CCEA restrictions make this markedly easier than the A level version she will find online, and both are worth announcing to her: **applied forces always act parallel to the plane** (so nothing ever has to be resolved except the weight), and **friction is a given number, never μR**. What is left is one skill — resolving the weight into `mg sin α` down the slope and `mg cos α` into it — and CCEA's evidence says that is exactly where the marks go: **sin and cos swapped**, and **g omitted**, in three separate series.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | DfE A level | Confidence | Status |
|---|---|---|---|---|---|---|
| FM2-NEW-01 (inclined-plane part) | **unmatched** — no mechanics | **unmatched** — kinematics only, no dynamics | **unmatched** | **Section R, Forces and Newton's laws** | high | **partial** |

(DfE mechanics sections: **P** quantities and units, **Q** kinematics, **R** forces and Newton's laws, **S** moments.)

**Scope deltas, and they run mostly in our favour.** A level inclined-plane work (i) always includes **μR**, (ii) routinely has the applied force at an **angle to the plane**, so two things need resolving, and (iii) includes **limiting equilibrium** and "on the point of moving". CCEA has none of these. A borrowed worked example will almost certainly be harder than anything she will sit, which is demoralising rather than useful — so the dossier's practical advice is to take A level's *method* and rewrite its *numbers and set-up*.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Rotate the axes onto the slope. Everything follows from that one decision.** *The universal A level opening (Save My Exams' OCR and CIE notes on inclined planes; PMT's M1 Dynamics sheets).* Instead of horizontal and vertical, use **along the plane** and **perpendicular to the plane**. Then the normal reaction and the motion each lie along one axis, and **only the weight is awkward** — it is the single force that has to be broken into components. Saying that out loud reframes the topic from "a hard new situation" to "one vector to resolve".

2. **Which is sin and which is cos: settle it with the extreme case, not a mnemonic.** *A standard physics-teaching device (IOP's forces material uses the same "check the limiting case" move).* Ask what happens when the slope is nearly flat, α → 0: the body barely slides, so the component **down the slope** must be nearly zero — and `sin 0 = 0`, so that component is `mg sin α`. Meanwhile the surface is taking nearly all the weight, so the perpendicular component is nearly `mg` — and `cos 0 = 1`, so it is `mg cos α`. Ten seconds, reconstructible under pressure, and aimed squarely at CCEA's most-repeated finding.

3. **Draw the component triangle on the diagram, not beside it.** *Standard practice in every good mechanics text.* Sketch the weight arrow straight down from the body, then complete the right-angled triangle with dashed lines along and perpendicular to the plane, and mark the angle α **at the correct vertex**. The commonest structural error is putting α between the weight and the plane rather than between the weight and the perpendicular; drawing the triangle in place makes it self-checking.

4. **Two directions of travel, two equations — take the resultant in the direction of travel each time.** *CCEA Summer 2019 Q6 is precisely this: compare the accelerations up and down a slope.* Going up, gravity and friction both oppose; coming down, gravity drives and only friction opposes. CCEA's `mustMemorise` puts it well: **two positive accelerations**, each taken in its own direction of travel. Set the two equations side by side in one figure so the sign pattern is visible rather than derived twice.

5. **Friction opposes the motion, so it flips when the motion flips.** *Directly from the same finding, and from Summer 2025: "friction direction wrong".* The friction arrow is the only one on the diagram that changes direction between the two cases. Make that the gated question.

6. **`R` is needed even when it does nothing.** *CCEA Summer 2025: "R omitted".* On a CCEA question the normal reaction rarely enters the calculation, because friction is given rather than computed from μR — but it must still appear on the diagram, and perpendicular equilibrium (`R = mg cos α`) is a marked statement. Explain why it is there: the body does not accelerate into the slope.

7. **Not in equilibrium unless the question says so.** *CCEA Summer 2022: "some wrongly took the system to be in equilibrium".* If the body is accelerating, the along-slope forces do **not** balance. Perpendicular to the slope they always do. Splitting the two axes explicitly — one balances, one does not — heads this off.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the rotated-axes slope.** `viewBox` about `0 0 940 480`.

- A right-angled triangle for the plane, the angle **α** marked at the base with an arc and a value.
- A rectangle for the body partway up the slope.
- **Four forces**: `R` perpendicular to the slope (outwards), weight `mg` **straight down**, friction along the slope, and any applied force **parallel to the slope** (which is CCEA's restriction, so it is drawn parallel and labelled as such).
- **The component triangle drawn on the weight arrow**: dashed lines completing a right angle, with `mg sin α` marked along the slope and `mg cos α` marked perpendicular, and the angle α marked **between the weight and the perpendicular**, with a small right-angle box so the geometry is unambiguous.
- **A rotated pair of axes** drawn faintly at the body, one along the slope and one perpendicular, labelled — this is the figure's actual teaching point.
- An open-headed acceleration arrow along the slope, outside the force set.
- **Generator parameters:** `angleDeg`, `mass`, `applied`, `friction`, `direction: "up" | "down"` (which flips the friction arrow and recomputes), `showComponentTriangle: boolean`, `showAxes: boolean`, `labels: "full" | "symbols" | "blank"`. All components computed from `angleDeg` and `mass`; assert the drawn arrow lengths are proportional to the computed magnitudes.

**Second figure: up against down.** Two copies of the hero figure side by side at the same angle with the same numbers, headed **moving up the slope** and **moving down the slope**, with the friction arrow reversed between them and the two equations printed underneath:
`applied − mg sin α − F = ma` and `mg sin α − F = ma`.
The only difference between the panels is two arrowheads and two signs, and seeing that is the lesson.

**Third, small: the extreme-case card.** Three miniature slopes at α = 5°, 45° and 85°, each with `mg sin α` and `mg cos α` drawn to scale as bars. At 5° the along-slope bar is tiny; at 85° it is nearly the whole weight. This is angle 2 made visual, and it is the thing she can reconstruct in the exam.

---

## 4. Practical variants CCEA also examines

No prescribed practical. The contexts CCEA sets, and where to read more:

- **A box or particle on a ramp, pushed or pulled parallel to the slope** — the CCEA default, because of the parallel-force restriction.
- **A vehicle on a hill**, with a driving force and a stated resistance. A level sets this constantly; rewrite with a numeric resistance.
- **A body projected up a slope and decelerating**, which pairs with the constant-acceleration formulae for a two-part question.
- The A level staples to **avoid**: anything with μ, anything with a force at an angle to the plane, and anything asking whether the body remains at rest (limiting equilibrium).

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets this as a substantial mid-paper question (Q6 in Summer 2019 and 2025, Q4 in Summer 2024, Q3(b)(ii) in Summer 2022).

1. **"Show that the acceleration is … " [3].** Form the along-slope equation from the diagram. Summer 2019 identifies the two key lines exactly — `70 sin 27° = 7a` for the driving case and `64.4 − 18.7 = 7a` for the resisted one. Forward route only.
2. **"Find the acceleration as the body moves up the slope, and again as it moves down" [5].** The comparison item. Marks for each equation and each answer, and the discriminator is the friction reversal.
3. **"Find the normal reaction" [2].** Perpendicular equilibrium: `R = mg cos α`. Low tariff, frequently dropped because R is omitted from the diagram.
4. **"All three forces are needed" items [3].** Summer 2024 part (iii) is explicit that the answer needs all three forces with the **weight vertical** — a diagram-completeness mark.
5. **Combine with kinematics [5–6].** Find `a`, then use `v² = u² + 2as` to find how far up the slope the body travels. This is CCEA's standard synoptic pairing.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| sin and cos swapped | The extreme-case check: at a nearly flat slope the along-slope pull is nearly zero, and `sin 0 = 0` | CCEA S2019 Q6, S2025 Q6 — **two series** |
| `g` omitted from the weight | The weight on the diagram is `mg`, with the multiplication written out | CCEA S2019 Q6, S2022 Q6 |
| Friction drawn the same way in both cases | Friction opposes **motion**, so it reverses when the motion does. The two-panel figure shows it | CCEA S2019 Q6, S2025 Q6 |
| `R` left off the diagram | The body does not accelerate into the slope, so `R = mg cos α`. Draw it even when it is not used | CCEA S2025 Q6 |
| The system assumed to be in equilibrium | Perpendicular to the slope, yes. Along the slope, only if `a = 0` | CCEA S2022 Q3(b)(ii) |
| The angle marked in the wrong place | Draw the component triangle **on** the weight arrow with the right-angle box | standard; prevents the sin/cos swap at source |
| The applied force resolved unnecessarily | CCEA guarantees applied forces are **parallel to the plane**. Only the weight is resolved | CCEA Teacher Guidance |

---

## 7. Photographs, videos and simulations

**Photographs: none strictly needed.** A ramp or a hill photograph adds little that the figure does not; the geometry is the content. If one is used, give it a prompt about where the angle is and which way friction acts.

**Videos already held** (`further-maths:newtons-second-law-inclined-plane`): **P McAleavey `tp_Lou1lwVg` and `qzzxtZQxYOw`** — both teach the CCEA Further Mathematics specification by name. For an FM2 topic with no Level 2 comparison anywhere, two CCEA-specific videos is the best media position in the whole unit; they should lead, and the `why` line should say why that matters.

**Simulations: none, and that is now recorded.** PhET *Friction* had been mapped to this slug; it models **molecular friction and surface heating**, not an inclined plane, and cannot say anything about `mg sin α`. It was removed from `data/links/media-map.json` on 20 September 2026 and the slug's `sims` array is deliberately empty. If an interactive is wanted for the resultant idea, **PhET *Forces and Motion: Basics*** (mapped to `newtons-second-law-linear`) can be borrowed on its *Acceleration* screen, with an honest note that it is horizontal only. There is no faithful free inclined-plane sim in our verified set.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **F = μR, the coefficient of friction, limiting equilibrium** and "on the point of slipping" — all excluded in terms, and all present in essentially every A level inclined-plane example
- **applied forces at an angle to the plane** (excluded by CCEA's Teacher Guidance)
- smooth-plane problems solved with energy methods; work done against friction
- motion in two dimensions on the plane; banked tracks
- proving the component formulae from first principles

**CCEA-specific:** the parallel-force restriction; friction as a given value or per unit mass; and the requirement to handle **both** directions of travel with the resultant taken in the direction of travel each time.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:newtons-second-law-inclined-plane` (status `partial`, high confidence)
- DfE GCE AS and A level subject content for mathematics, **section R Forces and Newton's laws**
- AQA 8365, OCR 6993, Edexcel 4PM1 specifications — searched for inclined-plane and friction content; none carries it
- Save My Exams (OCR A Level Maths, CIE A Level Mechanics) inclined-plane notes and Physics & Maths Tutor *M1 Dynamics* topic sheets — the rotated-axes framing and the component triangle
- Institute of Physics teaching material on forces — for the extreme-case check as a way of fixing sin against cos
- `data/spec/further-mathematics.json` → `newtons-second-law-inclined-plane`: statement FM2-NEW-01, Teacher Guidance, `onFormulaSheet`, `mustMemorise`, and four `examinerEvidence` entries (Summer 2019 Q6, 2022 Q3(b)(ii), 2024 Q4, 2025 Q6)
- `data/links/media-map.json` key `further-maths:newtons-second-law-inclined-plane`
