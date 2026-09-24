# Enrichment dossier — matrix-simultaneous-equations

**CCEA** GCSE Further Mathematics (2017), **FM1** Unit 1, area Matrices · statement **FM1-MAT-04** · difficulty 3 · calculator paper
**CCEA statement:** use matrices to solve 2 × 2 simultaneous equations
**CCEA Teacher Guidance:** write the pair of linear equations as **AX = B** and solve with **X = A⁻¹B** (equations of the form XA = B are excluded)
**Formula sheet:** nothing
**Prerequisites in our taxonomy:** `matrix-inverse-2x2`, `maths:simultaneous-equations-linear`
**Compiled** 20 September 2026 · 30 minutes
**Headline** `ccea-only`, and the most dangerous topic in the matrix block for one reason that has nothing to do with matrices. CCEA's Summer 2025 evidence is stark: **despite the instruction "use the matrix method", many candidates used substitution or elimination and received no marks.** She already knows how to solve these equations — that is the problem. The lesson's first job is not to teach a method but to make the *instruction* visible, and its second is layout, because the same evidence says even correct matrix attempts "struggled with layout". Treat this as a translation exercise: two equations in, one matrix equation out, and the algebra she already owns kept firmly in its box.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | Confidence | Status |
|---|---|---|---|---|---|
| FM1-MAT-04 | **unmatched** — §5 is multiplication, identity and transformations; simultaneous equations are solved algebraically at §2.14/2.16 with no matrix method | **unmatched** — *Algebra* solves simultaneous equations algebraically only | **unmatched** — **§3A** solves simultaneous equations algebraically, and the specification states that "knowledge of statistics and matrices will not be required" | high | **ccea-only** |

Worth stating precisely, because it is the heart of the topic: **all three comparison qualifications solve simultaneous equations, and none of them does it with matrices.** Every resource she finds for "simultaneous equations" will show her substitution or elimination — the exact methods that score zero here.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Read the command first: "use the matrix method" is worth all the marks.** *Straight from CCEA Summer 2025 Q5(ii), and there is no external source for it because no other board sets the question.* Open the lesson with the instruction, not the method. A gate that shows two versions of the same stem — one saying "solve" and one saying "use matrices to solve" — and asks what changes, is the single highest-value interaction in this topic. This belongs on the insight card and in the "In the exam" panel.

2. **Translate, do not solve: the coefficients go in a box.** *The standard presentation wherever matrix methods are taught (A level Further Maths, and every linear-algebra course).* Write the pair
   `ax + by = e`
   `cx + dy = f`
   then build three matrices by reading straight off the page: the **coefficient matrix** from the left-hand columns, the **variable column** `[x; y]`, and the **constant column** `[e; f]`. Nothing is rearranged and nothing is solved; it is transcription. Making this a mechanical, almost thoughtless step is what stops her reverting to elimination.

3. **Line the equations up first, and mind a missing term.** *A habit every algebraic treatment shares and that matters more here.* If one equation is `3x = 7 − 2y`, it must be rewritten as `3x + 2y = 7` before anything is copied into the box, and a missing variable is a zero, not a gap. The coefficient matrix has four slots and all four must be filled.

4. **Then it is the previous topic, unchanged.** *Follows from CCEA's own guidance, which words FM1-MAT-04 as an application of FM1-MAT-03.* Once written as AX = B, the method is exactly `matrix-equations`: find A⁻¹, pre-multiply both sides, `X = A⁻¹B`. Say that out loud — the new content in this topic is one step long — because it converts an intimidating question into a known one.

5. **The answer is a column, and x and y must be named.** *CCEA Summer 2025: "even matrix attempts struggled with layout".* `X = [2; −3]` is not the final answer; `x = 2, y = −3` is. Make the un-boxing an explicit last step with its own line, the mirror of the un-logging step in `log-log-graphs`.

6. **Check by substituting back into the original equations.** *Universal, free, and it uses the algebra she already has.* Twenty seconds, and it converts the whole question from an unfamiliar procedure into one with a self-check she trusts.

7. **What det = 0 would mean here — one sentence, kept short.** If the coefficient matrix is singular, there is no unique solution: the two lines are parallel or identical. This links to `matrix-inverse-2x2` and to her GCSE work on parallel lines, and CCEA's Summer 2023 Q6(ii) shows the singular case does get examined in the matrix block. Do not extend it into a classification of consistent and inconsistent systems, which is A level.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the translation panel.** `viewBox` about `0 0 1000 400`. Left half, the two equations printed as ordinary algebra with each coefficient boxed. Right half, the matrix equation `A X = B` drawn with brackets. **Four leader lines** run from the boxed coefficients on the left into their exact positions in the coefficient matrix on the right; two more run from the constants into the right-hand column; the variable column `[x; y]` sits between them with a caption *these are the only things you are looking for*.

This figure is the lesson. It says "copy, do not solve" in a way no sentence can.

**Generator parameters:** `equations: [[a,b,e],[c,d,f]]`, with the inverse, the product and the solution computed; `showLeaders: boolean`; `scramble: boolean` to emit a version where one equation is presented unlined-up (`3x = 7 − 2y`) so the rearranging step has to happen first; `missingTerm: boolean` to emit a version with a zero coefficient. Assert `det !== 0` unless a singular example is wanted.

**Second figure: the four-step spine.** A vertical strip of four boxes, each with its own one-line working, running down the page:
1. `line the equations up` → `ax + by = e`, `cx + dy = f`
2. `write as AX = B` → the three matrices
3. `X = A⁻¹B` → the inverse shown, then the product
4. `read off` → `x = …, y = …`
Step 3 reuses the pre-multiply figure from `matrix-equations` and step 4 is boxed, because that is the step the examiner says candidates omit. **Generator parameter:** `revealTo: 1|2|3|4` so the note can walk down it and a gate can stop at any step.

**Third, small: the command-word card.** Two stems side by side — *Solve the simultaneous equations* and *Use matrices to solve the simultaneous equations* — with a tick and a cross against "elimination is acceptable". Trivial to draw, and it is the highest-value object in the topic.

---

## 4. Practical variants — not applicable; the equivalent is method compliance and layout

No practical. What CCEA marks, and what she will not find anywhere else:

- **The named method is compulsory.** When the stem says "use the matrix method", an algebraic solution earns **nothing**, however correct. Our engine should not silently mark a right answer correct here: the exam-style item needs the working to be the assessed object, and the feedback must say why a right answer scored zero.
- **Show the inverse and show the product.** Both are marks; a bare answer, even a correct one, cannot earn them.
- **Answer in the form `x = …, y = …`.** Encode the answer as `algebraic` with tuple latex, `(2, -3)`, variables `["x", "y"]`, so the engine marks the pair as a pair — the G7 rule for paired answers exists for exactly this shape.
- **Exact fractions** where the determinant does not divide neatly.

---

## 5. Question types the other boards use that CCEA also rewards

No other board sets this, so the shapes come from CCEA. Our evidence has it at Q5(ii) in Summer 2025, following Q5(i) which was the inverse — and the examiner notes "the type had not appeared recently", which means it is **due** and is exactly the kind of gap the Sheet should name.

1. **"(i) Find A⁻¹. (ii) Hence use matrices to solve …" [2 + 3].** The canonical pairing. "Hence" means part (ii) must use part (i); author it as two linked parts so the follow-through is real.
2. **"Use matrices to solve …" [4–5], with no scaffolding.** The harder version: she must build A herself. Marks for the coefficient matrix, the inverse, the product, the final values.
3. **A worded context reducing to two equations [5–6].** Two items at unknown prices, two total costs. The forming is one mark, the matrix method the rest. This is the shape that also serves `form-three-simultaneous-equations` and is worth a shared context.
4. **"Explain why this pair of equations cannot be solved using matrices" [2].** The singular case, tied to parallel lines.
5. **Find-the-mistake:** a worked solution that is flawless but uses elimination. One item, and it will be remembered.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Any correct method earns the marks | "Use the matrix method" is an instruction, not a suggestion. Elimination scores zero | **CCEA S2025 Q5(ii)** — the central finding of this topic |
| The answer is the column X | Un-box it: `x = …, y = …` on its own final line | CCEA S2025: "struggled with layout" |
| Equations copied without lining up | Rearrange to `ax + by = c` first; a missing variable is a zero | standard; the `scramble` and `missingTerm` figure variants drill it |
| The variable column contains numbers | `[x; y]` is what you are solving for; it never changes | follows from the translation figure |
| Post-multiplying by the inverse | Pre-multiply, as in `matrix-equations`; CCEA excludes XA = B | CCEA Teacher Guidance; S2018/S2022 order evidence |
| A singular coefficient matrix is an arithmetic error | det = 0 means no unique solution — the lines are parallel or identical | CCEA S2023 Q6(ii) shows the singular case is examined in this block |

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.**

**Videos already held** (`further-maths:matrix-simultaneous-equations`): Corbettmaths `OQmK37wH_WA` and ExamSolutions `_QOtp5afX2o`. Both teach the matrix method itself. Neither will mention the command-word trap, which is the whole risk, so the `why` line must carry it.

**Simulation already held:** PhET *Equality Explorer: Two Variables*. Honest note: it models **balancing an equation** — doing the same thing to both sides — with x and y as objects on a balance. That is a good intuition for the pre-multiplication rule in `matrix-equations` and for why both sides must be treated alike, but **it does not model matrices**. Write the task about the balance idea and say plainly that the sim is about the principle, not the method, or leave it out; a sim that looks relevant and is not costs more trust than it buys.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **3 × 3 systems** solved by matrices (CCEA solves three unknowns algebraically in `solve-three-simultaneous-equations`, never by matrix)
- **Cramer's rule**, Gaussian elimination, row reduction
- **XA = B / post-multiplication**
- consistent, inconsistent and dependent systems as a classification; geometric interpretation as planes
- solving non-linear pairs by matrix methods

**CCEA-only:** the whole topic. And specifically the **method instruction** — "use the matrix method" — which is the only place in FM1 where a correct answer by a different route earns nothing, and which no external resource can prepare her for.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:matrix-simultaneous-equations` (status `ccea-only`, high confidence)
- AQA Level 2 Certificate in Further Mathematics 8365 specification, §2.14, §2.16 (algebraic solution of simultaneous equations; no matrix method) and §5.1–§5.4
- Edexcel International GCSE Further Pure Mathematics 4PM1 specification, §3A (algebraic) and the statement that matrices will not be required
- OCR Level 3 FSMQ Additional Mathematics 6993 specification, *Algebra* section (algebraic only)
- Physics & Maths Tutor, Further Maths Core Pure *Matrices* cheat sheets — for the AX = B framing and the pre-multiplication rule
- `data/spec/further-mathematics.json` → `matrix-simultaneous-equations`: statement FM1-MAT-04, Teacher Guidance, `mustMemorise`, and the Summer 2025 Q5(ii) `examinerEvidence` entry
- `data/links/media-map.json` key `further-maths:matrix-simultaneous-equations`
- `pipeline/prompts/author-topic.md` — the G7 paired-answer encoding rule, which applies to the (x, y) answer here
