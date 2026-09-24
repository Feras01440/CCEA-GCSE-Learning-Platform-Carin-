# Past-paper mining: extraction stage (`scripts/mine-papers.mjs`)

The EXTRACTION stage of the knowledge-distillation pipeline. It reads the private local corpus of CCEA past
papers (`docs/sources/papers/<subject>/<sessionKey>/*.pdf`, each with a `pdftotext -layout` `.txt` beside it)
and writes **metadata and statistics only** to `data/papers/`:

| File | Content |
|---|---|
| `questions-index.json` | one record per Standard question paper: questions, parts, tariffs, pages, neutral labels, command words, diagram / table / QWC flags |
| `mark-scheme-lexicon.json` | per subject: mark codes, abbreviations, a fixed lexicon of generic marking phrases with counts, headings of the General Marking Instructions boilerplate |
| `stats.json` | per subject / unit statistics, calculator vs non-calculator comparison, QWC per science paper, per-session and per-paper tables |
| `MINING-README.md` | this file: heuristics, accuracy checks, failure modes |

```
npm run papers:mine                       # rebuild the three JSON files and print the report
node scripts/mine-papers.mjs --quiet      # no report
node scripts/mine-papers.mjs --subject maths
node scripts/mine-papers.mjs --debug 66598,66614   # per-question structure of the given feed ids (numbers only)
```

The script is idempotent: every output is recomputed from the files present, carries no timestamp, and two
consecutive runs produce byte-identical files. Missing `.txt` files are produced with `pdftotext -layout` on
the fly. Exit code is 1 if fewer than 90% of papers reconcile with their stated total.

## 0. Legal rule (applies to every output and to the console report)

Outputs contain **no question text and no mark-scheme answer text**. What is stored:

* numbers (marks, tariffs, pages, counts) and identifiers (feed id, unit, tier, session, question / part number);
* per question a label of at most 12 words built only from a **fixed topic lexicon** (`TOPICS_*` in the script)
  and a **fixed command-word list**; a label is a set of tags such as `percentage; money`, never wording copied
  from the paper;
* answer units (`cm`, `£`, `m/s`, ...) only when they match a whitelist of measurement units;
* mark-scheme **codes** (`MA1`, `M1`, `W1`, `[1]`, `ecf`, ...), counts of phrases from a **fixed phrase lexicon**
  (`accept`, `or equivalent`, `any two from`, ...) and the short **headings** of the General Marking Instructions
  boilerplate. No answer text, no indicative content.

The console report prints identifiers and numbers only.

## 1. Corpus and coverage

| Subject | Sessions | Question papers parsed / in feed | Mark schemes parsed / in feed |
|---|---|---|---|
| Mathematics (504) | 15 (2018-Summer to 2026-Summer) | 164 / 164 | 152 / 152 |
| Further Mathematics (507) | 8 (2018 to 2026, Summer only) | 29 / 29 | 25 / 25 |
| Double Award Science (584) | 24 (2018-March to 2026-Summer) | 261 / 261 | 242 / 242 |

Only `type === "Standard"` entries of `data/papers/index.json` are parsed (Modified and Irish-medium variants are
skipped; the 3 feed duplicates flagged `duplicateOf` are not counted). 5,189 questions and 10,493 parts were
extracted.

## 2. Heuristics

### 2.1 Text and pages

* Source text is `pdftotext -layout` (xpdf 4.06). Page numbers come from the form feeds; pdftotext emits one `\f`
  before every page after the first and a trailing one, so `pageCount = number of form feeds`.
* "Structural" lines are ignored everywhere: page barcodes (`*16GMC7103*`), print job numbers (`12995.06 R`,
  which may prefix a content line), `[Turn over`, `BLANK PAGE`. The first non-structural line of a page is the
  page top, an important signal because most CCEA questions start at a page top.
* Front page: `The total mark for this paper is N` (stated total); `Answer all <number-word> questions`
  or `Answer all parts of Question 1` (stated question count, 418 of 454 papers); `You must not use a
  calculator`; science `Quality of written communication will be assessed in Question N(...)`; maths / FM
  `The Formula Sheet is on page 2`.
* Body: from the page after the front page and formula sheet to `THIS IS THE END OF THE QUESTION PAPER`
  (present in 453 papers; the one booklet without it is read to the end). Periodic tables, data leaflets and
  "sources" pages sit after the END marker and are therefore excluded.

### 2.2 Tariffs (`[n]`)

A tariff is the **last** `[n]` on a line, and what follows it must not be prose. That single rule removes the
three families of false tariffs found in the corpus:

| Artefact | Example (masked) | Handling |
|---|---|---|
| tick glyph from a dingbat font | `Tick [4] the box ...`, `place a tick [3] in the ...` | tail contains a lower-case word, rejected |
| matrix / vector notation | `Q = [71]`, `... [2] and R = [-6] ...` | value cap (`MAX_TARIFF = 12`; the largest genuine tariff is `[11]`), or prose tail |
| overprinted bold glyphs | `[[55]]`, `[[66]]`, `[1]_`, `Answer x == ___` | doubled bracket + doubled digit collapses to `[5]`; trailing `_` ignored |

Tolerated tails: a trailing unit or algebra fragment (`[4]m/s`, `[3] = d`), the 2018/2019 science margin words
(`[3] Examiner Only`, `[1] Marks Remark`), and `[Turn over`.

### 2.3 Question starts

Question numbers are located with a weighted-candidate **longest-chain dynamic programme** rather than a
sequential scan (the previous sequential scan stalled after the first miss and lost the rest of the paper).

Candidate line shapes (all seen in the corpus):

* `12 Toby walks ...` - number at indent 0-4 followed by capitalised text (continuation lines are indented 5+);
* `3      y`, `16   8 11 14 17`, `9` - number followed by an axis label, by the sequence itself, or alone
  (accepted only with structural evidence: page top or a tariff line just above);
* `2A B`, `9P   62° Q` - number glued to a diagram vertex label;
* `Cumulative frequency16 90 pupils ...`, `Value (thousands of £)4 Six ...`, `Force4 (a) ...`, `[ ] 5 (i) ...`,
  `ice-skating3 (a)` - a rotated y-axis title, diagram label or matrix bracket emitted glued in front of the number
  (only at a page top or when a part label follows; prefix at most 4 words and never a part label).

Rejected: numbers followed by a lower-case continuation word (`2 of the pupils`, `4 red.`, `1 hour`), numbered
method steps with a period (`3. Dip the ...`), numeric table rows without structural evidence.

Scores: +3 page top, +2 preceded by a tariff line, +1 preceded by a blank line, +2 capitalised opening
(+1 digit, -1 lower case), +0.3 per word (max 6), -2 for 3+ numbers on the line, -2 for a one-or-two-word
fragment ending in a full stop, -1.5 when the previous line is running text, penalties for prefixes, glued
labels and deep indents. The chain maximises total score minus 3 per skipped number (1 when the front page
gives no count), minus 3 for a question that would contain no tariff, minus 6 per question beyond the stated
count. A tariff printed on the next question's opening line counts for the previous question (see 2.5).

Two fallbacks: (a) **inferred start** - when a number never reached the text layer (printed inside a graphic)
and the gap between its neighbours contains exactly one page top that reads like a question opening (capital
letter, digit, or a first part label `(a)`/`(i)`), that page top is used and the question is flagged
`inferred: true` (9 questions); (b) **numbered list collapse** - when at least half of the located "questions"
hold no tariff (the 2021 Unit 7 written-practical booklets, whose single unnumbered task contains a 10-step
method list) everything collapses into one inferred question.

### 2.4 Parts

Part labels `(a)`, `(b)(i)`, `(ii)` at line start (indent <= 16) open a part; roman numerals nest under the
current letter (`b(ii)`), and `(x)` is only accepted after `(ix)`. The question number (and any glued prefix) is
stripped from the opening line before matching so `1 (a)` is read correctly. A tariff is attributed to the part
that is current on its line. A tariff-only line that sits directly after another tariff line and directly before
a part label belongs to the part that follows (the tariff of a short part heading is emitted one line above the
label because its baseline is slightly higher; 7 occurrences).

A part with `marks: 0` means its tariff is printed jointly with a later part (e.g. `(a)`, `(b)` and `(c)` sharing
one `[3]`), so the question total is right but the split is unknown. Zero-mark parts that merely contain
sub-parts are dropped. 226 of 10,493 parts are zero-mark.

### 2.5 Multi-answer blocks and reconciliation with the stated total

CCEA prints a tariff beside **each** answer line of a multi-answer part and the block is worth the tariff on its
last line: `Cost of A £ ___ [3]` / `Cost of B £ ___ [3]` is one 3-mark part, a tick-box option list repeats
`[3]` on every option line, and `x = ___ [2]` / `y = ___ [5]` is a 5-mark part. But a run of `____ [2]` lines can
equally be separate 2-mark items and repeated `[1]` lines are nearly always separate 1-mark items.

The parser therefore forms "blocks" (consecutive answer-ish tariff lines in the same part, no label between,
equal values within 4 lines or different values within 2), applies a default policy (merge only equal values
>= 2 on adjacent lines, or within 3 lines when the answer lines are labelled), and then - when the front page
states the total - searches the subsets of blocks (up to 2^14) for the one that reconciles the total, preferring
the subset closest to the default policy. The decision is recorded per paper: `tariffStrategy`
(`raw` 338 papers, `default-merge-policy` 101, `merge-policy-adjusted(k)` 15), `mergedBlocks` and
`unmergedBlocks` (question, part, printed tariffs, counted value, whether the default policy agreed).

Also: a tariff on the opening line of question n+1 is given to question n when question n would otherwise
have none (two short questions on one page: the first question's answer line is printed level with the next
question's opening line; 14 papers, each flagged in `warnings` as "tariff [n] on the opening line of Qk+1
credited to Qk").

### 2.6 Labels, command words, flags

* `label`: up to 3 tags from the subject's fixed topic lexicon (biology / chemistry / physics tags for science,
  weighted towards the paper's discipline; FM tags plus maths tags for Further Maths), ranked by number of hits
  and specificity; when fewer than 2 tags match, the first two command words are appended. Always <= 12 words,
  never question wording. 171 questions (3.3%) are `unclassified`.
* `commandWords`: fixed list, capitalised forms only, longest match first (`Show that` before `Show`);
  `Give a reason`, `Make the subject`, `Use your` are normalised.
* `hasDiagram`: keyword (`diagram`, `graph`, `grid`, `axes`, `figure`, `chart`, `map`, `sketch`, `picture`,
  `photograph`, `scale drawing`, `not to scale`, `shown below`) or >= 5 sparse short-token lines (axis labels,
  vertex letters); `diagramStrong`: `not drawn accurately` / `not to scale`; `hasTable`: the word table.
* `qwc`: the in-body wording (`quality of (your) written communication`, `written communication skills`) or the
  front-page statement; all 220 science papers that state a QWC question have it detected on that question.
* `answerUnits`: the unit token between the answer underscores and the tariff, whitelisted.
* `pages`: number of pages the question occupies.

### 2.7 Mark-scheme lexicon

The body of a mark scheme starts at the first page with >= 4 code tokens / tariffs. Codes are counted on body
lines that are not headers: maths `MA|MW|M|A|W|B + digit`, FM the same plus bare `M`, `W`, `MW` in the marks
column, science `[n]` tariff codes. Abbreviations (`ecf`, `QWC`, `dep`, `FT`, `BOD`, `oe`, `SC`, `M0`, `W0`,
...) and the fixed phrase lexicon are counted over the whole document (`count`) and per document
(`markSchemes`); the top 60 phrases per subject are written. Headings are short title-case lines between the
first `General Marking Instructions` / `Introduction` heading and the first question page, kept when they occur
in >= 2 mark schemes; cover-page items are excluded. `totalFromMarkScheme` is the `Total N` line where present.

Note: the science mark schemes in this corpus use `ecf`, `dep` and `QWC`; `AW`, `ora`, `owtte`, `AVP` do not
occur (the lexicon still counts them if they appear in future sessions).

### 2.8 Statistics

`stats.json` gives, per subject and unit (and per tier / paper number / discipline where they differ):
questions per paper (mean / min / max), marks-per-question distribution (histogram), share of marks by tariff
size, tariff counts, parts per question, command-word frequencies, diagram / table share, QWC questions per
paper, page counts, total-match rate; `calculatorComparison` (M5-M8 P1 vs P2 deltas); `qwcPerSciencePaper`;
`sessionSummary`; `perSession` (one row per paper); `failingPapers`.

## 3. Accuracy

### 3.1 Corpus-wide

| Check | Result |
|---|---|
| parsed tariffs equal the stated total | **453 / 454 papers (99.8%)**: maths 164/164, FM 29/29, science 260/261 |
| located questions equal the stated count | **418 / 418 papers** that state a count (36 Unit 7 booklets do not) |
| questions not located | 0; 9 located by the page-top inference (7 maths, 2 Unit 7 2021 collapses) |
| questions with 0 marks | 6 of 5,189 (their tariff sits on a neighbouring question's row; paper totals still reconcile) |
| papers where the merge decision had to deviate from the default policy | 15 (7 maths, 8 FM), each recorded in `mergedBlocks` / `unmergedBlocks` |

Papers whose parsed total does not equal the stated total:

| Paper | Stated | Parsed | Reason |
|---|---|---|---|
| Science 2018-March B1 Higher (feed 10008) | 70 | 66 | the text layer holds 66 marks of tariffs; the mark scheme's question totals show Q4 = 10 (text 7) and Q6 = 9 (text 8): three tariffs are printed inside graphics and are not recoverable from text |

The deviations from the default merge policy that were needed to reconcile totals (all recorded per paper):

* FM Unit 3, Summer 2019 / 2021 / 2022 / 2023: a part with two answer lines printed `[4]` then `[1]`; only the
  `[1]` reconciles the total (and the 2023 mark scheme's Q1 total of 13). Same layout in FM3 2024 / 2026 and FM4
  2026 with `[1]` `[1]` and `[1]` `[3]`.
* FM Unit 2, Summer 2019 Q4(ii): `[5]` / `[6]` on two answer lines, counted 6.
* Maths M8-H-P2 2021 Q6 (`[2]` / `[5]` -> 5), M7-H-P2 & M8-H-P2 2019 (`[3]` / `[5]` -> 5), M4-H January 2019
  Q15 (`[2]` / `[4]` -> 4), M4-H November 2023 Q17(b) (four option lines `[3]` -> 3), M7-H-P2 2021 Q4
  (`[1]` x 3 -> 1), M5-F-P2 2019 (a default merge declined).

### 3.2 Hand check on six papers (Summer 2025)

Method: for each paper the parsed structure (`--debug`) was compared line by line with the `pdftotext -layout`
text: every question number and its page, every visible `[n]` and its value, the part label each tariff sits
under, and the front-page total.

| Paper (feed id) | Questions located / stated | Start pages correct | Tariffs captured (sum = stated) | Parts | Notes |
|---|---|---|---|---|---|
| Maths M4 Higher (66598) | 22 / 22 | 22 / 22 | 34 / 34 (100 = 100) | all correct | - |
| Maths M8 Paper 1 Higher (66614) | 14 / 14 | 14 / 14 | 21 / 21 (50 = 50) | 1 question mis-split | Q8: the three 1-mark answer lines of (a), (b), (c) are printed as a column level with the stem and `(a)` rows, so the split comes out as `-:1, (a):2` instead of (a) 1 / (b) 1 / (c) 1; question total right |
| Maths M8 Paper 2 Higher (66615) | 14 / 14 | 14 / 14 | 17 / 17 (50 = 50) | all correct | Q2 opens as `2A B` (glued vertex label); Q2(c)'s tariff is mid-line (`[3] = d`); Q3's single `[3]` covers (a)-(c), recorded as `a:0 b:0 c:3` |
| Further Maths Unit 1 (66635) | 14 / 14 | 14 / 14 | 34 / 34 (100 = 100) | 33 / 33 labels | Q5 opens as `[ ] 5 (i)` (matrix bracket prefix) |
| Science P1 Higher (66894) | 9 / 9 | 9 / 9 | 21 / 21 (70 = 70) | all correct | Q4(b)'s tariff is emitted on the line above the `(b)` label (rule 2.4); QWC = Q3 |
| Science C2 Higher (66890) | 8 / 8 | 8 / 8 | 40 / 40 (80 = 80) | 40 / 40 labels | QWC = Q3(a) |

Totals: 81 / 81 questions on the correct page, 167 / 167 printed tariffs captured with the printed value,
6 / 6 front-page totals reproduced, 164 / 167 tariffs attached to the right part (the three of M8-P1 Q8).

## 4. Failure modes and limitations

1. **Tariffs inside graphics** are invisible to the text layer (B1-H 2018-March: 4 marks). Detected only via
   the stated total.
2. **Multi-answer blocks** are ambiguous by layout alone (2.5). When the stated total is known the reconciled
   subset is used and recorded; when it is not (Unit 7 booklets without a count are all reconciled anyway) the
   default policy applies. If two blocks could each explain the same difference the one closest to the default
   policy wins; the alternative is not recorded.
3. **Right-aligned answer rows**: when several one-line answers are printed as a column to the right of a short
   question, the tariffs land on the rows of the stem or of the first part (M8-P1 2025 Q8) or on the next
   question's opening line (handled when the previous question would otherwise be empty; 6 questions in the
   corpus still end with 0 marks because their tariff was absorbed by a neighbour with tariffs of its own).
4. **Joint tariffs**: one `[n]` for several parts yields zero-mark parts (226 parts).
5. **Glued prefixes**: a rotated axis title or label containing a digit (e.g. an axis title followed by a tick
   value) is not matched; those questions are recovered by the page-top inference (7 cases, all verified to be
   page tops).
6. **Unit 7 practical booklets**: front pages often say only `Answer all questions`; the parser cannot check the
   count, and the 2021 Biology Booklet A layout (numbered method steps inside one unnumbered task) is handled by
   the list-collapse fallback. Booklet A Chemistry papers genuinely contain two tasks.
7. **Diagram detection** is keyword- and layout-based; drawn figures without axis labels or keywords are missed
   and a question that merely mentions a graph in prose is counted. Treat `diagramShare` as approximate.
8. **Labels** are coarse lexicon tags chosen by keyword hits; they identify, they do not classify against the
   specification (that is a later pipeline stage).
9. **Command words** are matched in capitalised form only, so a command inside a sentence is missed.
10. The maths mark schemes' `AVAILABLE MARKS` column could give per-question totals for a second cross-check, but
    pdftotext scatters the column values (doubled glyphs, values on working lines); it is not used.
11. Very old layouts (2018/2019 science with the `Examiner Only` margin) are handled; a future layout change in
    the tariff or numbering convention would show up first as a drop in `totalMatchRate`.

## 5. Output schemas

`questions-index.json`: `{ $schema, note, coverage, totalMatchRate, questionCountMatchRate, papers: [...] }`.
Paper: `feedId, subject, sessionKey, year, series, unit, tier, paperNumber, calculator, discipline, booklet,
totalMarks, totalMarksStated, totalMarksParsed, totalMatches, tariffStrategy, tariffCount, multiAnswerBlocks,
mergedBlocks[], unmergedBlocks[], questionCount, questionCountStated, calculatorStatement, qwcStated,
formulaSheetPage, pageCount, bodyPages, qwcQuestions[], questions[], warnings[], sourceFile`.
Question: `number, located, inferred, page, pages, marks, parts: [{ part, marks, page }], tariffs[], label,
commandWords[], hasDiagram, diagramStrong, hasTable, qwc, answerUnits[]`.

`mark-scheme-lexicon.json`: `{ $schema, note, subjects: { <subject>: { markSchemes, pages, codes, bareCodes,
tariffCodes, abbreviations, topPhrases: [{ phrase, count, markSchemes }], boilerplateHeadings } },
markSchemes: [{ feedId, subject, sessionKey, unit, tier, paperNumber, discipline, booklet, pageCount,
totalFromMarkScheme }] }`.

`stats.json`: `{ $schema, coverage, totalMatchRate, questionCountMatchRate, failingPapers[], bySubject: {
<subject>: { all, units: { <unit>: summary (+ byTier / byPaperNumber / byDiscipline) } } },
calculatorComparison, qwcPerSciencePaper[], sessionSummary, perSession[] }`.

## 6. Headline figures

| Unit | Papers | Questions / paper | Marks / question (mean, max) | Pages | Share of marks in 1-2 mark tariffs | Diagram share | Top command words |
|---|---|---|---|---|---|---|---|
| Maths M4 (Higher, calculator, 100 marks) | 15 | 22.9 (19-26) | 4.4, 15 | 29.5 | 21% | 31% | Calculate, Find, Solve, Show, Work out |
| Maths M8 (Higher, 50 marks each paper) | 26 | 13.2 (11-16) | 3.8, 11 | 18.3 | 39% | 32% | What, Find, Calculate, Work out, How many |
| - M8 P1 (non-calculator) | 13 | 13.6 | 3.7, 11 | 18.9 | 41% | 23% | What, Find, How many, Work out, Show |
| - M8 P2 (calculator) | 13 | 12.8 | 3.9, 9 | 17.7 | 38% | 41% | Calculate, What, Find, Work out, Draw |
| Further Maths FM1 (100 marks) | 8 | 13.6 (12-15) | 7.3, 17 | 31.0 | 24% | 30% | Find, Hence, Solve, Show that, Sketch |
| Science P1 (Physics Unit 1, 60-70 marks) | 48 | 9.0 (8-10) | 7.2, 14 | 17.4 | 21% | 39% | Calculate, What, State, Complete, Show |
| - P1 Foundation | 24 | 9.0 | 6.6, 12 | 16.8 | 25% | 36% | Calculate, What, Complete, State, Use |
| - P1 Higher | 24 | 9.0 | 7.8, 14 | 18.0 | 19% | 43% | Calculate, What, State, Show, Explain |

Every science P1 paper has exactly one QWC question: a 6-mark question in 35 of the 48 papers, 7-9 marks when
the 6-mark QWC part sits inside a longer question. Calculator paper (P2) minus non-calculator (P1)
for M8: -0.85 questions per paper, +0.25 marks per question, +18 percentage points of questions with a
diagram, -1.2 pages; the tariff-size mix is nearly identical.
