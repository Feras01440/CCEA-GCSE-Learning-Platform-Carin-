# Enrichment dossier — pascals-triangle-binomial-expansion

**CCEA** GCSE Further Mathematics (2017), **FM3** Unit 3 Statistics, area Binomial distribution · statement **FM3-BIN-01** · **difficulty 1 — the most accessible topic in FM3** · calculator paper
**CCEA statement:** use Pascal's triangle to expand (p + q)ⁿ where **n ≤ 8**
**CCEA Teacher Guidance:** the worked context is a probability one — a coin tossed 7 times with P(head) = 0.4, then "1 or 2 heads" and "at least 2 heads"
**Formula sheet:** **nothing.** The rows of Pascal's triangle must be reproduced from scratch.
**Prerequisites in our taxonomy:** `maths:expanding-double-brackets`, `maths:laws-of-indices`
**Compiled** 20 September 2026 · 25 minutes
**Headline** This is the **one FM3 topic with a genuinely good comparison** — OCR 6993's *Enumeration* section, Edexcel 4PM1 §6 (the binomial series) and AQA 8365 §2.7 all expand (a + b)ⁿ — and it is also the topic CCEA's candidates find easiest: "almost everyone completed Pascal's triangle" (Summer 2022), "almost all completed the triangle and used it effectively" (Summer 2025). The marks that are lost are procedural, not conceptual, and Summer 2019 names all three: **the triangle was not written out** (a mark in itself), **the wrong power was used**, and **the plus signs were omitted**. Teach it as a reliable four marks, and protect those four with layout rules.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | Confidence | Status |
|---|---|---|---|---|---|
| FM3-BIN-01 | **§2.7** "Expand (a + b)ⁿ for positive integer n", with the worked example "Expand and simplify (5x + 2)³" | ***Enumeration*** — binomial, product rule, permutations and combinations | **§6A, §6B** *The binomial series* | high | **matched** |

**Scope deltas, all outwards.** All three comparisons go further than CCEA in different directions: AQA 8365 §2.7 sets algebraic brackets with coefficients and powers on both terms, which CCEA's numerical contexts rarely need; OCR *Enumeration* reaches **permutations and combinations** and the ⁿCᵣ notation; 4PM1 §6 is **the full binomial series**, including fractional and negative indices and the general term. CCEA needs none of that — it needs the triangle to row 8 and the pattern of powers.

**The useful consequence.** Because the comparison material is abundant and pitched slightly high, the right move is to take **practice items** from the other boards' shapes and cut the notation. In particular, do not introduce ⁿCᵣ: CCEA's statement says *use Pascal's triangle*, and AQA GCSE Statistics 8382 E10b explicitly says the X ~ B(n, p) notation will not be used at this level either.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Build the triangle, do not look it up.** *CCEA Summer 2019 is explicit that "not writing out Pascal's triangle cost a mark".* The triangle is a **mark on the page**, not a working aid to be done mentally, and it is also the most reliable thing in the topic: each entry is the sum of the two above it, so a candidate who can add can always reconstruct row 8. Make writing it out step 1 of every method, and make the first gate ask her to complete a row from the row above.

2. **Two patterns, checked against each other.** *The standard presentation in every treatment of the binomial (AQA 8365's worked example, 4PM1 §6, OCR *Enumeration*).* In each term of (p + q)ⁿ: the **power of p falls** from n to 0, the **power of q rises** from 0 to n, and **the two powers always add to n**. That last fact is a free self-check on every single term, and it catches the "power 5 used instead of 6" error Summer 2019 records. Put the check in the figure, not in a sentence.

3. **Count the terms before writing them: (p + q)ⁿ has n + 1 terms.** *Universal.* An expansion of (p + q)⁷ that has seven terms is wrong before any arithmetic is read. Cheap, memorable, and it pairs with the row of the triangle having n + 1 entries.

4. **Row n, not row n + 1.** *The classic off-by-one, and it is the likely cause of Summer 2019's wrong-power error.* The triangle's apex is row **0** (just `1`), so (p + q)⁷ uses the row `1 7 21 35 35 21 7 1`, which is the **eighth** row written down. Say it once, number the rows in the figure, and never rely on "the next row".

5. **It is an expression, so it needs its plus signs.** *CCEA Summer 2019: "plus signs omitted"; Summer 2023: "a few left out the coefficients".* An expansion written as a list of terms is not an expansion. This sounds trivial and it is a mark.

6. **The expansion is the probability calculation in disguise — say so at the start.** *CCEA's own Teacher Guidance for this statement is a probability question, not an algebra one.* When p is the probability of success and q = 1 − p, the terms of (p + q)ⁿ **are** the probabilities of 0, 1, 2, … n successes, and because p + q = 1 the whole expansion sums to 1. Flagging that here, one lesson early, is what makes `binomial-probabilities` feel like a consequence instead of a new topic.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the triangle with its rows numbered.** `viewBox` about `0 0 900 480`.

- Pascal's triangle drawn to **row 8**, centred, each entry in its own small circle so the addition is visible.
- **Row numbers down the left margin, starting at 0**, with the caption *row n gives (p + q)ⁿ*.
- **Two of the additions drawn explicitly** — a pair of entries with short arrows converging on the entry below and a `+` between them — so the build rule is shown rather than stated.
- **One row highlighted** (a light tint band) with `(p + q)⁷` printed beside it and `8 entries, so 8 terms` beneath.
- **Generator parameters:** `maxRow: number` (default 8, with the rows computed, never typed); `highlightRow: number | null`; `showAdditions: number` (how many worked additions to draw); `blankFrom: number | null` so a gate can hide the last two rows and ask her to build them. Assert every row is symmetric and sums to 2ⁿ.

**Second figure, and the one that does the teaching: the term strip.** `viewBox` about `0 0 1000 300`. One horizontal strip per term of an expansion, eight strips for n = 7, each divided into three cells:

| coefficient | p-power | q-power |
|---|---|---|
| 1 | p⁷ | q⁰ |
| 7 | p⁶ | q¹ |
| 21 | p⁵ | q² |
| … | … | … |

with **a running total column at the right showing `7 + 0`, `6 + 1`, `5 + 2` … all equal to 7**, under a bracket labelled *the powers always add to n*. Two small arrows down the two power columns, one labelled *falls*, one *rises*.

**Generator parameters:** `n`, `pLabel`, `qLabel`, `blankColumn: "coefficient" | "p" | "q" | null` so the same generator makes the taught figure and three different gated versions; `showSumCheck: boolean`.

**Third, small: the probability bridge.** The same strip for n = 7 with `p = 0.4` and `q = 0.6` substituted, and each row's value computed and printed, with the column total shown as `1.000`. It is the link to the next topic and it takes one extra generator flag (`substitute: {p, q}`).

---

## 4. Practical variants — not applicable; the equivalent is layout

No practical. What CCEA marks and what the comparison qualifications will not tell her:

- **Write the triangle out.** It is worth a mark on its own.
- **Write plus signs** between terms.
- **Write coefficients**, including the leading 1s where the question wants the full expansion.
- **Do not switch to ⁿCᵣ.** The statement names Pascal's triangle; the notation is not required and OCR's *Enumeration* material will introduce it.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets this as **Q4 part (i) or (ii)**, every year in our evidence (2019, 2022, 2023, 2025), as the opening of the binomial question whose later parts are `binomial-probabilities`.

1. **"Complete Pascal's triangle up to row n" [1–2].** Often literally printed with the last rows blank. Encode as a `table` part, one input per entry.
2. **"Expand (p + q)⁷" [2–3].** Marks for the coefficients and for the powers. A `text` or `algebraic` part; accept the terms in either order but require all eight and the plus signs.
3. **"Expand and simplify (5x + 2)³" [3].** AQA 8365 §2.7's own example shape — algebraic, with a coefficient on each term, so the powers apply to the whole bracket. Worth one item because it is harder than CCEA's usual numerical version and it drills the bracket discipline from `laws-of-logarithms`.
4. **"Write down the term in p³q⁴" [1].** A single-term question; tests the powers-add-to-n check directly and is very quick to mark.

**Mark-scheme habit:** the coefficients and the powers are credited separately, so an expansion with the right coefficients and one wrong power still scores. Author the scheme that way.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The triangle is a mental aid, not working | Writing it out is a mark. Step 1, every time | CCEA S2019 Q4(a) |
| The wrong row is used (off by one) | The apex is row 0. Number the rows in the figure | CCEA S2019 Q4(a): "power 5 used instead of 6" |
| Plus signs omitted | It is an expression, not a list | CCEA S2019 Q4(a) |
| Coefficients dropped | Each term is coefficient × power × power | CCEA S2023 Q4(ii) |
| Powers do not add to n | The running-total column, on every term | CCEA S2023 Q4(ii) |
| The expansion is unrelated to probability | p + q = 1, so the expansion sums to 1 and each term is a probability | CCEA's own Teacher Guidance is a probability context |
| ⁿCᵣ is required | It is not; the statement names Pascal's triangle | CCEA statement; AQA 8382 E10b likewise bars X ~ B(n, p) at Level 2 |

CCEA's evidence on this topic is **positive in three of four series**. The honest "In the exam" line is that this is the most reliable question in FM3, and the aim is to bank it in two minutes and spend the time on the later parts.

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.**

**Videos already held** (`further-maths:pascals-triangle-binomial-expansion`): **P McAleavey `9Y4bhtNSW8w`** (CCEA Further Mathematics by name — leads) and TLMaths `ht5BMoQujys`. The TLMaths one is A level and will introduce ⁿCᵣ and the general term; its `why` line should say where to stop.

**Simulation already held, and it genuinely models the content:** **PhET *Plinko Probability***. Balls falling through a triangular peg board land in bins with frequencies that follow exactly the row of Pascal's triangle — the sim **is** the triangle, running. Task worth authoring: set the board to 7 rows, predict which bin will be fullest and why, run a few hundred balls, then compare the observed bin heights with row 7 of the triangle she has just written out. Note that Plinko's default is a fair 0.5 board, which matches the symmetric row; the sim also lets the probability be changed, which previews the p ≠ q case in the next topic.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **ⁿCᵣ notation, factorials, permutations and combinations** (OCR 6993 *Enumeration*)
- **the general term** of a binomial expansion, and the binomial series for **fractional or negative indices** (Edexcel 4PM1 §6)
- **n > 8**
- the binomial theorem stated and proved; the sigma notation form
- X ~ B(n, p) notation and calculator binomial functions as a method

**CCEA-specific:** reproducing the triangle **to row 8 from memory or by construction**, since nothing is on the formula sheet; and the expansion being assessed as the front half of a probability question rather than as algebra.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:pascals-triangle-binomial-expansion` (status `matched`, high confidence)
- AQA Level 2 Certificate in Further Mathematics 8365 specification, **§2.7** (with its "Expand and simplify (5x + 2)³" example)
- OCR Level 3 FSMQ Additional Mathematics 6993 specification, ***Enumeration*** section (binomial, product rule, permutations, combinations)
- Pearson Edexcel International GCSE Further Pure Mathematics 4PM1 specification, **§6 The binomial series**
- AQA GCSE Statistics 8382 specification, **E10b** — for the Level 2 convention that ⁿCᵣ and X ~ B(n, p) are not used
- `data/spec/further-mathematics.json` → `pascals-triangle-binomial-expansion`: statement FM3-BIN-01, Teacher Guidance, `mustMemorise`, and four `examinerEvidence` entries (Summer 2019 Q4(a), 2022 Q4(i)–(ii), 2023 Q4(ii), 2025 Q4(i)–(ii))
- `data/links/media-map.json` key `further-maths:pascals-triangle-binomial-expansion`
