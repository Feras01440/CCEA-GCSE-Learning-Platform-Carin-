/**
 * index-specs.mjs — turn the extracted specification texts into the two lookup indexes
 * that every crosswalk row is written from.
 *
 *   node pipeline/enrichment/index-specs.mjs
 *
 * Reads  docs/sources/cross-board/*.txt   (produced by fetch-specs.mjs)
 * Writes docs/sources/cross-board/aqa-<id>-headings.txt
 *        docs/sources/cross-board/edexcel-1sc0-statements.txt
 *        docs/sources/cross-board/aqa-8300-refs.txt
 *
 * These indexes hold specification TEXT and are covered by the same copyright rule as the
 * PDFs: read them, quote a reference code, never carry a sentence into a dossier.
 *
 * Why two different indexers:
 *   AQA addresses content by numbered heading (4.5.3.3), so the index is the heading list and
 *     the body text is found by reading the file at that heading.
 *   Edexcel addresses content by statement (CB7.4), so the index has to reconstruct statement
 *     boundaries from a two-column layout.
 *
 * THE EDEXCEL INDEXER'S ONE TRAP. The combined-science specification restates its topic list
 * near the end of the document ("Topics for Paper 6 ..."), so the walk has to stop before that
 * restatement or every topic is parsed twice. The stop line is found by searching for the
 * restatement rather than by a hard-coded line number: an earlier version used `i > 3845` and
 * silently dropped Topic 15 (Forces and matter, i.e. Hooke's law) because its heading sat at
 * line 3842 and its statements at 3847. If a science topic comes back with no Edexcel refs,
 * suspect this first and check the reported per-topic counts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "docs", "sources", "cross-board");
const read = (id) => fs.readFileSync(path.join(DIR, `${id}.txt`), "utf8").split(/\r?\n/);
const write = (name, text) => {
  fs.writeFileSync(path.join(DIR, name), text, "utf8");
  console.log(`  = ${name} (${(Buffer.byteLength(text) / 1024).toFixed(0)} KB)`);
};

/* ------------------------------------------------------------------ AQA headings */

const AQA_HEADING = /^\s*([456]\.\d+(?:\.\d+){0,3})\s+([A-Za-z(].*)$/;

function aqaHeadings(id) {
  const lines = read(id);
  const seen = new Set();
  const out = [];
  for (const ln of lines) {
    const m = AQA_HEADING.exec(ln);
    if (!m) continue;
    // Contents-page rows end in a bare page number; skip them, the body heading follows later.
    const title = m[2].replace(/Key opportunities for.*$/, "").replace(/\s+\d+\s*$/, "").replace(/\s+/g, " ").trim();
    if (!title) continue;
    const row = `${m[1]} ${title}`;
    if (seen.has(row)) continue;
    seen.add(row);
    out.push(row);
  }
  return out;
}

for (const id of ["aqa-8464-combined", "aqa-8461-biology", "aqa-8462-chemistry", "aqa-8463-physics"]) {
  if (!fs.existsSync(path.join(DIR, `${id}.txt`))) { console.log(`  - ${id}.txt missing, skipped`); continue; }
  const rows = aqaHeadings(id);
  write(`${id}-headings.txt`, rows.join("\n"));
  console.log(`      ${rows.length} headings`);
}

/* ---------------------------------------------------- Edexcel 1SC0 statement index */

function edexcelStatements() {
  const id = "edexcel-1sc0";
  if (!fs.existsSync(path.join(DIR, `${id}.txt`))) { console.log(`  - ${id}.txt missing, skipped`); return; }
  const lines = read(id);

  // Body starts at the first real "Topic 1 - Key concepts in biology" heading (the earlier
  // occurrences are inside the paper-structure summary) and ends where the document restates
  // the topic list for the papers. Both bounds are searched for, never hard-coded.
  const firstBody = lines.findIndex((l, i) => i > 400 && /^\s*Topic 1 - Key concepts in biology\s*$/.test(l));
  const restatement = lines.findIndex(
    (l, i) => i > firstBody + 100 && /Topic 1 - Key concepts in biology, Topic 2/.test(l),
  );
  const start = firstBody >= 0 ? firstBody : 0;
  const end = restatement > 0 ? restatement - 1 : lines.length;

  const out = [];
  let science = null;
  let topic = null;
  let num = null;
  let buf = [];

  const flush = () => {
    // NOT truncated to a couple of hundred characters. An earlier version sliced at 220 and a
    // lookup for "memory lymphocyte" returned NONE for Edexcel CB5.13, whose parts (c) and (d)
    // are exactly that - a false negative that would have produced a wrong "CCEA-only" row.
    // Long statements are why the index exists; keep them whole.
    if (num !== null) out.push(`${science}${topic}.${num} :: ${buf.join(" ").replace(/\s+/g, " ").trim()}`);
    num = null;
    buf = [];
  };

  for (let i = start; i <= end && i < lines.length; i += 1) {
    const ln = lines[i];
    if (/^\s*Topic 1 - Key concepts in chemistry\s*$/.test(ln)) { flush(); science = "CC"; }
    else if (/^\s*Topic 1 - Key concepts of physics\s*$/.test(ln)) { flush(); science = "CP"; }
    else if (science === null && /^\s*Topic 1 - Key concepts in biology\s*$/.test(ln)) science = "CB";

    const head = /^\s*Topic (\d+)\s*[-–]/.exec(ln);
    if (head) { flush(); topic = head[1]; continue; }

    const stmt = /^\s*(\d+)\.(\d+)\s+(\S.*)$/.exec(ln);
    if (stmt && topic && stmt[1] === topic) { flush(); num = stmt[2]; buf = [stmt[3]]; continue; }

    if (num !== null) {
      const s = ln.trim();
      if (!s) continue;
      if (/^(Pearson Edexcel|Issue \d|Students should)/.test(s)) continue;
      // Each topic ends with boilerplate ("Use of mathematics ...", "Specification points ... are
      // in the GCSE in Biology only") that would otherwise be glued onto the LAST statement of the
      // topic and produce false keyword hits - a search for "discontinuous" hit CB3.23 that way,
      // from the maths-skills list rather than from any variation content. Close the statement here.
      if (/^(Use of mathematics|Specification points? )/.test(s)) { flush(); continue; }
      buf.push(s);
    }
  }
  flush();

  write("edexcel-1sc0-statements.txt", out.join("\n"));
  const per = {};
  for (const o of out) { const k = o.split(".")[0]; per[k] = (per[k] ?? 0) + 1; }
  console.log(`      ${out.length} statements: ${Object.entries(per).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  // Canaries: the three topics an earlier bug dropped. Fail loudly rather than silently.
  for (const canary of ["CP15.3", "CP14.15", "CC7.7", "CB7.4"]) {
    if (!out.some((o) => o.startsWith(`${canary} `))) {
      console.error(`      !! expected statement ${canary} is missing — check the body bounds above`);
      process.exitCode = 1;
    }
  }
}
edexcelStatements();

/* ------------------------------------------------- AQA 8300 DfE reference codes */

function aqaMathsRefs() {
  const id = "aqa-8300";
  if (!fs.existsSync(path.join(DIR, `${id}.txt`))) { console.log(`  - ${id}.txt missing, skipped`); return; }
  const lines = read(id);
  const CODE = /^\s*([NARGPS]\d{1,2})\s*(Additional foundation|$|\s)/;
  const NOISE = /^(Visit aqa\.org\.uk|GCSE Mathematics \(8300\)|Additional foundation|content|Basic foundation content|Higher content only|Notes:)/;
  const out = [];
  let code = null;
  let buf = [];
  const flush = () => { if (code) out.push(`${code} :: ${buf.join(" ").replace(/\s+/g, " ").trim().slice(0, 320)}`); code = null; buf = []; };
  for (const ln of lines) {
    const m = CODE.exec(ln);
    if (m) { flush(); code = m[1]; continue; }
    if (!code) continue;
    const s = ln.trim();
    if (!s || NOISE.test(s)) continue;
    buf.push(s);
  }
  flush();
  const seen = new Set();
  const rows = out.filter((r) => { const c = r.split(" ")[0]; if (seen.has(c)) return false; seen.add(c); return true; });
  write("aqa-8300-refs.txt", rows.join("\n"));
  console.log(`      ${rows.length} reference codes`);
  // Edexcel 1MA1 restates the same codes verbatim, which is why one file serves both boards.
}
aqaMathsRefs();
