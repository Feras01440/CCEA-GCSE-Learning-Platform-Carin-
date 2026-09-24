# FM1 re-verify C-1 — four Further Maths Unit 1 bundles

Re-check of every finding in `docs/dev/qa/pre-read/fm1-c-1.md` against the bundles as they stand
(all four `bundle.json` / `note.blocks.json` mtimes 19 Sep 23:37–23:39).

**PARTIAL — stopped at the usage mark.** Two pieces of the brief were **not reached** and nothing
below covers them:

1. **Figure SVGs were not read.** The second open check from the pre-read (read every figure SVG in
   `form-three`, `trig-graphs` and `trig-equations`, bundle figures and `note.blocks.json` figure
   blocks, against alt text and drawing) is **not done**. `solve-three`'s figures remain the only ones
   read, in the original pre-read.
2. **The closing "In the exam" panels were not measured.** Neither the 53–71 word claim nor the
   presence of the dropped material in `bundle.note.sheet.traps` was confirmed; the probe that would
   have printed them was cut off. **Not done.**

Also not re-run: the "clean here" sections (1.2, 2.6, 3.6, 4.4) and the cross-cutting §5 checks,
beyond what the fixes below touch. They were sound at the first pass and nothing in the fix pass is
expected to have disturbed them, but that is an assumption, not a measurement.

**How the marking rows were proved.** One script
(`scratchpad/mega.mts`, run with `npx tsx` from the project root) imports `markAnswer` from
`src/components/items/mark.ts` and calls
`markAnswer(raw, part.answer, { marks: part.marks, prompt: part.stem, commonErrors: part.commonErrors })`
— the stem passed as `prompt`, so accuracy instructions are live. Every score quoted below is that
script's output, not a reading of the JSON. `scratchpad/mega2.mts` did the gate scan and the
specRef reconciliation.

---

## 1. solve-three-simultaneous-equations

| finding | status | evidence |
|---|---|---|
| 1.1 find-the-mistake names the wrong checking equation | **holds** | `ftm…solve-three….01` feedback now reads "fail that check in $(2)$"; `correction` still ends "Check in (2)", worked example step 6 agrees |
| 1.2 rest of bundle clean | not re-run | no fix was asked for; not re-measured this pass |

specRef: the only reference in the bundle is `FM1-SIM-01`, on all 7 questions, the note and the
find-the-mistake item. It exists in `data/spec/further-mathematics.json` as "form and solve three
equations in three unknowns;" (unit FM1) and matches the content exactly.

**Verdict: the one wrong word is fixed; publishable on the evidence available.**

---

## 2. form-three-simultaneous-equations

| finding | status | evidence |
|---|---|---|
| 2.1 `0012/a` common error `25` unreachable | **holds** | value kept at 25, feedback rewritten to the "reads the third sentence as giving Bróna's age" diagnosis; that route executes (`y = 20`, `x = y + 5 = 25`). Marked: `25` → **1 of 4** with that feedback, `17` → **4 of 4** |
| 2.2 `0013/d(i)` common error `6.16` wrong value | **holds** | now `2.37`, tolerance absolute `0.005`. Route executes: `6.5x − 3.15 = 12.25 → x = 15.4/6.5 = 2.3692…`. Marked: `2.37` → **2 of 4** with the diagnosis; `6.16` → **0 of 4**; `1.40` → **4 of 4** |
| 2.3 show-that parts pay 2 of 3 for working backwards | **holds** | all five parts (`0005/main`, `0006/main`, `0014/b`, `0015/a`, `0015/b`) carry a reject list on **every** group (11 phrases, "work/working/worked backwards" all present). Marked: three different backwards answers → **0 of 3** on the 3-mark parts and **0 of 2** on `0015/b`; both authored `accepted` answers → full marks on all five; a fresh forward paraphrase → full marks on `0005/main`, `0006/main`, `0014/b` |
| 2.4 `0011/main` numeral answer under-earns | **holds** | group 1 now `["negative","below zero","less than zero","minus","-2","impossible"]`. Marked: the numeral answer → **2 of 2**; both accepted → 2 of 2; "The arithmetic must be wrong…" → **0 of 2** with its named diagnosis |
| 2.5 `0015/c(i)` `-5800` in thousands | **not applied (moot)** | deliberate — the report said "consider". `c(i)` still carries exactly two common errors, `2` and `-5.8`; no `-5800` |

specRef: `FM1-SIM-01` only, on all 16 questions and the note; exists and matches.

**Verdict: all four actionable findings fixed and proved under the engine; the one deferred item is the one the report only suggested.**

---

## 3. trig-graphs-sin-cos-tan

| finding | status | evidence |
|---|---|---|
| 3.1 `0004`/`0005`/`0006` mark their own scheme answer wrong | **holds** | specs are now `0.64` / `0.82` / `0.62`, each `tolerance: {absolute, 0.005}`, and each sign common error is `-0.64` / `-0.82` / `-0.62` with the same tolerance. Marked, all three: the given value → **2 of 2**; the full-precision value (`0.642788`, `0.819152`, `0.624869`) → **2 of 2**; the negative of each, rounded **and** full-precision → **1 of 2** with the reflection diagnosis; a wrong value → 0 of 2 |
| 3.2 `0010/a` tan sketch on a cosine rubric | **holds** | rubric is now three tan lines ("Three branches, each rising from bottom left to top right…", "Dashed vertical asymptotes at $x = -90$ and $x = 90$…", "Crossings marked at $-180$, $0$ and $180$…"); no maximum/minimum/turning-point line, and the "For tan x only:" prefix is gone. `0009/a` keeps the cosine rubric, unchanged and correct there |
| 3.3 `0003/main` wrong answer scores full marks | **holds** | reject added to group 2 only: `{"any":["x = 270","270"],"marks":1,"reject":["y = 270","y = 90"]}`. Marked: `y = 90 and y = 270` → **1 of 2**, carrying the authored common-error feedback (the mark the scheme declares); `x = 90 and x = 270` → 2 of 2; `90 and 270` → 2 of 2; `x = 90` → 1 of 2; `x = 0 and x = 180` → 0 of 2 |
| 3.4 note gate `g10` LaTeX backslashes stripped | **holds** | the note was restructured to 42 blocks carrying gates `g1`–`g7` and `g11`; there is no `g10` any more. Every `$…$` span in every gate of this note passes the stripped-backslash test, and so does the whole `note.blocks.json` |
| 3.5 `0010/c` stem admits three answers | **holds** | stem now reads "the value of $x$, **strictly between** $-180^\circ$ and $180^\circ$, at which your sketch crosses the x-axis…" |

specRef: `FM1-TRG-01` only, on all 10 questions and the note; exists as "sketch the graphs of sin x,
cos x and tan x, where the range of x is a subset of −360° ≤ x ≤ 360°;" and matches.

**One thing worth a look, not a finding:** the pre-read cited this note's gate `g8` ("$\tan x$ has no
maximum and no minimum anywhere") as support for 3.2. After the restructure this bundle has no `g8`,
`g9` or `g10`. The gates that remain are clean, but whether the tan facts those three carried survive
elsewhere in the note was **not** checked.

**Verdict: all five findings fixed and proved; the note restructure that removed the broken gate has not itself been read for lost content.**

---

## 4. trig-equations

| finding | status | evidence |
|---|---|---|
| 4.1 note gate `g10` LaTeX backslashes stripped | **holds** | note is now 41 blocks with gates `g1`–`g7` and `g11`; no `g10`. Every gate's `$…$` spans pass the stripped-backslash test, and the whole `note.blocks.json` is clean |
| 4.2 `0009/c` key-word group misses every paraphrase | **holds** | both groups widened as proposed (group 1 now leads on `greatest` / `maximum` / `highest` plus the six phrase variants; group 2 on `never meets` … `never touches`). Marked: all four pre-read paraphrases → **2 of 2**; both accepted answers → 2 of 2; "The line is above the curve." alone → **1 of 2** ("still missing greatest") |
| 4.3 eleven degree-sign rescue common errors | **holds** | a sweep of all four bundles finds **0** text common errors whose regex mentions `°` or `degrees`. On `0001/main` (`x=30, x=150`, 2 marks): `30° and 150°`, `30 degrees and 150 degrees`, `x = 30 or x = 150`, `30, 150`, `x = 30, x = 150` all → **2 of 2**; `x = 30` alone → **1 of 2** with the second-solution diagnosis |

specRef: `FM1-TRG-02` only, on all 10 questions and the note; exists as "solve simple trigonometric
equations that lead to a maximum of two solutions in a given range." and matches.

**Caveat on 4.3:** the degree-sign spellings were re-marked on **one** solution-set part (`0001/main`,
the only part in the bundle whose answer pairs 30 with 150). The other ten solution-set parts were
**not** re-marked this pass; the pre-read had them passing before the common errors were removed, and
the removal only matters if the engine's degree-stripping covers them too.

**Verdict: both findings fixed and proved; one part carries the degree-sign proof for all eleven.**

---

## 5. Open checks

### 5.1 specRefs against `data/spec/further-mathematics.json` — **done, clean**

(The spec file is `further-mathematics.json`, not `further-maths.json`.) 61 statement ids parsed from
the spec. Every reference used anywhere in the four bundles or their notes — `specRefs` and
`statementIds`, topic, note, question, worked-example, diagnostic and find-the-mistake level — is one
of exactly three ids, each of which exists in the spec and names a statement that matches the item's
content:

| bundle | refs used | question coverage | spec statement |
|---|---|---|---|
| solve-three | `FM1-SIM-01` | 7 of 7 | form and solve three equations in three unknowns |
| form-three | `FM1-SIM-01` | 16 of 16 | form and solve three equations in three unknowns |
| trig-graphs | `FM1-TRG-01` | 10 of 10 | sketch the graphs of sin x, cos x and tan x, range a subset of −360° ≤ x ≤ 360° |
| trig-equations | `FM1-TRG-02` | 10 of 10 | solve simple trigonometric equations leading to at most two solutions in a given range |

No dangling reference, no reference to a statement from another unit, and no question left without
one. The pre-read's remark that "every item carries `specRefs: []` at topic level" was a reading of
the wrong key: the topic object carries `statementIds`, and it is populated.

### 5.2 Figure SVGs — **NOT REACHED**

Not started. Still open exactly as the pre-read left it, for `form-three`, `trig-graphs` and
`trig-equations` (bundle `figures` and `note.blocks.json` figure blocks): each SVG read against its
alt text and its drawing — curves through the labelled points, asymptotes where claimed, axis labels.

### 5.3 Closing "In the exam" panels and `sheet.traps` — **NOT REACHED**

Not measured. Open: that each closing panel is a 53–71 word pointer, that the material dropped from
the old 199–248 word panels is present in `bundle.note.sheet.traps`, and that nothing
teaching-critical was lost.

---

## 6. Verdicts

| bundle | verdict |
|---|---|
| solve-three-simultaneous-equations | Its single finding is fixed; specRefs clean. Publishable on the evidence gathered, subject to §5.3. |
| form-three-simultaneous-equations | All four actionable findings fixed and proved under the engine; 2.5 deliberately deferred; specRefs clean. Figures (§5.2) still unread. |
| trig-graphs-sin-cos-tan | All five findings fixed and proved, including the three questions that marked their own answer wrong; specRefs clean. Open: what the removed gates g8–g10 took with them, and the figures. |
| trig-equations | Both findings fixed and proved; the eleven degree-sign common errors are gone and the engine handles the spellings. Open: the other ten solution-set parts were not re-marked, and the figures. |
