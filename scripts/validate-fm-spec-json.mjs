#!/usr/bin/env node
// Validates data/spec/further-mathematics.json (structure, cross-references, prerequisite DAG, verbatim statement text).
// Usage: node scripts/validate-fm-spec-json.mjs [path/to/further-mathematics.json] [--quiet]
// Exit code 1 on any error; warnings (e.g. "maths:" prerequisites that cannot be resolved) do not fail the run.

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const quiet = process.argv.includes("--quiet");
const file = resolve(root, args[0] ?? "data/spec/further-mathematics.json");
const specTextPath = resolve(root, "docs/sources/further-maths/GCSE-Further-Mathematics-2017-specification-v2.txt");
const mathsPath = resolve(root, "data/spec/mathematics.json");

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const doc = JSON.parse(readFileSync(file, "utf8"));

// ── top level ──
const requiredTop = ["subject", "subjectCode", "cceaQualificationId", "gradeScale", "units", "statements", "topics", "topicOrder", "examDates", "gradeBoundaries", "markingConventions"];
for (const k of requiredTop) if (!(k in doc)) err(`missing top-level key "${k}"`);
if (doc.subjectCode !== "2330") err(`subjectCode should be "2330" (got ${doc.subjectCode})`);
if (doc.cceaQualificationId !== "507") err(`cceaQualificationId should be "507"`);
const expectedGrades = ["A*", "A", "B", "C*", "C", "D", "E", "F", "G"];
if (JSON.stringify(doc.gradeScale) !== JSON.stringify(expectedGrades)) err("gradeScale must be A*,A,B,C*,C,D,E,F,G");

// ── units ──
const unitCodes = new Set();
const expectedUnits = { FM1: { compulsory: true, durationMinutes: 120, marks: 100, weighting: 50 }, FM2: { compulsory: false, durationMinutes: 60, marks: 50, weighting: 25 }, FM3: { compulsory: false, durationMinutes: 60, marks: 50, weighting: 25 }, FM4: { compulsory: false, durationMinutes: 60, marks: 50, weighting: 25 } };
for (const u of doc.units ?? []) {
  if (unitCodes.has(u.code)) err(`duplicate unit code ${u.code}`);
  unitCodes.add(u.code);
  const exp = expectedUnits[u.code];
  if (!exp) { err(`unexpected unit code ${u.code}`); continue; }
  for (const [k, v] of Object.entries(exp)) if (u[k] !== v) err(`unit ${u.code}: ${k} should be ${v} (got ${u[k]})`);
  if (typeof u.title !== "string" || !u.title.startsWith("Unit ")) err(`unit ${u.code}: title missing`);
  if (!Array.isArray(u.formulaSheet)) err(`unit ${u.code}: formulaSheet must be an array`);
  if (typeof u.calculator !== "boolean") err(`unit ${u.code}: calculator must be boolean`);
  if (u.code === "FM4") {
    if (u.lowUptake !== true) err("FM4 must be marked lowUptake: true");
    if (!Array.isArray(u.lowUptakeEvidence) || u.lowUptakeEvidence.length === 0) err("FM4 lowUptakeEvidence must be a non-empty array");
    if (u.formulaSheet.length !== 0) err("FM4 has no formula sheet");
  } else if (u.formulaSheet.length === 0) err(`unit ${u.code}: formulaSheet should not be empty`);
}
for (const code of Object.keys(expectedUnits)) if (!unitCodes.has(code)) err(`missing unit ${code}`);
const weightSum = (doc.units ?? []).reduce((a, u) => a + (u.weighting ?? 0), 0);
if (weightSum !== 125) err(`unit weightings should sum to 125 (50 + 3 × 25); got ${weightSum}`);

// ── statements ──
const statementIds = new Set();
const idPattern = /^FM[1-4]-[A-Z]{3}-\d{2}$/;
for (const s of doc.statements ?? []) {
  if (!idPattern.test(s.id ?? "")) err(`statement id "${s.id}" does not match FMn-XXX-nn`);
  if (statementIds.has(s.id)) err(`duplicate statement id ${s.id}`);
  statementIds.add(s.id);
  if (!unitCodes.has(s.unit)) err(`statement ${s.id}: unknown unit ${s.unit}`);
  if (s.id && s.unit && !s.id.startsWith(s.unit + "-")) err(`statement ${s.id}: id prefix does not match unit ${s.unit}`);
  if (typeof s.area !== "string" || !s.area) err(`statement ${s.id}: area missing`);
  if (typeof s.text !== "string" || s.text.length < 10) err(`statement ${s.id}: text missing`);
  if (typeof s.teacherGuidance !== "string" || !s.teacherGuidance) err(`statement ${s.id}: teacherGuidance missing`);
  if (!Array.isArray(s.topics) || s.topics.length === 0) err(`statement ${s.id}: must map to at least one topic`);
}
const expectedStatementCounts = { FM1: 21, FM2: 12, FM3: 13, FM4: 15 };
for (const [code, n] of Object.entries(expectedStatementCounts)) {
  const got = (doc.statements ?? []).filter(s => s.unit === code).length;
  if (got !== n) err(`unit ${code}: expected ${n} statements, got ${got}`);
}

// ── verbatim check against the spec text layer ──
// The PDF text layer drops Cambria Math glyphs (x, ≤, ≠, superscripts) and joins lines, so compare on a normalised
// alphanumeric skeleton: strip every non-letter/digit character and any lone "x"/"n" that stands for a dropped glyph.
if (existsSync(specTextPath)) {
  const specText = readFileSync(specTextPath, "utf8");
  // Lone x/n/y are the italic variables the text layer drops (x², sin x, (p + q)ⁿ, (x̄, ȳ)); superscripts become separate
  // digit tokens; ° is rendered as a superscript "o" in the text layer.
  const DROP = new Set(["x", "n", "y", ""]);
  const skeleton = (t) => t.toLowerCase().replace(/°/g, "o").replace(/²/g, " 2").replace(/³/g, " 3").replace(/ⁿ/g, " n")
    .split(/[^a-z0-9]+/).filter(w => !DROP.has(w)).join("");
  // Section 3 body (lastIndexOf skips the contents page). Left-column labels ("Algebraic", "manipulation", "Completing the")
  // sit at column 0 and are interleaved with the wrapped statement lines, so strip everything before the first run of 2+ spaces
  // on any line that starts at column 0 (bare label lines disappear entirely; statement lines are always indented).
  const body = specText.slice(specText.lastIndexOf("3 Subject Content"), specText.lastIndexOf("4 Scheme of Assessment"));
  const cleaned = body.split(/\r?\n/).map(line => {
    if (!/^\S/.test(line)) return line;
    const b = line.search(/[•�]/);           // "Bivariate analysis • calculate…" has only a single space before the bullet
    if (b >= 0) return line.slice(b);
    const i = line.search(/\s{2,}/);
    return i >= 0 ? line.slice(i) : "";
  }).join("\n");
  const specSkel = skeleton(cleaned);
  for (const s of doc.statements ?? []) {
    // sub-bulleted statements are flattened with "; " in the JSON; the spec has them on separate lines, which the skeleton ignores
    const words = skeleton(s.text);
    // check in two halves so a single dropped glyph in the middle cannot hide a genuine wording change
    const half = Math.floor(words.length / 2);
    const parts = [words.slice(0, half), words.slice(half)].filter(p => p.length >= 12);
    for (const p of parts) if (!specSkel.includes(p)) err(`statement ${s.id}: text not found verbatim in the spec text layer (fragment "${p.slice(0, 40)}…")`);
  }
} else {
  warn(`spec text file not found at ${specTextPath}; verbatim check skipped`);
}

// ── topics ──
const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const topicBySlug = new Map();
for (const t of doc.topics ?? []) {
  if (!slugPattern.test(t.slug ?? "")) err(`topic slug "${t.slug}" is not kebab-case`);
  if (topicBySlug.has(t.slug)) err(`duplicate topic slug ${t.slug}`);
  topicBySlug.set(t.slug, t);
  if (!unitCodes.has(t.unit)) err(`topic ${t.slug}: unknown unit ${t.unit}`);
  if (typeof t.title !== "string" || !t.title) err(`topic ${t.slug}: title missing`);
  if (typeof t.area !== "string" || !t.area) err(`topic ${t.slug}: area missing`);
  if (!Array.isArray(t.statementIds) || t.statementIds.length === 0) err(`topic ${t.slug}: statementIds must be non-empty`);
  for (const id of t.statementIds ?? []) {
    if (!statementIds.has(id)) err(`topic ${t.slug}: unknown statement ${id}`);
    else if (!id.startsWith(t.unit + "-")) err(`topic ${t.slug}: statement ${id} belongs to a different unit`);
  }
  if (!Number.isInteger(t.difficulty) || t.difficulty < 1 || t.difficulty > 5) err(`topic ${t.slug}: difficulty must be an integer 1–5`);
  for (const k of ["prerequisites", "examinerEvidence", "mustMemorise", "onFormulaSheet", "keywords"]) if (!Array.isArray(t[k])) err(`topic ${t.slug}: ${k} must be an array`);
  for (const e of t.examinerEvidence ?? []) {
    if (!/^Summer 20(18|19|22|23|24|25)$/.test(e.series ?? "")) err(`topic ${t.slug}: examinerEvidence series "${e.series}" is not a series with a Chief Examiner's report`);
    if (typeof e.note !== "string" || e.note.length < 10) err(`topic ${t.slug}: examinerEvidence note missing`);
  }
  if (t.difficulty >= 4 && (t.examinerEvidence ?? []).length === 0) err(`topic ${t.slug}: difficulty ${t.difficulty} needs examiner evidence`);
  if ((t.onFormulaSheet ?? []).length && t.unit === "FM4") err(`topic ${t.slug}: FM4 has no formula sheet`);
  if ((t.keywords ?? []).length === 0) err(`topic ${t.slug}: keywords empty`);
}
// statements[].topics ↔ topics[].statementIds must agree
for (const s of doc.statements ?? []) {
  for (const slug of s.topics ?? []) {
    const t = topicBySlug.get(slug);
    if (!t) err(`statement ${s.id}: unknown topic ${slug}`);
    else if (!t.statementIds.includes(s.id)) err(`statement ${s.id} lists topic ${slug} but the topic does not list the statement`);
  }
}
for (const t of doc.topics ?? []) {
  for (const id of t.statementIds ?? []) {
    const s = (doc.statements ?? []).find(x => x.id === id);
    if (s && !s.topics.includes(t.slug)) err(`topic ${t.slug} lists ${id} but the statement does not list the topic`);
  }
}

// ── prerequisites: resolvable + DAG ──
let mathsSlugs = null;
if (existsSync(mathsPath)) {
  try {
    const m = JSON.parse(readFileSync(mathsPath, "utf8"));
    const list = Array.isArray(m.topics) ? m.topics : [];
    mathsSlugs = new Set(list.map(t => t.slug ?? t.id).filter(Boolean));
  } catch (e) { warn(`could not parse ${mathsPath}: ${e.message}`); }
}
for (const t of doc.topics ?? []) {
  for (const p of t.prerequisites ?? []) {
    if (p.startsWith("maths:")) {
      const s = p.slice(6);
      if (!slugPattern.test(s)) err(`topic ${t.slug}: bad maths prerequisite "${p}"`);
      else if (mathsSlugs && !mathsSlugs.has(s)) warn(`topic ${t.slug}: prerequisite ${p} not found in data/spec/mathematics.json`);
    } else if (!topicBySlug.has(p)) err(`topic ${t.slug}: unknown prerequisite ${p}`);
    else if (p === t.slug) err(`topic ${t.slug}: self-prerequisite`);
  }
}
// cycle detection (DFS, internal prerequisites only)
const state = new Map();
const cycles = [];
const visit = (slug, stack) => {
  state.set(slug, 1);
  const t = topicBySlug.get(slug);
  for (const p of (t?.prerequisites ?? []).filter(p => !p.startsWith("maths:") && topicBySlug.has(p))) {
    if (state.get(p) === 1) cycles.push([...stack, slug, p].join(" -> "));
    else if (!state.has(p)) visit(p, [...stack, slug]);
  }
  state.set(slug, 2);
};
for (const slug of topicBySlug.keys()) if (!state.has(slug)) visit(slug, []);
for (const c of cycles) err(`prerequisite cycle: ${c}`);

// ── topicOrder ──
for (const code of unitCodes) {
  const order = doc.topicOrder?.[code];
  if (!Array.isArray(order)) { err(`topicOrder missing for ${code}`); continue; }
  const unitSlugs = (doc.topics ?? []).filter(t => t.unit === code).map(t => t.slug);
  const seen = new Set(order);
  for (const slug of unitSlugs) if (!seen.has(slug)) err(`topicOrder ${code}: missing ${slug}`);
  for (const slug of order) if (!unitSlugs.includes(slug)) err(`topicOrder ${code}: ${slug} is not a ${code} topic`);
  if (seen.size !== order.length) err(`topicOrder ${code}: duplicates`);
  // teaching order must respect internal prerequisites
  const pos = new Map(order.map((s, i) => [s, i]));
  for (const slug of order) {
    for (const p of topicBySlug.get(slug)?.prerequisites ?? []) {
      if (pos.has(p) && pos.get(p) > pos.get(slug)) err(`topicOrder ${code}: ${slug} comes before its prerequisite ${p}`);
    }
  }
}

// ── examDates / gradeBoundaries / marking ──
for (const series of ["Summer 2026", "Summer 2027"]) {
  const d = doc.examDates?.[series];
  if (!d) { err(`examDates missing ${series}`); continue; }
  for (const code of Object.keys(expectedUnits)) {
    if (!d[code]?.date || !/^\d{4}-\d{2}-\d{2}$/.test(d[code].date)) err(`examDates ${series} ${code}: ISO date missing`);
    else if (!d[code].date.startsWith(series.slice(-4))) err(`examDates ${series} ${code}: year mismatch`);
  }
}
const gb = doc.gradeBoundaries ?? {};
if (!gb.subjectUms?.fixed || gb.subjectUms.fixed.A !== 160 || gb.subjectUms.fixed.G !== 40) err("gradeBoundaries.subjectUms.fixed must include A:160 … G:40");
for (const [series, byUnit] of Object.entries(gb.rawBySeries ?? {})) {
  for (const [code, b] of Object.entries(byUnit)) {
    const grades = ["a", "b", "c*", "c", "d", "e", "f", "g"];
    for (let i = 1; i < grades.length; i++) if (!(b[grades[i - 1]] > b[grades[i]])) err(`gradeBoundaries ${series} ${code}: ${grades[i - 1]} must exceed ${grades[i]}`);
    if (b.a > b.max) err(`gradeBoundaries ${series} ${code}: a exceeds max`);
  }
}
for (const k of ["M", "W", "MW"]) if (typeof doc.markingConventions?.[k] !== "string") err(`markingConventions.${k} missing`);
if (!Array.isArray(doc.markingConventions?.notes) || doc.markingConventions.notes.length === 0) err("markingConventions.notes must be non-empty");

// ── report ──
const perUnit = [...unitCodes].sort().map(code => {
  const st = (doc.statements ?? []).filter(s => s.unit === code).length;
  const tp = (doc.topics ?? []).filter(t => t.unit === code).length;
  const hard = (doc.topics ?? []).filter(t => t.unit === code && t.difficulty >= 4).length;
  return `${code}: ${st} statements, ${tp} topics (${hard} at difficulty ≥ 4)`;
});
if (!quiet) {
  console.log(`Validating ${file}`);
  for (const line of perUnit) console.log("  " + line);
  const mathsPrereqs = new Set((doc.topics ?? []).flatMap(t => t.prerequisites.filter(p => p.startsWith("maths:"))));
  console.log(`  ${doc.topics?.length ?? 0} topics, ${doc.statements?.length ?? 0} statements, ${mathsPrereqs.size} distinct maths: prerequisites (${mathsSlugs ? "checked against mathematics.json" : "mathematics.json not present – not checked"})`);
}
for (const w of warnings) console.warn("WARN  " + w);
for (const e of errors) console.error("ERROR " + e);
if (errors.length) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(`OK – 0 errors, ${warnings.length} warning(s)`);
