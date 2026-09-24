# Teach first: lesson structure v3 for Slides and Read

A design case for the owner's approval. 24 to 25 September 2026, written by the teach-first agent (Fable) under STANDARDS.md and decision 14 (no feature without a studied case). It turns the owner's two rulings of 24 September into a lesson structure, with the evidence, the comparison with the best platforms, the exact changes to the card grammar, the authoring standard and the lint, the migration measured over every note, an acceptance list, and the questions only the owner can answer. Nothing under src/, app/, packs/, pipeline/ or scripts/ was edited for this case.

The visuals, on the phone (390 x 844) and the desktop (1280 x 800), light, in design v2's own tokens and drawings: **https://claude.ai/artifact/DnkVejs8sZBCjD52QFQ9hC** (the trial topic's first section restructured: the idea card, the "See it" card with its steps, the "Your turn" card, a miss with its re-teach card and then the answer, a short optional recall card with Skip, and the whole deck's new shape as a strip beside the current 25-card shape).

What was read in full before a word was written: STANDARDS.md and its 24 September addendum; PLATFORM-PROGRAMME.md; DIRECTIVE-2.md; FEATURE-CASES.md; docs/design/2026-09-23-art-direction-v2.md; docs/plan/review/2026-09-23-benchmarks.md (all nineteen pages); docs/plan/review/2026-09-22-depth-standard.md; pipeline/prompts/author-topic.md (template v2 and the whole depth standard, including tonight's "Teach before you check" subsection); docs/plan/review/2026-09-13-learner-experience-review.md; docs/research/06 and 07; docs/plan/review/2026-09-23-slides-trial.md; the trial topic's note.blocks.json and bundle.json; src/lib/slides/cards.ts; scripts/qa/teach-show-check.mjs and prompt-few.mjs; the audit's 43 learning-design and content-truth findings (unverified); the design-v2 STATE and the whole mockups-v2 generator. The deck was walked at build 7 with a headless Playwright script of this agent's own (52 screenshots and every card's text under scratchpad/platform/teach-first/deck/). The sources fetched for this case are listed at the end with what each says.

---

## 1. The decision, in five lines

1. Every teaching section becomes **explain, then see it, then your turn**: the idea in words with its figure, then the maths worked in front of her one step at a time with the reason under each step and the mark it earns, then one check she can answer from what she has just seen. No check comes before its section has explained and shown.
2. A miss **re-teaches before it marks**: the explanation again in other words, with the figure's consequence, then the answer with one line about her own choice; the missed check comes back before the recap on new numbers where the gate has them.
3. The **questions proper** (practice, exam-style, find-the-mistake) come after the teaching as a distinct part, reached from the close card's first button.
4. **Retrieval prompts** are optional, at most two per deck, each a short recall (an answer of about twelve words; the lint's cap is 25), with a Skip; a skipped card is never scheduled. Longer prompts move to the recap, the Sheet's traps or the flashcards deck.
5. It costs about **220 agent-hours for her Year 12 units** (125 notes) and 80 more for Year 11, mostly writing the 195 demonstrations no worked example can supply; 323 of the 518 missing demonstrations can be converted from a worked example the bundle already holds.

---

## 2. What she said, and what the deck does today

**The rulings.** At 19:20 on 24 September: the Slides way is much better than the page, but a run of questions without proper explanation is not a lesson; a teacher would start by teaching the topic and making the student understand, and then the questions follow. At 23:40, after trying the trial topic: Slides is much better than the scroll, more fun and good; the last four retrieval prompts do not have to be four, they are sometimes more hassle, like writing an essay rather than remembering; most correct answers are option A; a purple focus rectangle. Closing words: make this the ultra best CCEA GCSE learning platform in all aspects, no slop, no rushed work, nothing not well studied.

**What she disliked on 13 September** (docs/plan/review/2026-09-13-learner-experience-review.md §1): being tested before being taught (the pre-check that locked the topic), paper-only questions, and topics "not well structured, intense or attractive for someone learning the topic for the first time". The review's §2 already set the rule: idea and picture, then a fully worked example, then completion problems, then unaided problems, with instruction never withheld. Tonight's ruling is that rule applied to the Slides deck, where it had not been.

**The deck she used (build 7, fm1/algebraic-fractions-simplify), card by card.** Twenty-five cards, twenty-six with the retry: title; idea (the hook); **gate g1** ("One tap to start. What is x² − 9 as a product of two brackets?"); idea; idea; **gate g2** ("In (x + 4)/x, what cancels?"); idea; **gate g7** (the cubic's first line); idea; the figure she acts on; **gate g3** (4x² − 25 factorised); the video; **gate g4** (simplify a quotient of two quadratics); idea; the examiner card; **gate g5**; the why card; **gate g6**; the retry of g2; recap; pointer; four recall cards; the close.

Measured against the ruling: six of the seven checks come before anything in their section has been worked in front of her; the Corbettmaths video (card 12) is the only demonstration in the deck, and it is other people's, timed at 5 min 41 s and counted at zero in the "About 11 minutes" promise (audit LD-03). The note holds no worked line at all: both worked examples with their step-by-step reasons sit in the bundle, after the lesson. The first thing she is asked, g1, is a prerequisite (the difference of two squares) that no card has taught; the depth standard calls it the trivially easy first gate that teaches the interface, and she experiences it as a test. The four recall cards ask for answers of 28, 25, 40 and 44 words (rp.01, .03, .04, .06): a numbered procedure, a definition with its reason, and two examiner anecdotes. That is the essay she named. The retry before the recap is the identical question in the identical option order (audit LD-12), and a miss on g1, g3, g6 or g7 is answered with the same sentence as a hit, which never mentions her option (LD-22).

**The trial in one number.** Seven checks and four recall cards on twenty-five cards: eleven asks, zero demonstrations of our own. Rosenshine's most effective mathematics teachers spent 23 of a 40-minute period presenting, demonstrating, questioning and working examples, the least effective 11 minutes, and the difference was spent on "additional explanations, give many examples, check for student understanding" (Rosenshine 2012, p. 13). The deck is built the second way.

---

## 3. The vision, in her terms

She opens a topic on her phone at night. The first cards tell her what the idea is and why it works, with a picture that is the idea. Then a card says **See it**, and the maths is done in front of her one line at a time: she presses Continue, the next line appears, and under it the reason, and beside it the mark that line earns on her paper. Then a card says **Your turn**, and it asks one thing she has just watched being done. If she gets it, "Yes." and on. If she misses, the card does not mark her: it says "Not quite", shows her what she chose, explains the idea again in other words with the picture, and only then shows the answer and why her choice was not it. The check comes back before the recap, on new numbers. After the recap and "In the exam", one or two recall cards ask a short question she can answer in a breath, and she can skip them. Then the close says "Now the questions", and the questions are the paper's own.

Why she needs this: because it is how she is taught in school, and it is what she asked for on 13 September and again tonight. How it is different: no revision app teaches CCEA's method line by line with the mark on each line and then re-teaches a miss before it marks it. How it helps: the check tests what was just shown, so a miss means a real gap, and the re-teach closes it there. Why it is worth her time: fewer asks, none of them unfair, and the time goes into the maths.

---

## 4. The evidence

### 4.1 How a good teacher runs a lesson

Rosenshine's ten principles of instruction, from the research on the most effective teachers (Rosenshine 2012, the AFT article read in full): begin with a short review; **present new material in small steps with student practice after each step**; ask many questions and check all responses; **provide models** (modelling and worked examples, "a step-by-step demonstration of how to perform a task"); **guide student practice**; check for understanding; **obtain a high success rate**, about 80 per cent, because "practice can be a disaster if students are practicing errors"; provide scaffolds; require independent practice; weekly and monthly review. His classroom finding is the one this case rests on: the more effective teachers "did not overwhelm their students by presenting too much new material at once", and they spent more time presenting and guiding before independent work, so that "the students were better prepared for the independent practice", while the less effective teachers "gave much shorter presentations and explanations, and then passed out worksheets".

The gradual release of responsibility (Pearson and Gallagher 1983) is the same shape as a model: responsibility for the thinking moves from the teacher to the learner, modelling first, guided practice next, independent practice last. "I do, we do, you do" is Archer and Hughes's (2011) three-word summary of it; Fisher and Frey (2008) made it four phases. In v3: See it is "I do"; Your turn, answered from the steps just shown and re-taught on a miss, is "we do"; the questions proper are "you do".

The worked-example effect (Sweller and Cooper 1985; van Gog, Kester and Paas 2011): for a novice, studying a worked example before solving beats solving first, and example-problem pairs beat problem-example pairs. Renkl et al. (2002): faded examples beat plain pairs, and backward fading (hide the last step first) beats forward fading. Kalyuga et al. (2003), the expertise reversal effect: the same worked example loses its value and can harm once the learner is fluent, so guidance must fade with competence. Craig Barton's "example and your turn": a worked example, then a structurally identical problem with new numbers, then self-explanation (mrsmahoney.co.uk, read). All of this is already in research 06 §6 and the 13 September review §2; what v3 does is put it inside the note, where she reads, rather than in the bundle after it.

### 4.2 When a question teaches, and when it is a test

Retrieval practice is the best-evidenced technique in the file (Adesope, Trevisan and Sundararajan 2017, g = 0.51 against restudy across 272 effects; Yang et al. 2021, g = 0.50 across 222 classroom studies). It is retrieval of something learned. A gate after a See it is retrieval; a gate before it is a guess.

Pretesting is real: Richland, Kornell and Kao (2009) found that an unsuccessful attempt before reading improved recall of the pretested facts; Pan and Sana (2021, n = 1,573) found pretesting beat post-testing; Mera, Dianova and Marin-Garcia (2025) found the benefit survives delayed feedback but is larger with immediate feedback (d = 1.24 against 0.82), on weakly related word pairs with university students, and say generalisation "remains uncertain". Brilliant builds on it ("we pretest on the material, letting the learner try to find a solution before learning the procedure"), and Kinnu's own experiments found a preview of questions before an orb raised its measure by about 70 per cent; but Kinnu's preview questions are ones "you don't need to answer". The boundary that matters for her: the benefit is for the specific item, it needs the answer to follow at once, and it is measured on adults who chose the test. She is sixteen, told us twice that a question before the teaching feels like a test, and the pre-check was the thing she disliked most on 13 September. So v3 keeps what pretesting gives without the test: the title card and the first idea card say what she will be able to do (the "can" lines) and the recap says what she now can, which is Kinnu's preview-and-summary pair without an answer demanded; and the only question before a demonstration is none.

Interpolated questions in a video cut mind-wandering and raise retention (Szpunar, Khan and Schacter 2013); watching alone inflates confidence without skill, and one attempt punctures the illusion (Kardas and O'Brien 2018). So the video keeps its Your turn straight after it, and the video is never the only See it of a topic, because it cannot go offline and cannot carry CCEA's mark codes.

### 4.3 What a miss should do

Feedback is worth d = 0.48 on average and d = 0.99 when it carries task, process and self-regulation information, against 0.24 for a tick or a cross; about a third of feedback interventions harm (Wisniewski, Zierer and Hattie 2020; Kluger and DeNisi 1996). A miss that only marks is the 0.24 kind. A miss that explains again in other words, points at the step, shows the consequence and then the answer is the 0.99 kind. Errors made with confidence are corrected best when the correction lands on the formed expectation (Butterfield and Metcalfe 2001; Butler, Fazio and Marsh 2011), which is why the re-teach comes straight after her choice and before the answer, not after it. Self-explanation, g = 0.55 (Bisra et al. 2018), is what the "because" under every step and the why-menu already ask for; the re-teach card is the same move in the other direction: the explanation restated, pointing at the line she needed.

The retry before the recap is Duolingo's mistakes-at-the-end and the benchmarks' H8; the audit found the trial's retry recognisable by position. Under v3 a retry uses the gate's twin (same structure, new numbers) where one is authored, and re-seeds the option order where not, so that "held" means retrieval and not recognition.

### 4.4 Retrieval prompts: how many, how short

Adesope 2017: a single practice test was at least as effective as several; multiple-choice g = 0.70 against short answer 0.48 without feedback. Kang, McDermott and Roediger 2007: with corrective feedback, short-answer initial tests gave slightly more benefit than multiple choice on a delayed test; without feedback, multiple choice did. Rawson, Dunlosky and Sciartelli 2013 (successive relearning): the gain comes from retrieving to criterion once per session across spaced sessions, not from many prompts in one sitting; a criterion of one correct recall per session works. Matuschak's prompt properties (andymatuschak.org/prompts, read): focused, precise, consistent, tractable, effortful; Quantum Country's early prompts are deliberately trivial to teach the interface. Kinnu's experiments: writing your own short answer beat selecting from options (+66 per cent on their measure). Research 06 §7.4: "keep prompts short; long open-ended writing on a screen is a compliance risk for a 15-year-old". Her own words: an essay, not remembering.

The measurement (§10) says where the notes stand: 862 prompt blocks across 184 notes, a median of four per note, answers of a median 21 words, 267 of them over 25 words and 36 over 40. The scheduler, not the count, does the work of retention (research 06 §3 and §4); so the deck can carry one or two and the review inbox the rest, on their own days.

---

## 5. How the best platforms sequence explanation and questions

| Platform | The order inside a lesson | Recall | What we take | What we refuse | Source |
|---|---|---|---|---|---|
| **Math Academy** | "Each lesson begins with a tutorial that introduces a new concept"; "every knowledge point starts with a fully worked out example"; then "a series of up to 5 practice problems"; two right in a row moves on, otherwise more problems; lessons "highly scaffolded into knowledge points so that each next step in the process is very small" | none inside the lesson; spaced review as separate tasks | The order, exactly: explain, worked example, then problems; the small step | XP as effort minutes; more problems as the answer to a miss (ours re-teaches first) | mathacademy.com/how-it-works, read 25 Sep |
| **Khan Academy** | a unit is videos and articles, then practice exercises of 4 to 7 questions, quizzes of at least 5, a unit test of at least 9; mastery levels change on the practice | none | Teach, then practise, then a quiz over the unit (the practice agent's Unit check) | Video as the only explanation; the hint that reveals a step at the cost of the mark | Khan help centre (snippets, blocked to fetch), 25 Sep; research 07 §2.3 |
| **Kinnu** | a preview of questions "you don't need to answer", a short read (about two minutes), bullet summary, then multiple-choice questions to move on | Memory Shield brings orbs back; a memory prediction per orb | The preview as a promise (the "can" lines), the summary as the recap; the read-then-check rhythm; open answers over multiple choice | Trivia prompts; a lock on a wrong answer; multiple choice as the only check | kinnu.xyz experiments post, read 25 Sep; Nibble review (third party); benchmarks page 3 |
| **Brilliant** | "we pretest on the material, letting the learner try to find a solution before learning the procedure"; one concept per lesson; intuition from visuals and manipulation, then similar problems, then harder ones; instant custom feedback | none | The figure to act on inside See it and Your turn; the consequence drawn on a miss | Question-first for a first-timer (adults who chose the course; she told us it feels like a test) | brilliant.org/about, read 25 Sep; research 07 §2.1 |
| **Duolingo** | implicit learning by doing: exercises first, patterns noticed from exposure, "optional hints and bite-sized explanations"; explicit rules in guidebooks and tips after a mistake; Duolingo Math opens a lesson "straight into a short exercise, not a lecture" | practice tab re-drills mistakes | The screen discipline (one thing per card, one control, the feedback state) | Practice-first for a CCEA method: it suits vocabulary and sentence patterns, where thousands of exposures build instinct, not a method whose marks are locked to named lines ("using calculus", MW1 for the factorisation) | blog.duolingo.com/duolingo-teaching-method and /what-is-implicit-learning, read 25 Sep; Tech & Learning on Duolingo Math (third party) |
| **Anki / Gizmo** | no teaching; a question, a reveal, a grade with the return shown (Anki); five question formats, hearts and XP (Gizmo) | the whole product | Short recall with the return day on each button; the typed key-word cloze | Hearts, speed XP, leagues | Anki manual; benchmarks page 15 |

**Where Cairn will be better.** Math Academy is the nearest to v3 and it is the model for the order; Cairn adds what none of them has: the demonstration is CCEA's own method with the mark each line earns, the check is the paper's shape, a miss is re-taught with the figure before it is marked, the examiner's finding sits in the section as the reason for the last step, the recall is optional and short, the questions after the teaching are exam-form and scheme-marked, nothing is sold or gated, and every answer is one record across Slides, Read and the review inbox. Where Cairn is honestly behind and stays behind for now: Brilliant's reacting diagram on every screen (ours reacts on the figure-to-act-on and on the re-teach card only), and Math Academy's automatic step-down to more problems (ours is the twin, offered by hand).

---

## 6. Lesson structure v3

### 6.1 The topic opening

Title card (as now: the locator, the display title, the lede, the honest length with the video's minutes stated, the three "can" lines, Start). Then the first section, which teaches fully before anything is asked: one to three idea cards (the hook, the idea, the figure on its stage), a See it card, and only then the first Your turn. The trivially easy first gate stays trivially easy, but it comes after the first See it, and it asks for what the steps showed.

### 6.2 A teaching section: explain, see it, your turn

- **Explain**: one to three idea cards of at most 75 words each (at most 225 words in all), the figure on its stage where the idea is visual, a titled why, mustknow or examiner callout as its own card where the section has one. Concept before procedure; every method step with its reason.
- **See it**: one card. The method carried out on one example in two to six steps. Each step is a working line, the reason under it (12 px below the line, 20 px below the pair, the §8.4 rhythm), and the mark it earns on the paper where it earns one (MW1, M1, A1 in the subject's language). Steps appear one per Continue; a step already shown stays on the card; the control becomes "Your turn" on the last step. The example is the paper's most recent routine shape of the section's variant. A video or a sim may stand beside a See it, never instead of it, because it cannot go offline and cannot carry the marks. Under reduced motion every step renders at once.
- **Your turn**: one gate that asks for what the steps just showed: a choice, a number or a blank, the stem-maths-answer rhythm of §8.4, the control "Check". A section that showed two variants may end in two Your turns, labelled 1 of 2 and 2 of 2. The eyebrow reads "n · Your turn" where it reads "Check" today; the foot reads "Answer from what you just saw. If you miss, it is taught again first" and no longer "Nothing here is scored" (audit LD-19).

### 6.3 A miss: re-teach, then the answer; the retry before the recap

On "Check" with a miss, the card does not show the answer. It moves to the **Re-teach card**: the verdict word "Not quite." in ink at 21 px (the honest signal first), her choice in a line ("You chose: the x, leaving 4", the circle-dash glyph, never red), the section's explanation again in other words (the gate's `explain`, rewritten to re-teach: at most 60 words), the figure's consequence where the gate has one (the substitution tiles; the wrong bar; the wrong line), a pointer to the step ("This is step 4 of See it"), and one control, "Show me the answer". Then the **answer state** on the Your turn card as design v2 draws it: her option edged in ink, the right option lit in fern with its tick, the answer line at 21 px, one line of diagnosis that names her option (LD-22), and "Recorded. It comes back before the recap on new numbers, and in your reviews with this figure." The first answer is the record; nothing about the re-teach is recorded. On a hit, "Yes." and the explanation as today.

The retry before the recap keeps Duolingo's placement and becomes a lesson: it asks the gate's **twin** where the note carries one (a new optional field beside the gate: the same structure, new numbers, its own answer), and where it does not, the same gate with the option order re-seeded so the right answer is not where it was. A miss on the retry shows the answer with the diagnosis and offers "Practise this" on the close; it never says "a miss comes back before the recap" (LD-18).

### 6.4 The recap and the pointer

Unchanged in shape: "You can now" with a glyph per line, then "In the exam" (the tariff and the command word from the papers; the trial's pointer needs the audit's correction, CT-02). The recap is where a numbered procedure lives; it is not a recall prompt.

### 6.5 The questions proper, after the teaching

The close card's first control becomes **"Now the questions"** (accent) on a first pass, with "Done for tonight" as the outline, and it lands on the first practice question with its field focused (the topic-fixes agent's #practice item). The questions run in the order the classroom uses: the ladder (one per screen, as QuestionRunner draws it), the find-the-mistake item, the post-check with confidence ("Check yourself"), then the exam-style set sat as a paper on its own day (the depth standard's "sit" minutes). Whether the questions run inside the Slides frame as a second part of the same deck, or on the topic page's Practice stage, is the owner's first question in §12: the first costs a renderer; the second is a link that is being fixed tonight.

### 6.6 The rhythm

No card count decides where a check goes. A section is at most three explanation cards, one See it and one Your turn (two where two variants were shown), so the longest run without a check is five cards and about three minutes at the minute model; a longer run is a section that needs splitting, never a gate that needs adding. Today's ceiling of four cards and the fatal 120-word rule (which the pipeline agent flagged tonight as forcing a gate every 120 words) both go; §8.3 gives the replacement text. Rosenshine's 80 per cent is the target success rate on Your turns, and the lint reports each unit's rate from the record once there is one.

### 6.7 The expert's way through

Expertise reversal says a fluent learner should not be made to sit through every See it. v3 adds one quiet control on a See it card, "Skip to your turn", which reveals every step at once and moves on; nothing is recorded for the skip. Whether it exists on a first pass is the owner's fifth question in §12.

---

## 7. Retrieval prompts: the decision

- **How many.** At most two per deck, and none where the note has no fact worth carrying; never four by habit. After the pointer, before the close.
- **Which kinds.** A short recall she can answer in a breath: a must-know formula or identity (a² − b²); the key word or phrase the mark scheme rewards; the first line to write for a method; or one value (simplify one small fraction). Never a numbered procedure (that is the recap), never an examiner's finding (that is the Sheet's trap), never an explanation longer than a line (that is the why card or a Your turn).
- **"Short" in words.** The question at most 15 words. The answer at most 12 words as the target, 25 as the hard cap the lint already enforces (scripts/qa/prompt-few.mjs, ANSWER_WORDS 25). A fraction or a formula counts as one word.
- **Optional, on screen.** The eyebrow reads "Recall · optional · 1 of 2". One-line field "Type it, or say it in your head"; the accent control "Show the answer"; a quiet "Skip this card" beside it; the foot says a skipped card is not scheduled. After the reveal her typed words stay on the card beside the answer (audit LD-06), the key words the scheme rewards are named, and the three grades say their real return days (Again, Good and Easy must differ, LD-07). A skipped card records nothing and creates no review card; an answered one is graded by her as today.
- **Where the long prompts go.** A procedure becomes recap lines. An examiner anecdote becomes the Sheet's trap with the series. A definition with its reason splits into the key-word prompt and a why line in the section. A worked shape becomes a flashcard of the typed key-word kind (benchmarks page 15, Gizmo's cloze). The bundle keeps its prompt bank for the flashcards deck and the review inbox; no prompt over 25 words stays in it, and a prompt she never met in the lesson is never scheduled from the lesson.
- **The trial topic.** rp.02 ("a² − b² as a product of two brackets?", six words) and rp.04 cut to "After the brackets, what is the last check before the answer line?" with the answer "The numbers: no numerical factor left on both lines" (nine words); the Summer 2024 sentence in it goes to the trap. rp.01 (the three moves, 28 words) becomes the recap it already is; rp.03 (factor against term, 25 words) becomes the why card's own line; rp.06 (44 words, the cubic anecdote, which CT-05 says is not on the papers) is withdrawn from the note.

The measurement: 862 embedded prompts become at most 368 (two per note); 267 answers over 25 words are trimmed or moved in the same pass; the lint already reports both.

---

## 8. What changes, exactly

### 8.1 The Slides card grammar (art direction v2 §8.1)

New and changed rows; every other row stands.

| Card | Top | Body | The one control | What colour says |
|---|---|---|---|---|
| See it | the track; "n · See it" | the stem with its maths on its own line; the steps, one revealed per Continue, each a working line at 21 px (24 on desktop), its reason under it in ink-2, its mark as a chip on the right; unrevealed steps as numbered ghosts | Continue, then "Your turn" on the last step (a quiet "Skip to your turn" if the owner says yes) | the step number fills in the accent on the current step; nothing else |
| Your turn (was Gate) | "n · Your turn" | as the Gate row: the question at 20 px Literata 600 on a white object, three 52 px options or a field, the §8.4 rhythm | Check | selection is ink |
| Re-teach (new, after a miss) | "n · Once more, in other words" | "Not quite." at 21 px in ink; "You chose: …" with the circle-dash; the explanation again in other words; the figure's consequence on its stage; "This is step k of See it" | Show me the answer | ink says not yet; nothing is red; nothing is lit yet |
| Your turn, the answer (was Gate, a miss) | as Your turn | her option edged in ink, the right option lit in fern with a tick; the answer line at 21 px; one line of diagnosis naming her option; "Recorded. It comes back before the recap on new numbers, and in your reviews with this figure" | Continue | fern shows which was right |
| Retry (before the recap) | "n · Once more" | the gate's twin, or the same gate re-seeded | Check | as Your turn |
| Recall (optional) | "Recall · optional · k of 2" | the question at 22 px; a one-line field; after the reveal her words beside the answer and the key words | Show the answer; a quiet Skip | the grades are unaccented; each says its return day |
| Close | the evening scene | as now, plus "Now the questions" as the first control on a first pass | Now the questions (accent), Done for tonight (outline) | unchanged |

§8.4 gains one line: on a See it card a step line has 12 px above its reason and 20 px below the pair (already the rule for worked examples), and the mark chip is Inter 12 px 600 on the recess surface. The title card's promise line counts See its and Your turns ("About 14 minutes · 26 cards · 7 your turns · 4 see its · a 6-minute video"). The segmented track counts the re-teach card as part of its Your turn, not as a card.

### 8.2 Read v2

The same three parts in the same order on the page: the section's prose, then the See it as a step-reveal block (each step revealed by a tap on "Next step", every step shown under reduced motion), then the gate labelled "Your turn" with the same object and states as Slides. A miss opens the re-teach panel in place (the explanation, the figure, "Show me the answer"), then the answer state; Read gains the retry it lacks today (audit LD-13) as the same twin asked at the end of the section. The prompts at the end become at most two, optional, with Skip. Nothing else in the Read design of art direction v2 §9 changes.

### 8.3 The authoring standard (pipeline/prompts/author-topic.md): the replacement texts

**Template v2, item 3.** Today: "Sections numbered and short (≤ 120 words between gates), each ending in one gate; concept before procedure; every method step carries its reason; at least one `why` callout in the body and at most one `examiner` callout in the body (the rest go to the end panel)." Replace with:

> 3. Sections numbered, each in three parts and in this order: **explain** (one to three paragraphs of at most 75 words each, at most 225 words in all; concept before procedure; every method step with its reason), **see it** (one `see` block: the method carried out on one example in two to six steps, each step a working line with its reason and, where it earns one, the mark; a video or a sim may stand beside it, never instead of it), then **your turn** (one gate that asks for what the steps just showed; two gates only where the section showed two variants). Nothing is asked before it has been explained and shown. At least one `why` callout in the body and at most one `examiner` callout in the body (the rest go to the end panel).

**The block contract** gains the See it block: `{ "type": "see", "stem": "<the example, with its maths>", "steps": [{ "working": "<one line of working, $…$>", "because": "<the reason, ≤ 40 words>", "earns"?: ["MW1"] }], "answer"?: "<the final line>" }`. Two to six steps; the same shape as a worked example's steps, so a bundle's worked example converts to a See it by a script and an author's read. And the gate gains an optional twin: `{ "type": "gate", …, "twin"?: { "prompt", "options"?, "answer", "explain" } }` for the retry.

**The depth standard's principle sentence.** Today: "A teaching stretch is still at most 120 words and still ends in a gate. A complex topic earns more stretches, one idea each, until every way the paper asks the topic has been taught, seen done and checked." Replace with:

> A teaching section is explain, see it, your turn: at most 225 words of explanation, one `see` block, one check. A complex topic earns more sections, one idea each, until every way the paper asks the topic has been taught, seen done and checked.

**"Teach before you check" (the five bullets of 24 September)** stand as written; bullet two gains: "Show is a `see` block. A figure alone explains; it does not show the method worked."

**The Slides way, the fourth bullet.** Today: "A gate at most every 4 cards is a ceiling, never a quota (the owner's ruling of 24 Sep 2026, 'Teach before you check' above): a gate stands where its section has explained and shown the idea, never where a count says one is due; and every gate reads alone (the gates-stand-alone rule above)." Replace with:

> No card count decides where a check goes. A check stands only after its section's See it card. A section is at most three explanation cards, one See it and one Your turn (two Your turns where two variants were shown), so a run without a check is at most five cards and about three minutes; a longer run is a section to split, never a gate to add. Every gate reads alone (the gates-stand-alone rule above).

**The prompt rule.** Template v2 item 6's "then the retrieval prompts" and the old item 7 ("3-6 `prompt` blocks") are replaced with:

> Retrieval prompts: at most two `prompt` blocks per note, after the pointer, optional on screen (a Skip control; a skipped card is never scheduled), each a short recall: a question of at most 15 words whose answer is at most 12 words (25 is the hard cap): a must-know formula, the key word the scheme rewards, the first line to write, or one value. Never a numbered procedure (that is the recap), never an examiner's finding (that is the Sheet's trap), never an explanation over a line. The bundle may hold more prompts for the flashcards deck; none over 25 words.

**The depth tables.** "Prompts embedded in the note: 3 / 4 / 5 / 5" becomes "0-2 in every band"; "Retrieval prompts (a minimum; no maximum): ≥ 4 / ≥ 6 / ≥ 8 / ≥ 10" becomes "as many as there are facts to carry, at most 8, each ≤ 25 words"; the "See it done" row becomes "a `see` block in every section that ends in a gate; one per variant for H bands"; and the minute model counts a See it at 15 seconds a step.

### 8.4 The lint (scripts/qa/lesson-v2.mjs and its modules)

- `sections`: the fatal "≤ 120 words between gates" check is replaced by three: a section's explanation before its `see` block is at most 225 words (fatal); a section that holds a gate holds a `see` block before it (a warning until the unit's migration is filed, then fatal); a teaching section ends in one gate, or two where its heading carries two variants in its role text (a warning).
- `teach` (teach-show-check.mjs): "shown" tightens to the ruling: a `see` block, a video or a sim, or a paragraph with two or more worked steps; a figure or a photo alone no longer counts as shown. Today's loose reading passes 1,363 of 1,507 gates; the strict reading passes 782, and the difference (581 gates) is exactly the sections that explain with a picture and never work a line. `--teach-fatal` is switched on per unit as each unit's migration lands.
- `see`: a `see` block has two to six steps, every step a `working` and a `because`, `because` at most 40 words, every `$…$` balanced, `earns` values from the subject's mark language.
- `prompts-few`: keeps WIRED_MAX 2 and ANSWER_WORDS 25; adds a report line of answers over 12 words (the target) and flags an answer that is a numbered list (a procedure in a prompt).
- `--depth`: the See-it row per note; the minute model with See its; the longest run between checks reported as cards, never gated.

### 8.5 The trial topic itself (fm1/algebraic-fractions-simplify), the v3 deck

Twenty-six cards, the same seven gate ids and answers re-sited, four See its, one video, two optional recall cards:

1. Title.
2. **Section 1, Only a factor divides out** (idea): the hook; the idea with the figure (the bracket struck, the result 2x over 4(x − 5), honest about what it strikes, audit CT-10); **See it**: 2x(x + 5) over 4(x + 5)(x − 5) in four steps (divide out the bracket; divide out the 2; check with x = 1, both give −1/8; the trap, (x + 4)/x, nothing cancels); **Your turn g2**.
3. **Section 2, Factorise first** (variant): move 1 (the common factor first, then the quadratic); **See it**: x² − 9 = (x + 3)(x − 3); 4x² − 100 = 4(x + 5)(x − 5); x² + 7x + 10 = (x + 5)(x + 2); **Your turn g1**.
4. **Section 3, A coefficient in front** (variant): the square root of 4x² is 2x; the cubic with a `notonspec` line (CT-05: no FM1 paper sets one); **See it**: 4x² − 25 = (2x + 5)(2x − 5); x³ − 9x = x(x + 3)(x − 3); **Your turn g3, then g7** (two variants, two checks).
5. **Section 4, See it done at writing speed** (see): the Corbettmaths video with its length stated; the figure she acts on (the numbers as the last pair, drawn as a 2 over a 4, audit LD-08); **Your turn g4**.
6. **Section 5, Fully means fully** (twists): the idea; the examiner card (Summer 2024 Q8(a), the report's own words, CT-15); the why card; **See it**: 6 over 3(x − 3) becomes 2 over (x − 3); 3x² over x becomes 3x; **Your turn g5, then g6**.
7. Recap; pointer (tariffs from the papers, CT-02); recall, optional, two (rp.02; rp.04 cut to nine words); close with "Now the questions".

About 14 minutes at the minute model plus the six-minute video, stated as such. The deck's shape beside today's is the strip board on the canvas.

### 8.6 What does not change

The frozen surface of the depth standard: every gate's id and answer, every prompt's id, answer and key words, every worked example's steps, every question's spec. A gate moves; it is never rewritten. A prompt is unwired from the note; it is never deleted from the bundle. The `explain` string is not frozen and is rewritten to re-teach. Design v2's palette, type, rhythm, drawings, motion tokens and the hare are untouched: v3 is an order and three cards, not a look.

---

## 9. The CCEA fit

The See it carries the scheme's own currency: each line names the mark it earns (MW1 for a factorisation, M1 for the method, A1 for the value, in the subject's mark language), so she learns where the marks are while she watches. The Your turn is the paper's own shape of that step: a factorisation, the first line to write, the cancelled answer. The examiner's finding sits inside the section as the reason for the last step ("the last mark is the word fully"), which is where the Chief Examiner's sentence does its work. The questions proper keep CCEA's layout, tariffs and command words, scheme-marked, with the synoptic chain for H bands; nothing here is copied from a paper (the shingle test stands). Further Mathematics has no tiers, and the section names never imply one. A twist section of the depth standard gets its own See it, so the paper's disguises are worked in front of her, not only named.

---

## 10. Scaling and the migration, measured

`scratchpad/platform/teach-first/measure/measure-teach-first.mjs` over all 184 note.blocks.json files at 25 September 00:03, importing the lint's own definitions (an explanation is 15 or more prose words; a worked step is a relation inside maths, a chain, a connective step or a labelled line) and adding the strict reading of "shown" (a video, a sim or two or more worked steps; not a picture). Output: measure.md and measure.json in the same folder.

**Gates.** 1,507 gates in teaching bodies. 725 (48 per cent) come before anything in their section is worked step by step; 16 come before an explanation; 737 (49 per cent) before either, in 181 of the 184 notes. Under the existing lint's loose reading (a figure counts) the number is 140 to 163, which is why that lint reads "1,363 of 1,507 pass" tonight. By band: L 113 of 209 gates, S 304 of 565, H4 224 of 552, H5 84 of 181. The trial topic: six of seven.

**Sections.** 1,052 teaching sections. 518 (49 per cent) hold no demonstration at all (no video, no sim, no worked line); 107 hold not even a figure; 59 hold no gate. Seven notes have no demonstration in any section. Every note's bundle holds at least one worked example and 145 hold two, so 323 of the 518 can be converted from a worked example the author already wrote (the first See it of a routine section), and 195 need writing.

**Prompts.** 862 embedded (a median of four per note; 83 notes at four, 61 at five, 24 at six, 3 at ten); answers a median of 21 words, the 90th percentile 34; 131 at or under 12 words, 464 at 13 to 25, 267 over 25, 36 over 40. The bundles hold 1,548 prompts, 435 of them over 25 words.

**The cost per unit, Year 12 first** (the model: 15 min per note for the read, roles and finish checks; 15 min to convert a See it from a worked example; 30 min to write and verify a new one; 5 min per gate re-sited or given its re-teach text; 3 min per prompt trimmed or moved):

| Order | Unit | Notes | Gates before a demonstration | Sections without one | From a worked example | New See its to write | Answers over 25 words | Est. hours |
|---|---|---|---|---|---|---|---|---|
| 1 | FM1 | 29 | 83 of 208 | 64 of 160 | 43 | 21 | 38 | 37 |
| 2 | FM2 | 16 | 53 of 126 | 56 of 118 | 37 | 19 | 4 | 28 |
| 3 | FM3 | 15 | 57 of 111 | 53 of 100 | 25 | 28 | 20 | 30 |
| 4 | M8 | 15 | 50 of 162 | 19 of 62 | 18 | 1 | 42 | 15 |
| 5 | M4 | 9 | 32 of 89 | 18 of 52 | 15 | 3 | 29 | 12 |
| 6 | B2 | 15 | 70 of 104 | 81 of 114 | 33 | 48 | 22 | 43 |
| 7 | C2 | 16 | 90 of 135 | 61 of 91 | 39 | 22 | 16 | 33 |
| 8 | P2 | 10 | 42 of 71 | 40 of 61 | 20 | 20 | 15 | 22 |
| | **Year 12** | **125** | **477 of 1,006** | **392 of 758** | **230** | **162** | **186** | **220** |
| 9 | M7 | 17 | 65 of 179 | 31 of 101 | 25 | 6 | 27 | 20 |
| 10 | M3 | 17 | 46 of 142 | 36 of 105 | 32 | 4 | 27 | 20 |
| 11 | B1 | 21 | 122 of 154 | 44 of 64 | 30 | 14 | 26 | 31 |
| 12 | C1 | 2 | 7 of 14 | 6 of 11 | 3 | 3 | 0 | 3 |
| 13 | P1 | 2 | 8 of 12 | 9 of 13 | 3 | 6 | 1 | 5 |
| | **All** | **184** | **725 of 1,507** | **518 of 1,052** | **323** | **195** | **267** | **299** |

Unit 7 has no notes yet; its four topics are written to v3 from the start, as are C1 and P1. The science units cost most: their sections explain with a figure and rarely work a line, and B2's 48 new See its are the largest single item. At three to four concurrent authors, Year 12 is about a week of agent time on top of the depth passes already queued, and the two passes should run as one (the depth pass adds sections and roles; the v3 pass adds See its and re-sites gates; both are guarded by frozen-surface.mjs).

**What a v3 pass may change**: add `see` blocks; move gate blocks within their section; rewrite `explain` strings to re-teach; add a `twin` to a gate; unwire prompts from the note and trim answers over 25 words; add roles. What it may not change is §8.6. The order of the roll-out follows decision 15: FM1, FM2, FM3, M8, M4, B2, C2, P2, Unit 7, then M7, M3, B1, C1, P1; the trial topic is the pilot.

---

## 11. Acceptance: what a Playwright check will prove

On the trial topic at 390 x 844 and 1280 x 800, light and dark, then per unit as each migration lands:

1. **Order.** In every section of the deck, the first `[data-card="gate"]` comes after at least one `[data-card="idea"]` and one `[data-card="see"]` (or a video media card) of the same section (`data-section` on every card). Unit test: `buildDeck` on the trial note returns 26 cards, 7 gates, 4 see cards, 2 recall cards, and `deckGateIds` is the note's order.
2. **See it.** On a `[data-card="see"]`, `[data-step]` elements visible grow by one per Continue, from one to n; the control reads "Continue" until the last step and "Your turn" after it; under `prefers-reduced-motion` every step is visible on arrival and `document.getAnimations().length === 0`.
3. **Your turn.** The eyebrow contains "Your turn"; the stem, its maths and the first option keep the §8.4 gaps (16/20, 20/24 px); Check is disabled until a choice; the digits choose by shown position.
4. **A miss.** After Check on a wrong option, a `[data-card="reteach"]` is shown before any element with `data-outcome`: it contains "Not quite.", the chosen option's text, the figure's stage where the gate has one, and one control "Show me the answer"; then the gate shows her option with the miss edge, the right option lit with a tick, a diagnosis containing the chosen option's text, and "Recorded"; no computed colour within 20° of red on either card.
5. **The record.** IndexedDB holds one attempt for the gate id after the whole sequence, with the first answer; the re-teach adds none.
6. **The retry.** Before the recap the retry card either shows the twin's prompt (`data-retry="twin"`) or the same prompt with the right option at a different shown position than the first asking; a miss on the retry shows the answer and never the words "comes back before the recap".
7. **Recall.** At most two `[data-card="recall"]` cards; each has a Skip control; after Skip no review card exists for that prompt id; after "Show the answer" the typed text is still on the card; the three grades show three different return days.
8. **The close.** "Now the questions" is the accent control on a first pass and lands on the first practice question with `document.activeElement` inside `[data-question]` (or inside the Slides frame's question card, if the owner chooses that form).
9. **Counts.** The title card's promise line and the hero's line show the same cards, your turns and see its, and state the video's minutes.
10. **The lint.** `node scripts/qa/lesson-v2.mjs --unit fm1 --teach-fatal` exits 0 on the trial topic; `--prompts` prints nothing for it; the strict `teach` line over the unit is reported in the pass's final message.
11. **The look.** One accent-filled control per screen (the re-teach card included); every drawn label at 13 px or more at 390; the hare on no card that holds an answer field.

---

## 12. Questions only the owner can answer

1. **Where do the questions proper run?** Inside the Slides frame as a second part of the same deck, one question per full screen (a renderer to build, the same discipline she liked), or on the topic page's Practice stage with the close card's first button taking her there (a link, being fixed tonight)? The case recommends the first for Year 12 topics once the migration has landed and the second now.
2. **After a miss, once the answer is shown, ask a twin straight away** (one more go on new numbers, then on), or only before the recap as now? The case recommends before the recap only, so the rhythm of the section is not broken; a twin at once is Math Academy's move and costs authoring.
3. **Recall cards in the deck: two at most with Skip, or none**, leaving recall to the flashcards deck and the review inbox? The case recommends two at most, because the one fact she must carry into the paper (a formula with no sheet) is worth thirty seconds at the end of the lesson.
4. **The video.** May a Corbettmaths clip ever be a section's only See it, or must every See it be our own steps with the marks, with the video beside it? The case recommends the second (offline, the marks, the honest minutes), which is what the migration costs.
5. **"Skip to your turn" on a See it card** for someone who already knows the section: on the first pass too, or only on a return visit? The case recommends only on a return visit, so the first pass is the lesson.
6. **The name on screen.** "Your turn" for the check (a teacher's phrase; the case's choice), or keep "Check", or "Try it"?
7. **The pace.** Year 12 first in the order above, about 220 agent-hours as one pass with the depth pass, at three to four concurrent authors? Or the trial topic and FM1 first, then a second sit-down with her before the rest?
8. **The first check of a topic.** May it still be the trivially easy one that teaches the interface, placed after the first See it (the case's choice), or should the interface be taught by the See it card's own Continue and the first check be a real one?

---

## 13. The five questions, answered for this case

- **Would she understand this on first reading, alone, at night?** The structure is the one she asked for in her own words; every new card has one job and one control; the on-screen names are a teacher's (See it, Your turn, Once more in other words). The canvas shows it on her phone.
- **Can she rely on every number here?** The migration numbers come from a script over every note with its definitions stated and its output kept; the trial's card list was checked against the note block by block; the maths on the See it card was recomputed (at x = 1 both fractions are −1/8). The audit's findings are cited as unverified, as the audit itself says.
- **Does it help her score more marks, or is any of it filler?** The See it carries the marks per line; the check tests what was shown; the miss is taught before it is marked; the questions are the paper's. The recall cards are cut to what the paper needs. Nothing decorative was added.
- **Would a Chief Examiner sign it?** The demonstration is the scheme's method in the scheme's language; the twist sections get their own See it; nothing is copied.
- **Is there anything here I would not defend line by line?** Two places where the evidence is thinner and the case says so: the exact count of two recall cards (the evidence supports few and short, not a number), and the choice between a twin at once and a twin before the recap (both defensible; the owner decides).

---

## Sources

Read on the date given by this agent unless marked; a snippet is a fact from a search summary, not the page.

- Rosenshine, B. (2012), Principles of Instruction, American Educator, https://www.aft.org/sites/default/files/Rosenshine.pdf (read in full 25 Sep 2026): the ten principles; the 23 against 11 minutes of presentation in mathematics; the 80 per cent success rate; worked examples as "a step-by-step demonstration"; guided practice before independent practice.
- Pearson, P. D. and Gallagher, M. C. (1983), the gradual release of responsibility; Archer and Hughes (2011) "I do, we do, you do"; Fisher and Frey (2008): https://en.wikipedia.org/wiki/Gradual_release_of_responsibility and https://www.structural-learning.com/post/i-do-we-do-you-do (snippets, 25 Sep 2026).
- Sweller, J. and Cooper, G. (1985), the worked-example effect, https://www.tandfonline.com/doi/abs/10.1207/s1532690xci0201_3 (via research 06 §6).
- van Gog, T., Kester, L. and Paas, F. (2011), example-problem pairs beat problem-example pairs for novices, https://www.sciencedirect.com/science/article/abs/pii/S0361476X1000055X (via research 06 §6).
- Renkl, A., Atkinson, R., Maier, U. and Staley, R. (2002), faded examples, backward fading, https://doi.org/10.1080/00220970209599510 (via research 06 §6).
- Kalyuga, S., Ayres, P., Chandler, P. and Sweller, J. (2003), the expertise reversal effect, https://doi.org/10.1207/S15326985EP3801_4 (via research 06 §6).
- Barton, C., example and your turn, http://mrsmahoney.co.uk/example-and-your-turn/ (via research 06 §6).
- Adesope, O., Trevisan, D. and Sundararajan, N. (2017), practice testing meta-analysis, https://journals.sagepub.com/doi/abs/10.3102/0034654316689306 (via research 06 §2).
- Yang, C. et al. (2021), the testing effect in classrooms, https://doi.org/10.1037/bul0000309 (via research 06 §2).
- Kang, S., McDermott, K. and Roediger, H. (2007), test format and corrective feedback, https://profiles.wustl.edu/en/publications/test-format-and-corrective-feedback-modify-the-effect-of-testing-/ (snippets, 25 Sep 2026): short answer with feedback slightly better than multiple choice.
- Richland, L., Kornell, N. and Kao, L. (2009), the pretesting effect, https://pubmed.ncbi.nlm.nih.gov/19751074/ (snippets, 25 Sep 2026).
- Pan, S. and Sana, F. (2021), pretesting against posttesting, https://osf.io/preprints/psyarxiv/un87v_v1 (via research 06 §9).
- Mera, Y., Dianova, A. and Marin-Garcia, E. (2025), the pretesting effect with delayed feedback, Journal of Cognition, https://journalofcognition.org/articles/10.5334/joc.455 (read 25 Sep 2026): d = 1.24 immediate against 0.82 delayed feedback; word pairs; university students; generalisation uncertain.
- Wisniewski, B., Zierer, K. and Hattie, J. (2020), feedback meta-analysis, https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full (via research 06 §8).
- Butterfield, B. and Metcalfe, J. (2001); Butler, A., Fazio, L. and Marsh, E. (2011), hypercorrection, https://link.springer.com/article/10.3758/s13423-011-0173-y (via research 06 §9).
- Bisra, K. et al. (2018), self-explanation, https://link.springer.com/article/10.1007/s10648-018-9434-x (via research 06 §7).
- Rawson, K., Dunlosky, J. and Sciartelli, S. (2013), successive relearning, https://link.springer.com/article/10.1007/s10648-013-9240-4 (via research 06 §4).
- Szpunar, K., Khan, N. and Schacter, D. (2013), interpolated tests in video, https://doi.org/10.1073/pnas.1221764110; Kardas, M. and O'Brien, E. (2018), watching is not doing, https://journals.sagepub.com/doi/abs/10.1177/0956797617740646 (via research 06 §13).
- Rey, G. et al. (2019), the segmenting effect, via docs/plan/review/2026-09-23-benchmarks.md page 4.
- Matuschak, A., How to write good prompts, https://andymatuschak.org/prompts/; Matuschak and Nielsen, Quantum Country, https://numinous.productions/ttft/ (via research 07 §2.8).
- Math Academy, How it works, https://www.mathacademy.com/how-it-works (read 25 Sep 2026).
- Brilliant, About, https://brilliant.org/about/ (read 25 Sep 2026).
- Khan Academy help centre, content types and mastery, https://support.khanacademy.org/hc/en-us/articles/18564282990861-What-types-of-content-can-I-assign-to-my-students and https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery (snippets; the centre blocks fetching), 25 Sep 2026.
- Kinnu, What we found in our 10,000-person learning experiments, https://www.kinnu.xyz/blog/research/what-we-found-in-our-10000-person-learning-experiments/ (read 25 Sep 2026); Nibble, Kinnu app review (competitor), https://nibble-app.com/blog/kinnu-app-review (snippet).
- Duolingo, Duolingo's teaching method, https://blog.duolingo.com/duolingo-teaching-method/ and What is implicit learning, https://blog.duolingo.com/what-is-implicit-learning/ (read 25 Sep 2026); Tech & Learning on Duolingo Math (third party), https://www.techlearning.com/how-to/what-is-duolingo-math-and-how-can-it-be-used-to-teach-tips-and-tricks (snippet).
- Anki manual, Studying, https://docs.ankiweb.net/studying.html; Gizmo's help centre, via benchmarks page 15.
- Project documents: STANDARDS.md (22 Sep and the 24 Sep addendum); PLATFORM-PROGRAMME.md (decisions 1 to 17); DIRECTIVE-2.md; FEATURE-CASES.md; docs/design/2026-09-23-art-direction-v2.md (§8.1, §8.4, §9, §11); docs/plan/review/2026-09-23-benchmarks.md (pages 3, 4, 5, 6, 8, 15, 16); docs/plan/review/2026-09-22-depth-standard.md; pipeline/prompts/author-topic.md; docs/plan/review/2026-09-13-learner-experience-review.md; docs/plan/review/2026-09-23-slides-trial.md; scratchpad/platform/trial-audit/findings-waveA.json (LD-03, LD-06, LD-07, LD-08, LD-12, LD-13, LD-18, LD-19, LD-22, CT-02, CT-05, CT-10, CT-15; unverified); scripts/qa/teach-show-check.mjs and prompt-few.mjs; the deck walk under scratchpad/platform/teach-first/deck/.
