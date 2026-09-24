#!/usr/bin/env node
// Builds data/spec/mathematics.json from the hand-authored modules in scripts/maths-spec/.
// Usage: node scripts/build-maths-spec.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATEMENTS } from './maths-spec/statements.mjs';
import { FOUNDATION_TOPICS } from './maths-spec/topics-foundation.mjs';
import { HIGHER_TOPICS } from './maths-spec/topics-higher.mjs';
import { UNITS, STRANDS, PATHWAYS, EXAM_DATES, GRADE_BOUNDARIES } from './maths-spec/meta.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'data', 'spec', 'mathematics.json');

const unitByCode = Object.fromEntries(UNITS.map((u) => [u.code, u]));
const UNIT_ORDER = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
const FOUNDATION_UNITS = ['M1', 'M2', 'M5', 'M6'];

// Units whose assessment assumes unit `code` (the unit itself plus every unit listing it as a prerequisite).
const examinedInFor = (code) => UNIT_ORDER.filter((u) => u === code || unitByCode[u].prerequisiteUnits.includes(code));

const fail = (msg) => { throw new Error(msg); };

// ── statements ──
const statementById = new Map();
for (const s of STATEMENTS) {
  if (statementById.has(s.id)) fail(`duplicate statement id ${s.id}`);
  statementById.set(s.id, s);
}

// ── topics ──
const RAW_TOPICS = [...FOUNDATION_TOPICS, ...HIGHER_TOPICS];
const topicBySlug = new Map();
const statementTopics = new Map(STATEMENTS.map((s) => [s.id, []]));

const topics = RAW_TOPICS.map((t) => {
  if (topicBySlug.has(t.slug)) fail(`duplicate topic slug ${t.slug}`);
  const units = new Set();
  for (const id of t.statementIds) {
    const s = statementById.get(id) ?? fail(`topic ${t.slug} references unknown statement ${id}`);
    units.add(s.unit);
    statementTopics.get(id).push(t.slug);
  }
  if (units.size !== 1) fail(`topic ${t.slug} mixes units ${[...units].join(',')}`);
  const introducedIn = [...units][0];
  const built = {
    slug: t.slug,
    title: t.title,
    strand: t.strand,
    introducedIn,
    examinedIn: examinedInFor(introducedIn),
    tier: FOUNDATION_UNITS.includes(introducedIn) ? 'F' : 'H',
    statementIds: t.statementIds,
    prerequisites: t.prerequisites,
    calculator: t.calculator,
    difficulty: t.difficulty,
    examinerEvidence: t.examinerEvidence,
    mustMemorise: t.mustMemorise,
    onFormulaSheet: t.onFormulaSheet,
    corbettmaths: t.corbettmaths,
    keywords: t.keywords,
  };
  topicBySlug.set(t.slug, built);
  return built;
});

const statements = STATEMENTS.map((s) => ({
  id: s.id,
  unit: s.unit,
  strand: s.strand,
  text: s.text,
  topics: statementTopics.get(s.id),
  progressionOf: s.progressionOf,
  ...(s.progressionSource ? { progressionSource: s.progressionSource } : { ...(s.progressionOf ? { progressionSource: 'ccea-progression-table' } : {}) }),
  ...(s.note ? { note: s.note } : {}),
  ...(s.teacherGuidance ? { teacherGuidance: s.teacherGuidance } : {}),
}));

// ── routes: topicOrder = authored teaching order filtered to the units covered by the route ──
const routeOrder = (unitSet) => topics.filter((t) => unitSet.includes(t.introducedIn)).map((t) => t.slug);
const routes = {
  higher: {
    gateway: 'M4', completion: 'M8', units: UNIT_ORDER,
    stages: [['M1', 'M5'], ['M2', 'M6'], ['M3', 'M7'], ['M4', 'M8']],
    topicOrder: routeOrder(UNIT_ORDER),
  },
  foundation: {
    gateway: 'M2', completion: 'M6', units: FOUNDATION_UNITS,
    stages: [['M1', 'M5'], ['M2', 'M6']],
    topicOrder: routeOrder(FOUNDATION_UNITS),
  },
};

const out = {
  subject: 'CCEA GCSE Mathematics (2017)',
  subjectCode: '2210',
  cceaQualificationId: '504',
  qan: '603/1688/3',
  specVersion: 'Version 2: 8 June 2017',
  gradeScale: ['A*', 'A', 'B', 'C*', 'C', 'D', 'E', 'F', 'G'],
  generatedBy: 'scripts/build-maths-spec.mjs',
  generatedAt: new Date().toISOString().slice(0, 10),
  sources: {
    specification: 'docs/sources/maths/spec-2017-current_0.txt',
    progressionTable: 'docs/sources/maths/Progression-of-Subject-Content.txt',
    teacherGuidance: 'docs/sources/maths/teacher-guidance-2019.txt',
    research: ['docs/research/01-ccea-gcse-mathematics-spec.md', 'docs/research/01-ccea-gcse-mathematics-spec.parallel-version.md', 'docs/research/04-maths-learning-platforms.md', 'docs/research/08-past-papers-and-question-banks.v1-with-corbettmaths-mapping.md'],
  },
  units: UNITS,
  pathways: PATHWAYS,
  strands: STRANDS,
  statements,
  topics,
  routes,
  examDates: EXAM_DATES,
  gradeBoundaries: GRADE_BOUNDARIES,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');

// ── report ──
const count = (arr, key) => arr.reduce((m, x) => ((m[key(x)] = (m[key(x)] || 0) + 1), m), {});
console.log(`wrote ${OUT}`);
console.log('statements per unit:', count(statements, (s) => s.unit));
console.log('topics per unit:', count(topics, (t) => t.introducedIn));
console.log('topics per strand:', count(topics, (t) => t.strand));
console.log('topics per tier:', count(topics, (t) => t.tier));
console.log(`totals: ${statements.length} statements, ${topics.length} topics`);
