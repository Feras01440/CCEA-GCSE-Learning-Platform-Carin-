#!/usr/bin/env node
/**
 * validate-science-topics.mjs
 *
 * Checks data/spec/double-award-science-topics.json against
 * data/spec/double-award-science.json:
 *
 *   1. Coverage — every numbered learning outcome in B1, B2, C1, C2, P1, P2 is
 *      assigned to exactly one topic; every prescribed practical (B1–P6) has
 *      exactly one home topic; every Unit 7 skill (U7.s.n) is in exactly one
 *      unit7 group; no unknown ids anywhere.
 *   2. Slug uniqueness across topics and unit7 groups.
 *   3. Prerequisites reference existing slugs, never self, and form a DAG.
 *   4. Tier flags agree with the spec's per-outcome tiers.
 *   5. Referential integrity: unitOrder, physicsEquations / chemistryRecall /
 *      biologyRecall topicSlugs, PhET URL pattern, difficulty 1–5, required fields.
 *
 * Prints counts per unit and tier and exits 1 on any error.
 *
 * Usage: node scripts/validate-science-topics.mjs [--spec <file>] [--topics <file>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const opt = {
  spec: path.join(ROOT, 'data', 'spec', 'double-award-science.json'),
  topics: path.join(ROOT, 'data', 'spec', 'double-award-science-topics.json'),
};
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--spec') opt.spec = argv[++i];
  else if (argv[i] === '--topics') opt.topics = argv[++i];
  else throw new Error(`Unknown argument ${argv[i]}`);
}

const spec = JSON.parse(fs.readFileSync(opt.spec, 'utf8'));
const data = JSON.parse(fs.readFileSync(opt.topics, 'utf8'));

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const CONTENT_UNITS = ['B1', 'B2', 'C1', 'C2', 'P1', 'P2'];

// ---------------------------------------------------------------------------
// 1. Coverage
// ---------------------------------------------------------------------------
const specLos = {}; // unit -> Map(id -> outcome)
const specSkills = new Map(); // U7.s.n -> outcome
for (const unit of spec.units) {
  if (unit.code === '7') {
    unit.sections.forEach((section, si) => {
      let n = 0;
      for (const t of section.topics) for (const o of t.outcomes) { n++; specSkills.set(`U7.${si + 1}.${n}`, o); }
    });
    continue;
  }
  const m = new Map();
  for (const section of unit.sections) for (const t of section.topics) for (const o of t.outcomes) if (o.kind === 'lo') m.set(o.id, o);
  specLos[unit.code] = m;
}
const specPracticals = new Set(spec.prescribedPracticals.map((p) => p.code));

const assigned = {}; // unit -> id -> [slugs]
for (const u of CONTENT_UNITS) assigned[u] = new Map();
const practicalHome = new Map();
for (const t of data.topics) {
  if (!CONTENT_UNITS.includes(t.unit)) { err(`${t.slug}: unit ${t.unit} is not a content unit`); continue; }
  if (!Array.isArray(t.outcomeIds) || t.outcomeIds.length === 0) err(`${t.slug}: no outcomeIds`);
  for (const id of t.outcomeIds || []) {
    if (!specLos[t.unit].has(id)) err(`${t.slug}: outcome ${t.unit} ${id} does not exist in the spec`);
    if (!assigned[t.unit].has(id)) assigned[t.unit].set(id, []);
    assigned[t.unit].get(id).push(t.slug);
  }
  for (const code of t.practicals || []) {
    if (!specPracticals.has(code)) err(`${t.slug}: unknown practical ${code}`);
    if (!practicalHome.has(code)) practicalHome.set(code, []);
    practicalHome.get(code).push(t.slug);
  }
}
for (const u of CONTENT_UNITS) {
  for (const id of specLos[u].keys()) {
    const s = assigned[u].get(id) || [];
    if (s.length === 0) err(`Unassigned outcome ${u} ${id}`);
    if (s.length > 1) err(`Outcome ${u} ${id} assigned ${s.length} times: ${s.join(', ')}`);
  }
}
for (const code of specPracticals) {
  const s = practicalHome.get(code) || [];
  if (s.length === 0) err(`Practical ${code} has no home topic`);
  if (s.length > 1) err(`Practical ${code} has ${s.length} home topics: ${s.join(', ')}`);
}
const skillAssigned = new Map();
for (const g of data.unit7 || []) {
  for (const id of g.skillIds || []) {
    if (!specSkills.has(id)) err(`${g.slug}: unknown skill id ${id}`);
    if (!skillAssigned.has(id)) skillAssigned.set(id, []);
    skillAssigned.get(id).push(g.slug);
  }
  for (const code of g.practicalsPractised || []) if (!specPracticals.has(code)) err(`${g.slug}: unknown practical ${code}`);
}
for (const id of specSkills.keys()) {
  const s = skillAssigned.get(id) || [];
  if (s.length === 0) err(`Unassigned Unit 7 skill ${id}`);
  if (s.length > 1) err(`Unit 7 skill ${id} assigned ${s.length} times: ${s.join(', ')}`);
}

// ---------------------------------------------------------------------------
// 2. Slug uniqueness and required fields
// ---------------------------------------------------------------------------
const all = [...data.topics, ...(data.unit7 || [])];
const slugs = new Set();
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
for (const t of all) {
  if (!SLUG_RE.test(t.slug)) err(`Bad slug "${t.slug}"`);
  if (slugs.has(t.slug)) err(`Duplicate slug ${t.slug}`);
  slugs.add(t.slug);
  if (!t.title) err(`${t.slug}: missing title`);
  if (!(Number.isInteger(t.difficulty) && t.difficulty >= 1 && t.difficulty <= 5)) err(`${t.slug}: difficulty must be an integer 1-5`);
  for (const k of ['prerequisites', 'examinerEvidence', 'mustRecall', 'keywords']) if (!Array.isArray(t[k])) err(`${t.slug}: ${k} must be an array`);
  for (const e of t.examinerEvidence || []) if (!e.series || !e.unit || !e.tier || !e.note) err(`${t.slug}: malformed examinerEvidence entry`);
}
for (const t of data.topics) {
  const expectedPrefix = t.unit.toLowerCase() + '-';
  if (!t.slug.startsWith(expectedPrefix)) err(`${t.slug}: slug should start with "${expectedPrefix}"`);
  for (const k of ['keyEquations', 'phet', 'video', 'practicals']) if (!Array.isArray(t[k])) err(`${t.slug}: ${k} must be an array`);
  for (const p of t.phet || []) {
    if (!/^https:\/\/phet\.colorado\.edu\/sims\/html\/[a-z0-9-]+\/latest\/[a-z0-9-]+_en\.html$/.test(p.url)) err(`${t.slug}: PhET url not in the documented pattern: ${p.url}`);
  }
  for (const v of t.video || []) if (!v.channel || !/^https:\/\/www\.youtube\.com\//.test(v.url)) err(`${t.slug}: video entry needs channel and a youtube.com url`);
  if (t.bitesize !== null && !/^https:\/\/www\.bbc\.co\.uk\/bitesize\//.test(t.bitesize)) err(`${t.slug}: bitesize must be a bbc.co.uk/bitesize URL or null`);
  if (!['F', 'H', 'mixed'].includes(t.tier)) err(`${t.slug}: bad tier ${t.tier}`);
}

// ---------------------------------------------------------------------------
// 3. Prerequisites: existence, no self-reference, DAG
// ---------------------------------------------------------------------------
const bySlug = new Map(all.map((t) => [t.slug, t]));
for (const t of all) {
  for (const p of t.prerequisites || []) {
    if (p === t.slug) err(`${t.slug}: lists itself as a prerequisite`);
    else if (!bySlug.has(p)) err(`${t.slug}: unknown prerequisite ${p}`);
  }
}
const WHITE = 0, GREY = 1, BLACK = 2;
const colour = new Map();
const stack = [];
let cycles = 0;
function dfs(slug) {
  colour.set(slug, GREY);
  stack.push(slug);
  for (const p of bySlug.get(slug)?.prerequisites || []) {
    if (!bySlug.has(p)) continue;
    const c = colour.get(p) ?? WHITE;
    if (c === GREY) {
      cycles++;
      err(`Prerequisite cycle: ${[...stack.slice(stack.indexOf(p)), p].join(' -> ')}`);
    } else if (c === WHITE) dfs(p);
  }
  stack.pop();
  colour.set(slug, BLACK);
}
for (const t of all) if ((colour.get(t.slug) ?? WHITE) === WHITE) dfs(t.slug);

// Longest prerequisite chain (depth) — informational.
const depthMemo = new Map();
function depth(slug) {
  if (depthMemo.has(slug)) return depthMemo.get(slug);
  const ps = (bySlug.get(slug)?.prerequisites || []).filter((p) => bySlug.has(p));
  const d = ps.length ? 1 + Math.max(...ps.map(depth)) : 0;
  depthMemo.set(slug, d);
  return d;
}
let maxDepth = 0, deepest = null;
if (!cycles) for (const t of all) { const d = depth(t.slug); if (d > maxDepth) { maxDepth = d; deepest = t.slug; } }

// ---------------------------------------------------------------------------
// 4. Tier flags agree with the spec
// ---------------------------------------------------------------------------
function hasHigherParts(o) {
  if (o.mixed) return true;
  for (const b of o.bullets || []) {
    if (b.tier === 'H' || b.mixed) return true;
    for (const sb of b.sub || []) if (sb.tier === 'H' || sb.mixed) return true;
  }
  return false;
}
for (const t of data.topics) {
  const os = (t.outcomeIds || []).map((id) => specLos[t.unit]?.get(id)).filter(Boolean);
  if (!os.length) continue;
  const allH = os.every((o) => o.tier === 'H');
  const anyH = os.some((o) => o.tier === 'H' || hasHigherParts(o));
  const expected = allH ? 'H' : anyH ? 'mixed' : 'F';
  if (t.tier !== expected) err(`${t.slug}: tier is ${t.tier} but the spec implies ${expected}`);
  const expectedHO = os.filter((o) => o.tier === 'H').map((o) => o.id);
  if (JSON.stringify(t.higherOnlyOutcomeIds || []) !== JSON.stringify(expectedHO)) err(`${t.slug}: higherOnlyOutcomeIds should be [${expectedHO}]`);
}

// ---------------------------------------------------------------------------
// 5. Referential integrity
// ---------------------------------------------------------------------------
// unitOrder: same slugs as the unit's topics (as a set) and a valid teaching
// order — every same-unit prerequisite appears earlier in the list.
const YEAR_11 = new Set(['B1', 'C1', 'P1']);
const YEAR_12 = new Set(['B2', 'C2', 'P2']);
for (const u of [...CONTENT_UNITS, 'U7']) {
  const members = u === 'U7' ? (data.unit7 || []) : data.topics.filter((t) => t.unit === u);
  const expected = new Set(members.map((t) => t.slug));
  const order = data.unitOrder?.[u] || [];
  if (order.length !== expected.size || order.some((s) => !expected.has(s)) || new Set(order).size !== order.length) {
    err(`unitOrder.${u} must list each ${u} topic exactly once`);
    continue;
  }
  const pos = new Map(order.map((s, i) => [s, i]));
  for (const t of members) {
    for (const p of t.prerequisites || []) {
      if (pos.has(p) && pos.get(p) > pos.get(t.slug)) err(`unitOrder.${u}: ${t.slug} is placed before its prerequisite ${p}`);
    }
  }
}
for (const t of data.topics) {
  if (!YEAR_11.has(t.unit)) continue;
  for (const p of t.prerequisites || []) {
    const pu = bySlug.get(p)?.unit;
    if (pu && YEAR_12.has(pu)) err(`${t.slug} (${t.unit}, Year 11) depends on ${p} (${pu}, Year 12)`);
  }
}
const topicSlugs = new Set(data.topics.map((t) => t.slug));
const eqIds = new Set();
for (const e of data.physicsEquations || []) {
  if (eqIds.has(e.id)) err(`Duplicate equation id ${e.id}`);
  eqIds.add(e.id);
  if (!topicSlugs.has(e.topicSlug)) err(`physicsEquations ${e.id}: unknown topicSlug ${e.topicSlug}`);
  if (!['F', 'H'].includes(e.tier)) err(`physicsEquations ${e.id}: bad tier`);
  const topic = bySlug.get(e.topicSlug);
  if (topic && !(topic.keyEquations || []).some((k) => k.id === e.id)) err(`physicsEquations ${e.id}: not surfaced in ${e.topicSlug}.keyEquations`);
}
for (const [name, list] of [['chemistryRecall', data.chemistryRecall], ['biologyRecall', data.biologyRecall]]) {
  for (const r of list || []) {
    if (!topicSlugs.has(r.topicSlug)) err(`${name} "${r.item}": unknown topicSlug ${r.topicSlug}`);
    if (!r.category || !r.item || !r.detail) err(`${name}: malformed entry ${JSON.stringify(r).slice(0, 80)}`);
  }
}

// Soft checks
for (const t of data.topics) {
  if (t.outcomeIds.length > 8) warn(`${t.slug}: ${t.outcomeIds.length} outcomes — check it still fits a 20-40 minute session`);
  if (t.difficulty >= 4 && (t.examinerEvidence || []).length === 0) warn(`${t.slug}: difficulty ${t.difficulty} without examiner evidence`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const rows = {};
for (const u of CONTENT_UNITS) {
  const ts = data.topics.filter((t) => t.unit === u);
  rows[u] = {
    topics: ts.length,
    outcomes: ts.reduce((n, t) => n + t.outcomeIds.length, 0),
    specLOs: specLos[u].size,
    F: ts.filter((t) => t.tier === 'F').length,
    H: ts.filter((t) => t.tier === 'H').length,
    mixed: ts.filter((t) => t.tier === 'mixed').length,
    practicals: ts.reduce((n, t) => n + (t.practicals || []).length, 0),
    'diff>=4': ts.filter((t) => t.difficulty >= 4).length,
    phet: ts.reduce((n, t) => n + (t.phet || []).length, 0),
  };
}
rows.U7 = { topics: (data.unit7 || []).length, outcomes: (data.unit7 || []).reduce((n, g) => n + g.skillIds.length, 0), specLOs: specSkills.size };
rows.total = {
  topics: data.topics.length,
  outcomes: data.topics.reduce((n, t) => n + t.outcomeIds.length, 0),
  specLOs: CONTENT_UNITS.reduce((n, u) => n + specLos[u].size, 0),
  F: data.topics.filter((t) => t.tier === 'F').length,
  H: data.topics.filter((t) => t.tier === 'H').length,
  mixed: data.topics.filter((t) => t.tier === 'mixed').length,
  practicals: practicalHome.size,
  'diff>=4': data.topics.filter((t) => t.difficulty >= 4).length,
  phet: data.topics.reduce((n, t) => n + (t.phet || []).length, 0),
};
console.table(rows);
const diffHist = {};
for (const t of data.topics) diffHist[t.difficulty] = (diffHist[t.difficulty] || 0) + 1;
console.log('difficulty histogram:', diffHist);
console.log(`physicsEquations: ${(data.physicsEquations || []).length}, chemistryRecall: ${(data.chemistryRecall || []).length}, biologyRecall: ${(data.biologyRecall || []).length}`);
if (!cycles) console.log(`prerequisite DAG ok; longest chain ${maxDepth} (${deepest})`);

if (warnings.length) console.log(`\n${warnings.length} warning(s):\n  ` + warnings.join('\n  '));
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log('\nOK: all outcomes covered exactly once, slugs unique, prerequisites acyclic, tiers consistent.');
