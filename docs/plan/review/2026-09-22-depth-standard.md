# The lesson depth standard: reasoning, measurement and the depth-pass programme

22–23 September 2026. Decision 2 of the platform programme, written by the depth-standard agent. The standard itself is the final section of `pipeline/prompts/author-topic.md` ("Depth standard (22 Sep 2026)"); the measure is `node scripts/qa/lesson-v2.mjs --depth`. This document holds the evidence behind the numbers, the lint's report over the published corpus, the programme for passing the standard over what is already published, the findings that belong to other agents, and the message the lead sends tonight's authors.

The owner's judgement (22 Sep): the start of fm1/algebraic-fractions-simplify is very good and strong, and we need more like this; what we have is not enough, and for complex topics it is far too little. The owner's second directive (23 Sep, decision 9) adds that every topic will have a Slides way in beside the Read way, generated from the same note.blocks.json, so the standard also makes every note splittable into cards without rewriting. "Fun" in that directive means interaction and consequence, never decoration; the standard says so in one line.

---

## 1. What the paper demands of a complex topic

Read privately in full: every FM1 paper and mark scheme from Summer 2018 to Summer 2026 (docs/sources/papers/further-maths); patterns only, no wording taken. FM1 is one two-hour calculator paper of 100 marks in 13–15 questions. The shape by topic family, with the marks per part:

| Topic family | How it is set | Marks |
|---|---|---|
| Differentiation and integration openers | one or two parts, "hence find d²y/dx²", "find y given a point" | 2–5 each |
| Trig graph and equation | sketch [1–2], solve in a range [2–3], "hence solve" with a transformed argument [3] | 5–8 |
| Completing the square | the rewrite [2], then "hence" the minimum point or the roots in surd form [1–4]; 2024 set "solve by completing the square, surd form" as one 4-mark part | 4–6 |
| Quadratic inequality | "show clearly each stage" [4–5]; twice disguised as a rectangle or a right-angled triangle with a constraint on a side ("find the range of values of x") | 4–6 |
| Matrices | arithmetic [2+2]; inverse [2] then "hence, using a matrix method, solve" [4]; "find the matrix X such that PX = Q" or "AY = B²" [5–7]; three unknowns [8] **every year**, usually as a word problem (1+1+1+8 or 1+2+8+2) | 4–13 |
| Logarithms | (a) a single logarithm, or "in terms of a and b", or "write y in terms of x" [2–3]; (b) solve a^{f(x)} = b^{g(x)} [4–5]; once "show that y = x + 2" [1] then "hence solve" [4] | 6–8, every year |
| Algebraic fractions | "simplify fully" [4–7]; "express as a single fraction" [5] then "hence show that … = 0" [2–4] then solve by completing the square [3–4]; "expand and simplify" [3–5] then "hence simplify fully" [4] | 4–10 |
| The curve chain | meets the x-axis [2–4], meets the y-axis [1], turning points [3–7], nature "using calculus" [1–2], sketch "using your answers to parts (i) to (v)" [2–4], then an area, a tangent or a normal [3–4] | 12–17, every year |
| Tangents and normals | tangent at a given x [3–4]; normal at P [5–7]; the twists: tangent parallel to a given line so find the coefficient a (4+3+2), tangent horizontal [6], gradient of the tangent equal to 5 at P (5+3), normal where the curve cuts the x-axis [5], tangent at P perpendicular to the tangent at Q (5+4) | 5–9 |
| Optimisation | a context (enclosure, pool, earring, plots, poster, L-shape): "show that" the constraint [1–2], "show that" the expression [1–2], "using calculus" find the maximum or minimum and show which [4–7], the optimised quantity [1–2]; also a population modelled by a cubic (1+5+2) | 7–16 |
| Reduction to linear form | a table of data, y = kxⁿ or y = abˣ, plot the logs, gradient and intercept, an estimate (6+4+2, once 7+4+1+2+1) | 11–15, every year |
| Area under a curve | the closing part of the curve chain [3–4]; 2026 set one 8-mark question of its own | 3–8 |

So the paper's demand of a complex topic is: the topic as **one part of a long chain** whose parts depend on each other, **disguised in a context**, with the **method named in the stem** ("using calculus", "using a matrix method", "by completing the square") and the marks locked to that method, at the **hardest shape** the specification allows (four quadratics in one simplify; three unknowns from a story; six parts on one curve). A lesson that teaches the routine case, checks it and stops has taught about a third of the question the student will meet.

## 2. What the corpus holds

`measure-corpus.mjs` (scratchpad/platform/depth-standard) over every bundle and note in packs/ at 23 Sep 00:10: 182 published topics (maths 58, further maths 58, science 66; the 23:52 build carried 176). Hardness and difficulty line up cleanly: L = difficulty 1–2 (34), S = 3 (75, plus one H at 3), H = 4 (54) and 5 (18). Medians per band:

| | L | S | H (d4) | H (d5) |
|---|---|---|---|---|
| Teaching headings | 5 | 6 | 7 | 7 |
| Gates | 6 | 7 | 9 | 9 |
| Words | 585 | 668 | 771 | 826 |
| Figures | 4 | 5 | 4 | 6 |
| Worked examples | 1 | 2 | 3 | 3 |
| Practice items (at difficulty 4–5) | 6 (0) | 8 (0) | 13 (3) | 13 (5) |
| Exam-style (multi-part) | 1 (1) | 2 (2) | 4 (3) | 4 (3) |
| Find-the-mistake | 1 | 1 | 3 | 3 |
| Retrieval prompts | 5 | 8 | 10 | 10 |

The shape of the depth problem is visible in the medians: an H5 note is one heading and 160 words longer than an S note, with the same gates and the same exam-style count. Complexity in the corpus is carried by the bundle (more practice, more marks), not by the lesson. No note in the corpus has an exam-twists or going-further section; 11 have a "See it done" heading; every note has exactly one `why` callout (the template's "at least one" has been read as "one"). The seven bundles read end to end as the student meets them (fm1/algebraic-fractions-simplify, completing-the-square, area-under-curve, matrix-simultaneous-equations, fm2/equilibrium-of-forces, m4/circle-theorems, b1/b1-enzyme-factors, plus fm1/optimisation as a second difficulty-5 case) confirm it:

- **algebraic-fractions-simplify (S).** The opening is what the owner praised: the cancel-a-factor-not-a-term idea with a counter-example figure, "why cancelling works", the three moves, a video with a gate after it, "fully means fully" with the 2024 finding beside the step. Against the paper it lacks: the variants taught separately (common factor; quadratic; difference of two squares with a coefficient; cubic with the common factor first), the twists (the 4–7-mark standalone with four quadratics; "expand and simplify, hence simplify fully"; the first half of an add-or-subtract question), a practice rung above difficulty 3, a second find-the-mistake, and a mixed tail that is not labelled "ladder".
- **completing-the-square (L).** Complete for its band. Its "hence" (the minimum point; the roots in surd form) lives in two other topics; the pointer says so, which is right for L.
- **area-under-curve (S).** Six sections, six figures, a below-axis case, a split-at-the-root insurance section marked not-on-spec, the intercept-limits case: the best-shaped note of the seven. It lacks a twists section (the area as the last part of a six-part chain; 2026's standalone 8-mark area), a mixed tail, and all 19 of its figures render their labels at 7 px on a phone.
- **matrix-simultaneous-equations (S).** The method instruction ("a perfect elimination earns nothing") is taught first, which is exactly right. It lacks the two shapes the paper sets beside it: three unknowns from a story (a separate topic, so a pointer) and "PX = Q" as a matrix equation.
- **equilibrium-of-forces (H4).** Four variants (flat with a rope, smooth slope, rough slope, three forces with an unknown angle) are there as sections, which is the standard's shape, but two of its six figures are prose drawn as a picture (a five-row method table, a four-phrase table), and the exam-style set has no chain in which equilibrium is the opening part of a longer forces question, which is how the corpus sets it four years in five.
- **circle-theorems (H5).** Seven theorem sections, each with its own figure and gate, a chain section and a refutation section, four worked examples with check routes: the strongest note in the corpus and the model for "one variant, one section, one gate". It has no exam-twists section as such (the twists are spread through the theorem sections) and no synoptic question of the 6-mark "angle, reason, angle, reason, then unscaffolded part" shape at full length.
- **b1-enzyme-factors (S).** The two-explanations structure (fewer collisions below the optimum, denaturation above) is the right idea-first shape and the practical is taught inside the note; all six figures render at 5–6 px on a phone (viewBoxes of 700–760 units with 11.5-unit labels), and the diagnostics are one `pre` set of five with no post check.
- **optimisation (H5).** Seven variant-like sections, three worked examples, four exam-style questions of the paper's shape (show, show, using calculus, the quantity). Two of its seven figures are text-only cards; two graphs carry 11-unit labels in 560-unit viewBoxes (7 px on a phone); no twists section names the three disguises the papers use (the wall side, the divider, the margin), and no going-further section holds the 16-mark shape of 2019 Q14.

Two defects found in passing, not mine to edit (packs/ is the content session's): in the good example's note, gate g5 ("Is $\frac{2}{x-3}$ fully simplified?") carries two identical options and an answer equal to the prompt's own fraction, and gate g6 ("Erin has reached $3x$") has lost its fraction too; both explanations describe the intended prompts ($\frac{6}{3x-9}$-shaped and $\frac{3x^{2}}{x}$-shaped). A simplify pass has rewritten the maths in the prompts. The lead should route it to the FM1 fixer.

## 3. The standard, and why each part of it is there

The full text is in author-topic.md. The floors, and the evidence each rests on (docs/research/06 unless stated):

| Element | Floor (L / S / H4 / H5) | Why |
|---|---|---|
| Teaching sections before the recap | 4 / 6 / 8 / 10 | Rosenshine's small steps and Mayer's segmenting (§6, §11): one idea per stretch. Depth is more stretches, never longer ones, so the 120-word gate rhythm stands. |
| Gates in the body | 5 / 7 / 10 / 12 | Interpolated testing cuts mind-wandering and raises retention (Szpunar 2013, §13); retrieval beats re-reading g ≈ 0.5 (Adesope 2017, Yang 2021, §2). A gate closes every stretch. |
| One `variant` section per method variant, each gated on its own | 1 / 2 / 3 / 4 | Interleaving works when the skill is telling cases apart (Brunmair & Richter 2019, §5); a case that was never taught apart cannot be told apart. Circle-theorems shows the shape. |
| `why` as a section for H bands | callout / callout / section / section | Self-explanation g = 0.55 (Bisra 2018, §7); a disguised question is solved by rebuilding the method from its reason. |
| "See it done" | 1 / 1 / per variant / per variant | The worked-example effect for novices (Sweller & Cooper; §6): example before problem, every time a new variant appears. |
| "Exam twists" from the papers | ≥1 / ≥2 / ≥3 / ≥4 | Transfer-appropriate processing: the testing effect is moderated by format consistency and material matching (Yang 2021, §2, §15). The twists are the paper's format. |
| "Going further" for H bands | – / optional / required / required | Section 1 above: the paper's hardest shape is the top of the statement, and the A* boundary is where her marks are decided. |
| Derivation where a must-know formula exists | where expected | Elaboration and self-explanation (§7); a formula she can rebuild is a formula she cannot half-remember. |
| Worked examples with twin, two backward-faded versions and a whyMenu | 1 / 2 / 3 / 4 | Backward fading beats example–problem pairs (Renkl 2002, §6); the why-menu is the cheap self-explanation prompt (§7). |
| Practice ladder to difficulty 5, minimally varied within a rung | 6 / 8–10 / 12–16 / 14–18, with ≥1 / ≥3 / ≥5 at 4–5 | Variation theory and intelligent practice (§10); the top rung is the paper's hardest recent shape. |
| The mixed tail, unlabelled, with a tail-only item for H bands | – / 3 / 4 / 5 (H: ≥ 1 tail-only) | Interleaved practice 61% vs 37% a month later, d = 0.83 (Rohrer 2020, §5); the tail is where she chooses the method, so it must hold at least one item she has not met in the ladder, and for H one whose method belongs to a neighbouring statement. |
| Exam-style with one synoptic chain | 1 / 2 / 4 / 4–5 (≥3 parts and 8 marks / ≥4 parts and 10 marks) | Section 1: the topic is examined as one part of a chain; a set of standalone questions never rehearses the "hence". |
| Find-the-mistake from different findings | 1 / 2 / 3 / 3 | Erroneous examples d = 0.33 on a delayed test (McLaren 2015, §9); the quality bar calls it the strongest interaction in the product. |
| Retrieval prompts (a minimum, no maximum), and the number embedded in the note | ≥ 4 / ≥ 6 / ≥ 8 / ≥ 10; 3 / 4 / 5 / 5 | Successive relearning across spaced sessions (Rawson 2013, §4); the embedded ones keep the facts inside the lesson; no padding, because the review queue is her time. |
| Diagnostics 3 pre, the rest post | 3 / ≥1, ≥3, ≥5, ≥6 | Pretesting (Pan & Sana 2021) and hypercorrection after instruction (Butterfield & Metcalfe; Foster 2022, §9); the learner review's settlement. |
| Minutes | note 6–8 / 8–11 / 11–15 / 13–18; learn 30–45 / 50–65 / 75–100 / 90–120; sit 5–10 / 10–20 / 25–35 / 30–45 | The app's own model (lesson-plan.ts). The exam-style set is timed apart because it is sat as a paper after the learning (§15); EEF dosage is 30–45-minute sessions, so an H topic's learn pass is two sittings, and the pause block and the Slides part boundary are where they end. |

The floors are set above the corpus medians on purpose for S and H (an S note needs one rung above the routine case, a second find-the-mistake and a mixed tail; an H note needs a why section, going further, the twists and the synoptic chain) and at the corpus for L, which is complete as it is.

### Figures

`measure-figures.mjs` over all 2,038 SVG figures in notes and bundles: median viewBox width 560 units; the smallest label in a figure renders at a median of **7.3 px** on a phone (358 px column) and 11.1 px even at 720 px; 96% of figures have a label under 12 px on a phone; 22 figures are text drawn as a picture. The mechanism is in `src/lib/ux/svg.ts`: `sanitizeInlineSvg` strips `width` and `height` whenever a viewBox is present, so every figure scales to the column and a label renders at font-size × column ÷ viewBox width. The 700–760-unit science viewBoxes with 11.5-unit labels give 5.4 px. Hence the rule: the smallest label is at least 3.5% of the viewBox width (12.5 px at 358), preferably a phone-native 360–420-unit viewBox with 13–15-unit labels; one idea per figure; no text-only SVGs; the annotated copy for the note and the plain copy for the question; a caption of ≤ 25 words that stands alone as a card. Two renderer items follow for the topic-page agent (not mine to change): cap `InlineSvg` at the viewBox width in CSS pixels so a 400-unit figure never stretches to 720 px with 25 px labels, and raise the `svg-gen` generators' label sizes to the same 3.5% rule.

### Long maths

The appearance pass measured 21 inline segments that overrun a 390 px line (scratchpad/appearance-1/overflow-list.json): thirteen are number or coordinate lists inside `$…$` (a list of 11–15 data values, six cumulative-frequency points), seven are `\dfrac` expressions in worked steps (a three-term numerator over a two-bracket denominator; the quadratic formula with the numbers in), one is a prose sentence inside `\text{}`. Inline KaTeX does not wrap, a prose line holds about 17 em and a worked-step line about 13 em. The rule: lists are prose or a table, never a maths segment; a `\dfrac` over 40 characters or any chain of equalities is display maths (`$$…$$`, which the renderer scrolls) or is split by naming the pieces; one step per worked line. The lint counts inline segments over 60 characters of TeX, `\dfrac` over 40, and number lists inside maths, across the note and the bundle's stems, worked solutions, steps and options; the corpus has 60 notes with such a segment.

### Slides-readiness (decision 9)

Measured across the 183 notes: paragraph and callout blocks have a median of 58 words, 283 of 2,093 are over 75; 104 of 1,474 headings are over 8 words; 27 visuals sit back to back; a gate already comes at most every 5 cards (median 2). So the notes are close to card-ready and the rules are cheap: one idea per block (≤ 75 words), headings as card titles (≤ 8 words), a figure before the prose that reads it and never two visuals in a row, a gate at most every 4 cards, captions that stand alone, titled callouts, and the recap lines and the pointer as the closing cards. An S note is 20–26 cards (about 11–13 minutes at 20 s a card and 40 s a gate, inside the directive's 6–12); an H note is 30–33 cards, so the standard asks for a natural break after the first "See it done" and the renderer offers two parts. The roles on headings are what let the Slides renderer title its cards and find that break.

## 4. The measure: `scripts/qa/lesson-v2.mjs`

All of the template v2 checks are unchanged and still fatal. New:

- `--depth`: the report note by note — band (from the taxonomy difficulty), every countable measure against its floor (structure), every section role against its floor (sections), the Slides, figure and maths checks, and the minutes (note; learn and sit timed apart; Slides cards). Only shipped items count, by the pipeline's own rule (a verification log found by the item's ref or its itemId, with status `verified` or `published`); the report says how many drafts it left out.
- Without a flag: one summary line, `depth: L a of b, S …, H4 …, H5 … meet their band's floor (structure n, sections n, labelled n of N); run --depth for the report.`
- `--json`: the same rows under `depth` and the per-band counts under `depthSummary` (additive; the existing keys are untouched).
- `--depth-fatal`: promotes every shortfall to a breach. Until the lead says so, a shortfall is a warning and `npm run content:check` stays green; a mis-spelt `role` on a heading is fatal now, because it would silently drop a section from the count.

Roles are read from `role` on heading blocks. A note without roles is reported as unlabelled: the see / twists / further / derivation / why rows are guessed from heading text so the report is informative, but variants are never guessed, so an unlabelled note cannot meet the section floor. That is deliberate: a guessed variant would let a note pass a floor it has not met.

The first report, over 183 notes at 23 Sep 13:32, found no note meeting its floor (L 0 of 35, S 0 of 76, H4 0 of 54, H5 0 of 18; the L band on small things, the H bands on the sections that carry the complex part of the topic). The report after the pilot and the eight refinements of section 9, over 184 notes at 23 Sep 19:00 (`lint-depth-all-3.txt` and `lint-all-3.json` in scratchpad/platform/depth-standard):

| Band | Notes | Meet the whole floor | Structure floor | Section floor | Carry roles | What they fall short on most |
|---|---|---|---|---|---|---|
| L | 36 | 2 | 18 | 2 | 2 | diagnostics post 14, sections 9, worked examples without two faded versions 9 |
| S | 76 | 3 | 3 | 3 | 3 | exam twists 72, find-the-mistake 66, no practice at difficulty 4–5 39, diagnostics post 34, sections 24, worked examples 22, mixed tail 20 |
| H4 | 54 | 0 | 0 | 3 | 3 | mixed tail without a tail-only item 54, going further 51, twists 50, derivation 50, no practice at difficulty 5 45, why section 44, synoptic 36 |
| H5 | 18 | 0 | 0 | 2 | 2 | mixed tail without a tail-only item 18, twists 16, going further 16, derivation 16, sections 14, synoptic 14, why section 14 |

The five notes that meet the floor are FM3 topics written to the standard tonight (binomial-probabilities, linear-transformation-mean-sd, normal-distribution-z-probabilities at S; normal-distribution-bell-curve and pascals-triangle-binomial-expansion at L). The two pilot topics (section 5) meet every floor but the tail-only item that refinement 4 added after they were passed. Eight FM1 topics ship their diagnostics, find-the-mistake items and prompts as drafts (no verification log; the lead's fix is in flight) and the report now says so instead of counting them: area-under-curve, indicial-equations, log-log-graphs, logarithms-from-indices, matrix-arithmetic, matrix-equations, matrix-inverse-2x2, matrix-simultaneous-equations. Figures: 1,892 of the 1,936 figures measured in the notes and bundles carry a label under 12.5 px on a phone; 38 are prose drawn as a picture by the calibrated rule. Slides: 283 blocks over 75 words, 104 long headings, 27 back-to-back visuals. Maths: 60 notes hold an over-long inline segment.

## 5. The depth-pass programme

### What a pass may change, and what it may not

A pass **adds**. It may change note.blocks.json (new sections, roles on every heading, gates with **new** ids, figures re-emitted at the phone-native scale, captions, the hero's lede, `can` lines and minutes), and may append worked examples, questions, find-the-mistake items and prompts with new ids, edit the Sheet's text, the insight text and `sets`, and add verification logs for the new items.

It may **not** change, byte for byte: any published question's part `answer`, `scheme`, `commonErrors`, `marks`, part ids, `totalMarks`, `skeleton` and `methodLock`; any diagnostic item's id, options, correct flags and misconception tags; any find-the-mistake item's id, `studentWorking`, `mistakeLine` and `misconception`; any prompt's id, `answer` and `keyWords`; any worked example's id, step `input` specs, `earns`, `faded` and twin `answer`; any gate's id and `answer`; the topic id, slug and statement ids. The learner's ledger and review cards key on those ids, and the pre-reads' `markAnswer` results key on those specs; both stay valid only if nothing published moves. Nothing published is deleted; an item found wrong is `withdrawn` in its verification log with the reason, so its review card resolves rather than dangles.

The guard is `scratchpad/platform/depth-standard/frozen-surface.mjs`: `snapshot <topic dir> > before.json` before the pass, `check <topic dir> before.json` after; it hashes exactly the fields above per item, prints every changed or missing item, lists additions, and exits 1 on any difference. Self-tested on the good example: 29 frozen items, 0 differences. The lead may move it to `scripts/qa/` (it has no dependencies).

### Checks per pass

In this order, all printed in the final message: the frozen-surface check (0 differences); `npm run content:check` (strict); `node scripts/qa/lesson-v2.mjs --unit <unit> --depth` (0 breaches, and the topic meets its band's floor); `node scripts/qa/figure-leaks.mjs --unit <unit>` (0 leaks); `node scripts/qa/shingles.mjs --unit <unit>` (0 breaches, the twists being the place a paper's wording is most tempting to echo); `npm run insights:unregistered`; the marker check over every **new** part; and the author's own read-through as the student, against the five questions in STANDARDS.md.

### The pilot: two complex FM1 topics

1. **fm1/laws-of-logarithms (H5).** Today: 8 sections, 8 gates, 728 words, 3 worked examples, 13 practice (6 at 4–5), 3 exam-style, no synoptic chain, no mixed tail, no roles. The paper sets logarithms every year as a two-part 6–8-mark question and the corpus holds five distinct shapes. The pass adds: variant sections for combining into one logarithm, expanding into separate logarithms, "in terms of a and b", "write y in terms of x" from a log equation, and solving a^{f(x)} = b^{g(x)} by taking logs; a why section deriving the three laws from the index laws (the must-know formulae the derivation floor names); "Exam twists" from 2018–2026 (the "show that y = x + 2, hence solve" pair; the "single log" whose argument must be multiplied out; the base that is not 10); "Going further" pointing at the reduction-to-linear-form question the paper sets every year (fm1/log-log-graphs) with one worked line; a fourth worked example; the synoptic 4-part question; the mixed tail; roles on every heading; figures re-emitted at the phone-native scale.
2. **fm1/tangents-and-normals (H4).** Today: 9 gates, 3 worked examples, no roles, no twists section. The corpus sets it every year and in eight distinct shapes (section 1). The pass adds: variants for the tangent at a given point, the normal at a given point, the point found from a gradient condition, and an unknown coefficient found from a tangent condition; "Exam twists" (parallel to a given line; horizontal; gradient equal to a value; the point where the curve cuts an axis; perpendicular tangents at P and Q); "Going further" with the six-part curve chain in which the tangent or normal is the closing part; the synoptic question at that length; the mixed tail; roles; figures.

Same author for both, one topic at a time, the frozen-surface check and the full finish checks after each, STATE.md at every checkpoint. The pilot is judged by the lead on the `--depth` report, the frozen-surface output, and a read as the student; only then does the roll-out start. Expect an H5 pass to cost about six tenths of authoring the topic afresh, an H4 pass about half, an S pass about a third and an L pass about a fifth.

**Result (23 Sep).** Both passes landed with 0 frozen differences. laws-of-logarithms: 14 sections, 15 gates, 1,283 words, 5 variant sections, 5 worked examples, 15 practice (8 at 4–5), 5 exam-style with the synoptic chain, 4 find-the-mistake, 12 prompts; learn 103 + sit 44 minutes, 54 Slides cards. tangents-and-normals: 12 sections, 13 gates, 1,055 words, 5 variants, 4 worked examples, 15 practice, 4 exam-style with the synoptic, 4 find-the-mistake, 11 prompts; learn 102 + sit 37 minutes, 44 cards. Each meets every floor but the tail-only item that refinement 4 (section 9) added after they were passed: one practice question each, and they are complete. The author's eight requests for refinement, and what became of each, are in section 9.

### The order

Year 12 first (the owner's priority of 23 Sep 2026: her Year 12 units are FM1, FM2, FM3, M4, M8, B2, C2, P2 and Unit 7; Year 11 units are M3, M7, B1, C1, P1), Further Maths at the head of it, the units with the most Higher-tier marks next, H bands before S before L within each unit:

| Order | Unit | Published topics (H) | Why here |
|---|---|---|---|
| 1 | FM1 | 29 (7) | half of Further Mathematics; the pilot lives here |
| 2 | FM2 | 16 (7) | a quarter; equilibrium, connected particles, force diagrams are the discriminators |
| 3 | FM3 | 13 (3) | a quarter |
| 4 | M8 | 15 (10) | 55% of her Mathematics; the Higher paper with the most marks |
| 5 | M4 | 9 (9) | 45% of her Mathematics; every topic is examiner-flagged |
| 6 | B2, C2, P2 | 15 (4), 16 (8), 10 (3) | her Year 12 science papers, Higher-only outcomes; the topics still being authored are written to the standard from the start |
| 7 | Unit 7 | – | her practical-skills booklets, authored to the standard once the four topics exist |
| 8 | M7, then M3 | 17 (8), 17 (11) | the Year 11 Higher pair, not her papers this year |
| 9 | B1 | 21 (3) | Year 11 science |
| 10 | C1, P1 and everything authored from tonight | – | written to the standard from the start; no pass needed |

At three to four concurrent authors, FM alone (17 H, 24 S, 17 L) is of the order of 150 agent-hours; the lead schedules it after the pilot with the usual pacing (≤ 4 concurrent Opus authors, the 80% usage rule).

## 6. Findings to hand on

Not mine to fix; each names its owner.

1. **The good example's gates g5 and g6** (fm1/algebraic-fractions-simplify/note.blocks.json) have lost their fractions to a simplify pass: two identical options in g5, a prompt that equals its own answer, and g6's prompt reduced to "$3x$". Content session / FM1 fixer. The frozen-surface rule fixes the *answer*, so the repair is to the prompt and options; if the answer must change, the gate gets a new id.
2. **Figure labels corpus-wide** (1,990 figures under 12.5 px on a phone) need two renderer changes before any depth pass re-emits figures: `InlineSvg` capped at the viewBox width in CSS pixels, and the `svg-gen` generators' label sizes raised to 3.5% of their viewBox width. Topic-page agent (src/components/items/Figure.tsx, src/lib/ux/svg.ts, src/components/figures/generated.tsx).
3. **Text-only SVGs** (22, for instance fm1/optimisation's method card and fm2/equilibrium-of-forces' two tables): prose drawn as a picture; the depth pass replaces each with `p` blocks.
4. **docs/dev/README.md** line 83 describes lesson-v2's flags and needs `--depth` and `--depth-fatal` added (not in my edit list).
5. **The template's diagnostics rule** (3–4 pre, the rest post) is met by few bundles: 83 notes carry a `both` set of six or fewer items, or a `pre` set only. The depth pass re-tags rather than rewrites (`when` is not a frozen field, the item ids and options are).
6. **Slides renderer (decision 9)**: the `role` field on headings is the hook it should use for card titles and the two-part break; the recap paragraph's lines and the pointer paragraph are the closing cards; the pause block lesson-plan.ts inserts is the fallback break for a note without roles.

## 7. The message to tonight's authors

Sent by the lead, verbatim:

> **The depth standard, from now on (23 Sep 2026)**
>
> A written depth standard now binds every topic: `pipeline/prompts/author-topic.md`, final section "Depth standard (22 Sep 2026)". Read it in full before you write another block. In one line: the strong opening of fm1/algebraic-fractions-simplify must run the whole way through the topic, and depth is more sections, not longer ones — the 120-word gate rhythm stays.
>
> For a topic you have not yet published:
> 1. Find your band from the taxonomy difficulty (L 1–2, S 3, H4 4, H5 5) and meet its floor: the two tables in that section (teaching sections, gates, variants, twists, worked examples, practice rungs to difficulty 5, the mixed tail, exam-style with the synoptic chain, find-the-mistake, prompts, diagnostics).
> 2. Put a `role` on every heading block: `idea`, `why`, `variant`, `see`, `twists`, `further`, `derivation`, `recap`, `pointer`. One variant section per method variant, each with its own gate. An "Exam twists" section built from the papers you read for your statement (patterns, never wording; the shingle test applies). For H bands a why section, "Going further" with the paper's hardest shape, and a derivation section where a must-know formula can be derived.
> 3. Figures: one idea each; the smallest label at least 3.5% of the viewBox width (a 400-unit viewBox with 14-unit labels); never text drawn as a picture; the annotated copy for the note and the plain copy for the question; a caption of at most 25 words on every figure.
> 4. Long maths: number lists as prose, never inside `$…$`; a `\dfrac` over 40 characters or any chain of equalities as `$$…$$` on its own line or split; one step per worked line.
> 5. Slides-ready (the owner's second directive, decision 9): every `p` or callout at most 75 words, headings at most 8 words, the figure before the prose that reads it, never two visuals back to back, a gate at most every four cards, every callout titled. Fun means interaction and consequence, never decoration.
> 6. Finish checks as before, plus `node scripts/qa/lesson-v2.mjs --unit <unit> --depth`: paste your topic's report in your final message. A shortfall is a warning today; a topic filed from now on meets its floor.
>
> For a topic you published tonight before this message: you give it a depth pass yourself, now, under "Depth passes over published topics" in that section — add sections, roles, figures, and new worked examples, questions, mistakes and prompts with new ids; change no published answer spec, scheme, common error, id, gate answer or diagnostic option. Before the pass: `node "C:\Users\feras\AppData\Local\Temp\claude\C--Users-feras-Downloads-CCEA-GCSE-Top-Learning-Platform\4355edb7-b61d-472c-a7be-db688e7e239b\scratchpad\platform\depth-standard\frozen-surface.mjs" snapshot packs/<subject>/content/<unit>/<slug> > <your scratchpad folder>/before.json`; after it, the same with `check … before.json` — 0 differences before you file — then the finish checks with `--depth`.
>
> No rush and no shallow work. Read every paper in the corpus for your statement before you plan the sections. Update STATE.md after every topic.

## 8. What was verified, and how

- The standard's floors and the lint's `FLOOR` table were written from the same numbers and read back against each other line by line, again after the refinements of section 9.
- `node scripts/qa/lesson-v2.mjs` (no flags): 183 notes, 0 breaches, exit 0, one new summary line; `npm run content:check` therefore stays green. `--depth-fatal --unit fm1` exits 1. `--json` parses and carries `depth` and `depthSummary`. `--depth --unit fm1` and the corpus-wide report are saved in the scratchpad folder. After the refinements: 184 notes, 0 breaches, exit 0; the per-band counts in section 4; the two detectors of refinements 6 and 7 calibrated against the pilot notes and against known cards and known graphs (the numbers are in section 9).
- `frozen-surface.mjs`: snapshot and check on fm1/algebraic-fractions-simplify, 29 items, 0 differences, exit 0.
- The figure measurement was cross-checked by hand on the seven notes (circle-theorems' 300-unit viewBoxes with 13-unit labels render at 15 px and are the only ones over the floor; area-under-curve's 560/11 render at 7.0 px; b1-enzyme-factors' 760/11.5 at 5.4 px).
- Nothing under packs/, src/ or app/ was edited. Files changed: `pipeline/prompts/author-topic.md` (one appended section), `scripts/qa/lesson-v2.mjs`, this document; scratchpad tools under `scratchpad/platform/depth-standard/` (digest.mjs, note-digest.mjs, measure-corpus.mjs, measure-figures.mjs, extract-papers.mjs, frozen-surface.mjs) with their outputs.

## 9. Refinements after the pilot (23 Sep 2026)

The pilot's author asked for eight refinements. Each was applied to the standard's section, to the lint where it is measurable, and to this document; the verdicts:

1. **The minimum item counts push H topics past the minutes guide (147 against 110–140; 139 against 90–115).** Accepted, in the form "time the exam-style flow separately" rather than raising the guide. The exam-style set is sat as a paper after the learning, never in the same sitting (research 06 §15), so the guide now has three rows, note / learn / sit, with learn 30–45 / 50–65 / 75–100 / 90–120 and sit 5–10 / 10–20 / 25–35 / 30–45 at the floors, and the lint prints `learn N + sit N`. The two pilots read learn 103 + sit 44 and learn 102 + sit 37: both above the learn guide because both are above the floor (five variants, five worked examples), which the standard now says is what a topic above its floor does. The guide is a guide; the lint never gates on minutes.
2. **Retrieval prompts as minimums rather than ranges.** Accepted: ≥ 4 / ≥ 6 / ≥ 8 / ≥ 10 in both tables and in `FLOOR`, with one sentence against padding, because every prompt lands in her review queue.
3. **The recap's "one line per variant plus the twists" does not fit five lines with five variants.** Amended: a line may cover two variants that share a method, and the twists take one line; the H5 floor is 4–5 lines. Six lines refused: the recap lines are the Slides way's closing cards and the template's own fatal rule caps them at five.
4. **The mixed tail can only use items from the same bundle, so every tail item repeats one she has met.** Amended: a **tail-only** item is a practice question of this bundle that is not a ladder rung, listed last in `questions[]`, carrying `"mixed-tail"` in `emphasis`, and for H bands at least one whose method comes from a neighbouring statement, named in its `specRefs` beside the topic's own. The lint counts them and the H floor now requires one, which is why the two pilots read "1 short" until they add theirs. Cross-bundle sets are deferred to the practice agent: `loadBundle` reads one bundle, so a set over other bundles needs an item index in the manifest and a resolver in the loader; the practice agent's This-topic and Weak-spots modes are the natural owner.
5. **Count only shipped items.** Accepted: the lint applies the pipeline's own rule (`SHIPPABLE` = verified or published; a log found by the item's `verification` ref or by `itemId`; no log is a draft) and reports the drafts it left out. It found the eight FM1 topics the author named, each with two diagnostic sets, a find-the-mistake item and five to eight prompts unlogged.
6. **The "fewer than the variants" note printed although each variant section carried its worked lines.** Accepted, amended: a variant section counts as shown when it holds a video or a paragraph of two or more working lines, where a working line is numbered ("Step 2."), bold-labelled ("**Differentiate**") or a maths step (inline maths with an equals sign, or maths joined by "so", "becomes", "gives" or "then"), because the pilot wrote its working as often in sentences ("So $2 + \log x$ becomes $\log 100 + \log x$") as in numbered steps. On the pilots the detector now finds every variant section shown and the row passes.
7. **The text-drawn-as-picture test missed cards with a rule or a box.** Accepted, amended: the ratio of text to drawn shapes with two guards. A length-only rule flagged 424 of 823 note figures, including annotated graphs; the calibrated rule (four or more text nodes, at least twice the shapes drawn, nothing curved drawn, sentence-length text) catches the method cards and phrase tables in fm1/optimisation, fm2/equilibrium-of-forces and fm1/trig-equations, leaves the annotated enzyme graphs and the circle diagrams alone, and flags 38 figures corpus-wide.
8. **A variant must belong to the topic's own statement.** Accepted as text: a neighbouring statement's method is never a variant here; it comes in as a twist, inside the synoptic chain and as the tail-only item. Not lint-measurable (a heading names no statement).
