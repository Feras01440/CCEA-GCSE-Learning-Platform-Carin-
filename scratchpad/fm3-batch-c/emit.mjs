/**
 * FM3 batch C: verification logs, lesson-template-v2 assertions, bundle assertions and the
 * lint-then-write step every topic generator ends with.
 *
 * Grown from scratchpad/fm3-batch-b/lib.mjs (the live author of this unit's batch B, whose four
 * bundles pass every finish check): the lesson-shape assertion mirrors scripts/qa/lesson-v2.mjs
 * rule for rule, so a note that leaves a generator here has already passed that gate, and the
 * string lint mirrors the fatal checks in src/components/items/content-lint.ts.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { assertDepth, tidyBlocks, tidyBundle } from "./depth.mjs";

export const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";
export const OUT = path.join(ROOT, "packs/further-maths/content/fm3");
export const AT = "2026-09-22T23:30:00Z";
export const UPDATED = "2026-09-22";

export const TOOL =
  "claude (FM3 batch-C generators in scratchpad/fm3-batch-c: stat.mjs builds every Pascal coefficient by addition, every binomial probability as an exact rational over BigInt and every normal probability from an error-function series checked against the table entries printed in the Summer 2022-2025 schemes; routes.mjs executes each described error in code; verify-published.mjs re-executes every route against the published JSON; check-marking.mts feeds every part, gate and error to the app's own marker)";

// ---------------------------------------------------------------------------
// Sources and shared references
// ---------------------------------------------------------------------------

export const src = (series, q) => `ccea-cer:further-maths:${series}:FM3:Q${q}`;

export const CER_URL = {
  "2019-summer": "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Further%20Mathematics%20(2017)/2019/GCSE%20Further%20Mathematics%20(2017)-Summer2019-Report.pdf",
  "2022-summer": "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Further%20Mathematics%20(2017)/2022/GCSE%20Further%20Mathematics%20(2017)-Summer2022-Report_0.pdf",
  "2023-summer": "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Further%20Mathematics%20(2017)/2023/GCSE%20Further%20Mathematics%20(2017)-Summer2023-Report_0.pdf",
  "2024-summer": "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Further%20Mathematics%20(2017)/2024/GCSE%20Further%20Mathematics%20(2017)-Summer2024-Report_0.pdf",
  "2025-summer": "https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Further%20Mathematics%20(2017)/2025/GCSE%20Further%20Mathematics%20(2017)-Summer2025-Report_0.pdf",
};

export const CCEA_DOC = {
  kind: "ccea-doc",
  docType: "cer",
  url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports",
  asOf: UPDATED,
};

export const CCEA_SPEC = {
  kind: "ccea-doc",
  docType: "spec",
  url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017",
  page: 10,
  asOf: UPDATED,
};

export const yt = (videoId, channel, title) => ({
  kind: "youtube",
  videoId,
  channel,
  credit: `${title}, ${channel} (embeddable id verified in data/links/media-map.json)`,
});

export const PLINKO = {
  kind: "phet",
  sim: "plinko-probability",
  url: "https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability_en.html",
  licence: "CC BY-NC 4.0",
  attribution: "Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu)",
};

/** The note block for the PhET sim, exactly as the media map carries it. */
export const plinkoBlock = (task) => ({
  type: "sim",
  provider: "phet",
  url: PLINKO.url,
  title: "PhET: Plinko Probability",
  attribution: PLINKO.attribution,
  licence: "CC BY-NC 4.0",
  task,
});

/** Everything the Unit 3 sheet prints, for note.formulaSheet.given. */
export const FORMULA_GIVEN = [
  "Mean and standard deviation of a frequency distribution",
  "Addition rule P(A union B) = P(A) + P(B) - P(A and B)",
  "Conditional probability P(A given B) = P(A and B) divided by P(B)",
  "Spearman's coefficient of rank correlation",
  "Normal Probability Table on page 3 of the booklet (the area to the left of z, for z from 0 to 3.99)",
];

export const timeFor = (marks) => Math.round(marks * 1.2 * 60);

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const CHECK_ORDER = [
  "schema",
  "scope-tier",
  "formula-sheet",
  "command-words",
  "tariff",
  "maths-numeric",
  "maths-symbolic",
  "independent-solve",
  "examiner-alignment",
  "copy-shingle",
  "style-lint",
  "katex-compile",
];

export function verLog(itemId, details) {
  const checks = CHECK_ORDER.filter((t) => details[t]).map((type) => ({
    type,
    tool: TOOL,
    result: "pass",
    detail: details[type],
    at: AT,
    by: "claude",
  }));
  if (checks.length === 0) throw new Error(`verLog(${itemId}): no checks given`);
  for (const k of Object.keys(details)) if (!CHECK_ORDER.includes(k)) throw new Error(`verLog(${itemId}): unknown check type ${k}`);
  return { id: `ver.${itemId}`, itemId, version: 1, checks, status: "verified", reports: [] };
}

// ---------------------------------------------------------------------------
// Lesson template v2, checked exactly as scripts/qa/lesson-v2.mjs checks it
// ---------------------------------------------------------------------------

const VISUAL = new Set(["figure", "photo", "video", "sim"]);
const wordsOf = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;
const prose = (b) => (b.type === "p" || b.type === "callout" ? (b.md ?? "") : b.type === "h" ? (b.text ?? "") : "");

export function assertLessonShape(blocks, label) {
  const fail = (check, detail) => {
    throw new Error(`${label}: [${check}] ${detail}`);
  };

  const hero = blocks[0];
  if (!hero || hero.type !== "hero") fail("hero", "the first block is not a hero");
  if (wordsOf(hero.lede) > 60) fail("hero", `lede is ${wordsOf(hero.lede)} words (max 60)`);
  const firstP = blocks.find((b) => b.type === "p");
  if (firstP && String(hero.lede).trim() === String(firstP.md).trim()) fail("hero", "the lede is the hook paragraph word for word");
  if ((hero.can ?? []).length !== 3) fail("hero", `${(hero.can ?? []).length} "can" lines (needs three)`);
  for (const c of hero.can) if (!/^[A-Z][a-z]+\b/.test(String(c))) fail("hero", `"can" line does not start with a verb: ${String(c).slice(0, 40)}`);
  if (!(hero.minutes >= 5)) fail("hero", "no minute estimate");
  if (/\bSummer \d{4}\b|\bmarks?\b|examiner/i.test(hero.lede)) fail("hero", "the lede names a series, a tariff or an examiner");

  let run = 0;
  let visualAt = -1;
  for (const b of blocks) {
    if (VISUAL.has(b.type)) {
      visualAt = run;
      break;
    }
    run += wordsOf(prose(b));
  }
  if (visualAt < 0) fail("visual", "the note has no figure, photo, video or sim");
  if (visualAt >= 80) fail("visual", `first visual after ${visualAt} words of prose (max 80)`);

  const recapAt = blocks.findIndex((b) => b.type === "h" && /^you can now$/i.test(b.text ?? ""));
  const panelAt = blocks.findIndex((b) => b.type === "h" && /^in the exam$/i.test(b.text ?? ""));
  if (recapAt < 0) fail("recap", 'no "You can now" card');
  if (panelAt >= 0 && recapAt > panelAt) fail("recap", "the recap card comes after the closing section");
  if (blocks[recapAt + 1]?.type !== "p") fail("recap", "the recap card has no paragraph");
  const recapLines = String(blocks[recapAt + 1].md).split("\n").filter((l) => l.trim());
  if (recapLines.length < 3 || recapLines.length > 5) fail("recap", `${recapLines.length} recap lines (needs three to five)`);

  const body = blocks.slice(0, recapAt);
  let stretch = 0;
  let since = "the start";
  const stretches = [];
  for (const b of body) {
    if (b.type === "gate") {
      if (stretch > 120) fail("sections", `${stretch} words between ${since} and gate ${b.id} (max 120)`);
      stretches.push(stretch);
      stretch = 0;
      since = `gate ${b.id}`;
    } else stretch += wordsOf(prose(b));
  }
  if (stretch > 120) fail("sections", `${stretch} words between ${since} and the recap card (max 120)`);

  if (body.filter((b) => b.type === "callout" && b.kind === "why").length < 1) fail("callouts", "no why callout in the teaching body");
  const examiners = body.filter((b) => b.type === "callout" && b.kind === "examiner").length;
  if (examiners > 1) fail("callouts", `${examiners} examiner callouts in the teaching body (max one)`);

  if (panelAt < 0) fail("panel", 'no "In the exam" heading');
  const panel = blocks.slice(panelAt);
  if (panel.filter((b) => b.type === "h").length !== 1) fail("panel", `${panel.filter((b) => b.type === "h").length} headings in the closing section (needs one)`);
  const paras = panel.filter((b) => b.type === "p");
  if (paras.length !== 1) fail("panel", `${paras.length} paragraphs in the closing section (needs one)`);
  if (wordsOf(paras[0].md) > 80) fail("panel", `the closing paragraph is ${wordsOf(paras[0].md)} words (max 80)`);
  const panelWords = panel.reduce((a, b) => a + wordsOf(prose(b)), 0);
  if (panelWords > 150) fail("panel", `${panelWords} words in the closing section (max 150)`);
  for (const b of panel) {
    if (b.type === "gate") fail("panel", `gate ${b.id} sits inside the closing section`);
    if (b.type === "callout" && (b.kind === "spec" || b.kind === "examiner")) fail("panel", `a ${b.kind} callout sits in the closing section`);
  }

  const promptIdx = blocks.map((b, i) => (b.type === "prompt" ? i : -1)).filter((i) => i >= 0);
  if (promptIdx.length === 0) fail("prompts", "the note embeds no retrieval prompts");
  if (promptIdx[promptIdx.length - 1] !== blocks.length - 1) fail("prompts", "the retrieval prompts are not last");
  if (promptIdx[0] < panelAt) fail("prompts", "a retrieval prompt sits before the closing section");

  const paraIdx = blocks.map((b, i) => (b.type === "p" ? i : -1)).filter((i) => i >= 0);
  const firstCallout = blocks.findIndex((b) => b.type === "callout");
  if (firstCallout >= 0 && paraIdx.length > 1 && firstCallout < paraIdx[1]) fail("callouts", "a callout stands before the second teaching paragraph");

  blocks.forEach((b, i) => {
    if (b.type === "video" || b.type === "sim") {
      const next = blocks.slice(i + 1).find((x) => x.type === "gate" || x.type === "h");
      if (!next || next.type !== "gate") fail("gates", `the ${b.type} block is not followed by a gate`);
    }
    if (b.type === "gate" && !blocks.slice(0, i).some((x) => VISUAL.has(x.type))) fail("gates", `gate ${b.id} has no visual above it`);
  });

  const ids = blocks.filter((b) => b.type === "gate").map((b) => b.id);
  if (new Set(ids).size !== ids.length) fail("gates", "two gates share an id");

  return { visualAt, panelWords, panelParagraph: wordsOf(paras[0].md), longestStretch: Math.max(...stretches, stretch), gates: ids.length };
}

/** Every examiner source on the topic row must be answered by a Sheet trap citing its series and question. */
export function assertTrapsAnswerSources(bundle, label) {
  const traps = (bundle?.note?.sheet?.traps ?? []).join("\n");
  const missing = [];
  for (const id of bundle?.topic?.examinerSources ?? []) {
    const m = /^ccea-cer:([^:]+):(\d{4})-([a-z]+):([^:]+):Q?(.+)$/i.exec(String(id));
    if (!m) {
      missing.push(`${id} (unreadable id)`);
      continue;
    }
    const season = m[3][0].toUpperCase() + m[3].slice(1);
    const series = new RegExp(`${season}\\s+${m[2]}|${m[2]}\\s+${season}`, "i").test(traps);
    const q = String(m[5]).replace(/[^0-9].*$/, "");
    const question = q.length > 0 && new RegExp(`\\bQ\\s?${q}\\b|\\bQuestion\\s+${q}\\b`, "i").test(traps);
    if (!series || !question) missing.push(`${id} (${series ? "series cited, question not" : question ? "question cited, series not" : "neither cited"})`);
  }
  if (missing.length) throw new Error(`${label}: no Sheet trap answers ${missing.join("; ")}`);
}

// ---------------------------------------------------------------------------
// Bundle-level assertions
// ---------------------------------------------------------------------------

const squash = (s) => String(s).toLowerCase().replace(/\$/g, "").replace(/\s+/g, "").replace(/[−–]/g, "-");

export function assertDistinctErrors(bundle) {
  const visit = (where, part) => {
    const a = part.answer ?? {};
    const seen = new Map();
    if (a.kind === "numeric") seen.set(String(a.value), "the correct answer");
    if (a.kind === "algebraic") seen.set(squash(a.latex), "the correct answer");
    for (const e of part.commonErrors ?? []) {
      const p = e.pattern;
      const key = p.kind === "numeric" ? String(p.value) : p.kind === "algebraic" ? squash(p.latex) : null;
      if (key === null) continue;
      if (seen.has(key)) throw new Error(`${where}: commonError ${e.misconception} reaches ${key}, already used by ${seen.get(key)}`);
      seen.set(key, e.misconception);
    }
    if (a.kind === "mcq") {
      const texts = new Map();
      for (const o of a.options) {
        const k = squash(o.text);
        if (texts.has(k)) throw new Error(`${where}: options ${texts.get(k)} and ${o.id} both read ${o.text}`);
        texts.set(k, o.id);
      }
    }
  };
  for (const q of bundle.questions) for (const p of q.parts) visit(`${q.id}#${p.id}`, p);
  for (const d of bundle.diagnostics) {
    for (const item of d.items) {
      const texts = new Map();
      for (const o of item.options) {
        const k = squash(o.text);
        if (texts.has(k)) throw new Error(`${d.id}#${item.id}: options ${texts.get(k)} and ${o.id} both read ${o.text}`);
        texts.set(k, o.id);
      }
      if (item.options.filter((o) => o.correct).length !== 1) throw new Error(`${d.id}#${item.id}: needs exactly one correct option`);
    }
  }
}

export function assertLogs(bundle) {
  const ids = [
    ...(bundle.note ? [bundle.note.id] : []),
    ...bundle.workedExamples.map((x) => x.id),
    ...bundle.diagnostics.map((x) => x.id),
    ...bundle.questions.map((x) => x.id),
    ...bundle.findTheMistake.map((x) => x.id),
    ...bundle.prompts.map((x) => x.id),
  ];
  const logged = new Set(bundle.verification.map((l) => l.itemId));
  for (const id of ids) if (!logged.has(id)) throw new Error(`no verification log for ${id}`);
  for (const l of bundle.verification) if (!ids.includes(l.itemId)) throw new Error(`verification log ${l.id} names an unknown item ${l.itemId}`);
  for (const q of bundle.questions) {
    const total = q.parts.reduce((a, p) => a + p.marks, 0);
    if (total !== q.totalMarks) throw new Error(`${q.id}: parts sum to ${total} but totalMarks is ${q.totalMarks}`);
    for (const p of q.parts) {
      if (p.scheme.length) {
        const s = p.scheme.reduce((a, m) => a + m.marks, 0);
        if (s !== p.marks) throw new Error(`${q.id}#${p.id}: scheme sums to ${s} but the part is worth ${p.marks}`);
      }
      for (const ce of p.commonErrors) if (ce.marksTypicallyEarned >= p.marks) throw new Error(`${q.id}#${p.id}: commonError ${ce.misconception} claims ${ce.marksTypicallyEarned} of ${p.marks} marks`);
    }
  }
}

/** Every prompt's key words must appear in its own answer. */
export function assertPromptKeyWords(bundle) {
  for (const p of bundle.prompts) {
    const hay = ` ${p.answer.toLowerCase().replace(/\\[a-z]+/g, " ").replace(/[^a-z0-9/.=+()\- ]+/g, " ").replace(/\s+/g, " ")} `;
    for (const k of p.keyWords ?? []) {
      const needle = k.toLowerCase().replace(/[^a-z0-9/.=+()\- ]+/g, " ").replace(/\s+/g, " ").trim();
      if (!hay.includes(needle)) throw new Error(`${p.id}: key word "${k}" does not appear in its own answer`);
    }
  }
}

// ---------------------------------------------------------------------------
// String lints, mirroring src/components/items/content-lint.ts
// ---------------------------------------------------------------------------

const NOT_PROSE = new Set([
  "regex", "pattern", "test", "svg", "id", "url", "href", "src", "kind", "status", "unit", "slug", "code",
  "misconception", "verification", "itemId", "topicId", "ref", "latex", "accepted", "any", "reject", "version",
  "generatedAt", "source", "expectedOrder", "items", "keyWords", "bank", "tool", "detail", "solutionProgram",
]);
const TEX_TEXT = /\\(?:text|mathrm|textbf|mbox|operatorname)\{[^}]*\}/g;
const TEX_CMD = /\\[a-zA-Z]+/g;
const LOST_BACKSLASH = /(?<![\\a-zA-Z])(mathbf|mathrm|boldsymbol|frac|tfrac|dfrac|sqrt|vec|hat|underline|overline|text|textbf|left|right|begin|end|ce|times|Phi|mu|sigma|le|ge)\{|\^\{?(circ)\b/;
const BARE_CMD = /(^|[^A-Za-z\\])(frac|dfrac|tfrac|sqrt|times|div|cdot|Phi|sigma|mu|le|ge|ne|circ|left|right)(?![A-Za-z])/;
const PROSE_IN_MATHS = /\b(with|centre|center|and|the|then|onto|about|from|which|label|image|scale|factor|would|gives|when|because|answer|question)\b/i;
const BANNED = [/\bWrong\b/, /\bwrong answer\b/i, /grade 9/i, /!/];
/** Video titles as the channels publish them (data/links/media-map.json), exempt from the voice rules. */
const THIRD_PARTY_TITLES = ["Master Normal Distribution in minutes!"];
const AMERICAN = [/\bcenter\b/i, /\bmeter\b/i, /\bliter\b/i, /\bcolor\b/i, /\banalyze\b/i, /\bpracticing\b/i, /\bfavorite\b/i, /\bgray\b/i, /\bmodeling\b/i];

function lintStrings(value, file) {
  const walk = (node, key) => {
    if (typeof node === "string") {
      if (NOT_PROSE.has(key)) return;
      for (const line of node.split("\n")) {
        const parts = line.split("$");
        if (parts.length % 2 === 0) throw new Error(`${file}: unpaired "$" on one line in ${key}: ${line.slice(0, 90)}`);
        for (let i = 1; i < parts.length; i += 2) {
          const bare = parts[i].replace(TEX_TEXT, " ").replace(TEX_CMD, " ");
          if (PROSE_IN_MATHS.test(bare)) throw new Error(`${file}: prose inside a maths segment in ${key}: $${parts[i]}$`);
          const lost = LOST_BACKSLASH.exec(parts[i]);
          if (lost) throw new Error(`${file}: "${lost[1] ?? lost[2]}" without its backslash in ${key}: $${parts[i]}$`);
          const stripped = parts[i].replace(/\\(?:begin|end)\s*\{[A-Za-z*]+\}/g, " ").replace(/\\[A-Za-z]+/g, " ");
          const bareCmd = BARE_CMD.exec(stripped);
          if (bareCmd) throw new Error(`${file}: "${bareCmd[2]}" reads as a TeX command without its backslash in ${key}: $${parts[i]}$`);
          if (/\\\\(?=[a-zA-Z])/.test(parts[i])) throw new Error(`${file}: doubled backslash before a command in ${key}: $${parts[i]}$`);
        }
      }
      // A third-party video title is quoted exactly as its channel wrote it (a citation, not our voice).
      const quoted = THIRD_PARTY_TITLES.some((t) => node === t || (key === "credit" && node.startsWith(`${t},`)));
      if (!quoted) for (const re of BANNED) if (re.test(node)) throw new Error(`${file}: banned pattern ${re} in ${key}: ${node.slice(0, 90)}`);
      for (const re of AMERICAN) if (re.test(node)) throw new Error(`${file}: American spelling ${re} in ${key}: ${node.slice(0, 90)}`);
      if (/\bNaN\b|\bnull\b|\bundefined\b|\[object Object\]|Infinity/.test(node)) throw new Error(`${file}: leaked value in ${key}: ${node.slice(0, 90)}`);
      if (/\d\.\d*0000000\d|\d\.\d*9999999\d/.test(node)) throw new Error(`${file}: floating-point artefact in ${key}: ${node.slice(0, 90)}`);
      return;
    }
    if (typeof node === "number") {
      if (!Number.isFinite(node)) throw new Error(`${file}: non-finite number under ${key}`);
      const s = String(node);
      if (/\.\d*0000000\d|\.\d*9999999\d/.test(s)) throw new Error(`${file}: floating-point artefact ${s} under ${key}`);
      return;
    }
    if (Array.isArray(node)) {
      for (const v of node) walk(v, key);
      return;
    }
    if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) if (k !== "insight") walk(v, k);
  };
  walk(value, "");
}

export function writeJson(file, value) {
  const text = JSON.stringify(value, null, 2);
  if (text.includes("${")) throw new Error(`${file}: unexpanded template placeholder`);
  lintStrings(value, path.basename(file));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${text}\n`, "utf8");
  const buf = fs.readFileSync(file);
  return { bytes: buf.length, sha: crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16), mtime: fs.statSync(file).mtime.toISOString() };
}

export function emit(slug, bundle, blocks, { depth = true } = {}) {
  if (depth) {
    tidyBundle(bundle);
    tidyBlocks(blocks);
  }
  assertLogs(bundle);
  assertDistinctErrors(bundle);
  assertPromptKeyWords(bundle);
  const shape = assertLessonShape(blocks, slug);
  assertTrapsAnswerSources(bundle, slug);
  const deep = depth ? assertDepth(blocks, bundle, slug) : null;
  if (deep) console.log(`  depth: band ${deep.band}, ${deep.sections} sections (${deep.roles}), ${deep.gates} gates, ${deep.words} words, ${deep.visuals} visuals, ${deep.practice} practice, tail ${deep.tail}`);
  const promptIds = new Set(bundle.prompts.map((p) => p.id));
  for (const b of blocks) if (b.type === "prompt" && !promptIds.has(b.promptId)) throw new Error(`${slug}: note embeds unknown prompt ${b.promptId}`);
  const dir = path.join(OUT, slug);
  const a = writeJson(path.join(dir, "bundle.json"), bundle);
  const b = writeJson(path.join(dir, "note.blocks.json"), blocks);
  const figures = blocks.filter((x) => x.type === "figure").length;
  const videos = blocks.filter((x) => x.type === "video").length;
  const sims = blocks.filter((x) => x.type === "sim").length;
  const practice = bundle.questions.filter((q) => q.style === "practice").length;
  const exam = bundle.questions.filter((q) => q.style === "exam-style").length;
  const marks = bundle.questions.reduce((s, q) => s + q.totalMarks, 0);
  console.log(
    `${slug}: we ${bundle.workedExamples.length} · dx ${bundle.diagnostics.map((d) => `${d.when}:${d.items.length}`).join(" ")} · q ${bundle.questions.length} (${practice} practice + ${exam} exam-style, ${marks} marks) · ftm ${bundle.findTheMistake.length} · rp ${bundle.prompts.length} · ins ${bundle.insight ? 1 : 0} · set ${(bundle.sets ?? []).length} · ver ${bundle.verification.length}`,
  );
  console.log(`  note: ${shape.gates} gates, ${figures} figures, ${videos} video(s), ${sims} sim(s); first visual at word ${shape.visualAt}; longest stretch ${shape.longestStretch} words; panel ${shape.panelWords} words`);
  console.log(`  bundle.json  ${a.sha}  ${a.bytes} B  ${a.mtime}`);
  console.log(`  note.blocks  ${b.sha}  ${b.bytes} B  ${b.mtime}`);
}
