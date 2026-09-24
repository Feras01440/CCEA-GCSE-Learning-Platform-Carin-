#!/usr/bin/env node
/**
 * scripts/find-unregistered-misconceptions.mjs - run with `npm run insights:unregistered`.
 *
 * Scans every packs/<subject>/content/**\/bundle.json for the misconception ids the authored content
 * uses, and reports the ones that are not in the subject's generated registry
 * packs/<subject>/insights/misconceptions.json (built by pipeline/mine/build-insights.mjs from
 * pipeline/mine/insights-source/<subject>*.mjs).
 *
 * The places a bundle names a misconception:
 *   diagnostics[].items[].options[].misconception        (distractor diagnosis)
 *   questions[].parts[].commonErrors[].misconception     (per-part error ledger)
 *   findTheMistake[].misconception                       (the mistake being hunted)
 *   insight.findings[].misconceptions[]                  (embedded examiner-insight card)
 * plus, defensively, any other `misconception` string or `misconceptions` array anywhere in a bundle:
 * the walk is generic, so a new authoring slot is picked up without editing this script.
 *
 * Output: missing ids grouped by subject, each with every bundle + item that uses it, and (with
 * --all) the full usage census. Exit code 1 when anything is missing, so it can gate a build.
 *
 * Usage: node scripts/find-unregistered-misconceptions.mjs [--subject maths] [--all] [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = path.join(ROOT, "packs");

const args = process.argv.slice(2);
const si = args.indexOf("--subject");
const onlySubject = si >= 0 ? args[si + 1] : null;
const showAll = args.includes("--all");
const asJson = args.includes("--json");

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

/** Every bundle.json under a directory, sorted. */
function findBundles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findBundles(full));
    else if (entry.name === "bundle.json") out.push(full);
  }
  return out;
}

/**
 * Walk a bundle and yield { id, where, item } for every misconception reference.
 *   where = a JSON-ish path, e.g. "diagnostics[0].items[2].options[1].misconception"
 *   item  = the best human handle for the thing that uses it (nearest id/label above it)
 */
function collectRefs(node, where, trail, out) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectRefs(v, `${where}[${i}]`, trail, out));
    return;
  }
  if (!node || typeof node !== "object") return;

  const handle = node.id ?? node.ref ?? node.source ?? node.code ?? null;
  const nextTrail = handle && typeof handle === "string" ? [...trail, handle] : trail;

  for (const [key, value] of Object.entries(node)) {
    const at = where ? `${where}.${key}` : key;
    if (key === "misconception" && typeof value === "string") {
      out.push({ id: value, where: at, item: nextTrail[nextTrail.length - 1] ?? "" });
      continue;
    }
    if (key === "misconceptions" && Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === "string") out.push({ id: v, where: `${at}[${i}]`, item: nextTrail[nextTrail.length - 1] ?? "" });
      });
      continue;
    }
    collectRefs(value, at, nextTrail, out);
  }
}

const subjects = fs
  .readdirSync(PACKS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((s) => !onlySubject || s === onlySubject)
  .sort();

const report = [];
let missingTotal = 0;
let usedTotal = 0;

for (const subject of subjects) {
  const bundles = findBundles(path.join(PACKS, subject, "content"));
  if (bundles.length === 0) continue;

  const regFile = path.join(PACKS, subject, "insights", "misconceptions.json");
  const registered = new Set();
  let registryMissing = false;
  if (fs.existsSync(regFile)) {
    for (const row of readJson(regFile)) if (row?.id) registered.add(row.id);
  } else {
    registryMissing = true;
  }

  /** id -> [{ bundle, where, item }] */
  const uses = new Map();
  for (const file of bundles) {
    const refs = [];
    collectRefs(readJson(file), "", [], refs);
    for (const ref of refs) {
      if (!uses.has(ref.id)) uses.set(ref.id, []);
      uses.get(ref.id).push({ bundle: rel(file), where: ref.where, item: ref.item });
    }
  }

  const ids = [...uses.keys()].sort();
  const missing = ids.filter((id) => !registered.has(id));
  usedTotal += ids.length;
  missingTotal += missing.length;
  report.push({ subject, bundles: bundles.length, registered: registered.size, used: ids.length, registryMissing, missing, uses });
}

if (asJson) {
  console.log(
    JSON.stringify(
      report.map((r) => ({
        subject: r.subject,
        bundles: r.bundles,
        registered: r.registered,
        used: r.used,
        missing: r.missing.map((id) => ({ id, uses: r.uses.get(id) })),
      })),
      null,
      2,
    ),
  );
} else {
  for (const r of report) {
    console.log(
      `\n=== ${r.subject}: ${r.bundles} bundle(s), ${r.used} misconception id(s) used, ${r.registered} registered` +
        `${r.registryMissing ? "  (packs/" + r.subject + "/insights/misconceptions.json is MISSING)" : ""}`,
    );
    if (r.missing.length === 0) {
      console.log("  all used ids are in the registry");
    } else {
      console.log(`  ${r.missing.length} id(s) not in the registry:\n`);
      for (const id of r.missing) {
        console.log(`  ${id}`);
        for (const u of r.uses.get(id)) console.log(`      ${u.bundle}  ${u.where}${u.item ? `  [${u.item}]` : ""}`);
        console.log("");
      }
    }
    if (showAll) {
      console.log("  full usage census (uses x id):");
      for (const id of [...r.uses.keys()].sort()) console.log(`    ${String(r.uses.get(id).length).padStart(3)}  ${id}`);
    }
  }
  console.log(
    missingTotal === 0
      ? `\nOK: every misconception id used by the ${usedTotal ? "content bundles" : "bundles"} is registered`
      : `\n${missingTotal} unregistered misconception id(s) - add them to pipeline/mine/insights-source/ and run npm run insights:build`,
  );
}

if (missingTotal > 0) process.exit(1);
