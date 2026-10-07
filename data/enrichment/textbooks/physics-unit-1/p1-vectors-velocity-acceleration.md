# p1-vectors-velocity-acceleration: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** `packs/science/content/p1/p1-vectors-velocity-acceleration/note.blocks.json` (v1, 22 Sep 2026) and `bundle.json` (2 worked examples, 10 questions, 1 find-the-mistake, 7 prompts), read in full on 7 Oct 2026.
**Spec.** P1 1.1.2, 1.1.3, 1.1.4 (all Higher).
**Verdict.** Our note is **richer**: it teaches a sign convention, rearranges for the final velocity with examiner evidence, and its numbers are right. The book adds the best single argument for why direction matters (adding masses against adding forces), the rule that distance and displacement agree only for one-way straight motion, and a curved-path displacement. Two of the book's own answers in this section are wrong (section 7).

---

## 1. Book chapter and pages

Section 1.1: learning outcomes p. 1; distance against displacement and speed against velocity with a walked example p. 2; acceleration, its symbols, positive and negative acceleration, retardation, and vectors and scalars p. 3; exam tip on u and v and Test Yourself 1.1.1 Q2 p. 5; Practice Question 1(a) (half a circular track) p. 8; the golf-ball note on distance and displacement p. 9. Answers p. 68.

## 2. The book's teaching sequence

1. Distance is separation only; displacement is separation with a direction (p. 2).
2. Speed is the rate distance changes; velocity is the rate displacement changes; average velocity is total displacement over total time (p. 2).
3. A walk round three sides of a square pitch: the distance is three sides, the displacement one side; a closed loop gives zero displacement and zero average velocity (p. 2).
4. Acceleration as the rate of change of velocity, a = (v − u)/t, with each symbol named and v = u + at shown as the same equation (p. 3).
5. Positive acceleration means the velocity grows, negative that it falls; two short tables of velocity against time make constant acceleration visible as equal steps (p. 3).
6. Negative acceleration is also called deceleration or retardation (p. 3).
7. Scalar and vector defined, with lists of each, and the habit of learning every quantity's unit and type together (p. 3).

## 3. Explanations the book uses that our note lacks

- **Masses add like numbers; forces do not** (Test Yourself 1.1.1 Q2(ii), p. 5, answer p. 68). Two masses always make one total, but two forces can make anything from their difference to their sum, depending on direction. This is the clearest reason a student can give for why vectors are a separate kind of quantity. Our note defines the two kinds and pairs them but never shows what goes wrong if direction is ignored.
- **Distance equals displacement only for straight, one-way motion** (p. 9, the bracketed note after the golf ball). If the direction never changes, the two are numerically the same, and so are average speed and average velocity. Our note shows two examples where they differ but never states when they agree. CCEA asked for exactly this comparison on a curved slide: 2019 Summer Higher Q7(c) (tick that distance exceeds displacement).
- **Displacement on a curved route** (Practice Question 1(a), p. 8). Half-way round a circular track the displacement is the diameter, in a compass direction. Our note restricts itself to straight lines and says a question will give any angled displacement; a semicircle needs only the diameter, so it is fair game.
- **Velocity as the rate of change of displacement** (p. 2). The book defines velocity in rate language that mirrors speed's. Our note gives only the equation.

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Our equivalent | Recreation note |
|---|---|---|---|---|
| Square pitch walk (p. 2) | A square with three sides arrowed (up, across, down), start and finish at the two bottom corners, each side 100 m. | Distance three sides, displacement one side. | Our straight-line out-and-back walk. | Keep ours, and add a two-dimensional twin of our own (three sides of a rectangle, different lengths). Do not reuse the book's numbers or its answer (section 7). |
| Velocity tables (p. 3) | Two rows of five velocities at one-second steps, one rising by a fixed amount each second, one falling. | Constant acceleration as equal steps; the sign of a. | Our train arrows and rising bars. | Equivalent; a table version would suit a Your turn ("what is the acceleration?"). |
| Semicircular track (p. 8) | Half a ring-shaped track from A to B with the radius marked and a compass rose. | Displacement on a curve, with direction. | None. | Draw our own: a different radius and a quarter or half circuit; ask for distance, displacement and its direction. |

## 5. Worked examples, calculations and data tasks

- **Three sides of a square** (p. 2): distance, displacement, average speed and average velocity. The average-velocity line divides by the wrong time (section 7), so this example must not be copied even in shape-for-shape form without our own check.
- **Half a circular track** (p. 8): displacement as the diameter "to the west", then average velocity with its direction.
- **Golf ball slowing to rest** (p. 9): the deceleration from a falling velocity line, then the average speed and the distance, with the note that distance and displacement coincide here.
- **Which are vectors?** (Test Yourself 1.1.1 Q2(i), p. 5): a list of six quantities, all of them scalars; the trap is that none is a vector.

## 6. Practice question types

- **State** what a vector has that a scalar lacks (1; 2019 November Higher Q8(a)(i); 2025 November Higher Q6(b)(i), whose scheme credits saying either that a vector has direction or that a scalar lacks it).
- **Tick** scalar or vector in a table (3–4; 2019 Summer, 2020 March, 2022 Summer, 2023 March Higher).
- **Name** the scalar partner of acceleration, or the vector partner of distance (1 each; 2025 November Higher Q6(b)(ii)).
- **Compare** distance and displacement for a given route (1; 2019 Summer Higher Q7(c)).
- **Calculate** an acceleration where the object slows, keeping the sign (3–4; the minus sign is its own mark in 2018 Summer Higher Q5(b)(i) and 2019 November Higher Q5(c)(i)); then **name** a negative acceleration (1; the 2019 November scheme accepts retardation or deceleration).
- **Calculate** a starting or final velocity from the average velocity (3; 2018 March Higher Q9, 2018 Summer Higher Q5(a)).

## 7. Definitions and wording, and book errors

- **Scalar / vector** (p. 3): size only; size and direction. Matches CCEA's glossary and our note.
- **Retardation** (p. 3): a negative acceleration, also called deceleration. Matches the specification (1.1.4) and our note.
- **Book error: the walked example's average velocity** (p. 2). The walk takes 160 s, but the average velocity divides the displacement by 100 s and gives 1.0 m/s; with the stated time it is 100 m ÷ 160 s ≈ 0.63 m/s to the right. The average speed line beside it uses 160 s correctly. Authors must not copy this example.
- **Book error: the braking answer** (answer to Test Yourself 1.1.1 Q1, p. 68). The first line drops the minus sign and prints the unit as cm/s², then the next line calls the retardation −4 m/s². Correctly: the acceleration is −4 m/s², which is a retardation of 4 m/s². Our note states it this way ("a = −1.5 m/s² … a retardation of 1.5 m/s²"), which is the form CCEA's schemes reward (a mark for the sign on the acceleration).
- **Equations beyond the specification** (p. 1): the learning-outcome list adds v = u + at and d = ½(u + v)t from the single-award specification. v = u + at is only the spec's acceleration equation rearranged, and our note teaches it as such, which is right.

## 8. Higher-tier-only content in the book

All of 1.1.2–1.1.4 is Higher in the specification. The book does not mark it as Higher (bold here is emphasis only), so a Foundation reader of the book would not know to skip it.

## 9. Pitfalls and "remember" notes in the book

- u is the starting velocity and v the final; u comes first in the alphabet as it comes first in time (p. 5).
- Learn each quantity's unit and its type (scalar or vector) together, as one fact (p. 3).
- A round trip gives zero displacement and zero average velocity (p. 2).

## 10. GAPS in our note, ranked

1. **Why direction matters.** Add an explain-and-show pair before the first gate: two masses of 12 kg and 8 kg always total 20 kg (scalar), but forces of 12 N and 8 N total 20 N only when they point the same way and 4 N when opposed (vector). Use different numbers from the book's in the published item.
2. **When distance and displacement agree.** One sentence and a three-option gate: equal only for straight motion that never turns back; otherwise distance is larger. Cite 2019 Summer Higher Q7(c).
3. **A curved or two-dimensional route.** A Your turn on part of a circular track (displacement = diameter for half a lap, with a compass direction), and a three-sides-of-a-rectangle twin.
4. **Velocity as a rate.** Add "the rate of change of displacement" beside v = d ÷ t, matching the speed topic's wording.
5. **Backwards from the average velocity.** If `p1-speed-equations` gains the backwards variant (its gap 1), add the velocity twin here on a Higher context.

## 11. Anything in our note the book suggests is wrong or misleading

Nothing is wrong. The note's claim that the minus sign earns a mark is supported by two CCEA schemes (2018 Summer Higher Q5(b)(i): `docs/sources/papers/science/2018-Summer/P1-H-Physics-MS-10049.txt`; 2019 November Higher Q5(c)(i): `docs/sources/papers/science/2019-November/P1-H-Physics-MS-15066.txt`), and "deceleration" being accepted beside retardation is supported by the 2019 November scheme. Where the book and our note differ (the retardation's sign), ours is right.
