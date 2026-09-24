# Enrichment dossier — matrix-arithmetic

**CCEA** GCSE Further Mathematics (2017), **FM1** Unit 1, area Matrices · statement **FM1-MAT-01** · difficulty 2 · calculator paper
**CCEA statement:** add, subtract and multiply matrices
**CCEA Teacher Guidance:** non-square matrices may be used for addition or subtraction (example: [2 3 4] + [5 −2 −7]). For multiplication, matrix dimensions will not exceed 3 rows or 3 columns, **but 3 × 3 matrices will not be included**.
**Formula sheet:** nothing. All of it must be known.
**Prerequisites:** none — this is a genuine standing start
**Compiled** 20 September 2026 · 30 minutes
**Headline** The closest comparison qualification, AQA 8365, **does not examine matrix addition or subtraction at all** — its §5.1 is multiplication only, restricted to 2 × 2 and 2 × 1, in service of transformations. OCR 6993 and Edexcel 4PM1 carry no matrices whatsoever (4PM1 says so in terms). So half of this topic has no comparison statement anywhere, and everything she will find online is either A level Further Maths (which starts with transformations and determinants) or a transformation-first Level 2 treatment. Meanwhile CCEA's own evidence is blunt and consistent across **five** series: the failure is not multiplication, it is **A² being computed element by element**, and **shapes not being checked**.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | Confidence | Status |
|---|---|---|---|---|---|
| FM1-MAT-01 multiplication | **§5.1** Multiplication of matrices, "all calculations will be restricted to 2 × 2 or 2 × 1 matrices"; **§5.2** the identity matrix I | unmatched | unmatched | high | **partial** |
| FM1-MAT-01 addition and subtraction | **unmatched** — not in §5.1–5.4 | unmatched | unmatched | high | **ccea-only** |

Evidence for the negatives: "matrix"/"matrices" returns **zero hits** in the OCR 6993 and, in the Edexcel 4PM1 specification, a single line stating that "knowledge of statistics and matrices will not be required". AQA 8365's matrix section is §5 *Matrix Transformations*, four statements long: 5.1 multiplication, 5.2 the identity, 5.3 transformations of the unit square, 5.4 combinations of transformations.

**Two scope deltas that matter to the author.**
- **AQA goes narrower on size and wider on purpose.** Its multiplication is capped at 2 × 2 and 2 × 1; CCEA allows up to 3 rows or 3 columns (so 2 × 3, 3 × 2, 1 × 3 are all fair game) **but never 3 × 3**. Any AQA-shaped exercise will therefore under-prepare her for a 2 × 3 product.
- **AQA's transformations (§5.3, §5.4) are beyond CCEA FM1** and are where nearly all AQA matrix material goes. Borrow from §5.1 and §5.2 only.

The size rule has history worth knowing: our Summer 2022 evidence records that a CCEA webinar had wrongly implied a 2 × 2 limit, and full marks were awarded to all candidates on the non-2 × 2 multiplication part as a result. The specification's limit is the one in the Teacher Guidance above.

---

## 2. Teaching angles worth recreating (in our own words)

1. **The shape check, written down before any arithmetic.** *A device common to every good matrix treatment — Physics & Maths Tutor's Further Maths matrix cheat sheets, Digestible Notes and Free Math Help all use it.* Write the two sizes side by side, `(2 × 3)(3 × 2)`: the **inner** pair must match or the product does not exist, and the **outer** pair is the size of the answer. CCEA's Summer 2023 finding is that "a surprising number did not get a 2 × 2 result", which is precisely what this check prevents. Make it step 1 of the method, with its own line of working, and make one gate ask only for the shape of a product — not its entries.

2. **The sweep: a finger along the row, a finger down the column.** *The standard physical description, used identically across the sources above.* Each entry of the answer is one row of the left matrix paired with one column of the right: multiply in pairs, then add. Saying "row from the left, column from the right" every time fixes which matrix supplies which, and that is what makes order feel non-arbitrary.

3. **A² means A × A, and multiplication is nothing like squaring each number.** *This is CCEA's single most repeated finding — Summer 2019, Summer 2023 and Summer 2024 all record candidates squaring each element.* The fix is to forbid the notation until the operation is established: write `A × A` in full for the first two worked examples, introduce `A²` only afterwards, and then run a diagnostic whose distractors are (a) the element-wise square, (b) the correct product, (c) a scalar multiple. The element-wise answer must carry a named misconception so the feedback can say what was done instead.

4. **Order matters, and you can prove it in thirty seconds.** *Every A level source notes AB ≠ BA in general; PMT's cheat sheet and the AQA Further Maths notes both flag "matrix order versus word order" as a standard pitfall.* Do not assert it — compute one small pair both ways in front of her, get two different answers, and leave both on screen. She needs this before `matrix-equations`, where the whole topic turns on keeping the order.

5. **Addition and subtraction are the easy operation with the strict rule.** *CCEA-specific: no comparison qualification carries it.* Element by element, and **only when the shapes are identical**. Summer 2023 records candidates subtracting matrices of different sizes. Because CCEA explicitly allows non-square matrices here, use a 1 × 3 example like the one in the Teacher Guidance so she meets a row vector early and does not think matrices are always square.

6. **Scalar multiplication is not matrix multiplication.** *CCEA Summer 2025: "a few squared the matrix instead of scalar-multiplying".* 3A multiplies every entry by 3; A × A does not. Put the two side by side once, deliberately, since the confusion runs both ways.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the shape strip and the sweep.** `viewBox` about `0 0 980 420`, two stacked bands.

- **Top band — the shape check.** The two sizes written large and side by side, `(2 × 3)` and `(3 × 2)`, with a curved arc joining the two **inner** numbers labelled *these must match*, and a straight bracket under the two **outer** numbers labelled *this is the size of the answer*. Beneath, a small non-example in grey: `(2 × 3)(2 × 3)` with the inner pair joined by a struck-through arc and the caption *no product*.
- **Bottom band — the sweep.** The two matrices drawn with proper square brackets, and the answer matrix to the right with one entry highlighted by a box. A horizontal band tints row 1 of the left matrix; a vertical band tints column 2 of the right; the two bands meet at the boxed entry. Under it, the arithmetic written out in full: `a₁₁b₁₂ + a₁₂b₂₂ + a₁₃b₃₂ = …`
- **Generator parameters:** `left` and `right` as arrays of numbers (every entry and every product computed, never typed); `highlight: [row, col]` so a sequence of figures can walk through each entry in turn; `showShapeBand: boolean`; `showWorking: boolean`. Assert that the inner dimensions match and that no emitted entry is `NaN`.
- Bands by `fill-opacity` only; `<title>` naming the sizes and which entry is highlighted.

**Second figure: A² is not element-wise.** Two short columns side by side, both starting from the same 2 × 2 matrix. Left column headed **A × A** with the four sweeps and the correct answer; right column headed **squaring each entry** with the wrong answer, struck through, and a caption naming it. Both answers printed, so the contrast is a number, not a warning. Generator takes one matrix and computes both.

**Third, small: add and subtract.** Two matrices of identical shape with element-wise arrows between corresponding positions, beside a struck-through pair of different shapes. Include a 1 × 3 row-vector example, as CCEA's guidance does.

---

## 4. Practical variants — not applicable; the equivalent is layout discipline

No practical. What CCEA marks and what no external resource will mention:

- **Write the shape check.** It is a line of working that catches the commonest error before it happens.
- **Brackets, always.** A matrix without brackets is not a matrix; CCEA's markers expect the notation.
- **One entry at a time, written out.** Summer 2025 records that layout itself defeated candidates on the related simultaneous-equations part; the habit starts here.
- **Calculator use.** This is a calculator paper and some calculators do matrix arithmetic. The answer still needs the working, so treat the calculator as a check, not a method — the same rule CCEA applies elsewhere.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets matrices as an **early, high-scoring question** — our evidence has it at Q1 in Summer 2019 and Summer 2025, Q8 in Summer 2023, Q7(a) in Summer 2024 — usually two or three short parts building to the later matrix topics.

1. **"Work out AB" [2].** One mark for a correct method (the sweep visible), one for the answer. Encode the answer as a `table` part, one input per entry, so marks are shared and the feedback can name the wrong entry.
2. **"Work out A²" [2].** The discriminator. Author the element-wise square as a named `commonError` with feedback that says what operation was performed instead.
3. **"Explain why BA cannot be worked out" [1].** Pure shape reasoning, one mark, and it tests the check rather than the arithmetic. AQA's restriction to 2 × 2 means its resources rarely set this; CCEA's wider sizes make it natural.
4. **"Work out 3A − B" [2].** Scalar multiple then subtraction, with the shape rule in play.

**Mark-scheme habit:** matrix answers are marked entry by entry with method credit for a visible correct sweep, so a single arithmetic slip should not cost both marks. Author the scheme that way and say so in the feedback.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| A² means squaring each entry | Write `A × A` in full until the operation is secure; show both answers side by side, as numbers | CCEA S2019 Q1, S2023 Q8, S2024 Q7(a)(ii) — **three series** |
| The product's shape is guessed | Inner numbers match, outer numbers give the answer's size. Write it before multiplying | CCEA S2023 Q8: "a surprising number did not get a 2 × 2 result" |
| Matrices of different sizes can be subtracted | Addition and subtraction are element-wise, so the shapes must be identical | CCEA S2023 Q8 |
| Scalar multiple confused with matrix product | 3A scales every entry; A × A sweeps rows into columns. Two different operations, shown together once | CCEA S2025 Q1 |
| AB = BA | Compute one pair both ways and leave both answers on screen | universal; PMT and the AQA Further Maths notes name "order versus word order" as a standard pitfall |
| Matrices are always square | CCEA's own example is `[2 3 4] + [5 −2 −7]`. Use a row vector in the first lesson | CCEA Teacher Guidance |
| 3 × 3 products will be set | They will not. Up to 3 rows or 3 columns, but never 3 × 3 | CCEA Teacher Guidance; and the S2022 webinar confusion shows the size rule is genuinely misunderstood in NI centres |

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.** Symbolic arithmetic; a photograph would be decoration.

**Videos already held** (`further-maths:matrix-arithmetic`): Corbettmaths `msRyXRdFoyI` and `X66YHxuGUvE`. Both are short and operation-focused, which suits this topic; neither is CCEA-specific, so neither will mention the 3-row/3-column-but-not-3 × 3 rule. Say that in the `why` line.

**Simulations: none held and none suitable.** `media-map.json` records `sims: []`. PhET has no matrix sim; the A level transformation applets on GeoGebra model AQA §5.3, which is off spec here, so adding one would teach the wrong thing.

**Worth reading, not copying:** Physics & Maths Tutor's *Matrices* cheat sheets for Edexcel and AQA Further Maths (A level) are the clearest free statement of the shape rule and the sweep. They move quickly to determinants and transformations — stop at the first page.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **matrix transformations** of the unit square and **combinations** of transformations (AQA 8365 §5.3, §5.4) — this is where almost all Level 2 matrix material goes
- **3 × 3 matrices** in any operation
- the identity matrix as an object of study (AQA §5.2) — CCEA needs it only implicitly, through the inverse in the next topic
- associativity and distributivity as named properties; matrix powers beyond A²; zero matrix
- determinants, inverses and transposes — the next two topics, not this one

**CCEA-only:** matrix **addition and subtraction**, including with non-square matrices; and products whose dimensions exceed 2 × 2 (up to 3 rows or 3 columns, excluding 3 × 3).

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:matrix-arithmetic` (status `partial`, high confidence)
- AQA Level 2 Certificate in Further Mathematics 8365 specification, §5.1–§5.4 (read in full)
- Edexcel International GCSE Further Pure Mathematics 4PM1 specification (searched: one line stating matrices will not be required)
- OCR Level 3 FSMQ Additional Mathematics 6993 specification (searched: no matrix content)
- Physics & Maths Tutor, Further Maths Core Pure *Matrices* cheat sheets (Edexcel CP1 Ch.6 and AQA Matrices I); Digestible Notes and Free Math Help matrix-multiplication pages — for the inner/outer shape rule and the row-into-column sweep
- `data/spec/further-mathematics.json` → `matrix-arithmetic`: statement FM1-MAT-01, Teacher Guidance, `mustMemorise`, and **five** `examinerEvidence` entries (Summer 2019 Q1, 2022 Q3(a)(ii), 2023 Q8, 2024 Q7(a)(ii), 2025 Q1)
- `data/links/media-map.json` key `further-maths:matrix-arithmetic`
