# Enrichment dossier — matrix-inverse-2x2

**CCEA** GCSE Further Mathematics (2017), **FM1** Unit 1, area Matrices · statement **FM1-MAT-02** · difficulty 2 · calculator paper
**CCEA statement:** find the inverse of 2 × 2 matrices
**CCEA Teacher Guidance:** inverse of 2 × 2 matrices only (3 × 3 matrices are not included)
**Formula sheet:** **nothing.** `det = ad − bc` and the inverse formula must both be memorised — this is the single most important fact in the dossier.
**Prerequisite in our taxonomy:** `matrix-arithmetic`
**Compiled** 20 September 2026 · 28 minutes
**Headline** `ccea-only`: the determinant and inverse of a 2 × 2 matrix appear in **no** AQA 8365, OCR 6993 or Edexcel 4PM1 statement. AQA's matrix section stops at multiplication, the identity and transformations. So every resource she can reach is A level Further Maths, which arrives at the inverse through the determinant-as-area-scale-factor and moves straight on to 3 × 3 matrices and transformations. CCEA's own evidence says the topic is **well answered** — the losses are arithmetic, and specifically **sign arithmetic**: Summer 2025 records candidates writing 1/26 where the determinant was −26. Teach the formula as a shape you can see, and put the whole weight of the practice on negative determinants.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | Confidence | Status |
|---|---|---|---|---|---|
| FM1-MAT-02 | **unmatched** — §5 stops at 5.1 multiplication, 5.2 identity, 5.3–5.4 transformations | **unmatched** — no matrix content | **unmatched** — "knowledge of statistics and matrices will not be required" | high | **ccea-only** |

Searches run against the extracted specification texts: `determinant` and `inverse` return **zero** matrix-related hits in all three.

**Consequence for the author.** There is no Level 2 comparison at all. The transferable material is A level Further Maths (Edexcel Core Pure 1 chapter 6, AQA *Matrices I*), and it is pitched above CCEA in three specific ways listed in §8. The Sheet can claim exclusivity here truthfully.

---

## 2. Teaching angles worth recreating (in our own words)

1. **The inverse is the undo, and it is defined by what it does, not by its formula.** *The framing every A level treatment opens with (PMT's Core Pure cheat sheet, the AQA Further Maths notes).* A⁻¹ is the matrix for which A⁻¹A = AA⁻¹ = I. Say that first and show it once by multiplying a matrix by its inverse and getting the identity. Then the formula is a tool for finding the undo, not an arbitrary arrangement of letters — which matters because CCEA gives her **nothing** on the formula sheet and a memorised pattern with no meaning decays.

2. **Teach the formula as a picture: swap the diagonal, flip the signs on the other diagonal, divide by ad − bc.** *The standard mnemonic across A level sources.* Three physical actions on the printed matrix:
   - **swap** a and d (the leading diagonal);
   - **negate** b and c (the other diagonal);
   - **divide** everything by the determinant.
   Drawn as three arrows on one matrix, it is far more durable than `1/(ad−bc) [[d, −b], [−c, a]]` written as a line of symbols, and it makes the classic error — negating the wrong diagonal — visible rather than plausible.

3. **The determinant first, on its own line, with its sign.** *CCEA Summer 2019 records arithmetic slips in the determinant; Summer 2025 records `1/26` where the determinant was `−26`.* Make `det A = ad − bc = …` a numbered step that stands alone before the matrix is touched. Then the reciprocal is written with the sign attached: `1/(−26)`, not `1/26` with a mental note. This one layout rule is the whole of the topic's mark loss.

4. **det = 0 means there is no inverse, and say which matrix.** *CCEA Summer 2023 Q6(ii): most candidates knew the equation could not be solved because det B = 0, but "the wording was often unclear about which matrix had no inverse".* So the answer is not "the determinant is zero" — it is "**B** has no inverse **because** det B = 0, so the equation cannot be solved." Give her the sentence frame, and mark the naming of the matrix as its own point. The word **singular** is worth teaching as the name for it, since CCEA's mark schemes accept it and it is shorter to write.

5. **Check by multiplying back.** *Universal in A level teaching and free at GCSE level.* A⁻¹A should give I. It takes twenty seconds on a calculator paper and it catches every sign error. Build it into the method as the last step, not as advice.

6. **What the determinant *means* — one sentence, marked off-spec.** *A level Further Maths teaches det as the area scale factor of the transformation the matrix represents, which is also why det = 0 collapses the plane and destroys information.* This is genuinely illuminating and answers "why does zero break it?", but it depends on AQA §5.3 transformations, which CCEA excludes. One `notonspec` aside, no more.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the three actions.** `viewBox` about `0 0 900 380`. One 2 × 2 matrix drawn large with proper brackets and entries `a b / c d`, and three annotations laid on it:

- a **double-headed curved arrow** joining `a` and `d`, labelled **① swap the leading diagonal**;
- a **minus sign badge** on each of `b` and `c`, joined by a light dashed line, labelled **② change the signs on the other diagonal**;
- a **horizontal rule under the whole matrix** with `ad − bc` written beneath it and a bracket to the side labelled **③ divide by the determinant**.

To the right, the finished result drawn as a second matrix, `1/(ad − bc)` in front of it, with the entries in their new places. Crucially, **the reciprocal is printed with brackets around the whole determinant** so a negative determinant cannot be silently dropped.

**Generator parameters:** `matrix: [[a,b],[c,d]]` with the determinant and every entry of the inverse computed, never typed; `step: 0|1|2|3` so a sequence walks through the three actions; `showCheck: boolean` to append the A⁻¹A = I verification; `forceNegativeDet: boolean` so a whole practice ladder can be generated with negative determinants, which is where the marks are lost. Assert `det !== 0` unless `singular: true` is passed.

**Second figure: the singular case.** The same layout with `det = 0` reached, the reciprocal position struck through, and the sentence frame printed beneath: *det **M** = 0, so **M** has no inverse (**M** is singular).* The bold letter is a generator parameter (`name`), because the examiner's complaint was that candidates did not say **which** matrix.

**Third, small: the check.** `A⁻¹ × A` written out with the four sweeps and the identity matrix as the answer, reusing the sweep figure from `matrix-arithmetic` so the two topics look like one story.

All `currentColor`; the sign badges and the arrows carry the meaning, not colour; `<title>` describing the three actions in order.

---

## 4. Practical variants — not applicable; the equivalent is sign discipline

No practical. What CCEA marks:

- **Determinant on its own line, with its sign**, before anything else.
- **The reciprocal written with brackets**: `1/(−26)`, and then either left as a fraction outside the matrix or distributed through every entry — but not half and half.
- **Exact fractions, not decimals.** A determinant of −26 gives thirteenths and twenty-sixths; a decimal answer loses the accuracy mark.
- **Check by multiplying back** on a calculator paper.

---

## 5. Question types the other boards use that CCEA also rewards

No other board sets these, so the shapes come from CCEA's own papers (Q5 in Summer 2019 and Summer 2025, Q6(ii) in Summer 2023 in our evidence). The inverse is almost always **part (i) of a two-part question** whose part (ii) is `matrix-equations` or `matrix-simultaneous-equations` — it is a stepping stone, and the marks in part (ii) depend on it, so follow-through matters.

1. **"Find the inverse of A" [2].** One mark for the determinant, one for the correctly arranged matrix with the reciprocal attached. Encode as a `table` part (one input per entry) with the scalar handled in the stem, or as an `algebraic` part if the whole expression is wanted.
2. **"Find the value of k for which M has no inverse" [2].** The determinant set to zero and solved — usually a linear equation in k, sometimes a quadratic. This is the shape that makes the determinant meaningful rather than mechanical, and it is set by every board that teaches inverses at all.
3. **"Explain why the equation cannot be solved" [1–2].** The Summer 2023 shape. Marks for det = 0 **and** for naming the matrix. Encode as a `text` part with one key-word group for the determinant and one for the matrix's name, so a half answer scores half.
4. **"Show that A⁻¹A = I" [2].** A verification item that reuses `matrix-arithmetic` and makes the definition concrete.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The reciprocal of a negative determinant loses its sign | Write `1/(det)` with brackets, and compute the determinant on its own line first | CCEA S2025 Q5(i): "a few wrote 1/26 instead of 1/(−26)" |
| Arithmetic slips in `ad − bc` | Its own numbered step, with the subtraction written out. On a calculator paper, key it and check | CCEA S2019 Q5 |
| "The determinant is zero" offered as a whole answer | Name the matrix: *B has no inverse because det B = 0, so the equation cannot be solved* | CCEA S2023 Q6(ii): "the wording was often unclear about which matrix had no inverse" |
| The wrong diagonal is negated | The three-action figure: swap the **leading** diagonal, negate the **other** one | standard; the commonest structural error in every A level treatment |
| The inverse is the reciprocal of each entry | Show A⁻¹A = I once. A matrix that undoes A cannot be built entry by entry | follows from `matrix-arithmetic`'s element-wise misconception, which CCEA records three times |
| Decimal entries | Exact fractions; the determinant rarely divides nicely | CCEA accuracy conventions |

CCEA's evidence describes this topic as **well answered** ("very well answered" in Summer 2025). The honest "In the exam" line is therefore not a warning but a target: this is two reliable marks and a gateway to the harder parts, so the aim is to make it automatic.

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.**

**Videos already held** (`further-maths:matrix-inverse-2x2`): Corbettmaths `T7cleO736w4` and `jLTXaXNPgLo`. Both are 2 × 2 determinant and inverse videos at the right level. Neither is CCEA-specific; neither will mention that the formula is **not** on her formula sheet, which is the thing she most needs to know, so the `why` line should say it.

**Simulations: none held and none suitable.** `media-map.json` records `sims: []`. The obvious candidates are GeoGebra matrix-transformation applets, which model AQA §5.3 — off spec, and they would teach the determinant as an area scale factor, which is the one idea §8 marks `notonspec`.

**Worth reading, not copying:** Physics & Maths Tutor's *Matrices* cheat sheets (Edexcel CP1 Ch.6, AQA Matrices I) state the formula and the singular condition compactly. Read page one and stop before 3 × 3.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **3 × 3 determinants and inverses** (excluded by CCEA's Teacher Guidance in terms) and the method of minors/cofactors
- **the determinant as an area scale factor**, and the transformation interpretation of a singular matrix — genuinely illuminating, but it depends on AQA §5.3 transformations, which CCEA excludes
- the adjugate/adjoint by name; transposes
- invariant points and invariant lines
- solving 3 × 3 systems by matrix methods

**CCEA-only:** the whole topic. Also specifically: the inverse formula is **not on the CCEA formula sheet**, where several other qualifications supply it, so recall is itself examinable.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:matrix-inverse-2x2` (status `ccea-only`, high confidence)
- AQA Level 2 Certificate in Further Mathematics 8365 specification, §5.1–§5.4 (searched: no determinant, no inverse)
- Edexcel International GCSE Further Pure Mathematics 4PM1 specification (matrices explicitly excluded)
- OCR Level 3 FSMQ Additional Mathematics 6993 specification (no matrix content)
- Physics & Maths Tutor, Further Maths Core Pure *Matrices* cheat sheets (Edexcel CP1 Ch.6, AQA Matrices I) — the undo definition, the three-action mnemonic and the singular condition
- `data/spec/further-mathematics.json` → `matrix-inverse-2x2`: statement FM1-MAT-02, Teacher Guidance, `mustMemorise`, and three `examinerEvidence` entries (Summer 2019 Q5, 2023 Q6(ii), 2025 Q5(i))
- `data/links/media-map.json` key `further-maths:matrix-inverse-2x2`
