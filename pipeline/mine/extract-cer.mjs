#!/usr/bin/env node
/**
 * pipeline/mine/extract-cer.mjs
 *
 * Splits a CCEA Chief Examiner report (pdftotext output) into unit sections and
 * question blocks so that a human or an AI session can read ONE block at a time
 * while writing insight cards (packs/<subject>/insights/*.json) in our own words.
 *
 * Output: pipeline/mine/cer-blocks/<subject>/<series>-<unit>.json
 *   { subject, series, unit, tier, title, file, url, overview, blocks: [{ unit, question, source, text }] }
 * These blocks contain CCEA text and stay PRIVATE (pipeline/mine/cer-blocks/ is gitignored).
 *
 * Usage:
 *   node pipeline/mine/extract-cer.mjs                 # all subjects in the manifest
 *   node pipeline/mine/extract-cer.mjs --subject maths # one subject
 *   node pipeline/mine/extract-cer.mjs --file docs/sources/maths/CER-Summer2025.txt --subject maths --series 2025-summer --url <pdf url>
 *   node pipeline/mine/extract-cer.mjs --list          # print unit/question counts only
 *   node pipeline/mine/extract-cer.mjs --show maths 2025-summer M4 Q22   # print one block
 *
 * Programmatic use:
 *   import { splitReport, MANIFEST } from "./extract-cer.mjs";
 *   const { units } = splitReport(text, { subject: "maths" });
 *
 * ExaminerSource ids (master plan 3.9) are built as
 *   ccea-cer:<subject>:<series>:<unit>:Q<n>      e.g. ccea-cer:maths:2025-summer:M4:Q22
 * Unit codes used here:
 *   maths          M1 M2 M3 M4 M51 M52 M61 M62 M71 M72 M81 M82  (the November 2025 report writes
 *                  "Unit M5 ... Non-Calculator" - normalised to M51 etc.)
 *   further-maths  FM1 FM2 FM3 FM4
 *   science        B1F B1H B2F B2H C1F C1H C2F C2H P1F P1H P2F P2H, and Unit 7 as
 *                  U7A-Bio-F, U7B-Chem-H, U7B-Phys-F ... (booklet, discipline, tier)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
export const OUT_ROOT = path.join(__dirname, "cer-blocks");

const R = (p) => path.join(ROOT, p);
const MATHS_URL = (year, name) =>
  `https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/${year}/GCSE%20Mathematics%20%282017%29-${name}-Report_0.pdf`;
const FM_URL = (year, suffix) =>
  `https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Further%20Mathematics%20(2017)/${year}/GCSE%20Further%20Mathematics%20(2017)-Summer${year}-Report${suffix}.pdf`;
const SCI_URL = (year, name) =>
  `https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/${year}/GCSE%20Science%20Double%20Award%20%282017%29-${name}-Report_0.pdf`;

/** Every report held locally, with its public URL (docs/research 01 section 9, 02 key urls, 03 section 7). */
export const MANIFEST = {
  maths: [
    { series: "2025-summer", file: R("docs/sources/maths/CER-Summer2025.txt"), url: MATHS_URL(2025, "Summer2025") },
    { series: "2024-summer", file: R("docs/sources/maths/CER-Summer2024.txt"), url: MATHS_URL(2024, "Summer2024") },
    { series: "2023-summer", file: R("docs/sources/maths/CER-Summer2023.txt"), url: MATHS_URL(2023, "Summer2023") },
    { series: "2025-november", file: R("docs/sources/maths/CER-November2025.txt"), url: MATHS_URL(2025, "November2025") },
    { series: "2024-november", file: R("docs/sources/maths/CER-November2024.txt"), url: MATHS_URL(2024, "November2024") },
  ],
  "further-maths": [2018, 2019, 2022, 2023, 2024, 2025].map((y) => ({
    series: `${y}-summer`,
    file: R(`docs/sources/further-maths/GCSE-Further-Mathematics-Chief-Examiner-Report-Summer${y}.txt`),
    url: FM_URL(y, y <= 2019 ? "" : "_0"),
  })),
  science: [
    { series: "2023-summer", file: R("docs/sources/science/examiner-reports/DAS-Summer2023-Report.txt"), url: SCI_URL(2023, "Summer2023") },
    { series: "2024-summer", file: R("docs/sources/science/examiner-reports/DAS-Summer2024-Report.txt"), url: SCI_URL(2024, "Summer2024") },
    { series: "2025-summer", file: R("docs/sources/science/examiner-reports/DAS-Summer2025-Report.txt"), url: SCI_URL(2025, "Summer2025") },
    { series: "2026-march", file: R("docs/sources/science/examiner-reports/DAS-March2026-Report.txt"), url: SCI_URL(2026, "March2026") },
  ],
};

// ---------------------------------------------------------------- text clean-up

const FOOTER_RE = /^\s*CCEA GCSE (Mathematics|Further Mathematics|Double Award Science) \((Summer|November|March) Series\) \d{4}\s*$/;
const PAGE_NO_RE = /^\s*\d{1,3}\s*$/;

/**
 * pdftotext artefacts seen in the CCEA reports. U+FFFD (shown as �) is a glyph the PDF font
 * did not map: it stands for £, ×, a bullet or a minus sign depending on context, so it is
 * kept as-is for the reader to resolve. " # " is consistently the multiplication sign.
 * Fractions and powers are flattened (e.g. "4500 � 1.0352" is 4500 × 1.035²).
 */
export function cleanLine(line) {
  return line
    .replace(/ # /g, " × ")
    .replace(/[‘’`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+$/g, "");
}

function isNoise(line) {
  return FOOTER_RE.test(line) || PAGE_NO_RE.test(line) || /^\f?\s*$/.test(line);
}

// ---------------------------------------------------------------- heading detection

/** Maths: "Assessment Unit M4 Higher Tier" / "Assessment Unit M71 Higher Tier Non-Calculator" / (Nov 2025) "Assessment Unit M5 Foundation Tier Calculator" / (Summer 2025) "Assessment Unit 51 Foundation Tier Non-Calculator". */
const MATHS_UNIT_RE = /^\s*Assessment Unit\s+M?(\d)(\d)?\s+(Foundation|Higher) Tier\s*(Non-Calculator|Calculator)?\s*$/;
/** FM: "Assessment Unit 1        Pure Mathematics" (contents rows end with a page number and are skipped). */
const FM_UNIT_RE = /^\s*Assessment Unit\s+(\d)\s+(Pure Mathematics|Mechanics|Statistics|Discrete.*)$/;
/** Science: "Assessment Unit 1  Cells, Living Processes and" (title may wrap); "Assessment Unit 7 Practical Skills". */
const SCI_UNIT_RE = /^\s*Assessment Unit\s+(\d)\s+(.*)$/;
const TIER_RE = /^\s*(Foundation|Higher) Tier\s*$/;
const DISC_RE = /^\s*(Biology|Chemistry|Physics)\s*$/;
const BOOKLET_RE = /^\s*Booklet ([AB])\s*$/;
const Q_RE = /^Q(\d{1,2})\b\s*(.*)$/;
const CONTENTS_ROW_RE = /\s\d{1,3}\s*$/; // contents rows end with a page number

function mathsUnitCode(m) {
  const n = m[1];
  const explicit = m[2];
  const paper = m[4];
  if (explicit) return `M${n}${explicit}`;
  if (paper) return `M${n}${paper === "Non-Calculator" ? "1" : "2"}`;
  return `M${n}`;
}

function abbr(discipline) {
  return { Biology: "Bio", Chemistry: "Chem", Physics: "Phys" }[discipline] ?? discipline;
}
function abbr1(discipline) {
  return { Biology: "B", Chemistry: "C", Physics: "P" }[discipline ?? "Biology"];
}

/**
 * Split one report's text into units and question blocks.
 * @param {string} text  raw pdftotext output
 * @param {{subject: "maths"|"further-maths"|"science"}} opts
 * @returns {{units: Array<{unit:string,tier:string,title:string,overview:string,questions:Array<{question:string,text:string}>}>, unmapped: string[]}}
 */
export function splitReport(text, { subject }) {
  const lines = text.split(/\r?\n/).map(cleanLine);
  const units = [];
  const unmapped = [];
  let cur = null; // current unit
  let curQ = null; // current question block
  // science state machine
  const sci = { discipline: null, unitNo: null, tier: null, booklet: null, seenBody: false, pendingTitle: "" };

  const startUnit = (unit, tier, title) => {
    cur = { unit, tier, title, overview: "", questions: [] };
    curQ = null;
    units.push(cur);
  };
  const push = (line) => {
    if (curQ) curQ.text += (curQ.text ? "\n" : "") + line.trim();
    else if (cur) cur.overview += (cur.overview ? "\n" : "") + line.trim();
    else unmapped.push(line);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isNoise(line)) continue;
    // The back page ("Contact details ...") follows the last question of the last unit.
    if (/^\s*Contact details\s*$/.test(line) || /^\s*Contact details The following information/.test(line)) {
      cur = null; curQ = null;
      continue;
    }

    if (subject === "maths") {
      const m = line.match(MATHS_UNIT_RE);
      if (m) {
        startUnit(mathsUnitCode(m), m[3] === "Higher" ? "H" : "F", line.replace(/\s+/g, " ").trim());
        continue;
      }
    } else if (subject === "further-maths") {
      const m = line.match(FM_UNIT_RE);
      if (m && !CONTENTS_ROW_RE.test(line)) {
        startUnit(`FM${m[1]}`, "untiered", line.replace(/\s+/g, " ").trim());
        continue;
      }
    } else if (subject === "science") {
      const d = line.match(DISC_RE);
      if (d) {
        sci.discipline = d[1];
        sci.seenBody = true;
        // Unit 7 sub-heading (discipline under a booklet + tier): open a new unit
        if (sci.unitNo === 7 && sci.booklet && sci.tier) {
          startUnit(
            `U7${sci.booklet}-${abbr(sci.discipline)}-${sci.tier}`,
            sci.tier,
            `Unit 7 Booklet ${sci.booklet} ${sci.discipline} ${sci.tier === "H" ? "Higher" : "Foundation"} Tier`,
          );
        } else {
          cur = null; curQ = null; // discipline preamble (subject overview) is unmapped by design
        }
        continue;
      }
      const u = line.match(SCI_UNIT_RE);
      if (u && sci.seenBody && !CONTENTS_ROW_RE.test(line)) {
        sci.unitNo = Number(u[1]);
        sci.tier = null; sci.booklet = null;
        sci.pendingTitle = u[2].trim();
        cur = null; curQ = null;
        continue;
      }
      const t = line.match(TIER_RE);
      if (t && sci.unitNo) {
        sci.tier = t[1] === "Higher" ? "H" : "F";
        if (sci.unitNo !== 7) {
          startUnit(`${abbr1(sci.discipline)}${sci.unitNo}${sci.tier}`, sci.tier, `${sci.discipline} Unit ${sci.unitNo} ${t[1]} Tier - ${sci.pendingTitle}`);
        } else {
          cur = null; curQ = null;
        }
        continue;
      }
      const b = line.match(BOOKLET_RE);
      if (b && sci.unitNo === 7) {
        sci.booklet = b[1];
        // 2023 orders Booklet -> Tier -> discipline; 2024/25 order Tier -> Booklet -> discipline. A unit opens at the discipline line either way.
        cur = null; curQ = null;
        continue;
      }
      // Wrapped unit title line directly after "Assessment Unit n ..." (e.g. "                   Chemistry and Analysis")
      if (sci.pendingTitle && !sci.tier && !cur && /^\s{10,}\S/.test(line)) {
        sci.pendingTitle += " " + line.trim();
        continue;
      }
    }

    const q = line.match(Q_RE);
    if (q && cur) {
      curQ = { question: `Q${q[1]}`, text: q[2] ? q[2].trim() : "" };
      cur.questions.push(curQ);
      continue;
    }
    push(line);
  }
  // Unit 7 Booklet A is one practical task per discipline, reported as prose ("In Question 1(a) ...", "Part (b) ...")
  // with no Q-headings, so the loop leaves its text in `overview` and no blocks. Cite it as Q1: that is the only
  // question the booklet has. Left alone when the prose names a second question, so a format change is noticed.
  for (const u of units) {
    if (u.unit.startsWith("U7A-") && u.questions.length === 0 && u.overview.trim() && !/Questions*[2-9]/.test(u.overview)) {
      u.questions.push({ question: "Q1", text: u.overview });
    }
  }
  return { units, unmapped };
}

// ---------------------------------------------------------------- writing blocks

export function blockFileName(series, unit) {
  return `${series}-${unit}.json`;
}

export function writeBlocks(subject, entry, parsed) {
  const outDir = path.join(OUT_ROOT, subject);
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const u of parsed.units) {
    const file = path.join(outDir, blockFileName(entry.series, u.unit));
    const doc = {
      subject,
      series: entry.series,
      unit: u.unit,
      tier: u.tier,
      title: u.title,
      file: path.relative(ROOT, entry.file).replace(/\\/g, "/"),
      url: entry.url,
      sourceIdPrefix: `ccea-cer:${subject}:${entry.series}:${u.unit}:`,
      overview: u.overview,
      blocks: u.questions.map((q) => ({
        unit: u.unit,
        question: q.question,
        source: `ccea-cer:${subject}:${entry.series}:${u.unit}:${q.question}`,
        text: q.text,
      })),
    };
    fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n", "utf8");
    written.push({ file: path.relative(ROOT, file).replace(/\\/g, "/"), unit: u.unit, questions: u.questions.length });
  }
  return written;
}

export function runEntry(subject, entry, { list = false } = {}) {
  if (!fs.existsSync(entry.file)) {
    console.warn(`  ! missing ${path.relative(ROOT, entry.file)}`);
    return [];
  }
  const text = fs.readFileSync(entry.file, "utf8");
  const parsed = splitReport(text, { subject });
  if (list) return parsed.units.map((u) => ({ unit: u.unit, questions: u.questions.length }));
  return writeBlocks(subject, entry, parsed);
}

/** Read one block back (for a reviewer): returns { source, url, overview, text } or null. */
export function readBlock(subject, series, unit, question) {
  const file = path.join(OUT_ROOT, subject, blockFileName(series, unit));
  if (!fs.existsSync(file)) return null;
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  const b = doc.blocks.find((x) => x.question === question);
  return b ? { source: b.source, url: doc.url, unitTitle: doc.title, text: b.text } : null;
}

// ---------------------------------------------------------------- CLI

function parseArgs(argv) {
  const args = { subject: "all", list: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--subject") args.subject = argv[++i];
    else if (a === "--file") args.file = argv[++i];
    else if (a === "--series") args.series = argv[++i];
    else if (a === "--url") args.url = argv[++i];
    else if (a === "--list") args.list = true;
    else if (a === "--show") args.show = argv.slice(i + 1, i + 5);
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0]);
    process.exit(0);
  }
  if (args.show) {
    const [subject, series, unit, question] = args.show;
    const b = readBlock(subject, series, unit, question);
    if (!b) { console.error("block not found"); process.exit(1); }
    console.log(`${b.source}\n${b.url}\n[${b.unitTitle}]\n\n${b.text}`);
    process.exit(0);
  }
  const subjects = args.subject === "all" ? Object.keys(MANIFEST) : [args.subject];
  let total = 0;
  for (const subject of subjects) {
    const entries = args.file
      ? [{ series: args.series ?? "unknown-series", file: path.resolve(args.file), url: args.url ?? "" }]
      : MANIFEST[subject];
    if (!entries) {
      console.error(`Unknown subject "${subject}". Known: ${Object.keys(MANIFEST).join(", ")}`);
      process.exit(1);
    }
    console.log(`\n${subject}`);
    for (const entry of entries) {
      const res = runEntry(subject, entry, { list: args.list });
      const summary = res.map((r) => `${r.unit}:${r.questions}`).join(" ");
      total += res.reduce((n, r) => n + r.questions, 0);
      console.log(`  ${entry.series.padEnd(14)} ${summary}`);
    }
  }
  console.log(`\n${total} question blocks${args.list ? " (list only)" : ` written under ${path.relative(ROOT, OUT_ROOT)}`}`);
}
