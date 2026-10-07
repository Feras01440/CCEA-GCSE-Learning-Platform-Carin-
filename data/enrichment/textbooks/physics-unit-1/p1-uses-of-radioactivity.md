# p1-uses-of-radioactivity: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy and the P1 deck (`data/decks/science/P1.json`) has 8 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.5.15, 1.5.16 (both Foundation).
**Verdict.** **Thinner** (nothing authored). The book is fuller than the specification: a general rule for choosing a half-life, the thickness gauge with its feedback loop (and why steel needs gamma), leak tracing with a three-detector picture, a smoke alarm, and medical and farming uses. But it never states the two choices CCEA asks for most often in one place (which radiation, and long or short half-life, for each use); the smoke alarm's half-life is missing, and its medical examples (a beta emitter for the thyroid, "technetium-99" for a six-hour isotope) could confuse the simple rule CCEA marks: tracers detected outside the body use gamma with a short half-life.

---

## 1. Book chapter and pages

Section 1.5: learning outcomes p. 51; "Uses of Radioactivity" pp. 63–65 (the half-life rule; industry: rolling mills and the thickness gauge, tracers for leaks; smoke detectors; medicine; agriculture).

## 2. The book's teaching sequence

1. Every use needs the right radiation and the right half-life: too long and the source stays dangerous longer than needed; too short and it must be replaced too often (p. 63).
2. Thickness control: a beta source on one side of a moving sheet of paper or aluminium, a detector on the other; more counts mean the sheet is too thin and the rollers ease off, fewer counts mean too thick and they press harder; steel needs gamma because beta cannot get through; a long half-life so the source lasts (pp. 63–64).
3. Tracers: a gamma emitter put into an underground pipe, detected through the soil, with a short half-life so little stays in the ground; readings peak above a leak (p. 64).
4. Smoke detectors: an alpha source and a detector in a chamber; smoke absorbs the alpha particles and the drop sets off the alarm (pp. 64–65).
5. Medicine: gamma from cobalt-60 to treat tumours; short-half-life tracers injected to watch an organ; an iodine isotope for the thyroid; a technetium isotope for heart imaging; gamma sterilising instruments and dressings, from a long-half-life source (p. 65).
6. Agriculture: gamma to preserve food (controversial), long-half-life sources; tracers to follow nutrient uptake in plants (p. 65).

## 3. Explanations and devices worth recreating (our own words)

- **Two choices for every use** (p. 63). The radiation (from what it must pass through) and the half-life (long enough to do the job, short enough to do little harm afterwards). This is the specification's 1.5.16 in a form she can apply to an unseen use. CCEA's scheme for 2023 March Higher Q2(a) is built on exactly these two choices for three uses (`docs/sources/papers/science/2023-March/P1-H-Physics-MS-26165.txt`).
- **Penetration decides the radiation** (pp. 63–64). Paper or aluminium partly absorbs beta, so the count changes with thickness; alpha would be stopped completely and gamma would hardly notice. Soil needs gamma. This reasoning, not a memorised list, is what lets her answer a new context.
- **The feedback loop** (p. 63). Detector reading to roller pressure, in both directions. A good two-mark explain shape.
- **Peak above the leak** (p. 64). Three detectors along the ground, the middle one high: the tracer collects where the liquid escapes.

## 4. Diagrams and photographs

| Book figure (page) | What it shows | What it is for | Recreation note for our first figures |
|---|---|---|---|
| Thickness gauge (p. 64) | A sheet passing between two pairs of rollers, a beta source above, a detector below, a line from the detector back to the rollers; credited to another publisher. | Control by counts. | Draw our own, with the feedback arrow labelled. |
| Leak detection (p. 64) | Three meters on the ground over a buried pipe, low, high, low, the middle one above a crack; credited to another publisher. | Tracing. | Draw our own. |
| Smoke alarm photograph and cut-away (p. 65) | A ceiling alarm and a numbered sketch of its parts (source, detector, circuit, sounder), with only some numbers explained in the text. | The alpha use. | Draw our own labelled cut-away; do not reuse either image. |

## 5. Worked examples, calculations and data tasks

None. The topic is examined by choice tables and short explanations, not calculations (half-life calculations sit in `p1-half-life`).

## 6. Practice question types, with CCEA evidence

- **Choose** the radiation and the half-life for named uses (6; 2019 Summer Higher Q5: sterilising equipment long and gamma, pipe tracer short and gamma, smoke alarm long and alpha; 2023 March Higher Q2(a), six-mark extended answer: pipe gamma short, smoke alarm alpha long, bloodstream gamma short; 2025 November Higher Q4(c): smoke alarm alpha long, buried pipes gamma short).
- **Name** the radiation for each use (3–4; 2021 Summer Higher; Summer 2024 Higher Q7(b); Summer 2025 Higher Q2(a): smoke alarm alpha, sterilising gamma, aluminium thickness **beta**, locating pipes gamma, `docs/sources/papers/science/2025-Summer/P1-H-Physics-MS-67250.txt`).
- **Explain** a choice (1–2): why gamma for pipes (passes through soil), why a short half-life for a tracer (little radioactivity left in the ground or the body).

## 7. Definitions and wording, and doubtful statements

- **Tracer** (p. 64): the specification's definition (finding out what happens inside an object without breaking into it, 1.5.15) is clearer than the book's "fluid movement and mixing"; teach the specification's.
- **Smoke alarm half-life**: the book gives none; CCEA's schemes want **long** (2019, 2023, 2025).
- **Medical tracers**: the book's iodine-131 example is described as a beta emitter. For CCEA's purposes a tracer watched from outside the body is a **gamma** emitter with a short half-life (2023 March scheme); a beta-only example would contradict that rule. Leave the iodine example out or say it is detected by its gamma.
- **The technetium example** (p. 65) gives technetium-99 a six-hour half-life; the six-hour isotope used in imaging is the metastable form, technetium-99m; technetium-99 itself lasts hundreds of thousands of years. Not examined; do not copy.
- **Thickness control**: the specification names metal sheets; the book uses beta for paper and aluminium and gamma for steel; CCEA's 2025 scheme wants beta for aluminium. Teach beta for paper, card and aluminium foil, and say thick steel needs gamma.
- **Food irradiation, cobalt-60 therapy, nutrient tracing** (p. 65): beyond 1.5.15's named examples; fine as context, not as content to learn.

## 8. Higher-tier-only content in the book

None (all Foundation).

## 9. Pitfalls and "remember" notes in the book

- Choose a half-life that balances working long enough against harm afterwards (p. 63).
- Pick the radiation by what it has to pass through (pp. 63–64).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **One table, five uses, two choices each**: smoke alarm (alpha, long), sterilising (gamma, long), thickness of aluminium or paper (beta, long), underground pipe tracer (gamma, short), medical tracer in the bloodstream (gamma, short); then a Your turn on an unseen use (for example a crop tracer), choosing by reasoning.
2. **The reasons**: penetration for the radiation; job length against lingering harm for the half-life.
3. **The thickness gauge** with its feedback loop in both directions.
4. **Leak tracing** and the "inside without breaking in" definition.
5. **A six-mark answer** on the 2023 March pattern, with a new trio of uses.

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. The 8 deck cards agree with the specification and the schemes. The deck's smoke-alarm card explains the alarm through ionised air carrying a small current that smoke reduces; the book explains it as smoke absorbing alpha before it reaches a detector. Both are acceptable at GCSE (no CCEA scheme we hold marks the mechanism); keep one model, not both.
