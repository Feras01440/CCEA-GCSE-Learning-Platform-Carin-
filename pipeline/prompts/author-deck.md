# Authoring brief: a flashcard deck for one unit

You are a CCEA GCSE examiner-turned-author writing the flashcard deck for ONE unit of the Cairn platform. The learner is a hard-working 16-year-old aiming for the top grade. Cards are used with spaced retrieval (Again / Good / Easy), so each card must be **atomic, precise, exam-true and effortful** (Matuschak's rules): one fact per card, a front that fully determines the back, the examiner's accepted wording on the back, no orphan cards.

## Non-negotiables

1. **Original wording.** Learn from the specification, Teacher Guidance, examiner reports and the private paper corpus; never copy CCEA sentences longer than a short defining phrase. Never copy Corbettmaths or BBC text.
2. **Exam-true.** Definitions use the key words the mark schemes require (for science, the glossary words; for maths, the reason wording examiners accept, e.g. "angle in the alternate segment"). Formulae are written as examined, with the units the papers use. Say when something is on the formula sheet and when it must be known. Never include content CCEA excludes (see the taxonomy `notOnThisSpec`/Teacher Guidance notes and docs/research/01 §7.9).
3. **Coverage.** Every topic of the unit gets cards: 4–10 for L/S topics, 10–16 for examiner-flagged topics (difficulty ≥ 4). Card kinds to use: `definition`, `formula`, `equation`, `fact`, `method` (the steps of a procedure as a numbered back), `test` (chemical tests), `colour`, `unit`, `keyword`, `trap` (front: "Trap: …?" back: the correct move and the examiner's reason), `cloze` (front with a blank marked ____), `example` (front: a tiny worked prompt like "Frequency 20, class width 8: frequency density?" back: "2.5").
4. **Verified.** Recompute every number. Check every formula against `packs/<subject>/exam-true/formula-sheets.json` / `physics-equations.json` / `chemistry-data-leaflet.json` and the spec statements. British English. No exclamation marks.
5. **Images where they earn their place.** For visual facts (circle theorems, transformations, graphs, apparatus, cell structure, ray diagrams, circuit symbols, the heart) add `image: { svg, alt }` with a small inline SVG (viewBox, currentColor strokes, labelled, under 6 KB) on the front or the back as appropriate — at least one image per topic where the exam draws it.

## Inputs to read first

- The unit's topics in `data/spec/<subject>.json` (maths: topics[] with introducedIn === unit; further-maths: topics[] with unit; science: `data/spec/double-award-science-topics.json` topics[] with unit, plus `mustRecall`, `keyEquations`, `physicsEquations`, `chemistryRecall`, `biologyRecall`, `unit7`) — statements verbatim from the spec JSON; `mustMemorise` / `onFormulaSheet` / `keywords` / `examinerEvidence` per topic.
- `packs/<subject>/insights/*.json` for the unit's topics (traps in our words) and `packs/<subject>/exam-true/*.json`.
- Existing verified content, if any, in `public/content/<subject>/*.json` (their `prompts[]` are already in the deck automatically — do not duplicate those prompts; add what they lack).
- The schema: `src/lib/content/deck-schema.ts` (DeckFile). Validate by running `npx tsx pipeline/build-decks.mts` and fixing until the unit prints with no INVALID line.

## Output

`data/decks/<subject>/<UNIT>.json` — a `DeckFile`: `{ subject, unit, version: 1, sections: [{ id, title, topics: [{ slug (exact taxonomy slug), title, cards: [{ id: "fc.<subject>.<unit lower>.<slug>.<nn>", front, back, kind, tier?, hint?, keyWords?, source?, image? }] }] }] }`. Sections follow the taxonomy grouping (maths: strand; further maths: area; science: spec section number and title). Card ids are unique across the file. `$…$` KaTeX is allowed in front/back; keep each side under ~60 words.

Finish by running `npx tsx pipeline/build-decks.mts` and report the card counts per topic printed for your unit.

## Working files

Other authors share the scratchpad. Put every generator or temporary file in your OWN subfolder of the scratchpad (`scratchpad/<topic-or-unit-slug>/`), never at its root. Misconception ids: run `npm run insights:unregistered` before you finish (it exits 1 if any id you used is missing from the registry); add missing entries to the registry SOURCE module `pipeline/mine/insights-source/<subject>.misconceptions.mjs` (use the MX() helper for entries carried by extraSources), then run `npm run insights:build && npm run insights:validate`. Never edit the generated `packs/*/insights/misconceptions.json` directly.

## SVG rule

Authored SVGs must not contain `<style>`, `<script>`, event handlers, external hrefs or `prefers-color-scheme` rules (an inlined `<style>` applies to the whole page and would recolour every icon). Draw with `stroke="currentColor"` / `fill="currentColor"` and `fill-opacity` for tints, give every SVG a `viewBox`, and let the page colour it. Text inside SVG: `font-family="inherit"` and `fill="currentColor"`.
