#!/usr/bin/env node
/**
 * scripts/validate-packs.mjs - run with `npx tsx scripts/validate-packs.mjs` (npm run packs:validate).
 *
 * Checks every packs/<subject>/pack.json:
 *   1. validates against the Zod SubjectPack schema (src/lib/content/schema.ts);
 *   2. every referenced file (commandWordsFile, tariffsFile, formulaSheetsFile, methodLocksFile, qwcBandsFile,
 *      rubricsFile and the free-form resourceFiles map) exists and parses as JSON;
 *   3. every command word, every mark-language rule and every mark code carries a non-empty `source`, both in
 *      pack.json and in the exam-true files it was embedded from (and the two agree);
 *   4. data-pack/boundaries.json is a `$ref` into data/grades/ccea-gcse-boundaries.json whose key exists, and
 *      data-pack/rules.json rows all have id, text and source;
 *   5. sanity: unit codes unique, unit UMS totals add up where the qualification defines a total, timetabled
 *      series agree with data/exams/exam-map.json.
 *
 * Exit code 1 on any error. Warnings do not fail the run.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SubjectPack } from "../src/lib/content/schema.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = path.join(ROOT, "packs");

const errors = [];
const warnings = [];
const err = (pack, msg) => errors.push(`${pack}: ${msg}`);
const warn = (pack, msg) => warnings.push(`${pack}: ${msg}`);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function tryJson(pack, file, label) {
  if (!fs.existsSync(file)) {
    err(pack, `${label} not found: ${path.relative(ROOT, file)}`);
    return null;
  }
  try {
    return readJson(file);
  } catch (e) {
    err(pack, `${label} is not valid JSON (${path.relative(ROOT, file)}): ${e.message}`);
    return null;
  }
}

const hasSource = (row) => typeof row?.source === "string" && row.source.trim().length > 0;

function checkSourced(pack, rows, label) {
  if (!Array.isArray(rows)) {
    err(pack, `${label}: expected an array`);
    return;
  }
  rows.forEach((row, i) => {
    if (!hasSource(row)) err(pack, `${label}[${i}] (${row?.id ?? row?.word ?? row?.code ?? "?"}) has no source`);
  });
}

const examMap = readJson(path.join(ROOT, "data/exams/exam-map.json"));
function timetabledSeries(subject, unitCode) {
  const found = new Set();
  for (const p of examMap.papers) {
    if (p.subject === subject && String(p.unit).split("|").includes(unitCode)) found.add(p.series.split("-")[1]);
  }
  return found;
}

const summary = [];
const packDirs = fs
  .readdirSync(PACKS)
  .filter((d) => fs.existsSync(path.join(PACKS, d, "pack.json")))
  .sort();

if (packDirs.length === 0) errors.push("no packs/<subject>/pack.json found");

for (const id of packDirs) {
  const dir = path.join(PACKS, id);
  const raw = tryJson(id, path.join(dir, "pack.json"), "pack.json");
  if (!raw) continue;

  // 1. schema
  const parsed = SubjectPack.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) err(id, `schema: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    continue;
  }
  const pack = parsed.data;
  if (pack.id !== id) err(id, `pack id "${pack.id}" does not match its folder`);

  // 2. referenced files
  const fileKeys = ["commandWordsFile", "tariffsFile", "formulaSheetsFile", "methodLocksFile", "qwcBandsFile", "rubricsFile"];
  const loaded = {};
  for (const key of fileKeys) {
    if (!pack[key]) continue;
    loaded[key] = tryJson(id, path.join(dir, pack[key]), key);
  }
  for (const [key, rel] of Object.entries(raw.resourceFiles ?? {})) {
    if (typeof rel !== "string") {
      err(id, `resourceFiles.${key} must be a relative path string`);
      continue;
    }
    tryJson(id, path.join(dir, rel), `resourceFiles.${key}`);
  }

  // 3. sources on command words, rules, codes
  if (loaded.commandWordsFile) checkSourced(id, loaded.commandWordsFile.words, `${pack.commandWordsFile} words`);
  checkSourced(id, pack.markLanguage.rules, "markLanguage.rules");
  checkSourced(id, raw.markLanguage?.codes, "markLanguage.codes");
  if (loaded.methodLocksFile) checkSourced(id, loaded.methodLocksFile.locks, `${pack.methodLocksFile} locks`);
  if (loaded.qwcBandsFile) checkSourced(id, loaded.qwcBandsFile.bands, `${pack.qwcBandsFile} bands`);
  if (loaded.tariffsFile && typeof loaded.tariffsFile.source !== "string") err(id, `${pack.tariffsFile} has no top-level source`);

  const mlFile = path.join(dir, "exam-true", "mark-language.json");
  const ml = tryJson(id, mlFile, "exam-true/mark-language.json");
  if (ml) {
    checkSourced(id, ml.codes, "exam-true/mark-language.json codes");
    checkSourced(id, ml.rules, "exam-true/mark-language.json rules");
    const packCodes = pack.markLanguage.codes.map((c) => c.code).sort().join(",");
    const fileCodes = (ml.codes ?? []).map((c) => c.code).sort().join(",");
    if (packCodes !== fileCodes) err(id, `markLanguage.codes [${packCodes}] differ from exam-true/mark-language.json [${fileCodes}] - re-run npm run packs:build`);
    const packRules = pack.markLanguage.rules.map((r) => r.id).join(",");
    const fileRules = (ml.rules ?? []).map((r) => r.id).join(",");
    if (packRules !== fileRules) err(id, `markLanguage.rules differ from exam-true/mark-language.json - re-run npm run packs:build`);
    if (ml.followThrough !== pack.markLanguage.followThrough || ml.positiveMarking !== pack.markLanguage.positiveMarking) {
      err(id, "markLanguage followThrough/positiveMarking flags differ from exam-true/mark-language.json");
    }
  }

  // 4. data pack
  const bFile = path.join(dir, "data-pack", "boundaries.json");
  const boundaries = tryJson(id, bFile, "data-pack/boundaries.json");
  if (boundaries) {
    const ref = boundaries.$ref;
    const m = typeof ref === "string" ? /^(.+?)#\/([A-Za-z0-9_-]+)$/.exec(ref) : null;
    if (!m) err(id, `data-pack/boundaries.json $ref must look like "<path>#/<key>" (got ${JSON.stringify(ref)})`);
    else {
      const target = path.resolve(path.dirname(bFile), m[1]);
      const data = tryJson(id, target, "boundaries $ref target");
      if (data && !(m[2] in data)) err(id, `boundaries $ref key "${m[2]}" not found in ${path.relative(ROOT, target)} (keys: ${Object.keys(data).join(", ")})`);
      else if (data) {
        const codes = new Set(pack.units.map((u) => u.code));
        const unitKeys = Object.keys(data[m[2]].units ?? {}).filter((k) => !k.startsWith("$"));
        const mapped = unitKeys.map((k) => k.replace(/^U(\d)$/, (_, n) => (id === "further-maths" ? `FM${n}` : n)).replace(/^U7[AB]$/, "7"));
        const missing = mapped.filter((k) => !codes.has(k));
        if (missing.length) warn(id, `boundaries units without a pack unit: ${missing.join(", ")}`);
      }
    }
  }
  const rulesFile = path.join(dir, "data-pack", "rules.json");
  const rules = tryJson(id, rulesFile, "data-pack/rules.json");
  if (rules) {
    const rows = Array.isArray(rules) ? rules : rules.rules;
    checkSourced(id, rows, "data-pack/rules.json rules");
    (rows ?? []).forEach((r, i) => {
      if (!r?.id || !r?.text) err(id, `data-pack/rules.json rules[${i}] needs id and text`);
    });
    const expected = examMap.rules?.[id] ?? [];
    for (const text of expected) {
      if (!(rows ?? []).some((r) => r.text === text)) warn(id, `data-pack/rules.json does not carry the exam-map rule verbatim: "${text.slice(0, 60)}..."`);
    }
  }

  // 5. sanity
  const totalUms = pack.units.reduce((n, u) => n + u.umsMax, 0);
  if (id === "science" && totalUms !== 600) err(id, `unit umsMax totals ${totalUms}, expected 600`);
  if (id === "further-maths") {
    const fm1 = pack.units.find((u) => u.code === "FM1");
    if (!fm1 || fm1.umsMax !== 100) err(id, "FM1 umsMax must be 100 (half of 200)");
    if (pack.units.filter((u) => u.code !== "FM1").some((u) => u.umsMax !== 50)) err(id, "FM2-FM4 umsMax must be 50 each");
  }
  for (const u of pack.units) {
    const tt = timetabledSeries(id, u.code);
    if (tt.size) {
      const declared = new Set(u.series);
      for (const s of tt) if (!declared.has(s)) err(id, `unit ${u.code} is timetabled in ${s} (exam-map) but the pack does not list it`);
      for (const s of declared) if (!tt.has(s)) warn(id, `unit ${u.code} lists ${s} but exam-map has no paper for it`);
    } else warn(id, `unit ${u.code} has no rows in data/exams/exam-map.json (series taken from the pack config)`);
    for (const p of u.papers) if (p.marks <= 0 || p.minutes <= 0) err(id, `unit ${u.code} paper "${p.name}" has non-positive marks/minutes`);
  }

  summary.push({
    id,
    units: pack.units.map((u) => `${u.code}(${u.tier}, ${u.weighting}%, ${u.umsMax} UMS, ${u.papers.length}p)`).join(" "),
    codes: pack.markLanguage.codes.map((c) => c.code).join("/"),
    rules: pack.markLanguage.rules.length,
    words: loaded.commandWordsFile?.words?.length ?? 0,
  });
}

for (const s of summary) {
  console.log(`${s.id.padEnd(14)} codes ${s.codes.padEnd(8)} rules ${String(s.rules).padStart(2)}  command words ${String(s.words).padStart(2)}`);
  console.log(`  ${s.units}`);
}
for (const w of warnings) console.log(`warning: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\nOK: ${summary.length} pack(s) valid, ${warnings.length} warning(s)`);
