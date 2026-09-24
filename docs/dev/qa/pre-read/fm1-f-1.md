# FM1 batch F — pre-read

Four newly authored CCEA GCSE Further Mathematics Unit 1 bundles: `area-under-curve`,
`logarithms-from-indices`, `log-log-graphs`, `indicial-equations`
(`packs/further-maths/content/fm1/<slug>/bundle.json` + `note.blocks.json`).

Read 20 September 2026. Digests: `docs/dev/qa/pre-read/fm1f-<slug>.digest.txt`.

## What was checked, and how

- **Mathematics.** Every definite integral recomputed by a 2,000,000-strip midpoint Riemann sum;
  every logarithm, index law, log-law step and log-log line recomputed directly; every indicial
  solution back-substituted into **both** sides, exactly and at the rounded answer; every
  `commonError` value reproduced from the misconception it names. **All 23 integrals, all 21
  logarithm values, every log-log table entry, gradient and intercept, and all 9 indicial solutions
  are right**, and every one of the 49 `commonError` values across the four bundles' 52 parts is
  exactly the number the named slip produces. (`scratchpad/fm1f-maths.mjs`)
- **Marking.** 178 responses fed to `markAnswer(raw, part.answer, { marks, prompt: stem, commonErrors })`
  — accepted answers, worked-solution final lines, plausible correct spellings (exact fractions and
  decimals, `x = 3` / `3` / `3.0`, unicode minus, trailing zeros) and plausible wrong answers
  (below-axis sign dropped, base and index swapped, gradient inverted, intercept left as log k,
  brackets omitted, rounded early). Plus every MCQ option by id, every table cell, and the plot
  part against `plotLattice`. (`scratchpad/fm1f-mark.mts`, `fm1f-mark2.mts`, `fm1f-mark3.mts`)
- **Lint.** `lintContent` + `lintNoteBlocks` on all four bundles: **0 defects**. No unpaired `$`,
  no `${`, no `undefined`/`NaN`/`null`, no double-backslash mangling, no regex `commonErrors` at
  all (every pattern is `kind: "numeric"`, so section (d) has nothing to fire wrongly).
- **Structure.** Hero first with lede, `can` of 3 and `minutes` in all four; longest prose run
  between gates 147 words (area-under-curve, the closing mustknow/In-the-exam run), every other
  run ≤ 125; closing panels 77 / 53 / 58 / 62 words, all under 80.
- **Figures.** Every area figure's drawn curve checked against its stated equation by recovering the
  axis mapping from the tick labels: **max |y − f(x)| ≤ 0.012 units on all 12 question figures**, and every shaded
  span matches the stem's ordinates (including the two-region figures 0007 and 0012).
  Every log-log table figure's blank cells line up with the `table` answer's row/col addresses.
  (`scratchpad/fm1f-geom.mjs`)

The 52 parts are 42 `numeric`, 4 `mcq`, 3 `table`, 2 `text` and 1 `graph`, plus 5 numeric twins —
no `algebraic` answers at all. Nothing here relies on the algebra engine distinguishing a
single-logarithm from an expanded-logarithm form, so that caveat does not bite in this batch.

---

## area-under-curve

### A1 — the bundle drills a skill its own note frontmatter, and CCEA, exclude (major)

`data/spec/further-mathematics.json` FM1-INT-04 `teacherGuidance` ends:
"Students will be asked to integrate the area between a curve, x-axis, and two ordinates x = a and
x = b. **Excluding combinations of positive and negative areas.**"
`bundle.note.notOnThisSpec[0]` agrees: `"Combinations of positive and negative areas in one region"`.

One `notonspec` callout covers the note section that teaches it (`note.blocks.json[22]`,
"Beyond what CCEA asks"), and gate `g5` sits inside that section. Everywhere else the skill is
presented as required, with no marker:

| where | exact current text |
| --- | --- |
| `note.blocks.json[0]` hero `can[3]` | "Split a region at the root where the curve crosses the axis, and add the two areas" |
| `note.blocks.json[29]` mustknow, last line | "Split a region at a root and add the two sizes." |
| `bundle.note.sheet.mustBeAbleTo[6]` | "Split a region at a root and add the two sizes" |
| `q.fm.u1.area-under-curve.0007` (main), 4 marks, `specRefs: ["FM1-INT-04"]` | "The curve $y = x^{2} - 4$ crosses the $x$-axis at $x = 2$.\nFind the total area enclosed by the curve, the $x$-axis and the ordinates $x = 0$ and $x = 4$." |
| `dx.fm.u1.area-under-curve.post` item `d3` (`hypercorrectionQueue: true`) | "The curve $y = x^{2} - 4$ crosses the $x$-axis at $x = 2$. What is the total area between the curve, the $x$-axis and the ordinates $x = 0$ and $x = 4$?" |
| `rp.fm.u1.area-under-curve.05` | "What do you do when the curve crosses the $x$-axis between the two ordinates?" |

Why it is wrong: q.0007 is styled `practice` with difficulty 4 and claims FM1-INT-04, so it reads as
an exam-shaped item for content CCEA will not set; `d3` is a **post**-diagnostic on the hypercorrection
queue, so a learner who misses it is told she has not mastered the topic and is sent back to re-drill
excluded material; and the three "you can now" promises contradict the bundle's own `notOnThisSpec`.
The scope-tier verification record (`bundle.verification[0].checks[1].detail`) says "The crossing
region is taught with a notonspec callout … no question asks for an area between two curves, an
improper integral, or a volume of revolution" — true, but it does not notice that q.0007 *is* the
excluded case.

Fix (keeps the teaching, which is well judged, and removes the claim that it is examinable):
1. Reword `can[3]` to "If a region ever crosses the axis — beyond what CCEA asks — split at the root
   and add the two sizes", and the mustknow line and `sheet.mustBeAbleTo[6]` to match.
2. Replace `d3` with an on-spec post item (a limits-from-the-intercepts item, matching gate `g6`,
   is the gap: `d4` asks *which* limits, nothing asks the learner to compute that area).
3. Either drop `q.fm.u1.area-under-curve.0007` from the bank, or open its stem with the same
   sentence the callout uses ("CCEA excludes regions that cross the axis; this one is insurance.").
   The remaining 11 questions still cover FM1-INT-04 in full.

### A2 — ten question figures print raw LaTeX as the curve's label (major)

`src/components/items/Tex.tsx` renders a string with no `$` as-is, and an SVG `<text>` node renders
its characters literally. `q.fm.u1.area-under-curve.0002` `figures[0]` ends:

```
<text x='280' y='292' … text-anchor='middle'>y = 3x^{2}</text></svg>
```

so the learner sees `y = 3x^{2}` under the graph — braces, caret and all. No `tspan`, no
`foreignObject`. The same defect in nine more figures:

| item | current label text |
| --- | --- |
| 0002 | `y = 3x^{2}` |
| 0003 | `y = x^{2} + 2x` |
| 0004 | `y = -x^{2} + 4` |
| 0005 | `y = x^{2} - 9` |
| 0006 | `y = 3x^{2} - 12` |
| 0007 | `y = x^{2} - 4` |
| 0008 | `y = -x^{2} + 6x` |
| 0009 | `y = x^{2}` |
| 0011 | `y = x^{2} - 5x + 4` |
| 0012 | `y = -2x^{2} + 8` |

The same LaTeX also sits in each figure's `<title>` and `aria-label` — e.g. 0002's is
`The curve y equals 3x^{2} with the region between x equals 1 and x equals 2 shaded` — so a screen
reader says "three x caret open brace two close brace", while the outer `alt` on the same figure is
correct prose ("The curve y equals 3x squared …"). 44 occurrences over 17 figures (10 question
figures, both worked examples, note blocks 3, 12, 16, 21, 26). **Only this bundle**: the other three
use the caret convention (`2^x = 40`, `F = kh^n`, `3^4 = 81`), which renders acceptably.

Fix: in each `<text>` label write `y = 3x^2`, `y = x^2 + 2x`, … (or raise the index with a `<tspan>`),
and rewrite every `<title>`/`aria-label` to the prose the outer `alt` already carries.

### A3 — `listingRule: true` on a coordinates answer wipes out correct answers (real)

`q.fm.u1.area-under-curve.0011` part (a):

```json
"answer": { "kind": "text",
  "accepted": ["(1, 0) and (4, 0)", "(1, 0), (4, 0)", "x = 1 gives (1, 0) and x = 4 gives (4, 0)"],
  "keyWords": [{"any":["(1, 0)","1, 0"],"marks":1},{"any":["(4, 0)","4, 0"],"marks":1}],
  "listingRule": true }
```

`countListedItems` (`src/components/items/text-marking.ts:135`) splits on `,` and `and`, and every
coordinate pair carries a comma, so it counts "(4, 0) and (1, 0)" as **4** items against 2 key-word
groups and takes a 2-mark penalty. The three `accepted` strings survive only because `markText`
short-circuits on an exact accepted match; prose answers survive because a segment over 4 words
makes `countListedItems` return 1. Anything terse and not in `accepted` is destroyed:

```
"(4, 0) and (1, 0)"  -> 0/2  "Listing rule: more answers were given than asked for, so 2 marks are lost."
"(4, 0), (1, 0)"     -> 0/2  same
"(1, 0) & (4, 0)"    -> 1/2  "…so 1 mark is lost."
```

The message is also misleading: she gave exactly the two points asked for.

Fix: `"listingRule": false`, as `q.fm.u1.area-under-curve.0012` part (a) already has. Verified: all
13 correct spellings then earn 2/2 and "(1, 0)" alone still earns 1/2 with "still missing (4, 0)".
Nothing is lost — the part names exactly two points, so there is nothing to over-list.

### A4 — gate g5's explanation states a false comparison (real)

`note.blocks.json` gate `g5`, `explain`:

> "Take the size of each piece and add: $\frac{16}{3} + \frac{32}{3} = 16$. Adding the signed values
> instead would give $\frac{16}{3}$, **which is smaller than either piece.**"

The two pieces have sizes $\frac{16}{3}$ and $\frac{32}{3}$. The signed sum is
$-\frac{16}{3} + \frac{32}{3} = \frac{16}{3}$, which is **equal to** the left piece, not smaller than
it. Fix: "…would give $\frac{16}{3}$, which is the difference of the two sizes rather than their
total." (The note's own prose at block 20 states it correctly: "the negative part cancels some of the
positive part".)

### A5 — find-the-mistake working prints LaTeX braces (real)

`ftm.fm.u1.area-under-curve.01`, `studentWorking[0]` and `[1]`, rendered through `<Tex>` in
`FindTheMistake.tsx:138`:

```
"Area = integral from 0 to 2 of (3x^{2} - 12) dx"
"= [x^{3} - 12x] from 0 to 2"
```

Neither has `$` delimiters, so both render with the braces showing. Fix: `$\int_{0}^{2} \left(3x^{2} - 12\right) dx$`
and `$\left[x^{3} - 12x\right]_{0}^{2}$` — or the plain `3x^2` / `x^3` spelling the log-log and
indicial find-the-mistake items already use. (The rest of the item is sound: exactly one wrong line
— line 6, the only one — the fix fixes it, and `marksEarnedAsWritten: ["MW1","M2","M3"]` = 3 of 4
agrees with q.0006's `negative-area-left` commonError of 3.)

### A6 — `region-not-split-at-root` never fires on a rounded answer (real, 1 mark)

`q.fm.u1.area-under-curve.0007` commonError pattern:
`{"kind":"numeric","value":5.333333333333333}` with no `tolerance`, which `matchesCommonError`
reads as absolute 0 — exact match only.

```
"16/3"              -> 1/4  fm.int.region-not-split-at-root   (fires)
"5.333333333333333" -> 1/4  (fires)
"5.33"              -> 0/4  "That is not the expected answer. Check each step of your working."
"5.333"             -> 0/4  same
```

`acceptForms` is `["decimal","fraction"]`, so a decimal is exactly what a learner is invited to type,
and 5.33 is what she will write. Fix: add `"tolerance": {"type":"absolute","value":0.005}` to the
pattern. Verified: 5.33 and 5.333 then earn 1/4 with the authored diagnosis and the tag, while
"16" still earns 4/4 and "32/3" still earns 0.

### A7 — exact-fraction parts reject a mixed number (low)

`q.0004` (main), `q.0009` (main), `q.0012` (b), `q.0012` (c) all say "Give your answer as an exact
fraction" with `acceptForms: ["fraction"]`. All four values exceed 1 (32/3, 7/3, 32/3, 14/3), so a
mixed number is a natural correct spelling, and it scores zero:

```
0004 "10 2/3" -> 0/4  "The value is right, but the question wants a fraction or a whole number rather than a mixed number."
0009 "2 1/3"  -> 0/3  same
```

Fix: `acceptForms: ["fraction","mixed"]`. Verified: the mixed spellings then earn full marks and
"10.67" / "2.33" are still rejected, which is the point of the instruction. Judgement call —
`["fraction"]` alone is the repo convention (27 of 29 fraction parts), but those are mostly
probabilities below 1, where a mixed number cannot arise.

### A8 — a commonError cites a report that records the opposite (low)

`q.fm.u1.area-under-curve.0007`'s commonError carries
`"source": "ccea-cer:further-maths:2022-summer:FM1:Q10"` for `fm.int.region-not-split-at-root`, but
the bundle's own insight record for that source reads: "asked Area between a curve and the x-axis
where the region is below the axis … **Well answered even by weaker candidates**: correct limits and
the negative area handled." That report neither set a crossing region nor recorded this slip. Fix:
drop the `source`, or cite it as an authored trap rather than an examiner finding.

**Clean in this bundle:** all 23 integrals and every area's sign convention; all 15 parts' marking
apart from A3, A6 and A7; all 8 diagnostic items (one correct option each, no duplicate texts,
every distractor genuinely wrong with its own feedback); the figure geometry; the note structure;
lint.

---

## logarithms-from-indices

Mathematically and structurally **clean**. Every logarithm, every index form, every anchor value and
every commonError value recomputes; the MCQ at `q.0007(a)` has exactly one correct option and all
three distractors are genuinely false (log₄1296 = 5.170, log₁₂₉₆6 = 0.250, log₆4 = 0.774); every one
of the 12 parts marks the way its scheme says, including the 3-dp accuracy demand at `q.0006`
("2.67" → 0, "2.6721" → 0, "2.672" → 1). No off-spec content: no change of base, no natural logs.

### L1 — log₂64 is the only number in three separate places (low)

`we.fm.u1.logarithms-from-indices.01`'s twin stem is "Work out $\log_{2} 64$." — word for word
`q.fm.u1.logarithms-from-indices.0001` part (a), and the post-diagnostic `d1` asks "What is
$\log_{2} 64$?" as well. A twin is meant to be the same method on new numbers, so the learner meets
the identical item three times in one bundle. Fix: give the twin fresh numbers that no bank item
uses — `\log_{4} 256` or `\log_{3} 243` both fit the "count the powers" method and neither appears
elsewhere. (See the cross-bundle note below: this happens in three of the four bundles, and in two
previously published FM1 bundles, so it may be house practice rather than a batch slip.)

---

## log-log-graphs

The plot part is **clean** and worth saying so. `q.fm.u1.log-log-graphs.0009` (b),
`kind: "graph"`, `plot: "points-line"`: `plotLattice` derives x {lo 0, hi 1.4, major 0.2, minor 0.04}
and y {lo 0, hi 3, major 0.5, minor 0.05}, `unreachable` is empty, and every table point lands
within the stated tolerance of 0.02 (worst is (0.954, 2.033) at 0.006 / 0.017). `lineThrough` states
its two points ((0, 0.602) and (1.398, 2.699)), `lineRequired` is true and the tolerance is stated.
Marking the exact table values and the tap-reachable snapped values both give 3/3; points without
the line give 2/3. All three table parts address exactly the cells their figure leaves blank, and
every figure label matches its alt.

### G1 — `gradient-inverted` never fires on a rounded answer, costing a mark (real)

`q.fm.u1.log-log-graphs.0003` (main) and `q.fm.u1.log-log-graphs.0009` (c) both carry:
`{"kind":"numeric","value":0.666666667}` with no `tolerance` → exact match only. No learner writes
nine decimal places:

```
q.0003  "0.666666667" -> 1/2  fm.logs.gradient-inverted   (fires)
q.0003  "0.6667"      -> 0/2  (no tag)
q.0003  "0.667"       -> 0/2  (no tag)
q.0003  "0.67"        -> 0/2  (no tag)
```

`marksTypicallyEarned` is 1 of 2, so a learner who inverts the gradient — the slip the insight
records name in 2022 Q12 and 2025 Q10 — loses that mark and gets the engine's generic near-miss
instead of the authored diagnosis. Fix: add `"tolerance": {"type":"absolute","value":0.005}` to both
patterns. Verified: 0.6667, 0.667 and 0.67 then all earn 1/2 with the tag and the authored feedback,
while "1.5" still earns 2/2 and "0.602" still hits `gradient-intercept-swapped`.

### G2 — the same shape at two more parts, feedback only (low)

`q.0006` (`4.540303`) and `q.0010` (d) (`3.570953`), both `marksTypicallyEarned: 0`. A learner who
puts the logarithm into the power law writes 4.54 or 3.57 and gets "That is not the expected answer.
Check each step of your working." instead of the authored `log-values-in-original-equation`
diagnosis. No marks move either way. Same fix, same tolerance; verified.

### G3 — the twin repeats q.0010(c)'s numbers (low)

`we.fm.u1.log-log-graphs.01`'s twin is "a straight line of gradient $2$ meeting the vertical axis at
$0.699$ … Find $k$" — the same two numbers and the same answer (5.0) as `q.0010` (c). The context
differs (P against d rather than the generic line), so this is the mildest instance of the pattern.

**Clean:** all five table readings on both contexts satisfy their power law exactly (4h^1.5 gives
4, 32, 108, 256, 500 at h = 1, 4, 9, 16, 25; 5d² gives 20, 80, 180, 320, 500 at d = 2, 4, 6, 8, 10),
both gradients (1.5 and 2.0) and both intercepts (10^0.602 = 3.9994 → 4.0; 10^0.699 = 5.0003 → 5.0),
the prediction 4.0 × 12.25^1.5 = 171.5 exactly, the pump rounding, all three MCQs, all three tables
and all seven gates (including g7, 4.0 × 7^1.5 = 74.081 → 74.1).

---

## indicial-equations

Every one of the nine solutions back-substitutes into both sides exactly (e.g. q.0007(a)
x = 6.223197 gives 2^(4x+1) = 7^(x+3) = 62 302 482.17 on both sides), every commonError value is the
number its named slip produces, and every part marks the way its scheme says — including "x = 5.32"
and "x=2" earning full marks and the unrounded "5.321928" earning none. The find-the-mistake item
has exactly one wrong line (line 2), the correction fixes it, and `marksEarnedAsWritten: ["M1"]`
agrees with q.0003's `brackets-omitted` commonError of 1.

### I1 — the find-the-mistake stem and first line mis-state the equation (real)

`ftm.fm.u1.indicial-equations.01`:

```
stem               : "Cara was asked to solve 7^3x - 1 = 200 correct to two decimal places. Her working:"
studentWorking[0]  : "log(7^3x - 1) = log 200"
```

Read as printed, `7^3x - 1` is 7³·x − 1 = 343x − 1, not 7^(3x−1). The item is *about* the extent of
an index, so printing the index's extent ambiguously undermines it — and line 2,
"3x - 1 log 7 = log 200", is the student's own error, which a learner cannot distinguish from line 1
if line 1 is ambiguous too. The question that shares the equation writes it correctly:
`q.fm.u1.indicial-equations.0003` has `$7^{3x - 1} = 200$`.

Fix: stem → "Cara was asked to solve $7^{3x - 1} = 200$ correct to two decimal places. Her working:";
`studentWorking[0]` → `$\log\left(7^{3x - 1}\right) = \log 200$`. Leave lines 2–5 exactly as they
are — line 2 is the mistake and is correctly printed without a bracket.

### I2 — the method figure prints "53x - 2 = 40" (real)

The worked example's figure (`we.fm.u1.indicial-equations.01`) and the identical
`note.blocks.json[7]` figure both contain:

```
<text x='30' y='34' …>53x - 2 = 40</text>
<text …>log(53x - 2) = log 40</text>
```

The exponent marker is gone entirely, so the first line of the "four moves, in the same order every
time" figure reads "53x - 2 = 40". The figure's `alt` and `<title>` are correct ("Five lines of
working solving 5 to the power 3x minus 2 equals 40"), and the same bundle's block 3 figure uses the
caret correctly ("2^x = 40"), so this is two text nodes out of step with the bundle's own convention.
Fix: `5^(3x - 2) = 40` and `log(5^(3x - 2)) = log 40`. Lines 3–5 of that figure
("(3x - 2) log 5 = log 40", "3x - 2 = log 40 / log 5", "x = 1.43") are already right.

### I3 — the twin repeats q.0003, which the find-the-mistake also uses (low)

`we.fm.u1.indicial-equations.01`'s twin is "Solve the equation $7^{3x - 1} = 200$, giving your answer
correct to two decimal places" — the same equation as `q.fm.u1.indicial-equations.0003` and as the
find-the-mistake item, so 7^(3x−1) = 200 appears three times in one bundle. Fix: a fresh equation of
the same shape for the twin, e.g. $4^{2x - 3} = 150$.

---

## Cross-bundle note — worked-example twins repeat a bank question

In three of these four bundles the twin is numerically the same item as a practice question in the
same bundle (area-under-curve `we.01` twin ≡ `q.0003` word for word, and `we.02` twin ≡ `q.0005`;
logarithms-from-indices `we.01` twin ≡ `q.0001(a)` word for word; indicial-equations `we.01` twin ≡
`q.0003`), and in the fourth it repeats `q.0010(c)`'s numbers. A scan of all 26 published FM1
bundles finds the same in `laws-of-logarithms` (twice) and `optimisation`, so this is not new to
batch F — flagged once here so the reviewer can decide whether it is house practice or a pattern
worth fixing in the generator.

---

## Verdicts

- **area-under-curve** — mathematically flawless (all 23 integrals, both sign conventions, every
  figure drawn to within 0.012 of its stated curve), but not ready: a 4-mark practice question and a
  post-diagnostic drill CCEA's excluded "combinations of positive and negative areas" with no
  marker (A1), ten figures print `y = 3x^{2}` on screen (A2), and `listingRule: true` on the
  coordinates part destroys correct answers (A3).
- **logarithms-from-indices** — clean; every value, every mark and every distractor checks out. One
  low-severity repetition (log₂64 three times).
- **log-log-graphs** — clean on the mathematics, the plot lattice, the tables and the figures; one
  real marking fix wanted, the `gradient-inverted` commonError needs a tolerance so it fires on a
  rounded answer (G1).
- **indicial-equations** — clean on the mathematics (every solution back-substitutes on both sides);
  two rendering fixes wanted, both about an index's extent: the find-the-mistake equation (I1) and
  the method figure's first two lines (I2).
