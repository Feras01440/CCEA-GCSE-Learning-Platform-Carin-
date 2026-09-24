# Enrichment dossier — matrix-equations

**CCEA** GCSE Further Mathematics (2017), **FM1** Unit 1, area Matrices · statement **FM1-MAT-03** · difficulty 3 · calculator paper
**CCEA statement:** solve matrix equations
**CCEA Teacher Guidance:** matrix equations could be of the form **A ± X = B** or **AX = B** or a combination of these. **Equations of the form XA = B are excluded.**
**Formula sheet:** nothing; the inverse formula must be recalled from the previous topic
**Prerequisite in our taxonomy:** `matrix-inverse-2x2`
**Compiled** 20 September 2026 · 28 minutes
**Headline** `ccea-only`: no AQA 8365, OCR 6993 or Edexcel 4PM1 statement covers solving matrix equations. The whole topic rests on one idea that **only matters because matrix multiplication is not commutative** — you must multiply both sides **on the same side**, and because CCEA excludes XA = B, that side is always the **left**. CCEA's evidence is unusually encouraging (Summer 2018 "really well done", Summer 2022 "very few multiplied in the wrong order"), with one warning: Summer 2024 records that the item was "tricky for some who had never met a matrix question of this type". So the risk here is **unfamiliarity, not difficulty** — the lesson's job is exposure to the shapes, not a struggle.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | Confidence | Status |
|---|---|---|---|---|---|
| FM1-MAT-03 | **unmatched** — §5 covers multiplication, the identity and transformations only | **unmatched** | **unmatched** — matrices explicitly excluded | high | **ccea-only** |

The transferable material is A level Further Maths, where solving `AX = B` appears as a step inside the larger treatment of simultaneous equations and linear transformations, never as a topic of its own.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Two equations, two completely different methods — sort them before solving.** *A framing CCEA's own Teacher Guidance invites by naming both forms in one statement.* `A + X = B` is ordinary algebra: subtract A from both sides, element by element. `AX = B` is not, because you cannot divide by a matrix. Open the lesson with a sorting gate — here are four equations, which are the easy kind? — so she classifies before she calculates. The Summer 2024 finding is that candidates had never met the type; a sorting step gives them a place to put it.

2. **You cannot divide by a matrix, so you undo by multiplying by the inverse.** *The standard A level statement (PMT Core Pure cheat sheets, AQA Further Maths notes).* This is where `matrix-inverse-2x2` pays off: A⁻¹A = I, and I leaves X unchanged, so multiplying by A⁻¹ strips A away. Show that chain explicitly once — `A⁻¹AX = A⁻¹B`, then `IX = A⁻¹B`, then `X = A⁻¹B` — rather than jumping to the last line. Three lines, and they are the justification the "show that" questions want.

3. **Same side, both sides. Say it as a rule with a reason.** *Every A level source flags matrix order as the standard pitfall; CCEA's Summer 2018 and Summer 2022 evidence both record wrong-order attempts, though few of them.* Because AB ≠ BA, multiplying the left of one side and the right of the other breaks the equation. The rule: **pre-multiply both sides** — write A⁻¹ in front of A and in front of B. Draw it as two matrices being pushed in from the left simultaneously.

4. **Why the left, always: CCEA excludes XA = B.** *Directly from the Teacher Guidance, and no external resource will tell her this because no external resource sets the topic.* A level teaches both pre- and post-multiplication, because XA = B needs `X = BA⁻¹`. CCEA never sets it. So she can learn one rule — put the inverse on the **left** of both sides — and that is a genuine simplification worth stating out loud, with a one-line `notonspec` note that the other case exists.

5. **Check the shape of X before computing it.** *Borrowed from the shape check in `matrix-arithmetic`.* If A is 2 × 2 and B is 2 × 1, then X is 2 × 1 — a column, not a square. Knowing the answer's shape before starting catches a whole class of layout errors and prepares `matrix-simultaneous-equations`, where X is always a column.

6. **Combinations: do the addition first, then the inverse.** *CCEA's guidance allows "a combination of these", e.g. `AX + C = B`.* The order of operations is the ordinary one — clear the added matrix first by subtraction, then deal with the multiplication. One worked example of the combined form is worth two of the simple ones, because it is the shape that makes candidates freeze.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the pre-multiply push.** `viewBox` about `0 0 940 360`, three stacked rows of an equation, growing downwards.

- **Row 1:** `A X = B`, with A, X and B drawn as bracketed matrices.
- **Row 2:** the same equation with an `A⁻¹` **arriving from the left on both sides**, drawn as two identical small matrices with arrows pushing them in, and a caption *pre-multiply both sides — the same side, or the equation breaks*.
- **Row 3:** `A⁻¹A X = A⁻¹B`, with `A⁻¹A` bracketed underneath and labelled `= I`, then a short arrow to the final line `X = A⁻¹B`.
- **To the right, a struck-through panel** showing `A⁻¹A X = B A⁻¹` with the caption *different sides — not allowed, because AB ≠ BA*. The wrong version has to be visible; it is the error the mark scheme is watching for.

**Generator parameters:** `A`, `B` as numeric matrices (the inverse, the product and every entry computed); `form: "AX=B" | "A+X=B" | "AX+C=B"`; `step: 1|2|3|4` so the figure can be revealed a row at a time; `showWrongSide: boolean`.

**Second figure: the sorting card.** Four boxed equations in a 2 × 2 grid — `A + X = B`, `AX = B`, `X − A = B`, `AX + C = B` — each with a blank label underneath for the method. Used as a `label` or `order` item before any arithmetic. Cheap to draw, and it is the step that turns an unfamiliar question into a recognised one.

**Third, small: the shape strip.** `(2×2)(2×1) = (2×1)` with the inner pair arced and the outer pair bracketed, reusing the exact visual language of `matrix-arithmetic`'s hero figure so the two read as one system.

---

## 4. Practical variants — not applicable; the equivalent is layout and order

No practical. What CCEA marks:

- **Write A⁻¹ on the left of both sides on the same line.** The method mark is for the correct pre-multiplication, and it survives an arithmetic slip in the inverse. Our scheme should award it independently.
- **Show the inverse.** Summer 2022 records determinant slips; a visible `det A = …` line earns credit even when the arithmetic then fails.
- **Follow-through.** Summer 2024 notes "generous follow-through" — a wrong inverse carried correctly through the multiplication still earns the later marks. Author the scheme so our engine mirrors that.
- **Exact fractions** throughout, since the inverse carries a reciprocal determinant.

---

## 5. Question types the other boards use that CCEA also rewards

No other board sets these; the shapes come from CCEA's own papers (Q5 in Summer 2018 and 2019, Q3(b) in Summer 2022, Q7(b) in Summer 2024).

1. **"Find the matrix X such that AX = B" [3].** The staple. Marks: the inverse (often earned in a previous part), the correct pre-multiplication, the product. Encode as a `table` part with one input per entry of X.
2. **"Find X given A + X = B" [2].** The easy sibling, and worth setting **in the same question** so the contrast is forced.
3. **"Solve PX = Q, showing your working" [4].** With "showing your working", the three-line chain `P⁻¹PX = P⁻¹Q → IX = P⁻¹Q → X = P⁻¹Q` becomes the answer, not scaffolding.
4. **A combined form, `AX + C = B` [4].** Clear C first, then pre-multiply. The shape that separates candidates.
5. **"Explain why X cannot be found" [1–2].** Links back to the singular case in `matrix-inverse-2x2`, and requires naming the matrix.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Multiplying by the inverse on different sides | Pre-multiply **both** sides; the struck-through panel in the hero figure shows what happens otherwise | CCEA S2018 Q5 "occasionally multiplied in the wrong order"; S2022 Q3(b) "very few multiplied L⁻¹ and M in the wrong order" |
| Dividing by a matrix | There is no matrix division. The undo is multiplication by the inverse, justified by A⁻¹A = I | universal in A level teaching |
| Treating AX = B like A + X = B | The sorting gate, before any arithmetic | CCEA S2024 Q7(b): "tricky for some who had never met a matrix question of this type" |
| Determinant slips upstream | Its own line, with its sign, exactly as in `matrix-inverse-2x2` | CCEA S2022 Q3(b): "slips in the determinant" |
| X assumed to be square | Check the shape first: `(2×2)(2×?) = (2×?)` | follows from `matrix-arithmetic`; matters most in the next topic |
| Believing XA = B must also be learnt | It is excluded by CCEA's Teacher Guidance. One `notonspec` line, and one rule to learn instead of two | CCEA Teacher Guidance |

CCEA's evidence on this topic is positive in three of four series. The honest "In the exam" framing is: **this is a reliable three or four marks provided the inverse is right**, and the only real risk is not recognising the question.

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.**

**Videos already held** (`further-maths:matrix-equations`): **N.I. Maths Tutor `3wmjSxDpJGw`** and Corbettmaths `RFKGvx1isyI`. N.I. Maths Tutor teaches the CCEA specification by name and should lead — for a `ccea-only` topic, a CCEA-specific video is a genuine find and its `why` line should say so.

**Simulations: none held and none suitable.** `media-map.json` records `sims: []`; the manipulation is symbolic and no faithful interactive exists.

**Worth reading, not copying:** the *Matrices* cheat sheets at Physics & Maths Tutor state the pre- versus post-multiplication rule compactly. Note that they teach **both**, because A level needs both; take only the pre-multiplication half.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **XA = B and post-multiplication** (`X = BA⁻¹`) — excluded by CCEA's Teacher Guidance in terms, and taught by every A level source
- 3 × 3 matrix equations
- matrix equations with an unknown scalar, or with A appearing on both sides
- linear transformations, invariant lines, and the geometric reading of a matrix equation
- proving that the inverse is unique, or that (AB)⁻¹ = B⁻¹A⁻¹

**CCEA-only:** the whole topic, and specifically the restriction to left-multiplication, which makes it a one-rule topic rather than a two-rule one.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:matrix-equations` (status `ccea-only`, high confidence)
- AQA 8365 §5.1–§5.4, Edexcel 4PM1 (matrices excluded), OCR 6993 (no matrix content) — all searched for "matrix equation", "inverse", "solve"
- Physics & Maths Tutor, Further Maths Core Pure *Matrices* cheat sheets (Edexcel CP1 Ch.6, AQA Matrices I) — the no-division argument and the pre/post-multiplication rule
- `data/spec/further-mathematics.json` → `matrix-equations`: statement FM1-MAT-03, Teacher Guidance, `mustMemorise`, and four `examinerEvidence` entries (Summer 2018 Q5, 2019 Q5, 2022 Q3(b), 2024 Q7(b))
- `data/links/media-map.json` key `further-maths:matrix-equations`
