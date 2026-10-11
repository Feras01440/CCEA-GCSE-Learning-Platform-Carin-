# Owner findings on build 10 (11 Oct 2026)

The owner tested build 10 (cut 9 Oct, 02:49; Slides and Read v2 on 133 topics under the structure policy) and reported, in his words lightly tidied, the findings below. This file records them the way the 13 Sep and 24 Sep learner tests were recorded, so that each becomes one planned pass rather than a running rewrite. The lead adds the owner's and the student's later findings under dated headings.

## 1. The multi-step See it on Slides (11 Oct, 08:30)

"Slides that have multiple steps or points are not displayed in the best possible way when the next one is revealed, and when all of them are revealed the slide on the screen is not the easiest, smartest and most comfortable to read: you cannot see all of them, and the screen keeps rolling down in a way that is not a comfortable, great studying experience."

What the lead verified (build 10, `src/components/slides/SeeSteps.tsx`, `SlidesRun.tsx`): a See it's steps are appended to a scrolling card body and each reveal scrolls the newest step into view, so on a phone the earlier steps leave the screen; a six-step case (76 See its in the corpus have five or six steps) cannot be seen whole at the end. Routed to the `slides-steps` agent (brief `scratchpad/briefs/2026-10-11/SLIDES-STEPS.md`): a design note with three candidates, the build (no scroll on a reveal, the newest step in view, a whole-solution ladder at the end, two columns on a desktop), a `/lab/see-its/` page of the twelve longest cases, and a Playwright spec that measures every one of them at 390 × 844 and 1280 × 800.

Acceptance: the owner opens http://localhost:3200/lab/see-its/ on the next build and reads a six-step case on a phone without the card moving; at the end the whole case is on one screen.

## 2. The lead's pace (11 Oct, 08:30)

"Some of your work quality has dropped, delayed and become slow and not super efficient; plan how to solve this in the best possible way; introduce new ways, apps, tools, environments if that would make a huge help."

Changes in force the same morning: a link goes out the moment it exists and test results follow; builds are cut from the committed state in a detached worktree (`../cairn-build`) so agents' in-flight edits never block a build; a scheduled resume restarts every agent the weekly limit cuts; the `ci-tooling` agent is building CI on every push, a nightly drift job, a one-command local verify and a phone-reachable preview; the `assessor` agent is writing the programme assessment with the quality-consistency system and the plan (`docs/plan/review/2026-10-11-programme-assessment.md`).
