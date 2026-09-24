# Cairn upgrade review

## 1. What she said, and what is actually causing it

**"The pre-check comes first before anything."** It is worse than first. `src/components/topic/TopicContent.tsx:80` sets `const locked = preItems.length > 0 && !preDone;` and passes `dim={locked}` at lines 133, 174, 180, 197, 205, 213, 221, 236 and 244. `Section` (line 38) renders a dimmed section as `pointer-events-none opacity-40` with `aria-hidden`. Live on the frustums topic, eight of nine `section[id]` elements plus the See-it wrapper are hidden: the note, the video she liked, the worked examples, the practice, all of it, at 40% opacity and untouchable. All 92 topics ship a pre-check (4 items in 10 topics, 5 in 13, 6 in 24, 7 in 11, 8 in 34). Each item costs four interactions (option, confidence, Reveal, Next), so 45 of 92 topics demand up to 32 taps under an eyebrow that claims "Two minutes" (`:101`). The one exit is a 13px grey "Skip the pre-check" link placed *below* the card (`:122-124`) which writes nothing to storage. Nothing is persisted: `preIndex`/`preDone` are `useState` (`:49-50`), and `initiallyAnswered` on `StepRevealNote` has no caller anywhere, so every return visit re-locks the topic and re-hides the note behind its gates (median 8, max 17).

Two aggravations. `DiagnosticWithConfidence.tsx:119` prints `item.skill` beside the stem; on frustums the label "Know that a frustum is a difference of two cones" sits next to option A, "Large cone − small cone". And the completion line "Pre-check done. The Sheet below highlights what it found." (`:127`) is untrue: the Sheet is static `bundle.note.sheet`.

Important: the lock is deliberate. `docs/plan/concept-B-learner-experience-first.md:82` mandates it. The plan must be amended in the same change or it will be reinstated.

**"Some questions have to be written on paper."** `QuestionRunner.tsx:30` adds a policy clause on top of `isAutoMarkable`: `&& !(part.answer.kind === "text" && part.marks >= 2)`. The schema itself refuses only 66 of 1,865 parts; the clause pushes the total to **375 parts (20.1%) and 1,037 marks (24.7%)** into "Write this part on paper as you would in the exam" (`:183`). By subject: maths 121/1,176 (10.3%), further maths 12/160 (7.5%), **science 242/529 (45.7%)**, B1 alone 209/394. Worst topics: further-maths quadratic-inequalities 10/10, b1-photosynthesis-investigations 15/18, b1-food-tests 9/11, b1-enzymes-and-digestion 12/15. On b1-enzyme-factors, eight of the ten live parts say "on paper"; the two she can answer are the 1-mark ones. Her first practice question there, "Give two factors that affect the action of an enzyme. [2]", is paper-only.

**"Not well structured, intense or attractive for a first-timer."** No `lede` is passed to `PageHeader` on any of the 92 topic pages, so there is no sentence of orientation above the fold: eyebrow, title, five difficulty squares labelled "Hard", a mastery chip, a seven-link jump nav (against nine sections, `md:flex` only), then the quiz. The first teaching artefact is the Sheet, a reviser's object: median 9 "you must be able to" bullets, 757 trap lines corpus-wide, mean 403 words, all set at 14px, against its own written spec of "≤150 words and one diagram" and an eyebrow reading "One screen". Inside the notes, 61 of 92 open with a spec callout rather than teaching; 83 of 92 hooks lead on marks, a series or an examiner verdict, because `pipeline/prompts/author-topic.md:17` instructs exactly that; the median note goes 207 words before its first picture, and no note in the corpus places a visual before its first paragraph. Across the platform there are 1,237 statements about losing marks against 37 "why it works" callouts. No note has a recap; 81 of 92 end on "In the exam" followed by a dump of retrieval prompts.

**Appearance.** One card recipe (`border border-line bg-surface`) appears 56 times, so a diagnostic, a note and a reference link look identical. Five subject tint tokens are defined in `app/globals.css` and used in zero components. The h1-to-body ratio is about 1.7:1 with study prose at 14px. `ProgressLine` exists and is used on three other routes, never on a topic page.

**Not in her list, but structural:** `src/lib/session/record.ts` creates a review card only for `prompt`, `diagnostic` and `recall`. Practice misses, exam-style misses, failed note gates and missed find-the-mistake items never come back, contradicting `why-this-platform.md:13`. And `onTwin` ("Fix it now") exists in `FeedbackCard` with no production caller.

## 2. The proven learning model to adopt

**First-time learning** follows the worked-example effect and guidance fading (Sweller and Cooper; Renkl; Atkinson, Renkl and Merrill on backward fading) and expertise reversal (Kalyuga et al.): idea and picture, then a fully worked example, then completion problems, then unaided problems, with instruction never withheld. Rosenshine's small steps and Mayer's segmenting give the shape: short stretches, one check each, a visible spine.

**Revising** follows successive relearning (Rawson, Dunlosky and Sciartelli): relearn to criterion, then space. This is where confidence-based marking and hypercorrection (Butterfield and Metcalfe; Foster et al.) earn their keep, because only a learner with prior knowledge can produce the confident error the mechanism acts on.

**Exam practice** follows transfer-appropriate processing and interleaving (Rohrer et al. 2020, d = 0.83 at one month): mixed sets, CCEA layout, delayed feedback, then criterion-referenced self-assessment against the scheme (Sadler; Sanchez et al., g ≈ 0.34 conditional on rubrics).

**The pre-check.** Pretesting is real, but its benefit is specific to the pre-questioned content and depends on the instruction arriving immediately and on the item being re-encountered. So: the lock is deleted outright. On a first visit, three or four prerequisite items, no confidence row, honestly labelled ("You are not meant to know these yet"), optional, never dimming anything. The remaining authored items become the post-instruction check, where confidence and hypercorrection belong. This needs no re-authoring: 344 of the 598 diagnostics are already tagged `when: "both"`, and `TopicContent.tsx:74` filters only `!== "post"`, so nothing in the corpus is currently tagged post and no post renderer exists yet. Review-card creation is *deferred* to session close or the post-check rather than blocked, and `ensureCard` is extended to every item kind so her actual misses come back. Three internal documents disagree on item count (4, 4-6, five) while `author-topic.md:11` asks for 6-8; settle on 3-4 pre, the rest post, and change brief and renderer together.

## 3. Topic page v2

**Above the fold:** title; a two-line plain-English hook taken from the note's own idea ("Cut the point off a cone and what is left is a frustum"); three "by the end you will be able to" lines written for the hero, not the authored terminal objectives; the topic's own labelled figure, promoted to a `hero` field; an honest session estimate; one primary button "Start the lesson" and one secondary "I have done this before". No tariff, no series, no trap, no difficulty verdict on the first screen.

**Lesson template:** numbered sections, one visual and one gate each, a stage spine that works at 375px. Section eyebrows become learner verbs with a computed minute cost, replacing "One screen" and "Ladder, then mixed".

**Worked examples:** move one *inside* the note as section 4, before the first demanding gate. Fix the ladder order to `["full", "faded1", "faded2", "twin", "problem"]`; the project's own gallery (`ItemsGallery.tsx:192`) already uses it, so `TopicContent.tsx:272` is an internal inconsistency, not a judgement call. Advance on a correct step, drop back a rung on a miss.

**Practice:** one question per screen with a progress line, then the authored `sets` (84 of 92 bundles have them; 8 need an empty state), which no component currently renders. Wire `onTwin` so a miss offers the twin.

**The Sheet:** ends the first-time path as a collapsed "In the exam" panel carrying the traps, "How it is examined" and every examiner finding once (only 51 of 92 topics have an insight card, so define the empty state). It is the landing card on the reviser path.

**Reviser path:** Sheet first, then a 4-6 item check with confidence, then route to the failed skills at the faded or problem level, then the mixed set, then a close card with marks recovered and what returns when. The branch must key on an explicit flow flag, not on `mastery.level`, because a pre-check attempt already flips a first-timer to "attempted", and `useLiveQuery` returns undefined on first render.

**Screen order (first visit):** hook and figure → session map and one button → section 1 idea + gate → worked example → sections 2-5, each one visual and one gate, videos kept inside the note where all 64 are already followed by a gate → recap card → practice one at a time → post-check with confidence → exam-style and find-the-mistake → collapsed "In the exam" → close card and stone.

## 4. Every question doable on the platform

**Step 1, delete the clause at `QuestionRunner.tsx:30`.** 309 of the 375 self-marked parts (**82.4%**) and 774 of 1,037 marks (**74.6%**) become auto-marked with zero authoring: all 309 carry an `accepted` list and 304 carry keyword groups, and `mark.ts:166-187` already shares a tariff across groups proportionally, so the 35 whose groups do not sum need no special handling. Only 5 parts with no groups degrade to exact match. Ship the "the scheme says… / award yourself the mark" override in the *same* commit: the unmeasured risk is telling a correct paraphrase it is wrong, which for a learner aiming at A* is worse than self-marking. Batch-test all 309 against their own worked solutions first.

**Step 2, three small fields.** `TableField`, `StepsField` (reuse `OrderField` and `markOrder`), `LabelField`: 36 parts (**9.6%**), 94 marks. Sending "Complete the results table. [1]" to paper is the clearest case of the platform under-selling itself.

**Step 3, a QWC surface.** 27 `text-long` parts, 162 marks (**15.6%** of the self-marked pile), 197 indicative points every one carrying keywords, four authored bands each. Textarea, keyword checklist as *evidence*, band descriptors as the decision.

After these three, **3 drawing parts of 1,865 (0.16%)** remain genuinely paper, and they get a photo fallback stored as a Dexie blob and included in the export.

**Step 4, the bigger prize: method marks.** 993 auto-marked multi-mark parts carry **1,827 method marks (43% of all 4,206 marks)** that the platform never awards, because numeric, algebraic and equation parts score `v.correct ? marks : 0`. Scheme codes across the corpus are 68% method (MA 1,109, P 977, M 426, MW 216, W 134) against A 1,182. 873 parts are already flagged `requiresWorking`, a field no component reads; 791 of them carry `dependsOn` chains naming the step order. Add `check?: AnswerSpec` to `MarkPoint` and a `WorkingLadder` that marks line by line. The line comparator already exists and ships: `fixMatches` in `mistake-marking.ts`, used by 180 find-the-mistake items. Make the ladder opt-in on the first-time path and default on for exam-style, or it lengthens exactly the page she found too intense.

**Step 5, faded steps.** Only 17 of 1,044 worked-example steps carry an `input` spec, so 98% end on an "I had it / Not yet" honesty button. Wiring `fixMatches` into the fallback gives a real verdict on roughly 707 of 1,027 steps (**76%**) with no authoring, phrased as "that matches the line I had" until backfilled specs exist.

## 5. Appearance

Direction: a printed-lesson feel. Three surface levels instead of one; subject colour as wayfinding on chrome only; a real type scale; the platform's own figures doing the visual work. No commissioned hero photography and no illustration programme: decorative imagery is a named anti-pattern in the project's own research, and `author-topic.md` already requires every photo to carry a prompt.

1. Delete the lock and the `dim` mechanism (`TopicContent.tsx:38, 80, 174`). This also clears a live WCAG 4.1.2 failure: `pointer-events-none` leaves buttons and links inside `aria-hidden` sections in the tab order.
2. Topic hero with lede, figure and one button (`app/learn/[subject]/[unit]/[topic]/page.tsx:51-60`, `PageHeader.tsx`).
3. Lesson spine and `ProgressLine` on the topic page; replace the seven-link `md:flex` nav with a stage bar that works at 375px.
4. Three surfaces: prose on the page ground, cards for interactive items only, recessed reference (`ui.tsx:23` plus the 56 call sites).
5. Type scale as tokens: h1 32, h2 24, learning prose 17-18, meta 13. Raise every `text-[14px]` in `TopicContent.tsx:136-168`.
6. Subject tints wired to `data-subject` (`globals.css:31-35, 61-65, 111-115`).
7. Two-colour figure treatment (`src/components/figures/generated.tsx`), and hoist the first figure above its explanation.
8. Rewrite the nine section eyebrows as verbs with computed minutes (`TopicContent.tsx:101, 133, 180, 197, 205, 213, 221, 236, 244`).
9. Server-render hero, Sheet and note so the lesson paints before the reference rail. Note the cost: `contentFor` returns a manifest row only; this needs a new build-time read of the bundle JSON.
10. Mobile shell: a "More" destination for Flashcards, Ledger and Settings (`Nav.tsx:63-76`); default the theme to `system` (`ThemeProvider.tsx:25`).

Deferred, because they solve no complaint she raised: the unit-list spine (she praised that screen as it is) and the Today rebuild (she did not mention it).

## 6. Migration and authoring

**Brief (`pipeline/prompts/author-topic.md`).** Rewrite lines 13-26 into the v2 template with enforceable numbers; forbid a hook from naming a tariff, series, question number or examiner verdict; forbid a callout before the second teaching paragraph; require one visual before word 80 and one per section; require a recap and an in-note worked example; require at least one `why` callout and at most one examiner callout in the body. Change line 11 from "6-8 diagnostics" to a small pre-set plus a larger post-set. Split the marking-encoding reference out so the teaching rules are not buried. Add the checks to `build-content.mts --strict`, which today JSON-parses note blocks and validates nothing; note blocks are also absent from the Zod schema, so new block types need a renderer and pipeline change but no schema migration.

**Mechanical pass over the 92 notes** (one script): move the single spec callout and the `notonspec` callout out of the opening; move the "In the exam" heading and everything after it into the end panel (81 of 92 already have that heading last); hoist the first figure above its explanation (all 264 figures carry caption and alt, so nothing is rewritten); re-anchor the contiguous prompt tail to section boundaries (92 of 92); add section numbering and the worked-example binding; delete the title-repeating first heading where it applies, which is 33 of 92, not most.

**Authored pass:** 83 new hooks, 92 recap cards of three to five lines, 56 `why` callouts, and gate splits for the over-length runs. The over-length count is 41 of 92 at the existing 150-word rule, not 63; tightening to 120 words would push it to about 89, so argue that change on its merits rather than folding it in.

Migrate two topics end to end first: `science.b1.b1-enzyme-factors` (best-shaped note, worst paper wall at 14 of 22 parts) and `maths.m4.frustums-and-compound-solids`.

## 7. Order of work

The UX layer under `src/components` and `src/lib` belongs to the peer session; content, briefs and pipeline belong to this one.

1. **Delete the lock plus the `QuestionRunner.tsx:30` clause with the override** (peer, half a day each). These two changes alone answer two of her four complaints and she will see them the same day. Amend `concept-B:82` at the same time (this session).
2. **Remove the `item.skill` leak, delete the false Sheet line, cut the pre-check to 3-4 pre-items, persist flow state and gate answers** (peer, 1-2 days).
3. **Topic hero, section eyebrows, type scale** (peer, 2 days; hero copy for two topics from this session).
4. **Post-check renderer, confidence only after instruction, `ensureCard` for every item kind, `onTwin` wired** (peer, 2-3 days).
5. **Migrate the two exemplar topics** (this session, 2 days), then **sit with her for twenty minutes** and check only her four things: was she tested before being taught, could she answer everything on screen, did the first screen say what the topic is, did she know when she had finished.
6. **Spine, three surfaces, one-question-at-a-time practice, close card, fade order fix, render `bundle.sets`** (peer, 4-5 days).
7. **`TableField`, `StepsField`, `LabelField`, QWC surface, `fixMatches` in faded steps** (peer, 4-5 days).
8. **Brief rewrite, `build-content.mts` structural checks, mechanical migration of the remaining 90** (this session, 3-4 days), then the authored pass by unit batches.
9. **`WorkingLadder` and `MarkPoint.check`** (peer, 1-2 weeks), opt-in first.

Guardrail: net first-visit word count and interaction count must fall, not rise. The additions that pay for themselves are the ones that displace something bigger. Keep the desirable difficulties explicitly: gates, errorful generation, mixed practice, spacing, and delayed feedback on exam-style work. Also add an acceptance test that no section is ever `aria-hidden` while visible, and a per-subject lint on paper-only share.

## 8. What to keep

The notes themselves: the indices hook ("A power started life as a counter"), the enzyme graph-first opening, 264 captioned figures, 8.3 gates per note. The gate mechanic, with "Yes." / "Not quite." and no score. The fading worked-example machinery with per-step mark codes and why-menus. The humane feedback voice, where "Wrong" appears nowhere. The confidence scale and hypercorrection routing, which are a genuine differentiator once moved to where they work. `FindTheMistake`, the strongest interaction in the product and the model for everything else. The marking engines, which already do more than the UI allows: keyword groups, proportional plots, 2,336 authored common errors. The exam intelligence: mark-scheme codes, "Not on this spec", the Checked panel, examiner findings tied to named series. The cairn motif and the mastery wording (with the 70% threshold corrected to 80%, per the project's own evidence). And the unit list in teaching order, which she liked and which should not be touched beyond dropping the repeated "Lesson and practice".

## 9. Completeness critic: additions

- **Content coverage is the unbudgeted gap the plan never mentions.** `src/generated/manifest.json` holds 92 topics: maths 54 (M3, M4, M7, M8 only), science 27 (B1 21, B2 2, C2 2, P2 2, and **zero for C1 and P1**), further maths 11 (FM1 8, FM2 3, **FM3 0**) even though `src/lib/plan/exam-plan.ts:38` enters her for FM1+FM2+FM3 in 2027-Summer. Weeks of v2 redesign over the existing 92 buys nothing for roughly half her papers; cap the template work at the two exemplars plus the mechanical pass and run C1/P1/FM3 authoring alongside it.

- **Prescribed practicals need their own surface, not generic QWC.** `data/spec/double-award-science.json` lists 18 prescribed practicals and only about seven have a topic (B1–B6 plus C3); nothing covers C1, C2, C4, C5, C6 or P1–P4. Because Booklet B examines these as apparatus, variable, method and improvement questions (`packs/science/exam-true/booklet-b-item-types.json`), build a practical write-up component (apparatus list, IV/DV/control, ordered method via `StepsField`, results table, one improvement) as the destination for the science paper-only pile rather than pushing 27 `text-long` parts through one band-marked textarea.

- **The videos she liked are other people's and cannot go offline.** Every video block is a third-party YouTube facade (`src/components/media/VideoEmbed.tsx:26`, `youtube-nocookie`), and the packs carry 49 corbettmaths.com and 31 bbc.co.uk links, so the offline copy (`src/lib/offline-copy.ts`, `scripts/build-sw.mjs`) can never cache the one thing she praised, and it is the weakest answer to `docs/plan/why-this-platform.md`. Each video needs an offline-or-blocked fallback through the note's own figure and steps, and must not be a required stage on the spine.

- **First run teaches nothing about the product.** `src/components/gift/FirstRun.tsx` is two cards (a note from the giver, then a name field plus the pre-filled exam plan) ending in `router.push("/")` to the Today dashboard; nothing demonstrates a lesson, a gate, the Sheet, or what "Familiar" and "Proficient" mean before she is left to choose from a list of 92. End first run inside one seeded topic in the new lesson flow, explaining the vocabulary where it first appears.

- **Deleting the pre-check removes the only source of timing data the new hero depends on.** Of six `recordAttempt` call sites, only `TopicContent.tsx:110-116` passes `timeMs`; everywhere else `Attempt.timeMs` is null, so "an honest session estimate" and per-section minutes would be invented numbers. Pass elapsed `ms` from gates, practice and worked-example steps, and add an explicit stop-and-resume point at section boundaries so a twenty-minute school night ends cleanly instead of mid-note.

- **Progress has no exam currency and nothing she can show anyone.** Mastery level is the only signal; `src/lib/grades/ums.ts` and `packs/*/data-pack/boundaries.json` are wired to the papers route alone, and the sole shareable artefact is a raw database dump ("Export backup", `src/components/settings/SettingsPanel.tsx:133-134`). Feed attempts into a per-unit UMS/boundary view, and add a one-page printable summary (mastered, returning, marks recovered, days to each paper from `upcomingPapers`) for a parent or teacher.

- **No plan exists for the run-up to the papers.** `TodayTiles` links to neither `/papers` nor `/practise`, and the order of work stops at topic quality: nothing converts mastery plus `upcomingPapers` into a weekly target across topics, and nothing switches the product to whole-unit, paper-first work in the final weeks, although the timed papers route with official schemes and UMS and `MixedPractice` already exist. The successive-relearning argument is applied within a topic only; make the spacing cross-topic and dated against 2027-Summer.

- **Two feasibility corrections under `output: "export"`.** The service worker precaches by URL with `trailingSlash: true`, so the new lesson stages must stay inside the one topic URL — turning them into routes or query states will silently drop them from the full offline copy; and `exportAll` (`src/lib/db/export.ts:17`) `JSON.stringify`s every Dexie table, so the proposed photo-of-working Blobs will not survive a backup. Store them as data URLs or exclude them explicitly, in the same commit that adds the photo fallback.
