# 12 — C1 and P1: a crosswalk-driven priority list

*20 September 2026. Written before any C1 or P1 dossier, so that the first batches can be chosen on evidence rather than on unit order. Sources: `data/enrichment/crosswalk.json` (rebuilt today), the extracted specifications in `docs/sources/cross-board/`, the examiner evidence carried per topic in `data/spec/double-award-science-topics.json`, and `data/links/media-map.json`. Method, vocabulary and the legal line: `docs/research/11-cross-board-enrichment.md`.*

---

## 0. The state of play

| Unit | Topics | Lessons authored | Dossiers | matched | partial | CCEA-only |
|---|---:|---:|---:|---:|---:|---:|
| B1 | 21 | 21 | 0 | 13 | 6 | 2 |
| B2 | 20 | 10 | 8 | 13 | 6 | 1 |
| **C1** | **25** | **0** | **0** | **20** | **4** | **1** |
| C2 | 22 | 12 | 11 | 11 | 11 | 0 |
| **P1** | **22** | **0** | **0** | **16** | **2** | **4** |
| P2 | 20 | 6 | 16 | 7 | 6 | 7 |

Three facts follow from that table.

1. **C1 and P1 are the only units with no lesson at all.** Everything else has at least half a unit standing.
2. **The two unauthored units hold 47 topics, not 42.** The taxonomy in `data/spec/double-award-science-topics.json` counts 25 in C1 and 22 in P1. Plan for 47.
3. **Six of the eighteen prescribed practicals live here** — C1 and C2 inside unit C1, and P1, P2, P3 and P4 inside unit P1. A third of the Unit 7 practical spine sits in the third of the subject that has nothing written.

One more thing worth holding in mind while choosing: C1 and P1 are Year 11 content. She met all of it a year ago and is now in Year 12. So this is not a teaching queue in the ordinary sense; it is a decay-and-damage queue. The right first batches are the ones where the examiner reports say the marks are actually lost, not simply the ones that come first in the specification.

---

## 1. Reading this list

The crosswalk statuses mean what `docs/research/11` §1.3 says they mean, and they are claims about **the other boards**, not about difficulty:

- **matched** — a full AQA Trilogy section and a run of Edexcel 1SC0 statements cover the same ground. Cheap to enrich: the dossier hour buys the most.
- **partial** — the concept is there but a named part of CCEA's version is missing, usually because it lives in AQA's separate-science specification (8461/8462/8463) or in no specification at all.
- **CCEA-only** — nothing in either board's combined-science specification. The teaching must be built from CCEA's own outcomes, our own figures and the past papers, with a separate-science section as raw material where one exists.

**A matched row does not mean a matched topic.** It means the *concept* is matched. CCEA's examinable recall lists are frequently ours alone even inside a green row, and those lists are where the marks go. Four examples from C1 alone, every one returning zero hits across AQA 8464, 8461, 8462, 8463 and Edexcel 1SC0:

| CCEA requires | Status of the topic | What every borrowed resource will say instead |
|---|---|---|
| van der Waals' forces, named (§1.3.4, Foundation) | matched | intermolecular forces |
| allotrope, as a term (§1.3.11) | partial | the three carbon structures, unnamed as allotropes |
| filtrate, distillate, miscible, immiscible (§1.9.4) | matched | none of the four appears in any specification held |
| calcium burns brick red, copper(II) blue-green (§1.9.11) | CCEA-only | orange-red and green (AQA 8462 §4.8.3.1) |

The last one is not pedantry: Summer 2025 C1 marks were lost for offering crimson or brick red where red was wanted in a different question, and the same examiners will not accept green for blue-green. A dossier for a matched topic must therefore carry a **vocabulary line** whenever CCEA's word and the borrowed resource's word differ, and the author must be told which one the mark scheme prints.

Priority below is a product of three things: how much the crosswalk gives us (cost), what the examiner reports say is being lost (damage), and how many later topics depend on it (leverage).

---

## 2. C1 — the cheapest unit in the subject

**20 of 25 matched (80%) — the highest of any unit in Double Award Science.** The enrichment hour goes further in C1 than anywhere else: twenty topics have both a full AQA section and a run of Edexcel statements, which means teaching order, worked-example shapes, misconception lists and question stems are all available to mine, and only the wording has to be ours.

### 2.1 The five topics that will cost more than an hour

| Topic | Status | What is missing, and where the raw material is |
|---|---|---|
| `c1-flame-tests` | **CCEA-only** | Absent from AQA Trilogy and from every Edexcel 1SC0 statement. The usable source is AQA Chemistry **8462 §4.8.3.1** plus its required practical 7. Two of the five colour words differ from CCEA's, and CCEA alone prescribes the method — nichrome wire cleaned with concentrated hydrochloric acid, a phrase with zero hits in any specification held. This is **Prescribed Practical C2**, so it is Unit 7 examinable as well. |
| `c1-carbon-allotropes-nanoparticles` | partial | Diamond, graphite and graphene are well matched. **Nanoparticles are in AQA Chemistry 8462 §4.2.4 only** and in no Edexcel statement. Fullerenes and nanotubes are the reverse case: AQA §5.2.3.3 teaches them and CCEA does not, so they must be marked beyond-scope — and the second video already in the media map is mostly about them (§5). |
| `c1-group-0-and-transition-metals` | partial | **Transition metals are in AQA Chemistry 8462 §4.1.3 only**; zero Edexcel statements. Noble gases are matched. |
| `c1-reacting-masses-and-yield` | partial | Reacting masses are matched at Higher. **Percentage yield is AQA Chemistry 8462 §4.3.3 only**; no Edexcel statement. CCEA prescribes the three reasons a yield falls short, so the reasons list must come from CCEA, not from a borrowed one. |
| `c1-salts-and-lab-safety` | partial | The salt preparation is well matched — AQA required practical 8 and Edexcel's hydrated copper sulfate core practical both do it. **The GHS/CLP hazard symbols are ours alone**: hazard, pictogram and corrosive return nothing usable across the combined specifications. This is **Prescribed Practical C1**. |

### 2.2 The tier inversion at the mole

This is the single most useful thing the C1 crosswalk turned up, because it inverts the obvious assumption about which borrowed material to reach for.

- CCEA puts the mole at **Foundation**: §1.7.3 and §1.7.4 (chemical amounts in moles; converting mass to moles and back) are both Foundation outcomes.
- AQA marks its entire mole block **Higher only** — §5.3.2.1 through §5.3.2.4 in Trilogy.

So an AQA Foundation-tier worksheet, video or revision page contains **no moles at all**, while CCEA's Foundation paper can ask for them. For C1 §1.7, mine Higher-tier AQA material even when writing for Foundation.

The inversion runs the other way too, and the dossiers should say so rather than assume a single rule: CCEA marks §1.3.7 (the metallic model) and §1.3.12 (classifying a structure from given data) **Higher**, while AQA's metallic bonding sits in ordinary Foundation content. There, AQA's Foundation material is pitched below what CCEA's Higher paper wants.

### 2.3 Where the examiner reports say C1 marks are actually lost

In descending order of how often and how bluntly the reports say it:

1. **Symbols, formulae and equations** (`c1-symbols-and-formulae`, `c1-word-and-balanced-equations`, `c1-ionic-and-half-equations`) — reported weak in Summer 2025 *and* March 2026, at both tiers, with case-sensitivity (Cu, not CU), forgotten diatomic elements and half equations all named. This is also the highest-leverage cluster in the unit: every C2 calculation, every electrolysis half equation and every organic equation depends on it.
2. **Acids, bases and salts** (`c1-reactions-of-acids`, `c1-indicators-and-ph`, `c1-acids-alkalis-strength`) — named among the worst-answered areas, with the products of a metal oxide and an acid given as hydrogen and oxygen, and observations written without the detail the mark scheme wants.
3. **The Periodic Table** (`c1-periodic-table-structure`, `c1-group-7-halogens`) — named among the worst-answered areas; the group Mendeleev could not have predicted confused with the halogens, and halogen displacement colours confused with one another.
4. **Structure and bonding wording** (`c1-ionic-and-molecular-structures`, `c1-metallic-structures-classifying`) — the marks turn on naming van der Waals' forces, on positive ions *and* delocalised electrons together, and on ions being free to move and carry **charge** rather than current.

### 2.4 Suggested C1 batches

Batches are built so that no topic is written before its prerequisites, and so that a batch shares enough context for the second and later dossiers to land near 40 minutes.

| Batch | Topics | Why here |
|---|---|---|
| **C1-A** spine | atomic-structure, isotopes-relative-atomic-mass, ionic-bonding, covalent-bonding | All matched at high confidence; prerequisites for twenty of the remaining topics; examiner evidence on all four. The cheapest possible start. |
| **C1-B** the language | symbols-and-formulae, word-and-balanced-equations, ionic-and-half-equations, formula-mass-and-moles, reacting-masses-and-yield | Five, not four, because §1.7 should not be split across batches. The worst examiner reports in the unit, and it unblocks the C2 work already running. Carries the mole tier inversion. |
| **C1-C** acids | indicators-and-ph, acids-alkalis-strength, neutralisation-and-bases, reactions-of-acids | Named among the worst-answered areas; prerequisite for the Prescribed Practical C1 topic that follows. |
| **C1-D** practical and analysis | salts-and-lab-safety (PP C1), flame-tests (PP C2), separating-mixtures-chromatography, purity-and-formulations | Both C1 prescribed practicals, so both Unit 7 examinable. The most expensive batch to enrich and the one with the most CCEA-only vocabulary. |
| **C1-E** the Periodic Table | periodic-table-structure, metals-and-non-metals, group-1-alkali-metals, group-7-halogens, group-0-and-transition-metals | Five; the group chemistry hangs together, and group 7 needs the half equations from C1-B. |
| **C1-F** structures | ionic-and-molecular-structures, carbon-allotropes-nanoparticles, metallic-structures-classifying | Three; last because nothing else depends on it, but it is vocabulary-trap dense and the dossiers are cheap. |

---

## 3. P1 — the unit where CCEA stands alone

**16 of 22 matched, but 4 of the subject's 15 CCEA-only topics are here**, and they fall into exactly two corners of the unit: statics, and the nuclear tail.

### 3.1 The six topics the other boards will not carry

| Topic | Status | Evidence |
|---|---|---|
| `p1-moments` | **CCEA-only** | Moments, levers and gears are AQA Physics **8463 §4.5.4**, marked physics-only. In Edexcel 1SC0, pivot and lever both return zero. This is **Prescribed Practical P3**, difficulty 5 in our own taxonomy, and Summer 2025 Unit 7 reports it very poorly answered — the unit of a moment, its direction, and the missing conditions in the Principle of Moments statement. The most expensive topic in the unit and the one losing the most marks. |
| `p1-pressure` | **CCEA-only** | Pressure as force over area is AQA Physics **8463 §4.5.5**, physics-only. Edexcel's pressure statements in combined science are gas pressure (CP14.12, CP14.13), a different idea. See §5 for the video that teaches the wrong one. |
| `p1-nuclear-fission` | **CCEA-only** | AQA Physics **8463 §4.4.4.1**, physics-only; zero in Edexcel 1SC0, whose statements 6.28, 6.30 and 6.33 onwards are flagged as separate-physics content. |
| `p1-nuclear-fusion` | **CCEA-only** | AQA Physics **8463 §4.4.4.2**, same position. Both fission and fusion are extended-writing questions on CCEA, and both were reported confused with each other at both tiers in Summer 2025. |
| `p1-centre-of-gravity-stability` | partial | AQA names the centre of mass once, in passing, inside its gravity section. Stability, toppling and the line of action are CCEA's alone, and zero in Edexcel. |
| `p1-uses-of-radioactivity` | partial *(corrected today — see §7)* | Tracers, thickness control and smoke alarms return zero across all five specifications, and no board asks for a half-life to be **chosen** to suit a use. The two places to mine are AQA Physics 8463 §4.4.3.3, which is medical uses only, and Edexcel CP5.22, which carries gamma-ray sterilising and cancer treatment but files them under the electromagnetic spectrum rather than radioactivity. |

Two further scope notes that a P1 author will otherwise get wrong:

- **Background radiation is carried by Edexcel, not AQA.** `p1-background-radiation-dangers-safety` is a matched row, but AQA Trilogy §6.4.2.4 is contamination and irradiation only; AQA's background-radiation statement is Physics 8463 §4.4.3.1. The combined-science match comes from Edexcel CP6.12 and CP6.13. Radon, which CCEA names, appears in neither board.
- **Retardation has zero hits anywhere.** CCEA uses it for negative acceleration; every borrowed resource will say deceleration. Same class of trap as van der Waals' forces in C1, and it belongs in the `p1-vectors-velocity-acceleration` dossier as a vocabulary line.

### 3.2 Where the examiner reports say P1 marks are actually lost

1. **Definitions stated loosely** — power defined as force or strength (reported as the most challenging part of a Higher paper), mass not defined, half-life definitions losing the second mark by not saying what halves, the Principle of Moments missing its conditions, Hooke's law given with elastic limit instead of the limit of proportionality. P1 is a definitions unit, and the marks are lexical.
2. **Equations not written before substituting** — reported in March 2026 as a general physics failing; a wrong equation with a right number scores nothing.
3. **Multi-step force problems** — Newton II questions that need the weight first, and moment calculations where forces were subtracted instead of added.
4. **Units and conversions** — mass left in grams in kinetic-energy calculations, and the newton metre not recalled.

### 3.3 Suggested P1 batches

| Batch | Topics | Why here |
|---|---|---|
| **P1-A** motion | speed-equations (PP P1), vectors-velocity-acceleration, motion-graphs, forces-and-resultant | All matched; Prescribed Practical P1 is here; prerequisites for the rest of the mechanics. Carries the retardation vocabulary note. |
| **P1-B** forces | newtons-laws, mass-weight-free-fall, hookes-law (PP P2), pressure | Hooke's law is matched and comes with two borrowable practical write-ups; pressure is CCEA-only and sits with the forces it belongs to. |
| **P1-C** statics and work | moments (PP P3), centre-of-gravity-stability, work-and-power (PP P4), kinetic-and-potential-energy | The hardest and most CCEA-only batch in the unit, holding two prescribed practicals that have no equivalent on either board. Everything here must be built from CCEA outcomes, past papers and our own figures. Budget more than an hour a topic. |
| **P1-D** energy and density | energy-forms-conservation-efficiency, energy-resources, density-kinetic-theory | Three; all matched, all cheap, and density comes with a borrowable practical CCEA does not prescribe. |
| **P1-E** the nucleus | atom-nucleus-isotopes, radioactive-decay, half-life, background-radiation-dangers-safety | All matched; note that atom-nucleus-isotopes has `c1-atomic-structure` as its prerequisite, so C1-A should come first. |
| **P1-F** nuclear applications | uses-of-radioactivity, nuclear-fission, nuclear-fusion | Three; the most CCEA-only tail in the unit, all extended-writing, all reported weak. Last because it depends on P1-E. |

---

## 4. The practicals

Six of the eighteen prescribed practicals are in these two units, and for three of them a full method already exists on another board and can be read for apparatus choice, variable handling and the shape of the write-up.

| CCEA | What it is | AQA required practical | Edexcel core practical | Verdict |
|---|---|---|---|---|
| **C1** | reactions of acids, including the temperature changes | RP8 (soluble salt from an insoluble oxide or carbonate) **and** RP10 (variables affecting temperature change in reacting solutions) | preparation of pure, dry hydrated copper sulfate; change in pH on adding a solid to acid | Best-supplied practical in either unit. Two AQA practicals between them cover both halves of CCEA's one. |
| **C2** | identify ions by flame test | AQA Chemistry **8462** RP7 only (separate science) | none | Method mineable from the separate spec; colour words must come from CCEA. |
| **P1** | average speed down a ramp against slope | none exactly; RP19 is force against acceleration | CP2.11, laboratory methods for determining speed | Partial. The ramp-and-height design is CCEA's own. |
| **P2** | extension of a spring against force | RP18 | extension and work done when applying forces to a spring | Fully supplied, and AQA uses CCEA's phrase, the limit of proportionality. |
| **P3** | verify the Principle of Moments | none | none | **Ours alone.** No equivalent on either board, in either combined or separate science. |
| **P4** | measure personal power | none | none | **Ours alone.** Stair-climb or step-ups; no board has anything comparable. |

Three further topics in these units have **no** CCEA prescribed practical but do have a borrowable one, which is free enrichment for a technique CCEA still examines in Unit 7:

- `p1-density-kinetic-theory` — AQA RP17 and Edexcel's densities practical both do regular solids, irregular solids by displacement, and liquids. Summer 2025 Unit 7 reports the displacement method missed and density written as mass times volume, so this is worth taking.
- `c1-separating-mixtures-chromatography` — AQA RP12 and Edexcel's ink practical. The solvent front was reported unknown in Summer 2025.
- `p1-newtons-laws` — AQA RP19 and Edexcel's force, mass and acceleration practical.

---

## 5. What the media map already holds for these units, and where it misleads

All 47 topics already have entries in `data/links/media-map.json`: two videos each (one topic has one) and one to three simulations. Nothing needs to be found from scratch. But the entries were generated per topic rather than checked per topic, and a pre-read of the C1 and P1 entries turns up the same two failure modes already found in P2 and C2.

**Simulations that do not teach the topic.** Proposed for an authorised correction round; none has been changed, because `media-map.json` belongs to the content session and every previous round was authorised first.

| Entry | Sim | Problem |
|---|---|---|
| `c1-ionic-bonding`, `c1-covalent-bonding` | PhET Build an Atom | Build an Atom makes one atom from protons, neutrons and electrons. It cannot show a transfer or a shared pair, which is the whole of both topics. |
| `c1-group-1-alkali-metals`, `c1-group-7-halogens`, `c1-metals-and-non-metals`, `c1-flame-tests` | PhET Build an Atom | The same sim on four more entries where it has nothing to do with the content. On `c1-periodic-table-structure` it is defensible and should stay. |
| `c1-carbon-allotropes-nanoparticles`, `c1-metallic-structures-classifying` | PhET States of Matter | Shows solid, liquid and gas for simple substances; says nothing about giant structures, allotropes or nanoparticles. |
| `p1-pressure` | PhET Gas Properties | Gas pressure in a container, not force over area on a surface, which is the only pressure CCEA's P1 teaches. |
| `p1-centre-of-gravity-stability` | PhET Balancing Act | Correct for `p1-moments`, where it should stay with the one-fulcrum caveat already used elsewhere. It does not model toppling or the line of action, which is what this topic is about. |
| `p1-nuclear-fission`, `p1-nuclear-fusion` | PhET Build a Nucleus | Build a Nucleus is decay and stability; it is right on the three decay topics and padding on these two. |

**Videos that teach beyond or beside CCEA's scope.** These do not need removing, but the `why` line has to warn the learner where to stop, exactly as the P2 optics entries now do.

- `p1-pressure` — the second video is about pressure in fluids, which is AQA physics-only content. CCEA's P1 pressure stops at force over area.
- `c1-carbon-allotropes-nanoparticles` — the second video is graphene *and fullerenes*. Graphene is CCEA §1.3.10; fullerenes and nanotubes are not in CCEA at all, and nanoparticles, which CCEA does require, are in neither video.
- `c1-flame-tests` — the video is tagged as triple-science content, which is the correct signal that this is separate-science material, and its colour words will be AQA's rather than CCEA's.
- `p1-centre-of-gravity-stability` — the second video is a post-16 crash course; check the level before it is kept.

---

## 6. Recommended order

**C1 before P1.** Three reasons: C1 is the cheapest unit in the subject to enrich, so the early dossier hours buy the most; the C1-B language batch unblocks the C2 authoring already running; and P1's expensive batch (P1-C statics) needs a longer budget per topic than a first batch should carry. `p1-atom-nucleus-isotopes` also has `c1-atomic-structure` as its prerequisite.

Queue, in order:

1. **C1-A** spine — four matched topics, everything depends on them
2. **C1-B** the language — five topics, worst examiner reports, unblocks C2
3. **P1-A** motion — four matched topics with Prescribed Practical P1, so physics starts before chemistry finishes
4. **C1-C** acids
5. **P1-B** forces
6. **C1-D** practical and analysis — both chemistry prescribed practicals
7. **P1-C** statics and work — both physics-only prescribed practicals, longest budget
8. **C1-E** the Periodic Table
9. **P1-D** energy and density
10. **C1-F** structures
11. **P1-E** the nucleus
12. **P1-F** nuclear applications

**The one alternative worth considering.** If Unit 7 practical marks are the priority rather than unit coverage, invert the first three: C1-D, P1-C and P1-A first, since those three batches carry five of the six prescribed practicals in these units, and the two that no other board has (P3 and P4) need the longest lead time for our own figures and our own method write-ups.

---

## 7. Crosswalk corrections made while writing this

Both were made in `pipeline/enrichment/maps/science.mjs` and the file was rebuilt; `crosswalk.json` is never hand-edited. `build-crosswalk.mjs --check` reports 0 problems, and the science totals move from 80/34/16 to **80 matched / 35 partial / 15 CCEA-only**.

- **`p1-uses-of-radioactivity`: CCEA-only at medium confidence → partial at high confidence.** The medium confidence was honest doubt and the doubt was justified. Edexcel CP5.22 does carry gamma-ray sterilising and the detection and treatment of cancer; it is simply filed under the electromagnetic spectrum, where a search of the radioactivity topic would never find it. The AQA reference is also sharpened from §4.4.3 to §4.4.3.3, which is medical uses only. Recorded in the row's note so the change is auditable.
- **`p1-background-radiation-dangers-safety`: note added.** The row stays matched at high confidence, but the note now says the match is carried by Edexcel CP6.12 and CP6.13, that AQA Trilogy §6.4.2.4 is contamination and irradiation only, and that radon is CCEA's alone.

The first of these is the fourth time a CCEA-only or medium-confidence row has turned out to have a match filed under an unexpected heading. The lookup rule in `pipeline/enrichment/lookup-spec.mjs` already says to read the section a hit lands in; the corollary this correction adds is **search the whole specification, never one topic of it** — CCEA's unit boundaries and Edexcel's topic boundaries do not line up, and gamma rays are the clearest case so far of one subject taught in two different places on two different boards.

---

## 8. What this list does not settle

- **It does not choose the practical-skills treatment.** Unit 7 is examined as its own paper and its four skill groups cut across all six prescribed practicals in these units. Whether the practicals are taught inside the topic dossiers or gathered into their own sequence is a content decision, not a crosswalk one.
- **It does not check the videos.** The four warnings in §5 come from reading titles and `why` lines against the crosswalk, not from watching. The dossier author still has to watch what is being recommended.
- **It assumes the media map stays as it is.** Nothing in `data/links/media-map.json` was changed; the six simulation problems in §5 are a proposal awaiting authorisation.
