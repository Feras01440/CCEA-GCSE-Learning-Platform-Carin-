# Slides on the trial topic: what was built, what was measured, and the judgement before roll-out

23 September 2026, the slides agent (Fable), for the lead and the owner. Trial topic: Further Maths Unit 1,
Simplifying algebraic fractions (`fm.u1.algebraic-fractions-simplify`), on the phone (390 × 844) and the desktop
(1280 × 800), built exactly as the approved canvas draws it (docs/design/2026-09-23-art-direction-v2.md §8, scratchpad
mockups-v2/boards-slides.mjs). Nothing rolls out beyond this topic until the owner has used it and said yes
(src/lib/slides/ready.ts holds the list).

## 1. What changed (files)

New, mine:
- `src/lib/slides/cards.ts` — the pure card generator from `note.blocks.json` (title; a section's heading with its first
  paragraph as one idea card and later paragraphs as their own, split at sentence boundaries above 75 words; media, gate,
  callout, recap, pointer and recall cards; the close), `withRetries` (Duolingo's mistakes-at-the-end: a missed gate
  comes back once, just before the recap), the minute model and the promise line. `cards.test.ts`: 14 tests on the
  real note (24 cards from the note alone, 25 with the topic's registered figure-to-act-on; 7 gates; 4 recall; the gate
  ids in the note's order; retries; keys) and over every published note (184 notes, 1,525 idea cards, median 52 words,
  p90 69, max 75, none over the budget unless one sentence is; decks from 17 to 56 cards, median 26).
- `src/lib/slides/enrichment.ts`, `deck.ts` — the per-topic descriptor (pure data: an interaction after a named card,
  which cards carry a drawn illustration, which gate draws a consequence, the recap glyphs) and the one call every
  surface uses to count the same cards.
- `src/lib/slides/position.ts` — her place and the run (answers, misses, figures checked, grades) on the device.
- `src/lib/slides/returns.ts` — the day each grade brings a recall card back, from the product's own scheduler.
- `src/components/slides/SlidesRun.tsx` — the runner and the frame (one DOM tree for both sizes; one control; keyboard,
  swipe, focus; records through `recordAttempt` with the Read ids; the position).
- `src/components/slides/cards.tsx`, `ui.tsx`, `SlidesClose.tsx`, `StartButtons.tsx`, `enrich/afs.tsx`, `enrich/index.tsx`.
- `app/learn/[subject]/[unit]/[topic]/slides/page.tsx` — the static route, built for the ready topics only, the deck
  generated at build time so it works offline from the export.
- `e2e/slides.spec.ts` — 14 tests, run on both projects.

Changed, mine by the trial table:
- `app/globals.css` — an appended, dated block: the v2 tints per subject (`--tint-wash`, `--tint-mid`, light, dark and
  high contrast), the outcome washes, gorse, the stones, the hill scene and the hare's colours, the §8.4 rhythm tokens
  (`--fs-stem`, `--gap-stem-maths`, `--fs-stem-maths`, `--gap-maths-field`, `--gap-option`, `--h-option`, `--fs-option`,
  `--fs-verdict`, `--fs-card-title`, `--fs-card-prose`; phone values, md values at 48rem), the five motion tokens with
  keyframes and classes (fill mode `backwards`, static under reduced motion), the v2 subject accents scoped to
  `[data-palette="v2"]`, the lifted stem's display maths rule, and a reduced-motion rule for `[data-slides]`.
- `src/components/topic/lesson-way.ts` — readiness per topic, Slides the default on a first visit on both sizes,
  `rememberLessonWay`.
- `src/components/topic/TopicHero.tsx` — the two Start buttons became `<StartButtons/>` (five edits and one optional prop,
  `slidesCards`); the read agent then rewrote the hero around it and kept it.

Not mine, applied by their owners at my request: Nav.tsx `isChromeFree` for `/slides/` (read agent); page.tsx passes
`slidesCards` (read agent); `CompanionScene` (character agent) is the close card's scene.

## 2. What was verified, and how

Unit: `npx vitest run` 61 files, 1,308 tests green; `npx tsc --noEmit` exit 0 (23 Sep 21:24).

On the dev server (`web`, :3017), by measurement in the browser (getBoundingClientRect, getComputedStyle, IndexedDB read):

Phone, 390 × 844, dark and light. The title card is one screen (body scrollHeight equal to its clientHeight after the
two-sentence lede and the 248 px stage), one accent-filled control ("Start the slides"), no navigation in the DOM. Idea
cards fit (586 of 586 px); prose 20 px Literata. The first gate: stem 20 px 600, options 52 px, Check disabled until a
choice, Enter checks, the digits choose; right: the option lit in fern (edge lab(74 −37 23) in dark, the tick badge),
"Yes." in fern, "Recorded. It comes back in your reviews."; the record in IndexedDB is
`fm.u1.algebraic-fractions-simplify#gate:g1`, itemKind practice, and a review card exists for it. The idea card with
the drawing: the cancelled bracket on its stage, smallest label 16.6 px (the drawings' labels were raised from 13 to 15
viewBox units after measuring 12.1 px). The g2 miss: her option edged in the warm neutral (lch(40 3 85) light, lch(70 3 85)
dark) with the circle-dash, the right option lit, "Not quite." in ink at 21 px, the substitution (x = 1: 5 ≠ 4) drawn
before the words, "This card comes back once more before the recap", the track grown to 26; no colour within 20° of red on
the card. The figure she acts on: pairing (tap (x + 5) top, then (x + 5) below: both strike with the 250 ms react motion),
a mismatch named ("2x and (x − 5) are not the same factor, so nothing divides out"), the numbers as the last pair, Check,
x over 2(x − 5) rising in. g4 after the video: "Check · watching is not practice", "Simplify" then the fraction on its own
line at 28 px. The examiner and why callouts as recesses with the series cited. The retry of g2 before the recap ("Once
more"; "Asked again, and held. The first answer is the one on record."; no second attempt row). The recap with its three
glyphs and "The check you missed came back before this card, and held." The pointer. Four recall cards: Show the answer,
then Again / Good / Easy in the foot with the scheduler's return day under each. The close: "Done for tonight.", "7 checks
answered · the one that came back held · 4 recall cards graded", the hare on the hill by the cairn (CompanionScene),
Rowan's session-close line, "What returns" grouped by day and topic, "Done for tonight" (accent) and "Practise this
topic" (outline), "Saved on this device."; no answer field on the card; `document.getAnimations()` 0 at rest.

Desktop, 1280 × 800, dark and light. The whole screen is the card: the wash header band 126 px with Exit at the left, the
segmented track 720 px wide centred at x 280, "n of N" beside it, the label and title on the 1000 px measure; the body at
x 140, 1000 px, two columns (the gate object 544 px, the verdict at 400 px; the idea's prose 22 px in 544 px with the
wash stage at 400 px); previous and next at x 40 and x 1196; the bottom bar 85 px with the keyboard hints at the left
and the 300 px control at the right. The title and the close are full-bleed two-column screens (the title's figure
panel on the wash at 520 px; the close's tall scene 520 × 800 with the hare and the cairn, the facts, Rowan's line,
the returns, two exits). Stem 22 px, options 18 px, title 28 px. Light: the accent is heather lab(46 40 −23) with white
text; dark: lab(76 35 −20) with the dark ink.

Playwright (`e2e/slides.spec.ts`, run alone against the dev server through scratchpad/platform/trial-slides/
pw-dev.config.ts, reducedMotion "reduce", Desktop Chrome and Pixel 7): the verbatim results of the final run are in
section 6.

## 3. The five questions, per card kind

See scratchpad/platform/trial-slides/five-questions.md for the full text; in one line each, answered from the pixels:

- Title: what this is and how long, in five seconds; one drawing, one control; the counts are the deck's real counts.
- Idea: one section title, one paragraph of at most 75 words, the drawing where the card has one; the words are the note's.
- Figure she acts on: a verb and five pills that are what they say; pairs strike, a mismatch is named, Check draws the answer.
- Gate: one question, three 52 px options, one control; marked by the note's own answer; recorded once under the Read id.
- Gate, a miss: the right option lit, hers edged in ink, "Not quite.", the consequence before the words, back before the recap.
- Examiner and why: a titled recess, the series cited; no benchmark app cites the examiner.
- Recap: what she can now do, with a glyph each, and the honest note about the retry.
- Pointer: the tariff, the question's place, the command word, the last mark, from the papers.
- Recall: the prompt, the answer with the scheme's key words, three unaccented grades that say when the card returns.
- Close: the scene, the facts, Rowan's line, what returns and when, two exits; no score, no confetti, no answer field.

## 4. Judged against Duolingo, Kinnu and Brilliant (benchmarks page 4)

Where we are equal: one idea per screen, one control, a thin track, a lock at every gate, the missed items back before
the end (Duolingo); the tile length and "answer to move on" (Kinnu); a diagram she changes with a consequence drawn before
the words (Brilliant, on the tap card and on g2).

Where we are ahead: the content is CCEA's and the note's, with the examiner's own finding on a card; a gate is retrieval
recorded as a review card with a real schedule, not a drill; the recall cards say the key words the scheme rewards and when
they return; the close says what returns and why; nothing asks for a streak, hearts or a purchase; the character stands
at the seams and never on a question.

Where we are behind, honestly: illustration coverage. On this topic one idea card carries a drawing, one card is a figure
to act on and one gate draws its consequence; Kinnu paints every tile and Brilliant puts a diagram on most screens. The
other six gates end in words. The note's own figure (690 × 300 with 12.5-unit labels) fails the 13 px floor, so the drawn
cards here are code-side drawings registered for this topic; a second topic gets the same treatment only when its
drawings are made. That is the cost of roll-out, and it is real: a topic without registered drawings shows its authored
figure on the title card and has no figure to act on.

## 4b. The seeded option order (engine item 11, 23 Sep 21:17)

The engine agent made Read show a choice gate's options in `gateOptions(gate)` order: a shuffle seeded by the gate's id and
prompt, the same on every device, so the answer is not always A. Slides adopted it the same evening (the read agent's
heads-up): the gate card renders `gateOptions(gate)`, every option button carries `data-value` (the authored text, the
value marked and recorded) beside `data-option` (the shown position), and the desktop's digits choose by the shown
position, which is the letter the badge prints. Marking is untouched: `markGate` sees the option picked. The spec finds an
option by its value in the page, never by its place.

## 5. Owed, and what the lead should decide

1. **A global reduced-motion defect, not Slides'.** app/globals.css's pass-1 rule sets `transition-duration: 0.01ms
   !important` on every element under `prefers-reduced-motion: reduce`; with CSS's default `transition-property: all`,
   a focus outline then becomes seven transitions (four border radii, outline colour, offset and width) that Chrome keeps
   listed by `document.getAnimations()` on the focused element (measured on the card title, probe in
   scratchpad/platform/trial-slides/probe-animations.mjs). Slides is made static by an appended rule scoped to
   `[data-slides]`; the character and read agents' `getAnimations().length === 0` checks will meet the same thing on any
   focused element. The fix belongs in the pass-1 block: `transition-property: none !important` beside the duration.
2. **g2's wording.** The canvas drew "What cancels in this fraction?" with the fraction on its own line; the note says "In
   $\dfrac{x+4}{x}$, what cancels?", which is mid-sentence under the shared gateStem rule and stays inline (line-height
   1.6). If the content owner wants the canvas's rhythm, the prompt can be authored as "What cancels in this fraction?
   $\dfrac{x+4}{x}$" (the gate's answer and id unchanged).
3. **Videos are named, not timed.** The title card says "1 video" and the minutes exclude it; the block carries no length.
4. **H notes in two parts.** The depth standard's break after the first "See it done" is not implemented; the trial note is
   an S note of 25 cards. The `role` on headings is read into the section reference for it.
5. **The export.** The static route exists only after the lead's next `npm run build`; e2e/slides.spec.ts then runs against
   the export with the project's own config. The spec ignores animations in shadow roots (the dev overlay) and waits for
   `[data-slides][data-ready]` before pressing keys; neither matters on the export.

## 6. Playwright, verbatim (run 5, 23 Sep 21:18, alone on the dev server, one worker)

```
Running 28 tests using 1 worker
  ok  1 [Desktop Chrome] › e2e\slides.spec.ts:241:9 › Slides: the title card › at 390 it is one screen, no chrome, one accent control, the honest count (2.0s)
  ok  2 [Desktop Chrome] › e2e\slides.spec.ts:241:9 › Slides: the title card › at 1280 it is one screen, no chrome, one accent control, the honest count (568ms)
  ok  3 [Desktop Chrome] › e2e\slides.spec.ts:262:7 › Slides: the title card › Read it as a page instead goes back to the topic and is remembered (967ms)
  ok  4 [Desktop Chrome] › e2e\slides.spec.ts:272:7 › Slides: the gate › blocks the way on, records the Read gate id once, and a miss carries its meaning in colour and comes back (894ms)
  ok  5 [Desktop Chrome] › e2e\slides.spec.ts:320:7 › Slides: the gate › Enter checks and the digits choose, on the desktop (2.4s)
  ok  6 [Desktop Chrome] › e2e\slides.spec.ts:373:7 › Slides: the figure she acts on, and the drawn labels › the shared factors strike in pairs, a mismatch is named, Check draws the simplified fraction (2.3s)
  ok  7 [Desktop Chrome] › e2e\slides.spec.ts:397:7 › Slides: the figure she acts on, and the drawn labels › the idea's illustration and the miss's consequence keep every label at 13 px or more at 390 (1.2s)
  -   8 [Desktop Chrome] › e2e\slides.spec.ts:420:7 › Slides: moving on › a swipe moves on and back on a touch phone
  ok  9 [Desktop Chrome] › e2e\slides.spec.ts:439:7 › Slides: moving on › the Next button at the screen's edge and the arrow keys move on, on the desktop (588ms)
  ok 10 [Desktop Chrome] › e2e\slides.spec.ts:453:7 › Slides: the whole deck and the close › the missed gate returns before the recap; the close holds the character and Rowan's line and no answer field (5.1s)
  ok 11 [Desktop Chrome] › e2e\slides.spec.ts:483:7 › Slides: the whole deck and the close › the retry card sits just before the recap and is asked once more, unrecorded (3.4s)
  ok 12 [Desktop Chrome] › e2e\slides.spec.ts:508:9 › Slides: the hero's two ways in › at 390 Slides carries the accent on a first visit, Read is the second way, and the choice is remembered (1.6s)
  ok 13 [Desktop Chrome] › e2e\slides.spec.ts:508:9 › Slides: the hero's two ways in › at 1280 Slides carries the accent on a first visit, Read is the second way, and the choice is remembered (1.5s)
  ok 14 [Desktop Chrome] › e2e\slides.spec.ts:541:7 › Slides: dark mode › the accent control keeps 4.5:1 with its text and the character keeps its colours (844ms)
  ok 15 [Pixel 7] › e2e\slides.spec.ts:241:9 › Slides: the title card › at 390 it is one screen, no chrome, one accent control, the honest count (915ms)
  ok 16 [Pixel 7] › e2e\slides.spec.ts:241:9 › Slides: the title card › at 1280 it is one screen, no chrome, one accent control, the honest count (623ms)
  ok 17 [Pixel 7] › e2e\slides.spec.ts:262:7 › Slides: the title card › Read it as a page instead goes back to the topic and is remembered (951ms)
  ok 18 [Pixel 7] › e2e\slides.spec.ts:272:7 › Slides: the gate › blocks the way on, records the Read gate id once, and a miss carries its meaning in colour and comes back (855ms)
  ok 19 [Pixel 7] › e2e\slides.spec.ts:320:7 › Slides: the gate › Enter checks and the digits choose, on the desktop (2.3s)
  ok 20 [Pixel 7] › e2e\slides.spec.ts:373:7 › Slides: the figure she acts on, and the drawn labels › the shared factors strike in pairs, a mismatch is named, Check draws the simplified fraction (2.1s)
  ok 21 [Pixel 7] › e2e\slides.spec.ts:397:7 › Slides: the figure she acts on, and the drawn labels › the idea's illustration and the miss's consequence keep every label at 13 px or more at 390 (1.2s)
  ok 22 [Pixel 7] › e2e\slides.spec.ts:420:7 › Slides: moving on › a swipe moves on and back on a touch phone (863ms)
  ok 23 [Pixel 7] › e2e\slides.spec.ts:439:7 › Slides: moving on › the Next button at the screen's edge and the arrow keys move on, on the desktop (686ms)
  ok 24 [Pixel 7] › e2e\slides.spec.ts:453:7 › Slides: the whole deck and the close › the missed gate returns before the recap; the close holds the character and Rowan's line and no answer field (4.8s)
  ok 25 [Pixel 7] › e2e\slides.spec.ts:483:7 › Slides: the whole deck and the close › the retry card sits just before the recap and is asked once more, unrecorded (3.3s)
  ok 26 [Pixel 7] › e2e\slides.spec.ts:508:9 › Slides: the hero's two ways in › at 390 Slides carries the accent on a first visit, Read is the second way, and the choice is remembered (1.7s)
  ok 27 [Pixel 7] › e2e\slides.spec.ts:508:9 › Slides: the hero's two ways in › at 1280 Slides carries the accent on a first visit, Read is the second way, and the choice is remembered (2.0s)
  ok 28 [Pixel 7] › e2e\slides.spec.ts:541:7 › Slides: dark mode › the accent control keeps 4.5:1 with its text and the character keeps its colours (947ms)
  1 skipped
  27 passed (50.8s)
playwright exit: 0
```

The skipped test is the swipe, which is a phone gesture and runs on Pixel 7 only. Runs 1–4 and what each found are in
scratchpad/platform/trial-slides/STATE.md (checkpoints 3 and 4). Closing checks after the last edit: `npx vitest run`
63 files, 1,333 tests green; `npx tsc --noEmit` exit 0 (21:20).

Run 6 (21:32), after the seeded option order of §4b was adopted, with the same config: `Running 28 tests using 1 worker`,
the same 27 `ok` lines and the same skip, `1 skipped`, `27 passed (1.0m)`, `playwright exit: 0`; tsc exit 0; the slides and
gates unit tests 30 green. On the dev server g1 shows its answer at position 2 and a click on that value marks "Yes.".
