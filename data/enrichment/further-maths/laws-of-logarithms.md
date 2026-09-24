# Enrichment dossier — laws-of-logarithms

**CCEA** GCSE Further Mathematics (2017), **FM1** Unit 1, area Logarithms · statement **FM1-LOG-02** · **difficulty 5 — the hardest topic in FM1 by our own scoring** · calculator paper
**CCEA statement:** solve problems using: the laws of logarithms; and log/log graphs in context
**CCEA Teacher Guidance:** excluding the change of base rule
**Formula sheet (Unit 1):** carries only `if aˣ = n then x = logₐ n`. **The three laws are not given and must be known.**
**Prerequisite in our taxonomy:** `logarithms-from-indices`
**Compiled** 20 September 2026 · 35 minutes
**Headline** Five consecutive series of CCEA examiner evidence say the same thing, and it is not what an external resource would lead you to teach. Candidates can state the three laws; what they cannot do is the **two CCEA question types**: *express log N in terms of log a, log b and log c* (which needs the number factorised first, and the examiner records "unsure how to get 10.5 from 2, 3 and 7"), and *given an equation in logs, make y the subject* (2019: "most gave 3 log x / 2 log y; very few reached y = x^(3/2)"). Build the lesson around those two shapes, and teach the laws as the index laws in disguise so that a forgotten law can be rederived rather than guessed.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | Confidence | Status |
|---|---|---|---|---|---|
| FM1-LOG-02, the laws half | **unmatched — AQA 8365 carries no logarithms at all**; zero hits for "logarithm" in the specification | *Exponentials and Logarithms* (section name only; its content tables are images, so no statement code) | **§1B** — "use and properties of indices and logarithms, **including change of base**", with the three laws and logₐ a = 1, logₐ 1 = 0 printed in the notes column | high | **partial** |

**Scope deltas both ways.** 4PM1 §1B is the closest statement on any board and lists exactly the three laws CCEA needs — **plus change of base**, which CCEA's Teacher Guidance excludes in terms. OCR 6993 is a Level 3 qualification, so its treatment assumes more fluency than a CCEA candidate has. Neither carries the CCEA emphasis in `mustMemorise`: *write a numerical constant as a log of the same base before combining* (e.g. 1 = log 10).

**Consequence for the author.** Every revision note she finds will open with change of base or with ln and e. The lesson has to cut both, and say so once, plainly.

---

## 2. Teaching angles worth recreating (in our own words)

1. **The laws are the index laws, read backwards. Derive them once, on screen.** *Implicit in every good treatment and explicit in 4PM1's own ordering, which puts "use and properties of **indices** and logarithms" in one statement.* Her prerequisite topic already establishes aˣ = n ⇔ x = logₐ n. So put x = logₐ p and y = logₐ q, write p = aˣ and q = aʸ, then:
   - pq = aˣ⁺ʸ, so logₐ(pq) = x + y = logₐ p + logₐ q;
   - p/q = aˣ⁻ʸ, so logₐ(p/q) = logₐ p − logₐ q;
   - pⁿ = aⁿˣ, so logₐ(pⁿ) = nx = n logₐ p.
   Three lines each. This is the only defence against the commonest error in the topic — a candidate who has forgotten a law guesses one, and the guess is almost always log(a + b) = log a + log b. A candidate who can rederive does not guess.

2. **The three-word translation: add → multiply, subtract → divide, coefficient → power.** *Save My Exams' A level note and ChiliMath both compress the laws to this triple, in this order.* It is worth borrowing because it is directional and because it is reversible: she needs to go **both ways** — combining several logs into one (CCEA's "make y the subject" questions) and splitting one log into several (CCEA's "express in terms of" questions). Teach the triple, then immediately teach it backwards.

3. **Factorise the number before you touch a log.** *The standard A level method for "given a = log 2 and b = log 3, express log 48 in terms of a and b"; PMT's Laws of Logarithms worksheets and Save My Exams' CIE Pure 3 note both set it this way.* The move is: **write the number as a product and quotient of the given numbers first, on its own line, before any log appears.** CCEA's Summer 2023 finding is exactly this failure — candidates were "unsure how to get 10.5 from 2, 3 and 7" — and the fix is arithmetic, not logarithms. 10.5 = 21 ÷ 2 = (3 × 7) ÷ 2, and only then log 10.5 = log 3 + log 7 − log 2.

4. **A number with no log in front of it is a log waiting to happen.** *CCEA's own `mustMemorise` names this and no external resource does, because it is peculiar to the CCEA question style.* In an equation like log y = 2 log x + 1, the 1 cannot be combined until it is written as log 10 (base 10) or logₐ a. Give it a numbered step of its own — "turn every loose constant into a log of the same base" — because it is the step that unlocks the whole question.

5. **The power law applies to the whole term, brackets and all.** *CCEA Summer 2024: "most lost the final mark by forgetting to cube the 2 in (2x)³".* When 3 log(2x) becomes log((2x)³), the answer is log(8x³), not log(2x³). Make the bracket visible in every worked line and make one gate ask only this.

6. **Finish the job: the answer is y = …, not log y = …** *CCEA Summer 2019: "very few reached y = x^(3/2)".* Once both sides are a single log of the same base, the logs cancel — "if log A = log B then A = B" — and that final line is where the marks are. Add it as an explicit closing step in the method, with its reason (a log function is one-to-one, so equal logs mean equal arguments).

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two-column translation table.** `viewBox` about `0 0 900 340`. Two columns, **"in the index world"** and **"in the log world"**, three rows, with a two-headed arrow between the columns on every row.

| index world | log world |
|---|---|
| aˣ × aʸ = aˣ⁺ʸ | log p + log q = log(pq) |
| aˣ ÷ aʸ = aˣ⁻ʸ | log p − log q = log(p/q) |
| (aˣ)ⁿ = aⁿˣ | n log p = log(pⁿ) |

Under the table, one line in a box: **there is no law for log(p + q).** That negative row is as important as the three positive ones and belongs in the figure, not in a footnote.

**Generator parameters:** `rows: (1|2|3)[]` so a gate can hide a row and ask her to rebuild it from the index law beside it; `showNegativeRow: boolean`; `base: "a" | "10"`.

**Second figure, and the one that earns its place: the factor ladder.** `viewBox` about `0 0 760 400`. A worked descent, four rows, right-aligned on an equals sign, for the CCEA question type:

```
        10.5  =  21 ÷ 2
              =  (3 × 7) ÷ 2          <- arithmetic only, no logs yet
   log 10.5   =  log 3 + log 7 − log 2
              =  b + c − a            <- substitute the given letters last
```

A vertical bracket down the left of the first two rows labelled **"do the arithmetic first"**, and down the last two labelled **"then one law per step"**. **Generator parameters:** `target` (the number), `given: number[]` (the primes or numbers supplied in the stem), and a solver that finds the product/quotient decomposition, so every twin and every faded version is computed rather than typed. Assert the decomposition actually reconstructs the target.

**Third figure: the bracket magnifier.** Two short lines side by side, `3 log(2x) = log((2x)³) = log(8x³)` with the `(2x)` circled in the middle line and a small arrow to the `8x³`, against `3 log(2x) ≠ log(2x³)` struck through. Ten lines of SVG, aimed at one named examiner finding.

All three: `currentColor`, no colour-only signals, `<title>` describing the table's two worlds.

---

## 4. Practical variants — not applicable; the equivalent is working discipline

No practical. The transferable discipline CCEA marks:

- **One law per line.** Summer 2025 records candidates who "misapplied the subtraction rule" and "put c in the denominator instead of the numerator" — both are compression errors, made when two laws are applied in one step. Our worked examples should never combine two laws on one line, and the method step should say why.
- **Keep the base.** Every log in a CCEA question is to the same base, and the laws only work within one base. Say it once.
- **Exact answers.** These are algebraic manipulations, not calculator work; an answer left as a decimal where the question wanted `x^(3/2)` scores nothing.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets the laws as **part (a) of a two-part logarithm question**, with `indicial-equations` as part (b) — that pairing appears in Summer 2022 (Q5), 2023 (Q7) and 2025 (Q9) in our own evidence. Part (a) is the discriminator; part (b) is usually well answered.

1. **"Express log N in terms of a, b and c" [3].** Marks: the arithmetic decomposition, the laws applied, the substitution. This is 4PM1 §1B's natural question and A level's standard one, and CCEA's hardest. Author it with the factor ladder.
2. **"Write as a single logarithm" [2–3].** The reverse direction. The coefficient must go up as a power **first**, then the additions and subtractions combine. A loose constant is the trap.
3. **"Given [an equation in logs], express y in terms of x" [3–4].** The CCEA speciality. Marks for combining each side into one log, for cancelling the logs, and for the final form. Summer 2019 and Summer 2025 are both this shape. Encode the answer as `algebraic` with the required `form`, since `y = x^(3/2)` and `y = √(x³)` are the same relationship and both should be accepted.
4. **"Show that …" [2–3].** A given result, so every line must be justified. Useful as a find-the-mistake source: present four lines of working with exactly one law misapplied.

**Mark-scheme habit worth copying:** each law used correctly is a mark, and the marks are **method marks that survive an arithmetic slip**. So author the scheme so a candidate who decomposes 10.5 correctly but then mis-signs one term still earns two of three, and say that in the feedback.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| log(p + q) = log p + log q | The negative row in the hero figure, stated as a rule of its own. Then rederive the real law from indices | universal (named in the logarithm-error literature as the single most prevalent error); implied by CCEA S2022 "could not separate a product into a sum of logs" |
| Dividing the logs instead of subtracting: 3 log x / 2 log y | "Subtract → divide" runs one way only. The quotient of two logs is not a log of anything (that is change of base, which is off spec) | CCEA S2019 Q9(a): "most gave 3 log x / 2 log y" |
| Cannot decompose the number | Factorise **before** any log appears. It is arithmetic, and it is the first mark | CCEA S2023 Q7(a): "unsure how to get 10.5 from 2, 3 and 7" |
| The coefficient only powers part of the term | Brackets: 3 log(2x) = log((2x)³) = log(8x³) | CCEA S2024 Q6(a) |
| A loose constant is stuck | Turn it into a log of the same base: 1 = log 10 | CCEA `mustMemorise`; no external source names this |
| Stopping at log y = … | Equal logs mean equal arguments. The answer line wants y | CCEA S2019: "very few reached y = x^(3/2)" |
| Roots cannot be handled | A root is a fractional power, so the power law applies: log √x = ½ log x | CCEA S2025: "mishandled constants and roots" |
| Terms land on the wrong side of the fraction | One law per line, and read the direction out loud before writing it | CCEA S2025: "put c in the denominator instead of the numerator" |

Five consecutive series, one topic: this is the densest examiner evidence we hold for any Further Maths topic, and every row above is anchored to a series. The insight card should carry all five.

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.** Pure algebraic manipulation; a photograph would be decoration.

**Videos already held** (`data/links/media-map.json`, `further-maths:laws-of-logarithms`): **P McAleavey `LKJJ2YtK-ic`** and **TLMaths `pRtHbEVxis0`**. P McAleavey teaches the CCEA Further Maths specification by name and is the right lead here; TLMaths is A level and will reach change of base and natural logs, so its `why` line should say what to stop at. Place either **after** the derivation figure, not before, and gate on the "express in terms of" shape rather than on the laws themselves.

**Simulations: none, and none needed.** `media-map.json` records `sims: []` for this slug and that judgement holds; no interactive models symbolic manipulation usefully at this level.

**Worth linking, not copying:** Physics & Maths Tutor's *Laws of Logarithms* question compilations (A level Pure) are the largest free bank of the "express in terms of" shape. Read them for the range of numbers set; **never transcribe a question** — write our own with our own numbers.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **the change of base rule** (excluded by CCEA's Teacher Guidance in terms; 4PM1 §1B includes it, and so does every A level page)
- **natural logarithms, ln and e** — absent from CCEA FM1 entirely
- logarithmic and exponential **graphs** as objects of study (4PM1 §1A expects the shape of y = aˣ and y = log_b x)
- logarithmic inequalities; logs with a variable base; proof that the laws hold in general
- least-squares or regression use of logs (that belongs to `log-log-graphs`, and only in CCEA's restricted form)

**CCEA-only or CCEA-specific:**
- **writing a numerical constant as a log** before combining (e.g. 1 = log 10)
- the pairing of the laws with `log-log-graphs` under one statement, FM1-LOG-02, so a paper can move from manipulation to a graph in one question
- the "express y in terms of x" finish, which CCEA marks and which most A level resources treat as an intermediate step

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:laws-of-logarithms` (status `partial`, high confidence) and the three comparison specifications behind it
- AQA Level 2 Certificate in Further Mathematics 8365 specification (searched: **no logarithm content at all**)
- Pearson Edexcel International GCSE Further Pure Mathematics 4PM1 specification, §1A and §1B (read, including the notes column listing the three laws, logₐ a = 1, logₐ 1 = 0 and change of base)
- OCR Level 3 FSMQ Additional Mathematics 6993 specification, *Exponentials and Logarithms* section (section name only; its content tables are images that no extractor could linearise)
- Save My Exams, A level Maths revision note "Laws of Logarithms", and its CIE Pure 3 note 2.2 — for the add/subtract/coefficient triple and the factorise-first method
- ChiliMath, "Logarithm Rules" — the same triple, independently, which is why it is worth borrowing
- Physics & Maths Tutor, A level Pure *Laws of Logarithms* question compilations — for the range of the "express in terms of" question type
- `data/spec/further-mathematics.json` → `laws-of-logarithms`: statement FM1-LOG-02, Teacher Guidance, `mustMemorise`, and **five** `examinerEvidence` entries (Summer 2019 Q9a, 2022 Q5a, 2023 Q7a, 2024 Q6a, 2025 Q9a)
- `data/links/media-map.json` key `further-maths:laws-of-logarithms`
