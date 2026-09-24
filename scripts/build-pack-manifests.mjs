#!/usr/bin/env node
/**
 * scripts/build-pack-manifests.mjs
 *
 * Writes packs/<subject>/pack.json - the SubjectPack manifest (src/lib/content/schema.ts) that describes the
 * qualification as data: units, papers, tiers, UMS, strands, mark language, item types, answer kinds and the
 * exam-true files. Numbers come from the spec JSON (data/spec/*.json), the grade file (data/grades) and the exam
 * map (data/exams/exam-map.json); the mark language is embedded from packs/<subject>/exam-true/mark-language.json;
 * the per-subject facts that have no machine source (paper resources, item types, providers) are kept in
 * SUBJECTS below with their sources.
 *
 *   node scripts/build-pack-manifests.mjs            (npm run packs:build)
 *   npx tsx scripts/validate-packs.mjs               (npm run packs:validate)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const TODAY = new Date().toISOString().slice(0, 10);

const mathsSpec = read("data/spec/mathematics.json");
const fmSpec = read("data/spec/further-mathematics.json");
const sciSpec = read("data/spec/double-award-science.json");
const examMap = read("data/exams/exam-map.json");
const grades = read("data/grades/ccea-gcse-boundaries.json");

const SERIES_ORDER = ["November", "March", "Summer"];

/** Series a unit is timetabled in, from the exam map (2026-Summer ... 2027-Summer). */
function seriesFor(subject, unitCode) {
  const found = new Set();
  for (const p of examMap.papers) {
    if (p.subject !== subject) continue;
    if (!String(p.unit).split("|").includes(unitCode)) continue;
    found.add(p.series.split("-")[1]);
  }
  return SERIES_ORDER.filter((s) => found.has(s));
}

/** MarkLanguageProfile (plus the source of each code, which the validator requires) from the exam-true file. */
function markLanguageFrom(file) {
  const ml = read(file);
  return {
    codes: ml.codes.map((c) => {
      const out = { code: c.code, meaning: c.meaning, dependsOnMethod: c.dependsOnMethod === true };
      if (c.dependencyIsInference) out.dependencyIsInference = true;
      out.source = c.source;
      return out;
    }),
    followThrough: ml.followThrough,
    positiveMarking: ml.positiveMarking,
    rules: ml.rules.map(({ id, text, source }) => ({ id, text, source })),
    feedbackTemplates: ml.feedbackTemplates,
    embeddedFrom: file,
  };
}

const PROVIDERS = {
  corbettmaths: { kind: "corbettmaths", label: "Corbettmaths", licenceNote: "Videos, practice questions and textbook exercises are linked by number/URL only; nothing is copied. Corbettmaths material is copyright of its author." },
  bitesize: { kind: "bitesize", label: "BBC Bitesize", licenceNote: "Linked by URL (article id kept for link health); BBC content is not reproduced." },
  youtube: { kind: "youtube", label: "YouTube", licenceNote: "Embedded by video id with channel credit and optional start/end times; no transcripts or frames are stored." },
  "ccea-doc": { kind: "ccea-doc", label: "CCEA documents", licenceNote: "Specification, guidance, past papers, mark schemes and reports are linked by URL with page and as-of date; only short factual fragments are quoted and all findings are rewritten in our words." },
  geogebra: { kind: "geogebra", label: "GeoGebra", licenceNote: "Applets embedded by material id with the attribution 'Made with GeoGebra'." },
  phet: { kind: "phet", label: "PhET Interactive Simulations", licenceNote: "Simulations embedded by URL with attribution; licence CC BY 4.0 for versions before 2026-03-29, CC BY-NC 4.0 after." },
};

const CALC = "Scientific calculator";
const MATHS_SHEET = "Formula sheet printed on page 2 of the paper";

const SUBJECTS = {
  maths: {
    title: "CCEA GCSE Mathematics (2017)",
    cceaQualificationId: mathsSpec.cceaQualificationId,
    subjectCode: mathsSpec.subjectCode,
    gradeScale: mathsSpec.gradeScale,
    units: () =>
      mathsSpec.units.map((u) => ({
        code: u.code,
        title: u.title,
        tier: u.tier,
        kind: u.kind,
        entryCode: u.entryCode,
        targetGrades: u.targetGrades,
        weighting: u.weighting,
        umsMax: u.maxUms,
        umsScale: u.umsScale,
        papers: u.papers.map((p) => ({
          name: p.name,
          minutes: p.durationMinutes,
          marks: p.marks,
          calculator: p.calculator,
          resources: p.calculator ? [MATHS_SHEET, `${CALC} (must be used)`] : [MATHS_SHEET],
        })),
        prerequisiteUnits: u.prerequisiteUnits,
        series: seriesFor("maths", u.code),
      })),
    strands: mathsSpec.strands,
    markLanguageFile: "packs/maths/exam-true/mark-language.json",
    itemTypes: ["note", "we", "dx", "q", "ftm", "rp", "ins", "set", "mock"],
    answerKinds: ["numeric", "algebraic", "mcq", "text", "graph", "drawing", "table", "steps"],
    files: { commandWordsFile: "exam-true/command-words.json", tariffsFile: "exam-true/tariffs.json", formulaSheetsFile: "exam-true/formula-sheets.json" },
    resourceFiles: { presentationRules: "exam-true/presentation-rules.json", timetable: "data-pack/timetable.json", boundaries: "data-pack/boundaries.json", rules: "data-pack/rules.json" },
    providers: ["corbettmaths", "bitesize", "youtube", "ccea-doc", "geogebra"],
    sources: [
      "data/spec/mathematics.json (units, papers, weightings, maxUms/umsScale, prerequisites, strands, grade scale; built from the specification and CCEA grade-boundary documents)",
      "data/exams/exam-map.json (series each unit is timetabled in, Summer 2026 to Summer 2027)",
      "packs/maths/exam-true/mark-language.json (mark codes and marking rules, in our words)",
      "packs/maths/exam-true/formula-sheets.json (formula sheet on page 2 of every paper); data/spec/mathematics.json pathways.rules (calculator use)",
    ],
  },
  "further-maths": {
    title: "CCEA GCSE Further Mathematics (2017)",
    cceaQualificationId: fmSpec.cceaQualificationId,
    subjectCode: fmSpec.subjectCode,
    gradeScale: fmSpec.gradeScale,
    units: () =>
      fmSpec.units.map((u) => {
        const resources = [CALC];
        if (u.formulaSheet.length) resources.push("Formula sheet printed on page 2 of the question-and-answer booklet");
        if (u.code === "FM3") resources.push("Normal Probability Table on page 3 of the booklet");
        return {
          code: u.code,
          title: u.title,
          tier: "untiered",
          entryCode: u.entryCode,
          compulsory: u.compulsory,
          lowUptake: u.lowUptake,
          weighting: u.weighting,
          umsMax: u.umsMax,
          umsScale: u.umsMax,
          papers: [{ name: "Paper", minutes: u.durationMinutes, marks: u.marks, calculator: u.calculator, resources }],
          prerequisiteUnits: u.compulsory ? [] : ["FM1"],
          series: seriesFor("further-maths", u.code),
        };
      }),
    strands: uniqueStrands(fmSpec.topics.map((t) => t.strand)),
    markLanguageFile: "packs/further-maths/exam-true/mark-language.json",
    itemTypes: ["note", "we", "dx", "q", "ftm", "rp", "ins", "set", "mock"],
    answerKinds: ["numeric", "algebraic", "mcq", "text", "graph", "drawing", "table", "steps"],
    files: { commandWordsFile: "exam-true/command-words.json", tariffsFile: "exam-true/tariffs.json", formulaSheetsFile: "exam-true/formula-sheets.json", methodLocksFile: "exam-true/method-locks.json" },
    resourceFiles: { timetable: "data-pack/timetable.json", boundaries: "data-pack/boundaries.json", rules: "data-pack/rules.json" },
    providers: ["youtube", "ccea-doc", "geogebra", "corbettmaths"],
    sources: [
      "data/spec/further-mathematics.json (units, durations, marks, UMS, weightings, calculator, formula sheets, structure; built from the specification v2 and Teacher Guidance 2024)",
      "data/exams/exam-map.json (Summer-only timetabling)",
      "packs/further-maths/exam-true/mark-language.json (M/W/MW codes and marking rules, in our words)",
      "packs/further-maths/exam-true/formula-sheets.json (sheet on page 2 of Units 1-3; Normal table on page 3 of Unit 3; none in Unit 4)",
      "prerequisiteUnits: Unit 1 is compulsory and taught first (available from 2018, options from 2019; timetabled first every Summer) - a sequencing hint, not a CCEA entry rule",
    ],
  },
  science: {
    title: "CCEA GCSE Science: Double Award (2017)",
    cceaQualificationId: sciSpec.cceaQualificationId,
    subjectCode: sciSpec.subjectCode,
    gradeScale: grades.doubleAwardScience.doubleGradeOrder,
    units: () => {
      const g = grades.doubleAwardScience.units;
      const LEAFLET = "Chemistry Data Leaflet including the Periodic Table (packs/science/exam-true/chemistry-data-leaflet.json)";
      const out = [];
      for (const u of sciSpec.units) {
        if (u.code === "7") continue;
        const minutes = /1 hour 15/.test(u.duration) ? 75 : 60;
        const resources = [CALC, ...(u.discipline === "Chemistry" ? [LEAFLET] : [])];
        const unit1 = `${u.code[0]}1`;
        out.push({
          code: u.code,
          title: `${u.discipline} Unit ${u.code}: ${u.title}`,
          tier: "both",
          discipline: u.discipline,
          weighting: u.weighting,
          umsMax: g[u.code].umsMax,
          umsScale: g[u.code].umsMax,
          papers: [
            { name: "Foundation Tier paper", minutes, marks: g[u.code].rawMax.F, calculator: true, resources },
            { name: "Higher Tier paper", minutes, marks: g[u.code].rawMax.H, calculator: true, resources },
          ],
          rawMarksNote: g[u.code].estimated ? "Higher raw maxima from the Summer 2025 papers; Foundation maxima confirmed for B1 (60) and assumed for the others (research 03 open question 3; data/grades/ccea-gcse-boundaries.json)" : undefined,
          prerequisiteUnits: u.code.endsWith("2") ? [unit1] : [],
          series: seriesFor("science", u.code),
        });
      }
      const u7 = sciSpec.units.find((u) => u.code === "7");
      out.push({
        code: "7",
        title: `Unit 7: ${u7.title}`,
        tier: "both",
        discipline: "Practical Skills",
        weighting: u7.weighting,
        umsMax: g.U7A.umsMax + g.U7B.umsMax,
        umsScale: g.U7A.umsMax + g.U7B.umsMax,
        papers: [
          ...["Biology", "Chemistry", "Physics"].map((d) => ({
            name: `Booklet A ${d} (practical task)`,
            minutes: 60,
            marks: 15,
            calculator: null,
            resources: ["Pre-release practical task carried out in the laboratory, externally marked", ...(d === "Chemistry" ? [LEAFLET] : [])],
          })),
          ...["Biology", "Chemistry", "Physics"].map((d) => ({
            name: `Booklet B ${d} (practical theory)`,
            minutes: 30,
            marks: 35,
            calculator: true,
            resources: [CALC, ...(d === "Chemistry" ? [LEAFLET] : [])],
          })),
        ],
        components: { bookletA: { weighting: g.U7A.weighting, umsMax: g.U7A.umsMax, window: "1 December to 1 May (data/exams/exam-map.json practicalWindows)" }, bookletB: { weighting: g.U7B.weighting, umsMax: g.U7B.umsMax } },
        prerequisiteUnits: ["B1", "C1", "P1", "B2", "C2", "P2"],
        series: ["Summer"],
      });
      return out;
    },
    strands: [
      { id: "B", title: "Biology" },
      { id: "C", title: "Chemistry" },
      { id: "P", title: "Physics" },
      { id: "PS", title: "Practical Skills" },
    ],
    markLanguageFile: "packs/science/exam-true/mark-language.json",
    itemTypes: ["note", "we", "dx", "q", "ftm", "rp", "ins", "prac", "eq", "qwc", "set", "mock"],
    answerKinds: ["numeric", "mcq", "text", "text-long", "graph", "drawing", "table", "equation", "label", "order"],
    files: { commandWordsFile: "exam-true/command-words.json", tariffsFile: "exam-true/tariffs.json", qwcBandsFile: "exam-true/qwc-bands.json" },
    resourceFiles: { physicsEquations: "exam-true/physics-equations.json", chemistryDataLeaflet: "exam-true/chemistry-data-leaflet.json", bookletBItemTypes: "exam-true/booklet-b-item-types.json", timetable: "data-pack/timetable.json", boundaries: "data-pack/boundaries.json", rules: "data-pack/rules.json" },
    providers: ["bitesize", "youtube", "ccea-doc", "phet"],
    sources: [
      "data/spec/double-award-science.json (units, titles, durations, weightings; built from the specification pp. 11-107)",
      "data/grades/ccea-gcse-boundaries.json doubleAwardScience (unit UMS = weighting% of 600, raw maxima per tier, double-grade order)",
      "docs/research/03-ccea-gcse-double-award-science-spec.md section 2 (Booklet A 3 x 15 marks 7.5%, Booklet B 3 x 35 marks 17.5%, calculators in every written paper, Data Leaflet in Chemistry papers, no Physics formula sheet)",
      "data/exams/exam-map.json (series each unit is timetabled in; Unit 7 is Summer only per research 03 section 2)",
      "packs/science/exam-true/mark-language.json (marking points and QWC bands, in our words)",
    ],
  },
};

function uniqueStrands(names) {
  const seen = new Set();
  const out = [];
  for (const n of names) {
    if (seen.has(n)) continue;
    seen.add(n);
    out.push({ id: n.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), title: n });
  }
  return out;
}

function buildPack(id, cfg) {
  const units = cfg.units().map((u) => Object.fromEntries(Object.entries(u).filter(([, v]) => v !== undefined)));
  return {
    $schema: "../../pipeline/schema/subject-pack.schema.json",
    id,
    title: cfg.title,
    cceaQualificationId: cfg.cceaQualificationId,
    subjectCode: cfg.subjectCode,
    gradeScale: cfg.gradeScale,
    units,
    strands: cfg.strands,
    markLanguage: markLanguageFrom(cfg.markLanguageFile),
    itemTypes: cfg.itemTypes,
    answerKinds: cfg.answerKinds,
    ...cfg.files,
    resourceFiles: cfg.resourceFiles,
    externalProviders: cfg.providers.map((k) => PROVIDERS[k]),
    generatedBy: "scripts/build-pack-manifests.mjs",
    generatedAt: TODAY,
    sources: cfg.sources,
  };
}

const only = process.argv.includes("--subject") ? [process.argv[process.argv.indexOf("--subject") + 1]] : Object.keys(SUBJECTS);
for (const id of only) {
  const cfg = SUBJECTS[id];
  if (!cfg) throw new Error(`unknown subject ${id}`);
  const pack = buildPack(id, cfg);
  const file = path.join(ROOT, "packs", id, "pack.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(pack, null, 2) + "\n", "utf8");
  console.log(`${id.padEnd(14)} ${pack.units.length} units  ${pack.units.reduce((n, u) => n + u.papers.length, 0)} papers  ${pack.markLanguage.codes.length} codes  ${pack.markLanguage.rules.length} rules  -> ${path.relative(ROOT, file)}`);
}
