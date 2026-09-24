Acknowledged: reviewed to the STANDARDS.md bar (22 Sep 2026, 23:05): every value recomputed, every part re-marked through the real engine, every figure read as geometry, every note read as a lesson.

# Pre-read: FM2 batch C, forces (force diagrams, resolving, resultant, equilibrium)

Bundles: `packs/further-maths/content/fm2/{force-diagrams,resolving-forces,resultant-of-forces,equilibrium-of-forces}/bundle.json` + `note.blocks.json` (all written 20 Sep 21:01, unchanged since).
Digests: `docs/dev/qa/pre-read/fm2c-<slug>.digest.txt` (21:10 on 20 Sep, newer than the bundles, so not regenerated), read in full; note prose and every figure dumped separately.

Probes (all re-runnable, in `C:\Users\feras\AppData\Local\Temp\claude\C--Users-feras-Downloads-CCEA-GCSE-Top-Learning-Platform\4355edb7-b61d-472c-a7be-db688e7e239b\scratchpad\preread-fm2c\`):

| script | what it does | result |
|---|---|---|
| `recompute.mjs` | every numeric answer and every numeric common error recomputed from the stems (g = 10) | 172 values, **0 disagreements** |
| `fm2c-math.mjs` | every "=" chain printed anywhere re-evaluated segment by segment | 7 mismatches, 5 of them real (below) |
| `mark.mts` | 708 attempts through `markAnswer` (accepted answers, solution values, i/j, bold, pmatrix, tuple, unicode minus, units, degree signs, wrong trig ratio, sign slips, magnitudes added, inverted angles, paraphrases, reversed answers); with `overrides.json` it re-marks the proposed fixes | 74 flagged as shipped; 27 after the fixes: 16 are working typed into a numeric box or a whole-number surd (refused by design), 4 are 1 d.p. answers the harness expected to fail but CCEA's own rule accepts, 7 are the trade-offs stated below |
| `struct.mts` | text hygiene, hero, words between gates, closing panel, gates through `markGate`, every option set, scheme sums, find-the-mistake shape | see per bundle |
| `ftm.mts`, `ftm-fd01.mts`, `ftm-engine.mts` | find-the-mistake fixes through `fixMatches`, current and proposed | see D4, R6, E8 |
| `westeps.mts` | every faded worked-example step typed through `stepLineMatches` | as shipped, 51 of 101 typed lines refused; 18 of the 36 supplied steps accept none of the lines tried |
| `svg-arrows.mjs`, `svg-arcs.mjs`, `arc-fix-check.mjs` | every arrow's direction and tip label, every angle arc's swept angle against its label | 1 arc wrong; 1 figure contradicts its stem |
| `nearcopy.mjs`, `nearcopy-cand.mjs` | 7-word runs shared with the CCEA FM2 papers, schemes and reports with numbers masked | 1 stem copied from a paper |
| `proposals.mjs` | every replacement number in this report recomputed, and checked not to collide with a value already printed | all fresh |

Official checks, run read-only: `npm run content:check` → "161 topic bundle(s) published, 0 problem(s), 0 key-word warning(s), 143 figure(s) printing an answer", and `grep -E "FIGURE .*fm2|published"` shows no FIGURE line for any of these four (the one fm2 line is `vector-magnitude-and-direction`, not in this batch). `node scripts/qa/figure-leaks.mjs --unit fm2` → "0 leaks in 51 figure(s)". `node scripts/qa/lesson-v2.mjs --unit fm2` → "14 note(s) checked, 0 breaches". `node scripts/qa/shingles.mjs --unit fm2` → 15 breaches, all in `ij-vector-calculations`, none in these four. `npm run insights:unregistered` → the 11 unregistered ids are in fm3 binomial and science, none here. The official tools are green; every finding below is something they cannot see.

Regexes and TeX below are quoted as decoded strings: in `bundle.json` every backslash is doubled (`\\b`, `\\sin`). Write fixes with the Write/Edit tools, never a heredoc or inline `node -e`.

Severity: **H** a correct learner is told she is wrong, a keyed answer is false, or an answer is printed on the page; **M** the marking, a scheme line or a teaching line cannot be relied on; **L** accuracy of a claim, a tag or a phrase.

---

## force-diagrams

### D1 (H) `q.fm.u2.force-diagrams.0012`: the figure's mass and weight contradict the stem, and (b) is marked on the stem's mass

Current: part (a) stem "a sledge of mass $15$ kg"; part (b) answer 93 (= 6.2 × 15). The figure prints `14 kg` on the sledge and `140 N` on the weight arrow, and its alt says "A sledge of mass 14 kg … 140 N points down".

Why it is wrong: she reads the mass off the diagram, as the note trains her to, and gets 6.2 × 14 = 86.8. Marked: `"86.8"` → 0/2, "That is not the expected answer". Source: `fm2-batch-c/t1-force-diagrams.mjs` lines 205–217 hard-code `bodyLabel: "14 kg"`, `{ deg: 270, label: "140 N" }` and `ALT_SLEDGE` with 14 kg / 140 N, while the question block (line 1225) uses `m = 15`.

Fix (verified by recompute): generator lines 207, 211 and 217 → `"15 kg"`, `"150 N"`, and the alt "A sledge of mass 15 kg … 150 N points down …". Nothing else changes: (b) stays 6.2 × 15 = 93, its common errors 6.2 and 930 stay as values.

### D2 (M) `q.0012` (b) and `q.0014` (d): the "rate × weight" slip is paid a method mark the scheme does not give

Current: `{ value: 930, marksTypicallyEarned: 1, misconception: "fm.forces.g-omitted-weight" }` (0012 b) and `{ value: 660, marksTypicallyEarned: 1, … }` (0014 d). Schemes: `MW1: $6.2 \times 15$`, `MW1: $5.5 \times 12$`.

Why it is wrong: 930 = 6.2 × 150 and 660 = 5.5 × 120 multiply by the weight, not the mass; the feedback itself says so ("The rate is given per kilogram of mass, so it is multiplied by 15"). The MW1 as written is not earned, yet `"930"` → 1/2 and `"660"` → 1/2. The tag is also the wrong way round: `g-omitted-weight` is "labels a weight with the mass"; this is the weight used as a mass, which the registry already has as `fm.connected.mass-force-confused` ("Uses weights … as masses").

Fix (verified): both → `marksTypicallyEarned: 0`, `misconception: "fm.connected.mass-force-confused"`. Re-marked: `"930"` → 0/2, `"660"` → 0/2, with the authored feedback and the new tag; `"93"`, `"66"` still full.

### D3 (M) Text parts that refuse correct answers (`q.0007`, `q.0011`, `q.0013` c, `q.0014` c, `q.0015` c, `q.0016` d)

Every line below was marked through `markAnswer` as shipped, then with the replacement groups in `overrides.json`.

- **`q.0007` (main)**, keyWords `["right angles to the slope","perpendicular to the slope","right angles to the surface","perpendicular to the surface"]`. `"at 90° to the slope"`, `"at 90 degrees to the slope"`, `"normal to the slope"`, `"perpendicular to the plane"` → 0/1 each.
  Fix: add `"90 to the slope"` (the degree sign is dropped before matching), `"90 degrees to the slope"`, `"normal to the slope"`, `"right angles to the plane"`, `"perpendicular to the plane"`, `"90 to the plane"`. After: all four → 1/1; `"vertically upwards"`, `"up the slope"`, `"at right angles to the ground"`, `"perpendicular to the horizontal"` still 0.
- **`q.0011` (main)**, keyWords `["no friction","no force due to friction","friction is not drawn","without friction"]`. `"friction does not act"`, `"There is no frictional force."`, `"the force due to friction is zero"`, `"friction is zero"` → 0/1.
  Fix: add `"friction does not act"`, `"no frictional force"`, `"friction is zero"`, `"zero friction"`, `"friction is not acting"`. After: all → 1/1; `"friction acts up the slope"` → 0.
- **`q.0013` (c)** "State why the normal reaction on the suitcase is smaller than its weight." Group 2 is `["smaller than the weight","less than the weight","does not have to support the whole weight"]`: two of its three phrases are the stem's own conclusion. So `"Because the floor is rough, the reaction is smaller than the weight."` (a wrong reason) → **1/2**, while `"The pull has a vertical component that holds up some of the weight, so R is less than W."` → 1/2 and `"R + 90 sin 32 = 150, so R is less than the weight"` → 1/2.
  Fix: make group 2 the mechanism the scheme's own W1 names ("so the floor supports less than the whole weight"): `["supports part of the weight","supports some of the weight","holds up part of the weight","holds up some of the weight","takes some of the weight","less to support","less to hold up","helps to support","helps support","helps to hold up","helps hold up","does not have to support the whole weight","r + 90 sin 32 = 150","r = 150 - 90 sin 32"]`; add `"90 sin 32"` to group 1; rewrite `accepted` to `["Part of the pull acts upwards and holds up part of the weight, so the normal reaction is smaller than the weight.", "The strap has a vertical component, which supports some of the weight, so the reaction is less than the weight."]`. After: the rough-floor answer → 0/2; the four mechanism answers → 2/2. Stated trade-off: the two old accepted sentences, which give only the vertical component and then restate the stem, now earn 1/2.
- **`q.0014` (c)** group 2 `["opposes the motion","opposes the sliding","against the motion","opposite to the motion"]`. `"down the slope, since friction acts opposite to the direction of motion"` → 1/2; `"down the slope, friction opposes motion"` → 1/2. The regex `\bup the (slope|plane)\b` also fires on correct answers that mention the motion: `"down the slope, because the box is now moving up the slope"` → 1/2 with the feedback "Up the slope is the way the box is now going… acts down the slope", a diagnosis of an error she did not make.
  Fix: group 2 add `"opposes motion"`, `"opposes the movement"`, `"against the direction of motion"`, `"opposite to the direction of motion"`, `"opposite direction to the motion"`; regex → `^(?!.*\bdown the (slope|plane)\b).*\bup the (slope|plane)\b`. After: both paraphrases → 2/2; the "moving up the slope" answer → 1/2 with the neutral "still missing opposes the motion"; `"up the slope"` → 0/2 with the authored diagnosis. Residual (engine, not content): `"Up the slope, because friction opposes the motion."` still earns 1/2, because key-word groups are presence-based and the W1's dependence on MW1 is not enforced.
- **`q.0015` (c)** group 1 `["the same at both ends","the same at each end","the same on both sides","equal at both ends"]`. `"The tension is the same throughout because…"`, `"The tensions are equal, as the string is light and the pulley smooth."`, `"T is equal on both sides because…"` → 1/2 each; and the reversed claim `"It is larger at the end nearer the heavier block, because the string is light."` → 1/2.
  Fix: group 1 add `"the same throughout"`, `"equal throughout"`, `"tensions are equal"`, `"tension is equal"`, `"equal on both sides"`, `"same tension"`; group 2 add `"pulley smooth"`, `"string light"`; both groups `reject: ["not the same","larger at","smaller at","bigger at","greater at"]` (not "different": "the same at both ends, not different" is a correct answer and would be cancelled). After: the three paraphrases → 2/2, `"…the same at both ends, not different, because the string is light."` → 2/2, the reversed claim → 0/2, `"It is not the same tension at both ends…"` → 0/2.
- **`q.0016` (d)** "The slope is smooth. State what this tells you about the surface, and name the force that is therefore not drawn." Group 1 is `["the slope is smooth","the surface is smooth","smooth surface"]`: the first mark is for copying the stem. `"The slope is smooth."` → 1/2; `"The slope is smooth, so the normal reaction is not drawn."` (wrong force) → 1/2; `"The surface exerts no force along itself, so friction is not drawn."` → 1/2.
  Fix: stem → "The slope is smooth. State what this tells you about the force the slope can exert on the trolley, and name the force that is therefore not drawn."; group 1 → `["only at right angles","only perpendicular","no force along","nothing along","only the normal reaction","only a normal reaction","only push at right angles","only pushes at right angles","no force parallel"]`; group 2 → `["no friction","no force due to friction","friction is not drawn","friction does not act","no frictional force","friction is zero"]`; `accepted` → `["The slope can only push at right angles to itself, so there is no friction on the trolley.","The surface exerts no force along itself, so no force due to friction acts."]`; MW1 "for" → "the slope can push only at right angles to itself". After: the stem echo → 0/2, the wrong force → 0/2, the two real answers → 2/2, `"No friction acts, so friction is not drawn."` → 1/2.

### D4 (M) Find-the-mistake: `ftm.fm.u2.force-diagrams.01` contradicts its own source, and neither .01 nor .02 can be fixed by typing

- **.01** Orla's line 3 `the component of the weight down the slope, $70\sin 30°$`, `marksEarnedAsWritten: ["MW1"]`, feedback "Three of the four entries are right, and the first mark for the diagram is safe", source `ccea-cer:further-maths:2024-summer:FM2:Q4`. That report records, for Q4(iii), that resolved components of the weight marked on the diagram were not penalised. A labelled component of the weight is exactly what line 3 is, so the item tells her she loses a mark CCEA did not take. The fix stage also cannot succeed: the fix is a deletion, and no typed line matches (`"delete line 3"`, `"remove it"`, `"there is no separate force down the slope"`, `"the force due to friction F, up the slope"` → all `none`), because the last correction line (`three forces in all, …`) carries no value and the others hold `$…$`.
  Fix (verified with `fixMatches`): recast to the error the same report names as often seen and does penalise, a weight not drawn vertically: `studentWorking` `["the weight, $70$ N, down the slope", "the normal reaction $R$, at right angles to the slope", "the force due to friction $F$, up the slope"]`, `mistakeLine: 1`, `misconception: "fm.forces.weight-misplaced"`, `whatWentWrong` "Line 1 tilts the weight with the slope. The Earth pulls straight down whatever the surface does, so the 70 N arrow is vertical; only its component, 70 sin 30° = 35 N, lies along the slope.", `correction: ["the weight, 70 N, vertically down"]`, `marksEarnedAsWritten: ["MW1"]`. Typed: `"the weight, 70 N, vertically down"` → line, `"W = 70 N, vertically downwards"` → value, `"70 N"` → value; `"35 N down the slope"` → none; the two unchanged lines → none.
- **.02** `correction` `["upward arrow: $R$", "downward arrow: $80$ N", "arrow along the string: $T$", "arrow against the motion: $F$"]`. Typed `"80 N"`, `"80"`, `"downward arrow: 80 N"`, `"W = 80 N"`, `"8 × 10 = 80 N"` → all `none` (the last line has no number, and `fixMatches` compares the `$` literally).
  Fix (verified): `correction: ["downward arrow: 80 N", "weight = 8 × 10 = 80 N"]`. Typed: `"80 N"`, `"80"`, `"W = 80 N"` → value; `"downward arrow: 80 N"`, `"8 × 10 = 80 N"` → line; the three unchanged lines → none.
- **.03** `correction` repeats the three unchanged lines, so retyping one of them (`"the weight acts vertically downwards"`) counts as "Fixed." Fix (verified): `correction: ["the normal reaction acts at right angles to the slope"]`; unchanged lines → none; the full corrected line → line. Residual (engine): `"perpendicular to the slope"` still does not match a prose correction.

### D5 (M) Faded worked examples: no step of any of the three can be typed

`we.…force-diagrams.01`, `.02`, `.03` fade steps [3,4] / [1–4], [3,4] / [1–4], [3,4] / [2–4]. All 11 supplied steps refuse every natural line (29 tried, 0 matched): e.g. step 1 of .01 refuses `"W = 6 × 10 = 60 N"` and `"60 N"` because its working ends in prose ("…= 60 N, drawn vertically from the centre."), and `stepLineMatches` only uses the value route when the step's last line ends on a result. Each refusal is recorded as a miss and holds her at the full example.

Fix (verified with `stepLineMatches`): end the numeric steps on their value, and fade only those.
- .01 step 1 → "The weight is drawn vertically from the centre: $W = 6 \times 10 = 60$ N." (`"W = 6 × 10 = 60 N"` → line, `"60 N"` → value).
- .02 step 1 → "Vertically downwards from the centre of the box: weight $= 9 \times 10 = 90$ N." (`"Weight = 9 × 10 = 90 N"` → line, `"W = 90 N"` → value).
- .03 step 3 → "On the $8$ kg block: tension $T$ up, and the weight down, $8 \times 10 = 80$ N." (`"W = 80 N"` → value).
- `faded` plans: supply only these steps, e.g. .01 `[{ showSteps: 0, studentSupplies: [1] }, …]`. The prose steps (R, T, F, "same letter T") cannot be matched by this engine at all; that needs an app-side input (a choice per step), which is a note for the lead, not content.

### D6 (M) `we.fm.u2.force-diagrams.02`: the worked example's figure does not show its forces

The stem asks her to name every force on a 9 kg box held by a rope on a smooth 24° slope, and the steps name the weight 90 N, R and T. The figure is the note's §3 teaching figure: only R and a dashed vertical arrow "not the reaction"; no weight, no rope, no T. Its alt begins "The same box on the 24 degree slope", which refers to nothing in the worked example.
Fix: give WE 02 its own `planeScene` figure (today it reuses `F_REACTION_SLOPE`, `t1-force-diagrams.mjs` lines 60–70): slope 24°, "smooth slope", body "9 kg", forces `R` at 114°, `90 N` at 270°, `T` at 24°; alt "A box of mass 9 kg held at rest on a smooth slope inclined at 24 degrees by a rope along the slope. R leaves the box at right angles to the slope, 90 N points straight down, and T points up the slope along the rope." (Directions checked against the existing slope figures: a 24° slope puts R at 114°.)

### D7 (L) `dx.fm.u2.force-diagrams.post` item 06: a distractor that is true when the blocks are at rest

Stem "Two blocks are joined by a light inextensible string passing over a smooth pulley. What is true of the tension?"; distractor d "it equals the weight of the hanging block", whose own feedback says "That is only true when the blocks are at rest". The stem does not say they move.
Fix: stem → "Two blocks are joined by a light inextensible string passing over a smooth pulley, and they are accelerating. What is true of the tension?" Option a stays true; d is then false.

### D8 (L) Note, examiner callout and one teaching line

- Block 27 (examiner callout) "about half the entry misses one of them" cites `2025-summer:FM2:Q6`. The "about half" figure belongs to Q4, where the report puts full marks for labelling the forces at around 50%; the Q6 paragraph lists the errors but gives no proportion. Fix: `source` → `ccea-cer:further-maths:2025-summer:FM2:Q4`.
- Block 12 "A surface cannot pull, and it cannot grip on its own: all it can do is push straight out of itself." A rough surface does grip; that grip is the friction the next block names. Fix: "A surface cannot pull. The part of its push that comes straight out of it is the normal reaction; any grip along it is friction, a separate force with its own label."
- `q.0014` (a(i)) "Three of the forces acting on the box are marked on the diagram." For a box sliding down a rough slope with nothing attached, those three are all the forces, and "three of" implies a fourth. Fix: "The three forces acting on the box are marked (i), (ii) and (iii) on the diagram."

### D9 (L) Tags and a duplicated twin

- Every g = 9.8 common error (29.4, 245, 117.6, 147, 68.6, 107.8, 196; `q.0010` option "$78.4$ N"; post-check 03 "$117.6$ N") is tagged `fm.forces.g-omitted-weight`, "Labels a weight with the mass". A learner who uses 9.8 is logged with a misconception she does not have. The registry has no g-value id; add one (for example `fm.forces.g-not-ten`) or tag nothing. The "rate on its own" errors (6.2, 5.5) carry the same wrong tag.
- `q.0015` (a(i)) common error `^tension$` is tagged `tensions-same-label`; the slip is naming the reaction a tension (`extra-forces-added`, as the other label parts use).
- `we.…01` twin (11 kg → 110 N) is `q.0015` (d) (the 11 kg hanging block → 110 N). Fix: twin mass 16 kg → 160 N (no item uses it).
- `ftm.…03` (reaction drawn vertical on a slope) cites 2025 Q6, which does not itemise that error; the registry note concedes the inference. Low, recorded for the evidence trail.

**Clean in this bundle:** all 10 numeric answers and 28 error values recompute, and both numeric twins (110, 130); all 14 label parts mark right for every bank name, and every `^name$` pattern fires only on its own wrong name; all five MCQ parts and both diagnostics have one correct option, distinct texts, feedback and tagged distractors; every arrow points where its alt says and every slope arc sweeps its labelled angle; no figure prints a part's answer; hero, 3 can-lines, 8 minutes, gaps between gates 64–149 words, closing panel 69 words, "You can now" present.

**Verdict: force-diagrams — hold. Fix before a learner sees it: D1 (the figure's mass contradicts the stem), D3 (six text parts refuse correct answers) and D4 (FTM .01 contradicts its source; the .01/.02 fixes cannot be typed). The physics is right.**

---

## resolving-forces

### R1 (H) `dx.fm.u2.resolving-forces.post` item 03 has two correct options

Stem "A force of $24$ N acts at $40°$ to the vertical. Which expression gives its horizontal component?" Option a `$24\sin 40°$` is correct. Option c `$24\cos 50°$` is marked wrong, with the feedback "This one is the same value by a longer route, but it needs 50° from the horizontal, which the question does not give." But 24 cos 50° = 24 sin 40° = 15.43 (recomputed). A force at 40° to the vertical is at 50° to the horizontal, so c is a correct expression, and choosing it is marked as a misconception (`angle-from-wrong-line`).
Fix (verified): option c → `$24\sin 50°$` (= 18.39, the vertical component again), feedback "That takes the 50° from the horizontal but then the sine of it, which gives the vertical part, the same as 24 cos 40°. The horizontal part is 24 sin 40°."

### R2 (H) `q.fm.u2.resolving-forces.0010` (c): the answer is printed in the note and the method on the question's own figure

The question figure is the note's §4 figure (block 16): a 75 N arrow at 32° to a 21° slope, with dashed components labelled `75 cos 32°` and `75 sin 32°`. The note's block 17 then says "the component along the slope is $75\cos 32° = 63.6$ N". Part (c): "The pull along the rope is $75$ N and the rope makes an angle of $32°$ with the ramp. Calculate the component of this pull acting along the ramp." Scheme M1 "the angle … identified as 32°", M2 "$75\cos 32°$", W1 "63.6". She has read all three marks before she starts. (`figure-leaks.mjs` tests values and names, not expressions.)
Fix (verified by `proposals.mjs`): give (c) fresh numbers and an unannotated figure. The rope is 68 N at 29° to the ramp, drawn at 21 + 29 = 50°, labels `68 N` and `29°` only. Answer 68 cos 29° = **59.47**; common errors: sin 68 sin 29° = 32.97, and angle taken from the horizontal 68 cos(29° − 21°) = 67.34. The generator's `t2-resolving.mjs` lines 105–117 then serve the note alone.

### R3 (H) `q.fm.u2.resolving-forces.0011`: the 55° arc marks a 125° angle

Figure: `<path d='M115.9 154A54 54 0 0 1 71.7 69' …/>` with the label `55°` at (54.7, 135.9). Measured (`svg-arcs.mjs`): the arc starts on the **downward** vertical and sweeps 125° round the left to the 28 N arrow. The stem says 55° to the vertical and the answer uses 28 sin 55°. A learner who reads the arc sees the angle measured from the downward vertical, which is exactly the "which line is the angle from" confusion this topic teaches against.
Root cause: `fm2-batch-c/svg.mjs` line 486 picks the reference with the left-half test: `f.angleFrom === "vertical" ? (f.deg > 90 && f.deg < 270 ? 270 : 90)`. For "vertical" the test must be the upper half: `(f.deg > 0 && f.deg < 180 ? 90 : 270)`. (The only other `angleFrom: "vertical"` force in the batch, equilibrium `q.0010`'s 26 N at 50°, is drawn correctly by luck.)
Fix (verified by `arc-fix-check.mjs` on a patched copy): arc `M115.9 46A54 54 0 0 0 71.7 69` sweeps 54.9° from the upward vertical; label to (86, 38), next to the arc's midpoint (83.5, 37.7).

### R4 (M) The sin/cos common-error feedback on slope parts describes the wrong component

The template "That is $X\cos\theta$, the component along the line. The one at right angles is opposite the angle, so it takes the sine." is used where the part asks about a ramp:
- `q.0003` (a) value 133.15: "That is $140\cos 18°$, the component along the line…" (the part asks for the component down the ramp; 140 cos 18° is the component **into** the ramp).
- `q.0003` (b) value 43.26: "That is $140\sin 18°$, the component at right angles. The one along the line…" (the part asks for the component at right angles to the ramp; 140 sin 18° is the one **down** it, so the feedback calls her wrong answer "at right angles", the very words of the question).
- `q.0008` value 184.51 and `q.0010` (a) value 149.37: same as `q.0003` (a); `q.0010` (b) value 57.34: same as `q.0003` (b).
Fix: the equilibrium bundle's wording, which is right. For (a)-type parts: "That is $140\cos 18°$, the component pressing into the ramp. Down the ramp is opposite the ramp's angle, so it takes the sine." (with 220 cos 33°, 160 cos 21°). For (b)-type parts: "That is $140\sin 18°$, the component down the ramp. Into the ramp sits beside the ramp's angle, so it takes the cosine." (with 160 sin 21°). The values are right (recomputed); only the words change.
Also `q.0005` value 48.3 (= 50 cos 15°): "That measures the rope's angle from the horizontal and then resolves along the slope." The slip is taking the 35° as an angle to the horizontal and subtracting the slope's 20°. Fix: "That treats the 35° as the rope's angle to the horizontal and takes the slope's 20° off it. The 35° is already measured from the slope, so use it as it is." (as `q.0010` (c) already words it).

### R5 (M) Common errors that pay marks the scheme does not give

- `q.0010` (c) value 73.62, `marksTypicallyEarned: 1`, scheme M1 "the angle between the rope and the ramp identified as $32°$". The slip is failing to identify that angle, so M1 is not earned. Fix: `marksTypicallyEarned: 0` (after R2's renumbering the value is 67.34). Verified: → 0/3.
- `q.0011` (c) value 58.4, `marksTypicallyEarned: 2`, feedback "Both components are right, so the method marks (M) stand". Scheme M1 "the leftward component taken as negative", M2 "$45\cos 38° - 28\sin 55°$ ft": the added answer earns neither. Fix: M1 "for" → "both horizontal components used (from (a) and (b)) ft", `marksTypicallyEarned: 1`, feedback "Both components are right, which earns the first method mark (M), but the second force pulls to the left, so its component is subtracted." Verified: → 1/3.

### R6 (M) `ftm.fm.u2.resolving-forces.01`: the reason she is shown names the wrong line

The app shows the first sentence of `whatWentWrong` as the reason (`firstSentence`; no `reasonOptions` are passed in the app). That sentence is "Line 2 is the right rule, but it needs the angle between the force and the line being resolved along." The mistake line is 3, and the sentence does not say what line 3 did.
Fix: `whatWentWrong` → "Line 3 takes the cosine of an angle measured from the vertical, which gives the vertical component, not the horizontal one. The horizontal is at right angles to the vertical, so it is opposite the 50° and takes the sine." (`fixMatches` is unaffected: `"30 sin 50 = 22.98"`, `"22.98"`, `"22.98 N"` → value; the unchanged lines → none.)

### R7 (M) Faded worked examples: three steps cannot be typed

`we.…01` step 1 (prose triangle) and step 4 "Check: $37.08^2 + 19.72^2$ comes back to $42^2$, as it must." (`"√(37.08² + 19.72²) = 42.00"`, `"42"` → none); `we.…02` step 2 "…equals the slope's angle, $24°$." (`"angle = 24"`, `"24°"` → none).
Fix (verified): 01 step 4 → "Check: the size of the pull is $\sqrt{37.08^2 + 19.72^2} = 42.00$ N." (all four lines → value); 02 step 2 → "The angle between the weight and the line into the slope is the slope's own angle: $\theta = 24°$." (`"angle = 24"`, `"24°"` → value); 01 `faded[1]` → `{ showSteps: 1, studentSupplies: [2, 3, 4] }` so the prose step 1 is not supplied.

### R8 (L) "In the exam" (block 27) states a wording CCEA does not use

"A resolving part is worth 2 or 3 marks and is usually worded 'Calculate the component of ...' or 'Calculate the normal reaction'." No FM2 paper from 2019 to 2026 asks "Calculate the component of" (searched all eight); resolving sits inside "Calculate the normal reaction" (2 marks in 2023 Q3 and 2025 Q6, 4 in 2019 Q3) or "Calculate the value of P / W" (2 in 2021 Q1, 3 in 2024 Q3 and 2026 Q2).
Fix: "Resolving is rarely asked for on its own: it sits inside 'Calculate the normal reaction' or 'Calculate the value of P', worth 2 to 4 marks. The first mark is for a correct resolved component written down; the last is for the value, to 2 decimal places. Stuck? Draw the right-angled triangle, mark the angle, and ask which side of it you want." (63 words.)

### R9 (L) Twins that repeat bank questions

`we.…01` twin (36 N at 65° → 15.21) is `q.0002` word for word in substance; `we.…02` twin (14 kg on 18° → 43.26) is `q.0003` (a). Fix (recomputed, fresh): twin 1 → 44 N at 57°, 44 cos 57° = **23.96**; twin 2 → 17 kg on 26°, 170 sin 26° = **74.52**.

**Clean in this bundle:** all 18 answers and 27 error values recompute, and both twins (15.21, 43.26); every "Round to 2 decimal places" part rejects 3 d.p. and 1 d.p. and accepts the 2 d.p. value with and without N (the scheme's "42.4", "26.5", "63.6" are accepted with a reminder, which CCEA's own rule allows: the 2021 FM2 scheme's general instructions accept a dropped final zero on a 2 d.p. answer); no radian value scores; gates g2 and g5 accept 10 / 16 with or without N; hygiene clean; hero, 6 minutes, gaps 74–126 words, closing panel 60 words.

**Verdict: resolving-forces — hold. R1 (a post-check with two right answers), R2 (answer printed in the note and the method on its own figure) and R3 (a figure marking the wrong angle) must be fixed; R4 is a wording pass. The resolving itself is exact.**

---

## resultant-of-forces

### T1 (H) `q.fm.u2.resultant-of-forces.0008` (d): the value the printed working gives is marked wrong

Worked solution: "$\tan^{-1}\dfrac{16.31}{20.61} = 38.37°$". Evaluated: tan⁻¹(16.31 / 20.61) = **38.357°**, which is 38.36; 38.37 comes only from the unrounded totals (16.314 / 20.607). Tolerance `dp 2` on 38.37 → `"38.36"` → **0/2**, "Close, but not accurate enough". Her (a) and (b) answers were right to 2 d.p., the scheme says "ft", and CCEA's own general marking instructions (2021 FM2 scheme) tell examiners to ignore slight rounding errors that come from working with 2 d.p. values.
Fix (verified): solution → "$\tan^{-1}\dfrac{16.314}{20.607} = 38.37°$ above the horizontal (from the rounded totals, 38.36°, is also accepted)"; tolerance → `{ "type": "range", "min": 38.36, "max": 38.37 }`. Re-marked: 38.36 and 38.37 → 2/2; 38.35, 38.38, 38.4 → 0/2; 51.63 → 0 with the inverted-ratio feedback. (Trade-off: a range drops the 2 d.p. demand, so 38.365 also passes; the feedback card shows "38.36 to 38.37 °".)

### T2 (H) Note gate g2 is `q.fm.u2.resultant-of-forces.0001` with its answer shown

Gate g2 (block 9): "Two forces are $(5\mathbf{i} - 2\mathbf{j})$ N and $(-3\mathbf{i} + 7\mathbf{j})$ N. What is their resultant?", explain "…so the resultant is $2\mathbf{i} + 5\mathbf{j}$ N." `q.0001` is the same two forces, answer 2i + 5j.
Fix (verified with `markGate`): gate → $(8\mathbf{i} - 3\mathbf{j})$ N and $(-5\mathbf{i} + 7\mathbf{j})$ N, answer `3i + 4j | 3i+4j | 4j + 3i | 3i + 4j N | 3i+4j N`, explain "$8 - 5 = 3$ across and $-3 + 7 = 4$ up, so the resultant is $3\mathbf{i} + 4\mathbf{j}$ N." Accepted: `3i + 4j`, `3i+4j`, `4j + 3i`, `(3i + 4j) N`, `3i + 4j N`, `(3i+4j) N`; refused: `3i - 4j`, `3i + 5j`, and the old `2i + 5j`. The two "N" alternatives also cure the shipped gate's refusal of `(2i + 5j) N` and `2i + 5j N`, the form the note itself writes forces in (tested: both → miss today).

### T3 (M) Scheme lines that the common errors contradict; one missing error

- `q.0006` (a) MW1 "$22\cos 35° - 14$" and `q.0008` (a) MW1 "$25 + 18\cos 65° - 12$": the sign-slip errors 32.02 and 44.61 earn 1 mark, with the feedback "The resolved component is right, which earns the method mark (M)". As written the MW1 is the whole correct expression, which the slip does not contain. Fix: MW1 "for" → "the angled force resolved horizontally, $22\cos 35°$" and "…$18\cos 65°$"; the 1 mark then matches the scheme.
- `q.0006` (c) has no root-omitted error, unlike every other magnitude part (`q.0002` a, `q.0004`, `q.0005` a, `q.0007` b, `q.0008` c): `"175.42"` → 0/2, "That is not the expected answer". Fix (verified): add `{ misconception: "fm.vectors.magnitude-root-omitted", pattern: { kind: "numeric", value: 175.42, tolerance: { type: "absolute", value: 0.03 } }, feedback: "That is the sum of the squares, so the method mark (M) stands. The square root finishes it.", marksTypicallyEarned: 1 }` (the tolerance covers 175.40 from the unrounded totals). → 1/2.

### T4 (M) Faded worked examples: two steps cannot be typed

`we.…01` step 2 "…so the resultant is $12\mathbf{i} + 5\mathbf{j}$ N." (`"-4 + 7 + 2 = 5"`, `"R = 12i + 5j"` → none: the line ends in `\mathbf{j}$ N`) and step 4 "…$= 22.62°$ above the positive x-axis." (`"22.62"`, `"tan^-1(5/12) = 22.62"` → none).
Fix (verified): step 2 → "So the resultant is $12\mathbf{i} + 5\mathbf{j}$ N, since the $\mathbf{j}$ parts give $-4 + 7 + 2 = 5$." (`"-4 + 7 + 2 = 5"`, `"R = 12i + 5j"` → value); step 4 → "Measured from the positive x-axis, the angle $= \tan^{-1}\dfrac{5}{12} = 22.62°$." (all four lines → value).

### T5 (L) Printed arithmetic that does not hold, and two claims

- `we.…02` step 3 "$\sqrt{35.43^2 + 18.39^2} = 39.91$ N": from the printed values it is 39.918, i.e. 39.92; 39.91 needs the unrounded 35.427 and 18.385. The step's own why-menu teaches "rounding twice moves the answer away". Fix: "Magnitude $= \sqrt{35.427^2 + 18.385^2} = 39.91$ N." (`stepLineMatches` still accepts 39.91 and 39.92.)
- `dx.…pre` item 02 option "$\sqrt{28}$", feedback "That squares the sum instead of summing the squares." Squaring the sum gives (8 + 6)² = 196; √28 comes from doubling each side, 2 × 8 + 2 × 6 = 28. Fix: "That doubles each side instead of squaring it: $2 \times 8 + 2 \times 6 = 28$."
- "In the exam" (block 27) "…then its magnitude for 3 or 4 marks and its direction for 2." Papers: magnitude 2 marks (2022 Q2(ii)), 3 marks (2024 Q2(ii), 2025 Q2(ii)). Fix: "…then its magnitude for 2 or 3 marks and its direction for 2."

**Clean in this bundle:** all 14 numeric answers and 24 numeric error values recompute, and the three i/j answers, six i/j errors and both twins (4i + 5j, 25) check by hand; every i/j answer accepts `2i + 5j`, `2i+5j`, `(2i + 5j) N`, `2i + 5j N`, `2\mathbf{i} + 5\mathbf{j}`, the column vector, `(2, 5)`, reordered, unicode minus, spaced and `R = …`, and refuses swapped components, a sign slip and the magnitude; both subtract-instead-of-add errors and all sign-dropped errors fire with the right marks; angles accept `°` and "degrees" and refuse radians and the inverted ratio; the formula-sheet claim in block 16 is right (Unit 2 sheet: |xi + yj| = √(x² + y²), θ = tan⁻¹(y/x)); figures and arcs all agree with their alts; hygiene clean; gaps 60–134 words, closing panel 73 words.

**Verdict: resultant-of-forces — nearly ready. T1 (a correct ft answer scores 0) and T2 (a practice answer shown in a gate) must be fixed; the rest is a short pass.**

---

## equilibrium-of-forces

### E1 (H) `q.0008` (main) and `q.0011` (a): "not accelerating" scores 0 and is told it is wrong

Group 1 `["the acceleration is zero","no acceleration","acceleration of zero"]`, group 2 `["the forces balance","the resultant force is zero","the resultant is zero"]`, regex `\b(speeding up|accelerating|driving force is (larger|greater))\b`.
`"It is not accelerating, so the forces are balanced."` → **0/2** on both parts, with the feedback "A steady speed is not a changing one. Nothing is left over to accelerate the box…", which tells a learner who is right that she is wrong. Also `"zero acceleration, so no resultant force"` → 0/2; `"a = 0, so the resultant force is 0"` → 0/2; `"There is no acceleration, and the forces are in equilibrium."` → 1/2.
Fix (verified, both parts): group 1 add `"zero acceleration"`, `"does not accelerate"`, `"not accelerating"`, `"a = 0"`, `"acceleration = 0"`, `"acceleration is 0"`; group 2 add `"forces are balanced"`, `"balanced forces"`, `"no resultant force"`, `"zero resultant"`, `"resultant force = 0"`, `"resultant force is 0"`, `"net force is zero"`, `"in equilibrium"`, with `reject: ["not in equilibrium","do not balance","not balanced","does not balance"]`; regex → `\b(it|the box|box) is (speeding up|accelerating)\b|\bdriving force is (larger|greater)\b`. After: all four answers → 2/2; `"It is accelerating, so the driving force is larger."` → 0 with the authored feedback; `"It is not in equilibrium because it is moving."` → 0/2.

### E2 (H) Three questions whose answers are printed in the note

- `q.0003` (7 kg crate on a rough 18° slope; answers 21.63, 66.57): the note's §5 (blocks 21–22) is the same crate with the same figure and says "$F = 70\sin 18° = 21.63$ N up the slope, and $R = 70\cos 18° = 66.57$ N".
- `q.0012` (14 kg on a smooth 27° slope; 63.56, 124.74): the note's §4 (blocks 17–18) prints both values, and `we.…02` is the same box.
- `q.0013` (20 N right, 15 N down, P at θ; 25, 36.87°): the note's first figure (block 3) is labelled `25 N` and `36.87°`, and `we.…03` is the same particle, figure and stem.
Fix (recomputed; every new value checked absent from all four bundles): `q.0003` → 11 kg on a rough 16° slope: F = 110 sin 16° = **30.32**, R = 110 cos 16° = **105.74**; errors: sin/cos swapped 105.74 / 30.32, whole weight 110. `q.0012` → 15 kg on a smooth 32° slope: T = 150 sin 32° = **79.49**, R = 150 cos 32° = **127.21**; errors 127.21 / 79.49 swapped, 150 whole. `q.0013` → 45 N right and 28 N down: P = **53**, θ = tan⁻¹(28/45) = **31.89°**; errors: added 73, P² 2809, inverted 58.11, magnitude-for-angle 53. Each figure regenerated with its new labels.

### E3 (H) `q.0010` (a) and (b): false arithmetic in the worked solutions, and the values it gives are marked wrong

Worked solutions: (a) "$W = 19.92 - 5.26 = 14.65$ N" (19.92 − 5.26 = **14.66**); (b) "$P = … = 16.71 + 17.21 = 33.93$ N" (16.71 + 17.21 = **33.92**). A learner who works exactly as printed types 14.66 and 33.92: both → **0/3**, "Close, but not accurate enough". CCEA's own instruction is to ignore rounding that comes from 2 d.p. intermediates (2021 FM2 general marking instructions).
Fix (verified): solutions "…so $W = 19.917 - 5.263 = 14.65$ N." and "…$= 16.712 + 17.214 = 33.93$ N."; tolerances `{ type: "range", min: 14.65, max: 14.66 }` and `{ type: "range", min: 33.92, max: 33.93 }`. Re-marked: 14.65, 14.66 → 3/3; 14.64, 14.67, 14.7 → 0/3; 33.92, 33.93 → 3/3; 33.91, 33.94, 33.9 → 0/3.

### E4 (M) `q.0010`: sign slips paid two marks where CCEA's scheme gives one; a missing error; a stale program; a copied stem

- (a) value 25.18 and (b) value −0.5 carry `marksTypicallyEarned: 2` ("Both components are right, so the method marks (M) stand"). The scheme is M1 "resolving … and equating the totals", MW1 the correct equation, W1 the value, the same structure as CCEA's own scheme for this question type (2024 FM2 Q3: M1 and MW1 for resolving and equating vertically, then W1 for the value). A wrong-signed equation earns M1 only. Fix (verified): both → `marksTypicallyEarned: 1`, feedback "Resolving vertically and equating earns the method mark (M), but the $18$ N force pulls downwards, the same way as $W$, so it is on the same side of the equation." / "Resolving horizontally and equating earns the method mark (M), but the two angled forces push the same way, so their horizontal parts add rather than cancel." → 1/3 each.
- (b) has the "26 N left out" error (17.21 → 1) but not its twin: `"16.71"` (18 N left out) → 0/3. Fix (verified): add `{ misconception: "fm.forces.term-missing-from-equation", pattern: { kind: "numeric", value: 16.71, tolerance: { type: "dp", places: 2 } }, feedback: "That leaves the $18$ N force out of the horizontal equation. Its horizontal part pushes the same way as the $26$ N force's, so both belong.", marksTypicallyEarned: 1 }` → 1/3.
- `solutionProgram` is "W = 26 * cos(40 deg) - 18 * sin(15 deg); P = 26 * sin(40 deg) + 18 * cos(15 deg)", with 15° where the stem, figure and answers use 17° (it gives W = 15.26, P = 34.10). Fix: 15 → 17 in both.
- The (a) stem is the 2024 FM2 Q3 stem, sentence for sentence, with the numbers changed: 40 of its 7-word runs (46 words) match that paper once numbers are masked (`nearcopy.mjs`; compare `docs/sources/papers/further-maths/2024-Summer/FM2-Paper-42727.txt` lines 127–131). The shingle test misses it because the numbers differ. Fix (verified 0 shared runs): "Four forces keep the point $O$ in equilibrium, as the diagram shows: a horizontal force of $P$ N, a downward force of $W$ N, a $26$ N force pulling $40°$ off the vertical, and an $18$ N force pulling $17°$ below the horizontal.\n\nCalculate the value of $W$. Round to 2 decimal places.\n\nAnswer ________ N"

### E5 (M) "Rests on a smooth slope" with nothing holding it: impossible, and the keyed answer depends on what holds it

`q.0009` "A box of mass $16$ kg rests on a smooth slope inclined at $35°$ to the horizontal. Calculate the normal reaction…" (answer 160 cos 35°); post-check item 04 "A box of weight $150$ N rests on a smooth slope inclined at $30°$…" (keyed $150\cos 30°$); note gate g4 "A box rests on a smooth slope. How does the normal reaction on it compare with its weight?" (keyed "smaller"); and in force-diagrams, `we.…02`'s twin "A box of mass $9$ kg rests on a smooth slope." A body cannot rest on a smooth slope under its weight and the reaction alone. If a horizontal force holds it, R = W / cos α: 150 / cos 30° = 173.2 N, larger than the weight, so the keyed answers are false in that reading. Note block 18 adds "The reaction is less than the weight, which is true on every slope", which is false in the same case.
Fix: each stem → "…is held at rest on a smooth slope … by a rope parallel to the slope." (generator lines `t4-equilibrium.mjs` 321, 669, 1308; `t1-force-diagrams.mjs` 533). Block 18 → "…The reaction is less than the weight here: only $W\cos\alpha$ presses into the slope, and $\cos\alpha$ is less than 1."

### E6 (M) `q.0002`, `q.0004`, `q.0012` (c): correct answers under-marked

- **`q.0002`** "State what this tells you about the resultant of the forces, and about the acceleration." `"The resultant force is zero and the acceleration is zero."` → 1/2; `"The forces balance, so it does not accelerate."` → 1/2; `"The net force is zero and there is no acceleration."` → 1/2; `"Resultant = 0 and a = 0"` → 0/2; `"zero resultant force, zero acceleration"` → 0/2. Fix (verified): group 1 add `"resultant force is zero"`, `"zero resultant"`, `"net force is zero"`, `"resultant = 0"`, `"resultant force = 0"`, `"no resultant force"`, `"forces are balanced"`; group 2 add `"zero acceleration"`, `"does not accelerate"`, `"not accelerating"`, `"a = 0"`, `"acceleration = 0"`, `"acceleration is 0"`. After: all five → 2/2; `"It is at rest."` → 0; `"The forces are not balanced, so it accelerates."` → 0.
- **`q.0004`** group 2 `["balances the component of the weight","would otherwise slide down","opposes the sliding","stops it sliding down"]`. `"Up the slope, because otherwise the crate would slide down the slope."` → 1/2, and the regex `\bdown the (slope|plane)\b` fires on it: "Down the slope is the way the crate would slide. Friction works against that…". Also `"up the slope, to stop the crate sliding down"`, `"…opposes the tendency of the crate to slide down"`, `"…friction opposes the motion the crate would have"` → 1/2. Fix (verified): group 2 add `"otherwise the crate would slide"`, `"otherwise it would slide"`, `"stop the crate sliding"`, `"stop it sliding"`, `"prevents it sliding"`, `"prevent it sliding"`, `"tendency to slide"`, `"opposes the tendency"`, `"opposes the motion"`; regex → `^(?!.*\bup the (slope|plane)\b).*\bdown the (slope|plane)\b`. After: all four → 2/2; `"Down the slope, because the crate would slide down."` → 0/2 with the authored diagnosis; `"up the slope"` → 1/2.
- **`q.0012` (c)** `"R = 140 cos 27, and cos 27 is less than 1, so R is less than the weight."` → 0/2; `"The reaction only balances the component of the weight perpendicular to the slope, 140cos27, which is less than 140."` → 0/2; `"Only the component … at right angles to the slope presses on it; the rest is balanced by the tension."` → 1/2. Fix (verified): group 1 add `"component of the weight perpendicular"`, `"perpendicular component"`, `"140 cos 27"`, `"w cos 27"`, `"only balances the component"`; group 2 add `"less than 1"`, `"less than one"`, `"the rest is balanced by the tension"`, `"the rest is held by the tension"`, `"not all of the weight"`. After: the cosine answer and the tension answer → 2/2, the "perpendicular … less than 140" answer → 1/2 (it restates the stem for its second point); `"The reaction equals the weight."` and `"Because the slope is smooth."` → 0. (After E2, "140 cos 27" becomes "150 cos 32".)

### E7 (M) Post-check item 08: two feedback lines state false mathematics

Stem "Which pair of directions makes an equilibrium problem on a slope shortest to solve?" Distractor "along the slope and vertical", feedback "Those two are not at right angles, so the two equations would not be independent." Distractor "any two directions at all", feedback "They have to be perpendicular, or one equation repeats part of the other." Any two non-parallel directions give two independent equations; perpendicular directions are only the shorter route. The options stay wrong (the question asks for the shortest); only the reasons are false.
Fix: "That can be solved, but the two directions are not at right angles, so every force has to be resolved into both and the working grows." and "Two different directions do give two equations, but unless they are at right angles each force has to be resolved awkwardly; perpendicular ones keep every equation short."

### E8 (M) Find-the-mistake: numbers from a real paper, and corrections that accept unchanged lines

- `ftm.…01` and post-check item 06 use the 2019 FM2 Q3 scenario (a 5.8 kg block, weight 58 N, pulled by 17 N at 33°) and the exact wrong equation the 2019 report singles out as very common (R = 17 sin 33°). STANDARDS: nothing copied from a paper. The stem also says "held still on a table by a rope", but a rope pulling at 33° cannot hold a block still on its own.
  Fix (recomputed; stem verified 0 shared runs): "Eoin is finding the normal reaction on a block of weight $64$ N resting on a rough table. A rope pulls the block at $38°$ to the table with a force of $19$ N, and the block does not move. His working:", lines "the block does not move, so the vertical forces balance" / "resolving vertically: $R = 19\sin 38°$" / "$R = 11.70$ N"; `whatWentWrong` with 19 sin 38° and 64 N; `correction: ["R + 19 sin 38° = 64", "R = 64 − 11.70 = 52.30 N"]` (19 sin 38° = 11.70; R = 52.30, the same from the unrounded 11.697). Post-check 06 with the same numbers.
- `ftm.…01` and `.02` corrections list the unchanged first line, so retyping it ("the block does not move, so the vertical forces balance") counts as "Fixed."; resultant `ftm.…01` and force-diagrams `ftm.…03` have the same problem (see D4). Fix (verified): `.01` correction as above; `.02` → `["resolving at right angles to the slope: $R = 110\cos 24°$", "$R = 100.49$ N"]`; resultant `.01` → `["$\mathbf{j}$: $-2 + 9 = 7$", "resultant $= \mathbf{i} + 7\mathbf{j}$ N"]`. Re-run: every unchanged line → none; `.01` (new numbers) `"R = 52.30"`, `"52.3"`, `"52.30 N"` → value and `"R + 19 sin 38° = 64"` → line, while the wrong `"R = 11.70 N"` → none; `.02` `"100.49"`, `"R = 110 cos 24° = 100.49"` → value; resultant `.01` `"-2 + 9 = 7"`, `"7"` → value.

### E9 (M) Faded worked examples: two steps cannot be typed

`we.…01` step 1 "Weight $= 6 \times 10 = 60$ N, acting vertically downwards." (`"W = 6 × 10 = 60 N"`, `"60"` → none) and `we.…02` step 4 "Check: $124.74$ N is less than the weight of $140$ N, as it must be on a slope." (`"124.74 < 140"`, `"R is less than the weight"` → none; it is supplied in both fades).
Fix (verified): 01 step 1 → "Acting vertically downwards, weight $= 6 \times 10 = 60$ N." (→ line / value); 02 `faded` → `[{ showSteps: 2, studentSupplies: [3] }, { showSteps: 1, studentSupplies: [2, 3] }]`.

### E10 (L) Twins that repeat bank questions, and a beyond-spec explanation

- `we.…01` twin (80 N; 50 N at 30° → 55) is `q.0005` (a); `we.…02` twin (12 kg on 20° → 41.04) is `q.0001` (a); `we.…03` twin (12 N, 5 N → 13) is `q.0007`. Fix (recomputed, fresh): 90 N with 40 N at 35° → 90 − 40 sin 35° = **67.06**; 13 kg on 22° → 130 sin 22° = **48.70**; 15 N right and 8 N up → **17**.
- `we.…03` step 3 decision "Squaring and adding removes the angle, because $\cos^2\theta + \sin^2\theta = 1$." That identity is not on the CCEA FM specification (FM1 trigonometry is graphs and simple equations only), and `q.0013` (a)'s hint repeats "Squaring and adding removes the angle." CCEA's own route for this shape (2021 FM2 scheme Q1) is to resolve and use a ratio. Fix: decision "$P\cos\theta$ and $P\sin\theta$ are the two shorter sides of a right-angled triangle whose longest side is $P$, so Pythagoras gives $P^2 = 20^2 + 15^2$."; hint "The two components are the shorter sides of a right-angled triangle with $P$ as its longest side."

**Clean in this bundle:** all 16 answers and 35 error values recompute (T, R, F, W, P, θ), and the three twins (55, 41.04, 13); the MCQ part and both diagnostics have one correct option, distinct texts and feedback; the regexes in `q.0002` and `q.0012` (c) never fire on a correct answer; every arrow and arc matches its alt (the 40° and 17° arcs in `q.0010` sweep exactly those angles); hygiene clean; gaps 60–139 words, closing panel 65 words; the examiner callout (2019 Q3, two-term equations and R = W) and post-check 05 (2024 Q3, one mark for a resolved component) match the reports.

**Verdict: equilibrium-of-forces — hold. E1 (a correct answer scored 0 and told it is wrong), E2 (three answers printed in the note), E3 (false printed arithmetic, and the value it gives marked wrong) and E5 (a keyed answer false under the stem as written) must be fixed; E4 includes a stem copied from the 2024 paper.**

---

## Notes for the lead (app side, not content)

1. `fixMatches` compares correction lines with their `$…$` delimiters and does not strip labels such as "resolving vertically:", so typed equations rarely line-match (`"R + 17 sin 33° = 58"` against `resolving vertically: $R + 17\sin 33° = 58$` → none). `stepLineMatches` already runs `workingLines` (`mdToPlain` + `asTyped`); doing the same in `fixMatches` would make `"R = 110cos24"` match (tested). Prose fixes and prose worked-example steps cannot be matched by this engine at all (D4, D5).
2. Text key-word marking is presence-based and ignores `dependsOn`, so a reversed direction with the right reason earns the reason's mark (`q.fm.u2.force-diagrams.0014` (c): `"Up the slope, because friction opposes the motion."` → 1/2 even after the fix).
3. Numeric answer boxes cannot read working (`"3 × 10 = 30"`, `"θ = 36.87°"` → "could not be read"), and a whole-number surd (`"√225"`) is refused under `acceptForms: ["decimal","fraction"]`. Both are by design; recorded because 16 of the 27 lines still flagged after the fixes are these.
4. A `range` tolerance drops the 2 d.p. demand and shows "14.65 to 14.66 N" as the expected answer. If a "value, also accept" field is wanted, that is an engine change.
5. The arc bug (R3) is in `fm2-batch-c/svg.mjs` line 486 and affects any future force drawn up-left or down-right with `angleFrom: "vertical"`.

No file outside this report was changed.
