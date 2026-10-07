# p1-half-life: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy and the P1 deck (`data/decks/science/P1.json`) has 9 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.5.14 (Foundation).
**Verdict.** **Thinner** (nothing authored). The book's calculations are its strength: a halving table laid out as half-lives, time and activity, which is how CCEA's schemes award marks; a problem worked backwards in time; a total count corrected for background, halved, then given back as a total; and a carbon-dating ratio. It draws a decay curve but never reads a half-life off it, though the specification asks for it (1.5.14) and CCEA set it in Summer 2023, and it never uses mass or a fraction remaining, both of which CCEA has set.

---

## 1. Book chapter and pages

Section 1.5: learning outcomes p. 51; the decay-rate and half-life pages pp. 58–59 (why activity falls, a halving illustration, the definition, a table of half-lives, a decay curve); background and its correction p. 60; four worked examples pp. 60–62; Test Yourself 1.5.2 p. 62. Answers p. 72.

## 2. The book's teaching sequence

1. Activity falls because fewer undecayed nuclei remain to decay (p. 58).
2. An illustration: a sample with a two-hour half-life, halving every two hours from 1800 counts per minute (p. 58).
3. Definition: the time for the activity to fall to half; equivalently, the time for the count of undecayed nuclei to halve (p. 59).
4. Every isotope has its own constant half-life, from fractions of a second to billions of years, with a table of five examples (p. 59).
5. A decay curve for the illustration (p. 59).
6. Background and the corrected count rate (p. 60).
7. Worked examples: a hospital isotope's half-life from two readings, then its activity at an earlier time; a carbon-14 activity after four half-lives; a number of nuclei after six half-lives; a total count with background (pp. 60–62).
8. Self-test: a time from a fall in count rate, a half-life from a fall over a day, the age of a wooden spear (p. 62).

## 3. Explanations and devices worth recreating (our own words)

- **The halving table** (pp. 61–62). Three columns (number of half-lives, time, activity) make the count of halvings visible and stop the commonest slip (counting the readings instead of the halvings). CCEA's schemes give marks for the halving chain itself: Summer 2023 Higher Q9(b) one mark for one halving, two for halving to the target "and no further", then the time (`docs/sources/papers/science/2023-Summer/P1-H-Physics-MS-29631.txt`); 2025 November Higher Q4(b) the same pattern.
- **Correct, halve, then add back** (pp. 61–62). With a background of a few counts per minute, the corrected count halves; the total after some half-lives is the halved corrected count plus the background. This is the specification's 1.5.9 and 1.5.14 joined, and the book is the only source we hold that works it fully.
- **Going back in time** (p. 60). Doubling for each half-life before a known reading. A twist that tests understanding rather than routine.
- **Dating by ratio** (p. 62). An old sample's activity compared with a fresh one's: the number of halvings between them, times the half-life, gives the age.
- **Why the activity falls** (p. 58). Fewer undecayed nuclei, so fewer decays each second. One sentence that makes the curve's shape inevitable.

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Recreation note for our first figures |
|---|---|---|---|
| Table of half-lives (p. 59) | Five isotopes from billions of years to a fraction of a second. | Scale. | Optional; if used, check each value and keep carbon-14 consistent (section 7). |
| Decay curve (p. 59) | Corrected activity against time over five half-lives, a smooth curve from 1800 counts per minute. | Shape. | Recreate with our own numbers **and** draw the reading lines (start value, half value across to the curve, down to the time; then half again to show the same interval). The book never does this. |

## 5. Worked examples, calculations and data tasks

- **Hospital isotope** (p. 60): four halvings between two readings over a stated time give the half-life; doubling backwards gives an earlier activity.
- **Carbon-14 activity** (p. 61): four half-lives in a table.
- **Number of nuclei** (p. 61): a power of two halved six times.
- **Total count with background** (pp. 61–62): subtract, halve four times, add back.
- **Test Yourself** (p. 62): four halvings to a stated count rate; three halvings in a day; two halvings for a spear's age.

## 6. Practice question types, with CCEA evidence

- **Define** half-life (2; Summer 2024 Higher Q7(c): the first mark, which gates the second, is for a time; the second is for naming the quantity that halves, which may be the activity, the count rate, or the number or mass of nuclei not yet decayed; the Summer 2025 Higher report says many lost the second mark by not saying what halves).
- **Read** a half-life from a graph, then use it (4; Summer 2023 Higher Q9(b): 2 days from the graph, then three halvings of the given number of undecayed nuclei, 6 days).
- **Calculate** a half-life from a start and end value (3; 2025 November Higher Q4(b): 1800 Bq to 225 Bq in 6 hours, 2 hours; Summer 2024 Higher Q7(d): a 16 g sample to 1 g in 10.4 years, 2.6 years, where the report says some counted five halvings instead of four).
- **Fraction remaining** (2019 November Higher Q2(b): 120, 60, 30, 15, so one eighth).
- **Correct for background** before halving (in six-mark accounts and data items; see `p1-background-radiation-dangers-safety`).

## 7. Definitions and wording, and book inconsistencies

- **Half-life** (p. 59): the book's two versions (activity; number of radioactive nuclei) match the glossary (count rate) and the 2024 scheme (Q7(c), which accepts activity, count rate, or how many nuclei, or what mass of them, remain undecayed). Teach "the time taken for the activity (or count rate) to fall to half", always naming what halves.
- **Book inconsistency: carbon-14** is given three half-lives in five pages: 5730 years in the table (p. 59), 5600 in a worked example (p. 61) and 5700 in the self-test (p. 62). Each example is internally consistent, but a reader comparing them is misled. Our items should state the half-life each time and not suggest a "true" value is needed.
- **Becquerel against counts per second** (p. 61): the book writes Bq as counts per second. A becquerel is one decay per second; a detector counts only some of them. Not examined, but avoid the equation of the two.
- **Mass halving**: the book never halves a mass, although CCEA's scheme accepts mass of undecayed nuclei and set a mass problem in 2024.

## 8. Higher-tier-only content in the book

None (Foundation). Back-in-time and background-plus-halving problems are a fair Higher stretch.

## 9. Pitfalls and "remember" notes in the book

- It is the corrected count rate that halves (p. 61).
- Count the halvings, not the numbers in the chain (pp. 61–62 tables).
- Turn every time into the same unit before dividing (p. 61, seconds and minutes).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **The definition with what halves**, and a non-example missing it (cite the 2025 report).
2. **Reading a half-life from a graph**: the reading lines drawn, a check on a second halving, and a Your turn that then uses the half-life (the 2023 shape).
3. **The halving chain**: start, halve, count the halvings, multiply by the half-life; forwards (time for a fall) and backwards (half-life from a fall); a mass version and a fraction-remaining version.
4. **Background correction inside half-life**: subtract, halve, add back if a total is asked.
5. **Ratio dating** and **going back in time** as Higher-flavoured twins.

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. The 9 deck cards agree with the book's method, the glossary and the schemes.
