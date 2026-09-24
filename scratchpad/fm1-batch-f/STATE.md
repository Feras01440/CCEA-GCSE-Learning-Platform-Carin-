# FM1 batch F — state at 15:57, 20 Sep 2026 (batch F COMPLETE)

> **23 Sep 19:56, the lead's jobs 3-5 (FM1 finisher; full record in scratchpad/fm1-batch-g/STATE.md).** lib.mjs gained
> `draftLogs()` (SHIP_AT 18:20Z), spread into area-under-curve, indicial-equations, log-log-graphs and
> logarithms-from-indices, so their diagnostics, mistakes and prompts now ship; the ftm log names the right fixes the
> fix box does not yet read, from scratchpad/fm1-batch-g/engine-fix-gaps-0923.json. Read-through fixes: indicial post
> d1 c retag, area post d4 b/c -> fm.int.limits-not-from-the-question (new registry id), log-log and indicial ftm.01
> corrections re-laid. laws-of-logarithms: WE01/WE03 rebalanced to 3 marks (q0005/q0010 schemes), WE03 twin now
> log 4.5 = 2p + q - 1, and q0021, the tail-only item (FM1-LOG-01's index form). verify-published.mjs gained
> "laws-tail-routes"; check-marking.mts gained TEXT_PROBES_BY_PART. All four other generators and laws re-run
> 18:55; outputs and hashes in batch G's STATE.

> **23 Sep 15:05, depth-pass pilot:** `laws-of-logarithms.mjs` now builds the H5 depth-standard note (14 roled
> sections, g1-g15, phone-native figures; the eight text-card SVGs are gone) and adds we 04-05, q 0017-0020, ftm 04,
> rp 11-12 and a mixed set; frozen-surface 43 items, 0 differences. It also writes verification logs for the
> diagnostics, the find-the-mistake items and the prompts, which this batch's generators never logged, so the build
> had kept all of them as drafts (content:check showed "dx 0 · ftm 0 · rp 0"). The same gap stands in
> area-under-curve, indicial-equations, log-log-graphs and logarithms-from-indices (and batch G's four matrix topics):
> reported to the lead, not touched. Output now: bundle 77c372b89b1f2291 304644 B, note b85d0ae6f1284554 36971 B.
> `verify-published.mjs` gained "laws-depth-routes" (113 checks, 0 findings). Pre-pass copy of the generator:
> scratchpad/fm1-batch-g/depth-pilot/bak-laws-of-logarithms/laws-of-logarithms.mjs.pre-depth.

> **22 Sep 23:45 (resumed agent):** the laws-of-logarithms follow-ups from fm1-g-logs-reverify.md are done (C: a
> whole-answer "both roots kept" diagnosis on q0016(c); D: "two of three" gone from the note callout and the 2024
> insight card) plus report-faithfulness rewording; bundle e0b19dc76a568e70 199039 B, note d560c58fb6a0e8ee 25869 B.
> Engine items A and B remain open (src/). `check-marking.mts` gained TEXT_PROBES_BY_TAG; `verify-published.mjs`
> gained area-under-curve d3's routes; new `probe-logs-0922.mts`. The live record is scratchpad/fm1-batch-g/STATE.md.

Author: FM1 batch F (area-under-curve, logarithms-from-indices, laws-of-logarithms, log-log-graphs,
indicial-equations).

**Resume rule: re-inspect disk first.** `ls packs/further-maths/content/fm1/`, then
`node scratchpad/fm1-batch-f/verify-published.mjs` and `npx tsx scratchpad/fm1-batch-f/check-marking.mts`.

## Complete and published (5 of 5)

| topic | bundle.json | note.blocks.json | counts |
|---|---|---|---|
| `logarithms-from-indices` (L) | `d7067ae02e6c8655`, 86 683 B | `a3a0994c93d439a3`, 15 254 B | we 1 · dx 7 · q 7 · ftm 0 · rp 5 · gates 5 |
| `area-under-curve` (S) | `1fd672dcb0fce17e`, 281 545 B | `6c866a9db908df0e`, 65 609 B | we 2 · dx 8 · q 12 · ftm 1 · rp 7 · gates 6 |
| `log-log-graphs` (S) | `7da3f7f2e873b235`, 154 230 B | `7e495791b9042c67`, 30 256 B | we 1 · dx 8 · q 10 · ftm 1 · rp 7 · gates 7 |
| `indicial-equations` (L) | `6439df193cdfdd3a`, 92 008 B | `a651150fa92e760b`, 18 464 B | we 1 · dx 7 · q 7 · ftm 1 · rp 6 · gates 5 |
| `laws-of-logarithms` (H) | `a8949616be663029`, 197 736 B | `c7048f80f8d08f74`, 25 773 B | we 3 · dx 11 · q 16 · ftm 3 · rp 10 · gates 8 |

All five publish green, pass the marker self-check and the route verifier, and report **0 breaches**
from `node scripts/qa/lesson-v2.mjs --unit fm1`.

**All five notes were re-emitted at 15:55 for the lesson-v2 recap shape** (notes only; every
`bundle.json` asserted byte-identical across the re-emit, and the assertion printed). The recap is no
longer a `mustknow` callout: the checker wants `{ type: "h", text: "You can now" }` followed by one `p`
of **three to five** lines, before the "In the exam" heading. `logarithms-from-indices` and
`indicial-equations` also gained the `why` callout the checker requires in the teaching body, and
`log-log-graphs` had its hook trimmed so the first visual arrives before word 80.

`log-log-graphs` used the dossier at `data/enrichment/further-maths/log-log-graphs.md`: the
make-it-straight framing, the three-line derivation set beside y = mx + c, the gradient triangle on two
far-apart points, the un-logging as its own numbered step, the 3 d.p. rule, the range check and the
context-rounding part are all recreated in our own words with our own figures. Its two contexts (a weir
and a workshop pricing tabletops) are new. The dossier's mistake gallery became a two-panel note figure
and the find-the-mistake item.

## Not written

Nothing. Batch F is finished; the author has moved to FM1 batch G (matrices),
`scratchpad/fm1-batch-g/STATE.md`.

## THE LOG-FORM PROBE (`probe-log-forms.mts`) — what the two new forms actually do

Run before `laws-of-logarithms` was encoded. Both work as announced, with **two restrictions that
decide the encoding**:

| spec | typed answer | result |
|---|---|---|
| `form: "single-log"`, latex `\log\frac{ac}{b^4}` | `\log\frac{ac}{b^4}`, `log(ac/b^4)`, `log(ca/b^4)` | correct |
| | `\log a - 4\log b + \log c`, `\log(ac) - \log(b^4)` | *"Correct, but the logarithms still need combining into one"* |
| | `\log\frac{ac}{b^{3}}` | not equivalent |
| `form: "single-log"`, latex `\log 8x^{3}` | `3\log 2x` | *"a number in front of the log belongs inside it as a power"* |
| | `\log 2x^3` | not equivalent — so the coefficient-not-raised distractor still fires |
| **`form: "single-log"` on a spec with NO logarithm** (`y = x^{3/2}`) | the correct answer itself | **rejected**: "Correct value, but the question asks for it as a single logarithm" |
| `form: "expanded-logs"`, latex `2\log a + 3\log b` | either order | correct |
| | `\log(a^2 b^3)`, `\log a^2 + \log b^3` | *"expand it: no product, quotient or power should be left inside a logarithm"* |
| **`form: "expanded-logs"` on a spec with NO logarithm** (`1 + 2p + q`) | the correct answer itself | **rejected**: "Correct value, but the question asks for it in terms of separate logarithms" |
| `form: "expanded-logs"`, leading minus | `-\log a + \log b` and `\log b - \log a` | both correct |

**Rule adopted:** `single-log` only where the answer *is* one logarithm; `expanded-logs` only where it
is a sum of separate logarithms; **no form at all** where the answer holds no logarithm (the
in-terms-of-p-and-q parts, and `y = x^{3/2}`). Getting that wrong marks a correct learner wrong.

## Tools in this folder (all reusable)

- `lib.mjs` — exact rationals, printable numbers, SVG builders with `assertSvg`, `lintTree`
  (`${` leaks, NaN/null/undefined, unpaired `$`, prose inside a maths segment, `!`, the banned verdict
  word), `shingleClash`/`corpusFiles`, verification-log builders, `writeJson` returning sha256 + bytes.
- `polylib.mjs` — exact polynomial integration (`integrate`, `at`, `definite`, `tex`, `bracketTex`),
  root finding, and `regionSvg` (curve + shaded region between the curve and the x-axis, drawn from the
  polynomial itself; takes several shade windows and a `splitAt` dashed line).
- `check-marking.mts` — marker self-check over all five slugs. Patched vs the batch-E copy: passes
  `prompt:` (not `stem:`) to `markAnswer`; probes a dp-tolerance spec only in the instructed written
  form; probes a decimal-refusing spec as `n/d` and not as a decimal or `\frac{}{}` (the numeric field
  is a plain input, not a maths editor).
- `verify-published.mjs` — routes re-written independently of the generators and re-executed against
  the published JSON, plus a `\frac{a}{b}`-aware distractor reader that also accepts a route value's
  rounded display. Extend `ROUTES` per topic.
- `check-lattice.mts` — every `points-line` / `curve` part checked against the app's own `plotLattice`:
  no unreachable target, and the tolerance at most half a small square on **both** axes. Run it whenever
  a graph part is authored.
- `probe-log-forms.mts` — the single-log / expanded-logs probe above. Re-run it if the engine changes.
- `logarithms-from-indices.mjs`, `area-under-curve.mjs`, `log-log-graphs.mjs`, `indicial-equations.mjs`,
  `laws-of-logarithms.mjs`
  — the topic generators. `indicial-equations.mjs` carries a general `solve()` for
  `L^(m x + c) = R^(p x + q)` that checks every answer by substituting it back into both sides at full
  precision; reuse it if another topic needs an indicial equation.

## Findings the next session must not rediscover

1. **The algebra marker treats logarithm expressions as fully equivalent** (`probe-algebra.mts`):
   `3\log 2x` marks correct against `\log 8x^3`, `\log(ac) - \log(b^4)` against `\log\frac{ac}{b^4}`.
   That is what the peer's two new `form` values are for. Distractors are unaffected.
2. **`markAnswer` takes `prompt`, not `stem`** — the batch-E check-marking copy passes `stem`, so its
   accuracy-instruction checks are inert.
3. **A commonError whose route lands on the same magnitude as the answer is dead.** On
   `q.fm.u1.area-under-curve.0011(b)` the reversed-subtraction route gives +9/2, which *is* the area, so
   no pattern is authored for it (build-content rejects it as unfireable). Check every reversed-limit
   route against the area before authoring it.
4. **Recurring-decimal areas need `acceptForms: ["fraction"]` and an exact-fraction instruction in the
   stem**, or a 2 d.p. answer falls outside an absolute tolerance and a correct learner is marked wrong.
5. **Coordinate key words must not meet `\left(`/`\right)`.** Write the worked solution's coordinates
   with plain parentheses, or `text-parts-vs-solutions` under-awards the part's own solution.
6. **Note section limits are tight.** ≤120 words between gates and a closing panel paragraph ≤80 words;
   measure with the word-run script in the session log before publishing (area-under-curve needed three
   passes). Current runs: logs-from-indices 59/88/66/58/118/117; area 78/115/83/86/119/120/147 (the last
   run is the recap callout plus the 79-word panel).
7. **`plotLattice` builds both axes from `min(0, …)`** (`src/lib/marking/plot.ts`), so the data has to be
   chosen to suit the grid, not the other way round. Settled for `log-log-graphs` by generating the table
   from `k` and `n`: k = 4, n = 1.5, x = 1, 4, 9, 16, 25 gives whole-number y values (4, 32, 108, 256,
   500) and logs that land on the lattice — x major 0.2, minor 0.04 (half 0.02); y major 0.5, minor 0.05
   (half 0.025); tolerance 0.02, inside half a small square on both axes. `check-lattice.mts` proves it.
   Second set: k = 5, n = 2, x = 2, 4, 6, 8, 10. **Do not change these numbers without re-running it.**
8. **A distractor's text is a rounded display of its route value** (0.667 for 1/1.5), so the route
   verifier compares against roundings of the route value, not just the exact one.
9. **`spellings()` in check-marking now probes `table` parts** by submitting the cells the spec expects;
   before that, table parts were silently unchecked.
9a. **A "brackets omitted" route is only defined where there is a bracket to drop.** On `4^x = 2^(x+3)`
   the generic route divided by `m - p = 0` and reached no value; the route now drops the logarithm only
   on a side whose index has a constant, which is what the reports actually describe ("2x - 1 log 3").
9b. **A same-base solution needs snapping.** `8^x = 2^(x+4)` solved through logarithms gives
   2.0000000000000004, which build-content rejects as a floating-point artefact. Round exact answers to
   1e-6 before they reach the spec, and print `Math.round(...)` in the stems and schemes.
9c. **The route verifier compares against roundings of a route value**, because a commonError under a
   two-decimal-place instruction carries the answer as the learner writes it, not at full precision.
10. **Paper patterns already read** (2018, 2019, 2022, 2023, 2024, 2025 FM1 papers and schemes):
   log-log is (i) 6 marks (table to 3 d.p., plot, labelled axes, straight line), (ii) 4 marks for the two
   constants, (iii) 2 marks for a prediction or context check; indicial equations are 4–5 marks;
   "express as a single logarithm" is 2–3 marks.
11. **Two registry entries were edited at source, not in the generated JSON**: the `fm.logs.unknown-base-divided`
   label was broadened to cover multiplying as well as dividing, and the Summer 2025 area finding's
   `wentWrong` now opens "The wrong limits…" so it passes the no-verdict-word lint.

## Next step

Batch F is done. Continue in batch G: matrix-inverse-2x2, matrix-equations,
matrix-simultaneous-equations.

## Green at this checkpoint

- `npx tsx pipeline/build-content.mts` → 133 bundles, 0 problems
- `npm run content:check` → 0 problems, 0 KEYWORDS
- `npx tsx scripts/keyword-soft.mts` → 0 hard, 0 soft
- `npx tsx scripts/qa/text-parts-vs-solutions.mts` → 0 zero, 0 partial of 391
- `node scripts/qa/svg-draws.mjs` → 1400 SVGs, 0 files with defects
- `node scripts/qa/gate-context.mjs` → exit 0
- `node scripts/qa/lesson-v2.mjs --unit fm1` → **0 breaches on all five batch-F notes**
- `npm run insights:build && npm run insights:validate` → OK
- `npm run insights:unregistered` → 0 further-maths ids
- `npx tsx scratchpad/fm1-batch-f/check-marking.mts` → 187 probes, 0 findings
- `node scratchpad/fm1-batch-f/verify-published.mjs` → 110 route checks, 0 findings
- `npx tsx scratchpad/fm1-batch-f/check-lattice.mts` → 1 graph part, 0 findings
