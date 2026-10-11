// The metrics line, one per unit (the programme assessment of 11 Oct 2026, §4.5): the only progress report the owner needs
// between builds, and one that cannot be rounded up because every column is counted from files.
//
//   node scripts/qa/metrics.mjs [--build-log=<path>] [--json]
//
// Columns:
//   topics          rows in src/generated/manifest.json for the unit (the content build writes it)
//   v3.1            notes whose blocks carry at least one See it with a kind and at least one gate with option notes
//   structure-pass  notes that pass lesson structure v3 (src/lib/slides/readiness.ts noteStructure)
//   reviewed        rows the manifest marks ready via "reviewed" or "waived" (a reviewer's pass record exists)
//   ready           rows the manifest marks ready under the policy in force (manifest.readinessPolicy)
//   lint-lines      MARKING / GATE / SIZE / FIGURE / CHARACTER lines for the unit in the build log given (blank without one)
//   findings-files  strictest-review findings files still present under scratchpad/reports/review-<unit>-*.md
//
// Specs are per surface, not per unit: the build note carries them separately. The structure check loads the app's own
// readiness module through tsx's register API, as scripts/qa/lesson-v2.mjs does, so the count is the rule the build uses.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const args = process.argv.slice(2);
const buildLog = args.find((a) => a.startsWith("--build-log="))?.slice("--build-log=".length) ?? null;
const asJson = args.includes("--json");

const { register } = await import("tsx/esm/api");
register();
const { noteStructure } = await import(pathToFileURL(path.join(root, "src/lib/slides/readiness.ts")).href);

const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/generated/manifest.json"), "utf8"));
const policy = manifest.readinessPolicy ?? "reviewed";

const lintByUnit = new Map();
if (buildLog && fs.existsSync(buildLog)) {
  for (const line of fs.readFileSync(buildLog, "utf8").split(/\r?\n/)) {
    if (!/^(MARKING|GATE|SIZE|FIGURE|CHARACTER) /.test(line)) continue;
    const m = /\/content\/([a-z0-9]+)\//.exec(line);
    if (!m) continue;
    const unit = m[1].toUpperCase();
    lintByUnit.set(unit, (lintByUnit.get(unit) ?? 0) + 1);
  }
}

const reportsDir = path.join(root, "scratchpad/reports");
const findingsByUnit = new Map();
if (fs.existsSync(reportsDir)) {
  for (const f of fs.readdirSync(reportsDir)) {
    const m = /^review-([a-z0-9]+)-/.exec(f);
    if (m) findingsByUnit.set(m[1].toUpperCase(), (findingsByUnit.get(m[1].toUpperCase()) ?? 0) + 1);
  }
}

const units = new Map();
for (const t of manifest.topics) {
  const key = t.unit;
  const row = units.get(key) ?? { subject: t.subject, unit: key, topics: 0, v31: 0, structurePass: 0, reviewed: 0, ready: 0 };
  row.topics += 1;
  if (t.ready === true) row.ready += 1;
  if (t.ready === true && (t.readyVia === "reviewed" || t.readyVia === "waived")) row.reviewed += 1;
  const file = path.join(root, "public/content", t.subject, `${t.id}.json`);
  if (fs.existsSync(file)) {
    const bundle = JSON.parse(fs.readFileSync(file, "utf8"));
    const blocks = Array.isArray(bundle.noteBlocks) ? bundle.noteBlocks : [];
    const hasSeeKind = blocks.some((b) => b && b.type === "see" && typeof b.kind === "string");
    const hasOptionNotes = blocks.some((b) => b && b.type === "gate" && b.twin && b.twin.optionNotes && Object.keys(b.twin.optionNotes).length > 0);
    if (hasSeeKind && hasOptionNotes) row.v31 += 1;
    if (blocks.length > 0 && noteStructure(blocks).ok) row.structurePass += 1;
  }
  units.set(key, row);
}

const order = ["FM1", "FM2", "FM3", "M4", "M8", "B2", "C2", "P2", "U7", "M3", "M7", "B1", "C1", "P1"];
const rows = [...units.values()].sort((a, b) => (order.indexOf(a.unit) === -1 ? 99 : order.indexOf(a.unit)) - (order.indexOf(b.unit) === -1 ? 99 : order.indexOf(b.unit)));
for (const r of rows) {
  r.lintLines = buildLog ? lintByUnit.get(r.unit) ?? 0 : null;
  r.findingsFiles = findingsByUnit.get(r.unit) ?? 0;
}

if (asJson) {
  console.log(JSON.stringify({ policy, generatedAt: manifest.generatedAt, buildLog, units: rows }, null, 2));
} else {
  console.log(`readiness policy: ${policy} · manifest ${manifest.generatedAt ?? "?"}${buildLog ? ` · lint lines from ${buildLog}` : ""}`);
  console.log("unit | topics | v3.1 | structure-pass | reviewed | ready | lint-lines | findings-files");
  for (const r of rows) {
    console.log(`${r.unit.padEnd(4)} | ${String(r.topics).padStart(6)} | ${String(r.v31).padStart(4)} | ${String(r.structurePass).padStart(14)} | ${String(r.reviewed).padStart(8)} | ${String(r.ready).padStart(5)} | ${(r.lintLines === null ? "" : String(r.lintLines)).padStart(10)} | ${String(r.findingsFiles).padStart(14)}`);
  }
  const sum = (k) => rows.reduce((a, r) => a + (r[k] ?? 0), 0);
  console.log(`ALL  | ${String(sum("topics")).padStart(6)} | ${String(sum("v31")).padStart(4)} | ${String(sum("structurePass")).padStart(14)} | ${String(sum("reviewed")).padStart(8)} | ${String(sum("ready")).padStart(5)} | ${(buildLog ? String(sum("lintLines")) : "").padStart(10)} | ${String(sum("findingsFiles")).padStart(14)}`);
}
