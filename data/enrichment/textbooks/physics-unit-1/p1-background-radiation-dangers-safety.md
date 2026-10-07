# p1-background-radiation-dangers-safety: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy and the P1 deck (`data/decks/science/P1.json`) has 9 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.5.9, 1.5.10, 1.5.11, 1.5.12, 1.5.13 (all Foundation).
**Verdict.** **Thinner** (nothing authored). The book covers every statement, spread over three places: a background-and-safety page (p. 58), a background page with the correction method (p. 60) and a dangers page (pp. 62–63) that explains, radiation by radiation, why alpha is mild outside the body and serious inside. That explanation is better than the specification's bare list. The material repeats itself across the three places and has no worked number for the background correction outside the half-life examples.

---

## 1. Book chapter and pages

Section 1.5: learning outcomes pp. 50–51; a page headed "Dangers of Radiation" that actually covers background sources and safe handling p. 58; "Background Radiation" p. 60 (sources, radon, measuring and subtracting background); "Dangers of Radioactivity" pp. 62–63 (ionisation and cancer; each radiation inside and outside the body; three ways to protect workers; storage). The background correction is worked inside the half-life examples on pp. 60–62 (see `p1-half-life`).

## 2. The book's teaching sequence

1. Most background comes from nature (cosmic rays, rocks and soil, radon), passes along food chains, and is added to by people (medical X-rays, waste, weapons fallout) (p. 58).
2. Traces of radioactive potassium in food and of uranium in rocks, whose decay gives radon gas (p. 58).
3. Usually harmless; a problem only where the background has risen, as near Chernobyl and Fukushima (p. 58).
4. Four handling rules: protective clothing, tongs for distance, short exposure, lead-lined storage (p. 58).
5. Background defined as the radiation detected with no source present, with a list of six sources (p. 60).
6. Radon from the uranium in granite; homes in radon areas ventilated continuously (p. 60).
7. How to measure it: remove the sources, count for a long time, divide to get a rate, subtract it from every reading to get the corrected count rate (p. 60).
8. Why radiation harms: it ionises, knocking electrons from atoms; in body cells this can disrupt DNA and lead to cancer (p. 62).
9. Each radiation in turn: alpha outside the body is stopped by clothing and the outer skin, but inside (inhaled, swallowed, through a cut) it is the most ionising and most harmful; beta penetrates skin and can burn, so it is a hazard inside and out; gamma is the least ionising but the most penetrating, a whole-body hazard (p. 63).
10. Three protections for workers (distance, shielding, time) and locked lead-lined storage (p. 63).

## 3. Explanations and devices worth recreating (our own words)

- **Penetration and ionisation pull in opposite directions** (p. 63). Alpha ionises most but travels least, so outside the body its energy is spent before it reaches living cells; inside, it delivers all of that ionisation to the cells around it. Gamma is the reverse. This one idea explains all three bullets of 1.5.12 and is what CCEA's two-part questions test (Summer 2024 Higher Q2(ii): beta and gamma pass through skin; March 2026 Higher Q3(b): which radiation cannot pass through skin but harms cells if breathed in or swallowed).
- **Why radon needs ventilation, not shielding** (p. 60). Radon is a gas that seeps out of rocks into houses; moving the air out removes it. The March 2026 report (Higher Q3(c)) says most candidates suggested lead or concrete shielding instead; the scheme wanted good ventilation (`docs/sources/papers/science/2026-March/P1-H-Physics-MS-68446.txt`).
- **Measure background over a long time** (p. 60). Counting for many minutes and dividing gives a steadier rate, because decay is random. A nice link to `p1-radioactive-decay`.
- **Specific, not vague, safety measures** (pp. 58, 63). Tongs or remote handling for distance, lead for shielding, working quickly for time. The March 2026 report says "a safe distance" earned nothing; the Summer 2024 and 2025 reports say two shielding answers count once.

## 4. Diagrams and photographs

None for this topic. Our note should have a pie or bar chart of background sources (natural largest; medical the largest human source), with invented but realistic proportions, and a figure of a body with each radiation shown outside (alpha stopped at the skin) and inside (alpha among cells).

## 5. Worked examples, calculations and data tasks

No stand-alone example here. The corrected count rate (measured minus background) is worked inside the half-life examples (pp. 60–62): one starts from a total count and a background rate, subtracts, halves the corrected value, and adds the background back for the final total.

## 6. Practice question types, with CCEA evidence

- **What is ionisation?** and **why is it dangerous to living cells?** (3; Summer 2024 Higher Q2(i): a gating mark for electrons, one for their being gained or lost, and an independent third for harm to DNA or cells, or cancer; the Foundation report says most did not know what ionisation meant).
- **Which radiations pass through skin?** (2; Summer 2024 Higher Q2(ii): beta and gamma). **Which harms only if inhaled or swallowed?** (alpha; March 2026 Higher Q3(b)).
- **Reduce the risk** (2–4; Summer 2024 Higher Q2(iii): time, distance, shielding, lead-lined storage; Summer 2025 Higher Q2(b); March 2026 Higher Q3(d): any two of shielding, distance, time).
- **Radon at home** (1; March 2026 Higher Q3(c): ventilation).
- **Background**: define, name sources, correct a reading (in six-mark accounts: 2022 March Higher Q1 credits naming background and subtracting it; 2022 November Higher Q1(a), six marks by bands, credits six points: an electron, lost or gained, cell or DNA damage or cancer, background as what is measured with every source taken away, one human source (medical X-rays, waste or weapons fallout), and radon: `docs/sources/papers/science/2022-November/P1-H-Physics-MS-24185.txt`).

## 7. Definitions and wording

- **Background activity** (p. 60): detected with no radioactive sources present; matches 1.5.9 and the glossary (measured when all known sources have been removed).
- **Ionisation** (p. 62): atoms losing an electron to become ions; the 2024 scheme accepts gained or lost. The specification's 1.5.11 chain (ionisation, genetic material damaged, cell may become cancerous) is the answer to learn.
- **Protective clothing** (p. 58) is the specification's first handling step; the book's p. 63 list replaces it with shielding and lead-lined suits. Teach the specification's four, then the distance–time–shielding trio CCEA's schemes credit.
- **Gamma "not stopped" by lead** (p. 63): see `p1-radioactive-decay`; the specification says lead blocks it.

## 8. Higher-tier-only content in the book

None (all Foundation).

## 9. Pitfalls and "remember" notes in the book

- Subtract background from every reading before using the counts (p. 60).
- Alpha is dangerous inside the body, not outside (p. 63).
- Radon is dealt with by ventilation (p. 60).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **Ionisation and why it harms cells**, as the specification's three-link chain; a non-example that omits the electron.
2. **Each radiation outside and inside the body**, explained by the penetration–ionisation trade-off; a two-part Your turn on the 2024 and 2026 pattern.
3. **Safe handling**: the specification's four steps and the time–distance–shielding trio, with "a safe distance" and "two kinds of shielding" as non-examples.
4. **Background**: sources natural and human, radon and ventilation, and the correction (measured minus background) on our own numbers.
5. **Link** to `p1-half-life` (correct before halving) and `p1-uses-of-radioactivity` (why the radiation and half-life are chosen).

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. The 9 deck cards agree with the book, the specification and the schemes.
