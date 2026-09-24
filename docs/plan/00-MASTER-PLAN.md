# 00 — Master Plan

**Status:** synthesis of `concept-A-exam-outcome-first.md`, `concept-B-learner-experience-first.md`, `concept-C-exclusive-content-first.md` against the research in `docs/research/01`–`10`, the machine-readable specs in `data/spec/`, the papers index in `data/papers/`, the private paper corpus in `docs/sources/papers/` and the current code scaffold.
**Date:** 2 September 2026. Phase 0 ends around 16 September 2026 (her birthday is ~15 September); quality outranks the date.
**Citations:** `A §x` / `B §x` / `C §x` = the three concept documents; `NN §x` = research file NN, section x.
**Decision rule used throughout:** everything must survive the owner's three non-negotiables — (a) her sceptical "why is this worth my time?", (b) professional knowledge distillation from the spec, the module book, the paper corpus, examiner reports and the best public sites, applied subject-agnostically, without ever reproducing CCEA or Corbettmaths text; (c) exclusive, original, verified material with outstanding but serious design, hardest topics first.

---

## 0. The judgement (Task 1)

Scores are 1–10. "Truthfulness" is judged as the sceptical 16-year-old who already owns the spec, the papers, the mark schemes and Corbettmaths would judge it; "learning gain" is scored against 06; "feasibility" is for one developer with AI assistance in Phase 0 (~2 weeks, ~100 h) and then 12–15 h/week.

| Criterion | A — Exam-outcome-first | B — Learner-experience-first | C — Exclusive-content-first |
|---|---|---|---|
| Truthfulness of the value proposition | **8** — every claim in A §1 is a number from the reports and boundaries (A §0, §2); the "mark-recovery system" framing is honest because M4 grade a is 45/100 raw and A\* is 393–394/400 UMS (01 §2.3, 09 §2.3). Slight over-promise: "original questions for every M4 and M8 topic" is a Phase 1 fact, not Phase 0. | **8** — B §1 is 247 words in which every sentence maps to a feature in B §3/§5/§7 and the Phase 0 definition of done (B §8) is written as "her first ten minutes". Honest about coverage ("original questions for 12 of 20 topics; the rest link to Corbettmaths", B §5.4). | **7** — C §1 says "every statement in your three specifications has a short note" and promises 15 products; C §5.1 admits that is ~12,000 items and 550–600 h. She would notice the gap between the promise and the Phase 0 reality (10 M4 topics). |
| Expected learning gain (06) | **8** — Mark Ledger + hypercorrection + interleaved review + format-matched mocks + self-marking hit the strongest effects (06 §2, §3, §9, §15); the target block is Rosenshine's template (06 §11). Weaker on how a novice is *taught* (worked-example fading is present but thin). | **9** — the 15-component interaction grammar (B §3) is the evidence made concrete: step-reveal instead of re-reading (06 §2, §17), pretesting (06 §9), backward-faded worked examples with expertise reversal (06 §6), find-the-mistake (06 §9), success-rate governor (06 §11), mastery with decay and delayed checks (06 §11), FSRS exam-date mode (06 §3). Only B specifies *what happens each minute*. | **7** — Products 1–7 are individually well-grounded (C §2 cites 06 for each), but the loop that sequences them for her is only sketched (C §8.1 point 4). Content without a loop is a better textbook, not a tutor. |
| CCEA-specificity | **10** — A §2 is a per-question, per-series map of where A\* candidates lose marks, from the Chief Examiner reports (01 §9, 02 §8, 03 §7); UMS engine, exam map with the November 2027 and March 2028 rules (09 §9.1). | **8** — real dates in every example, CCEA vocabulary rule (B §4.5), UMS in the paper runner. Less systematic about which topics matter most. | **10** — the exam-true layer (C §6: command words, mark-language profiles, tariffs, formula-sheet status, QWC bands, Booklet B item types, method locks, presentation rules) is the most CCEA-exact artefact in any of the three. |
| Feasibility (Phase 0 and beyond) | **6** — Phase 0 = 36 nodes + 4 interactives + ledger + mock mode + library in ~90 h (A §8). 30 verified maths nodes in 22 h is 45 min per node including verification, which C's own economics (C §4) say is a Lite bundle, not the "note + worked example + 4 diagnostics + 6 practice + 1 exam-style" promised. | **7** — depth-first: six M4 topics, two FM topics, three science decks, ~120 items, "every one checked by the brother" (B §8). The most honest two-week plan, and its later phases scale linearly. | **5** — Phase 0 content (~35 h) is plausible, but the ten-stage pipeline that produces it (C §4) is not budgeted anywhere and must exist first. Beyond Phase 0, 12,000 items is a year of 12–15 h/week with no slack. |
| Delight / design | **6** — eight signature moments and a clear palette rule (A §7), but the daily feel (home, review complete, feedback card) is asserted rather than designed. | **9** — palette in LCH with the NI colour caution (B §4.1), type, motion vocabulary, tone of voice, the gift layer without cringe (B §4.6), the home screen tile by tile (B §7.4), a day-in-her-life at the screen level (B §2). | **5** — C §7 is a media production table; the product surface is left to others. |
| Fit with the knowledge-distillation mandate | **7** — A §5.3 has a six-step authoring pipeline with recomputation, an n-gram check and a QA rubric; but no corpus mining, no exam-true layer, no verification log she can see. | **6** — B §8 and the appendix describe the content unit and "AI-drafted, brother-checked" but not the system that makes it professional or subject-agnostic. | **10** — C §3 (schemas), §4 (ten gated stages with a no-copy guarantee enforced by code, not instruction), §6 (exam-true data loaded by both authoring and feedback), §10 (verification panel in the UI). This *is* mandate (b). |
| **Total** | **45** | **47** | **44** |

**Winner: Concept B, as the spine.** Her question is answered by what she touches every evening, and only B specifies that experience minute by minute with the strongest learning-science backing. But the totals are close for a reason: the three concepts are three views of one product, and the master plan is B's loop and design, with **C's knowledge-distillation system promoted to the heart of the plan (Section 3), because mandate (b) demands it**, and **A's mark-loss map used as the authoring priority list and the source of the Exam Map, UMS engine, Mark Ledger and method-locked trainer**. Nothing in the three concepts contradicts the others; the grafts are:

- From A: §2 (per-topic mark-loss evidence → Section 3.5 authoring order and Section 8 content lists), Pillars 1, 2, 5, 6, 7, 11 (Exam Map/UMS, Ledger, Paper 1/Paper 2 modes, method locks, Equation Vault, UMS mocks), §4.3 (the year on real dates), §10 (n = 1 measurement), §11 (risks).
- From C: §3 schemas (extended and finalised in Section 3.8 with the confirmed M/A/MA codes), §4 pipeline (extended with the corpus-mining stage that the now-downloading paper corpus makes possible), §6 exam-true layer, §10 verification panel, Appendix B layout.
- From B: §1 answer, §2 sessions, §3 components, §4 visual identity and gift layer, §5 motivation and mastery, §6 storyboards, §7 IA, §8 Phase 0 definition of done.

---

## 1. The answer to her question

You already have the specification, the past papers, the mark schemes and Corbettmaths. This does not replace them. It does the things they cannot.

It knows your papers, not "GCSE season": M4 at 9.15 on the day you sit it, M8 with its non-calculator paper first, Further Maths Unit 1, each science unit and its Booklet B. Every review and every plan is scheduled backwards from those dates.

It refuses to let you just read. Each topic starts with five quick questions whose wrong options are the exact mistakes examiners reported, so you find your gaps before spending an hour on them. Then a one-screen sheet of what you actually need to know, a worked example where every step is yours to fill in, and original questions in CCEA's layout with CCEA's mark language, so you learn where the method marks are.

It remembers for you. Anything you get wrong, or right without confidence, comes back in a few days and again a week later. Most nights that is about ten minutes.

It converts your practice papers into UMS and shows what an A\* actually needs, in raw marks, on your unit.

Every question is original, and every one shows you what was checked before it was published.

*(214 words. Sentence-by-feature map: exam map and exam-date scheduling → Section 4.2, 5.4 [Phase 0]; diagnostics with misconception distractors → Section 3.6 D2, 6.3 [Phase 0]; The Sheet, worked-example-as-question, original questions with mark language → Section 3.6 D1/D3/D4 [Phase 0 for the six M4 topics, Phase 1 for the rest]; review inbox and hypercorrection → Section 4.2 [Phase 0]; UMS conversion and A\* band → Section 4.1, 5.5 [Phase 0]; verification panel → Section 3.7 [Phase 0].)*

The 600-word version, with the "what you have now → what this adds" table, is in `docs/plan/why-this-platform.md`.

---

## 2. Product definition

### 2.1 Name suggestions

Constraints (B §4.6): not her name, not a pet name, not app-store-ish, serious enough to be a wordmark, and it must read naturally in "I did ten minutes on ___ last night."

| Name | Why | Wordmark notes |
|---|---|---|
| **Cairn** | A cairn is a stack of stones that marks the route on a hill; it is built one stone at a time by people who walked the path before you. That is the product: examiner reports and past series stacked into a marker for her route to the papers. NI landscape without being a place-name. "Ten minutes on Cairn" reads well. | Five letters, one syllable, sets beautifully in Inter Display at heavy weight; a monogram of three stacked rounded rectangles works as the PWA icon and doubles as the mastery chip's three-state glyph. |
| **Bearings** | A CCEA topic (M5/M6) and a phrase — "get your bearings" — that is exactly what the exam map, the UMS dial and the traps sheet give her. Serious, faintly nautical, no childishness. "I did ten minutes on Bearings" is natural. | Eight letters; the wordmark can carry a hairline 090° tick over the "i". Slight risk: it is also the name of an engineering component, harmless. |
| **Strand** | The CCEA specifications are organised in strands (Number & algebra, Geometry & measures, Handling data — 01 §3, §5); a strand is also one thread of a rope. In Belfast it is a cinema and a road, which gives it local warmth without being a joke. "Ten minutes on Strand." | Six letters, very quiet, reads like a publisher's imprint; pairs well with a single accent-coloured full stop ("Strand.") in the wordmark. |

Recommendation: **Cairn** (the metaphor matches the knowledge-distillation idea best and it is the strongest as an icon). The owner decides; the name is a single constant in `packs/product.json` and appears nowhere else in the code.

### 2.2 Positioning

A private CCEA tutor that knows her papers, marks the way CCEA marks, and remembers for her — built from a professional distillation of the specification, the past-paper corpus, the Chief Examiner reports and the best public sites, into original material that is verified before she sees it. Not a revision app, not a video library, not a game.

One-line honest promise (used on the first-run screen): "Original CCEA-style practice on the topics where marks are actually lost, scheduled so you do not forget it, with the truth about where you stand in UMS."

### 2.3 The twelve pillars

| # | Pillar | Why she would use it (one line) | Sources |
|---|---|---|---|
| 1 | **Exam Map and UMS engine** — her actual entries, real CCEA dates and times, the 40% terminal rule, the one-resit rule, the November 2027 resit-only cut-off; raw → UMS → grade with A\* as a band | "Nobody, including Maths Genie, has a CCEA grade calculator; this one knows *my* units and what A\* costs in raw marks." | A P1, P11; C P13; 04 §4.2; 09 §2.3, §10 |
| 2 | **Review Inbox** — FSRS scheduling in exam-date mode, item-level so it is mixed by construction; hypercorrection re-probes; a daily cap | "I open it and tonight's nine minutes are already chosen." | B §3.2, §5.2; A P4; 06 §3, §5, §9 |
| 3 | **The Sheet** — per teachable topic, ≤150 words: what the statement demands, formula-sheet given vs must-know, what is *not* on the spec, how it is examined, the examiner's traps | "The exact minimum, in CCEA language, with what is and is not on the formula sheet." | B §3.1; C P1, P7; 01 §4; 02 §4; 03 §5.9 |
| 4 | **Diagnose first** — 4–6 misconception-tagged MCQs with confidence before any teaching; confident-wrong answers go to the hypercorrection queue | "It finds the gap in two minutes instead of me guessing for an hour." | B §3.3; C P2; 06 §9 (Little & Bjork; Foster 2022; Pan & Sana) |
| 5 | **Worked examples as questions** — narrated decisions, a Your-Turn twin, backward-faded completions, adaptive to her accuracy | "I never watch a solution; I finish it." | B §3.5; C P4; 06 §6 (Renkl 2002; Kalyuga 2003) |
| 6 | **Original exam-style bank with CCEA mark language** — M/A/MA (Maths), M/W/MW (FM), P/QWC (Science) schemes; self-mark first, then the platform; every item carries a "Checked" panel | "The questions look like the paper, the marking talks like the mark scheme, and I can see what was verified." | C P3, §6.2, §10; A P3; B §3.13; 06 §15 (Sanchez 2017) |
| 7 | **The Examiner's Red Pen** — find-the-mistake items built from report findings; method-locked items ("hence", "show that", "use matrices"); presentation rules enforced in feedback | "It shows me the zero-mark traps before the exam does." | C P5; A P6; 06 §9 (McLaren 2015); 02 §9 |
| 8 | **Mark Ledger and Traps** — every lost mark tagged (method / accuracy / misread / presentation / not attempted); top-ten traps in examiner language; confidence-vs-accuracy calibration | "It tells me which marks are cheapest to get back." | A P2; B §5.4; 06 §12, §15 |
| 9 | **Recall decks** — Equation Vault (the ~25 physics equations with no formula sheet), Glossary key-word cards, Chemistry Data-Leaflet drills, the Non-calc Five for M8 Paper 1 | "The stuff I must simply know, to criterion, before it matters." | A P5, P7; C P8, P10; 03 §5.9, §7.1; 06 §4 |
| 10 | **Practical Studio and QWC Builder** — one module per prescribed practical with Booklet-B-style items; six-mark answers built from model → faded → independent, self-marked against the three bands | "Unit 7 is a quarter of my science grade and nothing else practises it." | A P8, P9; C P9, P11; 05 §4; 03 §7 |
| 11 | **See-it-move interactives** — only where the reports show a spatial failure: histogram median, theorem chain, bounds ladder, circle and tangent, transformations, force diagrams, ray diagrams; PhET inside a task | "The diagram reacts when I'm wrong, before any words." | A P10; B §3.4, §3.11; 07 §2.1; 06 §10 |
| 12 | **Paper Runner and Linked Library** — official papers by deep link (`#page=N`), timed at CCEA pace, self-mark grid, UMS; per-topic links to Corbettmaths video numbers with checkpoints, Bitesize, NI Maths Tutor, CCEA fact files and glossaries | "It points me to the best thing that already exists instead of pretending to replace it." | B §3.14, §3.15; A P12; 08 §11; 04 §5 |

### 2.4 What we link rather than build (honest list)

| Linked, attributed, never copied | Reason |
|---|---|
| CCEA past papers and mark schemes (feeds 504/507/584; deep links with `#page=N`; link-health job) | Copyright notice forbids electronic distribution and storage in a retrieval system; the site blocks iframes (08 §5; `data/papers/README.md` §2). The private corpus is analysed only in the build pipeline. |
| CCEA specification, Teacher Guidance, fact files, FM Q&A booklets, glossaries, practical manuals, Data Leaflet, Chief Examiner reports, grade-A exemplification | Official and free; our value is the right page at the right moment. |
| Corbettmaths videos (privacy-enhanced YouTube embed by video number from its own CCEA checklists), practice and textbook PDFs, Set A/B papers, "A Bit of Everything" | Terms: link rather than upload; never include questions in redistributed resources (04 §2.1; 08 §9.1). The structure of its checklists informs our taxonomy; its text and questions never enter the drafting context. |
| BBC Bitesize CCEA guides (article ids from 05 §1.2; 04 §2.9) | BBC copyright; no embed. |
| NI Maths Tutor full paper solutions (M4/M8 2022–2026), Science Shorts, Chemistry Chicken, PhysicsRocksItsTrue, GCSE Physics Online CCEA | Already exist and are good; watching never marks anything complete (06 §13). |
| PhET simulations (iframe, attribution line, unobstructed logo), selected GeoGebra applets ("Made with GeoGebra®") | Non-commercial personal use is permitted (05 §2.11; 07 §6; 10 §12.2). |
| Keady Maths topic-sorted CCEA questions | Exists (09 §7.2); link with a copyright caveat. |
| A video course, a textbook, a generic "how to revise" module, an AI chat as the main interface, leaderboards/XP/hearts, FM Unit 4, 9–1 grades beyond a tooltip, accounts/backend, Desmos/tldraw | See A §9, B §9, C §9; 06 §14, §17; 07 §6; 10 §11. |

---

## 3. The Knowledge Distillation System (the heart)

### 3.1 Principle

"We use all they offer, we take it, build on it, develop it and make it even better." Operationally: **learn the patterns, never the text.** The system ingests the specification, teacher guidance, examiner reports, the private paper and mark-scheme corpus, grade boundaries, timetables, the structure of Corbettmaths and Bitesize, and the module book where we hold one; it *extracts* facts and patterns (what is examined, how often, at what tariff, with which command words, marked with which codes and phrases, failed in which ways); it *distils* those into our own originals; it *verifies* them by machine and by a human; it *publishes* them with a visible log. Source text is used by checkers, never by drafters. The whole thing is a **subject pack**: the same folders, schemas and scripts for Mathematics, Further Mathematics, Double Award Science, and any subject added later (English Language and Literature are the worked example in 3.10).

### 3.2 Subject pack architecture: four layers

```
SPEC        the qualification as CCEA defines it: units, papers, tiers, weightings, UMS scales,
            rules, formula sheets, series calendar                 -> packs/<subject>/pack.json, data-pack/
STATEMENTS  every learning-outcome statement, verbatim, with tier flag, teacher-guidance
            elaboration/exclusion, spec page                        -> data/spec/<subject>.json (exists for
                                                                       science and FM; maths in progress)
TOPICS      teachable topics: the unit of authoring and navigation. Each maps to >=1 statement,
            declares prerequisites (cumulative units), hardness, examiner evidence, links out
                                                                    -> data/spec/<subject>-topics.json
                                                                       (FM: inside further-mathematics.json;
                                                                        science: scripts/science-topics-source.mjs;
                                                                        maths: scripts/maths-spec/topics-*.mjs)
CONTENT     per topic: the Sheet/note, worked examples, diagnostics, questions, find-the-mistake,
UNITS       prompts, insight card, practical, equations, QWC, sets, mocks, verification logs
                                                                    -> packs/<subject>/content/<unit>/<topic>/
```

Two cross-cutting data layers sit beside them: the **exam-true layer** (`packs/<subject>/exam-true/`: mark language, command words, tariffs, formula sheets, method locks, presentation rules, QWC bands, Booklet B item types) loaded by *both* the authoring prompts and the feedback generator so vocabulary never drifts (C §6, §8.1 point 5); and the **mined layer** (`packs/<subject>/mined/`: question-pattern statistics from the private corpus, metadata only).

Statement ids: science `DA-<unit>-<lo>` (e.g. `DA-P1-1.4.17`), `DA-PRAC-<code>`, `DA-U7-<area>-<n>`; FM `FM1-ALF-01` style (already in `data/spec/further-mathematics.json`); Maths `M4-HD-02` style (already in `scripts/maths-spec/statements.mjs`: unit, strand NA/GM/HD, ordinal). Topic ids: `maths.m4.histograms`, `fm.u1.algebraic-fractions-add-subtract`, `science.p1.kinetic-energy`, `science.practicals.c5`. Item ids prefixed by type as in C §2 (`note.`, `we.`, `dx.`, `q.`, `ftm.`, `rp.`, `ins.`, `prac.`, `eq.`, `qwc.`, `set.`, `mock.`, `ver.`).

### 3.3 Ingestion sources per subject

| Source | Maths (504) | Further Maths (507) | Double Award Science (584) | Used for | Held locally |
|---|---|---|---|---|---|
| Specification (statements, tiers, exclusions) | `docs/sources/maths/spec-2017-current_0.txt`; statements transcribed in `scripts/maths-spec/statements.mjs` | `GCSE-Further-Mathematics-2017-specification-v2.txt` → `data/spec/further-mathematics.json` | `DA-Science-spec.pdf` → `data/spec/double-award-science.json` (tier from bold font) | STATEMENTS layer; scope checks | yes |
| Teacher Guidance | `teacher-guidance-2019.txt` (exclusions: completing the square in M4, ambiguous sine rule in M8, …) | `GCSE-Further-Mathematics-Teacher-Guidance-2024.pdf` | eGuides (Chemistry/Physics U1 Higher) | `notOnThisSpec`, `teacherGuidance` fields; critic rules | yes |
| Chief Examiner reports | `CER-Summer2023/2024/2025`, `CER-November2024/2025` (.txt) | 2018, 2019, 2022–2025 (.txt) | `examiner-reports/DAS-Summer2023/2024/2025, March2026` | Insight cards; misconception registry; distractor tags; find-the-mistake seeds; authoring priority | yes |
| Past papers + mark schemes (private corpus) | `docs/sources/papers/maths/<session>/<unit>-<tier>-[P1|P2]-[Paper|MS]-<id>.pdf/.txt` — all Standard 2018–2026 once the download completes (46 PDFs so far) | same layout under `further-maths/` | same under `science/` incl. Unit 7 Booklets | Question-pattern mining (3.4); copy/isomorph reference corpus (3.7); page map for deep links | yes, gitignored |
| Grade boundaries, UMS scales | 01 §2.2–2.3; `GCSE-Unit-Level-Uniform-Mark-Boundaries-2025-Summer.pdf`; 09 §2.3 | 02 §2 | 09 §2.3; `DA-Grade-Outcomes-Tier-Combinations.pdf` (image, transcribe) | `data-pack/boundaries.json` | yes |
| Timetables and rules | `timetable-november2026.txt`, `timetable-summer2027-v2.txt`, `timetable-march2027.txt`, Circulars S/IF/35/26 | same | same | `data-pack/timetable.json`, `rules.json` | yes |
| Breakdown of Assessment Objectives (2021) | `Breakdown-of-Assessment-Objectives-2021.txt` | — | spec §4 | Mock composition weights | yes |
| Corbettmaths structure | CCEA checklists M1–M8 (video numbers per topic), contents index mapping (08 v1 §9.2–9.3, Appendix A) | — | — | Topic taxonomy cross-check; outbound video/practice links by number (never text) | links only |
| BBC Bitesize structure | CCEA M1–M8 guides | — | Double Award article ids (05 §1.2) | Outbound links per topic | links only |
| Formula sheets / data leaflet / glossaries | `formula-sheet-M*-Summer2025-p2.png` | `GCSE-Further-Mathematics-Formulae-and-Tables.pdf` | `DA-Chemistry-Data-Leaflet.pdf`, three glossaries | `exam-true/formula-sheets.json`, `chemistry-data-leaflet.json`, glossary key-word cards (our sentences containing the key words, linked to the PDF) | yes |
| Module book / textbook | CCEA Higher textbook chapter numbers (08 v1 §9.2, FSL site) — if the owner holds the book, chapter ↔ topic map only | CCEA fact files, Q&A booklets | CCEA fact files, Student Guide, practical manual | Taxonomy cross-check; `externalRefs`; **never** a drafting input | if held |
| Specimen Assessment Materials, practice papers 2021/22 | `specimen-assessment-materials.txt` | SAMs v2 2019 | `DA-Specimen-Assessment-Materials.pdf` | Corpus (style/tariff patterns), copy-check reference | yes |

### 3.4 Extraction stage: question-pattern mining from the private corpus

The corpus is `pdftotext -layout` text beside each PDF (already produced by `scripts/download-papers-corpus.mjs`). Inspection of `M4-H-Paper-67799.txt` and `M4-H-MS-68184.txt` (November 2025) shows the structure the miner relies on: pages separated by form-feed (`\f`); questions start with `^\s{1,4}(\d{1,2})\s` at left margin; part marks appear as `[n]` at line end after `Answer ______`; the mark scheme lists per question the working lines with codes `MA1`, `M1`, `A1` and an "AVAILABLE MARKS" column; the front matter contains the paper's date/time and the ten General Marking Advice rules. `£` is garbled to `�` (handled by a replacement map).

Outputs are **metadata only** (never question text) and are committed under `packs/<subject>/mined/`:

| Script | Input | Output | What it extracts |
|---|---|---|---|
| `pipeline/corpus/segment-paper.mjs <txt>` | one question paper `.txt` | `mined/<session>/<unit>[-P1|P2].questions.json` | per question and part: number, part label, page (from `\f` count → `pdfPage` for `#page=` deep links), marks, answer-line presence, bold instruction words captured by regex over a command-word dictionary, figure present (heuristic: "diagram", "graph", grid), context type (money/percentage/geometry…) via keyword classes; `textHash` (SHA-256 of the normalised question text, kept for the isomorph screen; text itself discarded) |
| `pipeline/corpus/segment-markscheme.mjs <txt>` | one mark scheme `.txt` | `mined/<session>/<unit>.scheme.json` | per question: available marks, the **sequence of mark codes** (e.g. `MA1, A1, MA1`), follow-through flags (`ft`), accepted ranges, common phrases in the scheme's own vocabulary (e.g. "or equivalent", "accept", "any correct method"), the General Marking Advice rules present |
| `pipeline/corpus/classify-topics.mjs` | segmented questions + taxonomy | `mined/<session>/<unit>.topics.json` | topic ids per question (AI-assisted classification against `data/spec/<subject>-topics.json`, then human-confirmed in a review table; the classifier sees the question text privately, stores only ids) |
| `pipeline/corpus/mine-stats.mjs` | all of the above | `mined/stats.<subject>.json` | topic frequency per unit and series; tariff distribution per topic; command-word frequencies per unit and tier; mark-code sequence patterns per topic ("M1 A1" vs "MA1 MA1 A1"); position-in-paper (early/late — a proxy for demand); calculator vs non-calculator split; part-structure skeletons (e.g. "(a) 2 calculate, (b) 3 explain") |
| `pipeline/mine/extract-cer.mjs` | CER `.txt` files | `packs/<subject>/insights/<topic>.json` | per topic: findings `{ series, unit, question, asked, wentWrong, fullMarkAnswersDid, rule, misconceptions[] }` in *our words*, with the report URL; a misconception registry `packs/<subject>/insights/misconceptions.json` (`id`, label, statements, first/last seen) that becomes the vocabulary for distractor tags and ledger tags |
| `pipeline/corpus/page-map.mjs` | segmented questions | `data/papers/page-map.json` | `{ paperId: { q: page } }` so the Paper Runner and the Linked Library can deep-link a question |

Two facts are written into the exam-true layer as soon as the miner runs on Summer 2025: the confirmed Maths mark-code set (**M, A, MA** — verified from the November 2025 M4 mark scheme; C §6.2 had this as "[confirm]") and the ten General Marking Advice rules rewritten in our words in `presentation-rules.json` (e.g. rule v: two answers with none on the answer line → the poorer is marked; rule viii: mark at the greatest number of significant figures seen).

For **Science**, the same miner gets a P-code mode (marking points as `[1]` lines with accept/reject/ignore), a QWC detector (six-mark band descriptors), and a Booklet B mode (item types from C §6.6). For **FM**, M/W/MW codes. For a future **English**, levels-based grids (3.10).

Everything in the mined layer answers "what does a CCEA question on this topic look like and how is it marked?" without a single sentence of CCEA text leaving the private folder.

### 3.5 Distillation stage: our own, better originals

Inputs to any drafting session (whether a Claude Code session following the prompt files, or the optional API driver in Phase 1) are **only our own structured data**: statement text and id (short spec quotations are permitted inside `<SpecBox>` with attribution), teacher-guidance limits in our words, the insight card, the mined statistics for that topic (tariff distribution, command words, part skeletons, mark-code patterns), the exam-true profile, the style guide, the bundle spec, and the Zod JSON Schema. The pipeline code refuses to assemble a prompt that includes any file under `docs/sources/papers/` or a Corbettmaths PDF (C §4 stage 7 "provenance rule", enforced in `pipeline/draft/assemble-context.mts`).

Content unit types produced per topic (bundle sizes L/S/H as C §2; H for examiner-flagged topics, which get 2–3× the items — A §2 is the flag list):

| Unit | What makes ours "better than what exists" | Evidence |
|---|---|---|
| **D1 The Sheet / Need-to-Know note** (`note.mdx`) | Per statement, in CCEA language: must-be-able-to (command words), formula-sheet given vs must-know, *not on this spec*, how it is examined (from mined stats: "usually 6–9 marks late in M4, often paired with stratified sampling"), the trap list; ≤150 words between interactions; unlocked after the pre-check so reading is never the first move | B §3.1; C P1; 06 §17; 07 §7.1 |
| **D2 Diagnostics** (`diagnostics.json`) | 4–8 single-skill MCQs, 10–20 s each, every distractor a *named* misconception from the registry with its own feedback, confidence collected, hypercorrection routing | C P2; 06 §9 |
| **D3 Worked examples with mark narration** (`worked-examples.json`) | Each step: working, the decision ("I notice… so I…"), a why-menu, and *which mark it earns* (M1/A1/MA1 or M1/W1); a structurally identical twin; two backward-faded completions | C P4; B §3.5; 06 §6, §7, §12 |
| **D4 Original exam-style questions with CCEA-language mark schemes** (`questions.json`) | New contexts, numbers, diagrams; CCEA layout (marks in brackets, answer line, calculator flag, tier, resources); scheme in the subject's mark language with follow-through and `dependsOn`; per-mark process feedback; solution program for machine verification | C P3, §6; A P3; 06 §2 (Yang 2021 format matching), §15 |
| **D5 Find-the-mistake** (`find-the-mistake.json`) | Plausible wrong working seeded from a report finding, with the series cited; locate, name, fix | C P5; B §3.6; 06 §9 (McLaren 2015) |
| **D6 Retrieval prompts** (`prompts.json`) | Atomic, focused, effortful prompts authored *inside* the note; formula/definition prompts require the examiner's key words | C P6; B §3.2; 07 §2.8 |
| **D7 Method-locked and presentation items** (flags on D4) | `methodLock` from `exam-true/method-locks.json`; bold instruction capture; presentation rules enforced | A P6; C §6.8–6.9 |
| **D8 Practical trainer** (`practical.json`) | Per prescribed practical: method, 2-D apparatus, variables, results-table header, graph rules, reliability/accuracy/validity, calculations, Booklet-B items | C P9; A P8; B §3.12; 05 §4 |
| **D9 Equation Vault / Glossary / Data-Leaflet decks** (`packs/science/decks/*.json`) | Recall, units, rearrange, substitute-with-conversion drills; "equation line before numbers" rule; key-word definitions | C P8, P10; A P7; 03 §5.9, §7.1 |
| **D10 QWC builder** (`qwc.json`) | Indicative-content checklist, three bands, model → upgrade-me → blank, listing rule | C P11; A P9 |
| **D11 Sets and mocks** (`sets.json`, `packs/<subject>/mocks/*.json`) | Interleaved sets with no labels, SSDD sets, mocks composed to the AO/strand grid and to the mined tariff distribution of the real paper | C P15; 06 §5; 01 §3 |
| **D12 Insight card** (`insight.json`) | The examiner-report distillation for the topic, cited to series/unit/question; the source of D2 distractors and D5 seeds; shown in the Sheet's trap list | C P7 |

Authoring order = exam date first, then examiner-reported difficulty (C §5.2; A §2). H bundles for: M4 histograms/median, algebraic fractions (add/subtract, divide, equations with algebraic denominators), quadratics from geometry and "show that", two-step circle-theorem reasoning, bounds with awkward rounding, reverse percentages/multipliers, straight lines through two points/perpendiculars, multi-step trig with early rounding, arc/sector/compound solids, cumulative frequency reasoning; M8 surds, variation, circle/tangent, non-right-angled and 3-D trig, standard form, indices, subject-twice, transformations, similar-shape ratios; FM1 algebraic fractions, derivative conditions, logs, optimisation, three equations from context, integration with +c, trig graphs, completing-the-square "hence"; FM2 force diagrams, 2T, i–j, inclines, moments; FM3 conditional probability, pooled SD, linear transformation, binomial "at least", normal tails; Science: physics equations and definitions, QWC sites, formulae/balancing/ionic/half equations, organic chemistry, practical apparatus/graph skills, lens rays (A §2.1–2.5, 01 §9.5, 02 §8, 03 §7).

### 3.6 Verification stage

Every item passes gates in order; a failure attaches the checker's detail and loops back (max two automatic loops, then human). All checks are recorded in the item's `VerificationLog`.

| Gate | Check | Tool | Notes |
|---|---|---|---|
| G0 schema | Zod parse of every JSON and MDX frontmatter; ids unique; referenced ids exist | `pipeline/check/schema.mts` | `z.toJSONSchema()` exported for editor validation and for structured drafting |
| G1 scope/tier | Every skill inside the referenced statements and tier; nothing from `notOnThisSpec`; formula-sheet claims match `exam-true/formula-sheets.json`; Foundation builds drop `textMarked` Higher phrases (science) | `pipeline/check/scope.mts` + critic prompt `critic.scope-tier.md` | Deterministic checks first; the critic model only for judgement calls, output pass/fail per line |
| G2 exam-true | Command words from the dictionary; tariff within the mined distribution for the topic (warn if outside the 10–90th percentile); mark codes legal for the subject profile; A/W marks `dependsOn` an M; ft flags present where CCEA would ft; calculator flag consistent with paper; non-calculator numbers hand-doable | `pipeline/check/exam-true.mts` | Uses `mined/stats.<subject>.json` — this is where corpus mining pays back |
| G3 examiner alignment | Every finding on the topic's insight card is exercised by ≥1 distractor, ≥1 find-the-mistake, ≥1 exam-style part (H: ≥2 each) | `pipeline/check/alignment.mts` | |
| G4 maths verification | Numeric: run the item's solution program (mathjs) and compare with the declared answer under its tolerance; an independent blind solve (a second model instance given only the stem) must agree. Algebraic: compute-engine `isIdenticallyEqual` between declared and independently derived forms, then numeric sampling at 12 rational points in the domain (10 §10.3) — the same engine the marker uses. Mark scheme arithmetic: parts sum, `dependsOn` acyclic, ft targets exist. Graph items: the `GraphExpectation` is derived from the same data as the figure. Science: dimension check with mathjs units; chemistry balance by element count; physics equation must exist in the equation registry; FM: g = 10, 2 d.p. default | `pipeline/check/verify-maths.mts`, `verify-science.mts` | Zero tolerance at this gate |
| G5 style lint | KaTeX compiles (`strict: 'warn'`, no errors); banned strings ("grade 9", "Paper 1/2" in science, "AQA", "required practical", "elastic limit" where limit of proportionality is meant); required strings (axis labels, units); British spelling; `£` and `%` formatting; ≤150 words between interactions; reading age ≈ 14 | `pipeline/check/lint.mts` | |
| G6 copy and isomorph | **Shingle check**: every text field against the private reference corpus (all paper/MS `.txt`, specs, guidance, fact files, glossaries, CERs, Corbettmaths PDFs if held) — any 8-word (maths) / 10-word (science prose) match outside a `<SpecBox>` fails. **Isomorph screen**: for exam-style items, structural similarity (part skeleton + numbers + context class) against `mined/*.questions.json` `textHash`/skeleton records and an embedding similarity against the private question texts; flagged items need the critic to confirm context, numbers and part structure are new. | `pipeline/check/copycheck.mts` | The reference corpus never enters `out/` |
| G7 human spot-check | Phase 0–1: the developer reads 100% of Sheets, insight cards and exam-style items with schemes (checklist: reads like a CCEA question; tariff feels right; a marker could use the scheme; the trap list is true to the report; nothing embarrassing). Later: 100% exam-style, 30% random sample of the rest, 100% of anything she reports | `pipeline/check/sign-off.mts` records `by`, `at` | An NI teacher volunteer, if found, reviews H exam-style items only |

The **verification log is rendered in the UI** as the "Checked" panel on every item (C §10): rows straight from `checks[]`, failed or waived checks shown not hidden, her "Something wrong?" reports and their resolution underneath, and the log exported to `out/verification/<itemId>.json`.

### 3.7 Publish stage

```
pipeline/publish.mts
  1 requires status >= verified and a clean G0–G6 run for the current version
  2 builds packs/<subject>/content/** -> src/generated/manifest.json (routes, topic index, coverage stats),
    src/generated/notes/<topic>.js (compiled MDX), public/content/<subject>/<topic>.json (items),
    public/content/<subject>/decks/*.json, public/verification/<itemId>.json
  3 coverage report (topics with S/H bundles vs L vs none) -> shown on the SpecMap as plain text
  4 next build && serwist build (Section 7)
```

Unverified items never appear in her queue: the loader filters on `verification.status === "published"`. Every edit bumps `version` and re-runs G0–G6 automatically (`npm run content:check`).

### 3.8 Folder and file layout (final)

```
C:\dev\ccea\                                  # moved from Downloads (10 §15)
  app/                                        # Next.js App Router (static export)
  src/
    components/{shell,home,items,topic,review,papers,ledger,map,interactives,gift}/
    lib/{content,marking,srs,mastery,grades,plan,ledger,papers,db,theme,math}/
    generated/                                # built by pipeline/build-content (gitignored)
  packs/
    product.json                              # name, tagline, accent
    maths/
      pack.json                               # SubjectPack manifest (units, papers, tiers, ums, strands, itemTypes)
      exam-true/{mark-language,command-words,tariffs,formula-sheets,presentation-rules,method-locks}.json
      data-pack/{boundaries,timetable,rules}.json
      insights/{misconceptions.json, m4.histograms.json, ...}
      mined/{stats.maths.json, 2025-Summer/M4.questions.json, M4.scheme.json, M4.topics.json, ...}
      content/m4/histograms/{note.mdx, worked-examples.json, diagnostics.json, questions.json,
                             find-the-mistake.json, prompts.json, sets.json, insight.json, verification/*.json}
      mocks/*.json
    further-maths/  (same shape; exam-true adds method-locks.json, formula-sheets by unit)
    science/        (same shape; exam-true adds qwc-bands.json, booklet-b-item-types.json,
                     physics-equations.json, chemistry-data-leaflet.json; content adds practicals/<code>/)
    english/        (future; 3.10)
  data/
    spec/{double-award-science.json, further-mathematics.json, gcse-mathematics.json,
          double-award-science-topics.json, README.md}
    papers/{index.json, page-map.json, README.md}
    personal/notes.json                       # gift notes; gitignored
  pipeline/
    corpus/{segment-paper,segment-markscheme,classify-topics,mine-stats,page-map}.mjs
    mine/extract-cer.mjs
    draft/{assemble-context.mts, draft.mts (optional API driver)}
    check/{schema,scope,exam-true,alignment,verify-maths,verify-science,lint,copycheck,sign-off,run}.mts
    prompts/{style-guide.md, system.maths-examiner.md, system.fm-examiner.md, system.science-examiner.md,
             outline.md, draft.note.md, draft.questions.md, draft.diagnostics.md, draft.prompts.md,
             draft.ftm.md, critic.scope-tier.md, critic.markscheme.md, critic.distractors.md,
             extract.cer-insights.md, mark-language.<subject>.md}
    golden/                                   # marking-engine regression corpus (question, answer, expected marks)
    build-content.mts, publish.mts
  scripts/                                    # spec builders (exist) + build-maths-spec, build-science-topics
  docs/{plan,research,sources,dev}
  docs/sources/papers/                        # private corpus (gitignored)
```

### 3.9 Schemas (final; TypeScript-flavoured, implemented as Zod 4 in `src/lib/content/schema.ts`)

These extend 10 §9.2 and C §3. Changes from C §3: mark codes are the **confirmed** CCEA sets; `SubjectPack` and `MarkLanguageProfile` are new so a subject is data; `MinedQuestion` and `Misconception` are new; `AnswerSpec` gains `text-long` (bands) for English; `Question.skeleton` is new (for the isomorph screen and for composing mocks).

```ts
// ---------- shared ----------
type SubjectId = "maths" | "further-maths" | "science" | "english-language" | "english-literature" | string;
type Tier = "F" | "H" | "both" | "untiered";
type SpecRef = string;              // "M4-HD-02" | "FM1-ALF-01" | "DA-P1-1.4.17" | "DA-PRAC-C5" | "DA-U7-plan-3"; validated against data/spec/*.json
type TopicId = string;              // "maths.m4.histograms"
type ExaminerSource = `ccea-cer:${string}:${string}:${string}:Q${string}`;   // ccea-cer:maths:2025-summer:M4:Q22
type PaperContext = { unit: string; paper?: 1 | 2; calculator: boolean; bookletB?: boolean; resources: string[] };

// ---------- the subject as data ----------
type SubjectPack = {
  id: SubjectId; title: string; cceaQualificationId: string; subjectCode: string; gradeScale: string[];
  units: Array<{ code: string; title: string; tier: Tier; weighting: number; umsMax: number; umsScale: number;
    papers: Array<{ name: string; minutes: number; marks: number; calculator: boolean | null; resources: string[] }>;
    prerequisiteUnits: string[]; series: ("November"|"March"|"Summer")[] }>;
  strands: Array<{ id: string; title: string }>;
  markLanguage: MarkLanguageProfile;
  itemTypes: ItemTypeId[];                       // which content-unit types this subject uses
  answerKinds: AnswerKind[];                     // which AnswerSpec kinds the marker must support
  commandWordsFile: string; tariffsFile: string; formulaSheetsFile?: string; methodLocksFile?: string;
  qwcBandsFile?: string; rubricsFile?: string;   // rubricsFile: levels-based subjects (English)
  externalProviders: Array<{ kind: string; label: string; licenceNote: string }>;
};

type MarkLanguageProfile = {
  codes: Array<{ code: string; meaning: string; dependsOnMethod?: boolean }>;
  // maths:   M (method), A (accuracy; needs preceding M), MA (combined)             [confirmed from MS text]
  // fm:      M, W (working), MW                                                       [02 §7]
  // science: P (marking point [1] with accept/reject/ignore), QWC (6, three bands)    [03 §7.1]
  // english: L (levels-based band mark), AO-tagged                                    [3.10]
  followThrough: boolean; positiveMarking: boolean;
  rules: Array<{ id: string; text: string; source: string }>;   // General Marking Advice in our words
  feedbackTemplates: Record<string, string>;                     // "M1 earned for {for}; A1 lost — {reason}"
};

type ItemTypeId = "note"|"we"|"dx"|"q"|"ftm"|"rp"|"ins"|"prac"|"eq"|"qwc"|"set"|"mock"|"ew"|"ann";  // ew = extended writing, ann = annotation (English)

// ---------- statements and topics ----------
type Statement = { id: SpecRef; unit: string; strand: string; text: string; tier: Tier; specPage?: number;
  teacherGuidance?: string; exclusions?: string[]; progressionOf?: SpecRef | null; mixed?: boolean; textMarked?: string; topics: TopicId[] };

type Topic = { id: TopicId; slug: string; title: string; subject: SubjectId; unit: string; tier: Tier; strand: string;
  statementIds: SpecRef[]; prerequisites: TopicId[]; order: number;
  hardness: "L"|"S"|"H"; difficulty: 1|2|3|4|5; examinerFlagged: boolean; examinerSources: ExaminerSource[];
  examWeightHint: string;                        // from mined stats: "6–9 marks, late M4, most series"
  mustMemorise: string[]; onFormulaSheet: string[]; notOnThisSpec: string[];
  externalRefs: ExternalRef[]; keywords: string[]; practicals?: string[] };

type ExternalRef =
  | { kind: "corbettmaths"; videos: number[]; playlistId?: string; practiceUrl?: string; textbookUrl?: string }
  | { kind: "bitesize"; url: string; articleId?: string }
  | { kind: "youtube"; videoId: string; channel: string; start?: number; end?: number; credit: string; checkpoints?: Array<{ at: number; promptId: string }> }
  | { kind: "ccea-doc"; docType: "spec"|"teacher-guidance"|"factfile"|"glossary"|"practical-manual"|"qa-booklet"|"data-leaflet"|"cer"|"pastpaper"|"markscheme"; url: string; page?: number; asOf: string }
  | { kind: "phet"; sim: string; url: string; licence: "CC BY 4.0 (pre-2026-03-29)"|"CC BY-NC 4.0"; attribution: string }
  | { kind: "geogebra"; materialId: string; attribution: "Made with GeoGebra®" }
  | { kind: "pastpaper-question"; paperId: string; question: string; page: number };   // from data/papers + page-map

// ---------- notes ----------
type NoteFrontmatter = { id: `note.${string}`; topic: TopicId; title: string; subject: SubjectId; unit: string; tier: Tier;
  specRefs: SpecRef[]; calculator: boolean | "P1-no/P2-yes"; formulaSheet: { given: string[]; mustKnow: string[] };
  notOnThisSpec: string[]; hardness: "L"|"S"|"H"; examinerFlagged: boolean; externalRefs: ExternalRef[];
  sheet: { mustBeAbleTo: string[]; howExamined: string; traps: string[] };   // The Sheet is data so it can be printed and shown before the note
  verification: VerificationRef; version: number; updated: string };
// MDX components: <SpecBox ref>, <MustKnow>, <NotOnThisSpec>, <ExaminerSays source>, <Prompt id>, <Gate kind=…>,
// <WorkedExample id>, <Try id>, <Diagnostic set>, <Figure spec>, <Interactive name props>, <Video ref>, <Sim ref>, <GlossaryLink term>

// ---------- worked examples ----------
type WorkedExample = { id: `we.${string}`; topic: TopicId; specRefs: SpecRef[]; paper: PaperContext; stem: string; figure?: FigureSpec;
  steps: Array<{ n: number; working: string; decision: string; whyMenu?: { options: string[]; correct: number; explain: string };
                 earns?: string[]; input?: AnswerSpec }>;     // input: what she types at this step when used as a question
  finalAnswer: string; twin: { stem: string; answer: AnswerSpec; figure?: FigureSpec };
  faded: Array<{ showSteps: number; studentSupplies: number[] }>;
  clip?: { kind: "manim"|"motion-canvas"|"youtube"; src: string; captions?: string; seconds: number };
  verification: VerificationRef; version: number };

// ---------- questions ----------
type Question = { id: `q.${string}`; topic: TopicId; specRefs: SpecRef[]; paper: PaperContext; tier: Tier;
  style: "practice"|"exam-style"; difficulty: 1|2|3|4|5; ao: string[]; commandWords: string[];
  emphasis: string[];                             // bold words in the stem the marker enforces ("not", "to 1 decimal place")
  context: { setting: string; original: true }; figures: FigureSpec[]; parts: Part[]; totalMarks: number; timeAllowanceSec: number;
  skeleton: string;                               // "(a)calc2|(b)explain3" for mock composition and the isomorph screen
  methodLock?: { instruction: string; requiredMethod: string; evidence: ExaminerSource };
  examinerSources: ExaminerSource[]; solutionProgram?: string;   // mathjs/JS expression list recomputing the answers from the stem numbers
  verification: VerificationRef; version: number };

type Part = { id: string; stem: string; marks: number; answer: AnswerSpec; scheme: MarkPoint[]; hints: string[];
  workedSolution: string; commonErrors: CommonError[]; requiresWorking: boolean;
  followThrough?: { fromPart: string; rule: "use-candidate-value"|"use-candidate-diagram" } };

type Tolerance = { type: "absolute"; value: number } | { type: "relative"; value: number } | { type: "dp"; places: number }
  | { type: "sf"; figures: number } | { type: "range"; min: number; max: number } | { type: "exact" };

type AnswerKind = "numeric"|"algebraic"|"mcq"|"text"|"text-long"|"graph"|"drawing"|"table"|"equation"|"steps"|"label"|"order"|"annotation";
type AnswerSpec =
  | { kind: "numeric"; value: number; tolerance: Tolerance; unit?: string; unitRequired: boolean;
      acceptForms: ("decimal"|"fraction"|"mixed"|"surd"|"pi"|"percent"|"standardForm"|"ratio")[]; mustBeSimplified?: boolean; moneyFormat?: boolean }
  | { kind: "algebraic"; latex: string; equivalence: "identical"|"equivalent"|"simplifiedOnly"; variables: string[]; domain?: string;
      mustBeFactorised?: boolean; mustBeExpanded?: boolean; keepInequalitySign?: boolean }
  | { kind: "mcq"; options: Array<{ id: string; text: string; correct: boolean; misconception?: string; feedback: string }>; shuffle: boolean }
  | { kind: "text"; accepted: string[]; keyWords: Array<{ any: string[]; marks: number; reject?: string[] }>; listingRule: boolean }
  | { kind: "text-long"; rubricId: string; bands: Array<{ band: string; marks: [number, number]; descriptor: string }>;
      indicativeContent: Array<{ point: string; keyWords: string[] }>; selfMark: true; aiMark?: boolean; minWords?: number }   // QWC, English writing
  | { kind: "graph"; expect: GraphExpectation }
  | { kind: "drawing"; rubric: string[]; selfMark: true; aiMark?: boolean }
  | { kind: "table"; cells: Array<{ row: number; col: number; value: number|string; tolerance?: Tolerance }> }
  | { kind: "equation"; kindOf: "word"|"symbol"|"ionic"|"half"|"nuclear"|"physics"; balancedLatex: string; stateSymbolsRequired: boolean; acceptMultiples: boolean; registryId?: string }
  | { kind: "steps"; expectedOrder: string[]; allowSkips: false }
  | { kind: "label"; targets: Array<{ id: string; accepted: string[]; position?: [number, number]; direction?: "up"|"down"|"left"|"right"|"normal"|"along" }>; bank: string[] }
  | { kind: "order"; items: string[]; correctOrder: number[] }
  | { kind: "annotation"; spans: Array<{ from: number; to: number; tag: string }>; tags: string[]; minCorrect: number };   // English: tag the technique in the extract

type GraphExpectation =
  | { plot: "histogram"; bars: Array<{ from: number; to: number; frequencyDensity: number }>; axisLabelY: "Frequency density"; scaleTolerance: number }
  | { plot: "points-line"; points: [number, number][]; lineThrough?: [number, number][]; tolerance: Tolerance; lineRequired: boolean }
  | { plot: "curve"; samples: [number, number][]; tolerance: Tolerance; smooth: true; noStraightSegments: true }
  | { plot: "region"; inequalities: string[]; shadeInside: boolean }
  | { plot: "box"; min: number; q1: number; median: number; q3: number; max: number; tolerance: Tolerance }
  | { plot: "transformation"; object: [number, number][]; image: [number, number][] }
  | { plot: "best-fit"; throughMeans?: [number, number]; kind: "line"|"curve"; tolerance: Tolerance };

type MarkPoint = { id: string; code: string; marks: number; for: string; accept?: string[]; reject?: string[]; ignore?: string[];
  ft?: boolean; dependsOn?: string[]; seenIf?: string; examinerNote?: string };
type CommonError = { misconception: string; pattern: { kind: "numeric"; value: number; tolerance?: Tolerance } | { kind: "algebraic"; latex: string }
  | { kind: "text"; regex: string } | { kind: "graph"; test: string }; feedback: string; marksTypicallyEarned: number; source?: ExaminerSource };
type FigureSpec =
  | { kind: "svg-gen"; generator: "histogram"|"cf-curve"|"box-plot"|"bar"|"pie"|"scatter"|"table"|"number-line"|"axes"; data: unknown; options?: unknown }
  | { kind: "jsxgraph"; script: string; static: boolean } | { kind: "mafs"; component: string; props: unknown }
  | { kind: "svg"; src: string; alt: string } | { kind: "photo"; src: string; alt: string; licence: string; credit: string; prompt?: string }
  | { kind: "apparatus"; parts: string[]; style: "ccea-2d" };

// ---------- diagnostics, prompts, find-the-mistake, insight ----------
type DiagnosticSet = { id: `dx.${string}`; topic: TopicId; specRefs: SpecRef[]; when: "pre"|"post"|"both"; items: DiagnosticItem[] };
type DiagnosticItem = { id: string; stem: string; skill: string; figure?: FigureSpec;
  options: Array<{ id: string; text: string; correct: boolean; misconception?: string; feedback: string }>;
  secondsExpected: number; confidence: true; hypercorrectionQueue: true };
type RetrievalPrompt = { id: `rp.${string}`; topic: TopicId; specRefs: SpecRef[];
  kind: "qa"|"cloze"|"formula"|"definition"|"procedure"|"trap"|"label-diagram"|"novel-example"|"quotation";   // quotation: English Literature
  prompt: string; answer: string; keyWords?: string[]; image?: FigureSpec; examUnit?: string; difficultyPrior?: number };
type FindTheMistake = { id: `ftm.${string}`; topic: TopicId; specRefs: SpecRef[]; stem: string; studentWorking: string[]; mistakeLine: number;
  misconception: string; whatWentWrong: string; correction: string[]; marksEarnedAsWritten: string[]; feedback: string; source: ExaminerSource };
type Misconception = { id: string; label: string; subject: SubjectId; statements: SpecRef[]; sources: ExaminerSource[]; firstSeen: string; lastSeen: string; ledgerTag: "method"|"accuracy"|"misread"|"presentation"|"not-attempted"|"concept" };
type ExaminerInsight = { id: `ins.${string}`; topic: TopicId; specRefs: SpecRef[];
  findings: Array<{ source: ExaminerSource; url: string; asked: string; wentWrong: string; fullMarkAnswersDid?: string; rule: string; misconceptions: string[] }>;
  ruleToRemember: string; aStarSignal?: string };

// ---------- science-specific ----------
type Practical = { id: `prac.${string}`; code: string; specRef: `DA-PRAC-${string}`; attachedLOs: SpecRef[]; title: string; method: string[];
  apparatus: string[]; apparatusDiagram: FigureSpec; variables: { independent: string; dependent: string; control: string[] }; hypothesis: string;
  risks: Array<{ hazard: string; control: string }>; resultsTable: { columns: Array<{ heading: string; unit: string }>; repeats: number };
  graph?: { x: string; y: string; expected: "straight-through-origin"|"straight"|"curve"; note: string }; calculations: string[];
  vocabulary: Array<{ term: string; ourDefinition: string; keyWords: string[] }>; bookletBItems: `q.${string}`[]; bookletAChecklist: string[];
  examinerSources: ExaminerSource[]; externalRefs: ExternalRef[] };
type PhysicsEquation = { id: `eq.${string}`; specRefs: SpecRef[]; latex: string; words: string; symbols: Array<{ sym: string; quantity: string; unit: string }>;
  rearrangements: string[]; conversions: Array<{ from: string; to: string; factor: number; examinerNote?: string }>; givenInExam: false;
  constants?: Array<{ sym: string; value: number; unit: string; note: string }>; drills: ("recall"|"units"|"rearrange"|"substitute-convert")[] };
type QwcItem = { id: `qwc.${string}`; specRefs: SpecRef[]; unit: string; tier: Tier; stem: string; indicativeContent: Array<{ point: string; keyWords: string[]; commonLoss?: string }>;
  bands: Array<{ band: "A"|"B"|"C"|"0"; marks: [number, number]; descriptor: string }>; modelAnswerBandA: string; upgradeMeBandB: string; selfMarkRubric: string[]; examinerSources: ExaminerSource[] };

// ---------- mined layer (metadata only) ----------
type MinedQuestion = { paperId: string; session: string; unit: string; paper?: 1|2; tier: Tier; question: string; part?: string; page: number; marks: number;
  commandWords: string[]; emphasis: string[]; hasFigure: boolean; contextClass: string; skeleton: string; markCodes: string[]; ft: boolean;
  topics: TopicId[]; topicsConfirmedBy?: "human"; textHash: string };   // no text
type MinedStats = { subject: SubjectId; generatedFrom: string[]; byTopic: Record<TopicId, { appearances: Array<{ session: string; unit: string; question: string; marks: number }>;
  tariff: { min: number; p10: number; median: number; p90: number; max: number }; commandWords: Record<string, number>; markCodePatterns: Record<string, number>; latePaperShare: number }>;
  byUnit: Record<string, { commandWords: Record<string, number>; tariffHistogram: Record<string, number>; questionsPerPaper: number[] }> };

// ---------- data pack and verification ----------
type DataPack = { umsUnitBoundaries: Record<string, Record<string, number>>; rawBoundaries: Array<{ unit: string; series: string; grades: Record<string, number>; source: string }>;
  subjectBoundaries: Array<{ qual: string; series: string; aStar: number|string; grades: Record<string, number> }>;
  timetable: Array<{ series: string; unit: string; paper?: string; date: string; start: string; end: string; source: string; version: string }>;
  rules: Array<{ id: string; text: string; appliesFrom?: string; source: string }>; asOf: string };
type VerificationRef = `ver.${string}`;
type VerificationLog = { id: VerificationRef; itemId: string; version: number;
  checks: Array<{ type: "schema"|"scope-tier"|"formula-sheet"|"command-words"|"tariff"|"maths-numeric"|"maths-symbolic"|"independent-solve"|"units-dimensions"|"chem-balance"|"examiner-alignment"|"copy-shingle"|"isomorph"|"style-lint"|"katex-compile"|"link-health"|"human-spot";
    tool: string; result: "pass"|"fail"|"waived"; detail?: string; at: string; by: "pipeline"|"claude"|"developer"|"teacher" }>;
  status: "draft"|"checked"|"verified"|"published"|"withdrawn"; reports: Array<{ at: string; by: "learner"|"developer"; text: string; resolvedAt?: string; resolution?: string }> };
```

### 3.10 Onboarding a new subject with the same pipeline (worked example: English Language and Literature)

What stays identical: the pack folders; `pack.json`; the four layers; `segment-paper.mjs` (question numbering, marks in brackets and page breaks are the same CCEA house style); `extract-cer.mjs`; the insight cards and misconception registry; the gates G0–G7; the Checked panel; the review inbox; the exam map and UMS engine (English Language is also modular, and stays modular under the 2029 reform — 09 §9.4; note the **interim GEX specification first taught September 2026**, 09 §9.2 — the pack must be built from that document, not the 2017 one).

What changes (all of it data or item types, no new architecture):

| Layer | English Language / Literature specifics |
|---|---|
| Statements | AO-based (AO1–AO6 reading/writing/spoken) rather than content statements; `Statement.strand` = AO; `Topic` = skill (e.g. "analyse language for effect", "structure a persuasive letter", "compare writers' viewpoints"; Literature: text-specific topics per set text and theme) |
| Mark language | `MarkLanguageProfile.codes = [L]` with levels-based bands per AO; `rubricsFile` holds the band descriptors in our words; `feedbackTemplates` talk in band language ("Band 3: some analysis of language; to reach Band 4 you need…") |
| Mined layer | `segment-markscheme.mjs` gets a levels-grid mode (band, marks range, descriptor fingerprints; indicative content bullet counts); `mine-stats` reports tariff per question type ("writing task 30 + 8 SPaG") and command-word patterns ("How does the writer use language to…") |
| Item types | adds `ew` (extended writing with `text-long` answer: bands, indicative content, model → upgrade-me → blank, self-mark, optional AI band mark via the serverless tutor with structured output), `ann` (annotation: tap-to-tag techniques in an extract — our own extracts or public-domain texts only; set-text extracts are quoted only within fair-dealing limits for private study and never republished), `rp.kind = "quotation"` (Literature quotation decks with context and theme tags), "plan-the-answer" `steps` items (thesis → points → evidence → effect), and SPaG diagnostics as `dx` |
| Components | `BandLadder` (three sample answers at three bands, tap the sentence that earns the band), `UpgradeThis` (edit a Band-B paragraph into Band-A with a checklist), `AnnotateExtract` (tap-to-place tags; keyboard alternative), timed writing runner with word count and a plan gate; the Sheet becomes "what this question type rewards" |
| Verification | G4 becomes rubric-consistency checks (every indicative point tagged to an AO; band ranges sum to the tariff) plus a readability check; G6 shingle check is *stricter* for Literature (set-text quotation length limits enforced) |
| Corpus | English past papers and mark schemes downloaded by the same `download-papers-corpus.mjs` with the feed id added to `FEEDS` in `build-papers-index.mjs` |

Onboarding checklist (`docs/dev/new-subject.md`, to be written in Phase 3 when English is added): add the feed id; build `data/spec/<subject>.json` from the spec PDF with `extract-spec-pdf.mjs`; write `pack.json` and the exam-true files; run the corpus miner; extract insight cards; author the first H topics; the app renders the new subject from the manifest with no code change except any new component the pack's `itemTypes` declares.

---

## 4. The pedagogical loop

`diagnose → teach → practise → exam → review → re-diagnose` (06 §16), run by the platform as the "consistent tutor" (NSSA), in bounded sessions.

### 4.1 Dosage

30–45 minutes, four to five days a week, in a plan that runs back from the exam dates (06 §16 EEF/NSSA); default four sessions a week (three 15-minute weeknights + one 45-minute weekend block, B §5.3); a daily maximum of 45 minutes and a review cap of 25 items so a missed week never returns as a wall (B §5.2); a rest week after each paper; a light day before every exam; no notifications after 9.30 pm; streaks counted in weeks with ≥3 sessions, one freeze per half-term (07 §2.2).

### 4.2 One session (the Rosenshine skeleton, 06 §11)

| Minutes | Block | Mechanics |
|---|---|---|
| 0–8 | **Review inbox** | FSRS-due items (prompts, equations, definitions, diagnostics re-probes, hypercorrection items, one-line method-locked items); Again / Good / Easy; twin-fix-it-now on any miss |
| 8–25 | **Target block** | One topic chosen by `weakest × marks-at-stake × proximity-to-paper` (A §4.1) or by "what are you doing in school this week" (B §5.3): pre-check (4–6 diagnostics with confidence) → The Sheet → step-reveal note → worked-example-as-question → twin → two faded completions → 4–6 minimally varied items → 3 mixed items; **success governor**: rolling accuracy < 70% steps back (more support, easier variants, the example again); > 90% steps up (fade, interleave, harder variants) (06 §11) |
| 25–35 | **Exam habit** | Three exam-style items in mixed mode (no topic labels), one non-calculator if M8 is in scope, one find-the-mistake or method-locked item; confidence on each |
| 35–40 | **Close** | Tag lost marks; one plan–monitor–evaluate line ("which mark was cheapest to lose?"); tomorrow's queue previewed; the retention line ("predicted recall of M4 items on 14 May: 91%"); no celebration unless a milestone |

### 4.3 FSRS in exam-date mode (extends `src/lib/srs/scheduler.ts`)

- ts-fsrs (FSRS-6), desired retention **0.90** by default; per unit: **0.93** inside 42 days of that unit's paper, **0.95** inside 14 days (the existing `retentionForExam` already encodes this); `maximum_interval` capped so that no item's next due date falls after its unit's paper minus one day (`exam-mode.ts`); the first review of a newly learned item is never later than 3 days out during term and never later than the paper.
- One card per prompt/diagnostic/equation/definition/find-the-mistake; questions create a card only when missed or answered with low confidence (so the queue stays item-level and mixed by construction, 06 §3, §5).
- **Hypercorrection queue**: confident-wrong (confidence ≥ 4/5 and wrong) → re-probe at +2 days and +7 days regardless of FSRS state, then handed back to FSRS (06 §9, Butler 2011; Foster 2022).
- Items for a sat unit are **parked** until its results day, then resumed if the unit will be resat or its content is assumed by a later unit (M8 assumes M1–M7).
- The trade-off is shown in words, never the algorithm; parameters re-optimised from her review log monthly from Phase 3 (06 §3).

### 4.4 Mastery states (per statement, with decay; B §5.1; 07 §2.3)

| State | Enters when | Leaves when |
|---|---|---|
| Not started | — | first attempt |
| Attempted | any attempt | ≥ 70% on the topic's initial (blocked) set |
| **Familiar** | ≥ 70% on the initial set | a correct answer in a mixed set ≥ 2 days later |
| **Proficient** | correct in a later mixed set and FSRS stability implies ≥ 85% recall at 7 days | a miss in any mixed set or review (drops to Familiar) |
| **Mastered** | correct in ≥ 3 spaced sessions and predicted retention ≥ 90% on the unit's paper date | a miss (drops to Proficient); parked after the paper |

No level is awarded from an immediate post-test alone; unit tests can promote many statements; mixed tests can demote. The headline number everywhere is "statements at Proficient+" per unit, never minutes or points. Topic gate for moving on: ≥ 80% on a delayed mixed check, with the corrective being *different* instruction (06 §11).

### 4.5 The year, on the real dates (01 §6; 02 §6; 03 §6; 09 §5.3, §6; timetable texts in `docs/sources/maths/`)

The Exam Map is configured on day one for her actual entries. Two shapes are supported and the correct one must be confirmed with her school (open decision 1): **Shape A** (Year 12 now, everything cashed in Summer 2027) and **Shape B** (Year 11 now: gateway units and DAS unit 1s in Nov 2026/Mar 2027/Summer 2027; M8, B2/C2/P2, Unit 7 and FM in Summer 2028; note November 2027 is resit-only for Maths and March 2028 has no Science, 09 §9.1).

| Window | Calendar facts | What the loop does |
|---|---|---|
| 15 Sep → early Oct 2026 | — | Diagnose every topic in scope (pre-checks, ~2 min each); Equation Vault and Glossary to criterion; target blocks start on the H list |
| Oct → 19 Nov 2026 | Nov series: B1 Mon 9 Nov 9.15, C1 Tue 10 Nov 9.15, P1 Wed 11 Nov (pm); **M1–M4 Tue 17 Nov 9.15–11.15**; M5–M8 Thu 19 Nov (P1 9.15–10.30, P2 10.45–12.00). Results Thu 4 Feb 2027. Last November open to first-time Maths entries | If entered: six-week sprint on that unit (retention 0.93 from T−42, weekly timed section from week 2, full paper weeks 4–5, paper-eve card, no session on the paper morning). If not: normal loop |
| 1 Dec 2026 → 1 May 2027 | Unit 7 Booklet A window (3 × 1 h practicals, 15 marks each) | Practical Studio modules front-loaded so table/graph/unit skills are fluent before the school schedules the tasks |
| Jan → Feb 2027 | March series (Science only): B1 Mon 22 Feb, C1 Wed 24 Feb, P1 Fri 26 Feb (9.30). Results Thu 15 Apr 2027. Last March with Science | Mock cycle 1 (UMS-calibrated, past series) for every unit in scope; first "top ten traps" |
| Mar → mid-Apr 2027 | — | Retention 0.93 for May units; mock cycle 2 on a different series; Booklet B timed sets; one QWC a week per science |
| Mid-Apr → exam eve | — | Weekly full papers per unit in rotation; Non-calc Five daily; last 14 days retrieval and mixed practice only |
| **Summer 2027 run** | **Tue 11 May B1 9.15** · **Fri 14 May M1–M4 (am)** · Mon 17 May C1 9.15 · **Tue 18 May FM U1 9.15** · Tue 25 May P1 9.15 · **Thu 27 May M5–M8 (P1 9.15–10.30, P2 10.45–12.00)** · Wed 2 Jun B2 9.15–10.30 + Biology Booklet B 10.45–11.15 · Fri 4 Jun FM U2 (pm) · Thu 10 Jun C2 + Chemistry Booklet B · Mon 14 Jun P2 + Physics Booklet B · Tue 15 Jun FM U3 9.15–10.15 · contingency Wed 23 Jun | "Next paper only" mode: queue re-weights to the next paper; paper-eve card the night before (traps, what is and is not on the formula sheet, calculator mode, equipment, timing plan, "nothing new tonight"); no session on paper mornings; three-tap check-in after each paper |
| Results Thu 19 Aug 2027 | — | Retro: predicted vs actual UMS per unit; for Shape B the Summer 2028 plan starts |

---

## 5. Information architecture

Next.js App Router, `output: 'export'`, `trailingSlash: true`, every dynamic route enumerated from `src/generated/manifest.json` via `generateStaticParams` with `dynamicParams = false` (10 §2.3).

| Route | Screen | Purpose | Phase |
|---|---|---|---|
| `/welcome` | First run | Her name, the note from him, the exam plan already filled in by him (editable), sessions-per-week default, theme | 0 |
| `/` | **Today** | The only bento (≤ 8 tiles, B §7.4): header line "Wednesday 7 October · M4 in 41 days · Tue 17 Nov, 9.15"; **Tile A (2×2)** "Tonight · 11 due · about 9 min" with one *Start* button (empty state: "Nothing due. Come back tomorrow — or learn something new."); **Tile B (2×1)** next learn step with *why*; **Tile C (1×1)** this week (four dots, weeks in a row); **Tile D (1×1)** next three papers; **Tile E (2×1)** Proficient+ bars per unit with the retention forecast for the next paper's unit; **Tile F (1×1)** top three traps in examiner language; **Tile G (1×1)** the envelope, only when a note is unlocked. Nothing scrolls horizontally or animates on scroll; only Tile A uses the accent | 0 |
| `/review` | Review inbox | Full FSRS queue, one card per screen, Again/Good/Easy, twin-fix-it-now, review-complete card with the retention line and "5 more minutes on…" | 0 |
| `/learn` → `/learn/[subject]` → `/learn/[subject]/[unit]` | Subjects, units | Unit overview with the cumulative statement checklist (M8 shows assumed M1–M7 content as an "assumed" panel), mastery chips, coverage stated plainly ("original questions for 6 of 10 M4 topics; the rest link out") | 0 |
| `/learn/[subject]/[unit]/[topic]` | **Topic page** | Anatomy, top to bottom: (1) header with mastery chip, statement ids, tier, calculator flag, formula-sheet status; (2) **Pre-check** (4–6 diagnostics with confidence) — the rest is dimmed until done or explicitly skipped; (3) **The Sheet** (printable, ≤150 words + one diagram, traps, on/off the sheet); (4) **Step-reveal note** (gates every ≤150 words); (5) **Worked example as question** → Your Turn → faded; (6) **Practice** (variation ladder then mixed); (7) **Exam-style** (2–5 items in CCEA layout, self-mark then platform, Checked panel on each); (8) **Find-the-mistake**; (9) **Links** (Corbettmaths video numbers with checkpoints, Bitesize, CCEA docs, NI Maths Tutor, past-paper questions by deep link, sim); (10) "Something wrong?" | 0 |
| `/practise` | Mixed-practice builder | Units, calculator/non-calculator, marks, time, item types; Non-calc Five; SSDD sets; Phase 0 sets are hand-ordered, Phase 1 adds the MixedSet engine with the governor | 0 / 1 |
| `/papers` → `/papers/[paperId]` | **Paper Runner** | Picker (Standard papers with a published mark scheme, from `data/papers/index.json`; Summer 2026 papers shown as "mark scheme not yet published"); the runner: opens the official PDF on ccea.org.uk in a new tab (© CCEA, never re-hosted), runs the real timer and structure, "formula sheet is on page 2" reminder; afterwards the **self-mark grid** (one row per question from the page map; she opens the official mark scheme herself and enters marks); **UMS result** (raw → UMS → unit grade → subject grade, A\* band, gap in raw marks); marks dropped by topic → ledger and twins for the next session. Phase 1 adds original mocks with the platform's own scheme | 0 / 1 |
| `/map` | **Exam Map** | Her units and series on a timeline with real dates/times, the 40% terminal rule, one-resit rule, Nov 2027 resit-only and Mar 2028 no-science warnings, UMS forecast per unit, the A\* band, per-unit retention forecast; the SpecMap grid of every statement coloured by state; calibration curve (Phase 1) | 0 |
| `/ledger` | Mark Ledger | Lost marks by tag and topic, misconception profile, top-ten traps, calibration (Phase 1) | 0 (basic) / 1 |
| `/science/decks`, `/science/practicals/[code]`, `/science/qwc/[id]` | Recall decks; Practical Studio; QWC Builder | Equation Vault, Glossary, Data Leaflet drills; the 18 practical modules; QWC sites | 0 (decks) / 2 |
| `/settings` | Settings and gift layer | Exam plan editor; sessions per week; retention target in words; theme (light default), evening mode time, reduced motion, text spacing; notes on/off; export/import JSON with a fortnightly backup reminder; "Ask [brother]" list (Phase 1); about/credits/licences | 0 |

**Navigation:** phone = five bottom tabs (Home, Learn, Practise, Papers, Map); desktop = the same five in a left rail; a search field/command palette ("histogram", "2T", "Rf") jumps to a topic or item.

**Mobile behaviour:** phone is for reviews, diagnostics, sprints, The Sheet and the exam map; laptop/iPad for topics with graphs, working canvases and timed papers. Single column; ≥ 44 px answer targets; a sticky *Check* button above the keyboard; a tailored maths keyboard (fraction, √, powers, π, ≤, ×) in Phase 0 as a custom input strip, MathLive in Phase 1; tap-to-place for every drag; the PWA works offline for everything except YouTube and remote PhET, which carry an "online only" badge.

---

## 6. Design system

The craft goes where she looks hundreds of times: the answer field, the feedback card, the review-complete screen and the mastery chip (07 §7.16; B §4).

### 6.1 Palette (LCH tokens, generated from three variables — Linear, 07 §3)

```css
:root {
  /* variables */
  --base-h: 80;  --accent-h: 270;  --contrast: 1;
  /* ground and ink (light default: exam papers are black on white) */
  --ground:   lch(98% 1 var(--base-h));      /* warm off-white ≈ #FAFAF7 */
  --surface:  lch(100% 0 0);
  --ink:      lch(12% 1 var(--base-h));      /* ≈ #171717 */
  --ink-2:    lch(40% 2 var(--base-h));
  --ink-3:    lch(60% 2 var(--base-h));
  --line:     lch(90% 1 var(--base-h));
  /* one accent, used only for "the thing to do next" */
  --accent:   lch(45% 60 var(--accent-h));   /* deep signal blue */
  --accent-2: lch(92% 12 var(--accent-h));
  /* semantic states: never the only signal (icon + text + motion) */
  --ok:       lch(55% 45 145);               /* used for the tick only */
  --warn:     lch(70% 60 80);
  --miss:     lch(50% 55 25);                /* used sparingly; a miss is shown by the diagram reacting and a hairline outline */
  /* subject tint: 4% on unit headers only */
  --tint-maths: lch(96% 6 270); --tint-fm: lch(96% 6 300); --tint-bio: lch(96% 6 150); --tint-chem: lch(96% 6 60); --tint-phys: lch(96% 6 230);
}
[data-theme="dark"] { --ground: lch(10% 2 var(--base-h)); --surface: lch(14% 2 var(--base-h)); --ink: lch(94% 1 var(--base-h)); /* … */ }
[data-theme="hc"]   { --contrast: 1.4; /* line and ink pushed apart; accent chroma up */ }
```

Green and orange are never brand colours (the NI connotation caution, B §4.1); they exist only as semantic tokens. KaTeX, Mafs and JSXGraph are themed through the same tokens (`.katex { color: var(--ink) }`, board `strokecolor` from CSS variables at mount).

### 6.2 Type

Inter for UI (`font-feature-settings: "tnum", "zero"` on scores, UMS and timers), Inter Display for headings, KaTeX fonts for all maths (`output: htmlAndMathml`), maths at 1.05–1.08× the surrounding text (the scaffold already sets 1.08em), optional STIX Two Text for long notes. Notes: left-aligned, 65–75-character measure, no italics for emphasis, no all-caps headings, adjustable spacing (GOV.UK, 07 §4).

### 6.3 Motion rules

150–300 ms, transform/opacity only, `MotionConfig reducedMotion="user"`; nothing moves on scroll in the study surface; no smooth-scroll libraries in the app (10 §5). Vocabulary: step-reveal paragraph = fade + 8 px rise; correct = a tick that draws in 250 ms + 1.02 scale; wrong = the *diagram* reacts first, never a shake or a red flash; list changes with auto-animate; milestone = one full-bleed 1.2 s card; confetti only for "exam-ready" and results days (FEAT, 07 §3). Feedback never uses the word "Wrong" (07 §2.7).

### 6.4 Component inventory (the signature interactive components)

| # | Component | Props (essential) | Behaviour |
|---|---|---|---|
| 1 | `StepRevealNote` | `{ mdx, gates: Gate[], onGate(id, answer) }` | Renders compiled MDX; each `<Gate kind="blank"|"choice"|"number"|"why">` blocks rendering below it until answered; ≤150 words between gates |
| 2 | `DiagnosticWithConfidence` | `{ item: DiagnosticItem, onAnswer({ optionId, confidence, ms }) }` | Four options, 5-dot confidence row, instant reveal with the distractor's own feedback; routes confident-wrong to hypercorrection |
| 3 | `InlinePrompt` | `{ prompt: RetrievalPrompt, mode: "inline"|"review", onGrade(Again|Good|Easy) }` | Prompt → answer (type/choose/self-grade) → reveal → three buttons at thumb height |
| 4 | `RecallSprint` | `{ deck: (PhysicsEquation|RetrievalPrompt)[], criterion: 1 }` | Untimed run to criterion; wrong ones recycle; reports time-to-criterion |
| 5 | `WorkedExampleAsQuestion` | `{ we: WorkedExample, fade: "full"|"faded1"|"faded2"|"twin"|"problem", accuracy }` | Each step an input; a wrong step reveals only that step's fix; why-menu; support level adapts to accuracy (≥80% problems, <50% the example again) |
| 6 | `AnswerField` | `{ spec: AnswerSpec, calculator: boolean, onSubmit(raw) }` | Numeric / text / MCQ / algebraic (typed LaTeX-lite in Phase 0, MathLive in Phase 1); equation-line-before-numbers mode for physics; sticky Check button; unit picker |
| 7 | `FeedbackCard` + `TwinFixItNow` | `{ result: MarkResult, twin?: Question, examinerLine?: string }` | Correct answer, one-line process diagnosis, examiner sentence with series, then a twin to fix it now; after two misses, `EncouragementCard` offers a hint or a worked variant instead of a third miss |
| 8 | `FindTheMistake` | `{ item: FindTheMistake }` | Tap the first wrong line → choose the reason → fix it in a field; cites the series |
| 9 | `VariationLadder` | `{ items: Question[], expectPrompt: true }` | Reflect–Expect–Check–Explain: "what do you expect to change?" before each item (Phase 1) |
| 10 | `MixedSet` | `{ pool, size, governor: { low: 0.7, high: 0.9 } }` | No labels, no two consecutive items sharing a method, SSDD sets, rolling-accuracy governor (Phase 1) |
| 11 | `PredictThenPlot` | `{ canvas: "mafs"|"jsxgraph", guess: GuessSpec, truth, tolerance }` | Drag (or tap-to-place) a guess; Check animates the truth in and shades the residual (Phase 1) |
| 12 | `Interactive` (family) | `HistogramMedian`, `TheoremChain`, `BoundsLadder`, `CircleTangent`, `TransformationStepper`, `ScaleFactorCubes`, `TrigGraph`, `ForceDiagramCheck`, `RayDiagram`, `AtomCounter`, `IonBuilder` — each `{ data, mode: "explore"|"task", onResult }` with a tap alternative | Built only where reports show a spatial/structural failure (Pillar 11) |
| 13 | `LabelTheDiagram` | `{ spec: AnswerSpec<"label">, figure }` | Chip bank; tap a chip then a target; direction and position matter (Phase 1) |
| 14 | `SelfMark` | `{ scheme: MarkPoint[], learnerMarks, platformMarks, tags }` | She allocates marks against descriptors first; then the platform's allocation and the discrepancy; tag each lost mark (Phase 0 grid for official papers; Phase 1 descriptors) |
| 15 | `PaperRunner` + `UmsDial` | `{ paper: PaperIndexEntry|Mock, pageMap, boundaries }` | Timer at CCEA pace; feedback withheld until the end; raw → UMS → grade as a single arc with the A\* bracket and the gap in raw marks |
| 16 | `MasteryChip` | `{ state, lastEvidenceAt, decayHint }` | Four states with a decay indicator; tapping explains what Proficient needs |
| 17 | `CheckedPanel` | `{ log: VerificationLog, onReport(text) }` | Compact verification rows; failed/waived shown; "Something wrong?" |
| 18 | `VideoWithCheckpoints` | `{ ref: ExternalRef<"youtube">, checkpoints }` | Click-to-load facade (privacy-enhanced host, no overlays, ≥480×270), a question every 2–3 minutes, an attempt within 60 s of the end; never marks complete (Phase 1) |
| 19 | `PracticalPlanningBuilder`, `QwcBuilder` | `{ practical }`, `{ qwc, fade }` | Apparatus/variables/table/graph/vocabulary tasks; model → upgrade → blank with band self-marking (Phase 2) |

### 6.5 Photos, diagrams, graphs, video — with purpose

Photographs only where the exam context is physical and a photo carries information a diagram cannot (flame-test colours, hydrogencarbonate indicator, a potometer bubble, a eureka can, iron filings), each with a prompt ("what would the examiner ask about this?"), own or CC-licensed with licence and credit stored in `FigureSpec.photo`; diagrams: one idea each, labels on the figure, themed SVG or Mafs/JSXGraph, every figure has a text description; graphs interactive when prediction matters, static otherwise; simulations (PhET) always wrapped in a task with the attribution line and unobstructed logo; video ≤ 6 minutes, only via `VideoWithCheckpoints`, never as the lesson; ≤ 60 s Manim/Motion-Canvas explainer clips only for H topics (Phase 2+). No stock decoration anywhere (EEF "lethal mutation", 06 §10).

### 6.6 Accessibility rules

WCAG 2.2: 24 px minimum targets (44 px on answer controls); every drag has a tap alternative (2.5.7); focus never obscured by the sticky Check bar (2.4.11); colour never the only signal; `prefers-reduced-motion` honoured; KaTeX `htmlAndMathml` everywhere, MathJax read-aloud toggle in Phase 2; light default with dark and high-contrast from the same tokens; text spacing and measure adjustable; no timed-out sessions mid-question; no login at all (single learner, local data).

### 6.7 Eight signature moments

1. **First open.** Her name, his note, and a header that already reads "M4 in 42 days · Tue 17 Nov, 9.15" — the platform knew her papers before she did anything.
2. **The Sheet unlocks.** After the pre-check, the one-screen sheet slides up with the two things she got wrong already highlighted in the trap list.
3. **Histogram median.** Bars drawn from her frequency-density inputs; she drags a vertical line and the area to its left fills; the readout stops changing colour at n/2.
4. **Theorem chain.** Tapping a reason from the phrase bank lights exactly the angles it justifies; the reason line composes itself with the key words and refuses "Z angles".
5. **Equation before numbers.** The physics answer box shows two lines; the equation line ticks quietly when it matches the vault, and only then do the substitution and unit lines open. The March 2026 examiner sentence appears once, the first time, and never again.
6. **The Ledger opens.** After a mixed set, marks appear as a row of small squares; lost marks flip to hairline outlines and settle under their tag headings: "7 marks lost. The 2 misreads are the cheapest to recover."
7. **The UMS dial.** After a paper: raw → UMS → grade drawn as one arc; the A\* band is a thin bracket at the top and the caption says the gap in raw marks on this unit.
8. **Paper-eve card.** The night before each paper: her ten traps, what is and is not on the formula sheet, calculator mode and equipment, the timing plan, "Nothing new tonight." Printable; reduced-motion safe; the envelope if he wrote one.

---

## 7. Technical architecture

Built on the existing scaffold (Next 16.3 static export, React 19.2, Tailwind 4.3, KaTeX 0.18 + mhchem, Mafs 0.21, JSXGraph 1.13, Motion 13, ts-fsrs 5.4, Dexie 4.4, Zod 4.5, Zustand 5, MathLive 0.110, compute-engine 0.120; `src/lib/math/Math.tsx`, `src/lib/db/db.ts`, `src/lib/srs/scheduler.ts`, `src/lib/content/spec-types.ts` already exist).

| Layer | Decision | Detail |
|---|---|---|
| Framework | Next.js 16 App Router, `output: 'export'`, `trailingSlash: true`, `images.unoptimized`, Turbopack; `--webpack` fallback if a Windows bug appears | `next.config.ts` as in 10 §2.3; `generateStaticParams` from `src/generated/manifest.json`; `dynamicParams = false` |
| Content build | `pipeline/build-content.mts` runs before `next build`: compiles each `note.mdx` with `@mdx-js/mdx` (`remark-gfm`, `remark-math`, `rehype-katex` with `output: 'htmlAndMathml'`) to a plain JS module under `src/generated/notes/<topic>.js` (this sidesteps Turbopack's string-plugin restriction and keeps custom remark plugins possible); bundles the topic's JSON (filtered to `published`) to `public/content/<subject>/<topic>.json`; writes the route manifest, coverage stats and `public/verification/*.json` | Add `@mdx-js/mdx`, `gray-matter`, `remark-gfm`, `remark-math`, `rehype-katex`, `tsx` |
| Maths rendering | KaTeX via `<Math>`/`<M>` (exists), `throwOnError: false`, mhchem for `\ce`; runtime `renderToString` for JSON items, memoised `<Tex>` | Self-host `katex.min.css` and fonts; precache |
| Client state | **Dexie** (durable): `cards`, `reviewLog`, `attempts`, `mastery`, `sessions`, `settings`, `examPlan`, `ledger`, `mocks`, `reports`, `notesUnlocked` (schema v2 extends `db.ts`); **Zustand** (ephemeral): current item, timer, panel layout, small persisted prefs | `useLiveQuery` for the inbox and chips |
| FSRS | ts-fsrs FSRS-6 (exists) + `queue.ts` (due selection, daily cap, unit weighting), `exam-mode.ts` (retention by days-to-paper, interval cap), `hypercorrection.ts` | Review logs kept for later optimisation |
| Answer checking | `src/lib/marking/numeric.ts` (parse `2/3`, `√2`, `3.2×10^4`, `45%`, unicode minus; tolerance types; forms; units via mathjs; money format), `algebraic.ts` (compute-engine three-stage: `isSame` → `isIdenticallyEqual` → 12-point rational sampling; `mustBeFactorised` via a MathJSON walker), `text.ts` (accepted list, key-word groups with reject lists, the science listing rule), `mcq.ts`, `graph.ts` (per `GraphExpectation`), `equation.ts` (element-count balance, registry match), `index.ts` (dispatch on `answer.kind`, applies `MarkPoint` logic with `dependsOn`/ft, produces `MarkResult` with tags) | Golden corpus in `pipeline/golden/`; every reported error adds a case |
| Maths input | Phase 0: a typed input with a maths key strip (`AnswerField`); Phase 1: MathLive `<math-field>` with a tailored virtual keyboard, LaTeX → compute-engine | 10 §10 |
| Interactives | Mafs (pinned 0.21, wrapped in `MafsBoard` so it can be swapped), JSXGraph in a `useEffect`-initialised `JsxBoard` wrapper (MIT), `d3-scale`/`d3-shape` for data charts; R3F 9 lazy-loaded only where rotation matters (Phase 2) | Tap alternatives everywhere |
| Video / sims | YouTube privacy-enhanced facade (`youtube-nocookie.com`, no overlays, ≥ 480×270, no caching); PhET iframe with the attribution line and visible logo; pre-29-Mar-2026 CC BY 4.0 builds self-hosted for offline if needed | 10 §12 |
| PWA | Serwist post-build: `next build` → `serwist build` with `serwist.config.mjs` (`globDirectory: 'out'`, `swSrc: 'src/sw.ts'`, `swDest: 'out/sw.js'`, raised `maximumFileSizeToCacheInBytes`); precache app shell, content JSON, KaTeX fonts; runtime CacheFirst for fonts, StaleWhileRevalidate for content; never cache YouTube/PhET remote | `public/manifest.webmanifest`, icons, install prompt on `/welcome` |
| Export/import | `src/lib/db/export.ts`: whole-DB JSON (versioned, with schema id), import with merge-or-replace; fortnightly reminder; she owns the file | |
| Deployment | Vercel (static `out/`; the tutor function only in Phase 3) with a private, non-indexed URL (`robots: noindex`); local `npx serve out`; GitHub Pages possible with `basePath` | `vercel.json` with `cleanUrls: false` |
| Testing | Vitest 4 (unit: marking engines against the golden corpus, scheduler, UMS engine, mastery engine; `fake-indexeddb` for Dexie logic); Playwright (first run, review loop, topic page, paper runner, offline mode via `context.setOffline(true)`, dark mode, reduced motion) | `npm test`, `npm run e2e` |
| Optional AI tutor (Phase 3) | Claude API via a serverless function only (never a key in the bundle), structured output against the `MarkPoint[]` schema for "mark my working"; BYO-key mode for local | 10 §13 |
| Windows pitfalls | Move the repo to `C:\dev\ccea` (no spaces, short path); `npm.cmd`/`npx.cmd` or `Set-ExecutionPolicy RemoteSigned`; Defender exclusion for the project folder; `.gitattributes` `* text=auto eol=lf`; no Sass; kill stale `node` processes before `next dev`; `pdftotext` (poppler) is on PATH via Git Bash (`/mingw64/bin/pdftotext`) — the corpus script depends on it; case-sensitive imports (Vercel builds on Linux) | 10 §15 |

---

## 8. Phased roadmap

### 8.1 Phase 0 — the birthday version (2–16 September 2026; ≈ 98 h)

**Definition of done ("her first ten minutes", B §8, adapted):** (1) she opens the installed PWA on her phone; it greets her by name, knows her next paper and date, and a note from him is waiting; (2) she taps Start; 8–12 reviews run (equations, diagnostics, one twin) and she finishes with a retention line and no nag; (3) she taps the suggested M4 topic; pre-check, The Sheet, step-reveal note, worked-example-as-question and two exam-style items with the Checked panel run without a bug and her mastery chip changes; (4) she opens Papers, sees Summer 2025 M4 by deep link with a timer, a self-mark grid and a UMS result, and understands what A\* needs; (5) all of it works offline and in dark mode.

Ordered backlog. Hours are for one developer with AI assistance; content hours assume drafting inside AI sessions using the prompt files, with the deterministic checks and a full human read.

| Id | Task | h | Files to create / change |
|---|---|---|---|
| P0-01 | Move the repo to `C:\dev\ccea`; add dependencies (`@mdx-js/mdx`, `gray-matter`, `remark-gfm`, `remark-math`, `rehype-katex`, `mathjs`, `d3-scale`, `d3-shape`, `serwist`, `@serwist/build`, `@serwist/cli`, `vitest`, `fake-indexeddb`, `@playwright/test`, `tsx`); scripts (`content:check`, `content:build`, `build`, `sw`, `test`, `e2e`); Windows notes | 2 | `package.json`, `.gitattributes`, `vitest.config.ts`, `playwright.config.ts`, `docs/dev/windows.md` |
| P0-02 | Finish the Maths STATEMENTS + TOPICS layers for the Higher units (M3, M4, M7, M8) and emit `data/spec/gcse-mathematics.json`; generalise the validator | 4 | `scripts/build-maths-spec.mjs`, `scripts/maths-spec/topics-m3.mjs`, `topics-m4.mjs`, `topics-m7.mjs`, `topics-m8.mjs`, `scripts/validate-spec-json.mjs`, `data/spec/gcse-mathematics.json` |
| P0-03 | Build the science topics JSON from the hand-authored source | 1 | `scripts/build-science-topics.mjs`, `data/spec/double-award-science-topics.json` |
| P0-04 | Subject pack manifests and the full Zod content schema (3.9) with JSON Schema export | 3 | `src/lib/content/schema.ts`, `src/lib/content/ids.ts`, `packs/product.json`, `packs/maths/pack.json`, `packs/further-maths/pack.json`, `packs/science/pack.json`, `scripts/export-json-schema.mjs`, `pipeline/schema/*.json` |
| P0-05 | Exam-true layer v1 (confirmed M/A/MA; M/W/MW; P/QWC; command words; tariffs; formula sheets; presentation rules from the General Marking Advice; FM method locks; QWC bands transcribed from the spec) | 2 | `packs/maths/exam-true/{mark-language,command-words,tariffs,formula-sheets,presentation-rules}.json`, `packs/further-maths/exam-true/{mark-language,method-locks,formula-sheets,tariffs}.json`, `packs/science/exam-true/{mark-language,qwc-bands,tariffs,booklet-b-item-types}.json` |
| P0-06 | Data pack (unit UMS scales, Summer 2025/2026 raw boundaries, subject boundaries with A\* band, Nov 2026 / Mar 2027 / Summer 2027 timetable rows with times, rules) and the UMS engine with tests | 3 | `packs/*/data-pack/{boundaries,timetable,rules}.json`, `src/lib/grades/ums.ts`, `src/lib/grades/exam-plan.ts`, `src/lib/grades/ums.test.ts` |
| P0-07 | Corpus segmentation and mining v1 on the maths sessions already downloaded (page map, questions, schemes, stats) | 3 | `pipeline/corpus/segment-paper.mjs`, `segment-markscheme.mjs`, `mine-stats.mjs`, `page-map.mjs`, `pipeline/corpus/README.md`, `packs/maths/mined/**`, `data/papers/page-map.json` |
| P0-08 | Chief Examiner insight cards for the ten M4 topics, four FM1 topics and P1 energy; misconception registry seed | 2 | `pipeline/mine/extract-cer.mjs`, `pipeline/prompts/extract.cer-insights.md`, `packs/maths/insights/*.json`, `packs/further-maths/insights/*.json`, `packs/science/insights/*.json`, `packs/*/insights/misconceptions.json` |
| P0-09 | Pipeline checks (G0–G6) as deterministic scripts plus the prompt library for drafting and critic sessions | 5 | `pipeline/check/{schema,scope,exam-true,alignment,verify-maths,verify-science,lint,copycheck,sign-off,run}.mts`, `pipeline/draft/assemble-context.mts`, `pipeline/prompts/*.md`, `pipeline/golden/README.md` |
| P0-10 | Content build and loader (MDX → JS modules, JSON bundles, manifest, verification export) | 4 | `pipeline/build-content.mts`, `pipeline/publish.mts`, `src/lib/content/load.ts`, `src/generated/.gitkeep`, `mdx-components.tsx` |
| P0-11 | App shell, LCH theme tokens (light/dark/evening/high-contrast), five-tab navigation, fonts | 4 | `app/layout.tsx`, `app/globals.css`, `src/lib/theme/tokens.ts`, `src/components/shell/{AppShell,BottomTabs,SideRail,ThemeProvider,CommandSearch}.tsx` |
| P0-12 | Dexie schema v2 (examPlan, reviewLog, ledger, mocks, reports, notesUnlocked) and export/import | 2 | `src/lib/db/db.ts`, `src/lib/db/export.ts`, `app/settings/page.tsx` |
| P0-13 | Answer engines (numeric, text with listing rule, MCQ, algebraic three-stage, mark-point application with ft/dependsOn) with the golden corpus | 5 | `src/lib/marking/{numeric,algebraic,text,mcq,equation,index}.ts`, `src/lib/marking/*.test.ts`, `pipeline/golden/*.json` |
| P0-14 | Review inbox: queue selection, exam-date mode, hypercorrection, daily cap, review-complete card with the retention line | 5 | `src/lib/srs/{queue,exam-mode,hypercorrection}.ts`, `src/components/review/{ReviewInbox,ReviewCard,ReviewComplete}.tsx`, `app/review/page.tsx` |
| P0-15 | Item components: DiagnosticWithConfidence, InlinePrompt, RecallSprint, AnswerField (+ maths key strip), FeedbackCard + TwinFixItNow + EncouragementCard, WorkedExampleAsQuestion (faded), FindTheMistake (simple), StepRevealNote gates | 7 | `src/components/items/*.tsx`, `src/components/items/Tex.tsx` |
| P0-16 | Topic page (pre-check → Sheet → note → WE → practice → exam-style → FTM → links → Checked) and the mastery engine | 4 | `app/learn/[subject]/[unit]/[topic]/page.tsx`, `app/learn/[subject]/[unit]/page.tsx`, `app/learn/page.tsx`, `src/components/topic/{TheSheet,PreCheck,TopicSections,LinksPanel,CheckedPanel,MasteryChip}.tsx`, `src/lib/mastery/engine.ts` (+ test) |
| P0-17 | Home (Today) bento with the next-step chooser and week strip | 2 | `app/page.tsx`, `src/components/home/*.tsx`, `src/lib/plan/next-step.ts` |
| P0-18 | Exam Map and first-run screen (plan editor pre-filled by him) | 2 | `app/map/page.tsx`, `app/welcome/page.tsx`, `src/components/map/{ExamMap,PlanEditor,UmsDial,SpecMap}.tsx` |
| P0-19 | Paper Runner v0: picker from `data/papers/index.json` (Standard + published MS), deep links with `#page=` from the page map, timer, self-mark grid, UMS result, ledger filing | 4 | `app/papers/page.tsx`, `app/papers/[paperId]/page.tsx`, `src/lib/papers/index.ts`, `src/components/papers/{PaperPicker,Timer,SelfMarkGrid,UmsResult}.tsx` |
| P0-20 | Mark Ledger v1 (tags, per-topic losses, top traps) | 2 | `app/ledger/page.tsx`, `src/lib/ledger/{tags,traps}.ts`, `src/components/ledger/*.tsx` |
| P0-21 | Two interactives with tap alternatives: Histogram median (SVG/d3) and Theorem chain (JSXGraph) | 4 | `src/components/interactives/{JsxBoard,HistogramMedian,TheoremChain}.tsx` |
| P0-22 | **Content: six H bundles for M4** — histograms and median; algebraic fractions (add/subtract, divide, equations with algebraic denominators); quadratics from geometry and "show that"; two-step circle-theorem reasoning; bounds with awkward rounding; reverse percentages and multipliers — each: Sheet + note, 2–4 worked examples with twins and faded versions, 6–8 diagnostics, 12–16 practice, 3–5 exam-style with M/A/MA schemes, 2–3 find-the-mistake, 8–12 prompts, insight card; all gates passed and read in full | 12 | `packs/maths/content/m4/{histograms,algebraic-fractions,quadratics-from-geometry,circle-theorem-reasoning,bounds,reverse-percentages-multipliers}/*` |
| P0-23 | **Content: two FM Unit 1 H bundles** — algebraic fractions (FM level, factorise-first, M/W schemes) and derivative conditions (tangents/normals; dy/dx = 0 vs = k; "hence" method lock) | 3 | `packs/further-maths/content/fm1/{algebraic-fractions-add-subtract,tangents-normals-derivative-conditions}/*` |
| P0-24 | **Content: science decks** — Equation Vault (≈25 equations + 8 conversions, four drill types, equation-line rule), Glossary seed (~40 definitions with key words, linked to the official glossaries), one P1 topic (kinetic energy) as an S bundle; `EquationLine` input | 4 | `packs/science/decks/{physics-equations,glossary}.json`, `packs/science/content/p1/kinetic-energy/*`, `src/components/items/EquationLine.tsx`, `app/science/decks/page.tsx` |
| P0-25 | Gift layer: welcome note, birthday-dated start, notes that unlock on real dates (first week, first Proficient, paper eves, 4 Feb / 15 Apr / 19 Aug 2027) | 1.5 | `data/personal/notes.json` (gitignored), `src/components/gift/{Envelope,FirstRunNote}.tsx`, `src/lib/gift/unlocks.ts` |
| P0-26 | PWA: Serwist post-build, manifest, icons, offline test | 2 | `src/sw.ts`, `serwist.config.mjs`, `public/manifest.webmanifest`, `public/icons/*` |
| P0-27 | Polish pass on the four surfaces (answer field, feedback card, review-complete, mastery chip); dark/evening mode on KaTeX and JSXGraph; reduced motion | 3 | the components above; `app/globals.css` |
| P0-28 | Tests, deploy, install on her phone and laptop | 2.5 | `e2e/{first-run,review,topic,papers,offline}.spec.ts`, `vercel.json`, `docs/dev/deploy.md` |
| | **Total** | **98** | |

**What Phase 0 delivers that already passes her "why" test:** (1) a platform that knows her exact units, dates and times and converts any past paper she sits into UMS with the A\* band — nothing she owns does this (04 §4.2; 09 §10); (2) six deep, verified, original M4 topics on precisely the questions the Chief Examiners say separate A from A\* — with mark schemes in CCEA's own M/A/MA language and a Checked panel on every item (01 §9.5); (3) two Further Maths topics where no interactive practice exists at all (04 §2.20); (4) the physics equations and definitions she must recall, scheduled to criterion (03 §5.9, §10); (5) a review inbox that brings her own errors back before she forgets them, in about ten minutes a night (06 §3, §9); (6) the official papers turned into a timed, self-marked, UMS-scored mock without copying a word (08 §11). Coverage is stated plainly on the map; where content is thin, the topic links to Corbettmaths by video number.

### 8.2 Phase 1 — weeks 3–12 (to late November 2026, through Christmas): full Higher Maths and FM Unit 1

Content: the remaining M4 topics (4 S), M3 assumed-content H bundles (8) and the rest of M3 to S; M8 (10 H + 10 S) and M7 (6 H + 10 S) so the whole Higher route M1–M8 cumulative core is covered; FM Unit 1 complete (10 H + 10 S); Science unit-1 diagnostics from the examiner reports (~20 per discipline) and PhET-wrapped tasks for P1/C1; the M3 prompt deck. Platform: MathLive input with compute-engine; VariationLadder; MixedSet with the governor; PredictThenPlot; FindTheMistake with the fix step; SelfMark with descriptors and tags; VideoWithCheckpoints with the Corbettmaths mapping; exam-week mode and the paper-eve card; original full mocks (two per unit) composed from the mined tariff distribution; Ledger v2 with calibration; "What are you doing in school this week?"; "Ask [brother]"; interactives: Bounds Ladder, Circle & Tangent, Transformation Stepper, k/k²/k³, trig graphs. If she is entered for a November unit, the sprint mode ships in week 3.

### 8.3 Phase 2 — December 2026 to March 2027: Science complete, Unit 7, FM Units 2 and 3

All B1/C1/P1 and B2/C2/P2 section pages with LO checklists, S bundles and H bundles for the flagged topics (03 §7); all 18 Practical Studio modules with the Booklet-B item bank before the 1 December Booklet A window has run far; QWC Builder for every QWC site; Chemistry Equation Lab (formula builder, atom counter, ionic/half equations) and Data-Leaflet drills; FM Unit 2 (force diagrams, 2T, i–j, inclines, moments) and Unit 3 (conditional probability triad, pooled SD, linear transformation, binomial, normal tails) H bundles; LabelTheDiagram; Excalidraw working canvas for multi-mark items; R3F only for 3-D trig/solids; DAS unit-1 mocks for March; monthly cumulative mocks; FSRS parameter optimisation from her review log.

### 8.4 Phase 3 — April 2027 onward: Foundation, polish, AI tutor option, English onboarding

Exam-run mode for every paper in her map; results retro on 19 August 2027; Foundation pack (M1/M2/M5/M6) as L → S bundles for completeness and tier changes; FM Unit 4 L only; the ≤ 60 s explainer clips for the six hardest topics; MathJax read-aloud mode; optional Claude "mark my working" via a serverless function; the English Language (interim GEX spec) and Literature packs onboarded with the checklist in 3.10 as the proof that the pipeline is subject-agnostic; the Summer 2028 plan for Shape B; data refresh each results day and timetable version.

---

## 9. Measurement and proof plan (n = 1, pre-registered)

Within-person, expressed in the exam's own units, reported in full (every mock, never the best), boundaries never adjusted to flatter a forecast, A\* always shown as a band (A §10).

| Measure | Baseline | Cadence | Pre-registered success criterion |
|---|---|---|---|
| **Topic diagnostics** (4–6 misconception-tagged items + confidence per topic) | All topics in scope, weeks 1–3 | Re-diagnose each topic after ≥ 7 days (delayed, not immediate) | ≥ 80% of in-scope topics at Proficient by the end of Phase 1; Mastered only after sustained performance on later cumulative checks, with downward movement allowed |
| **UMS-calibrated mocks** on unseen past series (Summer 2024 → Nov 2024 → Summer 2025 → Nov 2025 → Summer 2026 once its schemes are published) | One M4, one M8 (P1 + P2), FM U1, one paper per DAS unit in scope, under real timing | Every six weeks; the developer double-marks one paper per cycle | By mock cycle 3 (February 2027): M4 ≥ 80/100 and M8 ≥ 85/100 raw under timing (consistent with the reported A\* profile of 77 and 90, 09 §2.3); FM U1 ≥ 80/100; DAS unit papers ≥ 85% raw at Higher; Booklet B ≥ 30/35 |
| **Mark-loss decomposition** by tag | First mock | Every mock | Misread + presentation + not-attempted ≤ 2 marks per paper by cycle 3; method-mark losses on the H-list topics halved between cycles 1 and 3 |
| **Retention forecast** (FSRS retrievability on paper day) | After first reviews | Weekly on the week card | Items with predicted recall < 90% on the paper date trend to zero by the last fortnight; Equation Vault 25/25 at criterion in three spaced sessions by week 3, then maintained |
| **Hypercorrection** | — | Re-probe at +2 and +7 days | ≥ 80% of confident-wrong items correct at the one-week re-probe |
| **Calibration** (confidence vs accuracy per topic) | First 200 answers | Monthly | Over-confident topics shrink month on month; shown to her privately as a curve |
| **Process** | — | Weekly | ≥ 4 sessions/week, median 30–45 min; time-to-mastery per topic recorded; no minutes-logged targets |
| **Results-day check** | — | 4 Feb 2027 (if November entries), 15 Apr 2027, 19 Aug 2027; school mock UMS when available | Platform-predicted UMS within ± 10 of the awarded UMS per unit; the retro screen shows both |

The proof that the *content* is good is separate and continuous: every reported error is logged with its resolution; the target is < 1 confirmed content error per 200 published items by the end of Phase 1, and zero unresolved reports older than 48 hours.

---

## 10. Risks, mitigations and kill criteria

| Risk | Likelihood / impact | Mitigation | Kill / pivot criterion |
|---|---|---|---|
| **Content thinness** — the honest biggest risk: ~400 maths statements, 419 science outcomes, three FM units, one developer | High / high | Depth-first on the H list; bundle sizes L/S/H; exam-date order; coverage stated plainly on the map; link out where thin; Phase 0 ships six deep topics, not sixty shallow ones | If, by 30 November 2026, fewer than 40 verified H/S bundles exist, stop building features entirely and author content only until the M4/M8 H list is complete |
| **Accuracy** — a wrong answer or scheme in AI-drafted content teaches an error and destroys trust | High / high | Gates G0–G7; independent blind solve; compute-engine + sampling; 100% human read of exam-style items and Sheets; the Checked panel; her "Something wrong?" button; items withdrawn from the queue while under investigation; regression cases in the golden corpus | Two confirmed errors in exam-style items in one week → freeze publishing, audit the last 50 items, tighten the failing gate before resuming |
| **Novelty decay** after week three | Medium / high | Reviews are the heartbeat and always short; the plan changes weekly because it runs from real dates; weekly streaks with a freeze; "five minutes tonight" after a missed fortnight; his notes spaced for the mid-term dip; the Sunday week card looked at together | Fewer than 2 sessions/week for three consecutive weeks (outside a rest week) → sit down with her, cut the ask to reviews only, and decide together what to change before adding anything |
| **Over-design / time sink** | Medium / medium | Tokens from three variables; polish budgeted to four surfaces (P0-27 = 3 h); UI time capped at ~30% of Phase 0; no hero animation, no scroll choreography in the app | Any week where UI work exceeds 40% of hours while the content backlog has open H bundles → UI freeze for the following week |
| **Copyright** (CCEA papers/schemes/glossary; Corbettmaths; BBC; PhET; YouTube) | Medium / high | Deep links only; private non-indexed deployment; the private corpus is used only by checkers and miners and never enters `out/`; drafting contexts cannot include source text (enforced in code); shingle and isomorph gates; attribution everywhere; own paraphrases containing glossary key words; PhET attribution and logo; nocookie embed with no overlays | If the platform is ever to be shared beyond her, stop and ask CCEA (info@ccea.org.uk, subject officers) and Corbettmaths before anything is reproduced or embedded beyond links |
| **Windows / tooling** (path length, PowerShell policy, Defender, Turbopack, Mafs staleness, KaTeX 0.18 CSS prefixes) | Medium / low | Move to `C:\dev\ccea`; `npm.cmd`; Defender exclusion; LF; pin Mafs behind a wrapper with JSXGraph as fallback; `--webpack` fallback; test static export and offline in week 1 | A tooling problem that costs more than half a day → switch to the documented fallback immediately (Vite SPA is the last resort, 10 §2.2) |
| **Scope creep** (Foundation first, FM Unit 4, video course, chatbot, 3D, social features) | High / medium | The Phase 0 list is fixed; "out" lists in A §9 and B §9 are binding; anything not on the H list needs a written reason in this document | Any new Phase 0 item requires removing one of equal hours from the table above |
| **Wrong assumptions about her entries** (Year 11 vs 12; November 2026 entry; science tier) | Medium / medium | The Exam Map is editable data; both shapes supported; confirm with the school in week 1 (open decision 1); Phase 0 switch rule: if M4 is already banked, swap the six M4 bundles for the M8 top six (C §5.3) | — |
| **Self-marking bias** inflates mock scores | Medium / medium | Developer double-marks one paper per cycle; rubric training before the first mock; platform scheme applied after hers with the discrepancy shown | If self vs platform discrepancy > 8 marks per paper twice, switch to platform-first marking for that unit |
| **Anxiety / burnout** ("a permanent state of assessment", 09 §7.1) | Medium / high | Bounded sessions; timed mode only after Proficient and ramped from 1.5×; no comparison with anyone; retrieval framed as anxiety-reducing (Agarwal 2014); "nothing new tonight"; rest weeks; the gift layer is switch-off-able and never monitors | Any sign the platform is adding pressure → remove countdowns from the home screen and keep only the review inbox until she asks for more |
| **Boundaries and timetables move**; mark schemes publish 2–5 months late; five-year removals and `_0` renames | Certain / low | Data pack with `asOf` and source per row; A\* always a band; nightly feed diff and link-health job; index rows carry "MS not yet published"/"withdrawn" states | — |
| **Spec reform** | None before September 2029 first teaching (09 §9.4) | Units, tiers, grade scales and calendars are data; A\*–G stays | — |

---

## Appendix — open decisions for the owner

1. **Her entry shape**: Year 11 or 12 in September 2026; whether M4 (and/or B1/C1/P1) is entered in November 2026; science tier; Further Maths timing. This sets the Exam Map on day one and decides the Phase 0 switch (M4 vs M8 bundles).
2. **The name** (Cairn / Bearings / Strand) and the accent hue.
3. **Whether the CCEA Higher textbook ("module book") is held** so its chapter map can be added to `externalRefs` (never its text).
4. **Corpus scope for Phase 0 mining**: maths sessions only (already downloaded) or wait for the full three-subject corpus.
5. **Deployment**: Vercel private URL vs local-only install for the first weeks.
6. **AI drafting mode**: Claude Code sessions with the prompt files (no API cost, Phase 0) vs the API driver (`pipeline/draft/draft.mts`, Phase 1).
7. **Teacher volunteer**: whether an NI maths or science teacher can be asked to spot-check H exam-style items.
