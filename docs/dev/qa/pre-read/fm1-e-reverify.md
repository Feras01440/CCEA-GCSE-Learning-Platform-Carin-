# FM1 re-verify E — curve sketching, optimisation, integration, definite integrals

Re-check of every finding in `docs/dev/qa/pre-read/fm1-e-1.md` against the four bundles as they
stand on 20 Sep. The bundles were regenerated twice while this pass ran (the shingle patch at
16:16, then the originality rewording); every row below was measured against the files at these
hashes, and the marking probe was re-run after each change and came back **byte-identical output**,
because the rewording touched prose only and left every answer spec, key-word group, regex and
commonError alone.

```
94443edb74ce87da  curve-sketching-quadratic-cubic/bundle.json      (was df266078… before the rewording)
f2dc798a4b422243  optimisation/bundle.json
4d2cb9f14d66989a  optimisation/note.blocks.json
8dc1843a72f089e6  integration-as-inverse/bundle.json
90435a53c31ad368  definite-integrals/bundle.json
```

**How the marking rows were proved.** `fm1erv-probe.mts` in the session scratchpad, run with
`npx tsx` from the project root, imports `markAnswer` from `src/components/items/mark.ts` and calls
`markAnswer(raw, part.answer, { marks: part.marks, prompt: stem, commonErrors: part.commonErrors })`
— the part's own stem passed as `prompt`, so accuracy instructions are live. For each finding it
marks the worked solution, every `accepted` string, a paraphrase, the symbolic sign spellings and
the reversed or wrong answer the finding described. **113 probes, every one on its expected mark.**
`fm1erv-probe2.mts` ran the worked-example twins, the find-the-mistake items, the build's own
`figureLeakWarnings` and `lintContent`, and a text-collision scan over every figure SVG. The
author's own `scratchpad/fm1-batch-e/check-marking.mts` was also re-run: 334 probes, 48 of them the
named pre-read fixtures, no findings. No score quoted below is a reading of the JSON.

---

## 1. curve-sketching-quadratic-cubic

| finding | status | evidence |
|---|---|---|
| CS-1 (H) q.0011 (e) reversed answer earns the mark | **holds** | `{ any: [positive, greater than zero, above zero, "> 0"], reject: [maximum] }`. Both `accepted` 1/1; worked-solution last line 1/1; `d²y/dx² = 12 > 0, so it is a minimum` **1/1** (was 0/1); `12 is positive so it is a maximum` **0/1** (was 1/1); the sign-misread commonError still 0/1 with its tag |
| CS-2 (H) q.0010 (d) the same defect mirrored | **holds** | `reject: [minimum]`, `"< 0"` in `any`. `d²y/dx² = -2 < 0, so it is a maximum` 1/1; `The second derivative is -2, which is negative, so this is a minimum` **0/1** (was 1/1); `Because -2 is less than zero the point is a minimum` 0/1 |
| CS-3 (M) q.0011 (c) show-that regex inside out | **holds** | regex is now `^\s*(y\s*=\s*)?(x\^?3\|x³)[^\n]{0,45}$`. Fires on `y = x^3 - 12x^2 + 36x - 32` and on the bare `x³ - 12x² + 36x - 32` (0/2, tagged); quiet on both `accepted`, on the ascii spelling of `accepted[1]` and on a fresh paraphrase (all 2/2, untagged) |
| CS-4 (M) commonError over-credits by one | **holds** | `fm.sketch.second-turning-point-dropped` now `marksTypicallyEarned: 2`. `(1, 4)` → **2/4**; `(1, 4), (3, 0)` and the reordered pair → 4/4; `(1, 0), (3, 0)` unchanged at 3/4 |
| CS-5 (m) repeated root written twice scores nothing | **holds** | `fm.sketch.repeated-root-counted-twice` is first in `commonErrors` with the report's regex. `(2, 0), (2, 0), (8, 0)` → **1/2** (was 0/2); `(2, 0), (8, 0)` still 2/2; the origin error still 1/2; `(-2, 0), (-8, 0)` still 0/2 |
| the bundle's "clean" list (maths, graph parts, MCQ, note) | not re-run | no fix was asked for; nothing in the fix pass touches those encodings |

The caveat the report itself recorded is still live and is the right trade: `…so the point is a
minimum and not a maximum` scores 0/1, because `reject` cannot tell a conclusion from a contrast.

**Verdict: all five findings hold; publishable on the pre-read's own terms.** One figure issue
outside the report's findings is in §5 below.

---

## 2. optimisation

| finding | status | evidence |
|---|---|---|
| OP-1 (H) q.0015 carries the wrong diagram | **partly** | The figure is now genuinely the two-pen diagram drawn from its own 36 m: a heavy wall path along the top (`M 94 76 L 426 76`), an enclosure open at the wall (`M 110 76 L 110 216 L 410 216 L 410 76`) and a real divider (`M 260 76 L 260 216`), labels `x m` ×2 on the ends, `x m, the divider`, `y m, the far side`, caption `36 m of fencing; the barn wall is free`. No `48`, `24`, `12` or `288` survives, and `<title>` and `alt` both match the drawing. **But the far-side label and the caption are drawn on top of each other** — see §4 |
| OP-2 (M) four figures label the solved optimum | **holds** | All five question figures and all three worked-example figures are variable-labelled and carry only their given constant: q.0009/we.02 `x m across`, `y m`, `the extra fence, y m`, `area 54 m²`; q.0010/we.01 `x m`, `x m`, `y m, the side facing the wall`, `48 m of timber…`; q.0017 `x m, the side opposite the river`, `y m`, `y m`, `area 288 m²`; q.0014/we.03 the margins and `printed area 300 cm²`. No `12 m`, `24 m`, `9 m across`, `6 m` or `area 288 m²`-as-answer anywhere in a question. The note keeps its solved pictures — `(12, 288)` and `(9, 36)` are still in `note.blocks.json`. The build's `figureLeakWarnings` reports **0** on this bundle |
| OP-3 (H) q.0016 (c) reversed answer earns both marks | **holds** | group 2 is `{ any: [positive, greater than zero, above zero, "> 0"], reject: [maximum, greatest] }`. Both `accepted` and the worked solution 2/2; `1600/x^3 at x = 20 is 0.2 > 0, so it is a minimum` **2/2** (was 1/2); `…at 20 trays that is one fifth, which is positive, so the cost is least` **2/2** (was 1/2); both reversed answers **1/2** (were 2/2); the sign-misread commonError still 1/2 with its tag |
| OP-4 (M) q.0014 (b) accepted wording passes only verbatim | **holds** | `"w + 6 by h + 8"` added to group 1. The report's paraphrase → **2/2** (was 1/2); the copy-down `A = 8w + 348 + 1800/w` still 0/2 with `fm.show-that.steps-missing` |
| OP-5 (M) q.0017 (a) natural spellings earn nothing | **holds** | `any` is now `[xy = 288, yx = 288, x x y = 288, x times y = 288, xy is 288]`. All four spellings the report listed → 1/1 (were 0/1); bare `y = 288/x` still 0/1 |
| OP-6 (M) q.0017 (b) one-step substitution earns 1 of 2 | **holds** | `"288/x"` added to group 2. `Only three sides are fenced: L = x + 2y. Replacing y with 288/x gives L = x + 576/x.` → **2/2** (was 1/2); `L = x + 576/x` still 0/2; `L = 2x + 2y = x + 576/x` still 0/2 with `fm.optim.wall-side-fenced` |
| OP-7 (M) right number without its unit scores zero | **holds** (encoded differently) | `fm.optim.unit-omitted` is first in `commonErrors` on q.0012 (main), q.0014 (d) and q.0015 (d), as a **text** pattern `^\s*<value>(\.0+)?$` rather than the numeric pattern the report drafted — `content-lint.ts` rejects a numeric one here. Same outcome: `108` → **1/2** tagged, `108 m²` and `108 m^2` → 2/2, `108.0` → 1/2, `6` → 0/2; `588` → 1/2, `588 cm²` → 2/2, `15` → 0/2. q.0017 (d) left alone as the report said: `48` → 0/1, `48 m` → 1/1 |
| OP-8 (m) ftm.03 feedback and earned marks disagree | **holds** | `marksEarnedAsWritten: []` unchanged; the feedback now reads "**The first mark is the one lost outright, and it takes the accuracy marks with it**, because every later line is correct working on an expression that was never the right one" — the report's second option, taken verbatim |
| "observation, not a defect" (six parts take a bare number for a nature instruction) | **moot** | left as authored, with a stated reason: it is CCEA's own wording, the MW mark is in the scheme and `requiresWorking` is true. A decision, not a defect; q.0016 still shows the split pattern for comparison |

**Verdict: every marking finding holds; OP-1's diagram is right but its two bottom labels collide,
so this bundle needs one more SVG edit before it ships.**

---

## 3. integration-as-inverse

| finding | status | evidence |
|---|---|---|
| II-1 (H) a capital `C` scores zero on every indefinite integral | **holds** (engine fix, no bundle change) | `foldConstantCase` in `src/lib/marking/algebra.ts:1600`, applied at the top of `checkAlgebraic`: when the spec has `c` and not `C` and the response has `C` and not `c`, the response's `C` is rewritten to `c`. Probed on **every** algebraic part in the bundle whose spec carries a constant — q.0001–q.0008 (main) and q.0016 (a), plus the twins of `we.…01` and `we.…03` — in both cases: lower-case full marks, capital `C` **full marks** (was 0). On q.0001 the inversion the report named is gone: `2x^4 + C` 2/2, `2x^4` 1/2 with `fm.int.constant-omitted`. Guard probes: `2x^4 + K` 0/2, and a *wrong* answer with a capital C (`2x^4 + C` against q.0008's 3-mark spec) still 0/3 — the fold is not a free pass |
| II-1 named check: `2x^4 + C` against a `+ c` spec | **holds** | against a bare `{ kind: algebraic, latex: "2x^{4} + c", variables: [x, c] }` spec at 2 marks: `2x^4 + c` 2/2, `2x^4 + C` 2/2, `2x^4 + K` 0/2 |
| II-2 (M) q.0008 prints a coefficient of 1 | **holds** | `answer.latex` is `\frac{x^{4}}{4} - 2x^{3} + 4x + c`; `scheme[0].for`, `scheme[2].for`, `workedSolution`, `commonErrors[0].pattern.latex` and `commonErrors[2].pattern.latex` (`\frac{x^{4}}{3}`) all follow. `grep "1x\^{"` over all four `bundle.json` and `note.blocks.json` returns **0**. Marking unchanged: `x^4/4 - 2x^3 + 4x + c`, `0.25x^4 - …` and `(1/4)x^4 - …` all 3/3; constant-omitted 2/3; both division errors 1/3 |

**Verdict: both findings hold; publishable.** One worked-example figure issue outside the report's
findings is in §5 below.

---

## 4. definite-integrals

| finding | status | evidence |
|---|---|---|
| DI-1 (M) two questions print a coefficient of 1 in the "simplified" line | **holds** | q.0003 `scheme[0].for` and `workedSolution` now read `\left[\frac{x^{3}}{3} + \frac{x^{2}}{2}\right]_{0}^{2}`; q.0006 reads `\left[\frac{x^{3}}{3} - 2x^{2}\right]_{0}^{3}`. Display only, and marking is untouched: q.0003 `14/3`, `4.67`, `4.666`, `4.6666666667` all 3/3, `-14/3` 2/3 tagged `limits-reversed`, `6` 0/3 tagged `limits-into-integrand`; q.0006 `-9` and `-9.00` 3/3, `9` 2/3, `-3` 0/3 |

**Verdict: the finding holds; ship — still the strongest of the four.**

---

## 5. Still open

### 5.1 The two-pen figure's caption is printed on top of its own `y` label — `q.fm.u1.optimisation.0015`

The OP-1 fix drew the right diagram but left two `<text>` nodes overlapping. Both are centred at
`x='260'` and their baselines are two pixels apart:

```
<text x='260' y='238' font-size='12.5' text-anchor='middle'>y m, the far side</text>
<text x='260' y='240' font-size='11.5' text-anchor='middle'>36 m of fencing; the barn wall is free</text>
```

At any font they render on top of each other — roughly a 106 px × 10 px overlap. The stem's whole
constraint (36 m) and the name of the side she has to call `y` are the two things this figure exists
to say, and both are illegible. Nothing catches it: `svgDrawDefects` / `scripts/qa/svg-draws.mjs`
check only that shapes draw at all, and `figureLeakWarnings` checks what a figure says, not where.
A collision scan over every figure in all four bundles found this one and nothing else of the kind
(the two hits in the curve-sketching graphs are axis ticks abutting the origin label, within a pixel
or two of touching, and were there before this batch).

**Precise fix**, matching the spacing the sibling bed figure `q.…0010` already uses — lift the
drawing 26 px and leave the caption where it is:

| node | from | to |
| --- | --- | --- |
| wall path | `M 94 76 L 426 76` | `M 94 50 L 426 50` |
| enclosure path | `M 110 76 L 110 216 L 410 216 L 410 76` | `M 110 50 L 110 190 L 410 190 L 410 50` |
| divider path | `M 260 76 L 260 216` | `M 260 50 L 260 190` |
| `the barn wall costs nothing to fence` | `y='64'` | `y='38'` |
| `x m` ×2 and `x m, the divider` | `y='146'` | `y='120'` |
| `y m, the far side` | `y='238'` | `y='212'` |
| `36 m of fencing; the barn wall is free` | `y='240'` | unchanged |

`viewBox='0 0 520 250'` then still fits. (The alternative — `viewBox='0 0 520 276'` with the caption
moved to `y='266'` — works too, but leaves this figure taller than its siblings.)

### 5.2 Two worked-example figures hand over the answer before she is asked for it

Not in `fm1-e-1.md` — the pre-read checked the curve-sketching figures for drawn geometry against
their alt, not for answer leakage — but it is exactly OP-2's class, and the brief for this pass asks
that no question **or worked-example** figure print a solved answer. `WorkedExampleAsQuestion.tsx`
renders `we.figure` directly under `we.stem` in the "Problem" presentation (line 519) and in the
faded-steps presentation (line 323), i.e. above the box she types into. The build's lint does not
cover this: `figureLeakWarnings` (`src/components/items/content-lint.ts:432`) walks `bundle.questions`
only, so worked examples are outside it.

| item | stem asks for | the figure shows |
| --- | --- | --- |
| `we.fm.u1.curve-sketching-quadratic-cubic.01` | "Find where it meets each axis, find its turning point, say whether that point is a maximum or a minimum" | plotted labels `(1, 0)`, `(5, 0)`, `(0, 5)`, `(3, -4)` — the whole `finalAnswer`; `<title>` and `alt` say so too |
| `we.fm.u1.curve-sketching-quadratic-cubic.02` | "Find where it meets the x-axis, find both turning points and say which is which" | `(0, 0)`, `(5, 0)`, `(8, 0)`, `(2, 36)`, `(6.67, -14.81)`, and a `<title>` reading "with a maximum at (2, 36) and a minimum near (6.67, -14.81)" |
| `we.fm.u1.integration-as-inverse.02` | "Express $y$ in terms of $x$" (`finalAnswer` `y = x^3 - 5x^2 + 4x + 7`) | visible labels are fine — only the given `(3, 1)` — but `<title>` and `aria-label` read "**The single curve y = x^3 - 5x^2 + 4x + 7** passing through the point (3, 1)", so a screen-reader user is read the answer |

**Precise fix**, the same one OP-2 took: give each of these three a variable-labelled or
answer-free copy for the item and keep the solved copy for the note.

- `we.…curve-sketching….01`: draw the parabola with its axes and no point labels; alt and `<title>`
  "The curve $y = x^2 - 6x + 5$ drawn on labelled axes". The solved copy, with the four coordinates,
  belongs at the worked example's final step or in the note.
- `we.…curve-sketching….02`: the same — the cubic with its axes, no `(2, 36)` or `(6.67, -14.81)`
  in the drawing or in the `<title>`.
- `we.…integration-as-inverse.02`: keep the drawing as it is and cut the equation out of the
  `<title>` and `aria-label`, so both read "A single curve passing through the point $(3, 1)$",
  matching the `alt` that is already right.

A fourth item is clean and shows the pattern: `we.fm.u1.definite-integrals.01`'s `<title>` names only
the integrand and the limits, both given in the stem, and never the value 12.

### 5.3 Worth a lint, not a fix here

`figureLeakWarnings` runs on questions only. Extending it to `workedExamples` (and to their `twin`,
though no twin in these four bundles carries a figure) would have caught 5.2 in the build. The check
it already does is the right one and reports **0 warnings** on all four bundles as they stand, as
does `lintContent`.

---

## Summary

| bundle | findings | all fixed? | verdict |
| --- | --- | --- | --- |
| curve-sketching-quadratic-cubic | CS-1..CS-5 | yes | **holds — publishable**, but §5.2 leaks the answers of both worked examples |
| optimisation | OP-1..OP-8 | 7 of 8; OP-1 partly | **hold for one SVG edit** — the diagram is right, its caption and `y` label overlap (§5.1) |
| integration-as-inverse | II-1, II-2 | yes | **holds — publishable**, with `we.…02`'s `<title>` to tidy (§5.2) |
| definite-integrals | DI-1 | yes | **holds — ship** |

Nothing in the fix pass made any marking worse: of the 113 probes, every previously-correct response
still earns what it earned, and every response the report named as wrongly credited now earns what
the scheme gives it.
