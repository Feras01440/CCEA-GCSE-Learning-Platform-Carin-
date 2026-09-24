#!/usr/bin/env node
/**
 * build-science-topics.mjs
 *
 * Builds data/spec/double-award-science-topics.json — the teachable-topic layer
 * over data/spec/double-award-science.json — from the hand-authored definitions
 * in scripts/science-topics-source.mjs.
 *
 * Everything that can be derived from the spec JSON is derived here rather than
 * typed by hand: discipline, section id/title, spec side-labels, per-outcome tier,
 * the topic tier flag (F / H / mixed), the lists of Higher-only and partly-Higher
 * outcomes, prescribed-practical titles and the synthetic Unit 7 skill ids.
 *
 * Usage:  node scripts/build-science-topics.mjs [--spec <file>] [--out <file>]
 * Then:   node scripts/validate-science-topics.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topics, unit7, equations, chemistryRecall, biologyRecall, unitResources } from './science-topics-source.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const argv = process.argv.slice(2);
const opt = {
  spec: path.join(ROOT, 'data', 'spec', 'double-award-science.json'),
  out: path.join(ROOT, 'data', 'spec', 'double-award-science-topics.json'),
};
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--spec') opt.spec = argv[++i];
  else if (argv[i] === '--out') opt.out = argv[++i];
  else throw new Error(`Unknown argument ${argv[i]}`);
}

const spec = JSON.parse(fs.readFileSync(opt.spec, 'utf8'));

// ---------------------------------------------------------------------------
// Index the spec: unit -> outcome id -> { outcome, section, topicLabel }
// Unit 7 skills get synthetic ids U7.<section>.<n> (1-based, document order).
// ---------------------------------------------------------------------------
export const CONTENT_UNITS = ['B1', 'B2', 'C1', 'C2', 'P1', 'P2'];

export function indexSpec(specJson) {
  const byUnit = {};
  const unitMeta = {};
  for (const unit of specJson.units) {
    const code = unit.code === '7' ? 'U7' : unit.code;
    unitMeta[code] = { discipline: unit.discipline, title: unit.title };
    const idx = new Map();
    unit.sections.forEach((section, si) => {
      let n = 0;
      for (const topic of section.topics) {
        for (const outcome of topic.outcomes) {
          n++;
          let id = outcome.id;
          if (outcome.kind === 'skill') id = `U7.${si + 1}.${n}`;
          idx.set(id, { outcome, section, topicLabel: topic.label, sectionIndex: si + 1 });
        }
      }
    });
    byUnit[code] = idx;
  }
  return { byUnit, unitMeta };
}

/** Does an outcome contain any Higher-only content below a Foundation stem? */
function hasHigherParts(outcome) {
  if (outcome.mixed) return true;
  for (const b of outcome.bullets || []) {
    if (b.tier === 'H' || b.mixed) return true;
    for (const sb of b.sub || []) if (sb.tier === 'H' || sb.mixed) return true;
  }
  return false;
}

const { byUnit, unitMeta } = indexSpec(spec);
const practicalsByCode = new Map(spec.prescribedPracticals.map((p) => [p.code, p]));
const equationsByTopic = new Map();
for (const eq of equations) {
  if (!equationsByTopic.has(eq.topicSlug)) equationsByTopic.set(eq.topicSlug, []);
  equationsByTopic.get(eq.topicSlug).push(eq);
}

const problems = [];
const builtTopics = topics.map((t) => {
  const idx = byUnit[t.unit];
  if (!idx) { problems.push(`${t.slug}: unknown unit ${t.unit}`); return null; }
  const entries = t.outcomeIds.map((id) => {
    const e = idx.get(id);
    if (!e || e.outcome.kind !== 'lo') problems.push(`${t.slug}: outcome ${t.unit} ${id} not found in spec`);
    return { id, e };
  }).filter((x) => x.e);

  const sectionIds = [...new Set(entries.map((x) => x.e.section.id))];
  const primary = entries[0]?.e.section;
  const tiers = entries.map((x) => x.e.outcome.tier);
  const higherOnly = entries.filter((x) => x.e.outcome.tier === 'H').map((x) => x.id);
  const partlyHigher = entries.filter((x) => x.e.outcome.tier !== 'H' && hasHigherParts(x.e.outcome)).map((x) => x.id);
  let tier;
  if (entries.length && tiers.every((x) => x === 'H')) tier = 'H';
  else if (higherOnly.length === 0 && partlyHigher.length === 0) tier = 'F';
  else tier = 'mixed';

  const practicalDetails = t.practicals.map((code) => {
    const p = practicalsByCode.get(code);
    if (!p) problems.push(`${t.slug}: unknown practical ${code}`);
    return p ? { code, title: p.title, unit: p.unit } : { code };
  });

  const keyEquations = (equationsByTopic.get(t.slug) || []).map((eq) => ({
    id: eq.id, name: eq.name, formula: eq.formula, units: eq.units, tier: eq.tier, ...(eq.note ? { note: eq.note } : {}),
  }));

  return {
    slug: t.slug,
    unit: t.unit,
    discipline: unitMeta[t.unit].discipline,
    section: primary?.id ?? null,
    sectionTitle: primary?.title ?? null,
    ...(sectionIds.length > 1 ? { sections: sectionIds } : {}),
    specLabels: [...new Set(entries.map((x) => x.e.topicLabel).filter(Boolean))],
    title: t.title,
    outcomeIds: t.outcomeIds,
    outcomeTiers: Object.fromEntries(entries.map((x) => [x.id, x.e.outcome.tier])),
    tier,
    higherOnlyOutcomeIds: higherOnly,
    partlyHigherOutcomeIds: partlyHigher,
    practicals: t.practicals,
    practicalDetails,
    prerequisites: t.prerequisites,
    difficulty: t.difficulty,
    examinerEvidence: t.examinerEvidence,
    mustRecall: t.mustRecall,
    keyEquations,
    phet: t.phet,
    video: t.video,
    bitesize: t.bitesize ?? null,
    keywords: t.keywords,
  };
}).filter(Boolean);

// Unit 7 groups: attach the skill text so consumers do not need the spec.
const u7idx = byUnit.U7;
const builtUnit7 = unit7.map((g) => {
  const skills = g.skillIds.map((id) => {
    const e = u7idx.get(id);
    if (!e) { problems.push(`${g.slug}: unknown skill id ${id}`); return { id }; }
    return { id, text: e.outcome.text, bullets: (e.outcome.bullets || []).map((b) => b.text) };
  });
  for (const code of g.practicalsPractised) if (!practicalsByCode.has(code)) problems.push(`${g.slug}: unknown practical ${code}`);
  return {
    slug: g.slug,
    unit: 'U7',
    discipline: unitMeta.U7.discipline,
    sectionTitle: g.sectionTitle,
    title: g.title,
    skillIds: g.skillIds,
    skills,
    practicalsPractised: g.practicalsPractised,
    prerequisites: g.prerequisites,
    difficulty: g.difficulty,
    examinerEvidence: g.examinerEvidence,
    mustRecall: g.mustRecall,
    bitesize: g.bitesize ?? null,
    keywords: g.keywords,
  };
});

if (problems.length) {
  console.error('Build problems:\n  ' + problems.join('\n  '));
  process.exit(1);
}

/**
 * Teaching order per unit: a stable topological sort of the authored order —
 * a topic is emitted as soon as every prerequisite *in the same unit* has been
 * emitted, ties broken by authored position. Cross-unit prerequisites are not
 * ordered here (Unit 1s precede Unit 2s by timetable; validator enforces that
 * no Unit-1 topic depends on a Unit-2 topic).
 */
function teachingOrder(list) {
  const remaining = [...list];
  const placed = new Set();
  const out = [];
  const inUnit = new Set(list.map((t) => t.slug));
  while (remaining.length) {
    const i = remaining.findIndex((t) => t.prerequisites.every((p) => !inUnit.has(p) || placed.has(p)));
    if (i < 0) throw new Error(`Prerequisite cycle inside a unit among: ${remaining.map((t) => t.slug).join(', ')}`);
    const [t] = remaining.splice(i, 1);
    placed.add(t.slug);
    out.push(t.slug);
  }
  return out;
}
const unitOrder = {};
for (const u of CONTENT_UNITS) unitOrder[u] = teachingOrder(builtTopics.filter((t) => t.unit === u));
unitOrder.U7 = teachingOrder(builtUnit7);

const physicsEquations = equations.filter((e) => e.discipline === 'Physics').map(({ discipline, ...rest }) => rest);
const chemistryFormulae = equations.filter((e) => e.discipline === 'Chemistry').map((e) => ({
  category: 'formula', item: e.name, detail: e.formula, topicSlug: e.topicSlug, tier: e.tier, id: e.id, units: e.units,
}));

const out = {
  subject: 'CCEA GCSE Double Award Science (2017)',
  subjectCode: spec.subjectCode,
  source: {
    spec: path.relative(ROOT, opt.spec).replace(/\\/g, '/'),
    definitions: 'scripts/science-topics-source.mjs',
    generatedBy: 'scripts/build-science-topics.mjs',
    research: [
      'docs/research/03-ccea-gcse-double-award-science-spec.md (sections 5.9, 7, 8, 9)',
      'docs/research/05-science-learning-platforms.md (PhET, YouTube, Bitesize ids)',
    ],
    tierRule: 'tier "H" = every outcome in the topic is Higher-only; "F" = no Higher-only content at all (no H outcome, no partly-bold stem, no H bullet); otherwise "mixed". higherOnlyOutcomeIds lists whole-H outcomes; partlyHigherOutcomeIds lists F stems carrying H bullets/phrases (see textMarked in the spec JSON).',
    skillIdRule: 'Unit 7 skills have no ids in the spec; they are numbered U7.<sectionIndex>.<outcomeIndex> (1-based, document order over the four skill areas).',
    difficultyRule: '1 = straightforward recall … 5 = repeatedly among the worst-answered areas in Chief Examiner reports (Summer 2023–March 2026).',
  },
  counts: {},
  topics: builtTopics,
  unitOrder,
  unit7: builtUnit7,
  physicsEquations,
  chemistryRecall: [...chemistryRecall, ...chemistryFormulae],
  biologyRecall,
  unitResources,
};

for (const u of CONTENT_UNITS) {
  const ts = builtTopics.filter((t) => t.unit === u);
  out.counts[u] = {
    topics: ts.length,
    outcomes: ts.reduce((n, t) => n + t.outcomeIds.length, 0),
    tierF: ts.filter((t) => t.tier === 'F').length,
    tierH: ts.filter((t) => t.tier === 'H').length,
    tierMixed: ts.filter((t) => t.tier === 'mixed').length,
  };
}
out.counts.U7 = { groups: builtUnit7.length, skills: builtUnit7.reduce((n, g) => n + g.skillIds.length, 0) };
out.counts.total = { topics: builtTopics.length, outcomes: builtTopics.reduce((n, t) => n + t.outcomeIds.length, 0) };

fs.writeFileSync(opt.out, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${path.relative(ROOT, opt.out)}`);
console.table(out.counts);
