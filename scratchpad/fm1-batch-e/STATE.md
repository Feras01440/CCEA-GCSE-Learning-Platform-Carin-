# FM1 batch E — state at 2026-09-20 16:12

## Status: COMPLETE, including the peer pre-read pass (docs/dev/qa/pre-read/fm1-e-1.md).
Every finding in that report is fixed through the generators; 0 lesson-v2 breaches on all four.

The build is green: `npx tsx pipeline/build-content.mts --strict` → 124 bundles, 0 problems,
0 key-word warnings. Nothing is half-written; no folder needs moving.

## Published counts

| Topic | Folder | Counts | Gates |
|---|---|---|---|
| curve-sketching-quadratic-cubic (S) | `packs/further-maths/content/fm1/curve-sketching-quadratic-cubic/` | we 2 · dx 7 · q 11 · ftm 1 · rp 7 · note | 9 |
| optimisation (H) | `.../optimisation/` | we 3 · dx 8 · q 17 · ftm 3 · rp 9 · note | 9 |
| integration-as-inverse (H) | `.../integration-as-inverse/` | we 3 · dx 8 · q 17 · ftm 3 · rp 9 · note | 10 |
| definite-integrals (L) | `.../definite-integrals/` | we 1 · dx 6 · q 7 · ftm 1 · rp 5 · note | 4 |

## Follow-up pass (2026-09-20)

1. **Marker option key.** `check-marking.mts` passed `stem:` where `MarkOptions` takes `prompt:`.
   Fixed (lines 102 and 119). Re-run: 282 probes, no findings — none of the four topics has an
   accuracy-instruction stem, so the inert key had hidden nothing, but the probe is now live for
   the `dp` tolerances in definite-integrals.
2. **Teaching runs.** Five sections ran 124–174 words. A gate now sits at the figure between the
   two paragraphs of each: `g1a` and `g5a` (curve sketching), `g7a` (optimisation), `g2a` and
   `g5a` (integration). No teaching was cut. Longest run is now 120 (integration), 113, 116, 107.
3. **Closing panels.** Rewritten as pointer panels under template v2 item 6: heading, one
   paragraph of 53–67 words, then the prompts; 56–70 words in the panel, no gate, no spec callout,
   no examiner callout. The 12 examiner callouts that stood in those panels are gone; every
   finding they carried is now a trap in `bundle.note.sheet.traps` (10, 13, 12 and 9 traps).
   One `examiner` callout remains in the integration teaching body, beside the constant it is
   about, which is the one the template allows. The three `notonspec` callouts that sat in the
   panels moved into the teaching section they limit.
4. **Note verification logs** now derive their gate and figure counts from the note array instead
   of naming them, and their `examiner-alignment` detail records where each finding lives.

## lesson-v2 pass (2026-09-20 afternoon)

`node scripts/qa/lesson-v2.mjs --unit fm1` reported one breach on each of my four notes: the
recap was a `callout` of kind `mustknow` titled "You can now", and the checker wants an `h`
block reading "You can now" followed by a `p` of three to five lines. `patch-recap.mjs` rewrote
all four in the generators; the lines themselves are unchanged. **Notes only: all four
`bundle.json` files are byte-identical before and after**, asserted by
`answer-specs.mjs check` against `answer-specs.snapshot.json` (25 / 32 / 22 / 10 answer specs,
and the whole bundle hash as well). lesson-v2 now reports **0 breaches on my four**; its trap
warnings are another pass's work and were left alone.

## Pre-read pass (2026-09-20 afternoon) — every finding fixed

| ref | fix |
| --- | --- |
| CS-1, CS-2, OP-3 | a "state the nature" group now tests the sign word **and** rejects the opposite noun, and takes `> 0` / `< 0` as sign spellings. Reversal fixtures in `check-marking.mts`. |
| CS-3 | the show-that regex became `^\s*(y\s*=\s*)?(x\^?3\|x³)[^\n]{0,45}$`: it fires on the copy-down and is quiet on a real derivation. |
| CS-4 | `fm.sketch.second-turning-point-dropped` on q.0008 pays 2, not 3 (the scheme's W1 wants both roots). |
| CS-5 | new `fm.sketch.repeated-root-counted-twice` keeps the method mark for `(2, 0), (2, 0), (8, 0)`. |
| OP-1 | q.0015 now carries `pensDiagram`, drawn from the stem's own 36 m: two pens, a divider, ends and divider `x`, far side `y`. |
| OP-2 | `wallDiagramVars`, `plotDiagramVars` and a variable-labelled `riverDiagram` replace the solved copies on every question and worked-example figure; the note keeps the solved ones. |
| OP-4, OP-5, OP-6 | the paraphrase spellings the peer verified were added to the key-word groups. |
| OP-7 | new `fm.optim.unit-omitted` on the three two-mark unit parts. Encoded as a **text** pattern `^\s*<value>(\.0+)?$`, not numeric: `content-lint.ts` does not look at `unitRequired`, so a numeric pattern was rejected as "the spec marks this correct" although the marker does fire it. |
| OP-8 | `ftm.…03` feedback reworded to agree with `marksEarnedAsWritten: []`. |
| II-1 | fixed in the engine, so no bundle change; both `+ C` and `+ c` are now probed on q.0001, q.0005 and q.0016(a). |
| II-2, DI-1 | `polyLatex` no longer prints a numerator of 1 beside a power, so `\frac{1x^{4}}{4}` is `\frac{x^{4}}{4}` everywhere it occurred. |

The peer's "observation, not a defect" (six parts say "showing that it is a maximum" but take a
bare number) is left as authored: that is CCEA's own wording for the part, the MW mark is in the
scheme and `requiresWorking` is true. q.0016 already shows the split pattern for comparison.

## Generators (this folder; re-runnable and deterministic)

`lib.mjs` · `topic1-curve-sketching.mjs` + `topic1-emit.mjs` · `topic2-optimisation.mjs` +
`topic2-emit.mjs` · `topic3-integration.mjs` + `topic3-emit.mjs` · `topic4-definite.mjs`
(numbers, note and emit in one file).

Checks: `check-marking.mts` (app marker over every part) · `verify-published.mjs` (re-executes
every error route against the published JSON) · `panel-check.mts` (template v2 item 6: run
lengths, first figure, panel shape and word budget, one body examiner callout, and every cited
examiner source carried by a Sheet trap) · `note-shape.mts` · `probe.mts`, `sanity.mjs`.
One-shot patchers used in the follow-up pass: `patch-note-logs.mjs`, `fix-schema-detail.mjs`.

Regenerate: `node scratchpad/fm1-batch-e/topic{1,2,3}-emit.mjs`,
`node scratchpad/fm1-batch-e/topic4-definite.mjs`, then `npx tsx pipeline/build-content.mts`.

## Checks last run, all green

```
npx tsx pipeline/build-content.mts --strict        141 bundles, 0 problems, 0 KEYWORDS, 0 answer-in-figure warnings on my four
node scripts/qa/lesson-v2.mjs --unit fm1           0 breaches on my four (trap warnings left)
node scripts/qa/gate-context.mjs                   1142 gates, 0 without a preceding visual
node scripts/qa/svg-draws.mjs                      1504 svgs, 0 defects
npx tsx scratchpad/fm1-batch-e/panel-check.mts     no findings
npx tsx scratchpad/fm1-batch-e/check-marking.mts   334 probes (48 named pre-read fixtures), no findings
node scratchpad/fm1-batch-e/verify-published.mjs   124 commonError patterns, no findings
node scratchpad/fm1-batch-e/shingle-check.mjs      31 shared 8-word sequences, all stock question stems (see below)
npx tsx scripts/keyword-soft.mts                   0 hard, 0 soft
npx tsx scripts/qa/text-parts-vs-solutions.mts     0 zero, 0 partial of 410
npm run insights:validate                          OK   (none of my ids unregistered)
```

## Two instructions added, and the M7 figure survey (2026-09-20, 21:15)

`STANDING_PHRASES` now carries the two exam instructions the corpus run turned up — "in order of
size" / "starting with the smallest" (and "starting with the largest" for symmetry) and "mark on
the diagram" / "on the diagram above" / "all the forces acting" — so they count as command
material. Every context sentence stays a breach: the seven stimulus-copy runs left in the repo are
the m8 transformation setup and the p2 refraction investigation, both question wording, neither a
law. README and the brief's phrase list updated.

### M7 figure survey (read-only; the four topics authored 2026-09-20 are their author's)

The unit splits cleanly by authoring date: thirteen topics carry verification dates of 2026-09-13,
and four carry 2026-09-20 (adding-and-multiplying-probabilities,
enlargements-with-fractional-scale-factors, product-rule-for-counting,
tree-diagrams-for-independent-events). Seven FIGURE lines, six of them in the older thirteen:

| item | what the build says | the fix |
|---|---|---|
| combined-transformations we.01 | figure prints "1 2", which its answer gives | the alt lists the object triangle's vertices, and two adjacent numbers spell an image coordinate; the alt says "the vertices the question gives" instead. The drawing is right. |
| combined-transformations we.02 | figure prints "5 2" | same alt fix |
| combined-transformations q.0012 | labels "-2" and "x = -3" overlap | the two mirror-line labels sit on the x-axis tick numbers at y = 165.3; lifted to y = 28, at the top of the grid |
| combined-transformations q.0009(main) | figure prints "the origin", which this part asks her to give | the grid labels the origin "O", which the answer names; **left for a decision** — "O" is the standard label for the origin on a printed grid, and removing it would make the diagram less readable, so this one is a false positive I did not paper over |
| inequalities-in-two-variables-and-regions we.02 | figure prints "2 2" | the alt lists the region's corners, which the worked example works out; it now says "a dot at each of its three corners". The shaded picture stays: a worked example may show its own solution. |
| quadratic-graphs-and-intersections we.03 | figure prints "0 -3" | the alt reads out the seven plotted points, two of which are the intersections asked for; it now says "the seven points of the table". The crossings and the minimum stay, since neither is an answer here. |
| enlargements-with-fractional-scale-factors we.01 | figure prints "-2 2" | **skipped**: one of the four newest topics, its author's to fix |

`fix-figures-m7.mjs` holds those edits under the same guards. M7 was being swept by the shingle
agent (ten bundles touched within two minutes), so every one is waiting on the thirty-minute rule.

### The waiting edits

`wait-and-fix.sh` runs in the background: every five minutes it runs both fixers, each of which
re-reads its bundle from disk, skips anything modified in the last thirty minutes, and re-asserts
the answer-spec and commonError-pattern hashes before writing. It stops when nothing is
outstanding. Progress is in `wait-and-fix.log`.

## Allow-list and the figure pass (2026-09-20, 21:00)

`scripts/qa/shingles.allow.json` holds standard statements of named theorems, laws and definitions,
each with the reason it qualifies; a run inside one is reported as **allowed** rather than as a
stimulus-copy breach. Seeded with the seven circle theorems as M4-GM-02 states them (the tangent
kite included) and with the inverse-square statement, which has one accepted English form. The
file's own `$note` says what may never go in it: a context sentence, a question setup or a table
of values, however often the board reuses it; an exam instruction belongs in the script's
STANDING_PHRASES instead. README and `author-topic.md` say so. Corpus after: 8 runs allowed,
all in m4/circle-theorems and m8/inverse-proportion.

Figures cleared on my four, through the generators:
- `curve-sketching` WE01 and WE02 now carry `heroPlainSvg` / `cubicPlainSvg` — the same curves with
  nothing marked, and alt and title to match; the labelled copies stay in the note.
- `integration-as-inverse` WE02 carries `pickedPlainSvg`: the curve and the given point, with a
  title that no longer reads out the answer equation.
- `optimisation` q.0015: the pens diagram is 276 px tall so the "y m, the far side" label (238) and
  the footer (266) clear each other.

M3 and M4 by script (`fix-figures-m3-m4.mjs`), which hashes every answer spec and commonError
pattern before and after and skips any bundle touched in the last 30 minutes:
- **fixed** m3/box-plots-and-comparing-distributions q.0009(b) — the plots are titled by school
  rather than by the word "sample", which part (b) asks her to reason about (85 specs, sha
  22967a564dea7890 unchanged).
- **skipped, still live** m3/straight-lines (18 min), m4/circle-theorems (11 min),
  m4/quadratic-formula-and-harder-quadratic-equations (11 min). The edits are written and waiting
  in the script; one re-run picks them up once those files settle.

## Instruction-language clause and the FM1 A/B rewording pass (2026-09-20 night)

`scripts/qa/shingles.mjs` now carries the second half of the ruling: a shared run is stock only if
it recurs in **three or more question papers AND is command material** — it overlaps a command word
from `packs/*/exam-true/command-words.json` (bare interrogatives excluded: science lists "Which" as
an alias of *Identify*, and that alone was making "a condition in which the blood glucose control
mechanism fails" count as instruction language), or one of the standing exam phrases, or it sits
inside a formula-sheet line. Overlap, not proximity: a command word standing nearby never excuses
prose, which is what makes the reused stimulus sentences breaches. Anything else that recurs is
`stimulus-copy`, a breach. README and both briefs say so.

Whole corpus after the clause: 626 shared, 50 stock, **576 breaches** — 267 scheme-or-report,
267 paper-copy, 42 stimulus-copy. My four then had 5 stimulus-copy runs left (the windows of
"the coordinates of the points where the curve" that fall past the command word); reworded to
"each point where the curve meets the $x$-axis" and now **1 shared run, stock, 0 breaches**.

FM1 batches A and B (the eight topics with no generator) were reworded by
`scratchpad/fm1-batch-e/reword-ab.mjs`, which parses each JSON, swaps exact strings and four
patterns, writes back, and hashes every answer spec and commonError pattern before and after —
they must match byte for byte, and they do. 42 string replacements closed all 34 breaches:

| topic | breaches closed | what moved |
|---|---|---|
| completing-square-minimum-point | 19 | "coordinates of the minimum turning point of the curve" → "the minimum turning point on the curve …, giving your answer as coordinates"; "the minimum value of f(x) and the value of x for which it occurs" → "the least value of f(x) and the x at which it occurs"; the Sheet's two quoted paper wordings described instead of quoted; the Teacher-Guidance sentence paraphrased |
| algebraic-fractions-add-subtract | 10 | the displayed difference (token-identical with a mark scheme) rewritten as "$P = …$ and $Q = …$. Simplify fully $(P - Q) × …$", which leaves the algebra untouched; "as a single fraction in its simplest form" → "as one fraction …"; "Write down an expression, in terms of x, for the total time" → "Write down, in terms of x, the total time"; a worked-solution line broken with "minus" (and a stray "= 8x = 8x" tidied) |
| algebraic-fractions-simplify | 3 | an examiner callout that tracked the report's own sentence, rewritten in our words |
| expand-three-brackets | 1 | "Expand and simplify the expression" → "Expand and simplify" |
| algebraic-fractions-multiply-divide | 1 | a worked-solution product split with "multiplied by"; "as a single fraction in its simplest form" → "as one fraction …" |
| completing-the-square, completing-square-solve-surd, quadratic-inequalities | 0 | already clean |

All eight now report **1 shared run, stock, 0 breaches**.

## Shingle ruling (2026-09-20 evening) — implemented, and my four are clean

The coordinator's ruling is now a repo script, `node scripts/qa/shingles.mjs`: a shared 8-word run
is allowed only when it recurs in **three or more different CCEA question papers** (stock
instruction language); a run from one or two papers is a copy and a breach; a run shared with any
mark scheme or Chief Examiner report is a breach whatever else it does. `--unit`, `--topic`,
`--json`; exit 1 on any breach; nothing from the corpus is printed but the shared run itself.
The ruling is written into `author-topic.md` non-negotiable 1, both briefs' finish lists and
`docs/dev/README.md`.

Under it my four had 16 breaches (all paper-copy, none from a scheme or report). Reworded through
the generators until the script reports **0 breaches and 7 allowed stock sequences**:

- "A curve is defined by the equation $y = …$" → "A curve has the equation $y = …$"
  (the stock run is the opener; the breaching run was the window crossing into the equation)
- "Write down the coordinates of the points where …" → "…of each point where …"
- "…the point where the curve meets the $y$-axis" → "…the point where this curve meets the $y$-axis"
- "Using calculus, find the coordinates of the turning point(s) of the curve" → "…of each turning point on the curve"
- "Show clearly why this turning point is a maximum" → "Show, from the sign of $\frac{d^{2}y}{dx^{2}}$, that …"
- "Using calculus, find the value of $x$ that …" → "… which …"
- "Find an expression for $y$, given that …" → "Find $y$ in terms of $x$, given that …"
- "Write down an expression for $y$ in terms of $x$" → "Write down $y$ in terms of $x$"

Two of those rewordings had to be made twice: "at which the curve meets" collided with one paper,
and "Use the second derivative to show that the …" collided with a **mark scheme**, which is the
kind of hit the ruling exists for. Both were caught by re-running the script, which is the point.

## Earlier note on the collision, kept for the record

`shingle-check.mjs` compares every 8-word sequence of my learner-facing text (18 930 of them)
against 104 186 from the 61 corpus files. It finds **31 shared sequences, every one from a
question paper and none from any mark scheme or Chief Examiner report**. Collapsing the sliding
windows, they are seven stock CCEA question formulas: "A curve is defined by the equation y = …",
"Find / Write down the coordinates of the point(s) where the curve meets the x-axis / y-axis",
"Using calculus, find the coordinates of the turning point(s) of the curve", "Show clearly why
this turning point is a …", "Find an expression for y, given that y = … when x = …", "an
expression for y in terms of x" and "Using calculus, find the value of x that …".

The brief asks for both "no 8-word sequence in common with a source" and "CCEA layout and
language … command words", and here those collide: rewriting these stems would make the practice
less like the paper. Running the same script over the neighbouring published bundles shows the
same seven formulas in batch D's `gradient-at-a-point` and batch F's `area-under-curve`, so this
is the unit's norm rather than something peculiar to batch E. Left as authored, flagged for a
ruling; the script is in this folder so a decision can be enforced across the unit in one pass.

## Hashes (sha256, first 16 · bytes)

```
94443edb74ce87da  309062  curve-sketching-quadratic-cubic/bundle.json
2fd97d509d7f1820   47105  curve-sketching-quadratic-cubic/note.blocks.json
f2dc798a4b422243  427832  optimisation/bundle.json
4d2cb9f14d66989a   34188  optimisation/note.blocks.json
8dc1843a72f089e6  407753  integration-as-inverse/bundle.json
41b38b5ae5810f8c   32515  integration-as-inverse/note.blocks.json
90435a53c31ad368  197326  definite-integrals/bundle.json
4354964d6da01703   17359  definite-integrals/note.blocks.json
9031585099ee21fb          packs/further-maths/insights/misconceptions.json
ed119d1fee0ead0d          scripts/qa/shingles.mjs

FM1 batches A and B after the rewording pass:
bfbb6ec4d1dc490e  161899  algebraic-fractions-simplify/bundle.json
e09ad0747600d37c   10872  algebraic-fractions-simplify/note.blocks.json
ad2d0a11185850e7  250557  algebraic-fractions-multiply-divide/bundle.json
8ce6103277a09754   12302  algebraic-fractions-multiply-divide/note.blocks.json
a0637884138e83c6  305230  algebraic-fractions-add-subtract/bundle.json
13871234d710c098   16169  algebraic-fractions-add-subtract/note.blocks.json
197eac6ff17c2777  123183  expand-three-brackets/bundle.json
3ada16c50885137f   11309  expand-three-brackets/note.blocks.json
377ca727470393fb  142330  completing-the-square/bundle.json            (untouched)
23e0273b592b6a10   10242  completing-the-square/note.blocks.json       (untouched)
52f9d65501aa193d  231170  completing-square-minimum-point/bundle.json
bab0ae9b2c17c479   15912  completing-square-minimum-point/note.blocks.json
b9c5501d9c2af06a  157468  completing-square-solve-surd/bundle.json     (untouched)
620a4b80ad0de2bf   10973  completing-square-solve-surd/note.blocks.json (untouched)
3e6289d0eb14096d  266063  quadratic-inequalities/bundle.json           (untouched)
0f7653e80ac54e25   19096  quadratic-inequalities/note.blocks.json      (untouched)
```

## Repo-wide shingle picture (for whoever schedules the clean-up)

`node scripts/qa/shingles.mjs` over everything: 682 876 of our sequences against 1 636 599 from
895 corpus files (454 papers, 419 mark schemes, 22 reports), in under three seconds. 660 shared,
99 stock, **561 breaches**: 271 scheme-or-report and 290 paper-copy. Per unit: science/b1 192,
further-maths/fm1 59, maths/m7 50, science/c2 49, science/p2 47, maths/m3 43, maths/m4 37,
maths/m8 33, science/b2 29, further-maths/fm2 17, further-maths/fm3 5. **None on my four.**
236 of the 271 scheme-or-report runs appear in no question paper at all, so they are genuinely
scheme or report text rather than stems reprinted in a scheme.

One honest wrinkle in the mechanical test: it admits recurring *stimulus* text as well as
instruction language, because CCEA reuses contexts across papers. "diabetes is a condition in
which the blood glucose control mechanism fails" recurs in 11 papers and so passes as stock,
though it is a context sentence rather than a command. If that matters, the test would need a
second clause (a stock run must also be command-word material), and that is a judgement I did not
make on my own authority.

## One thing for a reviewer to rule on

Curve sketching is an S bundle and now carries 9 gates; `author-unit-batch.md` suggests
"≤ 8 gates" for S, while template v2 item 3 asks for one gate per section and ≤ 120 words
between them. The gate seating was the instruction, so the section count won. If the cap is
the binding rule, drop `g1a` and let section 1 run at 132 words.

## Next step (none required)

Nothing outstanding. Registry note for the batch-F author: `fm.int.limits-reversed`,
`fm.int.power-not-raised` and `fm.int.coefficient-not-divided` now carry FM1-INT-02/03 in
their `statements` as well as FM1-INT-04, because batch E reuses them rather than duplicating
the ideas under new ids.
