# Emotional design for Cairn

Cairn must not merely mark correctly and look clean. Every necessary minute inside it should feel clear, responsive and personally meaningful, and it must optimise for healthy revision, never for time spent. This document turns that principle into rules and audits each major interaction.

## The emotional sequence

| Moment | She should feel | Cairn does |
|---|---|---|
| Before a session | **Clarity**: "I know exactly what to do." | Today opens on one thing: tonight's reviews with a minute estimate, or the single next step with the examiner's reason. One accent colour, one button. |
| During | **Focus**: "The interface disappears around the work." | One question per screen. No badges, timers or counters in the periphery. The answer field and Check button are the only accented elements. |
| After each step | **Momentum**: "I can feel I am progressing." | A thin progress line fills one step at a time (200 ms, transform only). A quiet tick draws in on a correct answer. The next card rises in. |
| After the session | **Calm accomplishment**: "I completed meaningful work." | The close card states what was done in exam terms (items, minutes, marks recovered, stones placed) and the retention forecast for the next paper. No fanfare. |
| Over time | **Trust and continuity**: "I can see what I have proved and where to focus next." | The cairn grows: one stone per topic proved Proficient. The Map shows every statement by state, honestly, including decay. |

## The motif

A cairn is built one stone at a time by people who walked the path before you. Cairn's motif is the **stacked stone**: three stones in the wordmark, a stone count on Today ("14 stones · M4"), a stack that grows on the Map per unit, and a stone quietly placed on the close card when a topic reaches Proficient. Stones are only ever placed, never taken away in a session; a topic that decays shows as a paler stone on the Map, not as a loss message.

## Rules

1. **No shame, no loss anxiety.** A missed week produces no message. The week strip shows what was done, never what was not. After a gap the Today copy is one line: "Ten minutes is enough tonight." Streaks are counted in weeks with three or more sessions and are never framed as something to lose.
2. **No variable rewards, XP, coins, leaderboards, confetti, mascots or cartoon gamification.** Celebration is proportionate: a stone placed, a full-screen card only for a unit reaching Proficient across the board or an exam-ready state, and even then 1.2 seconds and reduced-motion safe.
3. **Every important interaction gets a human response, not only a database write.** See the audit below.
4. **Unsuccessful states are designed.** A miss shows the expected answer, one line of diagnosis, the examiner's sentence with its series, and a way to fix it now. Two misses bring an offer of a hint or a worked example instead of a third attempt. The word "Wrong" never appears.
5. **Tactile controls.** Grading buttons sit at thumb height, 52 px tall, with a 0.98 press scale and an 8 ms vibration where the device supports it (never on desktop, never when reduced motion is set).
6. **Motion is quick, precise, optional.** 150–300 ms, transform and opacity only, `prefers-reduced-motion` honoured everywhere; nothing moves on scroll inside the study surface.
7. **Loading and empty states are designed.** Skeletons in the shape of the content; empty states say what will fill the space and give one action.
8. **Offline is calm.** Everything is on the device; the close card says "Saved on this device" once, quietly. When export is due, a single line suggests a backup.

## Interaction audit

| Interaction | What did she just do? | Immediate feedback | She should understand | She should feel | What happens next |
|---|---|---|---|---|---|
| Opens Today | Arrived | The date, the next paper in days, one tile with tonight's count and minutes | Exactly what tonight is | Clarity | Taps Start |
| Answers a diagnostic | Chose an option and a confidence | The chosen option's own feedback; the correct option outlined; a note if confident-wrong | Which misconception she holds, if any | Curiosity, not judgement | Next item rises in; confident-wrong items return in 2 and 7 days |
| Submits a practice answer | Typed an answer | Tick draws in, or the expected answer plus a one-line diagnosis and the examiner's sentence | Where the method mark was | Momentum or a clear fix | Next part; "Fix it now" twin on a miss |
| Grades a flashcard | Tapped Again/Good/Easy | The card rises away; the progress line fills one step; a short vibration on touch devices | Again means "soon", Easy means "later" | Control | Next card; Again cards return at the end of the run |
| Finishes a review | Completed the queue | Close card: items, minutes, predicted recall on the next paper date, stones placed | The work was meaningful and is remembered for her | Calm accomplishment | "Done for tonight" or five more minutes |
| Finishes a mixed set | Completed N questions | Marks out of the total, lost marks filed with reasons | What to recover cheaply | Perspective | Another set or change the mix |
| Sits an official paper | Timed run, self-marked | Raw → UMS → grade drawn as one arc, the A* bracket, the gap in raw marks | Where she stands in the exam's own units | Trust | Marks lost go to the ledger; twins appear in the next session |
| A topic reaches Proficient | Answered correctly in a later mixed set | A stone is placed on the close card with the topic name | Proof, not hope | Quiet pride | The stone appears on the Map; decay shows later as a paler stone |
| Misses a week | Returned after a gap | Nothing about the gap; Today shows a short queue and "Ten minutes is enough tonight." | Nothing is lost | Welcome, not guilt | Starts small |
| Reads a note | Answered a gate | The next paragraph rises in; the check count ticks up | The note is a conversation, not a page | Focus | Continues |
| First run | Read the note, typed her name | The exam map already filled in with real dates | It was made for her | Being known | Today |

## Implementation notes

- `src/lib/ux/haptics.ts`: `tap()` calls `navigator.vibrate(8)` on touch devices unless reduced motion is set.
- `src/components/ux/ProgressLine.tsx`: a 2 px line that fills per step with a 200 ms transform.
- `src/components/ux/CairnStack.tsx`: stones for a count, used on Today, the Map and close cards; a newly placed stone settles in over 300 ms.
- `src/components/ux/Skeleton.tsx`: content-shaped loading placeholders.
- Close cards (`ReviewComplete`, deck done, mixed set done) share one calm layout and never use the words "streak", "lost" or "missed".
