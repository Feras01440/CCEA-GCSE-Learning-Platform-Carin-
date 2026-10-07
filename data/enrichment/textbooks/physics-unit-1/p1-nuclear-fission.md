# p1-nuclear-fission: textbook dossier

**Book.** CCEA's Higher Tier eGuide to Physics Unit 1 of Double Award Science, © CCEA 2023 (git-ignored under `docs/sources/textbooks/`). Page numbers are the book's printed numbers; the PDF page is the printed number plus 4.
**Ours.** **No note and no bundle yet.** The slug exists in our taxonomy and the P1 deck (`data/decks/science/P1.json`) has 8 flashcards for it; `packs/science/content/p1/` has no folder. This dossier is a briefing for the first author.
**Spec.** P1 1.5.17, 1.5.18, 1.5.19 (all Foundation).
**Verdict.** **Thinner** (nothing authored). The book explains fission as forced rather than random, gets the sequence CCEA marks (a neutron absorbed, the nucleus splits into two smaller nuclei, energy and two or three neutrons released, a chain reaction), separates a controlled reactor from a bomb, and gives a long, balanced list for and against nuclear power with the specification's named incidents. It has no diagram of a chain reaction, and some of its debate points are dated or unverifiable (section 7).

---

## 1. Book chapter and pages

Section 1.5: learning outcomes p. 51; "Nuclear Fission" pp. 65–66 (the process, the chain reaction, control in a power station, the bomb, radioactive waste); the debate pp. 66–67 ("Political, social, environmental and ethical issues"); the employment and Chernobyl–Fukushima points also on p. 58.

## 2. The book's teaching sequence

1. Radioactive decay is random, but a heavy nucleus such as uranium can be made to split into two lighter ones: fission (p. 65).
2. A slow neutron is absorbed, the nucleus splits, the two fragments fly apart carrying a great deal of energy, and two or three fast neutrons come out too (p. 65).
3. Those neutrons cause further fissions: a chain reaction (p. 65).
4. In a power station the reaction is kept so that on average one neutron from each fission causes another; the heat makes steam to turn a turbine; a bomb is the uncontrolled case (p. 66).
5. The fragments are highly radioactive; waste may be turned to glass and stored deep underground for many millennia; containers may leak, and earthquakes may break them (p. 66).
6. Arguments for: large output, no carbon dioxide from the process, steady base-load supply, energy-dense fuel, jobs, new reactors planned abroad (p. 67).
7. Arguments against: waste; fear of living near plants and stores; Chernobyl (Ukraine) and Fukushima (Japan); greenhouse gases from mining, transporting and purifying uranium ore; one country's decision to close its reactors (p. 67).

## 3. Explanations and devices worth recreating (our own words)

- **Forced, not random** (p. 65). Decay happens by itself at random; fission happens because a neutron was absorbed. A one-line contrast that helps keep `p1-radioactive-decay` and this topic apart.
- **Exactly one onward neutron** (p. 66). Control means each fission leads to one more on average: fewer and the reaction dies, more and it runs away. A good "why" behind "controlled".
- **Name the fuel and the particle** (pp. 65–66). CCEA's schemes give a mark for naming uranium or plutonium as the fuel, a threshold mark for "neutron" and one for "absorbed", then marks for the smaller nuclei and the neutrons produced (Summer 2023 Higher Q2: `docs/sources/papers/science/2023-Summer/P1-H-Physics-MS-29631.txt`; March 2026 Higher Q2, six-mark answer: `docs/sources/papers/science/2026-March/P1-H-Physics-MS-68446.txt`). The book's sequence supplies every one of these words.
- **Low carbon, but not zero** (p. 67). Fission releases no carbon dioxide, but the fuel's mining, transport and purification do. This is the specification's own balanced point (1.5.19).

## 4. Diagrams and photographs

None. Our note needs a chain-reaction diagram (one neutron, a uranium nucleus, two fragments, three neutrons, each meeting another nucleus) and a controlled version where only one neutron goes on each time; and a simple block diagram of a power station (reactor heat, steam, turbine, generator).

## 5. Worked examples, calculations and data tasks

None (the specification says fission equations are not required).

## 6. Practice question types, with CCEA evidence

- **Name** a fuel (1; Summer 2023 Higher Q2(i): uranium or plutonium; the report says some named a fossil fuel).
- **State** what must happen first and two products other than energy (4; Summer 2023 Higher Q2(ii): neutron (threshold), absorbed; nuclei, neutrons).
- **Name** the process of further fissions (1; Summer 2023 Higher Q2(iii): chain reaction).
- **Name** a country with a major incident (1; Summer 2023 Higher Q2(iv): Ukraine or Japan; the report says many gave the USA or Russia).
- **Six-mark account** (March 2026 Higher Q2 and Foundation Q7: uranium or plutonium; neutron; absorbed; any two of smaller nuclei, energy, neutrons; chain reaction; the report says candidates mentioned uranium without saying it was the fuel, and lost marks by listing wrong products).
- **Order** the stages of fission from a list of phrases (4; 2019 November Higher Q7(a): one mark each for choosing the neutron being taken in, smaller nuclei forming and neutrons being released, and one for putting them in that order; a distractor describes nuclei joining).
- **Renewable or not?** (1; 2024 November Higher Q9: non-renewable).
- **For and against** (1–2; the specification's three bullets).

## 7. Definitions and wording, and doubtful statements

- **Fission** (p. 65): matches the glossary (a heavy nucleus such as uranium absorbs a neutron and splits into two lighter nuclei, emitting two or three neutrons and energy) and the specification ("several neutrons").
- **Nuclei, not atoms**: the book says nuclei throughout; the Summer 2025 Foundation report says "atoms" cost marks in the fusion question, and the same caution applies here.
- **Slow and fast neutrons** (p. 65): correct, but beyond the specification; she needs only "absorbs a neutron".
- **Dated or unverifiable debate points** (p. 67): that one country "envisages" a hundred new power stations, and the equivalence of 1 kg of uranium with a million kilograms of coal, are not in the specification and should not be taught as facts. The specification's own debate points (jobs against fear of living near plants and waste stores; the Ukraine and Japan incidents; greenhouse gases from the fuel cycle) are the ones that earn marks. The ratio of fusion to fission energy (about four times per kilogram) is in the specification (1.5.22) and belongs to `p1-nuclear-fusion`.
- **Waste storage** (p. 66): the glass-and-deep-burial description and the leak and earthquake risks are reasonable context for "concern about storage facilities".

## 8. Higher-tier-only content in the book

None (all Foundation).

## 9. Pitfalls and "remember" notes in the book

- Fission needs a neutron to be absorbed first (p. 65).
- The specification's countries are Ukraine and Japan (p. 58).

## 10. GAPS: what our first note must teach, ranked by exam weight

1. **The fission sequence** in the scheme's words (fuel named; neutron absorbed; splits into two smaller nuclei; releases energy and two or three neutrons), with a labelled diagram; a non-example that writes "atoms split".
2. **Chain reaction**, uncontrolled and controlled (one onward neutron), with the diagram.
3. **Fission against fusion** side by side (link to `p1-nuclear-fusion`), since the reports show candidates confusing them.
4. **Electricity from fission** in four boxes (heat, steam, turbine, generator).
5. **The debate**: the specification's three bullets, each as a for-and-against pair, and Ukraine and Japan named; a six-mark Your turn on a new prompt.

## 11. Anything in our material the book suggests is wrong or misleading

No note yet. The 8 deck cards agree with the book, the glossary and the specification.
