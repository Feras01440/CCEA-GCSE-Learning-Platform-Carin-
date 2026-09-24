# Enrichment dossier — binomial-probabilities

**CCEA** GCSE Further Mathematics (2017), **FM3** Unit 3 Statistics, area Binomial distribution · statement **FM3-BIN-02** · difficulty 3 · calculator paper
**CCEA statement:** understand and use the binomial expansion to calculate probabilities in real-life contexts
**CCEA Teacher Guidance:** **the full derivation of binomial probabilities is required** — coefficients from Pascal's triangle, powers of p and q shown
**Formula sheet:** nothing
**Prerequisites in our taxonomy:** `pascals-triangle-binomial-expansion`, `tree-diagrams-probability`
**Compiled** 20 September 2026 · 30 minutes
**Headline** CCEA is **substantially more demanding than the only Level 2 comparison**. AQA GCSE Statistics 8382 E10b carries the binomial distribution at Higher tier, but only to "know and interpret the characteristics", with **n no greater than 5** and **no probability calculations at all**. CCEA wants the full derivation to n = 8 with real numbers. Meanwhile five consecutive series name the same two failures: **p and q swapped** (2019: 0.2 for 0.8; 2022: 0.3 for 0.7) and **"at least" mishandled** — and Summer 2023 pins the mechanism precisely: *"omission of brackets in 1 − (P(0) + P(1)) caused many problems"*. Build the lesson on a p/q labelling ritual and on brackets.

---

## 1. Crosswalk

| CCEA | AQA GCSE Statistics 8382 (L2) | OCR 6993 (L3) | AQA 8365 / Edexcel 4PM1 | Confidence | Status |
|---|---|---|---|---|---|
| FM3-BIN-02 | **E10b** (Higher) — "know and interpret the characteristics of a binomial distribution"; notes: a fixed number of trials, constant probability of success, symmetry of probabilities. **n no greater than 5. X ~ B(n, p) notation will not be used** | ***Enumeration*** — reaches the binomial distribution and probability calculations at **Level 3** | **unmatched** — 8365 §2.7 expands algebraically but never interprets probabilistically; 4PM1 §6 is the binomial *series*, not the distribution | high | **partial** |

**The two scope deltas run in opposite directions, which is the useful part.**
- **8382 stops short**: it interprets but does not calculate, and caps n at 5. So GCSE Statistics resources are good for the *characteristics* (what makes a situation binomial) and useless for the arithmetic.
- **OCR 6993 goes past**: it calculates, but at Level 3 and with ⁿCᵣ and combinations. So its worked examples are the right shape and the wrong notation.

CCEA sits between them, and the right harvest is: **conditions from 8382, contexts from OCR, notation from neither.**

---

## 2. Teaching angles worth recreating (in our own words)

1. **Label p and q before touching anything, in the question's own words.** *CCEA records the swap in two separate series (2019: 0.2 and 0.8 mixed up; 2022: 0.3 and 0.7 mixed up), which makes it the topic's defining error.* Make it a written ritual: `success = [the thing the question is counting], p = …, q = 1 − p = …, n = …`. Three short lines before any expansion. The swap happens because the question usually *states* the probability of the thing you are **not** counting ("5% of components are faulty… find the probability that at least 2 are acceptable"), so the ritual has to name the success explicitly.

2. **Check the four conditions — borrowed straight from GCSE Statistics.** *AQA 8382 E10b's notes are exactly this: a fixed number of trials, a constant probability of success, and the symmetry of probabilities.* Before computing, ask: is n fixed, are the trials independent, is p constant, are there two outcomes? This is the one thing 8382 does better than any further-maths resource, because interpretation is all it asks for. It also answers the question a good learner will ask — *how do I know this is binomial?*

3. **"At least" is a complement, and the complement needs brackets.** *CCEA Summer 2023 names the bracket omission as the mechanism; Summer 2019 prefers the form `1 − {P(0) + P(1)}`; Summer 2025 records candidates "summing many probabilities instead of 1 − P(0) − P(1)".* Teach the translation table (angle 4) and then teach the layout: write the bracket **first**, fill it, then subtract. Writing `1 − P(0) + P(1)` is not a thinking error, it is a punctuation error, and it costs the whole part.

4. **A translation table for the words, because the words are the question.** *A device common to every good probability treatment.* Build it once and reuse it in every item:

   | the question says | you want | fastest route |
   |---|---|---|
   | exactly r | the single term | one term of the expansion |
   | at least r | r, r+1, … n | `1 − (terms below r)` |
   | at most r | 0, 1, … r | sum the terms up to r |
   | fewer than r | 0 … r−1 | sum, or `1 −` the rest |
   | more than r | r+1 … n | `1 − (terms up to r)` |

   The "fastest route" column matters: Summer 2025 shows candidates summing six terms where subtracting two was available.

5. **Show the derivation — CCEA says so in terms, and the calculator will not do it for you.** *The Teacher Guidance requires coefficients from Pascal's triangle and the powers shown; Summer 2025 adds that "calculator statistical functions must be backed by working".* So the method line is `coefficient × p^(n−r) × q^r`, written out, then evaluated. A bare correct number from a calculator's binomial function earns little. This is a genuine CCEA-specific instruction and no borrowed resource will mention it.

6. **Do not over-complicate a simple term.** *CCEA Summer 2024: "simple p³ over-complicated".* If the question asks for all three successes out of three, the answer is p³ — coefficient 1, no q. Worth one deliberate item, because the ritual can make candidates look for machinery that is not needed.

7. **Round once, at the end.** *Summer 2019: "early rounding lost the final mark"; Summer 2024: "0.03 truncated".* Keep full calculator accuracy through the sum and round only the final answer. State the accuracy the question asks for.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the labelled expansion ladder.** `viewBox` about `0 0 1000 460`. This is the term strip from `pascals-triangle-binomial-expansion`, now carrying numbers and meaning.

- One row per term of (p + q)ⁿ. Four columns: **number of successes r**, **the term** (`coefficient × p^(n−r) q^r` written symbolically), **the value** (computed), and **what it means in the context** (a short phrase such as "exactly 2 faulty").
- **A total row** at the foot showing the values summing to `1.000`, with a caption *every outcome is somewhere in this list*.
- **A shading band** down the left that can cover any contiguous set of rows, so the same figure can show "exactly 2", "at least 2" and "at most 1" by shading different rows.
- **A side panel** showing the two routes for the shaded set: the direct sum, and `1 − (the unshaded rows)`, with the shorter one boxed. This is the figure that teaches angle 4.
- **Generator parameters:** `n`, `p`, `successLabel`, `shade: [from, to]`, `showBothRoutes: boolean`, `decimals`. All coefficients from the computed triangle, all values computed; assert the column sums to 1 within tolerance.

**Second figure: the p/q label card.** A small box with four filled lines — *success = …*, *p = …*, *q = 1 − p = …*, *n = …* — drawn as a form to complete. Used as the first gate of every worked example and as a blank in the faded versions. It looks too simple to draw and it is aimed at the most-repeated error in the topic.

**Third, small: the bracket card.** Two lines side by side: `1 − (P(0) + P(1))` with the bracket highlighted, and `1 − P(0) + P(1)` struck through, with both evaluated so the difference is a number. Summer 2023's finding, made concrete.

---

## 4. Practical variants — not applicable; the equivalent is working discipline

No practical. What CCEA marks:

- **The derivation is the method mark.** Coefficient and powers visible; a calculator answer alone is not enough (Summer 2025 says so).
- **Brackets around a summed complement.**
- **Full accuracy until the final rounding**, then round as instructed.
- **Contexts**: CCEA's own guidance uses coin tosses; its papers use faulty components, germinating seeds, and survey responses. OCR 6993's *Enumeration* contexts are the best external source for realistic scenarios — take the situation, rewrite the numbers, and drop the ⁿCᵣ.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets this as the **later parts of Q4**, the binomial question, in every series we hold (2019, 2022, 2023, 2024, 2025), following `pascals-triangle-binomial-expansion` in the earlier parts.

1. **"Find the probability of exactly r successes" [2].** One term. Marks for the term and the value.
2. **"Find the probability of at least r successes" [3].** The complement, with brackets. The discriminator — Summer 2019 records fewer than half gaining full marks.
3. **"Find the probability that all / none …" [1–2].** The simple case, deliberately, so the machinery is not over-applied.
4. **"Explain why the binomial distribution is a suitable model here" [2].** Straight from AQA 8382 E10b's territory — fixed n, constant p, independent trials, two outcomes. CCEA rewards it and no further-maths resource sets it.
5. **A two-context comparison [4].** Same n, different p; which is more likely. This is where 8382's "symmetry of probabilities" idea pays off.

**Mark-scheme habit:** the term structure is credited separately from the arithmetic, so a correctly-formed `21 × 0.4² × 0.6⁵` with a slip in the evaluation still earns the method mark. Author it that way and say so in the feedback.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| p and q swapped | The label card, filled in words before any arithmetic. The question usually states the probability of the thing you are *not* counting | CCEA S2019 Q4(b), S2022 Q4(iii)–(iv) — **two series** |
| "At least" misread | The translation table, with the complement route named | CCEA S2019, S2022, S2024 — **three series** |
| `1 − P(0) + P(1)` | Write the bracket first, then fill it | CCEA S2023 Q4(iv), named as the mechanism |
| Summing many terms when two would do | The side panel shows both routes and boxes the shorter | CCEA S2025 Q4(iv) |
| Coefficient omitted | The term is coefficient × power × power; the coefficient column in the figure is never blank in a model answer | CCEA S2022 Q4(iv), S2023 Q4(iv) |
| A simple case over-complicated | All three successes is just p³ | CCEA S2024 Q4(iii)–(v) |
| Early rounding, or truncating | Full accuracy to the end; round once, as instructed | CCEA S2019, S2024 ("0.03 truncated") |
| Calculator binomial function used bare | The derivation is the method mark | CCEA S2025, explicitly |

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.**

**Videos already held** (`further-maths:binomial-probabilities`): **P McAleavey `9Y4bhtNSW8w`** (CCEA Further Mathematics by name — leads; it is the same video as the expansion topic, so the two entries should carry different `start` windows or different `why` lines) and TLMaths `_wGvyhEFYoQ`, which is A level and will use ⁿCᵣ.

**Simulation already held, and it fits:** **PhET *Plinko Probability***. Set the probability away from 0.5 and the distribution skews exactly as the terms of (p + q)ⁿ do. Task worth authoring: set n and p to match a worked example, predict which bin corresponds to "exactly 2 successes", run enough balls to see the shape, then compare the observed relative frequency with the computed probability. That is theoretical-versus-experimental probability made physical, and it also previews the normal shape for the next two topics.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **ⁿCᵣ, factorials, permutations and combinations** (OCR 6993 *Enumeration*)
- **X ~ B(n, p) notation**, and calculator binomial functions used as the method
- **mean and variance of a binomial distribution** (np, npq) — A level
- the normal approximation to the binomial
- cumulative binomial tables
- **n > 8**

**CCEA-specific:**
- **the full derivation is required** — coefficients from Pascal's triangle with powers shown — which is an instruction, not a preference
- n up to 8, where the only Level 2 comparison (AQA 8382 E10b) caps at 5 and asks for no calculation at all

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:binomial-probabilities` (status `partial`, high confidence)
- **AQA GCSE Statistics 8382 specification, E10b** (Higher) — the binomial conditions, the n ≤ 5 cap and the no-notation rule; the closest Level 2 comparison for FM3
- OCR Level 3 FSMQ Additional Mathematics 6993 specification, ***Enumeration*** section
- AQA 8365 §2.7 and Edexcel 4PM1 §6 — checked and found to be algebraic expansion only, not the distribution
- `data/spec/further-mathematics.json` → `binomial-probabilities`: statement FM3-BIN-02, Teacher Guidance, `mustMemorise`, and **five** `examinerEvidence` entries (Summer 2019 Q4(b), 2022 Q4(iii)–(iv), 2023 Q4(iv), 2024 Q4(iii)–(v), 2025 Q4(iv))
- `data/links/media-map.json` key `further-maths:binomial-probabilities`
