# Concept B — Learner-experience-first

**Working title for the product:** none yet (the brother should name it; see §4.6 for constraints on the name).
**Written:** 2 September 2026, from the research in `docs/research/01`–`10` only. Citations are by research file and section, e.g. "06 §5" = `06-learning-science-what-works.md`, section 5.
**Lens:** start from her week, not from the spec. The spec, the examiner reports and the learning science are the constraints; the experience is the product.

---

## 0. The thesis in one paragraph

She already owns the specification, the past papers, the mark schemes and Corbettmaths. Every other CCEA student owns the same things, and almost every study tool on the market speaks AQA/Edexcel and grades 9–1 (04 §4, 05 §3). What nobody gives her is a thing that (a) knows *her* papers — M4, M8, Further Maths Units 1–3, B1…P2 and Unit 7 — by date and by statement, (b) refuses to let her passively re-read (06 §2, §17), (c) remembers for her what she has proved she knows and brings it back before she forgets (06 §3–4), (d) marks the way CCEA marks and tells her the *specific* traps examiners reported (01 §9, 02 §8, 03 §7), and (e) shows her the truth about where she stands, in CCEA grades and UMS (09 §2.3), without points, leaderboards or hearts (06 §14, 07 §2.2). The design rule that follows from the evidence and from the best learning products (Brilliant, Mathigon, Quantum Country, Execute Program — 07 §2) is simple: **she does something every minute, the interface reacts truthfully, and the home screen always has one small honest thing for her to do next.**

Assumptions used for the concrete examples (all dates are *data* in an editable exam map, §7.4):

| Item | Assumed for this document | Source |
|---|---|---|
| Year group | Year 12 in September 2026 (Maths Higher route M4+M8; Further Maths Units 1, 2, 3; Double Award Higher) | brief; 09 §4–5 |
| M4 | Tue 17 Nov 2026, 9.15–11.15, 100 marks, calculator, formula sheet on p.2 | 01 §6; 01 §2 |
| M8 | Thu 27 May 2027: Paper 1 non-calc 9.15–10.30 (50), Paper 2 calc 10.45–12.00 (50) | 01 §6 |
| FM Unit 1 / 2 / 3 | Tue 18 May 2027 (am, 2 h, 100) / Fri 4 Jun 2027 (pm, 1 h, 50) / Tue 15 Jun 2027 (am, 1 h, 50) | 02 §6 |
| DAS B1/C1/P1 | already sat or sitting Nov 2026 (9–11 Nov) / Feb 2027 (22–26 Feb — last March series with Science) | 03 §6; 09 §9.1 |
| DAS B2 / C2 / P2 (+ Booklet B 30 min each) | Wed 2 Jun / Thu 10 Jun / Mon 14 Jun 2027 | 03 §6 |
| Unit 7 Booklet A window | 1 Dec 2026 – 1 May 2027 | 03 §5.7 |
| Results days | Thu 4 Feb 2027 (Nov series), Thu 15 Apr 2027 (March), Thu 19 Aug 2027 (Summer) | 09 §6 |

If she is in Year 11 instead, the exam map changes to M4 on Fri 14 May 2027, B1/C1/P1 on 11/17/25 May 2027 and the completion units the following summer (09 §5.3). Nothing else in this document changes.

---

## 1. The answer to her question

*(Written to her. 247 words. Every claim maps to a feature in §3, §5 or §7; example dates come from her exam map.)*

> You already have the spec, the past papers, the mark schemes and Corbettmaths. This doesn't replace them. It does what they can't.
>
> It knows your exams. Not "GCSE season" — your papers: M4 at 9.15 on Tuesday 17 November, M8 on 27 May, Booklet B straight after each Unit 2 paper. Every countdown, every plan, every review is scheduled backwards from those dates, and it switches to exam mode two weeks out.
>
> It never lets you just read. Every note stops every few sentences and makes you do something — fill in the next step, drag the graph where you think it goes, spot the error — before it goes on. Every video pauses with a question. Testing yourself beats re-reading; mixed practice beat topic-by-topic practice 61% to 37% a month later in a trial of 787 pupils.
>
> It remembers for you. Everything you get right comes back just before you'd forget it. The home screen tells you what to do tonight, and it's usually about nine minutes.
>
> It marks like CCEA. Method marks and accuracy marks, the exact mistakes examiners reported last summer, and you mark first, then it checks you. Raw marks become UMS and a grade — including what A* actually needs.
>
> It tells the truth. No points, no leaderboards, no hearts. A map of every spec statement: what you can do today, what you'll still remember on exam morning.
>
> Every question in it is original and written for the CCEA papers you sit.

Backing for each paragraph: exam map and exam-week mode (§5.3, §7.4; dates 01 §6, 02 §6, 03 §6); step-reveal, prediction, find-the-mistake and video checkpoints (§3.1, §3.4, §3.6, §3.15; evidence 06 §2, §5 — Rohrer 2020, 787 students, 61% vs 37%); FSRS review inbox (§3.2, §5.2; 06 §3); mark-point marking, examiner-report feedback strings, self-marking, UMS calculator (§3.13–3.14; 01 §2.2–2.3, 09 §2.3); mastery map and retention forecast (§5.4; 07 §2.3, §2.8); original item bank (§8; 08 §11).

---

## 2. A day in her life: three sessions, screen by screen

Conventions: **[Screen]** = a distinct view; *taps/types/drags* in italics; feedback copy in quotes. Copy is illustrative but the tone is the specification (§4.5). Times are realistic for a phone on a weeknight and a laptop at the weekend.

### 2.1 Tuesday, 9.40 pm, 15 minutes, phone, tired (6 October 2026; 42 days to M4)

**[Home]** She opens the installed PWA from her home screen. Light theme by default; she set "evening mode" on, so after 9 pm it is dark (§4.4). Top line: "Tuesday 6 October · **M4 in 42 days** · Tue 17 Nov, 9.15". One dominant tile: "**Tonight** · 11 due · about 9 min" with a single button, *Start*. Under it, quietly: a four-dot strip "This week ● ● ○ ○", a small "Next: Circle theorems — reasoning (M4)" suggestion with "Sat" pencilled beside it, and the next three papers. Nothing else asks for attention (07 §7.5, §7.11).

**[Review 1 of 11 — recall]** *Taps Start.* "Write the equation linking power, energy and time." A maths field with a small keyboard (=, /, ×, ², √, letters). *Types* `P=E/t`. The field checks symbolic equivalence (compute-engine, 10 §10). "Correct. P = E/t — and 1 W = 1 J/s. In the exam, write the equation before you substitute; a wrong equation with a right number scores nothing (Chief Examiner, March 2026)." Three buttons at thumb height: *Again · Good · Easy* (07 §2.10). *Taps Good.*

**[Review 2 — numeric, calculator badge]** "A coat costs £575 after a 28% rise. What did it cost before the rise?" A number field, a small "calc" badge (she may use her calculator). *Types* `414`. "Not quite. £575 is **128%** of the original, so divide: 575 ÷ 1.28 = **£449.22**. You subtracted 28% of the new price — that's the single most common error on this question type in the 2023, 2024 and 2025 M4 papers." Then a second card slides up: "**Fix it now** — £726 after a 28% rise. Original?" *Types* `567.19`. "Correct — you divided by the multiplier." (Twin problem: 06 §8; the miss goes into the hypercorrection queue and comes back on Thursday: 06 §9.)

**[Review 3 — diagnostic with confidence]** "Hydrogencarbonate indicator in a tube with a pond snail (respiring, no light). After an hour the indicator is…" Four options: "yellow — CO₂ high", "purple — CO₂ low", "brick red — CO₂ high", "blue-black — CO₂ high". Under the options a five-dot confidence row. *Taps* "yellow", *taps* confidence 4. "Correct, and you were sure. Red = normal, purple = low CO₂. 'Brick red' and 'blue-black' are food-test colours — examiners saw them mixed up in B1 Higher, Summer 2025." (Distractors each carry a named misconception: 06 §9; the colour confusion is from 03 §7.2.)

**[Review 4 — find the mistake]** A three-line worked answer for simplifying (x² − 9)/(x² + 5x + 6). Line 2 cancels "x²" across the top and bottom. "Tap the first line that is wrong." *Taps line 2.* "Yes — you can only cancel **factors**, never terms. Factorise first: (x+3)(x−3) over (x+2)(x+3), then cancel (x+3)." (Illegal cancelling is the top Further Maths Unit 1 error every year: 02 §8.1.)

**[Reviews 5–11]** In the same mixed order (item-level scheduling means the queue is interleaved by construction: 06 §3, §5): an M8 surd (rationalise 5/(3√2)), a Chemistry "which is the diatomic gas?" diagnostic, a Further Maths log-law prompt (log 8 in terms of log 2), a P1 half-life reading from a graph (image + numeric), a tap-to-place force diagram (label W, R, T on a block on a rough table — the arrow that must be at the *centre* of a rod is a recurring examiner point, 02 §8.2), a "what is NOT on the formula sheet?" prompt (the area of a circle is not given; the sine rule is — 01 §4), and one C1 dot-and-cross MCQ.

**[Review complete]** A tick draws in over 250 ms; the card reads: "11 done · 9 min · 2 come back Thursday. If you keep this rhythm, your predicted retention of M4 items on 17 November is **91%**." Below, two equal buttons: "*5 more minutes: Circle theorems — reasoning*" and "*Done for tonight*". *Taps Done.* The weekly strip becomes ● ● ● ○. No confetti, no streak nag (07 §3 celebration restraint; 06 §14).

Total: about 11 minutes. She did 13 retrievals, fixed one confident error, and never read a paragraph.

### 2.2 Saturday, 11.00 am, 45 minutes, laptop (10 October 2026)

**[Home]** "Saturday · M4 in 38 days." Tile: "**Today** · 14 due · about 10 min". Second tile: "**Weekend block (35 min): Histograms — estimating the median.** Why this: it's the weakest high-value M4 statement on your map, and examiners say 'the vast majority' fail it every series." Strip: ● ● ● ○ → this block completes the week.

**[Reviews]** Ten minutes, exactly as on Tuesday. (Rosenshine: begin with review — 06 §11.)

**[Topic: Histograms with unequal class widths (M4)]**

> **Amended 13 September 2026, after the learner's first trial.** Steps 1 and 2 below are superseded: nothing is locked behind the pre-check, and the Sheet is no longer the opening. A first visit opens with a hook and the topic's figure, then instruction and a worked example; an optional 3–4 item prerequisite check (no confidence row, labelled as things she is not meant to know yet) may sit after the hook, and the confidence-based check with hypercorrection moves to after instruction. The Sheet becomes the closing "In the exam" panel and the landing card of the reviser path. See docs/plan/review/2026-09-13-learner-experience-review.md.

1. **Pre-check (4 items, ~2 min).** Before any teaching: "On a histogram, the vertical axis shows…" (frequency / frequency density / cumulative frequency / percentage), a bar-reading item where the distractor is "height = frequency", a class-width item, and "the median is estimated from…" Each with confidence. She scores 2/4. "Two to fix. Let's start with frequency density." (Pretesting and routing: 06 §9.)
2. **The Sheet.** A single screen, ≤150 words and one diagram: what a histogram is, `frequency density = frequency ÷ class width`, "area = frequency", how to estimate the median (half the total area), "on the formula sheet: no; on your traps list: forgetting the frequency-density scale, drawing on a blank grid without labels". This is the "what you actually need to know" the brother asked for; it is printable and reappears at the top of the topic forever, but it only unlocks after the pre-check so that reading is never the first move (06 §17).
3. **Step-reveal note.** "A histogram shows frequency by **area**, not height. So a bar twice as wide must be half as tall to show the same frequency. Complete: frequency density = frequency ÷ ⎵" — the next paragraph does not render until she *types* `class width` (Mathigon pattern, 07 §2.4). Three more gates: a numeric ("class 10–30 with frequency 40: density = ⎵"), a choice ("which bar is taller?"), and a "why?" menu (self-explanation, 06 §7).
4. **Predict-then-plot.** A table (0–10: 20; 10–30: 40; 30–35: 25). A blank Mafs canvas with three draggable bar tops. "Drag each bar to the height you expect, then check." *Drags* 20, 40, 25. *Taps Check.* The true bars animate in (2, 2, 5) and her 30–35 bar's error is shaded: "That bar is only 5 wide, so 25 people make it the tallest. Height shows density, area shows people." (Brilliant: the diagram changes when you are wrong — 07 §2.1; generation before feedback — 06 §9.)
5. **Worked example as question.** An M4-style item: "Estimate the median." Each step is an input: total frequency (sum of areas) → half of it → which bar contains it → fraction of that bar → the estimate. A wrong step reveals only that step's fix, then re-asks it (Execute Program / faded examples: 07 §2.9, 06 §6). After step 3 a menu: "Why do we work with area, not height, here?" three candidates, one right.
6. **Your turn, then two backward-faded completions** (she supplies the last step, then the last two), **then three independent items**, one of which is a reverse reading (given a bar's height, find its frequency — 2024 M4 Q21(b) style, 01 §9.2).
7. **Exit.** The mastery chip for `M4.HD.histograms` flips Not started → **Familiar**. "Proficient needs a correct answer in a *later* mixed set (at least two days from now) — that's deliberate." (Delayed check, ≥80% gate: 06 §11.)

**[Mixed set, 6 questions, ~12 min]** No topic headings. A histogram; a cumulative-frequency IQR in £000s; a stratified-sample calculation; a bounds question ("50 kg to the nearest 5 kg"); a circle-theorem angle with reasons (reason chips, §6.1); a reverse percentage. She scores 5/6; the bounds miss ("used 45 not 47.5") gets the high-information card and a twin (01 §9.1 M4 Q13). A rolling-accuracy governor keeps the set between 70% and 90% success (06 §11).

**[Science 8 minutes — she chooses]** Two tiles: "Physics equation sprint (25 equations, ~5 min)" and "Practical planning: Hooke's law (P2, ~8 min)". *Picks the practical.* The builder (§3.12) asks her to *tap-to-assemble* the results-table header (she picks "Force (N)" and "Extension (cm)"; the feedback: "Units in the heading, and the column heading must match the axis label — that exact point cost marks in Booklet A 2025"), *choose* independent/dependent/control variables from chips, *tap* the axes for the graph, and *type* a one-line "how would you make the results reliable?" ("repeat and take a mean" required; "accurate" is not "reliable" — 03 §7.4). It ends with a 4-mark Booklet-B-style question that she self-marks against four descriptors before the platform shows its marking.

**[Block complete]** "Saturday block done · 44 min · This week 4/4 → **3 weeks in a row**. M4 map: 61% Familiar+, 38% Proficient+. Predicted retention on 17 Nov: 88% → 90%." A gentle full-width card for the weekly streak (no confetti; confetti is reserved for §5.5 milestones). If the brother wrote a note for "first three-week streak", it appears here as a small envelope she can open or ignore (§4.6).

### 2.3 The week before M4 (Tue 10 – Tue 17 November 2026)

Fourteen days out, the platform switched M4 into **exam mode**: no new M4 topics unless flagged as gaps; the desired-retention target for M4 items rose from 0.90 to 0.94 (short retention interval, worth the extra reviews: 06 §3); the plan bar shows seven days with one line each. Everything else (M8, FM, Science) is throttled to five minutes a day so the week does not double.

- **T-7, Tue 10 Nov — [Home]** "Exam week for M4. Plan: reviews every day (15 min), three timed sections, one full paper on Saturday, a light day on Monday." Below: "**Your top 10 traps**" — generated from her error log tags (06 §15): 1 reverse % — divide by the multiplier; 2 bounds — 'nearest 5 kg' means ±2.5; 3 circle-theorem reasons need the key words ('cyclic', 'opposite', 'alternate segment'); 4 arc length — major or minor?; 5 histogram — frequency density, label the axis; 6 quadratic from a shape — form it, don't solve the given one; 7 if you leave two answers, the worst is marked; 8 keep the full calculator display in bounds questions; 9 write what you keyed into the calculator; 10 read the bold words. Every one is a sentence the examiners actually wrote (01 §9.5).
- **T-6, Wed — [Timed section]** "Section A · 8 questions · 25 marks · 30 minutes (CCEA pace is 1.2 min/mark)." A timer in the corner, a working canvas per question (typed or scratch), feedback withheld until the end (exam-format practice: 06 §15). Then **[Self-mark]**: for each part she *allocates* marks against short descriptors ("M1 correct multiplier; A1 £449.22"), the platform reveals its allocation, highlights disagreements, and asks "which tag?" (misread / slip / method / didn't know / time) for each lost mark. Tags feed the Thursday queue.
- **T-5, Thu — reviews + Section B** (geometry-heavy). Missed items become twins for Sunday.
- **T-4, Fri — reviews + Section C** (algebra-heavy: algebraic fractions, quadratics from shapes).
- **T-3, Sat 14 Nov — [Full paper]** "Summer 2025 M4 · 2 hours · 100 marks. Opens the question paper on ccea.org.uk in a new tab (© CCEA). Print it if you can; sit it at the table." *Taps Open paper* (deep link to the official PDF; never re-hosted — 08 §5, §11). The platform runs the two-hour timer with the real structure and a "formula sheet is on page 2" reminder. Afterwards **[Self-mark grid]**: 22 rows, she opens the official mark scheme PDF herself and *enters* her mark per question. **[UMS]**: "Raw 71/100. On Summer 2025 boundaries that is unit grade **a** (a = 45 raw). If you scored the same on M8: **A**, about 350/400 UMS. A* needs 393/400 — in practice near-full UMS on *both* units; Summer 2026's boundary was 393." (01 §2.2–2.3; 09 §2.3.) Then: "Marks dropped by topic: circle theorems (4), histogram median (3), bounds (2). Sunday has twins for each."
- **T-2, Sun — [Consolidation]** 20 minutes: M4-only reviews, the six twins, and the "not on the sheet" sprint (circle circumference and area, Pythagoras, SOH-CAH-TOA, cylinder volume and surface area, arc/sector fractions, density, pressure, speed, index laws, y = mx + c — 01 §4).
- **T-1, Mon 16 Nov — [Light day]** 10 minutes of reviews at 0.95; the traps sheet; a checklist ("calculator in the right mode and fraction display checked; ruler, protractor, compasses, dark pencil; black pen"); "No new content today. Paper at 9.15 tomorrow, 2 hours, 100 marks." The brother's "night before M4" note unlocks (§4.6).
- **Exam day, Tue 17 Nov — [Home]** shows only: "M4 today, 9.15. Traps sheet. Formula sheet is page 2." After 11.15 a three-tap check-in ("fine / mixed / rough" and an optional line). The plan pivots to M8/FM/Science; M4 items are parked until results day, 4 Feb 2027, when a card invites her to enter the result (optional) and the UMS tracker updates.

---

## 3. The interaction grammar: 15 reusable component types

Every learning object on the platform is built from these. Each entry gives: what she sees and does; how it is marked; the learning-science reason (06); a CCEA example it serves; and the earliest phase (§8). Implementation notes reference 10.

| # | Component | Phase |
|---|---|---|
| 3.1 | StepRevealNote | 0 |
| 3.2 | InlinePrompt (review card) | 0 |
| 3.3 | DiagnosticWithConfidence | 0 |
| 3.4 | PredictThenPlot | 1 |
| 3.5 | WorkedExampleAsQuestion (faded) | 0 |
| 3.6 | FindTheMistake | 0 (simple) / 1 |
| 3.7 | FeedbackCard + TwinFixItNow | 0 |
| 3.8 | VariationLadder | 1 |
| 3.9 | MixedSet (SSDD) | 1 |
| 3.10 | RecallSprint | 0 |
| 3.11 | LabelTheDiagram | 1 |
| 3.12 | PracticalPlanningBuilder | 2 |
| 3.13 | SelfMark | 0 (grid) / 1 (descriptors) |
| 3.14 | PaperRunner + UMS | 0 |
| 3.15 | VideoWithCheckpoints | 1 |

### 3.1 StepRevealNote
- **Sees/does:** a topic page whose paragraphs are gated by small tasks: a blank to type (`⎵`), a two-to-four-way choice, a "predict a number", or a "why?" menu. Nothing below the current gate renders until she commits. Never more than ~150 words between gates (07 §7.1). Each topic starts with **The Sheet** (≤150 words + one diagram: the exam-true minimum, what is/isn't on the formula sheet, the examiner's traps), unlocked after the pre-check.
- **Marking:** text gates accept synonyms (Zod-listed); numeric gates use tolerance; maths gates use compute-engine equivalence (10 §10).
- **Why (06):** retrieval and generation instead of re-reading (§2, §17); segmenting and signalling (§10); self-explanation prompts inside examples (§7).
- **CCEA examples:** M8 equation of a circle and tangent (01 §5.8); B1 nitrogen cycle stages (B and C are the ones Higher candidates cannot name — 03 §7.2); FM Unit 1 completing the square → "hence" minimum (02 §8.1).

### 3.2 InlinePrompt (the review card)
- **Sees/does:** a question authored *next to* the explanation it belongs to (Quantum Country, 07 §2.8), shown again later in the review inbox: prompt → she answers (type, choose, tap) → reveal → *Again / Good / Easy*. Scheduled by ts-fsrs with desired retention 0.90 and an exam-date target per unit (07 §2.10, 10 §8.2).
- **Marking:** typed answers are checked; when unmarkable (e.g. "state the Principle of Moments"), reveal + self-grade, with the CCEA Glossary wording shown because "definitions must be learnt verbatim" (03 §7.1).
- **Why (06):** testing effect g ≈ 0.5 (§2); spaced retrieval vs massed g = 0.74 (§3); successive relearning to criterion across ≥3 sessions (§4); Matuschak's prompt properties — focused, precise, consistent, tractable, effortful (07 §2.8).
- **CCEA examples:** the ~25 Physics equations that are *not* given (03 §5.9); Chemistry flame colours and tests for ions (03 §5.3); FM Unit 3 "median and IQR will not be asked" style scope facts (02 §4.3); Maths "what's on the Higher formula sheet" (01 §4).

### 3.3 DiagnosticWithConfidence
- **Sees/does:** one question, four options, each option a *named misconception*; a 1–5 confidence row; instant reveal with the explanation targeted at the option she chose. Barton's rules: one skill, 10–20 seconds, cannot be right for the wrong reason (06 §9).
- **Marking:** exact; confident-wrong answers go to a hypercorrection queue (re-test at 1–3 days and ~1 week).
- **Why (06):** competitive distractors improve later recall (Little & Bjork); hypercorrection replicated in 219k UK responses (Foster 2022); pretesting beats post-testing (Pan & Sana) — so every topic opens with 4–6 of these (§9).
- **CCEA examples:** parallel-line angle names (>70% wrong on M3 Nov 2025 — 01 §9.4); ⅓ ≠ 30% (every Foundation series — 01 §9.5); C1 ranking H⁺ concentration from pH; P1 "which is a vector?" (Higher only, 03 §5.5); FM Mechanics "is weight a scalar?" (under 50% full marks every year — 02 §8.2).

### 3.4 PredictThenPlot
- **Sees/does:** a Mafs/JSXGraph canvas with a draggable guess (a point, a curve handle, a bar top, a ray); *Check* animates the truth in and shades the residual (Brilliant/Desmos, 07 §2.1, §2.5). Every drag has a tap-to-place alternative (WCAG 2.5.7, 07 §4).
- **Marking:** tolerance on the guess; the score is informational — the point is the prediction.
- **Why (06):** errorful generation before feedback (§9); dual coding with *informational* graphics only (§10); the wrong answer changes the diagram (07 §7.2).
- **CCEA examples:** M8 exponential y = kˣ and the gradient of a tangent as a rate (only the better candidates drew a tangent — 01 §9.2); FM tan graph with asymptotes at ±90° ("particularly problematic", 02 §8.1); P2 filament-lamp V–I curve (why it bends: temperature → collisions → resistance, 03 §7.4); C2 rate curves that must level at the *same* final mass (03 §7.3).

### 3.5 WorkedExampleAsQuestion (backward-faded)
- **Sees/does:** a full worked example with a one-line *decision* narrated per step ("I see two sides and the included angle, so cosine rule before anything else"), then the same structure as a *Your Turn* twin, then completions where she supplies the last step, then the last two, then solves alone. The number of steps shown adapts to her accuracy on the skill: ≥80% → problems only; <50% → the example again (expertise reversal, 06 §6).
- **Marking:** per step (mathlive field or numeric); a wrong step reveals only that step; method marks are recorded per step using the M/A/B mark-point schema (10 §9.2).
- **Why (06):** worked-example effect for novices; backward fading beats example–problem pairs (Renkl 2002); modelled decisions are the metacognitive "plan" step (§12).
- **CCEA examples:** FM Unit 1 algebraic fractions with a mandatory *factorise everything first* step (02 §8.1 rank 1); M4 quadratic from the area of a shape ("show that" — full marks or zero, 01 §9.1); M8 cosine rule → sine rule → ½ab sin C with an auxiliary line (01 §9.1 M8 P2 Q14); Stats pooled standard deviation via Σx² (02 §8.3).

### 3.6 FindTheMistake
- **Sees/does:** a short, plausible wrong solution; *tap the first wrong line*, choose the reason, then *fix it* in a field. Built from examiner-report errors, labelled with the series they came from.
- **Marking:** line index + reason + fixed value.
- **Why (06):** erroneous examples beat problem solving on a one-week delayed test (d = 0.33) even though students like them less (McLaren 2015); comparing incorrect with correct examples builds conceptual knowledge (Durkin & Rittle-Johnson) (§9).
- **CCEA examples:** differentiating when the question says "hence" after completing the square — zero marks (02 §8.1 rank 8); "opposite angles in a cyclic quadrilateral are equal" (01 §9.1 M4 Q17); conditional probability with the whole population as denominator (02 §8.3 rank 1); P = IV used as P = I/V; "chlorine ion" for chloride (03 §7.1).

### 3.7 FeedbackCard + TwinFixItNow
- **Sees/does:** after any miss: correct answer, one-line *process* diagnosis, the examiner's sentence where one exists, and a *twin* to fix it now; after two misses in a row on a skill, an EncouragementCard offers a hint or a worked variant instead of a third red mark (ustwo/Brilliant "moments of encouragement", 07 §2.1). Correct work also gets a line ("factorising first was the efficient route").
- **Why (06):** high-information feedback d = 0.99 vs ✓/✗ 0.24 (Wisniewski 2020); feedback needs an immediate opportunity to act (EEF); confirm correct work; second spaced exposure of every correction (§8).
- **CCEA examples:** reverse percentages (§2.1); bounds; "add on the difference" in M3 Q22-type questions (01 §9.1).

### 3.8 VariationLadder
- **Sees/does:** 5–8 items where exactly one thing changes each time; before each, "what do you *expect* to change?" then compute, then a one-line "why?" (Barton's Reflect–Expect–Check–Explain; NCETM variation, 06 §10).
- **CCEA examples:** indices 2³ → 2⁰ → 2⁻³ → 8^(1/3) → 8^(−2/3) (index −3 "only better candidates" — 01 §9.1 M8 Q8); FM differentiation with negative powers (02 §8.1 rank 4); percentage multipliers 1.28 → 0.72 → 1.28⁻¹; C2 naming alkane → alkene → alcohol → carboxylic acid with one carbon added (organic chemistry "continues to be the topic candidates struggle with", 03 §7.3).

### 3.9 MixedSet (SSDD)
- **Sees/does:** 6–10 questions, no topic labels, no two consecutive items sharing a method; "same surface, different deep" sets share one diagram or context (one trapezium → area, Pythagoras for a side, an angle, similar shapes; one v–t graph → gradient, area, average speed). A rolling-accuracy governor steps difficulty down below 70% and up above 90% (06 §11).
- **Why (06):** interleaving in maths g = 0.34 pooled and d = 0.83 in the 787-student RCT; discrimination ("which method?") is what the paper tests; blocked practice gives a false sense of mastery (§5). Science: interleaved retrieval quizzes d = 0.35 (Sana & Yan).
- **CCEA examples:** M4 cumulative frequency vs histogram vs stratified sampling (all Handling data, all confused); FM Mechanics v–t vs s–t graphs with two vehicles (02 §8.2 rank 6); P1 speed/velocity/acceleration from graphs (03 §5.5).

### 3.10 RecallSprint
- **Sees/does:** a timed-feeling but untimed run through a deck to criterion: each equation/definition/fact typed once correctly per session; wrong ones recycle to the end; the deck reports "time to mastery", not minutes studied (06 §4).
- **CCEA examples:** the Physics equation list (no formula sheet — 03 §2, §5.9); Chemistry formulae to recall (rate = 1/time, Rf, moles, concentration, % yield, atom economy — 03 §5.9); Maths "not on the sheet" list (01 §4); FM Unit 3 "what the sheet gives" (mean, SD, addition rule, conditional, Spearman — 02 §4.3) so she never re-derives what is printed.

### 3.11 LabelTheDiagram
- **Sees/does:** an unlabeled diagram with a chip bank; *tap a chip, tap the target* (drag optional). Arrow direction and *position* matter (weight at the centre of a uniform rod; normal reaction perpendicular to the plane; friction opposing motion).
- **Why (06):** "draw and label from memory" as retrieval for dual-coded content (§10); force diagrams are the number-one Mechanics error every year (02 §8.2).
- **CCEA examples:** FM Mechanics block on a slope, connected particles over a pulley (force on the pulley = 2T — "the least well-answered question on the paper", 2025, 02 §8.2); P2 three-pin plug (fuse action "least well answered" 2024, 03 §7.4); C2 electrolysis cell (label the anode; bromine at the anode); B2 heart chambers and vessels; B1 leaf cross-section (which layer exchanges gas — 03 §7.2).

### 3.12 PracticalPlanningBuilder (Unit 7 — 25% of Double Award)
- **Sees/does:** for each of the 18 prescribed practicals (03 §5.8): assemble the apparatus list from chips (correct names: "gas syringe", "conical flask", "delivery tube"), draw or choose the 2-D labelled apparatus diagram (no 3-D, no four-legged tripods — 03 §7.1), pick variables, build the results-table header (units in headings, heading = axis label), choose axes and best-fit line/curve, choose "reliable vs accurate" wording, state a risk and control, do the calculation (moles, % yield, degree of hydration, gradient with unit). Ends with a Booklet-B-style question and SelfMark.
- **Why (06):** format-matched practice transfers (Yang 2021); Unit 7 is the largest unserved slice of the grade (05 §4); examiners report weak apparatus naming, "related but not proportional" reasoning, and axis labels every series (03 §7.4).
- **CCEA examples:** P6 Ohm's law, P5 refraction (2025 Booklet A), C5 hydrated crystals (2025 Booklet A), B5 osmosis (2025 Booklet A), B3 enzymes (2024).

### 3.13 SelfMark
- **Sees/does:** after exam-mode work she allocates marks first — against descriptors written in CCEA's own M/A/B and QWC-band style — then the platform reveals its allocation and the discrepancy; she tags each lost mark (misread / slip / method / didn't know / time). A 3-minute rubric trainer runs the first time (Sanchez: benefits depend on rubrics and training).
- **Why (06):** self-grading g = 0.34 (§15); Sadler's evaluative expertise; tags drive the traps sheet and the FSRS queue.
- **CCEA examples:** DAS 6-mark QWC (nuclear fusion — 03 §7.4; aluminium extraction — 03 §7.3) with the three-band scheme (03 §2); M4/M8 six-markers; FM "show that" (working backwards scores nothing — 02 §8.1).

### 3.14 PaperRunner + UMS
- **Sees/does:** timed sections of *original* items at CCEA marks-per-minute, or a full official paper opened on ccea.org.uk by deep link with the platform running the timer, structure and self-mark grid (08 §11). Raw → UMS → unit grade → subject grade, using the fixed UMS scale and the latest raw boundaries; the A* band explained as "near-maximum UMS on both units" (01 §2.2–2.3; 09 §2.3). For Double Award, the 600-UMS double grade (05 §0, 09 §2.3).
- **Why (06):** transfer-appropriate processing; timed practice only *after* mastery and ramped from 1.5× time to real time (§15).
- **CCEA examples:** M8 Paper 1 non-calculator (the 2025 examiners noted it was harder than Paper 2 — 01 §9.1); FM Unit 1 two hours, 14 questions.

### 3.15 VideoWithCheckpoints
- **Sees/does:** a click-to-load YouTube facade (privacy-enhanced domain, no overlays — 10 §12.1) for a curated ≤6-minute segment, with a question every 2–3 minutes that must be answered to continue, and an attempt within 60 seconds of the end. Watching never marks anything complete (06 §13). Sources: Corbettmaths videos by number from its own CCEA checklists (04 §2.1, 08 §9.2), NI Maths Tutor paper solutions (04 §2.20), Science Shorts / Chemistry Chicken / GCSE Physics Online (05 §2.19–2.20). Later, the brother's own ≤60 s explainer clips for the six hardest topics (§6).
- **Why (06):** engagement collapses after ~6 minutes; interpolated tests cut mind-wandering and anxiety (Szpunar); watching inflates confidence not skill (Kardas & O'Brien) (§13).

**Surfaces that are not "components" but hold the grammar together:** MasteryChip and SpecMap (§5.1, §5.4), ReviewInbox (§7.4), ExamMap and PlanBar (§5.3), EncouragementCard (§3.7), Working canvas (typed or a light pointer-events scratchpad in Phase 0; Excalidraw in Phase 2 — 10 §11).

---

## 4. Visual identity

The bar is "award-worthy", but the evidence says where the craft pays: the answer button, the feedback card, the review-complete screen and the mastery chip — the four things she looks at hundreds of times — not a hero animation (07 §7.16, §1.3).

### 4.1 Palette
- **Two colours and one accent** (Obys / Vercel Geist / Linear — 07 §1.3, §3). Ground: warm off-white (about `#FAFAF7`); ink: near-black (`#161616`); a 12-step neutral grey with reduced blue chroma (Linear). One accent, used *only* for "the thing to do next" (the Start button, the current gate, the due count).
- **Accent choice:** a deep signal blue (LCH ≈ L 45 / C 60 / H 270). Deliberately not green or orange as the brand colour — in Northern Ireland those two carry connotations a personal gift should not accidentally pick up; keep them for semantic states only, and never as the *only* signal (WCAG: icon + text + motion, 07 §4).
- **Theme engine from three variables** (base, accent, contrast) in LCH → light, dark and high-contrast for free (07 §3, §7.8). KaTeX and Mafs are themed through the same tokens.
- **Subject tint:** a 4% tint on unit headers only (Maths, Further Maths, Biology, Chemistry, Physics) so a screen "knows where it is" without becoming a colour chart.

### 4.2 Type
- **Inter** for UI with `tnum` and `zero` (score tables, UMS, timers), Inter Display for headings (07 §3); **KaTeX fonts** for every formula (`output: htmlAndMathml` for accessibility, 10 §3); no second display face.
- Notes: left-aligned, 65–75-character measure, no italics for emphasis, no all-caps headings, adjustable spacing (GOV.UK dyslexia guidance, 07 §4).
- Maths is set at 1.05× the surrounding text (tuned from KaTeX's 1.21 default) so a worked line reads as one line, not a jump.

### 4.3 Motion
- 150–300 ms, transform/opacity only, `MotionConfig reducedMotion="user"` (07 §3, §4; 10 §5). Nothing moves on scroll inside the study surface; smooth-scroll libraries are banned from the app (10 §5).
- **Vocabulary:** step-reveal paragraph = fade + 8 px rise; correct = a tick that *draws* in 250 ms and a 1.02 scale; wrong = the *diagram* reacts (the bar moves, the curve appears where it really is) before any text — never a shake, never a red flash; list changes animate with auto-animate; milestone = one full-bleed 1.2 s card (§5.5).
- Feedback never uses the word "Wrong" (Sparx's most-hated moment, 07 §2.7).

### 4.4 Dark, light, and the phone
- **Light is the default** because the papers are black on white (07 §4, §10 q6); dark is a preference; "evening mode" flips to dark after a time she sets. Both themes are tested against KaTeX, Mafs and JSXGraph.
- **Phone is for reviews, diagnostics, sprints and The Sheet**; laptop/iPad for topics with graphs, working canvases and timed papers. On the phone: single column; ≥44 px answer targets (24 px minimum, 07 §4); a sticky *Check* button above the keyboard; a tailored mathlive keyboard (fraction, √, powers, π, ≤, ×); tap-to-place for every drag. The PWA works offline for everything except YouTube and PhET (10 §8.3).

### 4.5 Tone of voice
"A very good tutor who has read every Chief Examiner's report." Direct, warm, specific, British spelling, CCEA vocabulary (M4, C*, UMS, Booklet B — never "Paper 1", never 9–1 except as a tooltip, 04 §5). No exclamation marks in feedback; praise is *informational* and tied to strategy ("you factorised first — that's the efficient route"), which is the only kind that raises intrinsic motivation (06 §14, Deci). Examiner quotations are attributed ("Chief Examiner, Summer 2025").

### 4.6 The gift layer — personal, not cringe
Principles: private, short, few, dated to *real* events, switch-off-able, and the craft *is* the gift.
1. **First run.** Her name; a one-paragraph note from him (he writes it, plain text); her exam map already filled in by him so the first screen she ever sees already knows her papers (09 §10.6).
2. **Notes that unlock on real dates or milestones** (stored locally, written in advance): first week complete; first unit at Proficient; the night before each paper; results days (4 Feb, 15 Apr, 19 Aug 2027). An envelope icon on the review-complete card; she opens it or not. Maximum one a week.
3. **"Ask [brother]"** (Phase 1): on any item, one tap adds it to a list she can share with him (export code); it turns a product into a conversation.
4. **"Day 1 — [her birthday]"**: progress is framed from the day she got it, never from a marketing epoch.
5. **What the gift layer is not:** no mascot, no cartoon, no "you're a star", no confetti on ordinary days, no monitoring dashboard for anyone but her (she owns the data; export is hers).
6. **Naming constraint:** the name should not be her name or a pet name (it becomes cringe in a year), should not sound like an app store product, and should read well in the sentence "I did ten minutes on ___ last night."

### 4.7 Photos, diagrams, graphs, video — with purpose only
- **Photographs** only where the exam context is physical and a photo carries information a diagram cannot: flame-test colours (C2), a potometer bubble (B6), a eureka can (P1), iron filings around a bar magnet (P2), the yellow/red/purple of hydrogencarbonate indicator (B1). Each photo carries a prompt ("what would the examiner ask about this?"). Own photos (a phone in a school lab, with permission) or CC-licensed; no stock decoration anywhere (EEF "lethal mutation", 06 §10).
- **Diagrams**: one idea each, labels on the diagram not in a key (split-attention, 06 §6), themed SVG or Mafs/JSXGraph; every diagram has a text description.
- **Graphs**: interactive when prediction matters (§3.4); static SVG when it does not.
- **Simulations**: PhET via iframe with the required attribution line and untouched logo (CC BY-NC is fine for a personal non-commercial site — 05 §2.11, 10 §12.2), always wrapped in a task ("set the resistance to 5 Ω, predict the current, then check"); the verified list for P1/P2/C1/C2/B1/B2 is in 05 §2.11. GeoGebra applets for 3-D solids under its non-commercial licence with "Made with GeoGebra®" (07 §6).
- **Video**: only via §3.15; ≤6 minutes; never as the lesson.

---

## 5. The motivation system

Everything here is *information dressed as progress*, because informational game elements help and comparative/reward elements harm (06 §14; 07 §2.2, §2.7).

### 5.1 Mastery states (per spec statement, with decay)
Modelled on Khan Academy (07 §2.3) and Rawson's successive relearning (06 §4):

| State | Enters when | Leaves when |
|---|---|---|
| Not started | — | first attempt |
| Attempted | any attempt | ≥70% on the topic's initial set |
| **Familiar** | ≥70% on the initial (blocked) set | a correct answer in a mixed set ≥2 days later |
| **Proficient** | correct in a later mixed set and FSRS stability implies ≥85% recall at 7 days | a miss in any mixed set or review (drops to Familiar) |
| **Mastered** | retrieved correctly in ≥3 spaced sessions and predicted retention ≥90% on the unit's exam date | a miss (drops to Proficient); parked after the exam |

No level is ever awarded by an immediate post-test alone (06 §11, §17). Unit tests can promote many statements at once; mixed tests can demote (07 §2.3).

### 5.2 The heartbeat: reviews
The home page opens on "Due today · N · ~M min" and one button (Execute Program / Quantum Country, 07 §7.5). Desired retention 0.90 by default, raised to 0.93–0.95 per unit in its last two weeks (06 §3); a daily cap (default 25) so a missed week never returns as a wall; items for a sat unit are parked until results day. She can see the trade-off in plain words ("higher retention = more reviews"), never the algorithm.

### 5.3 The weekly rhythm and the exam map
- **Sessions per week**, set by her (default 4: three 15-minute weeknights + one 45-minute weekend block — the EEF/NSSA dosage of short, frequent, linked sessions, 06 §16), shown as a four-dot strip. **Streaks are counted in weeks**, with one automatic freeze per half-term (Duolingo's own finding that slack motivates more than rigid rules; daily streaks and hearts explicitly avoided — 07 §2.2). A missed week resets gently: "New week. Start with five minutes."
- **A paced plan with dates**, not a self-paced sandbox (self-paced mastery underperforms — 06 §11): the plan bar runs backwards from each paper in the exam map; two weeks out a unit enters exam mode (§2.3).
- **Alignment with school**: a one-tap "What are you doing in school this week?" picker (topic list) so the learn step follows her lessons (tutoring works when linked to lessons — 06 §16).
- **Anti-burnout**: the DE youth survey describes "a permanent state of assessment" (09 §7.1). So: a default daily maximum of 45 minutes, a "rest week" after each paper, and a light day before every exam by design.

### 5.4 Honest progress
- **SpecMap**: a grid of every statement (Maths by unit and strand; Science by `DA-B1-1.2.3` id from `data/spec/double-award-science.json`; FM by unit and content area) coloured by state; the headline number is "statements at Proficient+" per unit, never minutes or points (07 §2.3).
- **Retention forecast**: FSRS retrievability at the exam date, per unit, shown as one number and one small curve ("memory is a choice" — 07 §2.8). Coverage is stated plainly ("M8: original questions for 12 of 20 topics; the rest link to Corbettmaths").
- **UMS and grades**: raw → UMS → unit grade → subject grade with the fixed UMS scale, the latest raw boundaries and the A* band explained (01 §2.2–2.3; 09 §2.3). Double Award on the 600-UMS scale.
- **Calibration**: confidence vs accuracy per topic; over-confident topics get more retrieval, under-confident-but-correct topics get explicit reassurance (06 §12).
- **Traps sheet**: her top ten error tags, in examiner language, regenerated weekly.

### 5.5 What is celebrated, and what never happens
- **Celebrated (FEAT test — proportionate to what she built toward, 07 §3):** first Proficient in a unit; a unit "exam-ready" (≥85% Proficient+ and forecast ≥90%); a full paper completed; results days. A 1.2-second full-bleed card; confetti only for exam-ready and results, a few times a year.
- **Acknowledged quietly:** each correct answer (tick), each completed review session (the retention line), each week (the strip).
- **Never:** leaderboards or any comparison with other students (Hanus & Fox: lower motivation *and* lower exam scores — 06 §14); hearts or lives; points/XP for showing up (engagement-contingent rewards d = −0.40, Deci); daily-streak nagging; timers on first exposure; "Wrong"; badges; a mascot; notifications after 9.30 pm.

---

## 6. Making the hardest topics approachable: six storyboards

Chosen by examiner evidence across the three subjects (01 §9.5, 02 §8, 03 §7). Each follows the tutor loop — diagnose → teach → practise → paper → review (06 §16) — and names the components from §3.

### 6.1 M4 — Circle theorems with two-step reasoning (6% full marks in Summer 2024 and November 2025; "majority obtained zero" 2023 — 01 §9.1–9.4)
1. **Diagnose (4 items):** "opposite angles in a cyclic quadrilateral are…" (equal / add to 180° / add to 360° / both 90°), "the angle between a tangent and a radius is…", "angles in the same segment…", and a diagram where the needed first step is *isosceles from two radii*. Confidence on each.
2. **Explore (PredictThenPlot on JSXGraph):** one theorem per screen. Drag a point on the circumference; before dragging, *type* your prediction for the angle at the circumference given the angle at the centre; the numbers update live and the invariance is the lesson. Seven theorems, each ≤90 seconds.
3. **Reason bank (StepRevealNote):** the exact phrases that earn the reason mark, as chips: "angle at the centre is twice the angle at the circumference", "opposite angles in a cyclic quadrilateral add to 180°", "angle in a semicircle is 90°", "tangent meets radius at 90°", "alternate segment theorem", "angles in the same segment are equal", "two tangents from a point are equal", "radii are equal → isosceles". The examiners' point: the key words ("cyclic", "opposite", "alternate segment") are the mark (01 §9.4).
4. **Two-step proof builder (WorkedExampleAsQuestion):** the 2025 Q17(b) structure — isosceles triangle from radii *then* the alternate segment theorem. She orders the steps and attaches a reason chip to each; a wrong reason reveals why that phrase is not the theorem.
5. **FindTheMistake:** a proof that uses "opposite angles in a cyclic quadrilateral are equal"; a diagram where BAC is assumed to be 90° without a diameter (01 §9.1 M4 Q8).
6. **MixedSet** with reasons required; **SelfMark** where a missing key word loses the reason mark, exactly as CCEA marks it.

### 6.2 M4 — Histograms with unequal classes and estimating the median ("continues to cause problems for the vast majority", every series — 01 §9.1–9.5)
Fully storyboarded in §2.2. The essentials: pre-check → The Sheet → step-reveal (density = frequency ÷ width) → PredictThenPlot (bar heights) → WorkedExampleAsQuestion (median by half-area) → reverse readings → a blank-grid drawing task (frequency-density scale and axis labels — the two things candidates omit) → MixedSet alongside cumulative frequency and stratified sampling (the Handling-data trio candidates confuse) → SelfMark on an M4-style 6-marker.

### 6.3 M8 — Multi-step non-right-angled and 3-D trigonometry (about a sixth to a third full marks; "could not determine a logical starting point" — 01 §9.1–9.2)
1. **Diagnose:** a "which rule?" set — given a triangle with marked knowns (SSS, SAS, ASA, two sides and a non-included angle), choose Pythagoras / SOH-CAH-TOA / sine rule / cosine rule / area formula. The ambiguous case is off-spec (01 §4), and the tool says so.
2. **Find the triangle (LabelTheDiagram variant):** in a composite figure (a quadrilateral with a diagonal; a bearings triangle), *tap the triangle you would solve first*; the platform highlights it, greys the rest, and asks "which rule here?". This is the "logical starting point" examiners found missing.
3. **WorkedExampleAsQuestion** for the closing-question pattern: area formula → cosine rule → sine rule, with the auxiliary line drawn in on tap; every step carries a "keep the full display" check because early rounding is the recurring accuracy loss (01 §9.1).
4. **3-D (GeoGebra applet or JSXGraph 3-D):** rotate a cuboid; *tap* the right-angled triangle that contains the space diagonal; then *tap* the angle between the diagonal and the base ("only half knew which angle" — 01 §9.2). Then compute in two faded steps.
5. **VariationLadder:** the same triangle with one known changed each time so the rule choice flips.
6. **PaperRunner** on a 6-mark original at CCEA pace, then SelfMark with M/A descriptors.

### 6.4 Further Maths Unit 1 — Algebraic fractions and the method-locked "hence" (flagged every year 2018–2025; "hence" answered by differentiating scores zero — 02 §8.1)
1. **Diagnose:** "which of these can you cancel?" (terms vs factors), "the LCD of 1/(x+3) and 1/(x²−9) is…", a sign-error item when subtracting a bracketed product.
2. **The factorise-first routine (WorkedExampleAsQuestion):** step 1 is *always* "factorise every numerator and denominator" and step 2 will not open until it is complete; difference of two squares is detected and named; the LCD is built from a chip set of factors; the subtraction step expands the bracket with the sign carried visibly.
3. **FindTheMistake gallery:** illegal cancelling across a sum; dividing by a constant before factorising; "tying themselves up in knots with cubic numerators"; not simplifying fully (each labelled with its report year).
4. **Method-lock alarm (a FeedbackCard variant):** on any item whose stem says "hence", "use matrices" or "show that", a small banner: "Method-locked — only the stated method is credited." Then a FindTheMistake where a *correct* minimum found by differentiation receives 0 marks, with the examiner's sentence (02 §8.1 rank 8); and one where a matrix question solved algebraically "received no marks" (2025 Q5(ii)).
5. **MixedSet** across Unit 1 (a fraction, a log law, a tangent/normal, a definite integral, a matrix inverse) — the discrimination the two-hour paper demands.
6. **PaperRunner:** three Unit 1 items at 1.2 minutes per mark; SelfMark with the M/W/MW convention explained (02 §7).

### 6.5 Further Maths Unit 3 — Conditional probability (the top discriminator every single year 2019–2025 — 02 §8.3)
1. **Diagnose ("denominator detector"):** four options for P(A | B): P(A∩B)/P(B), P(A∩B)/P(A), P(A)×P(B), P(A∩B)/1 — each a named error from the reports (whole-population denominator; reversed condition; independence assumed).
2. **The triad view (custom SVG, StepRevealNote):** a Venn diagram, a two-way table and a tree of the *same* data, linked. *Tap* "given B" and, in all three, the universe shrinks to B: the other regions fade, the table's other row fades, the tree's other branch fades, and the denominator is highlighted. The formula — which *is* on the Unit 3 sheet (02 §4.3) — is shown as the thing the picture already told her.
3. **The subset case:** P(X < 36 | X < 50): the numerator is P(X < 36) itself because it sits inside the condition; animated. This is the specific 2023 Q3(iv) trap ("only 25% correct").
4. **VariationLadder:** the same table with the condition swapped, then the event swapped, then "not A given B".
5. **Through the normal distribution:** conditional probabilities via z-values, with the "draw the bell and shade" habit enforced before the table is opened (02 §8.3 rank 6).
6. **FindTheMistake:** "28%"-style answers; multiplying two probabilities on the numerator when one event is a subset of the other. **MixedSet** with Venn/tree/table stems that look alike; **SelfMark**.

### 6.6 Double Award Chemistry — Formulae → balanced equations → ionic and half equations (tested throughout C1 and C2 and in Booklet B; "disappointing" at Foundation, "continue to prove challenging" at Higher, still flagged in March 2026 — 03 §7.3)
1. **Diagnose:** "which are diatomic?" (H, O, N, the halogens — "diatomic elements forgotten"), symbol case ("Cu not CU"), "chloride not chlorine ion", a state-symbol item.
2. **Ion cards (LabelTheDiagram variant):** build a formula by *tapping* a cation and an anion; a balance beam shows the charges; MgCl₂ appears only when two Cl⁻ are placed. The Data Leaflet's periodic table is one tap away because it *is* provided in the exam (03 §2).
3. **Atom counter (PredictThenPlot variant):** balance an equation with coefficient steppers only (subscripts locked); a live tally of each element on each side turns level when balanced; PhET "Balancing Chemical Equations" is embedded as an optional extra with attribution (05 §2.11).
4. **Strip the spectators:** a full ionic equation; *tap* the ions unchanged on both sides and they fade, leaving the net ionic equation (Br₂ + 2I⁻ → 2Br⁻ + I₂ — the 2025 Higher problem); then split into half equations with electrons appearing on the correct side and charge balanced (Fe → Fe³⁺ + 3e⁻ — the reported electron-side/number error; the anode half equation for molten LiCl from Booklet B).
5. **RecallSprint** of the C1/C2 reactions of acids, tests for gases and ions, and observations "fully qualified" ("colourless solution forms", "heat given out") — because listing a wrong answer beside a right one scores zero (03 §7.1).
6. **SelfMark** against a hierarchical scheme (03 §7.3 notes dot-and-cross marking is hierarchical) on a Booklet-B-style electrolysis item.

**Next six** (Phase 1–2, same pattern): M3/M4 reverse percentages and bounds (every series); FM Mechanics force diagrams and the 2T pulley force (02 §8.2); P2 lens ray diagrams and refraction (03 §7.4; also Booklet A 2025); Physics equation recall with "write the equation before substituting" (03 §5.9); C2 organic naming and structures; Unit 7 apparatus drawing and "reliable vs accurate" (03 §7.4).

---

## 7. Information architecture and navigation

### 7.1 Primary objects
- **Maths: the unit pair.** She declares her pair on first run (default M4+M8; any combination is allowed and the grade ceiling is shown — 01 §2.1; 04 §5.1). Content is cumulative because M8 assumes M1–M7 (01 §5), so the M8 map includes the earlier statements she is expected to carry. Foundation pairs (M1+M5, M2+M6) are supported structurally from day one (tier flag, formula-sheet differences — 01 §4) even though Phase 0 content is Higher.
- **Science: B1, C1, P1, B2, C2, P2 and Unit 7**, with Unit 7 split into Booklet A (one node per prescribed practical) and Booklet B (one node per discipline). Statement ids are the `DA-…` ids from `data/spec/double-award-science.json`, with the tier flag that file already carries (`tier: "H"` / `mixed`), so a Foundation build drops Higher-only phrases rather than whole statements (data/spec/README.md).
- **Further Maths: Units 1, 2, 3.** Unit 4 exists as a stub only (entries near zero — 02 §3, §9).

### 7.2 Hierarchy
Home → Subject → Unit (or pair) → Topic (a spec section: e.g. M4 Handling data → Histograms; C1 1.5 Symbols, formulae and equations; FM1 Differentiation) → Statement → items. Every item carries: statement ids, tier, calculator flag, marks, mark points, hints, worked solution, common-error patterns (the Zod schema in 10 §9.2 is adopted as-is).

### 7.3 Navigation
- **Phone:** five bottom tabs — *Home*, *Learn* (topics), *Practise* (mixed sets, sprints), *Papers* (PaperRunner, official deep links, UMS), *Map* (SpecMap, forecasts, traps, calibration). **Desktop:** the same five in a left rail.
- **Jump:** a command palette (⌘K / a search field on phone): "histogram", "2T", "Rf" → topic or item.
- **Outbound, per topic, always attributed:** the CCEA spec page number; Corbettmaths video/practice by number (link, never copy — 04 §3, 08 §9.1); the BBC Bitesize CCEA guide id (05 §1.2, 04 §2.9); CCEA fact files, Q&A booklets, glossaries and practical manuals (08 §7); official past-paper questions by deep link with `#page=N` from the 504/507/584 feeds (08 §3, §11).
- **Settings:** exam map editor; sessions per week; retention target; theme and evening mode; notes on/off; export/import (JSON; the data lives in IndexedDB — 10 §8.1) with a fortnightly backup reminder.

### 7.4 The home screen, precisely
A bento of at most eight tiles, 16 px gap and radius, four columns on desktop collapsing to one column on the phone in the same order (07 §3, §7.11). Bento is used *only* here; lessons are single-column.

1. **Header line:** "Tuesday 6 October · M4 in 42 days · Tue 17 Nov, 9.15" + her name. Next paper is always the header; tapping it opens the exam map.
2. **Tile A (2×2) — Tonight/Today:** "11 due · about 9 min" and one button, *Start*. Empty state: "Nothing due. Come back tomorrow — or learn something new." (Execute Program's cap as a retention hook, 07 §2.9.)
3. **Tile B (2×1) — Next learn step:** one topic, with *why* (weakest high-value statement, examiner evidence, or "what you're doing in school this week").
4. **Tile C (1×1) — This week:** four dots and "3 weeks in a row".
5. **Tile D (1×1) — Exam map:** the next three papers with dates.
6. **Tile E (2×1) — Mastery by unit:** M4, M8, FM1, FM2, FM3, B, C, P as Proficient+ bars with the retention forecast beside the next exam's unit.
7. **Tile F (1×1) — Traps:** her current top three, in examiner language.
8. **Tile G (1×1) — Note:** the envelope, only when one is unlocked; otherwise the tile does not exist.

Nothing on the home screen scrolls horizontally, animates on scroll, or competes with Tile A for the accent colour.

---

## 8. Phased roadmap

### Phase 0 — the birthday version (about two weeks of one developer with AI assistance)
**Goal:** the smallest thing that already passes her "why" test on the first evening and again the next Saturday. Scope is *depth on M4 plus the memory system*, not breadth.

Definition of done — "her first ten minutes":
1. She opens the PWA on her phone; it greets her by name, knows M4 is on 17 November and shows the countdown; a note from him is waiting.
2. She taps Start; 8–12 reviews run (equations, diagnostics, one twin); she finishes with a retention line and no nag.
3. She taps the suggested topic; a pre-check, The Sheet, a step-reveal note and a worked-example-as-question run without a bug; her mastery chip changes.
4. She opens Papers, sees Summer 2025 M4 by deep link with a timer and a UMS calculator, and understands what A* needs.
5. Everything above works offline and in dark mode.

Build plan (the scaffold already has Next 16 static export, React 19, Tailwind 4, KaTeX, Mafs, JSXGraph, Motion, ts-fsrs, Dexie, Zod, Zustand, mathlive and compute-engine installed):
- **Days 1–3 — foundations.** Move the repo to a short path (10 §15); theme tokens from three LCH variables; app shell with the five tabs; Dexie schema (cards, reviews, attempts, error tags, mastery, settings, notes); the exam-map data file with real CCEA dates (01 §6, 02 §6, 03 §6) and the plan bar; Serwist post-build service worker (10 §8.3).
- **Days 4–6 — the review loop.** InlinePrompt + DiagnosticWithConfidence + RecallSprint; ts-fsrs scheduling with exam-date retention targets and a daily cap; numeric/mathlive answer checking with tolerance and equivalence; FeedbackCard + TwinFixItNow; MasteryChip; the review-complete screen with the retention forecast; the weekly strip.
- **Days 7–10 — content, depth-first.** Six M4 topics as StepRevealNote + The Sheet + WorkedExampleAsQuestion + 8–10 original items each: circle theorems, histograms and median, reverse percentages and bounds, algebraic fractions (M4 level), quadratics from shapes ("show that"), perpendicular lines through two points (all from 01 §9.5). Two Further Maths topics with 12 original items: Unit 1 algebraic fractions and Unit 3 conditional probability. Science: the 25-equation Physics deck, the Chemistry recall deck, and ~20 diagnostics per Unit 1 discipline written from examiner-report misconceptions (03 §7). Simple FindTheMistake items (tap the wrong line) for these topics. A SpecMap for M4 with M8/FM/Science skeletons. Target: ~120 original items, 8 notes, 3 decks, all in JSON validated by the Zod schema, drafted with AI and *every one* checked by the brother against a worked solution.
- **Days 11–12 — papers and the gift.** PaperRunner v0: deep link to the official M4 papers from the 504 feed, timer, self-mark grid, UMS calculator with the 2025/2026 boundaries and the A* band; first-run screen; notes that unlock; export/import.
- **Days 13–14 — polish and install.** The four surfaces that matter (answer button, feedback card, review-complete, mastery chip); phone keyboard; dark mode pass on KaTeX/Mafs; offline test; install on her phone and laptop; write the first four notes.
- **Explicitly not in Phase 0:** video, PhET, Excalidraw, PracticalPlanningBuilder, Unit 7, FM Mechanics, MixedSet engine (Phase 0 sets are hand-ordered), VariationLadder, PredictThenPlot, Foundation content, the "Ask [brother]" list.

### Phase 1 — to the November paper and through Christmas (weeks 3–10)
All M4 statements with The Sheet and items; M8's top twelve topics (01 §9.5 Higher completion list); FM Unit 1 core (differentiation and tangents/normals, logs, completing the square and "hence", quadratic inequalities, trig graphs, forming three equations); Science Unit 1 diagnostics complete with PhET-wrapped tasks for P1/C1. New components: PredictThenPlot, VariationLadder, MixedSet with the accuracy governor, FindTheMistake with fix step, VideoWithCheckpoints (Corbettmaths mapping from the checklists — 08 §9.2), SelfMark with descriptors and tags, exam-week mode, the traps sheet, "What are you doing in school?", "Ask [brother]".

### Phase 2 — January to March 2027
Unit 7: PracticalPlanningBuilder for all 18 practicals and a Booklet-B item bank (the Booklet A window opens 1 December — 03 §5.7). FM Mechanics (LabelTheDiagram force diagrams, connected particles and 2T, v–t tools) and Unit 3 complete. M8 complete. B2/C2/P2 topics with LabelTheDiagram (heart, plug, electrolysis cell, lens rays). Excalidraw working canvas (10 §11). MathJax read-aloud toggle (07 §5). Foundation content for M1/M2/M5/M6 only if a second learner appears.

### Phase 3 — exam season 2027 and after
Exam-week mode for all eight papers in her map; ≤60 s explainer clips for the six hardest topics; FSRS parameter optimisation from her own review log (06 §3); an optional Claude tutor for "mark my working" via a serverless function, never a key in the bundle (10 §13); bridge-to-AS content after results (09 §10.7); data updates for 2027/28 (November 2027 becomes resit-only for Maths; no Science in March 2028 — 01 §1, 03 §2).

---

## 9. What not to build, and what to simply link

| Not building | Why |
|---|---|
| A video library or any hosted video | YouTube embeds with checkpoints do the job; hosting is a content and licensing sink (10 §12.1). |
| Re-hosted CCEA papers, transcribed questions or mark-scheme text | Forbidden by CCEA's notice (08 §5); deep links with `#page=N` are enough (08 §11). |
| Copies of Corbettmaths questions, checklists or booklets | Its terms forbid inclusion in other resources; link by video number instead (04 §2.1, 08 §9.1). |
| Leaderboards, XP, hearts, daily streaks, badges, a mascot | Evidence of harm or no benefit (06 §14, §17; 07 §2.2, §2.7). |
| A generic "how to revise" or growth-mindset module | Metacognition only works inside subject tasks (06 §12). |
| A chatbot as the main interface | The loop is retrieval and feedback; a tutor model is a Phase 3 add-on for marking working (10 §13). |
| Desmos, tldraw, Plotly | Licence or bundle-size problems (07 §6, 10 §4, §11). |
| A backend, accounts, sync | Static export + IndexedDB + export/import is enough for one learner (10 §0, §8). |
| 9–1 grade conversions beyond a tooltip | She is graded A*–G with C*; the platform speaks CCEA (04 §4, 09 §3). |
| FM Unit 4, Single Award, separate sciences, Irish-medium | Not her course; Unit 4 has near-zero uptake (02 §3; 03 §8). |
| Unreviewed AI-generated questions | Wrong questions destroy credibility; every item gets a human-checked worked solution (§10). |

| Link (attributed, outbound) | For |
|---|---|
| Corbettmaths videos and practice PDFs by number | the explanation route she already trusts (04 §2.1) |
| BBC Bitesize CCEA guides (M1–M8; Double Award article ids) | "read more" per topic (04 §2.9, 05 §1.2) |
| CCEA specification, Teacher Guidance scope limits, formula sheets, glossaries, fact files, FM Q&A booklets, practical manuals | the authoritative source at the top of every topic (01 §4, §8; 02 §7; 08 §7) |
| CCEA past papers and mark schemes from feeds 504/507/584 | PaperRunner (08 §3) |
| NI Maths Tutor paper solutions; Science Shorts, Chemistry Chicken, GCSE Physics Online | after a full paper (04 §2.20, 05 §2.19–2.20) |
| PhET sims (iframe, attribution) and selected GeoGebra applets | simulations inside tasks (05 §2.11, 07 §6) |

---

## 10. Risks and mitigations

| Risk | Why it is real | Mitigation |
|---|---|---|
| **Novelty wears off after week three** | Every study app faces the cliff; Duolingo's own data shows retention hinges on a habit loop (07 §2.2). | Reviews are the heartbeat and are always short; the plan changes every week because it runs from real dates; weekly (not daily) streaks with a freeze; if two weeks are missed the ask shrinks to "five minutes tonight"; the brother's notes are spaced for the mid-term dip; measure sessions/week over the first six weeks and adjust the default. |
| **Content thinness** — the honest biggest risk | One developer; ~400 maths statements, ~420 science outcomes, three FM units (data/spec/README.md; 01 §5). | Depth-first on the topics examiners flag; The Sheet + items before anything decorative; JSON authoring with the Zod schema and AI drafting; the map states coverage plainly and links out where content is thin; Phase 0 ships six deep topics, not sixty shallow ones. |
| **Errors in original questions** | A wrong answer key on a gift would be worse than no gift. | Every item has a worked solution checked by the brother; numeric/equivalence checks unit-tested; a "report a problem" tap on every item; items labelled "original, CCEA-style — not CCEA questions". |
| **Over-design / time sink** | Awwwards craft on the wrong surfaces (07 §1.3). | Tokens from three variables; shadcn/Base UI primitives; polish budgeted to the four surfaces; UI time-boxed to about 30% of Phase 0. |
| **Review overload or under-scheduling** | FSRS with too many decks becomes a wall; too few reviews and the forecast lies. | Daily cap; retention 0.90 with per-unit exam targets; park sat units; show the trade-off in words. |
| **Confidence ratings feel like judgement** | Teenagers, and girls in particular, report lower confidence independent of performance (Foster 2022, 06 §9). | Tone; confident-wrong framed as "worth fixing now"; calibration shown privately as a curve, never as a score. |
| **Misalignment with school** | Tutoring works when linked to lessons (06 §16). | The weekly "what are you doing in school?" picker steers the learn step. |
| **Data loss** | IndexedDB can be cleared; no backend. | Fortnightly export reminder; import; optional file backup to her own drive. |
| **Technical** | Mafs unmaintained since 2024; Turbopack/Windows path and watcher issues; KaTeX 0.18 CSS-prefix change (10 §4, §15). | Pin Mafs behind a wrapper; move the repo to `C:\dev\ccea`; test static export early; `--webpack` fallback. |
| **Legal** | CCEA copyright; Corbettmaths terms; PhET CC BY-NC; YouTube policies. | Deep-link only; link only; non-commercial use with attribution and untouched logo; nocookie embed, no overlays, no caching (08 §5; 04 §3; 05 §2.11; 10 §12). |
| **The gift lands wrong** | Pressure or cringe would undo the intent. | Notes are optional, few and short; no monitoring; she owns and can export or delete everything; the craft and the exam-truth are the gift, not the wrapping. |
| **Exam-year or series changes** | November 2027 resit-only; March 2028 no Science; reform from 2029 (09 §9). | Dates, units, tiers and boundaries are data files, not code; a "check your exam map" prompt each September. |
| **Unequal attention across subjects** | Maths depth could starve Science and FM. | The home screen's learn step rotates by nearest exam and weakest unit; Science decks and FM topics are in Phase 0, not deferred. |

---

### Appendix — the smallest content unit (for the author)

A **topic** = The Sheet (≤150 words, one diagram, "on the sheet / not on the sheet", traps) + 4–6 diagnostics with named distractors + a step-reveal note with 3–5 gates + one worked-example-as-question with a Your-Turn twin and two faded completions + 6–10 original items with mark points, hints, worked solutions and common-error patterns + 6–10 review prompts + 1–3 find-the-mistake items + outbound links. About one developer-day per topic with AI drafting and human checking; the six Phase 0 topics are the proof of the pipeline.
