# FM2 re-verify B-1 — vertical motion, vectors and scalars, magnitude and direction, i/j calculations

Re-check of every finding in `docs/dev/qa/pre-read/fm2-b-1.md` (sixteen) against the bundles as they
stand. All eight files carry mtime **20 Sep 16:13:13**; every measurement below was taken after that
(digest 16:17, marking runs 16:24, build 20:50), so nothing here is read from a stale copy.

**How the marking rows were proved.** Three scripts in the session scratchpad, run with `npx tsx`
from the project root, import `markAnswer` from `src/components/items/mark.ts` and call
`markAnswer(raw, part.answer, { marks: part.marks, prompt: stem, commonErrors: part.commonErrors })`
with the part's own stem passed as `prompt`, so accuracy instructions are live:

- `mark-sweep.mts` — (A) every auto-markable part in the four bundles marked with its own stored
  answer, its `accepted[0]` / worked wording and its value-plus-unit spelling (**112 calls, all full
  marks**); (B) every i/j vector answer line — **15 question parts and 2 twins**, which is the whole
  set the fix pass claims — marked in ten right spellings (plain, j-first, bold `\mathbf`, hatted,
  `pmatrix`, `bmatrix`, tuple, plain+unit, bold+unit, bracketed) and in five spellings each of the
  authored wrong vector and of an undiagnosed wrong vector (**329 calls**).
- `findings.mts` — the finding-by-finding battery quoted in the tables (**113 calls**).
- `structural.mts` — LaTeX tokens, find-the-mistake line diffs, diagnostic/MCQ/gate integrity,
  `totalMarks` reconciliation, typed-form instruction scan.

Every score quoted below is script output, not a reading of the JSON.

**Build.** `npm run content:check` re-run at 20:50: all four bundles publish `ok`
(`fm.u2.ij-vector-calculations` we 3 · dx 12 · q 18 · ftm 3 · rp 10 · note;
`fm.u2.vector-and-scalar-quantities` q 8; `fm.u2.vector-magnitude-and-direction` q 8;
`fm.u2.vertical-motion-under-gravity` q 12). `150 topic bundle(s) published, 0 problem(s), 0
key-word warning(s), 161 figure(s) printing an answer` — and **zero of those 161 FIGURE lines name
any fm2 bundle**: no figure in these four prints a part's answer. (The run exits 1 on
`lesson-v2`, 25 breaches in 5 notes — `fm1/area-under-curve` and four `c2/` notes. None of these
four.)

---

## vertical-motion-under-gravity

| finding | status | evidence |
|---|---|---|
| 1 (minor) `0011(b)` 2-d.p. answer printed to 1 d.p. | **holds** | scheme row now `both roots, $t = 1.70$ and $t = 5.30$`; worked solution ends `1.70` … `5.30` … `5.30`; `value` left at `5.3`, tolerance `dp 2`. Marked: `5.30` → **4/4** clean; `5.3` → 4/4 **with** the "on the paper write 5.30" nudge; `5.30 s` → 4/4; `t = 5.30` → 4/4; `1.70` and `1.7` → **3/4** tagged `fm.kin.first-root-taken`; `3.50` → 0/4 |

Also re-measured: `0011(a)` `61.25` / `61.25 m` → 2/2, `-61.25` → 1/2 `fm.kin.gravity-sign`,
`122.5` → 0/2 `fm.kin.constant-speed-assumed`. Find-the-mistake `…01` has `mistakeLine` 1 and
exactly one independently wrong line (line 1 writes `a = 10` with up positive; lines 3–4 differ from
the correction only by carrying it: `0 = 576 + 20s → s = -28.8`, line 2 identical). `9.8` still
appears exactly twice outside SVG path coordinates, both in `notOnThisSpec`.

**Verdict: all clear — the one presentation finding is applied and nothing else moved.**

---

## vector-and-scalar-quantities

| finding | status | evidence |
|---|---|---|
| 2 (must) `0004` reversed answer earned 2/2 | **holds** | key words now subject-bound: group 1 `mass is a scalar / mass has magnitude only / mass has size only / mass has a magnitude only / mass has no direction / mass only has a size / mass has only a magnitude`; group 2 `weight is a vector / weight is a force / weight acts downwards / weight is the pull of gravity / weight, unlike mass, is a vector`. Marked: accepted → 2/2; both pre-read paraphrases → **2/2** (the second improves from 1/2 as promised); the **reversed answer → 0/2** tagged `fm.vectors.weight-scalar`; `"Mass has magnitude only."` → 1/2 "still missing weight is a vector"; `"Weight is a scalar because it is just a number of newtons."` → 0/2 |
| 3 (should) "quantity" not accepted for "magnitude" | **holds** | `0007(a)` group 1 gained `quantity and direction` and `quantity and a direction`; `0006` group 1 gained `quantity only` and `quantity but no direction`. Marked: `"A vector quantity has a quantity and a direction, for example weight."` → **2/2** (was 1/2); `"A scalar has quantity only, for example mass."` → **2/2** (was 1/2); `"A scalar has quantity but no direction, for example speed."` → 2/2; every previously accepted answer still full marks |
| 4 (minor) three text regexes fired on correct clauses | **holds** | all three rewritten exactly as the pre-read specified — `0004` `\bweight\b[^.;\n]{0,30}\bis (?:a \|an )?scalar\b`; `0006` **and** `0007(b)` `\bhas (?:a )?magnitude and (?:a )?direction\b\|\bhas (?:a )?size and (?:a )?direction\b`; `0007(a)` `\bvector\b[^.;\n]{0,30}\b(?:magnitude\|size) (?:only\|alone)\b`. Marked: `"Mass has magnitude only. Weight is a vector, not a scalar."` → 2/2 **no tag**; `"Weight, unlike mass, is not a scalar quantity…"` → no tag; `"A scalar has magnitude only, not magnitude and direction like a vector."` → 2/2 no tag; `"A vector has magnitude and direction, unlike a scalar which has magnitude only."` → 2/2 no tag. Genuine errors still fire: `"The weight of the bag is a scalar."` → 0/2 tagged; `"A scalar has magnitude and direction…"` → 1/2 `definitions-swapped` on both `0006` and `0007(b)`; `"A vector has magnitude only…"` → 1/2 tagged |
| 5 (minor) `we…01` called 036.87° "north-east" | **holds** | `finalAnswer` now `(i) distance $7$ km, displacement $5$ km on a bearing of $036.87^{\circ}$`; `note.blocks[5]` now `$5$ km, on a bearing of $037^{\circ}$ — between north and east`. Hero lede keeps "five kilometres north-east of home", which the fix explicitly allowed |
| 6 (minor, engine-side) six-target part pays a guess | **holds (reworded, as offered)** | the table is now its own question `0008` with rows `any three correct` / `the remaining three correct`. Measured 0…6 correct → **0,0,0,1,1,1,2**, so the rows now name the engine's own boundaries. The four-target sibling `0003` measures 0,0,1,1,2 against `any two correct` / `the remaining two correct`. The engine-side half (a pure guess still averages one mark) is untouched — the pre-read allowed either route and called it "no content bug" |

Beyond the sixteen, the fix pass also **split old `0007`**: `0007` is now definitions (a)+(b) with
**no figure**, and the six-measure table is `0008` with its own figure. That removes the leak the
split was for — the shared figure printed "Weight", which is an accepted example for `0007(a)`. The
build confirms it: no FIGURE line for this bundle. Find-the-mistake `…01` has `mistakeLine` 3 and
exactly one differing line.

**Verdict: all five findings applied and proved; publishable.**

---

## vector-magnitude-and-direction

| finding | status | evidence |
|---|---|---|
| 7 (must) `$mathbf{i}$` renders as "mathbfi" | **holds** | `$mathbf{` occurs **0 times** in this bundle (and 0 across all four, `bundle.json` + `note.blocks.json`); no `mathbf` anywhere is unpreceded by a backslash; 111 well-formed `\mathbf` here. Both named stems now read `…where $\mathbf{i}$ and $\mathbf{j}$ are perpendicular unit vectors, with $\mathbf{i}$ along the x-axis` — `we…01` and `0008(a)` |
| 8 (should) bearing printed with two figures | **holds** | `0007` worked solution now `…$\tan^{-1}\dfrac{40}{30} = 053.13^{\circ}$`, scheme row `W1: $053.13$`, `note.blocks[19]` `on a bearing of $053.13^{\circ}$`; `value` left at `53.13`. Marked: `053.13`, `053.13°`, `53.13`, `53.13 degrees` all → **3/3**; `36.87` / `36.87°` → 1/3 tagged `fm.vectors.bearing-not-from-north`. `0005` (angle with the x-axis, not a bearing) correctly still prints `53.13` |
| 9 (minor) 2-d.p. answers printed to 1 d.p. | **holds** | `0008(b)` row `W1: $46.40$`, solution `= 46.40^{\circ}`; `0008(c)` row `W1: $43.60$`, solution `$\tan^{-1}\dfrac{20}{21} = 43.60^{\circ}$, and $46.40 + 43.60 = 90$`. Marked: `46.40` → 2/2 clean, `46.4` → 2/2 **with** the write-46.40 nudge, `46.40°` → 2/2; `43.60` → 2/2, `43.6` → 2/2 + nudge; `43.60` on (b) → 1/2 `direction-ratio-inverted`, `46.40` on (c) → 1/2 same |

`0008(a)`: `29` / `29 m/s` → 2/2, `841` → 1/2, `41` → 0/2, each with its named tag.
Find-the-mistake `…01`: `mistakeLine` 2, exactly one independently wrong line (line 2 inverts the
ratio; lines 3–4 follow from it).

**Verdict: all three findings applied and proved; publishable.**

---

## ij-vector-calculations

| finding | status | evidence |
|---|---|---|
| 10 (must) 11 broken `$mathbf{…}$` tokens | **holds** | 0 occurrences of `$mathbf{` here; 745 well-formed `\mathbf`. All seven notation-defining stems now read correctly — `we…01`, `we…02` (`with $\mathbf{i}$ along the x-axis`), `we…03` (`…, and distances are in metres`), and the opening parts of `0015(a)`, `0016(a)`, `0017(a)`, `0018(a)` (`$\mathbf{i}$ along the x-axis and $\mathbf{j}$ along the y-axis`). With finding 7 that is 2 + 11 = **13 tokens**, exactly as claimed |
| 11 (must) `ftm…01` had two wrong lines | **holds** | `studentWorking[1]` is now `i: 6 - 5 = 1` and `studentWorking[3]` `Resultant = i - 11j N`; `mistakeLine` 3, `correction` and `marksEarnedAsWritten: ["MW1"]` unchanged and now coherent. Only line 3 is independently wrong; line 4 differs from the correction solely by carrying it |
| 12 (must) `ftm…03` flagged line incoherent | **holds** | `studentWorking[2]` is now `i: 6 + (-6) = 0`, so line 5 (`2p - 3q = -2j`) follows. `whatWentWrong` reworded to "Line 3 adds the $\mathbf{i}$ component of $3\mathbf{q}$ where the question subtracts it." — the wording the pre-read suggested. `mistakeLine` 3; lines 1, 2, 4 arithmetically sound |
| 13 (must) `0016(a)` common-error value did not follow | **holds** | `latex` now `"(20, 7)"`, feedback and `marksTypicallyEarned: 3` intact. Marked: `(20, 7)` → **3/5** and `p = 20, q = 7` → **3/5**, both tagged `fm.vectors.component-sign-dropped` with the authored feedback (the paired-error inconsistency the pre-read queued is gone — the assignment spelling now fires like the tuple); `(4, -1)`, `p = 4, q = -1`, `p=4,q=-1`, `p = 4 and q = -1` → **5/5**; `(-1, 4)` and `p = -1, q = 4` → **4/5** `coefficients-not-equated`; `(16, -5)` → 0/5 |
| 14 (should) `0009` common-error sign, phantom `$\mathbf{v}$` | **holds** | no `\mathbf{v}` anywhere in the question; first entry reworded to "divides the $\mathbf{i}$ component of the answer, $10$, by the $3$ in the $\mathbf{j}$ coefficient, so the two columns have been crossed"; a second entry `value: -3.333333`, same misconception, `marksTypicallyEarned: 0`, feedback naming the signed version. Marked: `3.33`, `3.333333`, `-3.33`, `-3.333333` all → **0/2** tagged `fm.vectors.scalar-multiple-partial` with the matching feedback; `5` and `k = 5` → 2/2 |
| 15 (should) `dx…pre` item 02 distractor feedback | **holds** | option c is now `$x = 4$, $y = 3$` with the feedback unchanged (4 − 3 = 1 satisfies the second, 4 + 6 = 10 ≠ 7 fails the first); option d `$x = 1$, $y = 3$` keeps "satisfies the first…". Scan of all 4 diagnostic sets, both MCQ parts and every note `choice` gate in the four bundles: exactly one correct option, no duplicate option texts, feedback on every option, every gate answer present among its options |
| 16 (should) `0008` "Round to 2 decimal places" on an exact 10 | **holds** | the instruction line is gone from the stem (now `…Calculate the distance $AB$.\n\nAnswer ________ m`) and `tolerance` is `{"type":"absolute","value":0.005}`, matching siblings `0006` and `0018(c)`. Marked: `10`, `10 m`, `10.00` → **3/3** with clean feedback and no rounding advice; `100` → **2/3** `fm.vectors.magnitude-root-omitted`; `14` → 0/3 |

**Vector spelling sweep (all 15 question lines + both i/j twins).** For every one of the 17, the
right vector marks full in plain, j-first, bold `\mathbf`, hatted, `pmatrix`, `bmatrix`, tuple and
bracketed spellings; the authored wrong vector fires its common error at its authored mark in plain,
bold, `pmatrix`, tuple and (where the unit is `N`, `m` or `m/s`) plain-plus-unit; and an
undiagnosed wrong vector scores 0 in all five spellings with an algebra diagnosis. **One exception,
engine-side — see below.**

The typed-form instruction ("Type it as plain letters…") is gone from **all 15 vector question lines
and both twins** (scan returns 0). It survives on three `blank` note gates (`g1`, `g2`, `g6`) — and
correctly so: `markGate` compares a blank gate against its listed alternative strings and never runs
the vector engine, so the instruction is load-bearing there.

**Verdict: all seven findings applied and proved; publishable on content. One engine gap is open
(below) and it bites exactly one part of this bundle.**

---

## Still open

**E1 (engine, `src/`, outside the sixteen findings) — a unit with a superscript ² is not stripped
after a vector, so the printed unit is refused.**

`normaliseUnicode` rewrites `²` to `^{2}` *before* `VECTOR_UNIT_TAIL` runs
(`src/lib/marking/algebra.ts`, lines ~305–320 and ~1563), and the tail regex lists `m\/s\^?2`,
`m\/s²`, `ms⁻²`, `ms⁻¹`, `m s⁻¹` — none of which can match `m/s^{2}` or `ms^{-2}`. Measured on
`q.fm.u2.ij-vector-calculations.0017 (a)` (answer `3i - 4j`, stem prints `Answer ________ m/s²` —
the only vector line in all four bundles whose unit is `m/s²`):

| typed | marks | diagnosis |
|---|---|---|
| `3i - 4j` | 2/2 | correct |
| `3i - 4j N`, `3i - 4j m/s`, `3i - 4j m/s2`, `3i - 4j m/s^2` | 2/2 | correct |
| `3i - 4j m/s²` | **0/2** | "That is not equivalent to the expected answer. For example, when i = … and m = … and s = …" |
| `3\mathbf{i} - 4\mathbf{j} m/s²`, `(3i - 4j) m/s²` | **0/2** | same |
| `75i - 100j m/s²` (the authored `scalar-multiple-partial` slip) | 0/2, **no tag** | the common error does not fire either |

So a learner who copies the unit exactly as the stem prints it loses both marks and gets a diagnosis
about the letters `m` and `s`. `ms⁻¹` and `m s⁻¹` are dead in the same way, though no part in these
four bundles asks for them.

Precise fix (engine, not content — I did not touch `src/`): add the post-normalisation spellings to
`VECTOR_UNIT_TAIL` in `src/lib/marking/algebra.ts` —
`m\/s\^\{2\}|ms\^\{2\}|ms\^\{-1\}|m s\^\{-1\}|ms\^\{-2\}|m s\^\{-2\}` — or, cleaner, strip the unit
tail before `normaliseUnicode` rather than after. Either way this is one line and it is engine-side;
no bundle edit can reach it.

**Noted, not open.** Two observations that are correct behaviour, recorded so they are not
re-discovered:

1. `vector-magnitude-and-direction 0007`: `"a bearing of 053.13 degrees"` typed into the numeric
   field → 0/3, "That answer could not be read. Try typing just the number, with any unit after it."
   The field prints `Answer ________ °`; a prose prefix is out of contract for a numeric answer.
2. `vector-and-scalar 0004`: `"Weight, unlike mass, is not a scalar quantity."` earns 1/2 with no
   diagnosis. The guard is doing its job (it stays silent); the mark is withheld because group 2
   wants the positive statement, which is what CCEA credits.

---

## Summary

| bundle | findings | all applied? | verdict |
|---|---|---|---|
| vertical-motion-under-gravity | 1 | yes | **Publishable.** The 2-d.p. model answer now reads 5.30 and marking is unchanged. |
| vector-and-scalar-quantities | 2–6 | yes | **Publishable.** The reversed answer scores 0/2, "quantity" is credited, the three guards are silent on correct clauses, and the figure leak is gone with the 0007/0008 split. |
| vector-magnitude-and-direction | 7–9 | yes | **Publishable.** No broken LaTeX anywhere, the bearing prints 053.13° in all three places, the 2-d.p. rows read 46.40 / 43.60. |
| ij-vector-calculations | 10–16 | yes | **Publishable on content**, with engine item E1 open: the only `m/s²` vector part refuses the unit its own stem prints. |

554 marking calls across the three scripts; 0 unexpected results other than E1.
