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
 *               (the fatal "≤ 120 words between gates" check was retired on 27 Sep 2026 with the teach-first case:
 *               a section is now explain → See it → Your turn, and its measures are the `see` warnings below)
 *   callouts    at least one `why` in the body, at most one `examiner` in the body
 *   recap       a "You can now" card before the closing section
 *   panel       the closing "In the exam" block is a pointer: one heading, one paragraph of
 *               ≤ 80 words, then the prompts — ≤ 150 words in all, no gate, no spec callout and
 *               no examiner callout (the Sheet and the Specification card carry those)
 *   prompts     the retrieval prompts, if the note wires any, come last, after the closing section (a note may
 *               wire none: "0–2 in every band", 27 Sep 2026)
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
 *   teach       teach → show → check (the owner's ruling of 24 Sep 2026, STANDARDS.md "Teach before
 *               you check"): every gate in the body follows, within its own section, at least one
 *               block that explains the idea and at least one that shows it worked (the definitions
 *               are in scripts/qa/teach-show-check.mjs). A gate that comes first is a WARNING (one
 *               summary line by default, the list with --teach or --depth) until --teach-fatal. No
 *               card count decides where a check goes (27 Sep 2026), so the report never asks for a
 *               gate every so many cards; the longest run between gates is printed as cards, never gated.
 *   prompts-few retrieval prompts are few, optional and short (the owner's verdict of 24 Sep 2026,
 *               23:40, and his answer 3 of 27 Sep): a note wires at most two, no shipped prompt expects
 *               an answer of more than 25 words or a numbered list or carries an examiner's finding, and no
 *               wired prompt asks a question of more than 15 words, a fraction or a formula counting as one
 *               word (scripts/qa/prompt-few.mjs). A WARNING (the list with --prompts or
 *               --depth) until --prompts-fatal. The summary line also reports, never warns, the answers
 *               over the 12-word target. The depth row "prompts embedded in the note" reads 0–2 in every
 *               band, and "retrieval prompts" 1–8 in the bundle.
 *   see         Lesson structure v3 (the teach-first case §8.4, approved 27 Sep 2026; the shapes in
 *               docs/plan/review/2026-09-27-see-it-block-shape.md): every gate follows a See it in its
 *               section; the topic's first check follows the first See it and is no interface warm-up; at
 *               most 225 words and three blocks of explanation before a section's See it; a section ends in
 *               its Your turn (two only after two variants; a "See it done" heading opens its own stretch); a
 *               video or a sim is never a section's only See it; a choice gate's explanation never names an
 *               option by its place (read by src/lib/gate-order.ts positionalWording, as the app and the build
 *               read it); a Your turn's answer is not printed in its own section's See it; a gate's
 *               re-teaching is at most 60 words; a twin never repeats its gate's prompt or answer; a See it
 *               block's reasons ≤ 40 words,
 *               balanced $, marks from the subject's mark language, no whyMenu (scripts/qa/see-it.mjs; the
 *               shape rules the renderer needs are refused by the build, content-lint.ts). WARNINGS (the
 *               list with --see or --depth) until --see-fatal. The depth row "see it" counts the sections
 *               that end in a gate and hold a See it before it, and the minute model counts 15 s a step.
 *   minutes     the pack's hero.minutes against the minutes the app prints for the lesson (src/lib/slides/minutes.ts
 *               lessonMinutesFor, Read: the hero line, the track and the Contents), read through
 *               scripts/qa/lesson-model.mjs. REPORT ONLY (the lead's ruling of 29 Sep 2026, 18:00): the content build
 *               ships the model's number in the hero (src/lib/build/hero-minutes.ts), so the line counts the authored
 *               numbers the build replaces; --minutes (or --depth) lists them. The depth report's minutes are the
 *               model's too (Read, Slides, and the later stages at its rates); lesson-v2's own estimate was retired
 *               on 29 Sep 2026. The fatal hero check (a minute estimate of at least 5) still reads the pack's number.
 *   recall      a prompt the note wires (a `prompt` block) that the lesson leaves out, with the reason
 *               src/lib/slides/recall.ts gives (recallFit: an explanation, a list, two things at once, a picture, an
 *               answer over 12 words), or because the bundle does not ship it, or because two lighter ones are kept
 *               (shownPrompts, THE rule for Read and Slides). A prompts WARNING (the list with --prompts) until
 *               --prompts-fatal, except a prompt that fits and loses to two lighter ones (listed only: the "wires more
 *               than two" warning carries it); the migrated notes (with a See it) that keep no recall card are listed,
 *               report only.
 *   figures     the figure-label floor (12.5 px on a phone) and the prose-as-picture check read the note's figures and
 *               the bundle's, withdrawn items left out (shingles-allow.mjs withoutWithdrawn; 29 Sep 2026).
 *
 * Per-unit defaults (scripts/qa/lesson-v2.fatal.json): a unit may make the teach, prompts, withdrawn or see
 * warnings breaches by default, as its migration to v3 lands ({ "fm1": { "teach": true, … } }); a unit with
 * "list": true gets its per-topic list printed on every run until then.
 *
 * --unit <id>     check one unit only (m3, fm1, b1 …); may be repeated
 * --traps-fatal   count an unanswered examiner source as a breach rather than a warning
 * --depth         print the depth report note by note (band, each measure against its floor)
 * --depth-fatal   count a depth shortfall as a breach rather than a warning
 * --teach         print every gate that comes before its section explains and shows the idea
 * --teach-fatal   count such a gate as a breach rather than a warning
 * --prompts       print every note that wires more than two prompts and every over-long prompt answer
 * --prompts-fatal count those as breaches rather than warnings
 * --withdrawn     print every topic's withdraw-and-replace records and their problems (scripts/qa/withdrawn.mjs; a
 *                 replacedBy chain is followed with the app's resolver, src/lib/review/withdrawn.ts resolveCardId, and
 *                 must end in an item that ships)
 * --withdrawn-fatal count a withdrawn-record problem as a breach rather than a warning
 * --see           print every note's v3 structure findings (See it, first check, explanation length, Your turn,
 *                 video, option by its place, answer printed in the See it, See it block problems), then one
 *                 readiness line per topic: "ready" or the reasons it is not (src/lib/slides/readiness.ts)
 * --see-fatal     count those as breaches rather than warnings
 * --minutes       print every note whose authored hero.minutes differs from the app's minute model (the build ships the model's)
 * --json          print the findings as JSON for an author's generator (the depth rows under `depth`,
 *                 the teach → show → check failures under `teach`, the prompt findings under `prompts`,
 *                 the v3 structure findings under `see`, the per-unit lists under `unitLists`)
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { SEE_HEADING, describeFailure, inlineMaths, teachShowCheck } from "./teach-show-check.mjs";
import { ANSWER_TARGET, ANSWER_WORDS, QUESTION_WORDS, WIRED_MAX, promptFindings, promptTargets } from "./prompt-few.mjs";
import { withdrawnFindings } from "./withdrawn.mjs";
import { EXPLAIN_MAX, markCodes, seeItFindings } from "./see-it.mjs";
import { heroMinutesFinding, recallFindings } from "./lesson-model.mjs";
import { withoutWithdrawn } from "./shingles-allow.mjs";

// The app's own TypeScript rules, read as the build reads them (through tsx, so `node scripts/qa/lesson-v2.mjs` keeps
// working): the lesson readiness rule (src/lib/slides/readiness.ts lessonReadiness, the one the build writes into the
// manifest) and gate-order's positional reader (src/lib/gate-order.ts positionalWording, the one the app pins gates by
// and the build's GATE warning uses). Both tsx hooks are needed: the ESM one for the dynamic imports, the CJS one for
// the "@/…" paths inside them.
(await import("tsx/esm/api")).register();
(await import("tsx/cjs/api")).register();
const { lessonReadiness } = await import("../../src/lib/slides/readiness.ts");
const { positionalWording } = await import("../../src/lib/gate-order.ts");
// the build's size rule (the lead's item 16), read from the build's own lint so the two never differ
const { sizeWarnings, SIZE_LIMITS_KB } = await import("../../src/components/items/content-lint.ts");
// the app's minute model and recall-card rule (the lead's items e and f, 29 Sep 2026): the minutes the hero line prints
// (src/lib/slides/minutes.ts lessonMinutesFor, and the after-lesson stage minutes the topic page prints) and the prompts a
// lesson keeps (src/lib/slides/recall.ts), read through scripts/qa/lesson-model.mjs
const minutesModel = await import("../../src/lib/slides/minutes.ts");
const recallModel = await import("../../src/lib/slides/recall.ts");
const { hasSeeBlock } = await import("../../src/lib/slides/readiness.ts");
// the app's own resolver of withdraw-and-replace chains (src/lib/review/withdrawn.ts resolveCardId, the one the review
// inbox follows), so a replacedBy chain is judged as the app follows it (the lead's ruling, 7 Oct 2026)
const { resolveCardId } = await import("../../src/lib/review/withdrawn.ts");

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const trapsFatal = argv.includes("--traps-fatal");
const depthReport = argv.includes("--depth");
const depthFatal = argv.includes("--depth-fatal");
const teachReport = argv.includes("--teach");
const teachFatal = argv.includes("--teach-fatal");
const promptsReport = argv.includes("--prompts");
const promptsFatal = argv.includes("--prompts-fatal");
const withdrawnReport = argv.includes("--withdrawn");
const withdrawnFatal = argv.includes("--withdrawn-fatal");
const seeReport = argv.includes("--see");
const seeFatal = argv.includes("--see-fatal");
const minutesReport = argv.includes("--minutes");
const units = argv.flatMap((a, i) => (a === "--unit" ? [String(argv[i + 1] || "").toLowerCase()] : []));

const ROOT = path.resolve("packs");

// ── per-unit defaults as each unit's v3 migration lands ──────────────────────────────────────
// scripts/qa/lesson-v2.fatal.json maps a unit to { teach, prompts, withdrawn, see, list }: a true flag makes that
// check's warnings breaches for the unit's notes without the command-line flag; "list": true prints the unit's
// per-topic list on every run (the coordinator's order of 27 Sep 2026: FM1 first, its three fatal flags on once the
// FM1 migration authors report, the list printed until then). Keys starting with "$" are comments. The environment
// variable LESSON_V2_DEFAULTS names another file, to try a flip before making it.
const FATAL_FILE = process.env.LESSON_V2_DEFAULTS || path.join("scripts", "qa", "lesson-v2.fatal.json");
const unitDefaults = fs.existsSync(FATAL_FILE) ? JSON.parse(fs.readFileSync(FATAL_FILE, "utf8")) : {};
const unitFlag = (unit, key) => unitDefaults[String(unit).toLowerCase()]?.[key] === true;

// ── the step mark codes of each subject (a See it's `earns`), read once ──────────────────────
const codesBySubject = new Map();
function codesFor(subject) {
  if (!codesBySubject.has(subject)) {
    const f = path.join(ROOT, subject, "exam-true", "mark-language.json");
    codesBySubject.set(subject, fs.existsSync(f) ? markCodes(JSON.parse(fs.readFileSync(f, "utf8"))) : []);
  }
  return codesBySubject.get(subject);
}

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
  return { subject: parts[parts.length - 5], unit: parts[parts.length - 3], slug: parts[parts.length - 2] };
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
  if (block.type === "gate" && block.twin) out.push(block.twin.prompt, block.twin.explain, ...(block.twin.options ?? []));
  if (block.type === "see") out.push(block.stem, block.finalAnswer, ...(Array.isArray(block.steps) ? block.steps.flatMap((s) => [s?.working, s?.decision]) : []));
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
// count practice items at those rungs. `rp` (the bundle's shipped retrieval prompts) was a minimum per band
// (4 / 6 / 8 / 10) until the teach-first case of 27 Sep 2026: now "as many as there are facts to carry, at most 8,
// each ≤ 25 words" in every band, so it is [1, 8] (the 25 words are prompt-few.mjs's). `embedded` (the prompts the
// note wires) was a floor of 3–5 until the owner's verdict of 24 Sep 2026 (few, optional, short), then 1–2, and
// since 27 Sep 0 to WIRED_MAX in every band: a note may wire none.
const RP = [1, 8];
const FLOOR = {
  L: { sections: 4, gates: 5, words: [450, 750], variants: 1, whySection: false, twists: 0, further: false, recap: [3, 5], visuals: 3, we: 1, practice: [6, 9], d4: 0, d5: 0, tail: 0, tailOnly: 0, exam: 1, multi: 0, synoptic: null, ftm: 1, rp: RP, embedded: [0, WIRED_MAX], pre: 3, post: 1 },
  S: { sections: 6, gates: 7, words: [600, 950], variants: 2, whySection: false, twists: 2, further: false, recap: [3, 5], visuals: 4, we: 2, practice: [8, 10], d4: 1, d5: 0, tail: 3, tailOnly: 0, exam: 2, multi: 1, synoptic: null, ftm: 2, rp: RP, embedded: [0, WIRED_MAX], pre: 3, post: 3 },
  H4: { sections: 8, gates: 10, words: [850, 1300], variants: 3, whySection: true, twists: 3, further: true, recap: [4, 5], visuals: 6, we: 3, practice: [12, 16], d4: 3, d5: 1, tail: 4, tailOnly: 1, exam: 4, multi: 2, synoptic: [3, 8], ftm: 3, rp: RP, embedded: [0, WIRED_MAX], pre: 3, post: 5 },
  H5: { sections: 10, gates: 12, words: [1000, 1600], variants: 4, whySection: true, twists: 4, further: true, recap: [4, 5], visuals: 7, we: 4, practice: [14, 18], d4: 5, d5: 2, tail: 5, tailOnly: 1, exam: 4, multi: 3, synoptic: [4, 10], ftm: 3, rp: RP, embedded: [0, WIRED_MAX], pre: 3, post: 6 },
};
// Only shipped items count, by the pipeline's rule (pipeline/build-content.mts): a log is found by the
// item's `verification` ref (worked examples, questions) or by `itemId` (diagnostics, find-the-mistake,
// prompts); no log, or a status outside this set, is a draft the app never ships.
const SHIPPABLE = new Set(["verified", "published"]);
/** A bundle's items of one kind that ship, by that rule (the app's minute model and recall rule are priced on these). */
const shippedOf = (bundle, key) =>
  (bundle?.[key] ?? []).filter((it) => {
    const logs = bundle.verification ?? [];
    const log = it.verification ? logs.find((l) => l.id === it.verification) : logs.find((l) => l.itemId === it.id);
    return SHIPPABLE.has(log?.status);
  });
const bandOf = (difficulty) => (difficulty <= 2 ? "L" : difficulty === 3 ? "S" : difficulty === 4 ? "H4" : "H5");

// Roles are authored on heading blocks (`role`). A note written before the standard has none, so
// the report guesses from the heading text — for the see/twists/further/derivation/why rows only —
// and says so; variants are never guessed, because a guessed variant would let an unlabelled note
// pass a floor it has not met.
const ROLES = ["idea", "why", "variant", "see", "twists", "further", "derivation", "recap", "pointer"];
const ROLE_GUESS = [
  ["recap", /^you can now$/i],
  ["pointer", /^in the exam$/i],
  ["see", SEE_HEADING], // shared with teach-show-check.mjs, so the two scripts agree on a see section
  ["twists", /\btwist|\bdisguis|\bthe ways the paper\b|\bhow the paper asks\b|\bhow it is asked\b/i],
  ["further", /\bgoing further\b|\bbeyond the routine\b|\bthe hard end\b|\bharder end\b/i],
  ["derivation", /\bderiv|\bwhere .* comes? from\b|\bproof\b|\bprov(e|ing)\b|\bfrom first principles\b/i],
  ["why", /^why\b|\bwhy it works\b|\bwhy .* works\b/i],
];
const guessRole = (text) => ROLE_GUESS.find(([, re]) => re.test(String(text ?? "")))?.[0] ?? null;

// Slides-readiness (decision 9): one idea per block, headings as card titles, captions that stand
// alone, no two visuals back to back. No card count decides where a check goes (the teach-first case,
// 27 Sep 2026, replacing "a gate at most every four cards"): where a gate may stand is the teach → show →
// check rule (teach-show-check.mjs) and the v3 structure (see-it.mjs). The longest run of cards between
// gates (a See it is one card) is still measured and shown in the minutes line, for information.
const CARD_WORDS = 75;
const TITLE_WORDS = 8;
const CAPTION_WORDS = 25;

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
    // inline segments only: display maths ($$…$$, \[…\]) scrolls rather than clips, and is the standard's fix for a
    // long line (the old pattern read the inside of $$…$$ as an inline segment; C2 E author, 25 Sep 2026)
    for (const tex of inlineMaths(s)) {
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

/**
 * The depth measures for one note and its bundle, against the band's floor; `see` is the note's seeItFindings, `model` its
 * lessonMinutesFor result (src/lib/slides/minutes.ts) and `keptRecall` the recall cards its lesson keeps (recall.ts).
 */
function depthOf(blocks, bundle, see, model, keptRecall) {
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
  // The See it row (27 Sep 2026, the teach-first case): "a `see` block in every section that ends in a gate; one per
  // variant for H bands". It replaces the "See it done" row, which counted see sections, a video followed by a gate and
  // variant sections with two worked lines; those forms still count as shown for teach → show → check while notes
  // migrate, but only a `see` block is a See it.
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

  // minutes by the app's own model (src/lib/slides/minutes.ts; the lead's item e, 29 Sep 2026): the lesson as the hero
  // line prints it (Read) and as Slides prints it, then the topic page's later stages at the model's own rates (a worked
  // example 2 minutes, a check item 1, a practice or exam mark 1.2, a find-the-mistake item 2, and a prompt the lesson
  // leaves out 1, as "Say it from memory"), with the exam-style set sat apart. lesson-v2's own estimate (words ÷ 180,
  // 40 s a gate, 15 s a See it step, 20 s a card) is gone: the lint prints the numbers she sees.
  const seeSteps = see?.seeSteps ?? 0;
  const noteMinutes = model.read.minutes;
  const stage = (n, minutesFor) => (n > 0 ? minutesFor(n) : 0);
  const loosePrompts = Math.max(0, prompts.length - (keptRecall ?? 0));
  const learnMinutes =
    noteMinutes +
    stage(workedExamples.length, minutesModel.minutesForExamples) +
    stage(Math.min(4, dxItems), minutesModel.minutesForCheckItems) +
    stage(pMarks, minutesModel.minutesForMarks) +
    stage(Math.max(0, dxItems - 4), minutesModel.minutesForCheckItems) +
    stage(findTheMistake.length, minutesModel.minutesForMistakes) +
    stage(loosePrompts, minutesModel.minutesForCheckItems);
  const sitMinutes = stage(eMarks, minutesModel.minutesForMarks);
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
  row(
    "retrieval prompts",
    prompts.length,
    prompts.length >= floor.rp[0] && prompts.length <= floor.rp[1],
    `${floor.rp[0]}–${floor.rp[1]}, each ≤ ${ANSWER_WORDS} words`,
    prompts.length > floor.rp[1] ? `${prompts.length - floor.rp[1]} over: as many as there are facts to carry, at most ${floor.rp[1]} (withdraw the rest, never delete)` : undefined,
  );
  // No floor (a note may wire none); the ceiling of two is the prompts-few warning's business (its own summary
  // line), so a note over it is not counted short of the depth floor twice over.
  row(
    "prompts embedded in the note",
    embedded,
    embedded >= floor.embedded[0],
    `${floor.embedded[0]}–${floor.embedded[1]}`,
    embedded > floor.embedded[1] ? `${embedded - floor.embedded[1]} over the ceiling: unwire the rest (prompts-few warning; at most two recall cards, the owner, 27 Sep)` : undefined,
  );
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
  const gated = see?.gatedSections ?? 0;
  const gatedWithSee = see?.gatedSectionsWithSee ?? 0;
  const variantsShort = isH && (see?.variantsWithSee ?? 0) < (see?.variantSections ?? 0);
  srow(
    "see it",
    `${gatedWithSee} of ${gated} gated sections`,
    gated > 0 && gatedWithSee === gated && !variantsShort,
    isH ? "a See it in every section that ends in a gate; one per variant" : "a See it in every section that ends in a gate",
    [
      see?.seeBlocks ? `${see.seeBlocks} See it block(s), ${see.seeSteps} steps` : "no See it blocks yet",
      variantsShort ? `${see.variantsWithSee} of ${see.variantSections} variant sections hold one` : "",
    ]
      .filter(Boolean)
      .join("; "),
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
    if (b.type === "p" || b.type === "callout" || b.type === "see" || VISUAL.has(b.type)) {
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
  const slidesMinutes = model.slides.minutes;
  const slides = [];
  if (overCard.length) slides.push(`${overCard.length} block(s) over ${CARD_WORDS} words (one idea per card): ${overCard.slice(0, 2).map((b) => `"${short(String(b.md), 40)}"`).join(", ")}`);
  if (longTitles.length) slides.push(`${longTitles.length} heading(s) over ${TITLE_WORDS} words: ${longTitles.slice(0, 2).map((b) => `"${short(String(b.text), 40)}"`).join(", ")}`);
  if (consecutiveVisuals) slides.push(`${consecutiveVisuals} visual(s) back to back`);
  if (noCaption) slides.push(`${noCaption} figure(s) without a caption`);
  if (longCaptions) slides.push(`${longCaptions} caption(s) over ${CAPTION_WORDS} words`);
  if (untitledCallouts) slides.push(`${untitledCallouts} callout(s) without a title`);

  // figures: note figures and the bundle's own SVGs
  const noteFigures = blocks.map((b, i) => ({ where: `note#${i}`, svg: b.type === "figure" && b.svg ? b.svg : null })).filter((f) => f.svg);
  // Withdrawn items are not measured (the lead's item g, 29 Sep 2026): a withdrawn item stays byte-identical in the pack
  // by rule and never ships, so a label-size line against its figure asks for an edit that must not be made. The rule is
  // shingles-allow.mjs withoutWithdrawn, as figure-leaks and shingles read it.
  const live = withoutWithdrawn(bundle);
  const bundleFigures = [];
  for (const q of live.questions ?? []) for (const f of q.figures ?? []) if (f.kind === "svg") bundleFigures.push({ where: q.id, svg: decodeFigure(f.src) });
  for (const we of live.workedExamples ?? []) {
    if (we.figure?.kind === "svg") bundleFigures.push({ where: we.id, svg: decodeFigure(we.figure.src) });
    if (we.twin?.figure?.kind === "svg") bundleFigures.push({ where: `${we.id} twin`, svg: decodeFigure(we.twin.figure.src) });
  }
  for (const d of live.diagnostics ?? []) for (const it of d.items ?? []) if (it.figure?.kind === "svg") bundleFigures.push({ where: `${d.id}/${it.id}`, svg: decodeFigure(it.figure.src) });
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
    minutes: { note: noteMinutes, learn: learnMinutes, sit: sitMinutes, topic: topicMinutes, slides: slidesMinutes, cards: cards + closingCards, longestRun: maxCards, seeSteps },
  };
}

// ── the checks ───────────────────────────────────────────────────────────────────────────────
function checkNote(file, orphans) {
  const { subject, unit, slug } = idOf(file);
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

  // the teaching body, up to the recap card. Its sections are measured by see-it.mjs (explain → See it → Your turn,
  // at most 225 words of explanation before a See it), a warning below; the fatal "≤ 120 words between gates" that
  // stood here until 27 Sep 2026 forced a gate every 120 words, which the teach-first case retired.
  const body = blocks.slice(0, recapAt >= 0 ? recapAt : panelAt >= 0 ? panelAt : blocks.length);

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

  // the prompts, if any, close the note (a note may wire none since 27 Sep 2026: "0–2 in every band")
  const promptIdx = blocks.map((b, i) => (b.type === "prompt" ? i : -1)).filter((i) => i >= 0);
  if (promptIdx.length && promptIdx[promptIdx.length - 1] !== blocks.length - 1) fail("prompts", "the retrieval prompts are not last");
  else if (promptIdx.length && panelAt >= 0 && promptIdx[0] < panelAt) fail("prompts", "a retrieval prompt sits before the closing section");

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

  // Lesson structure v3 (see-it.mjs): warnings unless --see-fatal or the unit's default
  const see = seeItFindings(blocks, { codes: codesFor(subject), bundle, positional: positionalWording });
  // Lesson readiness, as the build decides it (the raw bundle with its note blocks; readiness reads the note's own log)
  const readiness = bundle ? lessonReadiness({ note: bundle.note, noteBlocks: blocks, verification: bundle.verification }) : lessonReadiness(null);
  // sizes over the build's limits (content-lint.ts sizeWarnings): a warning line each, printed under the summary
  const sizes = sizeWarnings(bundle, blocks, `${unit}/${slug}`);
  // the app's minute model and recall rule, priced on what ships (the build's rule), as the topic page prices them
  const shippedPrompts = bundle ? shippedOf(bundle, "prompts") : [];
  const model = minutesModel.lessonMinutesFor({ blocks, workedExamples: bundle ? shippedOf(bundle, "workedExamples") : [], prompts: shippedPrompts, topicId: bundle?.topic?.id ?? null });
  // the pack's hero.minutes against the model's Read minutes: report only, since the build ships the model's number
  // (src/lib/build/hero-minutes.ts; the lead's ruling, 29 Sep 2026, 18:00)
  const heroMinutes = heroMinutesFinding(blocks, model, minutesModel);
  // a wired prompt the lesson leaves out, with recall.ts's reason: a prompts warning (lesson-model.mjs). One that fits but
  // loses to two lighter ones is listed, never warned: the "wires more than two" warning already carries it.
  const recall = recallFindings(blocks, { shipped: shippedPrompts, all: bundle?.prompts ?? [], logs: bundle?.verification ?? [] }, recallModel);
  for (const f of recall.leftOut) if (f.kind !== "over") say.push({ check: "prompts", detail: f.detail, few: true });
  for (const f of see.findings) say.push({ check: "see", detail: f.detail, v3: true });

  // the depth floor: warnings unless --depth-fatal
  const depth = bundle ? depthOf(blocks, bundle, see, model, recall.kept.length) : null;
  if (depth) {
    for (const r of [...depth.rows, ...depth.sectionRows]) if (!r.ok) say.push({ check: "depth", detail: `${r.name} ${r.value} (floor ${r.floor})${r.note ? ` — ${r.note}` : ""}`, depth: true });
    for (const s of [...depth.slides, ...depth.figures, ...depth.maths]) say.push({ check: "depth", detail: s, depth: true });
  }

  // teach → show → check: warnings unless --teach-fatal
  const teach = teachShowCheck(blocks);
  for (const f of teach.failures) say.push({ check: "teach", detail: describeFailure(f), teach: true });

  // retrieval prompts few and short: warnings unless --prompts-fatal
  const prompts = bundle ? promptFindings(blocks, bundle) : [];
  for (const f of prompts) say.push({ check: "prompts", detail: f.detail, few: true });

  // withdraw-and-replace records (scripts/qa/withdrawn.mjs): warnings unless --withdrawn-fatal
  const withdrawn = bundle ? withdrawnFindings(blocks, bundle, { resolve: resolveCardId }) : { records: [], problems: [] };
  for (const p of withdrawn.problems) say.push({ check: "withdrawn", detail: `${p.id}: ${p.problem} (log ${p.log})`, wd: true });

  // the answers over the 12-word target: a report line, never a warning
  const targets = bundle ? promptTargets(blocks, bundle) : [];

  // a unit's defaults (lesson-v2.fatal.json) make its warnings breaches as its migration lands
  const fatal = {
    teach: teachFatal || unitFlag(unit, "teach"),
    prompts: promptsFatal || unitFlag(unit, "prompts"),
    withdrawn: withdrawnFatal || unitFlag(unit, "withdrawn"),
    see: seeFatal || unitFlag(unit, "see"),
  };
  const isWarning = (f) =>
    (f.check === "traps" && !trapsFatal) || (f.depth && !depthFatal) || (f.teach && !fatal.teach) || (f.few && !fatal.prompts) || (f.wd && !fatal.withdrawn) || (f.v3 && !fatal.see);
  return {
    subject,
    unit,
    slug,
    file: path.relative(process.cwd(), file),
    findings: say.filter((f) => !isWarning(f)),
    warnings: say.filter((f) => f.check === "traps" && !trapsFatal),
    depth,
    teach,
    prompts,
    targets,
    withdrawn,
    see,
    readiness,
    sizes,
    heroMinutes,
    minutes: { read: model.read.minutes, slides: model.slides.minutes, untimedVideos: model.untimedVideos },
    recall,
    migrated: hasSeeBlock(blocks),
    fatal,
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

// teach → show → check, over every note checked
const teachGates = notes.reduce((a, n) => a + n.teach.gates, 0);
const teachFailing = notes.filter((n) => n.teach.failures.length);
const teachCount = teachFailing.reduce((a, n) => a + n.teach.failures.length, 0);
const teachLine = `teach → show → check: ${teachGates - teachCount} of ${teachGates} gates come after their section explains and shows the idea; ${teachCount} in ${teachFailing.length} of ${notes.length} notes come before${teachFatal ? "" : " (warnings; --teach-fatal makes them breaches)"}${teachReport || depthReport || !teachCount ? "" : "; run --teach for the list"}.`;

// retrieval prompts few and short, over every note checked
const promptNotes = notes.filter((n) => n.prompts.length);
const wiredOver = notes.filter((n) => n.prompts.some((f) => f.kind === "wired")).length;
const longAnswers = notes.reduce((a, n) => a + n.prompts.filter((f) => f.kind === "long").length, 0);
const longWired = notes.reduce((a, n) => a + n.prompts.filter((f) => f.kind === "long" && f.wired).length, 0);
const numberedAnswers = notes.reduce((a, n) => a + n.prompts.filter((f) => f.kind === "numbered").length, 0);
const longQuestions = notes.reduce((a, n) => a + n.prompts.filter((f) => f.kind === "question").length, 0);
const examinerPrompts = notes.reduce((a, n) => a + n.prompts.filter((f) => f.kind === "examiner").length, 0);
const overTarget = notes.reduce((a, n) => a + n.targets.length, 0);
const overTargetWired = notes.reduce((a, n) => a + n.targets.filter((t) => t.wired).length, 0);
const promptsLine = `retrieval prompts: ${wiredOver} of ${notes.length} notes wire more than ${WIRED_MAX}; ${longAnswers} shipped prompt(s) expect an answer over ${ANSWER_WORDS} words (${longWired} of them wired); ${numberedAnswers} expect a numbered list; ${examinerPrompts} carry an examiner's finding; ${longQuestions} wired prompt(s) ask a question over ${QUESTION_WORDS} words${promptsFatal ? "" : " (warnings; --prompts-fatal makes them breaches)"}; report only: ${overTarget} shipped answer(s) over the ${ANSWER_TARGET}-word target (${overTargetWired} wired)${promptsReport || depthReport || !promptNotes.length ? "" : "; run --prompts for the list"}.`;

// Lesson structure v3, over every note checked
const seeKinds = ["see-missing", "first-check", "explain-long", "explain-blocks", "turn-last", "turns", "video", "option-position", "answer-shown", "reteach", "twin", "block"];
const readyNotes = notes.filter((n) => n.readiness.ready);
const seeCount = Object.fromEntries(seeKinds.map((k) => [k, notes.reduce((a, n) => a + n.see.findings.filter((f) => f.kind === k).length, 0)]));
const seeNotes = notes.filter((n) => n.see.findings.length);
const seeGates = notes.reduce((a, n) => a + n.see.gates, 0);
const seeAfter = notes.reduce((a, n) => a + n.see.gatesAfterSee, 0);
const seeBlocksAll = notes.reduce((a, n) => a + n.see.seeBlocks, 0);
const notesWithSee = notes.filter((n) => n.see.seeBlocks).length;
const firstOk = notes.filter((n) => n.see.firstCheck === true).length;
const seeFindingsAll = seeKinds.reduce((a, k) => a + seeCount[k], 0);
const seeLine = `see it (v3): ${seeAfter} of ${seeGates} gates follow a See it in their section; ${seeBlocksAll} See it block(s) in ${notesWithSee} of ${notes.length} notes; the first check follows a See it in ${firstOk} of ${notes.length} notes; ${seeCount["explain-long"]} section(s) over ${EXPLAIN_MAX} words of explanation and ${seeCount["explain-blocks"]} with more than three explanation blocks; ${seeCount["turn-last"]} Your turn(s) with more of their section after them; ${seeCount.turns} section(s) with more than two; ${seeCount.video} video(s) or sim(s) as a section's only See it or before it; ${seeCount["option-position"]} gate explanation(s) name an option by its place; ${seeCount["answer-shown"]} Your turn(s) whose answer its See it prints; ${seeCount.reteach} over 60 words; ${seeCount.twin} twin(s) repeating their gate; ${seeCount.block} See it block problem(s)${seeFatal ? "" : " (warnings; --see-fatal makes them breaches)"}${seeReport || depthReport || !seeFindingsAll ? "" : "; run --see for the list"}.`;

// hero.minutes against the app's minute model (the lead's item e), and the wired prompts the lesson leaves out (item f)
const minutesOff = notes.filter((n) => n.heroMinutes);
const minutesLine = `minutes: ${minutesOff.length} of ${notes.length} notes' authored hero.minutes differ from the model (src/lib/slides/minutes.ts lessonMinutesFor, Read); the build ships the model's number (src/lib/build/hero-minutes.ts); report only${minutesReport || depthReport || !minutesOff.length ? "" : "; run --minutes for the list"}.`;
const leftOut = notes.flatMap((n) => n.recall.leftOut.map((f) => ({ ...f, unit: n.unit, slug: n.slug })));
const leftOutKinds = Object.fromEntries(["unfit", "unshipped", "over"].map((k) => [k, leftOut.filter((f) => f.kind === k).length]));
const migratedNotes = notes.filter((n) => n.migrated);
const noRecall = migratedNotes.filter((n) => n.recall.kept.length === 0);
const recallLine = `recall cards: ${leftOut.length} wired prompt(s) in ${new Set(leftOut.map((f) => `${f.unit}/${f.slug}`)).size} note(s) are left out of the lesson (src/lib/slides/recall.ts): ${leftOutKinds.unfit} fail recallFit and ${leftOutKinds.unshipped} do not ship${promptsFatal ? "" : " (prompts warnings; --prompts-fatal makes them breaches)"}; report only: ${leftOutKinds.over} fit but lose to two lighter ones (the "wire more than 2" count above carries them), and ${noRecall.length} of ${migratedNotes.length} migrated notes (with a See it) keep no recall card${promptsReport || !(leftOut.length || noRecall.length) ? "" : "; run --prompts for the list"}.`;

// the per-topic lists of units migrating to v3 (lesson-v2.fatal.json "list": true), printed until their defaults are on
const listUnits = [...new Set(notes.map((n) => n.unit))].filter((u) => unitFlag(u, "list"));
const unitLists = Object.fromEntries(
  listUnits.map((u) => [
    u,
    notes
      .filter((n) => n.unit === u)
      .map((n) => ({
        slug: n.slug,
        gates: n.teach.gates,
        teachFailing: n.teach.failures.length,
        // the prompts family as the unit's "prompts" flag would count it: prompt-few's findings and the wired prompts the
        // lesson leaves out (unfit or unshipped)
        prompts: n.prompts.length + n.recall.leftOut.filter((f) => f.kind !== "over").length,
        withdrawnProblems: n.withdrawn.problems.length,
        gatesAfterSee: n.see.gatesAfterSee,
        seeBlocks: n.see.seeBlocks,
        firstCheck: n.see.firstCheck === true,
        see: Object.fromEntries(seeKinds.map((k) => [k, n.see.findings.filter((f) => f.kind === k).length])),
        fatal: n.fatal,
      })),
  ]),
);

// withdraw-and-replace records, over every note checked
const wdNotes = notes.filter((n) => n.withdrawn.records.length || n.withdrawn.problems.length);
const wdRecords = notes.reduce((a, n) => a + n.withdrawn.records.length, 0);
const wdProblems = notes.reduce((a, n) => a + n.withdrawn.problems.length, 0);
const withdrawnLine = `withdrawn: ${wdRecords} record(s) in ${wdNotes.length} topic(s); ${wdProblems} problem(s)${withdrawnFatal ? "" : " (warnings; --withdrawn-fatal makes them breaches)"}${withdrawnReport || !wdNotes.length ? "" : "; run --withdrawn for the list"}.`;

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
        teach: teachFailing.map((n) => ({ unit: n.unit, slug: n.slug, file: n.file, gates: n.teach.gates, failures: n.teach.failures })),
        teachSummary: { gates: teachGates, failing: teachCount, notes: teachFailing.length },
        prompts: promptNotes.map((n) => ({ unit: n.unit, slug: n.slug, file: n.file, findings: n.prompts })),
        promptsSummary: { notes: notes.length, wiredOver, wiredMax: WIRED_MAX, longAnswers, longWired, answerWords: ANSWER_WORDS, numberedAnswers, longQuestions, questionWords: QUESTION_WORDS, overTarget, overTargetWired, answerTarget: ANSWER_TARGET },
        see: seeNotes.map((n) => ({ unit: n.unit, slug: n.slug, file: n.file, gates: n.see.gates, gatesAfterSee: n.see.gatesAfterSee, seeBlocks: n.see.seeBlocks, firstCheck: n.see.firstCheck, findings: n.see.findings })),
        seeSummary: { gates: seeGates, gatesAfterSee: seeAfter, seeBlocks: seeBlocksAll, notesWithSee, firstCheckOk: firstOk, notes: notes.length, ready: readyNotes.length, ...seeCount },
        readiness: notes.map((n) => ({ unit: n.unit, slug: n.slug, ready: n.readiness.ready, via: n.readiness.via, reasons: n.readiness.reasons })),
        sizes: notes.flatMap((n) => n.sizes),
        minutes: notes.map((n) => ({ unit: n.unit, slug: n.slug, ...n.minutes, stated: n.heroMinutes?.stated ?? null, work: n.heroMinutes?.work ?? null, finding: n.heroMinutes?.detail ?? null })),
        minutesSummary: { notes: notes.length, differ: minutesOff.length, shipped: "model" },
        recall: notes.filter((n) => n.recall.wired.length || n.migrated).map((n) => ({ unit: n.unit, slug: n.slug, migrated: n.migrated, wired: n.recall.wired, kept: n.recall.kept, leftOut: n.recall.leftOut })),
        recallSummary: { leftOut: leftOut.length, ...leftOutKinds, migrated: migratedNotes.length, migratedWithNoRecall: noRecall.length },
        unitLists,
        withdrawn: wdNotes.map((n) => ({ unit: n.unit, slug: n.slug, file: n.file, records: n.withdrawn.records, problems: n.withdrawn.problems })),
        withdrawnSummary: { records: wdRecords, topics: wdNotes.length, problems: wdProblems },
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
        `\n${n.unit}/${n.slug}  ${d.band} (hardness ${d.hardness}, difficulty ${d.difficulty}) · ${status} · ${d.labelled ? "roles labelled" : "sections unlabelled"} · Read ${d.minutes.note} min, Slides ${d.minutes.slides} min (src/lib/slides/minutes.ts), learn ${d.minutes.learn} + sit ${d.minutes.sit} = about ${d.minutes.topic} min${d.drafts ? ` · drafts not counted: ${d.drafts}` : ""}`,
      );
      for (const r of d.rows) console.log(`  ${r.ok ? "ok   " : "short"} ${r.name}: ${r.value} (floor ${r.floor})${r.note ? ` — ${r.note}` : ""}`);
      for (const r of d.sectionRows) console.log(`  ${r.ok ? "ok   " : "short"} ${r.name}: ${r.value} (floor ${r.floor})${r.note ? ` — ${r.note}` : ""}`);
      for (const s of d.slides) console.log(`  slides   ${s}`);
      for (const s of d.figures) console.log(`  figures  ${s}`);
      for (const s of d.maths) console.log(`  maths    ${s}`);
      const t = n.teach;
      console.log(`  ${t.failures.length ? "short" : "ok   "} teach → show → check: ${t.gates - t.failures.length} of ${t.gates} gates after their section explains and shows the idea (longest run between gates ${d.minutes.longestRun} cards, reported, never gated; See it steps ${d.minutes.seeSteps} at 15 s)`);
      for (const f of t.failures) console.log(`  teach    ${describeFailure(f)}`);
      for (const f of n.prompts) console.log(`  prompts  ${f.detail}`);
      for (const f of n.recall.leftOut) console.log(`  prompts  ${f.detail}`);
      if (n.heroMinutes) console.log(`  minutes  ${n.heroMinutes.detail}`);
      for (const f of n.see.findings) console.log(`  see      ${f.detail}`);
    }
    console.log(`\nper band: ${perBand.filter((p) => p.notes).map((p) => `${p.band}: ${p.notes} notes, structure floor ${p.structure}, section floor ${p.sections}, both ${p.both}, labelled ${p.labelled}`).join(" | ")}`);
  }
  if (teachReport && teachCount) {
    console.log(`\nteach → show → check — gates that come before their section explains the idea and shows it worked (the owner's ruling, 24 Sep 2026):`);
    for (const n of teachFailing) {
      console.log(`\n${n.unit}/${n.slug}  ${n.teach.failures.length} of ${n.teach.gates} gates`);
      for (const f of n.teach.failures) console.log(`  ${describeFailure(f)}`);
    }
  }
  if (promptsReport && (promptNotes.length || overTarget || leftOut.length)) {
    console.log(
      `\nretrieval prompts — few, optional and short (the owner's verdict of 24 Sep 2026 and his answer 3 of 27 Sep): at most ${WIRED_MAX} wired in a note, no answer over ${ANSWER_WORDS} words or written as a numbered list, no wired question over ${QUESTION_WORDS} words; answers over the ${ANSWER_TARGET}-word target are listed as "target", for information:`,
    );
    for (const n of notes.filter((x) => x.prompts.length || x.targets.length || x.recall.leftOut.length)) {
      console.log(`\n${n.unit}/${n.slug}`);
      for (const f of n.prompts) console.log(`  ${f.detail}${(f.kind === "long" || f.kind === "numbered") && !f.wired ? " (not wired; the review queue asks it)" : ""}`);
      for (const f of n.recall.leftOut) console.log(`  ${f.detail}${f.kind === "over" ? " (report only)" : ""}`);
      for (const tg of n.targets) console.log(`  target: prompt ${tg.id} expects ${tg.words} words (about ${ANSWER_TARGET} is the target)${tg.wired ? ", wired" : ""}`);
    }
  }
  if (promptsReport && noRecall.length) {
    console.log(`\nmigrated notes (with a See it) that keep no recall card (report only: a note may wire none, 27 Sep 2026; src/lib/slides/recall.ts shownPrompts):`);
    for (const n of noRecall) console.log(`  ${`${n.unit}/${n.slug}`.padEnd(58)} ${n.recall.wired.length ? `wires ${n.recall.wired.length}, keeps none` : "wires none"}`);
  }
  if (minutesReport && minutesOff.length) {
    console.log(`\nminutes — the pack's hero.minutes against the app's minute model (src/lib/slides/minutes.ts lessonMinutesFor, Read); the build ships the model's number, report only:`);
    for (const n of minutesOff) console.log(`  ${`${n.unit}/${n.slug}`.padEnd(58)} ${n.heroMinutes.detail}`);
  }
  if (seeReport && seeNotes.length) {
    console.log(`\nsee it (v3) — explain → See it → Your turn (the teach-first case, approved 27 Sep 2026; shapes in docs/plan/review/2026-09-27-see-it-block-shape.md):`);
    for (const n of seeNotes) {
      console.log(`\n${n.unit}/${n.slug}  ${n.see.gatesAfterSee} of ${n.see.gates} gates after a See it; ${n.see.seeBlocks} See it block(s)`);
      for (const f of n.see.findings) console.log(`  ${f.kind.padEnd(15)} ${f.detail}`);
    }
  }
  if (seeReport) {
    // one line per topic: the build's own readiness rule (src/lib/slides/readiness.ts), ready or why not
    console.log(`\nreadiness — Slides and Read v2 per topic (src/lib/slides/readiness.ts lessonReadiness, the rule the build writes into the manifest): ${readyNotes.length} of ${notes.length} ready`);
    for (const n of notes) console.log(`  ${`${n.unit}/${n.slug}`.padEnd(58)} ${n.readiness.ready ? `ready (${n.readiness.via})` : `not ready: ${n.readiness.reasons.join("; ")}`}`);
  }
  for (const u of listUnits) {
    const rows = unitLists[u];
    const on = ["teach", "prompts", "withdrawn", "see"].filter((k) => unitFlag(u, k));
    console.log(
      `\n${u} — the v3 migration, topic by topic (${FATAL_FILE}: ${on.length ? `${on.join(", ")} fatal by default` : "teach, prompts and withdrawn become fatal by default once the migration authors report"}):`,
    );
    for (const r of rows) {
      const s = r.see;
      console.log(
        `  ${r.slug.padEnd(48)} teach ${String(r.gates - r.teachFailing).padStart(2)}/${String(r.gates).padEnd(2)} · prompts ${r.prompts} · withdrawn ${r.withdrawnProblems} · See it ${r.gatesAfterSee}/${r.gates} gates, ${r.seeBlocks} block(s) · first check ${r.firstCheck ? "ok" : "NOT after a See it"} · long ${s["explain-long"] + s["explain-blocks"]} · run-on ${s["turn-last"] + s.turns} · video/sim ${s.video} · by-position ${s["option-position"]} · re-teach > 60 ${s.reteach} · twin ${s.twin} · block ${s.block}`,
      );
    }
  }
  if (withdrawnReport && wdNotes.length) {
    console.log(`\nwithdrawn — the withdraw-and-replace records (verification[].withdrawn: { id, kind, replacedBy, reason, on }), topic by topic:`);
    for (const n of wdNotes) {
      console.log(`\n${n.unit}/${n.slug}  ${n.withdrawn.records.length} record(s)${n.withdrawn.problems.length ? `, ${n.withdrawn.problems.length} problem(s)` : ""}`);
      for (const r of n.withdrawn.records) console.log(`  ${String(r.kind ?? "?").padEnd(14)} ${String(r.id).padEnd(34)} -> ${r.replacedBy ?? "(nothing)"}   ${String(r.on ?? "")}`);
      for (const p of n.withdrawn.problems) console.log(`  PROBLEM ${p.id}: ${p.problem} (log ${p.log})`);
    }
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
  console.log(teachLine);
  console.log(promptsLine);
  console.log(withdrawnLine);
  console.log(seeLine);
  console.log(minutesLine);
  console.log(recallLine);
  console.log(`readiness: ${readyNotes.length} of ${notes.length} topic(s) ready for Slides and Read v2 (src/lib/slides/readiness.ts)${seeReport ? "" : "; run --see for the reasons, topic by topic"}.`);
  const sizeLines = notes.flatMap((n) => n.sizes);
  console.log(`size: ${sizeLines.length} item(s) over the limits (a question, worked example or See it ${SIZE_LIMITS_KB.item} KB, a note ${SIZE_LIMITS_KB.note} KB, a bundle ${SIZE_LIMITS_KB.bundle} KB; warnings)${sizeLines.length ? ":" : "."}`);
  for (const l of sizeLines) console.log(`  ${l}`);
}
process.exit(count ? 1 : 0);
