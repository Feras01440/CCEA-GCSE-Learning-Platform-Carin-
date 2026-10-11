# Owner findings on build 10 (11 Oct 2026)

The owner tested build 10 (cut 9 Oct, 02:49; Slides and Read v2 on 133 topics under the structure policy) and reported, in his words lightly tidied, the findings below. This file records them the way the 13 Sep and 24 Sep learner tests were recorded, so that each becomes one planned pass rather than a running rewrite. The lead adds the owner's and the student's later findings under dated headings.

## 1. The multi-step See it on Slides (11 Oct, 08:30)

"Slides that have multiple steps or points are not displayed in the best possible way when the next one is revealed, and when all of them are revealed the slide on the screen is not the easiest, smartest and most comfortable to read: you cannot see all of them, and the screen keeps rolling down in a way that is not a comfortable, great studying experience."

What the lead verified (build 10, `src/components/slides/SeeSteps.tsx`, `SlidesRun.tsx`): a See it's steps are appended to a scrolling card body and each reveal scrolls the newest step into view, so on a phone the earlier steps leave the screen; a six-step case (76 See its in the corpus have five or six steps) cannot be seen whole at the end. Routed to the `slides-steps` agent (brief `scratchpad/briefs/2026-10-11/SLIDES-STEPS.md`): a design note with three candidates, the build (no scroll on a reveal, the newest step in view, a whole-solution ladder at the end, two columns on a desktop), a `/lab/see-its/` page of the twelve longest cases, and a Playwright spec that measures every one of them at 390 × 844 and 1280 × 800.

Acceptance: the owner opens http://localhost:3200/lab/see-its/ on the next build and reads a six-step case on a phone without the card moving; at the end the whole case is on one screen.

## 2. The lead's pace (11 Oct, 08:30)

"Some of your work quality has dropped, delayed and become slow and not super efficient; plan how to solve this in the best possible way; introduce new ways, apps, tools, environments if that would make a huge help."

Changes in force the same morning: a link goes out the moment it exists and test results follow; builds are cut from the committed state in a detached worktree (`../cairn-build`) so agents' in-flight edits never block a build; a scheduled resume restarts every agent the weekly limit cuts; the `ci-tooling` agent is building CI on every push, a nightly drift job, a one-command local verify and a phone-reachable preview; the `assessor` agent is writing the programme assessment with the quality-consistency system and the plan (`docs/plan/review/2026-10-11-programme-assessment.md`).

## 3. The assessor's product findings on build 10 (11 Oct, 09:17; `docs/plan/review/2026-10-11-programme-assessment.md` §2), kept here for the planned pass after the student test

Defects, fixed at once (exempt from the one-pass rule): a B2 feedback line prints the engine's own key-word list ("cheap|less expensive|…") instead of a sentence (routed to the engine agent as a display fix); the deck's "n of N" grows as twins are appended (55 became 62 in a walk), a trust wobble on a surface built on trust (routed to slides-steps for after the See it fix).

For the planned pass (one brief, one build): the unit page is a plain list with no sign of where she is (per-topic state: not started / paused at section n / done / proved); the hero should offer the section as the unit of an evening ("Section 1 · 4 min"); the first thing she reads on day one is "Nothing back tonight."; no Previous control on the phone deck; a miss is final in Read; one manipulable object in 55 cards where Brilliant has one on most screens; drawings on about a third of cards against the art direction's one per card; density per minute (a 37-minute first topic under a Today card that says ten minutes is enough).

Missing, each behind a feature case: practice inside the lesson (the owner's answer 1 defers it); Papers exam mode; a "this is wrong" button on a card that files a finding; search; a visible plan across weeks.

## 4. The owner's standing request restated (11 Oct, 15:10)

"We said we need huge improvement for the platform visually and practically; flashcards must be way better in all terms; the same goes for practice. I haven't seen any work regarding upgrading these things."

True. Both cases were approved on 23 Sep (benchmarks §10 and §15; "practice is good; flashcards are ok"; Gizmo named for flashcards) and queued behind the trial, the roll-out and the engine gate; neither was built. Routed on 11 Oct to a Fable designer and two Opus builders (`scratchpad/briefs/2026-10-11/FLASHCARDS-PRACTICE.md`) at the head of the 17:04 wave; the case document lands at `docs/plan/review/2026-10-11-flashcards-practice-case.md` with a canvas for the owner. Also asked the same hour: an engineering review as a real software team would give it, the old-laptop route, durability and recovery, how we compare on the engineering side, and the lessons for his March 2027 platform (`ENGINEERING-REVIEW.md`, output `docs/plan/review/2026-10-11-engineering-review.md`).
