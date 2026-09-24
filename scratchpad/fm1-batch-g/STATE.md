# FM1 batch G — fix-pass state, 22 Sep 2026 (resumed agent; older state below is the 20 Sep record)

## 23 Sep evening — jobs 3, 4 and 5 from the lead, ALL DONE 19:56 (pilot accepted; eight proposals went to the standard's owner)
- JOB 3 (started 18:55, DONE 19:20, see below): the eight FM1 topics that ship no diagnostics, mistakes or prompts (area-under-curve,
  indicial-equations, log-log-graphs, logarithms-from-indices, matrix-arithmetic, matrix-inverse-2x2,
  matrix-equations, matrix-simultaneous-equations). Add verification logging to each generator on the laws pattern,
  re-emit, content:check must show each one's dx/ftm/rp shipping; every finish check and the batch marker probes over
  the newly shipped items; treat them as unverified and re-read them as the student. Report counts before/after and
  hashes. BEFORE (shipped / in bundle): all eight ship dx 0 · ftm 0 · rp 0; in the bundles: area 8·1·7, indicial
  7·1·6, log-log 8·1·7, logs-from-indices 7·0·5, matrix-arithmetic 7·1·6, inverse 8·1·7, equations 8·1·8,
  simultaneous 8·1·8. Every generator re-run at 15:07 reproduced its published bytes (bundle hashes 695396ae2a751af2,
  8e545e101ffa34ad, afc39d267339c9f8, e112645bda80bcf8, 3c9fa2d44ca14296, a1a5cd97e798e946, 838070e4d03a142c,
  8bf7e1ac1a000814). Backups of all 16 files and the 8 generators: scratchpad/fm1-batch-g/bak-0923-logs/.
  JOB 3 DONE 19:20. content:check now ships all eight: area 8/1/7, indicial 7/1/6, log-log 8/1/7,
  logs-from-indices 7/0/5, matrix-arithmetic 7/1/6, inverse 8/1/7, equations 8/1/8, simultaneous 8/1/8 (dx/ftm/rp).
  FINAL hashes 19:55 (bundle | note, notes byte-identical to before; superseding the 19:20 ones, which changed only
  in log stamps and the log-log engine-gap list): area 1b75753360a60eec 287113 B | 7dccb2ad4e52ad1a; indicial
  6d4c3aa8f49830bd 114576 B | 6f81d5e4478e51b0; log-log af2a68c7154a359b 178975 B | 7e495791b9042c67;
  logs-from-indices 21c24d4b894a6c87 104103 B | a3a0994c93d439a3; matrix-arithmetic baa365e3806418ee 139513 B |
  32c7082c526601f3; inverse 784dc7f2dd3dabf5 155838 B | bcf3c3d2c628fe17; equations 7bcc082a3d809d54 164921 B |
  73224e2393ca0f28; simultaneous 20b71497c1046ed8 158110 B | 66110f56aac0b851.
  What changed (diff-job3.mjs vs bak-0923-logs: no log removed, every note byte-identical): +77 logs (dx sets,
  ftm, rp) via draftLogs() in both batch libs (SHIP_AT 2026-09-23T18:20:00Z; the ftm log names its own engine gaps
  from engine-fix-gaps-0923.json); batch G lib TOOL text named batch F's directory and library (copied): now batch
  G's, so the existing matrix logs changed in their tool field only; batch F verifier sentence now says only the
  TAGGED numeric distractors are route-matched (fix-f-verifier.mjs). Content fixes from the read-through: indicial
  post d1 c retagged fm.logs.power-as-multiplier-inside; area post d4 b, c -> new registry id
  fm.int.limits-not-from-the-question (further-maths.mjs; insights build/validate OK); corrections re-laid so the
  fix box reads them: log-log ftm.01 ["intercept = log k, so k = 10^0.602 = 4.0", "F = 4.0 h^1.5"] (12 shapes
  tried: one step per line refused "k = 4"); indicial ftm.01 division on its own line; simultaneous ftm.01 four
  lines ending "X = (x ; y) = (3 ; 2)" (the original "so x = 3 and y = 2" let her own values count as the fix).
  Checks: probe-drafts-0923 538 ok 0 FAIL + 11 engine refusals of right fixes (listed in engine-fix-gaps-0923.json:
  "A^-1" not read as "A inverse", "10^0.602" not a value, decimals vs fractions in a matrix, "units²"); batch F
  check-marking 223/0, verify-published 113/0, probe-logs-0922 40 ok 1 FAIL (engine item B, unchanged); batch G
  check-marking 284/0, verify-published 85/0, probe-fixpass-0922 138/0, printed arithmetic 99/0 (eight slugs);
  content:check 184 bundles 0 problems; lesson-v2 184 notes 0 breaches; figure-leaks fm1 0 leaks (4 review = trig
  q0003, known); shingles fm1 no breach; FM ids all registered (8 unregistered are science); keyword-soft 0/0;
  text-parts 0/0 of 528; svg-draws 2060/0; gate-context 0 without a visual. Left untagged (no fitting id):
  matrix-arithmetic post d1 c (B - A offered for A + B), inverse post d5 b (additive inverse).
  FOUND (engine, for the lead): the fix box treats matrix products as commuting: with "X = A^-1 B" as the
  correction, "X = B A^-1" (the very misconception of matrix-equations ftm.01) is accepted, so the word form stays.
- JOB 4 (fix pass, may change frozen fields): laws WE01 and WE03 carry four mark codes against 3-mark and
  2-mark tariffs: rebalance to the scheme through the generator, twins included; algebraic-fractions-simplify ftm.01
  "(x)" -> "(x - 4)". Also keep the two restored "copy" gates (afs g5/g6) clean.
  DONE 19:56 (edits 19:50; final checks and stamps below): backups + frozen snapshots in bak-0923-job45/
  * laws (scratchpad/fm1-batch-f/laws-of-logarithms.mjs): WE01 earns [M1],-,[M2],[W1] (q0005's 3-mark scheme, and
    Summer 2025 Q9(a)'s 3); WE03 earns [M1],-,[M2],[W1] (q0010's 3-mark scheme for the same task; kept at 3, not 2,
    because log 2 has to be built, which 2023 Q7(a) did not need); WE03 twin log 18 = m + 2n (q0015(a) word for word,
    a 2-mark task) -> log 4.5 = 2p + q - 1 (FOUR_FIVE, same shape, bracket slip separates). Logs re-stamped FIX_AT
    with a tariff check each. Frozen: exactly we.01 and we.03 CHANGED. probe-depth-laws extended (twins, earns).
    NOT CHANGED, for the lead: WE01's twin is q0005 word for word and WE03 is q0010 word for word.
  * afs ftm.01: scripted edit FORK_SP/fm1-batch-a/fix-ftm01-bracket.mjs (idempotent, byte identity asserted):
    line 3 and correction line 2 "Cancel (x)" -> "Cancel (x - 4)"; correction's last line "Answer 3x" -> "Answer: 3x"
    (the fix box refused "3x" typed alone; now reads it); one human-spot check appended to its log. Root cause fixed
    in topic1.mjs (FTM1_BRACKET); gen.mjs now refuses to overwrite any of the four batch A topics (all four differ
    from their stale generators; proven: 0 bundles written, hashes unchanged). probe-afs-ftm01.mts 22 ok 0 FAIL.
    Frozen: exactly ftm.01 CHANGED.
- JOB 5 DONE 19:56 (edits 19:50; final checks and stamps below):
  * laws q0021 (tail-only): log_2 x + log_2(x + 2) = 3 -> x = 2 (-4 rejected), 4 marks, specRefs + FM1-LOG-01,
    emphasis mixed-tail, last in questions[], in the mixed set (8). CEs: sum inside -> 3, base times index ->
    -1 + root 7 (tolerance 0.005), both roots kept (text). --depth: "meets the floor", tail-only 1 (1 neighbouring).
    batch F verify-published "laws-tail-routes" added; check-marking TEXT_PROBES_BY_PART added.
  * tangents q0020 (tail-only): dy/dx = 3x^2 - 2x - 1 through (1, 1), tangent at x = 2 -> y = 7x - 10, 5 marks,
    specRefs + FM1-INT-01, FM1-INT-02; CEs constant omitted 7x - 12, point into gradient 7x - 11, height from dy/dx
    7x - 7, dy/dx differentiated again 10x - 13, constant slip 7x + 18. --depth: "meets the floor". batch D
    verify-published gained integrationLines (re-integrates the printed gradient function; all 126 CEs attributed).
    Frozen: 0 differences, 1 addition. probe-depth-tangents 186 ok 0 FAIL.
- JOBS 3, 4 AND 5 DONE 19:56. Stamps set to when the checks ran (SHIP_AT 18:20Z, laws FIX_AT 18:45Z and TAIL_AT
  18:50Z, tangents TAIL_AT 18:55Z, afs 18:55Z), every generator re-run, diffs only as recorded above. Final suite
  scratchpad/fm1-batch-g/finish-0923-evening.sh -> finish-0923-evening-final2.txt (18:55:03Z-18:55:46Z): content:check
  184 bundles 0 problems; lesson-v2 184 notes 0 breaches; laws H5 and tangents H4 "meets the floor" (tail-only 1 each,
  from a neighbouring statement); frozen: laws we.01 + we.03 CHANGED (the fix pass) + 1 addition, tangents 0 + 1
  addition, afs ftm.01 CHANGED (the fix pass); probe-depth-laws 267/0, probe-depth-tangents 187/0, probe-afs-ftm01
  22/0, probe-afs-gates ok, probe-drafts-0923 537/0 + 12 engine refusals; batch F check-marking 234/0,
  verify-published 115/0, probe-logs-0922 40/1 (engine item B, unchanged); batch G check-marking 284/0, verify 85/0,
  probe-fixpass 138/0, printed arithmetic 122/0; batch D check-marking 888 OK, verify 175 values + 126/126 CEs;
  batch A check-marking 1220 OK; figure-leaks 0; shingles no breach (q0020's first stem shared paper runs; reworded);
  FM ids all registered; keyword-soft 0/0; text-parts 0/0 of 528; svg-draws 0; gate-context 0.
  FINAL hashes: laws 4ac56be9aa6793cb 316681 B | b85d0ae6f1284554; tangents 3704909c6bc634de 527490 B |
  cee31114d84772a1; afs d25f6034f4c3e41f 162809 B | 45b860aee9e4d911.
  ENGINE (src/ not mine; for the lead): mistake-marking.ts changed at 19:49 local (engine agent) and since then
  refuses "log k = 0.602, so k = 4" for log-log ftm.01 (accepted at 19:30); moved to engine-fix-gaps-0923.json.
  NEXT STEP: none in these briefs; report sent to the lead.
- JOB 5 (brief, received 19:05; progress in the entry above): the standard now requires, for H bands, one tail-only
  item per topic (a practice question that is not a ladder rung, LAST in questions[], "mixed-tail" in emphasis, its
  method from a neighbouring statement named in specRefs; see "Depth standard" section and
  docs/plan/review/2026-09-22-depth-standard.md section 9 refinement 4). Add one to laws-of-logarithms and one to
  tangents-and-normals through their generators, marker-checked, frozen surface unchanged, both pilots "meets the
  floor" on --depth.

## 23 Sep — two new jobs from the lead (depth standard)
- JOB 1 DONE 13:43: fm1/algebraic-fractions-simplify g5 and g6 restored by scripted JSON edit
  (FORK_SP/fm1-batch-a/fix-g5-g6-dx04.mjs; batch A's topic1.mjs is stale, so no generator re-run). Cause, found by
  g5g6-original.mjs: topic1.mjs built the "unfinished line" prompts with routes whose Frac.latexAnswer() cancels before
  printing, so they collapsed to the answer on 13 Sep (not a later simplify pass). Restored: g5 "Is 6/(3(x-3)) fully
  simplified?", third option "6/(3x-9)"; g6 "Erin has reached 3x^2/x"; post-check item 04's stem had the same collapse
  ("Kara has reached 2/(x-3)") and is restored to 6/(3(x-3)). Answers, ids and options otherwise untouched; every other
  byte asserted unchanged; frozen surface 29 items 0 differences; markGate marks exactly each answer.
  bundle 526e51efce6d6f2a 161902 B, note 45b860aee9e4d911 10891 B. content:check 183 bundles 0 problems.
  NOT FIXED (frozen, report to lead): ftm.fm.u1.algebraic-fractions-simplify.01 line 3 "Cancel (x)" and its correction
  "Cancel (x), then cancel the x" should both say (x - 4) (same generator: FTM1.cancelled[0] is x); studentWorking is
  frozen, so it needs the lead's call (edit in place, or withdraw and re-add under a new id).
- JOB 1 ADDITION DONE 13:59 (coordinator: lint the class, fatal): scripts/qa/lesson-v2.mjs gained selfAnsweringGate()
  under the "gates" check (header doc line, helper after orphanGates, call after the orphan-gates line in checkNote).
  Fatal when a gate offers the same option text twice (whitespace squashed), or when its answer claims a change
  ("No"/"Not" opening, or becomes/giving/gives/simplifies to/cancels to/leaves) and its result, the answer's last
  maths span, is a whole maths span of its own prompt. Measured first on 183 notes / 1454 gates: literal
  answer-in-prompt would flag 98 legitimate gates and last-span-in-prompt 11 ("which of these" gates), so the change
  claim is what defines the class; with it the published corpus flags 0. Proof: scratchpad/fm1-batch-g/gate-lint-proof/
  proof.sh -> published corpus "183 note(s) checked, 0 breaches"; scratch copy of the broken pair (bak-0923) ->
  3 breaches (g5 option twice; g5 lands on 2/(x-3); g6 lands on 3x), exit 1.
  FOUND ON THE WAY (engine, for the lead; not fixed, src/ is not mine): markGate compares choice options through
  normaliseText, which drops brackets and case, so fm1/indicial-equations g3 marks the bracket-dropped wrong option
  "4x + 1 log 2 = x + 3 log 7" RIGHT (the very error the gate tests) and science b2/b2-monohybrid-genetics g6 marks
  "it is BB" RIGHT; both then show two "Correct answer" ticks. Probe: gate-lint-proof/probe-choice-marking.mts.
  Fix belongs in gates.ts (a tapped choice compared to the answer exactly), not in the packs.
- JOB 2 DONE 15:05: depth-pass pilot, laws-of-logarithms (H5) then tangents-and-normals (H4). Both "meet the floor".
  Final (15:03): laws bundle 77c372b89b1f2291 304644 B / note b85d0ae6f1284554 36971 B; tangents bundle
  669eb76e2b54d4ad 511226 B / note cee31114d84772a1 49732 B. content:check 184 bundles 0 problems; lesson-v2 184 notes
  0 breaches. Before/after reports: depth-pilot/{laws,tangents}.depth.before.txt and
  depth-pilot/{laws-of-logarithms,tangents-and-normals}.depth.after.txt. Next step: none in this brief; report sent.
  * laws-of-logarithms DONE 14:41 (generator scratchpad/fm1-batch-f/laws-of-logarithms.mjs; pre-pass copy in
    depth-pilot/bak-laws-of-logarithms/). Published: bundle 77c372b89b1f2291 304644 B, note b85d0ae6f1284554 36971 B.
    Frozen surface: 43 frozen items, 0 differences, 16 additions. --depth: "meets the floor · roles labelled · note
    17 min, topic about 147 min" (before: 16 short, unlabelled, note 9 min); saved in depth-pilot/laws.depth.after.txt.
    Note: 14 roled sections (idea x4, why, variant x5, see, twists, further, derivation), 15 gates (g9-g15 new,
    g1-g8 prompts rewritten to stand alone, answers untouched), 1283 words, 8 visuals: seven new phone-native SVGs
    (400 viewBox, labels 14-16; the powers-of-ten ruler, hops for the product/quotient/"in terms of", the 2x cube,
    the sort-above/below-the-line figure, the log/log line) plus the video; the eight text-card SVGs are gone.
    Added: we 04 (2 log y = log x + log 9 -> y = 3 root x; twin y = 2x^(2/3)), we 05 (base-3 expansion, the 2022
    shape; twin base 5), q0017 synoptic (3+2+1+4 = 10 marks, the 2019 show-then-hence at full length, method lock
    on CER19), q0018 (log_2 72 = 3 + 2k, d4), q0019 (y = log 8, z = log 1/4 -> y = -3z/2, d5), q0020 context (wind
    turbine P = kv^n, 2+3+2), ftm 04 (the 2018 bracket finding), rp 11 (derivation), rp 12 (log_b b = 1), set
    "mixed" of 7 (q0020 is the neighbouring-topic item). Questions now run as a ladder (d1..d5, then exam-style).
    FOUND AND FIXED IN MY TOPIC: content:check shipped laws as "dx 0 · ftm 0 · rp 0": batch F/G generators never
    logged diagnostics, find-the-mistake items or prompts, so the build kept them as drafts and the learner never
    saw them (nor the note's embedded prompts). Laws now logs all of them: "dx 11 · ftm 4 · rp 12". The same
    gap stands in 8 other FM1 topics (area-under-curve, indicial-equations, log-log-graphs, logarithms-from-indices,
    matrix-arithmetic, matrix-equations, matrix-inverse-2x2, matrix-simultaneous-equations) - REPORT TO LEAD, not
    touched. Engine A landed in mistake-marking.ts (markFix) at 14:31, so ftm 02 ships too; engine B still open.
    Checks: frozen 0 diff; probe-depth-laws 218 ok 0 FAIL; batch-F check-marking 223/0, verify-published 113/0
    (laws-depth-routes added); printed arithmetic 23/0; content:check 0 problems; lesson-v2 fm1 0 breaches;
    figure-leaks 0; shingles no breach; FM ids all registered; keyword-soft 0; text-parts 0; svg-draws 0;
    gate-context 0 orphans. probe-logs-0922: 40 ok, 1 FAIL = engine item B (unchanged, engine agent's).
  * tangents-and-normals DONE 15:03 (generator FORK_SP/fm1-batch-d/gen-tangents.mjs; pre-pass copies of it and of
    calc.mjs in depth-pilot/bak-tangents-and-normals/). Frozen surface: 43 items, 0 differences, 11 additions.
    --depth: "meets the floor · roles labelled · note 15 min, topic about 139 min" (before: 11 short, unlabelled,
    3 headings over 8 words, 1 visual back to back, 12 of 12 figures with labels at 7.0 px on a phone).
    Note: 12 roled sections (idea, why, variant x5, see x2, twists, further, derivation), 13 gates (g9-g13 new;
    g1-g8 untouched), 1055 words, 9 visuals; the two text cards (four steps, gradient table) are prose now; every
    graph re-drawn phone-native through a new opt-in `phone` option in batch D's graphSvg (labels 14-15, curves by
    Ramer-Douglas-Peucker: the old thin() drew them as a few chords); new figures: the tangent-meets-normal graph and
    the turned gradient step (the derivation of -1/m). One examiner callout in the body (2025 Q13).
    Added: we 04 (a stated gradient, the 2025 Q13(i) shape, 5 marks), q0017 (d5: a from a stated normal gradient),
    q0018 (d1: gradient from a gradient function), q0019 (d4: the 2018 horizontal tangent, y = 2x + 8/x, x > 0),
    ftm 04 (the 2025 Q13 dy/dx = 0 habit), rp 11 (derivation), set "mixed" of 6 (q0019 = the stationary-point
    neighbour), CER18 Q7 added to examinerSources with its trap. Stems reworded to "this curve" / "that tangent" after
    shingles.mjs caught nine paper runs in the first draft (now: no breach).
    Checks: frozen 0 diff; probe-depth-tangents 165 ok 0 FAIL (markFix on all 4 ftm); batch-D check-marking 871 OK;
    batch-D verify-published 168 re-derived, 121/121 commonErrors attributed (two curve-less route families added);
    lesson-v2 0 breaches; figure-leaks 0; shingles no breach; FM ids all registered; keyword-soft 0; text-parts 0;
    svg-draws 0; gate-context 0 orphans; figures rendered at 358 px and read (figs/tangents/*.png in my scratchpad).
  * Open for the lead (not fixed, outside this brief): (1) 8 FM1 topics ship no diagnostics, find-the-mistake items
    or prompts (no verification logs); (2) engine C: markGate compares choice options through normaliseText
    (fm1/indicial-equations g3, science b2-monohybrid-genetics g6 mark a wrong option right); (3) engine B still open;
    (4) laws WE01/WE03 twin tariffs (frozen earns); (5) afs ftm.01 "(x)" for "(x - 4)" (frozen studentWorking);
    (6) batch D's other three generators draw curves with thin() (chords) and 11-unit labels: phone option ready.

Standard acknowledged (STANDARDS.md, 22 Sep 23:05): every finding re-verified on disk and re-marked through markAnswer, maths re-derived, whole bundle re-read as she would read it before filing.

## 22 Sep fix pass — live status (update after every step)

- Disk at 22:59: all four matrix topics and laws-of-logarithms published; every generator re-run unmodified
  reproduces its bundle byte for byte (baseline hashes: matrix-arithmetic 847dd33ed192c19f / 2f478706c80f1e9d,
  matrix-inverse-2x2 2a4eede08f5b18c0 / 22c427d9556d7f4b, matrix-equations bdab5f28f040702e / 49cff3ed999575b5,
  matrix-simultaneous-equations dd5f4b8114380f7b / b618e6dde7fe7efc, laws-of-logarithms 95f13359b98eeb21 / e3eced6ce8c25ea9).
  Backups of all ten files: `scratchpad/fm1-batch-g/bak-0922/`.
- Found on disk: MA-1..MA-5 applied (in matrix-arithmetic.mjs, 20 Sep 21:14). MI-1, MI-2, MI-3, MI-5, MI-6 NOT
  applied (matrix-inverse-2x2.mjs untouched since 20 Sep 16:20). MI-4 waived by the lead (scalar box landed in MatrixField).
- Probe: `npx tsx scratchpad/fm1-batch-g/probe-fixpass-0922.mts` (every MA/MI finding through markAnswer).
- Registry (23:18): further-maths.mjs gained fm.matrix.reciprocal-sign-dropped, fm.matrix.equation-undone-wrongly,
  fm.matrix.coefficient-matrix-misformed (all MX, CER-sourced); subtract-wrong-way label broadened + honest note;
  2024 Q6 card wentWrong drops "two of three" (logs D). insights:build + validate OK (273 FM ids).
- matlib.mjs: DET_NEGATIONS + singularKeyWords(name) (3 groups with rejects) for every "explain why no inverse" part.
- DONE 23:22 matrix-inverse-2x2 republished: bundle 1f62ad1163683a8e 129707 B, note bcf3c3d2c628fe17 21699 B.
  MI-1 (q0008 CE retag products-added + route executed + feedback), MI-2 (d1 '11' retag), MI-3 (d5 add-option untagged),
  MI-5 (q0009(c) singularKeyWords("H")), MI-6 (both WE step 4 earn nothing; twins out of 3), plus own finds:
  q0003(c) "det S = 0 + 12" -> "12 + 12 = 24" products-added; q0002 worked line "5 take away 8" -> "3 - 8";
  WE02 step 1 "both products are negative" (false) rewritten; note block 6 printed a ZERO matrix for (a b; c d);
  d4(b) + ftm tag -> reciprocal-sign-dropped; q0005 setting text; verification texts made true.
  content:check 0 problems 0 KEYWORDS; probe 54 ok 0 FAIL; check-marking 285/0; verify 80/0; batch-F verify 109/0
  (d3 route added to batch-F verifier: -36 is F(-3) - F(3)).
- (23:30) naming key word now "matrix H"/"matrix S" first so a 1-mark answer reads "still missing matrix H".
  matrix-inverse-2x2 now bundle ff509849e781b16a 129707 B, note bcf3c3d2c628fe17 21699 B.
- DONE 23:31 matrix-equations republished: bundle 838070e4d03a142c 136617 B, note 73224e2393ca0f28 22354 B.
  q0009(c) singularKeyWords("S"); WE01 shape check earns nothing, det+inverse = MW1,M2; WE02 plan line earns
  nothing, MW1 = B - C, M2 M3 = inverse + X = A^-1(B - C); WE02 twin was A + X = B (2-mark task out of 4) -> new
  AX + C = B twin (A=(5 2;2 1), C=(2;1), B=(15;6), X=(3;-1)); q0005 scheme -> det, inverse, order, answer so the
  ftm's MW1,M2 and the CE's 2/4 agree; ftm feedback no longer promises follow-through on a wrong order; q0009(b)
  BA^-1 CE 1 -> 0 (order mark lost, product mark depends on it); 7 mis-tags -> fm.matrix.equation-undone-wrongly
  (q0003 b,c; post d1c d2c d3c d4b d4c; CE q0008 + q0010(b) also source 2024 -> 2018); section-5 figure replaced
  (it showed A^-1 B = X right under "going straight to A^-1 B solves a different equation"); 2018 callout no
  longer says "almost everyone"; In-the-exam and tariff sentences no longer claim the equation "follows a part
  that asked for an inverse"; traps: 2019 Q5 cited (clears the lesson-v2 warning), two 2022/2024 misattributions
  removed, 2024 Q7 trap rewritten to what the report says.
  verify-published now re-solves every WE twin from its own stem (86 checks, 0 findings).
- DONE 23:33 matrix-simultaneous-equations: bundle 8bf7e1ac1a000814 129648 B, note 66110f56aac0b851 21788 B.
  q0008 key words -> det / 0 (negations rejected) / consequence group worth 2 (scheme accepts "singular",
  "parallel" earn 1 alone); 7 mis-tags (post d1 b,c; d2 b,c; CEs q0001 x2, q0002) -> fm.matrix.coefficient-matrix-
  misformed; q0005 MW1 printed a ZERO column for (x; y) -> fixed; q0010(a) accepts the equations in either order;
  2023 Q6 trap now says what the report says; "Nothing is rearranged" (contradicted section 2) reworded; In-the-
  exam, examWeightHint and howExamined no longer claim an unverified CCEA mark split or that the type "is due".
- DONE 23:34 matrix-arithmetic: bundle 3c9fa2d44ca14296 115900 B, note 32c7082c526601f3 21476 B.
  q0001's "A - B" CE deleted and post d1(c) untagged (subtracting where a sum was asked is not a subtraction the
  wrong way round); note: "A + C does not exist because there is no entry of C opposite the bottom-right entry of
  A" (false) -> "the third column of C has nothing in A to pair with"; "Multiplication ignores positions entirely"
  -> "does not work position by position"; "Matrices open the paper" (true only 2019 and 2025) corrected in the
  panel, examWeightHint and howExamined; scheme description now the 2025 scheme's M1/W1.
  MI also: examWeightHint/howExamined now "The Summer 2019 scheme gave two MW marks for the inverse".
- Matrix finish checks 23:35: content:check 168 bundles 0 problems 0 KEYWORDS; lesson-v2 fm1 0 breaches (3 warnings,
  none on matrices); figure-leaks 0 leaks 5 review; shingles no breach; keyword-soft 0/0; text-parts 0/0 of 484;
  svg-draws 1884/0; gate-context 0 without visual; check-marking 284/0; verify 85/0; probe 125 ok 0 FAIL;
  printed arithmetic 93/0; FM ids all registered.
- DONE 23:45 laws-of-logarithms (generator scratchpad/fm1-batch-f/laws-of-logarithms.mjs): bundle 4e9373a6a24e0ab0
  199042 B, note d560c58fb6a0e8ee 25869 B. C: q0016(c) gains a whole-answer text CE (both roots kept, 3/4, tag
  fm.qin.context-not-applied, no source claimed); D: note callout and insight card drop "two of three"; own finds:
  g4 explain "where the last mark usually goes" and "putting it on top is the slip the 2025 report names" (the report
  names the swap, its example the other way) reworded; "reported as the hardest question" (2022) -> "one of the most
  challenging"; scheme description now the 2024 scheme's M1 M1 W1; trap added for 2018 Q6 (brackets, clears the
  lesson-v2 warning). Probe: scratchpad/fm1-batch-f/probe-logs-0922.mts 37 ok, 2 FAIL = engine items A (ftm02's
  mistake line still passes fixMatches by value; ftm01 and ftm03 now refused) and B (q0006 "2 + log x" still told
  "a number in front of the log") - src/, not editable here.
- DONE 23:37 figure-leak triage (lead's task 3): 5 review lines, all trig-graphs-sin-cos-tan (batch C). Real leaks:
  q0002(b) figure printed "(180, -1)" (its answer); q0008(a)(b) figure printed "36.9" and "143.1" (both answers).
  Fixed in FORK_SP/fm1-batch-c/gen-trig-graphs.mjs with unannotated question copies (cosFigureQ, readOffFigureQ, also
  used by q0007); rendered to PNG with sharp and looked at: readable on the 30-degree grid within the 5-degree
  tolerance. Not a leak: q0003's "270" (axis tick + a title describing the drawn asymptotes). figure-leaks now 0 leaks,
  3 review lines. trig-graphs bundle 94ee8e250f4e904d 404915 B (note unchanged). Batch C STATE.md has a note.
- 23:44 laws-of-logarithms reworded once more: "one of the most challenging questions on the paper" was an 8-word run
  of the 2022/2025 reports (shingles breach) -> "which the report placed among the hardest questions that year".
  Final: bundle e0b19dc76a568e70 199039 B, note d560c58fb6a0e8ee 25869 B.
- FINAL CHECKS 23:45: content:check 171 bundles, 0 problems, 0 KEYWORDS, 0 FIGURE lines in fm1; lesson-v2 fm1 0
  breaches, 2 warnings (solve-three-simultaneous-equations 2023 Q11, tangents-and-normals 2022 Q8: not my topics);
  figure-leaks fm1 0 leaks / 3 review (q0003 tan, judged not a leak); shingles fm1 no breach; FM ids all registered;
  keyword-soft 0/0; text-parts 0/0 of 493; svg-draws 1927/0; gate-context 0 without a visual; insights:validate OK;
  batch-G check-marking 284/0, verify 85/0, probe 125/0; batch-F check-marking 193/0, verify 109/0, logs probe 37 ok +
  2 engine FAILs (A, B); printed arithmetic 93/0.
- STATUS: ALL FOUR QUEUE ITEMS DONE. Nothing half-written. NEXT STEP: none in this folder; waiting on the lead for
  (a) engine items A (fixMatches value fallback still passes ftm02's mistake line) and B (q0006 form sentence for an
  added constant) in src/; (b) a decision on matrix-inverse q0005/q0009(a)/WE twins at 3 marks where CCEA 2018,
  2019 and 2025 gave the inverse 2; (c) other owners' defects found by check-printed-arithmetic.mjs: tangents-and-
  normals q0011 worked line "y = 8 - 2 + 3 = 6" (x = 1.5 gives 4.5 - 1.5 + 3), trig-equations q0005 CE feedback
  "60 - 360 = -60 and 300 - 360 = -300" (the results are swapped).
- LEAD'S DECISIONS (22 Sep, after the pass): (1) inverse = CCEA's 2 marks; (2) fix tangents-and-normals q0011 worked
  line and trig-equations q0005 swapped feedback through their generators (else scripted JSON edit asserting every
  other byte), and clear the lesson-v2 trap warnings for solve-three-simultaneous-equations 2023 Q11 and
  tangents-and-normals 2022 Q8 from the reports; (3) engine A and B go to an engine agent, leave them.
- (1) DONE 23:52 matrix-inverse-2x2: q0005 and q0009(a) 2 marks (MW1 determinant, W1 finished inverse, accept the
  worked-out entries), every CE there 1 of 2; WE steps 2 earn nothing (said so in the decision), twins out of 2;
  ftm earns MW1 only, texts say so; q0005 setting back to "the standard two-mark shape"; tariff check text. Bundle
  a1a5cd97e798e946 129559 B, note unchanged bcf3c3d2c628fe17. probe 138 ok 0 FAIL, check-marking 284/0, verify 85/0.
- (2) DONE 23:50, all three generators first shown to rebuild their bundles byte for byte (backups in bak-0922/):
  trig-equations (FORK_SP/fm1-batch-c/gen-trig-equations.mjs): q0005's CE feedback now computes each subtraction
  (60 - 360 = -300, 300 - 360 = -60), asserted against the answers; only that string changed. 39a74461ed84e7f5 449158 B.
  tangents-and-normals (FORK_SP/fm1-batch-d/gen-tangents.mjs): q0011's line is now y = 2(1.5)^2 - 1.5 + 3 =
  4.5 - 1.5 + 3 = 6, each term computed from the curve at A and the sum asserted; trap added from the 2022 Q8 report
  (tangent gradient not written from the normal's). Only those two fields changed. cbea6a037eb43ae4 439821 B,
  note 3fad97308860273d 42856 B (note unchanged).
  solve-three-simultaneous-equations (FORK_SP/fm1-batch-c/gen-solve3.mjs): trap added from the 2023 Q11 report
  (the two sides of an equation divided by different numbers to match the printed one); only the traps changed.
  ea4d19670e3749a4 268775 B (note unchanged 0ca6ffce4c216045).
  Batch C checks OK (1150 assertions, findings, routes, text); batch D check-marking OK (824), routes OK.
- (3) engine A and B left for the engine agent.
- FINAL 23:53: content:check 176 bundles, 0 problems, 0 KEYWORDS, 0 FIGURE lines in fm1; lesson-v2 fm1 29 notes 0 breaches
  0 warnings; figure-leaks fm1 0 leaks, 4 review lines (all q0003's "270": the script now also reads aria-label);
  shingles no breach; FM ids all registered; keyword-soft 0/0; text-parts 0/0 of 511; svg-draws 1979/0; gate-context
  0 without a visual; printed arithmetic over all 29 fm1 topics 297 equalities, 0 findings.
  STATUS: everything asked is done; nothing half-written; no next step in this folder.
- Queue: (1) MI fixes in matrix-inverse-2x2.mjs [DONE], then same defect classes in matrix-equations [DONE] and
  matrix-simultaneous-equations; (2) laws-of-logarithms follow-ups C and D from fm1-g-logs-reverify.md (A, B are
  engine items, out of scope: no src/ edits); (3) figure-leaks --unit fm1 review lines; (4) full fm1 finish checks.

# FM1 batch G — state at 16:14, 20 Sep 2026

Author: FM1 batch G (matrix-arithmetic, matrix-inverse-2x2, matrix-equations,
matrix-simultaneous-equations). Batch F is finished and published except `laws-of-logarithms`, which is
held by the coordinator until `form: "single-log"` and `form: "expanded-logs"` are in the algebra engine
(see `scratchpad/fm1-batch-f/STATE.md`).

**Resume rule: re-inspect disk first.** `ls packs/further-maths/content/fm1/`, then
`node scratchpad/fm1-batch-g/verify-published.mjs` and `npx tsx scratchpad/fm1-batch-g/check-marking.mts`.

## THE MATRIX ANSWER KIND LANDED (suite 1064) — the table encoding is GONE

`npx tsx scratchpad/fm1-batch-g/probe-matrix-kind.mts`, run before a single part was converted.
Everything the announcement promised holds:

- **accepted, all marked 3/3**: `pmatrix`, `bmatrix`, `Bmatrix`, `vmatrix`, `Vmatrix`, `matrix`,
  `smallmatrix`, bare or inside `$…$`; the nested list `[[16,6],[6,4]]`; the plain grid `16 6; 6 4`;
  a name in front (`AB = …`, `A^{-1} = …`); the Unicode minus.
- **partial credit per entry**: "3 of 4 entries are right. Row 2, column 2 should be 4."
- **a transpose is named**: "That is the transpose: the rows and the columns are the other way round."
  (and still earns part marks where entries coincide).
- **a wrong size earns nothing**: "This answer should be a 2 by 2 matrix; that one is 2 by 3."
- **a matrix commonError fires and tags** on every input form.
- **fractions work as entries**: `2/5`, `\frac{2}{5}` and `0.4` all pass against the same spec.

**The one limit worth the brief's note.** Entries are marked *as written*, so a scalar in front of the
brackets is **not** read: `\frac{1}{5}\begin{pmatrix}2 & -1 \\ -3 & 4\end{pmatrix}` scored 0/3 against
an inverse spec, with "Row 1, column 1 should be 0.4". That is exactly how CCEA prints an inverse and
how a learner will write one. Both matrix topics therefore end every whole-matrix stem with
*"Write the answer as a matrix, with every entry worked out: a fraction in front of the brackets is not
read."* (`MATRIX_NOTE` in `matlib.mjs`). If the engine ever reads a leading scalar, drop that sentence.

## The earlier probe (kept for the record): why the table encoding was needed

`npx tsx scratchpad/fm1-batch-g/probe-matrix.mts` — the state before suite 1064.

`npx tsx scratchpad/fm1-batch-g/probe-matrix.mts`, run before a single answer spec was designed.

| encoding | result |
|---|---|
| algebraic spec whose latex is `\begin{pmatrix}…\end{pmatrix}` | **the spec itself fails to parse**: "There is a problem with the expected answer for this question (unbalanced environment)". Every typed form is then marked wrong, including the identical pmatrix. Same for `bmatrix` and `matrix`. |
| algebraic spec whose latex is `[[5,2],[1,4]]` | parses, and accepts `[[5,2],[1,4]]` typed back — but **rejects** `\begin{pmatrix}5&2\\1&4\end{pmatrix}`, `(5 2; 1 4)`, `5 2 1 4` and `5, 2, 1, 4`. So it marks a correct learner wrong unless the stem dictates that exact spelling. |
| text spec with `accepted` spellings | accepts whatever is listed, but key-word marking is presence-based, so a matrix with the entries in the wrong places still earns the groups. Cannot detect a transposed or reordered answer. |
| **table spec, one cell per entry** | **works**: every entry marked on its own within its tolerance, marks shared in proportion, feedback naming the cell ("Row 2, column 1"). The field labels each input "Row r, column c" and says row 1 is the first row and column 1 the left-hand one. |
| numeric spec for a single entry or a determinant | works, and accepts `-26`, `−26` and `- 26`. |

**Superseded.** All six of `matrix-arithmetic`'s table-encoded parts were converted to `kind: "matrix"`
in one generator pass on 20 Sep, and `matrix-inverse-2x2` used the new kind from the start.

## Complete and published (2 of 4)

| topic | bundle.json | note.blocks.json | counts |
|---|---|---|---|
| `matrix-arithmetic` (L) | `6b4b47e7c86723b3`, 115 213 B | `2f478706c80f1e9d`, 21 424 B | we 1 · dx 7 · q 8 · ftm 1 · rp 6 · gates 5 |
| `matrix-inverse-2x2` (L) | `e8bf8baf1dadfdd7`, 125 791 B | `22c427d9556d7f4b`, 21 729 B | we 2 · dx 8 · q 9 · ftm 1 · rp 7 · gates 5 |

Both use `kind: "matrix"` for every whole-matrix answer and carry their routes as **matrix common
errors on the answer line** as well as on the mcq distractors and diagnostics: elementwise product,
rows paired with rows, the order reversed, the subtraction the wrong way round, a non-conformable
product, the adjugate not swapped, the adjugate not negated, the inverse not divided by the
determinant, and the 1/det reaching one entry only.

## Not written

- `matrix-equations` (S) — **next**, after the FM1 F fix pass.
- `matrix-simultaneous-equations` (S) — has an insight card at
  `packs/further-maths/insights/u1.matrix-simultaneous-equations.json`; copy it in unchanged.

## Tools in this folder

- `lib.mjs` — copied from batch F: exact rationals, printable numbers, SVG builders with `assertSvg`,
  `lintTree`, `shingleClash`/`corpusFiles`, verification-log builders, `writeJson` (sha256 + bytes).
- `matlib.mjs` — exact matrix arithmetic over those rationals: `mAdd`, `mSub`, `mScale`, `mMul`
  (with a conformability guard), `det2`, `adj2`, `inv2`, `checkInverse` (back-multiplies both ways),
  `mTex` / `mPlain` / `invTex`, `matrixBox` and `matrixRowSvg` (matrices drawn with square brackets,
  blanks supported), and `routes` — every error route this batch needs, already written:
  `elementwise`, `rowsAndColumnsSwapped`, `detSignReversed`, `adjNotSwapped`, `adjNotNegated`,
  `notDividedByDet`, `factorOnOneEntry`, `orderReversed`, `subtractWrongWay`.
- `probe-matrix.mts` — the probe above. Re-run it if the peer changes the marker.
- `check-marking.mts` — batch F's, with batch G's slugs.
- `verify-published.mjs` — matrices re-entered as plain number arrays and every operation written out
  again, so a mistake in `matlib.mjs` cannot hide behind itself; checks every table cell, every numeric
  answer, every numeric common error and every number inside a pmatrix option. Extend `M` and the
  `push(...)` list per topic.

## Registry

Ten new matrix misconceptions added to `pipeline/mine/insights-source/further-maths.mjs` and built:
`fm.matrix.elementwise-product`, `fm.matrix.rows-and-columns-swapped`,
`fm.matrix.dimensions-not-conformable`, `fm.matrix.determinant-sign-reversed`,
`fm.matrix.adjugate-not-swapped`, `fm.matrix.adjugate-not-negated`,
`fm.matrix.inverse-not-divided-by-det`, `fm.matrix.det-factor-on-one-entry-only`,
`fm.matrix.singular-not-recognised`, `fm.matrix.subtract-wrong-way`. The three that already existed are
`fm.matrix.scalar-multiple-squared`, `fm.matrix.inverse-order`, `fm.matrix.method-instruction-ignored`.

## Findings carried from batch F that still apply

1. `markAnswer` takes `prompt`, not `stem`.
2. Note limits: ≤120 words between gates, closing panel paragraph ≤80 words. Measure before publishing
   (matrix-arithmetic needed one trim: 132 → 117).
3. A commonError whose route lands on the part's own answer is dead and build-content rejects it.
4. Coordinate and matrix key words must not meet `\left(`/`\right)`.
5. The `table` field's row/col are 0-based in the spec and shown 1-based to the learner.

## Scope notes from the crosswalk (rows now exist for further-maths)

- `matrix-arithmetic` is **partial**: AQA 8365 §5.1 covers multiplication only (2×2 and 2×1); addition
  and subtraction appear in no comparison specification, and neither OCR 6993 nor Edexcel 4PM1 carries
  matrices at all. AQA §5.3–5.4 (transformations of the unit square) are **beyond CCEA** — kept out.
- `matrix-inverse-2x2`, `matrix-equations` and `matrix-simultaneous-equations` are **ccea-only**: no
  comparison statement anywhere, so our own treatment has to be complete. No dossier exists yet for any
  of the four (only `log-log-graphs.md`); check `data/enrichment/further-maths/` again before each note.
- CCEA-specific scope to respect: 3 × 3 matrices excluded; `XA = B` excluded (FM1-MAT-03 and MAT-04
  teacher guidance); multiplication capped at 3 rows or 3 columns.

## Paper shapes read (2019, 2023, 2025 FM1 papers and schemes)

- find `B⁻¹` for a given 2 × 2: **2 marks**
- "hence, using a matrix method, solve these simultaneous equations": **4 marks**, answer line `x = , y =`
- solve `AX = C` with `C` a 2 × 1 column: **4 marks**
- "explain why it is impossible to solve `BX = C`" (singular `B`): **1 mark**
- "using a matrix method, find the matrix `X` such that `PX = Q`": **4 marks**

## QUEUED BEFORE `matrix-equations`: the FM1 F fix pass

The peer's read is at `docs/dev/qa/pre-read/fm1-f-1.md` (mathematics flawless in all four). Seven
findings to work through the batch-F generators, then file the change list with hashes:

1. **`area-under-curve` is not ready.** The hero, the recap, the Sheet, q0007 and post-diagnostic d3
   (hypercorrection on) all drill the crossing-region split that FM1-INT-04 excludes and that the
   bundle's own `notOnThisSpec` names. Rework so the examined skill leads everywhere (area between a
   curve and the axis between two ordinates; a region below the axis giving a negative integral whose
   magnitude is the area): hero lede and can lines, recap, Sheet `mustBeAbleTo` and traps, q0007 and d3
   all on-spec. The crossing case becomes one short `notonspec` section with its worked note as
   insurance — no drilled question, no diagnostic.
2. **Ten question figures print raw LaTeX** (`y = 3x^{2}`) as the on-screen curve label and in the
   accessible title. SVG text must be plain: `y = 3x²` with Unicode superscripts, in both.
3. **q0007's and log-log-graphs' numeric common errors carry no tolerance**, so 5.33 and 0.667 go
   undiagnosed. Give each the tolerance its part's accuracy implies.
4. **`indicial-equations` prints `7^3x − 1` and `53x − 2`** in a find-the-mistake and a figure, with the
   index extent lost. Brackets or a proper superscript span: `7^(3x − 1)`.
5. **Gate g5's "smaller than either piece" line** — reword as the report says.
6. **Mixed numbers are refused on four exact-fraction parts** where the scheme accepts them. Widen
   `acceptForms` or the accepted spellings, and probe.
7. Item A3 (the listing rule) is moot; the engine now keeps a bracketed pair together.

## Next step — ORDER CHANGED 15:55

The coordinator has released `laws-of-logarithms`: the algebra engine now carries
`form: "single-log"` and `form: "expanded-logs"` on an algebraic spec with equivalence `"equivalent"`
(algebra suite 101, schemas re-exported). `single-log` wants exactly one logarithm that is the whole
answer — a coefficient in front fails with "a number in front of the log belongs inside it as a power",
two logs fail with "combine into one", `3 log 2x` against `log 8x^3` scores equivalent-wrong-form, and
`log 4x^3` is simply not equivalent. `expanded-logs` wants no product, quotient or power inside any
logarithm and is order-free. A `y = …` wrapper and a leading minus are read through; `\ln` and `\log_2`
count as logarithms.

So the order is now:
1. **`laws-of-logarithms`** (H, batch F) — plan in `scratchpad/fm1-batch-f/STATE.md`. Re-probe both
   `form` values first inside the batch-F marker check and record the probe there.
2. `matrix-inverse-2x2` (L).
3. `matrix-equations` (S).
4. `matrix-simultaneous-equations` (S).

After each: `npx tsx pipeline/build-content.mts` →
`npx tsx scratchpad/fm1-batch-g/check-marking.mts` → `node scratchpad/fm1-batch-g/verify-published.mjs`
→ `node scripts/qa/svg-draws.mjs` → `node scripts/qa/gate-context.mjs` → `npm run content:check`,
then update this file and report the hashes.

## Green at this checkpoint

- `npm run content:check` → 141 bundles, 0 problems, 0 KEYWORDS
- `node scripts/qa/lesson-v2.mjs` (now runs inside content:check) → 141 notes, 0 breaches on mine
- `npx tsx scripts/keyword-soft.mts` → 0 hard, 0 soft
- `npx tsx scripts/qa/text-parts-vs-solutions.mts` → 0 zero, 0 partial of 410
- `node scripts/qa/svg-draws.mjs` → 1504 SVGs, 0 files with defects
- `node scripts/qa/gate-context.mjs` → exit 0
- `node scratchpad/fm1-batch-g/bare-tex.mjs` → 563 maths segments, 0 defects
- `npm run insights:build && npm run insights:validate` → OK
- `npm run insights:unregistered` → 0 further-maths ids
- `npx tsx scratchpad/fm1-batch-g/check-marking.mts` → 116 probes, 0 findings
- `node scratchpad/fm1-batch-g/verify-published.mjs` → **extend it for the inverse routes** (determinant,
  adjugate, 1/det) before the next report; it currently covers matrix-arithmetic only

## A new local check

`scratchpad/fm1-batch-g/bare-tex.mjs <slug…>` scans every maths segment of the published JSON for a
TeX command written without its backslash (`log 8` for `\log 8`), which is now a fatal lint. It skips
the environment name inside `\begin{…}`, which is not a command.
