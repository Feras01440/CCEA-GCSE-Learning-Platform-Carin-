# FM1 pre-read C-1 — four Further Maths Unit 1 bundles

Bundles: `solve-three-simultaneous-equations`, `form-three-simultaneous-equations`,
`trig-graphs-sin-cos-tan`, `trig-equations` (all under `packs/further-maths/content/fm1/`).
Digests read in full: `docs/dev/qa/pre-read/fm1c-<slug>.digest.txt`.

**Partial:** two checks were not finished before the session stop mark and are **not** covered below:
(1) the `specRefs` in each bundle were **not** reconciled against `data/spec/further-maths.json`
(every item carries `specRefs: []` at topic level; the note's spec callouts quote FM1-SIM-01,
FM1-TRG-01 and FM1-TRG-02, which look right, but this was not verified against the spec file);
(2) figure SVGs were dumped and compared with their alt text for
`solve-three-simultaneous-equations` only — the other three bundles' figures were scanned
mechanically (`fm1c-scan.txt`) but not read. Everything else below was run and re-run.

Area (e) — graph parts — **does not apply**: no part in these four bundles has `kind: "graph"`.
The only drawing parts are the two `kind: "drawing"` sketches in `trig-graphs` (self-marked);
one of them has a defective rubric, below.

How things were checked: every system solved and every trig value recomputed in node; every
part marked with `markAnswer` from `src/components/items/mark.ts`
(`scratchpad/fm1c-mark.mts` → `fm1c-mark.txt`, 19 mismatches); every proposed fix re-run
(`scratchpad/fm1c-fixes.mts`) — the results quoted below are that script's output.

---

## 1. solve-three-simultaneous-equations

### 1.1 The find-the-mistake feedback names the wrong checking equation (item `ftm.fm.u1.solve-three-simultaneous-equations.01`)

Current last sentence of `feedback`:

> "Niamh's values fail that check in $(3)$, which is where twenty seconds would have saved four marks."

Niamh's values are `x = -2, y = 6, z = -1`. Substituting into (3):
`3(-2) + 2(6) - (-1) = -6 + 12 + 1 = 7` — equation (3) is **satisfied**, so the check she is being
sent to would pass and teach the opposite lesson. This is forced, not accidental: her line 1 is
`(1) + (3)` done correctly and her `z` came from (1), so (3) = (4) − (1) holds automatically.
The equation that fails is (2): `-2 - 6 + 2(-1) = -10 ≠ 10`.

**Fix:** change `$(3)$` to `$(2)$` in that sentence. The item's own `correction` array already
ends `"Check in (2): 3 - 1 + 2(4) = 10"`, and worked example step 6 also checks in (2), so this is
the only place that disagrees.

### 1.2 Everything else in this bundle is clean

Recomputed and correct: WE.01 (`x = 3, y = 1, z = 4`, both eliminations, the check), its twin
(`x + 2y + 3z = 15`, `3x + y - z = 10`, `x + y + 2z = 9` → `(2, 5)`), all six diagnostic pre/post
items, and every question: 0001 `5x + 5y = 20`; 0002 `3x + 7y = 16`; 0003 `(3, 1)`;
0004 `z = 3`; 0005 `4, 2, 3`; 0006 `2, 5, 2`; 0007 `2.5, 1.5, 3`. Every common-error value
reproduces from the misconception it names, including the awkward ones — 0005a `-2.92`
(27 + 15 = 42 instead of 12), 0006a `82` (45 + 20 = 65), 0007a `-5.83` (14 − 10 = 4 on the first
elimination) and `9.5` (2×(1) with the right-hand side left alone), 0007c `-0.33`.
Marking: every common error fires on its own pattern and earns exactly what it declares; every
equation answer also accepts the scheme's stated alternatives (`x + y = 4`, `2z = 3y`, sides
swapped, terms reordered).

One deliberate strictness worth knowing rather than fixing: `0003/main` (`(3, 1)`) refuses a bare
`3, 1` (0 of 3, "Give each pair as (x, y)"). The stem does say "Give your answer as $(x, y)$", and
`x = 3, y = 1` and `x = 3 and y = 1` both score 3 of 3, so this looks intended.

**Verdict: one wrong sentence in the find-the-mistake feedback; the mathematics and the marking are sound.**

---

## 2. form-three-simultaneous-equations

### 2.1 `q...0012` part `a` — common error `25` cannot come from the misconception named

Current: `{"kind":"numeric","value":25}`, `fm.simeq.wrong-equation-from-words`, 1 mark, feedback
"Check equation $(2)$: Aoife is the elder, so the 5 is added to Bróna's age, not to Aoife's."

Reversing equation (2) does **not** change `x`. With `x + y + z = 37`, `y - x = 5`, `y + z = 20`,
substituting `z = 20 - y` into the first gives `x = 17` — the correct answer. That is exactly the
system in this bundle's own `q...0011` (`x = 17, y = 22, z = -2`), which is where the −2 comes
from. So no learner making this slip ever types 25, and the diagnosis never reaches anyone.

**Fix (keep the value, correct the diagnosis):** 25 is `20 + 5`, i.e. reading the third sentence
as "Bróna is 20" instead of "Bróna and Ciara's ages add to 20". Replace the feedback with:
"That reads the third sentence as giving Bróna's age. It says Bróna **and Ciara's** ages add to
20, so 20 is not Bróna's age; equation $(3)$ is $y + z = 20$." (Alternative if the wrong-way-round
comparison is the misconception you want to keep: drop this common error, because that slip leaves
`x = 17` untouched.)

### 2.2 `q...0013` part `d(i)` — common error `6.16` is not the value that misconception produces

Current: `{"kind":"numeric","value":6.16}`, 2 marks, feedback "That value comes from the comparison
in (a) written the other way round…".

With (a) reversed (`x = y + 0.7`, so `y = x - 0.7`) and (b) unchanged (`z = 1.5y`):
`2x + 3(x - 0.7) + 1.5(x - 0.7) = 12.25` → `6.5x - 3.15 = 12.25` → `x = 15.4 ÷ 6.5 = 2.3692…`,
i.e. **2.37**. 6.16 is `15.4 ÷ 2.5` and does not arise from any reading of the three sentences I
could reproduce.

**Fix:** change the value to `2.37` and leave the feedback as it is (the price is still absurd for
a scone beside a £2.10 coffee, so the "signal in itself" sentence still reads). Note the common
error is matched with zero tolerance, so the value has to be the one a learner types — 2.37.

### 2.3 Show-that parts pay 2 of 3 for working backwards, which the scheme scores 0

Parts: `q...0005/main`, `q...0006/main`, `q...0014/b`, `q...0015/a`, `q...0015/b` (all
`kind: "text"` with key-word groups).

Measured: for `0005/main`, the response
`"Start from the printed equation and multiply the whole equation by 10 to get 2130 pence; it fits."`
scores **2 of 3**. The groups `2130` and `pence` are both present, so they pay out; the authored
common error `fm.simeq.work-backwards-from-given` (marksTypicallyEarned 0) supplies the feedback
but — by design in `mark.ts`'s text branch — can never lower the mark. `0006/main` behaves the
same way (2 of 3 for "Start from the printed equation and multiply the whole equation by 2…"), and
`0015/b` pays 1 of 2. This is the exact misconception the item and three examiner callouts are
built around, and it banks most of the marks.

**Fix (verified):** add a reject list to **every** group of those parts, e.g. for `0005/main`

```
{"any":["2130","21.3"],"marks":1,"reject":REJ}
{"any":["pence","pennies"],"marks":1,"reject":REJ}
{"any":["divide","dividing","divided"],"marks":1,"reject":["multiply the whole equation", ...REJ]}
REJ = ["start from the printed","start with the printed","start from the given",
       "start with the given","working backwards","work backwards","worked backwards",
       "start at the printed"]
```

With that list the backwards answer scores **0 of 3** ("start from the printed" cancels the mark
it sits with), while both authored `accepted` answers and a forward paraphrase still score 3 of 3.
`work backwards` and `working backwards` must both be listed: the phrase matcher tolerates a
trailing *s* only, so "work back" does not reach "working backwards".

### 2.4 `q...0011/main` — a correct answer that writes the numeral scores 1 of 2

Current group 1: `{"any":["negative","below zero","less than zero","minus"],"marks":1}`.

Measured: `"Ciara's age is -2, which is impossible, so one of the equations must have been formed
wrongly; she should check them against the sentences."` → **1 of 2**, "still missing negative".
That answer is precisely what MW1 asks for ("saying that an age cannot be negative, so $z = -2$ is
impossible"), written with the value instead of the word.

**Fix (verified):** add `"-2"` and `"impossible"` to group 1's `any`. The answer above then scores
2 of 2, the two authored `accepted` answers still score 2 of 2, and the named common error
("The arithmetic must be wrong, so she should add it up again.") still scores 0 of 2.

### 2.5 Minor: `q...0015` part `c(i)` common error `-5.8` is in thousands, but the part asks for pounds

`-5.8` is reproducible (using `12x + 8y + 6z = 39`, i.e. part (a) scaled the wrong way, gives
`y = 6.9`, `x = -5.8`), so the diagnosis is right. But this part's answer is `2000` (pounds) and
its sibling common error `2` is explicitly "forgot to multiply by 1000". A learner who scaled the
wrong way in (a) *and* remembered the ×1000 types `-5800` and gets nothing. Consider adding
`-5800` as a second common error with the same feedback, or state the value in thousands
explicitly in the feedback.

### 2.6 Clean here

All three worked examples recompute (café `1.40 / 2.10 / 3.15`; printer `x = 2, y = 3, z = 5`
with `12x + 8y + 6z = 78 → 6x + 4y + 3z = 39`; curve `y = 2x² + 3x + 1` through (1,6), (2,15),
(3,28)), and so do their twins (Aoife 17; bespoke £5000; `4a + 2b + c = 15`). The coin context is
internally consistent (24/15/9 → 48 coins, 2130p, `2x + 5y + 10z = 213`, `x = y + z`). All twelve
diagnostic items are right, including the reverse percentage (`3500 ÷ 0.7 = 5000`) and its two
distractors (4550, 2450). Every algebraic part accepts the scheme's alternative forms
(`y - x = 0.7`, `2z = 3y`, `x - y - z = 0`, sides swapped, `2x²` typed with a unicode superscript).
All three find-the-mistake items check out: Niamh's four backwards lines, Eimear's `z = y + 50 →
52.1`, and Órla's `y - x = 5` system, which really does give `17, 22, -2` and really is repaired by
`x - y = 5` → `17, 12, 8`.

**Verdict: two common-error values that cannot be reached, one marking hole that pays for the topic's headline misconception, and one under-earning key-word group.**

---

## 3. trig-graphs-sin-cos-tan

### 3.1 The mark scheme's own answer is marked wrong in three questions (`0004`, `0005`, `0006`)

`q...0004/main` stem: "You are given that $\sin 40^\circ = 0.64$. Use the symmetry of the curve to
write down the value of $\sin 140^\circ$." Scheme W1: "$0.64$". Worked solution: "Therefore
$\sin 140^\circ = 0.64$."

Current spec: `{"kind":"numeric","value":0.642788,"tolerance":{"type":"absolute","value":0.0005}}`.

Measured: typing **`0.64` scores 0 of 2**, with the feedback "0.64 is only the rounded value. Keep
the exact value, or more figures, until the final step." The learner is told to use the number the
question handed her and is then marked wrong for using it. The same applies to
`0005/main` (`cos 35° = 0.82` given, spec `0.819152`) and `0006/main` (`tan 32° = 0.62` given,
spec `0.624869`). The sign common errors miss for the same reason: `-0.64` scores 0, not the 1
mark they declare.

**Fix (verified):** make the given value the answer and widen the tolerance so the full-precision
value still passes:

* `0004/main`: `value: 0.64`, `tolerance: {"type":"absolute","value":0.005}`; common error
  `value: -0.64` with the same tolerance.
* `0005/main`: `value: 0.82`, same tolerance; common error `-0.82`.
* `0006/main`: `value: 0.62`, same tolerance; common error `-0.62`.

Re-run: `0.64`, `0.642788`, `0.6428` and `0.643` all score 2 of 2; `-0.64` and `-0.642788` both
score 1 of 2 with the sign diagnosis; `0.77` still scores 0. Same for the cosine and tangent
versions (`0.82` / `0.819152` and `0.62` / `0.624869` all full marks).

### 3.2 `q...0010` part `a` — the tan sketch is marked against a sine/cosine rubric

Current `rubric` (`kind: "drawing"`, `selfMark: true`) for a sketch of `y = tan x`:

```
"One smooth curve, with no straight stretches between the turning points"
"The angles written along the x axis and 1 and -1 marked on the y axis"
"The maximum and the minimum at the right angles, drawn as turning points rather than corners"
"For tan x only: dashed asymptotes that the curve approaches but never meets"
```

The first three lines are the cosine rubric from `0009/a`, pasted whole. Tangent has no maximum,
no minimum and no turning points, and `±1` is not what its y-axis is scaled by. The bundle's own
note says so ("Tangent has no maximum and no minimum; it has asymptotes instead", figure at block
15) and so does its own gate g8 ("$\tan x$ has no maximum and no minimum anywhere"), and the
part's own scheme asks for "three branches of the correct shape, each rising from bottom left to
top right" plus "dashed asymptotes at $x = -90$ and $x = 90$". A learner self-marking against this
rubric is told to find turning points that do not exist.

**Fix:** replace the rubric with the part's own scheme, e.g.

```
"Three branches, each rising from bottom left to top right, with no straight stretches"
"Dashed vertical asymptotes at x = -90 and x = 90 that the curve approaches but never meets"
"Crossings marked at -180, 0 and 180, and the angles written along the x axis"
```

(Also: the fourth line's "For tan x only:" prefix is left over from a shared rubric and can go.)

### 3.3 `q...0003/main` — a wrong answer scores full marks

Current: `keyWords: [{"any":["x = 90","90"],"marks":1},{"any":["x = 270","270"],"marks":1}]`.

Measured: **`"y = 90 and y = 270"` scores 2 of 2** ("Every marking point is there"), because the
bare `90` and `270` alternatives match whatever letter precedes them. The part's own common error
says that answer is worth 1 ("The values are right and the lines are vertical, so each equation
begins $x =$, not $y =$"), and an asymptote written as a horizontal line is wrong.

**Fix (verified):** add a reject to the second group only —
`{"any":["x = 270","270"],"marks":1,"reject":["y = 270","y = 90"]}`. Re-run:
`y = 90 and y = 270` → 1 of 2 (exactly the mark the common error declares, and the common error
still supplies the feedback); `x = 90 and x = 270` and `90 and 270` → 2 of 2; `x = 90` → 1 of 2;
`x = 0 and x = 180` → 0 of 2. Rejecting in both groups instead would give 0 of 2, which contradicts
the authored 1 mark.

### 3.4 Note gate `g10` (block index 42) — LaTeX with the backslashes stripped

```
options: ["$y = cos x$ for $-180^circ le x le 180^circ$", "$y = sin 2x$", "$y = cos(x - 30^circ)$"]
answer:  "$y = cos x$ for $-180^circ le x le 180^circ$"
explain: "Any range inside $-360^circ$ to $360^circ$ is fair, …"
```

`cos`, `sin`, `^circ` and `le` render as italic juxtaposed letters ("c o s x", "^circ", "le"),
not as operators, degrees and ≤. **Fix:** `\cos`, `\sin`, `^\circ`, `\le` throughout the block
(and the answer string must stay byte-identical to its option). This is the only block in the
bundle with the problem — a scan of every `$…$` span in all four bundles found exactly this block
and one more (§4.1).

### 3.5 `q...0010` part `c` — the stem admits three answers and accepts one

Stem: "Write down the value of $x$, between $-180^\circ$ and $180^\circ$, at which your sketch
crosses the x-axis and is also a point of the curve $y = \sin x$." Answer `0`, 2 marks.

`tan x = 0` at `-180`, `0` and `180`, and `sin x = 0` at all three, so all three satisfy every
condition in the sentence except the reading of "between" as strict. Measured: `180` and `-180`
both score 0 of 2 with "That is not the expected answer. Check each step of your working." The
worked solution admits the difficulty ("The range is open at its ends here") and hint 2 patches it
("lies strictly between the ends of the range"), but the stem does not.

**Fix:** put the constraint in the stem — "…the value of $x$, **strictly between**
$-180^\circ$ and $180^\circ$, …" (or "…other than at the two ends of the range…").

### 3.6 Clean here

Recomputed and correct: both worked examples (`sin⁻¹0.6 = 36.87`, `180 - 36.87 = 143.13`; the tan
sketch's asymptotes and crossings), their twins (`cos x = -0.8` has 2 solutions; asymptotes of tan
on −180…180 are `x = ±90` — and the twin's key words behave: `x = -90` alone scores 0 of 1, so the
`-90` / `90` groups do not double-count). All twelve diagnostic items are right, including
`sin 130° = 0.77` and `cos 50° = 0.64`. Question answers all check: period 360 / 180,
`cos 180° = -1`, minimum `(180, -1)`, `0008` readings `36.87` / `143.13` with ±5° ranges,
`0009` `cos x = -0.8 → 143.13, 216.87`, and every "wrong quadrant" common error
(`323` on the sine curve, `37` on the cosine curve) reproduces. `(180, 1)` and `(180, 0)` are both
refused by `0002/b`, so the decimal-point-splitting in the text normaliser does not bite there.
The find-the-mistake item (Órlaith, `sin 130 = -0.77`) is sound: one wrong line, the fix repairs
it, and M1 is the right credit.

One cross-cutting note, not a bundle defect: on `kind: "text"` parts a matched common error can
never raise the mark (`mark.ts` does this deliberately), so `0002/b`'s
`marksTypicallyEarned: 1` for `(-1, 180)` is documentation only — that answer scores 0.

**Verdict: three questions whose own scheme answer is marked wrong, a tan sketch marked against a cosine rubric, one wrong answer scoring full marks, and one block of broken LaTeX.**

---

## 4. trig-equations

### 4.1 Note gate `g10` (block index 41) — LaTeX with the backslashes stripped

```
options: ["$cos(2x - 40^circ) = -0.25$ in a given range", "$2sin^2 x - sin x = 0$", "A triangle problem using the cosine rule"]
answer:  "$cos(2x - 40^circ) = -0.25$ in a given range"
explain: "… A quadratic in $sin x$ and the two triangle rules are outside this statement."
```

Same defect as §3.4: `\cos`, `\sin`, `^\circ`. **Fix:** restore the backslashes in the three
options, the answer (byte-identical) and the explain.

### 4.2 `q...0009` part `c` — the first key-word group does not fire on the bundle's own phrasing

Current group 1: `{"any":["greatest value","maximum","never more than 1","cannot be more than 1","highest value"],"marks":1}`.

Key words are matched as consecutive words, so `never more than 1` does not reach
"sin x can **never be** more than 1" — the phrasing of this part's own second `accepted` answer.
Measured:

| response | now |
|---|---|
| "sin x can never be more than 1, so the line never crosses the curve." | **1 of 2** ("still missing greatest value") |
| "sin x can never be bigger than 1, so the line at 1.2 never touches the graph." | **1 of 2** |
| "The curve only goes up to 1, so a line at 1.2 is above it the whole way." | **0 of 2** |
| "The highest the curve gets is 1 and 1.2 is higher, so there are no crossings." | **1 of 2** |

Only the two literal `accepted` strings and the four authored phrases score.

**Fix (verified):** widen both groups to words rather than exact phrases —

```
group 1 any: ["greatest","maximum","highest","never more than 1","never be more than 1",
              "cannot be more than 1","never bigger than 1","never be bigger than 1",
              "only goes up to 1","never goes above 1"]
group 2 any: ["never meets","never crosses","does not cross","above the curve",
              "above the graph","no crossings","never touches"]
```

Re-run: all four paraphrases above score 2 of 2 (with "above it" written as "above the curve"),
the accepted answers still score 2 of 2, and "The line is above the curve." alone still scores
1 of 2. Do **not** add bare `"more than 1"` or `"above 1"`: the normaliser turns `1.2` into the two
words `1 2`, so those key words would also fire on "more than 1.2".

Known limit, no clean fix: the groups are presence-based, so
"The maximum of sin x is 1.2, so the line never crosses the curve." scores 2 of 2 despite the
wrong fact. Rejecting `1.2` would break the legitimate "the maximum is 1 and 1.2 is higher".

### 4.3 The eleven degree-sign common errors are now inert (no action needed)

Every solve part carries a `kind: "text"` common error of the shape
`^(?=[^]*(?:^|[^0-9.])30\s*(?:°|degrees?\b))(?=[^]*(?:^|[^0-9.])150\s*(?:°|degrees?\b))[^]*$`
awarding full marks for a degree-signed answer. With today's algebra-engine change those answers
are already marked correct by the engine, so the pattern never runs. I checked each one for
greediness anyway: the `[^]*` lookaheads are both anchored on the value they test and every
regex requires **both** solutions, so none of them fires on a one-solution or wrong-quadrant
answer, and none fires on the correct answer in a way that could raise or lower a mark. They can
stay or be deleted; they do no harm either way.

### 4.4 Clean here

Every solution set recomputes: `sin x = 0.5 → 30, 150`; `cos x = -0.5 → 120, 240`;
`tan x = 1 → 45, 225`; `sin x = -0.5 → 210, 330`; `cos x = 0.5` on −360…0 → `-300, -60`;
`2 sin x = 1.4 → 44.43, 135.57`; `4 cos x + 3 = 0 → 138.59, 221.41`; `tan x = 2.5 → 68.20,
248.20`; `5 sin x = 3 → 36.87, 143.13`; `cos x = -0.25 → 104.48, 255.52`, and the bracket part
`cos(2x - 40°) = -0.25` on 0…180 → bracket range −40…320 → `72.24, 147.76` (both inside). Every
wrong-quadrant common error is the value its rule produces (`330` for sine, `60` for cosine, `315`
and `291.80` for tangent, `41.41/318.59` for the dropped minus sign, `92.24/167.76` for halving
before adding, `248.96/551.04` for doubling then adding), and each earns what it declares.

Spellings: for all eleven solution-set parts, `30, 150` / `x = 30 or x = 150` / `30° and 150°` /
`x=30,150` / `x = 30, x = 150` / `150, 30` / `30 degrees and 150 degrees` all score full marks,
and `x = 30` alone scores exactly 1 of 2 (2 of 3 where the part is 3 marks) with the
second-solution diagnosis. Both find-the-mistake items are sound (Sinéad's `360 − 36.87`;
Cathal stopping at one answer), with the right earned marks.

**Verdict: one block of broken LaTeX and one key-word group that misses the paraphrases; the mathematics is right throughout.**

---

## 5. Checks that came back clean across all four bundles

* **Placeholders.** No unpaired `$`, no `${`, no `undefined`, no `NaN` anywhere in the four
  `bundle.json` or `note.blocks.json` files (the one odd-`$` hit is a regex anchor in
  `form-three` `q...0011`'s common error, not a maths delimiter).
* **Hero blocks.** All four `note.blocks.json` open with a `hero` carrying `lede`, exactly three
  `can` items and `minutes` (12 / 18 / 14 / 14).
* **Diagnostics and gates.** Every diagnostic item across the four bundles has exactly one correct
  option, no duplicate option texts, a misconception id on every distractor and feedback on every
  option. Every `kind: "choice"` note gate has its `answer` equal to exactly one of its options,
  no duplicates and a non-empty `explain`; every `kind: "number"` gate has an answer and an
  explain. (Content of the gates read and correct, apart from the two LaTeX blocks above.)
* **Find-the-mistake.** All seven items have a single `mistakeLine` in range, a `correction` that
  repairs it, and `marksEarnedAsWritten` consistent with the scheme — except the
  `solve-three` feedback sentence in §1.1.
* **Words between gates** (prose only; `$…$` counted as one word). Every section is at or under
  the limit except two that are marginal — `trig-graphs` blocks 5–8 (154) and `trig-equations`
  blocks 9–12 (152) — and the first section of `form-three` (155), `trig-graphs` (166) and
  `trig-equations` (152), each of which is only over because the hero's lede and `can` list are
  counted with it; the body alone is 66 / 70 / 62.
  **"In the exam" panels, reported separately as asked:** `form-three` 248, `trig-graphs` 211,
  `trig-equations` 199, `solve-three` 115 (this one keeps its Sheet callout behind a gate, so it
  splits 115 + 127 + 61).

## 6. Verdicts

| bundle | verdict |
|---|---|
| solve-three-simultaneous-equations | Publishable after one word: the find-the-mistake feedback sends the learner to check in (3), which passes — it is (2) that fails. |
| form-three-simultaneous-equations | Two unreachable common-error values (25, 6.16), and the show-that parts pay 2 of 3 for the working-backwards answer they exist to punish. |
| trig-graphs-sin-cos-tan | Not publishable yet: three questions mark their own scheme answer wrong (0.64 / 0.82 / 0.62), a tan sketch carries a cosine rubric, and `y = 90 and y = 270` scores full marks. |
| trig-equations | Strongest of the four mathematically; one gate's LaTeX has lost its backslashes and one key-word group misses every natural paraphrase. |
