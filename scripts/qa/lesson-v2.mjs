#!/usr/bin/env node
/**
 * scripts/qa/lesson-v2.mjs — run with `node scripts/qa/lesson-v2.mjs [--unit m3] [--json] [--depth]`.
 *
 * Checks every note under packs/ against "Lesson template v2" in pipeline/prompts/author-topic.md,
 * beside its bundle.json. One line per breach, grouped by note; exit 1 if anything is found,
 * exit 0 with a one-line count otherwise.
 *
 *   hero        first block, lede ≤ 60 words and not the hook paragraph, three "can" lines each
 *               starting with a verb, an honest minute estimate
 *   visual      a figure, photo, video or sim before word 80
 *   sections    every teaching stretch ≤ 120 words between gates, up to the recap card
 *   callouts    at least one `why` in the body, at most one `examiner` in the body
 *   recap       a "You can now" card before the closing section
 *   panel       the closing "In the exam" block is a pointer: one heading, one paragraph of
 *               ≤ 80 words, then the prompts — ≤ 150 words in all, no gate, no spec callout and
 *               no examiner callout (the Sheet and the Specification card carry those)
 *   prompts     the retrieval prompts come last
 *   gates       every gate reads on its own in the review inbox (delegated to gate-context.mjs),
 *               offers no option twice, and never answers with the line its own prompt shows
 *               ("Is $A$ finished?" → "No — it becomes $A$")
 *   traps       every topic.examinerSources id is answered by a sheet.traps entry citing its
 *               series and its question — reported as a WARNING, not a breach, because the
 *               only honest way to close one is to read the Chief Examiner report and write
 *               the finding; a trap must never be invented to satisfy a checker. A source
 *               whose block reports nothing trap-like is listed with its reason in
 *               lesson-v2.allow.json and counted as "allowed" instead. Pass
 *               --traps-fatal to count the rest as breaches once the Sheets have caught up.
 *   spelling    British English, allowing the instruments: a light meter, a pH meter, a meter
 *               reading (only the unit of length is "metre")
 *   depth       the Depth standard (22 Sep 2026) in author-topic.md: a floor per difficulty
 *               band (L = difficulty 1–2, S = 3, H4 = 4, H5 = 5) on the note's teaching
 *               sections, gates, words, visuals and section roles, and on the bundle's worked
 *               examples, practice ladder, mixed tail, exam-style set with its synoptic
 *               question, find-the-mistake items, retrieval prompts and diagnostics; plus the
 *               Slides-readiness, figure-label, long-maths and minute measures (learn and sit
 *               timed apart). Only shipped items count, by the pipeline's own rule: a log found
 *               by the item's verification ref or its itemId, with status verified or published.
 *               A shortfall is a WARNING (one summary line by default; the note-by-note report
 *               with --depth) until the lead promotes it with --depth-fatal.
 *
 * --unit <id>     check one unit only (m3, fm1, b1 …); may be repeated
 * --traps-fatal   count an unanswered examiner source as a breach rather than a warning
 * --depth         print the depth report note by note (band, each measure against its floor)
 * --depth-fatal   count a depth shortfall as a breach rather than a warning
 * --json          print the findings as JSON for an author's generator (the depth rows under `depth`)
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const trapsFatal = argv.includes("--traps-fatal");
const depthReport = argv.includes("--depth");
const depthFatal = argv.includes("--depth-fatal");
const units = argv.flatMap((a, i) => (a === "--unit" ? [String(argv[i + 1] || "").toLowerCase()] : []));

const ROOT = path.resolve("packs");

// ── examiner sources the Sheet is allowed to leave alone ─────────────────────────────────────
// scripts/qa/lesson-v2.allow.json maps "<unit>/<slug>" to { "<source id>": "one-line reason" }.
// Each entry records a decision taken after reading that Chief Examiner block: it reports
// nothing trap-like for this topic — the question simply went well, or its findings belong
// somewhere else — so no honest trap can answer it. Allowed sources are counted in the summary
// rather than warned about, under --traps-fatal too, because no later Sheet pass can close
// them. An entry is never a way to quieten a source whose finding is merely unwritten.
const ALLOW_FILE = path.join("scripts", "qa", "lesson-v2.allow.json");
const allow = fs.existsSync(ALLOW_FILE) ? JSON.parse(fs.readFileSync(ALLOW_FILE, "utf8")) : {};
const allowed = []; // { topic, id, why }, filled by traplessSources as it passes over them

const words = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;
/**
 * Teaching prose: the words a learner reads between gates. A callout's `title` is its label
 * rather than its content — the renderer prints it in small caps beside an icon, and leaves
 * it out entirely when the author gives none — so it is not counted, and the stretch measure
 * matches the one the corpus was authored against.
 */
const prose = (b) => (b.type === "p" || b.type === "callout" ? b.md ?? "" : b.type === "h" ? b.text ?? "" : "");
const VISUAL = new Set(["figure", "photo", "video", "sim"]);

function noteFiles(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) noteFiles(p, out);
    else if (f === "note.blocks.json") out.push(p);
  }
  return out;
}

/** packs/<subject>/content/<unit>/<slug>/note.blocks.json */
const idOf = (file) => {
  const parts = file.split(path.sep);
  return { unit: parts[parts.length - 3], slug: parts[parts.length - 2] };
};

// ── gates standing alone: gate-context.mjs owns the rule, so ask it rather than copy it ──────
function orphanGates() {
  const byTopic = new Map();
  let out = "";
  try {
    out = execFileSync(process.execPath, [path.join("scripts", "qa", "gate-context.mjs")], { encoding: "utf8" });
  } catch (e) {
    out = String(e.stdout ?? ""); // it exits 1 when a leaning gate has no visual
  }
  for (const line of out.split("\n")) {
    const m = /^\s+(\S+)\s+(\S+)\s+->\s+NONE\s*$/.exec(line);
    if (m) byTopic.set(m[1], [...(byTopic.get(m[1]) ?? []), m[2]]);
  }
  return byTopic;
}

// ── gates that give themselves away ──────────────────────────────────────────────────────────
// Two identical options leave the learner guessing between one choice shown twice. An answer
// that says the shown line must change ("No — …", "… it becomes …", "…, giving …") but whose
// result, its last $…$ span, is a span of its own prompt asks "is A finished?" and replies
// "no, it becomes A". Both happened on 13 Sep in fm1/algebraic-fractions-simplify g5 and g6,
// when a route that cancels before printing collapsed the unfinished line to the answer.
// Maths is compared whole span to whole span, whitespace squashed, so "$3x$" in an answer
// matches "$3x$" in a prompt and never "$3x^{2}$"; a "which of these" gate whose answer is one
// of the spans its prompt names is untouched, because its answer claims no change.
const squashed = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const mathsSpans = (s) => String(s ?? "").split("$").filter((_, i) => i % 2 === 1).map(squashed).filter(Boolean);
const CLAIMS_A_CHANGE = /^(no|not)\b|\b(becomes?|giving|gives|simplifies to|cancels to|leaves|leaving)\b/i;
function selfAnsweringGate(gate) {
  const out = [];
  const options = (gate.options ?? []).map(squashed);
  for (const o of new Set(options.filter((o, i) => options.indexOf(o) !== i))) out.push(`offers the option "${o.slice(0, 60)}" twice`);
  const answer = squashed(gate.answer);
  const result = mathsSpans(answer).at(-1);
  if (result && CLAIMS_A_CHANGE.test(answer) && mathsSpans(gate.prompt).includes(result))
    out.push(`answers "${answer.slice(0, 60)}", landing on $${result}$, the line its own prompt already shows`);
  return out;
}

// ── examiner sources answered by the Sheet's traps ───────────────────────────────────────────
const SEASON = { summer: "Summer", november: "November", march: "March", january: "January", autumn: "Autumn" };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** ccea-cer:<subject>:<year>-<season>:<paper>:Q<question> */
function parseSource(id) {
  const m = /^ccea-cer:([^:]+):(\d{4})-([a-z]+):([^:]+):Q?(.+)$/i.exec(String(id));
  if (!m) return null;
  return { subject: m[1], year: m[2], season: SEASON[m[3].toLowerCase()] ?? m[3], paper: m[4], question: m[5] };
}

function traplessSources(bundle, topic) {
  const traps = (bundle?.note?.sheet?.traps ?? []).join("\n");
  const permitted = allow[topic] ?? {};
  const missing = [];
  for (const id of bundle?.topic?.examinerSources ?? []) {
    if (Object.hasOwn(permitted, id)) {
      allowed.push({ topic, id, why: permitted[id] });
      continue;
    }
    const s = parseSource(id);
    if (!s) {
      missing.push(`${id} (unreadable id)`);
      continue;
    }
    const series = new RegExp(`${s.season}\\s+${s.year}|${s.year}\\s+${s.season}`, "i").test(traps);
    // The id writes a part as Q20b or Q26a; a trap writes it as Q20(b) or Question 26. Match
    // on the question number, which is what identifies the item.
    const q = esc(String(s.question).replace(/[^0-9].*$/, ""));
    const question = q.length > 0 && new RegExp(`\\bQ\\s?${q}\\b|\\bQuestion\\s+${q}\\b`, "i").test(traps);
    if (!series || !question) missing.push(`${id} (${series ? "series cited, question not" : question ? "question cited, series not" : "neither cited"})`);
  }
  return missing;
}

// ── British English, with the instruments that are spelled "meter" ───────────────────────────
const AMERICAN = [
  ["color", "colour"],
  ["meter", "metre"],
  ["center", "centre"],
  ["analyze", "analyse"],
  ["practicing", "practising"],
  ["organization", "organisation"],
];
const deInstrument = (s) =>
  String(s ?? "")
    .replace(/\b(light|pH|gas|water|flow|parking|oxygen|energy)\s+meters?\b/gi, "")
    .replace(/\bmeter readings?\b/gi, "");

function everyString(block) {
  const out = [];
  if (block.type === "hero") out.push(block.lede, ...(block.can ?? []));
  if (block.type === "p" || block.type === "callout") out.push(block.md, block.title);
  if (block.type === "h") out.push(block.text);
  if (block.type === "gate") out.push(block.prompt, block.explain, ...(block.options ?? []));
  if (block.caption) out.push(block.caption);
  if (block.alt) out.push(block.alt);
  if (block.type === "video") out.push(block.title, block.why);
  if (block.type === "sim") out.push(block.title, block.task);
  return out.filter(Boolean);
}

// ── the depth floor (Depth standard, 22 Sep 2026, author-topic.md) ───────────────────────────
// One row per band. Words and practice carry [min, max]: the minimum is the floor, the maximum a
// guide (a note over it is usually under-gated, which the 120-word rule already catches).
// `synoptic` is [parts, marks] for the one chain question an H bundle must hold; `tail` is the
// smallest mixed set and `tailOnly` the tail-only items it must hold (a practice question that is
// not a ladder rung, carrying "mixed-tail" in its emphasis); `recap` is [min, max] lines; `d4`/`d5`
// count practice items at those rungs; `rp` is a minimum with no maximum.
const FLOOR = {
  L: { sections: 4, gates: 5, words: [450, 750], variants: 1, whySection: false, twists: 0, further: false, recap: [3, 5], visuals: 3, we: 1, practice: [6, 9], d4: 0, d5: 0, tail: 0, tailOnly: 0, exam: 1, multi: 0, synoptic: null, ftm: 1, rp: 4, embedded: 3, pre: 3, post: 1 },
  S: { sections: 6, gates: 7, words: [600, 950], variants: 2, whySection: false, twists: 2, further: false, recap: [3, 5], visuals: 4, we: 2, practice: [8, 10], d4: 1, d5: 0, tail: 3, tailOnly: 0, exam: 2, multi: 1, synoptic: null, ftm: 2, rp: 6, embedded: 4, pre: 3, post: 3 },
  H4: { sections: 8, gates: 10, words: [850, 1300], variants: 3, whySection: true, twists: 3, further: true, recap: [4, 5], visuals: 6, we: 3, practice: [12, 16], d4: 3, d5: 1, tail: 4, tailOnly: 1, exam: 4, multi: 2, synoptic: [3, 8], ftm: 3, rp: 8, embedded: 5, pre: 3, post: 5 },
  H5: { sections: 10, gates: 12, words: [1000, 1600], variants: 4, whySection: true, twists: 4, further: true, recap: [4, 5], visuals: 7, we: 4, practice: [14, 18], d4: 5, d5: 2, tail: 5, tailOnly: 1, exam: 4, multi: 3, synoptic: [4, 10], ftm: 3, rp: 10, embedded: 5, pre: 3, post: 6 },
};
// Only shipped items count, by the pipeline's rule (pipeline/build-content.mts): a log is found by the
// item's `verification` ref (worked examples, questions) or by `itemId` (diagnostics, find-the-mistake,
// prompts); no log, or a status outside this set, is a draft the app never ships.
const SHIPPABLE = new Set(["verified", "published"]);
const bandOf = (difficulty) => (difficulty <= 2 ? "L" : difficulty === 3 ? "S" : difficulty === 4 ? "H4" : "H5");

// Roles are authored on heading blocks (`role`). A note written before the standard has none, so
// the report guesses from the heading text — for the see/twists/further/derivation/why rows only —
// and says so; variants are never guessed, because a guessed variant would let an unlabelled note
// pass a floor it has not met.
const ROLES = ["idea", "why", "variant", "see", "twists", "further", "derivation", "recap", "pointer"];
const ROLE_GUESS = [
  ["recap", /^you can now$/i],
  ["pointer", /^in the exam$/i],
  ["see", /\bsee it\b|\bworked in full\b|\bstart to finish\b|\bwritten out\b|\bworked example\b/i],
  ["twists", /\btwist|\bdisguis|\bthe ways the paper\b|\bhow the paper asks\b|\bhow it is asked\b/i],
  ["further", /\bgoing further\b|\bbeyond the routine\b|\bthe hard end\b|\bharder end\b/i],
  ["derivation", /\bderiv|\bwhere .* comes? from\b|\bproof\b|\bprov(e|ing)\b|\bfrom first principles\b/i],
  ["why", /^why\b|\bwhy it works\b|\bwhy .* works\b/i],
];
const guessRole = (text) => ROLE_GUESS.find(([, re]) => re.test(String(text ?? "")))?.[0] ?? null;

// Slides-readiness (decision 9): one idea per block, headings as card titles, captions that stand
// alone, a gate at most every four cards, no two visuals back to back.
const CARD_WORDS = 75;
const TITLE_WORDS = 8;
const CAPTION_WORDS = 25;
const CARDS_PER_GATE = 4;

// Figures: a label renders at font-size × column ÷ viewBox width, and the phone column is 358 px.
const PHONE_COLUMN = 358;
const LABEL_FLOOR_PX = 12.5;

function svgLabels(svg) {
  const vb = /viewBox=["']([^"']+)["']/.exec(svg);
  const vw = vb ? Number(vb[1].split(/[\s,]+/)[2]) : 0;
  const sizes = [...svg.matchAll(/font-size[=:]\s*["']?([\d.]+)/g)].map((m) => Number(m[1]));
  const texts = (svg.match(/<text\b/g) ?? []).length;
  const shapes = (svg.match(/<(path|rect|circle|line|polyline|polygon|ellipse)\b/g) ?? []).length;
  if (!vw || !texts) return { vw, texts, shapes, min: null, at358: null, textOnly: false };
  const min = sizes.length ? Math.min(...sizes) : 16; // the SVG default when no size is set
  // Prose drawn as a picture: judged by the ratio of text to drawn shapes, with two guards so that
  // an annotated graph or a labelled drawing is not caught — nothing curved is drawn (a card has a
  // box and rules, a graph has its curve) and the text is sentence-length. Calibrated on the corpus:
  // the method cards and phrase tables in fm1/optimisation, fm2/equilibrium-of-forces and
  // fm1/trig-equations are caught; the annotated enzyme graphs and the circle diagrams are not.
  const contents = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((m) => m[1].trim());
  const avgLen = contents.length ? contents.reduce((a, t) => a + t.length, 0) / contents.length : 0;
  const long = contents.filter((t) => t.length >= 25).length;
  const curves = (svg.match(/<(path|circle|ellipse|polygon|polyline)\b/g) ?? []).length;
  const textOnly = texts >= 4 && shapes <= 6 && curves === 0 && texts >= 2 * shapes && (long >= 3 || avgLen >= 15);
  return { vw, texts, shapes, min, at358: (min * Math.min(PHONE_COLUMN, vw)) / vw, textOnly };
}

function decodeFigure(src) {
  let svg = src.startsWith("data:") ? src.replace(/^data:image\/svg\+xml[^,]*,/, "").replace(/%23/g, "#") : src;
  try {
    svg = decodeURIComponent(svg);
  } catch {
    /* a utf8 data URI with a literal % sign: measure the raw text */
  }
  return svg;
}

// Long maths: an inline segment does not wrap. 60 characters of TeX is about the 17 em a phone line
// holds; a \dfrac over 40 characters or a number list of six or more items never fits.
const TEX_CHARS = 60;
const DFRAC_CHARS = 40;
function mathsIssues(strings) {
  const long = [];
  const fracs = [];
  const lists = [];
  for (const s of strings) {
    for (const m of String(s ?? "").matchAll(/\$(?!\$)([^$]+)\$/g)) {
      const tex = m[1];
      const compact = tex.replace(/\s+/g, "");
      if (compact.length > TEX_CHARS) long.push(tex.trim());
      if (/(?:-?\d+(?:\.\d+)?\s*,\s*){5,}/.test(tex)) lists.push(tex.trim());
      for (const f of tex.matchAll(/\\[dt]?frac\{/g)) {
        // measure numerator{…}{…} by brace matching from the first brace
        let i = f.index + f[0].length - 1;
        let depth = 0;
        let inner = 0;
        let groups = 0;
        for (; i < tex.length && groups < 2; i += 1) {
          const ch = tex[i];
          if (ch === "{") depth += 1;
          else if (ch === "}") {
            depth -= 1;
            if (depth === 0) groups += 1;
          } else if (depth > 0 && !/\s/.test(ch)) inner += 1;
        }
        if (groups === 2 && inner > DFRAC_CHARS) fracs.push(tex.trim());
      }
    }
  }
  return { long, fracs, lists };
}

const short = (s, n = 48) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** The depth measures for one note and its bundle, against the band's floor. */
function depthOf(blocks, bundle) {
  if (!bundle?.topic) return null;
  const band = bandOf(Number(bundle.topic.difficulty) || 3);
  const floor = FLOOR[band];
  const isH = band === "H4" || band === "H5";

  const recapAt = blocks.findIndex((b) => b.type === "h" && /^you can now$/i.test(b.text ?? ""));
  const panelAt = blocks.findIndex((b) => b.type === "h" && /^in the exam$/i.test(b.text ?? ""));
  const bodyEnd = recapAt >= 0 ? recapAt : panelAt >= 0 ? panelAt : blocks.length;
  const body = blocks.slice(0, bodyEnd);
  const headings = body.filter((b) => b.type === "h");
  const explicit = headings.filter((h) => ROLES.includes(h.role));
  const labelled = headings.length > 0 && explicit.length === headings.length;
  const roleCount = (role) => explicit.filter((h) => h.role === role).length;
  const guessed = (role) => headings.filter((h) => !ROLES.includes(h.role) && guessRole(h.text) === role).length;
  const roles = Object.fromEntries(ROLES.map((r) => [r, roleCount(r) + (r === "variant" || r === "idea" ? 0 : guessed(r))]));
  const videoThenGate = body.some((b, i) => (b.type === "video" || b.type === "sim") && blocks.slice(i + 1, i + 4).some((n) => n.type === "gate"));
  const seeCount = roles.see + (roles.see === 0 && videoThenGate ? 1 : 0);
  // A variant section shows its own method when it holds a video or a paragraph of two or more
  // working lines, so it needs no separate "See it done" section. A working line is numbered
  // ("1.", "Step 2."), bold-labelled ("**Differentiate**"), or a maths step: inline maths carrying
  // an equals sign, or maths joined by "so", "becomes", "gives", "then" or "which is".
  const WORKED_LINE = /^\s*(\*\*[^*]{1,40}\*\*|(step\s*)?\d+[.):]|\$)|\$[^$]*=[^$]*\$|\$[^$]+\$.*\b(so|becomes?|gives|then|which is|hence)\b|\b(so|becomes?|gives|then|which is|hence)\b.*\$[^$]+\$/i;
  const sections = [];
  for (const b of body) {
    if (b.type === "h") sections.push({ h: b, blocks: [] });
    else if (sections.length) sections[sections.length - 1].blocks.push(b);
  }
  const shownVariants = sections.filter(
    (s) => s.h.role === "variant" && s.blocks.some((b) => b.type === "video" || b.type === "sim" || (b.type === "p" && String(b.md).split("\n").filter((l) => WORKED_LINE.test(l)).length >= 2)),
  ).length;
  const seeShown = seeCount + shownVariants;
  const whyCallouts = body.filter((b) => b.type === "callout" && b.kind === "why").length;

  const gates = body.filter((b) => b.type === "gate").length;
  const wordCount = blocks.reduce((a, b) => a + words(prose(b)), 0);
  const visuals = blocks.filter((b) => VISUAL.has(b.type)).length;
  const recapLines = recapAt >= 0 && blocks[recapAt + 1]?.type === "p" ? String(blocks[recapAt + 1].md).split("\n").filter((l) => l.trim()).length : 0;
  const embedded = blocks.filter((b) => b.type === "prompt").length;
  const mustKnow = bundle.note?.formulaSheet?.mustKnow ?? [];

  // shipped items only (see SHIPPABLE); drafts are reported, never counted
  const logs = bundle.verification ?? [];
  const drafts = { we: 0, q: 0, dx: 0, ftm: 0, rp: 0 };
  const keep = (items, key) =>
    (items ?? []).filter((it) => {
      const log = it.verification ? logs.find((l) => l.id === it.verification) : logs.find((l) => l.itemId === it.id);
      const ok = SHIPPABLE.has(log?.status);
      if (!ok) drafts[key] += 1;
      return ok;
    });
  const workedExamples = keep(bundle.workedExamples, "we");
  const questions = keep(bundle.questions, "q");
  const diagnostics = keep(bundle.diagnostics, "dx");
  const findTheMistake = keep(bundle.findTheMistake, "ftm");
  const prompts = keep(bundle.prompts, "rp");
  const shippedIds = new Set([...questions, ...diagnostics, ...findTheMistake, ...prompts].map((it) => it.id));
  const draftCount = Object.values(drafts).reduce((a, n) => a + n, 0);

  const practice = questions.filter((q) => q.style === "practice");
  const exam = questions.filter((q) => q.style === "exam-style");
  const weComplete = workedExamples.filter((we) => we.twin && (we.faded?.length ?? 0) >= 2).length;
  const weWhy = workedExamples.filter((we) => we.steps.some((s) => s.whyMenu)).length;
  const d4 = practice.filter((q) => q.difficulty >= 4).length;
  const d5 = practice.filter((q) => q.difficulty >= 5).length;
  const tailSets = (bundle.sets ?? []).filter((s) => s.kind === "mixed" || s.kind === "interleaved");
  const tail = Math.max(0, ...tailSets.map((s) => s.itemIds.filter((id) => shippedIds.has(id)).length));
  // A tail-only item is a practice question that is not a ladder rung; one that names a neighbouring
  // statement in its specRefs is the item that makes her choose the method.
  const own = new Set(bundle.topic.statementIds ?? []);
  const tailOnly = practice.filter((q) => (q.emphasis ?? []).includes("mixed-tail"));
  const tailForeign = tailOnly.filter((q) => (q.specRefs ?? []).some((r) => !own.has(r))).length;
  const multi = exam.filter((q) => q.parts.length >= 2).length;
  const synoptic = floor.synoptic ? exam.filter((q) => q.parts.length >= floor.synoptic[0] && q.totalMarks >= floor.synoptic[1]).length : null;
  const dxItems = diagnostics.reduce((a, d) => a + d.items.length, 0);
  const pre = diagnostics.filter((d) => d.when === "pre").reduce((a, d) => a + d.items.length, 0);
  const post = diagnostics.filter((d) => d.when === "post").reduce((a, d) => a + d.items.length, 0);
  const both = diagnostics.filter((d) => d.when === "both").reduce((a, d) => a + d.items.length, 0);
  // A `both` set is split by the app: four items for the check after the lesson, the rest after practice.
  const preEff = pre + (pre === 0 && post === 0 ? Math.min(4, both) : 0);
  const postEff = post + (pre === 0 && post === 0 ? Math.max(0, both - 4) : both);
  const pMarks = practice.reduce((a, q) => a + q.totalMarks, 0);
  const eMarks = exam.reduce((a, q) => a + q.totalMarks, 0);

  // minutes by the app's model (lesson-plan.ts): the learning pass, and the exam-style set sat apart
  const noteMinutes = Math.max(1, Math.round(wordCount / 180 + (gates * 40) / 60));
  const learnMinutes =
    noteMinutes +
    workedExamples.length * 2 +
    Math.min(4, dxItems) +
    Math.round(pMarks * 1.2) +
    Math.max(0, dxItems - 4) +
    findTheMistake.length * 2 +
    Math.max(0, prompts.length - embedded);
  const sitMinutes = Math.round(eMarks * 1.2);
  const topicMinutes = learnMinutes + sitMinutes;

  // structure floor: the countable measures
  const rows = [];
  const row = (name, value, ok, floorText, note) => rows.push({ name, value, ok, floor: floorText, note });
  row("sections", headings.length, headings.length >= floor.sections, `≥ ${floor.sections}`);
  row("gates", gates, gates >= floor.gates, `≥ ${floor.gates}`);
  row("words", wordCount, wordCount >= floor.words[0], `${floor.words[0]}–${floor.words[1]}`, wordCount > floor.words[1] ? "over the band's guide: more sections, not longer ones" : undefined);
  row("visuals", visuals, visuals >= floor.visuals, `≥ ${floor.visuals}`);
  row("worked examples (twin + 2 faded)", weComplete, weComplete >= floor.we, `≥ ${floor.we}`, weWhy < workedExamples.length ? `${workedExamples.length - weWhy} without a whyMenu` : undefined);
  row("practice items", practice.length, practice.length >= floor.practice[0], `${floor.practice[0]}–${floor.practice[1]}`);
  if (floor.d4) row("practice at difficulty 4–5", d4, d4 >= floor.d4, `≥ ${floor.d4}`);
  if (floor.d5) row("practice at difficulty 5", d5, d5 >= floor.d5, `≥ ${floor.d5}`);
  if (floor.tail)
    row(
      "mixed tail (largest mixed/interleaved set)",
      tail,
      tail >= floor.tail && tailOnly.length >= floor.tailOnly,
      `≥ ${floor.tail}${floor.tailOnly ? `, with ≥ ${floor.tailOnly} tail-only item` : ""}`,
      `tail-only items ${tailOnly.length}${tailOnly.length ? ` (${tailForeign} from a neighbouring statement)` : ""}`,
    );
  row("exam-style", exam.length, exam.length >= floor.exam, `≥ ${floor.exam}`);
  if (floor.multi) row("exam-style with 2+ parts", multi, multi >= floor.multi, `≥ ${floor.multi}`);
  if (floor.synoptic) row(`synoptic (≥ ${floor.synoptic[0]} parts, ≥ ${floor.synoptic[1]} marks)`, synoptic, synoptic >= 1, "≥ 1");
  row("find-the-mistake", findTheMistake.length, findTheMistake.length >= floor.ftm, `≥ ${floor.ftm}`);
  row("retrieval prompts", prompts.length, prompts.length >= floor.rp, `≥ ${floor.rp}`);
  row("prompts embedded in the note", embedded, embedded >= floor.embedded, `≥ ${floor.embedded}`);
  row("diagnostics pre", preEff, preEff >= floor.pre, `≥ ${floor.pre}`, pre === 0 && post === 0 && both ? "when=both, split by the app" : undefined);
  row("diagnostics post", postEff, postEff >= floor.post, `≥ ${floor.post}`);
  const structureOk = rows.every((r) => r.ok);

  // section floor: the roles
  const sectionRows = [];
  const srow = (name, value, ok, floorText, note) => sectionRows.push({ name, value, ok, floor: floorText, note });
  srow("roles on headings", `${explicit.length} of ${headings.length}`, labelled, "every teaching heading", labelled ? undefined : "unlabelled: add role to every heading");
  srow("idea", roles.idea, roles.idea >= 1, "1");
  srow("variant sections", labelled ? roles.variant : "unlabelled", labelled && roles.variant >= floor.variants, `≥ ${floor.variants}`);
  if (floor.whySection) srow("why section", roles.why, roles.why >= 1, "1", roles.why === 0 && whyCallouts ? `${whyCallouts} why callout(s) only` : undefined);
  else srow("why callout or section", whyCallouts + roles.why, whyCallouts + roles.why >= 1, "≥ 1");
  srow(
    "see it done",
    seeShown,
    seeShown >= 1 && (!isH || !labelled || seeShown >= roles.variant),
    isH ? `one per variant (${floor.variants}+)` : "1",
    shownVariants ? `${shownVariants} variant section(s) shown by their own worked lines or video` : undefined,
  );
  if (floor.twists) srow("exam twists section", roles.twists, roles.twists >= 1, `1 (with ≥ ${floor.twists} twists)`);
  else srow("exam twists", roles.twists, true, "≥ 1 twist, may live in the pointer");
  if (floor.further) srow("going further", roles.further, roles.further >= 1, "1");
  if (isH) srow("derivation", roles.derivation, mustKnow.length === 0 || roles.derivation >= 1, mustKnow.length ? "1 (a must-know formula exists)" : "none expected", mustKnow.length && roles.derivation === 0 ? `mustKnow: ${short(mustKnow.join("; "), 60)} — derive it, or say why not` : undefined);
  srow("recap lines", recapLines, recapLines >= floor.recap[0] && recapLines <= floor.recap[1], `${floor.recap[0]}–${floor.recap[1]}`);
  const sectionsOk = sectionRows.every((r) => r.ok);

  // slides-readiness
  const overCard = blocks.filter((b) => (b.type === "p" || b.type === "callout") && words(b.md) > CARD_WORDS);
  const longTitles = blocks.filter((b) => b.type === "h" && words(b.text) > TITLE_WORDS);
  const untitledCallouts = body.filter((b) => b.type === "callout" && !b.title).length;
  const noCaption = blocks.filter((b) => b.type === "figure" && !b.caption).length;
  const longCaptions = blocks.filter((b) => (b.type === "figure" || b.type === "photo") && b.caption && words(b.caption) > CAPTION_WORDS).length;
  let consecutiveVisuals = 0;
  let cardsSinceGate = 0;
  let maxCards = 0;
  let cards = 0;
  for (let i = 0; i < body.length; i += 1) {
    const b = body[i];
    if (VISUAL.has(b.type) && VISUAL.has(body[i - 1]?.type)) consecutiveVisuals += 1;
    if (b.type === "p" || b.type === "callout" || VISUAL.has(b.type)) {
      cardsSinceGate += 1;
      cards += 1;
    }
    if (b.type === "gate") {
      maxCards = Math.max(maxCards, cardsSinceGate);
      cardsSinceGate = 0;
      cards += 1;
    }
  }
  maxCards = Math.max(maxCards, cardsSinceGate);
  const closingCards = blocks.slice(bodyEnd).filter((b) => b.type === "p" || b.type === "h").length;
  const slidesMinutes = Math.max(1, Math.round(((cards + closingCards) * 20 + gates * 40) / 60));
  const slides = [];
  if (overCard.length) slides.push(`${overCard.length} block(s) over ${CARD_WORDS} words (one idea per card): ${overCard.slice(0, 2).map((b) => `"${short(String(b.md), 40)}"`).join(", ")}`);
  if (longTitles.length) slides.push(`${longTitles.length} heading(s) over ${TITLE_WORDS} words: ${longTitles.slice(0, 2).map((b) => `"${short(String(b.text), 40)}"`).join(", ")}`);
  if (consecutiveVisuals) slides.push(`${consecutiveVisuals} visual(s) back to back`);
  if (noCaption) slides.push(`${noCaption} figure(s) without a caption`);
  if (longCaptions) slides.push(`${longCaptions} caption(s) over ${CAPTION_WORDS} words`);
  if (untitledCallouts) slides.push(`${untitledCallouts} callout(s) without a title`);
  if (maxCards > CARDS_PER_GATE) slides.push(`${maxCards} cards between gates (max ${CARDS_PER_GATE})`);

  // figures: note figures and the bundle's own SVGs
  const noteFigures = blocks.map((b, i) => ({ where: `note#${i}`, svg: b.type === "figure" && b.svg ? b.svg : null })).filter((f) => f.svg);
  const bundleFigures = [];
  for (const q of bundle.questions) for (const f of q.figures ?? []) if (f.kind === "svg") bundleFigures.push({ where: q.id, svg: decodeFigure(f.src) });
  for (const we of bundle.workedExamples) {
    if (we.figure?.kind === "svg") bundleFigures.push({ where: we.id, svg: decodeFigure(we.figure.src) });
    if (we.twin?.figure?.kind === "svg") bundleFigures.push({ where: `${we.id} twin`, svg: decodeFigure(we.twin.figure.src) });
  }
  for (const d of bundle.diagnostics) for (const it of d.items) if (it.figure?.kind === "svg") bundleFigures.push({ where: `${d.id}/${it.id}`, svg: decodeFigure(it.figure.src) });
  const measured = [...noteFigures, ...bundleFigures].map((f) => ({ where: f.where, ...svgLabels(f.svg) }));
  const withText = measured.filter((f) => f.at358 !== null);
  const small = withText.filter((f) => f.at358 < LABEL_FLOOR_PX);
  const textOnly = measured.filter((f) => f.textOnly);
  const smallest = withText.length ? Math.min(...withText.map((f) => f.at358)) : null;
  const figures = [];
  if (small.length) figures.push(`${small.length} of ${withText.length} figure(s) with a label under ${LABEL_FLOOR_PX} px on a phone (smallest ${smallest.toFixed(1)} px): ${small.slice(0, 3).map((f) => `${f.where} (${f.min}/${f.vw})`).join(", ")}`);
  if (textOnly.length) figures.push(`${textOnly.length} figure(s) that are prose drawn as a picture (sentences in boxes, nothing curved drawn): ${textOnly.slice(0, 3).map((f) => f.where).join(", ")}`);

  // long maths across the note and the bundle
  const strings = [];
  for (const b of blocks) strings.push(...everyString(b));
  for (const q of bundle.questions) for (const p of q.parts) strings.push(p.stem, p.workedSolution, ...(p.hints ?? []));
  for (const we of bundle.workedExamples) strings.push(we.stem, we.twin?.stem, ...we.steps.map((s) => s.working));
  for (const d of bundle.diagnostics) for (const it of d.items) strings.push(it.stem, ...it.options.map((o) => o.text));
  for (const f of bundle.findTheMistake) strings.push(f.stem, ...f.studentWorking, ...f.correction);
  const maths = mathsIssues(strings);
  const mathsLines = [];
  if (maths.long.length) mathsLines.push(`${maths.long.length} inline segment(s) over ${TEX_CHARS} characters of TeX: "${short(maths.long[0])}"`);
  if (maths.fracs.length) mathsLines.push(`${maths.fracs.length} \\dfrac over ${DFRAC_CHARS} characters (display maths or split it): "${short(maths.fracs[0])}"`);
  if (maths.lists.length) mathsLines.push(`${maths.lists.length} number list(s) inside maths (write them as prose): "${short(maths.lists[0])}"`);

  return {
    band,
    hardness: bundle.topic.hardness,
    difficulty: bundle.topic.difficulty,
    structureOk,
    sectionsOk,
    labelled,
    rows,
    sectionRows,
    slides,
    figures,
    maths: mathsLines,
    drafts: draftCount ? Object.entries(drafts).filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(", ") : "",
    minutes: { note: noteMinutes, learn: learnMinutes, sit: sitMinutes, topic: topicMinutes, slides: slidesMinutes, cards: cards + closingCards },
  };
}

// ── the checks ───────────────────────────────────────────────────────────────────────────────
function checkNote(file, orphans) {
  const { unit, slug } = idOf(file);
  const blocks = JSON.parse(fs.readFileSync(file, "utf8"));
  const bundleFile = path.join(path.dirname(file), "bundle.json");
  const bundle = fs.existsSync(bundleFile) ? JSON.parse(fs.readFileSync(bundleFile, "utf8")) : null;
  const say = [];
  const fail = (check, detail) => say.push({ check, detail });

  // hero
  const hero = blocks[0];
  if (hero?.type !== "hero") fail("hero", "the first block is not a hero");
  else {
    if (hero.generated === true) fail("hero", "still carries the generated flag");
    if (words(hero.lede) > 60) fail("hero", `lede is ${words(hero.lede)} words (max 60)`);
    const firstP = blocks.find((b) => b.type === "p");
    if (firstP && String(hero.lede).trim() === String(firstP.md).trim()) fail("hero", "the lede is the hook paragraph word for word");
    const can = hero.can ?? [];
    if (can.length !== 3) fail("hero", `${can.length} "can" lines (needs three)`);
    for (const c of can) if (!/^[A-Z][a-z]+\b/.test(String(c))) fail("hero", `"can" line does not start with a verb: ${String(c).slice(0, 40)}`);
    if (!(hero.minutes >= 5)) fail("hero", "no minute estimate");
  }

  // a visual before word 80
  let run = 0;
  let visualAt = -1;
  for (const b of blocks) {
    if (VISUAL.has(b.type)) { visualAt = run; break; }
    run += words(prose(b));
  }
  if (visualAt < 0) fail("visual", "the note has no figure, photo, video or sim");
  else if (visualAt >= 80) fail("visual", `first visual after ${visualAt} words of prose (max 80)`);

  // the closing section and the recap that precedes it
  const recapAt = blocks.findIndex((b) => b.type === "h" && /^you can now$/i.test(b.text ?? ""));
  const panelAt = blocks.findIndex((b) => b.type === "h" && /^in the exam$/i.test(b.text ?? ""));
  if (recapAt < 0) fail("recap", 'no "You can now" card');
  else if (panelAt >= 0 && recapAt > panelAt) fail("recap", "the recap card comes after the closing section");
  else if (blocks[recapAt + 1]?.type !== "p") fail("recap", "the recap card has no paragraph");
  else {
    const lines = String(blocks[recapAt + 1].md).split("\n").filter((l) => l.trim());
    if (lines.length < 3 || lines.length > 5) fail("recap", `${lines.length} recap lines (needs three to five)`);
  }

  // teaching stretches, up to the recap card
  const body = blocks.slice(0, recapAt >= 0 ? recapAt : panelAt >= 0 ? panelAt : blocks.length);
  let stretch = 0;
  let since = "the start";
  for (const b of body) {
    if (b.type === "gate") {
      if (stretch > 120) fail("sections", `${stretch} words between ${since} and gate ${b.id} (max 120)`);
      stretch = 0;
      since = `gate ${b.id}`;
    } else stretch += words(prose(b));
  }
  if (stretch > 120) fail("sections", `${stretch} words between ${since} and the recap card (max 120)`);

  // callouts in the body
  const whys = body.filter((b) => b.type === "callout" && b.kind === "why").length;
  const examiners = body.filter((b) => b.type === "callout" && b.kind === "examiner").length;
  if (whys < 1) fail("callouts", "no why callout in the teaching body");
  if (examiners > 1) fail("callouts", `${examiners} examiner callouts in the teaching body (max one)`);

  // the closing panel is a pointer
  if (panelAt < 0) fail("panel", 'no "In the exam" heading');
  else {
    const panel = blocks.slice(panelAt);
    const paras = panel.filter((b) => b.type === "p");
    const headings = panel.filter((b) => b.type === "h");
    if (headings.length !== 1) fail("panel", `${headings.length} headings in the closing section (needs one)`);
    if (paras.length !== 1) fail("panel", `${paras.length} paragraphs in the closing section (needs one)`);
    else if (words(paras[0].md) > 80) fail("panel", `the closing paragraph is ${words(paras[0].md)} words (max 80)`);
    const panelWords = panel.reduce((a, b) => a + words(prose(b)), 0);
    if (panelWords > 150) fail("panel", `${panelWords} words in the closing section (max 150)`);
    for (const b of panel) {
      if (b.type === "gate") fail("panel", `gate ${b.id} sits inside the closing section`);
      if (b.type === "callout" && b.kind === "spec") fail("panel", "a spec callout is repeated in the closing section");
      if (b.type === "callout" && b.kind === "examiner") fail("panel", "an examiner callout sits in the closing section (it belongs in the Sheet's traps)");
    }
  }

  // the prompts close the note
  const promptIdx = blocks.map((b, i) => (b.type === "prompt" ? i : -1)).filter((i) => i >= 0);
  if (promptIdx.length === 0) fail("prompts", "the note embeds no retrieval prompts");
  else if (promptIdx[promptIdx.length - 1] !== blocks.length - 1) fail("prompts", "the retrieval prompts are not last");
  else if (panelAt >= 0 && promptIdx[0] < panelAt) fail("prompts", "a retrieval prompt sits before the closing section");

  // gates that read on their own
  for (const id of orphans.get(slug) ?? []) fail("gates", `gate ${id} leans on a figure with none before it`);

  // gates that give nothing away
  for (const b of blocks) if (b.type === "gate") for (const m of selfAnsweringGate(b)) fail("gates", `gate ${b.id} ${m}`);

  // the Sheet answers every examiner source
  if (bundle) for (const m of traplessSources(bundle, `${unit}/${slug}`)) fail("traps", `no trap answers ${m}`);

  // a heading role must be one the standard names
  for (const b of blocks) if (b.type === "h" && b.role !== undefined && !ROLES.includes(b.role)) fail("depth", `heading role "${b.role}" is not one of ${ROLES.join(", ")}: ${String(b.text).slice(0, 40)}`);

  // British English
  for (const b of blocks)
    for (const s of everyString(b)) {
      const cleaned = deInstrument(s);
      for (const [us, br] of AMERICAN)
        if (new RegExp(`\\b${us}`, "i").test(cleaned)) fail("spelling", `American spelling "${us}" (use "${br}"): ${String(s).slice(0, 60)}`);
    }

  // the depth floor: warnings unless --depth-fatal
  const depth = bundle ? depthOf(blocks, bundle) : null;
  if (depth) {
    for (const r of [...depth.rows, ...depth.sectionRows]) if (!r.ok) say.push({ check: "depth", detail: `${r.name} ${r.value} (floor ${r.floor})${r.note ? ` — ${r.note}` : ""}`, depth: true });
    for (const s of [...depth.slides, ...depth.figures, ...depth.maths]) say.push({ check: "depth", detail: s, depth: true });
  }

  const isWarning = (f) => (f.check === "traps" && !trapsFatal) || (f.depth && !depthFatal);
  return {
    unit,
    slug,
    file: path.relative(process.cwd(), file),
    findings: say.filter((f) => !isWarning(f)),
    warnings: say.filter((f) => f.check === "traps" && !trapsFatal),
    depth,
  };
}

// ── run ──────────────────────────────────────────────────────────────────────────────────────
const orphans = orphanGates();
const notes = noteFiles(ROOT)
  .map((f) => ({ f, ...idOf(f) }))
  .filter(({ unit }) => units.length === 0 || units.includes(unit.toLowerCase()))
  .map(({ f }) => checkNote(f, orphans));

const breached = notes.filter((n) => n.findings.length > 0);
const warned = notes.filter((n) => n.warnings.length > 0);
const count = breached.reduce((a, n) => a + n.findings.length, 0);
const warnCount = warned.reduce((a, n) => a + n.warnings.length, 0);
// An allowance for a source the topic no longer cites is dead config; say so, unless a --unit
// filter means the topic that owns it was never visited.
const stale = units.length
  ? []
  : Object.entries(allow).flatMap(([topic, ids]) =>
      topic.startsWith("$") ? [] : Object.keys(ids).filter((id) => !allowed.some((a) => a.topic === topic && a.id === id)).map((id) => `${topic} ${id}`),
    );

// the depth summary, per band
const measured = notes.filter((n) => n.depth);
const bands = ["L", "S", "H4", "H5"];
const perBand = bands.map((b) => {
  const rows = measured.filter((n) => n.depth.band === b);
  return {
    band: b,
    notes: rows.length,
    structure: rows.filter((n) => n.depth.structureOk).length,
    sections: rows.filter((n) => n.depth.sectionsOk).length,
    both: rows.filter((n) => n.depth.structureOk && n.depth.sectionsOk).length,
    labelled: rows.filter((n) => n.depth.labelled).length,
  };
});
const depthLine = measured.length
  ? `depth: ${perBand
      .filter((p) => p.notes)
      .map((p) => `${p.band} ${p.both} of ${p.notes}`)
      .join(", ")} meet their band's floor (structure ${perBand.reduce((a, p) => a + p.structure, 0)}, sections ${perBand.reduce((a, p) => a + p.sections, 0)}, labelled ${perBand.reduce((a, p) => a + p.labelled, 0)} of ${measured.length})${depthReport ? "" : "; run --depth for the report"}.`
  : "";

if (asJson) {
  console.log(
    JSON.stringify(
      {
        notes: notes.length,
        breaches: count,
        warnings: warnCount,
        allowed,
        staleAllowances: stale,
        findings: breached,
        warned,
        depth: measured.map((n) => ({ unit: n.unit, slug: n.slug, ...n.depth })),
        depthSummary: perBand,
      },
      null,
      2,
    ),
  );
} else {
  for (const n of breached) {
    console.log(`\n${n.unit}/${n.slug}`);
    for (const f of n.findings) console.log(`  ${f.check.padEnd(9)} ${f.detail}`);
  }
  if (warnCount) {
    console.log(`\nwarnings — examiner sources no trap answers yet (write the finding from the report, never invent one):`);
    for (const n of warned) for (const w of n.warnings) console.log(`  ${(n.unit + "/" + n.slug).padEnd(56)} ${w.detail}`);
  }
  if (depthReport) {
    console.log(`\ndepth report — the Depth standard (22 Sep 2026) in pipeline/prompts/author-topic.md; a shortfall is a warning until --depth-fatal:`);
    for (const n of measured) {
      const d = n.depth;
      const shortRows = [...d.rows, ...d.sectionRows].filter((r) => !r.ok);
      const status = d.structureOk && d.sectionsOk ? "meets the floor" : `${shortRows.length} short`;
      console.log(
        `\n${n.unit}/${n.slug}  ${d.band} (hardness ${d.hardness}, difficulty ${d.difficulty}) · ${status} · ${d.labelled ? "roles labelled" : "sections unlabelled"} · note ${d.minutes.note} min, learn ${d.minutes.learn} + sit ${d.minutes.sit} = about ${d.minutes.topic} min, slides ${d.minutes.cards} cards ≈ ${d.minutes.slides} min${d.drafts ? ` · drafts not counted: ${d.drafts}` : ""}`,
      );
      for (const r of d.rows) console.log(`  ${r.ok ? "ok   " : "short"} ${r.name}: ${r.value} (floor ${r.floor})${r.note ? ` — ${r.note}` : ""}`);
      for (const r of d.sectionRows) console.log(`  ${r.ok ? "ok   " : "short"} ${r.name}: ${r.value} (floor ${r.floor})${r.note ? ` — ${r.note}` : ""}`);
      for (const s of d.slides) console.log(`  slides   ${s}`);
      for (const s of d.figures) console.log(`  figures  ${s}`);
      for (const s of d.maths) console.log(`  maths    ${s}`);
    }
    console.log(`\nper band: ${perBand.filter((p) => p.notes).map((p) => `${p.band}: ${p.notes} notes, structure floor ${p.structure}, section floor ${p.sections}, both ${p.both}, labelled ${p.labelled}`).join(" | ")}`);
  }
  if (stale.length) {
    console.log(`\nallow-list entries for sources no topic cites any more (${ALLOW_FILE}):`);
    for (const s of stale) console.log(`  ${s}`);
  }
  const allowSaid = allowed.length ? `, ${allowed.length} allowed` : "";
  console.log(
    count === 0
      ? `\nlesson-v2: ${notes.length} note(s) checked, 0 breaches${warnCount ? `, ${warnCount} warning(s)` : ""}${allowSaid}.`
      : `\nlesson-v2: ${count} breach(es) in ${breached.length} of ${notes.length} note(s)${warnCount ? `, plus ${warnCount} warning(s)` : ""}${allowSaid}.`,
  );
  if (depthLine) console.log(depthLine);
}
process.exit(count ? 1 : 0);
