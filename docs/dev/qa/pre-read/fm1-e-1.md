# FM1 calculus pre-read — curve sketching, optimisation, integration, definite integrals

Pre-read of four newly authored FM1 bundles, 20 Sep 2026. Everything below was reproduced with
scripts in the session scratchpad; digests are beside this file as `fm1e-<slug>.digest.txt`.

What was checked: every root, intercept, turning point, optimisation answer and nature (second
derivative *and* a 200 000-point scan), every indefinite integral differentiated back, every
definite integral by Simpson's rule at n = 200 000, every worked-example step, twin and
commonError value; every marking encoding against `src/lib/marking` and `src/components/items/mark.ts`
(`markAnswer(raw, part.answer, { marks, prompt })`); text answers for paraphrase and reversal;
commonError regexes; graph specs against `plotLattice`; every SVG's drawn geometry against its alt;
MCQ and find-the-mistake integrity; and note shape.

All four bundles were rewritten at 15:54 while this pre-read was running (the "You can now" callout
became a heading plus paragraph and a fifth retrieval prompt was added). Every scan and every
marking probe below was re-run against the rewritten files afterwards and came back byte-identical
outside those note blocks, so every finding here is against the current content.

**The mathematics is clean in all four bundles.** Not one root, intercept, turning point, nature,
integral, worked step, twin, distractor value or commonError value is wrong, and nothing goes beyond
FM1-DIF-02 / FM1-INT-01..03 without a `notonspec` callout. The findings below are all marking
encodings, two figures and two presentation slips.

Severity: **H** = a learner is marked wrongly today; **M** = a learner is marked unfairly or a figure
misleads; **m** = tidy-up.

---

## 1. curve-sketching-quadratic-cubic

### CS-1 (H) `q.fm.u1.curve-sketching-quadratic-cubic.0011` part (e) — a reversed answer earns the mark

Current encoding:

```json
"keyWords": [{ "any": ["positive", "greater than zero", "above zero"], "marks": 1 }]
```

Marked today:

| response | awarded |
| --- | --- |
| `12 is positive so it is a maximum` | **1/1 "Every marking point is there."** |
| `The second derivative is 12, which is positive, so this turning point is a maximum` | **1/1** |
| `d2y/dx2 = 12 > 0, so it is a minimum` (correct) | **0/1** |

Why it is wrong: the only test is the sign word, so naming the wrong kind of turning point costs
nothing. The part's commonError regex `(negative|less than zero|below zero)[^;\n]*(minimum)|(minimum)[^;\n]*(negative)`
catches only the opposite slip (wrong sign, right nature), and in any case `markText` never lets a
commonError raise marks. The symbolic spelling `> 0` is not in the list, so a correct answer that
uses it earns nothing.

Fix (re-run and verified):

```json
"keyWords": [{ "any": ["positive", "greater than zero", "above zero", "> 0"], "reject": ["maximum"], "marks": 1 }]
```

After the fix: both `accepted` answers 1/1; `d2y/dx2 = 12 > 0, so it is a minimum` 1/1; `At x = 6 the
second derivative is 12, which is above zero, so the point is a minimum` 1/1; both reversed answers
0/1; `…which is negative, so it is a minimum` 0/1.
Caveat: `…so it is a minimum and not a maximum` would then be rejected (0/1). Rare enough to accept,
or add `"minimum"` to the group's `any` as a second, marks-0 group if that phrasing matters.

### CS-2 (H) `q.fm.u1.curve-sketching-quadratic-cubic.0010` part (d) — the same defect, mirrored

Current: `"keyWords": [{ "any": ["negative", "less than zero", "below zero"], "marks": 1 }]`

- `The second derivative is -2, which is negative, so this is a minimum` → **1/1** (the point is a maximum).
- `Because -2 is less than zero the point is a minimum` → **1/1**.
- `d^2y/dx^2 = -2 < 0, so it is a maximum` (correct) → **0/1**.

Fix (verified): `{ "any": ["negative", "less than zero", "below zero", "< 0"], "reject": ["minimum"], "marks": 1 }`
→ both `accepted` answers 1/1, the symbolic answer 1/1, both reversed answers 0/1.

### CS-3 (M) `q.fm.u1.curve-sketching-quadratic-cubic.0011` part (c) — the show-that regex is inside out

Current: `"regex": "^[^=\\n]{0,40}(x\\^?3|x³)[^\\n]{0,60}$"`

- On `y = x^3 - 12x^2 + 36x - 32` — the exact copy-down the pattern exists to catch — it does **not**
  fire: `[^=]{0,40}` cannot cross the `=` of `y =`.
- On the part's own `accepted[1]`, `x² - 4x + 4 times x - 8 gives x³ - 12x² + 36x - 32`, it **does**
  fire. Any paraphrase of that line that misses a key word is therefore diagnosed as "you copied the
  printed cubic down".

Fix (verified): `"regex": "^\\s*(y\\s*=\\s*)?(x\\^?3|x³)[^\\n]{0,45}$"` — fires on
`y = x^3 - 12x^2 + 36x - 32` and on the bare `x³ - 12x² + 36x - 32`, quiet on both accepted answers
and on `x^2 - 4x + 4 times x - 8 gives x^3 - 12x^2 + 36x - 32` (still 2/2).

### CS-4 (M) `q.fm.u1.curve-sketching-quadratic-cubic.0008` (main) — commonError over-credits by one

Current: `fm.sketch.second-turning-point-dropped`, pattern `(1, 4)`, `marksTypicallyEarned: 3`.

The scheme is MW1 `dy/dx = 3x² - 12x + 9`; M1 setting it to zero and factorising; W1 **"x = 1 and
x = 3"**; W2 "(1, 4) and (3, 0)". A response of `(1, 4)` — whose feedback says "the second factor
gives the other one", i.e. the second root was never found — cannot earn W1 or W2, so 2 is the honest
figure. (The parallel error in q.0011 (d) earns 4 of 5 correctly, because that scheme pays for the
roots and for each height separately.)

Fix (verified): `marksTypicallyEarned: 2` → `(1, 4)` scores 2/4, `(1, 4), (3, 0)` still 4/4.

### CS-5 (m) `q.fm.u1.curve-sketching-quadratic-cubic.0011` part (a) — repeated root written twice scores nothing

`(2, 0), (2, 0), (8, 0)` → **0/2**, although M1 "setting each factor to zero" is plainly earned and
the repeated factor is the whole point of the question.

Fix (verified): add, first in `commonErrors`:

```json
{ "misconception": "fm.sketch.repeated-root-counted-twice",
  "pattern": { "kind": "text", "regex": "\\(\\s*2\\s*,\\s*0\\s*\\)[^()]*\\(\\s*2\\s*,\\s*0\\s*\\)" },
  "feedback": "Both factors have been solved, so the method mark stands. The squared bracket is zero at one place only, so $(2, 0)$ is written once; the curve touches the axis there rather than crossing it.",
  "marksTypicallyEarned": 1 }
```
→ `(2, 0), (2, 0), (8, 0)` 1/2; `(2, 0), (8, 0)` still 2/2; the origin error still 1/2.

### Clean in this bundle

- Maths: every crossing, y-intercept, turning point and nature in the note, both worked examples,
  both twins, all 8 diagnostics and all 11 questions recomputed — all correct, including
  `(20/3, -400/27)` and its decimal `-14.81`.
- Figures: the four graph SVGs were calibrated from their own tick labels and the drawn polylines
  match the stated functions to within the polyline step; every marker sits on its labelled point
  ((1,0), (5,0), (0,5), (3,-4); (0,0), (5,0), (8,0), (2,36), (6.67,-14.81); (0,-32), (2,0), (8,0),
  (6,-32)); the alt text matches what is drawn.
- Graph parts (0009, 0010 e, 0011 f): every expected sample is on the true curve and on the lattice
  (`plotLattice` reports no unreachable target), tolerance `absolute 0.1` stated on all three, and an
  exact placement scores full marks.
- MCQ/diagnostics: exactly one correct option each, no duplicate texts or ids, feedback on every
  option, genuinely wrong distractors.
- Find-the-mistake: one wrong line (2), the fix fixes it, `marksEarnedAsWritten: []` is right.
- Note: hero first with lede, `can` × 3, 16 minutes; **nine gates** as designed; longest section
  between gates 127 words; closing pointer 67 words; no unpaired `$`, no `${`, no `undefined`/`NaN`.

**Verdict: publishable after CS-1 to CS-4; the mathematics and figures need no work.**

---

## 2. optimisation

### OP-1 (H) `q.fm.u1.optimisation.0015` — the figure is the wrong diagram

The question is two pens side by side against a barn wall: 36 m of fencing over two ends, the divider
and the far side, each end and the divider x m, answer x = 6, y = 18, greatest area 108 m².

The attached SVG is a copy of the single-enclosure bed figure. Its `<title>` and `aria-label` read
"A rectangular garden bed against a wall: two sides of 12 metres and one of 24 metres, enclosing 288
square metres", and its visible labels are `24 m, the side facing the wall`, `12 m`, `12 m`,
`area 288 m²`, `48 m of edging covers three sides only`. There is no divider in the drawing. Every
number in it contradicts the stem, and the screen-reader title states them as fact. The alt text
("A rectangular enclosure against a wall, fenced on three sides") describes the wrong picture too.

Fix: draw the two-pen figure — one rectangle split by a single vertical divider, the two ends and the
divider labelled `x`, the far side `y`, the wall drawn heavy along the top, and one caption
"36 m of fencing; the barn wall is free" — with alt "Two rectangular pens side by side against a barn
wall, the two ends and the divider each x metres and the far side y metres", and the `<title>` in
step with the alt.

### OP-2 (M) four figures label the solved optimum where the stem says x and y

| figure | drawn labels | what the stem says |
| --- | --- | --- |
| `we.fm.u1.optimisation.01` and `q.…0010#0` | `12 m`, `12 m`, `24 m, the side facing the wall`, `area 288 m²` | "two sides of x metres" (the alt's own words); q.0010 asks for **y in terms of x** |
| `we.fm.u1.optimisation.02` and `q.…0009#0` | `9 m across`, `6 m`, `area 54 m², fencing 36 m` | q.0009: "x m across and y m deep… write down an expression in x" |
| `q.…0017#0` | `24 m`, `12 m`, `12 m`, `area 288 m²` | (a)/(b) define x and y; **(c) asks for the value of x**, which the figure prints as 24 m |

So the picture contradicts the question it sits beside, and hands over the answers to q.0009,
q.0003/0004 (x = 9), q.0010 and q.0017 (c) (x = 24) before the learner starts. For
`we.…optimisation.01` the alt promises "two sides of x metres" and the drawing shows 12 m, so the SVG
does not draw what the alt says.

Fix: on the question figures, label the sides `x`, `y` (and the middle fence `y`) and keep only the
given constant — "48 m of timber", "area 54 m², 36 m of fencing", "area 288 m²; the river side is
free". The solved picture is fine in the note (blocks 15 and 29 already do this properly, with
`(12, 288)` and `(9, 36)` marked on graphs of A and L) and in a worked example's final step.

### OP-3 (H) `q.fm.u1.optimisation.0016` part (c) — a reversed answer earns both marks

Current group 2: `{ "any": ["positive", "greater than zero", "above zero"], "marks": 1 }`

- `The second derivative is 1600/x^3, which at x = 20 is 1/5, which is positive, so this is a maximum`
  → **2/2 "Every marking point is there."**
- `d2C/dx2 = 1600x^-3 = 1/5 at x = 20, a positive number, so the cost is greatest there` → **2/2**.
- `1600/x^3 at x = 20 is 0.2 > 0, so it is a minimum` (correct) → 1/2.
- `The second derivative is 1600 over x cubed; at 20 trays that is one fifth, which is positive, so
  the cost is least` (correct) → 1/2.

Fix (verified):

```json
"keyWords": [
  { "any": ["1600/x^3", "1600x^-3", "1600 over x cubed"], "marks": 1 },
  { "any": ["positive", "greater than zero", "above zero", "> 0"], "reject": ["maximum", "greatest"], "marks": 1 }
]
```
→ both `accepted` answers and both correct paraphrases 2/2; both reversed answers 1/2; the
sign-misread answer stays at 1/2 with its commonError tag.

### OP-4 (M) `q.fm.u1.optimisation.0014` part (b) — the bundle's own accepted wording passes only verbatim

`accepted[1]` is "The card is (w + 6) by (h + 8), so A = wh + 8w + 6h + 48, and with h = 300/w that
is 8w + 348 + 1800/w" and scores 2/2 **only because `markText` matches `accepted` as an exact
string**. Change four words and it fails:

- `The card is (w + 6) by (h + 8). Multiplying out gives wh + 8w + 6h + 48, and substituting
  h = 300/w gives 8w + 348 + 1800/w.` → **1/2, "still missing (w + 6)(h + 8)"**.

Group 1's `any` is `["(w + 6)(h + 8)", "w + 6 h + 8"]`; after normalisation the word "by" sits between
the brackets, so neither spelling is found.

Fix (verified): add `"w + 6 by h + 8"` to group 1's `any` → both paraphrases 2/2, and the copy-down
`A = 8w + 348 + 1800/w` still 0/2 with its show-that commonError.

### OP-5 (M) `q.fm.u1.optimisation.0017` part (a) — natural spellings of the constraint earn nothing

Current: `"any": ["xy = 288", "yx = 288"]`. The sibling part q.0014 (a) lists `"w x h = 300"`, so the
multiplication-sign spelling works there but not here.

- `x times y = 288, so y = 288/x` → **0/1**
- `Because the area xy is 288, dividing both sides by x gives y = 288/x` → **0/1**

Fix (verified): `"any": ["xy = 288", "yx = 288", "x x y = 288", "x times y = 288", "xy is 288"]`
→ all of `x times y = 288…`, `Area = x × y = 288…`, `Because the area xy is 288…` and
`The field is x by y with an area of 288, so xy = 288…` score 1/1, while the bare `y = 288/x` stays
0/1.

### OP-6 (M) `q.fm.u1.optimisation.0017` part (b) — a correct one-step substitution earns 1 of 2

Group 2 is `{ "any": ["2(288/x)", "2 x 288/x"], "marks": 1 }`, so a learner who substitutes in one
step loses the mark the scheme gives for substituting:

- `Only three sides are fenced: L = x + 2y. Replacing y with 288/x gives L = x + 576/x.` → **1/2**.

Fix (verified): add `"288/x"` to group 2's `any` → that answer 2/2, while `L = x + 576/x` (copy-down)
stays 0/2 and `L = 2x + 2y = x + 576/x` stays 0/2 with the `wall-side-fenced` tag.

### OP-7 (M) the right number without its unit scores zero

`q.0012` (main, 2 marks, 108 m²), `q.0014` (d, 2 marks, 588 cm²), `q.0015` (d, 2 marks, 108 m²) and
`q.0017` (d, 1 mark, 48 m) all carry `unitRequired: true`, so:

- `108` → **0/2**, "The number is right, but the answer needs a unit. Give it in m²."

The scheme's M1 ("substituting x = 6 into A") is plainly earned, so 0 is a mark too harsh on the
two-mark parts.

Fix (verified) for the three 2-mark parts — prepend to `commonErrors`:

```json
{ "misconception": "fm.optim.unit-omitted",
  "pattern": { "kind": "numeric", "value": 108 },
  "feedback": "The number is right and the substitution earns its mark. The quantity is an area, so the answer line needs its unit: $108$ m².",
  "marksTypicallyEarned": 1 }
```
→ `108` 1/2, `108 m²` 2/2, and the `final-quantity-not-evaluated` error (`6`) still 0/2.
`q.0017` (d) is a single mark, so there is nothing to split there; leave it.

### OP-8 (m) `ftm.fm.u1.optimisation.03` — feedback and earned marks disagree

`marksEarnedAsWritten: []`, but the feedback reads "The calculus is faultless, and in a real paper the
follow-through would rescue some of it. **The lost mark is the first one.**" One of the two has to
move: either list the follow-through method marks in `marksEarnedAsWritten`, or reword to "the first
mark is the one lost outright, and it takes the accuracy marks with it".

### Observation, not a defect

Six parts say "showing clearly that it is a maximum/minimum" but take a bare number as the answer
(q.0005, q.0006, q.0013, q.0014 c, q.0015 c, q.0017 c), so the MW2 mark for the second derivative is
awarded for a number that cannot evidence it — full marks without ever doing the test. q.0016 shows
the pattern that works: (b) the number, (c) a text part for the second derivative. Worth a decision,
not a fix I would make blind.

### Clean in this bundle

- Maths: every constraint, substitution, derivative (including all the negative powers), stationary
  value, second derivative and final quantity recomputed; each optimum also confirmed by a
  200 000-point scan of the interval. All correct, including 4/9, 16/15, 3/5, 1/5 and 1/12, and the
  d1 distractor's 144 m².
- Spec: all nine contexts are flat and π-free (beds, plots, a printed card, pens, a river field,
  tray costs), the `notonspec` callout "Only flat contexts" quotes the Teacher Guidance for
  FM1-DIF-02, and `rp.…09` repeats it.
- MCQ/diagnostics: exactly one correct option each, no duplicate texts, feedback everywhere.
- Find-the-mistake 01 and 02: one wrong line each, the fix fixes it, earned marks match the scheme.
- Note: hero first with lede, `can` × 3, 22 minutes; 9 gates; longest section 120 words; closing
  pointer 60 words; no placeholder or `NaN`/`undefined` residue.

**Verdict: hold for OP-1 (wrong figure) and OP-3; OP-2 and OP-4 to OP-7 should go in the same pass.**

---

## 3. integration-as-inverse

### II-1 (H) a capital `C` scores zero on every indefinite integral

Nine parts — `q.…0001`, `0002`, `0003`, `0004`, `0005`, `0006`, `0007`, `0008` (main) and `0016` (a) —
plus the twins of `we.…01` and `we.…03`:

| response | awarded | feedback shown |
| --- | --- | --- |
| `2x^4 + C` | **0/2** | "That is not equivalent to the expected answer. For example, when C = -0.375 and c = -4.08 and x = -3.98 your answer gives 503 but the correct answer gives 500." |
| `x^5 + 3x + 4/x^2 + C` | **0/4** | same shape |

The algebra engine treats `C` as a second unknown, so a mathematically perfect answer scores below
the one that omits the constant altogether (`2x^4` earns 1 of 2), and the learner is shown a
counterexample naming two constants. Every stem does say "Use $c$ for the constant of integration",
which is the mitigation — but the penalty for not noticing is total.

Fix (verified): append to each part's `commonErrors` (last, so it cannot shadow the existing ones):

```json
{ "misconception": "fm.int.constant-case",
  "pattern": { "kind": "algebraic", "latex": "2x^{4} + C" },
  "feedback": "The integration is right. This paper writes the constant of integration as a lower-case $c$, which is what the question asked for, so write $+ c$.",
  "marksTypicallyEarned": 1 }
```

with the part's own answer, capital C, as the pattern. Verified on q.0001 (1/2), q.0005 (2/3) and
q.0016 a (3/4); the lower-case answer still scores full marks, and `constant-omitted`,
`coefficient-not-divided` and `divided-by-original-power` are unaffected because an algebraic pattern
in `C` does not match a response in `c`.

### II-2 (M) `q.fm.u1.integration-as-inverse.0008` prints a coefficient of 1

`\frac{1x^{4}}{4}` appears in six places: `answer.latex`, `scheme[0].for`, `scheme[2].for`,
`workedSolution`, `commonErrors[0].pattern.latex` and (as `\frac{1x^{4}}{3}`)
`commonErrors[2].pattern.latex`. The feedback card therefore shows the expected answer as
"$\frac{1x^{4}}{4} - 2x^{3} + 4x + c$".

Fix: `\frac{x^{4}}{4}` and `\frac{x^{4}}{3}`. Marking is unaffected — the engine already reads `1x⁴`
as `x⁴`, and `x^4/4 - 2x^3 + 4x + c`, `0.25x^4 - …` and `(1/4)x^4 - …` all score 3/3 today.

### Clean in this bundle

- Maths: all ten indefinite integrals differentiated back to their integrands (worst relative error
  7e-10); all nine "curve from a gradient function and a point" answers verified by differentiating
  and by substituting the point; the second derivative in q.0017 (a) checked numerically; every
  `point-substituted-into-gradient` value (-8, -1, -44, -76, -32, -4) recomputed and correct.
- Spec: the `notonspec` callout states n ≠ -1 and that fractional indices are excluded across Unit 1,
  matching FM1-INT-02 and FM1-DIF-01 guidance.
- Marking: every commonError lands exactly on its `marksTypicallyEarned`; typed spellings
  (`-3x^-3 + c`, `-3/x^3 + c`, `2x^4+c`, `y = …` with and without the `y =`) all score full.
- MCQ/diagnostics: one correct option each, no duplicates, feedback everywhere.
- Find-the-mistake 01/02/03: one wrong line each, the fix fixes it, earned marks (MW1–MW3; none; M1)
  match the schemes.
- Note: hero first with lede, `can` × 3, 20 minutes; 10 gates; longest section 128 words; closing
  pointer 57 words; no placeholder residue.

**Verdict: publishable after II-1; II-2 is a one-line tidy in the same pass.**

---

## 4. definite-integrals

### DI-1 (M) two questions print a coefficient of 1 in the line that says "simplified"

- `q.fm.u1.definite-integrals.0003` (main), `scheme[0].for`:
  `$\left[\frac{1x^{3}}{3} + \frac{1x^{2}}{2}\right]_{0}^{2}$, each term simplified` — and the same
  expression in `workedSolution`.
- `q.fm.u1.definite-integrals.0006` (main), `scheme[0].for` and `workedSolution`:
  `$\left[\frac{1x^{3}}{3} - 2x^{2}\right]_{0}^{3}$, each term simplified`.

The bundle's own note says the opposite twice: the "You can now" line "Simplify each term before
substituting, so $\frac{3x^{3}}{3}$ is written $x^{3}$", and note block 6, "**simplify each term
while you write it**".

Fix: `\frac{x^{3}}{3}` and `\frac{x^{2}}{2}`. Display only — both parts are numeric, so no marking
changes.

### Clean in this bundle

- Maths: all nine definite integrals (questions, worked example, twin, both post-check items and the
  note's gate) recomputed by Simpson's rule at n = 200 000 — 24, 6, 14/3, 2, 3, -9, 24, 12, 18, 15 —
  all exact. Every commonError value is the arithmetic it claims: reversed limits, limits into the
  integrand (6, 22, 6, -5/3, 18, -3, 28) and lower limit ignored (28, 4, -4, 8, 21). Where the
  "lower limit ignored" value would equal the right answer (q.0003, q.0006) the error is correctly
  omitted. `2k + 12` and `k = 4` verified both symbolically and numerically.
- Marking: `14/3`, `4.67`, `4.666` and `4.6666666667` all score 3/3 on q.0003; `k = 4`, `12 + 2k` and
  `2k+12` all score full; every commonError lands on its stated marks.
- MCQ/diagnostics: one correct option each, no duplicates, feedback everywhere; the `k` distractor's
  claim that the answer "collapses to 12" is correct.
- Find-the-mistake: one wrong line (5), fix `8 - (5) = 3` correct, earned `MW1, M1` matches the scheme.
- Figure: the shaded strip really does run from x = 1 to x = 3 under y = 3x² - 4x + 1, calibrated from
  the SVG's own ticks; the alt matches.
- Note: hero first with lede, `can` × 3, 12 minutes; 4 gates (a short, difficulty-2 topic); longest
  section 132 words; closing pointer 53 words; `notonspec` correctly defers negative-area handling to
  the area topic; no placeholder residue.

**Verdict: ship after the DI-1 cosmetic fix — the strongest of the four.**

---

## Summary

| bundle | H | M | m | verdict |
| --- | --- | --- | --- | --- |
| curve-sketching-quadratic-cubic | 2 | 2 | 1 | publishable after CS-1..CS-4 |
| optimisation | 2 | 5 | 1 | hold for OP-1 (wrong figure) and OP-3 |
| integration-as-inverse | 1 | 1 | 0 | publishable after II-1 |
| definite-integrals | 0 | 1 | 0 | ship after DI-1 |

Cross-cutting pattern worth a lint: **a "state the nature" text part whose key words test only the
sign word will pay full marks for the opposite conclusion.** Three of the four such parts in these
bundles have it (CS-1, CS-2, OP-3); the fix in every case is a `reject` on the opposite noun plus the
symbolic spelling (`> 0` / `< 0`) in `any`.
