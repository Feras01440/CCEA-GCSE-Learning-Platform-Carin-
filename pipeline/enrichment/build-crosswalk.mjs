/**
 * build-crosswalk.mjs — emit data/enrichment/crosswalk.json from the hand-written maps in
 * pipeline/enrichment/maps/.
 *
 *   node pipeline/enrichment/build-crosswalk.mjs
 *   node pipeline/enrichment/build-crosswalk.mjs --check   # validate and report, write nothing
 *
 * The maps are hand-written because a crosswalk row is a judgement, not a string match: the
 * lookup tool tells you where a term appears, and a person decides whether that is the same
 * content, a subset, a superset or a coincidence. What this script does is mechanical and
 * therefore worth automating: it joins each map row to the CCEA taxonomy so the titles, units,
 * tiers, outcome ids, statement texts and prescribed practicals cannot drift out of date, it
 * fails loudly if a taxonomy topic has no map row or a map row names a topic that no longer
 * exists, and it counts the statuses.
 *
 * Never edit data/enrichment/crosswalk.json by hand; edit the map and re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCIENCE } from "./maps/science.mjs";
import { MATHS } from "./maps/maths.mjs";
import { FURTHER_MATHS } from "./maps/further-maths.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const load = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const checkOnly = process.argv.includes("--check");

const sci = load("data/spec/double-award-science-topics.json");
const mat = load("data/spec/mathematics.json");
const fm = load("data/spec/further-mathematics.json");

const sciBySlug = new Map(sci.topics.map((t) => [t.slug, t]));
const matBySlug = new Map(mat.topics.map((t) => [t.slug, t]));
const fmBySlug = new Map(fm.topics.map((t) => [t.slug, t]));
const matStmt = new Map((mat.statements ?? []).map((s) => [s.id, s]));
const fmStmt = new Map((fm.statements ?? []).map((s) => [s.id, s]));

const split = (s) => (s ? String(s).split(";").map((x) => x.trim()).filter(Boolean) : []);
const problems = [];

const DFE_AREA = {
  N: "1 Number",
  A: "2 Algebra",
  R: "3 Ratio, proportion and rates of change",
  G: "4 Geometry and measures",
  P: "5 Probability",
  S: "6 Statistics",
};

/* ------------------------------------------------------------------- science */

const scienceRows = SCIENCE.map(([slug, aqa, edx, status, confidence, beyond, cceaOnly, note]) => {
  const t = sciBySlug.get(slug);
  if (!t) { problems.push(`science: map row names a slug not in the taxonomy: ${slug}`); return null; }
  const refs = split(aqa);
  const combined = refs.filter((r) => !r.includes(":"));
  const separate = refs.filter((r) => r.includes(":"));
  return {
    subject: "science",
    slug,
    title: t.title,
    unit: t.unit,
    discipline: t.discipline,
    ccea: {
      ref: `${t.unit} §${t.section}`,
      outcomes: t.outcomeIds ?? [],
      tier: t.tier,
      higherOnlyOutcomes: t.higherOnlyOutcomeIds ?? [],
      prescribedPracticals: t.practicals ?? [],
    },
    aqa: {
      qualification: combined.length ? "8464 Combined Science: Trilogy" : null,
      refs: combined,
      alsoIn: separate.map((r) => {
        const [spec, ref] = r.split(":");
        const name = { 8461: "8461 Biology", 8462: "8462 Chemistry", 8463: "8463 Physics" }[spec] ?? spec;
        return { qualification: name, ref };
      }),
    },
    edexcel: { qualification: "1SC0 Combined Science", refs: split(edx) },
    status,
    confidence,
    scope: { beyondCcea: beyond || null, cceaOnly: cceaOnly || null },
    note: note || null,
  };
}).filter(Boolean);
for (const t of sci.topics) if (!SCIENCE.some((r) => r[0] === t.slug)) problems.push(`science: taxonomy topic has no map row: ${t.slug}`);

/* --------------------------------------------------------------------- maths */

const mathsRows = MATHS.map(([slug, refs, aqaSection, tierOther, status, confidence, beyond, cceaOnly, note]) => {
  const t = matBySlug.get(slug);
  if (!t) { problems.push(`maths: map row names a slug not in the taxonomy: ${slug}`); return null; }
  const codes = split(refs);
  return {
    subject: "maths",
    slug,
    title: t.title,
    unit: t.introducedIn,
    strand: t.strand,
    ccea: {
      ref: (t.statementIds ?? []).join(", "),
      statements: (t.statementIds ?? []).map((id) => ({ id, text: matStmt.get(id)?.text ?? null })),
      tier: t.tier,
      examinedIn: t.examinedIn ?? [],
    },
    // AQA 8300 and Edexcel 1MA1 both restate the DfE subject content verbatim, so the codes are
    // shared; only the grouping and the tier placement differ, and the tier is the useful part.
    aqa: { qualification: codes.length ? "8300 Mathematics" : null, refs: codes, section: aqaSection || null },
    edexcel: { qualification: codes.length ? "1MA1 Mathematics" : null, refs: codes, area: codes.length ? DFE_AREA[codes[0][0]] : null },
    tierOnOtherBoards: tierOther || null,
    status,
    confidence,
    scope: { beyondCcea: beyond || null, cceaOnly: cceaOnly || null },
    note: note || null,
  };
}).filter(Boolean);
for (const t of mat.topics) if (!MATHS.some((r) => r[0] === t.slug)) problems.push(`maths: taxonomy topic has no map row: ${t.slug}`);

/* ------------------------------------------------------------ further maths */
// FM4 (Discrete and Decision) is deliberately excluded: the platform does not author it.

const fmRows = FURTHER_MATHS.map(
  ([slug, aqaRefs, ocrRefs, edexcelRefs, levelOther, status, confidence, beyond, cceaOnly, note]) => {
    const t = fmBySlug.get(slug);
    if (!t) { problems.push(`further-maths: map row names a slug not in the taxonomy: ${slug}`); return null; }
    if (t.unit === "FM4") { problems.push(`further-maths: FM4 must not be mapped: ${slug}`); return null; }
    return {
      subject: "further-maths",
      slug,
      title: t.title,
      unit: t.unit,
      area: t.area ?? null,
      strand: t.strand ?? null,
      ccea: {
        ref: (t.statementIds ?? []).join(", "),
        statements: (t.statementIds ?? []).map((id) => ({ id, text: fmStmt.get(id)?.text ?? null })),
        onFormulaSheet: t.onFormulaSheet ?? [],
      },
      // A Further Maths row may reference AQA 8365 (the default) or, where 8365 has nothing,
      // AQA GCSE Statistics 8382, written in the map as "8382:E11a". Split the two apart so the
      // qualification label is never wrong.
      aqa: (() => {
        const all = split(aqaRefs);
        const own = all.filter((r) => !r.includes(":"));
        const other = all.filter((r) => r.includes(":"));
        const byQual = {};
        for (const r of other) {
          const [spec, ref] = r.split(":");
          const name = { 8382: "8382 GCSE Statistics", 8300: "8300 GCSE Mathematics" }[spec] ?? spec;
          (byQual[name] ??= []).push(ref);
        }
        return {
          qualification: own.length ? "8365 Level 2 Certificate in Further Mathematics" : null,
          refs: own,
          alsoIn: Object.entries(byQual).map(([qualification, refs]) => ({ qualification, refs })),
        };
      })(),
      ocr: { qualification: "6993 FSMQ Additional Mathematics", refs: split(ocrRefs) },
      edexcel: { qualification: "4PM1 International GCSE Further Pure Mathematics", refs: split(edexcelRefs) },
      levelOnOtherQualifications: levelOther || null,
      status,
      confidence,
      scope: { beyondCcea: beyond || null, cceaOnly: cceaOnly || null },
      note: note || null,
    };
  },
).filter(Boolean);
if (FURTHER_MATHS.length === 0) {
  console.log("further-maths: map is empty; FM1-FM3 rows have not been written yet");
} else {
  for (const t of fm.topics) {
    if (t.unit === "FM4") continue;
    if (!FURTHER_MATHS.some((r) => r[0] === t.slug)) problems.push(`further-maths: taxonomy topic has no map row: ${t.slug}`);
  }
}

/* -------------------------------------------------------------------- counts */

const STATUSES = ["matched", "partial", "ccea-only", "unmatched"];
function counts(rows) {
  const c = { total: rows.length, matched: 0, partial: 0, "ccea-only": 0, unmatched: 0, confidence: { high: 0, medium: 0, low: 0 } };
  for (const r of rows) {
    if (!STATUSES.includes(r.status)) { problems.push(`${r.subject}:${r.slug} has an unknown status "${r.status}"`); continue; }
    c[r.status] += 1;
    c.confidence[r.confidence] += 1;
  }
  return c;
}
function byUnit(rows) {
  const m = {};
  for (const r of rows) {
    const u = r.unit ?? "?";
    m[u] ??= { total: 0, matched: 0, partial: 0, "ccea-only": 0, unmatched: 0 };
    m[u].total += 1;
    if (STATUSES.includes(r.status)) m[u][r.status] += 1;
  }
  return m;
}

const out = {
  generatedAt: new Date().toISOString(),
  generatedBy: "pipeline/enrichment/build-crosswalk.mjs",
  method: "docs/research/11-cross-board-enrichment.md section 1",
  sources: {
    aqa: [
      "AQA GCSE Combined Science: Trilogy 8464 specification",
      "AQA GCSE Biology 8461, Chemistry 8462, Physics 8463 specifications (used where Trilogy omits CCEA content)",
      "AQA GCSE Mathematics 8300 specification",
      "AQA Level 2 Certificate in Further Mathematics 8365 specification",
    ],
    edexcel: [
      "Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification (489 statements indexed)",
      "Pearson Edexcel GCSE (9-1) Mathematics 1MA1 specification (Foundation list pp.3-9, Higher list pp.10-18)",
      "Pearson Edexcel International GCSE (9-1) Further Pure Mathematics 4PM1 specification",
    ],
    ocr: ["OCR FSMQ Additional Mathematics 6993 specification"],
    dfe: ["DfE GCSE mathematics subject content (the shared N/A/R/G/P/S reference codes)", "DfE A level mathematics subject content, section H (mechanics), used as the reference for CCEA FM2"],
    ccea: ["data/spec/double-award-science-topics.json", "data/spec/mathematics.json", "data/spec/further-mathematics.json"],
    stored: "PDFs and extracted text live in docs/sources/cross-board/ (gitignored, copyrighted, read-only reference)",
  },
  caveats: [
    "AQA 8300 and Edexcel 1MA1 both restate the DfE GCSE mathematics subject content verbatim, so a maths row's reference codes are identical on the two boards; the difference recorded is the section grouping and the tier placement (tierOnOtherBoards).",
    "Science rows are written against AQA 8464 Combined Science: Trilogy and Edexcel 1SC0 Combined Science, because that is the qualification a CCEA Double Award learner is comparable with. Where CCEA content exists only in a separate-science specification, aqa.alsoIn records it and the status is 'ccea-only' relative to combined science.",
    "Further Mathematics rows compare three different qualifications at three different levels (AQA 8365 is Level 2, OCR 6993 is a Level 3 FSMQ, Edexcel 4PM1 is an International GCSE), so levelOnOtherQualifications matters more than the reference code; read it before judging difficulty.",
    "CCEA FM2 is mechanics, which no Level 2 qualification carries. Those rows are referenced against the DfE A level mathematics mechanics content and say so in the note; the material found there is pitched above CCEA and must be cut down, not imported.",
    "FM4 (Discrete and Decision) is excluded by policy: the platform does not author it.",
    "OCR Gateway Combined Science A (J250) was not obtainable: the ocr.org.uk PDF path and two mirrors returned error pages. No OCR column is recorded for science rather than guessed.",
    "Edexcel separate-science specifications (1BI0/1CH0/1PH0) were not obtained; where a row mentions them the claim is flagged in 'note' as unverified.",
    "'confidence' records how the mapping was established: high = statement text read on both sides; medium = mapped by section heading, by a synonym search, or from a published topic list; low = inferred.",
    "status values: 'matched' = an equivalent statement exists and the scope is comparable; 'partial' = overlapping but one side demands more or less, with the difference recorded in scope; 'ccea-only' = no equivalent in the comparable qualification, although another specification may carry it (recorded in aqa.alsoIn or the note); 'unmatched' = no equivalent anywhere in the comparison qualifications.",
  ],
  counts: {
    science: { ...counts(scienceRows), byUnit: byUnit(scienceRows) },
    maths: { ...counts(mathsRows), byUnit: byUnit(mathsRows) },
    "further-maths": { ...counts(fmRows), byUnit: byUnit(fmRows) },
    total: scienceRows.length + mathsRows.length + fmRows.length,
  },
  topics: [...scienceRows, ...mathsRows, ...fmRows],
};

console.log(`problems: ${problems.length}`);
for (const p of problems) console.log(`  - ${p}`);
console.log(`science:       ${JSON.stringify(counts(scienceRows))}`);
console.log(`maths:         ${JSON.stringify(counts(mathsRows))}`);
console.log(`further-maths: ${JSON.stringify(counts(fmRows))}`);

if (problems.length) process.exitCode = 1;
if (checkOnly) { console.log("--check: nothing written"); process.exit(process.exitCode ?? 0); }

const dest = path.join(ROOT, "data", "enrichment", "crosswalk.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2), "utf8");
console.log(`wrote data/enrichment/crosswalk.json (${out.topics.length} rows, ${(fs.statSync(dest).size / 1024).toFixed(0)} KB)`);
