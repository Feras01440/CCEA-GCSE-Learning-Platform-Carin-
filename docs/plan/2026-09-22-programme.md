# The programme: making Cairn remarkable, not labelled

The plan of record for the next month, from 23 September 2026. Written by the research-plan agent from decision 6 (docs/plan/review/2026-09-22-research-application.md), decision 11 (docs/plan/review/2026-09-23-benchmarks.md) and the marking evidence sweep (docs/plan/review/2026-09-23-marking-evidence.md). It replaces the roadmap in docs/plan/00-MASTER-PLAN.md §8 for the period it covers; the master plan's pillars, pipeline and measurement plan stand.

---

## Page one: the owner's directives

**22 September 2026, 23:55 (PLATFORM-PROGRAMME.md, verbatim in substance).** "Many things need to be looked at. Yes we have good foundations, the engine is good, we have a lot of questions. But what happened to the companion we talked about? What happened to addressing the new design? What happened to the research about cross-platform inspirations, the top learning platforms, taking their best learning approaches and applying them here? What happened to the future plan, the enhancements, making this a much better platform? Topic learning is still missing a lot: the Further Maths pure first topic's start is very good and strong, but we need more like this; what we have isn't enough, and for more complex topics it is far too little. On the topic page the right-hand side is too small, and the scroll on the left is always sticking in front of me; it may be good to have, but I want to focus on the topic, the teaching and solving the questions. We need a top-tier learning approach: identify our issues and make them strengths; apply all the plan and the research to beat BBC Bitesize and every other platform. Review it and take action before it is late or harder to implement. Everything super strong, a platform a school would be proud of. Corrections to everything needed: navigation, flashcards, the home page, the map page, and in practice the only 'mixed' option we have. Are all of these truly the best, or just labelling? Use all the tools and power we have to make this truly remarkable."

**23 September 2026, 00:08 (DIRECTIVE-2.md, in substance).** The companion needs an icon and a character. Every improvement we recommend must be excellent and the top of what exists: reviewed, compared with the best, applied in the way that best fits us. Study the other platforms to see how they are better than us and which of their ideas fit our purpose, and apply them in the best possible way. A new way of introducing topics, something like slides, closer to Duolingo, so learning a topic is not only reading. Flashcards inspired by Kinnu: attractive interactive design, fun, engagement, a character, real helpfulness; more fun, more and better ways of learning each topic, so it is not boring to read and learn. Take each idea, feature, art direction, UI and UX element, and above all each teaching-and-learning method we have or plan, compare it with the top well-known platforms and sites, pick what is best for us, and apply it correctly, with professionalism and creativity: fine icons and designs, motion graphics and motion design, impressive in everything. High importance: think carefully, research deeply, keep the foundations at 10/10, and let everything built be polished, high standard and aligned with the bigger vision.

**23 September 2026, 14:05 (decision 15).** Year 12 comes before Year 11 for everything: polish, depth, richness, fun, and every new feature lands on Year 12 topics first. Her Year 12 units are FM1, FM2, FM3, M4, M8, B2, C2, P2 and Unit 7; Year 11 units are M3, M7, B1, C1, P1. Depth and fix passes run FM1, FM2, FM3, M8, M4, B2, C2, P2, then Unit 7 once authored, then M7, M3, B1, C1, P1. Authoring the empty Year 12 content (the rest of FM3, B2, C2, P2 and Unit 7's four practical-skills topics) comes before C1 and P1. Slides, the character, the flashcards redesign and the practice modes roll out on Year 12 topics first.

**The standard every item is held to** is STANDARDS.md: correct, exam-true, teaches, reliable, clear, better than the best. And the test every screen must pass is the owner's decision 7: a feature exists when the five questions (clarity, focus, momentum, calm, trust) are answerable from the pixels, when its promise is true in the data, and when a Playwright check proves it. Nothing on this programme is done because a label says so.

---

## How this document is organised

Eleven streams, numbered 0 to 10, plus the sister's own list. Every item carries: an **owner type** (author agent for packs and briefs; app agent for src/, app/ and e2e; lead for decisions, builds, Playwright and the sit-down), an **order** inside its stream, an **effort** in agent-days (content in topics), its **dependencies**, and an **acceptance test** that a stranger could run. Each item traces to a row of the application table (A, C, R04–R09, H) or a page of the benchmarks (B1–B19), so the evidence behind it is one hop away. "In flight" marks work launched before this document under PLATFORM-PROGRAMME.md; it is listed so the dependencies are visible, not re-briefed.

The month is planned in four waves (page "The month, in waves"). The cap is twenty concurrent agents and a weekly usage budget the coordinator meters; the owner decides the pacing. Under that cap the rule is: content agents run continuously topic by topic with checkpoints; app agents run in waves of three to five; the lead builds the export and runs Playwright alone; nothing is launched before the page of the benchmarks for its surface has been read.

---

## Stream 0. Foundations at 10/10 (decision 13)

No new surface is built on a foundation the sweep found weak. These are engine and item defects with tests; the engine agent's brief (scratchpad QUEUE.md) gains them as named items. Evidence: docs/plan/review/2026-09-23-marking-evidence.md and application Part H.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 0.1 | Two misses → two ways on. After the second miss the card offers a hint (the next scheme line) or the worked example's matching step; the field closes until one is chosen; the third attempt is the twin. Retires the unmounted `EncouragementCard` (H1). | app (engine) | 1 | 1 d | — | A fixture with two misses shows exactly two offers and no open field; the third attempt is a twin; unit test; `e2e/practice.spec.ts` |
| 0.2 | The series on a miss. `MarkResult` carries the matched common error's `source`; the card cites "CCEA examiners' report, {series}" (H2). | app (engine) | 2 | 0.5 d | — | On the frustums `1700` miss the card shows the series; test on `withCommonError` |
| 0.3 | Physics equation parts: the equation line earns its mark point; substitution and value earn theirs through the ladder; a bare equation scores the equation mark only (H3). | app (engine) | 3 | 1 d | — | `mark.test.ts:337` rewritten: equation alone 1/2; equation + value 2/2 |
| 0.4 | "Something wrong?" kept. A `reports` table (item, text, at, resolved), shown under the panel and in Settings, in the export (H4). | app (engine + surfaces) | 4 | 1 d | — | A report survives reload and export; the panel's promise is true |
| 0.5 | The right twin. Choose the worked example whose scheme shares the unreached step (H5). | app (engine) | 5 | 0.5 d | 0.1 | Fixture: a miss on a part whose step matches WE 2 opens WE 2's twin |
| 0.6 | Method locks and follow-through marked (H6): a locked part whose working shows another method scores the accuracy mark only with the lock's instruction quoted; an `ft` mark point pays when her value is consistent with her earlier wrong value. | app (engine) | 6 | 2 d | C2 | Tests on a "hence" part and on a two-part ft chain; the corpus guard's counts unchanged elsewhere |
| 0.7 | The ladder follows her accuracy: `nextFade` wired (advance ≥ 80%, repeat 50–80%, drop < 50%), tap kept as override (H7, R06-6.2); the why-menu highlights the option she tapped (R06-7.1). | app (engine) | 7 | 1 d | — | Unit tests for the three thresholds; a gallery check of the highlight |
| 0.8 | A gate can be retried once after "Not quite."; the first answer is the record (H8). | app (topic-page) | 8 | 0.5 d | — | Unit test on `StepRevealNote`; the attempt row equals the first answer |
| 0.9 | A video or simulation is followed by a gate within two blocks: a fatal lint; the three uncovered clips fixed (H9, R06-13.2). | author (depth-standard) + app | 9 | 0.25 d + content | — | `lesson-v2.mjs` prints 0 over 183 notes |
| 0.10 | `RegionField` typed fallback: a point (x, y) inside the region (H10). | app (engine) | 10 | 0.5 d | — | The M7 inequalities parts answerable by keyboard; e2e plot case |
| 0.11 | The Checked panel under every marked item as a collapsed `<details>` with the summary line (H11). | app (surfaces) | 11 | 0.5 d | pass 2b | Every item kind shows the summary; the panel's "on every item" claim is true |
| 0.12 | Method marks on correct answers: the ladder runs when working was typed and the correct card shows the lines that earned M1/MA1 (R06-8.2, C2). | app (engine) | 12 | 0.5 d | — | Fixture: correct answer with working shows "M1 seen: …" |
| 0.13 | First-miss honesty: the explanation must not state the value the "Expected" row is withholding (R06-2.2). | app (engine) | 13 | 0.5 d | — | The text and numeric explanations on a first unrecognised miss carry no answer value (tests on `text-marking.ts:211`, `numeric.ts:1675`) |
| 0.14 | Timing at every attempt site (A5): elapsed ms from gates, prompts, mistakes, twins and questions. | app (engine) | 14 | 1 d | — | Every `recordAttempt` call passes `timeMs`; a report script prints her medians per item kind after two weeks |
| 0.15 | Distractor tags complete (R06-9.2): the 473 untagged distractors tagged; a `content:check` warning for any distractor without a misconception. | author + pipeline | 15 | 0.5 d + content | — | Warning count 0 |
| 0.16 | Made-for-Kids flag per video recorded once; a flagged clip is not embedded (R04-4). | app (script) | 16 | 0.5 d | — | The media map carries the flag; the facade refuses flagged ids |
| 0.17 | The re-teach panel on a part marked in pieces (label, table, order, steps) names the point she missed, not the last point: `unreachedStep` (`reteach.ts:64-71`) walks the scheme by running total, so on the seeded lesson it named "P1 vacuole", the mark she had (audit must-fix 1). `checkLabel` already knows the wrong targets; carry them on `MarkResult`. | app (engine) | 17 (wave 1) | 0.5 d | — | Fixture: wrong on (i), right on (ii)–(iv) names (i)'s point |
| 0.18 | `stepLineMatches` and `fixMatches` equate `x/(2(x-5))` with `\frac{x}{2(x-5)}` (and `\dfrac`): one normaliser before comparison (audit must-fix 6: a correct line was told "Not the same line yet"). | app (engine) | 18 (wave 1) | 0.5 d | — | The FM1 worked example 1 `faded1` final line typed with a slash matches; tests on both comparators |
| 0.19 | The Ledger counts marks, not misses: only attempts with a tariff, the best attempt per part per sitting, untagged losses shown as untagged (audit must-fix 5: "13 marks lost · Method 13" after 6 were dropped; `tags.ts:33-46`). | app (engine) | 19 (wave 1) | 0.5 d | — | The audit's night yields 6; a retried part counts once; tests |

Stream 0 items 0.1–0.5, 0.7, 0.8, 0.12 and 0.13 are wave 1; they gate stream 3 (Slides uses the gate and the card) and stream 5 (practice uses the twin and the offers).

---

## Stream 1. Content: depth and coverage, Year 12 first (decisions 2, 5, 15)

Evidence: application A2, C5, R05-2, R06-5.2, R06-13.1, R09-3; depth-stats (notes 416–1,374 words, median ~700; L-band FM1 topics with one worked example and six practice items); benchmark B3, B6.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 1.1 | The depth standard (DONE 23 Sep 13:42, docs/plan/review/2026-09-22-depth-standard.md): sections and order per band, each method variant gated with its own "See it done", "Exam twists" from the papers, "Going further", the derivations the spec expects, recap and pointer; worked examples one per variant with twin and two faded; the ladder to the A* boundary with a mixed tail; exam-style count with one synoptic; ftm and prompt counts; the minutes; the 120-word rhythm kept. A measurable floor in `lesson-v2.mjs --depth`, non-fatal at first. | author (fable) | 1 | 2 d | — | Done: the report is filed; `lesson-v2.mjs --depth` reports every note (23 Sep 14:00: 0 of 183 notes meet their band's whole floor, L 20 of 35 meet the structure floor; 1,990 figures under 12.5 px on a phone; 22 text-only SVGs; 60 notes with over-long inline maths); the authors' message is §7 of the report |
| 1.2 | Depth pass pilot: the standard's two topics, `fm1/laws-of-logarithms` (H5) then `fm1/tangents-and-normals` (H4), one author, one at a time, the frozen-surface guard (`scratchpad/platform/depth-standard/frozen-surface.mjs` snapshot before, check after, 0 differences) and the full finish checks after each; judged by the lead on the `--depth` report and a read as the student. What may change: sections with `role` on every heading, figures re-emitted at the phone-native scale, the hero, new worked examples, questions, mistakes and prompts with new ids, the diagnostics re-tagged 3 pre / rest post; byte-identical: every published answer spec, scheme, common error, id, gate answer and diagnostic option (depth standard §5). | author (opus) | 2 | 2 topics · about 0.6 of authoring afresh each (the standard's estimate) | 1.1 | Both pass `content:check`, `lesson-v2.mjs --depth` at the H floor, `figure-leaks`, `shingles`; the owner reads both and says "more like this" |
| 1.3 | Depth pass roll-out in decision-15 order: FM1 (27 remaining), FM2 (16), FM3 (14), M8 (15), M4 (9), B2 (15), C2 (16), P2 (10). Four authors in parallel, one unit each, topic by topic with checkpoints. | author (opus ×4) | 3 | ~122 topics; the standard's estimate per pass is 0.6 (H5), 0.5 (H4), 0.33 (S) and 0.2 (L) of authoring afresh; FM alone is of the order of 150 agent-hours | 1.2 | Per unit: 0 breaches on all four finish checks; the depth lint at the band floor; STATE.md per topic |
| 1.4 | The Year 12 remainder authored first: FM3's two, B2's five, C2's six, P2's ten (27 topics, at the standard from the start). | author (opus ×3) | 4 (parallel with 1.3) | 27 topics · 1 d | 1.1 | Published with all finish checks at 0; the manifest shows FM3 16/16, B2 20/20, C2 22/22, P2 20/20 |
| 1.5 | Unit 7: the four practical-skills topics (planning, carrying out, analysing, conclusions) authored as lessons with Booklet B-style items using the table, steps, label and text-long kinds; one module per prescribed practical (18) as a section of the relevant topic or as `science.practicals.<code>` bundles. | author (opus ×2) | 5 | 4 topics · 2 d + 18 modules · 0.5 d | 1.1, 1.6 | Every prescribed practical has apparatus, IV/DV/control, an ordered method, a results table and one improvement question, auto-marked; `booklet-b-item-types.json` is read by the check |
| 1.6 | The practical write-up component: apparatus list, variables, ordered method (steps field), results table (table field), graph (plot field), one improvement (text). | app (surfaces or a new practical agent) | 5 | 3 d | — | Renders a `Practical` bundle end to end; marked by the existing engines; e2e on one practical |
| 1.7 | Then C1 (23) and P1 (20), at the standard. | author (opus ×3) | 6 | 43 topics · 1 d | 1.4 | Manifest C1 25/25, P1 22/22 |
| 1.8 | SSDD sets for the examiner-flagged H topics (same figure, different demand), Year 12 first (R06-5.2). | author | 7 | 20 sets · 0.25 d | 1.3 | `kind: "ssdd"` sets pass the checks and render in This-topic practice |
| 1.9 | Media pass: durations into the media map with clips over six minutes given a start/end; the NI science channels and GCSE Physics Online for P2/C2 then P1/C1; fact-file and Student Guidance links per science unit (R04-9, R05-5, R06-13.1). | author (tooling) | 8 | 1.5 d | — | 0 videos without a duration; every P2/C2 topic with no video reviewed; the reference rail shows the CCEA documents |
| 1.10 | The prompt rule: answers ≤ 12 words, no orphan prompts, the examiner's key words on formula and definition prompts; a lint (B8). | author (depth-standard) | 9 | 0.5 d | — | The lint reports over 183 notes; the brief carries the rule |
| 1.11 | The QWC builder fields filled (model band A, upgrade-me band B) for every QWC site in Year 12 science, then Year 11 (R06-6.4). | author | 10 | 0.25 d per site | 2.7 | Every `text-long` part's item carries both fields |
| 1.12 | Explainer clips for the six hardest H topics (histogram median, circle and tangent, completing the square, moments, ray diagrams, transformations), ≤ 60 s, captioned (R07-C14). | author + design | 11 (last) | 6 · 1 d | 1.3 | Each clip plays inside its worked example and is followed by a gate |
| 1.13 | The owner's exemplar repaired: gates g5 and g6 of `fm1/algebraic-fractions-simplify` lost their fractions to a simplify pass (two identical options; an answer equal to the prompt's expression; "Erin has reached $3x$"), found by both the depth standard (§6.1) and the audit (must-fix 3); and two gate lints in `lesson-v2.mjs`: options distinct, the answer never equal to the prompt's own expression. | author (FM1 fixer) + depth-standard (lint) | 0 (wave 1, first) | 0.5 d | — | The two gates answerable; the lint prints 0 over 183 notes; the frozen-surface rule respected (a changed answer means a new gate id) |

---

## Stream 2. The topic page and the design passes (decisions 1, 5, 12)

Evidence: application A16, C3, C4, C9, R07-7, R07-9, R07-12, R07-16, A14, A15; benchmarks B3, B16, B19; docs/design/art-direction/03 and 04.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 2.1 | Decision 1 and pass 2a–2c (in flight, topic-page agent): the lesson is the page at a 720 px measure; the right-hand column removed, its cards recesses under "In the exam"; the spine can be put away into a 3 px track with a "Contents" toggle remembered per device; the phone bar and sheet; hero re-order with the button inside 640 px. | app | 1 | 4 d | pass 1 (done 22 Sep 23:45) | Baseline measured by the audit on 23 Sep (docs/plan/review/2026-09-22-platform-audit.md §2): grid 196 / 748 px, prose 584 px, spine sticky at 752 px with no toggle, "Start the lesson" at 953–995 px at 1280 and 948–1,066 at 390, three pinned elements (204 px) at 390; the thin right-hand column is already gone in the 23:52 export (the reference cards sit at the foot). Acceptance: at 1280×800 prose 640–720 px; rail put away reflows ≤ 40 px; at 390×844 one sticky element besides the tab bar; "Start the lesson" < 640 px on three topics (permanent Playwright); one minute figure per screen (today the hero says "About 7 minutes", the eyebrow "about 9 min" and the ten stages sum to 63: say the lesson's cost and the whole topic's cost); `e2e/companion.spec.ts` re-run after the hero re-order |
| 2.2 | Pass 2d–2f and item 10 (surfaces agent, queued): unit list without the meter and the pill, Today as one object + the Letter + rows + one recess, papers in four phases, flashcards without the tint bar and with three 52 px buttons; the Map with her units only, stones per unit and no countdown bars (today eleven bars whose length is days away and 359 squares for every unit in the taxonomy), and the subject page marking the units she is not entered for (audit §4). | app | 2 | 4 d | 2.1 (recessCls) | `03-implementation-plan.md` pass 2 acceptance; "0 / 4" gone; the five questions per surface |
| 2.3 | The marked answer per the critique (2e as amended): 2 px outcome border, 4 px rule, verdict at 21 px, "0 of N" and the struck code mandatory, the `<dl>` stacked below `sm`, "It comes back on {day}" (now true). | app (surfaces; strings by the engine agent) | 3 | 1.5 d | 2.2, C1 | 04-critique §7.6 assertions in Playwright |
| 2.4 | The FM display-maths floor: count `.katex-display` overflow at 390 across every FM and M bundle; step-down sizes before a scrollbar; "one equality per line" in the brief. | app (topic-page) + author | 4 | 1 d | 2.1 | The count per bundle reported; zero on the three sample topics; smallest KaTeX glyph ≥ 13 px (04-critique §7.2) |
| 2.5 | The figure text floor: label size as a breakpoint value in viewBox units; `InlineSvg` capped at the viewBox width in CSS pixels; the `svg-gen` generators' labels at 3.5% of the viewBox width; `--fig-fill` read by the generator (audit must-fix 7: labels measured at 4.3–5.9 px at 390; depth standard §3: 1,990 figures under 12.5 px on a phone). Before any depth pass re-emits figures. | app (topic-page) + pipeline | 5 | 1 d | — | For every `svg[viewBox]` at 390, rendered font ≥ 13 px (04-critique §7.1) |
| 2.6 | The wrong-answer figure (A15): the matched error id in `MarkResult`; the figure re-rendered with her answer against the right one before the prose, for plot, histogram and transformation kinds first. | app (engine + topic-page) | 6 | 4 d | 0.2 | On the histogram `24` miss the bar draws off the scale; e2e on one part per kind |
| 2.7 | The QWC builder surface: model → upgrade-me → blank, rendering the authored fields (R06-6.4). | app | 7 | 2 d | 1.11 | One QWC site end to end with the band decision after the blank stage |
| 2.8 | Predict-then-reveal (A14): `PredictThenPlot` on Mafs for three Year 12 topics first (`maths.m8.gradient-of-a-curve`, `maths.m8.graphical-solution-of-quadratics`, `maths.m8.growth-decay`), then the enzyme curve (`science.b1.b1-enzyme-factors`) and M7 transformations. | app (interactives) | 8 | 4 d | 2.6 | The prediction is recorded as an attempt with confidence-like grading; reduced motion static; e2e |
| 2.9 | Pass 3 = icons and motion (decision 12): the five named motions as tokens, one icon set as SVG components at 1.5 stroke and 16/18/20 px with a ten-glyph vocabulary, the survivors of `transition-colors` deleted, nothing on scroll or hover, the reduced-motion assertion. | app (icons-and-motion) | 9 | 3 d | 2.2, 4.4 | B19 acceptance; `getAnimations().length === 0` under reduced motion on four surfaces; the icon audit script prints 0 |
| 2.10 | Text spacing control and the dyslexia defaults check (R07-13). | app (surfaces) | 10 | 0.5 d | 2.2 | The control changes line-height and letter-spacing in three steps and persists |

---

## Stream 3. Slides: the second way into every topic (decision 9)

Evidence: benchmark B4 (the format and the generator rules); application A2, R06-13.2; decision 15 (Year 12 first).

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 3.1 | The generator: a pure function from `note.blocks.json` to a card list (title, section, prose ≤ 70 words, callout, media-with-gate, gate, recall, pause, recap, pointer, hand-off), with the split rules of B4 and a unit test on the prototype topic's exact card count; a report of card counts and prose lengths over all 183 notes. | app (slides) | 1 | 2 d | 0.8 (gate retry); the `role` on headings from 1.1 | The test passes; the report agrees with the depth standard's measurement (an S note 20–26 cards at about 11–13 minutes; an H note 30–33 cards, offered as two parts with the break after the first "See it done"); card titles come from the heading `role`, the recap lines and the pointer are the closing cards, the pause block is the fallback break for a note without roles (depth standard §3 "Slides-readiness" and §6.6) |
| 3.2 | The renderer: one card per screen, a 3 px track and "n of N", swipe / tap / arrow keys, "Check" then "Continue" on gate cards, the recall card graded like a flashcard, the pause card with "Stop for tonight", the same gate and prompt ids as Read so attempts and the flow table are shared, the hand-off card. | app (slides) | 2 | 4 d | 3.1, 2.3 (the marked state) | B4 acceptance list; no vertical scroll on a card at 390×844 except inside a figure; reduced motion static; `e2e/slides.spec.ts` |
| 3.3 | The hero offers "Slides" and "Read"; Slides is the default on a first visit on a phone; the choice remembered per device; a topic half-done in Slides resumes in Read at the same section and back. | app (slides, with topic-page by message) | 3 | 1 d | 3.2, 2.1 | Playwright: first visit at 390 opens Slides; a desktop visit opens Read; the section resume both ways |
| 3.4 | The judgement: the prototype on `fm1/algebraic-fractions-simplify` judged against Duolingo's lesson screen, Kinnu's tile and Brilliant's lesson with the five questions, in a written note, before roll-out; the owner reads it. | lead | 4 | 0.5 d | 3.3 | The note names what each of the three does better and what was taken; any "worse than Read" finding fixed before 3.5 |
| 3.5 | Roll-out to every Year 12 topic, then Year 11 (it is generated, so roll-out is a check, not authoring): the card-length report at 0 breaches, the media cards' gates present, the figure cards legible at 390. | app (slides) + author fixes | 5 | 2 d + content fixes | 3.4 | The report over Year 12 notes at 0; then over all |

---

## Stream 4. The companion and the character (decisions 3 and 8)

Evidence: application A8, A17, A21, R06-14.4, R06-11.2; benchmark B14, B13, B2; companion spec and integration contract.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 4.1 | Rowan present from the first session (in flight, companion agent): the Today race fixed (audit must-fix 2: `TodayTiles.tsx:112-114` freezes the context before the next step resolves, so a requirement-free line fires once, burns its fourteen-day cooldown and Rowan is silent from the second open; the `topic-open` slot was empty on every first visit measured); plain mode strips dialect after selection instead of silencing; the first Letter on the first Today after first run and as the upgrade Letter on an existing install; every contract slot renders where it says; the plain-mode setting explained in Settings. | app | 1 | 2 d | — | Dev-server walk on a fresh profile and on an existing one with the day-one clock; `e2e/companion.spec.ts` |
| 4.2 | The nine unreachable moments wired (B14): `paper-eve` and `after-paper` into the `today-open` slot's list; `weekly-letter` on Sundays as the sealed Letter; `recap` as the explain-it-back gate on the recap card; `correct`, `confident-wrong`, `three-misses`, `answer-given` unsigned on the marked card; `vocab` as once-only captions. | app | 2 | 2 d | 4.1, 2.3 | Every moment reachable from one fixture each; the containment test still green; the constitution lint over six fixtures |
| 4.3 | The close questions and the memory in use: "How was that" (words, never faces), "When next" (default Not sure), "Leave a note at this cairn" (80 characters); the note quoted on the next `topic-open`; the taught line as the first hint when the skill returns; chips only after five answered closes. | app | 3 | 2 d | 4.2 | Fixture tests; the `source` rule (quotes only what she typed) enforced by lint |
| 4.4 | The character brief (decision 8): a written comparison of Duo, Kinnu, Headspace's characters and Brilliant's illustrations; docs/design/companion-character/ (references, the character sheet, the states arrival / listening / a stone placed / evening / the letter, the motion spec, do-and-don't); emotional-design rule 2 rewritten with the reasoning ("Duolingo's craft without Duolingo's manipulation"). | lead/design (fable) | 4 | 2 d | B14 read | The document exists; the rule 2 rewrite is in `docs/plan/emotional-design.md` with its evidence; the owner approves the sheet |
| 4.5 | `RowanFigure` and the updated `RowanMark`: hand-tuned SVG states with `data-state` variants, 150–300 ms transform and opacity, static under reduced motion, shown at the slot's size (Letter 48 px, line mark 24 px, map 16 px), never inside a question container. | app (opus) | 5 | 3 d | 4.4 | Rendered at 390 and 1280, light and dark; the identity test (7 am / 11 pm, day 1 / day 30); `e2e/companion.spec.ts` containment; the sit-down veto stands |
| 4.6 | The Sunday letter with the four-slot editable plan and the kept-intention framing; "what returns when" on the close card (next three, date, reason, count); the retention target in words in the paper fortnight. | app | 6 | 2 d | 4.3 | Fixture tests on the plan and the returns list; no banned word; the plan never turns red |
| 4.7 | Return without notifications: the `.ics` export of her slot and paper dates; the install hint once per device; the "paper on your mind" chip at the first close reflected on Today's next step (A8). | app | 7 | 1.5 d | 4.3 | ICS folds and validates; the hint shows once; the chip weights the next-step chooser (test) |
| 4.8 | First run order (A21, B2): the seeded lesson before the name and plan confirmation; the twenty-second rule. | app (owner of FirstRun.tsx) | 8 | 0.5 d | audit agent's walk | One tap and under twenty seconds to the first field on a cleared profile; `e2e/first-run.spec.ts` |

---

## Stream 5. Practice as honest modes (decision 4)

Evidence: application A23, A25, R04-7, R06-11.1, R06-15.1, R06-15.6; benchmark B10.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 5.0 | Instant start: a per-subject question index built at export time (id, topic, unit, calculator, marks) so Start no longer fetches every bundle of the subject (audit must-fix 4: 58 bundles, 14.6 MB, 10.5 s on localhost), one bundle fetched per drawn question; "Next question" only after an answer (audit §4). | app (practice) | 0 (first) | 1 d | — | Start enabled within a second on the export; a set cannot be finished with nothing answered |
| 5.1 | The five modes on one page, each with a one-line purpose and an honest empty state: Mixed (kept), This topic (the authored sets from a picker and from the unit list's one link), Weak spots, Exam-style, Due reviews (in flight when launched, practice agent). | app | 1 | 4 d | 0.1, 0.5 | B10 acceptance; `e2e/practice.spec.ts`; the five questions per mode |
| 5.2 | Weak spots re-presents before re-asking: the note section that teaches the unreached step (scheme step → section by the worked-solution line), else the faded step, else the distractor feedback; then a different item with the same tag (A25). | app (practice + engine) | 2 | 2 d | 5.1 | Fixture: one missed item shows its re-presentation first; the re-ask is a different item |
| 5.3 | Exam-style is timed at 1.2 minutes a mark, the ladder open, feedback at the end with the scheme lines missed and no grade; the first run of a topic at generous time (R06-15.6); a Paper 1 filter for M7/M8 and a "Non-calc Five" entry in the six weeks before the completion unit (R04-7). | app | 3 | 2 d | 5.1 | Timer, filter and the end-of-run scheme lines in Playwright; no grade printed |
| 5.4 | Unit check: six exam-style parts over three topics of one unit, no labels, feeding `computeMastery` as "later mixed" evidence; the Familiar threshold raised to 80% (A23, R06-11.1). | app (practice + engine) | 4 | 2 d | 5.1 | Test: a unit check promotes to Proficient and a miss demotes; the engine test updated for 0.8 |
| 5.5 | The Tonight sequence (R06-11.3): reviews → the next step's first section → its practice → the close card, one screen after another; a session governor over the last six answers choosing ladder, mixed or exam-style (R06-11.4). | app | 5 | 3 d | 5.1, 0.7 | Playwright runs a full Tonight on a fixture; the governor's three branches tested |
| 5.6 | A twin in every caller (R06-8.5): the review inbox, Mixed and the seeded lesson resolve the topic's worked example. | app (engine) | 6 | 0.5 d | 0.5 | Fixture per caller |

## Stream 6. Papers

Evidence: application C8, R04-3, R04-7, R04-9, R05-8, R06-15.2, R09-3, R09-5; benchmark B11.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 6.1 | The dial updates as the self-mark grid fills; the running screen is the clock and the official link only, with the tab bar hidden during a run; the result card leads with the grade earned and puts the band she is short of second (audit §4: it leads with "A*A*" today) (pass 2f). | app (surfaces) | 1 | 0.5 d | 2.2 | Playwright: entering marks moves the dial before "See UMS result" |
| 6.2 | "Mark it yourself" walkthrough (two minutes, once, before the first run): the ten General Marking Advice rules in our words from `packs/maths/exam-true/presentation-rules.json`, with two worked examples of a method mark with a wrong answer. | app (surfaces) + author (copy) | 2 | 1 d | — | Shown once per device; `presentation-rules.json` is read by the app for the first time |
| 6.3 | The NI Maths Tutor solution video for the paper she just sat, on the result screen, from the media map. | app | 3 | 0.5 d | 1.9 | Every M4/M8 series with a solution shows the link; none invented |
| 6.4 | Mock windows on the plan: one per paper at T−6 weeks, shown on the papers plan and on Today's "Coming up"; a second cycle at T−3 weeks for the summer papers. | app | 4 | 1 d | — | The windows appear from `exam-map.json` dates; a window past is never a reproach |
| 6.5 | Corbettmaths Set A/B on the unit's card as extra papers, labelled as Corbettmaths's own and linked, never copied. | app | 5 | 0.25 d | — | Links resolve; the label names the source |
| 6.6 | The science series planner: per-unit November / March / Summer choice in the plan editor with the rule consequences printed beside it (R05-8). | app (surfaces) | 6 | 1 d | — | Choosing November 2026 for B1 prints the results date and the resit rule; the scheduler follows |
| 6.7 | Official questions classified by topic (metadata only, never text) so a topic page deep-links its past questions by page (R09-3; master plan §3.4 classify stage). | pipeline | 7 | 2 d | — | `data/papers/questions-index.json` rows carry topic ids for M4/M8 and FM first; the topic page shows "Past questions on this: 2024 M4 Q12 →" |
| 6.8 | Original full-length mocks composed from the mined tariff distribution, two per Year 12 unit, after the content backlog (master plan D11). | author | 8 (last) | 12 mocks · 1 d | 1.4, 1.7 | Each mock's marks sum to the paper total and its tariff profile matches the mined stats |

---

## Stream 7. Flashcards to Kinnu's standard (decision 10)

Evidence: application R05-7, R06-10.3, R07-C6; benchmark B15.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 7.1 | The surface: one card per screen with breathing room, a large reveal, three unaccented 52 px buttons at thumb height each showing its next return (from `ts-fsrs` preview), a session of 12 with an honest close ("7 placed, 3 returning tomorrow, more tomorrow"), the deck's spacing explained in one line with the paper it is scheduled to, progress as cards placed, the tint bar gone; Year 12 decks first. | app (flashcards) | 1 | 3 d | 2.2 | B15 acceptance; `e2e/flashcards.spec.ts`; reduced motion static |
| 7.2 | Two card kinds that match the paper: "label from memory" (a blank diagram, the labels typed, marked by `LabelField`) and "write the equation line" (marked by the equation engine). | app + author | 2 | 2 d + content | 7.1 | One deck per science unit carries both kinds; marked by the existing engines |
| 7.3 | Deck quality pass, need-to-know not trivia: every Year 12 deck read against the spec's `mustRecall` and the fact files; cards that test a fact the paper never asks are cut. | author | 3 | 0.5 d per deck | — | Each card cites the statement it serves; the read is filed per deck |
| 7.4 | Keyboard shortcuts on desktop (space to reveal, 1–3 to grade), as Anki. | app | 4 | 0.25 d | 7.1 | Playwright on desktop |

---

## Stream 8. First run

Evidence: application A9, A13, A21, C7; benchmark B2.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 8.1 | The audit agent's walk of `/welcome` at 390 and 1280 (in flight) decides the order change. | lead (audit) | 1 | — | — | The audit report's first-run section |
| 8.2 | The order: the giver's note, then the seeded lesson, then the name and plan confirmation at the lesson's close; the twenty-second rule (4.8). | app (companion agent) | 2 | 0.5 d | 8.1 | One tap and under twenty seconds to the first field |
| 8.3 | The seed chooses from her Year 12 units first (decision 15): the soonest Year 12 paper in teaching order, with a hero, else the fallback. | app | 3 | 0.25 d | — | `seed.test.ts` updated; on the default plan the seed is an FM1 or M4 topic |

---

## Stream 9. The review promise and the loop she can see

Evidence: application A17, A23, R06-3.5, R06-4.2, R06-9.5, R06-12.2, R06-15.5, R07-15, R09-5, R09-6; benchmarks B12, B13, B17.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 9.1 | "What returns when" on every close card (4.6). | app | 1 | — | 4.6 | as 4.6 |
| 9.2 | The retention trade-off in words: one paragraph in Settings under "Reviews"; one sentence on the close card when the target rises in the paper fortnight (R06-3.5). | app (surfaces) + companion copy | 2 | 0.5 d | — | Present; the sentence appears only within 42 days of a paper (fixture) |
| 9.3 | Calibration per unit in the Ledger: sure-and-right, sure-and-wrong, the over-confident topics named (R06-12.2). | app (surfaces) | 3 | 1 d | — | Fixture with known confidences renders the expected line |
| 9.4 | "Your traps" by misconception id with the examiner's label, last seen and next return; a misconception seen three times queues a different item carrying the same tag (R06-9.5). | app (surfaces + engine) | 4 | 2 d | — | Fixture; the queued item is not the one she missed |
| 9.5 | "Before the paper": one page per unit with her ten most-missed scheme steps and the item that returns each (R06-15.5). | app (surfaces) | 5 | 1.5 d | 9.4 | Renders for M4 on a fixture; nothing when she has no misses ("Nothing to carry in") |
| 9.6 | Time-to-mastery: topics proved this month and the sessions each took (R06-4.2). | app | 6 | 1 d | 0.14 | Fixture |
| 9.7 | Predicted recall per unit on its paper date on the Map, beside the Proficient count (R07-15). | app (surfaces) | 7 | 1 d | — | The same average as the review close; fixture |
| 9.8 | The Map walk (companion spec §6): summits per paper, the path per unit in teaching order, the marker for the next stretch, path darkness keyed to retention, nothing worsening with absence; inside its own scroll container at 390. | app (surfaces with the companion agent) | 8 | 3 d | 4.5 | The identity test at day 1 and day 30; the five questions on the Map |
| 9.9 | A goal line per subject in UMS terms ("A in M4 and M8, 340+ UMS"), set in Settings, shown on the Map beside the forecast (R09-5). | app | 9 | 0.5 d | 9.7 | Stored in the plan; shown; never a verdict |
| 9.10 | A printable one-page summary (proved, returning, marks recovered, days to each paper) (R09-6). | app | 10 | 1 d | 9.6 | Print CSS at A4, nothing cut |
| 9.11 | FSRS parameters re-fitted from her review log once it holds ~1,000 reviews (R06-3.1). | app | 11 (later) | 0.5 d | data | The re-fit improves log loss on her own history; the settings say when it last ran |

---

## Stream 10. Offline and deployment

Evidence: application A10, A20, R07-13; benchmark B18; docs/dev/deploy.md.

| # | Item | Owner | Order | Effort | Depends on | Acceptance |
|---|---|---|---|---|---|---|
| 10.1 | The deployment decision: local `serve` on the home Wi-Fi with "Add to Home Screen", or the private noindex Vercel URL, or both (the owner's open decision 5 in the master plan). | lead | 1 | — | — | Written in docs/dev/deploy.md with the date; her phone has the installed app |
| 10.2 | The full offline copy verified after every build (`e2e/offline.spec.ts` alone), and the copy re-requested on her phone after each new version. | lead | 2 | per build | — | The spec green on each build; the Settings line says "Every topic and paper is ready offline." |
| 10.3 | A fortnightly backup reminder as one quiet line in Settings and once on a close card (emotional-design rule 8). | app | 3 | 0.25 d | — | Appears after 14 days without an export; never a modal |
| 10.4 | The install hint once per device (4.7). | app | 4 | — | 4.7 | as 4.7 |
| 10.5 | Text spacing (2.10) and the theme default kept at "follow device". | app | 5 | — | 2.10 | as 2.10 |
| 10.6 | The plan editor carries her Further Maths entries (today it has none, `SettingsPanel.tsx:327-430`, so the FM1–FM3 entries confirmed on first run cannot be changed; audit §4) and one accent button per page (three today). | app (surfaces) | 6 | 0.5 d | — | FM1–FM3 editable; one accent-filled control on Settings |

---

## Stream 11. What the sister asked for on 13 September

From docs/plan/review/2026-09-13-learner-experience-review.md §1 and the memory of that day: appearance not very nice; she liked the content, the videos and the interactive questions; she disliked the pre-check gate before anything; she ignored questions that had to be written on paper; she liked the ordered topic list; she found a topic page badly structured, intense and unattractive for a first-timer.

| What she said | Where it stands (evidence) | What this programme does about it |
|---|---|---|
| The pre-check comes first before anything | Fixed 14 Sep: teach-first; the check follows the lesson and the recheck follows practice (`flow.ts:58-73`; 03-implementation-plan must-not-change 3) | Guarded: no gate, check, diagnostic or question before the first teaching section, in every pass and in Slides (3.2) |
| Some questions have to be written on paper | Fixed: 3 drawing parts of 3,596 remain paper-marked (marking-evidence §11) | A photo fallback for the three, stored as data URLs so the export keeps them (0.5 d, engine, wave 4) |
| Not well structured, intense or attractive for a first-timer | The hero, the spine, the recap, the pause and the close card landed 19–20 Sep (C3, C4); the layout squeezes the lesson (decision 1, 2.1); the look is "competent, not yet DeepStash-grade" (RESUME-STATE 19 Sep) | 2.1 (the lesson is the page), 2.2–2.3 (surfaces and the marked answer), 3 (Slides as the first-visit way in on a phone), 1.2–1.3 (depth that keeps the strong opening going), 2.9 (icons and motion), 4.5 (a face at the seams) |
| Appearance | Pass 1 (tokens and type) done 22 Sep; passes 2 and 3 queued | 2.1, 2.2, 2.9; the critique's amendments as acceptance |
| She liked the content, the videos and the interactive questions | Kept: 183 topics, 154 gated videos, 3,596 auto-marked parts | Deepened (1.x); every video gated by lint (0.9); figures that react (2.6, 2.8) |
| She liked the ordered topic list | Kept: the unit list in teaching order; only the difficulty meter and the "Lesson and practice" pill leave (2.2) | Plus one "Practise this topic" link (5.1) and, on a completion unit, the "Assumed from M1–M7" recess (R04-1; 1 d, surfaces, wave 3) |
| The four things to check at the next sit-down (review §7.5) | Was she taught before tested; could she answer everything on screen; did the first screen say what the topic is; did she know when she had finished | The lead's sit-down at the end of wave 2, on a Year 12 topic in Slides and in Read, plus the companion's four questions (does it know me, does it get in the way, is it embarrassing, would you miss it) |

---

## The month, in waves

Dates are the lead's to move; the order is not. Wave boundaries assume the cap of twenty agents and the coordinator's budget; the content lines run through every wave.

**Wave 1 (23–29 September): foundations, the standard, the page.** Done on 23 Sep: the audit walk (docs/plan/review/2026-09-22-platform-audit.md) and the depth standard (1.1). In flight: decision 1 and pass 2a–2c (2.1), Rowan present from day one (4.1, now including the Today race), the FM3 B and FM2 C fixers. As slots free, in this order: the engine agent with stream 0's wave-1 items (0.1–0.5, 0.7, 0.8, 0.12, 0.13, 0.17–0.19); the surfaces agent (2.2, 2.3, 0.11, 6.1, 10.6); the practice agent (5.0, 5.1). Content: the FM1 fixer repairs the exemplar's two gates (1.13) first; three authors on the Year 12 remainder (1.4: FM3's two, B2's five, C2's six, P2's ten); the depth pilot (1.2: laws-of-logarithms, then tangents-and-normals) starts now. Lead: builds and Playwright alone after each landing; the character brief (4.4) written against benchmark page 14; the deployment decision (10.1). End of wave: the topic page is the lesson; the marked card is unmistakable; the two pilot topics are at the standard; Rowan speaks on day one.

**Wave 2 (30 September – 6 October): Slides, the character, practice, the ladder.** App: the slides agent (3.1–3.3) once 0.8 and 2.3 are in; the flashcards agent (7.1) once 2.2 is in; the character implementation (4.5) once 4.4 is approved; the companion agent (4.2, 4.3); the practice agent (5.2–5.4); the engine agent (0.6, 0.9, 0.10, 0.14–0.16, 5.6). Content: the depth roll-out on FM1 and FM2 (1.3); Unit 7 authoring (1.5) with the practical component (1.6); the media pass (1.9); the prompt rule (1.10). Lead: the Slides judgement (3.4); the first sit-down with her (stream 11's eight questions) on a Year 12 topic, in Slides and in Read; the honest note on what she said, filed.

**Wave 3 (7–13 October): roll-out and the loop she can see.** App: Slides to every Year 12 topic (3.5); icons and motion as pass 3 (2.9); the wrong-answer figure (2.6) and the QWC builder (2.7); the companion's Sunday letter, returns list and ICS (4.6, 4.7); the Tonight sequence and the governor (5.5); the loop items 9.2–9.7; papers 6.2–6.6; the FM display-maths and figure floors (2.4, 2.5); the "Assumed from" recess. Content: depth on FM3, M8 and M4 (1.3); C1 and P1 authoring begins (1.7); SSDD sets for Year 12 H topics (1.8); QWC fields (1.11). Lead: builds; the second read of the pilot topics after the roll-out.

**Wave 4 (14–23 October): the picture, the map, the sheet.** App: predict-then-reveal (2.8); the Map walk (9.8); the traps, the "Before the paper" page and the printable summary (9.4, 9.5, 9.10); the goal line (9.9); the flashcard card kinds (7.2); the first-run order (8.2, 8.3) if the audit asked for it; the paper question index by topic (6.7); the photo fallback (stream 11). Content: depth on B2, C2 and P2, then Unit 7 (1.3); C1 and P1 continue (1.7); the deck quality pass (7.3); explainer clips begin only if the content lines are ahead (1.12). Lead: the second sit-down; the honest status report (better / equal / behind against Bitesize, Seneca, Anki, Duolingo) written from what she did, not from what was built.

**Not in this month, by decision:** Foundation maths (R04-6), the bridge to A level (R09-7), an Irish-medium toggle (R05-10), MathJax read-aloud (R07-14), original mocks before the content backlog (6.8), any streak, XP, league or notification.

---

## Acceptance across the programme

1. Every item above has its named test, and the agent's report quotes the test's result, not a description of the change.
2. Every surface touched answers the five questions from the pixels in the agent's report: what did she just do, what is the immediate feedback, what should she understand, what should she feel, what happens next.
3. Playwright runs alone (never under a build) and every spec that touches the surface is green; a one-minute timeout under load is not a regression and is re-run alone before it is believed.
4. `npm run content:check` prints 0 problems; `lesson-v2.mjs`, `figure-leaks.mjs` and `shingles.mjs` print 0 for every unit an author files.
5. Nothing is labelled: a mode, a card, a character or a format exists when its promise is true in the data. "It comes back on Thursday" is printed only where a card exists; a minute is printed as "about" until timing data says otherwise; a stone is placed only by the engine.
6. The three standing rules hold at every checkpoint: emotional-design (no shame, no loss, no rewards, "Wrong" never appears), containment (nothing signed inside a question), CCEA truth (nothing copied; the shingle test at 0).
7. Year 12 first, in every stream, until the owner says otherwise.

---

## Closing page: what she gets here that Bitesize, Seneca and the pile on her desk cannot give her

Written to be read by her, and true on the date given. The pile on her desk is the specification, the past papers, the mark schemes and Corbettmaths; Bitesize is the one free site that is correct for CCEA; Seneca is the app her friends use.

**True today (23 September 2026).**

- Seneca does not cover CCEA at all: its own course list names nine boards and hers is not one of them (research 04 §2.7, 05 §2.4). Bitesize covers CCEA correctly and stops at reading: no record of what she got wrong, no marking, and the consistent student verdict that revising from it alone lands around a B (quality bar Part A). Everything here is CCEA-true from the statement id to the mark code, and every question is original.
- 183 topics with a lesson she answers as she reads: 1,433 gates, 863 recall prompts inside the notes, 430 worked examples with every step's reason and the mark it earns, 3,596 auto-marked question parts carrying 7,734 marks in CCEA's own M, A, MA, W and P language, with method marks paid from the working she types. Her Year 12 maths is all but complete: M4 9 of 9, M8 15 of 15, FM1 29 of 29, FM2 16 of 16, FM3 14 of 16, where no interactive practice for CCEA Further Mathematics exists anywhere else (counts of 23 September; the notes' totals in this paragraph are from the 180 bundles counted on 22 September).
- 458 Chief Examiner findings, each with its series and question number, turned into the traps on the topic sheet, the wrong options in the checks and the find-the-mistake items; 4,324 named errors so that a wrong answer is diagnosed ("the one third has been left out, so that is a cylinder") rather than marked; 60 "not on this spec" notes telling her what to stop revising.
- Everything she gets wrong, or right without confidence, comes back: every marked item makes a review card, a sure-and-wrong answer returns in two days and again in seven, the schedule tightens towards each paper's date and never lets a review fall after it, and a topic is "Proficient" only when she proves it again later in a mixed set.
- Her eleven papers on their real dates with the rules nobody explains (the 40% terminal rule, one resit before cash-in, November 2027 resit-only); a timed run of any official paper; her raw mark turned into UMS and a grade with the A* band, which no calculator for CCEA Maths offers anywhere.
- 40,839 verification checks behind a "Checked" panel: she can see what was verified before a question reached her.
- No account, no adverts, nothing sent anywhere, the whole product on her phone without signal; and a companion, Rowan, that speaks from her own work and never nags. Nothing is withheld behind a paid tier either: every benchmark studied sells the part that matters (Photomath's step reasons, Quizlet's long-term spacing, Seneca's wrong-answers mode, Brilliant's lessons beyond the first, Headway's summaries beyond one a day; docs/plan/review/2026-09-23-benchmarks.md page 18), and here nothing is sold, withheld or renewed.

**What is merely equal today, said plainly.** The videos are other people's (Corbettmaths, Cognito, Freesciencelessons), placed at the point of need with a question after each, but not ours and not offline. The flashcards are a good deck on a good schedule, as Anki is. The look is competent and calm, not yet the craft of the best apps. A wrong answer is explained in words; the diagram does not yet change. Practice is one mode.

**What is behind today, said plainly.** Complex topics are taught in 400–900 words with one or two worked examples where the standard needs four; C1 and P1 have two lessons each and Unit 7, a quarter of her science grade, has none; Rowan is built and mostly silent; her confidence is collected on 1,452 checks and never shown back to her.

**True when the named work lands.**

- *After stream 1's depth pass and the Year 12 authoring:* every Year 12 topic teaches each method the paper can ask, with a worked example per method, a ladder to the A* boundary and a synoptic exam question; FM3, B2, C2 and P2 complete; Unit 7 with a trainer for every prescribed practical and Booklet B's questions, which no product offers for CCEA.
- *After streams 2 and 3:* the lesson is the page; a first visit on her phone opens as Slides — one idea per card, a question every few cards, six to twelve minutes — and Read keeps the depth; a wrong answer draws what she did against what was asked, before the words.
- *After stream 5:* five honest practice modes, including Weak spots that re-teach before they re-ask, Exam-style timed at the paper's pace with method marks on, and a Unit check that is the only way to "Proficient" across a unit.
- *After stream 4:* Rowan with a face at the seams and a memory in use — her own note quoted on her next arrival, a Sunday letter with a plan she edits in one tap, "what returns when" on every close.
- *After stream 9:* the loop she can see — her predicted recall per unit on the paper date, her over-confident topics named, her ten traps before each paper, and a page she can print.
- *After stream 7:* flashcards to Kinnu's standard, one card per screen, twelve a session, each button saying when the card returns.

**What it will never claim.** A grade. That it replaces her teacher, the official papers or Corbettmaths (it links to them at the moment they are useful). That it knows her better than she does. A "2× faster" figure, or a streak she could lose. It will show her the numbers so she can judge for herself within three weeks, and it will say, on every counter, what is built and what is not.

