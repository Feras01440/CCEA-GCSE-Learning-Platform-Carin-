# CCEA GCSE Science Double Award (2017) — Specification Research Report

**Dimension:** science-spec
**Researched:** 1 September 2026
**Method:** Primary sources only. All CCEA HTML pages were fetched with `curl` (WebFetch returns HTTP 403 on ccea.org.uk HTML pages, but PDFs download fine). PDFs were converted with `pdftotext` and read in full. Every URL below was actually fetched (HTTP 200) unless marked otherwise.

> **Grading reminder for the whole platform:** CCEA GCSEs are graded **A\*–G with an additional C\*** grade (not 9–1). Double Award Science issues **two** grades on a scale from **A\*A\* down to GG**. Foundation Tier units target C\*–G; Higher Tier units target A\*–D (with an "allowable E").

---

## 1. Identity of the qualification

| Item | Value | Source |
|---|---|---|
| Title | CCEA GCSE Specification in Double Award Science | Spec p.1 |
| Subject code | **1370** (classification code also 1370) | Spec p.1, 1.4 |
| QAN | 603/1374/2 | Spec p.2 |
| CCEA qualification id used on website / past-paper feed | **584** | Past-paper JSON feed |
| Entry-code prefix on timetables | **GDW** (e.g. GDW11 = DAS Biology Unit 1 Foundation, GDW12 = Higher; GDW21/22 Chemistry U1; GDW31/32 Physics U1; GDW41/42 Biology U2; GDW51/52 Chemistry U2; GDW61/62 Physics U2; GDW71 = Unit 7 Foundation, GDW75 = Unit 7 Higher; Booklet B "Practical Theory" papers GDW72/76 Bio, GDW73/77 Chem, GDW74/78 Phys) | GCSE Timetables; Practical Skills Instructions to Teachers 2026 |
| First teaching | September 2017 | Spec p.1 |
| First assessment | February 2018 (Units B1, C1, P1) | Spec p.1 |
| First award | Summer 2019 | Spec p.1 |
| Guided learning hours | 240 (it is a double GCSE) | Spec 1 |
| Current spec PDF (the one linked from the subject page) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/GCSE%20Science%20Double%20Award%20%282017%29-specification-Standard_0.pdf | Subject page |
| Older filename of the same spec (also still live) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Double%20Award%20(2017)/GCSE%20Science%20Double%20Award%20(2017)-specification-Standard.pdf | Search result |
| Irish-medium spec | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/GCSE%20Science%20Double%20Award%20%282017%29-specification-Irish-medium.pdf | Subject page |
| Subject microsite (HTML) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017 | fetched via curl |
| Specification snapshot (1-page overview) | https://ccea.org.uk/downloads/docs/Support/General/2019/Snapshot_26.pdf | fetched |

The spec PDF text carries no "Version n" footer (unlike CCEA Maths). The website's file is `-specification-Standard_0.pdf` (a re-upload of the 2017 document). There is no evidence of a content revision since 2017; the only spec addenda are the Covid-era assessment addenda for 2021–22 and 2022–23 (advance information), which no longer apply:

- 2021–22 addendum: https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Double%20Award%20(2017)/GCSE%20Science%20Double%20Award%20(2017)-spec-addendum-2022-Standard.pdf
- 2022–23 addendum: https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Double%20Award%20(2017)/GCSE%20Science%20Double%20Award%20(2017)-spec-addendum-2023-Standard.pdf

---

## 2. Unit structure, tiers, durations, marks, weightings (Specification at a Glance, Section 2)

| Unit | Title | Assessment | Tiers | Duration | Raw marks (Summer 2025 papers) | Weighting | Availability (per spec) |
|---|---|---|---|---|---|---|---|
| **B1** | Biology Unit B1: Cells, Living Processes and Biodiversity | External written exam; compulsory structured questions (short responses, extended writing, calculations) | Foundation & Higher | **1 hour** | FT 60 / HT 70 | **11%** | November, February(March) and Summer; from Feb 2018 |
| **C1** | Chemistry Unit C1: Structures, Trends, Chemical Reactions, Quantitative Chemistry and Analysis | as above (Data Leaflet incl. Periodic Table provided) | F & H | **1 hour** | HT 70 | **11%** | Nov, Feb/Mar, Summer |
| **P1** | Physics Unit P1: Motion, Force, Moments, Energy, Density, Kinetic Theory, Radioactivity, Nuclear Fission and Fusion | as above | F & H | **1 hour** | HT 70 | **11%** | Nov, Feb/Mar, Summer |
| **B2** | Biology Unit B2: Body Systems, Genetics, Microorganisms and Health | as above | F & H | **1 hour 15 mins** | HT 80 | **14%** | Summer only (from 2019) |
| **C2** | Chemistry Unit C2: Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry | as above (Data Leaflet provided) | F & H | **1 hour 15 mins** | HT 80 | **14%** | Summer only |
| **P2** | Physics Unit P2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics | as above | F & H | **1 hour 15 mins** | HT 80 | **14%** | Summer only |
| **Unit 7 Booklet A** | Practical Skills — three pre-release practical tasks (one Biology, one Chemistry, one Physics), carried out in the lab, externally marked | Practical skills assessment | F & H (same tier for whole Unit 7) | **3 hours total** (1 h Biology + 1 h Chemistry + 1 h Physics) | 15 marks per discipline = 45 | **7.5%** | Completed between 1 January (spec) / 1 December (2026 instructions) and 1 May; from 2019 |
| **Unit 7 Booklet B** | Practical Skills — written exam "all set in a practical context" for Biology, Chemistry and Physics ("Practical Theory" on timetables) | External written exam | F & H | **1 hour 30 mins total** (30 min Biology + 30 min Chemistry + 30 min Physics, sat as three separate 30-min papers straight after the Unit 2 papers) | 35 marks per discipline (HT) = 105 | **17.5%** | Summer only |
| | | | | | | **Unit 7 total 25%** | |

Sources: Spec Section 2 (pp. 6–8); raw marks read from the front pages of the Summer 2025 question papers (URLs in Section 9); Booklet B sub-paper timings from the GCSE timetables.

Rules (Spec 1.2 and 4.1):
- Unitised; **B1, C1 and P1 can be sat in the first year**; B2, C2, P2 and Unit 7 are Summer-only.
- **Each unit may be resat once**; the better result counts unless the unit is needed for the terminal rule.
- **Terminal rule: at least 40% of the assessment (by unit weighting) must be taken in the series in which the qualification is cashed in.**
- Candidates may enter different units at different tiers, but all components of Unit 7 must be at the same tier (Instructions to Teachers 2026, section 2).
- Quality of Written Communication (QWC): **one 6-mark QWC question in each of B1, B2, C1, C2, P1, P2 and in each Booklet B**, marked with a three-band scheme (Spec 4.4). Front pages of the Summer 2025 papers confirm this (e.g. B1 HT Q2, B2 HT Q4, C1 HT Q2(b), C2 HT Q3(a), P1 HT Q3, P2 HT Q1, Booklet B Biology HT Q1(b), Booklet B Physics HT Q1(a)).
- Calculators are allowed in every paper ("You may use a scientific calculator" on all front pages).
- **Chemistry papers (C1, C2, Unit 7 Chemistry A and B) include a Data Leaflet with the Periodic Table** (Spec Appendix 3; confirmed on the C1 HT 2025 front page). Standalone copy: https://ccea.org.uk/downloads/docs/Support/General/2019/Data%20Leaflet%3A%20Chemistry_1.pdf
- **Physics: no formula sheet.** Every equation in the spec is prefixed "recall and use"; the Chief Examiner repeatedly praises "recall of several Physics formulas contained in the specification" and warns that "a wrong physics equation leading to a correct numerical answer will lead to no marks" (March 2026 report). The platform must therefore drill equation recall.

### Assessment-series changes announced August 2026 (important for 2026/27 and 2027/28 cohorts)

Circular S/IF/35/26 (August 2026) and the CCEA FAQ "November and March Examination Series Changes (from 2026/27)":
- **March 2027 is the last March series for Single and Double Award Science.** From March 2028 Science is removed from March entirely; Science then has two series a year (November and Summer).
- November series continues as normal for Double Award Science (it is only Maths/English whose November series becomes resit-only from Nov 2027).
- Cohort scenarios (FAQ p.9): students starting Sept 2025 → cash-in Summer 2027 can use Nov 2026 and Mar 2027; students starting Sept 2026 → cash-in Summer 2028 can use Nov 2026, Mar 2027, Summer 2027, Nov 2027 only; students starting Sept 2027 → November and Summer only.
- Circular: https://ccea.org.uk/downloads/docs/Circulars/S/2026/August/S-IF-35-26-August.pdf
- FAQ PDF: https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/November%20and%20March%20Examination%20Series%20Changes%20%28from%20202627%29.pdf (reached via https://ccea.org.uk/document/24166)
- Updates page: https://ccea.org.uk/examiner-centre-support/examinations-support/202627-assessment-updates

---

## 3. Grading (Spec 4.5 and 1.2)

- Unit results are reported on a uniform mark scale weighted by unit.
- **Foundation Tier: notional grades C\*–G. Higher Tier: notional grades A\*–D (with allowable E).**
- Overall: uniform marks aggregated; **Double Award grades run from A\*A\* (highest) to GG; below GG = U (unclassified).** Two grades are issued "such as AA or AB" (spec) / "AB or BC" (snapshot).
- The intermediate double grades therefore run through the CCEA single-grade ladder A\*, A, B, C\*, C, D, E, F, G in adjacent pairs (A\*A\*, A\*A, AA, AB, BB, BC\*, C\*C\*, C\*C, CC, CD, DD, DE, EE, EF, FF, FG, GG). The spec only states the end-points and examples; the exact intermediate list is **not printed in text form** in any document I could parse. CCEA published (2026) a document "Grade Outcomes for Double Award Science Tier Combinations" — https://ccea.org.uk/downloads/docs/Support/General/2026/Grade%20Outcomes%20for%20Double%20Award%20Science%20Tier%20Combinations.pdf — which is an image-only PDF (no extractable text, no local renderer available). **Open action: open this PDF manually and transcribe the grade-outcome table** (it should show which double grades are reachable for each Foundation/Higher unit-tier mix).
- Grade descriptions for A, C and F are in Spec Section 5.

---

## 4. Assessment objectives (Spec 4.2, 4.3)

| AO | Description | Unit 1s (B1/C1/P1 each) | Unit 2s (B2/C2/P2 each) | Unit 7 | Overall |
|---|---|---|---|---|---|
| **AO1** | Demonstrate knowledge and understanding of scientific ideas; scientific techniques and procedures | 5 % | 5.33 % | 9 % | **40 %** |
| **AO2** | Apply knowledge and understanding of, and develop skills in, scientific ideas; scientific enquiry, techniques and procedures | 5 % | 5.67 % | 8 % | **40 %** |
| **AO3** | Analyse scientific information and ideas to interpret and evaluate; make judgements and draw conclusions; develop and improve experimental procedures | 1 % | 3 % | 8 % | **20 %** |
| Total | | 11 % | 14 % | 25 % | 100 % |

Mathematics: at least **20% of total marks credit mathematical skills, split Biology : Chemistry : Physics = 1 : 2 : 3** (Appendix 1). Maths must not exceed GCSE Mathematics of the corresponding tier. Appendix 1 lists the required skills (decimals, standard form, ratios/percentages, significant figures, means, frequency tables/bar charts/histograms, sampling, probability, mean/mode/median, scatter diagrams, order-of-magnitude, symbols = < << >> > ∝ ~, changing the subject, substitution, solving simple equations, graphs incl. y = mx + c, gradient/intercept, tangent to a curve as rate, area under a curve by counting squares, angles in degrees, 2D/3D representation, areas of triangles/rectangles and surface area/volume of cubes) and a units table (mol, mol/dm³, g/dm³, A, J, kJ, m, cm, mm, nm, km, g, kg, t, V, W, atm, N/m², Pa, Ω, °C, s, min, h, dm³, cm³, m³; prefixes nano, milli, centi, deci, kilo).

Appendix 2 "How Science Works" lists the enquiry skills that are assessed in context in every paper (models, peer review, hypotheses, planning, risk, sampling, data presentation, uncertainty, accuracy/precision/repeatability/reproducibility, random/systematic error, SI units and prefixes, significant figures).

---

## 5. Full subject content (Spec Section 3)

Conventions in the spec: Higher-Tier-only content is printed in **bold** in the PDF; Foundation papers are set only on non-bold content; Higher papers may be set on anything. The 18 prescribed practicals are printed in italics. **Caveat:** `pdftotext` does not preserve bold, so the tier flag for individual learning outcomes below is not machine-verified. Where the spec prose states a tier (e.g. "At Higher Tier, students are introduced to the concept of vectors and scalars") I have marked it; otherwise use the CCEA eGuides, which are published as separate *Foundation Tier* and *Higher Tier* PDFs per unit (Section 9), to confirm tiering before building content. Numbering below is the spec's own learning-outcome numbering (biology 1.x / 2.x, chemistry 1.x / 2.x, physics 1.x / 2.x are separate sequences per discipline).

### 5.1 Biology Unit B1: Cells, Living Processes and Biodiversity (1 h, 11 %)

**1.1 Cells** — Microscopy; Animal cells; Plant cells; Bacterial cells; Specialisation
- 1.1.1 make a temporary slide and use a light microscope to examine typical plant and animal cells
- 1.1.2 animal cell structure/function: nucleus and chromosomes, cytoplasm, mitochondria (site of respiration), cell and nuclear membranes
- 1.1.3 plant cells: cellulose cell wall, large permanent vacuole, chloroplasts
- 1.1.4 bacterial vs plant/animal cells: non-cellulose wall, no nucleus, plasmids
- 1.1.5 cells → specialised tissues, organs, organ systems

**1.2 Photosynthesis and plants** — Equation; Investigating photosynthesis; Limiting factors; Gas exchange; Leaf structure
- 1.2.1 photosynthesis as endothermic, in chloroplasts, chlorophyll absorbs light, produces sugars and starch
- 1.2.2 word equation and balanced equation 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (light/chlorophyll)
- 1.2.3 investigations: destarching, starch test (boil in water, boil in ethanol, soften, iodine), production of oxygen, NaOH to remove CO₂, variegated leaf — **Prescribed Practical B1**
- 1.2.4 limiting factors: temperature, light intensity, CO₂ concentration; interpret data
- 1.2.5 photosynthesis/respiration and gas exchange; hydrogencarbonate indicator (high CO₂ yellow, normal red, low purple); compensation point
- 1.2.6 mesophytic leaf structure and adaptations: epidermis, waxy cuticle, palisade mesophyll, spongy mesophyll, intercellular spaces, guard cells and stomata

**1.3 Nutrition and food tests** — Biological molecules; Food and energy
- 1.3.1 reagents and colour changes: Benedict's (blue → brick red), iodine (yellow-brown → blue-black), Biuret (blue → lilac/purple), ethanol (colourless → white emulsion)
- 1.3.2 carry out food tests (reducing sugar, starch, protein, fat)
- 1.3.3 importance of carbohydrates (simple: glucose, lactose; complex: cellulose, starch, glycogen), fats/lipids (fatty acids + glycerol), proteins (amino acids)
- **Prescribed Practical B2**: energy content of food by burning food samples

**1.4 Enzymes and digestion**
- 1.4.1 enzymes as protein biological catalysts (carbohydrase/amylase, lipase, protease); lock and key model
- 1.4.2 effect of temperature, pH, enzyme concentration and inhibitors; optimum; denaturation (irreversible change of active site) — **Prescribed Practical B3** (temperature and enzyme action)
- 1.4.3 digestion: large insoluble → small soluble molecules; commercial uses incl. biological washing powders

**1.5 The respiratory system, breathing and respiration** — Respiratory surfaces; Respiration; Equation; Aerobic and anaerobic
- 1.5.1 adaptations of respiratory surfaces (large SA, thin, moist, permeable, good blood supply, diffusion gradient)
- 1.5.2 effect of exercise on depth and rate of breathing
- 1.5.3 respiration exothermic, in mitochondria; uses of energy (heat, movement, growth, reproduction, active transport)
- 1.5.4 word and balanced equation C₆H₁₂O₆ + 6O₂ → energy + 6CO₂ + 6H₂O
- 1.5.5 aerobic vs anaerobic: muscle (glucose → energy + lactic acid); yeast (glucose → energy + alcohol + CO₂)
- 1.5.6 practical work on yeast respiration

**1.6 Nervous system and hormones** — CNS; Voluntary and reflex actions; Reflex arc; Homeostasis; Hormones; Diabetes; Excretory system; Osmoregulation; Plant hormones
- 1.6.1 compare nervous and hormonal communication (speed, nature of response)
- 1.6.2 CNS = brain + spinal cord; receptors and effectors
- 1.6.3 voluntary vs reflex actions
- 1.6.4 spinal reflex arc: receptor, sensory/association/motor neurones, synapses, effector
- 1.6.5 homeostasis limited to blood glucose and osmoregulation
- 1.6.6 hormones as chemical messengers; pancreas monitors glucose, insulin, liver absorbs glucose → glycogen
- 1.6.7 diabetes: Type 1, Type 2, symptoms, long-term effects, rising incidence
- 1.6.8 excretory system gross structure: kidney (renal artery/vein, cortex, medulla, pelvis; no nephron), ureters, bladder, urethra
- 1.6.9 osmoregulation: water gain/loss, kidney filtration and reabsorption
- 1.6.10 ADH causes kidney to reabsorb more water (negative feedback not required)
- 1.6.11 plant hormones; phototropism via auxin
- 1.6.12 extended phototropism (auxin made at tip, moves down, uneven distribution, cell elongation) — likely Higher only

**1.7 Ecological relationships and energy flow** — Fieldwork; Competition; Sun as energy source; Food chains and webs; Decomposition; Carbon cycle; Nitrogen cycle; Minerals; Eutrophication
- 1.7.1 biodiversity, population, habitat, environment, community, ecosystem
- 1.7.2 measure biotic and abiotic factors (wind speed, water, pH, light, temperature, biodiversity)
- 1.7.3 quadrats: belt transect and random sampling — **Prescribed Practical B4**
- 1.7.4 adaptation and competition (plants: water, light, space, minerals; animals: water, food, territory, mates, predators); human influence
- 1.7.5 Sun as energy source; producers
- 1.7.6 food chains/webs, trophic levels, arrows show transfer of substances and energy
- 1.7.7 saprophytic decomposition (enzymes, extracellular digestion, absorption; recycling; humus)
- 1.7.8 investigate decay (temperature, water content; aerobic/anaerobic)
- 1.7.9 carbon cycle (photosynthesis, respiration, combustion, fossilisation, feeding, excretion, egestion, decomposition)
- 1.7.10 nitrogen cycle (nitrogen fixation, nitrification, denitrification, decomposition; waterlogging)
- 1.7.11 mineral absorption by root hair cells via active transport; nitrates for proteins
- 1.7.12 eutrophication (nitrates → algal growth → death/shading → aerobic decomposition → oxygen depletion)

### 5.2 Biology Unit B2: Body Systems, Genetics, Microorganisms and Health (1 h 15 min, 14 %)

**2.1 Osmosis and plant transport** — Osmosis, plasmolysis and turgidity; Potometer; Transpiration; Uses of water
- **Prescribed Practical B5**: osmosis by change in length/mass of plant tissue or Visking-tubing model cells
- 2.1.1 plasmolysed and turgid cells; 2.1.2 osmosis definition (dilute → concentrated across selectively permeable membrane); 2.1.3 role of cell wall
- **Prescribed Practical B6**: potometer (bubble and weight) for water uptake; washing-line method for water loss
- 2.1.4 transpiration definition; 2.1.5 effect of surface area, wind, temperature, humidity, light intensity; 2.1.6 uses of water (support, transport, transpiration, photosynthesis)

**2.2 The circulatory system** — Blood components; Cell lysis; Blood vessels; Effects of exercise; The heart
- 2.2.1 blood smear: red cells (biconcave, no nucleus, haemoglobin/iron), white cells, platelets (fibrinogen → fibrin), plasma
- 2.2.2 red cells in water → lysis
- 2.2.3 arteries/veins/capillaries structure vs function (wall thickness, muscle/elastic fibres, lumen, valves)
- 2.2.4 roles of vessel types
- 2.2.5 vessels entering/leaving heart, lungs, liver, kidneys, intestine; double circulation
- 2.2.6 exercise and pulse rate; benefits of regular exercise
- 2.2.7 heart structure: four chambers, valves, wall thickness, coronary vessels

**2.3 Reproduction, fertility and contraception** — Sperm formation and pregnancy; Sex hormones; Menstrual cycle; Infertility; Contraception
- 2.3.1 male system (testes, urethra, scrotum, penis, sperm tube, prostate); 2.3.2 female system (ovaries, oviducts, uterus, cervix, vagina)
- 2.3.3 sperm as specialised cells (meiosis, haploid, mitochondria, flagellum); fertilisation in oviduct; zygote → mitosis → implantation → differentiation; placenta and villi; umbilical cord; amnion
- 2.3.4 testosterone and oestrogen; secondary sexual characteristics
- 2.3.5 menstrual cycle (menstruation, ovulation, fertile window, oestrogen and progesterone)
- 2.3.6 infertility and treatments (hormones for multiple ova, IVF, embryo transfer)
- 2.3.7 contraception: mechanical (condoms; STIs incl. HIV, chlamydia), chemical (pill, implants), surgical (sterilisation); ethical issues

**2.4 Genome, chromosomes, DNA and genetics** — Chromosomes; Genes and alleles; DNA structure; Cell division; Mitosis; Meiosis; Genetic diagrams; X and Y; Genetic conditions; Genetic screening; Genetic engineering
- 2.4.1 genome; 2.4.2 chromosomes in functional pairs (not gametes/bacteria); 2.4.3 genes and alleles
- 2.4.4 DNA: phosphate–deoxyribose backbone, bases, double helix, base pairing, base triplet hypothesis (no transcription/translation)
- 2.4.5 mitosis in the cell cycle (growth, replacement, repair); 2.4.6 mitosis → identical daughter cells/clones
- 2.4.7 meiosis as reduction division → four genetically different haploid cells; independent assortment (no crossing over/stages)
- 2.4.8 monohybrid genetics: dominant/recessive, genotype/phenotype, gametes, ratios/percentages/probabilities, homozygous/heterozygous, Punnett squares, test (back) crosses, pedigree diagrams
- 2.4.9 sex determination; 2.4.10 inheritance of haemophilia, cystic fibrosis, Huntington's disease, Down's syndrome
- 2.4.11 genetic screening ethics (who decides, amniocentesis vs blood tests, carrier dilemmas, insurance)
- 2.4.12 genetic engineering: human insulin via plasmid in bacteria, fermenter, restriction enzymes/sticky ends, downstreaming, advantages

**2.5 Variation and natural selection** — Types of variation; Natural selection; Selective breeding
- 2.5.1 continuous (height/length → histogram) vs discontinuous (tongue rolling, hand dominance → bar chart)
- 2.5.2 genetic (mutation, sexual reproduction) and environmental bases
- 2.5.3 natural selection → evolution or extinction; antibiotic resistance example; speciation
- 2.5.4 selective breeding in food plants and domesticated animals

**2.6 Health, disease, defence mechanisms and treatments** — Communicable diseases; Aseptic techniques; Defence mechanisms; Antibiotics; Antibiotic-resistant bacteria; Vaccinations; Non-communicable diseases; Heart attacks and strokes; Cancer
- 2.6.1 health definition; 2.6.2 costs to society/NHS
- 2.6.3 communicable diseases: bacteria (chlamydia, salmonella, TB), viruses (HIV/AIDS, cold and flu, HPV), fungi (athlete's foot, potato blight)
- 2.6.4 aseptic technique (autoclaving, flaming, alcohol; partially covered dishes near Bunsen; incubate max 25 °C; disposal)
- 2.6.5 defences: skin, mucous membranes, clotting; antibodies from lymphocytes; antibody–antigen reaction; phagocytes; memory lymphocytes/secondary response; active vs passive immunity
- 2.6.6 antibiotics (e.g. penicillin, from fungi); 2.6.7 overuse → resistance, MRSA, control procedures
- 2.6.8 vaccines: modified organisms, antibody and memory-cell levels, boosters, interpret antibody graphs
- 2.6.9 non-communicable disease risk factors: inherited; diet; exercise/obesity; UV → skin cancer; alcohol (liver disease, foetal alcohol syndrome); tobacco (tar → bronchitis, emphysema, lung cancer; nicotine; carbon monoxide)
- 2.6.10 obesity → cardiovascular disease and Type 2 diabetes
- 2.6.11 blockage of a blood vessel (cholesterol → clot → reduced oxygen/glucose → cell death; coronary → heart attack; brain → stroke)
- 2.6.12 treatments: angioplasty and stents; statins and aspirin; 2.6.13 lifestyle risk factors
- 2.6.14 cancer: uncontrolled division; benign vs malignant; 2.6.15 lifestyle and cancer risk (cervical/HPV vaccine, lung/smoking, skin/UV)

### 5.3 Chemistry Unit C1: Structures, Trends, Chemical Reactions, Quantitative Chemistry and Analysis (1 h, 11 %)

**1.1 Atomic structure** — 1.1.1 nucleus (protons, neutrons) and electron shells; 1.1.2 relative charges/masses; 1.1.3 atomic number; 1.1.4 mass number; 1.1.5 neutral atoms; 1.1.6 calculate p/n/e in atoms and ions; 1.1.7 electronic configurations for Z = 1–20; 1.1.8 isotopes definition; 1.1.9 identify isotopes from data; 1.1.10 relative atomic mass from isotope abundances; 1.1.11 compound definition

**1.2 Bonding** — Ionic; Covalent; Metallic — 1.2.1 ions and molecular ions; 1.2.2 cation/anion; 1.2.3 dot-and-cross for Groups 1/2 with 6/7; 1.2.4 ionic bonds strong, substantial energy to break; 1.2.5 ionic typical of metal compounds; 1.2.6 covalent bond = shared pair; 1.2.7 dot-and-cross for H₂, Cl₂, HCl, H₂O, NH₃, CH₄ (lone pairs); 1.2.8 multiple bonds O₂, N₂, CO₂; 1.2.9 covalent typical of non-metals; 1.2.10 molecule/diatomic; 1.2.11 covalent bonds strong; 1.2.12 line representation; 1.2.13 metallic bonding (positive ions in lattice + delocalised electrons)

**1.3 Structures** — Ionic; Molecular covalent; Giant covalent; Metallic; Structure and bonding of carbon; Classification — 1.3.1 giant ionic lattice properties (NaCl); 1.3.2 ionic solubility; 1.3.3 molecular covalent (iodine, CO₂); 1.3.4 van der Waals' forces; 1.3.5 covalent insolubility; 1.3.6 diamond and graphite properties and uses; 1.3.7 metals (melting point, malleability, ductility, conductivity); 1.3.8 alloys; 1.3.9 carbon forms four bonds; 1.3.10 graphene; 1.3.11 allotropes; 1.3.12 classify structures from data

**1.4 Nanoparticles** — 1.4.1 1–100 nm, few hundred atoms; 1.4.2 sun creams: benefits and risks (cell damage, environment)

**1.5 Symbols, formulae and equations** (tested throughout C1 and C2) — 1.5.1 symbols and diatomic elements; 1.5.2 interpret formulae; 1.5.3 write formulae; 1.5.4 reactants/products; 1.5.5 word equations; 1.5.6 conservation of atoms; 1.5.7 balanced symbol equations (incl. unfamiliar reactions); 1.5.8 ionic equations; 1.5.9 half equations; 1.5.10 state symbols

**1.6 The Periodic Table** — Basic structure; Group 1; Group 7; Group 0; Transition metals — 1.6.1–1.6.2 Mendeleev vs modern table; 1.6.3 element definition; 1.6.4 groups/periods; 1.6.5 metals vs non-metals (conduction, ductility, malleability, m.p., sonority); 1.6.6 states at rtp; 1.6.7 outer electrons and group properties; 1.6.8 group names/locations; 1.6.9–1.6.15 alkali metals (density, storage/risk, reaction with water + observations, ion formation, half equations, trend, white compounds/colourless solutions); 1.6.16–1.6.22 halogens (colour, state, diatomicity, toxicity; iodine sublimation; chlorine test with damp UI paper; displacement reactions; trend; halide ion half equations); 1.6.23–1.6.25 noble gases (stability, colourless, boiling-point trend); 1.6.26 transition metals (variable charge; CuO black, CuCO₃ green, hydrated CuSO₄ blue, Cu(II) solutions blue)

**1.7 Quantitative chemistry** — Formula mass; The mole; Percentage yield — 1.7.1 Ar relative to carbon-12; 1.7.2 Mr and % by mass; 1.7.3 mole and molar mass; 1.7.4 mass ↔ moles; 1.7.5 reacting masses incl. limiting reactant; 1.7.6 theoretical and percentage yield; 1.7.7 reasons yield < 100 %

**1.8 Acids, bases and salts** — Indicators and pH; Reactions of acids; Salts — 1.8.1 litmus, UI paper, pH meter; 1.8.2 pH classification (0–2 strong acid, 3–6 weak acid, 7 neutral, 8–11 weak alkali, 12–14 strong alkali); 1.8.3–1.8.5 H⁺ and OH⁻; 1.8.6 strong acids/alkalis (HCl, H₂SO₄, HNO₃; NaOH, KOH); 1.8.7 weak acids/alkalis (ethanoic, carbonic; ammonia); 1.8.8 dilute/concentrated; 1.8.9 neutralisation H⁺ + OH⁻ → H₂O; 1.8.10 temperature change in neutralisation (exothermic); 1.8.11 base/alkali definitions; 1.8.12 reactions of HCl/H₂SO₄/HNO₃ with metals, bases, carbonates, hydrogencarbonates (observations and equations); 1.8.13 hydrogen test; 1.8.14 CO₂ test; 1.8.15 salt definition; 1.8.16 colours of salts; 1.8.17 GHS/CLP hazard symbols — **Prescribed Practical C1**: reactions of acids incl. temperature changes

**1.9 Chemical analysis** — Assessing purity and separating mixtures; Tests for ions — 1.9.1 pure substance; 1.9.2 melting/boiling points and purity; 1.9.3 formulations; 1.9.4 vocabulary (soluble, solute, solvent, residue, filtrate, distillate, miscible, immiscible …); 1.9.5 filtration, crystallisation, paper chromatography, simple and fractional distillation; 1.9.6 chromatography (mobile/stationary phase); 1.9.7 Rf values; 1.9.8 choose separation methods; 1.9.9 anhydrous copper(II) sulfate test for water; 1.9.10 flame test procedure (nichrome wire, conc. HCl); 1.9.11 flame colours: Li crimson, Na yellow/orange, K lilac, Ca brick red, Cu(II) blue-green — **Prescribed Practical C2**: flame tests

### 5.4 Chemistry Unit C2: Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry (1 h 15 min, 14 %)

**2.1 Metals and the reactivity series** — 2.1.1 series K, Na, Ca, Mg, Al, Zn, Fe, Cu; 2.1.2 reactions with air, water, steam and gas collection; 2.1.3 reactivity and ion formation; 2.1.4 displacement in solution; 2.1.5 place unfamiliar elements; 2.1.6 extraction vs position (Al electrolysis, Fe reduction) — **Prescribed Practical C3**: reactivity of metals

**2.2 Redox, rusting and iron** — 2.2.1 redox as oxygen/hydrogen gain/loss; 2.2.2 redox as electron transfer, half/ionic equations; 2.2.3 rusting experiment (hydrated iron(III) oxide); 2.2.4 prevention (barrier methods, galvanising, sacrificial protection); 2.2.5 extraction of iron from haematite (reducing agent, reduction, removal of acidic impurities); 2.2.6 uses of iron

**2.3 Rates of reaction** — 2.3.1 rate = 1/time; 2.3.2 methods (mass change, gas volume, precipitate) for metal + acid, CaCO₃ + HCl, H₂O₂ decomposition, sodium thiosulfate + acid; 2.3.3 graphs; 2.3.4 temperature, concentration, collision frequency/energy, particle size/surface area; 2.3.5 catalysts (transition metals); 2.3.6 catalysts lower activation energy — **Prescribed Practical C4**: effect of changing a variable on rate

**2.4 Equilibrium** — 2.4.1 reversible reactions and changing conditions; 2.4.2 dynamic equilibrium in a closed system

**2.5 Organic chemistry** — 2.5.1 carbon and homologous series; 2.5.2 homologous series definition; 2.5.3 hydrocarbon definition; 2.5.4 alkanes general formula; methane–butane formulae/structures/states; 2.5.5 crude oil; 2.5.6 fractional distillation; 2.5.7 fractions and uses (refinery gases, petrol, naphtha, kerosene, diesel, fuel oils, bitumen); 2.5.8 cracking; 2.5.9–2.5.10 complete/incomplete combustion of alkanes; 2.5.11 CO toxicity; 2.5.12 alkenes (ethene, propene, but-1-ene, but-2-ene); 2.5.13 combustion of alkenes; 2.5.14 functional groups (alkenes, alcohols, carboxylic acids); 2.5.15 addition reactions of ethene with bromine, hydrogen, steam; 2.5.16 bromine water test; 2.5.17–2.5.19 addition polymerisation (ethene, chloroethene), polymer ↔ monomer; 2.5.20 alcohols (methanol, ethanol, propan-1-ol, propan-2-ol); 2.5.21 combustion of alcohols; 2.5.22 fermentation conditions; 2.5.23 carboxylic acids (methanoic–butanoic); 2.5.24 weak acids (partial ionisation); 2.5.25 reactions of carboxylic acids with carbonates, hydroxides, metals; 2.5.26 pollution from fuels (CO₂/greenhouse effect, CO and soot, SO₂/acid rain)

**2.6 Quantitative chemistry** — 2.6.1 empirical/molecular formula, hydrated/anhydrous, water of crystallisation; 2.6.2 heating to constant mass; 2.6.3 Mr of hydrated compounds; 2.6.4 empirical formulae and degree of hydration from data; 2.6.5 concentration in mol/dm³; 2.6.6 moles/mass in solutions; 2.6.7 atom economy = mass of desired product / total mass of products × 100; 2.6.8 sustainability — **Prescribed Practical C5**: mass of water in hydrated crystals

**2.7 Electrochemistry** — 2.7.1 electrolysis terms (inert electrode, anode, cathode, electrolyte; ions carry charge); 2.7.2 products of electrolysis of molten LiCl and PbBr₂ with observations; 2.7.3 half equations (incl. other molten halides and aluminium extraction); 2.7.4 aluminium from alumina/bauxite, anode replacement; 2.7.5 recycling aluminium

**2.8 Energy changes in chemistry** — 2.8.1 exothermic/endothermic; 2.8.2 reaction profile diagrams with activation energy; 2.8.3 activation energy definition; 2.8.4 bond breaking/making; 2.8.5 calculate energy changes from bond energies

**2.9 Gas chemistry** — 2.9.1 atmosphere composition (≈78 % N₂, 21 % O₂, 0.03–0.04 % CO₂, 1 % Ar); 2.9.2 nitrogen properties and triple bond; 2.9.3 uses of nitrogen; 2.9.4 ammonia test (glass rod + conc. HCl) and fertilisers; 2.9.5 hydrogen preparation (Zn + HCl), properties, uses; 2.9.6 oxygen preparation (H₂O₂ catalytic decomposition), uses; 2.9.7 reactions of C, S, Mg, Fe, Cu with oxygen and acidic/basic oxides; 2.9.8 CO₂ preparation (CaCO₃ + HCl) and uses; 2.9.9 CO₂ with water and with limewater to excess — **Prescribed Practical C6**: preparation, properties, tests and reactions of H₂, O₂ and CO₂

### 5.5 Physics Unit P1: Motion, Force, Moments, Energy, Density, Kinetic Theory, Radioactivity, Nuclear Fission and Fusion (1 h, 11 %)

**1.1 Motion** — Vectors and scalars; Displacement, velocity and acceleration (spec prose: "At Higher Tier, students are introduced to the concept of vectors and scalars"); Distance–time and speed–time graphs; Displacement–time and velocity–time graphs
- 1.1.1 average speed = distance/time; average speed = (initial + final)/2; rate of change of speed = (final − initial)/time; units m, m/s, m/s² — **Prescribed Practical P1** (trolley/ball-bearing on a ramp: average speed vs slope height)
- 1.1.2 vectors vs scalars (displacement/distance, velocity/speed, acceleration/rate of change of speed) [Higher]
- 1.1.3 v = d/t; average velocity = (u + v)/2 [Higher]
- 1.1.4 a = (v − u)/t; retardation [Higher]
- 1.1.5 graphs: slope of d–t = speed; slope of speed–time = rate of change of speed; area under speed–time = distance
- 1.1.6 displacement–time and velocity–time graphs (slope = velocity / acceleration; area = displacement) [Higher]

**1.2 Force** — Newton's laws; Mass and weight; Hooke's law; Pressure; Moment of a force; Principle of Moments; Centre of gravity
- 1.2.1 forces in pairs, friction opposes motion; 1.2.2 newtons, sign convention; 1.2.3 resultant of two 1-D forces
- 1.2.4 Newton's first law; 1.2.5 investigate first and second laws; 1.2.6 second law; 1.2.7 F = m × a
- 1.2.8 mass vs weight; g = 10 N/kg; 1.2.9 W = mg; 1.2.10 free fall (10 m/s per second); 1.2.11 g = 10 m/s²
- **Prescribed Practical P2**: Hooke's law; 1.2.12 F = ke; 1.2.13 gradient of F–e graph = k
- 1.2.14 pressure, Pa = N/m²; 1.2.15 P = F/A (cm² and mm² allowed, no conversion to m²); 1.2.16 everyday pressure examples (knife, caterpillar tracks)
- 1.2.17 moment = F × d (perpendicular); **Prescribed Practical P3**: Principle of Moments; 1.2.18 use moments to find a weight; 1.2.19 moments calculations (≤ 2 forces)
- 1.2.20 centre of gravity; 1.2.21 c.o.g. of disc, ring, rectangle; 1.2.22 stability (c.o.g. height and base width); 1.2.23 when weight has a turning effect

**1.3 Density and kinetic theory** — 1.3.1–1.3.2 mass–volume experiments; 1.3.3 irregular solid (displacement, eureka can); 1.3.4 density = m/V, g/cm³ and kg/m³; 1.3.5 kinetic theory and densities of solids/liquids/gases

**1.4 Energy** — Forms of energy; Conservation; Renewable; Non-renewable; Efficiency; Work; Power; Kinetic energy; Gravitational potential energy
- 1.4.1 forms of energy; 1.4.2 Principle of Conservation of Energy; 1.4.3 joule (≈ lifting an apple 1 m); 1.4.4 energy transfer diagrams
- 1.4.5–1.4.7 renewable resources and environmental effects; 1.4.8–1.4.10 non-renewable incl. nuclear; acid rain, global warming
- 1.4.11–1.4.12 efficiency = useful output energy / total input energy (decimal or %)
- 1.4.13–1.4.14 work W = F × d (J, N, m)
- 1.4.15–1.4.16 power (W = J/s); P = E/t; P = W/t — **Prescribed Practical P4**: personal power (stairs or step-ups)
- 1.4.17 Ek = ½mv²; 1.4.18–1.4.19 Ep = mgh (g = 10 N/kg)

**1.5 Atomic and nuclear physics** — Structure of the atom; Structure of the nucleus; Radioactive decay; Dangers; Half-life; Uses; Nuclear fission; Nuclear fusion
- 1.5.1–1.5.2 p/n/e and relative charge/mass; 1.5.3 ᴬ₂X notation; 1.5.4 isotopes
- 1.5.5–1.5.6 alpha (He nucleus), beta (fast electron), gamma (high-energy EM wave); random and spontaneous
- 1.5.7 decay equations balancing A and Z (alpha: A−4, Z−2; beta: Z+1; gamma: unchanged)
- 1.5.8 penetration/range (paper, aluminium, lead); 1.5.9 background activity and correction; 1.5.10 sources of background (cosmic, rocks/radon, food chain, medical X-rays, waste, fallout); 1.5.11 ionisation and cancer; 1.5.12 relative dangers inside/outside the body; 1.5.13 safe handling; 1.5.14 half-life (definition, calculations, from graphs)
- 1.5.15 uses (tracers, pipe leaks, thickness control, sterilisation, organ monitoring, smoke alarms); 1.5.16 choice of half-life
- 1.5.17–1.5.19 fission (neutron absorption, chain reaction; political/social/environmental issues incl. Ukraine and Japan incidents)
- 1.5.20–1.5.23 fusion (stars, deuterium/tritium from seawater, helium by-product, 4 million × chemical and 4 × fission energy per kg, technological difficulties and cost)

### 5.6 Physics Unit P2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics (1 h 15 min, 14 %)

**2.1 Waves** — Transverse and longitudinal; Frequency, wavelength, amplitude; Echoes, sonar and radar; Electromagnetic waves
- 2.1.1 waves transfer energy; 2.1.2 transverse vs longitudinal (sound/ultrasound longitudinal; water and EM transverse); 2.1.3 f, λ, amplitude from graphs; 2.1.4 v = fλ
- 2.1.5 echo calculations; 2.1.6 ultrasound > 20 000 Hz (foetal scans, metal defects); 2.1.7 sonar and radar
- 2.1.8 EM spectrum order, same speed in vacuum; 2.1.9 dangers (microwaves heat tissue, IR burns, UV skin cancer, intense light damages eyes, X/gamma → cancer)

**2.2 Light** — Reflection; Refraction; Dispersion; Lenses
- 2.2.1 reflection law and normal; 2.2.2 plane mirror image by ray tracing; 2.2.3 refraction air/glass/water — **Prescribed Practical P5** (i vs r graph: related but not proportional); 2.2.4 bending towards normal when slowing; 2.2.5 refraction and change of speed (no Snell's law)
- 2.2.6 dispersion by prism (red least refracted, violet most); 2.2.7 converging vs diverging lenses, focal length; 2.2.8 focal length via distant object; 2.2.9 ray diagrams for real images; 2.2.10 camera and projector; 2.2.11 magnifying glass (virtual image)

**2.3 Electricity** — Conductors and insulators; Simple circuits; Standard symbols; Electric charge flow; Ohm's law; Resistance; Filament lamp; Series and parallel; Calculating resistance; Factors affecting resistance; Electrical energy and power; Electricity in the home
- 2.3.1 free electrons; 2.3.2 electron flow vs conventional current; 2.3.3 switches, series/parallel; 2.3.4 circuit symbols; 2.3.5 cell polarity; 2.3.6 Q = I × t (coulombs); 2.3.7 cells in series
- **Prescribed Practical P6**: Ohm's law V–I graph for a metal wire at constant temperature; 2.3.8 V = I × R
- 2.3.9 filament lamp V–I characteristic (resistance rises with current)
- 2.3.10–2.3.11 series and parallel rules for current and voltage; 2.3.12 series resistance; 2.3.13 two equal resistors in parallel; 2.3.14 any two resistors in parallel; 2.3.15 combined series/parallel circuits
- 2.3.16 resistance ∝ length (graph through origin); 2.3.17 heating effect (electron–atom collisions); 2.3.18 E = P × t; P = I × V
- 2.3.19 a.c. vs d.c. and CRO traces; 2.3.20 kilowatt-hour and cost; 2.3.21 one-way switching on live side; 2.3.22 three-pin plug wiring (live, neutral, earth); 2.3.23 earthing and fuses; 2.3.24 double insulation; 2.3.25 P = IV to choose fuse rating

**2.4 Magnetism and electromagnetism** — 2.4.1 field of a bar magnet (plotting compasses); 2.4.2 field of a current-carrying coil and polarity; 2.4.3 factors affecting electromagnet strength (current, turns, core material)

**2.5 Space physics** — Earth and Solar System; Stars; Life cycle of stars; Supernovae; Black holes; The Universe; Big Bang; Red shift; CMBR
- 2.5.1 Solar System features; 2.5.2 order of the eight planets; 2.5.3 gravity and orbits; 2.5.4 uses of artificial satellites; 2.5.5 star and planet formation; 2.5.6 stars mainly H and He, fusion; 2.5.7 elements formed by fusion; 2.5.8 Sun-like star: protostar → main sequence → red giant → white dwarf → black dwarf; 2.5.9 main-sequence stability (thermal expansion vs gravity); 2.5.10 massive stars: red supergiant → supernova → neutron star/black hole; 2.5.11 black holes; 2.5.12 Big Bang 14 billion years ago; 2.5.13 Big Bang model stages; 2.5.14 red shift as evidence; 2.5.15 CMBR as evidence

### 5.7 Unit 7: Practical Skills (Spec 3.7 and Section 6)

Skills assessed: planning an investigation; carrying out an experiment; analysing experimental data; drawing conclusions. Learning outcomes include identifying variables, hypotheses, risk assessment, apparatus choice, results tables, apparatus diagrams, validity/reliability/accuracy, anomalous results, graph plotting and best-fit lines/curves, direct proportion (straight line through origin) and inverse proportion (y vs 1/x), mole/mass/%/gas volume/concentration/degree-of-hydration calculations. The apparatus list students must handle: Bunsen and heating apparatus, general glassware, gas preparation apparatus (gas jar, thistle funnel, delivery tubes, beehive shelf, trough), measuring cylinders, quadrat/tape/line transect, potometer, Visking tubing, gas syringe, balance, ruler, stopclock, thermometer, ammeter, voltmeter, ohmmeter, protractor.

**Booklet A logistics (Section 6 and 2026 Instructions to Teachers):** three separate 1-hour tasks (Biology, Chemistry, Physics), "based on but not identical to" the prescribed practicals; changed every year; apparatus/materials list to centres by end of October (spec says December), booklets delivered ≥ 5 working days before the window; the 2026 instructions say Booklet A may be completed **between 1 December and 1 May**; groups of up to three may collect data but write up individually; Biology may require a separate set-up session up to 3 days before; Foundation and Higher candidates may share a room but only work with the same tier; only the Chemistry Data Leaflet is allowed as an extra resource; Double Award Booklet A remains **hard-copy marked** in Summer 2026 (Single Award and separate sciences moved to online marking).
- Instructions to Teachers, Summer 2026: https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2025/GCSE%20Science%20Practical%20Skills%20-%20Instructions%20to%20Teachers%2C%20Summer%202026.pdf

### 5.8 The 18 prescribed practicals (Spec pp.103–105)

| Code | Unit | Practical |
|---|---|---|
| B1 | Bio B1 | Investigate the need for light and chlorophyll in photosynthesis by testing a leaf for starch |
| B2 | Bio B1 | Investigate the energy content of food by burning food samples |
| B3 | Bio B1 | Investigate the effect of temperature on the action of an enzyme |
| B4 | Bio B1 | Use quadrats to investigate the abundance of plants and/or animals in a habitat |
| B5 | Bio B2 | Investigate osmosis by measuring change in length or mass of plant tissue or model cells (Visking tubing) |
| B6 | Bio B2 | Use a potometer (bubble and weight) to investigate factors affecting water uptake, and the washing-line method for water loss from leaves |
| C1 | Chem C1 | Investigate the reactions of acids, including temperature changes that occur |
| C2 | Chem C1 | Identify the ions in an ionic compound using flame tests |
| C3 | Chem C2 | Investigate the reactivity of metals |
| C4 | Chem C2 | Investigate how changing a variable changes the rate of reaction |
| C5 | Chem C2 | Determine the mass of water present in hydrated crystals |
| C6 | Chem C2 | Investigate the preparation, properties, tests and reactions of hydrogen, oxygen and carbon dioxide |
| P1 | Phys P1 | Investigate how the average speed of an object moving down a runway depends on the slope (height of one end) |
| P2 | Phys P1 | Investigate the extension of a spring and its relation to applied force (Hooke's law) |
| P3 | Phys P1 | Verify the Principle of Moments (suspended metre rule or pivoted beam) |
| P4 | Phys P1 | Measure personal power (climbing a staircase or step-ups) |
| P5 | Phys P2 | Ray tracing: angles of incidence and refraction for a glass block; plot i against r (related but not proportional) |
| P6 | Phys P2 | Ohm's law: V–I characteristic of a metal wire at constant temperature |

CCEA Practical Manual sheets exist for B1–B6, C1–C6, P2, P3, P5, P6 (P1 and P4 sheets were not on the support page), e.g. https://ccea.org.uk/downloads/docs/Support/Practical%20Manual/2019/Practical%20Manual%20Unit%207%3A%20Practical%20Skills%20P6%3A%20Investigating%20Ohm%26%23039%3Bs%20Law.pdf . Recent Booklet A tasks seen in Chief Examiner reports: 2024 Biology enzyme/temperature timing task; 2025 Biology osmosis with potato/parsnip cylinders in sucrose solutions; 2025 Chemistry heating hydrated magnesium sulfate + Mg with CuSO₄ temperature change; 2025 Physics refraction (angles 60° and 70°) with curved best-fit graph.

### 5.9 Physics equations students must recall (none are given in the exam)

| Topic | Equation |
|---|---|
| Speed | average speed = distance moved ÷ time taken |
| Speed | average speed = (initial speed + final speed) ÷ 2 |
| Rate of change of speed | (final speed − initial speed) ÷ time taken |
| Velocity (HT) | v = d / t (displacement ÷ time); average velocity = (u + v)/2 |
| Acceleration (HT) | a = (v − u) / t |
| Graphs | gradient of d–t = speed; gradient of v–t = acceleration; area under v–t = displacement |
| Newton II | F = m × a |
| Weight | W = m × g, g = 10 N/kg (free-fall acceleration 10 m/s²) |
| Hooke's law | F = k × e (gradient of F–e graph = k) |
| Pressure | P = F / A (1 Pa = 1 N/m²) |
| Moment | moment = F × perpendicular distance from pivot; Principle of Moments |
| Density | D = m / V (g/cm³, kg/m³) |
| Efficiency | efficiency = useful output energy ÷ total input energy |
| Work | W = F × d |
| Power | P = E / t and P = W / t (1 W = 1 J/s) |
| Kinetic energy | Ek = ½ m v² |
| Gravitational PE | Ep = m g h |
| Nuclear | decay equations balancing A and Z; half-life calculations |
| Waves | v = f × λ; echo distance = speed × time ÷ 2 |
| Charge | Q = I × t |
| Ohm's law | V = I × R |
| Resistors | series R = R₁ + R₂; two equal in parallel R/2; any two in parallel 1/R = 1/R₁ + 1/R₂ (spec: "calculate the combined resistance of any two resistors in parallel") |
| Electrical energy/power | E = P × t; P = I × V; cost = kWh × unit price; fuse choice from P = IV |

Chemistry formulae to recall: rate = 1/time; Rf = distance moved by substance ÷ distance moved by solvent; Mr and % by mass; moles = mass ÷ Mr; concentration (mol/dm³) = moles ÷ volume (dm³); percentage yield = actual ÷ theoretical × 100; atom economy = mass of desired product ÷ total mass of products × 100; energy change from bond energies; degree of hydration from mass data.

---

## 6. Exam dates

### Summer 2026 (Final GCSE Timetable June 2026, https://ccea.org.uk/document/23626 → https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202026.pdf)

| Date | Session | Papers |
|---|---|---|
| Tue 12 May 2026 | pm 1.30–2.30 | GDW11/GDW12 DAS Biology Unit 1 (F/H) (1 hr) |
| Mon 18 May 2026 | am 9.15–10.15 | GDW21/GDW22 DAS Chemistry Unit 1 (F/H) (1 hr) |
| Fri 22 May 2026 | am 9.15–10.15 | GDW31/GDW32 DAS Physics Unit 1 (F/H) (1 hr) |
| Mon 8 June 2026 | am 9.15–10.30 then 10.45–11.15 | GDW41/GDW42 DAS Biology Unit 2 (1 hr 15 m) then GDW72/GDW76 DAS Biology Practical Theory (Booklet B) (30 m) |
| Fri 12 June 2026 | am 9.15–10.30 then 10.45–11.15 | GDW51/GDW52 DAS Chemistry Unit 2 then GDW73/GDW77 Chemistry Practical Theory |
| Mon 15 June 2026 | am 9.15–10.30 then 10.45–11.15 | GDW61/GDW62 DAS Physics Unit 2 then GDW74/GDW78 Physics Practical Theory |
| 1 Dec 2025 – 1 May 2026 | centre-scheduled | Unit 7 Booklet A practical window (GDW71 F / GDW75 H) |

### November 2026 (https://ccea.org.uk/document/23899 → Final GCSE Timetable, November 2026.pdf; results 4 Feb 2027)
- Mon 9 Nov 2026 am: GDW11/12 Biology Unit 1
- Tue 10 Nov 2026 am: GDW21/22 Chemistry Unit 1
- Wed 11 Nov 2026 pm: GDW31/32 Physics Unit 1

### March 2027 (https://ccea.org.uk/document/24027 → Final GCSE Timetable, March 2027.pdf; results 15 Apr 2027; **last March series for Science**)
- Mon 22 Feb 2027 9.30–10.30: GDW11/12 Biology Unit 1
- Wed 24 Feb 2027 9.30–10.30: GDW21/22 Chemistry Unit 1
- Fri 26 Feb 2027 9.30–10.30: GDW31/32 Physics Unit 1
(For reference, March 2026 was 23, 25, 27 Feb 2026: https://ccea.org.uk/document/23520)

### Summer 2027 (Final GCSE Timetable June 2027, Version 2, https://ccea.org.uk/document/24212 → https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202027%20%28Version%202%29.pdf)

| Date | Session | Papers |
|---|---|---|
| Tue 11 May 2027 | am 9.15–10.15 | GDW11/12 Biology Unit 1 |
| Mon 17 May 2027 | am 9.15–10.15 | GDW21/22 Chemistry Unit 1 |
| Tue 25 May 2027 | am 9.15–10.15 | GDW31/32 Physics Unit 1 |
| Wed 2 June 2027 | am 9.15–10.30 + 10.45–11.15 | GDW41/42 Biology Unit 2 + GDW72/76 Biology Practical Theory |
| Thu 10 June 2027 | am 9.15–10.30 + 10.45–11.15 | GDW51/52 Chemistry Unit 2 + GDW73/77 Chemistry Practical Theory |
| Mon 14 June 2027 | am 9.15–10.30 + 10.45–11.15 | GDW61/62 Physics Unit 2 + GDW74/78 Physics Practical Theory |

Timetable index page: https://ccea.org.uk/key-stage-4/gcse/timetables

---

## 7. Chief Examiner's Reports — what was worst answered and common misconceptions

All reports: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/reports . Direct PDFs (all fetched):

| Series | URL |
|---|---|
| March 2026 | https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2026/GCSE%20Science%20Double%20Award%20%282017%29-March2026-Report_0.pdf |
| November 2025 | https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025/GCSE%20Science%20Double%20Award%20%282017%29-November2025-Report_0.pdf |
| Summer 2025 | https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025/GCSE%20Science%20Double%20Award%20%282017%29-Summer2025-Report_0.pdf |
| March 2025 | https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025/GCSE%20Science%20Double%20Award%20%282017%29-March2025-Report_0.pdf |
| Summer 2024 | https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2024/GCSE%20Science%20Double%20Award%20%282017%29-Summer2024-Report_0.pdf |
| Summer 2023 | https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2023/GCSE%20Science%20Double%20Award%20%282017%29-Summer2023-Report_0.pdf |
| Others (Nov 2024, Mar 2024, Nov 2023, Mar 2023, Summer/Nov/Mar 2022, Nov 2021, Nov 2020, Summer 2019, Summer/Mar 2018) | same folder pattern `/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/<year>/…-<Series><Year>-Report[_0|_1].pdf` (listed on the reports page) |

### 7.1 Cross-cutting examiner messages (repeated every series)
- **Listing**: a correct answer alongside an incorrect one scores zero. Also "+1/−1" for contradictory ticks.
- **Handwriting/legibility, capital letters and full stops in QWC answers, black ink, answer in the box**, cross out unwanted attempts.
- Comparative language when comparing data ("biggest clear area / killed the most bacteria").
- **Definitions must be learnt verbatim from the CCEA Glossary of Terms** (Biology/Chemistry/Physics glossaries: https://ccea.org.uk/downloads/docs/Support/Useful%20Links/2019/DAS%20Biology%20Glossary%20of%20Terms.pdf , …/DAS%20Chemistry%20Glossary%20of%20Terms.pdf , …/DAS%20Physics%20Glossary%20of%20Terms.pdf).
- Physics: show the equation before substituting; "a wrong physics equation leading to a correct numerical answer will lead to no marks"; always draw a best-fit line/curve; convert units (mA → A, minutes → seconds, g → kg).
- Chemistry: use the Data Leaflet; symbols case-sensitive (Cu not CU); "chloride ion" not "chlorine ion"; observations must be fully qualified ("colourless solution forms/remains", "heat given out"); answers to the stated decimal places; 2-D labelled apparatus diagrams (no 3-D, no four-legged tripods, no blocked tubes).

### 7.2 Biology
- **B1 Foundation (S2025)**: cell wall vs membrane confusion; vacuole function; respiration written in both columns of a carbon-cycle table; QWC on aerobic respiration — confusion over whether CO₂ is produced or used, and giving "produces energy" instead of uses of energy; bladder given for kidney; misreading graph values; naming enzyme/substrate/active site terms.
- **B1 Higher (S2025)**: nitrogen cycle processes B and C (only fixation and nitrification known); active transport explained wrongly (concentration gradient errors; water taken up by active transport); last stages of eutrophication; trend descriptions not taken from the graph; hydrogencarbonate indicator colours mixed with food-test colours.
- **B1 March 2026 (F)**: root hair cell adaptations and what it absorbs; saprophytic decomposition; interpreting a breathing-rate graph; layer of the leaf where gas exchange occurs; "hair root cell" wrong terminology; components of fats after digestion.
- **B2 Foundation (S2025)**: transpiration and the potometer were "a disappointing" area (stomata/air spaces; direction/explanation of bubble movement — thought water enters via stomata or confused with oxygen from photosynthesis); homozygous dominant/recessive terminology; consequences of a blocked vessel; bacterial vs viral diseases; secondary immune response (vague); tar vs nicotine effects; progesterone spelling and hormone confusion (testosterone, auxin, ADH given).
- **B2 Higher (S2025)**: zygote vs embryo; implantation vs differentiation; wrong parental genotype in crosses; test (back) cross description only by the most able; **independent assortment** almost never named; choosing the four meiotic nuclei; % of base C calculation; restriction-enzyme staggered cuts and number of fragments.
- **S2024**: osmosis applied to new situations was difficult; natural selection "a topic that candidates find difficult"; drug-trial conclusions; microscope part names.
- **Unit 7 Booklet B Biology (S2025)**: ratio cell:nucleus reversed; coverslip/slide and eyepiece lens not named; magnification 100/10 done as subtraction; Biuret vs Benedict's confused; Benedict's needs heating; QWC fieldwork — few mentioned a key to identify species, some could not name the quadrat; potato/glucose flask trend; incubation at 25 °C; antibiotic zone comparisons needing evidence.

### 7.3 Chemistry
- **C1 Foundation (S2025)**: poorly answered: **formulae, the Periodic Table, acids/bases/salts, properties of covalent compounds**; writing formulae and balanced equations "disappointing"; atomic number definition (included electrons); oxide ion configuration (2,6 given for 2,8); Mendeleev gap group (halogens vs noble gases); pH of ethanoic acid/NaOH; universal-indicator colours (blue alone not enough for pH 14, crimson/brick red not accepted for red); MgO + HCl products (oxygen/hydrogen instead of water); percentage composition; **solvent front** unknown; van der Waals' forces not named ("intermolecular forces" not accepted); dot-and-cross mark scheme is hierarchical (sharing → other electrons → dots/crosses).
- **C1 Higher (S2025)**: ionic equations (Br₂ + KI) "continue to prove challenging"; displacement colour change (Br₂ vs I₂ colours confused); "isotopes" defined in the singular; diatomic gas of two elements (CO₂ given); ranking H⁺ concentration from pH; metallic bonding description (must say cations + delocalised electrons); **explaining NaCl's high m.p. (strong ionic bonds and substantial energy to break) and conduction when molten (ions, "carry charge" not "carry current")**; nanoparticle risks must be the spec's two; yield-loss reasons must be the spec's.
- **C1 March 2026**: definitions "only loosely known"; QWC unscaffolded question produced confused answers; lack of detail in observations; Higher: formulae, balanced and half equations.
- **C2 Foundation (S2025)**: vague observation terms; **diatomic elements forgotten** (H, O, N); apparatus drawing "widespread difficulty"; QWC on aluminium extraction (bauxite/haematite confusion, cryolite lowers m.p. of Al₂O₃ not Al, boiling vs melting point, C + O₂ → CO₂ omitted); electrolysis definition ("decomposed" missing); alkene general formula CₙH₂ₙ not recognised; formulae of CH₄ combustion products (names given); functional group circled with H atoms; naming propene; naming poly(ethene); Mr of C₂H₂O₄·2H₂O (110 given for 126); apparatus for dehydrating a hydrate; equilibrium (reversible meaning; only temperature named as a condition); damp mineral wool purpose in Mg + steam; MgO vs Mg(OH)₂ product.
- **C2 Higher (S2025)**: galvanising (must say zinc coating); half equation Fe → Fe³⁺ + 3e⁻ (electron side/number); bromine as red-brown gas at the anode; weak acid = partial ionisation not pH; naming copper(II) ethanoate; mass for a 2.0 mol/dm³ solution; sustainability of ammonia preparation; rate sketch must level at same final mass; "fewer successful collisions… per unit time" (not "less collisions"); MnO₂ as catalyst for H₂O₂ not recalled; catalyst effect vs definition; SO₂ + O₂ equation; effect of temperature on equilibrium.
- **S2024**: "Organic chemistry continues to be the topic with which candidates struggle" (general formulae, naming, drawing full structures, fractional distillation description, carboxylic acid + base); redox; ionic equations; apparatus names (delivery tube, gas jar); rates curve errors (two lines, wrong start/finish); energy profiles and bond enthalpy well done.
- **Unit 7 Chemistry Booklet B (S2025)**: "paper proved more difficult than expected, which suggests a lack of knowledge and skills around the practical aspect" (2024); potassium + water product (oxide vs hydroxide); lithium + water observations; safety screen wording; x-axis label omitted; total gas volume read by summing table values; "gas syringe" and "conical flask" misnamed/misspelt; labelling the anode; where to do a toxic-gas electrolysis (fume cupboard); bromine observation at anode; mass of water → moles of water; Mr of hydrated CuSO₄; colour change on heating hydrated CuSO₄; anode half equation for molten LiCl.
- **Booklet A Chemistry (S2025)**: masses to 2 d.p.; mass range 2.00–2.50 g; "exothermic" is a deduction not an observation; "cloudy" not accepted for colour change; anhydrous MgSO₄ is a white powder not crystals.

### 7.4 Physics
- **P1 Foundation (S2025)**: kinetic-energy formula "surprising lack"; Hooke's law full definition (proportional, extension, limit of proportionality — "elastic limit" not accepted); spring constant; **nuclear fusion QWC** (fission confusion, "atoms" instead of nuclei, energy given as the by-product instead of helium); work done; **power definition** (equated to energy/force/strength); energy forms (power, weight, pressure given as energy); loudspeaker energy change reversed; solar panel input energy.
- **P1 Higher (S2025)**: power definition "most challenging part"; fusion QWC; KE unit conversions (g → kg); GPE value in height calculation; Newton II problem requiring weight then upward force; beta decay equation; half-life second mark (what is halving); "constant speed" answer on a velocity-time graph.
- **P1 March 2026**: mass definition ("amount of matter") not recalled; wood classed as non-renewable, nuclear as renewable; distance–time graph well prepared.
- **P2 Foundation (S2025)**: dispersion vs refraction and "rainbow" vs spectrum; **lens ray diagrams** (many could not construct any ray); circuit diagram (negative terminal, electron flow vs conventional current); two 9 Ω in parallel = 4.5 Ω; QWC stars ("push" of gravity; "studying the light from stars"); Sun on the right of a Solar System diagram; meteors/meteorites listed as orbiting objects; heat not identified as energy form; minutes → seconds; P = IV not recalled; a.c./d.c. explanations and CRO sketches; electromagnet strength (changed battery/core dimensions instead of current/turns/core material).
- **P2 Higher (S2025)**: microwave danger must link heating to internal tissue; period vs frequency (2 s → 0.5 Hz); focal-point labelling and ray direction arrows; refraction through an inverted prism (normals omitted, ray bent the wrong way); order of colours on a screen; variable-resistor symbol; **why a filament lamp's V–I graph curves (temperature ↑ → more collisions → resistance ↑)**; CMBR confused with "light from stars".
- **S2024 P2**: fuse action in a three-pin plug ("least well answered"); double insulation ("did not require an earth"); sound/ultrasound given as transverse; unit conversions.
- **Unit 7 Physics Booklet B (S2025)**: stability reason (area given); **unit and direction of a moment "very poorly answered"**; ammeter/voltmeter symbols and positions; control variable in resistance–length experiment (length given); "directly proportional" wording; density of an irregular solid (ruler method given; displacement method missed; density = m × V error); reliability vs accuracy; 25° angle inclusion; centre of gravity definition (must say "weight acts"; "gravity" used for weight); Principle of Moments statement (omit "about a point"/"in equilibrium"); moments calculation (subtracting instead of adding forces; direction); gradient unit.
- **Booklet A Physics (S2025)**: unit omitted from axis label (column heading should equal axis label); straight-line segments instead of a curve; "related but not proportional" reason (curve / not a straight line through origin); explanation of refraction must be speed change not "optical density".

---

## 8. How Double Award differs from Single Award and from the separate sciences (do not mix content)

| Feature | **Double Award Science (2017)** | **Single Award Science (2017)** | **Separate GCSE Biology / Chemistry / Physics (2017)** |
|---|---|---|---|
| Subject/classification code | 1370 (web id 584) | 1310 | Biology, Chemistry, Physics each own code |
| GCSEs awarded | **2** (double grade A\*A\*–GG) | 1 (single grade A\*–G) | 1 each |
| GLH | 240 | 120 | 120 each |
| Units | 7: B1, C1, P1 (11 % each, 1 h); B2, C2, P2 (14 % each, 1 h 15 m); Unit 7 Practical (Booklet A 7.5 %, Booklet B 17.5 %) | 4: Unit 1 Biology, Unit 2 Chemistry, Unit 3 Physics (25 % each, 1 h); Unit 4 Practical Skills (Booklet A 7.5 % 2 h with two practicals from two disciplines; Booklet B 17.5 %, F 1 h / H 1 h 15 m) | 3: Unit 1 (35 %, 1 h 15 m), Unit 2 (40 %, 1 h 30 m), Unit 3 Practical (Booklet A 7.5 % 2 h two practicals; Booklet B 17.5 % 1 h) |
| Prescribed practicals | **18** (6 per discipline) | 9 (3 per discipline) | per science (Biology "prescribed practicals" listed in its own spec) |
| Content | Biology B1/B2 share unit titles and most learning-outcome numbering with GCSE Biology Units 1/2 but Double Award is a reduced subset (e.g. GCSE Biology Unit 1 includes stem cells; Double Award omits them). Chemistry and Physics likewise subsets of the separate specs. | Own, different, applied content set (e.g. Single Award Biology 1.1 includes stem cells; Single Award Physics topics 3.1–3.9 are a different sequence) | Full content |
| Booklet B timing | 3 × 30 min (Bio/Chem/Phys) straight after each Unit 2 paper | 1 paper (F 1 h / H 1 h 15 m) | 1 h |
| Entry code prefix | GDW | GSA | GBL / GCM / GPY |
| Availability of Unit 1s | Nov, Feb/Mar (until Mar 2027), Summer | same pattern | Summer only (separate sciences) |

Sources: Single Award spec https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Single%20Award%20%282017%29/GCSE%20Science%20Single%20Award%20%282017%29-specification-Standard_0.pdf ; GCSE Biology spec https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Biology%20%282017%29/GCSE%20Biology%20%282017%29-specification-Standard_0.pdf ; Chemistry https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Chemistry%20%282017%29/GCSE%20Chemistry%20%282017%29-specification-Standard_0.pdf ; Physics https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Physics%20%282017%29/GCSE%20Physics%20%282017%29-specification-Standard_0.pdf (Chemistry/Physics separate specs located but not read in detail).

**Practical rule for content authoring:** tag every learning outcome with `DA-B1-1.2.3`-style ids taken from the Double Award spec, never from the separate-science or Single Award specs, and never import Single Award topics (e.g. stem cells, Single Award physics sequence) or separate-science-only depth.

---

## 9. Resource URLs (all verified HTTP 200 unless stated)

### Past papers and mark schemes
- Landing page: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/past-papers-mark-schemes (HTML page renders from a JSON feed)
- **JSON feed of every paper/mark scheme (id 584)**: https://ccea.org.uk/sites/default/files/qualification/584.json — 945 entries covering 2017–2026 (Summer, November, March; Standard, Irish-medium, Modified large-print). Fields: title, series, year, mark_scheme (0/1), field_document_cloud (path). **Use this feed to programmatically index papers.**
- Archived (2018) papers: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/past-papers-mark-schemes/archived-past
- URL pattern: `https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/<YEAR>-<Series>/Standard/0/GCSE-Science%20Double%20Award-584-<Series><YEAR>-<Tier>%20Tier%2C%20Unit%20<Xn>%3A%20<Discipline>-Paper.pdf` (and `-MS.pdf`).
- Summer 2025 examples (fetched): 
  - HT B1 paper: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20B1%3A%20Biology-Paper.pdf
  - HT B1 MS: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20B1%3A%20Biology-MS.pdf
  - HT B2 paper: …/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20B2%3A%20Biology-Paper.pdf
  - HT C1 paper: …/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20C1%3A%20Chemistry-Paper.pdf
  - HT C2 paper: …/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20C2%3A%20Chemistry-Paper.pdf
  - HT P1 paper: …/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20P1%3A%20Physics-Paper.pdf
  - HT P2 paper (note odd filename): …/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20P2%3A%20Higher-Paper.pdf
  - HT Unit 7 Biology Booklet B: …/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%207%3A%20Biology%2C%20Practical%20Skills%20%28Booklet%20B%29-Paper.pdf
  - HT Unit 7 Biology Booklet A: …/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%207%3A%20Biology%2C%20Practical%20Skills%20%28%20Booklet%20A%29%20-Paper_0.pdf
  - Full list of the 48 Summer 2025 standard papers/mark schemes and the Summer 2026 papers (already published, dated 28/08/2026, mark schemes not yet) is in the JSON feed. Older direct examples: Summer 2022 HT P1 MS https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20(2017)/2022-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2022-Higher%20Tier,%20Unit%20P1:%20Physics-MS.pdf ; March 2023 HT C1 MS https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20(2017)/2023-March/Standard/0/GCSE-Science%20Double%20Award-584-March2023-Higher%20Tier,%20Unit%20C1:%20Chemistry-MS.pdf
- Third-party mirrors (not primary; check licensing): SaveMyExams https://www.savemyexams.com/gcse/science/ccea/double-award-science/past-papers/ ; PapaCambridge https://pastpapers.papacambridge.com/papers/ccea/gcsescience-double-award ; RevisionScience https://revisionscience.com/gcse-revision/science/science-gcse-past-papers/ccea-gcse-science-past-papers

### Specimen assessment materials
- https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials_44.pdf (Irish-medium: …/Specimen%20Assessment%20Materials%20%28Irish-Medium%29_8.pdf)

### Support materials (https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/support)
- **eGuides per unit and tier** (2023): e.g. Physics Unit 1 Higher https://ccea.org.uk/downloads/docs/Support/eGuide/2023/GCSE%20Double%20Award%20Science%20Physics%3A%20Unit%201%20Higher%20Tier.pdf ; Physics Unit 2 Higher …/GCSE%20Double%20Award%20Science%20Physics%3A%20Unit%202%20Higher%20Tier.pdf ; Chemistry Unit 1 Foundation …/GCSE%20Double%20Award%20Science%20Chemistry%3A%20Unit%201%20Foundation%20Tier.pdf ; Chemistry Unit 1 Higher …/GCSE%20Double%20Award%20Science%20Chemistry%3A%20Unit%201%20Higher%20Tier.pdf ; Chemistry Practical Manual …/GCSE%20Double%20Award%20Science%20Chemistry%3A%20Practical%20Manual.pdf ; Chemistry Sample Results and Observations …/GCSE%20Double%20Award%20Science%20Chemistry%3A%20Sample%20Results%20and%20Observations.pdf ; Chemistry Teacher/Technician Notes …/GCSE%20Double%20Award%20Science%20Chemistry%3A%20TeacherTechnician%20Notes.pdf (Biology/Physics equivalents are listed on the support page).
- Fact files (topic booklets): Biology U1.2 Photosynthesis, U1.3 Food tests, U1.5 Breathing; Chemistry U1.1–U1.9 and U2.1–U2.9 (e.g. https://ccea.org.uk/downloads/docs/Support/Fact%20Files%3A%20Chemistry/2022/GCSE%20DA%20Chemistry%20U2.4%20Equilibrium.pdf ) plus an Answer Booklet; Physics U1.2 Forces.
- Exemplification of Examination Performance 2019 (Biology/Chemistry/Physics Higher Tier), e.g. https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Double%20Award%20Science%20Physics%20Higher%20Tier%20Exemplifying%20Examination%20Performance%202019.pdf
- Glossaries of Terms (Biology/Chemistry/Physics) — see 7.1.
- Chemistry Data Leaflet — see Section 2.
- Practical manual sheets — see 5.8; additional Chemistry Booklet B practice: https://ccea.org.uk/downloads/docs/Support/Practical%20Support/2019/CCEA%20GCSE%20Double%20Award%20Chemistry%20Additional%20Practical%20Activities%20for%20Unit%207%20Practical%20Booklet%20B.pdf
- Student Guide: https://ccea.org.uk/downloads/docs/Support/Student%20Guidance/2019/Student%20Guide_12.pdf
- Changes from legacy spec: https://ccea.org.uk/downloads/docs/Support/General/2019/Changes%20from%20Legacy%20to%20New%20Specification_0.pdf
- Chromatography lesson booklet: https://ccea.org.uk/downloads/docs/Support/General/2019/Chromatography%20Lesson%20Booklet%20and%20Questions_1.pdf
- Grade Outcomes for DA Science Tier Combinations (2026, image PDF): https://ccea.org.uk/downloads/docs/Support/General/2026/Grade%20Outcomes%20for%20Double%20Award%20Science%20Tier%20Combinations.pdf

Licensing note: all of the above are CCEA copyright ("© CCEA 2017/2025"). Past papers are publicly downloadable but reproduction on a commercial platform requires CCEA permission; safest approach is to link out or to write original questions mapped to the learning-outcome ids.

---

## 10. Gaps, open questions and implications (summary)

**Gaps in what CCEA provides / market:**
1. No official formula sheet exists for physics — students must memorise ~25 equations; no CCEA-branded equation practice tool.
2. No machine-readable spec: the tier (Foundation/Higher) flag for each learning outcome is only encoded as bold text in the PDF.
3. The double-grade outcome table is only published as an image PDF.
4. Booklet B is unique to CCEA ("the only ones to directly examine practical work as part of a unit titled Practical Skills"); the examiners repeatedly report weak apparatus naming/drawing and reliability-vs-accuracy confusion, so there is demand for targeted practical-theory practice.
5. Chief Examiner reports are narrative PDFs; nobody has structured them into a per-learning-outcome misconception bank.

**Open questions:**
1. Confirm per-learning-outcome tiering by reading the bold formatting in the spec PDF (or by cross-checking the Foundation vs Higher eGuides).
2. Transcribe the "Grade Outcomes for Double Award Science Tier Combinations" image PDF to get the exact double-grade ladder and which grades each tier mix can reach.
3. Confirm Foundation-tier raw totals for B2/C1/C2/P1/P2/Booklet B (only B1 FT = 60 checked; HT are 70/80/35).
4. Whether Summer 2026 mark schemes have been released (papers were published 28/08/2026; mark_scheme entries not yet seen).
5. Check the Nov 2026 timetable version for any later revision (the Summer 2027 timetable is already at "Version 2").

Sources consulted in full: spec PDF; Snapshot; Single Award and Biology specs (structure sections); Chief Examiner reports Summer 2025 (complete), Summer 2024, March 2026, November 2025 (overviews), Summer 2023 (downloaded); GCSE timetables Summer 2026, Nov 2026, March 2026, March 2027, Summer 2027; Practical Skills Instructions to Teachers Summer 2026; Circular S/IF/35/26; November & March Series Changes FAQ; JSON past-paper feed; Summer 2025 paper front pages.
