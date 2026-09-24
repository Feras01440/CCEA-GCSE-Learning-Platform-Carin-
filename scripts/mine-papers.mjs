#!/usr/bin/env node
// EXTRACTION stage of the past-paper knowledge-distillation pipeline.
//
// Reads the PRIVATE local corpus in docs/sources/papers/<subject>/<sessionKey>/*.pdf (+ pdftotext -layout .txt)
// and writes METADATA ONLY (never question text, never mark-scheme answers) to:
//   data/papers/questions-index.json     per Standard question paper: questions, parts, tariffs, pages, labels
//   data/papers/mark-scheme-lexicon.json mark codes + generic marking phrases per subject (counts only)
//   data/papers/stats.json               per subject/unit statistics + per-session table
// Re-runnable / idempotent: everything is recomputed from whatever files exist right now, outputs carry no
// timestamps, and missing .txt files are produced with `pdftotext -layout` on the fly.
// Heuristics, accuracy checks and failure modes are documented in data/papers/MINING-README.md.
//
// Usage:  node scripts/mine-papers.mjs [--quiet] [--subject maths|further-maths|science] [--debug <feedId>[,<feedId>...]]
//   --debug prints the parsed structure of the given papers (question numbers, parts, tariffs, pages: numbers only).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "docs/sources/papers");
const OUT = path.join(ROOT, "data/papers");
const args = process.argv.slice(2);
const QUIET = args.includes("--quiet");
const ONLY = args.includes("--subject") ? args[args.indexOf("--subject") + 1] : null;
const DEBUG = new Set(args.includes("--debug") ? String(args[args.indexOf("--debug") + 1] || "").split(",").filter(Boolean) : []);
const log = (...a) => { if (!QUIET) console.log(...a); };

const index = JSON.parse(fs.readFileSync(path.join(OUT, "index.json"), "utf8"));
const byId = new Map(index.papers.map((p) => [String(p.id), p]));

// ---------------------------------------------------------------------------------------------
// 1. Discovery
// ---------------------------------------------------------------------------------------------
function discover() {
  const found = [];
  if (!fs.existsSync(SRC)) return found;
  for (const subject of fs.readdirSync(SRC).sort()) {
    if (ONLY && subject !== ONLY) continue;
    const sdir = path.join(SRC, subject);
    if (!fs.statSync(sdir).isDirectory()) continue;
    for (const session of fs.readdirSync(sdir).sort()) {
      const dir = path.join(sdir, session);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const f of fs.readdirSync(dir).sort()) {
        const m = f.match(/-(Paper|MS)-(\d+)\.pdf$/);
        if (!m) continue;
        const pdf = path.join(dir, f);
        const txt = pdf.replace(/\.pdf$/, ".txt");
        const meta = byId.get(m[2]);
        if (!meta) { found.push({ pdf, txt, id: m[2], skip: "feed id not in index.json" }); continue; }
        if (meta.type !== "Standard") { found.push({ pdf, txt, id: m[2], meta, skip: "not a Standard paper" }); continue; }
        if (!fs.existsSync(txt) || fs.statSync(txt).size < 200) {
          try { execFileSync("pdftotext", ["-layout", pdf, txt], { stdio: "ignore" }); }
          catch (e) { found.push({ pdf, txt, id: m[2], meta, skip: "pdftotext failed: " + e.message }); continue; }
        }
        if (!fs.existsSync(txt)) { found.push({ pdf, txt, id: m[2], meta, skip: "no .txt produced" }); continue; }
        found.push({ pdf, txt, id: m[2], meta, kind: meta.kind });
      }
    }
  }
  return found;
}

// ---------------------------------------------------------------------------------------------
// 2. Shared text helpers
// ---------------------------------------------------------------------------------------------
const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40 };
function wordsToNumber(s) {
  if (!s) return null;
  let n = 0, any = false;
  for (const w of s.toLowerCase().replace(/-/g, " ").split(/\s+/)) {
    if (NUMBER_WORDS[w] != null) { n += NUMBER_WORDS[w]; any = true; }
    else if (/^\d+$/.test(w)) { n += +w; any = true; }
  }
  return any ? n : null;
}

// pdftotext emits \f at the start of every page after the first and one trailing \f.
function paginate(text) {
  const raw = text.split(/\r?\n/);
  const lines = [], pages = [];
  let page = 1;
  for (const r of raw) {
    const ff = (r.match(/\f/g) || []).length;
    page += ff;
    lines.push(r.replace(/\f/g, ""));
    pages.push(page);
  }
  const ffTotal = (text.match(/\f/g) || []).length;
  const pageCount = /\f\s*$/.test(text) ? ffTotal : ffTotal + 1;
  return { lines, pages, pageCount };
}

// Structural (non-content) material: page barcodes (*16GMC7103*), print job numbers (12995.06 R), "[Turn over".
const BARCODE_TOKEN_RE = /\*\d*[A-Z]{2,6}\d+\*/g;
const JOBNO_PREFIX_RE = /^\s*\d{4,6}(?:\.\d+)?\s*[A-Z]?(?=\s|$)/;
const TURNOVER_RE = /\[Turn over\s*$/i;
function contentOf(line) {
  return line.replace(BARCODE_TOKEN_RE, "").replace(JOBNO_PREFIX_RE, "").replace(TURNOVER_RE, "")
    .replace(/^\s*(BLANK PAGE|DO NOT WRITE ON THIS PAGE)\s*$/i, "");
}
const isStructural = (line) => contentOf(line).trim() === "";

// Command words: longest alternatives first so "Show that" beats "Show", "Write down" beats "Write".
const COMMAND_WORDS = [
  "Show that", "Show, by", "Write down", "Work out", "Give a reason", "Give reasons", "Give one reason", "Give two reasons",
  "Give three reasons", "Fill in", "Put a tick", "Put a cross", "Make .{1,20} the subject", "Use your", "Using your",
  "Calculate", "Find", "Solve", "Expand", "Simplify", "Factorise", "Explain", "Describe", "Draw", "Plot", "Estimate",
  "Prove", "State", "Construct", "Complete", "Sketch", "Evaluate", "Express", "Hence", "Use", "Suggest", "Name",
  "Identify", "Compare", "Determine", "Measure", "Label", "Justify", "Round", "Convert", "Change", "List", "Rearrange",
  "Shade", "Reflect", "Rotate", "Translate", "Enlarge", "Mark", "Tick", "Circle", "Match", "Predict", "Define",
  "Outline", "Discuss", "Deduce", "Verify", "Show", "Comment", "Interpret", "Balance", "Insert", "Underline", "Choose",
  "Select", "Write", "Investigate", "Differentiate", "Integrate", "Obtain", "Derive", "Decide", "Test",
  "Add", "Multiply", "Divide", "Increase", "Decrease", "Order", "Arrange", "Continue", "Copy", "Read", "Check",
  "Which", "What", "How many", "How much", "Why",
];
const COMMAND_RE = new RegExp("\\b(" + COMMAND_WORDS.map((w) => w.replace(/ /g, "\\s+")).join("|") + ")\\b", "g");
function normaliseCommand(w) {
  w = w.replace(/\s+/g, " ");
  if (/^Give (a|one|two|three) reasons?$/.test(w) || w === "Give reasons") return "Give a reason";
  if (/^Make .* the subject$/.test(w)) return "Make the subject";
  if (w === "Using your") return "Use your";
  if (w === "Show, by") return "Show that";
  return w;
}
const QUESTION_FORMS = /^(Which|What|How many|How much|Why|Use your|Hence|Use)$/;

const DIAGRAM_RE = /\bdiagrams?\b|\bgraphs?\b|\bgrid\b|\baxes\b|\bfigure\b|\bcharts?\b|\bmaps?\b|\bsketch\b|\bpictures?\b|\bphotographs?\b|\bscale drawing\b|not drawn accurately|not to scale|\bimage\b|\belevation\b|\bshown (below|above|opposite)\b/i;
const DIAGRAM_STRONG_RE = /diagram not drawn accurately|not drawn accurately|not to scale/i;
const TABLE_RE = /\btables?\b/i;
const QWC_RE = /quality of (your )?written communication|written communication skills/i;

// Fixed topic lexicon used to build neutral <=12-word identification labels. Only these fixed tags ever reach the
// output, so no question wording is reproduced. Grouped by subject so a biology tag never labels a maths question.
const TOPICS_MATHS = [
  // statistics & probability
  [/cumulative frequency/i, "cumulative frequency"], [/histogram/i, "histogram"], [/frequency polygon/i, "frequency polygon"],
  [/box plot|box-and-whisker/i, "box plot"], [/stem[- ]and[- ]leaf/i, "stem and leaf"], [/scatter/i, "scatter graph"],
  [/pie chart/i, "pie chart"], [/bar chart/i, "bar chart"], [/\bvenn\b/i, "Venn diagram"], [/tree diagram/i, "tree diagram"],
  [/two[- ]way table/i, "two-way table"], [/relative frequency/i, "relative frequency"], [/probability/i, "probability"],
  [/interquartile/i, "interquartile range"], [/\bmedian\b/i, "median"], [/\bmean\b/i, "mean"], [/\bmode\b|\bmodal\b/i, "mode"],
  [/stratified/i, "stratified sample"], [/\bsample\b|\bsampling\b/i, "sampling"], [/\brange\b/i, "range"],
  [/moving average/i, "moving average"], [/time series/i, "time series"], [/correlation/i, "correlation"],
  [/line of best fit/i, "line of best fit"], [/frequency table|frequency density|\bfrequency\b/i, "frequency table"],
  [/\bquestionnaire\b|\bsurvey\b|\bbias/i, "data collection"], [/\bpercentile|\bquartile/i, "quartiles"],
  // number
  [/standard form/i, "standard form"], [/\bsurd/i, "surds"], [/\bindices\b|\bindex form\b|\bpower of\b/i, "indices"],
  [/recurring/i, "recurring decimal"], [/lowest terms|simplest form/i, "simplest form"], [/\bratio\b/i, "ratio"],
  [/percentage|per cent|\d ?%/i, "percentage"], [/\bfraction/i, "fractions"], [/\bdecimal/i, "decimals"],
  [/upper bound|lower bound|\bbounds?\b|error interval/i, "bounds / accuracy"], [/to the nearest/i, "rounding"],
  [/significant figure/i, "significant figures"], [/decimal place/i, "decimal places"], [/\bestimate\b|\bapproximat/i, "estimation"],
  [/prime factor|\bHCF\b|\bLCM\b|highest common factor|lowest common multiple|\bmultiple\b|\bfactor\b|\bprime\b/i, "factors / multiples / primes"],
  [/exchange rate|currency|\beuro|\bdollar/i, "currency conversion"], [/best value|best buy|better value/i, "best value"],
  [/compound interest|simple interest|\binterest\b/i, "interest"], [/depreciat/i, "depreciation"],
  [/\bprofit\b|\bloss\b|\bcost\b|\bprice\b|\bwages?\b|\bsalary\b|\bVAT\b|\bbill\b|\bpay\b|\bpaid\b/i, "money"],
  [/timetable|\bhours\b|\bminutes\b|\bam\b|\bpm\b|\bo'clock\b/i, "time"], [/direct(ly)? proportion|proportional/i, "proportion"],
  [/inverse(ly)? proportion/i, "inverse proportion"], [/\bspeed\b|\bvelocity\b|\bdistance\b/i, "speed / distance / time"],
  [/\bdensity\b|\bmass\b/i, "density / mass"], [/\bpressure\b/i, "pressure"], [/number line/i, "number line"],
  [/negative number|temperature/i, "negative numbers"], [/\bsquare root|\bcube root|\bsquare number|\bcube number/i, "squares / roots"],
  [/\bBIDMAS\b|order of operations/i, "order of operations"], [/\bmultiply\b|\bdivide\b|\bproduct\b/i, "arithmetic"],
  // algebra
  [/simultaneous/i, "simultaneous equations"], [/quadratic/i, "quadratic"], [/inequalit/i, "inequality"],
  [/\bfactoris/i, "factorising"], [/\bexpand\b/i, "expanding brackets"], [/\bsimplify\b/i, "simplifying"],
  [/nth term|\bsequence\b|\bpattern\b/i, "sequences / patterns"], [/\bgradient\b/i, "gradient"], [/\bmidpoint\b/i, "midpoint"],
  [/equation of (the|a) (straight )?line|y\s*=\s*mx/i, "straight-line equation"], [/perpendicular/i, "perpendicular"], [/parallel/i, "parallel"],
  [/rearrange|make .{1,12} the subject|change the subject/i, "rearranging formulae"], [/\bformula\b/i, "formula"],
  [/\bsubstitut/i, "substitution"], [/algebraic fraction/i, "algebraic fractions"], [/completing the square/i, "completing the square"],
  [/\bfunction\b|f\(x\)|g\(x\)/i, "functions"], [/iteration|iterative/i, "iteration"], [/\bcubic\b/i, "cubic graph"],
  [/reciprocal/i, "reciprocal graph"], [/exponential/i, "exponential"], [/trial and improvement/i, "trial and improvement"],
  [/\bexpression\b/i, "expression"], [/\bequation\b/i, "equation"], [/\bprove\b|\bproof\b/i, "proof"], [/counter[- ]example/i, "counter-example"],
  [/number machine|function machine/i, "function machine"], [/conversion graph/i, "conversion graph"],
  [/distance[- ]time/i, "distance-time graph"], [/velocity[- ]time|speed[- ]time/i, "velocity-time graph"], [/\bgraph\b/i, "graph"],
  [/\bcoordinates?\b/i, "coordinates"], [/\bidentity\b|\bidentities\b/i, "identities"],
  // geometry
  [/pythagoras/i, "Pythagoras"], [/sine rule/i, "sine rule"], [/cosine rule/i, "cosine rule"], [/trigonometr|\bsin\b|\bcos\b|\btan\b/i, "trigonometry"],
  [/\bbearing/i, "bearings"], [/exterior angle|interior angle|regular polygon/i, "polygon angles"], [/\bangle/i, "angles"],
  [/circle theorem|\bchord\b|\btangent\b|cyclic quadrilateral/i, "circle theorems"], [/\barc\b|\bsector\b/i, "arc / sector"],
  [/\bcircumference\b|\bcircle\b/i, "circle"], [/\bcylinder/i, "cylinder"], [/\bcone\b/i, "cone"], [/\bsphere|hemisphere/i, "sphere"],
  [/\bprism\b/i, "prism"], [/\bpyramid\b/i, "pyramid"], [/\bcuboid\b|\bcube\b/i, "cuboid"], [/surface area/i, "surface area"],
  [/\bvolume\b/i, "volume"], [/\barea\b/i, "area"], [/\bperimeter\b/i, "perimeter"], [/\bsimilar\b/i, "similar shapes"],
  [/\bcongruen/i, "congruence"], [/\benlarge/i, "enlargement"], [/\brotat/i, "rotation"], [/\breflect/i, "reflection"],
  [/\btranslat/i, "translation"], [/\bvector/i, "vectors"], [/\bconstruct|compasses|bisector/i, "construction"],
  [/\blocus\b|\bloci\b|\bregion\b/i, "loci"], [/\belevation\b/i, "plans and elevations"], [/\bnet\b/i, "nets"],
  [/scale factor|\bscale\b/i, "scale"], [/\bsymmetry\b/i, "symmetry"], [/\btriangle\b/i, "triangle"], [/\btrapezium\b/i, "trapezium"],
  [/\brectangle\b|\bsquare\b/i, "rectangle / square"], [/\bparallelogram\b|\brhombus\b|\bkite\b|\bquadrilateral\b/i, "quadrilateral"],
  [/\bunits?\b|\bconvert/i, "units"],
];
const TOPICS_FM = [
  [/\bmatri(x|ces)\b/i, "matrices"], [/\bdifferentiat|\bderivative|dy\/dx/i, "differentiation"], [/\bintegrat/i, "integration"],
  [/stationary point|turning point|maximum|minimum/i, "stationary points"], [/\blogarithm|\blog\b|\bln\b/i, "logarithms"],
  [/\bradian/i, "radians"], [/\bmoments?\b/i, "moments"], [/\bfriction/i, "friction"], [/\bprojectile/i, "projectiles"],
  [/\bacceleration\b|\bkinematic|\bsuvat\b/i, "kinematics"], [/newton'?s? (second|first|third) law|\bresultant\b|\bforces?\b/i, "forces"],
  [/\bmomentum\b|\bimpulse\b/i, "momentum"], [/\bcollision\b/i, "collisions"], [/\bequilibrium\b/i, "equilibrium"],
  [/\bregression\b/i, "regression"], [/remainder theorem|factor theorem|\bpolynomial\b/i, "polynomials"],
  [/binomial (expansion|theorem)/i, "binomial expansion"], [/binomial distribution/i, "binomial distribution"], [/normal distribution/i, "normal distribution"],
  [/arithmetic (series|sequence|progression)/i, "arithmetic series"], [/geometric (series|sequence|progression)/i, "geometric series"],
  [/\bseries\b|\bsigma\b|Σ/i, "series"], [/partial fraction/i, "partial fractions"], [/\bmodulus\b/i, "modulus"],
  [/\bcomplex number/i, "complex numbers"], [/\bpower\b|\bwork done\b|\benergy\b/i, "work / energy / power"],
  [/\btension\b|\bpulley|\bstring\b/i, "connected particles"], [/\binclined plane|\bslope\b|\bincline/i, "inclined plane"],
  [/\bcentre of mass|\bcentroid\b/i, "centre of mass"], [/\bindex number|\bweighted/i, "index numbers"],
  [/spearman|rank correlation/i, "Spearman rank"], [/standard deviation|\bvariance\b/i, "variance / standard deviation"],
  [/expected value|\bexpectation\b|E\(X\)/, "expectation"], [/random variable/i, "random variable"],
  [/mutually exclusive|independent events|conditional probability/i, "combined events"], [/\bcritical path|\bnetwork\b|\bactivity\b/i, "critical path analysis"],
  [/\bboolean|\blogic gate|\btruth table|\bNOR\b|\bNAND\b|\bXOR\b/i, "logic / Boolean algebra"], [/\bflow ?chart|\balgorithm/i, "algorithms"],
  [/\bbin packing|\bfirst fit\b/i, "bin packing"], [/\bpermutation|\bcombination|\barrangement/i, "permutations / combinations"],
  [/\bcircle\b.*\bcentre\b|\bequation of (a|the) circle/i, "circle equation"], [/\btrapezium rule|\bsimpson/i, "numerical integration"],
  [/\bvector/i, "vectors"], [/\bvelocity\b|\bdisplacement\b|\bdistance\b/i, "motion"],
];
const TOPICS_SCIENCE = [
  // biology
  [/\benzyme/i, "enzymes"], [/photosynthesis/i, "photosynthesis"], [/\brespiration/i, "respiration"], [/\bosmosis/i, "osmosis"],
  [/\bdiffusion/i, "diffusion"], [/active transport/i, "active transport"], [/\bmitosis/i, "mitosis"], [/\bmeiosis/i, "meiosis"],
  [/\bDNA\b|\bchromosome|\bgene\b|\bgenes\b|\ballele/i, "genetics"], [/punnett|genetic cross|\bheterozygous|\bhomozygous/i, "genetic cross"],
  [/\becosystem|\bhabitat|\bbiodiversity|\bquadrat/i, "ecology"], [/food chain|food web|\bpyramid of/i, "food chains / webs"],
  [/carbon cycle|nitrogen cycle|\bdecompos/i, "nutrient cycles"], [/\bdigest|\bstomach|\bintestine|\bvillus|\bvilli/i, "digestion"],
  [/\bheart\b|\bartery|\bvein\b|\bcapillar|\bblood\b/i, "circulatory system"], [/\blung|\balveol|\bbreathing|\bgas exchange/i, "breathing / gas exchange"],
  [/\bnervous|\breflex|\bneurone|\bsynapse/i, "nervous system"], [/\bhormone|\binsulin|\bglucagon|\badrenalin|\boestrogen|\bprogesterone|\bmenstrual/i, "hormones"],
  [/\bhomeostasis|\bkidney|\bnephron|\burea\b|\bdialysis/i, "homeostasis / excretion"], [/\btranspiration|\bstomata|\bxylem|\bphloem/i, "plant transport"],
  [/\bmicroorganism|\bbacteri|\bvirus|\bantibiotic|\bvaccin|\bimmune|\bpathogen|\bwhite blood/i, "microbes / immunity"],
  [/natural selection|\bevolution|\bDarwin|\bfossil/i, "evolution"], [/\bclassif|\bspecies\b|\bkingdom/i, "classification"],
  [/\bcell membrane|\bnucleus\b|\bcytoplasm|\bchloroplast|\bcell wall|\bvacuole|\bmitochondri|\bribosome|\bcells?\b/i, "cells"],
  [/\bplant\b|\bleaf\b|\bleaves\b|\broot\b/i, "plants"], [/\bpopulation\b|\bpredator|\bprey\b/i, "populations"], [/\bgerminat/i, "germination"],
  [/\bcloning|\bgenetic engineering|\bselective breeding|\bstem cell/i, "biotechnology"], [/\bvariation\b/i, "variation"],
  [/\bsmoking|\balcohol|\bdrug|\bobesity|\bexercise|\bheart disease|\bcancer/i, "health"], [/\beye\b|\bretina|\bpupil\b|\biris\b/i, "the eye"],
  // chemistry
  [/periodic table|\bgroup [0178]\b|\bhalogen|\balkali metal|\bnoble gas|\btransition metal/i, "periodic table"],
  [/\bproton|\bneutron|\belectron|\batomic number|\bmass number|\bisotope/i, "atomic structure"],
  [/\bionic bond|\bcovalent|\bmetallic bond|\bgiant|\bmolecul|\blattice|\bbonding\b/i, "bonding / structure"],
  [/\bmole\b|\bmoles\b|relative formula mass|relative atomic mass|\bRFM\b|\bRAM\b|\bMr\b/i, "moles / RFM"],
  [/reacting mass|percentage yield|\byield\b|\bempirical formula|\bmolecular formula/i, "quantitative chemistry"],
  [/\bacid|\balkali|\bneutralis|\bpH\b|\bindicator\b/i, "acids / alkalis"], [/\btitration|\bburette|\bpipette/i, "titration"],
  [/\bsalt\b|\bsalts\b|\bcrystallis/i, "salts"], [/\belectrolysis|\belectrode|\bcathode|\banode/i, "electrolysis"],
  [/\boxidation|\breduction|\bredox|\boxidis|\breduc(ed|ing) agent/i, "redox"], [/rate of reaction|collision theory|\brate\b/i, "rates of reaction"],
  [/reversible|\bHaber|\bcontact process/i, "equilibrium"], [/exothermic|endothermic|bond energy|energy change|\benthalpy/i, "energy changes"],
  [/\bhydrocarbon|\balkane|\balkene|\balcohol|carboxylic|\bester|\bpolymer|crude oil|fractional distillation|\bcracking/i, "organic chemistry"],
  [/water treatment|\bhard water|\bhardness|\bchlorinat/i, "water"], [/reactivity series|\bdisplacement|\bextract|\bblast furnace|\bore\b/i, "metals / reactivity"],
  [/\brusting|\bcorrosion/i, "rusting"], [/flame test|test for|\bidentify the gas|\bgas test|\blimewater|\bglowing splint|\bsqueaky pop/i, "chemical tests"],
  [/chromatograph/i, "chromatography"], [/\bsolub|\bsaturated solution|\bsolvent|\bsolute/i, "solubility"], [/\bconcentration/i, "concentration"],
  [/symbol equation|\bbalanc(e|ed) (the )?equation|half[- ]equation|ionic equation|state symbols/i, "chemical equations"],
  [/\bcompound|\belement\b|\bmixture|\bfiltrat|\bdistillat|\bseparat/i, "elements / compounds / mixtures"], [/\bcatalyst/i, "catalysts"],
  [/\bcarbon dioxide|\bgreenhouse|\bclimate|\bacid rain|\bpollut/i, "environmental chemistry"], [/\bnanoparticle|\bnanoscience/i, "nanoscience"],
  // physics
  [/\bstopping distance|\bbraking|\bthinking distance/i, "stopping distance"], [/\bhooke|\bspring\b|\bextension\b/i, "Hooke's law"],
  [/kinetic energy|potential energy|\bGPE\b|\bKE\b/i, "energy stores"], [/\befficien/i, "efficiency"], [/\bcircuit|\bcurrent\b|\bvoltage|potential difference|\bresist|\bohm/i, "circuits"],
  [/\bthermistor|\bLDR\b|\bdiode|\bLED\b/i, "components"], [/\bkilowatt|\bkWh\b|\bmains\b|\bfuse\b|\bearth wire|\bplug\b/i, "domestic electricity"],
  [/\btransformer|\bgenerator|\bmotor\b|\bmagnet|\bsolenoid|\binduction/i, "electromagnetism"], [/\bstatic electricity|\bcharge\b/i, "static / charge"],
  [/\bwavelength|\bamplitude|\btransverse|\blongitudinal|\bwave\b|\bwaves\b/i, "waves"], [/\bultrasound|\bsound\b|\becho/i, "sound"],
  [/electromagnetic spectrum|\bmicrowave|\binfrared|\bultraviolet|\bX-ray|\bradio wave/i, "EM spectrum"],
  [/\brefract|\bcritical angle|total internal|\blens|\bray diagram|\bfocal|\bmirror/i, "light / optics"],
  [/\bradioactiv|\balpha|\bbeta|\bgamma|half[- ]life|\bnuclear|\bfission|\bfusion|\bdecay\b/i, "radioactivity"],
  [/solar system|\bplanet|\borbit|\bstar\b|\bstars\b|\buniverse|big bang|red shift|\bgalax/i, "space"],
  [/specific heat|latent heat|\bthermal|\bconduction|\bconvection|\binsulat|\bheat\b/i, "thermal physics"],
  [/\brenewable|fossil fuel|\bwind turbine|\bsolar panel|\bhydroelectric|\bpower station/i, "energy resources"],
  [/\bweight\b|gravitational field|\bgravity/i, "weight / gravity"], [/terminal velocity|\bair resistance|\bdrag\b/i, "terminal velocity"],
  [/\blever|\bpivot|\bcentre of gravity|\bmoments?\b/i, "moments"], [/\bcrumple|\bseat belt|\bair ?bag|\bmomentum/i, "momentum / safety"],
  [/\bspeed\b|\bvelocity\b|\bacceleration\b|distance[- ]time|velocity[- ]time/i, "motion"], [/\bdensity\b/i, "density"], [/\bpressure\b/i, "pressure"],
  [/\bforces?\b|\bnewton/i, "forces"], [/\bpower\b|\bwork done\b|\benergy\b/i, "work / energy / power"],
  [/\bfrequency\b/i, "frequency"], [/\btemperature\b/i, "temperature"], [/\bgas\b|\bgases\b/i, "gases"],
  // practical / generic
  [/\bpractical|\bexperiment|\binvestigat|\bmethod\b|\bapparatus|\bvariable|\bfair test|\brepeat|\banomal/i, "practical / investigation"],
  [/\brisk|\bhazard|\bsafety/i, "safety"], [/\bconclusion|\bevaluat/i, "conclusion / evaluation"], [/\baccura|\bprecis|\breliab|\bvalid/i, "accuracy / reliability"],
  [/\bgraph\b|\bplot\b|\bline of best fit|\baxes\b/i, "graph work"], [/\bcalculate\b|\bformula\b|\bequation\b/i, "calculation"], [/\bunits?\b/i, "units"],
];
const DISCIPLINE_TAGS = {
  Biology: new Set(TOPICS_SCIENCE.slice(0, 32).map((t) => t[1])),
  Chemistry: new Set(TOPICS_SCIENCE.slice(32, 60).map((t) => t[1])),
  Physics: new Set(TOPICS_SCIENCE.slice(60, 88).map((t) => t[1])),
};
function topicLexicon(meta) {
  if (meta.subject === "science") return TOPICS_SCIENCE;
  if (meta.subject === "further-maths") return [...TOPICS_FM, ...TOPICS_MATHS];
  return TOPICS_MATHS;
}
function topicTags(text, meta, max = 3) {
  const hits = [];
  const preferred = meta.subject === "science" && DISCIPLINE_TAGS[meta.discipline] ? DISCIPLINE_TAGS[meta.discipline] : null;
  for (const [re, tag] of topicLexicon(meta)) {
    if (hits.some((h) => h.tag === tag)) continue;
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    let m, count = 0, first = -1;
    while ((m = g.exec(text)) && count < 5) { if (first < 0) first = m.index; count++; if (m[0] === "") break; }
    if (!count) continue;
    const specific = /[ \/]/.test(tag) || tag.length > 9 ? 1 : 0;
    hits.push({ tag, at: first, score: Math.min(count, 3) + specific + (preferred && preferred.has(tag) ? 1 : 0) });
  }
  hits.sort((a, b) => b.score - a.score || a.at - b.at);
  return hits.slice(0, max).map((h) => h.tag);
}
function clampWords(s, n) {
  const w = s.split(/\s+/).filter(Boolean);
  return w.length <= n ? s : w.slice(0, n).join(" ");
}
const UNIT_RE = /^(£|€|\$|%|°|°C|cm|mm|m|km|kg|g|mg|ml|l|litres?|cm2|cm3|m2|m3|mm2|km2|km\/h|mph|m\/s|m\/s2|N|J|kJ|MJ|W|kW|kWh|Pa|kPa|N\/cm2|N\/m2|Hz|V|A|Ω|ohms?|s|h|hrs?|hours?|mins?|minutes?|seconds?|years?|days?|weeks?|months?|p|pence|degrees?|mol|g\/cm3|kg\/m3|tonnes?|miles?|ft|inches?|K|units?)$/i;

// ---------------------------------------------------------------------------------------------
// 3. Question-paper parser
// ---------------------------------------------------------------------------------------------
// CCEA prints the tariff "[n]" at the END of the answer line (or alone on a line under the answer space).
// Mid-line "[n]" are never tariffs: tick glyphs from a dingbat font ("Tick [✓] the box" -> "[3]"/"[4]"),
// matrix/vector notation ("Q = [71]") and similar. Two artefacts are tolerated at line end: a trailing "_"
// and the 2018/2019 science margin words ("Examiner Only", "Marks Remark"). Overprinted bold text doubles
// glyphs ("[[55]]" for "[5]"), which is undone here. Anything above MAX_TARIFF is rejected as noise.
const MAX_TARIFF = 12;
const TARIFF_TOKEN_RE = /\[(\[?)(\d{1,2})(\]?)\]/g;
const MARGIN_RE = /\s+(?:Examiner Only|Marks Remark|Marks|Remark)\s*$/;
function tariffOf(line) {
  const L = line.replace(TURNOVER_RE, "").replace(MARGIN_RE, "");
  let m, last = null;
  TARIFF_TOKEN_RE.lastIndex = 0;
  while ((m = TARIFF_TOKEN_RE.exec(L))) last = m;
  if (!last) return null;
  // the tail after the tariff must not be prose (tick glyphs: "[3] in the box"; matrices: "[2] and R = ...");
  // a short unit or algebra fragment is tolerated ("[4]m/s", "[3] = d", "[1]_")
  const tail = L.slice(last.index + last[0].length).trim();
  if (tail.length > 16 || /(?:^|\s)[a-z][a-z]/.test(tail)) return null;
  let digits = last[2];
  if (digits.length === 2 && digits[0] === digits[1] && (last[1] || last[3])) digits = digits[0];
  const value = +digits;
  if (value < 1 || value > MAX_TARIFF) return null;
  return value;
}
const tariffTail = (line) => { const L = line.replace(TURNOVER_RE, "").replace(MARGIN_RE, ""); let m, last = null; TARIFF_TOKEN_RE.lastIndex = 0; while ((m = TARIFF_TOKEN_RE.exec(L))) last = m; return last ? L.slice(0, last.index) : L; };
const PART_RE = /^\s{0,16}(?:\d{1,2}\s+)?\(([a-h]|i|ii|iii|iv|v|vi|vii|viii|ix|x)\)(?:\s*\(([ivx]{1,4})\))?(?=\s|$|[A-Z(])/;
const ROMAN = new Set(["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"]);
const isRoman = (s) => ROMAN.has(s);
const END_RE = /THIS IS THE END OF THE QUESTION PAPER|END OF QUESTION PAPER/i;
// Lower-case openers after a number mean a sentence fragment that wrapped onto a new line ("2 of the pupils",
// "4 red." , "1 hour"), never a question start (which is capitalised). Case-sensitive on purpose.
const CONTINUATION_WORDS = /^(of|and|or|to|in|on|is|are|was|were|the|a|an|for|with|by|from|at|per|marks?|hours?|hrs?|minutes?|mins?|seconds?|cm|mm|km|kg|ml|litres?|mph|%|°|red|blue|green|black|white|yellow|more|less|times|people|pupils|students|men|women|boys|girls|cards|balls|counters|sweets|coins|tiles)\b/;
// Question-number line shapes seen in pdftotext -layout output of CCEA papers:
//   "12 Toby walks ..."            plain (indent 0-3; continuation lines are indented 5+)
//   "3      y" / "16   8 11 14 17"  number followed by an axis label or by the sequence itself
//   "2A B" / "9P   62° Q"           number glued to a diagram vertex label
//   "Cumulative frequency16 The..." a rotated y-axis title emitted glued in front of the number (page top)
//   "Force4 (a) ..." / "[ ] 5 (i)"  a diagram label or matrix bracket glued in front of the number
const QSTART_RE = /^( *)([^\d\s][^\d]{0,40}?)?(\d{1,2})(?![\d.,%])(?:([A-Z])(?=\s|$)|\s+|(?=\()|$)(.*)$/;

function parsePaper(text, meta) {
  const { lines, pages, pageCount } = paginate(text);
  const warnings = [];
  const head = lines.slice(0, Math.min(lines.length, 120)).join("\n");
  const totalStated = (() => { const m = head.match(/total marks? for this paper is (\d+)/i); return m ? +m[1] : null; })();
  const qcStated = (() => {
    let m = head.match(/Answer all parts of Questions? ([\d ,and]+)/i);
    if (m) return (m[1].match(/\d+/g) || []).length || 1;
    m = head.match(/Answer all ([a-z\- ]+?) questions/i);
    return m ? wordsToNumber(m[1]) : null;
  })();
  const calcStmt = (() => { const m = head.match(/You (must not|may|may not|are not permitted to) use a calculator/i); return m ? !/not/.test(m[1]) : null; })();
  const qwcStated = (() => { const m = head.match(/written communication will be assessed in Questions? (\d+)/i); return m ? String(+m[1]) : null; })();
  let formulaSheetPage = (() => { const m = head.match(/Formula Sheet is on page (\d+)/i); return m ? +m[1] : null; })();
  if (!formulaSheetPage) {
    for (let i = 0; i < lines.length; i++) if (/^\s*Formula Sheet\s*$/i.test(lines[i]) && pages[i] > 1 && pages[i] <= 3) { formulaSheetPage = pages[i]; break; }
  }
  // body: after the front page and (for maths / FM) the formula sheet, up to the END marker
  const firstBodyPage = Math.max(2, (formulaSheetPage && formulaSheetPage <= 3 ? formulaSheetPage : 1) + 1);
  let bodyStart = lines.findIndex((_, i) => pages[i] >= firstBodyPage);
  if (bodyStart < 0) bodyStart = 0;
  const qbo = lines.findIndex((l) => /Questions begin overleaf/i.test(l));
  if (qbo > bodyStart) bodyStart = qbo + 1;
  let bodyEnd = lines.findIndex((l, i) => i > bodyStart && END_RE.test(l));
  if (bodyEnd < 0) { bodyEnd = lines.length; warnings.push("no END marker"); }

  // first content line of each page (skipping barcodes / job numbers / "[Turn over")
  const pageTop = new Array(lines.length).fill(false);
  { let last = 0; for (let i = 0; i < lines.length; i++) if (pages[i] !== last && !isStructural(lines[i])) { pageTop[i] = true; last = pages[i]; } }

  // --- raw tariffs (line-end only) --------------------------------------------------------
  const tariffAt = new Map(); // line -> value
  for (let i = bodyStart; i < bodyEnd; i++) { const v = tariffOf(lines[i]); if (v != null) tariffAt.set(i, v); }
  const tariffLines = [...tariffAt.keys()].sort((a, b) => a - b);
  const tariffBetween = (a, b) => tariffLines.some((l) => l > a && l < b); // strictly between two start lines
  // a tariff printed on the NEXT question's opening line is (nearly always) the previous question's answer line,
  // laid out to the right at the same height, so it counts as evidence for the earlier question
  const tariffBetweenIncl = (a, b) => tariffLines.some((l) => l > a && l <= b);
  const isPartLine = (i) => PART_RE.test(lines[i]);

  // --- question starts: weighted candidates + longest-chain dynamic programme ---------------
  const maxQ = qcStated ? qcStated + 2 : 40;
  const cands = [];
  for (let i = bodyStart; i < bodyEnd; i++) {
    if (isStructural(lines[i])) continue;
    const m = lines[i].match(QSTART_RE);
    if (!m) continue;
    const n = +m[3];
    if (n < 1 || n > maxQ) continue;
    const prefix = m[2] || "", glued = m[4] || "";
    // a glued prefix is an axis title or stray label (<= 4 words, never a part label or running text)
    if (prefix && (/^\(([a-h]|[ivx]{1,4})\)/.test(prefix.trim()) || (prefix.trim().match(/\S+/g) || []).length > 4 || glued)) continue;
    const rest = (glued + (glued ? " " : "") + (m[5] || "")).trim();
    if (CONTINUATION_WORDS.test(rest)) continue;                     // "2 of the pupils", "1 hour", "4 cm"
    let structural = false, prevTariff = false, prevText = false;
    if (pageTop[i]) structural = true;
    else {
      let p = i - 1; while (p > bodyStart && pages[p] === pages[i] && (lines[p].trim() === "" || isStructural(lines[p]))) p--;
      if (p > bodyStart && pages[p] === pages[i]) {
        if (tariffAt.has(p)) { prevTariff = true; structural = true; }
        else if (!isPartLine(p) && (lines[p].match(/[A-Za-z]{2,}/g) || []).length >= 3) prevText = true;
      }
    }
    const partStart = /^\(([a-h]|i|ii|iii|iv)\)/.test(rest);
    if (prefix && !(structural || partStart)) continue;               // glued axis titles only occur at a page top
    const indent = m[1].length;
    if (indent > 6 && !(pageTop[i] && (prefix || partStart))) continue; // deep indents only for glued page-top openings
    const numericOnly = rest !== "" && !/[A-Za-z(£$€"'“]/.test(rest);
    if ((numericOnly || rest === "") && !structural) continue;        // table rows / lone numbers need structural evidence
    const words = (rest.match(/[A-Za-z]{2,}/g) || []).length;
    const numeric = (rest.match(/(?:^|\s)\d+(?:\.\d+)?(?=\s|$)/g) || []).length;
    let s = 0;
    if (pageTop[i]) s += 3;
    if (prevTariff) s += 2;
    if (prevText) s -= 1.5;                                            // looks like a continuation of running text
    if (i > 0 && lines[i - 1].trim() === "") s += 1;
    const c0 = rest.charAt(0);
    if (/[A-Z(£$€"'“]/.test(c0)) s += 2; else if (/\d/.test(c0)) s += 1; else if (/[a-z]/.test(c0)) s -= 1; else s -= 0.5;
    s += Math.min(words, 6) * 0.3;
    if (numeric >= 3) s -= 2;
    if (numericOnly) s -= 1.5;
    if (/\.$/.test(rest) && words <= 2) s -= 2;
    if (prefix) s -= 1;
    if (glued) s -= 0.5;
    if (indent === 0) s += 0.5; else if (indent >= 5) s -= 1;
    cands.push({ n, line: i, score: s, restAt: lines[i].length - (m[5] || "").length - (glued ? glued.length + 1 : 0) });
  }
  // gap penalty per skipped number (weaker when the front page gives no count: numbered method steps in the
  // Unit 7 practical booklets must not be chased as questions), extra-question penalty, and a penalty for a
  // question that would contain no tariff at all
  const GAP = qcStated ? 3 : 1, EXTRA = 6, NO_TARIFF = 3;
  const best = new Array(cands.length).fill(-Infinity), prev = new Array(cands.length).fill(-1);
  const orphanPenalty = (line) => (tariffLines.length && tariffLines[0] < line ? 2 : 0);
  for (let c = 0; c < cands.length; c++) {
    const C = cands[c];
    let v = C.score - GAP * (C.n - 1) - orphanPenalty(C.line), pv = -1;
    for (let p = 0; p < c; p++) {
      const P = cands[p];
      if (P.n >= C.n || P.line >= C.line || best[p] === -Infinity) continue;
      const cand = best[p] + C.score - GAP * (C.n - P.n - 1) - (tariffBetweenIncl(P.line, C.line) ? 0 : NO_TARIFF);
      if (cand > v) { v = cand; pv = p; }
    }
    best[c] = v; prev[c] = pv;
  }
  let endC = -1, endV = -Infinity;
  for (let c = 0; c < cands.length; c++) {
    const n = cands[c].n;
    const v = best[c] - (qcStated ? GAP * Math.max(0, qcStated - n) + EXTRA * Math.max(0, n - qcStated) : 0);
    if (v > endV) { endV = v; endC = c; }
  }
  const chain = [];
  for (let c = endC; c >= 0; c = prev[c]) chain.push(cands[c]);
  chain.reverse();
  const lastNumber = Math.max(qcStated || 0, chain.length ? chain[chain.length - 1].n : 0);
  let starts = [];
  for (let n = 1; n <= lastNumber; n++) {
    const hit = chain.find((c) => c.n === n);
    starts.push(hit ? { number: n, line: hit.line, located: true, inferred: false, restAt: hit.restAt } : { number: n, line: null, located: false, inferred: false });
  }
  // Fallback for a number that never reached the text layer (e.g. printed inside a graphic): if the gap between
  // the neighbouring located questions contains exactly one page whose first content line reads like a question
  // opening (capital letter or digit, not a part label) and the previous question already has a tariff before it,
  // that page top is taken as the start and flagged "inferred".
  for (let k = 0; k < starts.length; k++) {
    if (starts[k].located || k === 0 || !starts[k - 1].located) continue;
    const from = starts[k - 1].line;
    const next = starts.slice(k + 1).find((s) => s.located);
    const to = next ? next.line : bodyEnd;
    const tops = [];
    for (let i = from + 1; i < to; i++) {
      if (!pageTop[i]) continue;
      const c = contentOf(lines[i]).trim();
      const firstPart = /^\((a|i)\)/.test(c);                        // "(a)" at a page top = a question whose number was lost
      if ((firstPart || (/^[A-Z0-9£]/.test(c) && !PART_RE.test(lines[i]))) && tariffBetween(from, i)) tops.push(i);
    }
    if (tops.length === 1) starts[k] = { number: starts[k].number, line: tops[0], located: true, inferred: true, restAt: 0 };
  }
  // --- tariffs -> question blocks and parts -----------------------------------------------
  const buildBlocks = () => {
    const located = starts.filter((s) => s.located);
    const startLine = new Set(located.map((s) => s.line));
    const blockOf = (line) => { let b = -1; for (let k = 0; k < located.length; k++) if (located[k].line <= line) b = k; return b; };
    const partAt = new Map(); // line -> part key, per located block
    const partInfo = located.map(() => ({ order: [], map: new Map() }));
    for (let k = 0; k < located.length; k++) {
      const s = located[k], endLine = k + 1 < located.length ? located[k + 1].line : bodyEnd;
      let letter = null, roman = null;
      for (let i = s.line; i < endLine; i++) {
        const L = i === s.line ? " ".repeat(Math.min(s.restAt || 0, 4)) + lines[i].slice(s.restAt || 0) : lines[i];
        const pm = L.match(PART_RE);
        if (pm) {
          if (isRoman(pm[1])) { if (pm[1] !== "x" || roman === "ix") { roman = pm[1]; } }
          else { letter = pm[1]; roman = pm[2] || null; }
          const key = letter ? (roman ? `${letter}(${roman})` : letter) : (roman ? `(${roman})` : "");
          if (key && !partInfo[k].map.has(key)) { partInfo[k].map.set(key, { part: key, marks: 0, page: pages[i], line: i }); partInfo[k].order.push(key); }
        }
        partAt.set(i, letter ? (roman ? `${letter}(${roman})` : letter) : (roman ? `(${roman})` : ""));
      }
      // A tariff printed at the right of a short part heading can be emitted on the line ABOVE the "(b)" label
      // (its baseline sits slightly higher). Signature: a tariff-only line directly after another tariff line and
      // directly before a part label of the same question -> it belongs to the part that follows.
      for (let i = s.line + 1; i + 1 < endLine; i++) {
        if (!tariffAt.has(i) || !tariffAt.has(i - 1) || contentOf(tariffTail(lines[i])).trim() !== "") continue;
        const pm = lines[i + 1].match(PART_RE);
        if (!pm || !partAt.has(i + 1)) continue;
        partAt.set(i, partAt.get(i + 1));
        const key = partAt.get(i + 1);
        if (key && partInfo[k].map.has(key)) partInfo[k].map.get(key).line = i;
      }
    }
    const raw = tariffLines.map((line) => {
      const before = contentOf(tariffTail(lines[line]));
      return {
        line, value: tariffAt.get(line), page: pages[line], block: blockOf(line), part: partAt.get(line) ?? "",
        answerish: /_{3,}/.test(before) || before.trim() === "" || /\btick\b|□|☐/i.test(before),
        labelled: (before.replace(/_+/g, " ").match(/[A-Za-z]{2,}/g) || []).length >= 2,   // "Cost of one apple £ ___ [4]"
        partLine: isPartLine(lines[line]) || startLine.has(line),
      };
    });
    // Two short questions on one page: the first question's answer line (and tariff) is often printed level with
    // the next question's opening line. A tariff on a start line therefore belongs to the previous question when
    // that question would otherwise have no tariff at all.
    for (let k = 1; k < located.length; k++) {
      if (raw.some((t) => t.block === k - 1)) continue;
      const t = raw.find((x) => x.line === located[k].line);
      if (t) { t.block = k - 1; t.part = ""; t.partLine = false; warnings.push(`tariff [${t.value}] on the opening line of Q${located[k].number} credited to Q${located[k - 1].number}`); }
    }
    return { located, startLine, partAt, partInfo, raw };
  };
  let { located, startLine, partAt, partInfo, raw } = buildBlocks();
  // Numbered method steps (Unit 7 practical booklets that say "Answer all questions" and never number their single
  // task) can be mistaken for questions: when at least half of the located "questions" hold no tariff at all,
  // everything is collapsed into one inferred question starting at the first content line of the body.
  {
    const zero = located.filter((_, k) => !raw.some((t) => t.block === k)).length;
    if (located.length >= 4 && zero * 2 >= located.length) {
      let first = bodyStart;
      while (first < bodyEnd && (lines[first].trim() === "" || isStructural(lines[first]))) first++;
      starts = [{ number: 1, line: first, located: true, inferred: true, restAt: 0 }];
      warnings.push(`numbered list mistaken for questions (${zero}/${located.length} without a tariff); collapsed to one question`);
      ({ located, startLine, partAt, partInfo, raw } = buildBlocks());
    }
  }
  if (qcStated && located.length !== qcStated) warnings.push(`question count ${located.length} != stated ${qcStated}`);
  const notLocated = starts.filter((s) => !s.located).map((s) => s.number);
  if (notLocated.length) warnings.push(`questions not located: ${notLocated.join(",")}`);
  // Multi-answer blocks. CCEA prints a tariff beside EACH answer line of a multi-answer part and the block is
  // worth the tariff on its LAST line: "Cost of A £ ___ [3]" / "Cost of B £ ___ [3]" is one 3-mark part, a
  // tick-box option list repeats the tariff on every option line, and "x = ___ [2]" / "y = ___ [5]" is a 5-mark
  // part. But a run of "____ [2]" lines can equally be separate 2-mark items and repeated "[1]" lines are
  // nearly always separate 1-mark items. A default policy is applied below; when the front-page total is known
  // the subset of blocks that reconciles it (closest to the default policy) wins and is recorded per paper.
  const groups = [];
  for (let k = 0; k < raw.length; k++) {
    const g = groups[groups.length - 1];
    const t = raw[k], p = k ? raw[k - 1] : null;
    const gap = p ? t.line - p.line : 0;
    const joinable = g && p && t.block === p.block && t.part === p.part && t.answerish && p.answerish && !t.partLine &&
      (t.value === p.value ? gap <= 4 : gap <= 2);
    let clean = joinable;
    if (joinable) for (let l = p.line + 1; l < t.line; l++) if (isPartLine(l) || startLine.has(l)) { clean = false; break; }
    if (clean) { g.members.push(k); g.maxGap = Math.max(g.maxGap, gap); g.labelled = g.labelled && t.labelled; g.equal = g.equal && t.value === g.value; }
    else groups.push({ members: [k], maxGap: 0, value: t.value, labelled: t.labelled, equal: true });
  }
  const multi = groups.filter((g) => g.members.length > 1);
  const defaultMerge = (g) => g.equal && g.value >= 2 && (g.maxGap <= 1 || (g.maxGap <= 3 && g.labelled));
  const rawTotal = raw.reduce((s, t) => s + t.value, 0);
  const saving = (g) => g.members.reduce((s, k) => s + raw[k].value, 0) - raw[g.members[g.members.length - 1]].value;
  let merged = new Set(multi.filter(defaultMerge));
  let strategy = multi.length ? "default-merge-policy" : "raw";
  if (totalStated != null) {
    const target = totalStated;
    let bestSel = null, bestDist = Infinity, bestSize = Infinity;
    const search = multi.length <= 14 ? multi : multi.slice(0, 14);
    for (let mask = 0; mask < (1 << search.length); mask++) {
      let tot = rawTotal, dist = 0, size = 0;
      for (let b = 0; b < search.length; b++) {
        const on = (mask >> b) & 1;
        if (on) { tot -= saving(search[b]); size++; }
        if (!!on !== defaultMerge(search[b])) dist++;
      }
      if (tot === target && (dist < bestDist || (dist === bestDist && size < bestSize))) { bestDist = dist; bestSize = size; bestSel = mask; }
    }
    if (bestSel != null) {
      merged = new Set(search.filter((_, b) => (bestSel >> b) & 1));
      strategy = bestDist === 0 ? (multi.length ? "default-merge-policy" : "raw") : `merge-policy-adjusted(${bestDist})`;
    } else warnings.push(`tariff sum does not reach stated total ${totalStated} under any merge policy (raw ${rawTotal})`);
  } else warnings.push("no stated total on front page");
  const dropped = new Set();
  for (const g of merged) for (const k of g.members.slice(0, -1)) dropped.add(k);
  const tariffs = raw.filter((_, k) => !dropped.has(k));
  const describeBlock = (g) => ({
    question: raw[g.members[0]].block >= 0 ? String(located[raw[g.members[0]].block].number) : null,
    part: raw[g.members[0]].part || "-", printed: g.members.map((k) => raw[k].value),
    counted: merged.has(g) ? raw[g.members[g.members.length - 1]].value : g.members.reduce((s, k) => s + raw[k].value, 0),
    byDefaultPolicy: defaultMerge(g),
  });
  const mergedBlocks = [...merged].map(describeBlock);                                   // counted as ONE part (last tariff)
  const unmergedBlocks = multi.filter((g) => !merged.has(g) && defaultMerge(g)).map(describeBlock); // default said merge, total said no
  const totalParsed = tariffs.reduce((s, t) => s + t.value, 0);
  const orphan = tariffs.filter((t) => t.block < 0);
  if (orphan.length) warnings.push(`${orphan.length} tariffs before the first located question`);

  // --- questions --------------------------------------------------------------------------
  const questions = [];
  for (const s of starts) {
    if (!s.located) {
      questions.push({ number: String(s.number), located: false, inferred: false, page: null, pages: 0, marks: 0, parts: [], tariffs: [], label: "not located",
        commandWords: [], hasDiagram: false, diagramStrong: false, hasTable: false, qwc: false, answerUnits: [] });
      continue;
    }
    const k = located.indexOf(s);
    const endLine = k + 1 < located.length ? located[k + 1].line : bodyEnd;
    const block = lines.slice(s.line, endLine);
    const blockText = block.map(contentOf).join("\n");
    const info = partInfo[k];
    let qMarks = 0; const units = new Set(); const qTariffs = [];
    for (const t of tariffs) {
      if (t.block !== k) continue;
      qMarks += t.value; qTariffs.push(t.value);
      if (t.part) {
        if (!info.map.has(t.part)) { info.map.set(t.part, { part: t.part, marks: 0, page: t.page, line: t.line }); info.order.push(t.part); }
        info.map.get(t.part).marks += t.value;
      } else if (info.order.length) {
        if (!info.map.has("")) { info.map.set("", { part: "", marks: 0, page: t.page, line: t.line }); info.order.unshift(""); }
        info.map.get("").marks += t.value;
      }
      const um = lines[t.line].match(/_{3,}\s*([^\s_\[]{1,8})\s*\[/);
      if (um && UNIT_RE.test(um[1])) units.add(um[1]);
    }
    const cmds = new Map();
    let cm; COMMAND_RE.lastIndex = 0;
    while ((cm = COMMAND_RE.exec(blockText))) { const c = normaliseCommand(cm[1]); cmds.set(c, (cmds.get(c) || 0) + 1); }
    const commandWords = [...cmds.keys()];
    const sparse = block.filter((l) => { const c = contentOf(l).trim(); if (!c) return false; const toks = c.split(/\s+/); return toks.length <= 3 && toks.every((t) => t.length <= 4) && /^\s{10,}/.test(l); }).length;
    const hasDiagram = DIAGRAM_RE.test(blockText) || sparse >= 5;
    const tags = topicTags(blockText, meta);
    let label = tags.join("; ");
    const mainCmds = commandWords.filter((c) => !QUESTION_FORMS.test(c) && !tags.some((t) => t.toLowerCase().includes(c.toLowerCase()))).slice(0, 2);
    if (tags.length < 2 && mainCmds.length) label = (label ? label + " — " : "") + mainCmds.join(", ").toLowerCase();
    if (!label) label = "unclassified";
    const distinctPages = new Set(); for (let i = s.line; i < endLine; i++) if (!isStructural(lines[i]) && lines[i].trim()) distinctPages.add(pages[i]);
    const hasChild = (key) => info.order.some((k2) => k2 !== key && k2.startsWith(key + "("));
    questions.push({
      number: String(s.number), located: true, inferred: s.inferred, page: pages[s.line], pages: distinctPages.size, marks: qMarks,
      parts: info.order.filter((key) => !(info.map.get(key).marks === 0 && hasChild(key)))
        .map((key) => { const p = info.map.get(key); return { part: key || "-", marks: p.marks, page: p.page }; }),
      tariffs: qTariffs, label: clampWords(label, 12), commandWords,
      hasDiagram, diagramStrong: DIAGRAM_STRONG_RE.test(blockText), hasTable: TABLE_RE.test(blockText),
      qwc: QWC_RE.test(blockText) || (qwcStated != null && qwcStated === String(s.number)), answerUnits: [...units].sort(),
    });
  }
  const qwcQuestions = questions.filter((q) => q.qwc).map((q) => q.number);
  return {
    feedId: meta.id, subject: meta.subject, sessionKey: meta.sessionKey, year: meta.year, series: meta.series,
    unit: meta.unit, tier: meta.tier, paperNumber: meta.paperNumber, calculator: meta.calculator, discipline: meta.discipline,
    booklet: meta.booklet, totalMarks: totalStated ?? totalParsed, totalMarksStated: totalStated, totalMarksParsed: totalParsed,
    totalMatches: totalStated != null && totalStated === totalParsed, tariffStrategy: strategy, tariffCount: tariffs.length,
    multiAnswerBlocks: multi.length, mergedBlocks, unmergedBlocks,
    questionCount: located.length, questionCountStated: qcStated, calculatorStatement: calcStmt, qwcStated,
    formulaSheetPage: meta.subject === "science" ? null : formulaSheetPage, pageCount, bodyPages: [firstBodyPage, pages[Math.max(bodyStart, Math.min(bodyEnd, lines.length - 1))]],
    qwcQuestions, questions, warnings, sourceFile: null,
  };
}

// ---------------------------------------------------------------------------------------------
// 4. Mark-scheme lexicon (codes, abbreviations and a FIXED phrase lexicon: counts only, no answer text)
// ---------------------------------------------------------------------------------------------
const CODE_RE = { maths: /\b(MA|MW|M|A|W|B)(\d)\b/g, "further-maths": /\b(MW|MA|M|W|A|B)(\d)\b/g, science: /\b(QWC)(\d)\b/g };
const BARE_CODE_RE = /(?:^|\s{2,})(MW|M|W)(?=\s{2,}|\s*$)/gm;    // FM style bare letters in the marks column
const SCI_TARIFF_RE = /\[(\d{1,2})\]/g;
const ABBREV = ["AW", "AVP", "ecf", "ECF", "ora", "ORA", "owtte", "OWTTE", "cao", "CAO", "oe", "OE", "ft", "FT", "isw", "ISW", "dep", "DEP", "bod", "BOD", "SC", "nfww", "NFWW", "wtte", "WTTE", "QWC", "M0", "A0", "W0"];
const PHRASES = [
  ["accept", /\baccept(ed|s|able)?\b/gi], ["do not accept", /\bdo not accept\b/gi], ["allow", /\ballow(ed|s)?\b/gi], ["do not allow", /\bdo not allow\b/gi],
  ["ignore", /\bignore(d)?\b/gi], ["reject", /\breject(ed)?\b/gi], ["condone", /\bcondone(d)?\b/gi], ["award", /\baward(ed|s)?\b/gi],
  ["no marks / zero marks", /\bno marks?\b|\bzero marks?\b/gi], ["or equivalent", /\bor equivalent\b/gi], ["oe", /\boe\b/g],
  ["follow through", /\bfollow[- ]through\b/gi], ["ft", /\bft\b/g], ["ecf (error carried forward)", /\becf\b|\berror carried forward\b/gi],
  ["cao (correct answer only)", /\bcao\b|\bcorrect answer only\b/gi], ["any one from", /\bany one (from|of)\b/gi], ["any two from", /\bany two (from|of)\b/gi],
  ["any three from", /\bany three (from|of)\b/gi], ["any four from", /\bany four (from|of)\b/gi], ["any five from", /\bany five (from|of)\b/gi],
  ["any six from", /\bany six (from|of)\b/gi], ["any valid", /\bany (other )?valid\b/gi], ["any correct", /\bany (other )?correct\b/gi],
  ["in any order", /\b(in )?any order\b/gi], ["either order", /\beither order\b/gi], ["both required", /\bboth required\b/gi],
  ["all correct", /\ball correct\b/gi], ["fully correct", /\bfully correct\b/gi], ["partially correct", /\bpartially correct\b/gi],
  ["max / maximum", /\bmax(imum)?\b/gi], ["up to", /\bup to\b/gi], ["at least", /\bat least\b/gi], ["for each", /\bfor each\b/gi],
  ["one mark for", /\bone mark for\b|\b1 mark for\b/gi], ["marks for", /\bmarks? for\b/gi], ["each", /\beach\b/gi], ["only", /\bonly\b/gi],
  ["dep (dependent)", /\bdep(endent)?\b/gi], ["seen", /\bseen\b/gi], ["implied", /\bimplied\b/gi], ["or better", /\bor better\b/gi],
  ["must", /\bmust\b/gi], ["penalise", /\bpenalis(e|ed)\b/gi], ["special case", /\bspecial case\b/gi], ["bod (benefit of the doubt)", /\bbod\b|\bbenefit of the doubt\b/gi],
  ["ora (or reverse argument)", /\bora\b/gi], ["owtte", /\bowtte\b/gi], ["AW (alternative wording)", /\bAW\b/g], ["AVP (any valid point)", /\bAVP\b/g],
  ["alternative method", /\balternative (solution|method)\b/gi], ["with working", /\bwith working\b/gi], ["without working / no working", /\bwithout working\b|\bno working\b/gi],
  ["method", /\bmethod\b/gi], ["correct method", /\bcorrect method\b/gi], ["correct answer", /\bcorrect answer\b/gi], ["working", /\bworking\b/gi],
  ["consistent", /\bconsistent\b/gi], ["answer line", /\banswer (line|space)\b/gi], ["significant figures", /\bsignificant figures?\b|\bs\.f\.\b/gi],
  ["decimal places", /\bdecimal places?\b|\bd\.p\.\b/gi], ["rounding", /\brounding\b|\brounded\b/gi], ["premature rounding", /\bpremature rounding\b/gi],
  ["truncation", /\btruncat(ed|ion)\b/gi], ["tolerance", /\btolerance\b/gi], ["inclusive", /\binclusive\b/gi], ["crossed out", /\bcrossed out\b/gi],
  ["transcription error", /\btranscription error\b/gi], ["mark only", /\bmark only\b/gi], ["unit / units", /\bunits?\b/gi], ["isw", /\bisw\b/gi],
  ["indicative content", /\bindicative content\b/gi], ["level / band", /\blevel \d\b|\bband [A-D\d]\b/gi], ["QWC", /\bQWC\b|quality of written communication/gi],
  ["not required", /\bnot required\b/gi], ["if seen", /\bif seen\b/gi], ["brackets", /\bbrackets?\b/gi], ["trial and improvement", /\btrial and (improvement|error)\b/gi],
  ["deduct", /\bdeduct(ed)?\b/gi], ["independent", /\bindependent\b/gi], ["unambiguous", /\bunambiguous\b/gi],
  ["1 mark", /\b1 mark\b/gi], ["2 marks", /\b2 marks\b/gi], ["3 marks", /\b3 marks\b/gi], ["incorrect answer", /\bincorrect (answer|response)s?\b/gi],
  ["M0 (no method mark)", /\bM0\b/g], ["A0 (no accuracy mark)", /\bA0\b/g], ["W0", /\bW0\b/g],
];
const HEADING_SKIP = /^(Candidates|Some|The |A |An |In |For |This |These |It |If |Where |When |Use |Note|MARK|SCHEME|GCSE|General Certificate|Foundation Tier|Higher Tier|Calculator Paper|Non-Calculator Paper|Booklet [AB]|New |Speci|Mathematics|Further Mathematics|Double Award Science|Biology|Chemistry|Physics|Pure Mathematics|Statistics|Mechanics|Discrete|Unit |Summer|November|January|March|Assessment$)/;
const HEADING_START = /^(General Marking (Instructions|Advice|Principles)|Introduction)$/i;

function parseMarkScheme(text, meta, lex) {
  const { lines, pages, pageCount } = paginate(text);
  const subject = meta.subject;
  const S = lex[subject] ||= { markSchemes: 0, pages: 0, codes: {}, bareCodes: {}, tariffCodes: {}, abbreviations: {}, phrases: {}, phraseDocs: {}, headings: {}, headingDocs: {} };
  S.markSchemes++; S.pages += pageCount;
  const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
  // body = pages from the first page dense with codes/tariffs (skips the General Marking Instructions)
  const perPage = {};
  for (let i = 0; i < lines.length; i++) { const c = (lines[i].match(/\b(MA|MW|M|A|W|B)\d\b|\[\d{1,2}\]/g) || []).length; perPage[pages[i]] = (perPage[pages[i]] || 0) + c; }
  let firstQPage = pageCount + 1;
  for (let p = 2; p <= pageCount; p++) if ((perPage[p] || 0) >= 4) { firstQPage = p; break; }
  const bodyLines = lines.filter((l, i) => pages[i] >= firstQPage && !/\bUnit\b|\bGCSE\b|MARK SCHEME|Mathematics|Science/.test(l));
  const body = bodyLines.join("\n");
  let m;
  const cre = CODE_RE[subject];
  if (cre) { cre.lastIndex = 0; while ((m = cre.exec(body))) bump(S.codes, m[1] + m[2]); }
  if (subject === "further-maths") { BARE_CODE_RE.lastIndex = 0; while ((m = BARE_CODE_RE.exec(body))) bump(S.bareCodes, m[1]); }
  if (subject === "science") { SCI_TARIFF_RE.lastIndex = 0; while ((m = SCI_TARIFF_RE.exec(body))) bump(S.tariffCodes, "[" + m[1] + "]"); }
  for (const a of ABBREV) { const re = new RegExp("(?:^|[\\s(])" + a + "(?=$|[\\s).,;:/])", "gm"); const c = (body.match(re) || []).length; if (c) bump(S.abbreviations, a, c); }
  const seen = new Set();
  for (const [name, re] of PHRASES) { re.lastIndex = 0; const c = (text.match(re) || []).length; if (c) { bump(S.phrases, name, c); seen.add(name); } }
  for (const p of seen) bump(S.phraseDocs, p);
  // headings of the General Marking Instructions boilerplate: short title-case lines between the first
  // "General Marking Instructions / Introduction" heading and the first page of question-level marking
  const hs = new Set();
  let inInstructions = false;
  for (let i = 0; i < lines.length && pages[i] < firstQPage; i++) {
    const L = lines[i].trim().replace(/:$/, "");
    if (!L || /\d/.test(L) || /[.;,!?]$/.test(L) || /\s{2,}/.test(L)) continue;
    if (HEADING_START.test(L)) inInstructions = true;
    if (!inInstructions || HEADING_SKIP.test(L)) continue;
    if (/^[A-Z][A-Za-z'’ \-\/()]{2,45}$/.test(L) && L.split(/\s+/).length <= 5) hs.add(L);
  }
  for (const h of hs) { bump(S.headings, h); bump(S.headingDocs, h); }
  const msTotal = (() => { const t = text.match(/\bTotal\s+(\d{2,3})\s*$/im); return t ? +t[1] : null; })();
  return { feedId: meta.id, subject, sessionKey: meta.sessionKey, unit: meta.unit, tier: meta.tier, paperNumber: meta.paperNumber,
    discipline: meta.discipline, booklet: meta.booklet, pageCount, totalFromMarkScheme: msTotal };
}

// ---------------------------------------------------------------------------------------------
// 5. Statistics
// ---------------------------------------------------------------------------------------------
const mean = (a) => (a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : null);
const summary = (a) => (a.length ? { mean: mean(a), min: Math.min(...a), max: Math.max(...a), n: a.length } : null);
const sortNumKeys = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => +a[0] - +b[0]));
function summarise(papers) {
  const qs = papers.flatMap((p) => p.questions.filter((q) => q.located));
  const marksPerQ = qs.map((q) => q.marks);
  const hist = {}; for (const m of marksPerQ) hist[m] = (hist[m] || 0) + 1;
  const tariffs = qs.flatMap((q) => q.tariffs);
  const tarTotal = tariffs.reduce((s, x) => s + x, 0);
  const byTariff = {}; for (const t of tariffs) byTariff[t] = (byTariff[t] || 0) + t;
  const tariffShare = Object.fromEntries(Object.entries(byTariff).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => [k, +(v / tarTotal).toFixed(3)]));
  const tariffCountHist = {}; for (const t of tariffs) tariffCountHist[t] = (tariffCountHist[t] || 0) + 1;
  const cw = {}; for (const q of qs) for (const c of q.commandWords) cw[c] = (cw[c] || 0) + 1;
  const commandWords = Object.fromEntries(Object.entries(cw).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
  const partsPerQ = qs.map((q) => q.parts.filter((p) => p.part !== "-").length);
  return {
    papers: papers.length,
    sessions: [...new Set(papers.map((p) => p.sessionKey))].sort(),
    totalMarks: summary(papers.map((p) => p.totalMarks)),
    pageCount: summary(papers.map((p) => p.pageCount)),
    questionsPerPaper: summary(papers.map((p) => p.questionCount)),
    marksPerQuestion: { ...summary(marksPerQ), histogram: sortNumKeys(hist) },
    pagesPerQuestion: summary(qs.map((q) => q.pages)),
    partsPerQuestion: summary(partsPerQ),
    questionsWithParts: qs.length ? +(partsPerQ.filter((n) => n > 0).length / qs.length).toFixed(3) : null,
    tariffItemsPerPaper: summary(papers.map((p) => p.tariffCount)),
    tariffSizeShareOfMarks: tariffShare,
    tariffSizeCounts: sortNumKeys(tariffCountHist),
    commandWords,
    diagramShare: qs.length ? +(qs.filter((q) => q.hasDiagram).length / qs.length).toFixed(3) : null,
    diagramStrongShare: qs.length ? +(qs.filter((q) => q.diagramStrong).length / qs.length).toFixed(3) : null,
    tableShare: qs.length ? +(qs.filter((q) => q.hasTable).length / qs.length).toFixed(3) : null,
    qwcQuestionsPerPaper: summary(papers.map((p) => p.qwcQuestions.length)),
    totalMatchRate: papers.length ? +(papers.filter((p) => p.totalMatches).length / papers.length).toFixed(3) : null,
  };
}
function groupBy(arr, fn) { const g = {}; for (const x of arr) (g[fn(x)] ||= []).push(x); return g; }
function buildStats(papers) {
  const bySubject = {};
  for (const [subject, sp] of Object.entries(groupBy(papers, (p) => p.subject)).sort()) {
    const units = {};
    for (const [unit, up] of Object.entries(groupBy(sp, (p) => p.unit)).sort()) {
      const u = summarise(up);
      const byTier = groupBy(up, (p) => p.tier || "untiered");
      if (Object.keys(byTier).length > 1) u.byTier = Object.fromEntries(Object.entries(byTier).sort().map(([k, v]) => [k, summarise(v)]));
      const byPN = groupBy(up, (p) => p.paperNumber || "single");
      if (Object.keys(byPN).length > 1) u.byPaperNumber = Object.fromEntries(Object.entries(byPN).sort().map(([k, v]) => [k === "single" ? k : "P" + k, summarise(v)]));
      const byDisc = groupBy(up, (p) => p.discipline || "n/a");
      if (Object.keys(byDisc).length > 1) u.byDiscipline = Object.fromEntries(Object.entries(byDisc).sort().map(([k, v]) => [k, summarise(v)]));
      units[unit] = u;
    }
    bySubject[subject] = { all: summarise(sp), units };
  }
  // calculator vs non-calculator (M5-M8 P1 vs P2)
  const calculatorComparison = {};
  for (const [unit, up] of Object.entries(groupBy(papers.filter((p) => p.subject === "maths" && p.paperNumber), (p) => p.unit)).sort()) {
    const p1 = summarise(up.filter((p) => p.paperNumber === 1)), p2 = summarise(up.filter((p) => p.paperNumber === 2));
    const delta = (a, b) => (a != null && b != null ? +(b - a).toFixed(2) : null);
    calculatorComparison[unit] = {
      P1_nonCalculator: p1, P2_calculator: p2,
      deltas_P2_minus_P1: {
        questionsPerPaper: delta(p1.questionsPerPaper?.mean, p2.questionsPerPaper?.mean),
        marksPerQuestion: delta(p1.marksPerQuestion?.mean, p2.marksPerQuestion?.mean),
        maxQuestionMarks: delta(p1.marksPerQuestion?.max, p2.marksPerQuestion?.max),
        diagramShare: delta(p1.diagramShare, p2.diagramShare),
        pageCount: delta(p1.pageCount?.mean, p2.pageCount?.mean),
        tariffItemsPerPaper: delta(p1.tariffItemsPerPaper?.mean, p2.tariffItemsPerPaper?.mean),
        shareOfMarksInTariffsOf1or2: delta((p1.tariffSizeShareOfMarks?.[1] || 0) + (p1.tariffSizeShareOfMarks?.[2] || 0), (p2.tariffSizeShareOfMarks?.[1] || 0) + (p2.tariffSizeShareOfMarks?.[2] || 0)),
      },
    };
  }
  // QWC per science paper
  const qwcPerSciencePaper = papers.filter((p) => p.subject === "science").map((p) => ({
    feedId: p.feedId, sessionKey: p.sessionKey, unit: p.unit, tier: p.tier, discipline: p.discipline, booklet: p.booklet,
    qwcStated: p.qwcStated, qwcQuestions: p.qwcQuestions,
    qwcMarks: p.questions.filter((q) => q.qwc).reduce((s, q) => s + q.marks, 0),
  }));
  const perSession = papers.map((p) => {
    const qs = p.questions.filter((q) => q.located);
    const cw = {}; for (const q of qs) for (const c of q.commandWords) cw[c] = (cw[c] || 0) + 1;
    return {
      subject: p.subject, sessionKey: p.sessionKey, unit: p.unit, tier: p.tier, paperNumber: p.paperNumber, discipline: p.discipline,
      booklet: p.booklet, feedId: p.feedId, totalMarks: p.totalMarks, tariffSum: p.totalMarksParsed, totalMatches: p.totalMatches,
      questionCount: p.questionCount, questionCountStated: p.questionCountStated, questionsNotLocated: p.questions.filter((q) => !q.located).length,
      meanMarksPerQuestion: mean(qs.map((q) => q.marks)), maxQuestionMarks: qs.length ? Math.max(...qs.map((q) => q.marks)) : null,
      maxTariff: Math.max(0, ...qs.flatMap((q) => q.tariffs)), diagramShare: qs.length ? +(qs.filter((q) => q.hasDiagram).length / qs.length).toFixed(2) : null,
      qwcQuestions: p.qwcQuestions, pages: p.pageCount,
      topCommandWords: Object.entries(cw).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5).map(([k, v]) => `${k}:${v}`),
    };
  });
  const sessionSummary = {};
  for (const [subject, sp] of Object.entries(groupBy(papers, (p) => p.subject)).sort()) {
    sessionSummary[subject] = Object.fromEntries(Object.entries(groupBy(sp, (p) => p.sessionKey)).sort((a, b) => b[0].localeCompare(a[0])).map(([k, v]) => {
      const qs = v.flatMap((p) => p.questions.filter((q) => q.located));
      return [k, { papers: v.length, questions: qs.length, marks: v.reduce((s, p) => s + p.totalMarks, 0), totalMatches: v.filter((p) => p.totalMatches).length,
        meanMarksPerQuestion: mean(qs.map((q) => q.marks)), diagramShare: qs.length ? +(qs.filter((q) => q.hasDiagram).length / qs.length).toFixed(2) : null }];
    }));
  }
  return { bySubject, calculatorComparison, qwcPerSciencePaper, sessionSummary, perSession };
}

// ---------------------------------------------------------------------------------------------
// 6. Main
// ---------------------------------------------------------------------------------------------
const files = discover();
const skipped = files.filter((f) => f.skip);
const paperFiles = files.filter((f) => !f.skip && f.kind === "paper");
const msFiles = files.filter((f) => !f.skip && f.kind === "ms");
const papers = [], lex = {}, msRecords = [];
for (const f of paperFiles) {
  const rec = parsePaper(fs.readFileSync(f.txt, "utf8"), f.meta);
  rec.sourceFile = path.relative(ROOT, f.txt).replace(/\\/g, "/");
  papers.push(rec);
}
for (const f of msFiles) msRecords.push(parseMarkScheme(fs.readFileSync(f.txt, "utf8"), f.meta, lex));
const order = (a, b) => a.subject.localeCompare(b.subject) || b.sessionKey.localeCompare(a.sessionKey) || a.unit.localeCompare(b.unit) || (a.tier || "").localeCompare(b.tier || "") || (a.paperNumber || 0) - (b.paperNumber || 0) || (a.discipline || "").localeCompare(b.discipline || "") || (a.booklet || "").localeCompare(b.booklet || "");
papers.sort(order); msRecords.sort(order);

if (DEBUG.size) {
  for (const p of papers) {
    if (!DEBUG.has(String(p.feedId))) continue;
    console.log(`\n== ${p.subject} ${p.sessionKey} ${p.unit}${p.tier ? "-" + p.tier : ""}${p.paperNumber ? "-P" + p.paperNumber : ""}${p.discipline ? "-" + p.discipline : ""}${p.booklet ? "-Bk" + p.booklet : ""} (${p.feedId}) pages=${p.pageCount} stated=${p.totalMarksStated} parsed=${p.totalMarksParsed} questions=${p.questionCount}/${p.questionCountStated} strategy=${p.tariffStrategy} multiAnswerBlocks=${p.multiAnswerBlocks} merged=${JSON.stringify(p.mergedBlocks)} warnings=${JSON.stringify(p.warnings)}`);
    for (const q of p.questions) console.log(`  Q${q.number.padEnd(2)} p${String(q.page).padEnd(3)} marks=${String(q.marks).padEnd(3)} tariffs=[${q.tariffs.join(",")}] parts=${q.parts.map((x) => `${x.part}:${x.marks}@p${x.page}`).join(" ") || "-"} diag=${q.hasDiagram ? 1 : 0} qwc=${q.qwc ? 1 : 0} cmds=${q.commandWords.join("/")} label="${q.label}"`);
  }
}

// coverage vs the full Standard index
const standard = index.papers.filter((p) => p.type === "Standard" && !p.duplicateOf);
const coverage = {};
for (const subject of ["maths", "further-maths", "science"]) {
  const avail = standard.filter((p) => p.subject === subject);
  coverage[subject] = {
    papersInFeed: avail.filter((p) => p.kind === "paper").length, papersParsed: papers.filter((p) => p.subject === subject).length,
    markSchemesInFeed: avail.filter((p) => p.kind === "ms").length, markSchemesParsed: msRecords.filter((p) => p.subject === subject).length,
    sessionsParsed: [...new Set(papers.filter((p) => p.subject === subject).map((p) => p.sessionKey))].sort(),
  };
}
const failing = papers.filter((p) => !p.totalMatches);
const matchRate = papers.length ? papers.filter((p) => p.totalMatches).length / papers.length : 0;
const qcKnown = papers.filter((p) => p.questionCountStated);
const qcMatch = qcKnown.filter((p) => p.questionCount === p.questionCountStated);
const writeJson = (name, obj) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 1) + "\n");

// Output 1: questions index (metadata only)
writeJson("questions-index.json", {
  $schema: "ccea-papers-questions-index/2",
  note: "Metadata only: labels are fixed lexicon tags, never question wording. Built by scripts/mine-papers.mjs; see MINING-README.md.",
  coverage, totalMatchRate: +matchRate.toFixed(3), questionCountMatchRate: qcKnown.length ? +(qcMatch.length / qcKnown.length).toFixed(3) : null,
  papers,
});

// Output 2: mark-scheme lexicon
const lexOut = { $schema: "ccea-mark-scheme-lexicon/2", note: "Mark codes, abbreviations and a fixed lexicon of generic marking phrases with counts. Headings of the General Marking Instructions only. No answer text.", subjects: {} };
for (const [subject, S] of Object.entries(lex).sort()) {
  const sortDesc = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
  lexOut.subjects[subject] = {
    markSchemes: S.markSchemes, pages: S.pages,
    codes: sortDesc(S.codes), bareCodes: sortDesc(S.bareCodes), tariffCodes: sortDesc(S.tariffCodes), abbreviations: sortDesc(S.abbreviations),
    topPhrases: Object.entries(S.phrases).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 60).map(([phrase, count]) => ({ phrase, count, markSchemes: S.phraseDocs[phrase] })),
    boilerplateHeadings: Object.fromEntries(Object.entries(S.headings).filter(([h]) => S.headingDocs[h] >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
  };
}
lexOut.markSchemes = msRecords;
writeJson("mark-scheme-lexicon.json", lexOut);

// Output 3: stats
const stats = buildStats(papers);
writeJson("stats.json", { $schema: "ccea-papers-stats/2", coverage, totalMatchRate: +matchRate.toFixed(3),
  questionCountMatchRate: qcKnown.length ? +(qcMatch.length / qcKnown.length).toFixed(3) : null,
  failingPapers: failing.map((p) => ({ feedId: p.feedId, subject: p.subject, sessionKey: p.sessionKey, unit: p.unit, tier: p.tier, paperNumber: p.paperNumber, discipline: p.discipline, booklet: p.booklet, stated: p.totalMarksStated, parsed: p.totalMarksParsed, warnings: p.warnings })),
  ...stats });

// Report (numbers and identifiers only — never question text)
const tag = (p) => `${p.subject}/${p.sessionKey}/${p.unit}${p.tier ? "-" + p.tier : ""}${p.paperNumber ? "-P" + p.paperNumber : ""}${p.discipline ? "-" + p.discipline : ""}${p.booklet ? "-Bk" + p.booklet : ""} (${p.feedId})`;
log(`papers parsed: ${papers.length}, mark schemes parsed: ${msRecords.length}, skipped files: ${skipped.length}`);
for (const [s, c] of Object.entries(coverage)) log(`  ${s.padEnd(14)} papers ${c.papersParsed}/${c.papersInFeed}  mark schemes ${c.markSchemesParsed}/${c.markSchemesInFeed}  sessions: ${c.sessionsParsed.length}`);
log(`total-marks match: ${papers.length - failing.length}/${papers.length} (${(matchRate * 100).toFixed(1)}%)  strategies: ${JSON.stringify(Object.fromEntries(Object.entries(groupBy(papers, (p) => p.tariffStrategy)).map(([k, v]) => [k, v.length])))}`);
const notLoc = papers.filter((p) => p.questions.some((q) => !q.located));
log(`question-count match: ${qcMatch.length}/${qcKnown.length}; papers with un-located questions: ${notLoc.length} (${notLoc.reduce((s, p) => s + p.questions.filter((q) => !q.located).length, 0)} questions)`);
if (failing.length) { log("-- papers whose parsed tariffs do not equal the stated total --"); for (const p of failing) log(`  ${tag(p)}: stated ${p.totalMarksStated} parsed ${p.totalMarksParsed} :: ${p.warnings.join("; ")}`); }
const qcMismatch = qcKnown.filter((p) => p.questionCount !== p.questionCountStated);
if (qcMismatch.length) { log("-- question-count mismatches --"); for (const p of qcMismatch) log(`  ${tag(p)}: found ${p.questionCount} stated ${p.questionCountStated} :: ${p.warnings.join("; ")}`); }
if (skipped.length) { log("-- skipped files --"); for (const s of skipped) log(`  ${path.relative(ROOT, s.pdf)}: ${s.skip}`); }
process.exitCode = matchRate >= 0.9 || papers.length === 0 ? 0 : 1;
