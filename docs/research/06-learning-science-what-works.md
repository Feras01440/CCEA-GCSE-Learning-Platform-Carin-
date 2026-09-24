# 06 — Learning science: what actually produces high GCSE maths & science achievement

**Purpose.** An evidence review to drive the pedagogical design of a learning platform for a motivated 15–16-year-old sitting CCEA GCSE Mathematics and Science. For each technique it records: what it is, the best available evidence (effect sizes where they exist), boundary conditions, and concrete design implications. Every claim carries the URL it was taken from. Where a number could not be verified from the source itself, that is said explicitly.

**Date compiled:** 1 September 2026.

---

## 0. How to read the numbers (and why they disagree)

| Metric | Meaning | Rule of thumb |
|---|---|---|
| Cohen's *d* / Hedges' *g* | Difference between groups in standard-deviation units | 0.2 small, 0.5 medium, 0.8 large (lab). In real classrooms 0.2–0.4 is already substantial. |
| EEF "months of additional progress" | EEF Toolkit translation of effect sizes into months of learning over a year | +1 = ~0.05–0.09 SD; +5 ≈ 0.35–0.44 SD; +8 ≈ 0.6+ SD ([EEF Toolkit](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback)) |
| Improvement index (WWC) | Percentile-point gain for an average student | 30 points ≈ *d* 0.8 |

Two systematic cautions apply to everything below:

1. **Lab → classroom shrinkage.** The EEF's 2021 review *Cognitive science approaches in the classroom* (Perry et al.) found that retrieval, spacing, interleaving, worked examples and dual coding have "positive, replicable results" in laboratory and controlled classroom settings, but that "the evidence for the application of cognitive science principles in everyday classroom conditions is limited", effects are smaller and mixed, and interleaving "has only been tested in one subject area, mathematics". Dual coding is singled out for "lethal mutations" (decorative pictures that distract). Sources: [EEF review PDF](https://d2tic4wvo1iusb.cloudfront.net/documents/guidance/Cognitive_science_approaches_in_the_classroom_-_A_review_of_the_evidence.pdf), [EEF landing page](https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/cognitive-science-approaches-in-the-classroom), [Tes summary](https://www.tes.com/magazine/news/general/cognitive-science-classroom-impact-evidence-limited), [CIRL Eton summary](https://cirl.etoncollege.com/cognitive-science-a-review-of-the-evidence/).
2. **Experimenter-made tests inflate effects.** Kulik, Kulik & Bangert-Drowns (1990) found mastery-learning effects of ~0.5 on experimenter-built tests but ~0.08 on standardised tests ([Nintil summary of Kulik 1990](https://nintil.com/bloom-sigma/)). For a GCSE platform, the relevant outcome is *exam-format* performance after a delay, so weight studies with delayed, transfer or real-exam outcomes more heavily.

A platform is closer to the "controlled" end than a busy classroom is (it can enforce spacing, interleaving, feedback and criterion-based mastery automatically), so the lab effects are more attainable here than in a classroom — provided the student actually does the work.

---

## 1. Executive summary table

| # | Principle | Strength of evidence | Headline effect | Design implication (one line) |
|---|---|---|---|---|
| 1 | Retrieval practice / testing effect | Very strong (100+ yrs; multiple meta-analyses; classroom RCTs) | *g* ≈ 0.50 vs restudy (Adesope 2017; Yang 2021, 222 classroom studies) | Every learning object ends in a retrieval task, not a re-read. |
| 2 | Spacing / distributed practice | Very strong | Spaced retrieval vs massed *g* = 0.74 (Latimier 2021); optimal gap ≈ 10–20% of retention interval (Cepeda 2008) | Scheduler (FSRS) drives daily review; set desired retention ~0.9; plan gaps back from exam date. |
| 3 | Successive relearning (retrieval to criterion, repeated across sessions) | Strong (authentic course exams) | Course exam 84% vs 72%; "more than a full letter grade" (Rawson et al. 2013) | Mastery = 1–3 correct retrievals per item per session, across ≥3 spaced sessions. |
| 4 | Interleaving (mixed practice) | Strong in maths specifically; weaker elsewhere | *g* = 0.34 maths (Brunmair & Richter 2019); *d* = 0.83 in 787-student RCT, 61% vs 37% (Rohrer 2020); science quizzes *d* = 0.35 (Sana & Yan 2022) | After initial fluency, practice sets are mixed and problem type is never labelled. |
| 5 | Worked examples (CLT) | Very strong for novices | Sweller & Cooper 1985 onward; "best known" CLT effect | New topic → worked example → example–problem pair, not problem-first. |
| 6 | Expertise reversal + faded examples | Strong | Fading > example–problem pairs; backward fading best (Renkl 2002) | Guidance decays with demonstrated competence; never a fixed level of support. |
| 7 | Self-explanation | Strong | *g* = 0.55 (Bisra 2018, 69 effects) | Prompt "why is this step valid?" inside examples and after errors. |
| 8 | Elaborative interrogation | Moderate | ≈ *g* 0.56 in lab; Dunlosky rates "moderate utility" | Use for science facts ("why would that be true?"), not procedures. |
| 9 | Concrete → abstract (concreteness fading) | Moderate | Systematic review, no pooled ES (Fyfe 2014); EEF: manipulatives as a scaffold to remove | Representations (bar models, diagrams, particle pictures) fade to symbols. |
| 10 | Dual coding / multimedia principle | Strong in lab; "lethal mutation" risk in practice | Words+pictures ≈ 89% better transfer in Mayer's studies (secondary source) | Informational diagrams synchronised with narration; no decorative art. |
| 11 | Cognitive load management (segmenting, signalling, no redundancy, no split attention) | Strong | Mayer's principles; CESE 7 strategies | Short segments, integrated labels, narration not on-screen text duplication. |
| 12 | Mastery learning | Strong, with caveats | Kulik 1990 *d* ≈ 0.52 (0.61 low-attainers); EEF +5 months (+6 in maths/science); 80–90% threshold; self-paced versions weaker | Gate progression on ≥80% on a topic test; provide corrective loop, not just re-tries. |
| 13 | Deliberate practice | Concept useful, evidence for "hours" weak in education | Explains 4% of variance in education (Macnamara 2014) | Optimise *quality* of practice (targeted, feedback-rich), not minutes logged. |
| 14 | Feedback | Very strong but highly variable | EEF +6 months; Wisniewski 2020 *d* = 0.48 overall, high-information feedback *d* = 0.99, praise/reward ≈ 0.12–0.24; ~⅓ of feedback effects negative (Kluger & DeNisi) | Feedback = correct answer + why + what to do next; also confirm correct work. |
| 15 | Feedback timing | Nuanced | Classroom: immediate wins (Kulik & Kulik 1988); lab retention: delayed wins (Butler 2007) | Immediate correctness check + a *second*, spaced re-exposure to the correction. |
| 16 | Hypercorrection | Strong | High-confidence errors corrected more; effect persists 1 week but high-confidence errors return if forgotten (Butler 2011); replicated in 219k Eedi responses (Foster 2022) | Collect confidence on every answer; re-test confident errors soon and again later. |
| 17 | Erroneous examples / "find the mistake" | Strong (incl. web-tutor RCT) | Delayed-test *d* = 0.33 vs problem solving (McLaren 2015); students *liked it less* | Add find-and-fix tasks built from real GCSE misconceptions; expect lower "liking". |
| 18 | Diagnostic questions with misconception distractors | Strong rationale + large-scale data | Competitive distractors boost learning of related content (Little & Bjork 2015); lures need feedback (Marsh 2007) | Distractors map 1:1 to named misconceptions; always explain the distractor. |
| 19 | Pretesting / errorful generation | Strong | Pretest > posttest > control (Pan & Sana 2021, n = 1,573); unsuccessful retrieval helps (Kornell 2009) | Start each topic with a short diagnostic *before* teaching. |
| 20 | Variation theory / intelligent practice | Theory + practitioner evidence; little RCT evidence | NCETM "Big Idea"; Barton's Reflect–Expect–Check–Explain | Sequence practice so one thing changes at a time; ask what changed and why. |
| 21 | Rosenshine's principles | Synthesis of process–product research | Daily/weekly/monthly review; small steps; ~80% success rate; guided then independent practice | The lesson template of the platform. |
| 22 | Metacognition & self-regulation (EEF) | High impact, hard to realise | EEF +8 months (toolkit); guidance: 7 recommendations, plan–monitor–evaluate, taught *within* subject content | Plan–monitor–evaluate prompts embedded in maths/science tasks; never a generic "study skills" module. |
| 23 | Gamification | Positive on average, unstable, can backfire | *g* 0.49 cognitive / 0.36 motivational / 0.25 behavioural (Sailer & Homner 2020); leaderboards+badges lowered motivation, satisfaction and exam scores over 16 weeks (Hanus & Fox 2015); expected tangible rewards undermine intrinsic motivation *d* ≈ −0.28 to −0.40 (Deci 1999) | Progress and mastery feedback yes; leaderboards, streak-anxiety and rewards-for-showing-up no. |
| 24 | Video | Strong design evidence | ≤6 min; Khan-style drawing; talking-head informal; interpolated questions cut mind-wandering (Szpunar 2013); watching ≠ doing (Kardas & O'Brien 2018) | Micro-videos with a pause-and-answer every 2–3 min; never let watching count as "done". |
| 25 | Exam technique (format-matched practice, mark-scheme literacy, self-grading) | Moderate–strong indirect | Test-format consistency moderates testing effect (Yang 2021); self-grading *g* = 0.34 with rubrics + training (Sanchez 2017); retrieval practice reduces test anxiety (72% of 1,400+ pupils) | Timed past-paper mode with the real CCEA mark scheme; student marks first, system checks. |
| 26 | Tutoring structure (diagnose → teach → practise → paper → review) | Very strong for tutoring; structure from design-principle briefs | Tutoring 0.37 SD (Nickow 2020); EEF 1:1 +5 months with 30-min sessions 3–5×/week ≤10 weeks, linked to lessons; ≥3×/week, ≤3 pupils, consistent tutor, data-driven (NSSA) | Platform runs the tutor loop: short, frequent, diagnostic-led, curriculum-aligned sessions. |

---

## 2. Retrieval practice (the testing effect)

**What it is.** Recalling information from memory (quizzes, flashcards, blank-page recall, practice questions) rather than re-reading it.

**Evidence.**
- Roediger & Karpicke (2006), *Psychological Science* 17(3): taking a memory test improves long-term retention more than restudying — the modern origin. [DOI](https://doi.org/10.1111/j.1467-9280.2006.01693.x)
- Adesope, Trevisan & Sundararajan (2017), *Review of Educational Research* 87(3) 659–701, 272 effects: practice testing *g* = **0.51 vs restudy**, **0.93 vs no activity**; multiple-choice format *g* = 0.70 vs short answer 0.48; retention interval of 1–6 days gave the largest effect (0.82); a single practice test was, surprisingly, at least as effective as several. [Sage](https://journals.sagepub.com/doi/abs/10.3102/0034654316689306), [ERIC](https://eric.ed.gov/?id=EJ1141817), [moderator summary](https://theeconomyofmeaning.com/2017/03/21/important-new-meta-analysis-on-the-testing-effect-with-some-surprises/)
- Yang et al. (2021), *Psychological Bulletin*: 222 independent **classroom** studies, 48,478 students, *g* = **0.499**; effect moderated by provision of corrective feedback, number of test repetitions, **test-format consistency** and **material matching** between practice and final test. [DOI](https://doi.org/10.1037/bul0000309)
- Karpicke & Blunt (2011), *Science* 331: 772–775: retrieval practice beat elaborative concept mapping on a one-week test *including inference questions*, and students predicted the opposite. [DOI](https://doi.org/10.1126/science.1199327), [PubMed](https://pubmed.ncbi.nlm.nih.gov/21252317/), [notes](https://notes.andymatuschak.org/zFUBZG5yY1aKJ4hpak2jWPA)
- Roediger, Agarwal, McDaniel & McDermott (2011), *JEP: Applied* 17: 382–395 — long-term gains from low-stakes classroom quizzing in middle school. [DOI](https://doi.org/10.1037/a0026252)
- Agarwal et al. (2014), *JARMAC* 3: 131–139: across 1,400+ US middle/high-school students, **92%** said retrieval practice helped them learn and **72%** said it made them *less* nervous about tests. [DOI](https://doi.org/10.1016/j.jarmac.2014.07.002), [summary](https://evidencebased.education/resource/retrieval-practice-and-student-wellbeing/)
- Karpicke, Butler & Roediger (2009), *Memory*: students left to themselves overwhelmingly reread rather than self-test. [DOI](https://doi.org/10.1080/09658210802647009)
- Dunlosky et al. (2013), *PSPI* 14(1): practice testing and distributed practice are the only two "high utility" techniques of ten; rereading, highlighting, summarising rated low. [Sage](https://journals.sagepub.com/doi/10.1177/1529100612453266), [APS summary](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html)
- Donoghue & Hattie (2021), *Frontiers in Education*: 242 studies, 1,619 effects, 169,179 participants, mean 0.56; distributed practice and practice testing most effective; stronger effects for lower-ability learners; feedback is a key moderator. [DOI](https://doi.org/10.3389/feduc.2021.581216)

**Boundary conditions.** Multiple-choice lures can implant errors unless feedback is given (see §9). Retrieval must be *successful often enough* to be motivating (Rosenshine's ~80%). Retrieval that is *format-matched* to the final exam transfers best (Yang 2021).

**Design implications.**
1. No passive "mark as read". Every note, video and worked example terminates in a retrieval task (free recall, short answer, or MC with misconception distractors).
2. Default study mode is "attempt first, then see the solution" — the platform should never show the answer before an attempt unless the student explicitly asks for a worked example.
3. Use *mixed* formats: short-answer/free-response for procedures (harder, higher-order), MC diagnostics for concept checks.
4. Track and show the student that their anxiety-reducing "practice under mild pressure" is deliberate — Agarwal's data is a useful message for motivated but anxious students.

---

## 3. Spacing, distributed practice and the scheduler (FSRS vs SM-2)

**Evidence.**
- Cepeda, Pashler, Vul, Wixted & Rohrer (2006), *Psychological Bulletin* 132: 354–380: 839 assessments, 317 experiments, 184 articles. Inter-study interval (ISI) and retention interval (RI) "operate jointly"; the ISI that maximises retention *increases* as RI increases. [Cepeda lab page](https://www.yorku.ca/ncepeda/publications/CPVWR2006.html)
- Cepeda, Vul, Rohrer, Wixted & Pashler (2008), *Psychological Science* 19(11): >1,350 people, gaps up to 3.5 months, tests up to 1 year later. Optimal gap ≈ **20–40% of a 1-week retention interval, falling to 5–10% of a 1-year interval**; "many educational practices are highly inefficient". [Sage abstract](https://journals.sagepub.com/doi/10.1111/j.1467-9280.2008.02209.x)
- Latimier, Peyre & Ramus (2021), *Educational Psychology Review* 33: 959–987, 29 studies: spaced retrieval vs massed retrieval *g* = **0.74**; expanding vs uniform schedules *g* = 0.034 (no difference) — expanding only helps when items are retrieved many times. [Springer](https://link.springer.com/article/10.1007/s10648-020-09572-8)
- Rohrer & Taylor (2007), *Instructional Science* 35: 481–498: in maths, spacing practice across sessions "much greater" performance at 1 week than massing; mixing problem types "vastly superior". [Springer](https://link.springer.com/article/10.1007/s11251-007-9015-8)
- Kang (2016), *Policy Insights from the Behavioral and Brain Sciences* 3(1): spaced practice improves "memory, problem solving, and generalization"; adding tests to spaced practice "amplifies the benefits". [Sage](https://journals.sagepub.com/doi/10.1177/2372732215624708)
- Carpenter, Pan & Butler (2022), *Nature Reviews Psychology*: review of spacing + retrieval. [DOI](https://doi.org/10.1038/s44159-022-00089-1)

**Algorithms.** SM-2 (SuperMemo 1987; classic Anki) adjusts an "ease factor" per card; it has no explicit memory model and suffers "ease hell". Half-life regression (Duolingo, Settles & Meeder 2016 [ACL](https://doi.org/10.18653/v1/P16-1174)) and FSRS (Free Spaced Repetition Scheduler) fit a difficulty–stability–retrievability model to the learner's review history and schedule the next review to hit a *target probability of recall*.

Benchmark on Anki review logs (open-spaced-repetition `srs-benchmark`, 9,999 collections / ~350 M reviews, time-series split so no future leakage):

| Algorithm | Log loss ↓ | RMSE(bins) ↓ | AUC ↑ | Params |
|---|---|---|---|---|
| RWKV-Instant (neural, reference ceiling) | 0.2773 | 0.0250 | 0.833 | 2.76 M |
| FSRS-7 (recency) | 0.3370 | 0.0593 | 0.722 | 34 |
| FSRS-6 | 0.3460 | 0.0653 | 0.703 | 21 |
| HLR (Duolingo) | 0.4694 | 0.1275 | 0.637 | 3 |
| SM-2 (Anki legacy) | ≈0.58 | ≈0.13 | ≈0.60 | 3 |

Sources: [srs-benchmark README](https://github.com/open-spaced-repetition/srs-benchmark) (FSRS/HLR/RWKV rows), [Expertium benchmark page](https://expertium.github.io/Benchmark.html) (SM-2 row, approximate; states FSRS-6 has "99.6% superiority over Anki SM-2", i.e. lower log loss for 99.6% of users, and cautions that SM-2 "wasn't originally designed to predict probabilities"). Secondary sources quoting an earlier benchmark version report SM-2 retention RMSE ≈ 16% vs FSRS-5 ≈ 5% and 20–30% fewer reviews for the same retention ([DeckStudy](https://deckstudy.com/blog/fsrs-vs-sm2-modern-spaced-repetition)); treat those exact figures as indicative. See also [fsrs-vs-sm17](https://github.com/open-spaced-repetition/fsrs-vs-sm17).

Anki's FSRS documentation: default **desired retention 0.90** ("good balance of retention and workload"); above ~0.97 workload becomes overwhelming; the retention–workload relationship is exponential (roughly +5 pp retention ≈ +35% study time); parameters should be re-optimised roughly monthly once enough reviews exist. [Anki manual](https://docs.ankiweb.net/deck-options.html)

**Design implications.**
1. Use an FSRS-class scheduler (open-source implementations exist) with per-student optimised parameters; SM-2 is strictly dominated.
2. Set desired retention ≈ 0.90 by default; allow 0.93–0.95 for the last 6 weeks before the exam when the retention interval is short and workload is worth it.
3. Plan backwards from the exam date: for a topic that must be retained for ~3 months, first review gaps of ~1–3 weeks are near-optimal (Cepeda 2008); do not let the scheduler push an item's first review beyond the exam.
4. Do not bother with "expanding" schedules as a principle; uniform vs expanding is a wash (Latimier 2021). What matters is that each review is a *retrieval*, not a re-read.
5. Show the student the workload/retention trade-off in plain language; hide the algorithm.
6. Interleave the daily review queue across topics (see §5) — FSRS makes this natural because it schedules items, not topics.

---

## 4. Successive relearning (mastery-by-retrieval across sessions)

**Evidence.** Rawson, Dunlosky & Sciartelli (2013), *Educational Psychology Review* 25: 523–548: retrieval to criterion, then relearning in spaced sessions, produced "meaningful improvements in course exam performance and on long-term retention tests" in real university courses [Springer](https://link.springer.com/article/10.1007/s10648-013-9240-4); secondary summaries report exam scores of 84% vs 72% and "more than a full letter grade", with the original protocol of 6 sessions over 3 weeks to a criterion of 3 correct recalls, and later work showing even a criterion of 1 correct recall per session works ([Furst summary](https://sites.google.com/view/efratfurst/teaching-with-learning-in-mind/successive-relearning)). Rawson & Dunlosky (2022), *Current Directions* 31(4): the technique "practicing a task until it is performed correctly and then practicing it again … during other spaced practice sessions" — and the research agenda should treat *time to mastery* as an outcome, not fix time on task. [Sage (open access)](https://journals.sagepub.com/doi/full/10.1177/09637214221100484)

**Design implications.**
- Define "learned" per item as: retrieved correctly to criterion (1 correct in the first session, then 1 correct in each of ≥3 further spaced sessions). Report time-to-mastery, not minutes studied.
- This is the operational form of "mastery learning" for facts, definitions, formulae, key procedures; it dovetails with the FSRS queue.

---

## 5. Interleaving vs blocking

**Evidence.**
- Brunmair & Richter (2019), *Psychological Bulletin* 145(11): 1029–1052, 59 studies, 238 effects: overall *g* = **0.42**; **mathematical tasks *g* = 0.34**; visual category learning 0.67; expository texts non-significant; word lists *negative* (*g* = −0.39). Interleaving works best when categories are similar *between* each other and items are dissimilar *within* — i.e. when the skill is discriminating which method applies. [APA](https://doi.org/10.1037/bul0000209)
- Rohrer, Dedrick & Stershic (2015), *JEP* 107: 900–908, 7th-grade algebra, cluster RCT (WWC "meets standards without reservations", improvement index +30 and +29 percentile points): interleaved practice scored ~25% higher at 1 day and **~76% higher at 30 days** (≈80% → 74% for interleaved vs ≈64% → 42% for blocked). [ERIC full text](https://files.eric.ed.gov/fulltext/ED557355.pdf), [WWC](https://ies.ed.gov/ncee/wwc/Study/89950), [numbers](https://www.justinmath.com/cognitive-science-of-learning-interleaving/)
- Rohrer, Dedrick, Hartwig & Cheung (2020), *JEP* 112(1): 40–52, pre-registered cluster RCT, **787 students, 54 classes**, test ≥1 month later: interleaved **61% vs blocked 37%**, ***d* = 0.83** [0.68, 0.97]. Interleaved assignments took more time; the authors note the per-minute effect would be smaller. [PDF](https://gwern.net/doc/psychology/spaced-repetition/2019-rohrer.pdf), [notes](https://notes.andymatuschak.org/zHvJf88XUgLPMhdTigkoiUR)
- Sana & Yan (2022), *Psychological Science*, 155 high-school science students over 4 weeks: interleaved weekly quizzes 63% vs blocked quizzes 54% (*d* = 0.35); blocked quizzes vs no quiz *d* = 0.30 — so interleaving *retrieval* works in science too. [PDF](https://pdf.retrievalpractice.org/spacing/InterleavedRetrievalPracticePromotesScienceLearning_SanaYan_2022.pdf)
- Rohrer & Taylor (2007) as above. Craig Barton's SSDD ("Same Surface, Different Deep") problems are a maths-specific implementation: problems that look alike but need different methods, forcing strategy selection. [ssddproblems.com](https://ssddproblems.com/)
- Caveat: the EEF review notes interleaving evidence is almost entirely in maths; UK trials with GCSE-age pupils are few (Foster and colleagues have run classroom experiments on angle facts with mixed results — see [Foster's articles list](https://www.foster77.co.uk/articles.html)).

**Mechanism.** Blocked practice tells you the method before you read the problem; exams don't. Interleaving trains *discrimination* — "which technique?" — which is exactly what GCSE papers test when a question on ratio sits next to one on similar triangles.

**Design implications.**
1. Introduce each new skill with a short *blocked* set (to reach initial fluency), then switch the practice engine to mixed sets where no two consecutive questions share a method and the topic is not shown in the question header.
2. Build SSDD-style sets for the CCEA specification: same context/diagram, different demand (e.g. one trapezium → area, perimeter with Pythagoras, angle, similar shapes; one graph → gradient, y-intercept, area under, rate).
3. Make the *daily review queue* topic-mixed by construction (FSRS item-level scheduling does this).
4. Warn the student that mixed practice feels harder and slower and that this is the point (Rohrer: blocked practice gives "a false sense of mastery").
5. Science: interleave retrieval across concepts within a unit (Sana & Yan), e.g. mixing ionic/covalent/metallic bonding questions rather than quizzing one at a time.

---

## 6. Worked examples, cognitive load theory, expertise reversal, faded examples, example–problem pairs

**Evidence.**
- Sweller & Cooper (1985), *Cognition and Instruction* 2(1): 59–89: in algebra, studying worked examples beat conventional problem solving for novices; it is "the best known and most widely studied" CLT effect. [T&F](https://www.tandfonline.com/doi/abs/10.1207/s1532690xci0201_3), [overview](https://en.wikipedia.org/wiki/Worked-example_effect)
- Kalyuga, Ayres, Chandler & Sweller (2003), *Educational Psychologist* 38(1): 23–31 — the **expertise reversal effect**: "instructional techniques that are highly effective with inexperienced learners can lose their effectiveness and even have negative consequences when used with more experienced learners" (worked examples, integrated text, prompts). Remedy: fading and rapid diagnostic assessment to adapt guidance. [T&F](https://doi.org/10.1207/S15326985EP3801_4), [Chartered College summary](https://my.chartered.college/impact_article/expertise-reversal-effect-and-its-instructional-implications/), [overview](https://en.wikipedia.org/wiki/Expertise_reversal_effect)
- Renkl, Atkinson, Maier & Staley (2002), *Journal of Experimental Education* 70(4): 293–315: **faded** examples (complete example → increasingly incomplete examples → problem) beat traditional example–problem pairs on near transfer; **backward fading** (remove the last step first) beat forward fading; fewer errors during learning mediated the benefit. [T&F](https://doi.org/10.1080/00220970209599510)
- van Gog, Kester & Paas (2011), *Contemporary Educational Psychology*: for novices, worked examples and example–problem pairs outperform problem–example pairs and problem solving alone. [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0361476X1000055X)
- NSW CESE (2017) *Cognitive load theory: research that teachers really need to understand* — seven strategies: tailor to existing knowledge; use worked examples for new content; gradually increase independent problem solving; cut inessential information; present essential information together (no split attention); present orally *and* visually; encourage students to visualise (imagination effect). [PDF](https://education.nsw.gov.au/content/dam/main-education/about-us/educational-data/cese/2017-cognitive-load-theory-practice-guide.pdf), [HTML](https://education.nsw.gov.au/about-us/education-data-and-research/cese/publications/practical-guides-for-educators/cognitive-load-theory-in-practice)
- Craig Barton's practice: "example–problem pairs" with a "Your Turn" that is structurally identical to the example, silent modelling, then self-explanation; *How I Wish I'd Taught Maths* (2018) and *Tips for Teachers* (2022). [Example and Your Turn](http://mrsmahoney.co.uk/example-and-your-turn/), [Tips for Teachers](https://tipsforteachers.co.uk/book/), [book](https://www.amazon.com/How-Wish-Taught-Maths-conversations/dp/1943920583), [Gowers' review](https://gowers.wordpress.com/2018/12/22/how-craig-barton-wishes-hed-taught-maths/)

**Design implications.**
1. Topic-teaching template: (a) one fully worked example with narration of *why* each step; (b) a "Your Turn" twin problem (same structure, different numbers); (c) 2–3 backward-faded completion problems (student supplies the last step, then last two…); (d) independent problems; (e) mixed practice later.
2. Adaptive fading: the number of worked-out steps shown is a function of the student's current accuracy on that skill — a student at ≥80% sees problems, a student at <50% sees examples again. Never show full worked examples to a student who has already demonstrated fluency (expertise reversal).
3. Presentation hygiene (CLT): labels *on* the diagram, not in a key; narration rather than duplicated on-screen text; one idea per screen; strip decorative content; pre-teach vocabulary/notation before the main example (Mayer's pre-training principle).
4. Science: worked examples are equally valid for calculations (moles, F = ma, specific heat) and for *extended-response structure* (6-mark questions) — model the answer, then fade.

---

## 7. Self-explanation, elaborative interrogation

**Evidence.**
- Chi et al. (1989), *Cognitive Science* 13: good learners spontaneously explain worked-example steps to themselves. [DOI](https://doi.org/10.1207/s15516709cog1302_1)
- Bisra, Liu, Nesbit, Salimi & Winne (2018), *Educational Psychology Review* 30: 703–725: 69 effects from 64 reports (~5,900 participants), induced self-explanation *g* = **0.55**, effective "across a range of instructional conditions". [Springer](https://link.springer.com/article/10.1007/s10648-018-9434-x), [ERIC](https://eric.ed.gov/?id=EJ1186664), [BPS digest](https://www.bps.org.uk/research-digest/self-explanation-powerful-learning-technique-according-meta-analysis-64-studies)
- Dunlosky et al. (2013): self-explanation and elaborative interrogation ("why would this be true?") rated *moderate* utility because evidence is narrower; lab effect for elaborative interrogation is similar in size (~0.56) to self-explanation. [PSPI](https://journals.sagepub.com/doi/10.1177/1529100612453266)
- Mayer, Fiorella & Stull (2020): "generative activity principle" — prompts to summarise or explain during video improve learning. [Springer](https://link.springer.com/article/10.1007/s11423-020-09749-6)
- Booth, Lange, Koedinger & Newton (2013): explaining worked (and incorrect) examples during guided practice improved conceptual understanding in Algebra I (Cognitive Tutor) — WWC "meets standards without reservations". [ERIC](https://eric.ed.gov/?id=ED543090)

**Design implications.**
1. In worked examples, insert "Why is this step allowed?" menus (menu-based prompts are cheap and still effective) and occasionally open-text "explain to a friend" boxes.
2. After a wrong answer, before showing the solution, ask "Which step do you think went wrong and why?" (self-explanation + error analysis).
3. Science facts: use elaborative interrogation prompts ("*Why* does increasing temperature increase rate?") rather than restating.
4. Keep prompts short; long open-ended writing on a screen is a compliance risk for a 15-year-old — a menu of 3 candidate explanations, one correct, is a diagnostic *and* a self-explanation.

---

## 8. Feedback: what kind, and when

**Evidence.**
- Hattie & Timperley (2007), *Review of Educational Research* 77(1): 81–112. Table 1 of the paper lists 12 meta-analyses ranging from 1.24 (special-education feedback) and 1.13 (cues and corrective feedback) down to 0.28 (immediate vs delayed; feedback from testing), 0.14 (rewards/punishments) and **0.12 (teacher praise)**. Their model: three questions (where am I going / how am I going / where next) and four levels (task, process, self-regulation, *self*) — feedback about the self (praise) is least effective. [Sage](https://journals.sagepub.com/doi/10.3102/003465430298487)
- Kluger & DeNisi (1996): 131 studies, mean 0.38, and about **one third of feedback interventions decreased performance**. [ResearchGate](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory)
- Wisniewski, Zierer & Hattie (2020), *Frontiers in Psychology*, 435 studies, 61,000+ participants: overall ***d* = 0.48**; **reinforcement/punishment *d* = 0.24; corrective feedback *d* = 0.46; high-information feedback (task + process + self-regulation) *d* = 0.99**; cognitive outcomes 0.51, motivational 0.33; "feedback is more effective, the more information it contains"; 86% of negative motivational effects came from reward/punishment formats. [Frontiers](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full)
- EEF Toolkit *Feedback*: **+6 months** (extensive evidence), verbal +7, written +5, **digital +4**, "slightly higher effects in mathematics and science"; feedback "can have negative effects"; must give feedback when work is *correct*, not only on errors; students need "opportunities to act upon the feedback". [EEF](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback)
- Timing: Kulik & Kulik (1988), 53 studies — applied classroom studies favour **immediate** feedback, laboratory acquisition studies favour delayed. [ERIC](https://eric.ed.gov/?id=EJ375720). Butler, Karpicke & Roediger (2007), *JEP: Applied* 13(4): 273–281 — after a multiple-choice test, **delayed feedback produced better delayed cued recall than immediate feedback** (a spacing effect), and answer-until-correct was no better than simply showing the answer. [APA](https://doi.org/10.1037/1076-898X.13.4.273). Metcalfe, Kornell & Finn (2009) similar. [PDF](https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Metcalfe.Kornell.Finn.2009.pdf)
- Sadler (1989), *Instructional Science* 18: 119–144: to improve, students must (i) know what high-quality work is, (ii) be able to compare their own work to it, (iii) have tactics to close the gap — "instructional systems which do not make explicit provision for the acquisition of evaluative expertise are deficient". [Springer](https://link.springer.com/article/10.1007/BF00117714)
- Black & Wiliam (1998), *Assessment in Education* 5(1): 7–74 — the formative-assessment review. [DOI](https://doi.org/10.1080/0969595980050102)
- Bloom (1984) listed "feedback–corrective (mastery learning)" at an effect size of ~1.0 among "alterable variables" (see §11). [Wikipedia](https://en.wikipedia.org/wiki/Bloom%27s_2_sigma_problem)

**Design implications.**
1. Every answer gets *immediate* correctness + the correct answer + a one-line **process** explanation ("you subtracted before dividing; order of operations") + a *next step* ("try this twin"). This is "high-information" feedback (0.99), not "✓/✗" (0.24).
2. Confirm correct work explicitly and briefly ("correct — and your method of factorising first is the efficient one"); EEF says correct-work feedback matters.
3. Engineer a **second exposure**: every corrected item returns 1–3 days later as a retrieval item (delayed-feedback benefit without sacrificing immediate correction).
4. Avoid grade-only or praise-only feedback and avoid tying feedback to rewards (see §14).
5. Feedback must be *actionable* on the platform immediately (a "fix it now" twin problem), otherwise it is decoration.

---

## 9. Hypercorrection, errors, erroneous examples, diagnostic questions and confidence

**Evidence.**
- Butterfield & Metcalfe (2001): errors made with **high confidence are more likely to be corrected** after feedback than low-confidence errors (attention/surprise). [ResearchGate](https://www.researchgate.net/publication/11641193_Errors_Committed_with_High_Confidence_Are_Hypercorrected), [overview](https://en.wikipedia.org/wiki/Hypercorrection_(psychology))
- Butler, Fazio & Marsh (2011), *Psychonomic Bulletin & Review* 18: 1238–1244: the effect **persists at one week**, but correction decays and, when the correct answer is forgotten, high-confidence errors are *more* likely to be reproduced. [Springer](https://link.springer.com/article/10.3758/s13423-011-0173-y)
- Metcalfe (2017), *Annual Review of Psychology*, "Learning from errors": errorful learning with corrective feedback beats error-avoidance. [DOI](https://doi.org/10.1146/annurev-psych-010416-044022)
- Foster, Woodhead, Barton & Clark-Wilson (2022), *Educational Studies in Mathematics* 109: 491–521: **219,826 responses from 7,302 UK pupils (6–16)** to Eedi diagnostic questions with 5-point confidence ratings: confidence positively related to correctness; boys report higher confidence than girls; disadvantaged pupils report lower confidence independent of performance; first evidence of **hypercorrection in an authentic school setting**. [DOI](https://doi.org/10.1007/s10649-021-10084-7)
- Kornell, Hays & Bjork (2009), *JEP:LMC*: **unsuccessful retrieval attempts enhance subsequent learning** — guessing wrong before being told the answer beats being told first. [APA](https://doi.org/10.1037/a0015729), [PDF](https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Kornell.Hays.Bjork.2009.pdf)
- Pan & Sana (2021), five experiments, n = 1,573: both pretesting and post-testing beat no test; **pretesting yielded higher scores**, apparently by focusing attention on what is not yet known. [OSF preprint](https://osf.io/preprints/psyarxiv/un87v_v1), [Pan lab](https://sc-pan.github.io/research.html)
- **Erroneous examples.** Durkin & Rittle-Johnson (2012), *Learning and Instruction* 22 (N = 74, decimals): comparing incorrect with correct examples improved conceptual and procedural knowledge more than comparing two correct examples, across prior-knowledge levels. [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0959475211000880). Booth et al. (2013): incorrect examples "may be especially beneficial for fostering conceptual understanding" in algebra. [ERIC](https://eric.ed.gov/?id=ED543090). McLaren, Adams & Mayer (2015), *IJAIED* 25: 520–542 (N = 390, web-based tutor): find-explain-fix erroneous examples equalled problem solving on the immediate test but beat it on a **one-week delayed test (*d* = 0.33)** — while students *liked* problem solving more (*d* = 0.21) — "what students like does not always lead to the best learning". [Springer](https://link.springer.com/article/10.1007/s40593-015-0064-x)
- **Multiple-choice design.** Little & Bjork (2015), *Memory & Cognition* 43: 14–26: MC questions with **competitive** (plausible) alternatives enhance later recall of the tested *and related* information; non-competitive alternatives give no such benefit; competitive lures did not increase intrusions. [Springer](https://link.springer.com/article/10.3758/s13421-014-0452-8). Marsh, Roediger, Bjork & Bjork (2007): selecting lures can create false knowledge ("negative testing effect"); Butler & Roediger (2008): feedback **halves** lure intrusions. [Marsh 2007](https://link.springer.com/article/10.3758/BF03194051), [Butler & Roediger 2008](https://link.springer.com/article/10.3758/MC.36.3.604), [Learning Scientists](https://www.learningscientists.org/blog/2018/8/2)
- **Craig Barton's diagnostic-question rules** (Eedi / Diagnostic Questions): one correct answer plus three distractors, each "designed to reveal a specific mistake or misconception"; single skill/step; unambiguous; answerable in ~10–20 seconds; and "it should not be possible to get the question correct for the wrong reasons". Use at Do-Now, before new content, after modelling, as hinge questions and exit tickets. [What makes a good diagnostic question](https://medium.com/eedi/what-makes-a-good-diagnostic-question-b760a65e0320), [What is a diagnostic question](https://medium.com/eedi/what-is-a-diagnostic-question-13bb85c64062), [Tips for Teachers](https://tipsforteachers.co.uk/diagnostic-questions/)
- EEF *Improving Mathematics in KS2/3*: "knowledge of common misconceptions can be invaluable in planning lessons to address errors before they arise"; misconceptions are "part of typical mathematical development". EEF *Improving Secondary Science* Recommendation 1: elicit preconceptions, confront with conflicting evidence, and revisit misconceptions over time with formative assessment. [Maths](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3), [Science](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/science-ks3-ks4)

**Design implications.**
1. **Confidence on every diagnostic answer** (a 3- or 5-point slider). Confident-wrong answers go to a "hypercorrection" queue: corrected immediately with an explanation of *the specific misconception behind the chosen distractor*, re-tested within 1–3 days and again at ~1 week, because those errors return if not consolidated.
2. **Distractor authoring standard**: each distractor tagged with a named misconception (e.g. "adds denominators", "treats 0.35 as bigger than 0.5 because it has more digits", "confuses mass and weight"), and the explanation shown when chosen addresses that tag.
3. **Start every topic with a 4–6 item diagnostic before any teaching** (pretesting + diagnosis); route the student to the sub-skills that failed.
4. Build a bank of **find-the-mistake** items from CCEA examiner-report style errors; present them as a distinct task type in mixed practice, with the expectation that they will be rated less "fun" than plain questions.
5. Track a per-student **misconception profile** (not just topic scores) and re-probe each misconception on a spaced schedule until it has been rejected under confident conditions several times.

---

## 10. Variation theory, intelligent practice, concrete → abstract, dual coding

**Variation theory / intelligent practice.**
- NCETM's *Five Big Ideas in Teaching for Mastery*: Coherence, Representation & Structure, Mathematical Thinking, Fluency, **Variation** — conceptual variation ("varying how a concept is represented to draw attention to critical features") and procedural variation (purposeful sequencing so that "what's the same, what's different" exposes structure). [NCETM](https://www.ncetm.org.uk/teaching-for-mastery/mastery-explained/five-big-ideas-in-teaching-for-mastery/), [variation handout](https://www.ncetm.org.uk/media/8d85bba06845025/variation_handout_september_2020.pdf), [research page](https://www.ncetm.org.uk/teaching-for-mastery/mastery-explained/supporting-research-evidence-and-argument/), [practitioner account](https://www.ncetm.org.uk/features/how-variation-has-changed-my-teaching/)
- Craig Barton's variationtheory.com sequences and the *Reflect, Expect, Check, Explain* routine (2020 book): questions where "key features between questions and examples" are held constant while one thing changes, so the student *predicts* the answer before computing it. [variationtheory.com](https://variationtheory.com/)
- Honest evidence note: variation theory rests on Marton's phenomenography and East-Asian practice rather than RCTs; the EEF's cognitive-science review does not evaluate it directly. Its mechanism overlaps with interleaving (discrimination) and with Rosenshine's "small steps".

**Concrete → abstract (concreteness fading).** Fyfe, McNeil, Son & Goldstone (2014), *Educational Psychology Review* 26: 9–25: begin with concrete materials "and then explicitly and gradually fade to the more abstract"; benefits: grounding symbols, embodied experience, memorable images, and learning to strip away extraneous properties. [Springer](https://link.springer.com/article/10.1007/s10648-014-9249-3), [ERIC](https://eric.ed.gov/?id=EJ1036777). EEF KS2/3 maths: manipulatives and representations "need to be used purposefully" and seen "as a scaffold, which is gradually removed". [EEF](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3)

**Dual coding / Mayer's multimedia principles.** Mayer's twelve principles — multimedia, coherence, signalling, redundancy, spatial & temporal contiguity, segmenting, pre-training, modality, personalisation, voice, image. [List](https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning). Secondary sources report Mayer's core finding that words + pictures produced ~89% better transfer than words alone across 11 experiments and temporal contiguity ~*d* 1.3 ([Growth Engineering](https://www.growthengineering.co.uk/dual-coding/)) — treat as indicative. The Learning Scientists: dual coding is *combining* verbal and visual, "not learning styles"; have students explain visuals without the text and draw from memory. [Learning Scientists](https://www.learningscientists.org/blog/2016/9/1-1). EEF review warning: irrelevant illustrations "work more as a distraction". [Tes](https://www.tes.com/magazine/news/general/cognitive-science-classroom-impact-evidence-limited)

**Design implications.**
1. Practice sets for a new procedure are *minimally varied* sequences (one number changes; sign flips; the unknown moves) with a "predict, then check" affordance; this precedes mixed practice.
2. Every maths topic has a canonical representation chain (bar model → number line → algebra; area model → expanded brackets; ratio table → equation) and the UI fades it: representation shown → representation available on request → symbols only.
3. Science: every abstract model (particle model, field lines, circuits) is introduced with the concrete phenomenon and one *informational* diagram, and retrieval tasks include "draw and label from memory".
4. Ban decorative imagery, background music and animated mascots on content screens.

---

## 11. Mastery learning, Bloom's 2-sigma, deliberate practice, Rosenshine

**Mastery learning.**
- Bloom (1984), *Educational Researcher* 13(6): one-to-one tutoring with mastery learning ≈ 2 SD; mastery learning alone ≈ 1 SD; "feedback–corrective" ≈ 1.0. [Wikipedia](https://en.wikipedia.org/wiki/Bloom%27s_2_sigma_problem)
- Kulik, Kulik & Bangert-Drowns (1990), *RER* 60(2): 108 controlled evaluations; positive effects on exam performance, "stronger on the weaker students"; self-paced programmes reduced completion rates. [Sage](https://journals.sagepub.com/doi/10.3102/00346543060002265). Secondary summary: overall *d* ≈ 0.52; low-ability 0.61, high-ability 0.40; ~0.08 on standardised tests vs ~0.50 on experimenter tests. [Nintil](https://nintil.com/bloom-sigma/)
- EEF Toolkit *Mastery learning*: **+5 months** (limited evidence); **+6 in maths and science**, +3 for secondary pupils; success threshold of **80–90%** matters; "much less effective when pupils work at their own pace"; collaborative elements help; requires diagnostic assessment, careful sequencing, monitoring and *additional support* for those who struggle. [EEF](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/mastery-learning)

**Deliberate practice.** Macnamara, Hambrick & Oswald (2014), *Psychological Science* 25(8): deliberate practice explains 26% of variance in games, 21% music, 18% sports, **4% education**, <1% professions. [Sage](https://journals.sagepub.com/doi/10.1177/0956797614535810). Ericsson's response argues they over-broadly counted any structured activity ([PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8049893/)). Takeaway: *hours* are a weak lever; *what* the practice is (targeted, feedback-rich, at the edge of competence) is the lever — which is what the rest of this document specifies.

**Rosenshine (2012), *Principles of Instruction*, American Educator.** Ten principles: (1) begin with a short review of previous learning; (2) present new material in small steps with practice after each; (3) ask many questions and check all students' responses; (4) provide models/worked examples; (5) guide student practice; (6) check for understanding; (7) obtain a high success rate (~80%); (8) provide scaffolds for difficult tasks; (9) require and monitor independent practice; (10) engage in weekly and monthly review. [AFT](https://www.aft.org/ae/spring2012/rosenshine), [ERIC](https://eric.ed.gov/?id=EJ971753), [Sherrington's strands](https://teacherhead.com/2018/06/10/exploring-barak-rosenshines-seminal-principles-of-instruction-why-it-is-the-must-read-for-all-teachers/), [summary](https://www.structural-learning.com/post/rosenshines-principles-a-teachers-guide)

**Design implications.**
1. Topic gate = ≥80% on a mixed, delayed check (not an immediate post-test), with the "corrective" being *different* instruction (a different representation or a faded example), not simply "try again".
2. Do not build a purely self-paced sandbox; give the student a paced plan with dates (EEF: self-paced mastery underperforms; Kulik: lower completion).
3. Session skeleton = Rosenshine: 5-minute spaced review → small-step teaching with a check after each step → guided practice with feedback → independent practice → mixed/cumulative review weekly and monthly.
4. Success-rate governor: if rolling accuracy in a session drops below ~70%, step back (more support, easier variants); if above ~90%, step up (fade, interleave, harder variants). This is the practical form of "desirable difficulty" (Bjork) — difficulties must be surmountable ([overview](https://en.wikipedia.org/wiki/Desirable_difficulty)).

---

## 12. Metacognition and self-regulated learning (EEF)

- EEF Toolkit strand *Metacognition and self-regulation*: **+8 months** (very low cost, extensive evidence), "however, it can be difficult to realise this impact in practice"; strategies should be "taught and applied to the usual curriculum content, rather than taught discretely through 'thinking skills' lessons"; teachers model thinking aloud "when planning an exam response or breaking down a mathematical problem". [EEF](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation) (older mirrors quote +7 months: [E4L](https://evidenceforlearning.org.au/education-evidence/guidance-reports/metacognition))
- EEF guidance report *Metacognition and Self-Regulated Learning* (2nd edition, 13 Nov 2025), seven recommendations: (1) teachers acquire the professional understanding to develop pupils' metacognitive knowledge; (2) explicitly teach strategies to plan, monitor and evaluate; (3) model your own thinking; (4) set an appropriate level of challenge; (5) promote metacognitive talk; (6) explicitly teach how to organise and manage learning independently; (7) schools support teachers to apply these. [EEF](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition), [2018 PDF via ERIC](https://files.eric.ed.gov/fulltext/ED612285.pdf)
- Metacognitive *illusions* are the enemy: students prefer rereading (Karpicke 2009), predict concept mapping beats retrieval (Karpicke & Blunt 2011), feel competent after watching (Kardas & O'Brien 2018, §13), and prefer easier-feeling tasks that teach less (McLaren 2015).

**Design implications.**
1. Plan–monitor–evaluate is embedded *in the task*: before a 5-mark question, "What is this question really asking? Which method? What will the answer look like?"; after, "Did you check units/rounding/sign? Which marks did you lose and why?"
2. Calibration feedback: show the student their confidence-vs-accuracy curve per topic; overconfident topics are scheduled for more retrieval, under-confident-but-correct topics get explicit reassurance.
3. Modelled thinking: worked-example narration includes the *decisions* ("I notice a right angle and two sides, so Pythagoras before trig") not just the steps.
4. No generic "how to revise" course; every metacognitive prompt is attached to a specific maths/science task.

---

## 13. Video and multimedia learning

**Evidence.**
- Guo, Kim & Rubin (2014), *ACM Learning@Scale*, **6.9 million video-watching sessions**: shorter videos are "much more engaging"; informal talking-head and **Khan-style tablet drawing** are more engaging; polished classroom lecture recordings are not; lecture vs tutorial videos are used differently. [ACM](https://dl.acm.org/doi/10.1145/2556325.2566239)
- Brame (2016), *CBE—Life Sciences Education*: keep videos **≤6 minutes** (median engagement near 100% for short videos, ~20% completion for 12–40-minute videos); speak 185–254 wpm with enthusiasm; conversational style; **signalling, segmenting, weeding, modality matching**; add guiding questions and *interpolated* questions. [CBE-LSE](https://www.lifescied.org/doi/10.1187/cbe.16-03-0125), [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5132380/)
- Szpunar, Khan & Schacter (2013), *PNAS*: interpolated memory tests during online lectures reduce mind-wandering, increase note-taking, improve learning and reduce test anxiety. [PNAS](https://doi.org/10.1073/pnas.1221764110)
- Fiorella & Mayer (2018), *Computers in Human Behavior* 89: 465–470 — what works: learner-paced **segmenting**, first-person demonstrations; what does *not*: matching instructor gender to learner, showing the instructor's face, **practice without feedback**, inserted pauses without a task. [DOI](https://doi.org/10.1016/j.chb.2018.07.015)
- Mayer, Fiorella & Stull (2020), *ETR&D* 68: 837–852 — five principles: **dynamic drawing**, gaze guidance, **generative activity** (summarise/explain prompts), first-person perspective, subtitles for L2; seductive details hurt. [Springer](https://link.springer.com/article/10.1007/s11423-020-09749-6)
- Kardas & O'Brien (2018), *Psychological Science*: watching a skill 20× vs 1× raised confidence and predicted performance but **not actual performance**; the illusion collapsed after a single attempt. [Sage](https://journals.sagepub.com/doi/abs/10.1177/0956797617740646)
- Segments should be semantically coherent and learner-controlled (Biard 2017; Merkt 2018, via [Video for Online Learning](https://www.videoforonlinelearning.com/format/segmenting-length)).

**Design implications.**
1. Videos are 2–6 minutes, one idea each, Khan-style pen-on-tablet with synchronous narration; no slide-reading; no face-cam by default.
2. **A question every 2–3 minutes** that must be answered to continue (interpolated testing), plus a retrieval task at the end. Watching alone never marks a lesson complete.
3. After any video, force an *attempt* within 60 seconds (Kardas: one attempt punctures the illusion of competence).
4. Signal with highlighting/arrows drawn live; cut everything extraneous; subtitles optional.
5. Video is *one* route into the worked example (§6); the text worked example with self-explanation prompts is the other.

---

## 14. Gamification: what helps and what harms

**Evidence.**
- Sailer & Homner (2020), *Educational Psychology Review* 32: 77–112: gamification effects on cognitive *g* = **0.49** (k = 19), motivational **0.36** (k = 16), behavioural **0.25** (k = 9); cognitive effects stable in high-rigour studies, motivational/behavioural "less stable"; game fiction and social interaction (especially **competition augmented with collaboration**) moderate behavioural outcomes. [ERIC](https://eric.ed.gov/?id=EJ1245270)
- Bai, Hew & Huang (2020), *Educational Research Review*: 30 interventions, 3,202 participants, *g* = **0.504**; students like gamification because it gives *feedback on performance*, recognition and goal-setting; they dislike it when it "does not bring additional utility" or "can cause anxiety or jealousy". [Summary](https://www.gbl.uzh.ch/quartz/references/Bai-et-al.-(2020))
- Hanus & Fox (2015), *Computers & Education* 80: 152–161: 16-week course with **leaderboard + badges** vs same course without: gamified students showed *less* motivation, satisfaction and empowerment over time and **lower final exam scores** (mediated by intrinsic motivation). [DOI](https://doi.org/10.1016/j.compedu.2014.08.019)
- Deci, Koestner & Ryan (1999), *Psychological Bulletin* 125(6): 627–668, 128 studies: expected tangible rewards undermine free-choice intrinsic motivation — engagement-contingent *d* = **−0.40**, completion-contingent **−0.36**, performance-contingent **−0.28**; tangible rewards more harmful for children; **positive verbal feedback enhances** intrinsic motivation (*d* = +0.33). [APA](https://doi.org/10.1037/0033-2909.125.6.627). Cameron & Pierce dispute the size for uninteresting tasks ([overview](https://en.wikipedia.org/wiki/Overjustification_effect)).
- A 2023 meta-analysis (ETR&D) finds gamification raises intrinsic motivation, autonomy and relatedness but has minimal impact on *competence* perceptions. [Springer](https://link.springer.com/article/10.1007/s11423-023-10337-7)

**Design implications.**
1. Keep the game elements that *are* information: mastery maps, progress toward exam readiness, visible retention estimates, "you fixed 3 misconceptions this week". These are feedback (0.99-class) dressed as game.
2. Drop leaderboards and public comparison; avoid badges/points for *showing up* (engagement-contingent, the most undermining category). If any competitive element is used, pair it with collaboration (team goals) per Sailer & Homner.
3. Streaks: use as a gentle habit cue with no loss penalty (a broken streak should not feel like punishment — Bai's "anxiety" finding; reinforcement/punishment feedback *d* = 0.24 and 86% of negative motivational effects).
4. Prefer verbal/informational praise tied to strategy ("you chose the efficient method") over tangible rewards.
5. Be sceptical of engagement metrics as a proxy for learning: McLaren's students *liked* the less effective activity more.

---

## 15. Exam technique: timed practice, mark-scheme literacy, "show your working"

**Evidence (direct evidence is thinner here; most support is indirect).**
- Transfer-appropriate processing: Yang et al. (2021) found the classroom testing effect is moderated by **test-format consistency** and **material matching** — practising in the exam's format on the exam's content is what transfers. [DOI](https://doi.org/10.1037/bul0000309). Rohrer's interleaving RCTs are, in effect, "exam-format" practice: no method label, cumulative, delayed test (§5).
- Self-grading with rubrics: Sanchez, Atkinson, Koenka, Moshontz & Cooper (2017), *JEP* 109(8): 1049–1066: students who **self-graded** performed better on subsequent tests (*g* = **0.34**; larger in randomised studies); peer-grading *g* = 0.29; student grades correlated *r* ≈ 0.67 with teacher grades; benefits depend on **rubrics and training**. [APA](https://doi.org/10.1037/edu0000190)
- Sadler (1989): students must acquire the teacher's/examiner's evaluative expertise — "authentic evaluative experience". [Springer](https://link.springer.com/article/10.1007/BF00117714). Panadero, Jonsson & Botella (2017), *Educational Research Review*: four meta-analyses of self-assessment on self-regulated learning and self-efficacy (positive effects). [DOI](https://doi.org/10.1016/j.edurev.2017.08.004)
- Anxiety: retrieval practice under low stakes reduces test anxiety (Agarwal 2014, 72%); interpolated testing reduced anxiety in video lectures (Szpunar 2013). Timed practice is therefore best introduced *after* mastery and *ramped*, not used as the default drill mode.
- CCEA structure: GCSE Mathematics (2017) papers are modular — Foundation M1/M2 (calculator) and M5/M6 (Paper 1 non-calculator, Paper 2 calculator); Higher M3/M4 and M7/M8 — with 600+ past papers and mark schemes published 2018–2026. [CCEA past papers & mark schemes](https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes). Mark schemes award method marks independently of accuracy marks, which is the *structural* reason "show your working" pays; no experimental literature specifically quantifies that, and this document does not claim one.
- EEF: modelling how to *plan an exam response* is a recommended metacognitive practice (§12). Homework "linked to classroom work" with feedback, set ~twice weekly, +5 months at secondary. [EEF Homework](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/homework)

**Design implications.**
1. **Three practice modes**, unlocked in order per topic: *learn* (untimed, hints, faded examples) → *mixed practice* (untimed, no labels, full feedback) → *exam mode* (timed to CCEA marks-per-minute, real past-paper items, feedback withheld until the end, then item-by-item).
2. **Mark it yourself first.** In exam mode the student allocates marks against the published mark scheme (M/A/B-style), then the platform reveals its marking and the discrepancy. Give short rubric training first (Sanchez).
3. **Working-out capture.** Require typed or photographed working for multi-mark items; give feedback at the *method-mark* level ("M1 gained for correct substitution; A1 lost for rounding") so students learn what examiners credit.
4. **Command-word and question-type drills** for science (describe/explain/evaluate/compare; 6-mark levels-of-response) as worked examples → faded → independent, with self-grading against level descriptors.
5. **Error log**: every dropped mark is tagged (misconception / procedural slip / misread / time / not attempted) and the tags feed the spaced re-probe queue and a pre-exam "my top 10 traps" sheet.
6. Timed sessions start at generous time (1.5×) and converge to real timing over weeks; never in the first week of a topic.

---

## 16. How top tutors structure revision — and the evidence behind the loop

**Evidence.**
- Nickow, Oreopoulos & Quan (NBER w27476 / AERJ 2024): pooled tutoring effect **0.37 SD**; stronger for teacher/paraprofessional tutors, during school, earlier grades — but "math shows stronger effects in later grades". [NBER](https://www.nber.org/papers/w27476), [EdWorkingPapers](https://edworkingpapers.com/ai20-267)
- EEF *One to one tuition*: **+5 months**; "short, regular sessions (about 30 minutes, three to five times a week) over a set period of time (up to ten weeks)"; must be "additional to and explicitly linked with normal lessons"; teachers monitor progress; secondary +4; maths studies show lower effects (+2) than literacy — a warning that maths tutoring must be *targeted* to work. [EEF](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/one-to-one-tuition)
- EEF *Small group tuition*: +4 months; "**diagnostic assessment can be used to assess the best way to target support**"; three sessions a week for ~10 weeks; maths +3. [EEF](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/small-group-tuition)
- NSSA / Annenberg *Design Principles for High-Impact Tutoring*: ≥3 sessions/week, ≥30 min (30–60 for older students), ≤3 students per tutor, **consistent tutor**, use of data and "ongoing informal assessments", high-quality materials that "focus on missed content and skills while complementing … grade-level instruction", in-school scheduling; scaled programmes yield 2–10 months' gain. [NSSA brief](https://nssa.stanford.edu/briefs/accelerating-student-learning-with-high-Impact-tutoring), [ERIC](https://eric.ed.gov/?id=ED613847)
- Realistic ceilings: Bloom's 2 SD has not replicated; human tutoring ≈ 0.8 SD and well-designed software tutoring approaches human tutoring in some reviews. [Nintil](https://nintil.com/bloom-sigma/)

**What good tutors actually do (synthesis of the above and §§2–15):**

```
1 DIAGNOSE     4–6 diagnostic MCQs (misconception distractors + confidence) per topic
               + a short past-paper probe → topic/sub-skill map + misconception profile
2 TARGET/TEACH pick the weakest high-value sub-skill; worked example (video ≤6 min or
               text) → Your-Turn twin → backward-faded completions → self-explanation
3 PRACTISE     minimally-varied set (variation) → blocked to ~80% → mixed/SSDD set
               with immediate high-information feedback; find-the-mistake items
4 PAST PAPER   exam-mode items on that topic + cumulative items from earlier topics,
               timed; student self-marks with mark scheme; method-mark feedback
5 REVIEW       errors tagged → FSRS queue (retention 0.90); confident errors re-probed
               at 1–3 days and ~1 week; weekly mixed quiz; monthly cumulative paper;
               plan–monitor–evaluate prompts; re-diagnose and loop
```

Cadence: **30–45 minutes, 4–5 days a week**, in a fixed plan that runs back from the exam dates (EEF/NSSA dosage), with the platform playing the "consistent tutor" that holds the student's data and keeps sessions explicitly linked to what the school is teaching that week.

---

## 17. Anti-patterns (things the evidence says not to build)

| Anti-pattern | Why it fails | Evidence |
|---|---|---|
| Rereading / highlighting / "mark as read" notes as the core loop | Low utility; creates fluency illusions | Dunlosky 2013; Karpicke 2009; Karpicke & Blunt 2011 |
| Watching videos counts as progress | Watching inflates confidence, not skill | Kardas & O'Brien 2018; Fiorella & Mayer 2018 (practice without feedback doesn't help) |
| Long lecture-capture videos with slides and a face-cam | Engagement collapses after ~6 min; redundancy/split attention | Guo 2014; Brame 2016; Mayer principles |
| Blocked-only topic drills with the method in the title | Removes strategy selection; big drop at delay | Rohrer 2015/2020; Brunmair & Richter 2019 |
| Cramming mode / massed review; treating "expanding intervals" as magic | Massed loses to spaced *g* = 0.74; expanding ≈ uniform | Latimier 2021; Cepeda 2008 |
| SM-2-style scheduler or fixed intervals | Systematically mis-predicts recall; ease hell | srs-benchmark; Anki docs |
| Desired retention set to 97%+ | Workload explodes exponentially | Anki FSRS docs |
| Fixed level of worked-example support for everyone | Expertise reversal: hurts fluent students | Kalyuga 2003 |
| Problem-first "discovery" for novices | Worked-example effect for novices | Sweller & Cooper 1985; van Gog 2011 |
| MC questions with weak distractors and no feedback | No learning benefit; lures implant errors | Little & Bjork 2015; Marsh 2007; Butler & Roediger 2008 |
| ✓/✗ or grade-only feedback; praise-heavy feedback | Reinforcement *d* = 0.24, praise ≈ 0.12; ⅓ of feedback harms | Wisniewski 2020; Hattie & Timperley 2007; Kluger & DeNisi 1996 |
| Feedback with no immediate chance to act | Feedback needs "opportunities to act upon" it | EEF Feedback |
| Purely self-paced mastery with no plan or deadlines | Self-paced mastery weaker; lower completion | EEF Mastery; Kulik 1990 |
| Mastery threshold below 80% or based on immediate post-test | Weak thresholds give weak results; immediate tests overstate learning | EEF Mastery; Adesope 2017 delay moderator |
| Leaderboards, public comparison, badges for logging in, tangible rewards | Lower intrinsic motivation and exam scores; engagement-contingent rewards *d* = −0.40 | Hanus & Fox 2015; Deci 1999; Sailer & Homner 2020 |
| Punishing streak loss | Punishment-style feedback drives negative motivational effects; anxiety | Wisniewski 2020; Bai 2020 |
| Generic "study skills"/"growth mindset" modules divorced from content | Metacognition works only when applied to curriculum content | EEF Metacognition strand |
| Optimising for what students *like* | Liking and learning diverge on desirable difficulties | McLaren 2015; Bjork |
| Decorative images, mascots, background music on content screens | Coherence/seductive-details violations; EEF "lethal mutation" | Mayer 2020; EEF review |
| Counting practice minutes as the KPI | Deliberate-practice hours explain ~4% in education | Macnamara 2014 |
| Over-difficult, unsurmountable challenge (accuracy <60% sustained) | Desirable difficulties must be achievable; Rosenshine ~80% success | Rosenshine 2012; Bjork |
| Interleaving from the very first exposure | Need initial fluency before discrimination practice | EEF review; Rohrer practical guidance |
| Timed exam mode from day one | Anxiety; format practice should follow mastery | Agarwal 2014; Szpunar 2013 |

---

## 18. Evidence gaps to be honest about

- Almost all interleaving evidence is in maths; the science evidence (Sana & Yan) is about interleaved *quizzing*, not problem solving.
- Variation theory and "intelligent practice" have practitioner and theoretical support, not RCT effect sizes.
- "Show your working" and "mark-scheme literacy" are supported *indirectly* (self-grading meta-analysis; transfer-appropriate processing; Sadler) — no GCSE-specific trials were found.
- Gamification meta-analyses are heterogeneous and dominated by higher-education samples; the safest reading is "informational game elements good, comparative/reward elements risky".
- Effect sizes from lab studies (e.g. *g* 0.7–0.9) will not be seen in the wild; the EEF's +4 to +6 months for feedback, mastery and tutoring are the realistic scale for a well-built platform used consistently.
- The FSRS benchmark is on Anki users (self-selected, mostly adults, flashcard content); it is the best available but is not GCSE-specific.

---

## 19. Source list (all URLs used)

**Retrieval / testing / relearning**
- https://doi.org/10.1111/j.1467-9280.2006.01693.x
- https://journals.sagepub.com/doi/abs/10.3102/0034654316689306
- https://eric.ed.gov/?id=EJ1141817
- https://theeconomyofmeaning.com/2017/03/21/important-new-meta-analysis-on-the-testing-effect-with-some-surprises/
- https://doi.org/10.1037/bul0000309
- https://doi.org/10.1126/science.1199327
- https://pubmed.ncbi.nlm.nih.gov/21252317/
- https://notes.andymatuschak.org/zFUBZG5yY1aKJ4hpak2jWPA
- https://doi.org/10.1037/a0026252
- https://doi.org/10.1016/j.jarmac.2014.07.002
- https://evidencebased.education/resource/retrieval-practice-and-student-wellbeing/
- https://www.poojaagarwal.com/research
- https://doi.org/10.1080/09658210802647009
- https://journals.sagepub.com/doi/10.1177/1529100612453266
- https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html
- https://doi.org/10.3389/feduc.2021.581216
- https://link.springer.com/article/10.1007/s10648-013-9240-4
- https://journals.sagepub.com/doi/full/10.1177/09637214221100484
- https://sites.google.com/view/efratfurst/teaching-with-learning-in-mind/successive-relearning
- https://link.springer.com/article/10.3758/s13421-014-0452-8
- https://link.springer.com/article/10.3758/BF03194051
- https://link.springer.com/article/10.3758/MC.36.3.604
- https://www.learningscientists.org/blog/2018/8/2
- https://doi.org/10.1037/a0015729
- https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Kornell.Hays.Bjork.2009.pdf
- https://osf.io/preprints/psyarxiv/un87v_v1
- https://sc-pan.github.io/research.html
- https://doi.org/10.1073/pnas.1221764110

**Spacing / scheduling**
- https://www.yorku.ca/ncepeda/publications/CPVWR2006.html
- https://journals.sagepub.com/doi/10.1111/j.1467-9280.2008.02209.x
- https://link.springer.com/article/10.1007/s10648-020-09572-8
- https://journals.sagepub.com/doi/10.1177/2372732215624708
- https://link.springer.com/article/10.1007/s11251-007-9015-8
- https://doi.org/10.1038/s44159-022-00089-1
- https://github.com/open-spaced-repetition/srs-benchmark
- https://expertium.github.io/Benchmark.html
- https://docs.ankiweb.net/deck-options.html
- https://github.com/open-spaced-repetition/fsrs-vs-sm17
- https://doi.org/10.18653/v1/P16-1174
- https://deckstudy.com/blog/fsrs-vs-sm2-modern-spaced-repetition

**Interleaving**
- https://doi.org/10.1037/bul0000209
- https://files.eric.ed.gov/fulltext/ED557355.pdf
- https://ies.ed.gov/ncee/wwc/Study/89950
- https://www.justinmath.com/cognitive-science-of-learning-interleaving/
- https://gwern.net/doc/psychology/spaced-repetition/2019-rohrer.pdf
- https://notes.andymatuschak.org/zHvJf88XUgLPMhdTigkoiUR
- https://pdf.retrievalpractice.org/spacing/InterleavedRetrievalPracticePromotesScienceLearning_SanaYan_2022.pdf
- https://ssddproblems.com/
- https://www.foster77.co.uk/articles.html

**Worked examples / CLT / fading**
- https://www.tandfonline.com/doi/abs/10.1207/s1532690xci0201_3
- https://en.wikipedia.org/wiki/Worked-example_effect
- https://doi.org/10.1207/S15326985EP3801_4
- https://en.wikipedia.org/wiki/Expertise_reversal_effect
- https://my.chartered.college/impact_article/expertise-reversal-effect-and-its-instructional-implications/
- https://doi.org/10.1080/00220970209599510
- https://www.sciencedirect.com/science/article/abs/pii/S0361476X1000055X
- https://education.nsw.gov.au/content/dam/main-education/about-us/educational-data/cese/2017-cognitive-load-theory-practice-guide.pdf
- https://education.nsw.gov.au/about-us/education-data-and-research/cese/publications/practical-guides-for-educators/cognitive-load-theory-in-practice
- http://mrsmahoney.co.uk/example-and-your-turn/
- https://tipsforteachers.co.uk/book/
- https://www.amazon.com/How-Wish-Taught-Maths-conversations/dp/1943920583
- https://gowers.wordpress.com/2018/12/22/how-craig-barton-wishes-hed-taught-maths/

**Self-explanation / elaboration**
- https://doi.org/10.1207/s15516709cog1302_1
- https://link.springer.com/article/10.1007/s10648-018-9434-x
- https://eric.ed.gov/?id=EJ1186664
- https://www.bps.org.uk/research-digest/self-explanation-powerful-learning-technique-according-meta-analysis-64-studies

**Feedback**
- https://journals.sagepub.com/doi/10.3102/003465430298487
- https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory
- https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full
- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback
- https://eric.ed.gov/?id=EJ375720
- https://doi.org/10.1037/1076-898X.13.4.273
- https://web.williams.edu/Psychology/Faculty/Kornell/Publications/Metcalfe.Kornell.Finn.2009.pdf
- https://link.springer.com/article/10.1007/BF00117714
- https://doi.org/10.1080/0969595980050102

**Errors / hypercorrection / diagnostics**
- https://www.researchgate.net/publication/11641193_Errors_Committed_with_High_Confidence_Are_Hypercorrected
- https://en.wikipedia.org/wiki/Hypercorrection_(psychology)
- https://link.springer.com/article/10.3758/s13423-011-0173-y
- https://doi.org/10.1146/annurev-psych-010416-044022
- https://researchschool.org.uk/durrington/news/the-hypercorrection-effect-spaced-practice-and-remote-learning
- https://doi.org/10.1007/s10649-021-10084-7
- https://www.sciencedirect.com/science/article/abs/pii/S0959475211000880
- https://eric.ed.gov/?id=ED543090
- https://link.springer.com/article/10.1007/s40593-015-0064-x
- https://medium.com/eedi/what-makes-a-good-diagnostic-question-b760a65e0320
- https://medium.com/eedi/what-is-a-diagnostic-question-13bb85c64062
- https://tipsforteachers.co.uk/diagnostic-questions/

**Variation / representation / multimedia**
- https://www.ncetm.org.uk/teaching-for-mastery/mastery-explained/five-big-ideas-in-teaching-for-mastery/
- https://www.ncetm.org.uk/media/8d85bba06845025/variation_handout_september_2020.pdf
- https://www.ncetm.org.uk/teaching-for-mastery/mastery-explained/supporting-research-evidence-and-argument/
- https://www.ncetm.org.uk/features/how-variation-has-changed-my-teaching/
- https://variationtheory.com/
- https://link.springer.com/article/10.1007/s10648-014-9249-3
- https://eric.ed.gov/?id=EJ1036777
- https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning
- https://www.learningscientists.org/blog/2016/9/1-1
- https://www.growthengineering.co.uk/dual-coding/

**Mastery / practice / Rosenshine / metacognition / EEF**
- https://en.wikipedia.org/wiki/Bloom%27s_2_sigma_problem
- https://journals.sagepub.com/doi/10.3102/00346543060002265
- https://nintil.com/bloom-sigma/
- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/mastery-learning
- https://journals.sagepub.com/doi/10.1177/0956797614535810
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8049893/
- https://www.aft.org/ae/spring2012/rosenshine
- https://eric.ed.gov/?id=EJ971753
- https://teacherhead.com/2018/06/10/exploring-barak-rosenshines-seminal-principles-of-instruction-why-it-is-the-must-read-for-all-teachers/
- https://www.structural-learning.com/post/rosenshines-principles-a-teachers-guide
- https://en.wikipedia.org/wiki/Desirable_difficulty
- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation
- https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition
- https://evidenceforlearning.org.au/education-evidence/guidance-reports/metacognition
- https://files.eric.ed.gov/fulltext/ED612285.pdf
- https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3
- https://d2tic4wvo1iusb.cloudfront.net/production/eef-guidance-reports/maths-ks-2-3/EEF-Improving-Mathematics-in-Key-Stages-2-and-3-2022-Update.pdf
- https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/science-ks3-ks4
- https://d2tic4wvo1iusb.cloudfront.net/documents/guidance/Cognitive_science_approaches_in_the_classroom_-_A_review_of_the_evidence.pdf
- https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/cognitive-science-approaches-in-the-classroom
- https://www.tes.com/magazine/news/general/cognitive-science-classroom-impact-evidence-limited
- https://cirl.etoncollege.com/cognitive-science-a-review-of-the-evidence/

**Gamification**
- https://eric.ed.gov/?id=EJ1245270
- https://www.gbl.uzh.ch/quartz/references/Bai-et-al.-(2020)
- https://doi.org/10.1016/j.compedu.2014.08.019
- https://doi.org/10.1037/0033-2909.125.6.627
- https://en.wikipedia.org/wiki/Overjustification_effect
- https://link.springer.com/article/10.1007/s11423-023-10337-7

**Video**
- https://dl.acm.org/doi/10.1145/2556325.2566239
- https://www.lifescied.org/doi/10.1187/cbe.16-03-0125
- https://pmc.ncbi.nlm.nih.gov/articles/PMC5132380/
- https://doi.org/10.1016/j.chb.2018.07.015
- https://link.springer.com/article/10.1007/s11423-020-09749-6
- https://journals.sagepub.com/doi/abs/10.1177/0956797617740646
- https://www.videoforonlinelearning.com/format/segmenting-length

**Exam technique / tutoring**
- https://doi.org/10.1037/edu0000190
- https://doi.org/10.1016/j.edurev.2017.08.004
- https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes
- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/homework
- https://www.nber.org/papers/w27476
- https://edworkingpapers.com/ai20-267
- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/one-to-one-tuition
- https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/small-group-tuition
- https://nssa.stanford.edu/briefs/accelerating-student-learning-with-high-Impact-tutoring
- https://eric.ed.gov/?id=ED613847
