#!/usr/bin/env node
// Assembles data/spec/further-mathematics.json from the hand-curated modules in scripts/fm-spec/.
// Usage: node scripts/build-fm-spec.mjs [--out data/spec/further-mathematics.json]
// Statement→topic links are derived from topics[].statementIds so the two directions can never disagree;
// topicOrder is the authoring order within each unit (a teaching sequence consistent with the prerequisite DAG).

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { statements } from "./fm-spec/statements.mjs";
import { topicsFM1 } from "./fm-spec/topics-fm1.mjs";
import { topicsFM2 } from "./fm-spec/topics-fm2.mjs";
import { topicsFM3 } from "./fm-spec/topics-fm3.mjs";
import { topicsFM4 } from "./fm-spec/topics-fm4.mjs";
import { units, structureRules, examDates, gradeBoundaries, markingConventions, source } from "./fm-spec/meta.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outPath = resolve(root, outIdx >= 0 ? args[outIdx + 1] : "data/spec/further-mathematics.json");

// Teaching order per unit: a stable topological sort of the authored order over the internal prerequisite edges
// (Kahn's algorithm, always emitting the earliest-authored topic whose prerequisites are all emitted).
const orderUnit = (list) => {
  const slugs = new Set(list.map(t => t.slug));
  const done = new Set();
  const out = [];
  while (out.length < list.length) {
    const next = list.find(t => !done.has(t.slug) && t.prerequisites.every(p => !slugs.has(p) || done.has(p)));
    if (!next) throw new Error(`prerequisite cycle among: ${list.filter(t => !done.has(t.slug)).map(t => t.slug).join(", ")}`);
    done.add(next.slug);
    out.push(next);
  }
  return out;
};
const topics = [topicsFM1, topicsFM2, topicsFM3, topicsFM4].flatMap(orderUnit);

// Derive statements[].topics from topics[].statementIds.
const topicsByStatement = new Map();
for (const t of topics) {
  for (const sid of t.statementIds) {
    if (!topicsByStatement.has(sid)) topicsByStatement.set(sid, []);
    topicsByStatement.get(sid).push(t.slug);
  }
}
const statementsOut = statements.map(s => ({ ...s, topics: topicsByStatement.get(s.id) ?? [] }));

const topicOrder = {};
for (const u of units) topicOrder[u.code] = topics.filter(t => t.unit === u.code).map(t => t.slug);

const doc = {
  subject: "CCEA GCSE Further Mathematics (2017)",
  subjectCode: "2330",
  cceaQualificationId: "507",
  qan: "603/1054/6",
  specVersion: "Version 2: 17 September 2019",
  firstTeaching: "September 2017",
  firstAward: "Summer 2019",
  gradeScale: ["A*", "A", "B", "C*", "C", "D", "E", "F", "G"],
  source,
  structure: structureRules,
  units,
  statements: statementsOut,
  topics,
  topicOrder,
  examDates,
  gradeBoundaries,
  markingConventions
};

// Basic sanity before writing (the full check lives in scripts/validate-fm-spec-json.mjs).
const orphanStatements = statementsOut.filter(s => s.topics.length === 0).map(s => s.id);
if (orphanStatements.length) {
  console.error("Statements with no topic:", orphanStatements.join(", "));
  process.exit(1);
}
const knownStatementIds = new Set(statements.map(s => s.id));
const badRefs = topics.flatMap(t => t.statementIds.filter(id => !knownStatementIds.has(id)).map(id => `${t.slug} -> ${id}`));
if (badRefs.length) {
  console.error("Topics referencing unknown statements:", badRefs.join(", "));
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(doc, null, 2) + "\n", "utf8");

for (const u of units) {
  const st = statementsOut.filter(s => s.unit === u.code).length;
  const tp = topics.filter(t => t.unit === u.code).length;
  console.log(`${u.code}: ${st} statements, ${tp} topics`);
}
console.log(`Total: ${statementsOut.length} statements, ${topics.length} topics -> ${outPath}`);
