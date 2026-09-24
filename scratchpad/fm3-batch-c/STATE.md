# FM3 batch C — state (updated 23 Sep 2026, 14:43)

Standard acknowledged (22 Sep 2026, 23:10): I have read STANDARDS.md in full and hold every topic in this batch to it — correct, exam-true, teaches, reliable, clear, better than the best; no rush, no shallow work.

Folder: this batch works in `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\scratchpad\fm3-batch-c\` (the predecessor created it inside the project, not under FORK_SP; nothing exists at FORK_SP\fm3-batch-c).

Order (brief): binomial-probabilities, normal-distribution-z-probabilities (batch D needs both), then pascals-triangle-binomial-expansion, normal-distribution-bell-curve.

## Published and verified

Current (23 Sep 14:42, after the depth passes; the rows below the table are the 22 Sep history):

| topic | counts | bundle.json | note.blocks.json |
|---|---|---|---|
| binomial-probabilities (S) | we 2 · dx pre 3 + post 6 · q 12 (10 practice + 2 exam-style, 47 marks) · ftm 2 · rp 8 · ins 1 · set 2 · ver 27; note 11 gates, 4 figures, 1 video, 1 sim | ecd6db67ff87e527 / 327884 B | 1bf9b8ae02efce70 / 26067 B |
| normal-distribution-z-probabilities (S) | we 2 · dx pre 3 + post 5 · q 12 (10 practice + 2 exam-style, 54 marks) · ftm 2 · rp 8 · ins 1 · set 2 · ver 27; note 10 gates, 7 figures, 1 video, no sim (Plinko cannot model the table technique) | a03cdd348bee20d6 / 314750 B | f1233234c3d6f54f / 45297 B |
| pascals-triangle-binomial-expansion (L) | we 1 · dx pre 3 + post 4 · q 7 (6 practice + 1 exam-style, 16 marks) · ftm 1 · rp 5 · set 1 · ver 17; note 7 gates, 3 figures, 1 video, 1 sim | fcbd5ecbd66aebba / 183763 B | 6d436701d7cbbd07 / 24196 B |
| normal-distribution-bell-curve (L) | we 1 · dx pre 3 + post 4 · q 7 (6 practice + 1 exam-style, 13 marks) · ftm 1 · rp 5 · set 1 · ver 17; note 7 gates, 6 figures, 1 video, 1 sim | 4faa8fdff4aba294 / 190654 B | cfe176635666ce14 / 40141 B |

History (22 Sep): binomial 17ee168cda346f41 / 307813 B and 57aa91db07cbc711 / 29053 B; normal-z a4aa6c5e306566e1 / 288325 B and dea7211333fd2aab / 45079 B.

Finish checks for normal-distribution-z-probabilities, run 22 Sep 23:45-23:52 after the last regeneration:
- `npm run content:check` exit 0: 176 bundles, 0 problems, 0 key-word warnings; no FIGURE line on my topics (the two fm3 FIGURE lines are conditional-probability 0016(b) and tree-diagrams 0010(a), batch B's); lesson-v2 176 notes, 0 breaches.
- `lesson-v2 --unit fm3` 0; `figure-leaks --unit fm3` 0 on my topics (leaks in addition-rule and conditional-probability, batch B's; one REVIEW line on my 0001(a), a table extract whose reading IS the part); `shingles --unit fm3` no breach; svg-draws 0; gate-context 0 without a visual; keyword-soft 0/0; text-parts 0/0; bare-tex 0.
- `check-marking.mts` 762 assertions OK across both topics (every spelling incl. the unicode minus, every commonError at 4 d.p. and unrounded, find-the-mistake fix box, faded steps, gates and options), after the coordinator's 22 Sep 23:50 engine changes; `verify-published.mjs` 71 routes OK.
- Registry: `fm.normal.wrong-tail-subtracted` (2024 Q5, 2025 Q6) and `fm.normal.z-rounded-before-table` (by analogy with 2019 Q4 early rounding, flagged as such in its note) added with MX(); insights build/validate OK; no fm.binomial / fm.normal id unregistered.
- Scope decision: the brief's "between values" is NOT taught or practised: FM3-NOR-02's Teacher Guidance excludes P(1 < z < 2) in terms; it is listed in notOnThisSpec and the panel says only one tail is asked.

Finish checks for binomial-probabilities, all run 22 Sep 23:20-23:34 after the last regeneration:
- `npm run content:check` exit 0: 168 bundles, 0 problems, 0 key-word warnings; 0 FIGURE lines on fm3; lesson-v2 168 notes, 0 breaches.
- `lesson-v2 --unit fm3` 0 breaches; `figure-leaks --unit fm3` 0 on this topic (5 leaks in addition-rule / conditional-probability / linear-transformation, other authors'); `shingles --topic binomial-probabilities` no breach (1 stock run); svg-draws 0; gate-context 0 without a visual; keyword-soft 0/0; text-parts-vs-solutions 0/0.
- `check-marking.mts` 442 assertions OK (every spelling, every commonError at 4 d.p. and unrounded, every gate and option); `verify-published.mjs` 43 routes OK; `bare-tex.mjs` 0 defects.
- Registry: `fm.binomial.wrong-terms-selected`, `fm.binomial.complement-not-needed` added with MX() to pipeline/mine/insights-source/further-maths.mjs; insights:build + validate OK; insights:unregistered shows no fm.binomial / fm.normal id missing.

## Toolchain (this folder)

- lib.mjs (predecessor: BigInt rationals, SVG primitives) · stat.mjs (Pascal rows by addition; Binom and Normal classes, importable by batch D; erf-series Phi checked against 0.7881, 0.8849, 0.9192, 0.9452, 0.9938) · emit.mjs (verification logs, lesson-v2 mirror, bundle asserts, string lint, emit) · routes.mjs (every context and every error route executed) · binfig.mjs (binomial figures) · binomial-probabilities.mjs (generator) · check-marking.mts · verify-published.mjs · bare-tex.mjs · preview.mjs / render.mjs (figures rasterised with sharp to preview/<slug>/*.png and looked at).
- Run generators and checks from the repository root; check-marking with `node_modules/.bin/tsx`.

## Decisions recorded

- Probability answers: numeric, tolerance dp 4 under "Give your answer to 4 decimal places."; exact short values use tolerance exact with fraction accepted. A guard refuses any answer or route within 0.02 of a 4 d.p. rounding tie.
- Rows 7 and 8 of Pascal's triangle are never printed as eight numbers in a row in prose (the 2021 scheme prints row 7): they are said as a rise and its mirror image.
- Contexts that reproduced a CCEA question's numbers were changed (trains p 0.2 -> 0.25; the 2019 pens question used 0.8 and 0.2 over 6 trials).

## Tooling lesson (22 Sep 23:49)

A String.replace whose replacement text held "$`" inserted the file's prefix twice into normal-distribution-z-probabilities.mjs; recover.mjs cut both copies out exactly (each was a verified byte-for-byte copy of the prefix). Never pass generator text as a replace() replacement string: use the Edit tool, or split/join.

## Depth standard (received 23 Sep 13:40; this section supersedes "Next step" below)

Read in full: AUTHORS-DEPTH-MESSAGE.md, author-topic.md "Depth standard (22 Sep 2026)", docs/plan/review/2026-09-22-depth-standard.md, scripts/qa/lesson-v2.mjs depthOf(), frozen-surface.mjs.

Pascal trimmed and regenerated at 23 Sep 13:38 (bundle 859aab86ebb35b19 / 183356 B, note aa13787833c61cf0 / 27402 B); check-marking, verify-published and bare-tex OK on it; the rest of its finish checks run after its depth pass.

Frozen-surface snapshots taken 23 Sep 13:40 (before any depth edit): before-binomial-probabilities.json (34 items), before-normal-distribution-z-probabilities.json (33), before-pascals-triangle-binomial-expansion.json (23). Guard: `node "<session scratchpad>/platform/depth-standard/frozen-surface.mjs" check packs/further-maths/content/fm3/<slug> scratchpad/fm3-batch-c/before-<slug>.json` must print 0 differences before filing. It hashes: question totalMarks/skeleton/methodLock/parts(id, marks, answer, scheme, commonErrors, followThrough); diagnostics set `when` + items (id, options id/text/correct/misconception), so a new diagnostic item needs a NEW set; ftm studentWorking/mistakeLine/misconception; prompt answer/keyWords; worked example steps (n, input, earns), faded, twin.answer, so no step may be added to a published example; gate kind + answer.

Baseline `lesson-v2 --unit fm3 --depth` (23 Sep 13:44): binomial S 5 short (roles 0/9, idea, variants, twists section, practice at d4-5 = 0; 1 block > 75 words, 2 long headings, 1 caption > 25 words, 9 figures under 12.5 px, 7 long inline TeX); normal-z S 5 short (roles, idea, variants, twists, d4-5 = 0; 1 long heading; 9 small-label figures); Pascal L 3 short (roles, idea, variants; 1 block > 75, 1 long heading, 6 small-label figures, 6 long inline TeX).

Plan, one topic at a time, binomial first (batch D reads it), then normal-z, then Pascal, then author normal-distribution-bell-curve to the L floor from the start:
1. Re-read the corpus papers for the statement (patterns for the twists section).
2. Note: role on every heading; an idea section; variant sections (binomial: exactly r / at least-at most by complement / expanding (p+q)^n to list terms; normal-z: below the mean or above, left tail vs right tail, the fold for negative z); see; an "Exam twists" section with at least 2 twists (<= 40 words each) and a choice gate; every p/callout <= 75 words, headings <= 8 words, captions <= 25 words, callouts titled; no two visuals back to back; a gate within every 4 cards.
3. Figures re-emitted phone-native (viewBox about 400, labels >= 14 units); text-as-picture figures (conditions card, label card, bracket card, phrase table) become prose.
4. Long maths: chains as $$...$$ or split; number lists as prose; worked lines one step (published examples keep their steps, so chains there go to display maths).
5. New items with new ids: one practice rung at difficulty 4 each (S), mixed tail >= 3 with one neighbouring-topic item.
6. frozen-surface check 0 differences, then every finish check plus --depth; STATE.md after each topic.

### Depth pass 1 of 3 done: binomial-probabilities (23 Sep 14:12)

New tooling: phone.mjs (400-unit figures, labels >= 14, a label-box check that refuses overlaps and run-offs), depth.mjs (assertDepth mirrors lesson-v2 depthOf plus the section order, twists <= 40 words ending in a choice gate, titled callouts, 4 cards per gate, one "=" per maths segment; splitChains/tidyBundle/tidyBlocks rewrite every chain of equalities in workedSolution, hints, worked-example working, note paragraphs and gate explains into one line per "=", and break any segment over 60 characters at a top-level + or -), long-maths.mjs, splice.mjs (line-range replacement with expected first/last lines), outline.mjs, phone-preview.mjs. emit() now tidies, then runs assertDepth before writing. Backups of the three generators and routes.mjs before the pass: *.pre-depth.mjs.

Binomial after the pass: bundle ecd6db67ff87e527 / 327884 B, note 1bf9b8ae02efce70 / 26067 B (14:14:17; the 14:14 run only rewrote we.01 step 1 without a chain and dropped stray commas from split chains; guard, marker and route checks re-run OK).
- Note: 9 sections with roles (idea x4: hook, Plinko moved up, conditions, name the success; variant x3: exactly r, at least r (with the bracket stretch), at most/more than/fewer than; see; twists), 11 gates (new g10, g11), 4 phone-native figures (table, term anatomy, shaded table, dot strips); the conditions card, label card, bracket card and phrase table are now prose; 1052 words (over the 950 guide: 11 gates are frozen or needed), note 13 min.
- Twists from the papers: p in disguise (2019 fraction, 2021 words, 2026 percentage); the other outcome given (2019, 2022); n hidden in the story (2025); a points total as a count (2024). g10 and g11 are choice gates.
- New items: q.0012 (practice, difficulty 4: three darts, 50 or 10 points, total at least 100 = at least two 50s; answer 0.104 exact; routes wrongTerms 0.096, swap 0.896, coef 0.04 in routes.mjs); rp.08 (the count hidden in the story). 0004 re-rated difficulty 2 -> 1 (all/none, the bottom rung). Ladder reordered d1 to d4; the mixed tail keeps 0010 (Pascal's triangle, the neighbouring topic). we.01 lost its blank label-card figure (text as a picture).
- Checks: frozen-surface 34 checked, 0 differences, 4 additions (q.0012, rp.08, g10, g11); lesson-v2 --depth "meets the floor", no slides/figures/maths lines; content:check exit 0 (183 bundles, 0 problems, 0 key-word warnings, no FIGURE line on my topics); check-marking 965 assertions OK (binomial 501, 11 gates); verify-published 84 routes OK; bare-tex 837 segments 0 defects; figure-leaks 0 on binomial; shingles: no binomial breach (4 Pascal breaches found, fixed in the Pascal pass); svg-draws 0; gate-context 0 without a visual; text-parts 0/0; insights:unregistered no fm id.

### Depth pass 2 of 3 done: normal-distribution-z-probabilities (23 Sep 14:21)

After the pass: bundle a03cdd348bee20d6 / 314750 B, note f1233234c3d6f54f / 45297 B (14:20:47).
- Note: 9 sections with roles (idea x4: hook, standardise, the table, rough sizes of the tails (moved up from the end); variant x3: positive z shade then decide, negative z fold, above a value below the mean; see (six worked lines, one "=" each, plus the video); twists), 10 gates (new g9, g10), 7 phone-native figures (tail, scales, 5-column table extract, two-panel sides, fold, below-mean tail, rough tails); 931 words, note 12 min. The pointer no longer says "only one tail is ever asked"; it names the 2-mark 'given that' of 2022 and 2023.
- Twists: more than a value below the mean (2024, 2025, 2026); given that (2022, 2023); units that do not match (2026); words that change the tail (2021). g9 (given that: 0.2/0.8 = 0.25, product 0.16 offered) and g10 (1 hour = 60 minutes, 'does not take more than' = left; mean 48, sd 8, z = 1.5 because Phi(1.25) sits on a rounding tie) are choice gates.
- New items: q.0012 (practice, difficulty 4, 3 + 4 + 2 = 9 marks, the 2022/2023 chain on cucumbers: mean 32, sd 2.5, P(L < 36.25) = 0.9554, P(L < 28.75) = 0.0968, given = 0.1013; routes wrongTail 0.0446, zFormula swapped 0.8531 and 0.7939, negative 0.9032, fm.condprob.subset-event-multiplied 0.0968, fm.prob.independence-assumed 0.0925; both ids already registered by the FM3 B author, cited to 2022 Q7 and 2023 Q5); rp.08 (given that). 0012 sits in the mixed tail as the neighbouring-topic item. 0001's extract and we.01's figure re-emitted phone-native.
- Checks: frozen-surface 33 checked, 0 differences, 4 additions; lesson-v2 --depth "meets the floor", no slides/figures/maths lines; content:check exit 0 (183 bundles, 0 problems, 0 key-word warnings; lesson-v2 183 notes 0 breaches); check-marking 1031 assertions OK (normal 367, 10 gates); verify-published 90 routes OK; bare-tex 933 segments 0 defects; figure-leaks: only the known REVIEW line on 0001(a); shingles: no normal breach; svg-draws 0; gate-context 0 without a visual; text-parts 0/0; insights unregistered none for fm; insights:validate OK.

### Depth pass 3 of 3 done: pascals-triangle-binomial-expansion (23 Sep 14:25)

After the pass: bundle fcbd5ecbd66aebba / 183763 B, note 6d436701d7cbbd07 / 24196 B (14:24:23). This is also Pascal's first full finish-check run (its 13:38 version had only check-marking, verify-published and bare-tex).
- Note (L): 7 sections with roles (idea: a triangle made by adding; idea: rows numbered from 0; why: the Plinko board, moved up, "Why the numbers count routes"; variant x3: the powers fall and rise, a minus sign in the bracket, a number in the bracket; see), 7 gates (new g7: the coefficient of p^2 q^3 in (p - q)^5 is -10), 3 phone-native figures (the triangle to row 8 with two sums, the triangle to row 6 with row 5 banded, the powers table of (p + q)^4); the (1 + 2x)^4 table figure is now prose lines; 663 words, note 8 min. The twist lives in the pointer: 2026 gave the triangle to row 6 and asked for rows 7 and 8 first.
- Shingle fixes (the only breaches in fm3): 0001 "Complete rows 7 and 8 of Pascal's triangle in the grid", 0002 and 0003 "Use Pascal's triangle to write down (p + q)^n in expanded form" (verbs kept, so the frozen skeletons still read true). 0001 and 0007 grids re-emitted phone-native.
- Checks: frozen-surface 23 checked, 0 differences, 1 addition (g7); lesson-v2 --depth "meets the floor"; content:check exit 0 (183 bundles, 0 problems, 0 key-word warnings; lesson-v2 0 breaches; depth line L 1 of 35, S 2 of 76 = mine); check-marking 1034 assertions OK (Pascal 166, 7 gates); verify-published 90 routes OK; bare-tex 950 segments 0; shingles --unit fm3 "No breach"; figure-leaks nothing on Pascal; svg-draws 0; gate-context 0 without a visual; text-parts 0/0; insights unregistered none for fm.

Next: author normal-distribution-bell-curve (L) to the depth floor from the start (statement FM3-NOR-01, order 11, prerequisite fm.u3.mean-and-standard-deviation; examiner source 2019 Q5; videos P McAleavey 2WKfG8c3J74 and TLMaths lEyudll0Oko; Plinko).

### Topic 4 published: normal-distribution-bell-curve (L), 23 Sep 14:41, authored to the depth floor

bundle 4faa8fdff4aba294 / 190654 B, note cfe176635666ce14 / 40141 B (14:40:54). we 1 · dx pre 3 + post 4 · q 7 (6 practice + 1 exam-style, 13 marks) · ftm 1 · rp 5 · no insight card (none exists for FM3-NOR-01) · set 1 · ver 17; note 7 sections (idea x3: one shape; where the bell comes from; mean, median and mode; why: the Plinko board; variant x2: within one or two standard deviations, one side of the curve; see: the flour sketch in five lines + P McAleavey 2WKfG8c3J74), 7 gates, 6 phone-native figures (bell, histogram to curve, bell beside a skewed income curve, the banded 68/95 curve, the one-tail 16% figure, the flour sketch) + the Plinko sim + the video; 677 words, note 8 min. The twist lives in the pointer: no paper sets the shape alone; it arrives inside the normal question, the mean and SD are given (2019: a fifth blank or reached for the SD formula).
- Items: 0001 identify the roughly normal variable (mcq), 0002 identify the normal sketch among four computed shapes (mcq, letters only in the figure), 0003 the 95% figure (range 95-95.5, routes 68 and 99.7), 0004 lower end of the middle 95% for apples 152/9 (134; routes 143 one SD, 152 one-sided), 0005 % heavier than 161 g (16, range 15.8-16.2; routes 34 band, 32 not halved, 84 below), 0006 a 5.0 kg newborn is very unusual (mcq), 0007 exam-style boys 176/7 (a) median 176 (b) h = 162 (routes 169, 176) (c) 2.5% (range 2.2-2.6; routes 5, 47.5) (d) show that 197 cm is unusual (text, key "three standard deviations"); we.01 women 164/6 middle 95% (152 to 176; twin leaves 8.2/0.9 lower end 6.4; faded backward [3|4], [2|3,4]); ftm.01 babies: the 32% outside one SD not halved (fix: 32 / 2 = 16%).
- Registry: MX fm.normal.proportion-misread and fm.normal.interval-one-sided (both FM3-NOR-01, source 2019 Q5, notes say evidenced by analogy only); insights:build + validate OK. Also uses fm.normal.sd-formula-used-instead (d4 option) and fm.normal.tail-not-subtracted (0005's 84%).
- Checks: my assertDepth + lesson shape + lint passed in the generator; lesson-v2 --depth "meets the floor"; content:check exit 0 (184 bundles, 0 problems, 0 key-word warnings, no FIGURE line on fm3; lesson-v2 184 notes 0 breaches); check-marking 1233 assertions OK (bell curve 190, 7 gates); verify-published 102 routes OK; bare-tex 987 segments 0; figure-leaks fm3 0 leaks (1 REVIEW, normal-z 0001(a)); shingles "No breach"; svg-draws 0; gate-context 0 without a visual; text-parts 0/0 (its 1-mark text part is covered by check-marking); insights unregistered: none for fm; long-maths 0 on all four. Frozen surface recorded for later passes: published-normal-distribution-bell-curve.json (24 items).

### Engine change noticed mid-run (23 Sep 14:36, src/components/items/mistake-marking.ts, not mine)

The fix box now uses markFix/resultValue: a bare value is the fix only when the last correction line ends on a value (after its last "=") that her working does not already state. check-marking.mts now tests markFix (correction lines not already on the page, her own lines refused, the value route only where it applies). Consequences: Pascal ftm.01 (last line an expansion) is fixed by typing a line, which is right; the bell-curve ftm.01 last line was rewritten to end on its value ("Heavier than 3.9 kg: 32 ÷ 2 = 16%") so "16" and "16%" are accepted; normal-z ftm.02 cannot be helped by content: its frozen working states 0.9554 as the table value on line 2, so the correct bare value 0.9554 is refused and she must type the corrected line. Reported to the lead.

## Done (23 Sep 14:42)

All four topics are published and meet their band's depth floor; every finish check is green. Nothing left undone in this batch. Next step for whoever resumes: none required; if the lead wants the binomial note nearer the 950-word guide (1052 now, 11 gates, 9 of them published and frozen), trim the Plinko and conditions paragraphs.

## Superseded: in progress (23 Sep 13:40, after the usage-window pause)

pascals-triangle-binomial-expansion (L): a first version was written at 23 Sep 00:00:02 (bundle ef4986fb59ade400 / 183125 B, note d1e7993be8411b4d / 27428 B) and is UNVERIFIED. Since then the generator gained the Summer 2024 FM1 Q6 source for the (2x) slip (registry MX fm.binomial.bracket-number-not-raised now cites it; insights validate OK) and a longer notonspec callout, which pushed section 4 to 127 words (limit 120), so the last run did not write. Registry also has fm.binomial.triangle-not-written and fm.binomial.negative-term-signs-lost (MX). check-marking (925 assertions) and verify-published (81 routes) were OK on the 00:00 version.

## Next step

Trim section 4 of the Pascal note, regenerate, run every finish check, record hashes here. Then author normal-distribution-bell-curve (L).

(Superseded plan text follows.) Author pascals-triangle-binomial-expansion (L): contexts and routes (wrong row, triangle not written, signs omitted for a negative term, powers not summing, coefficients dropped) in routes.mjs; figures from stat.mjs triangleSvg / binfig pascalGridSvg re-sized to ~480 wide; generator pascals-triangle-binomial-expansion.mjs with algebraic answers (equivalence "equivalent", form "expanded"); publish; every finish check; update this file. Then normal-distribution-bell-curve (L).
