# Platform audit: the student walk-through

22–23 September 2026. The product walked as she would walk it, on the static export at `localhost:3200`, on a fresh install, at 390 × 844 and 1280 × 800, light and dark, from her brother's note to Settings. Every number below is a DOM measurement (`getBoundingClientRect`, `getComputedStyle`) or a quoted string from the page; the script is filed at `scratchpad/platform/audit/measure.js`. Where a defect names a file and line, the line is in the source as it stood on 23 Sep at 13:19, which is what the export was built from.

Judged against `docs/plan/emotional-design.md` (the five questions and the eight rules), `docs/plan/why-this-platform.md` (the promise), `docs/plan/review/2026-09-19-quality-bar.md` Part A (the benchmarks), `docs/design/art-direction/02-surfaces.md` and `04-critique.md` (the specification the surfaces are being built to), and the owner's second directive of 23 Sep (is it fun and engaging the way Duolingo, Kinnu and Brilliant are, or a page to read, and which single change would move it most).

Three caveats, so the evidence is read correctly.

1. The export was rebuilt at 23:52 on 22 Sep while the walk was under way. First run, the seeded lesson and the day-one Today were measured on the 22:51 build; everything from Today-in-dark onward on the 23:52 build, which carries type pass 1 (Literata for lesson prose, no `text-[14px]`, 13 px tab labels). Nothing in the layout changed between the two, and the topic-page source has not moved since 23:37 on 22 Sep. Where a number differs between builds it is said.
2. A fresh install was reached without deleting anything: `127.0.0.1:3200` is the same server on a different storage origin. The `localhost` origin's data was left untouched.
3. The Browser pane was hidden throughout, so animations were frozen (a `rise-in` at 41 ms is a testing artefact, not a finding) and screenshots were inspected inline; the tool cannot write them to disk, so none are filed. Every claim rests on a measurement, not a picture.

---

## 1. The verdicts, one line per surface

Real means the promise on the screen is true in the behaviour that was tested. Labelled means the words are there and the behaviour is not. The benchmark column is against the apps in Part A of the quality bar, honestly. The last column is the directive's question: does it play like a Duolingo, Kinnu or Brilliant screen (one idea, immediate interaction, a visible consequence for a miss, a short loop, a warm voice), or is it a page.

| Surface | Verdict | Real or labelled | Against the benchmarks | Play or page, and the one change |
|---|---|---|---|---|
| First run | A gift that ends inside a real lesson: note, Letter, plan, one section, one gate, one CCEA-marked question, an honest close. | Real. The gate records, the question is marked by the same engine, the close says "No stone yet, and that is the honest answer". | **Better** than Duolingo's thirteen screens and DeepStash's twenty-three: real content inside a minute. Behind Brilliant on the first interaction (four dropdowns, not a working object). | Closest thing in the product to play. One change: the figure she is asked about renders its labels at 4.3 px; make the labelling question point at a figure she can read. |
| Today | Clear, honest, empty. Six identical tiles; the one line that could be hers (Rowan) fired once and then went silent. | Half labelled: "Chosen for you", the next step and the dates are real; the companion slot is empty from the second open. | Equal to DeepStash on clarity, **behind** Duolingo and Kinnu on any reason to open it on a Tuesday. | A page. One change: fix the companion hold so Rowan's `nothing-back` line renders every night, and make Tonight the only object. |
| Learn index, subject page, unit lists | Honest counters ("58 of 152 topics built"), teaching order, the right facts. Every row wears the same pill; the difficulty meter wraps titles to five lines; units she does not sit are listed without saying so. | Real. | Equal to Bitesize as a contents page; **better** on honesty (Bitesize never says what is missing). | A page. One change: put her plan first (M4, M8, FM1–3, the six science units) and drop the meter and the pill. |
| Topic page (FM1, B1, M4) | The deepest thing on her desk and the hardest to hold: 10 stages, 63–117 minutes and 12,000–20,000 px behind a hero that says "About 7 minutes". The gates, worked examples, find-the-mistake and the examiner-cited reveals are the real product. | Real where it teaches; labelled on "Pause here" (a paragraph), "the last step is yours" (two are), and the mastery hint ("Do the pre-check"). Two of the exemplar's seven gates are authored wrong. | **Better** than Bitesize, Seneca and Corbettmaths on what a miss teaches (mark codes, the examiner's sentence, the scheme's next mark); **equal** to Kinnu on the spine; **behind** Brilliant on one idea per screen and on a visual consequence. | A page with islands of play. One change: one section per screen with the spine as the progress bar (decision 9's Slides), and the reading column at 640–720 px with the rail put away. |
| Practise | One honest mode. The set itself is good (no topic labels, CCEA marking). Starting it costs 58 bundles and 14.6 MB. | Real, singular. "Next question" is offered before an answer. | **Better** than Seneca on marking, **behind** Seneca on re-presenting a miss and behind everyone on modes. | A form, then play. One change: a per-subject question index so Start is instant, then the four other modes of decision 4. |
| Papers and a run | The plan is real (11 entries, soonest first, honest "no runs yet") and the runner is the best exam tool she will own: page-linked marking grid, pace line, raw → UMS → grade with the boundary caveat. | Real. The result card leads with "A*A*" before the grade she got; the tab bar stays during the run. | **Better** than anything for CCEA; no benchmark has UMS. | A directory, then a superb loop. One change: "Sit the next one" as the single accent, sittings behind a disclosure. |
| Map | Eleven countdown bars, a designed empty state for the journey, the rules, 359 grey squares for every unit in the taxonomy. | Real and honest; the bars are the loss framing the rules forbid. | **Behind** Khan's mastery map (no levels shown as a journey, no unit test). | A page. One change: her units only, stones per unit, no bars. |
| Flashcards and a deck | Honest index ("coming" ×6), a good card, 52 px grading, keyboard hints on a phone, a 198-card session with no size, Study below the fold. | Real. | Equal to Anki; **behind** Kinnu's card by a session and a screen of breathing room. | Play after the flip. One change: a fixed session of 15 with the close card, and the three buttons unaccented. |
| Ledger | "13 marks lost · Method 13" after two practice marks and four exam marks were actually dropped. | Labelled: counts gate misses, why-menus, worked-example lines and one correct answer as method marks. | **Behind** the promise in why-this-platform ("tagged the way an examiner would"). | A page of one number. One change: count question marks only, net a recovered part, name topics. |
| Review | Thirteen real items due on day two, including the gate, the twin and the labelling question; a real close card with a recall forecast. | Real. It re-asks the identical question. | **Better** than Bitesize (which keeps nothing); **behind** Seneca on the different-form return. | The best loop in the product. One change: a different form on the first return. |
| Settings | Backup, offline copy with an honest file count, Rowan's memory and voice explained, five themes, the exam plan. | Real. No Further Maths entries; three accent buttons. | Equal. | A page, correctly. One change: FM1–FM3 in the plan. |

---

## 2. The owner's two findings, measured

Measured on `/learn/further-maths/FM1/algebraic-fractions-simplify/` at 1280 × 800, and confirmed on B1 enzyme factors and M4 circle theorems (same layout code).

| Measurement | Value | Where it is decided |
|---|---|---|
| App rail | 240 px, `x` 0–240 | `src/components/shell/Nav.tsx:53` (`lg:w-60`) |
| Content column | 976 px, `x` 265–1241 | `src/components/shell/AppShell.tsx` |
| Topic grid | `196px 748px`, gap 32 px | `src/components/topic/TopicContent.tsx:143` (`lg:grid-cols-[196px_minmax(0,1fr)] lg:gap-8`) |
| Lesson card | 748 px wide | `TopicContent.tsx:149` |
| **Reading measure** | **584 px** (65 ch at 18 px Literata) | the card's padding inside the 748 px column |
| Decision 1 acceptance | 640–720 px | **fails by 56–136 px** |
| Right-hand column | **none**. The reference cards are a three-column strip (3 × 314 px) at the foot, `y` 15,516 of 15,902 | `app/learn/[subject]/[unit]/[topic]/page.tsx:124-130` |
| Spine | `position: sticky; top: 24px`, 196 × 752 px (`max-height: calc(100vh − 3rem)`), 16 rows, follows all 15,902 px | `src/components/topic/LessonSpine.tsx:126, 161` |
| Can the spine be put away | **No.** No toggle, no track state; `toggle: []` | `LessonSpine.tsx` has no such control |
| Hero figure | 976 × 480 px, spanning the whole content width | `src/components/topic/TopicHero.tsx:79-104` |
| "Start the lesson" | `y` = 953 (FM1), 995 (M4): **below the 800 px fold at desktop** | `TopicHero.tsx:194-201` |
| Pinned elements at 1280 | the spine (752 px) plus two 68 px Check bars (one per question card in view) | `src/components/items/ui.tsx:183-194` (`StickyBar`) |

So the owner's screenshot is half history: in this export the thin right column is already gone. What remains is the other half of the complaint, and it is measured: the spine is 196 px of a 976 px column, always on screen, cannot be dismissed, and the prose it sits beside is narrower than the plan's own floor. The lesson is not yet the page.

At 390 × 844 the same page has: the spine as a 51 px sticky bar at the top (16 chips scrolling sideways over 2,931 px), a 96 px Check bar sticky at the bottom of each question card, and the 57 px tab bar. Three pinned elements, 204 px of an 844 px screen, against the critique's acceptance of one besides the tab bar and 103 px in total (`04-critique.md` §7.7).

---

## 3. Must-fix

Ranked by what it costs her trust. Each names the file and the change.

1. **The re-teach panel names a mark she has already earned.** On the seeded lesson's labelling question, wrong on (i) cell wall and right on (ii)–(iv), "Where the next mark is" read **"P1 vacuole (accept large permanent vacuole)"**, the fourth mark, which she had. `unreachedStep` (`src/components/topic/reteach.ts:64-71`) walks the scheme in authored order and returns the first point whose running total passes the award, which on any part marked in pieces (label, table, order, keyword text) is the last point whenever the miss was not the last one. Fix: `checkLabel` (`src/lib/marking/label.ts:96-116`) already knows which targets were wrong; put their ids on `LabelVerdict`, carry them on `MarkResult`, and let `reteachFor` pick the scheme point for a missed target; until then, `reteachOf` (`src/components/topic/QuestionRunner.tsx:47-67`) should return `{ step: null, anotherWay }` for `label`, `table`, `order` and `steps` kinds, whose card already names the miss.

2. **Rowan is silent on Today from the second open.** Night one showed "I have opinions about the papers and none about you. That is the arrangement." (`dry.arrangement`, `src/lib/companion/lines.ts:651-658`, no requirements). The second and every later open had no `[data-companion]` element at all. Cause: `TodayTiles.tsx:112-114` freezes the first context that loads, before `nextStep` (and so `nextTopicTitle`) resolves, so `today.nothing-back` (`lines.ts:274-283`, requires `nextTopicTitle`, flag `noDue`) is never eligible; the only requirement-free line fires once and enters its fourteen-day cooldown (`src/lib/companion/select.ts:202`); silence follows. Fix: hold the context only once `plan` and `mastery` have resolved, and never let a `requires: []` filler burn a cooldown while a data line is merely late. The topic hero's `topic-open` slot was also empty on every first visit measured (FM1, B1, M4) although `firstVisitToTopic` should be true; the companion agent must verify on the dev server, because the pixels alone do not say why.

3. **Two of the seven gates on the owner's exemplar are authored wrong.** `public/content/further-maths/fm.u1.algebraic-fractions-simplify.json`: gate `g5` asks "Is $\frac{2}{x-3}$ fully simplified?", its answer is "No — it becomes $\frac{2}{x-3}$" (the prompt's own expression) and options A and C are identical; gate `g6` says "Erin has reached $3x$" and the answer is "No — an $x$ divides both lines, giving $3x$". A learner cannot answer either honestly. The lesson lint let both through. A scan of all 183 shipped bundles (1,454 gates) finds `g5` the only gate with duplicate options; `g6` is a semantic corruption the scan cannot see. Fix in the pack (content session) and add to `scripts/qa/lesson-v2.mjs`: options distinct; the answer never equal to the prompt's expression; the answer's value never equal to the "reached" value in the prompt.

4. **Practise cannot start for ten seconds.** `MixedPractice.tsx:50-63` fetches every shipped bundle of the subject before "Start" enables: 58 bundles, 14,600,760 bytes, the last arriving 10.5 s after navigation on localhost. On a phone on mobile data that is the page. Fix: a per-subject question index built at export time (id, topic, unit, calculator, marks) and one bundle fetched per drawn question; the "Available now" count comes from the index.

5. **The ledger's number is not marks.** "13 marks lost · Method 13" after a night in which 2 practice marks (recovered on retry) and 4 exam marks were dropped. `lostMarks` (`src/lib/ledger/tags.ts:33-36`) charges one mark for any attempt with `correct === false` and no tariff, so gate misses, why-menu misses, worked-example lines (including the correct one the comparator refused) and find-the-mistake all count; `lossesFromAttempts` (`tags.ts:44`) files every untagged loss as "Method"; a part retried is counted twice. Fix: count only attempts with a tariff, keep the best attempt per part per sitting, and show untagged losses as "untagged" rather than as the examiner's reading.

6. **A correct worked-example line is told it is not.** On FM1 worked example 1 at `faded1`, the final line typed as `x/(2(x-5))` against the authored `\frac{x}{2(x-5)}` returned "Not the same line yet. Mine was:" and the honesty buttons. `stepLineMatches` (`src/components/items/mistake-marking.ts`) does not equate the slash form with `\frac`. A right answer told it is wrong, with a button that lets her claim it anyway, is the exact trust failure STANDARDS.md forbids. Fix: normalise `a/(b)` and `\frac{a}{b}` (and `\dfrac`) to one form before comparison; the same normaliser serves `fixMatches`.

7. **Figure labels are unreadable on a phone, and the figure is the lesson.** Rendered label sizes at 390 wide: 4.3 px (the seeded lesson's cell diagram, viewBox 760 at 275 px), 5.1–5.2 px (B1's rate–temperature curve, the topic's whole idea), 5.9 px (FM1's cancelling figure); M4's hand-drawn circle is the exception at 8.8–13.9 px. The critique's R3 amendment (label size as a viewBox-unit breakpoint value, 24 units below 768 px) has not landed: `src/components/figures/generated.tsx` still emits 12–13 unit labels. Playwright rule: `fontSize × clientWidth / viewBoxWidth ≥ 13` for every `svg[viewBox]` in the viewport.

8. **The lesson is not the page (decision 1).** Measured in §2. `TopicContent.tsx:143` gives the spine 196 px and the prose 584; `LessonSpine.tsx:126` pins it with no way out; `TopicHero.tsx:194-201` puts the primary at 953–1,066 px on both widths. The pass-2 agent owns this; the acceptance numbers are in §2.

---

## 4. Should-fix

Grouped by surface. Each is real in the pixels and cheap to name.

**First run**
- Step 1 stacks the Letter and the plan card, so "Begin" lands at `y` 934, below the 844 px fold (`src/components/gift/FirstRun.tsx:109-153`). One object per step, as `02-surfaces.md` §7 specifies.
- The Letter card has the double top edge the critique named (`CompanionLetter.tsx`; `02-surfaces.md` §8: one edge).
- `SCHEME_CAPTION` reads "M for method, A for accuracy" (`SeededLesson.tsx:36`) beside a science scheme that is `P1 × 4`. Make the caption follow the subject's code set.
- "Calculator allowed" is printed on a biology labelling question (`QuestionRunner.tsx:249` prints the calculator flag for every non-maths paper).
- On the 22:51 build the eyebrows were 12 px uppercase and the buttons 44 px; the 23:52 build has 13 px eyebrows. The 52 px primary of `02-surfaces.md` §7 is still 44 px (`FirstRun.tsx:102, 149`).

**Today**
- The empty state says "Come back tomorrow, or learn something new." (`TodayTiles.tsx:143`) minutes after her first lesson. The spec's line is "Nothing back tonight. Ten minutes on something new is enough." and the button is Learn.
- "This week 1 / 4" with three hollow dots (`TodayTiles.tsx:183-190`) shows what was not done; rule 1 says never.
- "231 days" at 24 px is the loudest number on the screen (`TodayTiles.tsx:196-197`); `02-surfaces.md` §5: a fact at 14 px, never a large number.
- "0 stones" at 24 px (`TodayTiles.tsx:212`) is the large zero §9 forbids.
- Six identical tiles (`TodayTiles.tsx:132-234`); the spec is one object, rows and a recess. Pass 2d owns it.

**Learn**
- The subject page lists every unit in the taxonomy (M1–M8, FM1–FM4) with no mark for the ones outside her plan (`app/learn/[subject]/page.tsx:20-47`); Practise's unit chips do the same (M3, M7). "It knows your papers" should show on the pages that choose work.
- Unit list: the "Lesson and practice" pill on all 9 of 9, 21 of 21 and 29 of 29 rows (`app/learn/[subject]/[unit]/page.tsx:51-53`); the difficulty meter and verdict (`:61-65`) squeeze titles to five lines (M4 rows 3 and 9, 215 and 194 px tall); the lede template reads "9 are where the Chief Examiners report marks being lost … Original questions are ready for 9 of 9; the rest link to the best existing resources." when there is no rest (`:31`).

**Topic page**
- The hero says "About 7 minutes", the lesson eyebrow "about 9 min", and the ten stages sum to 63 (FM1), 87 (B1), 117 (M4). `heroDataFor` uses `noteMinutes` (`lesson-plan.ts:132`) and the eyebrow sums the per-section rounded minutes (`TopicContent.tsx:106`); two numbers for one lesson on one screen. And "About 7 minutes" above a two-hour page is not the under-promise the quality bar asks for; the promise line should say what the lesson costs and what the whole page costs.
- The mastery chip reads "Not started · Do the pre-check to find your starting point." (`src/lib/mastery/engine.ts:79`); the pre-check was deleted on 13 Sep.
- "Next paper: FM1, 237 days" chip on the hero (`TopicHero.tsx:65-77`); `02-surfaces.md` §3.1 deletes it and puts the paper in the locator as a place, not a countdown.
- The display title is the spec title: "Circle theorems (use, with reasons; proofs excluded)", "Temperature, pH, concentration and inhibitors on enzyme action" over three lines. `spokenTitle` exists (`src/lib/companion/context.ts:207`) and the surfaces spec settles on it; `TopicHero.tsx:158` does not use it.
- "I have done this before" is a 44 px outlined button (`TopicHero.tsx:198`), not the text link of §3.1 item 6.
- The gate box is dashed until answered (`StepRevealNote.tsx:75`); §3.3 abolishes dashed.
- "Pause here if you need to. Your place is kept…" is a `<p>` (`StepRevealNote.tsx:189-194`), not the 44 px control that writes the flow and returns to Today (§3.3).
- Gates cannot be retried (`StepRevealNote.tsx:171-177`); a wrong tap shows the reason and moves on. Directive 13 lists it.
- The worked-example eyebrow says "Your turn · the last step is yours" (`WorkedExampleAsQuestion.tsx:238-244`) while the authored `faded[0]` plan makes steps 2 and 3 hers (`fade.ts:38-47`).
- In a fixed step the mark chip still reads "MW1 earned" (`StepBody`, `WorkedExampleAsQuestion.tsx:102-108`, `MarkChip` defaults `earned = true`); a fixed step should strike it.
- The marked object is the same 0.8 px hairline as an unmarked one (`src/components/items/ui.tsx:33`; `FeedbackCard.tsx:59`), the verdict word is 17 px (`FeedbackCard.tsx:64, 77`), and no struck code appears on a not-yet card. `02-surfaces.md` §4.2 makes all three mandatory. Pass 2 owns it.
- A correct practice answer gets "That's it." and the marks, never the method line §4.2 asks for.
- No examiner sentence on a first or second question miss in practice or exam-style (`FeedbackCard.tsx:106` is gated on `misses >= 2 && p.hints[0]`, and the exam run holds it); the only examiner citation she met on a miss was inside find-the-mistake. Directive 13 lists it.
- Retrieval-prompt grade buttons measure 44 px although `InlinePrompt.tsx:163` asks for `min-h-[52px]`; the class is not taking effect.
- Find-the-mistake line 3 is authored "Cancel (x)" meaning the bracket (`ftm.fm.u1.algebraic-fractions-simplify.01`); on screen it reads as "cancel x", and the reason then says the bracket was cancelled correctly.
- KaTeX drops to 8.25 px on the FM1 page (inline `\frac` at scriptstyle); the critique's floor is 13 px.

**Practise**
- "Next question" is shown before an answer (`MixedPractice.tsx:123-127`); a set can be finished with nothing answered and still say "Mixed set complete".
- The close says "anything you missed will come back in your reviews", which is now true (`record.ts` covers every kind; 13 items were due on day two), so this sentence can stay.

**Papers**
- The result card's largest type is "A*A*", the band she is short of, and "unit grade c*" follows in smaller type (`src/components/papers/UmsResult.tsx`); lead with the grade earned, then the gap.
- The tab bar stays on the running screen (`BottomTabs` in `Nav.tsx:132` hides only under `/welcome`); §5 says the running screen has no navigation.
- 33 "Run it timed" outlines and no accent on the index; §5 wants one accent, "Sit the next one", and sittings behind a disclosure.

**Map**
- Eleven countdown bars whose length is days-away (`ExamMap.tsx:60-62`): "never a bar" (§5).
- "Every topic" draws all 359 taxonomy topics including M1–M8, FM4 and Unit 7 (`ExamMap.tsx:129-158`); her plan is eleven units.

**Flashcards**
- "Study 198 cards" sits in an aside that renders below the topic list on a phone: `y` 1,299 on an 844 px screen (`DeckStudy.tsx:275-297`).
- "Good" is ink-filled (`DeckStudy.tsx:198`), signalling a right answer among three; §6 wants none accented.
- The session is the whole deck (198) with no size and no close card until the end (`DeckStudy.tsx:102-113`); decision 10 wants a fixed small session.
- "1 2 3" keyboard hints on the buttons and "· space" on the card are shown on a phone.

**Review**
- The first return re-asks the identical labelling question with the same dropdowns (`ReviewInbox.tsx:121-130`); Seneca's different form is the adopted pattern and is not here.
- `EmptyInbox` says "Come back tomorrow." (`ReviewInbox.tsx:191`); §9's line is "Nothing is due. That is what the schedule is for."

**Settings**
- The exam plan has no Further Maths entries (`SettingsPanel.tsx:327-430`); the plan she confirmed on first run lists FM1, FM2, FM3 and she cannot change them.
- Three accent-filled buttons on one page (Export backup `:254`, Download the full copy `:285`, Save plan `:423`).

---

## 5. Could-fix

- Seeded lesson: the whole hero re-renders with `rise-in` on every step, and the lesson card vanishes when the question stage begins (`SeededLesson.tsx:170`); keep the section she just read above the question.
- The topic hero's objectives use accent dots (`TopicHero.tsx:176`); the critique makes them `--ink-3`.
- Unit-list rows say "Number and algebra · 1 statement · Higher only" on all nine M4 rows; a label true of every row says nothing.
- Learn subject cards say "Higher route M4 + M8 is the only way to an A*", the best sentence on the page, at 14 px.
- The Papers lede, the Map lede and the Learn lede each explain the product in a paragraph the second visit does not need.

---

## 6. Surface by surface: the five questions, from the pixels

Each surface answers the five questions of `emotional-design.md` (clarity, focus, momentum, calm, trust) from what is on screen, then says what is real, what is labelled, and where it stands.

### 6.1 First run (`/welcome/`, 22:51 build, fresh install)

Screen 1: "A note from your brother · Happy birthday", the note in Literata at 16 px, "Continue" at `y` 502, no chrome, no sticky element, nothing else. Screen 2: Rowan's Letter ("I keep the notes you leave and the dates of your papers. You do the maths. Your papers are in: B1 on 11 May, then M4 on 14 May.") with a rename field and Close, then "Two things before you start" (name, the pre-filled plan: "Maths M4 + M8 · Further Maths FM1, FM2, FM3 · Double Award Science (Higher) · Next paper: Biology Unit 1, Tue, 11 May 2027 at 09:15"), "Begin" at `y` 934. Screen 3: "B1 · your first lesson · Cells, microscopy and specialisation", the lede, one objective, the cell figure (labels at 4.3 px), one section of prose, a choice gate with "A check. The note stops here until you answer; nothing is scored.", then "Marked the way CCEA marks: M for method, A for accuracy. The scheme is always open." and a real 4-mark labelling question with a word bank, then the mark scheme (P1 × 4), then "That is how the whole thing works · No stone yet, and that is the honest answer · A stone is placed when a topic comes back right in a mixed set at least two days later" and "Carry on with B1" (a live link) / "Go to Today".

- Clarity: yes. One object per screen, one accent, the vocabulary named once where it first appears.
- Focus: yes on screens 1 and 3; screen 2 puts two objects and the primary below the fold.
- Momentum: yes. Gate → "Yes." → Continue → question → "Part way there, 3 of 4 marks" → "Every label is right, 4 of 4" → the scheme → the close.
- Calm: yes. "No stone yet, and that is the honest answer" is the best sentence in the product.
- Trust: yes, with one crack: the re-teach panel named the wrong mark (must-fix 1) and the "M for method, A for accuracy" caption sat over a scheme of P1s.

Real: everything it claims. Labelled: nothing. Against the benchmarks it is ahead of Duolingo's and DeepStash's onboarding, because the first real interaction is a real CCEA question inside the first minute. The single change: a figure she can read.

### 6.2 Today (`/`)

Day one, 22:51 build, after first run: "Tuesday 22 September · Today · Tonight · Nothing due · Come back tomorrow, or learn something new. · Learn" then Rowan's line, then "Next step · M3 · Simplifying, multiplying and dividing algebraic fractions (factorise and cancel) · November 2025 M4: Q22(b): dividing algebraic fractions — 5% full marks.", "This week 1 / 4" with dots, "Next paper 231 days · Biology Unit 1 · Tue, 11 May 2027, 09:15", "Your cairn 0 stones", "Coming up" (three papers). Six tiles, 1,315 px, one accent (Learn), one pinned element (the tab bar, 57 px). Second open onward (23:52 build): identical minus Rowan's line. At 1280 the six tiles sit in a 4-column grid on one screen with nothing below.

- Clarity: yes. Tonight, one button.
- Focus: partly. Six equal cards compete; the sub-line under the count is a fixed sentence.
- Momentum: no. "1 / 4", "0 stones", "231 days".
- Calm: no. "Come back tomorrow" the night she arrived; a countdown at 24 px.
- Trust: yes. The next step names a series and a question, the dates are hers.

Real: the plan, the dates, the next step and its reason. Labelled: the companion's presence from the second night; the "Chosen for you" line when nothing is due. Against DeepStash it is equally clear; against Duolingo and Kinnu it gives no reason to open it on a Tuesday, and the one thing that would (Rowan's fact about her own work) is switched off by a race. The single change is must-fix 2.

### 6.3 Learn (`/learn/`, `/learn/further-maths/`, unit lists)

Index: three subject cards with "8 units · 58 of 152 topics built", "4 units · 57 of 73", "7 units · 61 of 134". Real and the honest counter of quality-bar item 10. Subject page: unit cards with weighting, minutes, marks, calculator, topic count; FM4 listed as "Optional · very few candidates · 12 topics" with no word that she is not entered. Unit list M4: nine rows in teaching order, every row "Lesson and practice", a five-square meter with "Hard" or "Where marks are lost", titles wrapping to 3–5 lines (row heights 133–215 px), a lede that says all nine are where marks are lost; B1 21 rows, FM1 29 rows, all 100% built.

- Clarity: yes. The order is the teaching order and says so.
- Focus: partly. The meter and the verdict pull the eye before the title.
- Momentum: no state on any row (nothing she has done shows here).
- Calm: no. Nine "Hard"/"Where marks are lost" verdicts before she opens anything, which is the tone failure the surfaces spec names.
- Trust: yes; the counts are true.

Real. Labelled: nothing. Equal to Bitesize as a contents page and better on honesty. The single change: her plan first and the meter gone.

### 6.4 The topic page

Walked in full on FM1 simplifying algebraic fractions (seven gates, a worked example through `full` and `faded1`, a practice question wrong then right, an exam-style question wrong, a find-the-mistake to the reveal, a retrieval prompt graded, the Check-yourself diagnostic), and to the hero and first gate on B1 enzyme factors and M4 circle theorems.

**Hero, 390 wide.** Locator, two chips ("Not started · Do the pre-check to find your starting point.", "Next paper: FM1, 237 days"), title at 26 px Literata over two lines, lede 241 px tall, the figure at `y` 460 in a card, three objectives, "About 7 minutes · 7 short sections · 7 checks · 2 worked examples", then "Start the lesson" at `y` 948 and "I have done this before". The button fails the 640 px rule on all three topics (948, 942, 1,066); the figure passes the 720 px rule on all three (460, 431, 429).

**Lesson.** "0 of 7 checks done", one stretch of 17 px Literata prose at a 317 px measure, a gate. Answered wrongly: "Not quite. A difference of two squares…", the correct option outlined "Correct answer", mine "Your answer", the count ticks to 1 of 7, chip 2 enables, the next stretch opens. Answered rightly: "Yes. The x on top is a term, not a factor. Substituting x = 1 gives 5 for the fraction and 4 for the cancelled version, so they are different expressions." That sentence is a visible consequence in prose, and it is the model for the rest. Seven sections: Simplifying, Why cancelling works and when it does not, The three moves, See it done (a Corbettmaths facade and a TLMaths facade, each with "Watching is not practice: answer the question after it"), Fully means fully, You can now (a three-line recap), In the exam (with three prompts embedded). One figure in the body, two callouts (an examiner one citing Summer 2024 FM1 Q8(a), a why). "Pause here" once, as a paragraph. "End of the note." Total note height 8,237 px; the page 19,109 px with everything open.

**Worked example.** Tap-to-reveal, "Because" under every step, an MW1 chip on each, a why-menu on step 3 only ("read each step, then say why" promises more than it asks). Wrong reason: the right one explained, "0 of 1 steps right", the final answer. `faded1`: step 2 typed wrong → "Not the same line yet. Mine was:" the authored line and "That is what I had / Not yet"; step 3 typed right → the same verdict (must-fix 6).

**Check yourself.** "Check · 1 of 4", four options, Guessing / Fairly sure / Certain, Reveal. Certain and right: "That's the one." with the reason. "Skip to practice" present.

**Practice.** "Practice · 1 of 8 · 2 marks", an algebraic field with a symbol row, "Show your working (optional)", Check at 52 px in a bar that sticks to the bottom. Wrong (`5/(x+4)`): "Not yet · 0 of 2 marks · What happened: Very close – check your signs; one of them is the wrong way round.", the expected answer withheld, "Where the next mark is MW1 both lines factorised: 5(x + 4) over (x + 4)(x − 4)", "Another way to see it: The top has a common factor of 5.", "Try a twin" (accent), "Done", "Try again", the worked solution folded. Right on retry: "That's it. 2 of 2 marks". Then "Next question".

**Exam-style.** "Exam-style · 1 of 2 · 4 marks", the working box open with "Working counts here: the scheme gives marks for method." Wrong: "Not yet · 0 of 4 marks · Expected 2(x−2)/(x+3) · That is not equivalent to the expected answer. For example, when x = 4.66 your answer gives 0.0907 but the correct answer gives 0.695." After Done: "0 / 4 marks", "What to pick up" (the MW1 step and another way), "Try a twin", "Checked · 9 passes · Verified", "Send".

**Find the mistake.** "Tap the first line that goes wrong." A sound line: "This line is sound. Not that line — it holds up. Look again." The second wrong tap gives the line away. "What went wrong on line 4?" in her words, Compare, the authored reason, "I named it / Not quite", "Now fix it", the corrected line typed, "Fixed." with the correction, "As written it earned MW1 MW1", the feedback and "CCEA examiners' report · Summer 2023 · FM1 Q9". The strongest interaction in the product, as the 13 Sep review said, and the only place a question miss met an examiner's series.

**Prompts, sheet, insight, reference.** A formula prompt, "Show answer", Again / Good / Easy at 44 px, "Marked Good." "In the exam": 553 words, 1,957 px, seven "must be able to", seven traps, "Not on this spec". "Where marks are lost": two findings with series and question. Reference underneath: Specification, Formula sheet, Best of what exists (one link), "Flashcards for this topic · 14", "Back to Pure Mathematics".

The five questions:
- Clarity: on the hero, yes (what it is, the figure, what she will be able to do); on the page, no (the promise says 7 minutes and the page is 63).
- Focus: no. Three pinned elements at 390, a 752 px rail at 1280, a page of ten stages with the practice and the exam-style both showing their first question at once.
- Momentum: yes inside the note (the count, the chips, the next stretch) and inside each island; none across the page (nothing tells her where to stop, and "Pause here" is a sentence).
- Calm: partly. The voice is calm everywhere; the shape is not (19,109 px, "Practise · about 25 min" and "Sit it as a paper · about 11 min" a screen apart).
- Trust: mostly, and where it breaks it breaks badly: two authored gates she cannot answer, a right line called not the same, a chip that says "earned" on a fixed step, a hint that names a deleted pre-check.

Real: the gates, the worked-example ladder, the marking with scheme codes, the re-teach, the find-the-mistake reveal, the Checked panel, the spine's following of the scroll. Labelled: "Pause here", "the last step is yours", "read each step, then say why", "About 7 minutes", the mastery hint. Against the benchmarks: better than Bitesize, Seneca and Corbettmaths on what a miss teaches; equal to Kinnu on the spine (and behind it on being able to hide it); behind Brilliant on one idea per screen and on a drawn consequence (the miss is prose; the numeric "when x = 4.66" line is the nearest thing to it and is good). Play or page: a page with islands of play; the islands are the product. The single change that moves it most is the one the directive already names: one section per screen with the spine as the progress bar, the reading column at 640–720 px, the rail put away by default.

### 6.5 Practise (`/practise/`)

"Mixed practice · Original questions with no topic labels, marked the way CCEA marks." A Flashcards link card, then the builder (Maths / Further Maths / Science; units M3 M4 M7 M8; Either / Calculator / Non-calculator; 4 6 8 12), "Start · 6 questions", "Why mixed" ("It will feel harder. That is the point."), "Available now: 873 original questions across 58 topics". The set: "1 of 6 · no topic labels: work out what it is asking", a 2-mark cube-diagonal question with a figure, a unit on the field, the working box.

- Clarity: yes, and the "Why mixed" paragraph is honest. Focus: a form. Momentum: the progress line. Calm: yes. Trust: yes, once it starts; the ten-second wait says otherwise.

Real: the one mode. Labelled: nothing, but decision 4's five modes are absent and the form is the interface. Better than Seneca on marking, behind it on the return of a miss, behind everyone on modes. The single change: instant Start, then the modes.

### 6.6 Papers (`/papers/` and `/papers/68458/`)

Index: "Your plan · 11 papers · Change entries", "No timed runs saved yet…", eleven cards soonest first, the first labelled "Next paper" and outlined, each with three sittings and "Show N older sittings", then "Every CCEA paper: Your plan lists 153 of the 414 papers in the archive… Show every paper". 10,199 px at 390; 5,743 at 1280. Runner: preflight ("Scientific calculator, in degrees mode · Black pen, pencil and ruler · Feedback is withheld until you finish", "Start timer · 1 h", "Real minutes. You can pause, and every pause is recorded."); running ("Time left 59:56" at 64 px, "0:03 of 1:00:00 used", "At CCEA pace you would be around question 1 by now.", Pause, Finish paper, Open paper, Discard run); marking ("Mark it yourself · Finished in 0 min of 1 h", eight rows each with its topics, a deep link to the page of the PDF, Available prefilled, Awarded, Lost tags Method / Accuracy / Misread / Presentation / Not attempted, Add a question, Total 48 / 70, "7 of 8 questions entered · 13 lost · 0 tagged", See UMS result); result ("A*A*", "45 of 66 UMS · est. · unit grade c*", "16 raw marks short of the A*A* band on B1H, estimated.", the pace line, Raw / UMS / Unit grade, boundaries Summer 2025 and 2026, "CCEA publishes no unit raw boundaries for Science, so this UMS is a proportional estimate", Save this run / Back to marks / Discard run).

- Clarity: yes everywhere. Focus: the running screen is the most restrained screen in the product, except that the tab bar stays. Momentum: the pace line. Calm: yes; "every pause is recorded" is honest without pressure. Trust: yes; the boundary caveat is exactly the sentence a careful reader wants.

Real, all of it, and better than anything that exists for CCEA. The index is a directory inside a plan. The single change: one accent ("Sit the next one") and sittings behind a disclosure.

### 6.7 Map (`/map/`)

"Your papers" as eleven rows, each with a bar whose length is the days away and "230 days" in ink; "Your journey" with the designed empty state ("No stones placed yet. A stone is placed when a topic is proved in practice…"); "Rules that decide your grade" (seven bullets, all true and dense); "Every topic, coloured by what you have proved" (359 squares, all grey, every unit in the taxonomy, "0 proved" per subject, the Rowan mark beside each cairn).

- Clarity: partly; the rows and rules are clear, the squares say nothing yet. Focus: no; eleven bars first. Momentum: none to show. Calm: no; eleven countdowns. Trust: yes; the rules are the rules.

Real. Behind Khan's map. The single change: her eleven units only, stones per unit, no bars.

### 6.8 Flashcards (`/flashcards/`, `/flashcards/maths/M4/`)

Index: three subject cards, unit rows at 37 px, "349 cards · 17 topics" or "coming". Deck: nine topic checkboxes, "This deck · 198 cards · 9 topics · Study 198 cards" below the list, the mechanic explained in one paragraph ("Again brings the card back at the end of this run and sooner in your reviews; Easy pushes it further out. Cards you never mark stay out of the review inbox."). The run: "1 of 198 · The quadratic formula…", a 220 px card ("Definition · Tap to flip · space"), the three buttons at 0.3 opacity until the flip, Good ink-filled, "Stop here". Flipped: the front small, the answer, "Key words examiners look for: …". Good → "2 of 198", a "Trap · Higher" card.

- Clarity: yes. Focus: yes after the flip. Momentum: the progress line. Calm: yes. Trust: yes.

Real. Equal to Anki; behind Kinnu on the card as a screen and the session as a shape. The single change: decision 10.

### 6.9 Ledger (`/ledger/`)

"Marks lost, by reason · 13 · Method 13 · Did not know or did not start the right method." and "Where they went: algebraic fractions simplify practice 12 marks · b1 cells and microscopy practice 1 mark".

- Clarity: the number is clear and wrong. Trust: no (must-fix 5). Behind the promise.

### 6.10 Review (`/review/`)

"Tonight · What you got wrong, or right without confidence, back before you forget it. · 1 of 13 · Cells, microscopy and specialisation", the labelling question again with the same dropdowns and "Calculator allowed"; by the desktop pass, 15 items. The close card (from code and the review's own component) states items, minutes and the predicted recall on the next paper date, with "Done for tonight" and "Five more minutes on a topic".

- Clarity: yes. Focus: yes, one item. Momentum: the line. Calm: yes. Trust: yes; the promise "anything you missed will come back" is now true in the data.

Real, and the best loop in the product. Behind Seneca on the different form. The single change: a different form on the first return.

### 6.11 Settings (`/settings/`)

Six sections in order: backup, offline copy ("about 80 MB", "99 of 2,495 files are on this device"), What Rowan remembers (empty state, "Include these notes in the backup file. Off by default, because a backup can be restored by somebody else.", Forget everything), How Rowan speaks (name, "Quiet", "Plain language, with no talk of paths or cairns. On to begin with, and yours to turn off." checked), Appearance (five themes, Follow device default), Exam plan (Maths first unit M4, series Summer 2027, completion M8, science Higher, sessions 4, Save plan).

- All five: yes, as a settings page should. Real. Equal. The single change: FM1–FM3 in the plan.

---

## 7. Cross-cutting facts

| Rule | Measured | Status |
|---|---|---|
| Type floor 13 px (critique R3) | 23:52 build: no text under 13 px on Today, Learn, unit lists, topic prose, tab bar (13 px). Figures 4.3–5.9 px; KaTeX 8.25 px | Text passes; figures and inline fractions fail |
| One accent-filled control per screen | Today 1; hero 1 (plus "I have done this before" outlined); practice card 1; Settings 3; Papers index 0 | Mostly kept |
| Sticky elements ≤ 1 besides tab bar, ≤ 103 px | Topic at 390: spine 51 + Check bar 96 + tab 57; at 1280: spine 752 + two 68 px bars | Fails on the topic page |
| Primary within 640 px at 390 | First run 502; Today 264; hero 948 / 942 / 1,066; deck 1,299 | Fails on topics and the deck |
| Figure top within 720 px | 460 / 431 / 429 | Passes |
| Reading measure 640–720 px at 1280 | 584 / 585 | Fails |
| Marked object visibly different (2 px edge, struck code, 21 px word) | 0.8 px hairline, no struck code, 17 px | Not started (pass 2) |
| Honest counters and empty states (item 10) | "58 of 152 topics built"; "No stones placed yet…"; "No timed runs saved yet…"; "coming" | Real |
| Every item kind creates a review card (item 1) | 13 due on day two: gate, twin, question, mistake | Real |
| Method marks (item 2) | The working box exists on practice (opt-in) and exam-style (on); with no working typed no method mark was awarded; the ladder was not exercised further | Present, unverified here |
| Hero rendered (item 3) | Lede, figure, three objectives, facts, one primary | Real |
| Spine, recap, close card (item 4) | Spine real; "You can now" recap real; the note ends on "End of the note." and the practice flow's close card was not reached (8 questions plus the set) | Real, partly seen |
| Re-teach on an unrecognised miss (item 6) | "Where the next mark is" + "Another way to see it" + retry | Real, with must-fix 1 |
| First run inside a seeded lesson (item 7) | Real | Real |
| Papers as a plan (item 8) | Real | Real |
| Dark mode | Body lch(13 3 85), ink lch(93), subject accents at 74% lightness with 14% ink on the button; no token leak on subject pages | Passes |
| Companion present from the first session (decision 3) | Letter on first run: yes. Today night one: a dry line. Today thereafter: nothing. Topic hero on first visit: nothing. Session close: not reached | Fails after night one |

---

## 8. Against the benchmarks, honestly

Part A's adopt/adapt decisions, as they stand in the pixels.

- **DeepStash's three-metric header**: adopted ("About 7 minutes · 7 short sections · 7 checks · 2 worked examples"), and undermined by its own arithmetic (7 versus 9 versus 63). Partial.
- **Lexend as an argument / Literata for the lesson**: in, since 23:52. Done.
- **Under-promise the minutes**: the hero under-promises the lesson and says nothing about the page. Partial.
- **No streak interstitial, no loss framing**: no streaks anywhere; "1 / 4" and eleven countdown bars remain. Partial.
- **CCEA provenance as the borrowed authority**: on the find-the-mistake reveal, the insight card and the next-step line, yes; on a question miss, no. Partial.
- **A goal stated at onboarding and replayed**: the plan is confirmed and replayed on Today; no "which paper is on your mind". Partial.
- **Real content inside the first minute**: yes, and better than any of the five. Done.
- **Brilliant's twenty-second working object and predict-then-reveal**: not present; the first interaction is a choice gate, the miss is prose. Not started, except the numeric-substitution line, which is the seed of it.
- **Kinnu's persistent contents and explain-the-mechanic**: the spine is there and cannot be hidden; the deck and the confident-miss line explain their mechanic. Partial.
- **Duolingo's value-before-setup**: yes. Done.
- **Khan's mastery reachable only in a later mixed set**: "No stone yet, and that is the honest answer" and the Map's "slipping" count. Done in the data; the Map does not yet show it as a journey.
- **Seneca's re-present in a different form**: "Another way to see it" on a miss, yes; the review's return, no. Partial.
- **Bitesize keeps no record of what you got wrong**: we keep one, and tonight it says 13 when the truth is 6. Behind our own promise until must-fix 5.

Where the product is plainly ahead of the pile on her desk, from this walk: the find-the-mistake reveal with the examiner's series; the marking with MW1 / P1 / A1 in CCEA's own codes and the scheme one tap away; the paper runner from preflight to a UMS estimate that names its own uncertainty; the honest counters; the first run. Where it is merely equal: Today, the contents pages, the flashcards, Settings. Where it is behind: the topic page's shape, the companion's presence, the ledger's arithmetic, and every figure on a phone.

---

## 9. The one change

If one thing is done before anything else on this programme, it is decision 9 as the directive states it and decision 1 as the programme states it, together: the lesson as one section per screen with the spine as the progress bar, the reading column at 640–720 px, the rail put away by default, the primary on the first screen, and the ten stages after the note reached one at a time rather than stacked. It answers focus, calm, the fold, the pinned chrome, the minute arithmetic and the directive's question in one build, and every island of play the topic page already has (the gate, the ladder, the reveal, the mistake) survives it unchanged.

Before that build starts, the eight must-fixes above are a day and a half between them and remove four claims the product currently cannot support: the wrong mark named on a miss, a silent companion, two unanswerable gates on the exemplar, and a ledger that counts what it does not measure.
