# Authoring brief: a batch of S/L bundles for one unit

Same rules as `author-topic.md` (read it first, in full), applied to SEVERAL topics of one unit in one session. Use a generator script in the scratchpad so every number is computed once and reused in stems, answers, schemes and verification logs; emit each topic's `bundle.json` + `note.blocks.json` from it.

Bundle sizes (from the taxonomy `difficulty`):
- **S** (difficulty 3): the Sheet + note (≤ 8 gates), 1–2 worked examples with a twin, 4–6 diagnostics with tagged distractors, 8–10 practice items (short ladder then 2–3 mixed), 2 exam-style questions with full CCEA-language schemes, 1 find-the-mistake, 6–8 retrieval prompts, insight (if a card exists), verification logs for everything.
- **L** (difficulty ≤ 2): the Sheet + a short note (≤ 5 gates), 1 worked example, 4 diagnostics, 6 practice, 1 exam-style, 4 prompts, verification logs.
- Gate counts above are guides to length, not caps: template v2's rule that every teaching section of at most 120 words ends in a gate governs, so a note whose sections need nine gates has nine. A note over the guide by more than two gates is usually too long, not under-gated.
- Topics with difficulty ≥ 4 are H and are authored separately; skip them unless the batch list says otherwise.

Images: any topic the exam draws (graphs, shapes, constructions, transformations, statistical diagrams, apparatus, cells, circuits, rays) gets at least one inline SVG: in `note.blocks.json` as a `figure` block; in questions/worked examples as `figures: [{ kind: "svg", src: "data:image/svg+xml;utf8,<svg …>", alt }]` (encode `#` as `%23`, keep each under 12 KB, viewBox, currentColor strokes, labelled). Existing generators: `svg-gen` with `generator: "histogram" | "axes" | "table"` (see `src/components/figures/generated.tsx` for the data shapes).

Exam-true reading: read 2–3 real papers and mark schemes for the unit privately from `docs/sources/papers/<subject>/<session>/` (use `grep -a`), take tariffs, command words and part structure only, and write new contexts and numbers. Cite examiner findings with ExaminerSource ids from the insight cards.

Finish with `npm run content:check` (strict: every bundle must validate), `node scripts/qa/lesson-v2.mjs --unit <unit>` (every breach of Lesson template v2, note by note; it must print 0 breaches for the batch before you file, and any examiner source it warns about is a Sheet trap you still owe), `node scripts/qa/figure-leaks.mjs --unit <unit>` (0 leaks before you file: every figure that prints an answer its own part asks for, in its text nodes or in its accessible text — the `<title>` a screen reader reads included; keep the annotated figure for the note and give the question an unannotated, lettered copy) and `node scripts/qa/shingles.mjs --unit <unit>` (the shingle test in `author-topic.md` non-negotiable 1: a shared run is allowed only when it recurs in three or more question papers **and** is command material — a command word, a standing exam phrase or a formula-sheet line; a recurring run that is only stimulus prose is a copy, so is a run from one or two papers, and a run shared with any mark scheme or examiner report is never allowed; 0 breaches before you file), then report the published counts for every topic in the batch, item ids per topic, and any misconception ids you used that are not in the registry.

## Working files

Other authors share the scratchpad. Put every generator or temporary file in your OWN subfolder of the scratchpad (`scratchpad/<topic-or-unit-slug>/`), never at its root. Misconception ids: run `npm run insights:unregistered` before you finish (it exits 1 if any id you used is missing from the registry); add missing entries to the registry SOURCE module `pipeline/mine/insights-source/<subject>.misconceptions.mjs` (use the MX() helper for entries carried by extraSources), then run `npm run insights:build && npm run insights:validate`. Never edit the generated `packs/*/insights/misconceptions.json` directly.

## SVG rule

Authored SVGs must not contain `<style>`, `<script>`, event handlers, external hrefs or `prefers-color-scheme` rules (an inlined `<style>` applies to the whole page and would recolour every icon). Draw with `stroke="currentColor"` / `fill="currentColor"` and `fill-opacity` for tints, give every SVG a `viewBox`, and let the page colour it. Text inside SVG: `font-family="inherit"` and `fill="currentColor"`.

## Printed numbers

Never interpolate raw JS floats into text (a G7 review found "14.850000000000001" in a worked example). Format every printed number with a rounding helper (toFixed or a fixed-decimals formatter) and print an intermediate value only as the rounded form of a value your generator computed; retyping intermediates by hand is how printed working goes wrong. Exam-style questions that continue from a previous part must use the stored, unrounded value in the solutionProgram.
