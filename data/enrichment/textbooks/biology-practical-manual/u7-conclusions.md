# u7-conclusions: Practical Manual dossier (conclusions and evaluation, across the biology practicals)

**Book.** CCEA's GCSE Double Award Science Biology Practical Manual (an eGuide), © CCEA 2024, 34 printed pages (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 2.
**Ours.** **No note or bundle exists yet** (`packs/science/content/u7/` holds planning, carrying-out and analysing only; the slug `u7-conclusions` is in `data/spec/double-award-science-topics.json`, with B5 and B6 among the practicals it lists). This dossier is written for its author: what the book contributes, what CCEA's schemes credit, and a biology spine for the lesson.
**Spec.** Unit 7, Drawing conclusions from an experiment (our skill ids U7.4.1–U7.4.9): evidence-based conclusions; analysing and evaluating data; deductions from observations; calculations "of ... any other appropriate quantity"; direct proportion (a straight line through the origin); inverse proportion (y against 1/x); what affects reliability; developing and defending a hypothesis; arguments that take account of the limits of the evidence.
**Scheme evidence.** CCEA U7 Biology, both booklets, 2019 and 2021–2025 (`docs/sources/papers/science/<series>/U7-*-Biology-*`); 2026 Higher Booklet B Q3 (paper only); the general and Unit 7 comments in the Chief Examiner's reports 2024 and 2025 (`docs/sources/science/examiner-reports/`).
**Verdict.** The book is **richer** than our (absent) note, but only as a bank of contexts: about twenty of its questions ask her to describe, explain, deduce or evaluate, and not one is answered or modelled. It never teaches how a conclusion is built. Everything about how to write one comes from CCEA's schemes and reports, cited below.

---

## 1. Where in the book

Conclusion and evaluation questions: p. 5 (explain the covered region), p. 7 (explain the white region), pp. 10–11 (accuracy, reliability, five predicted effects, percentage of the stated value), p. 14 (explain the froth), p. 17 (trend; two reasons from the table), p. 21 (describe, name, read, describe, explain), pp. 24–25 (describe and explain two bags), p. 27 (trend; explanation), p. 30 (describe and explain two conditions), p. 33 (describe and explain two rooms).

## 2. What the book asks, sorted by skill (our words)

| Skill | Book questions (page) | What a full answer needs, from CCEA's schemes |
|---|---|---|
| Describe a trend | Daisies along the transect (p. 17); loss in mass as leaf area increases (p. 27). | The direction, and every change of direction: a rise followed by a plateau for the daisies (2021 Booklet B Q1(b)(i), 1 mark); loss in mass rising with leaf area (2022 Higher Booklet A Q1(f), 1 mark). |
| Explain from the data | Two reasons for the transect trend, taken from the table (p. 17). | Only factors that change with the count, each with its direction (2021 Q1(b)(ii); in the 2024 report, "pH" without its direction, "lower pH inland", was not credited). |
| Describe **and** explain | Visking bags 1 and 2 (pp. 24–25); wind against still air (p. 30); warm against cool (p. 33); 0.8 M potato (p. 21). | Two halves, marked separately: what happened, with figures; why, with the mechanism (CCEA prints "Description" and "Explanation" as separate lines, for example 2021 Booklet B Q1(c)(ii) and 2024 Foundation Booklet B Q2(d)(ii)). |
| Deduce from observations | Covered region and white region (pp. 5, 7); the term for cells that gained water (p. 21). | Colour → starch or none → photosynthesis or none → the factor (2022 Booklet B six-marker). |
| Calculate | Energy per gram; percentage of the stated value (pp. 10–11); percentage change (p. 19); rates per hour (pp. 30, 32). | Working shown; answer to the precision asked; units. |
| Evaluate the method | Stirring and accuracy; repeats and reliability; how five changes would alter the result (pp. 10–11). | Accuracy and reliability kept apart (2023 Foundation Booklet A Q1(f)–(g)); the five-row effects table (2023 Higher Q1(f)). |
| Limits of the evidence | Implicit only: the measured value is a fraction of the stated one (p. 11). | Why: energy lost to the air and glass, incomplete burning (2026 Higher Booklet B Q2 asks for two reasons). |

## 3. What the book offers that a conclusions lesson needs

- **Real biology contexts for every conclusion skill**, each one a CCEA Booklet A or B task: the transect (2021), the washing line (2022), the food burn (2023), the potato cylinders (2025), the catalase froth (2021). A conclusions lesson built on these teaches her on the tasks she will sit.
- **The predicted-effects table** (p. 11): reasoning about a method's sensitivity without new data, which is the evaluation skill U7.4.7 names.
- **"Expected results" stated before the method** (six investigations): a prediction she can test her data against, the first half of developing and defending a hypothesis (U7.4.8).

## 4. Where the book is worse, and what it leaves out

- **No model answers and no method for writing one.** "Describe and explain" is the command four times (pp. 24, 25, 30, 33) with no hint that the two halves are marked apart.
- **Its introductions would not score as explanations**: the osmosis introduction never names a selectively permeable membrane (p. 18), and the transpiration introductions never say "diffusion gradient", the phrase CCEA's 2021 and 2024 schemes use.
- **No "cannot tell".** CCEA's 2026 Higher Booklet B Q3(b) gives statements about a protease experiment to sort as true, false or **cannot tell** (one statement predicts a time at 70 °C, beyond the highest temperature tested). Reading only as far as the data reach is a conclusions skill the book never meets.
- **No comparison language.** The 2024 and 2025 reports both say a comparison of three sets needs the superlative: in the 2025 antibiotic question, the largest clear zone and the most bacteria killed, rather than a large zone.
- **No proportionality, direct or inverse.** Biology rarely needs it; our b1 food note's straight line through the origin (mass of food against rise) is the one biology example we have.
- **No anomalies, no sources of error.** CCEA's 2021 Higher Booklet A Q1(h) credits sources of error in the froth method (froth hard to read; uneven stirring; bath temperature dropping; timing; tubes of different sizes).

## 5. Diagrams and photographs

The Visking photographs (p. 24, described in `pp-b5-osmosis.md`) are the book's only "evidence" picture: she deduces direction of water from the bags' shapes. Draw our own.

## 6. Calculations and data tasks

Computed in `scratchpad/probes/dossier-biology-practical/numbers.mjs` and re-run: the book's percentage of the stated value, 2940 ÷ 12 800 × 100 = 22.97, so 23 %; CCEA 2023, 230.7 ÷ 330.6 × 100 = 69.78, so 70 %; CCEA 2026 Higher Booklet B Q3(a)(ii), a time falling from 11 to 4 minutes is a decrease of 7 ÷ 11 × 100 = 63.6 % (a second route: 700 ÷ 11 = 63.64). CCEA asks for a percentage **decrease** here, so the divisor is the first value, as in percentage change.

## 7. The book's questions, and what CCEA's schemes credit

The matching scheme lines are tabulated in each practical dossier (section 7 of `pp-b1` to `pp-b6`). Three scheme patterns recur and should be the lesson's rules:

1. **Describe, then explain, then the figures.** "Use data" means numbers from the table in the answer (2024 Higher Booklet B Q4(d): the factor with the greater effect, then the two changes in mm that show it).
2. **Support or reject a prediction with paired data.** 2021 Higher Booklet A Q2(a): a student predicts animal tissues hold more catalase than plant tissues; two marks for the trend and for any two figures comparing an animal tissue with a plant tissue.
3. **Improve a result by naming the change.** 2021 Higher Booklet B Q4(c)(ii): a more accurate value for where uptake levels off comes from more readings at smaller intervals in that range; 2021 Foundation Booklet A Q1(i)(ii): repeat at more temperatures.

## 8. Definitions and wording

- **Trend**: the overall direction of the data, with each change of direction named.
- **Conclusion**: what the data show about the relationship between the independent and dependent variables, supported by figures.
- **Evaluation**: how far the method and data can be trusted, and what would improve them.
- **Book slip relevant here:** the osmosis Question 3 asks for a percentage where the axis is in M (p. 21); a conclusion takes its unit from the axis.

## 9. Higher-tier-only content

None in the book. CCEA has put the evaluative extensions on Higher papers (2021 Q2 prediction with paired data; 2023 percentage of the stated value; 2025 two-tissue comparison; 2026 true, false or cannot tell).

## 10. Pitfalls the schemes and reports name

- Listing: a right answer beside a wrong one scores nothing (2025 report and schemes).
- Comparatives for three or more sets: biggest, most, lowest (2024, 2025 reports).
- A factor without its direction earns nothing (2024 report).
- Percentage lost given where the percentage heated was asked (2023 report).
- Collision theory offered where the question wanted only a reading of the table (2023 Chemistry Booklet A report; the same trap exists in biology "describe" parts).

## 11. A biology spine for the u7-conclusions lesson (all gaps, since no note exists)

1. **Trend, in two features**: the transect (rises then levels off); a Your turn on the washing line.
2. **Reasons taken from the table**: the transect with a flat pH column as the distractor; directions stated.
3. **Describe and explain, marked apart**: the Visking bags (lose, no change, gain; water moves from the weaker solution to the stronger through the membrane); twin on the potometer with and without wind (diffusion gradient).
4. **Deduction from observations**: the starch test, colour to conclusion, with both regions named.
5. **Defend or reject a prediction with paired data**: the 2021 catalase-tissues shape on our own numbers.
6. **Evaluate**: the five-row effects table (food), accuracy against reliability, sources of error in froth.
7. **Only as far as the data go**: true, false or cannot tell (the 2026 shape) on an enzyme time table.
8. **Proportion**: the food mass against rise line (direct), with physics and chemistry examples for inverse, since biology has none.

## 12. Anything in our notes the book suggests is wrong or misleading

Not applicable (no note). One caution for the author: the book's catalase Question 3 at 30 °C needs a collisions answer, not the denaturation answer of CCEA's 2021 scheme at 50 °C (see `pp-b3-temperature-enzyme.md`, section 7).
