# The quality bar: what the best learning apps do, and where Cairn honestly stands

19 September 2026. Written to answer one question truthfully: when she asks "why do I need this, how is it different, how can it really help me", what can we say without flattering ourselves.

Method: the live dev build at `localhost:3017`, walked through first run, Today, the M4 unit list, `maths.m4.frustums-and-compound-solids`, `science.b1.b1-enzyme-factors`, practice, flashcards, papers and the map. Every count is from `src/generated/manifest.json`, the 104 bundles in `public/content/`, `data/links/media-map.json` or the file named.

---

## Part A. The bar

### DeepStash, studied closely

| Pattern | Why it works | For Cairn |
|---|---|---|
| Three-metric header on every collection: `49 Key Ideas · 5 Articles · 6 min read`, plus a four-bullet "What you'll learn" | Answers *what is this, how long, what do I get* before any scroll. The source count is shown as editorial labour, not a footnote | **Adopt.** Cairn's version: `10 sections · 14 questions · from 6 CCEA papers · about 30 min`. The data already exists as `hero.minutes` and the verification rows |
| One card = a 2 to 5 word title plus a single 70 to 85 word paragraph | Small enough that the card *is* the highlight | **Adapt.** Our unit is the note section: one idea, one visual, one gate per section |
| Per-collection accent colour derived from its own artwork | A large library becomes navigable by colour memory, and a derived palette cannot clash | **Adapt.** We derive an accent hue per subject in `app/globals.css:75-77`; extend to per-unit lightness |
| Lexend, a reading-proficiency typeface | The type choice is itself an argument about the product | **Adopt.** The showcase mock uses Literata for the lesson voice; the live app loads Inter only (`app/layout.tsx:11`) |
| A stated "6 min read" for roughly 3,700 words, about 2.5 to 3 times optimistic | Lowers the cost of starting | **Reject.** Under-promising the arithmetic is the cheapest trust available. If we say 30 minutes it must be 30 |
| Full-page streak interstitial before content, "the days you missed", paid-feeling repair | Loss aversion beats curiosity on retention dashboards | **Reject.** This is the single most-cited reason reviewers abandon an app they otherwise praise. It is the empirical case for `emotional-design.md` rule 1 |
| Book covers above the fold as borrowed authority | Pre-validated trust objects; the visitor recognises rather than evaluates | **Adapt.** Our equivalent is CCEA provenance: the paper, the series, the question number, already on every insight card |
| Onboarding asks a goal ("choose what you wish to achieve"), then replays it on a later benefit screen | A stated goal is a small self-consistency commitment; replaying it makes a generic claim one she has already endorsed | **Adopt.** First run already asks her plan; add one "which paper is on your mind" chip and reflect it on Today, per the companion spec |
| 23 onboarding screens before a card wall: the free trial needs billing details first | Long runway, closed door. Reviewers call it try-and-buy dressed as freemium | **Reject.** Ours must reach real content inside the first minute, not the third |
| Saving is the only interaction on a card; there is no highlighting, and shared ideas carry no source or author | The card is small enough to *be* the highlight, but the library will not export | **Adapt** the first half, **reject** the second. Our ledger and backup must stay hers and leave cleanly |
| Daily read plus paywall: a 49-card collection renders 3 cards on the web, then "continue in the app". Free is read, Pro is keep | Scarcity plus curation makes the free tier feel like a gift | **Adapt** the one-thing-chosen-for-you frame only. Nothing in Cairn is ever withheld from her |
| "10M+ downloads" rendered as "3M+ smart people"; a Free-vs-Pro table where both columns tick all six rows | Reads well, fails on inspection | **Reject.** A careful reader notices, and she is one |

### Five more, briefly

**Brilliant.** One idea, one screen, one interaction; a wrong answer re-runs the diagram, so the correction lands on a formed expectation; the first screen hands you a working object inside twenty seconds rather than a feature list. *Adopt* the twenty-second proof and predict-then-reveal, natural for M-unit graphs, transformations and the enzyme curve. *Adapt* the visual consequence: our miss feedback is textual only.

**Kinnu.** One to three sentence paragraphs opening on a narrative hook; a persistent left mini-contents listing the module's sections; and it explains its own spacing mechanic to the learner before naming it. *Adopt* the persistent section list, which is the spine in the showcase mock, and the explain-the-mechanic move for our review schedule. *Reject* its multiple-choice-only checking, which reviewers call recognition rather than retrieval.

**Blinkist and Headway.** The free tier is one pre-chosen summary per 24 hours, so curation reads as a gift rather than a crippled demo. *Adopt* the one-thing-chosen-for-you frame, which Today already has. *Reject* the streak and notification volume, and the cancellation funnel that dominates their Trustpilot pages.

**Duolingo.** Thirteen onboarding screens: why are you learning this, how much per day (middle option pre-selected), a placement quiz, a visible "building your course" beat, the first lesson, and only then sign-up. *Adopt* that order, value before setup. *Reject* the end-of-lesson economy, which its own critics call streak creep and a 2022 study links to anxiety.

**Khan Academy mastery.** Mastered is reachable *only* on a unit test or course challenge, never by grinding one exercise; Mastery Challenges are six questions over three skills, and both-wrong levels you **down**. *Adopt* all of it: levelling down makes the number a claim about current retrieval. *Reject* energy points.

**What she would compare us with.** **Seneca** does not cover CCEA at all: its own help page lists nine boards and CCEA is not among them. Its "2x faster" claim is a vendor-run trial against passive guide-reading. **BBC Bitesize** does carry CCEA, free and with no account, but the consistent student verdict is that revising from it alone caps you around a B, and it keeps no record of what you got wrong. *Adopt* Seneca's best mechanic, re-presenting a missed idea in a different format rather than marking it red. That is the honest opening: the board-correct product has no depth, and the deep product has the wrong board.

---

## Part B. Where Cairn actually is

### Scorecard

Scored 1 to 5 against the benchmark bar above, not against other revision sites.

| Surface | First 5 seconds | Teaches a first-timer | Prepares for the CCEA paper | Return without manipulation | Coverage today |
|---|---|---|---|---|---|
| First run (`/welcome`) | 2 | 1 | 1 | 3 | 2 |
| Today | 4 | 2 | 4 | 4 | 3 |
| Unit list (M4) | 4 | 3 | 4 | 3 | 3 |
| Maths topic (frustums) | 3 | 4 | 5 | 3 | 5 |
| Science topic (enzyme factors) | 3 | 4 | 4 | 3 | 2 |
| Practice flow | 3 | 3 | 4 | 3 | 3 |
| Flashcards | 3 | 2 | 3 | 4 | 4 |
| Papers | 3 | 1 | 5 | 2 | 5 |
| Map | 3 | 1 | 5 | 3 | 5 |

### What has genuinely landed since 13 September

Both of her complaints are fixed, measurably. The pre-check lock is gone: frustums opens on the lesson, with a hook, a labelled figure and a "1 of 10 checks done" counter. The paper-only wall is gone: `isAutoMarkable` (`spec-map.ts:154-168`) now accepts `text`, `text-long`, `table`, `label`, `order` and `steps`, and the clause at `QuestionRunner.tsx:30` is deleted, so **3 parts of 2,088 (0.1%) are paper-only**, down from 375 of 1,865, and science is at zero. Practice is one question per screen with a progress line, the 192 mixed sets render, `onTwin` is wired, the mobile "More" destination exists and `data-subject` tints are live.

Content is now 104 topics: maths 54, science 33, further maths 17 including FM3. **For her two maths papers, M4 is 9 of 9 and M8 is 15 of 15: complete.**

### Where Cairn is better than the pile on her desk

Not marginally, and with numbers behind it.

- **274 named examiner findings** across 56 insight cards, each with the series, question number, what was asked, what went wrong and a one-line fix. Frustums names November 2024 M4 Q12, M3 Q26 and M4 Q22. Nothing free or paid does this for CCEA.
- **2,612 authored common errors on 1,775 of 2,088 parts (85%)**, so a recognised wrong answer is diagnosed, not marked. Typing 1,700 on the first frustums question is met by "the one third has been left out, so that is a cylinder".
- **Schemes in CCEA's own language on all 2,088 parts**: 4,667 marks coded A 1,182, P 1,172, MA 1,109, M 487, MW 295, W 224, QWC 198.
- **"Not on this spec"** on 36 notes, telling her what to stop revising. Corbettmaths and Bitesize cannot, not being CCEA-first.
- **414 official papers** wired to ccea.org.uk with schemes, a timed runner and UMS conversion.
- **199 find-the-mistake items** from real candidate errors, still the strongest interaction here.
- **2,958 verification rows** behind a visible "Checked" panel. No revision site shows its working.

### Where it is merely equal

Videos: 699 in `data/links/media-map.json`, every one a YouTube facade (`VideoEmbed.tsx:27`), mostly Corbettmaths and BBC. She has these already; ours are better placed, at the point of need with a gate after, but they are not ours and cannot go offline. Flashcards: 2,227 cards is a good deck, but Anki exists. The unit list is a clean contents page, no more.

### Where it is behind

**1. Her review promise is false for most of her work.** `record.ts:66` creates a review card only when `itemKind` is `prompt`, `diagnostic` or `recall`. Practice, exam-style, find-the-mistake and note gates all record attempts and move mastery, but create nothing. So of the corpus, 900 prompts and 733 diagnostics come back; **1,358 original questions, 199 find-the-mistake items and 607 note gates do not**. The close card in `PracticeFlow.tsx:149` nonetheless says "anything you missed will come back in your reviews". That sentence is not true today, and it is the central claim of `why-this-platform.md:13`.

**2. She cannot earn the method mark.** I typed 500 for a 2-mark cone volume and got "Not yet, 0 of 2 marks". That part's authored scheme is `MA1 for (1/3)π(6)²(15) seen` then `A1 for 565`. The MA1 exists in the data and cannot be awarded, because numeric, algebraic, equation and mcq parts score all-or-nothing (`mark.ts:147, 167, 179, 228`). Corpus-wide that is **1,044 multi-mark parts holding 2,809 marks, of which 2,005 are method or process marks the app never awards**. For a student aiming at A\*, where full UMS sits below 100 raw, method marks are the whole game. `requiresWorking` is set on 1,092 parts and read by nothing.

**3. Generic feedback on an unrecognised miss.** 500 matched no authored error, so the diagnosis was "That is not the expected answer. Check each step of your working." No examiner sentence, no named step. The good feedback is conditional on hitting one of the 2,612 patterns.

**4. The hero is authored and not rendered.** 96 of 104 notes open with a `hero` block carrying a `lede`, three "you will be able to" lines and a `minutes` estimate: 288 objective lines and 96 honest time estimates. `StepRevealNote.tsx:187` skips the block because the topic page shows it, and the topic page (`app/learn/[subject]/[unit]/[topic]/page.tsx:51-60`) passes no lede and renders no hero. In the showcase mock this same material carries the first screen beside a seven-section spine.

**5. No spine, no end, no phone navigation.** Frustums is one scroll of roughly 8,000 words: a 10-section lesson, 3 worked examples, a 4-item check, 14 practice questions, 4 exam-style questions, 3 find-the-mistake items, 7 prompts and the "In the exam" panel. The only navigation is a seven-link bar set `hidden ... md:flex` (`TopicContent.tsx:110`), so on her phone there is none. No note of the 104 has a recap block; there is no stopping point, no close card, no stone.

**6. Appearance has not had its pass.** `border border-line bg-surface` appears 58 times, so a diagnostic, a reference card and a video look identical; `text-[14px]` appears 9 times in `TopicContent.tsx` against a 17 to 18px prose token; only Inter is loaded.

**7. Coverage, counted against her entries.** Of the 219 catalogue topics on her eleven papers plus Unit 7, **74 have content (34%)**. Maths 24 of 24. Further maths 17 of 61. Science 33 of 134, with **C1 at 0 of 25, P1 at 0 of 22 and Unit 7 practical skills at 0 of 4**, while the Map honestly shows the empty denominators and `/learn` advertises "8 units, 152 topics" against 54 built. Flashcards are further ahead than lessons, including 65 C1 and 208 P1 cards.

**8. Papers and Map are directories, not plans.** `/papers` lists 164 maths papers as identical cards, including every Foundation unit she will never sit, with no default to her plan and no "sit this one next". The Map's journey chart is an empty axis with no designed empty state, and "Your papers" sat on "Loading your plan..." with no skeleton.

**9. First run teaches nothing.** `FirstRun.tsx` is still 96 lines and two cards, rendered inside the full app chrome so the gift moment competes with a sidebar, ending in `router.push("/")`. Nothing demonstrates a gate, a scheme, a stone or what "Proficient" means before she is handed 104 topics.

### What changes when the current work lands

One-question practice has already landed. The hero pass fixes most of the first five seconds: lede, three objectives and an honest minute estimate are authored and waiting. The spine gives her a place in the lesson and a stopping point, and with per-section minutes it fixes the phone case too. None of the four touch items 1, 2, 3, 7, 8 or 9.

---

## Part C. The answer to her question

### As it is true today

"You already have the spec, the papers, the schemes, Corbettmaths and Bitesize. That is a good set, but none of it is built around your papers: Seneca does not do CCEA at all, and people who revise from Bitesize alone tend to land around a B. This adds three things you cannot get anywhere. Your M4 and M8 content is complete and written from eight years of Chief Examiner reports, so every trap is a mark real candidates lost, with the series and question number beside it. Every question is original, in CCEA's layout, with the scheme in CCEA's own M, A and MA language, and it shows what was checked before it was published. And it knows your eleven papers on their real dates and turns a past paper into UMS and a grade, which no CCEA Maths calculator exists for anywhere. What it is not yet: Further Maths is a quarter built, Chemistry 1 and Physics 1 have flashcards but no lessons, it marks your final answer rather than your working so it cannot yet give you a method mark, and only some of what you get wrong comes back."

### When the current work lands

Add: "Each topic now opens by telling you what it is, what you will be able to do and how long it takes, with a spine down the side so you always know where you are and where you can stop. That is the difference between a page you scroll and a lesson you finish."

### The ten changes, in priority order

| # | Change | Benchmark pattern | Where | Effort |
|---|---|---|---|---|
| 1 | Call `ensureCard` for every `itemKind`, not three. Make the close-card sentence true | Khan mastery is a claim about current retrieval | `src/lib/session/record.ts:66` | Half a day |
| 2 | Award method marks: `WorkingLadder` marking line by line, opt-in on the lesson path, default on exam-style, using the 2,005 authored method marks and 1,092 `requiresWorking` flags. The line comparator already ships as `fixMatches` | Brilliant: the correction lands on the step, not the verdict | `mark.ts`, `QuestionRunner.tsx`, `mistake-marking.ts` | 1 to 2 weeks |
| 3 | Render the hero: lede, the three `can` lines, the honest minute estimate, the figure, one primary button | DeepStash three-metric header plus "What you'll learn" | `app/learn/[subject]/[unit]/[topic]/page.tsx:51-60`, `StepRevealNote.tsx:187` | 2 days (in flight) |
| 4 | Lesson spine with per-section minutes, working at 375px, plus a "Pause here" stopping point, a recap block in all 104 notes and a close card that places the stone | Kinnu's persistent mini-contents; the showcase phone mock | `TopicContent.tsx:110`, `pipeline/prompts/author-topic.md` | 4 to 5 days plus 104 authored recaps |
| 5 | Author C1, P1 and Unit 7 practical-skills lessons: 51 topics, roughly half of what is left on her science papers | Bitesize's real weakness is depth; ours is presence | `pipeline/`, `public/content/science/` | 4 to 6 weeks |
| 6 | Replace the generic miss line. On an unrecognised wrong answer, show the scheme step she has not reached and re-present the idea in a different form, then re-ask a twin | Seneca: re-present in a different format, never mark red | `mark.ts:139`, `FeedbackCard` | 3 days |
| 7 | End first run inside a seeded topic, on a chrome-free surface: one real section, one gate, one marked question, naming gate, scheme and stone as each first appears | Duolingo defers sign-up until after the first lesson; Kinnu explains its own mechanic | `src/components/gift/FirstRun.tsx` | 3 days |
| 8 | Make `/papers` a plan: default to her eleven entries, hide Foundation, next paper first with days remaining, raw to UMS to grade after a run | Blinkist's one-thing-chosen-for-you | `app/papers/`, `exam-plan.ts`, `grades/ums.ts` | 3 days |
| 9 | Appearance pass: three surface levels instead of one recipe used 58 times, Literata for lesson prose, the `text-[14px]` instances raised to the prose token, subject tint on chrome only | DeepStash's derived accent; Lexend as an argument | `src/components/ui.tsx`, `app/globals.css`, `app/layout.tsx:11` | 3 days (in flight) |
| 10 | Honest counters everywhere: `/learn` should say "54 of 152 built", the Map journey chart needs a designed empty state, and "Loading your plan" needs a skeleton | DeepStash's optimistic minutes are the trap to avoid | `app/learn/page.tsx:13`, `app/map/`, `src/components/ux/Skeleton.tsx` | 1 day |

Items 1, 6 and 10 are two and a half days between them and remove three claims the product currently cannot support. Do those first.
