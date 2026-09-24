/**
 * Double Award Science (CCEA GCSE, 584): examiner-insight source for pipeline/mine/build-insights.mjs.
 * Read from pipeline/mine/cer-blocks/science (Summer 2023, 2024, 2025 and March 2026: B1-P2 at both tiers and the
 * Unit 7 Booklet B papers), with docs/research/03 section 7 as the map of what to look at. All wording is ours;
 * nothing longer than a few words is quoted from a report.
 *
 * Unit codes inside sources follow the ExaminerSource pattern (letters and digits only): B1H, C2F, P1H and, for
 * Unit 7 Booklet B, U7BBioH / U7BChemF / U7BPhysH (extract-cer writes the same blocks as U7B-Bio-H etc.;
 * scripts/validate-insights.mjs matches them with the hyphens removed).
 *
 * Topic ids are science.<unit>.<slug without the unit prefix> from data/spec/double-award-science-topics.json,
 * and science.u7.<planning|carrying-out|analysing|conclusions> for the Unit 7 skill groups.
 *
 * The vocabulary in science.misconceptions.mjs is bigger than the set of cards written so far. The builder rejects
 * a registry entry that no finding cites, so only cited entries (or ones carrying extraSources) are exported as
 * `misconceptions`; the rest are exported as `uncitedMisconceptions` and join the registry as soon as a card cites them.
 */
import { misconceptions as vocabulary } from "./science.misconceptions.mjs";

const S = (series, unit, q) => `ccea-cer:science:${series}:${unit}:Q${q}`;

export const insights = [
  // ------------------------------------------------------------------ Biology B1
  {
    id: "ins.science.b1.nitrogen-cycle",
    topic: "science.b1.nitrogen-cycle",
    specRefs: ["DA-B1-1.7.10"],
    findings: [
      {
        source: S("2023-summer", "B1H", 6),
        asked: "Compare soil data, identify a legume crop and explain what its root bacteria do for the soil.",
        wentWrong: "Comparisons were too loose ('high' oxygen rather than 'the highest'), and a surprising number did not recognise the crop as a legume, so they never reached the nitrogen-fixing bacteria in its root nodules.",
        rule: "A comparison needs a superlative or a comparative with both things named; legume means root nodules with nitrogen-fixing bacteria that raise soil nitrate.",
        misconceptions: ["sci.nitrogen.legume-role", "sci.comparison.no-comparative-language"],
      },
      {
        source: S("2025-summer", "B1H", 6),
        asked: "Name the four processes on a nitrogen-cycle diagram, then explain nitrate loss in a described soil.",
        wentWrong: "Few got all four: nitrogen fixation and nitrification were known, but the two in the middle (decomposition to ammonium, and denitrification back to nitrogen gas) were not. 'Waterlogged' and 'denitrifying' were usually right when asked directly.",
        fullMarkAnswersDid: "Named every arrow with the process, and matched each process to its type of bacteria.",
        rule: "Learn all four arrows as pairs: process plus bacteria.",
        misconceptions: ["sci.nitrogen.middle-processes-unknown", "sci.nitrogen.process-named-not-bacteria"],
      },
      {
        source: S("2026-march", "B1H", 7),
        asked: "Nitrogen cycle with a graph of crop yield against fertiliser level: name what nitrate is used for, calculate a percentage increase, interpret the plateau, name bacteria types and explain nitrate loss in waterlogged soil.",
        wentWrong: "Protein or amino acids was fine and the graph readings were right, but many divided by the wrong number in the percentage increase; only the strongest explained the flat top of the graph (the plants cannot absorb any more nitrate); naming the bacteria and explaining the waterlogged case were the hardest parts of the paper.",
        rule: "Percentage increase = change divided by the original value x 100. Waterlogged soil has no air, so denitrifying bacteria thrive and turn nitrate into nitrogen gas.",
        misconceptions: ["sci.nitrogen.process-named-not-bacteria", "sci.nitrogen.waterlogged-soil-effect", "sci.graph.trend-not-from-data"],
      },
    ],
    ruleToRemember: "Four arrows, four bacteria: nitrogen-fixing (nitrogen gas to nitrate, in soil or root nodules), decomposers (protein to ammonium), nitrifying (ammonium to nitrate) and denitrifying (nitrate to nitrogen gas, in waterlogged soil). Always say which bacteria and which process.",
    aStarSignal: "Explaining the waterlogged case as a chain - no air spaces, no oxygen, denitrifying bacteria multiply, nitrate becomes nitrogen gas, less nitrate for plant protein - and reading a fertiliser graph's plateau as the plant's uptake limit.",
  },

  {
    id: "ins.science.b1.minerals-eutrophication",
    topic: "science.b1.minerals-eutrophication",
    specRefs: ["DA-B1-1.7.11", "DA-B1-1.7.12"],
    findings: [
      {
        source: S("2024-summer", "B1H", 2),
        asked: "Six-mark QWC on the root hair cell: structure, what it takes in and how.",
        wentWrong: "Most scored four or more, but only the better answers linked mineral absorption to active uptake; some claimed water is taken in by active transport, and a few called it a 'hair root cell'.",
        rule: "Minerals in by active transport; water in by osmosis; the extension gives a large surface area.",
        misconceptions: ["sci.active-transport.water-by-active-transport", "sci.root-hair.adaptation-not-named"],
      },
      {
        source: S("2024-summer", "B1H", 8),
        asked: "Explain a fertiliser run-off problem and put the stages of eutrophication in order.",
        wentWrong: "Answers that said 'nutrients' instead of nitrate or phosphate earned nothing for that point, and the order of the stages was widely confused - a strongly discriminating question.",
        rule: "Name the ion (nitrate/phosphate) and learn the stages as a causal chain.",
        misconceptions: ["sci.eutrophication.vague-nutrients", "sci.eutrophication.sequence-confused"],
      },
      {
        source: S("2025-summer", "B1H", 7),
        asked: "Identify a root hair cell from a drawing, then describe and explain active transport.",
        wentWrong: "The cell had to be recognised by its lack of an extension (descriptions in terms of body parts were not accepted); active transport explanations went wrong on the direction of the concentration gradient, and again some said water enters by active transport.",
        rule: "Active transport moves mineral ions against the gradient (low to high) using energy from respiration.",
        misconceptions: ["sci.active-transport.gradient-direction", "sci.active-transport.water-by-active-transport", "sci.root-hair.adaptation-not-named"],
      },
      {
        source: S("2025-summer", "B1H", 8),
        asked: "Complete a diagram of the stages of eutrophication.",
        wentWrong: "Most earned something, but the last three stages (decomposers multiply, oxygen used up, animals die) were the ones left wrong or blank.",
        rule: "The end of the chain is about oxygen: bacteria respire, oxygen falls, fish die.",
        misconceptions: ["sci.eutrophication.sequence-confused"],
      },
    ],
    ruleToRemember: "Roots take in mineral ions by active transport (against the gradient, energy from respiration) and water by osmosis. Eutrophication in order: fertiliser (nitrate/phosphate) washed into water, algae bloom, light blocked so plants die, bacteria decompose them and respire, oxygen runs out, animals die.",
    aStarSignal: "Writing each eutrophication stage with its cause ('plants die because the algae block the light'), and naming the ion rather than 'nutrients'.",
  },

  // ------------------------------------------------------------------ Biology B2
  {
    id: "ins.science.b2.osmosis",
    topic: "science.b2.osmosis",
    specRefs: ["DA-B2-2.1.1", "DA-B2-2.1.2", "DA-B2-2.1.3", "DA-PRAC-B5"],
    findings: [
      {
        source: S("2024-summer", "B2H", 3),
        asked: "A potato core in a concentrated sugar solution: explain the change in the liquid level and describe the cells.",
        wentWrong: "Many misread the question and wrote about concentration rather than the level; a general definition of osmosis earned nothing - the answer had to say water leaves the potato and where it goes. Some thought 'smaller' could not be used twice (vacuole and cytoplasm both shrink); few could answer about the cell membrane.",
        fullMarkAnswersDid: "Traced the water: from the dilute potato cells, through the partially permeable membranes, into the concentrated solution outside, so the level rises.",
        rule: "Apply osmosis to this situation: which way the water moves and what that does.",
        misconceptions: ["sci.osmosis.level-vs-concentration", "sci.osmosis.definition-not-applied"],
      },
      {
        source: S("2023-summer", "U7BBioH", 4),
        asked: "Red blood cells in salt solutions of different concentrations; then why potato cells behave differently.",
        wentWrong: "Measuring and picking the matching concentration were fine; the explanation was the most discriminating item on the paper, with many writing the definition or a muddled account, and few linked the potato cell wall to limiting how much water can enter.",
        rule: "Animal cells burst or shrivel; plant cells become turgid or plasmolysed because the wall stops them bursting.",
        misconceptions: ["sci.osmosis.definition-not-applied", "sci.osmosis.cell-wall-limits-entry"],
      },
    ],
    ruleToRemember: "Osmosis is the movement of water through a partially permeable membrane from a dilute to a more concentrated solution. In the exam, name the direction for the situation given and its effect (level, mass, length, turgid or plasmolysed); the cell wall is why plant cells do not burst.",
    aStarSignal: "Explaining a novel set-up (Visking tubing, blood cells, potato chips) with the direction of water movement, the reason, and the consequence in one clear chain.",
  },

  {
    id: "ins.science.b2.transpiration-potometer",
    topic: "science.b2.transpiration-potometer",
    specRefs: ["DA-B2-2.1.4", "DA-B2-2.1.5", "DA-B2-2.1.6", "DA-PRAC-B6"],
    findings: [
      {
        source: S("2024-summer", "U7BBioH", 4),
        asked: "Name the potometer, say how to reset the bubble, read and calculate its movement, then use data on two factors.",
        wentWrong: "Naming and calculating went well; fewer could reset the bubble; temperature was identified as the factor but the link to a faster rate of transpiration was often missing, and only the more able backed the choice with figures from the data.",
        rule: "Reset from the reservoir; a factor answer needs the factor, the direction of its effect on transpiration and the data that shows it.",
        misconceptions: ["sci.transpiration.potometer-reset-unknown", "sci.graph.trend-not-from-data"],
      },
      {
        source: S("2025-summer", "B2F", 9),
        asked: "Where water vapour leaves a leaf, how light intensity affects transpiration, and why the potometer bubble moves.",
        wentWrong: "Few could name stomata and air spaces; some stated the light-transpiration relationship the wrong way round; the bubble's direction earned a mark but explanations were confused - water thought to enter through the stomata, or the whole thing treated as oxygen from photosynthesis.",
        rule: "Water is pulled up to replace water lost as vapour through the stomata; the bubble follows the water towards the leaf.",
        misconceptions: ["sci.transpiration.exit-route-vague", "sci.transpiration.factor-trend-reversed", "sci.transpiration.water-enters-through-stomata", "sci.transpiration.bubble-confused-with-oxygen"],
      },
      {
        source: S("2025-summer", "B2H", 5),
        asked: "Same paper at Higher: exit route, light intensity, another factor, and the bubble.",
        wentWrong: "Stomata was known but air spaces often missed; the same reversed relationship and the same two wrong explanations of the bubble appeared.",
        rule: "Say both: through the air spaces and out of the stomata.",
        misconceptions: ["sci.transpiration.exit-route-vague", "sci.transpiration.water-enters-through-stomata", "sci.transpiration.bubble-confused-with-oxygen"],
      },
      {
        source: S("2023-summer", "B2H", 4),
        asked: "A day-long graph of water uptake: read times, explain the peak, and what the stomata do.",
        wentWrong: "Times had to be exact (midday and midnight both appear on the axis); most said light or temperature was highest and photosynthesis was happening, but only the more able linked the peak to carbon dioxide entering through open stomata and to transpiration.",
        rule: "Read the axis precisely, then connect the peak to stomata being open for photosynthesis.",
        misconceptions: ["sci.graph.trend-not-from-data", "sci.transpiration.exit-route-vague"],
      },
    ],
    ruleToRemember: "Transpiration is the loss of water vapour from the leaf through the stomata (via the air spaces); water is pulled up the xylem to replace it, which is what moves the potometer bubble towards the plant. Rate rises with light, temperature and wind and falls with humidity; reset the bubble from the reservoir.",
    aStarSignal: "Reading a potometer or day-cycle graph and explaining the numbers with the mechanism - stomata open, vapour lost, water pulled up - rather than restating the trend.",
  },

  {
    id: "ins.science.b2.monohybrid-genetics",
    topic: "science.b2.monohybrid-genetics",
    specRefs: ["DA-B2-2.4.8"],
    findings: [
      {
        source: S("2024-summer", "B2H", 11),
        asked: "A pedigree of an inherited condition: the exact relationship between two people, a genotype from the key, a carrier probability, the complete phenotype of one person, then a Punnett square for two named parents.",
        wentWrong: "The relationship had to be exact ('father', not 'parent'); answers that read past the bold word 'complete' named the condition without the sex; and the Punnett square - examined many times before - was still completed wrongly by a large number, though a correct cross from wrong gametes earned error-carried-forward marks.",
        fullMarkAnswersDid: "Gave the phenotype in full, sex and condition together, and set out the parents' gametes before filling the square.",
        rule: "A bold word in a genetics stem changes the answer: a complete phenotype names the sex as well as the condition. Genotypes, then gametes, then the square.",
        misconceptions: ["sci.genetics.bold-word-ignored", "sci.genetics.parental-genotype-wrong"],
      },
      {
        source: S("2025-summer", "B2H", 8),
        asked: "Complete a two-generation inheritance diagram (parents, gametes, first and second generations), then describe a test (back) cross for an animal of unknown genotype.",
        wentWrong: "Some began from the wrong parental genotype and lost marks as a result; only the more able could describe how to carry out a test cross.",
        rule: "A test cross uses a homozygous recessive partner: any recessive offspring proves the unknown parent is heterozygous.",
        misconceptions: ["sci.genetics.parental-genotype-wrong", "sci.genetics.test-cross-unknown"],
      },
      {
        source: S("2025-summer", "B2F", 4),
        asked: "State the genotype terms for given allele pairs, draw a Punnett square and give a percentage.",
        wentWrong: "Surprisingly few could write 'homozygous dominant' and 'homozygous recessive'; the square itself was mostly right (three of four marks common) and quite a few found the 50%.",
        rule: "Homozygous = two identical alleles (dominant or recessive); heterozygous = one of each.",
        misconceptions: ["sci.genetics.terms-homozygous-heterozygous"],
      },
      {
        source: S("2024-summer", "B2F", 5),
        asked: "Parental genotypes and alleles, then choose the correct Punnett squares from options.",
        wentWrong: "Genotypes were given by quite a few but the alleles by fewer; the unfamiliar 'choose the square' format was managed only by the better candidates.",
        rule: "An allele is one letter; a genotype is the pair.",
        misconceptions: ["sci.genetics.terms-homozygous-heterozygous"],
      },
    ],
    ruleToRemember: "Write the parents' genotypes first (obey the bold words), then their gametes, then the square, then count the ratio or percentage the question asks for. Homozygous = two identical alleles, heterozygous = different; a test cross uses a homozygous recessive partner.",
    aStarSignal: "Correct genotypes from a pedigree with the reasoning stated, then a test cross explained in terms of what the offspring would reveal.",
  },

  {
    id: "ins.science.b2.mitosis-meiosis",
    topic: "science.b2.mitosis-meiosis",
    specRefs: ["DA-B2-2.4.5", "DA-B2-2.4.6", "DA-B2-2.4.7"],
    findings: [
      {
        source: S("2025-summer", "B2H", 9),
        asked: "Pick the four nuclei produced by meiosis from a set of diagrams, name the process that produces the variation, and give functions of mitosis.",
        wentWrong: "Many knew to pick four but only the more able picked the right four; very few named independent assortment; mitosis functions were fine.",
        rule: "Meiosis: four genetically different haploid nuclei; the shuffling is called independent assortment.",
        misconceptions: ["sci.genetics.meiosis-products-chosen-wrongly", "sci.genetics.independent-assortment-unknown"],
      },
      {
        source: S("2023-summer", "B2H", 9),
        asked: "Draw the cells a four-chromosome cell makes by mitosis and by meiosis, give the role of independent assortment, then name the sex chromosomes and say how a sperm cell differs from a germ cell in them.",
        wentWrong: "The drawings were better than on the paper's other drawing question, though a few candidates did not grasp the process (the report's overview says many drawings showed a lack of knowledge of it); for independent assortment examiners wanted the word 'variation' and seldom saw it; only a minority could give XY in the germ cells but X or Y in a single sperm.",
        rule: "Germ cells are diploid (XY); each sperm is haploid and carries X or Y.",
        misconceptions: ["sci.genetics.chromosome-numbers-gametes", "sci.genetics.meiosis-products-chosen-wrongly"],
      },
    ],
    ruleToRemember: "Mitosis makes two identical diploid cells, which is how an organism grows, replaces worn-out cells and repairs damaged tissue. Meiosis makes four genetically different haploid gametes with half the chromosome number; independent assortment is the source of the variation. Count chromosomes: 46 in body cells and germ cells, 23 in gametes.",
    aStarSignal: "Choosing the products from diagrams by chromosome number and combination, and using 'independent assortment' and 'variation' unprompted.",
  },

  {
    id: "ins.science.b2.defence-mechanisms-immunity",
    topic: "science.b2.defence-mechanisms-immunity",
    specRefs: ["DA-B2-2.6.5"],
    findings: [
      {
        source: S("2024-summer", "B2H", 2),
        asked: "Identify the antibody, describe how it matches the antigen, explain immobilisation, then describe phagocytosis.",
        wentWrong: "Identifying it was easy; describing the match was not - 'the same shape' instead of complementary, and fitting 'the microorganism' rather than its antigen. Immobilisation answers were vague, and phagocytosis descriptions wandered instead of using the three expected words.",
        fullMarkAnswersDid: "Said the antibody's shape is complementary to the antigen, that clumping stops the microorganisms reproducing or spreading, and that phagocytes engulf and digest the clump.",
        rule: "Complementary, not the same; antigen, not microorganism; phagocyte, engulf, digest.",
        misconceptions: ["sci.immunity.antibody-shape-same-not-complementary", "sci.immunity.phagocytosis-terms"],
      },
      {
        source: S("2024-summer", "B2F", 7),
        asked: "The same antibody question at Foundation.",
        wentWrong: "Same pattern: the complementary idea was the sticking point and phagocytosis lacked the standard vocabulary.",
        rule: "Use the textbook words; they are the mark scheme.",
        misconceptions: ["sci.immunity.antibody-shape-same-not-complementary", "sci.immunity.phagocytosis-terms"],
      },
      {
        source: S("2023-summer", "B2H", 3),
        asked: "Choose which antibody would be produced against a drawn microorganism.",
        wentWrong: "Many did not choose the antibody whose shape was complementary to the drawn antigen, though most still scored well on the rest of the question.",
        rule: "Match the antibody to the antigen's shape like a lock and key.",
        misconceptions: ["sci.immunity.antibody-shape-same-not-complementary"],
      },
    ],
    ruleToRemember: "Antigens are on the surface of the microorganism; lymphocytes make antibodies whose shape is complementary to that antigen; the antibodies bind and clump (immobilise) the microorganisms, which phagocytes then engulf and digest.",
    aStarSignal: "Choosing the right antibody from shapes and then explaining the whole sequence in the scheme's own vocabulary.",
  },

  {
    id: "ins.science.b2.antibiotics-resistance-vaccines",
    topic: "science.b2.antibiotics-resistance-vaccines",
    specRefs: ["DA-B2-2.6.6", "DA-B2-2.6.7", "DA-B2-2.6.8"],
    findings: [
      {
        source: S("2025-summer", "B2H", 3),
        asked: "What a vaccine causes the body to make, and why a second exposure is dealt with faster.",
        wentWrong: "'Antibodies' was known; the secondary response was described vaguely or as being about the specific fit of antibodies, rather than memory lymphocytes producing antibodies faster and in larger amounts.",
        rule: "Secondary response = memory lymphocytes, faster, more antibodies.",
        misconceptions: ["sci.immunity.secondary-response-vague"],
      },
      {
        source: S("2025-summer", "B2F", 7),
        asked: "The same vaccination question at Foundation.",
        wentWrong: "Many gave the same vague or misdirected secondary-response answers.",
        rule: "Three ideas: memory cells, quicker, bigger.",
        misconceptions: ["sci.immunity.secondary-response-vague"],
      },
      {
        source: S("2024-summer", "B2H", 9),
        asked: "Explain, in an unfamiliar predator-prey context, why resistance increased in a population, then give the advantage of the change to the other species.",
        wentWrong: "Natural selection is a topic candidates find difficult: a number drifted into immunity and antibodies instead of the passing on of advantageous genes, and too many gave the effect on the predator when the advantage to the prey was asked for.",
        rule: "Resistance in a population is natural selection - variation, survival, reproduction, allele passed on - not immunity.",
        misconceptions: ["sci.immunity.natural-selection-as-immunity"],
      },
      {
        source: S("2025-summer", "U7BBioH", 3),
        asked: "Compare antibiotic clear zones and use them as evidence about MRSA.",
        wentWrong: "Picking the best antibiotic was easy, but the reason needed the evidence (largest clear zone, so it killed the most bacteria); a statement that one antibiotic was ineffective against both strains was often missed; and only the more able used the diagram rather than general knowledge about MRSA.",
        rule: "Every judgement from a practical needs the measurement that supports it.",
        misconceptions: ["sci.comparison.no-comparative-language", "sci.graph.trend-not-from-data"],
      },
    ],
    ruleToRemember: "A vaccine contains antigens, so lymphocytes make antibodies and memory lymphocytes; on re-infection the response is faster and larger. Antibiotics kill bacteria (not viruses); resistance spreads because resistant bacteria survive and reproduce - natural selection, not immunity.",
    aStarSignal: "Separating three ideas that sound alike - antibody, antibiotic, resistance - and explaining a resistance graph with selection of alleles rather than immunity.",
  },

  // ------------------------------------------------------------------ Chemistry C1
  {
    id: "ins.science.c1.symbols-and-formulae",
    topic: "science.c1.symbols-and-formulae",
    specRefs: ["DA-C1-1.5.1", "DA-C1-1.5.2", "DA-C1-1.5.3"],
    findings: [
      {
        source: S("2025-summer", "C1F", 3),
        asked: "From a table of symbols and formulae pick a diatomic gas, count atoms in magnesium hydrogencarbonate, write the formula of sulfur dioxide, and name CaCO3.",
        wentWrong: "Counting atoms in a formula with brackets was hard; SO3 was often given for sulfur dioxide; numbers written full-size and letters in the wrong case cost marks; CaCO3 was named copper carbonate or 'carbon carbonate' by a few.",
        rule: "Brackets multiply everything inside; subscripts small; Ca not CA; -ide, -ate and -ite tell you the ion.",
        misconceptions: ["sci.formulae.subscript-case-errors", "sci.formulae.data-leaflet-not-used"],
      },
      {
        source: S("2025-summer", "C1H", 3),
        asked: "Diatomic gas of two different elements, counting oxygen atoms and molecular ions, names of two compounds that give carbon dioxide with acid, formulae of the products of sodium with hydrochloric acid.",
        wentWrong: "CO2 was the common wrong 'diatomic' answer; formulae were offered where names were asked and equations where formulae were asked - neither is credited; often only one of the two product formulae was right.",
        rule: "Diatomic means two atoms; give exactly the form the question names (name, formula or equation).",
        misconceptions: ["sci.definitions.diatomic-two-or-more", "sci.formulae.equation-given-for-formula"],
      },
      {
        source: S("2023-summer", "C1H", 1),
        asked: "Give the formula and name of the ion carrying a double negative charge from data in a table.",
        wentWrong: "Only a few managed both; the ion table on the Data Leaflet and the group number were not used.",
        rule: "The Data Leaflet lists the common ions; a Group 6 element forms a 2- ion.",
        misconceptions: ["sci.formulae.data-leaflet-not-used", "sci.formulae.ionic-charges-partial"],
      },
      {
        source: S("2024-summer", "U7BChemH", 4),
        asked: "Balanced equations in a practical context.",
        wentWrong: "The equations failed at the first hurdle: formula writing was very poor, so no balancing marks could follow.",
        rule: "A wrong formula blocks every later mark; get it from the leaflet ions or the valency.",
        misconceptions: ["sci.formulae.subscript-case-errors"],
      },
    ],
    ruleToRemember: "Formulae come from the Data Leaflet ions (cross the charges, brackets round molecular ions: Mg(HCO3)2) and from valency for covalent molecules. H2, O2, N2, Cl2 are diatomic. Symbols are case-sensitive, numbers are subscripts, and a question that says 'formula' wants a formula only.",
    aStarSignal: "Writing formulae for unfamiliar salts (iron(III) carbonate, ammonium sulfate) straight from the ion charges without hesitation.",
  },

  {
    id: "ins.science.c1.word-and-balanced-equations",
    topic: "science.c1.word-and-balanced-equations",
    specRefs: ["DA-C1-1.5.4", "DA-C1-1.5.5", "DA-C1-1.5.6"],
    findings: [
      {
        source: S("2025-summer", "C1F", 3),
        asked: "Balance the symbol equation for sodium with hydrochloric acid using the spaces provided.",
        wentWrong: "Many balanced it, but some changed the formulae instead of putting numbers in the spaces.",
        rule: "Balance with large numbers in front; never alter a formula.",
        misconceptions: ["sci.equations.formula-changed-to-balance"],
      },
      {
        source: S("2026-march", "C1H", 3),
        asked: "Write a balanced symbol equation for a Group 1 metal with water.",
        wentWrong: "A large number stopped at the first marking point, and many wrote sodium oxide as the product.",
        rule: "Group 1 metal + water gives the hydroxide + hydrogen: 2Na + 2H2O -> 2NaOH + H2.",
        misconceptions: ["sci.equations.balancing-omitted", "sci.equations.sodium-water-gives-oxide"],
      },
      {
        source: S("2026-march", "C1H", 4),
        asked: "A less familiar balanced equation with sodium carbonate as a product.",
        wentWrong: "Extra substances were added to the left-hand side and the formula of sodium carbonate was often wrong, so the standard was lower than for the familiar equation.",
        rule: "Only the substances named in the question appear; write each formula from its ions before balancing.",
        misconceptions: ["sci.equations.extra-substances-added", "sci.formulae.data-leaflet-not-used"],
      },
      {
        source: S("2025-summer", "U7BChemH", 1),
        asked: "Balanced symbol equation, with state symbols, for lithium reacting with water.",
        wentWrong: "Wrong formulae, wrong balancing numbers and wrong state symbols all appeared; the QWC on the same reactions also produced potassium oxide instead of the hydroxide.",
        rule: "Three separate checks: formulae, balance, state symbols (s, l, g, aq).",
        misconceptions: ["sci.equations.state-symbols-missing", "sci.equations.balancing-omitted", "sci.equations.sodium-water-gives-oxide"],
      },
      {
        source: S("2024-summer", "C2F", 1),
        asked: "Balance an equation involving calcium oxide.",
        wentWrong: "The commonest error was to 'balance' by rewriting CaO as CaO2.",
        rule: "If the formula changes, the substance changes - it is no longer balancing.",
        misconceptions: ["sci.equations.formula-changed-to-balance"],
      },
    ],
    ruleToRemember: "Three marks: correct reactant formulae, correct product formulae, then balance with numbers in front (never inside) a formula. Metals with water give the hydroxide and hydrogen. Add state symbols only when asked, and get them right: aqueous for anything dissolved.",
    aStarSignal: "Writing and balancing an unfamiliar equation from a description of the reactants and products, with every formula built from ions or valency.",
  },

  {
    id: "ins.science.c1.ionic-and-half-equations",
    topic: "science.c1.ionic-and-half-equations",
    specRefs: ["DA-C1-1.5.8", "DA-C1-1.5.9"],
    findings: [
      {
        source: S("2025-summer", "C1H", 1),
        asked: "Ionic equation for the displacement of iodide by bromine, and the colour change seen.",
        wentWrong: "Only a small number produced the ionic equation; the report says this skill will keep being examined. The colour change was also poorly known, with bromine's and iodine's colours confused.",
        rule: "Br2 + 2I- -> 2Br- + I2: molecules and ions only, spectator potassium ions removed, charges balanced.",
        misconceptions: ["sci.equations.ionic-spectator-ions-included", "sci.halogens.colours-and-states"],
      },
      {
        source: S("2024-summer", "C1H", 1),
        asked: "Balanced equation for chlorine with potassium iodide, then the half equation for the chloride ions formed.",
        wentWrong: "'KI2' and chlorine written as a single atom spoiled the full equation; the half equation was usually written from chlorine atoms rather than Cl2 molecules.",
        rule: "Start from what is actually there: Cl2 + 2e- -> 2Cl-.",
        misconceptions: ["sci.formulae.diatomic-forgotten", "sci.equations.half-equation-atoms-not-molecules"],
      },
      {
        source: S("2026-march", "C1H", 3),
        asked: "Half equation for the formation of bromide ions in a displacement.",
        wentWrong: "One of the least successful items on the paper; many scored nothing, with atoms instead of molecules and electrons on the wrong side the usual faults.",
        rule: "Non-metal molecule gains electrons: Br2 + 2e- -> 2Br-.",
        misconceptions: ["sci.equations.half-equation-atoms-not-molecules", "sci.equations.electrons-wrong-side"],
      },
      {
        source: S("2025-summer", "C2H", 2),
        asked: "Half equation for iron forming iron(III) ions during rusting.",
        wentWrong: "A good discriminator: electrons were put on the wrong side or the wrong number was written.",
        rule: "A metal loses electrons, so they appear on the right: Fe -> Fe3+ + 3e-.",
        misconceptions: ["sci.equations.electrons-wrong-side"],
      },
      {
        source: S("2025-summer", "U7BChemH", 3),
        asked: "Complete a table of observations, products and half equations for the electrolysis of molten lithium chloride.",
        wentWrong: "Most of the table was right; the anode half equation was the hardest cell.",
        rule: "At the anode ions lose electrons: 2Cl- -> Cl2 + 2e-.",
        misconceptions: ["sci.equations.half-equation-atoms-not-molecules", "sci.equations.electrons-wrong-side"],
      },
    ],
    ruleToRemember: "Ionic equation: write the full equation, split soluble ionic compounds into ions, cross out the spectators, check atoms and charge balance. Half equation: start from the real species (Cl2, not Cl), metals and negative ions lose electrons (e- on the right), metal ions and halogen molecules gain them (e- on the left); the number of electrons matches the charge.",
    aStarSignal: "Producing ionic and half equations for a reaction seen for the first time, with a charge-balance check written down.",
  },

  // ------------------------------------------------------------------ Chemistry C2
  {
    id: "ins.science.c2.homologous-series-alkanes",
    topic: "science.c2.homologous-series-alkanes",
    specRefs: ["DA-C2-2.5.1", "DA-C2-2.5.2", "DA-C2-2.5.3", "DA-C2-2.5.4"],
    findings: [
      {
        source: S("2025-summer", "C2F", 4),
        asked: "Features of a homologous series, the series with general formula CnH2n, the formula of a 12-carbon alkane, the definition of a hydrocarbon, and the products of burning methane.",
        wentWrong: "CnH2n was not recognised as the alkenes; the alkane formula was sometimes left as C12H24+2; 'hydrocarbon' definitions dropped the word 'only' or called the atoms molecules; combustion products were given as names when formulae were required.",
        rule: "Alkanes CnH2n+2, alkenes CnH2n; a hydrocarbon contains hydrogen and carbon ONLY; CO2 and H2O as formulae.",
        misconceptions: ["sci.organic.general-formula-unknown", "sci.organic.hydrocarbon-definition-only", "sci.organic.combustion-products-named-not-formulae"],
      },
      {
        source: S("2025-summer", "C2H", 4),
        asked: "Hydrocarbon definition, complete-combustion products, and the balanced equation for incomplete combustion of methane.",
        wentWrong: "The definition again lost 'only' (or called the atoms ions); incomplete combustion equations were partly right, with formula marks but not the balance.",
        rule: "Incomplete combustion gives carbon monoxide (and/or carbon) and water; balance the oxygen last.",
        misconceptions: ["sci.organic.hydrocarbon-definition-only"],
      },
      {
        source: S("2023-summer", "C2F", 4),
        asked: "Identify compounds from structures: which are gases, which is an alkane, name a four-carbon alkene, draw butane, write a word equation for its combustion.",
        wentWrong: "Few could tell all four were gases; but-1-ene was named but-2-ene or propene; butane's structure was drawn badly; the combustion word equation defeated most.",
        rule: "Count carbons for the prefix (meth, eth, prop, but); draw every C-H bond; alkane + oxygen -> carbon dioxide + water.",
        misconceptions: ["sci.organic.naming-chain-length", "sci.organic.structure-drawing-poor"],
      },
      {
        source: S("2024-summer", "C2H", 4),
        asked: "Fractional distillation processes, uses of fractions, then structures, names and reactions along the ethene-ethanol-ethanoic acid route.",
        wentWrong: "The steps of fractional distillation were not known even with a word list; the physical state of propane and the names ethanol and propanoic acid were often wrong.",
        rule: "Fractional distillation: crude oil heated and vaporised, column cooler at the top, fractions condense at their boiling points.",
        misconceptions: ["sci.organic.fractional-distillation-process", "sci.organic.naming-chain-length"],
      },
    ],
    ruleToRemember: "A homologous series has the same general formula, the same functional group, similar reactions and a gradual change in physical properties. Alkanes CnH2n+2, alkenes CnH2n, alcohols CnH2n+1OH; name by carbon count; a hydrocarbon is hydrogen and carbon only; complete combustion gives CO2 and H2O.",
    aStarSignal: "Moving between name, molecular formula and full structural formula for any member of the series, and writing a balanced equation for incomplete combustion.",
  },

  {
    id: "ins.science.c2.alkenes",
    topic: "science.c2.alkenes",
    specRefs: ["DA-C2-2.5.12", "DA-C2-2.5.13", "DA-C2-2.5.14", "DA-C2-2.5.15", "DA-C2-2.5.16"],
    findings: [
      {
        source: S("2025-summer", "C2F", 4),
        asked: "Circle the functional group in propene, name the alkene from its structure, name the polymer made from ethene.",
        wentWrong: "The circle often took in hydrogen atoms as well as the C=C; propene was named ethene or but-1-ene; naming poly(ethene) was beyond most and many did not try.",
        rule: "The alkene functional group is the C=C double bond and nothing else; the polymer is poly(monomer).",
        misconceptions: ["sci.organic.functional-group-includes-h", "sci.organic.naming-chain-length", "sci.organic.polymer-name"],
      },
      {
        source: S("2023-summer", "C2F", 4),
        asked: "General formula of the alkenes, the reagent and colour change that test for C=C.",
        wentWrong: "Very few gave CnH2n even with formulae in front of them; only some named bromine water and its change from orange-brown to colourless.",
        rule: "Bromine water: orange (or brown) to colourless with an alkene; no change with an alkane.",
        misconceptions: ["sci.organic.general-formula-unknown"],
      },
      {
        source: S("2023-summer", "C2H", 4),
        asked: "Draw propene, write the equation for ethene with hydrogen, then addition polymerisation.",
        wentWrong: "Propene was drawn poorly; the ethene + hydrogen equation was surprisingly weak even with the reactants given; polymerisation was fair.",
        rule: "Addition: the double bond opens and the small molecule adds across it - ethene + H2 gives ethane.",
        misconceptions: ["sci.organic.structure-drawing-poor"],
      },
      {
        source: S("2024-summer", "C2H", 4),
        asked: "Ethene to ethanol (reagent), drawing 1,2-dibromoethane, general formula of the alkenes.",
        wentWrong: "'Water' was given instead of steam for the hydration; 1,2-dibromoethane was drawn badly; the general formula was well known this time.",
        rule: "Ethene + steam (catalyst) -> ethanol; Br2 adds one Br to each carbon of the former double bond.",
        misconceptions: ["sci.organic.structure-drawing-poor"],
      },
    ],
    ruleToRemember: "Alkenes are CnH2n with a C=C functional group (circle only the double bond). Test: bromine water goes from orange-brown to colourless. Addition reactions open the double bond: H2 gives the alkane, Br2 the dibromoalkane, steam the alcohol; many ethene molecules add to give poly(ethene).",
    aStarSignal: "Drawing the full structure of an addition product (1,2-dibromopropane) and the repeating unit of a polymer from an unfamiliar monomer.",
  },

  {
    id: "ins.science.c2.aluminium-extraction",
    topic: "science.c2.aluminium-extraction",
    specRefs: ["DA-C2-2.7.1", "DA-C2-2.7.4", "DA-C2-2.7.5"],
    findings: [
      {
        source: S("2025-summer", "C2F", 3),
        asked: "Six-mark QWC on the extraction of aluminium, then complete the definition of electrolysis.",
        wentWrong: "Bauxite was confused with haematite; 'boiling point' was written for melting point; cryolite was said to lower the melting point of aluminium rather than of aluminium oxide; the carbon anodes reacting with oxygen to form carbon dioxide was left out; many did not attempt it. In the definition 'conducts' was found but 'decomposed' rarely.",
        fullMarkAnswersDid: "Told the story in order: bauxite purified to aluminium oxide, dissolved in molten cryolite to lower the melting point, ions move, aluminium forms at the cathode, oxygen at the anode, anodes burn away and are replaced.",
        rule: "Electrolysis: an ionic compound, molten or dissolved, conducts and is decomposed by the current.",
        misconceptions: ["sci.electrolysis.bauxite-haematite", "sci.electrolysis.cryolite-lowers-mp-of-aluminium", "sci.electrolysis.anode-carbon-dioxide-omitted", "sci.electrolysis.definition-decomposed-missing"],
      },
      {
        source: S("2025-summer", "C2H", 3),
        asked: "The same extraction QWC at Higher, define 'anode', and name the red-brown gas at the anode in another electrolysis.",
        wentWrong: "A good discriminator: many wrote that electrons move through the melt and carry the charge instead of ions; only about half could define anode; very few named bromine as the red-brown gas.",
        rule: "In the melt the charge is carried by ions; electrons move only in the wires and electrodes. Anode = positive electrode where negative ions lose electrons.",
        misconceptions: ["sci.electrolysis.electrons-carry-charge-in-melt", "sci.electrolysis.anode-label-or-sign", "sci.electrolysis.bromide-formed-at-anode"],
      },
    ],
    ruleToRemember: "Bauxite is purified to aluminium oxide, dissolved in molten cryolite (which lowers the melting point and saves energy); ions carry the charge; Al3+ + 3e- -> Al at the carbon cathode; oxide ions give oxygen at the carbon anodes, which burn to carbon dioxide and must be replaced. Recycling avoids all of that energy.",
    aStarSignal: "A QWC answer that names the ore, the solvent and why, the two half equations, the anode problem and the energy cost, in order and with capital letters and full stops.",
  },

  {
    id: "ins.science.c2.collision-theory-catalysts",
    topic: "science.c2.collision-theory-catalysts",
    specRefs: ["DA-C2-2.3.4", "DA-C2-2.3.5", "DA-C2-2.3.6"],
    findings: [
      {
        source: S("2025-summer", "C2H", 7),
        asked: "Explain the effect of lowering the temperature on the rate; name the catalyst for hydrogen peroxide and explain what it does.",
        wentWrong: "Explanations had to say the particles have less energy so there are fewer successful collisions (and, from now on, 'per unit time'); 'less collisions' earned nothing. A surprising number could not name manganese(IV) oxide, and many defined a catalyst instead of explaining its effect on the rate.",
        rule: "Fewer successful collisions per unit time; a catalyst speeds the reaction by lowering the activation energy.",
        misconceptions: ["sci.rates.less-collisions-wording", "sci.rates.mno2-not-recalled", "sci.rates.catalyst-defined-not-effect"],
      },
      {
        source: S("2023-summer", "C2H", 6),
        asked: "Preparation of oxygen from hydrogen peroxide: apparatus, equation, catalyst, test.",
        wentWrong: "Naming the apparatus and writing the equation were the hard parts; most named the catalyst here, but many said oxygen relights a lit splint rather than a glowing one.",
        rule: "Manganese(IV) oxide catalyses the decomposition; oxygen relights a glowing splint.",
        misconceptions: ["sci.practical.apparatus-names-unknown", "sci.gases.oxygen-test-lit-splint"],
      },
      {
        source: S("2023-summer", "C2F", 6),
        asked: "The same oxygen preparation at Foundation, with state symbols.",
        wentWrong: "Apparatus names and state symbols were very challenging; few identified the catalyst; the lit-splint error appeared again.",
        rule: "Learn the three gas tests as fixed phrases.",
        misconceptions: ["sci.rates.mno2-not-recalled", "sci.practical.apparatus-names-unknown", "sci.gases.oxygen-test-lit-splint"],
      },
      {
        source: S("2025-summer", "C2F", 7),
        asked: "Rate from data to three decimal places, order concentrations, sketch a lower-temperature curve, and pick the metals used as catalysts.",
        wentWrong: "The calculation was right but the three-decimal-place instruction was ignored; the rest went well.",
        rule: "The decimal-place instruction is a mark.",
        misconceptions: ["sci.quant.decimal-places-instruction"],
      },
    ],
    ruleToRemember: "Rate is about collisions: higher temperature (more energy, more frequent and more successful collisions per unit time), higher concentration or pressure and larger surface area (more frequent collisions). A catalyst lowers the activation energy so more collisions succeed, and is not used up; manganese(IV) oxide is the one for hydrogen peroxide.",
    aStarSignal: "Explaining a change in rate with energy AND frequency of successful collisions per unit time, and describing a catalyst's effect on the reaction rather than reciting its definition.",
  },

  {
    id: "ins.science.c2.measuring-rates",
    topic: "science.c2.measuring-rates",
    specRefs: ["DA-C2-2.3.1", "DA-C2-2.3.2", "DA-C2-2.3.3", "DA-PRAC-C4"],
    findings: [
      {
        source: S("2025-summer", "U7BChemH", 2),
        asked: "Plot gas volume against time for marble chips in acid, read the total volume and the finishing time, sketch the curve for powder, draw the apparatus.",
        wentWrong: "The x-axis label was the commonest omission; a sizeable number added up every volume in the table instead of reading the plateau; the powder sketch was fine; apparatus drawings were good but must be two-dimensional cross-sections - a line across the end of a tube or a stopper counts as a blockage.",
        fullMarkAnswersDid: "Labelled both axes with units, drew a line of best fit, read the flat part of the curve, and drew an open path from flask to gas syringe.",
        rule: "The total volume is where the curve levels off; the reaction ends where it goes flat.",
        misconceptions: ["sci.practical.axis-unit-omitted", "sci.rates.total-volume-summed", "sci.practical.3d-or-blocked-apparatus-diagram"],
      },
      {
        source: S("2025-summer", "C2H", 7),
        asked: "Rate of the fastest reaction from data (three decimal places), then sketch the curve for half the acid concentration.",
        wentWrong: "Rates were right but not to three decimal places, and some calculated all four; the half-concentration sketch usually scored two of three because it did not level off at the same final mass (4 g).",
        rule: "Same amount of the limiting reactant means the same final value; lower concentration means a shallower curve.",
        misconceptions: ["sci.rates.sketch-wrong-endpoint", "sci.quant.decimal-places-instruction"],
      },
      {
        source: S("2023-summer", "C2F", 7),
        asked: "Apparatus for measuring a rate, then describe how the rate was measured.",
        wentWrong: "Few named the apparatus; 'amount' written instead of mass or grams lost the marks for the method.",
        rule: "Say what you measure (mass in grams, volume in cm3) and in what time.",
        misconceptions: ["sci.rates.amount-instead-of-mass", "sci.practical.apparatus-names-unknown"],
      },
    ],
    ruleToRemember: "Rate = change in mass or volume divided by time, with units. On a graph the steeper the start the faster the reaction; the curve goes flat when a reactant runs out, at the same final value if the same amount of that reactant is used. Read totals from the plateau, label both axes, and draw apparatus in 2-D with open tubes.",
    aStarSignal: "Sketching the curve for a changed condition with the right start gradient AND the right end point, and justifying both.",
  },

  // ------------------------------------------------------------------ Physics P1
  {
    id: "ins.science.p1.kinetic-and-potential-energy",
    topic: "science.p1.kinetic-and-potential-energy",
    specRefs: ["DA-P1-1.4.17", "DA-P1-1.4.18", "DA-P1-1.4.19"],
    findings: [
      {
        source: S("2025-summer", "P1F", 5),
        asked: "Calculate the kinetic energy of a moving object.",
        wentWrong: "A surprising number could not write the formula at all; only the most able reached 180 with the unit J.",
        rule: "KE = 1/2 m v^2 - no formula, no marks.",
        misconceptions: ["sci.energy.ke-formula-not-recalled", "sci.physics.wrong-equation-zero-marks"],
      },
      {
        source: S("2025-summer", "P1H", 8),
        asked: "Kinetic energy, then the height a ball was dropped from using its potential energy.",
        wentWrong: "The KE parts were well answered but full of arithmetic slips, most often a mass left in grams; the height calculation used the wrong value for the potential energy.",
        rule: "Mass in kg, then GPE = mgh with the energy value the question actually gives.",
        misconceptions: ["sci.energy.mass-not-in-kg", "sci.energy.gpe-formula-or-g-omitted"],
      },
      {
        source: S("2026-march", "P1H", 8),
        asked: "Kinetic energy at the bottom of a fall when the object already had 10 J at the top, to one decimal place.",
        wentWrong: "100 J was found, but a large number forgot to add the initial 10 J (or subtracted it), and a significant minority ignored the one-decimal-place instruction.",
        rule: "Total energy at the bottom = energy at the top + energy gained; then obey the rounding instruction.",
        misconceptions: ["sci.energy.initial-energy-not-added", "sci.physics.decimal-places-instruction"],
      },
      {
        source: S("2024-summer", "P1H", 9),
        asked: "Maximum height of a golf ball from its energy, then its speed on hitting the ground.",
        wentWrong: "A significant minority left g out of the potential-energy formula; for the speed, the total energy at the top was not carried into the kinetic-energy step, so the wrong value was used.",
        rule: "GPE = m x g x h with g = 10 N/kg; energy is conserved, so use the total.",
        misconceptions: ["sci.energy.gpe-formula-or-g-omitted", "sci.energy.total-energy-not-carried"],
      },
    ],
    ruleToRemember: "KE = 1/2 m v^2 and GPE = m g h, with mass in kg, speed in m/s and g = 10 N/kg. Write the equation, convert units, substitute, answer with J. Energy is conserved: KE gained = GPE lost, plus whatever energy the object started with.",
    aStarSignal: "Chaining GPE to KE to speed (or height) in one clean line with the initial energy included and the answer rounded as instructed.",
  },

  {
    id: "ins.science.p1.work-and-power",
    topic: "science.p1.work-and-power",
    specRefs: ["DA-P1-1.4.13", "DA-P1-1.4.14", "DA-P1-1.4.15", "DA-P1-1.4.16", "DA-PRAC-P4"],
    findings: [
      {
        source: S("2025-summer", "P1F", 9),
        asked: "Work done pulling a box, define power, then find a time from power and work.",
        wentWrong: "Only a minority recalled work = force x distance; the definition of power was explained as energy, force or strength; the time calculation went better.",
        rule: "Power is the rate of doing work - work done (or energy transferred) per second.",
        misconceptions: ["sci.energy.power-defined-as-energy-or-force"],
      },
      {
        source: S("2025-summer", "P1H", 4),
        asked: "The same box-up-a-slope question at Higher.",
        wentWrong: "Work done was right (500 J), but the power definition was the hardest part of the whole paper: candidates knew it involved energy or work and time but did not link them as a rate.",
        rule: "Definition = work done divided by time taken; say 'per second' or 'rate'.",
        misconceptions: ["sci.energy.power-defined-as-energy-or-force"],
      },
      {
        source: S("2024-summer", "P1H", 6),
        asked: "Work done by a forklift lifting a load, then the time taken at a given power.",
        wentWrong: "The method was known but many kept the distance in centimetres and lost two of the four marks.",
        rule: "Distance in metres before you multiply.",
        misconceptions: ["sci.physics.length-not-in-metres"],
      },
    ],
    ruleToRemember: "Work done = force x distance moved in the direction of the force (J, with distance in m). Power = work done (or energy transferred) divided by time - the rate of doing work, in watts. Definitions need the 'per unit time' idea, not just the words energy and time.",
    aStarSignal: "Defining power as a rate in one sentence and using P = W/t to find a time, with units converted first.",
  },

  {
    id: "ins.science.p1.nuclear-fusion",
    topic: "science.p1.nuclear-fusion",
    specRefs: ["DA-P1-1.5.20", "DA-P1-1.5.21", "DA-P1-1.5.22", "DA-P1-1.5.23"],
    findings: [
      {
        source: S("2025-summer", "P1F", 8),
        asked: "Six-mark QWC describing nuclear fusion.",
        wentWrong: "Very few scored more than two: fusion was confused with fission; 'atoms' were said to join rather than nuclei; that it happens naturally in the Sun and stars was sometimes recalled; the main by-product (helium) was rarely given, with 'energy' the usual wrong answer.",
        rule: "Two light nuclei join to make a heavier nucleus (helium) and release energy.",
        misconceptions: ["sci.nuclear.fusion-fission-confused", "sci.nuclear.atoms-instead-of-nuclei", "sci.nuclear.energy-given-as-by-product"],
      },
      {
        source: S("2025-summer", "P1H", 3),
        asked: "The same fusion QWC at Higher.",
        wentWrong: "Most found it hard: what happens to the nuclei was not explained, the release of energy was left out, and energy was again offered as the by-product.",
        rule: "Say nuclei, say join, say energy released, say helium.",
        misconceptions: ["sci.nuclear.energy-release-omitted", "sci.nuclear.energy-given-as-by-product", "sci.nuclear.atoms-instead-of-nuclei"],
      },
    ],
    ruleToRemember: "Fusion: two light (hydrogen) nuclei join at very high temperature and pressure to form a heavier helium nucleus, releasing a large amount of energy; it powers the Sun and stars, and it is hard to achieve on Earth. Fission is the splitting of a heavy nucleus - the opposite.",
    aStarSignal: "A fusion QWC that contrasts it with fission, names the conditions, the product and the energy, and mentions why it is not yet a practical power source.",
  },

  {
    id: "ins.science.p1.moments",
    topic: "science.p1.moments",
    specRefs: ["DA-P1-1.2.17", "DA-P1-1.2.18", "DA-P1-1.2.19", "DA-PRAC-P3"],
    findings: [
      {
        source: S("2023-summer", "P1H", 8),
        asked: "State the Principle of Moments, then apply it to a beam.",
        wentWrong: "Only the most able stated the principle fully - 'about the pivot' was usually missing; in the calculation the distances printed on the diagram were used directly instead of the distances from the pivot.",
        rule: "Every distance in a moment is measured from the pivot; work it out if the diagram gives something else.",
        misconceptions: ["sci.moments.principle-incomplete-statement", "sci.moments.distance-not-from-pivot"],
      },
      {
        source: S("2025-summer", "U7BPhysH", 4),
        asked: "State the Principle of Moments, find the size and direction of the force on a supported beam, then an unknown distance.",
        wentWrong: "Poorly attempted by most: statements omitted 'about a point' and 'when in equilibrium'; the support force came out as 5 by subtracting the two loads instead of adding them, with 'clockwise' given as its direction; finding the distance by moments was the strongest differentiator on the paper.",
        fullMarkAnswersDid: "Wrote the full statement, added the downward forces for the upward reaction, and set clockwise moments equal to anticlockwise moments with the unknown distance as the only unknown.",
        rule: "Reaction = sum of the downward forces; then one moments equation about the pivot.",
        misconceptions: ["sci.moments.principle-incomplete-statement", "sci.moments.forces-subtracted-not-added", "sci.moments.direction-unknown"],
      },
      {
        source: S("2025-summer", "U7BPhysF", 1),
        asked: "Direction and unit of a moment, then the distance needed to balance a beam.",
        wentWrong: "The direction and especially the unit were very poorly answered; the balancing distance (10 cm) was often right.",
        rule: "Unit: newton metre (N m) - not N/m; direction: clockwise or anticlockwise.",
        misconceptions: ["sci.moments.unit-given-as-n-per-m", "sci.moments.direction-unknown"],
      },
      {
        source: S("2026-march", "P1H", 4),
        asked: "Formula and unit for the moment of a force, then a Principle of Moments calculation.",
        wentWrong: "The formula was known but the unit was often N/m or N/cm; the calculation, historically a weak area, was pleasingly well done at Higher (and still hard at Foundation).",
        rule: "Moment = force x perpendicular distance from the pivot, in N m.",
        misconceptions: ["sci.moments.unit-given-as-n-per-m"],
      },
    ],
    ruleToRemember: "Moment = force x perpendicular distance from the pivot, unit N m, direction clockwise or anticlockwise. Principle of Moments: when an object is in equilibrium, the sum of the clockwise moments about a point equals the sum of the anticlockwise moments about the same point. The support force equals the total downward force.",
    aStarSignal: "Finding an unknown distance or force with one moments equation about a well-chosen point, and a word-perfect principle with 'about a point' and 'in equilibrium'.",
  },

  {
    id: "ins.science.p1.centre-of-gravity-stability",
    topic: "science.p1.centre-of-gravity-stability",
    specRefs: ["DA-P1-1.2.20", "DA-P1-1.2.21", "DA-P1-1.2.22", "DA-P1-1.2.23"],
    findings: [
      {
        source: S("2024-summer", "P1H", 5),
        asked: "Define centre of gravity, mark it on an object, then say which object is least stable and why.",
        wentWrong: "Most gave the definition but some described the weight 'acting' confusingly; the least stable object was identified, but the explanation had to be about the height of the centre of gravity and often was not.",
        rule: "Stability = height of the centre of gravity and width of the base.",
        misconceptions: ["sci.cog.definition-gravity-not-weight", "sci.stability.reason-area-not-base-width-cog"],
      },
      {
        source: S("2025-summer", "U7BPhysH", 4),
        asked: "Define centre of gravity.",
        wentWrong: "Not well answered: few said the weight 'acts' there; 'gravity' was written where 'weight' was needed; some answered about balance or stability instead.",
        rule: "The point at which all the weight of the object appears to act.",
        misconceptions: ["sci.cog.definition-gravity-not-weight"],
      },
      {
        source: S("2025-summer", "U7BPhysF", 1),
        asked: "Choose the most stable position of a beam and give the reason; mark its centre of gravity.",
        wentWrong: "The position and the centre of gravity were found, but the reason was commonly 'more area' or 'surface area' rather than a lower centre of gravity or wider base.",
        rule: "Never 'area': say lower centre of gravity or wider base.",
        misconceptions: ["sci.stability.reason-area-not-base-width-cog"],
      },
      {
        source: S("2023-summer", "P1F", 5),
        asked: "Mark the centre of gravity of a ring.",
        wentWrong: "A significant number could not place it, because it lies in the empty space at the centre.",
        rule: "The centre of gravity can be outside the material of the object.",
        misconceptions: ["sci.cog.ring-centre"],
      },
    ],
    ruleToRemember: "The centre of gravity is the point where all the weight of an object appears to act (say weight, not gravity); for a uniform object it is at the geometric centre, even if that is empty space. An object is more stable with a low centre of gravity and a wide base, and topples when the vertical line through its centre of gravity falls outside the base.",
    aStarSignal: "Explaining toppling with the line of action of the weight and the edge of the base, not with 'area'.",
  },

  // ------------------------------------------------------------------ Physics P2
  {
    id: "ins.science.p2.lens-ray-diagrams",
    topic: "science.p2.lens-ray-diagrams",
    specRefs: ["DA-P2-2.2.9", "DA-P2-2.2.10", "DA-P2-2.2.11"],
    findings: [
      {
        source: S("2023-summer", "P2F", 8),
        asked: "Identify a lens, complete a ray diagram, describe the image.",
        wentWrong: "The lens was recognised, but the ray diagram was poorly done - many did not know the rules; image descriptions contradicted themselves (real and virtual, upright and inverted).",
        rule: "Two rules: parallel ray passes through F; ray through the centre goes straight on. Choose one word from each pair.",
        misconceptions: ["sci.lens.ray-rules-unknown", "sci.lens.contradictory-image-properties"],
      },
      {
        source: S("2023-summer", "P2H", 3),
        asked: "The same diagram at Higher, to scale.",
        wentWrong: "The rules were known, but marks went on the image not being 6 cm from the optical centre and 2 cm tall, and on contradictory descriptions again.",
        rule: "The image is where the rays cross - measure its position and size from the grid.",
        misconceptions: ["sci.lens.image-position-size-inaccurate", "sci.lens.contradictory-image-properties"],
      },
      {
        source: S("2024-summer", "P2F", 2),
        asked: "A mirror ray diagram, then converging and diverging lenses and a scaffolded lens diagram.",
        wentWrong: "Arrows were left off rays; a significant minority swapped converging and diverging; the scaffolding made the lens diagram go much better than in earlier series.",
        rule: "Every ray has an arrow; converging lens is fatter in the middle and brings rays together.",
        misconceptions: ["sci.lens.arrows-omitted", "sci.lens.converging-diverging-swapped"],
      },
      {
        source: S("2025-summer", "P2F", 3),
        asked: "How to find the focal length of a converging lens, then a ray diagram.",
        wentWrong: "Most got at least one of the three steps for the focal length; a significant minority could not draw any correct ray, and only a small minority placed the image correctly.",
        rule: "Distant object, screen, move until sharp, measure lens to screen; then draw the two standard rays.",
        misconceptions: ["sci.lens.ray-rules-unknown", "sci.lens.image-position-size-inaccurate"],
      },
      {
        source: S("2025-summer", "P2H", 7),
        asked: "Draw the ray diagram and describe the image.",
        wentWrong: "Well drawn by many, but marks went on missing direction arrows and on not knowing where to label the focal point; almost everyone knew the image was real.",
        rule: "Label F on the axis at the focal length on both sides; arrows on every ray.",
        misconceptions: ["sci.lens.arrows-omitted", "sci.lens.focal-point-not-labelled"],
      },
      {
        source: S("2024-summer", "U7BPhysH", 2),
        asked: "Complete a definition of focal length, then say how the real image would be viewed.",
        wentWrong: "The ray diagram was attempted well but the definition's key term was missing; only a small minority realised a screen is needed to see a real image, although many knew it was inverted.",
        rule: "A real image forms where rays actually meet and can be caught on a screen; a virtual image cannot.",
        misconceptions: ["sci.lens.real-image-needs-screen"],
      },
    ],
    ruleToRemember: "Two rays fix the image: the ray parallel to the axis refracts through F, the ray through the optical centre is undeviated; draw arrows on both, label F on both sides, and draw the image where they cross. Object beyond F: real, inverted, on a screen (camera, projector). Object inside F: virtual, upright, magnified (magnifying glass). Read position and size off the grid.",
    aStarSignal: "Drawing to scale, stating the image's position and height from the diagram, and choosing consistent words for nature, orientation and size.",
  },

  {
    id: "ins.science.p2.ohms-law-filament-lamp",
    topic: "science.p2.ohms-law-filament-lamp",
    specRefs: ["DA-P2-2.3.8", "DA-P2-2.3.9", "DA-PRAC-P6"],
    findings: [
      {
        source: S("2023-summer", "U7BPhysH", 4),
        asked: "Complete the circuit for a lamp's voltage-current graph, plot the graph, describe what it shows.",
        wentWrong: "Few got all three circuit marks: the voltmeter must go in parallel with the lamp and a variable resistor in the gap to give a range of readings; careless variable-resistor symbols lost the mark. Graphs were good apart from axis labels, poor scales by the least able, and ruler lines between points instead of a curve. Descriptions talked only of current rising with voltage and ignored the resistance.",
        fullMarkAnswersDid: "Drew the voltmeter across the lamp, the variable resistor in series, a smooth curve, and said the resistance increases as the current rises.",
        rule: "The story of the graph is about resistance, not just current.",
        misconceptions: ["sci.circuits.voltmeter-in-series", "sci.circuits.variable-resistor-symbol", "sci.practical.points-joined-not-best-fit", "sci.circuits.graph-described-as-current-only"],
      },
      {
        source: S("2025-summer", "P2H", 9),
        asked: "Circuit symbols, complete a filament-lamp characteristic, explain why it curves.",
        wentWrong: "Lamp, ammeter and voltmeter symbols were fine but a switch or a fixed resistor was drawn for the variable resistor; label, unit and origin marks were earned; only the most able understood the curve - even those who said the resistance rises could not say why, and the best answers linked it to temperature and more collisions.",
        rule: "The filament heats up, its ions vibrate more, electrons collide more often, resistance rises, so the current rises less for each extra volt.",
        misconceptions: ["sci.circuits.variable-resistor-symbol", "sci.circuits.filament-curve-reason"],
      },
      {
        source: S("2023-summer", "P2H", 6),
        asked: "Ohm's law calculation with a current given in milliamps.",
        wentWrong: "The method was fine but weaker candidates did not convert 600 mA to 0.6 A.",
        rule: "mA to A: divide by 1000 before substituting.",
        misconceptions: ["sci.circuits.milliamps-not-converted"],
      },
      {
        source: S("2025-summer", "P2H", 3),
        asked: "Electrical power over ten minutes, then an Ohm's law calculation in milliamps.",
        wentWrong: "The power formula was recalled but minutes were not converted to seconds; Ohm's law was known but the milliamp conversion was again missed by a significant minority.",
        rule: "Seconds and amps: convert first, then substitute.",
        misconceptions: ["sci.circuits.milliamps-not-converted", "sci.physics.time-not-in-seconds"],
      },
      {
        source: S("2024-summer", "U7BPhysH", 3),
        asked: "Add a voltmeter to a circuit, plot the graph, calculate resistance, state how it changed.",
        wentWrong: "The symbol was known but the voltmeter was often placed in series; a few used a non-linear scale; R = V/I scored for those who recalled it; nearly all saw the resistance increasing.",
        rule: "Voltmeter in parallel across the component; a linear scale on each axis.",
        misconceptions: ["sci.circuits.voltmeter-in-series", "sci.practical.scale-inappropriate"],
      },
    ],
    ruleToRemember: "V = I R with I in amps (divide mA by 1000). Ammeter in series, voltmeter in parallel across the component, variable resistor to change the current. A metal wire at constant temperature obeys Ohm's law (straight line through the origin); a filament lamp's graph curves because the filament gets hotter, electrons collide more often with the vibrating ions, and the resistance rises.",
    aStarSignal: "Explaining the curve with temperature, collisions and resistance in one causal chain, and drawing the practical circuit correctly without a scaffold.",
  },

  // ------------------------------------------------------------------ Unit 7 practical skills
  {
    id: "ins.science.u7.planning",
    topic: "science.u7.planning",
    specRefs: ["DA-U7-plan-1", "DA-U7-plan-4", "DA-U7-plan-5", "DA-U7-plan-7"],
    findings: [
      {
        source: S("2024-summer", "U7BChemH", 2),
        asked: "Draw the apparatus for a distillation, name the round-bottom flask and condenser, explain the water flow and the thermometer position.",
        wentWrong: "Diagrams were very poor: two different diagrams offered, sealed-off funnels, apparatus that could not work, no labels; the flask and condenser were unfamiliar and the reasons for the water flow and thermometer position were rarely right - the practical had clearly not been seen.",
        rule: "Know the standard apparatus by name and by drawing before the exam; a diagram must work.",
        misconceptions: ["sci.practical.3d-or-blocked-apparatus-diagram", "sci.practical.apparatus-names-unknown"],
      },
      {
        source: S("2025-summer", "U7BChemH", 2),
        asked: "Draw the assembled apparatus for collecting gas from marble chips and acid.",
        wentWrong: "Generally good, but examiners want a two-dimensional cross-section with a clear path for gas: a line drawn across the end of a tube or a stopper counts as a blockage, and each piece must be recognisable.",
        rule: "2-D, open paths, every piece recognisable and labelled.",
        misconceptions: ["sci.practical.3d-or-blocked-apparatus-diagram"],
      },
      {
        source: S("2024-summer", "U7BPhysH", 4),
        asked: "Identify the variables in a spring investigation, then use F = ke.",
        wentWrong: "Variables were mostly right, but the dependent variable had to be the compressed length specifically; the unit of the spring constant was not well known.",
        rule: "Name the variable exactly as it is measured in this experiment; k is in N/m (or N/cm).",
        misconceptions: ["sci.practical.control-vs-independent", "sci.hooke.spring-constant-formula"],
      },
      {
        source: S("2025-summer", "U7BPhysH", 1),
        asked: "Plan how to find the density of an irregular solid, give a precaution and its reason, state the density equation.",
        wentWrong: "Many measured 'length, breadth and height' with a ruler, missing the word irregular; precautions were fine but 'to improve accuracy' was the common wrong reason; a significant minority wrote density = mass x volume.",
        rule: "Irregular solid: mass on a balance, volume by displacement; density = mass / volume.",
        misconceptions: ["sci.density.formula-or-method", "sci.practical.reliability-accuracy-confused"],
      },
      {
        source: S("2025-summer", "U7BBioH", 1),
        asked: "Six-mark QWC on estimating plant abundance in a habitat.",
        wentWrong: "Most earned four or more, but few said they would use a key to identify the species and a few could not name the quadrat.",
        rule: "Quadrat, random placement, key to identify, count, repeat and average, scale up.",
        misconceptions: ["sci.practical.quadrat-and-key-not-named"],
      },
      {
        source: S("2025-summer", "C1H", 1),
        asked: "Safety precautions when reacting sodium with water.",
        wentWrong: "Well known, but a 'glass screen' is not accepted for a safety screen.",
        rule: "Safety = the specific hazard and the specific named control.",
        misconceptions: ["sci.practical.safety-vague"],
      },
    ],
    ruleToRemember: "A plan names the independent, dependent and control variables in the experiment's own terms, chooses apparatus by name, draws it as a labelled 2-D cross-section with open paths, states a specific hazard and control, and says what will be measured, how, and how many times. Repeating improves reliability, not accuracy.",
    aStarSignal: "A plan that a stranger could follow: named apparatus, a working diagram, exact variables, a results table with units, and a precaution with its reason.",
  },

  {
    id: "ins.science.u7.analysing",
    topic: "science.u7.analysing",
    specRefs: ["DA-U7-analyse-1", "DA-U7-analyse-2", "DA-U7-analyse-3", "DA-U7-analyse-4", "DA-U7-analyse-6"],
    findings: [
      {
        source: S("2025-summer", "U7BChemH", 2),
        asked: "Plot a volume-time graph and read the total volume of gas from it.",
        wentWrong: "The x-axis label was the usual lost mark; many read the total by adding every value in the table instead of from the flat part of the curve.",
        rule: "Both axes labelled with quantity and unit; totals come from the plateau.",
        misconceptions: ["sci.practical.axis-unit-omitted", "sci.rates.total-volume-summed"],
      },
      {
        source: S("2024-summer", "U7BPhysH", 2),
        asked: "Calculate an average from repeated readings, one of which is anomalous.",
        wentWrong: "A substantial number included the anomalous reading in the average and lost both marks.",
        rule: "Circle the anomaly, leave it out, then average.",
        misconceptions: ["sci.practical.anomaly-included-in-average"],
      },
      {
        source: S("2024-summer", "U7BPhysH", 3),
        asked: "Plot a graph from circuit readings.",
        wentWrong: "Well plotted, but a small minority chose a non-linear scale.",
        rule: "Equal distances on an axis mean equal steps in the quantity.",
        misconceptions: ["sci.practical.scale-inappropriate"],
      },
      {
        source: S("2023-summer", "U7BPhysH", 4),
        asked: "Plot a current-voltage graph for a lamp.",
        wentWrong: "Axis labels were missed by a few, unsuitable scales by the least able, and some ruled straight lines from point to point instead of drawing a curve.",
        rule: "Best-fit line or smooth curve - never dot-to-dot.",
        misconceptions: ["sci.practical.points-joined-not-best-fit", "sci.practical.scale-inappropriate", "sci.practical.axis-unit-omitted"],
      },
      {
        source: S("2025-summer", "U7BBioF", 1),
        asked: "Measure a cell and its nucleus, give their ratio, name microscope parts, calculate a magnification.",
        wentWrong: "Measuring was fine but many gave the ratio the wrong way round; coverslip, slide and eyepiece lens were rarely named; the magnification of 100 divided by 10 was often done as 100 minus 10.",
        rule: "Ratio in the order the question states; total magnification = eyepiece x objective.",
        misconceptions: ["sci.practical.ratio-inverted", "sci.practical.magnification-subtracted", "sci.practical.apparatus-names-unknown"],
      },
      {
        source: S("2025-summer", "U7BPhysH", 3),
        asked: "Plot resistance against length of wire, find the gradient and its unit.",
        wentWrong: "The graph was excellent apart from the odd missing label or unit; the gradient was calculated, but its unit defeated a surprising number.",
        rule: "Gradient unit = y-axis unit per x-axis unit (ohms per cm).",
        misconceptions: ["sci.practical.gradient-unit", "sci.practical.axis-unit-omitted"],
      },
    ],
    ruleToRemember: "Label both axes with quantity and unit (matching the table headings), choose linear scales that use most of the grid, plot accurately, then draw a straight line or smooth curve of best fit - never join the dots. Spot and exclude anomalies before averaging, read values from the line, give ratios in the order asked, and give a gradient its unit.",
    aStarSignal: "A graph that needs no correction, an anomaly handled and explained, and a gradient with its unit and physical meaning.",
  },

  {
    id: "ins.science.u7.conclusions",
    topic: "science.u7.conclusions",
    specRefs: ["DA-U7-conclude-1", "DA-U7-conclude-2", "DA-U7-conclude-5", "DA-U7-conclude-7"],
    findings: [
      {
        source: S("2025-summer", "U7BPhysH", 2),
        asked: "Why readings were repeated and averaged.",
        wentWrong: "Most said reliability, but some went on to claim accuracy as well, and a significant number did not know the difference between the two.",
        rule: "Repeats and averages improve reliability; accuracy is about closeness to the true value (better instruments, technique).",
        misconceptions: ["sci.practical.reliability-accuracy-confused"],
      },
      {
        source: S("2024-summer", "U7BPhysH", 1),
        asked: "Six-mark QWC on pressure, then choose and justify the situation with the greatest pressure.",
        wentWrong: "The QWC scored well but the unit of pressure was not recalled; the right situation was chosen, but writing 'surface area' instead of area forfeited the reason mark for most.",
        rule: "Pressure = force / area in N/m2 (pascals); say 'area', not 'surface area'.",
        misconceptions: ["sci.pressure.surface-area-wording"],
      },
      {
        source: S("2025-summer", "U7BBioH", 3),
        asked: "Draw conclusions from antibiotic clear zones.",
        wentWrong: "Conclusions lacked their evidence: the most effective antibiotic needed 'largest clear zone' and 'killed most bacteria'; a statement that one antibiotic was ineffective against both strains was missed; MRSA answers came from general knowledge, not the diagram.",
        rule: "Conclusion + evidence from the results, with comparative words.",
        misconceptions: ["sci.comparison.no-comparative-language", "sci.graph.trend-not-from-data"],
      },
      {
        source: S("2024-summer", "U7BBioH", 4),
        asked: "Identify which factor changed from potometer data and justify it.",
        wentWrong: "The factor was found by the more able, but even fewer quoted the data that showed it or linked it to the rate of transpiration.",
        rule: "Name the factor, quote the numbers, state the effect.",
        misconceptions: ["sci.graph.trend-not-from-data"],
      },
      {
        source: S("2025-summer", "U7BPhysH", 3),
        asked: "Use the gradient of a resistance-length graph.",
        wentWrong: "The gradient was right but its unit was often wrong - so what it means (ohms per centimetre of wire) was not understood.",
        rule: "A gradient's unit tells you what the gradient measures.",
        misconceptions: ["sci.practical.gradient-unit"],
      },
    ],
    ruleToRemember: "A conclusion states the relationship in the data's own words (as x increases, y ...; 'directly proportional' only for a straight line through the origin), quotes values as evidence, uses comparative language, and says what the gradient or intercept means with its unit. Evaluation: repeats give reliability, better instruments and technique give accuracy, an anomaly is excluded and explained.",
    aStarSignal: "Quoting two numbers from the results to support every claim, and using reliability, accuracy and proportional in their exact senses.",
  },
];

const cited = new Set(insights.flatMap((i) => i.findings.flatMap((f) => f.misconceptions ?? [])));
export const misconceptions = vocabulary.filter((m) => cited.has(m.id) || (m.extraSources ?? []).length > 0);
export const uncitedMisconceptions = vocabulary.filter((m) => !cited.has(m.id) && !(m.extraSources ?? []).length);

export default { subject: "science", misconceptions, insights };
