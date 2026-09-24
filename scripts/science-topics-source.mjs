/**
 * science-topics-source.mjs
 *
 * Hand-authored teachable-topic layer for CCEA GCSE Double Award Science (2017).
 * Consumed by scripts/build-science-topics.mjs, which derives tier / section /
 * discipline / keyEquations from data/spec/double-award-science.json and writes
 * data/spec/double-award-science-topics.json.
 *
 * Conventions
 *   - outcomeIds are the spec's own per-discipline ids ("1.2.3"); always read them
 *     together with `unit`.
 *   - practicals lists the prescribed practical(s) whose *home* is this topic
 *     (each of the 18 codes appears in exactly one topic).
 *   - difficulty 1-5: 5 = repeatedly worst-answered in Chief Examiner reports
 *     (docs/research/03-ccea-gcse-double-award-science-spec.md section 7).
 *   - examinerEvidence notes are paraphrased from that section; series/tier as
 *     reported there ("U7B" = Unit 7 Booklet B, "U7A" = Booklet A).
 *   - phet / video URLs come only from docs/research/05-science-learning-platforms.md.
 *   - bitesize: article URL built from the topic/article ids listed in 05 section 1.2
 *     using the pattern documented there (topics/<topic>/articles/<id>).
 */

const BB = 'https://www.bbc.co.uk/bitesize/topics/';
const bb = (topic, article) => `${BB}${topic}/articles/${article}`;

const PHET = (name, slug) => ({
  name,
  url: `https://phet.colorado.edu/sims/html/${slug}/latest/${slug}_en.html`,
});
export const PHET_SIMS = {
  forcesMotion: PHET('Forces and Motion: Basics', 'forces-and-motion-basics'),
  friction: PHET('Friction', 'friction'),
  projectile: PHET('Projectile Motion', 'projectile-motion'),
  balancingAct: PHET('Balancing Act', 'balancing-act'),
  hookesLaw: PHET("Hooke's Law", 'hookes-law'),
  massesSprings: PHET('Masses and Springs', 'masses-and-springs'),
  skatePark: PHET('Energy Skate Park: Basics', 'energy-skate-park-basics'),
  energyForms: PHET('Energy Forms and Changes', 'energy-forms-and-changes'),
  density: PHET('Density', 'density'),
  statesBasics: PHET('States of Matter: Basics', 'states-of-matter-basics'),
  states: PHET('States of Matter', 'states-of-matter'),
  gasProperties: PHET('Gas Properties', 'gas-properties'),
  buildNucleus: PHET('Build a Nucleus', 'build-a-nucleus'),
  rutherford: PHET('Rutherford Scattering', 'rutherford-scattering'),
  waveString: PHET('Wave on a String', 'wave-on-a-string'),
  wavesIntro: PHET('Waves Intro', 'waves-intro'),
  soundWaves: PHET('Sound Waves', 'sound-waves'),
  bendingLight: PHET('Bending Light', 'bending-light'),
  geometricOptics: PHET('Geometric Optics: Basics', 'geometric-optics-basics'),
  cckDc: PHET('Circuit Construction Kit: DC', 'circuit-construction-kit-dc'),
  cckDcLab: PHET('Circuit Construction Kit: DC — Virtual Lab', 'circuit-construction-kit-dc-virtual-lab'),
  ohmsLaw: PHET("Ohm's Law", 'ohms-law'),
  resistanceWire: PHET('Resistance in a Wire', 'resistance-in-a-wire'),
  magnets: PHET('Magnets and Electromagnets', 'magnets-and-electromagnets'),
  gravityOrbits: PHET('Gravity and Orbits', 'gravity-and-orbits'),
  buildAtom: PHET('Build an Atom', 'build-an-atom'),
  isotopes: PHET('Isotopes and Atomic Mass', 'isotopes-and-atomic-mass'),
  balancing: PHET('Balancing Chemical Equations', 'balancing-chemical-equations'),
  reactants: PHET('Reactants, Products and Leftovers', 'reactants-products-and-leftovers'),
  phScale: PHET('pH Scale: Basics', 'ph-scale-basics'),
  acidBase: PHET('Acid-Base Solutions', 'acid-base-solutions'),
  concentration: PHET('Concentration', 'concentration'),
  diffusion: PHET('Diffusion', 'diffusion'),
  membrane: PHET('Membrane Transport', 'membrane-transport'),
  naturalSelection: PHET('Natural Selection', 'natural-selection'),
  geneExpression: PHET('Gene Expression Essentials', 'gene-expression-essentials'),
  neuron: PHET('Neuron', 'neuron'),
  greenhouse: PHET('Greenhouse Effect', 'greenhouse-effect'),
};
const P = PHET_SIMS;

const VID = {
  nuclear: {
    channel: 'PhysicsRocksItsTrue',
    url: 'https://www.youtube.com/watch?v=3xix5IqWvOI',
    note: 'Nuclear Physics — CCEA GCSE Physics — Unit 1 (whole-topic lesson)',
  },
  chemChicken: {
    channel: 'Chemistry Chicken',
    url: 'https://www.youtube.com/playlist?list=PLFA6wuSQynqc-f-uMAdzLhPCK52ExPEMW',
    note: 'DA Chemistry Unit 1/Unit 2 specimen papers walked through (F and H) incl. reacting-mass calculations',
  },
  scienceShorts: {
    channel: 'Science Shorts',
    url: 'https://www.youtube.com/playlist?list=PLGvD8d3gDHUWJavCE5M5yxpSLK6DKv3Ra',
    note: 'Whole-paper CCEA summaries ("All of CCEA Biology Paper 1 in 25 min", Chemistry/Physics Paper 1, Biology/Physics Paper 2)',
  },
};

/** Unit-level resources (not tied to a single topic). */
export const unitResources = {
  hub: 'https://www.bbc.co.uk/bitesize/examspecs/zrjj92p',
  pastPapers: 'https://www.bbc.co.uk/bitesize/topics/zg4sg2p/articles/z8j8b7h',
  B1: { bitesize: [`${BB}zb778xs`, `${BB}z466qp3`, `${BB}z6rry9q`], video: [VID.scienceShorts] },
  B2: { bitesize: [`${BB}zdnnxyc`, `${BB}zhybf4j`, `${BB}z7vvpg8`, `${BB}z6rry9q`], video: [VID.scienceShorts] },
  C1: { bitesize: [`${BB}zfddcqt`, `${BB}z4tt7nb`], video: [VID.scienceShorts, VID.chemChicken] },
  C2: { bitesize: [`${BB}zb22d6f`, `${BB}z4tt7nb`], video: [VID.chemChicken] },
  P1: { bitesize: [`${BB}zjyyhbk`, `${BB}zmggf4j`, `${BB}zh99bdm`, `${BB}zn88rj6`, `${BB}zv778xs`, `${BB}z644382`], video: [VID.scienceShorts, VID.nuclear], sites: ['https://www.gcsephysicsonline.com/ccea'] },
  P2: { bitesize: [`${BB}zbmmwty`, `${BB}z4hh2sg`, `${BB}zknnxyc`, `${BB}zdfft39/articles/z2hnjfr`, `${BB}z7bbscw`, `${BB}z644382`], video: [VID.scienceShorts], sites: ['https://www.gcsephysicsonline.com/ccea'] },
  U7: { bitesize: [`${BB}zmbbscw`, `${BB}zrxxjhv/articles/zyyfjfr`, `${BB}zmrry9q/articles/z3yhqyc`], video: [VID.chemChicken] },
};

const ev = (series, unit, tier, note) => ({ series, unit, tier, note });

export const topics = [];

// ---------------------------------------------------------------------------
// B1 Cells, Living Processes and Biodiversity
// ---------------------------------------------------------------------------
topics.push(
  {
    slug: 'b1-cells-and-microscopy', unit: 'B1', title: 'Cells, microscopy and specialisation',
    outcomeIds: ['1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.1.5'], practicals: [], prerequisites: [], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'F', 'Cell wall confused with cell membrane; function of the vacuole not known.'),
      ev('Summer 2024', 'B1', 'F', 'Microscope part names not recalled.'),
      ev('Summer 2025', 'U7B', 'F', 'Cell:nucleus ratio reversed; coverslip/slide and eyepiece lens not named; magnification 100/10 done as a subtraction.'),
    ],
    mustRecall: [
      'Animal cell: nucleus (contains chromosomes), cytoplasm, cell membrane, nuclear membrane, mitochondria (site of cell respiration).',
      'Plant cells additionally have a cellulose cell wall, a large permanent vacuole and chloroplasts.',
      'Bacterial cells: non-cellulose cell wall, no nucleus, plasmids present.',
      'Cells -> tissues -> organs -> organ systems.',
      'Magnification = eyepiece lens x objective lens.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zf88rj6', 'z9wd3qt'),
    keywords: ['cell membrane', 'cell wall', 'nucleus', 'mitochondria', 'chloroplast', 'vacuole', 'plasmid', 'temporary slide', 'magnification', 'tissue', 'organ'],
  },
  {
    slug: 'b1-photosynthesis-equation-limiting-factors', unit: 'B1', title: 'Photosynthesis: equation and limiting factors',
    outcomeIds: ['1.2.1', '1.2.2', '1.2.4'], practicals: [], prerequisites: ['b1-cells-and-microscopy'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'H', 'Trend descriptions were not taken from the graph given; data on limiting factors must be quoted.'),
      ev('Summer 2025', 'B1', 'F', 'Graph values misread when interpreting rate data.'),
    ],
    mustRecall: [
      'Photosynthesis is endothermic and takes place in chloroplasts, where chlorophyll absorbs light energy.',
      'carbon dioxide + water -> glucose + oxygen (light, chlorophyll)',
      '6CO2 + 6H2O -> C6H12O6 + 6O2 (light, chlorophyll)',
      'Limiting factors: temperature, light intensity, carbon dioxide concentration.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zp44s82'),
    keywords: ['photosynthesis', 'chlorophyll', 'chloroplast', 'endothermic', 'limiting factor', 'light intensity', 'carbon dioxide concentration'],
  },
  {
    slug: 'b1-photosynthesis-investigations', unit: 'B1', title: 'Investigating photosynthesis (starch test, light, CO2, chlorophyll)',
    outcomeIds: ['1.2.3'], practicals: ['B1'], prerequisites: ['b1-photosynthesis-equation-limiting-factors', 'b1-food-tests'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Destarch a plant by leaving it in the dark for 48 hours.',
      'Starch test: boil leaf in water, boil in ethanol (removes chlorophyll), soften in water, add iodine solution: blue-black = starch present.',
      'Sodium hydroxide absorbs carbon dioxide; a variegated leaf shows that chlorophyll is needed.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zp44s82'),
    keywords: ['destarch', 'iodine', 'ethanol', 'variegated leaf', 'sodium hydroxide', 'Prescribed Practical B1'],
  },
  {
    slug: 'b1-leaf-structure-gas-exchange', unit: 'B1', title: 'Leaf structure, gas exchange and compensation point',
    outcomeIds: ['1.2.5', '1.2.6'], practicals: [], prerequisites: ['b1-photosynthesis-equation-limiting-factors', 'b1-aerobic-respiration'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'H', 'Hydrogencarbonate indicator colours mixed up with food-test colours.'),
      ev('March 2026', 'B1', 'F', 'Layer of the leaf where gas exchange occurs (spongy mesophyll) not identified.'),
    ],
    mustRecall: [
      'Hydrogencarbonate indicator: high CO2 yellow, normal CO2 red, low CO2 purple.',
      'Compensation point: rate of photosynthesis equals rate of respiration, so no net gas exchange.',
      'Leaf adaptations: transparent epidermis; waxy cuticle (waterproof); palisade mesophyll tightly packed with many chloroplasts; spongy mesophyll with air spaces for gas exchange; guard cells and stomata.',
    ],
    keyEquations: [], phet: [P.diffusion], video: [], bitesize: bb('zb778xs', 'zp44s82'),
    keywords: ['hydrogencarbonate indicator', 'compensation point', 'palisade mesophyll', 'spongy mesophyll', 'stomata', 'guard cells', 'waxy cuticle', 'epidermis'],
  },
  {
    slug: 'b1-food-tests', unit: 'B1', title: 'Food tests and reagent colour changes',
    outcomeIds: ['1.3.1', '1.3.2'], practicals: [], prerequisites: [], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', "Biuret confused with Benedict's; Benedict's test needs heating."),
      ev('Summer 2025', 'B1', 'H', 'Food-test colours confused with hydrogencarbonate indicator colours.'),
    ],
    mustRecall: [
      "Benedict's (reducing sugar, heat): blue -> brick red precipitate.",
      'Iodine solution (starch): yellow-brown -> blue-black.',
      'Biuret (protein): blue -> lilac/purple.',
      'Ethanol (fat): colourless -> white emulsion.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zc4kywx'),
    keywords: ["Benedict's", 'iodine', 'Biuret', 'ethanol emulsion', 'reducing sugar', 'starch', 'protein', 'fat'],
  },
  {
    slug: 'b1-biological-molecules-food-energy', unit: 'B1', title: 'Biological molecules and the energy content of food',
    outcomeIds: ['1.3.3'], practicals: ['B2'], prerequisites: ['b1-food-tests'], difficulty: 2,
    examinerEvidence: [
      ev('March 2026', 'B1', 'F', 'Components of fats after digestion (fatty acids and glycerol) not known.'),
    ],
    mustRecall: [
      'Carbohydrates: simple sugars (glucose, lactose) for energy; complex (cellulose, starch, glycogen) for structure and storage.',
      'Fats/lipids are made of fatty acids and glycerol; energy source and storage.',
      'Proteins are made of amino acids; structural and functional molecules.',
      'Energy in food (J) = mass of water (g) x 4.2 x temperature rise (deg C) when burning a food sample (Practical B2).',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zc4kywx'),
    keywords: ['carbohydrate', 'glucose', 'glycogen', 'cellulose', 'fatty acids', 'glycerol', 'amino acids', 'energy content', 'Prescribed Practical B2'],
  },
  {
    slug: 'b1-enzymes-and-digestion', unit: 'B1', title: 'Enzymes, the lock and key model and digestion',
    outcomeIds: ['1.4.1', '1.4.3'], practicals: [], prerequisites: ['b1-biological-molecules-food-energy'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'F', 'Terms enzyme / substrate / active site not used correctly.'),
    ],
    mustRecall: [
      'Enzymes are proteins that act as biological catalysts: they speed up reactions without being used up.',
      'Carbohydrase (amylase) digests starch, protease digests protein, lipase digests fat.',
      'Lock and key: the substrate fits the active site of the enzyme (substrate specificity).',
      'Digestion breaks large insoluble molecules into small soluble ones that can be absorbed into the blood; enzymes are used commercially in biological washing powders.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zx3cs82'),
    keywords: ['enzyme', 'catalyst', 'active site', 'substrate', 'lock and key', 'amylase', 'lipase', 'protease', 'digestion', 'biological washing powder'],
  },
  {
    slug: 'b1-enzyme-factors', unit: 'B1', title: 'Temperature, pH, concentration and inhibitors on enzyme action',
    outcomeIds: ['1.4.2'], practicals: ['B3'], prerequisites: ['b1-enzymes-and-digestion'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'U7A', 'F', 'Booklet A biology task was an enzyme/temperature timing investigation: results tables, timing and control variables matter.'),
    ],
    mustRecall: [
      'Low temperature: fewer collisions between enzyme and substrate, so slower rate.',
      'Optimum = maximum rate of reaction.',
      'Denaturation: irreversible change to the shape of the active site above the optimum (temperature or pH), so the substrate no longer fits.',
      'Inhibitors are molecules that fit the active site but are not broken down (Higher).',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zx3cs82'),
    keywords: ['optimum temperature', 'denaturation', 'pH', 'enzyme concentration', 'inhibitor', 'Prescribed Practical B3'],
  },
  {
    slug: 'b1-respiratory-surfaces-breathing', unit: 'B1', title: 'Respiratory surfaces and the effect of exercise on breathing',
    outcomeIds: ['1.5.1', '1.5.2'], practicals: [], prerequisites: ['b1-cells-and-microscopy'], difficulty: 2,
    examinerEvidence: [
      ev('March 2026', 'B1', 'F', 'Interpreting a breathing-rate graph was weak.'),
    ],
    mustRecall: [
      'Respiratory surfaces: large surface area, thin, moist, permeable, good blood supply, diffusion gradient maintained.',
      'Exercise increases both the depth and the rate of breathing.',
    ],
    keyEquations: [], phet: [P.diffusion], video: [], bitesize: bb('zb778xs', 'zdd746f'),
    keywords: ['respiratory surface', 'diffusion gradient', 'alveoli', 'breathing rate', 'breathing depth', 'exercise'],
  },
  {
    slug: 'b1-aerobic-respiration', unit: 'B1', title: 'Aerobic respiration and its equation',
    outcomeIds: ['1.5.3', '1.5.4'], practicals: [], prerequisites: ['b1-cells-and-microscopy'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'F', 'QWC on aerobic respiration: confusion over whether CO2 is produced or used; "produces energy" given instead of the uses of the energy released.'),
    ],
    mustRecall: [
      'Respiration is exothermic, takes place in mitochondria and releases energy continuously in all cells.',
      'Energy is used for heat, movement, growth, reproduction and active uptake/transport.',
      'glucose + oxygen -> energy + carbon dioxide + water',
      'C6H12O6 + 6O2 -> energy + 6CO2 + 6H2O',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zdd746f'),
    keywords: ['aerobic respiration', 'exothermic', 'mitochondria', 'glucose', 'energy release', 'active transport'],
  },
  {
    slug: 'b1-anaerobic-respiration', unit: 'B1', title: 'Anaerobic respiration in muscle and yeast',
    outcomeIds: ['1.5.5', '1.5.6'], practicals: [], prerequisites: ['b1-aerobic-respiration'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Mammalian muscle: glucose -> energy + lactic acid.',
      'Yeast: glucose -> energy + alcohol + carbon dioxide.',
      'Anaerobic respiration releases much less energy per glucose than aerobic.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'zdd746f'),
    keywords: ['anaerobic respiration', 'lactic acid', 'yeast', 'fermentation', 'alcohol', 'oxygen debt'],
  },
  {
    slug: 'b1-nervous-system-cns', unit: 'B1', title: 'Nervous and hormonal communication, CNS, voluntary and reflex actions',
    outcomeIds: ['1.6.1', '1.6.2', '1.6.3'], practicals: [], prerequisites: [], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Nervous: fast, short-lived, electrical impulses along neurones. Hormonal: slower, longer-lasting, chemical messengers in the blood.',
      'The central nervous system is the brain and spinal cord; it co-ordinates responses between receptors and effectors (muscles and glands).',
      'Reflex actions are rapid, automatic and not under conscious control; voluntary actions are consciously controlled.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'znhyxg8'),
    keywords: ['central nervous system', 'receptor', 'effector', 'voluntary action', 'reflex action', 'hormone', 'neurone'],
  },
  {
    slug: 'b1-reflex-arc', unit: 'B1', title: 'The spinal reflex arc',
    outcomeIds: ['1.6.4'], practicals: [], prerequisites: ['b1-nervous-system-cns'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Pathway: stimulus -> receptor -> sensory neurone -> association neurone (spinal cord) -> motor neurone -> effector (muscle or gland) -> response.',
      'Synapses are the gaps between neurones.',
    ],
    keyEquations: [], phet: [P.neuron], video: [], bitesize: bb('zb778xs', 'znhyxg8'),
    keywords: ['reflex arc', 'sensory neurone', 'association neurone', 'motor neurone', 'synapse', 'effector'],
  },
  {
    slug: 'b1-blood-glucose-diabetes', unit: 'B1', title: 'Homeostasis, insulin and diabetes',
    outcomeIds: ['1.6.5', '1.6.6', '1.6.7'], practicals: [], prerequisites: ['b1-nervous-system-cns', 'b1-aerobic-respiration'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Hormones confused: testosterone, auxin and ADH offered where another hormone was required.'),
    ],
    mustRecall: [
      'Homeostasis: maintaining a constant internal environment (limited to blood glucose and osmoregulation).',
      'Hormones are chemical messengers made by glands, carried in the blood to a target organ.',
      'Pancreas monitors blood glucose and releases insulin when it rises; insulin makes the liver absorb glucose and convert it to glycogen for storage.',
      'Type 1: pancreas stops producing insulin (early in life; insulin injections). Type 2: progressive, linked to lifestyle/obesity; pancreas produces less insulin; controlled by diet at first.',
      'Symptoms: high blood glucose, glucose in urine, lethargy, thirst. Long-term effects: eye damage, kidney failure, heart disease, strokes.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'znhyxg8'),
    keywords: ['homeostasis', 'insulin', 'glycogen', 'pancreas', 'liver', 'Type 1 diabetes', 'Type 2 diabetes', 'blood glucose'],
  },
  {
    slug: 'b1-kidney-osmoregulation', unit: 'B1', title: 'The excretory system, osmoregulation and ADH',
    outcomeIds: ['1.6.8', '1.6.9', '1.6.10'], practicals: [], prerequisites: ['b1-blood-glucose-diabetes'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'F', 'Bladder given where the kidney was required.'),
    ],
    mustRecall: [
      'Excretory system: kidney (renal artery, renal vein, cortex, medulla, pelvis), ureters, bladder, urethra.',
      'Water gained from food, drink and respiration; lost in sweat, breath and urine.',
      'The kidney filters the blood and controls reabsorption of water.',
      'ADH causes the kidney to reabsorb more water, so less urine is produced (Higher).',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'znhyxg8'),
    keywords: ['kidney', 'renal artery', 'renal vein', 'cortex', 'medulla', 'ureter', 'bladder', 'urethra', 'osmoregulation', 'ADH'],
  },
  {
    slug: 'b1-plant-hormones-phototropism', unit: 'B1', title: 'Plant hormones and phototropism',
    outcomeIds: ['1.6.11', '1.6.12'], practicals: [], prerequisites: ['b1-cells-and-microscopy'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Phototropism in stems is differential growth caused by an uneven distribution of auxin in response to unidirectional light.',
      'Higher: auxin is produced at the shoot tip, moves down the shoot, light causes uneven distribution, auxin causes cell elongation so the shoot bends towards the light.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zb778xs', 'znhyxg8'),
    keywords: ['auxin', 'phototropism', 'unidirectional light', 'cell elongation', 'plant hormone'],
  },
  {
    slug: 'b1-fieldwork-sampling', unit: 'B1', title: 'Ecological terms, fieldwork and quadrat sampling',
    outcomeIds: ['1.7.1', '1.7.2', '1.7.3'], practicals: ['B4'], prerequisites: [], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'QWC on fieldwork: few mentioned a key to identify species; some could not name the quadrat.'),
    ],
    mustRecall: [
      'Definitions: biodiversity, population, habitat, environment, community, ecosystem (learn the CCEA glossary wording).',
      'Abiotic factors: wind speed, water, pH, light, temperature. Biotic: number of plant and animal species.',
      'Quadrats: random sampling (random co-ordinates) and belt transects (quadrats along a line) to measure distribution and abundance.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z466qp3', 'zwkmkhv'),
    keywords: ['biodiversity', 'population', 'habitat', 'community', 'ecosystem', 'quadrat', 'belt transect', 'random sampling', 'abiotic', 'biotic', 'Prescribed Practical B4'],
  },
  {
    slug: 'b1-competition-food-webs', unit: 'B1', title: 'Adaptation, competition, producers and food webs',
    outcomeIds: ['1.7.4', '1.7.5', '1.7.6'], practicals: [], prerequisites: ['b1-fieldwork-sampling', 'b1-photosynthesis-equation-limiting-factors'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Plants compete for water, light, space and minerals; animals for water, food, territory, mates and to avoid predators.',
      'The Sun is the source of energy for most ecosystems; green plants are producers.',
      'Arrows in a food chain show the direction of energy and substance (carbon, nitrogen) transfer; trophic levels: producer, primary consumer, secondary consumer.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z466qp3', 'zd429ty'),
    keywords: ['competition', 'adaptation', 'producer', 'consumer', 'trophic level', 'food chain', 'food web', 'energy flow'],
  },
  {
    slug: 'b1-decomposition-carbon-cycle', unit: 'B1', title: 'Decomposition and the carbon cycle',
    outcomeIds: ['1.7.7', '1.7.8', '1.7.9'], practicals: [], prerequisites: ['b1-competition-food-webs', 'b1-aerobic-respiration'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'F', 'Respiration written in both columns of a carbon-cycle table (processes removing vs returning CO2).'),
      ev('March 2026', 'B1', 'F', 'Saprophytic decomposition poorly described.'),
    ],
    mustRecall: [
      'Saprophytic fungi and bacteria secrete enzymes, digest food extracellularly and absorb the products; they recycle nutrients and form humus.',
      'Decay is faster when warm and moist and in aerobic conditions.',
      'Carbon cycle: photosynthesis removes CO2; respiration, combustion and decomposition return it; feeding, excretion, egestion and fossilisation move carbon between stores.',
    ],
    keyEquations: [], phet: [P.greenhouse], video: [], bitesize: bb('z466qp3', 'zh9hjfr'),
    keywords: ['saprophyte', 'extracellular digestion', 'humus', 'decay', 'carbon cycle', 'combustion', 'fossilisation', 'egestion'],
  },
  {
    slug: 'b1-nitrogen-cycle', unit: 'B1', title: 'The nitrogen cycle',
    outcomeIds: ['1.7.10'], practicals: [], prerequisites: ['b1-decomposition-carbon-cycle'], difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'H', 'Nitrogen-cycle processes: only nitrogen fixation and nitrification were known; denitrification and decomposition stages were not identified.'),
    ],
    mustRecall: [
      'Nitrogen fixation: nitrogen gas -> nitrates (nitrogen-fixing bacteria / lightning).',
      'Decomposition: proteins in dead matter -> ammonium compounds.',
      'Nitrification: ammonium -> nitrites -> nitrates (nitrifying bacteria, aerobic).',
      'Denitrification: nitrates -> nitrogen gas (denitrifying bacteria, anaerobic, e.g. waterlogged soil).',
      'Names of specific bacteria are not required.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z466qp3', 'z369ywx'),
    keywords: ['nitrogen fixation', 'nitrification', 'denitrification', 'decomposition', 'nitrates', 'waterlogging', 'anaerobic'],
  },
  {
    slug: 'b1-minerals-eutrophication', unit: 'B1', title: 'Mineral uptake by roots and eutrophication',
    outcomeIds: ['1.7.11', '1.7.12'], practicals: [], prerequisites: ['b1-nitrogen-cycle', 'b1-cells-and-microscopy'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'B1', 'H', 'Active transport explained wrongly (concentration-gradient direction; water said to be taken up by active transport); last stages of eutrophication omitted.'),
      ev('March 2026', 'B1', 'F', 'Root hair cell adaptations and what it absorbs; "hair root cell" wrong terminology.'),
    ],
    mustRecall: [
      'Root hair cells have an extended shape (large surface area) and absorb minerals by active uptake/transport and water by osmosis.',
      'Active transport moves minerals against a concentration gradient using energy from respiration (Higher).',
      'Nitrates are absorbed to make proteins.',
      'Eutrophication: nitrates -> algae/plants grow -> they die (nitrate depletion, shading) -> aerobic bacteria decompose them -> oxygen depleted -> fish and invertebrates die.',
    ],
    keyEquations: [], phet: [P.membrane], video: [], bitesize: bb('z466qp3', 'z369ywx'),
    keywords: ['root hair cell', 'active transport', 'active uptake', 'nitrates', 'eutrophication', 'fertiliser run-off', 'oxygen depletion', 'algal bloom'],
  },
);

// ---------------------------------------------------------------------------
// B2 Body Systems, Genetics, Microorganisms and Health
// ---------------------------------------------------------------------------
topics.push(
  {
    slug: 'b2-osmosis', unit: 'B2', title: 'Osmosis, plasmolysis and turgidity',
    outcomeIds: ['2.1.1', '2.1.2', '2.1.3'], practicals: ['B5'], prerequisites: ['b1-cells-and-microscopy'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'B2', 'F', 'Applying osmosis to new situations was difficult.'),
      ev('Summer 2025', 'U7A', 'F', 'Booklet A task: osmosis with potato/parsnip cylinders in sucrose solutions (percentage change in mass).'),
    ],
    mustRecall: [
      'Osmosis: the diffusion of water molecules from a dilute solution to a more concentrated solution through a selectively permeable membrane.',
      'Turgid: cell full of water, vacuole pushes on the cell wall. Plasmolysed: cytoplasm/membrane pulls away from the cell wall.',
      'The cell wall limits the entry of water so plant cells do not burst.',
      'Percentage change in mass = (change in mass / initial mass) x 100.',
    ],
    keyEquations: [], phet: [P.membrane], video: [], bitesize: bb('zdnnxyc', 'zy8v6rd'),
    keywords: ['osmosis', 'selectively permeable', 'turgid', 'plasmolysed', 'flaccid', 'Visking tubing', 'Prescribed Practical B5'],
  },
  {
    slug: 'b2-transpiration-potometer', unit: 'B2', title: 'Transpiration, the potometer and uses of water',
    outcomeIds: ['2.1.4', '2.1.5', '2.1.6'], practicals: ['B6'], prerequisites: ['b1-leaf-structure-gas-exchange', 'b2-osmosis'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Transpiration and the potometer were "a disappointing" area: stomata/air spaces; direction and explanation of bubble movement (water thought to enter via stomata, or confused with oxygen from photosynthesis).'),
    ],
    mustRecall: [
      'Transpiration: evaporation of water from mesophyll cells followed by diffusion through air spaces and out through stomata.',
      'Rate increases with surface area, wind, temperature and light intensity; decreases with humidity.',
      'Bubble potometer measures water uptake (bubble moves towards the plant); weight potometer measures mass loss; washing-line method measures water loss from leaves.',
      'Plants use water for support, transport, transpiration and photosynthesis.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zdnnxyc', 'zy8v6rd'),
    keywords: ['transpiration', 'potometer', 'bubble potometer', 'weight potometer', 'washing line', 'humidity', 'wind', 'light intensity', 'Prescribed Practical B6'],
  },
  {
    slug: 'b2-blood-and-vessels', unit: 'B2', title: 'Blood components, cell lysis and blood vessels',
    outcomeIds: ['2.2.1', '2.2.2', '2.2.3', '2.2.4'], practicals: [], prerequisites: ['b1-cells-and-microscopy', 'b2-osmosis'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Red cells: biconcave, no nucleus, haemoglobin (iron) for oxygen transport. White cells: defence. Platelets: convert fibrinogen to fibrin (clotting). Plasma: transports cells, food, CO2, hormones, urea.',
      'Red blood cells in water take in water by osmosis and burst (lysis) (Higher).',
      'Arteries: thick muscular/elastic walls, small lumen, high pressure, away from the heart. Veins: thin walls, large lumen, valves, low pressure, towards the heart. Capillaries: one cell thick, permeable, exchange.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zdnnxyc', 'zqbhjfr'),
    keywords: ['red blood cell', 'haemoglobin', 'platelets', 'fibrinogen', 'fibrin', 'plasma', 'lysis', 'artery', 'vein', 'capillary', 'lumen', 'valve'],
  },
  {
    slug: 'b2-heart-double-circulation', unit: 'B2', title: 'The heart, double circulation and exercise',
    outcomeIds: ['2.2.5', '2.2.6', '2.2.7'], practicals: [], prerequisites: ['b2-blood-and-vessels'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Vena cava -> right atrium -> right ventricle -> pulmonary artery -> lungs -> pulmonary vein -> left atrium -> left ventricle -> aorta.',
      'Hepatic artery/vein and hepatic portal vein (liver); renal artery/vein (kidney); pulmonary artery/vein (lungs).',
      'Left ventricle has the thickest wall (pumps to the whole body); valves prevent backflow; coronary vessels supply the heart muscle.',
      'Regular exercise strengthens heart muscle and increases cardiac output at rest.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zdnnxyc', 'zqbhjfr'),
    keywords: ['atrium', 'ventricle', 'aorta', 'vena cava', 'pulmonary artery', 'pulmonary vein', 'hepatic portal vein', 'renal artery', 'double circulation', 'pulse rate', 'coronary'],
  },
  {
    slug: 'b2-reproductive-systems', unit: 'B2', title: 'Male and female reproductive systems',
    outcomeIds: ['2.3.1', '2.3.2'], practicals: [], prerequisites: [], difficulty: 1,
    examinerEvidence: [],
    mustRecall: [
      'Male: testes (make sperm and testosterone), scrotum, sperm tube, prostate gland, urethra, penis.',
      'Female: ovaries (make ova and oestrogen), oviducts (site of fertilisation), uterus, cervix, vagina.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zdnnxyc', 'zqq4fdm'),
    keywords: ['testes', 'sperm tube', 'prostate gland', 'urethra', 'ovary', 'oviduct', 'uterus', 'cervix', 'vagina'],
  },
  {
    slug: 'b2-fertilisation-pregnancy', unit: 'B2', title: 'Sperm, fertilisation, implantation and the placenta',
    outcomeIds: ['2.3.3'], practicals: [], prerequisites: ['b2-reproductive-systems', 'b2-mitosis-meiosis'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'H', 'Zygote confused with embryo; implantation confused with differentiation.'),
    ],
    mustRecall: [
      'Sperm: made by meiosis, haploid nucleus, mitochondria for energy, flagellum for swimming.',
      'Fertilisation (in the oviduct): haploid sperm and egg nuclei fuse to form a diploid zygote; the zygote divides by mitosis into a ball of cells; after implantation in the uterus lining the embryo differentiates into tissues and organs.',
      'Placenta: large surface area (villi) for diffusion of nutrients, oxygen, CO2 and urea; umbilical cord carries blood to and from the foetus; amnion and amniotic fluid cushion the foetus.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zdnnxyc', 'zqq4fdm'),
    keywords: ['sperm', 'haploid', 'diploid', 'zygote', 'embryo', 'implantation', 'differentiation', 'placenta', 'villi', 'umbilical cord', 'amnion'],
  },
  {
    slug: 'b2-sex-hormones-menstrual-cycle', unit: 'B2', title: 'Sex hormones and the menstrual cycle',
    outcomeIds: ['2.3.4', '2.3.5'], practicals: [], prerequisites: ['b2-reproductive-systems', 'b1-blood-glucose-diabetes'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Progesterone misspelt; hormones confused (testosterone, auxin, ADH given).'),
    ],
    mustRecall: [
      'Testosterone (testes) and oestrogen (ovaries) cause secondary sexual characteristics.',
      'Menstrual cycle (about 28 days): menstruation days 1-5; ovulation about day 14; fertilisation most likely around ovulation.',
      'Oestrogen repairs and thickens the uterus lining; progesterone maintains it.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zdnnxyc', 'zqq4fdm'),
    keywords: ['testosterone', 'oestrogen', 'progesterone', 'menstruation', 'ovulation', 'secondary sexual characteristics', 'menstrual cycle'],
  },
  {
    slug: 'b2-infertility-contraception', unit: 'B2', title: 'Infertility treatments and contraception',
    outcomeIds: ['2.3.6', '2.3.7'], practicals: [], prerequisites: ['b2-sex-hormones-menstrual-cycle'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Higher: fertility treatment uses hormones to produce multiple ova, in vitro fertilisation and transfer of several embryos into the uterus.',
      'Mechanical: condom (barrier; also prevents STIs such as HIV and chlamydia). Chemical: pill and implants change hormone levels and stop ovum development. Surgical: sterilisation.',
      'Contraception can raise ethical issues for some people.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zdnnxyc', 'zqq4fdm'),
    keywords: ['infertility', 'IVF', 'in vitro fertilisation', 'condom', 'contraceptive pill', 'implant', 'sterilisation', 'chlamydia', 'HIV'],
  },
  {
    slug: 'b2-genome-chromosomes-dna', unit: 'B2', title: 'Genome, chromosomes, genes, alleles and DNA structure',
    outcomeIds: ['2.4.1', '2.4.2', '2.4.3', '2.4.4'], practicals: [], prerequisites: ['b1-cells-and-microscopy'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'H', 'Percentage of base C from base-pairing rules was not calculated correctly.'),
    ],
    mustRecall: [
      'Genome: the entire genetic material of an organism.',
      'Chromosomes occur in functional pairs in the nucleus (except in gametes and bacteria).',
      'A gene is a short length of DNA on a chromosome that controls a characteristic; alleles are different forms of the same gene.',
      'DNA: phosphate-deoxyribose backbone, bases A-T and C-G, double helix; each individual has unique DNA.',
      'Base triplet hypothesis: three bases code for one amino acid (Higher).',
    ],
    keyEquations: [], phet: [P.geneExpression], video: [], bitesize: bb('zhybf4j', 'zqn6dnb'),
    keywords: ['genome', 'chromosome', 'gene', 'allele', 'DNA', 'double helix', 'base pairing', 'base triplet', 'deoxyribose'],
  },
  {
    slug: 'b2-mitosis-meiosis', unit: 'B2', title: 'Cell division: mitosis and meiosis',
    outcomeIds: ['2.4.5', '2.4.6', '2.4.7'], practicals: [], prerequisites: ['b2-genome-chromosomes-dna'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'H', '"Independent assortment" almost never named; choosing the four meiotic nuclei from diagrams was poorly done.'),
    ],
    mustRecall: [
      'Mitosis: exact duplication of chromosomes giving daughter cells genetically identical to the parent (clones); used for growth, replacing worn-out cells and repairing damaged tissue.',
      'Meiosis: reduction division producing four genetically different haploid cells; independent assortment reassorts chromosomes to give variation.',
      'Phase names, DNA replication and crossing over are not required.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zhybf4j', 'zywkvj6'),
    keywords: ['mitosis', 'meiosis', 'cell cycle', 'clone', 'haploid', 'diploid', 'reduction division', 'independent assortment'],
  },
  {
    slug: 'b2-monohybrid-genetics', unit: 'B2', title: 'Monohybrid crosses, Punnett squares, test crosses and pedigrees',
    outcomeIds: ['2.4.8'], practicals: [], prerequisites: ['b2-mitosis-meiosis'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Homozygous dominant/recessive terminology confused.'),
      ev('Summer 2025', 'B2', 'H', 'Wrong parental genotypes used in crosses; test (back) cross described only by the most able.'),
    ],
    mustRecall: [
      'Dominant allele shows in the phenotype if present; recessive only shows when homozygous.',
      'Genotype (alleles present) vs phenotype (observable characteristic); homozygous (two identical alleles) vs heterozygous.',
      'Punnett square gives genotype frequencies as ratios, percentages or probabilities.',
      'Test (back) cross: cross the unknown with a homozygous recessive to reveal its genotype (Higher); pedigree diagrams (Higher).',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zhybf4j', 'z34gp9q'),
    keywords: ['dominant', 'recessive', 'genotype', 'phenotype', 'homozygous', 'heterozygous', 'Punnett square', 'test cross', 'back cross', 'pedigree diagram'],
  },
  {
    slug: 'b2-sex-determination-genetic-conditions-screening', unit: 'B2', title: 'Sex determination, inherited conditions and genetic screening',
    outcomeIds: ['2.4.9', '2.4.10', '2.4.11'], practicals: [], prerequisites: ['b2-monohybrid-genetics'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Sex determination: XX female, XY male; 50:50 chance shown by a Punnett square.',
      "Cystic fibrosis: recessive allele. Huntington's disease: dominant allele. Down's syndrome: extra chromosome 21 (47 chromosomes). Haemophilia: sex-linked recessive on the X chromosome (Higher).",
      'Screening ethics: who decides who is tested; amniocentesis (risk of miscarriage) vs blood tests; dilemmas for carriers; use of genetic information by insurers.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zhybf4j', 'zf9cs82'),
    keywords: ['X chromosome', 'Y chromosome', 'cystic fibrosis', "Huntington's disease", "Down's syndrome", 'haemophilia', 'genetic screening', 'amniocentesis', 'carrier'],
  },
  {
    slug: 'b2-genetic-engineering', unit: 'B2', title: 'Genetic engineering: producing human insulin',
    outcomeIds: ['2.4.12'], practicals: [], prerequisites: ['b2-genome-chromosomes-dna', 'b1-blood-glucose-diabetes'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'H', 'Restriction-enzyme staggered ("sticky end") cuts and the number of DNA fragments produced were poorly answered.'),
    ],
    mustRecall: [
      'Genetic engineering modifies the genome of an organism to introduce desirable characteristics.',
      'Higher: the human insulin gene is cut out with restriction enzymes (sticky ends), inserted into a bacterial plasmid, the GM bacterium is cultured in a fermenter, then insulin is extracted, purified and packaged (downstreaming).',
      'Advantages: pure human insulin, large quantities, cheap, no ethical/religious objections to animal insulin.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zhybf4j', 'z9fn7v4'),
    keywords: ['genetic engineering', 'plasmid', 'restriction enzyme', 'sticky ends', 'fermenter', 'downstreaming', 'human insulin', 'genetically modified'],
  },
  {
    slug: 'b2-variation', unit: 'B2', title: 'Continuous and discontinuous variation; genetic and environmental causes',
    outcomeIds: ['2.5.1', '2.5.2'], practicals: [], prerequisites: ['b2-genome-chromosomes-dna'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Continuous variation (height, length): range of values, plotted as a histogram. Discontinuous (tongue rolling, hand dominance): distinct categories, bar chart.',
      'Genetic basis: mutations (random changes in chromosome number or gene structure) and sexual reproduction. Environmental basis: e.g. diet affecting height.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('zhybf4j', 'z3tx8p3'),
    keywords: ['continuous variation', 'discontinuous variation', 'histogram', 'bar chart', 'mutation', 'sexual reproduction', 'environmental variation'],
  },
  {
    slug: 'b2-natural-selection-selective-breeding', unit: 'B2', title: 'Natural selection, evolution, extinction and selective breeding',
    outcomeIds: ['2.5.3', '2.5.4'], practicals: [], prerequisites: ['b2-variation'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'B2', 'F', 'Natural selection described as "a topic that candidates find difficult".'),
    ],
    mustRecall: [
      'Natural selection: variation in phenotypes -> competition -> best-adapted survive (e.g. antibiotic resistance) -> they reproduce and pass on their genes.',
      'Higher: evolution is a continuing process of natural selection that can form new species; extinction results from failure to adapt to environmental change.',
      'Selective breeding: humans choose individuals with desirable characteristics and breed them over many generations.',
    ],
    keyEquations: [], phet: [P.naturalSelection], video: [], bitesize: bb('zhybf4j', 'z3tx8p3'),
    keywords: ['natural selection', 'evolution', 'extinction', 'speciation', 'antibiotic resistance', 'selective breeding', 'differential survival'],
  },
  {
    slug: 'b2-health-communicable-diseases-aseptic', unit: 'B2', title: 'Health, communicable diseases and aseptic technique',
    outcomeIds: ['2.6.1', '2.6.2', '2.6.3', '2.6.4'], practicals: [], prerequisites: ['b1-cells-and-microscopy'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Bacterial vs viral diseases confused.'),
      ev('Summer 2025', 'U7B', 'F', 'Reason for incubating at a maximum of 25 deg C (to avoid growing human pathogens) not known.'),
    ],
    mustRecall: [
      'Health: being free from communicable and non-communicable disease.',
      "Bacteria: chlamydia, salmonella, tuberculosis. Viruses: HIV/AIDS, cold and flu, HPV. Fungi: athlete's foot, potato blight.",
      'Aseptic technique: sterilise by autoclaving, flaming and alcohol; keep Petri dish partially covered near a Bunsen; incubate sealed dishes at a maximum of 25 deg C; dispose by autoclaving.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z7vvpg8', 'z4ss239'),
    keywords: ['communicable disease', 'bacteria', 'virus', 'fungus', 'tuberculosis', 'salmonella', 'HPV', 'aseptic technique', 'autoclave', 'agar plate', '25 degrees'],
  },
  {
    slug: 'b2-defence-mechanisms-immunity', unit: 'B2', title: 'Defence mechanisms and immunity',
    outcomeIds: ['2.6.5'], practicals: [], prerequisites: ['b2-blood-and-vessels'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Secondary immune response explained vaguely (memory lymphocytes, faster and larger antibody production).'),
    ],
    mustRecall: [
      'Barriers: skin, mucous membranes, blood clotting.',
      'Lymphocytes produce antibodies in response to antigens; antibodies clump microorganisms, reducing spread and symptoms; phagocytes engulf and digest microorganisms.',
      'Memory lymphocytes give a faster, larger secondary response.',
      'Active immunity: body makes its own antibodies (infection or vaccine). Passive immunity: antibodies received (e.g. from mother).',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z7vvpg8', 'zg2mkhv'),
    keywords: ['antibody', 'antigen', 'lymphocyte', 'phagocyte', 'memory lymphocyte', 'secondary response', 'active immunity', 'passive immunity'],
  },
  {
    slug: 'b2-antibiotics-resistance-vaccines', unit: 'B2', title: 'Antibiotics, antibiotic resistance and vaccination',
    outcomeIds: ['2.6.6', '2.6.7', '2.6.8'], practicals: [], prerequisites: ['b2-defence-mechanisms-immunity', 'b2-natural-selection-selective-breeding'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Comparing antibiotic clear zones needs evidence and comparative language ("biggest clear area / killed the most bacteria").'),
      ev('Summer 2024', 'B2', 'H', 'Drawing conclusions from drug-trial data was weak.'),
    ],
    mustRecall: [
      'Antibiotics (e.g. penicillin) are chemicals produced by fungi that kill bacteria or reduce their growth; they do not work on viruses.',
      'Higher: overuse of antibiotics leads to resistant bacteria (superbugs such as MRSA); hospitals use hygiene, restricted prescribing and isolation to reduce them.',
      'Vaccines use modified disease-causing organisms to raise antibody and memory-lymphocyte levels; boosters top these up (Higher: interpret antibody-level graphs).',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z7vvpg8', 'zg2mkhv'),
    keywords: ['antibiotic', 'penicillin', 'MRSA', 'superbug', 'antibiotic resistance', 'vaccine', 'booster', 'memory lymphocyte'],
  },
  {
    slug: 'b2-non-communicable-diseases-cancer', unit: 'B2', title: 'Non-communicable diseases, lifestyle factors and cancer',
    outcomeIds: ['2.6.9', '2.6.10', '2.6.14', '2.6.15'], practicals: [], prerequisites: ['b1-blood-glucose-diabetes', 'b1-respiratory-surfaces-breathing'], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Effects of tar and nicotine confused.'),
    ],
    mustRecall: [
      'Risk factors: inherited genes; poor diet (excess sugar and fat); lack of exercise (energy intake > energy used -> obesity); UV -> skin cancer; alcohol -> liver disease and foetal alcohol syndrome.',
      'Tobacco: tar -> bronchitis, emphysema (alveoli damaged, less surface area), lung cancer; nicotine is addictive and affects heart rate; carbon monoxide reduces the oxygen-carrying capacity of red blood cells.',
      'Obesity leads to cardiovascular disease and Type 2 diabetes.',
      'Cancer is uncontrolled cell division; benign tumours are encapsulated and do not spread, malignant tumours spread. Cervical cancer (HPV vaccine), lung (smoking), skin (UV).',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z7vvpg8', 'znthjfr'),
    keywords: ['non-communicable disease', 'obesity', 'tar', 'nicotine', 'carbon monoxide', 'emphysema', 'bronchitis', 'benign', 'malignant', 'tumour', 'HPV vaccine', 'UV'],
  },
  {
    slug: 'b2-heart-attacks-strokes', unit: 'B2', title: 'Blocked blood vessels, heart attacks, strokes and treatments',
    outcomeIds: ['2.6.11', '2.6.12', '2.6.13'], practicals: [], prerequisites: ['b2-heart-double-circulation', 'b2-non-communicable-diseases-cancer'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'B2', 'F', 'Consequences of a blocked vessel not given as a chain (less oxygen and glucose -> less respiration -> cell death).'),
    ],
    mustRecall: [
      'Cholesterol deposits -> clot -> restricted blood flow -> less oxygen and glucose -> reduced respiration -> cell death.',
      'Coronary vessel blockage = heart attack; blockage of vessels to the brain = stroke.',
      'Treatments: angioplasty and stents (widen the vessel); statins (lower cholesterol) and aspirin (reduce clotting).',
      'Risk factors: excess dietary fat, smoking, stress, lack of exercise.',
    ],
    keyEquations: [], phet: [], video: [], bitesize: bb('z7vvpg8', 'znthjfr'),
    keywords: ['cholesterol', 'clot', 'heart attack', 'stroke', 'angioplasty', 'stent', 'statin', 'aspirin', 'coronary'],
  },
);

// ---------------------------------------------------------------------------
// C1 Structures, Trends, Chemical Reactions, Quantitative Chemistry and Analysis
// ---------------------------------------------------------------------------
topics.push(
  {
    slug: 'c1-atomic-structure', unit: 'C1', title: 'Atomic structure and electronic configuration',
    outcomeIds: ['1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.1.5', '1.1.6', '1.1.7', '1.1.11'], practicals: [], prerequisites: [], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Atomic number defined wrongly (electrons included); electronic configuration of the oxide ion given as 2,6 instead of 2,8.'),
      ev('March 2026', 'C1', 'F', 'Definitions "only loosely known" - learn the CCEA glossary wording verbatim.'),
    ],
    mustRecall: [
      'Proton: charge +1, mass 1. Neutron: charge 0, mass 1. Electron: charge -1, mass negligible (1/1840).',
      'Atomic number = number of protons. Mass number = protons + neutrons.',
      'Atoms are neutral because protons = electrons; ions have gained or lost electrons.',
      'Electronic configuration for Z = 1-20: shells fill 2, 8, 8, 2 (e.g. Na 2,8,1; Cl 2,8,7; Ca 2,8,8,2).',
      'A compound is two or more elements chemically combined.',
    ],
    phet: [P.buildAtom, P.rutherford], video: [], bitesize: bb('zfddcqt', 'zd88ywx'),
    keywords: ['proton', 'neutron', 'electron', 'nucleus', 'atomic number', 'mass number', 'electronic configuration', 'shell', 'ion', 'compound'],
  },
  {
    slug: 'c1-isotopes-relative-atomic-mass', unit: 'C1', title: 'Isotopes and relative atomic mass',
    outcomeIds: ['1.1.8', '1.1.9', '1.1.10'], practicals: [], prerequisites: ['c1-atomic-structure'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', 'Isotopes defined in the singular ("an atom with...") - the definition needs atoms of the same element with the same atomic number and different mass numbers.'),
    ],
    mustRecall: [
      'Isotopes: atoms of the same element with the same atomic number but a different mass number (different number of neutrons).',
      'Relative atomic mass (Higher) = sum of (mass number x % abundance) / 100.',
    ],
    phet: [P.isotopes], video: [], bitesize: bb('zfddcqt', 'zd88ywx'),
    keywords: ['isotope', 'relative atomic mass', 'abundance', 'mass number', 'neutrons'],
  },
  {
    slug: 'c1-ionic-bonding', unit: 'C1', title: 'Ions and ionic bonding (dot and cross diagrams)',
    outcomeIds: ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5'], practicals: [], prerequisites: ['c1-atomic-structure'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Dot-and-cross diagrams are marked hierarchically: transfer/sharing first, then remaining electrons, then correct dots/crosses.'),
    ],
    mustRecall: [
      'An ion is a charged particle formed when an atom gains or loses electrons; a molecular ion contains more than one atom (e.g. NO3-, SO4 2-).',
      'Cation = positive ion; anion = negative ion (Higher).',
      'Group 1/2 metals lose electrons, Group 6/7 non-metals gain electrons, giving noble-gas configurations; ionic bonding is the attraction between oppositely charged ions.',
      'Ionic bonds are strong and substantial energy is needed to break them; ionic bonding is typical of metal compounds.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zyvvmbk'),
    keywords: ['ion', 'cation', 'anion', 'ionic bond', 'dot and cross', 'electron transfer', 'molecular ion', 'noble gas configuration'],
  },
  {
    slug: 'c1-covalent-bonding', unit: 'C1', title: 'Covalent bonding, molecules and multiple bonds',
    outcomeIds: ['1.2.6', '1.2.7', '1.2.8', '1.2.9', '1.2.10', '1.2.11', '1.2.12'], practicals: [], prerequisites: ['c1-atomic-structure'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Properties of covalent compounds were among the worst-answered areas.'),
      ev('Summer 2025', 'C1', 'H', 'A diatomic gas made of two elements: CO2 given (not diatomic) - diatomic means exactly two atoms.'),
    ],
    mustRecall: [
      'A single covalent bond is a shared pair of electrons; a covalent bond can be shown as a line.',
      'Dot-and-cross diagrams for H2, Cl2, HCl, H2O, NH3, CH4 (label lone pairs); Higher: double bonds in O2 and CO2, triple bond in N2.',
      'A molecule is two or more atoms covalently bonded; diatomic = two atoms per molecule.',
      'Covalent bonds are strong and need substantial energy to break; covalent bonding is typical of non-metals.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zyvvmbk'),
    keywords: ['covalent bond', 'shared pair', 'lone pair', 'molecule', 'diatomic', 'double bond', 'triple bond', 'dot and cross'],
  },
  {
    slug: 'c1-ionic-and-molecular-structures', unit: 'C1', title: 'Giant ionic lattices and molecular covalent structures',
    outcomeIds: ['1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5'], practicals: [], prerequisites: ['c1-ionic-bonding', 'c1-covalent-bonding'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', 'Explaining the high melting point of NaCl (strong ionic bonds, substantial energy to break) and conduction when molten (ions free to move and carry charge - not "carry current") was weak.'),
      ev('Summer 2025', 'C1', 'F', "van der Waals' forces must be named - \"intermolecular forces\" alone is not accepted."),
    ],
    mustRecall: [
      'Giant ionic lattice: high melting and boiling points (strong ionic bonds), conducts when molten or dissolved (ions free to move) but not when solid; most ionic compounds dissolve in water.',
      "Molecular covalent (iodine, CO2): low melting/boiling points because the weak van der Waals' forces between molecules are easily overcome; do not conduct; many are insoluble in water.",
    ],
    phet: [P.states], video: [], bitesize: bb('zfddcqt', 'z3grh4j'),
    keywords: ['giant ionic lattice', 'sodium chloride', 'melting point', 'electrical conductivity', 'molecular covalent', "van der Waals' forces", 'intermolecular', 'solubility'],
  },
  {
    slug: 'c1-carbon-allotropes-nanoparticles', unit: 'C1', title: 'Diamond, graphite, graphene and nanoparticles',
    outcomeIds: ['1.3.6', '1.3.9', '1.3.10', '1.3.11', '1.4.1', '1.4.2'], practicals: [], prerequisites: ['c1-covalent-bonding'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', "Nanoparticle risks must be the specification's two: cell damage in the body and harmful effects on the environment."),
    ],
    mustRecall: [
      'Carbon forms four covalent bonds. Diamond: each C bonded to 4 others, very hard, very high m.p., does not conduct; used in cutting tools.',
      'Graphite: layers of C bonded to 3 others, delocalised electrons conduct, layers slide (soft); used in lubricants and pencils.',
      'Graphene: a single layer of graphite, very strong, conducts; used in batteries and solar cells. Allotropes: different forms of the same element.',
      'Nanoparticles are 1-100 nm and contain a few hundred atoms; in sun creams they give better coverage and UV protection but may damage cells and the environment.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'z3grh4j'),
    keywords: ['diamond', 'graphite', 'graphene', 'allotrope', 'giant covalent', 'delocalised electrons', 'nanoparticle', 'sun cream'],
  },
  {
    slug: 'c1-metallic-structures-classifying', unit: 'C1', title: 'Metallic bonding, alloys and classifying structures',
    outcomeIds: ['1.2.13', '1.3.7', '1.3.8', '1.3.12'], practicals: [], prerequisites: ['c1-ionic-and-molecular-structures', 'c1-carbon-allotropes-nanoparticles'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', 'Metallic bonding descriptions must mention positive ions (cations) in a lattice AND delocalised electrons.'),
    ],
    mustRecall: [
      'Metallic bonding (Higher): attraction between positive ions in a regular lattice and delocalised electrons.',
      'Metals: high melting points, malleable and ductile (layers slide), conduct (delocalised electrons move).',
      'An alloy is a mixture of two or more elements, at least one a metal, with metallic properties.',
      'Classify from data (Higher): giant ionic (high m.p., conducts molten only), molecular covalent (low m.p., never conducts), giant covalent (very high m.p.; only graphite conducts), metallic (conducts solid and liquid).',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'z3grh4j'),
    keywords: ['metallic bonding', 'delocalised electrons', 'lattice', 'malleable', 'ductile', 'alloy', 'classify structures'],
  },
  {
    slug: 'c1-symbols-and-formulae', unit: 'C1', title: 'Symbols, diatomic elements and writing formulae',
    outcomeIds: ['1.5.1', '1.5.2', '1.5.3'], practicals: [], prerequisites: ['c1-ionic-bonding'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Writing formulae was "disappointing"; formulae were among the worst-answered areas.'),
      ev('Summer 2025', 'C2', 'F', 'Diatomic elements forgotten (H2, O2, N2 written as single atoms in equations).'),
      ev('March 2026', 'C1', 'H', 'Formulae still weak; symbols are case-sensitive (Cu not CU).'),
    ],
    mustRecall: [
      'Diatomic elements: H2, N2, O2, F2, Cl2, Br2, I2.',
      'Common ions: Na+, K+, Mg2+, Ca2+, Al3+, Zn2+, Fe2+, Fe3+, Cu2+, NH4+, Cl-, Br-, I-, O2-, OH-, NO3-, SO4 2-, CO3 2-, HCO3-.',
      'Balance charges to write a formula (e.g. Al2O3, Ca(OH)2, (NH4)2SO4).',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zq2m46f'),
    keywords: ['chemical symbol', 'formula', 'diatomic', 'subscript', 'ion charge', 'brackets in formulae'],
  },
  {
    slug: 'c1-word-and-balanced-equations', unit: 'C1', title: 'Word equations, balanced symbol equations and state symbols',
    outcomeIds: ['1.5.4', '1.5.5', '1.5.6', '1.5.7', '1.5.10'], practicals: [], prerequisites: ['c1-symbols-and-formulae'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Balanced equations "disappointing".'),
      ev('March 2026', 'C1', 'H', 'Balanced equations remain a weakness.'),
    ],
    mustRecall: [
      'Reactants are used up and products are formed; atoms are rearranged, never lost or made (conservation of atoms).',
      'Balance by changing the large numbers in front of formulae only, never subscripts.',
      'State symbols: (s) solid, (l) liquid, (g) gas, (aq) aqueous.',
    ],
    phet: [P.balancing], video: [], bitesize: bb('zfddcqt', 'zq2m46f'),
    keywords: ['word equation', 'balanced symbol equation', 'reactant', 'product', 'conservation of mass', 'state symbols'],
  },
  {
    slug: 'c1-ionic-and-half-equations', unit: 'C1', title: 'Ionic equations and half equations',
    outcomeIds: ['1.5.8', '1.5.9'], practicals: [], prerequisites: ['c1-word-and-balanced-equations', 'c1-ionic-bonding'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', 'Ionic equations (e.g. Br2 + 2KI) "continue to prove challenging".'),
      ev('March 2026', 'C1', 'H', 'Half equations weak.'),
      ev('Summer 2024', 'C2', 'H', 'Ionic equations and redox remain weak.'),
    ],
    mustRecall: [
      'Ionic equation: write out aqueous ionic substances as ions, cancel spectator ions (e.g. Cl2 + 2Br- -> 2Cl- + Br2).',
      'Half equation: shows electrons lost or gained by one species (e.g. Na -> Na+ + e-; Cl2 + 2e- -> 2Cl-).',
      'Charges and atoms must both balance.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zq2m46f'),
    keywords: ['ionic equation', 'half equation', 'spectator ion', 'electron', 'charge balance'],
  },
  {
    slug: 'c1-periodic-table-structure', unit: 'C1', title: 'Mendeleev, groups, periods and the arrangement of elements',
    outcomeIds: ['1.6.1', '1.6.2', '1.6.3', '1.6.4', '1.6.7', '1.6.8'], practicals: [], prerequisites: ['c1-atomic-structure'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'The Periodic Table was among the worst-answered areas; the group Mendeleev could not have known about (noble gases) confused with the halogens.'),
    ],
    mustRecall: [
      'Mendeleev arranged elements by atomic mass and left gaps, predicting the properties of undiscovered elements; the modern table is arranged by atomic number.',
      'An element consists of only one type of atom and cannot be broken down chemically.',
      'Group = vertical column (same number of outer electrons, similar properties); period = horizontal row.',
      'Group 1 alkali metals, Group 2 reactive metals, Group 7 halogens (reactive non-metals), Group 0 noble gases (unreactive).',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'z2x6khv'),
    keywords: ['Mendeleev', 'Periodic Table', 'group', 'period', 'element', 'outer electrons', 'alkali metals', 'halogens', 'noble gases'],
  },
  {
    slug: 'c1-metals-and-non-metals', unit: 'C1', title: 'Metals and non-metals: properties, position and state',
    outcomeIds: ['1.6.5', '1.6.6'], practicals: [], prerequisites: ['c1-periodic-table-structure'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Metals (left/centre of the table): conduct heat and electricity, ductile, malleable, high melting points, sonorous. Non-metals (top right): poor conductors, brittle, low melting points.',
      'At room temperature and pressure only bromine and mercury are liquids; H, N, O, F, Cl and the noble gases are gases; the rest are solids.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'z2x6khv'),
    keywords: ['metal', 'non-metal', 'ductile', 'malleable', 'sonorous', 'conductor', 'state at room temperature'],
  },
  {
    slug: 'c1-group-1-alkali-metals', unit: 'C1', title: 'Group 1: the alkali metals',
    outcomeIds: ['1.6.9', '1.6.10', '1.6.11', '1.6.12', '1.6.13', '1.6.14', '1.6.15'], practicals: [], prerequisites: ['c1-periodic-table-structure', 'c1-ionic-bonding'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Potassium + water product given as an oxide instead of a hydroxide; lithium + water observations incomplete; safety-screen wording.'),
    ],
    mustRecall: [
      'Low density (Li, Na, K float on water); soft, easily cut, shiny when fresh, tarnish rapidly in air; stored under oil.',
      'metal + water -> metal hydroxide + hydrogen. Observations: floats, moves, fizzes, disappears; Na melts into a ball; K burns with a lilac flame.',
      'Reactivity increases down the group: the outer electron is further from the nucleus and more easily lost (Higher: M -> M+ + e-).',
      'Most Group 1 compounds are white and give colourless solutions.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'z2x6khv'),
    keywords: ['alkali metals', 'lithium', 'sodium', 'potassium', 'reaction with water', 'hydroxide', 'hydrogen', 'reactivity trend', 'half equation'],
  },
  {
    slug: 'c1-group-7-halogens', unit: 'C1', title: 'Group 7: the halogens and displacement',
    outcomeIds: ['1.6.16', '1.6.17', '1.6.18', '1.6.19', '1.6.20', '1.6.21', '1.6.22'], practicals: [], prerequisites: ['c1-group-1-alkali-metals', 'c1-ionic-and-half-equations'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', 'Displacement colour changes confused (bromine vs iodine colours); "chloride ion" not "chlorine ion".'),
    ],
    mustRecall: [
      'Chlorine: pale green gas. Bromine: red-brown liquid. Iodine: grey-black solid that sublimes to a purple vapour. All diatomic and toxic.',
      'Test for chlorine: damp universal indicator paper turns red then bleaches white.',
      'A more reactive halogen displaces a less reactive halide from solution (Higher), e.g. Cl2 + 2KBr -> 2KCl + Br2 (solution turns orange).',
      'Reactivity decreases down the group: the outer shell is further from the nucleus so an electron is gained less easily (Higher: X2 + 2e- -> 2X-).',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'z2x6khv'),
    keywords: ['halogens', 'chlorine', 'bromine', 'iodine', 'sublimation', 'displacement', 'halide', 'chlorine test', 'reactivity trend'],
  },
  {
    slug: 'c1-group-0-and-transition-metals', unit: 'C1', title: 'Group 0 noble gases and transition metals',
    outcomeIds: ['1.6.23', '1.6.24', '1.6.25', '1.6.26'], practicals: [], prerequisites: ['c1-periodic-table-structure'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Noble gases are unreactive because they have full (stable) outer shells; colourless gases; boiling point increases down the group (Higher).',
      'Transition metals form ions with different charges (iron(II), iron(III)) and coloured compounds: copper(II) oxide black, copper(II) carbonate green, hydrated copper(II) sulfate blue, copper(II) solutions blue.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'z2x6khv'),
    keywords: ['noble gases', 'full outer shell', 'boiling point trend', 'transition metals', 'variable charge', 'coloured compounds', 'copper(II)'],
  },
  {
    slug: 'c1-formula-mass-and-moles', unit: 'C1', title: 'Relative formula mass, percentage by mass and the mole',
    outcomeIds: ['1.7.1', '1.7.2', '1.7.3', '1.7.4'], practicals: [], prerequisites: ['c1-symbols-and-formulae', 'c1-isotopes-relative-atomic-mass'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Percentage composition by mass calculations weak.'),
    ],
    mustRecall: [
      'Ar is the mass of an atom compared with carbon-12 (= 12 exactly); it is a weighted mean of the mass numbers.',
      'Mr = sum of Ar values in the formula; % by mass of an element = (Ar x number of atoms / Mr) x 100.',
      'One mole has a mass in grams equal to the Mr; moles = mass / Mr.',
    ],
    phet: [], video: [VID.chemChicken], bitesize: bb('zfddcqt', 'zmthdnb'),
    keywords: ['relative formula mass', 'Mr', 'Ar', 'percentage by mass', 'mole', 'molar mass'],
  },
  {
    slug: 'c1-reacting-masses-and-yield', unit: 'C1', title: 'Reacting masses, limiting reactant and percentage yield',
    outcomeIds: ['1.7.5', '1.7.6', '1.7.7'], practicals: [], prerequisites: ['c1-formula-mass-and-moles', 'c1-word-and-balanced-equations'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', "Reasons for a yield below 100% must be the specification's: loss in separation, side reactions, reversible reaction not going to completion."),
    ],
    mustRecall: [
      'Reacting masses: moles of known -> use equation ratio -> moles of unknown -> mass; the limiting reactant is the one completely used up.',
      'Percentage yield = (actual yield / theoretical yield) x 100.',
      'Yield < 100% because of loss of product during separation, side reactions or a reversible reaction not going to completion.',
    ],
    phet: [P.reactants], video: [VID.chemChicken], bitesize: bb('zfddcqt', 'zmthdnb'),
    keywords: ['reacting masses', 'limiting reactant', 'theoretical yield', 'percentage yield', 'mole ratio'],
  },
  {
    slug: 'c1-indicators-and-ph', unit: 'C1', title: 'Indicators and the pH scale',
    outcomeIds: ['1.8.1', '1.8.2'], practicals: [], prerequisites: [], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Universal indicator colours: "blue" alone is not enough for pH 14 (purple/violet); crimson/brick red not accepted for red; pH of ethanoic acid and NaOH not known.'),
    ],
    mustRecall: [
      'Red litmus turns blue in alkali; blue litmus turns red in acid; a pH meter gives pH to at least one decimal place.',
      'pH 0-2 strong acid; 3-6 weak acid; 7 neutral; 8-11 weak alkali; 12-14 strong alkali.',
    ],
    phet: [P.phScale], video: [], bitesize: bb('zfddcqt', 'zn49s82'),
    keywords: ['litmus', 'universal indicator', 'pH scale', 'pH meter', 'acidic', 'alkaline', 'neutral'],
  },
  {
    slug: 'c1-acids-alkalis-strength', unit: 'C1', title: 'Hydrogen and hydroxide ions; strong, weak, dilute and concentrated',
    outcomeIds: ['1.8.3', '1.8.4', '1.8.5', '1.8.6', '1.8.7', '1.8.8'], practicals: [], prerequisites: ['c1-indicators-and-ph', 'c1-ionic-bonding'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'H', 'Ranking solutions by hydrogen-ion concentration from pH values was weak (lower pH = higher H+ concentration).'),
      ev('Summer 2025', 'C2', 'H', 'A weak acid is one that is partially ionised - do not define it by pH.'),
    ],
    mustRecall: [
      'Acids produce H+(aq) ions in water; alkalis produce OH-(aq) ions.',
      'Strong acids (HCl, H2SO4, HNO3) and strong alkalis (NaOH, KOH) are completely ionised; weak acids (ethanoic, carbonic) and weak alkalis (ammonia) are partially ionised.',
      'Higher: the higher the H+ concentration, the lower the pH; dilute/concentrated describe the amount of substance in a volume of solution.',
    ],
    phet: [P.acidBase], video: [], bitesize: bb('zfddcqt', 'zn49s82'),
    keywords: ['hydrogen ion', 'hydroxide ion', 'strong acid', 'weak acid', 'ionised', 'dilute', 'concentrated', 'hydrochloric acid', 'sulfuric acid', 'nitric acid', 'ethanoic acid', 'ammonia'],
  },
  {
    slug: 'c1-neutralisation-and-bases', unit: 'C1', title: 'Neutralisation, bases and alkalis',
    outcomeIds: ['1.8.9', '1.8.10', '1.8.11'], practicals: [], prerequisites: ['c1-acids-alkalis-strength', 'c1-word-and-balanced-equations'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Neutralisation: H+(aq) + OH-(aq) -> H2O(l); it is exothermic (heat given out).',
      'A base is a metal oxide or hydroxide that neutralises an acid to give a salt and water; an alkali is a soluble base.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zn49s82'),
    keywords: ['neutralisation', 'base', 'alkali', 'exothermic', 'ionic equation', 'salt and water'],
  },
  {
    slug: 'c1-reactions-of-acids', unit: 'C1', title: 'Reactions of acids with metals, bases, carbonates; hydrogen and CO2 tests',
    outcomeIds: ['1.8.12', '1.8.13', '1.8.14'], practicals: [], prerequisites: ['c1-neutralisation-and-bases'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'Products of MgO + HCl given as oxygen/hydrogen instead of magnesium chloride and water; acids, bases and salts among the worst-answered areas.'),
      ev('March 2026', 'C1', 'F', 'Observations lacked detail: "colourless solution forms", "fizzing", "heat given out".'),
    ],
    mustRecall: [
      'acid + metal -> salt + hydrogen; acid + base -> salt + water; acid + carbonate -> salt + water + carbon dioxide; acid + hydrogencarbonate -> salt + water + carbon dioxide.',
      'Hydrochloric acid gives chlorides, sulfuric acid sulfates, nitric acid nitrates.',
      'Hydrogen test: lighted splint gives a squeaky pop. Carbon dioxide test: limewater turns from colourless to milky.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zn49s82'),
    keywords: ['acid + metal', 'acid + base', 'acid + carbonate', 'hydrogencarbonate', 'lighted splint', 'limewater', 'observations', 'effervescence'],
  },
  {
    slug: 'c1-salts-and-lab-safety', unit: 'C1', title: 'Salts, their colours and GHS/CLP hazard symbols',
    outcomeIds: ['1.8.15', '1.8.16', '1.8.17'], practicals: ['C1'], prerequisites: ['c1-reactions-of-acids'], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'U7A', 'F', '"Exothermic" is a deduction, not an observation; masses recorded to 2 d.p.; "cloudy" not accepted for a colour change.'),
    ],
    mustRecall: [
      'A salt is formed when some or all of the hydrogen ions in an acid are replaced by metal or ammonium ions.',
      'Group 1, Group 2, aluminium and zinc salts are white and give colourless solutions; transition-metal salts are coloured.',
      'Hazard symbols: toxic, corrosive, flammable, explosive, caution (GHS/CLP).',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zn49s82'),
    keywords: ['salt', 'ammonium', 'white salt', 'coloured salt', 'hazard symbol', 'toxic', 'corrosive', 'flammable', 'Prescribed Practical C1'],
  },
  {
    slug: 'c1-purity-and-formulations', unit: 'C1', title: 'Pure substances, mixtures, formulations and solution vocabulary',
    outcomeIds: ['1.9.1', '1.9.2', '1.9.3', '1.9.4'], practicals: [], prerequisites: [], difficulty: 1,
    examinerEvidence: [],
    mustRecall: [
      'A pure substance is a single element or compound not mixed with anything else; pure substances melt and boil at specific temperatures, mixtures over a range.',
      'A formulation is a mixture designed as a useful product from measured quantities (alloys, medicines, fertilisers).',
      'Vocabulary: soluble, insoluble, solute, solvent, solution, residue, filtrate, distillate, miscible, immiscible, evaporation, condensation.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zqfy239'),
    keywords: ['pure substance', 'mixture', 'formulation', 'solute', 'solvent', 'residue', 'filtrate', 'distillate', 'miscible', 'immiscible'],
  },
  {
    slug: 'c1-separating-mixtures-chromatography', unit: 'C1', title: 'Separating mixtures, paper chromatography and Rf values',
    outcomeIds: ['1.9.5', '1.9.6', '1.9.7', '1.9.8', '1.9.9'], practicals: [], prerequisites: ['c1-purity-and-formulations'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C1', 'F', 'The "solvent front" was unknown; Rf values must use the distance moved by the solvent front.'),
    ],
    mustRecall: [
      'Filtration (insoluble solid), crystallisation (solid from solution), simple distillation (solvent from solution), fractional distillation (miscible liquids, e.g. ethanol and water), paper chromatography (soluble substances).',
      'Chromatography: mobile phase (solvent) moves through the stationary phase (paper); Rf = distance moved by substance / distance moved by solvent front.',
      'Anhydrous copper(II) sulfate turns from white to blue in the presence of water.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zqfy239'),
    keywords: ['filtration', 'crystallisation', 'distillation', 'fractional distillation', 'chromatography', 'mobile phase', 'stationary phase', 'Rf value', 'solvent front', 'anhydrous copper(II) sulfate'],
  },
  {
    slug: 'c1-flame-tests', unit: 'C1', title: 'Flame tests for metal ions',
    outcomeIds: ['1.9.10', '1.9.11'], practicals: ['C2'], prerequisites: ['c1-ionic-bonding'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Method: clean a nichrome wire in concentrated hydrochloric acid, dip in the sample, hold in a blue Bunsen flame.',
      'Lithium crimson; sodium yellow/orange; potassium lilac; calcium brick red; copper(II) blue-green.',
    ],
    phet: [], video: [], bitesize: bb('zfddcqt', 'zqfy239'),
    keywords: ['flame test', 'nichrome wire', 'concentrated hydrochloric acid', 'crimson', 'lilac', 'brick red', 'blue-green', 'Prescribed Practical C2'],
  },
);

// ---------------------------------------------------------------------------
// C2 Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry
// ---------------------------------------------------------------------------
topics.push(
  {
    slug: 'c2-reactivity-series', unit: 'C2', title: 'The reactivity series and reactions of metals with air, water and steam',
    outcomeIds: ['2.1.1', '2.1.2', '2.1.3'], practicals: [], prerequisites: ['c1-group-1-alkali-metals', 'c1-word-and-balanced-equations'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'Purpose of damp mineral wool in the Mg + steam experiment not known; MgO (steam) confused with Mg(OH)2 (water).'),
    ],
    mustRecall: [
      'Reactivity series: K, Na, Ca, Mg, Al, Zn, Fe, Cu (most to least reactive).',
      'K, Na, Ca react with cold water -> hydroxide + hydrogen; Mg, Zn, Fe react with steam -> oxide + hydrogen; Cu does not react.',
      'Reactivity is the tendency of a metal to form its positive ion; hydrogen is collected over water or by upward delivery / gas syringe.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zcwqg2p'),
    keywords: ['reactivity series', 'potassium', 'sodium', 'calcium', 'magnesium', 'steam', 'metal oxide', 'metal hydroxide', 'hydrogen collection'],
  },
  {
    slug: 'c2-displacement-and-extraction', unit: 'C2', title: 'Displacement reactions and extraction of metals from ores',
    outcomeIds: ['2.1.4', '2.1.5', '2.1.6'], practicals: ['C3'], prerequisites: ['c2-reactivity-series'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'A more reactive metal displaces a less reactive metal from a solution of its salt, e.g. Zn + CuSO4 -> ZnSO4 + Cu (blue solution fades, brown solid forms, temperature rises).',
      'Metals above carbon (Al and above) are extracted by electrolysis; less reactive metals such as iron by chemical reduction with carbon.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zcwqg2p'),
    keywords: ['displacement', 'copper sulfate', 'ore', 'extraction', 'electrolysis', 'reduction', 'Prescribed Practical C3'],
  },
  {
    slug: 'c2-redox', unit: 'C2', title: 'Oxidation and reduction (oxygen, hydrogen and electron transfer)',
    outcomeIds: ['2.2.1', '2.2.2'], practicals: [], prerequisites: ['c1-ionic-and-half-equations', 'c2-displacement-and-extraction'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'Half equation Fe -> Fe3+ + 3e- often had electrons on the wrong side or the wrong number.'),
      ev('Summer 2024', 'C2', 'H', 'Redox and ionic equations remain weak.'),
    ],
    mustRecall: [
      'Oxidation = gain of oxygen or loss of hydrogen; reduction = loss of oxygen or gain of hydrogen.',
      'Higher: OIL RIG - oxidation is loss of electrons, reduction is gain of electrons; identify the oxidised and reduced species in symbol, ionic and half equations.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zyc9s82'),
    keywords: ['oxidation', 'reduction', 'redox', 'OIL RIG', 'electron transfer', 'oxidising agent', 'reducing agent'],
  },
  {
    slug: 'c2-rusting-and-iron', unit: 'C2', title: 'Rusting, its prevention and the extraction of iron',
    outcomeIds: ['2.2.3', '2.2.4', '2.2.5', '2.2.6'], practicals: [], prerequisites: ['c2-redox', 'c2-reactivity-series'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'Galvanising must be described as coating with zinc.'),
    ],
    mustRecall: [
      'Rusting needs iron, water and air (oxygen); rust is hydrated iron(III) oxide.',
      'Prevention: barrier methods (paint, oil, plastic coating, galvanising = zinc coating) and sacrificial protection (a more reactive metal such as Zn or Mg corrodes instead).',
      'Blast furnace: C + O2 -> CO2; CO2 + C -> 2CO (reducing agent, Higher); Fe2O3 + 3CO -> 2Fe + 3CO2; limestone removes acidic impurities as slag (Higher). Iron is used in bridges and structures for its strength.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zyc9s82'),
    keywords: ['rusting', 'hydrated iron(III) oxide', 'galvanising', 'sacrificial protection', 'haematite', 'blast furnace', 'carbon monoxide', 'reducing agent', 'slag'],
  },
  {
    slug: 'c2-measuring-rates', unit: 'C2', title: 'Measuring rates of reaction and interpreting rate graphs',
    outcomeIds: ['2.3.1', '2.3.2', '2.3.3'], practicals: ['C4'], prerequisites: ['c1-reactions-of-acids'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'Rate sketch graphs must level off at the same final mass/volume when the same amount of limiting reactant is used.'),
      ev('Summer 2024', 'C2', 'F', 'Rate curves drawn with two lines or wrong start/finish points.'),
      ev('Summer 2025', 'U7B', 'F', '"Gas syringe" and "conical flask" misnamed or misspelt; total gas volume read by summing table values; x-axis label omitted.'),
    ],
    mustRecall: [
      'rate = 1 / time.',
      'Methods: change in mass (balance), gas volume (gas syringe or inverted measuring cylinder), time for a precipitate to obscure a cross (sodium thiosulfate + acid).',
      'Reactions: metal + dilute acid; marble chips + hydrochloric acid; catalytic decomposition of hydrogen peroxide; sodium thiosulfate + acid.',
      'Gradient of a volume-time graph = rate; the curve levels off when a reactant is used up.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'z8m6khv'),
    keywords: ['rate of reaction', 'gas syringe', 'mass loss', 'precipitate', 'sodium thiosulfate', 'marble chips', 'hydrogen peroxide', 'rate graph', 'gradient', 'Prescribed Practical C4'],
  },
  {
    slug: 'c2-collision-theory-catalysts', unit: 'C2', title: 'Collision theory: temperature, concentration, surface area and catalysts',
    outcomeIds: ['2.3.4', '2.3.5', '2.3.6'], practicals: [], prerequisites: ['c2-measuring-rates'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'Say "fewer successful collisions per unit time", not "less collisions"; catalyst effect confused with its definition; MnO2 as the catalyst for H2O2 not recalled.'),
    ],
    mustRecall: [
      'Higher: higher temperature -> particles have more energy and collide more often with more energy -> more successful collisions per unit time.',
      'Higher: higher concentration or smaller particle size (larger surface area to volume ratio) -> more frequent collisions.',
      'A catalyst increases the rate without being used up; transition metals and their compounds are often catalysts (e.g. MnO2 for H2O2). Higher: it provides an alternative pathway of lower activation energy.',
    ],
    phet: [P.diffusion], video: [], bitesize: bb('zb22d6f', 'z8m6khv'),
    keywords: ['collision theory', 'successful collisions', 'activation energy', 'temperature', 'concentration', 'surface area', 'particle size', 'catalyst', 'manganese(IV) oxide'],
  },
  {
    slug: 'c2-equilibrium', unit: 'C2', title: 'Reversible reactions and dynamic equilibrium',
    outcomeIds: ['2.4.1', '2.4.2'], practicals: [], prerequisites: ['c2-collision-theory-catalysts'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'Meaning of "reversible" not explained; only temperature named as a condition that can change the direction.'),
      ev('Summer 2025', 'C2', 'H', 'Effect of temperature on the position of equilibrium poorly explained.'),
    ],
    mustRecall: [
      'A reversible reaction can go in both directions; changing conditions (temperature, pressure, concentration) changes the direction, e.g. hydrated copper(II) sulfate (blue) <-> anhydrous (white) + water.',
      'Higher: dynamic equilibrium occurs in a closed system when the forward and reverse rates are equal and the amounts of reactants and products stay constant.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zkm6khv'),
    keywords: ['reversible reaction', 'dynamic equilibrium', 'closed system', 'forward reaction', 'reverse reaction', 'reaction conditions'],
  },
  {
    slug: 'c2-homologous-series-alkanes', unit: 'C2', title: 'Homologous series, hydrocarbons and the alkanes',
    outcomeIds: ['2.5.1', '2.5.2', '2.5.3', '2.5.4'], practicals: [], prerequisites: ['c1-covalent-bonding'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'C2', 'F', '"Organic chemistry continues to be the topic with which candidates struggle": general formulae, naming and drawing full structural formulae.'),
    ],
    mustRecall: [
      'Homologous series: same general formula, similar chemical properties, gradation in physical properties, differ by CH2.',
      'Hydrocarbon: a compound of hydrogen and carbon only.',
      'Alkanes CnH2n+2: methane CH4, ethane C2H6, propane C3H8, butane C4H10 - all gases at room temperature; draw full structural formulae showing every bond.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmfvmbk'),
    keywords: ['homologous series', 'hydrocarbon', 'alkane', 'general formula', 'methane', 'ethane', 'propane', 'butane', 'structural formula', 'saturated'],
  },
  {
    slug: 'c2-crude-oil-fractional-distillation', unit: 'C2', title: 'Crude oil, fractional distillation and cracking',
    outcomeIds: ['2.5.5', '2.5.6', '2.5.7', '2.5.8'], practicals: [], prerequisites: ['c2-homologous-series-alkanes', 'c1-separating-mixtures-chromatography'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'C2', 'F', 'Description of fractional distillation of crude oil was weak.'),
    ],
    mustRecall: [
      'Crude oil is a finite resource, the main source of hydrocarbons and the feedstock of the petrochemical industry.',
      'Fractional distillation: oil is vaporised, the column is cooler at the top; fractions condense at different heights according to boiling point.',
      'Fractions and uses: refinery gases (bottled gas), petrol (cars), naphtha (chemicals and plastics), kerosene (aircraft), diesel (cars and trains), fuel oils (ships), bitumen (roads and roofs).',
      'Cracking breaks large saturated alkanes into smaller, more useful molecules, some unsaturated (alkenes).',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmfvmbk'),
    keywords: ['crude oil', 'fractional distillation', 'fraction', 'refinery gases', 'naphtha', 'kerosene', 'bitumen', 'cracking', 'boiling point'],
  },
  {
    slug: 'c2-combustion-and-pollution', unit: 'C2', title: 'Complete and incomplete combustion; pollution from fuels',
    outcomeIds: ['2.5.9', '2.5.10', '2.5.11', '2.5.26'], practicals: [], prerequisites: ['c2-homologous-series-alkanes', 'c1-word-and-balanced-equations'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'Formulae of the products of methane combustion given as names instead of CO2 and H2O.'),
    ],
    mustRecall: [
      'Complete combustion: alkane + oxygen -> carbon dioxide + water (CH4 + 2O2 -> CO2 + 2H2O); test products with limewater and anhydrous copper(II) sulfate.',
      'Incomplete combustion (limited oxygen): carbon monoxide + water, sometimes carbon (soot).',
      'Carbon monoxide is toxic: it binds to haemoglobin and reduces oxygen transport.',
      'Pollution: CO2 -> greenhouse effect, climate change, sea-level rise; CO and soot -> lung damage; sulfur impurities -> SO2 -> acid rain (buildings, vegetation, fish).',
    ],
    phet: [P.greenhouse], video: [], bitesize: bb('zb22d6f', 'zmfvmbk'),
    keywords: ['complete combustion', 'incomplete combustion', 'carbon monoxide', 'soot', 'greenhouse effect', 'acid rain', 'sulfur dioxide', 'haemoglobin'],
  },
  {
    slug: 'c2-alkenes', unit: 'C2', title: 'Alkenes, functional groups, addition reactions and the bromine-water test',
    outcomeIds: ['2.5.12', '2.5.13', '2.5.14', '2.5.15', '2.5.16'], practicals: [], prerequisites: ['c2-homologous-series-alkanes'], difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'Alkene general formula CnH2n not recognised; functional group circled with H atoms included; naming propene.'),
      ev('Summer 2024', 'C2', 'F', 'Organic naming and structures remain the weakest topic.'),
    ],
    mustRecall: [
      'Alkenes CnH2n: ethene C2H4, propene C3H6, but-1-ene and but-2-ene C4H8 (gases); functional group C=C (unsaturated).',
      'A functional group is the reactive group in a molecule; alkanes have none so are less reactive.',
      'Higher: ethene + bromine -> dibromoethane; ethene + hydrogen -> ethane (nickel catalyst); ethene + steam -> ethanol.',
      'Bromine water test: orange -> colourless with an alkene (C=C present); no change with an alkane.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmfvmbk'),
    keywords: ['alkene', 'ethene', 'propene', 'but-1-ene', 'but-2-ene', 'C=C', 'unsaturated', 'functional group', 'addition reaction', 'bromine water'],
  },
  {
    slug: 'c2-addition-polymerisation', unit: 'C2', title: 'Addition polymerisation',
    outcomeIds: ['2.5.17', '2.5.18', '2.5.19'], practicals: [], prerequisites: ['c2-alkenes'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'Naming poly(ethene) from its monomer was poorly done.'),
    ],
    mustRecall: [
      'Monomers (ethene, chloroethene) join to form long-chain polymers by addition polymerisation: poly(ethene), poly(chloroethene) / PVC.',
      'Higher: n C2H4 -> -(CH2-CH2)-n ; draw the repeat unit with brackets, n and extending bonds; deduce monomer from polymer and vice versa.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmfvmbk'),
    keywords: ['monomer', 'polymer', 'addition polymerisation', 'poly(ethene)', 'poly(chloroethene)', 'PVC', 'repeat unit'],
  },
  {
    slug: 'c2-alcohols-fermentation', unit: 'C2', title: 'Alcohols, their combustion and fermentation',
    outcomeIds: ['2.5.20', '2.5.21', '2.5.22'], practicals: [], prerequisites: ['c2-alkenes', 'b1-anaerobic-respiration'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2024', 'C2', 'H', 'Organic chemistry (general formulae, naming, drawing full structural formulae) is the topic candidates struggle with most; alcohol names and structures are Higher-only recall.'),
    ],
    mustRecall: [
      'Higher: alcohols CnH2n+1OH with the -OH functional group: methanol CH3OH, ethanol C2H5OH, propan-1-ol, propan-2-ol (liquids).',
      'Higher: complete combustion of an alcohol gives CO2 and water; incomplete gives CO (and C) and water.',
      'Fermentation: sugar solution + yeast, 25-37 deg C, anaerobic (air excluded), yeast enzymes convert sugar to ethanol and carbon dioxide.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmfvmbk'),
    keywords: ['alcohol', 'methanol', 'ethanol', 'propan-1-ol', 'propan-2-ol', 'hydroxyl group', 'fermentation', 'yeast', 'anaerobic'],
  },
  {
    slug: 'c2-carboxylic-acids', unit: 'C2', title: 'Carboxylic acids as weak acids and their reactions',
    outcomeIds: ['2.5.23', '2.5.24', '2.5.25'], practicals: [], prerequisites: ['c2-alcohols-fermentation', 'c1-reactions-of-acids'], difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'Naming copper(II) ethanoate; weak acid means partial ionisation (not low pH).'),
      ev('Summer 2024', 'C2', 'H', 'Carboxylic acid + base equations weak.'),
    ],
    mustRecall: [
      'Higher: methanoic HCOOH, ethanoic CH3COOH, propanoic C2H5COOH, butanoic C3H7COOH (liquids); functional group -COOH.',
      'Carboxylic acids are weak acids: only partially ionised in solution.',
      'Reactions: with carbonates -> salt (ethanoate) + water + CO2; with hydroxides -> salt + water; with metals -> salt + hydrogen, e.g. 2CH3COOH + Mg -> (CH3COO)2Mg + H2.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmfvmbk'),
    keywords: ['carboxylic acid', 'methanoic acid', 'ethanoic acid', 'propanoic acid', 'butanoic acid', 'weak acid', 'partially ionised', 'ethanoate'],
  },
  {
    slug: 'c2-hydrated-salts-water-of-crystallisation', unit: 'C2', title: 'Empirical formulae, hydrated salts and water of crystallisation',
    outcomeIds: ['2.6.1', '2.6.2', '2.6.3', '2.6.4'], practicals: ['C5'], prerequisites: ['c1-formula-mass-and-moles'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'Mr of C2H2O4.2H2O given as 110 instead of 126; apparatus for dehydrating a hydrate poorly drawn.'),
      ev('Summer 2025', 'U7B', 'H', 'Mass of water -> moles of water; Mr of hydrated CuSO4; colour change on heating hydrated copper(II) sulfate (blue -> white).'),
      ev('Summer 2025', 'U7A', 'F', 'Anhydrous MgSO4 is a white powder, not crystals; heating hydrated magnesium sulfate to constant mass.'),
    ],
    mustRecall: [
      'Empirical formula: simplest whole-number ratio of atoms; molecular formula: actual numbers of atoms.',
      'Hydrated salts contain water of crystallisation (e.g. CuSO4.5H2O, blue); anhydrous = water removed (white); heat to constant mass to be sure all water is driven off.',
      'Mr of a hydrate includes the water (CuSO4.5H2O = 160 + 90 = 250).',
      'Higher: moles of salt : moles of water from masses gives the degree of hydration x.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zsc9s82'),
    keywords: ['empirical formula', 'molecular formula', 'hydrated', 'anhydrous', 'water of crystallisation', 'heating to constant mass', 'degree of hydration', 'Prescribed Practical C5'],
  },
  {
    slug: 'c2-concentration-atom-economy', unit: 'C2', title: 'Concentration of solutions and atom economy',
    outcomeIds: ['2.6.5', '2.6.6', '2.6.7', '2.6.8'], practicals: [], prerequisites: ['c1-reacting-masses-and-yield'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'Mass of solute needed for a 2.0 mol/dm3 solution; sustainability arguments for a preparation route.'),
    ],
    mustRecall: [
      'Higher: concentration (mol/dm3) = moles / volume (dm3); 1 dm3 = 1000 cm3.',
      'Higher: moles = concentration x volume (dm3); mass = moles x Mr.',
      'Higher: atom economy = (mass of desired product / total mass of products) x 100; high atom economy is important for sustainable development and economic reasons.',
    ],
    phet: [P.concentration], video: [VID.chemChicken], bitesize: bb('zb22d6f', 'zsc9s82'),
    keywords: ['concentration', 'mol/dm3', 'volume', 'moles in solution', 'atom economy', 'sustainable development'],
  },
  {
    slug: 'c2-electrolysis-molten-salts', unit: 'C2', title: 'Electrolysis of molten salts and electrode half equations',
    outcomeIds: ['2.7.1', '2.7.2', '2.7.3'], practicals: [], prerequisites: ['c1-ionic-and-molecular-structures', 'c1-ionic-and-half-equations'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'Definition of electrolysis must include "decomposed" (by electricity).'),
      ev('Summer 2025', 'C2', 'H', 'Bromine forms as a red-brown gas/vapour at the anode.'),
      ev('Summer 2025', 'U7B', 'H', 'Labelling the anode; toxic-gas electrolysis must be done in a fume cupboard; anode half equation for molten LiCl.'),
    ],
    mustRecall: [
      'Electrolysis: decomposition of a molten or dissolved ionic compound by passing electricity through it; electrolyte conducts because ions move and carry charge; inert (graphite) electrodes; anode positive, cathode negative.',
      'Molten LiCl: lithium (silvery liquid) at the cathode, chlorine (pale green gas) at the anode. Molten PbBr2: lead (silvery bead) at the cathode, bromine (red-brown vapour) at the anode.',
      'Higher: cathode Li+ + e- -> Li; Pb2+ + 2e- -> Pb; anode 2Cl- -> Cl2 + 2e-; 2Br- -> Br2 + 2e-; aluminium: Al3+ + 3e- -> Al, 2O2- -> O2 + 4e-.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmgwb7h'),
    keywords: ['electrolysis', 'electrolyte', 'anode', 'cathode', 'inert electrode', 'lithium chloride', 'lead(II) bromide', 'half equation', 'fume cupboard'],
  },
  {
    slug: 'c2-aluminium-extraction', unit: 'C2', title: 'Industrial extraction and recycling of aluminium',
    outcomeIds: ['2.7.4', '2.7.5'], practicals: [], prerequisites: ['c2-electrolysis-molten-salts', 'c2-displacement-and-extraction'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'F', 'QWC on aluminium extraction: bauxite/haematite confused; cryolite lowers the melting point of Al2O3 (not of Al); boiling vs melting point; anode reaction C + O2 -> CO2 omitted.'),
    ],
    mustRecall: [
      'Alumina (Al2O3) is purified from the ore bauxite and dissolved in molten cryolite to lower the melting point; electrolysed with graphite electrodes.',
      'Aluminium forms at the cathode; oxygen at the anode reacts with the graphite (C + O2 -> CO2) so the anodes burn away and must be replaced periodically.',
      'Recycling aluminium uses only a fraction of the energy of extraction and saves waste.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zmgwb7h'),
    keywords: ['aluminium', 'bauxite', 'alumina', 'cryolite', 'anode replacement', 'recycling', 'electrolysis'],
  },
  {
    slug: 'c2-energy-changes', unit: 'C2', title: 'Exothermic and endothermic reactions, reaction profiles and bond energies',
    outcomeIds: ['2.8.1', '2.8.2', '2.8.3', '2.8.4', '2.8.5'], practicals: [], prerequisites: ['c1-neutralisation-and-bases', 'c1-covalent-bonding'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'C2', 'H', 'Energy profiles and bond-enthalpy calculations were well done - keep drilling the method.'),
    ],
    mustRecall: [
      'Exothermic: heat given out (temperature rises); endothermic: heat taken in.',
      'Higher: reaction profile shows reactants, products, activation energy (minimum energy for a reaction to occur) and the overall energy change.',
      'Higher: bond breaking takes in energy, bond making releases energy; energy change = energy of bonds broken - energy of bonds made (negative = exothermic).',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'zsd68p3'),
    keywords: ['exothermic', 'endothermic', 'reaction profile', 'activation energy', 'bond energy', 'bond breaking', 'bond making'],
  },
  {
    slug: 'c2-atmosphere-nitrogen-ammonia', unit: 'C2', title: 'The atmosphere, nitrogen and the ammonia test',
    outcomeIds: ['2.9.1', '2.9.2', '2.9.3', '2.9.4'], practicals: [], prerequisites: ['c1-covalent-bonding', 'c1-reactions-of-acids'], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'Sustainability of an ammonia-based preparation was poorly argued.'),
    ],
    mustRecall: [
      'Air: about 78% nitrogen, 21% oxygen, 0.03-0.04% carbon dioxide, 1% argon, traces of other noble gases and varying water vapour.',
      'Nitrogen is a colourless, odourless, unreactive gas because of its triple covalent bond; used as a coolant (liquid nitrogen) and in food packaging.',
      'Higher: ammonia test - a glass rod dipped in concentrated hydrochloric acid gives white smoke (ammonium chloride); ammonia + acids make fertilisers.',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'z32s7v4'),
    keywords: ['atmosphere', 'nitrogen', 'triple bond', 'argon', 'ammonia', 'ammonia test', 'fertiliser', 'food packaging', 'coolant'],
  },
  {
    slug: 'c2-hydrogen-oxygen-preparation', unit: 'C2', title: 'Preparing hydrogen and oxygen; reactions of elements with oxygen',
    outcomeIds: ['2.9.5', '2.9.6', '2.9.7'], practicals: [], prerequisites: ['c2-reactivity-series', 'c1-reactions-of-acids'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'C2', 'H', 'MnO2 as the catalyst for hydrogen peroxide not recalled; SO2 + O2 equation weak.'),
      ev('Summer 2024', 'C2', 'F', 'Apparatus names (delivery tube, gas jar) and 2-D apparatus diagrams weak.'),
    ],
    mustRecall: [
      'Hydrogen: zinc + dilute hydrochloric acid, collect over water; colourless, odourless, less dense than air, insoluble; uses: weather balloons, hardening oils, clean fuel.',
      'Oxygen: hydrogen peroxide with manganese(IV) oxide catalyst, collect over water; test: relights a glowing splint; uses: medicine, welding.',
      'With oxygen: carbon -> CO2 (acidic), sulfur -> SO2 (acidic, blue flame), magnesium -> MgO (basic, bright white flame), iron -> iron oxide (basic, sparks), copper -> CuO (basic, black).',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'z32s7v4'),
    keywords: ['hydrogen preparation', 'oxygen preparation', 'hydrogen peroxide', 'manganese(IV) oxide', 'glowing splint', 'acidic oxide', 'basic oxide', 'collection over water'],
  },
  {
    slug: 'c2-carbon-dioxide-preparation', unit: 'C2', title: 'Preparing carbon dioxide and its reactions with water and limewater',
    outcomeIds: ['2.9.8', '2.9.9'], practicals: ['C6'], prerequisites: ['c1-reactions-of-acids'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'C2', 'F', 'Gas-preparation apparatus (thistle funnel, delivery tube, gas jar) not named or drawn correctly.'),
    ],
    mustRecall: [
      'CO2: calcium carbonate + hydrochloric acid, collect by downward delivery (denser than air) or over water; uses: fizzy drinks, fire extinguishers.',
      'CO2 + water -> carbonic acid (weakly acidic, pH about 5-6).',
      'CO2 + limewater: Ca(OH)2 + CO2 -> CaCO3 + H2O (milky); with excess CO2 the precipitate redissolves: CaCO3 + H2O + CO2 -> Ca(HCO3)2 (colourless).',
    ],
    phet: [], video: [], bitesize: bb('zb22d6f', 'z32s7v4'),
    keywords: ['carbon dioxide preparation', 'calcium carbonate', 'downward delivery', 'carbonic acid', 'limewater', 'calcium hydrogencarbonate', 'excess carbon dioxide', 'Prescribed Practical C6'],
  },
);

// ---------------------------------------------------------------------------
// P1 Motion, Force, Moments, Energy, Density, Kinetic Theory, Radioactivity, Nuclear Fission and Fusion
// ---------------------------------------------------------------------------
topics.push(
  {
    slug: 'p1-speed-equations', unit: 'P1', title: 'Average speed, rate of change of speed and the ramp practical',
    outcomeIds: ['1.1.1'], practicals: ['P1'], prerequisites: [], difficulty: 2,
    examinerEvidence: [
      ev('March 2026', 'P1', 'F', 'Physics: always write the equation before substituting; a wrong equation with a correct number scores nothing.'),
    ],
    mustRecall: [
      'average speed = distance moved / time taken (m/s).',
      'average speed = (initial speed + final speed) / 2.',
      'rate of change of speed = (final speed - initial speed) / time taken (m/s2).',
      'Practical P1: average speed of a trolley/ball-bearing down a runway against the height of the raised end.',
    ],
    phet: [], video: [], bitesize: bb('zjyyhbk', 'zht36rd'),
    keywords: ['average speed', 'distance', 'time', 'rate of change of speed', 'm/s', 'm/s2', 'ramp', 'Prescribed Practical P1'],
  },
  {
    slug: 'p1-vectors-velocity-acceleration', unit: 'P1', title: 'Vectors and scalars; velocity, acceleration and retardation',
    outcomeIds: ['1.1.2', '1.1.3', '1.1.4'], practicals: [], prerequisites: ['p1-speed-equations'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'A vector depends on direction (displacement, velocity, acceleration); a scalar does not (distance, speed, rate of change of speed).',
      'v = d / t (average velocity = displacement / time); average velocity = (u + v) / 2.',
      'a = (v - u) / t; negative acceleration is called retardation.',
    ],
    phet: [], video: [], bitesize: bb('zjyyhbk', 'z338vj6'),
    keywords: ['vector', 'scalar', 'displacement', 'velocity', 'acceleration', 'retardation'],
  },
  {
    slug: 'p1-motion-graphs', unit: 'P1', title: 'Distance-time, speed-time, displacement-time and velocity-time graphs',
    outcomeIds: ['1.1.5', '1.1.6'], practicals: [], prerequisites: ['p1-speed-equations'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'H', '"Constant speed" given for a sloping section of a velocity-time graph (it shows constant acceleration).'),
      ev('March 2026', 'P1', 'F', 'Distance-time graphs were well prepared.'),
    ],
    mustRecall: [
      'Gradient of a distance-time graph = speed; gradient of a speed-time graph = rate of change of speed; area under a speed-time graph = distance moved.',
      'Higher: gradient of a displacement-time graph = velocity; gradient of a velocity-time graph = acceleration; area under a velocity-time graph = displacement.',
    ],
    phet: [], video: [], bitesize: bb('zjyyhbk', 'zggwb7h'),
    keywords: ['distance-time graph', 'speed-time graph', 'velocity-time graph', 'gradient', 'area under graph', 'displacement-time graph'],
  },
  {
    slug: 'p1-forces-and-resultant', unit: 'P1', title: 'Forces in pairs, friction and resultant force',
    outcomeIds: ['1.2.1', '1.2.2', '1.2.3'], practicals: [], prerequisites: [], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Forces arise between objects in equal and opposite pairs; friction always opposes motion.',
      'Force is measured in newtons (N); forces in one direction are positive and in the opposite direction negative; resultant = sum of the signed forces.',
    ],
    phet: [P.forcesMotion, P.friction], video: [], bitesize: bb('zmggf4j', 'zbmx9ty'),
    keywords: ['force', 'newton', 'friction', 'resultant force', 'balanced forces', 'unbalanced forces'],
  },
  {
    slug: 'p1-newtons-laws', unit: 'P1', title: "Newton's first and second laws; F = ma",
    outcomeIds: ['1.2.4', '1.2.5', '1.2.6', '1.2.7'], practicals: [], prerequisites: ['p1-forces-and-resultant', 'p1-speed-equations'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'H', 'Newton II problems that first need the weight and then the upward force were poorly done.'),
    ],
    mustRecall: [
      "Newton's first law: in the absence of unbalanced forces an object continues to move in a straight line at constant speed.",
      "Newton's second law: a resultant force causes acceleration proportional to the resultant force.",
      'F = m x a (N, kg, m/s2).',
    ],
    phet: [P.forcesMotion], video: [], bitesize: bb('zmggf4j', 'zbmx9ty'),
    keywords: ["Newton's first law", "Newton's second law", 'resultant force', 'acceleration', 'mass', 'air track'],
  },
  {
    slug: 'p1-mass-weight-free-fall', unit: 'P1', title: 'Mass, weight and free fall',
    outcomeIds: ['1.2.8', '1.2.9', '1.2.10', '1.2.11'], practicals: [], prerequisites: ['p1-newtons-laws'], difficulty: 2,
    examinerEvidence: [
      ev('March 2026', 'P1', 'F', 'Definition of mass ("the amount of matter in an object") not recalled.'),
    ],
    mustRecall: [
      'Mass is the amount of matter in an object (kg); weight is the force due to gravity (N).',
      'W = m x g with g = 10 N/kg on Earth.',
      'All objects fall at the same rate without air resistance; speed increases by 10 m/s every second. Higher: acceleration of free fall g = 10 m/s2.',
    ],
    phet: [P.projectile], video: [], bitesize: bb('zmggf4j', 'z2dw3qt'),
    keywords: ['mass', 'weight', 'gravity', 'g = 10 N/kg', 'free fall', 'acceleration of free fall'],
  },
  {
    slug: 'p1-hookes-law', unit: 'P1', title: "Hooke's law and the spring constant",
    outcomeIds: ['1.2.12', '1.2.13'], practicals: ['P2'], prerequisites: ['p1-forces-and-resultant'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'F', "Full Hooke's law statement needed: extension directly proportional to force provided the limit of proportionality is not exceeded (\"elastic limit\" not accepted); spring constant calculations weak."),
      ev('Summer 2025', 'U7B', 'F', '"Directly proportional" wording and reasoning (straight line through the origin).'),
    ],
    mustRecall: [
      "Hooke's law: the extension of a spring is directly proportional to the force applied, provided the limit of proportionality is not exceeded.",
      'F = k x e (N, N/m or N/cm, m or cm); extension = stretched length - original length.',
      'Gradient of a force (y) against extension (x) graph = spring constant k.',
    ],
    phet: [P.hookesLaw, P.massesSprings], video: [], bitesize: bb('zmggf4j', 'z6q7rmn'),
    keywords: ["Hooke's law", 'extension', 'spring constant', 'limit of proportionality', 'directly proportional', 'Prescribed Practical P2'],
  },
  {
    slug: 'p1-pressure', unit: 'P1', title: 'Pressure = force / area',
    outcomeIds: ['1.2.14', '1.2.15', '1.2.16'], practicals: [], prerequisites: ['p1-forces-and-resultant'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Pressure is the force per unit area; 1 Pa = 1 N/m2.',
      'P = F / A (cm2 and mm2 may be used without converting to m2).',
      'Sharp knife: small area -> large pressure; caterpillar tracks: large area -> small pressure.',
    ],
    phet: [], video: [], bitesize: bb('zmggf4j', 'zt72cxs'),
    keywords: ['pressure', 'pascal', 'N/m2', 'area', 'knife edge', 'caterpillar tracks'],
  },
  {
    slug: 'p1-moments', unit: 'P1', title: 'Moment of a force and the Principle of Moments',
    outcomeIds: ['1.2.17', '1.2.18', '1.2.19'], practicals: ['P3'], prerequisites: ['p1-forces-and-resultant'], difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Unit (N m) and direction (clockwise/anticlockwise) of a moment "very poorly answered"; Principle of Moments statement omitted "about a point" / "in equilibrium"; forces subtracted instead of added in moment calculations.'),
    ],
    mustRecall: [
      'moment = force x perpendicular distance from the pivot (N m); state clockwise or anticlockwise.',
      'Principle of Moments: when an object is in equilibrium, the sum of the clockwise moments about a point equals the sum of the anticlockwise moments about that point.',
      'Use the principle to find an unknown weight or distance (no more than two forces, one of which may be the weight).',
    ],
    phet: [P.balancingAct], video: [], bitesize: bb('zmggf4j', 'zh2m46f'),
    keywords: ['moment', 'pivot', 'perpendicular distance', 'clockwise', 'anticlockwise', 'Principle of Moments', 'equilibrium', 'newton metre', 'Prescribed Practical P3'],
  },
  {
    slug: 'p1-centre-of-gravity-stability', unit: 'P1', title: 'Centre of gravity and stability',
    outcomeIds: ['1.2.20', '1.2.21', '1.2.22', '1.2.23'], practicals: [], prerequisites: ['p1-moments', 'p1-mass-weight-free-fall'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Centre of gravity definition must say where the whole weight "acts"; stability reasons given as "area" instead of base width and centre-of-gravity height.'),
    ],
    mustRecall: [
      'Centre of gravity: the point where all the weight of an object can be considered to act (centre of a disc, ring or rectangle).',
      'An object is more stable with a low centre of gravity and a wide base; it topples when the line of action of its weight falls outside the base (weight then has a turning effect).',
    ],
    phet: [], video: [], bitesize: bb('zmggf4j', 'zh2m46f'),
    keywords: ['centre of gravity', 'stability', 'base width', 'toppling', 'turning effect'],
  },
  {
    slug: 'p1-density-kinetic-theory', unit: 'P1', title: 'Density and kinetic theory',
    outcomeIds: ['1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5'], practicals: [], prerequisites: [], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Density of an irregular solid: displacement method (measuring cylinder or eureka can) missed; density written as m x V.'),
    ],
    mustRecall: [
      'density = mass / volume (g/cm3 or kg/m3); 1 g/cm3 = 1000 kg/m3.',
      'Irregular solid: measure mass on a balance; volume by displacement in a measuring cylinder or eureka can.',
      'Kinetic theory: solids have closely packed particles (dense), gases have widely spaced particles (low density); liquids in between.',
    ],
    phet: [P.density, P.statesBasics, P.gasProperties], video: [], bitesize: bb('zh99bdm', 'zyhpwsg'),
    keywords: ['density', 'mass', 'volume', 'displacement method', 'eureka can', 'kinetic theory', 'particles', 'states of matter'],
  },
  {
    slug: 'p1-energy-forms-conservation-efficiency', unit: 'P1', title: 'Forms of energy, conservation of energy and efficiency',
    outcomeIds: ['1.4.1', '1.4.2', '1.4.3', '1.4.4', '1.4.11', '1.4.12'], practicals: [], prerequisites: [], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'F', 'Power, weight and pressure given as forms of energy; loudspeaker energy change written backwards; input energy of a solar panel not identified.'),
      ev('Summer 2025', 'P2', 'F', 'Heat not identified as a form of energy.'),
    ],
    mustRecall: [
      'Forms: chemical, heat, electrical, sound, light, magnetic, strain, kinetic, gravitational potential.',
      'Principle of Conservation of Energy: energy can be changed from one form to another but the total amount does not change.',
      '1 J is roughly the energy needed to lift an apple 1 m.',
      'efficiency = useful output energy / total input energy (as a decimal or a percentage).',
    ],
    phet: [P.energyForms], video: [], bitesize: bb('zn88rj6', 'zpthdnb'),
    keywords: ['forms of energy', 'conservation of energy', 'joule', 'energy transfer diagram', 'efficiency', 'useful energy', 'wasted energy'],
  },
  {
    slug: 'p1-energy-resources', unit: 'P1', title: 'Renewable and non-renewable energy resources',
    outcomeIds: ['1.4.5', '1.4.6', '1.4.7', '1.4.8', '1.4.9', '1.4.10'], practicals: [], prerequisites: ['p1-energy-forms-conservation-efficiency'], difficulty: 2,
    examinerEvidence: [
      ev('March 2026', 'P1', 'F', 'Wood classed as non-renewable and nuclear as renewable.'),
    ],
    mustRecall: [
      'Renewable: will never run out or is replenished within a human lifetime - sunlight, wind, hydroelectric, tidal, waves, wood, geothermal; can cause habitat destruction or visual pollution.',
      'Non-renewable: finite supply - fossil fuels (oil, natural gas, coal) and nuclear (uranium ore); cause acid rain and global warming.',
    ],
    phet: [P.greenhouse], video: [], bitesize: bb('zn88rj6', 'zfnsqyc'),
    keywords: ['renewable', 'non-renewable', 'fossil fuel', 'nuclear', 'wind', 'hydroelectric', 'tidal', 'geothermal', 'acid rain', 'global warming'],
  },
  {
    slug: 'p1-work-and-power', unit: 'P1', title: 'Work done and power',
    outcomeIds: ['1.4.13', '1.4.14', '1.4.15', '1.4.16'], practicals: ['P4'], prerequisites: ['p1-forces-and-resultant', 'p1-energy-forms-conservation-efficiency'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'F', 'Work done calculations weak; power defined as energy, force or strength.'),
      ev('Summer 2025', 'P1', 'H', 'Definition of power was "the most challenging part" of the paper.'),
    ],
    mustRecall: [
      'Work is done when energy changes from one form to another: W = F x d (J, N, m).',
      'Power is the energy transferred (or work done) in one second; 1 W = 1 J/s.',
      'P = E / t and P = W / t.',
      'Practical P4: personal power = (weight x height climbed) / time.',
    ],
    phet: [], video: [], bitesize: bb('zn88rj6', 'zysf7v4'),
    keywords: ['work done', 'power', 'watt', 'joule per second', 'energy transferred', 'personal power', 'Prescribed Practical P4'],
  },
  {
    slug: 'p1-kinetic-and-potential-energy', unit: 'P1', title: 'Kinetic energy and gravitational potential energy',
    outcomeIds: ['1.4.17', '1.4.18', '1.4.19'], practicals: [], prerequisites: ['p1-work-and-power', 'p1-mass-weight-free-fall'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'F', '"Surprising lack" of recall of the kinetic-energy formula.'),
      ev('Summer 2025', 'P1', 'H', 'Mass left in grams in KE calculations; GPE value substituted wrongly when finding a height.'),
    ],
    mustRecall: [
      'Ek = 1/2 m v2 (J, kg, m/s) - convert g to kg first.',
      'Ep = m g h (J, kg, 10 N/kg, m).',
      'Falling object: GPE lost = KE gained (ignoring air resistance).',
    ],
    phet: [P.skatePark], video: [], bitesize: bb('zn88rj6', 'zvyvmbk'),
    keywords: ['kinetic energy', 'gravitational potential energy', 'Ek', 'Ep', 'unit conversion', 'energy transfer'],
  },
  {
    slug: 'p1-atom-nucleus-isotopes', unit: 'P1', title: 'Structure of the atom and nucleus; nuclide notation and isotopes',
    outcomeIds: ['1.5.1', '1.5.2', '1.5.3', '1.5.4'], practicals: [], prerequisites: ['c1-atomic-structure'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Proton +1 (mass 1), neutron 0 (mass 1), electron -1 (mass about 1/1840).',
      'Nuclide notation: mass number A (top) and atomic number Z (bottom) before the symbol; A - Z = neutrons.',
      'Isotopes: atoms of the same element (same Z) with different numbers of neutrons (different A).',
    ],
    phet: [P.buildNucleus, P.rutherford], video: [VID.nuclear], bitesize: bb('zv778xs', 'zbk68p3'),
    keywords: ['proton', 'neutron', 'electron', 'atomic number', 'mass number', 'nuclide notation', 'isotope'],
  },
  {
    slug: 'p1-radioactive-decay', unit: 'P1', title: 'Alpha, beta and gamma radiation; penetration and decay equations',
    outcomeIds: ['1.5.5', '1.5.6', '1.5.7', '1.5.8'], practicals: [], prerequisites: ['p1-atom-nucleus-isotopes'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'H', 'Beta-decay equations: atomic number must increase by one and the electron shown as [0,-1]e.'),
    ],
    mustRecall: [
      'Unstable nuclei disintegrate randomly and spontaneously, emitting alpha, beta or gamma radiation.',
      'Alpha = helium nucleus (2p + 2n), stopped by paper / a few cm of air. Beta = fast electron, stopped by thin aluminium / a few metres of air. Gamma = high-energy electromagnetic wave, reduced by thick lead.',
      'Higher: alpha decay A -> A-4, Z -> Z-2; beta decay A unchanged, Z -> Z+1; gamma decay leaves A and Z unchanged.',
    ],
    phet: [P.buildNucleus], video: [VID.nuclear], bitesize: bb('zv778xs', 'z97f239'),
    keywords: ['alpha', 'beta', 'gamma', 'radioactive', 'random', 'spontaneous', 'penetration', 'decay equation', 'helium nucleus'],
  },
  {
    slug: 'p1-background-radiation-dangers-safety', unit: 'P1', title: 'Background radiation, dangers of radiation and safe handling',
    outcomeIds: ['1.5.9', '1.5.10', '1.5.11', '1.5.12', '1.5.13'], practicals: [], prerequisites: ['p1-radioactive-decay'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Background activity is present without any source; subtract it from measured counts.',
      'Sources: cosmic rays, rocks and soil (radon - ventilate homes), food chain, medical X-rays, nuclear waste, weapons-test fallout.',
      'Radiation ionises atoms, damaging genetic material and possibly causing cancer; alpha is most dangerous inside the body, beta and gamma can penetrate the skin.',
      'Safe handling: protective clothing, tongs (distance), short exposure time, lead-lined containers.',
    ],
    phet: [], video: [VID.nuclear], bitesize: bb('zv778xs', 'zdx36rd'),
    keywords: ['background radiation', 'radon', 'cosmic rays', 'ionisation', 'cancer', 'tongs', 'lead-lined container', 'corrected count rate'],
  },
  {
    slug: 'p1-half-life', unit: 'P1', title: 'Half-life',
    outcomeIds: ['1.5.14'], practicals: [], prerequisites: ['p1-radioactive-decay'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'H', 'Half-life definitions lost the second mark: state what is halving (activity / number of undecayed nuclei).'),
    ],
    mustRecall: [
      'Half-life: the time taken for the activity (or the number of undecayed nuclei) of a radioactive source to fall to half its original value.',
      'From a graph: read the time for the activity to halve (after subtracting background); repeat halving for calculations.',
    ],
    phet: [], video: [VID.nuclear], bitesize: bb('zv778xs', 'z97f239'),
    keywords: ['half-life', 'activity', 'decay curve', 'undecayed nuclei', 'count rate'],
  },
  {
    slug: 'p1-uses-of-radioactivity', unit: 'P1', title: 'Uses of radioactivity and choosing a half-life',
    outcomeIds: ['1.5.15', '1.5.16'], practicals: [], prerequisites: ['p1-half-life', 'p1-background-radiation-dangers-safety'], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Tracers (gamma emitter to find pipe leaks; organ monitoring), thickness control of metal sheet (beta), sterilising syringes (gamma), smoke alarms (alpha).',
      'Choose a half-life long enough for the job but short enough to minimise harm to people and the environment.',
    ],
    phet: [], video: [VID.nuclear], bitesize: bb('zv778xs', 'zdx36rd'),
    keywords: ['tracer', 'thickness control', 'sterilisation', 'smoke alarm', 'medical isotope', 'half-life choice'],
  },
  {
    slug: 'p1-nuclear-fission', unit: 'P1', title: 'Nuclear fission and the nuclear-power debate',
    outcomeIds: ['1.5.17', '1.5.18', '1.5.19'], practicals: [], prerequisites: ['p1-atom-nucleus-isotopes', 'p1-energy-resources'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'F', 'Fission and fusion confused in QWC answers; "atoms" written instead of nuclei.'),
    ],
    mustRecall: [
      'Fission: a uranium nucleus absorbs a neutron and splits into two smaller nuclei, releasing energy and several neutrons; these cause further fissions (chain reaction). Used to generate electricity.',
      'Issues: jobs vs fear of accidents and waste storage; Ukraine (Chernobyl) and Japan (Fukushima) incidents; no CO2 in operation but mining/transport/purification of uranium releases greenhouse gases.',
    ],
    phet: [], video: [VID.nuclear], bitesize: bb('zv778xs', 'zw6btcw'),
    keywords: ['nuclear fission', 'uranium', 'neutron', 'chain reaction', 'nuclear power', 'radioactive waste', 'Chernobyl', 'Fukushima'],
  },
  {
    slug: 'p1-nuclear-fusion', unit: 'P1', title: 'Nuclear fusion',
    outcomeIds: ['1.5.20', '1.5.21', '1.5.22', '1.5.23'], practicals: [], prerequisites: ['p1-nuclear-fission'], difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'P1', 'F', 'Fusion QWC: confused with fission; "atoms" instead of nuclei; energy given as the by-product instead of helium.'),
      ev('Summer 2025', 'P1', 'H', 'Fusion QWC remained weak at Higher Tier.'),
    ],
    mustRecall: [
      'Fusion: small nuclei (deuterium and tritium, isotopes of hydrogen) join to form a larger nucleus (helium), releasing energy; it is the source of a star’s energy.',
      'Fuel is nearly inexhaustible (from seawater); by-product helium is inert and non-toxic; no CO2 or greenhouse gases.',
      'Per kg: 4 million times more energy than burning fossil fuels and 4 times more than fission.',
      'Difficulties: very high temperatures needed, containment is expensive; commercial fusion may be 50 years away.',
    ],
    phet: [], video: [VID.nuclear], bitesize: bb('zv778xs', 'zjtgh4j'),
    keywords: ['nuclear fusion', 'deuterium', 'tritium', 'helium', 'star', 'high temperature', 'containment', 'seawater'],
  },
);

// ---------------------------------------------------------------------------
// P2 Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics
// ---------------------------------------------------------------------------
topics.push(
  {
    slug: 'p2-wave-types-and-properties', unit: 'P2', title: 'Transverse and longitudinal waves; frequency, wavelength, amplitude and v = f x lambda',
    outcomeIds: ['2.1.1', '2.1.2', '2.1.3', '2.1.4'], practicals: [], prerequisites: ['p1-speed-equations'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2024', 'P2', 'F', 'Sound/ultrasound described as transverse.'),
      ev('Summer 2025', 'P2', 'H', 'Period confused with frequency (period 2 s means frequency 0.5 Hz).'),
    ],
    mustRecall: [
      'Waves transfer energy through vibrations. Transverse: vibrations perpendicular to the direction of travel (water, electromagnetic). Longitudinal: vibrations parallel (sound, ultrasound).',
      'Frequency (Hz) = waves per second; wavelength (m) = distance between successive crests; amplitude = maximum displacement from rest.',
      'v = f x lambda (m/s, Hz, m); frequency = 1 / period.',
    ],
    phet: [P.waveString, P.wavesIntro], video: [], bitesize: bb('zbmmwty', 'zkkm9ty'),
    keywords: ['transverse', 'longitudinal', 'frequency', 'wavelength', 'amplitude', 'period', 'wave speed', 'hertz'],
  },
  {
    slug: 'p2-echoes-ultrasound-sonar-radar', unit: 'P2', title: 'Echoes, ultrasound, sonar and radar',
    outcomeIds: ['2.1.5', '2.1.6', '2.1.7'], practicals: [], prerequisites: ['p2-wave-types-and-properties'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Echo: distance to the reflector = (speed x time) / 2 because the sound travels there and back.',
      'Ultrasound: frequency above 20 000 Hz; used to measure foetal head diameter and to detect defects in metals.',
      'Sonar uses sound pulses to detect objects under water; radar uses electromagnetic (radio/micro) waves to detect aircraft and ships.',
    ],
    phet: [P.soundWaves], video: [], bitesize: bb('zbmmwty', 'zr868p3'),
    keywords: ['echo', 'ultrasound', '20 000 Hz', 'sonar', 'radar', 'reflection of sound', 'foetal scan'],
  },
  {
    slug: 'p2-electromagnetic-spectrum', unit: 'P2', title: 'The electromagnetic spectrum and its dangers',
    outcomeIds: ['2.1.8', '2.1.9'], practicals: [], prerequisites: ['p2-wave-types-and-properties'], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'H', 'Microwave danger must link heating to internal body tissue.'),
    ],
    mustRecall: [
      'Order of increasing frequency (decreasing wavelength): radio, microwaves, infrared, visible, ultraviolet, X-rays, gamma; all travel at the same speed in a vacuum.',
      'Dangers: microwaves heat internal tissue; infrared burns skin; UV damages skin cells -> skin cancer; intense visible light damages eyes; X-rays and gamma damage cells -> cancer. Higher frequency = more damage.',
    ],
    phet: [], video: [], bitesize: bb('zbmmwty', 'zgtqkhv'),
    keywords: ['electromagnetic spectrum', 'radio waves', 'microwaves', 'infrared', 'ultraviolet', 'X-rays', 'gamma rays', 'speed of light', 'hazards'],
  },
  {
    slug: 'p2-reflection', unit: 'P2', title: 'Reflection in a plane mirror',
    outcomeIds: ['2.2.1', '2.2.2'], practicals: [], prerequisites: [], difficulty: 2,
    examinerEvidence: [],
    mustRecall: [
      'Angles of incidence and reflection are measured from the normal (a line at right angles to the mirror); angle of incidence = angle of reflection.',
      'Plane-mirror image: same size, upright, laterally inverted, virtual, as far behind the mirror as the object is in front.',
    ],
    phet: [P.bendingLight], video: [], bitesize: bb('z4hh2sg', 'zxtgh4j'),
    keywords: ['reflection', 'normal', 'angle of incidence', 'angle of reflection', 'plane mirror', 'virtual image', 'ray tracing'],
  },
  {
    slug: 'p2-refraction-and-dispersion', unit: 'P2', title: 'Refraction and dispersion',
    outcomeIds: ['2.2.3', '2.2.4', '2.2.5', '2.2.6'], practicals: ['P5'], prerequisites: ['p2-reflection', 'p2-wave-types-and-properties'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'Dispersion confused with refraction; "rainbow" written instead of spectrum.'),
      ev('Summer 2025', 'P2', 'H', 'Refraction through an inverted prism drawn without normals and bent the wrong way; order of colours on the screen wrong.'),
      ev('Summer 2025', 'U7A', 'F', 'Booklet A refraction task: explanation must be a change of speed, not "optical density"; angles of incidence and refraction are related but not proportional (curve, not a straight line through the origin).'),
      ev('Summer 2025', 'U7B', 'F', 'Angle of 25 degrees omitted from the range of readings.'),
    ],
    mustRecall: [
      'Light bends towards the normal when it slows down (air -> glass/water) and away from the normal when it speeds up.',
      'The greater the change of speed, the greater the refraction (Snell’s law not required).',
      'Dispersion: a prism splits white light into a spectrum because colours travel at different speeds in glass; red is slowed and refracted least, violet most.',
      'Practical P5: plot angle of incidence against angle of refraction - related but not proportional.',
    ],
    phet: [P.bendingLight], video: [], bitesize: bb('z4hh2sg', 'zxtgh4j'),
    keywords: ['refraction', 'normal', 'angle of refraction', 'change of speed', 'glass block', 'dispersion', 'prism', 'spectrum', 'Prescribed Practical P5'],
  },
  {
    slug: 'p2-lenses-focal-length', unit: 'P2', title: 'Converging and diverging lenses; measuring focal length',
    outcomeIds: ['2.2.7', '2.2.8'], practicals: [], prerequisites: ['p2-refraction-and-dispersion'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'A converging (convex) lens brings parallel rays to a focus; a diverging (concave) lens spreads them out.',
      'Focal length: distance from the centre of a converging lens to the principal focus.',
      'Measure focal length by focusing a distant object on a screen and measuring the lens-to-screen distance.',
    ],
    phet: [P.geometricOptics], video: [], bitesize: bb('z4hh2sg', 'zdqs7v4'),
    keywords: ['converging lens', 'diverging lens', 'focal length', 'principal focus', 'distant object method'],
  },
  {
    slug: 'p2-lens-ray-diagrams', unit: 'P2', title: 'Ray diagrams for converging lenses: camera, projector and magnifying glass',
    outcomeIds: ['2.2.9', '2.2.10', '2.2.11'], practicals: [], prerequisites: ['p2-lenses-focal-length'], difficulty: 5,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'Lens ray diagrams: many candidates could not construct any correct ray.'),
      ev('Summer 2025', 'P2', 'H', 'Focal points not labelled; arrows missing on rays; image position/nature wrong.'),
    ],
    mustRecall: [
      'Standard rays: (1) parallel to the axis then through F; (2) through the optical centre undeviated; (3) through F then parallel to the axis.',
      'Object beyond 2F -> real, inverted, diminished image (camera). Object between F and 2F -> real, inverted, magnified (projector).',
      'Higher: object inside F -> virtual, upright, magnified image on the same side (magnifying glass).',
    ],
    phet: [P.geometricOptics], video: [], bitesize: bb('z4hh2sg', 'zdqs7v4'),
    keywords: ['ray diagram', 'real image', 'virtual image', 'inverted', 'magnified', 'diminished', 'camera', 'projector', 'magnifying glass', 'principal focus'],
  },
  {
    slug: 'p2-conductors-circuits-symbols', unit: 'P2', title: 'Conductors, insulators, current direction, circuit symbols and cell polarity',
    outcomeIds: ['2.3.1', '2.3.2', '2.3.3', '2.3.4', '2.3.5'], practicals: [], prerequisites: ['c1-atomic-structure'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'Circuit diagrams: negative terminal and electron-flow vs conventional-current direction confused.'),
      ev('Summer 2025', 'P2', 'H', 'Variable-resistor symbol not known.'),
      ev('Summer 2025', 'U7B', 'F', 'Ammeter (in series) and voltmeter (in parallel) symbols and positions wrong.'),
    ],
    mustRecall: [
      'Conductors have free electrons; insulators do not.',
      'Current in a metal is a flow of electrons from negative to positive; conventional current flows from positive to negative.',
      'Standard symbols: cell, battery, switch, lamp, resistor, variable resistor, ammeter, voltmeter, fuse, diode; the long line of a cell symbol is the positive terminal.',
      'Ammeter in series; voltmeter in parallel across the component.',
    ],
    phet: [P.cckDc], video: [], bitesize: bb('zknnxyc', 'z66t8p3'),
    keywords: ['conductor', 'insulator', 'free electrons', 'conventional current', 'electron flow', 'circuit symbols', 'cell polarity', 'series', 'parallel', 'switch'],
  },
  {
    slug: 'p2-charge-current-cells', unit: 'P2', title: 'Charge, current and cells in series',
    outcomeIds: ['2.3.6', '2.3.7'], practicals: [], prerequisites: ['p2-conductors-circuits-symbols'], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'Minutes not converted to seconds in charge/energy calculations.'),
    ],
    mustRecall: [
      'Q = I x t; charge in coulombs (C), current in amperes (A), time in seconds (s).',
      'Cells in series: total voltage is the sum of the cell voltages, taking polarity into account.',
    ],
    phet: [P.cckDc], video: [], bitesize: bb('zknnxyc', 'zhpnjfr'),
    keywords: ['charge', 'coulomb', 'current', 'ampere', 'cells in series', 'polarity'],
  },
  {
    slug: 'p2-ohms-law-filament-lamp', unit: 'P2', title: "Ohm's law, V = IR and the filament lamp",
    outcomeIds: ['2.3.8', '2.3.9'], practicals: ['P6'], prerequisites: ['p2-charge-current-cells'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'H', 'Why a filament lamp V-I graph curves: temperature rises -> more electron-atom collisions -> resistance increases.'),
      ev('Summer 2025', 'U7B', 'F', 'Ammeter/voltmeter placement and the need to keep the wire at constant temperature (switch off between readings, small currents).'),
    ],
    mustRecall: [
      'V = I x R (volts, amperes, ohms).',
      "Ohm's law: for a metal wire at constant temperature, current is proportional to voltage - the V-I graph is a straight line through the origin (Practical P6, voltage on the y-axis).",
      'Higher: filament lamp V-I graph curves because resistance increases as the current (and temperature) increases; find R = V/I at different points.',
    ],
    phet: [P.ohmsLaw, P.cckDcLab], video: [], bitesize: bb('zknnxyc', 'znsf7v4'),
    keywords: ["Ohm's law", 'resistance', 'ohm', 'V-I graph', 'filament lamp', 'constant temperature', 'Prescribed Practical P6'],
  },
  {
    slug: 'p2-series-parallel-rules', unit: 'P2', title: 'Current and voltage rules in series and parallel circuits',
    outcomeIds: ['2.3.10', '2.3.11'], practicals: [], prerequisites: ['p2-ohms-law-filament-lamp'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Series: same current through each component; supply voltage = sum of the voltages across the components.',
      'Parallel: same voltage across each branch as the supply; total current = sum of the branch currents.',
    ],
    phet: [P.cckDc], video: [], bitesize: bb('zknnxyc', 'zhpnjfr'),
    keywords: ['series circuit', 'parallel circuit', 'current rule', 'voltage rule', 'branch'],
  },
  {
    slug: 'p2-calculating-resistance', unit: 'P2', title: 'Calculating combined resistance',
    outcomeIds: ['2.3.12', '2.3.13', '2.3.14', '2.3.15'], practicals: [], prerequisites: ['p2-series-parallel-rules'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'Two 9 ohm resistors in parallel: 4.5 ohm not obtained.'),
    ],
    mustRecall: [
      'Series: R = R1 + R2 (+ ...).',
      'Two equal resistors in parallel: R = R1 / 2.',
      'Higher: any two in parallel 1/R = 1/R1 + 1/R2 (or R = R1R2/(R1+R2)); combined series/parallel circuits: reduce the parallel section first.',
    ],
    phet: [P.cckDc], video: [], bitesize: bb('zknnxyc', 'zvbrh4j'),
    keywords: ['resistors in series', 'resistors in parallel', 'combined resistance', 'total resistance', 'reciprocal'],
  },
  {
    slug: 'p2-resistance-length-heating', unit: 'P2', title: 'Resistance and length of a wire; the heating effect of a current',
    outcomeIds: ['2.3.16', '2.3.17'], practicals: [], prerequisites: ['p2-ohms-law-filament-lamp'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Control variable in the resistance-length experiment given as length (the independent variable); gradient unit missing.'),
    ],
    mustRecall: [
      'For a metal wire at constant temperature, resistance is proportional to length: the resistance (y) against length (x) graph is a straight line through the origin.',
      'Control variables: thickness/diameter, material, temperature.',
      'A current heats a wire because free electrons collide with the metal atoms/ions, transferring energy.',
    ],
    phet: [P.resistanceWire], video: [], bitesize: bb('zknnxyc', 'zvbrh4j'),
    keywords: ['resistance and length', 'proportional', 'control variables', 'heating effect', 'electron-atom collisions', 'ohmmeter'],
  },
  {
    slug: 'p2-electrical-power-energy-cost', unit: 'P2', title: 'Electrical energy, power and the cost of electricity',
    outcomeIds: ['2.3.18', '2.3.20'], practicals: [], prerequisites: ['p2-ohms-law-filament-lamp', 'p1-work-and-power'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'P = IV not recalled; minutes not converted to seconds.'),
    ],
    mustRecall: [
      'E = P x t (J, W, s) and P = I x V (W, A, V).',
      'The kilowatt-hour (kWh) is the energy used by a 1 kW appliance in 1 hour: kWh = kW x hours; cost = kWh x price per unit.',
    ],
    phet: [], video: [], bitesize: bb('zknnxyc', 'znsf7v4'),
    keywords: ['electrical power', 'electrical energy', 'kilowatt-hour', 'cost of electricity', 'power rating', 'unit of electricity'],
  },
  {
    slug: 'p2-electricity-in-the-home', unit: 'P2', title: 'a.c. and d.c., switching, plugs, fuses, earthing and double insulation',
    outcomeIds: ['2.3.19', '2.3.21', '2.3.22', '2.3.23', '2.3.24', '2.3.25'], practicals: [], prerequisites: ['p2-electrical-power-energy-cost'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'a.c./d.c. explanations and CRO trace sketches weak.'),
      ev('Summer 2024', 'P2', 'F', 'Fuse action in a three-pin plug "least well answered"; double insulation ("does not need an earth wire") not explained.'),
    ],
    mustRecall: [
      'd.c. flows in one direction (cells, batteries): flat CRO trace. a.c. reverses direction repeatedly (mains, 50 Hz): sine-wave CRO trace.',
      'A one-way switch makes or breaks the circuit and is always placed on the live side.',
      'Three-pin plug: live (brown, fused), neutral (blue), earth (green/yellow, to the metal case).',
      'If the live touches the metal case a large current flows to earth and melts the fuse, cutting off the supply; double-insulated appliances have plastic cases and need no earth.',
      'Choose a fuse just above the normal current: I = P / V (3 A, 5 A or 13 A).',
    ],
    phet: [], video: [], bitesize: bb('zknnxyc', 'zbr4nk7'),
    keywords: ['alternating current', 'direct current', 'CRO trace', 'live', 'neutral', 'earth', 'fuse', 'double insulation', 'three-pin plug', 'fuse rating'],
  },
  {
    slug: 'p2-magnetism-electromagnets', unit: 'P2', title: 'Magnetic fields of bar magnets and coils; electromagnets',
    outcomeIds: ['2.4.1', '2.4.2', '2.4.3'], practicals: [], prerequisites: ['p2-conductors-circuits-symbols'], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'Electromagnet strength: candidates changed the battery or core dimensions instead of current, number of turns or core material.'),
    ],
    mustRecall: [
      'Field lines of a bar magnet run from north to south outside the magnet; plotting compasses show the direction.',
      'A current-carrying coil (solenoid) has a field like a bar magnet; reversing the current reverses the poles.',
      'Electromagnet strength increases with current, number of turns and a soft-iron core.',
    ],
    phet: [P.magnets], video: [], bitesize: bb('zdfft39', 'z2hnjfr'),
    keywords: ['magnetic field', 'field lines', 'plotting compass', 'solenoid', 'electromagnet', 'iron core', 'number of turns'],
  },
  {
    slug: 'p2-solar-system-satellites', unit: 'P2', title: 'The Solar System, orbits and artificial satellites',
    outcomeIds: ['2.5.1', '2.5.2', '2.5.3', '2.5.4'], practicals: [], prerequisites: ['p1-mass-weight-free-fall'], difficulty: 2,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'Sun drawn on the wrong side of a Solar System diagram; meteors/meteorites listed as orbiting objects; gravity described as a "push".'),
    ],
    mustRecall: [
      'Solar System: the Sun, rocky inner planets, gas giants, moons, asteroids and comets.',
      'Order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
      'Gravity provides the force for the orbital motion of planets, comets, moons and artificial satellites.',
      'Satellites: Earth observation, weather monitoring, astronomy, communications.',
    ],
    phet: [P.gravityOrbits], video: [], bitesize: bb('z7bbscw', 'ztfkywx'),
    keywords: ['Solar System', 'planets', 'orbit', 'gravity', 'asteroid', 'comet', 'moon', 'artificial satellite'],
  },
  {
    slug: 'p2-stars-and-fusion', unit: 'P2', title: 'Formation of stars and planets; fusion in stars',
    outcomeIds: ['2.5.5', '2.5.6', '2.5.7'], practicals: [], prerequisites: ['p1-nuclear-fusion', 'p2-solar-system-satellites'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'F', 'QWC on stars: gravity described as a push; evidence phrased as "studying the light from stars" without saying what it shows.'),
    ],
    mustRecall: [
      'Stars form when gravity pulls together enough dust and gas; smaller masses attracted by a larger mass become planets.',
      'Studies of light from stars show they are mainly hydrogen and helium; their energy comes from fusing hydrogen into helium.',
      'Higher: all naturally occurring elements except hydrogen were formed by fusion in stars.',
    ],
    phet: [], video: [], bitesize: bb('z7bbscw', 'zyr7cxs'),
    keywords: ['star formation', 'protostar', 'gravity', 'hydrogen', 'helium', 'fusion', 'nebula', 'elements formed in stars'],
  },
  {
    slug: 'p2-life-cycle-of-stars', unit: 'P2', title: 'Life cycles of stars, supernovae and black holes',
    outcomeIds: ['2.5.8', '2.5.9', '2.5.10', '2.5.11'], practicals: [], prerequisites: ['p2-stars-and-fusion'], difficulty: 3,
    examinerEvidence: [],
    mustRecall: [
      'Sun-like star: protostar -> main sequence -> red giant -> white dwarf -> black dwarf.',
      'Main sequence is stable because the outward force of thermal expansion balances the inward force of gravity.',
      'Massive star: red supergiant -> supernova (outer layers ejected; shines with the brightness of 10 billion suns) -> neutron star or, for the most massive, black hole.',
      'A black hole has a gravitational field so strong that nothing, not even light, can escape.',
    ],
    phet: [], video: [], bitesize: bb('z7bbscw', 'zyr7cxs'),
    keywords: ['main sequence', 'red giant', 'white dwarf', 'black dwarf', 'red supergiant', 'supernova', 'neutron star', 'black hole'],
  },
  {
    slug: 'p2-big-bang-evidence', unit: 'P2', title: 'The Big Bang, red shift and CMBR',
    outcomeIds: ['2.5.12', '2.5.13', '2.5.14', '2.5.15'], practicals: [], prerequisites: ['p2-stars-and-fusion', 'p2-electromagnetic-spectrum'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'P2', 'H', 'CMBR confused with "light from stars".'),
    ],
    mustRecall: [
      'The Universe began with the Big Bang about 14 billion years ago.',
      'Higher: rapid expansion and cooling -> neutrons and protons form -> further cooling lets nuclei form -> electrons combine with nuclei to form hydrogen atoms.',
      'Red shift: light from other galaxies is shifted to the red end of the spectrum, explained by space expanding.',
      'Higher: cosmic microwave background radiation is further evidence; the Big Bang is currently the only model that explains it.',
    ],
    phet: [], video: [], bitesize: bb('z7bbscw', 'zv4m9ty'),
    keywords: ['Big Bang', '14 billion years', 'expansion', 'red shift', 'CMBR', 'cosmic microwave background', 'galaxies'],
  },
);

// ---------------------------------------------------------------------------
// Unit 7 Practical Skills. Skill outcomes have no ids in the spec; the builder
// assigns U7.<sectionIndex>.<outcomeIndex> (1-based, document order) and the
// groups below reference them by that convention.
// ---------------------------------------------------------------------------
export const unit7 = [
  {
    slug: 'u7-planning', title: 'Planning an investigation: variables, hypotheses, risk, apparatus, tables and diagrams',
    sectionTitle: 'Planning an investigation', skillIds: ['U7.1.1', 'U7.1.2', 'U7.1.3', 'U7.1.4', 'U7.1.5', 'U7.1.6', 'U7.1.7', 'U7.1.8'],
    practicalsPractised: ['B3', 'B4', 'B6', 'C1', 'C4', 'P3', 'P4'],
    prerequisites: [], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Results-table headings must carry units and match the axis labels; 2-D labelled apparatus diagrams (no 3-D, no four-legged tripods, no blocked tubes).'),
      ev('Summer 2025', 'U7B', 'F', 'Control variable in the resistance-length experiment given as the independent variable.'),
    ],
    mustRecall: [
      'Independent variable = the one you change; dependent = the one you measure; controlled = kept the same.',
      'A hypothesis is a testable prediction with a scientific reason.',
      'Validity: the experiment tests what it claims (fair test). Reliability: repeat and average, consistent results.',
    ],
    bitesize: `${BB}zmbbscw`,
    keywords: ['independent variable', 'dependent variable', 'control variable', 'hypothesis', 'risk assessment', 'apparatus diagram', 'results table', 'validity', 'reliability'],
  },
  {
    slug: 'u7-carrying-out', title: 'Carrying out an experiment: using apparatus correctly, skilfully and safely',
    sectionTitle: 'Carrying out an experiment', skillIds: ['U7.2.1'],
    practicalsPractised: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    prerequisites: ['u7-planning'], difficulty: 3,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', '"Gas syringe" and "conical flask" misnamed or misspelt; delivery tube and gas jar not named (2024).'),
      ev('Summer 2025', 'U7A', 'F', 'Masses recorded to 2 d.p.; "exothermic" is a deduction not an observation.'),
    ],
    mustRecall: [
      'Apparatus list: Bunsen burner, heatproof mat, tripod, gauze, pipeclay triangle, crucible, evaporating basin; beakers, conical flasks, test tubes, boiling tubes, glass rod, pipettes, filter funnel, watch glass, combustion tube; gas jar and lid, thistle funnel, delivery tube, beehive shelf, trough; measuring cylinders; quadrat, tape, line transect; potometer; Visking tubing; gas syringe; electronic balance; ruler; stopclock; thermometer; ammeter; voltmeter; ohmmeter; protractor.',
      'Read a measuring cylinder at the bottom of the meniscus at eye level; record to the resolution of the instrument.',
    ],
    bitesize: `${BB}zmbbscw`,
    keywords: ['apparatus', 'gas syringe', 'delivery tube', 'thistle funnel', 'gas jar', 'beehive shelf', 'potometer', 'quadrat', 'measuring cylinder', 'balance', 'ammeter', 'voltmeter', 'protractor'],
  },
  {
    slug: 'u7-analysing', title: 'Analysing experimental data: accuracy, reliability, validity, anomalies and graphs',
    sectionTitle: 'Analysing experimental data', skillIds: ['U7.3.1', 'U7.3.2', 'U7.3.3', 'U7.3.4', 'U7.3.5', 'U7.3.6'],
    practicalsPractised: ['B3', 'B5', 'C4', 'P1', 'P2', 'P5', 'P6'],
    prerequisites: ['u7-carrying-out'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', 'Reliability confused with accuracy; unit omitted from an axis label; gradient unit missing.'),
      ev('Summer 2025', 'U7A', 'F', 'Straight-line segments drawn instead of a smooth curve of best fit; axis label must equal the column heading including the unit.'),
    ],
    mustRecall: [
      'Accuracy: how close to the true value (good technique/apparatus). Reliability: reproducibility of repeats. Validity: whether the experiment is suitable for the task.',
      'Anomalous result: does not fit the pattern; ignore it when averaging or repeat the reading.',
      'Graphs: independent variable on the x-axis, labels with units, sensible scales, points plotted accurately, best-fit straight line or smooth curve (never dot-to-dot).',
    ],
    bitesize: `${BB}zmbbscw`,
    keywords: ['accuracy', 'reliability', 'validity', 'anomalous result', 'line of best fit', 'curve of best fit', 'axis label', 'scale', 'gradient'],
  },
  {
    slug: 'u7-conclusions', title: 'Drawing conclusions: evidence, proportionality, calculations and evaluation',
    sectionTitle: 'Drawing conclusions from an experiment', skillIds: ['U7.4.1', 'U7.4.2', 'U7.4.3', 'U7.4.4', 'U7.4.5', 'U7.4.6', 'U7.4.7', 'U7.4.8', 'U7.4.9'],
    practicalsPractised: ['B5', 'B6', 'C3', 'C4', 'C5', 'P2', 'P5', 'P6'],
    prerequisites: ['u7-analysing'], difficulty: 4,
    examinerEvidence: [
      ev('Summer 2025', 'U7B', 'F', '"Directly proportional" requires a straight line through the origin; "related but not proportional" must be justified from the curve.'),
      ev('Summer 2025', 'U7B', 'H', 'Mass of water -> moles of water; Mr of hydrated CuSO4; degree of hydration from mass data.'),
      ev('Summer 2025', 'U7B', 'F', 'Comparisons need comparative language backed by figures from the data.'),
    ],
    mustRecall: [
      'y against x: straight line through (0,0) = direct proportion. y against 1/x: straight line through (0,0) = inverse proportion.',
      'Conclusions must quote data, describe the trend and link to scientific reasoning; evaluate limitations of the evidence.',
      'Calculations: moles = mass / Mr; % by mass; concentration = moles / volume; gas volumes; degree of hydration.',
    ],
    bitesize: `${BB}zmbbscw`,
    keywords: ['conclusion', 'evidence', 'direct proportion', 'inverse proportion', 'deduction', 'evaluation', 'limitations', 'moles', 'degree of hydration'],
  },
];

// ---------------------------------------------------------------------------
// Equations students must recall (none are printed in the exam). Physics ones
// are exported as physicsEquations; chemistry ones are folded into
// chemistryRecall (category "formula"). Both feed topic.keyEquations.
// ---------------------------------------------------------------------------
export const equations = [
  // P1 motion
  { id: 'p-average-speed', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-speed-equations', tier: 'F', name: 'average speed', formula: 'average speed = distance moved / time taken', symbols: { 'average speed': 'speed', distance: 'distance moved', time: 'time taken' }, units: { speed: 'm/s', distance: 'm', time: 's' } },
  { id: 'p-average-speed-mean', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-speed-equations', tier: 'F', name: 'average speed from initial and final speed', formula: 'average speed = (initial speed + final speed) / 2', symbols: {}, units: { speed: 'm/s' } },
  { id: 'p-rate-of-change-of-speed', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-speed-equations', tier: 'F', name: 'rate of change of speed', formula: 'rate of change of speed = (final speed - initial speed) / time taken', symbols: {}, units: { 'rate of change of speed': 'm/s2', speed: 'm/s', time: 's' } },
  { id: 'p-velocity', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-vectors-velocity-acceleration', tier: 'H', name: 'average velocity', formula: 'v = d / t', symbols: { v: 'average velocity', d: 'displacement', t: 'time' }, units: { v: 'm/s', d: 'm', t: 's' } },
  { id: 'p-average-velocity-mean', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-vectors-velocity-acceleration', tier: 'H', name: 'average velocity from initial and final velocity', formula: 'average velocity = (u + v) / 2', symbols: { u: 'initial velocity', v: 'final velocity' }, units: { velocity: 'm/s' } },
  { id: 'p-acceleration', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-vectors-velocity-acceleration', tier: 'H', name: 'acceleration', formula: 'a = (v - u) / t', symbols: { a: 'acceleration', u: 'initial velocity', v: 'final velocity', t: 'time taken' }, units: { a: 'm/s2', u: 'm/s', v: 'm/s', t: 's' } },
  // P1 force
  { id: 'p-newton-second-law', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-newtons-laws', tier: 'F', name: "Newton's second law", formula: 'F = m x a', symbols: { F: 'resultant force', m: 'mass', a: 'acceleration' }, units: { F: 'N', m: 'kg', a: 'm/s2' } },
  { id: 'p-weight', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-mass-weight-free-fall', tier: 'F', name: 'weight', formula: 'W = m x g', symbols: { W: 'weight', m: 'mass', g: 'gravitational field strength (10 N/kg on Earth)' }, units: { W: 'N', m: 'kg', g: 'N/kg' } },
  { id: 'p-hookes-law', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-hookes-law', tier: 'F', name: "Hooke's law", formula: 'F = k x e', symbols: { F: 'applied force', k: 'spring constant (gradient of F-e graph)', e: 'extension' }, units: { F: 'N', k: 'N/m (or N/cm)', e: 'm (or cm)' } },
  { id: 'p-pressure', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-pressure', tier: 'F', name: 'pressure', formula: 'P = F / A', symbols: { P: 'pressure', F: 'force', A: 'area' }, units: { P: 'Pa (N/m2)', F: 'N', A: 'm2 (cm2/mm2 allowed without conversion)' } },
  { id: 'p-moment', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-moments', tier: 'F', name: 'moment of a force', formula: 'moment = F x d', symbols: { F: 'force', d: 'perpendicular distance from the pivot' }, units: { moment: 'N m', F: 'N', d: 'm' } },
  { id: 'p-principle-of-moments', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-moments', tier: 'F', name: 'Principle of Moments', formula: 'sum of clockwise moments about a point = sum of anticlockwise moments about that point (object in equilibrium)', symbols: {}, units: { moment: 'N m' } },
  // P1 density, energy
  { id: 'p-density', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-density-kinetic-theory', tier: 'F', name: 'density', formula: 'D = m / V', symbols: { D: 'density', m: 'mass', V: 'volume' }, units: { D: 'g/cm3 or kg/m3', m: 'g or kg', V: 'cm3 or m3' } },
  { id: 'p-efficiency', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-energy-forms-conservation-efficiency', tier: 'F', name: 'efficiency', formula: 'efficiency = useful output energy / total input energy', symbols: {}, units: { efficiency: 'decimal or % (no unit)', energy: 'J' } },
  { id: 'p-work', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-work-and-power', tier: 'F', name: 'work done', formula: 'W = F x d', symbols: { W: 'work done', F: 'force', d: 'distance moved in the direction of the force' }, units: { W: 'J', F: 'N', d: 'm' } },
  { id: 'p-power-energy', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-work-and-power', tier: 'F', name: 'power (energy)', formula: 'P = E / t', symbols: { P: 'power', E: 'energy transferred', t: 'time taken' }, units: { P: 'W (J/s)', E: 'J', t: 's' } },
  { id: 'p-power-work', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-work-and-power', tier: 'F', name: 'power (work)', formula: 'P = W / t', symbols: { P: 'power', W: 'work done', t: 'time taken' }, units: { P: 'W', W: 'J', t: 's' } },
  { id: 'p-kinetic-energy', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-kinetic-and-potential-energy', tier: 'F', name: 'kinetic energy', formula: 'Ek = 1/2 m v2', symbols: { Ek: 'kinetic energy', m: 'mass', v: 'speed' }, units: { Ek: 'J', m: 'kg', v: 'm/s' } },
  { id: 'p-gravitational-potential-energy', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-kinetic-and-potential-energy', tier: 'F', name: 'gravitational potential energy', formula: 'Ep = m g h', symbols: { Ep: 'gravitational potential energy', m: 'mass', g: '10 N/kg', h: 'vertical height' }, units: { Ep: 'J', m: 'kg', g: 'N/kg', h: 'm' } },
  // P1 nuclear
  { id: 'p-alpha-decay', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-radioactive-decay', tier: 'H', name: 'alpha decay equation', formula: '[A,Z]X -> [A-4,Z-2]Y + [4,2]He', symbols: { A: 'mass number', Z: 'atomic number' }, units: {} },
  { id: 'p-beta-decay', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-radioactive-decay', tier: 'H', name: 'beta decay equation', formula: '[A,Z]X -> [A,Z+1]Y + [0,-1]e', symbols: { A: 'mass number', Z: 'atomic number' }, units: {} },
  { id: 'p-gamma-decay', discipline: 'Physics', unit: 'P1', topicSlug: 'p1-radioactive-decay', tier: 'H', name: 'gamma decay equation', formula: '[A,Z]X -> [A,Z]X + gamma', symbols: { A: 'mass number', Z: 'atomic number' }, units: {} },
  // P2 waves
  { id: 'p-wave-speed', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-wave-types-and-properties', tier: 'F', name: 'wave equation', formula: 'v = f x lambda', symbols: { v: 'wave speed', f: 'frequency', lambda: 'wavelength' }, units: { v: 'm/s', f: 'Hz', lambda: 'm' } },
  { id: 'p-frequency-period', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-wave-types-and-properties', tier: 'F', name: 'frequency and period', formula: 'f = 1 / T', symbols: { f: 'frequency', T: 'period (time for one wave)' }, units: { f: 'Hz', T: 's' }, note: 'Not printed as an equation in the spec; needed to read frequency from displacement-time graphs (2.1.3) and flagged by examiners (Summer 2025 P2 H).' },
  { id: 'p-echo', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-echoes-ultrasound-sonar-radar', tier: 'F', name: 'echo distance', formula: 'distance to reflector = (speed x time) / 2', symbols: { speed: 'speed of sound/wave', time: 'time for the echo to return' }, units: { distance: 'm', speed: 'm/s', time: 's' } },
  // P2 electricity
  { id: 'p-charge', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-charge-current-cells', tier: 'F', name: 'charge', formula: 'Q = I x t', symbols: { Q: 'charge', I: 'current', t: 'time' }, units: { Q: 'C', I: 'A', t: 's' } },
  { id: 'p-ohms-law', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-ohms-law-filament-lamp', tier: 'F', name: "Ohm's law", formula: 'V = I x R', symbols: { V: 'voltage', I: 'current', R: 'resistance' }, units: { V: 'V', I: 'A', R: 'ohm' } },
  { id: 'p-series-resistance', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-calculating-resistance', tier: 'F', name: 'resistors in series', formula: 'R = R1 + R2', symbols: { R: 'total resistance' }, units: { R: 'ohm' } },
  { id: 'p-parallel-equal-resistors', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-calculating-resistance', tier: 'F', name: 'two equal resistors in parallel', formula: 'R = R1 / 2', symbols: { R: 'combined resistance', R1: 'resistance of each resistor' }, units: { R: 'ohm' } },
  { id: 'p-parallel-two-resistors', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-calculating-resistance', tier: 'H', name: 'any two resistors in parallel', formula: '1/R = 1/R1 + 1/R2', symbols: { R: 'combined resistance' }, units: { R: 'ohm' } },
  { id: 'p-electrical-energy', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-electrical-power-energy-cost', tier: 'F', name: 'electrical energy', formula: 'E = P x t', symbols: { E: 'energy', P: 'power', t: 'time' }, units: { E: 'J', P: 'W', t: 's' } },
  { id: 'p-electrical-power', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-electrical-power-energy-cost', tier: 'F', name: 'electrical power', formula: 'P = I x V', symbols: { P: 'power', I: 'current', V: 'voltage' }, units: { P: 'W', I: 'A', V: 'V' } },
  { id: 'p-kilowatt-hour-cost', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-electrical-power-energy-cost', tier: 'F', name: 'cost of electricity', formula: 'energy (kWh) = power (kW) x time (h); cost = kWh x price per unit', symbols: {}, units: { energy: 'kWh', power: 'kW', time: 'h' } },
  { id: 'p-fuse-rating', discipline: 'Physics', unit: 'P2', topicSlug: 'p2-electricity-in-the-home', tier: 'F', name: 'fuse rating from P = IV', formula: 'I = P / V, then choose the next fuse above I (3 A, 5 A, 13 A)', symbols: { I: 'normal operating current', P: 'power rating', V: 'mains voltage (230 V)' }, units: { I: 'A', P: 'W', V: 'V' } },
  // Chemistry formulae (also surfaced in chemistryRecall)
  { id: 'c-rate', discipline: 'Chemistry', unit: 'C2', topicSlug: 'c2-measuring-rates', tier: 'F', name: 'rate of reaction', formula: 'rate = 1 / time', symbols: { time: 'time for the reaction/observation' }, units: { rate: '1/s (s-1)', time: 's' } },
  { id: 'c-rf', discipline: 'Chemistry', unit: 'C1', topicSlug: 'c1-separating-mixtures-chromatography', tier: 'F', name: 'Rf value', formula: 'Rf = distance moved by substance / distance moved by solvent front', symbols: {}, units: { Rf: 'no unit (0-1)' } },
  { id: 'c-percent-by-mass', discipline: 'Chemistry', unit: 'C1', topicSlug: 'c1-formula-mass-and-moles', tier: 'F', name: 'percentage by mass', formula: '% by mass = (Ar x number of atoms of the element / Mr) x 100', symbols: { Ar: 'relative atomic mass', Mr: 'relative formula mass' }, units: {} },
  { id: 'c-moles-mass', discipline: 'Chemistry', unit: 'C1', topicSlug: 'c1-formula-mass-and-moles', tier: 'F', name: 'moles from mass', formula: 'moles = mass / Mr', symbols: { Mr: 'relative formula mass (molar mass in g/mol)' }, units: { mass: 'g', moles: 'mol' } },
  { id: 'c-percentage-yield', discipline: 'Chemistry', unit: 'C1', topicSlug: 'c1-reacting-masses-and-yield', tier: 'H', name: 'percentage yield', formula: '% yield = (actual yield / theoretical yield) x 100', symbols: {}, units: { yield: 'g (or mol)' } },
  { id: 'c-concentration', discipline: 'Chemistry', unit: 'C2', topicSlug: 'c2-concentration-atom-economy', tier: 'H', name: 'concentration', formula: 'concentration = moles / volume', symbols: { volume: 'volume of solution in dm3 (cm3 / 1000)' }, units: { concentration: 'mol/dm3', moles: 'mol', volume: 'dm3' } },
  { id: 'c-atom-economy', discipline: 'Chemistry', unit: 'C2', topicSlug: 'c2-concentration-atom-economy', tier: 'H', name: 'atom economy', formula: 'atom economy = (mass of desired product / total mass of products) x 100', symbols: {}, units: { 'atom economy': '%' } },
  { id: 'c-bond-energy', discipline: 'Chemistry', unit: 'C2', topicSlug: 'c2-energy-changes', tier: 'H', name: 'energy change from bond energies', formula: 'energy change = energy taken in to break bonds - energy released when bonds form', symbols: {}, units: { energy: 'kJ/mol' } },
  { id: 'c-degree-of-hydration', discipline: 'Chemistry', unit: 'C2', topicSlug: 'c2-hydrated-salts-water-of-crystallisation', tier: 'H', name: 'degree of hydration', formula: 'x = moles of water lost / moles of anhydrous salt (moles = mass / Mr for each)', symbols: { x: 'number of waters of crystallisation' }, units: {} },
];

// ---------------------------------------------------------------------------
// Chemistry recall bank: tests, colours, series, definitions and formulae that
// must be reproduced verbatim (examiners mark against the CCEA glossary).
// ---------------------------------------------------------------------------
const cr = (category, item, detail, topicSlug, tier = 'F') => ({ category, item, detail, topicSlug, tier });
export const chemistryRecall = [
  cr('test', 'Hydrogen', 'Lighted splint: burns with a squeaky pop.', 'c1-reactions-of-acids'),
  cr('test', 'Carbon dioxide', 'Limewater (calcium hydroxide solution) turns from colourless to milky.', 'c1-reactions-of-acids'),
  cr('test', 'Oxygen', 'Relights a glowing splint (Prescribed Practical C6 "tests" for the gases).', 'c2-hydrogen-oxygen-preparation'),
  cr('test', 'Chlorine', 'Damp universal indicator paper turns red and then bleaches white.', 'c1-group-7-halogens'),
  cr('test', 'Ammonia', 'Glass rod dipped in concentrated hydrochloric acid gives white smoke (ammonium chloride).', 'c2-atmosphere-nitrogen-ammonia', 'H'),
  cr('test', 'Water', 'Anhydrous copper(II) sulfate turns from white to blue.', 'c1-separating-mixtures-chromatography'),
  cr('test', 'C=C double bond (alkene)', 'Bromine water changes from orange to colourless.', 'c2-alkenes'),
  cr('test', 'Acid / alkali', 'Blue litmus turns red in acid; red litmus turns blue in alkali.', 'c1-indicators-and-ph'),
  cr('flame colour', 'Lithium', 'Crimson', 'c1-flame-tests'),
  cr('flame colour', 'Sodium', 'Yellow/orange', 'c1-flame-tests'),
  cr('flame colour', 'Potassium', 'Lilac', 'c1-flame-tests'),
  cr('flame colour', 'Calcium', 'Brick red', 'c1-flame-tests'),
  cr('flame colour', 'Copper(II)', 'Blue-green / green-blue', 'c1-flame-tests'),
  cr('pH', 'Universal indicator classification', 'pH 0-2 strong acid; 3-6 weak acid; 7 neutral; 8-11 weak alkali; 12-14 strong alkali. Examiners: pH 14 is purple/violet, pH 1 is red (not crimson/brick red).', 'c1-indicators-and-ph'),
  cr('colour', 'Copper(II) oxide', 'Black solid', 'c1-group-0-and-transition-metals'),
  cr('colour', 'Copper(II) carbonate', 'Green solid', 'c1-group-0-and-transition-metals'),
  cr('colour', 'Hydrated copper(II) sulfate', 'Blue crystals; anhydrous copper(II) sulfate is a white powder', 'c1-group-0-and-transition-metals'),
  cr('colour', 'Copper(II) salts in solution', 'Usually blue', 'c1-group-0-and-transition-metals'),
  cr('colour', 'Group 1 compounds', 'White solids that dissolve to give colourless solutions', 'c1-group-1-alkali-metals'),
  cr('colour', 'Group 1, Group 2, aluminium and zinc salts', 'White; colourless solutions. Transition-metal salts are generally coloured.', 'c1-salts-and-lab-safety'),
  cr('colour', 'Chlorine', 'Pale green gas', 'c1-group-7-halogens'),
  cr('colour', 'Bromine', 'Red-brown liquid (red-brown vapour)', 'c1-group-7-halogens'),
  cr('colour', 'Iodine', 'Grey-black solid; sublimes on heating to a purple vapour', 'c1-group-7-halogens'),
  cr('colour', 'Rust', 'Hydrated iron(III) oxide (orange-brown)', 'c2-rusting-and-iron'),
  cr('observation', 'Group 1 metal + water', 'Floats, moves around, fizzes (hydrogen), gets smaller/disappears; sodium melts into a ball; potassium burns with a lilac flame; solution is alkaline (hydroxide).', 'c1-group-1-alkali-metals'),
  cr('observation', 'Halogen displacement', 'Chlorine + bromide solution turns orange (bromine); chlorine or bromine + iodide solution turns brown (iodine).', 'c1-group-7-halogens', 'H'),
  cr('observation', 'Electrolysis of molten lithium chloride', 'Cathode: silvery lithium; anode: pale green chlorine gas.', 'c2-electrolysis-molten-salts'),
  cr('observation', 'Electrolysis of molten lead(II) bromide', 'Cathode: silvery-grey bead of lead; anode: red-brown bromine vapour.', 'c2-electrolysis-molten-salts'),
  cr('observation', 'Metal displacement (Zn + CuSO4)', 'Blue solution fades / turns colourless, brown solid (copper) forms, temperature rises.', 'c2-displacement-and-extraction'),
  cr('observation', 'Heating hydrated copper(II) sulfate', 'Blue crystals turn to white powder; steam/condensation; reversible on adding water.', 'c2-hydrated-salts-water-of-crystallisation'),
  cr('series', 'Reactivity series', 'K, Na, Ca, Mg, Al, Zn, Fe, Cu (most to least reactive).', 'c2-reactivity-series'),
  cr('series', 'Diatomic elements', 'H2, N2, O2, F2, Cl2, Br2, I2', 'c1-symbols-and-formulae'),
  cr('series', 'Atmosphere', 'About 78% nitrogen, 21% oxygen, 0.03-0.04% carbon dioxide, 1% argon, traces of other noble gases, variable water vapour.', 'c2-atmosphere-nitrogen-ammonia'),
  cr('series', 'Crude-oil fractions (top to bottom)', 'Refinery gases, petrol, naphtha, kerosene, diesel, fuel oils, bitumen.', 'c2-crude-oil-fractional-distillation'),
  cr('series', 'Hazard symbols (GHS/CLP)', 'Toxic, corrosive, flammable, explosive, caution.', 'c1-salts-and-lab-safety'),
  cr('definition', 'Atomic number', 'The number of protons in an atom.', 'c1-atomic-structure'),
  cr('definition', 'Mass number', 'The total number of protons and neutrons in an atom.', 'c1-atomic-structure'),
  cr('definition', 'Isotopes', 'Atoms of an element with the same atomic number but a different mass number (different number of neutrons).', 'c1-isotopes-relative-atomic-mass'),
  cr('definition', 'Relative atomic mass', 'The mass of an atom compared with that of the carbon-12 isotope, which has a mass of exactly 12.', 'c1-formula-mass-and-moles'),
  cr('definition', 'Element', 'A substance consisting of only one type of atom that cannot be broken down by chemical means.', 'c1-periodic-table-structure'),
  cr('definition', 'Compound', 'Two or more elements chemically combined.', 'c1-atomic-structure'),
  cr('definition', 'Ion', 'A charged particle formed when an atom gains or loses electrons.', 'c1-ionic-bonding'),
  cr('definition', 'Covalent bond', 'A shared pair of electrons.', 'c1-covalent-bonding'),
  cr('definition', 'Metallic bonding', 'Attraction between positive ions in a regular lattice and delocalised electrons.', 'c1-metallic-structures-classifying', 'H'),
  cr('definition', 'Alloy', 'A mixture of two or more elements, at least one of which is a metal, with metallic properties.', 'c1-metallic-structures-classifying'),
  cr('definition', 'Allotropes', 'Different forms of the same element (diamond, graphite, graphene).', 'c1-carbon-allotropes-nanoparticles'),
  cr('definition', 'Nanoparticle', 'A structure 1-100 nm in size containing a few hundred atoms.', 'c1-carbon-allotropes-nanoparticles'),
  cr('definition', 'Base / alkali', 'A base is a metal oxide or hydroxide that neutralises an acid to give a salt and water; an alkali is a soluble base.', 'c1-neutralisation-and-bases'),
  cr('definition', 'Salt', 'A compound formed when some or all of the hydrogen ions in an acid are replaced by metal or ammonium ions.', 'c1-salts-and-lab-safety'),
  cr('definition', 'Strong / weak acid', 'Strong acids are completely ionised in water; weak acids are partially ionised.', 'c1-acids-alkalis-strength'),
  cr('definition', 'Pure substance', 'A single element or compound not mixed with any other substance.', 'c1-purity-and-formulations'),
  cr('definition', 'Formulation', 'A mixture designed as a useful product, made by mixing substances in carefully measured quantities.', 'c1-purity-and-formulations'),
  cr('definition', 'Oxidation / reduction', 'Oxidation: gain of oxygen, loss of hydrogen or (Higher) loss of electrons. Reduction: loss of oxygen, gain of hydrogen or (Higher) gain of electrons.', 'c2-redox'),
  cr('definition', 'Catalyst', 'A substance that increases the rate of a reaction without being used up.', 'c2-collision-theory-catalysts'),
  cr('definition', 'Activation energy', 'The minimum energy needed for a reaction to occur.', 'c2-energy-changes', 'H'),
  cr('definition', 'Dynamic equilibrium', 'In a closed system, the rates of the forward and reverse reactions are equal and the amounts of reactants and products remain constant.', 'c2-equilibrium', 'H'),
  cr('definition', 'Electrolysis', 'The decomposition of a molten or dissolved ionic compound by passing electricity through it.', 'c2-electrolysis-molten-salts'),
  cr('definition', 'Homologous series', 'A family of organic molecules with the same general formula, similar chemical properties, a gradation in physical properties, differing by CH2.', 'c2-homologous-series-alkanes'),
  cr('definition', 'Hydrocarbon', 'A compound consisting of hydrogen and carbon only.', 'c2-homologous-series-alkanes'),
  cr('definition', 'Functional group', 'A reactive group in a molecule (C=C alkenes, -OH alcohols, -COOH carboxylic acids).', 'c2-alkenes'),
  cr('definition', 'Empirical formula', 'The simplest whole-number ratio of atoms of each element in a compound.', 'c2-hydrated-salts-water-of-crystallisation'),
  cr('definition', 'Water of crystallisation', 'Water molecules chemically bonded within the crystal structure of a hydrated salt.', 'c2-hydrated-salts-water-of-crystallisation'),
  cr('definition', 'Exothermic / endothermic', 'Exothermic: heat is given out. Endothermic: heat is taken in.', 'c2-energy-changes'),
  cr('equation', 'Neutralisation (ionic)', 'H+(aq) + OH-(aq) -> H2O(l)', 'c1-neutralisation-and-bases'),
  cr('equation', 'Reactions of acids', 'acid + metal -> salt + hydrogen; acid + base -> salt + water; acid + carbonate -> salt + water + carbon dioxide; acid + hydrogencarbonate -> salt + water + carbon dioxide', 'c1-reactions-of-acids'),
  cr('equation', 'Group 1 metal + water', 'e.g. 2Na + 2H2O -> 2NaOH + H2; half equation Na -> Na+ + e- (Higher)', 'c1-group-1-alkali-metals'),
  cr('equation', 'Halide half equation', 'Cl2 + 2e- -> 2Cl- (Higher)', 'c1-group-7-halogens', 'H'),
  cr('equation', 'Iron extraction', 'C + O2 -> CO2; CO2 + C -> 2CO; Fe2O3 + 3CO -> 2Fe + 3CO2; CaCO3 -> CaO + CO2; CaO + SiO2 -> CaSiO3', 'c2-rusting-and-iron'),
  cr('equation', 'Complete combustion of methane', 'CH4 + 2O2 -> CO2 + 2H2O', 'c2-combustion-and-pollution'),
  cr('equation', 'Aluminium electrolysis half equations', 'Al3+ + 3e- -> Al (cathode); 2O2- -> O2 + 4e- (anode); C + O2 -> CO2 at the anode', 'c2-aluminium-extraction', 'H'),
  cr('equation', 'Carbon dioxide with limewater', 'Ca(OH)2 + CO2 -> CaCO3 + H2O; then CaCO3 + H2O + CO2 -> Ca(HCO3)2 with excess CO2', 'c2-carbon-dioxide-preparation'),
  cr('general formula', 'Alkanes', 'CnH2n+2 (methane CH4, ethane C2H6, propane C3H8, butane C4H10)', 'c2-homologous-series-alkanes'),
  cr('general formula', 'Alkenes', 'CnH2n (ethene C2H4, propene C3H6, but-1-ene and but-2-ene C4H8)', 'c2-alkenes'),
  cr('general formula', 'Alcohols', 'CnH2n+1OH (methanol CH3OH, ethanol C2H5OH, propan-1-ol, propan-2-ol C3H7OH)', 'c2-alcohols-fermentation', 'H'),
  cr('general formula', 'Carboxylic acids', 'Methanoic HCOOH, ethanoic CH3COOH, propanoic C2H5COOH, butanoic C3H7COOH', 'c2-carboxylic-acids', 'H'),
];

// ---------------------------------------------------------------------------
// Biology recall bank (same shape) - equations, colours and definitions that
// examiners expect verbatim.
// ---------------------------------------------------------------------------
export const biologyRecall = [
  cr('equation', 'Photosynthesis', 'carbon dioxide + water -> glucose + oxygen; 6CO2 + 6H2O -> C6H12O6 + 6O2 (light, chlorophyll)', 'b1-photosynthesis-equation-limiting-factors'),
  cr('equation', 'Aerobic respiration', 'glucose + oxygen -> energy + carbon dioxide + water; C6H12O6 + 6O2 -> energy + 6CO2 + 6H2O', 'b1-aerobic-respiration'),
  cr('equation', 'Anaerobic respiration (muscle)', 'glucose -> energy + lactic acid', 'b1-anaerobic-respiration'),
  cr('equation', 'Anaerobic respiration (yeast)', 'glucose -> energy + alcohol + carbon dioxide', 'b1-anaerobic-respiration'),
  cr('test', "Benedict's (reducing sugar, heat)", 'Blue -> brick red precipitate', 'b1-food-tests'),
  cr('test', 'Iodine solution (starch)', 'Yellow-brown -> blue-black', 'b1-food-tests'),
  cr('test', 'Biuret (protein)', 'Blue -> lilac/purple', 'b1-food-tests'),
  cr('test', 'Ethanol (fat)', 'Colourless -> white emulsion', 'b1-food-tests'),
  cr('colour', 'Hydrogencarbonate indicator', 'High CO2 yellow; normal CO2 red; low CO2 purple', 'b1-leaf-structure-gas-exchange', 'H'),
  cr('definition', 'Osmosis', 'Diffusion of water molecules from a dilute solution to a more concentrated solution through a selectively permeable membrane.', 'b2-osmosis'),
  cr('definition', 'Transpiration', 'Evaporation from mesophyll cells followed by diffusion through air spaces and stomata.', 'b2-transpiration-potometer'),
  cr('definition', 'Enzyme', 'A protein that acts as a biological catalyst, speeding up reactions without being used up.', 'b1-enzymes-and-digestion'),
  cr('definition', 'Denaturation', 'An irreversible change to the shape of the active site that inhibits enzyme action.', 'b1-enzyme-factors'),
  cr('definition', 'Homeostasis', 'Maintaining a constant internal environment for the proper functioning of cells and enzymes.', 'b1-blood-glucose-diabetes'),
  cr('definition', 'Hormone', 'A chemical messenger produced by a gland and released into the blood, which carries it to a target organ.', 'b1-blood-glucose-diabetes'),
  cr('definition', 'Genome', 'The entire genetic material of an organism.', 'b2-genome-chromosomes-dna'),
  cr('definition', 'Allele', 'A different form of the same gene.', 'b2-genome-chromosomes-dna'),
  cr('definition', 'Meiosis', 'Reduction division: one cell producing four genetically different haploid daughter cells.', 'b2-mitosis-meiosis'),
  cr('definition', 'Mitosis', 'Exact duplication of chromosomes producing daughter cells genetically identical to the parent cell.', 'b2-mitosis-meiosis'),
  cr('definition', 'Health', 'Being free from communicable and non-communicable disease.', 'b2-health-communicable-diseases-aseptic'),
  cr('definition', 'Ecosystem terms', 'Biodiversity, population, habitat, environment, community, ecosystem - CCEA Biology Glossary of Terms wording.', 'b1-fieldwork-sampling'),
  cr('series', 'Active transport', 'Movement of substances against a concentration gradient using energy from respiration (Higher).', 'b1-minerals-eutrophication', 'H'),
];
