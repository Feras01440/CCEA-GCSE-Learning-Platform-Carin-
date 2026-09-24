# `data/spec/double-award-science.json`

Machine-readable version of Section 3 (Subject Content) of the **CCEA GCSE Double Award
Science specification (first teaching September 2017)**, with a Foundation/Higher tier flag on
every learning outcome (LO) and bullet, plus the 18 prescribed practicals.

## Provenance

| Item | Value |
|---|---|
| Source PDF | `docs/sources/science/DA-Science-spec.pdf` (132 pages, CCEA) |
| Pages parsed | PDF pages 11–107 (printed pages 9–105): units B1, B2, C1, C2, P1, P2 and Unit 7 incl. the prescribed-practicals list |
| Extractor | `scripts/extract-spec-pdf.mjs` — pdf.js (`pdfjs-dist`) text extraction that keeps font names, so bold/italic runs and x/y positions survive. Reusable: `node scripts/extract-spec-pdf.mjs <pdf> --from <page> --to <page> --out <json>` |
| Builder | `scripts/build-science-spec.mjs` — turns the line dump into the JSON below and prints per-unit counts, spot checks and warnings. Re-run with `node scripts/build-science-spec.mjs` |
| Hand overrides | `scripts/science-spec-overrides.json` — 6 outcomes whose PDF layout cannot be linearised automatically (see *Known caveats*). The automatic text is kept alongside as `autoText` |
| Cross-check | `docs/research/03-ccea-gcse-double-award-science-spec.md` §5 (human-written summary); LO numbering and counts agree exactly |

## How tier is decided

The spec (p.9) says: *"Content for the Higher Tier only is in bold. Content for the Foundation
Tier is in normal type. The 18 prescribed practicals ... are shown in italics."* In the PDF this
is literally font `Calibri-Bold` vs `Calibri` vs `Calibri-Italic`, so the tier flag is machine-derived,
not guessed:

* `tier: "H"` — every character of the outcome's *core* text is bold. `tier: "F"` otherwise.
* LO numbers, bullet glyphs (SymbolMT `•`), arrows (Wingdings) and trailing list connectors
  (`; and`, `or`, `, including:`) are always set in regular type in the PDF regardless of tier, so
  they are excluded before the test (otherwise every Higher LO would look "mixed").
* Bullets (and `−` sub-bullets) carry their own `tier`; a bullet can be `H` under an `F` stem
  (e.g. B1 1.4.2 "inhibitors…", B2 2.4.8 "test (back) crosses").
* `mixed: true` + `textMarked` — the stem/bullet is only *partly* bold. `textMarked` wraps the
  Higher-only phrases in `**…**` (e.g. B1 1.1.2 "…cytoplasm, **mitochondria as the site of cell
  respiration**, and cell and nuclear membranes"). 23 such items exist (20 stems, 3 bullets); they are genuine
  partial-Higher content in the spec, so a Foundation build should drop the marked phrase, not
  the whole outcome.

## Shape

```
{
  subject, subjectCode: "1370", cceaQualificationId: "584", source: {...},
  units: [ {
    code: "B1" | "B2" | "C1" | "C2" | "P1" | "P2" | "7",
    discipline, title, specSection: "3.1", duration, weighting, assessment, intro,
    sections: [ {
      id: "1.1" | null,           // null only for Unit 7 skill areas
      title,                      // prose heading (Title Case, e.g. "Photosynthesis and Plants")
      label,                      // left-column label in the table (e.g. "Photosynthesis and plants")
      intro,                      // "In this section, students ..." paragraphs
      topics: [ { label: "Microscopy" | null, outcomes: [ OUTCOME ] } ]
    } ]
  } ],
  prescribedPracticals: [ { code: "B1", unit: "B1", title, details: [], sectionId, topic, unitPage, appendixPage } ]
}

OUTCOME = {
  id: "1.1.2" | "B1" (practical) | null (Unit 7 skill),
  kind: "lo" | "practical" | "skill",
  text,                     // exact spec wording, lines re-joined
  tier: "F" | "H",
  bullets: [ { text, tier, mixed?, textMarked?, sub?: [ {text, tier} ] } ],
  practical: "B1" | null,   // see below
  page,                     // PDF page index (1-based)
  mixed?, textMarked?, table?, override?, autoText?, autoTier?, title? (practical only)
}
```

`practical` on an `lo` is set when the italic prescribed-practical bullet immediately follows that
LO inside the same table row/topic (e.g. B1 1.2.3 → `"B1"`, P1 1.1.1 → `"P1"`). The practical
itself is also emitted as its own `kind: "practical"` outcome in document order (its `id` is the
practical code), so filter on `kind === "lo"` when you want numbered outcomes only. Unit C2 has no
topic labels in the PDF, so its `practical` links are weaker (whole section = one topic).

Unit 7 (Practical Skills) has no numbered LOs: its four skill areas (Planning an investigation,
Carrying out an experiment, Analysing experimental data, Drawing conclusions from an experiment)
are `sections` with `id: null`, and each bullet is a `kind: "skill"` outcome. The
"Prescribed practicals" table at the end of Unit 7 is exposed as the top-level
`prescribedPracticals` array (18 entries, B1–B6, C1–C6, P1–P6) rather than as a section.

## Counts (from the build report)

| Unit | Sections | Topics | Numbered LOs | H | F | mixed | Bullets (H) | Practicals |
|---|---|---|---|---|---|---|---|---|
| B1 | 7 | 39 | 47 | 6 | 41 | 7 | 51 (15) | 4 |
| B2 | 6 | 41 | 51 | 3 | 48 | 1 | 85 (15) | 2 |
| C1 | 9 | 25 | 109 | 19 | 90 | 6 | 25 (0) | 2 |
| C2 | 9 | 9 | 73 | 22 | 51 | 6 | 32 (6) | 4 |
| P1 | 5 | 31 | 76 | 6 | 70 | 0 | 64 (10) | 4 |
| P2 | 5 | 33 | 63 | 11 | 52 | 0 | 34 (8) | 2 |
| 7 | 4 | 4 | 0 (42 skills) | – | – | – | 21 | – |

LO numbering is contiguous in every section (the builder checks `x.y.1 … x.y.n`), and the
per-section totals match the human summary exactly.

## Known caveats

1. **Equations.** Stacked fractions are re-linearised as `a = b / c` (numerators/denominators
   that are sums or differences are parenthesised, e.g. `average speed = (initial speed + final
   speed) / 2`); equations set on consecutive lines are separated with `; `. Missing arrow glyphs
   in word equations are restored as `→`, and annotations above/below an arrow become
   `(conditions: light, chlorophyll)`. Sub/superscripts are flattened to plain text exactly as the
   PDF text layer has them (`6CO2 + 6H2O`, `m/s2`, `cm2`, `mol/dm3`, `H+(aq)`).
2. **Hand overrides (6).** `B1 1.3.1` (reagent colour table — also provided as `table`),
   `C2 2.6.7` (atom-economy fraction), `P1 1.1.3` first bullet (two side-by-side fractions),
   `P1 1.4.17` (`Ek = ½mv²`), `P1 1.5.3` and `P1 1.5.7` (nuclide notation, written as
   `[mass number, atomic number]Symbol`, e.g. `[A,Z]X → [A−4,Z−2]Y + [4,2]He`). These were typed
   from the PDF text runs; the automatic rendering is retained in `autoText`.
3. **P1 1.1.3 bullets 2 and 3.** In the PDF the equation `average velocity = (initial velocity +
   final velocity) / 2` is physically set under the bullet "initial velocity, final velocity,
   acceleration and time:", and the two `acceleration = …` equations under "initial velocity, final
   velocity and average velocity …". The JSON preserves that document order; the pairing looks
   swapped relative to the bullet wording, and that is how the specification is laid out.
4. **P2 2.3.4** ("interpret and draw circuit diagrams using the standard symbols illustrated
   below") — the symbol chart is an image and is not captured.
5. **B1 1.2.6** — the leaf-adaptation list is set as indented plain lines (no bullet glyphs) in the
   PDF, so it is one paragraph in `text`, not `bullets`.
6. **Section prose.** `title` comes from the Title-Case prose heading before each table; `label` is
   the left-column table label (sentence case). `intro` paragraphs are joined; bold sentences inside
   intros (e.g. "For this section, students need to know the content of section 1.7.") are kept as
   plain text.
7. **Unit metadata** (duration, weighting, assessment) is hard-coded from the "Specification at a
   Glance" table (spec pp.6–8) rather than parsed; unit titles are parsed from the 3.x headings.
8. Not included: Section 2 assessment table, Section 4–8, Appendix 1 (mathematical content),
   Appendix 2 (How Science Works) and Appendix 3 (data leaflet). Grade descriptions and exam dates
   live in the research markdown.

## Regenerating

```
npm install            # pdfjs-dist (already in package.json)
node scripts/build-science-spec.mjs
# or reuse a saved line dump:
node scripts/extract-spec-pdf.mjs docs/sources/science/DA-Science-spec.pdf --from 11 --to 107 --y-tol 6 --out /tmp/spec-lines.json
node scripts/build-science-spec.mjs --dump /tmp/spec-lines.json
```

The build exits non-zero if any spot check fails (P1 1.1.2/1.1.3/1.1.4/1.1.6 must be `H`,
B1 1.1.3 must be `F`, 18 practicals, per-unit LO totals).

---

# `data/spec/mathematics.json`

Machine-readable taxonomy of **CCEA GCSE Mathematics (2017), Version 2** (subject code 2210,
CCEA qualification id 504): every learning-outcome statement of units M1–M8 verbatim, a
teachable-topic layer on top of them, unit/paper structure, formula sheets, exam dates and grade
boundaries. Unlike the science file it is **hand-authored** (the spec is short enough) from small JS
modules and assembled by a build script, so the JSON is fully reproducible and validated.

## Provenance

| Item | Value |
|---|---|
| Statement text | `docs/sources/maths/spec-2017-current_0.txt` (pdftotext of the spec PDF), cross-checked against `docs/research/01-ccea-gcse-mathematics-spec.md` §5 and `01-…parallel-version.md` §7. 199/218 statements match the pdftotext byte-for-byte after whitespace normalisation; the rest are either split by a page-layout column label or are the 16 reconstructions listed under *Known caveats* (each carries a `note`). |
| Progression links | `docs/sources/maths/Progression-of-Subject-Content.txt` (CCEA's M1→M4 / M5→M8 grid) |
| Teacher-guidance notes | `docs/sources/maths/teacher-guidance-2019.txt` (elaborations, examples, exclusions) |
| Examiner evidence | Chief Examiner reports Summer 2023/2024/2025 and November 2024/2025 as summarised in `01-ccea-gcse-mathematics-spec.md` §9 and the parallel report §11 |
| Corbettmaths links | Only the video numbers/URLs quoted in `docs/research/04-maths-learning-platforms.md` §2.1 and `docs/research/08-past-papers-and-question-banks*.md` (§3 table, §9.1–9.3). The Appendix A tables in the `.v1-with-corbettmaths-mapping.md` file are truncated after the heading, so no per-unit table was available; nothing was invented. |
| Structure, dates, boundaries | Spec §2/§4; timetables and raw-to-UMS PDFs as recorded in the two research reports (§2, §6, §8, §9) |
| Authoring modules | `scripts/maths-spec/statements.mjs`, `topics-foundation.mjs`, `topics-higher.mjs`, `meta.mjs` |
| Builder | `scripts/build-maths-spec.mjs` — derives `topics`, `examinedIn`, `tier`, `routes`, writes the JSON and prints counts |
| Validator | `scripts/validate-spec-json.mjs` — see *Validation* |

## Shape

```
{
  subject, subjectCode: "2210", cceaQualificationId: "504", qan, specVersion, gradeScale: ["A*",…,"G"],
  generatedBy, generatedAt, sources: {...},
  units: [ { code: "M1", tier: "F"|"H", kind: "gateway"|"completion", title, entryCode,
             targetGrades: [...], allowableGrade: "D"|null, functionalMathematics, aStar?,
             papers: [ { name, calculator: bool, durationMinutes, marks } ],
             weighting: 45|55, maxUms, umsScale: 180|220, prerequisiteUnits: [...],
             formulaSheet: [ "..." ], corbettmaths: { revisionPage, checklistPdf, bookletPdf, … } } ×8 ],
  pathways: { recommended, availableFinalGrades, rules, cashInCode },
  strands: [ { id: "NA"|"GM"|"HD", title } ],
  statements: [ { id: "M1-NA-01", unit, strand, text, topics: [slug,…],
                  progressionOf: "M?-??-??"|null, progressionSource?: "ccea-progression-table"|"editorial",
                  note?, teacherGuidance? } ×218, in spec order ],
  topics: [ { slug, title, strand, introducedIn, examinedIn: [...], tier, statementIds: [...],
              prerequisites: [slug,…], calculator: "either"|"calc"|"non-calc", difficulty: 1–5,
              examinerEvidence: [ { series, unit, note } ], mustMemorise: [...], onFormulaSheet: [...],
              corbettmaths: [ { title, videoNumber, url|null } ], keywords: [...] } ×152, in teaching order ],
  routes: { higher: { gateway: "M4", completion: "M8", units, stages, topicOrder: [...] },
            foundation: { gateway: "M2", completion: "M6", units, stages, topicOrder: [...] } },
  examDates: { "Summer 2026": {...}, "November 2026": {...}, "Summer 2027": {...} },
  gradeBoundaries: { subjectUms, unitUms, raw: { "Summer 2025": {...}, "Summer 2026": {...} } }
}
```

## Conventions

* **Statement ids** are `<unit>-<strand>-<nn>` numbered in spec order within each unit and strand.
  The spec prints M4 and M8 as a single block spanning all three strands; their strand assignment
  is editorial (bounds/algebra/lines → NA, mensuration/circle theorems/trig/enlargement/similarity → GM,
  sampling/histograms/probability → HD).
* **`progressionOf`** links a statement to the statement it extends in an earlier unit. Where CCEA's
  Progression table places two statements in the same row this is `progressionSource:
  "ccea-progression-table"`; the table cannot show gateway→completion links (it is two separate grids)
  and a few of its row placements are purely typographic (e.g. M4 "factorise ax² + bx + c" sits beside
  the M1 notation row), so a handful of obvious links are marked `"editorial"`. Links are only ever to
  a unit the spec says must be known first (the validator enforces this).
* **Topics** group 1–6 closely related statements from **one** unit into a 20–40 minute session
  (topic ⇒ `introducedIn` is that unit). Three statements are deliberately split across two topics
  because they bundle two sessions' worth of content: M1-HD-12 (charts / frequency trees + stem-and-leaf),
  M3-GM-03 (arcs & sectors / cylinder-cone-sphere) and M3-HD-03 (cumulative-frequency curve / box plots).
* **`examinedIn`** is cumulative: a topic introduced in unit U is examined in U and in every unit whose
  "students should know the content of …" list includes U (M1 → all eight; M2 → M2, M3, M4, M6, M7, M8;
  M3 → M3, M4, M7, M8; M4 → M4, M8; M5 → M5–M8; M6 → M6, M7, M8; M7 → M7, M8; M8 → M8).
  `tier` is F for M1/M2/M5/M6 topics, H otherwise.
* **`calculator`**: `non-calc` marks skills the completion tests target on Paper 1 (mental/written
  arithmetic, estimation, surds, indices, constructions, binary); `calc` marks skills that presuppose a
  calculator (trig, bounds, quadratic formula, stratified sampling, histograms); everything else `either`.
* **`difficulty`** (1–5) is evidence-weighted: 5 = repeatedly <10% full marks across series (circle
  theorems, histograms, algebraic fractions with linear denominators, quadratics from geometry, surds,
  equation of a circle/tangent, dividing algebraic fractions); 4 = majority lose marks in more than one
  series; 3 = commonly lost marks; 2 = mostly fine. Every topic carries at least one dated
  `examinerEvidence` note (short quote or paraphrase with series and unit).
* **`routes.topicOrder`** is the authored teaching order filtered to the route's units: stage 1 = M1+M5,
  stage 2 = M2+M6, stage 3 = M3+M7, stage 4 = M4+M8, and within a stage number → algebra → geometry →
  data. Every topic's prerequisites precede it (validated). The Foundation route (M2+M6) is the first
  two stages (94 topics); the Higher route (M4+M8) is all four (152 topics). M1+M5 or M3+M7 routes can
  be derived by filtering `topics` on `introducedIn`.
* **`corbettmaths`** entries give `url: null` when the source quoted only a video number; resolve
  numbers via https://corbettmaths.com/contents/. Corbettmaths' terms permit linking only (no
  re-hosting, no for-profit use) — see research report 04 §3.

## Counts (from the validator)

| Unit | Statements | Topics | | Strand | Topics | | Tier | Topics |
|---|---|---|---|---|---|---|---|---|
| M1 | 70 | 41 | | NA (Number and algebra) | 82 | | F | 94 |
| M2 | 27 | 18 | | GM (Geometry and measures) | 44 | | H | 58 |
| M3 | 22 | 17 | | HD (Handling data) | 26 | | | |
| M4 | 10 | 9 | | | | | | |
| M5 | 27 | 17 | | Difficulty | 2: 22 · 3: 65 · 4: 58 · 5: 7 | | | |
| M6 | 23 | 18 | | Prerequisite edges | 270 (acyclic) | | | |
| M7 | 19 | 17 | | Corbettmaths-linked topics | 29 | | | |
| M8 | 20 | 15 | | | | | | |
| **Total** | **218** | **152** | | | | | | |

## Known caveats

1. **Reconstructed wording (16 statements, each with a `note`).** pdftotext drops typeset symbols and
   stacked fractions: M1-NA-03 (≠ ≤ ≥), M2-NA-11 (x/4 + 3 = 7), M6-NA-09 (y = ±a), M3-NA-06 (x² + bx + c),
   M3-NA-08/M3-NA-10 ((4x + 3)/10 + (6x − 5)/5 [= 13/2]), M3-NA-12 (y = mx + c), M7-NA-01 (π),
   M7-NA-09 (y = k/x, x ≠ 0), M7-NA-10 (y = mx + c), M7-GM-02 (y = ±x), M7-HD-01/02 (×), M4-NA-02
   (ax² + bx + c), M4-NA-03/04 (2/(x + 2) + 3/(2x − 1) [= 1]), M4-NA-05 (x² ≠ 1), M8-NA-05 (5/(3√2)),
   M8-NA-08 (y = kˣ), M8-GM-02 (½ab sin C). Each reconstruction agrees with the Progression table and
   both research reports; M1-GM-04's three sub-bullets are flattened into one sentence.
2. **Spec typo carried through:** M3-NA-01 says "least common multiples" (sic).
3. **M1-GM-18** ("surface area and volumes of cubes and cuboids") is printed beside the "Handling data"
   row label in the PDF; it is a Geometry and measures outcome.
4. **Exam times** for the gateway units in Summer 2026/2027 are the timetable's standard 9.15 am morning
   start (the maths row carries no explicit time); durations from the spec.
5. **Grade boundaries** carry raw marks for Summer 2025 and Summer 2026 only (the two series with
   downloaded PDFs); November boundaries are not included.
6. Functional Mathematics Level 1/2 raw thresholds are set per series and are not included.

## Regenerating

```
node scripts/build-maths-spec.mjs        # rebuild data/spec/mathematics.json from scripts/maths-spec/*.mjs
node scripts/validate-spec-json.mjs      # unique ids, statement↔topic coverage, examinedIn/tier rules,
                                         # progression links, prerequisite DAG, route order, boundaries; exits 1 on error
```

---

# `data/spec/further-mathematics.json`

Machine-readable taxonomy of **CCEA GCSE Further Mathematics (2017), Specification Version 2
(17 September 2019)** — every Section 3 learning outcome, the CCEA Teacher Guidance limits for each
outcome, and a teachable-topic layer with prerequisites, difficulty and Chief Examiner evidence.
Built by `scripts/build-fm-spec.mjs` from hand-curated modules in `scripts/fm-spec/`; checked by
`scripts/validate-fm-spec-json.mjs` (`npm run spec:fm`, `npm run spec:fm:validate`).

## Provenance

| Item | Value |
|---|---|
| Specification | `docs/sources/further-maths/GCSE-Further-Mathematics-2017-specification-v2.pdf` (+ `.txt`), Section 3 pp.7–13 |
| Teacher Guidance | `docs/sources/further-maths/GCSE-Further-Mathematics-Teacher-Guidance-2024.pdf` (CCEA, Dec 2024) — its "Elaboration" column is the `teacherGuidance` field |
| Examiner evidence | `docs/sources/further-maths/GCSE-Further-Mathematics-Chief-Examiner-Report-Summer20{18,19,22,23,24,25}.txt` |
| Formula sheets | `docs/sources/further-maths/GCSE-Further-Mathematics-Formulae-and-Tables.pdf` (pp.1–2 are images; transcribed from the Summer 2025 papers/SAMs via `docs/research/02-ccea-gcse-further-mathematics-spec.md` §4–5) |
| Dates, boundaries, marking | `docs/research/02-ccea-gcse-further-mathematics-spec.md` §2, §6, §7 |
| Glyph recovery | The spec/guidance PDF text layers drop Cambria Math glyphs (`x`, `≤`, `≠`, `²`, `ⁿ`); they were restored with `scripts/extract-spec-pdf.mjs` (font-aware) so statement text is verbatim including symbols |

## Shape

```
{
  subject, subjectCode: "2330", cceaQualificationId: "507", qan, specVersion, gradeScale: ["A*",…,"G"],
  source, structure,            // provenance; unit rules, terminal/resit rules, AO weightings
  units: [ { code: "FM1".."FM4", title, compulsory, durationMinutes, marks, umsMax, weighting, calculator,
             entryCode, boundaryCode, formulaSheet: [{name, formula}], notInSpec: [...],
             lowUptake, lowUptakeEvidence? } ],
  statements: [ { id: "FM1-ALF-01", unit, area, strand, specPage, text /*verbatim*/, subItems?, note?,
                  teacherGuidance, topics: [slug] } ],
  topics: [ { slug, title, unit, area, strand, statementIds, prerequisites, difficulty: 1–5,
              examinerEvidence: [{series, note}], mustMemorise, onFormulaSheet, keywords } ],
  topicOrder: { FM1: [slug…], FM2, FM3, FM4 },   // teaching order, respects prerequisites
  examDates: { "Summer 2025", "Summer 2026", "Summer 2027" },
  gradeBoundaries: { subjectUms, unitUms, rawBySeries: {"Summer 2024|2025|2026"}, outcomes },
  markingConventions: { M, W, MW, notes: [...] }
}
```

* **Statement ids** are `FM<unit>-<AREA>-<nn>`: ALF Algebraic fractions, ALM Algebraic manipulation,
  CSQ Completing the square, SIM Simultaneous equations, QIN Quadratic inequalities, TRG Trigonometric
  equations, DIF, INT, LOG, MAT · KIN, VEC, FOR, NEW, MOM · CTD, PRB, BIN, NOR, BIV · CNT, LGC, LPR, TSR, CPA.
  `area` is the spec's left-column label; `strand` groups Unit 1 areas (Algebra, Trigonometry, Calculus,
  Logarithms, Matrices) and equals `area` elsewhere.
* **`text` is verbatim** including the spec's trailing connectors (`; and`, `.`). Bullets with dashed
  sub-items (FM1-DIF-02, FM1-LOG-02, FM2-NEW-01) are one statement with the sub-items joined by `; ` and
  also listed in `subItems`. The spec's trig statement uses `x` (not θ); FM1-INT-02 literally prints
  `(x ≠ −1)` (meaning the power n ≠ −1) — kept verbatim with a `note`.
* **Topic slugs** are bare kebab-case within this file; cross-subject prerequisites use the `maths:` prefix
  (GCSE Mathematics Higher/M4/M8 topics, e.g. `maths:quadratic-formula`). They are validated for shape,
  and against `data/spec/mathematics.json` (warning only) when that file exists.
* **Difficulty** (1–5) is driven by examiner evidence: 5 = flagged as the top discriminator in most reports
  (algebraic-fractions-add-subtract, laws-of-logarithms, optimisation, force-diagrams,
  connected-particles-and-pulleys, combined-sets-mean-sd, conditional-probability,
  conditional-probability-with-distributions). Any topic at 4–5 must carry evidence (validator rule).
* **Unit 4** is included in full but `lowUptake: true` with the reports' own words as evidence
  (0 candidates in 2022, 4 in 2023, "no meaningful report" in 2019/2024/2025).

## Counts

| Unit | Statements | Topics | Topics at difficulty ≥ 4 |
|---|---|---|---|
| FM1 Pure Mathematics | 21 | 29 | 7 |
| FM2 Mechanics | 12 | 16 | 7 |
| FM3 Statistics | 13 | 16 | 4 |
| FM4 Discrete and Decision | 15 | 12 | 0 |
| **Total** | **61** | **73** | **18** |

## Validation (`scripts/validate-fm-spec-json.mjs`)

Fails (exit 1) on: missing keys; wrong unit metadata (120/100/50%, 60/50/25%, weightings sum 125);
statement count per unit (21/12/13/15); statement text not found verbatim in the spec text layer
(alphanumeric skeleton, dropped math glyphs ignored, checked in two halves); any statement with no topic;
statement↔topic links that disagree; unknown or self prerequisites; prerequisite cycles (DFS);
`topicOrder` missing/duplicated slugs or placing a topic before its prerequisite; difficulty outside 1–5
or ≥ 4 without examiner evidence; evidence series without a Chief Examiner's report; FM4 with a formula
sheet; non-descending raw grade boundaries; missing 2026/2027 ISO exam dates. Unresolvable `maths:`
prerequisites are warnings.

## Regenerating

```
node scripts/build-fm-spec.mjs            # writes data/spec/further-mathematics.json
node scripts/validate-fm-spec-json.mjs    # exit 1 on error
```

Edit the data in `scripts/fm-spec/{statements,topics-fm1..4,meta}.mjs`, not the JSON.
`statements[].topics` and `topicOrder` are derived by the build (from `topics[].statementIds` and a stable
topological sort of the authored order), so they can never disagree with the topic layer.

---

# `data/spec/double-award-science-topics.json`

Teachable-topic layer over `data/spec/double-award-science.json`: the 419 numbered learning
outcomes of B1, B2, C1, C2, P1 and P2 grouped into **130 topics** each sized for one 20–40 minute
session, plus the four Unit 7 skill areas, the physics equations that must be recalled (no formula
sheet exists), a chemistry/biology "recall bank" (tests, colours, series, glossary definitions) and
per-topic links to Bitesize, PhET and NI YouTube resources.

Built by `scripts/build-science-topics.mjs` from the hand-authored definitions in
`scripts/science-topics-source.mjs`; checked by `scripts/validate-science-topics.mjs`.

## Provenance

| Item | Value |
|---|---|
| Outcome ids, tiers, section titles, side-labels, practical titles | derived at build time from `data/spec/double-award-science.json` (never retyped) |
| Topic grouping, prerequisites, difficulty, mustRecall, keywords | `scripts/science-topics-source.mjs` (hand-authored) |
| Examiner evidence and difficulty calibration | `docs/research/03-ccea-gcse-double-award-science-spec.md` §7 (Chief Examiner reports Summer 2023 – March 2026) |
| Physics equation list | `docs/research/03-…` §5.9 cross-checked against the "recall and use" outcomes in the spec JSON |
| PhET simulations | only the 41 HTML5 sims listed in `docs/research/05-science-learning-platforms.md` §2.11 (URL pattern `…/sims/html/<sim>/latest/<sim>_en.html`); 38 are used — Balloons and Static Electricity, Faraday's Law and Generator are outside the Double Award content |
| NI YouTube channels | `docs/research/05-…` §2.20 (Chemistry Chicken, Science Shorts, PhysicsRocksItsTrue) — playlist/video URLs verbatim |
| Bitesize | article URLs assembled from the topic/article ids in `docs/research/05-…` §1.2 using the pattern documented there (`topics/<topic>/articles/<id>`); hubs in `unitResources` |

## Shape

```
{
  subject, subjectCode: "1370", source: { …, tierRule, skillIdRule, difficultyRule }, counts,
  topics: [ { slug: "b1-nitrogen-cycle", unit: "B1", discipline, section: "1.7", sectionTitle,
              sections?: ["1.2","1.3"] /* only when a topic spans sections */, specLabels: [side-labels],
              title, outcomeIds: ["1.7.10"], outcomeTiers: {"1.7.10": "H"},
              tier: "F" | "H" | "mixed", higherOnlyOutcomeIds, partlyHigherOutcomeIds,
              practicals: ["B4"], practicalDetails: [{code, title, unit}],
              prerequisites: [slug…] /* may cross units */, difficulty: 1–5,
              examinerEvidence: [{series, unit, tier, note}], mustRecall: [string],
              keyEquations: [{id, name, formula, units, tier}], phet: [{name, url}],
              video: [{channel, url, note}], bitesize: url | null, keywords } ],
  unitOrder: { B1: [slug…], B2, C1, C2, P1, P2, U7 },   // teaching order, respects same-unit prerequisites
  unit7: [ { slug: "u7-planning", sectionTitle, title, skillIds: ["U7.1.1"…], skills: [{id, text, bullets}],
             practicalsPractised: ["B3"…], prerequisites, difficulty, examinerEvidence, mustRecall, bitesize, keywords } ],
  physicsEquations: [ { id: "p-kinetic-energy", unit, topicSlug, name, formula, symbols, units, tier, note? } ],
  chemistryRecall: [ { category: "test"|"flame colour"|"colour"|"pH"|"observation"|"series"|"definition"|"equation"|"general formula"|"formula",
                       item, detail, topicSlug, tier } ],
  biologyRecall:   [ same shape ],
  unitResources:   { hub, pastPapers, B1…P2, U7: { bitesize: [hub urls], video: [...], sites?: [...] } }
}
```

* **Outcome ids are per-discipline sequences** (`1.2.3` exists in B1, C1 and P1) — always read them
  with `unit`. Unit 7 skills have no ids in the spec, so they are numbered `U7.<skillArea>.<n>`
  (1-based, document order over Planning / Carrying out / Analysing / Drawing conclusions = 8 + 1 + 6 + 9
  = 24 skills; the single "Carrying out" skill carries the 17-item apparatus list as bullets).
* **Tier**: `H` = every outcome Higher-only; `F` = no Higher content at all (no `H` outcome, no
  partly-bold stem, no `H` bullet); otherwise `mixed`. `higherOnlyOutcomeIds` / `partlyHigherOutcomeIds`
  say which, so a Foundation build can drop whole outcomes or just the `textMarked` phrases.
* **Practicals**: each of the 18 prescribed practicals has exactly one home topic (`practicals`);
  Unit 7 groups list the practicals they exercise in `practicalsPractised` (non-exclusive).
* **Prerequisites** form a DAG (validated) and may cross units and disciplines
  (`b2-osmosis` → `b1-cells-and-microscopy`, `p1-atom-nucleus-isotopes` → `c1-atomic-structure`,
  `p2-stars-and-fusion` → `p1-nuclear-fusion`). No Year-11 unit (B1/C1/P1) topic depends on a Year-12
  unit (B2/C2/P2) topic. `unitOrder` is a stable topological sort of the authored order.
* **Difficulty** 5 (6 topics): `b1-nitrogen-cycle`, `c2-alkenes`, `c2-carboxylic-acids` (organic
  naming/structures), `p1-moments` (unit/direction), `p1-nuclear-fusion` (QWC), `p2-lens-ray-diagrams`.
  Difficulty 4 topics carry examiner evidence (validator warns otherwise).
* **Physics equations**: 34 entries; all are "recall and use" in the spec except `p-frequency-period`
  (`f = 1/T`, needed for 2.1.3 and flagged by examiners) which is marked with a `note`.

## Counts (validator output)

| Unit | Topics | Outcomes | F | H | mixed | Practicals | Difficulty ≥ 4 | PhET links |
|---|---|---|---|---|---|---|---|---|
| B1 | 21 | 47 | 10 | 2 | 9 | 4 | 3 | 5 |
| B2 | 20 | 51 | 10 | 0 | 10 | 2 | 5 | 3 |
| C1 | 25 | 109 | 13 | 2 | 10 | 2 | 7 | 8 |
| C2 | 22 | 73 | 9 | 1 | 12 | 4 | 11 | 3 |
| P1 | 22 | 76 | 18 | 1 | 3 | 4 | 5 | 16 |
| P2 | 20 | 63 | 14 | 1 | 5 | 2 | 6 | 16 |
| U7 | 4 groups | 24 skills | – | – | – | 18 practised | – | – |
| **Total** | **130** | **419** | 74 | 7 | 49 | 18 | 37 | 51 |

## Validation (`scripts/validate-science-topics.mjs`)

Fails (exit 1) on: any numbered outcome of B1–P2 assigned to zero or more than one topic; unknown
outcome ids; any prescribed practical with zero or several home topics; any Unit 7 skill in zero or
several groups; duplicate or malformed slugs (must start with the unit code); unknown or self
prerequisites; prerequisite cycles (DFS); `tier` / `higherOnlyOutcomeIds` disagreeing with the spec's
per-outcome tiers; `unitOrder` missing/duplicating a slug or placing a topic before a same-unit
prerequisite; a Year-11 topic depending on a Year-12 topic; difficulty outside 1–5; PhET URLs outside
the documented pattern; video entries without a youtube.com URL; equation / recall `topicSlug`s that do
not exist; physics equations not surfaced in their topic's `keyEquations`. Warnings: topics with more
than 8 outcomes; difficulty ≥ 4 without evidence.

## Regenerating

```
node scripts/build-science-topics.mjs       # writes data/spec/double-award-science-topics.json
node scripts/validate-science-topics.mjs    # exit 1 on error; prints counts per unit and tier
```

Edit `scripts/science-topics-source.mjs`, not the JSON. Re-run the build after regenerating
`double-award-science.json` (tiers, labels and practical titles are re-derived).

## Known caveats

1. Bitesize article URLs are constructed from documented ids, not fetched; a handful of topics reuse
   the nearest article (e.g. all 1.6 topics point to "The nervous system", centre of gravity to
   "Moment of a force"). Prescribed-practical pages on Bitesize are listed only at hub level.
2. Examiner notes are paraphrases of the research summary, not quotations from the reports; `tier`
   in `examinerEvidence` uses `U7A` / `U7B` for Booklet A / B comments.
3. `mustRecall` wording follows the spec and research summaries; the CCEA Glossary of Terms PDFs
   were not parsed, so glossary definitions should be checked against them before being shown as
   "verbatim".
4. Halogen colours, iodine sublimation, oxygen's glowing-splint test and the blast-furnace equations
   are standard content implied by the outcomes but not spelled out in the spec text.
