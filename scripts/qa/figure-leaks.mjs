#!/usr/bin/env node
/**
 * scripts/qa/figure-leaks.mjs — run with `node scripts/qa/figure-leaks.mjs`.
 *
 * Does a figure print the answer to the part it illustrates?
 *
 * The brief's rule (pipeline/prompts/author-topic.md, "SVG paths must draw" and "Regression guard
 * for reviewed marking"): never print the answer to a question inside that question's own figure;
 * a figure that annotates the answer belongs to the note, and the question's copy of the same
 * figure is generated unannotated, with lettered or numbered pointers instead of names. The class
 * shipped in B1, B2 and C2 before any lint existed — the first marked question a new install saw
 * was "name the structure that provides support on the outside of the cell" beside a diagram with
 * "cellulose cell wall" printed on it, and one B2 figure leaked its answers through its <title>,
 * where only a screen-reader user would have found them.
 *
 * What it reads, for every part that carries a figure, in every bundle under packs/<subject>/content:
 *   the figure's visible text (<text>, <tspan>, <textPath>) and ALL of its accessible text — the
 *   <title> (including the one an aria-labelledby points at), <desc>, every aria-label, and the
 *   FigureSpec's own `alt` and `caption`, which is the only text an image or photo figure has.
 *
 * What it tests them against, for that part alone:
 *   every accepted spelling, every key-word group's `any` list, every `label` target's accepted
 *   spellings, the `order`/`steps` items, a `table` spec's cells, a numeric answer's own value,
 *   the text of the correct mcq option, and a text-long QWC answer's indicative points and their
 *   key words. Diagnostics (against the correct option), worked-example twins and find-the-mistake
 *   items are swept too, which the build's own warning does not reach.
 *
 * Two tiers, because not every shared word is a defect:
 *
 *   LEAK    the figure NAMES the answer — a text node, title or alt segment that IS the accepted
 *           answer, an mcq option, a label target, a pathway item or a printed value, or that is a
 *           key word where the part asks her to name or label the thing. This is the defect. Any
 *           leak exits 1.
 *   REVIEW  the figure shares a word with the answer but does not hand it over: a key word inside
 *           a longer sentence, or a name on a figure whose whole job is to name things (a food web
 *           has to name its organisms; a dichotomous key has to name the plants it keys out).
 *           Listed for a human, never fatal.
 *
 * A phrase the part's own stem already uses is never a leak: the figure is repeating the question.
 *
 * Usage:
 *   node scripts/qa/figure-leaks.mjs                  every subject, every unit
 *   node scripts/qa/figure-leaks.mjs --unit b1        one unit (repeatable)
 *   node scripts/qa/figure-leaks.mjs --subject science
 *   node scripts/qa/figure-leaks.mjs --json out.json  findings as JSON as well
 *   node scripts/qa/figure-leaks.mjs --quiet          counts only, no review list
 */
import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const units = [];
const subjects = [];
let jsonOut = null;
let quiet = false;
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === "--unit") units.push(String(argv[++i]).toLowerCase());
  else if (a === "--subject") subjects.push(String(argv[++i]).toLowerCase());
  else if (a === "--json") jsonOut = argv[++i];
  else if (a === "--quiet") quiet = true;
  else {
    console.error(`unknown argument: ${a}`);
    process.exit(2);
  }
}

const PACKS = path.resolve("packs");

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/** Lower case, unify dashes and quotes, drop punctuation, collapse spaces. */
function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    // Relational operators are part of the answer, not punctuation: without them the boundary label
    // "x = 3" on an inequalities figure reads as the answer "x > 3". One spelling each for ≥ and ≤.
    .replace(/[≥⩾]|>=|=>/g, ">=")
    .replace(/[≤⩽]|<=|=</g, "<=")
    .replace(/≠/g, "!=")
    .replace(/[^a-z0-9+\-./%'=<>!\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const stripTags = (s) => s.replace(/<[^>]*>/g, " ");

/** The SVG behind a figure: an inline string, or a data URI in utf8 or base64. */
function svgSource(src) {
  if (typeof src !== "string") return null;
  if (src.trim().startsWith("<svg")) return src;
  const m = /^data:image\/svg\+xml(;[^,]*)?,/.exec(src);
  if (!m) return null;
  const body = src.slice(m[0].length);
  if (/base64/i.test(m[1] ?? "")) {
    try {
      return Buffer.from(body, "base64").toString("utf8");
    } catch {
      return null;
    }
  }
  try {
    return decodeURIComponent(body);
  } catch {
    return body;
  }
}

/** Everything a learner can read or hear from a figure, tagged with the channel it came from. */
function figureChannels(fig) {
  const out = [];
  const push = (channel, text) => {
    const t = String(text ?? "").trim();
    if (t) out.push({ channel, text: t });
  };
  if (typeof fig.alt === "string") push("alt", fig.alt);
  if (typeof fig.caption === "string") push("caption", fig.caption);
  const svg = svgSource(fig.src ?? fig.svg);
  if (!svg) return out;
  for (const m of svg.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)) push("title", stripTags(m[1]));
  for (const m of svg.matchAll(/<desc\b[^>]*>([\s\S]*?)<\/desc>/gi)) push("desc", stripTags(m[1]));
  for (const m of svg.matchAll(/aria-label\s*=\s*(["'])(.*?)\1/gi)) push("aria-label", m[2]);
  for (const m of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)) push("text", stripTags(m[1]));
  for (const m of svg.matchAll(/<textPath\b[^>]*>([\s\S]*?)<\/textPath>/gi)) push("text", stripTags(m[1]));
  return out;
}

/** A short stable id, so one figure serving six parts is reported once. */
function figureId(fig) {
  const key = `${fig.kind}:${fig.src ?? fig.svg ?? ""}:${fig.alt ?? ""}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function figureName(fig) {
  const svg = svgSource(fig.src ?? fig.svg);
  const m = svg ? /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(svg) : null;
  const t = m ? stripTags(m[1]).trim() : String(fig.alt ?? "").trim();
  return t.length > 120 ? `${t.slice(0, 120)}…` : t || `(${fig.kind})`;
}

/**
 * The figure's text cut into the pieces a reader takes as one label: every text node is a piece,
 * and prose is cut at the punctuation that separates one named thing from the next, because
 * "… the cell membrane, cytoplasm, nucleus … labelled" is a list of labels read aloud.
 */
function pieces(text) {
  return String(text)
    .split(/[,;:.!?()—–+/|·→]|\band\b|\bwith\b|\bor\b|\bthen\b|\n/gi)
    .map((s) => norm(s))
    .filter(Boolean);
}

/** Words a label may wear without ceasing to name the thing. */
const TRIM = /^(?:the|a|an|this|each|one|its|shows?|showing|labelled|labeled|marked|named|here|inside|outside|in|on|at|of)\s+|\s+(?:labelled|labeled|marked|named|shown|here|above|below)$/g;
function trimLabel(s) {
  let out = s;
  for (let i = 0; i < 4; i += 1) {
    const next = out.replace(TRIM, "").trim();
    if (next === out) break;
    out = next;
  }
  return out;
}

/** Word-boundary containment, tolerating a trailing "s" on the phrase, as the marker does. */
function contains(haystack, needle) {
  const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${esc}s?(?:$|[^a-z0-9])`).test(haystack);
}

/** Does this piece NAME the phrase — is it the phrase — rather than merely contain the word? */
function namesIt(piece, phrase) {
  const c = trimLabel(piece);
  const p = trimLabel(phrase);
  return c === p || c === `${p}s` || `${c}s` === p;
}

/** Prose describing an axis or a scale, rather than reporting a reading taken off it. */
const SCALE_PROSE = /\b(?:scale|axis|axes|gridline|division|marked|graduated|ruler)\b|\bfrom -?\d/;

/** The part asks her to NAME or LABEL the thing — the case a printed name destroys outright. */
const ASKS_TO_NAME = /\b(?:name|label|identify)\b|\bwhat is the name\b|\bgive the name\b|\bstate the name\b/i;

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

const STOP = new Set([
  "the", "and", "a", "an", "of", "to", "in", "it", "is", "as", "at", "on", "or", "by", "for",
  "yes", "no", "true", "false", "same", "more", "less", "up", "down",
]);

/**
 * Reviewed exemptions, `<item id>#<part id>` → the reason.
 *
 * The only case that belongs here is a figure that HAS to name the thing for its question to be
 * answerable at all, where the mark is for choosing between the names rather than recalling one:
 * a food web names its organisms and the question is which one is the producer; a dichotomous key
 * names the plants it keys out and the question is which one the key reaches; a colour key is
 * given material, like a formula sheet. Removing the name would not make those questions harder,
 * it would make them impossible.
 *
 * It is NOT for a figure that merely happens to label what the part asks her to name — that is the
 * defect, and the fix is an unannotated, lettered copy for the question. Add a line here only with
 * a reason a reviewer would accept, never to quieten the gate.
 */
const ALLOWED = new Map([
  ["q.science.b1.b1-competition-food-webs.0001#a", "a food web has to name its organisms; the mark is for seeing that no arrow points into wheat or hawthorn (the question's copy carries no row or level labels, 23 Sep)"],
  ["q.science.b1.b1-competition-food-webs.0001#b", "a food web has to name its organisms; the mark is for following the arrows to a primary consumer"],
  ["q.science.b1.b1-competition-food-webs.0002#a", "the mcq options ARE the organisms named on the web; the mark is for reading the trophic level"],
  ["q.science.b1.b1-competition-food-webs.0002#b", "the mcq options ARE the organisms named on the web; the mark is for reading the trophic level"],
  ["q.science.b1.b1-competition-food-webs.0002#c", "the mcq options ARE the organisms named on the web; the mark is for reading the trophic level"],
  ["q.science.b1.b1-fieldwork-sampling.0006#a", "a dichotomous key has to name the plants it keys out; the mark is for following the key"],
  ["q.science.b1.b1-fieldwork-sampling.0006#b", "a dichotomous key has to name the plants it keys out; the mark is for following the key"],
  ["q.science.b1.b1-leaf-structure-gas-exchange.0005#a", "the hydrogencarbonate colour key is given material, as CCEA gives it; the mark is for choosing the colour that goes with high carbon dioxide"],

  // The part's own stem prints the word. figure-leaks never reports these (a phrase the stem uses is
  // the figure repeating the question); they are listed so the build's broader FIGURE warning can
  // drop the same lines when it is aligned with this script.
  ["q.science.b1.b1-aerobic-respiration.0005#c", "the stem says 'Explain why the results show that respiration is exothermic'"],
  ["q.science.b1.b1-decomposition-carbon-cycle.0004#c", "the stem says 'environment C (warm, waterlogged, no air)'"],
  ["q.science.b1.b1-nitrogen-cycle.0004#b", "the stem says 'the condition in the flooded corner'"],
  ["q.science.b1.b1-respiratory-surfaces-breathing.0003#main", "the stem says the frog's skin 'is thin, kept moist, and richly supplied with blood capillaries'"],

  // Multi-panel graph cards. "Which graph shows y = x cubed minus 4x?" is asked of four graphs
  // printed side by side, and the options ARE the panel names. The panel labels are the question's
  // vocabulary, not its answer: strip them and the options refer to nothing and the question cannot
  // be asked at all. The mark is for reading the shape of a curve, never for recalling a name.
  ["q.maths.m7.direct-proportion.0009#main", "the four panels are labelled Graph A to Graph D and the mcq options are those names; the mark is for reading which curve shows y proportional to x squared"],
  ["q.maths.m7.direct-proportion.0016#c", "same four-panel card: the options are the panel names, and the mark is for matching the described relationship to a shape"],
  ["q.maths.m7.recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs.0001#main", "the stem asks for the LETTER of the graph, so the panels must carry their letters; the mark is for recognising the cubic"],
  ["q.maths.m7.recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs.0010#a", "same four-panel card; the stem asks for the letter of the graph and the mark is for recognising the linear form"],
  ["q.maths.m7.recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs.0010#b", "same four-panel card; the mark is for recognising the quadratic"],
  ["q.maths.m7.recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs.0010#c", "same four-panel card; the mark is for recognising the cubic"],
  ["q.maths.m7.recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs.0010#d", "same four-panel card; the mark is for recognising the reciprocal graph"],
  ["q.maths.m8.inverse-proportion.0009#a", "four-panel card, Graph A to Graph D, and the stem asks for the letter of the graph; the mark is for recognising y = k/x among y = k/x, k/x squared, k/root x and a rising curve"],
  ["q.maths.m8.inverse-proportion.0009#b", "same four-panel card; the mark is for recognising the inverse-square curve, the one that falls to a quarter when x doubles"],
  ["q.maths.m8.inverse-proportion.0009#c", "same four-panel card; the mark is for recognising the inverse square-root curve, the one that falls most gently"],
  // (The m7 inequalities q0001 entry that stood here went on 22 Sep: norm() now keeps = < > and
  // folds the two spellings of each of >= and <=, so the boundary label "x = 3" no longer reads as
  // the answer "x > 3" and the exemption had stopped firing.)
]);

const objects = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);
const strings = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

/** The spellings a non-integer answer takes on a figure: n/d for the first few denominators up to 1000, and the decimal to 2–4 places. */
function valueSpellings(v) {
  const out = [];
  if (!Number.isFinite(v) || Number.isInteger(v)) return out;
  for (let d = 2; d <= 1000 && out.length < 6; d += 1) {
    const n = Math.round(v * d);
    if (n !== 0 && Math.abs(n / d - v) < 1e-9) out.push(`${n}/${d}`);
  }
  for (const s of [v.toFixed(2), v.toFixed(3), v.toFixed(4)]) {
    const t = s.replace(/0+$/, "").replace(/\.$/, "");
    if (t !== "0" && t !== "-0" && !out.includes(t)) out.push(t);
  }
  return out;
}

/** Every phrase that would give a part away, tagged with where in the answer it came from. */
function answerPhrases(answer) {
  const out = [];
  const seen = new Set();
  const add = (source, value) => {
    if (typeof value !== "string") return;
    const n = norm(value);
    // A numeric answer is checked at any length: "optimum pH 2" beside "state the optimum pH" is a
    // leak however short the number, and the numericValue test below only fires on a piece that
    // also carries words, so a bare axis tick "2" never counts.
    if ((n.length < 3 && source !== "numericValue") || STOP.has(n) || seen.has(n)) return;
    seen.add(n);
    out.push({ source, phrase: value.trim(), norm: n });
  };
  if (!answer || typeof answer !== "object") return out;
  for (const a of strings(answer.accepted)) add("accepted", a);
  // Key words carry their group number: a group is one mark, and a figure that satisfies EVERY
  // group has handed over the whole part, while one that satisfies one group of three has supplied
  // a term of an explanation the learner still has to make.
  objects(answer.keyWords).forEach((g, i) => {
    for (const w of strings(g.any)) add(`keyWord:${i}`, w);
  });
  for (const t of objects(answer.targets)) for (const a of strings(t.accepted)) add(`label:${t.id}`, a);
  for (const o of objects(answer.options)) if (o.correct === true) add("mcqCorrect", o.text);
  if (answer.kind === "order") for (const it of strings(answer.items)) add("orderItem", it);
  if (answer.kind === "steps") for (const s of strings(answer.expectedOrder)) add("step", s);
  if (answer.kind === "table") for (const row of objects(answer.rows)) for (const c of row.cells ?? []) add("tableCell", typeof c === "string" ? c : c?.accepted?.[0]);
  if (answer.kind === "numeric" && typeof answer.value === "number") {
    add("numericValue", String(answer.value));
    if (typeof answer.unit === "string") add("numericValue", `${answer.value} ${answer.unit}`);
    // A probability or a gradient is printed as a fraction or a short decimal, never as its full value:
    // "5/9" on the branch the part asks for, "0.42" beside the outcome (FM3 pre-read fm3-b-1.md, E3).
    for (const s of valueSpellings(answer.value)) add("numericValue", s);
  }
  for (const p of objects(answer.indicativeContent)) {
    add("indicative", p.point);
    for (const w of strings(p.keyWords)) add("indicative", w);
  }
  // An equation part's answer is the balanced equation. A figure that prints both sides of it has
  // handed the part over, even when its text nodes split "C₆H₁₂O₆" into six pieces (B1 aerobic
  // respiration q0008(a) asked her to complete the equation printed in full beside it).
  if (answer.kind === "equation" && typeof answer.balancedLatex === "string") {
    const sides = compactEquation(answer.balancedLatex).split(">").filter((s) => s.length >= 2);
    if (sides.length >= 2) out.push({ source: "equation", phrase: answer.balancedLatex, norm: "", sides });
  }
  return out;
}

/** An equation as one string with no spaces, braces or LaTeX, its arrow as ">": "c6h12o6+6o2>energy+6co2+6h2o". */
function compactEquation(s) {
  return String(s)
    .replace(/\\(?:text|mathrm|textrm)\s*\{([^}]*)\}/g, "$1")
    .replace(/\\(?:rightarrow|longrightarrow|to)\b|→|⟶|->/g, ">")
    .replace(/[₀-₉]/g, (d) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(d)))
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}_^\s$]/g, "")
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

const leaks = [];
const reviews = [];
const allowed = [];

function check({ figs, phrases, stem, answerKind, groups = 0, meta }) {
  const stemNorm = norm(stem ?? "");
  const naming = answerKind === "label" || answerKind === "numeric" || ASKS_TO_NAME.test(stem ?? "");
  for (const fig of figs) {
    if (!fig || typeof fig !== "object") continue;
    const channels = figureChannels(fig);
    if (channels.length === 0) continue;
    const id = figureId(fig);
    const name = figureName(fig);

    // Collect first, judge after: whether a key word is a leak depends on how much of the part the
    // whole figure covers, which is only known once every channel has been read.
    const found = [];
    for (const ch of channels) {
      const hay = norm(ch.text);
      const ps = pieces(ch.text);
      for (const p of phrases) {
        if (p.source === "equation") continue; // read as a whole below
        if (!contains(hay, p.norm)) continue;
        if (stemNorm && contains(stemNorm, p.norm)) continue;
        // A value the part asks for is a leak wherever it is printed in words; a bare number on an
        // axis, or a description of the axis range, is the reading the question is FOR.
        const hit =
          p.source === "numericValue"
            ? ps.find((c) => contains(c, p.norm) && /[a-z]{2}/.test(c) && !SCALE_PROSE.test(c))
            : ps.find((c) => namesIt(c, p.norm));
        // A one- or two-character number that no worded piece carries is an axis tick or a count
        // in passing ("2" on every scale): not worth a reader's time even as a review line.
        if (p.source === "numericValue" && !hit && p.norm.length < 3) continue;
        found.push({ ...meta, figure: id, figureName: name, channel: ch.channel, source: p.source, phrase: p.phrase, printed: hit ?? (ch.text.length > 120 ? `${ch.text.slice(0, 120)}…` : ch.text), asLabel: Boolean(hit) });
      }
    }
    // The drawn equation is spread over many text nodes (subscripts are their own <text>), so the
    // nodes are read joined, in document order, as the eye reads them along the line.
    const drawn = compactEquation(channels.filter((c) => c.channel === "text").map((c) => c.text).join(""));
    const stemEquation = compactEquation(stem ?? "");
    for (const p of phrases) {
      if (p.source !== "equation") continue;
      if (p.sides.every((s) => stemEquation.includes(s))) continue;
      if (p.sides.every((s) => drawn.includes(s)))
        found.push({ ...meta, figure: id, figureName: name, channel: "text", source: "equation", phrase: p.phrase, printed: "both sides of the balanced equation", asLabel: true });
    }
    if (found.length === 0) continue;

    // Every key-word group this figure satisfies as a label. When that is all of them, the figure
    // has given away every mark the part carries, whatever the command word was.
    const satisfied = new Set(found.filter((r) => r.asLabel && r.source.startsWith("keyWord:")).map((r) => r.source.slice(8)));
    const coversEveryGroup = groups > 0 && satisfied.size === groups;

    for (const row of found) {
      const named =
        row.source === "accepted" || row.source === "mcqCorrect" || row.source === "orderItem" || row.source === "step" || row.source === "tableCell" || row.source === "numericValue" || row.source === "equation" || row.source.startsWith("label:");
      const keyWordCounts = row.source.startsWith("keyWord:") && (naming || coversEveryGroup);
      if (!(row.asLabel && (named || keyWordCounts))) {
        reviews.push(row);
        continue;
      }
      const reason = ALLOWED.get(`${meta.item}#${meta.part}`);
      if (reason) allowed.push({ ...row, reason });
      else leaks.push(row);
    }
  }
}

function sweepBundle(file, subject, unit, slug) {
  let b;
  try {
    b = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`unreadable: ${file}: ${e.message}`);
    return 0;
  }
  let figures = 0;

  for (const q of objects(b.questions)) {
    const figs = [...objects(q.figures), ...objects(q.parts).flatMap((p) => objects(p.figures))];
    figures += figs.length;
    if (figs.length === 0) continue;
    for (const part of objects(q.parts)) {
      check({
        figs,
        phrases: answerPhrases(part.answer),
        stem: part.stem,
        answerKind: part.answer?.kind,
        groups: (part.answer?.keyWords ?? []).length,
        meta: { subject, unit, slug, item: q.id, part: part.id, kind: "question" },
      });
    }
  }

  for (const set of objects(b.diagnostics)) {
    for (const item of objects(set.items)) {
      if (!item.figure) continue;
      figures += 1;
      check({
        figs: [item.figure],
        phrases: answerPhrases({ options: item.options }),
        stem: item.stem,
        answerKind: "mcq",
        meta: { subject, unit, slug, item: item.id, part: "-", kind: "diagnostic" },
      });
    }
  }

  for (const we of objects(b.workedExamples)) {
    if (!we.twin?.figure) continue;
    figures += 1;
    check({
      figs: [we.twin.figure],
      phrases: answerPhrases(we.twin.answer),
      stem: we.twin.stem,
      answerKind: we.twin.answer?.kind,
      groups: (we.twin.answer?.keyWords ?? []).length,
      meta: { subject, unit, slug, item: we.id, part: "twin", kind: "worked-example twin" },
    });
  }

  for (const f of objects(b.findTheMistake)) {
    const figs = [f.figure, f.image].filter((x) => x && typeof x === "object");
    if (figs.length === 0) continue;
    figures += figs.length;
    check({
      figs,
      phrases: strings(f.correction).map((line) => ({ source: "correction", phrase: line, norm: norm(line) })).filter((p) => p.norm.length >= 4),
      stem: f.stem,
      answerKind: "text",
      meta: { subject, unit, slug, item: f.id, part: "-", kind: "find-the-mistake" },
    });
  }

  for (const p of objects(b.prompts)) {
    if (!p.image) continue;
    figures += 1;
    const phrases = [];
    if (typeof p.answer === "string" && norm(p.answer).length >= 4) phrases.push({ source: "promptAnswer", phrase: p.answer, norm: norm(p.answer) });
    for (const w of strings(p.keyWords)) if (norm(w).length >= 3 && !STOP.has(norm(w))) phrases.push({ source: "promptKeyWord", phrase: w, norm: norm(w) });
    check({ figs: [p.image], phrases, stem: p.prompt, answerKind: "text", meta: { subject, unit, slug, item: p.id, part: "-", kind: "retrieval prompt" } });
  }

  return figures;
}

// ---------------------------------------------------------------------------
// Walk packs/<subject>/content/<unit>/<slug>/bundle.json
// ---------------------------------------------------------------------------

if (!fs.existsSync(PACKS)) {
  console.error("run this from the repository root: packs/ not found");
  process.exit(2);
}

const perUnit = [];
for (const subject of fs.readdirSync(PACKS)) {
  const contentDir = path.join(PACKS, subject, "content");
  if (!fs.existsSync(contentDir) || !fs.statSync(contentDir).isDirectory()) continue;
  if (subjects.length && !subjects.includes(subject.toLowerCase())) continue;
  for (const unit of fs.readdirSync(contentDir)) {
    const unitDir = path.join(contentDir, unit);
    if (!fs.statSync(unitDir).isDirectory()) continue;
    if (units.length && !units.includes(unit.toLowerCase())) continue;
    const before = leaks.length;
    const beforeReview = reviews.length;
    const beforeAllowed = allowed.length;
    let bundles = 0;
    let figures = 0;
    for (const slug of fs.readdirSync(unitDir)) {
      const file = path.join(unitDir, slug, "bundle.json");
      if (!fs.existsSync(file)) continue;
      bundles += 1;
      figures += sweepBundle(file, subject, unit, slug);
    }
    perUnit.push({ subject, unit, bundles, figures, leaks: leaks.length - before, reviews: reviews.length - beforeReview, allowed: allowed.length - beforeAllowed });
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) {
    const k = key(r);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}

// One figure usually serves several parts, and it is the figure that has to be regenerated.
for (const [, rows] of groupBy(leaks, (r) => `${r.subject}/${r.unit}/${r.slug}/${r.figure}`)) {
  console.log(`LEAK  ${rows[0].subject}/${rows[0].unit}/${rows[0].slug}  figure ${rows[0].figure} — ${rows[0].figureName}`);
  for (const [, prows] of groupBy(rows, (r) => `${r.item}\t${r.part}`)) {
    const r0 = prows[0];
    const words = [...new Set(prows.map((r) => `"${r.phrase}" (${r.source})`))].join(", ");
    const channels = [...new Set(prows.map((r) => r.channel))].join("/");
    console.log(`        ${r0.item}${r0.part === "-" ? "" : `(${r0.part})`} [${r0.kind}] <${channels}> names ${words}`);
  }
}

if (allowed.length) {
  console.log("");
  console.log("ALLOWED  reviewed exemptions — the figure has to name these for its question to be answerable:");
  for (const [, rows] of groupBy(allowed, (r) => `${r.item}\t${r.part}`)) {
    const r0 = rows[0];
    console.log(`        ${r0.item}(${r0.part}): ${[...new Set(rows.map((r) => `"${r.phrase}"`))].join(", ")} — ${r0.reason}`);
  }
}

if (!quiet && reviews.length) {
  const byPart = groupBy(reviews, (r) => `${r.item}\t${r.part}`);
  console.log("");
  console.log(`REVIEW  ${reviews.length} shared word(s) in ${byPart.size} part(s) that are not leaks: a key word inside figure prose, or a name on a figure whose job is to name things. Read, do not gate.`);
  for (const [, rows] of byPart) {
    const r0 = rows[0];
    const words = [...new Set(rows.map((r) => r.phrase))].slice(0, 6).join(", ");
    console.log(`        ${r0.item}${r0.part === "-" ? "" : `(${r0.part})`}: ${words}`);
  }
}

console.log("");
for (const u of perUnit) {
  console.log(`${u.subject}/${u.unit}: ${u.bundles} bundle(s), ${u.figures} figure(s) checked, ${u.leaks} leak(s), ${u.allowed} allowed, ${u.reviews} review line(s)`);
}
const partsLeaking = new Set(leaks.map((r) => `${r.item}#${r.part}`)).size;
const figuresLeaking = new Set(leaks.map((r) => `${r.subject}/${r.unit}/${r.slug}/${r.figure}`)).size;
console.log(
  leaks.length === 0
    ? `figure-leaks: 0 leaks in ${perUnit.reduce((n, u) => n + u.figures, 0)} figure(s) across ${perUnit.length} unit(s); ${allowed.length} allowed, ${reviews.length} review line(s)`
    : `figure-leaks: ${leaks.length} leak(s) in ${partsLeaking} part(s) across ${figuresLeaking} figure(s) — each one prints an answer its own part asks for`,
);

if (jsonOut) {
  fs.writeFileSync(jsonOut, `${JSON.stringify({ perUnit, leaks, allowed, reviews }, null, 2)}\n`);
  console.log(`findings → ${jsonOut}`);
}

process.exit(leaks.length ? 1 : 0);
