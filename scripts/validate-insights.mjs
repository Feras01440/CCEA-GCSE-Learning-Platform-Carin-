#!/usr/bin/env node
/**
 * scripts/validate-insights.mjs - run with `npx tsx scripts/validate-insights.mjs` (npm run insights:validate).
 *
 * Checks packs/<subject>/insights/ for maths, further-maths and science:
 *   - misconceptions.json: every entry validates as a Misconception, ids are unique, subject matches, every
 *     statement exists in the subject's spec (data/spec/*.json via src/lib/content/ids.ts), sources match the
 *     ExaminerSource pattern, firstSeen/lastSeen agree with the sources;
 *   - every <unit>.<slug>.json validates as an ExaminerInsight, its topic exists in the spec taxonomy
 *     (maths.<unit>.<slug> / fm.u<n>.<slug> / science.<unit>.<slug> / science.u7.<group>), the file name and id
 *     follow from the topic, every specRef exists, every finding source matches the pattern and names this
 *     subject, and every misconception id is in the registry;
 *   - when the private CER blocks exist (pipeline/mine/cer-blocks/<subject>), every cited source corresponds to a
 *     real block (Unit 7 codes are compared with hyphens removed).
 *
 * Exit code 1 on any error.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXAMINER_SOURCE_PATTERN, ExaminerInsight, Misconception } from "../src/lib/content/schema.ts";
import { statementIdsFor } from "../src/lib/content/ids.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SUBJECTS = ["maths", "further-maths", "science"];
const ALIAS = { maths: "maths", "further-maths": "fm", science: "science" };

const errors = [];
const warnings = [];
const err = (subject, msg) => errors.push(`${subject}: ${msg}`);
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function seriesKey(series) {
  const m = /^(\d{4})-(january|march|summer|november)$/.exec(series);
  return m ? Number(m[1]) * 10 + { january: 0, march: 1, summer: 2, november: 3 }[m[2]] : NaN;
}

/** Topic ids per subject, following the rule in pipeline/mine/build-insights.mjs. */
function topicIdsFor(subject) {
  const ids = new Set();
  if (subject === "maths") {
    for (const t of readJson(path.join(ROOT, "data/spec/mathematics.json")).topics) ids.add(`maths.${String(t.introducedIn).toLowerCase()}.${t.slug}`);
  } else if (subject === "further-maths") {
    for (const t of readJson(path.join(ROOT, "data/spec/further-mathematics.json")).topics) ids.add(`fm.u${t.unit.replace(/^FM/, "")}.${t.slug}`);
  } else {
    const spec = readJson(path.join(ROOT, "data/spec/double-award-science-topics.json"));
    for (const t of spec.topics) {
      const unit = t.unit.toLowerCase();
      ids.add(`science.${unit}.${t.slug.replace(new RegExp(`^${unit}-`), "")}`);
    }
    for (const t of spec.unit7) ids.add(`science.u7.${t.slug.replace(/^u7-/, "")}`);
  }
  return ids;
}

/** Source ids of the private CER blocks, hyphens removed from the unit segment, or null when the directory is absent. */
function cerSourcesFor(subject) {
  const dir = path.join(ROOT, "pipeline/mine/cer-blocks", subject);
  if (!fs.existsSync(dir)) return null;
  const out = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    for (const b of readJson(path.join(dir, f)).blocks ?? []) out.add(normaliseSource(b.source));
  }
  return out;
}
/** Unit codes lose their hyphens and a part suffix (Q21b, Q22(a)(ii)) is dropped so the id matches its CER block. */
function normaliseSource(id) {
  const parts = id.split(":");
  if (parts.length === 5) {
    parts[3] = parts[3].replace(/-/g, "");
    parts[4] = parts[4].replace(/^(Q\d{1,2}).*$/, "$1");
  }
  return parts.join(":");
}

function checkSource(subject, where, source) {
  if (!EXAMINER_SOURCE_PATTERN.test(source)) {
    err(subject, `${where}: source "${source}" does not match ccea-cer:<subject>:<yyyy>-<series>:<unit>:Q<n>`);
    return false;
  }
  if (source.split(":")[1] !== subject) err(subject, `${where}: source "${source}" is not a ${subject} report`);
  return true;
}

const summary = [];
for (const subject of SUBJECTS) {
  const dir = path.join(ROOT, "packs", subject, "insights");
  if (!fs.existsSync(dir)) {
    err(subject, `missing ${path.relative(ROOT, dir)} - run node pipeline/mine/build-insights.mjs`);
    continue;
  }
  const statements = statementIdsFor(subject);
  const topics = topicIdsFor(subject);
  const cer = cerSourcesFor(subject);

  // registry
  const registry = new Map();
  const regFile = path.join(dir, "misconceptions.json");
  if (!fs.existsSync(regFile)) err(subject, "misconceptions.json missing");
  else {
    const rows = readJson(regFile);
    if (!Array.isArray(rows)) err(subject, "misconceptions.json must be an array");
    for (const row of Array.isArray(rows) ? rows : []) {
      const parsed = Misconception.safeParse(row);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) err(subject, `misconception ${row?.id ?? "?"}: ${issue.path.join(".")}: ${issue.message}`);
        continue;
      }
      const mc = parsed.data;
      if (registry.has(mc.id)) err(subject, `duplicate misconception id ${mc.id}`);
      registry.set(mc.id, mc);
      if (mc.subject !== subject) err(subject, `misconception ${mc.id} has subject "${mc.subject}"`);
      for (const s of mc.statements) if (!statements.has(s)) err(subject, `misconception ${mc.id}: statement ${s} is not in the spec`);
      if (mc.sources.length === 0) err(subject, `misconception ${mc.id} has no sources`);
      for (const s of mc.sources) {
        if (checkSource(subject, `misconception ${mc.id}`, s) && cer && !cer.has(normaliseSource(s))) err(subject, `misconception ${mc.id}: source ${s} has no CER block`);
      }
      const keys = mc.sources.map((s) => seriesKey(s.split(":")[2]));
      if (keys.length && (seriesKey(mc.firstSeen) !== Math.min(...keys) || seriesKey(mc.lastSeen) !== Math.max(...keys))) {
        err(subject, `misconception ${mc.id}: firstSeen/lastSeen do not match its sources`);
      }
    }
  }

  // insight cards
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "misconceptions.json").sort();
  if (files.length === 0) err(subject, "no insight cards");
  const cited = new Set();
  let findings = 0;
  for (const f of files) {
    const raw = readJson(path.join(dir, f));
    const parsed = ExaminerInsight.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) err(subject, `${f}: ${issue.path.join(".")}: ${issue.message}`);
      continue;
    }
    const ins = parsed.data;
    const [alias, unit, ...slug] = ins.topic.split(".");
    if (alias !== ALIAS[subject]) err(subject, `${f}: topic ${ins.topic} does not belong to ${subject}`);
    if (!topics.has(ins.topic)) err(subject, `${f}: topic ${ins.topic} is not in the spec taxonomy`);
    if (f !== `${unit}.${slug.join(".")}.json`) err(subject, `${f}: file name should be ${unit}.${slug.join(".")}.json`);
    if (ins.id !== `ins.${ins.topic}`) err(subject, `${f}: id should be ins.${ins.topic}`);
    for (const s of ins.specRefs) if (!statements.has(s)) err(subject, `${f}: specRef ${s} is not in the spec`);
    ins.findings.forEach((fd, i) => {
      findings++;
      if (checkSource(subject, `${f} findings[${i}]`, fd.source) && cer && !cer.has(normaliseSource(fd.source))) {
        err(subject, `${f} findings[${i}]: source ${fd.source} has no CER block in pipeline/mine/cer-blocks/${subject}`);
      }
      for (const m of fd.misconceptions) {
        cited.add(m);
        if (!registry.has(m)) err(subject, `${f} findings[${i}]: misconception ${m} is not in misconceptions.json`);
      }
    });
    const dupes = ins.findings.map((x) => x.source).filter((s, i, a) => a.indexOf(s) !== i);
    if (dupes.length) err(subject, `${f}: the same source is cited twice (${[...new Set(dupes)].join(", ")})`);
  }
  // The builder accepts a registry entry that no card cites only when the source module gives it extraSources;
  // that is legitimate (the report evidence exists, the card does not yet), so it is reported, not failed.
  for (const id of registry.keys()) if (!cited.has(id)) warnings.push(`${subject}: misconception ${id} is cited by no card (kept alive by extraSources in the source module)`);

  summary.push({ subject, cards: files.length, findings, misconceptions: registry.size, cited: cited.size, cerChecked: cer ? cer.size : null });
}

for (const s of summary) {
  console.log(`${s.subject.padEnd(14)} ${String(s.cards).padStart(3)} cards  ${String(s.findings).padStart(4)} findings  ${String(s.misconceptions).padStart(3)} misconceptions (${s.cited} cited)${s.cerChecked === null ? "  (CER blocks absent: citation existence not checked)" : `  (checked against ${s.cerChecked} CER blocks)`}`);
}
for (const w of warnings) console.log(`warning: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\nOK: all insight cards and registries valid");
