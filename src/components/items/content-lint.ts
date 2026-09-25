/**
 * Structural lints for a published bundle, beyond the schema: the defects a human read keeps finding that a
 * generator can produce without noticing. Each finding is a plain sentence naming the item. Pure.
 *
 * - Duplicate option texts in one multiple-choice item (two distractors that read "−3", or a distractor equal
 *   to the correct option) make the item unanswerable or unfair.
 * - A numeric, algebraic or matrix common-error pattern equal to the part's correct answer can never fire.
 * - A matrix answer whose `entries` do not fill its stated rows × cols: the field would draw a grid the
 *   marker cannot address, so every answer would come back the wrong shape.
 * - A numeric spec value carrying a floating-point artefact (0.9299999999999999 for 0.93) is a computation
 *   pasted where a written number was meant.
 * - A graph target (a point, a point the line must pass through, a bar height) that the plotting grid's finest
 *   small square cannot reach within the part's tolerance: no tap can ever place it, so the learner would see
 *   her own value marked short of the table's.
 */
import { normaliseText } from "./text-marking";
import { plotLattice, type HistogramExpect, type PointsExpect } from "@/lib/marking/plot";
import { formatMatrixResponse, sameMatrixEntries } from "@/lib/marking/matrix";
import { instructsAccuracy } from "./mark";
import { planFade } from "./fade";

const onlyObjects = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object") : [];

/** Rows of entry strings, from raw JSON; null when it is not that shape (the schema says so first). */
function entryGrid(v: unknown): string[][] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const rows: string[][] = [];
  for (const row of v) {
    if (!Array.isArray(row) || row.some((e) => typeof e !== "string")) return null;
    rows.push(row as string[]);
  }
  return rows;
}

function floatArtefact(v: number): number | null {
  if (!Number.isFinite(v)) return null;
  const r = Math.round(v * 1e6) / 1e6;
  return v !== r && Math.abs(v - r) < 1e-9 && String(v).length > 10 ? r : null;
}

/**
 * Would the spec mark a plain decimal carrying `value` as correct? That is when a numeric common error with
 * that value can never fire: the spec's own tolerance accepts it, and the spec accepts a decimal form. A spec
 * that demands a surd, π, or a simplified fraction marks the decimal wrong on form first, so a common error
 * with the right value ("the size is right but the form is not") fires as intended.
 */
function specAcceptsDecimal(answer: Record<string, unknown>, value: number, stem: string | undefined): boolean {
  if (typeof answer.value !== "number") return false;
  const forms = Array.isArray(answer.acceptForms) ? (answer.acceptForms as unknown[]) : [];
  if (forms.length > 0 && !forms.includes("decimal")) return false;
  if (answer.mustBeSimplified === true) return false;
  const t = answer.tolerance && typeof answer.tolerance === "object" ? (answer.tolerance as Record<string, unknown>) : {};
  const target = answer.value;
  const diff = Math.abs(value - target);
  // When the stem instructs the accuracy, the marker rejects a value written to more places than asked, so a
  // common error carrying the unrounded value ("accuracy not as demanded") does fire.
  if (instructsAccuracy(stem)) {
    const written = (String(value).split(".")[1] ?? "").length;
    if (t.type === "dp" && typeof t.places === "number" && written > t.places) return false;
    if (t.type === "sf" && typeof t.figures === "number" && String(value).replace(/^-?0*\.?0*/, "").replace(".", "").length > t.figures) return false;
  }
  switch (t.type) {
    case "absolute":
      return typeof t.value === "number" && diff <= t.value + 1e-9;
    case "relative":
      return typeof t.value === "number" && diff <= t.value * Math.abs(target) + 1e-9;
    case "dp":
      return typeof t.places === "number" && Math.round(value * 10 ** t.places) === Math.round(target * 10 ** t.places);
    case "sf":
      return typeof t.figures === "number" && Number(value.toPrecision(t.figures)) === Number(target.toPrecision(t.figures));
    case "range":
      return typeof t.min === "number" && typeof t.max === "number" && value >= t.min - 1e-9 && value <= t.max + 1e-9;
    default:
      return diff <= 1e-9;
  }
}

const isPoint = (v: unknown): v is [number, number] => Array.isArray(v) && v.length === 2 && v.every((c) => typeof c === "number" && Number.isFinite(c));
const isPointList = (v: unknown): v is [number, number][] => Array.isArray(v) && v.length > 0 && v.every(isPoint);

/**
 * A `graph` expectation the plotting grid draws (points, a curve, a histogram) with the shape `plotLattice`
 * reads; the lint walks raw JSON, so anything else is left to the schema.
 */
function plottedExpect(v: unknown): PointsExpect | HistogramExpect | null {
  if (!v || typeof v !== "object") return null;
  const e = v as Record<string, unknown>;
  if (e.plot === "histogram") {
    const bars = Array.isArray(e.bars) ? e.bars : null;
    const ok =
      !!bars &&
      bars.length > 0 &&
      bars.every((b) => !!b && typeof b === "object" && ["from", "to", "frequencyDensity"].every((k) => typeof (b as Record<string, unknown>)[k] === "number")) &&
      typeof e.scaleTolerance === "number";
    return ok ? (e as unknown as HistogramExpect) : null;
  }
  if (e.plot === "points-line") return isPointList(e.points) && (e.lineThrough === undefined || isPointList(e.lineThrough)) ? (e as unknown as PointsExpect) : null;
  if (e.plot === "curve") return isPointList(e.samples) ? (e as unknown as PointsExpect) : null;
  return null;
}

const num = (v: number): string => String(Math.round(v * 1e6) / 1e6);

/** TeX delimiters, spacing and the minus sign's spelling do not make two option texts different; a decimal point does. */
const squash = (s: string): string => s.toLowerCase().replace(/\$/g, "").replace(/\s+/g, "").replace(/[−–]/g, "-");

/** Keys whose strings are not learner-facing prose: regexes, ids, markup, typed-answer spellings. */
const NOT_PROSE_KEYS = new Set([
  "regex", "pattern", "test", "svg", "id", "url", "href", "src", "kind", "status", "unit", "slug", "code", "misconception",
  "verification", "itemId", "topicId", "ref", "latex", "accepted", "any", "reject", "version", "generatedAt", "source",
  "solutionProgram",
]);
const TEX_TEXT = /\\(?:text|mathrm|textbf|mbox|operatorname)\{[^}]*\}/g;
const TEX_CMD = /\\[a-zA-Z]+/g;
/** Words that only appear inside a maths segment when a "$" is in the wrong place ("…factor -2$ with centre (0, 1)$"). */
const PROSE_IN_MATHS = /\b(with|centre|center|and|the|then|onto|about|from|which|label|image|scale|factor|would|gives|when|because|answer|question)\b/i;

/**
 * A learner-facing string with an odd number of "$" (KaTeX then reads the rest of the paragraph as maths), or a
 * maths segment containing prose words (the dollars are paired but misplaced). Returns the defect sentences.
 */
/**
 * A generator that interpolated a missing value leaves the literal words behind ("\frac{undefined}{undefined}",
 * "= NaN"). "undefined" is also an ordinary maths word ("the values of x for which the expression is undefined"),
 * so it counts only next to a brace, a backslash, an equals sign or a digit; NaN and null count anywhere.
 */
const LEAKED_VALUE = /\bNaN\b|\bnull\b|\[object Object\]|[{}=\\\d]\s*undefined\b|\bundefined\s*[{}=\\\d]/;

function leakedValueDefect(text: string, key: string): string[] {
  const m = LEAKED_VALUE.exec(text);
  if (!m) return [];
  const word = /NaN/.test(m[0]) ? "NaN" : /null/.test(m[0]) ? "null" : /object/.test(m[0]) ? "[object Object]" : "undefined";
  const excerpt = `"${text.replace(/\s+/g, " ").slice(0, 90)}${text.length > 90 ? "…" : ""}"`;
  return [`"${word}" printed in ${key} (a generator slip: a value was never filled in): ${excerpt}`];
}

function dollarDefects(text: string, key: string): string[] {
  if (!text.includes("$")) return [];
  const parts = text.split("$");
  const excerpt = `"${text.replace(/\s+/g, " ").slice(0, 90)}${text.length > 90 ? "…" : ""}"`;
  if (parts.length % 2 === 0) return [`unpaired "$" in ${key}: ${excerpt}`];
  const out: string[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const seg = parts[i]!.replace(TEX_TEXT, "").replace(TEX_CMD, " ");
    if (PROSE_IN_MATHS.test(seg)) out.push(`prose inside a maths segment in ${key} ("$${parts[i]!.slice(0, 60)}$"): ${excerpt}`);
  }
  return out;
}

/** Walks any bundle-shaped JSON and returns the defects found, as sentences prefixed by `label`. */
/** The text of a figure's SVG: an inline "<svg" string as it is, a data URI decoded. */
export function svgText(src: string): string | null {
  if (src.startsWith("<svg")) return src;
  if (!src.startsWith("data:image/svg+xml")) return null;
  const comma = src.indexOf(",");
  if (comma < 0) return null;
  const body = src.slice(comma + 1);
  if (/;base64/.test(src.slice(0, comma))) {
    try {
      return typeof atob === "function" ? atob(body) : body;
    } catch {
      return body;
    }
  }
  try {
    return decodeURIComponent(body);
  } catch {
    return body;
  }
}

/**
 * Ways a generated SVG draws nothing where a drawing was meant (scripts/qa/svg-draws.mjs found them in shipped
 * figures): a <path> without d, path data written as a text node or as bare text inside <g>, or no shape at all.
 */
export function svgDrawDefects(svg: string): string[] {
  const out: string[] = [];
  for (const p of svg.match(/<path\b[^>]*>/g) ?? []) {
    if (!/\sd\s*=\s*["']/.test(p)) {
      out.push("a <path> has no d attribute, so it draws nothing");
      break;
    }
  }
  for (const t of svg.match(/<text\b[^>]*>([^<]*)<\/text>/g) ?? []) {
    const inner = t.replace(/<text\b[^>]*>/, "").replace(/<\/text>$/, "");
    if (/^\s*[Mm]\s*-?\d/.test(inner) && /[LlCcQqAaHhVv]\s*-?\d|\d+[ ,]-?\d+\s+[LlCcHhVv]/.test(inner)) {
      out.push("a <text> element holds path data, so the line is printed as letters instead of drawn");
      break;
    }
  }
  const stripped = svg.replace(/<text\b[^>]*>[^<]*<\/text>/g, "");
  if (/>\s*M\s*-?\d[\d.\s,-]*[LlCcHhVvAaQq]/.test(stripped)) {
    out.push("path data sits as bare text inside an element (the d= attribute is missing), so that line is not drawn");
  }
  const shapes = (svg.match(/<(path|line|polyline|polygon|rect|circle|ellipse)\b/g) ?? []).length;
  if (shapes === 0) out.push("no drawn shape at all (no path, line, polyline, polygon, rect, circle or ellipse)");
  return out;
}

/** The defects of one figure's SVG text: a generator slip (NaN, undefined) and anything that draws nothing. */
function svgDefects(text: string): string[] {
  const out: string[] = [];
  // No boundaries: the slip usually lands mid-path ("64HNaNMNaN 64").
  const m = text.match(/NaN|undefined/);
  if (m) out.push(`SVG figure contains "${m[0]}" (a generator slip: the drawing is broken where it appears)`);
  for (const d of svgDrawDefects(text)) out.push(`SVG figure: ${d}`);
  return out;
}

/**
 * Note blocks (note.blocks.json) carry inline SVG on figure blocks; the same drawing checks apply to them.
 * Returns one line per defect, labelled by block index and the figure's alt text.
 */
export function lintNoteBlocks(blocks: unknown, label: string): string[] {
  const out: string[] = [];
  if (!Array.isArray(blocks)) return out;
  blocks.forEach((b, i) => {
    if (!b || typeof b !== "object") return;
    const rec = b as Record<string, unknown>;
    if (typeof rec.svg !== "string") return;
    const text = svgText(rec.svg);
    if (text === null) return;
    const alt = typeof rec.alt === "string" ? ` "${rec.alt.slice(0, 40)}"` : "";
    for (const d of svgDefects(text)) out.push(`${label} note block ${i}${alt}: ${d}`);
  });
  return out;
}

/**
 * A regex written through a shell heredoc can lose its backslashes ("[\\s\\S]" becomes "[sS]", "[^;\\n]" becomes
 * "[^;n]", "\\b(" becomes "b("): it still compiles, and fires on nothing or on the wrong text. These are the
 * signatures that survive; a genuine pattern never needs them.
 */
const MANGLED_REGEX = [
  { re: /\[\^?[^\]]*sS[^\]]*\]/, why: '"[sS]" is a halved "[\\s\\S]"' },
  { re: /\[\^?[^\]]*dD[^\]]*\]/, why: '"[dD]" is a halved "[\\d\\D]"' },
  { re: /\[\^[^\]]*[;.,]n\]/, why: '"[^;n]" is a halved "[^;\\n]"' },
  { re: /\(\?!\[sS\]/, why: '"(?![sS]" is a halved "(?![\\s\\S]"' },
  { re: /(^|[^\\a-z])b\(/, why: '"b(" is a halved "\\b("' },
];

export function mangledRegexDefect(pattern: string): string | null {
  for (const m of MANGLED_REGEX) if (m.re.test(pattern)) return m.why;
  return null;
}

/**
 * A TeX command that lost its backslash ("$mathbf{i}$", "$frac{1}{2}$", "$x^circ$") renders as the bare word
 * inside the maths, which is how thirteen "mathbfi" stems shipped in FM2 B. Only commands that take a brace
 * or follow a caret are checked, where the missing backslash is unambiguous.
 */
const LOST_BACKSLASH = /(?<![\\a-zA-Z])(mathbf|mathrm|boldsymbol|frac|tfrac|dfrac|sqrt|vec|hat|underline|overline|text|textbf|left|right|begin|end|ce)\{|\^\{?(circ)\b/;

export function lostBackslashDefect(text: string): string | null {
  const segments = text.match(/\$[^$]+\$/g) ?? [];
  for (const seg of segments) {
    // Two backslash characters before a command ("\\\\ce{…}", four in the JSON) read as a line break plus the bare word.
    const doubled = /\\\\(?=[a-zA-Z])/.exec(seg);
    if (doubled) return `"${seg.length > 60 ? seg.slice(0, 60) + "…" : seg}" has a doubled backslash before a command`;
    const m = LOST_BACKSLASH.exec(seg);
    if (m) return `"${seg.length > 60 ? seg.slice(0, 60) + "…" : seg}" has "${m[1] ?? m[2]}" without its backslash`;
  }
  return null;
}

export function lintContent(bundle: unknown, label: string): string[] {
  const out: string[] = [];
  const walk = (o: unknown, qid: string | undefined, pid: string | undefined): void => {
    if (Array.isArray(o)) {
      for (const x of o) walk(x, qid, pid);
      return;
    }
    if (!o || typeof o !== "object") return;
    const rec = o as Record<string, unknown>;
    if (typeof rec.id === "string") {
      if (rec.id.includes(".")) {
        qid = rec.id;
        pid = undefined;
      } else pid = rec.id;
    }
    const where = `${label} ${qid ?? "?"}${pid ? `(${pid})` : ""}`;

    // Option texts must be distinct (question mcq specs and diagnostic items both carry `options`).
    const options = onlyObjects(rec.options);
    if (options.length > 1) {
      const seen = new Map<string, number>();
      options.forEach((opt, i) => {
        const t = typeof opt.text === "string" ? squash(opt.text) : "";
        if (!t) return;
        const first = seen.get(t);
        if (first !== undefined) out.push(`${where}: options ${first + 1} and ${i + 1} both read "${opt.text}"`);
        else seen.set(t, i);
      });
    }

    // A text common error's regex must not carry a heredoc-halved signature.
    for (const [i, e] of onlyObjects(rec.commonErrors).entries()) {
      const p = e.pattern && typeof e.pattern === "object" ? (e.pattern as Record<string, unknown>) : null;
      if (p && p.kind === "text" && typeof p.regex === "string") {
        const why = mangledRegexDefect(p.regex);
        if (why) out.push(`${where}: commonError ${i + 1} regex ${JSON.stringify(p.regex)} looks mangled: ${why}`);
      }
    }
    // A TeX command without its backslash inside a maths segment.
    for (const [k, v] of Object.entries(rec)) {
      if (typeof v !== "string" || NOT_PROSE_KEYS.has(k) || !v.includes("$")) continue;
      const why = lostBackslashDefect(v);
      if (why) out.push(`${where}: ${k} ${why}`);
    }
    // A common error must not be the right answer.
    const answer = rec.answer && typeof rec.answer === "object" ? (rec.answer as Record<string, unknown>) : null;
    const errors = onlyObjects(rec.commonErrors);
    if (answer && errors.length > 0) {
      errors.forEach((e, i) => {
        const p = e.pattern && typeof e.pattern === "object" ? (e.pattern as Record<string, unknown>) : null;
        if (!p) return;
        const stem = typeof rec.stem === "string" ? rec.stem : undefined;
        // With unitRequired the right value typed without its unit is a miss, so an error on that value fires.
        const unitOmitted = answer.unitRequired === true && typeof p.unit !== "string";
        if (answer.kind === "numeric" && p.kind === "numeric" && typeof p.value === "number" && !unitOmitted && specAcceptsDecimal(answer, p.value, stem)) {
          out.push(`${where}: commonError ${i + 1} (${String(e.misconception)}) has value ${p.value}, which the spec marks correct, so it can never fire`);
        }
        if (answer.kind === "algebraic" && p.kind === "algebraic" && typeof p.latex === "string" && typeof answer.latex === "string") {
          if (squash(p.latex) === squash(answer.latex)) {
            out.push(`${where}: commonError ${i + 1} (${String(e.misconception)}) repeats the correct answer "${answer.latex}", so it can never fire`);
          }
        }
        if (answer.kind === "matrix" && p.kind === "matrix") {
          const wrong = entryGrid(p.entries);
          const right = entryGrid(answer.entries);
          if (wrong && right && sameMatrixEntries(wrong, right)) {
            out.push(
              `${where}: commonError ${i + 1} (${String(e.misconception)}) repeats the correct matrix (${formatMatrixResponse(right)}), so it can never fire`,
            );
          }
        }
      });
    }

    // A matrix spec whose entries do not fill its stated size: the field would draw a grid the marker
    // cannot address, and every answer would be the wrong shape.
    if (rec.kind === "matrix" && typeof rec.rows === "number" && typeof rec.cols === "number") {
      const grid = entryGrid(rec.entries);
      if (!grid) out.push(`${where}: matrix entries must be an array of ${rec.rows} rows of ${rec.cols} strings`);
      else if (grid.length !== rec.rows || grid.some((row) => row.length !== rec.cols)) {
        const given = grid.map((row) => row.length).join("+");
        out.push(`${where}: matrix answer is ${rec.rows} by ${rec.cols} (${rec.rows * rec.cols} entries) but ${grid.length} rows of ${given} entries are given`);
      }
    }

    // Numeric values written as computations.
    if (rec.kind === "numeric" && typeof rec.value === "number") {
      const r = floatArtefact(rec.value);
      if (r !== null) out.push(`${where}: numeric value ${rec.value} carries a floating-point artefact; write ${r}`);
    }

    // An authored SVG whose generator emitted NaN or undefined draws a broken figure that the schema cannot see.
    if (rec.kind === "svg" && typeof rec.src === "string") {
      const text = svgText(rec.src);
      if (text !== null) for (const d of svgDefects(text)) out.push(`${where}: ${d}`);
    }

    // A plotted target no tap can reach: the grid's finest small square is still further from it than the tolerance.
    if (rec.kind === "graph") {
      const plotted = plottedExpect(rec.expect);
      if (plotted) {
        for (const u of plotLattice(plotted).unreachable) {
          out.push(
            `${where}: graph target ${u.axis} = ${num(u.value)} cannot be tapped: the nearest small square on the finest lattice (${num(u.minor)} apart) is ${num(u.nearest)}, ${num(Math.abs(u.value - u.nearest))} away against a tolerance of ${num(u.tolerance)}; change the value, the tolerance or the scale`,
          );
        }
      }
    }

    // Unpaired or misplaced "$" in any learner-facing string (hints and other string arrays included).
    for (const [k, v] of Object.entries(rec)) {
      if (NOT_PROSE_KEYS.has(k)) continue;
      const strings = typeof v === "string" ? [v] : Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
      for (const s of strings) for (const d of [...leakedValueDefect(s, k), ...dollarDefects(s, k)]) out.push(`${where}: ${d}`);
    }

    for (const v of Object.values(rec)) walk(v, qid, pid);
  };
  walk(bundle, undefined, undefined);
  return out;
}

// ---------------------------------------------------------------------------------------------
// A question figure that prints its own answer
// ---------------------------------------------------------------------------------------------

function onlyStrings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Words too generic to count as a leak on their own (axis labels, diagram furniture). */
const LEAK_STOP = new Set(["cell", "cells", "water", "time", "left", "right", "top", "bottom", "line", "point", "points", "graph", "table", "part", "parts", "side", "sides", "value", "values", "total", "start", "end", "high", "low", "large", "small", "more", "less", "increase", "decrease", "rate", "mass", "volume", "length", "area", "height", "width", "energy", "force", "light", "heat", "temperature", "distance", "speed", "number", "amount"]);

/**
 * The visible and accessible text of a figure, one entry per text node, <title>, <desc>, aria-label, alt and
 * caption, as a reader meets them. Never joined into one string: two labels drawn side by side are two labels.
 */
function figureTextParts(fig: Record<string, unknown>): string[] {
  const parts: string[] = [];
  if (typeof fig.alt === "string") parts.push(fig.alt);
  if (typeof fig.caption === "string") parts.push(fig.caption);
  const src = typeof fig.src === "string" ? svgText(fig.src) : typeof fig.svg === "string" ? svgText(fig.svg) : null;
  if (src) {
    for (const m of src.matchAll(/<(?:text|tspan|title|desc)\b[^>]*>([^<]*)</g)) parts.push(m[1]);
    for (const m of src.matchAll(/aria-label=(["'])(.*?)\1/g)) parts.push(m[2]);
  }
  return parts;
}

/**
 * Does one piece of the figure's text carry the phrase? Pieces are read one at a time, so two axis ticks side by
 * side ("-2" and "2") never read as the point (-2, 2).
 */
function printedIn(fig: Record<string, unknown>, phrase: string): boolean {
  return figureTextParts(fig).some((t) => ` ${normaliseText(t)} `.includes(` ${phrase} `));
}

/** The fraction spellings of a non-integer value with a small denominator ("5/9", "10/18"), at most six. */
function fractionSpellings(v: number): string[] {
  const out: string[] = [];
  if (!Number.isFinite(v) || Number.isInteger(v)) return out;
  for (let d = 2; d <= 1000 && out.length < 6; d += 1) {
    const n = Math.round(v * d);
    if (n !== 0 && Math.abs(n / d - v) < 1e-9) out.push(`${n}/${d}`);
  }
  return out;
}

/** The phrases a learner is asked to produce for a part: key words, short accepted strings, the right option. */
function answerPhrases(part: Record<string, unknown>): string[] {
  const out: string[] = [];
  const a = part.answer && typeof part.answer === "object" ? (part.answer as Record<string, unknown>) : null;
  if (!a) return out;
  if (a.kind === "text") {
    for (const g of onlyObjects(a.keyWords)) for (const k of onlyStrings(g.any)) out.push(k);
    for (const acc of onlyStrings(a.accepted)) if (acc.split(/\s+/).length <= 4) out.push(acc);
  }
  if (a.kind === "mcq") {
    for (const o of onlyObjects(a.options)) if (o.correct === true && typeof o.text === "string" && o.text.split(/\s+/).length <= 6) out.push(o.text);
  }
  if (a.kind === "label") for (const t of onlyObjects(a.targets)) if (typeof t.answer === "string") out.push(t.answer);
  // A numeric answer counts only with its unit beside it ("54 cm³"): bare numbers sit on every axis. A fraction is
  // the exception: "5/9" on the branch the part asks for is the answer, never a scale (FM3 pre-read fm3-b-1.md, E3).
  if (a.kind === "numeric" && typeof a.value === "number") {
    if (typeof a.unit === "string" && a.unit.trim()) out.push(`${a.value} ${a.unit}`);
    out.push(...fractionSpellings(a.value));
  }
  // A letter label ("tube c", "point a") is how a figure is meant to be read, not a leak.
  return out.map(normaliseText).filter(leakWorthy);
}

/** A phrase is worth looking for on a figure: a number only with its unit (or as a fraction), a word only of four letters or more that is not diagram furniture. */
function leakWorthy(p: string): boolean {
  return /^\d/.test(p) ? /^\d+\/\d+$/.test(p) || /\d+(?:\.\d+)? [a-z°%µ]/.test(p) : p.replace(/[^a-z]/g, "").length >= 4 && !LEAK_STOP.has(p) && !/(^|\s)[a-z]$/.test(p);
}

/** Working as plain words: maths unwrapped, bold dropped, the common TeX spelled out. */
function plainWorking(s: string): string {
  return s
    .replace(/\$\$?([^$]*)\$\$?/g, "$1")
    .replace(/\\(?:text|mathrm|textrm|mathbf)\s*\{([^}]*)\}/g, "$1")
    .replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1/$2")
    .replace(/\^\s*\{?\\circ\}?/g, "°")
    .replace(/\\times|\\cdot/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\[,;:! ]/g, " ")
    .replace(/\\left|\\right/g, "")
    .replace(/[{}]/g, "")
    .replace(/\*\*/g, "");
}

/** A number and the unit of measure printed after it ("150 s", "40 °C", "5 m/s²"); a coefficient ("3x") is not one. */
const VALUE_AND_UNIT = /(?<![\w.^])(-?\d+(?:\.\d+)?)(?![\w.^])\s?(°\s?C|°|%|m\/s²|m\/s\^2|m\/s|km\/h|cm³|cm²|dm³|m³|m²|mm|cm|km|kg|mg|kJ|kW|kPa|Pa|Hz|mol|ms|min|hours?|minutes?|seconds?|metres?|degrees?|Ω|[smgJWNVAKp](?![a-z]))/g;

/**
 * What she writes for one step of a worked example in a faded version: the spellings its input spec accepts, or,
 * with no spec (her line is compared with the authored working), the working's values with their units and any
 * statement of four words or fewer ("Purple.").
 */
/**
 * The figure a worked-example mode shows, as WorkedExampleAsQuestion.tsx figureForMode chooses it (mirrored here so
 * the build's lint does not import a client component; content-lint.test.ts holds the two together): the annotated
 * `figure` for the full example, `figurePlain` when present, else `figure`, for the faded and problem modes.
 */
export function weFigureFor(we: Record<string, unknown>, mode: "full" | "faded1" | "faded2" | "twin" | "problem"): unknown {
  return mode === "full" ? we.figure : (we.figurePlain ?? we.figure);
}

type Phrase = { raw: string; norm: string };
const phrase = (raw: string): Phrase => ({ raw: raw.trim(), norm: normaliseText(raw) });

function stepAnswerPhrases(step: Record<string, unknown>): Phrase[] {
  if (step.input && typeof step.input === "object") return answerPhrases({ answer: step.input }).map((p) => ({ raw: p, norm: p }));
  const out: Phrase[] = [];
  for (const raw of String(step.working ?? "").split("\n")) {
    const line = plainWorking(raw).trim();
    if (!line || line.startsWith("|")) continue;
    for (const m of line.matchAll(VALUE_AND_UNIT)) out.push(phrase(`${m[1]} ${m[2]}`));
    if (!/[=≈]/.test(line) && line.split(/\s+/).length <= 4) out.push(phrase(line.replace(/[.;:,!?]+$/, "")));
  }
  return out.filter((p) => leakWorthy(p.norm));
}

/** What the problem version asks for: the final answer's values with their units, and its coordinate pairs. */
function finalAnswerPhrases(finalAnswer: string): Phrase[] {
  const text = plainWorking(finalAnswer);
  const values = [...text.matchAll(VALUE_AND_UNIT)].map((m) => phrase(`${m[1]} ${m[2]}`)).filter((p) => leakWorthy(p.norm));
  const points = [...text.matchAll(/\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)/g)].map((m) => phrase(m[0]));
  return [...values, ...points];
}

/**
 * Warnings (never fatal on their own): a question's figure prints a phrase one of its parts asks her to give,
 * in a text node, a <title>, a <desc>, an aria-label, the alt or the caption. The class shipped in B1, B2 A,
 * B2 B and C2 A before a lint existed; authors keep an annotated copy for the note and an unannotated copy,
 * lettered, for the question.
 */
export function figureLeakWarnings(bundle: unknown, label: string): string[] {
  const out: string[] = [];
  const b = bundle && typeof bundle === "object" ? (bundle as Record<string, unknown>) : null;
  if (!b) return out;
  // Worked examples (WorkedExampleAsQuestion.tsx). The twin mode shows only the twin's figure, beside the twin's
  // answer box. The example's own figure is shown in the full, faded and problem modes, so it must not print what
  // those modes ask her to write: a step a faded version leaves to her, or the final answer the problem version
  // asks for. Never the twin's answer, which is never beside that figure. scripts/qa/figure-leaks.mjs applies the
  // same rule with its finer tiers.
  for (const we of onlyObjects(b.workedExamples)) {
    const id = String(we.id);
    // the figure the faded and problem modes show (figurePlain when present); the full example's hides nothing
    const shown = weFigureFor(we, "faded1");
    const fig = shown && typeof shown === "object" ? (shown as Record<string, unknown>) : null;
    if (fig) {
      const stem = typeof we.stem === "string" ? we.stem : "";
      const steps = onlyObjects(we.steps).filter((s) => typeof s.n === "number") as Array<Record<string, unknown> & { n: number }>;
      const faded = onlyObjects(we.faded).map((f) => ({ showSteps: Number(f.showSteps), studentSupplies: Array.isArray(f.studentSupplies) ? (f.studentSupplies as number[]) : [] }));
      const reported = new Set<number>();
      for (const mode of ["faded1", "faded2"] as const) {
        const plan = planFade({ steps: steps as never, faded }, mode);
        const given = ` ${normaliseText([stem, ...steps.filter((s) => s.n <= plan.showSteps).map((s) => String(s.working ?? ""))].join(" \n "))} `;
        for (const n of plan.supplied) {
          const step = steps.find((s) => s.n === n);
          if (!step || reported.has(n)) continue;
          const hit = stepAnswerPhrases(step).find((p) => printedIn(fig, p.norm) && !given.includes(` ${p.norm} `));
          if (hit) {
            reported.add(n);
            out.push(`${label} ${id}: the worked example's figure prints "${hit.raw}", which step ${n} asks her to write in a faded version`);
          }
        }
      }
      const givenStem = ` ${normaliseText(stem)} `;
      const hit = finalAnswerPhrases(typeof we.finalAnswer === "string" ? we.finalAnswer : "").find((p) => printedIn(fig, p.norm) && !givenStem.includes(` ${p.norm} `));
      if (hit) out.push(`${label} ${id}: the worked example's figure prints "${hit.raw}", which the problem version asks for as the final answer`);
    }
    const twin = we.twin && typeof we.twin === "object" ? (we.twin as Record<string, unknown>) : null;
    const twinFig = twin?.figure && typeof twin.figure === "object" ? (twin.figure as Record<string, unknown>) : null;
    if (twin && twinFig) {
      const stem = ` ${normaliseText(typeof twin.stem === "string" ? twin.stem : "")} `;
      const hit = answerPhrases(twin).find((p) => p && printedIn(twinFig, p) && !stem.includes(` ${p} `));
      if (hit) out.push(`${label} ${id}: the twin's figure prints "${hit}", which the twin asks her to give`);
    }
  }
  // Two labels drawn on top of each other are unreadable: same anchor x and baselines within 12 px.
  const overlapIn = (fig: Record<string, unknown>): string | null => {
    const src = typeof fig.src === "string" ? svgText(fig.src) : typeof fig.svg === "string" ? svgText(fig.svg) : null;
    if (!src) return null;
    const pts: Array<[number, number, string]> = [];
    for (const m of src.matchAll(/<text\b[^>]*\bx=['"]([-\d.]+)['"][^>]*\by=['"]([-\d.]+)['"][^>]*>([^<]{2,})</g)) pts.push([Number(m[1]), Number(m[2]), m[3]]);
    for (let i = 0; i < pts.length; i += 1) for (let j = i + 1; j < pts.length; j += 1) {
      // Anchors within 8 px count too: two labels 4 px apart still sit on each other.
      if (Math.abs(pts[i][0] - pts[j][0]) < 8 && Math.abs(pts[i][1] - pts[j][1]) < 12) return `"${pts[i][2].slice(0, 30)}" and "${pts[j][2].slice(0, 30)}" overlap`;
    }
    return null;
  };
  for (const q of onlyObjects(b.questions)) {
    onlyObjects(q.figures).forEach((fig, i) => {
      const o = overlapIn(fig);
      if (o) out.push(`${label} ${String(q.id)}: figure ${i + 1} labels ${o}`);
    });
  }
  for (const q of onlyObjects(b.questions)) {
    const figs = [...onlyObjects(q.figures), ...onlyObjects(q.parts).flatMap((p) => onlyObjects(p.figures))];
    if (figs.length === 0) continue;
    for (const p of onlyObjects(q.parts)) {
      for (const phrase of answerPhrases(p)) {
        // one text node, title or alt at a time: two labels side by side ("wheat", "hawthorn") are not one phrase
        const hit = figs.findIndex((f) => printedIn(f, phrase));
        if (hit >= 0) {
          out.push(`${label} ${String(q.id)}(${String(p.id)}): figure ${hit + 1} prints "${phrase}", which this part asks her to give`);
          break;
        }
      }
    }
  }
  return out;
}
