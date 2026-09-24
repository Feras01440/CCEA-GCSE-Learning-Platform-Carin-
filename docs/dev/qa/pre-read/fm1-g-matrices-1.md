# FM1 matrices, pre-read 1 — `matrix-arithmetic`, `matrix-inverse-2x2`

Read on 2026-09-20 against the republished bundles (`matrix-arithmetic` 20:47, `matrix-inverse-2x2` 16:20).
Digests: `docs/dev/qa/pre-read/fm1-matrix-arithmetic.digest.txt`, `docs/dev/qa/pre-read/fm1-matrix-inverse-2x2.digest.txt`.

Method: every sum, difference, scalar multiple, product (both orders), identity product (both ways), determinant,
adjugate and inverse recomputed in exact rationals — 56 checks, all agreeing with the authored values; every matrix
answer marked through `markAnswer` in 13 spellings; every authored `commonError` pattern marked; the text parts
marked with paraphrases and reversed answers; `lintContent` / `lintNoteBlocks` / `figureLeakWarnings` run on both.
Every fix below was re-run through the marking engine before being written down.

---

## `matrix-arithmetic`

### MA-1 · `dx.fm.u1.matrix-arithmetic.post`, item `d3` — the required answer is off spec

Current stem: *"A matrix $P$ is $2 \times 3$ and a matrix $Q$ is $3 \times 2$. Which products exist?"*
Correct option: *"Both $PQ$ and $QP$"*, feedback *"For $PQ$ the inner numbers are $3$ and $3$; for $QP$ they are $2$ and $2$. Both match, although the two answers are different shapes."*
Distractor `b` feedback: *"$QP$ has inner numbers $2$ and $2$, so it exists as well. **It comes out $3 \times 3$.**"*

The mathematics is right, but the mark turns on accepting a 3 × 3 product. That is excluded three times over, and
the bundle says so itself:

- `topic.notOnThisSpec[0]`: *"3 × 3 matrices, which the Teacher Guidance excludes"*
- `note.notOnThisSpec[0]`: *"3 × 3 matrices"*
- `data/spec/further-mathematics.json` → `units[0].notInSpec[6]` *"3 × 3 matrices"*, and `statements[17].teacherGuidance`
  *"For multiplication, matrix dimensions will not exceed 3 rows or 3 columns, but 3 × 3 matrices will not be included."*

So the item contradicts its own metadata with no not-on-spec callout. (2 × 3 shapes themselves are fine — the
Teacher Guidance allows up to 3 rows or 3 columns, which is why `q.…0008(b)` is on spec.)

**Fix.** Change the shapes to the pair the note already teaches in block 15 — *"So $2 \times 2$ times $2 \times 3$ works
and gives a $2 \times 3$ answer. The other way round, $2 \times 3$ times $2 \times 2$, has inner numbers $3$ and $2$, so
that product does not exist."* Stem: *"A matrix $P$ is $2 \times 2$ and a matrix $Q$ is $2 \times 3$. Which products
exist?"*; correct option *"$PQ$ only"* (inner 2 and 2, answer 2 × 3); distractors *"Both $PQ$ and $QP$"* (QP has inner
3 and 2) and *"Neither, because the shapes are different"*. Same shape rule, same "order matters" lesson, no 3 × 3.

### MA-2 · `q.fm.u1.matrix-arithmetic.0008` part `b` — a common error that is both implausible and unreachable

Current: `commonErrors[0]` = `{ misconception: "fm.matrix.dimensions-not-conformable", pattern: { kind: "matrix", entries: [["7","-7"],["14","14"]] }, marksTypicallyEarned: 0 }`,
feedback *"That product is $2 \times 2$, so it cannot be $AC$…"*.

Two problems:

1. `[[7,-7],[14,14]]` is $A^2$. Nothing in "Work out $AC$" leads there — a learner does not square $A$ when asked for
   $AC$. The truncation slip this misconception really produces is $A$ against the first two columns of $C$,
   which is `[[0,12],[14,8]]` (recomputed).
2. It can never fire. `MatrixField` (`src/components/items/MatrixField.tsx`) renders `spec.rows × spec.cols`
   one-entry inputs and submits `"a b c; d e f"`, and every matrix answer reaches it through `AnswerField`
   (lines 412–414), from both `QuestionRunner` and the worked-example twin. The field here is 2 × 3, so a 2 × 2
   response cannot be submitted at all. Verified: the only 2 × 2 shapes reaching the marker come from a typed
   string, which this surface never produces.

**Fix.** Delete the common error. The engine already gives the same diagnosis for a wrong-shaped answer —
*"This answer should be a 2 by 3 matrix; that one is 2 by 2."* — which is exactly `fm.matrix.dimensions-not-conformable`.
(If a fired diagnosis is wanted, the pattern must be 2 × 3 so the grid can submit it: `[["6","12","-1"],["14","8","16"]]`
is $A$'s $-1$ read as $+1$, and it does fire — verified, 2/3 with the authored feedback attached — but the feedback
would have to be rewritten, and the registry has no sign-slip id to tag it with.)

### MA-3 · `q.fm.u1.matrix-arithmetic.0008` part `c` — one key word hands the mark to answers that are wrong

Current: `keyWords: [{ "any": ["columns", "column"], "marks": 1 }]`, `listingRule: false`.

Marked through `markAnswer` (1 mark):

| answer | now |
| --- | --- |
| "C and A have the same number of columns, so the product works" | **1/1** |
| "the columns of A match the columns of C" | **1/1** |
| "A has 3 columns and C has 2 rows" | **1/1** |
| "columns" | **1/1** |
| "3 and 2 are not equal" (the scheme's own `accept`) | **0/1** |
| "the inner numbers differ" (the scheme's own `accept`) | **0/1** |

The single mark is earned by the presence of the word "columns", so a flat contradiction of the right answer scores
full, while two spellings the mark scheme explicitly accepts score nothing.

**Fix** (verified — all 11 probes behave, 3 right answers full, 5 wrong answers zero, both scheme spellings full):

```json
"accepted": [
  "C has 3 columns and A has 2 rows, and they are not equal, so the product does not exist",
  "the number of columns of C is 3 and the number of rows of A is 2, so they do not match",
  "3 and 2 are not equal",
  "the inner numbers differ"
],
"keyWords": [
  { "any": ["columns of c", "3 columns", "three columns", "columns in c", "c has 3"], "marks": 1 },
  { "any": ["rows of a", "2 rows", "two rows", "rows in a", "a has 2"], "marks": 1 },
  { "any": ["do not match", "does not match", "not match", "are not equal", "is not equal", "not the same", "differ", "different"], "marks": 1 }
]
```

Three 1-mark groups on a 1-mark part is the documented pattern (`mark.ts`: *"Key-word groups need not sum to the
part's tariff… the part's marks are shared out by the fraction of group marks earned, rounding down"*), so all three
ideas are needed for the mark.

### MA-4 · `we.fm.u1.matrix-arithmetic.01` — the twin is marked out of 5 for a 3-mark task

Current: the five steps earn `MW1, M1, M2, M3, W1`. `WorkedExampleAsQuestion.tsx` line 459 sets the twin's tariff to
the number of `earns` codes, so *"Using the same matrices, work out $BA$"* is marked **out of 5**. The identical task
as a question — `q.fm.u1.matrix-arithmetic.0004`, "Work out $AB$" — is **3 marks**, scheme `M1, M2, W1`.

Two codes have no counterpart in any scheme in the bundle: `MW1` on step 1 (checking the shapes, which CCEA does not
credit) and `M3` on step 4 (`M3` appears in no mark scheme anywhere in either bundle).

**Fix.** Drop `earns` from step 1, and give steps 2–4 `M1`, `M2` and then no code (or fold step 4 into step 3), so the
worked example reads `M1, M2, W1` and the twin is marked out of 3, matching `q.…0004`.

### MA-5 · `ftm.fm.u1.matrix-arithmetic.01` — the marks claimed as earned are not in the scheme

Current: `marksEarnedAsWritten: ["MW1"]`, feedback opening *"The shape check earns its mark…"*.

For this exact task the bundle's own scheme (`q.…0004`) is `M1` (at least one entry from a row of $A$ against a
column of $B$), `M2` (all four attempted row by column), `W1`. Seán's working pairs matching positions throughout,
so under that scheme it earns **nothing**; there is no `MW1` to award, and writing the shapes down carries no mark.

**Fix.** Set `marksEarnedAsWritten: []` and open the feedback on the accuracy rather than a mark, e.g. *"The shape you
predicted is right and the arithmetic is accurate, so this is a method problem rather than a careless one."* The rest
of the feedback is good and needs no change.

### Clean in this bundle

- **Mathematics.** $A+B$, $3A$, $2A-B$, $AB$, $BA$, $A^2$, $AC$, the named entry $(AB)_{21}=6$, and every
  commonError matrix (elementwise $A\circ B$, $A-B$, $B-A$, entries squared, rows-paired-with-rows for both $AB$ and
  $A^2$, $B-2A$, $BA$) recompute exactly as authored. The note's figures ($AB$ vs $BA$) and all five gate answers
  ($2\times3$; $1$; $6$; $2\times3$; $7$) are right.
- **Marking.** All 13 spellings of each matrix answer earn full marks, including a scalar in front
  (`\frac{1}{2}\begin{pmatrix}16 & 2 \\ 2 & 8\end{pmatrix}` → full). No wrong matrix earns full marks. The transposes
  of `q.…0001`, `q.…0004` and `q.…0009(b)` score full because those matrices are symmetric — the transpose *is* the
  answer, not a defect. Elsewhere a transpose keeps only the entries the swap leaves in place (e.g. `q.…0002`, 1/2).
- **MCQ and diagnostics.** 10 items: exactly one correct option each, no duplicate texts, feedback on every option.
- **Find the mistake.** The first wrong line is line 2 as authored; all three correction lines are accepted by
  `fixMatches`, and typing the original wrong line back is rejected. Lines 3–5 repeat the same wrong pairing, which
  `whatWentWrong` states outright and the component ("tap the first line that goes wrong") handles correctly.
- **Structure.** Hero first with a 46-word lede, `can[3]`, `minutes: 12`; sections between gates 85 / 73 / 138 / 72 /
  138 / 131 words (all under 150); "You can now" present; closing panel 64 words. No unpaired `$`, no `${`, no
  `undefined`/`NaN`, no bare TeX command words inside maths. No stem still says a fraction in front is not read.
- `lintContent`, `lintNoteBlocks` and `figureLeakWarnings` all clean. No regex common-error patterns exist in this
  bundle, so there is nothing for the greedy-`.*` / heredoc-halved-backslash check to catch.

---

## `matrix-inverse-2x2`

### MI-1 · `q.fm.u1.matrix-inverse-2x2.0008` — the common error's diagnosis is arithmetically impossible

Current: `commonErrors[0]` = `{ misconception: "fm.matrix.determinant-sign-reversed", pattern: { kind: "numeric", value: -2, … }, marksTypicallyEarned: 1 }`,
feedback *"The subtraction is the other way round, so the sign of $k$ came out wrong. From $6k - 12 = 0$, $k = 2$."*

$M = \begin{pmatrix}k & 4 \\ 3 & 6\end{pmatrix}$, so $\det M = ad - bc = 6k - 12$. Taking the subtraction the other way
round gives $bc - ad = 12 - 6k$, and $12 - 6k = 0$ **still gives $k = 2$**. A reversed determinant cannot produce $-2$
here, so both the misconception and the sentence explaining it are wrong. The value $-2$ comes from *adding* the
diagonal products: $6k + 12 = 0$. Verified: typing `-2` currently earns **1 of 2** with that false explanation.

**Fix.** Keep the pattern and rewrite the diagnosis to the slip that really produces it:
*"That comes from adding the two diagonal products: $6k + 12 = 0$. The determinant is $ad - bc = 6k - 12$, and
$6k - 12 = 0$ gives $k = 2$."* The tag must change with it — `fm.matrix.determinant-sign-reversed` is defined in
`packs/further-maths/insights/misconceptions.json` as *"Works out the determinant as bc - ad instead of ad - bc"*,
which this is not. Either add a products-added id to the registry (see MI-2, which needs the same one) or drop the
`misconception` field and keep the feedback. Note there is no value this part could carry for the authored
misconception, because reversing the subtraction returns the correct answer.

### MI-2 · `dx.fm.u1.matrix-inverse-2x2.post`, item `d1` — distractor tagged with a misconception it does not show

Current: option *"$11$"*, `misconception: "fm.matrix.determinant-sign-reversed"`, feedback *"The two products are
subtracted, not added."*

$11 = (4)(2) + (1)(3) = ad + bc$ — the products added. The reversed subtraction is $bc - ad = -5$, which is the
*other* distractor in the same item and already carries that tag. So one id is on two different errors, and on this
one the feedback (correct) and the tag (wrong) disagree.

**Fix.** Retag to a products-added id — the same registry addition MI-1 needs — or drop the `misconception` field
from this option; the feedback sentence is already right and needs no change.

### MI-3 · `dx.fm.u1.matrix-inverse-2x2.post`, item `d5` — mis-tagged distractor

Current: option *"Add it to the original matrix and look for the zero matrix"*, `misconception:
"fm.matrix.elementwise-product"`, feedback *"An inverse undoes a multiplication, not an addition."*

`fm.matrix.elementwise-product` is *"Multiplies two matrices entry by entry in matching positions instead of row by
column"*. Looking for the zero matrix is confusing a multiplicative inverse with an additive one; no entrywise
product is involved.

**Fix.** Drop the `misconception` from this option and leave the feedback as it stands. The sibling distractor
("Check that every entry is the reciprocal of the original entry") is a fair use of that tag and should keep it.

### MI-4 · Four stems promise an input the answer field cannot take

Current, on `q.…0004` (main), `q.…0005` (main), `q.…0009` (a) and (b):
*"Write the answer as a matrix. A fraction, a decimal **or a fraction in front of the brackets** is accepted."*

The engine does read a leading scalar — `\frac{1}{5}\begin{pmatrix}2 & -1 \\ -3 & 4\end{pmatrix}` marks 3/3 on
`q.…0005` — but a learner has no way to type one. Matrix answers are entered in `MatrixField`: a `rows × cols` grid
of one-entry inputs inside a drawn bracket pair, which submits `"a b; c d"`. There is no box in front of the
brackets. `AnswerField` sends every `matrix` spec there, and both `QuestionRunner` and the worked-example twin go
through `AnswerField`, so no surface in the app accepts the spelling the stem offers.

Two further mismatches on the same sentence:

- On `q.…0004` and `q.…0009(b)` every spec entry is a plain integer, so `MatrixField` renders `type="number"`
  inputs, which will not take a `/` — "a fraction … is accepted" is not true there either.
- The spellings that *would* fail even on a one-line field are the ones the bundle itself teaches. Verified against
  `q.…0005`: `1/5 (2 -1; -3 4)` → 3/3 and `1/5 × (2 -1; -3 4)` → 3/3, but `1/5 2 -1; -3 4` → **0/3**,
  `(1/5) (2 -1; -3 4)` → **0/3**, `1/(5) (2 -1; -3 4)` → **0/3** and `1/5 x (2 -1; -3 4)` → **0/3** — the last two
  being the exact form of this bundle's own find-the-mistake fix line, `"N inverse = 1/(-5) x (-1 -2 ; -4 -3)"`.

**Fix.** Reduce the sentence to *"A fraction or its decimal is accepted for each entry."* on `q.…0005` and
`q.…0009(a)`, and drop it entirely from `q.…0004` and `q.…0009(b)`, whose entries are whole numbers. Keep the
"keep the $\frac{1}{5}$ outside the brackets" advice in the note, where it is advice about writing on paper.

### MI-5 · `q.fm.u1.matrix-inverse-2x2.0009` part `c` — a negation of the right answer scores full marks

Current: `keyWords: [{ "any": ["determinant","det"], "marks": 1 }, { "any": ["0","zero"], "marks": 1 }]`, 2 marks;
scheme `MW1` *"$\det H = 18 - 18 = 0$"* and `W1` *"$H$ named as the matrix with no inverse"*, accept *"$H$ is singular"*.

Marked through `markAnswer`:

| answer | now |
| --- | --- |
| "the determinant is not zero, so the inverse exists" | **2/2** |
| "the determinant of F is zero" | **2/2** |
| "the determinant is zero" (H never named) | **2/2** |
| "H is singular" (the scheme's own `accept`) | **0/2** |

Nothing requires the matrix to be named, although `W1` is precisely the naming mark and the examiner evidence behind
this topic is exactly that failure — `topics[26].examinerEvidence[1]`: *"most knew the equation could not be solved
because det B = 0, but the wording was often unclear about which matrix had no inverse"*, echoed by
`rp.fm.u1.matrix-inverse-2x2.07`. And nothing blocks a negation, so the opposite of the right answer scores full.

**Fix** (verified — all 11 probes behave: right answers full, the negation 0/2, "the determinant is zero" and
"the determinant of F is zero" 1/2 for the determinant idea without the naming mark, "H is singular" 1/2 as the
scheme's accept implies, bare "zero" 0/2):

```json
"keyWords": [
  { "any": ["determinant", "det"], "marks": 1, "reject": ["not zero", "not 0", "non zero", "nonzero", "isnt zero"] },
  { "any": ["0", "zero", "singular"], "marks": 1, "reject": ["not zero", "not 0", "non zero", "nonzero", "isnt zero"] },
  { "any": ["h"], "marks": 1 }
]
```

### MI-6 · `we.…01` and `we.…02` — both twins are marked out of 4 for a 3-mark task

Current: each worked example's steps earn `MW1, M2, W1, W2`, so the twins (*"Find $B^{-1}$…"*, *"Find $F^{-1}$…"*) are
marked **out of 4**. The same task as a question — `q.…0005` and `q.…0009(a)` — is **3 marks**, scheme `MW1, M2, W1`.
The extra code is `W2` on step 4, the check by multiplying back, which earns nothing in a CCEA scheme and appears in
no mark scheme in either bundle.

**Fix.** Drop `earns` from step 4 of both worked examples (keep the step — the check is good teaching), leaving
`MW1, M2, W1` and twins marked out of 3, matching `q.…0005` and `q.…0009(a)`.

### Clean in this bundle

- **Mathematics.** Every determinant ($\det A = 5$, $\det N = -5$, $\det B = 2$, $\det F = 2$, $\det G = 1$,
  $\det S = 0$, $\det H = 0$), every adjugate and every inverse recompute exactly as authored, and each inverse was
  proved by multiplying both ways: $A^{-1}A = AA^{-1} = I$, $N^{-1}N = NN^{-1} = I$, $B^{-1}B = I$, $F^{-1}F = I$,
  $G^{-1}G = I$. `we.…02`'s negative-determinant narrative checks out: $\frac{1}{-5}$ gives
  $\begin{pmatrix}1/5 & 2/5 \\ 4/5 & 3/5\end{pmatrix}$ and writing $\frac{1}{5}$ instead gives exactly the all-negative
  matrix the step quotes. Every commonError matrix matches the error it names — not divided by the determinant, the
  $\frac{1}{5}$ on one entry only, adjugate not swapped, adjugate not negated — as do all four `q.…0007` distractors.
- **Marking.** All 13 spellings of each matrix answer earn full marks, fractional entries and their decimals
  alike (`2/5 -1/5; -3/5 4/5` and `0.4 -0.2; -0.6 0.8` both full; `1 -3/2; -2 7/2` and `1 -1.5; -2 3.5` both full).
  No wrong matrix earns full marks. `q.…0006` accepts both `-0.2` and `-1/5`. The determinant parts catch the sign
  slip and give the authored diagnosis on `q.…0001` and `q.…0002`.
- **MCQ and diagnostics.** 10 items: exactly one correct option each, no duplicate texts, feedback on every option.
- **Find the mistake.** Exactly one line introduces the error (line 3); line 4 is its correct consequence; lines 1–2
  are right, and `marksEarnedAsWritten: ["MW1","M2"]` matches `q.…0005`'s scheme exactly. Both correction lines are
  accepted by `fixMatches` and the original wrong line is rejected.
- **Structure.** Hero first with a 53-word lede, `can[3]`, `minutes: 11`; sections between gates 85 / 81 / 81 / 126 /
  138 / 131 words (all under 150); "You can now" present; closing panel 60 words. No unpaired `$`, no `${`, no
  `undefined`/`NaN`, no bare TeX command words inside maths.
- `lintContent`, `lintNoteBlocks` and `figureLeakWarnings` all clean. No regex common-error patterns exist in this
  bundle.

---

## Verdicts

- **`matrix-arithmetic`** — the mathematics is sound throughout and the marking accepts every spelling it should;
  hold publication for MA-1 (a post-check whose correct answer needs a 3 × 3 product the spec and the bundle's own
  `notOnThisSpec` exclude) and MA-3 (the one-word key list gives the mark to answers that state the opposite), with
  MA-2, MA-4 and MA-5 as small, self-contained corrections.
- **`matrix-inverse-2x2`** — every determinant and inverse is right and proved both ways, and the four inverse
  misconceptions are modelled unusually well; hold publication for MI-5 (a negation of the right answer scores 2/2
  and the naming mark the examiner reports care about is not required) and MI-1 (a common error whose stated
  reasoning is arithmetically impossible), with MI-2, MI-3, MI-4 and MI-6 as small corrections.
