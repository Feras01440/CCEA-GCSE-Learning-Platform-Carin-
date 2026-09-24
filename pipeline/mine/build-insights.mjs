#!/usr/bin/env node
/**
 * pipeline/mine/build-insights.mjs
 *
 * Builds the examiner-insight layer from the hand-authored distillations in
 * pipeline/mine/insights-source/{maths,further-maths,science}.mjs:
 *
 *   packs/<subject>/insights/<unit>.<slug>.json      one ExaminerInsight per topic (master plan 3.9)
 *   packs/<subject>/insights/misconceptions.json     the Misconception registry for the subject
 *
 * The source modules are written by a human/AI reader working from one CER block at a time
 * (pipeline/mine/cer-blocks/, produced by extract-cer.mjs). Everything in them is in our own
 * words; sources are cited as ExaminerSource ids `ccea-cer:<subject>:<series>:<unit>:Q<n>` and
 * the report URL is filled in here from the extract-cer manifest.
 *
 * Registry fields that are derived (never hand-typed): `sources` (every finding that cites the
 * misconception, plus any `extraSources` on the entry), `firstSeen` / `lastSeen` (earliest and
 * latest series among those sources).
 *
 * Topic id rule (shared with scripts/validate-insights.mjs):
 *   maths    maths.<unit>.<slug>         unit = topic.introducedIn lower-cased   e.g. maths.m4.histograms-unequal-widths
 *   fm       fm.u<n>.<slug>              topic.unit FM<n>                        e.g. fm.u1.algebraic-fractions-add-subtract
 *   science  science.<unit>.<slug'>      slug' = topic.slug without its "<unit>-" prefix; Unit 7 groups science.u7.<planning|...>
 *
 * Usage: node pipeline/mine/build-insights.mjs [--subject maths|further-maths|science] [--check]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MANIFEST } from "./extract-cer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

/** ccea-cer:<subject>:<yyyy>-<series>:<unit>:Q<n> with an optional part: Q21b, Q22(a), Q22(a)(ii). */
export const SOURCE_RE = /^ccea-cer:(maths|further-maths|science):(\d{4}-(?:march|summer|november)):([A-Za-z0-9-]+):Q(\d{1,2})((?:[a-z]|\([a-z]\)|\([ivx]+\))*)$/;
export const LEDGER_TAGS = new Set(["method", "accuracy", "misread", "presentation", "not-attempted", "concept"]);

export function seriesKey(series) {
  const m = /^(\d{4})-(march|summer|november)$/.exec(series);
  if (!m) throw new Error(`bad series ${series}`);
  return Number(m[1]) * 10 + { march: 1, summer: 2, november: 3 }[m[2]];
}

function urlFor(subject, series) {
  const entry = (MANIFEST[subject] ?? []).find((e) => e.series === series);
  if (!entry) throw new Error(`no report in the manifest for ${subject} ${series}`);
  return entry.url;
}

function parseSource(id) {
  const m = SOURCE_RE.exec(id);
  if (!m) throw new Error(`bad ExaminerSource "${id}"`);
  return { subject: m[1], series: m[2], unit: m[3], question: `Q${m[4]}` };
}

/** Build one subject; returns { insights, registry, problems }. */
export function buildSubject(mod) {
  const { subject, misconceptions, insights } = mod;
  const problems = [];
  const byId = new Map();
  for (const mc of misconceptions) {
    if (byId.has(mc.id)) problems.push(`duplicate misconception id ${mc.id}`);
    byId.set(mc.id, { ...mc, _sources: new Set(mc.extraSources ?? []) });
    if (!LEDGER_TAGS.has(mc.ledgerTag)) problems.push(`${mc.id}: bad ledgerTag ${mc.ledgerTag}`);
    for (const s of mc.extraSources ?? []) {
      try { parseSource(s); } catch (e) { problems.push(`${mc.id}: ${e.message}`); }
    }
  }

  const outInsights = [];
  const seenIds = new Set();
  for (const ins of insights) {
    if (seenIds.has(ins.id)) problems.push(`duplicate insight id ${ins.id}`);
    seenIds.add(ins.id);
    const findings = ins.findings.map((f) => {
      let url = "";
      try {
        const p = parseSource(f.source);
        if (p.subject !== subject) problems.push(`${ins.id}: source ${f.source} is not a ${subject} report`);
        url = urlFor(subject, p.series);
      } catch (e) {
        problems.push(`${ins.id}: ${e.message}`);
      }
      for (const mid of f.misconceptions ?? []) {
        const mc = byId.get(mid);
        if (!mc) problems.push(`${ins.id}: unknown misconception ${mid} (finding ${f.source})`);
        else mc._sources.add(f.source);
      }
      const out = { source: f.source, url, asked: f.asked, wentWrong: f.wentWrong };
      if (f.fullMarkAnswersDid) out.fullMarkAnswersDid = f.fullMarkAnswersDid;
      out.rule = f.rule;
      out.misconceptions = [...(f.misconceptions ?? [])];
      return out;
    });
    const out = { id: ins.id, topic: ins.topic, specRefs: [...ins.specRefs], findings, ruleToRemember: ins.ruleToRemember };
    if (ins.aStarSignal) out.aStarSignal = ins.aStarSignal;
    if (ins.note) out.note = ins.note;
    outInsights.push(out);
  }

  const registry = [];
  for (const mc of byId.values()) {
    const sources = [...mc._sources].sort((a, b) => {
      const pa = parseSource(a), pb = parseSource(b);
      return seriesKey(pa.series) - seriesKey(pb.series) || a.localeCompare(b);
    });
    if (sources.length === 0) problems.push(`${mc.id}: no finding cites this misconception`);
    const series = sources.map((s) => parseSource(s).series);
    const entry = {
      id: mc.id,
      label: mc.label,
      subject,
      statements: [...mc.statements],
      sources,
      firstSeen: series.length ? series.reduce((a, b) => (seriesKey(a) <= seriesKey(b) ? a : b)) : null,
      lastSeen: series.length ? series.reduce((a, b) => (seriesKey(a) >= seriesKey(b) ? a : b)) : null,
      ledgerTag: mc.ledgerTag,
    };
    if (mc.note) entry.note = mc.note;
    registry.push(entry);
  }
  registry.sort((a, b) => a.id.localeCompare(b.id));
  return { insights: outInsights, registry, problems };
}

export function insightFileName(ins) {
  // ins.topic = "<subject>.<unit>.<slug>" -> "<unit>.<slug>.json"
  const [, unit, ...rest] = ins.topic.split(".");
  return `${unit}.${rest.join(".")}.json`;
}

export async function loadSourceModule(subject) {
  const file = path.join(__dirname, "insights-source", `${subject}.mjs`);
  const mod = await import(`file://${file.replace(/\\/g, "/")}`);
  return mod.default ?? mod;
}

export async function buildAll({ subjects = ["maths", "further-maths", "science"], write = true } = {}) {
  const summary = [];
  let failed = false;
  for (const subject of subjects) {
    const mod = await loadSourceModule(subject);
    const { insights, registry, problems } = buildSubject(mod);
    if (problems.length) {
      failed = true;
      console.error(`\n${subject}: ${problems.length} problem(s)`);
      for (const p of problems) console.error("  - " + p);
    }
    const dir = path.join(ROOT, "packs", subject, "insights");
    if (write && !problems.length) {
      fs.mkdirSync(dir, { recursive: true });
      // remove stale generated insight files (keep misconceptions.json until rewritten)
      for (const f of fs.readdirSync(dir)) if (f.endsWith(".json") && f !== "misconceptions.json") fs.unlinkSync(path.join(dir, f));
      for (const ins of insights) {
        fs.writeFileSync(path.join(dir, insightFileName(ins)), JSON.stringify(ins, null, 2) + "\n", "utf8");
      }
      fs.writeFileSync(path.join(dir, "misconceptions.json"), JSON.stringify(registry, null, 2) + "\n", "utf8");
    }
    const findings = insights.reduce((n, i) => n + i.findings.length, 0);
    summary.push({ subject, insights: insights.length, findings, misconceptions: registry.length, dir: path.relative(ROOT, dir) });
  }
  return { summary, failed };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const si = args.indexOf("--subject");
  const subjects = si >= 0 ? [args[si + 1]] : undefined;
  const check = args.includes("--check");
  const { summary, failed } = await buildAll({ subjects, write: !check });
  for (const s of summary) console.log(`${s.subject.padEnd(14)} ${String(s.insights).padStart(3)} insights  ${String(s.findings).padStart(4)} findings  ${String(s.misconceptions).padStart(3)} misconceptions  -> ${s.dir}`);
  if (failed) process.exit(1);
}
