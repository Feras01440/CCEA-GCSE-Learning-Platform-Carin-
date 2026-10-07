# p1-speed-equations: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** `packs/science/content/p1/p1-speed-equations/note.blocks.json` (v1, 22 Sep 2026) and `bundle.json` (1 worked example, 10 questions, 1 find-the-mistake, 6 prompts), read in full on 7 Oct 2026.
**Spec.** P1 1.1.1 and Prescribed Practical P1 (both Foundation).
**Verdict.** Our note is **richer**: it teaches unit conversion, the ramp practical, the graph shape and examiner evidence, none of which the book has. The book adds one exam move we never teach (running the average-of-two-speeds equation backwards to find a final or starting speed) and one warning we leave implicit (a changing speed must never go into distance = speed × time).

---

## 1. Book chapter and pages

Section 1.1 (Motion): learning outcomes p. 1; "Motion in a Straight Line" pp. 2–3 (average speed and rate of change of speed p. 2, average of two speeds p. 3); three worked examples pp. 4–5; Test Yourself 1.1.1 Q1 p. 5; the distance–time reading in Test Yourself 1.1.2 Q1 p. 6 (average speed from a linear graph, 1.1.1's first bullet). Answers p. 68. Prescribed Practical P1 is not in this book at all: practicals are left to CCEA's separate Practical eGuide, which we do not hold.

## 2. The book's teaching sequence

1. Distance as how far apart two points are; speed as how fast distance is covered; average speed as total distance over total time, flagged as a formula to learn (p. 2).
2. Rate of change of speed as the change in speed divided by the time, in m/s², with the note that it has no direction because speed has none (p. 2).
3. When speed changes at a steady rate, the average speed is the mean of the first and last speeds (p. 3).
4. Worked examples in rising difficulty: laps of a track, a car speeding up (three linked parts), a marble on a runway worked backwards to its top speed (pp. 4–5).
5. Self-test on a car braking to rest (p. 5).

The book interleaves the Higher vector material (velocity, acceleration) on the same pages; see `p1-vectors-velocity-acceleration`.

## 3. Explanations the book uses that our note lacks

- **The average-of-two-speeds equation run backwards** (pp. 4–5). From rest, the top speed is twice the average speed, so a timed roll gives the final speed and then the rate of change of speed. Our note uses the equation only forwards (two speeds in, average out). CCEA sets the backwards form: 2018 March Higher Q9 (find the starting velocity from a maximum and an average velocity), 2018 Summer Higher Q5(a) (a ball slowing to rest with a given average velocity; scheme `docs/sources/papers/science/2018-Summer/P1-H-Physics-MS-10049.txt`, starting velocity twice the average) and Summer 2026 Higher Q9(ii) (goggles dropped from rest, final velocity from the average, then kinetic energy; no scheme yet). These are velocity-worded on the Higher paper, but the move is the same.
- **"Incorrect physics" as a named danger** (p. 4, exam tip). If the speed is changing, multiplying one speed by the time is the wrong equation and scores nothing, however good the arithmetic. CCEA's general marking principles say exactly this (an incorrect physics equation earns 0 overall: `docs/sources/papers/science/2021-Summer/P1-H-Physics-MS-18503.txt`, principle 3), and the Summer 2023 report (Higher Q7) found many candidates using displacement = velocity × time on a changing velocity. Our note reaches the right method in its worked example but never shows the wrong one as a non-example.
- **State the assumption** (p. 5). After using the mean of two speeds, the book asks what was assumed: that the speed changed at a steady rate. Our note states the condition in a recall prompt only.
- **Speed carries no direction, so neither does its rate of change** (p. 2). One sentence that sets up the Higher scalar–vector pairing. Our note leaves this to the vectors topic.

## 4. Diagrams and photographs

The book has no figure for this material: its examples are text and fractions only. Our note has four figures (the cyclist's journey, the minutes bar, the steady-rise bars, the ramp apparatus) and the bundle draws a distance–time graph and the ramp in Booklet B style. Nothing to recreate.

## 5. Worked examples, calculations and data tasks

- **Laps of a rectangle** (p. 4): a jogger circles a rectangular track several times; total distance is laps × perimeter, then divide by the time. Answers are whole numbers. A multi-step distance we lack (ours always give the distance directly).
- **A car speeding up, three linked parts** (p. 4): from a slow to a fast speed in 8 s; rate of change of speed, then the average of the two speeds, then distance from average speed × time. Same shape as our motorway worked example (ours uses 14 m/s to 30 m/s in 8 s, which keeps it distinct).
- **Marble from rest down a 1 m runway** (pp. 4–5): average speed from length and time in cm/s; top speed as twice the average; rate of change of speed from the top speed; the assumption stated. The numbers are to three figures and stay in cm, cm/s and cm/s². This is the calculation behind Practical P1 and the backwards move above.
- **Braking to rest** (Test Yourself 1.1.1 Q1, p. 5): a car slows steadily to rest in 7 s; the retardation, then the stopping distance from the average speed. Our note has no slowing case.

## 6. Practice question types

- **Calculate** an average speed from distance and time, or from a straight distance–time line (3; set in most Foundation series and several Higher ones).
- **Calculate** a rate of change of speed (3–5, sometimes with the unit as its own mark: 2022 Summer Foundation asks for the unit as well).
- **Calculate** a distance during steady speeding up via the average speed (3).
- **Calculate** a final or starting speed from the average (3; the backwards move, 2018 and 2026 Higher).
- **State** the assumption behind the average-of-two formula (1).
- In Unit 7, the ramp practical returns with timings, mean times, average speeds and a graph (2019 Summer Higher Booklet B Q3; 2021 Summer Foundation Booklet B Q2).

## 7. Definitions and wording

- **Equations.** The book's three equations match the specification's 1.1.1 wording. Its learning-outcome page (p. 1) also lists v = u + at, d = ½(u + v) × t and "recall the meanings of u, v, a, d and t": those lines come from CCEA's separate GCSE Physics specification, not the Double Award one. They are true and harmless (each follows from the spec's own equations) but should not be presented to her as extra equations to memorise.
- **Rate of change of speed** is in m/s² in the book and the specification; our note agrees.
- **Fractions, not triangles.** The book writes every equation as a fraction. CCEA's general marking principles refuse a formula triangle as the equation (it earns nothing on its own, though a correct equation may be read from it); our note's "write the equation first" habit is the right one.

## 8. Higher-tier-only content in the book

None for 1.1.1. The book does not mark Higher-only content at all (its bold type is emphasis), so authors should take tier from the specification.

## 9. Pitfalls and "remember" notes in the book

- A changing speed never goes into distance = speed × time; use the average speed (p. 4).
- Write the formula, substitute, calculate, give the unit, in that order (p. 18 tip, "FSCU"; marks are given up to the first error).
- Know which speed is the starting one and which the final one before substituting (p. 5).

## 10. GAPS in our note, ranked

1. **The backwards move is missing.** Add a `variant` section: explain that the average sits halfway, so from rest the final speed is twice the average; See it on our own numbers (for example a trolley covering 1.80 m in 2.4 s from rest: average 0.75 m/s, final 1.5 m/s, rate of change 0.625 m/s²); Your turn with a non-zero starting speed (final = 2 × average − initial); twin on a slowing object.
2. **No wrong-equation non-example.** Add a See it pair: the car speeding up from 14 m/s to 30 m/s, worked once with 30 × 8 (240 m, "incorrect physics", 0 marks) and once with the average (176 m). Cite the marking principle and the 2023 report.
3. **No slowing case.** One twin where the speed falls to rest, so the change in speed is negative; link forward to retardation in the Higher topic.
4. **No "state the assumption" item.** A one-mark gate: "What did you assume when you used (initial + final) ÷ 2?" (steady rate of change).
5. **Multi-step distance.** One twin where the distance must first be built (laps × perimeter, or two legs added).

## 11. Anything in our note the book suggests is wrong or misleading

Nothing is wrong. The book's learning-outcome list (p. 1) is broader than our note's must-memorise list because it borrows from the single-award specification; ours follows the Double Award specification, which is right.
