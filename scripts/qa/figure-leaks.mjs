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
 * Worked examples (WorkedExampleAsQuestion.tsx). The twin mode shows only the twin's figure, so the twin's
 * figure is tested against the twin's answer (a LEAK, as for a question part). The example's own figure is
 * shown in the full, faded and problem modes, so it is tested against what those modes hide: every step a
 * faded mode leaves to her (its input spec's spellings, or, with no spec, the working's results and short
 * statements; scripts/qa/we-hidden-steps.mjs says which steps, as fade.ts does) and, for the problem mode, the
 * final answer's values and points, minus whatever the stem and the steps that mode shows already give. Never
 * against the twin's answer: that figure is never beside the twin's answer box. These are the WE-LEAK tier,
 * printed and counted but not gating until --we-fatal. Those modes show `figurePlain` when the example has one
 * (figureForMode in the renderer; weFigureFor mirrors it), so that is the figure compared; the full example's
 * annotated figure is compared with nothing, because the full example hides nothing.
 *
 * Usage:
 *   node scripts/qa/figure-leaks.mjs                  every subject, every unit
 *   node scripts/qa/figure-leaks.mjs --unit b1        one unit (repeatable)
 *   node scripts/qa/figure-leaks.mjs --subject science
 *   node scripts/qa/figure-leaks.mjs --json out.json  findings as JSON as well
 *   node scripts/qa/figure-leaks.mjs --quiet          counts only, no review list
 *   node scripts/qa/figure-leaks.mjs --we-fatal       count the worked-example tier as leaks (exit 1)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hiddenSteps, weFigureFor } from "./we-hidden-steps.mjs";

/** Run as a script (the CLI below) or imported for its pure sweep (src/lib/build/we-figure-leaks.test.ts). */
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

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
export const ALLOWED = new Map([
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

  // A wave graph read for its amplitude and wavelength. The drawing carries no value but the axis
  // ticks; the alt is that drawing in words for a screen-reader user (the grid's scale, then how
  // many squares the curve rises and how many one wave spans), which is exactly the reading a
  // sighted learner makes off the grid. Where a square is 1 m or 1 s the count is the answer, as
  // the printed grid is for everyone else. Reworded to hide the count, the alt would set a blind
  // learner a different question (24 Sep).
  ["q.science.p2.p2-wave-types-and-properties.0004#b", "the alt gives the grid's scale and the squares one wave spans, which is the reading the part asks for; the mark is for taking it off the drawn wave"],
  ["q.science.p2.p2-wave-types-and-properties.0010#b", "the alt gives the grid's scale and the squares one wave spans, which is the reading the part asks for; the mark is for taking it off the drawn wave"],
  ["q.science.p2.p2-wave-types-and-properties.0011#a", "the alt gives the grid's scale and the squares one up-and-down movement spans, which is the period the part asks for; the mark is for taking it off the drawn wave"],
  // A box plot read for its median: the alt places the whiskers, the box and the line inside the box on
  // the scale, which is the drawing in words; the mark is for knowing that the line inside the box is the
  // median (the alt no longer calls it that, 24 Sep).
  ["q.maths.m3.box-plots-and-comparing-distributions.0001#a", "the alt places the line inside the box on the scale, as the drawing does; the mark is for reading it as the median"],
  ["q.maths.m3.box-plots-and-comparing-distributions.0015#a", "the alt places the line inside each box on the scale, as the drawing does; the mark is for reading Ashvale's as the median"],
  // The same for the worked example's two box plots (25 Sep, QA fixer): the alt says where each box and the
  // line inside it are drawn ("the line inside the box at 11"), the drawing in words for a screen reader; the
  // faded steps ask her to read that line as Moira's median (11) and to work out Moira's IQR (16 - 5, which
  // is also 11). Both are readings or sums from the plot, as a sighted learner makes them.
  ["we.maths.m3.box-plots-and-comparing-distributions.03#step 1", "the alt places the boxes and the line inside each box on the scale, as the drawing does; the step is to read the medians off it and work out the IQRs"],
  ["we.maths.m3.box-plots-and-comparing-distributions.03#step 3", "the alt places Moira's box from 5 to 16 on the scale, as the drawing does; the step compares the IQRs worked out from it (16 - 5 = 11)"],
  // Two m7 worked examples whose question is to read a drawn graph (25 Sep, QA fixer): the alt is the drawing
  // in words for a screen reader, so it says what a sighted learner sees, and the faded step is that reading.
  // A blank copy would leave nothing to read.
  ["we.maths.m7.quadratic-graphs-and-intersections-with-straight-lines.02#step 3", "the stem says the graph is drawn and asks for its minimum; the alt lists the points the drawn curve passes through, as the drawing shows them; the step is to read the lowest ones off it"],
  ["we.maths.m7.recognising-and-sketching-linear-quadratic-cubic-and-reciprocal-graphs.01#step 4", "the question is to match four drawn graphs to equations; the alt has to describe each graph's shape (Graph A turns twice and crosses the x-axis three times), which is what a sighted learner sees; the step is the matching"],
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
  // The table spec is `cells: [{ row, col, value }]` (schema.ts). The script read `rows[].cells[]` until 25 Sep
  // 2026, a shape no bundle has, so no table cell was ever checked. A text cell is named like an accepted answer;
  // number cells are read by bareCellLeaks (two or more printed as bare numbers), not one by one: a table of small
  // numbers shares digits with every alt that describes the drawing.
  if (answer.kind === "table") for (const c of objects(answer.cells)) if (typeof c.value === "string" && bareNumber(c.value) === null) add("tableCell", c.value);
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
// Bare numbers: a table's cells printed one to a text node
// ---------------------------------------------------------------------------

/** A text that is only a number ("12", "−3", "0.25", "1,260"), as that number; else null. */
function bareNumber(s) {
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  const t = String(s ?? "").replace(/[−–]/g, "-").replace(/,(?=\d{3}(?!\d))/g, "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : null;
}

/** The numbers a multi-value answer asks for, one per cell: a table's number cells, a matrix's entries, a solution set's or a pair's values. */
function answerCells(answer) {
  if (!answer || typeof answer !== "object") return [];
  if (answer.kind === "table") return objects(answer.cells).map((c) => bareNumber(c.value)).filter((v) => v !== null);
  if (answer.kind === "matrix") return (Array.isArray(answer.entries) ? answer.entries.flat() : []).map(bareNumber).filter((v) => v !== null);
  if (answer.kind === "algebraic" && typeof answer.latex === "string" && answer.latex.includes(","))
    return [...answer.latex.replace(/[−–]/g, "-").matchAll(/(?<![\w.^{])-?\d+(?:\.\d+)?(?![\w.])/g)].map((m) => Number(m[0]));
  return [];
}

/**
 * Two or more of a multi-value answer's cells printed as bare-number text nodes of the part's own figures is a
 * LEAK (QA fixer, 25 Sep 2026: m4 stratified-sampling q0015 printed 12, 16, 10, 22 beside the table asking for
 * them). The piece rule above passes a bare short number, because axis ticks would drown the report; here a node
 * counts only when it is not one step of an evenly spaced run of three or more numbers in the figure's order (an
 * axis), and not a number the stem prints. Each node is spent once, so one 6 is not two cells of 6. One printed
 * cell stays exempt, and the cells matched must be at least half of the answer's, so a coincidence in a figure
 * full of numbers does not gate.
 */
function bareCellLeaks(acc, { figs, answer, stem, meta }) {
  const cells = answerCells(answer);
  if (cells.length < 2) return;
  const stemNumbers = new Set([...String(stem ?? "").replace(/[−–]/g, "-").matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0])));
  for (const fig of figs) {
    if (!fig || typeof fig !== "object") continue;
    const nodes = figureChannels(fig).filter((c) => c.channel === "text").map((c) => bareNumber(c.text)).filter((v) => v !== null);
    // an axis: a run of 3+ numbers, in the order drawn, that climbs or falls by one fixed step (a constant run is not)
    const tick = new Array(nodes.length).fill(false);
    for (let i = 0; i + 2 < nodes.length; i += 1) {
      const d = nodes[i + 1] - nodes[i];
      if (d === 0 || Math.abs(nodes[i + 2] - nodes[i + 1] - d) > 1e-9) continue;
      let j = i + 2;
      while (j + 1 < nodes.length && Math.abs(nodes[j + 1] - nodes[j] - d) < 1e-9) j += 1;
      for (let k = i; k <= j; k += 1) tick[k] = true;
    }
    const pool = nodes.filter((v, i) => !tick[i] && !stemNumbers.has(v));
    const matched = [];
    for (const c of cells) {
      const at = pool.findIndex((v) => Math.abs(v - c) < 1e-9);
      if (at >= 0) matched.push(pool.splice(at, 1)[0]);
    }
    if (matched.length >= 2 && matched.length * 2 >= cells.length) {
      const row = { ...meta, figure: figureId(fig), figureName: figureName(fig), channel: "text", source: "tableCells", phrase: matched.join(", "), printed: `${matched.length} of the answer's ${cells.length} cells as bare numbers`, asLabel: true };
      const reason = ALLOWED.get(`${meta.item}#${meta.part}`);
      if (reason) acc.allowed.push({ ...row, reason });
      else acc.leaks.push(row);
      return;
    }
  }
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

/**
 * A value the part asks for, printed where a reader takes it as a reading: a piece of figure text that carries
 * the value and words ("mean time 150 s"), not a bare axis tick or a description of the scale. Worked-example
 * steps and final answers are also read against a whole text node ("optimum (40 °C)" is one label, though the
 * bracket splits it into two pieces); question parts keep the piece rule they were calibrated on.
 */
const VALUE_SOURCES = new Set(["numericValue", "stepValue", "finalValue"]);
const WHOLE_NODE_SOURCES = new Set(["stepValue", "finalValue", "finalPoint"]);

/** The ALLOWED keys no checked part answers to: the part, its item or its figure has gone, so the exemption is dead. */
export function staleAllowances(targets) {
  return [...ALLOWED.keys()].filter((k) => !targets.has(k));
}

function check(acc, { figs, phrases, stem, answerKind, groups = 0, meta }) {
  // every part checked against at least one figure is a live target for an ALLOWED entry
  if (acc.targets && figs.some((f) => f && typeof f === "object")) acc.targets.add(`${meta.item}#${meta.part}`);
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
        const worded = (c) => contains(c, p.norm) && /[a-z]{2}/.test(c) && !SCALE_PROSE.test(c);
        const hit =
          p.source === "finalPoint"
            ? (contains(hay, p.norm) ? hay : undefined) // a coordinate pair printed is the pair, words or none
            : VALUE_SOURCES.has(p.source)
              ? ps.find(worded) ?? (WHOLE_NODE_SOURCES.has(p.source) && ch.channel === "text" && worded(hay) ? hay : undefined)
              : ps.find((c) => namesIt(c, p.norm));
        // A one- or two-character number that no worded piece carries is an axis tick or a count
        // in passing ("2" on every scale): not worth a reader's time even as a review line.
        if (VALUE_SOURCES.has(p.source) && !hit && p.norm.length < 3) continue;
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
        row.source === "accepted" || row.source === "mcqCorrect" || row.source === "orderItem" || row.source === "step" || row.source === "tableCell" || VALUE_SOURCES.has(row.source) || row.source === "finalPoint" || row.source === "stepResult" || row.source === "stepStatement" || row.source === "equation" || row.source.startsWith("label:");
      const keyWordCounts = row.source.startsWith("keyWord:") && (naming || coversEveryGroup);
      if (!(row.asLabel && (named || keyWordCounts))) {
        acc.reviews.push(row);
        continue;
      }
      const reason = ALLOWED.get(`${meta.item}#${meta.part}`);
      if (reason) acc.allowed.push({ ...row, reason });
      else acc.leaks.push(row);
    }
  }
}

// ---------------------------------------------------------------------------
// Worked examples: what each mode hides
// ---------------------------------------------------------------------------

/** A step's or a final answer's text as plain words: maths unwrapped, bold and italics dropped, TeX spelled out. */
function plainWorking(s) {
  return String(s ?? "")
    .replace(/\$\$?([^$]*)\$\$?/g, "$1")
    .replace(/\\(?:text|mathrm|textrm|mathbf)\s*\{([^}]*)\}/g, "$1")
    .replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1/$2")
    .replace(/\^\s*\{?\\circ\}?/g, "°")
    .replace(/\\times|\\cdot/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\[,;:! ]/g, " ")
    .replace(/\\left|\\right/g, "")
    .replace(/[{}]/g, "")
    .replace(/\*\*|__|(?<![a-z])\*(?![a-z])/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A number and the unit printed after it: "150 s", "40 °C", "28.8 m", "5 m/s²". Only units of measure count, so
 * a coefficient ("3x") or a count in passing is never read as a value with a unit.
 */
const UNIT = String.raw`°\s?C|°|%|m\/s²|m\/s\^2|m\/s|km\/h|cm³|cm²|dm³|m³|m²|mm|cm|km|kg|mg|kJ|kW|kPa|Pa|Hz|mol|ms|min|hours?|minutes?|seconds?|metres?|degrees?|Ω|[smgJWNVAKp](?![a-z])`;
const VALUE_WITH_UNIT = new RegExp(String.raw`(?<![\w.^])(-?\d+(?:\.\d+)?)(?![\w.^])(?:\s?(${UNIT}))?`, "g");
/** Every number in a text, with its unit when one follows. */
function valuesIn(text) {
  return [...plainWorking(text).matchAll(VALUE_WITH_UNIT)].map((m) => ({ value: m[1], unit: (m[2] ?? "").replace(/\s+/g, " ").trim() }));
}
/**
 * A value worth checking for on a figure: with its unit, or of two digits or more. A bare single digit is on every
 * method card and axis of a worked example ("2" in "y = 2x + 1"), so on its own it says nothing.
 */
const significant = ({ value, unit }) => Boolean(unit) || value.replace(/[^0-9]/g, "").length >= 2;
const spellings = ({ value, unit }) => (unit ? [`${value} ${unit}`, ...(significant({ value, unit: "" }) ? [value] : [])] : significant({ value, unit }) ? [value] : []);

/** Words that carry no step's meaning on their own, however long. */
const COMMON = new Set("because therefore between before during always cannot should answer number figure diagram graph values value reading between another second things change changes result results reason reasons method measure measured amount people doesn't nothing another".split(" "));

/**
 * What a learner writes for one step of a worked example, as phrases the figure must not print.
 *   input spec   the step is marked against it, so every spelling it accepts (answerPhrases);
 *   no input     her line is compared with the authored working, so the working's results: every "= value"
 *                (stepValue for a number, with its unit; stepResult for an expression), a short statement
 *                of six words or fewer ("Purple."), and, for a longer sentence, its distinctive terms
 *                (stepTerm: a REVIEW line only, because which word of a sentence is the mark cannot be read
 *                off the working).
 * A value counts when it carries its unit or has two digits or more (see `significant`).
 */
function stepPhrases(step) {
  // a bare single digit is on every method card of a worked example; with its unit it still counts
  if (step.input && typeof step.input === "object") return answerPhrases(step.input).filter((p) => !(p.source === "numericValue" && /^-?\d$/.test(p.norm)));
  const out = [];
  const seen = new Set();
  const add = (source, value) => {
    // a statement's closing full stop is not part of what she writes ("Purple." is the word purple)
    const n = norm(String(value).replace(/[.;:,!?]+\s*$/, ""));
    if (!n || seen.has(`${source}:${n}`) || STOP.has(n) || (n.length < 3 && source !== "stepValue")) return;
    seen.add(`${source}:${n}`);
    out.push({ source, phrase: String(value).trim(), norm: n });
  };
  for (const raw of String(step.working ?? "").split("\n")) {
    const line = plainWorking(raw);
    if (!line || line.startsWith("|")) continue;
    const rel = line.split(/=|≈/);
    if (rel.length > 1) {
      const result = rel[rel.length - 1].replace(/[.;,]\s*$/, "").trim();
      const values = valuesIn(result);
      // a number result ("= 150 s") is its value; an expression ("= (x + 3)(x - 2)") is named whole
      if (values.length && /^[-−]?\d/.test(result)) for (const v of values.slice(0, 1)) for (const s of spellings(v)) add("stepValue", s);
      else if (result && /[a-z]/i.test(result) && norm(result).length >= 4) add("stepResult", result);
      continue;
    }
    for (const v of valuesIn(line)) if (v.unit) for (const s of spellings(v)) add("stepValue", s); // "60 s" in a sentence, with its unit
    const words = line.replace(/^\(?[a-z]\)\s*/i, "").split(/\s+/).filter(Boolean);
    if (words.length <= 6) add("stepStatement", line);
    else for (const w of line.toLowerCase().match(/[a-z]{6,}/g) ?? []) if (!COMMON.has(w)) add("stepTerm", w);
  }
  return out;
}

/**
 * A sentence a faded mode leaves to her, written on the figure in other words (verifier, 25 Sep 2026: b1-reflex-arc.02
 * hides "the impulse cannot cross the gap directly: a chemical has to be released and diffuse across" beside a figure
 * whose text reads "The impulse cannot jump the gap: a chemical is released and diffuses across"). For a step with no
 * input spec and more than six words: its own words (four letters or more, read by their first five letters, minus
 * any the stem or the shown steps use); one piece of the figure's text (a text node, the title, the alt, the caption)
 * that carries at least three of them and at least 60 per cent is a WE-LEAK (stepProse); two or more is a review line.
 */
const PROSE_STOP = new Set("that this with from have when then than into each which their there they what will would could should".split(" "));
const contentWords = (s) =>
  new Set((String(s).toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP.has(w) && !COMMON.has(w) && !PROSE_STOP.has(w)).map((w) => w.slice(0, 5)));
function proseStepLeak(acc, fig, step, given, meta) {
  if (step.input || !fig || typeof fig !== "object") return;
  const working = plainWorking(step.working);
  if (working.split(/\s+/).filter(Boolean).length <= 6) return;
  const known = contentWords(plainWorking(given));
  const own = [...contentWords(working)].filter((w) => !known.has(w));
  if (own.length < 3) return;
  let best = null;
  for (const ch of figureChannels(fig)) {
    const here = contentWords(ch.text);
    const shared = own.filter((w) => here.has(w));
    if (!best || shared.length > best.shared.length) best = { ch, shared };
  }
  if (!best || best.shared.length < 2) return;
  const leak = best.shared.length >= 3 && best.shared.length / own.length >= 0.6;
  const row = { ...meta, figure: figureId(fig), figureName: figureName(fig), channel: best.ch.channel, source: "stepProse", phrase: working, printed: best.ch.text.length > 120 ? `${best.ch.text.slice(0, 120)}…` : best.ch.text, asLabel: true };
  if (!leak) acc.reviews.push(row);
  else {
    const reason = ALLOWED.get(`${meta.item}#${meta.part}`);
    if (reason) acc.allowed.push({ ...row, reason });
    else acc.leaks.push(row);
  }
}

/**
 * What the problem mode asks for, read off the final answer: each value that answers something (a number after
 * "=", a number with its unit, or an answer that is only a number) and each coordinate pair. A coefficient inside
 * an expression ("y = 3x - 5") is not a value.
 */
function finalPhrases(finalAnswer) {
  const out = [];
  const seen = new Set();
  const push = (source, phrase) => {
    const n = norm(phrase);
    if (n && !seen.has(n)) out.push({ source, phrase, norm: n }), seen.add(n);
  };
  const text = plainWorking(finalAnswer);
  const picked = [];
  for (const v of valuesIn(text)) if (v.unit) picked.push(v);
  for (const m of text.matchAll(/(?:=|≈)\s*(-?\d+(?:\.\d+)?)(?![\w.^])(?!\s*[a-z(])/gi)) picked.push({ value: m[1], unit: "" });
  if (/^\s*-?\d+(?:\.\d+)?\s*\.?\s*$/.test(text)) picked.push({ value: text.replace(/[\s.]+$/, "").trim(), unit: "" });
  for (const v of picked) for (const s of spellings(v)) push("finalValue", s);
  for (const m of text.matchAll(/\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)/g)) push("finalPoint", m[0]);
  return out;
}

/** Drop a phrase the learner has already been given (the stem, the steps the mode shows): it is not hers to produce. */
const notGiven = (phrases, given) => {
  const g = norm(given);
  return phrases.filter((p) => p.source === "equation" || !contains(g, p.norm));
};

/**
 * The worked example's own figure, against what each mode that shows it hides: every step a faded mode leaves
 * to her (minus the stem and the steps that mode shows), and the final answer for the problem mode (minus the
 * stem). Its twin figure, against the twin's answer, as before: TwinMode shows only that.
 */
function sweepWorkedExample(acc, we, meta) {
  let figures = 0;
  // The faded and problem findings are their own tier (WE-LEAK) until the lead promotes it with --we-fatal:
  // they are real (the figure hands over a step she is asked to write) but most need an unannotated copy of
  // the figure for those modes, which the schema does not hold yet.
  const weAcc = { leaks: acc.weLeaks, reviews: [], allowed: acc.allowed, targets: acc.targets };
  // The faded and problem modes show figurePlain when the example has one, else its figure (figureForMode in the
  // renderer); the full example's annotated figure hides nothing, so it is compared with nothing.
  const shown = weFigureFor(we, "faded1");
  if (shown && typeof shown === "object") {
    figures += 1;
    const steps = objects(we.steps);
    const byN = new Map(steps.map((s) => [s.n, s]));
    // a step hidden by both faded modes is checked once, against the least that either mode gives
    const hidden = new Map();
    for (const plan of hiddenSteps(we)) {
      const given = [we.stem, ...steps.filter((s) => s.n <= plan.showSteps).map((s) => s.working)].join("\n");
      for (const n of plan.supplied) if (!hidden.has(n) || hidden.get(n).length > given.length) hidden.set(n, given);
    }
    for (const [n, given] of [...hidden].sort((a, b) => a[0] - b[0])) {
      const step = byN.get(n);
      if (!step) continue;
      check(weAcc, {
        figs: [shown],
        phrases: notGiven(stepPhrases(step), given),
        stem: given,
        answerKind: step.input?.kind ?? "text",
        groups: (step.input?.keyWords ?? []).length,
        meta: { ...meta, item: we.id, part: `step ${n}`, kind: "worked example (faded)" },
      });
      proseStepLeak(weAcc, shown, step, given, { ...meta, item: we.id, part: `step ${n}`, kind: "worked example (faded)" });
    }
    check(weAcc, {
      figs: [shown],
      phrases: notGiven(finalPhrases(we.finalAnswer), we.stem ?? ""),
      stem: we.stem,
      answerKind: "numeric",
      meta: { ...meta, item: we.id, part: "final", kind: "worked example (problem)" },
    });
  }
  // A worked example's figure is annotated by design, so a word it merely shares with a step is everywhere: only a
  // label that IS a step's term or value is worth a reader's look.
  acc.reviews.push(...weAcc.reviews.filter((r) => r.asLabel));
  if (we.twin?.figure) {
    figures += 1;
    check(acc, {
      figs: [we.twin.figure],
      phrases: answerPhrases(we.twin.answer),
      stem: we.twin.stem,
      answerKind: we.twin.answer?.kind,
      groups: (we.twin.answer?.keyWords ?? []).length,
      meta: { ...meta, item: we.id, part: "twin", kind: "worked-example twin" },
    });
  }
  return figures;
}

/**
 * Sweep one bundle. Pure apart from what it returns: { figures, leaks, weLeaks, reviews, allowed } (weLeaks: a worked example's figure printing what a faded or the problem mode hides).
 * @param {object} b  a parsed bundle.json
 * @param {{ subject: string, unit: string, slug: string }} where
 */
export function sweepBundle(b, { subject, unit, slug }) {
  const acc = { leaks: [], weLeaks: [], reviews: [], allowed: [], targets: new Set() };
  let figures = 0;

  for (const q of objects(b.questions)) {
    const figs = [...objects(q.figures), ...objects(q.parts).flatMap((p) => objects(p.figures))];
    figures += figs.length;
    if (figs.length === 0) continue;
    for (const part of objects(q.parts)) {
      check(acc, {
        figs,
        phrases: answerPhrases(part.answer),
        stem: part.stem,
        answerKind: part.answer?.kind,
        groups: (part.answer?.keyWords ?? []).length,
        meta: { subject, unit, slug, item: q.id, part: part.id, kind: "question" },
      });
      bareCellLeaks(acc, { figs, answer: part.answer, stem: part.stem, meta: { subject, unit, slug, item: q.id, part: part.id, kind: "question" } });
    }
  }

  for (const set of objects(b.diagnostics)) {
    for (const item of objects(set.items)) {
      if (!item.figure) continue;
      figures += 1;
      check(acc, {
        figs: [item.figure],
        phrases: answerPhrases({ options: item.options }),
        stem: item.stem,
        answerKind: "mcq",
        meta: { subject, unit, slug, item: item.id, part: "-", kind: "diagnostic" },
      });
    }
  }

  for (const we of objects(b.workedExamples)) figures += sweepWorkedExample(acc, we, { subject, unit, slug });

  for (const f of objects(b.findTheMistake)) {
    const figs = [f.figure, f.image].filter((x) => x && typeof x === "object");
    if (figs.length === 0) continue;
    figures += figs.length;
    check(acc, {
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
    check(acc, { figs: [p.image], phrases, stem: p.prompt, answerKind: "text", meta: { subject, unit, slug, item: p.id, part: "-", kind: "retrieval prompt" } });
  }

  return { figures, ...acc };
}

// ---------------------------------------------------------------------------
// The script: arguments, walk packs/<subject>/content/<unit>/<slug>/bundle.json, report
// ---------------------------------------------------------------------------

function main() {
const argv = process.argv.slice(2);
const units = [];
const subjects = [];
let jsonOut = null;
let quiet = false;
let weFatal = false;
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === "--unit") units.push(String(argv[++i]).toLowerCase());
  else if (a === "--subject") subjects.push(String(argv[++i]).toLowerCase());
  else if (a === "--json") jsonOut = argv[++i];
  else if (a === "--quiet") quiet = true;
  else if (a === "--we-fatal") weFatal = true;
  else {
    console.error(`unknown argument: ${a}`);
    process.exit(2);
  }
}

const PACKS = path.resolve("packs");
if (!fs.existsSync(PACKS)) {
  console.error("run this from the repository root: packs/ not found");
  process.exit(2);
}

const leaks = [];
const weLeaks = [];
const reviews = [];
const allowed = [];
const targets = new Set();
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
    const beforeWe = weLeaks.length;
    const beforeReview = reviews.length;
    const beforeAllowed = allowed.length;
    let bundles = 0;
    let figures = 0;
    for (const slug of fs.readdirSync(unitDir)) {
      const file = path.join(unitDir, slug, "bundle.json");
      if (!fs.existsSync(file)) continue;
      bundles += 1;
      let b;
      try {
        b = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch (e) {
        console.error(`unreadable: ${file}: ${e.message}`);
        continue;
      }
      const r = sweepBundle(b, { subject, unit, slug });
      figures += r.figures;
      leaks.push(...r.leaks);
      weLeaks.push(...r.weLeaks);
      reviews.push(...r.reviews);
      allowed.push(...r.allowed);
      for (const t of r.targets) targets.add(t);
    }
    perUnit.push({ subject, unit, bundles, figures, leaks: leaks.length - before, weLeaks: new Set(weLeaks.slice(beforeWe).map((r) => `${r.item}#${r.part}`)).size, reviews: reviews.length - beforeReview, allowed: allowed.length - beforeAllowed });
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

// A worked example's figure in the faded and problem modes: the same figure she read in full, now beside the
// steps she has to write. One line per figure, then each step (or the final answer) it gives away.
if (weLeaks.length) {
  console.log("");
  console.log(`WE-LEAK  worked examples whose own figure prints what a faded mode or the problem mode asks her to write${weFatal ? "" : " (warnings until --we-fatal)"}:`);
  for (const [, rows] of groupBy(weLeaks, (r) => `${r.subject}/${r.unit}/${r.slug}/${r.figure}`)) {
    console.log(`  ${rows[0].subject}/${rows[0].unit}/${rows[0].slug}  figure ${rows[0].figure} — ${rows[0].figureName}`);
    for (const [, prows] of groupBy(rows, (r) => `${r.item}\t${r.part}`)) {
      const r0 = prows[0];
      const words = [...new Set(prows.map((r) => `"${r.phrase}"`))].join(", ");
      const channels = [...new Set(prows.map((r) => r.channel))].join("/");
      console.log(`        ${r0.item} (${r0.part === "final" ? "final answer, problem mode" : `${r0.part}, faded`}) <${channels}> names ${words}`);
    }
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
  console.log(`${u.subject}/${u.unit}: ${u.bundles} bundle(s), ${u.figures} figure(s) checked, ${u.leaks} leak(s), ${u.weLeaks} worked-example step(s) printed, ${u.allowed} allowed, ${u.reviews} review line(s)`);
}
const weParts = new Set(weLeaks.map((r) => `${r.item}#${r.part}`)).size;
const weFigures = new Set(weLeaks.map((r) => `${r.subject}/${r.unit}/${r.slug}/${r.figure}`)).size;
const weItems = new Set(weLeaks.map((r) => r.item)).size;
const weLine = `worked examples: ${weParts} step(s) or final answer(s) in ${weItems} worked example(s) (${weFigures} figure(s)) printed by the example's own figure in a faded or the problem mode${weFatal ? "" : " (warnings; --we-fatal makes them leaks)"}`;
const partsLeaking = new Set(leaks.map((r) => `${r.item}#${r.part}`)).size;
const figuresLeaking = new Set(leaks.map((r) => `${r.subject}/${r.unit}/${r.slug}/${r.figure}`)).size;
console.log(
  leaks.length === 0
    ? `figure-leaks: 0 leaks in ${perUnit.reduce((n, u) => n + u.figures, 0)} figure(s) across ${perUnit.length} unit(s); ${allowed.length} allowed, ${reviews.length} review line(s)`
    : `figure-leaks: ${leaks.length} leak(s) in ${partsLeaking} part(s) across ${figuresLeaking} figure(s) — each one prints an answer its own part asks for`,
);
console.log(weLine);

// An exemption whose part, item or figure has gone is dead config: say so (only on a full run, where every
// target has been visited).
const stale = units.length || subjects.length ? [] : staleAllowances(targets);
if (stale.length) {
  console.log(`\nALLOWED entries whose target no longer exists (remove them from ALLOWED in scripts/qa/figure-leaks.mjs):`);
  for (const k of stale) console.log(`  ${k}`);
}

if (jsonOut) {
  fs.writeFileSync(jsonOut, `${JSON.stringify({ perUnit, leaks, weLeaks, allowed, reviews, staleAllowances: stale }, null, 2)}\n`);
  console.log(`findings → ${jsonOut}`);
}

process.exit(leaks.length || (weFatal && weLeaks.length) ? 1 : 0);
}

if (isMain) main();
