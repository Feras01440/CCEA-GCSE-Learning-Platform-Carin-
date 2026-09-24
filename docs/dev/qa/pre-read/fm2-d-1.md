# Pre-read: FM2 — F = ma for a body in horizontal or vertical motion

Bundle: `packs/further-maths/content/fm2/newtons-second-law-linear/bundle.json` + `note.blocks.json`
Digest: `docs/dev/qa/pre-read/fm2-nsl-linear.digest.txt` (read in full)
Probes (scratchpad, re-runnable): `fm2d-mark.mts` (marking), `fm2d-struct.mjs` (structure, figures, MCQ, schemes), `fm2d-recompute.mjs` (every value recomputed, `solutionProgram` evaluated), `fm2d-lint.mts` + `fm2d-kw.mts` (shipped content and key-word lints), `fm2d-ftm.mts` / `fm2d-ftm2.mts` (find-the-mistake), `fm2d-verify.mts` / `fm2d-verify2.mts` / `fm2d-svgfix.mts` (every fix below re-marked after patching a deep copy).

Ten findings. The physics and arithmetic are right everywhere: every value was recomputed with g = 10 and every one agreed. The defects are in what the marking engine does with a correct learner answer, in two common-error patterns, and in four figures that draw nothing where an arrow is claimed.

---

## 1. (High) `q.fm.u2.newtons-second-law-linear.0006` (main) and `.0012` (b): the stem demands a direction that the answer box marks wrong

Current text — 0006 stem: `Calculate the magnitude of its acceleration, and state its direction.` with scheme `W1.for = "$1$, downwards"`.
0012(b) stem: `Calculate the acceleration of the lift, and state its direction.` with `W1.for = "$0.4$, directed downwards"`.
Both parts carry `answer.kind = "numeric"` and an `Answer ________ m/s²` line.

Why it is wrong: the numeric engine reads anything after the number as a unit, so the answer the question asks for is marked as a wrong unit and scores nothing.

```
0006   "1 m/s² downwards" -> 0/3   "The number is right but the unit is not. The answer should be in m/s², not m/s² downwards."
0006   "1 downwards"      -> 0/3   0006 "1 down" -> 0/3
0012b  "0.4 m/s² downwards" -> 0/3  0012b "0.4 downwards" -> 0/3
```

The final mark as the scheme words it ("$1$, downwards") can therefore never be earned as specified, and the learner who follows the worked solution ("the acceleration is 1 m/s² downwards") is told she is wrong. These are the only two numeric parts in the whole platform whose stem asks for a direction: every other direction part is `text` or `mcq` (`q.fm.u2.equilibrium-of-forces.0004`, `q.fm.u2.force-diagrams.0007`, `.0014`, `q.fm.u2.newtons-second-law-inclined-plane.0006`).

Fix (verified): ask for the magnitude in the box and leave the direction to the worked solution, which already carries it.
- 0006 stem → `A lift of total mass 400 kg hangs on a vertical cable in which the tension is 3600 N.\n\nCalculate the magnitude of its acceleration.\n\nTake $g = 10$ m/s².\n\nAnswer ________ m/s²`; `W1.for` → `"$1$"`.
- 0012(b) stem → `The tension in the cable is now 6240 N.\n\nCalculate the magnitude of the acceleration of the lift.\n\nAnswer ________ m/s²`; `W1.for` → `"$0.4$"`.
After the edit: `"1"`, `"1 m/s²"`, `"1 ms⁻²"` → 3/3; `"0.4"`, `"0.4 m/s²"`, `"2/5"` → 3/3.

Alternative if the CCEA phrasing must be kept: convert the part to a `text` spec as `q.fm.u2.equilibrium-of-forces.0004` does. Tested caution — a bare numeric key word is unsafe there: `keywordsPresent("0.1", ["1"])` matches (the decimal point becomes a space), so `"0.1 downwards"` would collect the value group. A text spec would need the key word written as `"1 m/s"` or similar, and the two numeric common errors rewritten as regexes.

## 2. (High) `q.0006` (main) and `q.0012` (b): the signed value a correct solution reaches scores 0 with no diagnosis

Current behaviour: `"-1"` → 0/3 on 0006 and `"-0.4"` → 0/3 on 0012(b), explanation "The size of the answer is right but the sign is wrong."

Why it is wrong: with up positive — the convention the note, the scheme and the worked solutions all teach — the working *does* give −1 and −0.4. The bundle's own `solutionProgram` computes them: `T = 3600; m = 400; a = (T - m*10)/m` → −1, and `a2 = (6240 - M*10)/M` → −0.4, neither of which equals the stored answer. The candidate has formed the weight and the equation of motion, so both MW marks stand; only the "give the magnitude" step is missing. Compare `q.0005`, where a genuinely reversed resultant is paid 1 of 3, and `q.0011(b)`, where a slip that keeps the method is paid 2 of 3.

Fix (verified): add a common error to each part (registry id `fm.kin.deceleration-sign` exists in `packs/further-maths/insights/misconceptions.json`):

```json
{ "misconception": "fm.kin.deceleration-sign",
  "pattern": { "kind": "numeric", "value": -1, "tolerance": { "type": "absolute", "value": 0.005 } },
  "feedback": "With up positive the working does give $a = -1$, and the size is right, so the method marks (M) stand. The part asks for the magnitude: drop the sign and read it as $1$ m/s² downwards.",
  "marksTypicallyEarned": 2,
  "source": "ccea-cer:further-maths:2024-summer:FM2:Q6" }
```

and the same with `value: -0.4` and `$a = -0.4$ … $0.4$ m/s² downwards` on 0012(b). After the edit: `"-1"` and `"−1"` → 2/3 tagged `fm.kin.deceleration-sign`; `"-0.4"` → 2/3; `"9"` → 0/3 and `"9.6"` → 0/3 unchanged.

## 3. (Medium) `q.fm.u2.newtons-second-law-linear.0001` (main): the second common error's value is not the slip its feedback names

Current text: `"pattern": { "kind": "numeric", "value": 1000, … }`, feedback `"That multiplies the two numbers. $F = ma$ rearranges to $a = F \div m$, so the force is divided by the mass."`

Why it is wrong: the two numbers in the stem are 20 N and 5 kg, and 20 × 5 = **100**. The stored 1000 is 20 × 50, i.e. the force times the *weight* — a slip nobody makes, and in any case the weight confusion is already the part's first common error (0.4). So the learner who really does multiply gets the generic "That is not the expected answer", and the authored diagnosis fires on nothing.

Fix (verified): `"value": 100`. After the edit `"100"` → 0/2 tagged `fm.connected.mass-force-confused` with the authored feedback; `"1000"` falls through to the generic message; `"4"` → 2/2 and `"0.4"` → 1/2 unchanged.

## 4. (Medium) `q.0012` (a): the `g-omitted-weight` regex fires on an answer that does include the weight

Current text: `"regex": "\\b7020 = 0\\.8m\\b|\\b7020 = 0.8m\\b"` (the second alternative is the first with an unescaped `.`, so it adds nothing).

Why it is wrong: the pattern is unanchored, so it matches the tail of any line that ends `… 7020 = 0.8M`. A candidate who forms the resultant the wrong way round —
`10M - 7020 = 0.8M, so M = 650 the other way round` — is told "That leaves the weight out", which is the opposite of what she did. It also misses the same error written with a space: `7020 = 0.8 M` does not match.

Fix (verified): `"regex": "(?:^|[.;,:\\n]\\s*|\\bso\\s+|\\bgives\\s+|\\bthen\\s+|\\bis\\s+)7020\\s*=\\s*0\\.8\\s*m\\b"`. Tested: fires on `7020 = 0.8M so M = 8775`, `Taking up as positive, 7020 = 0.8M…`, `T = Ma so 7020 = 0.8M…` and `7020 = 0.8 M so M = 8775`; quiet on the reversed-resultant answer above, on the accepted answer and on the forming line `7020 - 10M = 0.8M`. (Lookbehind-free; 32 pack regexes already use lookbehind if a tighter form is preferred.)

## 5. (Medium) `q.0012` (a): the "show that" two-mark cap is promised to the learner but cannot be paid, and half the verifications are not recognised

Current text: common error `fm.show-that.verify-by-substitution`, `marksTypicallyEarned: 2`, feedback "… **CCEA caps it at two of the three marks**. Start from the forces and solve for $M$."

Why it is wrong: for a `text` spec, `src/components/items/mark.ts` (lines 226–229) deliberately keeps the key-word marks and never raises them to `marksTypicallyEarned` ("an answer that contains only the misconception must not be paid for it"). A verification answer therefore scores **1 of 3** while the card tells her the route is worth two — the panel contradicts itself.

```
"Substituting M = 650 into the equation gives 7020 - 6500 = 520 and 650 x 0.8 = 520, so both sides agree."
   -> 1/3, tagged fm.show-that.verify-by-substitution, feedback says "capped at two of the three marks"
"If M = 650 then the weight is 6500 N, and 7020 - 6500 = 520 N while Ma = 650 x 0.8 = 520 N, so both sides balance."
   -> 1/3, no tag at all: the regex needs the word "substitut…" or "… into the equation"
```

Fix (verified), two edits to the same common error:
- widen the pattern to the two phrasings a verification actually uses:
  `"regex": "\\bsub(?:stitut\\w*|bing)\\b[^.;\\n]{0,40}\\b650\\b|\\b650\\b[^.;\\n]{0,30}\\b(?:into|in) the equation\\b|\\bif\\s+m\\s*=\\s*650\\b|\\bboth sides\\b"` — tested: fires on both verifications above, quiet on the accepted answer and on a bare correct derivation (a full derivation followed by a check is marked correct before the pattern is ever consulted, so it is safe).
- reword the feedback so it describes the exam cap without promising marks this part has not paid:
  `"Putting 650 into the equation and checking both sides agree is verification, not a derivation: CCEA caps that route at two of the three marks, and the forming and collecting lines it skips are the two marks being looked for here. Start from the forces and solve for $M$."`
After both edits the two verifications score 1/3 with the tag and a feedback line that matches the number on the card; the accepted answer still scores 3/3.

Related, for the author to decide (measured, not recommended blind): because the engine cannot apply the scheme's `W1.dependsOn: ["MW2"]` to key-word groups, copying the printed answer pays a mark — `"M = 650"` and `"650 kg"` each score **1 of 3**, which diagnostic item 08 option (c) tells the learner "shows nothing". Merging the last two groups (`{any:["10.8m","10.8 m","7020/10.8","7020 / 10.8"], marks: 2}` and dropping the `650` group) makes `"M = 650"` → 0/3 and keeps the full derivation at 3/3, but it also drops "forming line + answer, no collecting line" from 2/3 to 1/3 and the verification route to 0/3, i.e. further from CCEA's cap.

## 6. (Medium) Four figures: the vertical acceleration arrow draws nothing

Items: `we.fm.u2.newtons-second-law-linear.02` figure, `q.fm.u2.newtons-second-law-linear.0012` `figures[0]`, note blocks `[22]` and `[27]`.

Current text (identical in all four):
`<path d='M235 78L235 78' … stroke-dasharray='1 0'/><path d='M235 78l0 -5M235 78l0 5' …/>` with the label `<text x='235' y='82' text-anchor='end' …>a</text>` (WE 02, note[22]) or `…>0.8 m/s²</text>` (q.0012, note[27]).

Why it is wrong: the shaft runs from (235, 78) to (235, 78) — zero length — and the "head" is two collinear vertical strokes at the same point, so what renders is a 10 px tick sitting on the cable, not an arrow. The alt text promises "an open arrow marking the acceleration upwards" (and on q.0012 "accelerating upwards at 0.8 metres per second squared"), and the label, anchored `end` at x = 235, runs left into the tension arrow. The horizontal version in the same bundle is drawn correctly (`M205 78L265 78` plus `M265 78l-9 -5M265 78l-9 5`), which is the shape to copy.

Fix (verified: no zero-length segments, `svgDrawDefects` clean, nothing else occupies that band):
```
<path d='M340 142L340 78' fill='none' stroke='currentColor' stroke-width='1.3' stroke-dasharray='5 4'/><path d='M340 78l-5 9M340 78l5 9' fill='none' stroke='currentColor' stroke-width='1.3'/>
```
with the label moved to `<text x='348' y='86' text-anchor='start' font-size='12'>…</text>`. The lift rect spans x 187–283 and every other label is centred on x = 235, so x = 340 (label ending near x = 403 in the 470-wide viewBox) is clear of the box, the cable and the weight arrow.

## 7. (Low) All seven acceleration arrows: `stroke-dasharray='1 0'` renders solid, but three texts call the arrow dashed

Items: `we…01`, `we…02`, `q.0011 figures[0]`, `q.0012 figures[0]`, note blocks `[4]`, `[22]`, `[27]`.

Current text: `stroke-dasharray='1 0'` (1 unit on, 0 off — a solid line), while the in-figure caption on two of them reads `the dashed arrow is the acceleration, not a force` and note block `[5]` says `The dashed arrow marks the acceleration, and it is deliberately drawn differently`.

Why it is wrong: nothing about the line is dashed, so the sentence that explains the convention describes something the learner cannot see; the only difference from a force arrow is the unfilled head. `'1 0'` appears nowhere else in `packs/` (296 uses of `'5 4'`, 132 of `'4 3'`, 114 of `'6 4'`), so it is a slip rather than a house value.

Fix (verified): `stroke-dasharray='5 4'` on all seven acceleration shafts. The alts' "open arrow" and the captions' "dashed arrow" are then both true.

## 8. (Low) `q.fm.u2.newtons-second-law-linear.0011` `figures[0]`: the alt omits an element the drawing shows

Current text: `"alt": "A crate of mass 8 kilograms on a horizontal floor, pulled to the right by 50 newtons against a resistance to the left, with the normal reaction upwards and the weight of 80 newtons downwards."` The SVG also draws the acceleration arrow and its label `a` (`M205 78L265 78` + head + `<text …>a</text>`).

Why it is wrong: the worked-example figure with the identical drawing does describe it ("A separate open arrow above the box marks the acceleration to the right"), so a screen-reader learner meets an `a` in the follow-up parts that the alt never mentioned.

Fix: append to the alt — `A separate open arrow above the crate marks the acceleration to the right.` (The resistance is deliberately unlabelled in the drawing, which is right: part (a) asks for its value.)

## 9. (Low) `q.fm.u2.newtons-second-law-linear.0005` (main): the reversed-resultant error under-pays by one mark and its feedback miscounts the scheme

Current text: common error `fm.forces.resultant-direction-not-motion`, `value: -1`, `marksTypicallyEarned: 1`, feedback "… The size is right, so **the method mark (M) stands**; with up positive, the tension comes first."

Why it is wrong: the part has two method marks — `MW1` (weight = 400 × 10 = 4000) and `MW2` (the equation of motion) — and a candidate who writes 4000 − 4400 = 400a has earned both; only the accuracy/magnitude mark is lost. The same bundle pays 2 of 3 for the analogous slip in `q.0011(b)` ("The resultant is right, so the method marks (M) stand"). Verified: `"-1"` currently → 1/3.

Fix: `"marksTypicallyEarned": 2` and feedback "… The size is right, so the method marks (M) stand; with up positive, the tension comes first." (Re-running the probe then gives `"-1"` → 2/3, consistent with finding 2 and with 0011(b).)

## 10. (Low) `ftm.fm.u2.newtons-second-law-linear.01`: the correction silently rewrites a line the item calls correct

Current text: `studentWorking[2] = "Weight = 7 × 10 = 70 N"`, `correction[2] = "Weight = 70 N (for the diagram)"`, while `whatWentWrong` says "… **line 3 works it out correctly**, but it has no place in the equation of motion."

Why it is wrong: the reveal prints the four correction lines under the student's four, and two of them differ. The learner comparing them reads line 3 as a second mistake, against the item's own explanation and against `mistakeLine: 4`.

Fix: `correction[2]` → `"Weight = 7 × 10 = 70 N (for the diagram)"`, so only the flagged line changes. (Fix matching is unaffected: `"a = 4"`, `"a = 4 m/s²"`, `"28 = 7a, so a = 4 m/s²"` and `"28/7 = 4 m/s²"` all still match.)

---

### One app-side defect this item surfaces (not a bundle fix)

In `ftm…01`, the learner types the corrected line. `fixMatches` falls back to comparing the last number, and `lastNumber` in `src/components/items/mistake-marking.ts` reads the exponent out of an ASCII unit: `"a = 4 m/s^2"` → 2, `"a = 4 ms^-2"` → −2, so the right fix in caret form is rejected twice and the correction is revealed. The superscript spelling `"a = 4 m/s²"` matches. The fix belongs in `prepare()` / `lastNumber` (strip a trailing unit phrase, `m/s^2`, `ms^-2`, `N`, `kg` … before taking the last number) and is the app session's file — worth passing on, since every mechanics find-the-mistake with an m/s² answer has it.

### Checked and clean

- **Physics and arithmetic**: every value recomputed with g = 10 — both worked examples and their twins, all six note gates, all eight diagnostic items, all twelve questions (including the suvat links `s = ½at²` in 0009 and `v = u + at` in 0011(c)), and every `solutionProgram` evaluated independently. Every figure of the mark scheme agrees; the only disagreements are the two signed-value ones reported in finding 2. Common-error values match the slip they name everywhere except finding 3.
- **Scope**: within `FM2-NEW-01` ("a body in horizontal or vertical motion"; friction given as a value or per unit mass). `F = μR` is excluded in the statement and is called out in `notOnThisSpec`, in the note prose, in the video's "why" line and in retrieval prompt 04. No inclined plane, no connected particles, no momentum, no 9.8 anywhere.
- **Marking spellings**: units and symbols all accepted — `4 m/s^2`, `4 m/s²`, `4 ms⁻²`, `4 m s⁻²`, `a = 4`, `24 N`, `24N`, `24 newtons`, `12 kg`, `12 kilograms`, `50 metres`, `13 ms⁻¹`, `13 metres per second`, fractions `13/4`, `75/2`, `2/5`. Every authored common-error value fires and pays what it claims (except findings 3 and 9); no wrong answer earns full marks.
- **Text marking (0012a)**: six paraphrases of the derivation all score 3/3 — `T - Mg` phrasing, prose phrasing, no spaces, Unicode minus, reversed collection. Partial derivations score 2/3 with an accurate "still missing" line.
- **MCQ and diagnostics**: eight diagnostic items, one question MCQ and two choice gates — exactly one correct option each, no duplicate texts, every distractor wrong and given feedback, misconception ids all in the registry.
- **Find-the-mistake**: one wrong line (line 4), the fix fixes it, `marksEarnedAsWritten` = the two method marks the working really earned.
- **Figures and leakage**: no question figure prints a part's answer (0011 labels the resistance by name, not 24 N; 0012 shows `M kg` and `Mg`, not 650).
- **Structure**: hero first with a lede, `can` of 3, `minutes: 7`; sections between gates 62–110 words (limit ~150); "You can now" present (57 words); closing "In the exam" panel 64 words (limit 80); scheme marks sum to every part's tariff and every question's total; time allowance exactly 72 s per mark throughout.
- **Encoding**: 2,579 strings scanned — no unpaired `$`, no `${`, no `undefined`/`NaN`, no bare or doubled TeX command inside maths, no mangled heredoc regex. The shipped `lintContent`, `lintNoteBlocks` and `lintKeyWords` all return zero findings, before and after the fixes above.

**Verdict:** content-sound and arithmetically clean throughout, but not shippable as marked — two parts score a correct answer zero (findings 1 and 2), and eight smaller fixes to common errors, feedback wording and four broken figure arrows are needed before this goes in front of a learner.
