# Flashcards v2 and Practice v2: the design case

11 October 2026, 15:40 (from `date`). Written by the `designer` agent (Fable) for the lead, the two Opus builders (`builder-flashcards`, `builder-practice`) and the e2e owner, under `scratchpad/briefs/2026-10-11/FLASHCARDS-PRACTICE.md` and `COMMON.md`. The owner's words that opened it (11 Oct, 15:10): "flashcards must be way better in all terms; the same goes for practice; I haven't seen any work regarding upgrading these things." Both cases were approved on 23 Sep (benchmarks §10 and §15, decisions 4 and 10; "practice is good; flashcards are ok"; Gizmo named for flashcards) and never built. This document decides what is built, with the losers' reasons, and gives each builder the list a Playwright check will hold them to. The boards are PNGs under `scratchpad/probes/designer/png/` (§7 lists them); the HTML they are drawn from is `scratchpad/probes/designer/boards/`.

The standing tests: hers (why do I need this, how is it different, how can it help me, why is it worth my time); the owner's five (clarity, focus, momentum, calm, trust); STANDARDS.md. Nothing here is "to exist": each card format and each practice mode is kept only where its promise is true in the content counted in §1.

---

## 0. The decision, in ten lines

1. **Flashcards v2 is retrieval in six formats, marked by the real engine, in the Slides frame.** A card is a question she answers (a choice with notes on every wrong option, a key word typed, a cloze from the recap, a working line to complete, a figure to label) and only where no question can be made from the source is it a statement she turns over. The flip-only card was the whole of v1; Gizmo's own finding is that a self-marked flip earns nothing, and the owner's "ok" was for exactly that.
2. **Grading is Anki's four, never a dishonest one.** Each button says when the card returns ("tomorrow", "Thursday", "in 3 weeks", the product's own `returnWord`); after a marked miss the only grade is Again; after a marked right answer Hard, Good and Easy; on a statement card all four. The stored date is the printed date.
3. **A sitting is a dozen, due first, resumable, with an honest close** ("12 placed · 5 min · back tomorrow 4, Thursday 5, in 2 weeks 3 · scheduled to your FM1 paper, 18 May"). An Again card comes back after three other cards, and the count never grows.
4. **One item, one card id, one schedule** across Slides' recall cards, Read, the review inbox and Flashcards: a gate dealt as a flashcard is the inbox's gate card, not a second copy.
5. **Cards come from the packs through one generator the content build runs** (prompts, gates with their option notes and twins, See it steps, recap lines, label figures, the authored decks); nothing is hand-made in code; a numbered procedure is a reference card, never dealt by default.
6. **Practice v2 is five honest doors on one page and one runner in the Slides frame:** This topic, Mixed from her plan, Weak spots, Exam-style at the paper's pace, Unit check. A reviews-waiting line links to the inbox. Past papers by series and Non-calc Five are not modes (§3.8 says why).
7. **Start inside a second.** A per-subject question index written at export time; one bundle fetched per drawn question; "Next question" only after an answer.
8. **Weak spots teaches before it re-asks:** the See it step she did not reach, as the Slides See it card, then a different item carrying the same tag. Exam-style runs at the paper's own pace (minutes ÷ marks from the specification data: FM1 and M4 1.2, M8 1.5), method marks on, feedback at the end with the scheme lines missed and no grade.
9. **Every card and every question keeps "Something wrong?"** and the record is exportable as a file from the Practise page's foot (the lead moves findings to `docs/plan/review/`).
10. **Year 12 decks and units first;** nothing reads a hard-coded unit list: the index pages read her plan and the catalogue, so English lands by data.

---

## 1. What she sees today, measured (build 15, http://localhost:3200, 11 Oct 15:30, 375 × 812 and the pane's desktop width)

**Flashcards, `/flashcards/further-maths/FM1/`.** A page: "Pure Mathematics deck · 442 cards across 29 topics", then a card ("This deck · 442 cards · 29 topics · 3 due now in the deck · Study 15 cards · Only the 3 due" and a four-line explanation), then twenty-nine topic rows with checkboxes. "Study 15 cards" starts a sitting from all 442: the first card dealt was a *Method* card, "What are the steps for adding or subtracting two algebraic fractions?", a numbered procedure (the kind the 24 Sep ruling moved out of recall and into the recap). The run is a card under the page header and above the tab bar, "Tap to flip" in its corner, three greyed buttons under it at 30 % opacity, "Stop here" under those. On the desktop the same list stands left with the deck card right. In her terms: *I am given a list of thirty things to tick before I can start; when I start, it asks me to recite a list; turning the card over and saying "Good" tests nothing; nothing tells me when I will see it again; nothing here is about my paper.* Counts: 2,884 cards in 14 decks (Year 12: FM1 442, FM2 263, FM3 248, M4 165, M8 107, B2 167, C2 193, P2 302, U7 32), of which authored 1,241, the rest bundle prompts and generated science recall.

**Practice, `/practise/`.** "Mixed practice", a Flashcards link card, then a form: Subject (Maths selected by default, though her plan is FM1–3, M4, M8 and the sciences), Units (M3 M4 M7 M8), Calculator, Questions (4 6 8 12), "Start · 6 questions"; beside it an essay, "Why mixed", and "926 original questions across 58 topics". Start waits for every bundle of the subject (the audit's 14.6 MB, 10.5 s; the engine now loads on demand, the bundles still all load). A question is then a card on the same page with the app nav around it; "Next question" is clickable before anything is answered. In her terms: *it asks me to configure a quiz; it does not know which units are mine; it is one mode; it does not know what I got wrong last week; it does not feel like the paper.* Counts behind it: 2,226 practice and 602 exam-style questions (4,964 parts, 10,300 marks), 432 find-the-mistake items, 343 authored sets, 1,859 gates (782 with option notes, 1,263 with twins), 1,191 See its, 1,536 prompts; `data/papers/questions-index.json` holds 0 classified rows.

What the owner approved on 23 Sep still holds as the floor: the pass-1 practice object (one question, the three outcomes, the 2 px outcome edge, "0 of 1 mark" with the struck code, the examiner's sentence with its series, "It comes back on Thursday") is kept exactly; the appearance of the marked answer is the engine's and the surfaces agent's, not this case's.

---

## 2. Flashcards v2

### 2.1 The vision

Every card is a question about a mark on her real paper, asked in the shape the paper asks it, marked by the same engine that marks her practice, and scheduled by FSRS to the day of that paper. A dozen a sitting; each grade says when the card returns; a miss teaches before it moves on. Kinnu's calm, Anki's honesty, Gizmo's formats, none of their levers.

### 2.2 Three directions

**A. The sitting** (Anki-true, Slides-framed). What v1 would be if it were well made: one card per screen in the frame with the deck's wash, the question alone, the answer on Show or Space, four grades with their returns, placed pills, a dozen, an honest close. Formats: statement recall only.

**B. Every card a question** (Gizmo-shaped, engine-marked). Six formats generated from the packs: a choice with a note on every wrong option (from gates and their twins), a key word typed (from prompts with the scheme's key words), a cloze from the recap lines, a working line to complete (from See it steps), a figure to label (from label parts), and statement recall where nothing else can be made. The engine marks; a miss shows the option's note and the See it step it came from; the grade follows the mark. Everything in A for the frame, the grades and the close.

**C. The memory shield** (Kinnu-shaped). The deck opens on her memory of the unit: a strength per topic from predicted recall, "what is fading tonight" chosen by the schedule rather than by her, a "why now" line on each card ("back because it was due Tuesday"), the shield redrawn at the close. Cards as in A.

| | A · the sitting | B · every card a question | C · the memory shield |
|---|---|---|---|
| Clarity (one thing per screen) | yes | yes; a choice card is one question and three to four answers | the shield is a second thing on the first screen |
| Focus (nothing but the card) | yes | yes | a meter per topic competes with the card |
| Momentum | the pill placed | the pill placed, and the mark itself | the shield filling, which is a forecast |
| Calm | yes | yes, if the option notes stay under 40 words (they are authored so) | a strength that falls while she is away is loss, which rule 1 forbids showing |
| Trust | the return she is promised is the one stored | plus the engine's mark instead of her own | predicted recall shown as a per-topic fact is a model's guess dressed as a measurement |
| Does it teach | no: a flip tests nothing and explains nothing | yes: the note on her option, the key words named, the step it came from | no more than A |
| Is it rich | the frame, the wash, the pills; the cards are text | the drawings on label and line cards, the options, the ticked key words, the state label | the shield |
| Gizmo's five formats | none | five of six are Gizmo's in our grammar (choice, cloze, typed; matching and speaking refused; label and line are ours) | none |
| Anki's four-button honesty | yes | yes, never a dishonest one | yes |
| Kinnu's Memory Shield | — | the "why now" line kept as words | the whole of it, meters included |
| Seneca's low friction | yes | the same taps: answer, see, grade | one more screen before the first card |

### 2.3 Decision: B, with A's grading and close, and one line from C

**B wins** because it is the only one that answers the owner's "way better in all terms" and the test "does it teach": the card asks what the paper asks, in the paper's shape, and a miss is met with the reason her option tempts and the step that fixes it, which is the lesson grammar (teach-first case §6.3) applied to the one surface that still ignored it. It is also the only direction that makes the 2,884 cards *more* than text: label cards carry the figure on its stage, line cards carry working with their mark chips, choice cards carry the examiner's named errors as options.

**A loses** because it is v1 in a better frame. The owner graded v1 "ok" on 23 Sep and "must be way better" today; nothing in A changes what a card *is*. Its honesty and its close are right, so B takes them whole.

**C loses** on three of the five questions. A strength per topic is predicted recall, a forecast; drawn as a filled ring on a study surface it reads as a measurement, and when it falls during a week away it is the loss anxiety the emotional rules exist to prevent. It also duplicates stream 9 (the Map's path darkness keyed to retention, the Ledger's calibration), where a forecast belongs beside its explanation. The one thing C has that B wants is the sentence *why this card now*; B prints it as the card's state label ("Back from Tuesday", "New", "3rd time, last Good"), which is Gizmo's state label and Kinnu's explanation in one line of words.

### 2.4 The chosen design, screen by screen

**`/flashcards/`, the index.** "Your decks": the units of her plan in plan order (FM1, FM2, FM3, M4, M8, B2, C2, P2, U7 on the default plan), each a 52 px row: the unit's short name and title, then "3 due · 442 cards" in tabular figures; a unit with no deck reads "coming". Then "Other decks" for published units outside her plan. No subject columns hard-coded, no tint bar, the heading in ink (02-surfaces §6 stands). Rows read `planUnits()` and `DECKS_MANIFEST`.

**The deck's first screen** is the frame's title card (art direction v2 §8.1, Title row), with the deck's subject wash: eyebrow "Flashcards · Further Maths"; title "FM1 · Pure Mathematics"; the lede, two sentences from the deck's own counts ("442 cards from 29 topics: the brackets to spot, the first line to write, the key words the scheme rewards, the traps examiners name."); the promise line, "Tonight: 12 cards · 3 due · about 5 minutes"; the mechanic in one sentence ("Each button says when the card comes back. Nothing waits past the day before your paper."); the paper line from her plan ("Scheduled to your FM1 paper, Tuesday 18 May 2027."); Start, "Tonight's dozen" (the one accent control); "Choose topics" as the outline. Choose topics is a second card whose body scrolls (the only scrolling card): the topic rows with counts and due, checkboxes, "Study these". The deck's drawing on its stage stands beside the text on the desktop (the title card's two-column rule).

**The card.** The frame's three bands. Header, on the deck's wash: Exit, the deck's name, "7 of 12" (placed, in tabular figures), the segmented track as placed pills (done in the accent, current outlined, the rest the tint); then the eyebrow, format and state: "Choice · Back from Tuesday", "Key word · New", "Working line · 3rd time, last Good". No title: the question is the content. Body: the stem at 20 px Literata 600 (22 on the desktop) with display maths on its own line (the §8.4 rhythm: 16 px to the maths, 20 px to the first answer), then the answer object by format:

| Format | Source | The answer object | Marked by |
|---|---|---|---|
| Choice | a gate with option notes (782), alternating with its twin on alternate returns, as the inbox does | three or four 52 px options, 10 px apart, letters A–D, keys 1–4 | the gate's answer; her miss shows that option's `why` |
| Key word | a prompt with `keyWords` (the scheme's) | one 52 px field, "Type the word the scheme rewards" | `keywordsPresent` / the text engine's key-word groups; a spelling slip that names the same thing is accepted (ruling G2-57). Every group present: right (Hard / Good / Easy). None: Again only. Some: the ticks are shown word by word and the four grades are hers, informed, as the Slides recall card already does |
| Cloze | a recap line with a term that is in the topic's key words | the line with one blank, a field | the text engine, the term's accepted forms |
| Working line | a See it of kind calculation with three or more steps, or a worked example | the steps before the asked one shown as the ladder, the asked step a field ("Write step 3"), its mark chip shown after | `stepLineMatches` |
| Label | a part whose answer is `label` | the figure on its stage with its targets, the bank as chips, tap a chip then a target (a typed fallback) | `checkLabel` / LabelField |
| Recall | an authored card, a generated science card, a prompt without key words | the question; "Show the answer"; the answer under a rule, key words named | herself, four grades |

Foot: before the answer, Check (accent; Space or Enter), or "Show the answer" on a recall card. After Check the verdict object stands under the answer object as Slides draws it ("Yes." in fern or "Not quite." in ink at 21 px; her option edged in ink with the circle-dash, the right one lit in fern with the tick; the options that are neither hers nor right are put away, so a marked card never scrolls on a phone, which the boards measured was not true with all three kept (122 px over on the trial topic's g2 with its 36-word note); then the option's note or the key words ticked; then "From See it, step 2 of 'Why cancelling works'" as a one-line recess that opens the step's working and reason in place), and the foot becomes the grade row, 52 px, unaccented, each button with its return under its label in 13 px: after a miss the single button "Again · in a minute" (accent, because it is the one thing to press); after a right answer Hard · Good · Easy; on a recall card Again · Hard · Good · Easy. Tapping a grade records and deals the next card; there is no separate Continue. Keyboard: Space shows or checks, 1–4 choose before Check and grade after, Enter checks, ← re-reads the previous card (read-only), Esc stops here. Swipe left deals the next card only once graded; swipe right re-reads; a swipe is never a grade (a grade must show its consequence before it is given, and a swipe cannot). The gesture rule is `src/lib/slides/gesture.ts` (touch and pen only, never a mouse drag, never over a selection).

**Measured at 390 × 844 (the boards):** header 104 px (wash, track, eyebrow), a two-line stem with its maths line 108 px, three options 176 px, the verdict 120–150 px, the grade row and its safe area 100 px: 650 px before Check, 790 after, with no scroll; a four-option card may scroll the body after Check and never the foot. At 1280 × 800 the frame's two columns: the question and the answer object left (640 px), the verdict and the See it recess right (400 px), the bottom bar with the keyboard hints left and the grade row right (420 px).

**The close** (`CloseCard`, the companion on, no answer field on screen): eyebrow "Sitting done"; headline "12 placed · 5 min"; "9 first time, 3 after a second look."; "Back tomorrow 4 · Thursday 5 · in 2 weeks 3", counted from the dues the taps stored; "Scheduled to your FM1 paper, 18 May."; exits "Done for tonight" (accent) and "Another dozen" (outline; "Twelve more are due" when they are, "Twelve new cards" when not). Rowan on the hill by the cairn, one line, as every close.

### 2.5 The data layer (what `builder-flashcards` builds first)

- **The card model** (`src/lib/flashcards/model.ts`): id, format (`recall | choice | keyword | cloze | line | label`), subject, unit, topicSlug, topicTitle, tier, `source` (kind and id: prompt, gate, see, we, recap, label-part, authored, generated), front (markdown with maths), back for recall, options and optionNotes for choice, the marking spec for the typed formats (the key words, the accepted forms, the step's latex, the label targets and bank), `teach` (where a miss re-teaches from: a See it key and step, a worked example and step, or the option note alone), keyWords, examUnit, specRefs.
- **One generator**, `pipeline/build-decks.mts` v2, run by the content build after the bundles: one source module per format; every card carries its source; a card made from a gate uses the inbox's id for that gate (`<topicId>#gate:<gateId>`) and a card made from a prompt the prompt's id, so one schedule holds across surfaces; the line format never asks a See it's first step (the typed-step rule, `src/lib/slides/see.ts`); a cloze is made only where the recap line holds a term from the topic's key words; a numbered procedure (three or more numbered lines in the back) is marked `reference: true` and never dealt by default (she can study a topic's reference cards from Choose topics); a prompt whose answer is over 25 words is not a card; the manifest prints counts per format per unit. Year 12 decks are regenerated first and the counts reported.
- **The sitting** (`src/lib/flashcards/sitting.ts`): twelve; due cards first (from `db.cards` by due ≤ now among the deck's ids), then new cards from the topics she has opened (a flow row or an attempt), in teaching order, then the rest in teaching order; no two cards from one topic in a row when avoidable; an Again card is re-dealt after three other cards and at least once before the close; "n of 12 placed" counts placed cards and never grows (the deck's `dealt.ts` rule); a sitting she leaves is stored (deck, card ids, placed ids, index, started at) and reopens where she left it.
- **Grades and returns**: `ReviewGrade` has all four already (`src/lib/srs/scheduler.ts`); the returns are computed once at the moment the answer is shown or checked, with the unit's exam mode, from the card's real state (`src/lib/slides/returns.ts`'s rule, extended with Hard), printed with `returnWord`, and the tap records with that same moment, so the day stored is the day printed. `inboxReturns` gains Hard so the review inbox prints four where it shows a flashcard.
- **The review inbox** shows the same card component for a flashcard (`src/components/review/Flashcard*` is the builder's), so a key-word card due in the inbox is typed there too.

### 2.6 The top five, honestly (benchmarks §15 is the research of record; nothing here is new reading)

| | Better | Equal | Behind |
|---|---|---|---|
| **Gizmo** | our cards are the scheme's marks, verified, with the examiner's errors as options; a miss costs a return, never a heart; the schedule is printed, theirs is a black box | the formats (choice, cloze, typed) and the state label on the card | matching pairs and speaking (refused on purpose: a matched pair is not a paper question; speech is a microphone we do not want on a study surface); their reward at the moment of the answer is a sound and XP, ours is a pill and a date |
| **Anki** | nothing to set up; cards exist; the paper date caps the schedule; a miss teaches | the four grades with their returns, keyboard 1–4, Space | Anki's add-your-own cards and its decades of plug-ins; not a goal |
| **Quizlet** | long-term scheduling is the default, free, to her real paper; typed answers are marked by a maths engine, not string equality | the within-session return of a missed card (Learn's rounds); the test-date sentence | Quizlet's volume of sets; irrelevant to CCEA, whose sets there are poor (research 04 §2.20) |
| **Kinnu** | our cards are not trivia (the generator's sources are the scheme's key words, the See it steps and the examiner's traps); the "why now" is words, not a meter | the calm, one card per screen, breathing room | the Knowledge Bank as a browsable record; stream 9's Ledger is where ours goes |
| **RemNote** | equal on the exam scheduler; ahead on typed marking | cards inline in notes (our prompts) | nothing we want |

### 2.7 The CCEA fit, per format

Key word: the science and Further Maths marks lost on wording ("denatured", "resultant", "common factor first") are the key-word groups the engine already pays; the card asks for exactly that word. Working line: the MW and M marks, which CCEA pays for the line, not the answer; the card asks for the line. Choice: the wrong options are the registry's named errors with their series (782 gates carry notes with misconception ids), so a miss names the error an examiner named. Cloze: the definitions and identities the specification says must be known (no formula sheet for physics equations; the difference of two squares in FM1). Label: the diagrams the paper asks her to label (B2's cells and organs, P2's circuits). Recall: the trap cards with their series. Every card's return is capped before its paper by exam mode.

### 2.8 Cut from decision 10 and v1, and why

Three grading buttons (benchmarks §15 chose three because "Hard is a decision a teenager should not have to make"): superseded by the four with the return printed, because with "in 2 days" beside Hard and "Thursday" beside Good the choice is a reading, not a decision, and Anki's manual counts Hard as a pass. The topic checklist as the first screen: cut to a second screen; the first screen is the deck's title card and Start. "Study 15 cards": a dozen, and the words are "Tonight's dozen". The flip as the default card: cut to the last resort. The "Method" cards as dealt cards: reference cards, never dealt by default. The kind label as the card's first word: replaced by format and state. "Stop here" under the card: Exit in the header and Esc, with the sitting kept. Nothing else of decision 10 is cut: one card per screen, breathing room, the large reveal, unaccented 52 px grades at thumb height, the session of twelve, the one-line mechanic, the paper it is scheduled to, progress as cards placed, no streak or stamp.

### 2.9 The five questions, from the pixels

Index: clarity, her units first with what is due; focus, rows only; momentum, the due count; calm, ink and one accent; trust, counts from the manifest and her plan. Title card: clarity, what tonight is in one line; focus, one Start; momentum, "12 cards · about 5 minutes"; calm, the wash and the paper; trust, the paper date is hers. The card: clarity, one question and its answers; focus, nothing else on the screen; momentum, the pill placed and the mark; calm, no red, no sound, one wash; trust, the return printed is stored, the note is the examiner's, the step is the note's. The close: clarity, three numbers; focus, two exits; momentum, what returns when; calm, Rowan on the hill, no celebration; trust, every number counted from the taps.

---

## 3. Practice v2

### 3.1 The vision

Practice is where she learns to recognise a question before she solves it, to work at the paper's pace, and to fix the exact step she missed. Five honest ways in, one runner that is a full screen per question on both sizes, the real engine paying method marks, a re-teach before any re-ask, and a close that says in marks and reasons what tonight was worth. Sparx's mixing without its robot, Khan's mastery challenge without its badges, Seneca's wrong-answers mode with the reason attached, OnMaths's clock with no grade.

### 3.2 Three directions

**A. Five doors** (decision 4 as designed on 23 Sep, made honest). The Practise page is five rows, each a mode with a one-line purpose and a live count from her record, and an empty state that says what fills it; a run is a title card, then one question per screen in the Slides frame, then the close. The modes are the product.

**B. Tonight's set** (Sparx-shaped). One recommended set at the top, built by rule from her record and plan (weak spots first, then 60 % current topics and 40 % revisiting, exam pace inside six weeks of a paper), stated in words with Start; the five modes below as "Or choose".

**C. The question is the page** (Brilliant-shaped, mode-less). No Practise page: practice is entered from the topic ("Now the questions"), the unit page and Today; the modes are facets of one runner (timed or not, labelled or not, re-teach on or off) set by where she came from.

| | A · five doors | B · tonight's set | C · the question is the page |
|---|---|---|---|
| Clarity | five named promises, each with its count | one promise, but its rule must be believed | no door to read; the mode is implicit |
| Focus | one decision at the door, then one question per screen | none at the door | the same runner |
| Momentum | the track per run; the counts falling on the doors | the set shrinking | the track |
| Calm | rows, no form | a sentence and Start | no page at all |
| Trust | each count is from her attempts, each mode's promise is testable | the rule is ours and we have no timing data to defend it yet (0.14 is unbuilt) | deliberate exam-pace practice is a skill she must choose on purpose before a paper; a facet hides it |
| Does it teach | Weak spots re-teaches; This topic is the ladder | the same, inside the chosen set | the same |
| Is it rich | the modes differ in what they ask | one set | one runner |
| Sparx | the mixing, without the assignment | the assignment too | — |
| Khan's mastery challenge | Unit check is it | folded in | lost |
| Seneca's wrong answers | Weak spots is it, with the reason | folded in | lost as a named thing |
| Dr Frost, OnMaths, Corbettmaths | the ladder; the clock with no grade; five a day as a size | — | — |

### 3.3 Decision: A, with C's runner, and B deferred to Today

**A wins.** The owner's question on 22 Sep was "are all of these truly the best, or just labelling?", and the answer is a door whose promise can be read and tested: "Weak spots · 7 to fix from 4 topics" is true or it is not. Five named ways are also how she learns to practise on purpose: the week before FM1 she should be choosing Exam-style, and a door makes that a choice she can see herself make.

**B loses for now,** not for ever. A recommended set needs a rule we can defend from her own data, and the timing record that would justify it (programme 0.14) does not exist yet; Sparx's lesson is that an assigned set with an opaque rule is the thing students resent. Today's next-step chooser (`src/lib/plan/next-step.ts`) already recommends one thing a night; when it points at a practice mode it will deep-link to that door with the mix pre-set, and that is where "tonight's set" belongs. Nothing on the Practise page suggests.

**C loses** because it removes the choice that matters most before a paper and hides Unit check, the only road to Proficient. Its runner is right, and A uses it for every mode: one question per screen in the frame, on both sizes.

### 3.4 The chosen design, screen by screen

**`/practise/`, the doors.** Eyebrow "Practise"; title "Practise"; lede, one sentence ("Five ways to practise, each marked the way CCEA marks."). If reviews are due, one quiet line under it: "12 reviews waiting · Go to reviews →". Then five rows, each two lines (the mode at 17 px 600, its live line at 14 px in ink-2, a chevron), 64 px or taller, in this order:

| Door | The live line (true from the data, or the empty state) | What it opens |
|---|---|---|
| Weak spots | "7 to fix from 4 topics · taught again first, then asked again" · empty: "Nothing to fix yet. A miss in any set comes here with the step that fixes it." | the run at once |
| Mixed | "From your plan: FM1, M4, B2 · 8 questions, no topic labels" | its title card |
| Exam-style | "At the paper's pace: FM1 1.2 min a mark · method marks on · feedback at the end" | its title card |
| This topic | "Pick a topic: its ladder, then its mixed set" | the topic picker (her plan's units, their topics with a state word: not started · taught · practised · proved) |
| Unit check | "FM1 · six parts across three topics · the way to Proficient" · "From 9 pm" when the twelve hours have not passed · "Not yet: three topics of a unit need to be Familiar first" | the unit picker (only units with three Familiar topics are live) |

At the foot, one line: "Flashcards · 36 due →" (the phone's way to the decks) and "Export your findings" (the "Something wrong?" records as a file). Nothing else: no builder form, no essay, no subject chips. The desktop page is the same column at 720 px.

**A run's title card** (the frame's title row, the subject's wash where the mix is one subject, the no-subject accent otherwise): eyebrow the mode; title what the run is ("8 questions, no labels"); two lines of facts ("FM1, M4 and B2 · calculator allowed on 6 · about 12 minutes"); "Change the mix" as a quiet control that opens the chips on the same card (units from her plan, calculator, size 4 / 6 / 8 / 12; for Exam-style the "Paper 1 only (non-calculator)" toggle where a unit in the mix sits a non-calculator paper, M7 and M8); Start (accent). Exam-style's facts: "6 exam-style questions · 16 marks · 19 minutes at FM1's pace (1.2 minutes a mark) · method marks on · feedback at the end". Weak spots' facts: "7 to fix · each taught again first · about 15 minutes". Unit check's: "FM1 · six exam-style parts from three topics · no labels · untimed · what a topic needs to become Proficient".

**The question card.** Header: Exit, the mode ("Mixed"), "3 of 8", the track; eyebrow "Question 3 · 2 marks · Calculator" (no topic label in Mixed, Exam-style or Unit check; This topic shows the topic; in Exam-style the count reads "3 of 8 · 14 min left", in tabular figures, in ink-2, never red, and past zero "over by 2 min" with nothing stopping). Body: the question object exactly as the engine draws it (`QuestionRunner`: the stem, its figure, the field or options, Check, the working ladder, the marked states of 02-surfaces §4 and the critique, "Fix it now" opening the twin, "Something wrong?"). Foot: before an answer no control ("Answer, then Next" in 14 px ink-2); after the part is marked, "Next question" (accent; Enter) or "Finish" on the last. At any moment at most one accent-filled control is visible (the engine's Check gives way to its feedback card before Next appears). Desktop: the frame's bottom bar, hints left (Enter · →), Next right; the question object at 640 px with its figure in the 400 px column where it has one.

**Weak spots, one item.** Two cards. The first re-teaches: eyebrow "Once more, in other words · from 'Factorise first'"; the Slides See it card (`SeeSteps`, every step shown, the step she did not reach marked "the step you missed") drawn from `reteachFor`'s unreached scheme step → the note's See it whose steps carry that mark code, else the worked example's faded step, else the option note of the gate she missed; the control "Your turn". The second asks a *different* item carrying the same tag (a question part, a twin, a gate's twin), marked by the engine; the record is this item's. The run is at most ten items, one per misconception tag or unreached step from her last thirty days of misses (correct false, or a diagnostic sure-and-wrong), newest first.

**Exam-style.** The pace is the unit's paper: minutes ÷ marks from `data/spec` (FM1 120/100, M4 Higher 120/100, M8 150/100; where a unit's marks are not in the data the pace is 1.2 and the title card says "about"). The budget is the set's marks × pace, shown once on the title card and counting down in the header. Feedback is held to the end: the close lists each question with marks earned of available, the scheme lines missed (their codes and `for` text), the time taken against its budget ("7 min of 5"), and never a grade. A "Go through the misses" exit opens Weak spots seeded with tonight's misses. Holding feedback needs the engine's runner to accept a `deferFeedback` prop; `QuestionRunner.tsx` is the engine agent's file, so `builder-practice` requests it through the lead, and until it lands Exam-style marks each question as it goes and its title card says so.

**Unit check.** Six exam-style parts, two from each of three topics of one unit, no labels, untimed; the three topics are the unit's Familiar topics with the fewest later successes (a topic she has not opened is never checked). At the close the topics are named for the first time, with the Khan rule applied in words: "2 of 2 → counts toward Proficient", "1 of 2 → no change", "0 of 2 → back a level, with the step to fix in Weak spots". Offered once per twelve hours per unit, only when three of its topics are Familiar; no other door is ever locked. Its attempts are recorded so that `computeMastery` reads them as later mixed evidence.

**This topic.** The picker (plan units, then topics with their state word and counts: "ladder 8 · set 10"); the run is the topic's practice questions in authored order then its authored sets, as `PracticeFlow` runs them today, in the frame. Phase 2, after the owner's yes on the build: the topic page's own Practice stage and the Slides close's "Now the questions" open this same runner, so there is one practice runner in the product.

**The close** (`CloseCard`): the headline in marks ("11 of 16 marks · 12 min"); the Ledger line from this sitting's attempts through `lossesFromAttempts` ("Lost 5: Accuracy 3 · Method 2 · 1 won back"); what returns when, the three soonest returns among tonight's items from `db.cards`; one stone at most; exits "Done for tonight" (accent) and a second that fits the mode ("Another set", "Go through the misses", "Next topic"). The word "Wrong" never appears anywhere in a run.

### 3.5 The model (what `builder-practice` builds first)

- **The question index**, written by the content build to `public/practice/<subject>.json`: one row per question (id, topic id, unit, slug, style, calculator, marks, tags from its parts' common errors, the answer kinds, whether a figure is present), small enough to fetch in under a second; the chooser draws from the index and fetches one bundle per drawn question, in the background, while the title card is up.
- **`src/lib/practice/`**: `modes.ts` (the five doors, each a pure chooser from the index, her plan, her attempts and her mastery rows to a list of question references, with its empty-state sentence and its facts line); `pace.ts` (the unit's minutes per mark from the spec data, with the "about" fallback); `weak-spots.ts` (the eligible misses, their tags and unreached steps, the re-teach source per miss, the different item per tag); `unit-check.ts` (eligibility, the three topics, the twelve-hour rule, the per-topic verdict words); `run.ts` (the run state: title → questions → close, position persisted so a reload resumes, as `PracticeFlow` persists today); `findings.ts` (the "Something wrong?" rows as an exportable file).
- **Lazy loading**: Start is enabled as soon as the index is read; a bundle is fetched when its question is two ahead; a bundle that fails to load skips its question and says so on the close.
- **Recording**: every part through `recordAttempt` as today, with the mode in the attempt's existing fields where they fit (itemKind exam for Exam-style and Unit check, practice otherwise); no new table unless the lead agrees one.

### 3.6 The top five, honestly (benchmarks §10 is the research of record)

| | Better | Equal | Behind |
|---|---|---|---|
| **Sparx** | no XP, no "Wrong", no robot; the support is the note's own See it step; the mix is chosen by her plan and her misses | the mixing of prior topics in every mode | the adaptive level set after a hundred questions, and the weekly homework a teacher sees; neither is ours to want |
| **Khan's mastery challenge** | the parts are exam-style and scheme-marked, and the result is read in CCEA's words | Unit check adopts its numbers (six parts, three skills, two each, level up on two right, down on two wrong, every twelve hours, after three Familiar) | Khan's breadth of generated items per skill |
| **Seneca's wrong answers** | the re-ask comes after the step that fixes it, named from the scheme, and the re-ask is a different item | the mode exists, free | Seneca's image-reuse between teaching and testing modules; our figures do this in the lesson, not yet in Weak spots |
| **Dr Frost** | method marks paid from working | the ladder as a topic's skills in order | parameterised generators that vary a question's numbers for ever; our twins and faded variants are finite |
| **OnMaths** | the official papers with UMS are on the Papers page; here the clock is the paper's own pace and no grade is printed | the timed set | a live predicted grade (refused by decision) |

### 3.7 The CCEA fit, per mode

This topic: the ladder to the A* boundary in authored order, then the authored interleaved set. Mixed: the paper mixes topics with no labels, so the recognition step is practised the way it is examined. Weak spots: the re-teach is the scheme step she did not reach, in the note's own See it, which is what a CCEA examiner's report says the lost marks were. Exam-style: the paper's own minutes per mark, method marks on, the scheme lines missed named at the end. Unit check: the only evidence the mastery engine accepts for Proficient is later, mixed success; this is that evidence, gathered in six exam-style parts. The non-calculator toggle exists because M8 Paper 1 is seventy-five minutes without a calculator.

### 3.8 Cut, and why

Past papers by series as a practice mode: cut. CCEA's questions are never reproduced; a by-series mode could only be metadata pointing at the official paper, `data/papers/questions-index.json` has 0 rows classified by topic (programme 6.7 is unbuilt), and the Papers page already runs an official paper timed with UMS; a door that opens on "coming" is a label. Non-calc Five as a mode: cut to a toggle and a size on Exam-style ("Paper 1 only", five questions), because five non-calculator questions is a mix, not a mechanism, and a door for it would be Corbettmaths's cadence pretending to be ours. Due reviews as a door: a review is not practice and has its page; it is the line at the top. The builder form as the first screen, the "Why mixed" essay and the flashcards link card: cut; the mix is her plan's, "Change the mix" lives on the run's title card, the essay becomes the Mixed door's second line, and the flashcards link is the page's foot. "Next question" before an answer: cut (programme 5.0). Loading every bundle before Start: cut by the index.

### 3.9 The five questions, from the pixels

The doors: clarity, five promises with their counts; focus, rows only; momentum, the counts falling; calm, no form, no accent on the rows; trust, every count from her record. A title card: clarity, what this run is and how long; focus, one Start; momentum, the facts; calm, one wash; trust, the pace is the paper's and says so. A question: clarity, one question on a whole screen; focus, nothing else; momentum, the track and the mark; calm, no red, no timer alarm; trust, the engine's mark with the scheme's codes and the examiner's sentence. A re-teach card: clarity, "once more, in other words"; focus, the step; momentum, "Your turn"; calm, ink; trust, it is the note's own step. The close: clarity, marks and reasons; focus, two exits; momentum, what returns when; calm, one stone at most; trust, every mark counted by the engine.

---

## 4. How it scales to English and other subjects

Nothing in either design names a subject or a unit. The flashcards generator reads the note grammar (prompts with key words, gates with option notes, See it steps, recap lines, label parts, authored decks), so an English Literature pack with quotation prompts (the recall card kind "quotation" already exists in `src/components/slides/cards.tsx`), a context gate with option notes and a "write the next line of the analysis" See it produces cards without a line of new code; the index pages read `planUnits()` and the specification catalogue, so her English units appear in "Your decks" the day her plan carries them. The practice modes read questions of any answer kind the engine marks (a `text-long` essay part through the QWC bands, a label part, a table), the pace reads the paper's minutes and marks from the spec data, and Unit check reads mastery rows; an English unit needs its spec data (durations and marks) and its packs, nothing else. What does not scale by itself and is said so: the key-word engine's groups are authored per part; a label figure must exist in the pack; the pace needs the paper's marks in `data/spec` (science's are not there yet, so science reads "about 1.2").

---

## 5. Acceptance

The gate for each build is this list, proved by the e2e owner's specs through `e2e/content.ts` (never a typed count or id) and the builders' unit tests. "Measured" means a Playwright assertion at 390 × 844 and 1280 × 800.

### 5.1 `builder-flashcards` (data layer first, from 17:04; the surface second; the spec third)

1. **Model and generator.** `src/lib/flashcards/model.ts` exports the card model of §2.5; `pipeline/build-decks.mts` writes `public/decks/<subject>/<unit>.json` in that model with `counts.byFormat`; every card has a `source`; no card is hand-written in code; a card made from a gate carries the gate's inbox card id and a card from a prompt the prompt's id (unit test: the ids of the trial topic's gates and prompts appear exactly once each across the deck and the inbox's resolver); a numbered procedure is `reference: true`; no card's typed answer or back exceeds 25 words where it came from a prompt; the line format never asks a See it's first step; a cloze is only made from a recap line holding a key word. Year 12 decks first; the report prints the per-format counts for FM1, FM2, FM3, M4, M8, B2, C2, P2 and U7.
2. **Marking through the engine.** Choice by the gate's answer with the wrong option's `why` on a miss; key word and cloze by the text engine (`keywordsPresent` / the key-word groups); working line by `stepLineMatches`; label by `checkLabel`. Unit tests on one card per format from the trial topic (`fm1/algebraic-fractions-simplify`) with a right answer in two phrasings, a wrong answer and a near miss; any engine refusal of a right phrasing is recorded as engine-pending (item, input, award, expected, scheme line) and not worked around.
3. **Grades and returns.** The four grades exist; after a marked miss only Again is offered; after a marked right answer Hard, Good and Easy; on a recall card all four, and on a key-word or cloze card where some but not all key-word groups are present all four with the ticks shown word by word; each button prints its return with `returnWord`; the date stored by the tap equals the date printed (unit test with a fixed clock; the inbox's `inboxReturns` gains Hard).
4. **The sitting.** Twelve by default; due first, then opened topics in teaching order, then the rest; an Again card is re-dealt after three other cards and placed only when it passes; "n of 12 placed" never grows (unit tests on `sittingFrom` v2 with a seeded pool); a sitting left at card 7 reopens at card 7 with the same twelve (Playwright: reload mid-sitting).
5. **The index** `/flashcards/`: "Your decks" lists the plan's units in plan order with "n due · N cards" and "coming" where no deck exists, then "Other decks"; no tint bar; rows ≥ 52 px (measured).
6. **The deck's first screen** is the frame's title card with the one-line mechanic, "Tonight: 12 cards · n due · about m minutes", the paper line from her plan (absent, not invented, when the unit has no paper in her plan), "Tonight's dozen" as the only accent-filled control, "Choose topics" as the outline (measured: computed accent background on ≤ 1 button).
7. **The card** at 390 × 844: the header on the deck's wash with the placed-pill track and "n of 12 placed"; the eyebrow "Format · State"; the stem's display maths on its own line with the §8.4 gaps (16 / 20 px, measured); options 52 px and 10 px apart; after Check the right option (lit) and hers (edged) remain and every other option is put away; the lit option, the verdict, the one-line See it recess and the grade row are all on screen with no vertical scroll of the frame on every card format (measured: `scrollHeight ≤ clientHeight` of the body on the trial topic's g2 card answered wrongly, and on one card per format); the grade row's buttons are 52 px and unaccented (measured against the accent as the current spec does); no red hue within 20° on the card except `--danger`, which is absent.
8. **A miss teaches.** On a wrong option the verdict shows that option's `why`, the right option lit in fern, "Not quite." in ink, and a recess "From See it, step k of '<heading>'" that opens the step's working line in place where the card has a `teach` source (Playwright through the contract: the trial topic's gate g2 answered with its first wrong option shows the note text the bundle carries for that option).
9. **Keyboard and swipe** (desktop): Space shows or checks; 1–4 choose before Check and grade after; Enter checks; ← re-reads; Esc stops with the sitting kept; the bottom bar prints the hints. Swipe (touch) turns only when allowed and never grades (unit test on the gesture rule's use).
10. **The close**: "n placed · m min", the first-time and second-look counts, what returns when counted from the stored dues, the paper line, "Done for tonight" accent and "Another dozen" outline; the companion present; no word from the banned list ("streak", "lost", "missed", "Wrong").
11. **The review inbox** shows a flashcard with the same component: a key-word card due in the inbox is typed and marked there (Playwright: seed one due card, open the inbox).
12. **Static, offline, reduced motion**: static routes only; the deck JSON is in the offline copy; under `prefers-reduced-motion` `document.getAnimations().length === 0` on the title card, a card after Check and the close.
13. `npx tsc --noEmit -p .` 0; vitest green for touched files; `e2e/flashcards.spec.ts` rewritten through `e2e/content.ts` and green alone with `--output scratchpad/state/builder-flashcards/pw-out`.
14. **Not in this build**, said on the title card where it matters: matching pairs and speaking (refused); the shield (refused); per-topic strength (stream 9).

### 5.2 `builder-practice` (the index and the model first, from 17:04; the page and the runner second; the spec third)

1. **The index.** The content build writes `public/practice/<subject>.json` (id, topic, unit, slug, style, calculator, marks, tags, answer kinds, figure); its size per subject is reported; Start on the Mixed title card is enabled within one second of the page being interactive on the export (measured: `performance.now()` from `domcontentloaded` to the button's enabled state < 1,000 ms), and the network log shows one bundle per drawn question, fetched after Start.
2. **`src/lib/practice/`** as §3.5, every chooser pure and unit-tested: Mixed draws from the plan's units with no two consecutive questions from one topic; Weak spots yields at most ten items, one per tag or unreached step, each with its re-teach source and a different item with the same tag (fixture: one missed item yields its See it step first, then another item, never the same id); Exam-style's budget equals marks × the unit's pace from the spec data (test: FM1 1.2, M8 1.5, a unit with no marks 1.2 with `about: true`); Unit check picks three Familiar topics, two parts each, obeys the twelve-hour rule and names the per-topic verdict words; `findings.ts` serialises the reports table to a file.
3. **The doors page** `/practise/`: exactly five mode rows in the order of §3.4 with their live lines, the reviews-waiting line only when due > 0, the foot's flashcards link and "Export your findings"; no builder form, no essay; no accent-filled control on the page except none (the rows are links); each empty state is the sentence of §3.4 (Playwright on a fresh profile: Weak spots reads its empty state; Unit check reads "Not yet…").
4. **A run's title card** carries the mode, the count, the facts line, "Change the mix" with the plan's units, calculator and size, the non-calculator toggle only when M7 or M8 is in the mix, and Start as the one accent control (measured).
5. **The question card** at 390 × 844: the header's mode, "n of N" and track; the eyebrow "Question n · m marks · Calculator | Non-calculator"; no topic label in Mixed, Exam-style and Unit check (Playwright asserts the topic title from the contract is absent from the card); the engine's question object unchanged (its Check, feedback card, ladder, "Fix it now", "Something wrong?" all present); no "Next question" before the part is marked; at most one accent-filled control visible at any moment (measured before Check and after the feedback card).
6. **Exam-style**: the header's time reads "n of N · m min left" from the budget, never a red computed colour, past zero "over by m min"; the close lists per question marks earned of available, the scheme codes missed with their `for` text, time against budget, and contains no grade letter or percentage; "Go through the misses" opens Weak spots seeded with the misses. If `deferFeedback` is not yet in the engine's runner, the title card says "marked as you go for now" and the close still lists the lines.
7. **Weak spots**: the first card of an item is the Slides See it card with the missed step marked and the control "Your turn"; the second is a different item with the same tag; the record is the second item's (`db.attempts` after the run: no attempt row for the re-teach card).
8. **Unit check**: available only with three Familiar topics; six parts, three topics, no labels; the close names the topics with the verdict words; a second check within twelve hours is refused on the door with "From <time>"; `computeMastery` reads its attempts (test: both parts right on a Familiar topic with recall ≥ 0.85 → Proficient; both wrong → one level down).
9. **The close** of every mode: marks, minutes, the Ledger line through `lossesFromAttempts` for this sitting's attempts only, what returns when (three soonest), at most one stone, two exits; "Wrong" absent from every run (Playwright: `main` never contains it through a full Mixed set answered wrongly).
10. **Resume**: a run left at question 3 reopens at question 3 (reload test); the position store is the flow table's pattern.
11. `tsc` 0; vitest green; `e2e/practice.spec.ts` rewritten through the contract (the trial topic's `examAnswers` and `gates` drive the typed answers) and green alone with `--output scratchpad/state/builder-practice/pw-out`.
12. **Phase 2 only after the owner's yes**: the topic page's Practice stage and the Slides close's "Now the questions" open this runner; until then `PracticeFlow.tsx` is untouched.
13. **Requests to the lead, in writing in the report**: `deferFeedback` on `QuestionRunner` (engine-owned); any new Dexie table.

### 5.3 The e2e owner (`e2e/flashcards.spec.ts`, `e2e/practice.spec.ts`, through `e2e/content.ts`)

The contract gains, from the builders' modules and never from typed values: `deckFor(subject, unit)` reading the served deck JSON (counts by format, the cards of the trial topic by source id), `sittingOf(deck, due, opened)` through the sitting rule, `practiceIndex(subject)` reading the served index, and `paceOf(unit)`. The flashcards spec walks: the index lists the plan's units with the manifest's counts; the FM1 title card prints "Tonight: 12 cards"; a sitting deals twelve, the trial topic's g2 card is answered with its first wrong option from the contract and shows that option's note and the single Again button with a return word; a right answer shows three grades, each with a return word, none accented, 52 px; the count reads "n of 12 placed" and stays 12 after an Again; reload mid-sitting resumes; the close prints the placed count and the paper line; reduced motion yields zero animations. The practice spec walks: the doors page's five rows and their empty states on a fresh profile; Start enabled within a second; a Mixed run of four with no topic label on any card, "Next question" absent before an answer and present after, a wrong typed answer from the contract's `examAnswers` negated producing a feedback card without "Wrong"; an Exam-style run whose header prints "min left" and whose close prints scheme codes and no grade; a Weak spots run after that miss whose first card is a See it card; the close's Ledger line. Every assertion reads its expected text from the contract or from the served JSON.

### 5.4 The lab routes the owner opens on the next build

So that the owner sees both before the pages change: `/lab/flashcards/` renders the chosen card formats on the trial topic's real cards with the real engine and records nothing; `/lab/practice/` renders the five title cards and one Mixed question in the frame. Both are the builders' own `app/lab/**` routes (the slides-steps agent owns `app/lab/see-its/` only), listed on the build note.

---

## 6. Risks, and the questions only the owner can answer

- **Four grades against decision 10's three.** If the owner wants three, the design loses Hard and nothing else moves; the boards show four.
- **Choice cards from gates repeat the lesson's Your turns.** By design (retrieval of the lesson's decision), and the twin alternates on returns; if it reads as repetition, the generator can prefer twins for the deck and keep the originals for the inbox.
- **Deferred feedback** needs an engine change; the fallback is honest and stated.
- **Science pace** is "about 1.2" until the paper marks are in `data/spec`.
- **Phase 2** (one practice runner for the topic page too) touches `e2e/learn.spec.ts`'s walk and the lesson page; it waits for the owner's yes.
- **The brief changed under me**: `FLASHCARDS-PRACTICE.md` was rewritten on disk after my launch into a single-agent brief (`flashcards-practice`: case, lab prototypes, specs, build plan). I followed the launch message (designer, read-only on code) and folded that brief's case requirements in (vision, scaling, top-three, CCEA fit, cuts, "measure before you judge"). If a single builder is launched instead of two, §5.1 and §5.2 are its list in that order.

---

## 7. The boards

Drawn as HTML with the product's tokens (the LCH palette of art direction v2 §2.2, Literata from `public/fonts`, Inter from the export, KaTeX), rendered by Playwright at 390 × 844 and 1280 × 800 in light and dark, two device pixels per CSS pixel: 22 screens × 4 = 88 PNGs under `scratchpad/probes/designer/png/`, named `<fl|pr>-<a|b|c>-<screen>-<phone|desktop>-<light|dark>.png`; the kit is `scratchpad/probes/designer/boards/kit.html` with `data.js` (the trial topic's real gates, option notes, prompts, See it lines, questions and schemes, extracted by `extract.mjs`) and `render.mjs`, which also measures each card's body overflow (0 on every board at the final render) and writes `png/INDEX.md` with the list and the notes on what is illustrative. Flashcards: A the sitting (`fl-a-card`); B the index, the title card, the choice card before Check, after a miss and after a right answer, the key-word card before and after Check, the working-line card, the label card, the close (`fl-b-*`); C the shield (`fl-c-deck`). Practice: A the doors, the Mixed title card, a question, Exam-style, the Weak spots re-teach card, the Mixed close, the Exam-style close, the Unit check close (`pr-a-*`); B tonight's set (`pr-b-tonight`); C the question is the page (`pr-c-topic`). Two measurements the boards forced on the design: a marked choice card with all three options kept overflowed a phone by 122 px, so the options that are neither hers nor right are put away after Check; and the See it recess under a miss is one line until tapped.

---

## 8. The five self-audit answers (STANDARDS.md)

1. **Would she understand it alone at night?** The doors say what they are in one line each; a card is one question with the answer's shape in front of her; every grade says what it does in a day's name; a miss is met with why her answer tempted and the step that fixes it. Yes, if the builders keep every sentence here as short as it is here.
2. **Can she rely on every number, scheme line and award?** The marks are the engine's, the scheme codes the pack's, the returns the scheduler's at the moment they are printed; the pace is computed from the spec data or says "about". The one number this case invents is none: the boards' counts are the trial topic's and the manifest's.
3. **Does it earn her marks on her real paper, or is any of it filler?** The key-word, working-line and label formats ask for exactly the things CCEA pays; Exam-style is the paper's pace; Weak spots is the unreached scheme step. The recall card is the only format that does not test, and it is the last resort, never the default. Matching, speaking, shields and a recommended set are left out because they would be filler here.
4. **Would a Chief Examiner sign it as CCEA-true?** The option notes and the registry ids are the reports'; the mark language is the scheme's; nothing copies a paper; the by-series mode was cut rather than faked.
5. **A line I would be embarrassed to defend?** "About 1.2 minutes a mark" on a science run, until the papers' marks are in the data; and the twelve-hour rule on Unit check, which is Khan's number, not evidence of ours. Both are named on the screens that carry them.

---

## Sources

docs/plan/review/2026-09-23-benchmarks.md §10, §13, §15 (and their sources register); docs/plan/2026-09-22-programme.md streams 5 and 7; docs/design/2026-09-23-art-direction-v2.md §2–§5, §8, §9; docs/design/art-direction/02-surfaces.md §4, §6; docs/plan/review/2026-09-24-teach-first-case.md §6–§8; docs/plan/emotional-design.md; docs/dev/RULINGS.md; docs/plan/review/2026-10-11-owner-findings.md; the code named in §2.5 and §3.5; the counts script `scratchpad/probes/designer/counts.mjs` (11 Oct 15:22) and the live walk of build 15 (15:30).
