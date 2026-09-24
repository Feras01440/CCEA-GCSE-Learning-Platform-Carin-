/**
 * Copy-shingle check: what our content shares word-for-word with the private CCEA corpus.
 *
 * The rule the briefs state, implemented here mechanically. Every 8-word sequence of our
 * learner-facing text is looked up in the corpus, and each sequence we share is one of three
 * things:
 *
 *   stock             it recurs in at least three different CCEA question papers AND it is
 *                     command material: it carries a command word or an exam-instruction phrase,
 *                     or it matches a line of a formula sheet. That is the board's standard
 *                     instruction language ("using calculus find the coordinates of the turning
 *                     point"). Allowed, and reported with the number of papers.
 *   stimulus-copy     it recurs in three or more papers but is not command material — recurring
 *                     context prose, which CCEA reuses across papers. A BREACH: the exemption is
 *                     for instruction language, not for the board's stimulus writing.
 *   paper-copy        it appears in one or two question papers only. That is a copy of one
 *                     question's own wording: a BREACH, to be reworded.
 *   scheme-or-report  it appears in any mark scheme or Chief Examiner report. Never allowed,
 *                     whatever else it does: those are the board's confidential solutions and
 *                     commentary. A BREACH.
 *
 * The corpus is private and gitignored. Nothing from it is ever printed except the shared
 * sequence itself — which is our own text as well — and the file path it was found in.
 *
 *   node scripts/qa/shingles.mjs                    every bundle and note under packs/<subject>/content
 *   node scripts/qa/shingles.mjs --unit fm1         one unit (repeatable)
 *   node scripts/qa/shingles.mjs --topic optimisation   one topic (repeatable)
 *   node scripts/qa/shingles.mjs --json             the findings as JSON, for an author's generator
 *   node scripts/qa/shingles.mjs --n 10             a different sequence length (default 8)
 *
 * Exit 1 on any breach, 0 with counts otherwise.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PACKS = path.join(ROOT, "packs");
const PAPERS = path.join(ROOT, "docs", "sources", "papers");
const SOURCES = path.join(ROOT, "docs", "sources");

const argv = process.argv.slice(2);
const flag = (name) => argv.filter((a, i) => argv[i - 1] === name);
const units = flag("--unit").map((s) => s.toLowerCase());
const topics = flag("--topic").map((s) => s.toLowerCase());
const asJson = argv.includes("--json");
const N = Number(flag("--n")[0] ?? 8);
/** A sequence has to recur in this many different question papers to count as stock language. */
const STOCK_PAPERS = 3;

// ── our text ─────────────────────────────────────────────────────────────────────────────────

/** Keys whose strings are ids, markup or machine notes rather than prose a learner reads. */
const NOT_PROSE = new Set([
  "svg", "src", "regex", "id", "url", "videoId", "misconception", "verification", "itemId", "source",
  "solutionProgram", "kind", "type", "status", "tool", "at", "by", "licence", "licenceUrl", "sourceUrl",
  "attribution", "credit", "$schema", "slug", "subject", "unit", "tier", "code", "promptId",
  "generatedAt", "version", "updated", "rubricId", "registryId", "paperId", "textHash",
]);

/** Words only: LaTeX commands, punctuation and symbols drop out, so spacing never hides a copy. */
const words = (s) =>
  s
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

function collectStrings(node, out, key) {
  if (typeof node === "string") {
    if (!NOT_PROSE.has(key)) out.push(node);
    return;
  }
  if (Array.isArray(node)) return node.forEach((v) => collectStrings(v, out, key));
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) collectStrings(v, out, k);
}

function contentFiles() {
  const out = [];
  if (!fs.existsSync(PACKS)) return out;
  for (const subject of fs.readdirSync(PACKS)) {
    const content = path.join(PACKS, subject, "content");
    if (!fs.existsSync(content)) continue;
    for (const unit of fs.readdirSync(content)) {
      if (units.length && !units.includes(unit.toLowerCase())) continue;
      const unitDir = path.join(content, unit);
      if (!fs.statSync(unitDir).isDirectory()) continue;
      for (const slug of fs.readdirSync(unitDir)) {
        if (topics.length && !topics.includes(slug.toLowerCase())) continue;
        for (const name of ["bundle.json", "note.blocks.json"]) {
          const file = path.join(unitDir, slug, name);
          if (fs.existsSync(file)) out.push({ file, subject, unit, slug });
        }
      }
    }
  }
  return out;
}

const ours = new Map(); // sequence -> { where, subject, unit, slug, sentence, at }
const files = contentFiles();
for (const { file, subject, unit, slug } of files) {
  const strings = [];
  try {
    collectStrings(JSON.parse(fs.readFileSync(file, "utf8")), strings, "");
  } catch {
    continue; // a malformed bundle is build-content's finding, not this one's
  }
  const where = path.relative(ROOT, file).split(path.sep).join("/");
  for (const s of strings) {
    const w = words(s);
    for (let i = 0; i + N <= w.length; i++) {
      const seq = w.slice(i, i + N).join(" ");
      // `sentence` is kept so the stock test can read the run in the wording it came from: a
      // sliding window often falls just past the command word that makes its sentence an
      // instruction ("the coordinates of the points where the curve" sits inside "Find …").
      if (!ours.has(seq)) ours.set(seq, { where, subject, unit, slug, sentence: w, at: i });
    }
  }
}

// ── what counts as command material ──────────────────────────────────────────────────────────

/**
 * The stock exemption is for instruction language only. A run qualifies when it carries a command
 * word or an exam-instruction phrase, or when it is part of a formula-sheet line. Everything else
 * that recurs — the board's reused stimulus prose — is a copy however often it is reused.
 */
const STANDING_PHRASES = [
  "give your answer", "give your answers", "correct to", "decimal place", "decimal places",
  "significant figure", "significant figures", "you must show", "in this question you will be assessed",
  "quality of your written communication", "use the formula", "the diagram shows", "the table shows",
  "not drawn to scale", "you may use", "write down", "show that", "hence", "or otherwise",
  // instructions the corpus run showed recurring, which are command material rather than prose
  "in order of size", "starting with the smallest", "starting with the largest",
  "mark on the diagram", "on the diagram above", "all the forces acting",
];

/**
 * Bare interrogatives are ordinary English, not instruction language: "a condition in which the
 * blood glucose control mechanism fails" must not qualify because it contains "which". They are
 * skipped wherever they appear as a whole term — science lists "Which" as an alias of Identify,
 * and the packs' own question-stem entries carry the rest — but a phrase that merely starts with
 * one ("how many decimal places") is kept.
 */
const BARE_INTERROGATIVES = new Set(["which", "what", "how", "why", "is", "does", "do", "when", "where", "who"]);

function commandVocabulary() {
  const phrases = new Set(STANDING_PHRASES.map((p) => words(p).join(" ")).filter(Boolean));
  const formulaLines = [];
  for (const subject of fs.existsSync(PACKS) ? fs.readdirSync(PACKS) : []) {
    const cw = path.join(PACKS, subject, "exam-true", "command-words.json");
    if (fs.existsSync(cw)) {
      try {
        for (const w of JSON.parse(fs.readFileSync(cw, "utf8")).words ?? []) {
          // A bare question stem ("What", "Which", "How many") is too weak to make a run
          // instruction language: "a condition in which the blood glucose" would qualify.
          if (w.kind === "question-stem") continue;
          for (const term of [w.word, ...(w.aliases ?? [])]) {
            const n = words(String(term)).join(" ");
            if (n && !BARE_INTERROGATIVES.has(n)) phrases.add(n);
          }
        }
      } catch {
        /* a malformed pack file is validate-packs' finding */
      }
    }
    const fsheet = path.join(PACKS, subject, "exam-true", "formula-sheets.json");
    if (fs.existsSync(fsheet)) {
      try {
        for (const sheet of Object.values(JSON.parse(fs.readFileSync(fsheet, "utf8")).sheets ?? {})) {
          for (const item of [...(sheet.items ?? []), ...(sheet.mustKnow ?? [])]) {
            const n = words(`${item.name ?? ""} ${item.latex ?? ""} ${item.condition ?? ""}`).join(" ");
            if (n) formulaLines.push(n);
          }
        }
      } catch {
        /* as above */
      }
    }
  }
  return { phrases: [...phrases], formulaLines };
}

const VOCAB = commandVocabulary().phrases.map((p) => p.split(" "));
const FORMULA_LINES = commandVocabulary().formulaLines;

/**
 * Standard statements of named theorems, laws and definitions (scripts/qa/shingles.allow.json).
 * A run inside one of these is common mathematical or scientific language, not the board's
 * stimulus writing — a circle theorem has one accepted English form — so it is reported as
 * "allowed" with its reason rather than as a breach. The file documents what may go in it.
 */
const ALLOW = (() => {
  const file = path.join(ROOT, "scripts", "qa", "shingles.allow.json");
  if (!fs.existsSync(file)) return [];
  try {
    return Object.entries(JSON.parse(fs.readFileSync(file, "utf8")))
      .filter(([k]) => !k.startsWith("$"))
      .map(([statement, reason]) => ({ statement, reason, normalised: words(statement).join(" ") }));
  } catch {
    return [];
  }
})();

/** The allow-list entry a run sits inside, or null. */
const allowedBy = (seq) => ALLOW.find((a) => a.normalised.includes(seq)) ?? null;

/**
 * Is this run part of an instruction?
 *
 * It qualifies when the run itself carries a command word or an instruction phrase, and also when
 * it OVERLAPS one in its own sentence — a twelve-word instruction is longer than the window, so
 * "you will be assessed on the quality of" is part of "in this question you will be assessed …"
 * even though no single phrase fits inside it. Overlap means sharing at least one word position:
 * a command word that merely stands nearby never excuses prose, which is why the reused stimulus
 * sentences ("diabetes is a condition in which the blood glucose control mechanism fails") stay
 * breaches however often the board reuses them.
 *
 * It also qualifies when the run sits inside a line of a formula sheet.
 */
function isCommandMaterial(entry, seq) {
  const s = entry.sentence;
  const lo = entry.at;
  const hi = entry.at + N; // the run occupies [lo, hi)
  for (const phrase of VOCAB) {
    const first = phrase[0];
    for (let i = 0; i + phrase.length <= s.length; i++) {
      if (s[i] !== first) continue;
      let ok = true;
      for (let k = 1; k < phrase.length; k++)
        if (s[i + k] !== phrase[k]) {
          ok = false;
          break;
        }
      // [i, i + phrase.length) must meet [lo, hi)
      if (ok && i < hi && i + phrase.length > lo) return true;
    }
  }
  for (const line of FORMULA_LINES) if (line.includes(seq)) return true;
  return false;
}

// ── the corpus ───────────────────────────────────────────────────────────────────────────────

/** A mark scheme is named "…-MS-…" or "…-MS.txt"; everything else under papers/ is a question paper. */
const isScheme = (name) => /(^|[-_])MS([-_.]|$)/i.test(name);

function corpusFiles() {
  const out = [];
  const walk = (dir, kindOf) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p, kindOf);
      else if (entry.name.toLowerCase().endsWith(".txt")) {
        const kind = kindOf(entry.name);
        if (kind) out.push({ file: p, kind });
      }
    }
  };
  walk(PAPERS, (name) => (isScheme(name) ? "scheme" : "paper"));
  // Chief Examiner reports sit beside the specifications, not under papers/
  for (const entry of fs.existsSync(SOURCES) ? fs.readdirSync(SOURCES, { withFileTypes: true }) : []) {
    if (!entry.isDirectory() || entry.name === "papers") continue;
    walk(path.join(SOURCES, entry.name), (name) => (/report/i.test(name) ? "report" : null));
  }
  return out;
}

const corpus = corpusFiles();
if (corpus.length === 0) {
  const msg = "no corpus found under docs/sources/papers — the private paper corpus is gitignored, so this check cannot run here";
  console.log(asJson ? JSON.stringify({ skipped: msg }, null, 2) : msg);
  process.exit(0);
}

const hits = new Map(); // sequence -> { papers:Set, schemes:Set, reports:Set }
let corpusSequences = 0;
for (const { file, kind } of corpus) {
  let text;
  try {
    text = fs.readFileSync(file, "latin1");
  } catch {
    continue;
  }
  const w = words(text);
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  for (let i = 0; i + N <= w.length; i++) {
    corpusSequences++;
    const seq = w.slice(i, i + N).join(" ");
    if (!ours.has(seq)) continue;
    let h = hits.get(seq);
    if (!h) hits.set(seq, (h = { papers: new Set(), schemes: new Set(), reports: new Set() }));
    if (kind === "paper") h.papers.add(rel);
    else if (kind === "scheme") h.schemes.add(rel);
    else h.reports.add(rel);
  }
}

// ── classify ─────────────────────────────────────────────────────────────────────────────────

const breaches = [];
const stock = [];
const allowed = [];
for (const [seq, h] of hits) {
  const at = ours.get(seq);
  const allow = allowedBy(seq);
  if (allow && h.schemes.size === 0 && h.reports.size === 0) {
    // a named theorem, law or definition in its standard form: common language, not the board's
    allowed.push({ sequence: seq, where: at.where, subject: at.subject, unit: at.unit, slug: at.slug, papers: h.papers.size, statement: allow.statement, reason: allow.reason });
  } else if (h.schemes.size > 0 || h.reports.size > 0) {
    breaches.push({
      kind: "scheme-or-report",
      sequence: seq,
      where: at.where, subject: at.subject, unit: at.unit, slug: at.slug,
      sources: [...h.schemes, ...h.reports].slice(0, 3),
      papers: h.papers.size,
    });
  } else if (h.papers.size >= STOCK_PAPERS) {
    if (isCommandMaterial(at, seq)) stock.push({ sequence: seq, where: at.where, subject: at.subject, unit: at.unit, slug: at.slug, papers: h.papers.size });
    else breaches.push({ kind: "stimulus-copy", sequence: seq, where: at.where, subject: at.subject, unit: at.unit, slug: at.slug, sources: [...h.papers].slice(0, 3), papers: h.papers.size });
  } else {
    breaches.push({ kind: "paper-copy", sequence: seq, where: at.where, subject: at.subject, unit: at.unit, slug: at.slug, sources: [...h.papers], papers: h.papers.size });
  }
}

const byUnit = {};
for (const b of breaches) {
  const key = `${b.subject}/${b.unit}`;
  byUnit[key] = (byUnit[key] ?? 0) + 1;
}

// ── report ───────────────────────────────────────────────────────────────────────────────────

const counts = {
  sequenceLength: N,
  ourFiles: files.length,
  ourSequences: ours.size,
  corpusFiles: corpus.length,
  papers: corpus.filter((c) => c.kind === "paper").length,
  schemes: corpus.filter((c) => c.kind === "scheme").length,
  reports: corpus.filter((c) => c.kind === "report").length,
  corpusSequences,
  shared: hits.size,
  stock: stock.length,
  allowed: allowed.length,
  breaches: breaches.length,
};

if (asJson) {
  console.log(JSON.stringify({ counts, byUnit, breaches, stock: stock.sort((a, b) => b.papers - a.papers), allowed }, null, 2));
} else {
  console.log(
    `shingles: ${counts.ourSequences.toLocaleString()} distinct ${N}-word sequences in ${counts.ourFiles} content files, against ` +
      `${counts.corpusSequences.toLocaleString()} from ${counts.corpusFiles} corpus files (${counts.papers} papers, ${counts.schemes} mark schemes, ${counts.reports} reports)`,
  );
  const order = { "scheme-or-report": 0, "stimulus-copy": 1, "paper-copy": 2 };
  for (const b of breaches.sort((x, y) => order[x.kind] - order[y.kind] || x.where.localeCompare(y.where))) {
    const tail =
      b.kind === "scheme-or-report"
        ? `shared with a mark scheme or examiner report: ${b.sources.join(", ")}`
        : b.kind === "stimulus-copy"
          ? `reused context prose: in ${b.papers} papers, but it carries no command word, instruction phrase or formula-sheet line: ${b.sources.join(", ")}`
          : `in ${b.papers} paper${b.papers === 1 ? "" : "s"} only (stock language needs ${STOCK_PAPERS}): ${b.sources.join(", ")}`;
    console.log(`\nBREACH ${b.kind}  ${b.where}\n  "${b.sequence}"\n  ${tail}`);
  }
  if (stock.length > 0) {
    console.log(`\nallowed as stock instruction language — each recurs in at least ${STOCK_PAPERS} different question papers:`);
    for (const s of stock.sort((a, b) => b.papers - a.papers)) console.log(`  ${String(s.papers).padStart(3)} papers  "${s.sequence}"`);
  }
  if (allowed.length > 0) {
    console.log(`\nallowed as a standard statement of a named theorem, law or definition (scripts/qa/shingles.allow.json):`);
    const byStatement = new Map();
    for (const a of allowed) {
      const e = byStatement.get(a.statement) ?? { runs: 0, reason: a.reason, where: new Set() };
      e.runs += 1;
      e.where.add(`${a.unit}/${a.slug}`);
      byStatement.set(a.statement, e);
    }
    for (const [statement, e] of byStatement)
      console.log(`  ${e.runs} run${e.runs === 1 ? "" : "s"}  "${statement}"\n      ${[...e.where].join(", ")} — ${e.reason}`);
  }
  if (breaches.length === 0) {
    console.log(`\n${counts.shared} shared sequence(s): ${counts.stock} stock instruction language, ${counts.allowed} a standard statement. No breach.`);
  } else {
    console.log(`\n${counts.breaches} breach(es) across ${Object.keys(byUnit).length} unit(s):`);
    for (const [unit, n] of Object.entries(byUnit).sort((a, b) => b[1] - a[1])) console.log(`  ${unit}  ${n}`);
  }
}

process.exitCode = breaches.length > 0 ? 1 : 0;
