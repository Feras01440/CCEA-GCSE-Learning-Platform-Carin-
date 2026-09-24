# FM3 batch B pre-read: probability bundles

Standard acknowledged (STANDARDS.md, 22 Sep 23:05): every finding below was recomputed or re-run through the live engine before it was written, and every proposed fix was re-marked; nothing here is unverified.

Pre-read of `packs/further-maths/content/fm3/{addition-rule-probability, venn-diagrams-probability, tree-diagrams-probability, conditional-probability}` (bundle.json and note.blocks.json, all written 20 Sep 20:50). Reviewer: resumed read-only pre-reader, 22 Sep 2026, 22:57 to 23:30.

**Method.**
- The digests `docs/dev/qa/pre-read/fm3-<slug>.digest.txt` (20 Sep 20:58) are later than every bundle, so they were read in full and not regenerated.
- Every final answer, worked-example step, twin, common-error value, diagnostic option, gate and figure number was recomputed as an exact fraction and a decimal.
- Every numeric part was marked through the live `markAnswer` with 12 to 15 spellings: exact fraction, ×2 and ×3 unsimplified, 4, 3, 2 and 1 d.p., 3 s.f., truncated 2 d.p., percentage, a "P = …" line, the neighbours over the same denominator, and each common error as a fraction and at 3 and 2 d.p. That comes to 1,134 marked lines.
- Also run through the live engine: the find-the-mistake fixes (`fixMatches`), the faded worked-example steps (`stepLineMatches`), the gates (`markGate`), the label, table and mcq parts, and the retrieval-prompt key words (`keywordsPresent`).
- Every figure was decoded exactly as the app decodes it, then checked geometrically. The questioned figures were also rasterised with sharp and looked at.
- Claims about examiners were checked against the Chief Examiner's reports (2019, 2022–2025) and the FM3 mark schemes in `docs/sources`.
- Engine fixes were checked on patched copies in the scratch folder only.
- Scripts and outputs are in `C:\Users\feras\AppData\Local\Temp\claude\C--Users-feras-Downloads-CCEA-GCSE-Top-Learning-Platform\4355edb7-b61d-472c-a7be-db688e7e239b\scratchpad\preread-fm3b\`:
  - `probe.mts`, `probe2.mts`, `probe3.mts`
  - `dp-repro.mts`, `dp-fix.mts` with `numeric.patched.ts`
  - `fix-patched.mts`, `steps.mts`, `steps-patched.mts`
  - `qfigs.mjs`, `notes.mjs`, `strike.mjs`, `raster*.mjs`, `figfix.mjs`
  - `table.mts`, `ftm-c1.mts`, `repeats.mjs`, `typ.mjs`
  - each script's `*.out.txt` beside it, and `png/`

**Strict build, as the brief asks:** `npm run content:check 2>&1 | grep -E "FIGURE .*fm3|published"` prints only `161 topic bundle(s) published, 0 problem(s), 0 key-word warning(s), 143 figure(s) printing an answer.` That is **0 FIGURE lines for these four bundles**. The build is blind here, though: section E3 lists three question figures that do print an answer.

Other checks, for the record:
- `node scripts/qa/figure-leaks.mjs --unit fm3`: 0 leaks, and one REVIEW line (q.tree.0007 "0.42").
- `scripts/qa/svg-draws.mjs`: 0 defects.
- `shingles --unit fm3`: no breach.
- lesson-v2: no fm3 warnings.
- `insights:unregistered`: none of the 10 unregistered ids is in fm3.

---

## Engine findings (they affect all four bundles)

### E1. The d.p. tolerance rounds the learner's decimal twice. Reproduced; the engine is at fault.

The author moved every probability part to `{"type":"absolute","value":0.005}` because a d.p. tolerance "marked the correct 3 d.p. spelling wrong". To reproduce it, I restored `{"type":"dp","places":2}` on every probability part (`dp-repro.mts`). Exactly one correct spelling is refused, verbatim:

```
we.fm.u3.conditional-probability.01 twin value=0.6346153846153846 dp2: [3 d.p.] "0.635" absolute→correct | dp2→refused :: 0.635 is only the rounded value. Keep the exact value, or more figures, until the final step.
```

The cause is `withinTolerance`, `case "dp"` (src/lib/marking/numeric.ts line 1398). It compares `roundDp(answer, 2)` with `roundDp(T, 2)`. The learner's correct 3 d.p. rounding 0.635 of 33/52 = 0.634615… is rounded a second time to 0.64, which is not 0.63. `diagnoseWrongValue` then calls it "only the rounded value", although it is more precise than the tolerance asks for. The same live d.p. 2 rule accepts the truncation 0.634.

With d.p. 3 or s.f. 3, every 2 d.p. answer is refused, for example "0.38" for 21/55 with "0.38 is only the rounded value". CCEA's own schemes accept 2 d.p. ("5/22 or 0.23", 2025 Q3(iv); "38/132 or 19/66 or 0.29", 2024 Q3(ii)(a)), so neither of those is usable.

**Proposed engine fix, verified on a patched copy (`numeric.patched.ts`, dp branch only).** When the answer is a decimal written to more places than the tolerance, judge it at its own precision:

```ts
case "dp": {
  const own = answer.form === "decimal" ? answer.decimalPlaces : null;
  if (own !== null && own > tol.n) return nearlyEqual(roundDp(T, own), aVal, 1e-9) ? "within-tolerance" : null;
  return nearlyEqual(roundDp(aVal, tol.n), roundDp(T, tol.n), 1e-9) ? "within-tolerance" : null;
}
```

`dp-fix.mts` runs every probability part of the four bundles at d.p. 2:
- **Right spellings refused: 0.** The two it prints as "right" are artefacts of JavaScript's `toFixed`: 0.725 → "0.72" and 0.0225 → "0.022" are truncations, not roundings.
- **Truncated 2 d.p. accepted: 0.**
- **Wrong 3 d.p. values accepted: 0.**
- 33/52: "0.635" is now correct; "0.634" and "0.636" are refused.

**What absolute 0.005 accepts today (the brief's question).** These were all marked through the live engine.
- *Truncations on an exact x.xx5 value*, which CER 2024 and 2025 both say "Do not truncate":
  - "0.72" for 29/40 (q.add.0002)
  - "0.27" for 11/40 (q.add.0003)
  - "0.13" for 27/200 (q.add.0007)
  - "0.38" for 77/200 (WE twin)
  - "0.52" for 21/40 (q.cond.0002, 0013(b))
  - "0.62" for 5/8 (q.cond.0006, 0014(c))
- *Wrong 3 d.p. values:* "0.384" for 21/55, "0.727" for 0.725, "0.634" for 33/52, and so on (every row marked `absolute0.005=true` in `dp-fix.out.txt`).
- *Neighbour fractions* (the 5/36 against 4/36 test). These are refused wherever the denominator is under 200. They are accepted for:
  - 76/200 and 78/200 (twin 77/200)
  - 26/200 and 28/200 (q.add.0007)
  - 8/400 and 10/400 (q.tree.0009(a))
  - 110/400 and 112/400 (q.tree.0009(b))
- *No authored common error lies inside an answer's band.* The smallest gap is 0.0214 (q.cond.0005, 9/20 against 3/7). The only near-collision is between two errors, 33/120 and 26/95 on q.venn.0006, and it already misdiagnoses live (V1).
- *For small probabilities the band is enormous:* for 0.0225 it accepts 0.02, 0.022, 0.023, 0.025, 0.027 and 0.0275 (T4).

**Recommendation.**
1. Fix the engine as above.
2. Then set probability parts back to `{"type":"dp","places":2}`: CCEA's "2 d.p. unless stated" (CER 2019), with exact fractions still accepted.
3. Until the engine is fixed, keep absolute 0.005, except for q.tree.0009(a) (T4).

Also, as information: a percentage such as "72.5%" scores 0 with "The value is right, but the question wants a fraction or a whole number or a decimal or a recurring decimal rather than a percentage." The FM mark schemes list fractions and decimals only, so this is defensible, but the sentence is clumsy.

### E2. Find-the-mistake fixes and faded worked-example steps: 52 wrong verdicts, all from one root cause

`fixMatches` and `stepLineMatches` (src/components/items/mistake-marking.ts) have four faults:
- `lastNumber` reads a fraction's **denominator** as its value.
- A bare fraction never "states a value".
- The value tolerance has an absolute floor of 0.05, which is 7% of a probability of 0.725.
- Authored `\frac{a}{b}` is not turned into a/b.

Live results (`probe3.mts` part 1, `steps.mts`):

| item | wrong fix ACCEPTED | right fix REFUSED |
|---|---|---|
| ftm addition .01 (answer 29/40) | "0.7", "0.75" | "29/40", "P(packed or bus) = 29/40", "22/40 + 15/40 - 8/40 = 29/40" |
| ftm tree .01 (27/55) | "P(same colour) = 1/55", "= 126/55", "21/55 - 6/55 = 15/55" (all end on 55) | "27/55", "0.49", "54/110" |
| ftm conditional .01 (21/40) | "P(bus given under 25) = 0.5", "0.55", "= 0.48" | "21/40", "P(bus given under 25) = 21/40", "42/80" |
| ftm conditional .02 (5/8) | "0.6", "0.65", "0.58" | "5/8", "P(wet given late) = 5/8" |
| ftm conditional .03 (5/17) | "0.25", "= 0.3", "0.33" | "5/17", "P = 5/17" |
| we addition .01, steps 3 and 4 | "= 1/50", "0.9", "0.84" | "43/50", "31/50 + 24/50 - 12/50" |
| we venn .01 and .02, step 5 | "= 1/15", "= 2/75" | "4/15", "0.27", "22/75", "0.29" |
| we tree .01 and .02 | "= 1/28", "0.3" | "15/56", "15/28", "0.54" |
| we conditional .01, .02, .03 | "0.5", "0.6", "0.65", "0.25", "0.33" | "11/20", "5/8", "5/17" |

That is 27 wrong find-the-mistake verdicts and 25 wrong step verdicts. The app records `correct: foundLine && fixed`, so both directions reach her history.

**Proposed engine fix, verified** (`fix-patched.mts`, `steps-patched.mts`, running against the live `equationsMatch` and `checkNumeric`):
- `lastNumber` returns a/b for a trailing fraction.
- A bare "a/b" states a value.
- Targets below 1 are matched to 0.005; targets of 1 and above keep `max(0.05, 1%)`.
- `asTyped` turns a numeric `\frac{a}{b}` into a/b.

Results:
- **find the mistake: 27 wrong verdicts → 0**
- **steps: 25 → 1**
- The one remaining step, "31/50 + 24/50 - 12/50", fails because `withoutLabel` does not strip a label with brackets, "P(S ∪ G) =".
- Regression spot-checks above 1 are unchanged ("36.2" and "36" against "…= 36.2 cm", "= 4.9" against "4.9 m/s^2"). "x = 2.5" now matches "x = 5/2", which is right.

This touches src/, so the lead must run vitest.

### E3. The figure-leak lint cannot see a probability

In `answerPhrases` (src/components/items/content-lint.ts lines 425–428), "A numeric answer counts only with its unit beside it". Probabilities have no unit, so a figure that prints the answer is never flagged. In addition, `figureText` reads only `aria-label="…"` (double quotes), and every figure here uses single quotes.

A whole-token matcher for unitless, non-integer answers (fractions n/d with d ≤ 1000, and the decimal to 2–4 d.p.) is `fracRe` in `qfigs.mjs`. Across the 4 bundles it flags exactly **q.tree.0007 ("WW 0.42"), q.tree.0010 ("5/9") and q.cond.0016 ("probability 119/165")**, with no false positives (T1, T2, C4).

---

## Findings that run across all four bundles

### X1. TeX outside `$…$`: 56 strings show raw "\dfrac{…}{…}"

`<Tex>` and `splitTex` render only inside `$…$`, so the learner reads the literal "\dfrac{29}{40}". Most of these are the closing fraction of a common-error feedback: "…leaving \dfrac{29}{40}.", "…The answer is \dfrac{27}{55}."

**Addition (7):**
- q0002 CE0, CE1
- q0003 CE0
- q0004 CE1
- q0008(a) CE0, CE1
- ftm .01 feedback

**Venn (5):**
- q0006 CE0, CE1
- q0009(c) CE0
- q0010(b) CE0
- q0010(c) CE0

**Tree (13):**
- we .01 step 4 decision
- q0002 CE0, CE1
- q0003 CE0, CE1
- q0004 CE0
- q0005 CE0
- q0006 CE0, CE1
- q0010(b) CE0, CE1
- ftm .01 feedback
- **note gate g5 prompt** ("…blue-then-black has probability \dfrac{14}{55}…")

**Conditional (31):**
- q0002 through q0010: CE0 and CE1 of each (18)
- q0011 CE0
- q0013(b) CE0
- q0013(c) CE0
- q0014(c) CE0, CE1
- q0015(b) CE0
- q0015(c) CE0
- q0016(b) CE0
- q0016(c) CE0, CE1
- ftm .01, .02 and .03 feedback

**Fix:** wrap each bare fraction in `$…$`. Verified with `splitTex`: q.add.0002 CE0 goes from a text segment holding "\dfrac{29}{40}" to a maths segment `\dfrac{29}{40}`. No existing lint catches this.

### X2. Labels drawn through lines in 48 figures (78 labels)

`strike.mjs` found these, and the rasters confirm them.

- **Every probability tree.** The first-stage outcome word ("Blue", "Black", "Red", "White", "Wet", "Dry", "Late", "On time", "Grows", "Fails", "Wins round 1", "Loses round 1") is placed at (185, node) with `text-anchor='start'`. That is exactly where the second-stage branches leave the node, so both branches strike through it.
  - tree note [3], [11], [23], [27], [31]
  - tree we .01, .02
  - tree q0001–q0010
  - conditional note [23], we .02, q0006, q0007, q0014
- **Every Venn diagram.** The population caption ("40 students in the form group", "32 pupils", "120 visitors", "96 students", "8 equal sections", "fill from the middle outwards") sits at y 220 or 300, across the universal-set border at y 214 or 298.
  - addition note [3], [15], we .01, q0001
  - venn note [3], [7], [15], [19], [31], we .01, .02, q0001–q0010
  - conditional note [19], q0004, q0005, q0010, q0015

**Fix, verified** (`figfix.mjs` re-run: 0 struck labels; `png/fix-tree.png`, `png/fix-venn.png`):
- Put each first-stage word above an upper node or below a lower node, with `text-anchor='middle'`. For the two-stage template that is Blue at (176, 62) and Black at (176, 184).
- Move the Venn caption below the box: baseline y 234 in the 440×250 viewBox, and y 314 in the 460×330 one.

This is template-level, so fix it in the generator.

### X3. The marks a common error awards contradict the part's own scheme (50 of 58 errors)

`marksTypicallyEarned` is the mark the engine awards when she makes that error (`withCommonError`). In 50 of the 58 numeric errors it is higher than the part's own method lines allow. 48 of them should change outright; 2 (q.cond.0011) depend on a scheme rewrite. Examples:
- q.cond.0002: 42/200 awards 1 of 2, yet "M1: 42/80, with the under-25 total as the denominator".
- q.venn.0002: the bare count 5 awards 1 of 2, yet "M1: 5/32 seen". The bundle's own rp.06 and WE .01 step 5 say a bare count "earns nothing".

CCEA's schemes agree with the scheme lines, not with the typical marks:
- 2022 Q6(i): the Venn equation "(88 − x) + x + (65 − x) + 7 = 100" earns M1, so leaving the outside region out loses it.
- 2022 Q6(ii) and 2023 Q3(iv): conditional parts are "MW1 W1" for the fraction with the right denominator.

The full table, every error beside its part's method lines, is `typ.out.txt` in the scratch folder (made by `typ.mjs`).

**Recommended values**, keeping the scheme lines as written:
- **Set to 0:**
  - addition q0002, q0003, q0004, q0005, q0006 (CE1 −0.15), q0008(a)
  - venn q0001, q0002, q0003, q0004, q0005, q0007, q0008, q0009(b), q0009(c), q0010(a) CE0 and CE1, q0010(c)
  - tree q0002, q0004, q0005, q0008, q0010(b), q0010(c)
  - conditional q0002 ×2, q0003 ×2, q0004 ×2, q0006 ×2, q0007 ×2, q0008 CE1 (see C3), q0009 ×2, q0010 ×2, q0013(b), q0013(c), q0014(c) ×2, q0015(b), q0015(c), q0016(b), q0016(c) CE1
- **Set to 1:** tree q0009(b) CE0 0.7225, currently 2. Only "MW1: 0.7225 seen" is earned; M1 is the "1 −" step.
- **Keep:**
  - venn q0006 CE1 and q0010(b) CE0 (1; the numerator line is met)
  - tree q0003 CE0 (2) and CE1 (1)
  - tree q0006 CE0 (2) and CE1 (1)
  - conditional q0005 CE0 and CE1 (1; "MW1 numerator 18")
- **conditional q0011 (168, 350):** keep 1 only if MW1 becomes "800 × their P(bus | under 25) ft"; otherwise 0.

The find-the-mistake "as written" marks disagree with their sibling questions in the same way:
- **addition .01 ["M1"]:** q0002's M1 needs "− 8/40".
- **venn .01 ["M1"]:** q0001's M1 is the full equation, as in CCEA 2022 Q6(i).
- **conditional .01 ["M1"]:** CCEA 2022 Q6(ii), MW1 W1.
- **conditional .02 ["M1","MW1"]:** under q0006's scheme she never forms 0.16 and never divides.

Either set these to [] or rewrite the sibling M1 lines. Tree .01 and conditional .03 are consistent.

### X4. The common-error tolerance of 0.004 misses the 2 d.p. spelling of the error

Answers are matched to 0.005, so 2 d.p. passes. Errors are matched to 0.004, so her 2 d.p. spelling of the error gets the generic "That is not the expected answer" and 0 marks. Live misses:
- q.add.0002 "0.93" (37/40)
- q.add.0003 "0.08" (3/40)
- q.add.0008(a) "0.29" (57/200)
- q.tree.0004 "0.25" (14/55)
- q.cond.0003 "0.63" (33/52)
- q.cond.0009 "0.53" (21/40)
- q.cond.0013(c) "0.53"

**Fix, verified** (`probe3` 3b): set every non-integer numeric error to `{"type":"absolute","value":0.005}`. That gives 0 collisions with any answer or other error, all seven now diagnosed with their authored feedback, and no right spelling affected.

### X5. Count answers carry a unit, so she is told "Remember to include the unit (pupils) in an exam"

These parts ask "find the value of x" or "how many". The engine appends the unit reminder to a correct "5" or "x = 5", and CCEA's scheme writes "x = 10".

Parts:
- q.venn.0001 (pupils), q.venn.0004 (members), q.venn.0010(a) (households)
- we.venn.01 twin (pupils)
- q.add.0001 (students)
- q.cond.0001 (people), q.cond.0011 (members)

**Fix, verified** (`probe3` 3a): delete `unit` and keep `unitRequired: false`. "5", "x = 5" and "5 pupils" are all then plainly "Correct.", and the common errors are unchanged.

### X6. Retrieval-prompt key-word chips (the brief's text-answer test)

There are no `text` parts in these bundles. The only word-matched answers are the retrieval-prompt chips, shown in the note's InlinePrompt and in DeckStudy as "Key words examiners look for: …".

- **rp.fm.u3.addition-rule-probability.01** has `["p(a","p(b","p(a","b)"]` and **rp.fm.u3.conditional-probability.01** has `["p(a","b)"]`.
  - These are fragments that normalise to "p a", "p b", "p a", "b". The duplicate "p(a" also gives a duplicate React key.
  - They are shown to her as chips.
  - The wrong formulas "P(A ∪ B) = P(A) × P(B)", "P(A|B) = P(A ∩ B) / P(A)" and "P(A|B) = P(A) x P(B)" all get "Every key word is there."
  - **Fix:** remove `keyWords` from both. With no key words the chip check is skipped (`keys.length > 0`), and she compares with the revealed formula. A formula typed with or without spaces round "/" cannot be keyed reliably; the proposal `["P(A ∩ B) / P(B)"]` refused "P(A | B) = P(A ∩ B)/P(B)".
- **Reversed answers score** because the key words are presence-based:
  - rp add .05: "And means add, or means multiply."
  - rp venn .02: "Plays the guitar only is the whole circle; plays the guitar is the part outside every overlap."
  - rp tree .02: "…the denominator stays the same and the numerator drops."
  - rp cond .03: "…the same numerator and the same denominator…"
  - rp add .04: "They are independent, so P(A and B) = P(A) x P(B)…"
  
  All of these get "Every key word is there."
  - **Fix, verified** (`probe3` part 2), for the two swap-prone ones:
    - rp add .05: `["or means at least one","and means both","multiply"]`
    - rp venn .02: `["guitar is the whole circle","only is the part"]`
  - The authored answers pass; the reversed answers now miss both pairing phrases.
  - For tree .02 and cond .03, key the direction: "denominator drops by one", "same numerator".

### X7. The same fraction printed twice ("= 29/40 = 29/40"), 25 places

A simplification step printed the fraction twice where it was already in lowest terms:
- **Scheme W1 lines:**
  - q.add.0002 "29/40 or 29/40 or 0.725"
  - q.add.0003 "11/40 or 11/40"
  - q.add.0004 "37/50 or 37/50 or 0.74"
  - q.tree.0010(a) "5/9 or 5/9"
- **Worked solutions:**
  - q.add.0002, 0003, 0004
  - q.venn.0002, 0005, 0008, 0010(b), 0010(c)
- **Feedback:**
  - q.add.0004 CE0
  - q.venn.0002, 0005, 0008 CE0
- **we.venn.02 step 5 working:** "= \dfrac{22}{75} = \dfrac{22}{75}". This is a line she types in faded mode.
- **Venn note gate g8:** answer "19/44 | 0.43 | 19/44".
- **solutionProgram:** 7 more.

**Fix:** drop the repeated "= X" (and the repeated alternative).

### X8. Misconception tags that do not name the error they carry

These feed her weakness profile through `recordAttempt`:

| item | tag | the error it actually carries | correct tag |
|---|---|---|---|
| q.add.0006 CE1 −0.15 | overlap-not-subtracted | a sign error | a sign-error id, or none |
| q.add.0006 CE0 0.2 | or-multiplied-instead-of-added | assuming independence; there is no "or" | |
| add dx d2 "0.3" | overlap-not-subtracted | P(B) was subtracted | |
| add dx d3 distractors | overlap-not-subtracted | a mutually-exclusive judgement | |
| tree dx d1 "4/9" | replacement-denominator-not-reduced | the numerator was not reduced | |
| tree dx d5 "Subtract…" | add-instead-of-multiply | | |
| q.tree.0009(b) CE1 0.3 (0.15 + 0.15) | add-instead-of-multiply | the addition rule without the overlap; its own feedback says "counts the both-late case twice" | overlap-not-subtracted |
| q.cond.0016(b) CE0 28/55 | complement-not-used | the all-three branch was left out; there is no complement | |
| cond dx d8 "333" | condition-reversed | divided instead of multiplied | |

---

## addition-rule-probability

**A1. The note says 37 is more than 40, and the figure and gate g2 are built on it.**
- **Note [2]:** "adding 22 and 15 gives 37 — more people than are in the room."
- **Figure [7]:** svg text "adding the two groups reaches 37, past the 40 in the room". The alt says "together they run past the end of the scale", but the bars are drawn side by side from the same start, and 37 < 40.
- **Gate g2:** "22 plus 15 comes to 37, but only 40 students are in the room. Why?" There is no paradox. Its distractor "Some students were counted in neither total" is literally true, since 11 students do neither.

The real contrast is 37 against the **29** who do at least one.

**Fix:**
- **[2]:** "…adding 22 and 15 gives 37. But 11 of the 40 put no hand up at all, so only 29 did at least one: the 8 were counted in each total."
- **Figure [7]:** svg text "adding the two groups gives 37, but only 29 students did at least one"; alt "Two bars, 22 and 15 long, against a scale of 40 students; together they make 37. A third bar shows the 29 students who do at least one."
- **g2 prompt:** "In the bar picture above, 22 plus 15 comes to 37, but only 29 students do at least one. Why?"
- **g2 second option:** "The 11 who do neither were added in by mistake". This is false; they are in neither total.

**A2. The "mutually exclusive" figure draws overlapping circles.**

Note [15]: the alt says "Two circles that do not touch", and the caption says "Mutually exclusive events are circles that do not overlap". But `circle cx='176'` and `cx='264'` both have r = 82: the centres are 88 apart against radii summing to 164, so the circles overlap. The raster `png/add-note-15-mutex.png` shows a large shaded lens, the exact opposite of the lesson.

**Fix, verified** (`figfix.mjs`: centre distance 184 > 164, "separate", 0 struck labels; `png/fix-mutex.png`):
- circles at cx 128 and 312
- "Red" and "3" at x 128, "Blue" and "2" at x 312
- caption y 234

**A3. Gate g6 treats two beads without replacement as P(A) × P(B).**

"Two beads are taken. What is the probability that both are red?" is given as the question that "needs $P(A) \times P(B)$". Without replacement that product is wrong, which is exactly what the tree topic teaches.

**Fix:** "Two beads are taken, the first put back before the second is drawn. What is the probability that both are red?"

**A4. Gate g3 refuses the 2 d.p. answer that q0002 accepts.**

Answer "29/40 | 0.725"; "0.73" is refused (`probe2`).

**Fix, verified:** "29/40 | 0.725 | 0.73". "0.73" is then accepted and "0.72" still refused.

**A5. Diagnostic post d4 overclaims the examiners.**

The option $\frac{1}{2} + \frac{1}{6}$ has the feedback "Examiners report this exact swap every year". Only 2022 Q1 reports it; 2024 Q3(i) reports the opposite swap.

**Fix:** "Examiners reported this exact swap on a straightforward opening question in 2022".

**Cross-bundle items that apply here:**
- X1: 7 strings
- X2: note [3], [15], we .01, q0001
- X3: all six errors; ftm .01
- X4: q0002, q0003, q0008(a)
- X5: q0001
- X6: rp .01, .04, .05
- X7: q0002–q0004
- X8: q0006, d2, d3

**Clean:**
- The mathematics: every answer, twin, error value and diagnostic option recomputes (43/50, 77/200, 29/40, 11/40, 37/50, 0.59, 0.15, 0.135, 17/20, 3/20).
- The diagnostics' structure.
- The lesson structure: hero with lede, can[3] and 11 minutes; words between gates 68–130; recap present; closing panel 66 words.
- Spec coverage (FM3-PRB-01, with a not-on-spec list).

**Verdict:** the mathematics is right, but the opening teaching sequence (A1, A2) contradicts itself and must be rewritten before she sees it. The feedback shows raw TeX, and the marks it awards are wrong (X1, X3). Not ready.

## venn-diagrams-probability

**V1. q.venn.0006 (main) diagnoses the realistic slip as the wrong error, and its own error describes numbers the question does not give.**
- **CE0** (47/120, `only-misread-in-venn`) says "The three pair totals printed in the question each include the 7…". But q0006 prints only the filled diagram; the pair totals appear in q0009(a).
- On this diagram the realistic "exactly two" slip is **counting the centre in**: (12 + 9 + 5 + 7)/120 = 33/120. The bundle's own diagnostic d6 models this slip.
- Live, "33/120", "11/40" and "0.275" all get CE1's "The denominator is the 95 visitors inside the circles…" with 1 mark. 26/95 = 0.2737 sits 0.0013 from 0.275, inside CE1's 0.004 band, so she is told she used the wrong total when she did not.

**Fix, verified** (`probe3` 3f):
- **CE0:** value 11/40 (0.275), tolerance 0.0005, feedback "That adds the 7 in the centre as well. Those visitors saw all three species, so they are not 'exactly two'. The pair regions alone are 12, 9 and 5, which is 26, and $\dfrac{26}{120} = \dfrac{13}{60}$.", 0 marks.
- **CE1:** tolerance 0.0005.
- Result: "33/120", "11/40" and "0.275" go to the centre error; "26/95" and "0.274" go to the 95 error; "0.27" gets the generic line; "13/60" and "0.22" are correct.

**V2. q.venn.0007 (main) CE0 feedback describes working the question never shows.**

"The three circle totals have been added and the three pair totals taken off…". q0007 gives the filled diagram, not totals. The value 32/120 is still the right one to trap: it is what she gets by adding the regions and leaving the centre out (95 − 7 = 88).

**Fix (text only):** "The seven regions inside the circles add to 95, so 32 outside means one region was left out of the sum, most often the 7 in the centre. $120 - 95 = 25$, so $P(\text{none}) = \dfrac{25}{120} = \dfrac{5}{24}$."

**V3. q.venn.0009(a): the label bank is exactly the eight answers.**

The bank is `["24","20","18","12","9","5","7","25"]`, one per region, so the part can be done by elimination. CCEA's classic error, putting a printed pair total in a pair region (19, 16), cannot be entered.

**Fix:** add "19", "16", "52", "44", "39" and "95" to the bank.

**V4. Gate g6 is answered by the sentence directly above it.**

Paragraph [22] says "The missing 25 saw none of the three"; g6 then asks how many go outside. **Fix:** end [22] at "…and the park asked 120 visitors." and let g6 find the 25.

**Cross-bundle items that apply here:**
- X1: 5 strings
- X2: 17 figures
- X3: 12 errors; ftm .01
- X5: q0001, q0004, q0010(a), we .01 twin
- X6: rp .02
- X7: 12 places

**Clean:**
- All numbers recompute: x = 5, 9, 10; 4/15, 22/75, 43/75, 5/32, 9/16, 17/45, 13/60, 5/24, 19/44, 31/60, 4/13, 22/75, 16/43.
- Every Venn region sits in the right place (region geometry checked).
- The q0009(a) label marking (3/3, and 7/8 → 2/3).
- The q0010(a) 2x slip, matching CER 2023 Q3.
- Diagnostics, find-the-mistake fixes and lesson structure (hero; gaps 53–135; closing 70 words).

**Verdict:** the strongest of the four in teaching. V1 is a live misdiagnosis and X3 misawards marks. Fix V1, V2, X1, X3 and X5, then it is ready.

## tree-diagrams-probability

**T1. The q0007 figure prints the answer, and it hands q0008 its method marks.**

The quiz tree prints "WW 0.42", "WL 0.28", "LW 0.18" and "LL 0.12". q0007 asks for "wins both" = **0.42**. q0008's MW1 is "0.28 and 0.18". The strict build is silent, and figure-leaks only lists it as REVIEW.

**Fix:** remove the four path products from both figures, and drop "WW …" and the rest from the SVG.

**T2. The q0010 figure prints part (a)'s answer.**

The three-stage tree labels every third-stage branch, including 5/9 on the top path, and the alt says "the top path reads 7/11, 6/10, 5/9". Part (a) is "Write down the probability that the third pen is also blue": **5/9**.

**Fix:** mark the eight third-stage branches (i) to (viii) with no values, and change the alt to match. Part (a) then needs "9 pens left, 5 of them blue". Alternatively, drop (a).

**T3. The "put back" errors do not carry the put-back value.**

The feedback says "…still 11, which is the answer for a pen put back", but the values are hybrids (numerator reduced, denominator kept):

| part | carried value | true with-replacement value |
|---|---|---|
| q0002 CE0 | 42/121 | 49/121 |
| q0003 CE1 | 54/121 | 65/121 |
| q0005 CE0 | 20/64 = 5/16 | 25/64 |
| q0006 CE1 | 26/64 = 13/32 | 34/64 |

The registry defines `replacement-denominator-not-reduced` as "…as if the first item had gone back". CER 2024 Q3(ii) reports "answered with replacement throughout". Live, the true with-replacement answer 0.405 on q0002 gets "That is not the expected answer."

**Fix, verified** (`probe3` 3e):
- Set these four values to 49/121, 65/121, 25/64 and 34/64. The gaps to the answers are 0.023–0.067, so nothing collides.
- If the hybrid is kept, add it as a second error with its own feedback: "The numerator dropped but the denominator stayed at 11: with the pen kept out there are 10 left."
- q0010(b) CE0 (343/1331) is already the true with-replacement value.

**T4. q0009(a): absolute 0.005 on 0.0225 accepts 0.02, 0.022, 0.023, 0.025, 0.027 and 0.0275.**

CER 2024 Q4(v) criticises candidates who "truncated their answer to 0.03" when the scheme's answer was 0.027.

**Fix, verified live** (`probe3` 3c): `{"type":"sf","figures":3}`. "0.0225" and "9/400" are correct; 0.02, 0.022, 0.023, 0.025 and 0.027 are refused.

**T5. The note's first tree prints the answer to gate g3, and uses an unexplained letter.**

Figure [3] prints "KK 6/55". Gate g3, two sections later, asks for $P(\text{both black})$ = 6/55. "K" for black is never introduced.

**Fix:** print the path products only in figure [11]'s position, after g3, or ask g3 for a product that is not printed. Write "black, black" in words.

**T6. "$\dfrac{7}{11} \times \dfrac{3}{5} = 42/110$" does not follow.**

7/11 × 3/5 is 21/55; 42/110 comes from 7/11 × 6/10, which is what the tree shows. This appears in note [10], in q0002's worked solution, and in the scheme M1 lines of q0002 and q0010(b) ("7/11 × 3/5 × 5/9").

**Fix:** write $\dfrac{7}{11} \times \dfrac{6}{10} = \dfrac{42}{110} = \dfrac{21}{55}$ throughout, matching the branch label.

**Cross-bundle items that apply here:**
- X1: 13 strings, including gate g5
- X2: every tree figure
- X3: 6 errors
- X4: q0004
- X7: q0010(a)
- X8: dx d1, d5, q0009(b) CE1

**Clean:**
- The mathematics: 15/28, 13/28, 3/28, 0.32, 0.96, 21/55, 27/55, 28/55, 5/14, 13/28, 0.42, 0.46, 0.0225, 0.2775, 5/9, 7/33, 26/33, and every third-stage branch of the three-stage tree.
- q0001's label marking (bank with distractors; 3/5 and 2/5 accepted).
- Diagnostics and gates (g6 accepts 0.28; g7 and g8 refuse truncations).
- The find-the-mistake line logic.
- Lesson structure (gaps 48–129; closing 61 words).

**Verdict:** the maths is right, but two question figures print answers (T1, T2), and the replacement errors teach the wrong value (T3). Not ready.

## conditional-probability

**C1. q0013(a) (table): every cell label points at the wrong cell.**

The field names cells "Row r+1, column c+1" and tells her "Row 1 is the first row under the headings; column 1 is the left-hand column" (`cellLabel`). This part counts the heading row as row 0. Live, from `table.mts`:
- "Row 2, column 3 expects 54" — the printed table shows **66** there.
- "Row 3, column 2 expects 38" — shows 80.
- "Row 3, column 4 expects 104" — shows 200.
- "Row 4, column 3 expects 120" — there is **no row 4**.

**Fix, verified:** subtract 1 from each row: `{"row":0,"col":2,54}`, `{"row":1,"col":1,38}`, `{"row":1,"col":3,104}`, `{"row":2,"col":2,120}`.
- The labels become Row 1 column 3, Row 2 column 2, Row 2 column 4 and Row 3 column 3, which are exactly the four blanks.
- All right → 2/2; one wrong → 1/2.

**C2. ftm.fm.u3.conditional-probability.01 flags a correct line.**

Line 2, "P(bus and under 25) = 42/200 = 0.210", is true: the joint probability is 42/200. The whatWentWrong concedes it ("That is the probability of being under 25 AND on the bus"). The error is line 3, which calls it the conditional.

**Fix, verified** (`ftm-c1.mts`, live `fixMatches`):
- **studentWorking:** ["people under 25 who take the bus = 42", "P(bus given under 25) = 42/200", "= 0.21"], with mistakeLine 2.
- **correction:** ["people under 25 who take the bus = 42, out of 80 people under 25", "P(bus given under 25) = 42/80", "= 21/40 = 0.525"].
- **whatWentWrong** should start: "Line 2 divides by all 200 people, but being told the person is under 25 shrinks the group to the 80 in that column."
- The natural fixes pass; "…= 42/200" and "= 0.21" do not.

**C3. The CCEA-reported nested-event answer gets the wrong diagnosis (q0008, q0016(c)).**

CER 2019 Q2(iii) gives the commonest wrong answer as (1/5 × 7/15) ÷ 7/15 = **1/5**, which is P(A) itself. CER 2023 Q5(iii) gives 0.1151, again P(A). That is the route shown in the bundle's own ftm .03, ending "= 7/33".

Live, "7/33" gets CE1 `numerator-and-denominator-not-combined`: "That is the numerator on its own. Dividing it by … finishes the question", with 1 mark. So she is told to divide, when she did divide. CE0 (833/5445, the undivided product) catches the rarer route.

**Fix, verified** (`probe3` 3d):
- **CE1:** re-tag `fm.condprob.subset-event-multiplied`, 0 marks.
- **Feedback:** "That is $P(\text{all three blue}) = \dfrac{7}{33}$ itself. It comes back when the two probabilities are multiplied on top and the division then cancels the multiplication, or when the division is never done. All three blue already means at least two, so the numerator is $\dfrac{7}{33}$ on its own and it is divided by $\dfrac{119}{165}$: $\dfrac{5}{17}$."
- In q0016(c), say "part (b)" for 119/165.
- "7/33", "0.212" and "0.21" all get it, and all its TeX is inside `$…$`.

**C4. The q0016 figure prints part (b)'s answer.**

The nested-regions figure prints "probability 119/165", and (b) asks for $P(\text{at least two blue})$ = **119/165**. The strict build is silent; the E3 matcher flags it.

**Fix:** give q0016 a copy with the two "probability …" lines removed (alt: "…the outer one is 'at least two of the three pens are blue' and the inner one, entirely inside it, is 'all three are blue'"). Keep the annotated copy for the note, q0008 and we .03, where both values are given in the stem.

**C5. The nested-regions SVG is not valid XML.**

`aria-label='…The outer region is 'at least two of the three pens are blue' with probability 119/165; …'` puts single-quoted phrases inside a single-quoted attribute. It appears in note [32], we .03, q0008 and q0016.
- In the app, the HTML parser tolerates it: the figure draws, but the aria-label is truncated to "Two nested regions inside a rectangle. The outer region is ".
- librsvg refuses it: "XML parse error … Couldn't find end of Start Tag svg line 1" (`raster.mjs`, FAIL cond-q0016).

**Fix:** use double quotes for that attribute, or "…the outer region is ‘at least two…’", in all four copies.

**C6. Gate g9 is answered right above it.**

Paragraph [35] computes "800 × 21/40 = 420", and figure [36] prints a table "Bus 420, Car 380, Total 800". g9 then asks "how many of 800 under-25 members would you expect to travel by bus?"

**Fix:** keep the paragraph, drop figure [36] (or move it after the gate), and ask g9 for the car figure: 800 × 38/80 = **380**.

**C7. Gate g4 refuses the 2 d.p. answer its questions accept.**

Answer "7/16 | 42/96 | 0.4375". "0.44" and "0.438" are refused, although q0009 and q0013(c) accept 0.44.

**Fix, verified:** "7/16 | 42/96 | 0.4375 | 0.44". "0.44" and "0.438" are then accepted; "0.43" and "0.45" are refused.

**C8. Diagnostic post d2 is confusing and misquotes the report.**

The stem reads: "88 people were asked, 28 of them said yes and all 28 were season-ticket holders. There are 100 people altogether…". The season-ticket clause does nothing. The feedback's "The report on this exact question says only the best candidates used 88" is untrue, since CCEA's question is 2022 Q6(ii), cola and orange.

**Fix:**
- **Stem:** "A club has 100 members. 88 came to the AGM, and 28 of those 88 voted for the new kit. Given that a member came to the AGM, what is the probability that they voted for the new kit?"
- **Distractor feedback:** "That divides by every member. Examiners reported exactly this denominator slip on a CCEA question of this kind in 2022."

**C9. Minor wording.**
- q0014(c) CE0 says "which is what most candidates reach". CER 2025 Q7 says "Many". Use "many".
- q0014(b) CE0 says "The two first-stage and second-stage probabilities have been added". Use "The wet-morning probability and the late-on-a-wet-morning probability have been added".
- Note [6] names the condition A ($P(B \mid A)$), while [10] names it B. Write [6] as $P(\text{bus} \mid \text{under 25})$ to avoid the swap.

**Cross-bundle items that apply here:**
- X1: 31 strings
- X2: note [19], [23], we .02, q0004–7, q0010, q0014, q0015
- X3: 23 errors; ftm .01 and .02
- X4: q0003, q0009, q0013(c)
- X5: q0001, q0011
- X6: rp .01, .03
- X8: q0016(b), dx d8

**Clean:**
- The mathematics: 11/20, 33/52, 5/8, 9/14, 5/17, 12/17, 21/40, 7/16, 11/27, 3/7, 420, 168, 350, 0.16, 28/55, 119/165, and the table cells 54, 38, 104, 120.
- The van tree products: 0.10, 0.30, 0.06, 0.54.
- The q0014(a) label marking.
- The q0012 mcq: one correct option, each distractor tagged.
- Diagnostics structure and the other gates.
- Lesson structure (gaps 59–131; closing 61 words).
- Examiner callouts match their reports: 2025 Q7, 2024 Q6, 2019 Q2, 2022 Q7.

**Verdict:** the richest lesson of the four, and its mathematics is right. C1 makes q0013(a) unanswerable, C2 teaches a false fault, and C3 misdiagnoses the most common CCEA error. Not ready until C1–C5 and the cross-bundle items are fixed.

---

## Areas checked and clean across all four

- **Mathematics** of every final answer, twin, worked-example step, figure number, diagnostic option and common-error value: recomputed as fractions and decimals, no wrong value found. T6 is a presentation error, not a wrong answer.
- **Regex common errors:** none (every error is numeric).
- **Text:** no unpaired `$`, no `${`, no undefined or NaN, no doubled backslashes or bare TeX words inside maths.
- **Multiple choice:** every diagnostic and mcq has exactly one correct option, no duplicate texts, and feedback on every option.
- **Choice gates:** every answer is one of the options.
- **Lessons:** each opens with a hero (lede 43–48 words, can[3], 11/14/15/19 minutes). Every numbered section ends in a gate. Prose between gates is at most 135 words, a "You can now" recap is present, and the closing panel is 61–70 words.
- **Spec:** everything is inside FM3-PRB-01 to 03; nothing is off-spec.
- **Registry and copying:** all misconception ids are registered, and shingles shows no breach.
