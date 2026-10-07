# The standard every agent works to

Cairn is a gift for one student. Every line of it is read by a fifteen-year-old alone at night before a CCEA paper, and she cannot tell what to trust unless all of it is true. The owner's order (22 September 2026, reaffirmed on 24 and 27 September and on 7 October): no rush, no quick work, no quick searches; deep, highest-standard work so that she can understand, rely on and actually be helped by it. "No rush" never means stall: work continuously, never shallowly, and never trade the bar for speed. No task is worth doing just to say it was done, and no task is ended before it is finished.

## Rules that bind every piece of work

1. Read every source in full before writing: the specification, the papers and mark schemes for the topic, the Chief Examiner's reports, the CCEA textbook chapter where one exists (docs/sources/textbooks, private), and the existing pack. The scheme decides marking; the textbook helps teaching; neither is copied.
2. Nothing is copied. Every sentence is ours; `scripts/qa/shingles.mjs` must report 0 breaches for the topic, and an allow entry is written only for CCEA's own required wording with file and line.
3. Every number is generated once by code and re-executed before it is printed; a second route checks the error-prone ones. A worked example works on the note's own numbers; every practice question, twin, find-the-mistake and synoptic uses different numbers or a different situation.
4. Every answer that can be typed is marked through the real engine (`markAnswer`, `markGate`, `markFix`, `stepLineMatches`) with right answers in a student's phrasings (negations, hedges, labels before values, units, a formula reversed, a decimal for a fraction), wrong answers, and near misses. A right answer refused or a wrong answer paid is a defect, never a note.
5. A lesson teaches before it checks: explain, then show (an inline See it on the note's own numbers, one input per step), then check (a Your turn on new numbers, with a twin and a note on every wrong option). A figure, a formula or a fact list is not "shown".
6. Teach why. Every rule carries its reason, every common error its examiner evidence by citation, and every citation is checked against the report text before it is written.
7. Credit-only edits (step inputs, follow-through relations, common errors re-valued to the scheme, citations, option notes, widened acceptance) are made in place. Anything that changes what is right, or what a right answer earns, is withdraw-and-replace: the old id stays, its record says why, and a new id carries the fix. A withdrawn item never changes again.
8. Stage first, write the pack only when every check is green: `npm run content:check` lines at 0 for the topic (MARKING, GATE, SIZE, CHARACTER, figure leaks, shingles, answer-shown, withdrawn), sizes within limits, and the probes clean. An intermediate pack on disk breaks every other agent's checks.
9. An engine fault is fixed in the engine, never worked around in a pack. Record it as engine-pending with the exact input and award, and carry on.
10. Timestamps come only from `date`. Reports give counts, hashes and ids, name what is not done and why, and never describe a pass as complete while a check is red.
11. Working files live in the repository's git-ignored `scratchpad/` folder (state/, briefs/, reports/, probes/), never in a session's temporary folder: those are deleted without notice. Decisions and reports for the owner go to the owner in chat, not into the repository.

## The five self-audit questions, answered at the end of every report

1. Would she understand it alone at night, without anyone to ask?
2. Can she rely on every number, every scheme line and every award?
3. Does it earn her marks on her real paper, or is any of it filler?
4. Would a Chief Examiner sign it as CCEA-true?
5. Is there a line you would be embarrassed to defend? Name it.

## How to report

Lead with what is finished and verified, with hashes and counts. Then what is not done and why. Then the check lines verbatim. Then the files touched. Then the five answers. Never round a red check up to green, and never claim a check you did not run.
