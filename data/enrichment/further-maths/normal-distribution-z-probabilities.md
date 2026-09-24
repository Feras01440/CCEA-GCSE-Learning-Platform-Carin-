# Enrichment dossier — normal-distribution-z-probabilities

**CCEA** GCSE Further Mathematics (2017), **FM3** Unit 3 Statistics, area Normal distribution · statement **FM3-NOR-02** · difficulty 3 · calculator paper
**CCEA statement:** calculate a single probability from the normal distribution using tables and z = (x − μ)/σ, where the mean and standard deviation are given
**CCEA Teacher Guidance:** probabilities will be of the form **P(z > 1)** or **P(z < −0.5)**, but **not P(1 < z < 2)**. Students will only be required to find a **probability from a z-value**, never a z-value from a probability. A good diagram is encouraged.
**Formula sheet:** the **Normal Probability Table** (Unit 3 booklet, page 3). **`z = (x − μ)/σ` is NOT given — memorise it.**
**Prerequisite in our taxonomy:** `normal-distribution-bell-curve`
**Compiled** 20 September 2026 · 30 minutes
**Headline** **No Level 2 qualification reads a normal probability table.** AQA GCSE Statistics 8382 comes closest — E11d standardises data with given means and standard deviations — but its notes say the formulae **will be given in the question**, and the specification states in terms that "other than the results in E11b, no calculations for values or normal probabilities are expected". So the standardising idea has a Level 2 home and the table-reading half does not. Meanwhile CCEA's evidence across five series is a single, beautifully consistent story: candidates can find z and then **do not know when to subtract from 1** (2019, 2023, 2024, 2025). The answer to that is not a rule. It is a shaded sketch, and CCEA's own examiner says so: a good diagram with x and z below the axis "definitely improved the chances of gaining full marks".

---

## 1. Crosswalk

| CCEA | AQA GCSE Statistics 8382 (L2) | AQA 8365 / OCR 6993 / Edexcel 4PM1 | DfE A level | Confidence | Status |
|---|---|---|---|---|---|
| FM3-NOR-02 | **E11d** (Higher) — "use calculated or given means and standard deviation to standardise and interpret data collected in two comparable samples"; notes: **formulae will be given in the question** | **unmatched** | **Section N, Statistical distributions** | high | **partial** |

**The two halves separate cleanly, which is the useful finding.**
- **Standardising** (turning an x into a z, and comparing two differently-scaled quantities) is Level 2 content on 8382, so its free material is correctly pitched — and 8382's *use* of standardising, comparing performance in two samples, is a good context CCEA could set.
- **Reading a probability from a normal table** exists at Level 2 nowhere. The only published treatments are A level section N, which immediately adds the inverse normal, P(a < Z < b) and hypothesis testing — all three excluded by CCEA's Teacher Guidance in terms.

**So the borrowing rule for this topic is: take the standardising from GCSE Statistics, take the table technique from A level, and cut A level's next three moves.**

---

## 2. Teaching angles worth recreating (in our own words)

1. **Sketch, shade, then decide — and the sketch is worth marks.** *CCEA's Teacher Guidance encourages a diagram, and the Summer 2019 report is unusually explicit that a good diagram with the x and z values marked below the axis "definitely improved the chances of gaining full marks".* Make it the method, not a suggestion: draw the bell, mark μ, mark x below the axis with its z below that, shade the region the question asks for, and only then read the table. Every "subtract from 1 or not?" question answers itself once the shading is on the page.

2. **The table gives you the area to the LEFT. Always. Say it once and put it on the figure.** *The universal convention (A level section N; every set of normal tables).* Φ(z) = P(Z < z). So:
   - the shaded region is to the **left** → read the table;
   - the shaded region is to the **right** → `1 − Φ(z)`.
   That is the whole decision, and it is a comparison between the picture and one sentence rather than a rule to recall.

3. **A negative z uses symmetry, and the sketch shows why.** *CCEA Summer 2023 Q5(ii) is exactly this: a z of −1.2, where candidates "forgot to subtract from 1 and left 0.8849"; Summer 2022 records half marks for not handling a negative z.* CCEA's table covers z ≥ 0 only. Because the curve is symmetric, P(Z < −1.2) = P(Z > 1.2) = 1 − Φ(1.2). Teach it by **folding the sketch**: draw the shaded left tail, then draw its mirror image on the right, and note they have the same area. The symmetry argument is reconstructible; a memorised sign rule is not.

4. **Standardising is asking "how many standard deviations from the mean?"** *AQA 8382 E11d's framing, and the reason the formula is worth understanding rather than memorising.* `z = (x − μ)/σ` subtracts to find the distance from the mean, then divides to measure that distance in standard deviations. A z of 2 means "two standard deviations above average" — which connects straight to the 95% band in `normal-distribution-bell-curve` and gives her a sanity check: a z of 2 should give a tail of about 2.5%.

5. **Use the 68–95 figure as a rough-answer check.** *Follows from angle 4 and from 8382 E11b.* Before reading the table, she can say roughly what the answer must be: a right-hand tail beyond z = 1 is about 16%, beyond z = 2 about 2.5%. Summer 2024 records the **wrong area being chosen** (0.0062 given) and Summer 2025 records 0.0808 offered where the complement was wanted — both would have been caught by a rough check.

6. **CCEA's restrictions are generous, and she should know them.** *From the Teacher Guidance.* Only **single tails** — never P(1 < z < 2), which is the standard A level next step and appears in every borrowed example. And only **probability from a z**, never a z from a probability, so the inverse normal and the "find the value exceeded by 5%" question type are both off the table. Saying this out loud stops her practising two things she will never be asked.

7. **A calculator answer needs working behind it.** *CCEA Summer 2025: "calculator normal functions need supporting working."* Modern calculators compute normal probabilities directly. The z-value and the table lookup are the method marks; the number alone is not.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the shaded-tail decision card.** `viewBox` about `0 0 960 420`. This is the topic, and it is one generator with four states.

- The bell curve from `normal-distribution-bell-curve` (same generator, same look), with **μ marked at the peak**.
- **The value x marked on the axis**, with **two labels stacked below it**: the real value (`x = 172 cm`) and, underneath, its standardised value (`z = 1.20`). CCEA's examiner names exactly this layout as what improved candidates' marks.
- **The required region shaded**, with an arrow into the shaded area labelled with the probability statement (`P(X > 172)`).
- **A decision strip along the bottom**, two cells, with the active one boxed:
  `shaded to the LEFT → read Φ(z) straight from the table`
  `shaded to the RIGHT → 1 − Φ(z)`
- **Generator parameters:** `mean`, `sd`, `x`, `tail: "left" | "right"`, `showZ: boolean`, `showDecisionStrip: boolean`, `showTableValue: boolean`. The z and the probability are computed; assert the shaded area matches the stated probability to three decimal places.

**Second figure: the fold, for negative z.** Two curves stacked. The upper one shades the left tail below `z = −1.2`; the lower one shades the right tail above `z = +1.2`; a dashed vertical through both at the mean, and a two-headed arrow between the two shaded regions labelled **same area, by symmetry**. Then one line: `P(Z < −1.2) = 1 − Φ(1.2)`. This figure is the entire fix for the topic's most-repeated error, and there is nothing like it in the free material because no Level 2 qualification sets the question.

**Third, small: the rough-check ruler.** The banded curve from the previous topic, reduced, with three right-hand tails annotated `beyond z = 1: about 16%`, `beyond z = 2: about 2.5%`, `beyond z = 3: about 0.1%`. Printed beside every worked example as a sanity check.

---

## 4. Practical variants — not applicable; the equivalent is table-reading discipline

No practical. What CCEA marks, and what an A level resource will not emphasise:

- **The z-value written down**, to two decimal places, as its own line.
- **The table value quoted** before it is used, so the method is visible even if the subtraction then goes wrong.
- **The sketch**, which CCEA's own guidance and examiner report both reward.
- **Single tails only.** Practising P(a < Z < b) is wasted effort here.
- **Reading the table itself** is a skill: CCEA's table is on page 3 of the Unit 3 booklet, z down the side and the second decimal across the top. Worth one item that is purely "read Φ(1.27) from this extract", because a candidate who has only ever used a calculator will not know the layout.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets this as the **later parts of the normal question** (Q5 in Summer 2019, 2023 and 2024, Q7 in 2022, Q6 in 2025), typically two parts and four or five marks, and the evidence says it is generally **well done** — 70% very well done in 2019, "very well done" in 2025 — with the losses concentrated on the complement.

1. **"Find the probability that a randomly chosen … is greater than x" [3].** Standardise, read, subtract. The staple.
2. **"Find the probability that … is less than x", with x below the mean [3].** The negative-z version. This is the discriminator.
3. **"Find the value of z" [1].** A single mark for the formula, worth setting alone so the formula is drilled independently of the table.
4. **"Standardise both and say which performed better" [3].** Straight from AQA 8382 E11d's two-comparable-samples framing, and a genuinely good CCEA-settable context that no further-maths resource offers.
5. **"About what percentage lies within two standard deviations?" [1].** The bridge back to the previous topic, and the rough check.

**Mark-scheme habit:** the z-value and the table value are separate marks from the final probability, so a correct z followed by a missing complement still scores. Author the scheme that way, and make the feedback say which half was right — Summer 2023's candidates who "left 0.8849" had done most of the work.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Forgetting to subtract from 1 | Shade the region first; the decision strip then reads itself | CCEA S2019, S2023, S2024, S2025 — **four series** |
| A negative z mishandled | Fold the sketch: the left tail below −z has the same area as the right tail above +z | CCEA S2022 Q7 (half marks), S2023 Q5(ii) (left 0.8849) |
| The wrong area chosen | Rough-check against the 68–95 figure before committing | CCEA S2024 Q5 (0.0062), S2025 Q6 (0.0808) |
| `z = (x − μ)/σ` half-remembered | It is not on the formula sheet. Distance from the mean, measured in standard deviations | CCEA S2022: "a few did not know the z formula" |
| Practising P(a < Z < b) | CCEA sets single tails only, and never a z from a probability | CCEA Teacher Guidance |
| Calculator answer with no working | The z and the table value are the method marks | CCEA S2025 |
| No diagram | CCEA's guidance encourages one and the examiner says it raises the mark | CCEA Teacher Guidance; S2019 |

---

## 7. Photographs, videos and simulations

**Photographs: none required.**

**Videos already held** (`further-maths:normal-distribution-z-probabilities`): **N.I. Maths Tutor `0wSN38J2t18`** — a Northern Ireland teacher working to CCEA, which should lead, especially as this is the one FM3 topic with no Level 2 comparison for the table half. TLMaths `x0mr7n1P8OM` is A level and will go straight on to the inverse normal and P(a < Z < b); say so in its `why` line.

**Simulation held:** PhET *Plinko Probability*. It shows the normal shape arising but has no z-axis and no table, so it cannot model this topic's actual skill. Keep it only with a task about the shape, and rely on our own shaded-tail figure for the technique — the figure with a `tail` parameter is effectively the interactive this topic needs, and it is ours.

**Free material, and how to use it:** for the **standardising** half, AQA GCSE Statistics 8382 E11d material (Save My Exams, Physics & Maths Tutor, Bitesize GCSE Statistics) is correctly pitched. For the **table** half, A level section N material is the only source; take the technique and stop before the inverse normal.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **P(a < Z < b)** — the area between two values, excluded by the Teacher Guidance in terms and the very next thing every A level resource does
- **finding a z from a probability**, the inverse normal, and "find the value exceeded by 5% of the population" — excluded in terms
- hypothesis testing, confidence intervals, sampling distributions (A level section N)
- the probability density function; continuity corrections; the normal approximation to the binomial
- **quality-assurance action and warning lines** (AQA 8382 E11c)
- standardising to compare more than two samples, or standardising without the mean and standard deviation being given

**CCEA-specific:**
- `z = (x − μ)/σ` must be **memorised** — AQA 8382 E11d says its formulae will be given in the question
- **reading a probability from the Normal Probability Table**, which no Level 2 qualification requires
- single tails only, and probability-from-z only

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:normal-distribution-z-probabilities` (status `partial`, high confidence — refined on 20 September 2026 from `ccea-only` after reading AQA 8382)
- **AQA GCSE Statistics 8382 specification, E11d** (standardising two comparable samples; formulae given in the question) and **E11b** (the bounding statement that no other normal-probability calculations are expected)
- AQA 8365, OCR 6993, Edexcel 4PM1 specifications — searched: no normal distribution in any of them
- DfE GCE AS and A level subject content for mathematics, **section N Statistical distributions** — the only published source for the table technique, and the source of the three excluded next steps
- `data/spec/further-mathematics.json` → `normal-distribution-z-probabilities`: statement FM3-NOR-02, Teacher Guidance, `onFormulaSheet`, `mustMemorise`, and **five** `examinerEvidence` entries (Summer 2019 Q5, 2022 Q7(i)–(ii), 2023 Q5(ii), 2024 Q5, 2025 Q6)
- `data/links/media-map.json` key `further-maths:normal-distribution-z-probabilities`
