# CCEA P1 Higher eGuide: distilled per topic

**What this is.** CCEA's own Higher Tier eGuide to Physics Unit 1 of Double Award Science (© CCEA 2023; 72 printed pages of teaching and answers plus covers, 77 PDF pages), read in full and compared, topic by topic, with our P1 material. One dossier per P1 topic in our taxonomy (22 files); every dossier has the eleven sections of the Biology Unit 2 set (pages, the book's sequence, explanations worth recreating, figures with recreation notes, worked examples, question types with CCEA evidence, definitions and disagreements, Higher-only content, pitfalls, our gaps ranked, anything in our material the book shows to be wrong).

**Source files.** The eGuide's extracted text (`.txt`, `pdftotext -layout`) and its PDF, side by side in `docs/sources/textbooks/` (both git-ignored; an identical copy of the PDF is in `docs/sources/science/eguides/Physics-U1-Higher.pdf`). Page numbers in the dossiers are the book's **printed** numbers; add 4 for the PDF page.

**Method (7 Oct 2026).** The text was read in full, page by page. All 77 PDF pages were rendered locally and every page with a figure, a graph, a table or a garbled text layer was inspected as an image, so the errors below were checked on the page. Our side: the only two P1 notes that exist (`p1-speed-equations`, `p1-vectors-velocity-acceleration`) read in full with their bundles; for the other 20 topics, which have no note or bundle, the P1 flashcard deck (`data/decks/science/P1.json`, 216 cards) was read card by card. Disagreements were checked against the specification (`data/spec/double-award-science.json`), CCEA's Double Award Physics glossary, the P1 papers and schemes for all 24 series from 2018 March to Summer 2026 (`docs/sources/papers/science/`), the Unit 7 physics booklets, and the four Chief Examiner reports we hold (Summer 2023, 2024, 2025; March 2026). Every scheme, paper and report citation was checked against its file; two that were wrong in drafts (a six-mark radon item first credited to the wrong series, and a pressure item first filed under stability) were corrected before this index was written.

**Copyright.** Everything here is in our own words. A shared-run check against the book's full text (both the layout and the reading-order extractions) reports **0** shared eight-word runs in all 23 files, and **0** shared six-word runs apart from runs that are also in CCEA's specification text, equation or unit phrases, or the book's exercise labels used as citations (listed by the checker, `scratchpad/probes/dossier-physics-unit-1/shared-runs.cjs`). No figure, photograph or table from the book is reproduced; each is described so that we can draw our own. Many of the book's drawings are credited to another publisher's textbook or to websites and must never be reused.

---

## Topic table

Verdict = our material compared with the book: **richer**, **equal** or **thinner**. "Book" rates the book's own treatment against the specification and CCEA's papers.

| Topic (dossier) | Book pages, printed (PDF) | Verdict | Reason | Book |
|---|---|---|---|---|
| [p1-speed-equations](p1-speed-equations.md) | 1.1: pp. 1–6, 68 (PDF 5–10, 72) | **richer** | Ours teaches conversions, Practical P1, the graph shape and examiner evidence; the book adds the average-of-two equation run backwards (2018 and 2026 Higher) and the "incorrect physics" warning | adequate |
| [p1-vectors-velocity-acceleration](p1-vectors-velocity-acceleration.md) | 1.1: pp. 1–3, 5, 8–9, 68 (PDF 5–7, 9, 12–13, 72) | **richer** | Ours has a sign convention, the final-velocity rearrangement and correct numbers; the book adds masses-add-forces-don't, when distance equals displacement, a curved route; two of its answers are wrong | adequate, with errors |
| [p1-motion-graphs](p1-motion-graphs.md) | 1.1: pp. 5–13, 68–70 (PDF 9–17, 72–74) | **thinner** | No note; the book has eleven fully answered graph exercises | strong practice, no reasons |
| [p1-forces-and-resultant](p1-forces-and-resultant.md) | 1.2: pp. 14–16, 18–19 (PDF 18–20, 22–23) | **thinner** | No note; the book does resultants and signs, but not force pairs between objects | adequate |
| [p1-newtons-laws](p1-newtons-laws.md) | 1.2: pp. 14, 16–20, 70 (PDF 18, 20–24, 74) | **thinner** | No note; the book's four build-the-resultant examples match CCEA's reported weakness; no 1.2.5 investigation | strong examples, one wrong caption |
| [p1-mass-weight-free-fall](p1-mass-weight-free-fall.md) | 1.2: pp. 14, 21–22 (PDF 18, 25–26) | **thinner** | No note; clear and correct, with the mass-cancels argument | adequate |
| [p1-hookes-law](p1-hookes-law.md) | 1.2: pp. 14, 22–23 (PDF 18, 26–27) | **thinner** | No note; the book has no force–extension graph at all | thin |
| [p1-pressure](p1-pressure.md) | 1.2: pp. 14–15, 23–24, 70 (PDF 18–19, 27–28, 74) | **thinner** | No note; units-follow-the-area is right; one doubtful example (ice skate) | adequate |
| [p1-moments](p1-moments.md) | 1.2: pp. 15, 25–27, 30, 71–72 (PDF 19, 29–31, 34, 75–76) | **thinner** | No note; the book hits three reported traps (perpendicular distance, distances from the pivot, adding at the support) | strong |
| [p1-centre-of-gravity-stability](p1-centre-of-gravity-stability.md) | 1.2: pp. 15, 27–29, 31, 72 (PDF 19, 31–33, 35, 76) | **thinner** | No note; good definition tip and toppling sequence; no plumb-line method | adequate |
| [p1-density-kinetic-theory](p1-density-kinetic-theory.md) | 1.3: pp. 32–37 (PDF 36–41) | **thinner** | No note; three methods, nine calculations, the spacing explanation; no eureka can | strong |
| [p1-energy-forms-conservation-efficiency](p1-energy-forms-conservation-efficiency.md) | 1.4: pp. 38–43 (PDF 42–47) | **thinner** | No note; forms against resources, transfer diagrams, efficiency via conservation | strong |
| [p1-energy-resources](p1-energy-resources.md) | 1.4: pp. 38–40 (PDF 42–44) | **thinner** | No note; definitions and the "reused" tip, but nothing evaluated and no acid rain in the body | thin |
| [p1-work-and-power](p1-work-and-power.md) | 1.4: pp. 38–39, 43–45, 48–49 (PDF 42–43, 47–49, 52–53) | **thinner** | No note; good non-examples and conversions; impossible slope numbers; no Practical P4 | adequate, with an error |
| [p1-kinetic-and-potential-energy](p1-kinetic-and-potential-energy.md) | 1.4: pp. 39, 45–47 (PDF 43, 49–51) | **thinner** | No note; eight graded examples including two energy stores at once (the Summer 2024 shape); no friction-loss case | strong |
| [p1-atom-nucleus-isotopes](p1-atom-nucleus-isotopes.md) | 1.5: pp. 50, 52–55, 72 (PDF 54, 56–59, 76) | **thinner** | No note; the particle table and notation are right; half the pages are off-specification history | adequate |
| [p1-radioactive-decay](p1-radioactive-decay.md) | 1.5: pp. 50–51, 55–57 (PDF 54–55, 59–61) | **thinner** | No note; structure useful, but several wrong or contradictory facts | weak (errors) |
| [p1-background-radiation-dangers-safety](p1-background-radiation-dangers-safety.md) | 1.5: pp. 50–51, 58, 60, 62–63 (PDF 54–55, 62, 64, 66–67) | **thinner** | No note; the inside-against-outside explanation per radiation is better than the specification's list | adequate |
| [p1-half-life](p1-half-life.md) | 1.5: pp. 51, 58–62, 72 (PDF 55, 62–66, 76) | **thinner** | No note; strong halving tables and background correction; never reads a half-life off a graph | strong calculations |
| [p1-uses-of-radioactivity](p1-uses-of-radioactivity.md) | 1.5: pp. 51, 63–65 (PDF 55, 67–69) | **thinner** | No note; good reasoning for the choice of radiation; smoke-alarm half-life missing; confusing medical examples | adequate |
| [p1-nuclear-fission](p1-nuclear-fission.md) | 1.5: pp. 51, 58, 65–67 (PDF 55, 62, 69–71) | **thinner** | No note; the sequence CCEA marks and a balanced debate; some dated debate points | adequate |
| [p1-nuclear-fusion](p1-nuclear-fusion.md) | 1.5: pp. 51–52, 66–67 (PDF 55–56, 70–71) | **thinner** | No note; explains why it must be hot; omits the four-million figure from its body; puts D–T fusion in the Sun | adequate, with an error |

**Tally:** richer 2, equal 0, thinner 20. All 20 "thinner" verdicts are topics with no note yet; on the two topics we have authored, our notes are richer than the book.

---

## Book content that maps to no topic of ours

1. **The history of the atomic model** (pp. 52–53): electrons from heated wires, the plum-pudding model, Rutherford's alpha scattering and conclusions, Chadwick's neutron. Not in 1.5.1–1.5.4 and not in any P1 paper we hold.
2. **Biographies** (pp. 16, 23, 49): Newton (with a wrong birth year), Pascal, Watt and the horsepower.
3. **Ice skating by pressure melting** (p. 24): doubtful physics and not in the specification.
4. **Ice floating on water** (p. 36): an aside to the density order.
5. **The neutron changing into a proton in beta decay** (p. 56): not required, but useful as the reason Z rises (kept in `p1-radioactive-decay` as a "why").
6. **Speeds of the three radiations** (p. 57): not in the specification, and the beta value is wrong.
7. **A table of half-lives from billions of years to fractions of a second** (p. 59).
8. **Medical and farming extras** (p. 65): cobalt-60 therapy, iodine-131, technetium imaging, food irradiation, nutrient tracers in plants.
9. **Reactor and bomb details** (pp. 65–66): slow and fast neutrons, the uncontrolled bomb, glass-encased waste and earthquake risk.
10. **Fusion research history** (p. 66): the Sun's core temperature, a 1997 reactor record, progress in 2022.
11. **Debate extras** (p. 67): base-load supply, uranium against coal by mass, one country's plans for new reactors, another's phase-out, the NIMBY acronym.
12. **A "past examination question" on a bouncing ball** (pp. 12–13): fits 1.1.6 but is not from any Double Award P1 paper we hold.
13. **Learning-outcome pages** (pp. 1, 14): they list v = u + at, d = ½(u + v)t and meanings for the letters u, v, a, d and t, which come from CCEA's separate single-award Physics specification, not the Double Award one.

## Topics of ours the book does not cover

None: every one of our 22 P1 topics has at least a page. But the book's body does not teach these specification statements (most appear only in its learning-outcome lists):

- **Practicals.** P1 (ramp), P2 (Hooke's law) and P3 (moments) are deferred to a separate Practical eGuide we do not hold; **P4 (personal power) is not mentioned at all**, although CCEA set it as a six-mark answer in 2025 November and in 2024 March.
- **1.2.1** forces arise in equal and opposite pairs between objects (CCEA Summer 2024 Higher Q4(i)).
- **1.2.5** the air-track or data-logger investigation of Newton's laws (Unit 7: 2022 Summer and Summer 2026 Higher Booklet B).
- **1.2.13** the gradient of force against extension is the spring constant; the limit of proportionality on a graph.
- **1.2.20** investigating the centre of gravity (the plumb-line method).
- **1.3.1–1.3.2** the mass–volume investigation run as an investigation; **1.3.3** the eureka can.
- **1.4.6** evaluating renewable resources; **1.4.10** acid rain.
- **1.5.22** four million times the energy of a chemical fuel per kilogram; **1.5.23** about fifty years and the cost of building and containing a reactor.
- **1.1.6** a displacement–time graph with a return journey (the rule is stated, never practised; March 2026 Higher Q5 was the paper's hardest question).
- **1.5.14** reading a half-life from a graph (a curve is drawn but never read).

---

## Errors and doubtful statements in the book (do not copy)

Checked on the rendered pages.

- p. 1 and p. 14: learning outcomes borrowed from the single-award specification (extra equations and symbols).
- p. 2: the walked example's average velocity divides by 100 s instead of the stated 160 s (1.0 m/s printed; about 0.63 m/s correct).
- p. 16: Newton's dates begin at 1645 (he was born in 1642).
- p. 17: the second falling-object caption says constant acceleration where it means constant velocity.
- p. 24: the ice-skate explanation (pressure melting) is disputed.
- pp. 27, 31: the exercises say "centre of mass" straight after the book's own tip to always say "centre of gravity".
- pp. 44–45: the slope example is impossible (lifting the 130 N load the slope's 4.2 m height needs about 540 J, but the pull does 390 J; a 60 N pull could not raise it).
- p. 55 against p. 57: the beta particle's relative mass is 0 in the text and 1/1840 in the table.
- p. 55 against p. 56: gamma emission said to change nothing in the nucleus, then explained as the nucleus losing excess energy.
- p. 56: the gamma equation changes the mass number (233 to 235).
- p. 57: beta's speed given as about a tenth of light speed (far too low); gamma said never to be stopped (the specification: lead blocks it).
- pp. 59, 61, 62: carbon-14's half-life given three ways (5730, 5600 and 5700 years).
- p. 61: becquerels treated as counts per second.
- p. 65: a six-hour "technetium-99" (it is technetium-99m); a beta emitter used as the example of an organ tracer (CCEA's rule: tracers detected outside the body are gamma emitters with short half-lives).
- p. 66: the Sun said to fuse deuterium with tritium (the Sun mainly fuses ordinary hydrogen; deuterium–tritium is the reactor reaction).
- p. 67: unverifiable or dated debate points (a hundred new reactors planned in one country).
- p. 68: the answer printed for Test Yourself 1.1.1 Q1 drops the minus sign, prints cm/s², then calls the retardation −4 m/s².
- pp. 69–70: Test Yourself 1.1.2 Q5 answer labels shifted by one part.
- p. 12: the bouncing-ball graph's second fall is drawn steeper than its first.

**Reused past-paper items.** The book's helicopter self-test (p. 20) has exactly the numbers of CCEA 2020 November Higher Q9, and its molybdenum-to-technetium worked example (p. 56) is CCEA's 2018 March and 2022 Summer Higher item. Not errors, but our items must not reuse them as new practice.

## Contradictions: book against our material, the specification and the schemes

The scheme decides marking; the book helps teaching.

| Point | Book | Ours | Specification or scheme | Which to follow |
|---|---|---|---|---|
| Sign of a retardation | "retardation = −4 m/s²" (p. 68) | vectors note: a = −1.5 m/s², a retardation of 1.5 m/s² | 2018 Summer Higher Q5(b)(i) and 2019 November Higher Q5(c)(i) give a separate mark for the minus sign on the acceleration | ours |
| Centre of mass | never write it (p. 28) | deck uses centre of gravity | 2022 Summer Unit 7 Higher Booklet B Q4(a) accepts both names (gravity or mass) for the point | teach "centre of gravity" (the specification's term) without calling the other wrong |
| Conservation of energy | use the specification's sentence, not "cannot be created or destroyed" (p. 40) | deck: specification's sentence | 2024 March Higher Q6(a) credits either for its first mark | either earns the mark; teach the specification's |
| Gamma absorber | never completely stopped (pp. 57, 63) | deck: blocked by thick lead | 1.5.8: blocked by lead; 2022 March Higher Q1 scheme: lead | specification |
| Beta absorber | a few mm of aluminium (p. 57) | deck: thin sheet of aluminium | 1.5.8: thin sheet of aluminium | specification |
| Beta's relative mass | 0 (p. 55) and 1/1840 (p. 57) | deck: electron 1/1840 | equations use mass number 0 (1.5.7); the 2023 Summer scheme accepts an electron mass from 1/2000 to 1/1833 | both, each in its place |
| Power | the rate of doing work (p. 48) | deck: energy transferred per second | 2025 Summer Higher Q4(b): energy or work (threshold) per second | scheme |
| When work is done | when a force moves something (p. 43) | deck: when energy changes form | 1.4.13: when energy changes from one form to another | specification for the definition; the book's idea for why distance counts |
| Second law | adds "inversely proportional to the mass" (p. 19) | deck: specification's sentence | 1.2.6: proportional to the resultant force | specification for "state" |
| Hooke's law direction | extension proportional to force (p. 22) | deck: same | 2022 March Higher Q4(a) also credits force proportional to extension | either |
| Principle of Moments | about any point (p. 25) | deck: about a point | glossary: about the pivot; 2018 November Higher Q9(a): about any point or pivot | any of the three |
| Density precaution | repeat and average (p. 33) | deck method card | 2019 Summer Higher Q1 scheme: no spills, eye level or bottom of meniscus, "not repeat"; 2018 November Higher Q2 accepts repeat | teach a measuring precaution as well as repeats |
| Medical tracer | iodine-131 as a beta emitter (p. 65) | deck: gamma, short half-life | 2023 March Higher Q2(a): bloodstream, gamma, short | scheme |
| Thickness control | beta for paper and aluminium, gamma for steel (p. 63) | deck: beta for metal sheet | Summer 2025 Higher Q2(a): beta for aluminium | consistent; say steel needs gamma |
| Smoke alarm | alpha; no half-life given (p. 64) | deck: alpha | 2019 Summer, 2023 March, 2025 November Higher: alpha, **long** half-life | scheme |
| Fusion in the Sun | deuterium + tritium (p. 66) | deck: stars; D and T as fuel | 2025 Summer Higher Q3 lists stars or Sun, deuterium, tritium, helium as separate points | marking: either; teaching: stars fuse hydrogen, reactors would use D and T |
| Tritium in seawater | widely available (p. 67) | deck: same | 1.5.21 says so; 2023 November scheme credits seawater | specification for the answer (strictly true of deuterium only; do not elaborate) |

## Things in our material that need attention (from section 11 of each dossier)

- **Taxonomy and deck, motion graphs.** `scripts/science-topics-source.mjs` line 1415 (and the generated `data/spec/double-award-science-topics.json`) and the trap card in `data/decks/science/P1.json` (p1-motion-graphs) say the Summer 2025 report found "constant speed" for a **sloping** velocity–time section. The report and scheme (Summer 2025 Higher Q5(i)) concern a **flat** section, where "constant velocity" was required. The card's physics is right; its citation is not.
- **Deck, kinetic and potential energy.** The trap card about a ball that "already has 10 J of kinetic energy at the top" cites the March 2026 Higher report, but that question (Q8) is about 10 J **lost to friction**, added to the landing kinetic energy to give the starting potential energy (110 J, height 1.4 m).
- **Deck, centre of gravity.** The "more area" stability trap cites the Summer 2025 Unit 7 report (which supports it) and the Summer 2024 P1 Higher report (which is about the height of the centre of gravity, not area).
- **Our two notes.** Nothing wrong. Gaps ranked in each dossier: for `p1-speed-equations`, the backwards use of (initial + final) ÷ 2, a wrong-equation non-example, a slowing case; for `p1-vectors-velocity-acceleration`, the masses-against-forces argument, when distance equals displacement, a curved route.

## Scheme evidence that surfaced while checking (useful beyond this folder)

- **General marking principles** (2021 Summer P1 Higher scheme): an incorrect physics equation scores 0 overall; a formula triangle does not count as the equation; partial credit runs from the first line to the first error; a unit mark is free-standing.
- **Backwards from an average**: 2018 March Higher Q9, 2018 Summer Higher Q5(a), Summer 2026 Higher Q9(ii).
- **Displacement–time with a return**: March 2026 Higher Q5 (constant velocity in the opposite direction; velocity from a line not starting at zero).
- **Two energy stores at once**: Summer 2024 Higher Q9(ii) (11.25 J + 28.75 J; 42.2 m/s). **Energy lost to friction**: March 2026 Higher Q8, 2019 Summer Higher Q7(a).
- **Personal power (P4) as six marks**: 2025 November Higher Q2; 2024 March Higher Q3.
- **Fusion's two ratios in one item**: 2019 November Higher Q7(b) (four million against a chemical fuel; four against fission).
- **Pressure units**: Summer 2024 Higher Q4(iii) and 2024 March Higher Q7(b), "do not change any units"; Pa for an area in cm² loses the unit mark.
- **Electron's relative mass**: the Summer 2023 scheme accepts any value from 1/2000 to 1/1833.
