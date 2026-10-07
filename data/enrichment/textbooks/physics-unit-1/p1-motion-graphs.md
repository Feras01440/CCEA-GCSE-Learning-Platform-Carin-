# p1-motion-graphs: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy and the P1 deck (`data/decks/science/P1.json`) has 9 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.1.5 (Foundation) and 1.1.6 (Higher).
**Verdict.** **Thinner** (nothing authored). The book is the richest part of its Motion section: eleven graph exercises with full answers, from simple distance–time readings to a trapezium train journey and a bouncing ball with negative velocities. It states the six graph rules but never explains them, and it has no displacement–time graph with a return journey, which CCEA's March 2026 report called the hardest question on that paper.

---

## 1. Book chapter and pages

Section 1.1: "Motion Graphs" with the six rules p. 5; Test Yourself 1.1.2 (five graphs) pp. 6–7; Practice Questions 1(b)–6 pp. 8–12; a "Past Examination Question" (bouncing ball) pp. 12–13. Answers pp. 8–13 (inline) and pp. 68–70.

## 2. The book's teaching sequence

1. Six rules in a numbered list: the slope of a distance–time graph is speed, of a speed–time graph the rate of change of speed, and the area under a speed–time graph the distance; then the same three for displacement, velocity and acceleration (p. 5).
2. Straight into practice, graded: read a distance and a speed from a three-segment distance–time graph; split a speed–time area into rectangles and a triangle; find a race length and an acceleration; describe a stop; read, then calculate, from a velocity–time graph (pp. 6–7).
3. Harder practice with worked answers: two runners on one distance–time grid (head start, overtaking point, gap at the finish), two cars on one velocity–time grid, a three-stage train journey, and a bouncing ball whose velocity goes negative (pp. 8–13).

There is no explanation stage: the rules are stated, not derived.

## 3. Explanations and devices worth recreating (our own words)

- **Split the area, then add** (answer p. 68). The tractor answer draws dashed lines to cut the area under a speed–time graph into two rectangles and a triangle, labels each with its multiplication, and adds. This is the method CCEA rewards ("dist = area" then the parts: `docs/sources/papers/science/2022-March/P1-H-Physics-MS-19606.txt`, Q5(b)).
- **Two journeys on one grid** (pp. 9–10). Father and son on one distance–time grid: where the lines start (a head start), where they cross (the overtaking point), the vertical gap at one time (how far apart). Two cars on one velocity–time grid: compare areas for the distance between them. Both build reading skills a single graph cannot.
- **Read the scale before reading the graph** (p. 12, answer note). The train answer points out what one small square is worth before reading the braking time. A habit worth teaching explicitly.
- **Always positive means one direction** (p. 12, train (i)). A velocity–time line that never crosses zero describes motion in one direction only; the bouncing ball (pp. 12–13) then shows what a sign change means (falling negative, rising positive) and how a smaller rebound speed shows energy lost at the bounce.
- **Average speed from the average of two velocities, as a check on the area** (p. 9, golf ball). The distance found from the mean of the start and end velocities equals the triangle's area; showing both routes agree is a good teaching move.

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Recreation note for our first figures |
|---|---|---|---|
| Three-segment distance–time graph (p. 6) | Rises slowly, flat, then rises steeply to the end. | Speed from slope; a stop as a flat line. | Our own three-segment journey with different numbers; make the flat part long enough to read. |
| Speed–time graph with a fall between two steady parts (p. 6; answer split p. 68) | Steady, falls in a straight line, steady at a lower value. | Area as rectangles plus triangle; a negative rate of change of speed. | Draw ours with the dashed split shown on the answer figure. |
| Race and car velocity–time graphs (p. 7) | A short straight rise then a long flat line; a straight rise then flat. | Area as triangle plus rectangle; gradient for acceleration. | One of each, our numbers. |
| Father-and-son distance–time grid (p. 10) | Two straight lines, one starting late from the time axis, crossing part-way. | Overtaking and gaps. | Recreate as a two-cyclist or two-runner graph. |
| Two-car velocity–time grid (p. 10) | Two straight lines from the origin with different slopes. | Separation from area difference. | Recreate. |
| Train trapezium (p. 11) | Up, flat, long slope down to zero. | Three stages, braking time, average speed over the trip. | Recreate with our own times; ask the braking time to a small-square reading. |
| Bouncing ball (p. 12) | Velocity falls from zero to a negative value, jumps to a positive value, falls through zero again. | Direction as sign; contact time; energy loss. | Recreate with care: after leaving the ground at a speed, the ball should land again at the same speed with the same slope as the first fall (the book's second fall is drawn a little too steep). |

## 5. Worked examples, calculations and data tasks

All eleven exercises are fully answered. Their shapes, described:

- **Distance–time, read and divide** (pp. 6, 7, 11): a distance over the last stage; a steady speed over the first stage; the average speed over a journey that includes a stop (total distance over total time, so the stop lowers the average).
- **Speed–time area by parts** (p. 6): two rectangles and a triangle (answer 70 m); the slowing section's rate of change of speed, negative.
- **Velocity–time triangle plus rectangle** (pp. 7, 8, 10): race length, displacement after a time, acceleration from the first slope.
- **Overtaking** (p. 9): where two distance–time lines cross.
- **Trapezium journey** (pp. 11–12): acceleration of the first stage, the moment the brakes go on, three areas, and the average speed as total area over total time.
- **Bouncing ball** (pp. 12–13): time to reach the ground, impact velocity (negative), contact time from the near-vertical jump, rebound velocity, and why the smaller rebound speed shows energy was lost. The book calls it a past examination question; it is not in any Double Award P1 paper we hold (2018–2026).

## 6. Practice question types, with CCEA evidence

Motion graphs appear in 23 of the 24 Higher P1 papers we hold (2018 March to Summer 2026; not 2024 March) and in at least 20 of the 24 Foundation papers. The recurring parts:

- **Describe the motion** for a section (1 each). The scheme words matter: for a flat section of a velocity–time graph, Summer 2025 Higher Q5(i) credited "constant velocity / no acceleration" and the report lists "constant speed" as the common error; the 2021 November Higher scheme (Q7(i)) did allow constant speed. Teach "constant velocity" for velocity–time graphs.
- **Stationary or moving?** On a distance–time graph a flat line is stopped: Summer 2023 Higher Q3(i) lost marks to "constant speed/velocity", and Summer 2024 Higher Q1(b) lost marks to "accelerating" for a straight slope and to a non-zero distance for a flat part (both from the reports).
- **Calculate** speed or velocity from a slope, acceleration from a slope, distance or displacement from an area (3–4 each; 2022 March Higher Q5(b) is a rectangle plus a triangle, 1125 m).
- **Displacement–time with a return** (March 2026 Higher Q5): constant velocity, stopped, constant velocity in the opposite direction; then a velocity from a graph whose line does not start at zero displacement (150 m in 10 s, 15 m/s). The report says hardly anyone got beyond a single mark of the four for describing the motion.
- **Balanced forces** read from a graph (2025 Summer Higher Q5(ii): the flat section), linking to `p1-newtons-laws`.
- **Negative velocities** (2025 November Higher Q6: a velocity–time graph below the axis; an average velocity, then a distance, where the scheme says to ignore minus signs).

## 7. Definitions and wording, and book errors

- **The six rules** (p. 5) match 1.1.5 and 1.1.6 word for word in meaning; the specification says "slope" where the book says "gradient". Either is fine.
- **Book error: shifted answer labels** (p. 69–70, Test Yourself 1.1.2 Q5). The displacement answer is labelled (ii), the equation (iii) and the acceleration (iv), while the question asks for the equation in (ii), the acceleration in (iii) and the displacement in (iv). The numbers themselves are right.
- **Book error, minor: the bouncing-ball drawing** (p. 12). The second fall is drawn steeper than the first, ending below the rebound speed; any recreation should keep both falls at the same slope.
- **No reasons given.** The book never explains why slope is a rate (rise over run is change over time) or why area is distance (a rectangle under a speed–time line is speed × time). Our note should teach both, with the rectangle as the seed.

## 8. Higher-tier-only content in the book

1.1.6 (displacement–time and velocity–time) is Higher. The book mixes both tiers in one list and one exercise set without marking which is which; its velocity–time items are Higher, its distance–time and speed–time items Foundation.

## 9. Pitfalls and "remember" notes in the book

- Find what one small square is worth before reading a time or value (p. 12).
- A velocity that stays positive means one direction throughout (p. 12).
- The average speed for a journey uses the total distance and the total time, stops included (p. 7, Jim).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **Shape reading, both graph types side by side.** A two-column figure: flat line = stopped (distance–time) but steady speed or velocity (speed–time or velocity–time); straight slope = steady speed (distance–time) but steady acceleration (velocity–time). Your turn on each, citing the 2023, 2024 and 2025 reports.
2. **Why slope is a rate and area a distance.** Explain with a rectangle under a flat speed–time line (speed × time), then a triangle as half a rectangle; show on our own numbers before any area question.
3. **Area by parts.** See it: split a trapezium or a triangle-plus-rectangle and add; Your turn on new numbers; twin with a slowing section.
4. **Displacement–time with a return journey** (Higher). See it: out, stop, back past the start; the negative slope as velocity in the opposite direction; a velocity from a line that does not start at zero. This is the March 2026 gap the book leaves open.
5. **Two journeys on one grid** (overtaking and separation), and the **trapezium journey** with an average speed over the whole trip.
6. **Bouncing ball** (Higher): sign as direction, the falling slope equal to −10 m/s² (link to `p1-mass-weight-free-fall`), and energy loss from the rebound speed.

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. One of our deck cards, and the taxonomy's examiner-evidence line for this slug, misread the Summer 2025 report: the trap card says "constant speed" was given for a **sloping** velocity–time section, but the report and scheme (Summer 2025 Higher Q5(i), `docs/sources/papers/science/2025-Summer/P1-H-Physics-MS-67250.txt`) concern a **flat** section, where "constant velocity" was required and "constant speed" was the error. The card's physics (a sloping velocity–time line is constant acceleration) is right; its citation is not. Re-point the card at the flat-section trap, or find a report that supports the sloping one (Summer 2024 Higher Q1(b)(i) supports "accelerating" wrongly given for a straight distance–time slope).
