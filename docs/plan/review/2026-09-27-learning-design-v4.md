# The learning design, judged as an expert: what to keep, what to fix, and lesson standard v4

27 September 2026, written by the cloud session for the owner. It answers the owner's comments of 27 September on the advisory of 26 September (`docs/plan/review/2026-09-26-advisory.md`):

- **Be the expert, not her echo.** Judge each learning feature on its idea and on how it is built. Name what the best platforms have that Cairn lacks, and say how to build it well.
- **Does v3 solve the problem?** 725 of 1,507 gates come before any worked step, and 518 of 1,052 sections have no demonstration. If v3 only solves it in part, design a v4 that solves it completely.
- **Her devices.** She will use her own laptop, iPad and iPhone from November to June, with exams in most of those months, and her progress must carry across all three.
- **Worked examples like the CCEA books.** Are they in the teaching slides? Were the books studied? Which books would add most, with links?

This is a case in the programme's sense (decision 14): nothing in it is built until the owner approves it. It inherits the teach-first case of 24 September (`docs/plan/review/2026-09-24-teach-first-case.md`) and its eight questions, and it applies the platform's own research (`docs/research/06-learning-science-what-works.md`, researched 1 September).

**Where the numbers come from.** They are from the published bundles on this branch (198 topics), the code, and three audits run on 27 September: the learning features, the storage, and the books.

---

## 0. The answer in six lines

1. **The ideas are right; the lesson is where they are weakest.** The platform's own research asks for faded examples, self-explanation, feedback on the misconception behind the answer she chose, interleaving and mastery gates. Most of that exists in the practice and review layers, and almost none of it inside the lesson. v3 adds one half of one of them.
2. **Half the lesson's checks are guesses away from right.**
   - 882 of the 1,723 gates are multiple choice, and 861 of those have three options. A guess is right a third of the time.
   - Each gate carries one explanation for every wrong option, so a miss is never diagnosed.
   - Yet the platform owns a misconception library the lesson never uses: 1,596 diagnostic items, whose 4,023 wrong options all have their own feedback, 3,363 of them tagged with the misconception.
3. **v3 solves the two measured problems on paper, not the learning problem.** No check comes before a demonstration, and every section gets one. But one worked example followed by one check is modelling without guided practice. Its demonstration is shaped for maths, which fails most of science. It has no warm-up, no self-explanation, no deliberate variation, and no exam writing.
4. **v4, "teach, show, guide, check, apply", closes those gaps mostly with assets the platform already has:**
   - 489 worked examples, every one with a twin and backward-faded versions (420 also have a why-menu), stranded after the lesson today;
   - the misconception library;
   - a prerequisite graph of 341 links over 187 topics that nothing uses yet.
5. **Her devices.** Host Cairn at a private HTTPS address and install it as an app on the laptop, the iPad and the iPhone. Sync her history as an append-only log through her own account. Dexie Cloud fits: it is built by the makers of the database library Cairn already uses, and its free plan covers three users and 100 MB. "Nothing leaves the device" becomes "minimal data, her own account, exportable at any time".
6. **Worked examples and the books.**
   - In the Slides today, the trial topic teaches with short worked lines inside its paragraphs. The step-by-step worked examples sit after the lesson, on the topic page.
   - The CCEA textbooks were catalogued in the market research and never studied.
   - Buy them, run an alignment pass topic by topic, and never copy from them.

---

## 1. The learning features, judged

Each feature below is judged on four things: whether the idea is right, how well Cairn builds it, what the best platforms do, and what to change. "The best" means what the platforms and the evidence show, not what she liked. Her words are evidence of experience, and they count; they are not evidence of learning.

| Feature | The idea | How Cairn builds it | What the best do | Verdict and the change |
| --- | --- | --- | --- | --- |
| **Teach before test** | Right: explicit instruction first, for novices (Rosenshine; the worked-example effect) | The topic page runs the lesson, then See it (a video), worked examples, check and practice (`TopicContent.tsx`). Nothing locks: any answer to a gate opens the next stretch. 725 of 1,507 gates come before any worked step, and the note holds no worked-example block at all. After Slides, "Practise this topic" goes straight to practice and skips the worked examples | Math Academy: every knowledge point starts with a fully worked example, then practice problems | **Right idea, half built.** v4's section grammar makes it structural (4.3) |
| **Worked examples and fading** | Right, and among the strongest evidence for novices (Renkl 2002; Kalyuga 2003) | **Authoring is excellent:** 489 worked examples, each with a twin and backward-faded versions, and 456 why-menus. **Placement is weak:** all come after the lesson, and the Slides deck has none. The ladder only suggests the next rung from her accuracy, and starts at "full" on every visit. **The right reason is the first option in 453 of the 456 why-menus**, shown in authored order (`WorkedExampleAsQuestion.tsx`). It is the option-A cue she found in the gates, again | Example, then completion problems, then problems, inside the lesson | **Best-in-class content in the wrong place.** Put one example and one faded version inside each section, and shuffle the why-menus as the gates are shuffled |
| **Spaced repetition (FSRS)** | Right: the strongest evidence for retention | FSRS-6 with default weights, retention 0.90, intervals capped at 120 days; exam mode raises retention near a paper. The nightly queue is capped and mixed, with confident misses first. Every marked item becomes a card: right grades Good, part-marks Hard, wrong Again, never by time or confidence. Answering again outside the review inbox does not move a card. **The 1,342 flashcard-only cards cannot be shown in the inbox** (`review/resolve.ts` has no branch for them): they appear as "withdrawn", and Skip does not move them | Anki and FSRS for facts; Math Academy reviews a skill with fresh problems and credits its prerequisites | **Well engineered, aimed at the wrong unit, and two bugs.** v4 reviews the skill with a different item; the flashcard bug is fixed first |
| **Confidence and hypercorrection** | Right: a confident error, once corrected, is remembered best (Butler 2011; 219,000 Eedi responses) | Confidence is asked only on diagnostics. A confident miss is re-asked at 2 and 7 days, then dropped whatever the result, while the screen says it returns "until it sticks". A confident miss in the inbox creates no re-probe | Eedi: confidence on every diagnostic, and calibration shown | **A good idea, with the promise overstated.** Re-probe until she gets it right; show her calibration |
| **Misconception-tagged distractors** | Right: competitive distractors teach, when feedback follows (Little and Bjork 2015; Marsh 2007) | **Strong in diagnostics:** 4,023 wrong options, each with its own feedback, 3,363 of them tagged. **Strong in questions:** 540 of 700 tagged. **None of the 1,777 gate distractors can carry a tag.** The tags she triggers are recorded and **never read**: no summary, no targeted review | Eedi: every wrong option a named misconception, and reports of a learner's misconceptions | **The asset exists and goes to waste.** v4's Fix it in the lesson; her recurring misconceptions in the Fortnight view and in her reviews |
| **Right answers over A, B and C** | Test hygiene, not pedagogy | A seeded, balanced shuffle: A 289, B 284, C 296, D 13 across the notes | Table stakes | **Fine, and done for gates.** Extend it to the why-menus. The real issue is too much multiple choice (51% of gates) |
| **Retrieval prompts** | Right, if short and few | 1,662 prompts, 442 with answers over 25 words. v3 caps them at two per lesson, about 12 words each, with Skip | Short, focused, many over time, few at once | **Fixed by v3; keep it** |
| **Mastery and stones** | Right in principle: no mastery from an immediate post-test | Proficient needs one right exam-style, prompt or find-the-mistake answer two or more days later (`mastery/engine.ts`). **Mixed practice does not count, although the screens say a stone is for a topic proved "in a later mixed set"** (`TodayTiles.tsx`, `JourneyChart.tsx`). Mastered needs a paper date, so without one it is never reached. There is no decay over time | Khan: levels move on varied practice, quizzes and unit tests. Math Academy: a knowledge frontier | **Too easy at Proficient, and the promise on screen is untrue.** v4's mastery v2 (4.7), with screens that tell the truth |
| **Practice and interleaving** | Right; strongest in maths (Rohrer 2020, d = 0.83) | Topic practice runs in authored order. There is one mixed builder, and it draws from **topics she has not studied yet**. **Tier and difficulty are ignored everywhere**, across 1,157 Higher and 100 Foundation-only questions. Interleaving happens automatically only in the review queue | Interleaved by default once learnt, from what she has learnt, at her tier, rising in difficulty | **Present, not good enough.** v4's practice pathway (4.6) |
| **Marking and feedback** | Right: the platform's strongest asset | Calculation is verified by 13,988 probes. Written answers are marked by key-word groups, with an "award n/n" button she can press herself on a miss. On six-mark answers the engine suggests a band, and she chooses the band and the mark. The schema's AI-mark field is unused | Levels of response, as examiners mark; calibrated AI marking is emerging | **World-class for calculation, self-marked for writing.** The text guard, the extended-answer builder, an AI marking pilot |
| **Rowan, the companion** | Plausible for motivation; the evidence is thin | 62 lines over 16 moments; the lines for 10 of the moments are never shown, and three companion components are unused | Duolingo's characters sit on a habit loop | **Well built, half wired, and it does not teach.** No more investment until Year 12 is written to v4 |
| **Slides and Read** | Right: one idea per screen (Mayer) | Polished, accessible and tested; Slides exist for one topic only. The trial deck runs 38 cards and about 21 minutes, with no stopping point | Units that last minutes; a stop is always safe | **Keep; cut topics into sittings of 10 to 15 minutes**, with stopping points (4.2) |

### 1a. Defects the audits found, to fix whatever is decided

1. **Diagnostic review cards are shared across topics.** The 1,596 items use 52 ids and are recorded without their topic (`CheckSection.tsx`; `record.ts`, `cardIdFor`). Most topics' diagnostics never come up for review.
2. **Flashcard reviews are stuck.** The 1,342 flashcard-only cards cannot be shown in the review inbox (`review/resolve.ts` has no branch for `fc.*`). They show as "withdrawn while it is checked", Skip does not move them, and they will crowd the nightly 25.
3. **The stones promise is untrue.** Mixed practice never counts towards Proficient, and "Mastered" is unreachable without a paper date.
4. **Why-menus give the answer away.** The right reason is the first option in 453 of 456.
5. **Re-probes stop too soon.** A confident miss is re-asked twice and then dropped, while the screen says "until it sticks".
6. **The inbox prints the wrong return days.** Its grade buttons use the default scheduler, not exam mode.
7. **Nothing reads her misconceptions.** The tags she triggers are recorded and never read.
8. **Time is recorded only on diagnostics.**
9. **Mixed practice ignores what she has studied and her tier.** It draws from topics she has not studied, and ignores tier and difficulty.
10. **Storage and installing** (section 5):
    - a backup merge that overwrites rows across devices;
    - no review log;
    - no apple-touch-icon;
    - video thumbnails that load before a tap.

**Her exam dates.** The default plan puts every one of her papers in May and June 2027, from B1 on 11 May to FM3 on 15 June. The platform knows a November 2026 series and a February 2027 science series, but her plan does not use them. The owner says she has exams in November, February and March too. Exam mode, the queue's weighting and readiness all run from these dates, so her actual entries must be confirmed.
---

## 2. What the best platforms have that Cairn lacks

Ranked by what each is worth to her between November and June. For each: what the best do, what Cairn has, and how to build it well.

1. **Her own account, synced across devices.** Every serious platform has it; Cairn has one browser on one machine. Without it, nothing else survives November to June on three devices. How: section 5.
2. **Guided practice inside the lesson.**
   - **The best:** Math Academy follows each worked example with up to five problems, and moves on after two right in a row. Barton's "example, then your turn" pairs each example with a structurally identical problem.
   - **Cairn:** the faded worked examples exist, but after the lesson.
   - **How:** v4's Try it with me (4.3), converted from the faded versions.
3. **Feedback on the misconception, inside the lesson.**
   - **The best:** Eedi's diagnostic questions give every wrong option a named misconception with its own explanation.
   - **Cairn:** already has this in its diagnostics (3,363 tagged wrong options) and questions (540), and not on the 882 choice gates the lesson actually uses.
   - **How:** v4's Fix it; the choice gates' wrong options mapped to the topic's library; the untagged ones tagged (the programme's item 0.15).
4. **A learning loop driven by what she knows.**
   - **The best:** Math Academy runs a knowledge graph with placement, a "knowledge frontier", and reviews that credit prerequisites implicitly. Khan's mastery system changes a skill's level on practice, quizzes and unit tests.
   - **Cairn:** has the graph (341 prerequisite links) and a careful scheduler, and does not connect them.
   - **How:** v4's warm-up, prerequisite credit, reviews by skill and the opt-in check (4.6).
5. **An exam engine.**
   - **The best:** exam-board-style practice sites let a student sit a timed paper, mark it against the scheme, see where the marks went, and track readiness.
   - **Cairn:** has the plan with CCEA's dates, the Papers page with official links, and exam-aware scheduling. It has no full paper sat inside the app, and no analysis afterwards.
   - **How:**
     - timed mixed sets and full papers built from the question bank in the paper's layout;
     - her self-marking against the scheme, with the engine's marks beside it (self-grading with rubrics helps: Sanchez 2017, g = 0.34);
     - the exam wrapper afterwards;
     - readiness per paper (4.7).
6. **An extended-writing trainer, with calibrated AI marking.**
   - **The best:** no GCSE platform does this well yet. It is an opportunity, and CCEA science rewards describe, explain and six-mark answers heavily.
   - **Cairn:** 71 extended-answer parts, marked by key words.
   - **How:** first the extended kind of demonstration (Level 1, 2 and 3 answers side by side, with what lifts a 2 to a 3), a points-bank planner, and her self-marking against the checklist. Then an AI marker, built to be trusted:
     1. **The scheme travels with every answer.** Each answer is sent to Claude (`claude-opus-5`) with the question, the mark scheme and the levels descriptor. That fixed part is cached, so each new answer costs only its own words.
     2. **The mark is structured, not free text.** The marker returns each marking point met or missed, the level, one sentence of feedback, and its confidence.
     3. **It is calibrated before it goes live.** A labelled set (step 4 of move 4 in the advisory) runs offline through the Batch API, at half the price.
     4. **It goes live only above a threshold** of agreement with the labels: within one mark on six-mark answers at least 90% of the time.
     5. **She sees a suggestion, not a verdict.** The suggested mark comes with the scheme's points, and a "that's not fair" button logs disagreements for review.
     6. **It needs a server** to hold the key, never the app itself. The sync backend is where it lives.
7. **A practical-skills module for Unit 7**, which is 25% of the award and has no topics.
   - **The best:** York's BEST resources and the RSC's and IOP's practical materials teach variables, measurement and evaluation explicitly. Simulations such as PhET let students take readings.
   - **How:**
     - v4's practical demonstrations for each prescribed practical;
     - drills on the independent, dependent and control variables, and on apparatus named and spelt;
     - results tables and graphs to complete, using the existing table and graph parts;
     - evaluation language that keeps accuracy, precision, reliability and validity apart;
     - one Booklet B-style question per practical, marked by the scheme.
8. **Figures she can act on in every See it where the idea is visual.**
   - **The best:** Brilliant's reacting diagram on almost every screen.
   - **Cairn:** has the enrichment registry and one excellent example (tap to cancel, and the substitution drawn on a miss), on the trial topic only.
   - **How:** one interaction per topic where the idea is visual, drawn to the art direction's craft floor, chosen by value (a graph to drag, a particle model, a force diagram), not on every card.
9. **A view for the supporting adult.**
   - **The best:** Sparx and Khan show parents and teachers progress and effort.
   - **How:** a read-only Fortnight view, built from her synced history and opened by you only with her agreement:
     - topics finished;
     - retention on delayed reviews;
     - calibration ("sure and right, 8 of 10");
     - the items missed twice;
     - readiness per paper;
     - minutes a week.
10. **An "Explain it another way" helper**, optional and later.
    - **The best:** Khanmigo-style tutors.
    - **How, if at all:** one button on a missed step. It sends Claude the item's own worked solution, the scheme and the misconception, and asks for one different explanation in under 80 words. It never answers a question she has not attempted, and there is no open chat. Online only, and logged.
    - **Its place in the order:** below every item above.
11. **Read-aloud and text spacing.** Universal Design for Learning and WCAG both ask for more than one way into the text.
    - Read-aloud for notes and questions uses the device's own voices (the Web Speech API, which works offline on iPhone and iPad).
    - The text-spacing control is already queued (programme item 2.10).

**What Cairn does that they do not, and must keep.**

- Marking to CCEA's own schemes, with the mark codes.
- The examiners' findings inside the lesson.
- A calm design with no streak pressure.
- Offline use.
- No paywall, no advertising and no data sold.

---

## 3. Does v3 solve the problem?

**In short: on the two measured numbers, yes, by construction. On learning, partly.** v3 makes a demonstration and a check a fixed pair in every section, and the lint turns fatal unit by unit. So in a migrated unit the 725 early gates and the 518 empty sections both go to zero:

- 323 demonstrations are converted from worked examples the bundles already hold;
- 195 are written new;
- every gate moves behind its section's See it.

What v3 does not solve is what the learner does between watching and being tested.

| The problem | What v3 does | Verdict | What is left |
| --- | --- | --- | --- |
| Checks before anything is shown (725 of 1,507) | A check only after its section's See it; lint fatal per unit | **Solved** in migrated units | Nothing, once the lint is fatal everywhere |
| Sections with no demonstration (518 of 1,052) | A `see` block in every gated section | **Solved on paper** | "Shown" is defined as a maths-style working line. For a biology explanation, a process, a practical or a graph, a working line is the wrong demonstration (see below) |
| From watching to doing | One See it, then one check | **Not solved** | No guided practice. The research's order is example, then completion problems, then problems (Renkl 2002; backward fading best). v3 jumps from a full example to an independent check. The faded versions exist for all 489 worked examples but stay after the lesson |
| What the check asks | Unchanged: 51% multiple choice, mostly three options | **Not solved** | Recognition is weaker than producing the answer when feedback follows (Kang, McDermott and Roediger 2007), and a guess passes one time in three |
| What a miss teaches | A re-teach card: the explanation again in other words, then the answer | **Half solved** | The re-teach is the same for every wrong option. The misconception library already holds a named error and its own feedback for 3,363 wrong options. v3 does not use it |
| Understanding each step | The reason printed under each step | **Half solved** | Reading a reason is not explaining it. Self-explanation works when she produces or chooses the reason (Bisra 2018, g = 0.55); the worked examples' why-menus already do this, after the lesson |
| Seeing the edges of an idea | One example per variant | **Not solved** | No deliberate variation or non-examples beyond what an author happens to write (Barton's Reflect, Expect, Check, Explain; the NCETM's variation) |
| Prior knowledge | The first section starts teaching | **Not solved** | No review at the start (Rosenshine's first principle). Prerequisites go unchecked, which is exactly how the old trial's first gate tested an untaught prerequisite. The prerequisite graph exists and is unused |
| Science | The same `see` block | **Not solved** | The measure says science explains with a figure and rarely works a line. B2 alone needs 48 new See its. Forcing a working line onto "explain how antibodies work" produces a fake demonstration |
| Exam writing | Questions after the lesson | **Not solved** | CCEA science marks describe, explain and extended answers heavily. Only 71 extended-answer parts exist, and nothing teaches how a Level 3 answer is built |
| Length of a sitting | Adds See its, so decks grow | **Made worse** | The rebuilt trial deck is already 38 cards and about 21 minutes. Adding See its without stopping points lengthens a phone session at night |
| Knowing when she has learnt it | Stones on a later mixed success | **Unchanged** | One later correct answer, possibly a three-option guess, makes a topic Proficient (`mastery/engine.ts`) |

So v3 is a necessary first half, "I do" and a thin "you do". It is not the standard every topic should be written to. If v3 migrates 125 notes and v4 then needs a second pass, every note is opened twice. The better plan is to fold v3's decisions into v4 and migrate once.

---

## 4. Lesson standard v4: teach, show, guide, check, apply

**v4 in one sentence.** Every section teaches the idea with a picture and a non-example, shows it done in the form the exam rewards, guides her through a partly done copy, checks her by making her produce the answer, and re-teaches the specific error she made. Every sitting opens with a warm-up and ends at a real stopping point; every topic ends with one question in the paper's own form.

v4 keeps v3's decisions and the owner's eight answers:

- the See it grammar: steps, reasons, marks;
- re-teach before the answer;
- the twin before the recap;
- at most two short recall cards;
- "Now the questions";
- Skip to your turn on return visits.

It adds what the evidence says v3 is missing.

### 4.1 The principles, and where each lives

| Principle | Evidence (research 06) | In v4 |
| --- | --- | --- |
| Small steps, modelled, then guided, then independent | Rosenshine 2012; worked-example effect | Explain, See it, Try it with me, Your turn |
| Fade the guidance, last step first | Renkl et al. 2002 | Try it with me leaves the last step(s) to her |
| Produce, don't only recognise | Kang et al. 2007 (short answer with feedback beats multiple choice on delayed tests) | Your turn asks her to produce the answer by default |
| Explain the step to yourself | Bisra et al. 2018, g = 0.55 | One why-prompt in each See it |
| Feedback on the error she made | Wisniewski et al. 2020 (high-information feedback d = 0.99); Little and Bjork 2015; Marsh 2007 | Fix it: a re-teach of her misconception, before the answer |
| Examples and non-examples, one change at a time | Variation theory; Barton's Reflect, Expect, Check, Explain; SSDD problems | A contrast in every Explain; variation runs in H-band sections |
| Review before new material | Rosenshine's first principle | The warm-up |
| Spacing, interleaving, successive relearning | Cepeda 2008; Rohrer et al. 2020 (d = 0.83 in maths); Rawson et al. 2013 | The study loop between sittings |
| About 80% success in guided practice | Rosenshine | The first-try target for Your turn, measured |
| Format-matched practice, reading the scheme | Yang et al. 2021; Sanchez 2017 | Apply it; the extended-answer builder |
| Guidance fades as competence grows | Kalyuga 2007 (expertise reversal) | Skip to your turn; the opt-in "I learnt this in school" check |

### 4.2 A sitting: 10 to 15 minutes

1. **Warm-up (2 to 3 minutes, three items).** One or two reviews due from earlier topics, mixed across topics. Then one prerequisite probe, drawn from the topic's prerequisites (187 topics carry them). A miss on the probe opens a 60-second refresher card and schedules that prerequisite. From the second sitting of a topic, one item asks for the key idea from last time.
2. **Two or three sections**, as in 4.3.
3. **A stopping point.** "A good place to stop. Next time: sections 4 to 6." It shows what returns and when. A topic runs to one, two or three sittings, and the track says so.

At the end of a topic come the recap and "In the exam", then **Apply it** (4.5), at most two optional recall cards, and the close with "Now the questions".

### 4.3 A section: explain, see it, try it with me, your turn, fix it

- **Explain.** At most three cards and 225 words. Concept before procedure. The figure that *is* the idea. Where the idea has an edge, **one example and one non-example side by side**: "this cancels; this does not, and here is why". The trial topic already does this in "Why cancelling works, and when it does not". v4 makes it the rule.
- **See it.** A demonstration of the kind the content needs (4.4). Steps are revealed one at a time, each with its reason and the mark it earns.
  - **One self-explanation prompt** at the step that carries the idea. The reason is hidden, and she chooses it from three options: the right one and two plausible misconceptions from the library. Then the reason shows.
  - The prompts come from the worked examples' why-menus, which 420 of 489 already have.
- **Try it with me** (new). The same structure on new numbers: the worked example's twin or its first faded version. The early steps are shown and the last step is hers, typed.
  - Feedback puts her line beside the matching See it step.
  - All 489 worked examples already have the faded versions and the twin. This layer is mostly conversion, not writing.
- **Your turn.** A whole problem of the same kind, and **she produces the answer**: a typed number, expression, word or short sentence. The engine's numeric, algebraic and text markers already handle all of these.
  - Multiple choice stays only where the choice is the diagnosis: a hinge question in which every wrong option is a named misconception with its own re-teach.
  - The target is 70 to 90% right first time, measured on her record.
- **Fix it** (on a miss). Her answer is matched to a named misconception, by the option's tag or by the engine's common-error match, which it already does for typed answers.
  - She gets two or three lines on *that* error, with a contrasting mini-example. Then "Show me the answer", then the answer worked in steps.
  - The twin returns before the recap, and the miss is scheduled again for the next day. That is the spaced second exposure to the correction the research asks for.
- **Variation**, for H-band sections and any topic with disguises. Either a "same surface, different deep" pair (two questions that look alike and need different methods), or a run of three in which one thing changes and she is asked what changed.

### 4.4 Demonstrations of the right kind

The `see` block gains a `kind`, chosen by the command word the paper uses. This is the change that makes v4 work for science, where v3 would force a working line onto an explanation.

| Kind | For (CCEA command words) | See it | Try it with me | Your turn |
| --- | --- | --- | --- | --- |
| **calc** | Calculate, Find, Show that, Work out (maths, FM, physics and chemistry quantities) | Working lines, each with its reason and mark (M1, A1, MW1) | The last line blank; then the last two | Type the answer, with units where the scheme asks |
| **explain** | Explain, Describe, Suggest, Compare (biology, chemistry and physics theory) | *Build the answer.* The question decoded (the command word; the marks mean points), then the model answer assembled clause by clause, each clause on its marking point. A weak answer sits beside it, with why it loses marks | Choose the missing marking point, or put the clauses in order | Write one or two sentences, marked by key words (by AI too, once calibrated) |
| **process** | Sequences: the cardiac cycle, mitosis, electrolysis, the carbon cycle | A step diagram revealed stage by stage, each stage with its key term | Order the stages, or label the diagram | Order or label, then one "why" |
| **practical** | Unit 7 and the prescribed practicals | A method walkthrough: the aim; the independent, dependent and control variables; the apparatus, named and spelt; the safety; the results table; the graph; the conclusion; the evaluation (accuracy, reliability and precision kept apart) | Name the variables; spot the flaw in a method; complete a results table | Plan or evaluate a short method; plot a point; write the conclusion from data |
| **data** | Describe the trend, Use the data, Calculate the rate | Read it with me: the trend in words, with figures quoted and a gradient worked | The same on new data, half done | Describe a trend using the data; marked for the trend and a quoted value |
| **extended** | Six-mark and levels-of-response questions | Level 1, 2 and 3 answers side by side, with the indicative content ticked, and what lifts a 2 to a 3 | Plan from a points bank, then order the points | Write the answer. She marks it against the checklist; AI feedback once calibrated (section 2, item 5) |
| **derive** | Prove, Show that (FM1, M8) | Each line with its justification | Supply the missing justification | Write the next line |

### 4.5 Apply it: the paper's own form, once per topic

One exam-form question, with the paper's layout, tariff and command word, marked by the scheme and shown mark by mark. The examiners' report finding for that question type comes with it. This is where "can do it in the lesson" becomes "can score it on the paper". It is also the evidence the mastery rules below need.

### 4.6 Between sittings: the study loop

- **Tonight** is the warm-up and the reviews (FSRS, capped at 25 cards, mixed across topics, nearer papers first), then one sitting of a lesson, then a short practice set.
- **The practice pathway** on a topic moves through difficulty bands.
  - Two right in a row moves her up.
  - Two misses step down to a worked-example step and a twin (the programme's item 0.1).
  - Once she has learnt a topic, its practice is mixed with the rest of the unit and the problem type is not labelled. Interleaving is strongest in maths: Rohrer et al. 2020 found 61% against 37% a month later.
- **A review asks the skill, not the screen.** Today a review brings back the same gate, with the same options. In v4 it draws a *different* item of the same skill: the twin, a diagnostic, or a question. She then retrieves the method, not the look of the card.
- **Prerequisite credit**, a lighter form of Math Academy's "fractional implicit repetition".
  - A right answer on an advanced topic counts part of a review for its prerequisites, so they come back less often.
  - A miss on an advanced topic triggers a probe on its prerequisites.
  - The 341 links make this possible now.
- **"I learnt this in school": an opt-in check** of two minutes: three or four items she produces, taken from the topic's diagnostics.
  - If she passes, the topic goes straight to practice and review. The lesson stays open to her.
  - If she misses, the lesson starts, with her misses flagged.
  - Being opt-in respects her dislike of being tested before being taught. And the expertise-reversal evidence says a fluent learner should not have to sit through a lesson she knows.
- **Exam periods.**
  - Before each paper in her plan, exam mode tightens retention, which the scheduler already does. It also schedules mixed, timed sets and one full paper.
  - After each paper comes an exam wrapper: which marks were lost to knowledge, to method, to misreading the question, and to time. It feeds the next weeks.

### 4.7 Knowing she has learnt it: mastery v2

- **Proficient** needs right answers on at least two different items of the topic, in at least two sittings two or more days apart, and at least one of them produced, not chosen. Today one later right answer is enough, even a three-option guess.
- **Mastered** keeps today's rule: three spaced sessions and a predicted recall of 0.9 on the paper date. It adds one Apply-it question right.
- **Readiness for each paper.** Before each exam, each unit reads "ready", "nearly" or "not yet". The reading comes from the share of its topics at Proficient or better, weighted by the specification's marks, with the uncertainty stated.

### 4.8 How v4 is checked

- **Lints**, fatal unit by unit as each migration lands:
  - no check before its demonstration;
  - a demonstration of a declared kind in every teaching section;
  - a Try it with me in every procedural section;
  - at least 60% of Your turns produced, not chosen;
  - every multiple-choice wrong option tagged, with its re-teach;
  - a sitting of at most 15 minutes at the minute model;
  - a warm-up the graph can supply for every topic.
- **A teaching-quality rubric** scored by a second model on every section, with a teacher's sample on top. It asks:
  - Is the method correct to the scheme?
  - Is each step small enough?
  - Do the reasons say *why*?
  - Is there a non-example?
  - Is the re-teach specific to the error?
  - Is the reading age right for Year 11?
- **Her record.**
  - First-try success on Your turn of 70 to 90% in each section; a section outside that range goes to a repair queue.
  - At least 85% right on delayed reviews.
  - Apply-it success, unit by unit.
- **Playwright** for every new card:
  - See it reveals one step at a time;
  - Try it with me takes a typed step;
  - Your turn takes a produced answer;
  - Fix it comes before the answer;
  - the warm-up has its content;
  - the stopping point appears, and a reload resumes from it.

### 4.9 What it costs, and how to find out for sure

- **Content, per note.** Most of what v4 adds converts from what the bundles already hold: the faded versions, the twins, the why-menus, the misconception library. The new writing is the science demonstrations of the explain, process, practical and data kinds, and the Fix it lines for gates the library does not cover.
- **A rough estimate.** v4 adds one to one and a half agent-hours per note on top of v3's 220 hours for Year 12's 125 notes. That makes about 350 to 400 agent-hours for Year 12, as one pass. This is an estimate, not a measurement.
- **App work.** The cards (See it by kind, Try it with me, produced Your turns, Fix it), the warm-up, the stopping points, the practice pathway, reviews by skill, mastery v2 and the opt-in check. They can be built in stages; section 8 gives the order.
- **How to know.** Pilot v4 on three topics before any migration: the trial topic (calc); one B2 or C2 topic that is mostly explain and process; and one Unit 7 topic (practical), written straight to v4, since none exists. Measure the minutes per section and her first-try success, then extrapolate. Then the second sit-down with her.

---

## 5. Her devices and her data

**What she needs.**

- Her own laptop, iPad and iPhone, with one continuous history across all three from November to June and beyond.
- It keeps working without a signal.
- It survives a device being replaced or reset.
- You can prepare it on your machine as a surprise and hand it over.

**What exists today.**

- A static export, served from your laptop.
- All her progress in one browser's storage on one device.
- A manual JSON export and restore.
- A service worker that works only on HTTPS or localhost.

**What the storage audit found (27 September), which shapes the design.**

- **A merge can silently lose her data.** Five tables number their rows from 1 on each device: attempts, sessions, mocks, notes and reports. A restore in "merge" mode writes the file's rows over any row with the same number. A second device's backup would overwrite the first device's history. String-keyed rows take the file's copy even when it is older, deletions are not recorded, and mastery is not recomputed.
- **No review log is kept.** The scheduler returns one, and every caller throws it away. Many answers are stored without their grade. So her card states cannot be rebuilt by replaying what she did.
- **Diagnostic items share ids across topics.** The 1,596 diagnostic items use only 52 distinct ids ("01", "07" and so on), recorded without the topic. So one review card, and its confident-miss re-probes, is shared by every topic that has an item "07". This is a live scheduling bug, independent of sync.
- **Some of her state is not in the export at all.** It lives in the browser's localStorage: where she is in a Slides run, a paper in progress, "lesson finished" flags, a copy of her exam plan, the theme and the offline-copy choice.
- **Installing on iPhone and iPad needs one fix.** There is no apple-touch-icon PNG, so the Home Screen would show a snapshot of the page instead of the icon.
- **One small privacy untruth.** Video thumbnails load from YouTube's image server before she taps, while the on-screen note says nothing loads before play.
- **The size is small.** A year of her use is about 3 to 10 MB: 4,000 to 11,000 attempts and at most about 11,700 cards.

**The design.**

1. **A private HTTPS address.** The export deploys as it is to Vercel (`vercel.json` is ready) or to Cloudflare Pages, on each push. It is unlisted and marked noindex. If you want the site itself closed to strangers, put Cloudflare Access in front of it: a PIN is emailed to approved addresses, free up to 50 users. Her data is protected by her account either way.
2. **Installed on each device.**
   - iPhone and iPad: Safari, Share, Add to Home Screen.
   - Laptop: Chrome or Edge, Install; or Safari on a Mac, Add to Dock.
   - Installed, it opens full-screen and works offline.
   - The app then asks the browser for persistent storage (`navigator.storage.persist()`). WebKit's storage policy exempts a persistent origin from eviction, which answers the seven-day rule for Safari's stored data.
3. **Her account.** She signs in with a code sent to her email, so there is no password to forget, once per device. You are the only other account, as the administrator.
4. **Sync as an append-only log.**
   - First, three fixes the audit makes necessary:
     - globally unique ids on every table;
     - a review-log table that keeps every grade with its time;
     - diagnostic ids prefixed with their topic.
   - The device stays the working copy, so it is fast and works offline.
   - Every action is written as an event: an attempt, a review grade, a recall grade, a setting, a memory of the companion's. Each event carries a global id, the device and the time.
   - Sync sends new events up and brings the other devices' events down. Merging is a set union, so nothing is ever overwritten.
   - Card states (FSRS) and mastery are recomputed from the events in time order, identically on every device.
   - Settings use the last writer, key by key.
   - Why a log and not synced state: if her iPhone and her iPad both review the same card offline, overwriting the card's state loses one of the reviews. Replaying both, in order, keeps both. The log is also the backup, and it lets you audit her history.
5. **The service.** The recommendation is **Dexie Cloud**, built by the makers of Dexie, the database library Cairn already uses.
   - It adds sign-in by email code and offline-first sync.
   - Its free plan covers three users and 100 MB; her year is about 3 to 10 MB. Paid plans cost cents per user.
   - Its condition is keys that are globally unique strings, not numbers counted from 1. That is the same change the merge bug needs anyway.
   - Sync is switched on table by table.
   - **The fallback** is a small sync endpoint of our own on Cloudflare Workers with a D1 database, behind Cloudflare Access. It is free, and all ours, but it is more code to write and test. Supabase is a third option: Postgres with sign-in, but its free projects pause after a week without use.
6. **Privacy, now that data leaves the device.**
   - Keep it minimal: her email for sign-in, and nothing else identifying.
   - The provider encrypts it in transit and at rest.
   - No analytics and no advertising.
   - She can export and delete everything.
   - One short note to her says what is stored, where, and who can see it.

   It is a private family tool, so the legal bar is low. This is simply how a 16-year-old's data should be treated.
7. **Backups.** The synced log is the everyday backup. Keep the monthly JSON export to your own drive as a second copy. Move the localStorage state she would miss (the lesson-finished flags, the exam plan, a paper in progress) into the synced database.
8. **The handover.** Your testing data stays on your machine, and her account starts clean. You install Cairn on her three devices, she signs in once on each, and first run greets her.
9. **Updates.** Each push deploys, and the service worker updates on her next open. Her progress survives content changes because item ids are frozen (the depth standard's frozen surface).
10. **The server for AI.** Any AI feature needs a server to hold the key. The sync backend is where a marking endpoint can live later.

**When.** This must be live and tested before her first exam in November:

- the address, installing, and persistent storage: days;
- sync with its migration and tests: about one to two weeks of one app agent;
- then the handover.

---

## 6. Worked examples, and the CCEA textbooks

**Are there worked examples in the teaching slides, as in the CCEA books?** Partly, and not in the books' form.

- **The trial topic.** Its note, rebuilt on 25 September, teaches with short worked lines inside its paragraphs, for example: "So $16x^{2}-81=(4x+9)(4x-9)$, because $16x^{2}=(4x)^{2}$ and $81=9^{2}$", and "Take $\frac{2x^{2}-128}{x^{2}+17x+72}$. Top: … Bottom: … Strike $(x+8)$ …". Slides shows them as text on idea cards. They are real working, but compressed: no step-by-step reveal, no reason under each line, no mark beside it.
- **The step-by-step worked examples**, the textbook-style "Example 1, Example 2" with each step and its reason, are in every bundle: 489 of them, 3 to 5 steps each, every one with a twin and faded versions. They sit **after** the lesson, on the topic page's Examples stage. The Slides deck contains none of them.
- **The other notes.** In the 183 other notes, 518 of 1,052 sections have no demonstration at all (the teach-first measure).

v4's See it and Try it with me put one worked example and one faded version inside every section. That is the textbook's "example, then exercise", done on the screen.

**Were the CCEA textbooks studied?** No.

- **Catalogued only.** The market research lists them (`docs/research/04`, `05` and `09`): Colourpoint's *Further Mathematics for CCEA GCSE*, Hodder's *CCEA GCSE Double Award Science* with its *My Revision Notes*, and CGP's and Hodder's CCEA maths revision guides. None was read for content.
- **The sources the authors did use** are CCEA's specifications, past papers, mark schemes, chief examiner's reports and formula sheets.
- **A deliberate choice.** The authoring standard says a worked example's stem is "the paper's most recent shape of that variant, never a textbook one" (`pipeline/prompts/author-topic.md`). That is right for exam fidelity.
- **What was lost by it.**
  - Sequences refined by Northern Ireland teachers over years.
  - Graded exercises between the example and the exam question.
  - The notation and conventions her teachers use.
  - A second check that every content statement of the specification is covered.
  - The science books' practical activities and "test yourself" questions.

**What to do.**

1. **Buy the books her school uses, as eBooks where possible.** They are listed with links in section 7. Keep the files out of git, as the past papers already are (`docs/sources/` is gitignored for papers).
2. **Run a textbook alignment pass, topic by topic, beside the past-paper work.** For each topic, the agent reads the book's section and records:
   - content statements the book covers and the note does not;
   - worked-example variants the book shows and the bundle lacks;
   - the book's order of ideas, where it differs, and why;
   - notation and wording that differ from what her teachers will use;
   - practical activities (for Unit 7).

   The output is a gap list per topic, not text.
3. **Never copy.** Examples, explanations and figures are written new. The book is a reference for coverage, order and conventions. This keeps the platform clean on copyright even as a private tool, and keeps the shingle test meaningful.
4. **Ask her which books her teachers use.** It is the cheapest way to align Cairn with her classroom, and she will notice.

---

## 7. Books and sources

Every link below came from a web search on 27 September. This session's network policy blocked opening the pages themselves, so check each page before buying. The ones to buy first are marked **Buy**.

### 7.1 The CCEA textbooks and revision books

**Further Mathematics.** Colourpoint is the only print publisher found for CCEA Further Maths.

- **Buy.** *Further Mathematics for CCEA GCSE*, 2nd edition, Neill Hamilton and Sam Stevenson (Colourpoint, 2019, ISBN 9781780731919). It covers the whole course (Pure, Mechanics, Statistics) with theory and graded exercises: the benchmark for order and for how much practice each topic gets. https://colourpointeducational.com/further-mathematics-for-ccea-gcse-9781780731919/
- *Further Mathematics Revision Booklets for CCEA GCSE*, Neill Hamilton (Colourpoint). Each has five newly written tests with answers, a model for unit tests.
  - Pure 1: https://colourpointeducational.com/further-mathematics-revision-booklet-for-ccea-gcse-pure-maths-1-9781780733166/
  - Pure 2: https://colourpointeducational.com/further-mathematics-revision-booklet-for-ccea-gcse-pure-maths-2-9781780733173/
  - Mechanics: https://colourpointeducational.com/further-mathematics-revision-booklet-for-ccea-gcse-mechanics-9781780733180
  - Statistics: https://colourpointeducational.com/further-mathematics-revision-booklet-for-ccea-gcse-statistics-9781780733197

**Mathematics (M3, M4, M7, M8).** No single book covers the M4 and M8 route. Colourpoint's covers it in three parts.

- **Buy.** *Mathematics M3 and M7 for CCEA GCSE Level*, Luke Robinson and Sam Stevenson (Colourpoint, ISBN 9781780733883). https://colourpointeducational.com/mathematics-m3-and-m7-for-ccea-gcse-level/
- *Mathematics M4 Extension Book for CCEA GCSE Level* (Colourpoint, ISBN 9781780734071); no publisher page came up. https://timesbookshop.co.uk/mathematics-m4-extension-book-for-ccea-gcse-level-9781780734071/
- *Mathematics M8 Extension Book for CCEA GCSE Level* (Colourpoint). https://colourpointeducational.com/mathematics-m8-extension-book-for-ccea-gcse-level/
- *CCEA GCSE Mathematics Higher*, 2nd edition, Neill Hamilton and Anne Connolly (Hodder, 2017, ISBN 9781471889844), the full Higher course. https://www.hachettelearning.com/mathematics/ccea-gcse-mathematics-higher-for-2nd-edition
  - Its *Practice Book* (ISBN 9781471889929): https://www.hachettelearning.com/mathematics/ccea-gcse-mathematics-higher-practice-book-for-2nd-edition
- *CCEA GCSE Maths Revision Guide: Higher* (CGP, with an online edition; each topic tagged with its unit). https://www.cgpbooks.co.uk/secondary-books/gcse/maths/mcchr41-ccea-gcse-maths-revision-guide
  - The CGP *Exam Practice Workbook*: https://www.cgpbooks.co.uk/secondary-books/gcse/maths/mcchq41-ccea-gcse-maths-exam-practice
- *M3, M4, M7 and M8 Revision Booklets* (Colourpoint), newly written questions with answers and methods.
  - M3: https://colourpointeducational.com/m3-maths-revision-booklet-for-ccea-gcse-2-tier-specification-9781780731940/
  - M4: https://colourpointeducational.com/m4-maths-revision-booklet-for-ccea-gcse-2-tier-specification-9781780731957/
  - M7: https://colourpointeducational.com/m7-maths-revision-booklet-for-ccea-gcse-2-tier-specification-9781780731988/
  - M8: https://colourpointeducational.com/m8-maths-revision-booklet-for-ccea-gcse-2-tier-specification-9781780731995/

**Double Award Science.**

- **Buy.** *CCEA GCSE Double Award Science*, Boyd, Henry, McCauley, McFarland, Napier and White (Hodder, 2017, ISBN 9781471892189; also a Boost eBook). The core text for B1 to P2 at both tiers, with practicals, maths practice and exam-style questions. https://www.hachettelearning.com/science/ccea-gcse-double-award-science
- **Buy.** *My Revision Notes: CCEA GCSE Science Double Award*, McFarland, Napier and White (Hodder, 2018, ISBN 9781510404519). "Now test yourself", typical mistakes, exam practice. https://www.hachettelearning.com/science/my-revision-notes-ccea-gcse-science-double-award
  - Free answers: https://media.hachettelearning.com/media/medialibraries/hodder/answers-and-extras/science/9781510404519/404519-mrn-ccea-science-ep-answers.pdf
- *Biology, Chemistry and Physics Questions for CCEA GCSE* (Colourpoint; Napier, McFarland, White). Question banks that mark out the Double Award part of each science.
  - Biology: https://colourpointeducational.com/biology-questions-for-ccea-gcse-9781780731889/
  - Chemistry: https://colourpointeducational.com/chemistry-questions-for-ccea-gcse-9781780731896/
  - Physics: https://colourpointeducational.com/physics-questions-for-ccea-gcse-9781780731902/
- No Double Award workbook and no commercial Unit 7 book were found. CCEA's own practical manuals fill that gap (7.2).

### 7.2 CCEA's own materials: the most important sources for Unit 7

- **Buy nothing: the Unit 7 practical manuals.** They are the key source for Booklet A and the prescribed practicals, and for writing Unit 7 to v4.
  - Physics: https://ccea.org.uk/downloads/docs/Support/eGuide/2023/GCSE%20Double%20Award%20Science%20Physics:%20Unit%207%20Practical%20Manual.pdf
  - Chemistry: https://ccea.org.uk/downloads/docs/Support/eGuide/2023/GCSE%20Double%20Award%20Science%20Chemistry:%20Practical%20Manual.pdf
  - Biology: https://ccea.org.uk/downloads/docs/Support/eGuide/2024/GCSE%20Double%20Award%20Science%20Biology:%20Practical%20Manual.pdf
- **The subject pages**, with the specifications, past papers and mark schemes, the chief examiner's reports and the support materials:
  - Double Award Science: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017
  - Mathematics: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017
  - Further Mathematics: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017
- **CCEA's Topic Tracker**, past-paper questions sorted by topic: https://ccea.org.uk/learning-resources/topic-tracker
- **A warning.** CCEA removes papers older than five years. The index in `docs/sources/` should keep what the platform relies on.

### 7.3 Free banks to learn from, and to measure Cairn against

- **Eedi and Diagnostic Questions.** More than 28,000 maths questions, each wrong answer mapped to a misconception. Eedi's misconception map is published under CC BY 4.0. The model for Fix it and for tagging the gates. https://diagnosticquestions.com/Quizzes/GCSE · https://www.eedi.com/
- **BEST (University of York).** Science diagnostic questions and progression toolkits for ages 11 to 16, CC BY-NC. Use them for science misconceptions and for checking prerequisites. https://www.york.ac.uk/education/research/uyseg/research-projects/bestevidencescienceteaching/
- **IOP Spark.** Physics misconceptions, with diagnostic questions: https://spark.iop.org/misconceptions
- **The RSC.** Keith Taber's chemical misconceptions: https://edu.rsc.org/resources/chemical-misconceptions/1967.article. Practical videos for ages 14 to 16, with pause-and-think questions: https://edu.rsc.org/practical/practical-videos-14-16-years/4012090.article
- **The NCETM's secondary mastery materials.** Representations and key concepts; useful for the maths prerequisites. https://www.ncetm.org.uk/teaching-for-mastery/mastery-materials/secondary-mastery-professional-development/
- **Isaac Physics** (now Isaac Science). GCSE calculation practice by topic and difficulty, for P1, P2 and FM2. https://isaacscience.org/physics/gcse
- **Corbettmaths.** CCEA practice papers, M4 and M8 revision, and 5-a-day mixed practice, including Further Maths: a model for the warm-up. https://corbettmaths.com/5-a-day/gcse/ · https://corbettmaths.com/5-a-day/further-maths/
- **DrFrostMaths.** Generators that make endless variations of a question: a model for twins. https://www.drfrost.org/

### 7.4 The books that should shape how Cairn teaches

- **Buy.** *The Math Academy Way*, Justin Skycak (free working draft). The closest existing blueprint for Cairn's loop: mastery on a knowledge graph, spaced review with implicit repetition, interleaving, all automated. https://www.justinmath.com/files/the-math-academy-way.pdf
- **Buy.** Craig Barton, *How I Wish I'd Taught Maths* (John Catt, 2018) and *Reflect, Expect, Check, Explain* (John Catt, 2020). The first covers example and your turn, and diagnostic questions; the second, variation and sequences in which one thing changes at a time.
  - https://www.amazon.co.uk/How-Wish-Taught-Maths-conversations/dp/1911382497
  - https://www.amazon.co.uk/Reflect-Expect-Check-Explain-mathematical/dp/1912906341
- **Buy.** Adam Boxer, *Teaching Secondary Science: A Complete Guide* (John Catt, 2021). Explicit instruction, models and practicals, subject by subject: the science half of v4. https://www.johncattbookshop.com/products/teaching-secondary-science-a-complete-guide
- Rosenshine, "Principles of Instruction" (*American Educator*, 2012), the lesson skeleton. https://www.aft.org/sites/default/files/Rosenshine.pdf
- Pashler et al., *Organizing Instruction and Study to Improve Student Learning* (IES practice guide, 2007). Seven recommendations, including alternating worked examples with problems, and quizzing. https://ies.ed.gov/ncee/wwc/PracticeGuide/1
- The EEF's guidance reports, on maths at Key Stages 2 and 3, secondary science, metacognition and feedback. https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3 · https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/science-ks3-ks4
- Rawson and Dunlosky, successive relearning (2022). The model for the review loop. https://journals.sagepub.com/doi/full/10.1177/09637214221100484
- Renkl on worked examples and self-explanation (*Cognitive Science*, 2014): https://onlinelibrary.wiley.com/doi/full/10.1111/cogs.12086. Kalyuga et al. on the expertise reversal effect (2003): https://www.tandfonline.com/doi/abs/10.1207/S15326985EP3801_4
- Dylan Wiliam, *Embedded Formative Assessment* (2nd edition), on hinge questions. https://www.solutiontree.com/embedded-formative-assessment-second-ed.html
- Kirschner and Hendrick, *How Learning Happens* (2nd edition, 2024). https://www.routledge.com/How-Learning-Happens-Seminal-Works-in-Educational-Psychology-and-What-They-Mean-in-Practice/Kirschner-Hendrick/p/book/9781032498393
- Mayer, *Multimedia Learning* (3rd edition, 2020), the screen-design principles. https://www.cambridge.org/highereducation/books/multimedia-learning/FB7E79A165D24D47CEACEB4D2C426ECD
- The open-spaced-repetition project (FSRS), the scheduler Cairn already runs. https://github.com/open-spaced-repetition

**Licences.** Learn from these; copy nothing, except under the source's licence:

- BEST: non-commercial, CC BY-NC.
- Eedi's misconception map: attribution, CC BY 4.0.

---

## 8. What to decide, and the order to do it

| # | Decision | Recommendation | Why now |
| --- | --- | --- | --- |
| 1 | Access across her devices | A private HTTPS address; the app installed on her laptop, iPad and iPhone; her own account with email-code sign-in; history synced as an append-only log (Dexie Cloud first, a Cloudflare sync endpoint as the fallback) | It must be live and tested before her first exams in November. Everything else she does builds a history worth keeping |
| 2 | v3 or v4 | Fold v3's eight answers into v4 and migrate once. Pilot v4 on three topics (the trial topic; one B2 or C2 explain-and-process topic; one Unit 7 topic written new), then sit down with her | A v3 migration followed by a v4 pass opens 125 notes twice |
| 3 | The eight teach-first answers | As in the advisory, with one change: Your turn produces the answer by default. Question 2 stands: the twin comes before the recap, and the miss returns the next day | v4 inherits them |
| 4 | The CCEA textbooks | Buy the books her school uses (section 7) and run the alignment pass; never copy | It gives coverage and her teachers' conventions for the cost of four books |
| 5 | AI marking of written answers | A pilot after sync is live: offline calibration first, with Claude (`claude-opus-5`) scoring labelled answers through the Batch API against the cached mark scheme. It goes live only above the agreement threshold, and it shows a suggested mark with the scheme's points, never a hidden verdict | 1,404 text parts and all six-mark science answers are where the key-word marker is weakest |
| 6 | A view for you | A read-only Fortnight view you can open with her agreement: topics, retention, readiness per paper | Sync makes it possible; her consent makes it right |
| 7 | Her exam entries | Confirm which units she sits in November, February or March, and May or June | Exam mode, the queue and readiness run from these dates |
| 8 | The defects in 1a | Fix them now, before build 10 | Her reviews and her stones must be right from her first night |

**The order, from the Sunday reset:**

1. **Build 9** as prepared, then the second sit-down with her on the trial topic.
2. **Access and sync:** the private address, installing on the devices, persistent storage, the account, and sync with its tests. This goes in parallel with item 3; it is app work, not content.
3. **Content, in order:**
   - the three repairs (B2 D, FM3, C2 D);
   - Unit 7's brief, written as v4;
   - the v4 pilot on three topics;
   - the sit-down;
   - then the Year 12 migration, unit by unit, with each unit's Slides and Read roll-out right after its pass;
   - the remaining Year 12 topics, written to v4.
4. **App features, in value order:**
   1. Try it with me, produced Your turns, and Fix it (the pilot needs them);
   2. the warm-up and the stopping points;
   3. reviews by skill and the practice pathway;
   4. mastery v2 and readiness per paper;
   5. the opt-in "I learnt this in school" check;
   6. the exam wrapper;
   7. the extended-answer builder, and the AI marking pilot.
5. **Year 11, from November.** C1's 23 and P1's 20, written to v4 from the start.
