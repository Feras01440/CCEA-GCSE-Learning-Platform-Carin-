# CCEA B2 Higher eGuide: distilled per topic

**What this is.** CCEA's own Higher Tier eGuide to Biology Unit 2 of Double Award Science (© CCEA 2023, 107 printed pages plus covers), read in full and compared, topic by topic, with our B2 notes and bundles. One dossier per topic in this folder; every dossier has the same eleven sections (pages, the book's sequence, its explanations we lack, its figures with recreation notes, its worked examples, its question types, definitions and disagreements, Higher-only content, its pitfalls, our gaps ranked, anything in our note it suggests is wrong).

**Source files.** The eGuide's extracted text (`.txt`, made with `pdftotext -layout`) and its PDF, side by side in `docs/sources/textbooks/`, both git-ignored. Page numbers in the dossiers are the book's **printed** numbers; add 4 for the PDF page.

**Method (27 Sep 2026).** The text was read in full. All 111 PDF pages were rendered locally, and every page whose figure, table or bold (Higher) text a dossier relies on was inspected as an image, so figure descriptions, bold passages and the book errors listed below were checked on the page, not inferred from the text layer (which scrambles tables). Our side: every `packs/science/content/b2/<slug>/note.blocks.json` read in full; each `bundle.json` read for its worked examples, question stems, find-the-mistake items, prompts and insight findings. Disagreements were checked against CCEA mark schemes in `docs/sources/papers/science/` (B2 2019, 2021–2025; Unit 7 Biology 2019–2025), cited by file in each dossier.

**Copyright.** Everything here is in our own words. A six-word shingle check against the book's full text reports **0** shared six-word runs in all 21 files. No figure, photograph or table from the book is reproduced; each is described so that we can draw our own. The book's photographs are credited to third parties (Getty Images, Science Photo Library, Shutterstock) and must never be used.

---

## Topic table

Verdict = our note compared with the book: **thinner**, **equal** or **richer**.

| Topic (dossier) | Book pages (printed) | Top three gaps in our note | Verdict |
|---|---|---|---|
| [b2-osmosis](b2-osmosis.md) | 2.1: pp. 1–6 | Equal concentration never taught as the third case; no plasmolysed-cell-back-into-water item (CCEA 2021 Q5(c)); concentrations only in mol dm⁻³, never % sucrose | richer |
| [b2-transpiration-potometer](b2-transpiration-potometer.md) | 2.1: pp. 7–9 | Surface area unexplained and no greased-leaf experiment (CCEA U7 2022); only one of the three light explanations the 2019 scheme credits; no check on graph shapes | richer |
| [b2-blood-and-vessels](b2-blood-and-vessels.md) | 2.2: pp. 10–14 | Lymphocyte against phagocyte not taught for recognition; why red cells do not burst in the body (Higher); artery–vein similarities never asked | richer |
| [b2-heart-double-circulation](b2-heart-double-circulation.md) | 2.2: pp. 14–20 | "Who is fittest of three" pulse task missing (CCEA 2019, 3 marks); intestine's vessels and coronary vein missing; no septum, no valve timing | equal |
| [b2-reproductive-systems](b2-reproductive-systems.md) | 2.3: pp. 21–24 | No female function grid, uterus lining not its own answer; penis and vagina functions, "nourishes" for the prostate; no hide-the-labels self-test | richer |
| [b2-fertilisation-pregnancy](b2-fertilisation-pregnancy.md) | 2.3: pp. 24–26 (and 29–30) | "Dissolved nutrients" never named; cord contents and placenta's origin; no staged diagram naming the division at each step | richer |
| [b2-sex-hormones-menstrual-cycle](b2-sex-hormones-menstrual-cycle.md) | 2.3: pp. 26–28 | No pregnant branch (CCEA 2022: the lining stays level); no events named from a hormone curve; lining curve keeps rising after day 14 | richer |
| [b2-infertility-contraception](b2-infertility-contraception.md) | 2.3: pp. 28–33 | Causes CCEA credits missing (erectile dysfunction, hostile vagina); IVF skips "left a few days, checked" (CCEA 2021, 4 marks); no perfect-use against real-use data | equal |
| [b2-genome-chromosomes-dna](b2-genome-chromosomes-dna.md) | 2.4: pp. 34–40 | **Higher decoding with a code table and mutation effects missing (CCEA 2023 Q10)**; **no reason for A–T, C–G (large with small; CCEA 2022 Q7)**; bacterial DNA only a clause | **thinner** |
| [b2-mitosis-meiosis](b2-mitosis-meiosis.md) | 2.4: pp. 41–46 | No drawing task (CCEA 2023 Q9: 3 + 4 marks); no backwards task (parent from gamete); no line-up frame for mitosis | richer |
| [b2-monohybrid-genetics](b2-monohybrid-genetics.md) | 2.4: pp. 47–54 | Pedigrees taught for a recessive allele only; "draw both squares" only inside the test cross; no plant cross | richer |
| [b2-sex-determination-genetic-conditions-screening](b2-sex-determination-genetic-conditions-screening.md) | 2.4: pp. 54–62 | No effects of the conditions (what cystic fibrosis and Huntington's do); no dominant pedigree; Down's lacks its cause (meiosis error) and maternal age | richer |
| [b2-genetic-engineering](b2-genetic-engineering.md) | 2.4: pp. 62–66 | No second product (erythropoietin; spec "other products"); bacteria's own proteins not named as what purification removes; advantages not ranked | richer |
| [b2-variation](b2-variation.md) | 2.5: pp. 67–70 | No histogram-to-curve, no "most in the middle"; sexual reproduction's two mechanisms missing; more CCEA examples (thumb length, ear lobes) | richer |
| [b2-natural-selection-selective-breeding](b2-natural-selection-selective-breeding.md) | 2.5: pp. 70–74 | No timing-mismatch (climate) context; no breeding downside; the real finch example unnamed | richer |
| [b2-health-communicable-diseases-aseptic](b2-health-communicable-diseases-aseptic.md) | 2.6: pp. 75–82 | Tuberculosis and potato-blight prevention beyond vaccine and fungicide; HIV from mother to baby; rest and fluids as usual treatment | richer |
| [b2-defence-mechanisms-immunity](b2-defence-mechanisms-immunity.md) | 2.6: pp. 82–85 | Cilia, swallowing and stomach acid; passive immunity across the placenta and why; tetanus as the named context (CCEA 2021 Q8) | richer |
| [b2-antibiotics-resistance-vaccines](b2-antibiotics-resistance-vaccines.md) | 2.6: pp. 86–91 | "No zone means resistant" too strong; no tetanus injection-against-vaccine contrast; hospital measures without their reasons | richer |
| [b2-non-communicable-diseases-cancer](b2-non-communicable-diseases-cancer.md) | 2.6: pp. 91–93, 97–98 | **No note exists.** First priorities: tobacco chemicals paired with effects (six-marker 2025); cancer cells, benign and malignant (2021, 2022, 2024); lifestyle and cancer risk | **thinner** (unauthored) |
| [b2-heart-attacks-strokes](b2-heart-attacks-strokes.md) | 2.6: pp. 94–97 | **No note exists.** First priorities: the causal chain, one mark a link (2024, 2025); the four treatments and the link each breaks; trial data | **thinner** (unauthored) |

---

## Book content that maps to no topic of ours

1. **Topics in our taxonomy with no note or bundle yet** (the largest unmapped block, about eight pages): non-communicable disease, alcohol, tobacco, diabetes and cancer (pp. 91–93, 97–98; B2 2.6.9, 2.6.10, 2.6.14, 2.6.15 → slug `b2-non-communicable-diseases-cancer`); blocked vessels, heart attack, stroke and their treatments (pp. 94–97; B2 2.6.11, 2.6.12, 2.6.13 → slug `b2-heart-attacks-strokes`). Both are examined every year; see their dossiers.
2. **Colour blindness** as a second sex-linked condition (p. 59): no specification statement (2.4.10 names haemophilia only). Leave out, or flag as not on spec.
3. **The discovery of DNA's structure** at Cambridge in the 1950s (p. 36): no statement; context for 2.4.4 only.
4. **Darwin, his voyages and his 1859 book** (p. 73): context for the Higher evolution bullet of 2.5.3; not examined.
5. **Hydrogen bonds between bases and the nucleotide as the repeating unit** (pp. 36–37): not named in 2.4.4, but they support it, and CCEA 2022 Higher credited the numbers of bonds between partner bases.
6. **Polydactyly** (pp. 57–58): not a specification condition; it serves 2.4.8's Higher pedigree bullet as a dominant example.
7. **Long-term effects of diabetes** (eye damage, kidney failure; p. 91): these belong to B1 1.6.7, not B2.
8. **Weekly alcohol guidelines and the legal driving limit** (p. 92): context for the alcohol bullet of 2.6.9 (maps to the unauthored NCD topic).
9. **Mineral transport from the root hairs** (p. 9): a B1 link (1.7.11) inside 2.1.6.

Every other page maps to an authored topic, as the table shows.

---

## Errors and doubtful statements in the book (do not copy)

- p. 14: the lungs row of the organ-vessel table has the pulmonary artery and vein the wrong way round (the book corrects itself on p. 15).
- p. 13: arteries called the largest vessels in the body.
- p. 37: the detailed DNA ladder joins each base to a phosphate, contradicting the book's own text (bases hang from sugars).
- p. 40: the code table is not the real genetic code (three wrong entries on its own convention) and uses a different convention from CCEA's 2023 paper.
- p. 44: each cell after meiosis's first division labelled "46 chromosomes".
- p. 63 and p. 65: the engineered gene labelled erythropoietin while the caption says insulin; a plasmid labelled "bacteria".
- p. 78: colds and flu said to spread from people infected "with the bacteria"; a prevention measure in the potato-blight treatment cell; HPV missing from the disease table.
- p. 80: working near a flame said to leave the air near the plate free of bacteria.
- p. 85: breast-feeding attributed to the foetus.
- p. 90: the tetanus vaccine said to contain modified bacteria (it is made from the inactivated toxin).
- p. 92: light drinking suggested to be beneficial.
- p. 94 and p. 96: a heart attack ending with the heart stopping (CCEA's scheme ends at heart muscle cells dying).
- p. 97: a fitter heart said to reduce cholesterol deposition.
- p. 106: the binge-drinking answer quotes "units" for mg per 100 cm³, and misreads the limit crossings on the book's own graph.
- p. 8: sketch graphs for wind and temperature drawn as straight lines from the origin (a still or cool day still has transpiration).

## Things in our notes that need attention (from section 11 of each dossier)

- `b2-heart-double-circulation`: a gate explanation and a worked example argue that resting cardiac output rises with training; keep the specification's phrase as the answer but teach "more blood per beat, so a slower resting pulse" (CCEA 2019 accepts either).
- `b2-antibiotics-resistance-vaccines`: "no clear zone means the bacteria are resistant" is too strong (the dose may be too weak).
- `b2-osmosis`: bundle item `q.science.b2.b2-osmosis.0012(a)` requires the answer *flaccid*, a word neither the book, the specification nor any CCEA scheme uses.
- `b2-mitosis-meiosis` (found while reading, not from the book): the callout "Pick the right four, not just four" sits over an exercise whose six nuclei contain only three correct ones.
- `b2-monohybrid-genetics`: the pedigree rule "start with the shaded symbols: every one is bb" holds only when shading marks the recessive phenotype.
- `b2-sex-hormones-menstrual-cycle`: the lining curve keeps rising to day 24, where the book holds it level after day 14; reconcile the figure and re-check the bundle's readings.
- `b2-health-communicable-diseases-aseptic`: say the dish is taped with a few strips rather than "sealed"; add rest and fluids beside antibiotics for salmonella.

## Scheme evidence that surfaced while checking (useful beyond this folder)

- CCEA 2022 Higher Q7(b)(ii): two marks for **why** bases pair as they do (a large base with a small one; matching numbers of bonds).
- CCEA 2023 Higher Q10(b): decoding a strand with a supplied DNA-triplet table, the amino acid after a base change, and its result.
- CCEA 2023 Higher Q9(a)–(b): **drawing** the products of mitosis (3) and of meiosis (4), with the features each mark needs.
- CCEA 2019 B2 (Foundation Q10(b)–(c), Higher Q3(b)–(c)): three marks for comparing three people's pulse data; "more blood per beat" accepted for the training effect.
- CCEA 2019 Higher Q8(a)(ii): three accepted routes for why light raises water uptake.
- CCEA 2024 Higher Q6(f) and 2025 Higher Q6(a)(ii): the causes of infertility credited (including erectile dysfunction and a hostile vagina).
- CCEA 2021 Higher Q8: tetanus, passive antibody injection against active vaccination, and a booster graph.
