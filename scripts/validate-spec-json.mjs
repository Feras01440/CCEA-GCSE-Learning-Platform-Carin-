#!/usr/bin/env node
// Validates data/spec/mathematics.json. Exits 1 on any error.
// Usage: node scripts/validate-spec-json.mjs [path]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = process.argv[2] ?? join(ROOT, 'data', 'spec', 'mathematics.json');
const spec = JSON.parse(readFileSync(path, 'utf8'));

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const UNIT_CODES = spec.units.map((u) => u.code);
const unitByCode = Object.fromEntries(spec.units.map((u) => [u.code, u]));
const STRAND_IDS = new Set(spec.strands.map((s) => s.id));

// ── units ──
for (const u of spec.units) {
  for (const p of u.prerequisiteUnits) if (!unitByCode[p]) err(`unit ${u.code}: unknown prerequisite unit ${p}`);
  const marks = u.papers.reduce((a, p) => a + p.marks, 0);
  if (marks !== 100) err(`unit ${u.code}: paper marks sum to ${marks}, expected 100`);
  if (!['gateway', 'completion'].includes(u.kind)) err(`unit ${u.code}: bad kind ${u.kind}`);
  if (u.kind === 'completion' && u.papers.length !== 2) err(`unit ${u.code}: completion test must have 2 papers`);
  if (!Array.isArray(u.formulaSheet) || u.formulaSheet.length === 0) err(`unit ${u.code}: formulaSheet missing`);
}

// ── statements ──
const stmtIds = new Set();
const seq = {};
for (const s of spec.statements) {
  if (stmtIds.has(s.id)) err(`duplicate statement id ${s.id}`);
  stmtIds.add(s.id);
  if (!/^M[1-8]-(NA|GM|HD)-\d{2}$/.test(s.id)) err(`statement ${s.id}: malformed id`);
  if (s.unit !== s.id.slice(0, 2)) err(`statement ${s.id}: unit field ${s.unit} disagrees with id`);
  if (!STRAND_IDS.has(s.strand)) err(`statement ${s.id}: unknown strand ${s.strand}`);
  if (!unitByCode[s.unit]) err(`statement ${s.id}: unknown unit ${s.unit}`);
  if (typeof s.text !== 'string' || s.text.trim().length < 10) err(`statement ${s.id}: text missing`);
  if (/[�]/.test(s.text)) err(`statement ${s.id}: text contains replacement character (pdftotext garbling)`);
  if (!Array.isArray(s.topics) || s.topics.length === 0) err(`statement ${s.id}: not mapped to any topic`);
  const key = `${s.unit}-${s.strand}`;
  seq[key] = (seq[key] || 0) + 1;
  if (Number(s.id.slice(-2)) !== seq[key]) err(`statement ${s.id}: numbering not sequential within ${key}`);
}
for (const s of spec.statements) {
  if (s.progressionOf !== null) {
    if (!stmtIds.has(s.progressionOf)) err(`statement ${s.id}: progressionOf ${s.progressionOf} does not exist`);
    else if (s.progressionOf === s.id) err(`statement ${s.id}: progressionOf points to itself`);
    else {
      const target = s.progressionOf.slice(0, 2);
      const closure = new Set();
      const walk = (u) => { for (const p of unitByCode[u].prerequisiteUnits) if (!closure.has(p)) { closure.add(p); walk(p); } };
      walk(s.unit);
      if (!closure.has(target)) err(`statement ${s.id}: progressionOf ${s.progressionOf} is not in an assumed earlier unit of ${s.unit}`);
    }
  }
}

// ── topics ──
const topicBySlug = new Map();
for (const t of spec.topics) {
  if (topicBySlug.has(t.slug)) err(`duplicate topic slug ${t.slug}`);
  topicBySlug.set(t.slug, t);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug)) err(`topic ${t.slug}: slug not kebab-case`);
  if (!STRAND_IDS.has(t.strand)) err(`topic ${t.slug}: unknown strand ${t.strand}`);
  if (!unitByCode[t.introducedIn]) err(`topic ${t.slug}: unknown introducedIn ${t.introducedIn}`);
  if (!['F', 'H'].includes(t.tier)) err(`topic ${t.slug}: bad tier ${t.tier}`);
  if (!['either', 'calc', 'non-calc'].includes(t.calculator)) err(`topic ${t.slug}: bad calculator ${t.calculator}`);
  if (!(Number.isInteger(t.difficulty) && t.difficulty >= 1 && t.difficulty <= 5)) err(`topic ${t.slug}: difficulty must be 1-5`);
  if (!Array.isArray(t.statementIds) || t.statementIds.length === 0) err(`topic ${t.slug}: no statementIds`);
  if (t.statementIds.length > 6) warn(`topic ${t.slug}: ${t.statementIds.length} statements (guideline max 6)`);
  for (const id of t.statementIds) {
    const s = spec.statements.find((x) => x.id === id);
    if (!s) err(`topic ${t.slug}: statement ${id} does not exist`);
    else {
      if (s.unit !== t.introducedIn) err(`topic ${t.slug}: statement ${id} is in ${s.unit} but topic introducedIn ${t.introducedIn}`);
      if (s.strand !== t.strand) err(`topic ${t.slug}: statement ${id} strand ${s.strand} ≠ topic strand ${t.strand}`);
      if (!s.topics.includes(t.slug)) err(`topic ${t.slug}: statement ${id} does not list this topic back`);
    }
  }
  // examinedIn must equal the unit plus every unit that assumes it
  const expected = UNIT_CODES.filter((u) => u === t.introducedIn || unitByCode[u].prerequisiteUnits.includes(t.introducedIn));
  if (JSON.stringify(expected) !== JSON.stringify(t.examinedIn)) err(`topic ${t.slug}: examinedIn ${t.examinedIn} ≠ expected ${expected}`);
  const expectedTier = ['M1', 'M2', 'M5', 'M6'].includes(t.introducedIn) ? 'F' : 'H';
  if (t.tier !== expectedTier) err(`topic ${t.slug}: tier ${t.tier} ≠ ${expectedTier}`);
  if (t.difficulty >= 4 && t.examinerEvidence.length === 0) warn(`topic ${t.slug}: difficulty ${t.difficulty} without examiner evidence`);
  for (const e of t.examinerEvidence) if (!e.series || !e.unit || !e.note) err(`topic ${t.slug}: malformed examinerEvidence entry`);
  for (const c of t.corbettmaths) {
    if (!c.title) err(`topic ${t.slug}: corbettmaths entry without title`);
    if (!c.videoNumber && !c.url) err(`topic ${t.slug}: corbettmaths entry "${c.title}" has neither videoNumber nor url`);
  }
  for (const f of t.onFormulaSheet) {
    if (!unitByCode[t.introducedIn].formulaSheet.includes(f)) err(`topic ${t.slug}: onFormulaSheet item not on ${t.introducedIn} formula sheet: ${f}`);
  }
}
for (const t of spec.topics) {
  for (const p of t.prerequisites) {
    if (!topicBySlug.has(p)) err(`topic ${t.slug}: unknown prerequisite ${p}`);
    if (p === t.slug) err(`topic ${t.slug}: prerequisite of itself`);
  }
}

// ── prerequisite DAG (cycle detection via DFS colouring) ──
const colour = new Map();
const cycles = [];
const dfs = (slug, stack) => {
  colour.set(slug, 'grey');
  for (const p of topicBySlug.get(slug)?.prerequisites ?? []) {
    if (!topicBySlug.has(p)) continue;
    const c = colour.get(p);
    if (c === 'grey') cycles.push([...stack, slug, p].join(' -> '));
    else if (!c) dfs(p, [...stack, slug]);
  }
  colour.set(slug, 'black');
};
for (const t of spec.topics) if (!colour.has(t.slug)) dfs(t.slug, []);
for (const c of cycles) err(`prerequisite cycle: ${c}`);

// ── routes ──
for (const [name, r] of Object.entries(spec.routes)) {
  const routeUnits = new Set(r.units);
  const expectedSlugs = spec.topics.filter((t) => routeUnits.has(t.introducedIn)).map((t) => t.slug);
  const order = r.topicOrder;
  const seen = new Set();
  order.forEach((slug, i) => {
    if (seen.has(slug)) err(`route ${name}: duplicate topic ${slug} in topicOrder`);
    seen.add(slug);
    const t = topicBySlug.get(slug);
    if (!t) { err(`route ${name}: unknown topic ${slug}`); return; }
    if (!routeUnits.has(t.introducedIn)) err(`route ${name}: topic ${slug} (${t.introducedIn}) is outside the route units`);
    for (const p of t.prerequisites) {
      const j = order.indexOf(p);
      if (j === -1) err(`route ${name}: prerequisite ${p} of ${slug} missing from topicOrder`);
      else if (j > i) err(`route ${name}: prerequisite ${p} comes after ${slug}`);
    }
  });
  for (const s of expectedSlugs) if (!seen.has(s)) err(`route ${name}: topic ${s} missing from topicOrder`);
  if (!unitByCode[r.gateway] || unitByCode[r.gateway].kind !== 'gateway') err(`route ${name}: bad gateway ${r.gateway}`);
  if (!unitByCode[r.completion] || unitByCode[r.completion].kind !== 'completion') err(`route ${name}: bad completion ${r.completion}`);
}

// ── exam dates / boundaries sanity ──
for (const [series, d] of Object.entries(spec.examDates)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.gateway?.date ?? '')) err(`examDates ${series}: gateway date missing`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.completion?.date ?? '')) err(`examDates ${series}: completion date missing`);
}
for (const [series, table] of Object.entries(spec.gradeBoundaries.raw)) {
  for (const u of UNIT_CODES) {
    if (!table[u]) { err(`gradeBoundaries.raw ${series}: missing ${u}`); continue; }
    const vals = Object.values(table[u]);
    for (let i = 1; i < vals.length; i++) if (vals[i] >= vals[i - 1]) err(`gradeBoundaries.raw ${series} ${u}: boundaries not strictly decreasing`);
  }
}

// ── counts ──
const count = (arr, key) => arr.reduce((m, x) => ((m[key(x)] = (m[key(x)] || 0) + 1), m), {});
const byUnit = count(spec.statements, (s) => s.unit);
const topicsByStrand = count(spec.topics, (t) => t.strand);
const topicsByTier = count(spec.topics, (t) => t.tier);
const topicsByUnit = count(spec.topics, (t) => t.introducedIn);
const withCorbett = spec.topics.filter((t) => t.corbettmaths.length).length;
const withEvidence = spec.topics.filter((t) => t.examinerEvidence.length).length;
const multiTopic = spec.statements.filter((s) => s.topics.length > 1).map((s) => s.id);
const prereqEdges = spec.topics.reduce((a, t) => a + t.prerequisites.length, 0);
const diff = count(spec.topics, (t) => `d${t.difficulty}`);

console.log(`mathematics.json — ${spec.statements.length} statements, ${spec.topics.length} topics, ${spec.units.length} units`);
console.log('statements per unit:', JSON.stringify(byUnit));
console.log('topics per unit:', JSON.stringify(topicsByUnit));
console.log('topics per strand:', JSON.stringify(topicsByStrand));
console.log('topics per tier:', JSON.stringify(topicsByTier));
console.log('topics per difficulty:', JSON.stringify(diff));
console.log(`prerequisite edges: ${prereqEdges} (DAG ok: ${cycles.length === 0})`);
console.log(`topics with examiner evidence: ${withEvidence}/${spec.topics.length}; with Corbettmaths links: ${withCorbett}`);
console.log(`statements mapped to >1 topic: ${multiTopic.length} (${multiTopic.join(', ')})`);
console.log(`routes: higher ${spec.routes.higher.topicOrder.length} topics, foundation ${spec.routes.foundation.topicOrder.length} topics`);
for (const w of warnings) console.log(`WARN ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error(`${errors.length} error(s)`);
  process.exit(1);
}
console.log('OK — all checks passed');
