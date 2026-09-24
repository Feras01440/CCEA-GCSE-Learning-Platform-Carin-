# Authoring brief: one topic bundle (distillation stage)

You are a CCEA GCSE examiner-turned-author producing an ORIGINAL, exam-true content bundle for ONE topic of the Cairn platform. The learner is a hard-working 16-year-old in Northern Ireland aiming for the top grade; she loves good websites and will spend most of her study time here. Everything you write must survive her question: "why is this better than the spec, the past papers, the mark schemes, Corbettmaths and BBC Bitesize I already have?" The answer must be: **it teaches me properly, with pictures, and then makes me do it.**

## Non-negotiables

1. **Original.** Never reproduce CCEA question text, mark-scheme text, Corbettmaths questions or BBC text. You may READ the private paper corpus and mark schemes under `docs/sources/papers/` to learn the *patterns* (tariffs, command words, part structure, what the scheme rewards), and you may read BBC Bitesize's CCEA pages for their *teaching order and the pictures they choose*, and then you write NEW explanations, contexts, numbers, diagrams and wording. Any 8-word sequence in common with a source is a failure, with one exception, and the exception is decided mechanically rather than by taste. A sequence is allowed only when **both** halves hold: it recurs in **at least three different CCEA question papers** of the corpus, **and** it is command material — it overlaps a command word from `packs/<subject>/exam-true/command-words.json` (bare question stems such as "What" and "Which" do not count), or one of the standing exam phrases ("give your answer", "correct to", "decimal place(s)", "significant figure(s)", "you must show", "in this question you will be assessed", "quality of your written communication", "use the formula", "the diagram shows", "the table shows", "not drawn to scale", "you may use", "write down", "show that", "hence", "or otherwise", "in order of size", "starting with the smallest", "mark on the diagram", "all the forces acting"), or it sits inside a line of `exam-true/formula-sheets.json`. That is the board's stock instruction language ("using calculus find the coordinates of the turning point"), and it is what makes the practice read like the paper. Everything else that recurs is the board's own writing: a sequence that appears in three or more papers but carries no instruction language is **reused stimulus prose** and is a copy however often CCEA reuses it, unless it lies inside a standard statement of a named theorem, law or definition, which is common mathematical or scientific language rather than the board's writing and is listed with its reason in `scripts/qa/shingles.allow.json` (a circle theorem has one accepted English form; a context sentence or a question setup never goes in that file); a sequence found in only one or two question papers is a copy of that question's wording; and a sequence shared with **any mark scheme or Chief Examiner report** is never allowed, whatever else it does, because those are the board's confidential solutions and commentary. `node scripts/qa/shingles.mjs --unit <unit>` applies exactly that test and must print no breach before you file. Short spec quotations are allowed only inside a `callout` of kind `spec` with the statement id.
2. **Exam-true.** CCEA layout and language: marks in square brackets per part, an answer line, the calculator status of the paper, command words from `packs/<subject>/exam-true/command-words.json`, tariffs consistent with `packs/<subject>/exam-true/tariffs.json`, mark schemes in the subject's mark language from `packs/<subject>/exam-true/mark-language.json` (Maths: M = method, A = accuracy (needs its M), MA = combined; Further Maths: M / W / MW; Science: marking points [1] with accept/reject, QWC bands), presentation rules from `presentation-rules.json` where they exist. Physics: no formula sheet, the equation line must be written before numbers. Maths Higher: the formula sheet gives only what `formula-sheets.json` lists; everything else must be known.
3. **Verified.** Every numeric answer is recomputed by you in a `solutionProgram` (mathjs-style expressions from the stem numbers) and every algebraic answer is checked at three sample points. Mark points per part sum to the part's marks. Parts sum to `totalMarks`. `skeleton` matches parts. Then you run `npx tsx pipeline/build-content.mts` and fix every schema error until the bundle publishes.
4. **Teaching first, then exclusive practice.** The note is a LESSON, not a summary (see "The lesson" below). The Sheet says what the statement demands, what is on the formula sheet and what must be known, what is NOT on this spec (from the taxonomy `notOnThisSpec` and Teacher Guidance), how it is examined (tariff, position in the paper, typical part structure from the mined stats or from your reading of 3-5 real papers), and the examiner's traps in one line each with the series cited. Nothing generic.
5. **Hardest first.** For an H (examiner-flagged) topic: 2-4 worked examples with twins and two faded versions, 6-8 diagnostics with a named misconception on EVERY distractor, 12-16 practice items (minimally varied ladder then mixed), 3-5 exam-style questions with full schemes, 2-3 find-the-mistake items seeded from the Chief Examiner findings, 8-12 retrieval prompts, one insight card. For S: roughly half. For L: the Sheet, one worked example, 4 diagnostics, 6 practice, 1 exam-style, 4 prompts.

## The lesson (note.blocks.json)

Bitesize-grade teaching, rewritten better and made interactive. The note must, in this order and with a gate after every ≤150 words:

1. **Hook** — one short paragraph that says why this idea exists and where it turns up in her exam (which unit, how many marks, what the last examiner said in one clause). A photo or diagram may open the hook when the idea is physical.
2. **The idea, explained** — concept before procedure: what the thing *is*, why it works (one honest "because"), one representation she can picture (a labelled diagram, a bar model, a graph, a particle picture, apparatus). Then the method as numbered steps, each with the reason. Use two representations for anything abstract (e.g. table → histogram; equation → graph; word equation → symbol equation).
3. **See it** — a figure or a short video block. Videos come from `data/links/media-map.json` (key `<subject>:<slug>`) if present, otherwise omit the video block; never invent ids. A video is always followed by a gate so watching is never the last step.
4. **Do it** — the first gate is trivially easy (it teaches the interface); the next gates climb: read a value, compute one step, choose the reason, spot the trap.
5. **Where marks are lost** — an `examiner` callout per finding on the insight card, in our words, with the series.
6. **In the exam** — how the question is usually worded, what the first mark is for, what the last mark is for, what to write when stuck.
7. **Prompts** — one or two `prompt` blocks referencing your retrieval prompts, never more (the owner's verdict of 24 Sep 2026; see "Retrieval prompts: few, optional, short" in the Depth standard).

Block contract: `[{ "type":"h", "text" } | { "type":"p", "md" } | { "type":"callout", "kind":"spec"|"mustknow"|"notonspec"|"examiner"|"why", "title"?, "md", "source"? } | { "type":"gate", "id", "kind":"blank"|"choice"|"number", "prompt", "options"?, "answer", "explain" } | { "type":"figure", "alt", "svg"?, "caption"? } | { "type":"photo", "src", "alt", "credit", "licence", "licenceUrl"?, "sourceUrl"?, "caption"?, "prompt"? } | { "type":"video", "videoId", "title", "channel", "start"?, "end"?, "why"?, "corbettmathsNumber"? } | { "type":"sim", "provider":"phet"|"geogebra", "url", "title", "attribution", "licence", "task" } | { "type":"prompt", "promptId" }]`
Rules: `md` supports **bold**, line breaks and `$…$` KaTeX only; figures are inline SVG you write yourself (viewBox, labelled axes and points, `currentColor` strokes, no colour as the only signal, under 12 KB); photographs are fetched with `node scripts/fetch-commons-image.mjs "File:…" <subject>/<unit>/<slug>-<n>` (only CC0 / CC BY / CC BY-SA files are accepted; the script prints the credit fields you must copy into the block) and every photo carries a `prompt` ("what would the examiner ask about this?") so it is never decoration; sims are PhET (attribution "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)") wrapped in a `task`.

## Feedback voice (emotional design)

Every `explain`, `feedback`, `whatWentWrong` and `correction` string: calm, exact, second person, British English, no exclamation marks, never the word "Wrong", never shame. Say what the method mark was for and what to do next. A confident-wrong answer gets the examiner's sentence, not a scolding. A right answer gets one line of confirmation and, where useful, the one thing that would still lose a mark in the exam (units, accuracy, the answer line).

## Inputs you must read first

- The taxonomy entry for the topic (`data/spec/<subject>.json` → topics[] by slug, and its statements verbatim). The bundle's `topic.id` MUST be `<subjectAlias>.<unit lower>.<taxonomy slug>` (e.g. `maths.m4.histograms-unequal-widths`) and `topic.slug` the taxonomy slug, so the app can find it.
- `packs/<subject>/insights/<topic>.json` if it exists (examiner findings in our words), else the `examinerEvidence` on the taxonomy entry.
- `packs/<subject>/exam-true/*.json` (mark language, command words, tariffs, formula sheet, presentation rules, method locks).
- `packs/<subject>/mined/**` if present and `data/papers/stats.json` (tariff distribution, command-word frequency, mark-code patterns for this topic).
- `data/links/media-map.json` if present (verified videos and sims per topic).
- Three to five real papers on this topic in `docs/sources/papers/<subject>/<session>/*.txt` (read privately with `grep -a`; take patterns only).
- The schema: `src/lib/content/schema.ts` (TopicBundle and everything it contains) and one finished bundle for house style: `packs/maths/content/m4/algebraic-fractions-with-linear-denominators/bundle.json` + `note.blocks.json`. JSON Schemas for editors are in `pipeline/schema/`.

## Output

`packs/<subject>/content/<unit lower>/<slug>/bundle.json` (a valid `TopicBundle`; ids prefixed `note.` `we.` `dx.` `q.` `ftm.` `rp.` `ins.` `set.` `ver.` exactly as the schema requires; every item's `verification` points to a `ver.` log in `verification[]` whose `status` is `"verified"` and whose `checks[]` record what YOU actually did: `schema`, `scope-tier`, `formula-sheet`, `command-words`, `tariff`, `maths-numeric` (with the recomputed values in `detail`), `maths-symbolic` where relevant, `examiner-alignment` (which finding each item exercises), `copy-shingle` (state that you compared against the corpus you read), `style-lint` (KaTeX compiles; British English; no "grade 9"; no "Wrong"), each with `by: "claude"` and an ISO `at`), plus `note.blocks.json`. Figures in questions and worked examples: `figures: [{ "kind": "svg", "src": "data:image/svg+xml;utf8,<svg …>", "alt": "…" }]` (encode `#` as `%23`, under 12 KB) or `{ "kind": "photo", "src": "/img/…", "alt", "licence", "credit" }` after fetching, or `svg-gen` with `generator: "histogram" | "axes" | "table"` (shapes in `src/components/figures/generated.tsx`).

Finish by running `npm run content:check` (strict: every bundle must validate), `node scripts/qa/lesson-v2.mjs --unit <unit>` (every breach of the Lesson template v2 rules below, note by note; it must print 0 breaches before you file, and any examiner source it warns about is a Sheet trap you still owe), `node scripts/qa/figure-leaks.mjs --unit <unit>` (0 leaks before you file: every figure that prints an answer its own part asks for, in its text nodes or in its accessible text — the `<title>` a screen reader reads included; its REVIEW lines are for your judgement and do not gate) and `node scripts/qa/shingles.mjs --unit <unit>` (the three-paper test in non-negotiable 1; 0 breaches before you file), then reporting the published counts for your topic, the figures/photos/videos included, and any misconception ids not in the registry.

## Working files

Other authors share the scratchpad. Put every generator or temporary file in your OWN subfolder of the scratchpad (`scratchpad/<topic-or-unit-slug>/`), never at its root. Misconception ids: run `npm run insights:unregistered` before you finish (it exits 1 if any id you used is missing from the registry); add missing entries to the registry SOURCE module `pipeline/mine/insights-source/<subject>.misconceptions.mjs` (use the MX() helper for entries carried by extraSources), then run `npm run insights:build && npm run insights:validate`. Never edit the generated `packs/*/insights/misconceptions.json` directly.

## SVG rule

Authored SVGs must not contain `<style>`, `<script>`, event handlers, external hrefs or `prefers-color-scheme` rules (an inlined `<style>` applies to the whole page and would recolour every icon). Draw with `stroke="currentColor"` / `fill="currentColor"` and `fill-opacity` for tints, give every SVG a `viewBox`, and let the page colour it. Text inside SVG: `font-family="inherit"` and `fill="currentColor"`.

## Printed numbers

Never interpolate raw JS floats into text (a G7 review found "14.850000000000001" in a worked example). Format every printed number with a rounding helper (toFixed or a fixed-decimals formatter) and print an intermediate value only as the rounded form of a value your generator computed; retyping intermediates by hand is how printed working goes wrong. Exam-style questions that continue from a previous part must use the stored, unrounded value in the solutionProgram.

## Answer forms (algebraic AnswerSpec `form`)

The algebraic AnswerSpec has an optional `form` field, checked only after the answer is found equivalent and taking precedence over `mustBeFactorised` / `mustBeExpanded`: `"factorised" | "expanded" | "simplest-fraction" | "completed-square" | "y=mx+c" | "surd-rationalised" | "single-fraction" | "integer-coefficients" | "subject"`. Use `form: "subject"` on every make-the-subject answer (spec latex `x=\frac{w}{4}`): the spec's left-hand symbol must then be alone on one side of the student's equation and absent from the other, so `4x = w` and a bare `w/4` are marked as the right relationship in the wrong form, with feedback naming the subject. Use `"y=mx+c"` for equation-of-a-line answers and `"completed-square"` where the form is the mark. The `order` answer kind is live (drag-or-arrows list from a seeded shuffle): list the items in the correct order with `correctOrder` as the identity, or in any order with `correctOrder` as the permutation.

**Logarithm forms (engine, 20 Sep 2026).** The algebra marker treats logarithm expressions as equivalent under the log laws, so a plain algebraic spec pays full marks to an uncombined or an unexpanded answer. Two `form` values fix that, both on an algebraic spec with `equivalence: "equivalent"`, marked form-then-equivalence the way "y=mx+c" is: `form: "single-log"` for "express as a single logarithm" (exactly one logarithm, and the logarithm is the whole answer: a coefficient in front fails with "a number in front of the log belongs inside it as a power", two logs fail with "combine into one"; so 3 log 2x against log 8x^3 scores equivalent-wrong-form and log 4x^3 not equivalent) and `form: "expanded-logs"` for "write in terms of log a and log b" (no product, quotient or power inside any logarithm, order-free; log(a^2 b^3) and log a^2 + log b^3 both fail against 2 log a + 3 log b with "expand it: no product, quotient or power should be left inside a logarithm"). A "y = …" wrapper and a leading minus are read through; \ln and \log_2 count as logarithms. Probe both with your marker check before publishing. Tag a part with a form only where the answer itself has that shape: single-log only where the correct answer is one logarithm, expanded-logs only where it is a sum of separate logarithms, and no form at all on an in-terms-of answer such as 1 + 2p + q or on a value such as y = x^{3/2}, because either form rejects a correct answer that contains no logarithm ("Correct value, but the question asks for it as a single logarithm"). The natural reading, tagging every part of a logarithm topic, marks correct learners wrong. A third form, `form: "single-log-expanded"`, requires the single logarithm's argument multiplied out (log 8x^3 passes; log (2x)^3 and log(2^3 x^3) fail as equivalent-wrong-form), which is the Summer 2024 mark the majority lost; use it on "express as a single logarithm" parts whose scheme wants the argument simplified. Notation: log(2x)^{3} denotes (log 2x)^3, so write logleft((2x)^{3}ight) or log(8x^3) when the power is inside the argument, in the lesson as well as the answer line. Also engine-side now, no bundle change: "4 or −4" no longer scores the 4 (a second answer after the number is not a unit); "1/2 log n" is half of log n; a find-the-mistake fix must state a value. An equivalent answer in the wrong form (equivalent-wrong-form or not-simplified) keeps every mark but the last on a multi-mark part and pays nothing on a one-mark part, so the working mark for a half-combined logarithm or an unsimplified fraction comes from the engine: never write a commonError pattern for it (an algebraic pattern matches by equivalence and would pay the mark to a learner who copies the question unchanged).

**Matrix answers (engine, 20 Sep 2026, matrix kind landed 16:35).** A whole-matrix answer is a `matrix` AnswerSpec: { "kind": "matrix", "rows": 2, "cols": 2, "entries": [["7", "10"], ["-3", "4"]], "tolerance": { "type": "absolute", "value": 0.0005 } }, tolerance optional (exact when absent), no unit key, each entry a number or a short algebraic expression (LaTeX or plain; marked by equivalence when it carries a letter or a backslash, so 0.75 equals three quarters and a2 equals 2a). A matrix commonError pattern is { "kind": "matrix", "entries": [[…],[…]] } and fires when every entry agrees, so the elementwise-product, rows-swapped, adjugate and 1/det routes can be diagnosed on the answer line. Marks are shared in proportion; a transpose is named and keeps the entries the swap left in place; a wrong size earns nothing and names both sizes. The learner may type any of pmatrix, bmatrix, Bmatrix, vmatrix, Vmatrix, matrix and smallmatrix, bare or inside $…$, a nested list [[1,2],[3,4]] or ((1,2),(3,4)), the plain grid "1 2; 3 4" the field submits, a name in front ("AB = …", "A^{-1} = …"), and any minus glyph. One limit: an array environment is not accepted. A scalar in front of the brackets is multiplied into every entry (a fraction, a decimal, a negative, with or without a times sign; fractions stay exact, so 2/5 marks against 0.4), which is how CCEA prints an inverse, so no stem needs to tell her to write the entries out. Two fatal lints: a matrix common error equal to the answer, and entries not matching rows × cols. Determinants and single entries stay numeric parts. Bundles written with the earlier table-per-entry encoding convert in one generator pass.

**Vector answers (engine, 20 Sep 2026).** An algebraic spec whose `variables` name both i and j is a vector: the learner may type 3i + 4j in either order, bold or hatted unit vectors, a two-row pmatrix or bmatrix column, a plain tuple "(3, 4)", or the vector followed by its unit (m/s, N, km/h and the rest), and a wrong vector is diagnosed as algebra (3i − 4j against 3i + 4j reads as a sign error). So a vector answer line needs no typed-form instruction; the unit stays in the answer-line text, because the algebraic spec has no unit field; whatever unit she types after the vector, tuple or column (N, m/s, m/s²) is read and ignored. A common error on a vector part reads every spelling the answer does (bold, column, tuple, with a unit), so one plain-spelling pattern per slip is enough. Bundles written before this date carry the older instruction and are converted in their next generator pass.

## Renderer limits

`h` blocks and figure captions accept inline $…$ maths but no **bold**; a **bold** span may contain a $…$ segment. Never put raw markdown in `alt` text.

## Answer-spec encodings that G7 rejected (would mark a correct learner wrong)

- A question with two roots is never a numeric spec holding the first root. Encode a solution set as kind "algebraic", latex "x=3, x=7" (comma-separated, the question's own letter), equivalence "equivalent", variables []; the engine accepts "x=7 or x=3", "3, 7", "7, 3", "x = 3 and x = 7" and gives partial-solution-set feedback for one root.
- A coordinate answer is never a numeric spec holding one ordinate. Use kind "text" with accepted forms such as ["(0, 7)", "0, 7"] (the marker strips brackets and commas); two points are two keyWords groups worth one mark each.
- "Write down the equation of any line parallel to …" has infinitely many correct answers: make the line unique in the stem ("… that passes through (0, 7)") or ask it as an mcq.
- Before you finish, run the app's own marker over every part (the standard-form author's `check-marking.mts` in the scratchpad is the model: import `markPart`/spec helpers from src/components/items and feed the correct answer in every natural spelling, then every commonError value) and fix every spec the engine rejects. A verification log that says "verified" without this check is not verified.

## Paired answers (simultaneous equations, intersection points)

The engine marks coordinate pairs as pairs. Encode as kind "algebraic", latex written as tuples: "(2, 3)" for one pair, "(1, 2), (-3, -6)" for two; equivalence "equivalent"; variables ["x", "y"] (the pair's actual letters if they are not x and y). Learners may type tuples in any order and spelling or assignments ("x = 1, y = 2 or x = -3, y = -6"); crossed pairing is rejected with feedback, a missing pair is reported as partial, a bare "2 and 3" is asked for the (x, y) format. Never encode a pair as two text keyWords groups or as one numeric. Pairs whose components are expressions in a parameter are not supported and stay self-marked.

Also from G7: a question that asks for two things (HCF and LCM; a and b; both bounds; minutes and seconds) never has a single numeric spec holding one of them: split the part, or use a text spec with one keyWords group per required value; and a commonError value must never coincide with the correct answer of its own part.

**Tuple tolerance (engine, 20 Sep 2026).** A coordinate-pair spec (an algebraic spec whose latex is a tuple) takes an optional `tolerance`, absolute and per coordinate, so "(0.83, −3.08)" earns (5/6, −37/12) with tolerance 0.01 and a miss says "check each coordinate against your working". Where the stem instructs an accuracy or a read-off from a grid, state a tolerance; the exact-terminating-decimal constraint applies only to a tuple spec that states none.

**Assignment spelling (engine, 20 Sep 2026).** A paired-answer commonError whose pattern is a tuple fires on the assignment spelling too, "p = 2, q = 3" as well as "(2, 3)", so one pattern per pair is enough.

## Distractor values by construction

Every numeric commonError value is produced by executing the error its feedback describes, as code in your generator (solve the wrong equation, apply the wrong operation, round where the learner rounds), and written into the bundle from that result; never type a distractor literal. Keep an independent script that re-executes every route against the published JSON and prints mismatches; a route that reaches no value means the feedback describes an impossible error, so change the feedback or drop the pattern. The M3 batch author's `error-routes.mjs` + `applyErrorRoutes()` + `verify-published.mjs` in its scratchpad is the model.

## Key words (text specs)

Key words are whole words or phrases; apostrophes are ignored (Benedict's = benedicts); a single word of 4+ letters also matches a closed list of inflections (denatured/denaturation, heated/heating, increasing, respiring/respiration, mitochondria, photosynthesising) but never a different word ("cell" is not "cellulose"); 3-letter words stay exact; phrases take only a trailing s. Make any[0] of every group a real word or number, because the "still missing …" feedback prints it ("denatured", not "denatur"). accepted[0] must earn every group: a near-paraphrase of the model answer is what she will type, and content:check prints a KEYWORDS line for any group no accepted answer can earn (your bundles must produce none). Key words are presence-based, so a part that assigns several labels (A/B/C, P/Q/R) must be split into one sub-part per label or a swapped assignment scores full marks. Regexes in commonErrors never use greedy `.*` across list items; use `[^;\n]*`. In `order` parts, commonError regexes are tested against the arranged item texts, not indices.

## Accuracy tolerances vs instructions

A numeric tolerance of type dp or sf is a closeness test only: 1.8, 1.80 and 1.804 are all right for "1.8 to 2 d.p.". The engine enforces the written form (too many places wrong; dropped zeros right, with a "write 150.00" reminder) only when the part's stem contains an instruction sentence starting Give / Write / Work out / Calculate / Find / Round / State / Express that mentions decimal places, significant figures, d.p., s.f. or nearest. A given such as "6.4 cm, correct to 1 decimal place" is not an instruction. So use dp/sf freely as tolerances, and when the paper demands the accuracy say so in the stem in those words.

## Values of x: solution sets, not key words

A part whose answer is two or more values of one letter ("find the values of x", ±6, the roots of a quadratic) is an algebraic solution set: latex "x=6, x=-6" (or "x=\frac{7}{4}, x=-\frac{11}{4}"), equivalence "equivalent", variables ["x"]. The engine parses "x=6 or x=-6", "6, -6", "±6" and "\pm 6", reports a partial set, and needs no key words; never encode such a part as a text spec with key-word groups.

## Transformation drawing parts (graph specs, plot "transformation")

These parts are interactive: the learner taps grid points to place the image's vertices (or types them) and the set is compared with `expect.image` order-free; wrong shapes are matched against a library of single transformations, so the feedback names what she drew against what was asked. A graph commonError fires only when its `test` text lists the wrong image's vertices explicitly ("image drawn at (-3, 1), (-8, 1), (-3, 4), the reflection in the y-axis"); descriptive tests never fire. Keep the stem phrasings "the line $y = x$", "the line $x = 2$", "about the origin", "centre $(2, 2)$" so the grid draws the mirror line or centre. Multi-stage items mark only the final image. Histogram, points-line and curve plots still self-mark against the worked solution.

## Two-stage transformations: two parts

A two-stage instruction ("reflect in y = x, then translate 6 left and 4 down; label G′ and G″") is two graph parts, not one: (a) "Draw G′, the image after the reflection" [marks] with expect.object = G and expect.image = G′; (b) "Draw G″, the image of G′ after the translation" [marks] with expect.object = G′ and expect.image = G″. The grid then marks each stage on its own, shows G′ as the object of (b), and names the wrong single transformation at each stage; as one part only the final image can be marked and a correct first stage scores nothing, where the paper gives its marks.

## Rate units

Composite rate units ("°C per minute", "m² per week", "breaths per minute", "counts per second") are encoded as numeric specs with `unitRequired: false` and the unit written in `unit` exactly as CCEA prints it on the answer line; the parser reads a unit phrase typed after the number and matches spelling variants ("breaths/min" = "breaths per minute"), and a plain "cm³" against "cm³ per minute" is reported as the wrong unit.

**Rate unit phrases (engine, 20 Sep 2026).** "0.5 g/s", "0.5 g per s", "0.5 g s⁻¹", "2 s⁻¹" and "2 s^-1" all parse as unit phrases: a one-letter unit counts when a slash, a power or "per" follows it, while a bare letter after a number is still a variable. Specs may carry g/s, cm³/s and s⁻¹ as units; probe the spelling you use in your marker check as before.

## Template leaks

Before every build, grep every file you emitted for the two characters `${`: an unexpanded generator placeholder in learner-facing text is treated as INVALID by pipeline/build-content.mts (the bundle is skipped and content:check exits 1 for everyone). Also re-read every worked example's FINAL line against its own stem, and check that every `$…$` pair opens and closes on the same line.

## Dead commonErrors and other fatal structural checks

pipeline/build-content.mts rejects (INVALID) a bundle with: duplicate option texts in one multiple-choice item; a numeric or algebraic commonError whose value the part's own spec would mark correct, so it can never fire; a numeric value carrying a floating-point artefact (0.9299999999999999). A commonError with the right value is fine when the spec demands a surd, π or a simplified fraction (the decimal is marked wrong on form first) or when the stem instructs the accuracy in words and the ERR carries the unrounded value; it is dead when the tolerance alone would accept the wrong route's number, so tighten the tolerance, move the numbers apart, or drop the pattern.

**Unit omitted (engine, 20 Sep 2026).** The one live pattern on the correct value: when a part has unitRequired, a numeric commonError whose value is the correct number and whose pattern carries no unit fires on the bare number ("108" against "108 m²") and the lint no longer reports it as dead, so encode the unit-omitted slip as a numeric pattern with the feedback naming the unit the scheme wants.

## Dollar placement: no prose inside a maths segment

An even dollar count is not enough. "by scale factor -2$ with centre (0, 1)$" renders "-2" as prose and " with centre (0, 1)" as maths; write "by scale factor $-2$ with centre $(0, 1)$". Lint every string you emit for a maths segment that contains ordinary words (with, and, the, so) and for a "$" that follows a digit with no opening partner ("of 2$ would").

## Graph drawing parts (points-line, curve, histogram)

These graph answers are drawn on an interactive grid and auto-marked, so the encoding has teeth. `points-line`: `points` are the table's points, each marked within the spec's absolute `tolerance` in data units (half a small square is the usual choice; the grid draws five small squares per labelled step); `lineThrough` with exactly two points plus `lineRequired: true` means "lay a line" (she taps two places and the line must pass within tolerance of both points); `lineThrough` with more than two points, or `lineRequired` with no `lineThrough`, means "join the plotted points". `curve`: `samples` are marked as plotted points and the field draws one smooth curve through them; keep samples at the table's x-values only. `histogram`: one height per bar within `scaleTolerance` (absolute frequency density); feedback names each wrong bar. Marks are shared in proportion over the elements, so a 3-mark part with 6 points awards 0/1/2/3 for 0–1, 2–3, 4–5, 6 correct. Graph commonErrors for these plots are descriptive only. Region, box and best-fit plots still self-mark against the worked solution.

Box plots: answer kind "graph", expect { plot: "box", min, q1, median, q3, max, tolerance: { type: "absolute", value } } with the tolerance in data units (half a small square of the printed scale); each of the five values is one element and the feedback names each wrong one. State the scale's intended range in the stem or figure text when the data do not make it obvious, and keep "work out the quartiles" and "draw the box plot" as separate parts.

## No NaN in figures

A figure whose path or rect carries "NaN" or "undefined" passes the schema and renders half-drawn (a render crawl found box plots with whiskers but no box). Assert in your generator that no emitted SVG string contains "NaN" or "undefined", and view at least one figure of every kind in the running app before you file.

## Lesson template v2 (supersedes the hook and callout rules above where they conflict)

The learner tried the platform on 13 Sep 2026: she liked the videos and interactive questions, disliked being tested before being taught, and found topics "not well structured, intense or attractive for someone learning the topic for the first time". From now on every note is written for a first-time learner, in this order, and the Sheet is a reference panel at the END, not the opening:
1. Hook (≤ 60 words): what the idea is in plain English and where she meets it in life or in an earlier topic. It must NOT name a tariff, a series, a question number or an examiner verdict, and no callout may appear before the second teaching paragraph.
2. One figure before word 80, and one visual (figure, photo, video or sim) in every section after that; the first figure is the topic's hero image, so make it the clearest single picture of the idea.
3. Sections numbered and short (≤ 120 words between gates), each ending in one gate; concept before procedure; every method step carries its reason; at least one `why` callout in the body and at most one `examiner` callout in the body (the rest go to the end panel).
4. A fully worked example inside the note by section 4, before the first demanding gate, then completion (faded) work, then unaided practice.
5. A recap card of three to five lines ("You can now…") before the practice.
6. "In the exam" as a short closing panel, then the retrieval prompts. The panel is a pointer, not the reference: one heading and one paragraph of at most 80 words saying how the question is usually worded, what the first mark is for, what the last mark is for, and what to write when stuck, followed by the prompts; at most 150 words in all, prompts included, and no gate is needed inside it. The full reference lives in the Sheet (bundle.note.sheet: mustBeAbleTo, howExamined, and one traps entry per examiner finding), which the page renders as its own "In the exam" section and which the reviser path opens first, so the panel never repeats a trap the Sheet holds. At most one examiner callout stands in the teaching body, beside the step it is about; every other examiner finding is a Sheet trap, never a callout in the closing panel. A spec callout is not repeated in the panel either: the page's Specification card carries the statements. The lesson spine shows minutes per section, and a long closing block would read as the longest section of the lesson, which is the wrong signal for a pointer.
Diagnostics: 3–4 prerequisite items tagged `when: "pre"` (no confidence needed, honestly labelled as things she is not meant to know yet) and the rest tagged `when: "post"` for the check after instruction, where confidence and hypercorrection belong.

## Key words must cover the worked solution

Every text part is key-word marked on screen. Feed each part its own workedSolution as if she had written that paraphrase: it must earn full marks. So every key-word group includes the phrasing the part's own worked solution uses (a group wanting "longer at Moira" must also accept "callers to Moira waited longer"), and an "explain" group accepts the reasoning words as well as the bare number ("112" and "angles in the same segment"). Add this check to your marker self-check script.

A conversion pass over an existing note (template v2 applied after the fact) may not grow the note by more than 10% measured across the whole note, panel included; a gate moved out of the closing panel into the body is the same words in a better place and is not growth.

## Hero block (first block of every note)

The first block of note.blocks.json is `{ "type": "hero", "lede": "<the hook, ≤ 60 words, plain English, no tariff, series or examiner verdict>", "can": ["<three lines starting with a verb: what she can do by the end>", "…", "…"], "minutes": <the note's reading-and-checks time only: its words at 180 a minute plus 40 seconds per gate, not the examples, practice or exam-style work; the app computes and shows this figure itself and uses yours only when a note cannot be measured> }`. The topic page reads it for the opening screen (title, lede, the three lines, the note's first figure, the estimate, the two buttons); the lesson renderer ignores it. The hook paragraph that follows may repeat the lede's idea in fuller words but must not be identical.

## Chemistry notation and units

Charges: the engine reads Fe^{3+}, Fe^3+, Fe³⁺ and Fe3⁺ as one thing (a plain digit before a superscript sign is the charge; a subscript digit before it stays in the formula, as in NH₄⁺); plain "Fe3+" with an ASCII plus is ambiguous with the reaction plus and is not read as a charge, so write charges with the superscript sign in stems. Word equations are text specs with one key-word group per product (CCEA marks point per product); symbol, ionic and half equations are equation specs (case-sensitive, as chemistry is). Percentages: a numeric spec with unit "%" accepts "45" and "45%"; keep the unit.

**Ion charges (engine, 20 Sep 2026).** Key-word matching folds a superscript charge, so Cu²⁺ and Cu 2+ read as cu2+ and SO₄²⁻ as so42-: key one spelling per ion and let the engine fold the rest.

## Table, steps and label answers (auto-marked on screen)

`table`: one input per expected cell, named "Row r, column c" counted from 1 as the figure reads; each cell numeric within its tolerance or text after normalisation; marks shared in proportion; feedback names the cell. `steps`: an order field over `expectedOrder`. `label`: a select per target drawn from the bank, feedback naming each target; give every target a roman, letter or number id with a position on the figure ("(i)" at the nucleus), never an id that spells the answer (an id like "enzyme" is shown as "Label n" by position so it does not leak, but the feedback then reads worse). Only `text-long` (QWC, a band surface is coming) and the three drawing parts remain self-marked.

## Roles, rejects and boundaries (from the B1 reviews)

Key words are presence-based, so a group of bare role words lets a swapped answer score ("denitrifying bacteria turn ammonium into nitrate" would earn "denitrifying" and "nitrate"): write role-bearing phrases ("nitrifying bacteria make nitrate") and add rejects for the swap. A reject word takes inflections like a key word: never reject "high" or "decreases" when "higher" or "the rate of increase decreases" is a correct answer. Set listingRule false where the model answer is a prose pair ("amino acids and proteins", "bacteria and fungi"). Every commonError regex uses word boundaries ("\bnitrification\b" must not fire inside "denitrification") and never matches the part's own accepted answers. A find-the-mistake item has exactly one wrong line. Use CCEA's own terms ("selectively permeable", "association neurone") and put a `notonspec` note beside anything beyond the specification (nitrites, lightning fixation).

**Nature and sign (three bundles, 20 Sep 2026).** A "state the nature" part (maximum or minimum, increasing or decreasing, real or not, acid or alkali) keys the conclusion word together with the value in one group, and accepts the symbolic spellings of the test ("> 0", "< 0", "positive", "negative") as the sign spellings; never key the sign word alone, because "12 is positive so it is a maximum" then scores full while "d²y/dx² = 12 > 0, so it is a minimum" scores 0. Add reversal fixtures for every such part.

## Prompts, tolerances and signs (from the FM2 review)

A retrieval prompt's key words must appear in its own answer (never require "area" when the answer says "the space under the graph"). A graph-reading tolerance is half a small square of the printed grid, never a whole one. Where the scheme accepts a negative acceleration for a deceleration, add a deceleration-sign commonError with the marks it typically earns rather than scoring 0. Prerequisite (`when: "pre"`) distractors carry no topic misconception tag unless the slip is that misconception. A "value of U" part where the paper prints no unit carries no unit in the spec. Every distractor's feedback must describe the route that produces its value (check them together, in the generator).

## QWC (text-long) answers

Six-mark QWC parts are answered on screen: she writes in a textarea, the engine lists the indicative points with the key word it found quoted under each ("Evidence found for 4 of 7 points … Not yet: carbon dioxide, water, heat. On the descriptors that is band B, 3–4 marks"), then she bands it herself against the descriptors and awards the mark within the band. So each `indicativeContent` point needs key words a candidate would actually write (the evidence is only as good as those spellings, the same rule as key-word groups); the bands' mark ranges must tile the tariff with no gaps; `minWords` is optional but shown when present; a mark point's `examinerNote` is rendered under the solution, so author it. Only the three drawing parts in the corpus remain paper-marked.

## Plotted-point commonErrors and unit scope

Graph commonErrors on plotted-point parts fire when their `test` names the misplaced point(s) with computed coordinates ("point plotted at (6.4, 12)"); descriptive tests do not fire. A stem that gives bare coordinates must state the units it assumes ("with displacement in metres and time in seconds") before a scheme or feedback quotes them. Distractors whose slip is arithmetic or a unit conversion carry no topic misconception id unless the registry has one for that slip. Further Maths Mechanics uses m and m/s throughout; km/h ↔ m/s conversion is GCSE Mathematics content and appears in no FM2 paper, so at most one conversion item with a `notonspec` callout.

## Cross-board enrichment

CCEA topics overlap heavily with AQA, Edexcel and OCR, and those boards have the richest teaching material. Two files carry what we have learned from them; read both before writing.

1. **The crosswalk row.** `data/enrichment/crosswalk.json` has a row for every Maths and Science topic (`topics[]`, keyed by `slug`). Read yours first: `status` (matched / partial / ccea-only), `scope.beyondCcea` (what the other boards examine here that CCEA does not: keep it out of the teaching body, or mark it `notonspec` if it is the only way to make sense of a video she will meet), `scope.cceaOnly` (what CCEA examines that they do not: expect no outside resource to cover it, so our own treatment has to be complete), and, on maths rows, `tierOnOtherBoards` (science rows give `ccea.tier` and `ccea.higherOnlyOutcomes` instead; a topic that is Foundation on AQA and Edexcel but Higher on CCEA is pitched for a first-timer in their material; one that is Higher-only elsewhere will be explained at a level above hers). The method behind the rows is docs/research/11-cross-board-enrichment.md; the medium-confidence rows are listed there.
2. **The dossier, when one exists.** If data/enrichment/<subject>/<slug>.md exists for your topic, it lists the matching spec points on the other boards, the best angles, analogies, representations, practical variants, question types and misconception framings found in the strongest resources (Save My Exams, Physics and Maths Tutor, Cognito, Freesciencelessons, Isaac Physics, Dr Frost, Maths Genie, Bitesize's other-board pages, Khan, the RSC and IOP teacher material), and candidate photographs with their licences checked. Use it to make the lesson richer, not longer: recreate the best representation as your own computed figure, borrow the analogy in your own words, add the practical variant if CCEA examines it, and mark anything beyond the CCEA specification `notonspec`.

Never copy text; never use a photograph without CC0 / CC BY / CC BY-SA and the credit fields; CCEA's scope, terms and mark language always win. When the dossier says a resource in our media map spends most of its time beyond CCEA (the menstrual-cycle videos are three-quarters FSH and LH, which CCEA does not examine), say so in one `notonspec` callout beside the video rather than teaching the extra material.

## Method marks are live (WorkingLadder, 20 Sep 2026)

Under a numeric, algebraic, equation or mcq part whose scheme carries a method or process mark (M, MA, MW, W, P), the app shows a "Show your working (optional)" box, collapsed on the lesson path and open on exam-style parts and on any part with requiresWorking. When the answer is not fully right, each line she typed is matched against the mark point's own wording (boilerplate such as "seen", "oe" and "(accept …)" trimmed; each alternative of an "A or B" wording separately; the authored `accept` spellings; the maths inside a prose-worded point; and the worked-solution line that pairs with the point when unambiguous), by the step comparer or, maths against maths, by algebraic equivalence; each step takes one line and each line is spent once; the recorded mark is the higher of the answer's award and the method marks earned, never a sum. So a method point's `text` and `accept` spellings are what she is matched against: write them as the line an examiner would tick (the substituted expression, the factorised form, the equation set up, the correct formula with the values in), one alternative per `accept` entry, and expect a prose-worded point to be paid by the maths inside it. Keep the worked solution's line for that step in the same form as the point, so the pairing is unambiguous. A corpus sweep with six lines of noise paid a mark on 6 of 2,426 parts, each a point that genuinely is the number typed, so the ladder is not loose; do not pad points with alternatives that are not a real examiner line.

**Marker harness cwd (20 Sep 2026).** src/components/items/index.ts re-exports Tex, which reaches @/lib/math/Math (a .tsx), so a check-marking harness that imports the marker from src/components/items must run with the repository root as its working directory and the repository's own node_modules/.bin/tsx; a cached npx tsx, or a run started from a scratchpad folder, fails to resolve the alias with "Cannot find module '@/lib/math/Math'", which is not a content fault.

## SVG paths must draw

A review found figures whose path data had been written as text inside a <g>, so the published figure was empty axes. Assert in your SVG builder that every <path> carries a `d` attribute, that no <text> node contains path data, and that every figure decodes to at least one drawn shape; render every figure kind once in the running app (or through a headless decode) before you file. Never print the answer to a question inside that question's own figure (a value on the graph or bar the part asks for).

## Algebraic key words

A key word that carries a digit and an operator ("(2x - 1)(x + 3) = 30", "x^2 + (x + 17)^2 = 25^2") matches with the spaces around + − / ^ * ignored on both sides, and a typed ² or ³ reads as ^2 or ^3 in text matching, so one spelling per working line is enough: do not list spacing or superscript variants. Prose key words are untouched (a hyphenated word must be hyphenated).

## Regression guard for reviewed marking

When a review names reversed or paraphrased responses (a swapped direction that scored full marks, a correct paraphrase that under-earned), keep them as fixtures in your marker check: every reversed response must stay at or below the cap the review gives, every paraphrase must reach full marks. Figures that annotate the answer belong in the note only; the question's copy of the same figure is generated unannotated (`annotated: false`) and a worked example's results table blanks the rows the example asks for.

## File timestamps

Write every output file normally so its modification time reflects the change; never restore or copy timestamps (a regenerated bundle that still carries its old mtime hides a landing from the reviewers, who verify by content hash as a fallback). State the content hash of each emitted file in your final report.

## Gates stand alone

Every recorded answer now creates a review card, and a note gate comes back on its own in the review inbox with the nearest preceding figure or photo attached. So write each gate so it reads correctly with only that visual for company: name the thing ("On the cumulative-frequency curve, …", "In the food web shown, …"), never "as above" or "the previous section"; a gate that needs a figure must have one before it in the note (run `node scripts/qa/gate-context.mjs`); a gate that depends on a number in the prose restates it.

## Rejects are not a direction check

A reject list catches only the exact spellings it names, and one copied onto every key-word group zeroes correctly earned marks whenever a phrase the correct answer must contain appears in it. Never fix a reversed-direction defect by adding rejects to every group: key each group to its own subject (the vessel, the side, the chamber letter, the substance) as a role-bearing phrase ("chamber D pumps blood round the body", "water leaves the cell"), so the swap earns nothing because the phrase it needs is absent, and keep rejects for the one or two spellings a swap would otherwise share. Rejects inflect like key words ("decreases" rejects "decreasing"), so never reject a word the correct answer may use in another form.

## Phrases match word for word

A multi-word key word matches word for word; the trailing-s tolerance applies only to the phrase's last word ("rabbit number" does not earn "rabbits number"; write the form the answer uses). Under listingRule true, an answer whose comma- or "and"-separated segments are all four words or fewer is treated as a list, so a model answer that is really a prose pair must either be longer than that or the part must set listingRule false.

## Depth standard (22 Sep 2026)

The owner's judgement on 22 Sep 2026, after reading fm1/algebraic-fractions-simplify: the start is very good and strong and we need more like this; what we have is not enough, and for complex topics it is far too little. This section is the written standard that follows from that judgement. It binds every topic authored from now on and every depth pass over a published topic. Where it conflicts with the size guides in non-negotiable 5 and in author-unit-batch.md, this section wins; template v2 (the hero, the hook, the 120-word gate rhythm, the recap, the 80-word pointer) stands unchanged underneath it. The reasoning, the evidence from the FM1 papers and the corpus measurements are in docs/plan/review/2026-09-22-depth-standard.md.

**The principle: depth is more sections, not longer ones.** A teaching stretch is still at most 120 words and still ends in a gate. A complex topic earns more stretches, one idea each, until every way the paper asks the topic has been taught, seen done and checked. What the paper actually asks is the measure, so before planning the note read every paper in the corpus for the statement and list each distinct shape you find. On FM1, for instance, a complex topic is examined as one part of a 12–17-mark chain whose parts depend on each other ("hence, using your answers to parts (i) to (v)…"), disguised in a context, with the method named in the stem ("using calculus", "using a matrix method", "by completing the square") and the marks locked to that method. A lesson that stops at the routine case has taught a third of the question.

**Fun** here means interaction and consequence — something to do on every card and a visible result of doing it — never decoration.

### Teach before you check (the owner's ruling, 24 Sep 2026)

The owner, after watching the lessons run: a good teacher teaches the topic and makes sure it is understood, and only then do the questions follow. A string of questions she has not been taught to answer is not a lesson. So, in every note, every Slides deck and every Read page:

- **A gate comes only after the idea has been explained and shown worked in front of her, step by step, in that section**, so that she can answer it from what she has just read and seen. Never ask about something the section has not yet taught.
- **A section is explain, then show, then check.** Explain: the idea in words, with its one honest "because" (a paragraph, or a titled `why`, `mustknow` or `examiner` callout). Show: the idea carried out in front of her (worked lines, a figure the prose reads, a video or a sim). Check: the gate. A section may run several cards of explanation and demonstration before its one check; a "See it done" section is the show step of the section above it, and a heading with no gate of its own does not close a section (its teaching runs on to the next gate), while a gate does: teaching that came before an earlier check is not counted again for the next one.
- **"A gate at most every four cards" is a ceiling, never a quota.** No gate is ever added to meet a count. Use fewer, better-placed checks: one gate that tests what the section has just taught is worth more than three that arrive before it has taught anything.
- **A miss re-teaches before it shows the answer.** A gate's `explain`, and every feedback string on a miss, gives the explanation again in other words, pointing at the figure or the worked line, and only then states the expected answer; it never only marks.
- **The questions proper follow the teaching**: the worked examples, practice, exam-style questions and find-the-mistake items come after the note has taught the idea, as they do in a classroom, never before it.

`node scripts/qa/lesson-v2.mjs --teach` lists every gate that comes before its section explains and shows the idea (the definitions it applies are in `scripts/qa/teach-show-check.mjs`); it is a warning today and part of every depth pass. A studied design case for the card grammar is being prepared for the owner; until it is approved, these bullets bind as written and are applied by judgement where the lint cannot see.

### Bands

Bands follow the taxonomy `difficulty`: **L** = 1–2, **S** = 3, **H4** = 4, **H5** = 5. (`hardness` L/S/H stays the bundle-size label; H splits by difficulty because a 4 and a 5 are examined differently.)

### The note: sections, their roles and their order

Every heading block carries a `role`, so a reader, the lint and the Slides renderer know what each section is: `{ "type": "h", "text": "…", "role": "idea" | "why" | "variant" | "see" | "twists" | "further" | "derivation" | "recap" | "pointer" }`. The renderer ignores the field; the lint reads it; a note without roles cannot meet the section floor. The order is fixed:

1. **Hook and hero figure** (template v2, unchanged): the hook ≤ 60 words, the hero figure before word 80.
2. **`idea`** — what the thing *is*, before any procedure: the one honest "because" and one representation she can picture. Ends in the easy first gate.
3. **`why`** — why it works. L and S: a `why` callout inside the idea or the first variant section is enough. H4 and H5: a section of its own with its own gate, because a complex topic's "why" is what lets her rebuild the method when the paper disguises it.
4. **`variant`** sections, one per method variant, each taught and gated separately. A variant is a distinct case that the scheme marks differently or that the papers set as a different shape: for simplifying algebraic fractions, common factor / quadratic / difference of two squares with a coefficient / cubic with the common factor taken first; for equilibrium, on the flat / on a smooth slope / on a rough slope / three forces with an unknown angle; for enzymes, temperature / pH / concentration / inhibitor. A variant belongs to the topic's own statement (`topic.statementIds`); a neighbouring statement's method is never a variant here: it comes in as a twist, inside the synoptic chain and as a tail-only item in the mixed tail. Each variant section holds the steps with the reason for each, one figure or worked line where the variant is visual, and one gate that tests that variant and no other. Order the variants from the routine case to the case the paper's hardest recent question set.
5. **`see`** — "See it done": the method carried out at writing speed. L and S: one section, a video clip (with `start` and `end`) or up to six worked lines, followed by a gate. H4 and H5: one per variant, either its own "See it done" section after the variant or six worked lines inside the variant section; show the paper's most recent shape of that variant. The lint counts a variant section as shown when it holds a video or a paragraph of two or more working lines: numbered ("Step 2."), bold-labelled ("**Differentiate**"), or a maths step (inline maths with an equals sign, or maths joined by "so", "becomes", "gives" or "then"). Every video is followed by a gate.
6. **`twists`** — "Exam twists": the ways CCEA disguises the topic, taken from the papers. One short paragraph per twist (≤ 40 words): the shape of the wording, what it is really asking, and the first line to write; the series cited as evidence (patterns, never the board's wording). Ordered by frequency. Ends in a choice gate that shows a twist and asks for the method or the first line. L: ≥ 1 (it may live in the pointer); S: ≥ 2 in a section of their own; H4: ≥ 3; H5: ≥ 4, and every twist the corpus has set at least twice.
7. **`further`** — "Going further": where the specification goes further than the routine case. Required for H4 and H5, optional for S, none for L. It holds the hardest shape the papers have set for the statement (the 6-mark simplify with four quadratics; the 8-mark three-unknown word problem; the six-part curve chain), one worked chain of ≤ 120 words with a gate, and the `notonspec` callout that marks where the specification stops.
8. **`derivation`** — where the specification expects it: a formula she must know (bundle.note.formulaSheet.mustKnow) that can be derived in six lines from something she already has, or a statement whose Teacher Guidance says derive, prove or show. A section with its own gate; for L and S it may be the `why` callout when the derivation is one line. Proofs the Teacher Guidance excludes (the circle theorems) get no derivation section and a `notonspec` line instead.
9. **`recap`** — "You can now", 3–5 lines (H bands 4–5): what she can now do, one line per variant, though a line may cover two variants that share a method, and one line for the twists. Five lines is the cap, because the recap lines are the Slides way's closing cards.
10. **`pointer`** — "In the exam", one paragraph of ≤ 80 words, then the retrieval prompts.

Per band (teaching sections are the headings before the recap; gates are counted in the body):

| | L | S | H4 | H5 |
|---|---|---|---|---|
| Teaching sections | ≥ 4 | ≥ 6 | ≥ 8 | ≥ 10 |
| Gates in the body | ≥ 5 | ≥ 7 | ≥ 10 | ≥ 12 |
| Words in the note (guide) | 450–750 | 600–950 | 850–1,300 | 1,000–1,600 |
| Variant sections | ≥ 1 | ≥ 2 | ≥ 3 | ≥ 4 |
| Why | callout | callout | section | section |
| See it done | 1 | 1 | one per variant | one per variant |
| Exam twists | ≥ 1 | ≥ 2 | ≥ 3 | ≥ 4 |
| Going further | – | optional | required | required |
| Derivation | where expected | where expected | where expected | where expected |
| Recap lines | 3–5 | 3–5 | 4–5 | 4–5 |
| Visuals (figure, photo, video, sim) | ≥ 3 | ≥ 4 | ≥ 6 | ≥ 7 |

### Worked examples, practice, exam-style, mistakes, retrieval

| | L | S | H4 | H5 |
|---|---|---|---|---|
| Worked examples (one per variant) | 1 | 2 | 3 | 4 |
| Practice items: ladder, then the mixed tail | 6 | 8–10 | 12–16 | 14–18 |
| Practice rungs at difficulty 4–5 | – | ≥ 1 | ≥ 3, one at 5 | ≥ 5, two at 5 |
| Mixed tail (a `sets` entry, unlabelled, shuffled; H bands with ≥ 1 tail-only item) | – | ≥ 3 items | ≥ 4 items | ≥ 5 items |
| Exam-style questions | 1 | 2 | 4 | 4–5 |
| Multi-part among them | – | 1 | 2 | 3 |
| The synoptic question | – | – | ≥ 3 parts and ≥ 8 marks | ≥ 4 parts and ≥ 10 marks |
| Find-the-mistake (different findings) | 1 | 2 | 3 | 3 |
| Retrieval prompts (a minimum; no maximum) | ≥ 4 | ≥ 6 | ≥ 8 | ≥ 10 |
| Prompts embedded in the note (the owner, 24 Sep 2026) | 1–2 | 1–2 | 1–2 | 1–2 |
| Diagnostics, pre / post | 3 / ≥ 1 | 3 / ≥ 3 | 3–4 / ≥ 5 | 3–4 / ≥ 6 |

The rules behind the table:
- One worked example per method variant, each with a twin, two faded versions (`faded` of length ≥ 2, backward: the last step hidden first), at least one `whyMenu`, and `earns` on every step that carries a mark. Its stem is the paper's most recent shape of that variant, never a textbook one.
- The practice ladder runs rung by rung to the A* boundary: every difficulty from 1 to the band's top has at least one item; within a rung the items are minimally varied (one thing changes: a sign, a coefficient, where the unknown sits); the top rung matches the hardest shape the corpus has set for the statement. Then the mixed tail: the variants shuffled and unannounced, plus at least one **tail-only** item, so she has to choose (research 06 §5). A set can only hold this bundle's items, so a tail-only item is a practice question of this bundle that is not a ladder rung: listed last in `questions[]`, with `"mixed-tail"` in its `emphasis`, and for H bands at least one whose method comes from a neighbouring statement, which its `specRefs` name beside the topic's own. Encode the tail as a `sets` entry of kind `interleaved` or `mixed` with `showTopicLabels: false`; a tail that only repeats the ladder is not a tail. Sets drawn from other bundles wait for the practice agent (the loader reads one bundle, so cross-bundle sets need an item index in the manifest and a resolver in the loader).
- The exam-style set holds the paper's real shapes at the paper's real length: for H bands one **synoptic** question of the chain kind the corpus sets (the topic as one part, with a "hence", at least 3 parts and 8 marks for H4, 4 parts and 10 marks for H5), one question in a context, and the standalone shape. Schemes in the subject's mark language; a `methodLock` wherever the stem names the method.
- Find-the-mistake items come from different examiner findings, one wrong line each, seeded from the Chief Examiner's sentence and the series.
- Retrieval prompts cover every variant, every twist, the derivation and the must-know formula. There is no padding: every prompt is a fact she needs on the paper, because the review queue is her time.

#### Retrieval prompts: few, optional, short (the owner's verdict, 24 Sep 2026)

After trying the Slides way the owner ruled that the prompts she meets in a lesson must be optional, fewer and short-answer, never essay-like: one or two short recall prompts per topic, never four by habit.
- **The note wires one or two prompts, never more.** Choose the one or two facts she most needs to carry out of the lesson (the must-know formula, the step most often lost); the rest stay in the bundle for the review queue and are not wired into the note.
- **Every prompt is a short recall.** Its expected `answer` is at most 25 words: a term, a value, a formula, one line of method or one reason. A prompt whose honest answer is a paragraph is two prompts, or it is a question, not a prompt. Key words stay inside the answer's own words (the FM2 review rule above).
- **Optional means optional.** Never write a prompt the lesson depends on: nothing later in the note, no gate and no worked example, assumes she answered it.

`node scripts/qa/lesson-v2.mjs --prompts` lists every note that wires more than two prompts and every shipped prompt whose answer runs past 25 words (the definitions are in `scripts/qa/prompt-few.mjs`); it is a warning today and part of every depth pass.

### Minutes

The app's own minute model (src/components/topic/lesson-plan.ts: 180 words a minute, 40 seconds a gate, 2 minutes a worked example, 1 minute a check item, 1.2 minutes a mark, 2 minutes a find-the-mistake) gives what the standard implies. The hero's `minutes` is the note's own figure by that model, never a rounder number:

| | L | S | H4 | H5 |
|---|---|---|---|---|
| The note (reading and gates) | 6–8 | 8–11 | 11–15 | 13–18 |
| Learn: the note, worked examples, checks, practice, mistakes, prompts | 30–45 | 50–65 | 75–100 | 90–120 |
| Sit: the exam-style set, as a paper | 5–10 | 10–20 | 25–35 | 30–45 |

The guide is what the floor implies; a topic above its floor takes longer, and the lint prints the split (learn + sit) so the author can see where the time goes. The exam-style set is timed on its own because it is sat as a paper, after the learning and never in the same sitting (research 06 §15). An H topic's learn pass is itself two sittings: the pause block that lesson-plan.ts inserts is the first stopping point and the Slides way (below) is the second, so the note must split cleanly at a heading.

### Figures

- **One idea per figure.** A figure draws one thing; a second annotation is a second figure. Text drawn as a picture (a method card, a table of phrases, a five-row list, with or without a box or a rule round it) is not a figure: it is prose, so it goes in `p` blocks, where it scales, wraps and reads aloud. The lint judges it by the ratio of text to drawn shapes, with two guards so that an annotated graph is not caught: four or more text nodes, at least twice as many as the shapes drawn, no curve drawn (a card has a box and rules; a graph has its curve), and the text sentence-length.
- **Labels must survive the phone.** The renderer strips `width` and scales every SVG to the column, so a label renders at font-size × column width ÷ viewBox width. Make the smallest label at least 3.5% of the viewBox width (≥ 12.5 px in the 358 px column of a 390 px phone): a 400-unit viewBox with 14-unit labels, or a 560-unit viewBox with 20-unit labels. Prefer a phone-native viewBox of 360–420 units with 13–15-unit labels and strokes of 1.2–1.5 units; a figure that needs to be wider is two figures. Axis titles and point labels count; a long name goes in the caption. The `svg-gen` generators render labels at 6–7 px on a phone today: until they are fixed, author such figures yourself at these sizes.
- **Two copies.** The annotated figure (the arrows, the values, the answer) is for the note; the question, the twin and the diagnostic get the plain lettered copy (`annotated: false`, or a second generator call). figure-leaks.mjs prints 0 leaks before you file.
- **A worked example's own figure is seen with its steps hidden.** The app shows `we.figure` in the full example and again in the two faded versions and the problem version, where the later steps and the final answer are hers to write (the twin shows only `twin.figure`). So the worked example's figure draws the situation, not the working: never print a value a faded version leaves to her (the weight 60 N she is about to calculate, the area under the graph, the optimum read off the curve) or the final answer. The working belongs in the steps. figure-leaks.mjs lists every such value as a WE-LEAK line (a warning until the lead makes it fatal with `--we-fatal`); `npm run content:check` prints the same as a FIGURE warning.
- Every figure has an `alt` that says what is drawn and a `caption` of ≤ 25 words that can stand alone as a card's text.
- The figure comes before the paragraph that reads it, never after; two visuals never sit back to back.

### Long maths

Inline maths does not wrap. At 390 px a line of prose holds about 17 em of KaTeX and a worked-step line about 13 em, so:
- A list of numbers or coordinates is prose: write it outside `$…$` ("4.8, 5.1, 5.5, 6.2, …", the commas doing the wrapping) or as a table block or figure, never as one maths segment. No `$…$` segment carries more than 60 characters of TeX.
- A `\dfrac` whose numerator and denominator together exceed 40 characters, and any chain of two or more equalities, is display maths on its own line (`$$…$$`, which the renderer scrolls rather than clips) or is split: name the pieces ("Numerator: …", "Denominator: …", then the fraction), or take the chain across two steps.
- In a worked example a `working` line holds one step: the second "=" starts the next step.
- Never break inside `\left…\right`, a matrix or a fraction; break at =, +, − or before a new term.

### The Slides way (decision 9 of the platform programme, 23 Sep 2026)

Every topic has two ways in, Slides and Read, generated from the same note.blocks.json: the Slides renderer splits the note at gates and visuals and uses the recap and the pointer as its last cards. Write every note so it splits into cards without rewriting:
- **One idea per block.** A `p` or `callout` is at most 75 words; a 120-word stretch is two paragraphs, each a card.
- **Headings read as card titles**: at most 8 words, sentence case, no trailing colon. A number prefix ("2. …") is allowed; the spine strips it.
- **A figure or an interaction on every stretch that carries one.** A section whose idea is visual has its figure, placed before the prose that reads it; every section ends in a gate. A card is one paragraph, one callout, one figure with its caption, or one gate, never two of these.
- **A gate at most every 4 cards is a ceiling, never a quota** (the owner's ruling of 24 Sep 2026, "Teach before you check" above): a gate stands where its section has explained and shown the idea, never where a count says one is due; and every gate reads alone (the gates-stand-alone rule above).
- **The recap lines and the pointer are the closing cards**, so the recap is 3–5 short lines and the pointer is one paragraph.
- **Callouts carry a `title` of ≤ 8 words**: it is the card's title.
- A note over about 30 cards (the H bands) splits into two Slides parts at a heading. Put the natural break after the first "See it done", so part 1 is the idea, the why, the first variant and its example, and part 2 the remaining variants, the twists and going further.

### Measuring it: `node scripts/qa/lesson-v2.mjs --depth`

lesson-v2.mjs computes every count above from note.blocks.json and bundle.json, applies teach → show → check to every gate (`--teach` for the list, `--teach-fatal` to make a gate that comes first a breach), and checks that the prompts are few and short (`--prompts` for the list, `--prompts-fatal` to make a finding a breach). Without a flag it prints one summary line for each ("depth: N of M notes meet their band's floor"; "teach → show → check: N of M gates …"; "retrieval prompts: N of M notes wire more than 2 …"); `--depth` prints the report note by note (band, each measure against its floor, the section roles found, the Slides, figure and maths checks, and the minutes as learn + sit); `--json` carries the same under `depth`. Only shipped items count: an item whose verification log is missing, or whose status is not `verified` or `published`, is a draft the pipeline never ships, and the report says how many it left out. A shortfall is a warning, not a breach, until the lead promotes it with `--depth-fatal`. A topic filed from today must meet its band's floor, and its author pastes the topic's `--depth` report in the final message. Sections are recognised by `role`; a note without roles is reported as unlabelled and cannot meet the section floor.

### Depth passes over published topics

A depth pass adds; it never invalidates what a learner has already done or what a pre-read has verified. A pass may change: note.blocks.json (new sections, roles, gates with **new** ids, figures, captions, the hero), new worked examples, questions, find-the-mistake items and prompts with new ids appended, the Sheet's text, the insight text, and `sets`. What stays byte-identical: every published question's part `answer`, `scheme`, `commonErrors`, `marks`, ids, `totalMarks` and `skeleton`; every diagnostic item's id, options, correct flags and misconception tags; every find-the-mistake item's id, `studentWorking`, `mistakeLine` and `misconception`; every prompt's id, `answer` and `keyWords`; every worked example's id, step `input` specs, `earns`, `faded` and twin `answer`; every gate's id and `answer`; the topic id, slug and statement ids. Nothing published is deleted (a review card may point at it); an item found wrong is set to `withdrawn` in its verification log with the reason. The guard: snapshot the frozen surface before the pass and check it after (`node <scratchpad>/platform/depth-standard/frozen-surface.mjs snapshot|check`; 0 differences before you file), then the usual finish checks with `--depth`. The programme — pilot fm1/laws-of-logarithms and fm1/tangents-and-normals, then FM1 → FM2 → FM3 → M8 → M4 → M7 → M3 → C2 → B2 → B1 → P2, H bands first within each unit — is in docs/plan/review/2026-09-22-depth-standard.md.
