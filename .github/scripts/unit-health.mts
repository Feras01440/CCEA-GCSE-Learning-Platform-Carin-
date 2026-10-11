/**
 * Per-unit content health for the nightly job summary (.github/workflows/nightly.yml), from what the content build
 * published and what the report-mode lints found. Run from the repository root after the content build:
 *
 *   npx tsx .github/scripts/unit-health.mts --lesson-v2 <lesson-v2 --json output> --figure-leaks <figure-leaks --json file> --out <file>
 *
 * Per unit (the manifest's units, in its order):
 *   topics          published topics (src/generated/manifest.json)
 *   v3.1            notes with a See it block whose every inline See it names its kind and every wrong option of a
 *                   choice gate carries its note (the V3.1 lines of content-lint.ts noteBlockWarnings: none)
 *   structure-pass  notes that pass lesson structure v3 (readiness.ts noteStructure, on the shipped note)
 *   reviewed        notes whose latest teach-show-check review says pass (readiness.ts reviewOf)
 *   ready           the manifest's verdict under its policy, and how (structure, reviewed, waived)
 *   lint warnings   lesson-v2's findings in report mode (--see, --teach, --prompts, --withdrawn problems, examiner
 *                   sources no trap answers, fatal breaches) and figure-leaks' LEAK and worked-example lines
 * Everything is read from the published content and the lints' own JSON; nothing is re-judged here.
 */
import fs from "node:fs";
import path from "node:path";
import { hasSeeBlock, noteStructure, reviewOf } from "../../src/lib/slides/readiness.ts";
import { noteBlockWarnings } from "../../src/components/items/content-lint.ts";

type Row = { unit: string; slug: string };
type Manifest = { readinessPolicy?: string; topics: Array<{ id: string; subject: string; unit: string; slug: string; ready?: boolean; readyVia?: string | null }> };

const argv = process.argv.slice(2);
const arg = (name: string): string | null => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const ROOT = process.cwd();
const readJson = <T,>(file: string | null): T | null => {
  if (!file || !fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
};

const manifest = readJson<Manifest>(path.join(ROOT, "src", "generated", "manifest.json"));
if (!manifest) {
  console.error("unit-health: src/generated/manifest.json is missing or unreadable; run the content build first");
  process.exit(2);
}
const lesson = readJson<Record<string, unknown>>(arg("--lesson-v2"));
const leaks = readJson<Record<string, unknown>>(arg("--figure-leaks"));

const V31 = [/\(See it\): no kind\b/, /: no option note on "/];
const POSITIONAL = /names an option by its place/;

type Health = {
  subject: string;
  unit: string;
  /** The unit's topic slugs, so the summary can credit the specs that name a topic to its unit. */
  slugs: string[];
  topics: number;
  withSee: number;
  v31: number;
  structurePass: number;
  reviewed: number;
  ready: number;
  readyVia: Record<string, number>;
  lints: Record<string, number>;
  lintTotal: number;
  unclassifiedGateWarnings: number;
};
const units = new Map<string, Health>();
const unitOf = (u: string) => u.toUpperCase();

for (const t of manifest.topics) {
  const key = unitOf(t.unit);
  if (!units.has(key))
    units.set(key, { subject: t.subject, unit: key, slugs: [], topics: 0, withSee: 0, v31: 0, structurePass: 0, reviewed: 0, ready: 0, readyVia: {}, lints: {}, lintTotal: 0, unclassifiedGateWarnings: 0 });
  const h = units.get(key)!;
  h.topics += 1;
  h.slugs.push(t.slug);
  if (t.ready) {
    h.ready += 1;
    const via = t.readyVia ?? "unknown";
    h.readyVia[via] = (h.readyVia[via] ?? 0) + 1;
  }
  const file = path.join(ROOT, "public", "content", t.subject, `${t.id}.json`);
  const bundle = readJson<Record<string, unknown>>(file);
  const blocks = bundle && Array.isArray(bundle.noteBlocks) ? (bundle.noteBlocks as unknown[]) : null;
  if (!bundle || !blocks) continue;
  if (noteStructure(blocks).ok) h.structurePass += 1;
  if (reviewOf(bundle as Parameters<typeof reviewOf>[0])?.result === "pass") h.reviewed += 1;
  if (hasSeeBlock(blocks)) {
    h.withSee += 1;
    const warnings = noteBlockWarnings(blocks, `${t.subject}/${t.unit}/${t.slug}`, bundle);
    if (!warnings.some((w) => V31.some((re) => re.test(w)))) h.v31 += 1;
    h.unclassifiedGateWarnings += warnings.filter((w) => !V31.some((re) => re.test(w)) && !POSITIONAL.test(w)).length;
  }
}

const add = (unit: string, family: string, n: number) => {
  const h = units.get(unitOf(unit));
  if (!h || !n) return;
  h.lints[family] = (h.lints[family] ?? 0) + n;
};
const rows = <T extends Row>(key: string): T[] => (lesson && Array.isArray(lesson[key]) ? (lesson[key] as T[]) : []);
for (const r of rows<Row & { findings: unknown[] }>("see")) add(r.unit, "see", r.findings.length);
for (const r of rows<Row & { failures: unknown[] }>("teach")) add(r.unit, "teach", r.failures.length);
for (const r of rows<Row & { findings: unknown[] }>("prompts")) add(r.unit, "prompts", r.findings.length);
for (const r of rows<Row & { problems: unknown[] }>("withdrawn")) add(r.unit, "withdrawn", r.problems.length);
for (const r of rows<Row & { warnings: unknown[] }>("warned")) add(r.unit, "examiner", r.warnings.length);
for (const r of rows<Row & { findings: unknown[] }>("findings")) add(r.unit, "breaches", r.findings.length);
const leakRows = (key: string): Array<{ unit: string }> => (leaks && Array.isArray(leaks[key]) ? (leaks[key] as Array<{ unit: string }>) : []);
for (const r of leakRows("leaks")) add(r.unit, "figure-leaks", 1);
for (const r of leakRows("weLeaks")) add(r.unit, "we-leaks", 1);
for (const h of units.values()) h.lintTotal = Object.values(h.lints).reduce((a, n) => a + n, 0);

const out = {
  generatedAt: new Date().toISOString(),
  readinessPolicy: manifest.readinessPolicy ?? null,
  sources: { lessonV2: Boolean(lesson), figureLeaks: Boolean(leaks) },
  units: [...units.values()],
};
const outFile = arg("--out");
if (outFile) fs.writeFileSync(outFile, `${JSON.stringify(out, null, 2)}\n`);
else console.log(JSON.stringify(out, null, 2));
