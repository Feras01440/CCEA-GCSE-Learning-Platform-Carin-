# The queue: where the programme stands and what runs next

Kept in the repository from 26 September 2026. The lead updates it and pushes it with every landing.

Until 25 September the queue, the agent briefs and every agent's checkpoint lived in a session scratchpad on one machine (`C:\Users\feras\AppData\Local\Temp\claude\…\scratchpad\`, listed in `docs/plan/HANDOFF-2026-09-23.md`). None of that is in git. The cloud session that continued the programme on 26 September started from this repository, the handoff, and the owner's status note of 25 September. Anything below marked "local only" still has its detail on that machine.

Sources for this file: `docs/plan/HANDOFF-2026-09-23.md`, the fork chat's status of 25 September (pasted by the owner on 26 September), the commits up to 25 September 06:18, and the checks run in the cloud on 26 September.

## 1. Where things stand (26 September 2026)

| Measure | Value |
| --- | --- |
| Topic pages in the export | 359 (FM4's 12 are outside her plan, so 347 in her units) |
| Topics published | 198 |
| Last build locally | Build 8, on the owner's machine (:3200) |
| This branch | Build 9 candidate: see section 2 |

Year 12 units, published of total:

| Unit | Published | Still to author |
| --- | --- | --- |
| FM1 | 29 of 29 | none |
| FM2 | 16 of 16 | none |
| FM3 | 16 of 16 | none |
| M4 | 9 of 9 | none |
| M8 | 15 of 15 | none |
| B2 | 18 of 20 | heart attacks and strokes; non-communicable diseases and cancer |
| C2 | 20 of 22 | carbon dioxide preparation; hydrogen and oxygen preparation |
| P2 | 16 of 20 | big bang evidence; life cycle of stars; solar system and satellites; stars and fusion |
| Unit 7 | 0 of 4 | planning; carrying out; analysing; conclusions (needs a brief) |

Year 11 units: M3 17 of 17, M7 17 of 17, B1 21 of 21, C1 2 of 25, P1 2 of 22.

## 2. What the cloud session did (26 September)

- **Engine re-verified.** The overnight engine work of 24 to 25 September had not passed its verifier. `scripts/qa/marking-guard.mts` now does that job in the repo: about 14,000 probes over every published answer, common error, gate, find-the-mistake fix, worked-example twin and chemical equation, and a before-and-after diff of two engines on the same content. Against the 24 September engine on today's content: 0 regressions; 13 right answers refused by the old engine are now paid; errors paid above their typical marks fell from 47 to 1.
- **Wrong answers paid in full, closed.** The first guard run found 20. Now 0, with 2 queued below. The fixes: a matched common error never lifts a wrong answer to every mark; a "simplify" stem over a fraction demands the fraction in lowest terms when the author set no form, unless the author's own answer is not; a common error can be marked `accepted`, a right answer with a note (the FM2 false-origin graph and P1's unit note, which were recorded as misses with full marks); content repairs on P1 speed-equations q0003(b), FM1 multiply-divide q0001 and expand-three-brackets q0001, and M3 simplifying q0011. Content-lint now fails any common error worth the whole part unless it is accepted.
- **The expected answer, in the demanded form.** A question that asks for a fraction, a surd, a multiple of π or standard form now shows 7/11, 3√5, 49π or 2.7 × 10³ on the feedback card, not a 12-digit decimal.
- **The trial topic, reconciled with its note.** The content pass of 25 September rebuilt the note (seven sections in teach, show, check order, eight gates with five withdrawn and replaced, a timed video, two light prompts). The app side still pinned the old note: 16 unit tests and 35 Slides end-to-end tests failed, and the Slides drawings still showed 2x(x + 5) over 4(x + 5)(x − 5) worked to its answer, which is worked example 1. The drawings now use the note's own figure, 3x(x + 7) over 6(x + 7)(x − 7), the recap has a fourth glyph for its fourth line, and the tests describe the note as it is.
- **Three app fixes that the specs of 25 September already described** (the specs were committed without the app side):
  - On a phone, the verdict's last line is brought into view above the foot after Check (audit LD-14).
  - The close's returns row says "Tonight" for cards due before the evening ends at 04:00. That is the close's own count of what is due tonight, so a card made at ten to midnight no longer reads "Tomorrow".
  - The Tonight tile waits for her mastery rows before it draws. Its Learn link no longer turns from /learn/ into a topic after the first paint.
- **Tests brought up to the note.**
  - The Read spec now counts the note's nine sections and names its first.
  - The hero test no longer waits out the whole test timeout for an untimed-video line that the timed video no longer has.
- **Checks on this branch:** all green on the final export of 26 September.
  - Typecheck: clean.
  - Unit tests: 2,088 passed, 2 skipped.
  - `npm run content:check`: 198 published, 0 problems. lesson-v2 has 0 breaches (13 allowed). The marking guard ran 13,988 probes with 0 unexplained failures; 139 graph, drawing and extended-answer parts are not probed.
  - The whole Playwright suite, run alone on both projects: 242 passed, 2 skipped, in 14.7 minutes.
- **An advisory for the owner:** `docs/plan/review/2026-09-26-advisory.md`, also published as a doc for comments. It gives:
  - ten moves, in order;
  - the platform measured against modern standards;
  - a recommendation on each of the eight teach-first questions;
  - five decisions for the owner;
  - a 30-day plan.

## 3. The queue, in order

1. **Build 9 for her.** Pull this branch on the owner's machine, `npm run build`, run `npx playwright test e2e/slides.spec.ts e2e/learn.spec.ts e2e/companion.spec.ts` alone, then the rest, serve the export on :3200. The owner tries the trial topic first; then the second sit-down with her.
2. **Engine queue** (engine agent). From the guard, each with its allow-list entry: a simplest-surd form (M8 3-D q0013 pays √216 for "the form a√b"; M8 surds q0007 pays 12 + 7√2 + √4 for "the form a + b√2"); the find-the-mistake check line that holds the corrected value (M3 pressure ftm.02); `simplifiedOnly` refuses the sign-flipped (−a − 2)/(3 − b); "2/3√3" and "2/3π" are read as 2 over 3√3 and 2 over 3π; a fraction typed where the stem instructs 2 d.p. earns 0 where the form rule elsewhere gives marks − 1. Then a text-marking guard, which is move 4 of the advisory. It measures the key-word marker's agreement on labelled answers for each text part: 1,404 parts, 32% of all marked parts. Then the programme's stream 0 items (`docs/plan/2026-09-22-programme.md`), each checked against the code: the local queue's numbering (items 3 to 13, 15 to 19) is local only.
3. **Content repairs** (local only for detail). The build also warns that 49 worked-example figures print an answer that a problem version asks for (the `FIGURE` lines of `npm run build`); clear them in the same passes. B2 D, FM3 and C2 D were mid-repair when the 5-hour limit stopped every agent at about 06:25 on 25 September; their checkpoints are the batch `STATE.md` files in the content session's scratchpad. On that machine: relaunch each from its `STATE.md`. From the cloud: re-run the strict second reading on those three batches from the repo, with `npm run content:check`, `node scripts/qa/lesson-v2.mjs --teach`, `node scripts/qa/figure-leaks.mjs` and `node scripts/qa/shingles.mjs` as the gates.
4. **Year 12 authoring.** Unit 7's four first, since Unit 7 is 25% of the Double Award and has none; it needs a brief first. Then B2's two, C2's two and P2's four (the space block, which the status note of 25 September counted as authored). Written to v3 once the owner has answered the teach-first case, so that none is written twice.
5. **Decisions only the owner can make.** The advisory (`docs/plan/review/2026-09-26-advisory.md`, section 6) gives a recommendation on each:
   - the teach-first case (`docs/plan/review/2026-09-24-teach-first-case.md`, section 12, eight questions);
   - the pace against the weekly budget, which resets on Sundays at 17:00;
   - where she uses the platform: the owner's machine now, or a private HTTPS address. On the phone, the laptop's plain address gives no offline copy (`docs/dev/deploy.md`, corrected);
   - continuous checks on GitHub;
   - a CCEA teacher's review of a sample.
6. **Approved but unbuilt, after the trial passes her.** Practice modes; the flashcards restyle; icons and motion (pass 3); Slides and Read v2 on every Year 12 topic; the "Words only" companion setting.
7. **Year 11 afterwards.** C1's 23 and P1's 20.

## 4. The rules that bind every item

From `docs/plan/HANDOFF-2026-09-23.md`, unchanged: the highest standard and no rush; no feature without a case shown to the owner; Year 12 first; Slides is the primary way in on both sizes; Read has no rail beside the text; the character is the hare, never inside a question; the craft floor holds for every drawing; the trial on one topic before any roll-out; Fable does at least half the work; 10 to 15 agents, sequenced; Playwright runs alone, never under a build.

## 5. Bringing the local-only files into the repository

If the cloud should carry on without that machine, copy these into `docs/agents/` and push: `STANDARDS.md`, `RESUME-NOTICE.md`, `PLATFORM-PROGRAMME.md`, `DIRECTIVE-2.md`, `DESIGN-V2-BRIEF.md`, `TRIAL-BRIEF.md`, `FEATURE-CASES.md`, `AUTHORS-DEPTH-MESSAGE.md`, the old `QUEUE.md`, and every `platform\<agent>\STATE.md` and content batch `STATE.md`, plus the memory file `project-resume-queue-13-sep.md` and the feedback memories the handoff names.
