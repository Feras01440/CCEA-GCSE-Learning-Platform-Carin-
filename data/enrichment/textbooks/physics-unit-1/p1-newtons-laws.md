# p1-newtons-laws: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy and the P1 deck (`data/decks/science/P1.json`) has 8 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.2.4, 1.2.5, 1.2.6, 1.2.7 (all Foundation).
**Verdict.** **Thinner** (nothing authored). The book's worked examples are well chosen: four F = ma problems where the resultant must first be built from two forces, which is exactly what CCEA's reports say candidates cannot do. It does not teach the 1.2.5 investigation (air track, data logger, modelling), which Unit 7 has examined twice, and one of its two falling-object diagrams says "constant acceleration" where it means constant velocity.

---

## 1. Book chapter and pages

Section 1.2: learning outcomes p. 14; "Newton's Laws" pp. 16–18 (first law, an object resting on a table, a heavy object falling from an aircraft, its speed–time curve); the crate example and the "FSCU" exam tip p. 18; unbalanced forces, the car, F = ma, the newton defined p. 19; four worked examples and Test Yourself 1.2.1 pp. 19–20. Answers p. 70.

## 2. The book's teaching sequence

1. First law: with no resultant force an object stays at rest or keeps a steady speed in a straight line (p. 16).
2. At rest on a table: the weight down is matched by the table's push up, so the resultant is zero (p. 16; the paragraph is printed twice).
3. A heavy object falling from an aircraft: weight constant, air friction growing with speed, the resultant and the acceleration shrinking, until the two forces match and the object falls at a steady speed; then its speed–time curve, rising steeply and levelling off (pp. 16–18).
4. Unbalanced forces make an object accelerate in the direction of the resultant: a car speeding up (driving force larger than drag) and slowing (braking force larger) (p. 19).
5. Second law through a picture of more people pushing a stalled car: more force, more acceleration; F = ma with units; acceleration grows with force and falls with mass; the newton as the force that accelerates a 1 kg mass at 1 m/s² (p. 19).
6. Worked examples of rising difficulty, then self-test (pp. 19–20).

## 3. Explanations and devices worth recreating (our own words)

- **Build the resultant first, then F = ma** (pp. 19–20). Three of the four worked examples need it: a boat moving steadily tells you the drag (equal to the steady thrust), so the thrust for a given acceleration is ma plus that drag; a cyclist at steady speed tells you the friction, so a larger push gives a known resultant; a car's friction is the engine force minus ma. The Summer 2025 report (Higher Q9) says few candidates saw that the weight must be found and combined with ma before an upward force can be found; the 2024 November paper (Higher Q3) and 2020 November paper (Higher Q9) set the same move vertically.
- **Steady motion reveals the opposing force** (p. 20). "Constant velocity, so the forward and backward forces are equal" turns an unknown friction into a known one. Worth its own explain step.
- **The falling object as a story of a changing resultant** (pp. 16–18). Three snapshots: just released (no air friction, largest resultant), falling faster (friction growing, smaller resultant), steady (forces equal, zero resultant, constant velocity), then the speed–time curve that matches. This links the first law, the second law and motion graphs in one picture.
- **Why the paper falls slower than the coin** (p. 22, in Mass and weight): the same friction is a bigger fraction of a small weight. Pairs naturally with the falling-object story.

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Recreation note for our first figures |
|---|---|---|---|
| Apple on a table (p. 17) | An apple, an up arrow from the table and a down arrow for its weight, both 1 N. | Balanced forces at rest. | Our own object at rest with two equal arrows. |
| Falling object, two snapshots (p. 17) | A circle with a growing up arrow (friction) and a constant down arrow (weight); captions on the resultant. | The approach to steady speed. | Recreate as three snapshots with arrow lengths to scale. **Do not copy the second caption**, which says the object falls with constant acceleration once the resultant is zero; it should say constant velocity (section 7). |
| Speed–time curve for the fall (p. 18) | Speed rising steeply from zero and levelling at about 50 m/s by 15 s, labelled "constant speed". | The motion matching the forces. | Recreate with our numbers; mark the slope at the start (10 m/s², link to free fall). |
| Crate with friction (p. 18); car with drag, car with braking (p. 19) | Blocks and cars with labelled arrows. | Unbalanced forces and the change in motion. | Recreate; label each with its resultant. |
| Isaac Newton (p. 16) | A short biography box. | Context only. | Leave out (not examined; the birth year printed is wrong, section 7). |

## 5. Worked examples, calculations and data tasks

- **Force for a train's acceleration** (p. 19): a direct F = ma with a large mass.
- **Speedboat** (p. 20): a steady-velocity thrust gives the drag; thrust for a stated acceleration = ma + drag.
- **Cyclist** (p. 20): explain zero acceleration (forces balanced), then an increased push minus the same friction gives a resultant and an acceleration.
- **Car friction** (p. 20): friction = engine force − ma.
- **Test Yourself 1.2.1** (p. 20): a helicopter lifting off (weight first, then the resultant, then the acceleration), a vehicle braking to rest (deceleration, then the mass from a given force), a car stopped by a wall in a tenth of a second (deceleration, then the force). The helicopter item has exactly the numbers of CCEA's 2020 November Higher Q9 (`docs/sources/papers/science/2020-November/P1-H-Physics-Paper-17389.txt`); our items must not reuse them.

## 6. Practice question types, with CCEA evidence

- **State** Newton's first law (2; March 2026 Higher Q9(a): a first mark, which gates the second, for no resultant force acting, then one for steady speed or velocity along a straight line; the report says many omitted one or both).
- **State** what a resultant force always causes (1; 2019 March and 2022 March Higher).
- **State** Newton's second law as an equation (1; 2021 Summer Higher Q6(a)).
- **Calculate** an acceleration from two forces and a mass, or a force from a mass and an acceleration (3–5; most series). With a weight in it: 2020 November Higher Q9, 2024 November Higher Q3, 2025 Summer Higher Q9.
- **Then** a final velocity from that acceleration (March 2026 Higher Q9(b)(i); see `p1-vectors-velocity-acceleration`).
- **Acceleration when forces are balanced** (1; 2024 Summer Higher Q1(a)(ii), March 2026 Higher Q9(b)(ii): zero).
- **Unit 7, the air-track investigation** (2022 Summer Higher Booklet B Q3: with friction removed, a pushed object keeps the same speed, which law is shown, then a hanging 800 g mass's weight and a trolley's acceleration with friction; 2026 Summer Higher Booklet B Q4: investigating the second law with apparatus).

## 7. Definitions and wording, and book errors

- **First law** (p. 16): the book's form (zero resultant: at rest, or steady speed in a straight line) matches the specification's 1.2.4 and the March 2026 scheme.
- **Second law** (p. 19): the book adds that acceleration is inversely proportional to mass; the specification's 1.2.6 wording mentions only proportionality to the resultant force. Both are true; teach the specification's sentence as the answer to "state", and the mass effect as understanding.
- **Book error: the falling-object caption** (p. 17). The second snapshot says that once the resultant is zero the object moves down with constant acceleration. It should say constant velocity (the book's own paragraph above it says so). This is the exact confusion the first law exists to remove; do not copy it.
- **Book error, minor: Newton's dates** (p. 16) begin at 1645; Newton was born in 1642 (Old Style). Not examined.
- **The investigation** (1.2.5) appears only in the learning-outcome list (p. 14). The body never describes an air track, light gates, a data logger or how F = ma is found from results.
- **"FSCU"** (p. 18): formula, substitution, calculation, unit; marks are given in that order up to the first error. This matches CCEA's general marking principles (an incorrect physics equation scores 0 overall; partial credit from the first line up to the error).

## 8. Higher-tier-only content in the book

None (1.2.4–1.2.7 are Foundation). Problems that need the weight before an upward force have so far appeared on the Higher paper.

## 9. Pitfalls and "remember" notes in the book

- Steady speed means balanced forces, so the opposing force equals the driving force (p. 20).
- Use the resultant force in F = ma, never one force on its own (pp. 19–20).
- Write the formula, substitute, calculate, give the unit (p. 18).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **F = ma with a resultant built from two forces**, horizontal then vertical. Explain; See it on our own speedboat-like case; Your turn on a lift or a crane (weight first, then ma, then the upward force), citing the 2025 report.
2. **The first law stated in two parts** (no resultant force; constant velocity in a straight line, or at rest), with a See it on a puck sliding on ice and a Your turn that asks for both parts.
3. **The falling object**: three force snapshots matched to a speed–time curve; the word for the final state is constant (terminal) velocity, not constant acceleration.
4. **The 1.2.5 investigation**: what an air track removes (friction), what the light gates or data logger measure, the straight line through the origin for acceleration against force at fixed mass, and how the mass is changed; one Unit 7-style Your turn.
5. **Acceleration with forces balanced** (zero) and **steady motion gives the opposing force**, as short gates.

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. The 8 deck cards agree with the book and the specification; the deck's air-track method card is the only place the 1.2.5 investigation appears in our material, and it should become a full section of the note.
