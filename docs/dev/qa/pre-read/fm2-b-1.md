# FM2-B pre-read — vertical motion, vectors and scalars, magnitude and direction, i/j calculations

Date: 2026-09-20. Bundles read: `packs/further-maths/content/fm2/{vertical-motion-under-gravity, vector-and-scalar-quantities, vector-magnitude-and-direction, ij-vector-calculations}/bundle.json` (+ `note.blocks.json`).

Digests (read in full): `docs/dev/qa/pre-read/fm2b-<slug>.digest.txt` — one per bundle.

All four bundles were rewritten by another session at 15:54, after the digests were taken at 15:37. The only difference is in `note.blocks.json` (the "You can now" `mustknow` panel is now an `h` + `p` pair); every finding below was re-verified against the 15:54 files, and the structural scan was re-run on them (hero, section lengths, closing panels all still clean).

How this was checked

- Every numeric value, worked-example step, twin, note gate, note worked line and `commonError` value recomputed in node with `g = 10`. `9.8` appears only in `topic.notOnThisSpec` / `note.notOnThisSpec` (the four hits inside figure `src` are path coordinates, not label text).
- Marking: a battery of accepted answers, worked-solution final lines, correct alternative spellings and plausible wrong answers marked through `markAnswer(raw, part.answer, { marks, commonErrors, prompt: stem })` for all 45 questions/parts and all 7 twins across the four bundles; every fix below was re-run through the same harness.
- Spec: all four topics are named by `data/spec/further-mathematics.json` (`FM2-KIN-02`, `FM2-VEC-01`, `FM2-VEC-02`, `FM2-VEC-03`); nothing off-spec found. (`topic.specRefs` is absent here, as it is in every other FM bundle — house norm, not a finding.)
- Structure: hero first with lede / `can[3]` / `minutes` in all four; longest section between gates 134 words; closing panels 61–68 words; no unpaired `$`, no `${`, no `undefined`/`NaN`; question `totalMarks` = sum of part marks and every part's scheme marks = part marks in all four bundles.
- Figures: every SVG's text nodes compared with its `alt`; all consistent (geometry spot-checked on `we.fm.u2.vector-magnitude-and-direction.01`: 24 across / 7 up drawn at 11.47 vs 10.5 px per unit, angle drawn ≈15° against a true 16.26° — acceptable).
- MCQ / diagnostics: exactly one correct option, no duplicate option texts and feedback on every option, in all 4 diagnostics sets, both MCQ parts and all note `choice` gates.

Engine gaps hit but **not** counted as findings (queued): `\mathbf{i}` typed by the learner, a `pmatrix` column, a unit typed after an i/j expression (`7i + 5j N`), and `(7, 5)` typed for a part that asks for i/j form. Paired-answer common errors fired on the `p = 20, q = 7` spelling in `q…0016(a)` but not on `p = -1, q = 4` — inconsistent, engine-side.

---

## vertical-motion-under-gravity

Physics, marking, diagnostics, find-the-mistake, note structure: clean. All 12 questions, both worked examples and both twins recompute exactly (28.8 / 4.8 / −24; 11.25 / 4 / 25; 61.25; roots (7±√13)/2; 3.6; 3; 36; 45; 20; 25; 4; 25), every `commonError` value reproduces the error it names, and every accepted spelling marks as intended (units, `18/5`, `t = 2`, `3.60`, `053`-style leading zeros not applicable here). The one wrong line in `ftm…01` is line 1 and lines 2–4 follow correctly from it.

**1. (minor) `q.fm.u2.vertical-motion-under-gravity.0011` (b) — a 2-decimal-place answer is stored and printed to 1 d.p.**
Current: `answer.value` `5.3`, scheme row `W1: both roots, $t = 1.7$ and $t = 5.3$`, worked solution `… that is $t = 1.7$ s on the way up and $t = 5.3$ s on the way down. … the answer is $5.3$ s.` The stem says "Round to 2 decimal places" and the exact roots are 1.697224… and 5.302776…, i.e. 1.70 and 5.30 to 2 d.p.
Why it matters: no marks are lost (`5.3`, `5.30`, `5.3 s`, `5.30 s` all mark 4/4, and `5.3` gets the "on the paper write 5.30" nudge), but the feedback card's expected line reads "5.3 s" for a question that demands 2 d.p., and the model answer teaches the dropped trailing zero the nudge warns against.
Fix (verified): leave `value` at `5.3`; write the scheme row as `both roots, $t = 1.70$ and $t = 5.30$` and the worked solution's last three numbers as `1.70`, `5.30`, `5.30`. Marking is unchanged (`5.30` → 4/4, `1.70` → 3/4 with `fm.kin.first-root-taken`).

**Verdict: publishable as it stands; finding 1 is presentation only.**

---

## vector-and-scalar-quantities

Definitions, examples, diagnostics, the two MCQ parts, both label parts, the find-the-mistake and the note structure are otherwise clean; the twin (400 m) and `q…0005` (0 m) mark correctly.

**2. (must fix) `q.fm.u2.vector-and-scalar-quantities.0004` (main) — the fully reversed answer earns 2/2.**
Current key words: group 1 `["magnitude only","size only","no direction","not a direction"]`, group 2 `["acts downwards","force that acts downwards","downwards","towards the centre of the earth"]`.
Because the groups are presence-based, `"Mass is a vector because it acts downwards. Weight is a scalar because it has magnitude only."` — the classification exactly backwards, which is the misconception the part exists to catch — scores **2/2 "Every marking point is there."**
Fix (verified): bind each property to its subject —
group 1 `["mass is a scalar","mass has magnitude only","mass has size only","mass has a magnitude only","mass has no direction"]`,
group 2 `["weight is a vector","weight is a force","weight acts downwards","weight is the pull of gravity"]`.
Re-run: accepted answer 2/2; `"Mass has magnitude only and no direction, but weight is a force that acts downwards towards the centre of the Earth."` 2/2; `"Mass is a scalar as it only has a size, whereas weight is a vector as it is a force acting downwards."` improves from 1/2 to 2/2; the reversed answer drops to **0/2**; `"Mass has magnitude only."` 1/2 ("still missing weight is a vector"); the `fm.vectors.weight-scalar` answer stays 0/2.

**3. (should fix) `q…0007` (a) and `q…0006` (main) — "quantity" is not actually accepted for "magnitude", though both scheme rows say it is.**
`q…0007` (a) scheme row: `W1: a vector quantity has magnitude and direction (quantity is accepted for magnitude)`; key words contain `"quantity and direction"`, which cannot match the natural spelling `"a quantity and a direction"` (the phrase must be contiguous). `"A vector quantity has a quantity and a direction, for example weight."` scores **1/2**. Same for `q…0006` (main), whose row also says quantity is accepted but whose key words have no `"quantity only"`: `"A scalar has quantity only, for example mass."` scores **1/2**. The spec's own teacher guidance for `FM2-VEC-01` says examiners accept "quantity" for "magnitude".
Fix (verified): add `"quantity and a direction"` to `q…0007` (a) group 1, and add `"quantity only"` (and optionally `"quantity but no direction"`) to `q…0006` group 1. Both answers then score 2/2; every currently-accepted answer is unaffected.

**4. (minor) three text `commonError` regexes fire on correct clauses.**
- `q…0004` `fm.vectors.weight-scalar`, `"\\bweight\\b[^.;\\n]{0,40}\\bscalar\\b"` — fires on `"Mass has magnitude only. Weight is a vector, not a scalar."` and `"Weight, unlike mass, is not a scalar quantity."` Fix (verified): `"\\bweight\\b[^.;\\n]{0,30}\\bis (?:a |an )?scalar\\b"` — still fires on `"Weight is a scalar because it is just a number of newtons."` and `"The weight of the bag is a scalar."`, silent on both correct clauses.
- `q…0006` (and the identical pattern in `q…0007` (b)) `fm.vectors.definitions-swapped`, `"\\bmagnitude and (?:a )?direction\\b|\\bsize and (?:a )?direction\\b"` — fires on `"A scalar has magnitude only, not magnitude and direction like a vector."` Fix (verified): `"\\bhas (?:a )?magnitude and (?:a )?direction\\b|\\bhas (?:a )?size and (?:a )?direction\\b"`.
- `q…0007` (a) `fm.vectors.definitions-swapped`, `"\\bmagnitude (?:only|alone)\\b|\\bsize (?:only|alone)\\b"` — fires on `"A vector has magnitude and direction, unlike a scalar which has magnitude only."` Fix (verified): `"\\bvector\\b[^.;\\n]{0,30}\\b(?:magnitude|size) (?:only|alone)\\b"`.
No marks move in any of these cases (a matched common error never raises a text answer's marks); the cost is misleading feedback on an answer that is half right.

**5. (minor) `we.fm.u2.vector-and-scalar-quantities.01` — the final line calls 036.87° "north-east".**
Step 2 gives `Displacement $= 5$ km on a bearing of $036.87^{\circ}$`; `finalAnswer` then reads `(i) distance $7$ km, displacement $5$ km north-east of the start`. North-east is 045°, and this bundle's own pre-diagnostic teaches that a bearing is written with three figures. The note repeats the loose wording (`note.blocks[5]`: "pointing north-east"; hero lede: "five kilometres north-east of home").
Fix: `finalAnswer` → `(i) distance $7$ km, displacement $5$ km on a bearing of $036.87^{\circ}$`; `note.blocks[5]` → "… $5$ km, on a bearing of $037^{\circ}$ — between north and east". (Hero lede can stay conversational.)

**6. (minor, engine-side) `q…0007` (c) — a guess earns a mark.**
Six Vector/Scalar targets for 2 marks; scheme rows are `W1: any four correct`, `W2: the remaining two correct`. The engine's proportional sharing awards 1/2 at **three** of six — the expected score of pure guessing on a binary choice (measured: 0,0,0,1,1,1,2 marks for 0…6 correct). The 4-target part `q…0003` matches its scheme exactly (0,0,1,1,2). Either reword the rows to `any three correct` or raise the granularity with the engine; no content bug.

**Verdict: fix 2 and 3 before publishing; 4–6 are polish.**

---

## vector-magnitude-and-direction

All magnitudes, inverse tangents and the 90° checks recompute exactly (25; 16.26/73.74; 13; 37; 15; 25; 53.13; 28.07; 29; 46.3972→46.40; 43.6028→43.60; 41), every `commonError` reproduces its named slip, diagnostics and the find-the-mistake are clean, and the marking accepts `53.13°`, `53.13 degrees` and the three-figure `053.13`.

**7. (must fix) `$mathbf{i}$` — a missing backslash renders as the literal word "mathbfi".**
- `we.fm.u2.vector-magnitude-and-direction.01`, stem: `… where $\mathbf{i}$ and $\mathbf{j}$ are perpendicular unit vectors, with $mathbf{i}$ along the x-axis.`
- `q.fm.u2.vector-magnitude-and-direction.0008` (a), stem: same clause, same defect.
Fix: `$mathbf{i}$` → `$\mathbf{i}$` (2 occurrences in this bundle). Apply from a script file — an inline `node -e` halves backslashes on this shell.

**8. (should fix) the bearing is printed with two figures.**
- `q.fm.u2.vector-magnitude-and-direction.0007` worked solution: `… the bearing is the angle between the displacement and $\mathbf{j}$: $\tan^{-1}\dfrac{40}{30} = 53.13^{\circ}$.` and scheme row `W1: $53.13$`.
- `note.blocks[19]`: `… so it is $50$ m from the harbour on a bearing of $53.13^{\circ}$.`
The same bundle's pre-diagnostic 02 teaches "Bearings start at north and turn clockwise, **written with three figures**", and the sister bundle writes `036.87^{\circ}`. A CCEA answer line would read 053.13°.
Fix: write `053.13^{\circ}` in the worked solution, the scheme row and `note.blocks[19]`. Leave `answer.value` at `53.13`; the engine already accepts `053.13`, `053.13°` and `53.13` (all 3/3, verified).

**9. (minor) `q…0008` (b) and (c) — 2-d.p. answers stored and printed to 1 d.p.**
`value` `46.4` (true 46.3972…) and `43.6` (true 43.6028…), scheme rows `W1: $46.4$` / `W1: $43.6$`, worked solutions `$\tan^{-1}\dfrac{21}{20} = 46.4^{\circ}$` and `$\tan^{-1}\dfrac{20}{21} = 43.6^{\circ}$, and $46.4 + 43.6 = 90$`, all under a "Round to 2 decimal places" stem. Same class as finding 1: no marks lost, wrong model answer. Fix: print `46.40` and `43.60` in the rows and solutions (`46.40 + 43.60 = 90` still checks).

**Verdict: fix 7 and 8 before publishing; 9 is presentation.**

---

## ij-vector-calculations

All 18 questions, 3 worked examples, 3 twins, 12 diagnostic items and every `commonError` value recompute exactly apart from the items below (checked: 7i+5j; 6i−6j; 12i−15j; 9i−10j; 9i+12j; 15; −8i−6j; 10; k=5; (5,−3); 10i+8j; 24i+3j; 10i−6j; 20; (4,−1); 25; 16.26; 3i−4j; 24i−32j; 20; 17i−13j; 42i−21j; 40i−30j; 50). Note gates, note worked lines and figures are clean.

**10. (must fix) `$mathbf{i}$` / `$mathbf{j}$` — 11 occurrences across 7 stems.**
`we…01`, `we…02` (`… with $mathbf{i}$ along the x-axis.`), `we…03` (`… with $mathbf{i}$ along the x-axis, and distances are in metres.`), and the opening part of `q…0015` (a), `q…0016` (a), `q…0017` (a), `q…0018` (a) (`… perpendicular unit vectors, $mathbf{i}$ along the x-axis and $mathbf{j}$ along the y-axis.`). Each renders as italic "mathbfi" / "mathbfj" in the very sentence that defines the notation.
Fix: `$mathbf{i}$` → `$\mathbf{i}$`, `$mathbf{j}$` → `$\mathbf{j}$` (11 occurrences here, 13 with finding 7). Script file, not `node -e`.

**11. (must fix) `ftm.fm.u2.ij-vector-calculations.01` — two wrong lines, and the second is plain arithmetic.**
`mistakeLine` is 3, but the student working reads:
`1. Resultant = the vector sum of the forces` / `2. i: 6 - 5 = 11` / `3. j: -2 - 9 = -11` / `4. Resultant = 11i - 11j N`.
`6 - 5 = 1`, not 11, and `whatWentWrong` says so: "The $\mathbf{i}$ line is right: -5 is already negative, so adding it takes 5 away and gives 1." The correction array also has `i: 6 - 5 = 1`. As written, line 2 is a second (uncommented) error and line 4 carries it.
Fix: `studentWorking[1]` → `"i: 6 - 5 = 1"`, `studentWorking[3]` → `"Resultant = i - 11j N"`. `mistakeLine` 3, `correction` and `marksEarnedAsWritten: ["MW1"]` then all hold.

**12. (must fix) `ftm.fm.u2.ij-vector-calculations.03` — the flagged line is arithmetically incoherent.**
`studentWorking[2]` is `"i: 6 + 6 = 0"`; `6 + 6 = 12`. The named misconception is adding $3\mathbf{q}$ where the question subtracts it, and the $\mathbf{i}$ component of $3\mathbf{q}$ is −6, so the student's own line should read `6 + (-6) = 0` — which is what makes line 5 (`2p - 3q = -2j`) follow.
Fix: `studentWorking[2]` → `"i: 6 + (-6) = 0"`. While there, `whatWentWrong` opens "Line 3 adds 6 where the question subtracts $3\mathbf{q}$" — it adds −6; suggest "Line 3 adds the $\mathbf{i}$ component of $3\mathbf{q}$ where the question subtracts it."

**13. (must fix) `q.fm.u2.ij-vector-calculations.0016` (a) — the common-error value does not follow from the error it names.**
Current: `{"kind":"algebraic","latex":"(-4, -3)"}`, feedback "That comes from expanding $-2 \times -p\mathbf{j}$ as $-2p\mathbf{j}$, so the $\mathbf{j}$ equation becomes $6q - 2p = 2$…", 3 of 5 marks.
That slip gives the pair `3p - 6q = 18`, `6q - 2p = 2`, whose solution is **p = 20, q = 7** (check: 60 − 42 = 18; 42 − 40 = 2). `(-4, -3)` satisfies neither equation (3p − 6q = 6, and 6q − 2p = −10), and nothing plausible produces it — the other slips I solved give (6.67, 0.33), (2.67, −1.67), (16, −5), (3.2, 1.4). So the commonest sign slip on the hardest part of the paper goes undiagnosed: `(20, 7)` currently marks 0/5 with generic feedback.
Fix (verified): `latex` → `"(20, 7)"`. Re-run: `(20, 7)` and `p = 20, q = 7` → 3/5 tagged `fm.vectors.component-sign-dropped` with the existing feedback intact; `(4, -1)` still 5/5; `(-1, 4)` still 4/5.

**14. (should fix) `q.fm.u2.ij-vector-calculations.0009` (main) — common-error sign, and a vector the stem never names.**
Stem: `$k(2\mathbf{i} - 3\mathbf{j}) = 10\mathbf{i} - 15\mathbf{j}$. Find the value of $k$.` Common error: value `3.333333`, feedback "That divides the i component of the answer by the j coefficient of **$\mathbf{v}$**…". Two problems: the operation described gives 10 ÷ (−3) = **−3.33**, not +3.33 (a learner who types `-3.33` gets no diagnosis at all), and there is no `$\mathbf{v}$` anywhere in this question.
Fix (verified): keep the existing entry (a learner who crosses columns ignoring signs does write 3.33) but reword it to "That divides the $\mathbf{i}$ component of the answer by the 3 in the $\mathbf{j}$ coefficient, so the two columns have been crossed…", and add a second entry with `"value": -3.333333`, same misconception and `marksTypicallyEarned: 0`, whose feedback names the signed version. Re-run: `3.33` and `-3.33` both 0/2 tagged `fm.vectors.scalar-multiple-partial`.

**15. (should fix) `dx.fm.u2.ij-vector-calculations.pre` item `02` — a distractor's feedback names the wrong equation.**
Question: solve `x + 2y = 7` and `x - y = 1`. Distractor `$x = 5$, $y = 1$` with feedback "That satisfies the second equation but not the first." In fact 5 + 2(1) = 7 (the **first**), and 5 − 1 = 4 ≠ 1 (fails the second). The next distractor, `$x = 1$, $y = 3$`, is correctly described as satisfying the first only — so as written two options claim different things about the same failure mode and one of them is wrong.
Fix (verified arithmetic): change the option text to `$x = 4$, $y = 3$` and keep the feedback as written — 4 − 3 = 1 satisfies the second, 4 + 6 = 10 ≠ 7 fails the first. (Alternative: keep `(5, 1)` and swap the feedback to "satisfies the first equation but not the second", but that duplicates the next option's diagnosis.)

**16. (should fix) `q.fm.u2.ij-vector-calculations.0008` (main) — "Round to 2 decimal places" on an exact answer.**
Stem ends `Calculate the distance $AB$.\n\nRound to 2 decimal places.`; the answer is exactly 10 (|−8i − 6j| = 10), the scheme row is `W1: $10$` and the worked solution ends `= \sqrt{100} = 10$ m`. Because the instruction is read as an accuracy demand, a learner who types the scheme's own `10` is marked correct but told "The question asks for 2 decimal places, so on the paper write 10.00: examiners report the last mark lost to that" — advice that is wrong for this answer, and unlike its sibling parts (`q…0006`, `q…0018` (c)) which ask for the same kind of magnitude with no rounding instruction.
Fix (verified): delete the `Round to 2 decimal places.` line from the stem and set `answer.tolerance` to `{"type":"absolute","value":0.005}` (matching the siblings). Re-run: `10`, `10 m`, `10.00` all 3/3 with clean feedback; the `100` common error still fires at 2/3.

**Verdict: 10–13 must be fixed before publishing; 14–16 should be fixed in the same pass.**

---

## Summary

| Bundle | Must fix | Should fix | Minor | Verdict |
| --- | --- | --- | --- | --- |
| vertical-motion-under-gravity | — | — | 1 | Publishable; one presentation fix. |
| vector-and-scalar-quantities | 1 (#2) | 1 (#3) | 3 (#4–6) | Hold for #2 and #3 — a reversed answer currently scores full marks. |
| vector-magnitude-and-direction | 1 (#7) | 1 (#8) | 1 (#9) | Hold for the LaTeX and the bearing convention. |
| ij-vector-calculations | 4 (#10–13) | 3 (#14–16) | — | Hold; strongest content of the four, but two find-the-mistake items and the flagship 5-mark part need repair. |
