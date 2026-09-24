# Pre-read: FM2 displacement/time graphs + average speed and velocity

Reviewer aid, not a change. Nothing under `packs/` or `src/` was edited.

- Bundles read in full via the digests: `docs/dev/qa/pre-read/fm2-dtg-digest.txt` (306 lines), `docs/dev/qa/pre-read/fm2-asv-digest.txt` (293 lines), plus the raw `bundle.json` and `note.blocks.json` of each.
- Every number was recomputed in node: 194 checks (gradients, average speeds, unit conversions, stage times, every worked-example twin, every `commonError` value against the error it describes) — **0 failures**.
- Marking was exercised against the real engines by importing `markAnswer` / `matchesCommonError` from `src/components/items/mark.ts`, `plotLattice` from `src/lib/marking/plot.ts`.

Findings: **4 in displacement-time-graphs, 3 in average-speed-and-velocity**, plus 3 advisory notes. Clean areas are listed at the end.

---

## A. packs/further-maths/content/fm2/displacement-time-graphs/bundle.json

### D1 — note paragraph illustrates the opposite of the rule it states
**Where:** `note.blocks.json` index 9 (the `p` block under heading "2. Gradient is velocity"), second paragraph.

**Current text (exact):**
> Use the section's own start time, never the clock reading at its end: the robot's first section runs for 20 s, not 60.

**Why it is wrong:** the robot's journey in the accompanying figure is `(0, 0) → (20, 30) → (35, 30) → (60, -20)`. The **first** section runs from t = 0 to t = 20, so the clock reading at its end *is* 20 s — the sentence offers the correct value as the thing to avoid, and "not 60" points at a number that has nothing to do with that section. The section where the two differ is the **last** one: the clock reads 60 s at its end but it lasted only 60 − 35 = 25 s. As written the example contradicts the rule, and it also undercuts the topic's headline misconception (`fm.kin.stage-time-not-used`, which every commonError in the bundle cites).

**Fix — full replacement sentence:**
> Use the section's own start time, never the clock reading at its end: the robot's last section lasts $60 - 35 = 25$ s, not 60.

**Verified:** `60 - 35 = 25` and `(-20 - 30) / 25 = -2`, which is exactly the "-2 m/s" label already drawn on the figure and the "run 25 s" / "rise -50 m" dashed guides recovered from the SVG. The figure needs no change.

---

### D2 — three stems give bare coordinates but the answer is specified in m/s
**Where:** `q.fm.u2.displacement-time-graphs.0002` part `main`; `q.fm.u2.displacement-time-graphs.0003` part `main`; `we.fm.u2.displacement-time-graphs.01` `twin`.

**Current text (exact):**
- 0002: `"A displacement/time graph is a straight line from $(0, 0)$ to $(8, 20)$. Calculate the velocity of the body."` — answer `{"kind":"numeric","value":2.5,"unit":"m/s",…}`
- 0003: `"A displacement/time graph is a straight line from $(10, 36)$ to $(25, 6)$. Calculate the velocity of the body."` — answer `value:-2, unit:"m/s"`
- we.01 twin: `"A body moves in a straight line. Its displacement/time graph is a single straight line through $(8, 50)$ and $(26, -4)$. Calculate the velocity of the body."` — answer `value:-3, unit:"m/s"`

**Why it is wrong:** no axis units are stated anywhere in these three stems, yet each answer spec asserts `m/s`, the scheme prints m/s, and the feedback card shows "2.5 m/s". 0003's own commonError feedback goes further and asserts seconds the stem never gave: *"The run is the time the section lasted, 25 - 10 = 15 s, not the clock reading of 25 s."* The bundle already knows the right pattern — its own pre-diagnostic `dx.fm.u2.displacement-time-graphs.pre` item 02 reads `"…a straight line from $(0, 0)$ to $(50, 400)$, **with distance in metres and time in seconds**. What is the walking speed?"` — and every FM2 paper in `docs/sources/papers/further-maths` states the units on the axes.

**Fix — full replacement stems:**
- 0002: `A displacement/time graph is a straight line from $(0, 0)$ to $(8, 20)$, with displacement in metres and time in seconds. Calculate the velocity of the body.`
- 0003: `A displacement/time graph is a straight line from $(10, 36)$ to $(25, 6)$, with displacement in metres and time in seconds. Calculate the velocity of the body.`
- we.01 twin: `A body moves in a straight line. Its displacement/time graph is a single straight line through $(8, 50)$ and $(26, -4)$, with displacement in metres and time in seconds. Calculate the velocity of the body.`

**Verified:** re-marked all three items with old and new stems side by side, 17 probes in total — **0 differences** in mark, verdict or feedback. `instructsAccuracy` stays false for all three (correctly, since no accuracy is demanded), the answers still mark 1/1, 2/2 and 1/1, and both 0003 commonErrors (2 and −1.2) still fire at 1 mark each. The edit is purely a wording repair.

---

### D3 — four distractors carry a misconception id that does not describe their error
Tags feed the misconception ledger and schedule remediation, so a wrong tag sends the learner to the wrong skill. The registry labels are from `packs/further-maths/insights/misconceptions.json`.

| Where | Distractor + its own feedback | Current tag | Why it is wrong | Fix |
|---|---|---|---|---|
| `dx.…pre` item `01` option `d` | `"0.33"` — *"The fraction is upside down: run over rise instead of rise over run."* | `fm.kin.gradient-and-area-swapped` ("Gives the gradient where the area was asked for, or the area where the gradient was asked for, on a motion graph") | no area is involved; an upside-down gradient is the second clause of a different entry | `"misconception": "fm.kin.gradient-not-taken-from-graph"` ("Reads a value off a motion graph where its gradient was wanted, **or turns the gradient upside down (run over rise)**") |
| `dx.…pre` item `02` option `b` | `"0.125 m/s"` — *"That divides the time by the distance."* | `fm.kin.gradient-and-area-swapped` | same: this is run over rise, not gradient-vs-area | `"misconception": "fm.kin.gradient-not-taken-from-graph"` |
| `dx.…post` item `05` option `c` | `"25 m"` — *"The size is right … the displacement is negative."* | `fm.kin.negative-gradient-as-slowing` ("Reads a downward-sloping straight section of a displacement-time graph as a body slowing down") | the item is prose ("40 m forwards then 65 m backwards"); there is no graph, no slope and no slowing — the error is a dropped sign on a displacement | `"misconception": "fm.kin.speed-vs-velocity"` (label covers "**or confuses distance and displacement**") |
| `dx.…post` item `02` option `b` | `"The body is moving at a steady velocity for 15 seconds"` — *"A steady velocity would be a sloping straight line."* | `fm.kin.gradient-and-area-swapped` | weakest of the four: no area is read; the learner misreads a flat section's gradient | `"misconception": "fm.kin.gradient-not-taken-from-graph"` |

**Verified:** all four replacement ids exist in the registry (`fm.kin.*`, 170 entries checked); `misconception` is `MisconceptionId.optional()` on `McqOption` (`src/lib/content/schema.ts:389`), and `checkOptions` imposes no constraint on it, so retagging cannot break validation.

---

### D4 — the only text part under-earns correct paraphrases and pays full marks for reversed answers
**Where:** `q.fm.u2.displacement-time-graphs.0001` part `main` (1 mark).
Stem: *"On a displacement/time graph, the gradient of a section gives one particular quantity. Write down that quantity."*

**Current spec (exact):**
```json
{"kind":"text","accepted":["the velocity"],"keyWords":[{"any":["velocity"],"marks":1}],"listingRule":false}
```

**What `markAnswer` actually does** (run against `src/components/items/mark.ts`; 11 of 26 probes are marked wrongly):

Legitimate answers scoring **0/1** — the bundle's own retrieval prompts give two of these as the model answer (`rp.…01`: *"The velocity, with its sign: change in displacement divided by the time taken"*; `rp.…07`: *"Velocity = change in displacement divided by the time taken"*):
- `"the rate of change of displacement"` → 0/1
- `"change in displacement divided by time"` → 0/1
- `"how fast the displacement is changing, with its direction"` → 0/1
- `"velocities"` → 0/1 (the plural is not an inflection the engine reaches: `phraseIn` strips only `es|s`, and `INFLECTIONS` has no `y→ies` rule)

Wrong answers scoring **1/1** (groups are presence-based):
- `"not the velocity"`, `"the gradient is not a velocity"`, `"anything but the velocity"`, `"speed, not velocity"`, `"the acceleration, not the velocity"`, `"it does not give the velocity, it gives the speed"`, `"velocity or acceleration"`, `"velocity or speed or acceleration"`

**Fix — full replacement `answer`:**
```json
{
  "kind": "text",
  "accepted": ["the velocity"],
  "keyWords": [
    {
      "any": ["velocity", "velocities", "rate of change of displacement", "change in displacement divided by"],
      "reject": ["not the velocity", "not a velocity", "not velocity", "not give the velocity", "but the velocity"],
      "marks": 1
    }
  ],
  "listingRule": false
}
```

**Verified:** ran 26 probes (12 that must score, 14 that must not) against the current spec and the replacement — problems fall from **11 to 2**, and nothing that should score loses a mark (`"the velocity"`, `"velocity"`, `"the velocity of the body"`, `"the average velocity"`, `"the velocity (m/s)"`, `"the velocity, not the speed"` and the part's own `workedSolution` all still score 1/1; `"the speed"`, `"the acceleration"`, `"the displacement"`, `"the distance travelled"`, `"the time taken"`, `"the area under the graph"` all still score 0/1).

The 2 residual problems are the hedged lists `"velocity or acceleration"` and `"velocity or speed or acceleration"`. **Do not fix these with `listingRule: true`** — I tested it: `countListedItems` splits on `/`, so `"the velocity (m/s)"` becomes two segments and is penalised to 0/1, as is `"velocity in m/s"` and `"the velocity, not the speed"`. The reject list is the safe remedy; the hedging gap stays.

---

## B. packs/further-maths/content/fm2/average-speed-and-velocity/bundle.json

### A1 — accuracy-shaped tolerance on an exact answer whose stem instructs no accuracy
**Where:** `q.fm.u2.average-speed-and-velocity.0012` part `d` (2 marks).
Stem: *"Calculate the speed of the cable car on the journey from P to Q in km/h.\n\nAnswer ________ km/h"*

**Current:** `"tolerance": {"type":"dp","places":2}` on `"value": 28.8`.

**Why it is wrong:** 28.8 is exact (8 × 3.6, recomputed three ways), and the stem carries no accuracy instruction — `instructsAccuracy(stem)` returns **false** (verified), so `toNumericSpec` never sets `dp` and the `dp` tolerance silently degrades to a closeness test. It is the only accuracy-shaped tolerance in either bundle: the other 33 numeric specs across the two bundles all use `absolute 0.005` or an explicit `range`, including the parallel conversion item `q.…0007` (`43.2 km/h`, `absolute 0.005`). Encoding an exact answer as though the question demanded 2 d.p. misdescribes the item.

**Fix — full replacement value:**
```json
"tolerance": {"type": "absolute", "value": 0.005}
```

**Honest caveat for the reviewer:** this is an encoding defect, not a live marking bug. I probed both tolerances with 10 responses (`28.8`, `28.80`, `28.81`, `28.799`, `28.804`, `28.8 km/h`, `28`, `29`, `28.75`, `28.85`) and they award identically in every case. Fix it for consistency and for the day someone adds an accuracy instruction to the stem, not because a learner is being mismarked today.

---

### A2 — eight distractors carry a misconception id that does not describe their error
Six of them tag a **metric-conversion** slip with a kinematics misconception. There is no conversion misconception in the further-maths registry (all 170 ids checked), so the fix is to **drop the field**: `misconception` is optional on `McqOption` (`src/lib/content/schema.ts:389`) and 12 pre-diagnostic distractors elsewhere in `packs/` already omit it.

`dx.fm.u2.average-speed-and-velocity.pre` item `01` ("how many metres are there in 1.5 km?"):
- option `b` `"150"` — *"That multiplies by 100."* — tagged `fm.kin.stage-time-not-used` ("Divides by the clock reading at the end of a stage…") → **delete the `misconception` field**
- option `c` `"15000"` — *"That is ten times too many."* — tagged `fm.kin.stage-time-not-used` → **delete**
- option `d` `"0.0015"` — *"That divides by 1000."* — tagged `fm.kin.gradient-and-area-swapped` → **delete**

`dx.…pre` item `02` ("how many seconds are there in 5 minutes?"):
- option `b` `"500"` — tagged `fm.kin.stage-time-not-used` → **delete**
- option `c` `"0.083"` — *"5 minutes written as a fraction of an hour"* — tagged `fm.kin.gradient-and-area-swapped` → **delete**
- option `d` `"60"` — *"That is one minute."* — tagged `fm.kin.stage-time-not-used` → **delete**

Two more are miscategorised rather than uncategorisable:
- `dx.…pre` item `03` option `b` `"0.2 m/s"` — *"The fraction is upside down. Speed is distance divided by time."* — currently `fm.kin.gradient-and-area-swapped`; an inverted rate is the second clause of `fm.kin.gradient-not-taken-from-graph`. Fix: `"misconception": "fm.kin.gradient-not-taken-from-graph"`.
- `dx.…post` item `04` option `d` `"None of them, because time cannot be negative"` — currently `fm.kin.negative-gradient-as-slowing`, which is specifically about reading a downward slope as slowing; this item asks which quantity carries a sign. Fix: `"misconception": "fm.kin.speed-vs-velocity"`.
- `q.fm.u2.average-speed-and-velocity.0009` option `c` `"Distance 300 m, displacement $40$ m"` — *"The size is right. The body ended on the far side of the start, so the displacement carries a minus sign."* — currently `fm.kin.negative-gradient-as-slowing`; no graph, slope or slowing is involved, just a dropped sign on a displacement. Fix: `"misconception": "fm.kin.speed-vs-velocity"`.

---

### A3 — km/h is presented as FM2 exam content; it has never appeared on an FM2 paper
**Where:** `q.fm.u2.average-speed-and-velocity.0006` (2 marks, 36 km/h → m/s), `q.…0007` (2 marks, 12 m/s → km/h), `q.…0012` part `d` (2 marks, 8 m/s → km/h); `note.blocks.json` section "6. Units first" (blocks 24–27); `note.sheet.mustBeAbleTo[4]` = *"Change a speed between m/s and km/h"*.

**Evidence (all recomputed/counted, not recalled):**
- `"km"` occurs **0 times** across all **13** FM2 paper and mark-scheme text files under `docs/sources/papers/further-maths` (2018–2026), while `"m/s"` occurs **98 times** in the same files — so the extraction preserves slashed units and the absence is real.
- `"minute"` occurs 0 times; all 7 occurrences of `"hour"` are the paper duration line "1 hour."
- `data/spec/further-mathematics.json` has no compound-units or unit-conversion statement anywhere (searched for km/h, kilometre, compound, unit, convert). The FM2 conventions and formula sheet are in metres and seconds (`g = 10 m/s²`).
- Compound measures are a **GCSE Mathematics** statement (`data/spec/mathematics.json` statements[51], topic `speed-and-compound-measures`), reachable in FM only through spec §1.3 prior attainment.

**Why this is a finding:** the maths is correct — every conversion in these items recomputes exactly (36000/3600 = 10; 12 × 3600/1000 = 43.2; 8 × 3.6 = 28.8) — but the bundle presents an unassessed skill as exam content. `note.blocks.json` block 26 frames it as exam procedure (*"If the answer line prints m/s, every length must be in metres…"*), `mustBeAbleTo` lists it as required, and `note.notOnThisSpec` — which does carry four other exclusions — does not mention it. That is the "beyond the spec without a not-on-spec callout" case, and it conflicts with the pack's no-fluff bar.

**Fix — reviewer's choice, with the exact edits:**
1. Minimal (keeps all three items): append to `note.notOnThisSpec` the entry
   `"Converting between m/s and km/h: a GCSE Mathematics skill worth knowing, but km and km/h have never appeared on an FM2 paper (2018-2026)"`
   and change `note.sheet.mustBeAbleTo[4]` to
   `"Change kilometres into metres and minutes into seconds before dividing (km/h itself has not been examined in FM2)"`.
2. Stronger: also drop `q.…0012` part `d` (the least exam-realistic item — it re-asks part (a) in a unit the paper never uses) and reduce `q.…0012.totalMarks` from 8 to 6, leaving `(a)calculate2|(b)calculate3|(c)write-down1`.

Lower risk, listed for completeness: `q.…0003` (1.5 km, 5 minutes), `q.…0012` part `a` (1.2 km) and `we.…02` (1.8 km / 0.6 km) also use units absent from FM2 papers, but those are the plausible direction — a stem giving a length in km and demanding m/s — so I would leave them.

---

## Advisory (not defects in these bundles)

1. **The graph commonError on `q.fm.u2.displacement-time-graphs.0011` part `a` can never fire.** Its pattern is `{"kind":"graph","test":"the last segment drawn down to the time axis and stopped there"}`. `graphTestMatches` needs at least two coordinate pairs in the `test` string *and* needs `parseVertices` to read the learner's response — and `parseVertices` returns `null` on the PlotField's JSON (`{"points":[[0,0],…]}`), which I confirmed by calling it directly, so adding coordinates to the `test` does not help either (I tried both). The authored feedback citing the Summer 2024 examiners, and the `fm.kin.graph-taken-to-axis` tag, are therefore never delivered. **This is not a bundle error:** I surveyed all 48 graph-kind commonErrors in `packs/` — 19 carry coordinates (18 on `transformation` parts, 1 on a `curve` part) and the other 29 are prose-only, including all 10 on `points-line` parts, all 6 `box` and all 5 `histogram`. Only `transformation` parts submit a vertex list the matcher can read, so every non-transformation graph commonError in the pack is equally inert. It is a marker-side gap (`src/lib/marking/transformation.ts:191`), and the engine still awards the right mark: a learner who drops the last joint to `(60, 0)` scores 1/2 and is told *"The point at (60, 0) belongs at (60, −20)."* Worth a separate platform ticket, not an edit here.

2. **The DTG examiner callout for Summer 2023 FM2 Q6** (`note.blocks.json`, `kind:"examiner"`) is accurate to the source — the CER does say a false origin of ten seconds was accepted on the drawing but caused trouble later. But that question's drawing was a **velocity/time** graph (CER: *"Some good velocity-time graphs were seen"*), and the callout sits on a displacement/time page without saying so. Consider adding "on a velocity/time graph" for provenance honesty. The `fm.kin.stage-time-not-used` citations to that series are legitimate — the registry lists the same source.

3. **Rounded commonError values with a tight tolerance.** `q.…0011:b` `7.22`, `q.…0012:b` `7.16` and `7.06` are correct 2 d.p. roundings (recomputed: 3900/540 = 7.2222, mean(8, 1200/190) = 7.1579, 2400/340 = 7.0588) and `absolute 0.005` does catch both the unrounded calculator value and the 2 d.p. write-down. A learner who writes 1 d.p. (7.2, 7.1) misses the diagnosis and gets the generic engine feedback. Acceptable given CCEA's 2 d.p. default (`fm.paper.rounding-default`); noted only so the reviewer knows it was checked.

---

## Areas checked and clean

- **(b) Arithmetic — clean.** 194 node checks, 0 failures: every gradient, average speed, unit conversion, stage time, total distance and total displacement in both notes (including all 16 interactive `gate` answers), all four worked examples and their four twins, all 16 diagnostic items across the four sets, all 35 question parts and both find-the-mistake items. Every `commonError` value matches the error its feedback describes (e.g. 0006's `-1.555556` = −70/45; 0008's `12` = 600/50; 0012:b's `7.16` = mean of 8 and 1200/190).
- **(c) Numeric specs — clean apart from A1.** 34 numeric specs (30 question parts + 4 worked-example twins); units match every stem and answer line (m/s, m, s, km/h); the three graph-read items use `range` tolerances that agree word-for-word with their schemes' "accept anything from 8 to 12 / 24 to 26 / 190 to 210" and their `ft` flags, and the interval read between two labelled ticks (`0004`, 10 s) is correctly exact.
- **(d) Graph part — clean.** `plotLattice` on `0011:a` gives x: lo 0, hi 60, major 10, minor 2; y: lo −20, hi 120, major 20, minor 4; tolerance 2 in data units; `unreachable: []` — all four targets (0, 0), (20, 100), (40, 100), (60, −20) sit exactly on lattice values, so every target is tappable. The 4-entry `lineThrough` is the correct encoding: `needsPlacedLine` is false for more than two points, so it means "join the plotted points" — right for three joined segments, and a 2-entry list would have been wrong here. The intended answer marks 2/2; the CER's reported error marks 1/2, matching the scheme's declared 1.
- **(e) Text marking — one part, covered by D4.** `q.…0001:main` is the only text part in either bundle; ASV has none.
- **(f) Regex commonErrors — nothing to check.** Neither bundle contains a `{"kind":"text","regex":…}` commonError, so there are no greedy `.*` patterns and none can match a correct answer. Separately, all 25 numeric commonErrors were fed back through `markAnswer`: none matches its own part's correct answer, none is swallowed by the answer's own tolerance, and each awards exactly its declared `marksTypicallyEarned`.
- **(g) Choice items — clean.** 27 choice-shaped items (9 DTG + 10 ASV mcq answers and diagnostic items, 6 note `gate`/`choice` blocks, 2 worked-example `whyMenu`s): exactly one correct option each, no duplicate option texts or ids, every option carries feedback, every gate's `answer` appears exactly once among its `options`, and every distractor is genuinely wrong (checked individually — e.g. DTG 0008's "both legs cover the same ground" is false, the legs being 45 m and 70 m).
- **Find-the-mistake — clean.** DTG: line 2 ("Time = 60 s") is the genuine error, the fix (60 − 40 = 20, −120/20 = −6) is right, and `marksEarnedAsWritten: ["MW1"]` matches the parallel part `0011:d` awarding MW1 for a correct signed change in displacement. ASV: line 3 (mean of two speeds) is the genuine error, the fix (3900/600 = 6.5) is right, and `marksEarnedAsWritten: []` is right — no scheme credits the mean of two speeds.
- **Mark schemes — clean.** Every part's `scheme` marks sum to the part's `marks`; every question's parts sum to `totalMarks`; only `M`/`W`/`MW` codes appear, as `packs/further-maths/exam-true/mark-language.json` requires; no duplicate scheme ids.
- **(h) Delimiters and placeholders — clean.** 5,931 strings scanned across both bundles and both note files: no odd `$` count, no `${`, no `$$`, no literal `undefined` or `NaN`.
- **Figures — clean.** All 13 cartesian figure SVGs were decoded and their pixel coordinates mapped back through the axis tick labels: every polyline vertex reproduces exactly the coordinates in its `alt` text and in the questions that use it, and the annotation labels agree (the robot's "1.5 m/s", "at rest", "-2 m/s", "run 20 s", "rise 30 m", "run 25 s", "rise -50 m"; the Eimear/Niall crossing dot at (25, 200)).
- **Spec and source claims — clean.** Both notes' `specRefs` are `["FM2-KIN-01"]`, matching `data/spec/further-mathematics.json` statements[21] ("draw, interpret and use displacement/time graphs and velocity/time graphs") and its Teacher Guidance (negative displacements allowed; two journeys on one grid; average speed and average velocity can be asked). Both `formulaSheet.given` claims match `units[1].formulaSheet` exactly (quadratic formula; vector magnitude and angle; four constant-acceleration formulae; F = ma), so both "Sheet or memory?" callouts and the DTG `g8` gate are right that nothing for these topics is given. The ASV `howExamined` claim that Summer 2024 Q1(ii) awarded "MW1 for a correct total distance and W1 for the total time and the division" matches the published scheme verbatim (`docs/sources/papers/further-maths/2024-Summer/FM2-MS-47756.txt`: "Total distance travelled = 100 + 80 = 180 m MW1 / Total time = 60 s W1"), and the DTG claim of "one for any two correct segments, one for the rest" matches "(for any 2 line segments correct) MW1 / (for remaining line segment correct) MW1". All three examiner callouts (2024 FM2 Q1, 2023 FM2 Q6, 2019 FM2 Q2) are faithful paraphrases of the CER text.

---

## Verdicts

- **displacement-time-graphs** — sound mathematics and clean arithmetic; four fixes needed before sign-off: one note sentence that illustrates the opposite of its own rule (D1), three stems missing their axis units (D2), four mistagged distractors (D3), and the single text part's key-word group (D4).
- **average-speed-and-velocity** — arithmetic and exam alignment are the strongest in the pair; three fixes needed: one accuracy-shaped tolerance on an exact answer (A1), eight mistagged distractors, six of them unit-conversion slips wearing kinematics ids (A2), and a reviewer decision on km/h content that no FM2 paper has ever asked (A3).
