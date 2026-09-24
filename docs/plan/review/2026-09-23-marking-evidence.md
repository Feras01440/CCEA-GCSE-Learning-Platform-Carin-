# Marking and items evidence sweep (filed verbatim)
Source: read-only code sweep by the research-plan agent's child agent (task a025b6996eef05c38), delivered 23 Sep 2026 00:04 and recovered from its transcript on 23 Sep 13:25 by the research-plan agent. Sixteen questions about the marking engine and the item components, answered against the source as it stood on 22 Sep 2026 between 23:50 and 00:04 (appearance pass 1 was editing tokens at the same time; marking files were untouched). Filed unchanged, per DIRECTIVE-2.md decision 13; the research-plan agent's own re-verification of the four contradictions and the two summaries the sweep itself flags as overstated (sections 7 and 8) is recorded in docs/plan/review/2026-09-22-research-application.md and docs/plan/2026-09-22-programme.md, not here.

All 16 questions are answered below. Every citation is a line I opened; all paths are under `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\`, written in full.

**Things that contradict the code's own comments or on-screen text:**
1. **No offer after two misses.** `EncouragementCard` (hint or worked example) is only mounted in the dev gallery, which nothing imports. The code comments and the companion line both promise that choice; the runner never shows it.
2. **No series on a question miss.** The examiner slot in production shows the part's first hint, never a series citation.
3. **Physics equation parts give every mark for the equation line alone.** The substitution and answer lines are never checked.
4. **"Something wrong?" reports are thrown away.** The panel says the item will be re-checked, but the handler does nothing.

---

### 1. Method marks — **partial**
- **Engine:** `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\lib\marking\working.ts:156` `export function methodSteps(scheme: readonly MarkPoint[], workedSolution = ""): MethodStep[]`; `:259` `export function markWorking(typedLines: readonly string[], scheme: readonly MarkPoint[], workedSolution = ""): WorkingMarks`.
  - Only M/W/P codes: `:33` `const METHOD_CODE = /^[MWP]/;`
  - Each line can pay for one mark only: `:263-272`. Capped at the method total: `:274`.
- **Where the ladder is offered:** `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\components\topic\QuestionRunner.tsx:75` `const LADDER_KINDS = new Set(["numeric", "algebraic", "equation", "mcq"]);`, and only when the scheme has method points (`:118-121`, `:297`).
- **Opt-in on the lesson path, default-on for exam-style:** yes.
  - `...\QuestionRunner.tsx:123` `const workingAlwaysOpen = kind === "exam" || part?.requiresWorking === true;`
  - Exam note: `:302` "Working counts here: the scheme gives marks for method."
  - `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\components\topic\WorkingField.tsx:47` `useState(alwaysOpen)`. Otherwise it restores the device's remembered choice (`:17` `cairn:working-open`, `:52-54`).
  - The label still says "Show your working (optional)" even when forced open (`:73`, `:79`).
- **Ladder runs only on a miss, and the higher award stands (not the sum):** `...\QuestionRunner.tsx:169` `!marked.correct && working.trim() ? markWorking(...)`, `:171` `Math.min(part.marks, Math.max(marked.marksAwarded, evidence.marks + accuracyEarned))`.
- **Working is saved:** `:142` `workingRaw: working.trim() ? working : null`.
- **seenMarks:** `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\components\items\FeedbackCard.tsx:81`, miss branch only. `...\QuestionRunner.tsx:338` passes `SeenMarks`, which renders "`{code}` seen:" (`:409-419`).
- **Still all-or-nothing in `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\components\items\mark.ts`:**
  - numeric `:161` `marksAwarded: v.correct ? marks : 0`
  - coordinate pairs `:175`
  - algebraic `:184`. The only exception is `rightValueWrongForm ? marks - 1` on multi-mark parts (`:181`).
  - mcq `:196`, with no common-error matching in its branch (`:191-203`)
  - order/steps `:250`. The engine counts items in place (`...\items\order-marking.ts:48`) but mark.ts ignores it; `...\items\mark.test.ts:258-260` expects 0 marks with "2 of 4".
  - transformation `:303`
  - equation `:312`, with no common errors
- **Physics equation parts:** the extra lines are captured (`...\items\equation-marking.ts:198`) but only the equation line decides `correct` (`:220-221`). `...\items\mark.test.ts:337` expects 2/2 for `"v = f × λ\n= 2 × 3 = 6 m/s"`.
- **Marked in proportion:** text `mark.ts:204-230`; table `:261`, matrix `:271`, label `:281`, plots and region `:289`/`:295`, all via `shareMarks` (`:131-134`), which never gives full marks on a miss.
- **A matched common error can lift marks:** `:121` `Math.max(base.marksAwarded, hit.marksTypicallyEarned)`.
- **Follow-through not implemented:** `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\lib\marking\numeric.ts:95-96` "Reserved for follow-through marking. Currently ignored."

### 2. Feedback on a miss — **partial**
- **(a) Expected answer — present:** `...\FeedbackCard.tsx:85-92` `{!withholdExpected && (` … `Expected`.
- **(b) Diagnosis — present:** `:93-98` "What happened" `<Tex text={result.explanation} />`; near-miss row `:99-104`. A matched common error's authored text replaces the explanation (`...\items\mark.ts:122`).
- **(c) Examiner sentence with series — partial.**
  - The card can show it: `:106-114`, `:111` "CCEA examiners’ report, {shortExaminerSource(...)}".
  - Production never passes `examinerSource`. The only production caller fills the slot with a hint: `...\QuestionRunner.tsx:335` `examinerLine={misses >= 2 && p.hints[0] && ... ? p.hints[0] : undefined}`.
  - `misses` counts across the whole question; only `partMisses` resets between parts (`:237`).
  - `CommonError.source` exists (`C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\lib\content\schema.ts:722`) but `withCommonError` drops it (`mark.ts:113-125`), and `MarkResult` has no source field (`:27-45`).
- **(d) "Fix it now" — present:** `...\FeedbackCard.tsx:127-131`, default label at `:48`. The runner relabels it: `...\QuestionRunner.tsx:344` `"Try again" : "Try a twin"`. Exam-style gets no twin: `:274` `kind === "exam" ? undefined`.
- **"Wrong":** capitalised "Wrong" appears in no user-facing string in `src\components\items` or `src\lib\marking`. The only hits are:
  - a comment: `FeedbackCard.tsx:6`
  - identifiers: `whatWentWrong` (`...\items\FindTheMistake.tsx:31,73,242,260`), `rightValueWrongForm` (`mark.ts:181,184`), `diagnoseWrongValue` (`...\marking\numeric.ts:1621-1622,1750`), `MatrixWrongCell` (`...\marking\matrix.ts:38,52,277,295`), `expectWrong` in `algebra.test.ts`
  - Lowercase "wrong" is user-facing:
    - `numeric.ts:1799` "the sign is wrong"
    - `...\marking\algebra.ts:1558` "has the wrong sign"
    - `...\marking\plot.ts:365` "One value is wrong:"
    - `...\marking\region.ts:165` "on the wrong side of"
    - `...\items\equation-marking.ts:235` "A wrong equation scores nothing"
    - `FindTheMistake.tsx:136,166,185`
- **withholdExpected — present but leaky:** `...\QuestionRunner.tsx:341` `withholdExpected={!!reteach && partMisses < 2}` (practice only; `reteach` is null in exam, `:269`).
  - Only the "Expected" row is hidden. The explanation often states the answer on that same first miss:
    - `...\items\text-marking.ts:211` "Expected: ${missingIdeas...}"
    - `mark.test.ts:287` "Row 2, column 3 should be 4, not 40."
    - `mark.test.ts:318` "(i) is the cell wall, not the cytoplasm."
    - `numeric.ts:1675` states the value to the required decimal places
  - The near-miss row is not withheld either (`FeedbackCard.tsx:99-104`).

### 3. Re-teach on an unrecognised miss — **partial**
- **What it chooses:** `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\components\topic\reteach.ts:132-141` `reteachFor`.
  - Returns null when the answer is correct or a common error recognised it (`:133-134`, `isRecognised` at `:52-55`).
  - Step = first mark point not reached (`:64-71`) plus the matching worked-solution line (`:101-109`).
  - "Another way" = first hint, else a sentence of the solution (`:116-125`).
- **Panel text:** `...\QuestionRunner.tsx:460` "Where the next mark is", `:474` "Another way to see it". "Try again" at `:443-449`.
  - The accuracy step is held back on the first miss (`:65-66`, `:269` `partMisses < 2`).
  - Exam-style holds all of this to "What to pick up" after the last part (`:376-394`).
- **Second miss:** `:357` `{partMisses >= 2 && <CompanionLine moment="support" ... />}`. It renders unsigned (`C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\components\companion\CompanionLine.tsx:61-67`). One possible line is `...\src\lib\companion\lines.ts:366` "Two goes is enough. A hint, or the whole thing worked; you choose."
- **Third miss — no hint or worked example is offered:**
  - Retries are unlimited (`retry()` at `:187-191`) and the same panel repeats.
  - `EncouragementCard` ("A third guess teaches nothing…", `FeedbackCard.tsx:150-175`) is mounted only at `...\items\__gallery__\ItemsGallery.tsx:86-87`. `ItemsGallery` is never imported and no app route mounts it (its only hit is its definition, `:114`).
  - So the claim at `FeedbackCard.tsx:7-8` does not hold in production.
  - Grep patterns tried: `third|partMisses|misses >= 2|EncouragementCard`.
- **Callers without a twin get no retry after a recognised miss:** ReviewInbox, MixedPractice and SeededLesson pass no `onTwin`, so `cardTwin` is undefined when `reteach` is null (`...\QuestionRunner.tsx:273-274`).

### 4. Correct-work feedback — **partial** (a tick plus the engine's line, no method confirmation)
- **Correct card:** `...\FeedbackCard.tsx:60-71` shows Tick, the line and marks. `:44` turns bare "Correct." or "Correct – well done." into "That's it."
  - seenMarks, the examiner line and tags are miss-only (`:72-124`).
  - The working ladder is never run on a correct answer (`...\QuestionRunner.tsx:169`).
- **Engine lines are mostly confirmations:**
  - `numeric.ts:1618` "Correct." / "Correct, within the accepted accuracy."
  - `algebra.ts:1393` "Correct – that is equivalent to the expected answer."
  - `text-marking.ts:175` "That is the accepted answer.", `:206` "Every marking point is there."
  - `equation-marking.ts:221` "Equation line earned."
- **A few do state the process:** `plot.ts:344` "frequency density is frequency divided by class width"; `plot.ts:364` (box plot). MCQ shows the chosen option's authored feedback (`text-marking.ts:232`).
- "Yes." appears only on note gates (`...\items\StepRevealNote.tsx:155`), not in mark.ts.

### 5. Visual consequence on a miss — **absent**
- Grep `commonErrorId|matchedError|consequence|wrongFigure|overlay|herAnswer|yourAnswer` across `src` found nothing relevant (only a comment at `...\lib\companion\lines.ts:463` and `...\components\media\VideoEmbed.tsx:19`).
- `...\items\Figure.tsx:12-53` renders the authored figure only.
- Her grid disappears after Check: `...\QuestionRunner.tsx:289` `state === "live" && !result && ...`.
- The expected answer is text only: `...\items\spec-map.ts:137-141`, `plot.ts:382-385`, `region.ts:172-173`.
- **Matched-error id:** only the misconception id is carried. `mark.ts:37-38` `tags?: string[]`, `:123` `tags: [...new Set([...(base.tags ?? []), hit.misconception])]`. `CommonError` has no id of its own (`schema.ts:709-723`). The card renders tags as humanised chips (`FeedbackCard.tsx:115-123`).

### 6. Self-mark override and QWC — **partial**
- **Self-award:** `...\QuestionRunner.tsx:212-230`.
  - Offered only when `p.answer.kind === "text" && !result.correct` (`:347-351`): "My answer matches the solution: award {p.marks}/{p.marks}".
  - Full marks only, tagged `"self-awarded"` (`:222`).
- **Non-auto parts:** `SelfMarkPart` (`:636-698`), "Write this part on paper as you would in the exam…" (`:654`), 0..N mark buttons (`:679-689`).
- **QWC — she decides the band, with the engine's evidence:**
  - `mark.ts:231-244` returns a floor mark plus `decision: "qwc-band"`.
  - `...\QuestionRunner.tsx:561` "Now band it yourself"
  - `:568-580` each indicative point ticked or "Not yet", with "you wrote …" quotes
  - `:583` "Which band do the descriptors put it in?"
  - `:599` renders `{b.descriptor}`
  - `:551-557` choosing a band starts the mark at that band's floor; `:628-630` "Award {mark} mark(s)"
  - `:207` "Band ${band}: … awarded by you on the descriptors."
  - Evidence engine: `...\lib\marking\qwc.ts:85-106`.
- **Rubric training before self-grading — not found.** Grep `rubric|training|calibrat` and `modelAnswerBandA|upgradeMeBandB|selfMarkRubric` hit schema and tests only:
  - drawing `rubric` (`schema.ts:586`)
  - QwcItem `modelAnswerBandA`/`upgradeMeBandB`/`selfMarkRubric` (`schema.ts:1201-1203`), with no consumer in `src\components`

### 7. Worked examples — **partial**
- **Fade order:** `...\items\fade.ts:8` `"full" | "faded1" | "faded2" | "twin" | "problem"`; `planFade` at `:31-48`; production order at `...\topic\TopicContent.tsx:295`.
- **Inputs:** only the steps she supplies in faded1/faded2 take input. `full` is "Reveal step {n}" (`...\items\WorkedExampleAsQuestion.tsx:385-391`).
  - `InputStep` marks against `step.input` when authored (`:189-222`; `schema.ts:886` `input: AnswerSpec.optional()`).
  - Otherwise `LineStep` compares her line with `stepLineMatches` (`:137-146`). On a mismatch she self-claims "That is what I had" / "Not yet" (`:167-186`).
- **Why-menus:** `:44-92`, required before the next step in `full` (`:299-301`, "Choose the reason above to continue." `:396-400`).
  - Defect: on a wrong pick `:351` stores `options.findIndex((_, i) => i !== correct)`. The callback only passes a boolean (`:62`), so with three or more options "Your choice" can highlight an option she did not tap.
- **Decision narration shown:** `:110-113` "Because" + `step.decision`; earned mark chips at `:102-108`.
- **Advance on correct / drop a rung on a miss — not found.**
  - `...\TopicContent.tsx:314` `onClick={() => setFade(order[order.indexOf(fade) + 1])}` is a manual button; `onComplete` ignores accuracy (`:306-308`).
  - `nextFade` (`fade.ts:56-63`) is exported (`...\items\index.ts:51`) and tested (`fade.test.ts:36-40`) but never called.
  - Grep patterns tried: `nextFade|\brung|advance|drop a|setFade`.

### 8. Step-reveal notes — **partial**
- **Gates:** `...\items\gates.ts:15-24` (blank/choice/number), `markGate` at `:68-85`. `...\StepRevealNote.tsx:76` "Answer to continue"; `:155` `"Yes. " : "Not quite. "`.
- **Continue behaviour:** there is no Continue button. Answering, right or wrong, opens the next stretch at once (`:171-177`). A gate cannot be retried (`:172` `if (answers[gate.id]) return;`).
- **Next paragraph only after the gate:** yes, `gates.ts:50` `if (pendingGate) continue;`.
- **Video followed by a gate — not enforced.**
  - Videos render at `:230-235` with no gate added. `...\media\VideoEmbed.tsx:20` says "the caller places a prompt after the clip".
  - `...\topic\SeeIt.tsx:15-17` shows videos with no check.
  - Grep `video.*gate|gate.*video` in `src` and `scripts` found nothing.
- **Pause:** present. `gates.ts:12`; inserted by `...\topic\lesson-plan.ts:295-345` when there are at least 4 sections (`:296`); renders at `StepRevealNote.tsx:189-194`.
- **Recap block — not found.** It is not in the NoteBlock union (`gates.ts:8-30`); "recap" exists only as a companion moment (`lines.ts:28`, `:450-462`).
- **Hero:** skipped (`StepRevealNote.tsx:195-197`; `lesson-plan.ts:278`).
- **Callouts:** `gates.ts:25` `"spec" | "mustknow" | "notonspec" | "examiner" | "why"`. Labels at `StepRevealNote.tsx:37-43`. notonspec gets a lighter border (`:48`); a `ccea-cer:` source is formatted as a citation (`:54`).

### 9. Find-the-mistake — **present**
- **Stages:** `...\items\FindTheMistake.tsx:39` `"find" | "reason" | "fix" | "reveal"`.
  - Locate: `:88-98`; the line is given away after two wrong taps.
- **Naming is self-assessed in production.** No production caller passes `reasonOptions` (`...\TopicContent.tsx:203-210`, `...\PracticeFlow.tsx:281-288`, `...\review\ReviewInbox.tsx:132-146`). She types a reason and marks it herself, "I named it" / "Not quite" (`:221-256`). It is not recorded: `TopicContent.tsx:207` `correct: r.foundLine && r.fixed`.
- **Fix marking:** two tries (`:106-117`) via `...\items\mistake-marking.ts:60-80` `fixMatches`.
  - Whole-line equation match, with or without the label: `:64-68`.
  - Otherwise a last-number value match within 1% or 0.05 (0.005 below 1), only if the line states a value: `:69-78`.
- **Series cited:** yes. `:119` `formatExaminerSource(item.source)`, shown on reveal at `:320`. Format is "CCEA examiners' report · Summer 2025 · M4 Q22" (`...\items\format.ts:20-25`).

### 10. Method locks and presentation rules — **absent from marking (authored only)**
- `...\lib\content\schema.ts:816-818` `methodLock: { instruction, requiredMethod, evidence }`. It has no reference anywhere else in `src`.
- `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\scripts\validate-packs.mjs:110` only checks that each lock has a `source`.
- `"hence"` / `"show that"`: no hits in `src\lib\marking` or `src\components\items`.
- `presentation` exists only as a ledger tag (`...\lib\ledger\tags.ts:8`).
- MarkPoint `ft`/`dependsOn`/`seenIf` (`schema.ts:690-692`) are validated but never used in marking.
- Grep patterns tried: `methodLock|requiredMethod`, `presentation|\bhence\b|show that`, `followThrough|\.ft\b|dependsOn|seenIf`.

### 11. Answer-field inventory — **partial**
- **Rendered by `...\items\AnswerField.tsx`:**
  - mcq `:365-381`
  - order `:384-388`, steps `:391-403`
  - table `:406`, matrix `:413`, text-long `:420`, label `:427`
  - transformation `:434-447`
  - points-line/curve/histogram `:450-463`, box `:466`, region `:482`
  - equation `:502-539`
  - numeric/algebraic `:540-561`
  - text `:562-577`
  - fallback textarea `:578-597`
  - There is no vector field; vectors are typed as algebra (`algebra.ts:1580-1598`).
- **Still on paper:** `...\items\spec-map.ts:158-173` `isAutoMarkable` excludes drawing, annotation and best-fit graphs (`:15` `PLOT_AUTO` has no `"best-fit"`). These go to `SelfMarkPart` (`...\QuestionRunner.tsx:315-327`).
- **Photo fallback — not found.** Grep `photo|camera|blob|capture=|type="file"|FileReader|getUserMedia` only hit display photos, the settings JSON import (`...\settings\SettingsPanel.tsx:259`) and a data-export Blob (`...\lib\db\export.ts:30-31`).

### 12. Non-drag alternatives and tap targets — **partial**
- **Order list:** the only real drag. `AnswerField.tsx:275-283` (Reorder) has arrow buttons (`:290-301`) and the hint "drag an item, or use its arrows" (`:273`).
- **Grid fields are tap-to-place:**
  - PlotField: typed points `:360-376`, typed line points `:416-440`, typed histogram heights `:336-357`.
  - TransformationField: typed vertices `:234-250`.
  - BoxPlotField: five typed values `:172-188`.
- **RegionField has no alternative.** It is tap-only (`...\items\RegionField.tsx:103-116`, `:171`), the SVG is `role="img"` with no key handler (`:168`), and there is no typed input. Grep `typed|fallback|Arrow|keyboard|onKeyDown|Type the|coordinates` found none in that file.
- **Tap sizes:**
  - `...\items\ui.tsx`: `btnCheck` "tap tap-lg" (`:18`), `btnOption` "tap tap-lg" (`:29`); `btnPrimary`, `btnSecondary`, `btnQuiet`, `fieldCls` use "tap" (`:13`, `:20`, `:22`, `:31`).
  - `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\app\globals.css:558` `.tap { min-height: 44px; min-width: 44px; }`, `:559` `.tap-lg { … 52px }`.
  - Order rows `min-h-[44px]` (`AnswerField.tsx:282`).
  - Grid points snap to a 24-unit cell scaled to the container (`...\items\TransformationField.tsx:21`, `:95-96`). My inference: a grid point's target is not guaranteed to reach 44 px.

### 13. Confidence — **present**
- **3-point scale:** `...\items\DiagnosticWithConfidence.tsx:20` `export type Confidence = 1 | 2 | 3;` with labels Guessing / Fairly sure / Certain (`:43-47`). Both an option and a confidence are required (`:81`, `:192`).
- **Chosen distractor's own feedback shown:** `:205-207` `<Tex text={chosenOption.feedback} />`, then the correct option and its feedback (`:208-212`).
- **Skill id leak removed:** the eyebrow is only "Check · n of N" (`:118`). Grep `skill` in `src\components` hit only a test fixture (`...\topic\practice-sets.test.ts:14`).

### 14. Twin after a miss — **partial**
- **What `onTwin` opens:** `...\topic\PracticeFlow.tsx:56` `const twinWe = bundle.workedExamples[0];`, `:136` `onTwin = twinWe ? () => setTwin(...)`. `TwinFix` (`:292-309`) renders `WorkedExampleAsQuestion fade="twin"`.
  - This is always the topic's **first** worked example's twin, not a variant of the question she missed.
- **Where it's wired:** passed at `:191`/`:247` into `QuestionRunner`; used at `...\QuestionRunner.tsx:274` and `:386-392`.
- **Where it's missing:** not passed by ReviewInbox, MixedPractice or SeededLesson. Within PracticeFlow's mixed sets, only question items get it; Diagnostic and FindTheMistake items do not (`PracticeFlow.tsx:248-289`).

### 15. Keyword marking and accuracy/units — **present**
- The file is `C:\Users\feras\Downloads\CCEA GCSE Top Learning Platform\src\components\items\text-marking.ts`; there is no `src\lib\marking\text-marking.ts`.
- **Signatures:**
  - `:22` `normaliseText(s: string): string`
  - `:86` `phraseIn(haystack: string, needle: string): boolean`
  - `:115` `keywordsPresent(raw: string, keyWords: readonly string[]): KeywordCheck`
  - `:135` `countListedItems(raw: string): number`
  - `:159` `markText(raw: string, spec: TextSpec): TextMarkResult`
- **Rules:**
  - Accepted answers must match the whole normalised answer: `:168`.
  - Groups are `{ any, marks, reject? }` (`schema.ts:565-571`); one key word earns one group (`:182-194`).
  - A reject word cancels its group (`:187-190`, feedback `:210`).
  - Inflections come from a closed list (`:70-78`); stems need 4+ letters (`:53`).
  - Listing rule: `:196-200`.
- **Proportional tariff:** `mark.ts:211-217` (floor share). Common errors never raise text marks (`:225-229`).
- **Accuracy:** `mark.ts:64` `export function instructsAccuracy(prompt: string | undefined): boolean`, used at `:158`. `spec-map.ts:67-70` enforces d.p./s.f. only when the stem instructs it.
- **Units:** `spec-map.ts:62` `out.requireUnit = spec.unitRequired;`. `numeric.ts:1605-1608` "the answer needs a unit"; without `unitRequired` the answer is correct with a reminder (`:1609-1613`).

### 16. Checked panel — **partial**
- **What it renders:**
  - `...\items\CheckedPanel.tsx:57-73` summary line with status pill (`summariseChecks` at `:36-45`)
  - `:79-97` check rows: result, type, tool, detail, who and when
  - `:99-123` reports with their resolution or "Open."
  - `:137` "Something wrong?"; `:139` "The item is re-checked and you see the outcome here."; `:157` "Thanks — noted."
- **In production it's only on exam-style questions, and the report does nothing:** `...\QuestionRunner.tsx:398` `<CheckedPanel log={verification} onReport={() => {}} />`. Verification is passed only for exam-style (`PracticeFlow.tsx:189`). Grep `report` in `src\lib\db` and `src\lib\session` found nothing, so reports are not stored.
- The "on every item" claim (`CheckedPanel.tsx:4`) doesn't hold: practice questions, worked examples, find-the-mistake, notes and diagnostics have no panel.