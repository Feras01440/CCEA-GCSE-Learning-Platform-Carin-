# Enrichment dossier — newtons-second-law-linear

**CCEA** GCSE Further Mathematics (2017), **FM2** Unit 2 Mechanics, area Newton's laws of motion · statement **FM2-NEW-01** · difficulty 3 · calculator paper
**CCEA statement:** apply F = ma to a body in horizontal or vertical motion (also inclined plane and connected bodies — separate topics). **F = μR will not be tested; if friction is included it is given as a value, or as a value per unit mass.**
**CCEA Teacher Guidance:** straight-line motion only.
**Formula sheet (Unit 2):** `F = ma`, and the four constant-acceleration formulae.
**Prerequisites in our taxonomy:** `force-diagrams`, `constant-acceleration-formulae`
**Compiled** 20 September 2026 · 30 minutes
**Headline** CCEA FM2 is mechanics, and **no Level 2 qualification carries mechanics at all** — the comparison is the DfE A level mathematics content, sections **R** (forces and Newton's laws) and **Q** (kinematics). That material is pitched a year above her and, crucially, **assumes friction is μR**, which CCEA excludes in terms. So every borrowed worked example will contain a coefficient of friction she has never met. The good news is that CCEA's own evidence is precise about where the marks go, and three of the four findings are the same error in different clothes: **mass and weight confused** — multiplying a by the weight (S2019), not changing the mass when the load changes (S2022), and confusing mass with force (S2025).

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | DfE A level | Confidence | Status |
|---|---|---|---|---|---|---|
| FM2-NEW-01 (linear part) | **unmatched** — no mechanics | *Calculus (Application)* reaches kinematics at Level 3, but not Newton's laws | **unmatched** — §9C is "applications to simple linear kinematics" via calculus, not dynamics | **Section R, Forces and Newton's laws** | high | **partial** |

Note the reference: in the DfE A level mathematics subject content the mechanics sections are **P** quantities and units, **Q** kinematics, **R** forces and Newton's laws, **S** moments. (Section H is Integration — a common misquotation.)

**The three scope deltas that will bite.** A level (i) uses **F = μR** throughout, which CCEA excludes; (ii) works in **two dimensions with vectors**, where CCEA is straight-line only; (iii) reaches **variable acceleration by calculus**, where CCEA uses the constant-acceleration formulae. A borrowed question is very likely to fail on all three at once.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Mass in the equation, weight on the diagram.** *CCEA's own `mustMemorise` names this, and it is the through-line of three of the four examiner findings.* `F = ma` takes the **mass** in kilograms; the arrow pointing down on the force diagram is the **weight**, `mg` newtons. Summer 2019 records candidates who "multiplied a by the weight instead of the mass". Make it a labelled habit: the diagram is in newtons, the equation's `m` is in kilograms, and the only place the two meet is `W = mg`.

2. **One body, one diagram, one equation — and say which body.** *The standard A level discipline (Save My Exams' OCR and CIE notes on Newton's second law, and PMT's M1 Dynamics sheets all open with it).* Summer 2019 records that "forces on the car alone vs the whole system" were confused, and Summer 2024 that "some used the motion of the car for the trailer". Every worked example should begin by writing, in words, *for the [named body]:* before the equation. That one line is the difference between a method mark and nothing.

3. **Friction is a given number here, not μR.** *CCEA-specific, and a genuine simplification worth announcing.* Sometimes it arrives as a value ("a resistance of 30 N") and sometimes **per unit mass** ("4 N per kg"), which Summer 2022 records weaker candidates could not handle. The per-kg form is a one-step conversion — multiply by the mass — and it deserves its own worked line and its own gate, because it looks like μ and is not.

4. **Resultant first, then F = ma.** *The standard framing in every A level treatment.* `F` is not "a force"; it is the **resultant** in the direction of motion. Build the habit of writing `driving force − resistance = ma` as a single line with the subtraction visible, rather than substituting into `F = ma` and hoping. Summer 2025 shows this working: "most identified friction as 33.6 N and equated to 7a."

5. **Vertical motion is the same equation with `mg` in it.** *A level teaches lifts and lift-cables as the canonical vertical context.* For a body moving vertically, the resultant is `T − mg` (up positive) or `mg − T`, and `a` is positive in the direction you chose. Choosing and **stating** a positive direction before writing the equation removes almost all sign errors, and it is free.

6. **"Show that" means form the equation, not verify the answer.** *CCEA Summer 2024 is explicit and unusual: "substituting the later value of M gained zero; verifying M by substitution capped at two marks."* Substituting the given answer back in is not a proof and is capped. Teach the forward route — build the equation from the diagram and solve — and say plainly what verification costs.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two-lane diagram.** `viewBox` about `0 0 900 420`, and the point of it is that the diagram and the equation sit in two lanes that are explicitly connected.

- **Upper lane — the body and its forces.** A rectangle for the body on a horizontal line, with four labelled arrows: driving force to the right, resistance to the left, weight `mg` straight down, normal reaction `R` straight up. Every arrow labelled with **a value and a unit**, and the weight labelled `mg = … N` with the multiplication shown.
- **A small acceleration arrow** above the body, outside the force set, labelled `a` and drawn in a different style (open arrowhead) so it cannot be mistaken for a force. *Confusing the acceleration arrow with a force is the most common structural error in mechanics diagrams.*
- **Lower lane — the equation**, aligned under the body: `for the [body]:  driving − resistance = m a`, with leader lines running from each arrow in the upper lane to its term in the lower lane, and a box around the `m` labelled **mass in kg, not the weight**.
- **Generator parameters:** `mass`, `forces: {name, magnitude, direction}[]`, `orientation: "horizontal" | "vertical"`, `showLeaders: boolean`, `frictionForm: "value" | "per-kg"` (the per-kg version prints the conversion line), `blankTerms: string[]` for gated versions. Every number computed from the inputs; assert the resultant and `ma` agree.
- Arrow styles, not colour, distinguish force from acceleration; `<title>` names the body, the forces and the direction taken as positive.

**Second figure: the positive-direction card.** A small strip showing the body, a bold arrow labelled **"take this way as positive"**, and the same equation written twice — once with that choice and once with the opposite — reaching the same physical answer with opposite signs. It settles sign anxiety in one look.

**Third, small: mass against weight.** Two boxes side by side: `mass = 7 kg` and `weight = 7 × 9.8 = 68.6 N`, with a note that only one of them goes into `F = ma`. Ten lines of SVG against three examiner findings.

---

## 4. Practical variants CCEA also examines

There is no prescribed practical in Further Mathematics, but FM2 is the mechanics of real objects and CCEA sets its contexts from them. Worth knowing:

- **A level's standard contexts** — a car towing a trailer, a lift accelerating, a particle pulled along a table — are all legitimate CCEA contexts, **provided the friction is given as a number**. Read the A level question banks (PMT's *M1 Dynamics* topic sheets) for the range of contexts, then rewrite with a stated resistance.
- **The lift context is the cleanest vertical example** and it makes "the reading on the scales" a natural extra part.
- **Any apparent-weight or accelerometer demonstration** is beyond the spec but makes a good one-line hook.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets this inside a **multi-part mechanics question**, usually Q3 or Q6, where part (i) is a force diagram or a resultant, part (ii) or (iii) applies `F = ma`, and a later part changes something and asks again.

1. **"Find the acceleration" [3].** Resultant in the direction of motion, then `= ma`. Marks: the resultant, the equation, the answer with units.
2. **"Show that the mass is M" [3].** The forward route only; verification is capped. Author the scheme to reflect CCEA's own cap and explain it in the feedback.
3. **"The load is increased to 8 kg. Find the new acceleration" [2].** Summer 2022's trap: the mass in the equation must change too. A twin item, deliberately.
4. **Friction given per unit mass [1–2 extra].** "A resistance of 4 N per kg acts." One mark for the conversion.
5. **Combine with a constant-acceleration formula [4–5].** Find `a` from `F = ma`, then use `v = u + at` or `v² = u² + 2as`. This is how CCEA makes the topic synoptic, and it is worth an item that spans both.

**Mark-scheme habit:** the equation of motion is a method mark that survives an arithmetic slip, and the units mark is separate. Author both independently.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| `a` multiplied by the weight | Mass in the equation, weight on the diagram | CCEA S2019 Q3(iii) |
| The mass is not updated when the load changes | Re-read the question at every new part; the diagram changes, so the equation changes | CCEA S2022 Q3(b)(ii) |
| Mass and force treated as interchangeable | Units: kg against N. Write the unit on every quantity | CCEA S2025 Q6(iii) |
| Friction given "per kg" not converted | Multiply by the mass, on its own line | CCEA S2022 Q3(b)(i) |
| Forces on one body confused with the system | Write *for the [body]:* before every equation | CCEA S2019 Q5(i), S2024 Q6(iii)(a) |
| Verifying instead of proving | "Show that" means build the equation forwards | CCEA S2024 Q6(i) — explicitly capped at two marks |
| The acceleration arrow drawn as a force | Different arrow style, drawn outside the force set | standard mechanics-diagram pedagogy |

---

## 7. Photographs, videos and simulations

**Photographs: none strictly needed**, and Commons is thin on clean dynamics photographs. If one is wanted, a towing context (car and trailer, or a locomotive and wagons) makes the two-body distinction concrete; check the licence with `pipeline/enrichment/check-commons-licence.mjs` before recommending one, and give it a prompt about which body the forces act on.

**Videos already held** (`further-maths:newtons-second-law-linear`): ExamSolutions `NQFAjBSKdH4` and `D4VCy9H7duM`. Both are A level mechanics and both will use μR at some point; the `why` line must say where to stop.

**Simulation already held and genuinely good:** **PhET *Forces and Motion: Basics*** — `phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html`. Its *Acceleration* screen shows applied force, friction and the resultant as a live arrow with the acceleration read off. Task worth authoring: set friction to zero, apply a known force to a known mass, predict `a` from `F = ma` before releasing, then turn friction on and predict again. That is the resultant-first habit, made physical.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **F = μR and the coefficient of friction** — excluded by the CCEA statement in terms, and present in essentially every A level resource
- forces and motion **in two dimensions**, vectors in mechanics, components of a resultant acceleration
- **variable acceleration and calculus kinematics** (4PM1 §9C, DfE section Q)
- momentum, impulse, collisions; Newton's third law as a named law with action–reaction pairs
- air resistance modelled as a function of speed; terminal velocity
- modelling assumptions as an assessed discussion (A level marks "state one assumption"; CCEA does not)

**CCEA-specific:** friction supplied as a **value or per unit mass**; straight-line motion only; and the capped credit for verifying a "show that" by substitution.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:newtons-second-law-linear` (status `partial`, high confidence)
- DfE GCE AS and A level subject content for mathematics, **section R Forces and Newton's laws** (and section Q for the kinematics link)
- AQA 8365, OCR 6993, Edexcel 4PM1 specifications — searched for mechanics content; only OCR's *Calculus (Application)* reaches kinematics, at Level 3
- Save My Exams, OCR A Level Maths and CIE A Level Mechanics revision notes on Newton's second law; Physics & Maths Tutor *M1 Dynamics* topic-question compilations — for the one-body-one-equation discipline and the range of contexts
- `data/spec/further-mathematics.json` → `newtons-second-law-linear`: statement FM2-NEW-01, Teacher Guidance, `onFormulaSheet`, `mustMemorise`, and four `examinerEvidence` entries (Summer 2019 Q3(iii)/Q5(i), 2022 Q3(b), 2024 Q6, 2025 Q6(iii))
- `data/links/media-map.json` key `further-maths:newtons-second-law-linear`
