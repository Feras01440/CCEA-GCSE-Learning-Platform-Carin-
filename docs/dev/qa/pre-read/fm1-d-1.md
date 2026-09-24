# FM1 calculus pre-read — differentiation, gradient, tangents/normals, stationary points

Pre-read of four FM1 bundles for a human reviewer. Digests read in full:
`docs/dev/qa/pre-read/fm1d-differentiation-integer-powers.digest.txt`,
`fm1d-gradient-at-a-point.digest.txt`, `fm1d-tangents-and-normals.digest.txt`,
`fm1d-stationary-points-and-nature.digest.txt`.

Scripts (scratchpad, re-runnable):
`fm1d-scan.mjs` (placeholders, hero, MCQ, FTM, regex), `fm1d-words.mjs` (gate-section word counts),
`fm1d-mark.mts` + `fm1d-probe2.mts` (marking probes via `markAnswer`).

**Partial.** Everything below was verified. Two areas were **not completed** before the session stop mark:
- **(e) SVG-vs-alt**: 38 figures carry inline SVG. Only the alt text was read; the SVG path data was
  **not** opened, so "the curve passes through the labelled points / the tangent touches where claimed"
  is **unverified** for all four bundles. (No `kind: "graph"` answer parts exist in any of the four
  bundles, so the lattice/tolerance half of (e) is not applicable — confirmed by scan.)
- **(b) common-error round-trip**: the probe fed a de-LaTeXed rendering of each `commonError` pattern
  back through `markAnswer`, which my own converter mangled (`\frac{1}{2}` → `(1)/(2)`). The useful
  half — "does any authored wrong answer reach full marks?" — is sound and came back **zero hits** in
  all four bundles. The "does the engine award the authored `marksTypicallyEarned`?" half is
  **unverified**; ignore the `CE-MARKS` lines in `fm1d-mark.txt`.

---

## 1. differentiation-integer-powers

Every derivative, second derivative, worked-example step, twin and `commonError` value recomputed by
hand and confirmed. Marking, MCQ, find-the-mistake, note structure and placeholders all clean.

**No findings.**

Verified clean, for the record:
- Maths: WE01 (`15x² + 7 + 8/x³`, `30x − 24/x⁴`) and its twin (`15x⁴ + 6 + 10/x²`); all 8 question
  parts; all 13 `commonError` latex values (each reproduces the named misconception exactly, e.g.
  `power-not-reduced` on q0001 is `5x⁵ + 6x²`, which is the answer with both indices left alone).
- Marking: every part's `answer.latex` and every plausible spelling of it (`12x^2 - 12x^-4`,
  `12x² − 12/x⁴`, `12x^2-12x^{-4}`, unicode minus, spaces removed) marks full. No authored wrong
  answer reaches full marks.
- MCQ/diagnostics: 7 items, exactly one correct option each, no duplicate texts, every distractor
  genuinely wrong with feedback naming the misconception.
- Find-the-mistake `ftm…01`: line 4 is the only wrong line (`-6x^-2` → `-12x^-3`; correct is
  `+12x^-3`), the fix fixes it, and `marksEarnedAsWritten` `["MW1","M1"]` matches (the rewrite on
  line 2 and the index on line 4 both stand).
- No unpaired `$`, no `${`, no `undefined`/`NaN`. Hero first with 46-word lede, `can` × 3, 12 minutes.
  Gate sections 79/115/73/131/73 words (all under 150).

## 2. gradient-at-a-point

### G-1 — `q.fm.u1.gradient-at-a-point.0006` (main), worked solution: a false general claim about cubics

Current last line of `workedSolution`:

> A cubic has two places with any given gradient, so two answers are expected.

This is not true, and the bundle's own note does not claim it. A cubic's derivative is a quadratic,
so `dy/dx = m` has **two, one or no** solutions depending on the discriminant. On this very curve
(`y = x³ − 3x² + 4`, `dy/dx = 3x² − 6x`) the gradient `−5` gives `3x² − 6x + 5 = 0`, discriminant
`36 − 60 = −24`: no solutions at all. Gradient `−3` gives exactly one place (`x = 1`). The learner is
being handed a check ("expect two") that will mislead them on any gradient below the derivative's
minimum, which is exactly the trap a stationary-point question sets.

**Fix** — replace that sentence with:

> The derivative of a cubic is a quadratic, so this equation can have two roots; here it does, and
> both are wanted.

Everything else in this item is right: `dy/dx = 3x² − 6x`, `3x² − 6x − 9 = 0`, `x² − 2x − 3 = 0`,
`(x − 3)(x + 1) = 0`, `x = 3` and `x = −1`; the `default-to-derivative-zero` pattern `x=0, x=2` is
the correct solution of `dy/dx = 0`.

### Clean in this bundle

- All gradient values recomputed: q0001 `7`, q0002 `−14`, q0003 `6`, q0004 `−2`, q0005 `(2, −3)`,
  q0007(a) `4x − 7`, (b) `−15`, (c) `(4, 8)`. WE01 `5` at `(3, 2)`; twin `2`.
- Every `commonError` value reproduces its named misconception, including the two fractional ones:
  q0005 `(7/4, −25/8)` and q0007(c) `(7/4, −17/8)` are the true stationary points of their curves,
  and the three `power-not-reduced` values (`14`, `12`) are the derivative with *every* index left
  alone, not just the leading one.
- Marking: all answers and their variants mark full; no wrong answer reaches full marks. The two
  coordinate answers are terminating and reachable as typed pairs.
- Find-the-mistake `ftm…01`: line 3 is the only wrong line, fix correct, `["MW1"]` matches.
- Structure clean: hero first, 47-word lede, `can` × 3, 12 minutes; gate sections 73/126/82/67/77 words.

## 3. tangents-and-normals

### T-1 — `q.fm.u1.tangents-and-normals.0016` (a), common error `fm.calc.tangent-constant-slip`: wrong number named

Current feedback:

> Gradient and point are both right, so four marks stand. In the last line $\frac{7}{2}$ was added
> instead of taken away.

There is no `7/2` anywhere in this item. The point is `P(2, 3)` and the gradient is `5`, so the last
line is `3 = 5(2) + c`: the number that should be taken away is **10**, and the pattern
`y = 5x + 13` is exactly `c = 3 + 10`. A learner who reaches `13` and reads "7/2" cannot find their
own slip.

**Fix** — replace the second sentence with:

> In the last line $10$ was added instead of taken away: from $3 = 10 + c$, the constant is $-7$.

### T-2 — `0006`, `0007`, `0009` (main), common error `fm.calc.tangent-constant-slip`: the diagnosis is the wrong way round

Three items name a **positive** quantity and then describe the operation backwards. In each, the
correct move is to **add** the quantity and the slip is to **subtract** it:

| item | pattern | last line | correct | slip | current text |
|---|---|---|---|---|---|
| `0006` | `y = -\frac{1}{2}x - \frac{29}{2}` | `−12 = −½(5) + c` | `c = −12 + 5/2 = −19/2` | `c = −12 − 5/2 = −29/2` | "the $\frac{5}{2}$ was added instead of taken away" |
| `0007` | `y = -\frac{1}{5}x + \frac{14}{5}` | `3 = −⅕(1) + c` | `c = 3 + 1/5 = 16/5` | `c = 3 − 1/5 = 14/5` | "The $\frac{1}{5}$ was added instead of taken away" |
| `0009` | `y = -\frac{1}{5}x - \frac{12}{5}` | `−2 = −⅕(2) + c` | `c = −2 + 2/5 = −8/5` | `c = −2 − 2/5 = −12/5` | "The $\frac{2}{5}$ was added instead of taken away" |

**Fix** — swap the two verbs in each, e.g. for `0006`:

> In the last line the $\frac{5}{2}$ was taken away instead of added: from $-12 = -\frac{5}{2} + c$,
> the constant is $-\frac{19}{2}$.

Note this is *not* a blanket rule: `0002` (`18`), `0003` (`4`), `0015(a)` (`24`) are right as written
because the quantity really is added by the slip, and `0008` / `0014(b)` are right because they name
the **signed** value (`$-4$`), which adds to give the slip. `0013` already uses the neutral wording
("the sign of $\frac{1}{5}$ was handled the wrong way round") and is the safest template.

### T-3 — `we.fm.u1.tangents-and-normals.02` step 3 and `q…0005` (main) worked solution: a tautology on screen

Both read, verbatim:

> Normal gradient: $-\frac{1}{5} = -\frac{1}{5}$.

and

> The normal's gradient is $-\frac{1}{5} = -\frac{1}{5}$.

The left-hand side was meant to show the *construction* (`-1/m` with `m = 5`), and the template has
collapsed both sides to the result. It teaches nothing and, on a step whose whole point is "turn it
over, then change the sign", it reads as an error. Compare `q…0004`, where the same template renders
correctly because the two sides genuinely differ: "so the normal's gradient is $-\frac{1}{4} = -0.25$".

**Fix** — in both places write the construction on the left:

> Normal gradient: $-\frac{1}{m} = -\frac{1}{5}$.

### Clean in this bundle

- Every tangent and normal recomputed and confirmed, including all four-step chains: `0002`
  `y = 6x − 9`; `0003` `y = 2x`; `0006` `y = −½x − 19/2`; `0007` `y = −⅕x + 16/5`; `0008`
  `y = −2x + 8`; `0009` `y = −⅕x − 8/5`; `0013` `y = ⅕x + 31/5` (and the given point `(−1, 6)` does
  lie on `y = x³ + 2x² − 4x + 1`); `0014` `a = 8`, `y = 2x + 9`, `y = −½x + 4`; `0015`
  `y = 6x − 11`, `A(−3, 20)`; `0016` `y = 5x − 7`, `Q(7/10, −3/25)`.
- The two "meets the curve again" items are right, including the repeated-root factorisation:
  WE03 `x³ − 3x + 2 = (x − 1)²(x + 2)` → `(−2, 16)`; twin `x³ − 12x + 16 = (x − 2)²(x + 4)` →
  `(−4, −52)`; `0012` `x³ − 3x − 2 = (x + 1)²(x − 2)` → `(2, 0)`. All three expansions checked.
- Every `commonError` latex reproduces its named misconception (including `0014(a)`'s three:
  `−56` from equating curve and line, `−8` from the sign, `−4` from the index not stepping down).
- Nothing exceeds the spec: no product, quotient or chain rule anywhere; the `notOnThisSpec`
  callout already fences off vertical tangents and the normal at a stationary point.
- Marking: every `answer.latex` and its spellings (`y = 3x - 2` style, `y - 4 = 3(x - 2)` style and
  the unicode-minus form) mark full; both coordinate answers are terminating. No authored wrong
  answer reaches full marks.
- Find-the-mistake ×3: one wrong line each (lines 3, 4, 2), each fix verified arithmetically
  (`ftm…01` → `c = −9.5`; `ftm…02` → `c = −1.6`, which agrees with `q…0009`), earned marks consistent.
- Structure clean: hero first, 44-word lede, `can` × 3, 19 minutes; gate sections
  80/81/134/63/87/61/72/75 words — the largest is 134, under 150.

## 4. stationary-points-and-nature

### S-1 — all six `text` parts: the **reversed** conclusion earns full marks

`q…0004(main)`, `q…0006(main)`, `q…0009(b)`, `q…0009(c)`, `q…0010(c)`, `q…0010(d)` all use two
key-word groups of this shape (0009(b) shown):

```json
"keyWords": [ { "any": ["12", "positive"], "marks": 1 },
              { "any": ["minimum", "greater than zero"], "marks": 1 } ]
```

`"greater than zero"` sits in the **conclusion** group but is a statement about the *value*, not
about the nature. So the second group is earned by any answer that restates the sign — including one
whose conclusion is wrong. Probed with `markAnswer` (`fm1d-probe2.mts`):

| part | answer | result |
|---|---|---|
| `0004(main)` | "The second derivative is 4, which is greater than zero, so the turning point is a **maximum**" | **2/2, correct=true**, "Every marking point is there." |
| `0006(main)` | "…18, which is greater than zero, so the turning point is a **maximum**" | **2/2, correct=true** |
| `0009(b)` | "…12, which is greater than zero, so the turning point is a **maximum**" | **2/2, correct=true** |
| `0009(c)` | "…−12, which is less than zero, so the turning point is a **minimum**" | **2/2, correct=true** |
| `0010(c)` | "…3.2, which is greater than zero, so the turning point is a **maximum**" | **2/2, correct=true** |
| `0010(d)` | "…−3.2, which is less than zero, so the turning point is a **minimum**" | **2/2, correct=true** |
| `0009(b)` | "12 is greater than zero" (no conclusion at all) | **2/2, correct=true** |
| `0009(c)` | "The second derivative is 12, which is **negative**, so the turning point is a maximum" | **2/2, correct=true** |

The authored `commonError` cannot save it: `mark.ts` returns early on `v.correct`, so the
`\bmaximum\b` regex is never consulted, and for a `text` spec a matched common error never lowers
marks anyway. This is the exact misconception the topic exists to fix (`fm.calc.second-derivative-sign-misread`),
scoring full marks with the feedback "Every marking point is there."

**Fix** — move the threshold phrase into the *value* group, where it belongs, and leave the
conclusion group as the nature alone. For `0009(b)`:

```json
"keyWords": [ { "any": ["12", "positive", "greater than zero"], "marks": 1 },
              { "any": ["minimum", "min"], "marks": 1 } ]
```

and symmetrically for the maximum parts: group 1 `["-12", "negative", "less than zero"]`,
group 2 `["maximum", "max"]`. Re-run `fm1d-probe2.mts` after the edit: every row in the table above
should drop to 1/2, and the three `accepted` strings and the worked solution's final line must stay
at 2/2. (The `used` set in `markText` means a single phrase can only pay one group, so widening
group 1 does not let "greater than zero" pay twice.)

### S-2 — all six `text` parts: "min" / "max" under-earn

Probed: "The second derivative is 4, which is positive, so the turning point is a **min**" →
**1/2**, "1 of 2: still missing minimum." Same for `max` on the maximum parts. `phraseIn` matches
whole words and inflections, so `min` never reaches the key word `minimum`; the abbreviation is
ordinary in a learner's written answer and costs a real mark. The fix in S-1 (adding `"min"` /
`"max"` to the conclusion group) closes this at the same time — and is safe, because `phraseIn` is
whole-word, so the key word `min` is not matched by the word `minimum` or vice versa.

### Clean in this bundle

- Every stationary point, height and nature recomputed: WE01 max `(1, 2)`, min `(2, 1)` from
  `d²y/dx² = 12x − 18` (`−6`, `+6`); twin `(−1, 11), (2, −16)`; WE02 min `(2, 8)`, max `(−2, −8)`
  from `d²y/dx² = 16/x³` (`+2`, `−2`); twin `(−2, −12), (2, 12)`.
- Questions: `0001` `x = 3`; `0002` `(4, −13)`; `0003` `(2, 9)`; `0004` `d²y/dx² = 4`; `0005`
  `(−2, 38), (4, −70)`; `0006` `18`; `0007` `(−3, 29), (1, −3)`; `0008` `(−3, −6), (3, 6)`; `0009`
  `(−1, 10), (3, −22)` with `+12` / `−12`; `0010` `4 − 25/x²`, `(±5/2, ±20)`, `d²y/dx² = 50/x³`
  giving `+3.2` / `−3.2`. All confirmed.
- The counter-intuitive claim in WE02 and `0010(d)` — the maximum sitting *below* the minimum — is
  correct and is explained (separate branches), not a slip.
- Every `commonError` value reproduces its misconception, including the two fiddly ones: `0001`
  `0.5` is the root of `2x − 1 = 0` (the constant carried into the derivative) and `0003`
  `(9/2, 11/4)` is the root of `9 − 2x = 0` with its height read off the curve.
- Coordinates: `0010(b)`'s `(±5/2, ±20)` is exact and terminating (`±2.5`); every other coordinate
  answer is integral.
- MCQ/diagnostics: 9 items, one correct option each, no duplicate texts, feedback on every option.
  `q6` ("both minima on a cubic") is a genuine examiner check and is stated correctly.
- Find-the-mistake `ftm…01`: line 6 is the only wrong line, `marksEarnedAsWritten`
  `["MW1","W1","W2","MW2"]` consistent with lines 1–5 being sound.
- Structure clean: hero first, 53-word lede, `can` × 3, 17 minutes; gate sections
  73/126/89/64/76/87/84 words.

---

## Cross-bundle observations (not counted as findings)

- **`\frac{9}{x^{1}}` notation.** Ten stems across all four bundles print a reciprocal term with an
  explicit index of 1 — `\frac{9}{x^{1}}`, `\frac{8}{x^{1}}`, `\frac{12}{x^{1}}`, `\frac{25}{x^{1}}`.
  CCEA prints `\frac{9}{x}`. It is not wrong, and the worked solutions all say "$\frac{9}{x}$ is
  $9x^{-1}$", but the stem and the solution then disagree on the page. Worth a house-style pass.
- **"In the exam" closing panels** (reported separately as instructed, and all well over 150 words —
  they sit after the last gate, so they are not a gated section): differentiation **337 w**,
  gradient **245 w**, tangents **394 w**, stationary points **379 w**. Each is a heading, a
  paragraph and 3–4 examiner callouts.
- **Placeholders**: no unpaired `$`, no `${`, no `undefined`/`NaN`/`TODO` in any of the eight files.
  (The scan's `MUSTACHE` hits are `}}` inside `\frac{d^{2}y}{dx^{2}}` — false positives. The one
  `UNDEF` hit is the English word "undefined" in a `notOnThisSpec` line.)
- **Greedy regex**: no `.*` in any `commonError` text pattern in any of the four bundles. The six
  that exist (`\bmaximum\b`, `\bminimum\b`, `\b4x\s*\+\s*12\b`, `\bdy/dx\s*=\s*0\b`) are anchored
  and none fires on its own part's correct answer.
- **Equivalence / coordinate constraints**: as instructed, the absence of `simplifiedOnly` and the
  exact-terminating-decimal coordinates are not counted as findings. No coordinate answer in any
  bundle is reachable only as a recurring fraction or a rounded decimal.

---

## Verdicts

- **differentiation-integer-powers** — clean; no findings. Ship.
- **gradient-at-a-point** — one wrong general claim in a worked solution (G-1); otherwise clean.
- **tangents-and-normals** — three feedback-text defects (T-1 wrong number, T-2 reversed diagnosis
  ×3, T-3 tautology ×2); all maths correct.
- **stationary-points-and-nature** — one serious marking defect: all six written parts award full
  marks to the reversed conclusion (S-1), plus `min`/`max` under-earning (S-2); all maths correct.
