# Pre-read — FM1 "Laws of logarithms: simplifying and combining expressions"

Bundle: `packs/further-maths/content/fm1/laws-of-logarithms/bundle.json` + `note.blocks.json`
Digest: `docs/dev/qa/pre-read/fm1-g-logs.digest.txt` (375 blocks, read in full)
Date: 2026-09-20. Nothing under `packs/` or `src/` was edited.

Scripts (scratchpad `…/0d8d19ef-…/scratchpad/`): `fm1g-maths.mjs` (every identity at three numeric
points), `fm1g-mark.mts` / `fm1g-probe4.mts` (≈170 responses through `markAnswer`), `fm1g-probe2.mts`,
`fm1g-probe3.mts`, `fm1g-frac2.mts`, `fm1g-probe6.mts`, `fm1g-struct.mjs`, `fm1g-probe5.mjs`.

---

## 1 · [High] q.fm.u1.laws-of-logarithms.0014 (a) — the common-error feedback states the slip backwards

**Current** (`commonErrors[0]`, misconception `fm.logs.subtraction-rule-misapplied`, pattern
`\log\frac{ac}{b^{2}}`, `marksTypicallyEarned: 1`):

> "The subtracted term has gone underneath and the squared one on top. It is $c$ that is subtracted, so $c$ is the denominator."

**Why it is wrong.** In `\log\frac{ac}{b^{2}}` the subtracted term $c$ is in the **numerator** and the
squared term $b^{2}$ is **underneath** — the exact opposite of the first sentence. The second sentence is
right, so the feedback contradicts itself. The parallel error on q0005 is worded correctly
("The subtracted term has gone on top and the added one underneath", pattern `\log\frac{p^{2}r^{3}}{q}`),
as is `ftm…03`, which describes the same working.

**Fix** — first sentence only:

> "The subtracted term has gone on top and the squared one underneath. It is $c$ that is subtracted, so $c$ is the denominator."

**Verified**: `markAnswer("\\log\\frac{ac}{b^{2}}", …)` on 0014 (a) returns 1/3 with the quoted text.

---

## 2 · [High] ftm.fm.u1.laws-of-logarithms.01 — the earned marks name the mark the working loses

**Current**: `"marksEarnedAsWritten": ["M1", "M2"]`, with working

```
1. 3 log 2x
2. = log (2x)^3
3. = log 2x^3        ← mistakeLine
```

**Why it is wrong.** The bundle's own scheme for the identical question, q0004, is

* `M1` — "$\log(2x)^{3}$"
* `M2` — "$(2x)^{3} = 8x^{3}$ expanded" (`dependsOn: ["M1"]`)
* `W1` — "$\log 8x^{3}$"

and `we…02` labels its steps the same way (step 1 = M1 "write the bracket", step 2 = M2 "expand the
bracket"). Aoife's line 3 *is* the failed expansion, so M2 cannot stand. Under the scheme as written she
earns M1 only, i.e. 1 of 3 — and the feedback's "What went is the last mark" is then also wrong, because
two marks went.

Three statements in the bundle disagree and only two can survive:

| says | value |
|---|---|
| q0004 scheme + we…02 step labels | the expansion is M2, so this working earns **1 of 3** |
| ftm…01 `marksEarnedAsWritten` + feedback | **2 of 3** |
| q0004 `commonErrors[0]` (`\log 2x^{3}`) `marksTypicallyEarned: 2`, anchored to the 2024 report ("Good candidates got two of three") | **2 of 3** |

**Fix — route A (minimal, self-consistent, three edits).** Make the scheme the authority:

* `ftm…01.marksEarnedAsWritten` → `["M1"]`
* `ftm…01.feedback`, replace "What went is the last mark, and it is the one the Summer 2024 report says the majority lost on this exact step." with "What went are the last two marks, and the step that lost them is the one the Summer 2024 report says the majority got wrong."
* q0004 `commonErrors[0].marksTypicallyEarned` → `1`

**Fix — route B (keeps the 2024 report's "two of three", four edits).** Make the report the authority:
re-word q0004 `M1.for` → "the coefficient taken inside as an index", `M2.for` → "$\log(2x)^{3}$ — the
whole of $2x$ inside the bracket", and re-label `we…02` steps 1 and 2 to match; the FTM and the CE then
stand as they are.

A reviewer has to pick one; route B is the faithful reading of CCEA's own report, route A is the smaller
change. What must not stand is the present mixture.

---

## 3 · [High] q.fm.u1.laws-of-logarithms.0016 (c) — an answer that keeps the rejected root scores full marks

**Current**: `{"kind":"numeric","value":4,"tolerance":{"type":"absolute","value":0.0005},"unitRequired":false,"acceptForms":["decimal","fraction"]}`,
with `W1` = "$4$ only, with $-4$ rejected" and the hint "Both roots of $x^{2} = 16$ must be tested in the
original equation."

**Verified through `markAnswer`:**

| typed | marks |
|---|---|
| `4 or -4` | **4/4 "Correct."** |
| `4 and -4` | **4/4 "Correct."** |
| `4 only` | 4/4 (fine) |
| `x = 4 or x = -4` | 0/4 "That answer could not be read." |
| `-4` | 0/4 |

So the one thing the part exists to test — rejecting $x = -4$ because $\log(x-2)$ would have a negative
argument — is not tested. `parseNumeric("4 or -4")` returns `{value: 4, unit: "or -4"}`: the tail is
swallowed as an unknown unit and, since the spec declares no unit, the unit is ignored.

**Root cause is engine-wide**, `UNKNOWN_UNIT_RE` in `src/lib/marking/numeric.ts` (~line 991). Same
leniency verified on the other numeric parts of this bundle: q0011 accepts `5 or 16` and `5 or 4`
(3/3), q0012 accepts `4 or -4` (4/4), q0014 (b) accepts `6.5 or 4` (3/3).

**Fix (engine).** Make the unknown-unit tail refuse a connective or a second signed number — reject when
the captured tail matches `/^(or|and|nor)\b/i` or contains `[-+]?\d`. `4 cm`, `36 breaths per minute`
and the rest keep working; `4 or -4` becomes unreadable and falls through to the common-error path.

**Pack-side alternative, tested and rejected**: swapping the spec for algebraic `x = 4` does fix
`x = 4 or x = -4` ("A single answer was expected here, but you have given more than one") but it breaks
`4 only` (0/4) and returns a raw compute-engine string for `4 or -4`
("I could not read that as a maths expression (ErrorCode,'incompatible type'…"). Not worth it.

---

## 4 · [Medium] `\log(2x)^{3}` denotes $(\log 2x)^{3}$ — 6 TeX sites plus 2 plain-text ones

`\log(2x)^{3}` puts the cube on the logarithm, not on the argument. The engine reads it that way, and so
would a reader: at $x = 0.95$ it evaluates to **0.0217**, while the intended $\log 8x^{3}$ is **0.8363**.

**Verified**: `checkAlgebraic("\\log(2x)^{3}", "\\log 8x^{3}")` → `not-equivalent`;
`checkAlgebraic("\\log\\left((2x)^{3}\\right)", "\\log 8x^{3}")` → `equivalent`.

Sites (paths from the scan):

* `workedExamples[1].steps[0].working` — "Write the bracket first: $3\log 2x = \log(2x)^{3}$."
* `questions[3].parts[0].scheme[0].for` — "$\log(2x)^{3}$"
* `questions[3].parts[0].workedSolution` and `questions[3].solutionProgram` — "$3\log 2x = \log(2x)^{3}$."
* `prompts[4].answer` (rp…05) — "$\log(2x)^{3} = \log 8x^{3}$."
* `note.blocks[15].md` — "$3 \log 2x$ is $\log(2x)^{3}$"
* plain text: `findTheMistake[0].studentWorking[1]` and `findTheMistake[0].correction[0]` — "= log (2x)^3"

**Same class, q0016 (c)**: `questions[15].parts[2].scheme[0].for`, `.workedSolution` and
`solutionProgram` write `$\log(x + 2)(x - 2) = \log 12$`, which reads as $\log(x+2)\times(x-2)$.
Verified: that spelling is *not* equivalent to $\log(x^{2}-4)$; `\log\left((x + 2)(x - 2)\right)` is.

**Fix**: brace the whole argument — `\log\left((2x)^{3}\right)` and `\log\left((x + 2)(x - 2)\right)`
in the TeX, `= log((2x)^3)` in the two plain-text find-the-mistake lines.

**Why it matters beyond tidiness**: a learner who copies the notation the lesson teaches and types
`log(2x)^3` into q0004 is told "That is not equivalent to the expected answer. For example, when
x = 4.49 your answer gives 0.865 but the correct answer gives 2.8" — a number she has no way to place.

---

## 5 · [Medium] `form: "single-log"` pays full marks for the unexpanded answer on q0004

**Verified**: `log((2x)^3)` on q0004 → **3/3, "Correct – that is equivalent to the expected answer."**
(the same on the `we…02` twin, where `\log((5x)^{2})` passes for `\log 25x^{2}`).

`checkSingleLog` (`src/lib/marking/algebra.ts` ~1119) asks only that exactly one logarithm exist and that
it be the whole answer; it says nothing about the argument. But q0004's `W1` is `$\log 8x^{3}$`, its `M2`
is the expansion, and the 2024 examiner report is quoted throughout the bundle as saying this is the mark
the majority lose. Full credit for the unexpanded bracket empties the item.

Nothing in `AlgebraForm` (`src/lib/content/schema.ts` ~488) expresses "one logarithm with the argument
expanded". Two honest routes:

* **engine**: add `single-log-expanded`, or run the existing `checkExpanded` over the logarithm's
  argument inside `checkSingleLog` when the spec's own argument is a sum/product of powers;
* **pack**: accept the leniency and say so, changing q0004's second stem line from "Give your answer as a
  single logarithm." to "Give your answer as a single logarithm, with the bracket expanded." (this does
  not change the marking, only the honesty of the instruction).

Note this is currently masked by finding 4: the *ambiguous* spelling `\log(2x)^3` is rejected, but for
the wrong reason. Fixing 4 without fixing 5 leaves only the fully-bracketed spelling, which scores 3/3.

---

## 6 · [Medium] `1/2 log n` — the spelling the key strip steers her to — is rejected on q0008 and q0016 (a)

Answers: q0008 `4\log m + \frac{1}{2}\log n - \log t` (4 marks), q0016 (a)
`2\log x + \frac{1}{2}\log y - 3\log z` (3 marks). Both render as "½ log n".

**Verified through `markAnswer` on the real specs:**

| typed on q0008 | marks |
|---|---|
| `4log m + 1/2 log n - log t` | **0/4 "That is not equivalent…"** |
| `4 log m + 1/2 log n - log t` | **0/4** |
| `4log m + 1/2log n - log t` | **0/4** |
| `4log m + (1/2) log n - log t` | 4/4 |
| `4log m + 0.5 log n - log t` | 4/4 |
| `4log m + (log n)/2 - log t` | 4/4 |
| `4log m + 1/2 × log n - log t` | 4/4 |

q0016 (a) behaves identically (`2log x + 1/2 log y - 3log z` → 0/3).

**Cause**: implicit multiplication binds tighter than `/`, so `1/2 log n` parses as
$\frac{1}{2\log n}$. At $m=4.66, n=1.66, t=4.52$ that gives 4.29 against the correct 2.13 — which is
exactly the mismatch the feedback reports.

The answer box is a plain text input whose key strip is `/ √ ^ π × − ( )` with no fraction template
(`MATHS_KEYS`, `src/components/items/AnswerField.tsx` line 62), and the hint on both parts says
"A square root is a power of $\frac{1}{2}$" — so `1/2 log n` is precisely what she will type.

**Fix (engine)**: in the input normalisation in `src/lib/marking/algebra.ts`, rewrite a numeric fraction
that immediately precedes a function name before parsing —
`s.replace(/(\d+)\s*\/\s*(\d+)\s*(?=\\?(?:log|ln|sin|cos|tan|sqrt)\b)/g, '\\frac{$1}{$2}')`.
Leave `log n/2` alone: $\log\frac{n}{2}$ is the correct reading of that, and it is correctly rejected today.

---

## 7 · [Low] q0016 (a) common error is tagged with a misconception it does not show

**Current**: pattern `2\log x + \log y - 3\log z`, `misconception: "fm.logs.coefficient-not-raised"`,
feedback "The square root has been dropped rather than brought down as a half."

The registry entry (`packs/further-maths/insights/misconceptions.json`) reads
"Applies a power to the variable but not to its coefficient, e.g. 3 log 2x becomes log 2x cubed".
No coefficient is involved here — a fractional index was discarded. The ledger will re-drill the wrong
error.

**Fix**: add a registry entry for it (e.g. `fm.logs.root-not-brought-down`, ledgerTag `accuracy`,
sources `ccea-cer:further-maths:2025-summer:FM1:Q9`) and re-tag; nothing in the current registry of 21
`fm.logs.*` entries covers a root left inside.

---

## 8 · [Low] note gate `g6` offers a distractor equal to its own prompt

`note.blocks[26]`:

> prompt: "Using the rule shown above that $1 = \log 10$, what is $1 + \log x$ as a single logarithm?"
> options: `$\log 10x$` (answer), `$\log(1 + x)$`, `$\log x + 1$`

`$\log x + 1$` is the prompt's own expression with the terms swapped — it is not a wrong value, only a
wrong form, so it teaches nothing when she rejects it (and is arguably defensible if she reads the
question as "rewrite this").

**Fix**: replace the third option with `$\log x$` — dropping the constant, the slip the post-diagnostic
`d5` names — or with `$10\log x$`.

---

## 9 · [Low] the first scheme mark scores nothing on the five combine/expand parts

Typing the scheme's own first line earns 0, although the mark exists:

| part | typed | scheme line | marks |
|---|---|---|---|
| q0007 | `log x^3 + log y^2` | `M1` = "$\log x^{3} + \log y^{2}$" | 0/3 |
| q0008 | `\log(m^{4}\sqrt{n}) - \log t` | `M1` | 0/4 |
| q0016 (a) | `\log(x^{2}\sqrt{y}) - \log z^{3}` | `M1` | 0/3 |
| q0005 | `\log(p^{2}q) - \log r^{3}` | `M2` | 0/3 |
| q0014 (a) | `\log(ab^{2}) - \log c` | `M2` | 0/3 |

The form feedback is good ("Correct, but expand it: no product, quotient or power should be left inside a
logarithm"), but no marks follow it. **Fix**: give each part a `commonError` whose pattern is the
half-done expression with `marksTypicallyEarned: 1` so the scheme mark she has earned is paid.

---

## 10 · [Low] q0006's single-log rejection misnames the slip

`2 + log x` on q0006 → 0/3 with "Correct, but a number in front of the log belongs inside it as a power:
write it as one logarithm." There is no coefficient in `2 + \log x`; the 2 has to *become* $\log 100$ and
multiply inside, which is what the item teaches. The sentence is the third branch of `checkSingleLog`
(`src/lib/marking/algebra.ts` ~line 1125) and is right for `3\log m`, wrong for an added constant.

**Fix (engine)**: branch on whether the stray term is a bare number — "Correct, but a constant has to be
written as a logarithm before it can be combined" — or keep one neutral wording, "Correct, but this is
not yet one logarithm: bring every term inside."

---

## 11 · [Low, engine] find-the-mistake: the fix box accepts the wrong line itself

Verified with `fixMatches` (`src/components/items/mistake-marking.ts`):

| item | typed | result |
|---|---|---|
| ftm…01 | `= log 2x^3` (**the mistake line**) | `{match: true, how: "line"}` |
| ftm…01 | `banana 3` | `{match: true, how: "value"}` |
| ftm…02 | `log(x + 5) / log(x - 1) = log 3` (**the mistake line**) | `{match: true, how: "value"}` |
| ftm…03 | `= log(ac / b^2)` (**the mistake line**) | `{match: true, how: "value"}` |

Two causes, one in the pack and one in the engine.

**Pack**: `findTheMistake[0].correction` is `["= log (2x)^3", "= log 8x^3"]`. Its first entry is line 2 of
the working, which is already correct, so the "correction" restates a line she did not get wrong — and
after normalisation `= log 2x^3` and `= log (2x)^3` compare equal, which is why the wrong line passes as
a *line* match. **Fix**: `"correction": ["= log 8x^3"]` (or `["= log((2x)^3)", "= log 8x^3"]` with the
bracket of finding 4, if both lines are wanted).

**Engine**: `fixMatches` falls back to comparing `lastNumber` of the last correction line. On an
algebraic correction that "number" is an exponent (3 for ftm…01, 2 for ftm…03), so anything ending in
that digit passes. **Fix**: gate the value fallback the way `stepLineMatches` already does — only when
the last correction line `statesResult(...)`.

---

## Clean

* **Mathematics** — clean. Every product, quotient and power step, both sides of every identity at three
  numeric points, all three worked examples and their twins, all 11 diagnostic items, all 16 questions
  (21 parts), all 10 retrieval prompts and the insight rule recomputed in `fm1g-maths.mjs`: **0
  mismatches**. Every `commonError` value is genuinely wrong and matches the error it names (checked
  arithmetically: `p + q - 1` = 0.176 vs 0.875; `m + n²` = 0.529 vs 1.255; `a³ + b` = 0.726 vs 1.602;
  numeric 16, 4, 6 each follow from the misreading named). The quoted decimals are right: 1.431364 and
  0.829304 (we…02, ftm…01) and 3.321928 (ftm…02). Mark totals agree with every scheme
  (0014 = 3+3 = 6, 0015 = 2+3 = 5, 0016 = 3+2+4 = 9).
* **Specification** — clean. `FM1-LOG-02` ("solve problems using: the laws of logarithms; and log/log
  graphs in context") covers everything here. Nothing uses the change-of-base rule, natural logarithms or
  log-log graphs, and `notOnThisSpec` names all three. `\ln` and a non-ten base are correctly rejected on
  q0001 and q0006.
* **Text answers** — not applicable: the bundle has no `text` or `text-long` parts, so there is no
  key-word, phrase, inflection or listing behaviour to test.
* **Regex common errors** — not applicable: **0** patterns of `kind: "text"`, so no greedy `.*`, no
  clause-crossing and no heredoc-halved signature. Separately verified that **no** `commonError` pattern
  in the bundle fires on its own part's correct answer, and that all 7 misconception ids used resolve in
  `packs/further-maths/insights/misconceptions.json`.
* **Marking, accepted spellings** — clean apart from findings 3, 5 and 6. Everything a learner can
  reasonably type is accepted: `log(ab)`, `log ab`, `log(a×b)`, `log(x/y)`, `log x/y`, `log m^3`,
  `log 8x^3`, `log 8x³`, `log(p^2q/r^3)`, `log(p^2 q/r^3)`, `log 100x`, `log_{10} 100x`, `3log x + 2log y`
  in either order, `y = x^(3/2)`, `y = √(x^3)`, `y = √x^3`, `x = z^(2/3)`, `x = \sqrt[3]{z^{2}}`,
  `x = 5`, `13/2`, `p + 2q − 1` with the unicode minus. (`x = z^2/3` and `y = x^3/2` are rejected, but
  that is ordinary precedence — `(x^3)/2` — not a defect.) The `y = …` wrapper is accepted on an expression spec, and a bare
  expression on a `y = …` spec. The two new forms behave as intended: `single-log` rejects
  `\log a + \log b`, `\log p^{2} + \log q - \log r^{3}`, `2 + \log x`, `3\log 2x`;
  `expanded-logs` rejects `\log(x^{3}y^{2})`, `\log x^{3} + \log y^{2}`,
  `\log m^{4} + \log n^{\frac{1}{2}} - \log t`. No log form is set on an answer without a logarithm
  (0009, 0010, 0013, 0015 a/b, 0016 b correctly carry none).
* **Multiple choice and diagnostics** — clean. All 11 diagnostic items (3 pre, 8 post) and all 7 choice
  gates have exactly one correct option, no duplicate option texts, and a distractor feedback line on
  every wrong option; every gate's `answer` string is one of its own `options`; the post-diagnostic
  distractors all carry misconception tags (the pre-check's do not, matching the sibling FM1 bundles).
  Only `g6` is weak (finding 8).
* **Find the mistake** — each of the three has exactly one `mistakeLine`, the wrong line is genuinely
  wrong, and the correction is mathematically right. Earned marks are correct on ftm…02 (M2, M3, W1
  against q0012's M1–M3/W1) and ftm…03 (M1 against q0014 (a)). ftm…01 is finding 2; ftm…02's
  lines 3–5 do not follow from its wrong line 2, but the item says so explicitly ("A right answer reached
  through a wrong line still loses the method mark"), so that is deliberate.
* **Structure and hygiene** — clean. 2 288 strings scanned across both files: **0** unpaired `$`, **0**
  `${` placeholders, **0** `undefined`/`NaN`, **0** TeX commands missing their backslash inside maths.
  The hero is first, with a lede, exactly three `can` entries and `minutes: 18`. Eight gates (`g1`–`g8`,
  ids unique); the nine sections between them run 47, 55, 61, 73, 83, 92, 49, 52 and 113 words — all
  inside 150. The "You can now" recap is present; the closing "In the exam" panel is a pointer of 55
  words, inside 80. All four `prompt` blocks name prompts that exist in the bundle. Verification statuses
  (20 verified: note + 3 worked examples + 16 questions; diagnostics, find-the-mistake and prompts draft)
  match the sibling `fm1/indicial-equations` and `fm1/logarithms-from-indices` bundles.

---

**Verdict**: the mathematics is sound throughout and the two new forms work, but do not ship until
0014 (a)'s reversed feedback, ftm…01's earned marks and 0016 (c)'s unrejected root are fixed — three
content fixes — and a decision is taken on the four engine-side items (numeric tail swallowing,
`1/2 log n`, unexpanded `single-log`, `fixMatches` value fallback).
